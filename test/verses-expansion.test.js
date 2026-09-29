/**
 * 500-verse canonical expansion pack (js/verses-expansion.js).
 * Run: node test/verses-expansion.test.js
 */
const fs = require("fs");
const path = require("path");
const { loadBank, FILES } = require("../scripts/load-bank");
const QA = require("../scripts/verse-qa");

const ROOT = require("../scripts/repo-root");
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }
function eq(msg, a, b) {
  if (a !== b) fails.push(msg + " (got " + JSON.stringify(a) + ", want " + JSON.stringify(b) + ")");
}

const expansionPath = path.join(ROOT, "js", "verses-expansion.js");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const bankSrc = fs.readFileSync(path.join(ROOT, "js", "bank.js"), "utf8");

assert(fs.existsSync(expansionPath), "js/verses-expansion.js exists");
const deferSrc = fs.readFileSync(path.join(ROOT, "js", "defer.js"), "utf8");
assert(/js\/verses-expansion\.js/.test(deferSrc), "defer.js loads verses-expansion.js after first paint");
assert(!/src="js\/verses-expansion\.js"/.test(index), "verses-expansion.js is not on the intro script path");
assert(FILES.includes("js/verses-expansion.js"), "load-bank.js includes verses-expansion.js");
assert(/VERSES_EXPANSION/.test(bankSrc) && /absorbVersePack/.test(bankSrc) &&
  /VERSES\.push\(\.\.\.VERSES_EXPANSION\)/.test(bankSrc),
  "bank.js merges VERSES_EXPANSION at parse and can absorb it late");

const bank = loadBank();
assert(Array.isArray(bank.VERSES_EXPANSION), "loadBank exposes VERSES_EXPANSION");
eq("VERSES_EXPANSION has exactly 500 verses", (bank.VERSES_EXPANSION || []).length, 500);

const byId = new Map(bank.VERSES_EXPANSION.map(v => [bank.verseId(v), v]));
const live = bank.VERSES.filter(v => byId.has(v.id));
eq("every expansion entry is in the merged bank", live.length, bank.VERSES_EXPANSION.length);

const gateFails = bank.VERSES_EXPANSION.filter(v =>
  QA.auditVerse(v).some(f => f.severity === "error"));
assert(gateFails.length === 0,
  "every VERSES_EXPANSION entry passes the QA gate (failing: " +
  gateFails.slice(0, 8).map(v => v.r).join(", ") + ")");

const baseRefs = new Set();
bank.VERSES.forEach(v => {
  if (byId.has(v.id)) return;
  baseRefs.add(QA.norm(v.r));
});
const reused = bank.VERSES_EXPANSION.filter(v => baseRefs.has(QA.norm(v.r)));
assert(reused.length === 0,
  "no VERSES_EXPANSION reference is already in the base bank (" +
  reused.map(v => v.r).join(", ") + ")");

const booksCovered = new Set(bank.VERSES_EXPANSION.map(v => v.b));
eq("all 66 books covered in expansion", booksCovered.size, 66);

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — verses-expansion · " + bank.VERSES_EXPANSION.length + " verses · 66 books");
