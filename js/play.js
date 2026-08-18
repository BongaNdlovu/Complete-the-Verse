/* ==================================================================
   PLAY — stage clocks, live question timer, answering, and life loss.

   Extracted from game.js along its natural play-loop seam.
   Parse contract: defines functions only; touches R/SAVE/DOM at runtime.
   ================================================================== */

/* ------------------------- CLOCKS & DURATION ------------------------- */
function pickPadMs(){
  return (typeof Pilgrimage !== "undefined" && Pilgrimage.PICK_PAD_MS) || 1500;
}

function pickClockMs(ms){
  if(!ms || (typeof R !== "undefined" && (R.typed || R.mode==="blitz" || R.mode==="recall" || R.mode==="pilgrim-recall"))) return ms;
  return ms + pickPadMs();
}

function momentumClockMs(ms){
  if(!ms || (typeof R !== "undefined" && (R.typed || R.mode==="blitz"))) return ms;
  if(typeof R !== "undefined" && (R.streak||0) >= (typeof MOMENTUM_STEPS !== "undefined" ? MOMENTUM_STEPS[0] : 3)){
    return Math.round(ms * 1.2);
  }
  return ms;
}

function playClockMs(ms){
  return Math.round(momentumClockMs(pickClockMs(ms)) * PACE + FLAT_ADD_MS);
}

function questionDuration(){
  if(R.mode==="trial"){ return playClockMs(ACTS[R.actIdx].t * R.diff.time); }
  if(R.mode==="daily"){ return playClockMs(10000 * R.diff.time); }
  if(R.mode==="blitz"){
    const left = Math.max(0, (R.blitzEnd || 0) - performance.now());
    return Math.max(900, left);
  }
  if(R.mode==="practice"){ return playClockMs(12000 * R.diff.time); }
  // Typing a phrase takes far longer than picking one, so Recall gets a
  // clock sized for the work rather than the same one the pickers use.
  if(R.mode==="recall"){ return Math.round(32000 * R.diff.time * PACE + FLAT_ADD_MS); }
  // The road's clock is a function of how far east you are: 14s at Ur,
  // 6.5s at Patmos. pilgrimage.js owns the ramp. Typed slots on a mixed
  // site always get a typing-sized clock (at least 20s base).
  if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    if(R.speed) return playClockMs((Pilgrimage.SPEED_MS || 6000) * R.diff.time);
    const base = siteClockMs(R.siteId, R.mode);
    if(R.mode==="pilgrimage" && R.typed) return Math.round(Math.max(32000, base) * R.diff.time * PACE + FLAT_ADD_MS);
    return playClockMs(base * R.diff.time);
  }
  // The relay inherits each site's own clock as it reaches it, so the
  // road tightens inside a single run exactly as it does across many.
  if(R.mode==="relay"){
    const cur = R.relay && R.relay.current;
    return playClockMs(Pilgrimage.clockFor(cur ? cur.index : 0) * R.diff.time);
  }
  return playClockMs(Math.max(4200, R.endlessBase - R.qTotal*180) * R.diff.time);
}

