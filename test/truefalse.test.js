/* The Judgement (true/false claim) contracts: the claim bank stays
   scripturally anchored, slot 6 of every pilgrimage site renders it,
   and the mechanic never touches verse mastery, SRS or the review
   queue — a claim miss is a claim miss, not a verse miss. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

const { TF_CLAIMS } = require(path.join(ROOT, "js", "verses-tf.js"));
const play = read("js/play.js");
const game = read("js/game.js");
const index = read("index.html");
const playCss = read("css/play.css");
const versesSrc = read("js/verses.js");

const failures = [];
let assertions = 0;
function assert(condition, message){ assertions++; if(!condition) failures.push(message); }

/* ---------- 1. claim bank integrity ---------- */
assert(Array.isArray(TF_CLAIMS) && TF_CLAIMS.length >= 100,
  "claim bank launches with at least 100 claims (got " + TF_CLAIMS.length + ")");

const seen = new Set();
TF_CLAIMS.forEach(function(c, i){
  assert(c && typeof c.s === "string" && c.s.length >= 12 && c.s.length <= 140,
    "claim " + i + " statement is a readable sentence");
  assert(typeof c.v === "boolean", "claim " + i + " verdict is boolean");
  assert(typeof c.why === "string" && c.why.length >= 20,
    "claim " + i + " carries a correction that can teach");
  /* Every correction anchors the player back to scripture — either a
     parenthesized reference or an explicit note that scripture is
     silent (for the plausible-but-unbiblical flavor). */
  assert(/\([^()]*\d[^()]*\)/.test(c.why) || /scriptures/i.test(c.why),
    "claim " + i + " correction cites scripture: " + c.s);
  assert(/[.?!]"?$/.test(c.s), "claim " + i + " statement ends like a claim");
  assert(!seen.has(c.s), "no duplicate claim statements: " + c.s);
  seen.add(c.s);
});

const BOOKS = versesSrc.match(/const BOOKS_ORDER = \[([^\]]+)\]/)[1]
  .split(",").map(s => s.trim().replace(/^"|"$/g, ""));
TF_CLAIMS.forEach(function(c, i){
  assert(BOOKS.indexOf(c.b) >= 0, "claim " + i + " territory book is canonical: " + c.b);
});

const falseCount = TF_CLAIMS.filter(c => !c.v).length;
assert(falseCount > 0 && (TF_CLAIMS.length - falseCount) > 0,
  "bank holds both true and false claims");
assert(falseCount / TF_CLAIMS.length >= 0.35 && falseCount / TF_CLAIMS.length <= 0.6,
  "bank false share stays balanced for the 65% draw weighting (got " +
  (falseCount / TF_CLAIMS.length * 100).toFixed(1) + "%)");

/* All four tricky flavors are represented. */
assert(TF_CLAIMS.some(c => /father|brother|daughter|son|wife|cousin|nephew|mother/i.test(c.s) && !c.v),
  "swapped-relationship flavor present");
assert(TF_CLAIMS.some(c => /never|not in the twelve|nowhere/i.test(c.why)),
  "plausible-but-unbiblical flavor present");
assert(TF_CLAIMS.some(c => /\b(twenty|thirty|forty|fifty|seven|three|six|eight|ten|two)\b/i.test(c.s)),
  "place & number flavor present");
assert(TF_CLAIMS.filter(c => !c.v).length >= 40, "wrong-doer & inversion density is high enough");

/* ---------- 2. slot 6 wiring ---------- */
assert(/if\(idx === 6 && typeof TF_CLAIMS !== "undefined" && TF_CLAIMS\.length\) return "truefalse";/.test(play),
  "slot 6 of every pilgrimage site becomes the Judgement");
assert(/if\(idx === 2\) return "strike";/.test(play) && /if\(idx === 5\) return "fade";/.test(play),
  "strike/cloze/duel/fade slots are untouched");
assert(/if\(mechanic === "truefalse"\) return renderTrueFalseQuestion\(q, dur, scene\);/.test(play),
  "renderQuestion dispatches the truefalse mechanic");
assert(/R\.currentMechanic = "truefalse";/.test(play), "renderer marks the mechanic for powers and keys");

/* ---------- 3. balance levers ---------- */
assert(/armTimer\(Math\.round\(dur \* 0\.65\)\)/.test(play) && /startTimer\(Math\.round\(dur \* 0\.65\)\)/.test(play),
  "the Judgement clock tightens to ~65% of the site's own beat");
assert(/const wantFalse = Math\.random\(\) < 0\.65;/.test(play),
  "draws weight toward false claims (~65%) so players must scrutinize");
assert(/Math\.random\(\) < 0\.75/.test(play),
  "territory claims dominate, with a general-mix quarter for freshness");
