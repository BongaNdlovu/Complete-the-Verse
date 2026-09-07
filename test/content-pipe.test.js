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

const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
const verses = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "content", "verses.json"), "utf8"));
const sites = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "content", "sites.json"), "utf8"));
const tablets = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "content", "tablets.json"), "utf8"));

ok("index loads content-json before game.js",
  index.indexOf('src="js/content-json.js"') < index.indexOf('src="js/game.js"') &&
  index.indexOf('src="js/content-json.js"') > 0);
ok("game waits for ContentJson.load",
  /ContentJson\.load/.test(game) && /startCtvBoot/.test(game));
ok("sw precaches shared verses json", /shared\/content\/verses\.json/.test(sw));
ok("sw precaches content-json.js", /js\/content-json\.js/.test(sw));

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

if (fail) {
  console.log("FAIL — content pipe · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — content pipe · " + pass + " assertions");
