/* ==================================================================
   MESSAGES — in-game announcements. A small card slides in from the
   left hand side, rests, then slides back out. The card prefers the
   keeper's server notices (site_notices via Cloud.fetchSiteNotices,
   read state owned by site-notice.js); when the cloud is unreachable
   it falls back to the local LIST below. A message stays unseen —
   and keeps returning with each visit to the hall — until the player
   dismisses it. Pure helpers mirrored by tests.
   ================================================================== */

var Messages = (function () {

  /* Local fallback announcements (offline / unconfigured cloud).
     New messages go on top. ids never repeat. */
  var LIST = [
    {
      id: "2026-09-29-daily-update",
      title: "The Daily Trial — renewed",
      date: "2026-09-29",
      body: "The Daily now leads the hall: one recorded run a day, your score stands, and practice never touches it. Consecutive days build a streak — 3, 7, 14, 21 and beyond light a confetti celebration. The board counts ties fairly and every score is measured by the same rule. Find the Daily Board beside the Daily card."
    }
  ];

  function unseenFor(list, seenIds) {
    var seen = {};
    (seenIds || []).forEach(function (id) { seen[id] = 1; });
    return (list || []).filter(function (m) { return !seen[m.id]; });
  }

  /* Newest server notice the player has neither read nor hidden. */
  function pickUnread(rows, stateFn) {
    rows = rows || [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (!r || !r.id) continue;
      var state = stateFn ? stateFn(r.id) : "unread";
      if (state !== "read" && state !== "hidden") return r;
    }
    return null;
  }

  function nextLocalMessage() {
    if (typeof SAVE === "undefined") return null;
    if (!SAVE.messagesSeen) SAVE.messagesSeen = [];
    var unseen = unseenFor(LIST, SAVE.messagesSeen);
    return unseen.length ? unseen[0] : null;
  }

  function markLocalSeen(id) {
    if (typeof SAVE === "undefined") return;
    if (!SAVE.messagesSeen) SAVE.messagesSeen = [];
    if (SAVE.messagesSeen.indexOf(id) < 0) SAVE.messagesSeen.push(id);
    if (typeof persist === "function") persist();
  }

  var sessionShown = false;

  /* The card is a SIGNAL, not the letter: it names the message and hands
     the player to the message box. Only the offline fallback (which has
     no message box to open) shows its full body. */
  function cardHtml(m, full) {
    var inner = full
      ? '<p class="msg-body">' + m.body + '</p>' +
        '<button type="button" class="msg-ack">I have read this</button>'
      : '<p class="msg-teaser">A new message waits in the message box.</p>' +
        '<button type="button" class="msg-ack msg-open">Open the message box</button>';
    return '<div class="msg-card" role="status" aria-live="polite">' +
      '<div class="msg-head"><span class="lbd-orn" aria-hidden="true">✦</span> Word from the hall' +
      '<button type="button" class="msg-close" aria-label="Dismiss">✕</button></div>' +
      '<b class="msg-title">' + m.title + '</b>' +
      inner +
      '</div>';
  }

  function present(host, m, opts) {
    opts = opts || {};
    var card = host.querySelector(".msg-card");
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      card.classList.add("on");
    }); });
    function dismiss(remember) {
      if (remember && opts.onAck) opts.onAck();
      card.classList.remove("on");
      setTimeout(function () { host.remove(); }, 480);
    }
    var closeBtn = host.querySelector(".msg-close");
    var ackBtn = host.querySelector(".msg-ack");
    if (closeBtn) closeBtn.addEventListener("click", function () { dismiss(true); });
    if (ackBtn) ackBtn.addEventListener("click", function () {
      if (opts.onOpen) {
        dismiss(false);
        opts.onOpen();
        return;
      }
      dismiss(true);
    });
    setTimeout(function () {
      /* Slide back out on its own; a throttled background tab may never
         have finished the slide-in, so don't depend on the .on class. */
      if (host.isConnected) dismiss(false);
    }, 11000);
  }

  function showLocal(force) {
    var m = nextLocalMessage();
    if (!m) return false;
    var host = document.createElement("div");
    host.id = "msg-host";
    host.innerHTML = cardHtml(m, true);
    document.body.appendChild(host);
    present(host, m, { onAck: function () { markLocalSeen(m.id); } });
    return true;
  }

  /* Slide in, rest, slide out. Server notices win over the local list.
     Returns true when a card was shown. */
  function show(force) {
    if (typeof document === "undefined") return;
    if (!force && sessionShown) return false; /* once per visit to the page */
    if (typeof Cloud !== "undefined" && Cloud.configured && Cloud.configured() &&
        typeof Cloud.fetchSiteNotices === "function" &&
        typeof getNoticeState === "function") {
      return Cloud.fetchSiteNotices(5).then(function (rows) {
        if (!rows) return showLocal(force);
        var m = pickUnread(rows, getNoticeState);
        if (!m) return showLocal(force);
        sessionShown = true;
        var host = document.createElement("div");
        host.id = "msg-host";
        host.innerHTML = cardHtml(m, false);
        document.body.appendChild(host);
        present(host, m, {
          onAck: function () {
            if (typeof markNoticeRead === "function") markNoticeRead(m.id);
          },
          onOpen: function () {
            if (typeof go === "function") go("messages");
          }
        });
        return true;
      }).catch(function () { return showLocal(force); });
    }
    sessionShown = true;
    return showLocal(force);
  }

  /* Test hook: forget that the page already showed its card. */
  function resetSession() { sessionShown = false; }

  return {
    LIST: LIST,
    unseenFor: unseenFor,
    pickUnread: pickUnread,
    nextMessage: nextLocalMessage,
    markSeen: markLocalSeen,
    show: show,
    resetSession: resetSession
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Messages;
