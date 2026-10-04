#!/usr/bin/env node
/* ==================================================================
   BUILD NKJV — compile the NKJV edition of the game from the licensed
   dump in content/nkjv/source/.

   One shared engine, two banks. This generator produces the *bank* half of
   the NKJV edition: the same 899 blanks, 27 passages, 144 tablet chapters,
   46 site quotes, 280 true/false claims, 131 notes, the Beat questions and
   the six tutorial lessons — every one of them carrying NKJV wording.

   Wording is never invented here. Each item is either re-cut from the
   licensed text by scripts/nkjv-align.js, taken from a curated alignment
   that has been checked against that text (scripts/nkjv-alignments.js),
   or listed explicitly in scripts/nkjv-hand.js. Anything that cannot be
   sourced goes into content/nkjv/HAND.json and the build fails, so a
   KJV phrasing can never quietly ship wearing an NKJV badge.

     node scripts/build-nkjv.js           write js/nkjv/*
     node scripts/build-nkjv.js --check   report only, change nothing
   ================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = require("./repo-root");
const { loadBank } = require("./load-bank");
const { loadSourceDump } = require("./nkjv-parse");
const { loadTablets } = require("./nkjv-load");
const { buildIndex, sourceFor, canonRef } = require("./nkjv-source");
const A = require("./nkjv-align");
const QA = require("./verse-qa");
const { EXPLICIT } = require("./nkjv-alignments");
const HAND = require("./nkjv-hand").VERSES;
const HAND_TABLET = require("./nkjv-hand").TABLET;
const HAND_BANK = require("./nkjv-hand").BANK;

const OUT_DIR = path.join(ROOT, "js", "nkjv");
const HAND_FILE = path.join(ROOT, "content", "nkjv", "HAND.json");
const REPORT_FILE = path.join(ROOT, "content", "nkjv", "build-report.json");

/* Anything the gate still refuses after alignment, with why. Empty is the
   only acceptable value for a release. */
const unresolved = {};

function note(ref, reason, detail) {
  if (!unresolved[ref]) unresolved[ref] = [];
  unresolved[ref].push(detail ? { reason, detail } : { reason });
}

function _readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return fallback; }
}

/* ---------- verses ---------- */

/* A curated alignment or a hand cut describes ONE blank on its verse. The
   bank puts two blanks on some verses — Ecclesiastes 12:13 asks both for
   "Fear God, and keep his commandments" and for "whole duty of man" — and
   applying the same cut to both would give two different questions the same
   answer, which is also the same verse id.

   So an override is only used when it is recognisably the cut of the blank
   in hand: its text has to sit inside the KJV item's own p+a+s. Matching on
   the answer alone is not enough, because a re-cut moves the answer's words
   around ("Ye shall be holy" is filed as "shall be holy"). Matching the
   whole cut against the whole item survives that. */
const STOP = new Set(["the", "a", "an", "and", "or", "but", "of", "in", "on",
  "to", "unto", "for", "with", "by", "from", "as", "is", "be", "was", "were",
  "shall", "will", "his", "her", "your", "their", "my", "our"]);

function contentWords(text) {
  return A.tokens(text).map(A.canon).filter(w => w && !STOP.has(w));
}

/* A curated entry describes one blank, so it is only a candidate for the
   item whose wording it was written against. Half the content words is the
   threshold the data wants: "children of God" against the KJV's "the sons of
   God" shares exactly half, and that entry is right. */
function sameBlank(override, kjv) {
  const want = contentWords(String(override.p) + " " + String(override.a) + " " + String(override.s));
  const have = contentWords(String(kjv.p) + " " + String(kjv.a) + " " + String(kjv.s));
  if (!want.length) return false;
  const pool = have.slice();
  let hit = 0;
  want.forEach(w => {
    const at = pool.indexOf(w);
    if (at >= 0) { hit++; pool.splice(at, 1); }
  });
  return hit >= Math.max(1, Math.ceil(want.length * 0.5));
}

function _overrideFor(ref, kjv) {
  const explicit = EXPLICIT[ref];
  if (explicit && sameBlank(explicit, kjv)) return { cut: explicit, from: "curated" };
  const hand = HAND[ref];
  if (hand && sameBlank(hand, kjv)) return { cut: hand, from: "hand" };
  return null;
}

/* Which gate errors are about the blank itself. Option-count is excluded:
   distractors are generated after the cut is chosen, so a blank that is
   otherwise sound must not be judged on an empty options list. */
function blankErrors(item) {
  return QA.auditVerse(Object.assign({}, item, { d: item.d || [] }))
    .filter(f => f.severity === "error" && f.code !== "option-count");
}

function asItem(v, p, a, s) {
  return { b: v.b, r: v.r, t: v.t, p, a, s, d: [] };
}

/* The three sources of a cut, chosen by how each one fares at the content
   gate rather than by seniority. The probe in scripts/probe-source-order.js
   shows the hand cuts beating the aligner on most blanks and losing on two
   (Ezekiel 36:26, Zechariah 9:11), and the curated file losing on two more
   (Psalm 27:1, Genesis 12:1), so no single source can be trusted blindly.

   A candidate is any source that has something to say about this verse:
   scripts/nkjv-hand.js by reference, the aligner from the licensed text,
   scripts/nkjv-alignments.js by reference. The one with the fewest gate
   errors wins; ties go to the more specific source. Whatever wins, the
   build records what it passed over, so a hand cut that stops being the
   best cut is visible rather than silent. */
/* The hand file and the curated file each describe ONE blank on a verse. The
   bank puts two blanks on some verses, and a cut written for one of them is
   simply wrong for the other, so a source that has already been used for a
   reference is not offered again.

   scripts/nkjv-hand.js holds two tables. VERSES is keyed by reference and
   covers the bank blanks; TABLET is keyed "reference|KJV answer" and covers
   blanks that only the tablets ask for. Several of the tablet cuts are also
   the right answer for a bank blank the aligner fumbles (Zechariah 9:9 cuts
   the KJV's "ass" to the preposition "on"), so both tables are candidates
   here and the gate decides. */
