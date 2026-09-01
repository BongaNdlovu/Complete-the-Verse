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

{
  const sb = boot();
  armMedia(sb);
  exec(sb, "SAVE.set.quality='high'; SAVE.set.reduced=false; Snd.ambience('menu')");
  eq("menu bed is selected", read(sb, "Snd.currentBed()"), "menu");
  exec(sb, "startRun('beat','watchman')");
  eq("beat film holds question music", read(sb, "R.holdQuestionMusic"), true);
  eq("beat film clears the menu bed", read(sb, "Snd.currentBed()"), null);
  ok("beat film is on", read(sb, "$('ur-prologue').classList.contains('on')"));
  eq("Q1 waits on the film", read(sb, "(R.q && R.q.id) || null"), null);
  exec(sb, "hideUrPrologue(true)");
  eq("Q1 after film skip", read(sb, "R.q.id"), "beat-q1");
  eq("Fear of the Dark starts on the first question", read(sb, "Snd.currentBed()"), "fearOfTheDark");
  ok("menu is not the live bed", read(sb, "Snd.currentBed()") !== "menu");
}

{
  const sb = boot();
  exec(sb, "startRun('beat','watchman')");
  eq("question bed is on before cinema B", read(sb, "Snd.currentBed()"), "fearOfTheDark");
  exec(sb, "playBeatCinema(Beat.cinemaB)");
  eq("cinema B plays Heartbeat", read(sb, "Snd.currentBed()"), "heartbeat");
}

{
  const sb = boot();
  armMedia(sb);
  exec(sb, "SAVE.set.quality='high'; SAVE.set.reduced=false; Snd.ambience('menu'); pendingSiteId='ur'; startRun('pilgrimage','disciple')");
  eq("Ur does not hold the road bed for a film", read(sb, "R.holdQuestionMusic"), false);
  ok("Ur film overlay stays off", !read(sb, "$('ur-prologue').classList.contains('on')"));
  eq("Ur film never starts", read(sb, "$('ur-prologue-video')._plays || 0"), 0);
  ok("Ur spends the film flag without playing", read(sb, "SAVE.set.urPrologueDone"));
  exec(sb, "if(typeof hideSiteQuote==='function') hideSiteQuote()");
  eq("road bed starts on the first verse", read(sb, "Snd.currentBed()"), "heroes");
}

if (fail) {
  console.log("FAIL — exclusive audio · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — exclusive audio · " + pass + " assertions");
