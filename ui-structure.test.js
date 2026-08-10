/**
 * Legacy UI structure checks — retargeted to split index.html after monolith deletion.
 * Run: node ui-structure.test.js
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "index.html");
const html = fs.readFileSync(file, "utf8");
const css = fs.readFileSync(path.join(__dirname, "css", "game.css"), "utf8");
const game = fs.readFileSync(path.join(__dirname, "js", "game.js"), "utf8");
const fails = [];

function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

assert(!fs.existsSync(path.join(__dirname, "complete-the-verse(1) (1).html")), "old monolith must be deleted");
assert(!html.includes('id="neural-bg"'), "neural-bg canvas must be removed");
assert(!/<div class="ai-chrome"/.test(html), "ai-chrome must be removed from markup");
assert(!/<div class="ai-orbit"/.test(html), "ai-orbit must be removed from markup");
assert(!/<div class="ai-scan"/.test(html), "ai-scan must be removed from markup");
assert(!/<div class="ai-analysis"/.test(html), "ai-analysis must be removed from markup");
assert(!html.includes("Ambient neural field"), "neural ambient script must be removed");
assert(!html.includes("Preparing the arena"), "cyber boot copy must be unified");
assert(html.includes("Preparing the record"), "scripture boot copy must be present");

assert(css.includes("hud-away") || html.includes("hud-away"), "play HUD secondary chrome class required");
assert(css.includes("#v-play .hud-away"), "CSS must hide hud-away on play");
assert(css.includes("#v-play .momentum"), "CSS must hide momentum on play");
assert(css.includes("#v-play .kjv"), "CSS must hide KJV badge on play");
assert(css.includes("#v-play .hdr-title"), "CSS must hide play header brand");

assert(html.includes('id="hud-streak"'), "streak id kept for JS updates");
assert(html.includes('id="hud-accuracy"'), "accuracy id kept for JS updates");
assert(html.includes('id="hud-lives"'), "lives remain on play HUD");
assert(html.includes('id="score"'), "score remains on play HUD");
assert(html.includes('id="confirm-answer"'), "Lock Answer control required");

assert(css.includes("min-height:52px"), "mobile Lock CTA min-height 52px");
assert(css.includes("font-size:.78rem"), "mobile Lock CTA readable font size");

assert(!html.includes('class="topright"'), "duplicate icon nav must be gone");
assert(!game.includes('className="topright"'), "topright not created in JS");
assert(html.includes('data-go="settings"'), "settings still reachable via subnav");

assert(html.includes('class="res-details"'), "results details panels required");
assert(html.includes("res-primary"), "primary results CTA cluster required");
assert(html.includes('id="res-again"'), "Run It Back still present");

assert(game.includes("Accuracy</span>"), "pause includes accuracy");

assert(/function fitVerseSize\(len\)/.test(game), "fitVerseSize helper required");
assert(game.includes("vlen-md") && game.includes("vlen-lg") && game.includes("vlen-xl"), "verse length tier classes required");
assert(css.includes(".verse-main.vlen-md") && css.includes(".verse-main.vlen-xl"), "CSS verse length tiers required");

/* ---------- Recall mode: the typed answer replaces the four options ---------- */
assert(game.includes('id="typed-answer"'), "typed answer input is rendered");
assert(game.includes('autocomplete="off"') && game.includes('spellcheck="false"'),
  "typed input must not autocomplete or spellcheck the answer away");
assert(game.includes('autocapitalize="off"') && game.includes('autocorrect="off"'),
  "mobile keyboards must not rewrite the answer");
assert(game.includes('aria-label="Type the missing words"'), "typed input is labelled for screen readers");
assert(game.includes('aria-live="polite"'), "the verdict is announced");
assert(css.includes(".typed-input"), "typed input styled");
assert(css.includes(".typed-input:focus"), "typed input has a visible focus state");
assert(css.includes(".typed-input.right") && css.includes(".typed-input.bad"),
  "typed input shows right and wrong states");
assert(css.includes(".typed-hint"), "typed hint/verdict styled");
assert(/@media \(max-width:600px\)[\s\S]*\.typed-input/.test(css),
  "typed input has a mobile size");

/* The verdict must always show the exact wording — being marked wrong
   without seeing the verse teaches nothing. */
assert(game.includes("function renderTypedVerdict"), "typed verdict renderer required");
assert(/The verse reads/.test(game), "verdict shows the exact wording");

/* Enter submits from inside the input, which the global key handler
   deliberately ignores while an input has focus. */
assert(/input\.addEventListener\("keydown"/.test(game), "Enter submits from the input");
assert(game.includes("function confirmTyped"), "typed confirm path exists");
assert(/if\(R\.typed\) return confirmTyped\(\);/.test(game), "Lock Answer routes to the typed path");

/* ---------- review scheduling surfaces ---------- */
assert(html.includes('id="res-schedule"'), "next-review panel present in results");
assert(css.includes(".schedule"), "next-review panel styled");
assert(css.includes(".schedrow"), "next-review rows styled");
assert(html.includes('value="due"'), "Study Hall filters to due verses");
assert(html.includes('value="held"') && html.includes('value="learning"'),
  "Study Hall exposes the schedule bands");
assert(!html.includes('value="mastered"'), "accuracy-based filter replaced by schedule bands");
assert(css.includes(".mode .pill.due"), "due-count pill styled");
assert(css.includes(".mastery.m2"), "learning band styled in Study Hall");
assert(game.includes("function verseScheduleLabel"), "Study Hall shows the schedule");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — index.html UI structure checks");
