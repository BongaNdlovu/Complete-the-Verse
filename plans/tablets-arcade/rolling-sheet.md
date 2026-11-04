# Plan: Word Tablets, the rolling chapter sheet

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
After seeing phase 7, the user asked for the stage to roll like the download (decision R1, 2026-11-03): the whole chapter as a sheet, carved steps above, the current step in the middle, coming steps below, rising toward The Mark as the sand runs. Today only the current step's card moves, by a few pixels (phase 7). The game had a chapter roll once: 5ddb83d added it on 2026-09-01 and 6ced5be removed it the next day without saying why, and a test still pins "the roll is gone" (`sources/roll-sites.txt`). Every suite passes today, so there is no failing target; 8 mutations prove the new tests. End state: 12 edits applied to 5 files (section 7), every other file byte-identical.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| R1 | The chapter does not roll | the stage shows one step's card (`#tablets-verse`); phase 7 only nudges it | Decision R1: a rolling sheet, the step rising as a block | `#tablets-roll` window with past / current / next steps; `tabletsRollTarget` (entry 62% of the window, The Mark at the top) and `tabletsRollEase` (16% per frame, the download's easing); untimed snaps |
| R1-t | "the roll is gone" | test/tablets.test.js pins the 2026-09-02 removal | Stale test (decided change) | now "the chapter rolls in its own window" |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `js/tablets-run.js`, `index.html`, `css/tablets.css`, `test/tablets.test.js`, `test/motion.test.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1177 files stay byte-identical. No file is added or deleted.
- **Invariants:** the rise value (phase 7), the verse-line painter, the Favor formula, the step flow, the sand burn, the cuneiform glyphs and the rules module stay byte-identical. The current step keeps the same `#tablets-verse` DOM, so every existing test on it passes unchanged.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 8 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `ffafda078036d62c6adaf81a581380e6d1e725b3762e8ff0493b865ea1d4115c`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 5 file(s) change (`css/tablets.css`, `index.html`, `js/tablets-run.js`, `test/motion.test.js`, `test/tablets.test.js`) and 1177 stay identical.
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
node fix-plan/gate.js pre     # required: RESULT: PASS (30/30 checks passed, mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 12 edits to 5 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (39/39 checks passed, mode=post)
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
### E1 roll helpers replace the card rise  (`js/tablets-run.js`, serves R1)

Why: tabletsPaintRise now also moves the chapter sheet: the target puts the current step at 62% of the window on fresh sand and at The Mark when the sand is gone, eased 16% per frame; --tablets-rise is still set as before

Find (exactly once):

```js
function tabletsPaintRise(){
  const ms = $("tablets-ms");
  if(!ms || !ms.style || !ms.style.setProperty) return;
  ms.style.setProperty("--tablets-rise", String(Math.round(tabletsRiseOf() * 1000) / 1000));
}
```

Replace with:

```js
/* R1: the rolling chapter sheet. The current step's top sits at 62% of the roll window on fresh sand and at The
   Mark (the window's top) when the sand is gone; each frame eases 16% of the way to that spot. */
const TABLET_ROLL_ENTRY = 0.62;
const TABLET_ROLL_EASE = 0.16;
function tabletsRollTarget(windowH, stepTop, rise){
  return windowH * TABLET_ROLL_ENTRY * (1 - rise) - stepTop;
}
function tabletsRollEase(current, target, snap){
  if(snap) return target;
  return current + (target - current) * TABLET_ROLL_EASE;
}
function tabletsPaintRise(){
  const ms = $("tablets-ms");
  if(ms && ms.style && ms.style.setProperty) ms.style.setProperty("--tablets-rise", String(Math.round(tabletsRiseOf() * 1000) / 1000));
  tabletsRollFrame();
}
/* R1: untimed (tutorial, reduced motion) and a freshly painted step jump; otherwise the sheet eases toward its target. */
function tabletsRollFrame(){
  const win = $("tablets-roll"), sheet = $("tablets-sheet"), verse = $("tablets-verse");
  if(!win || !sheet || !verse) return;
  const snap = !!R.tabletRollSnap || tabletsUntimed();
  const target = tabletsRollTarget(win.clientHeight || 0, verse.offsetTop || 0, tabletsRiseOf());
  R.tabletRollY = tabletsRollEase(R.tabletRollY || 0, target, snap);
  R.tabletRollSnap = false;
  if(sheet.style) sheet.style.transform = "translateY(" + R.tabletRollY.toFixed(1) + "px)";
}
```

### E2 paint the carved steps above and the coming steps below  (`js/tablets-run.js`, serves R1)

Why: the sheet needs its steps: every step before tabletIdx is carved above, every step after it is blank below; a step change snaps the roll

Find (exactly once):

```js
    paintTabletsVerseLine(verse, blank, carved);
  });
}
```

Replace with:

```js
    paintTabletsVerseLine(verse, blank, carved);
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
```

### E3 a new run snaps its first roll  (`js/tablets-run.js`, serves R1)

Why: a new run starts with the sheet at The Mark, not easing from the last run position

Find (exactly once):

```js
  R.tabletPass = 1;
  R.tabletEndlessHeld = false;
```

Replace with:

```js
  R.tabletPass = 1;
  /* R1: the first paint of a run snaps the roll. */
  R.tabletRollSnap = true;
  R.tabletRollY = 0;
  R.tabletEndlessHeld = false;
```

### E4 the roll keeps the step in view instead of scrollIntoView  (`js/tablets-run.js`, serves R1)

Why: scrollIntoView would fight the roll transform; the old body still runs when there is no roll window

Find (exactly once):

```js
function tabletsKeepGapInView(){
  try{
```

Replace with:

```js
function tabletsKeepGapInView(){
  /* R1: the roll keeps the step in view; scrollIntoView would fight its transform. */
  if($("tablets-roll")) return;
  try{
```

### E5 markup: the roll window holds the sheet around the current verse  (`index.html`, serves R1)

Why: the current step keeps #tablets-verse (its DOM and the tests on it are unchanged); the carved steps and the coming steps sit in the sheet around it, inside a clipping window

Find (exactly once):

```html
<p class="tablets-verse" id="tablets-verse"></p>
```

Replace with:

```html
<div class="tablets-roll" id="tablets-roll">
            <div class="tablets-sheet" id="tablets-sheet">
              <div class="tablets-sheet-past" id="tablets-sheet-past"></div>
              <p class="tablets-verse" id="tablets-verse"></p>
              <div class="tablets-sheet-next" id="tablets-sheet-next"></div>
            </div>
          </div>
```

### E6 CSS: phase 7 card rise retired  (`css/tablets.css`, serves R1)

Why: the card no longer translates; the roll moves the sheet, so the phase 7 translate and its variable go

Find (exactly once):

```css
.tablets-ms{--tablets-rise-px:clamp(10px,4vh,40px)}
.tablets-slot,.tablets-verse{translate:0 calc((1 - var(--tablets-rise, 1)) * var(--tablets-rise-px, 0px));transition:translate .3s ease-out}
```

Replace with:

```css
/* R1: the phase 7 card rise (translate) is retired; the roll moves .tablets-sheet from tabletsPaintRise. */
```

### E7 CSS: the roll window and the sheet  (`css/tablets.css`, serves R1)

Why: the window clips the sheet to a fixed band, fading at the bottom; the sheet moves by transform; carved and coming steps read dimmer than the current verse; phones get a shorter window Height follows the room left on screen (browser-measured: the 40vh window pushed the sand bar under the tray at 1280x800; this fits 1024x768, 1366x768, 1280x800 and 1920x1080).

Find (exactly once):

```css
.tablets-verse{margin-bottom:calc(14px + var(--tablets-rise-px, 0px))}
```

Replace with:

```css
/* R1: the rolling chapter sheet. The window clips the carved steps above and the coming steps below. */
.tablets-roll{position:relative;height:clamp(120px,calc(100vh - 640px),380px);overflow:hidden;margin:0 0 12px;-webkit-mask-image:linear-gradient(180deg,#000 0,#000 78%,transparent 100%);mask-image:linear-gradient(180deg,#000 0,#000 78%,transparent 100%)}
.tablets-sheet{will-change:transform}
.tablets-sheet .tablets-verse{margin:0 0 10px;min-height:0}
.tablets-sheet-step{opacity:.42;margin:0 0 10px}
.tablets-sheet-past .tablets-sheet-step{opacity:.55}
@media (max-width:640px){.tablets-roll{height:clamp(170px,34vh,320px)}}
```

### E8 CSS: reduced motion stops the sheet transition  (`css/tablets.css`, serves R1)

Why: the sheet and the verse take no transition under reduced or calm motion; the sheet itself is pinned by the JS snap

Find (exactly once):

```css
body.reduced .tablets-slot,body.reduced .tablets-verse,body.motion-calm .tablets-slot,body.motion-calm .tablets-verse{translate:none;transition:none}
```

Replace with:

```css
body.reduced .tablets-sheet,body.reduced .tablets-verse,body.motion-calm .tablets-sheet,body.motion-calm .tablets-verse{transition:none}
```

### E9 motion hook renamed for the sheet  (`test/motion.test.js`, serves R1)

Why: the reduced-motion hook still names .tablets-verse, now inside the rolling sheet

Find (exactly once):

```js
[".tablets-verse", "tablets rising card"]
```

Replace with:

```js
[".tablets-verse", "tablets rolling sheet"]
```

### E10 test: the roll markup assertion is inverted  (`test/tablets.test.js`, serves R1)

Why: the old assertion said the roll was gone; this design brings a roll window back, so the markup must carry it

Find (exactly once):

```js
ok("the roll is gone", html.indexOf('id="tablets-roll"') < 0);
```

Replace with:

```js
ok("the chapter rolls in its own window", html.indexOf('id="tablets-roll"') >= 0);
ok("the sheet carries the steps above and below", html.indexOf('id="tablets-sheet-past"') >= 0 && html.indexOf('id="tablets-sheet-next"') >= 0);
```

### E11 test: phase 7 CSS asserts replaced  (`test/tablets.test.js`, serves R1)

Why: the translate rise is gone and the reduced rule now stops the sheet; the roll window must clip with overflow hidden

Find (exactly once):

```js
  ok("the card rises with translate, so the glow scale still composes", /\.tablets-slot,\.tablets-verse\{translate:0 calc\(/.test(riseCss));
  ok("reduced motion sets translate:none on the rising card", /body\.reduced[^{]*\{translate:none/.test(riseCss));
```

Replace with:

```js
  ok("the roll window clips the sheet with overflow hidden", /\.tablets-roll\{[^}]*overflow:hidden/.test(riseCss));
  ok("reduced motion sets transition:none on the rolling sheet", /body\.reduced[^{]*\.tablets-sheet[^{]*\{transition:none\}/.test(riseCss));
  ok("phase 7's translate rise is gone, the roll moves the sheet instead", !/translate:0 calc\(/.test(riseCss));
```

### E12 tests: roll math, sheet paint, snap  (`test/tablets.test.js`, serves R1)

Why: pins the target and ease formulas, the Psalm 23 sheet before and after a finished step, and the untimed snap

Find (exactly once):

```js
unstubRandom();
if (fail) {
```

Replace with:

```js
{
  const sb = boot();
  ok("the roll target is 62% of the window on fresh sand", Math.abs(read(sb, "tabletsRollTarget(400, 0, 0)") - 248) < 1e-9, read(sb, "tabletsRollTarget(400, 0, 0)"));
  ok("the roll target is The Mark when the sand is gone", Math.abs(read(sb, "tabletsRollTarget(400, 0, 1)")) < 1e-9, read(sb, "tabletsRollTarget(400, 0, 1)"));
  ok("the roll target takes the step's top off the entry line", Math.abs(read(sb, "tabletsRollTarget(400, 30, 0.5)") - 94) < 1e-9, read(sb, "tabletsRollTarget(400, 30, 0.5)"));
  ok("the roll eases 16% of the way each frame", Math.abs(read(sb, "tabletsRollEase(0, 100, false)") - 16) < 1e-9, read(sb, "tabletsRollEase(0, 100, false)"));
  ok("an untimed roll jumps straight to its target", read(sb, "tabletsRollEase(0, 100, true)") === 100, read(sb, "tabletsRollEase(0, 100, true)"));
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "paintTabletsTablet()");
  eq("a fresh Psalm 23 run carves no steps above", read(sb, "$('tablets-sheet-past').children.length"), 0);
  eq("the coming steps sit below the current one", read(sb, "$('tablets-sheet-next').children.length"), read(sb, "R.tabletSteps.length - 1"));
  eq("a coming line shows its blank", read(sb, "$('tablets-sheet-next').children[0].children[0].children[2].textContent"), "___");
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "for(var i = 0; i < 20 && R.tabletIdx === 0; i++){ tabletsResolve(true); tabletsFinishResolve(true); }");
  eq("a finished step rolls into the sheet above", read(sb, "$('tablets-sheet-past').children.length"), 1);
  ok("the carved step above shows its answers", read(sb, "$('tablets-sheet-past').children[0].children.map(function(l){ return l.children.map(function(c){ return c.textContent; }).join(''); }).join(' ')").indexOf("want") >= 0 && read(sb, "$('tablets-sheet-past').children[0].children.map(function(l){ return l.children.map(function(c){ return c.textContent; }).join(''); }).join(' ')").indexOf("pastures") >= 0);
  eq("the coming steps drop by the one just carved", read(sb, "$('tablets-sheet-next').children.length"), read(sb, "R.tabletSteps.length - 2"));
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "$('tablets-verse').offsetTop = 200; $('tablets-roll').clientHeight = 400; document.body.classList.add('reduced'); paintTabletsClock()");
  eq("reduced motion snaps the roll to The Mark in one paint", read(sb, "R.tabletRollY"), -200);
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "$('tablets-verse').offsetTop = 200; $('tablets-roll').clientHeight = 400; R.tabletRollSnap = false; R.tabletRollY = 0; paintTabletsClock()");
  ok("an ordinary frame eases 16% of the way to the target", Math.abs(read(sb, "R.tabletRollY") - 48 * 0.16) < 1e-9, read(sb, "R.tabletRollY"));
}
unstubRandom();
if (fail) {
```

What does not change: no rule, timing or power changes; only how the chapter is painted and moved. Phase 7's card translate is replaced by the roll; the glyphs stay.

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)                71 ms  applied 12 edits to 5 files
make-expected                    47012 ms  expected.json written: 1182 baseline files; changed: css/tablets.css, index.html, js/tablets-run.js, test/motion.test.js, test/tablets.test.js
tamper-test (+ full gate post)  173136 ms  TAMPER-TEST: PASS  (control passed; 9 tampers)
scope-report pristine              100 ms  SCOPE VERDICT: READY  (12 edit(s) pending, 0 already applied)
scope-report dry-run                95 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 12 already applied)
scope-report (real project)         84 ms  SCOPE VERDICT: READY  (12 edit(s) pending, 0 already applied)
gate pre (real project)          25071 ms  RESULT: PASS  (30/30 checks passed, mode=pre)

