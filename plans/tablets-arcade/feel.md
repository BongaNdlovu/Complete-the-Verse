# Plan: Word Tablets feel phase (feedback beyond the arcade)

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
The user asked for a feedback loop beyond the arcade download and beyond phase E (decision F1, 2026-11-03): carve impact, a combo meter, danger & miss weight, and a Hold-finish moment. While measuring, the executor found the three Word Tablets tones (gold chime, danger warn, scribe tick) have never sounded: they wait on Snd.ctx, which js/audio.js does not export (`sources/silent-tones.txt`). Every suite passes today, so there is no failing target; 14 mutations prove the new tests (M14 added after the first browser check showed the combo meter painting a carve behind). End state: 19 edits applied to 6 files (section 7), every other file byte-identical.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| S0 | The tablets tones are silent | they gate on Snd.ctx, which Snd does not export | Real bug | `Snd.sfxBus()`; the tones play through the sfx gain (so mute and volume apply) |
| G1 | A carve lands the same at every grade | one carve sound, no grade colour, no grade kick | Decision F1 | a burst in the grade's colour, a camera kick by grade, a carve note rising a pentatonic step per streak |
| G2 | The combo is a number only | the tier pill shows the multiplier | Decision F1 | a combo meter filling toward x5 (warm from streak 8, blaze at 15), a pop on each step, a crack and a low tone when a miss breaks it |
| G3 | The last seconds and a lost lamp feel light | the danger hum only | Decision F1 | a heartbeat from half danger, quickening 0.95 s to 0.45 s; the seal that goes dark snuffs with smoke and a crackle, the last with a thud |
| G4 | Finishing a Hold has no moment of its own | the results arrive | Decision F1 | the carve that completes the chapter sweeps gold down the sheet, lights the seals and plays a chord |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `js/audio.js`, `js/tablets-run.js`, `css/tablets.css`, `index.html`, `test/tablets.test.js`, `test/motion.test.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1186 files stay byte-identical. No file is added or deleted.
- **Invariants:** the rules module, the Favor formula, the step flow, the sand burn (with the fix PR's resolve gate), typing and the fix PR's key filter stay byte-identical.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 14 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `5e62c0371248716409ee20d220f44274a8275d95e39b48913ade26d1504d68bc`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 6 file(s) change (`css/tablets.css`, `index.html`, `js/audio.js`, `js/tablets-run.js`, `test/motion.test.js`, `test/tablets.test.js`) and 1186 stay identical.
- **What it entails.**
- **What is in it.**
- **How it connects with the plan:** each edit → its goal → the tests that must pass → its mutations.

**Stop and ask** if:
- the verdict isn't READY;
- an edit or goal isn't linked;
- the code doesn't match this plan;
- this document and `edits.js` disagree;
- the change affects something not mentioned here.

Otherwise, continue to section 5 without waiting. ALREADY APPLIED: run `gate.js post` and report; don't re-apply.

## 5. Steps (from `C:\Users\fanel\Downloads\ctv-push`)
```bash
sha256sum fix-plan/gate.js fix-plan/expected.json   # must match rule 5
node fix-plan/gate.js pre     # required: RESULT: PASS (29/29 checks passed, mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 19 edits to 6 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (45/45 checks passed, mode=post)
```
**On any other output:**
1. Copy each edited file back from `%TEMP%/fix-plan-backup` (`/` in the path is written as `__`).
2. Regenerate.
3. Report FAILED, quoting the `[FAIL]` lines.

What the gate checks (each check's result is in the report JSON it prints):
- **pre:** tooling hashes, a byte-identical baseline, anchors, line endings, invariants, the recorded test results, and
  verified backups.
- **post:**
  - only the planned files changed, each byte-identical to the dry run, with the rest unchanged;
  - invariants and extra checks;
  - fresh regeneration;
  - test tallies, names and statuses;
  - every mutation caught.

After the first FAIL, the gate skips the slow steps (`[SKIP]`), because the RESULT is FAIL anyway.

## 6. The exact change (ground truth: `fix-plan/edits.js`)
### S0a Snd exports a sound bus  (`js/audio.js`, serves S0)

Why: the tablets tones gate on Snd.ctx, which the Snd object never exports, so all three tones are silent; sfxBus hands out the live context and the sfx gain (null when audio is off or muted)

Find (exactly once):

```js
    sfxLevel: sfxOut,
```

Replace with:

```js
    sfxLevel: sfxOut,
    /* S0: the tablets tones ride the sfx bus, so the mute and the sfx level reach them. */
    sfxBus(){
      init();
      if(!ctx||!avail||!mSfx||sfxOut()<=0) return null;
      return { ctx: ctx, out: mSfx };
    },
