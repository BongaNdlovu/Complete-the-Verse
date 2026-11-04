# Plan: phase 3 — three lamps with pushback in the live Word Tablets run

**Status: plan only, nothing applied.** Branch `feat/tablets-arcade-phase-3`, based on `feat/tablets-arcade-phase-2`
(PR #2). Every number below was measured on this baseline by `fix-plan/prove.js`; the block marked GENERATED is
rendered from `fix-plan/measured.json` and `fix-plan/expected.json`, and `node fix-plan/render-plan.js --check` refuses
this document if the two disagree.

## 1. Goal
The live Hold starts with two lamps and a miss only takes one away: `R.tabletLives = 2` at
`js/tablets-run.js:763`, and `tabletsResolveMiss` at `:595` counts the miss without touching the sand. The arcade rules
already say what a miss does — `Tablets.rules.miss(lit, judgment, progress)` spends a lamp and pushes the sand back 45%
of the clock, and keeps at least 12% of it spent — and nothing calls it.

After this phase the Hold starts with **three lamps** (D1), a miss spends one and moves the sand by the rule, and the run
ends when the rule says no lamp is lit. Golden Censer still adds a lamp, so a fourth is possible. The two visible lines
that state the count ("Two lamps guard the Hold", the tutorial callout) say three, and the spoken line is left alone
because it is a recorded voice clip (`js/director.js` maps that exact sentence to `tablets-carve.mp3`).

**What "pushes the sand back" means exactly.** The rule is `progress = max(0.12, progress − 0.45)` on the elapsed
fraction, which is the download's own `resolveMistake` (`src/game/rules.ts`: `Math.max(0.12, currentProgress - 0.45)`).
So a miss on a well-spent clock pours sand back (90% gone → 45% gone, the clock more than triples), and a miss on a
*nearly full* clock settles the sand at 12% gone — the floor, not a gift of 45% of a clock that was almost full. The
tests say which case they mean: E11 pins the late miss giving sand back, E8 pins the fresh-clock miss landing on the
floor.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| F1 | `two lamps start the Hold` pins two lamps | `R.tabletLives = 2;` at js/tablets-run.js:763 | Stale rule · Decision D1: three lamps | E1 |
| F2 | `the clock does not reset after a miss` pins a miss that costs only a lamp: the sand never moves, and `Tablets.rules.miss` is uncalled | `tabletsResolveMiss` at js/tablets-run.js:595 increments the miss and nothing else | Missing rule · the phase spec: apply `Tablets.rules.miss` and set the clock to `max x (1 - result.progress)` | E2 |
| F3 | `the second miss ends the run` pins a second copy of the end condition — `tabletMiss < tabletLives` — that can drift from the rule | `tabletsFinishResolve` at js/tablets-run.js:684 | Duplicated rule | E3 (`R.tabletLampOut` is the rule's verdict) |
| F4 | Copy states two lamps: the under-tray line, the tutorial callout and the tray pill's static markup | index.html:576, index.html:589, js/tablets-run.js:128 | Stale copy · truth | E5, E6, E7 |
| F5 | `two lamps shown` and `no blessing at 0.9 lives` pin two lamps elsewhere in the suite | test/tablets.test.js | Stale tests · decided changes, listed below | E9, E10 |

**Decided changes to existing tests** (the executor plan's list, plus the two it did not name):
- `two lamps start the Hold` -> three lamps (E8);
- `the clock does not reset after a miss` -> the fresh-clock miss landing on the 12% floor (E8), with the late-miss gift
  pinned in E11;
- `lamps read one` moves to after the second miss, with `lamps read two` after the first (E8);
- `the second miss ends the run` -> `the third miss ends the run` (E8);
- `two lamps shown` -> `three lamps shown` (E9);
- `no blessing at 0.9 lives` -> 3 (E10).

## 2. Scope
- **Edited (3):** `js/tablets-run.js`, `index.html`, `test/tablets.test.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1171 files stay byte-identical. No file is added or deleted.
- **Invariants:** the grade/Favor rules phase 2 landed, the sand clock, the a–d keys (phase 4), the untimed tutorial
  and the phase-1 Hold rule are untouched.
- **`index.html` is not in the executor plan's file list, and this plan edits it anyway:** the two strings there are the
  visible lamp copy (`Lamps ×2` in the pill's static markup and "Two lamps guard the Hold" under the tray). Leaving them
  would ship a screen that states a number the run never starts with. They are two text-only lines; nothing else in the
  view changes.
- **Android is deliberately out of step after this PR:** `mobile/.../Tablets.kt:80` is `LIVES = 2` and the Kotlin run
  keeps it. Web runs will start with 3 lamps and Android with 2 until the Kotlin port of phases 2–5 (phase 8). This is
  said in the PR body, as the executor plan asks.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or
   `expected.json` to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped,
   skipped or made always-true. The six decided changes above are the only ones, the suite's assertion count rises, and
   the gate breaks the fixed code in 4 ways, each of which must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.** Section E lists the sha256 of every file in `fix-plan/`, measured by `prove.js` after the last
   edit.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 5 of the executor plan and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

- **Scope covered:** 3 files change (`js/tablets-run.js`, `index.html`, `test/tablets.test.js`) and 1171 stay
  byte-identical. The run changes in four places (E1–E4), two lines of view copy and one callout (E5–E7), and the suite
  in four (E8–E11).
- **What it entails:** the live Hold starts with one more lamp; a miss becomes a two-way event (a lamp and sand back);
  the end condition stops being a copy of the rule and becomes the rule's own verdict; and three visible strings stop
  claiming two lamps. The Kotlin run stays at two lamps until phase 8, which is a deliberate split across platforms.
- **What is in it:** E1 three lamps + the verdict flag, E2 the miss through `Tablets.rules.miss` and the pushback, E3
  the end condition, E4 the Golden Censer fallback, E5 the tutorial callout, E6/E7 the two index.html strings, E8–E11
  the tests (four restated assertions and two new blocks).
- **How it connects:** E2 writes `R.tabletLampOut`, E3 reads it — the same rule decides the lamp and the ending, so the
  "stop if" condition (the rules and the run disagreeing about when the run ends) cannot silently come true; E1 pins the
  count the tests and the copy then state (E8–E10, E5–E7); E4 keeps a possible fourth lamp counted from the right base;
  E11 proves the pushback and the Held-with-one-lamp direction. M1 (two lamps), M2 (no pushback), M3 (the last lamp does
  not end the run) and M4 (no floor) must each make `word tablets` FAIL.

**Stop and ask** if:
- the verdict isn't READY;
- an edit or goal isn't linked;
- the code doesn't match this plan;
- this document and `edits.js` disagree;
- the change affects something not mentioned here.

Otherwise, continue to section 5 without waiting. ALREADY APPLIED: run `gate.js post` and report; don't re-apply.

## 5. Steps (from `C:\Users\fanel\Downloads\ctv-push`)
```bash
node fix-plan/prove.js .              # required: PROVE: PASS (dry run, measurements, expected.json)
node fix-plan/render-plan.js --check  # required: PLAN-CHECK: PASS
node fix-plan/scope-report.js         # required: SCOPE VERDICT: READY
node fix-plan/gate.js pre             # required: RESULT: PASS, mode=pre; writes verified backups
node fix-plan/apply.js .              # required: applied 11 edits to 3 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post            # required: RESULT: PASS, mode=post
```
**On any other output:**
1. Copy each edited file back from `%TEMP%/fix-plan-backup` (`/` in the path is written as `__`).
2. Regenerate.
3. Report FAILED, quoting the `[FAIL]` lines.

What the gate checks (each check's result is in the report JSON it prints):
- **pre:** tooling hashes, a byte-identical baseline, anchors, line endings, invariants, the recorded test results,
  and verified backups.
- **post:**
  - only the planned files changed, each byte-identical to the dry run, with the rest unchanged;
  - invariants and the four extra checks (`content:check`, two `node --check`, `npm run lint`);
  - test tallies, names and statuses;
  - every mutation caught.

After the first FAIL, the gate skips the slow steps (`[SKIP]`), because the RESULT is FAIL anyway.

<!-- BEGIN GENERATED: PLAN FACTS -->
## A. The exact change (ground truth: `fix-plan/edits.js`)

### E1 E1 the Hold starts with three lamps (js/tablets-run.js)  (`js/tablets-run.js`, serves D1)

Why: D1: three lamps. The lamp-out flag is the rule's verdict for this run and starts clear.

Find (exactly once, line 762 of the file before this plan):

```js
  R.tabletMiss = 0;
  R.tabletLives = 2;
  R.tabletResolving = false;
```

Replace with:

```js
  R.tabletMiss = 0;
  R.tabletLives = 3;
  R.tabletLampOut = false;
  R.tabletResolving = false;
```

Protected by: M1

### E2 E2 a miss spends a lamp and pushes the sand back, as the rules say (js/tablets-run.js)  (`js/tablets-run.js`, serves D1)

Why: the spec: apply Tablets.rules.miss(lit,false,progress) and set the clock to max x (1 - result.progress); the run keeps tabletMiss/tabletLives bookkeeping and records the rule's verdict in R.tabletLampOut, so the two can never disagree about when the run ends.

Find (exactly once, line 595 of the file before this plan):

```js
function tabletsResolveMiss(){
  if(!R.tabletTutorial){
    R.tabletMiss = (R.tabletMiss || 0) + 1;
    R.streak = 0;
    R.surge = Math.max(0, (R.surge || 0) - 25);
  }
```

Replace with:

```js
function tabletsResolveMiss(){
  if(!R.tabletTutorial){
    /* D1: a miss spends a lamp and pushes the sand back. The rules decide
       both; the run applies the verdict and keeps the lamp count. */
    const lives = R.tabletLives || 1;
    const lit = Math.max(0, lives - (R.tabletMiss || 0));
    const max = R.tabletClockMax || tabletsClockMax() || 1;
    const cracked = Tablets.rules.miss(lit, false, Tablets.rules.progressOf(R.tabletClock, max));
    R.tabletMiss = lives - cracked.lit;
    R.tabletLampOut = !!cracked.ended;
    R.tabletClock = max * (1 - cracked.progress);
    R.streak = 0;
    R.surge = Math.max(0, (R.surge || 0) - 25);
  }
```

Protected by: M2, M3, M4

### E3 E3 the run ends when the rule says it ended (js/tablets-run.js)  (`js/tablets-run.js`, serves D1)

Why: the spec: end the run when result.ended. Comparing tabletMiss with tabletLives was the old, second copy of the rule.

Find (exactly once, line 684 of the file before this plan):

```js
    if(R.tabletTutorial || (R.tabletMiss || 0) < (R.tabletLives || 1)){
```

Replace with:

```js
    if(R.tabletTutorial || !R.tabletLampOut){
```

Protected by: M3

### E4 E4 the Golden Censer raises the fourth lamp from the new count (js/tablets-run.js)  (`js/tablets-run.js`, serves D1)

Why: the fallback counted from the old two-lamp run; a fourth lamp is still possible, but the fallback must not invent a third lamp for a run that already has three.

Find (exactly once, line 905 of the file before this plan):

```js
apply:function(){ R.tabletLives = (R.tabletLives || 2) + 1; } },
```

Replace with:

```js
apply:function(){ R.tabletLives = (R.tabletLives || 3) + 1; } },
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E5 E5 the tutorial callout names three lamps (js/tablets-run.js)  (`js/tablets-run.js`, serves D1)

Why: the callout is visible copy about the true Hold, so it has to state the lamp count the run now starts with.

Find (exactly once, line 128 of the file before this plan):

```js
    "Two lamps guard a wrong word. The sand is the Hold",
```

Replace with:

```js
    "Three lamps guard a wrong word. The sand is the Hold",
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E6 E6 the view's static lamp count is three (index.html)  (`index.html`, serves D1)

Why: the tray's lamps pill is rewritten on every paint, but its static markup said two; it must not state a number the run never starts with.

Find (exactly once, line 576 of the file before this plan):

```
          <span class="tablets-lamps" id="tablets-lamps">Lamps ×<b id="tablets-lamps-n">2</b></span>
```

Replace with:

```
          <span class="tablets-lamps" id="tablets-lamps">Lamps ×<b id="tablets-lamps-n">3</b></span>
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E7 E7 the under-tray copy names three lamps (index.html)  (`index.html`, serves D1)

Why: visible copy: "Two lamps guard the Hold" would be false from the first second of every run.

Find (exactly once, line 589 of the file before this plan):

```
        <div class="tablets-hold">Two lamps guard the Hold</div>
```

Replace with:

```
        <div class="tablets-hold">Three lamps guard the Hold</div>
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E8 E8 the lamp test plays three misses and the pushback (test/tablets.test.js)  (`test/tablets.test.js`, serves D1)

Why: decided changes, listed in FIX-PLAN.md: "two lamps start the Hold" becomes three; "the clock does not reset after a miss" becomes the pushback; "lamps read one" moves to after the second miss; "the second miss ends the run" becomes the third miss.

Find (exactly once, line 269 of the file before this plan):

```js
  eq("two lamps start the Hold", read(sb, "R.tabletLives"), 2);
  const clock = read(sb, "R.tabletClock");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the first miss spends a lamp, not the run", read(sb, "R.ended"), false);
  eq("one lamp is gone", read(sb, "R.tabletMiss"), 1);
  eq("the same blank re-arms", read(sb, "R.tabletIdx"), 0);
  eq("the clock does not reset after a miss", read(sb, "R.tabletClock"), clock);
  eq("the clock keeps racing after the crack", read(sb, "R.tabletRacing"), true);
  eq("lamps read one", read(sb, "$('tablets-lamps').textContent"), "Lamps ×1");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the second miss ends the run", read(sb, "R.ended"), true);
```

Replace with:

```js
  eq("three lamps start the Hold", read(sb, "R.tabletLives"), 3);
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the first miss spends a lamp, not the run", read(sb, "R.ended"), false);
  eq("one lamp is gone", read(sb, "R.tabletMiss"), 1);
  eq("the same blank re-arms", read(sb, "R.tabletIdx"), 0);
  eq("a miss on a fresh clock settles the sand at 12% gone",
    read(sb, "Math.abs((1 - R.tabletClock / R.tabletClockMax) - 0.12) < 1e-9"), true);
  eq("the clock keeps racing after the crack", read(sb, "R.tabletRacing"), true);
  eq("lamps read two", read(sb, "$('tablets-lamps').textContent"), "Lamps ×2");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the second miss takes the second lamp", read(sb, "R.tabletMiss"), 2);
  eq("the second miss is not the end", read(sb, "R.ended"), false);
  eq("lamps read one", read(sb, "$('tablets-lamps').textContent"), "Lamps ×1");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the third miss ends the run", read(sb, "R.ended"), true);
```

Protected by: M1, M2, M3

### E9 E9 the Illuminate block shows three lamps (test/tablets.test.js)  (`test/tablets.test.js`, serves D1)

Why: decided change: the same run now paints "Lamps ×3".

Find (exactly once, line 324 of the file before this plan):

```js
  eq("two lamps shown", read(sb, "$('tablets-lamps').textContent"), "Lamps ×2");
```

Replace with:

```js
  eq("three lamps shown", read(sb, "$('tablets-lamps').textContent"), "Lamps ×3");
```

Protected by: M1

### E10 E10 the no-blessing test starts from three lamps (test/tablets.test.js)  (`test/tablets.test.js`, serves D1)

Why: decided change: the run starts with three lamps, so a roll that changes nothing leaves three.

Find (exactly once, line 476 of the file before this plan):

```js
  eq("no blessing at 0.9 lives", read(sb, "R.tabletLives"), 2);
```

Replace with:

```js
  eq("no blessing at 0.9 lives", read(sb, "R.tabletLives"), 3);
```

Protected by: M1

### E11 E11 the four tests the phase spec asks for (test/tablets.test.js)  (`test/tablets.test.js`, serves D1)

Why: the spec's tests: a miss at progress 0.9 leaves the sand at progress 0.45, the floor of 0.12 holds, three misses end the run, and a run that finishes with one lamp lit is still Held.

Find (exactly once, line 567 of the file before this plan):

```js
{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
```

Replace with:

```js
{
  // Phase 3: a miss pushes the sand back, and the floor holds.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "R.tabletClock = 2.5");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("a miss at 90% gone leaves 45% gone",
    read(sb, "Math.abs((1 - R.tabletClock / R.tabletClockMax) - 0.45) < 1e-9"), true);
  ok("a late miss gives sand back", read(sb, "R.tabletClock") > 2.5);
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("the pushback floor holds at 12% gone",
    read(sb, "Math.abs((1 - R.tabletClock / R.tabletClockMax) - 0.12) < 1e-9"), true);
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("three misses shatter the tablet", read(sb, "R.ended"), true);
}

{
  // D1: a finished run with one lamp still lit is Held.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("two misses leave one lamp", read(sb, "$('tablets-lamps').textContent"), "Lamps ×1");
  stubRandom(sb, 0.9);
  holdAll(sb);
  eq("a run that ends on one lamp is still Held", read(sb, "Tablets.held(R)"), true);
}

{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
```

Protected by: M2, M3, M4

## B. Scope (measured on the baseline)

**1174 files** are in the recorded baseline; **3 change** (in 3 edited paths and 0 generated).

| edited file | bytes | lines | EOL | find at |
|---|---|---|---|---|
| `js/tablets-run.js` | 41174 | 1088 | CRLF | 762 |
| `js/tablets-run.js` | 41174 | 1088 | CRLF | 595 |
| `js/tablets-run.js` | 41174 | 1088 | CRLF | 684 |
| `js/tablets-run.js` | 41174 | 1088 | CRLF | 905 |
| `js/tablets-run.js` | 41174 | 1088 | CRLF | 128 |
| `index.html` | 58405 | 986 | CRLF | 576 |
| `index.html` | 58405 | 986 | CRLF | 589 |
| `test/tablets.test.js` | 35276 | 653 | CRLF | 269 |
| `test/tablets.test.js` | 35276 | 653 | CRLF | 324 |
| `test/tablets.test.js` | 35276 | 653 | CRLF | 476 |
| `test/tablets.test.js` | 35276 | 653 | CRLF | 567 |

Files that change: `index.html`, `js/tablets-run.js`, `test/tablets.test.js`.

Checks after the edits: `CI content:check still passes (no content source changes here)`; `js/tablets-run.js still parses`; `test/tablets.test.js still parses`; `CI lint (oxlint) still passes`.
## C. Anchors (measured by `make-expected.js`, re-checked by `gate pre`)

| file | line(s) | copies | text |
|---|---|---|---|
| `js/tablets-run.js` | 128 | 1 | `"Two lamps guard a wrong word. The sand is the Hold",` |
| `js/tablets-run.js` | 595 | 1 | `function tabletsResolveMiss(){` |
| `js/tablets-run.js` | 680 | 1 | `function tabletsFinishResolve(ok){` |
| `js/tablets-run.js` | 718 | 1 | `function tabletsBurnSand(dt){` |
| `js/tablets-run.js` | 752 | 1 | `function startTabletsLoop(){` |
| `js/tablets-run.js` | 763 | 1 | `R.tabletLives = 2;` |
| `js/tablets-run.js` | 905 | 1 | `Golden Censer (+1 Lamp Restored)` |
| `index.html` | 576 | 1 | `id="tablets-lamps-n"` |
| `index.html` | 589 | 1 | `Two lamps guard the Hold` |
| `test/tablets.test.js` | 269 | 1 | `"two lamps start the Hold"` |
| `test/tablets.test.js` | 279 | 1 | `"the second miss ends the run"` |
| `test/tablets.test.js` | 324 | 1 | `"two lamps shown"` |
| `test/tablets.test.js` | 476 | 1 | `"no blessing at 0.9 lives"` |
## D. Tests and proof (measured)

- The full run: 75 results, 75 PASS / 0 FAIL before -> 75 results, 75 PASS / 0 FAIL after.
- The plan's own suite (`test/tablets.test.js`): 5467 assertions before -> **5476 after**. No test was weakened or dropped.
- Every suite name and status after the plan is recorded in `fix-plan/expected.json`; any rename, drop or status change fails `gate post` check H3.
- These must PASS afterwards (13): `word tablets`, `content pipe`, `production readiness`, `interaction`, `keys`, `all game modes`, `ui structure`, `menu modes`, `integration`, `mobile layout`, `motion`, `game structure`, `edition logic`.
- Obsolete names that must no longer exist (0): none.

Mutations (each must make the named test FAIL, or the new tests prove nothing):

| # | what it breaks | file | must FAIL |
|---|---|---|---|
| M1 | the run starts with two lamps again | `js/tablets-run.js` | word tablets |
| M2 | a miss no longer pushes the sand back | `js/tablets-run.js` | word tablets |
| M3 | the last lamp no longer ends the run | `js/tablets-run.js` | word tablets |
| M4 | the pushback floor is gone, so the sand pours back to the top | `js/tablets.js` | word tablets |
## E. Pinned tooling (sha256, from `prove.js`)

| tool | sha256 |
|---|---|
| `fix-plan/config.js` | `192895d6735c43eeec2d37a56113b7508340cf4833ea2f3a3d97f16999c67e78` |
| `fix-plan/edits.js` | `0fb54b60920a9519887f89b19434ce32bca4bb184972c07ceea71413661b9197` |
| `fix-plan/apply.js` | `7c2aa2ed89fde06e94432469075d8e5cf4f2bfe6e9299ffb5fbdf8d33dffa024` |
| `fix-plan/lib.js` | `0ae73e6117cb2595af8bbd61a75cbab927f7f5a963b62910b6f7b82bb11fa93e` |
| `fix-plan/scope-report.js` | `4b2e2cae22f7cd71aa03f5b542c225364ab465559abb6589b155ec7ff4b3f296` |
| `fix-plan/make-expected.js` | `a44c6b89d95ac61db9722adb307cd61a345911bcb1fa2654f8e65ea96b7f8b13` |
| `fix-plan/prove.js` | `1f298e23c529fb3eb5d08791c60839ef3ee93057b050fe09e5e8d1b92852e4d4` |
| `fix-plan/render-plan.js` | `f76d7eee19613b9fbb396ec6c0277b5989505877c06d0a3fbcca948fe636a81e` |
<!-- END GENERATED: PLAN FACTS -->

## 6. Not measured
- **Balance.** No playtest: three lamps, a 45% pushback and the 12% floor against a 25s sand clock are untested for
  difficulty; they are the decided numbers (phase 1 ported them from the download's `resolveMistake`), not tuned ones.
  In particular, whether an *early* miss costing up to 12% of the clock feels right was not put in front of a player.
- **Android.** `Tablets.kt` keeps `LIVES = 2`; nothing native runs in this plan. The two builds disagree on the lamp
  count until phase 8, on purpose.
- **The spoken line.** `Director.speak("Carve the missing word. Two lamps guard the tablet.")` is a recorded clip
  (`tablets-carve.mp3`, mapped in `js/director.js`), so it still says two out loud. Re-recording is out of scope; the
  visible callout and the under-tray line are corrected.
- **A fourth lamp in practice.** The Golden Censer can raise the count above three, but no test rolls a blessing into a
  run with a lamp spent, so the fourth lamp is reasoned, not measured.

## 7. Execution report (2026-11-03, branch `feat/tablets-arcade-phase-3`)
1. **Scope analysis:** section 4; `node fix-plan/scope-report.js` printed
   `SCOPE VERDICT: READY  (11 edit(s) pending, 0 already applied)`.
2. **The gate:**
   - `node fix-plan/gate.js pre` -> `RESULT: PASS  (31/31 checks passed, mode=pre)`; report
     `%TEMP%\fix-plan-gate-report-pre.json`, sha256 `2c154716f9aa3686b23f2b8b6118be1ea13881d6faa9f6f271828fa8587f58f4`.
     It re-checked 1174 baseline files byte-identical, every anchor, every invariant, the line endings and all 11
     backup hashes, and recorded `75 results, 75 PASS / 0 FAIL`.
   - `node fix-plan/apply.js .` -> `applied 11 edits to 3 files`.
   - `node fix-plan/gate.js post` -> `RESULT: PASS  (31/31 checks passed, mode=post)`, exit code 0; report
     `%TEMP%\fix-plan-gate-report-post.json`, sha256 `c2294d17cf6657bda6348ebe93c58f9c996e646adc9a98b50e8e6b094fb1aac0`.
3. **The two quoted lines:** `S1  exactly these files changed: index.html, js/tablets-run.js, test/tablets.test.js`
   and `H1  tests: 75 results and at least 75 PASS`. The suite went from 5467 to 5476 assertions. All four mutations
   were caught: `MUT-M1` (two lamps), `MUT-M2` (no pushback), `MUT-M3` (the last lamp does not end the run), `MUT-M4`
   (no floor). `C-content` and `C-lint` passed.
4. **Independent review (a read-only subagent on the dry-run diff):** it confirmed the pushback arithmetic, the single
   end-condition gate, the lamp bookkeeping, the untimed tutorial and the absence of weakened tests, and it found one
   real defect: the test `ok("the miss gives sand back", …)` labelled a miss at a nearly full clock "sand back", while
   the rule's floor (`max(0.12, progress - 0.45)`, the download's own `resolveMistake`) actually *spends* up to 12% of
   the clock in that case. **Fixed before this record:** the mislabel and its assertion are gone; E8 now pins the
   fresh-clock miss landing on the 12% floor and E11 pins a late miss giving sand back (2.5s of sand -> 13.75s). The
   run code is unchanged since the browser check below, which is why that evidence still stands.
5. **Browser check (Chromium, 430x900, offline save, `%TEMP%\ctv-p3-browser\`):** `BROWSER CHECK: PASS`, zero console
   and page errors. The Hold opened at `Lamps ×3` with the under-tray copy `Three lamps guard the Hold`
   (`01-three-lamps.png`). Three misses on `want`, clicking a decoy each time: after miss 1 the clock was pinned at
   `21.98s` (12.07% gone — the rule's floor, so that early miss settled the sand at 12% rather than pouring it back) and
   the tray read `Lamps ×2`; after miss 2 the clock was `22.00s` (12.00%) and it read `Lamps ×1`; miss 3 set the rule's
   verdict (`ended`), the tray read `Lamps ×0` for the beat before the run closed, and the results screen read
   `THE TABLET SHATTERED` / `The Hold broke · psalm23 best — 0%` (`05-shattered.png`).
6. **Not run:** Android/Gradle (the Kotlin run keeps `LIVES = 2`; that is phase 8 and it is stated in the PR body); no
   balance playtest; the spoken line is a recorded clip and still says two out loud.
