#!/usr/bin/env node
/* Runs every check. `node test.js` before shipping anything.

   Logic tests come first: if the scheduler or the grader is wrong, the
   structural tests passing tells you nothing worth knowing. */
const { execFileSync } = require("child_process");
const path = require("path");

const SUITE = [
  ["content gate",   "scripts/qa-verses.js"],
  ["verse-qa logic", "verse-qa.test.js"],
  ["srs logic",      "srs.test.js"],
  ["recall logic",   "recall.test.js"],
  ["geo logic",      "geo.test.js"],
  ["pilgrimage",     "pilgrimage.test.js"],
  ["live data",      "live.test.js"],
  ["integration",    "integration.test.js"],
  ["game structure", "game-structure.test.js"],
  ["ui structure",   "ui-structure.test.js"],
  ["atlas data",     "sites.test.js"],
  ["atlas view",     "atlas.test.js"],
  ["soundtrack",     "soundtrack.test.js"],
  ["sfx",            "sfx.test.js"]
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
