# Plan: phase 4 — typing the word in the live Word Tablets run

**Status: plan only, nothing applied.** Branch `feat/tablets-arcade-phase-4`, based on `feat/tablets-arcade-phase-3`
(PR #3). Every number below was measured on this baseline by `fix-plan/prove.js`; the block marked GENERATED is
rendered from `fix-plan/measured.json` and `fix-plan/expected.json`, and `node fix-plan/render-plan.js --check` refuses
this document if the two disagree.

## 1. Goal
Today a tablet is picked with a letter: `tabletsOnKey` maps `a`–`d` to stones 1–4 (`const letters = { a:0, b:1, c:2,
d:3 };`) and the tray badges the stones `A`–`D`. The arcade's own way in — type the word — does not exist, so the
`typed` bonus that `Tablets.rules.carve` already pays (+50 Favor, +8 fill) is unreachable in the live run.

After this phase letters **build a typed prefix** for the current gap and a completed word carves it with the typed
bonus; a wrong letter is ignored and is **not** a miss; Backspace takes a letter back; `1`–`4` pick tablets and letters
never do; and `i` / `w` / `s` fire their power only while nothing is typed and the word cannot start with that letter.
The slot shows the letters as they are typed, the stones are labelled `1`–`4`, and the tutorial prompt says to type.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| F1 | A letter picks a stone and nothing can be typed | `tabletsOnKey` at js/tablets-run.js:849 maps `a`–`d` and calls `tabletsPick` | Missing feature · the phase spec | E1 |
| F2 | The `typed` bonus the rules already pay is unreachable: `tabletsCarve` never passes `typed` | `tabletsCarve` at js/tablets-run.js (the `carve` call) | Missing feature · the spec: +50 Favor, +8 fill | E4 |
| F3 | Nothing shows what has been typed | `paintTabletsSlot` at js/tablets-run.js:193 only knows `hit` or empty | Missing feature · the spec: show the typed prefix in the slot | E2 |
| F4 | The tray badges teach `A`–`D`, the letters that stop working | `const badges = ["A", "B", "C", "D"];` | Stale copy · truth | E5 |
| F5 | The tutorial says "Tap FATHER below (or press 1–4)" and never mentions the word | the prompt at js/tablets-run.js:123 | Stale copy · the spec names the tutorial prompt | E6 |
| F6 | The typed state would survive a gap change unless reset | `tabletsResetBlankAids` at js/tablets-run.js:680 | State · the prefix belongs to one gap | E3 |

## 2. Scope
- **Edited (2):** `js/tablets-run.js`, `test/tablets.test.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1173 files stay byte-identical. No file is added or deleted.
- **Invariants:** the graded popup and the Favor phase 2 landed, the three-lamp miss and the end condition phase 3
  landed, the sand clock, the untimed tutorial and the phase-1 Hold rule are untouched.
- **`js/tablets.js` is untouched:** `Tablets.rules.carve` already reads `input.typed` (+50 points, +8 fill), so the
  typed bonus needs no rules change and the content hash does not move.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or
   `expected.json` to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped,
   skipped or made always-true. No existing test is restated this phase: every change is an addition, the suite's
   assertion count rises by the new blocks, and the gate breaks the fixed code in 5 ways, each of which must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.** Section E lists the sha256 of every file in `fix-plan/`, measured by `prove.js` after the last
   edit.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 5 of the executor plan and `fix-plan/edits.js`, and grep the callers and tests of each edit site. The phase spec's
stop condition — "any suite pins a–d for tablets" — was re-measured: `test/keys.test.js` mentions tablets only in its
header comment, and `test/interaction-contract.test.js` checks `tabletsResolve`'s order and the pause-quit flow, not
keys, which the plan's invariants and the suite's own rows re-check. No suite pins the `A`–`D` stone badges either.

- **Scope covered:** 2 files change (`js/tablets-run.js`, `test/tablets.test.js`) and 1173 stay byte-identical. The run
  changes in six places (E1–E6); the suite gains four blocks (E7).
- **What it entails:** the keyboard becomes a word-typing surface; the two functions that guard power keys now look at
  the word and the prefix; the slot becomes a live echo of what has been typed; and two labels stop teaching the old
  keys. The tutorial can be typed as well as tapped, so its prompt says so.
- **What is in it:** E1 the key handler (with `tabletsNeedWord`, `tabletsPowerKey` and `tabletsTypeKey`, because
  `oxlint` caps a function at a complexity of 20), E2 the slot, E3 the per-gap reset, E4 the typed flag on the carve,
  E5 the badges, E6 the prompt, E7 the four test blocks (typed carve, ignored letter, `w` for "waters" vs Winnow for
  "soul", Backspace).
- **How it connects:** E1 writes `R.tabletTyped`/`R.tabletTypedHit`; E2 shows the prefix; E3 clears both per gap; E4 is
  the only place the flag is read, so the +50/+8 comes from the rules module and nowhere else; E5/E6 keep the visible
  key hints true; E7 pins each behaviour. M1 (letters pick again), M2 (a wrong letter becomes a miss), M3 (Backspace
  does nothing), M4 (the typed bonus is dropped) and M5 (a power fires even when the word starts with its letter) must
  each make `word tablets` FAIL.

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
node fix-plan/apply.js .              # required: applied 7 edits to 2 files
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

### E1 letters type the word; 1-4 pick tablets; a power fires only when the word cannot start with that letter (js/tablets-run.js)  (`js/tablets-run.js`, serves typing)

Why: the spec: letters build a typed prefix for the current gap, a wrong letter is ignored and is not a miss, Backspace removes a letter, 1-4 pick tablets and letters no longer do, and i/w/s fire only while nothing is typed and the word does not start with that letter.

Find (exactly once, line 849 of the file before this plan):

```js
function tabletsOnKey(e){
  if(typeof currentView === "undefined" || currentView !== "tablets") return;
  if(!R || R.ended || R.mode !== "tablets") return;
  const k = (e.key || "").toLowerCase();
  if(R.paused){
    if(k === "enter" || k === " "){ e.preventDefault(); setTabletsPaused(false); }
    return;
  }
  if(k === "i"){ e.preventDefault(); tabletsIlluminate(); return; }
  if(k === "w"){ e.preventDefault(); tabletsWinnow(); return; }
  if(k === "s"){ e.preventDefault(); tabletsSurge(); return; }
  const letters = { a:0, b:1, c:2, d:3 };
  let n = parseInt(e.key, 10);
  if(k in letters) n = letters[k] + 1;
  if(!(n >= 1 && n <= 4)) return;
  const btn = tabletsStoneButtons()[n - 1];
  if(btn && !btn.disabled) tabletsPick(btn.dataset.word);
}
```

Replace with:

```js
/* The word being carved, lower-cased, and what has been typed of it. */
function tabletsNeedWord(){
  const blank = tabletsGapBlank();
  return blank ? String(blank.a || "").toLowerCase().trim() : "";
}
/* A power key fires only while nothing is typed and the word cannot start
   with that letter; otherwise the letter is typing. */
function tabletsPowerKey(k){
  if((R && R.tabletTyped) || (k !== "i" && k !== "w" && k !== "s")) return false;
  const need = tabletsNeedWord();
  if(k === need.charAt(0)) return false;
  if(k === "i") tabletsIlluminate();
  else if(k === "w") tabletsWinnow();
  else tabletsSurge();
  return true;
}
/* A wrong letter is ignored. It is not a miss. 1-4 pick a tablet; letters
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
  paintTabletsSlot(blank, "");
  if(R.tabletTyped === need && !R.tabletResolving){
    R.tabletTypedHit = true;
    tabletsResolve(true);
  }
  return true;
}
function tabletsOnKey(e){
  if(typeof currentView === "undefined" || currentView !== "tablets") return;
  if(!R || R.ended || R.mode !== "tablets") return;
  const k = (e.key || "").toLowerCase();
  if(R.paused){
    if(k === "enter" || k === " "){ e.preventDefault(); setTabletsPaused(false); }
    return;
  }
  if(tabletsPowerKey(k)){ e.preventDefault(); return; }
  const n = parseInt(e.key, 10);
  if(n >= 1 && n <= 4){
    const btn = tabletsStoneButtons()[n - 1];
    if(btn && !btn.disabled) tabletsPick(btn.dataset.word);
    return;
  }
  if(tabletsTypeKey(k)) e.preventDefault();
}
```

Protected by: M1, M2, M3, M5

### E2 the slot shows the letters being typed (js/tablets-run.js)  (`js/tablets-run.js`, serves typing)

Why: the spec: show the typed prefix in the slot. A carved word still wins: the hit branch returns first.

Find (exactly once, line 193 of the file before this plan):

```js
function paintTabletsSlot(blank, kind){
  const slot = $("tablets-slot");
  if(!slot) return;
  slot.classList.remove("glow");
  if(kind === "hit" && blank){
    slot.textContent = blank.a;
    slot.classList.add("glow");
  } else {
    slot.textContent = "— — —";
  }
}
```

Replace with:

```js
function paintTabletsSlot(blank, kind){
  const slot = $("tablets-slot");
  if(!slot) return;
  slot.classList.remove("glow");
  if(kind === "hit" && blank){
    slot.textContent = blank.a;
    slot.classList.add("glow");
    return;
  }
  /* The letters of the word being typed stand in the slot until it lands. */
  slot.textContent = (R && R.tabletTyped) ? R.tabletTyped : "— — —";
}
```

Protected by: M2

### E3 a new gap starts with nothing typed (js/tablets-run.js)  (`js/tablets-run.js`, serves typing)

Why: the typed prefix belongs to one gap: the reset that re-arms the tray must clear it, and must clear the typed-flag the carve reads.

Find (exactly once, line 680 of the file before this plan):

```js
function tabletsResetBlankAids(){
  R.tabletOpts = null;
  R.tabletGrey = [];
  R.tabletWinnow = [];
  R.tabletHintedIdx = -1;
  R.tabletWinnowIdx = -1;
```

Replace with:

```js
function tabletsResetBlankAids(){
  R.tabletOpts = null;
  R.tabletGrey = [];
  R.tabletWinnow = [];
  R.tabletTyped = "";
  R.tabletTypedHit = false;
  R.tabletHintedIdx = -1;
  R.tabletWinnowIdx = -1;
```

Protected by: M4

### E4 the carve learns whether the word was typed (js/tablets-run.js)  (`js/tablets-run.js`, serves typing)

Why: the spec: a correct full word carves with typed:true (+50 Favor, +8 fill). Tablets.rules.carve already pays that bonus, so the run only has to pass the flag.

Find (exactly once, line 628 of the file before this plan):

```js
  return Tablets.rules.carve({
    progress: Tablets.rules.progressOf(R.tabletClock, max),
    streak: R.streak || 0,
    surge: !!R.surgeOn
  });
```

Replace with:

```js
  return Tablets.rules.carve({
    progress: Tablets.rules.progressOf(R.tabletClock, max),
    streak: R.streak || 0,
    surge: !!R.surgeOn,
    typed: !!R.tabletTypedHit
  });
```

Protected by: M4

### E5 the stones are labelled with the keys that work (js/tablets-run.js)  (`js/tablets-run.js`, serves typing)

Why: the tray badges were A-D, the letters the old key map used. With letters typing the word, the badges must show 1-4, the keys that still pick a tablet, or they teach a key that no longer works.

Find (exactly once, line 418 of the file before this plan):

```js
  const badges = ["A", "B", "C", "D"];
```

Replace with:

```js
  const badges = ["1", "2", "3", "4"];
```

Protected by: M1

### E6 the tutorial prompt names typing instead of the old numbered tap (js/tablets-run.js)  (`js/tablets-run.js`, serves typing)

Why: the prompt said "Tap FATHER below (or press 1-4)"; the run now carves a word typed letter by letter, so the prompt has to say so.

Find (exactly once, line 123 of the file before this plan):

```js
      : "Tap FATHER below (or press 1–4)",
```

Replace with:

```js
      : "Tap FATHER below, or type the word (1–4 picks)",
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E7 typing the whole word carves it with the typed bonus (test/tablets.test.js)  (`test/tablets.test.js`, serves typing)

Why: the spec test: typing want carves Psalm 23:1. The typed carve pays 100 x 1.5 (Fresh sand, combo 1) + 50 = 200 Favor and fills 28 + 8 = 36.

Find (exactly once, line 599 of the file before this plan):

```js
{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
```

Replace with:

```js
{
  // Phase 4: typing the word letter by letter carves it.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  type("w");
  type("a");
  eq("the slot shows the letters typed", read(sb, "$('tablets-slot').textContent"), "wa");
  type("n");
  type("t");
  eq("the typed popup pays the +50", read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "Fresh sand · +200 FAVOR");
  eq("the typed carve pays 200 Favor", read(sb, "R.favor"), 200);
  eq("the typed carve fills 36", read(sb, "R.surge"), 36);
  eq("the slot takes the carved word", read(sb, "$('tablets-slot').textContent"), "want");
  exec(sb, "tabletsFinishResolve(true)");
  eq("typing want carves Psalm 23:1", read(sb, "R.gapIdx"), 1);
  eq("the next gap starts with nothing typed", read(sb, "R.tabletTyped"), "");
}

{
  // A wrong letter is ignored, and a letter never picks a tablet.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  type("w");
  type("x");
  eq("a wrong letter is ignored", read(sb, "R.tabletTyped"), "w");
  eq("a wrong letter is not a miss", read(sb, "R.tabletMiss"), 0);
  eq("a wrong letter resolves nothing", read(sb, "(R.attempts || 0)"), 0);
  type("a");
  type("a");
  eq("a does not pick a tablet", read(sb, "(R.attempts || 0)"), 0);
  eq("a is not a miss either", read(sb, "R.tabletMiss"), 0);
}

{
  // w types for "waters" but fires Winnow for "soul".
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  exec(sb, "R.tabletIdx = 1; R.gapIdx = 0; R.tabletTyped = ''; paintTabletsTray()");
  eq("the third gap is waters", read(sb, "tabletsGapBlank().a"), "waters");
  type("w");
  eq("w types a letter for waters", read(sb, "R.tabletTyped"), "w");
  exec(sb, "R.gapIdx = 1; R.tabletTyped = ''; paintTabletsTray()");
  eq("the fourth gap is soul", read(sb, "tabletsGapBlank().a"), "soul");
  type("w");
  eq("w fires Winnow for soul", read(sb, "R.powers.winnow"), 1);
  eq("w typed nothing for soul", read(sb, "R.tabletTyped"), "");
}

{
  // Backspace takes the last letter back.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  type("w");
  type("a");
  type("Backspace");
  eq("Backspace removes a letter", read(sb, "R.tabletTyped"), "w");
  eq("the slot forgets the letter", read(sb, "$('tablets-slot').textContent"), "w");
  type("Backspace");
  eq("an empty prefix shows the empty slot", read(sb, "$('tablets-slot').textContent"), "— — —");
}

{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
```

Protected by: M4

## B. Scope (measured on the baseline)

**1175 files** are in the recorded baseline; **2 change** (in 2 edited paths and 0 generated).

| edited file | bytes | lines | EOL | find at |
|---|---|---|---|---|
| `js/tablets-run.js` | 41670 | 1097 | CRLF | 849 |
| `js/tablets-run.js` | 41670 | 1097 | CRLF | 193 |
| `js/tablets-run.js` | 41670 | 1097 | CRLF | 680 |
| `js/tablets-run.js` | 41670 | 1097 | CRLF | 628 |
| `js/tablets-run.js` | 41670 | 1097 | CRLF | 418 |
| `js/tablets-run.js` | 41670 | 1097 | CRLF | 123 |
| `test/tablets.test.js` | 36872 | 685 | CRLF | 599 |

Files that change: `js/tablets-run.js`, `test/tablets.test.js`.

Checks after the edits: `CI content:check still passes (no content source changes here)`; `js/tablets-run.js still parses`; `test/tablets.test.js still parses`; `CI lint (oxlint) still passes`.
## C. Anchors (measured by `make-expected.js`, re-checked by `gate pre`)

| file | line(s) | copies | text |
|---|---|---|---|
| `js/tablets-run.js` | 849 | 1 | `function tabletsOnKey(e){` |
| `js/tablets-run.js` | 860 | 1 | `const letters = { a:0, b:1, c:2, d:3 };` |
| `js/tablets-run.js` | 193 | 1 | `function paintTabletsSlot(blank, kind){` |
| `js/tablets-run.js` | 680 | 1 | `function tabletsResetBlankAids(){` |
| `js/tablets-run.js` | 631 | 1 | `surge: !!R.surgeOn` |
| `js/tablets-run.js` | 418 | 1 | `const badges = ["A", "B", "C", "D"];` |
| `js/tablets-run.js` | 123 | 1 | `"Tap FATHER below (or press 1–4)"` |
| `test/tablets.test.js` | 416 | 1 | `"the slot starts empty"` |
| `test/tablets.test.js` | 422 | 1 | `"a miss opens the fracture"` |
## D. Tests and proof (measured)

- The full run: 75 results, 75 PASS / 0 FAIL before -> 75 results, 75 PASS / 0 FAIL after.
- The plan's own suite (`test/tablets.test.js`): 5476 assertions before -> **5496 after**. No test was weakened or dropped.
- Every suite name and status after the plan is recorded in `fix-plan/expected.json`; any rename, drop or status change fails `gate post` check H3.
- These must PASS afterwards (13): `word tablets`, `content pipe`, `production readiness`, `interaction`, `keys`, `all game modes`, `ui structure`, `menu modes`, `integration`, `mobile layout`, `motion`, `game structure`, `edition logic`.
- Obsolete names that must no longer exist (0): none.

Mutations (each must make the named test FAIL, or the new tests prove nothing):

| # | what it breaks | file | must FAIL |
|---|---|---|---|
| M1 | letters pick tablets again | `js/tablets-run.js` | word tablets |
| M2 | a wrong letter becomes a miss | `js/tablets-run.js` | word tablets |
| M3 | Backspace no longer removes a letter | `js/tablets-run.js` | word tablets |
| M4 | the typed carve loses its +50 and +8 | `js/tablets-run.js` | word tablets |
| M5 | a power fires even when the word starts with its letter | `js/tablets-run.js` | word tablets |
## E. Pinned tooling (sha256, from `prove.js`)

| tool | sha256 |
|---|---|
| `fix-plan/config.js` | `2cd7481d69c67ff2930be1811b1e5626d15363374cc4a40cdefd598e25ce7f81` |
| `fix-plan/edits.js` | `62fa0a2459b16231cb9943a84eac7e179738ccf61ad8b82b32790954bac5afde` |
| `fix-plan/apply.js` | `7c2aa2ed89fde06e94432469075d8e5cf4f2bfe6e9299ffb5fbdf8d33dffa024` |
| `fix-plan/lib.js` | `0ae73e6117cb2595af8bbd61a75cbab927f7f5a963b62910b6f7b82bb11fa93e` |
| `fix-plan/scope-report.js` | `4b2e2cae22f7cd71aa03f5b542c225364ab465559abb6589b155ec7ff4b3f296` |
| `fix-plan/make-expected.js` | `a44c6b89d95ac61db9722adb307cd61a345911bcb1fa2654f8e65ea96b7f8b13` |
| `fix-plan/prove.js` | `1f298e23c529fb3eb5d08791c60839ef3ee93057b050fe09e5e8d1b92852e4d4` |
| `fix-plan/render-plan.js` | `8ae53bf4ba058e1d8bf9259e2daeb19dc940378d9667aec13d85a83647c7257e` |
<!-- END GENERATED: PLAN FACTS -->

## 6. Not measured
- **Feel.** No playtest: whether typing a word (with the sand running) is faster or slower than tapping a stone in the
  live Hold is not measured; the tutorial is untimed, so it is the place to learn it.
- **Mobile typing.** The game runs with a phone's on-screen keyboard either way; this plan types through `keydown`
  only, adds no on-screen keyboard and was not exercised on a real phone (Chromium at 430x900 stands in for one).
- **The `typed` bonus elsewhere.** `Tablets.rules.carve` pays `TYPED_BONUS`/`TYPED_FILL` for any carve flagged `typed`;
  the run sets that flag only by completing the word letter by letter, so a tap cannot earn it, but a future caller
  could. Tested at the run level, not at the rules level (the rules' own typed test is phase 1's).

## 7. Execution report (2026-11-03, branch `feat/tablets-arcade-phase-4`)
1. **Scope analysis:** section 4; `node fix-plan/scope-report.js` printed
   `SCOPE VERDICT: READY  (7 edit(s) pending, 0 already applied)`.
2. **The gate:**
   - `node fix-plan/gate.js pre` -> `RESULT: PASS  (26/26 checks passed, mode=pre)`; report
     `%TEMP%\fix-plan-gate-report-pre.json`, sha256 `265ebd7810c5d8fac6dcefc763d1ef9cd288567c05af79fe984c022e24bc175c`.
     It re-checked 1175 baseline files byte-identical, every anchor, every invariant, the line endings and the 7 backup
     hashes, and recorded `75 results, 75 PASS / 0 FAIL`.
   - `node fix-plan/apply.js .` -> `applied 7 edits to 2 files`.
   - `node fix-plan/gate.js post` -> `RESULT: PASS  (31/31 checks passed, mode=post)`, exit code 0; report
     `%TEMP%\fix-plan-gate-report-post.json`, sha256 `6e44db8aa03fdd9ad41c5a911440342731b19d1bea7a92b50602c1af11978bc2`.
3. **The two quoted lines:** `S1  exactly these files changed: js/tablets-run.js, test/tablets.test.js` and
   `H1  tests: 75 results and at least 75 PASS`. The suite went from 5476 to 5496 assertions. All five mutations were
   caught: `MUT-M1` (letters pick again), `MUT-M2` (a wrong letter becomes a miss), `MUT-M3` (Backspace does nothing),
   `MUT-M4` (the typed bonus is dropped), `MUT-M5` (a power fires for the word's own first letter). `C-content` and
   `C-lint` passed.
4. **One gate failure, kept in the record:** the first `gate post` on this plan **FAILED** at `C-lint`:
   `js/tablets-run.js:853:1: error eslint(complexity): function tabletsOnKey has a complexity of 33. Maximum allowed is
   20.` The plan was corrected rather than the gate weakened: the key handler was split into `tabletsNeedWord`,
   `tabletsPowerKey` and `tabletsTypeKey`, `prove.js` was re-run (`PROVE: PASS`, same 5476 -> 5496), and the full gate
   passed as reported above. The failed report is `%TEMP%\fix-plan-gate-report-post.json` as it was, before the re-run.
5. **Browser check (Chromium, 430x900, offline save, `%TEMP%\ctv-p4-browser\`):** `BROWSER CHECK: PASS`, zero console
   and page errors, real `keydown` events. The stones were labelled `["1","2","3","4"]`; pressing `a` picked nothing
   (`attempts 0`, no miss) and left the slot empty; typing `wa` put `wa` in the slot; typing `want` read
   `Fresh sand · +200 FAVOR`, paid `200` Favor and filled the Surge `36` (= 28 + 8 typed), with the slot showing the
   carved word; the next gap started with an empty prefix (`gapIdx 1`, `tabletTyped ""`); `z` was ignored (`typed ""`,
   `miss 0`); `pa` then Backspace left `p` in the slot; the tutorial prompt read
   `Tap FATHER below, or type the word (1–4 picks)` and typing `father` there showed the carved word and the plain
   `+200 FAVOR` popup (still ungraded).
6. **Not run:** Android/Gradle (web only; nothing native reads the tablets keyboard); no balance playtest; no on-screen
   keyboard work (the plan types through `keydown` only).
