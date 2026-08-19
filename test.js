#!/usr/bin/env node
/* Runs every check. `node test.js` before shipping anything.

   Logic tests come first: if the scheduler or the grader is wrong, the
   structural tests passing tells you nothing worth knowing. */
const { execFileSync } = require("child_process");
const path = require("path");

const SUITE = [
  ["content gate",   "scripts/qa-verses.js"],
  ["verse-qa logic", "test/verse-qa.test.js"],
  ["verses-more", "test/verses-more.test.js"],
  ["verses-ascent", "test/verses-ascent.test.js"],
  ["assemble", "test/assemble.test.js"],
  ["meta climb", "test/meta.test.js"],
  ["event flow", "test/flow.test.js"],
  ["srs logic", "test/srs.test.js"],
  ["recall logic", "test/recall.test.js"],
  ["onboarding", "test/onboarding.test.js"],
  ["geo logic", "test/geo.test.js"],
  ["pilgrimage", "test/pilgrimage.test.js"],
  ["characters", "test/characters.test.js"],
  ["artifacts", "test/artifacts.test.js"],
  ["menu modes", "test/menu-modes.test.js"],
  ["live data", "test/live.test.js"],
  ["integration", "test/integration.test.js"],
  ["engine modules", "test/engine-modules.test.js"],
  ["game structure", "test/game-structure.test.js"],
  ["ui structure", "test/ui-structure.test.js"],
  ["atlas data", "test/sites.test.js"],
  ["atlas view", "test/atlas.test.js"],
  ["soundtrack", "test/soundtrack.test.js"],
  ["sfx", "test/sfx.test.js"],
  ["mission voice", "test/voice.test.js"],
  ["cloud merge", "test/cloud.test.js"],
  ["polish helpers", "test/polish.test.js"],
  ["improvements", "test/improvements.test.js"],
  ["sky3d", "test/sky3d.test.js"],
  ["gameplay polish", "test/gameplay-polish.test.js"],
  ["excitement", "test/excitement.test.js"],
  ["answering", "test/answering.test.js"],
  ["interaction", "test/interaction-contract.test.js"],
  ["motion", "test/motion.test.js"],
  ["fixes", "test/fixes.test.js"],
  ["metadata", "test/metadata.test.js"],
  ["coffee pilgrim", "test/coffee-pilgrimage.test.js"],
  ["e2e elements", "test/e2e-game-elements.test.js"],
  ["simulation", "test/playthrough-simulation.test.js"],
  ["diag", "test/diag.test.js"]
];

let failed = 0;
SUITE.forEach(([name, file]) => {
  try {
    const out = execFileSync(process.execPath, [path.join(__dirname, file)], {encoding:"utf8", stdio:"pipe"});
    const last = out.trim().split("\n").filter(Boolean).pop() || "ok";
    console.log("  ok    " + name.padEnd(16) + last);
  } catch (e) {
    failed++;
    console.log("  FAIL  " + name);
    console.log(String(e.stdout || "").split("\n").map(l => "        " + l).join("\n"));
    console.log(String(e.stderr || "").split("\n").map(l => "        " + l).join("\n"));
  }
});

console.log("");
console.log(failed ? failed + " of " + SUITE.length + " suites FAILED" : "all " + SUITE.length + " suites passed");
process.exit(failed ? 1 : 0);
