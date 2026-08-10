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

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
const eq = (name, got, want) => ok(name, got === want, {got, want});

/* ---------- the smallest DOM that game.js will boot against ---------- */
function makeElement(id){
  const el = {
    id, tagName:"DIV", textContent:"", innerHTML:"", value:"", disabled:false, open:false,
    checked:false, offsetWidth:1, children:[], options:[], dataset:{},
    style:new Proxy({}, {get:(t,k)=> k==="setProperty" ? ()=>{} : (t[k]||""), set:(t,k,v)=>{t[k]=v;return true;}}),
    // Real DOMTokenList is iterable and game.js spreads it, so the shim
    // has to be too.
    classList:{
      _s:new Set(),
      add(...c){ c.forEach(x=>this._s.add(x)); }, remove(...c){ c.forEach(x=>this._s.delete(x)); },
      toggle(c,f){ const on = f===undefined ? !this._s.has(c) : !!f; on?this._s.add(c):this._s.delete(c); return on; },
      contains(c){ return this._s.has(c); },
      get length(){ return this._s.size; },
      item(i){ return [...this._s][i]; },
      [Symbol.iterator](){ return this._s.values(); }
    },
    _handlers:{},
    addEventListener(t,fn){ (this._handlers[t]=this._handlers[t]||[]).push(fn); },
    removeEventListener(){},
    dispatch(t,ev){ (this._handlers[t]||[]).forEach(fn=>fn(ev||{preventDefault(){}})); },
    appendChild(c){ this.children.push(c); return c; },
    querySelector(){ return makeElement("q"); },
    querySelectorAll(){ return []; },
    closest(){ return null; },
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    focus(){}, blur(){}, click(){ this.dispatch("click"); },
    animate(){ return {cancel(){}, finish(){}, onfinish:null, finished:Promise.resolve()}; },
    scrollIntoView(){}, insertAdjacentHTML(){}, remove(){},
    getBoundingClientRect(){ return {width:100,height:100,top:0,left:0}; }
  };
  return el;
}
function makeSandbox(){
  const els = {};
  const el = id => els[id] || (els[id] = makeElement(id));
  const body = makeElement("body");
  const doc = {
    body, hidden:false,
    getElementById:id => el(id),
    createElement:tag => { const e = makeElement("new"); e.tagName = String(tag).toUpperCase(); return e; },
    querySelector:() => makeElement("q"),
    querySelectorAll:() => [],
    addEventListener(){}, removeEventListener(){},
    activeElement:{tagName:"BODY"}
  };
  // No Web Audio available. game.js already handles this (Snd.init catches
  // and sets avail=false), which is the same path a browser takes when the
  // context cannot be created — so this exercises a real code path rather
  // than faking one.
  const noAudio = function(){ throw new Error("no audio device"); };
  const sandbox = {
    console, Date, Math, JSON, String, Number, Array, Object, Set, Map, Boolean, Error,
    isFinite, isNaN, parseInt, parseFloat, Infinity, NaN, Promise, RegExp,
    document: doc, window: null,
    localStorage:(() => { let s={}; return {
      getItem:k => (k in s ? s[k] : null), setItem:(k,v) => { s[k]=String(v); },
      removeItem:k => { delete s[k]; }, clear:() => { s={}; }, _dump:() => s, _load:o => { s=o; }
    }; })(),
    performance:{ now:() => Date.now() },
    requestAnimationFrame:() => 0, cancelAnimationFrame(){},
    setTimeout:() => 0, clearTimeout(){}, setInterval:() => 0, clearInterval(){},
    addEventListener(){}, removeEventListener(){},
    matchMedia:() => ({matches:false, addEventListener(){}}),
    navigator:{ share:null, clipboard:null, userAgent:"node" },
    Audio: function(){ return { play:() => Promise.resolve(), pause(){}, cloneNode(){ return this; },
      addEventListener(){}, volume:0, currentTime:0, loop:false }; },
    AudioContext: noAudio, webkitAudioContext: noAudio,
    speechSynthesis:{ getVoices:() => [], speak(){}, cancel(){} },
    SpeechSynthesisUtterance: function(){ return {}; },
    confirm:() => true, alert(){},
    _els: els
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  return sandbox;
}

/* Same order as index.html. The Pilgrimage files are included because
   game.js now calls into them at boot — and because booting them in a
   sandbox with no Leaflet and no fetch is exactly the degradation path
   they are supposed to survive. */
const FILES = ["js/verses.js","js/verses-extra.js","js/passages.js","js/legacy-ids.js",
               "js/bank.js","js/srs.js","js/recall.js",
               "js/sites.js","js/empires.js","js/geo.js","js/pilgrimage.js",
               "js/live.js","js/atlas.js","js/game.js"];
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
  eq("the run draws six verses", read(s, "R.siteVerses.length"), 6);
  eq("they come from the site's own books", read(s, "R.siteRing"), "site");
  eq("it is not a typing run", read(s, "R.typed"), false);
  eq("the clock is the site's clock",
     read(s, "questionDuration()"), read(s, "Pilgrimage.clockFor(0) * R.diff.time"));
  ok("every drawn verse belongs to Ur's books",
     read(s, "(function(){var b={};Pilgrimage.site('ur').books.forEach(function(x){b[x]=1});" +
             "return R.siteVerses.every(function(v){return b[v.b]===1})})()"));

  /* startRun already served the first verse, so five more calls finish
     the site and the sixth finds the list exhausted and ends the run by
     itself. Ending it by hand here would hide whether that automatic
     ending actually works. */
  eq("the first verse is served by starting the run", read(s, "R.siteIdx"), 1);
  read(s, "(function(){ for(var i=0;i<5;i++){ R.correct++; R.attempts++; nextQuestion(); } })()");
  eq("all six verses are served", read(s, "R.siteIdx"), 6);
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

/* ---------- the typed replay ---------- */
{
  const s = boot();
  read(s, "pendingSiteId='ur'; startRun('pilgrim-recall','disciple')");
  eq("the replay types its answers", read(s, "R.typed"), true);
  eq("it still draws six verses", read(s, "R.siteVerses.length"), 6);
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

console.log((fail ? "FAIL" : "PASS") + " — integration · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
