const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}

const cloud = fs.readFileSync(path.join(ROOT, "js", "cloud.js"), "utf8");
const notice = fs.readFileSync(path.join(ROOT, "js", "site-notice.js"), "utf8");
const briefs = fs.readFileSync(path.join(ROOT, "js", "briefs.js"), "utf8");
const panels = fs.readFileSync(path.join(ROOT, "js", "panels.js"), "utf8");
const flow = fs.readFileSync(path.join(ROOT, "js", "flow.js"), "utf8");
const migration = fs.readFileSync(path.join(ROOT, "supabase", "migrations", "006_site_notices.sql"), "utf8");
const config = fs.readFileSync(path.join(ROOT, "js", "cloud-config.js"), "utf8");

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const CloudModule = require(path.join(ROOT, "js", "cloud.js"));

{
  ok("1 no owner email ships in client config",
    !/ownerEmail/.test(config) && !/SITE_OWNER_EMAIL/.test(notice) && !/ownerEmail/.test(cloud));
  ok("1 migration creates site_notices", /create table if not exists public\.site_notices/.test(migration));
  ok("1 admin identity is server-side, not an email in policy text",
    /create table if not exists public\.site_admins/.test(migration) &&
    /public\.is_site_admin\(\)/.test(migration) &&
    migration.indexOf("@gmail.com") === -1);
  ok("1 migration grants table privileges before RLS",
    /grant select on table public\.site_notices to anon, authenticated, service_role/.test(migration) &&
    /grant insert, update on table public\.site_notices to authenticated, service_role/.test(migration));
}

{
  ok("2 cloud exposes notice API",
    /fetchActiveSiteNotice/.test(cloud) &&
    /fetchSiteNotices/.test(cloud) &&
    /publishSiteNotice/.test(cloud) &&
    /withdrawSiteNotice/.test(cloud) &&
    /isSiteAdmin/.test(cloud));
  const publishBody = (cloud.match(/async function publishSiteNotice[\s\S]*?^  \}/m) || [""])[0];
  ok("2 publish does not deactivate siblings", !/\.update\(/.test(publishBody));
  ok("2 boot path waits for notice ack", /ensureSiteNoticeAck/.test(briefs));
  ok("2 flow defines site-notice state and messages view",
    /"site-notice"/.test(flow) && /"messages"/.test(flow));
  ok("2 Messages view and owner withdraw control exist in markup and script",
    /id="v-messages"/.test(html) &&
    /data-go="messages"/.test(html) &&
    /class="env-closed"/.test(html) &&
    /class="env-open"/.test(html) &&
    /class="env-empty"/.test(html) &&
    /renderMessages/.test(panels) &&
    /admin-notice-withdraw/.test(panels));
}

{
  const ctx = {
    SAVE: { set: {} },
    persist: function () {}
  };
  vm.runInNewContext(notice, ctx);
  ok("3 pending when notice id differs", ctx.pendingSiteNotice({ id: "a" }));
  ctx.ackSiteNotice({ id: "a" });
  ok("3 not pending after ack", !ctx.pendingSiteNotice({ id: "a" }));
  ok("3 pending again for new notice", ctx.pendingSiteNotice({ id: "b" }));

  // unread versus read versus hidden
  ok("3 unread notice is pending", ctx.pendingSiteNotice({ id: "c" }));
  ok("3 unread state returned", ctx.getNoticeState("c") === "unread");
  ctx.markNoticeRead("c");
  ok("3 read notice is not pending", !ctx.pendingSiteNotice({ id: "c" }));
  ok("3 read state returned", ctx.getNoticeState("c") === "read");
  ctx.markNoticeUnread("c");
  ok("3 unread again is pending", ctx.pendingSiteNotice({ id: "c" }));
  ctx.hideNotice("c");
  ok("3 hidden notice is not pending", !ctx.pendingSiteNotice({ id: "c" }));
  ok("3 hidden state returned", ctx.getNoticeState("c") === "hidden");

  // capping at 80 ids
  for (let i = 0; i < 90; i++) {
    ctx.setNoticeState("id-" + i, "read");
  }
  const boxKeys = Object.keys(ctx.SAVE.set.noticeBox);
  ok("3 noticeBox is capped at 80 items",
    boxKeys.length === 80 && !ctx.SAVE.set.noticeBox["id-0"] && ctx.SAVE.set.noticeBox["id-89"] === "read");

  // markAllNoticesRead
  ctx.setNoticeState("to-read-1", "unread");
  ctx.setNoticeState("to-read-2", "unread");
  ctx.setNoticeState("stay-hidden", "hidden");
  ctx.markAllNoticesRead([{ id: "to-read-1" }, { id: "to-read-2" }, { id: "stay-hidden" }]);
  ok("3 markAllNoticesRead marks unread as read and keeps hidden as hidden",
    ctx.getNoticeState("to-read-1") === "read" &&
    ctx.getNoticeState("to-read-2") === "read" &&
    ctx.getNoticeState("stay-hidden") === "hidden");
}

