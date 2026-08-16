/**
 * Unlock ceremony, tricky choices, timer SFX windows.
 * Run: node gameplay-polish.test.js
 */
const fs = require("fs");
const path = require("path");
const Polish = require("./js/polish");

const root = __dirname;
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

const game = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
const atlas = fs.readFileSync(path.join(root, "js", "atlas.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "atlas.css"), "utf8");
const gameCss = fs.readFileSync(path.join(root, "css", "game.css"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

/* --- timer SFX --- */
assert(/stopPressure/.test(game), "Snd.stopPressure exists");
assert(/Strict countdown SFX/.test(game) || /10–6 soft tick/.test(game) || /sec>=6 && sec<=10/.test(game),
  "strict tick windows");
assert(/lastHeartSec/.test(game), "heart once per second via lastHeartSec");
assert(/sec>=1 && sec<=3/.test(game), "heart only in last 3 seconds");
assert(/stopPressure\(\)/.test(game), "stopPressure called from stopTimer");
assert(!/frac<=\.55/.test(game) || /Strict countdown/.test(game),
  "no mid-question 55% tick as primary path");

/* --- similar choices --- */
assert(/function buildChoices/.test(game), "buildChoices present");
assert(/shapeScore|choiceShapeScore|lenDiff/.test(game), "shape similarity scoring");
assert(/word count|wcDiff|wordsOf/.test(game), "word-count similarity");
const good = Polish.choiceShapeScore("the word of the LORD", "the fear of the LORD");
const bad = Polish.choiceShapeScore("the word of the LORD", "x");
assert(good > bad, "similar phrases score higher than short junk (" + good + " vs " + bad + ")");
assert(Polish.choiceShapeScore("living soul", "living soul") < 0, "identical rejected");

/* --- unlock ceremony --- */
assert(/km \* 24/.test(atlas) && /ms < 1400/.test(atlas) && /ms > 5200/.test(atlas),
  "map walk is 24ms/km, 1.4–5.2s");
assert(/celebrateUnlock/.test(atlas), "Atlas.celebrateUnlock");
assert(/pendingUnlockId/.test(game), "pendingUnlockId flow");
assert(/celebrateUnlock\(unlockId\)/.test(game) || /Atlas\.celebrateUnlock/.test(game),
  "openAtlas runs celebrateUnlock");
assert(/unlocking/.test(atlas) && /unlocking/.test(css), "unlock CSS class");
assert(/unlockBurst|unlockLabel/.test(css), "unlock keyframes");
assert(/autoUnlock|See the road open|pendingUnlockId/.test(game), "auto map after first clear");
assert(/function playResultsSequence/.test(game), "results events play in one sequence");
assert(/function presentSeal/.test(game), "seals present one at a time");
assert(/afterResults\(t, function\(\)\{ Director\.ending/.test(game),
  "the ending card is the first results beat");
assert(/flushRevealsAfterResults\(finish\)/.test(game),
  "relic/figure reveals wait their turn");
assert(!/setTimeout\(\(\)=>flushRevealsAfterResults\(\), 1600\)/.test(game),
  "reveals are not fired on a 1.6s rush");
assert(!/go\("atlas"\);\s*\}, 2200\)/.test(game),
  "the map unlock waits for the sequence");
assert(/announced: !R\.ended/.test(game),
  "end-of-run seals stay silent until presented");

/* --- thinner roads, smaller type, site motifs, chosen avatar only --- */
assert(/weight: 3\.2/.test(atlas) && /weight: 1\.6/.test(atlas),
  "route casing and gold line are thinner");
assert(/drop-shadow\(0 0 3px/.test(css), "walked-road glow is thinner");
assert(/3\.8vw,3\.45rem/.test(gameCss), "play verse type is a tad smaller");
assert(/1\.52vw,1\.28rem/.test(gameCss), "play answer type is a tad smaller");
assert(!/id="host"/.test(index) && !/id="host-face"/.test(index), "play stage has no arc host");
assert(!/function figureSrc/.test(game) && !/function syncHost/.test(game),
  "full-body host helpers are gone");
assert(!/ARC_HOST/.test(game) && !/HALL_HOST/.test(game), "arc hosts are gone");
assert(/typed-pwr/.test(game) && /typed-pwr/.test(gameCss), "typed row has Selah and Illuminate");
assert(/ctrlKey\|\|e\.altKey/.test(game), "typed mode keeps Ctrl/Alt+S and +I as powers");
assert(/R\.typed = false/.test(game), "set-pieces clear typed mode");
assert(/o\.reason==="death"/.test(game), "a failed run cannot take the survived voice");
assert(/gridTemplateColumns/.test(game), "act-track columns match the number of turns");
assert(/function momentumClockMs/.test(game) && /ms \* 1\.2/.test(game),
  "high momentum adds a 20% extra beat on the pick clock");
assert(/MOMENTUM_STEPS\[0\]/.test(game), "the momentum stretch starts at Building");
assert(/function pickClockMs/.test(game) && /PICK_PAD_MS/.test(game),
  "every pick clock gets a flat extra beat");
assert(/R\.typed \|\| R\.mode==="blitz"/.test(game),
  "typed and blitz clocks are not stretched by momentum");
assert(/expandExclude/.test(atlas) || /expandExclude/.test(fs.readFileSync(path.join(root,"js","pilgrimage.js"),"utf8")),
  "same-reference duplicates are excluded together");
assert(/id="site-motif"/.test(index) && /#site-motif/.test(gameCss), "site motif layer exists");
assert(/data-site="ur"/.test(gameCss) && /data-site="patmos"/.test(gameCss) && /data-site="hall"/.test(gameCss),
  "each site has its own plate, plus a hall plate");
assert(/border-radius:50%/.test((gameCss.match(/\.witness img\{[^}]+\}/) || [""])[0]),
  "witness is a circular token");
assert(!/Biblical figures/.test(game), "character settings do not list biblical figures");
require("./js/sites").SITES.forEach(function(s){
  assert(gameCss.indexOf('data-site="'+s.id+'"') >= 0, "site "+s.id+" has its own plate");
});
assert(/setAttribute\("data-site"/.test(game), "play view stamps data-site for the plate");

/* --- optional on-screen keyboard --- */
assert(/id="vkb-toggle"/.test(game), "typed questions offer a Keyboard control");
assert(/function setVkbOpen/.test(game), "setVkbOpen toggles the board");
assert(/vkb:false/.test(game), "new saves start with the board hidden");
assert(/inputmode", SAVE\.set\.vkb \? "none" : "text"/.test(game) ||
  /inputmode", SAVE.set.vkb \? "none" : "text"/.test(game),
  "open board suppresses the OS IME; closed board allows it");
assert(/"-"/.test(game) && /⌫/.test(game), "board includes hyphen and backspace");
assert(/\.vkb\.on/.test(gameCss), "board is shown only when .on");
assert(!/@media \(hover:none\) and \(pointer:coarse\)\{\s*\.vkb\{display:flex\}/.test(gameCss),
  "touch devices no longer force the board open");

/* --- cinematic drift (visual only) --- */
assert(/ans-float/.test(game) && /ans-float/.test(gameCss), "choice text floats inside a still hit box");
assert(/answers\.drift/.test(gameCss), "drift is a class, not always-on");
assert(/!SetPieces\.autoLock\(\)/.test(game), "Rapid Recall does not drift");
assert(/body\.reduced \.answers\.drift/.test(gameCss), "reduced motion kills the drift");

/* --- miss scar (wrong + true, no blood spray) --- */
assert(/function markBlankScar/.test(game), "markBlankScar exists");
assert(/scar-miss/.test(game) && /scar-true/.test(game), "scar shows the miss and the true phrase");
assert(/markBlankScar\(choice, q\.a\)/.test(game), "a locked miss writes the scar");
assert(/markBlankScar\("— time —"/.test(game), "time-up writes the scar");
assert(!/afterRun\(520, \(\)=>\{ if\(R\.q===q\)\{ blank\.textContent=q\.a/.test(game),
  "the miss is not wiped after 520ms");
assert(!/showAnswerReveal/.test(game) && !/id="answer-reveal"/.test(index),
  "the duplicate answer-reveal panel stays gone");
assert(!/Backdrop\.hit\("wrong"\)/.test(game) && !/Backdrop\.hit\("correct"\)/.test(game)
  && !/Backdrop\.hit\("tick"\)/.test(game),
  "play hits do not jolt an invisible backdrop");
assert(/Backdrop\.hit\("death"\)/.test(game) && /Backdrop\.hit\("levelup"\)/.test(game),
  "end-of-run backdrop jolts remain");
assert(!/Director\.callout\("A relic shields you/.test(game),
  "relic shield does not stack a callout on the miss flash");
assert(/toast\("Relic shield — one miss absorbed"\)/.test(game),
  "relic shield still toasts");
assert(!/Director\.impact\("correct"\);popScore/.test(game),
  "a correct answer does not float a second +N");
assert(/animateScore\(\)/.test(game), "the HUD score still counts up");
assert(!/body\.fx-wrong #grain/.test(gameCss),
  "wrong answers do not bump film grain");

/* --- lock stamp --- */
assert(/id="lock-seal"/.test(index), "lock-seal markup on the play view");
assert(/Director\.beat\("lock"\)/.test(game), "locking an answer fires the lock beat");
assert(/body\.fx-lock #lock-seal/.test(gameCss), "fx-lock reveals the wax seal");
assert(/@keyframes lockStamp/.test(gameCss), "lockStamp keyframes");
assert(/pointer-events:none/.test(gameCss.match(/#lock-seal\{[^}]+\}/)[0]),
  "the seal never steals clicks");

/* --- last-3s tunnel --- */
assert(/sec<=3\?3/.test(game) || /sec<=3 \? 3/.test(game), "pressure-3 is the last three seconds");
assert(/body\.pressure-3 #vignette/.test(gameCss), "last-3s tightens the vignette");
assert(/body\.pressure-3 \.verse-stage/.test(gameCss), "the verse stays readable in the tunnel");
assert(/body\.pressure-3 \.answers/.test(gameCss), "answers dim but stay put");
assert(/Director\.pressure\(0\)/.test(game), "the tunnel clears when the clock stops");

/* --- Selah duck --- */
assert(/selah\(ms\)\{\s*duckMusic\(0\.6/.test(game), "Snd.selah ducks the bed");
assert(/Snd\.selah\(5000\)/.test(game), "using Selah ducks for the five granted seconds");

/* --- site cold-open quote --- */
assert(/id="site-quote"/.test(index) && /id="site-quote-line"/.test(index),
  "site quote overlay markup");
assert(/function maybePlaySiteQuote/.test(game) && /function showSiteQuote/.test(game),
  "cold-open helpers exist");
assert(/R\.siteIdx!==1/.test(game), "the quote plays on the first site verse only");
assert(/#site-quote\.on/.test(gameCss), "quote overlay is class-gated");
assert(/position:absolute/.test(gameCss.match(/#site-quote\{[^}]+\}/)[0]),
  "quote overlay is out of the play flex flow");
assert(/hideSiteQuote\(\)/.test(game), "end/abandon tear the quote down");
assert(/quoteEl\.classList\.contains\("on"\)/.test(game), "keyboard can skip the quote");

/* --- judge burst (sprite sheet, same idea as the map walker) --- */
assert(/id="judge-burst"/.test(index), "judge burst markup on the play stage");
assert(/function showJudgeBurst/.test(game), "showJudgeBurst exists");
assert(/showJudgeBurst\(kind==="correct"\?"up":"down"\)/.test(game),
  "impact fires the burst on correct and wrong");
assert(/judgeBurst/.test(gameCss) && /steps\(7\)/.test(gameCss),
  "burst is an 8-frame steps sheet");
assert(/pointer-events:none/.test((gameCss.match(/#judge-burst\{[^}]+\}/) || [""])[0]),
  "the judge never steals hits");
assert(fs.existsSync(path.join(root, "assets", "judge", "up.png")), "thumbs-up sheet");
assert(fs.existsSync(path.join(root, "assets", "judge", "down.png")), "thumbs-down sheet");
assert(/SAVE\.set\.reduced/.test(game) && /showJudgeBurst/.test(game),
  "reduced motion skips the burst");

/* --- witness token --- */
assert(/id="witness"/.test(index) && /id="witness-face"/.test(index), "witness markup");
assert(/function syncWitness/.test(game) && /function witnessLook/.test(game),
  "witness helpers exist");
assert(/R\.mode==="blitz"/.test(game) && /el\.hidden = true/.test(game),
  "blitz hides the witness");
assert(/witnessLook\(true\)/.test(game), "a miss turns the witness away");
assert(/\.witness\.look img/.test(gameCss), "look state is styled");
assert(/\.witness[^{]*\{[^}]*pointer-events:none/.test(gameCss),
  "the token does not steal hits");

/* --- lamp lives --- */
assert(/LAMP_SVG/.test(game) && /lamp-flame/.test(game), "lamps replace hearts in the HUD");
assert(/textContent="Lamps"/.test(game) && /id="hud-lives-lab">Lamps/.test(index),
  "the rail is labeled Lamps");
assert(/R\.mode==="blitz"/.test(game) && /wrap\.style\.display="none"/.test(game),
  "blitz hides the lamp row");
assert(/@keyframes lampFlicker/.test(gameCss) && /@keyframes lampGutter/.test(gameCss),
  "last lamp flickers; a lost lamp gutters");
assert(/\.hrt\.lamp\.last\{animation:none/.test(gameCss),
  "lamps do not use the heart pulse");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — gameplay polish · timer · choices · unlock");
