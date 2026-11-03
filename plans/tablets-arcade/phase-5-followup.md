# Plan: Word Tablets phase 5 follow-up (four defects)

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
An assessment of phases 2–5 against `plans/tablets-arcade/phases-2-5-executor-plan.md` found four defects that no test
caught. Every suite passes today, so this plan has no failing target. It adds a test per defect, and the gate breaks
the fixed code in 6 ways that those tests must catch. End state: the 9 edits applied to the 2 edited files
(section 7), the other 1175 files byte-identical, every required suite passing.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| F1 | 3 answers can never be typed: "All hail", "eagle's", "hinds'" (`sources/untypable-answers.txt`) | `tabletsNeedWord` (js/tablets-run.js:893) keeps the space or apostrophe, but `tabletsTypeKey` accepts only a–z (:919) | Real bug | Compare typing against the answer's letters only |
| F2 | The recharge toast reads "Restored · winnow · illuminate" | js/tablets-run.js:677 joins the raw rule ids | Real bug (tone) | Map the ids to the button names Winnow / Illuminate |
| F3 | A blessing rolled on a milestone hit is applied but its banner text is replaced | `tabletsMilestoneBanner` (:658, called at :704) writes into `#tablets-blessing`, which the blessing writes on the same hit | Real bug; the spec said "as a Favor popup" | Name the milestone on the Favor popup; drop the banner write. The phase-5 test at test/tablets.test.js:697 pinned the banner, so it moves to the popup (Stale test) |
| F4 | The Illuminate copy says it glows; since O4 it carves | Tutorial callout :126, toast :489 | Real bug (copy) | "Illuminate carves the true word for you" / "Illuminate — the true word is carved" |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `js/tablets-run.js`, `test/tablets.test.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1175 files stay byte-identical. No file is added or deleted.
- **Invariants:** the Favor formula (carve points × Trial), phase 3's miss, phase 4's `tabletsTypeKey`, the sand burn,
  the untimed tutorial and the blessing roll stay byte-identical in `js/tablets-run.js`. All of `js/tablets.js` (a
  hashed content source) stays untouched, so the content hash does not move.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 6 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `d3371f8c02750a0b8c2d64e6db9849f7b9fa3414b0b8de1d19f98ca9c53fa49f`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 2 file(s) change (`js/tablets-run.js`, `test/tablets.test.js`) and 1175 stay identical.
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
node fix-plan/gate.js pre     # required: RESULT: PASS (31/31 checks passed, mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 9 edits to 2 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (33/33 checks passed, mode=post)
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
### E1 the tutorial callout says Illuminate carves (js/tablets-run.js)  (`js/tablets-run.js`, serves F4)

Why: O4 made Illuminate carve the true word; the callout still told the player it only glows for a breath.

Find (exactly once):

```js
    "Illuminate glows the true stone for a breath",
```

Replace with:

```js
    "Illuminate carves the true word for you",
```

### E2 the Illuminate toast says it carves (js/tablets-run.js)  (`js/tablets-run.js`, serves F4)

Why: the toast fired just before the carve and still said the stone glows.

Find (exactly once):

```js
  if(typeof toast === "function") toast("Illuminate — the true stone glows");
```

Replace with:

```js
  if(typeof toast === "function") toast("Illuminate — the true word is carved");
