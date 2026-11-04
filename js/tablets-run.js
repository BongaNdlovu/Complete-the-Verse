function tabletsReduced(){
  return !!(document.body && (document.body.classList.contains("reduced") || document.body.classList.contains("motion-calm")));
}
function tabletsUntimed(){
  /* S1: only reduced motion stops the sand; the tutorial runs at the slowest speed. */
  return tabletsReduced();
}
/* S1: the tutorial and reduced motion stay calm: no danger red, no combo blaze, no seal smoke. */
function tabletsQuiet(){
  return tabletsUntimed() || !!(typeof R !== "undefined" && R && R.tabletTutorial);
}
function stopTabletsLoop(){
  if(typeof R === "undefined" || !R) return;
  if(R.tabletRaf){
    try{ cancelAnimationFrame(R.tabletRaf); }catch(e){}
    R.tabletRaf = 0;
  }
  R.tabletRacing = false;
}
function tabletsChapter(){
  const id = (R && R.tabletChapter) || "psalm23";
  return Tablets.chapter(id);
}
function tabletsPct(){
  const total = R.tabletTotal || 1;
  return Math.round(((R.tabletIdx || 0) / total) * 100);
}
/* P7: the run sets its own pace (the user's call, 2026-11-04). The first two-thirds of a chapter run at 1.25x and
   the last third quickens to 1.5x (the rules' "fast" tier). Gentle, off by default and chosen in the library, keeps
   0.75x (the rules' "slow" tier) all the way. The tutorial and the missed-lines review keep the slowest tier. */
const TABLET_PACE_STEADY = { id:"steady", label:"1.25×", base:5.5, mult:1.15 };
const TABLET_QUICKEN_AT = 2 / 3;
function tabletsGentle(){
  return !!(typeof SAVE !== "undefined" && SAVE.set && SAVE.set.tabletGentle);
}
/* The step where the last third starts: 11 blanks quicken at the 9th (index 8). */
function tabletsQuickenIdx(total){
  return Math.ceil((total || 1) * TABLET_QUICKEN_AT);
}
function tabletsQuickened(){
  if(typeof R === "undefined" || !R || R.tabletTutorial || R.tabletReviewing || tabletsGentle()) return false;
  return (R.tabletIdx || 0) >= tabletsQuickenIdx(R.tabletTotal || ((R.tabletSteps || []).length));
}
function tabletsSpeed(){
  const live = typeof R !== "undefined" && R;
  if(live && (R.tabletTutorial || R.tabletReviewing)) return Tablets.rules.speed("meditative");
  if(tabletsGentle()) return Tablets.rules.speed("slow");
  return tabletsQuickened() ? Tablets.rules.speed("fast") : TABLET_PACE_STEADY;
}
function tabletsClockMax(){
  return tabletsSpeed().base;
}
/* The library line: what the next run's sand will be. */
function tabletsPaceSummary(){
  if(tabletsGentle()) return "Gentle " + Tablets.rules.speed("slow").label + " · " + Tablets.rules.speed("slow").base + "s";
  return TABLET_PACE_STEADY.label + " → " + Tablets.rules.speed("fast").label + " · " + TABLET_PACE_STEADY.base + "s to " + Tablets.rules.speed("fast").base + "s";
}
/* O2: the tier names stay as the streak label; the multiplier beside them is
   the carve's combo, because that is what the Favor is really multiplied by. */
function tabletsTier(streak){
  const n = streak || 0;
  /* FX10: the HUD shows the multiplier the next carve pays: the combo one streak on. */
  const mult = Tablets.rules.comboOf(n + 1);
  if(n >= 8) return { name:"DIVINE PRESENCE", mult:mult };
  if(n >= 5) return { name:"EXALTED", mult:mult };
  if(n >= 3) return { name:"ANOINTED", mult:mult };
  if(n >= 1) return { name:"SANCTIFIED", mult:mult };
  return { name:"DEVOTED", mult:mult };
}
function paintTabletsClock(){
  const fill = $("tablets-clock-fill");
  const lab = $("tablets-clock-lab");
  const max = R.tabletClockMax || tabletsClockMax() || 1;
  const left = tabletsUntimed() ? 1 : (R.tabletClock || 0) / max;
  if(fill){
    fill.style.width = (Math.min(100, Math.max(0, left) * 100)) + "%";
    fill.classList.toggle("banked", left > 1 && !tabletsUntimed());
    fill.classList.toggle("urgent", tabletsDangerLevel() > 0);
  }
  if(lab){
    if(tabletsUntimed()) lab.textContent = "Untimed Hold";
    else lab.textContent = (Math.max(0, R.tabletClock || 0)).toFixed(1) + "s";
  }
  tabletsPaintRise();
  const slotEl = $("tablets-slot");
  if(slotEl) slotEl.classList.toggle("urgent", tabletsDangerLevel() > 0.5);
  const stageEl = $("tablets-stage");
  if(stageEl){
    stageEl.classList.toggle("danger", tabletsDangerLevel() > 0);
    stageEl.classList.toggle("gold", !!R.tabletGlory);
    stageEl.classList.toggle("frozen", !!R.freezeOn);
    stageEl.classList.toggle("selah", (R.selahLeft || 0) > 0);
  }
}
/* V1: the verse card rises as the sand runs; reduced motion pins it at The Mark. */
function tabletsRiseOf(){
  if(tabletsUntimed()) return 1;
  return Tablets.rules.progressOf(R.tabletClock, R.tabletClockMax || tabletsClockMax() || 1);
}
/* C: the room reddens as the active blank nears The Mark — 0 on fresh sand,
   1 at the mark; the tutorial and reduced motion never redden. */
function tabletsDangerLevel(){
  if(tabletsQuiet()) return 0;
  const rise = tabletsRiseOf();
  return Math.max(0, Math.min(1, (rise - 0.7) / 0.3));
}
function drawTabletsDanger(ctx, w, h){
  const danger = tabletsDangerLevel();
  if(danger <= 0 || typeof ctx.createRadialGradient !== "function") return;
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, "rgba(160,20,8,0)");
  g.addColorStop(1, "rgba(160,20,8," + (danger * 0.36).toFixed(3) + ")");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
/* F1: while the sand is frozen the embers cool and dim. */
function tabletsEmberAlpha(frozen){
  return frozen ? 0.35 : 0.65;
}
/* R2: the rolling chapter sheet fills the field. The active line sits on The Threshold (74% of the field) on fresh
   sand and on The Mark (45%) when the sand is gone; each frame eases 16% of the way to that spot. */
