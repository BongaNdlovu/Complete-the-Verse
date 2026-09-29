const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/verses-tf.js", "js/beat.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js", "js/live.js", "js/atlas.js", "js/tablets.js"
];

function boot() {
  const sb = makeSandbox();
  const src = PREFIX.concat(ENGINE_FILES).map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });
  return sb;
}
function read(sb, expr) { return vm.runInContext(expr, sb); }
function exec(sb, code) { return vm.runInContext(code, sb); }

// Test 1: Edition module presence and defaults
{
  const sb = boot();
  ok("Edition module is present", read(sb, "typeof Edition !== 'undefined'"));
  eq("default edition is kjv", read(sb, "Edition.getEdition()"), "kjv");
  eq("translationTag returns KJV by default", read(sb, "translationTag()"), "KJV");
  eq("translationName returns King James Version by default", read(sb, "translationName()"), "King James Version");
}

// Test 2: Daily seed divergence across editions
{
  const sb = boot();
  const kjvSeed = read(sb, "seedFromString('ctv-kjv-2026-09-28')");
  const nkjvSeed = read(sb, "seedFromString('ctv-nkjv-2026-09-28')");
  ok("daily seeds differ between kjv and nkjv", kjvSeed !== nkjvSeed);
  const kjvRnd = read(sb, "mulberry32(seedFromString('ctv-kjv-2026-09-28'))()");
  const nkjvRnd = read(sb, "mulberry32(seedFromString('ctv-nkjv-2026-09-28'))()");
  ok("daily mulberry sequence diverges across editions", kjvRnd !== nkjvRnd);
}

// Test 3: Tablet namespacing and save key isolation
{
  const sb = boot();
  eq("tablets editionKey for kjv is plain id", read(sb, "Tablets.editionKey('psalm23')"), "psalm23");
  exec(sb, "Edition.activateEdition('nkjv')");
  eq("tablets editionKey for nkjv has nkjv~ prefix", read(sb, "Tablets.editionKey('psalm23')"), "nkjv~psalm23");
  
  // Set hold in KJV save
  exec(sb, "Edition.activateEdition('kjv'); SAVE.tablets['psalm23'] = { best: 100, held: true }; persist()");
  eq("kjv record shows hold", read(sb, "Tablets.recordOf(SAVE, 'psalm23').held"), true);
  
  // Switch to NKJV; hold must not leak
  exec(sb, "Edition.activateEdition('nkjv')");
  eq("nkjv record does not inherit kjv hold", read(sb, "Tablets.recordOf(SAVE, 'psalm23').held"), false);
  
  // Set hold in NKJV
  exec(sb, "SAVE.tablets['nkjv~psalm23'] = { best: 85, held: true }; persist()");
  eq("nkjv record shows nkjv hold", read(sb, "Tablets.recordOf(SAVE, 'psalm23').held"), true);
  eq("nkjv record has nkjv best", read(sb, "Tablets.recordOf(SAVE, 'psalm23').best"), 85);
  
  // Switch back to KJV; original record remains intact
  exec(sb, "Edition.activateEdition('kjv')");
  eq("kjv record still has original 100% best", read(sb, "Tablets.recordOf(SAVE, 'psalm23').best"), 100);
}

// Test 4: Edition picker and selection flow
{
  const sb = boot();
  eq("fresh save has translationChosen false", read(sb, "SAVE.set.translationChosen"), false);
  exec(sb, "Edition.selectEdition('nkjv')");
  eq("selectEdition sets chosen flag", read(sb, "SAVE.set.translationChosen"), true);
  eq("selectEdition updates translation in save", read(sb, "SAVE.set.translation"), "nkjv");
  eq("active edition is now nkjv", read(sb, "Edition.getEdition()"), "nkjv");
  eq("translationTag reflects NKJV", read(sb, "translationTag()"), "NKJV");
  eq("translationName reflects New King James Version", read(sb, "translationName()"), "New King James Version");
}

