/**
 * Sound-effect file + wiring checks.
 * Run: node sfx.test.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = require("../scripts/repo-root");
const fails = [];
function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

/* The engine is split across module files; static checks read the
   concatenation through the one shared list (scripts/engine-source.js). */
const { readEngine } = require("../scripts/engine-source");
const game = readEngine(ROOT);
const css = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8");

const SFX = [
  { key: "hover", file: "hover.mp3" },
  { key: "lock", file: "lock.mp3" },
  { key: "correct", file: "correct.mp3" },
  { key: "wrong", file: "wrong.mp3" },
  { key: "power", file: "power.mp3" },
  /* Motion-pass beats (Aug 2026): Streak Ignition, Overdrive Surge,
     Lamp Loss Tremor pair, verdict stamp. */
  { key: "ignite", file: "streak-ignite.mp3" },
  { key: "odReady", file: "od-ready.mp3" },
  { key: "lampThud", file: "lamp-thud.mp3" },
  { key: "lampCrackle", file: "lamp-crackle.mp3" },
  { key: "stamp", file: "verdict-stamp.mp3" }
];

assert(/const SFX\s*=\s*\{/.test(game), "SFX map present");
assert(/function playSfx\(name\)/.test(game), "playSfx helper present");
assert(/Snd\.hover\(/.test(game), "hover call site present");
assert(/doFlash\("heart"\)/.test(game), "heartbeat triggers red screen flash");
assert(/#flash\.heart/.test(css), "heart flash CSS present");
assert(/@keyframes heartFlash/.test(css), "heartFlash keyframes present");

SFX.forEach((s) => {
  const abs = path.join(ROOT, "sfx", s.file);
  assert(fs.existsSync(abs), "missing sfx/" + s.file);
  if (fs.existsSync(abs)) {
    assert(fs.statSync(abs).size > 500, s.key + " file too small");
  }
  assert(new RegExp(s.key + '\\s*:\\s*"sfx/' + s.file.replace(".", "\\.") + '"').test(game),
    s.key + " mapped in SFX");
  assert(new RegExp('playSfx\\("' + s.key + '"\\)').test(game), s.key + " playSfx wired");
});

// Tick/heart/ui samples are too long for per-click / per-second use (8–9s).
// Countdown and chrome stay on short synth so they stay in time.
["tick", "ui"].forEach((k) => {
  assert(!new RegExp('playSfx\\("' + k + '"\\)').test(game), k + " must stay synth (sample too long)");
});
assert(/playSfx\("heart"\)/.test(game), "heartbeat uses the trimmed sample");

// Still-synth hooks that remain to replace later
["act", "seal", "level", "death", "victory"].forEach((k) => {
  assert(new RegExp(k + "\\(\\)\\{").test(game) || new RegExp(k + "\\(\\)\\{ ").test(game) || game.includes(k + "(){"),
    k + " hook still exists");
  assert(!new RegExp('playSfx\\("' + k + '"\\)').test(game), k + " should still be pending (no sample yet)");
});

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — sfx · " + SFX.length + " samples wired · heart beat · tick/ui synth");
