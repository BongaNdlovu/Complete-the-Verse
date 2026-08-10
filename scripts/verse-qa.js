/* ==================================================================
   VERSE QA — the content gate.

   The old gate (scripts/qa-verses-extra.js) only caught anagram-style
   reorderings, so it certified an auto-generated bank in which 77% of
   entries had a distractor lifted verbatim out of the same verse. This
   gate encodes what actually makes a fill-in-the-blank verse teach
   something:

     1. The blank must be a phrase a person could hold in their head.
        Not an arbitrary six-word window ending on "into this".
     2. The wrong answers must be wrong *about Scripture*, not wrong
        about grammar. If you can eliminate a distractor without
        knowing the verse, it is not a distractor.

   Pure functions, no dependencies. Consumed by scripts/qa-verses.js
   (the CLI gate) and verse-qa.test.js (the logic tests).
   ================================================================== */

/* ---------- normalisation ---------- */

const strip = s => String(s == null ? "" : s)
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/[…]/g, "...");

/* Lowercased, punctuation-free, single-spaced. The form used for every
   comparison — we care about words, not commas. */
function norm(s){
  return strip(s).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}
function tokens(s){ const n = norm(s); return n ? n.split(" ") : []; }

/* Whole-word containment. Comparing joined strings would call "bow" a
   substring of "rainbow", which is exactly the kind of false positive
   that makes a gate useless. */
function containsSequence(haystack, needle){
  if(!needle.length || needle.length > haystack.length) return false;
  for(let i=0;i<=haystack.length-needle.length;i++){
    let hit = true;
    for(let j=0;j<needle.length;j++) if(haystack[i+j] !== needle[j]){ hit = false; break; }
    if(hit) return true;
  }
  return false;
}

const sep = s => /^[.,;:!?]/.test(strip(s)) ? "" : " ";
const fullVerse = v => strip(v.p) + " " + strip(v.a) + sep(v.s) + strip(v.s);

/* ---------- word classes ---------- */

/* Words that cannot END a memorable phrase because they demand a
   continuation. Object pronouns are deliberately absent: "keep thee" and
   "he counted it" are complete phrases. "might" is absent too — as a
   noun it ends "with all thy might" perfectly well; the auxiliary sense
   is caught by the surrounding rules. */
const DANGLING = new Set([
  // determiners & possessives
  "the","a","an","this","that","these","those","my","mine","thy","thine","his","her",
  "its","our","your","their","each","every","some","any","no","which","what","whose",
  // prepositions
  "of","in","on","to","unto","into","upon","with","without","for","from","by","at","as",
  "before","after","among","against","between","through","toward","towards","over","under",
  "about","concerning","beside","besides","within","throughout",
  // conjunctions
  "and","or","but","nor","because","though","although","while","whereas","lest",
  "if","than","then","when","where","whither","wherefore","therefore","neither","either",
  // auxiliaries / copulas
  "is","are","was","were","be","been","being","am","art","hath","have","has","had","hast",
  "shall","will","would","should","may","must","can","could","do","doth","does","did",
  // trailing modifiers that leave the phrase hanging
  "only","even","also","very","so","such","both","still","much","most"
]);

/* A blank may legitimately BEGIN with a determiner ("the world",
   "a peculiar treasure", "thy God my God"), with an auxiliary ("shall be
   called") or with a noun that looks like one ("will of God in Christ
   Jesus"). It may not begin inside a prepositional or coordinate phrase
   ("of the LORD, that it is"), which is where the window-slicing
   generator did its damage. */
const OPENING_BAD = new Set([
  "of","in","on","to","unto","into","upon","with","without","from","by","at","as","for",
  "among","against","between","through","toward","towards","over","under","within",
  "and","or","but","nor","because","though","although","while","whereas","lest",
  "than","then","therefore","wherefore","that","which","who","whom"
]);

/* An object pronoun cannot open a phrase — it belongs to the verb that
   came before it. "me therefore a partner, receive him" is a window cut
   out of Philemon, not a phrase anyone could hold. */
const PRONOUN_OPENERS = new Set([
  "me","him","her","them","us","you","thee","it","himself","herself","thyself",
  "myself","themselves","itself","ourselves","yourselves"
]);

/* Prepositions bind backwards onto the noun before them: if the verse
   resumes on one, the blank was closed inside the phrase it belongs to
   ("transformed into an angel" | "of light"). Conjunctions and verbs are
   excluded — "the joy of the LORD" | "is your strength" closes exactly
   where the phrase closes, and that is a good blank. */