// Test 5: Deferred pack isolation
{
  const sb = boot();
  const kjvInitialCount = read(sb, "VERSES.length");
  
  // Switch to NKJV
  exec(sb, "Edition.activateEdition('nkjv')");
  // Register mock NKJV store
  exec(sb, `
    Edition.registerNkjvStore({
      verses: [
        { b: "Genesis", r: "Genesis 1:1", t: 1, p: "In the beginning", a: "God created the heavens and the earth", s: "", d: ["heaven and earth"] }
      ]
    });
  `);
  eq("nkjv active verses matches registered store", read(sb, "VERSES.length"), 1);
  eq("nkjv active verse id is prefixed with nkjv~", read(sb, "VERSES[0].id.startsWith('nkjv~')"), true);
  
  // Absorb deferred pack while NKJV is active
  exec(sb, `
    Edition.absorbDeferred([
      { b: "Exodus", r: "Exodus 1:1", t: 1, p: "Now these are the names", a: "of the children of Israel", s: "", d: ["of Israel"] }
    ]);
  `);
  // Must NOT pollute active NKJV store
  eq("active NKJV bank size unchanged after deferred absorb", read(sb, "VERSES.length"), 1);
  
  // Switch back to KJV
  exec(sb, "Edition.activateEdition('kjv')");
  eq("kjv bank received the absorbed deferred verse", read(sb, "VERSES.length"), kjvInitialCount + 1);
}

// Test 6: In-place array mutation preserves live references
{
  const sb = boot();
  exec(sb, "var liveRef = VERSES; Edition.activateEdition('nkjv'); Edition.activateEdition('kjv');");
  ok("VERSES reference remains identical across switches", read(sb, "liveRef === VERSES"));
}

// Test 7: Dual-edition Daily isolation and high score tracking
{
  const sb = boot();
  // 1. Start in KJV, record a completed daily run for today
  exec(sb, `
    Edition.activateEdition('kjv');
    R.mode = 'daily';
    R.dailyKey = '2026-09-28';
    R.diff = { key: 'disciple' };
    R.qTotal = 20;
    persistRunRecords('complete', { acc: 1.0 }, 1500);
  `);
  eq("KJV daily date is today", read(sb, "SAVE.dailyByEdition.kjv.date"), "2026-09-28");
  eq("KJV daily score is recorded", read(sb, "SAVE.dailyByEdition.kjv.score"), 1500);
  eq("KJV daily best is recorded", read(sb, "SAVE.best.dailyByEdition.kjv"), 1500);
  eq("Active SAVE.daily matches KJV", read(sb, "SAVE.daily.score"), 1500);
  eq("Active SAVE.best.daily matches KJV", read(sb, "SAVE.best.daily"), 1500);

  // 2. Switch to NKJV; NKJV daily must be unplayed today
  exec(sb, "Edition.activateEdition('nkjv')");
  eq("NKJV daily has not been played today", read(sb, "SAVE.dailyByEdition.nkjv.date"), "");
  eq("Active SAVE.daily date is empty for NKJV", read(sb, "SAVE.daily.date"), "");
  eq("Active SAVE.best.daily is 0 for NKJV", read(sb, "SAVE.best.daily"), 0);

  // 3. Complete NKJV daily run for today
  exec(sb, `
    R.mode = 'daily';
    R.dailyKey = '2026-09-28';
    R.diff = { key: 'disciple' };
    R.qTotal = 20;
    persistRunRecords('complete', { acc: 1.0 }, 1850);
  `);
  eq("NKJV daily date is today", read(sb, "SAVE.dailyByEdition.nkjv.date"), "2026-09-28");
  eq("NKJV daily score is recorded", read(sb, "SAVE.dailyByEdition.nkjv.score"), 1850);
  eq("NKJV daily best is recorded", read(sb, "SAVE.best.dailyByEdition.nkjv"), 1850);
  eq("Active SAVE.daily matches NKJV", read(sb, "SAVE.daily.score"), 1850);
  eq("Active SAVE.best.daily matches NKJV", read(sb, "SAVE.best.daily"), 1850);

  // 4. Switch back to KJV; KJV records are unaltered
  exec(sb, "Edition.activateEdition('kjv')");
  eq("KJV daily score unchanged", read(sb, "SAVE.daily.score"), 1500);
  eq("KJV daily best unchanged", read(sb, "SAVE.best.daily"), 1500);
}

