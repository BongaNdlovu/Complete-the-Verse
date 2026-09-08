package app.completetheverse.core.records

import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.doubleOrNull

data class RecordStats(
    val trialBest: Int,
    val endlessBest: Int,
    val dailyBest: Int,
    val practiceBest: Int,
    val pilgrimageBest: Int,
    val blitzBest: Int,
    val tabletsBest: Int,
    val correct: Int,
    val attempts: Int,
    val accuracy: Int,
    val bestStreak: Int,
    val runs: Int,
    val xp: Int,
    val sitesCleared: Int,
    val tabletHolds: Int,
    val dailyDone: Int,
    val localBlitzBest: Int,
)

data class LocalRun(
    val score: Int,
    val mode: String,
    val diff: String,
    val acc: Int,
    val date: String,
)

data class BookRow(
    val book: String,
    val correct: Int,
    val attempts: Int,
    val pct: Int,
)

data class BlitzBoardRow(
    val rank: Int,
    val id: String,
    val name: String,
    val score: Int,
    val survivedMs: Long? = null,
    val mine: Boolean = false,
)

object Records {
    fun stats(save: SaveBlob): RecordStats {
        val best = obj(save["best"])
        val life = obj(save["life"])
        val correct = jsonInt(life["correct"])
        val attempts = jsonInt(life["attempts"])
        val accuracy = if (attempts == 0) 0 else kotlin.math.round(correct * 100.0 / attempts).toInt()
        return RecordStats(
            trialBest = jsonInt(best["trial"]),
            endlessBest = jsonInt(best["endless"]),
            dailyBest = jsonInt(best["daily"]),
            practiceBest = jsonInt(best["practice"]),
            pilgrimageBest = jsonInt(best["pilgrimage"]),
            blitzBest = jsonInt(best["blitz"]),
            tabletsBest = jsonInt(best["tablets"]),
            correct = correct,
            attempts = attempts,
            accuracy = accuracy,
            bestStreak = jsonInt(life["bestStreak"]),
            runs = jsonInt(save["runs"]),
            xp = jsonInt(save["xp"]),
            sitesCleared = jsonInt(life["sitesCleared"]),
            tabletHolds = jsonInt(life["tabletHolds"]),
            dailyDone = jsonInt(life["dailyDone"]),
            localBlitzBest = jsonInt(life["blitzBest"]).coerceAtLeast(jsonInt(best["blitz"])),
        )
    }

    fun localBoard(save: SaveBlob): List<LocalRun> {
        val arr = save["board"] as? JsonArray ?: return emptyList()
        return arr.mapNotNull { el ->
            val o = el as? JsonObject ?: return@mapNotNull null
            LocalRun(
                score = jsonInt(o["score"]),
                mode = (o["mode"] as? JsonPrimitive)?.content.orEmpty(),
                diff = (o["diff"] as? JsonPrimitive)?.content.orEmpty(),
                acc = jsonInt(o["acc"]),
                date = (o["date"] as? JsonPrimitive)?.content.orEmpty(),
            )
        }
    }

    fun byBook(save: SaveBlob): List<BookRow> {
        val books = obj(save["books"])
        return books.map { (b, el) ->
            val o = el as? JsonObject ?: JsonObject(emptyMap())
            val c = jsonInt(o["c"])
            val a = jsonInt(o["a"])
            BookRow(b, c, a, if (a == 0) 0 else kotlin.math.round(c * 100.0 / a).toInt())
        }.filter { it.attempts > 0 }.sortedBy { it.pct }
    }

    private fun obj(el: kotlinx.serialization.json.JsonElement?): JsonObject =
        el as? JsonObject ?: JsonObject(emptyMap())

    private fun jsonInt(el: kotlinx.serialization.json.JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }
}
