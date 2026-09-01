/* First-run onboarding is a real, non-scoring six-question run demonstrating all question mechanics. */
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
ok("tutorial uses the first recognition question", read("R.mode === 'tutorial' && R.tutorial.index === 0 && R.q.r === 'Psalm 23:1'"));
ok("tutorial has six lessons", read("R.tutorial.total === 6"));
ok("lesson one answer is KJV", read("R.q.a") === "shall not want");

// Lesson 1: Multiple choice
run("usePower('selah')");
ok("tutorial lifeline is usable", read("R.powers.selah === 0 && R.pendingSelah === 5000"));
run("resolveAnswer(R.q, R.q.a, null, 1000, 20000); tutorialNextQuestion();");

// Lesson 2: Name the Passage
ok("lesson two teaches Name the Passage", read("R.tutorial.index === 1 && R.currentMechanic === 'passage-ref' && R.q.r === 'Proverbs 3:5'"));
ok("lesson two answer is KJV", read("R.q.a") === "own understanding");
run("resolveAnswer(R.q, R.q.a, null, 1000, 20000); tutorialNextQuestion();");

// Lesson 3: Scribe's Cloze
ok("lesson three teaches Scribe's Rapid Cloze", read("R.tutorial.index === 2 && R.currentMechanic === 'cloze' && R.q.r === 'Genesis 1:1'"));
ok("lesson three answer is KJV", read("R.q.a") === "God created the heaven and the earth");
run("resolveAnswer(R.q, R.q.a, null, 1000, 20000); tutorialNextQuestion();");

// Lesson 4: True Scripture Duel
ok("lesson four teaches True Scripture Duel", read("R.tutorial.index === 3 && R.currentMechanic === 'duel' && R.q.r === 'John 1:1'"));
ok("lesson four answer is KJV", read("R.q.a") === "was God");
run("resolveAnswer(R.q, R.q.a, null, 1000, 20000); tutorialNextQuestion();");

// Lesson 5: Fade-to-Memory (30s memory + full reconstruction)
ok("lesson five teaches Fade-to-Memory", read("R.tutorial.index === 4 && R.currentMechanic === 'fade' && R.q.r === 'Philippians 4:13'"));
ok("lesson five answer is KJV", read("R.q.a") === "strengtheneth me");
ok("lesson five offers I'm Done", read("!!$('fade-done')"));
// The reconstruction pick offers whole verses; choosing the true verse must grade correct.
run("startFadePick(R.q, R.sceneToken)");
ok("lesson five reconstructs from whole verses",
  read("R.fadePhase === 'reconstruct' && fadePickChoices(R.q).indexOf(fullVerseText(R.q)) >= 0"));
const correctAfterFour = read("R.tutorial.correct");
run("resolveAnswer(R.q, fullVerseText(R.q), null, 1000, 20000);");
ok("choosing the true verse in lesson five grades correct",
  read("R.tutorial.correct") === correctAfterFour + 1);
run("tutorialNextQuestion();");

// Lesson 6: Assembled Recall
ok("lesson six is assembled recall", read("R.tutorial.index === 5 && R.typed === true && !!R.assemble"));
ok("lesson six answer is KJV", read("R.q.a") === "rejoice and be glad in it");
run("R.assemble.target.forEach(function(t,i){ R.assemble.placed[i] = t; }); resolveAnswer(R.q, Assemble.join(R.assemble.placed), null, 2000, 20000); tutorialNextQuestion();");

ok("tutorial returns to the menu", read("currentView === 'menu' && SAVE.set.tutorialDone === true"));
ok("tutorial does not change game progress", read("JSON.stringify({runs:SAVE.runs,xp:SAVE.xp,oil:SAVE.oil,correct:SAVE.life.correct,attempts:SAVE.life.attempts,seals:SAVE.seals.length,srs:JSON.stringify(SAVE.srs)})") === before);

if(fails.length){
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — onboarding · six lessons · all question mechanics · zero game progress");