{
  // old ackNoticeId counts as read and migrates
  const ctx = {
    SAVE: { set: { ackNoticeId: "legacy-42" } },
    persist: function () {}
  };
  vm.runInNewContext(notice, ctx);
  ok("4 old ackNoticeId counts as read", !ctx.pendingSiteNotice({ id: "legacy-42" }));
  ok("4 unread notice is pending alongside legacy ack", ctx.pendingSiteNotice({ id: "new-42" }));
  ctx.markNoticeUnread("legacy-42");
  ok("4 marking legacy unread makes it pending", ctx.pendingSiteNotice({ id: "legacy-42" }));
}

{
  // cloud mergeSave unions noticeBox with local winning per id
  const local = {
    v: 3, xp: 1, seals: [], best: {}, life: {}, books: {}, verse: {}, srs: {},
    pilgrim: { sites: {}, usedIds: [] },
    set: {
      noticeBox: { msg1: "hidden", msg2: "read" }
    },
    daily: {}, board: []
  };
  const remote = {
    v: 3, xp: 1, seals: [], best: {}, life: {}, books: {}, verse: {}, srs: {},
    pilgrim: { sites: {}, usedIds: [] },
    set: {
      noticeBox: { msg1: "read", msg3: "hidden" }
    },
    daily: {}, board: []
  };
  const merged = CloudModule.mergeSave(local, remote);
  ok("5 mergeSave unions noticeBox with local winning per id",
    merged.set &&
    merged.set.noticeBox &&
    merged.set.noticeBox.msg1 === "hidden" &&
    merged.set.noticeBox.msg2 === "read" &&
    merged.set.noticeBox.msg3 === "hidden");
  // legacy ackNoticeId in mergeSave
  const legacyLocal = {
    v: 3, xp: 1, seals: [], best: {}, life: {}, books: {}, verse: {}, srs: {},
    pilgrim: { sites: {}, usedIds: [] },
    set: { ackNoticeId: "legacy-local" },
    daily: {}, board: []
  };
  const legacyRemote = {
    v: 3, xp: 1, seals: [], best: {}, life: {}, books: {}, verse: {}, srs: {},
    pilgrim: { sites: {}, usedIds: [] },
    set: { ackNoticeId: "legacy-remote" },
    daily: {}, board: []
  };
  const mergedLegacy = CloudModule.mergeSave(legacyLocal, legacyRemote);
  ok("5 mergeSave migrates legacy ackNoticeId from local and remote",
    mergedLegacy.set &&
    mergedLegacy.set.noticeBox &&
    mergedLegacy.set.noticeBox["legacy-local"] === "read" &&
    mergedLegacy.set.noticeBox["legacy-remote"] === "read");

  // refreshMessagesBadge DOM behavior
  let badgeDisplay = "none", badgeText = "", badgeLabel = "";
  const fakeDoc = {
    getElementById: function (id) {
      if (id === "menu-messages-badge") {
        return {
          style: {
            get display() { return badgeDisplay; },
            set display(v) { badgeDisplay = v; }
          },
          get textContent() { return badgeText; },
          set textContent(v) { badgeText = v; },
          setAttribute: function (k, v) { if (k === "aria-label") badgeLabel = v; },
          removeAttribute: function (k) { if (k === "aria-label") badgeLabel = ""; }
        };
      }
      return null;
    }
  };
  const badgeCtx = {
    document: fakeDoc,
    SAVE: { set: { noticeBox: { m1: "read", m2: "hidden" } } }
  };
  vm.runInNewContext(notice, badgeCtx);
  badgeCtx.refreshMessagesBadge([{ id: "m1" }, { id: "m2" }, { id: "m3" }]);
  ok("5 refreshMessagesBadge sets unread count on badge",
    badgeDisplay === "" && badgeText === "1" && badgeLabel === "1 unread");
  badgeCtx.markNoticeRead("m3");
  badgeCtx.refreshMessagesBadge([{ id: "m1" }, { id: "m2" }, { id: "m3" }]);
  ok("5 refreshMessagesBadge hides badge when unread is zero",
    badgeDisplay === "none" && badgeText === "" && badgeLabel === "");
  const hundredUnread = [];
  for (let i = 0; i < 105; i++) hundredUnread.push({ id: "big-" + i });
  badgeCtx.refreshMessagesBadge(hundredUnread);
  ok("5 refreshMessagesBadge caps display at 99+",
    badgeDisplay === "" && badgeText === "99+");

  // Envelope glyph follows unread, all-read, and empty.
  let btnClasses = new Set(), btnLabel = "";
  const fullDoc = {
    getElementById: function (id) {
      if (id === "menu-messages-badge") {
        return {
          style: {
            get display() { return badgeDisplay; },
            set display(v) { badgeDisplay = v; }
          },
          get textContent() { return badgeText; },
          set textContent(v) { badgeText = v; },
          setAttribute: function (k, v) { if (k === "aria-label") badgeLabel = v; },
          removeAttribute: function (k) { if (k === "aria-label") badgeLabel = ""; }
        };
      }
      if (id === "menu-messages-btn") {
        return {
          classList: {
            add: function () {
              for (var i = 0; i < arguments.length; i++) btnClasses.add(arguments[i]);
            },
            remove: function () {
              for (var i = 0; i < arguments.length; i++) btnClasses.delete(arguments[i]);
            }
          },
          setAttribute: function (k, v) { if (k === "aria-label") btnLabel = v; }
        };
      }
      return null;
    }
  };
  const fullCtx = {
    document: fullDoc,
    SAVE: { set: { noticeBox: {} } }
  };
  vm.runInNewContext(notice, fullCtx);
  fullCtx.refreshMessagesBadge([{ id: "m1" }]);
  ok("5 envelope seals when a message is unread",
    btnClasses.has("is-unread") && btnClasses.has("has-unread") && !btnClasses.has("is-empty") && btnLabel === "Messages, 1 unread.");
  fullCtx.markNoticeRead("m1");
  fullCtx.refreshMessagesBadge([{ id: "m1" }]);
  ok("5 envelope opens when every message is read",
    btnClasses.has("is-read") && !btnClasses.has("is-unread") && btnLabel === "Messages, all read.");
  fullCtx.hideNotice("m1");
  fullCtx.refreshMessagesBadge([{ id: "m1" }]);
  ok("5 envelope is empty when every message is hidden",
    btnClasses.has("is-empty") && !btnClasses.has("is-read") && btnLabel === "Messages, nothing waiting.");
}

