package app.completetheverse.core.records

import app.completetheverse.core.save.Save
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals

class RecordsTest {
    @Test
    fun statsReadBestAndLife() {
        val fresh = Records.stats(Save.DEFAULT)
        assertEquals(0, fresh.trialBest)
        assertEquals(0, fresh.attempts)
        assertEquals(0, fresh.accuracy)

        val save = Save.DEFAULT.toMutableMap()
        save["xp"] = JsonPrimitive(1200)
        save["runs"] = JsonPrimitive(4)
        save["best"] = JsonObject(
            mapOf(
                "trial" to JsonPrimitive(900),
                "endless" to JsonPrimitive(40),
                "daily" to JsonPrimitive(18),
                "practice" to JsonPrimitive(12),
                "pilgrimage" to JsonPrimitive(700),
                "blitz" to JsonPrimitive(22),
                "tablets" to JsonPrimitive(8),
            ),
        )
        save["life"] = JsonObject(
            mapOf(
                "correct" to JsonPrimitive(8),
                "attempts" to JsonPrimitive(10),
                "bestStreak" to JsonPrimitive(5),
                "sitesCleared" to JsonPrimitive(3),
                "tabletHolds" to JsonPrimitive(1),
                "dailyDone" to JsonPrimitive(2),
                "blitzBest" to JsonPrimitive(19),
            ),
        )
        val stats = Records.stats(JsonObject(save))
        assertEquals(900, stats.trialBest)
        assertEquals(40, stats.endlessBest)
        assertEquals(18, stats.dailyBest)
        assertEquals(12, stats.practiceBest)
        assertEquals(700, stats.pilgrimageBest)
        assertEquals(22, stats.blitzBest)
        assertEquals(8, stats.tabletsBest)
        assertEquals(8, stats.correct)
        assertEquals(10, stats.attempts)
        assertEquals(80, stats.accuracy)
        assertEquals(5, stats.bestStreak)
        assertEquals(4, stats.runs)
        assertEquals(1200, stats.xp)
        assertEquals(3, stats.sitesCleared)
        assertEquals(1, stats.tabletHolds)
        assertEquals(2, stats.dailyDone)
        assertEquals(22, stats.localBlitzBest)
    }
}
