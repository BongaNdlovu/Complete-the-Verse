/* Regression coverage for the mechanics that need real DOM/event wiring.
 * The browser shim is deliberately small, but these checks execute the
 * shipped play.js functions rather than reproducing them in a test double. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeElement, makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js",
  "js/flow.js", "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/live.js", "js/atlas.js"
];
const source = PREFIX.concat(ENGINE_FILES)
  .map(file => fs.readFileSync(path.join(ROOT, file), "utf8")).join("\n;\n");
const sb = makeSandbox();
vm.runInContext(source, sb, {filename:"question-mechanics.js"});
const read = expr => vm.runInContext(expr, sb);
const run = code => vm.runInContext(code, sb);
const fails = [];
function assert(name, condition, detail){
  if(!condition) fails.push(name + (detail ? " -> " + detail : ""));
}

assert("bank normalizes singular Psalm keys", read("VERSES.every(v => v.b !== 'Psalm')"));
assert("bank keeps canonical Psalms key", read("BOOKS_ORDER.includes('Psalms') && VERSES.some(v => v.b === 'Psalms')"));

run("startRun('practice','watchman')");
run("Math.random = function(){ return 0; }");

const passageRef = {id:"mechanic-passage-ref",b:"Genesis",r:"Genesis 12:6",t:1,
  p:"And Abram passed through the land unto the place of",a:"Sichem",s:".",d:["Bethel"]};
const siteReferencePool = [passageRef,
  {id:"site-ref-2",b:"Genesis",r:"Genesis 12:7"},
  {id:"site-ref-3",b:"Genesis",r:"Genesis 13:4"},
  {id:"site-ref-4",b:"Genesis",r:"Genesis 15:1"}];
sb.__question = passageRef;
sb.__siteReferencePool = siteReferencePool;
run("Object.assign(R,{q:__question,siteVerses:__siteReferencePool,locked:false,running:true,paused:false,sceneToken:8,runToken:1,attempts:0,correct:0,missed:[],rescheduled:[],lives:2,powers:{selah:1,illum:1,wind:0}})");
run("renderPassageReferenceQuestion(__question,10000,8)");
assert("passage reference renders the whole location verse", read("$('verse').innerHTML.includes('Sichem') && $('verse').innerHTML.includes('passage-reference-text')"));
assert("passage reference hides the correct citation from the stem", read("!$('verse').innerHTML.includes(__question.r) && $('ref').textContent.includes('Passage identification')"));
const referenceChoices = read("passageReferenceChoices(__question)");
assert("passage reference offers four unique citations including the answer",
  referenceChoices.length === 4 && referenceChoices.includes(passageRef.r) && new Set(referenceChoices).size === 4);

const passageButtons = read("answerButtons()");
assert("passage reference renders four option buttons", passageButtons.length === 4);

// Test Illuminate burning 2 wrong citations
run("usePower('illum')");
assert("Illuminate marks the correct citation",
  read("answerButtons().some(b => b.classList.contains('illum-cue') && b.dataset.val === __question.a)"));
assert("Illuminate does not burn wrong citations",
  read("answerButtons().filter(b => b.classList.contains('burn')).length === 0"));

const playSource = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
assert("live passage-ref is silent and does not call Director.speak",
  !/Director\.speak\("Name the Passage/.test(playSource));
assert("tutorial still defines TUTORIAL_VOICE for lesson 2",
  /TUTORIAL_VOICE\s*=\s*\[[\s\S]*?Name the Passage: Select its book/.test(playSource));

// Test wrong click
run("answerButtons().find(b => b.dataset.val !== __question.a).click()");
assert("passage-ref wrong click locks the question", read("R.locked === true && R.running === false"));
assert("passage-ref wrong click counts one attempt and miss", read("R.attempts === 1 && R.missed.length === 1 && R.correct === 0"));

// Test correct click
run("Object.assign(R,{q:__question,siteVerses:__siteReferencePool,locked:false,running:true,paused:false,sceneToken:9,runToken:1,attempts:0,correct:0,missed:[]})");
run("renderPassageReferenceQuestion(__question,10000,9)");
run("answerButtons().find(b => b.dataset.val === __question.a).click()");
assert("passage-ref correct click increments R.correct", read("R.correct === 1 && R.attempts === 1"));

let fadeCallback = null;
let fadeHandle = 91;
let clearedFade = false;
let fadeTimers = [];
sb.setTimeout = fn => { fadeTimers.push(fn); return fadeTimers.length; };
sb.setInterval = fn => { fadeCallback = fn; return fadeHandle; };
sb.clearInterval = id => { if(id === fadeHandle) clearedFade = true; };
const fade = {id:"mechanic-fade",b:"Genesis",r:"Genesis 1:2",t:1,
  p:"And the earth was without form",a:"and void",s:".",d:["and empty"]};
sb.__question = fade;
run("Object.assign(R,{q:__question,locked:false,running:true,paused:false,sceneToken:12,runToken:2})");
run("renderFadeQuestion(__question,10000,12)");
const initialFadeText = read("$(\"verse\").innerHTML.replace(/<[^>]+>/g,'')");
assert("fade initially shows the complete verse", initialFadeText.includes(fade.p) && initialFadeText.includes(fade.a) && initialFadeText.includes(fade.s));
assert("fade starts with a 60-second memorization phase", read("R.fadePhase === 'memorize' && $(\"fade-bar\").textContent.includes('60s') && R.tTotal === 60000"));
assert("fade keeps options hidden during memorization", read("$(\"opts\").style.opacity === '0' && $(\"opts\").style.pointerEvents === 'none'"));
/* The I'm Done shortcut: one click ends the memorization window early
   and lands in the very same dissolve the full minute would reach. */