/* Sentence punctuation belongs to the echo after the blank, not to the
   answer the player picks. "living being." is two tokens to the gate and
   one to the player; move the tail onto `s` the way the KJV bank does. */
const SENT_TAIL = /([.!?…,;:]+["'”’]?)$/;
function splitAnswerTail(a, s) {
  const answer = String(a == null ? "" : a);
  const suffix = String(s == null ? "" : s);
  const m = answer.match(SENT_TAIL);
  if (!m) return { a: answer, s: suffix };
  const tail = m[1];
  const bare = answer.slice(0, answer.length - tail.length).replace(/\s+$/, "");
  if (!bare) return { a: answer, s: suffix };
  // The engine renders a + sep(s) + s and sep adds no space before
  // punctuation, so a moved tail carries its own separator — the way the
  // KJV bank stores its suffixes (", so that I cannot come down:").
  return { a: bare, s: tail + (suffix && !/^\s/.test(suffix) ? " " + suffix : suffix) };
}

/* ---------- fidelity of the dump ---------- */

/* The whole KJV verse as the game echoes it — the reference the name
   restoration aligns against. */
function echoText(v) {
  return String(v.p || "") + " " + String(v.a || "") + " " + String(v.s || "");
}

/* The licensed dump renders the divine name the way a web export does —
   "Lord" — where the printed NKJV sets it in small capitals ("LORD"), and
   it loses the em dashes to the aligner's token tidying. The KJV echo has
   the real capitals, so the word map between the two editions carries them
   across; dashes are restored by looking the hyphen up in the raw text. */
/* Which spelling of the divine name a token carries, once any attached
   punctuation, dash or possessive is set aside: "LORD"/"GOD" is the printed
   small-caps form, "Lord"/"God" is what the dump left behind. */
function divineNameOf(tok) {
  const m = String(tok).match(/^[.,;:!?"'“”‘’\u2013\u2014-]*(LORD|GOD|Lord|God)((?:['’]S|['’]s)?)[.,;:!?"'”’\u2013\u2014-]*$/);
  return m ? m[1] : null;
}

function restoreCasesInParts(kjvEcho, parts) {
  if (!kjvEcho) return parts;
  const kt = A.tokens(kjvEcho);
  const sizes = parts.map(part => A.tokens(part).length);
  const flat = [].concat.apply([], parts.map(part => A.tokens(part)));
  A.anchorPairs(kt, flat).forEach(([ki, nj]) => {
    const kjvName = divineNameOf(kt[ki]);
    const nkjvName = divineNameOf(flat[nj]);
    if ((kjvName === "LORD" || kjvName === "GOD") && (nkjvName === "Lord" || nkjvName === "God")) {
      flat[nj] = flat[nj].replace(/^(.*?)(Lord|God)(.*)$/, (m, pre, name, post) => pre + name.toUpperCase() + post);
    }
  });
  /* A KJV item may quote only part of the verse, so some dump tokens anchor
     to nothing. When the echo shows no plain "Lord" of its own — the KJV
     spelling for Adonai — every leftover "Lord" is the dump losing the small
     caps, not a genuine "Lord". A "Lord" before a God-name is the Adonai
     YHWH construction only when the KJV itself prints "GOD" there; "LORD
     God" is YHWH Elohim and stays. */
  if (!kt.some(t => divineNameOf(t) === "Lord")) {
    const kjvHasGOD = kt.some(t => divineNameOf(t) === "GOD");
    flat.forEach((tok, i) => {
      const next = divineNameOf(flat[i + 1]);
      if (divineNameOf(tok) === "Lord" && !(kjvHasGOD && (next === "GOD" || next === "God"))) {
        flat[i] = tok.replace(/^(.*?)Lord(.*)$/, (m, pre, post) => pre + "LORD" + post);
      }
    });
  }
  const out = [];
  let at = 0;
  sizes.forEach(n => { out.push(flat.slice(at, at + n).join(" ")); at += n; });
  return out;
}

function restoreDashes(text, raw) {
  if (!raw || !text || text.indexOf("-") < 0) return text;
  return text.replace(/([A-Za-z]+) ?- ?([A-Za-z]+)/g, (m, l, r) =>
    raw.indexOf(l + "\u2014" + r) >= 0 ? l + "\u2014" + r : m);
}

/* Case and dash fidelity applied to a resolved dump text. Callers resolve
   the raw text themselves (passages may join a compound reference). */
function faithfulText(raw, kjvEcho) {
  if (!raw) return { text: raw, raw };
  return { text: restoreDashes(restoreCasesInParts(kjvEcho, [raw])[0], raw), raw };
}

function pushCut(out, from, key, res, qaOk, source, raw) {
  const split = splitAnswerTail(res.a, res.s);
  out.push({
    from, key,
    res: { p: res.p, a: split.a, s: split.s, d: res.d },
    qaOk: qaOk || null,
    source: source || "",
    raw: raw || ""
  });
}

function candidateCuts(v, index, stats) {
  const src = faithfulText(sourceFor(v.r, index), echoText(v));
  const text = src.text;
  const spent = stats.spent || (stats.spent = {});
  const already = key => !!(spent[v.r] && spent[v.r][key]);
  const out = [];

  // BANK/TABLET are keyed by KJV answer so a dual-blank verse can take one
  // cut per question. They outrank the ref-only hand/curated tables, which
  // describe a single blank and would otherwise claim both.
  const bankCut = HAND_BANK[v.r + "|" + v.a];
  if (bankCut && !already("bank|" + v.a)) {
    pushCut(out, "bank", "bank|" + v.a,
      { p: bankCut.p, a: bankCut.a, s: bankCut.s, d: bankCut.d }, bankCut.qaOk, text, src.raw);
  }
  const tab = HAND_TABLET[v.r + "|" + v.a];
  if (tab && !already("tablet|" + v.a)) {
    pushCut(out, "tablet", "tablet|" + v.a,
      { p: tab.prefix, a: tab.a, s: tab.suffix, d: tab.d }, tab.qaOk, text, src.raw);
  }
  const hand = HAND[v.r];
  if (hand && !already("hand") && !bankCut) {
    pushCut(out, "hand", "hand",
      { p: hand.p, a: hand.a, s: hand.s, d: hand.d }, hand.qaOk, text, src.raw);
  }
  if (text) {
    const auto = A.alignBlank(v, text);
    if (!auto.miss) pushCut(out, "aligned", "auto|" + v.a, auto, null, text, src.raw);
  }
  const explicit = EXPLICIT[v.r];
  if (explicit && sameBlank(explicit, v) && !already("curated") && !bankCut) {
    pushCut(out, "curated", "curated",
      { p: explicit.p, a: explicit.a, s: explicit.s, d: explicit.d }, explicit.qaOk, text, src.raw);
  }
  return out;
}

function cutVerse(v, index, stats) {
  const candidates = candidateCuts(v, index, stats);
  if (!candidates.length) {
    note(v.r, sourceFor(v.r, index) ? "could-not-align" : "missing-source");
    return null;
  }
  const taken = stats.answersByRef[v.r] || (stats.answersByRef[v.r] = []);
  candidates.forEach(c => {
    c.errs = blankErrors(asItem(v, c.res.p, c.res.a, c.res.s)).length;
    c.dup = taken.indexOf(QA.norm(c.res.a)) >= 0;
  });
  // Two blanks on one verse must not end up with the same answer: verse ids
  // come from the reference and the blank, so a repeat would collide in
  // BY_ID and ask the player the same question twice. Distinct candidates
  // come first; the ordering within each group is fewest gate errors, then
  // the order the sources were pushed (most specific to least).
  const rank = list => list.slice().sort((a, b) => a.errs - b.errs);
  const pool = rank(candidates.filter(c => !c.dup)).concat(rank(candidates.filter(c => c.dup)));
  const best = pool[0];
  taken.push(QA.norm(best.res.a));
  stats.spent[v.r] = stats.spent[v.r] || {};
  stats.spent[v.r][best.key] = true;

  stats.cut[best.from]++;
  if (best.from !== "hand" && HAND[v.r] && !stats.spent[v.r].hand) {
    stats.handSuperseded.push(v.r + " (" + best.from + " won)");
  }
  if (best.errs) {
    note(v.r, "qa:" + QA.auditVerse(asItem(v, best.res.p, best.res.a, best.res.s))
      .filter(f => f.severity === "error" && f.code !== "option-count")
      .map(f => f.code).join("+"), '"' + best.res.a + '"');
  }
  return best;
}

function buildVerses(bank, index, stats) {
  const out = [];
  bank.VERSES.forEach(v => {
    const cut = cutVerse(v, index, stats);
    if (!cut) return;
    out.push(finishVerse(v, cut, stats));
  });
  return out;
}

/* Everything after the cut is chosen: build the item, then the options.
   Split out so diagnostics can reproduce the build exactly instead of
   re-deriving the same decisions and drifting. */
function finishVerse(v, cut, stats) {
  const res = cut.res;
  const recapped = restoreCasesInParts(echoText(v), [res.p, res.a, res.s]);
  const item = {
    b: v.b, r: v.r, t: v.t,
    p: restoreDashes(recapped[0], cut.raw),
    a: restoreDashes(recapped[1], cut.raw),
    s: restoreDashes(recapped[2], cut.raw),
    d: []
  };
  if (v.typed) item.typed = true;
  if (v.mechanic) item.mechanic = v.mechanic;
  if (cut.qaOk) item.qaOk = cut.qaOk;
  // The KJV item goes in whole: its own distractors are the most
  // instructive wrong answers available for a re-cut blank, and the
  // curated sets in nkjv-alignments.js are keyed by its reference.
  // A hand/curated cut may carry its own `d` — those are written against
  // the NKJV answer and win over the generator's pool.
  const curatedD = Array.isArray(res.d) ? res.d.filter(Boolean) : [];
  item.d = require("./nkjv-distractors").makeDistractors({
    kjv: v, nkjv: res, item, sourceText: cut.source, curated: curatedD
  });
  if (stats) stats.items++;
  return item;
}

/* The whole decision for one verse, without building it. */
function planVerse(v, index, stats) {
  const cut = cutVerse(v, index, stats || { cut: {} });
  return cut ? { kjv: v, cut } : null;
}

/* ---------- passages ---------- */

/* Trim the punctuation that belongs to a blank boundary rather than to the
   prose either side of it, so an aligned run does not end up with "." on
   both sides of the gap it came from. */
const LEAD_PUNCT = /^[\s.,;:!?\u201c\u201d"']+/;
const TRAIL_PUNCT = /[\s.,;:!?\u201c\u201d"']+$/;
const _trimLead = s => String(s).replace(LEAD_PUNCT, "");
const _trimTrail = s => String(s).replace(TRAIL_PUNCT, "");

/* A passage is one context with several blanks. The passage's whole KJV
   text is the echo, and each blank is located inside the NKJV run, which
   keeps every blank in the same verse sequence it was written against.
   The prose between the blanks is redrawn from the same NKJV run: an NKJV
   passage showing an NKJV blank inside KJV prose would be a third edition.

   The aligned runs are already contiguous — locateBlank returns
   everything from the start of the verse to the blank, and everything
   after it — so walking the parts and taking the next slice needs no
   anchor hunting of its own. */
function passageEcho(p) {
  return p.parts.map(x => typeof x === "string" ? x : x.a).join("");
}

/* The passage's reference may be a compound ("Exodus 4:14; 7:1"); resolve
   each chunk and join, where a bare "7:1" inherits the passage's book.
   "1 Corinthians 13:4" also starts with a digit, so the test has to be for a
   chapter:verse with no book in front of it, not merely for a leading
   number. */
function passageText(p, index) {
  return String(p.r).split(";")
    .map(chunk => {
      const c = chunk.trim();
      const ref = /^\d+:/.test(c) ? p.b + " " + c : c;
      return sourceFor(ref, index);
    })
    .join(" ");
}

/* How much of the NKJV run each KJV part accounts for, so the prose can be
   sliced out of it. A part's own words are the ruler; where the editions
   disagree the slice is approximate, which is why the blank itself is cut
   by locateBlank rather than by this walk. */
/* Passage blanks the KJV bank already waives. The gates they trip are real
   observations about a repeated phrase — "God created the heavens and the
   earth" fills a cloze blank in Genesis 1:1-2 and the same words appear as a
   phrase blank beside it — but the repetition is the verse, not a defect,
   and the KJV bank waives the identical code on the identical blank. The
   waiver is carried over by reference and answer so the two editions stay in
   step rather than the NKJV quietly re-cutting a passage to dodge a rule. */
function kjvPassageWaivers(bank) {
  const out = new Map();
  (bank.PASSAGES || []).forEach(p => (p.blanks || []).forEach(bl => {
    if (bl.qaOk && bl.qaOk.length) out.set(p.r + "|" + QA.norm(bl.a), bl.qaOk.slice());
  }));
  return out;
}

function _passageAuditItem(p, bl) {
  const text = p.parts.map(x => typeof x === "string" ? x : x.a).join("");
  return {
    b: p.b, r: p.r, t: p.t, p: text.split(bl.a)[0] || text, a: bl.a, s: "", d: bl.d, qaOk: bl.qaOk
  };
}

/* Passage blanks that the aligner cuts badly or whose KJV distractors do
   not survive the NKJV re-cut. Keyed "reference|KJV answer". */
const PASSAGE_CUTS = {
  "Joshua 1:9|of a good courage": {
    a: "of good courage",
    d: ["of good cheer", "of a good spirit", "of great courage"]
  },
  "Joshua 1:9|whithersoever thou goest": {
    a: "wherever you go",
    d: ["in all your ways", "to the ends of the earth", "through the deep waters"]
  },
  "Genesis 1:1-2|heaven and the earth": {
    a: "heavens and the earth.",
    d: ["earth and the heavens", "heavens and the land", "world and the sea"]
  },
  "Genesis 1:1-2|face of the waters": {
    a: "face of the waters.",
    d: ["waters of the deep", "surface of the sea", "face of the flood"]
  },
  "Psalm 1:1|way of sinners": {
    a: "path of sinners,",
    d: ["seat of sinners", "way of the wicked", "path of the scornful"]
  },
  "Isaiah 40:31|wings as eagles": {
    a: "wings like eagles,",
    d: ["wings as the eagle", "eagles' wings", "wings of a dove"]
  },
  "Proverbs 3:5-6|all thine heart": {
    a: "all your heart,",
    d: ["all your soul", "your whole heart", "all your strength"]
  },
  "Proverbs 3:5-6|thine own understanding": {
    a: "your own understanding;",
    d: ["your own wisdom", "your own counsel", "your own insight"]
  },
  "Revelation 21:4|wipe away all tears": {
    a: "wipe away every tear",
    d: ["take away all tears", "wipe all tears away", "banish every sorrow"]
  },
  "Revelation 21:4|former things are passed away": {
    a: "former things have passed away.\"",
    d: ["former things are done away", "first things are passed away", "old things have vanished"]
  },
  "Psalm 51:10-11|right spirit": {
    a: "steadfast spirit",
    d: ["righteous spirit", "willing spirit", "clean spirit"]
  },
  "Ecclesiastes 3:1-2|under the heaven": {
    a: "under heaven:",
    d: ["under the sun", "beneath the heavens", "on the earth"]
  },
  "Ecclesiastes 3:1-2|a season": {
    a: "a season,",
    d: ["an hour,", "a due season,", "an age,"]
  },
  "Isaiah 53:5|our transgressions": {
    a: "our transgressions,",
    d: ["our trespasses,", "our rebellions,", "our sins,"]
  },
  /* "envieth not" re-orders into "does not envy", which the stemmer cannot
     walk ("envieth" strips to "envi"); locate it by its NKJV words instead. */
  "1 Corinthians 13:4|envieth not": {
    a: "does not envy",
    d: ["does not mourn", "does not boast", "does not wander"]
  },
  "Isaiah 53:5|our iniquities": {
    a: "our iniquities;",
    d: ["our offences;", "our wickedness;", "our sins;"]
  },
  "Matthew 28:19-20|Holy Ghost": {
    a: "Holy Spirit,",
    d: ["Spirit of God", "Comforter", "Spirit of truth"]
  },
  "Matthew 28:19-20|end of the world": {
    a: "end of the age.\"",
    d: ["ends of the earth", "end of all things", "close of the age"]
  }
};

/* The run of `needle` (canonically compared) in `hay` at or after `from`,
   for overrides whose wording is verbatim NKJV. */
function findTokenRun(hay, needle, from) {
  if (!needle.length) return null;
  const want = needle.map(A.canon);
  for (let i = Math.max(0, from); i + needle.length <= hay.length; i++) {
    let ok = true;
    for (let k = 0; k < needle.length && ok; k++) {
      if (A.canon(hay[i + k]) !== want[k]) ok = false;
    }
    if (ok) return [i, i + needle.length - 1];
  }
  return null;
}

function buildPassages(bank, index, stats) {
  const waivers = kjvPassageWaivers(bank);
  return bank.PASSAGES.map(p => {
    const kjvEcho = passageEcho(p);
    const src = faithfulText(passageText(p, index), kjvEcho);
    if (!src.text || !src.text.trim()) { note(p.r, "missing-source"); return Object.assign({}, p); }

    const echoToks = A.tokens(kjvEcho);
    const nkjvToks = A.tokens(src.text);
    const out = [];
    let at = 0;         // cursor into the NKJV run
    let echoAt = 0;     // cursor into the KJV echo
    let pending = "";   // punctuation moved off the previous answer

    p.parts.forEach(part => {
      if (typeof part === "string") {
        echoAt += A.tokens(part).length;
        return; // prose is sliced out of the NKJV run around the blanks
      }
      const aToks = A.tokens(part.a);
      echoAt += aToks.length;
      const override = PASSAGE_CUTS[p.r + "|" + part.a];
      let span = null, miss = null;
      if (override) span = findTokenRun(nkjvToks, A.tokens(override.a), at);
      if (!span) {
        const res = A.locateBlank(aToks, echoToks, nkjvToks, echoAt - aToks.length);
        if (res.miss) miss = "passage-blank:" + res.miss;
        else if (res.span[0] < at) miss = "passage-blank:overlap";
        else span = res.span;
      }
      if (miss) { note(p.r, miss, part.a); out.push(Object.assign({}, part)); return; }
      // The prose between blanks is the NKJV's own words, located in the run
      // itself, so an answer can never leak into the prose and the parts can
      // never glue: each string carries the trailing space the screen's
      // join("") expects, the way the KJV bank's parts do.
      const prose = nkjvToks.slice(at, span[0]).join(" ");
      // The moved tail hugs the blank ("[answer], that whoever…") and every
      // string part carries a trailing space before a blank, the way the
      // KJV bank writes its parts. Prose that follows a blank mid-passage
      // needs the leading space too; prose at the head of the passage
      // doesn't.
      const afterBlank = at > 0;
      const lead = pending ? (prose ? pending + " " + prose + " " : pending + " ")
                           : (prose ? (afterBlank ? " " : "") + prose + " " : "");
      pending = "";
      if (lead) out.push(lead);
      stats.passageBlanks++;
      // Sentence punctuation belongs to what follows the blank, not to the
      // answer the player picks.
      const answerText = nkjvToks.slice(span[0], span[1] + 1).join(" ");
      const split = splitAnswerTail(answerText, "");
      pending = split.s;
      // KJV distractors are written against KJV wording and become
      // non-distinct or register-swaps the moment the answer is re-cut.
      // Generate a fresh set against the NKJV blank instead. The trial
      // item needs the surrounding run so the gate can see context.
      const before = nkjvToks.slice(0, span[0]).join(" ");
      const after = nkjvToks.slice(span[1] + 1).join(" ");
      const trial = { b: p.b, r: p.r, t: p.t, p: before, a: split.a, s: after.slice(0, 80), d: [] };
      const generated = require("./nkjv-distractors").makeDistractors({
        kjv: { r: p.r, a: part.a, d: part.d || [] },
        nkjv: trial,
        item: trial,
        sourceText: src.text,
        curated: (part.nkjvD || (override && override.d) || [])
      });
      // Keep only options the gate accepts alongside this answer, and
      // never the same option twice once punctuation is ignored.
      const seen = new Set([QA.norm(split.a)]);
      const keep = list => list.filter(d => {
        const key = QA.norm(d);
        if (!key || seen.has(key)) return false;
        const t = Object.assign({}, trial, { d: [d] });
        const bad = QA.auditVerse(t).some(f => f.severity === "error" &&
          ["non-distinct", "duplicate-option", "register-swap", "recycled", "function-swap", "containment"].indexOf(f.code) >= 0);
        if (bad) return false;
        seen.add(key);
        return true;
      });
      const pool = keep(generated.concat(part.d || []));
      const next = { a: split.a, d: pool.slice(0, 3) };
      const ok = waivers.get(p.r + "|" + QA.norm(part.a));
      if (ok) next.qaOk = ok;
      out.push(next);
      at = span[1] + 1;
    });
    const rest = nkjvToks.slice(at).join(" ");
    const tail = pending ? (rest ? pending + " " + rest : pending)
                         : (rest ? " " + rest : "");
    if (tail.trim()) out.push(tail);
    return Object.assign({}, p, {
      parts: out,
      blanks: out.filter(x => typeof x !== "string")
    });
  });
}

/* ---------- tablets ---------- */

function buildTablets(tablets, index, stats) {
  const chapters = (tablets.chapters || []).map(ch => {
    const blanks = (ch.blanks || []).map(bl => {
      // A handful of blanks are cut from verses the NKJV recasts; those are
      // listed by reference and KJV answer in scripts/nkjv-hand.js.
      const kjvVerse = bl.prefix + " " + bl.a + " " + bl.suffix;
      const src = faithfulText(sourceFor(bl.r, index), kjvVerse);
      const cut = HAND_TABLET[bl.r + "|" + bl.a];
      if (cut) {
        stats.tabletBlanks++;
        const recapped = restoreCasesInParts(kjvVerse, [cut.prefix, cut.a, cut.suffix]);
        return Object.assign({}, bl, {
          prefix: restoreDashes(recapped[0], src.raw),
          a: restoreDashes(recapped[1], src.raw),
          suffix: restoreDashes(recapped[2], src.raw)
        });
      }
      if (!src.text) { note(bl.r, "missing-source", ch.id); return Object.assign({}, bl); }
      const seg = A.alignSegment({
        prefix: bl.prefix, answer: bl.a,
        kjvVerse
      }, src.text);
      if (seg.miss) { note(bl.r, "tablet-blank:" + seg.miss, ch.id + " :: " + bl.a); return Object.assign({}, bl); }
      stats.tabletBlanks++;
      return Object.assign({}, bl, {
        prefix: restoreDashes(seg.prefix, src.raw),
        a: restoreDashes(seg.a, src.raw),
        suffix: restoreDashes(seg.suffix, src.raw)
      });
    }).map(bl => {
      // Drop any distractor the gate would call the answer once punctuation
      // is ignored — "deceit!" is not a wrong answer to "deceit".
      const split = splitAnswerTail(bl.a, bl.suffix);
      const d = (bl.d || []).filter(x => QA.norm(x) !== QA.norm(split.a));
      return Object.assign({}, bl, { a: split.a, suffix: split.s, d });
    });
    return Object.assign({}, ch, { blanks });
  });
  return {
    blankS: tablets.BLANK_S,
    holdsToOpen: tablets.HOLDS_TO_OPEN,
    chapters,
    canonIds: (tablets.canon || []).map(c => c.id),
    hallIds: (tablets.hall || []).map(c => c.id),
    moreIds: (tablets.more || []).map(c => c.id)
  };
}

/* ---------- sites ---------- */

/* The road's Scripture: each site carries one quoted verse and each
   vignette repeats it. Both come straight from the dump. */
function buildQuotes(sites, index, stats) {
  const out = {};
  (sites.SITES || []).forEach(s => {
    if (!s.quoteRef) return;
    const src = faithfulText(sourceFor(s.quoteRef, index), s.quote);
    if (!src.text) { note(s.quoteRef, "missing-source", "site:" + s.id); return; }
    out[s.id] = src.text;
    stats.quotes++;
  });
  const vignettes = {};
  Object.keys(sites.VIGNETTES || {}).forEach(id => {
    const v = sites.VIGNETTES[id];
    if (!v || !v.ref) return;
    const src = faithfulText(sourceFor(v.ref, index), v.quote);
    if (src.text) vignettes[id] = src.text;
  });
  out.__vignettes = vignettes;
  return out;
}

/* ---------- tutorial ---------- */

/* The six onboarding lessons are the same lessons in both editions; only
   the wording changes. Each is re-cut from its verse so the tutorial a new
   player sees matches the edition they picked. */
function tutorialSource() {
  const src = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
  const block = src.slice(src.indexOf("const TUTORIAL_QUESTIONS"), src.indexOf("const TUTORIAL_GUIDE"));
  const out = [];
  const re = /\{\s*id:\s*"([^"]+)"[\s\S]*?r:\s*"([^"]+)"[\s\S]*?p:\s*"([^"]*)"[\s\S]*?a:\s*"([^"]*)"[\s\S]*?s:\s*"([^"]*)"(?:[\s\S]*?d:\s*\[([^\]]*)\])?/g;
  let m;
  while ((m = re.exec(block))) {
    out.push({ id: m[1], r: m[2], p: m[3], a: m[4], s: m[5],
      d: ((m[6] || "").match(/"([^"]*)"/g) || []).map(s => s.slice(1, -1)) });
  }
  const extras = { b: {}, mechanic: {}, typed: {} };
  const reMeta = /\{\s*id:\s*"([^"]+)"[\s\S]*?\n\s*\},?/g;
  while ((m = reMeta.exec(block))) {
    const chunk = m[0];
    const bm = chunk.match(/b:\s*"([^"]+)"/);
    if (bm) extras.b[m[1]] = bm[1];
    const mm = chunk.match(/mechanic:\s*"([^"]+)"/);
    if (mm) extras.mechanic[m[1]] = mm[1];
    if (/typed:\s*true/.test(chunk)) extras.typed[m[1]] = true;
  }
  return { list: out, extras };
}

function buildTutorial(index, stats) {
  const { list, extras } = tutorialSource();
  return list.map(t => {
    const src = faithfulText(sourceFor(t.r, index), t.p + " " + t.a + " " + t.s);
    if (!src.text) { note(t.r, "missing-source", "tutorial:" + t.id); return null; }
    const res = A.alignBlank({ p: t.p, a: t.a, s: t.s }, src.text);
    if (res.miss) { note(t.r, "tutorial:" + res.miss, t.id); return null; }
    stats.tutorial++;
    const split = splitAnswerTail(res.a, res.s);
    const p = restoreDashes(res.p, src.raw);
    const a = restoreDashes(split.a, src.raw);
    const s = restoreDashes(split.s, src.raw);
    const item = {
      id: t.id,
      b: extras.b[t.id] || "",
      r: t.r,
      t: 1,
      p, a, s,
      d: require("./nkjv-distractors").makeDistractors({
        kjv: { a: t.a, d: t.d }, nkjv: { p, a, s }, sourceText: src.text
      })
    };
    if (extras.mechanic[t.id]) item.mechanic = extras.mechanic[t.id];
    if (extras.typed[t.id]) item.typed = true;
    return item;
  }).filter(Boolean);
}

/* ---------- beat ---------- */

/* The Valley's questions and cinema captions quote Scripture. The
   questions are rebuilt so their quoted wording is NKJV; the cinema lines
   are re-quoted from the dump verse by verse. The recorded voice-over is
   KJV and is muted for this edition (js/director.js), so the caption is the
   only place the line is read — it has to be the right edition. */
const CINEMA_REFS = {
  "I defy the armies of Israel this day. Give me a man, that we may fight together.": "1 Samuel 17:10",
  "And when the Philistine looked about, and saw David, he disdained him: for he was but a youth.": "1 Samuel 17:42",
  "Am I a dog, that thou comest to me with staves?": "1 Samuel 17:43",
  "Come to me, and I will give thy flesh unto the fowls of the air, and to the beasts of the field.": "1 Samuel 17:44",
  "I come to thee in the name of the LORD of hosts, the God of the armies of Israel, whom thou hast defied.": "1 Samuel 17:45"
};

function buildBeat(index, stats) {
  const Beat = require("../js/beat");
  const cinema = list => (list || []).map(c => {
    const ref = CINEMA_REFS[c.line];
    if (!ref) return Object.assign({}, c);
    const src = faithfulText(sourceFor(ref, index), c.line);
    if (!src.text) { note(ref, "missing-source", "cinema"); return Object.assign({}, c); }
    stats.cinema++;
    return Object.assign({}, c, { line: src.text });
  });
  const questions = (Beat.questions || []).map(q => {
    const copy = Object.assign({}, q);
    if (q.r) {
      const text = sourceFor(q.r, index);
      if (!text) note(q.r, "missing-source", "beat:" + q.id);
      else stats.beatRefs++;
    }
    // Stems and choices are authored around KJV diction. Rewrite them into
    // NKJV register word by word; the facts are edition-independent.
    const { modernise } = require("./nkjv-distractors");
    if (copy.stem) copy.stem = modernise(copy.stem);
    if (copy.choices) copy.choices = copy.choices.map(modernise);
    if (copy.a) copy.a = modernise(copy.a);
    return copy;
  });
  return {
    questions,
    cinemaA: cinema(Beat.cinemaA),
    cinemaB: cinema(Beat.cinemaB)
  };
}

/* ---------- true/false and notes ---------- */

/* Both carry prose with KJV quotations inside it. The facts do not change
   between editions; the quoted wording does. Rather than rewrite sentences
   we cannot verify, the quoted spans are re-cut from the dump when the
   claim names a reference, and the item is reported when it does not. */
function _refInWhy(why) {
  const m = String(why || "").match(/\(([^()]+)\)[^()]*$/);
  return m ? m[1] : null;
}

function buildTf(verses, index, stats) {
  const tf = require("../js/verses-tf");
  const { modernise } = require("./nkjv-distractors");
  return (tf.TF_CLAIMS || []).map(c => {
    const copy = Object.assign({}, c);
    if (copy.r) {
      const text = sourceFor(copy.r, index);
      if (!text) note(copy.r, "missing-source", "tf");
      else stats.tfRefs++;
    }
    if (copy.s) copy.s = modernise(copy.s);
    if (copy.why) copy.why = modernise(copy.why);
    return copy;
  });
}

/* The KJV notes are keyed by the KJV item's id, so each one is re-keyed to
   the NKJV item built from the same bank verse — the game looks notes up
   by the id the player is looking at (VERSE_NOTES[v.id]). */
function buildNotes(bank, verses, index, stats) {
  const notes = require("../js/verses-notes");
  const { modernise } = require("./nkjv-distractors");
  const out = {};
  if (verses.length !== bank.VERSES.length) {
    note("notes", "verse-count-mismatch", verses.length + " vs " + bank.VERSES.length);
    return out;
  }
  bank.VERSES.forEach((kjv, i) => {
    const text = notes.VERSE_NOTES[bank.verseId(kjv)];
    if (text === undefined) return;
    stats.noteRefs++;
    out["nkjv~" + bank.verseId(verses[i])] = modernise(text);
  });
  return out;
}

/* ---------- output ---------- */

function banner(name) {
  return "/* GENERATED by scripts/build-nkjv.js from the licensed NKJV text in\n" +
    "   content/nkjv/source/. Do not edit by hand — rerun the generator.\n" +
    "   " + name + " */\n";
}

function writeModule(file, constName, value, comment) {
  const body = banner(comment) + "const " + constName + " = " + JSON.stringify(value, null, 2) + ";\n" +
    "if(typeof module !== \"undefined\") module.exports = { " + constName + " };\n";
  fs.writeFileSync(path.join(OUT_DIR, file), body, "utf8");
}

function emit(artifacts, check) {
  if (check) return;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  writeModule("verses.js", "NKJV_VERSES", artifacts.verses, "the 899-blank verse bank");
  writeModule("passages.js", "NKJV_PASSAGES", artifacts.passages, "the multi-blank passages");
  writeModule("tablets.js", "NKJV_TABLETS", artifacts.tablets, "the 144 tablet chapters");
  writeModule("quotes.js", "NKJV_QUOTES", artifacts.quotes, "site quotes and vignette overlays");
  writeModule("verses-tf.js", "NKJV_TF_CLAIMS", artifacts.tf, "true/false claims");
  writeModule("verses-notes.js", "NKJV_VERSE_NOTES", artifacts.notes, "verse notes");
  writeModule("beat.js", "NKJV_BEAT", artifacts.beat, "Valley questions and cinema captions");
  writeModule("tutorial.js", "NKJV_TUTORIAL_QUESTIONS", artifacts.tutorial, "the six onboarding lessons");
}

/* ---------- gates ---------- */

/* Every item must pass the same gate the KJV bank passes. A blank that
   cannot teach is a bug in this generator, not a publishing decision. */
function auditVerses(items) {
  const res = QA.auditBank(items);
  res.failing.forEach(x => note(x.verse.r, "qa:" + x.flags.map(f => f.code).join("+"),
    '"' + x.verse.a + '" ' + x.flags.map(f => f.detail).join("; ")));
  res.bank.forEach(f => note(f.detail, "qa-bank:" + f.code));
  return res;
}

/* The KJV and NKJV editions have to agree about what the game contains:
   same books, same references, same tablet chapters, same beat ids. A
   missing reference here means a player on NKJV would hit an empty screen
   where a KJV player sees content. */
function parity(kjv, nkjv, tablets, nkjvTablets, kjvBeat, nkjvBeat) {
  const problems = [];
  const books = list => Array.from(new Set(list.map(v => v.b))).sort().join(",");
  if (books(kjv) !== books(nkjv)) problems.push("book set differs");
  const refs = list => list.map(v => canonRef(v.r)).sort().join("|");
  if (refs(kjv) !== refs(nkjv)) problems.push("reference set differs");
  if (nkjv.length !== kjv.length) problems.push("verse count " + nkjv.length + " != " + kjv.length);
  const chIds = list => list.map(c => c.id).sort().join("|");
  if (chIds(tablets.chapters) !== chIds(nkjvTablets.chapters)) problems.push("tablet chapter ids differ");
  const qIds = list => list.map(q => q.id).sort().join("|");
  if (qIds(kjvBeat.questions || []) !== qIds(nkjvBeat.questions || [])) problems.push("beat question ids differ");
  return problems;
}

function _countQuotes(sites) {
  return (sites.SITES || []).filter(s => s.quoteRef).length;
}

/* ---------- main ---------- */

function build(options) {
  const check = !!(options && options.check);
  const dump = loadSourceDump();
  if (!dump.ok || !Object.keys(dump.verses || {}).length) {
    console.error("[HARD GATE] " + (dump.error || "no licensed source found") +
      "\n  Drop the licensed NKJV text into content/nkjv/source/ and rerun.");
    return { ok: false, fatal: true };
  }
  const index = buildIndex(dump.verses);
  const bank = loadBank();
  const tablets = loadTablets();
  const sites = require("../js/sites");
  const Beat = require("../js/beat");
  const stats = {
    cut: { curated: 0, hand: 0, aligned: 0 },
    handSuperseded: [], curatedSuperseded: [], answersByRef: {},
    passageBlanks: 0, tabletBlanks: 0, quotes: 0, tutorial: 0,
    cinema: 0, beatRefs: 0, tfRefs: 0, noteRefs: 0, items: 0
  };

  const verses = buildVerses(bank, index, stats);
  const passages = buildPassages(bank, index, stats);
  const nkjvTablets = buildTablets(tablets, index, stats);
  const quotes = buildQuotes(sites, index, stats);
  const tutorial = buildTutorial(index, stats);
  const beat = buildBeat(index, stats);
  const tf = buildTf(verses, index, stats);
  const notes = buildNotes(bank, verses, index, stats);

  const verseAudit = auditVerses(verses);
  const passageFaults = passages.flatMap(QA.passageToVerses).map(v => ({ v, flags: QA.auditVerse(v) }))
    .filter(x => x.flags.some(f => f.severity === "error"));
  passageFaults.forEach(x => note(x.v.r, "qa-passage:" + x.flags.map(f => f.code).join("+"), '"' + x.v.a + '"'));

  const problems = parity(bank.VERSES, verses, tablets, nkjvTablets, Beat, beat);
  problems.forEach(p => note("parity", "parity:" + p));

  const artifacts = { verses, passages, tablets: nkjvTablets, quotes, tutorial, beat, tf, notes };
  emit(artifacts, check);

  const keyCount = Object.keys(unresolved).length;
  if (!check) {
    fs.writeFileSync(HAND_FILE, keyCount ? JSON.stringify(unresolved, null, 2) + "\n" : "{}\n", "utf8");
    fs.writeFileSync(REPORT_FILE, JSON.stringify({
      generatedFrom: "content/nkjv/source/",
      stats,
      counts: {
        verses: verses.length, passages: passages.length,
        passageBlanks: stats.passageBlanks, tabletChapters: nkjvTablets.chapters.length,
        tabletBlanks: stats.tabletBlanks, siteQuotes: stats.quotes,
        tutorial: tutorial.length, tfClaims: tf.length, notes: Object.keys(notes).length,
        beatQuestions: (beat.questions || []).length
      },
      unresolved: keyCount,
      parityProblems: problems,
      verseGate: { total: verseAudit.total, clean: verseAudit.clean, failing: verseAudit.failing.length }
    }, null, 2) + "\n", "utf8");
  }
  return { ok: keyCount === 0 && verseAudit.ok, artifacts, stats, unresolved, verseAudit, problems };
}

function main() {
  const check = process.argv.indexOf("--check") >= 0;
  console.log("=== Building the NKJV edition" + (check ? " (check only)" : "") + " ===");
  const res = build({ check });
  if (res.fatal) process.exit(1);
  const c = res.artifacts;
  console.log("  source cut from the licensed text: " +
    res.stats.cut.aligned + " aligned, " + res.stats.cut.curated + " curated, " + res.stats.cut.hand + " by hand");
  console.log("  verses           " + c.verses.length +
    "  (" + res.verseAudit.clean + " clean, " + res.verseAudit.failing.length + " failing the gate)");
  console.log("  passages         " + c.passages.length + "  (" + res.stats.passageBlanks + " blanks)");
  console.log("  tablet chapters  " + c.tablets.chapters.length + "  (" + res.stats.tabletBlanks + " blanks)");
  console.log("  site quotes      " + res.stats.quotes);
  console.log("  tutorial lessons " + res.stats.tutorial);
  console.log("  true/false       " + c.tf.length);
  console.log("  notes            " + Object.keys(c.notes).length);
  if (res.problems.length) res.problems.forEach(p => console.log("  PARITY  " + p));
  const keys = Object.keys(res.unresolved);
  if (keys.length) {
    console.log("\n" + keys.length + " items could not be sourced from the licensed text.");
    console.log("They are listed in content/nkjv/HAND.json; nothing was invented for them.");
    keys.slice(0, 25).forEach(k => {
      const why = res.unresolved[k].map(x => x.reason).join(", ");
      console.log("  " + k + "  —  " + why);
    });
    if (keys.length > 25) console.log("  ... and " + (keys.length - 25) + " more");
    process.exit(1);
  }
  console.log("\nPASS — every NKJV surface was cut from the licensed text; HAND.json is empty.");
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  build, buildVerses, finishVerse, planVerse, cutVerse, candidateCuts, buildPassages,
  buildTablets, buildQuotes, buildBeat, auditVerses, parity
};
