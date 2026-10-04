/* ==================================================================
   NKJV ALIGN — map a KJV blank onto the NKJV wording.

   The KJV bank stores each item as {p,a,s}: the verse echo before the
   blank, the blank, and the echo after it. NKJV is a different
   translation, so the same thought is often carried by different words
   ("living soul" -> "living being", "valour" -> "valor", "might" ->
   "strength"). Copying the KJV blank across would be a lie; slicing the
   NKJV verse at the same word offsets would be a different lie.

   The approach here is a word diff. Both verses are tokenised and their
   longest common subsequence of shared words becomes a set of anchors.
   The KJV blank's position in the KJV echo tells us which anchors sit
   either side of it, and those two anchors bound the corresponding span
   in the NKJV. Words are compared through a canonical form so that
   inflectional noise ("heaven"/"heavens", "endureth"/"endures") does not
   break an otherwise exact anchor chain.

   Anchors are LCS matches, so a word the two editions disagree about
   ("soul" vs "being") simply is not an anchor — which is exactly what we
   want, because those disagreements are the interesting bits and they sit
   inside the blank.

   Pure functions, no I/O. scripts/build-nkjv.js does the file work.
   ================================================================== */

/* ---------- text ---------- */

const SMART = [
  [/[\u2018\u2019\u201B]/g, "'"],
  [/[\u201C\u201D\u201F]/g, '"'],
  [/[\u2026]/g, "..."],
  [/[\u2014\u2013]/g, "-"]
];

/* Keep the original characters (the game renders them) but normalise the
   exotic ones so slicing and comparison agree. */
function tidy(text) {
  let s = String(text == null ? "" : text);
  SMART.forEach(([re, to]) => { s = s.replace(re, to); });
  return s.replace(/\s+/g, " ").trim();
}

/* The comparison form: lowercased, punctuation-free, single-spaced. */
function norm(text) {
  return tidy(text).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}

/* Tokens keep their original spelling so a span can be re-joined verbatim. */
function tokens(text) {
  return tidy(text).split(" ").filter(Boolean);
}

