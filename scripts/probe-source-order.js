#!/usr/bin/env node
/* Scratch probe: for each verse, compare the aligner's cut against the hand
   cut and the curated cut, and report how each fares at the gate. This picks
   the precedence order by evidence rather than by argument. */
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const { buildIndex, sourceFor } = require("./nkjv-source");
const A = require("./nkjv-align");
const QA = require("./verse-qa");
const { EXPLICIT } = require("./nkjv-alignments");
const { VERSES: HAND } = require("./nkjv-hand");

const index = buildIndex(loadSourceDump().verses);
const bank = loadBank();
const STOP = new Set(["the", "a", "an", "and", "or", "but", "of", "in", "on",
  "to", "unto", "for", "with", "by", "from", "as", "is", "be", "was", "were",
  "shall", "will", "his", "her", "your", "their", "my", "our"]);

function contentWords(text) {
  return A.tokens(text).map(A.canon).filter(w => w && !STOP.has(w));
}
function sameBlank(ov, kjv) {
  const want = contentWords(String(ov.p) + " " + String(ov.a) + " " + String(ov.s));
  const have = contentWords(String(kjv.p) + " " + String(kjv.a) + " " + String(kjv.s));
  if (!want.length) return false;
  const pool = have.slice();
  let hit = 0;
  want.forEach(w => { const at = pool.indexOf(w); if (at >= 0) { hit++; pool.splice(at, 1); } });
  return hit >= Math.max(1, Math.ceil(want.length * 0.6));
}

const blankErrs = item => QA.auditVerse(Object.assign({}, item, { d: item.d || [] }))
  .filter(f => f.severity === "error" && f.code !== "option-count").map(f => f.code);

const stats = { hand: 0, handBetter: 0, handWorse: 0, curated: 0, curatedBetter: 0, curatedWorse: 0 };
const better = []; const worse = [];
const unsourced = [];

bank.VERSES.forEach(v => {
  const text = sourceFor(v.r, index);
  const auto = text ? A.alignBlank(v, text) : { miss: "no-source" };
  const autoItem = auto.miss ? null : { b: v.b, r: v.r, t: v.t, p: auto.p, a: auto.a, s: auto.s, d: [] };
  const autoErrs = autoItem ? blankErrs(autoItem) : ["no-cut"];

  [["hand", HAND[v.r]], ["curated", EXPLICIT[v.r]]].forEach(([name, ov]) => {
    if (!ov) return;
    if (!sameBlank(ov, v)) return;
    stats[name]++;
    const item = { b: v.b, r: v.r, t: v.t, p: ov.p, a: ov.a, s: ov.s, d: [] };
    const ovErrs = blankErrs(item);
    if (ovErrs.length < autoErrs.length) { stats[name + "Better"]++; better.push({ r: v.r, name, ov: ov.a, auto: auto.a || auto.miss }); }
    else if (ovErrs.length > autoErrs.length) { stats[name + "Worse"]++; worse.push({ r: v.r, name, ov: ov.a, auto: auto.a || auto.miss, ovErrs, autoErrs }); }
  });
  if (auto.miss && !HAND[v.r] && !EXPLICIT[v.r]) unsourced.push(v.r + " (" + auto.miss + ")");
});

console.log("hand overrides matching a bank blank:", stats.hand,
  "| better than the aligner:", stats.handBetter, "| worse:", stats.handWorse);
console.log("curated overrides matching a bank blank:", stats.curated,
  "| better than the aligner:", stats.curatedBetter, "| worse:", stats.curatedWorse);
console.log("\noverrides that beat the aligner:");
better.forEach(b => console.log("  " + b.name.padEnd(8) + b.r.padEnd(23) +
  ' ov="' + b.ov + '"  auto="' + b.auto + '"'));
console.log("\noverrides that LOSE to the aligner:"); worse.forEach(w => console.log("  " + w.name.padEnd(8) + w.r.padEnd(23) + String(w.ovErrs).padEnd(34) + " ov=\"" + w.ov + "\"  auto=\"" + w.auto + "\"  autoErrs=" + JSON.stringify(w.autoErrs))); console.log("\nno cut from any source: " + unsourced.length);
unsourced.forEach(u => console.log("  " + u));
