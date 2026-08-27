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

const FADE_MEMORY_MS = 60000;
const FADE_RECALL_MIN_MS = 60000;
const WALL_PICK_MS = 30000;
const WALL_TYPED_MS = 45000;
const WALL_FADE_MS = 60000;

function usesWallClock(){
  return R.mode==="pilgrimage" || R.mode==="pilgrim-recall" || R.mode==="relay"
    || R.mode==="daily" || R.mode==="practice" || R.mode==="recall" || R.mode==="tutorial";
}

function answerHoldMs(){
  /* The universal post-answer hold (Flow.JUDGE_MS) in EVERY mode. The
     wrong-answer teach pause is where the verdict and word diff get
     read; it must never collapse to 0. Correct answers chain faster via
     correctAdvance(), which is a separate path. */
  return (typeof Flow !== "undefined" && typeof Flow.judgeMs === "function")
    ? Flow.judgeMs(typeof R !== "undefined" ? R.mode : "")
    : 2500;
}

function fullVerseText(q){
  const prefix = String(q && q.p || "").trim();
  const answer = String(q && q.a || "").trim();
  const suffix = String(q && q.s || "").trim();
  let text = [prefix, answer].filter(Boolean).join(" ");
  if(suffix) text += /^[.,;:!?]/.test(suffix) ? suffix : " " + suffix;
  return text;
}

function questionDuration(){
  if(R.mode==="trial"){ return playClockMs(ACTS[R.actIdx].t * R.diff.time); }
  if(R.mode==="blitz"){
    const left = Math.max(0, (R.blitzEnd || 0) - performance.now());
    return Math.max(900, left);
  }
  if(usesWallClock()) return wallClockMs();
  return playClockMs(Math.max(4200, R.endlessBase - R.qTotal*180) * R.diff.time);
}

/* ------------------------- FIRST-RUN ONBOARDING ------------------------- */
const TUTORIAL_QUESTIONS = [
  {
    id: "tutorial-choice", b: "Psalms", r: "Psalm 23:1", t: 1,
    p: "The LORD is my shepherd; I", a: "shall not want", s: ".",
    d: ["shall not fear", "shall not faint", "shall not wander"]
  },
  {
    id: "tutorial-passage-ref", b: "Proverbs", r: "Proverbs 3:5", t: 1,
    p: "Trust in the LORD with all thine heart; and lean not unto thine", a: "own understanding", s: ".",
    d: ["carnal wisdom", "earthly counsel", "proud imagination"],
    mechanic: "passage-ref"
  },
  {
    id: "tutorial-cloze", b: "Genesis", r: "Genesis 1:1", t: 1,
    p: "In the beginning", a: "God created the heaven and the earth", s: ".",
    d: ["the Word formed the light and land", "the Almighty established the deep"],
    mechanic: "cloze"
  },
  {
    id: "tutorial-duel", b: "John", r: "John 1:1", t: 1,
    p: "In the beginning was the Word, and the Word was with God, and the Word", a: "was God", s: ".",
    d: ["was divine", "became flesh", "dwelt in light"],
    mechanic: "duel"
  },
  {
    id: "tutorial-fade", b: "Philippians", r: "Philippians 4:13", t: 1,
    p: "I can do all things through Christ which", a: "strengtheneth me", s: ".",
    d: ["keepeth me", "comforteth me", "teacheth me"],
    mechanic: "fade"
  },
  {
    id: "tutorial-assemble", b: "Psalms", r: "Psalm 118:24", t: 1,
    p: "This is the day which the LORD hath made; we will", a: "rejoice and be glad in it", s: ".",
    d: ["sing and give thanks", "stand and praise his name", "remember and be glad"],
    typed: true
  }
];

const TUTORIAL_GUIDE = [
  "Lesson 1 · Recognition: Choose the phrase that completes the verse.",
  "Lesson 2 · Name the Passage: Select its book, chapter, and verse.",
  "Lesson 3 · Scribe's Cloze: Tap the missing words in sequence from the tray below.",
  "Lesson 4 · True Scripture Duel: Discern and choose the genuine King James reading.",
  "Lesson 5 · Fade-to-Memory: Memorize the whole verse — tap I'm Done when you hold it, then rebuild every word in order.",
  "Lesson 6 · Assembled Recall: Drag or tap the words in order, then lock your answer."
];

const TUTORIAL_VOICE = [
  "Lesson one. Choose the phrase that completes the verse.",
  "Lesson two. Name the passage for the verse shown.",
  "Lesson three. Tap the missing words in sequence.",
  "Lesson four. Discern the true Scripture reading.",
  "Lesson five. Memorize the whole verse for one minute, then rebuild every word in order.",
  "Lesson six. Assemble the verse from memory."
];

function updateTutorialGuide(index, result){
  const guide=$("tutorial-guide"), step=$("tutorial-step"), copy=$("tutorial-copy");
  if(!guide) return;
  guide.hidden=false;
  if(step) step.textContent="First light · Lesson "+(index+1)+" of "+TUTORIAL_QUESTIONS.length;
  if(copy) copy.textContent=result || TUTORIAL_GUIDE[index] || TUTORIAL_GUIDE[0];
}

function startTutorialRun(){
  const token=(R.runToken||0)+1;
  invalidateRun();
  Object.assign(R,{
    runToken:token, sceneToken:0, ended:false, mode:"tutorial", diff:resolveDiff("watchman"),
    q:null, qTotal:0, qInAct:0, score:0, disp:0, lives:3, maxLives:3,
    streak:0, best:0, correct:0, attempts:0, missed:[], used:new Set(), usedRefs:new Set(),
    powers:{selah:1,illum:1,wind:0}, usedPower:false, qUsedPower:false, powersSpent:0,
    running:false, paused:false, locked:false, selected:null, tEnd:0, tTotal:0, qStart:0,
    tutorial:{index:-1,total:TUTORIAL_QUESTIONS.length,correct:0,attempts:0},
    typed:false, currentMechanic:null, hintLevel:0, pendingSelah:0, setpiece:null, speed:false,
    tiersSeen:new Set(), booksRun:new Set(), rescheduled:[], decisionMs:0, timedDecisions:0,
    fastestMs:Infinity, lastTickSec:-1, lastHeart:0, pressureStage:-1
  });
  document.body.classList.add("onboarding");
  document.body.classList.remove("mode-typed","speed-round");
  Backdrop.palette("menu");
  /* Indigo gives the first-run lesson its own calm, focused identity. */
  Snd.ambience("indigo");
  go("play");
  tutorialNextQuestion();
}

function tutorialNextQuestion(){
  if(R.mode!=="tutorial" || R.ended) return;
  const index=++R.tutorial.index;
  if(index>=R.tutorial.total){ completeTutorialRun(); return; }
  const q=TUTORIAL_QUESTIONS[index];
  R.q=q; R.qTotal=index+1; R.qInAct=index+1;
  R.typed = !!q.typed;
  R.currentMechanic = q.mechanic || null;
  R.speed=false;
  R.hintLevel=0; R.qUsedPower=false; R.locked=false; R.selected=null;
  updateTutorialGuide(index);
  updateChips(); updateActTrack();
  const dur = (q.mechanic === "fade") ? WALL_FADE_MS : (q.typed ? WALL_TYPED_MS : WALL_PICK_MS);
  renderQuestion(q, dur);
  if(typeof Director!=="undefined" && Director.speak) Director.speak(TUTORIAL_VOICE[index], true);
}