const TABLET_ROLL_ENTRY = 0.74;
const TABLET_ROLL_MARK = 0.45;
const TABLET_ROLL_EASE = 0.16;
function tabletsRollTarget(windowH, lineMid, rise){
  return windowH * (TABLET_ROLL_ENTRY - (TABLET_ROLL_ENTRY - TABLET_ROLL_MARK) * rise) - lineMid;
}
/* R2: the ease is 16% per 60 Hz frame whatever the frame rate: a frame of `frames` sixtieths closes 1 - 0.84^frames. */
function tabletsRollEase(current, target, snap, frames){
  if(snap) return target;
  const n = frames > 0 ? frames : 1;
  return current + (target - current) * (1 - Math.pow(1 - TABLET_ROLL_EASE, n));
}
function tabletsPaintRise(){
  /* FX14: --tablets-rise had no consumer and was rewritten every frame; the roll reads the rise directly. */
  tabletsRollFrame();
}
/* FX15: the roll follows the line being carved (the active gap's own line); R2: its middle rides the marks. */
function tabletsActiveLineTop(verse){
  const line = verse.children ? verse.children[R.gapIdx || 0] : null;
  return (verse.offsetTop || 0) + ((line && line.offsetTop) || 0) + ((line && line.offsetHeight) || 0) / 2;
}
/* R1: reduced motion and a freshly painted step jump; otherwise the sheet eases toward its target. */
function tabletsRollFrame(){
  const win = $("tablets-roll"), sheet = $("tablets-sheet"), verse = $("tablets-verse");
  if(!win || !sheet || !verse) return;
  const snap = !!R.tabletRollSnap || tabletsUntimed();
  const target = tabletsRollTarget(win.clientHeight || 0, tabletsActiveLineTop(verse), tabletsRiseOf());
  R.tabletRollY = tabletsRollEase(R.tabletRollY || 0, target, snap, (R.tabletFrameDt || 0) * 60);
  R.tabletRollSnap = false;
  if(sheet.style) sheet.style.transform = "translateY(" + R.tabletRollY.toFixed(1) + "px)";
}
/* L2: where the Favor pops. Right of the slot when the card has 190 px to spare; otherwise below the slot. */
function tabletsPopupAnchor(msRect, slotRect){
  const room = msRect.right - slotRect.right;
  if(room >= 190) return { x: slotRect.right - msRect.left + 16, y: (slotRect.top + slotRect.bottom) / 2 - msRect.top, side: "right" };
  return { x: (slotRect.left + slotRect.right) / 2 - msRect.left, y: slotRect.bottom - msRect.top + 18, side: "below" };
}
function spawnTabletsScorePopup(text, slotEl){
  const ms = $("tablets-ms");
  if(!ms) return;
  const popup = document.createElement("div");
  popup.className = "tablets-score-popup";
  popup.textContent = text;
  if(slotEl && slotEl.getBoundingClientRect){
    /* L2: the Favor pops beside the slot, or below it when the card has no room to its right. */
    const anchor = tabletsPopupAnchor(ms.getBoundingClientRect(), slotEl.getBoundingClientRect());
    popup.style.left = anchor.x + "px";
    popup.style.top = anchor.y + "px";
    popup.dataset.side = anchor.side;
    /* L2: with no room beside the slot the Favor joins the feedback lane, clear of the verse. */
    if(anchor.side === "below" && $("tablets-lane") && typeof ms.getBoundingClientRect().right === "number") popup.dataset.lane = "1";
  } else {
    popup.style.left = "50%";
    popup.style.top = "40%";
  }
  (popup.dataset.lane ? $("tablets-lane") : ms).appendChild(popup);
  setTimeout(function(){ try{ popup.remove(); }catch(e){} }, 900);
}
/* E: how long the world holds its breath — top grades and milestones longest. */
function tabletsHitstopMs(carve){
  if(carve.milestone) return 85;
  return (carve.grade === "divine" || carve.grade === "clutch") ? 55 : 30;
}
/* E: the carve speaks through the hand — per grade, louder at milestones. */
function tabletsCarveHaptic(carve){
  if(typeof navigator === "undefined" || !navigator.vibrate || !SAVE.set.haptics || R.tabletTutorial || tabletsReduced()) return;
  navigator.vibrate(carve.milestone ? [35, 30, 55, 30, 90] : (carve.grade === "divine" || carve.grade === "clutch") ? [24, 22, 42] : 22);
}
/* E: a miss cracks through the hand — the long pattern when the last lamp dies. */
function tabletsMissHaptic(){
  if(typeof navigator === "undefined" || !navigator.vibrate || !SAVE.set.haptics || R.tabletTutorial || tabletsReduced()) return;
  navigator.vibrate(R.tabletLampOut ? [90, 45, 120, 45, 180] : [65, 35, 95]);
}
/* E: the HUD numerals kick on a change; asleep under reduced motion. */
function tabletsKick(id){
  const el = $(id);
  if(!el || tabletsReduced()) return;
  el.classList.remove("kick");
  if(el.offsetWidth !== undefined) void el.offsetWidth;
  el.classList.add("kick");
  setTimeout(function(){ el.classList.remove("kick"); }, 360);
}
/* E: the milestone banner — Tithe / Double portion / Jubilee, in the game's words. */
function tabletsMilestoneBanner(streak, favor){
  const banner = $("tablets-milestone");
  if(!banner || tabletsReduced()) return;
  const nameEl = $("tablets-milestone-name");
  const favorEl = $("tablets-milestone-favor");
  if(nameEl) nameEl.textContent = tabletsMilestoneName(streak);
  if(favorEl) favorEl.textContent = "+" + favor + " FAVOR";
  banner.classList.remove("active");
  if(banner.offsetWidth !== undefined) void banner.offsetWidth;
  banner.classList.add("active");
  clearTimeout(R.tabletMilestoneTimer);
  R.tabletMilestoneTimer = setTimeout(function(){ banner.classList.remove("active"); }, 2400);
}
/* E: a one-shot wash over the stage — gold for milestones, red for misses. */
function tabletsFlash(kind, strong){
  const flashEl = $("tablets-flash");
  if(!flashEl || tabletsReduced()) return;
  flashEl.classList.remove("miss", "gold", "strong");
  if(flashEl.offsetWidth !== undefined) void flashEl.offsetWidth;
  flashEl.classList.add(kind);
  if(strong) flashEl.classList.add("strong");
  setTimeout(function(){ flashEl.classList.remove(kind, "strong"); }, 700);
}
/* S0: the tablets tones ride the sfx bus (Snd.sfxBus), so the mute and the sfx level reach them. */
function tabletsAudio(){
  return (typeof Snd !== "undefined" && Snd.sfxBus) ? Snd.sfxBus() : null;
}
/* E: the scribe's chisel ticks upward as the word fills. */
function tabletsPlayScribeTick(progress){
  const bus = tabletsAudio();
  if(!bus) return;
  try{
    const ctx = bus.ctx;
    if(ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(392 + Math.min(1, Math.max(0, progress)) * 392, t);
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g);
    g.connect(bus.out);
    o.start(t);
    o.stop(t + 0.09);
  }catch(e){}
}
function tabletsPlayGoldChime(){
  const bus = tabletsAudio();
  if(!bus) return;
  try{
    const ctx = bus.ctx;
    if(ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(f, t);
      const d = i * 0.025;
      g.gain.setValueAtTime(0.001, t);
      g.gain.setValueAtTime(0.18 / (i + 1), t + d);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.55);
      o.connect(g);
      g.connect(bus.out);
      o.start(t + d);
      o.stop(t + d + 0.55);
    });
  }catch(e){}
}
function tabletsPlayDangerWarn(){
  const bus = tabletsAudio();
  if(!bus) return;
  try{
    const ctx = bus.ctx;
    if(ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(220, t);
    o.frequency.linearRampToValueAtTime(196, t + 0.09);
    g.gain.setValueAtTime(0.09, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.connect(g);
    g.connect(bus.out);
    o.start(t);
    o.stop(t + 0.09);
  }catch(e){}
}
/* G1: the grade colours and the impact by grade (the carve's burst and camera kick). */
const TABLET_GRADE_COLORS = { divine:"255,236,170", sacred:"240,196,96", carved:"214,150,80", clutch:"255,128,72" };
const TABLET_KICK = { divine:0.22, sacred:0.12, carved:0.08, clutch:0.32 };
/* G1: the carve note climbs a rising pentatonic; every five streaks lift it an octave. */
const TABLET_PENTA = [0, 2, 4, 7, 9];
function tabletsCarveNoteHz(streak){
  const n = Math.min(streak || 0, 12);
  return 392 * Math.pow(2, TABLET_PENTA[n % 5] / 12 + Math.floor(n / 5));
}
/* S0: one tone through the sfx bus; it may glide to endHz and may start after a delay. */
function tabletsBlip(bus, type, hz, dur, vol, endHz, delay){
  const ctx = bus.ctx;
  const t = ctx.currentTime + (delay || 0);
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(hz, t);
  if(endHz) o.frequency.linearRampToValueAtTime(endHz, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(bus.out);
  o.start(t);
  o.stop(t + dur);
}
/* S0: a missing bus (no audio, or muted) plays nothing and throws nothing. */
function tabletsPlayWith(fn){
  const bus = tabletsAudio();
  if(!bus) return;
  try{
    if(bus.ctx.state === "suspended") bus.ctx.resume();
    fn(bus);
  }catch(e){}
}
/* G1: the carve note, a sine and a triangle at the streak's pitch; it sounds in the tutorial too. */
function tabletsPlayCarveNote(streak){
  tabletsPlayWith(function(bus){
    const hz = tabletsCarveNoteHz(streak);
    tabletsBlip(bus, "sine", hz, 0.14, 0.07);
    tabletsBlip(bus, "triangle", hz, 0.14, 0.05);
  });
}
/* G1: the camera kick by grade; the tutorial stays still. */
function tabletsCarveKick(carve){
  if(R.tabletTutorial) return;
  tabletsApplyTrauma(TABLET_KICK[carve.grade] || 0.08);
}
/* G1: the burst at the engraved slot, in the grade's colour; the tutorial and reduced motion stay still. */
function tabletsCarveBurst(carve){
  const slot = $("tablets-slot");
  if(R.tabletTutorial || tabletsReduced() || !slot || !slot.getBoundingClientRect) return;
  const r = slot.getBoundingClientRect();
  const n = carve.grade === "divine" ? 26 : (carve.grade === "clutch" ? 34 : 18);
  const color = TABLET_GRADE_COLORS[carve.grade] || TABLET_GRADE_COLORS.carved;
  spawnTabletsSparks(r.left + r.width / 2, r.top + r.height / 2, n, color);
  spawnTabletsRing(r.left + r.width / 2, r.top + r.height / 2, color);
}
/* G2: the combo meter shows how far the next carve's combo climbs toward x5 (0 at x1, full at x5). */
function tabletsComboFill(streak){
  return Math.min(1, Math.max(0, (Tablets.rules.comboOf(streak + 1) - 1) / 4));
}
/* G2: the meter's width always shows; its warm and blaze states are quiet in the tutorial and under reduced motion. */
function paintTabletsCombo(){
  const fill = tabletsComboFill(R.streak || 0);
  const bar = $("tablets-combo");
  const bit = $("tablets-combo-fill");
  if(bit) bit.style.width = (fill * 100) + "%";
  if(!bar) return;
  const quiet = tabletsQuiet();
  bar.classList.toggle("warm", !quiet && fill >= 0.5);
  bar.classList.toggle("blaze", !quiet && fill >= 1);
}
/* G2: the multiplier pops for 420 ms when a carve climbs the combo; asleep in the tutorial and under reduced motion. */
function tabletsPopMult(){
  const el = $("tablets-mult");
  if(!el || tabletsQuiet()) return;
  el.classList.remove("pop");
  if(el.offsetWidth !== undefined) void el.offsetWidth;
  el.classList.add("pop");
  clearTimeout(R.tabletPopTimer);
  R.tabletPopTimer = setTimeout(function(){ el.classList.remove("pop"); }, 420);
}
/* G2: a climb pops the multiplier; the first time the meter blazes this streak, Snd.ignite plays. */
function tabletsComboCue(oldStreak, newStreak){
  /* G2: the meter moves with the carve, not a second later when the step re-arms. */
  paintTabletsCombo();
  const climbed = Tablets.rules.comboOf(newStreak + 1) > Tablets.rules.comboOf(oldStreak + 1);
  if(climbed) tabletsPopMult();
  const blazed = tabletsComboFill(newStreak) >= 1 && tabletsComboFill(oldStreak) < 1;
  if(blazed && typeof Snd !== "undefined" && Snd.ignite) Snd.ignite();
}
/* G2: a miss that breaks a streak of 2 or more drops a low tone and cracks the meter for 520 ms. */
function tabletsComboBreak(oldStreak){
  /* G2: a miss empties the meter at once. */
  paintTabletsCombo();
  if(R.tabletTutorial || oldStreak < 2) return;
  tabletsPlayWith(function(bus){ tabletsBlip(bus, "sine", 110, 0.22, 0.09, 70); });
  const bar = $("tablets-combo");
  if(!bar || tabletsQuiet()) return;
  bar.classList.remove("broke");
  if(bar.offsetWidth !== undefined) void bar.offsetWidth;
  bar.classList.add("broke");
  clearTimeout(R.tabletBreakTimer);
  R.tabletBreakTimer = setTimeout(function(){ bar.classList.remove("broke"); }, 520);
}
/* G3: the heartbeat gap: 0.95 s at danger 0.5, easing to 0.45 s at danger 1. */
function tabletsHeartGapS(d){
  return 0.95 - 0.5 * Math.min(1, Math.max(0, (d - 0.5) / 0.5));
}
/* G3: the heart beats in the timed run, while not paused or resolving, and once the danger reaches half. */
function tabletsHeartbeatDue(){
  return !R.tabletTutorial && !tabletsUntimed() && !R.paused && !R.tabletResolving && tabletsDangerLevel() >= 0.5;
}
function tabletsHeartbeat(dt){
  if(!tabletsHeartbeatDue()) return;
  R.tabletHeartT = (R.tabletHeartT || 0) + dt;
  if(R.tabletHeartT < tabletsHeartGapS(tabletsDangerLevel())) return;
  R.tabletHeartT = 0;
  if(typeof Snd !== "undefined" && Snd.heart) Snd.heart();
}
/* G3: a spent lamp crackles; the last lamp thuds. Sounds play under reduced motion too. */
function tabletsLampFx(spent, litNow){
  if(!spent || typeof Snd === "undefined") return;
  if(litNow > 0){
    if(Snd.lampCrackle) Snd.lampCrackle();
    return;
  }
  if(Snd.lampThud) Snd.lampThud();
}
/* G4: the final carve is the last gap of the last step (Endless: of its first reading). The tutorial has none. */
function tabletsIsFinalCarve(){
  if(R.tabletTutorial) return false;
  const lastStep = (R.tabletIdx || 0) >= ((R.tabletSteps || []).length - 1);
  const lastGap = (R.gapIdx || 0) >= tabletsStepBlanks().length - 1;
  const firstReading = R.tabletMode !== "endless" || (R.tabletPass || 1) === 1;
  return lastStep && lastGap && firstReading;
}
/* G4: the Hold's finish: a chord rings out; the roll sweeps gold and the lit seals glow (not in the tutorial or under reduced motion). */
function tabletsHoldFinale(){
  tabletsPlayWith(function(bus){
    [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i){ tabletsBlip(bus, "sine", f, 1.4, 0.07, 0, i * 0.06); });
  });
  if(tabletsQuiet()) return;
  R.tabletGlory = true;
  paintTabletsPowers();
  clearTimeout(R.tabletGloryTimer);
  R.tabletGloryTimer = setTimeout(function(){ R.tabletGlory = false; paintTabletsPowers(); }, 1400);
  const roll = $("tablets-roll");
  if(!roll) return;
  roll.classList.remove("hold-sweep");
  if(roll.offsetWidth !== undefined) void roll.offsetWidth;
  roll.classList.add("hold-sweep");
  setTimeout(function(){ roll.classList.remove("hold-sweep"); }, 900);
}
function paintTabletsTutorialCallout(){
  const callout = $("tablets-tut-callout");
  if(!callout) return;
  if(!R || !R.tabletTutorial){
    callout.hidden = true;
    callout.textContent = "";
    return;
  }
  const prompts = [
    (window.matchMedia && matchMedia("(pointer:coarse)").matches)
      ? "Tap FATHER below"
      : "Tap FATHER below, or type the word (1–6 picks)",
    "The word flies into the carved slot",
    "Here the sand runs slow and costs no lamp",
    "Illuminate carves the true word for you",
    "Winnow casts three false stones into shadow",
    "Three lamps guard a wrong word. The sand is the Hold",
    "Almost complete · Let no word be lost",
    "Final word · Engrave it to seal your first Hold and open the Hall!"
  ];
  const msg = prompts[R.tabletIdx || 0] || "Carve the missing word to complete the prayer.";
  callout.textContent = msg;
  callout.hidden = false;
}
/* S1: one blank at a time — every step holds a single verse line. */
function tabletsBuildSteps(ch, k){
  const steps = [];
  const blanks = (ch && ch.blanks) || [];
  for(let i = 0; i < blanks.length; i += k) steps.push(blanks.slice(i, i + k));
  return steps;
}
function tabletsStepBlanks(){
  const steps = (typeof R !== "undefined" && R && R.tabletSteps) || [];
  return steps[(R && R.tabletIdx) || 0] || [];
}
function tabletsGapBlank(){
  const step = tabletsStepBlanks();
  return step[(R && R.gapIdx) || 0] || step[0] || null;
}
function tabletsGapKey(){
  return (((R && R.tabletIdx) || 0) + ":" + ((R && R.gapIdx) || 0));
}
/* R2: a line reads "v3 He restoreth my [soul]:", the verse number, the words and the blank. */
function tabletsVerseNumber(ref){
  const m = /:(\d+)\s*$/.exec(String(ref || ""));
  return m ? "v" + m[1] : String(ref || "");
}
function paintTabletsVerseLine(host, blank, carved, slot){
  const line = document.createElement("div");
  line.className = "tablets-gap-line";
  const ref = document.createElement("span");
  ref.className = "tablets-gap-ref";
  ref.textContent = tabletsVerseNumber(blank.r);
  ref.setAttribute("title", blank.r);
  const pre = document.createElement("span");
  pre.textContent = blank.prefix + " ";
  const suf = document.createElement("span");
  suf.textContent = blank.suffix ? (" " + blank.suffix) : "";
  line.appendChild(ref);
  line.appendChild(pre);
  /* R2: the active blank is the slot itself, carved inline as in the reference; every other blank is a stone. */
  if(slot) line.appendChild(slot);
  else{
    const mid = document.createElement("span");
    mid.className = "tablets-blank-word" + (carved ? " in" : "");
    mid.textContent = carved ? blank.a : "___";
    line.appendChild(mid);
  }
  line.appendChild(suf);
  host.appendChild(line);
}
/* R2: the slot leaves the verse before the verse is cleared, so clearing never drops it from the page. */
function tabletsParkSlot(slot){
  const ms = $("tablets-ms");
  /* A slot with no parent is not in the page yet (or is a test double); there is nothing to rescue. */
  if(!slot || !ms || !slot.parentNode || slot.parentNode === ms) return;
  ms.appendChild(slot);
}
function paintTabletsVerse(stepBlanks, gapIdx, answer){
  const verse = $("tablets-verse");
  if(!verse) return;
  const slot = $("tablets-slot");
  tabletsParkSlot(slot);
  verse.innerHTML = "";
  if(verse.dataset) verse.dataset.gaps = String((stepBlanks || []).length || 1);
  if(!stepBlanks || !stepBlanks.length){ verse.textContent = ""; return; }
  stepBlanks.forEach(function(blank, gi){
    /* A hit carves through the current gap; earlier gaps stay carved, later
       gaps stay empty. A miss keeps whatever was already carved. */
    const carved = (answer === "hit" || answer === "done") ? gi <= gapIdx : gi < gapIdx;
    paintTabletsVerseLine(verse, blank, carved, gi === gapIdx ? slot : null);
  });
  paintTabletsSheet();
}
/* R1: the carved steps roll above the current one and the coming steps below it. A new step snaps the roll. */
function paintTabletsSheet(){
  const past = $("tablets-sheet-past"), next = $("tablets-sheet-next");
  const steps = (R && R.tabletSteps) || [];
  if(!past || !next || !steps.length) return;
  const idx = R.tabletIdx || 0;
  if(R.tabletRollStep !== idx) R.tabletRollSnap = true;
  R.tabletRollStep = idx;
  fillTabletsSheet(past, steps.slice(0, idx), true);
  fillTabletsSheet(next, steps.slice(idx + 1), false);
}
function fillTabletsSheet(host, list, carved){
  host.innerHTML = "";
  list.forEach(function(step){
    const box = document.createElement("div");
    box.className = "tablets-sheet-step";
    step.forEach(function(blank){ paintTabletsVerseLine(box, blank, carved); });
    host.appendChild(box);
  });
}
function paintTabletsSlot(blank, kind){
  const slot = $("tablets-slot");
  if(!slot) return;
  slot.classList.remove("glow", "taught");
  if(kind === "hit" && blank){
    slot.textContent = blank.a;
    slot.classList.add("glow");
    return;
  }
  /* The letters of the word being typed stand in the slot until it lands. */
  slot.textContent = (R && R.tabletTyped) ? R.tabletTyped : "— — —";
}
function tabletsShowFracture(){
  const f = $("tablets-fracture");
  if(!f) return;
  f.classList.add("active");
  setTimeout(function(){ try{ f.classList.remove("active"); }catch(e){} }, 500);
}
function paintTabletsTablet(answer){
  const ch = tabletsChapter();
  const step = tabletsStepBlanks();
  const gap = tabletsGapBlank();
  const golden = tabletsGoldenAt(R && R.tabletIdx);
  R.tabletGolden = golden;
  const ms = $("tablets-ms");
  if(ms) ms.classList.toggle("golden-blank", golden);
  const badge = $("tablets-golden");
  if(badge) badge.hidden = !golden;
  const refEl = $("tablets-ref");
  if(refEl) refEl.textContent = gap ? gap.r : ch.r;
  paintTabletsVerse(step, (R && R.gapIdx) || 0, answer);
  paintTabletsSlot(gap, answer === "hit" ? "hit" : "");
  if(answer === "miss") tabletsShowFracture();
  paintTabletsPips();
  paintTabletsClock();
  tabletsKeepGapInView();
}
/* On small screens a tall multi-gap card scrolls inside the stage: keep
   the active gap line visible after every repaint. No-op on desktop
   (nothing overflows) and in tests (shim no-op). */
function tabletsKeepGapInView(){
  /* R1: the roll keeps the step in view; scrollIntoView would fight its transform. */
  if($("tablets-roll")) return;
  try{
    const verse = $("tablets-verse");
    if(!verse || !verse.children || verse.children.length < 2) return;
    const line = verse.children[Math.min((R && R.gapIdx) || 0, verse.children.length - 1)];
    if(line && typeof line.scrollIntoView === "function") line.scrollIntoView({ block: "nearest" });
  }catch(e){}
}
function paintTabletsStage(answer){
  paintTabletsTablet(answer);
}
function paintTabletsPips(){
  const host = $("tablets-pips");
  if(!host) return;
  host.innerHTML = "";
  const ch = tabletsChapter();
  const steps = (R && R.tabletSteps) || [];
  const idx = R.tabletIdx || 0;
  if(ch.blanks.length > 20) return;
  const n = steps.length || 1;
  steps.forEach(function(_, i){
    const pip = document.createElement("i");
    pip.className = "tablets-pip" + (i < idx ? " done" : (i === idx ? " on" : ""));
    pip.style.left = (n > 1 ? (i / (n - 1)) * 96 + 2 : 50) + "%";
    host.appendChild(pip);
  });
}
function tabletsParentSite(){
  const ch = tabletsChapter();
  if(!(ch && ch.after) || typeof Pilgrimage === "undefined" || !Pilgrimage.site) return null;
  return Pilgrimage.site(ch.after) || null;
}
function tabletsReact(ok){
  const fig = $("tablets-companion");
  if(!fig || fig.hidden) return;
  fig.classList.remove("success", "failure");
  void fig.offsetWidth;
  fig.classList.add(ok ? "success" : "failure");
  clearTimeout(fig._t);
  fig._t = setTimeout(function(){ fig.classList.remove("success", "failure"); }, ok ? 1100 : 820);
}
function paintTabletsPlaceCard(ch, site){
  const place = $("tablets-place");
  const sub = $("tablets-place-sub");
  const kicker = $("tablets-place-kicker");
  if(kicker) kicker.textContent = "The tablet";
  if(place) place.textContent = site ? (ch.afterName || site.name) : (R.tabletTutorial ? "The Lord's Prayer" : "The Hall");
  if(sub) sub.textContent = site ? (ch.name + " · " + (site.modernCountry || "")) : (ch.subtitle || "");
}
function paintTabletsCompanion(site){
  const fig = $("tablets-companion");
  const img = $("tablets-companion-img");
  const sign = $("tablets-companion-sign");
  if(fig && site && typeof companionQuestionSrc === "function"){
    fig.hidden = false;
    fig.removeAttribute("hidden");
    if(img) img.src = companionQuestionSrc(site);
    if(sign) sign.textContent = typeof companionQuestionName === "function" ? companionQuestionName(site) : "";
  } else if(fig){
    fig.hidden = true;
    fig.setAttribute("hidden", "");
  }
}
function paintTabletsCast(){
  const ch = tabletsChapter();
  const site = tabletsParentSite();
  paintTabletsPlaceCard(ch, site);
  paintTabletsCompanion(site);
}
function paintTabletsProgressStats(pct, rec){
  const pctEl = $("tablets-pct");
  if(pctEl) pctEl.textContent = pct + "%";
  const fill = $("tablets-fill");
  if(fill) fill.style.width = pct + "%";
  const ghost = $("tablets-ghost");
  if(ghost){
    const hasBest = (rec && rec.best > 0);
    ghost.hidden = !hasBest;
    if(hasBest) ghost.style.left = rec.best + "%";
  }
}
function paintTabletsTier(){
  const t = tabletsTier(R.streak || 0);
  const name = $("tablets-tier-name");
  const mult = $("tablets-mult");
  const pill = $("tablets-tier");
  if(name) name.textContent = t.name;
  if(mult) mult.textContent = t.mult.toFixed(1) + "×";
  if(pill) pill.classList.toggle("elevated", (R.streak || 0) >= 3);
}
function paintTabletsFreeze(){
  const fill = $("tablets-freeze-fill");
  const status = $("tablets-freeze-status");
  const panel = $("tablets-freeze");
  const pct = Math.min(100, Math.round(R.freeze || 0));
  if(fill) fill.style.width = pct + "%";
  if(status){
    if(R.freezeOn) status.textContent = Math.ceil(R.freezeLeft || 0) + "s";
    else if((R.freeze || 0) >= 100) status.textContent = "READY!";
    else status.textContent = pct + "%";
  }
  if(panel){
    panel.classList.toggle("ready", !!(R.freezeOn || (R.freeze || 0) >= 100));
    panel.classList.toggle("spent", !!R.tabletTutorial);
  }
  const aura = $("tablets-aura");
  if(aura) aura.classList.toggle("frozen", !!R.freezeOn);
}
function tabletsRemainText(){
  const steps = (typeof R !== "undefined" && R && R.tabletSteps) || [];
  const total = steps.length || 1;
  const idx = (typeof R !== "undefined" && R && R.tabletIdx) || 0;
  return Math.min(idx + 1, total) + " / " + total;
}
function paintTabletsHud(){
  const ch = tabletsChapter();
  const pct = tabletsPct();
  const rec = Tablets.recordOf(typeof SAVE !== "undefined" ? SAVE : null, ch.id);
  paintTabletsCast();
  const chEl = $("tablets-chapter");
  if(chEl) chEl.textContent = ch.name;
  const subEl = $("tablets-sub");
  if(subEl){
    const pace = R.tabletTutorial ? "Learn the Hold" : ((Tablets.levelName && Tablets.levelName(R.tabletLevel)) || "I");
    subEl.textContent = pace + " · " + (ch.subtitle || (typeof translationTag === "function" ? translationTag() : "KJV"));
  }
  const remEl = $("tablets-remain");
  if(remEl) remEl.textContent = tabletsRemainText();
  const strkEl = $("tablets-streak");
  if(strkEl) strkEl.textContent = String(R.streak || 0);
  const favEl = $("tablets-favor");
  if(favEl) favEl.textContent = String(R.favor || 0);
  const bestEl = $("tablets-best");
  if(bestEl) bestEl.textContent = (rec.best || 0) + "%";
  paintTabletsProgressStats(pct, rec);
  paintTabletsTier();
  paintTabletsFreeze();
  paintTabletsCombo();
  paintTabletsIllumBtn();
  paintTabletsTutorialCallout();
  paintTabletsPace();
}
function tabletsOptsForBlank(){
  const blank = tabletsGapBlank();
  if(!blank) return [];
  const key = tabletsGapKey();
  if(R.tabletOptsIdx === key && R.tabletOpts && R.tabletOpts.length) return R.tabletOpts;
  R.tabletOpts = Tablets.options(blank);
  R.tabletOptsIdx = key;
  return R.tabletOpts;
}
/* D: the lamps wear the arcade's seals — three diamonds that crack as they spend. */
function tabletsSealsMarkup(left, total){
  /* G3/G4: the smoke and the glow ride the seals; the tutorial and reduced motion never show them. */
  const run = (typeof R !== "undefined" && R) || {};
  const quiet = tabletsQuiet();
  return tabletsSealMarks(left, total, quiet ? -1 : run.tabletSnuffAt, !quiet && !!run.tabletGlory);
}
/* G3/G4: the seals' markup. The seal that just went dark smokes; the lit seals glow at the Hold's finish. */
function tabletsSealMarks(left, total, snuffAt, glory){
  let out = "";
  /* FX9: one seal per lamp the mode starts with (Judgment wears one). */
  for(let i = 0; i < (total || 1); i++){
    let cls = i < left ? "" : " cracked";
    if(i === snuffAt) cls += " snuff";
    if(glory && i < left) cls += " glory";
    out += '<i class="tablets-seal' + cls + '"></i>';
  }
  return out;
}
/* D: the ladder marker reads the same rise as the roll — 0 at the entry line, 100 at The Mark. */
function tabletsLadderTop(rise){
  return (1 - rise) * 100;
}
function paintTabletsPowers(){
  const illum = $("tablets-illum");
  if(illum){
    const n = (R.powers && R.powers.illum) || 0;
    const lab = $("tablets-illum-n");
    if(lab) lab.textContent = String(n);
    else illum.textContent = "Illuminate ×" + n;
    illum.disabled = n < 1;
    illum.classList.toggle("spent", n < 1);
  }
  const winnow = $("tablets-winnow");
  if(winnow){
    const n = (R.powers && R.powers.winnow) || 0;
    const lab = $("tablets-winnow-n");
    if(lab) lab.textContent = String(n);
    else winnow.textContent = "Winnow ×" + n;
    winnow.disabled = n < 1;
    winnow.classList.toggle("spent", n < 1);
  }
  const selah = $("tablets-selah");
  if(selah){
    const n = (R.powers && R.powers.selah) || 0;
    const lab = $("tablets-selah-n");
    if(lab) lab.textContent = String(n);
    selah.disabled = n < 1 || (R.selahLeft || 0) > 0;
    selah.classList.toggle("spent", n < 1);
  }
  paintTabletsHintBtn();
  paintTabletsWard();
  const lamps = $("tablets-lamps");
  if(lamps){
    const left = Math.max(0, (R.tabletLives || 1) - (R.tabletMiss || 0));
    lamps.dataset.lampsLeft = String(left);
    lamps.innerHTML = tabletsSealsMarkup(left, R.tabletLives || 1);
    /* FX9: screen readers hear the lamp count, not the seal glyphs. */
    lamps.setAttribute("aria-label", "Lamps: " + left + " lit");
    lamps.classList.toggle("low", left <= 1);
  }
}
function paintTabletsIllumBtn(){
  paintTabletsPowers();
}
function tabletsStoneButtons(){
  const grid = $("tablets-grid");
  return (grid && grid.children) ? [].slice.call(grid.children) : [];
}
function paintTabletsTray(){
  const grid = $("tablets-grid");
  if(!grid) return;
  grid.classList.remove("locked");
  grid.innerHTML = "";
  const blank = tabletsGapBlank();
  if(!blank) return;
  const grey = tabletsGreyWords();
  const badges = ["1", "2", "3", "4", "5", "6"];
  tabletsOptsForBlank().forEach(function(word, i){
    const b = document.createElement("button");
    b.type = "button";
    const dimmed = grey.indexOf(word) >= 0;
    b.className = "tablets-stone" + (String(word).length > 10 ? " long" : "") + (dimmed ? " dim" : "");
    b.dataset.word = word;
    b.dataset.idx = String(i);
    b.disabled = dimmed;
    b.draggable = !dimmed;
    if(!dimmed){
      b.addEventListener("dragstart", function(e){
        try{
          e.dataTransfer.setData("text/plain", word);
          e.dataTransfer.effectAllowed = "copy";
        }catch(err){}
        b.classList.add("dragging");
      });
      b.addEventListener("dragend", function(){ b.classList.remove("dragging"); });
      tabletsBindTouchDrag(b, word);
    }
    const key = document.createElement("span");
    key.className = "tablets-key";
    key.textContent = badges[i] || String(i + 1);
    const w = document.createElement("span");
    w.className = "tablets-word";
    w.textContent = word;
    b.appendChild(key);
    b.appendChild(w);
    if(!dimmed) b.addEventListener("click", function(){
      /* R3: the click that ends a touch drag is not a second pick. */
      if(b._touchDragged){ b._touchDragged = false; return; }
      tabletsPick(word);
    });
    grid.appendChild(b);
  });
  paintTabletsTrayWord();
  paintTabletsIllumBtn();
}
/* R3: HTML5 drag never starts from a finger, so touch and pen drag with pointer events: a ghost word follows the
   finger after 10 px and a release over the slot picks the word. A mouse keeps the HTML5 drag above. */
const TABLET_DRAG_START_PX = 10;
const TABLET_DRAG_SLOP_PX = 18;
function tabletsOverSlot(x, y){
  const slot = $("tablets-slot");
  if(!slot || !slot.getBoundingClientRect) return false;
  const r = slot.getBoundingClientRect();
  return x >= r.left - TABLET_DRAG_SLOP_PX && x <= r.right + TABLET_DRAG_SLOP_PX &&
    y >= r.top - TABLET_DRAG_SLOP_PX && y <= r.bottom + TABLET_DRAG_SLOP_PX;
}
function tabletsMoveGhost(ghost, x, y){
  ghost.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px) translate(-50%,-50%)";
}
function tabletsBindTouchDrag(b, word){
  b.addEventListener("pointerdown", function(e){
    if(!e || e.pointerType === "mouse" || typeof window === "undefined") return;
    const sx = e.clientX, sy = e.clientY;
    let ghost = null;
    function move(ev){
      if(!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < TABLET_DRAG_START_PX) return;
      if(!ghost){
        ghost = document.createElement("div");
        ghost.className = "tablets-drag-ghost";
        ghost.textContent = word;
        document.body.appendChild(ghost);
        b.classList.add("dragging");
      }
      if(ev.cancelable) ev.preventDefault();
      tabletsMoveGhost(ghost, ev.clientX, ev.clientY);
      const slot = $("tablets-slot");
      if(slot) slot.classList.toggle("drag-over", tabletsOverSlot(ev.clientX, ev.clientY));
    }
    function end(ev){
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if(!ghost) return;
      ghost.remove();
      b.classList.remove("dragging");
      b._touchDragged = true;
      setTimeout(function(){ b._touchDragged = false; }, 400);
      const slot = $("tablets-slot");
      if(slot) slot.classList.remove("drag-over");
      if(ev.type === "pointerup" && tabletsOverSlot(ev.clientX, ev.clientY)) tabletsPick(word);
    }
    window.addEventListener("pointermove", move, { passive:false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  });
}
function paintTabletsTrayWord(){
  const lab = $("tablets-tray-word");
  if(!lab) return;
  const step = tabletsStepBlanks();
  const k = step.length;
  if(k > 1){
    const g = Math.min(((R && R.gapIdx) || 0) + 1, k);
    const compact = (typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(max-width: 640px)").matches);
    lab.textContent = compact ? ("Word " + g + " of " + k)
      : ("Word " + g + " of " + k + " · Choose the missing word");
  } else {
    lab.textContent = "Choose the missing word";
  }
}
function tabletsTrueStone(){
  const blank = tabletsGapBlank();
  if(!blank) return null;
  const need = String(blank.a || "").toLowerCase().trim();
  const btns = tabletsStoneButtons();
  let i = 0;
  for(; i < btns.length; i++){
    if(String(btns[i].dataset && btns[i].dataset.word || "").toLowerCase().trim() === need) return btns[i];
  }
  return null;
}
/* FX3: the powers answer only while the run is live and no carve or miss is resolving. */
function tabletsPowerReady(){
  return !!R && !R.ended && !R.paused && R.mode === "tablets" && !R.tabletResolving;
}
function tabletsIlluminate(){
  if(!tabletsPowerReady()) return;
  if(R.tabletHintedIdx === tabletsGapKey()){
    if(typeof toast === "function") toast("This blank is already lit");
    return;
  }
  if(!R.powers || R.powers.illum < 1){
    if(typeof toast === "function") toast("No Illuminate left");
    return;
  }
  const blank = tabletsGapBlank();
  const target = tabletsTrueStone();
  if(!target || !blank) return;
  R.tabletHintedIdx = tabletsGapKey();
  R.powers.illum--;
  R.usedPower = true;
  R.powersSpent = (R.powersSpent || 0) + 1;
  if(R.illumFromReserve > 0) R.illumFromReserve--;
  target.classList.add("revealed");
  setTimeout(function(){ try{ target.classList.remove("revealed"); }catch(e){} }, 2000);
  paintTabletsIllumBtn();
  if(typeof toast === "function") toast("Illuminate — the true word is carved");
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
  /* O4: the power carves the true word at the Carved grade. It counts for the
     streak and the Favor, and it earns no typed bonus. */
  R.tabletGrade = "carved";
  tabletsPick(String(blank.a || ""));
}
function tabletsGreyWords(){
  if(R.tabletWinnowIdx === tabletsGapKey() && R.tabletWinnow) return R.tabletWinnow.slice();
  return [];
}
function tabletsWinnow(){
  if(!tabletsPowerReady()) return;
  if(R.tabletWinnowIdx === tabletsGapKey()){
    if(typeof toast === "function") toast("This blank is already winnowed");
    return;
  }
  if(!R.powers || (R.powers.winnow || 0) < 1){
    if(typeof toast === "function") toast("No Winnow left");
    return;
  }
  const blank = tabletsGapBlank();
  if(!blank) return;
  const opts = tabletsOptsForBlank();
  const grey = tabletsGreyWords();
  const decoys = opts.filter(function(w){
    return String(w).toLowerCase() !== String(blank.a).toLowerCase() && grey.indexOf(w) < 0;
  });
  const take = Tablets.rules.winnowCount(decoys.length);
  if(take < 1){
    if(typeof toast === "function") toast("Nothing left to winnow");
    return;
  }
  R.tabletWinnow = decoys.slice(0, take);
  R.tabletWinnowIdx = tabletsGapKey();
  R.powers.winnow--;
  R.usedPower = true;
  R.powersSpent = (R.powersSpent || 0) + 1;
  paintTabletsTray();
  if(typeof toast === "function") toast("Winnow — a false stone falls away");
  if(typeof Director !== "undefined" && Director.speak) Director.speak("Winnow — a false stone falls away.", true);
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
}
/* R3: Selah is the reference's stasis: for 4 seconds the sand runs at 0.06 of its pace. */
const TABLET_SELAH_S = 4;
const TABLET_SELAH_SCALE = 0.06;
function tabletsSandScale(){
  if(R && R.freezeOn) return 0;
  return (R && (R.selahLeft || 0) > 0) ? TABLET_SELAH_SCALE : 1;
}
function tabletsSelah(){
  if(!tabletsPowerReady()) return;
  if((R.selahLeft || 0) > 0){
    if(typeof toast === "function") toast("Selah is already stilling the sand");
    return;
  }
  if(!R.powers || (R.powers.selah || 0) < 1){
    if(typeof toast === "function") toast("No Selah left");
    return;
  }
  R.powers.selah--;
  R.usedPower = true;
  R.powersSpent = (R.powersSpent || 0) + 1;
  R.selahLeft = TABLET_SELAH_S;
  paintTabletsPowers();
  paintTabletsClock();
  if(typeof toast === "function") toast("Selah — the sand slows for 4 s");
  if(typeof Director !== "undefined" && Director.speak) Director.speak("Selah. Be still.", true);
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
}
function setTabletsPaused(on){
  if(!R || R.mode !== "tablets" || R.ended) return;
  R.paused = !!on;
  const ov = $("tablets-pause");
  if(ov){
    ov.hidden = !R.paused;
    ov.classList.toggle("on", R.paused);
  }
  if(R.paused){
    stopTabletsLoop();
  } else {
    stopTabletsLoop(); // FX2: resume restarts the loop, inside a resolve window too (one loop: stop first)
    R.tabletLast = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    R.tabletRacing = true;
    if(typeof requestAnimationFrame === "function") R.tabletRaf = requestAnimationFrame(tabletsTick);
  }
}
function toggleTabletsPause(){
  if(!R || R.mode !== "tablets" || R.ended) return;
  setTabletsPaused(!R.paused);
}
function tabletsMarkPicked(word){
  tabletsStoneButtons().forEach(function(b){
    if(!b || !b.classList) return;
    if(b.dataset && b.dataset.word === word) b.classList.add("selected");
    else b.classList.remove("selected");
  });
}
function tabletsPick(word){
  if(!R || R.ended || R.paused || R.mode !== "tablets") return;
  const blank = tabletsGapBlank();
  if(!blank) return;
  tabletsMarkPicked(word);
  const got = String(word || "").toLowerCase().trim();
  const need = String(blank.a || "").toLowerCase().trim();
  if(got === need) tabletsResolve(true);
  else tabletsResolve(false);
}
function tabletsApplyTrauma(amount){
  if(tabletsReduced()) return;
  R.trauma = Math.min(1, (R.trauma || 0) + (amount || 0.9));
  /* FX12: the miss haptic is the miss's one pattern; the trauma only shakes the stage. */
}
function tabletsTickTrauma(dt){
  if(!(R.trauma > 0)){
    const stage = $("tablets-stage");
    if(stage && stage.style) stage.style.transform = "";
    return;
  }
  R.trauma = Math.max(0, R.trauma - dt * 1.8);
  const stage = $("tablets-stage");
  if(!stage || !stage.style) return;
  const shake = R.trauma * R.trauma * 16;
  const rx = (Math.random() * 2 - 1) * shake;
  const ry = (Math.random() * 2 - 1) * shake;
  stage.style.transform = "translate(" + rx + "px," + ry + "px)";
}
function finishTabletsTutorial(){
  stopTabletsLoop();
  R.ended = true;
  R.tabletRacing = false;
  if(typeof SAVE !== "undefined" && SAVE.set){
    SAVE.set.tabletsTutorialDone = true;
    if(typeof persist === "function") persist();
  }
  if(typeof toast === "function") toast("The Lord's Prayer is held. The Hall is open.");
  if(typeof Snd !== "undefined" && Snd.victory) Snd.victory();
  if(typeof openBrief === "function") openBrief("tablets");
}
function tabletsResolveMiss(){
  const oldStreak = R.streak || 0;
  tabletsNoteMissed();
  if(!R.tabletTutorial){
    /* D1: a miss spends a lamp and pushes the sand back. The rules decide
       both; the run applies the verdict and keeps the lamp count. */
    const lives = R.tabletLives || 1;
    const lit = Math.max(0, lives - (R.tabletMiss || 0));
    const max = R.tabletClockMax || tabletsClockMax() || 1;
    let cracked = Tablets.rules.miss(lit, R.tabletMode === "judgment", Tablets.rules.progressOf(R.tabletClock, max));
    /* F3: a held ward takes the miss: the lamp stays lit, the push back and the broken streak still land. */
    if(tabletsSpendWard(cracked.lit < lit)) cracked = { lit:lit, ended:false, progress:cracked.progress };
    R.tabletMiss = lives - cracked.lit;
    R.tabletLampOut = !!cracked.ended;
    R.tabletClock = max * (1 - cracked.progress);
    /* G3: the seal that just went dark is the one at index cracked.lit; it smokes for 900 ms. */
    const spent = cracked.lit < lit;
    R.tabletSnuffAt = spent ? cracked.lit : -1;
    if(spent) setTimeout(function(){ R.tabletSnuffAt = -1; }, 900);
    tabletsLampFx(spent, cracked.lit);
    R.streak = 0;
    R.freeze = Math.max(0, (R.freeze || 0) - 25);
  }
  if(typeof Snd !== "undefined" && Snd.shatter) Snd.shatter();
  paintTabletsTablet("miss");
  tabletsReact(false);
  const failedGrid = $("tablets-grid");
  if(failedGrid) failedGrid.classList.add("locked");
  tabletsApplyTrauma(0.9);
  /* E: the miss speaks in red. */
  tabletsFlash("miss", false);
  const missedSlot = $("tablets-slot");
  if(missedSlot && missedSlot.getBoundingClientRect){
    const r = missedSlot.getBoundingClientRect();
    spawnTabletsSparks(r.left + r.width / 2, r.top + r.height / 2, 26, "255,77,61");
  }
  tabletsMissHaptic();
  const picked = tabletsStoneButtons().filter(function(b){ return b.classList && b.classList.contains("selected"); })[0];
  if(picked) picked.classList.add("shatter");
  tabletsComboBreak(oldStreak);
  paintTabletsHud();
}
/* D4/O1: the arcade grade ids wear the game's words. */
const TABLET_GRADE_NAMES = { divine:"Fresh sand", sacred:"Sure", carved:"Carved", clutch:"Last grain" };
function tabletsGradeName(id){
  return TABLET_GRADE_NAMES[id] || "Sure";
}
/* The live run grades every carve from the sand that is left. The rules own
   the numbers (grade band, combo); the run only reads them. F1: Freeze pays no extra Favor. */
function tabletsCarve(){
  const max = R.tabletClockMax || tabletsClockMax() || 1;
  return Tablets.rules.carve({
    progress: Tablets.rules.progressOf(R.tabletClock, max),
    streak: R.streak || 0,
    typed: !!R.tabletTypedHit,
    grade: R.tabletGrade || null,
    golden: !!R.tabletGolden,
    paceMult: tabletsSpeed().mult
  });
}
/* S1: the carve's points are the Favor; the speed's multiplier is already inside them. */
function tabletsHitFavor(carve){
  return carve.points || 0;
}
/* The popup names the grade, and the milestone when the carve reaches one
   (D4: a Favor popup, so the blessing banner stays the blessing's). The
   tutorial stays ungraded. */
function tabletsScoreText(carve, favor){
  if(R.tabletTutorial) return "+" + favor + " FAVOR";
  const grade = tabletsGradeName(carve.grade);
  const gold = R.tabletGolden ? "Golden verse · " : "";
  if(carve.milestone) return gold + grade + " · " + tabletsMilestoneName(carve.milestone.streak) + " · +" + favor + " FAVOR";
  return gold + grade + " · +" + favor + " FAVOR";
}
/* D4: the three milestones wear the game's names. */
function tabletsMilestoneName(streak){
  if(streak >= 50) return "Jubilee";
  if(streak >= 25) return "Double portion";
  return "Tithe";
}
/* The rules' charge ids, in the words on the power buttons. */
const TABLET_POWER_NAMES = { winnow:"Winnow", illuminate:"Illuminate" };
function tabletsPowerName(id){
  return TABLET_POWER_NAMES[id] || id;
}
/* A: the relic cards celebrate a recharge — a hop, a sheen sweep, a floating
   "+1" pill, a count pop, sparks, and a beam from the engraved slot toward the
   card. Reduced motion skips all of it; the toast always speaks. */
function tabletsRelicEl(id){
  return $(id === "winnow" ? "tablets-winnow" : "tablets-illum");
}
function tabletsCelebrateRecharge(gained){
  if(tabletsReduced()) return;
  const slot = $("tablets-slot");
  gained.forEach(function(id){
    const btn = tabletsRelicEl(id);
    if(!btn) return;
    btn.classList.remove("recharging");
    if(btn.offsetWidth !== undefined) void btn.offsetWidth;
    btn.classList.add("recharging");
    const pill = document.createElement("span");
    pill.className = "tablets-relic-pill";
    pill.textContent = "✦ +1 " + tabletsPowerName(id);
    btn.appendChild(pill);
    setTimeout(function(){ try{ pill.remove(); }catch(e){} }, 1150);
    setTimeout(function(){ btn.classList.remove("recharging"); }, 950);
    if(slot && btn.getBoundingClientRect){
      const s = slot.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      spawnTabletsBeam(s.left + s.width / 2, s.top + s.height / 2, b.left + b.width / 2, b.top + b.height / 2);
      spawnTabletsSparks(b.left + b.width / 2, b.top + b.height / 2, 12);
    }
  });
}
/* D2: the streak gives the charges back, and the rules decide how. */
function tabletsRecharge(carve){
  const award = Tablets.rules.recharge({ winnow:R.powers.winnow || 0, illuminate:R.powers.illum || 0 }, R.streak, carve.milestone);
  R.powers.winnow = award.charges.winnow;
  R.powers.illum = award.charges.illuminate;
  if(!award.gained.length) return;
  paintTabletsPowers();
  tabletsCelebrateRecharge(award.gained);
  if(typeof toast === "function") toast("Restored · " + award.gained.map(tabletsPowerName).join(" · "));
}
function tabletsResolveHit(){
  /* G4: the final carve and the streak before this hit are read before the run moves on. */
  const finalCarve = tabletsIsFinalCarve();
  const oldStreak = R.streak || 0;
  R.correct = (R.correct || 0) + 1;
  R.score = (R.score || 0) + 1;
  /* The carve reads the streak before this hit and returns the next one. */
  const carve = tabletsCarve();
  R.streak = carve.streak;
  tabletsGrantWard(R.streak);
  R.best = Math.max(R.best || 0, R.streak);
  if(!R.tabletTutorial) R.freeze = Math.min(100, (R.freeze || 0) + carve.fill);
  if(!R.tabletTutorial) tabletsIgniteFreeze();
  const favor = tabletsHitFavor(carve);
  R.favor = (R.favor || 0) + favor;
  const slot = $("tablets-slot");
  spawnTabletsScorePopup(tabletsScoreText(carve, favor), slot);
  if(typeof Snd !== "undefined" && Snd.carve) Snd.carve();
  /* E: the juice — hold, flash, kick, speak. */
  R.tabletHitstop = tabletsHitstopMs(carve);
  tabletsFlash("gold", !!carve.milestone);
  tabletsKick("tablets-favor");
  tabletsKick("tablets-streak");
  tabletsCarveHaptic(carve);
  /* G1: the carve note, the kick and the burst. */
  tabletsPlayCarveNote(oldStreak);
  tabletsCarveKick(carve);
  tabletsCarveBurst(carve);
  /* G2: the combo meter pops when the combo climbs and blazes once per streak. */
  tabletsComboCue(oldStreak, carve.streak);
  if(carve.milestone) tabletsMilestoneBanner(carve.milestone.streak, favor);
  tabletsReact(true);
  const grid = $("tablets-grid");
  if(grid) grid.classList.add("locked");
  const picked = tabletsStoneButtons().filter(function(b){ return b.classList && b.classList.contains("selected"); })[0];
  const word = (tabletsGapBlank() || {}).a;
  tabletsFlyWord(picked, slot, word, function(){
    paintTabletsTablet("hit");
    tabletsPulseSpeech();
    tabletsPlayGoldChime();
  });
  if(finalCarve) tabletsHoldFinale();
  if(!R.tabletTutorial){
    tabletsRollBlessing();
    tabletsRecharge(carve);
  }
}
function tabletsResolve(ok){
  if(!R || R.ended || R.paused || R.mode !== "tablets" || R.tabletResolving) return;
  R.tabletResolving = true;
  const token = R.tabletRunToken;
  /* F4: the review round is practice. It counts no attempt, and a missed line stays up long enough to read the word. */
  if(R.tabletReviewing){
    setTimeout(function(){ if(R.tabletRunToken === token) tabletsFinishResolve(ok); }, ok ? 1000 : TABLET_REVIEW_TEACH_MS);
    if(ok) tabletsResolveReviewHit();
    else tabletsResolveReviewMiss();
    return;
  }
  R.attempts = (R.attempts || 0) + 1;
  setTimeout(function(){ if(R.tabletRunToken === token) tabletsFinishResolve(ok); }, ok ? 1000 : 800);
  if(!ok){ tabletsResolveMiss(); return; }
  tabletsResolveHit();
}
/* F4: the missed-lines review. A Hold that missed lines reads them once more before the results: practice that
   pays no Favor and costs no lamp. The sand runs at the slowest pace, and a miss shows the true word. */
const TABLET_REVIEW_TEACH_MS = 1500;
function tabletsNoteMissed(){
  if(!R || R.tabletTutorial || R.tabletReviewing) return;
  const blank = tabletsGapBlank();
  if(!blank) return;
  R.tabletMissed = R.tabletMissed || [];
  if(R.tabletMissed.indexOf(blank) < 0) R.tabletMissed.push(blank);
}
function tabletsStartReview(){
  const missed = R.tabletMissed || [];
  if(!missed.length || R.tabletLampOut || R.tabletMode === "endless") return false;
  R.tabletChapterSteps = R.tabletSteps;
  R.tabletReviewing = true;
  R.tabletReviewKept = 0;
  R.tabletReviewTotal = missed.length;
  R.tabletSteps = missed.map(function(b){ return [b]; });
  R.tabletTotal = R.tabletSteps.length;
  R.tabletIdx = 0;
  R.gapIdx = 0;
  R.tabletRollSnap = true;
  tabletsPaintModeNote();
  spawnTabletsScorePopup("Review · the lines you missed", $("tablets-slot"));
  if(typeof Director !== "undefined" && Director.speak) Director.speak("Review. The lines you missed.", true);
  return true;
}
/* The chapter's own steps come back, so the Hold and the best % read the chapter, not the review. */
function tabletsFinishReview(){
  R.tabletReviewing = false;
  R.tabletSteps = R.tabletChapterSteps || R.tabletSteps;
  R.tabletTotal = R.tabletSteps.length;
  R.tabletIdx = R.tabletTotal;
  R.gapIdx = 0;
  if(typeof toast === "function") toast("Review · " + (R.tabletReviewKept || 0) + " of " + (R.tabletReviewTotal || 0) + " carved again");
}
function tabletsResolveReviewHit(){
  R.tabletReviewKept = (R.tabletReviewKept || 0) + 1;
  const slot = $("tablets-slot");
  spawnTabletsScorePopup("Kept", slot);
  if(typeof Snd !== "undefined" && Snd.carve) Snd.carve();
  tabletsFlash("gold", false);
  const grid = $("tablets-grid");
  if(grid) grid.classList.add("locked");
  paintTabletsTablet("hit");
}
function tabletsResolveReviewMiss(){
  const blank = tabletsGapBlank();
  if(typeof Snd !== "undefined" && Snd.shatter) Snd.shatter();
  const grid = $("tablets-grid");
  if(grid) grid.classList.add("locked");
  paintTabletsTablet("miss");
  const slot = $("tablets-slot");
  if(slot && blank){
    slot.textContent = blank.a;
    slot.classList.add("taught");
  }
  spawnTabletsScorePopup("The word is " + (blank ? blank.a : ""), slot);
}
/* F3: a 10 streak grants a ward (one at a time) that keeps the lamp on the next miss. Judgment has none. */
const TABLET_WARD_STREAK = 10;
function tabletsWardDue(streak){
  return streak > 0 && streak % TABLET_WARD_STREAK === 0;
}
function tabletsGrantWard(streak){
  if(R.tabletTutorial || R.tabletReviewing || R.tabletMode === "judgment" || R.tabletWard || !tabletsWardDue(streak)) return false;
  R.tabletWard = true;
  paintTabletsWard();
  if(typeof toast === "function") toast("A ward is granted · it keeps your next lamp");
  if(typeof Director !== "undefined" && Director.speak) Director.speak("A ward is granted.", true);
  return true;
}
/* Returns true when the ward took the miss: the lamp stays lit and the ward is spent. */
function tabletsSpendWard(lampWouldGo){
  if(!lampWouldGo || !R.tabletWard) return false;
  R.tabletWard = false;
  paintTabletsWard();
  spawnTabletsScorePopup("Ward · the lamp holds", $("tablets-slot"));
  if(typeof toast === "function") toast("The ward breaks · your lamp stays lit");
  return true;
}
function paintTabletsHintBtn(){
  const hint = $("tablets-hint");
  if(!hint) return;
  const ready = tabletsHintReady();
  hint.disabled = !ready;
  hint.classList.toggle("spent", !ready);
}
function paintTabletsWard(){
  const el = $("tablets-ward");
  if(el) el.hidden = !(R && R.tabletWard);
}
/* F2: the hint shows the word's first letter in the slot for 50 Favor, once per blank. A word finished after a
   hint is not a typed carve, so it earns no typed bonus. */
const TABLET_HINT_COST = 50;
function tabletsHintReady(){
  if(!R || R.tabletHintUsed || R.tabletTyped || R.tabletResolving) return false;
  return tabletsNeedWord().length > 1 && (R.favor || 0) >= TABLET_HINT_COST;
}
function tabletsHint(){
  if(!tabletsPowerReady()) return false;
  if(R.tabletHintUsed){
    if(typeof toast === "function") toast("The first letter is already shown");
    return false;
  }
  if((R.favor || 0) < TABLET_HINT_COST){
    if(typeof toast === "function") toast("A hint costs " + TABLET_HINT_COST + " Favor");
    return false;
  }
  if(!tabletsHintReady()) return false;
  const need = tabletsNeedWord();
  R.favor -= TABLET_HINT_COST;
  R.tabletHintUsed = true;
  R.tabletTyped = need.charAt(0);
  paintTabletsSlot(tabletsGapBlank(), "");
  paintTabletsHud();
  tabletsPlayScribeTick(0);
  if(typeof toast === "function") toast("Hint · the word begins with " + need.charAt(0).toUpperCase());
  return true;
}
function tabletsUnlockGrid(){
  const grid = $("tablets-grid");
  if(grid) grid.classList.remove("locked");
}
function tabletsResetBlankAids(){
  R.tabletOpts = null;
  R.tabletGrey = [];
  R.tabletWinnow = [];
  R.tabletTyped = "";
  R.tabletTypedHit = false;
  R.tabletGrade = null;
  R.tabletHintedIdx = -1;
  R.tabletHintUsed = false;
  R.tabletWinnowIdx = -1;
  R.tabletHeartT = 0;
  R.tabletWarned = false;
  R.tabletBlankStart = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
}
/* P3: the chapter's last step. Returns true when the run is over; an Endless run reads on instead. */
function tabletsChapterDone(){
  if(R.tabletTutorial){ finishTabletsTutorial(); return true; }
  if(R.tabletMode === "endless"){ tabletsNextReading(); return false; }
  if(R.tabletReviewing) tabletsFinishReview();
  else if(tabletsStartReview()) return false;
  if(typeof endRun === "function") endRun("complete");
  return true;
}
function tabletsFinishResolve(ok){
  if(!R || R.ended || R.mode !== "tablets" || !R.tabletResolving) return;
  R.tabletResolving = false;
  /* F4: in the review a missed line is shown, not retried: the review moves on either way. */
  if(!ok && !R.tabletReviewing){
    if(R.tabletTutorial || !R.tabletLampOut){
      tabletsResetBlankAids();
      tabletsUnlockGrid();
      paintTabletsHud();
      paintTabletsTablet();
      paintTabletsTray();
      return;
    }
    if(typeof endRun === "function") endRun("death");
    return;
  }
  /* A carved gap advances within the step; only a finished step moves the
     stone-setting forward. Each gap re-arms the tray and the sand. */
  const step = tabletsStepBlanks();
  R.gapIdx = (R.gapIdx || 0) + 1;
  if(R.gapIdx >= step.length){
    R.tabletIdx++;
    R.gapIdx = 0;
  }
  tabletsResetBlankAids();
  if(R.tabletIdx >= ((R && R.tabletSteps) || []).length && tabletsChapterDone()) return;
  /* FX7: a banked Manna Jar adds its 15 s to the fresh sand, then the bank is spent. */
  R.tabletClockMax = tabletsStepSeconds();
  R.tabletClock = R.tabletClockMax + (R.tabletBankSand || 0);
  R.tabletBankSand = 0;
  tabletsUnlockGrid();
  paintTabletsHud();
  paintTabletsTablet();
  paintTabletsTray();
  tabletsAnnounceQuicken();
}
function tabletsBurnSand(dt){
  /* FX1: the sand waits out a resolve window, so a Last grain is not lost to the hit's 1 s hold. */
  if(!R || R.ended || R.tabletResolving || tabletsUntimed()) return;
  /* F1: Freeze stops the sand; Selah slows it to 0.06. */
  R.tabletClock = Math.max(0, (R.tabletClock || 0) - dt * tabletsSandScale());
  /* S1: one warning per blank as the line enters the danger band (the reference's 70%). */
  if(tabletsDangerLevel() > 0 && !R.tabletWarned){
    R.tabletWarned = true;
    tabletsPlayDangerWarn();
  }
  if(R.tabletClock > 0) return;
  /* S1: the tutorial cannot fail; its sand refills. */
  if(R.tabletTutorial){ R.tabletClock = R.tabletClockMax || tabletsClockMax(); return; }
  /* S3: the line at The Mark is a miss (a lamp and the push back); only the last lamp, or Judgment, ends the run. */
  tabletsResolve(false);
  R.tabletTimeout = !!R.tabletLampOut;
}
function tabletsTickFreeze(dt){
  if(!R.freezeOn) return;
  R.freezeLeft = (R.freezeLeft || 0) - dt;
  if(R.freezeLeft > 0) return;
  R.freezeOn = false;
  R.freeze = 0;
  R.freezeLeft = 0;
}
function tabletsTick(now){
  if(!R || R.ended || R.paused || R.mode !== "tablets" || !R.tabletRacing) return;
  const dt = Math.min((now - (R.tabletLast || now)) / 1000, 0.1);
  R.tabletLast = now;
  R.tabletFrameDt = dt;
  /* E: the world holds its breath after a carve (30/55/85 ms). */
  if(R.tabletHitstop > 0){
    R.tabletHitstop = Math.max(0, R.tabletHitstop - dt * 1000);
    R.tabletRaf = requestAnimationFrame(tabletsTick);
    return;
  }
  if(R.freezeOn) tabletsTickFreeze(dt);
  tabletsBurnSand(dt);
  if((R.selahLeft || 0) > 0){
    R.selahLeft = Math.max(0, R.selahLeft - dt);
    if(R.selahLeft === 0) paintTabletsPowers();
  }
  if(R.ended) return;
  tabletsHeartbeat(dt);
  tabletsTickTrauma(dt);
  drawTabletsFx(dt);
  paintTabletsClock();
  const ladderMarker = $("tablets-ladder-marker");
  if(ladderMarker) ladderMarker.style.top = tabletsLadderTop(tabletsRiseOf()).toFixed(2) + "%";
  paintTabletsFreeze();
  R.tabletRaf = requestAnimationFrame(tabletsTick);
}
/* P3: an Endless run reads the chapter again; the reading names count the passes. */
const TABLET_READINGS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
function tabletsReadingName(n){
  const word = TABLET_READINGS[n - 1];
  return word ? word + " reading" : "Reading " + n;
}
/* S1: every blank's sand is the speed's base, ramped by the words carved and the streak (the rules' blankSeconds). */
function tabletsStepSeconds(){
  if(R && R.tabletReviewing) return Tablets.clockS("meditative");
  return Tablets.rules.blankSeconds(tabletsClockMax(), R.correct || 0, R.streak || 0, tabletsGoldenAt(R.tabletIdx));
}
/* R3: the golden verses are the reference's (chapters.ts isGoldenTrial), found here by verse and blank index.
   Matthew 6:13 and Isaiah 40:29 have no blank in this game's chapters, so 19 of its 21 carry over. The tutorial
   has none. A golden blank pays double Favor and runs on 0.9 of the sand. */
const TABLET_GOLDEN = {
  psalm23:[3, 5, 10], proverbs3:[0, 2], matthew6:[3], psalm91:[1, 5, 11], corinthians13:[1, 4, 7],
  john1:[0, 4], isaiah40:[6, 7], romans8:[6, 7, 9]
};
function tabletsGoldenAt(idx){
  if(!R || R.tabletTutorial || R.tabletReviewing) return false;
  const list = TABLET_GOLDEN[R.tabletChapter || "psalm23"];
  return !!list && list.indexOf(idx | 0) >= 0;
}
/* P3: finishing a reading Holds the chapter; the same words come round again on shorter sand. */
function tabletsNextReading(){
  R.tabletEndlessHeld = true;
  R.tabletPass = (R.tabletPass || 1) + 1;
  R.tabletIdx = 0;
  R.gapIdx = 0;
  /* P7: each reading starts steady and quickens again in its last third. */
  R.tabletQuickAnnounced = false;
  spawnTabletsScorePopup(tabletsReadingName(R.tabletPass), $("tablets-slot"));
}
/* P2: the footer names the lamps this run really has. */
const TABLET_MODE_NOTES = {
  hold: "Three lamps guard the Hold",
  judgment: "One lamp guards the Hold",
  endless: "Three lamps · the chapter reads again"
};
function tabletsPaintModeNote(){
  const el = $("tablets-hold-note");
  if(!el) return;
  if(R.tabletReviewing){ el.textContent = "Review · the lines you missed · no lamp at stake"; return; }
  const mode = R.tabletTutorial ? "hold" : R.tabletMode;
  el.textContent = TABLET_MODE_NOTES[mode] || TABLET_MODE_NOTES.hold;
}
function startTabletsLoop(){
  stopTabletsLoop();
  /* FX6: each run takes a new token; a finish timer from an earlier run sees the change and stands down. */
  R.tabletRunToken = (R.tabletRunToken || 0) + 1;
  const ch = tabletsChapter();
  R.tabletIdx = 0;
  R.gapIdx = 0;
  R.tabletSteps = tabletsBuildSteps(ch, 1);
  /* P7: the pace reads the step count, so it is set before the first sand. */
  R.tabletTotal = R.tabletSteps.length;
  R.tabletClock = tabletsStepSeconds();
  R.tabletClockMax = R.tabletClock;
  R.tabletPass = 1;
  /* R1: the first paint of a run snaps the roll. */
  R.tabletRollSnap = true;
  R.tabletRollY = 0;
  R.tabletEndlessHeld = false;
  R.tabletTimeout = false;
  R.tabletMiss = 0;
  R.tabletLives = Tablets.rules.lampsFor(R.tabletMode);
  R.tabletLampOut = false;
  R.tabletResolving = false;
  /* FX11: a new run starts with no hitstop, no milestone banner and no banked Manna sand. */
  R.tabletHitstop = 0;
  R.tabletBankSand = 0;
  clearTimeout(R.tabletMilestoneTimer);
  const banner = $("tablets-milestone");
  if(banner) banner.classList.remove("active");
  R.favor = 0;
  R.freeze = 0;
  R.freezeOn = false;
  R.freezeLeft = 0;
  R.selahLeft = 0;
  R.tabletWard = false;
  R.tabletQuickAnnounced = false;
  R.tabletMissed = [];
  R.tabletReviewing = false;
  R.tabletReviewKept = 0;
  R.tabletReviewTotal = 0;
  R.tabletChapterSteps = null;
  R.trauma = 0;
  tabletsResetBlankAids();
  R.tabletTotal = R.tabletSteps.length;
  R.qTotal = ch.blanks.length;
  R.tabletRacing = true;
  R.paused = false;
  R.streak = 0;
  const ov = $("tablets-pause");
  if(ov){ ov.hidden = true; ov.classList.remove("on"); }
  paintTabletsHud();
  paintTabletsTablet();
  paintTabletsTray();
  tabletsPaintModeNote();
  R.tabletLast = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  if(typeof requestAnimationFrame === "function") R.tabletRaf = requestAnimationFrame(tabletsTick);
}
function tabletsPulseSpeech(){
  const el = $("tablets-speech");
  if(!el || tabletsReduced()) return;
  el.hidden = false;
  el.classList.add("active");
  clearTimeout(el._t);
  el._t = setTimeout(function(){ el.classList.remove("active"); el.hidden = true; }, 2000);
}
/* P7: one pace chip replaces the six speed pills: it names the pace the sand runs at now. */
function paintTabletsPace(){
  const chip = $("tablets-pace");
  if(!chip) return;
  const pace = tabletsSpeed();
  const quick = tabletsQuickened();
  chip.textContent = pace.label + (quick ? " · quickened" : (tabletsGentle() ? " · gentle" : ""));
  chip.classList.toggle("quick", quick);
  const stage = $("tablets-stage");
  if(stage) stage.classList.toggle("quick", quick);
}
/* P7: the step into the last third announces itself once per reading. */
function tabletsAnnounceQuicken(){
  if(!tabletsQuickened() || R.tabletQuickAnnounced) return false;
  R.tabletQuickAnnounced = true;
  spawnTabletsScorePopup("The pace quickens · " + tabletsSpeed().label, $("tablets-slot"));
  tabletsFlash("gold", true);
  if(typeof Director !== "undefined" && Director.speak) Director.speak("The pace quickens.", true);
  return true;
}
function tabletsBindOnce(id, fn){
  const el = $(id);
  if(el && !el._bound){
    el._bound = true;
    el.addEventListener("click", fn);
  }
}
function bindTabletsChrome(){
  const slot = $("tablets-slot");
  if(slot && !slot._dropBound){
    slot._dropBound = true;
    slot.addEventListener("dragover", function(e){
      if(e.preventDefault) e.preventDefault();
      slot.classList.add("drag-over");
    });
    slot.addEventListener("dragleave", function(){ slot.classList.remove("drag-over"); });
    slot.addEventListener("drop", function(e){
      if(e.preventDefault) e.preventDefault();
      slot.classList.remove("drag-over");
      let word = "";
      try{ word = e.dataTransfer.getData("text/plain") || ""; }catch(err){}
      if(word) tabletsPick(word);
    });
  }
  tabletsBindOnce("tablets-quit", function(){
    if(typeof quitTablets === "function") quitTablets();
    else if(typeof abandonRun === "function") abandonRun();
  });
  tabletsBindOnce("tablets-pause-btn", function(){ toggleTabletsPause(); });
  tabletsBindOnce("tablets-resume", function(){ setTabletsPaused(false); });
  tabletsBindOnce("tablets-pause-quit", function(){
    if(typeof quitTablets === "function") quitTablets(true);
  });
  tabletsBindOnce("tablets-illum", tabletsIlluminate);
  tabletsBindOnce("tablets-winnow", tabletsWinnow);
  tabletsBindOnce("tablets-selah", tabletsSelah);
  tabletsBindOnce("tablets-hint", tabletsHint);
  tabletsBindOnce("tablets-freeze", tabletsFreeze);
  tabletsBindOnce("tablets-theme", tabletsCycleStone);
  if(typeof window !== "undefined" && !window._tabletsKeys){
    window._tabletsKeys = true;
    window.addEventListener("keydown", tabletsOnKey);
    window.addEventListener("resize", tabletsOnResize);
  }
}
/* The word being carved, lower-cased, letters only: a space or an
   apostrophe ("All hail", "eagle's") is not typed. */
function tabletsNeedWord(){
  const blank = tabletsGapBlank();
  return blank ? String(blank.a || "").toLowerCase().replace(/[^a-z]/g, "") : "";
}
/* A power key fires only while nothing is typed and the word cannot start
   with that letter; otherwise the letter is typing. */
function tabletsPowerKey(k){
  if((R && R.tabletTyped) || (k !== "i" && k !== "w" && k !== "s" && k !== "h")) return false;
  const need = tabletsNeedWord();
  if(k === need.charAt(0)) return false;
  /* Freeze fires on its own, so S belongs to Selah. */
  if(k === "i") tabletsIlluminate();
  else if(k === "w") tabletsWinnow();
  else if(k === "h") tabletsHint();
  else tabletsSelah();
  return true;
}
/* A wrong letter is ignored. It is not a miss. 1-6 pick a tablet; letters
   type the word; Backspace takes the last letter back. */
function tabletsTypeKey(k){
  const blank = tabletsGapBlank();
  const need = tabletsNeedWord();
  const typed = (R && R.tabletTyped) || "";
  if(k === "backspace"){
    R.tabletTyped = typed.slice(0, -1);
    paintTabletsSlot(blank, "");
    return true;
  }
  if(k.length !== 1 || k < "a" || k > "z") return false;
  if(need.indexOf(typed + k) !== 0) return true;
  R.tabletTyped = typed + k;
  tabletsPlayScribeTick(typed.length / Math.max(1, need.length));
  paintTabletsSlot(blank, "");
  paintTabletsHintBtn();
  if(R.tabletTyped === need && !R.tabletResolving){
    R.tabletTypedHit = !R.tabletHintUsed;
    tabletsResolve(true);
  }
  return true;
}
/* FX4: chords, keys a field or an overlay already took, and held letters or digits are not ours. */
function tabletsKeyIgnored(e, k){
  if(e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return true;
  if(e.repeat && /^[a-z0-9]$/.test(k)) return true;
  const el = (e.target && e.target.tagName) ? e.target : document.activeElement;
  return !!(el && (/input|select|textarea/i.test(el.tagName) || el.isContentEditable));
}
function tabletsOnKey(e){
  if(typeof currentView === "undefined" || currentView !== "tablets") return;
  if(!R || R.ended || R.mode !== "tablets") return;
  const k = (e.key || "").toLowerCase();
  if(tabletsKeyIgnored(e, k)) return;
  if(R.paused){
    if(k === "enter" || k === " "){ e.preventDefault(); setTabletsPaused(false); }
    return;
  }
  if(tabletsPowerKey(k)){ e.preventDefault(); return; }
  const n = parseInt(e.key, 10);
  if(n >= 1 && n <= 6){
    const btn = tabletsStoneButtons()[n - 1];
    if(btn && !btn.disabled) tabletsPick(btn.dataset.word);
    return;
  }
  if(tabletsTypeKey(k)) e.preventDefault();
}
function tabletsOnResize(){
  if(typeof currentView !== "undefined" && currentView === "tablets") tabletsFxSize();
}
/* The start line names the lamps the run really has (it said "Two lamps" after the run moved to three). */
function tabletsLampWords(n){
  const words = { 1:"One lamp", 2:"Two lamps", 3:"Three lamps", 4:"Four lamps" };
  return words[n] || (n + " lamps");
}
function tabletsSpeakStart(){
  if(!(typeof Director !== "undefined" && Director.speak)) return;
  if(R.tabletTutorial) Director.speak("Learn the Hold. Choose the missing word.", true);
  else Director.speak("Carve the missing word. " + tabletsLampWords(R.tabletLives || 1) + " guard the tablet.", true);
}
function startTabletsStage(){
  bindTabletsChrome();
  tabletsApplyStone((typeof SAVE !== "undefined" && SAVE.set && SAVE.set.tabletStone) || "sandstone");
  tabletsFxInit();
  const ch = tabletsChapter();
  const site = tabletsParentSite();
  if($("hud-round")) $("hud-round").textContent = ch.name;
  if(typeof Snd !== "undefined"){
    if(Snd.stopBeds) Snd.stopBeds();
    if(Snd.ambience) Snd.ambience("indigo");
  }
  if(site && typeof Backdrop !== "undefined" && Backdrop.palette && typeof Pilgrimage !== "undefined"){
    const arc = Pilgrimage.arc ? Pilgrimage.arc(site.arc) : null;
    Backdrop.palette((arc && arc.pal) || "act2");
  }
  go("tablets");
  if(typeof applySiteSky === "function") applySiteSky(site ? site.id : null);
  startTabletsLoop();
  tabletsSpeakStart();
}
/* F1: the Freeze meter fills as you carve; at 100 it fires on its own and stops the sand for 5 s. */
const TABLET_FREEZE_S = 5;
function tabletsIgniteFreeze(){
  if(!R || R.ended || R.paused || R.mode !== "tablets" || R.tabletTutorial) return false;
  if((R.freeze || 0) < 100 || R.freezeOn) return false;
  R.freezeOn = true;
  R.freezeLeft = TABLET_FREEZE_S;
  tabletsPlayGoldChime();
  const slot = $("tablets-slot");
  const r = (slot && slot.getBoundingClientRect) ? slot.getBoundingClientRect() : null;
  spawnTabletsSparks(r ? r.left + r.width / 2 : 0, r ? r.top + r.height / 2 : 0, 24, "170,220,255");
  if(typeof Director !== "undefined" && Director.speak) Director.speak("Freeze. The sand stands still.", true);
  paintTabletsFreeze();
  paintTabletsHud();
  return true;
}
function tabletsFreeze(){
  tabletsIgniteFreeze();
}
function tabletsRollBlessing(){
  if(Math.random() >= 0.22) return;
  const picks = [
    { icon:"🏺", text:"Manna Jar Discovered (+15s Sand)", apply:function(){
      /* FX7: the jar banks its 15 s for the next step; the re-arm adds it to the fresh sand. */
      R.tabletBankSand = 15;
    } },
    { icon:"🕯️", text:"Golden Censer (+1 Lamp Restored)", apply:function(){ if((R.tabletMiss || 0) > 0) R.tabletMiss -= 1; } },
    { icon:"✨", text:"Shekinah Glory (+35% Freeze Charge)", apply:function(){ R.freeze = Math.min(100, (R.freeze || 0) + 35); tabletsIgniteFreeze(); } }
  ];
  /* P2: in Judgment the Censer leaves the pool, so the HUD never shows a lamp the run cannot use. FX8: with every lamp
     lit the Censer has nothing to relight, so it leaves the pool too. */
  const lampOut = (R.tabletMiss || 0) > 0;
  const pool = picks.filter(function(p){ return p.text.indexOf("Golden Censer") < 0 || (lampOut && R.tabletMode !== "judgment"); });
  const b = pool[Math.floor(Math.random() * pool.length)];
  b.apply();
  const el = $("tablets-blessing");
  const icon = $("tablets-blessing-icon");
  const text = $("tablets-blessing-text");
  if(icon) icon.textContent = b.icon;
  if(text) text.textContent = b.text;
  if(el){
    el.classList.add("active");
    setTimeout(function(){ try{ el.classList.remove("active"); }catch(e){} }, 2800);
  }
  paintTabletsClock();
  paintTabletsPowers();
  paintTabletsFreeze();
}
const TABLET_STONES = ["sandstone", "basalt", "limestone", "lapis"];
const TABLET_STONE_NAMES = {
  sandstone:"Sinai Sandstone",
  basalt:"Horeb Basalt",
  limestone:"Jerusalem Limestone",
  lapis:"Sanctuary Lapis"
};
function tabletsApplyStone(name){
  const el = $("v-tablets");
  if(!el) return;
  TABLET_STONES.forEach(function(s){ el.classList.remove("stone-" + s); });
  if(name && name !== "sandstone") el.classList.add("stone-" + name);
}
function tabletsCycleStone(){
  const cur = (typeof SAVE !== "undefined" && SAVE.set && SAVE.set.tabletStone) || "sandstone";
  const i = Math.max(0, TABLET_STONES.indexOf(cur));
  const next = TABLET_STONES[(i + 1) % TABLET_STONES.length];
  if(typeof SAVE !== "undefined" && SAVE.set){
    SAVE.set.tabletStone = next;
    if(typeof persist === "function") persist();
  }
  tabletsApplyStone(next);
  if(typeof toast === "function") toast("Stone · " + (TABLET_STONE_NAMES[next] || next));
}
var tabletsFx = { ctx:null, canvas:null, embers:[], sparks:[], rings:[], beams:[], w:0, h:0 };
function tabletsFxSize(){
  const canvas = tabletsFx.canvas || $("tablets-fx");
  const stage = $("tablets-stage");
  if(!canvas || !stage) return;
  tabletsFx.canvas = canvas;
  tabletsFx.w = canvas.width = stage.clientWidth || 800;
  tabletsFx.h = canvas.height = stage.clientHeight || 450;
}
function tabletsFxInit(){
  tabletsFx.ctx = null;
  tabletsFx.embers = [];
  tabletsFx.sparks = [];
  tabletsFx.rings = [];
  tabletsFx.beams = [];
  if(tabletsReduced()) return;
  const canvas = $("tablets-fx");
  if(!canvas || typeof canvas.getContext !== "function") return;
  let ctx = null;
  try{ ctx = canvas.getContext("2d"); }catch(e){ return; }
  if(!ctx) return;
  tabletsFx.canvas = canvas;
  tabletsFx.ctx = ctx;
  tabletsFxSize();
  let i = 0;
  for(; i < 8; i++) tabletsFx.embers.push(tabletsFxMakeEmber(true));
}
function tabletsFxMakeEmber(randomY){
  return {
    x: Math.random() * (tabletsFx.w || 800),
    y: randomY ? Math.random() * (tabletsFx.h || 450) : (tabletsFx.h || 450) + 15,
    vx: (Math.random() - 0.5) * 0.7,
    vy: -(0.5 + Math.random() * 1.1),
    size: 1 + Math.random() * 2.2,
    life: 0,
    max: 180 + Math.random() * 140
  };
}
function spawnTabletsSparks(x, y, count, color){
  if(!tabletsFx.ctx || tabletsReduced()) return;
  const n = count || 16;
  let i = 0;
  for(; i < n; i++){
    const a = Math.random() * Math.PI * 2;
    const sp = 2 + Math.random() * 5;
    tabletsFx.sparks.push({
      x: x || tabletsFx.w / 2, y: y || tabletsFx.h * 0.45,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5,
      size: 1.5 + Math.random() * 2.5, life: 1, decay: 0.03,
      color: color || "255,225,130"
    });
  }
}
/* A: a one-shot conduit beam — energy flowing from the engraved slot toward a
   relic card. The end point is clamped to the stage, which is where the canvas
   ends; the beam dissolves before the tray. */
function spawnTabletsBeam(x1, y1, x2, y2){
  if(!tabletsFx.ctx || tabletsReduced()) return;
  tabletsFx.beams.push({
    x1:x1, y1:y1,
    x2:x2, y2:Math.min(y2, (tabletsFx.h || 450) - 8),
    life:1, decay:0.05
  });
}
/* S4: a carve throws one expanding ring from the engraved slot. */
function spawnTabletsRing(x, y, color){
  if(!tabletsFx.ctx || tabletsReduced()) return;
  tabletsFx.rings.push({ x:x, y:y, life:1, decay:0.035, color:color || "255,225,130" });
}
function drawTabletsFx(dt){
  const ctx = tabletsFx.ctx;
  if(!ctx) return;
  /* R4: the canvas is sized before the view is shown (0 x 0), so it follows the laid-out stage from the first frame. */
  const stage = $("tablets-stage");
  if(stage && stage.clientWidth > 0 && (stage.clientWidth !== tabletsFx.w || stage.clientHeight !== tabletsFx.h)) tabletsFxSize();
  const w = tabletsFx.w;
  const h = tabletsFx.h;
  ctx.clearRect(0, 0, w, h);
  /* FX5: in the last 30% of the climb the embers rest; the danger wash and the sparks still draw and age. */
  const late = !!(typeof R !== "undefined" && R) && tabletsDangerLevel() > 0;
  drawTabletsDanger(ctx, w, h);
  (late ? [] : tabletsFx.embers).forEach(function(p){
    p.x += p.vx * (dt * 60);
    p.y += p.vy * (dt * 60);
    p.life += dt * 60;
    if(p.life >= p.max || p.y < -10){
      const n = tabletsFxMakeEmber(false);
      p.x = n.x; p.y = n.y; p.vx = n.vx; p.vy = n.vy; p.size = n.size; p.life = 0; p.max = n.max;
    }
    const a = Math.sin((p.life / p.max) * Math.PI) * tabletsEmberAlpha(!!R.freezeOn);
    ctx.fillStyle = "hsla(42,95%,65%," + a + ")";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  for(let i = tabletsFx.rings.length - 1; i >= 0; i--){
    const r = tabletsFx.rings[i];
    r.life -= r.decay * (dt * 60);
    if(r.life <= 0){ tabletsFx.rings.splice(i, 1); continue; }
    const rad = (1 - r.life) * 72;
    ctx.strokeStyle = "rgba(" + r.color + "," + r.life.toFixed(3) + ")";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);
    ctx.stroke();
  }
  for(let i = tabletsFx.beams.length - 1; i >= 0; i--){
    const b = tabletsFx.beams[i];
    b.life -= b.decay * (dt * 60);
    if(b.life <= 0){ tabletsFx.beams.splice(i, 1); continue; }
    const mx = (b.x1 + b.x2) / 2, my = (b.y1 + b.y2) / 2 - 40;
    ctx.strokeStyle = "rgba(255,236,170," + (b.life * 0.85).toFixed(3) + ")";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.quadraticCurveTo(mx, my, b.x2, b.y2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255," + (b.life * 0.9).toFixed(3) + ")";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for(let i = tabletsFx.sparks.length - 1; i >= 0; i--){
    const s = tabletsFx.sparks[i];
    s.x += s.vx * (dt * 60);
    s.y += s.vy * (dt * 60);
    s.vy += 0.15;
    s.life -= s.decay * (dt * 60);
    if(s.life <= 0){ tabletsFx.sparks.splice(i, 1); continue; }
    ctx.fillStyle = "rgba(" + (s.color || "255,225,130") + "," + s.life + ")";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
function tabletsFlyWord(fromBtn, toSlot, text, done){
  function land(){
    if(done) done();
  }
  if(!text){ land(); return; }
  if(tabletsReduced() || !fromBtn || !toSlot || !fromBtn.getBoundingClientRect){
    land();
    return;
  }
  const start = fromBtn.getBoundingClientRect();
  const target = toSlot.getBoundingClientRect();
  if(!start.width || (start.left === target.left && start.top === target.top)){
    land();
    return;
  }
  const flyer = document.createElement("div");
  flyer.className = "tablets-flying-word";
  flyer.textContent = text;
  flyer.style.left = (start.left + start.width / 2) + "px";
  flyer.style.top = (start.top + start.height / 2) + "px";
  document.body.appendChild(flyer);
  spawnTabletsSparks(start.left + start.width / 2, start.top + start.height / 2, 10);
  requestAnimationFrame(function(){
    flyer.style.left = (target.left + target.width / 2) + "px";
    flyer.style.top = (target.top + target.height / 2) + "px";
    flyer.style.transform = "translate(-50%,-50%) scale(1.15)";
  });
  setTimeout(function(){
    spawnTabletsSparks(target.left + target.width / 2, target.top + target.height / 2, 16);
    try{ flyer.remove(); }catch(e){}
    land();
  }, 460);
}
if(typeof window !== "undefined"){
  window.finishTabletsTutorial = finishTabletsTutorial;
  window.startTabletsStage = startTabletsStage;
  window.stopTabletsLoop = stopTabletsLoop;
  window.tabletsResolve = tabletsResolve;
  window.tabletsFinishResolve = tabletsFinishResolve;
  window.tabletsPick = tabletsPick;
  window.tabletsIlluminate = tabletsIlluminate;
  window.tabletsWinnow = tabletsWinnow;
  window.toggleTabletsPause = toggleTabletsPause;
  window.setTabletsPaused = setTabletsPaused;
  window.tabletsBurnSand = tabletsBurnSand;
  window.tabletsFreeze = tabletsFreeze;
  window.tabletsCycleStone = tabletsCycleStone;
  window.tabletsPaceSummary = tabletsPaceSummary;
  window.tabletsSpeed = tabletsSpeed;
  window.tabletsRollBlessing = tabletsRollBlessing;
  window.tabletsTier = tabletsTier;
  window.paintTabletsHud = paintTabletsHud;
  window.paintTabletsTablet = paintTabletsTablet;
  window.paintTabletsStage = paintTabletsStage;
  window.tabletsRiseOf = tabletsRiseOf;
  window.tabletsSelah = tabletsSelah;
  window.tabletsHint = tabletsHint;
  window.tabletsGapBlank = tabletsGapBlank;
  window.tabletsGreyWords = tabletsGreyWords;
}
