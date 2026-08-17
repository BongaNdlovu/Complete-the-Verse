/* ==================================================================
   META — ranks, oil, Act VI gate, relic veils.

   Persistent climb that sits on top of XP / seals / relics. Pure so
   the gate and the payouts can be tested without booting the engine.
   ================================================================== */
var Meta = (function(){

  var RANK_CAP = 160;
  var RANKS = [
    {l:1,t:"Hearer"},{l:3,t:"Reader"},{l:5,t:"Scribe"},{l:8,t:"Levite"},
    {l:11,t:"Watchman"},{l:15,t:"Seer"},{l:20,t:"Keeper of the Word"},
    {l:27,t:"Prophet of the Living God"},
    {l:35,t:"Elder of the Gate"},{l:45,t:"Anointed Scribe"},
    {l:60,t:"Lamp of the Temple"},{l:80,t:"Voice in the Wilderness"},
    {l:100,t:"Apostle of the Word"},{l:120,t:"Witness of the Remnant"},
    {l:140,t:"Keeper of the Ascent"}
  ];
  var OIL_COST = { selah: 8, illum: 10 };
  var ACT_VI_LEVEL = 20;
  var ACT_VI_SEAL = "sd15";

  function xpNeeded(l){ return Math.round(320 * Math.pow(l, 1.32)); }

  function levelInfo(xp){
    var l = 1, rem = Math.max(0, Number(xp) || 0);
    while(l < RANK_CAP && rem >= xpNeeded(l)){ rem -= xpNeeded(l); l++; }
    return { level:l, into:rem, need:xpNeeded(l) };
  }

  function rankFor(level){
    var r = RANKS[0], i;
    for(i = 0; i < RANKS.length; i++) if(level >= RANKS[i].l) r = RANKS[i];
    return r.t;
  }

  function oilForCorrect(streak, exact){
    return 2 + Math.floor((streak || 0) / 3) + (exact ? 1 : 0);
  }

  function xpTick(tier, streak){
    return 8 + (Number(tier) || 1) * 2 + Math.min(12, Number(streak) || 0);
  }

  function actVIUnlocked(save){
    if(!save) return false;
    var lvl = levelInfo(save.xp || 0).level;
    var seals = save.seals || [];
    return lvl >= ACT_VI_LEVEL && seals.indexOf(ACT_VI_SEAL) >= 0;
  }

  function trialActCount(save){
    return actVIUnlocked(save) ? 6 : 5;
  }

  function canSpendOil(oil, kind){
    var cost = OIL_COST[kind];
    return !!cost && (Number(oil) || 0) >= cost;
  }

  function spendOil(oil, kind){
    if(!canSpendOil(oil, kind)) return { ok:false, oil:Number(oil) || 0 };
    return { ok:true, oil:(Number(oil) || 0) - OIL_COST[kind], cost:OIL_COST[kind] };
  }

  function relicUnveiled(artifact, level){
    if(!artifact || !artifact.requiresRank) return true;
    return (Number(level) || 1) >= artifact.requiresRank;
  }

  return {
    RANK_CAP: RANK_CAP, RANKS: RANKS, OIL_COST: OIL_COST,
    ACT_VI_LEVEL: ACT_VI_LEVEL, ACT_VI_SEAL: ACT_VI_SEAL,
    xpNeeded: xpNeeded, levelInfo: levelInfo, rankFor: rankFor,
    oilForCorrect: oilForCorrect, xpTick: xpTick,
    actVIUnlocked: actVIUnlocked, trialActCount: trialActCount,
    canSpendOil: canSpendOil, spendOil: spendOil,
    relicUnveiled: relicUnveiled
  };
})();

if(typeof module !== "undefined" && module.exports) module.exports = Meta;
