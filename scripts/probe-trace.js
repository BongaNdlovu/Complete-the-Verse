#!/usr/bin/env node
/* Scratch probe: trace the aligner on named references. */
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const A = require("./nkjv-align");
const S = require("./nkjv-source");

const index = S.buildIndex(loadSourceDump().verses);
const bank = loadBank();
const refs = process.argv.slice(2);
const targets = refs.length ? refs : ["James 4:7", "Job 19:25", "Matthew 7:7", "Leviticus 19:2", "Zechariah 9:9"];

targets.forEach(ref => {
  const v = bank.VERSES.find(x => x.r === ref);
  if (!v) { console.log(ref + ": not in bank"); return; }
  const text = S.sourceFor(ref, index);
  const nkjvToks = A.tokens(text);
  const echoToks = A.tokens(String(v.p) + " " + String(v.a) + " " + String(v.s));
  const pLen = A.tokens(v.p).length;
  const answerToks = A.tokens(v.a);
  const runAt = A.findAnswerRun(echoToks, answerToks, pLen);
  const runEnd = runAt + answerToks.length - 1;
  const pairs = A.anchorPairs(echoToks, nkjvToks);
  const before = pairs.filter(([ki]) => ki < runAt);
  const after = pairs.filter(([ki]) => ki > runEnd);
  const lo = before.length ? before[before.length - 1][1] + 1 : 0;
  const hi = after.length ? after[0][1] : nkjvToks.length - 1;

  console.log("\n=== " + ref + " ===");
  console.log("  kjv answer: " + JSON.stringify(v.a) + "  (p=" + JSON.stringify(v.p) + ")");
  console.log("  nkjv      : " + text);
  console.log("  runAt=" + runAt + " runEnd=" + runEnd + " lo=" + lo + " hi=" + hi);
  console.log("  region    : " + JSON.stringify(nkjvToks.slice(lo, hi + 1)));
  console.log("  prev anchor: " + JSON.stringify(before.length ? echoToks[before[before.length - 1][0]] + "->" + nkjvToks[before[before.length - 1][1]] : null));
  console.log("  next anchor: " + JSON.stringify(after.length ? echoToks[after[0][0]] + "->" + nkjvToks[after[0][1]] : null));
  const lo2 = A.pickSpan(nkjvToks, lo, hi, answerToks, new Set());
  console.log("  pickSpan  : " + JSON.stringify(nkjvToks.slice(lo2[0], lo2[1] + 1)));
  const res = A.alignBlank(v, text);
  console.log("  result    : " + JSON.stringify(res));
});