```

### E3 the Favor popup carries the milestone; the banner is left to the blessing (js/tablets-run.js)  (`js/tablets-run.js`, serves F3)

Why: the spec asked for the milestone "as a Favor popup"; phase 5 wrote it into #tablets-blessing, which the blessing rolled on the same hit also writes, so a blessing at a milestone was applied but never shown. The popup already shows the Favor the milestone pays into.

Find (exactly once):

```js
/* The popup names the grade; the tutorial stays ungraded. */
function tabletsScoreText(carve, favor){
  if(R.tabletTutorial) return "+" + favor + " FAVOR";
  return tabletsGradeName(carve.grade) + " · +" + favor + " FAVOR";
}
/* D4: the three milestones wear the game's names. */
function tabletsMilestoneName(streak){
  if(streak >= 50) return "Jubilee";
  if(streak >= 25) return "Double portion";
  return "Tithe";
}
function tabletsMilestoneBanner(reached){
  if(!reached) return;
  const banner = $("tablets-blessing");
  const icon = $("tablets-blessing-icon");
  const text = $("tablets-blessing-text");
  if(icon) icon.textContent = "🏛️";
  if(text) text.textContent = tabletsMilestoneName(reached.streak) + " · +" + reached.bonus + " FAVOR";
  if(banner){
    banner.classList.add("active");
    setTimeout(function(){ try{ banner.classList.remove("active"); }catch(e){} }, 2800);
  }
}
```

Replace with:

```js
/* The popup names the grade, and the milestone when the carve reaches one
   (D4: a Favor popup, so the blessing banner stays the blessing's). The
   tutorial stays ungraded. */
function tabletsScoreText(carve, favor){
  if(R.tabletTutorial) return "+" + favor + " FAVOR";
  const grade = tabletsGradeName(carve.grade);
  if(carve.milestone) return grade + " · " + tabletsMilestoneName(carve.milestone.streak) + " · +" + favor + " FAVOR";
  return grade + " · +" + favor + " FAVOR";
}
/* D4: the three milestones wear the game's names. */
function tabletsMilestoneName(streak){
  if(streak >= 50) return "Jubilee";
  if(streak >= 25) return "Double portion";
  return "Tithe";
}
```

### E4 the recharge toast names the powers (js/tablets-run.js)  (`js/tablets-run.js`, serves F2)

Why: Tablets.rules.recharge returns the ids "winnow" and "illuminate"; the toast printed them raw, lower-cased, to the player.

Find (exactly once):

```js
/* D2: the streak gives the charges back, and the rules decide how. */
function tabletsRecharge(carve){
```

Replace with:

```js
/* The rules' charge ids, in the words on the power buttons. */
const TABLET_POWER_NAMES = { winnow:"Winnow", illuminate:"Illuminate" };
function tabletsPowerName(id){
  return TABLET_POWER_NAMES[id] || id;
}
/* D2: the streak gives the charges back, and the rules decide how. */
function tabletsRecharge(carve){
```

### E5 the toast reads the names (js/tablets-run.js)  (`js/tablets-run.js`, serves F2)

Why: pairs with E4.

Find (exactly once):

```js
  if(typeof toast === "function") toast("Restored · " + award.gained.join(" · "));
```

Replace with:

```js
  if(typeof toast === "function") toast("Restored · " + award.gained.map(tabletsPowerName).join(" · "));
```

### E6 the hit no longer writes the milestone into the blessing banner (js/tablets-run.js)  (`js/tablets-run.js`, serves F3)

Why: pairs with E3: the milestone is on the popup now.

Find (exactly once):

```js
    tabletsRollBlessing();
    tabletsMilestoneBanner(carve.milestone);
    tabletsRecharge(carve);
```

Replace with:

```js
    tabletsRollBlessing();
    tabletsRecharge(carve);
```

### E7 the typed word is the answer's letters alone (js/tablets-run.js)  (`js/tablets-run.js`, serves F1)

Why: tabletsTypeKey accepts only a-z, so "All hail", "eagle's" and "hinds'" could never be completed by typing. Comparing against the letters alone lets "allhail" carve "All hail"; the hit still shows the true word.

Find (exactly once):

```js
/* The word being carved, lower-cased, and what has been typed of it. */
function tabletsNeedWord(){
  const blank = tabletsGapBlank();
  return blank ? String(blank.a || "").toLowerCase().trim() : "";
}
```

Replace with:

```js
/* The word being carved, lower-cased, letters only: a space or an
   apostrophe ("All hail", "eagle's") is not typed. */
function tabletsNeedWord(){
  const blank = tabletsGapBlank();
  return blank ? String(blank.a || "").toLowerCase().replace(/[^a-z]/g, "") : "";
}
```

### E8 the Tithe test reads the popup (test/tablets.test.js)  (`test/tablets.test.js`, serves F3)

Why: the phase-5 test pinned the milestone in the blessing banner, the behaviour F3 removes; the spec placed it on the Favor popup.

Find (exactly once):

```js
  eq("the Tithe names itself and its Favor", read(sb, "$('tablets-blessing-text').textContent"), "Tithe · +500 FAVOR");
```

Replace with:

```js
  eq("the Tithe names itself on the Favor popup",
    read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "Fresh sand · Tithe · +1025 FAVOR");
```

### E9 tests for the four defects (test/tablets.test.js)  (`test/tablets.test.js`, serves F1, F2, F3, F4)

Why: one test per defect, each caught by its mutation.

Find (exactly once):

```js
  eq("streak 5 leaves Illuminate alone", read(sb, "R.powers.illum"), 1);
}
```

Replace with:

```js
  eq("streak 5 leaves Illuminate alone", read(sb, "R.powers.illum"), 1);
}

