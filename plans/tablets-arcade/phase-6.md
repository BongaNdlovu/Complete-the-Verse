# Plan: Word Tablets phase 6, Judgment and Endless

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
Word Tablets has one way to play a chapter today: three lamps (`R.tabletLives = 3;`, js/tablets-run.js:810), and the run ends at the chapter end (`endRun("complete")`, :753). Phase 6 adds the two arcade modes the user chose (P1–P4, 2026-11-03): Judgment (one lamp) and Endless (the chapter reads again on shorter sand), picked in the library. A Sonnet review of the first dry run found three defects (R1–R3) and three smaller ones (R4–R6); they are part of this plan. Every suite passes today, so there is no failing target; 20 mutations prove the new tests. End state: 32 edits applied to 12 files (section 7), every other file byte-identical, every required suite passing.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| P1 | No way to pick a mode | none exists; the run always starts with three lamps (:810) | Decision: library selector, saved, fixed for the run; road and tutorial are Hold | `Tablets.modeOf`, `#brief-tablets-modes`, `R.tabletMode` |
| P2 | No Judgment | the miss passes `false` for judgment (js/tablets-run.js:609) | Decision: Hold + a Judgment mark, no extra Favor | `Tablets.rules.lampsFor`, the judgment flag, `rec.judgment`, "Judgment kept" |
| P3 | No Endless | the chapter end always ends the run (:753) | Decision: loops, sand by `blankSeconds`, first reading Holds | `tabletsNextReading`, `tabletsStepSeconds`, `Tablets.held` clause, `rec.endlessBest` |
| P4 | Trial with the modes | — | Decision: stacks, unchanged | nothing changes; a test pins it |
| R1 | The cloud merge would drop `judgment` / `endlessBest` | `mergeTablets` rebuilds `{best, held}` only (js/cloud.js:333, `sources/p6-round3-sites.txt`) | Real bug (review) | carry both through the merge |
| R2 | Golden Censer would show "Lamps ×2" in Judgment | the blessing has no mode gate (js/tablets-run.js:990) | Real bug (review) | drop the Censer from Judgment's pool |
| R3 | A Held Endless run that runs out of sand plays "The Tablet Shattered" | timeout checked before held (js/director.js:299) | Real bug (review) | `R.tabletTimeout && !held` |
| R4–R6 | "37 / 15" in Endless results; focus lost on a mode pick; `tabletsFinishResolve` at the lint limit | js/results.js:523; the repaint; the review's complexity count | Real bug (review, low) | `tabletsWordsCarvedText`, refocus, `tabletsChapterDone` |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `js/tablets.js`, `js/tablets-run.js`, `js/game.js`, `js/briefs.js`, `js/results.js`, `index.html`, `css/tablets.css`, `js/cloud.js`, `js/director.js`, `test/tablets.test.js`, `test/cloud.test.js`, `shared/content/manifest.json`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1166 files stay byte-identical. No file is added or deleted.
- **Invariants:** the Favor formula (no Judgment bonus), the grade names, typing, the sand burn rate (Trial still 1.35x), the untimed tutorial, Winnow, and the rules' miss and carve functions stay byte-identical. `js/tablets.js` changes, so the manifest `sourceHash` moves (measured on a copy, `sources/p6-sites.txt`).

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 20 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `8976ff9094807bf8820928ee106e86ee2e203159edc29963020493498decfa1c`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 12 file(s) change (`css/tablets.css`, `index.html`, `js/briefs.js`, `js/cloud.js`, `js/director.js`, `js/game.js`, `js/results.js`, `js/tablets-run.js`, `js/tablets.js`, `shared/content/manifest.json`, `test/cloud.test.js`, `test/tablets.test.js`) and 1166 stay identical.
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
node fix-plan/gate.js pre     # required: RESULT: PASS (45/45 checks passed, mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 32 edits to 12 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (62/62 checks passed, mode=post)
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
### E1 Tablets.modeOf reads the saved mode  (`js/tablets.js`, serves P1)

Why: the mode is chosen once in the library and fixed for the run; a road run or the tutorial is always a Hold, and an unknown saved mode reads as Hold

Find (exactly once):

```js
  function editionKey(id){
```

Replace with:

```js
  /* P1: the library picks the mode and the run keeps it. Road runs and the tutorial are always a Hold. */
  const MODES = ["hold", "judgment", "endless"];
  function modeOf(save, tutorial, fromRoad){
    if(tutorial || fromRoad) return "hold";
    const saved = save && save.set && save.set.tabletMode;
    return MODES.indexOf(saved) >= 0 ? saved : "hold";
  }
  function editionKey(id){
```

### E2 Tablets exports modeOf  (`js/tablets.js`, serves P1)

Why: game.js reads the mode through Tablets.modeOf, so it must be on the exported object next to held

Find (exactly once):

```js
    held: held,
```

Replace with:

```js
    held: held,
    modeOf: modeOf,
```

### E3 startRunTabletState carries the mode  (`js/game.js`, serves P1)

