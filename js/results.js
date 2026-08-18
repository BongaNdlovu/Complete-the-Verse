/* ==================================================================
   RESULTS — the end-of-run screen and its sequences.

   Split out of game.js along its natural seams. Classic script:
   defines globals only, and references game.js bindings at RUNTIME
   exclusively (enforced by engine-modules.test.js).
   ================================================================== */

/* ------------------------- END OF RUN ------------------------- */
function endRun(reason){
  /* Idempotent on purpose. This is the one function that writes
     permanent progress — records, XP, seals, and now a cleared site on
     the Pilgrimage — and it is reachable from two directions at once: a
     timer running out and a player locking an answer in the same tick.
     Running it twice would bank the run twice and count a site visit
     that never happened. The guard is cleared by startRun. */
  if(R.ended) return;
  R.ended = true;
  invalidateRun();
  clearSequence();
  hideSiteQuote();
  document.body.classList.remove("setpiece-active","overdrive","pressure-3","pressure-5","pressure-7");
  R.setpiece=null;
  const reachedV = (R.mode==="trial" && R.actIdx>=4);
  const trialWon = R.mode==="trial" && reason==="complete";
  const finished = reason==="complete";
  const isPilgrim = R.mode==="pilgrimage" || R.mode==="pilgrim-recall";
  // A site is cleared by answering every verse in it — surviving to the
  // end. Dying or abandoning leaves it exactly as it was.
  const siteCleared = isPilgrim && reason==="complete";
  /* Read BEFORE recordSiteResult writes, or every clear looks like a
     repeat. Walking new ground pays roughly double, so pushing further
     down the road always beats farming a site you have already beaten —
     without ever making the retry itself worthless. */
  const firstVisit = isPilgrim && R.siteId && !Pilgrimage.isCleared(SAVE.pilgrim, R.siteId);
  if(reason==="death" || reason==="abandon"){ Snd.death(); Backdrop.hit("death"); }
  else { Snd.victory(); Backdrop.hit("levelup"); }

  const acc = R.attempts ? R.correct/R.attempts : 0;
  // ---- bonuses ----
  const baseScore = R.score;
  const streakBonus = Math.round(R.best * 120 * R.diff.score);
  const accBonus = Math.round(acc * 1200 * R.diff.score);
  const survivalBonus = R.mode==="trial" ? Math.round((R.actIdx + (trialWon?1:0)) * 900 * R.diff.score)
                      : R.mode==="endless" ? Math.round(R.qTotal * 45 * R.diff.score)
                      : R.mode==="practice" ? Math.round(R.correct * 40 * R.diff.score)
                      // Recall pays more per verse: producing the words is
                      // strictly harder than recognising them, and an exact
                      // match is worth more than a forgiven typo.
                      : R.mode==="recall" ? Math.round((R.typedExact * 220 + R.typedClose * 120) * R.diff.score)
                      // The road pays by distance: a verse kept at Patmos is
                      // worth roughly double the same verse kept at Ur, which
                      // is the honest weighting when the clock has halved.
                      : isPilgrim ? Math.round(R.correct * 90 * R.diff.score *
                          (1 + Pilgrimage.positionOf(R.siteIndex)) * (siteCleared ? 1.35 : 1))
                      : Math.round(R.correct * 60 * R.diff.score);
  /* New ground pays. Shown as its own line rather than folded into a
     multiplier so the player can see exactly what the first clear was
     worth and why the second one pays less. */
  const firstClearBonus = (siteCleared && firstVisit)
    ? Math.round((baseScore + survivalBonus) * 0.9) : 0;
  const total = reason==="abandon" ? Math.round((baseScore + streakBonus + accBonus + survivalBonus) * 0.85)
              : baseScore + streakBonus + accBonus + survivalBonus + firstClearBonus;

  // ---- seals ----
  if(!hasSeal("first")) grantSeal("first");
  if(total>=25000) grantSeal("score25");
  if(total>=50000) grantSeal("score50");
  if(trialWon) grantSeal("sd15");
  if(trialWon && R.actIdx>=5) grantSeal("remnant");
  if(trialWon && R.actIdx>=5 && R.diff.key==="watchman") grantSeal("act6-watch");
  if(R.mode==="endless" && R.qTotal>=40) grantSeal("end40");
  if(trialWon && !R.usedPower) grantSeal("nocrutch");
  if(trialWon && R.missed.length===0) grantSeal("flawless");
  if(trialWon && R.diff.key==="watchman") grantSeal("ironman");

  // ---- persist ----
  SAVE.runs++;
  SAVE.life.bestStreak = Math.max(SAVE.life.bestStreak, R.best);
  if(R.mode==="trial") SAVE.life.sdBest = Math.max(SAVE.life.sdBest, R.sdCount);
  if(R.mode==="endless") SAVE.life.endlessBest = Math.max(SAVE.life.endlessBest, R.qTotal);
  /* The relay banks each site as it leaves it, so all that is left at
     the end is the one still underfoot — and only if it was finished. */
  if(R.mode==="relay" && R.relay){
    if(reason==="complete" && R.relay.current) bankRelaySite(R.relay.current.siteId);
    if(reason==="complete" && !hasSeal("relay")) grantSeal("relay");
  }
  const road = isPilgrim ? recordSiteResult(siteCleared, total, acc) : null;
  /* First clear opens the next place — remember it for the map ceremony. */
  if(road && road.firstClear && siteCleared){
    const nxt = Pilgrimage.currentSite(SAVE.pilgrim);
    if(nxt && nxt.id !== R.siteId && Pilgrimage.isUnlocked(SAVE.pilgrim, nxt.id)){
      pendingUnlockId = nxt.id;
    }
  }
  if(road && road.firstClear){
    if(!hasSeal("road-first")) grantSeal("road-first");
    if(road.after.arcs[0].complete && !hasSeal("road-arc1")) grantSeal("road-arc1");
    if(road.after.arcs.filter(a=>a.complete).length >= 2 && !hasSeal("road-half")) grantSeal("road-half");
    if(road.after.complete && !hasSeal("road-end")) grantSeal("road-end");
    if(R.siteId==="patmos" && !hasSeal("road-patmos")) grantSeal("road-patmos");
    /* One historical artifact per first site clear. */
    if(typeof Artifacts !== "undefined" && R.siteId){
      const u = Artifacts.unlockForSite(SAVE.artifacts, R.siteId, Date.now());
      SAVE.artifacts = u.store;
      if(u.firstUnlock && u.artifact) queueArtifactReveal(u.artifact);
    }
  }
  /* Read straight off the saved journey rather than off `road`, because
     the relay banks its sites itself and never produces a `road`.
     Checked on every finish, not only a first clear: perfecting an arc
     usually means going back to tidy up a site you scraped through. */
  if(isPilgrim || R.mode==="relay"){
    Pilgrimage.overview(SAVE.pilgrim).arcs.forEach(a=>{
      if(a.perfect && !hasSeal("arc-"+a.key)) grantSeal("arc-"+a.key);
    });
  }
  // ---- habit streak ----
  if(isPilgrim && (finished || siteCleared)){
    if(!SAVE.habit) SAVE.habit = { count: 0, lastDate: "", lastDay: 0, best: 0, history: {} };
    const todayD = (typeof SRS !== "undefined" && SRS.dayNumber) ? SRS.dayNumber() : Math.floor(Date.now() / 86400000);
    const prevD = SAVE.habit.lastDay || (SAVE.habit.lastDate ? ((typeof SRS !== "undefined" && SRS.dayNumber) ? SRS.dayNumber(new Date(SAVE.habit.lastDate)) : 0) : 0);
    
    if(prevD === todayD){
      // Already recorded today
    } else if(prevD === todayD - 1){
      SAVE.habit.count = (SAVE.habit.count || 0) + 1;
      SAVE.habit.lastDay = todayD;
      SAVE.habit.lastDate = todayKey();
    } else {
      SAVE.habit.count = 1;
      SAVE.habit.lastDay = todayD;
      SAVE.habit.lastDate = todayKey();
    }
    SAVE.habit.best = Math.max(SAVE.habit.best || 0, SAVE.habit.count);
    if(!SAVE.habit.history) SAVE.habit.history = {};
    SAVE.habit.history[todayKey()] = 1;

    if(SAVE.habit.count >= 7 && !hasSeal("seventh-lamp")){
      grantSeal("seventh-lamp");
      if(typeof Cinematic !== "undefined" && Cinematic.playSeventhLamp){
        Cinematic.playSeventhLamp({ streak: SAVE.habit.count });
      }
    } else if(SAVE.habit.count >= 14 && !hasSeal("streak14")){
      grantSeal("streak14");
      if(typeof Cinematic !== "undefined" && Cinematic.playSeventhLamp){
        Cinematic.playSeventhLamp({ streak: 14 });
      }
    } else if(SAVE.habit.count >= 30 && !hasSeal("streak30")){
      grantSeal("streak30");
      if(typeof Cinematic !== "undefined" && Cinematic.playSeventhLamp){
        Cinematic.playSeventhLamp({ streak: 30 });
      }
    }
  }

  const recordScore = R.mode==="blitz" ? (R.correct||0) : total;
  const isRecord = recordScore > (SAVE.best[R.mode]||0);
  const prevBest = SAVE.best[R.mode]||0;
  if(isRecord) SAVE.best[R.mode] = recordScore;

  let dailyRecorded = false;
  /* Only a finished run spends the day's shot. A death or an abandon is
     practice: locking the day because a run ended early punished exactly
     the mis-tap the mode cannot guard against. */
  if(R.mode==="daily" && reason==="complete" && SAVE.daily.date !== todayKey()){
    SAVE.daily = {date:todayKey(), score:total};
    SAVE.life.dailyDone++; dailyRecorded = true;
  }
  SAVE.board.push({score:total, mode:R.mode, diff:R.diff.key, acc:Math.round(acc*100), date:todayKey(), q:R.qTotal});
  SAVE.board.sort((a,b)=>b.score-a.score);
  SAVE.board = SAVE.board.slice(0,10);

  // ---- xp ----
  const beforeLvl = levelInfo(SAVE.xp).level;
  const xpGain = Math.round(total/12 + R.correct*14 + (finished?300:0));
  SAVE.xp += xpGain;
  const afterInfo = levelInfo(SAVE.xp);
  checkMetaSeals();
  persist();

  /* Local PB ghosts for progress marker */
  const survivedMs = Math.max(0, Date.now() - (R.startedAt||Date.now()));
  if(R.ghostSamples && R.ghostSamples.length){
    const key = R.mode==="blitz" ? "blitz" : (isPilgrim ? "pilgrimage" : null);
    if(key){
      const prev = SAVE.ghosts && SAVE.ghosts[key];
      const ghostScore = R.mode==="blitz" ? (R.correct||0) : total;
      if(!prev || ghostScore >= (prev.score||0)){
        SAVE.ghosts = SAVE.ghosts || {};
        SAVE.ghosts[key] = { score: ghostScore, samples: R.ghostSamples, total_ms: survivedMs };
      }
    }
  }
  if(R.mode==="blitz"){
    SAVE.life.blitzBest = Math.max(SAVE.life.blitzBest||0, R.correct||0);
  }
  /* Journal entry for pilgrimage */
  if(isPilgrim && R.siteId){
    SAVE.journal = SAVE.journal || [];
    SAVE.journal.unshift({
      at: todayKey(), siteId: R.siteId, cleared: !!siteCleared,
      score: total, acc: Math.round(acc*100), name: (Pilgrimage.site(R.siteId)||{}).name||R.siteId
    });
    SAVE.journal = SAVE.journal.slice(0, 40);
  }

  /* Cloud: board scores + optional pilgrimage ghost (best only).
     lastSubmitVia is only set after the async submit settles, so the
     Honor-system tag is painted from the promise, not this tick. */
  function refreshSubmitTrust(){
    if(currentView!=="results") return;
    fillResultsBoard(R.mode);
    if(typeof updateCloudChip==="function") updateCloudChip();
  }
  function trackSubmit(p){
    if(p && typeof p.then==="function") p.then(refreshSubmitTrust, refreshSubmitTrust);
  }
  if(typeof Cloud!=="undefined" && Cloud.configured() && Cloud.isSignedIn()){
    if(dailyRecorded){
      trackSubmit(Cloud.submitDailyScore({
        play_date: todayKey(),
        score: total,
        accuracy: Math.round(acc*100),
        duration_ms: survivedMs,
        diff: R.diff.key
      }));
    }
    if(R.mode==="blitz"){
      trackSubmit(Cloud.submitBlitzScore({
        score: R.correct||0,
        survived_ms: survivedMs,
        diff: R.diff.key
      }));
    }
    if(isPilgrim && siteCleared && total > 0){
      const ov = Pilgrimage.overview(SAVE.pilgrim);
      const p = ov.total ? ov.cleared / ov.total : 0;
      Cloud.upsertGhost("pilgrimage", "road", SAVE.best.pilgrimage||total, {
        version: 1,
        samples: R.ghostSamples || [{ t: 0, p: 0 }, { t: survivedMs, p: p }],
        total_ms: survivedMs,
        end_p: p
      }, { siteId: R.siteId, cleared: ov.cleared, total: ov.total });
    }
  }

  renderResults({reason, total, baseScore, streakBonus, accBonus, survivalBonus, acc,
    xpGain, beforeLvl, afterInfo, isRecord, prevBest, dailyRecorded, road, siteCleared,
    firstClearBonus, survivedMs});
  go("results");
}

