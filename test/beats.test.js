/**
 * Motion-pass beats — Streak Ignition, Overdrive Surge, Lamp Loss
 * Tremor + lock punch / verdict stamp deepening.
 * Run: node beats.test.js
 *
 * Pure cadence math is asserted directly against Polish (same code the
 * browser runs); wiring is text-asserted per the structural-test
 * convention because game.js cannot be require()d in bare Node.
 */
const fs = require("fs");
const path = require("path");

const ROOT = require("../scripts/repo-root");
const Polish = require("../js/polish");
const { readEngine } = require("../scripts/engine-source");

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.error("  FAIL: " + msg); }
}

const game = readEngine(ROOT);
const playCss = fs.readFileSync(path.join(ROOT, "css", "play.css"), "utf8");
const gameCss = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8");
const allCss = playCss + "\n" + gameCss;

/* ---------- Beat math (pure, booted for real) ---------- */
assert(Polish.BEATS && Polish.BEATS.IGNITE_START === 5 && Polish.BEATS.IGNITE_EVERY === 3,
  "Polish.BEATS carries the shipped ignition cadence");
assert(Polish.streakIgniteAt(5) === true, "ignition fires at streak 5");
assert(Polish.streakIgniteAt(8) === true && Polish.streakIgniteAt(11) === true,
  "ignition repeats every 3rd correct answer");
assert(Polish.streakIgniteAt(4) === false && Polish.streakIgniteAt(6) === false,
  "ignition stays quiet off the cadence");
assert(Polish.streakIgniteAt(0) === false && Polish.streakIgniteAt(-2) === false,
  "ignition is safe on zero/negative streaks");

/* ---------- Samples exist and are mapped ---------- */
["streak-ignite.mp3", "od-ready.mp3", "lamp-thud.mp3", "lamp-crackle.mp3", "verdict-stamp.mp3"]
  .forEach((f) => {
    const p = path.join(ROOT, "sfx", f);
    assert(fs.existsSync(p) && fs.statSync(p).size > 5000, "sfx/" + f + " exists and is non-trivial");
  });
["ignite:\"sfx/streak-ignite.mp3\"", "odReady:\"sfx/od-ready.mp3\"",
 "lampThud:\"sfx/lamp-thud.mp3\"", "lampCrackle:\"sfx/lamp-crackle.mp3\"",
 "stamp:\"sfx/verdict-stamp.mp3\""].forEach((m) => {
  assert(game.indexOf(m) >= 0, "SFX map contains " + m.split(":")[0]);
});

/* ---------- Beat 1: Streak Ignition wired in the correct path ---------- */
assert(/Polish\.streakIgniteAt\(R\.streak\)/.test(game), "resolveAnswer consults the ignition cadence");
assert(game.includes('toast("IGNITION — the chain burns ×"'), "ignition announces itself once via toast");
assert(/R\.igniteAnnounced/.test(game), "the ignition announcement fires once per run");
assert(/rail\.classList\.add\("streak-ignite"\)/.test(game), "the score rail takes the ignite class");
assert(/@keyframes igniteFlare/.test(allCss), "ignite flare keyframes exist");
assert(/body\.reduced \.streak-ignite::after[\s\S]{0,80}/.test(playCss) &&
       /body\.motion-calm \.streak-ignite::after/.test(playCss),
  "ignite flare dies under reduced and motion-calm");

/* ---------- Beat 2: Overdrive Surge ---------- */
assert(/el\.classList\.add\("od-ready"\)/.test(game), "arming overlay takes the surge class");
assert(/Snd\.odReady\(\)/.test(game), "overdrive arming plays its sub hit");
assert(/@keyframes odShockwave/.test(allCss), "shockwave keyframes exist");
assert(/document\.body\.classList\.add\("ember-ride"\)/.test(game), "riding arms the ember edges");
assert(/document\.body\.classList\.remove\("ember-ride"\)/.test(game),
  "ember ride clears on miss (applyMiss covers choice and typed)");
assert(/@keyframes emberDriftL/.test(allCss) && /@keyframes emberDriftR/.test(allCss),
  "ember drift keyframes exist (names avoid the banned emberFall/Rise)");
assert(!/@keyframes emberFall/.test(allCss) && !/@keyframes emberRise/.test(allCss),
  "no banned emberFall/emberRise keyframes were reintroduced");
assert(/body\.reduced\.ember-ride [\s\S]*?display:none/.test(playCss) &&
       /body\.motion-calm\.ember-ride [\s\S]*?display:none/.test(playCss),
  "ember ride dies under reduced and motion-calm");

/* ---------- Beat 3: Lamp Loss Tremor ---------- */
assert(/stage\.classList\.add\("stage-tremor"\)/.test(game), "loseLife trembles the stage");
assert(/Snd\.lampThud\(\)/.test(game) && /Snd\.lampCrackle\(\)/.test(game),
  "lost lamp pairs thud with crackle");
assert(/@keyframes stageTremor/.test(allCss), "stage tremor keyframes exist");
assert(/if\(R\.sceneToken === tok\) stage\.classList\.remove\("stage-tremor"\)/.test(game),
  "tremor cleanup is scene-token guarded so it dies with the question");
assert(/body\.reduced \.stage-tremor,[\s\S]{0,60}body\.motion-calm \.stage-tremor/.test(playCss),
  "tremor dies under reduced and motion-calm");

/* ---------- Deepening: lock punch + verdict stamp ---------- */
assert(/btn\.classList\.add\("sel","sel-punch"\)/.test(game), "chosen card takes the lock punch");
assert(/@keyframes lockPunch/.test(allCss), "lock punch keyframes exist");
assert(/v\.classList\.add\("verdict-stamp"\)/.test(game), "verse text takes the verdict stamp");
assert(/Snd\.stamp\(\)/.test(game), "verdict stamp plays its click");
assert(/@keyframes verdictStamp/.test(allCss), "verdict stamp keyframes exist");

/* ---------- House rules preserved ---------- */
const flowSrc = fs.readFileSync(path.join(ROOT, "js", "flow.js"), "utf8");
assert(/JUDGE_MS\s*=\s*2500/.test(flowSrc), "the 2.5s teach pause is untouched");
assert(/answerHoldMs\(\)/.test(game), "answers still route through answerHoldMs");
assert(/\? 1400 : 1500/.test(game), "correct-answer chaining keeps 1400/1500");
assert(/body\.reduced #judge-burst,body\.reduced #judge-burst i\{animation:none!important/.test(playCss),
  "the judge burst reduced gate survives the stamp addition");

/* ---------- Keyframe hygiene (mirrors motion.test.js contract) ---------- */
{
  const re = /@keyframes\s+([A-Za-z0-9_-]+)\s*\{/g;
  let m;
  while ((m = re.exec(allCss))) {
    let i = re.lastIndex, depth = 1;
    while (i < allCss.length && depth) {
      if (allCss[i] === "{") depth++;
      else if (allCss[i] === "}") depth--;
      i++;
    }
    const body = allCss.slice(re.lastIndex, i - 1);
    const layout = /(?:^|[;{])\s*(?:left|top|right|bottom|margin|padding)\s*:/.test(body);
    assert(!layout, "keyframe " + m[1] + " animates no layout edges");
  }
}

if (fail) {
  console.error(fail + " of " + (pass + fail) + " beat checks failed");
  process.exit(1);
}
console.log("PASS — beats · " + pass + " assertions · ignition · surge · tremor · punch · stamp");
