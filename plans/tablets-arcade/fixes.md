# Plan: Word Tablets fix PR (review findings, web and Android)

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
A Sonnet review of every Word Tablets change on the branch (phases 1–8, the roll and the other session's A–E) found bugs the suites do not catch; the executor re-ran the high and medium ones (`sources/repros.txt`): a Last-grain carve on the final word times out and loses the Hold, a pause inside a carve kills the sand loop, the roll hides the line being carved on a phone (Daniel 6 gaps 2–3 at 0% visible), powers fire during a carve and waste their charge, and nothing draws in the last 5 s of sand. Every suite passes today, so there is no failing target; 27 mutations prove the new tests. End state: 37 edits applied to 7 files (section 7), every other file byte-identical.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| FX1 / KX1 | A carve with < 1 s left loses the Hold | the sand burns during the 1000 ms resolve (tabletsBurnSand; Kotlin tick) | Real bug (high) | no burn / tick while resolving |
| FX2 | Pause inside a carve freezes the sand forever | resume restarts the loop only when not resolving | Real bug (high) | resume always restarts the loop |
| FX15 | The roll hides the line being carved | the sheet follows the step's top, not the active gap | Real bug (high) | roll by the active line |
| FX3 | Powers during a carve waste their charge | no resolving guard in Illuminate / Winnow | Real bug (medium) | tabletsPowerReady() guard |
| FX4 | Ctrl/Meta keys swallowed, held keys repeat, inputs typed into, the resume key types | tabletsOnKey has no modifier / repeat / focus / defaultPrevented filter | Real bug (medium) | tabletsKeyIgnored() |
| FX5 | No danger vignette or sparks in the last 5 s | drawTabletsFx returns early at 5 s | Real bug (medium) | only embers and glyphs rest |
| FX6–FX14, FX16, KX2, KX3 | stale resolve timer; Manna wiped; Censer hidden 4th lamp; Judgment seals; HUD multiplier lag; hit-stop and banner leak; haptics under reduced motion and twice per miss; urgent pulse hides the glow; dead --tablets-rise write; "Banish three" on NKJV; Android grey key pick; Android Illuminate copy | the review (low) | Real bug (low); FX8 decided: the Censer relights a lost lamp | see edits |
| T | 5 web assertions and 1 Kotlin assertion pinned the old behaviour (the streak HUD, the Censer's 4th lamp, the Winnow card, the seal signature, the blessing state; Kotlin "clockKeepsRacingAfterAHit" pinned the bug) | — | Stale test (decided change) | updated |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `js/tablets-run.js`, `css/tablets.css`, `index.html`, `test/tablets.test.js`, `mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, `mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, `mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1184 files stay byte-identical. No file is added or deleted.
- **Invariants:** the web rules module (so no content hash change), the Kotlin rules object, the Favor formula, the typed-letter logic and the cuneiform glyphs stay byte-identical.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 27 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `0277411f59ee2fdcf61e5aa95e9e37b901d20f427071ebf103bb015c60163ce5`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 7 file(s) change (`css/tablets.css`, `index.html`, `js/tablets-run.js`, `mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, `mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, `mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, `test/tablets.test.js`) and 1184 stay identical.
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
node fix-plan/gate.js pre     # required: RESULT: PASS (36/36 checks passed, mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 37 edits to 7 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (57/57 checks passed, mode=post)
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
### FX1  (`js/tablets-run.js`, serves FX1)

Why: The sand burns during the 1000 ms hit-resolve, so a Last grain on the last word times out (repro t1).

Find (exactly once):

```js
function tabletsBurnSand(dt){
  if(!R || R.ended || R.surgeOn || tabletsUntimed()) return;
```

Replace with:

```js
function tabletsBurnSand(dt){
  /* FX1: the sand waits out a resolve window, so a Last grain is not lost to the hit's 1 s hold. */
  if(!R || R.ended || R.surgeOn || R.tabletResolving || tabletsUntimed()) return;
```

### FX2  (`js/tablets-run.js`, serves FX2)

Why: setTabletsPaused(false) skips the loop restart while R.tabletResolving, so the rAF loop dies (repro t2).

Find (exactly once):

```js
  } else if(!R.tabletResolving){
```

Replace with:

```js
  } else {
    stopTabletsLoop(); // FX2: resume restarts the loop, inside a resolve window too (one loop: stop first)
```

### FX3a  (`js/tablets-run.js`, serves FX3)

Why: Illuminate spends a charge and does nothing during a resolve window (repro t3).

Find (exactly once):

```js
function tabletsIlluminate(){
  if(!R || R.ended || R.paused || R.mode !== "tablets") return;
```

Replace with:

```js
/* FX3: the powers answer only while the run is live and no carve or miss is resolving. */
function tabletsPowerReady(){
  return !!R && !R.ended && !R.paused && R.mode === "tablets" && !R.tabletResolving;
}
function tabletsIlluminate(){
  if(!tabletsPowerReady()) return;
```

### FX3b  (`js/tablets-run.js`, serves FX3)

Why: Winnow spends a charge and unlocks the grid during a resolve window (repro t3).

Find (exactly once):

```js
function tabletsWinnow(){
  if(!R || R.ended || R.paused || R.mode !== "tablets") return;
```

Replace with:

```js
function tabletsWinnow(){
  if(!tabletsPowerReady()) return;
```

### FX4a  (`js/tablets-run.js`, serves FX4)

Why: Ctrl+W winnows and types; repeats fire powers; keys typed in a field act on the run.

Find (exactly once):

```js
function tabletsOnKey(e){
```

Replace with:

```js
/* FX4: chords, keys a field or an overlay already took, and held letters or digits are not ours. */
function tabletsKeyIgnored(e, k){
  if(e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return true;
  if(e.repeat && /^[a-z0-9]$/.test(k)) return true;
  const el = (e.target && e.target.tagName) ? e.target : document.activeElement;
  return !!(el && (/input|select|textarea/i.test(el.tagName) || el.isContentEditable));
}
function tabletsOnKey(e){
```

### FX4b  (`js/tablets-run.js`, serves FX4)

Why: The filter must run before the pause branch and the power/type routing, after k is known.

Find (exactly once):

```js
  if(!R || R.ended || R.mode !== "tablets") return;
  const k = (e.key || "").toLowerCase();
```

Replace with:

```js
  if(!R || R.ended || R.mode !== "tablets") return;
  const k = (e.key || "").toLowerCase();
  if(tabletsKeyIgnored(e, k)) return;
```

### FX5  (`js/tablets-run.js`, serves FX5)

Why: drawTabletsFx returns early at clock <= 5, so the danger vignette and all sparks stop when the danger peaks (repro t7).

Find (exactly once):

```js
  if(typeof R !== "undefined" && R && typeof R.tabletClock === "number" && R.tabletClock <= 5 && !tabletsUntimed()){
    return;
  }
  drawTabletsGlyphs(dt);
  drawTabletsDanger(ctx, w, h);
  tabletsFx.embers.forEach(function(p){
```

Replace with:

```js
  /* FX5: in the last 5 s the glyphs and embers rest; the danger wash and the sparks still draw and age. */
  const late = typeof R !== "undefined" && R && typeof R.tabletClock === "number" && R.tabletClock <= 5 && !tabletsUntimed();
  if(!late) drawTabletsGlyphs(dt);
  drawTabletsDanger(ctx, w, h);
  (late ? [] : tabletsFx.embers).forEach(function(p){
```

### FX6a  (`js/tablets-run.js`, serves FX6)

Why: A finish timer from a previous run fires into the current run and advances it (repro t9).

Find (exactly once):

```js
  stopTabletsLoop();
  const ch = tabletsChapter();
```

Replace with:

```js
  stopTabletsLoop();
  /* FX6: each run takes a new token; a finish timer from an earlier run sees the change and stands down. */
  R.tabletRunToken = (R.tabletRunToken || 0) + 1;
  const ch = tabletsChapter();
```

### FX6b  (`js/tablets-run.js`, serves FX6)

Why: The resolve timer captures the run token when it is scheduled.

Find (exactly once):

```js
  setTimeout(function(){ tabletsFinishResolve(ok); }, ok ? 1000 : 800);
```

Replace with:

```js
  const token = R.tabletRunToken;
  setTimeout(function(){ if(R.tabletRunToken === token) tabletsFinishResolve(ok); }, ok ? 1000 : 800);
```

### FX7a  (`js/tablets-run.js`, serves FX7)

Why: The Manna Jar adds 15 s to the current clock, which the next gap re-arm then wipes (repro t8).

Find (exactly once):

```js
      const cap = R.tabletClockMax || tabletsClockMax();
      R.tabletClock = Math.min(cap, (R.tabletClock || 0) + 15);
```

Replace with:

```js
      /* FX7: the jar banks its 15 s for the next step; the re-arm adds it to the fresh sand. */
      R.tabletBankSand = 15;
```

### FX7b  (`js/tablets-run.js`, serves FX7)

Why: The re-arm at each gap adds the bank to the fresh sand, then spends it.

Find (exactly once):

```js
  if(!R.tabletTutorial){
    R.tabletClock = tabletsStepSeconds();
    R.tabletClockMax = R.tabletClock;
    R.tabletLastWarnSec = -1;
  }
```

Replace with:

```js
  if(!R.tabletTutorial){
    /* FX7: a banked Manna Jar adds its 15 s to the fresh sand, then the bank is spent. */
    R.tabletClockMax = tabletsStepSeconds();
    R.tabletClock = R.tabletClockMax + (R.tabletBankSand || 0);
    R.tabletBankSand = 0;
    R.tabletLastWarnSec = -1;
  }
```

### FX8a  (`js/tablets-run.js`, serves FX8)

Why: The Golden Censer adds a lamp above the count (lives + 1) instead of relighting a lost one.

Find (exactly once):

```js
apply:function(){ R.tabletLives = (R.tabletLives || 3) + 1; } },
```

Replace with:

```js
apply:function(){ if((R.tabletMiss || 0) > 0) R.tabletMiss -= 1; } },
```

### FX8b  (`js/tablets-run.js`, serves FX8)

Why: With every lamp lit the Censer has nothing to relight, so it is filtered out like the Judgment filter.

Find (exactly once):

```js
  /* P2: in Judgment the Censer leaves the pool, so the HUD never shows a lamp the run cannot use. */
  const pool = R.tabletMode === "judgment" ? picks.filter(function(p){ return p.text.indexOf("Golden Censer") < 0; }) : picks;
```

Replace with:

```js
  /* P2: in Judgment the Censer leaves the pool, so the HUD never shows a lamp the run cannot use. FX8: with every lamp
     lit the Censer has nothing to relight, so it leaves the pool too. */
  const lampOut = (R.tabletMiss || 0) > 0;
  const pool = picks.filter(function(p){ return p.text.indexOf("Golden Censer") < 0 || (lampOut && R.tabletMode !== "judgment"); });
```

### FX9a  (`js/tablets-run.js`, serves FX9)

Why: tabletsSealsMarkup always draws three seals, so Judgment (one lamp) shows two cracked seals.

Find (exactly once):

```js
function tabletsSealsMarkup(left){
  let out = "";
  for(let i = 0; i < 3; i++){
```

Replace with:

```js
function tabletsSealsMarkup(left, total){
  let out = "";
  /* FX9: one seal per lamp the mode starts with (Judgment wears one). */
  for(let i = 0; i < (total || 1); i++){
```

### FX9b  (`js/tablets-run.js`, serves FX9)

Why: The seals paint the lamp count for screen readers as an aria-label.

Find (exactly once):

```js
    lamps.innerHTML = tabletsSealsMarkup(left);
```

Replace with:

```js
    lamps.innerHTML = tabletsSealsMarkup(left, R.tabletLives || 1);
    /* FX9: screen readers hear the lamp count, not the seal glyphs. */
    lamps.setAttribute("aria-label", "Lamps: " + left + " lit");
```

### FX10  (`js/tablets-run.js`, serves FX10)

Why: The HUD multiplier shows the combo of the last carve; the next carve pays comboOf(streak + 1).

Find (exactly once):

```js
  const mult = Tablets.rules.comboOf(n);
```

Replace with:

```js
  /* FX10: the HUD shows the multiplier the next carve pays: the combo one streak on. */
  const mult = Tablets.rules.comboOf(n + 1);
```

### FX11  (`js/tablets-run.js`, serves FX11)

Why: Hitstop, the milestone banner and its timer survive into a new run.

Find (exactly once):

```js
  R.tabletResolving = false;
  R.favor = 0;
```

Replace with:

```js
  R.tabletResolving = false;
  /* FX11: a new run starts with no hitstop, no milestone banner and no banked Manna sand. */
  R.tabletHitstop = 0;
  R.tabletBankSand = 0;
  clearTimeout(R.tabletMilestoneTimer);
  const banner = $("tablets-milestone");
  if(banner) banner.classList.remove("active");
  R.favor = 0;
```

### FX12a  (`js/tablets-run.js`, serves FX12)

Why: The carve haptic buzzes under reduced motion.

Find (exactly once):

```js
  if(typeof navigator === "undefined" || !navigator.vibrate || !SAVE.set.haptics || R.tabletTutorial) return;
  navigator.vibrate(carve.milestone
```

Replace with:

```js
  if(typeof navigator === "undefined" || !navigator.vibrate || !SAVE.set.haptics || R.tabletTutorial || tabletsReduced()) return;
  navigator.vibrate(carve.milestone
```

### FX12b  (`js/tablets-run.js`, serves FX12)

Why: The miss haptic buzzes under reduced motion.

Find (exactly once):

```js
  if(typeof navigator === "undefined" || !navigator.vibrate || !SAVE.set.haptics || R.tabletTutorial) return;
  navigator.vibrate(R.tabletLampOut
```

Replace with:

```js
  if(typeof navigator === "undefined" || !navigator.vibrate || !SAVE.set.haptics || R.tabletTutorial || tabletsReduced()) return;
  navigator.vibrate(R.tabletLampOut
```

### FX12c  (`js/tablets-run.js`, serves FX12)

Why: A miss vibrates twice: the trauma pattern and then the miss haptic. Keep one pattern per miss.

Find (exactly once):

```js
  if(typeof SAVE !== "undefined" && SAVE.set && SAVE.set.haptics && typeof navigator !== "undefined" && navigator.vibrate){
    try{ navigator.vibrate([100, 50, 100]); }catch(e){}
  }
```

Replace with:

```js
  /* FX12: the miss haptic is the miss's one pattern; the trauma only shakes the stage. */
```

### FX13  (`css/tablets.css`, serves FX13)

Why: The urgent box-shadow animation overrides the carve glow on the same slot.

Find (exactly once):

```css
.tablets-slot.urgent{border-color:#ff5238;animation:tabletsSlotUrgent .42s infinite alternate}
```

Replace with:

```css
.tablets-slot.urgent{border-color:#ff5238;animation:tabletsSlotUrgent .42s infinite alternate}
/* FX13: a carve glow wins over the urgent pulse, so the success light shows. */
.tablets-slot.glow.urgent{animation:none}
```

### FX14  (`js/tablets-run.js`, serves FX14)

Why: --tablets-rise has no consumer in css, js, html or tests but is written every frame.

Find (exactly once):

```js
  const ms = $("tablets-ms");
  if(ms && ms.style && ms.style.setProperty) ms.style.setProperty("--tablets-rise", String(Math.round(tabletsRiseOf() * 1000) / 1000));
```

Replace with:

```js
  /* FX14: --tablets-rise had no consumer and was rewritten every frame; the roll reads the rise directly. */
```

### FX15a  (`js/tablets-run.js`, serves FX15)

Why: The roll positions the sheet by the step top and ignores the gap being carved (phones, long steps).

Find (exactly once):

```js
/* R1: untimed (tutorial, reduced motion) and a freshly painted step jump; otherwise the sheet eases toward its target. */
```

Replace with:

```js
/* FX15: the roll follows the line being carved (the active gap's own line), not the top of the step. */
function tabletsActiveLineTop(verse){
  const line = verse.children ? verse.children[R.gapIdx || 0] : null;
  return (verse.offsetTop || 0) + ((line && line.offsetTop) || 0);
}
/* R1: untimed (tutorial, reduced motion) and a freshly painted step jump; otherwise the sheet eases toward its target. */
```

### FX15b  (`js/tablets-run.js`, serves FX15)

Why: The roll target uses the active line offset instead of the step top offset.

Find (exactly once):

```js
  const target = tabletsRollTarget(win.clientHeight || 0, verse.offsetTop || 0, tabletsRiseOf());
```

Replace with:

```js
  const target = tabletsRollTarget(win.clientHeight || 0, tabletsActiveLineTop(verse), tabletsRiseOf());
```

### FX16  (`index.html`, serves FX16)

Why: NKJV trays banish two decoys; "three decoys" overstates the relic.

Find (exactly once):

```html
<span class="tablets-relic-effect">Banish three decoys</span>
```

Replace with:

```html
<span class="tablets-relic-effect">Banish up to three</span>
```

### T-OLD-STREAK  (`test/tablets.test.js`, serves FX10)

Why: FX10 decided change: the HUD multiplier at streak 3 is comboOf(4) = 2, not comboOf(3) = 1.5.

Find (exactly once):

```js
  eq("streak 3 multiplies the carve by 1.5", read(sb, "tabletsTier(R.streak).mult"), 1.5);
```

Replace with:

```js
  eq("streak 3 shows the 2x the next carve pays (comboOf(4))", read(sb, "tabletsTier(R.streak).mult"), 2);
```

### T-OLD-CENSER  (`test/tablets.test.js`, serves FX8)

Why: FX8: at full lamps the Censer leaves the pool, so the same roll gives Shekinah Glory (surge 35) and lamps stay 3.

Find (exactly once):

```js
  eq("a Hold Golden Censer adds a lamp", read(sb, "R.tabletLives"), 4);
```

Replace with:

```js
  eq("at full lamps the Censer leaves the pool: the same roll gives Shekinah Glory", read(sb, "R.surge"), 35);
  eq("full lamps stay at three", read(sb, "R.tabletLives"), 3);
```

### T-OLD-BLESSING  (`test/tablets.test.js`, serves FX7)

Why: FX7: a Manna Jar no longer moves the clock at once; it banks sand for the next step, so the state read includes the bank.

Find (exactly once):

```js
  const before = read(sb, "({clock:R.tabletClock,lives:R.tabletLives,surge:R.surge})");
  exec(sb, "tabletsRollBlessing()");
  const after = read(sb, "({clock:R.tabletClock,lives:R.tabletLives,surge:R.surge})");
  ok("a blessing changes clock, lives, or surge", after.clock !== before.clock || after.lives !== before.lives || after.surge !== before.surge);
```

Replace with:

```js
  const before = read(sb, "({clock:R.tabletClock,lives:R.tabletLives,surge:R.surge,bank:R.tabletBankSand})");
  exec(sb, "tabletsRollBlessing()");
  const after = read(sb, "({clock:R.tabletClock,lives:R.tabletLives,surge:R.surge,bank:R.tabletBankSand})");
  ok("a blessing changes clock, lives, surge, or the banked sand", after.clock !== before.clock || after.lives !== before.lives || after.surge !== before.surge || after.bank !== before.bank);
```

### T-OLD-BANISH  (`test/tablets.test.js`, serves FX16)

Why: FX16 copy change: NKJV trays banish up to three, not three decoys.

Find (exactly once):

```js
  ok("Winnow's card says it banishes three", html.indexOf("Banish three decoys") >= 0);
```

Replace with:

```js
  ok("Winnow's card says it banishes up to three", html.indexOf("Banish up to three") >= 0);
```

### T-OLD-SEALS  (`test/tablets.test.js`, serves FX9)

Why: FX9: tabletsSealsMarkup takes the lamp total; the three calls pass 3 as the total (same assertions).

Find (exactly once):

```js
  eq("three intact seals on a fresh run", read(sb, "(tabletsSealsMarkup(3).match(/cracked/g) || []).length"), 0);
  eq("one seal cracks when a lamp burns", read(sb, "(tabletsSealsMarkup(2).match(/cracked/g) || []).length"), 1);
  eq("every seal cracks when the lamps are gone", read(sb, "(tabletsSealsMarkup(0).match(/cracked/g) || []).length"), 3);
```

Replace with:

```js
  eq("three intact seals on a fresh run", read(sb, "(tabletsSealsMarkup(3, 3).match(/cracked/g) || []).length"), 0);
  eq("one seal cracks when a lamp burns", read(sb, "(tabletsSealsMarkup(2, 3).match(/cracked/g) || []).length"), 1);
  eq("every seal cracks when the lamps are gone", read(sb, "(tabletsSealsMarkup(0, 3).match(/cracked/g) || []).length"), 3);
```

### T-NEW  (`test/tablets.test.js`, serves FX1, FX2, FX3, FX4, FX5, FX6, FX7, FX8, FX9, FX10, FX11, FX12, FX13, FX14, FX15)

Why: One test per fix, inserted before the final unstubRandom / fail anchor.

Find (exactly once):

```js
unstubRandom();
if (fail) {
```

Replace with:

```js
{
  // FX1: the sand waits out a resolve window; a Last grain on the last word is not lost to the hit's hold.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "for(var i = 0; i < 400 && !R.ended && !(R.tabletIdx === R.tabletTotal - 1 && R.gapIdx === tabletsStepBlanks().length - 1); i++){ tabletsResolve(true); tabletsFinishResolve(true); }");
  exec(sb, "R.tabletClock = 0.5; tabletsResolve(true); R.tabletHitstop = 0");
  for (let i = 0; i < 6; i++) exec(sb, "tabletsTick(R.tabletLast + 100)");
  exec(sb, "tabletsFinishResolve(true)");
  eq("the last grain is not burned away in the resolve window", read(sb, "R.tabletTimeout"), false);
  ok("the Last grain on the last word completes the Hold", read(sb, "R.ended") === true && read(sb, "Tablets.held(R)") === true, read(sb, "R.tabletClock"));
  unstubRandom();
}
{
  // FX2: pause and resume inside a resolve window restart the sand loop; the sand burns again after the window.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "tabletsPick(tabletsGapBlank().a)");
  exec(sb, "setTabletsPaused(true); setTabletsPaused(false)");
  exec(sb, "tabletsFinishResolve(true); R.tabletHitstop = 0");
  const before = read(sb, "R.tabletClock");
  exec(sb, "tabletsTick(R.tabletLast + 100)");
  ok("the resumed loop is racing", read(sb, "R.tabletRacing") === true, read(sb, "R.tabletRacing"));
  ok("after the window the sand burns again", read(sb, "R.tabletClock") < before, read(sb, "R.tabletClock"));
  unstubRandom();
}
{
  // FX3: Illuminate and Winnow spend no charge and do not unlock the grid during a resolve window.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.powers.illum = 2; R.powers.winnow = 2; var __w = tabletsStoneButtons().filter(function(b){ return b.dataset.word.toLowerCase() !== tabletsGapBlank().a.toLowerCase(); })[0].dataset.word; tabletsPick(__w)");
  exec(sb, "tabletsIlluminate(); tabletsWinnow()");
  eq("Illuminate spends no charge in a miss window", read(sb, "R.powers.illum"), 2);
  eq("Winnow spends no charge in a miss window", read(sb, "R.powers.winnow"), 2);
  ok("the grid stays locked in a miss window", read(sb, "$('tablets-grid').classList.contains('locked')"), true);
  exec(sb, "tabletsFinishResolve(false); tabletsPick(tabletsGapBlank().a); tabletsWinnow(); tabletsIlluminate()");
  eq("Winnow spends no charge in a carve window", read(sb, "R.powers.winnow"), 2);
  eq("Illuminate spends no charge in a carve window", read(sb, "R.powers.illum"), 2);
  ok("the grid stays locked in a carve window", read(sb, "$('tablets-grid').classList.contains('locked')"), true);
  unstubRandom();
}
{
  // FX4: chords, held letters and typing fields do nothing to the run.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "var __pd = 0; var __pdFn = function(){ __pd++; }; R.powers.winnow = 2; tabletsOnKey({ key: 'w', ctrlKey: true, preventDefault: __pdFn })");
  eq("Ctrl+W does not winnow", read(sb, "R.powers.winnow"), 2);
  eq("Ctrl+W takes no key", read(sb, "__pd"), 0);
  eq("Ctrl+W types nothing", read(sb, "R.tabletTyped"), "");
  exec(sb, "R.powers.illum = 3; tabletsOnKey({ key: 'i', preventDefault: __pdFn }); tabletsFinishResolve(true); for (var j = 0; j < 5; j++) tabletsOnKey({ key: 'i', repeat: true, preventDefault: __pdFn })");
  eq("a held i fires Illuminate once", read(sb, "R.powers.illum"), 2);
  exec(sb, "R.powers.winnow = 2; tabletsOnKey({ key: 'w', target: { tagName: 'INPUT' }, preventDefault: __pdFn }); tabletsOnKey({ key: 'a', target: { tagName: 'INPUT' }, preventDefault: __pdFn })");
  eq("a key with an INPUT target does not winnow", read(sb, "R.powers.winnow"), 2);
  eq("a key with an INPUT target types nothing", read(sb, "R.tabletTyped"), "");
  unstubRandom();
}
{
  // FX4: a key the pause already took (defaultPrevented) resumes the run and types nothing.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "var __k = tabletsNeedWord().charAt(0); setTabletsPaused(true); setTabletsPaused(false); tabletsOnKey({ key: __k, defaultPrevented: true, preventDefault: function(){} })");
  eq("a key the pause already took types nothing", read(sb, "R.tabletTyped"), "");
  unstubRandom();
}
{
  // FX5: in the last 5 s the danger wash still draws, and the sparks still age.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "var __calls = []; var _ctx = new Proxy({}, { get: function(t, k){ if(k === 'createRadialGradient') return function(){ __calls.push('gradient'); return { addColorStop: function(){} }; }; return function(){ __calls.push(String(k)); }; }, set: function(){ return true; } }); $('tablets-fx').getContext = function(){ return _ctx; }; tabletsFxInit()");
  exec(sb, "R.tabletClock = 2; __calls = []; drawTabletsFx(0.016)");
  ok("the danger wash draws in the last 5 s", read(sb, "__calls.indexOf('gradient') >= 0"), read(sb, "__calls.join(',')"));
  exec(sb, "spawnTabletsSparks(100, 100, 10); for (var i = 0; i < 60; i++) drawTabletsFx(0.1)");
  eq("the sparks burn out in the last 5 s", read(sb, "tabletsFx.sparks.length"), 0);
}
{
  // FX6: a finish timer left by an earlier run does not advance the run that replaced it.
  const sb = boot();
  exec(sb, "var __timers = []; setTimeout = function(fn, ms){ __timers.push({ fn: fn, ms: ms }); return 0; }");
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "var __n = __timers.length; tabletsResolve(true); var __stale = __timers[__n]; endRun('abandon'); startRun('tablets','watchman'); Math.random = function(){ return 0.9; }; tabletsPick(tabletsStoneButtons().filter(function(b){ return b.dataset.word.toLowerCase() !== tabletsGapBlank().a.toLowerCase(); })[0].dataset.word)");
  exec(sb, "var __pos = R.tabletIdx + ':' + R.gapIdx; __stale.fn()");
  eq("a stale finish timer leaves the new miss window alone", read(sb, "R.tabletResolving"), true);
  eq("a stale finish timer does not move the new run", read(sb, "R.tabletIdx + ':' + R.gapIdx"), read(sb, "__pos"));
  unstubRandom();
}
{
  // FX7: a Manna Jar banks its 15 s for the next step instead of being wiped by the re-arm.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "var __r = [0.1, 0.1]; Math.random = function(){ return __r.length ? __r.shift() : 0.9; }; tabletsRollBlessing()");
  eq("the Manna Jar banks 15 s", read(sb, "R.tabletBankSand"), 15);
  stubRandom(sb, 0.9);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("the next step starts with 40 s", read(sb, "R.tabletClock"), 40);
  unstubRandom();
}
{
  // FX8: after a miss a Golden Censer relights the lost lamp; lamps never exceed the mode's count.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsPick(tabletsStoneButtons().filter(function(b){ return b.dataset.word.toLowerCase() !== tabletsGapBlank().a.toLowerCase(); })[0].dataset.word)");
  exec(sb, "tabletsFinishResolve(false)");
  eq("one lamp is out after a miss", read(sb, "R.tabletMiss"), 1);
  exec(sb, "var __r = [0.1, 0.5]; Math.random = function(){ return __r.length ? __r.shift() : 0.9; }; tabletsRollBlessing()");
  eq("the Censer relights the lost lamp", read(sb, "R.tabletMiss"), 0);
  eq("the Censer leaves R.tabletLives unchanged", read(sb, "R.tabletLives"), 3);
  eq("the seals show three lamps lit again", read(sb, "$('tablets-lamps').dataset.lampsLeft"), "3");
  unstubRandom();
}
{
  // FX8: at full lamps no roll gives the Golden Censer.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "var __seen = []; [0, 0.1, 0.5, 0.99].forEach(function(v){ Math.random = function(){ return v; }; tabletsRollBlessing(); __seen.push($('tablets-blessing-text').textContent); })");
  ok("at full lamps no roll gives the Golden Censer", read(sb, "__seen.join('|').indexOf('Censer') < 0"), read(sb, "__seen.join('|')"));
  eq("at full lamps the lamps stay at three", read(sb, "R.tabletLives"), 3);
  unstubRandom();
}
{
  // FX9: Judgment wears one seal and the lamps read aloud as a count.
  const sb = boot();
  exec(sb, "SAVE.set.tabletMode = 'judgment'; startRun('tablets','watchman')");
  eq("Judgment draws one seal", read(sb, "(tabletsSealsMarkup(1, 1).match(/tablets-seal/g) || []).length"), 1);
  ok("the one Judgment seal is not cracked", read(sb, "tabletsSealsMarkup(1, 1).indexOf('cracked') < 0"), true);
  exec(sb, "var __aria = {}; $('tablets-lamps').setAttribute = function(k, v){ __aria[k] = v; }; paintTabletsPowers()");
  eq("the lamps read Lamps: 1 lit", read(sb, "__aria['aria-label']"), "Lamps: 1 lit");
}
{
  // FX10: the HUD shows the multiplier the next carve pays: at streak 1 that is comboOf(2) = 1.5.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "R.streak = 1");
  eq("at streak 1 the HUD reads the 1.5 the next carve pays", read(sb, "tabletsTier(R.streak).mult"), 1.5);
}
{
  // FX11: a new run starts with no hitstop, no banked Manna sand, no milestone banner; the sand burns.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "R.tabletHitstop = 85; R.tabletBankSand = 15; $('tablets-milestone').classList.add('active'); endRun('abandon'); startRun('tablets','watchman')");
  eq("a new run has no hitstop", read(sb, "R.tabletHitstop"), 0);
  eq("a new run banks no Manna sand", read(sb, "R.tabletBankSand"), 0);
  eq("the milestone banner is down in a new run", read(sb, "$('tablets-milestone').classList.contains('active')"), false);
  stubRandom(sb, 0.9);
  exec(sb, "tabletsTick(R.tabletLast + 100)");
  ok("the sand burns in a new run", read(sb, "R.tabletClock") < 25, read(sb, "R.tabletClock"));
  unstubRandom();
}
{
  // FX12: a normal miss buzzes exactly once (no trauma double).
  const sb = boot();
  exec(sb, "var __vib = []; navigator.vibrate = function(p){ __vib.push(p); }; SAVE.set.haptics = true; startRun('tablets','watchman')");
  exec(sb, "tabletsPick(tabletsStoneButtons().filter(function(b){ return b.dataset.word.toLowerCase() !== tabletsGapBlank().a.toLowerCase(); })[0].dataset.word)");
  eq("a normal miss buzzes once", read(sb, "__vib.length"), 1);
}
{
  // FX12: under reduced motion neither a carve nor a miss buzzes.
  const sb = boot();
  exec(sb, "var __vib = []; navigator.vibrate = function(p){ __vib.push(p); }; SAVE.set.haptics = true; document.body.classList.add('reduced'); startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  exec(sb, "tabletsPick(tabletsStoneButtons().filter(function(b){ return b.dataset.word.toLowerCase() !== tabletsGapBlank().a.toLowerCase(); })[0].dataset.word)");
  eq("reduced motion buzzes for neither carve nor miss", read(sb, "__vib.length"), 0);
  unstubRandom();
}
{
  // FX13: the carve glow beats the urgent pulse (CSS source).
  ok("the success glow beats the urgent pulse", /\.tablets-slot\.glow\.urgent\{animation:none\}/.test(src));
}
{
  // FX14: --tablets-rise has no consumer and is not written.
  ok("--tablets-rise is not written any more", src.indexOf('setProperty("--tablets-rise"') < 0);
}
{
  // FX15: the roll targets the active gap line's offset, not the step top.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "$('tablets-verse').offsetTop = 200; $('tablets-verse').children[0].offsetTop = 60; $('tablets-roll').clientHeight = 400; R.gapIdx = 0; R.tabletRollSnap = true; paintTabletsClock()");
  ok("the roll snaps to the active line's top", Math.abs(read(sb, "R.tabletRollY") + 12) < 1e-9, read(sb, "R.tabletRollY"));
}
unstubRandom();
if (fail) {
```

### K-E1  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves KX1)

Why: tick(dt) runs the sand during the hit-resolve hold, so a carve with under 1 s left times out and loses the Hold. The guard gains the resolving gate.

Find (exactly once):

```kt
    fun tick(dt: Double) {
        if (ended || phase != TabletsPhase.Playing || untimed) return
```

Replace with:

```kt
    fun tick(dt: Double) {
        if (ended || phase != TabletsPhase.Playing || resolving || untimed) return
```

### K-E2  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves KX1)

Why: Regression test: a carve on the last grain with 0.3 s left must hold even when the sand is ticked during the resolve.

Find (exactly once):

```kt
    @Test
    fun winnowGreysThreeAndIlluminateCarvesTheTrueWord() {
```

Replace with:

```kt
    @Test
    fun carveDuringAHitResolveHoldsWhenTheSandRunsLow() {
        val session = start("psalm23")
        while (session.tabletIdx < session.steps.size - 1) {
            session.pick(session.currentBlank!!.a)
            session.finishResolve()
        }
        session.tick(24.7)
        assertEquals(0.3, session.tabletClock, 0.001)
        session.pick(session.currentBlank!!.a)
        assertTrue(session.resolving)
        session.tick(1.0)
        assertFalse(session.ended)
        session.finishResolve()
        assertTrue(session.ended)
        assertTrue(session.result!!.held)
        assertFalse(session.result!!.timeout)
    }

    @Test
    fun winnowGreysThreeAndIlluminateCarvesTheTrueWord() {
```

### K-E3  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves KX1)

Why: The old test asserted the sand kept running during a hit resolve (24.0 after tick(1.0)); that is the bug. The clock now stays frozen during the resolve and is reset after it.

Find (exactly once):

```kt
    fun clockKeepsRacingAfterAHit() {
        val session = start("psalm23")
        session.pick("want")
        assertTrue(session.resolving)
        session.tick(1.0)
        assertEquals(24.0, session.tabletClock, 0.001)
```

Replace with:

```kt
    fun clockFreezesWhileAHitResolves() {
        val session = start("psalm23")
        session.pick("want")
        assertTrue(session.resolving)
        session.tick(1.0)
        assertEquals(25.0, session.tabletClock, 0.001)
```

### K-E4  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves KX2)

Why: A Winnowed (grey) stone must not resolve, from any input path. The session check is the required one; the key handler in TabletsHoldScreen.kt is left as it is.

Find (exactly once):

```kt
        if (ended || phase != TabletsPhase.Playing || resolving || confirmAbandon) return
```

Replace with:

```kt
        if (ended || phase != TabletsPhase.Playing || resolving || confirmAbandon || word in grey) return
```

### K-E5  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves KX2)

Why: Regression test: after winnow(), picking a greyed decoy changes nothing (no attempt, no lamp spent, no resolve).

Find (exactly once):

```kt
        assertEquals(0, lit.illum)
    }
}
```

Replace with:

```kt
        assertEquals(0, lit.illum)
    }

    @Test
    fun aGreyDecoyCannotBePicked() {
        val session = start("psalm23")
        assertTrue(session.winnow())
        val attemptsBefore = session.attempts
        val lampsBefore = session.lampsLeft
        session.pick(session.grey.first())
        assertFalse(session.resolving)
        assertEquals(attemptsBefore, session.attempts)
        assertEquals(lampsBefore, session.lampsLeft)
    }
}
```

### K-E6  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, serves KX3)

Why: Stale tutorial copy: Illuminate now carves the true word (matches the web).

Find (exactly once):

```kt
"Illuminate glows the true stone for a breath",
```

Replace with:

```kt
"Illuminate carves the true word for you",
```

What does not change: no rule numbers, grades, Favor, combo, milestones or content. The spoken start line ("Two lamps guard the tablet") is a recorded clip and stays. game.js's paused-key handling (Ctrl+R while paused resumes) is out of scope.

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)                75 ms  applied 37 edits to 7 files
make-expected                   116678 ms  expected.json written: 1191 baseline files; changed: css/tablets.css, index.html, js/tablets-run.js, mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt, mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt, mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt, test/tablets.test.js
tamper-test (+ full gate post)  907571 ms  TAMPER-TEST: PASS  (control passed; 11 tampers)
scope-report pristine              123 ms  SCOPE VERDICT: READY  (37 edit(s) pending, 0 already applied)
scope-report dry-run               121 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 37 already applied)
scope-report (real project)        140 ms  SCOPE VERDICT: READY  (37 edit(s) pending, 0 already applied)
gate pre (real project)          57790 ms  RESULT: PASS  (36/36 checks passed, mode=pre)

# make-expected
expected.json written: 1191 baseline files; changed: css/tablets.css, index.html, js/tablets-run.js, mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt, mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt, mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt, test/tablets.test.js
tests before {"pass":77,"fail":0} (exit 0) -> after {"pass":77,"fail":0} (exit 0)
  anchor js/tablets-run.js:974 x1  function tabletsBurnSand(dt){
  anchor js/tablets-run.js:702 x1    } else if(!R.tabletResolving){
  anchor js/tablets-run.js:628 x1  function tabletsIlluminate(){
  anchor js/tablets-run.js:660 x1  function tabletsWinnow(){
  anchor js/tablets-run.js:1182 x1  function tabletsOnKey(e){
  anchor js/tablets-run.js:98 x1  function tabletsRollFrame(){
  anchor js/tablets-run.js:1443 x1  R.tabletClock <= 5 && !tabletsUntimed()
  anchor js/tablets-run.js:913 x1  setTimeout(function(){ tabletsFinishResolve(ok); }, ok ? 1000 : 800);
  anchor js/tablets-run.js:1246 x1  apply:function(){ R.tabletLives = (R.tabletLives || 3) + 1; } },
  anchor js/tablets-run.js:523 x1  function tabletsSealsMarkup(left){
  anchor js/tablets-run.js:888 x1  R.tabletHitstop = tabletsHitstopMs(carve);
  anchor js/tablets-run.js:94 x1  ms.style.setProperty("--tablets-rise"
  anchor index.html:608 x1  <span class="tablets-relic-effect">Banish three decoys</span>
  anchor mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt:182 x1  fun tick(dt: Double) {
  anchor mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt:479 x1  "Illuminate glows the true stone for a breath",

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (57/57 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (16/24 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-css/tablets.css  css/tablets.css is byte-identical , X-index.html  index.html is byte-identical to the dry, X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    a stray file was added -> RESULT: FAIL  (22/24 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S2  no file was added or deleted
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (23/24 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    edited file drifted by one byte: css/tablets.css -> RESULT: FAIL  (23/24 checks passed, mode=post)   caught by: X-css/tablets.css  css/tablets.css is byte-identical 
  OK    edited file drifted by one byte: index.html -> RESULT: FAIL  (23/24 checks passed, mode=post)   caught by: X-index.html  index.html is byte-identical to the dry
  OK    edited file drifted by one byte: test/tablets.test.js -> RESULT: FAIL  (23/24 checks passed, mode=post)   caught by: X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    edited file drifted by one byte: mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt -> RESULT: FAIL  (23/24 checks passed, mode=post)   caught by: X-mobile/core/src/main/kotlin/app/completetheverse/co
  OK    edited file drifted by one byte: mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt -> RESULT: FAIL  (23/24 checks passed, mode=post)   caught by: X-mobile/core/src/main/kotlin/app/completetheverse/co
  OK    edited file drifted by one byte: mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt -> RESULT: FAIL  (23/24 checks passed, mode=post)   caught by: X-mobile/core/src/test/kotlin/app/completetheverse/co
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (22/24 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S3  the other 1184 files are byte-identical to the ba
  OK    half-applied: edit "FX1" undone -> RESULT: FAIL  (23/24 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
TAMPER-TEST: PASS  (control passed; 11 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 0277411f59ee2fdcf61e5aa95e9e37b901d20f427071ebf103bb015c60163ce5
```

## 8. Not measured
- **Phones:** frame cost of the roll and the effects on a real phone is not measured.
- **A tutorial miss** no longer vibrates (the trauma buzz went with FX12); not asked about.
- **Endless finish bonus:** a Held Endless run still ends through "death" and gets no +300 XP; a design question, not fixed.
- **Android** UI behaviour is covered by Gradle unit tests only, not a device.
- **Web mutations** run the web suites only (Gradle runs for the 2 Android mutations and the full checks), to keep the gate under its time limit.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