const PUNCT_EDGE = /^[^A-Za-z0-9'"]+|[^A-Za-z0-9'"]+$/g;
const bareWord = t => String(t).toLowerCase().replace(PUNCT_EDGE, "");

/* ---------- equivalence ---------- */

/* Spelling that differs only by a Latin/anglicised ending. Both sides map
   to the same key, so the anchor chain survives the change. */
const SPELLING = new Map(Object.entries({
  valour: "valor", honour: "honor", labour: "labor", saviour: "savior",
  favour: "favor", colour: "color", neighbour: "neighbor", armour: "armor",
  behaviour: "behavior", endeavour: "endeavor", fervour: "fervor",
  odour: "odor", rumour: "rumor", splendour: "splendor", vapour: "vapor",
  vigour: "vigor", clamour: "clamor", Saviour: "Savior",
  shew: "show", shewed: "showed", shewbread: "showbread",
  intreat: "entreat", intreated: "entreated", ensample: "example",
  stablish: "establish", stablished: "established",
  morter: "mortar", sodden: "boiled", brasen: "bronze", murther: "murder"
}));

const IRREGULAR = new Map(Object.entries({
  made: "make", make: "make", maketh: "make", making: "make", makes: "make",
  said: "say", say: "say", saith: "say", sayest: "say", saying: "say", says: "say",
  went: "go", go: "go", goeth: "go", going: "go", goes: "go", gone: "go",
  came: "come", come: "come", cometh: "come", coming: "come", comes: "come",
  gave: "give", give: "give", giveth: "give", giving: "give", gives: "give", given: "give",
  took: "take", take: "take", taketh: "take", taking: "take", takes: "take", taken: "take",
  ate: "eat", eat: "eat", eaten: "eat", eateth: "eat", eating: "eat", eats: "eat",
  saw: "see", see: "see", seeth: "see", seeing: "see", seen: "see", sees: "see",
  heard: "hear", hear: "hear", heareth: "hear", hearing: "hear", hears: "hear",
  knew: "know", know: "know", knoweth: "know", knowing: "know", known: "know", knows: "know",
  spake: "speak", speak: "speak", speaketh: "speak", speaking: "speak", spoken: "speak", speaks: "speak",
  dwelt: "dwell", dwell: "dwell", dwelleth: "dwell", dwelling: "dwell", dwells: "dwell",
  began: "begin", begin: "begin", beginneth: "begin", beginning: "begin", begins: "begin",
  brought: "bring", bring: "bring", bringeth: "bring", bringing: "bring", brings: "bring",
  sought: "seek", seek: "seek", seeketh: "seek", seeking: "seek", seeks: "seek",
  found: "find", find: "find", findeth: "find", finding: "find", finds: "find",
  fled: "flee", flee: "flee", fleeth: "flee", fleeing: "flee", flees: "flee",
  stood: "stand", stand: "stand", standeth: "stand", standing: "stand", stands: "stand",
  rose: "rise", rise: "rise", riseth: "rise", rising: "rise", rises: "rise", risen: "rise",
  fell: "fall", fall: "fall", falleth: "fall", falling: "fall", falls: "fall", fallen: "fall",
  wrote: "write", write: "write", writeth: "write", writing: "write", written: "write", writes: "write",
  slew: "slay", slay: "slay", slayeth: "slay", slaying: "slay", slain: "slay", slays: "slay",
  sent: "send", send: "send", sendeth: "send", sending: "send", sends: "send",
  built: "build", build: "build", buildeth: "build", building: "build", builds: "build",
  kept: "keep", keep: "keep", keepeth: "keep", keeping: "keep", keeps: "keep",
  left: "leave", leave: "leave", leaveth: "leave", leaving: "leave", leaves: "leave",
  led: "lead", lead: "lead", leadeth: "lead", leading: "lead", leads: "lead",
  taught: "teach", teach: "teach", teacheth: "teach", teaching: "teach", teaches: "teach",
  thought: "think", think: "think", thinketh: "think", thinking: "think", thinks: "think",
  wept: "weep", weep: "weep", weepeth: "weep", weeping: "weep", weeps: "weep",
  smote: "strike", smiteth: "strike", smite: "strike",
  did: "do", do: "do", doth: "do", doeth: "do", doing: "do", does: "do", done: "do",
  hath: "have", have: "have", hast: "have", having: "have", has: "have", had: "have",
  is: "be", be: "be", am: "be", are: "be", was: "be", were: "be", been: "be", being: "be",
  art: "be", wert: "be",
  shall: "will", shalt: "will", wilt: "will", would: "will", should: "will",
  can: "be able", could: "be able", may: "be able", might: "be able", must: "be able",
  thee: "you", thou: "you", thy: "you", thine: "you", ye: "you", you: "you",
  yourselves: "you", thyself: "you", yourself: "you"
}));

/* Verb/noun endings that carry no meaning for alignment purposes. */
function stripEnding(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && (w.endsWith("es"))) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  if (w.length > 5 && w.endsWith("ing")) {
    const stem = w.slice(0, -3);
    return stem.endsWith(stem.slice(-1).repeat(2)) ? stem.slice(0, -1) : stem;
  }
  if (w.length > 4 && w.endsWith("ed")) {
    const stem = w.slice(0, -2);
    return stem.endsWith(stem.slice(-1).repeat(2)) ? stem.slice(0, -1) : stem;
  }
  if (w.length > 4 && w.endsWith("eth")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("est")) return w.slice(0, -3);
  return w;
}

/* Words that must never be conflated even though the stemmer would. */
const NO_STEM = new Set(["is", "as", "us", "his", "was", "has", "this", "thus",
  "god", "good", "gods", "man", "men", "son", "sun", "sin", "see", "sea"]);

/* The key two words share when they are "the same word" for alignment. */
function canon(word) {
  let w = bareWord(word);
  if (!w) return "";
  if (SPELLING.has(w)) w = SPELLING.get(w);
  if (IRREGULAR.has(w)) return IRREGULAR.get(w);
  if (NO_STEM.has(w)) return w;
  const stemmed = stripEnding(w);
  return stemmed || w;
}