function gradeTutorialChoice(q, choice, btn){
  if(R.typed){
    const target = (typeof assemblyTargetFor === "function") ? assemblyTargetFor(q) : q.a;
    const graded=Recall.grade(choice||"", target, q.d);
    renderTypedVerdict(graded);
    return { ok:Recall.isCorrect(graded.verdict), graded:graded };
  }
  const choiceNorm = (typeof choice === "string") ? choice.trim().replace(/\s+/g, ' ').toLowerCase() : "";
  const targetNorm = (typeof q.a === "string") ? q.a.trim().replace(/\s+/g, ' ').toLowerCase() : "";
  const ok = (choice === q.a) || (choiceNorm !== "" && choiceNorm === targetNorm);
  answerButtons().forEach(function(b){
    b.classList.remove("sel");
    if(b.dataset.val===q.a) b.classList.add("right");
    else if(b===btn) b.classList.add("bad");
    else b.classList.add("mute");
  });
  return { ok:ok, graded:null };
}
function resolveTutorialAnswer(q, choice, btn){
  if(R.q!==q || R.mode!=="tutorial") return;
  const gradedPack = gradeTutorialChoice(q, choice, btn);
  const ok = gradedPack.ok;
  const blank=$("blank");
  if(blank){
    blank.textContent = (R.currentMechanic === "fade" && typeof assemblyTargetFor === "function")
      ? assemblyTargetFor(q) : q.a;
    blank.classList.add("filled","reveal");
  }
  R.tutorial.attempts++;
  if(ok) R.tutorial.correct++;
  updateTutorialGuide(R.tutorial.index, ok ? "Well done. The lesson continues." : "The true verse reads: "+q.a);
  if(ok) Snd.correct(); else Snd.wrong();
  if(typeof Director!=="undefined" && Director.impact) Director.impact(ok?"correct":"wrong");
  /* Lesson five pays its card too: a mastered memorization grants an
     Illuminate lifeline exactly as it does inside a real run. */
  if(ok && R.currentMechanic === "fade" && R.powers){
    R.powers.illum = (R.powers.illum||0) + 1;
    if(typeof Director!=="undefined" && Director.callout) Director.callout("Memorization mastered — Illuminate earned");
    Snd.power(); doFlash("violet"); renderPowers();
  }
  afterRun(typeof Flow !== "undefined" ? Flow.JUDGE_MS : 2500, tutorialNextQuestion);
}

function completeTutorialRun(){
  if(R.ended) return;
  R.ended=true; R.running=false; R.locked=true;
  stopTimer();
  const guide=$("tutorial-guide");
  if(guide) guide.hidden=true;
  document.body.classList.remove("onboarding","mode-typed","speed-round");
  SAVE.set.tutorialDone=true;
  persist();
  go("menu");
  if(typeof profileReady==="function" && !profileReady()){
    setTimeout(function(){ if(currentView==="menu") openProfileSetup(true); }, 240);
  }
}

/* ------------------------- QUESTION ADVANCE ------------------------- */
function nextQuestionTrialGate(){
  if(R.mode!=="trial") return false;
  const acts = trialActs();
  const A = acts[R.actIdx];
  if(A && A.q !== Infinity && R.qInAct >= A.q){
    if(R.actNoLoss && !hasSeal("unshaken")) grantSeal("unshaken");
    if(R.actIdx < acts.length-1){ beginAct(R.actIdx+1); return true; }
    endRun("complete"); return true;
  }
  return !!SetPieces.maybeLaunch();
}

