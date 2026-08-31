/**
 * End-to-End Game Elements & UI Component Test Suite
 * Exhaustively tests all UI elements, views, buttons, dialogs, transitions,
 * and game state interactions in a live VM sandbox environment.
 * Run: node e2e-game-elements.test.js
 */

const fs = require("fs");
const ROOT = require("../scripts/repo-root");
const path = require("path");
const vm = require("vm");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

let pass = 0, fail = 0;
const fails = [];

function ok(name, cond, extra) {
  if (cond) {
    pass++;
  } else {
    fail++;
    const msg = "FAIL: " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "");
    fails.push(msg);
    console.log("  " + msg);
  }
}

function eq(name, got, want) {
  ok(name, got === want, { got, want });
}

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js",
  "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/live.js", "js/atlas.js"
];
const FILES = PREFIX.concat(ENGINE_FILES);

function boot(preload) {
  const sb = makeSandbox();
  if (preload) sb.localStorage.setItem(preload.key, JSON.stringify(preload.value));
  const src = FILES.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });
  return sb;
}

function read(sb, expr) {
  return vm.runInContext(expr, sb);
}

function exec(sb, code) {
  return vm.runInContext(code, sb);
}

const sb = boot();

/* ==================================================================
   SECTION 1: ROUTING, VIEWS, AND NAVIGATION
   ================================================================== */
{
  const views = ["boot", "intro", "menu", "play", "results", "atlas", "relics", "seals", "settings", "records", "journal"];
  views.forEach(v => {
    exec(sb, 'go("' + v + '");');
    eq("Router switches to " + v + " view", read(sb, "currentView"), v);
  });
}

/* ==================================================================
   SECTION 2: FRONT DOOR & COLD LAUNCH INTO UR
   ================================================================== */
{
  exec(sb, 'go("boot");');
  exec(sb, 'startRun("pilgrimage", SAVE.set.diff);');
  eq("Active mode is pilgrimage", read(sb, "R.mode"), "pilgrimage");
  eq("Cold launch starts at Ur", read(sb, "R.siteId"), "ur");
  eq("Pilgrimage level has 8 verses", read(sb, "R.siteVerses.length"), 8);
  eq("Initial score is 0", read(sb, "R.score"), 0);
  eq("Initial streak is 0", read(sb, "R.streak"), 0);
  eq("Player starts with Disciple lamps", read(sb, "R.lives"), 3);
}

/* ==================================================================
   SECTION 3: 8-BEAT COFFEE RUNTHROUGH & INTERACTION MECHANICS
   ================================================================== */
{
  // Beat 1: Recognition question
  eq("Beat 1 index is 1", read(sb, "R.siteIdx"), 1);
  const q1Prefix = read(sb, "R.q.p");
  const q1Ans = read(sb, "R.q.a");
  ok("Beat 1 has question text and answer", q1Prefix !== undefined && q1Ans !== undefined);

  // Resolve answer correctly
  exec(sb, 'resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 1200, 8000);');
  eq("Beat 1 correct increments streak", read(sb, "R.streak"), 1);
  ok("Beat 1 increments score", read(sb, "R.score > 0"));

  // Advance through beats 2 to 7
  for (let b = 2; b <= 7; b++) {
    exec(sb, 'nextQuestion();');
    const qAns = read(sb, "R.q.a");
    ok("Beat " + b + " loads verse", qAns !== undefined);
    exec(sb, 'resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 1000, 5000);');
    eq("Streak increments to " + b, read(sb, "R.streak"), b);
  }

  // Beat 8: Production / Typed beat
  exec(sb, 'nextQuestion();');
  eq("Beat 8 is typed / assembled recall", read(sb, "R.typed"), true);
  ok("Beat 8 verse loaded", read(sb, "!!R.q"));

  // Resolve Beat 8
  exec(sb, 'resolveAnswer(R.q, R.q.a, null, 2500, 15000);');
  eq("Streak reaches 8", read(sb, "R.streak"), 8);
  eq("All 8 questions answered correctly", read(sb, "R.correct"), 8);
}