```

### S0b scribe tick plays through the bus  (`js/tablets-run.js`, serves S0)

Why: the scribe tick gated on Snd.ctx (never set) and connected to ctx.destination; it now asks tabletsAudio() and connects to the sfx gain

Find (exactly once):

```js
/* E: the scribe's chisel ticks upward as the word fills. */
function tabletsPlayScribeTick(progress){
  if(!(typeof Snd !== "undefined" && Snd.ctx)) return;
  try{
    const ctx = Snd.ctx;
    if(ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(392 + Math.min(1, Math.max(0, progress)) * 392, t);
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.09);
  }catch(e){}
}
```

Replace with:

```js
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
```

### S0c gold chime plays through the bus  (`js/tablets-run.js`, serves S0)

Why: the carve chime gated on Snd.ctx (never set) and connected to ctx.destination; it now plays through tabletsAudio() into the sfx gain

Find (exactly once):

```js
function tabletsPlayGoldChime(){
  if(!(typeof Snd !== "undefined" && Snd.ctx)) return;
  try{
    const ctx = Snd.ctx;
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
      g.connect(ctx.destination);
      o.start(t + d);
      o.stop(t + d + 0.55);
    });
  }catch(e){}
}
```

Replace with:

```js
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
```

### S0d danger warn plays through the bus  (`js/tablets-run.js`, serves S0)

Why: the danger warn gated on Snd.ctx (never set) and connected to ctx.destination; it now plays through tabletsAudio() into the sfx gain

Find (exactly once):

```js
function tabletsPlayDangerWarn(){
  if(!(typeof Snd !== "undefined" && Snd.ctx)) return;
  try{
    const ctx = Snd.ctx;
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
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.09);
  }catch(e){}
}
```

Replace with:

```js
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
```

### G-helpers new carve, combo, heartbeat, lamp and finale helpers  (`js/tablets-run.js`, serves G1, G2, G3, G4)

Why: one block of pure helpers and small effects: grade colour and kick, the carve note, the burst, the combo meter, the heartbeat, the lamp sounds, the final-carve predicate and the Hold finale; every visual is gated by tabletsUntimed() or tabletsReduced() The meter repaints at the carve and at the miss (browser check: it lagged one carve, painting only when the step re-armed).

Find (exactly once):

```js
function paintTabletsTutorialCallout(){
```

Replace with:

```js
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
  spawnTabletsSparks(r.left + r.width / 2, r.top + r.height / 2, n, TABLET_GRADE_COLORS[carve.grade] || TABLET_GRADE_COLORS.carved);
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
  const quiet = tabletsUntimed();
  bar.classList.toggle("warm", !quiet && fill >= 0.5);
  bar.classList.toggle("blaze", !quiet && fill >= 1);
}
/* G2: the multiplier pops for 420 ms when a carve climbs the combo; asleep in the tutorial and under reduced motion. */
function tabletsPopMult(){
  const el = $("tablets-mult");
  if(!el || tabletsUntimed()) return;
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
  if(!bar || tabletsUntimed()) return;
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
  if(tabletsUntimed()) return;
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
```

### G3/G4 seal markup takes a smoke index and a glow flag  (`js/tablets-run.js`, serves G3, G4)

Why: tabletsSealsMarkup keeps its signature (its anchor and the Judgment tests read it) and delegates to tabletsSealMarks, which can mark the seal that just went dark and the lit seals at the Hold

Find (exactly once):

```js
function tabletsSealsMarkup(left, total){
  let out = "";
  /* FX9: one seal per lamp the mode starts with (Judgment wears one). */
  for(let i = 0; i < (total || 1); i++){
    out += '<i class="tablets-seal' + (i < left ? "" : " cracked") + '"></i>';
  }
  return out;
}
```

Replace with:

```js
function tabletsSealsMarkup(left, total){
  /* G3/G4: the smoke and the glow ride the seals; the tutorial and reduced motion never show them. */
  const run = (typeof R !== "undefined" && R) || {};
  const quiet = tabletsUntimed();
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
```

### G2 the HUD paints the combo meter  (`js/tablets-run.js`, serves G2)

Why: paintTabletsHud repaints the combo meter with the tier and the streak, so the fill follows the streak

Find (exactly once):

```js
  paintTabletsTier();
  paintTabletsSurge();
```

Replace with:

```js
  paintTabletsTier();
  paintTabletsSurge();
  paintTabletsCombo();
```

### G1 G2 G4 tabletsResolveHit reads the final carve and the old streak  (`js/tablets-run.js`, serves G2, G4)

Why: the final-carve predicate and the old streak are read before the run advances; tabletsFinishResolve (invariant) is untouched

Find (exactly once):

```js
function tabletsResolveHit(){
  R.correct = (R.correct || 0) + 1;
```

Replace with:

```js
function tabletsResolveHit(){
  /* G4: the final carve and the streak before this hit are read before the run moves on. */
  const finalCarve = tabletsIsFinalCarve();
  const oldStreak = R.streak || 0;
  R.correct = (R.correct || 0) + 1;
```

### G1 G2 tabletsResolveHit plays the carve note, kick, burst and combo cue  (`js/tablets-run.js`, serves G1, G2)

Why: every carve sounds its streak-pitched note (tutorial too), kicks by grade, bursts in the grade colour and cues the combo meter

Find (exactly once):

```js
  tabletsCarveHaptic(carve);
  if(carve.milestone) tabletsMilestoneBanner(carve.milestone.streak, favor);
  tabletsReact(true);
```

Replace with:

```js
  tabletsCarveHaptic(carve);
  /* G1: the carve note, the kick and the burst. */
  tabletsPlayCarveNote(oldStreak);
  tabletsCarveKick(carve);
  tabletsCarveBurst(carve);
  /* G2: the combo meter pops when the combo climbs and blazes once per streak. */
  tabletsComboCue(oldStreak, carve.streak);
  if(carve.milestone) tabletsMilestoneBanner(carve.milestone.streak, favor);
  tabletsReact(true);
```

### G4 tabletsResolveHit runs the Hold finale on the final carve  (`js/tablets-run.js`, serves G4)

Why: the final carve plays the chord, sweeps the roll and glows the lit seals during the hit resolve, before the Favor and blessing run

Find (exactly once):

```js
  if(!R.tabletTutorial){
    tabletsRollBlessing();
    tabletsRecharge(carve);
  }
}
```

Replace with:

```js
  if(finalCarve) tabletsHoldFinale();
  if(!R.tabletTutorial){
    tabletsRollBlessing();
    tabletsRecharge(carve);
  }
}
```

### G2 G3 tabletsResolveMiss reads the old streak  (`js/tablets-run.js`, serves G2)

Why: the streak before the miss is kept so the combo break can tell a streak of two or more was lost

Find (exactly once):

```js
function tabletsResolveMiss(){
```

Replace with:

```js
function tabletsResolveMiss(){
  const oldStreak = R.streak || 0;
```

### G3 tabletsResolveMiss marks the dark seal and plays the lamp sound  (`js/tablets-run.js`, serves G3)

Why: a miss that spends a lamp smokes the seal at index cracked.lit for 900 ms, and plays a crackle (the last lamp thuds)

Find (exactly once):

```js
    R.tabletClock = max * (1 - cracked.progress);
    R.streak = 0;
```

Replace with:

```js
    R.tabletClock = max * (1 - cracked.progress);
    /* G3: the seal that just went dark is the one at index cracked.lit; it smokes for 900 ms. */
    const spent = cracked.lit < lit;
    R.tabletSnuffAt = spent ? cracked.lit : -1;
    if(spent) setTimeout(function(){ R.tabletSnuffAt = -1; }, 900);
    tabletsLampFx(spent, cracked.lit);
    R.streak = 0;
```

### G2 tabletsResolveMiss breaks the combo  (`js/tablets-run.js`, serves G2)

Why: a miss that breaks a streak of 2 or more plays the break tone and cracks the meter

Find (exactly once):

```js
  if(picked) picked.classList.add("shatter");
  paintTabletsHud();
```

Replace with:

```js
  if(picked) picked.classList.add("shatter");
  tabletsComboBreak(oldStreak);
  paintTabletsHud();
```

### G3 the heartbeat runs on the tick, after the hitstop  (`js/tablets-run.js`, serves G3)

Why: the heartbeat is driven from tabletsTick (not from tabletsBurnSand, an invariant), after the hitstop hold

Find (exactly once):

```js
  tabletsTickTrauma(dt);
  drawTabletsFx(dt);
```

Replace with:

```js
  tabletsHeartbeat(dt);
  tabletsTickTrauma(dt);
  drawTabletsFx(dt);
```

### G3 the heart timer resets with each gap  (`js/tablets-run.js`, serves G3)

Why: the heart timer starts afresh on each new gap or step, so a carve never leaves a stale beat to fire

Find (exactly once):

```js
  R.tabletWinnowIdx = -1;
```

Replace with:

```js
  R.tabletWinnowIdx = -1;
  R.tabletHeartT = 0;
```

### G2 the combo meter in the header  (`index.html`, serves G2)

Why: the combo meter sits in the header beside the tier pill, aria-hidden, as the spec asks

Find (exactly once):

```html
          <span class="tablets-mult" id="tablets-mult">1.0×</span>
        </div>
```

Replace with:

```html
          <span class="tablets-mult" id="tablets-mult">1.0×</span>
        </div>
        <div class="tablets-combo" id="tablets-combo" aria-hidden="true"><i class="tablets-combo-fill" id="tablets-combo-fill"></i></div>
```

### G2 G3 G4 styles and the reduced-motion list  (`css/tablets.css`, serves G2, G3, G4)

Why: the combo bar, the multiplier pop, the break, the lamp smoke, the gold sweep and the glow; every new animated selector sits in the reduced and motion-calm list

Find (exactly once):

```css
body.motion-calm .tablets-relic-pill{animation:none;transition:none}
```

Replace with:

```css
body.motion-calm .tablets-relic-pill{animation:none;transition:none}
body.reduced .tablets-mult.pop,body.motion-calm .tablets-mult.pop,
body.reduced .tablets-combo.broke,body.motion-calm .tablets-combo.broke,
body.reduced .tablets-combo-fill,body.motion-calm .tablets-combo-fill{animation:none;transition:none}
body.reduced .tablets-seal.snuff::after,body.motion-calm .tablets-seal.snuff::after,
body.reduced .tablets-roll.hold-sweep::after,body.motion-calm .tablets-roll.hold-sweep::after{display:none}
body.reduced .tablets-combo.blaze,body.motion-calm .tablets-combo.blaze,
body.reduced .tablets-seal.glory,body.motion-calm .tablets-seal.glory{box-shadow:none}
/* G2: the combo meter sits beside the tier pill and fills toward x5. */
.tablets-combo{position:relative;flex:0 0 auto;align-self:center;width:58px;height:6px;border-radius:999px;background:rgba(20,12,6,.85);border:1px solid #735322;overflow:hidden}
.tablets-combo-fill{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,#8a5e1c,#e8c46a);transition:width .25s ease-out}
.tablets-combo.warm .tablets-combo-fill{background:linear-gradient(90deg,#e8c46a,#fff0b8)}
.tablets-combo.blaze{box-shadow:0 0 10px rgba(255,214,120,.75)}
.tablets-combo.broke{animation:tabletsComboBreak .52s ease-out}
@keyframes tabletsComboBreak{0%{background:rgba(255,90,80,.55)}100%{background:rgba(20,12,6,.85)}}
.tablets-mult.pop{animation:tabletsMultPop .42s ease-out}
@keyframes tabletsMultPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
/* G3: the lamp that goes out leaves a wisp of smoke from its seal. */
.tablets-seal.snuff{position:relative}
.tablets-seal.snuff::after{content:"";position:absolute;left:50%;bottom:100%;width:6px;height:10px;margin-left:-3px;border-radius:50%;background:rgba(210,210,210,.55);filter:blur(2px);pointer-events:none;animation:tabletsSnuffWisp .9s ease-out forwards}
@keyframes tabletsSnuffWisp{0%{opacity:.7;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-18px) scale(1.6)}}
/* G4: the Hold's finish sweeps gold under the verse; the lit seals glow. */
.tablets-roll.hold-sweep{isolation:isolate}
.tablets-roll.hold-sweep::after{content:"";position:absolute;left:0;right:0;top:0;bottom:0;z-index:-1;pointer-events:none;opacity:.22;background:linear-gradient(180deg,rgba(255,224,130,0),rgba(255,224,130,.9) 50%,rgba(255,224,130,0));transform:translateY(-100%);animation:tabletsHoldSweep .9s ease-in-out forwards}
@keyframes tabletsHoldSweep{to{transform:translateY(100%)}}
.tablets-seal.glory{box-shadow:0 0 12px rgba(255,214,120,.9)}
```

### G3 motion test lists the new animated selectors  (`test/motion.test.js`, serves G2, G3, G4)

Why: each new animated selector is in the motion suite reducedHooks, so the reduced-motion kill is proven for it

Find (exactly once):

```js
  [".tablets-verse", "tablets rolling sheet"]
```

Replace with:

```js
  [".tablets-verse", "tablets rolling sheet"],
  [".tablets-mult.pop", "tablets multiplier pop"],
  [".tablets-combo.broke", "tablets combo break"],
  [".tablets-seal.snuff", "tablets lamp smoke"],
  [".tablets-roll.hold-sweep", "tablets hold sweep"],
  [".tablets-seal.glory", "tablets seal glory"]
```

### S0 G1 G2 G3 G4 tests for the feel phase  (`test/tablets.test.js`, serves S0, G1, G2, G3, G4)

Why: pure helpers, the sfx bus routing, the carve impact, the combo meter, the pop and break, the lamp smoke and sounds, the heartbeat, the final carve and the reduced and tutorial gates

Find (exactly once):

```js
unstubRandom();
if (fail) {
```

Replace with:

```js
// ---- feel phase: S0 bus, G1 carve impact, G2 combo meter, G3 danger and miss, G4 the Hold's finish ----
const FAKE_BUS = "var __osc = [], __conn = [], __dest = { name:'dest' }, __out = { name:'out' };" +
  " var __ctx = { currentTime:0, destination:__dest," +
  " createOscillator(){ var o = { type:'', freq:[], ramp:[], frequency:{ setValueAtTime(v){ o.freq.push(v); }, linearRampToValueAtTime(v){ o.ramp.push(v); } }," +
  " connect(){}, start(t){ o.startAt = t; }, stop(t){ o.stopAt = t; } }; __osc.push(o); return o; }," +
  " createGain(){ return { gain:{ setValueAtTime(){}, exponentialRampToValueAtTime(){}, linearRampToValueAtTime(){} }, connect(t){ __conn.push(t); } }; } };" +
  " Snd.sfxBus = function(){ return { ctx:__ctx, out:__out }; };";
const toneCount = function(sb, dur){
  return read(sb, "__osc.filter(function(o){ return o.stopAt !== undefined && Math.abs(o.stopAt - o.startAt - " + dur + ") < 1e-9; }).length");
};
{
  // G1-G4 helpers: the grades, the carve note, the combo fill, the heartbeat gap and the header meter.
  const sb = boot();
  ok("the four grades wear their colours", read(sb, "Object.keys(TABLET_GRADE_COLORS).join(',') === 'divine,sacred,carved,clutch'") === true);
  eq("the carve note starts at 392 Hz", read(sb, "tabletsCarveNoteHz(0)"), 392);
  ok("the carve note rises from streak 1 to 4", read(sb, "[1,2,3,4].every(function(n){ return tabletsCarveNoteHz(n) > tabletsCarveNoteHz(n - 1); })") === true);
  eq("the carve note climbs an octave at streak 5", read(sb, "tabletsCarveNoteHz(5)"), 784);
  eq("the combo fill is empty at streak 0", read(sb, "tabletsComboFill(0)"), 0);
  eq("the combo fill is 0.125 at streak 1 (comboOf(2) = 1.5)", read(sb, "tabletsComboFill(1)"), 0.125);
  eq("the combo fill is 0.625 at streak 9 (comboOf(10) = 3.5)", read(sb, "tabletsComboFill(9)"), 0.625);
  eq("the combo fill is full from streak 15 (comboOf(16) = 5)", read(sb, "tabletsComboFill(15)"), 1);
  ok("the heartbeat gap is 0.95 s at danger 0.5", Math.abs(read(sb, "tabletsHeartGapS(0.5)") - 0.95) < 1e-9);
  ok("the heartbeat gap is 0.45 s at danger 1", Math.abs(read(sb, "tabletsHeartGapS(1)") - 0.45) < 1e-9);
  ok("the combo meter sits in the header beside the tier", html.indexOf('id="tablets-combo"') > html.indexOf('id="tablets-tier"') && html.indexOf('id="tablets-combo"') < html.indexOf('class="tablets-stats"'));
  ok("the combo fill is a bar in the stylesheet", /\.tablets-combo-fill\{/.test(src));
}
{
  // S0: the three tones route to the sfx bus; with no bus they stay silent and throw nothing.
  const sb = boot();
  exec(sb, FAKE_BUS + "; startRun('tablets','watchman'); R.tabletTutorial = false; R.tabletResolving = false;");
  exec(sb, "__conn.length = 0; tabletsPlayGoldChime()");
  eq("the gold chime connects four gains", read(sb, "__conn.length"), 4);
  ok("the gold chime routes to the sfx bus", read(sb, "__conn.every(function(t){ return t === __out; })") === true);
  exec(sb, "__conn.length = 0; tabletsPlayScribeTick(0.5); tabletsPlayDangerWarn()");
  ok("the scribe tick and the danger warn route to the sfx bus", read(sb, "__conn.length === 2 && __conn.every(function(t){ return t === __out; })") === true);
  ok("nothing routes to the destination", read(sb, "__conn.indexOf(__dest) < 0") === true);
  exec(sb, "Snd.sfxBus = function(){ return null; }; __conn.length = 0; tabletsPlayGoldChime(); tabletsPlayScribeTick(0.5); tabletsPlayDangerWarn(); tabletsPlayCarveNote(0); tabletsComboBreak(3);");
  eq("with no bus nothing connects", read(sb, "__conn.length"), 0);
  ok("with no bus the tones throw nothing", true);
}
{
  // G1: the carve kick, burst and note by grade.
  const sb = boot();
  exec(sb, FAKE_BUS + "; startRun('tablets','watchman'); R.tabletTutorial = false; R.trauma = 0; tabletsFx.ctx = {}; tabletsFx.sparks = [];");
  exec(sb, "tabletsCarveKick({grade:'clutch'})");
  eq("a clutch carve kicks the camera 0.32", read(sb, "R.trauma"), 0.32);
  exec(sb, "R.trauma = 0; tabletsCarveKick({grade:'divine'})");
  eq("a divine carve kicks 0.22", read(sb, "R.trauma"), 0.22);
  exec(sb, "tabletsCarveBurst({grade:'clutch'})");
  eq("a clutch burst throws 34 sparks", read(sb, "tabletsFx.sparks.length"), 34);
  eq("a clutch burst wears the clutch colour", read(sb, "tabletsFx.sparks[0].color"), "255,128,72");
  exec(sb, "tabletsFx.sparks = []; tabletsCarveBurst({grade:'divine'})");
  eq("a divine burst throws 26 sparks", read(sb, "tabletsFx.sparks.length"), 26);
  eq("a divine burst wears the divine colour", read(sb, "tabletsFx.sparks[0].color"), "255,236,170");
  exec(sb, "__osc.length = 0; tabletsPlayCarveNote(0)");
  eq("the carve note at streak 0 sounds 392 Hz", read(sb, "__osc[0].freq[0]"), 392);
  eq("the carve note is a sine and a triangle", toneCount(sb, 0.14), 2);
}
{
  // G2: the meter's fill, warm at streak 9 and blaze at 15.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman'); R.tabletTutorial = false");
  exec(sb, "R.streak = 0; paintTabletsHud()");
  eq("streak 0: the meter is empty", read(sb, "$('tablets-combo-fill').style.width"), "0%");
  ok("streak 0: not warm", read(sb, "$('tablets-combo').classList.contains('warm')") === false);
  exec(sb, "R.streak = 4; paintTabletsHud()");
  eq("streak 4: a quarter full", read(sb, "$('tablets-combo-fill').style.width"), "25%");
  ok("streak 4: not warm", read(sb, "$('tablets-combo').classList.contains('warm')") === false);
  exec(sb, "R.streak = 9; paintTabletsHud()");
  eq("streak 9: 62.5% full", read(sb, "$('tablets-combo-fill').style.width"), "62.5%");
  ok("streak 9: warm", read(sb, "$('tablets-combo').classList.contains('warm')") === true);
  ok("streak 9: not yet blazing", read(sb, "$('tablets-combo').classList.contains('blaze')") === false);
  exec(sb, "R.streak = 15; paintTabletsHud()");
  ok("streak 15: blazing", read(sb, "$('tablets-combo').classList.contains('blaze')") === true);
}
{
  // G2: a climb pops the multiplier; a level combo does not; the first blaze plays ignite; the tutorial pops nothing.
  const sb = boot();
  exec(sb, FAKE_BUS + "; var __ig = 0; Snd.ignite = function(){ __ig++; }; startRun('tablets','watchman'); R.tabletTutorial = false; R.tabletResolving = false; R.streak = 0; tabletsResolve(true);");
  ok("a carve that climbs the combo pops the multiplier", read(sb, "$('tablets-mult').classList.contains('pop')") === true);
  exec(sb, "$('tablets-mult').classList.remove('pop'); tabletsComboCue(1, 2)");
  ok("a level combo does not pop", read(sb, "$('tablets-mult').classList.contains('pop')") === false);
  exec(sb, "tabletsComboCue(13, 14); __ig = 0; tabletsComboCue(14, 15)");
  eq("the first blaze plays ignite", read(sb, "__ig"), 1);
  exec(sb, "__ig = 0; tabletsComboCue(15, 16)");
  eq("a blaze that already burns does not replay", read(sb, "__ig"), 0);
  exec(sb, "R.tabletTutorial = true; $('tablets-mult').classList.remove('pop'); tabletsComboCue(0, 1)");
  ok("the tutorial pops nothing", read(sb, "$('tablets-mult').classList.contains('pop')") === false);
}
{
  // G2: a streak-breaking miss cracks the meter and drops the break tone; a miss from streak 1 does not.
  const sb = boot();
  exec(sb, FAKE_BUS + "; startRun('tablets','watchman'); R.tabletTutorial = false; R.tabletResolving = false; R.streak = 3; tabletsResolve(false);");
  ok("a streak-breaking miss cracks the combo meter", read(sb, "$('tablets-combo').classList.contains('broke')") === true);
  eq("the streak falls to 0", read(sb, "R.streak"), 0);
  ok("the break tone glides from 110 to 70 Hz", read(sb, "__osc.some(function(o){ return o.freq[0] === 110 && o.ramp[0] === 70; })") === true);
  exec(sb, "$('tablets-combo').classList.remove('broke'); R.tabletResolving = false; R.streak = 1; tabletsResolve(false);");
  ok("a miss from streak 1 does not crack it", read(sb, "$('tablets-combo').classList.contains('broke')") === false);
}
{
  // G3: a spent lamp smokes the seal that went dark and crackles; the last lamp thuds.
  const sb = boot();
  exec(sb, FAKE_BUS + "; startRun('tablets','watchman'); R.tabletTutorial = false; R.tabletResolving = false; R.tabletLives = 3; R.tabletMiss = 0; R.streak = 0; var __lc = 0, __lt = 0; Snd.lampCrackle = function(){ __lc++; }; Snd.lampThud = function(){ __lt++; }; tabletsResolve(false);");
  const lampsA = read(sb, "$('tablets-lamps').innerHTML");
  const seals = lampsA.split('<i class="');
  eq("one lamp goes out: two lit", read(sb, "R.tabletLives - R.tabletMiss"), 2);
  ok("the third seal smokes", seals[3] !== undefined && seals[3].indexOf("snuff") >= 0, lampsA);
  ok("the lit seals do not smoke", seals[1].indexOf("snuff") < 0 && seals[2].indexOf("snuff") < 0);
  eq("a spent lamp crackles", read(sb, "__lc"), 1);
  eq("no thud while lamps remain", read(sb, "__lt"), 0);
  exec(sb, "R.tabletResolving = false; R.tabletMiss = 2; tabletsResolve(false);");
  eq("the last lamp thuds", read(sb, "__lt"), 1);
}
{
  // G3: the heartbeat beats at danger 0.5 and faster at 1; silent below 0.5, in the tutorial, while resolving and under reduced motion.
  const beats = function(danger, setup){
    const sb = boot();
    exec(sb, "startRun('tablets','watchman'); R.tabletTutorial = false; R.tabletResolving = false; R.tabletRacing = true; R.paused = false; R.tabletLast = 0; R.tabletHeartT = 0; var __hb = 0; Snd.heart = function(){ __hb++; }; tabletsDangerLevel = function(){ return " + danger + "; };" + (setup || ""));
    exec(sb, "for(var __k = 0; __k < 30; __k++){ tabletsTick(R.tabletLast + 100); }");
    return read(sb, "__hb");
  };
  ok("danger 0.6 plays the heart", beats(0.6) >= 1);
  ok("danger 1 beats faster than danger 0.6", beats(1) > beats(0.6));
  eq("danger 0.4 stays silent", beats(0.4), 0);
  eq("the tutorial stays silent", beats(0.9, "R.tabletTutorial = true;"), 0);
  eq("a resolving hit stays silent", beats(0.9, "R.tabletResolving = true;"), 0);
  eq("reduced motion stays silent", beats(0.9, "document.body.classList.add('reduced');"), 0);
}
{
  // G4: the final carve is the last gap of the last step; not the gap before it, not an earlier step, not the tutorial, not a later Endless reading.
  const sb = boot();
  exec(sb, FAKE_BUS + "; startRun('tablets','watchman'); R.tabletTutorial = false; R.tabletMode = 'hold'; R.tabletPass = 1; R.tabletResolving = false; R.streak = 0; R.tabletSteps = [[{a:'x'},{a:'y'}],[{a:'z'},{a:'w'}]];");
  exec(sb, "R.tabletIdx = R.tabletSteps.length - 1; R.gapIdx = tabletsStepBlanks().length - 1");
  ok("the last gap of the last step is the final carve", read(sb, "tabletsIsFinalCarve()") === true);
  exec(sb, "R.gapIdx = Math.max(0, tabletsStepBlanks().length - 2)");
  ok("the gap before the last is not", read(sb, "tabletsStepBlanks().length < 2 || !tabletsIsFinalCarve()") === true);
  exec(sb, "R.tabletIdx = 0; R.gapIdx = tabletsStepBlanks().length - 1");
  ok("the last gap of an earlier step is not", read(sb, "R.tabletSteps.length < 2 || !tabletsIsFinalCarve()") === true);
  exec(sb, "R.tabletMode = 'endless'; R.tabletPass = 2; R.tabletIdx = R.tabletSteps.length - 1; R.gapIdx = tabletsStepBlanks().length - 1");
  ok("an Endless second reading is not the final carve", read(sb, "tabletsIsFinalCarve()") === false);
  exec(sb, "R.tabletMode = 'hold'; R.tabletPass = 1; R.tabletTutorial = true");
  ok("the tutorial has no final carve", read(sb, "tabletsIsFinalCarve()") === false);
  exec(sb, "R.tabletTutorial = false; R.tabletIdx = R.tabletSteps.length - 1; R.gapIdx = tabletsStepBlanks().length - 1; __osc.length = 0; tabletsResolve(true);");
  ok("the roll sweeps gold on the final carve", read(sb, "$('tablets-roll').classList.contains('hold-sweep')") === true);
  const litNow = read(sb, "R.tabletLives - R.tabletMiss");
  const lampsB = read(sb, "$('tablets-lamps').innerHTML");
  eq("every lit seal glows on the final carve", (lampsB.match(/glory/g) || []).length, litNow);
  eq("a four-note chord rings out for 1.4 s", toneCount(sb, 1.4), 4);
}
{
  // Under reduced motion: no sweep, pop, glow, sparks, kick, meter break or smoke; the Hold's chord still sounds.
  const sb = boot();
  exec(sb, FAKE_BUS + "; document.body.classList.add('reduced'); startRun('tablets','watchman'); R.tabletTutorial = false; R.tabletResolving = false; R.streak = 14; R.trauma = 0; tabletsFx.ctx = {}; tabletsFx.sparks = []; R.tabletIdx = R.tabletSteps.length - 1; R.gapIdx = tabletsStepBlanks().length - 1; __osc.length = 0; tabletsResolve(true);");
  ok("no gold sweep under reduced motion", read(sb, "$('tablets-roll').classList.contains('hold-sweep')") === false);
  ok("no multiplier pop under reduced motion", read(sb, "$('tablets-mult').classList.contains('pop')") === false);
  ok("no glowing lamp under reduced motion", read(sb, "$('tablets-lamps').innerHTML.indexOf('glory') < 0") === true);
  eq("no sparks under reduced motion", read(sb, "tabletsFx.sparks.length"), 0);
  eq("no kick under reduced motion", read(sb, "R.trauma"), 0);
  ok("the Hold's chord still sounds under reduced motion", toneCount(sb, 1.4) === 4);
  exec(sb, "R.tabletResolving = false; R.tabletMiss = 0; R.streak = 3; tabletsResolve(false);");
  ok("no broke meter under reduced motion", read(sb, "$('tablets-combo').classList.contains('broke')") === false);
  ok("no smoke under reduced motion", read(sb, "$('tablets-lamps').innerHTML.indexOf('snuff') < 0") === true);
}
{
  // The tutorial: its carve sounds the note and shows no effect.
  const sb = boot();
  exec(sb, FAKE_BUS + "; startRun('tablets','watchman'); R.tabletTutorial = true; R.tabletResolving = false; R.streak = 0; R.trauma = 0; tabletsFx.ctx = {}; tabletsFx.sparks = []; R.tabletIdx = 0; R.gapIdx = 0; __osc.length = 0; tabletsResolve(true);");
  ok("the tutorial carve sounds its note", toneCount(sb, 0.14) >= 2);
  eq("the tutorial throws no sparks", read(sb, "tabletsFx.sparks.length"), 0);
  eq("the tutorial kicks nothing", read(sb, "R.trauma"), 0);
  ok("the tutorial shows no hold sweep", read(sb, "$('tablets-roll').classList.contains('hold-sweep')") === false);
  ok("the tutorial pops nothing", read(sb, "$('tablets-mult').classList.contains('pop')") === false);
}
{
  // G2: the combo meter moves with the carve itself, inside the resolve, not when the step re-arms.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.streak = 7; tabletsResolve(true)");
  eq("the meter fills at the carve, before the step re-arms", read(sb, "$('tablets-combo-fill').style.width"), (Tablets.rules.comboOf(9) - 1) / 4 * 100 + "%");
  exec(sb, "tabletsFinishResolve(true); tabletsResolve(false)");
  eq("a miss empties the meter at once", read(sb, "$('tablets-combo-fill').style.width"), "0%");
}
unstubRandom();
if (fail) {
```

What does not change: no rule, timing, score or flow; the feel layer only reads the run. Every new visual is off under reduced motion and motion-calm and in the tutorial; the sounds still play (the heartbeat rests under reduced motion).

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)                71 ms  applied 19 edits to 6 files
make-expected                    47082 ms  expected.json written: 1192 baseline files; changed: css/tablets.css, index.html, js/audio.js, js/tablets-run.js, test/motion.test.js, test/tablets.test.js
tamper-test (+ full gate post)  230514 ms  TAMPER-TEST: PASS  (control passed; 10 tampers)
scope-report pristine              106 ms  SCOPE VERDICT: READY  (19 edit(s) pending, 0 already applied)
scope-report dry-run               112 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 19 already applied)
scope-report (real project)         99 ms  SCOPE VERDICT: READY  (19 edit(s) pending, 0 already applied)
gate pre (real project)          24631 ms  RESULT: PASS  (29/29 checks passed, mode=pre)

# make-expected
expected.json written: 1192 baseline files; changed: css/tablets.css, index.html, js/audio.js, js/tablets-run.js, test/motion.test.js, test/tablets.test.js
tests before {"pass":75,"fail":0} (exit 0) -> after {"pass":75,"fail":0} (exit 0)
  anchor js/tablets-run.js:885 x1  function tabletsResolveHit(){
  anchor js/tablets-run.js:773 x1  function tabletsResolveMiss(){
  anchor js/tablets-run.js:64 x1  function tabletsDangerLevel(){
  anchor js/tablets-run.js:197 x1  function tabletsPlayGoldChime(){
  anchor js/tablets-run.js:528 x1  function tabletsSealsMarkup(left, total){
  anchor js/tablets-run.js:1363 x1  function spawnTabletsSparks(x, y, count, color){
  anchor js/tablets-run.js:742 x1  function tabletsApplyTrauma(amount){
  anchor js/audio.js:408 x1      heart(){ if(playSfx("heart")) return;

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (45/45 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (18/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-css/tablets.css  css/tablets.css is byte-identical , X-index.html  index.html is byte-identical to the dry, X-js/audio.js  js/audio.js is byte-identical to the d
  OK    a stray file was added -> RESULT: FAIL  (23/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S2  no file was added or deleted
  OK    edited file drifted by one byte: js/audio.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-js/audio.js  js/audio.js is byte-identical to the d
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    edited file drifted by one byte: css/tablets.css -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-css/tablets.css  css/tablets.css is byte-identical 
  OK    edited file drifted by one byte: index.html -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-index.html  index.html is byte-identical to the dry
  OK    edited file drifted by one byte: test/tablets.test.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    edited file drifted by one byte: test/motion.test.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-test/motion.test.js  test/motion.test.js is byte-id
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (23/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S3  the other 1186 files are byte-identical to the ba
  OK    half-applied: edit "S0a Snd exports a sound bus" undone -> RESULT: FAIL  (23/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-js/audio.js  js/audio.js is byte-identical to the d
TAMPER-TEST: PASS  (control passed; 10 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 5e62c0371248716409ee20d220f44274a8275d95e39b48913ade26d1504d68bc
```

## 8. Not measured
- **How it sounds and feels** is checked only in a browser; the sound itself is not heard by any test (the bus routing is tested with a recording context).
- **Frame cost** on a phone is not measured.
- **Android:** none of this (web first, decision F1).
- **CI:** the stacked PR targets the fix branch; `ci.yml` runs on PRs to master only.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
