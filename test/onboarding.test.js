/* First-run onboarding is a real, non-scoring three-question run. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js",
  "js/flow.js", "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/live.js", "js/atlas.js"
];
const source = PREFIX.concat(ENGINE_FILES)
  .map(file => fs.readFileSync(path.join(ROOT, file), "utf8")).join("\n;\n");
const sb = makeSandbox();
vm.runInContext(source, sb, { filename: "onboarding.js" });
const read = expr => vm.runInContext(expr, sb);
const run = code => vm.runInContext(code, sb);
const fails = [];
function ok(name, condition, extra){
  if(!condition) fails.push(name + (extra === undefined ? "" : " -> " + JSON.stringify(extra)));
}

const before = read("JSON.stringify({runs:SAVE.runs,xp:SAVE.xp,oil:SAVE.oil,correct:SAVE.life.correct,attempts:SAVE.life.attempts,seals:SAVE.seals.length,srs:JSON.stringify(SAVE.srs)})");
run("startTutorialRun()");
ok("tutorial starts in play", read("currentView") === "play");
ok("tutorial uses the first easy question", read("R.mode === 'tutorial' && R.tutorial.index === 0 && R.q.r === 'Psalm 23:1'"));
ok("tutorial has three lessons", read("R.tutorial.total === 3"));

run("usePower('selah')");
ok("tutorial lifeline is usable", read("R.powers.selah === 0 && R.pendingSelah === 5000"));
run("resolveAnswer(R.q, R.q.a, null, 1000, 20000); tutorialNextQuestion();");
ok("lesson two teaches lifelines", read("R.tutorial.index === 1 && R.q.r === 'Philippians 4:13'"));
run("resolveAnswer(R.q, R.q.a, null, 1000, 20000); tutorialNextQuestion();");
ok("lesson three is assembled recall", read("R.tutorial.index === 2 && R.typed === true && !!R.assemble"));
run("R.assemble.target.forEach(function(t,i){ R.assemble.placed[i] = t; }); resolveAnswer(R.q, Assemble.join(R.assemble.placed), null, 2000, 20000); tutorialNextQuestion();");
ok("tutorial returns to the menu", read("currentView === 'menu' && SAVE.set.tutorialDone === true"));
ok("tutorial does not change game progress", read("JSON.stringify({runs:SAVE.runs,xp:SAVE.xp,oil:SAVE.oil,correct:SAVE.life.correct,attempts:SAVE.life.attempts,seals:SAVE.seals.length,srs:JSON.stringify(SAVE.srs)})") === before);

if(fails.length){
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — onboarding · three lessons · zero game progress");
