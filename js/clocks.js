/* ==================================================================
   CLOCKS — stage clocks, live question timer, and countdown cadence.

   Owns timer loop, clock rendering, pause/resume time calculations,
   and tick sound triggers.
   Must not own answer resolution, scoring, or life loss.
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
  const pace = (typeof PACE !== "undefined") ? PACE : ((typeof Polish !== "undefined" && Polish.PACE) || 1.2);
  const flat = (typeof FLAT_ADD_MS !== "undefined") ? FLAT_ADD_MS : ((typeof Polish !== "undefined" && Polish.FLAT_ADD_MS) || 2000);
  return Math.round(momentumClockMs(pickClockMs(ms)) * pace + flat);
}

function pacedClockMs(base, diffTime, pad){
  if(typeof Polish !== "undefined" && Polish.pacedClockMs) return Polish.pacedClockMs(base, diffTime, pad);
  const pace = (typeof PACE !== "undefined") ? PACE : ((typeof Polish !== "undefined" && Polish.PACE) || 1.2);
  const flat = (typeof FLAT_ADD_MS !== "undefined") ? FLAT_ADD_MS : ((typeof Polish !== "undefined" && Polish.FLAT_ADD_MS) || 2000);
  return Math.round((base * (diffTime == null ? 1 : diffTime) + (pad == null ? 1500 : pad)) * pace + flat);
}

const WALL_PICK_MS = 30000;
const WALL_TYPED_MS = 45000;
const WALL_FADE_MS = 60000;

function usesWallClock(){
  if(typeof R === "undefined" || !R) return false;
  return R.mode==="pilgrimage" || R.mode==="pilgrim-recall" || R.mode==="relay"
    || R.mode==="daily" || R.mode==="practice" || R.mode==="recall" || R.mode==="team" || R.mode==="tutorial";
}

function answerHoldMs(){
  /* The universal post-answer hold (Flow.JUDGE_MS) in EVERY mode. The
     wrong-answer teach pause is where the verdict and word diff get
     read; it must never collapse to 0. Correct answers chain faster via
     correctAdvance(), which is a separate path. */
  return (typeof Flow !== "undefined" && Flow.JUDGE_MS) || 2500;
}

/* ------------------------- TIMER ------------------------- */
function paintClockBar(frac){
  const fill = $("ring-arc");
  if(!fill) return;
  fill.style.transform = "scaleX(" + Math.max(0, Math.min(1, frac)) + ")";
}

function armTimer(dur){
  if(typeof R !== "undefined" && R){
    R.tTotal = dur; R.tEnd = 0; R.qStart = 0;
    R.running = false; R.paused = false; R.lastTickSec = -1; R.lastHeart = 0; R.lastHeartSec = -1;
  }
  if(typeof Snd!=="undefined" && Snd.stopPressure) Snd.stopPressure();
  const sec = Math.ceil(dur/1000);
  const clockEl = $("clock");
  if(clockEl) clockEl.textContent = "00:" + String(sec).padStart(2,"0");
  const warnEl = $("warn-1");
  if(warnEl) warnEl.textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
  const ringEl = $("ring");
  if(ringEl) ringEl.classList.remove("crit");
  paintClockBar(1);
}

function startTimer(dur){
  if(typeof R === "undefined" || !R) return;
  const extra = R.pendingSelah||0;
  R.pendingSelah = 0;
  R.tTotal = dur + extra; R.tEnd = performance.now()+dur+extra; R.qStart = performance.now();
  R.running = true; R.paused = false; R.lastTickSec = -1; R.lastHeart = 0; R.lastHeartSec = -1;
  if(typeof document !== "undefined" && document.hidden){
    if(typeof pauseStamp !== "undefined") pauseStamp = performance.now();
    if(typeof setPaused === "function") setPaused(true);
  }
  else if(typeof ensureLoop === "function") ensureLoop();
}

