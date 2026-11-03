const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");
const { Tablets } = require("../js/tablets.js");
require("../js/tablets-canon.js");
require("../js/tablets-hall.js");
require("../js/tablets-more.js");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got: got, want: want }); }

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/verses-tf.js", "js/beat.js", "js/tablets.js", "js/tablets-canon.js", "js/tablets-hall.js", "js/tablets-more.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js", "js/live.js", "js/atlas.js"
];
function boot() {
  const sb = makeSandbox();
  const src = PREFIX.concat(ENGINE_FILES, ["js/tablets-run.js"])
    .map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });
  return sb;
}
function exec(sb, code) { return vm.runInContext(code, sb); }
function read(sb, expr) { return vm.runInContext(expr, sb); }
const origRandom = Math.random;
function stubRandom(sb, n) {
  exec(sb, "Math.random = function(){ return " + n + "; }");
}
function unstubRandom() { Math.random = origRandom; }
function holdAll(sb) {
  for (let i = 0; i < 600 && !read(sb, "R.ended"); i++) exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
}

const p23 = Tablets.chapter("psalm23");
const p91 = Tablets.chapter("psalm91");
eq("Psalm 23 has 11 blanks", p23.blanks.length, 11);
eq("Psalm 91 has 17 blanks", p91.blanks.length, 17);
eq("BLANK_S is 25", Tablets.BLANK_S, 25);
eq("clockS is 25", Tablets.clockS(), 25);
eq("clockS ignores pace", Tablets.clockS(3), 25);
eq("Psalm 23 pace is 1", Tablets.paceOf(p23), 1);
eq("Psalm 91 pace is 1", Tablets.paceOf(p91), 1);
eq("John 1 pace is 1", Tablets.paceOf(Tablets.chapter("john1")), 1);
eq("HOLDS_TO_OPEN is 3", Tablets.HOLDS_TO_OPEN, 3);
ok("Pace I gate is open by default", Tablets.paceGateOpen(1, {}));
ok("Pace II gate locked with 0 holds", !Tablets.paceGateOpen(2, {}));
ok("Pace III gate locked with 0 holds", !Tablets.paceGateOpen(3, {}));

eq("23 first answer is want", p23.blanks[0].a, "want");
eq("23 last answer is ever", p23.blanks[10].a, "ever");
["want","pastures","waters","soul","righteousness","evil","staff","enemies","oil","mercy","ever"]
  .forEach(function(w, i){ eq("23 blank " + (i + 1) + " is " + w, p23.blanks[i].a, w); });
["Almighty","fortress","fowler","feathers","buckler","night","noonday","right","wicked","habitation","dwelling","angels","stone","trample","deliver","trouble","salvation"]
  .forEach(function(w, i){ eq("91 blank " + (i + 1) + " is " + w, p91.blanks[i].a, w); });

p23.blanks.concat(p91.blanks).forEach(function(blank){
  const opts = Tablets.options(blank);
  eq(blank.r + " has 4 options", opts.length, 4);
  ok(blank.r + " includes the KJV word", opts.indexOf(blank.a) >= 0);
  ok(blank.r + " has 3 decoys", blank.d.length >= 3);
});

ok("Psalm 23 is unlocked", Tablets.unlocked("psalm23", {}));
ok("Psalm 91 locked until Hold", !Tablets.unlocked("psalm91", { tablets:{ psalm23:{ held:false } } }));
ok("Psalm 91 opens after Hold", Tablets.unlocked("psalm91", { tablets:{ psalm23:{ held:true } } }));
eq("next after 23 is 91 once held", Tablets.nextPlayable("psalm23", { tablets:{ psalm23:{ held:true } } }).id, "psalm91");
ok("no next after 23 until Hold", !Tablets.nextPlayable("psalm23", {}));
ok("John 1 locked until Psalm 91 Hold", !Tablets.unlocked("john1", { tablets:{ psalm23:{ held:true }, psalm91:{ held:false } } }));
ok("John 1 opens after Psalm 91 Hold", Tablets.unlocked("john1", { tablets:{ psalm23:{ held:true }, psalm91:{ held:true } } }));
eq("John 1 has 51 blanks", Tablets.chapter("john1").blanks.length, 51);
eq("John 1 first answer is Word", Tablets.chapter("john1").blanks[0].a, "Word");
eq("Exodus 20 is in the canon", Tablets.chapter("exodus20").id, "exodus20");
eq("John 14 is in the canon", Tablets.chapter("john14").id, "john14");
eq("20 road chapters", Tablets.canon.length, 20);
eq("20 hall chapters", Tablets.hall.length, 20);
eq("100 more chapters", Tablets.more.length, 100);
eq("144 total chapters", Tablets.chapters.length, 144);
eq("47 Pace I playable chapters", Tablets.chapters.filter(c => !c.tutorial && Tablets.paceOf(c) === 1).length, 47);
eq("48 Pace II playable chapters", Tablets.chapters.filter(c => !c.tutorial && Tablets.paceOf(c) === 2).length, 48);
eq("48 Pace III playable chapters", Tablets.chapters.filter(c => !c.tutorial && Tablets.paceOf(c) === 3).length, 48);
ok("hall stays off the road", Tablets.hall.every(function(c){ return !c.after && c.hall; }));
ok("hall locked until John 1", !Tablets.unlocked("genesis3", { tablets:{ john1:{ held:false } } }));
ok("hall opens after John 1 Hold", Tablets.unlocked("genesis3", { tablets:{ john1:{ held:true } } }));
eq("prayer has 8 blanks", Tablets.chapter("prayer").blanks.length, 8);
ok("prayer is unlocked", Tablets.unlocked("prayer", {}));

