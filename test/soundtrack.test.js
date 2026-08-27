/**
 * Soundtrack bed coverage — files, TRACKS map, and call-site wiring.
 * Run: node soundtrack.test.js
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

const BEDS = [
  { key: "menu", file: "menu.mp3", slot: "Title / menu" },
  { key: "act1", file: "act1.mp3", slot: "Trial Act I — The Signal (+ Practice)" },
  { key: "act2", file: "act2.mp3", slot: "Trial Act II — The Pursuit (+ Daily)" },
  { key: "act3", file: "act3.mp3", slot: "Trial Act III — The Blackout (+ Endless)" },
  { key: "act4", file: "act4.mp3", slot: "Trial Act IV — No Turning Back" },
  { key: "act5", file: "act5.mp3", slot: "Trial Act V — The Final Test" },
  { key: "results", file: "results.mp3", slot: "Results screen" },
  { key: "finalStillness", file: "final-stillness.mp3", slot: "Completed-run results" },
  { key: "suddenDescent", file: "sudden-descent.mp3", slot: "Failed-run results" },
  { key: "indigo", file: "indigo.mp3", slot: "Tutorial and Ur (cycle start)" },
  { key: "heroes", file: "heroes.mp3", slot: "Road question bed" },
  { key: "pointOfImpact", file: "point-of-impact.mp3", slot: "Road question bed" },
  { key: "primarySuspect", file: "primary-suspect.mp3", slot: "Road question bed" },
  { key: "theTrace", file: "the-trace.mp3", slot: "Road question bed" },
  { key: "theUncovering", file: "the-uncovering.mp3", slot: "Road question bed" },
  { key: "awakeningMachine", file: "awakening-machine.mp3", slot: "Road question bed" },
  { key: "machineAwakening", file: "machine-awakening.mp3", slot: "Road question bed" }
];

assert(/const TRACKS\s*=\s*\{[\s\S]*?\};/.test(game), "TRACKS object present");

const tracksBlock = game.match(/const TRACKS\s*=\s*\{([\s\S]*?)\};/);
assert(!!tracksBlock, "TRACKS block parseable");
const tracksBody = tracksBlock ? tracksBlock[1] : "";

BEDS.forEach((bed) => {
  const abs = path.join(ROOT, "audio", bed.file);
  assert(fs.existsSync(abs), bed.key + " file missing: audio/" + bed.file + " (" + bed.slot + ")");
  if (fs.existsSync(abs)) {
    const size = fs.statSync(abs).size;
    assert(size > 100000, bed.key + " file too small (" + size + " bytes)");
    const head = Buffer.alloc(3);
    const fd = fs.openSync(abs, "r");
    fs.readSync(fd, head, 0, 3, 0);
    fs.closeSync(fd);
    const isId3 = head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33; // ID3
    const isFf = head[0] === 0xff && (head[1] & 0xe0) === 0xe0; // MPEG frame sync
    assert(isId3 || isFf, bed.key + " does not look like an MP3 (bad header)");
  }
  const mapped = new RegExp(bed.key + '\\s*:\\s*"audio/' + bed.file.replace(".", "\\.") + '"').test(tracksBody);
  assert(mapped, bed.key + ' must map to "audio/' + bed.file + '" in TRACKS');
});

// Extra keys in TRACKS would be unexpected for this pack size
const keys = [...tracksBody.matchAll(/(\w+)\s*:/g)].map((m) => m[1]);
const expected = BEDS.map((b) => b.key);
keys.forEach((k) => assert(expected.includes(k), "unexpected TRACKS key: " + k));
assert(keys.length === expected.length, "TRACKS should have exactly " + expected.length + " beds (got " + keys.length + ")");

// Call sites that must hit track beds
assert(/Snd\.ambience\("menu"\)/.test(game), 'menu view calls Snd.ambience("menu")');
assert(/Snd\.ambience\(\(R && R\.resultTrack\) \|\| "results"\)/.test(game),
  'results view keeps the neutral results bed as its fallback');
assert(/Snd\.ambience\(\(R && R\.resultTrack\) \|\| "results"\)/.test(game),
  "results view selects the resolved result bed");
assert(/R\.resultTrack\s*=\s*reason === "complete" \? "finalStillness"/.test(game),
  "completed runs select Final Stillness");
assert(/reason === "death" \|\| reason === "abandon"/.test(game) && /"suddenDescent"/.test(game),
  "failed and abandoned runs select Sudden Descent");
assert(/Snd\.ambience\("indigo"\)/.test(game),
  "first-run tutorial selects Indigo");
assert(/function cueQuestionMusic\(/.test(game),
  "question-time music helper exists");
assert(/ROAD_QUESTION_BEDS/.test(game), "road question beds cycle including indigo");
assert(/cueQuestionMusic\(\)/.test(game),
  "live questions cue a question bed");
assert(/Snd\.ambience\(A\.pal\)/.test(game), "beginAct uses act palette ambience");
assert(/pal:"act1"/.test(game) && /pal:"act2"/.test(game) && /pal:"act3"/.test(game) &&
  /pal:"act4"/.test(game) && /pal:"act5"/.test(game), "ACTS define pal act1–act5");

// Mode palette routing for non-trial
assert(/mode==="endless"\s*\?\s*"act3"/.test(game), "Endless uses act3 bed");
assert(/mode==="practice"\s*\?\s*"act1"/.test(game), "Practice uses act1 bed");
assert(/:\s*"act2"/.test(game), "Daily uses act2 bed");

// Playback plumbing
assert(/function playTrack\(name\)/.test(game), "playTrack helper");
assert(/function stopAllTracks\(/.test(game), "stopAllTracks helper");
assert(/TRACKS\[bed\]/.test(game), "unlock resumes current track bed");
assert(/if\(TRACKS\[name\]\)/.test(game), "ambience prefers TRACKS over synth pad");

assert(/base<=0/.test(game) && /tension\(level\)/.test(game),
  "tension does not revive a muted bed");
assert(/if\(base<=0\)/.test(game) && /function duckMusic/.test(game),
  "ducking a muted bed stays silent");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — soundtrack · " + BEDS.length + " beds wired");
