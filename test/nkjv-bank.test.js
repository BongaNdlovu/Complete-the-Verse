/* ==================================================================
   NKJV BANK — the NKJV edition has to clear the same bar as the KJV one.

   The KJV bank is gated by scripts/qa-verses.js against scripts/verse-qa.js,
   which is what stops a blank that teaches nothing from shipping. This suite
   applies the identical gate to the NKJV store and additionally pins the
   parity the two editions owe each other: the same books, the same
   references, the same tablet chapters, the same Beat questions. A missing
   reference here is a screen where an NKJV player sees nothing and a KJV
   player sees content.
   ================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const { loadBank } = require("../scripts/load-bank");
const QA = require("../scripts/verse-qa");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

const kjv = loadBank("kjv");
const nkjv = loadBank("nkjv");

ok("the NKJV bank exists", !nkjv.empty && Array.isArray(nkjv.VERSES) && nkjv.VERSES.length > 0,
  nkjv.empty ? "js/nkjv/verses.js is missing" : nkjv.VERSES && nkjv.VERSES.length);
if (nkjv.empty) {
  console.log("FAIL — nkjv bank · " + pass + " passed · " + (fail + 1) + " failed (no bank to inspect)");
  process.exit(1);
}

/* ---------- completeness ---------- */

eq("NKJV covers every KJV verse", nkjv.VERSES.length, kjv.VERSES.length);
eq("NKJV carries the same passages", (nkjv.PASSAGES || []).length, (kjv.PASSAGES || []).length);

const bookSet = list => Array.from(new Set(list.map(v => v.b))).sort();
eq("NKJV spans the same 66 books", bookSet(nkjv.VERSES).join(","), bookSet(kjv.VERSES).join(","));
eq("NKJV spans 66 books", bookSet(nkjv.VERSES).length, 66);

const refKey = r => String(r || "").replace(/^Psalm\b/, "Psalms").replace(/\s+/g, " ").trim();
const kjvRefs = kjv.VERSES.map(v => refKey(v.r)).sort().join("|");
const nkjvRefs = nkjv.VERSES.map(v => refKey(v.r)).sort().join("|");
eq("NKJV covers the same references", nkjvRefs, kjvRefs);

const tiers = list => list.map(v => v.t).sort((a, b) => a - b).join(",");
eq("NKJV keeps every tier assignment", tiers(nkjv.VERSES), tiers(kjv.VERSES));

/* ---------- the gate ---------- */

const audit = QA.auditBank(nkjv.VERSES);
eq("NKJV verse bank passes the content gate", audit.failing.length, 0);
eq("NKJV has no bank-level duplicates", audit.bank.length, 0);
if (audit.failing.length) {
  audit.failing.slice(0, 12).forEach(x => {
    console.log("      " + x.verse.r + ' "' + x.verse.a + '"  ' +
      x.flags.filter(f => f.severity === "error").map(f => f.code).join(","));
  });
}

const passageBlanks = (nkjv.PASSAGES || []).flatMap(QA.passageToVerses);
const passageAudit = QA.auditBank(passageBlanks);
eq("NKJV passage blanks pass the content gate", passageAudit.failing.length, 0);
if (passageAudit.failing.length) {
  passageAudit.failing.slice(0, 8).forEach(x => {
    console.log("      passage " + x.verse.r + ' "' + x.verse.a + '"  ' +
      x.flags.filter(f => f.severity === "error").map(f => f.code).join(","));
  });
}

/* Every blank is playable: three options, one of them the answer, and the
   answer is not also offered as a distractor. */
const badOptions = nkjv.VERSES.filter(v => !Array.isArray(v.d) || v.d.length !== 3);
eq("every NKJV blank offers exactly three distractors", badOptions.length, 0);
const answerInOptions = nkjv.VERSES.filter(v => (v.d || []).some(d => QA.norm(d) === QA.norm(v.a)));
eq("no NKJV blank offers its own answer as a distractor", answerInOptions.length, 0);
const emptyAnswers = nkjv.VERSES.filter(v => !String(v.a || "").trim());
eq("no NKJV blank has an empty answer", emptyAnswers.length, 0);

/* ---------- the text really is NKJV ---------- */

/* Genesis 2:7 is the clearest witness in the whole bank: the KJV says man
   became "a living soul" and the NKJV says "a living being". If the NKJV
   store returns the KJV wording, the aligner silently fell back. */
const gen27 = nkjv.VERSES.find(v => refKey(v.r) === "Genesis 2:7");
ok("Genesis 2:7 is present in the NKJV bank", !!gen27);
if (gen27) {
  eq("Genesis 2:7 blank is NKJV wording", gen27.a, "living being");
  ok("Genesis 2:7 does not use the KJV blank", gen27.a !== "living soul", gen27.a);
  ok("Genesis 2:7 offerings include the KJV reading",
    (gen27.d || []).indexOf("living soul") >= 0, gen27.d);
}

