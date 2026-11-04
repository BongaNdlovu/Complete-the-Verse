# Plan: Word Tablets phase E — the juice (juice roadmap)

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

## 1. Goal
The final phase of the roadmap adds the arcade's *feeling* layer to the mechanics that are already in:

- **Grade bursts**: `spawnTabletsSparks` gains a color — gold for carves, a red 26-spark burst at the slot for misses.
- **Hit-stop**: the sim holds its breath 30 ms on an ordinary carve, 55 ms on Fresh sand / Last grain, 85 ms on a
  milestone — a time-debt in `tabletsTick` that pauses sand, surge, trauma and the roll but keeps the loop alive.
- **HUD kick**: the Favor and Streak numerals pop on every carve.
- **Milestone banner**: Tithe / Double portion / Jubilee rise top-center in the game's own words (J1) for ~2.4 s,
  with the Favor they paid; the strong milestone wash gilds the stage.
- **Stage washes**: a red flash on a miss, gold on a milestone (`#tablets-flash`).
- **Per-grade haptics**: 22 ms / [24,22,42] / [35,30,55,30,90] on carves, [65,35,95] on a miss, the long pattern
  when the last lamp dies — all gated on `SAVE.set.haptics` and skipped for the tutorial.
- **Scribe tick**: typed letters tick upward in pitch as the word fills.
- **Urgent slot**: the active slot pulses red past the danger band (phase C's `tabletsDangerLevel()`).
- Every effect sleeps under reduced motion (JS early returns + the reduced CSS gate list).

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| E1 | Carves and misses feel identical in the body | no hit-stop, no bursts, no haptics in the resolve paths (anchors E2-E7) | Presentation · roadmap phase E | E2-E8: colored sparks, hit-stop, haptics |
| E2 | Milestones exist but never announce themselves | the Favor popup is their only stage (scout) | Presentation · roadmap phase E | E1, E5, E8-E10: the banner + gold wash |
| E3 | The HUD and slot stay flat while the sand burns | no kick, no urgency (anchors) | Presentation · roadmap phase E | E5, E9-E10: kicks + urgent slot |

Out of scope, unchanged before and after: `js/tablets.js`, the roll math, the recharge celebration, phase B's
column, phase C's danger, phase D's seals and ladder (all invariant-pinned). No file is added or deleted.

## 2. Scope
- **Edited:** `index.html`, `js/tablets-run.js`, `css/tablets.css`, `test/tablets.test.js`, changed only by
  `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** the rest of the recorded baseline stays byte-identical.
- **Invariants:** the rules module (`rules`), the grade bands (`grades`), the recharge celebration (`recharge`),
  phase C's danger (`danger`), phase D's seals (`seals`), phase B's column (`column`), phase D's ladder
  (`ladder`), reduced motion hiding the canvas (`reduced-fx`). Extra checks: `export-content.mjs --check`,
  `node --check` on both JS files, oxlint.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or
   `expected.json` to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is
   written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped,
   skipped or made always-true. The gate breaks the fixed code in 7 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.** The pins are in section 6's measured block; `gate.js` and `expected.json` are pinned
   in the execution report.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections
1–2 and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 4 file(s) change (`index.html`, `js/tablets-run.js`, `css/tablets.css`,
  `test/tablets.test.js`) and the rest of the baseline stays identical.
- **What it entails.**
- **What is in it.**
- **How it connects with the plan:** each edit → its goal → the tests that must pass → its mutations.

**Stop and ask** if: the verdict isn't READY; an edit or goal isn't linked; the code doesn't match this plan;
this document and `edits.js` disagree; the change affects something not mentioned here.

Otherwise, continue to section 5 without waiting. ALREADY APPLIED: run `gate.js post` and report; don't re-apply.

## 5. Steps (from `C:\Users\fanel\Downloads\ctv-push`)
```bash
sha256sum fix-plan/gate.js fix-plan/expected.json   # must match the execution report's pins
node fix-plan/gate.js pre     # required: RESULT: PASS (mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 12 edits to 4 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (mode=post)
```
**On any other output:**
1. Copy each edited file back from `%TEMP%/fix-plan-backup` (`/` in the path is written as `__`).
2. Regenerate.
3. Report FAILED, quoting the `[FAIL]` lines.

## 6. The exact change, scope, anchors, tests and pins (measured)
<!-- BEGIN GENERATED: PLAN FACTS -->
## A. The exact change (ground truth: `fix-plan/edits.js`)

### E1 the banner and flash elements join the stage  (`index.html`, serves E-banner, E-flash)

Why: the milestone banner lives beside the ladder (outside #tablets-ms, whose last-child pins the score popup); the flash paints over the stage

Find (exactly once, line 516 of the file before this plan):

```
          <i class="tablets-ladder-marker" id="tablets-ladder-marker"></i>
        </div>
```

Replace with:

```
          <i class="tablets-ladder-marker" id="tablets-ladder-marker"></i>
        </div>
        <div class="tablets-milestone" id="tablets-milestone" aria-hidden="true">
          <span class="tablets-milestone-kicker">Milestone</span>
          <b id="tablets-milestone-name">Tithe</b>
          <em id="tablets-milestone-favor">+0 FAVOR</em>
        </div>
        <i class="tablets-flash" id="tablets-flash" aria-hidden="true"></i>
```

Protected by: M3, M5

### E2 the spark spawner takes a color  (`js/tablets-run.js`, serves E-bursts)

Why: grade-colored bursts: gold for carves, red for misses — same pool, same motion

Find (exactly once, line 1239 of the file before this plan):

```js
function spawnTabletsSparks(x, y, count){
  if(!tabletsFx.ctx || tabletsReduced()) return;
  const n = count || 16;
  let i = 0;
  for(; i < n; i++){
    const a = Math.random() * Math.PI * 2;
    const sp = 2 + Math.random() * 5;
    tabletsFx.sparks.push({
      x: x || tabletsFx.w / 2, y: y || tabletsFx.h * 0.45,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5,
      size: 1.5 + Math.random() * 2.5, life: 1, decay: 0.03
    });
  }
}
```

Replace with:

```js
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
```

Protected by: M2

### E3 the sparks draw their own color  (`js/tablets-run.js`, serves E-bursts)

Why: the draw reads the spark's color instead of the hard-coded gold

Find (exactly once, line 1392 of the file before this plan):

```js
    ctx.fillStyle = "rgba(255,225,130," + s.life + ")";
```

Replace with:

```js
    ctx.fillStyle = "rgba(" + (s.color || "255,225,130") + "," + s.life + ")";
```

Protected by: M2

### E4 hit-stop in the tick  (`js/tablets-run.js`, serves E-hitstop)

Why: a time-debt frozen in real frames: the sim (sand, surge, roll) pauses; the loop keeps re-arming

Find (exactly once, line 913 of the file before this plan):

```js
  const dt = Math.min((now - (R.tabletLast || now)) / 1000, 0.1);
  R.tabletLast = now;
```

Replace with:

```js
  const dt = Math.min((now - (R.tabletLast || now)) / 1000, 0.1);
  R.tabletLast = now;
  /* E: the world holds its breath after a carve (30/55/85 ms). */
  if(R.tabletHitstop > 0){
    R.tabletHitstop = Math.max(0, R.tabletHitstop - dt * 1000);
    R.tabletRaf = requestAnimationFrame(tabletsTick);
    return;
  }
```

Protected by: M1

### E5 the carve bursts, kicks, gongs and holds  (`js/tablets-run.js`, serves E-bursts, E-hitstop, E-haptics, E-banner, E-kick)

Why: hit-stop by grade, per-grade haptics, HUD kicks, gold flash + banner on milestones — all in the hit path beside the existing chime

Find (exactly once, line 809 of the file before this plan):

```js
  if(typeof Snd !== "undefined" && Snd.carve) Snd.carve();
```

Replace with:

```js
  if(typeof Snd !== "undefined" && Snd.carve) Snd.carve();
  /* E: the juice — hold, flash, kick, speak. */
  R.tabletHitstop = carve.milestone ? 85 : (carve.grade === "divine" || carve.grade === "clutch") ? 55 : 30;
  tabletsFlash("gold", !!carve.milestone);
  tabletsKick("tablets-favor");
  tabletsKick("tablets-streak");
  if(typeof navigator !== "undefined" && navigator.vibrate && SAVE.set.haptics){
    navigator.vibrate(carve.milestone ? [35, 30, 55, 30, 90] : (carve.grade === "divine" || carve.grade === "clutch") ? [24, 22, 42] : 22);
  }
  if(carve.milestone) tabletsMilestoneBanner(carve.milestone.streak, favor);
```

Protected by: M1, M3

### E6 the miss shatters red  (`js/tablets-run.js`, serves E-bursts, E-flash, E-haptics)

Why: a red burst at the slot, a red flash over the stage, the miss haptic — beside the existing shatter sound and trauma shake

Find (exactly once, line 712 of the file before this plan):

```js
  tabletsApplyTrauma(0.9);
```

Replace with:

```js
  tabletsApplyTrauma(0.9);
  /* E: the miss speaks in red. */
  tabletsFlash("miss", false);
  const missedSlot = $("tablets-slot");
  if(missedSlot && missedSlot.getBoundingClientRect){
    const r = missedSlot.getBoundingClientRect();
    spawnTabletsSparks(r.left + r.width / 2, r.top + r.height / 2, 26, "255,77,61");
  }
  if(typeof navigator !== "undefined" && navigator.vibrate && SAVE.set.haptics && !R.tabletTutorial){
    navigator.vibrate(R.tabletLampOut ? [90, 45, 120, 45, 180] : [65, 35, 95]);
  }
```

Protected by: M5

### E7 the scribe tick and the juice helpers  (`js/tablets-run.js`, serves E-tick, E-kick, E-banner, E-flash)

Why: the ascending keystroke tick; the kick, banner and flash helpers — all sleeping under reduced motion

Find (exactly once, line 1083 of the file before this plan):

```js
  R.tabletTyped = typed + k;
```

Replace with:

```js
  R.tabletTyped = typed + k;
  tabletsPlayScribeTick(typed.length / Math.max(1, need.length));
```

Protected by: M3, M4, M5

### E8 the juice helpers and the scribe tick  (`js/tablets-run.js`, serves E-tick, E-kick, E-banner, E-flash)

Why: pure-ish helpers beside the gold chime: kick, banner, flash, tick

Find (exactly once, line 123 of the file before this plan):

```js
function tabletsPlayGoldChime(){
```

Replace with:

```js
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
function tabletsPlayGoldChime(){
```

Protected by: M3, M4, M5

### E9 the kick, banner, flash and urgent slot styles  (`css/tablets.css`, serves E-kick, E-banner, E-flash)

Why: one block beside the ladder: the pop, the banner, the washes, the red slot pulse

Find (exactly once, line 121 of the file before this plan):

```
.tablets-ladder-marker{
  position:absolute;left:50%;width:9px;height:9px;transform:translate(-50%,-50%) rotate(45deg);
  background:linear-gradient(135deg,#fff2c6,#dfa544);box-shadow:0 0 10px rgba(255,224,130,.9);border:1px solid #fff}
```

Replace with:

```
.tablets-ladder-marker{
  position:absolute;left:50%;width:9px;height:9px;transform:translate(-50%,-50%) rotate(45deg);
  background:linear-gradient(135deg,#fff2c6,#dfa544);box-shadow:0 0 10px rgba(255,224,130,.9);border:1px solid #fff}
/* E: the juice — HUD kick, milestone banner, stage washes, urgent slot. */
.tablets-stat b.kick{animation:tabletsKick .34s cubic-bezier(.2,.9,.3,1.4)}
@keyframes tabletsKick{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
.tablets-milestone{
  position:absolute;top:64px;left:50%;transform:translateX(-50%) translateY(-12px);z-index:16;pointer-events:none;
  opacity:0;background:radial-gradient(circle at 50% 20%,#463016,#1f1307);border:1.5px solid var(--gold-hot);
  border-radius:12px;padding:8px 22px;text-align:center;box-shadow:0 10px 34px rgba(0,0,0,.8)}
.tablets-milestone.active{opacity:1;transform:translateX(-50%) translateY(0);transition:opacity .25s ease,transform .3s cubic-bezier(.2,1.2,.3,1)}
.tablets-milestone .tablets-milestone-kicker{display:block;font-family:var(--ui);font-size:.52rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gold-hot)}
.tablets-milestone b{display:block;font-family:var(--disp);font-size:1.05rem;color:#ffe8b8}
.tablets-milestone em{display:block;font-style:normal;font-family:var(--ui);font-size:.6rem;letter-spacing:.14em;color:#c9b088}
.tablets-flash{position:absolute;inset:0;z-index:15;pointer-events:none;opacity:0}
.tablets-flash.miss{background:radial-gradient(circle at 50% 50%,rgba(255,60,30,0) 40%,rgba(255,60,30,.32) 100%);animation:tabletsFlashWash .5s ease-out}
.tablets-flash.gold{background:radial-gradient(circle at 50% 50%,rgba(255,224,130,0) 30%,rgba(255,224,130,.3) 100%);animation:tabletsFlashWash .65s ease-out}
.tablets-flash.strong.gold{background:radial-gradient(circle at 50% 50%,rgba(255,224,130,0) 22%,rgba(255,236,180,.44) 100%)}
@keyframes tabletsFlashWash{0%{opacity:1}100%{opacity:0}}
.tablets-slot.urgent{border-color:#ff5238;animation:tabletsSlotUrgent .42s infinite alternate}
@keyframes tabletsSlotUrgent{from{box-shadow:inset 0 6px 15px rgba(0,0,0,.98),0 0 16px rgba(229,181,88,.3)}to{box-shadow:inset 0 6px 15px rgba(0,0,0,.98),0 0 22px rgba(255,60,30,.85)}}
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E10 the juice sleeps under reduced motion  (`css/tablets.css`, serves E-kick, E-banner, E-flash)

Why: the project's reduced gate list gains the kick, the banner, the washes and the slot pulse

Find (exactly once, line 482 of the file before this plan):

```
body.reduced .tablets-companion.failure img,
```

Replace with:

```
body.reduced .tablets-stat b.kick,
body.motion-calm .tablets-stat b.kick,
body.reduced .tablets-milestone,
body.motion-calm .tablets-milestone,
body.reduced .tablets-flash,
body.motion-calm .tablets-flash,
body.reduced .tablets-slot.urgent,
body.motion-calm .tablets-slot.urgent,
body.reduced .tablets-companion.failure img,
```

Protected by: M6

### E11 the phase E assertions  (`test/tablets.test.js`, serves E-hitstop, E-bursts, E-banner, E-flash, E-kick)

Why: hit-stop by grade and milestone, colored sparks pool and burn, the banner rises in the game's words, the flash wears its kind, reduced motion sleeps, the CSS exists

Find (exactly once, line 1211 of the file before this plan):

```js
unstubRandom();
if (fail) {
```

Replace with:

```js
{
  // E: the juice (roadmap phase E).
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.tabletClock = R.tabletClockMax * 0.5");
  exec(sb, "R.streak = 4; tabletsResolve(true); tabletsFinishResolve(true)");
  eq("an ordinary carve holds its breath 30 ms", read(sb, "R.tabletHitstop"), 30);
  exec(sb, "R.streak = 9; R.tabletClock = R.tabletClockMax * 0.2; tabletsResolve(true); tabletsFinishResolve(true)");
  eq("a milestone carve holds 85 ms", read(sb, "R.tabletHitstop"), 85);
  ok("the milestone banner rises in the game's words",
    read(sb, "$('tablets-milestone-name').textContent") === "Tithe" && read(sb, "$('tablets-milestone').classList.contains('active')"), read(sb, "$('tablets-milestone-name').textContent"));
  ok("the gold flash is on the stage", read(sb, "$('tablets-flash').classList.contains('gold')"), true);
  ok("the HUD numerals kick", read(sb, "$('tablets-favor').classList.contains('kick')"), true);
}
{
  // E: colored sparks pool with their color and burn out clean.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "var _ctx = { beginPath:function(){}, moveTo:function(){}, lineTo:function(){}, quadraticCurveTo:function(){}, closePath:function(){}, stroke:function(){}, fill:function(){}, arc:function(){}, clearRect:function(){} }; $('tablets-fx').getContext = function(){ return _ctx; }; tabletsFxInit()");
  exec(sb, "spawnTabletsSparks(10, 10, 3, '255,77,61')");
  eq("a red burst pools three sparks", read(sb, "tabletsFx.sparks.length"), 3);
  eq("the sparks carry their color", read(sb, "tabletsFx.sparks[0].color"), "255,77,61");
  exec(sb, "for(var i = 0; i < 60; i++) drawTabletsFx(0.1)");
  eq("the burst burns out", read(sb, "tabletsFx.sparks.length"), 0);
}
{
  // E: reduced motion sleeps through the juice.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "document.body.classList.add('reduced')");
  exec(sb, "R.streak = 9; tabletsResolve(true); tabletsFinishResolve(true)");
  eq("reduced motion skips the kick", read(sb, "$('tablets-favor').classList.contains('kick')"), false);
  eq("reduced motion skips the banner", read(sb, "$('tablets-milestone').classList.contains('active')"), false);
  eq("reduced motion skips the flash", read(sb, "$('tablets-flash').classList.contains('gold')"), false);
}
{
  // E: the juice styles exist and sleep under reduced motion.
  ok("the numerals kick", /\.tablets-stat b\.kick\{[^}]*animation:tabletsKick/.test(src));
  ok("the milestone banner is dressed", /\.tablets-milestone\.active\{[^}]*opacity:1/.test(src));
  ok("the stage washes exist", /\.tablets-flash\.miss\{/.test(src) && /\.tablets-flash\.gold\{/.test(src));
  ok("the urgent slot pulses", /\.tablets-slot\.urgent\{[^}]*animation:tabletsSlotUrgent/.test(src));
  ok("the juice sleeps under reduced motion", /body\.reduced \.tablets-stat b\.kick,/.test(src) && /body\.reduced \.tablets-flash,/.test(src));
}
unstubRandom();
if (fail) {
```

Protected by: M1, M2, M3, M4, M5, M6

## B. Scope (measured on the baseline)

**1191 files** are in the recorded baseline; **4 change** (in 4 edited paths and 0 generated).

| edited file | bytes | lines | EOL | find at |
|---|---|---|---|---|
| `index.html` | 59958 | 1013 | CRLF | 516 |
| `js/tablets-run.js` | 57654 | 1453 | CRLF | 1239 |
| `js/tablets-run.js` | 57654 | 1453 | CRLF | 1392 |
| `js/tablets-run.js` | 57654 | 1453 | CRLF | 913 |
| `js/tablets-run.js` | 57654 | 1453 | CRLF | 809 |
| `js/tablets-run.js` | 57654 | 1453 | CRLF | 712 |
| `js/tablets-run.js` | 57654 | 1453 | CRLF | 1083 |
| `js/tablets-run.js` | 57654 | 1453 | CRLF | 123 |
| `css/tablets.css` | 38582 | 587 | CRLF | 121 |
| `css/tablets.css` | 38582 | 587 | CRLF | 482 |
| `test/tablets.test.js` | 67997 | 1217 | CRLF | 1211 |

Files that change: `css/tablets.css`, `index.html`, `js/tablets-run.js`, `test/tablets.test.js`.

Checks after the edits: `CI content:check passes`; `js/tablets-run.js still parses`; `test/tablets.test.js still parses`; `CI lint (oxlint) still passes`.
## C. Anchors (measured by `make-expected.js`, re-checked by `gate pre`)

| file | line(s) | copies | text |
|---|---|---|---|
| `index.html` | 516 | 1 | `          <i class="tablets-ladder-marker" id="tablets-ladder-marker"></i>` |
| `js/tablets-run.js` | 1239 | 1 | `function spawnTabletsSparks(x, y, count){` |
| `js/tablets-run.js` | 1392 | 1 | `    ctx.fillStyle = "rgba(255,225,130," + s.life + ")";` |
| `js/tablets-run.js` | 913 | 1 | `  const dt = Math.min((now - (R.tabletLast \|\| now)) / 1000, 0.1);` |
| `js/tablets-run.js` | 809 | 1 | `  if(typeof Snd !== "undefined" && Snd.carve) Snd.carve();` |
| `js/tablets-run.js` | 712 | 1 | `  tabletsApplyTrauma(0.9);` |
| `js/tablets-run.js` | 1083 | 1 | `  R.tabletTyped = typed + k;` |
| `test/tablets.test.js` | 1212 | 1 | `if (fail) {` |
## D. Tests and proof (measured)

- The full run: 75 results, 75 PASS / 0 FAIL before -> 75 results, 75 PASS / 0 FAIL after.
- The plan's own suite (`test/tablets.test.js`): 9348 assertions before -> **9364 after**. No test was weakened or dropped.
- Every suite name and status after the plan is recorded in `fix-plan/expected.json`; any rename, drop or status change fails `gate post` check H3.
- These must PASS afterwards (14): `word tablets`, `motion`, `content pipe`, `production readiness`, `interaction`, `keys`, `all game modes`, `ui structure`, `menu modes`, `integration`, `mobile layout`, `game structure`, `edition logic`, `cloud merge`.
- Obsolete names that must no longer exist (0): none.

Mutations (each must make the named test FAIL, or the new tests prove nothing):

| # | what it breaks | file | must FAIL |
|---|---|---|---|
| M1 | the world never holds its breath | `js/tablets-run.js` | word tablets |
| M2 | the bursts lose their color | `js/tablets-run.js` | word tablets |
| M3 | the milestone banner never rises | `js/tablets-run.js` | word tablets |
| M4 | the HUD kick ignores reduced motion | `js/tablets-run.js` | word tablets |
| M5 | the flashes lose their kind | `js/tablets-run.js` | word tablets |
| M6 | the new effects wake under reduced motion | `css/tablets.css` | word tablets |
| M7 | the slot stops pulsing in danger | `js/tablets-run.js` | word tablets |
## E. Pinned tooling (sha256, from `prove.js`)

| tool | sha256 |
|---|---|
| `fix-plan/config.js` | `e30df0a4158ed15c43fa20eb98afec0feb82c599597701303033c1e4a97b06fc` |
| `fix-plan/edits.js` | `31c0c8a42b46095bfc3ee85e41655a3efd1f679285a6f865dedce7ffc11635af` |
| `fix-plan/apply.js` | `7c2aa2ed89fde06e94432469075d8e5cf4f2bfe6e9299ffb5fbdf8d33dffa024` |
| `fix-plan/lib.js` | `0ae73e6117cb2595af8bbd61a75cbab927f7f5a963b62910b6f7b82bb11fa93e` |
| `fix-plan/scope-report.js` | `4b2e2cae22f7cd71aa03f5b542c225364ab465559abb6589b155ec7ff4b3f296` |
| `fix-plan/make-expected.js` | `a44c6b89d95ac61db9722adb307cd61a345911bcb1fa2654f8e65ea96b7f8b13` |
| `fix-plan/prove.js` | `1f298e23c529fb3eb5d08791c60839ef3ee93057b050fe09e5e8d1b92852e4d4` |
| `fix-plan/render-plan.js` | `8ae53bf4ba058e1d8bf9259e2daeb19dc940378d9667aec13d85a83647c7257e` |
<!-- END GENERATED: PLAN FACTS -->

## 7. Not measured
- The tick audio's pitch curve on real speakers (WebAudio only; judged by ear in the browser pass).
- Hit-stop's feel against the 1000 ms resolve delay (the freeze runs during the fly-word window; judged by
  playing, not measured).
- The banner's stack against the score popup at the same instant (popup z15, banner z16).

## 8. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
