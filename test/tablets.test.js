const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");
const { Tablets } = require("../js/tablets.js");

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
  "js/verses-tf.js", "js/beat.js", "js/tablets.js", "js/passages.js", "js/legacy-ids.js",
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

const p23 = Tablets.chapter("psalm23");
const p91 = Tablets.chapter("psalm91");
eq("Psalm 23 has 11 blanks", p23.blanks.length, 11);
eq("Psalm 91 has 8 blanks", p91.blanks.length, 8);
eq("BLANK_MS is 6500", Tablets.BLANK_MS, 6500);
eq("23 first answer is want", p23.blanks[0].a, "want");
eq("23 last answer is ever", p23.blanks[10].a, "ever");
["want","pastures","waters","soul","righteousness","evil","staff","enemies","oil","mercy","ever"]
  .forEach(function(w, i){ eq("23 blank " + (i + 1) + " is " + w, p23.blanks[i].a, w); });
["Almighty","fortress","fowler","feathers","buckler","night","right","angels"]
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
eq("John 1 has 5 blanks", Tablets.chapter("john1").blanks.length, 5);
eq("John 1 first answer is Word", Tablets.chapter("john1").blanks[0].a, "Word");

ok("clean 23 is Held", Tablets.held({ tabletMiss:0, tabletIdx:11, tabletTotal:11 }));
ok("a miss is not Held", !Tablets.held({ tabletMiss:1, tabletIdx:11, tabletTotal:11 }));
ok("short run is not Held", !Tablets.held({ tabletMiss:0, tabletIdx:4, tabletTotal:11 }));

const src = fs.readFileSync(path.join(ROOT, "js", "tablets.js"), "utf8")
  + fs.readFileSync(path.join(ROOT, "js", "tablets-run.js"), "utf8")
  + fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const gameSrc = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
ok("no three", !/three/i.test(src));
ok("no importmap", !/importmap/.test(src));
ok("no Google Fonts", !/fonts\.googleapis/.test(src));
ok("current line wraps as ordinary text", /\.tablets-current\{[^}]*display:\s*block/.test(src));
ok("blank sits in the line", /\.tablets-blank\{[^}]*inline-flex/.test(src));
ok("pause overlay is in the view", html.indexOf('id="tablets-pause"') >= 0);
ok("hear control is in the view", html.indexOf('id="tablets-hear"') >= 0);
ok("remaining counter is in the view", html.indexOf('id="tablets-remain"') >= 0);
ok("Esc pauses tablets instead of leaving", /currentView==="tablets"[\s\S]{0,80}toggleTabletsPause/.test(gameSrc));

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("opens tablets view", read(sb, "currentView"), "tablets");
  eq("powers off", read(sb, "R.powers.selah + R.powers.illum + R.powers.wind"), 0);
  eq("chapter is Psalm 23", read(sb, "R.tabletChapter"), "psalm23");
  eq("91 still locked", read(sb, "Tablets.unlocked('psalm91', SAVE)"), false);
  for (let i = 0; i < 11; i++) exec(sb, "tabletsResolve(true)");
  eq("clean 23 ends complete", read(sb, "R.ended"), true);
  eq("Held", read(sb, "Tablets.held(R)"), true);
  eq("psalm 23 Held on save", read(sb, "SAVE.tablets.psalm23.held"), true);
  eq("unique Hold counted once", read(sb, "SAVE.life.tabletHolds"), 1);
  eq("best is 100", read(sb, "SAVE.best.tablets"), 100);
  eq("91 unlocked after Hold", read(sb, "Tablets.unlocked('psalm91', SAVE)"), true);
  eq("XP paid", read(sb, "SAVE.xp > 0"), true);
  exec(sb, "startRun('tablets','watchman')");
  for (let i = 0; i < 11; i++) exec(sb, "tabletsResolve(true)");
  eq("second Hold does not recount", read(sb, "SAVE.life.tabletHolds"), 1);
}

{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsResolve(false)");
  eq("a miss ends the run", read(sb, "R.ended"), true);
  eq("not Held", read(sb, "Tablets.held(R)"), false);
  eq("91 stays locked", read(sb, "SAVE.tablets.psalm23.held"), false);
  eq("kick is shatter", read(sb, "$('res-kick').textContent"), "The tablet shattered");
}

{
  const sb = boot();
  exec(sb, "SAVE.tablets.psalm23.held = true; persist(); startRun('tablets','watchman',{tabletChapter:'psalm91'})");
  eq("Psalm 91 starts when unlocked", read(sb, "R.tabletChapter"), "psalm91");
  eq("8 tablets", read(sb, "R.tabletTotal"), 8);
  for (let i = 0; i < 8; i++) exec(sb, "tabletsResolve(true)");
  eq("91 Held", read(sb, "SAVE.tablets.psalm91.held"), true);
}

{
  const sb = boot();
  exec(sb, "SAVE.tablets.psalm23.held = true; SAVE.tablets.psalm91.held = true; persist(); startRun('tablets','watchman',{tabletChapter:'john1'})");
  eq("John 1 starts when unlocked", read(sb, "R.tabletChapter"), "john1");
  eq("5 blanks in John 1", read(sb, "R.tabletTotal"), 5);
  for (let i = 0; i < 5; i++) exec(sb, "tabletsResolve(true)");
  eq("John 1 Held", read(sb, "SAVE.tablets.john1.held"), true);
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

if (fail) {
  console.log("FAIL — tablets · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — tablets · " + pass + " assertions");
