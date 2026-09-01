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

const game = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
const briefs = fs.readFileSync(path.join(ROOT, "js", "briefs.js"), "utf8");
const play = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css", "play.css"), "utf8");

ok("boot plays the intro until it has been seen", /!SAVE\.set\.introPlayed/.test(game) && /go\("intro"\)/.test(game));
ok("introPlayed is a save flag", /introPlayed:false/.test(game));
ok("finishing the intro persists that it played", /SAVE\.set\.introPlayed = true/.test(briefs));
ok("first-run coffee path starts First Light", /if\(!SAVE\.set\.tutorialSeen\)\{\s*showTutorialIfNeeded\(\);/.test(briefs));
ok("first-run coffee path does not stamp the tutorial done", !/if\(!SAVE\.set\.tutorialDone && !cleared\)\{\s*SAVE\.set\.tutorialDone = true/.test(briefs));
ok("tutorial speaks the lesson line", /Director\.speak\(TUTORIAL_VOICE\[index\], true\)/.test(play));
ok("onboarding does not hide voice captions", !/body\.onboarding \.voice-caption\{display:none\}/.test(css));
ok("atlas cold-open will not drop a vignette on another view", /currentView !== "atlas"/.test(fs.readFileSync(path.join(ROOT, "js", "atlas.js"), "utf8")));
ok("play stages close the profile overlay", /view==="play" \|\| view==="tablets" \|\| view==="atlas"/.test(game) && /closeCharacterPicker/.test(game));

{
  const sb = boot();
  eq("fresh save has not seen the intro", read(sb, "SAVE.set.introPlayed"), false);
  eq("fresh save has not finished First Light", read(sb, "SAVE.set.tutorialDone"), false);
  exec(sb, "enterCoffeePath()");
  eq("first-run boot opens the tutorial", read(sb, "R.mode"), "tutorial");
  eq("tutorial is on the play stage", read(sb, "currentView"), "play");
  eq("tutorial is not marked done before it is played", read(sb, "SAVE.set.tutorialDone"), false);
  eq("tutorial is not marked seen before it is played", read(sb, "SAVE.set.tutorialSeen"), false);
  eq("lesson one is live", read(sb, "R.tutorial.index"), 0);
  ok("lesson voice caption is on", read(sb, "$('voice-caption').classList.contains('on')"));
  ok("lesson voice caption has text", read(sb, "$('voice-caption').textContent.length > 0"));
}

{
  const sb = boot();
  exec(sb, "SAVE.set.tutorialDone = true; SAVE.pilgrim.lastPlayed = 'ur'; persist(); enterCoffeePath()");
  eq("an old skip still opens First Light", read(sb, "R.mode"), "tutorial");
  eq("an old skip does not dump onto the atlas", read(sb, "currentView"), "play");
}

{
  const sb = boot();
  exec(sb, "SAVE.set.tutorialDone = true; SAVE.set.tutorialSeen = true; SAVE.pilgrim.lastPlayed = 'ur'; persist(); enterCoffeePath()");
  eq("a walked save opens the atlas", read(sb, "currentView"), "atlas");
}

{
  const sb = boot();
  exec(sb, "SAVE.set.tutorialDone = true; SAVE.set.tutorialSeen = true; persist(); enterCoffeePath()");
  eq("a taught save with no road opens the menu", read(sb, "currentView"), "menu");
}

if (fail) {
  console.log("FAIL — first-run · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — first-run · " + pass + " assertions");
