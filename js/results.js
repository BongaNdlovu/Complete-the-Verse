/* ==================================================================
   RESULTS — the end-of-run screen and its sequences.

   Split out of game.js along its natural seams. Classic script:
   defines globals only, and references game.js bindings at RUNTIME
   exclusively (enforced by engine-modules.test.js).
   ================================================================== */

/* ------------------------- END OF RUN ------------------------- */
function endRunSurvivalBonus(trialWon, isPilgrim, siteCleared){
  if(R.mode==="trial") return Math.round((R.actIdx + (trialWon?1:0)) * 900 * R.diff.score);
  if(R.mode==="endless") return Math.round(R.qTotal * 45 * R.diff.score);
  if(R.mode==="practice") return Math.round(R.correct * 40 * R.diff.score);
  if(R.mode==="recall") return Math.round((R.typedExact * 220 + R.typedClose * 120) * R.diff.score);
  if(isPilgrim) return Math.round(R.correct * 90 * R.diff.score *
    (1 + Pilgrimage.positionOf(R.siteIndex)) * (siteCleared ? 1.35 : 1));
  return Math.round(R.correct * 60 * R.diff.score);
}

function endRunGrantSeals(total, trialWon, finished){
  if(R.mode==="team") return;
  if(finished && !hasSeal("first")) grantSeal("first");
  if(total>=25000) grantSeal("score25");
  if(total>=50000) grantSeal("score50");
  if(trialWon) grantSeal("sd15");
  if(trialWon && R.actIdx>=5) grantSeal("remnant");
  if(trialWon && R.actIdx>=5 && R.diff.key==="watchman") grantSeal("act6-watch");
  if(R.mode==="endless" && R.qTotal>=40) grantSeal("end40");
  if(trialWon && !R.usedPower) grantSeal("nocrutch");
  if(trialWon && R.missed.length===0) grantSeal("flawless");
  if(trialWon && R.diff.key==="watchman") grantSeal("ironman");
}

function endRunBankRelay(reason){
  if(R.mode!=="relay" || !R.relay) return;
  if(reason==="complete" && R.relay.current) bankRelaySite(R.relay.current.siteId);
  if(reason==="complete" && !hasSeal("relay")) grantSeal("relay");
}

function endRunRefundUnspentSite(){
  if(!(R.mode==="pilgrimage" || R.mode==="pilgrim-recall")) return;
  if(R.attempts !== 0 || !R.siteCommitted || !SAVE.pilgrim || !Array.isArray(SAVE.pilgrim.usedIds)) return;
  const unspent = R.siteCommitted;
  SAVE.pilgrim.usedIds = SAVE.pilgrim.usedIds.filter(function(id){ return !unspent[id]; });
}

function maybeQueuePendingUnlock(road, siteCleared){
  if(!(road && road.firstClear && siteCleared)) return;
  const nxt = Pilgrimage.currentSite(SAVE.pilgrim);
  if(nxt && nxt.id !== R.siteId && Pilgrimage.isUnlocked(SAVE.pilgrim, nxt.id)){
    pendingUnlockId = nxt.id;
  }
}
function grantRoadFirstClearSeals(road){
  if(!hasSeal("road-first")) grantSeal("road-first");
  if(road.after.arcs[0].complete && !hasSeal("road-arc1")) grantSeal("road-arc1");
  if(road.after.arcs.filter(a=>a.complete).length >= 2 && !hasSeal("road-half")) grantSeal("road-half");
  if(road.after.complete && !hasSeal("road-end")) grantSeal("road-end");
  if(R.siteId==="patmos" && !hasSeal("road-patmos")) grantSeal("road-patmos");
}
function maybeUnlockRoadArtifact(){
  if(!(typeof Artifacts !== "undefined" && R.siteId)) return;
  const u = Artifacts.unlockForSite(SAVE.artifacts, R.siteId, Date.now());
  SAVE.artifacts = u.store;
  if(u.firstUnlock && u.artifact) queueArtifactReveal(u.artifact);
}
function endRunRoadSeals(road, siteCleared){
  maybeQueuePendingUnlock(road, siteCleared);
  if(road && road.firstClear){
    grantRoadFirstClearSeals(road);
    maybeUnlockRoadArtifact();
  }
  if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall" || R.mode==="relay"){
    Pilgrimage.overview(SAVE.pilgrim).arcs.forEach(a=>{
      if(a.perfect && !hasSeal("arc-"+a.key)) grantSeal("arc-"+a.key);
    });
  }
}

function habitDayNumber(d){
  return (typeof SRS !== "undefined" && SRS.dayNumber) ? SRS.dayNumber(d) : Math.floor((d ? d.getTime() : Date.now()) / 86400000);
}
function bumpHabitStreak(){
  if(!SAVE.habit) SAVE.habit = { count: 0, lastDate: "", lastDay: 0, best: 0, history: {} };
  const todayD = habitDayNumber();
  const prevD = SAVE.habit.lastDay || (SAVE.habit.lastDate ? habitDayNumber(new Date(SAVE.habit.lastDate)) : 0);
  if(prevD !== todayD){
    SAVE.habit.count = (prevD === todayD - 1) ? (SAVE.habit.count || 0) + 1 : 1;
    SAVE.habit.lastDay = todayD;
    SAVE.habit.lastDate = todayKey();
  }
  SAVE.habit.best = Math.max(SAVE.habit.best || 0, SAVE.habit.count);
  if(!SAVE.habit.history) SAVE.habit.history = {};
  SAVE.habit.history[todayKey()] = 1;
}
function grantHabitStreakSeal(id, streak){
  if(hasSeal(id)) return false;
  grantSeal(id);
  if(typeof Cinematic !== "undefined" && Cinematic.playSeventhLamp){
    Cinematic.playSeventhLamp({ streak: streak });
  }
  return true;
}
function endRunHabit(finished, siteCleared){
  const isPilgrim = R.mode==="pilgrimage" || R.mode==="pilgrim-recall";
  if(!(isPilgrim && (finished || siteCleared))) return;
  bumpHabitStreak();
  if(SAVE.habit.count >= 7 && grantHabitStreakSeal("seventh-lamp", SAVE.habit.count)) return;
  if(SAVE.habit.count >= 14 && grantHabitStreakSeal("streak14", 14)) return;
  if(SAVE.habit.count >= 30) grantHabitStreakSeal("streak30", 30);
}

