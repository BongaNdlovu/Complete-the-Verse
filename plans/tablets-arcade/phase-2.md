# Plan: phase 2 — timing grades in the live Word Tablets run

**Status: plan only, nothing applied.** Branch `feat/tablets-arcade-phase-2`, based on `feat/tablets-arcade-phase-1`
(PR #1 is still open; nothing here pushes to it). Every number below was measured on this baseline by
`fix-plan/prove.js`; the block marked GENERATED is rendered from `fix-plan/measured.json` and
`fix-plan/expected.json`, and `node fix-plan/render-plan.js --check` refuses this document if the two disagree.

## 1. Goal
Phase 1 ported the arcade numbers into `Tablets.rules` and made the Hold follow the lamps, but the live run ignored
them: `js/tablets-run.js` read `Tablets.rules` 0 times, and a hit paid `(120 + sand x 8) x tier x 3 (surge) x trial`
while the Surge filled by how fast the player tapped. After this phase every carve is graded by the sand that is
left, the grade's points are the Favor (the trial stays an outer x2.5), the grade's fill charges the Surge, and Surge
pays x2 (D2). `js/tablets-run.js` reads `Tablets.rules` at three call sites afterwards: `comboOf`, `progressOf`,
`carve`.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| F1 | `first carve Favor is 480` and `trial Favor is 2.5×` pin the clock-only Favor: the sand's grade and the arcade combo pay nothing | `tabletsHitFavor` at js/tablets-run.js:607 computes `(120 + clock x 8) x tier x surge x trial` and never calls `Tablets.rules.carve` | Stale rule · Decision O2a: the carve's combo replaces the tier multiplier, the tier names stay a label | E4 (grade names, `tabletsCarve`, Favor from the carve's points), E3 (the pill shows the combo), E7/E9 (the two numbers restated), E10 (three new tests) |
| F2 | `fast hit charges surge 17` pins the elapsed-time Surge rule, so a careful player charges the Surge less than a fast one whatever grade they earn | `tabletsChargeSurge` at js/tablets-run.js:612 adds `elapsed < 4 ? 17 : 9` | Stale rule · the phase spec: "Surge fills by `c.fill` instead of the elapsed-time rule" | E5 (the elapsed-time rule is deleted), E6 (`R.surge += carve.fill`), E10 |
| F3 | `streak 3 multiplies by 2` pins the x1–x4 tier multiplier that O2a replaced: the HUD would advertise a multiplier the Favor no longer uses | `tabletsTier` at js/tablets-run.js:27 returns `mult:2` at streak 3 | Stale test · Decision O2a | E3 (`tabletsTier` reads `Tablets.rules.comboOf`), E8 (the number restated as 1.5) |

The tutorial is out of the grading: it stays untimed (`tabletsUntimed`), never fills the Surge, and its popup keeps
no grade word (`tabletsScoreText`). Its Favor is now the same carve as the true Hold's, because the old formula is
gone; the tutorial's popup is still plain `+N FAVOR`.

## 2. Scope
- **Edited (4):** `js/tablets.js`, `js/tablets-run.js`, `test/tablets.test.js`, `shared/content/manifest.json`,
  changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1169 files stay byte-identical. No file is added or deleted.
- **Invariants:** the sand burns exactly as before; the run still starts with two lamps (three lamps are phase 3);
  the a–d keys are still the old ones (typing is phase 4); the tutorial stays untimed; the phase-1 Hold rule is
  untouched.
- **The one closed value:** `js/tablets.js` is a hashed content source (`scripts/export-content.mjs`
  `SOURCE_FILES`), so E11 writes the `sourceHash` that `prove.js` computed from the edited sources; the `content`
  check runs the exporter's own `--check`, which is what CI runs.
- **Why `js/tablets.js` at all:** O2a makes the carve's combo the multiplier the HUD must show. The combo rule is
  already in `carve()`; E1 lifts it into `comboOf()` and exports it so the run reads the rule instead of copying it.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or
   `expected.json` to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped,
   skipped or made always-true. The suite goes from 5458 to 5466 assertions; the gate breaks the fixed code in
   4 ways, and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.** Section E lists the sha256 of every file in `fix-plan/`, measured by `prove.js` after the last
   edit; `gate.js` and `expected.json` are published again in section 5's report line.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 5 of the executor plan and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

- **Scope covered:** 4 files change (`js/tablets.js`, `js/tablets-run.js`, `test/tablets.test.js`,
  `shared/content/manifest.json`) and 1169 stay byte-identical. `js/tablets.js` changes in two places (E1, E2) plus
  the hash; the run in four (E3–E6); the suite in four (E7–E10).
- **What it entails:** the live run starts reading the rules module it was shipped with; the Favor stops being a
  function of the clock and becomes the graded carve; the Surge stops paying for speed and starts paying for the
  grade; the HUD's multiplier stops lying. It also moves one closed hash, which is the only value in the plan that
  could not be typed from the spec.
- **What is in it:** E1 `comboOf`, E2 its export, E3 the tier pill, E4 the grade names + `tabletsCarve` + Favor +
  popup text, E5 the deletion of the elapsed-time rule, E6 the hit path, E7–E9 the three restated numbers, E10 the
  three new tests, E11 the content hash.
- **How it connects:** E1 → E2 → E3 (the pill needs the exported rule); E4 → E6 (the hit pays the carve) → E7/E9
  (the old numbers are restated) → E10 (new tests pin the grade, the fill source, Surge x2 and the ungraded
  tutorial); E5 removes the code E6 replaces; E11 closes the hash E1/E2 moved. Each edit names its mutations; M1
  (grade band), M2 (Favor formula), M3 (fill source) and M4 (Surge x2 vs x3) must each make `word tablets` FAIL.

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
node fix-plan/apply.js .              # required: applied 11 edits to 4 files
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
  - invariants and the five extra checks (`content:check`, three `node --check`, `npm run lint`);
  - test tallies, names and statuses;
  - every mutation caught.

After the first FAIL, the gate skips the slow steps (`[SKIP]`), because the RESULT is FAIL anyway.

<!-- BEGIN GENERATED: PLAN FACTS -->
## A. The exact change (ground truth: `fix-plan/edits.js`)

### E1 E1 comboOf is the rules' own combo, exported for the HUD (js/tablets.js)  (`js/tablets.js`, serves O2)

Why: O2a: the carve combo multiplies Favor; the tier mult no longer does. The HUD has to show the multiplier that is really paid, so the rule is read from the rules module instead of being copied into the run.

Find (exactly once, line 374 of the file before this plan):

```js
  function carve(input){
    const streak = (input.streak || 0) + 1;
    const combo = Math.min(1 + Math.floor(streak / 2) * COMBO_STEP, COMBO_CAP);
```

Replace with:

```js
  /* The streak combo multiplies every carve; the tier names are only a label.
     Exported so the HUD shows the multiplier that is really paid. */
  function comboOf(streak){
    return Math.min(1 + Math.floor(Math.max(0, streak) / 2) * COMBO_STEP, COMBO_CAP);
  }
  function carve(input){
    const streak = (input.streak || 0) + 1;
    const combo = comboOf(streak);
```

Protected by: M2

### E2 E2 Tablets.rules exports comboOf (js/tablets.js)  (`js/tablets.js`, serves O2)

Why: the run reads it: tabletsTier() beside a tier name.

Find (exactly once, line 429 of the file before this plan):

```js
  return {
    GRADES: GRADES,
    progressOf: progressOf,
```

Replace with:

```js
  return {
    GRADES: GRADES,
    comboOf: comboOf,
    progressOf: progressOf,
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E3 E3 the tier pill shows the combo, not a dead tier multiplier (js/tablets-run.js)  (`js/tablets-run.js`, serves O2)

Why: O2a keeps the tier names as the streak label and drops the 1x-4x tier multiplier; the pill must not advertise a multiplier the Favor no longer uses.

Find (exactly once, line 27 of the file before this plan):

```js
function tabletsTier(streak){
  if(streak >= 8) return { name:"DIVINE PRESENCE", mult:4 };
  if(streak >= 5) return { name:"EXALTED", mult:3 };
  if(streak >= 3) return { name:"ANOINTED", mult:2 };
  if(streak >= 1) return { name:"SANCTIFIED", mult:1.5 };
  return { name:"DEVOTED", mult:1 };
}
```

Replace with:

```js
/* O2: the tier names stay as the streak label; the multiplier beside them is
   the carve's combo, because that is what the Favor is really multiplied by. */
function tabletsTier(streak){
  const n = streak || 0;
  const mult = Tablets.rules.comboOf(n);
  if(n >= 8) return { name:"DIVINE PRESENCE", mult:mult };
  if(n >= 5) return { name:"EXALTED", mult:mult };
  if(n >= 3) return { name:"ANOINTED", mult:mult };
  if(n >= 1) return { name:"SANCTIFIED", mult:mult };
  return { name:"DEVOTED", mult:mult };
}
```

Protected by: M2

### E4 E4 the hit is graded: grade names, the carve, and the Favor from its points (js/tablets-run.js)  (`js/tablets-run.js`, serves O2, D2, D4, O1)

Why: D4 with O1 names the four grades Fresh sand / Sure / Carved / Last grain; the carve reads the sand (Tablets.rules.progressOf) and pays its points as Favor, so the Surge multiplier is the rules' x2 (D2) and the trial stays an outer 2.5x (O2).

Find (exactly once, line 607 of the file before this plan):

```js
function tabletsHitFavor(){
  const t = tabletsTier(R.streak || 0);
  const mult = t.mult * (R.surgeOn ? 3 : 1) * (R.tabletTrial ? 2.5 : 1);
  return Math.round((120 + (R.tabletClock || 0) * 8) * mult);
}
```

Replace with:

```js
/* D4/O1: the arcade grade ids wear the game's words. */
const TABLET_GRADE_NAMES = { divine:"Fresh sand", sacred:"Sure", carved:"Carved", clutch:"Last grain" };
function tabletsGradeName(id){
  return TABLET_GRADE_NAMES[id] || "Sure";
}
/* The live run grades every carve from the sand that is left. The rules own
   the numbers (grade band, combo, Surge x2); the run only reads them. */
function tabletsCarve(){
  const max = R.tabletClockMax || tabletsClockMax() || 1;
  return Tablets.rules.carve({
    progress: Tablets.rules.progressOf(R.tabletClock, max),
    streak: R.streak || 0,
    surge: !!R.surgeOn
  });
}
/* O2: the carve's points are the Favor. Trial stays an outer 2.5x. */
function tabletsHitFavor(carve){
  return Math.round((carve.points || 0) * (R.tabletTrial ? 2.5 : 1));
}
/* The popup names the grade; the tutorial stays ungraded. */
function tabletsScoreText(carve, favor){
  if(R.tabletTutorial) return "+" + favor + " FAVOR";
  return tabletsGradeName(carve.grade) + " · +" + favor + " FAVOR";
}
```

Protected by: M1, M2, M4

### E5 E5 the elapsed-time Surge rule is gone (js/tablets-run.js)  (`js/tablets-run.js`, serves O2)

Why: the Surge fills by the grade (carve.fill) now, so the elapsed-time rule has no caller and would be dead code.

Find (exactly once, line 612 of the file before this plan):

```js
function tabletsChargeSurge(elapsed){
  if(R.tabletTutorial) return;
  /* Steps now carve 2–4 gaps each, so each gap charges roughly half the
     old per-blank rate — Surge stays earned, not ambient. */
  const add = elapsed < 4 ? 17 : 9;
  R.surge = Math.min(100, (R.surge || 0) + add);
}
```

Replace with:

_nothing: these lines are removed_

Protected by: M3

### E6 E6 a hit carves before the streak moves and fills the Surge by the grade (js/tablets-run.js)  (`js/tablets-run.js`, serves O2, D2)

Why: the carve needs the streak BEFORE the hit (it returns the next one), and the Surge now gains carve.fill instead of an elapsed-time add; the popup gains the grade word.

Find (exactly once, line 619 of the file before this plan):

```js
function tabletsResolveHit(){
  R.correct = (R.correct || 0) + 1;
  R.score = (R.score || 0) + 1;
  R.streak = (R.streak || 0) + 1;
  R.best = Math.max(R.best || 0, R.streak);
  const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  tabletsChargeSurge((now - (R.tabletBlankStart || now)) / 1000);
  const favor = tabletsHitFavor();
  R.favor = (R.favor || 0) + favor;
  const slot = $("tablets-slot");
  spawnTabletsScorePopup("+" + favor + " FAVOR", slot);
```

Replace with:

```js
function tabletsResolveHit(){
  R.correct = (R.correct || 0) + 1;
  R.score = (R.score || 0) + 1;
  /* The carve reads the streak before this hit and returns the next one. */
  const carve = tabletsCarve();
  R.streak = carve.streak;
  R.best = Math.max(R.best || 0, R.streak);
  if(!R.tabletTutorial) R.surge = Math.min(100, (R.surge || 0) + carve.fill);
  const favor = tabletsHitFavor(carve);
  R.favor = (R.favor || 0) + favor;
  const slot = $("tablets-slot");
  spawnTabletsScorePopup(tabletsScoreText(carve, favor), slot);
```

Protected by: M2, M3

### E7 E7 the Favor and Surge numbers the old formula pinned, restated (test/tablets.test.js)  (`test/tablets.test.js`, serves O2)

Why: decided change: 480 was (120 + 25x8) x 1 (DEVOTED) and 17 was the under-4s elapsed add. A fresh-sand carve at streak 0 now grades Fresh sand: 100 x 1.5 = 150, and that grade fills 28.

Find (exactly once, line 447 of the file before this plan):

```js
  eq("first carve Favor is 480", read(sb, "R.favor"), 480);
  eq("fast hit charges surge 17", read(sb, "R.surge"), 17);
```

Replace with:

```js
  eq("a fresh sand carve pays 150 Favor", read(sb, "R.favor"), 150);
  eq("fresh sand fills the surge 28", read(sb, "R.surge"), 28);
```

Protected by: M1, M2, M3

### E8 E8 the tier multiplier the test pinned is the combo now (test/tablets.test.js)  (`test/tablets.test.js`, serves O2)

Why: decided change: streak 3 used to multiply Favor by 2 (tier ANOINTED); the combo at streak 3 is 1.5, and that is what the pill shows.

Find (exactly once, line 452 of the file before this plan):

```js
  eq("streak 3 multiplies by 2", read(sb, "tabletsTier(R.streak).mult"), 2);
```

Replace with:

```js
  eq("streak 3 multiplies the carve by 1.5", read(sb, "tabletsTier(R.streak).mult"), 1.5);
```

Protected by: M2

### E9 E9 the trial Favor the old formula pinned, restated (test/tablets.test.js)  (`test/tablets.test.js`, serves O2)

Why: decided change: 1200 was 480 x 2.5; 150 x 2.5 = 375 now that the Favor is the carve points with the trial as an outer 2.5x.

Find (exactly once, line 528 of the file before this plan):

```js
  eq("trial Favor is 2.5×", read(sb, "R.favor"), 1200);
```

Replace with:

```js
  eq("trial Favor is 2.5×", read(sb, "R.favor"), 375);
```

Protected by: M2

### E10 E10 three tests for the grades (test/tablets.test.js)  (`test/tablets.test.js`, serves D4, O1, O2, D2)

Why: the phase spec's tests: a hit at a known clock gives a known grade and Favor, Surge fills by the grade, the tutorial has no grade, and Surge is x2 (D2).

Find (exactly once, line 531 of the file before this plan):

```js
{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
```

Replace with:

```js
{
  // Phase 2: the sand that is left grades the carve.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.tabletClock = 10; R.streak = 1; tabletsResolve(true); tabletsFinishResolve(true)");
  eq("a hit with 15s gone is Sure", read(sb, "tabletsGradeName('sacred')"), "Sure");
  eq("the popup names the grade and the Favor",
    read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "Sure · +180 FAVOR");
  eq("the Sure grade pays 180 Favor", read(sb, "R.favor"), 180);
  eq("the Sure grade fills the surge 20", read(sb, "R.surge"), 20);
  eq("the four grades wear the game's words",
    read(sb, "['divine','sacred','carved','clutch'].map(tabletsGradeName).join('|')"),
    "Fresh sand|Sure|Carved|Last grain");
}

{
  // D2: Surge doubles the carve.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.tabletClock = 10; R.streak = 1; R.surgeOn = true; tabletsResolve(true); tabletsFinishResolve(true)");
  eq("Surge doubles the Sure carve", read(sb, "R.favor"), 360);
  ok("Surge is not the old x3", read(sb, "R.favor !== 540"));
}

{
  // The tutorial stays ungraded and never fills the Surge.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'prayer',tabletTutorial:true})");
  exec(sb, "tabletsPick('Father')");
  eq("a tutorial hit carries no grade",
    read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "+150 FAVOR");
  eq("the tutorial never fills the surge", read(sb, "R.surge"), 0);
}

{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
```

Protected by: M1, M2, M3, M4

### E11 E11 the content hash of the edited rules module (shared/content/manifest.json)  (`shared/content/manifest.json`, serves O2)

Why: js/tablets.js is a hashed content source (scripts/export-content.mjs SOURCE_FILES), so the sourceHash must be the sha256 of the sources after E1 and E2. prove.js computed it; the content:check gate check proves it.

Find (exactly once, line 7 of the file before this plan):

```json
  "sourceHash": "5ab53fecf98786008f890481787c2ed2449f53cd1decb098572a4c3622cb4036",
```

Replace with:

```json
  "sourceHash": "92306984fcbf276f6b37951244e6245a19b2b3dcaaebedbd6cca3db7e320a79e",
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

## B. Scope (measured on the baseline)

**1173 files** are in the recorded baseline; **4 change** (in 4 edited paths and 0 generated).

| edited file | bytes | lines | EOL | find at |
|---|---|---|---|---|
| `js/tablets.js` | 27943 | 442 | CRLF | 374 |
| `js/tablets.js` | 27943 | 442 | CRLF | 429 |
| `js/tablets-run.js` | 40391 | 1071 | CRLF | 27 |
| `js/tablets-run.js` | 40391 | 1071 | CRLF | 607 |
| `js/tablets-run.js` | 40391 | 1071 | CRLF | 612 |
| `js/tablets-run.js` | 40391 | 1071 | CRLF | 619 |
| `test/tablets.test.js` | 33613 | 617 | CRLF | 447 |
| `test/tablets.test.js` | 33613 | 617 | CRLF | 452 |
| `test/tablets.test.js` | 33613 | 617 | CRLF | 528 |
| `test/tablets.test.js` | 33613 | 617 | CRLF | 531 |
| `shared/content/manifest.json` | 540 | 25 | CRLF | 7 |

Files that change: `js/tablets-run.js`, `js/tablets.js`, `shared/content/manifest.json`, `test/tablets.test.js`.

Checks after the edits: `CI content:check passes (js/tablets.js is a hashed content source)`; `js/tablets.js still parses`; `js/tablets-run.js still parses`; `test/tablets.test.js still parses`; `CI lint (oxlint) still passes`.
## C. Anchors (measured by `make-expected.js`, re-checked by `gate pre`)

| file | line(s) | copies | text |
|---|---|---|---|
| `js/tablets-run.js` | 27 | 1 | `function tabletsTier` |
| `js/tablets-run.js` | 49 | 1 | `function spawnTabletsScorePopup` |
| `js/tablets-run.js` | 607 | 1 | `function tabletsHitFavor` |
| `js/tablets-run.js` | 612 | 1 | `function tabletsChargeSurge` |
| `js/tablets-run.js` | 619 | 1 | `function tabletsResolveHit` |
| `js/tablets-run.js` | 626 | 1 | `const favor = tabletsHitFavor();` |
| `js/tablets.js` | 333 | 1 | `Tablets.rules = (function(){` |
| `js/tablets.js` | 345 | 1 | `const COMBO_STEP = 0.5, COMBO_CAP = 5;` |
| `js/tablets.js` | 359 | 1 | `function grade(progress){` |
| `js/tablets.js` | 374 | 1 | `function carve(input){` |
| `test/tablets.test.js` | 447 | 1 | `"first carve Favor is 480"` |
| `test/tablets.test.js` | 448 | 1 | `"fast hit charges surge 17"` |
| `test/tablets.test.js` | 528 | 1 | `"trial Favor is 2.5×"` |
| `shared/content/manifest.json` | 7 | 1 | `"sourceHash":` |
## D. Tests and proof (measured)

- The full run: 75 results, 75 PASS / 0 FAIL before -> 75 results, 75 PASS / 0 FAIL after.
- The plan's own suite (`test/tablets.test.js`): 5458 assertions before -> **5467 after**. No test was weakened or dropped.
- Every suite name and status after the plan is recorded in `fix-plan/expected.json`; any rename, drop or status change fails `gate post` check H3.
- These must PASS afterwards (13): `word tablets`, `content pipe`, `production readiness`, `interaction`, `keys`, `all game modes`, `ui structure`, `menu modes`, `integration`, `mobile layout`, `motion`, `game structure`, `edition logic`.
- Obsolete names that must no longer exist (0): none.

Mutations (each must make the named test FAIL, or the new tests prove nothing):

| # | what it breaks | file | must FAIL |
|---|---|---|---|
| M1 | the Sacred band moves from 0.65 to 0.5, so a Sure hit grades Carved | `js/tablets.js` | word tablets |
| M2 | the Favor formula reverts to the old clock-only one | `js/tablets-run.js` | word tablets |
| M3 | the Surge fills by a flat 9 instead of the grade | `js/tablets-run.js` | word tablets |
| M4 | Surge multiplies by 3 again instead of D2's x2 | `js/tablets.js` | word tablets |
## E. Pinned tooling (sha256, from `prove.js`)

| tool | sha256 |
|---|---|
| `fix-plan/config.js` | `ee78c22d2514a52f94a438f24997deb2d8b16f0b7abebed2a60d1e25705ce6c3` |
| `fix-plan/edits.js` | `3585a01ff9efef13fc3d1d73ef05f01fdc9d388671c71f503a6560dfeef30d99` |
| `fix-plan/apply.js` | `7c2aa2ed89fde06e94432469075d8e5cf4f2bfe6e9299ffb5fbdf8d33dffa024` |
| `fix-plan/lib.js` | `0ae73e6117cb2595af8bbd61a75cbab927f7f5a963b62910b6f7b82bb11fa93e` |
| `fix-plan/scope-report.js` | `4b2e2cae22f7cd71aa03f5b542c225364ab465559abb6589b155ec7ff4b3f296` |
| `fix-plan/make-expected.js` | `a44c6b89d95ac61db9722adb307cd61a345911bcb1fa2654f8e65ea96b7f8b13` |
| `fix-plan/prove.js` | `1f298e23c529fb3eb5d08791c60839ef3ee93057b050fe09e5e8d1b92852e4d4` |
| `fix-plan/render-plan.js` | `f76d7eee19613b9fbb396ec6c0277b5989505877c06d0a3fbcca948fe636a81e` |
<!-- END GENERATED: PLAN FACTS -->

## 6. Not measured
- **Balance.** No playtest: whether 150 Favor for a fresh-sand carve and 180 for a Sure one feel right against the
  pace I–III clocks is not measured.
- **The visual fit.** No browser run of the new popup text (`Last grain · +2135 FAVOR` is long) on a phone; the
  browser check is section 6 of the executor plan and is reported separately.
- **`js/tablets.js`'s other consumers.** `Tablets.rules` is read by `test/tablets.test.js` only; the Android port
  reads its own Kotlin rules (`Tablets.kt`), so this phase changes nothing native.
- **Milestones.** `Tablets.rules.carve` already adds the milestone bonus to its points, so a streak of 10 now pays
  +500 Favor in the live run before phase 5 surfaces it. That is the rules module's own number; the visible Tithe
  popup and the recharges are phase 5.

## 7. Execution report (2026-11-03, branch `feat/tablets-arcade-phase-2`)
1. **Scope analysis:** section 4; `node fix-plan/scope-report.js` printed
   `SCOPE VERDICT: READY  (11 edit(s) pending, 0 already applied)`.
2. **The gate:**
   - `node fix-plan/gate.js pre` -> `RESULT: PASS  (32/32 checks passed, mode=pre)`; report
     `%TEMP%\fix-plan-gate-report-pre.json`, sha256 `e508c833241cf442e180cda1e7a57a574de20206b87bfcf51933e3d7f6c69986`.
     It re-checked 1173 baseline files byte-identical, every anchor, every invariant, the line endings and all 14
     backup hashes, and recorded `75 results, 75 PASS / 0 FAIL`.
   - `node fix-plan/apply.js .` -> `applied 11 edits to 4 files`.
   - `node fix-plan/gate.js post` -> `RESULT: PASS  (32/32 checks passed, mode=post)`, exit code 0; report
     `%TEMP%\fix-plan-gate-report-post.json`, sha256 `08362c01b4fb534bbc351ec2090ff5f5481fe48761177ecd2c23dcd728b75648`.
3. **The two quoted lines:** `S1  exactly these files changed: js/tablets-run.js, js/tablets.js,
   shared/content/manifest.json, test/tablets.test.js` and `H1  tests: 75 results and at least 75 PASS`. The suite went
   from 5458 to 5467 assertions. All four mutations were caught: `MUT-M1` (grade band), `MUT-M2` (Favor formula),
   `MUT-M3` (fill source), `MUT-M4` (Surge x2 vs x3). `C-content` and `C-lint` passed.
4. **Independent review (a subagent with a fresh context, read-only, on the dry-run diff):** it found no functional
   bug and confirmed the Favor, the combo, the x2 Surge and the ungraded popup. It raised three minor items:
   (a) the tutorial's *score* still uses the grade's points (150) although its popup is ungraded — kept on purpose:
   the decision is about the visible grade, and the tutorial pays no XP; (b) `R.tabletBlankStart` is now write-only
   (its only reader, the deleted elapsed-time rule, is gone) — left untouched so this phase's scope stays the four
   files; (c) only the "Sure" grade word was asserted — **fixed in this run** by E10's fifth assertion, which pins
   all four names (`Fresh sand|Sure|Carved|Last grain`), hence 5467 rather than 5466.
5. **Browser check (Chromium, 430x900, offline save, `%TEMP%\ctv-p2-browser\`):** `BROWSER CHECK: PASS`, zero console
   and page errors. Start of the Hold: `Lamps ×2`, `DEVOTED 1.0×`, `24.2s`, Surge `0%`. An early carve of `want` at
   23.6s read `Fresh sand · +150 FAVOR` and filled the Surge to `28%` (`02-early-hit.png`). Waiting until 8.0s of sand
   were left (progress 0.68) and carving `pastures` read `Carved · +150 FAVOR`, then took Favor to `300` at streak 2,
   Surge to `42%` and the tier pill to `SANCTIFIED 1.5×` (`04-late-hit.png`). The tutorial carve of `Father` read
   plain `+150 FAVOR` under `Untimed Hold`, so it is still ungraded (`05-tutorial.png`). The popup text is right, but
   at 430px wide `CARVED · +150 FAVOR` spans nearly the whole manuscript and touches its right edge; a longer grade
   word (`Last grain · +…`) would clip. That needs CSS, which this phase does not touch.
6. **Not run:** Android/Gradle (phases 2–5 are web only and `Tablets.kt` is unchanged); no balance playtest; no
   judgement/endless (phase 6) and no rising-scroll visuals (phase 7).
