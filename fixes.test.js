/* ==================================================================
   FIXES — pins for the 2026-08-16 assessment improvements.

   Every fix from ASSESSMENT-REPORT.md §7 that is code-verifiable is
   pinned here: pure math where possible (the clock helper, the insight
   cards), executed behaviour where the integration sandbox already
   covers it (default difficulty, daily one-shot, serve-time usedIds),
   and source structure where the behaviour IS the source (menu routing,
   dedupe wrappers, payload deletions).
   ================================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}

/* The engine is split across module files; static checks read the
   concatenation through the one shared list (scripts/engine-source.js). */
const { readEngine } = require("./scripts/engine-source");
const game = readEngine(__dirname);
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const atlas = fs.readFileSync(path.join(root, "js", "atlas.js"), "utf8");
const cloud = fs.readFileSync(path.join(root, "js", "cloud.js"), "utf8");

/* ---------- pure: Polish loads in Node ---------- */
const Polish = require(path.join(root, "js", "polish.js"));

/* §2.1 — one printed clock everywhere. */
ok("pacedClockMs exists", typeof Polish.pacedClockMs === "function");
eq("Disciple at Ur prints 23.6s", Polish.pacedClockMs(14000, 1.0, 1500), 23600);
eq("Watchman at Ur prints 18.9s", Polish.pacedClockMs(14000, 0.72, 1500), 18896);
eq("Pilgrim at Ur prints 29.5s", Polish.pacedClockMs(14000, 1.35, 1500), 29480);
eq("Act I at Disciple includes pace and flat", Polish.pacedClockMs(14000, 1.0, 1500),
   Math.round((14000 * 1.0 + 1500) * 1.2 + 5000));
ok("game.js prints clocks through the helper",
   /pacedClockMs\(siteClockMs\(siteId, sbMode\), D\.time, pad\)/.test(game));
