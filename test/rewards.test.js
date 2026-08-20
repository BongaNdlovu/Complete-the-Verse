/* Quick rewards are rotating, skill-based contracts rather than free currency. */
const QuickRewards = require("../js/rewards");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

{
  const goals = QuickRewards.pick("practice", 1);
  eq("each run gets three contracts", goals.length, 3);
  ok("the contract groups are distinct",
    new Set(goals.map(g=>g.group)).size === 3, goals.map(g=>g.group));
  ok("the default chain contract is a real streak", goals.some(g=>g.type==="streak"));
  ok("standard precision asks for speed", goals.some(g=>g.type==="fast"));
  ok("discipline asks for a clean run", goals.some(g=>g.type==="clean"));
}

{
  const recall = QuickRewards.pick("recall", 0);
  ok("recall rotates in word-for-word contracts", recall.some(g=>g.type==="exact"));
  ok("blitz keeps the discipline target achievable before timeout",
    QuickRewards.pick("blitz", 0).some(g=>g.id==="wideCounsel"));
  ok("hard chain variant exists", QuickRewards.pick("practice", 3).some(g=>g.target===12));
  ok("rare Illuminate contract is not on every run",
    !QuickRewards.pick("practice", 1).some(g=>g.id==="illumAscendant"));
  ok("rare Illuminate contract appears only on a hard rotation",
    QuickRewards.pick("practice", 7).some(g=>g.id==="illumAscendant"));
}

{
  const goal = QuickRewards.catalog.streak7;
  eq("streak progress stops below target", QuickRewards.progress(goal, {best:6}).value, 6);
  ok("streak seven is not complete at six", !QuickRewards.complete(goal, {best:6}));
  ok("streak seven is complete at seven", QuickRewards.complete(goal, {best:7}));
}

{
  const clean = QuickRewards.catalog.cleanPage;
  ok("clean page is intentionally end-gated",
    !QuickRewards.complete(clean, {missed:[], usedPower:false}));
  ok("clean page settles after a completed run",
    QuickRewards.complete(clean, {missed:[], usedPower:false, quickSettling:true}));
  ok("a miss breaks the clean page",
    !QuickRewards.complete(clean, {missed:[{p:"miss"}], quickSettling:true}));
  ok("using a power breaks bare hands",
    !QuickRewards.complete(QuickRewards.catalog.noCrutch, {missed:[], usedPower:true, quickSettling:true}));
  ok("hidden flame requires the 12-chain and no power",
    !QuickRewards.complete(QuickRewards.catalog.illumAscendant, {best:11, usedPower:false, quickSettling:true}) &&
    !QuickRewards.complete(QuickRewards.catalog.illumAscendant, {best:12, usedPower:true, quickSettling:true}) &&
    QuickRewards.complete(QuickRewards.catalog.illumAscendant, {best:12, usedPower:false, quickSettling:true}));
}

{
  const goals = QuickRewards.pick("practice", 7);
  const run = {
    mode:"practice", best:12, fast:8, missed:[], usedPower:false,
    booksRun:new Set(["Genesis"])
  };
  const result = QuickRewards.resolve(goals, run, "complete");
  ok("hard rotation can bank the rare Illuminate", result.paid.some(g=>g.id==="illumAscendant"));
  eq("rare rotation grants one extra Illuminate", result.illuminate, 1);
}

{
  const goals = QuickRewards.pick("practice", 1);
  const strongRun = {
    mode:"practice", best:7, fast:8, missed:[], usedPower:false,
    booksRun:new Set(["Genesis","Psalms","Isaiah","John","Romans"])
  };
  const finished = QuickRewards.resolve(goals, strongRun, "complete");
  eq("completed run settles every achieved contract", finished.paid.length, 3);
  eq("completed run pays the configured xp", finished.xp, 210);
  eq("completed run pays limited oil", finished.oil, 2);

  const abandoned = QuickRewards.resolve(goals, strongRun, "abandon");
  eq("abandoned run banks nothing", abandoned.paid.length, 0);
  ok("abandoned run still reports the achieved milestones",
    abandoned.completed.length === 2);
}

{
  const blitzGoals = QuickRewards.pick("blitz", 0);
  const blitzRun = {mode:"blitz", best:7, booksRun:new Set(["Genesis","Psalms","Isaiah","John","Romans"])};
  const timeout = QuickRewards.resolve(blitzGoals, blitzRun, "death");
  eq("blitz timeout settles its achieved contracts", timeout.paid.length, 2);
  eq("blitz contract reward is visible", timeout.xp, 105);
}

console.log((fail ? "FAIL" : "PASS") + " â€” quick rewards Â· " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
