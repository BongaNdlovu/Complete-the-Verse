/**
 * Structural checks for the split game, the verse bank and the review
 * systems. Run: node game-structure.test.js
 *
 * The bank assertion used to be "verse total in 400-600", which is the
 * assertion that let a 309-entry generated bank in when 296 of its
 * entries could not teach anything. Size is not the property worth
 * defending. What follows asserts the properties that are: the gate
 * passes, every book carries enough verses to draw from, and no entry is
 * reachable that the gate would reject.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { loadBank } = require("../scripts/load-bank");
const QA = require("../scripts/verse-qa");

const ROOT = require("../scripts/repo-root");
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
/* The engine is split across module files; static checks read the
   concatenation through the one shared list (scripts/engine-source.js). */
const { readEngine } = require("../scripts/engine-source");
const game = readEngine(ROOT);
const css   = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8");

/* ---------- files and load order ---------- */
["index.html", "css/game.css", "css/play.css", "css/atlas.css", "css/tablets.css", "js/verses.js", "js/verses-extra.js",
 "js/verses-more.js", "js/verses-ascent.js", "js/assemble.js", "js/meta.js", "js/flow.js",
 "js/passages.js", "js/bank.js", "js/srs.js", "js/recall.js",
 "js/legacy-ids.js",
 "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js", "js/live.js",
 "js/atlas.js", "js/tablets.js", "js/tablets-canon.js", "js/tablets-hall.js", "js/tablets-more.js", "js/tablets-run.js", "js/game.js",
 "scripts/verse-qa.js", "scripts/qa-verses.js", "scripts/load-atlas.js",
 "content/QUARANTINE.md", "content/quarantine.json"
].forEach(f => assert(fs.existsSync(path.join(ROOT, f)), f + " exists"));

/* Leaflet is vendored rather than pulled from a CDN so the game keeps
   working with no network and no install step. If these go missing the
   Pilgrimage silently loses its map, so their presence is asserted. */
["vendor/leaflet/leaflet.js", "vendor/leaflet/leaflet.css",
 "vendor/leaflet/images/marker-icon.png", "vendor/leaflet/images/marker-shadow.png"
].forEach(f => assert(fs.existsSync(path.join(ROOT, f)), f + " vendored"));
assert(!/unpkg\.com|cdnjs|jsdelivr|cdn\.tailwindcss/.test(index),
  "index.html pulls no script or stylesheet from a CDN");

const order = ["js/verses.js", "js/verses-extra.js", "js/verses-more.js",
               "js/verses-ascent.js",
               "js/passages.js", "js/legacy-ids.js",
               "js/bank.js", "js/srs.js", "js/recall.js",
               // pilgrimage.js captures the merged VERSES array, so it has
               // to come after bank.js; atlas.js uses all of the above.
               "js/sites.js", "js/empires.js", "js/geo.js",
               "js/pilgrimage.js", "js/live.js", "js/atlas.js", "js/game.js"];
assert(index.indexOf('src="js/tablets.js"') < index.indexOf('src="js/tablets-canon.js"'),
  "tablets-canon.js loads after tablets.js");
assert(index.indexOf('src="js/tablets-canon.js"') < index.indexOf('src="js/tablets-hall.js"'),
  "tablets-hall.js loads after tablets-canon.js");
assert(index.indexOf('src="js/tablets-hall.js"') < index.indexOf('src="js/tablets-more.js"'),
  "tablets-more.js loads after tablets-hall.js");
assert(index.indexOf('src="js/tablets-more.js"') < index.indexOf('src="js/pilgrimage.js"'),
  "tablets-more.js loads before pilgrimage.js");
assert(index.indexOf("vendor/leaflet/leaflet.js") < index.indexOf('src="js/atlas.js"'),
  "Leaflet loads before the atlas that uses it");
let prev = -1;
order.forEach(f => {
  const at = index.indexOf('src="' + f + '"');
  assert(at >= 0, "index.html loads " + f);
  assert(at > prev, f + " loads after its dependencies");
  prev = at;
});
/* verses-more must land before bank.js merges VERSES_MORE into VERSES. */
assert(index.indexOf('src="js/verses-more.js"') < index.indexOf('src="js/bank.js"'),
  "verses-more.js loads before bank.js merges it");
assert(index.indexOf('src="js/verses-ascent.js"') < index.indexOf('src="js/bank.js"'),
  "verses-ascent.js loads before bank.js merges it");
assert(index.indexOf('src="js/assemble.js"') < index.indexOf('src="js/typed.js"'),
  "assemble.js loads before the assemble renderer");
assert(index.indexOf('src="js/meta.js"') < index.indexOf('src="js/game.js"'),
  "meta.js loads before game.js");
assert(index.indexOf('src="js/flow.js"') < index.indexOf('src="js/game.js"'),
  "flow.js loads before game.js");