{
  const game = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
  const grantSql = fs.readFileSync(path.join(ROOT, "supabase", "grant_admin.sql"), "utf8");
  ok("6 settings shows owner publish controls",
    /settingsOwnerNoticeHtml/.test(panels) && /admin-notice-publish/.test(panels));
  ok("6 owner block only for site admin", /Cloud\.isSiteAdmin/.test(panels));
  ok("6 owner copy explains notice behavior",
    /stops every player once, then stays in their box/.test(panels));
  ok("6 messages view is included in enterViewAmbience video sync",
    /view==="messages"/.test(game) && /enterViewAmbience/.test(game));
  ok("6 owner notice list does not append ellipsis to short body",
    /r\.body\.length > 60/.test(panels));
  ok("6 grant_admin.sql ensures profile exists and binds assignment to profiles",
    /from public\.profiles/.test(grantSql) && /on_profile_admin_assignment/.test(grantSql));
}

async function testGating() {
  // the newest unread is the one that gates; hidden and older unread do not
  let activeNotice = { id: "newest-2", title: "Update 2", body: "Body 2" };
  let shown = null;
  const ctx = {
    SAVE: { set: { noticeBox: { "older-1": "unread" } } },
    Cloud: {
      fetchActiveSiteNotice: function () {
        return Promise.resolve(activeNotice);
      }
    },
    showState: function (name, opts) {
      shown = { name: name, opts: opts };
    },
    hideState: function () {
      shown = null;
    },
    persist: function () {}
  };
  vm.runInNewContext(notice, ctx);

  // 1. Newest is unread -> it gates
  let gatedNext = false;
  ctx.ensureSiteNoticeAck(function () { gatedNext = true; });
  await new Promise(r => setImmediate(r));
  ok("7 newest unread notice gates before hall", shown !== null && shown.name === "site-notice" && !gatedNext);

  // Player continues -> marks read
  if (shown && shown.opts && shown.opts.onPrimary) {
    shown.opts.onPrimary();
  }
  ok("7 continuing marks newest notice read and lets player in", gatedNext && ctx.getNoticeState("newest-2") === "read");

  // 2. Next entry: newest notice is read -> does not gate, even with older unread notice
  shown = null;
  gatedNext = false;
  ctx.ensureSiteNoticeAck(function () { gatedNext = true; });
  await new Promise(r => setImmediate(r));
  ok("7 newest read notice does not gate, older unread waits in box", shown === null && gatedNext);

  // 3. Newest notice is hidden -> does not gate
  ctx.hideNotice("newest-2");
  shown = null;
  gatedNext = false;
  ctx.ensureSiteNoticeAck(function () { gatedNext = true; });
  await new Promise(r => setImmediate(r));
  ok("7 newest hidden notice does not gate", shown === null && gatedNext);

  // 4. Marking newest unread again -> gates again
  ctx.markNoticeUnread("newest-2");
  shown = null;
  gatedNext = false;
  ctx.ensureSiteNoticeAck(function () { gatedNext = true; });
  await new Promise(r => setImmediate(r));
  ok("7 marking newest notice unread stops player again", shown !== null && shown.name === "site-notice" && !gatedNext);

  if (fail) {
    console.log("FAIL — site notice · " + pass + " passed · " + fail + " failed");
    process.exit(1);
  }
  console.log("PASS — site notice · " + pass + " assertions");
}

testGating().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