Tablets.chapters.forEach(function(ch){
  ok(ch.id + " has valid blanks", ch.blanks && ch.blanks.length >= 8);
  ch.blanks.forEach(function(blank){
    const opts = Tablets.options(blank);
    eq(ch.id + " " + blank.r + " has 4 options", opts.length, 4);
    ok(ch.id + " " + blank.r + " includes the KJV word", opts.indexOf(blank.a) >= 0);
    ok(ch.id + " " + blank.r + " has 3 decoys", blank.d.length >= 3);
    const uniq = {};
    [blank.a].concat(blank.d.slice(0, 3)).forEach(function(w){ uniq[String(w).toLowerCase()] = 1; });
    eq(ch.id + " " + blank.r + " stones are unique", Object.keys(uniq).length, 4);
  });
});

ok("clean 23 is Held", Tablets.held({ tabletMiss:0, tabletIdx:11, tabletTotal:11 }));
ok("a miss with a lamp lit still Holds", Tablets.held({ tabletMiss:1, tabletLives:2, tabletIdx:11, tabletTotal:11 }));
ok("no lamp lit is not Held", !Tablets.held({ tabletMiss:2, tabletLives:2, tabletIdx:11, tabletTotal:11 }));
ok("short run is not Held", !Tablets.held({ tabletMiss:0, tabletIdx:4, tabletTotal:11 }));

{
  const TR = Tablets.rules;
  const near = function(a, b){ return Math.abs(a - b) < 1e-9; };
  eq("progress 0.3 is divine", TR.grade(0.3).id, "divine");
  eq("progress 0.31 is sacred", TR.grade(0.31).id, "sacred");
  eq("progress 0.65 is sacred", TR.grade(0.65).id, "sacred");
  eq("progress 0.66 is carved", TR.grade(0.66).id, "carved");
  eq("progress 0.82 is carved", TR.grade(0.82).id, "carved");
  eq("progress 0.83 is clutch", TR.grade(0.83).id, "clutch");
  eq("progress below 0 clamps to divine", TR.grade(-1).id, "divine");
  eq("progress above 1 clamps to clutch", TR.grade(2).id, "clutch");
  eq("full sand is progress 0", TR.progressOf(25, 25), 0);
  eq("empty sand is progress 1", TR.progressOf(0, 25), 1);
  eq("half sand is progress 0.5", TR.progressOf(12.5, 25), 0.5);
  eq("extra sand clamps to 0", TR.progressOf(30, 25), 0);
  eq("no clock reads as spent", TR.progressOf(5, 0), 1);

  const first = TR.carve({ progress:0.1, streak:0 });
  eq("first divine carve is 150", first.points, 150);
  eq("first carve starts the streak", first.streak, 1);
  eq("first carve is divine", first.grade, "divine");
  eq("divine fills 28", first.fill, 28);
  eq("second carve at 1.5x carved is 150", TR.carve({ progress:0.7, streak:1 }).points, 150);
  const stacked = TR.carve({ progress:0.9, streak:3, surge:true, golden:true, glory:true, typed:true });
  eq("every multiplier stacks to 2150", stacked.points, 2150);
  eq("typed clutch fills 43", stacked.fill, 43);
  eq("pace multiplier rounds to 5", TR.carve({ progress:0.5, streak:0, paceMult:1.35 }).points, 160);
  eq("tenth carve adds 500", TR.carve({ progress:0.5, streak:9 }).points, 920);
  eq("combo caps at 5x", TR.carve({ progress:0.5, streak:40 }).points, 600);

  eq("streak 9 is no milestone", TR.milestone(9), null);
  eq("streak 10 bonus is 500", TR.milestone(10).bonus, 500);
  eq("streak 25 bonus is 1500", TR.milestone(25).bonus, 1500);
  eq("streak 50 bonus is 3500", TR.milestone(50).bonus, 3500);
  eq("streak 60 is no milestone", TR.milestone(60), null);
  eq("streak 75 bonus is 3500", TR.milestone(75).bonus, 3500);
  eq("the milestone rides on the carve", TR.carve({ progress:0.5, streak:24 }).milestone.streak, 25);

  eq("a fresh blank keeps base seconds", TR.blankSeconds(6.5, 0, 0, false), 6.5);
  ok("a golden blank runs at 0.9", near(TR.blankSeconds(6.5, 0, 0, true), 5.85));
  ok("the ramp caps at 30 percent", near(TR.blankSeconds(6.5, 100, 100, false), 4.55));
  eq("a blank never drops below 1.55s", TR.blankSeconds(2, 100, 100, false), 1.55);

  const crack = TR.miss(3, false, 0.9);
  eq("a miss spends one lamp", crack.lit, 2);
  eq("a miss with lamps left goes on", crack.ended, false);
  ok("a miss pushes the sand back 0.45", near(crack.progress, 0.45));
  eq("pushback stops at 0.12", TR.miss(3, false, 0.3).progress, 0.12);
  eq("the last lamp ends the run", TR.miss(1, false, 0.5).ended, true);
  const judged = TR.miss(3, true, 0.2);
  eq("judgment ends on the first miss", judged.ended, true);
  eq("judgment leaves no lamp", judged.lit, 0);

  eq("flawless is S+", TR.rank(11, 11, 0, 2), "S+");
  eq("one miss is S", TR.rank(11, 11, 1, 1), "S");
  eq("two misses is A", TR.rank(11, 11, 2, 1), "A");
  eq("finished dark is B", TR.rank(11, 11, 2, 0), "B");
  eq("three quarters unfinished is B", TR.rank(9, 11, 1, 0), "B");
  eq("under three quarters is C", TR.rank(5, 11, 1, 0), "C");
  eq("an empty chapter is C", TR.rank(0, 0, 0, 2), "C");

  const none = { winnow:0, illuminate:0 };
  eq("streak 4 recharges nothing", TR.recharge(none, 4, null).gained.join(","), "");
  eq("streak 5 recharges Winnow", TR.recharge(none, 5, null).gained.join(","), "winnow");
  eq("streak 10 recharges Winnow and Illuminate", TR.recharge(none, 10, null).gained.join(","), "winnow,illuminate");
  eq("a milestone adds Illuminate", TR.recharge({ winnow:3, illuminate:0 }, 15, { streak:15 }).gained.join(","), "illuminate");
  eq("a capped Winnow is not granted", TR.recharge({ winnow:3, illuminate:0 }, 5, null).gained.join(","), "");
  eq("charges cap at 3", TR.recharge({ winnow:3, illuminate:2 }, 10, null).charges.illuminate, 3);
  eq("recharge leaves its input alone", none.winnow, 0);
}