/* ---------- audio ---------- */
assert(game.includes("TRACKS"), "track bed map required");
assert(game.includes("playTrack"), "track playback helper required");
["menu","act1","act2","act3","act4","act5","results"].forEach(bed => {
  assert(fs.existsSync(path.join(ROOT, "audio", bed + ".mp3")), bed + " track file required");
  assert(game.includes("audio/" + bed + ".mp3"), bed + " mapped in TRACKS");
});

/* ---------- the bank ---------- */
const bank = loadBank();
const V = bank.VERSES;

assert(V.length >= 250, "bank holds at least 250 verses (got " + V.length + ")");

/* Hand-authored expansion: Node and the browser both must see it. Without
   this, a missing script tag would leave the pack on disk but not in play. */
assert(Array.isArray(bank.VERSES_MORE) && bank.VERSES_MORE.length >= 50,
  "VERSES_MORE is loaded and substantial (got " + (bank.VERSES_MORE || []).length + ")");
assert(Array.isArray(bank.VERSES_ASCENT) && bank.VERSES_ASCENT.length >= 150,
  "VERSES_ASCENT is loaded and substantial (got " + (bank.VERSES_ASCENT || []).length + ")");
const moreIds = new Set(bank.VERSES_MORE.map(v => bank.verseId(v)));
const mergedMore = V.filter(v => moreIds.has(v.id)).length;
assert(mergedMore === bank.VERSES_MORE.length,
  "every VERSES_MORE entry is merged into VERSES (" + mergedMore + "/" + bank.VERSES_MORE.length + ")");
assert(!bank.VERSES_MORE.some(v => v.r === "Job 23:10"),
  "Job 23:10 is not duplicated in VERSES_MORE (it already lives in verses-extra)");

const errored = V.filter(v => QA.auditVerse(v).some(f => f.severity === "error"));
assert(errored.length === 0,
  "every playable verse passes the QA gate (failing: " +
  errored.slice(0, 5).map(v => v.r).join(", ") + (errored.length > 5 ? " +" + (errored.length - 5) : "") + ")");

const pErrored = bank.PASSAGES.flatMap(QA.passageToVerses)
  .filter(v => QA.auditVerse(v).some(f => f.severity === "error"));
assert(pErrored.length === 0, "every passage blank passes the QA gate");

// The gate is the contract, so run the real binary too: a test that only
// calls the library would not catch the CLI drifting away from it.
let gateOk = true;
try { execFileSync(process.execPath, [path.join(ROOT, "scripts", "qa-verses.js")], {stdio: "pipe"}); }
catch (e) { gateOk = false; }
assert(gateOk, "scripts/qa-verses.js exits zero");

const counts = {};
V.forEach(v => { counts[v.b] = (counts[v.b] || 0) + 1; });
const missing = bank.BOOKS_ORDER.filter(b => !counts[b]);
assert(missing.length === 0, "every book of the 66 is represented (missing: " + missing.join(", ") + ")");
const thin = bank.BOOKS_ORDER.filter(b => (counts[b] || 0) < 4);
assert(thin.length === 0, "no book carries fewer than 4 verses (thin: " + thin.join(", ") + ")");

[1,2,3,4,5].forEach(t => assert((bank.BY_TIER[t] || []).length >= 15,
  "tier " + t + " has enough verses to draw a run from (got " + (bank.BY_TIER[t] || []).length + ")"));

/* ---------- stable ids ---------- */
const ids = new Set();
let dupes = 0, indexish = 0;
V.forEach(v => {
  if (ids.has(v.id)) dupes++;
  ids.add(v.id);
  if (typeof v.id === "number" || /^\d+$/.test(String(v.id))) indexish++;
});
assert(dupes === 0, "verse ids are unique (" + dupes + " duplicates)");
assert(indexish === 0, "verse ids are not array indices — saves must survive a reorder");
assert(V.every(v => v.id.indexOf(String(v.r).toLowerCase().slice(0, 3).replace(/[^a-z0-9]/g, "")) >= 0 || v.id.length > 4),
  "verse ids derive from the reference");

// Reordering the bank must not change a single id.
const before = V.map(v => v.id).sort().join("|");
const after = V.slice().reverse().map(v => bank.verseId(v)).sort().join("|");
assert(before === after, "ids are stable under reordering");

/* ---------- save migration ---------- */
assert(fs.existsSync(path.join(ROOT, "js", "legacy-ids.js")), "legacy id table generated");
const legacy = fs.readFileSync(path.join(ROOT, "js", "legacy-ids.js"), "utf8");
const table = JSON.parse(legacy.match(/LEGACY_ID_TABLE = (\[[\s\S]*?\]);/)[1]);
const legacyOrder = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "legacy-order.json"), "utf8"));
assert(table.length === legacyOrder.length, "legacy table covers every v2 slot");
const mapped = table.filter(Boolean);
assert(mapped.length > 150, "a substantial share of v2 progress carries over (" + mapped.length + ")");
assert(mapped.every(id => ids.has(id)), "every mapped legacy id points at a verse that still exists");
assert(game.includes("ctv_save_v3"), "save key bumped for the new id scheme");
assert(game.includes("ctv_save_v2"), "v2 saves are still read for migration");
assert(game.includes("function migrateV2"), "v2 migration implemented");

