/* Live counts must match player-facing and current-guide copy.
   Source of truth is the same loaders the game uses. */
const fs = require("fs");
const path = require("path");
const { loadBank } = require("./scripts/load-bank");
const S = require("./js/sites");
const Amod = require("./js/artifacts");

const root = __dirname;
const bank = loadBank();
const verses = bank.VERSES.length;
const books = bank.BOOKS_ORDER.length;
const passages = (bank.PASSAGES || []).length;
const sites = S.SITES.length;
const arcs = S.ARCS.length;
const relics = (Amod.ARTIFACTS || []).length;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : ""));
  }
}

ok("bank has verses", verses >= 250, verses);
ok("66 books", books === 66, books);
ok("sites are 46", sites === 46, sites);
ok("arcs are 5", arcs === 5, arcs);
ok("one relic per site", relics === sites, { relics: relics, sites: sites });

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
ok("index og:description names live verse count",
  index.indexOf(String(verses) + " verses") >= 0,
  { verses: verses });
ok("index does not advertise 423 verses", index.indexOf("423 verses") < 0);
ok("index does not advertise a 36-count road",
  !/36-site|36-stop|\b36 sites\b|\b36 relics\b/.test(index));

const man = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
ok("manifest names live verse count",
  String(man.description).indexOf(String(verses) + " KJV verses") >= 0,
  man.description);
ok("manifest names live site count",
  String(man.description).indexOf(String(sites) + "-site") >= 0,
  man.description);
ok("manifest has dropped 423", String(man.description).indexOf("423") < 0);
ok("manifest has dropped 36-site", String(man.description).indexOf("36-site") < 0);

const guide = fs.readFileSync(path.join(root, "docs", "DEVELOPER-GUIDE.md"), "utf8");
ok("guide current-state sites match live",
  guide.indexOf(String(sites) + " sites") >= 0, sites);
ok("guide current-state verses match live",
  guide.indexOf(String(verses) + " verses") >= 0, verses);
ok("guide does not still say 36 sites as current",
  !/\b36 sites\b/.test(guide));
ok("guide does not still say 36-stop",
  guide.indexOf("36-stop") < 0);
ok("guide does not still say 423 verses as current",
  guide.indexOf("423 verses") < 0);
ok("guide does not still say 423 in the browser",
  guide.indexOf("423 in the browser") < 0);
ok("guide does not still say 36 relics as current",
  !/\b36 relics\b/.test(guide));

const testJs = fs.readFileSync(path.join(root, "test.js"), "utf8");
const suiteBlock = testJs.match(/const SUITE = \[([\s\S]*?)\];/);
const suiteCount = suiteBlock
  ? suiteBlock[1].split("\n").filter(function (l) { return /^\s*\[/.test(l); }).length
  : 0;
ok("test.js registers the live suite list", suiteCount >= 30, suiteCount);
ok("guide names live suite count",
  guide.indexOf(String(suiteCount) + " suites") >= 0 ||
  guide.indexOf(String(suiteCount) + " test suites") >= 0,
  { suiteCount: suiteCount });
ok("guide does not still say 28 suites",
  guide.indexOf("28 suites") < 0 && guide.indexOf("28 test suites") < 0);

ok("app does not register a service worker",
  index.indexOf("serviceWorker") < 0);

const smokePath = path.join(root, "plans", "SMOKE-CHECKLIST.md");
if (fs.existsSync(smokePath)) {
  const smoke = fs.readFileSync(smokePath, "utf8");
  ok("smoke checklist does not claim a service worker",
    !/service worker/i.test(smoke));
}

if (fail) {
  console.log("FAIL — metadata · " + pass + " passed · " + fail + " failed · live verses=" + verses + " sites=" + sites);
  process.exit(1);
}
console.log("PASS — metadata · " + pass + " assertions · verses=" + verses + " sites=" + sites + " arcs=" + arcs + " relics=" + relics + " passages=" + passages + " books=" + books);