const src = fs.readFileSync(path.join(ROOT, "js", "tablets.js"), "utf8")
  + fs.readFileSync(path.join(ROOT, "js", "tablets-run.js"), "utf8")
  + fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const gameSrc = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
ok("no Three.js", !/three\.js/i.test(src) && !/\bTHREE\b/.test(src));
ok("no importmap", !/importmap/.test(src));
ok("no Google Fonts", !/fonts\.googleapis/.test(src));
ok("the carved slot is in the view", html.indexOf('id="tablets-slot"') >= 0);
ok("the verse line is in the view", html.indexOf('id="tablets-verse"') >= 0);
ok("the fracture overlay is in the view", html.indexOf('id="tablets-fracture"') >= 0);
ok("pause overlay is in the view", html.indexOf('id="tablets-pause"') >= 0);
ok("the roll is gone", html.indexOf('id="tablets-roll"') < 0);
ok("the tablet clips instead of scrolling by hand", /\.tablets-ms\{[^}]*overflow:\s*hidden/.test(src));
ok("reduced motion hides the canvas", /body\.reduced #tablets-fx/.test(src));
ok("no hear control", html.indexOf('id="tablets-hear"') < 0);
ok("illuminate control is in the view", html.indexOf('id="tablets-illum"') >= 0);
ok("remaining counter is in the view", html.indexOf('id="tablets-remain"') >= 0);
ok("Esc pauses tablets instead of leaving", /currentView==="tablets"[\s\S]{0,80}toggleTabletsPause/.test(gameSrc));
ok("hit does not add an empty class", !/classList\.add\("in", answer === "miss"/.test(src));
ok("resolve timeout is armed before paint", (()=>{
  const i = src.indexOf("function tabletsResolve(ok)");
  const j = src.indexOf("function tabletsUnlockGrid");
  const fn = i >= 0 && j > i ? src.slice(i, j) : "";
  return fn.indexOf("setTimeout") >= 0 && fn.indexOf("setTimeout") < fn.indexOf("tabletsResolveMiss");
})());
ok("companion sits on the hold", html.indexOf('id="tablets-companion"') >= 0);
ok("the scene has a candle, not a walker", html.indexOf('id="tablets-candle"') >= 0 && html.indexOf('id="tablets-walker-sprite"') < 0);
ok("walker walks onto tablet pins", !/if \(to && to\.kind === "tablets"\) \{\s*snapTraveler/.test(fs.readFileSync(path.join(ROOT, "js", "atlas.js"), "utf8")));

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("opens tablets view", read(sb, "currentView"), "tablets");
  eq("one Illuminate", read(sb, "R.powers.illum"), 1);
  eq("no Selah or Wind", read(sb, "R.powers.selah + R.powers.wind"), 0);
  eq("chapter is Psalm 23", read(sb, "R.tabletChapter"), "psalm23");
  eq("starts on Pace I", read(sb, "R.tabletLevel"), 1);
  eq("Psalm 23 paints 6 step pips", read(sb, "$('tablets-pips').children.length"), 6);
  eq("91 still locked", read(sb, "Tablets.unlocked('psalm91', SAVE)"), false);
  stubRandom(sb, 0.9);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("a hit advances the gap", read(sb, "R.gapIdx"), 1);
  eq("the step holds until every gap is carved", read(sb, "R.tabletIdx"), 0);
  eq("the clock keeps racing after a hit", read(sb, "R.tabletRacing"), true);
  eq("resolving clears", read(sb, "!!R.tabletResolving"), false);
  holdAll(sb);
  eq("clean 23 ends complete", read(sb, "R.ended"), true);
  eq("Held", read(sb, "Tablets.held(R)"), true);
  eq("psalm 23 Held on save", read(sb, "SAVE.tablets.psalm23.held"), true);
  eq("kick is Hold on Pace I", read(sb, "$('res-kick').textContent"), "Pace I held. Psalm 91 is open.");
  ok("Hold board is shown", read(sb, "$('res-board').style.display !== 'none'"));
  ok("Hold board names Psalm 23", read(sb, "$('res-board').innerHTML.indexOf('Psalm 23') >= 0"));
  eq("retry is Carve again", read(sb, "$('res-retry').textContent"), "Carve again");
  eq("unique Hold counted once", read(sb, "SAVE.life.tabletHolds"), 1);
  eq("best is 100", read(sb, "SAVE.best.tablets"), 100);
  eq("91 unlocked after Psalm 23 Hold", read(sb, "Tablets.unlocked('psalm91', SAVE)"), true);
  eq("next challenge is Psalm 91", read(sb, "$('res-next').textContent"), "Next · Psalm 91");
  eq("next challenge is shown", read(sb, "$('res-next').style.display !== 'none'"), true);
  exec(sb, "$('res-next').onclick()");
  eq("next challenge starts Psalm 91", read(sb, "R.tabletChapter"), "psalm91");
  eq("next challenge is in the Hold", read(sb, "currentView"), "tablets");
  eq("XP paid", read(sb, "SAVE.xp > 0"), true);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("a blank starts with 25s", read(sb, "R.tabletClock"), 25);
  stubRandom(sb, 0.9);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("the next blank resets to 25s", read(sb, "R.tabletClock"), 25);
  exec(sb, "R.tabletClock = 0.05; tabletsBurnSand(0.1)");
  eq("empty sand ends the run", read(sb, "R.ended"), true);
  eq("timeout is recorded", read(sb, "!!R.tabletTimeout"), true);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("three lamps start the Hold", read(sb, "R.tabletLives"), 3);
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the first miss spends a lamp, not the run", read(sb, "R.ended"), false);
  eq("one lamp is gone", read(sb, "R.tabletMiss"), 1);
  eq("the same blank re-arms", read(sb, "R.tabletIdx"), 0);
  eq("a miss on a fresh clock settles the sand at 12% gone",
    read(sb, "Math.abs((1 - R.tabletClock / R.tabletClockMax) - 0.12) < 1e-9"), true);
  eq("the clock keeps racing after the crack", read(sb, "R.tabletRacing"), true);
  eq("lamps read two", read(sb, "$('tablets-lamps').textContent"), "Lamps ×2");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the second miss takes the second lamp", read(sb, "R.tabletMiss"), 2);
  eq("the second miss is not the end", read(sb, "R.ended"), false);
  eq("lamps read one", read(sb, "$('tablets-lamps').textContent"), "Lamps ×1");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the third miss ends the run", read(sb, "R.ended"), true);
  eq("not Held", read(sb, "Tablets.held(R)"), false);
  eq("91 stays locked", read(sb, "SAVE.tablets.psalm23.held"), false);
  eq("kick is shatter", read(sb, "$('res-kick').textContent"), "The tablet shattered");
  eq("retry stays Carve again", read(sb, "$('res-retry').textContent"), "Carve again");
  eq("shatter hides next challenge", read(sb, "$('res-next').style.display"), "none");
}

{
  const sb = boot();
  exec(sb, "SAVE.tablets.psalm23 = { held: true }; persist(); startRun('tablets','watchman',{tabletChapter:'psalm91'})");
  eq("Psalm 91 starts when unlocked", read(sb, "R.tabletChapter"), "psalm91");
  eq("Psalm 91 chunks into 9 steps", read(sb, "R.tabletTotal"), 9);
  holdAll(sb);
  eq("91 Held", read(sb, "SAVE.tablets.psalm91.held"), true);
}

{
  const sb = boot();
  exec(sb, "SAVE.tablets.psalm23 = { held: true }; SAVE.tablets.psalm91 = { held: true }; persist(); startRun('tablets','watchman',{tabletChapter:'john1'})");
  eq("John 1 starts when unlocked", read(sb, "R.tabletChapter"), "john1");
  eq("John 1 chunks into 26 steps", read(sb, "R.tabletTotal"), 26);
  eq("John 1 skips a 51-pip strip", read(sb, "$('tablets-pips').children.length"), 0);
  holdAll(sb);
  eq("John 1 Held", read(sb, "SAVE.tablets.john1.held"), true);
  eq("hall Pace I opens after John 1", read(sb, "Tablets.unlocked('genesis3', SAVE)"), true);
  eq("Pace II opens after 3 Pace I Holds", read(sb, "Tablets.paceGateOpen(2, SAVE)"), true);
  eq("Pace II chapter Exodus 12 unlocked", read(sb, "Tablets.unlocked('exodus12', SAVE)"), true);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "toggleTabletsPause()");
  eq("pause stops the race", read(sb, "R.paused"), true);
  eq("pause overlay is on", read(sb, "$('tablets-pause').classList.contains('on')"), true);
  exec(sb, "toggleTabletsPause()");
  eq("resume clears pause", read(sb, "R.paused"), false);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("Illuminate starts at 1", read(sb, "R.powers.illum"), 1);
  eq("Winnow starts at 2", read(sb, "R.powers.winnow"), 2);
  eq("three lamps shown", read(sb, "$('tablets-lamps').textContent"), "Lamps ×3");
  exec(sb, "tabletsIlluminate()");
  eq("hint spends Illuminate", read(sb, "R.powers.illum"), 0);
  eq("illuminate leaves four stones live", read(sb, "$('tablets-grid').children.filter(function(c){ return !c.disabled; }).length"), 4);
  eq("one stone is revealed", read(sb, "$('tablets-grid').children.filter(function(c){ return c.classList.contains('revealed'); }).length"), 1);
  exec(sb, "tabletsIlluminate()");
  eq("already hinted does not spend", read(sb, "R.powers.illum"), 0);
  stubRandom(sb, 0.9);
  for (let i = 0; i < 11; i++) exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("perfect run after hints still Holds", read(sb, "Tablets.held(R)"), true);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsWinnow()");
  eq("winnow spends one charge", read(sb, "R.powers.winnow"), 1);
  eq("winnow dims two decoys", read(sb, "tabletsGreyWords().length"), 2);
  eq("two stones stay live", read(sb, "$('tablets-grid').children.filter(function(c){ return !c.classList.contains('dim'); }).length"), 2);
  exec(sb, "tabletsWinnow()");
  eq("a second Winnow on the same blank does not spend", read(sb, "R.powers.winnow"), 1);
  stubRandom(sb, 0.9);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  exec(sb, "tabletsWinnow()");
  eq("winnow re-arms on the next gap", read(sb, "R.tabletWinnowIdx"), "0:1");
  eq("charges carry across blanks", read(sb, "R.powers.winnow"), 0);
}

{
  const sb = boot();
  exec(sb, `(function(){
    var list = Pilgrimage.stops();
    var p = SAVE.pilgrim;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === "exodus20") break;
      p = Pilgrimage.record(p, list[i].id, { cleared: true, score: 10, accuracy: 100, at: 1 });
    }
    SAVE.pilgrim = p;
  })();
  startRun("pilgrimage", "watchman");`);
  eq("Sinai's tablet opens as tablets", read(sb, "R.mode"), "tablets");
  eq("chapter is Exodus 20", read(sb, "R.tabletChapter"), "exodus20");
  eq("from the road", read(sb, "!!R.fromRoad"), true);
  holdAll(sb);
  eq("Exodus 20 Held", read(sb, "SAVE.tablets.exodus20.held"), true);
  eq("Exodus 20 stop recorded", read(sb, "Pilgrimage.isCleared(SAVE.pilgrim, 'exodus20')"), true);
  eq("Kadesh unlocked after Hold", read(sb, "Pilgrimage.isUnlocked(SAVE.pilgrim, 'kadesh')"), true);
}

{
  const sb = boot();
  exec(sb, "openBrief('tablets')");
  eq("first open is the prayer", read(sb, "R.tabletChapter"), "prayer");
  eq("tutorial flag", read(sb, "!!R.tabletTutorial"), true);
  eq("tutorial is untimed", read(sb, "tabletsUntimed()"), true);
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("a miss does not shatter the prayer", read(sb, "!!R.ended"), false);
  eq("still the same blank", read(sb, "R.tabletIdx"), 0);
  holdAll(sb);
  eq("prayer opens the brief", read(sb, "currentView"), "brief");
  eq("tutorial is done", read(sb, "SAVE.set.tabletsTutorialDone"), true);
  eq("prayer pays no XP", read(sb, "SAVE.xp"), 0);
  eq("prayer is not a chapter Hold", read(sb, "!(SAVE.tablets.prayer && SAVE.tablets.prayer.held)"), true);
}

{
  const sb = boot();
  let threw = false;
  try { exec(sb, '$("tablets-sheet").classList.add("")'); }
  catch (e) { threw = true; }
  ok("empty class token throws in the shim", threw);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'genesis1'})");
  eq("Genesis 1 opens", read(sb, "R.tabletChapter"), "genesis1");
  eq("Genesis 1 starts with 25s", read(sb, "R.tabletClock"), 25);
  eq("place is Ur", read(sb, "$('tablets-place').textContent"), "Ur");
  eq("companion is Abram", read(sb, "$('tablets-companion-sign').textContent"), "Abram");
  eq("companion is shown", read(sb, "!$('tablets-companion').hidden"), true);
  exec(sb, "paintTabletsStage('hit')");
  eq("a carved hit does not throw", read(sb, "R.tabletIdx"), 0);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("the slot starts empty", read(sb, "$('tablets-slot').textContent"), "— — —");
  exec(sb, "tabletsPick('want')");
  eq("the slot takes the carved word", read(sb, "$('tablets-slot').textContent"), "want");
  ok("the slot glows", read(sb, "$('tablets-slot').classList.contains('glow')"));
  ok("the verse keeps the prefix", read(sb, "$('tablets-verse').children.map(function(l){ return l.children.map(function(c){ return c.textContent; }).join(''); }).join('').indexOf('The LORD') >= 0"));
  exec(sb, "tabletsFinishResolve(true); tabletsResolve(false)");
  ok("a miss opens the fracture", read(sb, "$('tablets-fracture').classList.contains('active')"));
}

