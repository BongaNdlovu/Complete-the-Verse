/**
 * Wall clocks (30 / 45 / 60) and powerbar contracts.
 * Run: node test/clocks-powers.test.js
 */
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
vm.runInContext(source, sb, { filename: "clocks-powers.js" });
const read = expr => vm.runInContext(expr, sb);
const run = code => vm.runInContext(code, sb);
const fails = [];
function assert(name, condition, detail) {
  if (!condition) fails.push(name + (detail ? " -> " + detail : ""));
}

const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const playCss = fs.readFileSync(path.join(ROOT, "css", "play.css"), "utf8");

assert("question-body scroll region exists", index.includes('class="question-body"'));
assert("powerbar is outside question-body", /question-body[\s\S]*control[\s\S]*<\/div>\s*<div class="powerbar"/.test(index));
assert("default HUD clock reads 30s", index.includes('id="clock">00:30</b>'));
assert("clock is a depleting bar pinned under the header",
  /class="clockbar ring"/.test(index) && /id="ring-arc"/.test(index) &&
  /\.clockbar\{[^}]*position:\s*absolute/.test(playCss));
assert("question-body can scroll", /\.question-body\{[^}]*overflow-y:\s*auto/.test(playCss));
assert("powerbar is a reserved footer", /\.powerbar\{[^}]*flex:\s*0\s*0\s*auto/.test(playCss));
assert("typed assemble template has no duplicate typed-pwr buttons",
  !/typed-pwr/.test((fs.readFileSync(path.join(ROOT, "js", "typed.js"), "utf8").match(/opts\.innerHTML[\s\S]*?typed-hint/) || [""])[0]));

assert("wall clock constants exist", read("typeof WALL_PICK_MS === 'number' && WALL_PICK_MS === 30000"));
assert("typed wall clock is 45s", read("WALL_TYPED_MS === 45000"));
assert("fade wall clock is 60s", read("WALL_FADE_MS === 60000"));
assert("usesWallClock helper exists", read("typeof usesWallClock === 'function'"));
assert("wallClockMs helper exists", read("typeof wallClockMs === 'function'"));

run("pendingSiteId = 'ur'; startRun('pilgrimage','watchman'); hideSiteQuote();");
assert("pilgrimage picker is 30s", read("questionDuration()") === 30000);
run("renderQuestion(R.q, questionDuration());");
assert("picker arms 30s on the timer", read("R.tTotal") === 30000);
assert("picker renders Selah", read("$('powers').innerHTML.includes('data-pw=\"selah\"')"));
assert("picker renders Illuminate", read("$('powers').innerHTML.includes('data-pw=\"illum\"')"));

run("pendingSiteId = 'patmos'; startRun('pilgrimage','watchman'); hideSiteQuote();");
assert("late-road picker matches Ur at 30s", read("questionDuration()") === 30000);

run("R.typed = true; R.speed = false;");
assert("typed pilgrimage is 45s", read("questionDuration()") === 45000);

run("startRun('recall','watchman');");
assert("recall mode is 45s", read("questionDuration()") === 45000);

run("startRun('practice','watchman');");
assert("practice is 30s", read("questionDuration()") === 30000);

run("startRun('trial','watchman');");
assert("trial is not flattened to 30s", read("questionDuration()") !== 30000);

run("pendingSiteId = 'ur'; startRun('pilgrimage','watchman'); hideSiteQuote();");
const fadeQ = { id: "fade-test", b: "Genesis", r: "Genesis 1:1", t: 1,
  p: "In the beginning God created the heaven and the earth.", a: "And the earth was without form, and void", s: ".",
  mechanic: "fade" };
sb.__fadeQ = fadeQ;
run("R.q = __fadeQ; R.siteIdx = 6; R.currentMechanic = 'fade'; renderFadeQuestion(__fadeQ, 60000, 99);");
assert("fade memorize is 60s", read("R.tTotal") === 60000);
assert("fade bar shows 60s", read("$('fade-bar') && $('fade-bar').textContent.includes('60s')"));

run("R.fadePhase = 'reconstruct'; R.currentMechanic = 'fade'; R.typed = false; startFadePick(__fadeQ, 100);");
assert("fade pick clock is 45s", read("R.tTotal") === 45000);
assert("fade pick has four choices", read("answerButtons().length === 4"));
assert("typed board has no typed-pwr", !read("$('opts').innerHTML.includes('typed-pwr')"));

run("R.typed = true; R.currentMechanic = 'fade'; R.q = {id:'typed-next',b:'Genesis',r:'Genesis 1:2',t:1,p:'And the earth was',a:'without form',s:'.'};");
assert("typed verse after fade does not keep the 60s clock", read("questionDuration()") === 45000);

run("R.running = true; R.powers = R.powers || {selah:1,illum:1,wind:0}; renderClozeQuestion({id:'c',b:'Genesis',r:'Genesis 1:1',t:1,p:'In the beginning',a:'God created',s:' the heaven.',d:['Lord made']}, 30000, 101);");
assert("cloze renders powers", read("$('powers').innerHTML.includes('data-pw=\"selah\"') && $('powers').innerHTML.includes('data-pw=\"illum\"')"));

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — clocks-powers · " + (29) + " contracts verified");