{
  // F1: an answer with a space is typed by its letters alone.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'matthew28'})");
  stubRandom(sb, 0.9);
  const type = function(ch){ exec(sb, "tabletsOnKey({ key: " + JSON.stringify(ch) + ", preventDefault: function(){} })"); };
  eq("the All hail gap is found", read(sb, "(function(){ for(var s = 0; s < R.tabletSteps.length; s++){ for(var g = 0; g < R.tabletSteps[s].length; g++){ R.tabletIdx = s; R.gapIdx = g; R.tabletTyped = ''; if(tabletsGapBlank() && tabletsGapBlank().a === 'All hail'){ paintTabletsTray(); return true; } } } return false; })()"), true);
  "allhail".split("").forEach(type);
  eq("typing allhail carves All hail", read(sb, "R.correct"), 1);
  eq("the letters-only carve is a typed carve", read(sb, "!!R.tabletTypedHit"), true);
}

{
  // F2: the recharge toast names the powers in the game's words.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "var _toasts = []; toast = function(m){ _toasts.push(m); }");
  exec(sb, "R.streak = 9; tabletsResolve(true); tabletsFinishResolve(true)");
  eq("the tenth streak names both powers", read(sb, "_toasts.indexOf('Restored · Winnow · Illuminate') >= 0"), true);
}

{
  // F3: a milestone rides on the Favor popup; the blessing keeps its banner.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.1);
  exec(sb, "R.streak = 9; tabletsResolve(true)");
  eq("the Tithe is on the Favor popup",
    read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "Fresh sand · Tithe · +1025 FAVOR");
  eq("the blessing keeps its banner", read(sb, "$('tablets-blessing-text').textContent"), "Manna Jar Discovered (+15s Sand)");
}

