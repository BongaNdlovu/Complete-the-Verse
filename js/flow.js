/* ==================================================================
   FLOW — event handoffs, wipe timing, dedicated break/dead-end states.

   Describes what leaving a view must stop and when a rightward wipe
   is allowed. The DOM lives in game.js; this file is the contract.
   ================================================================== */
var Flow = (function(){

  var WIPE_MS = 750;
  var JUDGE_MS = 820;
  var VIEWS = ["boot","intro","menu","brief","sitebrief","atlas","act","play",
               "results","study","relics","seals","records","settings"];

  var STATES = {
    "load-fail": {
      kick: "The record will not open",
      title: "The witness is silent",
      body: "The verse bank did not load. Nothing on this device can start a trial until the record is present.",
      primary: "Retry",
      secondary: "Stay here"
    },
    "cloud-fail": {
      kick: "The far record",
      title: "The cloud did not answer",
      body: "This device still holds your local progress. You can keep playing; the remote board is the only thing that failed.",
      primary: "Continue locally",
      secondary: "Retry sync"
    },
    "empty-drill": {
      kick: "The drill",
      title: "No verses to serve",
      body: "The bank is empty on this device, so the Drill has nothing due and nothing unseen.",
      primary: "Return to the hall",
      secondary: ""
    },
    "empty-draw": {
      kick: "The road",
      title: "This place has no reading",
      body: "The site could not draw verses. The road is intact; this stop cannot open until the bank can serve it.",
      primary: "Back to the map",
      secondary: "Return to the hall"
    },
    "fallen": {
      kick: "The lamps are out",
      title: "The line did not hold",
      body: "No life remains. The record of this run is kept. See what was held, and what was lost.",
      primary: "See the record",
      secondary: ""
    },
    "timeout-death": {
      kick: "The clock fell",
      title: "The last second closed",
      body: "Time ended the run. The words remain. The record of the attempt is kept.",
      primary: "See the record",
      secondary: ""
    }
  };

  /* Leaving play for the act card must not kill the run. Leaving play
     for anywhere else dumps the chrome that would leak onto the hall. */
  function leavePlay(to){
    var keepRun = to === "act";
    return {
      stopTimer: true,
      stopLoop: !keepRun,
      hideWipe: true,
      hidePause: true,
      hideJudge: true,
      hideOverdrive: !keepRun,
      hideQuote: !keepRun,
      clearPlayClasses: !keepRun,
      bumpScene: !keepRun
    };
  }

  function leaveView(from, to){
    if(from === to) return { same: true };
    var out = { from: from, to: to, unmountAtlas: from === "atlas" && to !== "atlas" };
    if(from === "play"){
      var p = leavePlay(to);
      Object.keys(p).forEach(function(k){ out[k] = p[k]; });
    }
    if(to !== "play") out.hideState = from !== "play" || to !== "results";
    return out;
  }

  /* A wipe plays only when another question is about to be served.
     Act cards, set-pieces, results and death are their own beats. */
  function shouldWipe(ctx){
    if(!ctx || ctx.ended || ctx.reduced) return false;
    if(ctx.toAct || ctx.toSetpiece || ctx.toEnd || ctx.toDeath) return false;
    return true;
  }

  function state(kind){
    return STATES[kind] || null;
  }

  return {
    WIPE_MS: WIPE_MS, JUDGE_MS: JUDGE_MS, VIEWS: VIEWS, STATES: STATES,
    leavePlay: leavePlay, leaveView: leaveView, shouldWipe: shouldWipe,
    state: state
  };
})();

if(typeof module !== "undefined" && module.exports) module.exports = Flow;