function renderResults(o){
  $("res-kick").textContent =
    o.reason==="abandon" ? "The run was abandoned" :
    o.reason==="complete" && R.mode==="trial" && R.actIdx>=5 ? "The Remnant is complete" :
    o.reason==="complete" && R.mode==="trial" ? "The Final Test is complete" :
    o.reason==="complete" && R.mode==="daily" ? "The daily reading is finished" :
    o.reason==="complete" && R.mode==="practice" ? "The drill is finished" :
    o.reason==="complete" && R.mode==="recall" ? "You wrote them out from memory" :
    R.mode==="blitz" ? "The blitz clock ran out" :
    (R.mode==="trial" && R.actIdx>=5) ? "The Remnant ended the run" :
    (R.mode==="trial" && R.actIdx===4) ? "The Final Test ended the run" :
    R.mode==="endless" ? "The gauntlet closed" : "The trial is ended";
  document.body.classList.remove("blitz-edge","blitz-edge-2","blitz-edge-3");
  $("res-rank").textContent = runTitle(o.total);
  $("res-score").textContent = "0";

  $("res-breakdown").innerHTML =
    row("Verses kept", fmt(o.baseScore)) +
    row("Longest streak ×"+R.best, "+"+fmt(o.streakBonus)) +
    row("Accuracy "+Math.round(o.acc*100)+"%", "+"+fmt(o.accBonus)) +
    row(R.mode==="trial" ? "Acts survived" : R.mode==="endless" ? "Distance"
        : R.mode==="relay" ? "Sites walked" : "Verses answered", "+"+fmt(o.survivalBonus)) +
    (o.firstClearBonus ? row("New ground — first clear", "+"+fmt(o.firstClearBonus)) : "") +
    '<div class="brow tot"><span>Final</span><b>'+fmt(o.total)+'</b></div>';
  function row(a,b){ return '<div class="brow"><span>'+esc(a)+'</span><b>'+esc(b)+'</b></div>'; }

  /* What the run did to your schedule. Without this the spacing is
     invisible and the player has no reason to believe it exists. */
  const sched = $("res-schedule");
  if(sched){
    if(R.rescheduled.length){
      const back = R.rescheduled.filter(x=>!x.correct).length;
      const soonest = R.rescheduled.reduce((m,x)=>Math.min(m,x.ivl), Infinity);
      const furthest = R.rescheduled.reduce((m,x)=>Math.max(m,x.ivl), 0);
      sched.innerHTML = '<div class="mtitle">Next review</div>' +
        '<div class="schedrow"><b>'+R.rescheduled.length+'</b><span>verses rescheduled</span></div>' +
        '<div class="schedrow"><b>'+back+'</b><span>back tomorrow</span></div>' +
        '<div class="schedrow"><b>'+(furthest>=1?furthest:1)+'</b><span>longest gap, in days</span></div>' +
        '<div class="schedhint">Due today: '+dueToday()+' verses.</div>';
      sched.style.display = "";
    } else sched.style.display = "none";
  }

  $("res-stats").innerHTML =
    stat(R.correct, "Verses kept") +
    (R.typed ? stat(R.typedExact, "Word for word") + stat(R.typedClose, "Close enough") : "") +
    stat(R.best, "Best streak") +
    stat(R.mode==="trial" ? ACTS[R.actIdx].n : R.qTotal, R.mode==="trial" ? "Act reached" : "Questions") +
    stat(Math.round(o.acc*100)+"%", "Accuracy") +
    stat(R.booksRun.size, "Books touched") +
    stat(R.timedDecisions ? (R.decisionMs/R.timedDecisions/1000).toFixed(1)+"s" : "—", "Average response") +
    stat(Number.isFinite(R.fastestMs) ? (R.fastestMs/1000).toFixed(1)+"s" : "—", "Fastest response") +
    stat(R.powersSpent, "Lifelines spent");
  function stat(a,b){ return '<div class="stat"><b>'+esc(String(a))+'</b><span>'+esc(b)+'</span></div>'; }

  $("xp-lvl").textContent = "Level "+o.afterInfo.level+" · "+rankFor(o.afterInfo.level);
  $("xp-gain").textContent = "+"+fmt(o.xpGain)+" XP";
  $("xp-fill").style.width = "0%";
  const seals = pendingSeals.slice();
  pendingSeals = [];
  $("res-seals").innerHTML = "";

  const m=$("res-missed");
  if(R.missed.length){
    m.innerHTML='<div class="mtitle">Verses that got away — learn these</div>'+
      R.missed.map(q=>'<div class="mrow"><i>'+esc(q.r)+'</i>'+esc(q.p)+' <em>'+esc(q.a)+'</em>'+sep(q.s)+esc(q.s)+'</div>').join("");
  } else {
    m.innerHTML='<div class="mtitle">Not one verse lost</div><div class="mrow" style="text-align:center">Flawless. Every word held.</div>';
  }
  const missedPanel=$("res-details-missed");
  if(missedPanel) missedPanel.open = R.missed.length > 0;

  let best = "";
  if(R.mode==="blitz"){
    if(o.isRecord) best = "New "+MODES[R.mode].name+" record — previous "+fmt(o.prevBest)+" verses";
    else best = MODES[R.mode].name+" best — "+fmt(SAVE.best[R.mode]||0)+" verses";
  } else {
    if(o.isRecord) best = "New "+MODES[R.mode].name+" record — previous "+fmt(o.prevBest);
    else best = MODES[R.mode].name+" best — "+fmt(SAVE.best[R.mode]||0);
  }
  if(R.mode==="daily" && !o.dailyRecorded) best += " · today's score already recorded (practice run)";
  $("res-best").textContent = best;
  const shareBtn=$("res-share");
  if(shareBtn){
    shareBtn.style.display = R.mode==="daily" ? "" : "none";
    shareBtn.onclick = ()=>shareDailyResult(o.total);
  }

  const habitEl = $("res-habit-streak");
  if(habitEl){
    const hCount = (SAVE.habit && SAVE.habit.count) || 0;
    let lampsHtml = "";
    for(let l = 1; l <= 7; l++){
      const lit = l <= hCount;
      lampsHtml += '<i class="h-lamp ' + (lit ? 'lit' : 'dim') + (l === 7 ? ' sabbath' : '') + '" title="Day ' + l + '"></i>';
    }
    habitEl.innerHTML = '<div class="h-label">Habit Streak · <b>' + hCount + ' Day' + (hCount === 1 ? '' : 's') + '</b></div><div class="h-row">' + lampsHtml + '</div>';
    habitEl.style.display = "";
  }

  /* On the road, the results screen reports where you are rather than
     just what you scored, and sends you back to the map instead of the
     main hall. */
  const isPilgrim = R.mode==="pilgrimage" || R.mode==="pilgrim-recall";
  const onRoad = isPilgrim || R.mode==="relay";
  const roadBtn=$("res-road");
  if(roadBtn){
    roadBtn.style.display = onRoad ? "" : "none";
    roadBtn.onclick = ()=>{ Snd.ui(); go("atlas"); };
  }

  /* After a first clear that unlocks new ground, auto-return to the map
     for the unlock ceremony. "On to next" still works for replaying. */
  const nextBtn=$("res-next");
  const autoUnlock = !!(pendingUnlockId && isPilgrim && o.siteCleared && o.road && o.road.firstClear);
  if(nextBtn){
    const nxt = isPilgrim && o.siteCleared ? Pilgrimage.currentSite(SAVE.pilgrim) : null;
    const showNext = !!(nxt && !Pilgrimage.isCleared(SAVE.pilgrim, nxt.id));
    nextBtn.style.display = showNext && !autoUnlock ? "" : "none";
    if(showNext && !autoUnlock){
      nextBtn.textContent = "On to " + nxt.name.replace(/\s*\(.*\)$/, "");
      nextBtn.onclick = ()=>{ Snd.unlock(); Snd.ui(); openSiteBrief(nxt.id, "pilgrimage"); };
    }
    if(autoUnlock){
      if(roadBtn){
        roadBtn.style.display = "";
        roadBtn.textContent = "See the road open";
      }
    }
  }

  if(R.mode==="relay" && R.relay){
    const arc = Pilgrimage.arc(R.relay.arcKey);
    const done = R.relay.banked.length, all = R.relay.sites.length;
    $("res-kick").textContent = o.reason==="complete"
      ? (arc ? arc.name + " — walked without rest" : "The arc is walked")
      : "The road ended early";
    $("res-best").textContent = done === all
      ? "Every site from " + (Pilgrimage.site(R.relay.sites[0])||{name:""}).name + " onward is cleared"
      : done + " of " + all + " sites banked before the road ended · they stay cleared";
  }
  if(isPilgrim && o.road){
    const site = Pilgrimage.site(R.siteId);
    const nxt = Pilgrimage.currentSite(SAVE.pilgrim);
    $("res-kick").textContent = o.siteCleared
      ? (site ? site.name + " is behind you" : "The site is cleared")
      : (site ? site.name + " holds" : "The site holds");
    const line = o.siteCleared
      ? o.road.after.complete
        ? "Every site from Ur to Patmos is cleared. The road is walked."
        : "The road opens to " + (nxt ? nxt.name : "the next site") +
          " · " + o.road.after.cleared + " of " + o.road.after.total + " sites"
      : "Walk it again when you are ready · " + o.road.after.cleared +
        " of " + o.road.after.total + " sites cleared";
    $("res-best").textContent = line;
  }

  /* Retry failed site without map round-trip */
  const retryBtn = $("res-retry");
  if(retryBtn){
    const showRetry = isPilgrim && !o.siteCleared && R.siteId;
    retryBtn.style.display = showRetry ? "" : "none";
    if(showRetry){
      retryBtn.onclick = ()=>{ Snd.unlock(); Snd.ui(); pendingSiteId = R.siteId; startRun("pilgrimage", R.diff.key); };
    }
  }

  /* Review missed verses action */
  const reviewMissedBtn = $("res-review-missed");
  if(reviewMissedBtn){
    const missedVerses = reviewableMissed(R.missed);
    reviewMissedBtn.style.display = missedVerses.length ? "" : "none";
    if(missedVerses.length){
      reviewMissedBtn.onclick = ()=>{
        Snd.unlock();
        startRun("practice", SAVE.set.diff, { queue: missedVerses });
      };
    }
  }

  fillResultsBoard(R.mode);
  fillResultsInsights(R.missed[0] || R.q);
  updatePlayerCard();
  playResultsSequence(o, seals, autoUnlock);
}

