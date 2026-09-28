/* ==================================================================
   NKJV DISTRACTORS — three wrong answers for an aligned NKJV item.

   The KJV bank's distractors were written by hand against KJV wording.
   Reusing them verbatim for the NKJV edition goes wrong in two ways: the
   wording they were written against has changed ("living soul" is now
   "living being", so "living spirit" is no longer a near miss), and a
   good many of them are phrased in the KJV's register ("forsake thee, nor
   fail thee"), which tells the player they are wrong without any recall
   at all.

   So the generator builds a pool from several places and takes the first
   three that survive the gate:

     1. the curated NKJV sets in scripts/nkjv-alignments.js,
     2. the KJV answer itself — the other edition's reading of the same
        thought is the most instructive wrong answer there is,
     3. the KJV bank's own distractors, modernised where they are archaic,
     4. one-word and whole-phrase swaps of the NKJV answer, from the
        curated tables in scripts/nkjv-semantics.js.

   Every candidate is judged by running scripts/verse-qa.js on a trial
   item, so the generator cannot disagree with the gate: the codes a
   distractor can raise are exactly the codes checked here. Candidates are
   additionally held to three editorial rules the gate has no opinion on —
   modern register, a comparable shape, and a difference of meaning rather
   than of grammar.

   Pure functions, no I/O. scripts/probe-distractors.js does the measuring.
   ================================================================== */

const QA = require("./verse-qa");
const S = require("./nkjv-semantics");
const { EXPLICIT } = require("./nkjv-alignments");

/* Every gate code a distractor can raise. A candidate is acceptable when
   a trial item carrying it raises none of these: the remaining codes
   (mid-clause, answer-too-long, thin-context, ...) read only p/a/s, so a
   wrong answer can neither cause nor cure them. */
const OPTION_CODES = new Set([
  "recycled", "register-swap", "function-swap", "containment",
  "non-distinct", "duplicate-option"
]);

/* Everything the moderniser would rewrite is, by definition, not the
   register the NKJV edition is written in. */
const ARCHAIC = new Set(S.MODERNISE.keys());

