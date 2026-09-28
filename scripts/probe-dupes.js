#!/usr/bin/env node
/* Scratch probe: does each bank repeat a (reference, blank) pair? The bank
   derives its ids from exactly those two fields, so a repeat is a collision. */
const { loadBank } = require("./load-bank");
const QA = require("./verse-qa");

["kjv", "nkjv"].forEach(ed => {
  const b = loadBank(ed);
  const seen = new Map();
  const dupes = [];
  b.VERSES.forEach(v => {
    const k = QA.norm(v.r) + "||" + QA.norm(v.a);
    if (seen.has(k)) dupes.push(v.r + '  "' + v.a + '"  (id ' + v.id + ")");
    seen.set(k, v);
  });
  console.log(ed.toUpperCase() + ": " + b.VERSES.length + " verses, " + dupes.length + " duplicate (ref, blank) pairs");
  dupes.forEach(d => console.log("   " + d));
});
