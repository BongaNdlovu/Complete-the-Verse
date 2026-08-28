/* Logic tests — grading a typed answer.
   The line this has to hold: forgive the thumb, never forgive the words. */
const Recall = require("../js/recall");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }
const verdict = (typed, answer) => Recall.grade(typed, answer).verdict;

/* ---------- normalisation ---------- */
{
  eq("case is ignored", Recall.normalize("The WORLD"), "the world");
  eq("punctuation is ignored", Recall.normalize("bless thee, and keep thee!"), "bless thee and keep thee");
  eq("whitespace collapses", Recall.normalize("  still   small   voice "), "still small voice");
  eq("curly apostrophes fold", Recall.normalize("the LORD’S"), "the lord's");
  eq("smart quotes fold", Recall.normalize("“heaven”"), "heaven");
  eq("empty input normalises to empty", Recall.normalize(""), "");
  eq("null input normalises to empty", Recall.normalize(null), "");
  eq("word split", Recall.words("still small voice").length, 3);
  eq("empty string has no words", Recall.words("").length, 0);
}

/* ---------- levenshtein ---------- */
{
  eq("identical strings have distance 0", Recall.levenshtein("abc", "abc"), 0);
  eq("one substitution", Recall.levenshtein("abc", "abd"), 1);
  eq("one insertion", Recall.levenshtein("abc", "abcd"), 1);
  eq("one deletion", Recall.levenshtein("abcd", "abc"), 1);
  eq("empty against full", Recall.levenshtein("", "abcd"), 4);
  eq("distance is symmetric", Recall.levenshtein("kitten", "sitting"), Recall.levenshtein("sitting", "kitten"));
  eq("classic case", Recall.levenshtein("kitten", "sitting"), 3);
}

/* ---------- exact matches ---------- */
{
  eq("exact", verdict("still small voice", "still small voice"), "exact");
  eq("exact ignoring case", verdict("STILL SMALL VOICE", "still small voice"), "exact");
  eq("exact ignoring punctuation", verdict("bless thee and keep thee", "bless thee, and keep thee"), "exact");
  eq("exact ignoring surrounding space", verdict("  the world  ", "the world"), "exact");
  eq("exact with curly apostrophe", verdict("the LORD’S", "the LORD'S"), "exact");
}

/* ---------- typos are forgiven ---------- */
{
  eq("single typo in a long phrase", verdict("bless thee, and keeep thee", "bless thee, and keep thee"), "close");
  eq("transposed letters", verdict("stlil small voice", "still small voice"), "close");
  eq("missing letter", verdict("evrlasting life", "everlasting life"), "close");
  ok("a forgiven answer still counts as correct", Recall.isCorrect(verdict("keeep thee", "keep thee")));
  ok("a close answer reports the exact wording",
     Recall.grade("evrlasting life", "everlasting life").hint.length > 0);
}

/* ---------- wrong words are not forgiven ---------- */
{
  eq("a different word is wrong", verdict("still small sound", "still small voice"), "wrong");
  eq("a different phrase is wrong", verdict("the kingdom of God", "the kingdom of heaven"), "wrong");
  eq("empty is wrong", verdict("", "the world"), "wrong");
  eq("whitespace only is wrong", verdict("   ", "the world"), "wrong");
  ok("a wrong answer is not correct", !Recall.isCorrect(verdict("nonsense here", "the world")));
  // The one that matters most: a near-synonym is a different verse.
  eq("heaven vs heavens is wrong", verdict("heavens and the earth", "heaven and the earth"), "wrong");
  eq("was with God is not was God", verdict("was with God", "was God"), "wrong");
}