function afterResults(delay, fn){
  const token = R.runToken;
  return setTimeout(function(){
    if(R.runToken!==token || currentView!=="results") return;
    fn();
  }, delay);
}
function countUpScore(total){
  const el = $("res-score");
  if(!el) return;
  const t0 = performance.now();
  (function count(t){
    if(currentView!=="results") return;
    const k = Math.min(1, (t-t0)/1200), e = 1-Math.pow(1-k,3);
    el.textContent = fmt(total*e);
    if(k<1) requestAnimationFrame(count);
  })(t0);
}
function presentSeal(s){
  if(!s) return;
  const row = $("res-seals");
  if(row){
    const el = document.createElement("div");
    el.className = "sealwin";
    el.innerHTML = "<b>"+esc(s.n)+"</b><span>"+esc(s.d)+"</span>";
    row.appendChild(el);
  }
  if(!s.announced){
    Snd.seal();
    toast("Seal unlocked — "+s.n);
  }
}
function playResultsSequence(o, seals, autoUnlock){
  seals = seals || [];
  const quiet = !!(SAVE.set.reduced || document.body.classList.contains("reduced"));
  const beat = quiet ? 180 : 900;
  let t = 0;

  afterResults(t, function(){ Director.ending(o); });
  t += quiet ? 240 : 2200;

  afterResults(t, function(){ countUpScore(o.total); });
  t += quiet ? 400 : 1400;

  afterResults(t, function(){
    const fill = $("xp-fill");
    if(fill && o.afterInfo) fill.style.width = (o.afterInfo.into/o.afterInfo.need*100)+"%";
  });
  t += quiet ? 180 : 700;

  seals.forEach(function(s, i){
    afterResults(t + i*beat, function(){ presentSeal(s); });
  });
  t += seals.length * beat + (seals.length ? 280 : 0);

  if(o.afterInfo && o.afterInfo.level > o.beforeLvl){
    afterResults(t, function(){
      Snd.level(); Backdrop.hit("levelup");
      toast("Level "+o.afterInfo.level+" — "+rankFor(o.afterInfo.level));
    });
    t += quiet ? 280 : 1400;
  }

  afterResults(t, function(){
    function finish(){
      if(!autoUnlock) return;
      afterResults(quiet ? 200 : 900, function(){
        Snd.ui();
        go("atlas");
      });
    }
    if(pendingReveals.length) flushRevealsAfterResults(finish);
    else finish();
  });
}
/* Set-piece failures are pushed as {r,p,a,s} with no bank id. Those
   cannot start a Drill question (recordVerse would key SAVE.verse[undefined]). */
