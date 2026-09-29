var NOTICE_BOX_CAP = 80;

function pruneNoticeBox(box) {
  if (!box || typeof box !== "object") return box;
  var keys = Object.keys(box);
  if (keys.length <= NOTICE_BOX_CAP) return box;
  var drop = keys.slice(0, keys.length - NOTICE_BOX_CAP);
  for (var i = 0; i < drop.length; i++) {
    delete box[drop[i]];
  }
  return box;
}

function migrateNoticeBox() {
  if (typeof SAVE === "undefined" || !SAVE || !SAVE.set) return;
  if (!SAVE.set.noticeBox || typeof SAVE.set.noticeBox !== "object") {
    SAVE.set.noticeBox = {};
  }
  if (SAVE.set.ackNoticeId && !SAVE.set.noticeBox[SAVE.set.ackNoticeId]) {
    SAVE.set.noticeBox[SAVE.set.ackNoticeId] = "read";
  }
}

function getNoticeState(noticeOrId) {
  var id = (typeof noticeOrId === "string") ? noticeOrId : (noticeOrId && noticeOrId.id);
  if (!id) return "unread";
  if (typeof SAVE === "undefined" || !SAVE || !SAVE.set) return "unread";
  var box = SAVE.set.noticeBox;
  if (box && typeof box === "object" && (box[id] === "read" || box[id] === "hidden")) {
    return box[id];
  }
  if (SAVE.set.ackNoticeId === id) return "read";
  return "unread";
}

function pendingSiteNotice(notice) {
  var id = (typeof notice === "string") ? notice : (notice && notice.id);
  if (!id) return false;
  return getNoticeState(id) === "unread";
}

function setNoticeState(noticeOrId, state) {
  var id = (typeof noticeOrId === "string") ? noticeOrId : (noticeOrId && noticeOrId.id);
  if (!id || typeof SAVE === "undefined" || !SAVE || !SAVE.set) return;
  migrateNoticeBox();
  if (state === "unread") {
    delete SAVE.set.noticeBox[id];
    if (SAVE.set.ackNoticeId === id) delete SAVE.set.ackNoticeId;
  } else if (state === "read" || state === "hidden") {
    delete SAVE.set.noticeBox[id];
    SAVE.set.noticeBox[id] = state;
    pruneNoticeBox(SAVE.set.noticeBox);
  }
  if (typeof persist === "function") persist();
}

function ackSiteNotice(notice) {
  var id = (typeof notice === "string") ? notice : (notice && notice.id);
  if (!id || typeof SAVE === "undefined" || !SAVE || !SAVE.set) return;
  SAVE.set.ackNoticeId = id;
  setNoticeState(id, "read");
}

function markNoticeRead(id) {
  setNoticeState(id, "read");
}

function markNoticeUnread(id) {
  setNoticeState(id, "unread");
}

function hideNotice(id) {
  setNoticeState(id, "hidden");
}

function deleteNotice(id) {
  setNoticeState(id, "hidden");
}

function markAllNoticesRead(list) {
  if (!list || !Array.isArray(list) || typeof SAVE === "undefined" || !SAVE || !SAVE.set) return;
  migrateNoticeBox();
  list.forEach(function (n) {
    var id = (typeof n === "string") ? n : (n && n.id);
    if (!id) return;
    if (SAVE.set.noticeBox[id] !== "hidden") {
      delete SAVE.set.noticeBox[id];
      SAVE.set.noticeBox[id] = "read";
    }
  });
  pruneNoticeBox(SAVE.set.noticeBox);
  if (typeof persist === "function") persist();
}

var _cachedSiteNotices = null;

function paintEnvelope(btn, kind, label) {
  if (!btn || !btn.classList) return;
  btn.classList.remove("is-empty", "is-read", "is-unread", "has-unread");
  if (kind === "unread") {
    btn.classList.add("is-unread");
    btn.classList.add("has-unread");
  } else if (kind === "read") {
    btn.classList.add("is-read");
  } else {
    btn.classList.add("is-empty");
  }
  btn.setAttribute("aria-label", label);
}

function refreshMessagesBadge(notices) {
  var badge = (typeof document !== "undefined" && document.getElementById) ? document.getElementById("menu-messages-badge") : null;
  var btn = (typeof document !== "undefined" && document.getElementById) ? document.getElementById("menu-messages-btn") : null;
  if (!badge && !btn) return;

  function hideBadge() {
    if (!badge) return;
    badge.style.display = "none";
    badge.textContent = "";
    badge.removeAttribute("aria-label");
  }

  function showBadge(unread) {
    if (!badge) return;
    badge.textContent = unread > 99 ? "99+" : String(unread);
    badge.style.display = "";
    badge.setAttribute("aria-label", unread + " unread");
  }

  function applyCount(list) {
    if (!Array.isArray(list)) {
      hideBadge();
      paintEnvelope(btn, "empty", "Messages, nothing waiting.");
      return;
    }
    var unread = 0;
    var visible = 0;
    list.forEach(function (n) {
      var state = getNoticeState(n && n.id);
      if (state === "hidden") return;
      visible++;
      if (state === "unread") unread++;
    });
    if (unread > 0) {
      showBadge(unread);
      paintEnvelope(btn, "unread", "Messages, " + unread + " unread.");
    } else if (visible > 0) {
      hideBadge();
      paintEnvelope(btn, "read", "Messages, all read.");
    } else {
      hideBadge();
      paintEnvelope(btn, "empty", "Messages, nothing waiting.");
    }
  }

  if (Array.isArray(notices)) {
    _cachedSiteNotices = notices;
    applyCount(notices);
    return;
  }
  if (_cachedSiteNotices) {
    applyCount(_cachedSiteNotices);
  }
  if (typeof Cloud !== "undefined" && Cloud.fetchSiteNotices && Cloud.configured && Cloud.configured()) {
    Cloud.fetchSiteNotices().then(function (res) {
      if (Array.isArray(res)) {
        _cachedSiteNotices = res;
        applyCount(res);
      }
    }).catch(function () {});
  }
}

function ensureSiteNoticeAck(next) {
  if (typeof Cloud === "undefined" || !Cloud.fetchActiveSiteNotice) {
    if (next) next();
    return;
  }
  Cloud.fetchActiveSiteNotice().then(function (notice) {
    if (!notice || !pendingSiteNotice(notice)) {
      if (next) next();
      return;
    }
    if (typeof showState !== "function") {
      ackSiteNotice(notice);
      if (next) next();
      return;
    }
    showState("site-notice", {
      kick: "From the keeper",
      title: notice.title || "Notice",
      body: notice.body || "",
      primary: "Continue",
      onPrimary: function () {
        ackSiteNotice(notice);
        if (typeof hideState === "function") hideState();
        if (next) next();
      }
    });
  }).catch(function () {
    if (next) next();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NOTICE_BOX_CAP: NOTICE_BOX_CAP,
    pruneNoticeBox: pruneNoticeBox,
    migrateNoticeBox: migrateNoticeBox,
    getNoticeState: getNoticeState,
    pendingSiteNotice: pendingSiteNotice,
    setNoticeState: setNoticeState,
    ackSiteNotice: ackSiteNotice,
    markNoticeRead: markNoticeRead,
    markNoticeUnread: markNoticeUnread,
    hideNotice: hideNotice,
    deleteNotice: deleteNotice,
    markAllNoticesRead: markAllNoticesRead,
    refreshMessagesBadge: refreshMessagesBadge,
    ensureSiteNoticeAck: ensureSiteNoticeAck
  };
}
