/**
 * Excitement pass — pace & variety, Overdrive "ride or bank", relic armor.
 * Run: node excitement.test.js
 *
 * Pure logic is asserted directly against the campaign module (same code
 * path the browser runs). The wiring is asserted against the source text,
 * matching the structural-test convention, because game.js cannot be
 * require()d in bare Node (it runs DOM code on load).
 */
const fs = require("fs");
const path = require("path");
const S = require("../js/sites");
const P = require("../js/pilgrimage");
const Polish = require("../js/polish");
const { loadBank } = require("../scripts/load-bank");

P.attach({ SITES: S.SITES, ARCS: S.ARCS, VERSES: loadBank().VERSES });

const ROOT = require("../scripts/repo-root");
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }
function eq(name, got, want) { assert(got === want, name + " (got " + JSON.stringify(got) + ", want " + JSON.stringify(want) + ")"); }

/* The engine is split across module files; static checks read the
   concatenation through the one shared list (scripts/engine-source.js). */
const { readEngine } = require("../scripts/engine-source");
const game = readEngine(ROOT);
const pilgrimSrc = fs.readFileSync(path.join(ROOT, "js", "pilgrimage.js"), "utf8");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8") + "\n" + fs.readFileSync(path.join(ROOT, "css", "play.css"), "utf8");

/* ---------------- pure pace & variety ---------------- */
eq("speed slot lands mid-site", P.speedSlot(3, 8), true);
eq("speed slot not at start", P.speedSlot(0, 8), false);
eq("speed slot not at the typed tail", P.speedSlot(7, 8), false);
assert(P.speedSlot(3, 5), "speed slot stays in-range for a short site");

eq("kingdom is a barrage arc", P.barrageArc("kingdom"), true);
eq("gospel is a barrage arc", P.barrageArc("gospel"), true);
eq("patriarchs is calm", P.barrageArc("patriarchs"), false);
eq("exodus is calm", P.barrageArc("exodus"), false);

eq("mixed typed fires mid-site in late arcs", P.mixedTypedSlot(5, 8, "kingdom"), true);
eq("mixed typed skips early arcs", P.mixedTypedSlot(5, 8, "patriarchs"), false);

/* The midboss surprise round was removed after playtest feedback — a
   site is its 8 verses plus (at the six finale places) one announced
   sequence. The road must never spawn an unannounced extra round. */
assert(!/midboss/.test(game), "no midboss sequence survives in game.js");
assert(!/midbossSite/.test(pilgrimSrc), "no midboss rule survives in pilgrimage.js");
assert(!P.midbossSite, "the midboss rule is not exported");

/* ---------------- pure Overdrive math ---------------- */
eq("bank pays streak × 60 × diff", Polish.overdriveBank(12, 1.0), 720);
eq("bank scales with difficulty", Polish.overdriveBank(12, 1.6), 1152);
eq("bank floors a zero streak", Polish.overdriveBank(0, 1.0), 0);
eq("ride doubles the gain", Polish.overdriveRideGain(150), 300);

/* ---------------- M1 chain flow ---------------- */
assert(/function correctAdvance/.test(game), "correctAdvance exists");
assert(/\? 1400 : 1500/.test(game), "correct answers chain at a readable 1400/1500ms");
assert(/function queueAdvance/.test(game) && /playWipe/.test(game),
  "correct path advances through the wipe gate");
assert(!/autoLock\(\)\?720:1450/.test(game), "the old 1450ms dead air is gone");
assert(/afterRun\(answerHoldMs\(\), queueAdvance\)/.test(game), "answers route through the shared answerHoldMs gate");
assert(!/JUDGE_MS : 0/.test(game), "no mode collapses the post-answer teach pause to zero");

/* ---------------- M5 Overdrive ride or bank ---------------- */
assert(/function offerOverdriveChoice/.test(game), "offerOverdriveChoice exists");
assert(/function resolveOverdrive/.test(game), "resolveOverdrive exists");
assert(/R\.overdriveRide = true/.test(game), "riding is a flag, set only on choice");
assert(/overdriveOffered/.test(game) && /overdriveRide:false/.test(game), "run state tracks the offer and the ride");
assert(/const riding = R\.overdriveRide && inOverdrive\(\)/.test(game), "double pay is gated on riding");
assert(/riding \? 2 : 1/.test(game), "riding doubles the gained score");
assert(/const wasRiding = R\.overdriveRide && inOverdrive\(\)/.test(game), "miss captures the ride before reset");
assert(/loseLife\(wasRiding \? 2 : 1\)/.test(game), "a miss while riding costs two lamps");
assert(/resolveOverdrive\("bank"\)/.test(game) || /Polish\.overdriveBank/.test(game), "banking pays out via the pure helper");
assert(/R\.mode!=="blitz"/.test(game), "the choice does not interrupt the blitz survival clock");
assert(/MOMENTUM_STEPS\[MOMENTUM_STEPS\.length-1\] && !R\.setpiece/.test(game), "the choice fires at the top of the meter, outside set pieces");
assert(/R\._odTimer = setTimeout/.test(game) && /9000/.test(game), "a timeout banks so the run can never deadlock");

