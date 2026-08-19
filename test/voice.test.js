/**
 * Recorded mission-voice files + lookup wiring.
 * Run: node voice.test.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = require("../scripts/repo-root");
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

/* The engine is split across module files; static checks read the
   concatenation through the one shared list (scripts/engine-source.js). */
const { readEngine } = require("../scripts/engine-source");
const game = readEngine(ROOT);
const atlas = fs.readFileSync(path.join(ROOT, "js", "atlas.js"), "utf8");

const LINES = [
  { key: "the signal is live", file: "act-1-signal.mp3" },
  { key: "the pursuit begins", file: "act-2-pursuit.mp3" },
  { key: "blackout protocol", file: "act-3-blackout.mp3" },
  { key: "no turning back", file: "act-4-no-turning-back.mp3" },
  { key: "this is the final test", file: "act-5-final-test.mp3" },
  { key: "rapid recall five verses six seconds each", file: "set-rapid.mp3" },
  { key: "book lockdown source restricted", file: "set-lockdown.mp3" },
  { key: "the missing passage three phrases gone lifelines offline", file: "set-missing.mp3" },
  { key: "no second chances", file: "set-nochance.mp3" },
  { key: "final reconstruction rebuild the passage", file: "set-reconstruct.mp3" },
  { key: "final reconstruction rebuild the ending", file: "set-reconstruct.mp3" },
  { key: "book lockdown the source is exodus", file: "set-sinai.mp3" },
  { key: "the wall is fallen rebuild what stood", file: "set-jericho.mp3" },
  { key: "the exile three phrases gone lifelines offline", file: "set-babylon.mp3" },
  { key: "overdrive scripture locked", file: "overdrive.mp3" },
  { key: "one life remains", file: "one-life.mp3" },
  { key: "the run is abandoned", file: "end-abandon.mp3" },
  { key: "perfect recall the record is complete", file: "end-perfect.mp3" },
  { key: "scripture mastered", file: "end-mastered.mp3" },
  { key: "you survived the final test", file: "end-survived.mp3" },
  { key: "the record closes prepare for another run", file: "end-defeated.mp3" },
  { key: "the pilgrimage ur to patmos", file: "map-open.mp3" },
  { key: "the next place is open", file: "map-unlocked.mp3" },
  { key: "that place is still sealed", file: "map-sealed.mp3" }
];

assert(/const VOICE_FILES\s*=/.test(game), "VOICE_FILES map present");
assert(/function voiceKey\(/.test(game), "voiceKey helper present");
assert(/function playVoice\(src/.test(game), "playVoice helper present");
assert(/playVoice:playVoice/.test(game), "playVoice exported on Snd");
assert(/Snd\.playVoice/.test(game), "speak() prefers recorded files");

/* Every shipped voice reference must resolve. This catches direct Snd calls
   that bypass Director's map and previously left a missing MP3 in production. */
const voiceRefs = [...game.matchAll(/audio\/voice\/([^"']+)/g)].map(m => m[1]);
voiceRefs.forEach(file => {
  assert(fs.existsSync(path.join(ROOT, "audio", "voice", file)), "missing referenced voice/" + file);
});

LINES.forEach((line) => {
  const abs = path.join(ROOT, "audio", "voice", line.file);
  assert(fs.existsSync(abs), "missing audio/voice/" + line.file);
  if (fs.existsSync(abs)) {
    assert(fs.statSync(abs).size > 500, line.file + " too small");
  }
  const mapped = new RegExp(
    '"' + line.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"\\s*:\\s*"audio/voice/' +
    line.file.replace(".", "\\.") + '"'
  ).test(game);
  assert(mapped, 'VOICE_FILES missing "' + line.key + '" -> ' + line.file);
});

assert(/speak\("The pilgrimage\. Ur to Patmos\."\)/.test(atlas), "atlas cold open speaks");
assert(/speak\("The next place is open\."\)/.test(atlas), "atlas unlock speaks");
assert(/Director\.speak\("That place is still sealed\."/.test(game), "locked site speaks");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
const files = new Set(LINES.map((l) => l.file));
console.log("PASS — voice · " + files.size + " files · " + LINES.length + " spoken keys");
