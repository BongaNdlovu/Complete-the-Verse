package app.completetheverse.core.records

import app.completetheverse.core.save.SaveBlob
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

    private fun obj(el: kotlinx.serialization.json.JsonElement?): JsonObject =
        el as? JsonObject ?: JsonObject(emptyMap())

    private fun jsonInt(el: kotlinx.serialization.json.JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }
}
