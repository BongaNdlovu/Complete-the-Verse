/* ==================================================================
   MESSAGES — in-game announcements. A small card slides in from the
   left hand side, rests, then slides back out. A message stays unseen
   (and keeps returning with each visit to the hall) until the player
   dismisses it. Pure helpers mirrored by tests.
   ================================================================== */

var Messages = (function () {

  /* New messages go on top. ids never repeat. */
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

  function nextMessage() {
    if (typeof SAVE === "undefined") return null;
    if (!SAVE.messagesSeen) SAVE.messagesSeen = [];
    var unseen = unseenFor(LIST, SAVE.messagesSeen);
    return unseen.length ? unseen[0] : null;
  }

  function markSeen(id) {
    if (typeof SAVE === "undefined") return;
    if (!SAVE.messagesSeen) SAVE.messagesSeen = [];
    if (SAVE.messagesSeen.indexOf(id) < 0) SAVE.messagesSeen.push(id);
    if (typeof persist === "function") persist();
  }

  var sessionShown = false;

  function cardHtml(m) {
    return '<div class="msg-card" role="status" aria-live="polite">' +
      '<div class="msg-head"><span class="lbd-orn" aria-hidden="true">✦</span> Word from the hall' +
      '<button type="button" class="msg-close" aria-label="Dismiss">✕</button></div>' +
      '<b class="msg-title">' + m.title + '</b>' +
      '<p class="msg-body">' + m.body + '</p>' +
      '<button type="button" class="msg-ack">I have read this</button>' +
      '</div>';
  }

  /* Slide in, rest, slide out. Returns true when a card was shown. */
  function show(force) {
    if (typeof document === "undefined") return false;
    var m = nextMessage();
    if (!m) return false;
    if (!force && sessionShown) return false; /* once per visit to the page */
    sessionShown = true;
    var host = document.createElement("div");
    host.id = "msg-host";
    host.innerHTML = cardHtml(m);
    document.body.appendChild(host);
    var card = host.querySelector(".msg-card");
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      card.classList.add("on");
    }); });
    function dismiss(remember) {
      if (remember) markSeen(m.id);
      card.classList.remove("on");
      setTimeout(function () { host.remove(); }, 480);
    }
    var closeBtn = host.querySelector(".msg-close");
    var ackBtn = host.querySelector(".msg-ack");
    if (closeBtn) closeBtn.addEventListener("click", function () { dismiss(true); });
    if (ackBtn) ackBtn.addEventListener("click", function () { dismiss(true); });
    setTimeout(function () {
      /* Slide back out on its own; a throttled background tab may never
         have finished the slide-in, so don't depend on the .on class. */
      if (host.isConnected) dismiss(false);
    }, 11000);
    return true;
  }

  /* Test hook: forget that the page already showed its card. */
  function resetSession() { sessionShown = false; }

  return {
    LIST: LIST,
    unseenFor: unseenFor,
    nextMessage: nextMessage,
    markSeen: markSeen,
    show: show,
    resetSession: resetSession
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Messages;
