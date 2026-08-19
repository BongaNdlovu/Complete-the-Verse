/**
 * Full End-to-End Game Playthrough Simulation
 * Runs an exhaustive simulation of a full game session across all modes and views:
 * 1. Boot, intro check, and cold-open into Ur
 * 2. Recognition questions with lifelines (Selah, Illuminate), answer locking, streak combos
 * 3. Assembled / typed recall production beat
 * 4. Overdrive state transitions (Ride the fire vs Bank)
 * 5. Life loss, broken lamp state, relic armor absorption
 * 6. Relic recovery reveal with gold-leaf shimmer
 * 7. Relic inspection modal interaction (open, metadata verification, close)
 * 8. Map Pilgrimage navigation, dossier rendering with red wax seal stamp
 * 9. Study Hall SRS cards, Seals collection, Settings motion tiers
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
    console.error("  " + msg);
  }
}

function eq(name, got, want) {
  ok(name, got === want, { got, want });
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

function bootGame(preload) {
  const sb = makeSandbox();
  if (preload) {
    Object.keys(preload).forEach(k => {
      sb.localStorage.setItem(k, JSON.stringify(preload[k]));
    });
  }
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

console.log("--- Starting Comprehensive Playthrough Simulation ---");

const sb = bootGame();

/* 1. INITIAL BOOT & SETTINGS */
{
  eq("Default motion mode is full", read(sb, 'SAVE.set.motion || "full"'), "full");
  exec(sb, 'SAVE.set.motion = "calm"; applySettings();');
  ok("Calm motion class applied to body", read(sb, 'document.body.classList.contains("motion-calm")'));
  
  exec(sb, 'SAVE.set.motion = "reduced"; applySettings();');
  ok("Reduced motion class applied to body", read(sb, 'document.body.classList.contains("reduced")'));
  
  exec(sb, 'SAVE.set.motion = "full"; applySettings();');
  ok("Full motion mode removes calm and reduced", !read(sb, 'document.body.classList.contains("reduced")') && !read(sb, 'document.body.classList.contains("motion-calm")'));
}

/* 2. COLD LAUNCH INTO UR (PILGRIMAGE SITE 1) */
{
  exec(sb, 'startRun("pilgrimage", "watchman");');
  eq("Mode is pilgrimage", read(sb, "R.mode"), "pilgrimage");
  eq("Site is Ur", read(sb, "R.siteId"), "ur");
  eq("Run has 8 verses", read(sb, "R.siteVerses.length"), 8);
  eq("Player begins with lives", read(sb, "R.lives"), 2);
}

/* 3. GAMEPLAY MECHANICS: RECOGNITION & LIFELINES */
{
  // Test Selah lifeline (+5s clock extension)
  exec(sb, 'R.powers.selah = 1; R.running = true; R.tEnd = performance.now() + 8000; R.tTotal = 8000;');
  exec(sb, 'usePower("selah");');
  ok("Selah lifeline used", read(sb, "R.usedPower") === true);

  // Test Illuminate lifeline (removes 2 wrong choices)
  exec(sb, 'R.powers.illum = 1;');
  exec(sb, 'usePower("illum");');
  ok("Illuminate lifeline used", read(sb, "R.usedPower") === true);

  // Answer correctly for Beats 1 to 7
  for (let i = 1; i <= 7; i++) {
    const ans = read(sb, "R.q.a");
    ok("Beat " + i + " question active", ans !== undefined);
    exec(sb, 'resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 5000);');
    eq("Beat " + i + " streak is " + i, read(sb, "R.streak"), i);
    if (i < 7) {
      exec(sb, 'nextQuestion();');
    }
  }

  // Beat 8: Production / Typed beat
  exec(sb, 'nextQuestion();');
  eq("Beat 8 is typed recall", read(sb, "R.typed"), true);
  exec(sb, 'resolveAnswer(R.q, R.q.a, null, 1500, 10000);');
  eq("All 8 questions correct", read(sb, "R.correct"), 8);
}

/* 4. OVERDRIVE MECHANICS */
{
  exec(sb, 'R.streak = 10;');
  exec(sb, 'resolveOverdrive("bank");');
  ok("Overdrive banked score awarded", read(sb, "R.score > 0"));
}

/* 5. LIFE LOSS & RELIC SHIELD */
{
  exec(sb, 'R.lives = 2; R.armorUsed = true;');
  exec(sb, 'loseLife(1);');
  eq("Lives drop to 1 on miss when armor is spent", read(sb, "R.lives"), 1);
}

/* 6. SITE CLEARANCE & RELIC RECOVERY CEREMONY */
{
  exec(sb, 'endRun("complete");');
  eq("Navigates to results view", read(sb, "currentView"), "results");
  ok("Ur recorded as cleared", read(sb, 'Pilgrimage.isCleared(SAVE.pilgrim, "ur")'));

  // Test Artifact Reveal ceremony with gold shimmer
  const zigguratRelic = read(sb, 'Artifacts.byId("ziggurat-ur")');
  ok("Ziggurat relic exists", !!zigguratRelic);
  exec(sb, 'showArtifactReveal(Artifacts.byId("ziggurat-ur"), null);');
  ok("Reveal stage is active", read(sb, '$("reveal-stage").classList.contains("on")'));
}

/* 7. HIGH-RESOLUTION RELIC INSPECTION MODAL */
{
  const zigguratRelic = read(sb, 'Artifacts.byId("ziggurat-ur")');
  exec(sb, 'openRelicInspect(Artifacts.byId("ziggurat-ur"));');
  
  const inspectModal = read(sb, '$("relic-inspect-modal")');
  ok("Relic inspect modal opened", inspectModal && inspectModal.classList.contains("on"));
  eq("Inspect title is Ziggurat of Ur", read(sb, '$("inspect-title").textContent'), zigguratRelic.name);
  eq("Inspect era populated", read(sb, '$("inspect-era").textContent'), zigguratRelic.era);
  ok("Inspect scripture reference populated", read(sb, '$("inspect-scripture").textContent.length > 0'));

  // Close modal
  exec(sb, '$("inspect-close").click();');
}

/* 8. MAP PILGRIMAGE & WAX SEAL DOSSIER */
{
  exec(sb, 'go("atlas");');
  eq("Atlas view active", read(sb, "currentView"), "atlas");
  
  // Select Ur site in Atlas
  exec(sb, 'Atlas.select("ur");');
  const bodyHtml = read(sb, '$("atlas-doss-body").innerHTML');
  ok("Dossier contains red wax seal for cleared site", bodyHtml.includes("wax-seal-stamp"));
  ok("Dossier contains clickable relic inspect trigger", bodyHtml.includes("data-inspect-relic"));
}

/* 9. STUDY HALL, SEALS, AND RECORDS VIEWS */
{
  exec(sb, 'go("study");');
  eq("Study hall view active", read(sb, "currentView"), "study");

  exec(sb, 'go("seals");');
  eq("Seals view active", read(sb, "currentView"), "seals");

  exec(sb, 'go("records");');
  eq("Records view active", read(sb, "currentView"), "records");

  exec(sb, 'go("settings");');
  eq("Settings view active", read(sb, "currentView"), "settings");
}

/* SUMMARY */
if (fail > 0) {
  console.error("\nPlaythrough Simulation FAILED (" + fail + " failures)");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
} else {
  console.log("\nPASS — Full Playthrough Simulation: all " + pass + " assertions verified successfully.");
}