/* A sample spread across the canon, each one a place the two editions are
   known to part company. */
const WITNESSES = [
  ["Genesis 1:1", "heavens and the earth"],
  ["Exodus 20:3", "before Me"],
  ["Psalm 23:1", "not want"],
  ["Isaiah 40:31", "eagles"],
  ["John 1:1", "was God"],
  ["Romans 6:23", "eternal life"],
  ["1 Peter 2:9", "His own special people"]
];
WITNESSES.forEach(([ref, expected]) => {
  const v = nkjv.VERSES.find(x => refKey(x.r) === refKey(ref));
  if (!v) { ok("witness " + ref + " is present", false); return; }
  eq("witness " + ref + " carries NKJV wording", v.a, expected);
});

/* The NKJV is a modern-register edition. A blank written in the KJV's
   second-person archaic forms means the KJV text leaked through. */
const ARCHAIC = ["thou", "thee", "thy", "thine", "ye", "hath", "doth", "saith",
  "shalt", "wilt", "hast", "art", "dost", "whosoever", "shew"];
const leaked = nkjv.VERSES.filter(v => {
  const text = QA.tokens(String(v.p) + " " + String(v.a) + " " + String(v.s));
  return text.some(w => ARCHAIC.indexOf(w) >= 0);
});
/* A handful are legitimate: the NKJV keeps archaic forms inside direct
   address to God, and proper nouns like "Shewbread" are not register. */
ok("NKJV blanks are not written in KJV register", leaked.length <= 12,
  { count: leaked.length, sample: leaked.slice(0, 6).map(v => v.r + ' "' + v.a + '"') });

/* ---------- tablets, quotes, beat ---------- */

const kjvTablets = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "content", "tablets.json"), "utf8"));
const { NKJV_TABLETS } = require("../js/nkjv/tablets.js");
ok("NKJV tablet chapters exist", Array.isArray(NKJV_TABLETS.chapters) && NKJV_TABLETS.chapters.length > 0);
eq("NKJV has the same tablet chapters", NKJV_TABLETS.chapters.length, kjvTablets.chapters.length);
eq("NKJV tablet chapter ids match",
  NKJV_TABLETS.chapters.map(c => c.id).sort().join("|"),
  kjvTablets.chapters.map(c => c.id).sort().join("|"));

const kjvBlankCount = kjvTablets.chapters.reduce((n, c) => n + (c.blanks || []).length, 0);
const nkjvBlankCount = NKJV_TABLETS.chapters.reduce((n, c) => n + (c.blanks || []).length, 0);
eq("NKJV tablet blank count matches", nkjvBlankCount, kjvBlankCount);

/* Every tablet blank has to be answerable: the answer must not also be
   sitting in the options, and it must not be empty. */
const tabProblems = [];
NKJV_TABLETS.chapters.forEach(ch => (ch.blanks || []).forEach(bl => {
  if (!bl.a || !String(bl.a).trim()) tabProblems.push(ch.id + " empty answer");
  if ((bl.d || []).some(d => QA.norm(d) === QA.norm(bl.a))) tabProblems.push(ch.id + " answer in options: " + bl.a);
  if (!Array.isArray(bl.d) || bl.d.length < 2) tabProblems.push(ch.id + " too few options: " + bl.a);
}));
eq("every NKJV tablet blank is answerable", tabProblems.length, 0);
if (tabProblems.length) tabProblems.slice(0, 10).forEach(p => console.log("      " + p));

const { NKJV_QUOTES } = require("../js/nkjv/quotes.js");
const siteIds = require("../js/sites.js").SITES.filter(s => s.quoteRef).map(s => s.id).sort();
const quoteIds = Object.keys(NKJV_QUOTES).filter(k => k !== "__vignettes").sort();
eq("every site with a quote has an NKJV quote", quoteIds.join("|"), siteIds.join("|"));

const { NKJV_BEAT } = require("../js/nkjv/beat.js");
const Beat = require("../js/beat.js");
eq("NKJV keeps every Beat question", (NKJV_BEAT.questions || []).length, (Beat.questions || []).length);
eq("NKJV Beat question ids match",
  (NKJV_BEAT.questions || []).map(q => q.id).sort().join("|"),
  (Beat.questions || []).map(q => q.id).sort().join("|"));
eq("NKJV keeps every cinema plate",
  (NKJV_BEAT.cinemaA || []).length + (NKJV_BEAT.cinemaB || []).length,
  (Beat.cinemaA || []).length + (Beat.cinemaB || []).length);

/* ---------- the tutorial ---------- */