function keepBestGhost(slot, record, score){
  if(!slot || score >= (slot.score||0)) return record;
  return slot;
}
function endRunGhosts(isPilgrim, total, survivedMs){
  if(R.mode==="team") return;
  if(!(R.ghostSamples && R.ghostSamples.length)) return;
  const key = R.mode==="blitz" ? "blitz" : (isPilgrim ? "pilgrimage" : R.mode==="trial" ? "trial" : null);
  if(!key) return;
  SAVE.ghosts = SAVE.ghosts || {};
  const ghostScore = R.mode==="blitz" ? (R.correct||0) : total;
  const record = { score: ghostScore, samples: R.ghostSamples, total_ms: survivedMs,
    name: (SAVE.set && SAVE.set.playerName) || "Your previous run" };
  if(isPilgrim){
    SAVE.ghosts.pilgrimageBySite = SAVE.ghosts.pilgrimageBySite || {};
    SAVE.ghosts.pilgrimageBySite[R.siteId] = keepBestGhost(SAVE.ghosts.pilgrimageBySite[R.siteId], record, ghostScore);
    SAVE.ghosts.pilgrimage = keepBestGhost(SAVE.ghosts.pilgrimage, record, ghostScore);
    return;
  }
  SAVE.ghosts[key] = keepBestGhost(SAVE.ghosts[key], record, ghostScore);
}

function endRunJournal(isPilgrim, siteCleared, total, acc){
  if(!(isPilgrim && R.siteId)) return;
  SAVE.journal = SAVE.journal || [];
  SAVE.journal.unshift({
    at: todayKey(), siteId: R.siteId, cleared: !!siteCleared,
    score: total, acc: Math.round(acc*100), name: (Pilgrimage.site(R.siteId)||{}).name||R.siteId
  });
  SAVE.journal = SAVE.journal.slice(0, 40);
}

function refreshResultsSubmitTrust(){
  if(currentView!=="results") return;
  fillResultsBoard(R.mode);
  if(typeof updateCloudChip==="function") updateCloudChip();
}

function trackBoardSubmit(p){
  if(p && typeof p.then==="function") p.then(function(res){
    if(res && res.ok === false && typeof toast === "function"){
      toast(res.reason === "rate-limited"
        ? (Cloud.authNotice ? Cloud.authNotice("rate-limited") : "Too many attempts. Wait a few minutes.")
        : "Leaderboard unavailable — your local record is safe");
    }
    refreshResultsSubmitTrust();
  }, function(){
    if(typeof toast === "function") toast("Leaderboard unavailable — your local record is safe");
    refreshResultsSubmitTrust();
  });
}

function upsertRaceGhost(isPilgrim, siteCleared, total, survivedMs){
  const raceGhostEligible = total > 0 && (R.mode === "trial" || (isPilgrim && siteCleared));
  if(!raceGhostEligible) return;
  const ov = isPilgrim ? Pilgrimage.overview(SAVE.pilgrim) : null;
  const p = isPilgrim && ov && ov.total ? ov.cleared / ov.total : (R.mode === "trial" ? 1 : 0);
  const ghostMode = R.mode === "trial" ? "trial" : "pilgrimage";
  const ghostKey = R.mode === "trial" ? "campaign" : "site:" + R.siteId;
  Cloud.upsertGhost(ghostMode, ghostKey, total, {
    version: 1,
    samples: R.ghostSamples || [{ t: 0, p: 0 }, { t: survivedMs, p: p }],
    total_ms: survivedMs,
    end_p: p
  }, { siteId: R.siteId || null, cleared: ov ? ov.cleared : null, total: ov ? ov.total : null,
    campaign: R.mode === "trial" });
}
function endRunCloudSubmit(dailyRecorded, isPilgrim, siteCleared, total, acc, survivedMs, reason){
  if(R.mode==="team") return;
  if(!(typeof Cloud!=="undefined" && Cloud.configured() && Cloud.isSignedIn())) return;
  if(dailyRecorded){
    trackBoardSubmit(Cloud.submitDailyScore({
      play_date: todayKey(),
      score: total,
      accuracy: Math.round(acc*100),
      duration_ms: survivedMs,
      diff: R.diff.key,
      correct: R.correct||0,
      attempts: R.attempts||0,
      best: R.best||0,
      baseScore: R.score||0,
      reason: reason
    }));
  }
  if(R.mode==="blitz"){
    trackBoardSubmit(Cloud.submitBlitzScore({
      score: R.correct||0,
      survived_ms: survivedMs,
      diff: R.diff.key,
      correct: R.correct||0
    }));
  }
  upsertRaceGhost(isPilgrim, siteCleared, total, survivedMs);
}

function endRunContext(reason){
  const trialWon = R.mode==="trial" && reason==="complete";
  const finished = reason==="complete";
  const isPilgrim = R.mode==="pilgrimage" || R.mode==="pilgrim-recall";
  const siteCleared = isPilgrim && reason==="complete";
  const firstVisit = isPilgrim && R.siteId && !Pilgrimage.isCleared(SAVE.pilgrim, R.siteId);
  return { trialWon: trialWon, finished: finished, isPilgrim: isPilgrim, siteCleared: siteCleared, firstVisit: firstVisit };
}

