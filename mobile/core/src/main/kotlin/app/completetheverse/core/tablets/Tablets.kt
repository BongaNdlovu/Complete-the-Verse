package app.completetheverse.core.tablets

import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import java.util.Locale
import kotlin.math.max
import kotlin.math.roundToInt

@Serializable
data class TabletBlank(
    val r: String,
    val prefix: String,
    val a: String,
    val suffix: String = "",
    val d: List<String> = emptyList(),
)

@Serializable
data class TabletChapter(
    val id: String,
    val name: String,
    val r: String,
    val subtitle: String = "",
    val pace: Int = 1,
    val tutorial: Boolean = false,
    val hall: Boolean = false,
    val after: String = "",
    val afterName: String = "",
    val testament: String = "",
    val blanks: List<TabletBlank> = emptyList(),
)

data class TabletRecord(
    val best: Int = 0,
    val held: Boolean = false,
)

data class TabletsBank(
    val blankS: Int,
    val holdsToOpen: Int,
    val chapters: List<TabletChapter>,
    val byId: Map<String, TabletChapter>,
    val canon: List<TabletChapter>,
    val hall: List<TabletChapter>,
    val more: List<TabletChapter>,
)

data class TabletsLibraryRow(
    val chapter: TabletChapter,
    val locked: Boolean,
    val detail: String,
    val best: Int,
)

data class TabletsLibraryGroup(
    val title: String,
    val rows: List<TabletsLibraryRow>,
)

