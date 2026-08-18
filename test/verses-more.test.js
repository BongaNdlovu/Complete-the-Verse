/**
 * Hand-authored bank expansion (js/verses-more.js).
 * Run: node verses-more.test.js
 *
 * Guards the three rules the file claims for itself, plus the wiring that
 * made the pack invisible to the browser and green under Node only.
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

const morePath = path.join(ROOT, "js", "verses-more.js");
const bankPath = path.join(ROOT, "js", "bank.js");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const bankSrc = fs.readFileSync(bankPath, "utf8");
const moreSrc = fs.readFileSync(morePath, "utf8");

/* ---------- wiring: browser, Node loader, merge ---------- */
assert(fs.existsSync(morePath), "js/verses-more.js exists");
assert(/src="js\/verses-more\.js"/.test(index), "index.html loads verses-more.js");
assert(index.indexOf('src="js/verses-more.js"') < index.indexOf('src="js/bank.js"'),
  "verses-more.js is listed before bank.js so VERSES_MORE exists at merge time");
assert(index.indexOf('src="js/verses-extra.js"') < index.indexOf('src="js/verses-more.js"'),
  "verses-more.js loads after verses-extra.js (stable base first)");

assert(FILES.includes("js/verses-more.js"), "load-bank.js includes verses-more.js");
assert(/VERSES_MORE/.test(bankSrc) && /VERSES\.push\(\.\.\.VERSES_MORE\)/.test(bankSrc),
  "bank.js merges VERSES_MORE into VERSES");
assert(/typeof VERSES_MORE !== "undefined"/.test(bankSrc),
  "bank.js guards the merge so a missing file cannot crash the page");

const bank = loadBank();
assert(Array.isArray(bank.VERSES_MORE), "loadBank exposes VERSES_MORE");
assert(bank.VERSES_MORE.length >= 50,
  "VERSES_MORE holds a real expansion (got " + bank.VERSES_MORE.length + ")");

const moreById = new Map(bank.VERSES_MORE.map(v => [bank.verseId(v), v]));
const liveMore = bank.VERSES.filter(v => moreById.has(v.id));
eq("every more-entry is in the merged bank", liveMore.length, bank.VERSES_MORE.length);

/* ---------- content gate: every more-entry must pass ---------- */
const gateFails = bank.VERSES_MORE.filter(v =>
  QA.auditVerse(v).some(f => f.severity === "error"));
assert(gateFails.length === 0,
  "every VERSES_MORE entry passes the QA gate (failing: " +
  gateFails.slice(0, 8).map(v => v.r).join(", ") +
  (gateFails.length > 8 ? " +" + (gateFails.length - 8) : "") + ")");

/* ---------- no shared reference+blank with the rest of the bank ---------- */
const baseRefsBlanks = new Set();
bank.VERSES.forEach(v => {
  if (moreById.has(v.id)) return;
  baseRefsBlanks.add(QA.norm(v.r) + "||" + QA.norm(v.a));
});
const collided = bank.VERSES_MORE.filter(v =>
  baseRefsBlanks.has(QA.norm(v.r) + "||" + QA.norm(v.a)));
assert(collided.length === 0,
  "no VERSES_MORE blank collides with an existing bank blank (" +
  collided.map(v => v.r).join(", ") + ")");

/* Pack rule 3: no reference the rest of the bank already uses — even with
   a different blank — so a player never sees the same verse twice in a run. */
const baseRefs = new Set();
bank.VERSES.forEach(v => {
  if (moreById.has(v.id)) return;
  baseRefs.add(QA.norm(v.r));
});
const reusedRefs = bank.VERSES_MORE.filter(v => baseRefs.has(QA.norm(v.r)));
assert(reusedRefs.length === 0,
  "no VERSES_MORE reference is already in the base bank (" +
  reusedRefs.map(v => v.r).join(", ") + ")");

/* Explicit regression: Job 23:10 must not reappear in more. */
assert(!bank.VERSES_MORE.some(v => /job\s*23\s*:\s*10/i.test(v.r)),
  "Job 23:10 is not re-authored into VERSES_MORE");

/* ---------- three pack rules from the file header ---------- */
// 1. No single-word blanks.
const singles = bank.VERSES_MORE.filter(v => QA.tokens(v.a).length < 2);
assert(singles.length === 0,
  "no single-word blanks in VERSES_MORE (" + singles.map(v => v.r).join(", ") + ")");

// 2. Exactly three distractors, each non-empty.
bank.VERSES_MORE.forEach(v => {
  assert(Array.isArray(v.d) && v.d.length === 3,
    v.r + " has exactly three distractors");
  assert(v.d.every(d => typeof d === "string" && d.trim().length > 0),
    v.r + " distractors are non-empty strings");
});

// 3. Every reference in more is unique within more (no self-duplicates).
const seenRef = new Set();
const selfDup = [];
bank.VERSES_MORE.forEach(v => {
  const k = QA.norm(v.r);
  if (seenRef.has(k)) selfDup.push(v.r);
  seenRef.add(k);
});
assert(selfDup.length === 0,
  "VERSES_MORE has no repeated references (" + selfDup.join(", ") + ")");

/* ---------- Zephaniah 3:20 regression (was too long + mid-clause) ---------- */
const zeph = bank.VERSES_MORE.find(v => /zephaniah\s*3\s*:\s*20/i.test(v.r));
assert(zeph, "Zephaniah 3:20 remains in VERSES_MORE after repair");
const zephFlags = QA.auditVerse(zeph).filter(f => f.severity === "error");
assert(zephFlags.length === 0,
  "Zephaniah 3:20 passes the gate (was answer-too-long + mid-clause)");
assert(QA.tokens(zeph.a).length <= 8, "Zephaniah 3:20 blank is a held phrase (≤8 words)");
assert(!/^among\b/i.test(String(zeph.s).trim()),
  "Zephaniah 3:20 does not resume on binding preposition 'among'");

/* ---------- header documents the pack contract ---------- */
assert(/NO SINGLE-WORD BLANKS/i.test(moreSrc), "header documents no single-word blanks");
assert(/NO REFERENCE THAT THE BANK ALREADY USES/i.test(moreSrc),
  "header documents no reused references");
assert(/build-verse-extra/i.test(moreSrc),
  "header explains why the pack is separate from verses-extra.js");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — verses-more · " + bank.VERSES_MORE.length + " entries · wired and clean");