function endRunScore(reason, ctx){
  const acc = R.attempts ? R.correct/R.attempts : 0;
  if(R.mode==="daily" && typeof Polish!=="undefined" && Polish.settleDaily){
    const s = Polish.settleDaily({
      baseScore: R.score,
      best: R.best,
      correct: R.correct,
      attempts: R.attempts,
      diff: R.diff.key,
      reason: reason
    });
    return { acc: acc, baseScore: R.score, streakBonus: s.streakBonus, accBonus: s.accBonus,
      survivalBonus: s.survivalBonus, firstClearBonus: 0, total: s.total };
  }
  const baseScore = R.score;
  const streakBonus = Math.round(R.best * 120 * R.diff.score);
  const accBonus = Math.round(acc * 1200 * R.diff.score);
  const survivalBonus = endRunSurvivalBonus(ctx.trialWon, ctx.isPilgrim, ctx.siteCleared);
  const firstClearBonus = (ctx.siteCleared && ctx.firstVisit)
    ? Math.round((baseScore + survivalBonus) * 0.9) : 0;
  const total = reason==="abandon" ? Math.round((baseScore + streakBonus + accBonus + survivalBonus) * 0.85)
              : baseScore + streakBonus + accBonus + survivalBonus + firstClearBonus;
  return { acc: acc, baseScore: baseScore, streakBonus: streakBonus, accBonus: accBonus,
    survivalBonus: survivalBonus, firstClearBonus: firstClearBonus, total: total };
}

function recordRoadTabletHold(id, pct){
  if(typeof Pilgrimage === "undefined" || !Pilgrimage.stop) return;
  const stop = Pilgrimage.stop(id);
  if(!(stop && stop.kind === "tablets")) return;
  if(!Pilgrimage.isUnlocked(SAVE.pilgrim, id)) return;
  SAVE.pilgrim = Pilgrimage.record(SAVE.pilgrim, id, { cleared: true, score: pct, accuracy: 100, at: Date.now() });
  const nxt = Pilgrimage.currentSite(SAVE.pilgrim);
  if(nxt && nxt.id !== id && Pilgrimage.isUnlocked(SAVE.pilgrim, nxt.id)) pendingUnlockId = nxt.id;
}
function persistTabletsRecord(){
  if(R.tabletTutorial) return { road: null, isRecord: false, prevBest: 0, dailyRecorded: false };
  const pct = Math.round(((R.tabletIdx || 0) / (R.tabletTotal || 1)) * 100);
  const prevBest = SAVE.best.tablets || 0;
  const isRecord = pct > prevBest;
  if(isRecord) SAVE.best.tablets = pct;
  const id = R.tabletChapter || "psalm23";
  const n = (typeof Tablets !== "undefined" && Tablets.clampLevel) ? Tablets.clampLevel(R.tabletLevel) : 1;
  if(!SAVE.tablets) SAVE.tablets = {};
  if(!SAVE.tablets[id]) SAVE.tablets[id] = {best:0,held:false};
  const rec = Object.assign({best:0,held:false}, SAVE.tablets[id] || {});
  rec.best = Math.max(rec.best || 0, pct);
  const nowHeld = typeof Tablets !== "undefined" && Tablets.held(R);
  if(!rec.levels) rec.levels = {};
  const lv = Object.assign({best:0,held:false}, rec.levels[n] || rec.levels[String(n)] || {});
  lv.best = Math.max(lv.best || 0, pct);
  if(nowHeld) lv.held = true;
  rec.levels[n] = lv;
  const chapterHold = nowHeld && n >= 2;
  if(chapterHold && !rec.held) SAVE.life.tabletHolds = (SAVE.life.tabletHolds || 0) + 1;
  if(chapterHold) rec.held = true;
  SAVE.tablets[id] = rec;
  const oil = (R.correct || 0) * 2;
  if(oil){
    SAVE.oil = (SAVE.oil || 0) + oil;
    SAVE.life.oilEarned = (SAVE.life.oilEarned || 0) + oil;
  }
  if(chapterHold) recordRoadTabletHold(id, pct);
  return { road: null, isRecord: isRecord, prevBest: prevBest, dailyRecorded: false };
}
function persistRunRecords(reason, ctx, total){
  if(R.mode==="team") return { road: null, isRecord: false, prevBest: 0, dailyRecorded: false };
  if(R.mode==="beat"){
    SAVE.runs++;
    if(reason==="complete" && typeof Beat!=="undefined" && Beat.held(R)) SAVE.life.beatGoliathHeld = true;
    return { road: null, isRecord: false, prevBest: 0, dailyRecorded: false };
  }
  if(R.mode==="tablets"){
    SAVE.runs++;
    return persistTabletsRecord();
  }
  SAVE.runs++;
  SAVE.life.bestStreak = Math.max(SAVE.life.bestStreak, R.best);
  if(R.mode==="trial") SAVE.life.sdBest = Math.max(SAVE.life.sdBest, R.sdCount);
  if(R.mode==="endless") SAVE.life.endlessBest = Math.max(SAVE.life.endlessBest, R.qTotal);
  endRunBankRelay(reason);
  endRunRefundUnspentSite();
  const road = ctx.isPilgrim ? recordSiteResult(ctx.siteCleared, total, ctx.acc) : null;
  endRunRoadSeals(road, ctx.siteCleared);
  endRunHabit(ctx.finished, ctx.siteCleared);
  const recordScore = R.mode==="blitz" ? (R.correct||0) : total;
  const isRecord = recordScore > (SAVE.best[R.mode]||0);
  const prevBest = SAVE.best[R.mode]||0;
  if(isRecord) SAVE.best[R.mode] = recordScore;
  let dailyRecorded = false;
  if(R.mode==="daily" && reason==="complete" && SAVE.daily.date !== todayKey()){
    SAVE.daily = {date:todayKey(), score:total};
    SAVE.life.dailyDone++; dailyRecorded = true;
  }
  SAVE.board.push({score:total, mode:R.mode, diff:R.diff.key, acc:Math.round(ctx.acc*100), date:todayKey(), q:R.qTotal});
  SAVE.board.sort((a,b)=>b.score-a.score);
  SAVE.board = SAVE.board.slice(0,10);
  return { road: road, isRecord: isRecord, prevBest: prevBest, dailyRecorded: dailyRecorded };
}
function applyQuickRewardBank(quickRewardResult, total, finished){
  if(R.mode==="team"){
    R.quickResult = quickRewardResult;
    const info = levelInfo(SAVE.xp);
    return { beforeLvl: info.level, xpGain: 0, afterInfo: info };
  }
  R.quickResult = quickRewardResult;
  const beforeLvl = levelInfo(SAVE.xp).level;
  const xpGain = Math.round(total/12 + R.correct*14 + (finished?300:0) + quickRewardResult.xp);
  if(quickRewardResult.oil){
    SAVE.oil = (SAVE.oil||0) + quickRewardResult.oil;
    SAVE.life.oilEarned = (SAVE.life.oilEarned||0) + quickRewardResult.oil;
  }
  if(quickRewardResult.illuminate){
    SAVE.illumReserve = (Number(SAVE.illumReserve)||0) + quickRewardResult.illuminate;
    SAVE.life.illumRewards = (SAVE.life.illumRewards||0) + quickRewardResult.illuminate;
  }
  SAVE.life.quickRewards = (SAVE.life.quickRewards||0) + quickRewardResult.paid.length;
  SAVE.life.quickRewardXP = (SAVE.life.quickRewardXP||0) + quickRewardResult.xp;
  SAVE.life.quickRewardOil = (SAVE.life.quickRewardOil||0) + quickRewardResult.oil;
  SAVE.xp += xpGain;
  return { beforeLvl: beforeLvl, xpGain: xpGain, afterInfo: levelInfo(SAVE.xp) };
}
function endRunPersistXp(reason, ctx, total){
  refundUnusedIlluminate();
  if(R.mode==="team"){
    const info = levelInfo(SAVE.xp);
    return { road:null, isRecord:false, prevBest:0, dailyRecorded:false,
      quickRewardResult:{goals:[],completed:[],paid:[],xp:0,oil:0,illuminate:0,settled:false},
      xpGain:0, beforeLvl:info.level, afterInfo:info };
  }
  const rec = persistRunRecords(reason, ctx, total);
  const quickRewardResult = (typeof QuickRewards !== "undefined" && QuickRewards.resolve)
    ? QuickRewards.resolve(R.quickRewards || [], R, reason)
    : {goals:[],completed:[],paid:[],xp:0,oil:0,illuminate:0,settled:false};
  const xp = applyQuickRewardBank(quickRewardResult, total, ctx.finished);
  checkMetaSeals();
  persist();
  return { road: rec.road, isRecord: rec.isRecord, prevBest: rec.prevBest, dailyRecorded: rec.dailyRecorded,
    quickRewardResult: quickRewardResult, xpGain: xp.xpGain, beforeLvl: xp.beforeLvl, afterInfo: xp.afterInfo };
}

