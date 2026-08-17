/* Logic tests — the wiring, not the pieces.
 *
 * srs.test.js and recall.test.js prove the scheduler and the grader are
 * correct in isolation. Neither would notice if game.js called them with
 * the wrong arguments, forgot to persist, or scheduled the answer to the
 * previous question. This boots the real js/game.js against a DOM shim
 * and drives actual runs through it.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeSandbox } = require("./scripts/test-shim");
const { ENGINE_FILES } = require("./scripts/engine-source");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
const eq = (name, got, want) => ok(name, got === want, {got, want});

/* Same order as index.html. The Pilgrimage files are included because
   game.js now calls into them at boot — and because booting them in a
   sandbox with no Leaflet and no fetch is exactly the degradation path
   they are supposed to survive. */
/* Same order as index.html. The sandbox deliberately OMITS
   verses-more.js, polish.js, cloud-config.js and cloud.js: game.js must
   boot (with guarded fallbacks) without them. The engine tail comes
   from scripts/engine-source.js — one list, shared with index.html
   order checks (engine-modules.test.js). */
const PREFIX = ["js/verses.js","js/verses-extra.js","js/passages.js","js/legacy-ids.js",
               "js/bank.js","js/srs.js","js/recall.js",
               "js/assemble.js","js/meta.js","js/flow.js",
               "js/sites.js","js/empires.js","js/geo.js","js/pilgrimage.js",
               "js/live.js","js/atlas.js"];
