/**
 * Hand-authored ascent pack (js/verses-ascent.js).
 * Run: node verses-ascent.test.js
 */
const fs = require("fs");
const path = require("path");
const { loadBank, FILES } = require("./scripts/load-bank");
const QA = require("./scripts/verse-qa");

const root = __dirname;
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }
function eq(msg, a, b) {
  if (a !== b) fails.push(msg + " (got " + JSON.stringify(a) + ", want " + JSON.stringify(b) + ")");
}

const ascentPath = path.join(root, "js", "verses-ascent.js");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const bankSrc = fs.readFileSync(path.join(root, "js", "bank.js"), "utf8");

assert(fs.existsSync(ascentPath), "js/verses-ascent.js exists");
assert(/src="js\/verses-ascent\.js"/.test(index), "index.html loads verses-ascent.js");
assert(index.indexOf('src="js/verses-ascent.js"') < index.indexOf('src="js/bank.js"'),
  "verses-ascent.js is listed before bank.js");
assert(index.indexOf('src="js/verses-more.js"') < index.indexOf('src="js/verses-ascent.js"'),
  "verses-ascent.js loads after verses-more.js");
assert(FILES.includes("js/verses-ascent.js"), "load-bank.js includes verses-ascent.js");
assert(/VERSES_ASCENT/.test(bankSrc) && /VERSES\.push\(\.\.\.VERSES_ASCENT\)/.test(bankSrc),
  "bank.js merges VERSES_ASCENT into VERSES");

const bank = loadBank();
assert(Array.isArray(bank.VERSES_ASCENT), "loadBank exposes VERSES_ASCENT");
assert(bank.VERSES_ASCENT.length >= 150,
  "VERSES_ASCENT holds a real climb (got " + (bank.VERSES_ASCENT || []).length + ")");

const byId = new Map(bank.VERSES_ASCENT.map(v => [bank.verseId(v), v]));
const live = bank.VERSES.filter(v => byId.has(v.id));
eq("every ascent entry is in the merged bank", live.length, bank.VERSES_ASCENT.length);

const gateFails = bank.VERSES_ASCENT.filter(v =>
  QA.auditVerse(v).some(f => f.severity === "error"));
assert(gateFails.length === 0,
  "every VERSES_ASCENT entry passes the QA gate (failing: " +
  gateFails.slice(0, 8).map(v => v.r).join(", ") + ")");

const baseRefs = new Set();
bank.VERSES.forEach(v => {
  if (byId.has(v.id)) return;
  baseRefs.add(QA.norm(v.r));
});
const reused = bank.VERSES_ASCENT.filter(v => baseRefs.has(QA.norm(v.r)));
assert(reused.length === 0,
  "no VERSES_ASCENT reference is already in the base bank (" +
  reused.map(v => v.r).join(", ") + ")");

const singles = bank.VERSES_ASCENT.filter(v => QA.norm(v.a).split(" ").length < 2);
assert(singles.length === 0,
  "no single-word blanks in the ascent pack (" + singles.map(v => v.r).join(", ") + ")");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — verses-ascent · " + bank.VERSES_ASCENT.length + " verses");
