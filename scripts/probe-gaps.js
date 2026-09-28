#!/usr/bin/env node
/* Scratch probe: the blanks that still fail the gate after the distractor
   pass, using the builder's own decisions so this cannot drift from the
   build. These are the entries that need a curated option set. */
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const { buildIndex } = require("./nkjv-source");
const QA = require("./verse-qa");
const B = require("./build-nkjv");
const { EXPLICIT } = require("./nkjv-alignments");

const index = buildIndex(loadSourceDump().verses);
const bank = loadBank();
const stats = { cut: { curated: 0, hand: 0, aligned: 0 }, items: 0 };

let optionGaps = 0, blankFaults = 0;
bank.VERSES.forEach(v => {
  const plan = B.planVerse(v, index, stats);
  if (!plan) { console.log("NO CUT  " + v.r); return; }
  const item = B.finishVerse(v, plan.cut, stats);
  const errs = QA.auditVerse(item).filter(f => f.severity === "error");
  if (!errs.length) return;
  const codes = errs.map(f => f.code);
  const onlyOptions = codes.every(c => c === "option-count");
  if (onlyOptions) optionGaps++; else blankFaults++;
  console.log("\n" + v.r + "   [" + codes.join(",") + "]  (" + item.d.length + "/3 options)");
  console.log("   NKJV blank : " + JSON.stringify(item.a));
  console.log("   got        : " + JSON.stringify(item.d));
  const ex = EXPLICIT[v.r];
  if (ex) console.log("   curated    : " + JSON.stringify(ex.d || []) + "   a=" + JSON.stringify(ex.a));
  console.log("   kjv d      : " + JSON.stringify(v.d));
  console.log("   kjv blank  : " + JSON.stringify(v.a));
  console.log("   nkjv text  : " + String(plan.cut.source).slice(0, 220));
});

console.log("\n" + optionGaps + " blanks short of three options, " + blankFaults + " with a blank fault");
console.log("cuts: " + JSON.stringify(stats.cut));