function endRunTrack(reason){
  if(R.mode==="beat" || R.mode==="tablets"){
    const held = R.mode==="beat"
      ? (typeof Beat!=="undefined" && Beat.held(R))
      : (typeof Tablets!=="undefined" && Tablets.held(R));
    return (reason==="complete" && held) ? "finalStillness" : "suddenDescent";
  }
  if(reason === "complete") return "finalStillness";
  if(reason === "death" || reason === "abandon") return "suddenDescent";
  return "results";
}
function endRun(reason){
  if(R.ended) return;
  R.ended = true;
  invalidateRun();
  R.resultTrack = endRunTrack(reason);
  clearSequence();
  hideSiteQuote();
  if(typeof stopFriendRacePolling === "function") stopFriendRacePolling();
  document.body.classList.remove("setpiece-active","overdrive","pressure-3","pressure-5","pressure-7","retreat","mode-team","team-white","team-blue","mode-tablets");
  R.setpiece=null;
  const ctx = endRunContext(reason);
  if(reason==="death" || reason==="abandon"){ Snd.death(); Backdrop.hit("death"); }
  else { Snd.victory(); Backdrop.hit("levelup"); }
  const scored = endRunScore(reason, ctx);
  ctx.acc = scored.acc;
  endRunGrantSeals(scored.total, ctx.trialWon, ctx.finished);
  const saved = endRunPersistXp(reason, ctx, scored.total);
  const survivedMs = Math.max(0, Date.now() - (R.startedAt||Date.now()));
  endRunGhosts(ctx.isPilgrim, scored.total, survivedMs);
  if(R.mode==="blitz") SAVE.life.blitzBest = Math.max(SAVE.life.blitzBest||0, R.correct||0);
  endRunJournal(ctx.isPilgrim, ctx.siteCleared, scored.total, scored.acc);
  endRunCloudSubmit(saved.dailyRecorded, ctx.isPilgrim, ctx.siteCleared, scored.total, scored.acc, survivedMs, reason);
  renderResults({reason, total: scored.total, baseScore: scored.baseScore, streakBonus: scored.streakBonus,
    accBonus: scored.accBonus, survivalBonus: scored.survivalBonus, acc: scored.acc,
    xpGain: saved.xpGain, beforeLvl: saved.beforeLvl, afterInfo: saved.afterInfo,
    isRecord: saved.isRecord, prevBest: saved.prevBest, dailyRecorded: saved.dailyRecorded,
    road: saved.road, siteCleared: ctx.siteCleared, firstClearBonus: scored.firstClearBonus,
    survivedMs: survivedMs, quickRewards: saved.quickRewardResult});
  go("results");
}

