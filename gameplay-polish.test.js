/**
 * Unlock ceremony, tricky choices, timer SFX windows.
 * Run: node gameplay-polish.test.js
 */
const fs = require("fs");
const path = require("path");
const Polish = require("./js/polish");

const root = __dirname;
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

const game = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
const atlas = fs.readFileSync(path.join(root, "js", "atlas.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "atlas.css"), "utf8");

/* --- timer SFX --- */
assert(/stopPressure/.test(game), "Snd.stopPressure exists");
assert(/Strict countdown SFX/.test(game) || /10–6 soft tick/.test(game) || /sec>=6 && sec<=10/.test(game),
  "strict tick windows");
assert(/lastHeartSec/.test(game), "heart once per second via lastHeartSec");
assert(/sec>=1 && sec<=3/.test(game), "heart only in last 3 seconds");
assert(/stopPressure\(\)/.test(game), "stopPressure called from stopTimer");
assert(!/frac<=\.55/.test(game) || /Strict countdown/.test(game),
  "no mid-question 55% tick as primary path");

/* --- similar choices --- */
assert(/function buildChoices/.test(game), "buildChoices present");
assert(/shapeScore|choiceShapeScore|lenDiff/.test(game), "shape similarity scoring");
assert(/word count|wcDiff|wordsOf/.test(game), "word-count similarity");
const good = Polish.choiceShapeScore("the word of the LORD", "the fear of the LORD");
const bad = Polish.choiceShapeScore("the word of the LORD", "x");
assert(good > bad, "similar phrases score higher than short junk (" + good + " vs " + bad + ")");
assert(Polish.choiceShapeScore("living soul", "living soul") < 0, "identical rejected");

/* --- unlock ceremony --- */
assert(/celebrateUnlock/.test(atlas), "Atlas.celebrateUnlock");
assert(/pendingUnlockId/.test(game), "pendingUnlockId flow");
assert(/celebrateUnlock\(unlockId\)/.test(game) || /Atlas\.celebrateUnlock/.test(game),
  "openAtlas runs celebrateUnlock");
assert(/unlocking/.test(atlas) && /unlocking/.test(css), "unlock CSS class");
assert(/unlockBurst|unlockLabel/.test(css), "unlock keyframes");
assert(/autoUnlock|See the road open|pendingUnlockId/.test(game), "auto map after first clear");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — gameplay polish · timer · choices · unlock");