function reviewableMissed(missed){
  const out = [];
  const seen = {};
  (missed||[]).forEach(m=>{
    const cand = m && (m.verse || m);
    if(!cand || !cand.id) return;
    const v = (typeof BY_ID!=="undefined" && BY_ID[cand.id]) || cand;
    if(!v || !v.id || v.a==null || seen[v.id]) return;
    seen[v.id] = 1;
    out.push(v);
  });
  return out;
}
function boardRowHtml(r, extra){
  return '<div class="board-row'+(r.mine?" mine":"")+'">'+
    '<span class="rk">#'+r.rank+'</span>'+
    '<span class="nm">'+esc(r.name)+(r.mine?' <i class="you-pill">You</i>':'')+'</span>'+
    '<b>'+esc(extra || fmt(r.score))+'</b></div>';
}
function fillResultsBoard(mode){
  const el = $("res-board");
  if(!el) return;
  el.innerHTML = "";
  el.style.display = "none";
  if(typeof Cloud==="undefined" || !Cloud.configured()) return;
  const trustTag = (typeof Cloud!=="undefined" && typeof Cloud.lastSubmitVia === "function" && Cloud.lastSubmitVia() === "direct")
    ? ' <span class="trust-pill">(Honor system)</span>' : '';
  if(mode==="daily"){
    el.style.display = "";
    el.innerHTML = '<div class="mtitle">Daily board · '+esc(todayKey())+trustTag+'</div><div class="board-loading">Loading…</div>';
    Promise.all([
      Cloud.fetchDailyBoard(todayKey(), 15),
      Cloud.isSignedIn() ? Cloud.fetchMyDailyRank(todayKey()) : Promise.resolve(null)
    ]).then(([rows, mine])=>{
      if(!rows.length){
        el.innerHTML = '<div class="mtitle">Daily board · '+esc(todayKey())+trustTag+'</div>'+
          '<div class="empty">No scores yet today. Be the first — finish a Daily Trial while signed in.</div>';
        return;
      }
      let html = '<div class="mtitle">Daily board · '+esc(todayKey())+trustTag+'</div>'+
        rows.map(r=>boardRowHtml(r, fmt(r.score)+(r.accuracy!=null?' · '+Math.round(r.accuracy)+'%':''))).join("");
      if(mine && !rows.some(r=>r.mine)){
        html += '<div class="board-you-sep">Your rank</div>'+boardRowHtml(mine, fmt(mine.score));
      }
      el.innerHTML = html;
    }).catch(()=>{
      el.innerHTML = '<div class="mtitle">Daily board</div><div class="empty">Could not load the board. Check your connection.</div>';
    });
  } else if(mode==="blitz"){
    el.style.display = "";
    el.innerHTML = '<div class="mtitle">Blitz board'+trustTag+'</div><div class="board-loading">Loading…</div>';
    Promise.all([
      Cloud.fetchBlitzBoard(15),
      Cloud.isSignedIn() ? Cloud.fetchMyBlitzRank() : Promise.resolve(null)
    ]).then(([rows, mine])=>{
      if(!rows.length){
        el.innerHTML = '<div class="mtitle">Blitz board'+trustTag+'</div><div class="empty">No blitz scores yet. Survive a Blitz run while signed in.</div>';
        return;
      }
      let html = '<div class="mtitle">Blitz board'+trustTag+'</div>'+
        rows.map(r=>{
          const sec = r.survived_ms != null ? Math.round(r.survived_ms/1000)+'s' : '';
          return boardRowHtml(r, fmt(r.score)+' verses'+(sec?' · '+sec:''));
        }).join("");
      if(mine && !rows.some(r=>r.mine)){
        html += '<div class="board-you-sep">Your rank</div>'+boardRowHtml(mine, fmt(mine.score)+' verses');
      }
      el.innerHTML = html;
    }).catch(()=>{
      el.innerHTML = '<div class="mtitle">Blitz board</div><div class="empty">Could not load the board. Check your connection.</div>';
    });
  }
}
function fillResultsInsights(v){
  const el = $("res-insights");
  if(!el) return;
  if(!v || typeof Polish==="undefined"){ el.style.display="none"; return; }
  const info = Polish.insightForVerse(v);
  const cross = Polish.crossRefsInBank(v, typeof VERSES!=="undefined"?VERSES:[], 3);
  info.crossRefs = cross;
  el.style.display = "";
  el.innerHTML =
    '<div class="mtitle">Scroll of Insights · '+esc(info.ref||info.book)+'</div>'+
    '<div class="insight-grid">'+
      '<div><b>Author</b><span>'+esc(info.author)+'</span></div>'+
      '<div><b>Era</b><span>'+esc(info.era)+'</span></div>'+
      '<div><b>Audience</b><span>'+esc(info.audience)+'</span></div>'+
      '<div><b>Theme</b><span>'+esc(info.theme)+'</span></div>'+
    '</div>'+
    (info.roots && info.roots.length
      ? '<div class="insight-roots">'+info.roots.map(r=>'<i>'+esc(r.w)+'</i> '+esc(r.m)).join(" · ")+'</div>'
      : '')+
    (cross.length ? '<div class="insight-cross">Also see: '+cross.map(esc).join(", ")+'</div>' : '');
}
$("res-again").addEventListener("click", ()=>{ Snd.ui(); startRun(R.mode, R.diff.key); });