{
  const sb = boot();
  exec(sb, "SAVE.set.tabletsTutorialDone = true; openBrief('tablets')");
  eq("brief view open", read(sb, "currentView"), "brief");
  eq("brief has prayer + three pace sections", read(sb, "$('brief-tablets-pick').children.length"), 4);
  eq("first section is the prayer", read(sb, "$('brief-tablets-pick').children[0].children[0].textContent"), "The prayer");
  ok("no per-level chips in the brief", !/tablets-lv/.test(fs.readFileSync(path.join(ROOT, "js", "briefs.js"), "utf8")));
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'prayer',tabletTutorial:true})");
  eq("tutorial callout is visible", read(sb, "!$('tablets-tut-callout').hidden"), true);
  ok("tutorial callout gives step guidance", read(sb, "$('tablets-tut-callout').textContent.toLowerCase().includes('father')"));
  exec(sb, "tabletsPick('Father')");
  eq("the slot takes Father", read(sb, "$('tablets-slot').textContent"), "Father");
  ok("the slot glows on a hit", read(sb, "$('tablets-slot').classList.contains('glow')"));
  ok("the verse keeps Our", read(sb, "$('tablets-verse').children.map(function(l){ return l.children.map(function(c){ return c.textContent; }).join(''); }).join('').indexOf('Our') >= 0"));
  ok("score popup is rendered", read(sb, "$('tablets-ms').children.some(c => c.classList.contains('tablets-score-popup'))"));
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("a fresh sand carve pays 150 Favor", read(sb, "R.favor"), 150);
  eq("fresh sand fills the surge 28", read(sb, "R.surge"), 28);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("streak 3 is ANOINTED", read(sb, "tabletsTier(R.streak).name"), "ANOINTED");
  eq("streak 3 multiplies the carve by 1.5", read(sb, "tabletsTier(R.streak).mult"), 1.5);
  exec(sb, "R.surge = 100; R.powers.winnow = 2; var c = R.tabletClock; tabletsSurge(); tabletsBurnSand(1); window._surgeClock = R.tabletClock === c");
  eq("surge freezes the sand", read(sb, "!!R.surgeOn"), true);
  eq("surge does not spend winnow", read(sb, "R.powers.winnow"), 2);
  eq("surge burn leaves the clock", read(sb, "window._surgeClock"), true);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.1);
  exec(sb, "R.tabletClock = 10");
  const before = read(sb, "({clock:R.tabletClock,lives:R.tabletLives,surge:R.surge})");
  exec(sb, "tabletsRollBlessing()");
  const after = read(sb, "({clock:R.tabletClock,lives:R.tabletLives,surge:R.surge})");
  ok("a blessing changes clock, lives, or surge", after.clock !== before.clock || after.lives !== before.lives || after.surge !== before.surge);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.tabletClock = 10; tabletsRollBlessing()");
  eq("no blessing at 0.9 clock", read(sb, "R.tabletClock"), 10);
  eq("no blessing at 0.9 lives", read(sb, "R.tabletLives"), 3);
  eq("no blessing at 0.9 surge", read(sb, "R.surge"), 0);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsCycleStone()");
  eq("Stone cycles to basalt", read(sb, "SAVE.set.tabletStone"), "basalt");
  ok("basalt class is on the view", read(sb, "$('v-tablets').classList.contains('stone-basalt')"));
}

