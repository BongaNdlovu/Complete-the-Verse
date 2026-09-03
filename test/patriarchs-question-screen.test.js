/**
 * The Patriarchs question-screen composition is a visual contract: the
 * backdrop, character layer, journey HUD, and existing mechanic paths must
 * remain independently addressable.
 */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const play = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
const sequences = fs.readFileSync(path.join(ROOT, "js", "sequences.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css", "play.css"), "utf8");
const abraham = path.join(ROOT, "assets", "characters", "abram", "question.png");

assert(index.includes('id="question-abraham"'), "question screen has an Abraham layer");
assert(index.includes('src="assets/characters/abram/question.png"'), "Abraham uses the transparent question artwork");
assert(fs.existsSync(abraham) && fs.statSync(abraham).size > 1000, "transparent Abraham artwork is present");
assert(index.includes('id="hud-journey"') && index.includes('id="hud-left-lab"') && index.includes('id="hud-right-lab"'),
  "journey-first HUD hooks are present");

assert(/function syncAbrahamPresentation\(mechanic\)/.test(play), "Abraham presentation sync exists");
assert(/function reactAbraham\(ok\)/.test(play), "Abraham has a subtle answer reaction hook");
assert(/COMPANION_SITE\[site\.id\]/.test(play) && /currentView === "play"/.test(play),
  "the companion is limited to wired arcs and named sites");
assert(/moses\/question\.png/.test(play), "Exodus swaps in the Moses question artwork");
assert(/gideon\/question\.png/.test(play), "Judges swaps in the Gideon question artwork");
assert(/solomon\/question\.png/.test(play), "Jerusalem, Shiloh, Tyre, and Samaria use Solomon");
assert(/joshua\/question\.png/.test(play), "Jericho and Gilgal use Joshua");
assert(/elijah\/question\.png/.test(play), "Carmel and Megiddo use Elijah");
assert(/elisha\/question\.png/.test(play), "Lachish and Damascus use the Elisha plate");
assert(/jonah\/question\.png/.test(play), "Nineveh uses Jonah");
assert(/daniel\/question\.png/.test(play), "Babylon and Susa use Daniel");
assert(/samson\/question\.png/.test(play), "Gibeah and Mizpah use Samson");
assert(/jesus\/question\.png/.test(play), "Bethlehem, Nazareth, Capernaum, Golgotha, and Emmaus use Jesus");
assert(/baptist\/question\.png/.test(play), "The Jordan uses John the Baptist");
assert(/paul\/question\.png/.test(play), "Damascus Road through Rome use Paul");
const moses = path.join(ROOT, "assets", "characters", "moses", "question.png");
assert(fs.existsSync(moses) && fs.statSync(moses).size > 1000, "Moses question artwork is present");
const gideon = path.join(ROOT, "assets", "characters", "gideon", "question.png");
assert(fs.existsSync(gideon) && fs.statSync(gideon).size > 1000, "Gideon question artwork is present");
const solomon = path.join(ROOT, "assets", "characters", "solomon", "question.png");
assert(fs.existsSync(solomon) && fs.statSync(solomon).size > 1000, "Solomon question artwork is present");
const joshua = path.join(ROOT, "assets", "characters", "joshua", "question.png");
assert(fs.existsSync(joshua) && fs.statSync(joshua).size > 1000, "Joshua question artwork is present");
const elijah = path.join(ROOT, "assets", "characters", "elijah", "question.png");
assert(fs.existsSync(elijah) && fs.statSync(elijah).size > 1000, "Elijah question artwork is present");
const elisha = path.join(ROOT, "assets", "characters", "elisha", "question.png");
assert(fs.existsSync(elisha) && fs.statSync(elisha).size > 1000, "Elisha question artwork is present");
assert(/abraham-active/.test(play) && /R\.passage/.test(play) && /R\.recon/.test(play),
  "the body state and dense mechanic variants are synced");
assert(/syncAbrahamPresentation\(mechanic/.test(play), "normal questions sync the character layer");
assert(sequences.includes('syncAbrahamPresentation("passage")'), "passage questions sync the character layer");
assert(sequences.includes('syncAbrahamPresentation("reconstruct")'), "reconstruction questions sync the character layer");

assert(game.includes("hud-journey") && game.includes("hud-left-lab") && game.includes("hud-right-lab"),
  "journey-first HUD labels are updated at runtime");
assert(/function hudJourneyName\(/.test(game) && /arc \? arc\.name/.test(game), "the HUD names the active journey arc");
assert(/if\(view!=="play" && typeof syncAbrahamPresentation/.test(game),
  "leaving gameplay clears the Abraham presentation state");

assert(css.includes(".question-abraham"), "Abraham layer has a dedicated style contract");
assert(index.includes('id="question-abraham-sign"'), "companion layer has a small name signature");
assert(/King Solomon/.test(play) && /"Joshua"/.test(play) && /"Elijah"/.test(play) && /"Jonah"/.test(play) && /"Daniel"/.test(play) && /"Samson"/.test(play) && /"Jesus"/.test(play) && /John the Baptist/.test(play) && /"Paul"/.test(play),
  "named companions carry a signature");
assert(css.includes("#question-abraham-sign"), "the signature sits under the figure");
assert(css.includes("@keyframes abrahamFloat"), "Abraham has a restrained idle motion");
assert(css.includes("@keyframes abrahamSuccess") && css.includes("@keyframes abrahamFailure"),
  "answer reactions have restrained success/failure motion");
assert(css.includes("body.abraham-active .question-content"), "active Patriarchs questions reserve a left composition");
assert(css.includes('data-mechanic="typed"') && css.includes('data-mechanic="cloze"'),
  "dense mechanics can reduce the character treatment");
assert(css.includes('data-mechanic="passage"') && css.includes('data-mechanic="reconstruct"'),
  "passage and reconstruction get their own treatment");
assert(css.includes("body.abraham-active:has(#pause.on)"), "pause hides the character focus layer");
assert(/@media \(max-width:900px\)[\s\S]*\.question-abraham\{display:none!important\}/.test(css),
  "phone and tablet hide the full-body layer when space is tight");
assert(/renderPassageReferenceQuestion\(q, dur, scene\)/.test(play) && /renderClozeQuestion\(q, dur, scene\)/.test(play) &&
       /renderDuelQuestion\(q, dur, scene\)/.test(play) && /renderFadeQuestion\(q, dur, scene\)/.test(play) &&
       /renderTrueFalseQuestion\(q, dur, scene\)/.test(play),
  "existing mechanic render paths remain intact");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — Patriarchs question-screen composition is wired");