const BINDS_BACK = new Set([
  "of","unto","into","upon","toward","towards","against","among","between","throughout"
]);

/* Full function-word set: a distractor that differs from the answer in
   one of these alone is testing grammar, not recall. */
const FUNCTION_WORDS = new Set([...DANGLING,
  "i","me","he","she","it","we","us","they","them","him","thee","thou","ye","you",
  "there","here","who","whom","how","all","one","up","down","out","off","again","away",
  "hers","ours","yours","theirs","himself","thyself","myself","themselves","itself"
]);

/* Archaic <-> modern pairs. The auto-generator's favourite distractor was
   "thee" -> "you", which anyone who has read three verses of the KJV can
   discard on sight. */
const REGISTER = new Map([
  ["thee","you"],["thou","you"],["thy","your"],["thine","your"],["ye","you"],
  ["hath","has"],["doth","does"],["saith","says"],["hast","have"],["art","are"],
  ["wilt","will"],["shalt","shall"],["dost","do"],["knowest","know"],["cometh","comes"],
  ["goeth","goes"],["giveth","gives"],["maketh","makes"],["loveth","loves"],
  ["speaketh","speaks"],["walketh","walks"],["liveth","lives"],["believeth","believes"],
  ["endureth","endures"],["heareth","hears"],["seeketh","seeks"],["keepeth","keeps"],
  ["unto","to"],["whither","where"],["wherefore","why"],["saviour","savior"],
  ["honour","honor"],["labour","labor"],["valour","valor"]
]);
function deRegister(s){
  return tokens(s).map(w => REGISTER.has(w) ? REGISTER.get(w) : w).join(" ");
}
/* thee/thou/thy/thine are all archaic. Swapping one for another
   ("thine own understanding" vs "thy own understanding") is precise KJV
   recall and belongs in the game; swapping an archaic form for its
   modern equivalent ("thy" -> "your") is a giveaway. Only the second is
   a register swap, so the test has to be directional. */
const isArchaic = w => REGISTER.has(w);
const isModernOf = (archaic, w) => REGISTER.get(archaic) === w;

/* Connectives and articles carry no doctrine. Swapping one is never a
   question about Scripture. Possessives and quantifiers are excluded on
   purpose: "your Father" vs "our Father" and "all evil" vs "every evil"
   are real questions. */
const TRIVIAL_SWAP = new Set(["and","or","but","nor","the","a","an","is","was","are","were","be"]);

/* ---------- individual detectors ----------
   Each takes a verse-shaped {p,a,s,d} and returns an array of flag
   objects {code, detail}. Exported individually so the tests can pin
   each rule down on its own. */

/* Answers rendered in full caps are divine-name declarations
   ("I AM THAT I AM"). The caps are the point and the phrase is
   self-contained, so the phrase-shape rules do not apply. */
function isDeclaration(v){
  const raw = strip(v.a).replace(/[^A-Za-z ]/g, "").trim();
  return !!raw && raw === raw.toUpperCase();
}

function detectMidClause(v){
  const t = tokens(v.a);
  if(!t.length) return [{code:"empty-answer", detail:"answer is empty"}];
  // A one-word blank has no phrase shape to get wrong.
  if(t.length === 1 || isDeclaration(v)) return [];
  const out = [];
  const last = t[t.length-1], first = t[0], prev = t[t.length-2];
  // "as this" / "as that" are pronouns closing a phrase ("such a time as
  // this"); "into this" / "of his" are determiners left hanging.
  const pronounClose = prev === "as" && (last === "this" || last === "that");
  if(DANGLING.has(last) && !pronounClose)
    out.push({code:"mid-clause", detail:'blank ends on "'+last+'" — the phrase dangles'});
  // A blank may open with a preposition when what follows is a complete
  // phrase — "with an everlasting love", "as a mighty stream". It may not
  // when the window runs on past the phrase into a new clause
  // ("of the LORD, that it is") or trails a verb ("in the image of God
  // created"). "that which was lost" is a headed relative and complete.
  const headedRelative = first === "that" && ["which","who","whom"].includes(t[1]);
  // A relative straight after the opening preposition is pied-piping, not
  // a run-on: "of whom I am chief" is one clause and a complete phrase.
  const runsIntoClause = t.slice(2).some(w => ["that","which","who","whom"].includes(w));
  // -ing is excluded: "understanding", "blessing" and "beginning" are
  // nouns far more often than they are trailing verbs in this text.
  const trailsVerb = /(?:ed|eth|est)$/.test(last) && !DANGLING.has(last);
  if(t.length >= 4 && OPENING_BAD.has(first) && !headedRelative && (runsIntoClause || trailsVerb))
    out.push({code:"mid-clause", detail:'blank begins on "'+first+'" and runs past the phrase'});
  // Only an OBJECT pronoun strands the blank. Followed by a verb the same
  // word is a subject and opens a clause cleanly ("it is the gift of God").
  const subjectUse = ["is","was","are","were","shall","will","hath","have","be","am","doth"].includes(t[1]);
  if(t.length >= 4 && PRONOUN_OPENERS.has(first) && !subjectUse)
    out.push({code:"mid-clause", detail:'blank begins on the object pronoun "'+first+'"'});
  // The text resuming after the blank tells you whether the blank closed
  // where the phrase closed.
  const after = tokens(v.s)[0];
  if(t.length >= 3 && after && BINDS_BACK.has(after))
    out.push({code:"mid-clause", detail:'the verse resumes on "'+after+'" — the blank cut the phrase short'});
  return out;
}

