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
const strike = {id:"mechanic-strike",b:"Genesis",r:"Genesis 1:1",t:1,
  p:"the",a:"the earth",s:".",d:["stone"]};
const verse = sb._els.verse || read("$(\"verse\")");
let buttons = [];
function prepareStrike(){
  buttons = [0,1,2,3].map(i => {
    const b = makeElement("strike-" + i);
    b.dataset.idx = String(i);
    return b;
  });
  verse.querySelectorAll = () => buttons;
  sb.__question = strike;
  run("Object.assign(R,{q:__question,locked:false,running:true,paused:false,sceneToken:7,runToken:1,attempts:0,correct:0,missed:[],rescheduled:[],lives:2})");
  run("renderStrikeQuestion(__question,10000,7)");
}
prepareStrike();
const strikeHtml = read("$(\"verse\").innerHTML");
assert("strike renders keyboard-accessible controls", strikeHtml.includes('type="button"') && strikeHtml.includes('aria-label="Verse word'));
assert("strike does not expose the answer marker", !strikeHtml.includes("data-corrupt") && !strikeHtml.includes("corrupt-target"));
assert("strike targets the answer position", read("R.strike.targetIndex") === 1 && read("R.strike.fakeWord") === "stone");
assert("strike renders exactly one injected position", (strikeHtml.match(/data-idx=/g) || []).length === 4);

run("R.powers={selah:1,illum:1,wind:0}; usePower('illum')");
assert("Illuminate narrows Strike to a half", read("R.strike.illuminated === true && R.strike.hintHalf === 'first' && R.powers.illum === 0"));

buttons[0].click();
assert("strike wrong click locks the question", read("R.locked === true && R.running === false"));
assert("strike wrong click counts one attempt", read("R.attempts === 1 && R.missed.length === 1"));
assert("strike wrong click costs one life", read("R.lives === 1"));

let scheduled = [];
sb.setTimeout = fn => { scheduled.push(fn); return scheduled.length; };
sb.clearTimeout = () => {};
prepareStrike();
buttons[1].click();
assert("strike correct click schedules a guarded reveal", scheduled.length >= 1 && read("R.locked === true"));
if(scheduled[0]) scheduled.shift()();
assert("strike correct click resolves as a correct answer", read("R.correct === 1 && R.attempts === 1 && R.rescheduled.length === 1"));

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
assert("fade starts with a 30-second memorization phase", read("R.fadePhase === 'memorize' && $(\"fade-bar\").textContent.includes('30s') && R.tTotal === 30000"));
assert("fade keeps options hidden during memorization", read("$(\"opts\").style.opacity === '0' && $(\"opts\").style.pointerEvents === 'none'"));
if(fadeCallback) for(let i=0;i<30;i++) fadeCallback();
assert("fade holds the answer during the dissolve", read("$(\"blank\").classList.contains('fade-dissolve')"));
if(fadeTimers[0]) fadeTimers.shift()();
assert("fade enters full-verse reconstruction", read("R.fadePhase === 'reconstruct' && R.typed === true && R.fadeAssembly.target === 'And the earth was without form and void.'"));
assert("fade creates one slot for every verse word", read("R.assemble.target.length === 8 && R.assemble.placed.length === 8 && R.assemble.bank.length === 8"));
run("R.powers={selah:1,illum:1,wind:0}; usePower('illum')");
assert("Illuminate reveals the next Fade word", read("R.fadeAssembly.hintIndex === 0 && R.powers.illum === 0"));

const cloze = {id:"mechanic-cloze",b:"Genesis",r:"Genesis 1:3",t:1,
  p:"And God said",a:"Let there be light",s:".",d:["Let the earth be still"]};
sb.__question = cloze;
run("Object.assign(R,{q:__question,locked:false,running:true,paused:false,sceneToken:14,runToken:4,powers:{selah:1,illum:1,wind:0}}); renderClozeQuestion(__question,10000,14); usePower('illum')");
assert("Illuminate reveals the next Cloze word", read("R.cloze.hintIndex === 0 && R.cloze.words[0] === 'Let' && R.powers.illum === 0"));

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
if(fadeCallback) for(let i=0;i<30;i++) fadeCallback();
assert("fade interval is cleared when the run is invalidated", clearedFade);
assert("stale fade callback cannot restore answer controls", read("$(\"opts\").style.opacity === '0' && $(\"opts\").style.pointerEvents === 'none'"));

if(fails.length){
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — question mechanics · strike positions/lockout · fade lifecycle · keyboard semantics · Psalms normalization");
