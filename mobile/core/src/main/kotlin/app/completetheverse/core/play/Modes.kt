package app.completetheverse.core.play

import app.completetheverse.core.bank.Verse
import app.completetheverse.core.practice.Practice
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.srs.Srs
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.doubleOrNull
import java.time.LocalDate
import java.util.Locale
import kotlin.math.floor

data class TrialAct(
    val n: String,
    val name: String,
    val tier: Int,
    val q: Int,
    val t: Long,
)

data class ModeRun(
    val questions: List<PlayQuestion>,
    val clockPolicy: ClockPolicy,
    val lives: Int,
    val title: String,
    val mode: String,
    val diff: Diff,
    val teamStart: String = "white",
)

object Modes {
    const val DAILY_LENGTH = 20
    const val RECALL_LENGTH = 12
    const val TEAM_EACH = 5
    const val TEAM_LENGTH = TEAM_EACH * 2
    const val ENDLESS_BATCH = 80
    const val BLITZ_BATCH = 80

    val DAILY_TIERS = listOf(1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5)
    val DAILY_MECHANICS = mapOf(
        4 to "duel",
        9 to "cloze",
        13 to "passage-ref",
        16 to "typed",
        19 to "fade",
    )

    val TRIAL_ACTS = listOf(
        TrialAct("I", "The Signal", 1, 8, 14_000L),
        TrialAct("II", "The Pursuit", 2, 8, 12_000L),
        TrialAct("III", "The Blackout", 3, 9, 10_000L),
        TrialAct("IV", "No Turning Back", 4, 9, 8_500L),
        TrialAct("V", "The Final Test", 5, 5, 6_500L),
        TrialAct("VI", "The Remnant", 5, 7, 5_500L),
    )

    val PLAYABLE = setOf("trial", "endless", "blitz", "daily", "recall", "team")

    fun todayKey(date: LocalDate = LocalDate.now()): String =
        "%04d-%02d-%02d".format(date.year, date.monthValue, date.dayOfMonth)

    fun seedFromString(s: String): Int {
        var h = 2166136261.toInt()
        for (ch in s) {
            h = h xor ch.code
            h *= 16777619
        }
        return h
    }

    fun mulberry32(seed0: Int): () -> Double {
        var seed = seed0
        return {
            seed += 0x6D2B79F5
            var t = imul(seed xor (seed ushr 15), 1 or seed)
            t = (t + imul(t xor (t ushr 7), 61 or t)) xor t
            (t xor (t ushr 14)).toUInt().toDouble() / 4294967296.0
        }
    }

    fun dailyRng(dateKey: String): () -> Double =
        mulberry32(seedFromString("ctv-$dateKey"))

    fun trialBest(save: SaveBlob): Int = jsonInt((save["best"] as? JsonObject)?.get("trial"))

    fun trialActs(save: SaveBlob): List<TrialAct> =
        if (trialBest(save) > 0) TRIAL_ACTS else TRIAL_ACTS.take(5)

    fun endlessTier(n: Int): Int = when {
        n < 5 -> 1
        n < 11 -> 2
        n < 19 -> 3
        n < 29 -> 4
        n % 5 == 0 -> 4
        else -> 5
    }

    fun titleFor(mode: String): String = when (mode) {
        "trial" -> "The Trial"
        "endless" -> "Endless Gauntlet"
        "blitz" -> "Scripture Blitz"
        "daily" -> "Daily Trial"
        "recall" -> "Recall"
        "team" -> "Team Mode"
        else -> "The Record"
    }

    fun clockPolicy(mode: String): ClockPolicy = when (mode) {
        "trial", "endless" -> ClockPolicy.Play
        "blitz" -> ClockPolicy.Blitz
        else -> ClockPolicy.Wall
    }

    fun livesFor(mode: String, diff: Diff): Int = when (mode) {
        "blitz", "team" -> 0
        else -> diff.lives
    }

    fun dailyAlreadyRecorded(save: SaveBlob, dateKey: String = todayKey()): Boolean {
        val daily = save["daily"] as? JsonObject ?: return false
        return (daily["date"] as? JsonPrimitive)?.content == dateKey
    }

    fun teamWinner(whiteKept: Int, whiteMs: Long, blueKept: Int, blueMs: Long): String = when {
        whiteKept != blueKept -> if (whiteKept > blueKept) "white" else "blue"
        whiteMs != blueMs -> if (whiteMs < blueMs) "white" else "blue"
        else -> "draw"
    }

    fun build(
        mode: String,
        verses: List<Verse>,
        save: SaveBlob,
        diff: Diff,
        rng: () -> Double,
        today: String = todayKey(),
        teamStart: String = "white",
    ): ModeRun {
        val questions = when (mode) {
            "trial" -> buildTrial(verses, save, rng)
            "endless" -> buildEndless(verses, rng)
            "blitz" -> buildBlitz(verses, rng)
            "daily" -> buildDaily(verses, today)
            "recall" -> buildRecall(verses, save, rng)
            "team" -> buildTeam(verses, save, rng)
            else -> emptyList()
        }
        return ModeRun(
            questions = questions,
            clockPolicy = clockPolicy(mode),
            lives = livesFor(mode, diff),
            title = titleFor(mode),
            mode = mode,
            diff = diff,
            teamStart = if (teamStart == "blue") "blue" else "white",
        )
    }

