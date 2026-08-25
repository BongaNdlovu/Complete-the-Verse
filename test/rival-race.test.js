/* Pursuer excision contracts: clean HUD hierarchy, zero pursuer debt,
   60s fade memorization, and 2.5-second answer display timing. */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const game = read("js/game.js");
const play = read("js/play.js");
const results = read("js/results.js");
const flow = read("js/flow.js");
const index = read("index.html");
const css = read("css/game.css");
const playCss = read("css/play.css");

const failures = [];
let assertions = 0;
function assert(condition, message){ assertions++; if(!condition) failures.push(message); }

/* 1. HUD hierarchy — pursuer is completely removed from HTML */
assert(!/id="rival-hud"/.test(index), "rival-hud is completely removed from index.html");
assert(!/id="res-rival"/.test(index), "res-rival is completely removed from index.html");
assert(/class="play-top-stack"/.test(index), ".play-top-stack container exists in HTML");
assert(/<div class="play-top-stack">[\s\S]*?id="act-track"[\s\S]*?id="quick-rewards"[\s\S]*?<\/div>/.test(index),
  "play-top-stack contains clean act-track and quick-rewards only");

/* 2. Runtime logic — pursuer functions and state are excised */
assert(!/function initRivalRace/.test(game), "initRivalRace is excised from game.js");
assert(!/function updateRivalRace/.test(game), "updateRivalRace is excised from game.js");
assert(!/function applyRivalMistakePressure/.test(play), "applyRivalMistakePressure is excised from play.js");
assert(!/function clearRivalMistakePressure/.test(play), "clearRivalMistakePressure is excised from play.js");
assert(!/rival-decoy/.test(play), "rival decoy answers are excised from play.js");

/* 3. Timing contracts — 60s fade timer and 2.5s answer review */
assert(/const FADE_MEMORY_MS = 60000;/.test(play), "Fade memorization duration is 60 seconds (60000ms)");
assert(/const FADE_RECALL_MIN_MS = 60000;/.test(play), "Fade recall minimum duration is 60 seconds (60000ms)");
assert(/var JUDGE_MS = 2500;/.test(flow), "Flow.JUDGE_MS is 2500ms for the 2.5-second answer display");
assert(/afterRun\(typeof Flow !== ["']undefined["'] \? Flow\.JUDGE_MS : 2500,\s*tutorialNextQuestion\)/.test(play),
  "Tutorial holds completed answer through Flow.JUDGE_MS (2500ms)");

/* 3b. Mastery reward — a correct Fade reconstruction pays an Illuminate card */
assert(/currentMechanic === "fade" && R\.powers\)\{[\s\S]{0,200}?R\.powers\.illum = \(R\.powers\.illum\|\|0\) \+ 1;/.test(play),
  "a correct Fade-to-Memory answer grants an Illuminate card");

/* 4. CSS clean state — no dangling pursuer styles */
assert(!/\.rival-hud\s*\{/.test(css), "rival-hud styles removed from game.css");
assert(!/\.result-rival\s*\{/.test(css), "result-rival styles removed from game.css");
assert(!/\.ans\.rival-decoy/.test(playCss), "rival-decoy styles removed from play.css");

/* 5. Top HUD & stage readability layout */
assert(/\.play-top-stack\s*\{[^}]*position:\s*relative/i.test(css), ".play-top-stack is positioned relatively");
assert(/\.play-top-stack\s*\{[^}]*z-index:\s*5/i.test(css), ".play-top-stack has z-index 5");
assert(/\.question-content\s*\{[^}]*z-index:\s*3/i.test(playCss), "question-content has z-index 3");

if(failures.length){
  console.error("FAIL ("+failures.length+")");
  failures.forEach((f)=>console.error(" - "+f));
  process.exit(1);
}
console.log("PASS — pursuer removal & 7s review · " + assertions + " contracts passed");