/* ==================================================================
   SECTION 4: COMBO CELEBRATIONS & OVERDRIVE
   ================================================================== */
{
  exec(sb, 'Cinematic.showComboStamp(3, 1.25);');
  exec(sb, 'Cinematic.showComboStamp(5, 1.5);');
  exec(sb, 'Cinematic.showComboStamp(8, 2.0);');
  exec(sb, 'Cinematic.showComboStamp(12, 3.0);');
  exec(sb, 'Cinematic.showOverdriveEntrance();');

  const stampOverlay = read(sb, '!!$("combo-stamp-overlay")');
  ok("Combo stamp overlay element rendered", stampOverlay);

  // Miss collapse animation
  exec(sb, 'Cinematic.showComboCollapse();');
  const collapseEl = read(sb, '!!$("combo-collapse-flash")');
  ok("Combo collapse flash element rendered", collapseEl);
}

/* ==================================================================
   SECTION 5: PAUSE DIALOG & QUIET DOORS
   ================================================================== */
{
  exec(sb, 'setPaused(true);');
  ok("Game state pauses", read(sb, "R.paused"));
  
  exec(sb, 'setPaused(false);');
  ok("Game resumes", !read(sb, "R.paused"));

  // Quiet doors navigation
  exec(sb, 'go("relics");');
  eq("Relics view opened", read(sb, "currentView"), "relics");

  exec(sb, 'go("atlas");');
  eq("Atlas view opened", read(sb, "currentView"), "atlas");

  exec(sb, 'go("settings");');
  eq("Settings view opened", read(sb, "currentView"), "settings");
}

/* ==================================================================
   SECTION 6: COMPLETION & 7-DAY HABIT STREAK REWARD
   ================================================================== */
{
  // Complete run on Ur
  exec(sb, 'go("play"); R.mode = "pilgrimage"; R.siteId = "ur";');
  exec(sb, 'endRun("complete");');
  eq("Results view displayed", read(sb, "currentView"), "results");
  ok("Ur is cleared in pilgrim save", read(sb, 'Pilgrimage.isCleared(SAVE.pilgrim, "ur")'));

  // Check habit streak increment
  ok("Habit streak counted 1 day", read(sb, "SAVE.habit.count >= 1"));

  // Simulate 7-day habit streak
  exec(sb, 'R.ended = false; R.mode = "pilgrimage"; R.siteId = "ur"; SAVE.habit.count = 7; endRun("complete");');
  ok("Seventh Lamp seal awarded on Day 7", read(sb, 'hasSeal("seventh-lamp")'));

  // Trigger Seventh Lamp cinematic
  exec(sb, 'Cinematic.playSeventhLamp({ streak: 7 });');
  const slEl = read(sb, '!!$("seventh-lamp-cinematic")');
  ok("Seventh Lamp cinematic overlay created", slEl);
}

/* ==================================================================
   SECTION 7: SPIRAL PROGRESSION
   ================================================================== */
{
  // Reset pilgrim pass to 1 and clear all 46 sites
  exec(sb, `
    SAVE.pilgrim.pass = 1;
    SITES.forEach(s => {
      SAVE.pilgrim.sites[s.id] = { cleared: true, attempts: 1, best: 8, correct: 8, stars: 3 };
    });
  `);

  const overviewComplete = read(sb, "Pilgrimage.overview(SAVE.pilgrim).complete");
  eq("All 46 sites cleared", overviewComplete, true);

  const advancedPass = read(sb, "Pilgrimage.advanceSpiral(SAVE.pilgrim).pass");
  eq("Advancing spiral unlocks Pass 2", advancedPass, 2);
  const pass2Title = read(sb, "Pilgrimage.passStandard(2).title");
  eq("Pass 2 is The Watchman", pass2Title, "The Watchman");
}

/* ==================================================================
   SUMMARY
   ================================================================== */
if (fail) {
  console.log("\nFAIL — e2e game elements · " + pass + " passed · " + fail + " failed");
  process.exit(1);
} else {
  console.log("PASS — e2e game elements · all " + pass + " assertions passed");
}
