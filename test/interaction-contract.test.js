/* Regression pins for the production interaction contract.
   Browser automation is intentionally separate from this source-level
   suite, but the highest-risk hooks must remain present in every build. */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const typed = fs.readFileSync(path.join(ROOT, "js", "typed.js"), "utf8");
const play = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
const cinematic = fs.readFileSync(path.join(ROOT, "js", "cinematic.js"), "utf8");
const gameCss = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8");
const atlasCss = fs.readFileSync(path.join(ROOT, "css", "atlas.css"), "utf8");

let pass = 0, fail = 0;
function ok(name, condition, extra){
  if(condition) pass++;
  else { fail++; console.log("  FAIL " + name + (extra ? " -> " + extra : "")); }
}

ok("assembly has a pointer start path", typed.includes('addEventListener("pointerdown"'));
ok("assembly tracks pointer movement", typed.includes('addEventListener("pointermove"'));
ok("assembly commits pointer release", typed.includes('addEventListener("pointerup"'));
ok("assembly cleans cancelled pointers", typed.includes('addEventListener("pointercancel"'));
ok("assembly keeps the tap fallback", typed.includes('addEventListener("click"'));
ok("assembly supports keyboard placement", typed.includes('addEventListener("keydown"'));
ok("assembly exposes grabbed state", typed.includes('aria-grabbed'));
ok("assembly exposes drop targeting", typed.includes('drop-target'));
ok("assembly disables native drag while pointer drag is active", typed.includes('R.assemble.pointer'));
ok("assembly controls are touch-safe", /\.asm-slot\{[\s\S]*touch-action:none/.test(gameCss));
ok("assembly tiles are touch-safe", /\.asm-tile\{[\s\S]*touch-action:none/.test(gameCss));

ok("power use has a per-question signal", game.includes("qUsedPower=true"));
ok("each question resets its power signal", play.includes("R.qUsedPower=false"));
ok("SRS receives the per-question power signal", play.includes("usedPower: !!R.qUsedPower"));
ok("SRS records answer mode and cue level", game.includes("lastMode") && game.includes("lastCueLevel"));

ok("cinematic beats are priority gated", cinematic.includes("BEAT_PRIORITY") && cinematic.includes("allowBeat"));
ok("cinematic events have a shared dispatcher", cinematic.includes("function event(kind, payload)"));
ok("cinematic events are used by answer resolution", play.includes('Cinematic.event("streak"') && play.includes('Cinematic.event("miss"'));

ok("walker uses seven transitions for eight frames", atlasCss.includes("steps(7)"));
ok("walker stops on the last frame", atlasCss.includes("-280px 0"));

if(fail){
  console.log("FAIL — interaction contract · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — interaction contract · " + pass + " assertions passed");
