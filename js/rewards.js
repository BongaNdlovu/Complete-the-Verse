/* ==================================================================
   QUICK REWARDS — short contracts layered over the existing XP/oil/seal
   economy. Pure by design: the run owns the snapshot, this module owns the
   contract rules, and game/results own persistence and presentation.

   Contracts are intentionally not free currency. They rotate by run, ask for
   a real skill, and settle only when the run is completed. Blitz is the one
   exception because its normal ending is the shared clock expiring.
   ================================================================== */
var QuickRewards = (function(){
  var CATALOG = {
    streak7: {
      id:"streak7", group:"chain", name:"Sevenfold Flame",
      desc:"Reach a 7-answer streak.", type:"streak", target:7,
      xp:45, oil:0
    },
    streak12: {
      id:"streak12", group:"chain", name:"Overdrive Witness",
      desc:"Reach a 12-answer streak.", type:"streak", target:12,
      xp:80, oil:1
    },
    swift5: {
      id:"swift5", group:"precision", name:"Swift Hand",
      desc:"Give 5 answers in under 1.5 seconds.", type:"fast", target:5,
      xp:50, oil:0
    },
    swift8: {
      id:"swift8", group:"precision", name:"Cutting Edge",
      desc:"Give 8 answers in under 1.5 seconds.", type:"fast", target:8,
      xp:80, oil:1
    },
    wordsmith2: {
      id:"wordsmith2", group:"precision", name:"Wordsmith",
      desc:"Restore 2 assembled verses word for word.", type:"exact", target:2,
      xp:60, oil:0
    },
    wordsmith3: {
      id:"wordsmith3", group:"precision", name:"Master Scribe",
      desc:"Restore 3 assembled verses word for word.", type:"exact", target:3,
      xp:90, oil:1
    },
    cleanPage: {
      id:"cleanPage", group:"discipline", name:"Clean Page",
      desc:"Complete the run without a wrong answer.", type:"clean", target:1,
      xp:85, oil:1, endOnly:true
    },
    noCrutch: {
      id:"noCrutch", group:"discipline", name:"Bare Hands",
      desc:"Complete the run without spending a power.", type:"noPower", target:1,
      xp:105, oil:1, endOnly:true
    },
    wideCounsel: {
      id:"wideCounsel", group:"discipline", name:"Wide Counsel",
      desc:"Answer correctly from 5 different books.", type:"books", target:5,
      xp:60, oil:0
    },
    illumAscendant: {
      id:"illumAscendant", group:"mastery", name:"The Hidden Flame",
      desc:"Complete a run with a 12-answer streak without spending a power.",
      type:"illum", target:1, xp:150, oil:0, illuminate:1, endOnly:true, rare:true
    }
  };

  function copy(id){
    var g = CATALOG[id];
    return g ? Object.assign({}, g) : null;
  }

  function typedMode(mode){ return mode === "recall" || mode === "pilgrim-recall"; }

  function pick(mode, seed){
    var n = Math.abs(Number(seed) || 0);
    /* One chain contract always keeps the chase visible. Reaching 12 is an
       occasional hard variant, not the default every run. */
    var chain = (n % 4 === 3) ? "streak12" : "streak7";
    var precisionPool = typedMode(mode) ? ["wordsmith2", "wordsmith3"] : ["swift5", "swift8"];
    var disciplinePool = mode === "blitz"
      ? ["wideCounsel"]
      : ["cleanPage", "noCrutch", "wideCounsel"];
    var precision = precisionPool[n % precisionPool.length];
    /* The extra Illuminate is a rare mastery contract, offered only on
       modes long enough to prove a 12-chain. It replaces the third slot,
       so the player must choose whether to chase the hardest prize. */
    var longEnough = mode === "practice" || mode === "recall" ||
      mode === "trial" || mode === "endless" || mode === "daily";
    var discipline = (longEnough && n % 8 === 7)
      ? "illumAscendant"
      : disciplinePool[Math.floor(n / 2) % disciplinePool.length];
    return [copy(chain), copy(precision), copy(discipline)].filter(Boolean);
  }

  function value(goal, run){
    if(!goal || !run) return 0;
    if(goal.type === "streak") return Number(run.best) || 0;
    if(goal.type === "fast") return Number(run.fast) || 0;
    if(goal.type === "exact") return Number(run.typedExact) || 0;
    if(goal.type === "books"){
      if(run.booksRun && typeof run.booksRun.size === "number") return run.booksRun.size;
      return Number(run.books) || 0;
    }
    if(goal.type === "illum"){
      return Number(run.best) >= 12 && !run.usedPower ? 1 : 0;
    }
    if(goal.type === "clean") return run.missed && run.missed.length ? 0 : 1;
    if(goal.type === "noPower") return run.usedPower ? 0 : 1;
    return 0;
  }

  function complete(goal, run){
    return value(goal, run) >= goal.target && (!goal.endOnly || !!(run && run.quickSettling));
  }

  function canSettle(run, reason){
    if(!run) return false;
    if(reason === "complete") return true;
    /* Blitz ends by timeout rather than a conventional completion screen. */
    return run.mode === "blitz" && (reason === "death" || reason === "timeout-death");
  }

  function resolve(goals, run, reason){
    var settled = canSettle(run, reason);
    var settlingRun = Object.assign({}, run, {quickSettling:settled});
    var completed = (goals || []).filter(function(g){ return complete(g, settlingRun); });
    var paid = settled ? completed : [];
    return {
      goals: goals || [],
      completed: completed,
      paid: paid,
      settled: settled,
      xp: paid.reduce(function(n, g){ return n + (g.xp || 0); }, 0),
      oil: paid.reduce(function(n, g){ return n + (g.oil || 0); }, 0),
      illuminate: paid.reduce(function(n, g){ return n + (g.illuminate || 0); }, 0)
    };
  }

  function progress(goal, run){
    var v = Math.min(goal.target, value(goal, run));
    return { value:v, target:goal.target,
      complete:v >= goal.target && (!goal.endOnly || !!(run && run.quickSettling)) };
  }

  return { catalog:CATALOG, pick:pick, value:value, complete:complete,
    progress:progress, canSettle:canSettle, resolve:resolve };
})();

if(typeof module !== "undefined" && module.exports) module.exports = QuickRewards;
