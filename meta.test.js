/* Logic tests — ranks, oil, Act VI gate, relic veils. */
const Meta = require("./js/meta");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

{
  eq("level 1 at 0 xp", Meta.levelInfo(0).level, 1);
  ok("level 20 still exists", Meta.levelInfo(500000).level >= 20);
  ok("cap is above 99", Meta.RANK_CAP > 99);
  const high = Meta.levelInfo(1e12);
  eq("xp cannot push past the cap", high.level, Meta.RANK_CAP);
}

{
  eq("old first rank", Meta.rankFor(1), "Hearer");
  eq("prophet still at 27", Meta.rankFor(27), "Prophet of the Living God");
  eq("a rank after prophet", Meta.rankFor(35), "Elder of the Gate");
  eq("ascent rank", Meta.rankFor(140), "Keeper of the Ascent");
  eq("cap uses the last title", Meta.rankFor(160), "Keeper of the Ascent");
}

{
  eq("base oil on a cold correct", Meta.oilForCorrect(0, false), 2);
  eq("exact pays one more", Meta.oilForCorrect(0, true), 3);
  eq("streak 3 pays an extra", Meta.oilForCorrect(3, false), 3);
  ok("xp tick grows with streak", Meta.xpTick(3, 8) > Meta.xpTick(3, 0));
}

{
  eq("fresh save has 5 trial acts", Meta.trialActCount({xp:0, seals:[]}), 5);
  ok("level 20 alone does not open Act VI", !Meta.actVIUnlocked({xp:200000, seals:[]}));
  const save = { xp: 200000, seals: ["sd15"] };
  ok("Act V seal plus rank 20 opens Act VI", Meta.actVIUnlocked(save));
  eq("unlocked save has 6 acts", Meta.trialActCount(save), 6);
}

{
  ok("cannot buy Selah without oil", !Meta.canSpendOil(3, "selah"));
  const spent = Meta.spendOil(20, "selah");
  ok("8 oil buys Selah", spent.ok);
  eq("oil remaining after Selah", spent.oil, 12);
  const failSpend = Meta.spendOil(2, "illum");
  ok("too little oil fails", !failSpend.ok);
}

{
  ok("ungated relic is unveiled", Meta.relicUnveiled({id:"x"}, 1));
  ok("gated relic waits on rank", !Meta.relicUnveiled({id:"x", requiresRank:20}, 12));
  ok("gated relic unveils at the rank", Meta.relicUnveiled({id:"x", requiresRank:20}, 20));
}

console.log((fail ? "FAIL" : "PASS") + " — meta · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