{
  // F4: Illuminate's copy says it carves.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "var _toasts = []; toast = function(m){ _toasts.push(m); }");
  exec(sb, "tabletsIlluminate()");
  eq("the Illuminate toast says it carves", read(sb, "_toasts[0]"), "Illuminate — the true word is carved");
  const runSrc = fs.readFileSync(path.join(ROOT, "js/tablets-run.js"), "utf8");
  ok("the tutorial says Illuminate carves", runSrc.indexOf('"Illuminate carves the true word for you"') >= 0);
  ok("no Illuminate copy says it only glows", !/glows the true stone|true stone glows/.test(runSrc));
}
```

What does not change: no rule numbers (grades, Favor, combo, recharge cadence, milestones), no lamps or sand, no
key bindings, and no Android or content files. The phases 2–5 assertions all still pass; the only one rewritten is the
Tithe assertion, which moves from the banner to the popup (F3). The `typed` invariant keeps `tabletsTypeKey` itself
identical, so only the word it compares against changes.

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)                58 ms  applied 9 edits to 2 files
make-expected                    41634 ms  expected.json written: 1177 baseline files; changed: js/tablets-run.js, test/tablets.test.js
tamper-test (+ full gate post)  105820 ms  TAMPER-TEST: PASS  (control passed; 6 tampers)
scope-report pristine               88 ms  SCOPE VERDICT: READY  (9 edit(s) pending, 0 already applied)
scope-report dry-run                85 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 9 already applied)
scope-report (real project)         79 ms  SCOPE VERDICT: READY  (9 edit(s) pending, 0 already applied)
gate pre (real project)          21576 ms  RESULT: PASS  (31/31 checks passed, mode=pre)

# make-expected
expected.json written: 1177 baseline files; changed: js/tablets-run.js, test/tablets.test.js
tests before {"pass":75,"fail":0} (exit 0) -> after {"pass":75,"fail":0} (exit 0)
  anchor js/tablets-run.js:126 x1  "Illuminate glows the true stone for a breath",
  anchor js/tablets-run.js:489 x1  toast("Illuminate — the true stone glows");
  anchor js/tablets-run.js:650 x1  return tabletsGradeName(carve.grade) + " · +" + favor + " FAVOR";
  anchor js/tablets-run.js:658 x1  function tabletsMilestoneBanner(reached){
  anchor js/tablets-run.js:704 x1      tabletsMilestoneBanner(carve.milestone);
  anchor js/tablets-run.js:677 x1  toast("Restored · " + award.gained.join(" · "));
  anchor js/tablets-run.js:895 x1  return blank ? String(blank.a || "").toLowerCase().trim() : "";
  anchor js/tablets-run.js:919 x1  if(k.length !== 1 || k < "a" || k > "z") return false;
  anchor js/tablets-run.js:662,1000 x2  const text = $("tablets-blessing-text");
  anchor js/tablets-canon.js:210 x1  a:"All hail", suffix:"."
  anchor js/tablets-more.js:5011 x1  "a": "eagle's",
  anchor js/tablets-more.js:6232 x1  "a": "hinds'",
  anchor test/tablets.test.js:697 x1  eq("the Tithe names itself and its Favor", read(sb, "$('tablets-blessi

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (33/33 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (18/21 checks passed, mode=post)   caught by: S1  exactly these files changed: js/tablets-run.js, t, X-js/tablets-run.js  js/tablets-run.js is byte-identi, X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    a stray file was added -> RESULT: FAIL  (19/21 checks passed, mode=post)   caught by: S1  exactly these files changed: js/tablets-run.js, t, S2  no file was added or deleted
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (20/21 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    edited file drifted by one byte: test/tablets.test.js -> RESULT: FAIL  (20/21 checks passed, mode=post)   caught by: X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (19/21 checks passed, mode=post)   caught by: S1  exactly these files changed: js/tablets-run.js, t, S3  the other 1175 files are byte-identical to the ba
  OK    half-applied: edit "E1 the tutorial callout says Illuminate carves (js/tablets-run.js)" undone -> RESULT: FAIL  (20/21 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
TAMPER-TEST: PASS  (control passed; 6 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 d3371f8c02750a0b8c2d64e6db9849f7b9fa3414b0b8de1d19f98ca9c53fa49f
```

## 8. Not measured
- **Popup width:** whether "Fresh sand · Tithe · +1025 FAVOR" fits the slot on a phone is not measured until the
  browser check.
- **eagle's and hinds':** only "All hail" is typed end to end in a test. The other two rely on the same letters-only
  rule and are not measured separately.
- **CI on the stacked PRs:** `.github/workflows/ci.yml` runs `pull_request` only for `master` / `main`
  (`sources/ci-trigger.txt`), so PR #5 gets no CI run from this push. Not measured.
- **The gate's lint check** runs the project's own `node_modules/oxlint/bin/oxlint` by absolute path, because the
  gate's copies skip `node_modules`. `npm run lint` in the project itself is run separately after apply.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