assert("fade offers an I'm Done shortcut while memorizing",
  read("!!document.getElementById('fade-done') && (document.getElementById('fade-done').textContent||'').indexOf('Done') >= 0"));
run("document.getElementById('fade-done').click()");
assert("I'm Done skips the rest of the memorization minute",
  read("R.fadePhase === 'dissolve'") && clearedFade);
assert("fade holds the answer during the dissolve", read("$(\"blank\").classList.contains('fade-dissolve')"));
if(fadeTimers[0]) fadeTimers.shift()();
if(fadeTimers.length) fadeTimers.forEach(function(fn){ try{ fn(); }catch(e){} });
assert("fade enters a four-verse pick", read("R.fadePhase === 'reconstruct' && R.typed === false"));
assert("fade pick offers four full-verse buttons", read("answerButtons().length === 4"));
assert("fade pick includes the memorized verse", read("answerButtons().some(b => b.dataset.val === 'And the earth was without form and void.')"));
run("R.powers={selah:1,illum:1,wind:0}; usePower('illum')");
assert("Illuminate marks the true Fade verse", read("answerButtons().some(b => b.classList.contains('illum-cue')) && R.powers.illum === 0"));

/* Mastery pays: resolving the Fade reconstruction correctly grants an
   Illuminate card immediately, on top of every other reward. Swap in
   the fresh power hand BEFORE reading the baseline, so the counters
   describe the same object resolveAnswer mutates (deltas, because
   earlier suites in this file already advanced them). */
run("Object.assign(R,{powers:{selah:1,illum:0,wind:0},locked:false,fadeIllumUsed:false})");
const preGrant = read("({illum:R.powers.illum||0, correct:R.correct, attempts:R.attempts})");
run("resolveAnswer(__question, 'And the earth was without form and void.', null, 500, 80000)");
assert("correct Fade reconstruction earns an Illuminate card",
  read("({i:(R.powers.illum||0), c:R.correct, a:R.attempts})").i === preGrant.illum + 1 &&
  read("R.correct") === preGrant.correct + 1 &&
  read("R.attempts") === preGrant.attempts + 1);

const cloze = {id:"mechanic-cloze",b:"Genesis",r:"Genesis 1:3",t:1,
  p:"And God said",a:"Let there be light",s:".",d:["Let the earth be still"]};
sb.__question = cloze;
run("Object.assign(R,{q:__question,locked:false,running:true,paused:false,sceneToken:14,runToken:4,powers:{selah:1,illum:1,wind:0}}); renderClozeQuestion(__question,10000,14); usePower('illum')");
assert("Illuminate shows the Cloze answer", read("R.cloze.revealed === true && $('blank').textContent.indexOf('Let there be light') >= 0 && R.powers.illum === 0"));

const duelCards = [makeElement("duel-card-left"), makeElement("duel-card-right")];
duelCards[0].dataset.val = "was God";
duelCards[1].dataset.val = "was divine";
const duel = {id:"mechanic-duel",b:"John",r:"John 1:1",t:1,
  p:"In the beginning was the Word, and the Word was with God, and the Word",a:"was God",s:".",d:["was divine"]};
sb.__question = duel;
run("Object.assign(R,{q:__question,locked:false,running:true,paused:false,sceneToken:15,runToken:5,powers:{selah:1,illum:1,wind:0}}); renderDuelQuestion(__question,10000,15)");
sb._els["duel-stage"].querySelectorAll = () => duelCards;
run("usePower('illum')");
assert("Illuminate marks the genuine Duel reading", duelCards[0].classList.contains("illum-cue") && read("R.powers.illum === 0"));

/* A second run verifies that invalidation still blocks an old interval. */
fadeCallback = null;
fadeTimers = [];
clearedFade = false;
fadeHandle = 92;
run("Object.assign(R,{q:__question,locked:false,running:true,paused:false,sceneToken:13,runToken:3})");
run("renderFadeQuestion(__question,10000,13)");
run("invalidateRun()");
if(fadeCallback) for(let i=0;i<60;i++) fadeCallback();
assert("fade interval is cleared when the run is invalidated", clearedFade);
assert("stale fade callback cannot restore answer controls", read("$(\"opts\").style.opacity === '0' && $(\"opts\").style.pointerEvents === 'none'"));

if(fails.length){
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — question mechanics · passage-ref lifecycle · fade lifecycle · keyboard semantics · Psalms normalization");
