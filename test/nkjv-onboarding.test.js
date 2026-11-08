/* ==================================================================
   NKJV ONBOARDING — the twin of test/onboarding.test.js for the second
   edition.

   The tutorial is the first thing a new player meets, and its six answers
   are hard-coded KJV phrasings in js/play.js. If the edition swap does not
   reach TUTORIAL_QUESTIONS, a player who chose NKJV is taught KJV wording
   and then graded against it — the one place the mistake is guaranteed to
   be seen. This boots the real modules, switches edition, and checks the
   lessons that come back.
   ================================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

/* Same prefix the edition suite boots, plus the NKJV data modules in the
   order index.html loads them: before edition.js, which snapshots both
   stores the first time an edition is activated. */
const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/verses-tf.js", "js/beat.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js",
  "js/nkjv/verses.js", "js/nkjv/passages.js", "js/nkjv/verses-tf.js",
  "js/nkjv/verses-notes.js", "js/nkjv/tablets.js", "js/nkjv/quotes.js",
  "js/nkjv/beat.js", "js/nkjv/tutorial.js",
  "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js", "js/live.js", "js/atlas.js", "js/tablets.js"
];

function boot() {
  const sb = makeSandbox();
  const src = PREFIX.concat(ENGINE_FILES).map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });
  return sb;
}
const read = (sb, expr) => vm.runInContext(expr, sb);
const exec = (sb, code) => vm.runInContext(code, sb);

/* ---------- the modules are on the page ---------- */

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
/* Perf: the NKJV data (~1.1 MB) is written into the page only for players
   whose save says nkjv, but every file must still be offered, and the gate
   must sit before edition.js so the written tags keep their load order. */
[
  "js/nkjv/verses.js", "js/nkjv/passages.js", "js/nkjv/verses-tf.js",
  "js/nkjv/verses-notes.js", "js/nkjv/tablets.js", "js/nkjv/quotes.js",
  "js/nkjv/beat.js", "js/nkjv/tutorial.js"
].forEach(f => {
  ok("index.html offers " + f, html.indexOf('"' + f + '"') >= 0);
});
ok("the NKJV pack gate reads the save", html.indexOf('localStorage.getItem("ctv_save_v3")') >= 0);
ok("the NKJV pack gate loads before edition.js",
  html.indexOf('localStorage.getItem("ctv_save_v3")') >= 0 &&
  html.indexOf('localStorage.getItem("ctv_save_v3")') < html.indexOf('src="js/edition.js"'));
ok("a runtime switch fetches the pack first", html.indexOf("ensureNkjvData") >= 0 || fs.readFileSync(path.join(ROOT, "js", "briefs.js"), "utf8").indexOf("ensureNkjvData") >= 0);

const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
ok("the service worker precaches the NKJV verse bank", sw.indexOf('"js/nkjv/verses.js"') >= 0);
ok("the service worker precaches edition.js", sw.indexOf('"js/edition.js"') >= 0);

/* ---------- the swap ---------- */

const sb = boot();

eq("a fresh save has not chosen an edition yet", read(sb, "SAVE.set.translationChosen"), false);
eq("a fresh save defaults to KJV", read(sb, "SAVE.set.translation"), "kjv");

const kjvLessons = read(sb, "TUTORIAL_QUESTIONS.map(function(q){ return q.a; })");
eq("KJV tutorial starts on the KJV reading", kjvLessons[0], "shall not want");
eq("KJV lesson five is the KJV verb form", kjvLessons[4], "strengtheneth me");

exec(sb, "Edition.selectEdition('nkjv')");
eq("picking NKJV records the choice", read(sb, "SAVE.set.translationChosen"), true);
eq("picking NKJV records the edition", read(sb, "SAVE.set.translation"), "nkjv");
eq("the active edition is NKJV", read(sb, "Edition.getEdition()"), "nkjv");
eq("the tag reads NKJV", read(sb, "Edition.translationTag()"), "NKJV");

const nkjvLessons = read(sb, "TUTORIAL_QUESTIONS.map(function(q){ return q.a; })");
const nkjvIds = read(sb, "TUTORIAL_QUESTIONS.map(function(q){ return q.id; })");
eq("the NKJV tutorial still has six lessons", nkjvLessons.length, 6);
eq("the NKJV tutorial keeps the lesson ids",
  nkjvIds.join("|"),
  "tutorial-choice|tutorial-passage-ref|tutorial-cloze|tutorial-duel|tutorial-fade|tutorial-assemble");

/* One assertion per lesson, naming the wording each edition actually uses. */
eq("lesson one teaches the NKJV phrase", nkjvLessons[0], "shall not want");
eq("lesson two teaches the NKJV phrase", nkjvLessons[1], "own understanding");
eq("lesson three teaches the NKJV phrase", nkjvLessons[2], "God created the heavens and the earth");
eq("lesson four teaches the NKJV phrase", nkjvLessons[3], "was God");
eq("lesson five teaches the NKJV verb form", nkjvLessons[4], "strengthens me");
eq("lesson six teaches the NKJV phrase", nkjvLessons[5], "rejoice and be glad in it");

ok("lesson three is no longer the KJV reading",
  nkjvLessons[2] !== "God created the heaven and the earth", nkjvLessons[2]);
ok("lesson five is no longer the KJV reading",
  nkjvLessons[4] !== "strengtheneth me", nkjvLessons[4]);