{
  const sb = boot();
  exec(sb, "SAVE.set.tabletStone = 'basalt'; persist(); startRun('tablets','watchman')");
  ok("saved stone applies on start", read(sb, "$('v-tablets').classList.contains('stone-basalt')"));
}

ok("timeout copy names the sand", /The sand ran out\. The blank stayed empty when the Hold closed/.test(
  fs.readFileSync(path.join(ROOT, "js", "director.js"), "utf8")));
ok("brief names the chapter clock", /clockS/.test(fs.readFileSync(path.join(ROOT, "js", "briefs.js"), "utf8")));
/* Floor, not a range: the cache version keeps climbing, so pin the minimum
   ("past 1.8.60") instead of a window that rots on the next bump. */
const cacheVersion = (fs.readFileSync(path.join(ROOT, "sw.js"), "utf8")
  .match(/CACHE_VERSION = "ctv-v(\d+)\.(\d+)\.(\d+)"/) || []).slice(1).map(Number);
const cacheNum = cacheVersion.length === 3
  ? cacheVersion[0] * 1000000 + cacheVersion[1] * 1000 + cacheVersion[2] : 0;
ok("cache version is at or past 1.8.60", cacheNum >= 1008060, { got: cacheVersion.join(".") });
const fontsCss = fs.readFileSync(path.join(ROOT, "css", "fonts.css"), "utf8");
ok("Hold fonts are the pruned set: Cinzel, Garamond and Barlow Condensed only",
  /font-family:\s*"Cinzel"/.test(fontsCss) && /font-family:\s*"EB Garamond"/.test(fontsCss) &&
  /font-family:\s*"Barlow Condensed"/.test(fontsCss) && !/Cinzel\+Decorative/.test(html) &&
  !/family=Inter/.test(html) && !/fonts\.googleapis/.test(html));
