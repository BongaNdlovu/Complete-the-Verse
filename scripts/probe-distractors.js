#!/usr/bin/env node
/* ==================================================================
   PROBE: DISTRACTORS — measure the NKJV distractor generator.

   Aligns the whole KJV bank onto the NKJV dump, generates a distractor
   set for every item that aligned, and runs the real gate over the
   result. This is the measurement the generator is developed against:
   it prints how many items got a full set of three, how many did not,
   and every QA code that still fires, with a concrete example.

   The items that still fail are written to
   content/nkjv/probe-distract.json for inspection.

   Usage: node scripts/probe-distractors.js [--show "<reference>"]
   ================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = require("./repo-root");
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const { buildIndex, sourceFor } = require("./nkjv-source");
const A = require("./nkjv-align");
const QA = require("./verse-qa");
const D = require("./nkjv-distractors");

const OUT = path.join(ROOT, "content", "nkjv", "probe-distract.json");
const SHOWN = 6;

/* The aligned NKJV item, or a miss. Kept in one place so the probe and
   any future caller measure the same thing. */
function align(bankItem, index) {
  const sourceText = sourceFor(bankItem.r, index);
  if (!sourceText) return { miss: "no-source" };
  const res = A.alignBlank(bankItem, sourceText);
  if (res.miss) return res;
  return {
    sourceText,
    nkjv: res,
    item: { b: bankItem.b, r: bankItem.r, t: bankItem.t, p: res.p, a: res.a, s: res.s, d: [] }
  };
}

/* ---------- accumulation ---------- */

function tally(map, key) { map.set(key, (map.get(key) || 0) + 1); }

function note(codes, examples, code, sample) {
  tally(codes, code);
  if (!examples.has(code)) examples.set(code, sample);
}

function blankFault(item) {
  return QA.auditVerse(Object.assign({}, item, { d: [] }))
    .filter(f => f.code !== "option-count" && f.severity === "error");
}

/* Blanks the gate is happy with but a reader would not be: the aligner
   moved the blank by two words or more, or left a full stop inside it.
   These are advisory — the generator cannot repair them, but they are the
   next thing to look at once every distractor set is clean. */
function looksSuspect(v, item) {
  const drop = Math.abs(QA.tokens(item.a).length - QA.tokens(v.a).length);
  const stopped = /[.!?;]\s+\S/.test(item.a);
  return (drop >= 2 ? "blank moved " + drop + " words from the KJV" : "")
    || (stopped ? "sentence stop inside the blank" : "");
}

/* ---------- the run ---------- */

function run() {
  const bank = loadBank();
  const index = buildIndex(loadSourceDump().verses);
  const acc = {
    misses: new Map(), codes: new Map(), examples: new Map(), why: new Map(),
    sources: new Map(), suspectWhy: new Map(), suspect: [],
    short: [], failing: [], aligned: 0, broken: 0, full: 0, partial: 0, empty: 0, clean: 0,
    trace: []
  };

  bank.VERSES.forEach(v => { one(v, index, acc); });
  return { bank: bank.VERSES.length, acc, index, verses: bank.VERSES };
}

function one(v, index, acc) {
  const got = align(v, index);
  if (got.miss || !got.nkjv) { tally(acc.misses, got.miss || "no-source"); return; }
  acc.aligned++;

  const item = got.item;
  const faults = blankFault(item);
  if (faults.length) {
    // A blank the generator is not allowed to repair. The build routes
    // these to the manual file, so they are counted apart from failures.
    acc.broken++;
    const code = faults.map(f => f.code).join("+");
    note(acc.codes, acc.examples, code, { r: v.r, a: item.a, d: [], why: code });
    acc.failing.push({ r: v.r, a: item.a, blank: code });
    return;
  }

  const suspect = looksSuspect(v, item);
  if (suspect) {
    acc.suspect.push({ r: v.r, kjv: v.a, nkjv: item.a, why: suspect });
    tally(acc.suspectWhy, suspect);
  }

  const d = D.makeDistractors({ kjv: v, nkjv: got.nkjv, sourceText: got.sourceText, item: item }, acc.trace);
  noteSources(item, v, got.nkjv, d, acc);
  const flags = QA.auditVerse(Object.assign({}, item, { d: d }));
  const errors = flags.filter(f => f.severity === "error");
  if (d.length === 3) acc.full++; else if (d.length) acc.partial++; else acc.empty++;
  if (d.length === 3 && !errors.length) acc.clean++;

  if (d.length !== 3) {
    acc.short.push({ r: v.r, a: item.a, p: item.p, s: item.s, got: d.length, d: d });
  }
  acc.trace.forEach(t => {
    if (t.why) tally(acc.why, t.why + (t.relaxed ? " (final pass)" : ""));
  });
  acc.trace = [];
  flags.forEach(f => note(acc.codes, acc.examples, f.code, {
    r: v.r, a: item.a, p: item.p, s: item.s, d: d, why: f.detail
  }));
  if (errors.length) {
    acc.failing.push({
      r: v.r, a: item.a, p: item.p, s: item.s, d: d,
      flags: flags.map(f => f.code + ": " + f.detail)
    });
  }
}