// Test 8: Grep gate — No player-facing "KJV" while translation is "nkjv"
{
  const sb = boot();
  exec(sb, "Edition.activateEdition('nkjv')");
  eq("translationTag is NKJV", read(sb, "translationTag()"), "NKJV");
  eq("translationName is New King James Version", read(sb, "translationName()"), "New King James Version");

  // Share daily string uses NKJV tag
  exec(sb, `
    var sharedText = "";
    navigator.clipboard = { writeText: function(t){ sharedText = t; return Promise.resolve(); } };
    R.mode = 'daily';
    R.correct = 20;
    R.attempts = 20;
    shareDailyResult(1850);
  `);
  ok("share text contains NKJV", read(sb, "sharedText.includes('NKJV')"));
  ok("share text does not contain KJV tag", read(sb, "!sharedText.includes(' · KJV')"));

  // Illuminate label
  exec(sb, "R.currentMechanic = 'duel'");
  eq("illuminate label uses translationTag", read(sb, "illuminateLabel()"), "reveal NKJV cue");

  // Static grep gate across source files: ensure no hardcoded player-facing " — KJV"
  const playSrc = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
  const seqSrc = fs.readFileSync(path.join(ROOT, "js", "sequences.js"), "utf8");
  const tabRunSrc = fs.readFileSync(path.join(ROOT, "js", "tablets-run.js"), "utf8");
  
  ok("play.js has no hardcoded ' — KJV'", !playSrc.includes('" — KJV"'));
  ok("sequences.js has no hardcoded ' — KJV'", !seqSrc.includes('" — KJV"'));
  ok("tablets-run.js has no hardcoded fallback 'KJV'", !tabRunSrc.includes('ch.subtitle || "KJV"'));
  ok("play.js duel prompt is edition-neutral", !playSrc.includes("the genuine King James reading"));
}

// Test 9: Onboarding twin — NKJV tutorial questions swap
{
  const sb = boot();
  const kjvTutCount = read(sb, "TUTORIAL_QUESTIONS.length");
  const kjvFirstA = read(sb, "TUTORIAL_QUESTIONS[0].a");

  // Register mock NKJV tutorial questions
  exec(sb, `
    Edition.registerNkjvStore({
      tutorial: [
        { id: "tutorial-1", r: "Psalm 23:1", p: "The LORD is my shepherd;", a: "I shall not want", s: "", d: ["I lack nothing"] }
      ]
    });
  `);
  exec(sb, "Edition.activateEdition('nkjv')");
  eq("NKJV active tutorial questions length is 1", read(sb, "TUTORIAL_QUESTIONS.length"), 1);
  eq("NKJV active tutorial answer is updated", read(sb, "TUTORIAL_QUESTIONS[0].a"), "I shall not want");

  // Switch back to KJV restores original tutorial questions
  exec(sb, "Edition.activateEdition('kjv')");
  eq("KJV tutorial count restored", read(sb, "TUTORIAL_QUESTIONS.length"), kjvTutCount);
  eq("KJV first tutorial answer restored", read(sb, "TUTORIAL_QUESTIONS[0].a"), kjvFirstA);
}

// Test 10: The hall card locks the translation until Start over
{
  const sb = boot();
  exec(sb, `
    currentView = "menu";
    SAVE.set.translationChosen = false;
    SAVE.pilgrim.sites = { ur: { cleared: true } };
    SAVE.oil = 7;
    showEditionGate();
  `);
  eq("the choice card pauses the hall", read(sb, "$('v-edition').classList.contains('on')"), true);
  eq("the hall stays up under the card", read(sb, "currentView"), "menu");
  exec(sb, "Edition.selectEdition('nkjv')");
  eq("choosing closes the card", read(sb, "$('v-edition').classList.contains('on')"), false);
  eq("choosing keeps the road", read(sb, "SAVE.pilgrim.sites.ur.cleared"), true);
  eq("choosing keeps oil", read(sb, "SAVE.oil"), 7);
  exec(sb, "currentView = 'menu'; showEditionGate(); Edition.selectEdition('kjv');");
  eq("start over can return to KJV", read(sb, "Edition.getEdition()"), "kjv");
  eq("start over still keeps the road", read(sb, "SAVE.pilgrim.sites.ur.cleared"), true);
  exec(sb, "go('settings')");
  const settings = read(sb, "$('settings-body').innerHTML");
  ok("settings does not offer a translation switch", settings.indexOf('data-seg="translation"') < 0);
  ok("settings says the translation is locked", settings.indexOf("Locked for this game") >= 0);
  exec(sb, "R.running = true; R.ended = false; currentView = 'menu'; showEditionGate();");
  eq("a live run does not open the choice card", read(sb, "$('v-edition').classList.contains('on')"), false);
}

if (fail) {
  console.log("FAIL — edition · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — edition · " + pass + " assertions");

