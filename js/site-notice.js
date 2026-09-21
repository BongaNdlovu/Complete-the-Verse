function pendingSiteNotice(notice) {
  if (!notice || !notice.id) return false;
  return !(typeof SAVE !== "undefined" && SAVE.set && SAVE.set.ackNoticeId === notice.id);
}

function ackSiteNotice(notice) {
  if (!notice || !notice.id || typeof SAVE === "undefined") return;
  SAVE.set.ackNoticeId = notice.id;
  if (typeof persist === "function") persist();
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
