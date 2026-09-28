const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const { ContentJson } = require("../js/content-json.js");
const { loadBank } = require("../scripts/load-bank.js");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}

const verses = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "content", "verses.json"), "utf8"));
const sites = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "content", "sites.json"), "utf8"));
const tablets = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "content", "tablets.json"), "utf8"));

const bank = loadBank();
ok("shared verses count matches JS bank", verses.verses.length === bank.VERSES.length);

const VERSES = bank.VERSES.slice();
const BY_TIER = { 1: [], 2: [], 3: [], 4: [], 5: [] };
const BY_ID = {};
global.VERSES = VERSES;
global.BY_TIER = BY_TIER;
global.BY_ID = BY_ID;
ContentJson.applyVerses(verses);
ok("applyVerses keeps the bank length", VERSES.length === verses.verses.length);
ok("applyVerses rebuilds BY_ID", Object.keys(BY_ID).length === verses.verses.length);

const SITES = [{ id: "old" }];
const ARCS = [{ key: "old" }];
global.SITES = SITES;
global.ARCS = ARCS;
ContentJson.applySites(sites);
ok("applySites replaces the road", SITES.length === sites.sites.length && SITES[0].id !== "old");
ok("applySites replaces arcs", ARCS.length === sites.arcs.length);

ok("tablets json has chapters", Array.isArray(tablets.chapters) && tablets.chapters.length > 0);

// Check export --check command runs cleanly
const cp = require("child_process");
const checkRes = cp.spawnSync(process.execPath, [path.join(ROOT, "scripts", "export-content.mjs"), "--check"], { encoding: "utf8" });
ok("export-content --check passes", checkRes.status === 0);

// NKJV content pipe verification
const nkjvVersesFile = path.join(ROOT, "shared", "content", "nkjv", "verses.json");
if (fs.existsSync(nkjvVersesFile)) {
  const nkjvData = JSON.parse(fs.readFileSync(nkjvVersesFile, "utf8"));
  ok("shared nkjv verses json is valid array", Array.isArray(nkjvData.verses));
}

if (fail) {
  console.log("FAIL — content pipe · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — content pipe · " + pass + " assertions");
