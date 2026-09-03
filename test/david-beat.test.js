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
ok("Q12 stem is 17:54", qs[11].stem.indexOf("brought it to") >= 0 && qs[11].stem.indexOf("armour") >= 0);
eq("cinema A 1 is valley VO", Beat.cinemaA[0].still + Beat.cinemaA[0].vo, "01.webpvo-01-valley.mp3");
eq("cinema A 3 is defy", Beat.cinemaA[2].vo, "vo-03-defy.mp3");
eq("cinema A 5 is crowd only", Beat.cinemaA[4].sfx, "sfx-05-crowd.mp3");
eq("cinema B 6 is wind-shield under youth", Beat.cinemaB[0].sfx, "sfx-06-wind-shield.mp3");
eq("cinema B 7 is breath only", Beat.cinemaB[1].sfx, "sfx-07-breath.mp3");
eq("cinema B 10 thud before name", Beat.cinemaB[4].sfxFirst && Beat.cinemaB[4].sfx, "sfx-10-thud.mp3");
ok("Q1 has no borrowed SFX", !qs[0].sfx);
ok("Q2 has no wind-shield", !qs[1].sfx);
eq("Q4 uses pass wind not thud", qs[3].sfx, "sfx-06-wind-shield.mp3");
eq("Q7 uses thud on the run plate", qs[6].sfx, "sfx-10-thud.mp3");
ok("Q8 has no crowd bed", !qs[7].sfx);

const src = fs.readFileSync(path.join(ROOT, "js", "beat.js"), "utf8");
ok("no bronze", !/bronze/.test(src));
ok("no baggage", !/baggage/.test(src));
ok("no commander of their thousand", !/commander of their thousand/.test(src));
ok("no parched grain", !/parched grain/.test(src));
ok("no ESV Eliab frame", !/presumption/.test(src) && !/evil of your heart/.test(src));
ok("armour not armor", /armour/.test(src) && !/\barmor\b/.test(src));

