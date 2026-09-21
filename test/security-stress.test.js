const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const Polish = require("../js/polish");
const Cloud = require("../js/cloud");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (ent) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (/^(node_modules|\.git|\.vercel|vendor|audio|assets|mobile|android|android-standalone)$/.test(ent.name)) return;
      walk(p, out);
    } else if (/\.(js|html|json|ts|sql|md|css|yml|toml|env|example)$/.test(ent.name)) {
      out.push(p);
    }
  });
}

{
  const leak = /GOCSPX-[A-Za-z0-9_-]{8,}|sb_secret_[A-Za-z0-9_]+|BEGIN [A-Z ]*PRIVATE KEY|VERCEL_TOKEN\s*=\s*\S+|SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/;
  const hits = [];
  const files = [];
  ["js", "css", "supabase", "test", "."].forEach(function (rel) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return;
    if (rel === ".") {
      ["index.html", "sw.js", "vercel.json", "js/cloud-config.js"].forEach(function (f) {
        const p = path.join(ROOT, f);
        if (fs.existsSync(p)) files.push(p);
      });
      return;
    }
    walk(abs, files);
  });
  files.forEach(function (p) {
    const text = fs.readFileSync(p, "utf8");
    if (leak.test(text)) hits.push(path.relative(ROOT, p));
  });
  const cfg = fs.readFileSync(path.join(ROOT, "js", "cloud-config.js"), "utf8");
  ok("1 leak scan: no private keys or deploy tokens in shippable sources", hits.length === 0, hits);
  ok("1 leak scan: client key is publishable only", /sb_publishable_/.test(cfg) && !/service_role/.test(cfg));
}

{
  const cloud = fs.readFileSync(path.join(ROOT, "js", "cloud.js"), "utf8");
  const mig = fs.readFileSync(path.join(ROOT, "supabase", "migrations", "005_edge_only_scores.sql"), "utf8");
  ok("2 score path: client submits only through submit-score",
    /functions\.invoke\("submit-score"/.test(cloud) &&
    !/\.from\("daily_scores"\)\s*\n?\s*\.insert/.test(cloud) &&
    !/\.from\("blitz_scores"\)\s*\n?\s*\.insert/.test(cloud));
  ok("2 score path: authenticated cannot write score tables",
    /revoke insert, update, delete on table public\.daily_scores from anon, authenticated/.test(mig) &&
    /revoke insert, update, delete on table public\.blitz_scores from anon, authenticated/.test(mig));
}

{
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  ok("3 oauth cache: navigation with code or error is not stored",
    /searchParams\.has\("code"\)/.test(sw) &&
    /searchParams\.has\("error"\)/.test(sw) &&
    /cache\.put\(request, networkResponse\.clone\(\)\)/.test(sw));
}

{
  const util = fs.readFileSync(path.join(ROOT, "js", "util.js"), "utf8");
  const game = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
  const esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
    });
  };
  const payload = '<script>alert(1)</script><img src=x onerror=alert(1)>';
  ok("4 xss: util.esc is the HTML escape used by the engine", /const esc = s => String\(s\)\.replace/.test(util));
  ok("4 xss: toast writes textContent not innerHTML", /p\.textContent = t/.test(game) && /function toast\(t\)/.test(game));
  ok("4 xss: escape and display-name strip script markup",
    esc(payload).indexOf("<script>") === -1 &&
    Polish.sanitizeDisplayName(payload).indexOf("<") === -1 &&
    Polish.sanitizeDisplayName("Jo<>hn") === "John");
  const panels = fs.readFileSync(path.join(ROOT, "js", "panels.js"), "utf8");
  ok("4 xss: local board rows escape accuracy and score text",
    /esc\(r\.acc\)/.test(panels) && /esc\(fmt\(r\.score\)\)/.test(panels));
}

{
  ok("5 forged daily score is rejected",
    Polish.plausibleDaily({ score: 999999, accuracy: 100, correct: 1, attempts: 1, best: 1, baseScore: 0, diff: "watchman" }) === false);
  ok("5 forged blitz score is rejected",
    Polish.plausibleBlitz({ score: 999999, correct: 999999, survived_ms: 1000 }) === false);
  ok("5 blitz score/correct mismatch is rejected",
    Polish.plausibleBlitz({ score: 50, correct: 9, survived_ms: 1000 }) === false);
}

{
  const before = Object.prototype.polluted;
  const local = { v: 3, xp: 1, pilgrim: { sites: {}, usedIds: [] }, best: {}, srs: {}, board: [{ score: 1 }], set: { music: 1 } };
  const remote = {
    v: 3, xp: 2,
    pilgrim: { sites: { ur: { cleared: true, best: 1, bestAccuracy: 1, attempts: 1, clearedAt: 1, perfect: false } }, usedIds: [] },
    best: { pilgrimage: 1 },
    srs: {},
    set: JSON.parse("{\"__proto__\":{\"polluted\":true}}"),
    board: []
  };
  Cloud.mergeSave(local, remote);
  ok("6 mergeSave does not pollute Object.prototype", Object.prototype.polluted === before);
}

