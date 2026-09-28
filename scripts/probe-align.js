#!/usr/bin/env node
/* Scratch probe: run the new aligner over the whole KJV bank and report
   alignment rate, QA outcome per aligned item, and the leftovers. */
const fs = require("fs");
const path = require("path");
const ROOT = require("./repo-root");
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const A = require("./nkjv-align");
const QA = require("./verse-qa");

const src = loadSourceDump().verses;
const bank = loadBank();

const SPLIT_RUN = ["1 Thessalonians 5:19"];
function sourceFor(ref) {
  if (SPLIT_RUN.includes(ref)) {
    return ["1 Thessalonians 5:19", "1 Thessalonians 5:20", "1 Thessalonians 5:21"]
      .map(r => src[r]).filter(Boolean).join(" ");
  }
  return src[ref] || src[ref.replace(/^Psalm\b/, "Psalms")];
}

const miss = {};
const qa = {};
const aligned = [];
const hand = [];

bank.VERSES.forEach(v => {
  const text = sourceFor(v.r);
  if (!text) { miss["no-source"] = (miss["no-source"] || 0) + 1; return; }
  const res = A.alignBlank(v, text);
  if (res.miss) {
    miss[res.miss] = (miss[res.miss] || 0) + 1;
    hand.push({ r: v.r, a: v.a, miss: res.miss });
    return;
  }
  const item = { b: v.b, r: v.r, t: v.t, p: res.p, a: res.a, s: res.s, d: [] };
  const flags = QA.auditVerse(item);
  const codes = flags.filter(f => f.severity === "error").map(f => f.code);
  codes.forEach(c => { qa[c] = (qa[c] || 0) + 1; });
  aligned.push({ r: v.r, a: res.a, flags: codes, src: text, item });
});

console.log("aligned:", aligned.length, "/", bank.VERSES.length);
console.log("misses:", miss);
console.log("QA errors on aligned (distractors not yet generated):", qa);

const bad = aligned.filter(x => x.flags.some(c => c !== "option-count"));
console.log("\nnon-option faults:", bad.length);
bad.slice(0, 30).forEach(x => console.log("  " + x.r + '  "' + x.a + '"  ' + x.flags.join(",")));
if (bad.length > 30) console.log("  ... " + (bad.length - 30) + " more");

fs.writeFileSync(path.join(ROOT, "content", "nkjv", "probe-align.json"),
  JSON.stringify({ misses: hand, faults: bad.map(x => ({ r: x.r, a: x.a, flags: x.flags })) }, null, 2));

console.log("\nsample aligned:");
aligned.slice(0, 5).forEach(x => console.log("  " + JSON.stringify(x.item)));