function nextQuestionSiteGate(){
  if(!((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece &&
     R.siteIdx >= (R.siteVerses ? R.siteVerses.length : 0))) return false;
  if(SetPieces.maybeLaunchSite()) return true;
  endRun("complete"); return true;
}
function nextQuestionRunGate(){
  if(R.mode==="daily" && R.dailyIdx >= R.daily.list.length){ endRun("complete"); return true; }
  if(R.mode==="blitz" && R.blitzEnd && performance.now() >= R.blitzEnd){ endRun("death"); return true; }
  if((R.mode==="practice" || R.mode==="recall") && R.qTotal >= R.practiceLen){ endRun("complete"); return true; }
  if(nextQuestionSiteGate()) return true;
  if(R.mode==="relay" && R.relay.idx >= R.relay.queue.length){ endRun("complete"); return true; }
  if(R.setpiece && R.setpiece.passage){ startPassage(); updateChips(); return true; }
  if(R.setpiece && R.setpiece.reconstruct){ startReconstruct(); updateChips(); return true; }
  return false;
}

function applyPilgrimageTypedMode(){
  const vi = R.siteIdx - 1;
  if(R.mode==="pilgrim-recall"){ R.typed = true; R.speed = false; return; }
  if(R.mode!=="pilgrimage") return;
  const n = R.siteVerses ? R.siteVerses.length : 0;
  const typedN = Math.min(2, n);
  const arcKey = R.siteId ? (Pilgrimage.site(R.siteId)||{}).arc : null;
  const mixed = arcKey ? Pilgrimage.mixedTypedSlot(vi, n, arcKey) : false;
  const pass = (typeof Pilgrimage !== "undefined" && Pilgrimage.spiralPass) ? Pilgrimage.spiralPass(SAVE.pilgrim) : 1;
  const isLastBeat = (n > 0 && vi === n - 1);
  if(pass >= 3) R.typed = true;
  else if(pass === 2) R.typed = isLastBeat || vi === 3 || vi === 4;
  else R.typed = (n > 0 && vi >= (n - typedN)) || mixed || isLastBeat;
  R.speed = Pilgrimage.speedSlot(vi, n) && !R.typed;
}

function drawRelayVerse(){
  const rl = R.relay, entry = rl.queue[rl.idx];
  if(rl.current && rl.current.siteId !== entry.siteId) bankRelaySite(rl.current.siteId);
  rl.current = entry; rl.idx++;
  R.siteId = entry.siteId;
  R.siteIndex = entry.index;
  R.verseIndex = (typeof entry.verseIndex === "number") ? entry.verseIndex : 0;
  const site = Pilgrimage.site(entry.siteId);
  if(site){
    const arc = Pilgrimage.arc(site.arc);
    if(arc) Backdrop.palette(arc.pal);
    applySiteSky(entry.siteId);
  }
  return entry.v;
}

function drawNextQuestionVerse(){
  if(R.mode==="daily"){ const v = R.daily.list[R.dailyIdx].v; R.dailyIdx++; return v; }
  if((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece){
    const v = R.siteVerses[R.siteIdx]; R.siteIdx++;
    applyPilgrimageTypedMode();
    return v;
  }
  if(R.mode==="relay") return drawRelayVerse();
  if(R.mode==="practice" || R.mode==="recall") return drawReviewVerse();
  return R.mode==="endless"&&!R.setpiece ? drawEndlessVerse(currentTier()) : SetPieces.draw(currentTier());
}

function nextQuestion(){
  clearSequence();
  stopTimer();
  if(R.mode==="tutorial"){ tutorialNextQuestion(); return; }
  R.qUsedPower=false;
  if(R.setpiece && R.setpiece.finishing) SetPieces.cleanup();
  if(nextQuestionTrialGate()) return;
  if(nextQuestionRunGate()) return;
  const v = drawNextQuestionVerse();
  R.q = v; R.usedRefs.add(refKey(v)); commitSiteVerse(v);
  if(!R.setpiece) R.qInAct++; R.qTotal++;
  R.tiersSeen.add(v.t);
  /* The Daily's stamped typed beat must actually flip the answering
     mode — nothing else maps q.typed outside the tutorial/road. */
  if(R.mode==="daily") R.typed = !!v.typed;
  if(R.mode==="trial" && R.actIdx===4) R.sdCount++;
  /* Drop the previous mechanic before the clock is measured so a Fade
     minute cannot leak onto the next verse. */
  R.currentMechanic = null;
  R.fadePhase = null;
  R.fadeAssembly = null;
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
    // Render before the optional cold-open so the play view can never
    // remain an empty shell if the cold-open is interrupted or hidden.
    // The completed render arms its mechanic-specific duration; stop it
    // while the overlay owns focus, then start that exact duration once
    // the quote clears.
    R.quoteMusicHold = true;
    renderQuestion(v, dur);
    R.quoteMusicHold = false;
    const armedDuration = R.tTotal || dur;
    stopTimer();
    showSiteQuote(site, function(){
      if(R.q===v && currentView==="play" && !R.ended){
        witnessLook(false);
        cueQuestionMusic();
        startTimer(armedDuration);
      }
    });
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
function collectChoiceCandidates(q, correct, ban, shapeScore, similarEnough, r){
  const cands = [];
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
  return cands;
}
function fillPickedChoices(cands, push, similarEnough, correct, ban, q){
  const picked = [];
  for(let i=0;i<cands.length && picked.length<3;i++){
    if(!similarEnough(cands[i].s) && picked.length) continue;
    if(push(cands[i].s)) picked.push(cands[i].s);
  }
  for(let i=0;i<cands.length && picked.length<3;i++){
    const lenDiff = Math.abs(String(cands[i].s).length - correct.length);
    if(lenDiff>16 && picked.length) continue;
    if(push(cands[i].s)) picked.push(cands[i].s);
  }
  (q.d||[]).forEach(d=>{ if(picked.length<3 && push(d)) picked.push(d); });
  if(picked.length<3 && typeof VERSES!=="undefined"){
    VERSES.filter(x=>x && x.a && x.a!==correct && !ban[x.a])
      .sort((a,b)=>Math.abs(a.a.length-correct.length)-Math.abs(b.a.length-correct.length))
      .slice(0,6).forEach(x=>{ if(picked.length<3 && push(x.a)) picked.push(x.a); });
  }
  const fillBase = correct.length>18 ? "the word of the LORD forever" :
    correct.length>10 ? "the word of the LORD" : "the LORD";
  let n=0;
  while(picked.length<3 && n<3){
    n++;
    if(push(fillBase)) picked.push(fillBase);
  }
  return picked;
}
function buildChoices(q, rnd){
  const r = rnd || Math.random;
  const correct = String(q.a||"");
  const ban = {}; if(correct) ban[correct] = 1;
  function push(s){
    s = String(s||"").trim();
    if(!s || ban[s]) return false;
    ban[s] = 1; return true;
  }
  const shapeScore = (typeof Polish !== "undefined" && Polish.choiceShapeScore)
    ? (cand => Polish.choiceShapeScore(correct, cand))
    : (cand => (cand && cand !== correct) ? 1 : -1);
  const wantWords = correct.trim().split(/\s+/).filter(Boolean).length;
  function similarEnough(s){
    const t = String(s||"");
    const wc = t.trim().split(/\s+/).filter(Boolean).length;
    const lenDiff = Math.abs(t.length - correct.length);
    return Math.abs(wc - wantWords) <= 1 && lenDiff <= 12;
  }
  const cands = collectChoiceCandidates(q, correct, ban, shapeScore, similarEnough, r);
  const picked = fillPickedChoices(cands, push, similarEnough, correct, ban, q);
  return shuffle([correct].concat(picked.slice(0,3)), r);
}

function updateSiteVideoVolume(){
  const vid = $("cine-parallax-video");
  if(!vid) return;
  const sfxVol = (typeof SAVE !== "undefined" && SAVE.set && typeof SAVE.set.sfx === "number") ? SAVE.set.sfx : 0.7;
  const isQuiet = typeof SAVE !== "undefined" && SAVE.set && SAVE.set.quiet;
  const base = isQuiet ? Math.min(sfxVol, 0.35) : sfxVol;
  vid.volume = Math.max(0, Math.min(1, base * 0.45));
}

function playSiteAmbientVideo(vid, el, ambientVideo, rainSites, siteId){
  if(!vid.src || !vid.src.includes(ambientVideo)){
    vid.src = ambientVideo;
  }
  vid.loop = true;
  vid.muted = true;
  vid.playsInline = true;
  vid.style.display = "block";
  vid.style.opacity = "1";
  if(el) el.style.opacity = "0";
  if(typeof Snd !== "undefined" && typeof Snd.setRain === "function") Snd.setRain(!!rainSites[siteId]);
  if(typeof vid.play === "function" && vid.paused){
    const p = vid.play();
    if(p && p.catch) p.catch(()=>{});
  }
}
function stopSiteAmbientVideo(vid, el){
  vid.style.display = "none";
  if(el) el.style.opacity = "";
  if(typeof Snd !== "undefined" && typeof Snd.setRain === "function") Snd.setRain(false);
  if(typeof vid.pause === "function" && !vid.paused){
    try { vid.pause(); } catch(e){}
  }
}
function syncCinematicBackdrop(){
  const el = $("cine-parallax-img");
  const vid = $("cine-parallax-video");
  if(!el) return;
  const siteId = R.siteId || (R.q && typeof Pilgrimage!=="undefined" && Pilgrimage.siteForBook ? (Pilgrimage.siteForBook(R.q.b)||{}).id : null) || "ur";
  const vig = (typeof Pilgrimage !== "undefined" && Pilgrimage.vignette) ? Pilgrimage.vignette(siteId) : null;
  const imgUrl = vig ? (vig.image || vig.fallback) : "";
  el.style.backgroundImage = imgUrl ? 'url("' + imgUrl + '")' : "none";
  const rainSites = {ur:true, haran:true};
  const mistSites = {shechem:true};
  const ambientVideo = rainSites[siteId] ? "assets/journey/ur.mp4"
    : mistSites[siteId] ? "assets/journey/patriarchs-mist.mp4"
    : "";
  const allowVideo = !!ambientVideo && (typeof currentView !== "undefined" && currentView === "play");
  if(!vid) return;
  if(allowVideo) playSiteAmbientVideo(vid, el, ambientVideo, rainSites, siteId);
  else stopSiteAmbientVideo(vid, el);
}

/* ------------------------- PATRIARCHS CHARACTER -------------------------
   Abraham is a visual companion to an active Patriarchs site question. The
   artwork stays separate from the shared cinematic backdrop so each site
   change independently, and so dense mechanics can ask CSS for a smaller
   treatment without touching their input logic. */
function syncAbrahamPresentation(mechanic){
  const el = $("question-abraham");
  if(!el) return;
  const site = R && R.siteId && typeof Pilgrimage !== "undefined" && Pilgrimage.site
    ? Pilgrimage.site(R.siteId) : null;
  const isPatriarchs = !!(site && site.arc === "patriarchs");
  const isRoad = R && (R.mode === "pilgrimage" || R.mode === "pilgrim-recall" || R.mode === "relay");
  const active = isPatriarchs && isRoad && currentView === "play";
  const kind = R && R.passage ? "passage"
    : R && R.recon ? "reconstruct"
    : mechanic || (R && R.typed ? "typed" : "choice");
  clearTimeout(el._reactionTimer);
  el.classList.remove("success", "failure");
  el.classList.toggle("on", active);
  document.body.classList.toggle("abraham-active", active);
  el.dataset.mechanic = kind;
  el.dataset.site = site ? site.id : "";
}

function reactAbraham(ok){
  const el = $("question-abraham");
  if(!el || !el.classList.contains("on")) return;
  clearTimeout(el._reactionTimer);
  el.classList.remove("success", "failure");
  void el.offsetWidth;
  el.classList.add(ok ? "success" : "failure");
  el._reactionTimer = setTimeout(function(){
    el.classList.remove("success", "failure");
  }, ok ? 760 : 520);
}

/* Timers owned by a special question must die with that question. */
var activeFadeTimer = null;
function clearQuestionMechanicTimers(){
  if(activeFadeTimer !== null){
    clearInterval(activeFadeTimer);
    activeFadeTimer = null;
  }
}

function clearOtherStages(){
  const duel = $("duel-stage"); if(duel) duel.style.display = "none";
  const cloze = $("cloze-stage"); if(cloze) cloze.style.display = "none";
  const tf = $("tf-stage"); if(tf) tf.style.display = "none";
  const asm = $("assembly"); if(asm) asm.className = "assembly";
  const opts = $("opts"); if(opts) { opts.style.display = ""; opts.style.opacity = ""; opts.style.pointerEvents = ""; }
  const blank = $("blank"); if(blank) blank.classList.remove("fade-dissolve");
  const oldFadeBar = $("fade-bar");
  if(oldFadeBar){
    if(typeof oldFadeBar.remove === "function") oldFadeBar.remove();
    else if(oldFadeBar.parentNode) oldFadeBar.parentNode.removeChild(oldFadeBar);
  }
  const oldFadeDone = $("fade-done");
  if(oldFadeDone){
    if(typeof oldFadeDone.remove === "function") oldFadeDone.remove();
    else if(oldFadeDone.parentNode) oldFadeDone.parentNode.removeChild(oldFadeDone);
  }
  clearQuestionMechanicTimers();
  if(typeof R !== "undefined"){
    R.cloze = null;
    R.duel = null;
    R.tf = null;
    R.fadeAssembly = null;
    R.fadePhase = null;
  }
}

function selectPilgrimageMechanic(idx, q){
  if(!q || R.typed) return null;
  if(idx === 2) return "passage-ref";
  if(idx === 3) return "cloze";
  if(idx === 4) return "duel";
  if(idx === 5) return "fade";
  /* Slot 6 is the gauntlet: a standalone Judgement claim replaces the
     verse question. The displaced verse is never answered, so its
     mastery is untouched and it returns in future runs. */
  if(idx === 6 && typeof TF_CLAIMS !== "undefined" && TF_CLAIMS.length) return "truefalse";
  return null;
}

function verseMechanicIndex(){
  if(R.mode === "relay" && R.relay && R.relay.current && typeof R.relay.current.verseIndex === "number")
    return R.relay.current.verseIndex;
  if(typeof R.siteIdx === "number" && R.siteIdx > 0) return R.siteIdx - 1;
  if(typeof R.verseIndex === "number") return R.verseIndex;
  return Math.max(0, (R.qInAct || 1) - 1);
}

function wallClockMs(){
  const q = R.q;
  const onFade = (q && q.mechanic === "fade") ||
    (R.currentMechanic === "fade" && !(R.typed && q && q.mechanic !== "fade"));
  if(onFade) return WALL_FADE_MS;
  if(R.mode === "tutorial"){
    if(q && q.typed) return WALL_TYPED_MS;
    return WALL_PICK_MS;
  }
  if(R.mode === "practice") return WALL_PICK_MS;
  if(R.mode === "recall" || R.mode === "pilgrim-recall") return WALL_TYPED_MS;
  if(R.typed || (q && q.typed)) return WALL_TYPED_MS;
  if(q && (R.mode === "pilgrimage" || R.mode === "relay")){
    if(selectPilgrimageMechanic(verseMechanicIndex(), q) === "fade") return WALL_FADE_MS;
  }
  return WALL_PICK_MS;
}

/* ================= 1. PASSAGE IDENTIFICATION =================
   The passage is selected from the active pilgrimage site's own verse draw;
   its three false citations favour that same location before falling back to
   the wider bank. This turns the old corrupted-word round into a meaningful
   location-aware reference recall without exposing the citation in the stem. */
function fullQuestionPassage(q){
  return [q.p, q.a, q.s].filter(Boolean).join(" ")
    .replace(/\s+([,.;:!?])/g, "$1").replace(/\s+/g, " ").trim();
}

function passageReferenceChoices(q){
  const choices = [q.r];
  const seen = new Set(choices);
  const addFrom = function(pool){
    if(!Array.isArray(pool)) return;
    shuffle(pool.slice()).forEach(function(v){
      if(choices.length >= 4 || !v || !v.r || v.id === q.id || seen.has(v.r)) return;
      seen.add(v.r);
      choices.push(v.r);
    });
  };
  addFrom(R.siteVerses);
  if(typeof VERSES !== "undefined"){
    addFrom(VERSES.filter(function(v){ return v && v.b === q.b; }));
    addFrom(VERSES);
  }
  /* The shipped location rosters always yield four unique citations. Keep a
     deterministic, readable fallback for a tiny custom bank instead of
     rendering fewer than four choices. */
  const fallback = ["Genesis 1:1", "Exodus 3:14", "Joshua 24:2", "Acts 7:2"];
  fallback.forEach(function(reference){
    if(choices.length < 4 && !seen.has(reference)){
      seen.add(reference);
      choices.push(reference);
    }
  });
  return shuffle(choices.slice());
}

function renderPassageReferenceQuestion(q, dur, scene){
  R.currentMechanic = "passage-ref";
  $("confirm-answer").style.display = "none";
  const how = $("warn-how");
  if(how) how.innerHTML = "Name the Passage<br>Select its book, chapter, and verse";
  const refEl = $("ref");
  if(refEl) refEl.textContent = "Passage identification · King James Version";

  const passage = fullQuestionPassage(q);
  $("verse").innerHTML = '<span class="passage-reference-text">' + highlightVerse(passage) + '</span>';
  fitVerseSize(passage.length);

  const opts = $("opts");
  opts.className = "answers passage-reference-options";
  opts.style.display = "";
  opts.innerHTML = "";
  passageReferenceChoices(q).forEach(function(reference, i){
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ans passage-reference-option";
    if(b.classList && b.classList.add) b.classList.add("ans", "passage-reference-option");
    /* resolveAnswer keeps the normal score, review, power, and feedback path. */
    b.dataset.val = reference === q.r ? q.a : "__passage-reference-" + i;
    b.dataset.reference = reference;
    b.setAttribute("aria-label", "Reference " + LETTERS[i] + ": " + reference);
    b.innerHTML = '<span class="ans-float"><span class="ltr">' + LETTERS[i] + '.</span><span class="ans-copy">' + esc(reference) + '</span></span>';
    b.addEventListener("click", function(){
      if(R.locked || !R.running || R.paused || R.q !== q) return;
      stopTimer();
      R.locked = true;
      const elapsed = performance.now() - R.qStart;
      const left = Math.max(0, R.tEnd - performance.now());
      Snd.lock();
      resolveAnswer(q, reference === q.r ? q.a : "", b, elapsed, left);
    });
    opts.appendChild(b);
  });
  renderPowers();
  armTimer(dur);
  startTimer(dur);
}



/* ================= 2. SCRIBE'S RAPID CLOZE (1-2-3 TAP) ================= */
function renderClozeQuestion(q, dur, scene){
  R.currentMechanic = "cloze";
  $("confirm-answer").style.display = "none";
  const how = $("warn-how");
  if(how) how.innerHTML = "1-2-3 Rapid Cloze<br>Tap missing words in sequence";

  const refEl = $("ref");
  if(refEl) refEl.textContent = (q.r ? q.r + " — " : "") + "KJV";

  $("verse").innerHTML = highlightVerse(q.p||"") + ' <span class="blank" id="blank">&#8195;&#8195;&#8195;</span>' + sep(q.s) + highlightVerse(q.s||"");
  fitVerseSize((q.p||"").length + (q.a||"").length + (q.s||"").length);

  const words = (q.a || "").trim().split(/\s+/).filter(Boolean);
  const clozeState = {q, words, filled:[], hintIndex:-1};
  R.cloze = clozeState;
  const filled = clozeState.filled;

  const clozeStage = $("cloze-stage");
  clozeStage.style.display = "flex";
  clozeStage.innerHTML = '<div class="cloze-slots" id="cloze-slots"></div><div class="cloze-bank" id="cloze-bank"></div>';
  $("opts").style.display = "none";

  function renderSlots(){
    const host = $("cloze-slots");
    if(!host) return;
    host.innerHTML = words.map((w, i) => {
      const isFilled = filled[i] !== undefined;
      const isActive = i === filled.length;
      return '<button type="button" class="cloze-slot' + (isFilled ? ' filled' : '') + (isActive ? ' active' : '') + '" data-slot="' + i + '" aria-label="Cloze word ' + (i + 1) + '">' +
        (isFilled ? esc(filled[i]) : '[ ' + (i + 1) + '. ___ ]') + '</button>';
    }).join("");

    const blankEl = $("blank");
    if(blankEl){
      if(filled.length){
        blankEl.textContent = filled.join(" ");
        blankEl.classList.add("filled");
      } else {
        blankEl.textContent = "\u2003\u2003\u2003";
        blankEl.classList.remove("filled");
      }
    }

    host.querySelectorAll(".cloze-slot.filled").forEach(sl => {
      sl.addEventListener("click", () => {
        const slotIdx = Number(sl.dataset.slot);
        filled.splice(slotIdx, 1);
        Snd.ui();
        renderSlots();
        renderBank();
      });
    });
  }

  const distractors = (q.d || []).join(" ").split(/\s+/).filter(Boolean);
  const bankPool = shuffle(words.concat(distractors.slice(0, Math.max(2, 6 - words.length))));

  function renderBank(){
    const host = $("cloze-bank");
    if(!host) return;
    host.innerHTML = bankPool.map((w, i) => {
      const countInFilled = filled.filter(x => x === w).length;
      const countInBank = bankPool.filter(x => x === w).length;
      const spent = countInFilled >= countInBank;
      const illuminated = !spent && clozeState.hintIndex === filled.length && w === words[clozeState.hintIndex];
      return '<button type="button" class="cloze-chip' + (spent ? ' spent' : '') + (illuminated ? ' illuminate-target' : '') + '" data-word="' + esc(w) + '">' + esc(w) + '</button>';
    }).join("");

    host.querySelectorAll(".cloze-chip:not(.spent)").forEach(chip => {
      chip.addEventListener("click", () => {
        if(filled.length < words.length){
          filled.push(chip.dataset.word);
          Snd.ui();
          renderSlots();
          renderBank();
          if(filled.length === words.length){
            const answerStr = filled.join(" ");
            answer(answerStr, null);
          }
        }
      });
    });
  }

  clozeState.render = function(){ renderSlots(); renderBank(); };
  renderSlots();
  renderBank();
  renderPowers();
  armTimer(dur);
  startTimer(dur);
}

function illuminateCloze(){
  const state = R.cloze;
  if(!state || state.hintIndex === state.filled.length && state.hintIndex >= state.words.length - 1 && state.filled.length >= state.words.length) return false;
  const next = state.filled.length;
  if(next >= state.words.length) return false;
  state.hintIndex = next;
  if(typeof state.render === "function") state.render();
  const word = state.words[next];
  if(typeof toast === "function") toast("Illuminate — next word: " + word);
  return true;
}

/* ================= 3. TRUE SCRIPTURE DUEL (LEFT VS RIGHT) ================= */
function renderDuelQuestion(q, dur, scene){
  R.currentMechanic = "duel";
  $("confirm-answer").style.display = "none";
  const how = $("warn-how");
  if(how) how.innerHTML = "True Scripture Duel<br>Select the genuine King James reading";

  const refEl = $("ref");
  if(refEl) refEl.textContent = (q.r ? q.r + " — " : "") + "KJV";

  $("verse").innerHTML = '<span class="duel-prompt-kicker">Discern the genuine King James reading</span>';
  fitVerseSize(42);

  const duelStage = $("duel-stage");
  duelStage.style.display = "grid";
  $("opts").style.display = "none";

  const trueVerse = (q.p ? q.p + " " : "") + (q.a || "") + (q.s ? " " + q.s : "");
  const fakePhrase = (q.d && q.d[0]) ? q.d[0] : "the shadow of the deep";
  const fakeVerse = (q.p ? q.p + " " : "") + fakePhrase + (q.s ? " " + q.s : "");

  const isLeftTrue = Math.random() < 0.5;
  R.duel = {q, correctVal:q.a, isLeftTrue, illuminated:false};
  const leftText = isLeftTrue ? trueVerse : fakeVerse;
  const rightText = isLeftTrue ? fakeVerse : trueVerse;

  duelStage.innerHTML = 
    '<div role="button" tabindex="0" class="duel-card" id="duel-left" data-val="' + esc(isLeftTrue ? q.a : fakePhrase) + '" aria-label="Reading Alpha">' +
      '<div class="duel-tag">Reading Alpha (← / A / 1)</div>' +
      '<span class="duel-verse-text">' + highlightVerse(leftText) + '</span>' +
    '</div>' +
    '<div role="button" tabindex="0" class="duel-card" id="duel-right" data-val="' + esc(!isLeftTrue ? q.a : fakePhrase) + '" aria-label="Reading Beta">' +
      '<div class="duel-tag">Reading Beta (→ / D / 2)</div>' +
      '<span class="duel-verse-text">' + highlightVerse(rightText) + '</span>' +
    '</div>';

  function handlePick(btn, chosenVal){
    if(R.locked || !R.running || R.paused) return;
    const ok = (chosenVal === q.a);
    btn.classList.add(ok ? "correct" : "wrong");
    answer(chosenVal, btn);
  }

  const leftCard = $("duel-left");
  const rightCard = $("duel-right");
  leftCard.addEventListener("click", () => handlePick(leftCard, leftCard.dataset.val));
  rightCard.addEventListener("click", () => handlePick(rightCard, rightCard.dataset.val));
  [leftCard, rightCard].forEach(card => card.addEventListener("keydown", e => {
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); card.click(); }
  }));

  renderPowers();
  armTimer(dur);
  startTimer(dur);
}

function illuminateDuel(){
  if(!R.duel || R.duel.illuminated) return false;
  const cards = $("duel-stage").querySelectorAll ? $("duel-stage").querySelectorAll(".duel-card") : [];
  let correct = null;
  Array.from(cards || []).forEach(card => {
    if(card.dataset && card.dataset.val === R.duel.correctVal) correct = card;
  });
  if(!correct) return false;
  R.duel.illuminated = true;
  correct.classList.add("illum-cue");
  const marker = document.createElement("div");
  marker.className = "duel-illumination";
  marker.textContent = "Illuminate · KJV cue";
  correct.insertAdjacentElement ? correct.insertAdjacentElement("afterbegin", marker) : correct.appendChild(marker);
  if(typeof toast === "function") toast("Illuminate — the genuine KJV reading is marked");
  return true;
}

/* ================= 5. THE JUDGEMENT (TRUE / FALSE CLAIM) ================= */
/* A Judgement claim is scripture knowledge, not verse recall: a plain
   statement about the Bible's people, places, numbers and events that
   the player must simply judge. It replaces slot 6's verse question,
   so it resolves through its own path — streaks, lives and score all
   react, but verse mastery, SRS and the review queue are
   never touched, because no verse was asked. */
function tfTierFromArc(arc){
  if(arc === "patriarchs" || arc === "exodus") return 1;
  if(arc === "kingdom" || arc === "exile") return 2;
  return 3;
}
function tfTargetTier(){
  if(R && R.targetTier && R.targetTier >= 1 && R.targetTier <= 3) return R.targetTier;
  if(typeof Pilgrimage !== "undefined" && typeof R.siteIndex === "number" && R.siteIndex >= 0){
    const pos = Pilgrimage.positionOf(R.siteIndex);
    return pos < 0.38 ? 1 : pos < 0.78 ? 2 : 3;
  }
  if(R.siteId && typeof Pilgrimage !== "undefined" && Pilgrimage.site){
    const s = Pilgrimage.site(R.siteId);
    if(s && s.arc) return tfTierFromArc(s.arc);
  }
  return null;
}
function tfPickFromPool(pool, books, wantFalse, targetTier){
  const ofVerdict = function(list, v){ return list.filter(function(c){ return c.v === v; }); };
  const ofTier = function(list, t){
    if(!t) return list;
    const match = list.filter(function(c){ return (c.t || 1) === t; });
    return match.length ? match : list;
  };
  let candidates = null;
  if(Math.random() < 0.75){
    const territory = pool.filter(function(c){ return books[c.b]; });
    const terrV = ofVerdict(territory, !wantFalse);
    candidates = ofTier(terrV, targetTier);
    if(!candidates.length) candidates = terrV;
    if(!candidates.length){
      const poolV = ofVerdict(pool, !wantFalse);
      candidates = ofTier(poolV, targetTier);
      if(!candidates.length) candidates = poolV;
    }
    if(!candidates.length) candidates = ofTier(territory, targetTier);
    if(!candidates.length) candidates = territory;
  }
  if(!candidates || !candidates.length){
    const poolV = ofVerdict(pool, !wantFalse);
    candidates = ofTier(poolV, targetTier);
    if(!candidates.length) candidates = poolV;
  }
  if(!candidates || !candidates.length) candidates = ofTier(pool, targetTier);
  if(!candidates || !candidates.length) candidates = pool;
  return candidates;
}
function tfPickClaim(){
  const bank = (typeof TF_CLAIMS !== "undefined" && TF_CLAIMS.length) ? TF_CLAIMS : [];
  if(!bank.length) return null;
  R.tfUsed = R.tfUsed || [];
  const window = Math.max(1, Math.min(40,
    bank.filter(function(c){ return !c.v; }).length - 8));
  let pool = bank.filter(function(c, i){ return R.tfUsed.indexOf(i) < 0; });
  if(!pool.length){ R.tfUsed = []; pool = bank.slice(); }
  const targetTier = tfTargetTier();
  const books = {};
  (R.siteVerses || []).forEach(function(v){ if(v && v.b) books[v.b] = 1; });
  const wantFalse = Math.random() < 0.65;
  const candidates = tfPickFromPool(pool, books, wantFalse, targetTier);
  const claim = candidates[Math.floor(Math.random() * candidates.length)];
  R.tfUsed.push(bank.indexOf(claim));
  while(R.tfUsed.length > window) R.tfUsed.shift();
  return claim;
}

function renderTrueFalseQuestion(q, dur, scene){
  const claim = tfPickClaim();
  if(!claim) return renderStandardChoices(q, dur, scene);
  R.currentMechanic = "truefalse";
  R.tf = {claim: claim, resolved: false, illuminated: false};
  $("confirm-answer").style.display = "none";
  const how = $("warn-how");
  if(how) how.innerHTML = "The Judgement<br>True or False — T / F keys";
  const refEl = $("ref");
  if(refEl) refEl.textContent = "Out of " + claim.b + " — KJV";

  $("verse").innerHTML = '<span class="tf-kicker">The Witness Speaks · Judge the Claim</span>';
  fitVerseSize(Math.max(42, claim.s.length));

  const stage = $("tf-stage");
  stage.style.display = "grid";
  $("opts").style.display = "none";
  stage.innerHTML =
    '<div class="tf-claim">' + esc(claim.s) + '</div>' +
    '<div class="tf-buttons" role="group" aria-label="Judge the claim true or false">' +
      '<button type="button" class="tf-btn tf-true" id="tf-true" data-val="true" aria-label="Mark the claim true">True<span>It is written</span></button>' +
      '<button type="button" class="tf-btn tf-false" id="tf-false" data-val="false" aria-label="Mark the claim false">False<span>It is not so</span></button>' +
    '</div>' +
    '<div class="tf-why" id="tf-why" hidden></div>';
  tfBind($("tf-true"));
  tfBind($("tf-false"));
  renderPowers();
  /* A binary answer guesses well, so the clock tightens to roughly 65%
     of the site's own beat — judgement by reflex, not deliberation. */
  armTimer(Math.round(dur * 0.65));
  startTimer(Math.round(dur * 0.65));
}

function tfBind(btn){
  if(!btn) return;
  btn.addEventListener("click", function(){
    if(!R.running || R.paused || R.locked) return;
    if(!R.tf || R.tf.resolved) return;
    stopTimer();
    R.locked = true;
    const confirm = $("confirm-answer");
    if(confirm){ confirm.disabled = true; confirm.textContent = "Answer Locked"; }
    Snd.lock(); Snd.hush();
    Director.beat("lock");
    const picked = btn;
    afterRun(430, function(){ resolveTrueFalse(picked.dataset.val, picked, false); });
  });
  btn.addEventListener("keydown", function(e){
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); btn.click(); }
  });
}

