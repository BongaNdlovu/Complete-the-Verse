package app.completetheverse.core.srs

import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.put
import java.time.Instant
import java.time.ZoneId
import kotlin.math.floor

data class SrsCard(
    val ef: Double = Srs.START_EF,
    val reps: Int = 0,
    val ivl: Int = 0,
    val due: Int = 0,
    val lapses: Int = 0,
    val last: Int = 0,
    val lastQuality: Int? = null,
    val lastMode: String? = null,
    val lastFraction: Double? = null,
    val lastCueLevel: Int? = null,
    val lastNear: Boolean? = null,
)

data class GradeInput(
    val timedOut: Boolean = false,
    val correct: Boolean = false,
    val near: Boolean = false,
    val usedPower: Boolean = false,
    val fraction: Double? = null,
    val cueLevel: Int = 0,
    val mode: String? = null,
)

data class QueueRank(
    val band: Int,
    val sort: Int,
)

object Srs {
    const val MIN_EF = 1.3
    const val START_EF = 2.5
    const val MAX_INTERVAL = 365

    fun dayNumber(
        date: Instant = Instant.now(),
        zone: ZoneId = ZoneId.systemDefault(),
    ): Int {
        // Local Y/M/D reprojected through UTC so DST cannot drop or repeat a day.
        val local = date.atZone(zone).toLocalDate()
        return local.toEpochDay().toInt()
    }

    fun freshCard(): SrsCard = SrsCard()

    fun gradeAnswer(o: GradeInput?): Int {
        val input = o ?: GradeInput()
        if (input.timedOut) return 0
        if (!input.correct) return if (input.near) 2 else 1
        if (input.usedPower) return 3
        val f = input.fraction ?: 0.5
        if (input.near) return 3
        if (f <= 0.4) return 5
        if (f <= 0.8) return 4
        return 3
    }

    fun schedule(card: SrsCard?, quality: Number, today: Int): SrsCard {
        val c = if (card != null) {
            card.copy(
                lastQuality = null,
                lastMode = null,
                lastFraction = null,
                lastCueLevel = null,
                lastNear = null,
            )
        } else {
            freshCard()
        }
        val ef = if (c.ef.isFinite()) c.ef else START_EF
        val q = jsRound(quality.toDouble()).coerceIn(0, 5)
        var reps = c.reps
        var ivl = c.ivl
        var lapses = c.lapses
        if (q >= 3) {
            ivl = when (reps) {
                0 -> 1
                1 -> 6
                else -> jsRound(ivl * ef)
            }
            reps += 1
        } else {
            reps = 0
            ivl = 1
            lapses += 1
        }
        var nextEf = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        if (nextEf < MIN_EF) nextEf = MIN_EF
        if (ivl > MAX_INTERVAL) ivl = MAX_INTERVAL
        return SrsCard(
            ef = nextEf,
            reps = reps,
            ivl = ivl,
            due = today + ivl,
            lapses = lapses,
            last = today,
        )
    }

    fun isDue(card: SrsCard?, today: Int): Boolean =
        if (card == null || card.reps == 0) true else card.due <= today

    fun overdueBy(card: SrsCard?, today: Int): Int {
        if (card == null || card.reps == 0) return 0
        return today - card.due
    }

    fun queueRank(card: SrsCard?, today: Int): QueueRank {
        if (card == null || card.reps == 0) {
            if (card != null && card.lapses != 0) {
                return QueueRank(band = 0, sort = -(today - card.due))
            }
            return QueueRank(band = 1, sort = 0)
        }
        if (card.due <= today) return QueueRank(band = 0, sort = -(today - card.due))
        return QueueRank(band = 2, sort = card.due - today)
    }

    fun <T> buildQueue(
        verses: List<T>,
        cardFor: (T) -> SrsCard?,
        today: Int,
        limit: Int? = null,
        shuffle: ((List<T>) -> List<T>)? = null,
    ): List<T> {
        val mixed = (shuffle ?: { it })(verses.toList())
        val ranked = mixed.mapIndexed { i, v ->
            val r = queueRank(cardFor(v), today)
            Ranked(v, r.band, r.sort, i)
        }
        val sorted = ranked.sortedWith(compareBy<Ranked<T>> { it.band }.thenBy { it.sort }.thenBy { it.i })
        val out = sorted.map { it.v }
        return if (limit != null) out.take(limit) else out
    }