const goliath = path.join(ROOT, "assets", "beats", "goliath");
 ["01.webp","02.webp","03.webp","04.webp","05.webp","06.webp","07.webp","08.webp","09.webp","10.webp",
 "vo-01-valley.mp3","vo-02-ridge.mp3","vo-03-defy.mp3","vo-04-again.mp3","vo-06-youth.mp3",
 "vo-08-staves.mp3","vo-09-flesh.mp3","vo-10-name.mp3",
 "sfx-05-crowd.mp3","sfx-06-wind-shield.mp3","sfx-07-breath.mp3","sfx-10-thud.mp3",
  "question.webp","win.webp","loss.webp","prologue.mp4"].forEach(function(f){
  const p = path.join(goliath, f);
  ok(f + " exists", fs.existsSync(p) && fs.statSync(p).size > 1000);
});
ok("question still is compact", fs.statSync(path.join(goliath, "question.webp")).size < 700000);
ok("prologue under 20MB", fs.statSync(path.join(goliath, "prologue.mp4")).size < 20 * 1024 * 1024);
ok("Fear of the Dark exists", fs.statSync(path.join(ROOT, "audio", "fear-of-the-dark.mp3")).size > 100000);
const gameSrc = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
ok("start uses prologue film", gameSrc.indexOf('playStageFilm("assets/beats/goliath/prologue.mp4"') >= 0);
ok("start does not play cinema A", !/function startBeatStage\(\)\{[\s\S]*?playBeatCinema\(Beat\.cinemaA\)/.test(gameSrc));

function skipCinema(sb, n) {
  for (let i = 0; i < n; i++) exec(sb, "beatAdvancePlate()");
}
function armMedia(sb) {
  exec(sb, `(function(){
    ["ur-prologue-video","cine-parallax-video"].forEach(function(id){
      var v = $(id);
      v.paused = true;
      v.readyState = 4;
      v.src = id === "ur-prologue-video" ? "assets/ur-prologue.mp4" : "";
      v.play = function(){ this.paused = false; this._plays = (this._plays||0)+1; return Promise.resolve(); };
      v.pause = function(){ this.paused = true; };
      v.load = function(){};
      v.getAttribute = function(n){ return n === "src" ? this.src : null; };
    });
  })()`);
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
  eq("Q1 after reduced film path", read(sb, "R.q.id"), "beat-q1");
  const lives = read(sb, "R.lives");
  exec(sb, "applyMiss({verse:R.q})");
  eq("miss does not take a lamp", read(sb, "R.lives"), lives);
  exec(sb, "endRun('abandon')");
  ok("loss still on miss", read(sb, "$('v-results').classList.contains('beat-loss')"));
  ok("no win still on miss", !read(sb, "$('v-results').classList.contains('beat-win')"));
}

{
  const sb = boot();
  armMedia(sb);
  exec(sb, "SAVE.set.quality='high'; SAVE.set.reduced=false; startRun('beat','watchman')");
  ok("film overlay on", read(sb, "$('ur-prologue').classList.contains('on')"));
  eq("film src", read(sb, "$('ur-prologue-video').src"), "assets/beats/goliath/prologue.mp4");
  exec(sb, "hideUrPrologue(true)");
  eq("Q1 after film skip", read(sb, "R.q.id"), "beat-q1");
}

{
  const sb = boot();
  armMedia(sb);
  exec(sb, "SAVE.set.quality='low'; startRun('beat','watchman')");
  eq("low quality skips film", read(sb, "R.q.id"), "beat-q1");
  ok("film overlay off", !read(sb, "$('ur-prologue').classList.contains('on')"));
}

{
  const sb = boot();
  const board0 = read(sb, "SAVE.board.length");
  exec(sb, "startRun('beat','watchman')");
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
  ok("win still on Held", read(sb, "$('v-results').classList.contains('beat-win')"));
  ok("no loss still on Held", !read(sb, "$('v-results').classList.contains('beat-loss')"));
}

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman')");
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

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman')");
  eq("pick confirm label", read(sb, "$('confirm-answer').textContent"), "Lock Answer");
  exec(sb, "R.q = beatToVerse(Beat.questions[3]); renderBeatOrder(Beat.questions[3])");
  eq("order confirm label", read(sb, "$('confirm-answer').textContent"), "Lock order");
  exec(sb, "renderBeatPick(Beat.questions[5])");
  eq("pick label restored", read(sb, "$('confirm-answer').textContent"), "Lock Answer");
}

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman')");
  exec(sb, "R.q = beatToVerse(Beat.questions[3]); renderBeatOrder(Beat.questions[3])");
  const miss0 = read(sb, "R.beatMiss || 0");
  exec(sb, "R.beatOrder = [R.q.order[0]]; confirmAnswer()");
  eq("short order does not lock", read(sb, "R.locked"), false);
  eq("short order is not a miss", read(sb, "R.beatMiss || 0"), miss0);
  exec(sb, "R.beatOrder = R.q.order.slice(); confirmAnswer()");
  eq("full order locks", read(sb, "R.locked"), true);
}

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman')");
  exec(sb, "R.q = beatToVerse(Beat.questions[4]); renderBeatCloze(Beat.questions[4])");
  exec(sb, `(function(){
    var btns = $("opts").children, i, b;
    for (i = 0; i < btns.length; i++) if (btns[i].dataset && btns[i].dataset.val === "Saul") b = btns[i];
    if (b) b.click();
  })()`);
  eq("cloze can take a chip", read(sb, "R.beatFilled.join('|')"), "Saul");
  exec(sb, `(function(){
    var btns = $("opts").children, i, b;
    for (i = 0; i < btns.length; i++) if (btns[i].dataset && btns[i].dataset.val === "Saul") b = btns[i];
    if (b) b.click();
  })()`);
  eq("cloze chip can be undone", read(sb, "R.beatFilled.join('|')"), "");
  eq("undo does not resolve", read(sb, "R.locked"), false);
}

{
  const sb = boot();
  armMedia(sb);
  exec(sb, `$("ur-prologue-video").readyState = 0; SAVE.set.quality='high'; SAVE.set.reduced=false; startRun('beat','watchman')`);
  eq("film waits for data", read(sb, "$('ur-prologue-video')._plays || 0"), 0);
  exec(sb, "hideUrPrologue(true)");
  eq("Q1 after early skip", read(sb, "R.q.id"), "beat-q1");
  exec(sb, `$("ur-prologue-video").dispatch("loadeddata")`);
  eq("late load does not restart film", read(sb, "$('ur-prologue-video')._plays || 0"), 0);
  ok("overlay stays off after late load", !read(sb, "$('ur-prologue').classList.contains('on')"));
}

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman'); beatSky('15.jpeg')");
  ok("safe plate url", /15\.jpeg/.test(read(sb, "$('backdrop').style.backgroundImage")));
  exec(sb, `beatSky('x");alert(1)')`);
  ok("rejects css-breaking plate", read(sb, "$('backdrop').style.backgroundImage") === "");
}

if (fail) {
  console.log("FAIL — david beat · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — david beat · " + pass + " assertions");