Why: the run state gets its mode from Tablets.modeOf (Hold when Tablets is missing); keeps startRunTabletState flat

Find (exactly once):

```js
  return { chapter: chapter, tutorial: tutorial, level: level, fromRoad: !!(options && options.fromRoad) };
```

Replace with:

```js
  const fromRoad = !!(options && options.fromRoad);
  /* P1: the saved mode is read here and fixed for the run; a road run or the tutorial is a Hold. */
  const runMode = (typeof Tablets !== "undefined" && Tablets.modeOf) ? Tablets.modeOf(SAVE, tutorial, fromRoad) : "hold";
  return { chapter: chapter, tutorial: tutorial, level: level, fromRoad: fromRoad, mode: runMode };
```

### E4 assignStartRun stores tabletMode on R  (`js/game.js`, serves P1)

Why: R.tabletMode is what the run reads for lamps, the sand, the miss rule and the record

Find (exactly once):

```js
    tabletTutorial: tab.tutorial,
```

Replace with:

```js
    tabletTutorial: tab.tutorial,
    tabletMode: tab.mode,
```

### E5 library mode row  (`js/briefs.js`, serves P1)

Why: three mode buttons and the selected mode note sit above the chapter list; the picked one is marked on and aria-pressed The current mode comes from Tablets.modeOf, the same validation the run uses (R5).

Find (exactly once):

```js
function paintTabletsBrief(on){
```

Replace with:

```js
/* P1: Hold, Judgment and Endless above the chapter list. The note says what the picked mode asks. */
const TABLET_MODES = [
  { id:"hold", name:"Hold", note:"Three lamps · finish with one still lit to Hold" },
  { id:"judgment", name:"Judgment", note:"One lamp · the first wrong word ends the Hold" },
  { id:"endless", name:"Endless", note:"The chapter reads again and the sand runs shorter · the first reading Holds" }
];
function tabletsBriefModes(){
  const current = (typeof Tablets !== "undefined" && Tablets.modeOf) ? Tablets.modeOf(SAVE, false, false) : "hold";
  const row = document.createElement("div");
  row.className = "tablets-mode-row";
  let picked = TABLET_MODES[0];
  TABLET_MODES.forEach(function(m){
    const on = m.id === current;
    if(on) picked = m;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tablets-mode-btn" + (on ? " on" : "");
    b.dataset.tabletMode = m.id;
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.textContent = m.name;
    row.appendChild(b);
  });
  const note = document.createElement("p");
  note.className = "tablets-mode-note";
  note.textContent = picked.note;
  row.appendChild(note);
  return row;
}
function paintTabletsBriefModes(on){
  const modes = $("brief-tablets-modes");
  if(!modes) return;
  modes.hidden = !on;
  modes.innerHTML = "";
  if(on) modes.appendChild(tabletsBriefModes());
}
function paintTabletsBrief(on){
```

### E6 paintTabletsBrief repaints the mode host  (`js/briefs.js`, serves P1)