ok("the Hold does not paint god-rays", !/tabletsFx\.rays/.test(src));
ok("the Hold has no screen wash overlay", !/#v-tablets:after/.test(fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8")));
ok("Hold aura stays off until surge", /#tablets-aura\{[^}]*animation:\s*none/.test(fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8")));
ok("the Hold keeps a few embers", /i < 8/.test(src) && !/i < 45/.test(src));
ok("a hit registers after the fly", /tabletsFlyWord[\s\S]{0,220}paintTabletsTablet\("hit"\)/.test(src));
ok("torch scene is in the view", html.indexOf("tablets-scene-svg") >= 0);
ok("candle is in the scene", html.indexOf('id="tablets-candle"') >= 0);
ok("trial control is in the view", html.indexOf('id="tablets-trial"') >= 0);

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsToggleTrial()");
  eq("trial is on", read(sb, "!!R.tabletTrial"), true);
  ok("trial class is on the view", read(sb, "$('v-tablets').classList.contains('trial-mode')"));
  exec(sb, "R.tabletClock = 10; tabletsBurnSand(1)");
  eq("trial drains 1.35s", Math.abs(read(sb, "R.tabletClock") - 8.65) < 0.001, true);
  stubRandom(sb, 0.9);
  exec(sb, "R.tabletClock = 25; R.streak = 0; R.favor = 0; tabletsResolve(true)");
  eq("trial Favor is 2.5×", read(sb, "R.favor"), 375);
}

{
  // Phase 2: the sand that is left grades the carve.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.tabletClock = 10; R.streak = 1; tabletsResolve(true); tabletsFinishResolve(true)");
  eq("a hit with 15s gone is Sure", read(sb, "tabletsGradeName('sacred')"), "Sure");
  eq("the popup names the grade and the Favor",
    read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "Sure · +180 FAVOR");
  eq("the Sure grade pays 180 Favor", read(sb, "R.favor"), 180);
  eq("the Sure grade fills the surge 20", read(sb, "R.surge"), 20);
  eq("the four grades wear the game's words",
    read(sb, "['divine','sacred','carved','clutch'].map(tabletsGradeName).join('|')"),
    "Fresh sand|Sure|Carved|Last grain");
}

{
  // D2: Surge doubles the carve.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.tabletClock = 10; R.streak = 1; R.surgeOn = true; tabletsResolve(true); tabletsFinishResolve(true)");
  eq("Surge doubles the Sure carve", read(sb, "R.favor"), 360);
  ok("Surge is not the old x3", read(sb, "R.favor !== 540"));
}

{
  // The tutorial stays ungraded and never fills the Surge.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'prayer',tabletTutorial:true})");
  exec(sb, "tabletsPick('Father')");
  eq("a tutorial hit carries no grade",
    read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "+150 FAVOR");
  eq("the tutorial never fills the surge", read(sb, "R.surge"), 0);
}

{
  // Phase 3: a miss pushes the sand back, and the floor holds.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "R.tabletClock = 2.5");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("a miss at 90% gone leaves 45% gone",
    read(sb, "Math.abs((1 - R.tabletClock / R.tabletClockMax) - 0.45) < 1e-9"), true);
  ok("a late miss gives sand back", read(sb, "R.tabletClock") > 2.5);
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the pushback floor holds at 12% gone",
    read(sb, "Math.abs((1 - R.tabletClock / R.tabletClockMax) - 0.12) < 1e-9"), true);
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("three misses shatter the tablet", read(sb, "R.ended"), true);
}

