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
  ok("2 cloud exposes notice API", /fetchActiveSiteNotice/.test(cloud) && /publishSiteNotice/.test(cloud) && /isSiteAdmin/.test(cloud));
  ok("2 boot path waits for notice ack", /ensureSiteNoticeAck/.test(briefs));
  ok("2 flow defines site-notice state", /"site-notice"/.test(flow));
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
}

{
  ok("4 settings shows owner publish controls", /settingsOwnerNoticeHtml/.test(panels) && /admin-notice-publish/.test(panels));
  ok("4 owner block only for site admin", /Cloud\.isSiteAdmin/.test(panels));
}

if (fail) {
  console.log("FAIL — site notice · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — site notice · " + pass + " assertions");