/* ---------- quarantine ---------- */
const quarantine = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "quarantine.json"), "utf8"));
assert(quarantine.length > 0, "quarantine records what was cut");
assert(quarantine.every(q => q.ref && q.reasons && q.reasons.length),
  "every quarantined entry carries a reference and a reason");
/* A quarantined reference may legitimately come back — that is what the
   queue is for, and a re-authored verse often keeps the same blank
   because the blank was rarely what broke. What must never come back is
   the broken set of options, so that is what this asserts. */
const liveByKey = new Map();
V.forEach(v => liveByKey.set(QA.norm(v.r) + "||" + QA.norm(v.a), v));
const reimported = quarantine.filter(q => {
  const v = liveByKey.get(QA.norm(q.ref) + "||" + QA.norm(q.blank));
  return v && JSON.stringify(v.d) === JSON.stringify(q.distractors);
});
assert(reimported.length === 0,
  "no quarantined entry is live with its broken distractors (" +
  reimported.map(q => q.ref).join(", ") + ")");
assert(quarantine.every(q => typeof q.resolved === "boolean"),
  "quarantine tracks which entries have been re-authored");
const resolved = quarantine.filter(q => q.resolved).length;
assert(resolved >= 50,
  "quarantine marks re-authored entries resolved (got " + resolved + ")");
/* Live refs in the bank must not sit open in the queue — otherwise the
   status doc lies about work that is already done. */
const liveRefs = new Set(V.map(v => QA.norm(v.r)));
const falselyOpen = quarantine.filter(q => !q.resolved && liveRefs.has(QA.norm(q.ref)));
assert(falselyOpen.length === 0,
  "no live reference is still marked open in quarantine (" +
  falselyOpen.slice(0, 8).map(q => q.ref).join(", ") + ")");
const qmd = fs.readFileSync(path.join(ROOT, "content", "QUARANTINE.md"), "utf8");
assert(/verses-more\.js/.test(qmd),
  "QUARANTINE.md points re-authors at verses-more.js, not only verses-extra");
assert(new RegExp(resolved + " re-authored").test(qmd),
  "QUARANTINE.md count matches quarantine.json resolved flags");

/* ---------- modes and review systems ---------- */
assert(game.includes('practice:{ key:"practice"'), "drill mode defined");
assert(game.includes('team:{ key:"team"'), "team mode defined");
assert(game.includes('recall:{ key:"recall"'), "recall (typing) mode defined");
assert(game.includes("function drawReviewVerse"), "SRS-driven draw implemented");
assert(!game.includes("function drawPracticeVerse"), "accuracy-weighted draw replaced");
assert(game.includes('R.mode==="recall"'), "recall wired into the run loop");
assert(game.includes("SRS.buildQueue"), "drill order comes from the scheduler");
assert(game.includes("function scheduleReview"), "answers reschedule the verse");
assert(game.includes("SRS.schedule"), "scheduler invoked");
assert(game.includes("function renderTypedQuestion"), "assemble question renderer present");
assert(game.includes("Recall.grade"), "assembled answers are graded");
assert(game.includes("q.d)"), "assemble grading receives the verse's distractors");
assert(game.includes("function typedHint"), "Illuminate adapted for assemble");
assert(game.includes("function queueAdvance"), "question advance goes through the wipe gate");
assert(game.includes("function playWipe"), "rightward wipe helper present");
assert(game.includes("function showState"), "dedicated state screens present");
assert(game.includes("function trialActs"), "Act VI is gated off the trial list");
assert(index.includes('id="wipe-right"'), "wipe overlay is in the markup");
assert(index.includes('id="state-panel"'), "state panel is in the markup");
assert(index.includes('id="asm-bank"') || game.includes('id="asm-bank"'), "assemble bank is rendered");
assert(game.includes("dueToday"), "due count surfaced");

assert(game.includes('endRun("abandon")'), "abandon records via endRun");
assert(game.includes("function shareDailyResult"), "daily share helper");
assert(game.includes("function showTutorialIfNeeded"), "tutorial helper");
assert(game.includes("tutorialDone"), "tutorial persistence flag");
assert(game.includes("VERSES.length"), "menu uses dynamic verse count");

/* ---------- markup and styling for the new surfaces ---------- */
assert(index.includes('id="tutorial"'), "tutorial markup present");
assert(index.includes('id="res-share"'), "share button present");
assert(index.includes('id="res-schedule"'), "next-review panel present");
assert(index.includes('value="due"'), "Study Hall can filter to due verses");
assert(css.includes(".typed-input"), "typed answer styling present");
assert(css.includes(".schedule"), "review schedule styling present");
assert(css.includes("#tutorial"), "tutorial CSS present");
assert(!css.includes("VERSE INTELLIGENCE"), "AI CSS block stripped");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — game structure · verses=" + V.length + " · books=" + Object.keys(counts).length +
  " · passages=" + bank.PASSAGES.length + " · legacy mapped=" + mapped.length);