function tabletsRetryLevel(){
  if(typeof Tablets !== "undefined" && Tablets.graduateLevel) return Tablets.graduateLevel(R, SAVE);
  return R.tabletLevel || 1;
}
function tabletsRetryLabel(){
  const now = (typeof Tablets !== "undefined" && Tablets.clampLevel) ? Tablets.clampLevel(R.tabletLevel) : (R.tabletLevel || 1);
  const next = tabletsRetryLevel();
  if(next > now && typeof Tablets !== "undefined" && Tablets.levelName) return "Carve " + Tablets.levelName(next);
  return "Carve again";
}
function tabletsRetryRun(){
  startRun("tablets", R.diff.key, {
    tabletChapter: R.tabletChapter || "psalm23",
    tabletLevel: tabletsRetryLevel(),
    fromRoad: !!R.fromRoad
  });
}
function tabletsKickText(o){
  if(o.reason==="abandon") return "The run was abandoned";
  if(!(typeof Tablets!=="undefined" && Tablets.held(R))) return "The tablet shattered";
  const now = Tablets.clampLevel(R.tabletLevel);
  const next = Tablets.graduateLevel(R, SAVE);
  if(next > now) return Tablets.levelName(now) + " held. " + Tablets.levelName(next) + " is open.";
  return "The manuscript held";
}
function resultsKick(o){
  if(R.mode==="tablets") return tabletsKickText(o);
  if(R.mode==="beat") return (typeof Beat!=="undefined" && Beat.held(R)) ? "Held" : "Scarred";
  return resultsKickText(o);
}
function resultsCompleteKick(){
  if(R.mode==="trial") return R.actIdx>=5 ? "The Remnant is complete" : "The Final Test is complete";
  if(R.mode==="daily") return "The daily reading is finished";
  if(R.mode==="practice") return "The drill is finished";
  if(R.mode==="recall") return "You wrote them out from memory";
  return "";
}
function resultsKickText(o){
  if(o.reason==="abandon") return "The run was abandoned";
  if(R.mode==="team"){
    const w = typeof teamWinner==="function" ? teamWinner() : "draw";
    if(o.reason!=="complete") return "The match was called off";
    if(w==="draw") return "The match is drawn";
    return (w==="white"?"White":"Blue")+" takes the match";
  }
  if(o.reason==="complete"){
    const done = resultsCompleteKick();
    if(done) return done;
  }
  if(R.mode==="blitz") return "The blitz clock ran out";
  if(R.mode==="trial" && R.actIdx>=5) return "The Remnant ended the run";
  if(R.mode==="trial" && R.actIdx===4) return "The Final Test ended the run";
  if(R.mode==="endless") return "The gauntlet closed";
  return "The trial is ended";
}

function teamResultsBreakdownHtml(row){
    const w = R.teams.white, b = R.teams.blue;
    const win = typeof teamWinner==="function" ? teamWinner() : "draw";
    return '<div class="brow team-row white'+(win==="white"?" win":"")+'"><span>White Team</span><b>'+esc((w.kept||0)+"/5 · "+((w.ms||0)/1000).toFixed(1)+"s")+'</b></div>'+
      '<div class="brow team-row blue'+(win==="blue"?" win":"")+'"><span>Blue Team</span><b>'+esc((b.kept||0)+"/5 · "+((b.ms||0)/1000).toFixed(1)+"s")+'</b></div>'+
      row("Result", win==="draw" ? "Draw" : (win==="white"?"White":"Blue")+" by keeps, then time");
}
function tabletsHeld(){ return typeof Tablets!=="undefined" && Tablets.held(R); }
function tabletsResultsBreakdownHtml(o, row){
  return row("Words carved", R.correct+" / "+R.qTotal) +
    row("Hold", tabletsHeld() ? "Held" : "Shattered") +
    row("Chapter best", ((SAVE.tablets && SAVE.tablets[R.tabletChapter] && SAVE.tablets[R.tabletChapter].best) || 0)+"%") +
    '<div class="brow tot"><span>Final</span><b>'+fmt(o.total)+'</b></div>';
}
function resultsBreakdownHtml(o){
  function row(a,b){ return '<div class="brow"><span>'+esc(a)+'</span><b>'+esc(b)+'</b></div>'; }
  if(R.mode==="team" && R.teams) return teamResultsBreakdownHtml(row);
  if(R.mode==="tablets") return tabletsResultsBreakdownHtml(o, row);
  const actLabel = R.mode==="trial" ? "Acts survived" : R.mode==="endless" ? "Distance"
    : R.mode==="relay" ? "Sites walked" : "Verses answered";
  return row("Verses kept", fmt(o.baseScore)) +
    row("Longest streak ×"+R.best, "+"+fmt(o.streakBonus)) +
    row("Accuracy "+Math.round(o.acc*100)+"%", "+"+fmt(o.accBonus)) +
    row(actLabel, "+"+fmt(o.survivalBonus)) +
    (o.firstClearBonus ? row("New ground — first clear", "+"+fmt(o.firstClearBonus)) : "") +
    (o.quickRewards && o.quickRewards.xp ? row("Quick rewards", "+"+fmt(o.quickRewards.xp)+" XP") : "") +
    '<div class="brow tot"><span>Final</span><b>'+fmt(o.total)+'</b></div>';
}

function renderResultsSchedule(){
  const sched = $("res-schedule");
  if(!sched) return;
  if(!R.rescheduled.length){ sched.style.display = "none"; return; }
  const back = R.rescheduled.filter(x=>!x.correct).length;
  const furthest = R.rescheduled.reduce((m,x)=>Math.max(m,x.ivl), 0);
  sched.innerHTML = '<div class="mtitle">Next review</div>' +
    '<div class="schedrow"><b>'+R.rescheduled.length+'</b><span>verses rescheduled</span></div>' +
    '<div class="schedrow"><b>'+back+'</b><span>back tomorrow</span></div>' +
    '<div class="schedrow"><b>'+(furthest>=1?furthest:1)+'</b><span>longest gap, in days</span></div>' +
    '<div class="schedhint">Due today: '+dueToday()+' verses.</div>';
  sched.style.display = "";
}