function tfMarkButtons(claim, btn, ok){
  const trueBtn = $("tf-true"), falseBtn = $("tf-false");
  const rightBtn = claim.v ? trueBtn : falseBtn;
  [trueBtn, falseBtn].forEach(function(b){ if(b) b.classList.add("mute"); });
  if(rightBtn){ rightBtn.classList.remove("mute"); rightBtn.classList.add("right"); }
  if(!ok && btn) btn.classList.add("bad");
}
function tfShowWhy(claim){
  const why = $("tf-why");
  if(!why) return;
  why.hidden = false;
  why.innerHTML = '<b>' + (claim.v ? "TRUE" : "FALSE") + '</b> — ' + esc(claim.why);
}
function resolveTrueFalseMiss(claim){
  reactAbraham(false);
  const wasRiding = R.overdriveRide && inOverdrive();
  if(R.streak >= 3 && typeof Cinematic !== "undefined"){
    if(Cinematic.event) Cinematic.event("miss");
    else Cinematic.showComboCollapse();
  }
  R.overdriveRide = false;
  document.body.classList.remove("ember-ride");
  spillOil(R.streak || 0);
  R.streak = 0; setMult();
  Director.momentum(false); Director.impact("wrong");
  Snd.wrong(); doFlash("red"); shakeUI(true);
  if(SAVE.set.haptics !== false && typeof Polish !== "undefined") Polish.haptic("wrong");
  witnessLook(true);
  tfShowWhy(claim);
  loseLife(wasRiding ? 2 : 1);
}
function maybeOfferOverdrive(){
  if(R.streak === MOMENTUM_STEPS[MOMENTUM_STEPS.length-1] && !R.setpiece && R.mode !== "blitz"){
    if(typeof Cinematic !== "undefined"){
      if(Cinematic.event) Cinematic.event("overdrive");
      else Cinematic.showOverdriveEntrance();
    }
    afterRun(700, offerOverdriveChoice);
    return true;
  }
  return false;
}
function resolveTrueFalse(choice, btn, timedOut){
  if(!R.tf || R.tf.resolved) return;
  R.tf.resolved = true;
  const claim = R.tf.claim;
  const elapsed = performance.now() - (R.qStart || performance.now());
  const left = Math.max(0, (R.tEnd || 0) - performance.now());
  R.attempts++;
  recordDecision(elapsed);
  const ok = !timedOut && choice === (claim.v ? "true" : "false");
  tfMarkButtons(claim, btn, ok);
  if(!ok){ resolveTrueFalseMiss(claim); return; }
  reactAbraham(true);
  R.correct++; R.streak++; R.best = Math.max(R.best, R.streak);
  if(elapsed < 1500) R.fast++;
  if(typeof updateQuickRewards === "function") updateQuickRewards();
  const riding = R.overdriveRide && inOverdrive();
  const timeBonus = Math.round(left / (R.tTotal || 1) * 140);
  const gained = Math.round((150 + timeBonus) * multiplier() * R.diff.score * 1.24 * SetPieces.bonus() * (riding ? 2 : 1));
  R.score += gained;
  payCorrect(null);
  noteGhostProgress(); Director.impact("correct"); Snd.correct(); animateScore(); setMult(true); Director.momentum(true);
  celebrateCorrectStreak();
  if(maybeOfferOverdrive()) return;
  afterRun(answerHoldMs(), queueAdvance);
}