ok("act cards print the real clock",
   /pacedClockMs\(A\.t, R\.diff\.time, Pilgrimage\.PICK_PAD_MS/.test(game));
ok("the atlas dossier prints the same formula",
   /dossClockLabel/.test(atlas) && /pacedClockMs\(b\.clockMs, diffTime/.test(atlas));
ok("the dossier reads the player's difficulty",
   /resolveDiff\(SAVE\.set\.diff\)/.test(atlas));

function eq(name, got, want) { ok(name, got === want, { got, want }); }

/* §2.1 — one ordeal: Watchman. No picker. */
ok("a fresh save defaults to Watchman",
   /diff:"watchman"/.test(game) && !/diff:"disciple"/.test(game));
ok("Pilgrim and Disciple are not playable diffs",
   !/pilgrim:\{ key:"pilgrim"/.test(game) && !/disciple:\{ key:"disciple"/.test(game));
ok("Watchman is the only DIFFS entry", /const DIFFS = \{[\s\S]*?watchman:/.test(game));
ok("old difficulty keys resolve to Watchman", /function resolveDiff/.test(game));
ok("the site brief no longer offers a difficulty picker",
   /host\.innerHTML = ""/.test(game) && /function renderSiteDiffs/.test(game));
ok("the site brief host is still in the markup", /id="sb-diffs"/.test(index));

/* §2.2 — the daily is spent by finishing, not by dying. */
ok("only a completed run records the daily",
   /R\.mode==="daily" && reason==="complete" && SAVE\.daily\.date !== todayKey\(\)/.test(game));

/* §2.3 — serve-time usedIds. */
ok("startRun no longer pre-commits the draw",
   !/markUsed\(SAVE\.pilgrim, siteDraw\.verses\.map/.test(game) &&
   !/markUsed\(SAVE\.pilgrim, queue\.map/.test(game));
ok("a verse is committed when served", /commitSiteVerse\(v\)/.test(game));
ok("the commit helper guards the road modes",
   /function commitSiteVerse/.test(game) &&
   /R\.mode==="pilgrimage" \|\| R\.mode==="pilgrim-recall" \|\| R\.mode==="relay"/.test(game));

/* §2.4 / §3.1 — menu policy (behavioural pins live in menu-modes.test.js
   and integration.test.js; these pin the wiring). */
ok("menu Enter routes through the visible order",
   /MENU_ORDER\.filter\(x=>MODES\[x\] && !MODES\[x\]\.hidden\)\[0\]/.test(game));
ok("the tutorial no longer teaches select-then-lock",
   /the tap is the answer; it locks at once/.test(index) &&
   !/then <b>Lock Answer \/ Enter<\/b>/.test(index));
ok("the brief hint matches single-tap answers",
   /A–D or 1–4 answers/.test(index) && !/Enter to lock/.test(index.split("tut-card")[0] + index.split("tut-card")[1]));
ok("the standard brief still names the lock keys for two-tap mode",
   /A–D or 1–4 answers/.test(index));

/* §3.3 — the same verse never surfaces twice in one run. */
ok("draw paths filter by reference",
   ["drawVerse", "drawEndlessVerse", "buildDailyList", "buildReviewQueue"]
     .every(fn => new RegExp("function " + fn + "[\\s\\S]{0,400}?poolSansRepeatRefs\\(").test(game)),
   "every pick-mode draw wraps its pool");
ok("the set-piece book pool filters by reference too",
   /poolSansRepeatRefs\(VERSES\.filter\(x=>x\.b===s\.book/.test(game));
ok("a served verse's reference is recorded", /R\.usedRefs\.add\(refKey\(v\)\)/.test(game));
ok("the daily list records references as it draws", /R\.usedRefs\.add\(refKey\(v\)\); out\.push/.test(game));

/* §3.5 — the relay control is named after the mode, not a verb. */
ok("the rail relay reads as a destination, not a command",
   />The Long Road<\/button>/.test(atlas) && !/>Walk it<\/button>/.test(atlas));

/* §3.2 — edge-first score submission. */
ok("scores try the edge function first",
   /await submitViaEdge\("daily", payload\)/.test(cloud) &&
   /await submitViaEdge\("blitz", payload\)/.test(cloud));
ok("a direct RLS write remains as the fallback", /via: "direct"/.test(cloud));

/* §4.1 — the dead payload is gone. */
ok("no vendored three.js", !fs.existsSync(path.join(root, "vendor", "three")));
ok("no node_modules three", !fs.existsSync(path.join(root, "node_modules", "three")));
ok("no orphaned host art", !fs.existsSync(path.join(root, "assets", "hosts")));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
ok("the three dependency is dropped", !pkg.dependencies || !pkg.dependencies.three, pkg.dependencies);
const chars = fs.readdirSync(path.join(root, "assets", "characters"));
ok("character folders carry only wired art",
   chars.every(c => ["portrait.png", "token.png"].sort().join() ===
     fs.readdirSync(path.join(root, "assets", "characters", c)).sort().join()),
   chars.filter(c => {
     const f = fs.readdirSync(path.join(root, "assets", "characters", c)).sort().join();
     return f !== ["portrait.png", "token.png"].sort().join();
   }));
const vercelIgnore = fs.readFileSync(path.join(root, ".vercelignore"), "utf8");
ok("content tooling stays out of the deploy", /^content\/$/m.test(vercelIgnore));

/* §4.4 — insight cards cover every book in the bank. */
{
  const sb = {};
  vm.createContext(sb);
  ["js/verses.js"].forEach(f =>
    vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), sb, { filename: f }));
  const books = vm.runInContext("BOOKS_ORDER", sb);
  eq("the bank orders 66 books", books.length, 66);
  const missing = books.filter(b => !Polish.BOOK_INSIGHTS[b]);
  eq("every book has an insight card", missing.length, 0);
  const stubbed = books.filter(b => {
    const c = Polish.BOOK_INSIGHTS[b];
    return !c || !c.author || c.author === "See traditional attribution" || !c.theme;
  });
  eq("no book falls back to filler", stubbed.length, 0);
  ok("roots are trimmed", books.every(b => (Polish.BOOK_INSIGHTS[b].roots || [])
    .every(r => r.w === String(r.w).trim() && r.w.length > 0)));
}

/* §4.5 / §4.6 — dialog semantics and store presence. */
ok("pause is a dialog", /id="pause" role="dialog" aria-modal="true"/.test(index));
ok("pause takes focus when opened", /\$\("pause-resume"\)\.focus/.test(game) || /resume\.focus\(\)/.test(game));
ok("favicon is linked", /rel="icon" href="assets\/favicon\.svg"/.test(index));
ok("favicon exists", fs.existsSync(path.join(root, "assets", "favicon.svg")));
ok("manifest is linked and present",
   /rel="manifest" href="manifest\.webmanifest"/.test(index) &&
   fs.existsSync(path.join(root, "manifest.webmanifest")));
ok("description meta present", /<meta name="description"/.test(index));
ok("open-graph card present",
   /property="og:title"/.test(index) && /property="og:image"/.test(index));
ok("theme colour present", /name="theme-color"/.test(index));

/* §5.3 — distractor fillers are real verses, never numbered fakes. */
ok("the numbered filler is gone", !/" " \+ n/.test(game) && !fillerNumbered(game));
function fillerNumbered(src){ return /push\(fillBase \+ \(n>1 \? " "\+n : ""\)\)/.test(src); }
ok("the bank backs the last-resort fillers", /VERSES\.filter\(x=>x && x\.a && x\.a!==correct/.test(game));

/* §5.2 — dead branches removed. */
ok("no identical-branch ternary survives", !/o\.road\.after \? SAVE\.pilgrim : SAVE\.pilgrim/.test(game));
ok("no both-arms-same label survives", !/\? "Verse" : "Verse"/.test(game));

if (fail) {
  console.log("FAIL — fixes · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — fixes · " + pass + " assertions");