const { NKJV_TUTORIAL_QUESTIONS } = require("../js/nkjv/tutorial.js");
eq("NKJV has six tutorial lessons", NKJV_TUTORIAL_QUESTIONS.length, 6);
eq("NKJV tutorial ids match the KJV lessons",
  NKJV_TUTORIAL_QUESTIONS.map(q => q.id).sort().join("|"),
  ["tutorial-assemble", "tutorial-choice", "tutorial-cloze", "tutorial-duel",
    "tutorial-fade", "tutorial-passage-ref"].sort().join("|"));
const kjvTutorial = nkjvTutorialRefs();
function nkjvTutorialRefs() {
  const src = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
  const block = src.slice(src.indexOf("const TUTORIAL_QUESTIONS"), src.indexOf("const TUTORIAL_GUIDE"));
  const out = [];
  const re = /id:\s*"([^"]+)"[\s\S]*?r:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block))) out.push(m[2]);
  return out.sort();
}
eq("NKJV tutorial verses match the KJV lessons",
  NKJV_TUTORIAL_QUESTIONS.map(q => q.r).sort().join("|"), kjvTutorial.join("|"));

const tutorialAnswers = {};
NKJV_TUTORIAL_QUESTIONS.forEach(q => { tutorialAnswers[q.id] = q.a; });
eq("NKJV lesson one answer", tutorialAnswers["tutorial-choice"], "shall not want");
eq("NKJV lesson two answer", tutorialAnswers["tutorial-passage-ref"], "own understanding");
eq("NKJV lesson three answer", tutorialAnswers["tutorial-cloze"], "God created the heavens and the earth");
eq("NKJV lesson four answer", tutorialAnswers["tutorial-duel"], "was God");
eq("NKJV lesson five answer", tutorialAnswers["tutorial-fade"], "strengthens me");
eq("NKJV lesson six answer", tutorialAnswers["tutorial-assemble"], "rejoice and be glad in it");

/* ---------- Missing Passage integrity ---------- */

/* The screen joins the parts with "" and fills a blank with its answer
   verbatim, so every string part has to carry its own spaces (KJV does) and
   no prose may print a blank's answer beside it. */

const wordsOf = t => String(t).toLowerCase().replace(/[\u2019']/g, "")
  .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);

(nkjv.PASSAGES || []).forEach(p => {
  p.parts.forEach((part, i) => {
    const next = p.parts[i + 1];
    if (typeof part === "string") {
      const endsAtBlank = next && typeof next !== "string";
      const endsAtEnd = i === p.parts.length - 1;
      ok(p.r + " part " + i + " keeps its spacing before a blank",
        endsAtBlank ? /\s$/.test(part) : endsAtEnd, JSON.stringify(part));
    } else if (next !== undefined) {
      const tail = typeof next === "string" ? next : "";
      ok(p.r + " blank " + i + " is followed by a separator",
        typeof next !== "string" || /^[.,;:!?"'”’]/.test(tail) || /^\s/.test(tail),
        JSON.stringify(String(tail).slice(0, 20)));
    }
  });
  const proseWords = p.parts.filter(x => typeof x === "string").flatMap(wordsOf);
  p.blanks.forEach(bl => {
    const bw = wordsOf(bl.a);
    const leak = bw.length && proseWords.some((w, i) =>
      i + bw.length <= proseWords.length && bw.every((x, k) => proseWords[i + k] === x));
    ok(p.r + " does not print the answer '" + bl.a + "' in its prose", !leak);
    const bare = !/[.,;:!?]["']?$/.test(String(bl.a).trim());
    const told = bare && (bl.d || []).some(d =>
      /[.,;:!?]["']?$/.test(String(d).trim()) &&
      wordsOf(d).join(" ") !== wordsOf(bl.a).join(" "));
    ok(p.r + " blank '" + bl.a + "' has no punctuation tell", !told, JSON.stringify(bl.d));
  });
});

/* ---------- the manual file ---------- */

const handPath = path.join(ROOT, "content", "nkjv", "HAND.json");
ok("content/nkjv/HAND.json exists", fs.existsSync(handPath));
if (fs.existsSync(handPath)) {
  const raw = fs.readFileSync(handPath, "utf8").trim();
  let hand = null;
  try { hand = JSON.parse(raw); } catch (e) { hand = "unparseable"; }
  ok("content/nkjv/HAND.json is valid JSON", hand !== "unparseable", raw.slice(0, 80));
  eq("content/nkjv/HAND.json is empty", raw.replace(/\s+/g, ""), "{}");
}

if (fail) {
  console.log("FAIL — nkjv bank · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — nkjv bank · " + pass + " assertions · verses=" + nkjv.VERSES.length +
  " tablets=" + NKJV_TABLETS.chapters.length);