const FILES = PREFIX.concat(ENGINE_FILES);
function boot(preload){
  const sb = makeSandbox();
  if(preload) sb.localStorage.setItem(preload.key, JSON.stringify(preload.value));
  const src = FILES.map(f => fs.readFileSync(path.join(__dirname, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, {filename:"bundle.js"});
  return sb;
}
function read(sb, expr){ return vm.runInContext(expr, sb); }

/* ---------- it boots at all ---------- */
let sb;
try {
  sb = boot();
  ok("the whole bundle boots without throwing", true);
} catch(e){
  ok("the whole bundle boots without throwing", false, e.message + "\n" + String(e.stack).split("\n").slice(0,4).join("\n"));
  console.log((fail ? "FAIL" : "PASS") + " — integration · " + pass + " passed, " + fail + " failed");
  process.exit(1);
}

eq("bank is exposed to the game", read(sb, "VERSES.length"), 305);
eq("SRS is available to the game", read(sb, "typeof SRS.schedule"), "function");
eq("Recall is available to the game", read(sb, "typeof Recall.grade"), "function");
eq("a fresh save has no schedule", read(sb, "Object.keys(SAVE.srs).length"), 0);
eq("a fresh save reports nothing due", read(sb, "dueToday()"), 0);
/* One ordeal. A new player meets Watchman: two lamps, clock ×0.85. */
eq("a fresh save plays Watchman", read(sb, "SAVE.set.diff"), "watchman");
eq("the printed clock matches the pure helper",
   read(sb, "pacedClockMs(14000, 1, 1500)"), read(sb, "Math.round((14000 * 1 + 1500) * PACE + FLAT_ADD_MS)"));
eq("the Disciple-era helper still prints 23.6s at ×1", read(sb, "pacedClockMs(14000, 1, 1500)"), 23600);
eq("Watchman clock is ×0.85", read(sb, "resolveDiff().time"), 0.85);
eq("Watchman has two lamps", read(sb, "resolveDiff().lives"), 2);
eq("Watchman score is unboosted", read(sb, "resolveDiff().score"), 1);
read(sb, "startRun('practice','disciple')");
eq("a Disciple startRun is Watchman", read(sb, "R.diff.key"), "watchman");
eq("a Disciple startRun gets two lamps", read(sb, "R.lives"), 2);
read(sb, "invalidateRun();");
{
  const migrated = boot({key:"ctv_save_v3", value:{
    v:3, xp:0, runs:0, seals:[],
    best:{}, life:{}, books:{}, verse:{}, srs:{}, board:[],
    daily:{date:"", score:0}, set:{diff:"disciple"}
  }});
  eq("an old Disciple save becomes Watchman", read(migrated, "SAVE.set.diff"), "watchman");
}

/* ---------- a Drill run schedules what it asks ---------- */
{
  const s = boot();
  read(s, "startRun('practice','disciple')");
  eq("the drill builds a queue", read(s, "R.queue.length > 0"), true);
  eq("the drill is 15 verses long", read(s, "R.practiceLen"), 15);
  eq("the drill does not use the typing path", read(s, "R.typed"), false);

  // Answer the first question correctly, the way the UI would.
  read(s, "R.q = drawReviewVerse(); R.tTotal = 12000;");
  const id = read(s, "R.q.id");
  read(s, "scheduleReview(R.q, {correct:true, fraction:0.3})");
  eq("answering creates a card", read(s, "!!SAVE.srs[" + JSON.stringify(id) + "]"), true);
  eq("a correct answer schedules one day out", read(s, "SAVE.srs[" + JSON.stringify(id) + "].ivl"), 1);
  eq("a correct answer counts a rep", read(s, "SAVE.srs[" + JSON.stringify(id) + "].reps"), 1);
  eq("the run records the reschedule", read(s, "R.rescheduled.length"), 1);

  // A wrong answer on a well-known verse must send it back to tomorrow.
  read(s, "SAVE.srs[" + JSON.stringify(id) + "] = SRS.schedule(SAVE.srs[" + JSON.stringify(id) + "], 5, today());");
  read(s, "SAVE.srs[" + JSON.stringify(id) + "] = SRS.schedule(SAVE.srs[" + JSON.stringify(id) + "], 5, today());");
  ok("a practised verse earns a long gap", read(s, "SAVE.srs[" + JSON.stringify(id) + "].ivl") > 1);
  read(s, "scheduleReview(VERSES.find(v=>v.id===" + JSON.stringify(id) + "), {correct:false})");
  eq("a miss resets the interval", read(s, "SAVE.srs[" + JSON.stringify(id) + "].ivl"), 1);
  eq("a miss is recorded as a lapse", read(s, "SAVE.srs[" + JSON.stringify(id) + "].lapses"), 1);
}

/* ---------- every mode feeds the same scheduler ---------- */
{
  const s = boot();
  read(s, "startRun('trial','disciple'); R.q = VERSES[0]; R.tTotal = 10000;");
  read(s, "scheduleReview(R.q, {correct:true, fraction:0.2})");
  eq("the Trial reschedules verses too", read(s, "Object.keys(SAVE.srs).length"), 1);
  eq("lifetime review count moves", read(s, "SAVE.life.reviewsDone"), 1);

  // A timeout is the worst grade and must not be treated as a near miss.
  const s2 = boot();
  read(s2, "startRun('daily','disciple'); scheduleReview(VERSES[3], {correct:false, timedOut:true});");
  eq("a timeout lapses the verse", read(s2, "SAVE.srs[VERSES[3].id].lapses"), 1);
  eq("a timeout leaves easiness at the floor-ward end",
     read(s2, "SAVE.srs[VERSES[3].id].ef < SRS.START_EF"), true);
}

/* ---------- Recall mode ---------- */
{
  const s = boot();
  read(s, "startRun('recall','disciple')");
  eq("recall runs in typed mode", read(s, "R.typed"), true);
  eq("recall is 12 verses long", read(s, "R.practiceLen"), 12);
  ok("recall gets a longer clock than the drill",
     read(s, "(function(){var m=R.mode;R.mode='recall';var a=questionDuration();R.mode='practice';var b=questionDuration();R.mode=m;return a>b;})()"));

  // Drive one question end to end through the real render + grade path.
  read(s, "R.q = drawReviewVerse(); R.tTotal = 22000; R.qStart = 0; renderTypedQuestion(R.q, 22000, R.sceneToken);");
  eq("the typed input is rendered", read(s, "!!document.getElementById('typed-answer')"), true);

  const answer = read(s, "R.q.a");
  const id = read(s, "R.q.id");
  read(s, "R.running = true; R.locked = false;");
  read(s, "resolveAnswer(R.q, " + JSON.stringify(answer) + ", null, 3000, 19000)");
  eq("an exact typed answer is counted correct", read(s, "R.correct"), 1);
  eq("an exact typed answer is tallied", read(s, "R.typedExact"), 1);
  eq("lifetime typed stats move", read(s, "SAVE.life.typedExact"), 1);
  eq("the typed answer schedules the verse", read(s, "!!SAVE.srs[" + JSON.stringify(id) + "]"), true);

  // A wrong typed answer must not be forgiven into a pass.
  const s2 = boot();
  read(s2, "startRun('recall','disciple'); R.q = VERSES.find(v=>v.a==='heaven and the earth'); R.tTotal=22000; R.qStart=0;");
  read(s2, "renderTypedQuestion(R.q, 22000, R.sceneToken); R.running=true; R.locked=false;");
  read(s2, "resolveAnswer(R.q, 'heavens and the earth', null, 3000, 19000)");
  eq("a changed word form is marked wrong in the real path", read(s2, "R.correct"), 0);
  eq("the wrong answer lapsed the verse", read(s2, "SAVE.srs[R.q.id].lapses"), 1);
}

/* ---------- Illuminate adapts to typing ---------- */
{
  const s = boot();
  read(s, "startRun('recall','disciple'); R.q = drawReviewVerse(); R.tTotal=22000;");
  read(s, "renderTypedQuestion(R.q, 22000, R.sceneToken); R.running=true; R.paused=false;");
  const before = read(s, "R.powers.illum");
  read(s, "usePower('illum')");
  eq("Illuminate spends a charge", read(s, "R.powers.illum"), before - 1);
  eq("Illuminate raises the hint level", read(s, "R.hintLevel"), 1);
  const hint = read(s, "document.getElementById('typed-hint').textContent");
  ok("the hint is not the answer", hint !== read(s, "R.q.a"), hint);
  ok("the hint is not empty", String(hint).length > 0);
  read(s, "usePower('illum'); usePower('illum'); usePower('illum');");
  ok("the hint level is capped", read(s, "R.hintLevel") <= 3, read(s, "R.hintLevel"));
}

/* ---------- v2 save migration ---------- */
{
  const legacy = JSON.parse(fs.readFileSync(path.join(__dirname, "js", "legacy-ids.js"), "utf8")
    .match(/LEGACY_ID_TABLE = (\[[\s\S]*?\]);/)[1]);
  let slotA = -1, slotB = -1;
  for(let i = 0; i < legacy.length; i++){
    if(legacy[i] && slotA < 0) slotA = i;
    else if(legacy[i] && slotB < 0){ slotB = i; break; }
  }
  const droppedSlot = legacy.findIndex(x => !x);

  const v2 = {
    v:2, xp:4321, runs:9, seals:["first","recall"],
    best:{trial:12000, endless:5000, daily:3000, practice:900},
    life:{correct:120, attempts:200, bestStreak:14, sdBest:3, endlessBest:22, dailyDone:5, perfectActs:2},
    books:{Genesis:{c:8,a:10}}, board:[{score:12000,mode:"trial",diff:"disciple",acc:70,date:"2026-01-01",q:39}],
    daily:{date:"2026-01-01", score:3000},
    set:{music:0.2, sfx:0.9, quality:"low", reduced:true, shake:false, voice:false, diff:"watchman", tutorialDone:true},
    verse:{}
  };
  v2.verse[slotA] = {c:5, a:5};        // known cold
  v2.verse[slotB] = {c:0, a:4};        // repeatedly missed
  if(droppedSlot >= 0) v2.verse[droppedSlot] = {c:3, a:3};   // verse since cut

  const s = boot({key:"ctv_save_v2", value:v2});

  eq("xp survives migration", read(s, "SAVE.xp"), 4321);
  eq("runs survive migration", read(s, "SAVE.runs"), 9);
  eq("seals survive migration", read(s, "SAVE.seals.length"), 2);
  eq("best scores survive migration", read(s, "SAVE.best.trial"), 12000);
  eq("lifetime totals survive migration", read(s, "SAVE.life.correct"), 120);
  eq("settings survive migration", read(s, "SAVE.set.diff"), "watchman");
  eq("book stats survive migration", read(s, "SAVE.books.Genesis.c"), 8);
  eq("the save is stamped v3", read(s, "SAVE.v"), 3);

  eq("a surviving verse keeps its record",
     read(s, "SAVE.verse[" + JSON.stringify(legacy[slotA]) + "].c"), 5);
  eq("a second surviving verse keeps its record",
     read(s, "SAVE.verse[" + JSON.stringify(legacy[slotB]) + "].a"), 4);
  eq("no index-shaped keys remain",
     read(s, "Object.keys(SAVE.verse).filter(k=>/^\\d+$/.test(k)).length"), 0);
  eq("records for cut verses are dropped",
     read(s, "Object.keys(SAVE.verse).every(k=>VERSES.some(v=>v.id===k))"), true);

  // The point of seeding: a returning player opens to a real drill.
  ok("migration seeds a schedule", read(s, "Object.keys(SAVE.srs).length") > 0);
  eq("a previously-known verse is due for review now",
     read(s, "SRS.isDue(SAVE.srs[" + JSON.stringify(legacy[slotA]) + "], today())"), true);
  eq("a previously-missed verse is marked as lapsed",
     read(s, "SAVE.srs[" + JSON.stringify(legacy[slotB]) + "].lapses"), 1);
  ok("the menu has something to offer a returning player", read(s, "dueToday()") > 0);

  // Migration must be idempotent — booting again must not double-count.
  const dump = read(s, "JSON.stringify(SAVE)");
  read(s, "persist()");
  const s2 = boot({key:"ctv_save_v3", value:JSON.parse(read(s, "JSON.stringify(SAVE)"))});
  eq("re-loading a v3 save changes nothing", read(s2, "SAVE.xp"), 4321);
  eq("re-loading does not re-seed the schedule",
     read(s2, "Object.keys(SAVE.srs).length"), read(s, "Object.keys(SAVE.srs).length"));
  ok("a v3 save round-trips", JSON.parse(dump).xp === 4321);
}

/* ---------- a fresh player is not buried ---------- */
{
  const s = boot();
  eq("nothing is due on day one", read(s, "dueToday()"), 0);
  read(s, "startRun('practice','disciple')");
  ok("the drill still has verses to serve", read(s, "R.queue.length") > 0);
}

/* ---------- the Pilgrimage, played end to end ----------
   This is the branch that matters: game.js now has a whole run type
   whose verses come from a fixed site list rather than a tier draw, and
   whose ending writes to a save key that did not exist before. The
   sandbox has no Leaflet and no fetch, which is also the degradation
   path the atlas is meant to survive. */
{
  const s = boot();

  eq("the Pilgrimage is on the menu", read(s, "!!MODES.pilgrimage"), true);
  eq("the typed replay is kept off it", read(s, "!!MODES['pilgrim-recall'].hidden"), true);
  eq("a fresh save starts the road at Ur", read(s, "Pilgrimage.currentSite(SAVE.pilgrim).id"), "ur");
  eq("nothing is cleared yet", read(s, "Pilgrimage.clearedCount(SAVE.pilgrim)"), 0);

  // Starting a site the way the briefing card does.
  read(s, "pendingSiteId = 'ur'; startRun('pilgrimage','disciple')");
  eq("the run knows which site it is", read(s, "R.siteId"), "ur");
  eq("the run draws a full site", read(s, "R.siteVerses.length"),
     read(s, "Pilgrimage.VERSES_PER_SITE"));
  eq("they come from the site's own books", read(s, "R.siteRing"), "site");
  eq("it is not a typing run", read(s, "R.typed"), false);
  eq("the clock is the site's clock plus the pick pad",
     read(s, "questionDuration()"),
     read(s, "Math.round((Pilgrimage.clockFor(0) * R.diff.time + Pilgrimage.PICK_PAD_MS) * PACE + FLAT_ADD_MS)"));
  ok("every drawn verse belongs to Ur's books",
     read(s, "(function(){var b={};Pilgrimage.site('ur').books.forEach(function(x){b[x]=1});" +
             "return R.siteVerses.every(function(v){return b[v.b]===1})})()"));
  /* Serve-time commitment: startRun auto-serves the first verse, and
     commits exactly that one. The other seven stay in the journey's bank
     until they are served — quitting after one verse costs one verse,
     not the site's whole draw. */
  eq("starting a run commits only the verse it serves",
     read(s, "SAVE.pilgrim.usedIds.length"), 1);
  eq("the commit is the verse actually served", read(s, "SAVE.pilgrim.usedIds[0] === R.q.id"), true);
  ok("the rest of the draw is still unspent",
     read(s, "SAVE.pilgrim.usedIds.length") < read(s, "R.siteVerses.length"));
  eq("pilgrimage starts lean on powers", read(s, "R.powers.illum"), 1);
  eq("pilgrimage has no Second Wind", read(s, "R.powers.wind"), 0);

  /* startRun already served the first verse; the remaining need-1 calls
     finish the list and one more ends the run by itself. */
  const need = read(s, "Pilgrimage.VERSES_PER_SITE");
  eq("the first verse is served by starting the run", read(s, "R.siteIdx"), 1);
  read(s, "(function(){ var n=R.siteVerses.length; for(var i=1;i<n;i++){ R.correct++; R.attempts++; nextQuestion(); } })()");
  eq("all site verses are served", read(s, "R.siteIdx"), need);
  read(s, "R.correct++; R.attempts++; nextQuestion();");
  eq("running out of verses ends the run on its own", read(s, "R.ended"), true);

  eq("finishing clears the site", read(s, "Pilgrimage.isCleared(SAVE.pilgrim,'ur')"), true);
  eq("clearing opens the next site", read(s, "Pilgrimage.isUnlocked(SAVE.pilgrim,'haran')"), true);
  eq("the road moves on", read(s, "Pilgrimage.currentSite(SAVE.pilgrim).id"), "haran");
  eq("the site records exactly one attempt", read(s, "Pilgrimage.recordOf(SAVE.pilgrim,'ur').attempts"), 1);
  ok("the site records a score", read(s, "Pilgrimage.recordOf(SAVE.pilgrim,'ur').best") > 0);

  // endRun is reachable from a timeout and a click in the same tick, so
  // a second call must bank nothing further.
  const runsAfter = read(s, "SAVE.runs");
  read(s, "endRun('complete')");
  eq("ending a finished run again banks nothing", read(s, "SAVE.runs"), runsAfter);
  eq("nor does it count a second visit",
     read(s, "Pilgrimage.recordOf(SAVE.pilgrim,'ur').attempts"), 1);
  eq("the journey counter moves", read(s, "SAVE.life.sitesCleared"), 1);
  eq("a first clear earns its seal", read(s, "SAVE.seals.indexOf('road-first') >= 0"), true);
  ok("the Pilgrimage keeps a best score", read(s, "SAVE.best.pilgrimage") > 0);

  // And the progress survives a reload.
  const s2 = boot({key:"ctv_save_v3", value:JSON.parse(read(s, "JSON.stringify(SAVE)"))});
  eq("a cleared site survives a reload", read(s2, "Pilgrimage.isCleared(SAVE.pilgrim,'ur')"), true);
  eq("and the road still points onward", read(s2, "Pilgrimage.currentSite(SAVE.pilgrim).id"), "haran");
}

/* ---------- failing a site changes nothing ---------- */
{
  const s = boot();
  read(s, "pendingSiteId = 'ur'; startRun('pilgrimage','disciple')");
  read(s, "(function(){ nextQuestion(); R.attempts++; })()");
  read(s, "endRun('death')");

  eq("dying does not clear the site", read(s, "Pilgrimage.isCleared(SAVE.pilgrim,'ur')"), false);
  eq("nor does it open the next one", read(s, "Pilgrimage.isUnlocked(SAVE.pilgrim,'haran')"), false);
  eq("but the attempt is recorded", read(s, "Pilgrimage.recordOf(SAVE.pilgrim,'ur').attempts"), 1);
  eq("the road still points at Ur", read(s, "Pilgrimage.currentSite(SAVE.pilgrim).id"), "ur");
}

/* ---------- quitting a site before answering anything ----------
   The zero-answer abandon path: one verse was on the stage, so one verse
   is spent — the draw's other seven return to the bank untouched. */
{
  const s = boot();
  read(s, "pendingSiteId = 'ur'; startRun('pilgrimage','disciple')");
  read(s, "abandonRun()");
  eq("a zero-answer quit burns only the verse shown",
     read(s, "SAVE.pilgrim.usedIds.length"), 1);
  ok("the other verses stay in the bank",
     read(s, "SAVE.pilgrim.usedIds.length") < read(s, "Pilgrimage.VERSES_PER_SITE"));
  eq("the site records no attempt", read(s, "Pilgrimage.recordOf(SAVE.pilgrim,'ur')"), null);
  eq("and the road still points at Ur", read(s, "Pilgrimage.currentSite(SAVE.pilgrim).id"), "ur");
}

/* ---------- a death no longer spends the day's Daily shot ----------
   The daily is one RECORDED run, not one attempt: ending early is
   practice, and only a finished run writes the day's score. */
{
  const s = boot();
  read(s, "startRun('daily','disciple')");
  read(s, "R.attempts = 6; R.correct = 3; R.qTotal = 6;");
  read(s, "endRun('death')");
  eq("a death does not record the daily", read(s, "SAVE.daily.date"), "");
  eq("a death does not count a completed daily", read(s, "SAVE.life.dailyDone"), 0);

  read(s, "startRun('daily','disciple')");
  read(s, "R.attempts = 20; R.correct = 18; R.qTotal = 20; R.dailyIdx = 20;");
  read(s, "endRun('complete')");
  eq("a finished run records the daily", read(s, "SAVE.daily.date"), read(s, "todayKey()"));
  eq("and counts it once", read(s, "SAVE.life.dailyDone"), 1);
}

/* ---------- the typed replay ---------- */
{
  const s = boot();
  read(s, "pendingSiteId='ur'; startRun('pilgrim-recall','disciple')");
  eq("the replay types its answers", read(s, "R.typed"), true);
  eq("it still draws a full site", read(s, "R.siteVerses.length"),
     read(s, "Pilgrimage.VERSES_PER_SITE"));
  ok("it gets a clock sized for typing",
     read(s, "questionDuration()") > read(s, "Pilgrimage.clockFor(0) * R.diff.time"));
}

/* ---------- the difficulty ramp is real in play ---------- */
{
  const s = boot();
  read(s, "pendingSiteId='ur'; startRun('pilgrimage','disciple')");
  const atUr = read(s, "questionDuration()");
  read(s, "pendingSiteId='patmos'; startRun('pilgrimage','disciple')");
  const atPatmos = read(s, "questionDuration()");
  ok("the clock is tighter at the end of the road than the start", atPatmos < atUr, {atUr, atPatmos});
  eq("the last site is tier 5", read(s, "Pilgrimage.tierFor(Pilgrimage.indexOf('patmos'))"), 5);
}

/* ---------- high momentum lengthens the pick clock ---------- */
{
  const s = boot();
  read(s, "pendingSiteId='ur'; startRun('pilgrimage','disciple')");
  const cold = read(s, "questionDuration()");
  read(s, "R.streak = 2");
  eq("before Building the clock is only the pad", read(s, "questionDuration()"), cold);
  read(s, "R.streak = 3");
  const hot = read(s, "questionDuration()");
  eq("Building adds a 20% beat", hot, Math.round((cold - 5000) * 1.2 + 5000));
  read(s, "R.speed = true; R.streak = 3");
  eq("Swift Lock is the short clock plus pad and Building",
     read(s, "questionDuration()"),
     read(s, "Math.round(Math.round(((Pilgrimage.SPEED_MS || 6000) * R.diff.time + Pilgrimage.PICK_PAD_MS) * 1.2) * PACE + FLAT_ADD_MS)"));
  read(s, "R.speed = false; R.typed = true");
  eq("typed clocks stay sized for typing", read(s, "questionDuration()"),
     read(s, "Math.round(Math.max(32000, siteClockMs(R.siteId, R.mode)) * R.diff.time * PACE + FLAT_ADD_MS)"));
}

/* ---------- the Pilgrimage feeds the scheduler ---------- */
{
  const s = boot();
  read(s, "pendingSiteId='ur'; startRun('pilgrimage','disciple'); nextQuestion(); R.tTotal=12000;");
  const id = read(s, "R.q.id");
  read(s, "scheduleReview(R.q, {correct:true, fraction:0.3})");
  eq("a site answer schedules the verse", read(s, "!!SAVE.srs[" + JSON.stringify(id) + "]"), true);
  eq("and counts toward lifetime review", read(s, "SAVE.life.reviewsDone"), 1);
}

/* ---------- an older save is migrated, not wiped ---------- */
{
  // A v3 save written before the Pilgrimage existed has no `pilgrim` key.
  const s = boot({key:"ctv_save_v3", value:{
    v:3, xp:9000, runs:12, seals:["first","recall"],
    best:{trial:5000, endless:2000, daily:1000, practice:0, recall:0},
    life:{correct:200, attempts:260, bestStreak:14},
    books:{}, verse:{}, srs:{}, board:[], daily:{date:"", score:0}, set:{diff:"watchman"}
  }});

  ok("a pre-Pilgrimage save still loads", read(s, "SAVE.xp") === 9000);
  eq("its seals survive", read(s, "SAVE.seals.length"), 2);
  eq("its records survive", read(s, "SAVE.best.trial"), 5000);
  eq("its settings survive", read(s, "SAVE.set.diff"), "watchman");
  eq("it gains a blank journey", read(s, "Pilgrimage.clearedCount(SAVE.pilgrim)"), 0);
  eq("starting at Ur", read(s, "Pilgrimage.currentSite(SAVE.pilgrim).id"), "ur");
  eq("and a Pilgrimage best of zero", read(s, "SAVE.best.pilgrimage"), 0);
  eq("live conditions default on", read(s, "SAVE.set.liveWeather"), true);
}

/* ---------- the atlas survives a world with no map and no network ---------- */
{
  const s = boot();
  eq("Leaflet is genuinely absent here", read(s, "typeof L"), "undefined");
  eq("so the atlas reports it has no map", read(s, "Atlas.hasMap()"), false);
  ok("opening the atlas does not throw", (() => {
    try { read(s, "go('atlas')"); return true; }
    catch(e){ console.log("    " + e.message); return false; }
  })());
  ok("and leaving it again does not either", (() => {
    try { read(s, "go('menu')"); return true; }
    catch(e){ console.log("    " + e.message); return false; }
  })());
  eq("with no fetch, live data is simply unavailable", read(s, "typeof fetch"), "undefined");
  ok("and a reading still comes back", read(s, "Live.readingFor(SITES[0]).tempC") > 0);
  eq("honestly marked as not live", read(s, "Live.readingFor(SITES[0]).live"), false);
}

/* ---------- blitz record uses verses, not total score ---------- */
{
  const s = boot();
  read(s, "var submitted = null; Cloud = { configured: ()=>true, isSignedIn: ()=>true, schedulePush: ()=>{}, submitBlitzScore: p => { submitted = p; }, fetchBlitzBoard: ()=>Promise.resolve([]), fetchMyBlitzRank: ()=>Promise.resolve(null) };");
  read(s, "startRun('blitz','disciple'); R.correct = 14; R.attempts = 15; R.score = 5200;");
  read(s, "endRun('complete')");
  eq("blitz SAVE.best records verses", read(s, "SAVE.best.blitz"), 14);
  eq("blitz SAVE.life.blitzBest records verses", read(s, "SAVE.life.blitzBest"), 14);
  eq("blitz cloud submission sends verses", read(s, "submitted && submitted.score"), 14);
  ok("blitz res-best mentions verses", read(s, "document.getElementById('res-best').textContent.indexOf('0 verses') >= 0"));

  read(s, "startRun('blitz','disciple'); R.correct = 10; R.attempts = 12; R.score = 3600;");
  read(s, "endRun('complete')");
  eq("blitz SAVE.best retains previous higher best", read(s, "SAVE.best.blitz"), 14);
  ok("blitz res-best displays current best in verses", read(s, "document.getElementById('res-best').textContent.indexOf('Scripture Blitz best — 14 verses') >= 0"));
}

/* ---------- board and cloud chip show Honor system on direct fallback ---------- */
{
  const s = boot();
  read(s, "Cloud = { configured: ()=>true, isSignedIn: ()=>true, user: ()=>({id:'u1'}), profile: ()=>({display_name:'Pilgrim'}), lastSubmitVia: ()=>'direct', schedulePush: ()=>{}, fetchDailyBoard: ()=>Promise.resolve([]), fetchMyDailyRank: ()=>Promise.resolve(null), fetchBlitzBoard: ()=>Promise.resolve([]), fetchMyBlitzRank: ()=>Promise.resolve(null) };");
  read(s, "fillResultsBoard('blitz'); updateCloudChip();");
  ok("res-board shows Honor system when via direct", read(s, "document.getElementById('res-board').innerHTML.indexOf('Honor system') >= 0"));
  ok("cloud-chip shows Honor system when via direct", read(s, "document.getElementById('cloud-chip').textContent.indexOf('Honor system') >= 0"));

  read(s, "Cloud.lastSubmitVia = ()=>'edge';");
  read(s, "fillResultsBoard('blitz'); updateCloudChip();");
  ok("res-board omits Honor system when via edge", read(s, "document.getElementById('res-board').innerHTML.indexOf('Honor system') < 0"));
  ok("cloud-chip omits Honor system when via edge", read(s, "document.getElementById('cloud-chip').textContent.indexOf('Honor system') < 0"));
}

/* ---------- tutorial CTA is Walk to Ur and routes to atlas ---------- */
{
  const s = boot();
  const html = require("fs").readFileSync("index.html", "utf8");
  ok("tutorial has Walk to Ur CTA", html.indexOf("Walk to Ur") >= 0);
  ok("tutorial has Try the Drill secondary CTA", html.indexOf("Try the Drill") >= 0);
  read(s, "SAVE.set.profileDone = true; SAVE.set.playerName = 'Tester';");
  read(s, "finishTutorial('pilgrimage');");
  eq("finishTutorial with pilgrimage routes to atlas", read(s, "currentView"), "atlas");
  read(s, "finishTutorial('practice');");
  eq("finishTutorial with practice routes to practice brief", read(s, "currentView==='brief' && briefMode==='practice'"), true);
}

/* ---------- review action buttons on menu, results, and study hall ---------- */
{
  const s = boot();
  // With 0 due items
  read(s, "renderMenu(); renderStudy();");
  ok("menu-review-due hidden when 0 due", read(s, "document.getElementById('menu-review-due') ? document.getElementById('menu-review-due').style.display === 'none' : false"));
  ok("study-review-due hidden when 0 due", read(s, "document.getElementById('study-review-due') ? document.getElementById('study-review-due').style.display === 'none' : false"));

  // With due items
  read(s, "SAVE.srs = {}; SAVE.srs[VERSES[0].id] = { reps: 1, due: today() - 1, last: today() - 2, ef: 2.5, ivl: 1, lapses: 0 };");
  read(s, "renderMenu(); renderStudy();");
  ok("menu-review-due visible when due > 0", read(s, "document.getElementById('menu-review-due').style.display !== 'none'"));
  ok("menu-review-due text contains due count", read(s, "document.getElementById('menu-review-due').textContent.indexOf('Review 1 due') >= 0"));
  ok("study-review-due visible when due > 0", read(s, "document.getElementById('study-review-due').style.display !== 'none'"));

  // Results screen with missed verses
  read(s, "startRun('practice','disciple'); R.missed = [{ verse: VERSES[0], pick: 'wrong' }, { verse: VERSES[1], pick: 'wrong' }];");
  read(s, "endRun('complete');");
  ok("res-review-missed visible when missed > 0", read(s, "document.getElementById('res-review-missed').style.display !== 'none'"));
  read(s, "document.getElementById('res-review-missed').onclick();");
  eq("clicking res-review-missed starts practice with seeded queue", read(s, "R.mode==='practice' && R.practiceLen===2"), true);

  // Set-piece failures are passage stubs with no bank id.
  read(s, "startRun('practice','disciple'); R.missed = [{r:'1 Kings 18:36-39',p:'',a:'the whole passage',s:''}];");
  read(s, "endRun('complete');");
  ok("res-review-missed hidden when only passage stubs", read(s, "document.getElementById('res-review-missed').style.display === 'none'"));

  read(s, "startRun('practice','disciple'); R.missed = [{ verse: VERSES[0], pick: 'wrong' }, {r:'1 Kings 18:36-39',p:'',a:'the whole passage',s:''}];");
  read(s, "endRun('complete');");
  ok("res-review-missed visible when a bank verse was also missed", read(s, "document.getElementById('res-review-missed').style.display !== 'none'"));
  read(s, "document.getElementById('res-review-missed').onclick();");
  eq("review queue drops passage stubs", read(s, "R.practiceLen"), 1);
  eq("the served review verse is the bank miss", read(s, "R.q && R.q.id"), read(s, "VERSES[0].id"));
}

/* ---------- old composite Blitz PBs migrate to verse units ---------- */
{
  const s = boot({key:"ctv_save_v3", value:{
    v:3, xp:0, runs:1, seals:[],
    best:{trial:0, endless:0, daily:0, practice:0, recall:0, pilgrimage:0, blitz:5200},
    life:{correct:0, attempts:0, bestStreak:0, blitzBest:0},
    ghosts:{blitz:{score:5200, samples:[{t:0,p:0}], total_ms:1000}, pilgrimage:null},
    books:{}, verse:{}, srs:{}, board:[], daily:{date:"", score:0}, set:{diff:"disciple"}
  }});
  eq("old composite blitz best is not kept as verses", read(s, "SAVE.best.blitz"), 0);
  eq("old-scale blitz ghost is dropped", read(s, "SAVE.ghosts.blitz"), null);
  read(s, "startRun('blitz','disciple'); R.correct = 14; R.attempts = 15; R.score = 5200;");
  read(s, "endRun('complete')");
  eq("14-verse run becomes the blitz record", read(s, "SAVE.best.blitz"), 14);
  ok("results do not advertise 5,200 verses",
    read(s, "document.getElementById('res-best').textContent.indexOf('5,200') < 0"));
}

{
  const s = boot({key:"ctv_save_v3", value:{
    v:3, xp:0, runs:2, seals:[],
    best:{trial:0, endless:0, daily:0, practice:0, recall:0, pilgrimage:0, blitz:5200},
    life:{correct:14, attempts:16, bestStreak:8, blitzBest:14},
    ghosts:{blitz:{score:5200, samples:[{t:0,p:0}], total_ms:1000}, pilgrimage:null},
    books:{}, verse:{}, srs:{}, board:[], daily:{date:"", score:0}, set:{diff:"disciple"}
  }});
  eq("composite blitz best falls back to life.blitzBest", read(s, "SAVE.best.blitz"), 14);
}

/* ---------- assemble, oil, Act VI gate, wipe ---------- */
{
  const s = boot();
  eq("a fresh save has five trial acts", read(s, "trialActs().length"), 5);
  eq("Act VI is closed until the gate", read(s, "Meta.actVIUnlocked(SAVE)"), false);
  read(s, "SAVE.seals.push('sd15'); SAVE.xp = 400000;");
  ok("Act VI opens at rank 20 plus the Act V seal", read(s, "Meta.actVIUnlocked(SAVE)"));
  eq("an unlocked save lists six acts", read(s, "trialActs().length"), 6);

  read(s, "startRun('recall','disciple'); R.q = drawReviewVerse(); renderTypedQuestion(R.q, 22000, R.sceneToken);");
  ok("assemble builds a bank", read(s, "!!R.assemble && R.assemble.bank.length > R.assemble.target.length"));
  ok("the hidden field is still present", read(s, "!!document.getElementById('typed-answer')"));

  const s2 = boot();
  read(s2, "startRun('practice','disciple'); R.q = VERSES[0]; R.tTotal=12000; R.qStart=0; R.running=true; R.locked=false;");
  const oilBefore = read(s2, "SAVE.oil||0");
  read(s2, "resolveAnswer(R.q, R.q.a, null, 2000, 10000)");
  ok("a correct answer pays oil", read(s2, "SAVE.oil") > oilBefore);
  ok("a correct answer pays in-run XP", read(s2, "SAVE.xp") > 0);

  eq("a mid-run question should wipe", read(s2, "Flow.shouldWipe(wipeContext())"), true);
  read(s2, "R.ended = true");
  eq("an ended run does not wipe", read(s2, "Flow.shouldWipe(wipeContext())"), false);
}

function finishSuite(err){
  if(err){
    fail++;
    console.log("  FAIL async honor test  -> " + (err && err.stack || err));
  }
  console.log((fail ? "FAIL" : "PASS") + " — integration · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
  process.exit(fail ? 1 : 0);
}

/* Honor-system label is painted only after the async submit sets lastSubmitVia. */
(async () => {
  const s = boot();
  read(s, "var __via = null; Cloud = { configured: ()=>true, isSignedIn: ()=>true, user: ()=>({id:'u1'}), profile: ()=>({display_name:'Pilgrim'}), lastSubmitVia: ()=>__via, schedulePush: ()=>{}, submitBlitzScore: function(){ return Promise.resolve().then(function(){ __via = 'direct'; return {ok:true, via:'direct'}; }); }, fetchBlitzBoard: ()=>Promise.resolve([]), fetchMyBlitzRank: ()=>Promise.resolve(null) };");
  read(s, "startRun('blitz','disciple'); R.correct = 5; R.attempts = 5; endRun('complete');");
  ok("honor tag omitted before submit settles",
    read(s, "document.getElementById('res-board').innerHTML.indexOf('Honor system') < 0"));
  await new Promise(r => setImmediate(r));
  ok("honor tag appears after submit settles",
    read(s, "document.getElementById('res-board').innerHTML.indexOf('Honor system') >= 0"));
  finishSuite();
})().catch(finishSuite);




