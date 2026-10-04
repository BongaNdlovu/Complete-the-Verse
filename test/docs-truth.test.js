/* Docs truth: numbers written in the living docs must match the repo.

   Guards the two facts that drifted before:
   - suite counts ("73 suites" while 74 ran);
   - the DEVELOPER-GUIDE §3 module map line counts (play.js listed at 550
     while it was 2,531).
   Snapshot reports in docs/reports/ are history and are not checked. */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const SUITE = require("./suite-list.js");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}

const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const LIVING = ["README.md", "docs/DEVELOPER-GUIDE.md", "test/README.md", "js/README.md", "docs/README.md"];

// 1. Any "<N> suites" / "<N> registered test suites" claim equals the real list.
LIVING.forEach(rel => {
  const text = read(rel);
  const re = /\b(\d+)\s+(?:registered\s+)?(?:test\s+)?suites\b/gi;
  let m;
  while ((m = re.exec(text))) {
    ok("1 " + rel + " suite count", Number(m[1]) === SUITE.length,
      { claimed: Number(m[1]), actual: SUITE.length });
  }
});

// 2. Every suite file in the list exists.
SUITE.forEach(([name, file]) => {
  ok("2 suite file exists: " + name, fs.existsSync(path.join(ROOT, file)), file);
});

// 3. DEVELOPER-GUIDE §3 module map line counts stay within 25% of reality.
{
  const guide = read("docs/DEVELOPER-GUIDE.md");
  const start = guide.indexOf("## 3. Module map");
  const end = guide.indexOf("\n## 4.", start);
  ok("3 module map section found", start >= 0 && end > start);
  const section = guide.slice(start, end);
  const rowRe = /^\|\s*`(js\/[^`]+)`(?:\s*\/\s*`(js\/[^`]+)`)?\s*\|\s*([\d,]+)(?:\s*\/\s*([\d,]+))?\s*\|/gm;
  let row, rows = 0;
  while ((row = rowRe.exec(section))) {
    const pairs = [[row[1], row[3]]];
    if (row[2] && row[4]) pairs.push([row[2], row[4]]);
    pairs.forEach(([file, claimedRaw]) => {
      rows++;
      const full = path.join(ROOT, file);
      if (!fs.existsSync(full)) { ok("3 module map file exists: " + file, false); return; }
      const actual = fs.readFileSync(full, "utf8").split(/\r?\n/).length;
      const claimed = Number(claimedRaw.replace(/,/g, ""));
      const drift = Math.abs(actual - claimed) / actual;
      ok("3 module map lines " + file, drift <= 0.25,
        { claimed, actual, hint: "update docs/DEVELOPER-GUIDE.md §3" });
    });
  }
  ok("3 module map has rows", rows >= 20, rows);
}

if (fail) {
  console.log("FAIL — docs truth · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — docs truth · " + pass + " assertions");
