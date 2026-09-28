/* ==================================================================
   NKJV SOURCE — resolve a game reference against the licensed dump.

   The dump is keyed the way the licence file is laid out, which is not
   quite the way the game talks:

     - Psalms are filed under "Psalms"; the KJV bank says "Psalm".
     - A few entries are whole chapters ("1 Kings 6", "Psalms 119") or
       chapter runs ("Exodus 7-12") because that is how they were
       supplied. Looking one of those up for a single verse hands back the
       whole chapter, so a verse-level key must always win over a
       chapter-level one.
     - The two editions do not always agree on where a verse ends. The KJV
       of 1 Thessalonians 5:19 carries "Quench not the Spirit. Despise not
       prophesyings." — text the NKJV splits across verses 19-21. Those
       places are listed in SPANS below rather than guessed at, because
       gluing neighbouring verses together "just in case" is how a blank
       ends up spanning half a chapter.

   Only the resolver lives here; nkjv-parse.js owns the file reading and
   scripts/build-nkjv.js does the aligning.
   ================================================================== */

const BOOK_ALIASES = new Map(Object.entries({
  psalm: "psalms", ps: "psalms", psa: "psalms",
  canticles: "songofsolomon", songofsongs: "songofsolomon", song: "songofsolomon",
  revelations: "revelation", rev: "revelation"
}));

/* "1 Thessalonians 5:19" -> "1thessalonians 5:19" so both editions' book
   spellings collapse onto one key. */
function canonRef(ref) {
  const text = String(ref || "").trim().replace(/\s+/g, " ");
  const m = text.match(/^([1-3]?\s*[A-Za-z][A-Za-z ]*?)\s+(\d+.*)$/);
  if (!m) return text.toLowerCase();
  const raw = m[1].replace(/\s+/g, "").toLowerCase();
  return (BOOK_ALIASES.get(raw) || raw) + " " + m[2].trim();
}

function verseParts(ref) {
  const m = String(ref || "").match(/^(.+?)\s+(\d+):(\d+)/);
  return m ? { book: m[1], chapter: +m[2], verse: +m[3] } : null;
}

/* Verses where the editions disagree about the boundary, so the KJV blank
   has to be looked for across a run of NKJV verses. Keyed by the bank's
   reference. */
const SPANS = {
  "1 Thessalonians 5:19": ["1 Thessalonians 5:19", "1 Thessalonians 5:20", "1 Thessalonians 5:21"]
};

/* Verse-level keys only: a chapter entry must never answer for a verse. */
function buildIndex(dump) {
  const byCanon = new Map();
  Object.keys(dump || {}).forEach(key => {
    if (!/\d+:\d+/.test(key)) return;
    const c = canonRef(key);
    if (!byCanon.has(c)) byCanon.set(c, dump[key]);
  });
  return byCanon;
}

/* A verse range ("Psalm 23:1-2", "Genesis 1:1-2") is how the passages name
   their context. Both editions bracket the same verses here, so the range
   is just the run joined together — unlike the split-verse cases above,
   nothing is being redistributed. */
const RANGE = /^(.*\s\d+):(\d+)\s*[-\u2013]\s*(\d+)$/;

function rangeParts(ref) {
  const m = String(ref || "").trim().match(RANGE);
  if (!m) return null;
  const from = +m[2], to = +m[3];
  if (!(to > from) || to - from > 40) return null;
  const out = [];
  for (let v = from; v <= to; v++) out.push(m[1] + ":" + v);
  return out;
}

/* The NKJV text for a bank reference: a single verse, a joined range, or
   the documented run where the editions split differently. Returns null
   when the dump has nothing for it, and null (rather than a partial run)
   when any verse of a range is missing, so a passage never silently loses
   a line. */
function sourceFor(ref, index) {
  const run = SPANS[ref];
  if (run) {
    const parts = run.map(r => index.get(canonRef(r))).filter(Boolean);
    return parts.length ? parts.join(" ") : null;
  }
  const range = rangeParts(ref);
  if (range) {
    const parts = range.map(r => index.get(canonRef(r)));
    return parts.every(Boolean) ? parts.join(" ") : null;
  }
  return index.get(canonRef(ref)) || null;
}

module.exports = { canonRef, verseParts, buildIndex, sourceFor, rangeParts, SPANS };
