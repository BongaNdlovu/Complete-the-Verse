/**
 * Smoothness contract for every game state.
 * Run: node motion.test.js
 *
 * A motion is "smooth" here if it (a) eases opacity/transform rather
 * than snapping display, (b) closes its keyframes, (c) dies under
 * reduced motion when it loops, and (d) does not animate layout
 * properties that force a reflow.
 */
const fs = require("fs");
const path = require("path");

const ROOT = require("../scripts/repo-root");
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

const gameCss = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8") + "\n" + fs.readFileSync(path.join(ROOT, "css", "play.css"), "utf8");
const atlasCss = fs.readFileSync(path.join(ROOT, "css", "atlas.css"), "utf8");
const { readEngine } = require("../scripts/engine-source");
const game = readEngine(ROOT);
const atlas = fs.readFileSync(path.join(ROOT, "js", "atlas.js"), "utf8");
const css = gameCss + "\n" + atlasCss;

/* --- overlays fade; they do not snap display --- */
const overlays = [
  ["#pause", "pause"],
  ["#site-quote", "site cold-open"],
  ["#ur-prologue", "Ur opening film"],
  ["#tutorial", "tutorial"],
  ["#reveal-stage", "relic/figure reveal"],
  [".setpiece-card", "set-piece card"]
];
overlays.forEach(([sel, name]) => {
  const esc = sel.replace(/[.#]/g, "\\$&");
  const base = css.match(new RegExp(esc + "\\{[^}]+\\}"));
  const on = css.match(new RegExp(esc + "\\.on\\{[^}]+\\}"));
  assert(!!base, name + " has a base rule");
  assert(!!on, name + " has an .on rule");
  if (base) {
    assert(/opacity\s*:/.test(base[0]) && /transition:[^;]*opacity/.test(base[0]),
      name + " fades opacity instead of popping");
    assert(/pointer-events\s*:\s*none/.test(base[0]),
      name + " does not steal clicks while hidden");
  }
  if (on) {
    assert(/opacity\s*:\s*1/.test(on[0]), name + " .on is fully visible");
    assert(!/display\s*:\s*(flex|grid|block)/.test(on[0]),
      name + " .on does not snap display");
  }
});

/* --- lock stamp eases in and out --- */
const lock = css.match(/#lock-seal\{[^}]+\}/);
assert(lock && /transition:[^;]*opacity/.test(lock[0]),
  "lock seal fades rather than blinking");

/* --- site plates crossfade --- */
const motif = css.match(/#site-motif\{[^}]+\}/);
assert(motif && /transition:[^;]*opacity/.test(motif[0]),
  "site motif layer has an opacity transition");
assert(/function applySitePlate/.test(game), "applySitePlate exists");
assert(/motif\.style\.opacity/.test(game), "plate changes dip opacity so the transition runs");
assert(/setAttribute\("data-site"/.test(game), "plates are still keyed by data-site");

/* --- witness look is a transition --- */
const witnessImg = css.match(/\.witness img\{[^}]+\}/);
assert(witnessImg && /transition:[^;]*transform/.test(witnessImg[0]),
  "witness face eases look");
assert(/border-radius:50%/.test(witnessImg[0]), "witness stays a circular token");

/* --- sky, vignette, answers ease between pressure / weather --- */
const bd = css.match(/#backdrop\s*\{[^}]*transition:[^}]*filter/);
assert(!!bd, "backdrop filter eases across sky/weather");
const vig = css.match(/#vignette\{[^}]+\}/);
assert(vig && /transition:[^;]*box-shadow/.test(vig[0]),
  "vignette eases as pressure closes in");
assert(/body\.pressure-3 \.answers\{[^}]*transition:[^}]*opacity/.test(css),
  "answers dim with a transition in the last 3s");

/* --- view and play-state entries are eased --- */
assert(/@keyframes vIn/.test(css) && /body\.reduced \.view\.on>\*\{animation:none\}/.test(css),
  "view enter eases and dies under reduced motion");
assert(/@keyframes playEnter/.test(css) && /@keyframes actDepart/.test(css),
  "act → play is a pair of eased beats");
assert(/@keyframes endIn/.test(css), "results ending is staged");
assert(/@keyframes answerSlam/.test(css), "answers ease onto the stage");
assert(/@keyframes lockStamp/.test(css), "lock stamp is keyed");

/* --- walk uses the compositor path --- */
assert(/requestAnimationFrame\(step\)/.test(atlas), "map walk is rAF, not a CSS snap");
assert(/durationForPath/.test(atlas), "walk duration is computed, not instant");

/* --- keyframes close and stay off the layout path --- */
function keyframeBlocks(src) {
  const out = [];
  const re = /@keyframes\s+([A-Za-z0-9_-]+)\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex, depth = 1;
    while (i < src.length && depth) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    out.push({ name: m[1], body: src.slice(re.lastIndex, i - 1) });
  }
  return out;
}
const frames = keyframeBlocks(css);
assert(frames.length >= 20, "motion suite can see the keyframes (got " + frames.length + ")");
frames.forEach((kf) => {
  const body = kf.body;
  const stops = [...body.matchAll(/(?:from|to|\d+%)/g)].map((x) => x[0]);
  assert(stops.length > 0, kf.name + " has at least one stop");
  const layout = /(?:^|[;{])\s*(?:left|top|right|bottom|margin|padding)\s*:/.test(body);
  assert(!layout, kf.name + " does not animate layout edges");
});

assert(/@keyframes candleFlicker/.test(css), "the play candle flame flickers");
assert(!/@keyframes emberFall/.test(css) && !/@keyframes emberRise/.test(css),
  "play no longer runs a falling-ember cycle");
assert(/function updateCandle/.test(game) && /function quitPlay/.test(game),
  "play candle heat and quit are wired");
assert(/id="play-candle"/.test(fs.readFileSync(path.join(ROOT, "index.html"), "utf8")),
  "play candle is in the markup");
assert(/id="play-quit"/.test(fs.readFileSync(path.join(ROOT, "index.html"), "utf8")),
  "play quit is in the markup");

/* --- looping motion dies under reduced & motion-calm --- */
const reducedHooks = [
  ["#grain", "grain"],
  ["lamp-flame", "lamp flicker"],
  [".answers.drift", "answer drift"],
  [".route-line", "atlas dash"],
  [".traveler-walker", "traveler walk"],
  ["#judge-burst", "judge burst"],
  [".ember", "embers"],
  [".smoke-wisp", "smoke"],
  [".ring.crit", "ring pulse"],
  [".verse-stage:after", "trial sweep"],
  [".play-candle", "play candle flame"]
];
const reducedSelectors = [...css.matchAll(/body\.reduced[^{]*\{/g)].map((m) => m[0]);
reducedHooks.forEach(([hook, name]) => {
  assert(reducedSelectors.some((s) => s.indexOf(hook) >= 0),
    name + " (" + hook + ") is killed under reduced motion");
});

const calmSelectors = [...css.matchAll(/body\.motion-calm[^{]*\{/g)].map((m) => m[0]);
["#grain", ".route-line", ".traveler-walker", ".site-marker.current .beacon"].forEach((hook) => {
  assert(calmSelectors.some((s) => s.indexOf(hook) >= 0),
    hook + " is suppressed under body.motion-calm");
});

/* --- map walker sprite dimensions --- */
assert(/\.traveler-walker\s*\{[^}]*height:\s*(?:72px|92px)/.test(css), "walker rendered height matches sprite aspect ratio");
assert(/background-size:\s*(?:320px 72px|448px 92px)/.test(css), "walker background-size matches frame strip");
assert(/--walker-idle/.test(css), "idle sprite is swappable per scholar");
assert(/--walker-walk/.test(css), "walk sprite is swappable per scholar");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — motion · overlays fade · plates ease · calm & reduced tiers verified · " + frames.length + " keyframes closed");