/* ------------------------- QUESTION ADVANCE ------------------------- */
function nextQuestion(){
  clearSequence();
  if(R.setpiece && R.setpiece.finishing) SetPieces.cleanup();
  if(R.mode==="trial"){
    const acts = trialActs();
    const A = acts[R.actIdx];
    if(A && A.q !== Infinity && R.qInAct >= A.q){
      if(R.actNoLoss && !hasSeal("unshaken")) grantSeal("unshaken");
      if(R.actIdx < acts.length-1){ beginAct(R.actIdx+1); return; }
      endRun("complete"); return;
    }
    if(SetPieces.maybeLaunch()) return;
  }
  if(R.mode==="daily" && R.dailyIdx >= R.daily.list.length){ endRun("complete"); return; }
  if(R.mode==="blitz" && R.blitzEnd && performance.now() >= R.blitzEnd){ endRun("death"); return; }
  if((R.mode==="practice" || R.mode==="recall") && R.qTotal >= R.practiceLen){ endRun("complete"); return; }
  /* The site's own verses are exhausted. A handful of places close with
     a set piece rather than simply ending — the sequence is the climax
     of the site, which is why it fires here and not partway through. */
  if((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece &&
     R.siteIdx >= (R.siteVerses ? R.siteVerses.length : 0)){
    if(SetPieces.maybeLaunchSite()) return;
    endRun("complete"); return;
  }
  if(R.mode==="relay" && R.relay.idx >= R.relay.queue.length){ endRun("complete"); return; }
  if(R.setpiece && R.setpiece.passage){ startPassage(); updateChips(); return; }
  if(R.setpiece && R.setpiece.reconstruct){ startReconstruct(); updateChips(); return; }

  let v;
  if(R.mode==="daily"){ v = R.daily.list[R.dailyIdx].v; R.dailyIdx++; }
  // During a site's closing sequence the fixed list is finished, so the
  // verses come from SetPieces.draw below instead.
  else if((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece){
    v = R.siteVerses[R.siteIdx]; R.siteIdx++;
    /* Pilgrim’s Recall is fully typed. Mixed pilgrimage ends with two
       typed questions so production is trained without dominating the
       stop. Late arcs also drop a typed recall mid-site (the road gets
       busier east), and every site carries one swift 3-second round so
       the body is not eight copies of the same tap. */
    const vi = R.siteIdx - 1;
    if(R.mode==="pilgrim-recall"){ R.typed = true; R.speed = false; }
    else if(R.mode==="pilgrimage"){
      const n = R.siteVerses ? R.siteVerses.length : 0;
      const typedN = Math.min(2, n);
      const arcKey = R.siteId ? (Pilgrimage.site(R.siteId)||{}).arc : null;
      const mixed = arcKey ? Pilgrimage.mixedTypedSlot(vi, n, arcKey) : false;
      const pass = (typeof Pilgrimage !== "undefined" && Pilgrimage.spiralPass) ? Pilgrimage.spiralPass(SAVE.pilgrim) : 1;
      const isLastBeat = (n > 0 && vi === n - 1);

      if(pass >= 3){
        R.typed = true;
      } else if(pass === 2){
        R.typed = isLastBeat || vi === 3 || vi === 4;
      } else {
        R.typed = (n > 0 && vi >= (n - typedN)) || mixed || isLastBeat;
      }
      R.speed = Pilgrimage.speedSlot(vi, n) && !R.typed;
    }
  }
  else if(R.mode==="relay"){
    const rl = R.relay, entry = rl.queue[rl.idx];
    // Leaving a site banks it before the next one starts.
    if(rl.current && rl.current.siteId !== entry.siteId) bankRelaySite(rl.current.siteId);
    rl.current = entry; rl.idx++;
    const site = Pilgrimage.site(entry.siteId);
    if(site){
      const arc = Pilgrimage.arc(site.arc);
      if(arc) Backdrop.palette(arc.pal);
      applySiteSky(entry.siteId);
    }
    v = entry.v;
  }
  else if(R.mode==="practice" || R.mode==="recall"){ v = drawReviewVerse(); }
  else v = R.mode==="endless"&&!R.setpiece ? drawEndlessVerse(currentTier()) : SetPieces.draw(currentTier());

  R.q = v; R.usedRefs.add(refKey(v)); commitSiteVerse(v);
  if(!R.setpiece) R.qInAct++; R.qTotal++;
  R.tiersSeen.add(v.t);
  if(R.mode==="trial" && R.actIdx===4) R.sdCount++;
  const dur = SetPieces.duration(questionDuration());
  updateChips();
  if(maybePlaySiteQuote(v, dur)) return;
  witnessLook(false);
  renderQuestion(v, dur);
}

function maybePlaySiteQuote(v, dur){
  if((R.mode!=="pilgrimage" && R.mode!=="pilgrim-recall") || R.setpiece) return false;
  if(R.siteIdx!==1 || R.quoteShown) return false;
  const site = Pilgrimage.site(R.siteId);
  if(!site || !site.quote) return false;
  R.quoteShown = true;
  if(document.body.classList.contains("reduced")) return false;
  if(typeof showSiteQuote === "function"){
    showSiteQuote(site, function(){ witnessLook(false); renderQuestion(v, dur); });
    return true;
  }
  return false;
}

/* ------------------------- CHOICES & ANSWER BUTTONS ------------------------- */
function answerButtons(){
  return [].slice.call($("opts").children).filter(b => b.classList && b.classList.contains("ans"));
}

/* Prefer distractors that *look* like the correct phrase so all four
   options feel similar — length, word count, shape — and English alone
   cannot discard the wrong ones. */
function buildChoices(q, rnd){
  const r = rnd || Math.random;
  const correct = String(q.a||"");
  const ban = {}; if(correct) ban[correct] = 1;
  const picked = [];
  function push(s){
    s = String(s||"").trim();
    if(!s || ban[s]) return false;
    ban[s] = 1; picked.push(s); return true;
  }
  /* Ranking lives in Polish.choiceShapeScore so the tests pin the same
     math the game uses — the two copies had drifted before this dedupe.
     Local fallback keeps the no-polish sandbox honest. */
  const shapeScore = (typeof Polish !== "undefined" && Polish.choiceShapeScore)
    ? (cand => Polish.choiceShapeScore(correct, cand))
    : (cand => (cand && cand !== correct) ? 1 : -1);
  const cands = [];
  const wantWords = correct.trim().split(/\s+/).filter(Boolean).length;
  function similarEnough(s){
    const t = String(s||"");
    const wc = t.trim().split(/\s+/).filter(Boolean).length;
    const lenDiff = Math.abs(t.length - correct.length);
    return Math.abs(wc - wantWords) <= 1 && lenDiff <= 12;
  }
  (q.d||[]).forEach(d=>{
    if(!d || d===correct) return;
    cands.push({ s:d, score: shapeScore(d) + (similarEnough(d) ? 8 : 5) });
  });
  if(typeof Polish!=="undefined" && Polish.lookalikePhrases && typeof VERSES!=="undefined"){
    Polish.lookalikePhrases(correct, VERSES.map(v=>v && v.a), 8).forEach(s=>{
      cands.push({ s:s, score: shapeScore(s) + 6 });
    });
  }
  if(typeof VERSES!=="undefined"){
    VERSES.forEach(v=>{
      if(!v || v.id===q.id || !v.a || v.a===correct || ban[v.a]) return;
      let score = shapeScore(v.a);
      if(v.b===q.b) score += 5;
      if(Math.abs((v.t||3)-(q.t||3))<=1) score += 2;
      if(similarEnough(v.a)) score += 6;
      if(score>=6) cands.push({ s:v.a, score });
    });
  }
  cands.sort((a,b)=> (b.score-a.score) || (r()-0.5));
  for(let i=0;i<cands.length && picked.length<3;i++){
    if(!similarEnough(cands[i].s) && picked.length) continue;
    push(cands[i].s);
  }
  for(let i=0;i<cands.length && picked.length<3;i++){
    const lenDiff = Math.abs(String(cands[i].s).length - correct.length);
    if(lenDiff>16 && picked.length) continue;
    push(cands[i].s);
  }
  (q.d||[]).forEach(d=>{ if(picked.length<3) push(d); });
  /* Last resort: real answers from the bank, nearest in length. The old
     numbered fakes ("the word of the LORD 2") looked broken on screen. */
  if(picked.length<3 && typeof VERSES!=="undefined"){
    VERSES.filter(x=>x && x.a && x.a!==correct && !ban[x.a])
      .sort((a,b)=>Math.abs(a.a.length-correct.length)-Math.abs(b.a.length-correct.length))
      .slice(0,6).forEach(x=>{ if(picked.length<3) push(x.a); });
  }
  const fillBase = correct.length>18 ? "the word of the LORD forever" :
    correct.length>10 ? "the word of the LORD" : "the LORD";
  let n=0;
  while(picked.length<3 && n<3){
    n++;
    push(fillBase);
  }
  return shuffle([correct].concat(picked.slice(0,3)), r);
}

function renderQuestion(q, dur){
  const scene = ++R.sceneToken;
  Director.pressure(0);
  $("ref").textContent = q.r + " — KJV";
  // blank is a fixed width so the length of the answer is never a clue
  $("verse").innerHTML = highlightVerse(q.p) +
    ' <span class="blank" id="blank">&#8195;&#8195;&#8195;</span>' + sep(q.s) + highlightVerse(q.s);
  fitVerseSize((q.p||"").length+(q.a||"").length+(q.s||"").length);
  /* A light entrance on each new verse so question-to-question feels
     like a handoff, not a hard swap. */
  const verseEl = $("verse");
  if(verseEl && !document.body.classList.contains("reduced")){
    verseEl.classList.remove("q-in"); void verseEl.offsetWidth; verseEl.classList.add("q-in");
  }
  R.locked = false; R.selected = null;
  document.body.classList.toggle("mode-typed", !!R.typed);
  document.body.classList.toggle("speed-round", !!R.speed);
  if(R.typed) return renderTypedQuestion(q, dur, scene);
  const confirmBtn = $("confirm-answer");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.textContent = SetPieces.autoLock() ? "Rapid Lock"
    : (R.speed ? "Swift Lock"
    : (SAVE.set.singleTap === false ? "Lock Answer" : "One-tap answer"));
  const how=$("warn-how");
  if(how) how.innerHTML = (SAVE.set.singleTap === false)
    ? "Select a phrase, then lock it<br>Enter or Space confirms"
    : "Tap a phrase to answer";
  const opts = $("opts"); opts.className = "answers queued"; opts.innerHTML = "";
  const rnd = R.mode==="daily" ? R.daily.rnd : Math.random;
  const choices = buildChoices(q, rnd);
  choices.forEach((c,i)=>{
    if(i){ const ch=document.createElement("div"); ch.className="chev"; ch.innerHTML="&#8250;"; opts.appendChild(ch); }
    const b=document.createElement("button");
    b.className="ans"; b.dataset.val=c;
    b.setAttribute("aria-pressed","false");
    b.innerHTML='<span class="ans-float"><span class="ltr">'+LETTERS[i]+'.</span>'+esc(c)+'</span>';
    b.style.setProperty("--drift-delay", (i * 0.85) + "s");
    b.addEventListener("click", ()=>pickAnswer(c,b));
    opts.appendChild(b);
  });
  if(!SetPieces.autoLock() && !document.body.classList.contains("reduced")) opts.classList.add("drift");
  renderPowers();
  armTimer(dur);
  const entranceDelay=R.setpiece?180:Math.min(1450,Math.max(520,dur*.12));
  afterRun(entranceDelay, ()=>{
    if(R.q!==q || R.sceneToken!==scene || currentView!=="play")return;
    opts.classList.remove("queued");opts.classList.add("entering");
    startTimer(dur);
    afterRun(760, ()=>{ if(R.q===q && R.sceneToken===scene) opts.classList.remove("entering"); });
    Snd.lock();
  });
}

function pickAnswer(val, btn){
  if(!R.running || R.paused || R.locked) return;
  answerButtons().forEach(b=>{b.classList.remove("sel");b.setAttribute("aria-pressed","false");});
  btn.classList.add("sel");
  btn.setAttribute("aria-pressed","true");
  R.selected = {val, btn};
  const confirm=$("confirm-answer");
  if(SetPieces.autoLock() || SAVE.set.singleTap !== false){
    answer(val, btn);
    return;
  }
  confirm.disabled = false;
  confirm.textContent = "Lock "+LETTERS[Math.max(0,answerButtons().indexOf(btn))];
  Snd.ui();
}

function confirmAnswer(){
  if(R.typed) return confirmTyped();
  if(!R.selected || !R.running || R.paused || R.locked) return;
  answer(R.selected.val, R.selected.btn);
}

/* ------------------------- TIMER ------------------------- */
const RING_C = 2 * Math.PI * 52;   // circumference of the countdown arc

function armTimer(dur){
  R.tTotal = dur; R.tEnd = 0; R.qStart = 0;
  R.running = false; R.paused = false; R.lastTickSec = -1; R.lastHeart = 0; R.lastHeartSec = -1;
  if(typeof Snd!=="undefined" && Snd.stopPressure) Snd.stopPressure();
  const sec = Math.ceil(dur/1000);
  $("clock").textContent = "00:" + String(sec).padStart(2,"0");
  $("warn-1").textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
  $("ring").classList.remove("crit");
  $("ring-arc").style.strokeDashoffset = "0";
}

function startTimer(dur){
  const extra = R.pendingSelah||0;
  R.pendingSelah = 0;
  R.tTotal = dur + extra; R.tEnd = performance.now()+dur+extra; R.qStart = performance.now();
  R.running = true; R.paused = false; R.lastTickSec = -1; R.lastHeart = 0; R.lastHeartSec = -1;
  if(document.hidden){pauseStamp=performance.now();setPaused(true);}
  else ensureLoop();
}

function tickTimer(now){
  if(!R.running || R.paused) return;
  if(R.mode==="blitz" && R.blitzEnd){
    const bLeft = R.blitzEnd - now;
    document.body.classList.remove("blitz-edge","blitz-edge-2","blitz-edge-3");
    const pr = typeof Polish!=="undefined" ? Polish.blitzPressure(bLeft) : 0;
    if(pr) document.body.classList.add(pr===3?"blitz-edge-3":pr===2?"blitz-edge-2":"blitz-edge");
    if(bLeft<=0){ timeUp(); return; }
    /* Blitz uses one shared survival clock — refresh arm each tick. */
    R.tEnd = R.blitzEnd; R.tTotal = Math.max(R.tTotal, typeof Polish!=="undefined"?Polish.BLITZ_START_MS:60000);
  }
  let left = R.tEnd - now; if(left<0) left=0;
  const frac = R.tTotal ? Math.max(0, Math.min(1, left/R.tTotal)) : 0;
  const sec = Math.ceil(left/1000);

  const arc = $("ring-arc");
  if(arc.style) arc.style.strokeDashoffset = String(RING_C * (1-frac));
  if(sec!==R.lastTickSec){
    R.lastTickSec = sec;
    $("clock").textContent = "00:" + String(sec).padStart(2,"0");
    $("ring").classList.toggle("crit", sec<=5);
    const w1 = $("warn-1");
    w1.textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
    w1.classList.toggle("hot", sec<=5);
    Director.pressure(sec);
    /* Strict countdown SFX (whole seconds only, never mid-bar 55% ticks):
       10–6 soft tick · 5–4 critical tick · 3–1 heartbeat only (no double stack). */
    if(left>0 && R.mode!=="blitz"){
      if(sec===4 || sec===5){
        Snd.tick(true);
      } else if(sec>=6 && sec<=10){
        Snd.tick(false);
      }
      /* sec 3–1: heartbeat only (below), no tick stack */
    }
  }
  /* Heartbeat owns the final three seconds — one pulse per second, stops on lock. */
  if(R.running && !R.locked && !R.paused && R.mode!=="blitz" &&
     sec>=1 && sec<=3 && left>0 && sec!==R.lastHeartSec){
    R.lastHeartSec = sec;
    R.lastHeart = now;
    Snd.heart();
    doFlash("heart");
  }
  if(left<=0) timeUp();
}

function stopTimer(){
  R.running=false;
  if(typeof Snd!=="undefined" && Snd.stopPressure) Snd.stopPressure();
  if(typeof Director!=="undefined" && Director.pressure) Director.pressure(0);
}

/* ------------------------- ANSWERING & RESOLUTION ------------------------- */
function answer(choice, btn){
  if(!R.running || R.paused) return;
  stopTimer();
  R.locked = true;
  $("confirm-answer").disabled = true;
  $("confirm-answer").textContent = "Answer Locked";
  const q=R.q;
  const elapsed = performance.now()-R.qStart;
  const left = Math.max(0, R.tEnd - performance.now());
  const opts=$("opts"); opts.classList.add("locked");
  Snd.lock();Snd.hush();
  Director.beat("lock");
  document.body.classList.remove("reveal-freeze");void document.body.offsetWidth;document.body.classList.add("reveal-freeze");
  afterRun(430, ()=>resolveAnswer(q,choice,btn,elapsed,left));
}

function recordDecision(ms){
  if(!Number.isFinite(ms)||ms<0)return;
  const safe=Math.min(ms,(R.tTotal||ms)+500);
  R.decisionMs+=safe;R.timedDecisions++;
  R.fastestMs=Math.min(R.fastestMs,safe);
}

function resolveAnswer(q,choice,btn,elapsed,left){
  if(R.q!==q)return;
  R.attempts++;
  recordDecision(elapsed);

  let ok, graded = null;
  if(R.typed){
    // The verse's own distractors are handed to the grader so a typed
    // near-miss is measured against the readings it could be confused
    // with, not just against character distance.
    graded = Recall.grade(choice, q.a, q.d);
    ok = Recall.isCorrect(graded.verdict);
    if(graded.verdict === "exact") R.typedExact++;
    if(graded.verdict === "close") R.typedClose++;
    SAVE.life.typedAttempts++;
    if(graded.verdict === "exact") SAVE.life.typedExact++;
    renderTypedVerdict(graded);
  } else {
    ok = choice===q.a;
    answerButtons().forEach(b=>{
      b.classList.remove("sel");
      if(b.dataset.val===q.a) b.classList.add("right");
      else if(b===btn) b.classList.add("bad");
      else b.classList.add("mute");
    });
  }
  recordVerse(q, ok);
  scheduleReview(q, {
    correct: ok,
    near: graded ? (graded.verdict === "close" || graded.verdict === "modernised") : false,
    fraction: R.tTotal ? Math.min(1, elapsed / R.tTotal) : 0.5,
    usedPower: R.hintLevel > 0
  });
  if(ok){
    const blank=$("blank"); blank.textContent=q.a; blank.classList.add("filled","reveal");
    R.correct++; R.streak++; R.best=Math.max(R.best,R.streak);
    R.booksRun.add(q.b);
    if(elapsed < 1500) R.fast++;
    // The "double pay" is no longer automatic — it only holds while the
    // player is riding the fire, a choice made at the Overdrive moment.
    const riding = R.overdriveRide && inOverdrive();
    const timeBonus = Math.round(left / R.tTotal * 140);
    const tierW = 1 + q.t*0.12;
    const gained = Math.round((150 + timeBonus) * multiplier() * R.diff.score * tierW * SetPieces.bonus() * (riding ? 2 : 1));
    R.score += gained;
    payCorrect(graded);
    if(R.mode==="blitz" && typeof Polish!=="undefined"){
      const leftB = Math.max(0, (R.blitzEnd||0) - performance.now());
      R.blitzEnd = performance.now() + Polish.blitzAdjustMs(leftB, true);
    }
    noteGhostProgress(); Director.impact("correct"); animateScore(); setMult(true);Director.momentum(true);
    if(typeof Cinematic !== "undefined" && (R.streak === 3 || R.streak === 5 || R.streak === 8 || R.streak === 12)){
      Cinematic.showComboStamp(R.streak, multiplier());
    }
    if(R.streak===5)Director.callout("Unbroken ×5");
    if(R.streak===10)Director.callout("Perfect Recall");
    if(R.streak>=10 && !hasSeal("recall")) grantSeal("recall");
    if(R.streak>=20 && !hasSeal("flame")) grantSeal("flame");
    if(R.fast>=10 && !hasSeal("swift")) grantSeal("swift");
    // The Overdrive moment: reaching the top of the meter pauses the run
    // and asks the player to ride (double pay, double risk) or bank.
    if(R.streak === MOMENTUM_STEPS[MOMENTUM_STEPS.length-1] && !R.setpiece && R.mode!=="blitz"){
      if(typeof Cinematic !== "undefined") Cinematic.showOverdriveEntrance();
      afterRun(700, offerOverdriveChoice);
      return;
    }
    afterRun(typeof Flow!=="undefined" ? Flow.JUDGE_MS : 820, queueAdvance);
  } else {
    // Riding the fire turns a miss into two lost lamps — the risk that
    // paid for the double reward. Capture before the streak resets.
    const wasRiding = R.overdriveRide && inOverdrive();
    if(R.streak >= 3 && typeof Cinematic !== "undefined"){
      Cinematic.showComboCollapse();
    }
    R.overdriveRide = false;
    spillOil(R.streak||0);
    R.streak=0; setMult(); R.missed.push(q);
    if(R.mode==="blitz" && typeof Polish!=="undefined"){
      const leftB = Math.max(0, (R.blitzEnd||0) - performance.now());
      R.blitzEnd = performance.now() + Polish.blitzAdjustMs(leftB, false);
    }
    Director.momentum(false);Director.impact("wrong");
    Snd.wrong(); doFlash("red"); shakeUI(true);
    if(SAVE.set.haptics!==false && typeof Polish!=="undefined") Polish.haptic("wrong");
    markBlankScar(choice, q.a);
    witnessLook(true);
    if(R.mode==="blitz"){
      afterRun(typeof Flow!=="undefined" ? Flow.JUDGE_MS : 820, ()=>{
        if(R.blitzEnd && performance.now()>=R.blitzEnd) presentRunEnd("timeout-death");
        else queueAdvance();
      });
    } else {
      loseLife(wasRiding ? 2 : 1);
    }
  }
}

function markBlankScar(wrong, right){
  const blank = $("blank");
  if(!blank) return;
  blank.classList.remove("filled","bad","hinted");
  blank.classList.add("scar","reveal");
  blank.innerHTML = '<s class="scar-miss">'+esc(wrong == null || wrong === "" ? "—" : wrong)+'</s>'+
    '<em class="scar-true">'+esc(right || "")+'</em>';
}

function noteGhostProgress(){
  if(typeof Polish==="undefined" || !R.startedAt) return;
  const t = Date.now() - R.startedAt;
  let p = 0;
  if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    const n = R.siteVerses ? R.siteVerses.length : 1;
    p = Math.min(1, (R.siteIdx||0) / n);
  } else if(R.mode==="blitz"){
    p = Math.min(1, (R.correct||0) / 30);
  } else if(R.mode==="daily" && R.daily && R.daily.list){
    p = Math.min(1, (R.dailyIdx||0) / R.daily.list.length);
  } else {
    p = Math.min(1, (R.qInAct||0) / 8);
  }
  R.ghostSamples.push({ t, p: Math.round(p * 100) / 100 });
}

function paintGhostMarker(){
  const track = $("act-track");
  if(!track) return;
  let ghost = track.querySelector(".ghost-mark");
  const pb = SAVE.ghosts && (R.mode==="blitz" ? SAVE.ghosts.blitz : SAVE.ghosts.pilgrimage);
  if(!pb || !pb.samples || !pb.samples.length){
    if(ghost) ghost.remove();
    return;
  }
  const elapsed = Date.now() - (R.startedAt||Date.now());
  const p = typeof Polish!=="undefined" ? Polish.sampleGhost(pb.samples, elapsed) : 0;
  if(!ghost){
    ghost = document.createElement("i");
    ghost.className = "ghost-mark";
    ghost.title = "Your best run";
    track.appendChild(ghost);
  }
  ghost.style.left = (Math.max(0, Math.min(1, p)) * 100) + "%";
}

function timeUp(){
  if(R.mode==="blitz"){ presentRunEnd("timeout-death"); return; }
  if(R.passage) return resolvePassage();
  if(R.recon) return resolveRecon();
  stopTimer(); R.locked=true; R.selected=null; R.attempts++; recordDecision(R.tTotal);
  spillOil(R.streak||0);
  R.streak=0; setMult();
  $("confirm-answer").disabled = true;
  $("confirm-answer").textContent = "Time Expired";
  Director.momentum(false);Director.pressure(0);
  const q=R.q, opts=$("opts"); opts.classList.add("locked");
  if(R.typed){
    const input=$("typed-answer"); if(input) input.disabled = true;
    renderTypedVerdict({verdict:"wrong", hint:""});
  } else {
    answerButtons().forEach(b=>{
      b.classList.remove("sel");
      if(b.dataset.val===q.a) b.classList.add("right"); else b.classList.add("mute");
    });
  }
  if(q) markBlankScar("— time —", q.a);
  witnessLook(true);
  recordVerse(q,false);
  scheduleReview(q, {correct:false, timedOut:true});
  R.missed.push(q);
  Director.impact("wrong");Snd.wrong(); doFlash("red"); shakeUI(true);
  loseLife();
}

function loseLife(count){
  count = count || 1;
  /* A recovered relic shields the road once per site: the miss still
     costs the streak, but the lamp holds. */
  const onRoad = R.mode==="pilgrimage" || R.mode==="pilgrim-recall" || R.mode==="relay";
  if(onRoad && count===1 && !R.armorUsed && typeof Artifacts!=="undefined" && Artifacts.unlockedCount(SAVE.artifacts) > 0){
    R.armorUsed = true;
    toast("Relic shield — one miss absorbed");
    Snd.power();
    renderLives();
    afterRun(typeof Flow!=="undefined" ? Flow.JUDGE_MS : 820, queueAdvance);
    return;
  }
  R.lives = Math.max(0, R.lives - count);
  renderLives(count);
  if(R.lives===1 && !R.oneLifeCalled){ R.oneLifeCalled=true; Director.speak("One life remains.",true); }
  if(R.lives<=0){
    const finalAct = R.mode==="trial" && R.actIdx===trialActs().length-1;
    const canUseWind = !finalAct && !SetPieces.noPowers() && R.powers.wind>0;
    if(canUseWind){
      R.powers.wind--; R.usedPower=true; R.powersSpent++; R.lives=1; renderLives(); renderPowers();
      toast("Second Wind — one life restored");
      Snd.power(); afterRun(1900, queueAdvance); return;
    }
    afterRun(900, ()=>presentRunEnd("fallen")); return;
  }
  afterRun(SetPieces.autoLock()?950:1900, queueAdvance);
}
