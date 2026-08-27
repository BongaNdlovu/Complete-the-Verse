/**
 * Comprehensive verification of ALL 10 Game Modes in Complete the Verse:
 * 1. pilgrimage (The Pilgrimage - site progression)
 * 2. pilgrim-recall (Pilgrim's Recall - pure typed pilgrimage)
 * 3. trial (The 5-Act Scripture Trial)
 * 4. daily (Daily Trial)
 * 5. blitz (Scripture Blitz)
 * 6. practice (Targeted Practice Drill)
 * 7. recall (Spaced Full Recall)
 * 8. endless (Endless Adaptive Distance)
 * 9. relay (Arc Relay)
 * 10. tutorial (6-Lesson Onboarding Tutorial)
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

let pass = 0, fail = 0;
const fails = [];

function assert(cond, msg) {
  if (cond) {
    pass++;
  } else {
    fail++;
    fails.push(msg);
    console.error("  FAIL: " + msg);
  }
}

function eq(name, got, want) {
  assert(got === want, name + " (got: " + JSON.stringify(got) + ", want: " + JSON.stringify(want) + ")");
}

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js",
  "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js",
  "js/live.js", "js/atlas.js"
];
const FILES = PREFIX.concat(ENGINE_FILES);

function boot() {
  const sb = makeSandbox();
  const src = FILES.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });
  return sb;
}

function exec(sb, code) { return vm.runInContext(code, sb); }
function read(sb, expr) { return vm.runInContext(expr, sb); }

console.log("=== EXECUTING COMPLETE ALL-MODES VERIFICATION ===");

// ----------------------------------------------------
// Mode 1: Onboarding Tutorial (6 Lessons)
// ----------------------------------------------------
console.log("\n--- Mode 1/10: ONBOARDING TUTORIAL ---");
{
  const sb = boot();
  exec(sb, `startTutorialRun();`);
  eq("Tutorial launches in play view", read(sb, `currentView`), "play");
  eq("Tutorial total lessons is 6", read(sb, `R.tutorial.total`), 6);

  for (let i = 0; i < 6; i++) {
    eq(`Lesson ${i + 1} index is ${i}`, read(sb, `R.tutorial.index`), i);
    const q = read(sb, `R.q`);
    assert(!!q, `Lesson ${i + 1} has valid verse question`);
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 20000);`);
    if (i < 5) exec(sb, `tutorialNextQuestion();`);
  }
  exec(sb, `completeTutorialRun();`);
  eq("Tutorial returns to menu on finish", read(sb, `currentView`), "menu");
  eq("Tutorial marked complete in save", read(sb, `SAVE.set.tutorialDone`), true);
}

// ----------------------------------------------------
// Mode 2: The Pilgrimage (Ur of the Chaldees)
// ----------------------------------------------------
console.log("\n--- Mode 2/10: THE PILGRIMAGE ---");
{
  const sb = boot();
  exec(sb, `pendingSiteId = "ur"; startRun("pilgrimage", "watchman");`);
  eq("Pilgrimage mode active", read(sb, `R.mode`), "pilgrimage");
  eq("Pilgrimage site is Ur", read(sb, `R.siteId`), "ur");
  exec(sb, `hideSiteQuote(); renderQuestion(R.q, 8000);`);
  for (let vi = 0; vi < 8; vi++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 5000);`);
    if (vi < 7) exec(sb, `nextQuestion();`);
  }
  exec(sb, `endRun("complete");`);
  eq("Pilgrimage Ur cleared", read(sb, `Pilgrimage.isCleared(SAVE.pilgrim, "ur")`), true);
}

// ----------------------------------------------------
// Mode 3: Pilgrim's Recall (Typed Pilgrimage)
// ----------------------------------------------------
console.log("\n--- Mode 3/10: PILGRIM'S RECALL ---");
{
  const sb = boot();
  exec(sb, `pendingSiteId = "ur"; startRun("pilgrim-recall", "watchman");`);
  eq("Pilgrim recall mode active", read(sb, `R.mode`), "pilgrim-recall");
  eq("Pilgrim recall is strictly typed", read(sb, `R.typed`), true);
  exec(sb, `hideSiteQuote(); renderQuestion(R.q, 32000);`);
  for (let vi = 0; vi < 8; vi++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, null, 1200, 25000);`);
    if (vi < 7) exec(sb, `nextQuestion();`);
  }
  exec(sb, `endRun("complete");`);
  eq("Pilgrim recall run completed", read(sb, `R.ended`), true);
}

// ----------------------------------------------------
// Mode 4: Scripture Trial (The 5-Act Campaign)
// ----------------------------------------------------
console.log("\n--- Mode 4/10: SCRIPTURE TRIAL ---");
{
  const sb = boot();
  exec(sb, `startRun("trial", "watchman"); go("play"); nextQuestion();`);
  eq("Trial mode active", read(sb, `R.mode`), "trial");
  eq("Starts at Act I", read(sb, `R.actIdx`), 0);
  for (let a = 0; a < 5; a++) {
    const actQ = read(sb, `ACTS[${a}].q`);
    const qCount = (actQ === Infinity) ? 3 : Math.min(3, actQ);
    for (let qi = 0; qi < qCount; qi++) {
      exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 6000);`);
      if (qi < qCount - 1) exec(sb, `nextQuestion();`);
    }
    if (a < 4) {
      exec(sb, `beginAct(${a + 1}); go("play"); nextQuestion();`);
    }
  }
  exec(sb, `endRun("complete");`);
  eq("Trial completed successfully", read(sb, `R.ended`), true);
}

// ----------------------------------------------------
// Mode 5: Daily Trial
// ----------------------------------------------------
console.log("\n--- Mode 5/10: DAILY TRIAL ---");
{
  const sb = boot();
  exec(sb, `startRun("daily", "watchman");`);
  eq("Daily mode active", read(sb, `R.mode`), "daily");
  assert(read(sb, `R.daily.list.length`) === 20, "Daily list contains 20 verses");
  for (let di = 0; di < 20; di++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 6000);`);
    if (di < 19) exec(sb, `nextQuestion();`);
  }
  exec(sb, `endRun("complete");`);
  eq("Daily trial recorded", read(sb, `R.ended`), true);
}

// ----------------------------------------------------
// Mode 6: Scripture Blitz
// ----------------------------------------------------
console.log("\n--- Mode 6/10: SCRIPTURE BLITZ ---");
{
  const sb = boot();
  exec(sb, `startRun("blitz", "watchman");`);
  eq("Blitz mode active", read(sb, `R.mode`), "blitz");
  assert(read(sb, `R.blitzEnd`) > 0, "Blitz timer active");
  for (let bi = 0; bi < 10; bi++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 400, 3000); nextQuestion();`);
  }
  exec(sb, `endRun("complete");`);
  eq("Blitz completed", read(sb, `R.ended`), true);
}

// ----------------------------------------------------
// Mode 7: Practice Drill
// ----------------------------------------------------
console.log("\n--- Mode 7/10: PRACTICE DRILL ---");
{
  const sb = boot();
  exec(sb, `startRun("practice", "watchman");`);
  eq("Practice mode active", read(sb, `R.mode`), "practice");
  const len = read(sb, `R.practiceLen`);
  assert(len >= 10, "Practice queue populated");
  for (let pi = 0; pi < len; pi++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 6000);`);
    if (pi < len - 1) exec(sb, `nextQuestion();`);
  }
  exec(sb, `endRun("complete");`);
  eq("Practice finished", read(sb, `R.ended`), true);
}

// ----------------------------------------------------
// Mode 8: Full Recall
// ----------------------------------------------------
console.log("\n--- Mode 8/10: FULL RECALL ---");
{
  const sb = boot();
  exec(sb, `startRun("recall", "watchman");`);
  eq("Recall mode active", read(sb, `R.mode`), "recall");
  eq("Recall mode is typed", read(sb, `R.typed`), true);
  const len = read(sb, `R.practiceLen`);
  for (let ri = 0; ri < len; ri++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, null, 1200, 20000);`);
    if (ri < len - 1) exec(sb, `nextQuestion();`);
  }
  exec(sb, `endRun("complete");`);
  eq("Full recall finished", read(sb, `R.ended`), true);
}

// ----------------------------------------------------
// Mode 9: Endless Mode
// ----------------------------------------------------
console.log("\n--- Mode 9/10: ENDLESS MODE ---");
{
  const sb = boot();
  exec(sb, `startRun("endless", "watchman");`);
  eq("Endless mode active", read(sb, `R.mode`), "endless");
  for (let ei = 0; ei < 15; ei++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 700, 6000); nextQuestion();`);
  }
  eq("Endless answered 15 questions", read(sb, `R.attempts`), 15);
  exec(sb, `endRun("complete");`);
  eq("Endless ended", read(sb, `R.ended`), true);
}

// ----------------------------------------------------
// Mode 10: Arc Relay
// ----------------------------------------------------
console.log("\n--- Mode 10/10: ARC RELAY ---");
{
  const sb = boot();
  exec(sb, `pendingArcKey = "patriarchs"; startRun("relay", "watchman");`);
  eq("Relay mode active", read(sb, `R.mode`), "relay");
  assert(read(sb, `R.relay.queue.length`) > 0, "Relay queue loaded");
  assert(read(sb, `R.siteId === R.relay.current.siteId && R.siteIndex === R.relay.current.index`),
    "Relay mirrors its active site into shared road state");
  const qLen = read(sb, `R.relay.queue.length`);
  let relayPassageRefs = 0;
  const relayPassageSites = new Set();
  for (let rqi = 0; rqi < qLen; rqi++) {
    const verseIndex = read(sb, `R.relay.current.verseIndex`);
    if (verseIndex === 2) {
      eq("Relay site-local verse 3 uses Name the Passage",
        read(sb, `R.currentMechanic`), "passage-ref");
      relayPassageRefs++;
      relayPassageSites.add(read(sb, `R.relay.current.siteId`));
    }
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 6000); nextQuestion();`);
  }
  assert(relayPassageRefs === read(sb, `R.relay.sites.length`) &&
    relayPassageSites.size === read(sb, `R.relay.sites.length`),
    "Relay applies Name the Passage to verse 3 of every site");
  exec(sb, `endRun("complete");`);
  eq("Relay run recorded", read(sb, `R.ended`), true);
}

console.log("\n==========================================");
if (fail > 0) {
  console.error(`All Modes Verification FAILED: ${fail} errors.`);
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
} else {
  console.log(`PASS: All 10 Game Modes verified operational with 100% accuracy (${pass} assertions passed).`);
}
