# Plan: Word Tablets phase 8c, the Android port of phases 2–5 and six tablets

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
Android Word Tablets still plays the pre-arcade rules: two lamps (`const val LIVES = 2`, Tablets.kt:80), the 1x–4x tier Favor (`tierMult`, TabletsSession.kt:305), Winnow greys two (`decoys.take(2)`, :243), Illuminate only lights the stone, and options stop at 3 decoys (`picked.size >= 3`, Tablets.kt:152), all measured in `sources/p8c-sites.txt`. Phase 8c ports the web's phases 2–5 and the six-tablet tray (decision A1, 2026-11-03). Every suite passes today, so there is no failing target; 9 mutations prove the new Kotlin tests. End state: 31 edits applied to 9 files (section 7), every other file byte-identical, the web suites and both Gradle test tasks passing.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| K1 | No arcade rules on Android | none exist | Decision A1: port Tablets.rules | `object TabletsRules` in Tablets.kt (grades, combo, milestones, carve, miss, Winnow count, recharge); halves round up like JS |
| K2 | Favor from the tiers | `tierMult` (TabletsSession.kt:305) | Decision O2 | the carve's points; a hit line "Sure · +180 FAVOR" on the hold screen |
| K3 | Two lamps, no pushback | `LIVES = 2` (Tablets.kt:80), the miss branch (TabletsSession.kt:147) | Decision D1 | LIVES 3; `TabletsRules.miss` sets the lamps and pushes the sand back |
| K4 | Old powers | `decoys.take(2)` (:243); Illuminate only hints | Decisions O3, O4, D2, D4 | Winnow takes `winnowCount`; Illuminate carves at "carved"; streak recharge; milestones |
| K5 | Four tablets | `picked.size >= 3` (Tablets.kt:152), letters A–D (TabletsHoldScreen.kt:64) | Decision: six tablets | cap 5; letters A–F |
| K6 | Copy says two lamps, Winnow says two stones | HallModes, the library, the tutorial lines (Tablets.kt:375, js/tablets-run.js:138) | follows K3 and phase 8b | three lamps / a third miss; Winnow casts three |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, `mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, `mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsLibraryScreen.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/hall/HallModes.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsRoute.kt`, `js/tablets-run.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1172 files stay byte-identical. No file is added or deleted.
- **Invariants:** the Kotlin Hold rule (phase 1 parity), all of js/tablets.js (the rules this ports), and the web step flow and Winnow stay byte-identical; the only web change is the tutorial line.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 9 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `ef14dc1bc0109a3f1c5791bf12ac364f06b3a73a033787159976879fc5e074ae`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 9 file(s) change (`js/tablets-run.js`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/hall/HallModes.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsLibraryScreen.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsRoute.kt`, `mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt`, `mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, `mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, `mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`) and 1172 stay identical.
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
node fix-plan/apply.js .      # required: applied 31 edits to 9 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (38/38 checks passed, mode=post)
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
### E1 TabletsRules: grades, combo, milestones, carve, lamps, winnow, recharge  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, serves K1)

Why: Adds object TabletsRules (same file, before Tablets) with the web numbers: grade bands, combo, Favor rounding (half up, as JS Math.round), milestones Tithe/Double portion/Jubilee, pushback, winnowCount, recharge cadence.

Find (exactly once):

```kt
object Tablets {
    const val BLANK_S = 25
```

Replace with:

```kt
/* Arcade rules, ported from js/tablets.js Tablets.rules. Numbers only: the grade bands, the carve combo and Favor,
   the three lamps with pushback, Winnow, the streak recharge and the Tithe / Double portion / Jubilee milestones. */
object TabletsRules {
    data class Grade(val id: String, val upTo: Double, val mult: Double, val fill: Int)
    data class Milestone(val streak: Int, val bonus: Int)
    data class Carve(val points: Int, val streak: Int, val grade: String, val milestone: Milestone?)
    data class Miss(val lit: Int, val ended: Boolean, val progress: Double)
    data class Recharge(val winnow: Int, val illum: Int, val gained: List<String>)

    private const val COMBO_STEP = 0.5
    private const val COMBO_CAP = 5.0
    private const val BASE_POINTS = 100.0
    private const val ROUND_TO = 5.0
    private const val PUSHBACK = 0.45
    private const val PUSHBACK_FLOOR = 0.12
    private const val CHARGE_MAX = 3
    private const val WINNOW_EVERY = 5
    private const val ILLUM_EVERY = 10

    val GRADES = listOf(
        Grade("divine", 0.3, 1.5, 28),
        Grade("sacred", 0.65, 1.2, 20),
        Grade("carved", 0.82, 1.0, 14),
        Grade("clutch", 1.0, 1.75, 35),
    )
    private val MILESTONES = listOf(Milestone(10, 500), Milestone(25, 1500))

    private fun clamp01(n: Double): Double = n.coerceIn(0.0, 1.0)

    /* 0 is fresh sand, 1 is sand gone. A missing max reads as spent. */
    fun progressOf(left: Double, max: Double): Double {
        if (!(max > 0.0)) return 1.0
        return clamp01(1.0 - left / max)
    }

    fun grade(progress: Double): Grade {
        val p = clamp01(progress)
        return GRADES.firstOrNull { p <= it.upTo } ?: GRADES.last()
    }

    fun gradeOf(id: String): Grade? = GRADES.firstOrNull { it.id == id }

    fun gradeName(id: String): String = when (id) {
        "divine" -> "Fresh sand"
        "sacred" -> "Sure"
        "carved" -> "Carved"
        "clutch" -> "Last grain"
        else -> "Sure"
    }

    /* The streak combo multiplies every carve and tops out at COMBO_CAP. */
    fun comboOf(streak: Int): Double = minOf(1.0 + (maxOf(0, streak) / 2) * COMBO_STEP, COMBO_CAP)

    fun milestone(streak: Int): Milestone? {
        MILESTONES.firstOrNull { it.streak == streak }?.let { return it }
        val late = streak >= 50 && streak % 25 == 0
        return if (late) Milestone(streak, 3500) else null
    }

    fun milestoneName(streak: Int): String = when {
        streak >= 50 -> "Jubilee"
        streak >= 25 -> "Double portion"
        else -> "Tithe"
    }

    /* A carve pays base x combo x grade, rounded to 5, plus any milestone bonus. The grade is the sand band unless
       a power names one (Illuminate carves at "carved"). Halves round up, as JS Math.round does. */
    fun carve(progress: Double, streak: Int, gradeId: String? = null): Carve {
        val next = streak + 1
        val forced = if (gradeId == null) null else gradeOf(gradeId)
        val g = forced ?: grade(progress)
        val reached = milestone(next)
        val raw = BASE_POINTS * comboOf(next) * g.mult + (reached?.bonus ?: 0)
        val points = (kotlin.math.floor(raw / ROUND_TO + 0.5) * ROUND_TO).toInt()
        return Carve(points, next, g.id, reached)
    }

    /* Winnow banishes up to three false stones and never clears the tray: at least one decoy stays. */
    fun winnowCount(decoys: Int): Int = (decoys - 1).coerceIn(0, 3)

    /* A miss spends a lamp and pushes the sand back. The last lamp ends the run. */
    fun miss(lit: Int, progress: Double): Miss {
        val next = maxOf(0, lit - 1)
        if (next <= 0) return Miss(0, true, progress)
        return Miss(next, false, maxOf(PUSHBACK_FLOOR, progress - PUSHBACK))
    }

    /* Winnow comes back every WINNOW_EVERY streak, Illuminate every ILLUM_EVERY and on a milestone, never above CHARGE_MAX. */
    fun recharge(winnow: Int, illum: Int, streak: Int, milestone: Milestone?): Recharge {
        var w = winnow
        var i = illum
        val gained = mutableListOf<String>()
        if (streak > 0 && streak % WINNOW_EVERY == 0 && w < CHARGE_MAX) {
            w++
            gained.add("winnow")
        }
        val illumUp = milestone != null || (streak > 0 && streak % ILLUM_EVERY == 0)
        if (illumUp && i < CHARGE_MAX) {
            i++
            gained.add("illuminate")
        }
        return Recharge(w, i, gained)
    }
}

object Tablets {
    const val BLANK_S = 25
```

### E2 LIVES 2 to 3  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, serves K3)

Why: Three lamps (decision D1, web Tablets.rules LAMPS = 3). A session starts with three lamps and a third miss ends it.

Find (exactly once):

```kt
const val LIVES = 2
```

Replace with:

```kt
const val LIVES = 3
```

### E3 options cap 3 to 5 decoys  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, serves K5)

Why: Six tablets per blank: the answer and five decoys. NKJV blanks with three decoys still show four, as the web comment says.

Find (exactly once):

```kt
if (picked.size >= 3) break
```

Replace with:

```kt
if (picked.size >= 5) break
```

### E4 tutorial copy: Two lamps to Three lamps  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, serves K6)

Why: The tutorial prompt says three lamps, matching the rule and the web copy (js/tablets-run.js line 139).

Find (exactly once):

```kt
"Two lamps guard a wrong word. The sand is the Hold",
```

Replace with:

```kt
"Three lamps guard a wrong word. The sand is the Hold",
```

### E5 HallModes desc: three lamps, third miss shatters  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/hall/HallModes.kt`, serves K6)

Why: The Hall card describes the three-lamp Hold; the second miss now only spends a lamp.

Find (exactly once):

```kt
Two lamps guard the tablet: finish with a lamp still lit to Hold; a second miss or empty sand shatters.
```

Replace with:

```kt
Three lamps guard the tablet: finish with a lamp still lit to Hold; a third miss or empty sand shatters.
```

### E6 TabletsLibraryScreen desc: three lamps, third miss shatters  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsLibraryScreen.kt`, serves K6)

Why: The library description of the Hold matches the three-lamp rule (same copy as E5).

Find (exactly once):

```kt
Two lamps guard the tablet: finish with a lamp still lit to Hold; a second miss or empty sand shatters.
```

Replace with:

```kt
Three lamps guard the tablet: finish with a lamp still lit to Hold; a third miss or empty sand shatters.
```

### E7 session state: last grade, milestone, Favor, recharge gain, forced grade, lamp out  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K2, K3, K4)

Why: Public read-only results for the UI (lastGrade, lastMilestone, lastPoints, lastGained) and the private switches the rules need: forcedGrade (Illuminate) and lampOut (the run ends on the last lamp).

Find (exactly once):

```kt
    var confirmAbandon: Boolean = false
        private set
```

Replace with:

```kt
    var confirmAbandon: Boolean = false
        private set
    var lastGrade: String? = null
        private set
    var lastMilestone: TabletsRules.Milestone? = null
        private set
    var lastPoints: Int = 0
        private set
    var lastGained: List<String> = emptyList()
        private set
    private var forcedGrade: String? = null
    private var lampOut: Boolean = false
```

### E8 resolveHit: carve through TabletsRules, Favor = carve points, recharge  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K2, K4)

Why: A hit carves via the rules (grade from the sand, or forced at carved for Illuminate), adds the rounded points to Favor, records the grade and milestone, and recharges the powers outside the tutorial.

Find (exactly once):

```kt
        correct += 1
        streak += 1
        if (streak > bestStreak) bestStreak = streak
        val mult = tierMult(streak)
        favor += kotlin.math.round((120 + tabletClock * 8) * mult).toInt()
```

Replace with:

```kt
        correct += 1
        val carve = TabletsRules.carve(TabletsRules.progressOf(tabletClock, tabletClockMax), streak, forcedGrade)
        streak = carve.streak
        if (streak > bestStreak) bestStreak = streak
        favor += carve.points
        lastGrade = carve.grade
        lastMilestone = carve.milestone
        lastPoints = carve.points
        if (tutorial) return
        val r = TabletsRules.recharge(winnow, illum, streak, carve.milestone)
        winnow = r.winnow
        illum = r.illum
        lastGained = r.gained
```

### E9 remove tierMult (the old Favor tiers)  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K2)

Why: The old 1.0 to 4.0 tier table is replaced by the combo and grade bands in TabletsRules; nothing else calls it.

Find (exactly once):

```kt
    private fun tierMult(streak: Int): Double = when {
        streak >= 8 -> 4.0
        streak >= 5 -> 3.0
        streak >= 3 -> 2.0
        streak >= 1 -> 1.5
        else -> 1.0
    }

    private fun pct(): Int {
```

Replace with:

```kt
    /* O2: the carve combo (TabletsRules.comboOf) replaced the old 1x-4x tier multiplier. */
    private fun pct(): Int {
```

### E10 resolveMiss: rules decide lamps, lamp-out and pushback  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K3)

Why: A miss asks TabletsRules.miss for the lamps left, whether the run ends, and the pushed-back sand. Untimed runs keep the clock.

Find (exactly once):

```kt
        if (!tutorial) {
            tabletMiss += 1
            streak = 0
        }
```

Replace with:

```kt
        if (tutorial) return
        val m = TabletsRules.miss(lampsLeft, TabletsRules.progressOf(tabletClock, tabletClockMax))
        tabletMiss = tabletLives - m.lit
        lampOut = m.ended
        if (!untimed) tabletClock = tabletClockMax * (1 - m.progress)
        streak = 0
```

### E11 finishResolve: the run ends when the last lamp goes  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K3)

Why: The old check (misses below the lives) becomes the rule verdict lampOut, set by the miss.

Find (exactly once):

```kt
if (tutorial || tabletMiss < tabletLives) {
```

Replace with:

```kt
if (tutorial || !lampOut) {
```

### E12 begin: reset lampOut  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K3)

Why: A new run starts with its lamps lit.

Find (exactly once):

```kt
tabletLives = Tablets.LIVES
```

Replace with:

```kt
tabletLives = Tablets.LIVES
        lampOut = false
```

### E13 winnow: banish winnowCount(decoys) stones, not two  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K4)

Why: Winnow greys min(3, decoys - 1) false stones (web O3). With six tablets that is three; it still never clears the tray.

Find (exactly once):

```kt
        if (decoys.isEmpty()) return false
        grey = decoys.take(2)
```

Replace with:

```kt
        if (decoys.isEmpty()) return false
        val take = TabletsRules.winnowCount(decoys.size)
        if (take < 1) return false
        grey = decoys.take(take)
```

### E14 illuminate: carve the true word at the carved grade  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K4)

Why: Illuminate spends its charge and then carves the true word at Carved (web O4): it counts for the streak and Favor, no typed bonus. The early returns still guard it.

Find (exactly once):

```kt
        if (illum < 1) return false
        hintedKey = key
        hinted = true
        illum -= 1
```

Replace with:

```kt
        if (illum < 1) return false
        val blank = currentBlank ?: return false
        hintedKey = key
        hinted = true
        illum -= 1
        forcedGrade = "carved"
        pick(blank.a)
```

### E15 resetAids: clear the forced grade  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt`, serves K4)

Why: The Carved grade from Illuminate lasts for one carve only.

Find (exactly once):

```kt
        optsKey = ""
        grey = emptyList()
```

Replace with:

```kt
        optsKey = ""
        forcedGrade = null
        grey = emptyList()
```

### E16 TabletsViewModel: import TabletsRules  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt`, serves K2)

Why: The ViewModel mirrors the rules types for the hit line.

Find (exactly once):

```kt
import app.completetheverse.core.tablets.TabletsResult
```

Replace with:

```kt
import app.completetheverse.core.tablets.TabletsResult
import app.completetheverse.core.tablets.TabletsRules
```

### E17 TabletsViewModel: mirror the hit fields  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt`, serves K2)

Why: Observable mirrors of lastGrade, lastMilestone, lastPoints and lastGained (the same pattern as the other fields), plus hitLine, the popup text.

Find (exactly once):

```kt
    var pausedByHide by mutableStateOf(false)
        private set
```

Replace with:

```kt
    var pausedByHide by mutableStateOf(false)
        private set
    var lastGrade by mutableStateOf<String?>(null)
        private set
    var lastMilestone by mutableStateOf<TabletsRules.Milestone?>(null)
        private set
    var lastPoints by mutableIntStateOf(0)
        private set
    var lastGained by mutableStateOf<List<String>>(emptyList())
        private set
    var hitLine by mutableStateOf("")
        private set
```

### E18 TabletsViewModel.publish: copy the hit fields and build the hit line  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt`, serves K2)

Why: The hit line follows the web popup: grade, milestone when reached, Favor. The tutorial shows only the Favor.

Find (exactly once):

```kt
favor = s.favor
```

Replace with:

```kt
favor = s.favor
        lastGrade = s.lastGrade
        lastMilestone = s.lastMilestone
        lastPoints = s.lastPoints
        lastGained = s.lastGained
        val reached = s.lastMilestone
        val grade = TabletsRules.gradeName(s.lastGrade.orEmpty())
        hitLine = when {
            s.lastCorrect != true -> ""
            s.tutorial -> "+${s.lastPoints} FAVOR"
            reached != null -> "$grade · ${TabletsRules.milestoneName(reached.streak)} · +${s.lastPoints} FAVOR"
            else -> "$grade · +${s.lastPoints} FAVOR"
        }
```

### E19 TabletsViewModel.illuminate: start the resolve hold like pick()  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt`, serves K2)

Why: Illuminate now carves, so it must run the same hit hold and flyTick as pick (afterResolve only when a carve started).

Find (exactly once):

```kt
    fun illuminate() {
        session?.illuminate()
        publish()
    }
```

Replace with:

```kt
    fun illuminate() {
        val s = session ?: return
        val started = s.illuminate()
        publish()
        if (!started) return
        if (s.lastCorrect == true) flyTick++
        afterResolve(s)
    }
```

### E20 HoldScreen letters: A to F for six tablets  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt`, serves K5)

Why: Six stones need six letters. The stones keep choices.chunked(2), so six stones show as three rows of two.

Find (exactly once):

```kt
private val LETTERS = listOf("A", "B", "C", "D")
```

Replace with:

```kt
private val LETTERS = listOf("A", "B", "C", "D", "E", "F")
```

### E21 HoldScreen: hitLine parameter  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt`, serves K2)

Why: The hold screen receives the popup line. The default is empty, so an unwired caller compiles and shows an empty line. TabletsRoute.kt must pass viewModel.hitLine (not in config.edited: see the report).

Find (exactly once):

```kt
    streak: Int,
    paused: Boolean,
```

Replace with:

```kt
    streak: Int,
    hitLine: String = "",
    paused: Boolean,
```

### E22 HoldScreen: render the hit line under the header  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt`, serves K2)

Why: A single line reserved under the header shows the grade, milestone and Favor after a hit. It is always present so the stones do not jump.

Find (exactly once):

```kt
                onPause = onPause,
            )
            Column(
```

Replace with:

```kt
                onPause = onPause,
            )
            Text(
                text = hitLine.ifEmpty { " " },
                color = CtvColors.gold,
                fontFamily = CtvFonts.ui,
                fontSize = 13.sp,
                letterSpacing = 0.12.em,
            )
            Column(
```

### T1 test: options and stones are six, not four  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves K5, K7)

Why: Old assertion pinned four options (psalm23And91AnswersAreKjv).

Find (exactly once):

```kt
            assertEquals(4, opts.size)
```

Replace with:

```kt
            assertEquals(6, opts.size)
```

### T2 test: every chapter has six unique stones  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves K5, K7)

Why: Old assertions pinned four options and four unique stones with three decoys. Now five decoys make six.

Find (exactly once):

```kt
                assertEquals(4, opts.size, "${ch.id} ${blank.r}")
                assertTrue(blank.a in opts)
                assertTrue(blank.d.size >= 3)
                val uniq = (listOf(blank.a) + blank.d.take(3)).map { it.lowercase() }.toSet()
                assertEquals(4, uniq.size, "${ch.id} ${blank.r}")
```

Replace with:

```kt
                assertEquals(6, opts.size, "${ch.id} ${blank.r}")
                assertTrue(blank.a in opts)
                assertTrue(blank.d.size >= 3)
                val uniq = (listOf(blank.a) + blank.d.take(5)).map { it.lowercase() }.toSet()
                assertEquals(6, uniq.size, "${ch.id} ${blank.r}")
```

### T3 test: rename everyChapterHasFourUniqueStones  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves K7)

Why: The name said four; the assertions now pin six.

Find (exactly once):

```kt
fun everyChapterHasFourUniqueStones()
```

Replace with:

```kt
fun everyChapterHasSixUniqueStones()
```

### T4 test: a session starts with three lamps  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves K3, K7)

Why: Old assertion pinned LIVES = 2 at the start of psalm23.

Find (exactly once):

```kt
        assertEquals(2, session.tabletLives)
```

Replace with:

```kt
        assertEquals(3, session.tabletLives)
```

### T5 test: three lamps, pushback, third miss shatters  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves K3, K7)

Why: The old test ended the run on the second miss with a clock that did not move. Now a miss spends a lamp and pushes the sand back (25.0 to 22.0 from the first miss), and the third miss ends the run.

Find (exactly once):

```kt
    fun firstMissContinuesAndSecondMissShatters() {
        val session = start("psalm23")
        val clock = session.tabletClock
        session.pick("fear")
        session.finishResolve()
        assertFalse(session.ended)
        assertEquals(1, session.tabletMiss)
        assertEquals(0, session.tabletIdx)
        assertEquals(clock, session.tabletClock, 0.001)
        assertEquals(1, session.lampsLeft)
        session.pick("fear")
        session.finishResolve()
        assertTrue(session.ended)
        assertFalse(Tablets.held(session.tabletMiss, session.tabletLives, session.tabletIdx, session.tabletTotal))
        assertFalse(Tablets.recordOf(session.save, "psalm23").held)
        assertEquals("The tablet shattered", session.result?.kick)
        assertTrue(session.result!!.shattered)
        assertNull(session.result?.next)
    }
```

Replace with:

```kt
    fun firstTwoMissesContinueAndThirdMissShatters() {
        val session = start("psalm23")
        assertEquals(3, session.lampsLeft)
        session.pick("fear")
        session.finishResolve()
        assertFalse(session.ended)
        assertEquals(1, session.tabletMiss)
        assertEquals(0, session.tabletIdx)
        assertEquals(22.0, session.tabletClock, 0.001)
        assertEquals(2, session.lampsLeft)
        session.pick("fear")
        session.finishResolve()
        assertFalse(session.ended)
        assertEquals(1, session.lampsLeft)
        session.pick("fear")
        session.finishResolve()
        assertTrue(session.ended)
        assertFalse(Tablets.held(session.tabletMiss, session.tabletLives, session.tabletIdx, session.tabletTotal))
        assertFalse(Tablets.recordOf(session.save, "psalm23").held)
        assertEquals("The tablet shattered", session.result?.kick)
        assertTrue(session.result!!.shattered)
        assertNull(session.result?.next)
    }
```

### T6 test: new rules and session tests  (`mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt`, serves K1, K2, K3, K4, K5, K7)

Why: Adds the rules numbers (carve, combo, Tithe, rounding, miss, winnow, recharge) and the session behaviour (two misses Hold, six tablets, winnow greys three, illuminate carves).

Find (exactly once):

```kt
        assertFalse(Save.translationChosen(Save.DEFAULT))
    }
}
```

Replace with:

```kt
        assertFalse(Save.translationChosen(Save.DEFAULT))
    }

    @Test
    fun carveGradesComboAndTheTithe() {
        assertEquals(150, TabletsRules.carve(0.1, 0).points)
        assertEquals("divine", TabletsRules.carve(0.1, 0).grade)
        assertEquals(1, TabletsRules.carve(0.1, 0).streak)
        val sure = TabletsRules.carve(0.6, 1)
        assertEquals("sacred", sure.grade)
        assertEquals(180, sure.points)
        val tithe = TabletsRules.carve(0.1, 9)
        assertEquals(1025, tithe.points)
        assertEquals(10, tithe.milestone?.streak)
        assertEquals(265, TabletsRules.carve(0.9, 2).points)
        assertEquals("Tithe", TabletsRules.milestoneName(10))
        assertEquals("Double portion", TabletsRules.milestoneName(25))
        assertEquals("Jubilee", TabletsRules.milestoneName(50))
        assertEquals("Last grain", TabletsRules.gradeName("clutch"))
    }

    @Test
    fun missWinnowAndRechargeFollowTheRules() {
        val pushed = TabletsRules.miss(3, 0.9)
        assertEquals(2, pushed.lit)
        assertFalse(pushed.ended)
        assertEquals(0.45, pushed.progress, 0.001)
        assertEquals(0.12, TabletsRules.miss(2, 0.2).progress, 0.001)
        assertTrue(TabletsRules.miss(1, 0.5).ended)
        assertEquals(3, TabletsRules.winnowCount(5))
        assertEquals(2, TabletsRules.winnowCount(3))
        assertEquals(0, TabletsRules.winnowCount(1))
        assertEquals(listOf("winnow"), TabletsRules.recharge(0, 0, 5, null).gained)
        assertEquals(listOf("winnow", "illuminate"), TabletsRules.recharge(0, 0, 10, null).gained)
        val capped = TabletsRules.recharge(3, 3, 10, null)
        assertEquals(3, capped.winnow)
        assertEquals(3, capped.illum)
        assertTrue(capped.gained.isEmpty())
    }

    @Test
    fun twoMissesThenFinishingIsHeld() {
        val session = start("psalm23")
        session.pick("fear")
        session.finishResolve()
        session.pick("fear")
        session.finishResolve()
        assertFalse(session.ended)
        assertEquals(1, session.lampsLeft)
        holdAll(session)
        assertTrue(session.ended)
        assertEquals(2, session.tabletMiss)
        assertTrue(session.result!!.held)
    }

    @Test
    fun kjvBlankShowsSixDistinctTabletsIncludingTheAnswer() {
        val blank = Tablets.chapter(bank, "psalm23").blanks[0]
        val opts = Tablets.options(blank, rng())
        assertEquals(6, opts.size)
        assertEquals(6, opts.map { it.lowercase() }.toSet().size)
        assertTrue(blank.a in opts)
    }

    @Test
    fun winnowGreysThreeAndIlluminateCarvesTheTrueWord() {
        val session = start("psalm23")
        assertTrue(session.winnow())
        assertEquals(3, session.grey.size)
        val lit = start("psalm23")
        assertTrue(lit.illuminate())
        assertTrue(lit.resolving)
        assertEquals(1, lit.correct)
        assertEquals("carved", lit.lastGrade)
        assertEquals(100, lit.favor)
        assertEquals(0, lit.illum)
    }
}
```

### E23 the route passes the hit line to the hold screen (TabletsRoute.kt)  (`mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsRoute.kt`, serves K2)

Why: E21 adds a hitLine parameter (default "") to TabletsHoldScreen; without this the grade line never shows.

Find (exactly once):

```kt
                    favor = viewModel.favor,
```

Replace with:

```kt
                    favor = viewModel.favor,
                    hitLine = viewModel.hitLine,
```

### E24 the Android tutorial says Winnow greys three (Tablets.kt)  (`mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt`, serves K6)

Why: with five decoys Winnow banishes min(3, 5 - 1) = 3, so "two" is no longer true.

Find (exactly once):

```kt
"Winnow casts two false stones into shadow",
```

Replace with:

```kt
"Winnow casts three false stones into shadow",
```

### E25 the web tutorial says Winnow greys three (js/tablets-run.js)  (`js/tablets-run.js`, serves K6)

Why: phase 8b gave the prayer five decoys, so the web Winnow greys three too; the callout still said two.

Find (exactly once):

```js
    "Winnow casts two false stones into shadow",
```

Replace with:

```js
    "Winnow casts three false stones into shadow",
```

What does not change: the content, the Hold rule, the library flow and the results screen. Surge and typing are not ported (Android has neither). Judgment, Endless and the rising card stay web-only (A1).

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)                76 ms  applied 31 edits to 9 files
make-expected                   118963 ms  expected.json written: 1181 baseline files; changed: js/tablets-run.js, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/hall/HallModes.kt, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsLibraryScreen.kt, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsRoute.kt, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt, mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt, mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt, mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt
tamper-test (+ full gate post)  708756 ms  TAMPER-TEST: PASS  (control passed; 13 tampers)
scope-report pristine              280 ms  SCOPE VERDICT: READY  (31 edit(s) pending, 0 already applied)
scope-report dry-run               181 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 31 already applied)
scope-report (real project)        184 ms  SCOPE VERDICT: READY  (31 edit(s) pending, 0 already applied)
gate pre (real project)          64316 ms  RESULT: PASS  (30/30 checks passed, mode=pre)

