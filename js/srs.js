/* ==================================================================
   SRS — spaced repetition with real due dates.

   The previous "Practice Misses" mode weighted verses by lifetime
   accuracy: a verse you missed once a year ago and a verse you missed
   this morning looked identical, and a verse you had nailed three times
   running kept coming back at the same rate forever. Neither is how
   memory works.

   This is SM-2 (Anki's ancestor) with the standard easiness update,
   scheduling in whole days so that "due" means the same thing however
   the day is sliced up. Everything here is pure — no DOM, no clock
   beyond an injected `today` — because the scheduling is the part that
   has to be right and the part worth testing.
   ================================================================== */

var SRS = (function(){

  var MIN_EF = 1.3;
  var START_EF = 2.5;
  var MAX_INTERVAL = 365;

  /* Days since the epoch, in LOCAL time. Using UTC here would roll the
     day over mid-evening for anyone west of Greenwich and mid-morning
     for anyone far enough east — the daily streak would break for them
     while they were still awake on the same calendar day. */
  function dayNumber(date){
    var d = date || new Date();
    // Local calendar date, counted in UTC days. Taking the local Y/M/D and
    // reprojecting through Date.UTC keeps a daylight-saving shift from
    // moving the boundary by an hour and dropping or repeating a day.
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  function freshCard(){
    return { ef: START_EF, reps: 0, ivl: 0, due: 0, lapses: 0, last: 0 };
  }

  /* Answer quality on SM-2's 0-5 scale.
       5  right, and quickly — the recall was fluent
       4  right at a normal pace
       3  right but laboured, or propped up by a lifeline
       2  wrong, but the shape was there (a near miss when typing)
       1  wrong
       0  no answer at all
     `fraction` is time used as a share of the clock. */
  function gradeAnswer(o){
    o = o || {};
    if(o.timedOut) return 0;
    if(!o.correct) return o.near ? 2 : 1;
    if(o.usedPower) return 3;
    var f = typeof o.fraction === "number" ? o.fraction : 0.5;
    if(o.near) return 3;                 // typed it close enough, not exact
    if(f <= 0.4) return 5;
    if(f <= 0.8) return 4;
    return 3;
  }

  /* The SM-2 step. Returns a NEW card; never mutates the input. */
  function schedule(card, quality, today){
    var c = card ? {
      ef: card.ef, reps: card.reps, ivl: card.ivl,
      due: card.due, lapses: card.lapses, last: card.last
    } : freshCard();
    if(typeof c.ef !== "number" || !isFinite(c.ef)) c.ef = START_EF;
    var q = Math.max(0, Math.min(5, Math.round(quality)));

    if(q >= 3){
      if(c.reps === 0) c.ivl = 1;
      else if(c.reps === 1) c.ivl = 6;
      else c.ivl = Math.round(c.ivl * c.ef);
      c.reps += 1;
    } else {
      // A lapse sends the verse back to tomorrow but keeps its history,
      // so a verse you have repeatedly lost stays easy to spot.
      c.reps = 0;
      c.ivl = 1;
      c.lapses += 1;
    }

    // Standard SM-2 easiness update. Applied on every review, including
    // failures, which is what makes a chronically hard verse come back
    // faster than a merely new one.
    c.ef = c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if(c.ef < MIN_EF) c.ef = MIN_EF;

    if(c.ivl > MAX_INTERVAL) c.ivl = MAX_INTERVAL;
    c.last = today;
    c.due = today + c.ivl;
    return c;
  }

  function isDue(card, today){
    return !card || !card.reps ? true : card.due <= today;
  }
  /* Negative = not due yet. Bigger = more overdue. */
  function overdueBy(card, today){
    if(!card || !card.reps) return 0;
    return today - card.due;
  }

  /* Ordering for a drill. A session should open with what has actually
     fallen due, most overdue first, then bring in new material, and only
     then touch anything still comfortably scheduled.

       0  due (most overdue first)
       1  never seen
       2  seen, not yet due (soonest first) */
  function queueRank(card, today){
    if(!card || !card.reps){
      // A lapsed card has reps 0 but a history — that is not new material.
      if(card && card.lapses) return { band: 0, sort: -(today - card.due) };
      return { band: 1, sort: 0 };
    }
    if(card.due <= today) return { band: 0, sort: -(today - card.due) };
    return { band: 2, sort: card.due - today };
  }

  /* Build the drill list. `cardFor(verse)` returns that verse's card or
     undefined. Ties are broken by the caller-supplied shuffle so a drill
     is not identical every time. */
  function buildQueue(verses, cardFor, today, limit, shuffle){
    var mixed = (shuffle || function(a){ return a; })(verses.slice());
    var ranked = mixed.map(function(v, i){
      var r = queueRank(cardFor(v), today);
      return { v: v, band: r.band, sort: r.sort, i: i };
    });
    ranked.sort(function(a, b){
      return (a.band - b.band) || (a.sort - b.sort) || (a.i - b.i);
    });
    var out = ranked.map(function(x){ return x.v; });
    return typeof limit === "number" ? out.slice(0, limit) : out;
  }

  /* How many verses have actually fallen due. Never-seen verses are new
     material, not a backlog, so they are not counted — a first-time player
     should see "nothing due", not "305 due". A lapsed card still has to
     respect its due date like any other. */
  function dueCount(verses, cardFor, today){
    var n = 0;
    for(var i = 0; i < verses.length; i++){
      var c = cardFor(verses[i]);
      if(c && (c.reps || c.lapses) && c.due <= today) n++;
    }
    return n;
  }

  /* How settled a verse is, for the Study Hall. */
  function strength(card){
    if(!card || (!card.reps && !card.lapses)) return "unseen";
    if(!card.reps) return "lapsed";
    if(card.reps >= 3 && card.ivl >= 21) return "held";
    return "learning";
  }

  return {
    MIN_EF: MIN_EF, START_EF: START_EF, MAX_INTERVAL: MAX_INTERVAL,
    dayNumber: dayNumber, freshCard: freshCard, gradeAnswer: gradeAnswer,
    schedule: schedule, isDue: isDue, overdueBy: overdueBy, queueRank: queueRank,
    buildQueue: buildQueue, dueCount: dueCount, strength: strength
  };
})();

if(typeof module !== "undefined" && module.exports) module.exports = SRS;
