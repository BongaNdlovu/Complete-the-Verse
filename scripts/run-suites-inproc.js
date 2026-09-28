#!/usr/bin/env node
/* Sandbox-friendly twin of test.js.

   test.js shells out to each suite with piped stdio. Some restricted
   environments refuse to open the named pipes that `execFileSync(...,
   {stdio:"pipe"})` needs (EPERM), which makes every suite look like a
   failure. This runner uses stdio:"inherit" instead, so it reports the
   real result. Same SUITE list, same exit code contract.

   Usage: node scripts/run-suites-inproc.js [name-filter] */
const { execFileSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SUITE = require(path.join(ROOT, "test", "suite-list.js"));

const filter = process.argv[2] || "";
let failed = 0;
let ran = 0;

for (const [name, file] of SUITE) {
  if (filter && !name.includes(filter) && !file.includes(filter)) continue;
  ran++;
  process.stdout.write("  ..    " + name.padEnd(16));
  try {
    execFileSync(process.execPath, [path.join(ROOT, file)], { stdio: "inherit" });
    process.stdout.write("  ok    " + name + "\n");
  } catch (e) {
    failed++;
    console.log("\n  FAIL  " + name + "  (" + file + ", exit " + e.status + ")");
  }
}

console.log("");
console.log(failed ? failed + " of " + ran + " suites FAILED" : "all " + ran + " suites passed");
process.exit(failed ? 1 : 0);