/* ---------------- finale clarity (no surprise rounds) ---------------- */
assert(/function siteFinale/.test(game), "siteFinale tells the brief what closes a stop");
assert(/SetPieces\.siteFinale\(siteId\)/.test(game), "the site brief reads the finale");
assert(/closes with/.test(game) && /more verses/.test(game), "the brief names the finale and its count");
/* The Book Lockdown finale must never repeat a verse the site used. */
assert(/Never repeat a verse the site already used/.test(game), "set-piece draws never repeat used verses");

/* ---------------- M8 speed round ---------------- */
assert(/function speedSlot/.test(game) || /Pilgrimage\.speedSlot\(vi, n\)/.test(game), "speed slot wired into the site body");
assert(/R\.speed = Pilgrimage\.speedSlot/.test(game), "nextQuestion marks the swift verse");
assert(/if\(usesWallClock\(\)\) return wallClockMs\(\)/.test(game),
  "the swift verse shares the flat 30s wall clock");
eq("the swift flavor still leaves time to read", P.SPEED_MS >= 5000, true);
assert(/function momentumClockMs/.test(game) && /ms \* 1\.2/.test(game),
  "high momentum still shapes paced clocks outside the wall-clock modes");
assert(/MOMENTUM_STEPS\[0\]/.test(game), "the momentum stretch starts at Building");
assert(/Swift Lock/.test(game), "the swift verse labels its lock button");
assert(/speed-round/.test(game) && /speed-round/.test(css), "the swift verse has a visual state");

/* ---------------- M10 mixed barrage ---------------- */
assert(/Pilgrimage\.mixedTypedSlot\(vi, n, arcKey\)/.test(game), "late arcs mix a typed recall mid-site");
assert(/R\.typed = \(n > 0 && vi >= \(n - typedN\)\) \|\| mixed/.test(game), "mixed typing joins the closing pair");

/* ---------------- M11 relic armor ---------------- */
assert(/armorUsed/.test(game), "armor state exists");
assert(/Artifacts\.unlockedCount\(SAVE\.artifacts\) > 0/.test(game), "a recovered relic shields the road");
assert(/Relic shield — one miss absorbed/.test(game), "the shield announces itself");

/* ---------------- overlay markup + style ---------------- */
assert(/id="overdrive-choice"/.test(index), "overdrive overlay markup");
assert(/id="od-ride"/.test(index) && /id="od-bank"/.test(index), "ride and bank buttons exist");
assert(/odRide\.addEventListener/.test(game) && /odBank\.addEventListener/.test(game), "buttons are wired");
assert(/resolveOverdrive\("ride"\)/.test(game) && /resolveOverdrive\("bank"\)/.test(game), "buttons call resolveOverdrive");
assert(/#overdrive-choice/.test(css) && /\.od-card/.test(css), "overdrive overlay is styled");
assert(/body\.od-open \.stage/.test(css), "the stage dims behind the choice");
assert(/body\.speed-round/.test(css), "speed round is styled");

/* ---------------- smoothness & voice (playtest pass) ---------------- */
assert(/if\(!text\) return;/.test(game), "speak() never plays empty text through TTS");
assert(!/Overdrive\. Ride the fire, or bank it\./.test(game), "the overdrive choice plays no unrecorded TTS line");
assert(!/The road narrows\. Six verses\. Half time\./.test(game), "the removed midboss voice cannot play");
assert(/the meter is full/.test(game), "the overdrive callout no longer promises a clock bonus");
assert(/#verse\.q-in/.test(css) && /@keyframes qIn/.test(css), "each new verse fades up");
assert(/verseEl\.classList\.add\("q-in"\)/.test(game), "renderQuestion runs the verse handoff");
assert(/\.ans:active/.test(css), "options have a press state");
assert(/transition:filter \.9s ease/.test(css), "momentum filter changes ease, not snap");
assert(/opacity \.34s ease, filter \.34s ease/.test(css), "option mute/burn fades instead of snapping");
assert(/signalBreak \.72s/.test(css), "the wrong-answer stage shake is slower and smoother");
assert(/ansResolveBad \.62s/.test(css), "the wrong button settles smoothly");
assert(/fl \.7s ease-out/.test(css), "the red flash fades more gently");

/* ---------------- pace (playtest tuning) ---------------- */
eq("PACE is +20%", Polish.PACE, 1.2);
eq("flat add is +5s", Polish.FLAT_ADD_MS, 5000);
assert(/function usesWallClock/.test(game), "wall clock gate exists");
assert(/function wallClockMs/.test(game), "wall clock helper exists");
assert(/if\(usesWallClock\(\)\) return wallClockMs\(\)/.test(game), "in-scope modes use flat wall clocks");
assert(/playClockMs\(ACTS\[R\.actIdx\]/.test(game), "trial keeps the paced act clock");
assert(/Math\.round\(R\.setpiece\.duration\*PACE\+FLAT_ADD_MS\)/.test(game), "set-piece finales still get pace boost");
assert(/function siteBriefClockLabel/.test(game), "site brief prints the wall-clock mix");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — excitement · pace · overdrive choice · finale clarity · speed · barrage · relic armor");
