/**
 * Answering — single-tap answers and word-level diff on typed misses.
 * Run: node answering.test.js
 *
 * The word-diff is pure (require("../js/recall")). The single-tap wiring is
 * asserted against the source text, matching the structural-test convention
 * (game.js runs DOM code on load and cannot be require()d in bare Node).
 */
const fs = require("fs");
const path = require("path");
const Recall = require("../js/recall");

const ROOT = require("../scripts/repo-root");
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }
function eq(name, got, want) { assert(got === want, name + " (got " + JSON.stringify(got) + ", want " + JSON.stringify(want) + ")"); }

/* The engine is split across module files; static checks read the
   concatenation through the one shared list (scripts/engine-source.js). */
const { readEngine } = require("../scripts/engine-source");
const game = readEngine(ROOT);

/* ---------------- word-level diff (pure) ---------------- */
const d1 = Recall.wordDiff("the lord is my shepard", "the lord is my shepherd");
assert(d1 && d1.index === 4 && d1.typed === "shepard" && d1.expected === "shepherd",
  "diff reports the changed word (got " + JSON.stringify(d1) + ")");
const d2 = Recall.wordDiff("heavens and the earth", "heaven and the earth");
assert(d2 && d2.typed === "heavens" && d2.expected === "heaven",
  "diff reports the inflection as the differing word");
eq("identical phrase has no diff", Recall.wordDiff("the lord is my shepherd", "the lord is my shepherd"), null);

/* The plain "wrong" verdict carries a diff; close/exact/modernised do not need one. */
const wrong = Recall.grade("the lord is my rock", "the lord is my shepherd", []);
eq("plain wrong verdict", wrong.verdict, "wrong");
assert(wrong.diff && wrong.diff.typed === "rock" && wrong.diff.expected === "shepherd",
  "wrong verdict carries a word diff (got " + JSON.stringify(wrong.diff) + ")");
const close = Recall.grade("the lord is my shepard", "the lord is my shepherd", []);
eq("typo is still counted close", close.verdict, "close");
const exact = Recall.grade("the lord is my shepherd", "the lord is my shepherd", []);
eq("exact is exact", exact.verdict, "exact");

/* ---------------- single-tap answering (wiring) ---------------- */
assert(/singleTap:true/.test(game), "single-tap answers are the default");
assert(/SAVE\.set\.singleTap !== false/.test(game), "a tap answers unless the player opts out");
assert(/SetPieces\.autoLock\(\) \|\| SAVE\.set\.singleTap !== false/.test(game),
  "single-tap and Rapid Recall share one auto-answer path");
assert(/One-tap answer/.test(game), "the confirm button says One-tap answer in single-tap mode");
assert(/Tap a phrase to answer/.test(game), "the hint says tap-to-answer");
assert(/function diffSentence/.test(game), "diffSentence helper exists");
assert(/diffSentence\(g\.diff\)/.test(game), "the wrong typed verdict surfaces the word diff");
assert(/seg\("singleTap"/.test(game), "the setting is exposed under Settings");
assert(/Select a phrase, then lock it/.test(game), "the opt-out mode keeps the select-then-lock hint");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — answering · single-tap · word diff");
