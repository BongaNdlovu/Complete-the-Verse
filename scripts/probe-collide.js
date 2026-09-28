#!/usr/bin/env node
/* Scratch probe: show every KJV bank entry that maps to a colliding NKJV
   blank, so the collision can be traced to the aligner, a curated entry, or
   a hand cut. */
const fs = require("fs");
const path = require("path");
const ROOT = require("./repo-root");
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const { buildIndex, sourceFor } = require("./nkjv-source");
const A = require("./nkjv-align");
const QA = require("./verse-qa");
const { EXPLICIT } = require("./nkjv-alignments");
const HAND = require("./nkjv-hand").VERSES;

const index = buildIndex(loadSourceDump().verses);
const bank = loadBank();
const report = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "nkjv", "build-report.json"), "utf8"));

const byKey = new Map();
bank.VERSES.forEach(v => {
  const explicit = EXPLICIT[v.r];
  const hand = HAND[v.r];
  const cut = explicit || hand;
  const res = cut ? { p: cut.p, a: cut.a, s: cut.s } : A.alignBlank(v, sourceFor(v.r, index));
  if (res.miss) return;
  const key = QA.norm(v.r) + "||" + QA.norm(res.a);
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push({ v, res, from: explicit ? "curated" : hand ? "hand" : "aligned" });
});

let n = 0;
byKey.forEach((list, key) => {
  if (list.length < 2) return;
  n++;
  console.log("\n" + list[0].v.r + '   NKJV blank: "' + list[0].res.a + '"');
  list.forEach(x => {
    console.log("   " + x.from.padEnd(8) + ' KJV blank "' + x.v.a + '"');
    console.log("      KJV p: " + x.v.p);
    console.log("      NKJV p: " + x.res.p);
  });
});
console.log("\n" + n + " colliding references");
void report;
