/* Logic tests — view handoffs, wipe gate, dedicated states. */
const Flow = require("../js/flow");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

{
  ok("wipe lasts between 600 and 900ms", Flow.WIPE_MS >= 600 && Flow.WIPE_MS <= 900);
  ok("play is a known view", Flow.VIEWS.indexOf("play") >= 0);
  ok("results is a known view", Flow.VIEWS.indexOf("results") >= 0);
}

{
  const toAct = Flow.leavePlay("act");
  ok("act card keeps the run loop ready", toAct.stopTimer);
  eq("act card does not stop the run loop permanently", toAct.stopLoop, false);
  eq("act card does not bump the scene", toAct.bumpScene, false);

  const toMenu = Flow.leavePlay("menu");
  ok("leaving for the hall stops the loop", toMenu.stopLoop);
  ok("leaving for the hall hides overdrive", toMenu.hideOverdrive);
  ok("leaving for the hall bumps the scene", toMenu.bumpScene);
}

{
  const atlas = Flow.leaveView("atlas", "menu");
  ok("leaving the map unmounts it", atlas.unmountAtlas);
  const stay = Flow.leaveView("menu", "menu");
  ok("same view is a no-op", stay.same);
}

{
  ok("a normal next question wipes", Flow.shouldWipe({}));
  ok("reduced motion skips the wipe", !Flow.shouldWipe({reduced:true}));
  ok("an ended run does not wipe", !Flow.shouldWipe({ended:true}));
  ok("the last question does not wipe into results", !Flow.shouldWipe({toEnd:true}));
  ok("an act card is not a wipe", !Flow.shouldWipe({toAct:true}));
  ok("a set-piece card is not a wipe", !Flow.shouldWipe({toSetpiece:true}));
  ok("death is not a wipe", !Flow.shouldWipe({toDeath:true}));
}

{
  const fallen = Flow.state("fallen");
  ok("death has a designed state", !!fallen);
  ok("death has a way forward", !!fallen.primary);
  const load = Flow.state("load-fail");
  ok("load failure is a designed state", !!load && /record|witness/i.test(load.title + " " + load.kick));
  const empty = Flow.state("empty-drill");
  ok("empty drill is a designed state", !!empty);
  const saveCorrupt = Flow.state("save-corrupt");
  ok("save-corrupt is a designed state", !!saveCorrupt && !!saveCorrupt.primary);
  const saveBlocked = Flow.state("save-blocked");
  ok("save-blocked is a designed state", !!saveBlocked && !!saveBlocked.primary);
  eq("unknown kind is null", Flow.state("nope"), null);
}

console.log((fail ? "FAIL" : "PASS") + " — flow · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
