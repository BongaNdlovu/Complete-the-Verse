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
  eq("two lamps start the Hold", read(sb, "R.tabletLives"), 2);
  const clock = read(sb, "R.tabletClock");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the first miss spends a lamp, not the run", read(sb, "R.ended"), false);
  eq("one lamp is gone", read(sb, "R.tabletMiss"), 1);
  eq("the same blank re-arms", read(sb, "R.tabletIdx"), 0);
  eq("the clock does not reset after a miss", read(sb, "R.tabletClock"), clock);
  eq("the clock keeps racing after the crack", read(sb, "R.tabletRacing"), true);
  eq("lamps read one", read(sb, "$('tablets-lamps').textContent"), "Lamps ×1");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the second miss ends the run", read(sb, "R.ended"), true);
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
  eq("two lamps shown", read(sb, "$('tablets-lamps').textContent"), "Lamps ×2");
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
  eq("first carve Favor is 480", read(sb, "R.favor"), 480);
  eq("fast hit charges surge 17", read(sb, "R.surge"), 17);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("streak 3 is ANOINTED", read(sb, "tabletsTier(R.streak).name"), "ANOINTED");
  eq("streak 3 multiplies by 2", read(sb, "tabletsTier(R.streak).mult"), 2);
  exec(sb, "R.surge = 100; var c = R.tabletClock; tabletsSurge(); tabletsBurnSand(1); window._surgeClock = R.tabletClock === c");
  eq("surge freezes the sand", read(sb, "!!R.surgeOn"), true);
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
  eq("no blessing at 0.9 lives", read(sb, "R.tabletLives"), 2);
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
ok("cache is 1.8.53", /ctv-v1\.8\.53/.test(fs.readFileSync(path.join(ROOT, "sw.js"), "utf8")));
ok("Hold fonts are the pruned set: Cinzel, Garamond and Barlow Condensed only", /family=Cinzel:wght@600;700;800;900/.test(html) && /family=Barlow\+Condensed:wght@400;600/.test(html) && !/Cinzel\+Decorative/.test(html) && !/family=Inter/.test(html));
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
  eq("trial Favor is 2.5×", read(sb, "R.favor"), 1200);
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
