/* Trailing commas, semicolons, and periods are not a different word.
   A reconstructed passage is the line the player built, not the fragment
   index they happened to pick up. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const seq = require("../js/sequences");

let pass = 0, fail = 0;
function ok(name, condition, extra){
  if(condition) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra ? " -> " + extra : ""));
  }
}

const match = seq.verseTokensMatch;
const refrain = "his mercy endureth for ever";

ok("period on the refrain still matches", match(refrain + ".", refrain));
ok("comma on the refrain still matches", match(refrain + ",", refrain));
ok("semicolon on the refrain still matches", match(refrain + ";", refrain));
ok("case and extra space still match", match("  His  Mercy endureth for ever. ", refrain));
ok("a different word does not match", !match("his truth endureth for ever", refrain));
ok("a fused word does not match", !match("his mercy endureth forever", refrain));
ok("a colon is kept", !match("he is good:", "he is good"));
ok("a question mark is kept", !match("heaven?", "heaven"));
ok("an apostrophe is kept", !match("LORD's", "LORDS"));
ok("empty input does not match", !match("", refrain) && !match("   ", refrain) && !match(null, refrain));
ok("I AM THAT I AM stays distinct from I AM WHO I AM",
  !match("I AM THAT I AM", "I AM WHO I AM"));
ok("bless thee, and keep thee stays distinct from the reversed line",
  !match("bless thee, and keep thee", "keep thee, and bless thee"));
ok("bless thee, and keep thee stays distinct from hold thee",
  !match("bless thee, and keep thee", "bless thee, and hold thee"));
ok("the comma inside bless thee is ignored only as a token tail",
  match("bless thee, and keep thee", "bless thee and keep thee"));

ok("a sequence matches line by line after trailing punctuation",
  seq.verseSequencesMatch(
    ["those few sheep in the wilderness.", "that thou mightest see the battle"],
    ["those few sheep in the wilderness", "that thou mightest see the battle"]
  ));
ok("a swapped sequence does not match",
  !seq.verseSequencesMatch(
    ["that thou mightest see the battle", "those few sheep in the wilderness"],
    ["those few sheep in the wilderness", "that thou mightest see the battle"]
  ));
ok("a short sequence does not match",
  !seq.verseSequencesMatch(["for ever."], ["for ever.", "for ever"]));

const frags = [
  "O give thanks unto the LORD; for he is good:",
  "for his mercy endureth for ever.",
  "O give thanks unto the God of gods:",
  "for his mercy endureth for ever"
];
const swapped = seq.gradeReconstruction([0, 3, 2, 1], frags);
ok("swapped refrain copies still rebuild the passage", swapped.whole === true && swapped.right === 4,
  JSON.stringify(swapped));
ok("every swapped refrain slot is accepted", swapped.slotOk.every(Boolean));

const exact = seq.gradeReconstruction([0, 1, 2, 3], frags);
ok("the authored order is still whole", exact.whole === true && exact.right === 4);

const disordered = seq.gradeReconstruction([1, 0, 2, 3], frags);
ok("a disordered passage is not whole", disordered.whole === false && disordered.right < 4,
  JSON.stringify(disordered));

const timedOut = seq.gradeReconstruction([null, null, null, null], frags);
ok("an empty reconstruction scores nothing", timedOut.whole === false && timedOut.right === 0);

const sameRefrain = ["Give thanks", "for his mercy endureth for ever", "Give thanks", "for his mercy endureth for ever"];
const sameSwap = seq.gradeReconstruction([0, 3, 2, 1], sameRefrain);
ok("identical refrain fragments are interchangeable", sameSwap.whole === true && sameSwap.right === 4);

function loadNames(rel, names){
  const file = path.join(ROOT, rel);
  const src = fs.readFileSync(file, "utf8");
  const grab = names.map(function(n){ return "this." + n + "=" + n + ";"; }).join("");
  const sb = {};
  vm.runInNewContext(src + "\n" + grab, sb, { filename: rel });
  return sb;
}

function choiceCollisions(list, label){
  const hits = [];
  (list || []).forEach(function(v){
    (v.d || []).forEach(function(d){
      if(match(d, v.a)) hits.push(label + " " + v.r + " [" + v.a + "] ~ [" + d + "]");
    });
  });
  return hits;
}

const banks = [
  ["js/verses.js", "VERSES", "KJV"],
  ["js/verses-more.js", "VERSES_MORE", "more"],
  ["js/verses-extra.js", "VERSES_EXTRA", "extra"],
  ["js/verses-ascent.js", "VERSES_ASCENT", "ascent"],
  ["js/nkjv/verses.js", "NKJV_VERSES", "NKJV"]
];
const hits = [];
banks.forEach(function(row){
  const loaded = loadNames(row[0], [row[1]]);
  hits.push.apply(hits, choiceCollisions(loaded[row[1]], row[2]));
});
ok("no published wrong option matches its answer after token folding", hits.length === 0, hits.slice(0, 8).join(" | "));

const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");
const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/verses-tf.js", "js/beat.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js", "js/live.js", "js/atlas.js"
];
const sandbox = makeSandbox();
vm.runInContext(
  PREFIX.concat(ENGINE_FILES).map(function(f){
    return fs.readFileSync(path.join(ROOT, f), "utf8");
  }).join("\n;\n"),
  sandbox,
  { filename: "token-match-bundle.js" }
);
const live = vm.runInContext(`(function(){
  const frags = [
    "O give thanks unto the LORD; for he is good:",
    "for his mercy endureth for ever.",
    "O give thanks unto the God of gods:",
    "for his mercy endureth for ever"
  ];
  const slots = document.getElementById("recon-slots");
  const slotEls = frags.map(function(){
    const el = document.createElement("div");
    el.className = "slot full";
    const sp = document.createElement("span");
    sp.textContent = "placed";
    el.appendChild(sp);
    el.querySelector = function(){ return sp; };
    return el;
  });
  slots.querySelectorAll = function(){ return slotEls; };
  R.running = true;
  R.locked = false;
  R.qStart = performance.now();
  R.disp = 0;
  R.score = 0;
  R.correct = 0;
  R.streak = 0;
  R.best = 0;
  R.booksRun = new Set();
  R.missed = [];
  R.mode = "practice";
  R.diff = { score: 1 };
  R.setpiece = {};
  R.recon = { slots: [0, 3, 2, 1], frags: frags, p: { b: "Psalms", id: "psalm-136" } };
  resolveRecon();
  const restored = { correct: R.correct, streak: R.streak };
  const cloze = gradeQuestionChoice(
    { a: "his mercy endureth for ever", d: ["his truth endureth for ever"] },
    "his mercy endureth for ever.",
    null
  );
  const distinct = gradeQuestionChoice(
    { a: "I AM THAT I AM", d: ["I AM WHO I AM"] },
    "I AM WHO I AM",
    null
  );
  R.typed = false;
  const missEls = frags.map(function(){
    const el = document.createElement("div");
    el.className = "slot full";
    const sp = document.createElement("span");
    sp.textContent = "placed";
    el.appendChild(sp);
    el.querySelector = function(){ return sp; };
    return el;
  });
  slots.querySelectorAll = function(){ return missEls; };
  R.lives = 3;
  R.recon = { slots: [1, 0, 2, 3], frags: frags, p: { b: "Psalms", id: "psalm-136" } };
  resolveRecon();
  R.typed = true;
  const typed = gradeQuestionChoice({ a: "his mercy endureth for ever", d: [] }, "forever", null);
  return {
    classes: slotEls.map(function(el){ return el.classList.contains("ok") ? "ok" : (el.classList.contains("no") ? "no" : "other"); }),
    texts: slotEls.map(function(el){ return el.querySelector("span").textContent; }),
    correct: restored.correct,
    streak: restored.streak,
    cloze: cloze.ok,
    distinct: distinct.ok,
    typed: typed.ok,
    miss: missEls.map(function(el){ return el.classList.contains("no") ? "no" : "ok"; }),
    shown: missEls.map(function(el){ return el.querySelector("span").textContent; }),
    lives: R.lives
  };
})()`, sandbox);
ok("a swapped refrain is marked correct on the page", live.correct === 1 && live.streak === 1 &&
  live.classes.every(function(c){ return c === "ok"; }), JSON.stringify(live));
ok("a correct refrain slot keeps the player's fragment", live.texts.every(function(t){ return t === "placed"; }));
ok("a cloze line with a trailing period is accepted", live.cloze === true);
ok("a different divine name is still wrong", live.distinct === false);
ok("typed recall is left to its own grader", live.typed === false);
ok("a disordered passage is still marked wrong", live.miss[0] === "no" && live.miss[1] === "no" &&
  live.miss[2] === "ok" && live.miss[3] === "ok" && live.lives === 2 &&
  live.shown[0].indexOf("O give thanks unto the LORD") === 0,
  JSON.stringify({ miss: live.miss, shown: live.shown, lives: live.lives }));

const play = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
const sequences = fs.readFileSync(path.join(ROOT, "js", "sequences.js"), "utf8");
ok("cloze and fade grade through the token matcher", play.includes("function choiceMatchesVerse") &&
  play.includes("verseTokensMatch(choice, targetRaw)") &&
  play.includes("const ok = choiceMatchesVerse(choice, targetRaw)"));
ok("beat sequences compare token lists", play.includes("verseSequencesMatch(R.beatFilled, item.blanks)") &&
  play.includes("verseSequencesMatch(R.beatOrder, R.q.order)"));
ok("reconstruction grades the rebuilt line", sequences.includes("gradeReconstruction(st.slots, st.frags)") &&
  !sequences.includes("f===i") && !sequences.includes("slots[i]===i"));
ok("passage blanks stay an exact phrase", /function fillBlank[\s\S]*const ok = val === b\.a;/.test(sequences));

if(fail){
  console.log("FAIL — token match · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — token match · " + pass + " assertions passed");