    fun buildTrial(verses: List<Verse>, save: SaveBlob, rng: () -> Double): List<PlayQuestion> {
        val draw = VerseDraw(verses, rng)
        val out = mutableListOf<PlayQuestion>()
        for (act in trialActs(save)) {
            val oneLife = act.n == "V" || act.n == "VI"
            repeat(act.q) {
                val v = draw.drawTier(act.tier)
                out += PlayQuestion(
                    mechanic = Mechanic.Mcq,
                    verse = v,
                    clockBaseMs = act.t,
                    oneLife = oneLife,
                    label = act.name,
                )
            }
        }
        return out
    }

    fun buildEndless(verses: List<Verse>, rng: () -> Double, count: Int = ENDLESS_BATCH): List<PlayQuestion> {
        val draw = VerseDraw(verses, rng)
        return (1..count).map { n ->
            PlayQuestion(
                mechanic = Mechanic.Mcq,
                verse = draw.drawTier(endlessTier(n)),
                clockBaseMs = PlayClock.endlessBaseMs(n),
            )
        }
    }

    fun buildBlitz(verses: List<Verse>, rng: () -> Double, count: Int = BLITZ_BATCH): List<PlayQuestion> {
        val draw = VerseDraw(verses, rng)
        return (1..count).map {
            PlayQuestion(mechanic = Mechanic.Mcq, verse = draw.drawAny())
        }
    }

    fun buildDaily(verses: List<Verse>, dateKey: String): List<PlayQuestion> {
        val rng = dailyRng(dateKey)
        val draw = VerseDraw(verses, rng)
        return DAILY_TIERS.mapIndexed { i, tier ->
            val v = draw.drawTier(tier)
            questionFromDailySlot(v, DAILY_MECHANICS[i])
        }
    }

    fun buildRecall(verses: List<Verse>, save: SaveBlob, rng: () -> Double): List<PlayQuestion> {
        val queue = reviewQueue(verses, save, rng, RECALL_LENGTH)
        return queue.map { v ->
            PlayQuestion(mechanic = Mechanic.Assemble, verse = v.copy(typed = true))
        }
    }

    fun buildTeam(verses: List<Verse>, save: SaveBlob, rng: () -> Double): List<PlayQuestion> {
        val queue = reviewQueue(verses, save, rng, TEAM_LENGTH)
        return queue.map { v -> PlayQuestion(mechanic = Mechanic.Mcq, verse = v) }
    }

    private fun reviewQueue(
        verses: List<Verse>,
        save: SaveBlob,
        rng: () -> Double,
        limit: Int,
    ): List<Verse> {
        val cards = Srs.cardsFromSave(save["srs"])
        return Practice.buildDrill(verses, { v -> cards[v.id] }, Srs.dayNumber(), limit, rng)
    }

    private fun questionFromDailySlot(verse: Verse, slot: String?): PlayQuestion = when (slot) {
        "duel" -> PlayQuestion(Mechanic.Duel, verse)
        "cloze" -> PlayQuestion(Mechanic.Cloze, verse)
        "passage-ref" -> PlayQuestion(Mechanic.PassageRef, verse)
        "typed" -> PlayQuestion(Mechanic.Assemble, verse.copy(typed = true))
        "fade" -> PlayQuestion(Mechanic.Fade, verse)
        else -> PlayQuestion(Mechanic.Mcq, verse)
    }

    private fun jsonInt(el: kotlinx.serialization.json.JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }

    private fun imul(a: Int, b: Int): Int = a * b
}

internal class VerseDraw(
    verses: List<Verse>,
    private val rng: () -> Double,
) {
    private val all = verses
    private val byTier = verses.groupBy { it.t }
    private val usedIds = mutableSetOf<String>()
    private val usedRefs = mutableSetOf<String>()

    fun drawTier(tier: Int): Verse {
        val source = byTier[tier].orEmpty().ifEmpty { all }
        return pick(source)
    }

    fun drawAny(): Verse = pick(all)

    private fun refKey(v: Verse): String = v.r.lowercase(Locale.ROOT)

    private fun poolSansRepeatRefs(pool: List<Verse>): List<Verse> {
        val seen = mutableSetOf<String>()
        val out = mutableListOf<Verse>()
        for (v in pool) {
            val k = refKey(v)
            if (k in usedRefs || k in seen) continue
            seen.add(k)
            out.add(v)
        }
        return if (out.isNotEmpty()) out else pool
    }

    private fun pick(source: List<Verse>): Verse {
        var pool = poolSansRepeatRefs(source.filter { it.id !in usedIds })
        if (pool.isEmpty()) {
            usedIds.clear()
            pool = poolSansRepeatRefs(source).ifEmpty { source }
        }
        val v = pool[floor(rng() * pool.size).toInt().coerceIn(0, pool.lastIndex)]
        usedIds.add(v.id)
        usedRefs.add(refKey(v))
        return v
    }
}