{
  const huge = [];
  for (let i = 0; i < 20000; i++) huge.push({ score: i });
  const t0 = Date.now();
  const merged = Cloud.mergeSave(
    { v: 3, xp: 1, pilgrim: { sites: {}, usedIds: [] }, best: {}, srs: {}, board: [{ score: 7 }] },
    {
      v: 3, xp: 2,
      pilgrim: { sites: { ur: { cleared: true, best: 1, bestAccuracy: 1, attempts: 1, clearedAt: 1, perfect: false } }, usedIds: [] },
      best: { pilgrimage: 1 },
      srs: {},
      board: huge
    }
  );
  ok("7 oversized remote board is ignored when local has a board", merged.board.length === 1 && merged.board[0].score === 7);
  ok("7 oversized merge finishes in under 2s", Date.now() - t0 < 2000);
  const freshDevice = Cloud.mergeSave(
    { v: 3, xp: 1, pilgrim: { sites: {}, usedIds: [] }, best: {}, srs: {}, board: [] },
    {
      v: 3, xp: 2,
      pilgrim: { sites: { ur: { cleared: true, best: 1, bestAccuracy: 1, attempts: 1, clearedAt: 1, perfect: false } }, usedIds: [] },
      best: { pilgrimage: 1 },
      srs: {},
      board: huge
    }
  );
  ok("7 remote board is capped at 10 when the device has no board", freshDevice.board.length === 10);
}

{
  const cloud = fs.readFileSync(path.join(ROOT, "js", "cloud.js"), "utf8");
  const redirect = cloud.slice(cloud.indexOf("function authRedirectTo"), cloud.indexOf("/* ----------------------- pure merge"));
  ok("8 auth redirect is origin plus pathname only",
    /origin \+ path/.test(redirect) &&
    /split\("#"\)\[0\]/.test(redirect) &&
    redirect.indexOf("location.search") === -1);
  ok("8 auth error URL is replaced with origin and pathname",
    /history\.replaceState/.test(cloud) &&
    /var clean = \(location\.origin \|\| ""\) \+ \(location\.pathname \|\| ""\)/.test(cloud));
}

{
  const vercel = fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8");
  ok("9 CSP blocks remote scripts and framing",
    /script-src 'self'/.test(vercel) &&
    !/unsafe-eval/.test(vercel) &&
    /frame-ancestors 'none'/.test(vercel) &&
    /X-Frame-Options/.test(vercel) &&
    /DENY/.test(vercel));
  ok("9 HSTS pins the origin",
    /Strict-Transport-Security/.test(vercel) && /max-age=\d+/.test(vercel));
}

{
  const edge = fs.readFileSync(path.join(ROOT, "supabase", "functions", "submit-score", "index.ts"), "utf8");
  ok("10 submit-score rate-limits 20 posts per 10 minutes",
    /MAX_SUBMISSIONS_PER_WINDOW = 20/.test(edge) &&
    /WINDOW_MS = 10 \* 60 \* 1000/.test(edge));
  ok("10 display name is capped at 32 characters",
    Polish.sanitizeDisplayName("A".repeat(80)).length === 32);
  ok("10 display name rejects email addresses",
    Polish.sanitizeDisplayName("pilgrim@example.com") === "");
  const panels = fs.readFileSync(path.join(ROOT, "js", "panels.js"), "utf8");
  const cloudSrc = fs.readFileSync(path.join(ROOT, "js", "cloud.js"), "utf8");
  ok("10 settings does not render account email",
    !/u && u\.email/.test(panels) &&
    !/Cloud\.user\(\) && Cloud\.user\(\)\.email/.test(panels));
  ok("10 oauth errors do not echo the URL description",
    !/return urlErr\.description/.test(cloudSrc));
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  const precache = sw.slice(sw.indexOf("const PRECACHE_ASSETS"), sw.indexOf("function isAudio"));
  ok("10 service worker does not precache audio", precache.indexOf("audio/") === -1);
}

{
  const edge = fs.readFileSync(path.join(ROOT, "supabase", "functions", "submit-score", "index.ts"), "utf8");
  ok("11 preflight OPTIONS is answered with CORS headers",
    /req\.method === "OPTIONS"/.test(edge) && /status: 204/.test(edge) &&
    /Access-Control-Allow-Origin/.test(edge) && /Access-Control-Allow-Headers/.test(edge));
  ok("11 every JSON response carries the CORS origin",
    /"Content-Type": "application\/json", \.\.\.CORS_HEADERS/.test(edge));
  ok("11 malformed JSON is a 400, not a 500",
    /try \{\s*body = await req\.json\(\);\s*\} catch \{/.test(edge) && /"bad-json" \}, 400/.test(edge));
}

{
  const mig6 = fs.readFileSync(path.join(ROOT, "supabase", "migrations", "006_site_notices.sql"), "utf8");
  const mig7 = fs.readFileSync(path.join(ROOT, "supabase", "migrations", "007_run_ghosts_guard.sql"), "utf8");
  const cfg = fs.readFileSync(path.join(ROOT, "js", "cloud-config.js"), "utf8");
  const cloudSrc = fs.readFileSync(path.join(ROOT, "js", "cloud.js"), "utf8");
  ok("12 site_notices grants are explicit, matching repo convention",
    /revoke insert, update, delete on table public\.site_notices from anon, authenticated/.test(mig6) &&
    /grant select on table public\.site_notices to anon, authenticated, service_role/.test(mig6) &&
    /grant insert, update on table public\.site_notices to authenticated, service_role/.test(mig6));
  ok("12 owner policies read site_admins, not an email",
    /create table if not exists public\.site_admins/.test(mig6) &&
    /using \(public\.is_site_admin\(\)\)/.test(mig6) &&
    mig6.indexOf("@gmail.com") === -1);
  ok("12 client ships no owner email", !/ownerEmail|@gmail\.com/.test(cfg) && !/@gmail\.com/.test(cloudSrc));
  ok("12 run_ghosts writes are bounded by a trigger",
    /create trigger run_ghosts_guard/.test(mig7) && /samples > 2000/.test(mig7) &&
    /pg_column_size\(new\.timeline\) > 131072/.test(mig7) &&
    /pg_column_size\(new\.meta\) > 8192/.test(mig7));
}

if (fail) {
  console.log("FAIL — security stress · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — security stress · " + pass + " assertions");
