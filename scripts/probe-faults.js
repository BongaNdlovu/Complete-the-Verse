#!/usr/bin/env node
/* Scratch probe: list the blanks that still fail QA, next to any curated
   alignment that already exists for the same reference. */
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const A = require("./nkjv-align");
const S = require("./nkjv-source");
const QA = require("./verse-qa");
const { EXPLICIT } = require("./nkjv-alignments");
const HAND = require("./nkjv-hand").VERSES;

const index = S.buildIndex(loadSourceDump().verses);
const bank = loadBank();

const errsOf = item =>
  QA.auditVerse(item).filter(f => f.severity === "error" && f.code !== "option-count").map(f => f.code);

const rows = [];
bank.VERSES.forEach(v => {
  const text = S.sourceFor(v.r, index);
  if (!text) return;
  const explicit = EXPLICIT[v.r];
  const hand = HAND[v.r];
  const cut = explicit || hand;
  const res = cut ? { p: cut.p, a: cut.a, s: cut.s } : A.alignBlank(v, text);
  if (res.miss) { rows.push({ r: v.r, kind: "miss", miss: res.miss, src: text }); return; }
  const item = { b: v.b, r: v.r, t: v.t, p: res.p, a: res.a, s: res.s, d: (hand && hand.d) || (explicit && explicit.d) || [] };
  if (hand && hand.qaOk) item.qaOk = hand.qaOk;
  if (explicit && explicit.qaOk) item.qaOk = explicit.qaOk;
  const codes = errsOf(item);
  if (!codes.length) return;
  rows.push({ r: v.r, kind: "fault", cur: res.a, codes, src: text });
});

console.log("rows:", rows.length);
rows.forEach(x => {
  console.log("\n" + x.r + (x.kind === "miss" ? "   [align miss: " + x.miss + "]" : "   [" + x.codes.join(",") + "]"));
  if (x.kind === "miss") console.log("    nkjv: " + x.src);
  else {
    console.log("    current : " + JSON.stringify(x.cur));
    console.log("    nkjv    : " + x.src);
  }
});