/* Which source each chosen distractor came from — the pool is tagged, so
   matching the text back to it is enough, once the answer's own tail is
   put back on the pool entry the way the picker does. */
function noteSources(item, v, nkjv, chosen, acc) {
  const pool = D.candidatePool(v, nkjv);
  chosen.forEach(text => {
    const hit = pool.find(c => QA.norm(D.matchTail(item.a, c.text)) === QA.norm(text));
    tally(acc.sources, hit ? hit.src : "unmatched");
  });
}

/* ---------- report ---------- */

function fmt(map) {
  return [...map.entries()].map(([k, n]) => k + "=" + n).join(", ") || "none";
}

function report(res) {
  const a = res.acc;
  console.log("=== NKJV distractor probe ===");
  console.log("bank items:             " + res.bank);
  console.log("aligned by the aligner: " + a.aligned);
  console.log("aligner misses:         " + fmt(a.misses));
  console.log("blank already broken:   " + a.broken + "   ([] returned; manual file)");
  console.log("3 distractors:          " + a.full);
  console.log("1-2 distractors:        " + a.partial);
  console.log("0 distractors:          " + a.empty);
  console.log("QA-clean with 3:        " + a.clean + " / " + (a.aligned - a.broken));

  console.log("\n--- remaining QA codes ---");
  if (!a.codes.size) console.log("  (none)");
  [...a.codes.entries()].sort((x, y) => y[1] - x[1]).forEach(([code, n]) => {
    const ex = a.examples.get(code);
    console.log("  " + String(n).padStart(4) + "  " + code);
    if (!ex) return;
    console.log("        e.g. " + ex.r + '  a="' + ex.a + '"');
    if (ex.d && ex.d.length) console.log("             d=" + JSON.stringify(ex.d));
    if (ex.why && ex.why !== code) console.log("             " + ex.why);
  });

  console.log("\n--- short of three distractors --- " + a.short.length);
  a.short.slice(0, SHOWN).forEach(x =>
    console.log("  " + x.r + " [" + x.got + '] a="' + x.a + '" ' + JSON.stringify(x.d)));

  console.log("\n--- where the chosen distractors came from ---");
  [...a.sources.entries()].sort((x, y) => y[1] - x[1]).forEach(([src, n]) =>
    console.log("  " + String(n).padStart(5) + "  " + src));

  console.log("\n--- blanks the gate passes but a reader would not --- " + a.suspect.length);
  [...a.suspectWhy.entries()].sort((x, y) => y[1] - x[1]).forEach(([why, n]) =>
    console.log("  " + String(n).padStart(5) + "  " + why));
  a.suspect.slice(0, SHOWN).forEach(x =>
    console.log("        " + x.r + '  kjv "' + x.kjv + '" -> nkjv "' + x.nkjv + '"  (' + x.why + ")"));

  console.log("\n--- why candidates were refused (every item) ---");
  [...a.why.entries()].sort((x, y) => y[1] - x[1]).forEach(([why, n]) =>
    console.log("  " + String(n).padStart(5) + "  " + why));
}

function showItem(verses, index, ref) {
  const v = verses.find(x => x.r === ref);
  if (!v) { console.log("no bank item for " + ref); return; }
  const got = align(v, index);
  console.log("\n=== " + ref + " ===");
  console.log("kjv  " + JSON.stringify(v));
  if (got.miss) { console.log("miss " + got.miss); return; }
  console.log("nkjv " + JSON.stringify(got.nkjv));
  const picked = D.makeDistractors({ kjv: v, nkjv: got.nkjv, sourceText: got.sourceText, item: got.item });
  console.log("pool (" + D.candidatePool(v, got.nkjv).length + "):");
  D.candidatePool(v, got.nkjv).forEach(c => {
    console.log("   " + (picked.includes(c.text) ? "*" : " ") + " [" + c.src + "] " + c.text);
  });
  console.log("picked " + JSON.stringify(picked));
}

function main() {
  const argv = process.argv.slice(2);
  const res = run();
  report(res);

  fs.writeFileSync(OUT, JSON.stringify({
    counts: {
      bank: res.bank, aligned: res.acc.aligned, broken: res.acc.broken,
      full: res.acc.full, partial: res.acc.partial, empty: res.acc.empty, clean: res.acc.clean
    },
    misses: Object.fromEntries(res.acc.misses),
    codes: Object.fromEntries(res.acc.codes),
    sources: Object.fromEntries(res.acc.sources),
    suspect: res.acc.suspect,
    short: res.acc.short,
    failing: res.acc.failing
  }, null, 2) + "\n", "utf8");
  console.log("\nwrote " + path.relative(ROOT, OUT));

  const at = argv.indexOf("--show");
  if (at >= 0 && argv[at + 1]) showItem(res.verses, res.index, argv[at + 1]);
}

if (require.main === module) main();

module.exports = { align, run, report };