function paintBlitzTimer(now){
  if(typeof R === "undefined" || !R) return false;
  const bLeft = R.blitzEnd - now;
  if(typeof document !== "undefined" && document.body){
    document.body.classList.remove("blitz-edge","blitz-edge-2","blitz-edge-3");
    const pr = typeof Polish!=="undefined" ? Polish.blitzPressure(bLeft) : 0;
    if(pr) document.body.classList.add(pr===3?"blitz-edge-3":pr===2?"blitz-edge-2":"blitz-edge");
  }
  if(bLeft<=0){ if(typeof timeUp === "function") timeUp(); return true; }
  R.tEnd = R.blitzEnd;
  return false;
}

function tickCountdownSfx(sec, left){
  if(typeof R === "undefined" || !R || !(left>0 && R.mode!=="blitz")) return;
  if(typeof Snd === "undefined") return;
  if(sec===4 || sec===5) Snd.tick(true);
  else if(sec>=6 && sec<=10) Snd.tick(false);
}

function tickHeartbeat(sec, left, now){
  if(typeof R === "undefined" || !R || !R.running || R.locked || R.paused || R.mode==="blitz") return;
  if(sec>=1 && sec<=3 && left>0 && sec!==R.lastHeartSec){
    R.lastHeartSec = sec;
    R.lastHeart = now;
    if(typeof Snd!=="undefined" && Snd.heart) Snd.heart();
    if(typeof doFlash === "function") doFlash("heart");
  }
}

function tickTimer(now){
  if(typeof R === "undefined" || !R || !R.running || R.paused) return;
  if(R.mode==="blitz" && R.blitzEnd && paintBlitzTimer(now)) return;
  const left = Math.max(0, R.tEnd - now);
  const frac = R.tTotal>0 ? Math.max(0, Math.min(1, left / R.tTotal)) : 0;
  paintClockBar(frac);
  const sec = Math.ceil(left/1000);
  if(sec !== R.lastTickSec){
    R.lastTickSec = sec;
    const clockEl = $("clock");
    if(clockEl) clockEl.textContent = "00:" + String(sec).padStart(2,"0");
    const ringEl = $("ring");
    if(ringEl) ringEl.classList.toggle("crit", sec<=5);
    const w1 = $("warn-1");
    if(w1){
      w1.textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
      w1.classList.toggle("hot", sec<=5);
    }
    if(typeof Director!=="undefined" && Director.pressure) Director.pressure(sec);
    tickCountdownSfx(sec, left);
  }
  tickHeartbeat(sec, left, now);
  if(left<=0 && typeof timeUp === "function") timeUp();
}

function stopTimer(){
  if(typeof R !== "undefined" && R) R.running=false;
  if(typeof Snd!=="undefined" && Snd.stopPressure) Snd.stopPressure();
  if(typeof Director!=="undefined" && Director.pressure) Director.pressure(0);
}

if (typeof window !== "undefined") {
  window.paintClockBar = paintClockBar;
  window.armTimer = armTimer;
  window.startTimer = startTimer;
  window.tickTimer = tickTimer;
  window.stopTimer = stopTimer;
  window.pacedClockMs = pacedClockMs;
  window.usesWallClock = usesWallClock;
  window.answerHoldMs = answerHoldMs;
  window.pickClockMs = pickClockMs;
  window.playClockMs = playClockMs;
  window.WALL_PICK_MS = WALL_PICK_MS;
  window.WALL_TYPED_MS = WALL_TYPED_MS;
  window.WALL_FADE_MS = WALL_FADE_MS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    paintClockBar, armTimer, startTimer, tickTimer, stopTimer,
    paintBlitzTimer, tickCountdownSfx, tickHeartbeat,
    pacedClockMs, usesWallClock, answerHoldMs, pickClockMs, playClockMs,
    WALL_PICK_MS, WALL_TYPED_MS, WALL_FADE_MS
  };
}