/* The lesson contexts have to be NKJV too — an NKJV answer inside a KJV
   sentence is worse than either edition on its own. */
const lessonTwoP = read(sb, "TUTORIAL_QUESTIONS[1].p");
ok("lesson two context drops the archaic pronouns",
  !/\b(thine|thou|thy|hath|doth)\b/i.test(lessonTwoP), lessonTwoP);
const lessonFourP = read(sb, "TUTORIAL_QUESTIONS[3].p");
ok("lesson four context is the NKJV wording",
  lessonFourP.indexOf("In the beginning was the Word") >= 0, lessonFourP);

/* Every lesson must be answerable in the edition it teaches. */
const unanswerable = read(sb, `
  TUTORIAL_QUESTIONS.filter(function(q){
    return !q.a || !Array.isArray(q.d) || q.d.indexOf(q.a) >= 0;
  }).map(function(q){ return q.id; })
`);
eq("no NKJV lesson offers its own answer as a distractor", unanswerable.join(","), "");

/* ---------- switching back ---------- */

exec(sb, "Edition.selectEdition('kjv')");
eq("switching back restores the edition", read(sb, "Edition.getEdition()"), "kjv");
eq("switching back restores the KJV lessons",
  read(sb, "TUTORIAL_QUESTIONS.map(function(q){ return q.a; })").join("|"),
  kjvLessons.join("|"));
eq("selecting an edition marks the choice on the save",
  read(sb, "SAVE.set.translationChosen"), true);

/* ---------- the reload ---------- */

/* Nothing used to re-apply a saved edition at startup: a returning NKJV
   player found KJV text wearing an NKJV label. enterCoffeePath is the one
   door every post-boot path (menu, sign-in, resume) walks through, and it
   must re-activate the saved edition before the first screen is served. */
{
  const reload = boot();
  exec(reload, `
    SAVE.set.translation = "nkjv";
    SAVE.set.translationChosen = true;
    enterCoffeePath();
  `);
  eq("a reload with NKJV saved re-activates the edition",
    read(reload, "Edition.getEdition()"), "nkjv");
  eq("a reload with NKJV saved serves NKJV wording",
    read(reload, `(function(){ const v = VERSES.find(x => x.id === "nkjv~genesis-2-7~living-being"); return v ? v.a : "(no such verse)"; })()`),
    "living being");
  eq("a reload with NKJV saved serves the NKJV lessons",
    read(reload, "TUTORIAL_QUESTIONS[4].a"), "strengthens me");
  ok("a reload with NKJV saved serves the NKJV passages",
    read(reload, `(function(){
      const p = PASSAGES.find(x => x.r === "John 3:16");
      return !!p && p.parts.map(function(x){ return typeof x === "string" ? x : x.a; }).join("")
        .indexOf("should not perish but have") >= 0;
    })()`));

  // Control: a first run with nothing chosen never touches the KJV bank
  const fresh = boot();
  exec(fresh, "enterCoffeePath()");
  ok("a first run with nothing chosen keeps the KJV bank",
    read(fresh, "VERSES.every(v => String(v.id).indexOf('nkjv~') !== 0)"));
}

/* ---------- the late switch ---------- */

/* index.html writes the NKJV pack only when the save said nkjv at boot. A
   device that booted KJV and then pulled an NKJV cloud save reaches
   enterCoffeePath with no NKJV globals: it must fetch the pack before it
   activates, or KJV text wears the NKJV label. A second request while the
   fetch is in flight joins it rather than writing the tags twice. */
{
  const NKJV_FILES = PREFIX.filter(f => f.indexOf("js/nkjv/") === 0);
  const sb = makeSandbox();
  const src = PREFIX.filter(f => f.indexOf("js/nkjv/") !== 0).concat(ENGINE_FILES)
    .map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle-no-nkjv.js" });
  ok("the late-switch boot starts without the NKJV pack", read(sb, "typeof NKJV_VERSES") === "undefined");

  /* The shim's body records children; a script tag "loads" by running its
     file in the sandbox once the test lets it. */
  const loaded = [];
  const queue = [];
  sb.document.body.appendChild = function(el){
    loaded.push(el.src);
    queue.push(el);
    return el;
  };
  function drain(){
    while(queue.length){
      const el = queue.shift();
      vm.runInContext(fs.readFileSync(path.join(ROOT, el.src), "utf8"), sb, { filename: el.src });
      if(typeof el.onload === "function") el.onload();
    }
  }
  exec(sb, `
    SAVE.set.translation = "nkjv";
    SAVE.set.translationChosen = true;
    globalThis.__joined = 0;
    enterCoffeePath();
    Edition.ensureNkjvData(function(){ globalThis.__joined++; });
  `);
  drain();
  eq("a late NKJV switch fetches every pack file once", loaded.join(","), NKJV_FILES.join(","));
  eq("a second request joins the fetch in flight", read(sb, "__joined"), 1);
  eq("a late NKJV switch serves NKJV wording",
    read(sb, `(function(){ const v = VERSES.find(x => x.id === "nkjv~genesis-2-7~living-being"); return v ? v.a : "(no such verse)"; })()`),
    "living being");
  eq("a late NKJV switch serves the NKJV lessons", read(sb, "TUTORIAL_QUESTIONS[4].a"), "strengthens me");
}

if (fail) {
  console.log("FAIL — nkjv onboarding · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — nkjv onboarding · " + pass + " assertions");
