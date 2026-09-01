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
function holdAll(sb) {
  const n = read(sb, "R.tabletTotal");
  for (let i = 0; i < n; i++) exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
}

const p23 = Tablets.chapter("psalm23");
const p91 = Tablets.chapter("psalm91");
eq("Psalm 23 has 11 blanks", p23.blanks.length, 11);
eq("Psalm 91 has 17 blanks", p91.blanks.length, 17);
eq("BLANK_MS is 6500", Tablets.BLANK_MS, 6500);
eq("I is 9000", Tablets.LEVEL_MS[0], 9000);
eq("II is 6500", Tablets.LEVEL_MS[1], 6500);
eq("III is 4000", Tablets.LEVEL_MS[2], 4000);
eq("blankMs 1 is 9000", Tablets.blankMs(1), 9000);
eq("blankMs 2 is 6500", Tablets.blankMs(2), 6500);
eq("blankMs 3 is 4000", Tablets.blankMs(3), 4000);
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
eq("prayer has 10 blanks", Tablets.chapter("prayer").blanks.length, 10);
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
ok("a miss is not Held", !Tablets.held({ tabletMiss:1, tabletIdx:11, tabletTotal:11 }));
ok("short run is not Held", !Tablets.held({ tabletMiss:0, tabletIdx:4, tabletTotal:11 }));

const src = fs.readFileSync(path.join(ROOT, "js", "tablets.js"), "utf8")
  + fs.readFileSync(path.join(ROOT, "js", "tablets-run.js"), "utf8")
  + fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const gameSrc = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
ok("no Three.js", !/three\.js/i.test(src) && !/\bTHREE\b/.test(src));
ok("no importmap", !/importmap/.test(src));
ok("no Google Fonts", !/fonts\.googleapis/.test(src));
ok("current line wraps as ordinary text", /\.tablets-current\{[^}]*display:\s*block/.test(src));
ok("blank sits in the line", /\.tablets-blank\{[^}]*inline-flex/.test(src));
ok("pause overlay is in the view", html.indexOf('id="tablets-pause"') >= 0);
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
ok("walker and companion sit on the hold", html.indexOf('id="tablets-walker-sprite"') >= 0 && html.indexOf('id="tablets-companion"') >= 0);
ok("walker walks onto tablet pins", !/if \(to && to\.kind === "tablets"\) \{\s*snapTraveler/.test(fs.readFileSync(path.join(ROOT, "js", "atlas.js"), "utf8")));

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("opens tablets view", read(sb, "currentView"), "tablets");
  eq("one Illuminate", read(sb, "R.powers.illum"), 1);
  eq("no Selah or Wind", read(sb, "R.powers.selah + R.powers.wind"), 0);
  eq("chapter is Psalm 23", read(sb, "R.tabletChapter"), "psalm23");
  eq("starts on Pace I", read(sb, "R.tabletLevel"), 1);
  eq("Psalm 23 paints 11 pips", read(sb, "$('tablets-pips').children.length"), 11);
  eq("91 still locked", read(sb, "Tablets.unlocked('psalm91', SAVE)"), false);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("a hit advances", read(sb, "R.tabletIdx"), 1);
  eq("the clock restarts after a hit", read(sb, "R.tabletRacing"), true);
  eq("resolving clears", read(sb, "!!R.tabletResolving"), false);
  holdAll(sb);
  eq("clean 23 ends complete", read(sb, "R.ended"), true);
  eq("Held", read(sb, "Tablets.held(R)"), true);
  eq("psalm 23 Held on save", read(sb, "SAVE.tablets.psalm23.held"), true);
  eq("kick is Hold on Pace I", read(sb, "$('res-kick').textContent"), "Pace I held. Psalm 91 is open.");
  eq("retry is Carve again", read(sb, "$('res-retry').textContent"), "Carve again");
  eq("unique Hold counted once", read(sb, "SAVE.life.tabletHolds"), 1);
  eq("best is 100", read(sb, "SAVE.best.tablets"), 100);
  eq("91 unlocked after Psalm 23 Hold", read(sb, "Tablets.unlocked('psalm91', SAVE)"), true);
  eq("XP paid", read(sb, "SAVE.xp > 0"), true);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("a miss ends the run", read(sb, "R.ended"), true);
  eq("not Held", read(sb, "Tablets.held(R)"), false);
  eq("91 stays locked", read(sb, "SAVE.tablets.psalm23.held"), false);
  eq("kick is shatter", read(sb, "$('res-kick').textContent"), "The tablet shattered");
  eq("retry stays Carve again", read(sb, "$('res-retry').textContent"), "Carve again");
}

{
  const sb = boot();
  exec(sb, "SAVE.tablets.psalm23 = { held: true }; persist(); startRun('tablets','watchman',{tabletChapter:'psalm91'})");
  eq("Psalm 91 starts when unlocked", read(sb, "R.tabletChapter"), "psalm91");
  eq("17 tablets", read(sb, "R.tabletTotal"), 17);
  holdAll(sb);
  eq("91 Held", read(sb, "SAVE.tablets.psalm91.held"), true);
}

{
  const sb = boot();
  exec(sb, "SAVE.tablets.psalm23 = { held: true }; SAVE.tablets.psalm91 = { held: true }; persist(); startRun('tablets','watchman',{tabletChapter:'john1'})");
  eq("John 1 starts when unlocked", read(sb, "R.tabletChapter"), "john1");
  eq("51 blanks in John 1", read(sb, "R.tabletTotal"), 51);
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
  exec(sb, "tabletsIlluminate()");
  eq("hint spends Illuminate", read(sb, "R.powers.illum"), 0);
  eq("two decoys greyed", read(sb, "R.tabletGrey.length"), 2);
  eq("answer and one fake remain", read(sb, "$('tablets-grid').children.filter(function(c){ return !c.classList.contains('hinted'); }).length"), 2);
  exec(sb, "tabletsIlluminate()");
  eq("already hinted does not spend", read(sb, "R.powers.illum"), 0);
  for (let i = 0; i < 11; i++) exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("perfect run after a hint still Holds", read(sb, "Tablets.held(R)"), true);
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
  eq("place is Ur", read(sb, "$('tablets-place').textContent"), "Ur");
  eq("companion is Abram", read(sb, "$('tablets-companion-sign').textContent"), "Abram");
  eq("companion is shown", read(sb, "!$('tablets-companion').hidden"), true);
  exec(sb, "paintTabletsStage('hit')");
  eq("a carved hit does not throw", read(sb, "R.tabletIdx"), 0);
}

{
  const sb = boot();
  exec(sb, "SAVE.set.tabletsTutorialDone = true; openBrief('tablets')");
  eq("brief view open", read(sb, "currentView"), "brief");
  ok("no tablets-lv chips in brief reading list", read(sb, "!$('brief-tablets-pick').innerHTML.includes('tablets-lv')"));
  ok("brief includes Pace I section", read(sb, "!!$('brief-tablets-pick').querySelector('.tablets-pace-head')"));
}

if (fail) {
  console.log("FAIL — tablets · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — tablets · " + pass + " assertions");