function illuminateTrueFalse(){
  if(!R.tf || R.tf.illuminated || R.tf.resolved) return false;
  const btn = R.tf.claim.v ? $("tf-true") : $("tf-false");
  if(!btn) return false;
  R.tf.illuminated = true;
  btn.classList.add("illum-cue");
  if(typeof toast === "function") toast("Illuminate — the true judgement is marked");
  return true;
}

/* ================= 4. FADE-TO-MEMORY (DISSOLVING ECHO) ================= */
function renderFadeQuestion(q, dur, scene){
  R.currentMechanic = "fade";
  const how = $("warn-how");
  if(how) how.innerHTML = "Fade-to-Memory<br>Memorize the whole verse — reconstruction follows";

  const refEl = $("ref");
  if(refEl) refEl.textContent = (q.r ? q.r + " — " : "") + "KJV";

  R.fadePhase = "memorize";
  R.fadeAssembly = null;
  R.typed = false;
  $("confirm-answer").style.display = "none";

  /* Fade begins as a true memorization view: the complete verse is visible,
     including the answer. The answer span keeps the blank geometry so the
     later transition does not shift the surrounding line. */
  const fullText = highlightVerse(q.p||"") + ' <span class="blank filled fade-memory-answer" id="blank">' + esc(q.a||"") + '</span>' + sep(q.s) + highlightVerse(q.s||"");
  $("verse").innerHTML = fullText;
  fitVerseSize((q.p||"").length + (q.a||"").length + (q.s||"").length);

  $("opts").style.opacity = "0";
  $("opts").style.pointerEvents = "none";

  clearQuestionMechanicTimers();
  const runToken = R.runToken;
  const sceneToken = scene;
  let count = Math.ceil(FADE_MEMORY_MS / 1000);
  const countdownEl = document.createElement("div");
  countdownEl.className = "fade-countdown-bar";
  countdownEl.id = "fade-bar";
  countdownEl.textContent = "Memorize the whole verse: " + count + "s";
  const stageEl = $("verse-stage");
  if(stageEl){
    if(typeof stageEl.prepend === "function") stageEl.prepend(countdownEl);
    else if(typeof stageEl.insertBefore === "function") stageEl.insertBefore(countdownEl, stageEl.firstChild);
    else if(typeof stageEl.appendChild === "function") stageEl.appendChild(countdownEl);
  }

  let echoTimer = null;
  const isCurrent = () => R.runToken === runToken && R.sceneToken === sceneToken && R.q === q && currentView === "play";

  /* The dissolve→reconstruct handoff runs on BOTH the memory minute elapsing
     and the player tapping "I'm Done" early — one shared path, no dead code. */
  function beginDissolve(){
    if(R.fadePhase !== "memorize") return;
    if(echoTimer != null){ clearInterval(echoTimer); }
    if(activeFadeTimer === echoTimer) activeFadeTimer = null;
    echoTimer = null;
    R.fadePhase = "dissolve";
    stopTimer();
    if(typeof countdownEl.remove === "function") countdownEl.remove();
    else if(countdownEl.parentNode) countdownEl.parentNode.removeChild(countdownEl);
    const doneBtn = $("fade-done");
    if(doneBtn){
      if(typeof doneBtn.remove === "function") doneBtn.remove();
      else if(doneBtn.parentNode) doneBtn.parentNode.removeChild(doneBtn);
    }
    const blank = $("blank");
    if(blank){
      /* Keep the real answer in place while it visibly dissolves. Only
         after that animation completes do we replace the passage with the
         full reconstruction board. */
      blank.classList.remove("filled");
      blank.classList.add("fade-dissolve");
    }
    afterRun(1200, () => {
      if(!isCurrent()) return;
      R.fadePhase = "reconstruct";
      R.fadeAssembly = {target:fullVerseText(q), hintIndex:-1};
      R.typed = true;
      $("verse").innerHTML = '<span class="recon-prompt">Reconstruct the whole verse in order</span>';
      fitVerseSize(R.fadeAssembly.target.length);
      $("opts").style.opacity = "";
      $("opts").style.pointerEvents = "";
      renderTypedQuestion(q, Math.max(FADE_RECALL_MIN_MS, dur || 0), scene);
    });
  }

  echoTimer = setInterval(() => {
    if(!isCurrent()){
      if(activeFadeTimer === echoTimer){ clearInterval(echoTimer); activeFadeTimer = null; }
      return;
    }
    count--;
    if(count > 0){
      countdownEl.textContent = "Memorize the whole verse: " + count + "s";
    } else {
      beginDissolve();
    }
  }, 1000);
  activeFadeTimer = echoTimer;

  /* "I'm Done" — skip the memorization window and start rebuilding now.
     No scoring penalty: the Illuminate mastery grant rewards a correct
     reconstruction, not how long the player stared at the verse. */
  const doneBtn = document.createElement("button");
  doneBtn.type = "button";
  doneBtn.id = "fade-done";
  doneBtn.className = "fade-done";
  doneBtn.textContent = "I'm Done";
  doneBtn.setAttribute("aria-label", "I'm done memorizing — begin reconstruction now");
  doneBtn.addEventListener("click", function(){ Snd.ui(); beginDissolve(); });
  if(stageEl){
    if(typeof stageEl.prepend === "function") stageEl.prepend(doneBtn);
    else if(typeof stageEl.appendChild === "function") stageEl.appendChild(doneBtn);
  }

  armTimer(FADE_MEMORY_MS);
  startTimer(FADE_MEMORY_MS);
  renderPowers();
}