# make-expected
expected.json written: 1181 baseline files; changed: js/tablets-run.js, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/hall/HallModes.kt, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsLibraryScreen.kt, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsRoute.kt, mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt, mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt, mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt, mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt
tests before {"pass":77,"fail":0} (exit 0) -> after {"pass":77,"fail":0} (exit 0)
  anchor mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt:80 x1  const val LIVES = 2
  anchor mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt:152 x1  if (picked.size >= 3) break
  anchor mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt:376 x1  "Two lamps guard a wrong word. The sand is the Hold",
  anchor mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt:295 x1  favor += kotlin.math.round((120 + tabletClock * 8) * mult).toInt()
  anchor mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt:243 x1  grey = decoys.take(2)
  anchor mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt:147 x1  if (tutorial || tabletMiss < tabletLives) {
  anchor mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt:64 x1  private val LETTERS = listOf("A", "B", "C", "D")
  anchor mobile/androidApp/src/main/kotlin/app/completetheverse/ui/hall/HallModes.kt:50 x1  Two lamps guard the tablet: finish with a lamp still lit to Hold; a se

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (38/38 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (13/23 checks passed, mode=post)   caught by: S1  exactly these files changed: js/tablets-run.js, m, X-js/tablets-run.js  js/tablets-run.js is byte-identi, X-mobile/androidApp/src/main/kotlin/app/completetheve, X-mobile/androidApp/src/main/kotlin/app/completetheve
  OK    a stray file was added -> RESULT: FAIL  (21/23 checks passed, mode=post)   caught by: S1  exactly these files changed: js/tablets-run.js, m, S2  no file was added or deleted
  OK    edited file drifted by one byte: mobile/core/src/main/kotlin/app/completetheverse/core/tablets/Tablets.kt -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/core/src/main/kotlin/app/completetheverse/co
  OK    edited file drifted by one byte: mobile/core/src/main/kotlin/app/completetheverse/core/tablets/TabletsSession.kt -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/core/src/main/kotlin/app/completetheverse/co
  OK    edited file drifted by one byte: mobile/core/src/test/kotlin/app/completetheverse/core/tablets/TabletsTest.kt -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/core/src/test/kotlin/app/completetheverse/co
  OK    edited file drifted by one byte: mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsHoldScreen.kt -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/androidApp/src/main/kotlin/app/completetheve
  OK    edited file drifted by one byte: mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsViewModel.kt -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/androidApp/src/main/kotlin/app/completetheve
  OK    edited file drifted by one byte: mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsLibraryScreen.kt -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/androidApp/src/main/kotlin/app/completetheve
  OK    edited file drifted by one byte: mobile/androidApp/src/main/kotlin/app/completetheverse/ui/hall/HallModes.kt -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/androidApp/src/main/kotlin/app/completetheve
  OK    edited file drifted by one byte: mobile/androidApp/src/main/kotlin/app/completetheverse/ui/tablets/TabletsRoute.kt -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/androidApp/src/main/kotlin/app/completetheve
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (21/23 checks passed, mode=post)   caught by: S1  exactly these files changed: js/tablets-run.js, m, S3  the other 1172 files are byte-identical to the ba
  OK    half-applied: edit "E1 TabletsRules: grades, combo, milestones, carve, lamps, winnow, recharge" undone -> RESULT: FAIL  (22/23 checks passed, mode=post)   caught by: X-mobile/core/src/main/kotlin/app/completetheverse/co
TAMPER-TEST: PASS  (control passed; 13 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 ef14dc1bc0109a3f1c5791bf12ac364f06b3a73a033787159976879fc5e074ae
```

## 8. Not measured
- **On a device:** the hit line and the 3x2 stone grid are not checked on a phone or emulator; Gradle unit tests only.
- **Not ported:** Surge (phase 2's fill and x2) and typing (phase 4). A follow-up if wanted.
- **The recharge toast:** `lastGained` reaches the ViewModel but is not shown.
- **UI edits** (letters, hit line, route) and the copy edits have no mutation; Gradle compiles them and the unit tests run, nothing more.
- **CI:** the stacked PR targets the phase 8b branch; `ci.yml` runs on PRs to master only.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
