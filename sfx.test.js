/**
 * Sound-effect file + wiring checks.
 * Run: node sfx.test.js
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const fails = [];
function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

const game = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "game.css"), "utf8");

const SFX = [
  { key: "ui", file: "ui.mp3" },
  { key: "hover", file: "hover.mp3" },
  { key: "lock", file: "lock.mp3" },
  { key: "correct", file: "correct.mp3" },
  { key: "wrong", file: "wrong.mp3" },
  { key: "tick", file: "tick.mp3" },
  { key: "heart", file: "heart.mp3" },
  { key: "power", file: "power.mp3" }
];

assert(/const SFX\s*=\s*\{/.test(game), "SFX map present");
assert(/function playSfx\(name\)/.test(game), "playSfx helper present");
assert(/Snd\.hover\(/.test(game), "hover call site present");
assert(/doFlash\("heart"\)/.test(game), "heartbeat triggers red screen flash");
assert(/#flash\.heart/.test(css), "heart flash CSS present");
assert(/@keyframes heartFlash/.test(css), "heartFlash keyframes present");

SFX.forEach((s) => {
  const abs = path.join(root, "sfx", s.file);
  assert(fs.existsSync(abs), "missing sfx/" + s.file);
  if (fs.existsSync(abs)) {
    assert(fs.statSync(abs).size > 500, s.key + " file too small");
  }
  assert(new RegExp(s.key + '\\s*:\\s*"sfx/' + s.file.replace(".", "\\.") + '"').test(game),
    s.key + " mapped in SFX");
  assert(new RegExp('playSfx\\("' + s.key + '"\\)').test(game), s.key + " playSfx wired");
});

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
console.log("PASS — sfx · " + SFX.length + " samples wired · 5 still pending");