function renderStandardChoices(q, dur, scene){
  const confirmBtn = $("confirm-answer");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.textContent = SetPieces.autoLock() ? "Rapid Lock"
    : (R.speed ? "Swift Lock"
    : (SAVE.set.singleTap === false ? "Lock Answer" : "One-tap answer"));
  const opts = $("opts"); opts.className = "answers queued"; opts.innerHTML = "";
  const rnd = R.mode==="daily" ? R.daily.rnd : Math.random;
  const choices = buildChoices(q, rnd);
  choices.forEach((c,i)=>{
    if(i){ const ch=document.createElement("div"); ch.className="chev"; ch.innerHTML="&#8250;"; opts.appendChild(ch); }
    const b=document.createElement("button");
    b.className="ans"; b.dataset.val=c;
    b.setAttribute("aria-pressed","false");
    b.innerHTML='<span class="ans-float"><span class="ltr">'+LETTERS[i]+'.</span><span class="ans-copy">'+esc(c)+'</span></span>';
    b.style.setProperty("--drift-delay", (i * 0.85) + "s");
    b.addEventListener("click", ()=>pickAnswer(c,b));
    opts.appendChild(b);
  });
  if(!SetPieces.autoLock() && !document.body.classList.contains("reduced")) opts.classList.add("drift");
  const entranceDelay=R.setpiece?180:Math.min(1450,Math.max(520,dur*.12));
  afterRun(entranceDelay, ()=>{
    if(R.q!==q || R.sceneToken!==scene || currentView!=="play")return;
    opts.classList.remove("queued");opts.classList.add("entering");
    afterRun(760, ()=>{ if(R.q===q && R.sceneToken===scene) opts.classList.remove("entering"); });
    Snd.lock();
  });
}