assert(/const window = Math\.max\(1, Math\.min\(40,/.test(play) &&
  /while\(R\.tfUsed\.length > window\) R\.tfUsed\.shift\(\);/.test(play),
  "no-repeat is a bounded window that can never starve the rolled verdict");

/* ---------- 4. verse-system isolation ---------- */
assert(/R\.currentMechanic === "truefalse" && R\.tf\)\{[\s\S]*?resolveTrueFalse\(null, null, true\)/.test(play),
  "a timed-out Judgement resolves as a failed claim, never as a missed verse");
const timeUpSrc = play.slice(play.indexOf("function timeUp"));
assert(!/if\(R\.currentMechanic === "truefalse"[\s\S]{0,400}R\.missed\.push/.test(timeUpSrc),
  "the un-asked slot 6 verse never enters the review queue");
assert(/const tf = \$\("tf-stage"\); if\(tf\) tf\.style\.display = "none";/.test(play) &&
  /R\.tf = null;/.test(play),
  "leaving the Judgement clears its stage and state");
assert(/tf: null, tfUsed: \[\],/.test(game),
  "every run starts with a clean Judgement slate");
assert(/resolveTrueFalse[\s\S]*?R\.attempts\+\+/.test(play) &&
  !/function resolveTrueFalse[\s\S]{0,2500}recordVerse\(/.test(play),
  "claims count toward attempts and score but never record verse mastery");

/* ---------- 5. input, powers, presentation ---------- */
assert(/\$\("tf-true"\)/.test(play) && /\$\("tf-false"\)/.test(play),
  "TRUE/FALSE buttons are addressable");
assert(/k === "t" \|\| k === "arrowleft" \|\| k === "1"/.test(game) &&
  /k === "f" \|\| k === "arrowright" \|\| k === "2"/.test(game),
  "T/F plus arrow and number keys answer the Judgement");
assert(/R\.currentMechanic === "truefalse" && typeof illuminateTrueFalse === "function"/.test(game) &&
  /if\(R\.currentMechanic === "truefalse"\) return "reveal judgement";/.test(game) &&
  /if\(R\.currentMechanic === "truefalse"\) return !!\(R\.tf && R\.tf\.illuminated\);/.test(game),
  "Illuminate marks the true judgement through the standard power flow");
assert(/function illuminateTrueFalse\(\)\{[\s\S]*?illum-cue/.test(play),
  "Illuminate cues the correct button visually");
assert(/'<b>' \+ \(claim\.v \? "TRUE" : "FALSE"\) \+ '<\/b> — ' \+ esc\(claim\.why\)/.test(play),
  "a miss shows the verdict plus the anchor-verse correction");

assert(/<div class="tf-stage" id="tf-stage" style="display:none"><\/div>/.test(index),
  "the Judgement has its own stage container");
assert(/<script src="js\/verses-tf\.js"><\/script>/.test(index) &&
  index.indexOf("js/verses-tf.js") > index.indexOf("js/verses-ascent.js") &&
  index.indexOf("js/verses-tf.js") < index.indexOf("js/passages.js"),
  "the claim bank loads with the other content files");
assert(/\.tf-stage\s*\{/.test(playCss) && /\.tf-claim\s*\{/.test(playCss) &&
  /\.tf-btn\s*\{/.test(playCss) && /\.tf-why\s*\{/.test(playCss),
  "Judgement presentation styles are shipped");
assert(/\.tf-btn\.right\s*\{[\s\S]*?--green/.test(playCss) && /\.tf-btn\.bad\s*\{[\s\S]*?--crimson-hot/.test(playCss),
  "resolution states reuse the duel verdict palette");

/* ---------- 6. behavioral: picker honors territory, weighting, no-repeat ---------- */
function extractFn(src, name){
  const start = src.indexOf("function " + name + "(");
  if(start < 0) return null;
  const open = src.indexOf("{", start);
  let depth = 0;
  for(let j = open; j < src.length; j++){
    if(src[j] === "{") depth++;
    else if(src[j] === "}"){ depth--; if(depth === 0) return src.slice(start, j + 1); }
  }
  return null;
}
const pickerSrc = extractFn(play, "tfPickClaim");
assert(pickerSrc, "tfPickClaim is extractable for behavioral checks");

if(pickerSrc){
  function runPicker(siteVerses, picks){
    const sandbox = { TF_CLAIMS: TF_CLAIMS, Math: Math, R: { siteVerses: siteVerses, tfUsed: [] } };
    vm.createContext(sandbox);
    vm.runInContext(pickerSrc + "; __out = []; for(var q=0; q<" + picks + "; q++){ __out.push(tfPickClaim()); }", sandbox);
    return sandbox.__out;
  }

  /* Weighting is a per-question promise: a run judges roughly one claim
     per site against a fresh pool, so odds are measured the way real
     runs experience them — many site visits, one draw each. */
  const allBooks = TF_CLAIMS.map(c => ({ b: c.b }));
  let falseDraws = 0, genesisDraws = 0;
  const VISITS = 500;
  for(let v = 0; v < VISITS; v++){
    const one = runPicker(allBooks, 1);
    if(one[0] && !one[0].v) falseDraws++;
    const g = runPicker([{ b: "Genesis" }], 1);
    if(g[0] && g[0].b === "Genesis") genesisDraws++;
  }
  const falseShare = falseDraws / VISITS;
  assert(falseShare >= 0.55 && falseShare <= 0.75,
    "a fresh question is false ~65% of the time (got " + (falseShare * 100).toFixed(1) + "%)");
  const genesisShare = genesisDraws / VISITS;
  assert(genesisShare >= 0.6,
    "a Genesis site mostly judges Genesis claims (got " + (genesisShare * 100).toFixed(1) + "%)");

  /* Marathon regression: one endless session of 400 sequential draws —
     more than three full drains of the old no-repeat design. The
     bounded window must keep the verdict weighting alive throughout,
     while still preventing near-term repeats. */
  const marathon = runPicker(allBooks, 400);
  const marathonFalse = marathon.filter(c => !c.v).length / marathon.length;
  assert(marathonFalse >= 0.55 && marathonFalse <= 0.75,
    "a marathon session keeps the ~65% false weighting (got " + (marathonFalse * 100).toFixed(1) + "%)");
  let repeatInWindow = false;
  for(let i = 1; i < marathon.length && !repeatInWindow; i++){
    for(let j = Math.max(0, i - 40); j < i; j++){
      if(marathon[i].s === marathon[j].s){ repeatInWindow = true; break; }
    }
  }
  assert(!repeatInWindow, "no claim repeats within the 40-draw no-repeat window");
}

if(failures.length){
  console.error("FAIL (" + failures.length + ")");
  failures.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — true/false judgement · " + assertions + " contracts passed");
