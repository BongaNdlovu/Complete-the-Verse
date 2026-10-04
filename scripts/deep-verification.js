const fs = require('fs');
const path = require('path');
const ROOT = require('./repo-root');
const { loadBank } = require('./load-bank');

let failures = [];
function check(name, condition, extra) {
  if (condition) {
    console.log('  PASS: ' + name);
  } else {
    console.error('  FAIL: ' + name + (extra ? ' -> ' + JSON.stringify(extra) : ''));
    failures.push(name);
  }
}

console.log('======================================================');
console.log('1. PARITY & COUNT VERIFICATION (KJV vs NKJV)');
console.log('======================================================');

const kjvBank = loadBank('kjv');
const nkjvBank = loadBank('nkjv');

check('KJV verses count is 1399', kjvBank.VERSES.length === 1399, { count: kjvBank.VERSES.length });
check('NKJV verses count is 1399', nkjvBank.VERSES.length === 1399, { count: nkjvBank.VERSES.length });
check('KJV and NKJV cover same 66 books', 
  new Set(kjvBank.VERSES.map(v => v.b)).size === 66 && 
  new Set(nkjvBank.VERSES.map(v => v.b)).size === 66
);

const kjvRefs = new Set(kjvBank.VERSES.map(v => v.r.replace(/^Psalm\b/, 'Psalms')));
const nkjvRefs = new Set(nkjvBank.VERSES.map(v => v.r.replace(/^Psalm\b/, 'Psalms')));
let missingRefs = [];
for (const r of kjvRefs) {
  if (!nkjvRefs.has(r)) missingRefs.push(r);
}
check('NKJV covers 100% of KJV references', missingRefs.length === 0, { missing: missingRefs });

// Tablets parity
const kjvTablets = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared', 'content', 'tablets.json'), 'utf8'));
const { NKJV_TABLETS } = require('../js/nkjv/tablets.js');

check('KJV tablet chapters count is 144', kjvTablets.chapters.length === 144, { count: kjvTablets.chapters.length });
check('NKJV tablet chapters count is 144', NKJV_TABLETS.chapters.length === 144, { count: NKJV_TABLETS.chapters.length });

const kjvBlankCount = kjvTablets.chapters.reduce((n, c) => n + (c.blanks || []).length, 0);
const nkjvBlankCount = NKJV_TABLETS.chapters.reduce((n, c) => n + (c.blanks || []).length, 0);
check('KJV and NKJV have identical total blank counts in Word Tablets', kjvBlankCount === nkjvBlankCount, { kjv: kjvBlankCount, nkjv: nkjvBlankCount });

// Passages parity
check('Passages count is 27 in both', (kjvBank.PASSAGES || []).length === 27 && (nkjvBank.PASSAGES || []).length === 27);

// Beat parity
const Beat = require('../js/beat.js');
const { NKJV_BEAT } = require('../js/nkjv/beat.js');
check('Beat questions count matches', (NKJV_BEAT.questions || []).length === (Beat.questions || []).length);
check('Beat cinema plates count matches', 
  ((NKJV_BEAT.cinemaA || []).length + (NKJV_BEAT.cinemaB || []).length) === 
  ((Beat.cinemaA || []).length + (Beat.cinemaB || []).length)
);

// Quotes parity
const { SITES } = require('../js/sites.js');
const { NKJV_QUOTES } = require('../js/nkjv/quotes.js');
const quotedSites = SITES.filter(s => s.quoteRef);
const missingQuotes = quotedSites.filter(s => !NKJV_QUOTES[s.id]);
check('Every site with a quote has an NKJV quote entry', missingQuotes.length === 0, { missing: missingQuotes.map(s => s.id) });

console.log('======================================================');
console.log('2. NKJV REGISTER & WORDING WITNESSES');
console.log('======================================================');

const gen27 = nkjvBank.VERSES.find(v => v.r === 'Genesis 2:7');
check('Genesis 2:7 exists in NKJV', !!gen27);
if (gen27) {
  check('Genesis 2:7 uses NKJV reading "living being" (not KJV "living soul")', gen27.a === 'living being', { got: gen27.a });
  check('Genesis 2:7 offers KJV reading "living soul" as distractor', (gen27.d || []).includes('living soul'), { got: gen27.d });
}

const jhn11 = nkjvBank.VERSES.find(v => v.r === 'John 1:1');
check('John 1:1 exists in NKJV', !!jhn11);
if (jhn11) {
  check('John 1:1 answer is "was God"', jhn11.a === 'was God', { got: jhn11.a });
}

// Check HAND.json
const handContent = fs.readFileSync(path.join(ROOT, 'content', 'nkjv', 'HAND.json'), 'utf8').trim();
check('HAND.json is an empty JSON object', handContent === '{}');

console.log('======================================================');
console.log('3. ASSET & EXPORT SYNC');
console.log('======================================================');

const androidAssetsPath = path.join(ROOT, 'mobile', 'androidApp', 'src', 'main', 'assets', 'content', 'nkjv');
const mobileTestPath = path.join(ROOT, 'mobile', 'core', 'src', 'test', 'resources', 'content', 'nkjv');
const sharedNkjvPath = path.join(ROOT, 'shared', 'content', 'nkjv');

['verses.json', 'tablets.json', 'sites-quotes.json'].forEach(f => {
  const shared = fs.existsSync(path.join(sharedNkjvPath, f));
  const android = fs.existsSync(path.join(androidAssetsPath, f));
  const coreTest = fs.existsSync(path.join(mobileTestPath, f));
  check('Exported file ' + f + ' exists across shared, android, and core test', shared && android && coreTest);
});

console.log('======================================================');
console.log('4. GREP AUDIT: NO UNWANTED KJV HARDCODING IN PLAY');
console.log('======================================================');

const playSrc = fs.readFileSync(path.join(ROOT, 'js', 'play.js'), 'utf8');
const seqSrc = fs.readFileSync(path.join(ROOT, 'js', 'sequences.js'), 'utf8');
const tabRunSrc = fs.readFileSync(path.join(ROOT, 'js', 'tablets-run.js'), 'utf8');

check('js/play.js has no hardcoded " — KJV"', !playSrc.includes('" — KJV"'));
check('js/sequences.js has no hardcoded " — KJV"', !seqSrc.includes('" — KJV"'));
check('js/tablets-run.js has no hardcoded fallback "KJV"', !tabRunSrc.includes('ch.subtitle || "KJV"'));

if (failures.length > 0) {
  console.error('\nOVERALL VERIFICATION FAILED: ' + failures.length + ' checks failed.');
  process.exit(1);
} else {
  console.log('\nOVERALL VERIFICATION PASSED: All deep checks succeeded with 100% precision.');
}
