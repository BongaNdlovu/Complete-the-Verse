# Plan: phase 5 — powers and milestones in the live Word Tablets run

**Status: plan only, nothing applied.** Branch `feat/tablets-arcade-phase-5`, based on `feat/tablets-arcade-phase-4`
(PR #4). Every number below was measured on this baseline by `fix-plan/prove.js`; the block marked GENERATED is
rendered from `fix-plan/measured.json` and `fix-plan/expected.json`, and `node fix-plan/render-plan.js --check` refuses
this document if the two disagree.

## 1. Goal
The two powers and the streaks are still the phase-1 numbers with nothing behind them. Winnow banishes a hard-coded two
decoys (`R.tabletWinnow = decoys.slice(0, 2);`), so O3's `min(3, decoys − 1)` is not what ships. Illuminate only glows
the true stone for two seconds — it never carves, so O4's graded carve does not exist. `Tablets.rules.recharge` exists
but pays `illuminate` / `stasis` / `chisel` — an arcade vocabulary this game dropped (D2) — and nothing calls it. The
milestones (`Tablets.rules.milestone`) are paid inside `carve`'s points but never named.

After this phase: **Winnow** banishes `min(3, decoys − 1)` from the rules; **Illuminate** carves the true word, graded
**Carved**, counting for the streak and the Favor with no typed bonus (the user chose this over the download's Fresh
sand, whose `activateChiselRelic` clamps the sand to 15% gone first); **recharges** are Winnow on every 5th streak and
Illuminate on every 10th and on a milestone, capped at 3; and **milestones** are named **Tithe** (10), **Double
portion** (25) and **Jubilee** (50 and every 25 after) on the Favor banner. Surge stays the ×2 meter that stops the
sand (D2), and Pace I–III stay as they are (D3).

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| F1 | Winnow always takes two decoys, whatever the tray holds | `R.tabletWinnow = decoys.slice(0, 2);` | Wrong rule · O3: `min(3, decoys − 1)` | E4/E5 (the rule), E6 (the run) |
| F2 | Illuminate is a two-second glow: it cannot carve, so O4's graded carve is unreachable | `tabletsIlluminate` at js/tablets-run.js stops at `target.classList.add("revealed")` | Missing feature · O4 | E2 (a grade may be named), E7 (carve the true word), E8/E9 (the run passes and clears it) |
| F3 | The recharge vocabulary is the arcade's (`stasis`, `chisel`) and nothing in the run calls it | `recharge` at js/tablets.js:418 and the `RELICS` constants | Wrong rule · D2: Stasis is dropped; Winnow and Illuminate are the two powers | E1 (constants), E3 (the function), E10/E11 (the run) |
| F4 | Milestones are anonymous: the Favor jumps by 500/1500/3500 with no name | `carve`'s `milestone` is returned but never shown | Missing feature · D4's names | E10 (name + banner), E11 (on the hit) |
| F5 | `streak 10 adds the chisel` and the five recharge assertions pin the dropped vocabulary | test/tablets.test.js (the rules block) | Stale tests · decided change: the same seven assertions restated for `winnow`/`illuminate` | E12 |
| F6 | `js/tablets.js` is a hashed content source | `shared/content/manifest.json:7` | Closed value · the sourceHash must move with E1–E5 | E14 |

**Decided changes to existing tests** (the executor plan's list, plus what it did not name):
- the seven recharge assertions in the rules block are restated for `winnow` / `illuminate` (E12); the count stays
  seven, and `winnow dims two decoys` and `a second Winnow on the same blank does not spend` stay untouched.

## 2. Scope
- **Edited (4):** `js/tablets.js`, `js/tablets-run.js`, `test/tablets.test.js`, `shared/content/manifest.json`, changed
  only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1172 files stay byte-identical. No file is added or deleted.
- **Invariants:** the graded popup and Favor phase 2 landed, phase 3's miss/pushback/end condition, phase 4's typing
  handler, the sand clock, the untimed tutorial and the phase-1 Hold rule are untouched.
- **`js/game.js` needs no change, and this plan does not touch it:** its tablets start line already reads
  `illum:1 + reservedIlluminate, winnow:2`, which is inside the new cap of 3 (the reserve is itself capped at 2, so
  1 + 2 = 3). Adding it here would be a no-op edit.
- **`js/tablets.js` moves the content hash:** E1–E5 edit a hashed source, so E14 sets the `sourceHash` that `prove.js`
  computed and the `content:check` gate check is what proves it.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or
   `expected.json` to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped,
   skipped or made always-true. The one restated block is the dropped vocabulary above; the suite's assertion count
   rises, and the gate breaks the fixed code in 5 ways, each of which must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.** Section E lists the sha256 of every file in `fix-plan/`, measured by `prove.js` after the last
   edit.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 5 of the executor plan and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

- **Scope covered:** 4 files change (`js/tablets.js`, `js/tablets-run.js`, `test/tablets.test.js`,
  `shared/content/manifest.json`) and 1172 stay byte-identical. The rules change in five places (E1–E5), the run in six
  (E6–E11), the suite in two (E12, E13), and the hash in one (E14).
- **What it entails:** the two powers start reading the rules module for what they do; Illuminate becomes a real carve
  with a named grade; the charge economy switches to the game's two powers; the milestones become visible and pay on
  the carve; and one closed hash moves with the rules edit.
- **What is in it:** E1 the recharge constants, E2 `gradeOf` + the carve's `input.grade`, E3 the recharge rewrite, E4
  `winnowCount`, E5 its export, E6 Winnow's count, E7 Illuminate's carve, E8 the carve's `grade` input, E9 the per-gap
  reset, E10 the milestone names/banner and `tabletsRecharge`, E11 the hit wiring, E12 the restated recharge block,
  E13 the four new test blocks, E14 the content hash.
- **How it connects:** E2 → E8 (the run names a grade, the rules resolve it) → E7 (the power names "carved"); E4 → E5
  → E6 (the Winnow rule and its single caller); E1 → E3 → E10/E11 (the recharge cadence and the hit that pays it); E10
  (the D4 names) → E11 (shown on the hit) → E13 (pinned); E14 closes the hash E1–E5 moved. M1 (no cap), M2 (Winnow
  every 4), M3 (a Tithe of 0), M4 (Winnow clears the tray) and M5 (Illuminate graded from the clock) must each make
  `word tablets` FAIL.

**Stop and ask** if:
- the verdict isn't READY;
- an edit or goal isn't linked;
- the code doesn't match this plan;
- this document and `edits.js` disagree;
- the change affects something not mentioned here.

The O4 precondition is settled: the download's `activateChiselRelic` clamps the sand to 15% gone and grades Fresh
sand; the user was shown that and chose **Carved** (O4 as written) for this phase.

Otherwise, continue to section 5 without waiting. ALREADY APPLIED: run `gate.js post` and report; don't re-apply.

## 5. Steps (from `C:\Users\fanel\Downloads\ctv-push`)
```bash
node fix-plan/prove.js .              # required: PROVE: PASS (dry run, measurements, expected.json)
node fix-plan/render-plan.js --check  # required: PLAN-CHECK: PASS
node fix-plan/scope-report.js         # required: SCOPE VERDICT: READY
node fix-plan/gate.js pre             # required: RESULT: PASS, mode=pre; writes verified backups
node fix-plan/apply.js .              # required: applied 14 edits to 4 files
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

### E1 the recharge constants name the two powers that come back (js/tablets.js)  (`js/tablets.js`, serves D2)

Why: D2 drops Stasis and keeps Winnow and Illuminate, so the chisel/stasis constants have no meaning: the cap is 3 and the two cadences are 5 (Winnow) and 10 (Illuminate).

Find (exactly once, line 351 of the file before this plan):

```js
  const RELICS = ["illuminate", "stasis", "chisel"];
  const RELIC_MAX = 3, RELIC_EVERY = 5, CHISEL_EVERY = 10;
```

Replace with:

```js
  const CHARGE_MAX = 3, WINNOW_EVERY = 5, ILLUM_EVERY = 10;
```

Protected by: M1, M2

### E2 carve may be told its grade (js/tablets.js)  (`js/tablets.js`, serves O4)

Why: O4: Illuminate carves the true word at the Carved grade. The rules keep a total map of their own grades, so an unknown id falls back to the clock grade instead of inventing one.

Find (exactly once, line 379 of the file before this plan):

```js
  function carve(input){
    const streak = (input.streak || 0) + 1;
    const combo = comboOf(streak);
    const g = grade(input.progress);
```

Replace with:

```js
  function gradeOf(id){
    for(let i = 0; i < GRADES.length; i++) if(GRADES[i].id === id) return GRADES[i];
    return null;
  }
  function carve(input){
    const streak = (input.streak || 0) + 1;
    const combo = comboOf(streak);
    /* O4: a power may name the grade it carves at. */
    const g = (input.grade ? gradeOf(input.grade) : null) || grade(input.progress);
```

Protected by: M5

### E3 recharge pays Winnow on 5s and Illuminate on 10s and milestones (js/tablets.js)  (`js/tablets.js`, serves D2)

Why: the spec: rename the recharge keys to winnow and illuminate; Winnow +1 every 5; Illuminate +1 on 10s and milestones; cap 3. The old function paid illuminate/stasis/chisel and is the only caller of RELICS.

Find (exactly once, line 417 of the file before this plan):

```js
  function recharge(charges, streak, reachedMilestone){
    const next = { illuminate:charges.illuminate || 0, stasis:charges.stasis || 0, chisel:charges.chisel || 0 };
    const gained = [];
    const isRechargeStreak = streak > 0 && streak % RELIC_EVERY === 0;
    if(!isRechargeStreak) return { charges:next, gained:gained };
    const primariesFull = next.illuminate >= RELIC_MAX && next.stasis >= RELIC_MAX;
    const awardsChisel = !!reachedMilestone || streak % CHISEL_EVERY === 0 || primariesFull;
    const award = { illuminate:true, stasis:true, chisel:awardsChisel };
    for(let i = 0; i < RELICS.length; i++){
      const id = RELICS[i];
      if(!award[id]) continue;
      if(next[id] >= RELIC_MAX) continue;
      next[id]++;
      gained.push(id);
    }
    return { charges:next, gained:gained };
  }
```

Replace with:

```js
  /* D2: Winnow and Illuminate come back on streaks — Winnow every 5,
     Illuminate on every 10 and on a milestone — and never above the cap. */
  function recharge(charges, streak, reachedMilestone){
    const next = { winnow:charges.winnow || 0, illuminate:charges.illuminate || 0 };
    const gained = [];
    if(streak > 0 && streak % WINNOW_EVERY === 0 && next.winnow < CHARGE_MAX){
      next.winnow++;
      gained.push("winnow");
    }
    const illumUp = !!reachedMilestone || (streak > 0 && streak % ILLUM_EVERY === 0);
    if(illumUp && next.illuminate < CHARGE_MAX){
      next.illuminate++;
      gained.push("illuminate");
    }
    return { charges:next, gained:gained };
  }
```

Protected by: M1, M2

### E4 winnowCount is the rule O3 asks for (js/tablets.js)  (`js/tablets.js`, serves O3)

Why: O3: Winnow banishes min(3, decoys - 1), so it never clears the whole tray. The count belongs with the other arcade numbers.

Find (exactly once, line 398 of the file before this plan):

```js
  function blankSeconds(base, blankIdx, streak, golden){
    const ramp = Math.min(RAMP_CAP, blankIdx * RAMP_PER_BLANK + streak * RAMP_PER_STREAK);
    return Math.max(MIN_BLANK_S, base * (1 - ramp) * (golden ? GOLDEN_PACE : 1));
  }
```

Replace with:

```js
  function blankSeconds(base, blankIdx, streak, golden){
    const ramp = Math.min(RAMP_CAP, blankIdx * RAMP_PER_BLANK + streak * RAMP_PER_STREAK);
    return Math.max(MIN_BLANK_S, base * (1 - ramp) * (golden ? GOLDEN_PACE : 1));
  }
  /* O3: Winnow banishes min(3, decoys - 1), so it never clears the tray. */
  function winnowCount(decoys){
    return Math.max(0, Math.min(3, (decoys | 0) - 1));
  }
```

Protected by: M4

### E5 the rules export winnowCount (js/tablets.js)  (`js/tablets.js`, serves O3)

Why: the run reads the count from the rules instead of carrying its own copy.

Find (exactly once, line 441 of the file before this plan):

```js
    blankSeconds: blankSeconds,
    miss: miss,
```

Replace with:

```js
    blankSeconds: blankSeconds,
    winnowCount: winnowCount,
    miss: miss,
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E6 Winnow takes the rule's count (js/tablets-run.js)  (`js/tablets-run.js`, serves O3)

Why: the spec: Winnow banishes min(3, decoys - 1) instead of the hard-coded two. A tray with a lone decoy is left alone, so the charge is not spent.

Find (exactly once, line 512 of the file before this plan):

```js
  if(decoys.length < 1){
    if(typeof toast === "function") toast("Nothing left to winnow");
    return;
  }
  R.tabletWinnow = decoys.slice(0, 2);
```

Replace with:

```js
  const take = Tablets.rules.winnowCount(decoys.length);
  if(take < 1){
    if(typeof toast === "function") toast("Nothing left to winnow");
    return;
  }
  R.tabletWinnow = decoys.slice(0, take);
```

Protected by: M4

### E7 Illuminate carves the true word at the Carved grade (js/tablets-run.js)  (`js/tablets-run.js`, serves O4)

Why: the spec and O4: Illuminate clears the gap by carving the true word — it counts for the streak and the Favor, is graded Carved, and earns no typed bonus. The glow is kept; the tray is repainted for the next gap.

Find (exactly once, line 478 of the file before this plan):

```js
  const target = tabletsTrueStone();
  if(!target) return;
  R.tabletHintedIdx = tabletsGapKey();
  R.powers.illum--;
  R.usedPower = true;
  R.powersSpent = (R.powersSpent || 0) + 1;
  if(R.illumFromReserve > 0) R.illumFromReserve--;
  target.classList.add("revealed");
  setTimeout(function(){ try{ target.classList.remove("revealed"); }catch(e){} }, 2000);
  paintTabletsIllumBtn();
  if(typeof toast === "function") toast("Illuminate — the true stone glows");
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
```

Replace with:

```js
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
  if(typeof toast === "function") toast("Illuminate — the true stone glows");
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
  /* O4: the power carves the true word at the Carved grade. It counts for the
     streak and the Favor, and it earns no typed bonus. */
  R.tabletGrade = "carved";
  tabletsPick(String(blank.a || ""));
```

Protected by: M5

### E8 the carve reads the grade the power named (js/tablets-run.js)  (`js/tablets-run.js`, serves O4)

Why: the run is the only caller that can name a grade; the rules fall back to the clock grade when none is named.

Find (exactly once, line 632 of the file before this plan):

```js
    surge: !!R.surgeOn,
    typed: !!R.tabletTypedHit
  });
```

Replace with:

```js
    surge: !!R.surgeOn,
    typed: !!R.tabletTypedHit,
    grade: R.tabletGrade || null
  });
```

Protected by: M5

### E9 a new gap forgets the named grade (js/tablets-run.js)  (`js/tablets-run.js`, serves O4)

Why: the grade belongs to the power that paid for one carve; the per-gap reset must clear it with the typed state.

Find (exactly once, line 686 of the file before this plan):

```js
  R.tabletTyped = "";
  R.tabletTypedHit = false;
```

Replace with:

```js
  R.tabletTyped = "";
  R.tabletTypedHit = false;
  R.tabletGrade = null;
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

### E10 the milestones wear the game's names and the streak gives charges back (js/tablets-run.js)  (`js/tablets-run.js`, serves D4, D2)

Why: D4: Tithe (10) / Double portion (25) / Jubilee (50 and every 25 after), shown as a Favor popup. D2: the streak recharges Winnow and Illuminate, and the rules decide how.

Find (exactly once, line 645 of the file before this plan):

```js
function tabletsResolveHit(){
```

Replace with:

```js
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
/* D2: the streak gives the charges back, and the rules decide how. */
function tabletsRecharge(carve){
  const award = Tablets.rules.recharge({ winnow:R.powers.winnow || 0, illuminate:R.powers.illum || 0 }, R.streak, carve.milestone);
  R.powers.winnow = award.charges.winnow;
  R.powers.illum = award.charges.illuminate;
  if(!award.gained.length) return;
  paintTabletsPowers();
  if(typeof toast === "function") toast("Restored · " + award.gained.join(" · "));
}
function tabletsResolveHit(){
```

Protected by: M1, M2, M3

### E11 the hit pays the milestone and the recharge (js/tablets-run.js)  (`js/tablets-run.js`, serves D4, D2)

Why: the milestone banner and the recharge ride on the same carve the hit already computed, after the blessing so the milestone wins the banner.

Find (exactly once, line 668 of the file before this plan):

```js
  if(!R.tabletTutorial) tabletsRollBlessing();
}
```

Replace with:

```js
  if(!R.tabletTutorial){
    tabletsRollBlessing();
    tabletsMilestoneBanner(carve.milestone);
    tabletsRecharge(carve);
  }
}
```

Protected by: M1, M2, M3

### E12 the recharge tests speak Winnow and Illuminate (test/tablets.test.js)  (`test/tablets.test.js`, serves D2)

Why: decided change: D2 drops Stasis, so the seven assertions that pinned illuminate/stasis/chisel are restated for winnow/illuminate with the same count.

Find (exactly once, line 179 of the file before this plan):

```js
  const none = { illuminate:0, stasis:0, chisel:0 };
  eq("streak 4 recharges nothing", TR.recharge(none, 4, null).gained.join(","), "");
  eq("streak 5 recharges illuminate and stasis", TR.recharge(none, 5, null).gained.join(","), "illuminate,stasis");
  eq("streak 10 adds the chisel", TR.recharge(none, 10, null).gained.join(","), "illuminate,stasis,chisel");
  eq("a milestone adds the chisel", TR.recharge(none, 15, { streak:15 }).gained.join(","), "illuminate,stasis,chisel");
  eq("full primaries give the chisel", TR.recharge({ illuminate:3, stasis:3, chisel:0 }, 5, null).gained.join(","), "chisel");
  eq("charges cap at 3", TR.recharge({ illuminate:3, stasis:3, chisel:3 }, 10, null).charges.chisel, 3);
  eq("recharge leaves its input alone", none.illuminate, 0);
```

Replace with:

```js
  const none = { winnow:0, illuminate:0 };
  eq("streak 4 recharges nothing", TR.recharge(none, 4, null).gained.join(","), "");
  eq("streak 5 recharges Winnow", TR.recharge(none, 5, null).gained.join(","), "winnow");
  eq("streak 10 recharges Winnow and Illuminate", TR.recharge(none, 10, null).gained.join(","), "winnow,illuminate");
  eq("a milestone adds Illuminate", TR.recharge({ winnow:3, illuminate:0 }, 15, { streak:15 }).gained.join(","), "illuminate");
  eq("a capped Winnow is not granted", TR.recharge({ winnow:3, illuminate:0 }, 5, null).gained.join(","), "");
  eq("charges cap at 3", TR.recharge({ winnow:3, illuminate:2 }, 10, null).charges.illuminate, 3);
  eq("recharge leaves its input alone", none.winnow, 0);
```

Protected by: M1, M2

### E13 the phase-spec tests: the Winnow count, the Illuminate carve and the milestones (test/tablets.test.js)  (`test/tablets.test.js`, serves O3, O4, D4, D2)

Why: the spec's tests: Winnow greys 2 of 3 decoys on today's trays (already pinned by "winnow dims two decoys"), Illuminate carves and advances the gap, recharge at 5 and 10, and the milestone Favor at 10.

Find (exactly once, line 665 of the file before this plan):

```js
{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
```

Replace with:

```js
{
  // O3: Winnow takes min(3, decoys - 1), so it never clears the tray.
  eq("three decoys leave two for Winnow", Tablets.rules.winnowCount(3), 2);
  eq("five decoys take at most three", Tablets.rules.winnowCount(5), 3);
  eq("a lone decoy is left alone", Tablets.rules.winnowCount(1), 0);
}

{
  // O4: Illuminate carves the true word, graded Carved.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "tabletsIlluminate()");
  eq("Illuminate carves the gap", read(sb, "R.favor"), 100);
  eq("the Illuminate carve is graded Carved",
    read(sb, "$('tablets-ms').children[$('tablets-ms').children.length - 1].textContent"), "Carved · +100 FAVOR");
  eq("the Illuminate carve counts the streak", read(sb, "R.streak"), 1);
  eq("Illuminate still spends its charge", read(sb, "R.powers.illum"), 0);
  exec(sb, "tabletsFinishResolve(true)");
  eq("the carved gap advances", read(sb, "R.gapIdx"), 1);
}

{
  // D4: the milestones wear the game's names and pay on the carve.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  eq("streak 10 is the Tithe", read(sb, "tabletsMilestoneName(10)"), "Tithe");
  eq("streak 25 is the Double portion", read(sb, "tabletsMilestoneName(25)"), "Double portion");
  eq("streak 75 is still Jubilee", read(sb, "tabletsMilestoneName(75)"), "Jubilee");
  exec(sb, "R.streak = 9");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("the Tithe names itself and its Favor", read(sb, "$('tablets-blessing-text').textContent"), "Tithe · +500 FAVOR");
  eq("the Tithe rides on the carve", read(sb, "R.favor"), 1025);
  eq("the tenth streak recharges Illuminate", read(sb, "R.powers.illum"), 2);
}

{
  // D2: the streak gives the charges back, Winnow first.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  stubRandom(sb, 0.9);
  exec(sb, "R.streak = 4");
  exec(sb, "tabletsResolve(true); tabletsFinishResolve(true)");
  eq("streak 5 restores Winnow", read(sb, "R.powers.winnow"), 3);
  eq("streak 5 leaves Illuminate alone", read(sb, "R.powers.illum"), 1);
}

{
  // Multi-gap steps: Pace I carves 2 words, II carves 3, III carves 4.
```

Protected by: M1, M2, M3, M4, M5

### E14 the content hash of the edited rules module (shared/content/manifest.json)  (`shared/content/manifest.json`, serves O3, O4, D2)

Why: js/tablets.js is a hashed content source (scripts/export-content.mjs SOURCE_FILES), so the sourceHash must be the sha256 of the sources after E1-E5. prove.js computed it; the content:check gate check proves it.

Find (exactly once, line 7 of the file before this plan):

```json
  "sourceHash": "92306984fcbf276f6b37951244e6245a19b2b3dcaaebedbd6cca3db7e320a79e",
```

Replace with:

```json
  "sourceHash": "4095d32ad80721f5fe067f7b3de337faa033670a16b31ec52ba59e70dc3c9327",
```

Protected by: _no mutation of its own (say in the analysis what proves it)_

## B. Scope (measured on the baseline)

**1176 files** are in the recorded baseline; **4 change** (in 4 edited paths and 0 generated).

| edited file | bytes | lines | EOL | find at |
|---|---|---|---|---|
| `js/tablets.js` | 28193 | 448 | CRLF | 351 |
| `js/tablets.js` | 28193 | 448 | CRLF | 379 |
| `js/tablets.js` | 28193 | 448 | CRLF | 417 |
| `js/tablets.js` | 28193 | 448 | CRLF | 398 |
| `js/tablets.js` | 28193 | 448 | CRLF | 441 |
| `js/tablets-run.js` | 43082 | 1137 | CRLF | 512 |
| `js/tablets-run.js` | 43082 | 1137 | CRLF | 478 |
| `js/tablets-run.js` | 43082 | 1137 | CRLF | 632 |
| `js/tablets-run.js` | 43082 | 1137 | CRLF | 686 |
| `js/tablets-run.js` | 43082 | 1137 | CRLF | 645 |
| `js/tablets-run.js` | 43082 | 1137 | CRLF | 668 |
| `test/tablets.test.js` | 39911 | 751 | CRLF | 179 |
| `test/tablets.test.js` | 39911 | 751 | CRLF | 665 |
| `shared/content/manifest.json` | 540 | 25 | CRLF | 7 |

Files that change: `js/tablets-run.js`, `js/tablets.js`, `shared/content/manifest.json`, `test/tablets.test.js`.

Checks after the edits: `CI content:check passes (js/tablets.js is a hashed content source)`; `js/tablets.js still parses`; `js/tablets-run.js still parses`; `test/tablets.test.js still parses`; `CI lint (oxlint) still passes`.
## C. Anchors (measured by `make-expected.js`, re-checked by `gate pre`)

| file | line(s) | copies | text |
|---|---|---|---|
| `js/tablets.js` | 345 | 1 | `const COMBO_STEP = 0.5, COMBO_CAP = 5;` |
| `js/tablets.js` | 351 | 1 | `const RELICS = ["illuminate", "stasis", "chisel"];` |
| `js/tablets.js` | 352 | 1 | `const RELIC_MAX = 3, RELIC_EVERY = 5, CHISEL_EVERY = 10;` |
| `js/tablets.js` | 340 | 1 | `MILESTONES = [` |
| `js/tablets.js` | 379 | 1 | `function carve(input){` |
| `js/tablets.js` | 417 | 1 | `function recharge(charges, streak, reachedMilestone){` |
| `js/tablets-run.js` | 468 | 1 | `function tabletsIlluminate(){` |
| `js/tablets-run.js` | 481 | 1 | `R.powers.illum--;` |
| `js/tablets-run.js` | 495 | 1 | `function tabletsWinnow(){` |
| `js/tablets-run.js` | 516 | 1 | `R.tabletWinnow = decoys.slice(0, 2);` |
| `js/tablets-run.js` | 936 | 1 | `function tabletsSurge(){` |
| `js/tablets-run.js` | 940 | 1 | `R.surgeLeft = 9;` |
| `js/tablets-run.js` | 947 | 1 | `function tabletsRollBlessing(){` |
| `js/game.js` | 514 | 1 | `illum:1 + reservedIlluminate, winnow:2` |
| `test/tablets.test.js` | 345 | 1 | `"winnow dims two decoys"` |
| `test/tablets.test.js` | 182 | 1 | `"streak 10 adds the chisel"` |
| `test/tablets.test.js` | 348 | 1 | `"a second Winnow on the same blank does not spend"` |
| `shared/content/manifest.json` | 7 | 1 | `"sourceHash":` |
## D. Tests and proof (measured)

- The full run: 75 results, 75 PASS / 0 FAIL before -> 75 results, 75 PASS / 0 FAIL after.
- The plan's own suite (`test/tablets.test.js`): 5496 assertions before -> **5512 after**. No test was weakened or dropped.
- Every suite name and status after the plan is recorded in `fix-plan/expected.json`; any rename, drop or status change fails `gate post` check H3.
- These must PASS afterwards (13): `word tablets`, `content pipe`, `production readiness`, `interaction`, `keys`, `all game modes`, `ui structure`, `menu modes`, `integration`, `mobile layout`, `motion`, `game structure`, `edition logic`.
- Obsolete names that must no longer exist (0): none.

Mutations (each must make the named test FAIL, or the new tests prove nothing):

| # | what it breaks | file | must FAIL |
|---|---|---|---|
| M1 | the charge cap is gone | `js/tablets.js` | word tablets |
| M2 | Winnow recharges every 4 instead of every 5 | `js/tablets.js` | word tablets |
| M3 | the Tithe pays nothing | `js/tablets.js` | word tablets |
| M4 | Winnow banishes every decoy | `js/tablets.js` | word tablets |
| M5 | Illuminate's carve is graded from the sand instead of Carved | `js/tablets-run.js` | word tablets |
## E. Pinned tooling (sha256, from `prove.js`)

| tool | sha256 |
|---|---|
| `fix-plan/config.js` | `93499d2dbfcf28ab7745669ba93aadd77730d21f497a4a45b827d6a786186d2d` |
| `fix-plan/edits.js` | `cb4d016127ac7046dad41d71cd98cbe97c7b318b1792583ff5c16a177f5009f9` |
| `fix-plan/apply.js` | `7c2aa2ed89fde06e94432469075d8e5cf4f2bfe6e9299ffb5fbdf8d33dffa024` |
| `fix-plan/lib.js` | `0ae73e6117cb2595af8bbd61a75cbab927f7f5a963b62910b6f7b82bb11fa93e` |
| `fix-plan/scope-report.js` | `4b2e2cae22f7cd71aa03f5b542c225364ab465559abb6589b155ec7ff4b3f296` |
| `fix-plan/make-expected.js` | `a44c6b89d95ac61db9722adb307cd61a345911bcb1fa2654f8e65ea96b7f8b13` |
| `fix-plan/prove.js` | `1f298e23c529fb3eb5d08791c60839ef3ee93057b050fe09e5e8d1b92852e4d4` |
| `fix-plan/render-plan.js` | `8ae53bf4ba058e1d8bf9259e2daeb19dc940378d9667aec13d85a83647c7257e` |
<!-- END GENERATED: PLAN FACTS -->

## 6. Not measured
- **Balance.** No playtest: how often Winnow (every 5) and Illuminate (every 10) come back inside a 6–9 step Hold, and
  whether a Tithe at 10 doubles the Favor too fast, is not measured. The numbers are the decided ones.
- **Android.** `Tablets.kt` has its own relics (`illuminate`/`stasis`/`chisel`) and its own `LIVES = 2`; the Kotlin port
  is phase 8. Nothing native runs here.
- **The download's version of the power.** The reference `activateChiselRelic` clamps the sand to 15% gone and grades
  Fresh sand; the user chose O4's Carved instead. Only the mechanism (a graded carve, no typed bonus) was adopted.
- **Judgment / Endless (phase 6) and the rising-scroll visuals (phase 7)** — untouched, as the executor plan scopes.
- **The banner is shared.** `tabletsRollBlessing` and the milestone banner both paint `#tablets-blessing`; the milestone
  is painted after the blessing so it wins, but two events on the same hit are not exercised by a test.

## 7. Execution report (2026-11-03, branch `feat/tablets-arcade-phase-5`)
1. **Scope analysis:** section 4; `node fix-plan/scope-report.js` printed
   `SCOPE VERDICT: READY  (14 edit(s) pending, 0 already applied)`.
2. **The gate:**
   - `node fix-plan/gate.js pre` -> `RESULT: PASS  (38/38 checks passed, mode=pre)`; report
     `%TEMP%\fix-plan-gate-report-pre.json`, sha256 `32b4358801dc8298dcffa904b9c19836523769105e37e47bd08f6b9ff0f53964`.
     It re-checked 1176 baseline files byte-identical, every anchor, every invariant, the line endings and all 14
     backup hashes, and recorded `75 results, 75 PASS / 0 FAIL`.
   - `node fix-plan/apply.js .` -> `applied 14 edits to 4 files`.
   - `node fix-plan/gate.js post` -> `RESULT: PASS  (35/35 checks passed, mode=post)`, exit code 0; report
     `%TEMP%\fix-plan-gate-report-post.json`, sha256 `6d5709d42612dd1dea55bc5cb8c86e0d9f31133a46522e88c145f5dbff830d21`.
3. **The two quoted lines:** `S1  exactly these files changed: js/tablets-run.js, js/tablets.js,
   shared/content/manifest.json, test/tablets.test.js` and `H1  tests: 75 results and at least 75 PASS`. The suite went
   from 5496 to 5512 assertions. All five mutations were caught: `MUT-M1` (no cap), `MUT-M2` (Winnow every 4),
   `MUT-M3` (a Tithe of 0), `MUT-M4` (Winnow clears the tray), `MUT-M5` (Illuminate graded from the clock).
   `C-content` (`shared/content is current (including NKJV)`) and `C-lint` passed.
4. **Browser check (Chromium, 430x900, offline save, `%TEMP%\ctv-p5-browser\`):** `BROWSER CHECK: PASS`, zero console
   and page errors. The Hold opened with `winnow 2` and `illum 1`. Typing `want` carved the first gap (Favor 200, the
   typed bonus), then pressing `w` on "pastures" fired **Winnow** (charge 2 -> 1, 2 of the 4 stones greyed — O3's
   `min(3, 3 - 1)`), and pressing `i` fired **Illuminate**: it carved "pastures", spent the charge (1 -> 0), took the
   streak to 2, paid 150 Favor at streak 2, and the popup read `Carved · +150 FAVOR` (`02-illuminate.png`). Setting the
   streak to 9 and taking one more gap paid the **Tithe**: the banner read `Tithe · +500 FAVOR`, the carve popup
   `Fresh sand · +1025 FAVOR`, Favor went 350 -> 1375, and the streak-10 recharge raised Winnow 1 -> 2 and Illuminate
   0 -> 1 (`03-tithe.png`).
5. **Not run:** Android/Gradle (the Kotlin relics and `LIVES = 2` are phase 8); no balance playtest of the 5/10 charge
   cadence; the download's Fresh-sand variant of the power was deliberately not implemented (the user chose O4's
   Carved).