# make-expected
expected.json written: 1182 baseline files; changed: css/tablets.css, index.html, js/tablets-run.js, test/motion.test.js, test/tablets.test.js
tests before {"pass":75,"fail":0} (exit 0) -> after {"pass":75,"fail":0} (exit 0)
  anchor js/tablets-run.js:55 x1  function tabletsRiseOf(){
  anchor js/tablets-run.js:59 x1  function tabletsPaintRise(){
  anchor js/tablets-run.js:191 x1  function paintTabletsVerse(stepBlanks, gapIdx, answer){
  anchor js/tablets-run.js:238 x1  function tabletsKeepGapInView(){
  anchor index.html:554 x1  <p class="tablets-verse" id="tablets-verse"></p>
  anchor css/tablets.css:158 x1  .tablets-slot,.tablets-verse{translate:0 calc((1 - var(--tablets-rise,
  anchor css/tablets.css:181 x1  .tablets-verse{margin-bottom:calc(14px + var(--tablets-rise-px, 0px))}
  anchor css/tablets.css:397 x1  body.reduced .tablets-slot,body.reduced .tablets-verse,body.motion-cal
  anchor test/tablets.test.js:1072 x1  ok("the card rises with translate, so the glow scale still composes"

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (39/39 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (19/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-css/tablets.css  css/tablets.css is byte-identical , X-index.html  index.html is byte-identical to the dry, X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    a stray file was added -> RESULT: FAIL  (23/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S2  no file was added or deleted
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    edited file drifted by one byte: index.html -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-index.html  index.html is byte-identical to the dry
  OK    edited file drifted by one byte: css/tablets.css -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-css/tablets.css  css/tablets.css is byte-identical 
  OK    edited file drifted by one byte: test/tablets.test.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    edited file drifted by one byte: test/motion.test.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-test/motion.test.js  test/motion.test.js is byte-id
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (23/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S3  the other 1177 files are byte-identical to the ba
  OK    half-applied: edit "E1 roll helpers replace the card rise" undone -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
TAMPER-TEST: PASS  (control passed; 9 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 ffafda078036d62c6adaf81a581380e6d1e725b3762e8ff0493b865ea1d4115c
```

## 8. Not measured
- **Why the first roll was removed** (6ced5be) is not recorded; not investigated beyond the commit message.
- **The window height** follows the room left on screen, `clamp(120px, calc(100vh - 640px), 380px)`: the first draft's 40vh window pushed the sand bar under the tray at 1280x800 (sand bottom 581 vs tray top 560, `sources/roll-fit.txt`). The phone keeps its own rule.
- **The feel** is checked only in the browser; the sandbox has no layout (clientHeight and offsetTop are undefined there), so the roll math is tested as pure functions plus one snap test with set values.
- **Long chapters:** painting every step each repaint is not timed.
- **Android:** no roll there (A1).
- **CI:** the stacked PR targets the phase 8c branch; `ci.yml` runs on PRs to master only.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