function cueQuestionMusic(){
  if(!R || R.ended || R.quoteMusicHold) return;
  if(typeof currentView !== "undefined" && currentView !== "play") return;
  if(typeof Snd !== "undefined" && typeof Snd.ambience === "function") Snd.ambience("indigo");
}

function renderMechanicQuestion(mechanic, q, dur, scene){
  if(mechanic === "passage-ref") return renderPassageReferenceQuestion(q, dur, scene);
  if(mechanic === "cloze") return renderClozeQuestion(q, dur, scene);
  if(mechanic === "duel") return renderDuelQuestion(q, dur, scene);
  if(mechanic === "fade") return renderFadeQuestion(q, dur, scene);
  if(mechanic === "truefalse") return renderTrueFalseQuestion(q, dur, scene);
  return false;
}
function questionMechanicIndex(){
  if(typeof R.siteIdx === "number" && R.siteIdx > 0) return R.siteIdx - 1;
  if(R.mode === "relay" && R.relay && R.relay.current && typeof R.relay.current.verseIndex === "number"){
    return R.relay.current.verseIndex;
  }
  return typeof R.verseIndex === "number" ? R.verseIndex : (R.qInAct - 1);
}
function renderQuestion(q, dur){
  const scene = ++R.sceneToken;
  Director.pressure(0);
  cueQuestionMusic();
  syncCinematicBackdrop();
  clearOtherStages();
  $("ref").textContent = q.r + " — KJV";
  const mechanic = q.mechanic || R.mechanic || ((R.mode === "pilgrimage" || R.mode === "relay") ? selectPilgrimageMechanic(questionMechanicIndex(), q) : null);
  R.currentMechanic = mechanic;
  if(mechanic !== "fade"){
    R.fadePhase = null;
    R.fadeAssembly = null;
  }
  R.locked = false;
  R.selected = null;
  if(typeof renderQuickRewards === "function") renderQuickRewards();
  document.body.classList.toggle("mode-typed", !!R.typed);
  document.body.classList.toggle("speed-round", !!R.speed);
  syncAbrahamPresentation(mechanic || (R.typed ? "typed" : "choice"));
  if(renderMechanicQuestion(mechanic, q, dur, scene) !== false) return;
  $("verse").innerHTML = highlightVerse(q.p) +
    ' <span class="blank" id="blank">&#8195;&#8195;&#8195;</span>' + sep(q.s) + highlightVerse(q.s);
  fitVerseSize((q.p||"").length+(q.a||"").length+(q.s||"").length);
  const verseEl = $("verse");
  if(verseEl && !document.body.classList.contains("reduced")){
    verseEl.classList.remove("q-in"); void verseEl.offsetWidth; verseEl.classList.add("q-in");
  }
  if(R.typed) return renderTypedQuestion(q, dur, scene);
  const how=$("warn-how");
  if(how) how.innerHTML = (SAVE.set.singleTap === false)
    ? "Select a phrase, then lock it<br>Enter or Space confirms"
    : "Tap a phrase to answer";
  renderStandardChoices(q, dur, scene);
  renderPowers();
  armTimer(dur);
  startTimer(dur);
}