Why: the mode row lives in its own host (#brief-tablets-modes), so the chapter list and its section count stay as they were; paintTabletsBrief repaints the row first

Find (exactly once):

```js
function paintTabletsBrief(on){
  const host = $("brief-tablets-pick");
```

Replace with:

```js
function paintTabletsBrief(on){
  paintTabletsBriefModes(on);
  const host = $("brief-tablets-pick");
```

### E7 mode host click saves the pick and repaints  (`js/briefs.js`, serves P1)

Why: a click on a mode button saves SAVE.set.tabletMode and repaints; it does not start a run; the chapter click listener is unchanged After the repaint the picked button gets keyboard focus back (R5). Browser check: row.children is an HTMLCollection there, so it is copied before filter().

Find (exactly once):

```js
if(tabletsPickHost) tabletsPickHost.addEventListener("click", function(e){
  const btn = e.target.closest("[data-chapter]");
```

Replace with:

```js
/* R5: after a repaint the picked mode keeps keyboard focus. */
function tabletsFocusModeBtn(id){
  const host = $("brief-tablets-modes");
  const row = host && host.children[0];
  /* children is an HTMLCollection in a browser, so copy it before filtering. */
  const kids = row ? Array.prototype.slice.call(row.children) : [];
  const pick = kids.filter(function(c){ return c.dataset && c.dataset.tabletMode === id; })[0];
  if(pick && pick.focus) pick.focus();
}
const tabletsModesHost = $("brief-tablets-modes");
if(tabletsModesHost) tabletsModesHost.addEventListener("click", function(e){
  const modeBtn = e.target.closest("[data-tablet-mode]");
  if(!modeBtn) return;
  /* P1: the picked mode is saved; the next run reads it and keeps it. */
  SAVE.set.tabletMode = modeBtn.dataset.tabletMode;
  if(typeof persist === "function") persist();
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
  paintTabletsBrief(true);
  tabletsFocusModeBtn(modeBtn.dataset.tabletMode);
});
if(tabletsPickHost) tabletsPickHost.addEventListener("click", function(e){
  const btn = e.target.closest("[data-chapter]");
```

### E8 chapter button shows the Judgment mark and the Endless best  (`js/briefs.js`, serves P2, P3)

Why: the library keeps the Judgment mark and the Endless record beside the chapter (only for an unlocked chapter)

Find (exactly once):

```js
best.textContent = locked ? "·" : (rec.best || 0) + "%";
```

Replace with:

```js
best.textContent = locked ? "·" : (rec.best || 0) + "%";
  /* P2/P3: the library keeps the Judgment mark and the Endless record. */
  if(!locked && rec.judgment) sub.textContent += " · Judgment kept";
  if(!locked && rec.endlessBest) sub.textContent += " · Endless best " + rec.endlessBest;
```

### E9 mode row styles  (`css/tablets.css`, serves P1)

Why: the three mode buttons and the note fit the chapter list; the picked button glows like a chapter button on hover

Find (exactly once):

```css
.tablets-ch-group{margin:0 0 1.5em}
```

Replace with:

```css
.tablets-ch-group{margin:0 0 1.5em}
.tablets-mode-row{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 1.1em}
.tablets-mode-btn{flex:1;min-height:44px;padding:.5em .9em;
  background:linear-gradient(180deg,rgba(92,61,22,.9),rgba(27,17,7,.96));border:1px solid rgba(225,183,99,.72);
  color:#ffe7b5;font-family:var(--disp);letter-spacing:.08em;text-transform:uppercase;font-size:.85rem}
.tablets-mode-btn.on{border-color:var(--gold-hot);box-shadow:0 0 14px rgba(217,182,103,.28)}
.tablets-mode-note{flex-basis:100%;margin:.5em 0 0;font-family:var(--body);font-style:italic;font-size:.82rem;color:#c9b088}
#brief-tablets-modes{display:block;width:min(640px,94vw);margin:2vh auto 0;padding:0 6px 0 2px}
#brief-tablets-modes[hidden]{display:none}
```

### E10 Tablets.rules.lampsFor  (`js/tablets.js`, serves P2)

Why: Judgment starts with one lamp; every other mode keeps Hold's three

Find (exactly once):

```js
  /* O3: Winnow banishes min(3, decoys - 1), so it never clears the tray. */
```

Replace with:

```js
  /* P2: Judgment starts with one lamp; the other modes keep three. */
  const LAMPS = 3;
  function lampsFor(mode){
    return mode === "judgment" ? 1 : LAMPS;
  }
  /* O3: Winnow banishes min(3, decoys - 1), so it never clears the tray. */
```

### E11 rules export lampsFor  (`js/tablets.js`, serves P2)

Why: the run asks the rules how many lamps a mode starts with

Find (exactly once):

```js
    blankSeconds: blankSeconds,
    winnowCount: winnowCount,
```

Replace with:

```js
    blankSeconds: blankSeconds,
    lampsFor: lampsFor,
    winnowCount: winnowCount,
```

### E12 held ignores nothing new (Endless clause)  (`js/tablets.js`, serves P3)

Why: an Endless run that finished its first reading is Held, however it ends (the final isFinished line is unchanged)

Find (exactly once):

```js
    if(!run) return false;
```

Replace with:

```js
    if(!run) return false;
    /* P3: an Endless run that finished its first reading is Held, however it ends. */
    if(run.tabletEndlessHeld) return true;
```

### E13 startTabletsLoop takes its lamps from the mode  (`js/tablets-run.js`, serves P2)

Why: the lamps a run starts with come from the rules (one for Judgment, three otherwise)

Find (exactly once):

```js
  R.tabletLives = 3;
```

Replace with:

```js
  R.tabletLives = Tablets.rules.lampsFor(R.tabletMode);
```

### E14 a miss uses the Judgment flag  (`js/tablets-run.js`, serves P2)

Why: the miss rule gets the Judgment flag so a Judgment miss ends at once (with one lamp it ends either way; the flag keeps the rule the single source)

Find (exactly once):

```js
    const cracked = Tablets.rules.miss(lit, false, Tablets.rules.progressOf(R.tabletClock, max));
```

Replace with:

```js
    const cracked = Tablets.rules.miss(lit, R.tabletMode === "judgment", Tablets.rules.progressOf(R.tabletClock, max));
```

### E15 Judgment mark on a Hold  (`js/results.js`, serves P2)

Why: a Judgment finish that is Held keeps a judgment mark on the chapter record; no Favor change

Find (exactly once):

```js
  if(nowHeld) rec.held = true;
```

Replace with:

```js
  if(nowHeld) rec.held = true;
  /* P2: a Judgment Hold keeps its mark on the chapter record, shown in the library. */
  if(nowHeld && R.tabletMode === "judgment") rec.judgment = true;
  /* P3: Endless keeps the most words carved, whatever the run ends on. */
  if(R.tabletMode === "endless") rec.endlessBest = Math.max(rec.endlessBest || 0, R.correct || 0);
```

### E16 footer note names the run lamps  (`index.html`, serves P2)

Why: the footer names the lamps this run really has, not always three

Find (exactly once):

```html
<div class="tablets-hold">Three lamps guard the Hold</div>
```

Replace with:

```html
<div class="tablets-hold" id="tablets-hold-note">Three lamps guard the Hold</div>
```

### E17 run helpers: reading names, sand, next reading, footer note  (`js/tablets-run.js`, serves P2, P3)

Why: new small run functions: the reading names, the Endless sand, the start of the next reading, and the footer note by mode (tutorial is a Hold)

Find (exactly once):

```js
function startTabletsLoop(){
```

Replace with:

```js
/* P3: an Endless run reads the chapter again; the reading names count the passes. */
const TABLET_READINGS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
function tabletsReadingName(n){
  const word = TABLET_READINGS[n - 1];
  return word ? word + " reading" : "Reading " + n;
}
/* P3: an Endless step's sand is ramped by the words carved so far (the rules' blankSeconds). */
function tabletsStepSeconds(){
  const base = tabletsClockMax();
  if(R.tabletMode !== "endless") return base;
  return Tablets.rules.blankSeconds(base, R.correct || 0, R.streak || 0, false);
}
/* P3: finishing a reading Holds the chapter; the same words come round again on shorter sand. */
function tabletsNextReading(){
  R.tabletEndlessHeld = true;
  R.tabletPass = (R.tabletPass || 1) + 1;
  R.tabletIdx = 0;
  R.gapIdx = 0;
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
  const mode = R.tabletTutorial ? "hold" : R.tabletMode;
  el.textContent = TABLET_MODE_NOTES[mode] || TABLET_MODE_NOTES.hold;
}
function startTabletsLoop(){
```

### E18 startTabletsLoop starts the first reading on the mode sand  (`js/tablets-run.js`, serves P3)

Why: the first step uses the mode sand (Endless ramps it, the other modes keep 25s); the reading counter and the Endless Hold flag start clean

Find (exactly once):

```js
  R.tabletClock = tabletsClockMax();
  R.tabletClockMax = R.tabletClock;
  R.tabletTimeout = false;
```

Replace with:

```js
  R.tabletClock = tabletsStepSeconds();
  R.tabletClockMax = R.tabletClock;
  R.tabletPass = 1;
  R.tabletEndlessHeld = false;
  R.tabletTimeout = false;
```

### E19 startTabletsLoop paints the footer note  (`js/tablets-run.js`, serves P2)

Why: the footer note matches the mode when the run starts

Find (exactly once):

```js
  paintTabletsTray();
  R.tabletLast = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
```

Replace with:

```js
  paintTabletsTray();
  tabletsPaintModeNote();
  R.tabletLast = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
```

### E20 finishing the chapter: Endless reads on, others end as today  (`js/tablets-run.js`, serves P3)

Why: an Endless run that finishes a reading starts the next one (no end); a Hold or Judgment chapter end is unchanged The branch lives in tabletsChapterDone (R6), which keeps tabletsFinishResolve under the oxlint complexity limit.

Find (exactly once):

```js
  if(R.tabletIdx >= ((R && R.tabletSteps) || []).length){
    if(R.tabletTutorial) finishTabletsTutorial();
    else if(typeof endRun === "function") endRun("complete");
    return;
  }
```

Replace with:

```js
  if(R.tabletIdx >= ((R && R.tabletSteps) || []).length && tabletsChapterDone()) return;
```

### E21 each step re-arms on the mode sand  (`js/tablets-run.js`, serves P3)

Why: every step after a carve gets the mode sand (Endless ramps it by words carved); clockMax follows so the bar reads right

Find (exactly once):

```js
    R.tabletClock = tabletsClockMax();
    R.tabletLastWarnSec = -1;
```

Replace with:

```js
    R.tabletClock = tabletsStepSeconds();
    R.tabletClockMax = R.tabletClock;
    R.tabletLastWarnSec = -1;
```

### E22 an Endless record reads 100% once Held  (`js/results.js`, serves P3)

Why: the record for an Endless Hold is the whole chapter (100%), however the run ends

Find (exactly once):

```js
  const pct = Math.round(((R.tabletIdx || 0) / (R.tabletTotal || 1)) * 100);
```

Replace with:

```js
  const pct = R.tabletEndlessHeld ? 100 : Math.round(((R.tabletIdx || 0) / (R.tabletTotal || 1)) * 100);
```

### E23 tests for phase 6  (`test/tablets.test.js`, serves P1, P2, P3, P4)

Why: the new behaviour is pinned: the Judgment lamp and mark, the Endless readings and sand and record, the road and tutorial Hold, the Trial stack, the names, the note and the library mode row Includes the round-3 tests (Golden Censer in Judgment, the Endless ending, the words-carved text).

Find (exactly once):

```js
unstubRandom();
if (fail) {
```

Replace with:

```js
{
  const sb = boot();
  exec(sb, "SAVE.set.tabletMode = 'judgment'; startRun('tablets','watchman')");
  eq("Judgment starts with one lamp", read(sb, "R.tabletLives"), 1);
  eq("Judgment runs as Judgment", read(sb, "R.tabletMode"), "judgment");
  eq("the footer names one lamp", read(sb, "$('tablets-hold-note').textContent"), "One lamp guards the Hold");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("one miss ends a Judgment run", read(sb, "R.ended"), true);
  eq("a Judgment miss is not Held", read(sb, "Tablets.held(R)"), false);
}
{
  const sb = boot();
  stubRandom(sb, 0.9);
  exec(sb, "SAVE.set.tabletMode = 'judgment'; startRun('tablets','watchman')");
  holdAll(sb);
  eq("a Judgment finish is Held", read(sb, "Tablets.held(R)"), true);
  eq("a Judgment Hold keeps the mark", read(sb, "SAVE.tablets.psalm23.judgment"), true);
  unstubRandom();
}
{
  const sb = boot();
  stubRandom(sb, 0.9);
  exec(sb, "startRun('tablets','watchman')");
  holdAll(sb);
  eq("a Hold finish is Held", read(sb, "Tablets.held(R)"), true);
  ok("a Hold finish leaves no Judgment mark", read(sb, "!SAVE.tablets.psalm23.judgment"));
  unstubRandom();
}
{
  const sb = boot();
  stubRandom(sb, 0.9);
  exec(sb, "SAVE.set.tabletMode = 'endless'; startRun('tablets','watchman')");
  for (let i = 0; i < 200 && read(sb, "R.tabletPass") < 2; i++) exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("the first reading gives a second", read(sb, "R.tabletPass"), 2);
  eq("the second reading starts at the first blank", read(sb, "R.tabletIdx"), 0);
  eq("an Endless run does not end at the chapter end", read(sb, "R.ended"), false);
  eq("finishing the first reading Holds", read(sb, "Tablets.held(R)"), true);
  eq("the reading is announced", read(sb, "(function(){ var ms = $('tablets-ms').children; return ms[ms.length - 1].textContent; })()"), "Second reading");
  ok("the second reading runs on shorter sand", read(sb, "R.tabletClockMax") < 25);
  const carved = read(sb, "R.correct");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  exec(sb, "tabletsResolve(false); tabletsFinishResolve(false)");
  eq("three lamps end the Endless run", read(sb, "R.ended"), true);
  eq("the Hold is kept", read(sb, "SAVE.tablets.psalm23.held"), true);
  eq("the record keeps the words carved", read(sb, "SAVE.tablets.psalm23.endlessBest"), carved);
  eq("the record reads 100%", read(sb, "SAVE.tablets.psalm23.best"), 100);
  unstubRandom();
}
{
  const sb = boot();
  exec(sb, "SAVE.set.tabletMode = 'endless'; startRun('tablets','watchman')");
  eq("a fresh Endless step has the full sand", read(sb, "tabletsStepSeconds()"), 25);
  exec(sb, "R.correct = 100; R.streak = 100");
  ok("the Endless sand ramps to the 30% cap", Math.abs(read(sb, "tabletsStepSeconds()") - 17.5) < 1e-9);
}
{
  const sb = boot();
  exec(sb, "SAVE.set.tabletMode = 'endless'; startRun('tablets','watchman',{fromRoad:true})");
  eq("a road run is a Hold", read(sb, "R.tabletMode"), "hold");
  eq("a road run has three lamps", read(sb, "R.tabletLives"), 3);
}
{
  const sb = boot();
  exec(sb, "SAVE.set.tabletMode = 'judgment'; startRun('tablets','watchman',{tabletChapter:'prayer',tabletTutorial:true})");
  eq("the tutorial is a Hold even when Judgment is saved", read(sb, "R.tabletMode"), "hold");
}
{
  const sb = boot();
  exec(sb, "SAVE.set.tabletMode = 'judgment'; SAVE.set.tabletTrial = true; startRun('tablets','watchman')");
  eq("Trial stacks with Judgment: one lamp", read(sb, "R.tabletLives"), 1);
  eq("Trial is on in Judgment", read(sb, "!!R.tabletTrial"), true);
}
{
  const sb = boot();
  eq("the second reading is named", read(sb, "tabletsReadingName(2)"), "Second reading");
  eq("past ten readings count", read(sb, "tabletsReadingName(11)"), "Reading 11");
}
{
  const sb = boot();
  exec(sb, "paintTabletsBrief(true)");
  const picks = "$('brief-tablets-modes').children[0].children";
  eq("the mode row holds three buttons", read(sb, picks + ".filter(function(c){ return !!(c.dataset && c.dataset.tabletMode); }).length"), 3);
  eq("Hold is picked by default", read(sb, picks + "[0].className"), "tablets-mode-btn on");
  eq("the Hold note shows", read(sb, picks + "[3].textContent"), "Three lamps · finish with one still lit to Hold");
  exec(sb, "$('brief-tablets-modes').dispatch('click', { target:{ closest:function(sel){ return sel === '[data-tablet-mode]' ? { dataset:{ tabletMode:'judgment' } } : null; } } })");
  eq("picking Judgment saves the mode", read(sb, "SAVE.set.tabletMode"), "judgment");
  eq("the picker repaints with Judgment", read(sb, picks + "[1].className"), "tablets-mode-btn on");
  eq("the Judgment note shows", read(sb, picks + "[3].textContent"), "One lamp · the first wrong word ends the Hold");
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "var __rolls = 0; Math.random = function(){ __rolls++; return __rolls === 1 ? 0.1 : 0.5; }");
  exec(sb, "tabletsRollBlessing()");
  eq("a Hold Golden Censer adds a lamp", read(sb, "R.tabletLives"), 4);
  unstubRandom();
}
{
  const sb = boot();
  exec(sb, "SAVE.set.tabletMode = 'judgment'; startRun('tablets','watchman')");
  exec(sb, "var __rolls = 0; Math.random = function(){ __rolls++; return __rolls === 1 ? 0.1 : 0.5; }");
  exec(sb, "tabletsRollBlessing()");
  eq("Judgment never gets a Golden Censer lamp", read(sb, "R.tabletLives"), 1);
  unstubRandom();
}
{
  const sb = boot();
  stubRandom(sb, 0.9);
  exec(sb, "SAVE.set.tabletMode = 'endless'; startRun('tablets','watchman')");
  for (let i = 0; i < 200 && read(sb, "R.tabletPass") < 2; i++) exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  exec(sb, "R.tabletTimeout = true; Director.ending({reason:'death'})");
  eq("an Endless Hold that runs out of sand still stands", read(sb, "$('ending-title').textContent"), "The Hold Stands");
  unstubRandom();
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "R.tabletTimeout = true; Director.ending({reason:'death'})");
  eq("a Hold that runs out of sand shatters", read(sb, "$('ending-title').textContent"), "The Tablet Shattered");
}
{
  const sb = boot();
  exec(sb, "SAVE.set.tabletMode = 'endless'; startRun('tablets','watchman')");
  exec(sb, "R.correct = 37; R.tabletPass = 2");
  eq("Endless shows words over its readings", read(sb, "tabletsWordsCarvedText()"), "37 over 2 readings");
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("Hold shows words over the chapter", read(sb, "tabletsWordsCarvedText()"), "0 / 11");
}
unstubRandom();
if (fail) {
```

### E25 index.html mode host  (`index.html`, serves P1)

Why: an empty host above the chapter list for the Hold / Judgment / Endless row; hidden until the library paints it

Find (exactly once):

```html
<div id="brief-tablets-pick" hidden></div>
```

Replace with:

```html
<div id="brief-tablets-modes" hidden></div>
      <div id="brief-tablets-pick" hidden></div>
```

### R1 cloud merge keeps the Judgment mark and the Endless best  (`js/cloud.js`, serves P2, P3)

Why: a cloud sync rebuilt each tablets record as {best, held} only, so rec.judgment and rec.endlessBest were lost at the next sync; the merge now carries both

Find (exactly once):

```js
        held: !!(x.held || y.held)
      };
      var lv = {}, n;
```

Replace with:

```js
        held: !!(x.held || y.held)
      };
      /* P2/P3: the Judgment mark and the Endless best survive a cloud sync. */
      if (x.judgment || y.judgment) out[k].judgment = true;
      var eb = maxNum(x.endlessBest, y.endlessBest);
      if (eb) out[k].endlessBest = eb;
      var lv = {}, n;
```

### R1 cloud merge tests  (`test/cloud.test.js`, serves P2, P3)

Why: pins that the Judgment mark and the Endless best survive a merge, and that a record without them gains no keys

Find (exactly once):

```js
console.log((fail ? "FAIL"
```

Replace with:

```js
{
  const row = function(t){ return { v:3, xp:0, seals:[], best:{}, life:{}, books:{}, verse:{}, srs:{}, pilgrim:{ sites:{}, usedIds:[] }, set:{}, daily:{}, board:[], tablets:t }; };
  const m = Cloud.mergeSave(
    row({ psalm23: { best: 100, held: true, judgment: true, endlessBest: 37 } }),
    row({ psalm23: { best: 60, held: false, endlessBest: 40 } })
  );
  ok("the Judgment mark survives a sync", m.tablets.psalm23.judgment === true, m.tablets.psalm23);
  eq("the Endless best takes the max", m.tablets.psalm23.endlessBest, 40);
  const plain = Cloud.mergeSave(row({ exodus20: { best: 10, held: false } }), row({ exodus20: { best: 5, held: false } }));
  ok("no Judgment key without the mark", !("judgment" in plain.tablets.exodus20));
  ok("no Endless key without the record", !("endlessBest" in plain.tablets.exodus20));
}
console.log((fail ? "FAIL"
```

### R2 the Golden Censer leaves the Judgment pool  (`js/tablets-run.js`, serves P2)

Why: in Judgment the miss ends the run on one lamp, so a Censer lamp would make the HUD lie; the Censer is not in the Judgment pool (the 0.22 gate and the other blessings are unchanged)

Find (exactly once):

```js
  const b = picks[Math.floor(Math.random() * picks.length)];
```

Replace with:

```js
  /* P2: in Judgment the Censer leaves the pool, so the HUD never shows a lamp the run cannot use. */
  const pool = R.tabletMode === "judgment" ? picks.filter(function(p){ return p.text.indexOf("Golden Censer") < 0; }) : picks;
  const b = pool[Math.floor(Math.random() * pool.length)];
```

### R3 an Endless Hold that runs out of sand still stands  (`js/director.js`, serves P3)

Why: tabletEnding checked the timeout before Held, so an Endless run that finished its first reading and then ran out of sand was shown as shattered; Held now wins (Hold is unchanged, because a timeout never coincides with Held there)

Find (exactly once):

```js
    if(R && R.tabletTimeout){
```

Replace with:

```js
    /* P3: an Endless run that is Held keeps the Hold even when its sand runs out. */
    if(R && R.tabletTimeout && !held){
```

### R4 the Endless breakdown shows the words over its readings  (`js/results.js`, serves P3)

Why: the results read "37 / 15" for an Endless run that read on; an Endless run past its first reading shows its words over its readings

Find (exactly once):

```js
function tabletsHeld(){ return typeof Tablets!=="undefined" && Tablets.held(R); }
```

Replace with:

```js
function tabletsHeld(){ return typeof Tablets!=="undefined" && Tablets.held(R); }
/* P3: an Endless run that read on shows its words over its readings. */
function tabletsWordsCarvedText(){
  if(R.tabletMode === "endless" && (R.tabletPass || 1) > 1) return R.correct + " over " + R.tabletPass + " readings";
  return R.correct + " / " + R.qTotal;
}
```

### R4 the breakdown row uses the words text  (`js/results.js`, serves P3)

Why: the Words carved row reads tabletsWordsCarvedText, so Hold keeps its "carved / total" form

Find (exactly once):

```js
  return row("Words carved", R.correct+" / "+R.qTotal) +
```

Replace with:

```js
  return row("Words carved", tabletsWordsCarvedText()) +
```

### R6 the chapter-end branch is a small helper  (`js/tablets-run.js`, serves P3)

Why: tabletsFinishResolve was at oxlint complexity 20 (the limit); the chapter-end branch moves into tabletsChapterDone with the same behaviour: tutorial finishes, Endless reads on (returns false), others end the run

Find (exactly once):

```js
function tabletsFinishResolve(ok){
```

Replace with:

```js
/* P3: the chapter's last step. Returns true when the run is over; an Endless run reads on instead. */
function tabletsChapterDone(){
  if(R.tabletTutorial){ finishTabletsTutorial(); return true; }
  if(R.tabletMode === "endless"){ tabletsNextReading(); return false; }
  if(typeof endRun === "function") endRun("complete");
  return true;
}
function tabletsFinishResolve(ok){
```

### E24 the content hash of the edited rules module (shared/content/manifest.json)  (`shared/content/manifest.json`, serves P1, P2, P3)

Why: js/tablets.js is a hashed content source (scripts/export-content.mjs); E1, E2, E10, E11 and E12 change it, so CI content:check needs the new hash. Measured by applying edits.js to a copy and running node scripts/export-content.mjs there; only the hash line moved (the other content files differ only by CR).

Find (exactly once):

```json
"sourceHash": "4095d32ad80721f5fe067f7b3de337faa033670a16b31ec52ba59e70dc3c9327",
```

Replace with:

```json
"sourceHash": "565d82ec55ac43501aeb957a1b915031f765eb85f195df7befd7c37874fc4aa3",
```

What does not change: Hold mode plays exactly as before (three lamps, 25 s steps, the same end and ending), no existing test is edited, no rule number changes, Android is untouched (phase 8), and Trial works as today in every mode.

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)                73 ms  applied 32 edits to 12 files
make-expected                    38373 ms  expected.json written: 1178 baseline files; changed: css/tablets.css, index.html, js/briefs.js, js/cloud.js, js/director.js, js/game.js, js/results.js, js/tablets-run.js, js/tablets.js, shared/content/manifest.json, test/cloud.test.js, test/tablets.test.js
tamper-test (+ full gate post)  269163 ms  TAMPER-TEST: PASS  (control passed; 16 tampers)
scope-report pristine              129 ms  SCOPE VERDICT: READY  (32 edit(s) pending, 0 already applied)
scope-report dry-run               127 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 32 already applied)
scope-report (real project)        101 ms  SCOPE VERDICT: READY  (32 edit(s) pending, 0 already applied)
gate pre (real project)          22581 ms  RESULT: PASS  (45/45 checks passed, mode=pre)