const EDGE = /^[^A-Za-z0-9'"]+|[^A-Za-z0-9'"]+$/g;
const words = t => String(t == null ? "" : t).split(" ").filter(Boolean);

/* The lookup key for a token: lowercased, with every mark of punctuation
   stripped from both ends. The bank attaches the verse's punctuation to
   the last word of an answer ("heart.\"", "weakness.\""), and a table
   entry is never written with any. */
const keyOf = t => String(t).toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");

/* ---------- register ---------- */

/* Determiners and prepositions, used by the moderniser's guard on "art"
   and by the context rule below. */
const DETERMINER = new Set(["the", "a", "an", "this", "that", "these", "those",
  "my", "your", "his", "her", "its", "our", "their", "no", "some", "any",
  "such", "every"]);

/* Words that bind forward onto a noun rather than starting a phrase. */
const PREPOSITION = new Set(["of", "in", "on", "to", "unto", "into", "upon",
  "with", "without", "for", "from", "by", "at", "as", "before", "after",
  "among", "against", "between", "through", "toward", "towards", "over",
  "under", "about", "and", "or", "but", "nor"]);

/* Keep the model's capitalisation, so "Thou art" becomes "You are" and
   not "you are" in the middle of a quoted sentence. */
function matchCase(model, text) {
  const m = String(model), t = String(text);
  if (!t || !m) return t;
  if (m === m.toUpperCase() && m !== m.toLowerCase()) return t.toUpperCase();
  const c = m[0];
  if (c === c.toUpperCase() && c !== c.toLowerCase()) return t[0].toUpperCase() + t.slice(1);
  return t;
}

/* Swap one token for another, leaving any punctuation stuck to it. */
function replaceWord(token, swap) {
  const m = String(token).match(/^([^A-Za-z0-9'"]*)(.*?)([^A-Za-z0-9'"]*)$/);
  if (!m || !m[2]) return matchCase(token, swap);
  return m[1] + matchCase(m[2], swap) + m[3];
}

/* Rewrite a KJV phrasing into NKJV register, word for word.

   Two things need more than a lookup. "art" is a perfectly good modern
   noun, so it is only the verb that gets rewritten — the one standing
   after a second-person pronoun this pass already modernised, and never
   the one behind a determiner ("the art of the craftsman"). And
   "believeth not" modernises to "believes not", which is English but
   reads like the KJV it came from — NKJV says "does not believe" — so a
   verb with a base form in VERB_BASE absorbs the "not". */
function modernise(text) {
  const toks = words(text);
  const out = [];
  let sawYou = false;
  for (let i = 0; i < toks.length; i++) {
    const key = keyOf(toks[i]);
    const nounArt = key === "art" && (!sawYou || DETERMINER.has(keyOf(toks[i - 1] || "")));
    const swap = nounArt ? null : S.MODERNISE.get(key);
    if (!swap) { out.push(toks[i]); continue; }
    if (swap === "you") sawYou = true;
    const base = S.VERB_BASE.get(swap);
    const negated = base && keyOf(toks[i + 1] || "") === "not";
    out.push(replaceWord(toks[i], negated ? "does not " + base : swap));
    if (negated) i++;
  }
  return joinSpellings(out.join(" "));
}

/* The KJV prints "for ever" where the NKJV prints "forever"; left alone,
   the split is a spelling tell rather than a wording one. */
const SPELLED = new Map([["for ever", "forever"], ["for evermore", "forevermore"]]);
function joinSpellings(text) {
  let s = " " + text + " ";
  SPELLED.forEach((to, from) => { s = s.split(" " + from + " ").join(" " + to + " "); });
  return s.trim();
}

function hasArchaic(text) {
  const raw = String(text);
  if (words(raw).some(t => {
    const k = keyOf(t);
    // -eth verbs the moderniser table never grew a row for ("girdeth",
    // "hateth") are still the KJV's register.
    return ARCHAIC.has(k) || (k.length > 4 && /eth$/.test(k));
  })) return true;
  return joinSpellings(raw) !== raw.replace(/\s+/g, " ").trim();
}

/* ---------- editorial shape rules ---------- */

/* A distractor has to be wrong about the verse, not about grammar. Whole
   words carry meaning; connectives and articles do not. verse-qa.js draws
   the same line for its function-swap rule but only applies it to answers
   of four words or more, on the grounds that in a short blank the function
   word is the thing being tested — this is that line applied to every
   answer, which is why "the Lord is my shepherd" cannot be answered with
   "a Lord is my shepherd". */
function differsInMeaning(answer, cand) {
  const keep = t => QA.tokens(t).filter(w => !S.TRIVIAL.has(w)).join(" ");
  return !!QA.tokens(cand).length && keep(answer) !== keep(cand);
}

/* A one-word blank needs one-word wrong answers. Longer phrases may vary
   by a word either side of the answer — the moderniser adds one for
   "thereof" -> "of it", the KJV says "which is in heaven" where the NKJV
   says "in heaven" — and by two once the phrase is long enough that a
   word either way is not a length tell on its own. */
function shapeFits(answer, cand) {
  const a = QA.tokens(answer).length, c = QA.tokens(cand).length;
  if (!c) return false;
  if (a <= 1) return c === 1;
  return Math.abs(a - c) <= (a >= 5 ? 2 : 1);
}

/* A wrong answer that parts from the answer only by an inflectional ending
   ("stir" for "stirs", "righteousness" for "righteous") is a question
   about agreement, not about Scripture: "a harsh word stir up anger" can
   be discarded on English alone. Both words are reduced with the same
   endings, longest first, so "lord" and "lords" meet in the middle. */
const ENDINGS = ["ness", "ing", "est", "eth", "es", "ed", "s", "d"];
function stemOf(word) {
  let w = word;
  ENDINGS.forEach(e => { if (w.length - e.length >= 3 && w.endsWith(e)) w = w.slice(0, -e.length); });
  return w;
}
function inflectionOnly(answer, cand) {
  const at = QA.tokens(answer), ct = QA.tokens(cand);
  if (at.length !== ct.length) return false;
  let at1 = -1;
  for (let i = 0; i < at.length; i++) {
    if (at[i] === ct[i]) continue;
    if (at1 >= 0) return false;
    at1 = i;
  }
  if (at1 < 0) return false;
  const a = at[at1], c = ct[at1];
  if (a === stemOf(a) && c === stemOf(c)) return false;
  return stemOf(a) === stemOf(c);
}

/* Words that carry no meaning of their own: they hold a sentence together
   rather than saying anything in it. The gate's function-word list is the
   base of it, plus two interrogatives it leaves out and minus the handful
   of words on it that are just as often ordinary nouns ("our being",
   "the will of God"), because a blank made of one of those is not
   necessarily asking for a function word. */
const FUNCTION_TOO = new Set(["being", "one", "much", "still"]);
const CLOSED = new Set([...QA.FUNCTION_WORDS, "not", "why", "whether"]
  .filter(w => !FUNCTION_TOO.has(w)));

/* A distractor has to slot into the same place in the sentence as the
   answer. Two ways it can fail to.

   First, when the answer is nothing but function words the blank is
   asking for a word of that kind, and a content word cannot stand in it:
   "Lowly and riding ___ a donkey" answered by "colt" reads "riding colt a
   donkey". Inside a longer answer the question does not arise — "all
   things are possible" opens on a function word but is not one. */
function fitsClass(answer, cand) {
  const at = QA.tokens(answer);
  if (!at.length || !at.every(w => CLOSED.has(w))) return true;
  const first = QA.tokens(cand)[0];
  return !!first && CLOSED.has(first);
}

/* Second, when the verse runs into the blank on a determiner the blank
   must open on the noun that determiner is waiting for, so a wrong answer
   opening on a preposition cannot follow it — "we see in a mirror, dimly"
   against "we see in a without a veil" gives itself away before the player
   has read the verse. */
function fitsContext(item, cand) {
  if (!DETERMINER.has(QA.tokens(item.p).pop())) return true;
  const first = QA.tokens(cand)[0];
  return !PREPOSITION.has(first) || PREPOSITION.has(QA.tokens(item.a)[0]);
}

/* Two or more consecutive words lifted out of the verse are eliminable by
   grammar alone. The gate checks the item's own p/a/s; when the raw dump
   text is supplied as well we check that too, so a blank trimmed at the
   edges cannot hide a fragment. */
function lifted(text, sourceText) {
  const n = QA.norm(text);
  if (n.split(" ").length < 2) return false;
  return (" " + QA.norm(sourceText) + " ").indexOf(" " + n + " ") >= 0;
}

/* ---------- candidate pool ---------- */

/* One-word swaps of the aligned answer, one word at a time. */
function wordSwaps(answer) {
  const toks = words(answer);
  const out = [];
  toks.forEach((tok, i) => {
    (S.SUBSTITUTE.get(keyOf(tok)) || []).forEach(alt => {
      const copy = toks.slice();
      copy[i] = replaceWord(tok, alt);
      out.push(copy.join(" "));
    });
  });
  return out;
}

/* Whole-phrase swaps, for what a single word cannot reach. */
function phraseSwaps(answer) {
  const toks = words(answer);
  const key = toks.map(keyOf);
  if (key.some(w => !w)) return [];
  const out = [];
  S.PHRASES.forEach((alts, phrase) => {
    const at = (" " + key.join(" ") + " ").indexOf(" " + phrase + " ");
    if (at < 0) return;
    const len = phrase.split(" ").length;
    alts.forEach(alt => {
      const head = words(alt).map((w, k) => (k ? w : matchCase(toks[at], w)));
      out.push(toks.slice(0, at).concat(head, toks.slice(at + len)).join(" "));
    });
  });
  return out;
}

/* Curated NKJV distractors, for the verses that have them. */
function curated(kjv, extra) {
  const hand = EXPLICIT[kjv.r];
  return (extra || []).concat(hand && hand.d ? hand.d : []).concat(S.SPECIAL.get(kjv.r) || []);
}

/* Candidates in the order they should be tried. Raw KJV wording comes
   first where it is already modern register; the modernised version of the
   same text follows, so a KJV phrasing only loses to a substitution when
   the archaism is the only thing wrong with it. */
function candidatePool(kjv, nkjv, extraCurated) {
  const pool = [];
  const add = (text, src) => { if (text) pool.push({ text: text, src: src }); };
  curated(kjv, extraCurated).forEach(t => add(t, "curated"));
  const kjvTexts = [kjv.a].concat(kjv.d || []).filter(Boolean);
  kjvTexts.forEach(t => add(t, "kjv"));
  kjvTexts.forEach(t => add(modernise(t), "modernised"));
  wordSwaps(nkjv.a).forEach(t => add(t, "swap"));
  phraseSwaps(nkjv.a).forEach(t => add(t, "phrase"));
  return pool;
}

/* ---------- selection ---------- */

/* Why a candidate was turned down, or null when it is usable. The failure
   modes are ordered cheapest-first, and the gate's own verdict is asked
   last, with the already-chosen distractors in place so a repeat of one of
   them is seen as a repeat. Returning the reason rather than a boolean is
   what lets scripts/probe-distractors.js report *why* an item came up
   short instead of only that it did. */

/* Every option in a question has to end the same way. A blank whose answer
   carries the verse's full stop, answered by three options that do not,
   is eliminable on sight — the odd one out is the right one. The answer's
   own tail is therefore stamped onto each wrong answer. When the answer
   carries none, only a stray sentence mark is dropped: a distractor that
   is a whole quoted speech keeps its closing quote. */
const TAIL = /[.,;:!?"'\u201c\u201d\u2018\u2019]+$/;
function matchTail(answer, text) {
  const tail = (String(answer).match(TAIL) || [""])[0];
  const bare = tail ? String(text).replace(TAIL, "") : String(text).replace(/[.,;:]+$/, "");
  return bare ? bare + tail : text;
}

function reject(item, sourceText, chosen, text, relaxed) {
  if (!text) return "empty";
  if (hasArchaic(text)) return "archaic";
  /* A stutter ("the the earth") is nonsense no gate code catches. */
  const toks = QA.norm(text).split(" ");
  if (toks.some((w, i) => i && w === toks[i - 1])) return "repeated-word";
  if (!shapeFits(item.a, text)) return "shape";
  /* A difference of grammar alone is a giveaway, so it is refused while
     anything better exists. Some blanks have nothing else to trade,
     though — "was God" has no content word a substitution can reach — and
     for those verse-qa.js is explicit that in a short phrase the function
     word IS the question. That is the final pass. */
  if (!relaxed && !differsInMeaning(item.a, text)) return "grammar-only";
  if (inflectionOnly(item.a, text)) return "inflection";
  if (!fitsClass(item.a, text)) return "word-class";
  if (!fitsContext(item, text)) return "context";
  if (lifted(text, sourceText)) return "recycled-source";
  const trial = Object.assign({}, item, { d: chosen.concat([text]) });
  const hit = QA.auditVerse(trial).find(f => OPTION_CODES.has(f.code));
  return hit ? hit.code : null;
}

/* Take the first three candidates that survive, in pool order: the strict
   rules first, then the same pool with the grammar rule lifted to fill
   whatever is left. `trace` is an optional array the probe fills with one
   line per candidate tried. */
function tryPass(item, sourceText, pool, out, trace, relaxed) {
  const seen = new Set(out.map(QA.norm));
  pool.forEach(cand => {
    const text = matchTail(item.a, String(cand.text).replace(/\s+/g, " ").trim());
    const key = QA.norm(text);
    if (!key || seen.has(key)) return;
    seen.add(key);
    if (out.length >= 3) return;
    const why = reject(item, sourceText, out, text, relaxed);
    if (trace) trace.push({ text: text, src: cand.src, why: why, relaxed: relaxed });
    if (why) return;
    out.push(text);
  });
}

function pick(item, sourceText, pool, trace) {
  const out = [];
  tryPass(item, sourceText, pool, out, trace, false);
  if (out.length < 3) tryPass(item, sourceText, pool, out, trace, true);
  return out;
}

/* ---------- public ---------- */

/* The item as the gate will see it. Callers hand in the piece the aligner
   produced; `item` is accepted for the book/tier/reference the bank
   carries, and rebuilt from the KJV item when it is not supplied. */
function buildItem(opts) {
  if (opts.item) return opts.item;
  const kjv = opts.kjv || {}, nkjv = opts.nkjv || {};
  return { b: kjv.b, r: kjv.r, t: kjv.t, p: nkjv.p, a: nkjv.a, s: nkjv.s, d: [] };
}

/* A blank the aligner cut badly — one that dangles mid-clause, runs past a
   phrase a person could hold, or is the whole verse — cannot be repaired
   with wrong answers, and the generator is not allowed to reword the
   answer. Those go back empty and scripts/build-nkjv.js routes them to the
   manual file.

   Only the blank's own codes count. The rest of what the gate raises
   (missing-book, missing-reference, bad-tier, thin-context) is about the
   item's envelope, which the caller owns: a tutorial question carries no
   reference and its blank is still perfectly answerable. */
const BLANK_CODES = new Set(["mid-clause", "answer-too-long", "no-context", "empty-answer"]);
function blankBroken(item) {
  return QA.auditVerse(Object.assign({}, item, { d: [] })).some(f => BLANK_CODES.has(f.code));
}

/* makeDistractors({kjv, nkjv, sourceText, item}) -> string[]
   Three wrong answers for the aligned NKJV item, or fewer when the pool
   genuinely has nothing that survives the gate. `trace` is for the probe. */
function makeDistractors(opts, trace) {
  const o = opts || {};
  const item = buildItem(o);
  if (!item.a) return [];
  if (blankBroken(item)) return [];
  const sourceText = o.sourceText || [item.p, item.a, item.s].join(" ");
  return pick(item, sourceText, candidatePool(o.kjv || {}, o.nkjv || item, o.curated), trace);
}

module.exports = {
  makeDistractors, reject, modernise, hasArchaic, blankBroken, keyOf,
  candidatePool, wordSwaps, phraseSwaps, differsInMeaning, matchTail,
  shapeFits, matchCase, replaceWord, lifted, OPTION_CODES
};
