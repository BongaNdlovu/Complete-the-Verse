#!/usr/bin/env node
/* Scratch probe: dump the aligner's internals for named refs by monkey
   patching the span picker, so tracing cannot drift from the real code. */
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const A = require("./nkjv-align");
const S = require("./nkjv-source");

const index = S.buildIndex(loadSourceDump().verses);
const bank = loadBank();
const targets = process.argv.slice(2);

const realPick = A.pickSpan;
const picks = [];
A.pickSpan = function (toks, lo, hi, kjvWords, ctx) {
  const out = realPick(toks, lo, hi, kjvWords, ctx);
  picks.push({ loop: JSON.stringify(toks.slice(lo, hi + 1)), out: JSON.stringify(toks.slice(out[0], out[1] + 1)) });
  return out;
};

/* alignBlank closes over pickSpan, so re-require it fresh after patching is
   not possible; instead re-run the same steps the function does. */
targets.forEach(ref => {
  const v = bank.VERSES.find(x => x.r === ref);
  if (!v) { console.log(ref + ": not in bank"); return; }
  const text = S.sourceFor(ref, index);
  const nkjvToks = A.tokens(text);
  const answerToks = A.tokens(v.a);
  const { toks: echoToks, pLen } = A.echoOf(v);
  const runAt = A.findAnswerRun(echoToks, answerToks, pLen);
  const runEnd = runAt + answerToks.length - 1;
  const pairs = A.anchorPairs(echoToks, nkjvToks);
  const before = pairs.filter(([ki]) => ki < runAt);
  const after = pairs.filter(([ki]) => ki > runEnd);
  const lo = before.length ? before[before.length - 1][1] + 1 : 0;
  const hi = after.length ? after[0][1] : nkjvToks.length - 1;
  console.log("\n=== " + ref + " ===  answer=" + JSON.stringify(v.a));
  console.log("  lo=" + lo + " hi=" + hi + " region=" + JSON.stringify(nkjvToks.slice(lo, hi + 1)));
  const out = A.pickSpan(nkjvToks, lo, hi, answerToks, new Set());
  console.log("  pickSpan -> " + JSON.stringify(nkjvToks.slice(out[0], out[1] + 1)));
  console.log("  alignBlank -> " + JSON.stringify(A.alignBlank(v, text)));
  picks.length = 0;
});
