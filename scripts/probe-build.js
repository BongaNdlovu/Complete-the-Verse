#!/usr/bin/env node
/* Scratch probe: build the NKJV verse bank in memory (alignment only, no
   distractors), run the shared QA gate over it, and report what still
   fails plus alignment misses. */
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const A = require("./nkjv-align");
const S = require("./nkjv-source");
const QA = require("./verse-qa");
const { EXPLICIT } = require("./nkjv-alignments");
const HAND = require("./nkjv-hand").VERSES;

const index = S.buildIndex(loadSourceDump().verses);
const bank = loadBank();

const missing = [], misses = [], faults = [];
const items = [];

bank.VERSES.forEach(v => {
  const text = S.sourceFor(v.r, index);
  if (!text) { missing.push({ r: v.r, a: v.a }); return; }
  // Priority: a curated alignment (already checked word-for-word against the
  // licensed text), then a hand cut, then the aligner.
  const explicit = EXPLICIT[v.r];
  const hand = HAND[v.r];
  const cut = explicit || hand;
  const res = cut ? { p: cut.p, a: cut.a, s: cut.s } : A.alignBlank(v, text);
  if (res.miss) { misses.push({ r: v.r, a: v.a, miss: res.miss, src: text }); return; }
  const item = { b: v.b, r: v.r, t: v.t, p: res.p, a: res.a, s: res.s, d: (hand && hand.d) || (explicit && explicit.d) || [] };
  if (hand && hand.qaOk) item.qaOk = hand.qaOk;
  if (explicit && explicit.qaOk) item.qaOk = explicit.qaOk;
  items.push(item);
});

items.forEach(item => {
  const flags = QA.auditVerse(item)
    .filter(f => f.severity === "error" && f.code !== "option-count");
  if (flags.length) faults.push({ r: item.r, a: item.a, codes: flags.map(f => f.code), detail: flags.map(f => f.detail), item });
});

console.log("bank:", bank.VERSES.length, "| aligned:", items.length,
  "| no source:", missing.length, "| align miss:", misses.length);
console.log("QA faults excluding option-count:", faults.length);

const byCode = {};
faults.forEach(f => f.codes.forEach(c => { byCode[c] = (byCode[c] || 0) + 1; }));
console.log("by code:", byCode);

const group = code => faults.filter(f => f.codes.includes(code));
["answer-too-long", "mid-clause", "no-context", "spans-sentences"].forEach(code => {
  const g = group(code);
  if (!g.length) return;
  console.log("\n=== " + code + " (" + g.length + ") ===");
  g.slice(0, 30).forEach(f => {
    console.log("  " + f.r + '  "' + f.a + '"');
    f.detail.forEach(d => console.log("      " + d));
  });
  if (g.length > 30) console.log("  ... " + (g.length - 30) + " more");
});

if (misses.length) {
  console.log("\n=== align misses ===");
  misses.forEach(m => console.log("  " + m.r + '  "' + m.a + '"  ' + m.miss + "\n      " + String(m.src).slice(0, 160)));
}
if (missing.length) {
  console.log("\n=== no source ===");
  missing.forEach(m => console.log("  " + m.r));
}
