const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");
const { Beat } = require("../js/beat.js");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got: got, want: want }); }

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/verses-tf.js", "js/beat.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js", "js/live.js", "js/atlas.js"
];
function boot() {
  const sb = makeSandbox();
  const src = PREFIX.concat(ENGINE_FILES).map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });
  return sb;
}
function exec(sb, code) { return vm.runInContext(code, sb); }
function read(sb, expr) { return vm.runInContext(expr, sb); }

const qs = Beat.questions;
eq("twelve questions", qs.length, 12);
ok("Q1 B is Ephes-dammim / Elah", qs[0].choices[1].indexOf("Ephes-dammim") >= 0 && qs[0].choices[1].indexOf("valley of Elah") >= 0);
eq("Q2 A is 600 shekels of iron", qs[1].choices[0], "600 shekels of iron");
ok("Q2 B is brass 5,000", qs[1].choices[1] === "5,000 shekels of brass");
eq("Q3 C is captain", qs[2].choices[2], "the captain of their thousand");
eq("Q4 order length 4", qs[3].order.length, 4);
ok("Q4 uses carriage", qs[3].order.join(" ").indexOf("carriage") >= 0);
eq("Q5 blank 1 sheep", qs[4].blanks[0], "those few sheep in the wilderness");
eq("Q5 blank 2 battle", qs[4].blanks[1], "that thou mightest see the battle");
eq("Q6 A hand of this Philistine", qs[5].a, "out of the hand of this Philistine");
eq("Q7 three true", Beat.multiKey(qs[6]), "sling,staff,stones");
ok("Q7 has no own sword on", qs[6].items.filter(x => x.on).every(x => x.id !== "sword"));
eq("Q8 C Goliath", qs[7].choices[2], "Goliath");
ok("Q8 stem staves", qs[7].stem.indexOf("staves") >= 0);
eq("Q9 Name", qs[8].a, "the LORD of hosts, the God of the armies of Israel");
ok("Q10 A 17:46", qs[9].a.indexOf("God in Israel") >= 0);
ok("Q11 B stood upon", qs[10].a.indexOf("stood upon") >= 0 && qs[10].a.indexOf("sheath thereof") >= 0);
ok("Q11 trap already drawn", qs[10].choices[0].indexOf("already drawn") >= 0);
eq("Q12 head Jerusalem", qs[11].rows[0].a, "Jerusalem");
eq("Q12 armour tent", qs[11].rows[1].a, "David's tent");
ok("Q12 scatter Nob", qs[11].scatter.indexOf("Nob") >= 0);

const src = fs.readFileSync(path.join(ROOT, "js", "beat.js"), "utf8");
ok("no bronze", !/bronze/.test(src));
ok("no baggage", !/baggage/.test(src));
ok("no commander of their thousand", !/commander of their thousand/.test(src));
ok("no parched grain", !/parched grain/.test(src));
ok("no ESV Eliab frame", !/presumption/.test(src) && !/evil of your heart/.test(src));
ok("armour not armor", /armour/.test(src) && !/\barmor\b/.test(src));

const goliath = path.join(ROOT, "assets", "beats", "goliath");
["01.jpeg","02.jpeg","03.jpeg","04.jpeg","05.jpeg","06.jpeg","07.jpeg","08.jpeg","09.jpeg","10.jpeg",
 "vo-01-valley.mp3","vo-02-ridge.mp3","vo-03-defy.mp3","vo-04-again.mp3","vo-06-youth.mp3",
 "vo-08-staves.mp3","vo-09-flesh.mp3","vo-10-name.mp3",
 "sfx-05-crowd.mp3","sfx-06-wind-shield.mp3","sfx-07-breath.mp3","sfx-10-thud.mp3",
 "question.png"].forEach(function(f){
  const p = path.join(goliath, f);
  ok(f + " exists", fs.existsSync(p) && fs.statSync(p).size > 1000);
});
ok("Fear of the Dark exists", fs.statSync(path.join(ROOT, "audio", "fear-of-the-dark.mp3")).size > 100000);

function skipCinema(sb, n) {
  for (let i = 0; i < n; i++) exec(sb, "beatAdvancePlate()");
}
function answerCurrent(sb) {
  const kind = read(sb, "R.q.kind");
  if (kind === "pick") exec(sb, "resolveAnswer(R.q, R.q.a, null, 800, 40000)");
  else if (kind === "order") exec(sb, "R.beatOrder = R.q.order.slice(); confirmAnswer()");
  else if (kind === "cloze") exec(sb, "R.beatFilled = R.q.blanks.slice(); beatResolve(true)");
  else if (kind === "multi") exec(sb, "R.beatOn = {staff:true, stones:true, sling:true}; confirmAnswer()");
  else if (kind === "match") exec(sb, "R.beatMatch = {head:'Jerusalem', armour:\"David's tent\"}; confirmAnswer()");
}

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman')");
  skipCinema(sb, 5);
  eq("Q1 after cinema A", read(sb, "R.q.id"), "beat-q1");
  const lives = read(sb, "R.lives");
  exec(sb, "applyMiss({verse:R.q})");
  eq("miss does not take a lamp", read(sb, "R.lives"), lives);
}

{
  const sb = boot();
  const board0 = read(sb, "SAVE.board.length");
  exec(sb, "startRun('beat','watchman')");
  skipCinema(sb, 5);
  for (let i = 0; i < 12; i++) {
    answerCurrent(sb);
    if (i === 4) {
      exec(sb, "nextQuestion()");
      skipCinema(sb, 5);
    } else if (i < 11) {
      exec(sb, "nextQuestion()");
    }
  }
  if (!read(sb, "R.ended")) exec(sb, "nextQuestion()");
  if (!read(sb, "R.ended")) exec(sb, "endRun('complete')");
  eq("twelve kept", read(sb, "R.correct"), 12);
  eq("board unchanged", read(sb, "SAVE.board.length"), board0);
  eq("Held saved", read(sb, "SAVE.life.beatGoliathHeld"), true);
}

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman')");
  skipCinema(sb, 5);
  for (let i = 0; i < 5; i++) { answerCurrent(sb); exec(sb, "nextQuestion()"); }
  skipCinema(sb, 5);
  for (let i = 0; i < 6; i++) {
    if (read(sb, "R.q.id") === "beat-q7") {
      exec(sb, "R.beatOn = {staff:true, stones:true, sling:true, helm:true}; confirmAnswer()");
      ok("extra helm fails multi", read(sb, "R.beatMiss") >= 1);
      break;
    }
    answerCurrent(sb);
    exec(sb, "nextQuestion()");
  }
}

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman')");
  skipCinema(sb, 5);
  for (let i = 0; i < 5; i++) { answerCurrent(sb); exec(sb, "nextQuestion()"); }
  skipCinema(sb, 5);
  for (let i = 0; i < 7; i++) {
    if (read(sb, "R.q.kind") === "match") {
      exec(sb, "R.beatMatch = {head:'Nob', armour:\"Saul's house\"}; confirmAnswer()");
      ok("wrong match counts a miss", read(sb, "R.beatMiss") >= 1);
      break;
    }
    answerCurrent(sb);
    exec(sb, "nextQuestion()");
  }
}

if (fail) {
  console.log("FAIL — david beat · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — david beat · " + pass + " assertions");
