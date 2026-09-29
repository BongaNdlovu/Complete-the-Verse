const fs = require('fs');
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

const kjvRaw = JSON.parse(fs.readFileSync('scripts/data/kjv.json', 'utf8'));
const kjvMap = new Map();
bank.BOOKS_ORDER.forEach((bookName, bIdx) => {
  const bookData = kjvRaw[bIdx];
  bookData.chapters.forEach((chapterVerses, cIdx) => {
    const chNum = cIdx + 1;
    chapterVerses.forEach((verseText, vIdx) => {
      const vNum = vIdx + 1;
      const ref = bookName + ' ' + chNum + ':' + vNum;
      kjvMap.set(ref, verseText.trim());
      if (bookName === 'Psalms') {
        kjvMap.set('Psalm ' + chNum + ':' + vNum, verseText.trim());
      }
    });
  });
});

const SENT_TAIL = /([.!?…,;:]+["'”’]?)$/;

function normalizeText(t) {
  if (!t) return "";
  let s = t.replace(/[\u2018\u2019\ufffd]/g, "'");
  s = s.replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-');
  s = s.replace(/\s+([.,;:!?])/g, '$1');
  s = s.replace(/\s+/g, ' ');
  return s.strip ? s.trim() : s;
}

function validate(v) {
  const normR = QA.norm(v.r);
  if (usedRefs.has(normR)) return null;

  const kjvErrs = QA.auditVerse(v).filter(f => f.severity === 'error');
  if (kjvErrs.length > 0) return null;

  const nkjvSource = sourceFor(v.r, nkjvIndex);
  if (!nkjvSource) return null;

  const aligned = A.alignBlank(v, nkjvSource);
  if (aligned.miss) return null;

  let a = aligned.a;
  let s = aligned.s || '';
  const m = a.match(SENT_TAIL);
  if (m) {
    const tail = m[1];
    a = a.slice(0, a.length - tail.length).trim();
    s = tail + (s ? ' ' + s : '');
  }

  const nkjvItem = {
    b: v.b, r: v.r, t: v.t,
    p: aligned.p, a: a, s: s,
    d: []
  };

  const distractors = D.makeDistractors({
    kjv: v,
    nkjv: { p: aligned.p, a, s },
    item: nkjvItem,
    sourceText: nkjvSource,
    curated: []
  });

  if (!distractors || distractors.length !== 3) return null;
  nkjvItem.d = distractors;

  const nkjvErrs = QA.auditVerse(nkjvItem).filter(f => f.severity === 'error');
  if (nkjvErrs.length > 0) return null;

  return v;
}

module.exports = { validate, kjvMap, usedRefs, normalizeText };