function renderResultsStats(o){
  function stat(a,b){ return '<div class="stat"><b>'+esc(String(a))+'</b><span>'+esc(b)+'</span></div>'; }
  if(R.mode==="tablets"){
    $("res-stats").innerHTML =
      stat(R.correct, "Words carved") +
      stat(R.qTotal, "Tablets in chapter") +
      stat(R.best, "Longest carve") +
      stat(Math.round(o.acc*100)+"%", "Accuracy") +
      stat((SAVE.tablets && SAVE.tablets[R.tabletChapter] && SAVE.tablets[R.tabletChapter].best || 0)+"%", "Chapter best");
    return;
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
}

function renderResultsQuick(o){
  const quickEl = $("res-quick");
  if(!quickEl) return;
  const qr = o.quickRewards || {goals:[],paid:[],xp:0,oil:0,settled:false};
  const paid = new Set((qr.paid||[]).map(g=>g.id));
  quickEl.innerHTML = qr.goals && qr.goals.length
    ? '<div class="quick-result-title">Quick rewards · '+(qr.settled ? (paid.size+" banked") : "run not banked")+'</div>'+
      '<div class="quick-result-grid">'+qr.goals.map(g=>{
        const done = paid.has(g.id);
        const progress = (typeof QuickRewards !== "undefined")
          ? QuickRewards.progress(g, Object.assign({}, R, {quickSettling:qr.settled}))
          : {value:0,target:g.target};
        const value = g.type==="clean" || g.type==="noPower"
          ? (done ? "Complete" : "Not banked")
          : progress.value+"/"+progress.target;
        const payout = (typeof quickRewardPayout === "function")
          ? quickRewardPayout(g)
          : ("+"+g.xp+" XP"+(g.oil?" · +"+g.oil+" oil":"")+(g.illuminate?" · +"+g.illuminate+" Illuminate":""));
        return '<div class="quick-result-item'+(done?" done":"")+'"><b>'+esc(g.name)+'</b><span>'+esc(done ? payout : value+" · "+g.desc)+'</span></div>';
      }).join("")+'</div>'
    : '<div class="quick-result-title">Quick rewards</div><div class="hint">No contracts were assigned.</div>';
  quickEl.style.display = "";
}

function renderResultsMissed(){
  const m=$("res-missed");
  if(R.missed.length){
    m.innerHTML='<div class="mtitle">Verses that got away — learn these</div>'+
      R.missed.map(q=>{
        const note = (typeof VERSE_NOTES !== "undefined" && q.id && VERSE_NOTES[q.id])
          ? '<div class="res-verse-note">'+esc(VERSE_NOTES[q.id])+'</div>'
          : '';
        return '<div class="mrow"><i>'+esc(q.r)+'</i>'+esc(q.p)+' <em>'+esc(q.a)+'</em>'+sep(q.s)+esc(q.s)+note+'</div>';
      }).join("");
  } else {
    m.innerHTML='<div class="mtitle">Not one verse lost</div><div class="mrow" style="text-align:center">Flawless. Every word held.</div>';
  }
  const missedPanel=$("res-details-missed");
  if(missedPanel) missedPanel.open = R.missed.length > 0;
}

function renderResultsBestLine(o){
  if(R.mode==="team"){
    $("res-best").textContent = "Keeps first. Faster total answer time breaks a tie.";
    return;
  }
  let best = "";
  if(R.mode==="tablets"){
    const rec = SAVE.tablets && SAVE.tablets[R.tabletChapter] || {best:0,held:false};
    best = (rec.held ? "Hold recorded" : "The Hold broke") + " · " + (R.tabletChapter || "psalm23") + " best — " + (rec.best||0) + "%";
    $("res-best").textContent = best;
    return;
  }
  if(!MODES[R.mode]){
    $("res-best").textContent = "";
    return;
  }
  if(R.mode==="blitz"){
    if(o.isRecord) best = "New "+MODES[R.mode].name+" record — previous "+fmt(o.prevBest)+" verses";
    else best = MODES[R.mode].name+" best — "+fmt(SAVE.best[R.mode]||0)+" verses";
  } else {
    if(o.isRecord) best = "New "+MODES[R.mode].name+" record — previous "+fmt(o.prevBest);
    else best = MODES[R.mode].name+" best — "+fmt(SAVE.best[R.mode]||0);
  }
  if(R.mode==="daily" && !o.dailyRecorded) best += " · today's score already recorded (practice run)";
  $("res-best").textContent = best;
}

function renderResultsHabit(){
  const habitEl = $("res-habit-streak");
  if(!habitEl) return;
  if(R.mode==="team" || R.mode==="tablets"){ habitEl.style.display = "none"; return; }
  const hCount = (SAVE.habit && SAVE.habit.count) || 0;
  let lampsHtml = "";
  for(let l = 1; l <= 7; l++){
    const lit = l <= hCount;
    lampsHtml += '<i class="h-lamp ' + (lit ? 'lit' : 'dim') + (l === 7 ? ' sabbath' : '') + '" title="Day ' + l + '"></i>';
  }
  habitEl.innerHTML = '<div class="h-label">Habit Streak · <b>' + hCount + ' Day' + (hCount === 1 ? '' : 's') + '</b></div><div class="h-row">' + lampsHtml + '</div>';
  habitEl.style.display = "";
}

function bindResultsRoadButtons(o, isPilgrim){
  const onRoad = isPilgrim || R.mode==="relay";
  const roadBtn=$("res-road");
  if(roadBtn){
    roadBtn.style.display = onRoad ? "" : "none";
    roadBtn.onclick = ()=>{ Snd.ui(); go("atlas"); };
  }
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
    if(autoUnlock && roadBtn){
      roadBtn.style.display = "";
      roadBtn.textContent = "See the road open";
    }
  }
  return autoUnlock;
}
function renderRelayResultCopy(o){
  if(!(R.mode==="relay" && R.relay)) return;
  const arc = Pilgrimage.arc(R.relay.arcKey);
  const done = R.relay.banked.length, all = R.relay.sites.length;
  $("res-kick").textContent = o.reason==="complete"
    ? (arc ? arc.name + " — walked without rest" : "The arc is walked")
    : "The road ended early";
  $("res-best").textContent = done === all
    ? "Every site from " + (Pilgrimage.site(R.relay.sites[0])||{name:""}).name + " onward is cleared"
    : done + " of " + all + " sites banked before the road ended · they stay cleared";
}
function renderPilgrimResultCopy(o){
  if(!(o.road)) return;
  const site = Pilgrimage.site(R.siteId);
  const nxt = Pilgrimage.currentSite(SAVE.pilgrim);
  $("res-kick").textContent = o.siteCleared
    ? (site ? site.name + " is behind you" : "The site is cleared")
    : (site ? site.name + " holds" : "The site holds");
  $("res-best").textContent = o.siteCleared
    ? (o.road.after.complete
      ? pilgrimSpiralCompleteCopy()
      : "The road opens to " + (nxt ? nxt.name : "the next site") +
        " · " + o.road.after.cleared + " of " + o.road.after.total + " sites")
    : "Walk it again when you are ready · " + o.road.after.cleared +
      " of " + o.road.after.total + " sites cleared";
}
function pilgrimSpiralCompleteCopy(){
  const pass = (typeof Pilgrimage !== "undefined" && Pilgrimage.spiralPass)
    ? Pilgrimage.spiralPass(SAVE.pilgrim) : 1;
  const std = (typeof Pilgrimage !== "undefined" && Pilgrimage.passStandard)
    ? Pilgrimage.passStandard(Math.max(2, pass)) : null;
  if(!std || pass < 2) return "Every site from Ur to Patmos is cleared. The road is walked.";
  return "Every site from Ur to Patmos is cleared. " + std.title + " — " + std.desc;
}
function renderResultsRoadChrome(o){
  const isPilgrim = R.mode==="pilgrimage" || R.mode==="pilgrim-recall";
  const autoUnlock = bindResultsRoadButtons(o, isPilgrim);
  renderRelayResultCopy(o);
  if(isPilgrim) renderPilgrimResultCopy(o);
  return autoUnlock;
}

