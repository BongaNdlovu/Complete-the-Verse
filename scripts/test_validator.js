const fs = require('fs');
const path = require('path');
const QA = require('./verse-qa');
const A = require('./nkjv-align');
const D = require('./nkjv-distractors');
const { loadSourceDump } = require('./nkjv-parse');
const { buildIndex, sourceFor } = require('./nkjv-source');
const { loadBank } = require('./load-bank');

const bank = loadBank('kjv');
const usedRefs = new Set(bank.VERSES.map(v => QA.norm(v.r)));
const dump = loadSourceDump();
const nkjvIndex = buildIndex(dump.verses);

const SENT_TAIL = /([.!?…,;:]+["'”’]?)$/;

function validateVerse(v) {
  const normR = QA.norm(v.r);
  if (usedRefs.has(normR)) {
    return { ok: false, error: 'Reference already in base bank: ' + v.r };
  }

  // KJV QA
  const kjvErrs = QA.auditVerse(v).filter(f => f.severity === 'error');
  if (kjvErrs.length > 0) {
    return { ok: false, error: 'KJV QA error: ' + kjvErrs.map(e => e.code + ' (' + e.detail + ')').join('; ') };
  }

  // NKJV Align
  const nkjvSource = sourceFor(v.r, nkjvIndex);
  if (!nkjvSource) {
    return { ok: false, error: 'Missing NKJV source for: ' + v.r };
  }

  const aligned = A.alignBlank(v, nkjvSource);
  if (aligned.miss) {
    return { ok: false, error: 'NKJV align miss: ' + aligned.miss };
  }

  let a = aligned.a;
  let s = aligned.s || '';
  const m = a.match(SENT_TAIL);
  if (m) {
    const tail = m[1];
    a = a.slice(0, a.length - tail.length).trim();
    s = tail + (s ? ' ' + s : '');
  }

  const nkjvItem = {
    b: v.b,
    r: v.r,
    t: v.t,
    p: aligned.p,
    a: a,
    s: s,
    d: []
  };

  const distractors = D.makeDistractors({
    kjv: v,
    nkjv: { p: aligned.p, a, s },
    item: nkjvItem,
    sourceText: nkjvSource,
    curated: []
  });

  nkjvItem.d = distractors;
  const nkjvErrs = QA.auditVerse(nkjvItem).filter(f => f.severity === 'error');
  if (nkjvErrs.length > 0) {
    return { ok: false, error: 'NKJV QA error: ' + nkjvErrs.map(e => e.code + ' (' + e.detail + ')').join('; '), nkjvItem };
  }

  return { ok: true, kjv: v, nkjv: nkjvItem };
}

if (process.argv[2]) {
  const inputFile = process.argv[2];
  const items = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  let passed = 0;
  let failed = 0;
  const errors = [];
  items.forEach((item, idx) => {
    const res = validateVerse(item);
    if (res.ok) {
      passed++;
    } else {
      failed++;
      errors.push({ idx, ref: item.r, error: res.error });
    }
  });
  console.log(JSON.stringify({ total: items.length, passed, failed, errors: errors.slice(0, 20) }, null, 2));
}

module.exports = { validateVerse };
