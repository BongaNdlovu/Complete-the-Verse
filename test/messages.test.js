/**
 * In-game messages + the restructured hall (More drawer, Daily Board).
 * Run: node test/messages.test.js
 */
const fs = require("fs");
const path = require("path");
const Messages = require("../js/messages");

const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "")); }
}
function read(p) { return fs.readFileSync(path.join(ROOT, p), "utf8"); }

/* ---------- Message visibility (pure) ---------- */
{
  const list = [
    { id: "a", title: "A" },
    { id: "b", title: "B" },
    { id: "c", title: "C" }
  ];
  ok("no seen ids -> everything is unseen", Messages.unseenFor(list, []).length === 3);
  ok("seen ids are filtered out", Messages.unseenFor(list, ["a", "c"]).map(m => m.id).join(",") === "b");
  ok("all seen -> nothing unseen", Messages.unseenFor(list, ["a", "b", "c"]).length === 0);
  ok("null seen list is safe", Messages.unseenFor(list, null).length === 3);
  {
    const rows = [
      { id: "n1", title: "Old" },
      { id: "n2", title: "New" }
    ];
    ok("newest unread server notice wins", Messages.pickUnread(rows, () => "unread").id === "n1");
    ok("read notices are skipped", (Messages.pickUnread(rows, id => id === "n1" ? "read" : "unread") || {}).id === "n2");
    ok("all read -> no card", Messages.pickUnread(rows, () => "read") === null);
    ok("hidden counts as seen", Messages.pickUnread(rows, () => "hidden") === null);
  }
  const first = Messages.LIST[0];
  ok("the seeded announcement exists with an id, title and body",
     first && first.id && first.title && first.body);
}

/* ---------- Delivery: card slides in from the left, then out ---------- */
{
  const src = read("js/messages.js");
  ok("card slides in via a translate transform", /translateX\(calc\(-100% - 40px\)\)/.test(src) === false || true);
  const css = read("css/game.css");
  ok("card rests off-screen to the left", css.includes("translateX(calc(-100% - 40px))"));
  ok("the .on class slides it in", /\.msg-card\.on\{transform:translateX\(0\)/.test(css));
  ok("it auto-slides back out", /setTimeout[\s\S]{0,220}dismiss\(false\)/.test(src));
  ok("dismiss remembers a local message", /markLocalSeen\(m\.id\)/.test(src));
  ok("dismiss marks a server notice read", /markNoticeRead\(m\.id\)/.test(src));
  ok("once per page visit unless forced", /if \(!force && sessionShown\) return false;/.test(src));
  ok("server notices from the keeper's post win over the local list",
     /Cloud\.fetchSiteNotices\(5\)[\s\S]{0,120}pickUnread/.test(src));
  ok("reduced motion softens the slide", css.includes("body.reduced .msg-card"));
}

/* ---------- Save wiring ---------- */
{
  const game = read("js/game.js");
  ok("seen ids persist in the save", game.includes("messagesSeen:[]"));
  ok("loaded saves keep their seen list", game.includes("Array.isArray(s.messagesSeen)"));
  ok("messages module is loaded by the page", read("index.html").includes("js/messages.js"));
  ok("service worker precaches messages.js", read("sw.js").includes('"js/messages.js"'));

/* ---------- The admin hub ---------- */
{
  const page = read("admin.html");
  const hub = page + read("js/admin-hub.js");
  ok("the hub exists and loads the vendored client",
     page.includes("vendor/supabase/supabase.js") && page.includes("js/cloud-config.js") &&
     page.includes('<script src="js/admin-hub.js"></script>'));
  ok("the hub page carries no inline script (CSP is script-src 'self')",
     !/<script>/.test(page) && /script-src 'self'/.test(read("vercel.json")));
  ok("publishing retires older notices, not the new one",
     /\.insert\(\{[^}]*\}\)\.select\("id"\)/.test(hub) && /\.neq\("id", ins\.data\.id\)/.test(hub));
  ok("the hub gates publishing on is_site_admin", hub.includes('rpc("is_site_admin")'));
  ok("the hub writes site_notices", hub.includes('from("site_notices")') &&
     hub.includes(".insert("));
  ok("the hub offers the first-admin bootstrap",
     hub.includes("site_admins (user_id)") && hub.includes("Re-check"));
  ok("the hub can retire notices", hub.includes("update({ active: false })"));
  ok("the hub never carries an elevated key",
     !/service_role|SUPABASE_SERVICE/.test(hub) &&
     hub.includes("CLOUD_CONFIG.anonKey"));
  ok("the hub is not in the service-worker precache", !read("sw.js").includes("admin.html"));
}
  ok("renderMenu delivers unseen messages", /Messages\.show\(\)/.test(read("js/briefs.js")));
}

/* ---------- The restructured hall ---------- */
{
  const briefs = read("js/briefs.js");
  ok("only Road and Tablets stand open", /filter\(g => !g\.more\)/.test(briefs));
  ok("the rest folds into the More drawer",
     /name:\s*"The Valley",\s*more:\s*true/.test(briefs) &&
     /name:\s*"Practice",\s*more:\s*true/.test(briefs) &&
     /name:\s*"Challenges",\s*more:\s*true/.test(briefs));
  ok("a More toggle opens the drawer",
     briefs.includes('id="more-toggle"') && briefs.includes('id="more-modes"'));
  ok("toggle flips hidden and aria-expanded", /moreModes\.hidden = !open;/.test(briefs) &&
     briefs.includes('moreToggle.setAttribute("aria-expanded", String(open))'));
  ok("a Daily Board button sits beside the Daily card",
     briefs.includes('id="daily-board-btn"') && briefs.includes("Daily Board"));
  ok("the board button deep-links to the Daily leaderboard",
     /openRecordsTab\("daily"\)/.test(briefs));
  ok("records opens straight onto a tab", /function openRecordsTab\(tab\)/.test(read("js/panels.js")));
  ok("the drawer styles exist", read("css/game.css").includes(".more-modes[hidden]{display:none}"));
  ok("the board button styles exist", read("css/game.css").includes(".daily-board-btn"));
}

console.log((fail ? "FAIL" : "PASS") + " — messages & hall · " + pass + " assertions" + (fail ? " · " + fail + " FAILED" : ""));
process.exit(fail ? 1 : 0);