# make-expected
expected.json written: 1178 baseline files; changed: css/tablets.css, index.html, js/briefs.js, js/cloud.js, js/director.js, js/game.js, js/results.js, js/tablets-run.js, js/tablets.js, shared/content/manifest.json, test/cloud.test.js, test/tablets.test.js
tests before {"pass":75,"fail":0} (exit 0) -> after {"pass":75,"fail":0} (exit 0)
  anchor js/tablets.js:140 x1  return isFinished && lampsLit >= 1;
  anchor js/tablets.js:402 x1  function blankSeconds(base, blankIdx, streak, golden){
  anchor js/tablets.js:413 x1  if(judgment || next <= 0) return { lit:0, ended:true, progress:progres
  anchor js/tablets-run.js:609 x1  const cracked = Tablets.rules.miss(lit, false, Tablets.rules.progressO
  anchor js/tablets-run.js:753 x1      else if(typeof endRun === "function") endRun("complete");
  anchor js/tablets-run.js:810 x1    R.tabletLives = 3;
  anchor js/tablets-run.js:806 x1    R.tabletClockMax = R.tabletClock;
  anchor js/game.js:603 x1  return { chapter: chapter, tutorial: tutorial, level: level, fromRoad:
  anchor js/game.js:657 x1      tabletTutorial: tab.tutorial,
  anchor js/results.js:273 x1    if(nowHeld) rec.held = true;
  anchor js/results.js:285 x1  const pct = Math.round(((R.tabletIdx || 0) / (R.tabletTotal || 1)) * 1
  anchor js/briefs.js:611 x1  best.textContent = locked ? "·" : (rec.best || 0) + "%";
  anchor js/briefs.js:640 x1    group("The prayer", prayer);
  anchor index.html:589 x1  <div class="tablets-hold">Three lamps guard the Hold</div>
  anchor css/tablets.css:401 x1  .tablets-ch-group{margin:0 0 1.5em}
  anchor shared/content/manifest.json:7 x1  "sourceHash":

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (62/62 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (23/36 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-css/tablets.css  css/tablets.css is byte-identical , X-index.html  index.html is byte-identical to the dry, X-js/briefs.js  js/briefs.js is byte-identical to the
  OK    a stray file was added -> RESULT: FAIL  (34/36 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S2  no file was added or deleted
  OK    edited file drifted by one byte: js/tablets.js -> RESULT: FAIL  (34/36 checks passed, mode=post)   caught by: X-js/tablets.js  js/tablets.js is byte-identical to t, C-content  CI content:check passes (js/tablets.js is 
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    edited file drifted by one byte: js/game.js -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-js/game.js  js/game.js is byte-identical to the dry
  OK    edited file drifted by one byte: js/briefs.js -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-js/briefs.js  js/briefs.js is byte-identical to the
  OK    edited file drifted by one byte: js/results.js -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-js/results.js  js/results.js is byte-identical to t
  OK    edited file drifted by one byte: index.html -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-index.html  index.html is byte-identical to the dry
  OK    edited file drifted by one byte: css/tablets.css -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-css/tablets.css  css/tablets.css is byte-identical 
  OK    edited file drifted by one byte: js/cloud.js -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-js/cloud.js  js/cloud.js is byte-identical to the d
  OK    edited file drifted by one byte: js/director.js -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-js/director.js  js/director.js is byte-identical to
  OK    edited file drifted by one byte: test/tablets.test.js -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    edited file drifted by one byte: test/cloud.test.js -> RESULT: FAIL  (35/36 checks passed, mode=post)   caught by: X-test/cloud.test.js  test/cloud.test.js is byte-iden
  OK    edited file drifted by one byte: shared/content/manifest.json -> RESULT: FAIL  (34/36 checks passed, mode=post)   caught by: X-shared/content/manifest.json  shared/content/manife, C-content  CI content:check passes (js/tablets.js is 
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (34/36 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S3  the other 1166 files are byte-identical to the ba
  OK    half-applied: edit "E1 Tablets.modeOf reads the saved mode" undone -> RESULT: FAIL  (33/36 checks passed, mode=post)   caught by: X-js/tablets.js  js/tablets.js is byte-identical to t, C-content  CI content:check passes (js/tablets.js is , C-lint  CI lint (oxlint) still passes
TAMPER-TEST: PASS  (control passed; 16 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 8976ff9094807bf8820928ee106e86ee2e203159edc29963020493498decfa1c
```

## 8. Not measured
- **The library row on a phone:** not measured until the browser check.
- **Endless balance and economy:** how long a run lasts at the 17.5 s floor, and that oil and XP grow with words carved without a cap (a Held Endless run ends through "death", so it gets no finish bonus), are not measured. Left for the user.
- **The spoken start line** "Two lamps guard the tablet" (js/tablets-run.js:949) is a recorded clip and stays as it is; it was already off for Hold.
- **Android:** the modes do not exist there; Android ignores `tabletMode`, `rec.judgment` and `rec.endlessBest`. Not checked on a device.
- **Mutation note:** "the miss ignores Judgment" is an equivalent mutant (one lamp ends the run either way), so it is not a mutation.
- **R5 focus** has no test: the test sandbox gives `children` as an array, so the HTMLCollection bug (fixed in E7) was caught only by the browser check.
- **CI:** the stacked PR targets the phase 5 branch, and `ci.yml` runs on PRs to master only, so no CI run is expected.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