@Serializable
private data class TabletsFile(
    val blankS: Int = Tablets.BLANK_S,
    val holdsToOpen: Int = Tablets.HOLDS_TO_OPEN,
    val canonIds: List<String> = emptyList(),
    val hallIds: List<String> = emptyList(),
    val moreIds: List<String> = emptyList(),
    val chapters: List<TabletChapter> = emptyList(),
)

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
    const val HOLDS_TO_OPEN = 3
    const val LIVES = 3
    const val HIT_HOLD_MS = 1_000L
    const val MISS_HOLD_MS = 800L

    val LEVEL_NAME = listOf("I", "II", "III")

    val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    fun parse(raw: String): TabletsBank {
        val file = json.decodeFromString(TabletsFile.serializer(), raw)
        val chapters = file.chapters
        val byId = linkedMapOf<String, TabletChapter>()
        for (ch in chapters) byId[ch.id] = ch
        fun pick(ids: List<String>): List<TabletChapter> = ids.mapNotNull { byId[it] }
        return TabletsBank(
            blankS = if (file.blankS > 0) file.blankS else BLANK_S,
            holdsToOpen = if (file.holdsToOpen > 0) file.holdsToOpen else HOLDS_TO_OPEN,
            chapters = chapters,
            byId = byId,
            canon = pick(file.canonIds),
            hall = pick(file.hallIds),
            more = pick(file.moreIds),
        )
    }

    fun chapter(bank: TabletsBank, id: String): TabletChapter =
        bank.byId[id] ?: bank.chapters.first()

    fun clampLevel(n: Int): Int = n.coerceIn(1, 3)

    fun paceOf(ch: TabletChapter?): Int {
        if (ch == null || ch.tutorial) return 1
        return clampLevel(if (ch.pace > 0) ch.pace else 1)
    }

    fun pickLevel(ch: TabletChapter?): Int = paceOf(ch)

    fun clockS(bank: TabletsBank? = null, pace: Int? = null): Int {
        if (pace != null) return bank?.blankS ?: BLANK_S
        return bank?.blankS ?: BLANK_S
    }

    fun levelName(level: Int): String = LEVEL_NAME.getOrElse(clampLevel(level) - 1) { "I" }

    fun gapCount(tutorial: Boolean, level: Int): Int {
        if (tutorial) return 1
        return (level + 1).coerceIn(1, 4)
    }

    fun buildSteps(ch: TabletChapter, k: Int): List<List<TabletBlank>> {
        val size = k.coerceAtLeast(1)
        val steps = mutableListOf<List<TabletBlank>>()
        var i = 0
        while (i < ch.blanks.size) {
            steps.add(ch.blanks.subList(i, (i + size).coerceAtMost(ch.blanks.size)))
            i += size
        }
        return steps
    }

    fun options(blank: TabletBlank?, rng: (() -> Double)? = null): List<String> {
        if (blank == null) return emptyList()
        val picked = mutableListOf<String>()
        val ban = mutableSetOf(norm(blank.a))
        for (d in blank.d) {
            val s = d.trim()
            if (s.isEmpty() || norm(s) in ban) continue
            ban.add(norm(s))
            picked.add(s)
            if (picked.size >= 5) break
        }
        return Assemble.shuffle(listOf(blank.a) + picked, rng)
    }

    fun choiceMatches(choice: String, answer: String): Boolean {
        val got = norm(choice)
        val need = norm(answer)
        return got.isNotEmpty() && got == need
    }

    /* A Hold is a finished chapter with at least one lamp still lit. A miss
       spends a lamp; it no longer breaks the Hold on its own. Web parity:
       js/tablets.js held() after fix-plan phase 1 (2026-11-03). */
    fun held(miss: Int, lives: Int, idx: Int, total: Int): Boolean =
        idx >= total && total > 0 && lives - miss >= 1

    fun editionKey(chapterId: String, translation: String = "kjv"): String =
        if (translation == "nkjv") "nkjv~$chapterId" else chapterId

    fun recordOf(save: SaveBlob, id: String, translation: String = "kjv"): TabletRecord {
        val pack = save["tablets"] as? JsonObject ?: return TabletRecord()
        val key = editionKey(id, translation)
        val row = pack[key] as? JsonObject ?: return TabletRecord()
        return TabletRecord(best = jsonInt(row["best"]), held = jsonBool(row["held"]))
    }

    fun tutorialDone(save: SaveBlob): Boolean {
        val set = save["set"] as? JsonObject ?: return false
        return jsonBool(set["tabletsTutorialDone"])
    }

    fun heldCountAtPace(save: SaveBlob, bank: TabletsBank, pace: Int): Int {
        var n = 0
        for (ch in bank.chapters) {
            if (ch.tutorial || paceOf(ch) != pace) continue
            if (recordOf(save, ch.id).held) n++
        }
        return n
    }

    fun paceGateOpen(pace: Int, save: SaveBlob, bank: TabletsBank): Boolean {
        if (pace <= 1) return true
        val need = bank.holdsToOpen
        return heldCountAtPace(save, bank, pace - 1) >= need
    }

    fun paceGateLabel(pace: Int): String =
        if (pace >= 3) "Hold 3 at Pace II to open" else "Hold 3 at Pace I to open"

    fun unlocked(id: String, save: SaveBlob, bank: TabletsBank): Boolean {
        if (id == "prayer" || id == "psalm23") return true
        if (id == "psalm91") return recordOf(save, "psalm23").held
        if (id == "john1") return recordOf(save, "psalm91").held
        val ch = bank.byId[id] ?: return false
        if (ch.tutorial) return true
        if (ch.hall) {
            if (!paceGateOpen(paceOf(ch), save, bank)) return false
            return recordOf(save, "john1").held
        }
        if (ch.after.isEmpty()) return false
        if (recordOf(save, id).held) return true
        return pilgrimCleared(save, ch.after)
    }

    fun unlockLabel(id: String, save: SaveBlob, bank: TabletsBank): String {
        if (id == "psalm91") return "Hold Psalm 23 to open"
        if (id == "john1") return "Hold Psalm 91 to open"
        val ch = bank.byId[id] ?: return "Open"
        if (ch.tutorial) return "Open"
        if (ch.after.isNotEmpty()) {
            val place = ch.afterName.ifEmpty { ch.after }
            return "Clear $place to open"
        }
        if (ch.hall && !recordOf(save, "john1").held) return "Hold John 1 to open"
        return paceGateLabel(paceOf(ch))
    }

    fun playableList(bank: TabletsBank): List<TabletChapter> {
        val out = mutableListOf<TabletChapter>()
        for (p in 1..3) {
            for (ch in bank.chapters) {
                if (ch.tutorial) continue
                if (paceOf(ch) == p) out.add(ch)
            }
        }
        return out
    }

    fun nextPlayable(id: String, save: SaveBlob, bank: TabletsBank): TabletChapter? {
        val list = playableList(bank)
        var seen = false
        for (ch in list) {
            if (ch.id == id) {
                seen = true
                continue
            }
            if (seen && unlocked(ch.id, save, bank)) return ch
        }
        return null
    }

    fun holdKick(id: String, save: SaveBlob, bank: TabletsBank): String {
        if (id == "psalm23") return "Pace I held. Psalm 91 is open."
        if (id == "psalm91") return "Pace I held. John 1 is open."
        if (id == "john1") return "Pace I held. The Hall is open."
        val ch = chapter(bank, id)
        val pace = paceOf(ch)
        if (pace == 1) {
            return if (paceGateOpen(2, save, bank)) "Pace II is open."
            else "Pace I held. Pace II opens after 3 Holds."
        }
        if (pace == 2) {
            return if (paceGateOpen(3, save, bank)) "Pace III is open."
            else "Pace II held. Pace III opens after 3 Holds."
        }
        return "The manuscript held"
    }

    fun kickText(held: Boolean, abandoned: Boolean, id: String, save: SaveBlob, bank: TabletsBank): String {
        if (abandoned) return "The run was abandoned"
        if (!held) return "The tablet shattered"
        return holdKick(id, save, bank)
    }

    fun library(bank: TabletsBank, save: SaveBlob): List<TabletsLibraryGroup> {
        val prayer = mutableListOf<TabletChapter>()
        val paces = listOf(mutableListOf<TabletChapter>(), mutableListOf(), mutableListOf())
        for (ch in bank.chapters) {
            if (ch.tutorial) prayer.add(ch)
            else paces[paceOf(ch) - 1].add(ch)
        }
        val out = mutableListOf<TabletsLibraryGroup>()
        if (prayer.isNotEmpty()) out.add(TabletsLibraryGroup("The prayer", prayer.map { rowOf(it, save, bank) }))
        val names = listOf("Pace I", "Pace II", "Pace III")
        for (i in 0..2) {
            if (paces[i].isEmpty()) continue
            val title = when {
                i == 0 -> names[0]
                paceGateOpen(i + 1, save, bank) -> names[i]
                i == 1 -> "Pace II · Hold 3 at Pace I to open"
                else -> "Pace III · Hold 3 at Pace II to open"
            }
            out.add(TabletsLibraryGroup(title, paces[i].map { rowOf(it, save, bank) }))
        }
        return out
    }

    fun persistTutorialDone(save: SaveBlob): SaveBlob {
        val set = ((save["set"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        set["tabletsTutorialDone"] = JsonPrimitive(true)
        val out = save.toMutableMap()
        out["set"] = JsonObject(set)
        return JsonObject(out)
    }

    fun persistChapter(save: SaveBlob, id: String, pct: Int, nowHeld: Boolean): SaveBlob {
        val tablets = ((save["tablets"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        val rec = ((tablets[id] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        val prevBest = jsonInt(rec["best"])
        val prevHeld = jsonBool(rec["held"])
        rec["best"] = JsonPrimitive(max(prevBest, pct))
        val firstHold = nowHeld && !prevHeld
        if (nowHeld) rec["held"] = JsonPrimitive(true)
        else if ("held" !in rec) rec["held"] = JsonPrimitive(false)
        tablets[id] = JsonObject(rec)

        val out = save.toMutableMap()
        out["tablets"] = JsonObject(tablets)

        val best = ((save["best"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        if (pct > jsonInt(best["tablets"])) best["tablets"] = JsonPrimitive(pct)
        out["best"] = JsonObject(best)

        if (firstHold) {
            val life = ((save["life"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
            life["tabletHolds"] = JsonPrimitive(jsonInt(life["tabletHolds"]) + 1)
            out["life"] = JsonObject(life)
        }
        return JsonObject(out)
    }

    fun persistRun(
        save: SaveBlob,
        id: String,
        pct: Int,
        nowHeld: Boolean,
        correct: Int,
        attempts: Int,
        bestStreak: Int,
        finished: Boolean,
        scoreMul: Double,
    ): SaveBlob {
        var next = persistChapter(save, id, pct, nowHeld)
        val runs = jsonInt(next["runs"]) + 1
        val map = next.toMutableMap()
        map["runs"] = JsonPrimitive(runs)

        val oilGain = correct * 2
        if (oilGain > 0) {
            map["oil"] = JsonPrimitive(jsonInt(next["oil"]) + oilGain)
            val life = ((map["life"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
            life["oilEarned"] = JsonPrimitive(jsonInt(life["oilEarned"]) + oilGain)
            map["life"] = JsonObject(life)
        }

        val acc = if (attempts == 0) 0.0 else correct.toDouble() / attempts
        val baseScore = correct
        val streakBonus = (bestStreak * 120 * scoreMul).roundToInt()
        val accBonus = (acc * 1200 * scoreMul).roundToInt()
        val survivalBonus = (correct * 60 * scoreMul).roundToInt()
        val total = baseScore + streakBonus + accBonus + survivalBonus
        val xpGain = (total / 12.0 + correct * 14 + if (finished) 300 else 0).roundToInt()
        if (xpGain > 0) map["xp"] = JsonPrimitive(jsonInt(next["xp"]) + xpGain)
        return JsonObject(map)
    }

    fun tutorialPrompt(idx: Int): String {
        val prompts = listOf(
            "Tap FATHER below",
            "The word flies into the carved slot",
            "In the true Hold the sand runs; here it stands still",
            "Illuminate glows the true stone for a breath",
            "Winnow casts three false stones into shadow",
            "Three lamps guard a wrong word. The sand is the Hold",
            "Almost complete · Let no word be lost",
            "Final word · Engrave it to seal your first Hold and open the Hall!",
        )
        return prompts.getOrElse(idx) { "Carve the missing word to complete the prayer." }
    }

    private fun rowOf(ch: TabletChapter, save: SaveBlob, bank: TabletsBank): TabletsLibraryRow {
        val locked = !unlocked(ch.id, save, bank)
        val rec = recordOf(save, ch.id)
        val detail = when {
            ch.tutorial -> "Untimed · learn the Hold"
            locked -> unlockLabel(ch.id, save, bank)
            else -> "${ch.blanks.size} blanks · Pace ${levelName(paceOf(ch))} · ${clockS(bank)}s"
        }
        return TabletsLibraryRow(chapter = ch, locked = locked, detail = detail, best = rec.best)
    }

    private fun pilgrimCleared(save: SaveBlob, siteId: String): Boolean {
        val pilgrim = save["pilgrim"] as? JsonObject ?: return false
        val sites = pilgrim["sites"] as? JsonObject ?: return false
        val rec = sites[siteId] as? JsonObject ?: return false
        return jsonBool(rec["cleared"])
    }

    private fun norm(s: String): String =
        s.trim().replace(Regex("\\s+"), " ").lowercase(Locale.ROOT)

    internal fun jsonInt(el: JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }

    internal fun jsonBool(el: JsonElement?): Boolean {
        val p = el as? JsonPrimitive ?: return false
        p.booleanOrNull?.let { return it }
        return when (p.content) {
            "true" -> true
            "false" -> false
            else -> (p.doubleOrNull ?: 0.0) != 0.0
        }
    }
}