function detectRecycled(v){
  const ctx = " " + norm(fullVerse(v)) + " ";
  const answer = norm(v.a);
  const out = [];
  (v.d || []).forEach(d => {
    const n = norm(d);
    if(!n || n === answer) return;
    // A single word reappearing elsewhere in a long verse is coincidence.
    // Two or more consecutive words is a lifted fragment, and a lifted
    // fragment is eliminable by grammar alone.
    if(n.split(" ").length < 2) return;
    if(ctx.indexOf(" " + n + " ") >= 0)
      out.push({code:"recycled", detail:'distractor "'+d+'" is lifted verbatim from the verse'});
  });
  return out;
}

function detectRegisterSwap(v){
  const at = tokens(v.a);
  const out = [];
  (v.d || []).forEach(d => {
    const dt = tokens(d);
    if(dt.length !== at.length) return;
    const diff = [];
    for(let i=0;i<at.length;i++) if(at[i] !== dt[i]) diff.push([at[i], dt[i]]);
    if(!diff.length) return;
    // Flag only when every difference is an archaic form traded for its
    // own modern equivalent, in either direction.
    const allRegister = diff.every(([aw, dw]) =>
      (isArchaic(aw) && isModernOf(aw, dw)) || (isArchaic(dw) && isModernOf(dw, aw)));
    if(allRegister)
      out.push({code:"register-swap", detail:'distractor "'+d+'" only modernises the archaic wording'});
  });
  return out;
}

function detectFunctionSwap(v){
  const at = tokens(v.a);
  const out = [];
  // In a short blank the function word IS the thing being tested —
  // "no other gods before me" vs "besides me" is a real question. Only
  // once the phrase is long enough for the swap to be incidental does a
  // lone function-word difference become a free elimination.
  if(at.length < 4 || isDeclaration(v)) return out;
  (v.d || []).forEach(d => {
    const dt = tokens(d);
    if(dt.length !== at.length) return;
    const diff = [];
    for(let i=0;i<at.length;i++) if(at[i] !== dt[i]) diff.push([at[i], dt[i]]);
    if(diff.length !== 1) return;
    const [aw, dw] = diff[0];
    if(TRIVIAL_SWAP.has(aw) && TRIVIAL_SWAP.has(dw))
      out.push({code:"function-swap", detail:'distractor "'+d+'" differs only in the connective "'+aw+'" -> "'+dw+'"'});
  });
  return out;
}

function detectContainment(v){
  const at = tokens(v.a);
  const out = [];
  (v.d || []).forEach(d => {
    const dt = tokens(d);
    if(dt.length <= at.length) return;          // only over-long distractors
    if(!containsSequence(dt, at)) return;
    // A trailing word or two is a precision test ("I am the LORD" vs
    // "I am the LORD thy God"). Bolting the rest of the verse onto the
    // answer is just a longer line, discardable on length alone.
    if(dt.length - at.length >= 3)
      out.push({code:"containment", detail:'distractor "'+d+'" is the answer plus '+(dt.length-at.length)+' trailing words'});
  });
  return out;
}