function renderResultsRetryReview(o){
  const retryBtn = $("res-retry");
  const againBtn = $("res-again");
  if(againBtn) againBtn.style.display = R.mode==="tablets" ? "none" : "";
  if(retryBtn && (R.mode==="beat" || R.mode==="team" || R.mode==="tablets")){
    retryBtn.style.display = "";
    retryBtn.textContent = R.mode==="team" ? "Play again" : R.mode==="tablets" ? tabletsRetryLabel() : retryBtn.textContent;
    retryBtn.onclick = function(){
      Snd.unlock(); Snd.ui();
      if(R.mode==="team") openBrief("team");
      else if(R.mode==="tablets") tabletsRetryRun();
      else startRun("beat", R.diff.key);
    };
    const reviewMissedBtn = $("res-review-missed");
    if(reviewMissedBtn) reviewMissedBtn.style.display = "none";
    return;
  }
  const isPilgrim = R.mode==="pilgrimage" || R.mode==="pilgrim-recall";
  if(retryBtn){
    const showRetry = isPilgrim && !o.siteCleared && R.siteId;
    retryBtn.style.display = showRetry ? "" : "none";
    if(showRetry){
      retryBtn.onclick = ()=>{ Snd.unlock(); Snd.ui(); pendingSiteId = R.siteId; startRun("pilgrimage", R.diff.key); };
    }
  }
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
}

