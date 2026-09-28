#!/usr/bin/env node
/* Scratch probe: how far does the NKJV blank drift from the KJV blank's
   size, and what do the worst drifts look like? */
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const A = require("./nkjv-align");
const S = require("./nkjv-source");

const src = loadSourceDump().verses;
const index = S.buildIndex(src);
const bank = loadBank();
const sourceFor = ref => S.sourceFor(ref, index);

const rows = [];
bank.VERSES.forEach(v => {
  const text = sourceFor(v.r);
  if (!text) return;
  const res = A.alignBlank(v, text);
  if (res.miss) return;
  const ka = A.tokens(v.a).length, na = A.tokens(res.a).length;
  rows.push({ r: v.r, kjv: v.a, nkjv: res.a, k: ka, n: na, delta: na - ka });
});

const hist = {};
rows.forEach(x => { hist[x.delta] = (hist[x.delta] || 0) + 1; });
console.log("word-count delta histogram (nkjv - kjv):");
Object.keys(hist).sort((a, b) => a - b).forEach(k =>
  console.log("  " + (k > 0 ? "+" + k : k).padStart(4) + "  " + hist[k]));

const over = rows.filter(x => x.n > x.k + 2).sort((a, b) => b.delta - a.delta);
console.log("\nspans longer than the KJV blank by 3+ words:", over.length);
over.slice(0, 25).forEach(x => {
  console.log("\n  " + x.r + "  (" + x.k + " -> " + x.n + ")");
  console.log("    kjv : " + x.kjv);
  console.log("    nkjv: " + x.nkjv);
});

const under = rows.filter(x => x.n < x.k - 1);
console.log("\nspans shorter than the KJV blank by 2+ words:", under.length);
under.slice(0, 15).forEach(x => {
  console.log("  " + x.r + " (" + x.k + " -> " + x.n + ")  kjv=\"" + x.kjv + "\"  nkjv=\"" + x.nkjv + "\"");
});