{
  // D1: a finished run with one lamp still lit is Held.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("two misses leave one lamp", read(sb, "$('tablets-lamps').textContent"), "Lamps ×1");
  stubRandom(sb, 0.9);
  holdAll(sb);
  eq("a run that ends on one lamp is still Held", read(sb, "Tablets.held(R)"), true);
}

{
  // Phase 4: typing the word letter by letter carves it.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  type("w");
  type("a");
  eq("the slot shows the letters typed", read(sb, "$('tablets-slot').textContent"), "wa");
  type("n");
  type("t");
  eq("the typed popup pays the +50", read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "Fresh sand · +200 FAVOR");
  eq("the typed carve pays 200 Favor", read(sb, "R.favor"), 200);
  eq("the typed carve fills 36", read(sb, "R.surge"), 36);
  eq("the slot takes the carved word", read(sb, "$('tablets-slot').textContent"), "want");
  exec(sb, "tabletsFinishResolve(true)");
  eq("typing want carves Psalm 23:1", read(sb, "R.gapIdx"), 1);
  eq("the next gap starts with nothing typed", read(sb, "R.tabletTyped"), "");
}

{
  // A wrong letter is ignored, and a letter never picks a tablet.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  type("w");
  type("x");
  eq("a wrong letter is ignored", read(sb, "R.tabletTyped"), "w");
  eq("a wrong letter is not a miss", read(sb, "R.tabletMiss"), 0);
  eq("a wrong letter resolves nothing", read(sb, "(R.attempts || 0)"), 0);
  type("a");
  type("a");
  eq("a does not pick a tablet", read(sb, "(R.attempts || 0)"), 0);
  eq("a is not a miss either", read(sb, "R.tabletMiss"), 0);
}

{
  // w types for "waters" but fires Winnow for "soul".
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  exec(sb, "R.tabletIdx = 1; R.gapIdx = 0; R.tabletTyped = ''; paintTabletsTray()");
  eq("the third gap is waters", read(sb, "tabletsGapBlank().a"), "waters");
  type("w");
  eq("w types a letter for waters", read(sb, "R.tabletTyped"), "w");
  exec(sb, "R.gapIdx = 1; R.tabletTyped = ''; paintTabletsTray()");
  eq("the fourth gap is soul", read(sb, "tabletsGapBlank().a"), "soul");
  type("w");
  eq("w fires Winnow for soul", read(sb, "R.powers.winnow"), 1);
  eq("w typed nothing for soul", read(sb, "R.tabletTyped"), "");
}

{
  // Backspace takes the last letter back.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  type("w");
  type("a");
  type("Backspace");
  eq("Backspace removes a letter", read(sb, "R.tabletTyped"), "w");
  eq("the slot forgets the letter", read(sb, "$('tablets-slot').textContent"), "w");
  type("Backspace");
  eq("an empty prefix shows the empty slot", read(sb, "$('tablets-slot').textContent"), "— — —");
}