function paintResultsSkin(el){
  if(!el) return;
  el.classList.remove("team-win-white","team-win-blue","team-win-draw","beat-win","beat-loss","tablets-held","tablets-shattered");
  if(R.mode==="team"){
    const w = typeof teamWinner==="function" ? teamWinner() : "draw";
    el.classList.add(w==="draw" ? "team-win-draw" : "team-win-"+w);
    return;
  }
  if(R.mode==="beat") el.classList.add(typeof Beat!=="undefined" && Beat.held(R) ? "beat-win" : "beat-loss");
  if(R.mode==="tablets") el.classList.add(tabletsHeld() ? "tablets-held" : "tablets-shattered");
}
function renderResults(o){
  $("res-kick").textContent = resultsKick(o);
  document.body.classList.remove("blitz-edge","blitz-edge-2","blitz-edge-3");
  paintResultsSkin($("v-results"));
  $("res-rank").textContent = R.mode==="team" ? "Party match · not recorded" : runTitle(o.total);
  $("res-score").textContent = R.mode==="team" && R.teams
    ? (R.teams.white.kept||0)+"–"+(R.teams.blue.kept||0)
    : "0";
  dailyPlacement = null;
  $("res-breakdown").innerHTML = resultsBreakdownHtml(o);
  renderResultsSchedule();
  renderResultsStats(o);
  const xpbar = $("xp-lvl") && $("xp-lvl").closest ? $("xp-lvl").closest(".xpbar") : null;
  if(xpbar) xpbar.style.display = R.mode==="team" ? "none" : "";
  if($("xp-lvl")) $("xp-lvl").textContent = "Level "+o.afterInfo.level+" · "+rankFor(o.afterInfo.level);
  if($("xp-gain")) $("xp-gain").textContent = R.mode==="team" ? "Not recorded" : "+"+fmt(o.xpGain)+" XP";
  $("xp-fill").style.width = "0%";
  renderResultsQuick(o);
  if($("res-quick")) $("res-quick").style.display = R.mode==="team" ? "none" : "";
  const seals = pendingSeals.slice();
  pendingSeals = [];
  $("res-seals").innerHTML = "";
  renderResultsMissed();
  renderResultsBestLine(o);
  const shareBtn=$("res-share");
  if(shareBtn){
    shareBtn.style.display = R.mode==="daily" ? "" : "none";
    shareBtn.onclick = ()=>shareDailyResult(o.total);
  }
  renderResultsHabit();
  const autoUnlock = renderResultsRoadChrome(o);
  renderResultsRetryReview(o);
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
/* ---------- Placement beat ("you placed #N of M") ----------
   The payoff moment of a competitive run: after the score counts up,
   the player learns exactly where they landed. Data arrives whenever
   the network delivers it; the reveal waits for its slot in the
   sequence so it never steals the count-up's beat. */
let dailyPlacement = null;
let lastDailyRank = 0;
/* The previously recorded rank lives in the save; it is what makes the
   movement arrow honest ("vs your last daily"). A record stamped TODAY
   is this very run's result, not a baseline. */
function loadLastDailyRank(){
  const rec = (typeof SAVE !== "undefined") && SAVE.lastDaily;
  if(rec && rec.rank && rec.date && rec.date !== todayKey()) return rec.rank;
  return 0;
}
function ensurePlacementHost(){
  const board = $("res-board");
  if(!board || !board.parentNode) return null;
  let el = $("res-placement");
  if(!el){
    el = document.createElement("div");
    el.id = "res-placement";
    el.className = "res-placement";
    board.parentNode.insertBefore(el, board);
  }
  return el;
}
function renderPlacement(){
  const el = ensurePlacementHost();
  if(!el) return;
  if(dailyPlacement) el.innerHTML = dailyPlacement;
  else el.classList.remove("on");
}
function revealPlacement(){
  if(currentView !== "results") return;
  if(!dailyPlacement) return;
  const el = ensurePlacementHost();
  if(el){ el.classList.add("on"); Snd.ui(); }
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

  afterResults(t, function(){
    if(R.mode==="team" && R.teams){
      $("res-score").textContent = (R.teams.white.kept||0)+"–"+(R.teams.blue.kept||0);
      return;
    }
    countUpScore(o.total);
  });
  t += quiet ? 400 : 1400;

  /* The placement reveal rides right behind the count-up: the number
     lands, then where it put you. */
  afterResults(t, function(){ revealPlacement(); });
  t += quiet ? 120 : 500;

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
  /* Top three read as the podium; the player's row carries the movement
     arrow against their last recorded daily rank. */
  const cls = "board-row" + (r.mine ? " mine" : "") + (r.rank <= 3 ? " top" : "") +
    (r.rank === 1 ? " rank-1" : "");
  let arrow = "";
  if(r.mine && typeof r.move === "number" && r.move !== 0){
    arrow = r.move > 0
      ? ' <i class="board-move-up" title="Up ' + r.move + ' from your last daily">▲</i>'
      : ' <i class="board-move-down" title="Down ' + (-r.move) + ' from your last daily">▼</i>';
  }
  return '<div class="'+cls+'">'+
    '<span class="rk">#'+r.rank+'</span>'+
    '<span class="nm">'+esc(r.name)+(r.mine?' <i class="you-pill">You</i>':'')+arrow+'</span>'+
    '<b>'+esc(extra || fmt(r.score))+'</b></div>';
}
function fillResultsBoard(mode){
  const el = $("res-board");
  if(!el) return;
  el.innerHTML = "";
  el.style.display = "none";
  renderPlacement();
  lastDailyRank = loadLastDailyRank();
  if(typeof Cloud==="undefined" || !Cloud.configured()) return;
  const trustTag = (typeof Cloud!=="undefined" && typeof Cloud.lastSubmitVia === "function" && Cloud.lastSubmitVia() === "direct")
    ? ' <span class="trust-pill">(Honor system)</span>' : '';
  if(mode==="daily"){
    el.style.display = "";
    el.innerHTML = '<div class="mtitle">Daily board · '+esc(todayKey())+trustTag+'</div><div class="board-loading">Loading…</div>';
    Promise.all([
      Cloud.fetchDailyBoard(todayKey(), 15),
      Cloud.isSignedIn() ? Cloud.fetchMyDailyRank(todayKey()) : Promise.resolve(null),
      (typeof Cloud.fetchDailyEntryCount === "function") ? Cloud.fetchDailyEntryCount(todayKey()) : Promise.resolve(0)
    ]).then(([rows, mine, entryCount])=>{
      if(mine && rows) rows.forEach(function(r){ if(r.id === mine.id) r.mine = true; });
      if(!rows.length){
        const fail = Cloud.boardLoadFailed && Cloud.boardLoadFailed();
        el.innerHTML = '<div class="mtitle">Daily board · '+esc(todayKey())+trustTag+'</div>'+
          '<div class="empty">'+(fail
            ? "Could not load the board. Check your connection."
            : "No scores yet today. Be the first — finish a Daily Trial while signed in.")+'</div>';
        return;
      }
      /* Placement data for the results beat, and this run's rank becomes
         tomorrow's movement baseline. */
      const mineRow = rows.find(r=>r.mine);
      const myRank = (mineRow && mineRow.rank) || (mine && mine.rank) || null;
      if(myRank && entryCount){
        dailyPlacement = '<div class="place-line"><b>#'+myRank+'</b><span> of '+fmt(entryCount)+
          ' today</span><i>The daily reading</i></div>';
        SAVE.lastDaily = { date: todayKey(), rank: myRank };
        if(typeof persist === "function") persist();
      }
      renderPlacement();
      let html = '<div class="mtitle">Daily board · '+esc(todayKey())+trustTag+'</div>'+
        rows.map(r=>{
          if(r.mine && typeof r.rank === "number") r.move = lastDailyRank - r.rank;
          return boardRowHtml(r, fmt(r.score)+(r.accuracy!=null?' · '+Math.round(r.accuracy)+'%':''));
        }).join("");
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
      if(mine && rows) rows.forEach(function(r){ if(r.id === mine.id) r.mine = true; });
      if(!rows.length){
        const fail = Cloud.boardLoadFailed && Cloud.boardLoadFailed();
        el.innerHTML = '<div class="mtitle">Blitz board'+trustTag+'</div>'+
          '<div class="empty">'+(fail
            ? "Could not load the board. Check your connection."
            : "No blitz scores yet. Survive a Blitz run while signed in.")+'</div>';
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
$("res-again").addEventListener("click", ()=>{
  Snd.ui();
  if(R.mode==="team"){ openBrief("team"); return; }
  if(R.mode==="tablets"){ tabletsRetryRun(); return; }
  startRun(R.mode, R.diff.key);
});
