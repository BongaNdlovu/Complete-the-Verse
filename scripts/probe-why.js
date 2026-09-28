#!/usr/bin/env node
/* Scratch probe: exact gate output for named references, using the builder's
   own decisions. */
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const { buildIndex } = require("./nkjv-source");
const QA = require("./verse-qa");
const B = require("./build-nkjv");

const index = buildIndex(loadSourceDump().verses);
const bank = loadBank();
const targets = process.argv.slice(2);
const stats = { cut: { curated: 0, hand: 0, aligned: 0 }, spent: {}, answersByRef: {} };

targets.forEach(ref => {
  bank.VERSES.filter(v => v.r === ref).forEach(v => {
    const plan = B.planVerse(v, index, stats);
    if (!plan) { console.log("\n" + ref + ": no cut"); return; }
    const item = B.finishVerse(v, plan.cut, { cut: {}, items: 0 });
    console.log("\n=== " + ref + "   source=" + plan.cut.from + "   KJV blank=" + JSON.stringify(v.a));
    console.log("   p=" + JSON.stringify(item.p));
    console.log("   a=" + JSON.stringify(item.a));
    console.log("   s=" + JSON.stringify(item.s));
    console.log("   d=" + JSON.stringify(item.d));
    QA.auditVerse(item).forEach(f =>
      console.log("   " + f.severity.toUpperCase().padEnd(7) + f.code + ": " + f.detail));
    console.log("   distractors offered by the generator: " +
      JSON.stringify(require("./nkjv-distractors").makeDistractors({
        kjv: v, nkjv: { p: item.p, a: item.a, s: item.s }, item, sourceText: plan.cut.source
      })));
  });
});