function pickAnswer(val, btn){
  if(!R.running || R.paused || R.locked) return;
  answerButtons().forEach(b=>{b.classList.remove("sel");b.setAttribute("aria-pressed","false");});
  btn.classList.remove("sel-punch"); void btn.offsetWidth;
  btn.classList.add("sel","sel-punch");
  const _punchBtn = btn;
  setTimeout(function(){ _punchBtn.classList.remove("sel-punch"); }, 240);
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

function paintBlitzTimer(now){
  const bLeft = R.blitzEnd - now;
  document.body.classList.remove("blitz-edge","blitz-edge-2","blitz-edge-3");
  const pr = typeof Polish!=="undefined" ? Polish.blitzPressure(bLeft) : 0;
  if(pr) document.body.classList.add(pr===3?"blitz-edge-3":pr===2?"blitz-edge-2":"blitz-edge");
  if(bLeft<=0){ timeUp(); return true; }
  R.tEnd = R.blitzEnd;
  return false;
}
function tickCountdownSfx(sec, left){
  if(!(left>0 && R.mode!=="blitz")) return;
  if(sec===4 || sec===5) Snd.tick(true);
  else if(sec>=6 && sec<=10) Snd.tick(false);
}
function tickTimer(now){
  if(!R.running || R.paused) return;
  if(R.mode==="blitz" && R.blitzEnd && paintBlitzTimer(now)) return;
  const left = Math.max(0, R.tEnd - now);
  const frac = R.tTotal>0 ? Math.max(0, Math.min(1, left / R.tTotal)) : 0;
  $("ring-arc").style.strokeDashoffset = String(RING_C * (1 - frac));
  const sec = Math.ceil(left/1000);
  if(sec !== R.lastTickSec){
    R.lastTickSec = sec;
    $("clock").textContent = "00:" + String(sec).padStart(2,"0");
    $("ring").classList.toggle("crit", sec<=5);
    const w1 = $("warn-1");
    w1.textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
    w1.classList.toggle("hot", sec<=5);
    Director.pressure(sec);
    tickCountdownSfx(sec, left);
  }
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

function gradeQuestionChoice(q, choice, btn){
  if(R.typed){
    const target = (typeof assemblyTargetFor === "function") ? assemblyTargetFor(q) : q.a;
    const graded = Recall.grade(choice, target, q.d);
    if(graded.verdict === "exact") R.typedExact++;
    if(graded.verdict === "close") R.typedClose++;
    SAVE.life.typedAttempts++;
    if(graded.verdict === "exact") SAVE.life.typedExact++;
    renderTypedVerdict(graded);
    return { ok: Recall.isCorrect(graded.verdict), graded: graded };
  }
  const choiceNorm = (typeof choice === "string") ? choice.trim().replace(/\s+/g, ' ').toLowerCase() : "";
  const targetNorm = (typeof q.a === "string") ? q.a.trim().replace(/\s+/g, ' ').toLowerCase() : "";
  const ok = (choice === q.a) || (choiceNorm !== "" && choiceNorm === targetNorm);
  answerButtons().forEach(b=>{
    b.classList.remove("sel");
    if(b.dataset.val===q.a) b.classList.add("right");
    else if(b===btn) b.classList.add("bad");
    else b.classList.add("mute");
  });
  return { ok: ok, graded: null };
}

function awardFadeIlluminate(){
  if(!(R.currentMechanic === "fade" && R.powers)) return;
  R.powers.illum = (R.powers.illum||0) + 1;
  SAVE.life.illumRewards = (SAVE.life.illumRewards||0) + 1;
  Director.callout("Memorization mastered — Illuminate earned");
  Snd.power(); doFlash("violet"); renderPowers();
}
function resolveCorrectAnswer(q, graded, elapsed, left){
  reactAbraham(true);
  const blank=$("blank");
  if(blank){ blank.textContent=q.a; blank.classList.add("filled","reveal"); }
  R.correct++; R.streak++; R.best=Math.max(R.best,R.streak);
  R.booksRun.add(q.b);
  if(elapsed < 1500) R.fast++;
  if(typeof updateQuickRewards === "function") updateQuickRewards();
  awardFadeIlluminate();
  const riding = R.overdriveRide && inOverdrive();
  const timeBonus = Math.round(left / R.tTotal * 140);
  const tierW = 1 + q.t*0.12;
  const mechW = (R.mode === "daily" && typeof Polish !== "undefined" && Polish.dailyMechanicWeight)
    ? Polish.dailyMechanicWeight(R.currentMechanic || (R.typed ? "typed" : "none"))
    : 1;
  const gained = Math.round((150 + timeBonus) * multiplier() * R.diff.score * tierW * mechW * SetPieces.bonus() * (riding ? 2 : 1));
  R.score += gained;
  payCorrect(graded);
  fireStreakIgnition();
  if(R.mode==="blitz" && typeof Polish!=="undefined"){
    const leftB = Math.max(0, (R.blitzEnd||0) - performance.now());
    R.blitzEnd = performance.now() + Polish.blitzAdjustMs(leftB, true);
  }
  noteGhostProgress(); Director.impact("correct"); Snd.correct(); animateScore(); setMult(true);Director.momentum(true);
  celebrateCorrectStreak();
  if(maybeOfferOverdrive()) return;
  afterRun(answerHoldMs(), queueAdvance);
}

function fireStreakIgnition(){
  if(!(typeof Polish !== "undefined" && Polish.streakIgniteAt && Polish.streakIgniteAt(R.streak))) return;
  if(!R.igniteAnnounced){
    R.igniteAnnounced = true;
    toast("IGNITION — the chain burns ×" + R.streak);
  }
  const rail = document.querySelector(".rail.r") || $("mult");
  if(rail){
    rail.classList.remove("streak-ignite"); void rail.offsetWidth;
    rail.classList.add("streak-ignite");
    const tok = R.sceneToken;
    afterRun(950, function(){ if(R.sceneToken === tok) rail.classList.remove("streak-ignite"); });
  }
  Snd.ignite();
}

function celebrateCorrectStreak(){
  if(typeof Cinematic !== "undefined" && (R.streak === 3 || R.streak === 5 || R.streak === 8 || R.streak === 12)){
    if(Cinematic.event) Cinematic.event("streak", {streak:R.streak, mult:multiplier()});
    else Cinematic.showComboStamp(R.streak, multiplier());
  }
  if(R.streak===5)Director.callout("Unbroken ×5");
  if(R.streak===10)Director.callout("Perfect Recall");
  if(R.streak>=10 && !hasSeal("recall")) grantSeal("recall");
  if(R.streak>=20 && !hasSeal("flame")) grantSeal("flame");
  if(R.fast>=10 && !hasSeal("swift")) grantSeal("swift");
}

function resolveWrongAnswer(q, choice){
  const wasRiding = R.overdriveRide && inOverdrive();
  if(R.streak >= 3 && typeof Cinematic !== "undefined"){
    if(Cinematic.event) Cinematic.event("miss");
    else Cinematic.showComboCollapse();
  }
  R.overdriveRide=false;
  document.body.classList.remove("ember-ride");
  spillOil(R.streak||0);
  reactAbraham(false);
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
    afterRun(answerHoldMs(), ()=>{
      if(R.blitzEnd && performance.now()>=R.blitzEnd) presentRunEnd("timeout-death");
      else queueAdvance();
    });
  } else {
    loseLife(wasRiding ? 2 : 1);
  }
}

function resolveAnswer(q,choice,btn,elapsed,left){
  if(R.q!==q)return;
  if(R.mode==="tutorial"){
    resolveTutorialAnswer(q, choice, btn);
    return;
  }
  R.attempts++;
  recordDecision(elapsed);
  const gradedChoice = gradeQuestionChoice(q, choice, btn);
  const ok = gradedChoice.ok;
  const graded = gradedChoice.graded;
  recordVerse(q, ok);
  scheduleReview(q, {
    correct: ok,
    near: graded ? (graded.verdict === "close" || graded.verdict === "modernised") : false,
    fraction: R.tTotal ? Math.min(1, elapsed / R.tTotal) : 0.5,
    usedPower: !!R.qUsedPower,
    cueLevel: R.hintLevel || 0,
    mode: R.typed ? "assembly" : "choice"
  });
  if(ok) resolveCorrectAnswer(q, graded, elapsed, left);
  else resolveWrongAnswer(q, choice);
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
  } else if(R.mode==="trial"){
    /* Trial progress must use the whole-campaign question count. qInAct
       resets at every act boundary, which would make the recorded ghost
       timeline sawtooth back to zero mid-run. */
    const total = (typeof trialActs === "function" ? trialActs() : [])
      .reduce(function(n, a){ return n + (a.q === Infinity ? 8 : a.q); }, 0) || 1;
    p = Math.min(1, (R.qTotal||0) / total);
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
  /* A timed-out Judgement is a failed claim, not a missed verse — the
     slot 6 verse was never asked and must not enter the review queue. */
  if(R.currentMechanic === "truefalse" && R.tf){
    stopTimer();
    resolveTrueFalse(null, null, true);
    return;
  }
  /* The 60-second Fade memorization window ends in reconstruction; it is
     not a failed answer and must not consume a lamp. */
  if(R.currentMechanic === "fade" && R.fadePhase === "memorize"){
    stopTimer();
    R.fadePhase = "dissolve";
    const fadeBlank = $("blank");
    if(fadeBlank) fadeBlank.classList.add("fade-dissolve");
    afterRun(1200, () => {
      if(R.currentMechanic !== "fade" || R.fadePhase !== "dissolve" || !R.q) return;
      R.fadePhase = "reconstruct";
      R.fadeAssembly = {target:fullVerseText(R.q), hintIndex:-1};
      R.typed = true;
      $("verse").innerHTML = '<span class="recon-prompt">Reconstruct the whole verse in order</span>';
      fitVerseSize(R.fadeAssembly.target.length);
      $("opts").style.opacity = "";
      $("opts").style.pointerEvents = "";
      renderTypedQuestion(R.q, Math.max(FADE_RECALL_MIN_MS, R.tTotal || 0), R.sceneToken);
    });
    return;
  }
  if(R.mode==="tutorial"){
    stopTimer();
    R.locked=true;
    $("confirm-answer").disabled=true;
    $("confirm-answer").textContent="Lesson continues";
    resolveTutorialAnswer(R.q, "", null);
    return;
  }
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
  scheduleReview(q, {
    correct:false, timedOut:true, usedPower:!!R.qUsedPower,
    cueLevel:R.hintLevel||0, mode:R.typed ? "assembly" : "choice"
  });
  R.missed.push(q);
  reactAbraham(false);
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
    afterRun(answerHoldMs(), queueAdvance);
    return;
  }
  R.lives = Math.max(0, R.lives - count);
  /* ===== Beat: LAMP LOSS TREMOR =====
     The stage micro-trembles while the lost lamp gutters out — loss must
     feel like loss. Scene-token-guarded so it dies with the question. */
  const stage = document.querySelector(".stage");
  if(stage && !SAVE.set.reduced){
    stage.classList.remove("stage-tremor"); void stage.offsetWidth;
    stage.classList.add("stage-tremor");
    const tok = R.sceneToken;
    afterRun(340, function(){ if(R.sceneToken === tok) stage.classList.remove("stage-tremor"); });
  }
  Snd.lampThud(); Snd.lampCrackle();
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
    afterRun(answerHoldMs(), ()=>presentRunEnd("fallen")); return;
  }
  afterRun(answerHoldMs(), queueAdvance);
}