function detectDuplicateOptions(v){
  const a = norm(v.a);
  const out = [], seen = new Set();
  (v.d || []).forEach(d => {
    const n = norm(d);
    if(n === a) out.push({code:"non-distinct", detail:'distractor "'+d+'" equals the answer once punctuation is ignored'});
    else if(seen.has(n)) out.push({code:"duplicate-option", detail:'distractor "'+d+'" is repeated'});
    seen.add(n);
  });
  return out;
}

function detectShape(v){
  const out = [];
  const aw = tokens(v.a).length;
  if(aw > 8) out.push({code:"answer-too-long", detail:aw+" words — beyond a single held phrase"});
  const before = tokens(v.p).length, after = tokens(v.s).length;
  if(before < 3 && after < 3)
    out.push({code:"thin-context", detail:"only "+before+" words before and "+after+" after the blank"});
  if(!strip(v.p).trim() && !strip(v.s).trim())
    out.push({code:"no-context", detail:"the blank is the whole verse"});
  const n = (v.d || []).length;
  if(n !== 3) out.push({code:"option-count", detail:n+" distractors (expected 3)"});
  if(!v.b) out.push({code:"missing-book", detail:"no book"});
  if(!v.r) out.push({code:"missing-ref", detail:"no reference"});
  if(!(v.t >= 1 && v.t <= 5)) out.push({code:"bad-tier", detail:"tier "+v.t});
  return out;
}

const DETECTORS = [
  detectShape, detectMidClause, detectRecycled, detectRegisterSwap,
  detectFunctionSwap, detectContainment, detectDuplicateOptions
];

/* Errors mean the item cannot teach and must be repaired or cut.
   Warnings are editorial notes that do not block a release. */
const WARN_ONLY = new Set(["thin-context"]);
const severity = code => WARN_ONLY.has(code) ? "warn" : "error";

/* ---------- aggregate ---------- */

/* A verse may carry `qaOk:["recycled"]` to waive a named rule. This
   exists for the case the rules cannot see: John 1:1 sets "was God"
   against "was with God", and the second phrase is lifted from the verse
   precisely because the distinction between them is the whole point of
   the verse. Waivers are counted and printed by the gate so they cannot
   quietly become the way every failure gets handled. */
function auditVerse(v){
  const waived = new Set(v.qaOk || []);
  const flags = [];
  DETECTORS.forEach(fn => fn(v).forEach(f => {
    const sev = waived.has(f.code) ? "waived" : severity(f.code);
    flags.push(Object.assign({severity:sev}, f));
  }));
  return flags;
}

/* Bank-level invariants that no single verse can see. */
function auditBank(list){
  const perVerse = list.map(v => ({verse:v, flags:auditVerse(v)}));
  const bank = [];
  const byKey = new Map();
  list.forEach(v => {
    const k = norm(v.r) + "||" + norm(v.a);
    if(byKey.has(k)) bank.push({code:"duplicate-entry", severity:"error", detail:v.r+' repeats the same blank ("'+v.a+'")'});
    byKey.set(k, v);
  });
  const failing = perVerse.filter(x => x.flags.some(f => f.severity === "error"));
  const rest    = perVerse.filter(x => !x.flags.some(f => f.severity === "error"));
  const warned  = rest.filter(x => x.flags.some(f => f.severity === "warn"));
  const waived  = rest.filter(x => x.flags.some(f => f.severity === "waived"));
  return {
    total: list.length,
    clean: list.length - failing.length - warned.length - waived.length,
    failing, warned, waived, bank,
    ok: failing.length === 0 && bank.length === 0
  };
}

/* Passage blanks are the same problem wearing a different shape: one
   context, several answers. Flatten each blank into a verse-shaped
   object so it goes through the identical rules. */
function passageToVerses(p){
  const text = p.parts.map(x => typeof x === "string" ? x : x.a).join("");
  return p.blanks ? p.blanks.map(bl => ({
    b:p.b, r:p.r, t:p.t, p:text.split(bl.a)[0] || text, a:bl.a, s:"", d:bl.d,
    qaOk:bl.qaOk, _passage:true
  })) : [];
}

module.exports = {
  norm, tokens, deRegister, fullVerse, containsSequence, severity,
  DANGLING, FUNCTION_WORDS, REGISTER,
  detectMidClause, detectRecycled, detectRegisterSwap, detectFunctionSwap,
  detectContainment, detectDuplicateOptions, detectShape,
  auditVerse, auditBank, passageToVerses
};