{
  // O3: Winnow takes min(3, decoys - 1), so it never clears the tray.
  eq("three decoys leave two for Winnow", Tablets.rules.winnowCount(3), 2);
  eq("five decoys take at most three", Tablets.rules.winnowCount(5), 3);
  eq("a lone decoy is left alone", Tablets.rules.winnowCount(1), 0);
}

{
  // O4: Illuminate carves the true word, graded Carved.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "tabletsIlluminate()");
  eq("Illuminate carves the gap", read(sb, "R.favor"), 100);
  eq("the Illuminate carve is graded Carved",
    read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "Carved · +100 FAVOR");
  eq("the Illuminate carve counts the streak", read(sb, "R.streak"), 1);
  eq("Illuminate still spends its charge", read(sb, "R.powers.illum"), 0);
  exec(sb, "tabletsFinishResolve(true)");
  eq("the carved gap advances", read(sb, "R.gapIdx"), 1);
}

{
  // D4: the milestones wear the game's names and pay on the carve.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  eq("streak 10 is the Tithe", read(sb, "tabletsMilestoneName(10)"), "Tithe");
  eq("streak 25 is the Double portion", read(sb, "tabletsMilestoneName(25)"), "Double portion");
  eq("streak 75 is still Jubilee", read(sb, "tabletsMilestoneName(75)"), "Jubilee");
  exec(sb, "R.streak = 9");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("the Tithe names itself and its Favor", read(sb, "$('tablets-blessing-text').textContent"), "Tithe · +500 FAVOR");
  eq("the Tithe rides on the carve", read(sb, "R.favor"), 1025);
  eq("the tenth streak recharges Illuminate", read(sb, "R.powers.illum"), 2);
}

{
  // D2: the streak gives the charges back, Winnow first.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.streak = 4");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("streak 5 restores Winnow", read(sb, "R.powers.winnow"), 3);
  eq("streak 5 leaves Illuminate alone", read(sb, "R.powers.illum"), 1);
}

{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("Pace I carves 2 gaps per step", read(sb, "tabletsGapCount()"), 2);
  eq("Psalm 23 chunks 11 blanks into 6 steps", read(sb, "R.tabletTotal"), 6);
  eq("first step holds 2 gaps", read(sb, "R.tabletSteps[0].length"), 2);
  eq("last step is the short tail", read(sb, "R.tabletSteps[5].length"), 1);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("first carve advances the gap", read(sb, "R.gapIdx"), 1);
  eq("the step holds", read(sb, "R.tabletIdx"), 0);
  eq("remain counts steps", read(sb, "$('tablets-remain').textContent"), "1 / 6");
  eq("tray names the gap", read(sb, "$('tablets-tray-word').textContent"), "Word 2 of 2 · Choose the missing word");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("second carve advances the step", read(sb, "R.tabletIdx"), 1);
  eq("the gap re-arms", read(sb, "R.gapIdx"), 0);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'genesis1'})");
  eq("Pace II carves 3 gaps per step", read(sb, "tabletsGapCount()"), 3);
  eq("Genesis 1 chunks 10 blanks into 4 steps", read(sb, "R.tabletTotal"), 4);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'genesis22'})");
  eq("Pace III carves 4 gaps per step", read(sb, "tabletsGapCount()"), 4);
  eq("Genesis 22 chunks 10 blanks into 3 steps", read(sb, "R.tabletTotal"), 3);
}

{
  // A miss spends a lamp but keeps already-carved gaps.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the miss spends a lamp", read(sb, "R.tabletMiss"), 1);
  eq("the miss holds the gap", read(sb, "R.gapIdx"), 1);
  ok("the first gap stays carved",
    read(sb, "$('tablets-verse').children[0].children.map(function(c){ return c.textContent; }).join('').indexOf('want') >= 0"));
  ok("the tray re-arms for the next gap",
    read(sb, "tabletsOptsForBlank().indexOf('pastures') >= 0"));
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'prayer',tabletTutorial:true})");
  eq("the tutorial stays single-gap", read(sb, "tabletsGapCount()"), 1);
  eq("the prayer keeps 8 steps", read(sb, "R.tabletTotal"), 8);
}

{
  // Winnow and Illuminate are per gap, not per step.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsWinnow()");
  eq("winnow keys the first gap", read(sb, "R.tabletWinnowIdx"), "0:0");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  exec(sb, "tabletsWinnow()");
  eq("winnow re-arms on the next gap", read(sb, "R.tabletWinnowIdx"), "0:1");
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  holdAll(sb);
  eq("six steps still Hold", read(sb, "Tablets.held(R)"), true);
  eq("best is 100 across steps", read(sb, "SAVE.best.tablets"), 100);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("two gaps share one setting", read(sb, "R.tabletSteps[0].map(function(b){ return b.r; }).join('|')"), "Psalm 23:1|Psalm 23:2");
  ok("every gap line prints its own ref",
    read(sb, "(function(){ paintTabletsTablet(); var ls = $('tablets-verse').children; return ls.length > 0 && ls.filter(function(l){ return l.children[0].textContent.indexOf('Psalm 23:') === 0; }).length === ls.length; })()"));
}

unstubRandom();
if (fail) {
  console.log("FAIL — tablets · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — tablets · " + pass + " assertions");