    fun <T> dueCount(verses: List<T>, cardFor: (T) -> SrsCard?, today: Int): Int {
        var n = 0
        for (v in verses) {
            val c = cardFor(v)
            if (c != null && (c.reps != 0 || c.lapses != 0) && c.due <= today) n++
        }
        return n
    }

    fun strength(card: SrsCard?): String {
        if (card == null || (card.reps == 0 && card.lapses == 0)) return "unseen"
        if (card.reps == 0) return "lapsed"
        if (card.reps >= 3 && card.ivl >= 21) return "held"
        return "learning"
    }

    fun cardFromJson(el: JsonElement?): SrsCard? {
        val o = el as? JsonObject ?: return null
        return SrsCard(
            ef = jsonNumber(o["ef"], START_EF),
            reps = jsonNumber(o["reps"], 0.0).toInt(),
            ivl = jsonNumber(o["ivl"], 0.0).toInt(),
            due = jsonNumber(o["due"], 0.0).toInt(),
            lapses = jsonNumber(o["lapses"], 0.0).toInt(),
            last = jsonNumber(o["last"], 0.0).toInt(),
            lastQuality = o["lastQuality"]?.let { jsonNumber(it, 0.0).toInt() },
            lastMode = (o["lastMode"] as? JsonPrimitive)?.contentOrNull,
            lastFraction = o["lastFraction"]?.let { jsonNumber(it, Double.NaN) }?.takeIf { it.isFinite() },
            lastCueLevel = o["lastCueLevel"]?.let { jsonNumber(it, 0.0).toInt() },
            lastNear = o["lastNear"]?.let { jsonBool(it) },
        )
    }

    fun cardToJson(card: SrsCard): JsonObject = buildJsonObject {
        put("ef", card.ef)
        put("reps", card.reps)
        put("ivl", card.ivl)
        put("due", card.due)
        put("lapses", card.lapses)
        put("last", card.last)
        card.lastQuality?.let { put("lastQuality", it) }
        card.lastMode?.let { put("lastMode", it) }
        card.lastFraction?.let { put("lastFraction", it) }
        card.lastCueLevel?.let { put("lastCueLevel", it) }
        card.lastNear?.let { put("lastNear", it) }
    }

    fun cardsFromSave(srs: JsonElement?): Map<String, SrsCard> {
        val o = srs as? JsonObject ?: return emptyMap()
        val out = linkedMapOf<String, SrsCard>()
        for ((k, v) in o) {
            val card = cardFromJson(v) ?: continue
            out[k] = card
        }
        return out
    }

    fun putCard(save: JsonObject, verseId: String, card: SrsCard): JsonObject {
        val srs = ((save["srs"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        srs[verseId] = cardToJson(card)
        val out = save.toMutableMap()
        out["srs"] = JsonObject(srs)
        return JsonObject(out)
    }

    private data class Ranked<T>(val v: T, val band: Int, val sort: Int, val i: Int)

    private fun jsonNumber(el: JsonElement?, fallback: Double): Double {
        if (el == null || el is JsonNull) return fallback
        val p = el as? JsonPrimitive ?: return fallback
        p.doubleOrNull?.let { return if (it.isNaN()) fallback else it }
        return p.content.toDoubleOrNull() ?: fallback
    }

    private fun jsonBool(el: JsonElement): Boolean {
        val p = el as? JsonPrimitive ?: return false
        return when (p.content) {
            "true" -> true
            "false" -> false
            else -> jsonNumber(p, 0.0) != 0.0
        }
    }
}

/** JS Math.round: half toward +Infinity for positives. */
internal fun jsRound(x: Double): Int {
    if (!x.isFinite()) return 0
    return floor(x + 0.5).toInt()
}