/* ---------- inflections are words, not typos ---------- */
{
  ok("plural s is an inflection", Recall.isInflectionOf("heaven", "heavens"));
  ok("-eth is an inflection", Recall.isInflectionOf("walk", "walketh"));
  ok("-ed is an inflection", Recall.isInflectionOf("love", "loved"));
  ok("a mid-word slip is not an inflection", !Recall.isInflectionOf("keeep", "keep"));
  ok("an unrelated word is not an inflection", !Recall.isInflectionOf("thy", "thine"));
  ok("identical words are not inflections", !Recall.isInflectionOf("keep", "keep"));

  eq("plural is rejected however small the edit", verdict("the words", "the word"), "wrong");
  eq("-eth is rejected", verdict("he walketh", "he walk"), "wrong");
  ok("the rejection names both forms",
     /reads "word"/.test(Recall.grade("the words", "the word").hint),
     Recall.grade("the words", "the word").hint);
  // The guard must not swallow ordinary typos in the same phrase.
  eq("a real typo beside an unchanged word still counts",
     verdict("the wrod of God", "the word of God"), "close");
}

/* ---------- the verse's own distractors are never forgiven ---------- */
{
  const d = ["heavens and the earth", "earth and the heaven", "heavens and earth"];
  eq("typing a distractor exactly is wrong",
     Recall.grade("earth and the heaven", "heaven and the earth", d).verdict, "wrong");
  ok("the rejection says why",
     /is not/.test(Recall.grade("earth and the heaven", "heaven and the earth", d).hint));
  eq("a typo of the answer still passes with distractors present",
     Recall.grade("heaven and the earht", "heaven and the earth", d).verdict, "close");
  eq("the exact answer still passes with distractors present",
     Recall.grade("heaven and the earth", "heaven and the earth", d).verdict, "exact");
  // Something closer to a distractor than to the answer is a wrong recall.
  eq("drifting toward a distractor is wrong",
     Recall.grade("living being", "living soul", ["living being","living spirit","soul that liveth"]).verdict,
     "wrong");
}

/* ---------- modernised wording is flagged, not accepted ---------- */
{
  const g = Recall.grade("bless you, and keep you", "bless thee, and keep thee");
  eq("thee -> you is reported as modernised", g.verdict, "modernised");
  ok("modernised does NOT count as correct", !Recall.isCorrect(g.verdict));
  ok("modernised explains itself", /older wording/i.test(g.hint), g.hint);
  eq("thy -> your is modernised", verdict("your own understanding", "thine own understanding"), "modernised");
  eq("hath -> has is modernised", verdict("he has spoken", "he hath spoken"), "modernised");
  eq("unto -> to is modernised", verdict("opened to you", "opened unto you"), "modernised");
  // Archaic-for-archaic is a real error, not a register slip.
  eq("thy for thine is a plain error", verdict("thy own understanding", "thine own understanding"), "close");
}

/* ---------- tolerance scales with length ---------- */
{
  ok("short answers get a tight budget", Recall.tolerance("gold") === 1, Recall.tolerance("gold"));
  ok("longer answers get more room", Recall.tolerance("bless thee, and keep thee") > Recall.tolerance("gold"));
  ok("tolerance is monotonic",
     Recall.tolerance("a") <= Recall.tolerance("a much longer phrase entirely here"));
  // A budget large enough to swallow a whole short word would be a bug.
  const short = "the world";
  ok("tolerance never spans a whole word of a short answer",
     Recall.tolerance(short) < Math.min(...short.split(" ").map(w => w.length)) + 1,
     Recall.tolerance(short));
}

/* ---------- hints ---------- */
{
  const a = "still small voice";
  const h1 = Recall.hint(a, 1), h2 = Recall.hint(a, 2), h3 = Recall.hint(a, 3);
  ok("level 1 hides every letter", !/[a-z]/i.test(h1), h1);
  ok("level 1 shows the word count", h1.split(/\s+/).filter(Boolean).length === 3, h1);
  ok("level 2 gives first letters", /s/.test(h2) && /v/.test(h2), h2);
  ok("level 3 gives the first half of the words", /still/.test(h3) && /small/.test(h3), h3);
  ok("hints never reveal the answer", h1 !== a && h2 !== a && h3 !== a);
  ok("level 3 still withholds the rest", h3.indexOf("voice") < 0, h3);
}

console.log((fail ? "FAIL" : "PASS") + " — recall · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