const sameWord = (a, b) => canon(a) === canon(b);

/* ---------- anchor chain ---------- */

/* Longest common subsequence of words that canonically agree. Returns
   [kjvIndex, nkjvIndex] pairs in order. Verses are short (a few dozen
   words), so the quadratic table is free. */
function anchorPairs(kjvToks, nkjvToks) {
  const n = kjvToks.length, m = nkjvToks.length;
  if (!n || !m) return [];
  const kc = kjvToks.map(canon);
  const nc = nkjvToks.map(canon);
  const dp = [];
  for (let i = 0; i <= n; i++) dp.push(new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = (kc[i] && kc[i] === nc[j])
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (kc[i] && kc[i] === nc[j]) { pairs.push([i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/* ---------- blank location ---------- */

/* Where do the answer's words sit inside the KJV echo? The echo is
   `${p} ${a} ${s}`, so an exact run of answer words normally lands right
   after p. Some entries echo a fragment of p inside s as well, so search
   from the front and prefer the occurrence that starts at p's length. */
function findAnswerRun(echoToks, answerToks, preferredStart) {
  if (!answerToks.length || answerToks.length > echoToks.length) return -1;
  const hit = start => {
    for (let k = 0; k < answerToks.length; k++) {
      if (!sameWord(echoToks[start + k], answerToks[k])) return false;
    }
    return true;
  };
  if (preferredStart >= 0 && preferredStart + answerToks.length <= echoToks.length && hit(preferredStart)) {
    return preferredStart;
  }
  for (let i = 0; i <= echoToks.length - answerToks.length; i++) if (hit(i)) return i;
  return -1;
}

/* Words at a span edge that the KJV echo did not have in the blank. When
   the NKJV inserts an article or a possessive, walking inwards until the
   word maps back to real KJV context keeps the blank the same size as the
   one the player is being asked to recall. */
function _trimSpan(nkjvToks, lo, hi, kjvContextCanon) {
  let a = lo, b = hi;                                  // inclusive
  while (a < b && kjvContextCanon.has(canon(nkjvToks[a]))) a++;
  while (b > a && kjvContextCanon.has(canon(nkjvToks[b]))) b--;
  return [a, b];
}

/* ---------- span picking ---------- */

/* How alike are two words? Canonical agreement is 1, a shared stem is high,
   and otherwise we fall back to shared letter pairs so that "latter"/"last"
   and "soul"/"being" (which share nothing) are told apart. */
function wordScore(kw, nw) {
  const a = canon(kw), b = canon(nw);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const grams = w => {
    const s = new Set();
    for (let i = 0; i < w.length - 1; i++) s.add(w.slice(i, i + 2));
    return s;
  };
  const ga = grams(a), gb = grams(b);
  if (!ga.size || !gb.size) return 0;
  let shared = 0;
  ga.forEach(g => { if (gb.has(g)) shared++; });
  const dice = (2 * shared) / (ga.size + gb.size);
  return (a[0] === b[0] ? 0.15 : 0) + dice * 0.55;
}

/* Best in-order alignment of the answer's words onto a window of the NKJV,
   plus how much of the answer it managed to account for. The DP lets a KJV
   word match a later NKJV word or be skipped, which a greedy scan cannot:
   "flee from you" needs "flee" to wait while "will" passes. */
function alignWords(kjvWords, win) {
  const k = kjvWords.length, n = win.length;
  const dp = [];
  for (let i = 0; i <= k; i++) dp.push(new Float64Array(n + 1));
  for (let i = 1; i <= k; i++) {
    for (let j = 1; j <= n; j++) {
      const s = wordScore(kjvWords[i - 1], win[j - 1]) + dp[i - 1][j - 1];
      dp[i][j] = Math.max(s, dp[i - 1][j], dp[i][j - 1]);
    }
  }
  let i = k, j = n, hits = 0;
  while (i > 0 && j > 0) {
    const s = wordScore(kjvWords[i - 1], win[j - 1]);
    if (Math.abs(dp[i][j] - (s + dp[i - 1][j - 1])) < 1e-9) {
      if (s >= 0.4) hits++;
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  return { score: dp[k][n], hits, max: Math.max(k, n) };
}

/* Does this window end where the KJV blank ended? The answer's last word is
   what the player is being asked to produce, so a window whose final word
   has nothing to do with it has stopped one word short. */
const TAIL_OK = 0.6;
function endsOnAnswer(kjvWords, win) {
  return wordScore(kjvWords[kjvWords.length - 1], win[win.length - 1]) >= TAIL_OK;
}

/* Score a candidate blank. Coverage matters as much as agreement: a window
   that matches two of the answer's four words perfectly is a worse blank
   than one that places all four, even if its mean similarity is lower. */
function windowScore(kjvWords, win) {
  const res = alignWords(kjvWords, win);
  return (res.score / res.max) * (res.hits / kjvWords.length);
}

/* The anchor chain bounds the blank but can be sparse: when the two
   editions disagree about a word, LCS traceback ties can leave the next
   anchor at the far end of the verse, and the blank swallows everything in
   between. This picks the window inside that bound whose words actually
   look like the KJV blank, preferring windows that end on the answer's
   last word. */
function pickSpan(nkjvToks, lo, hi, kjvWords) {
  const region = nkjvToks.slice(lo, hi + 1);
  if (!kjvWords.length) return [lo, hi];
  // The NKJV routinely spends a word or two more than the KJV on the same
  // phrase ("flee from you" -> "will flee from you"), so the window is
  // allowed some slack; the coverage term keeps that slack from turning
  // into padding.
  const sizes = [0, 1, 2, 3, 4].map(d => kjvWords.length + d)
    .filter(s => s >= 1 && s <= region.length);
  const candidates = [];
  sizes.forEach(size => {
    for (let s = 0; s + size <= region.length; s++) {
      const win = region.slice(s, s + size);
      candidates.push({ size, s, score: windowScore(kjvWords, win), tailOk: endsOnAnswer(kjvWords, win) });
    }
  });
  if (!candidates.length) return [lo, hi];
  // A window that stops before the answer's last word is only acceptable if
  // nothing better exists ("latter day" -> "at last on the earth" has no
  // window ending on "day", because the NKJV does not use the word).
  const usable = candidates.filter(c => c.tailOk);
  const pool = usable.length ? usable : candidates;
  pool.sort((x, y) =>
    (y.score - x.score) || (Number(y.tailOk) - Number(x.tailOk)) || (y.size - x.size) || (x.s - y.s));
  const best = pool[0];
  return [lo + best.s, lo + best.s + best.size - 1];
}

/* A blank that crosses a full stop is two sentences, not one phrase. */
const SENTENCE_END = /[.!?]$/;
function crossesSentence(nkjvToks, lo, hi) {
  for (let i = lo; i < hi; i++) {
    const t = bareWord(nkjvToks[i]).replace(/'/g, "");
    if (!t && SENTENCE_END.test(nkjvToks[i])) return true;
  }
  return false;
}

/* Opening punctuation belongs to the verse, not to the blank: a quotation
   mark before "I AM WHO I AM" is the narrator's, and leaving it on the
   answer would have the player typing it. Closing punctuation is left
   alone — "you." is how the verse ends, and the KJV bank does the same. */
const LEAD_TRIM = /^[^\w'"]+/;
function cleanAnswer(text) {
  const raw = tidy(text);
  return { a: raw.replace(LEAD_TRIM, "").trim() };
}

/* ---------- public ---------- */

/* The full KJV echo as the game presents it, in tokens. */
function echoOf(v) {
  return {
    toks: tokens(String(v.p || "") + " " + String(v.a || "") + " " + String(v.s || "")),
    pLen: tokens(v.p).length
  };
}

/* The core: locate `answerToks` inside the KJV echo and return the matching
   span from `nkjvToks`, plus the text either side of it.

   `echo` is the KJV wording the game shows for this item. For a bank verse
   that is p + a + s; for a tablet blank it is the whole KJV verse, because
   the tablet's prefix and suffix are themselves a re-cut of the verse and
   the blank may repeat words that appear earlier. `hint` is where the
   answer is expected to start in the echo, which keeps a repeated phrase
   from matching in the wrong place. */
function locateBlank(answerToks, echoToks, nkjvToks, hint) {
  if (!answerToks.length) return { miss: "empty-answer" };
  if (!nkjvToks.length) return { miss: "empty-nkjv" };

  const runAt = findAnswerRun(echoToks, answerToks, hint);
  if (runAt < 0) return { miss: "answer-not-in-echo" };
  const runEnd = runAt + answerToks.length - 1;

  const pairs = anchorPairs(echoToks, nkjvToks);
  if (!pairs.length) return { miss: "no-anchors" };

  const before = pairs.filter(([ki]) => ki < runAt);
  const after = pairs.filter(([ki]) => ki > runEnd);

  const lo0 = before.length ? before[before.length - 1][1] + 1 : 0;
  // How far the region may run. The first anchor past the blank is usually
  // context, so the region stops before it. Sometimes though it is the
  // blank's own last word: phrase-final words ("you", "earth", "holy") are
  // exactly the ones both editions share, so they anchor while still
  // belonging to the answer. That is knowable — the anchor records which
  // KJV word it matched — so the bound only opens when it should.
  const tailAnchor = after.length && after[0][0] <= runEnd;
  const hi0 = after.length
    ? after[0][1] - (tailAnchor ? 0 : 1)
    : nkjvToks.length - 1;
  if (hi0 < lo0) return { miss: "collapsed-span" };

  const [lo, hi] = pickSpan(nkjvToks, lo0, hi0, answerToks);
  if (hi < lo) return { miss: "empty-after-trim" };
  if (crossesSentence(nkjvToks, lo, hi)) return { miss: "spans-sentences" };

  const p = nkjvToks.slice(0, lo).join(" ");
  const cleaned = cleanAnswer(nkjvToks.slice(lo, hi + 1).join(" "));
  const s = nkjvToks.slice(hi + 1).join(" ");
  if (!cleaned.a) return { miss: "empty-answer-span" };
  // `span` is the blank's own [lo, hi] inside nkjvToks; the passage builder
  // slices the prose between blanks from these, not from KJV token counts.
  return { p: tidy(p), a: cleaned.a, s: tidy(s), span: [lo, hi] };
}

/* alignBlank(v, nkjvText) -> {p,a,s} | {miss:reason}

   `v` is a bank item {p,a,s}. `nkjvText` is the licensed NKJV verse (or a
   joined run of verses when the editions split a verse differently). */
function alignBlank(v, nkjvText) {
  const { toks: echoToks, pLen } = echoOf(v);
  return locateBlank(tokens(v.a), echoToks, tokens(nkjvText), pLen);
}

/* alignSegment({prefix, answer, suffix, kjvVerse}, nkjvText)

   The tablets store each blank as prefix/answer/suffix cut out of a whole
   verse rather than a bank item's shortened echo, so the answer is located
   against the full KJV verse. */
function alignSegment(seg, nkjvText) {
  const nkjvToks = tokens(nkjvText);
  const answerToks = tokens(seg.answer);
  const kjvToks = tokens(seg.kjvVerse);
  // The prefix tells us where the blank starts, so a phrase that repeats
  // earlier in the verse still matches in the right place.
  const hint = Math.max(0, tokens(seg.prefix).length - 2);
  const res = locateBlank(answerToks, kjvToks, nkjvToks, hint);
  if (res.miss) return res;
  return { prefix: res.p, a: res.a, suffix: res.s };
}

module.exports = {
  alignBlank, alignSegment, locateBlank, anchorPairs, canon, sameWord, norm,
  tidy, tokens, findAnswerRun, echoOf, bareWord, pickSpan, alignWords,
  windowScore, wordScore
};
