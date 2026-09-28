#!/usr/bin/env node
/* Scratch probe: learn a KJV->NKJV lexeme lexicon from the parallel corpus.

   Alignment noise (Genesis 1:1 "living soul" vs "living being") comes from
   the two editions disagreeing about *which word* carries a thought, not
   from word order. A hand-written synonym table would only ever cover the
   899 verses in the bank; the corpus covers the whole Bible, so the pairs
   it finds are the ones this translation actually uses.

   Method: pointwise mutual information over (kjvStem, nkjvStem) pairs that
   co-occur in the same verse, ranked by a chi-square-ish association. Only
   pairs that never share a canonical form are candidates, so the output is
   translation shifts, not morphology. */
const fs = require("fs");
const path = require("path");
const ROOT = require("./repo-root");
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const A = require("./nkjv-align");

const src = loadSourceDump().verses;
const bank = loadBank();

/* Full KJV text: the bank carries whole verses in verses.js, and the
   extra/more/ascent files add the rest. Reconstruct the text of a verse
   the same way the game does. */
const kjvByRef = new Map();
const all = [].concat(bank.VERSES || [], bank.VERSES_EXTRA || [], bank.VERSES_MORE || [], bank.VERSES_ASCENT || []);
all.forEach(v => {
  if (!kjvByRef.has(v.r)) kjvByRef.set(v.r, A.norm(String(v.p || "") + " " + String(v.a || "") + " " + String(v.s || "")));
});
console.log("kjv refs:", kjvByRef.size, "| nkjv refs:", Object.keys(src).length);

const STOP = new Set(("the a an and or but in on at to for of with by from as is are was were be been being " +
  "have has had do does did shall will should would may might must can could i me my mine we us our ours you your " +
  "yours he him his she her hers it its they them their theirs that this these those there here who whom whose what " +
  "which when where why how not no nor so than then also if because though while unto upon into out up down off " +
  "again away all any some every each both more most very own same such only just now yet ever never").split(" "));
const content = w => w && !STOP.has(w) && w.length > 2;

let n = 0;
const kjvCount = new Map(), nkjvCount = new Map(), pairCount = new Map();
Object.keys(src).forEach(ref => {
  const kjvKey = ref.replace(/^Psalms\b/, "Psalm");
  const k = kjvByRef.get(ref) || kjvByRef.get(kjvKey);
  if (!k) return;
  const nt = A.norm(src[ref]);
  if (!nt) return;
  n++;
  const ks = Array.from(new Set(k.split(" ").filter(content).map(A.canon)));
  const ns = Array.from(new Set(nt.split(" ").filter(content).map(A.canon)));
  ks.forEach(w => kjvCount.set(w, (kjvCount.get(w) || 0) + 1));
  ns.forEach(w => nkjvCount.set(w, (nkjvCount.get(w) || 0) + 1));
  ks.forEach(a => ns.forEach(b => {
    if (a === b) return;
    const key = a + "\u0000" + b;
    pairCount.set(key, (pairCount.get(key) || 0) + 1);
  }));
});

console.log("verses paired:", n, "| distinct pairs:", pairCount.size);

const scored = [];
pairCount.forEach((c, key) => {
  if (c < 8) return;
  const [a, b] = key.split("\u0000");
  const pa = c / kjvCount.get(a), pb = c / nkjvCount.get(b);
  // Both directions must be reasonably high: "day"->"day" noise dominates
  // otherwise because "day" is everywhere.
  const score = Math.min(pa, pb) * Math.log(c);
  scored.push({ a, b, c, pa: +pa.toFixed(3), pb: +pb.toFixed(3), score: +score.toFixed(3) });
});
scored.sort((x, y) => y.score - x.score);

console.log("\ntop 120 learned pairs (kjv -> nkjv, count, p(kjv|pair), p(nkjv|pair), score):");
scored.slice(0, 120).forEach(s =>
  console.log("  " + (s.a + " -> " + s.b).padEnd(34) + String(s.c).padStart(6) +
    "  " + String(s.pa).padStart(6) + "  " + String(s.pb).padStart(6) + "  " + s.score));

fs.writeFileSync(path.join(ROOT, "content", "nkjv", "probe-lexicon.json"),
  JSON.stringify(scored.slice(0, 400), null, 2));
console.log("\nwrote content/nkjv/probe-lexicon.json (" + Math.min(400, scored.length) + " pairs)");
