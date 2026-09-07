package app.completetheverse.core.play

import app.completetheverse.core.save.Save
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class GhostsTest {
    private val samples = listOf(GhostSample(0, 0.0), GhostSample(4_000, 0.5), GhostSample(8_000, 1.0))

    @Test
    fun keepBestReplacesWhenScoreIsHigherOrEqual() {
        val old = GhostRecord(10, samples, 1_000, "old")
        val fresh = GhostRecord(12, samples, 800, "new")
        assertEquals("new", Ghosts.keepBest(old, fresh, 12).name)
        assertEquals("new", Ghosts.keepBest(old, fresh, 10).name)
        assertEquals("old", Ghosts.keepBest(old, GhostRecord(9, samples, 900, "worse"), 9).name)
        assertEquals("new", Ghosts.keepBest(null, fresh, 12).name)
    }

    @Test
    fun endRunWritesBestTrialAndIgnoresWorse() {
        val first = Ghosts.endRun(
            save = Save.DEFAULT,
            mode = "trial",
            siteId = null,
            total = 400,
            correct = 8,
            survivedMs = 12_000,
            samples = samples,
            playerName = "Ada",
        )
        val stored = Ghosts.recordOf(first, "trial", null)
        assertEquals(400, stored?.score)
        assertEquals("Ada", stored?.name)
        assertEquals(3, stored?.samples?.size)

        val worse = Ghosts.endRun(
            save = first,
            mode = "trial",
            siteId = null,
            total = 100,
            correct = 2,
            survivedMs = 9_000,
            samples = listOf(GhostSample(0, 0.0)),
            playerName = "Worse",
        )
        assertEquals(400, Ghosts.recordOf(worse, "trial", null)?.score)
        assertEquals("Ada", Ghosts.recordOf(worse, "trial", null)?.name)
    }

    @Test
    fun pilgrimageWritesSiteAndRoadSlots() {
        val save = Ghosts.endRun(
            save = Save.DEFAULT,
            mode = "pilgrimage",
            siteId = "ur",
            total = 220,
            correct = 7,
            survivedMs = 30_000,
            samples = samples,
            playerName = "Pilgrim",
        )
        val road = Ghosts.recordOf(save, "pilgrimage", null)
        val site = Ghosts.recordOf(save, "pilgrimage", "ur")
        assertEquals(220, road?.score)
        assertEquals(220, site?.score)
        val bySite = save["ghosts"]!!.jsonObject["pilgrimageBySite"]!!.jsonObject
        assertTrue("ur" in bySite.keys)
    }

    @Test
    fun blitzUsesCorrectCountAsScore() {
        val save = Ghosts.endRun(
            save = Save.DEFAULT,
            mode = "blitz",
            siteId = null,
            total = 9_999,
            correct = 14,
            survivedMs = 60_000,
            samples = samples,
        )
        assertEquals(14, Ghosts.recordOf(save, "blitz", null)?.score)
    }

    @Test
    fun teamModeDoesNotWrite() {
        val save = Ghosts.endRun(
            save = Save.DEFAULT,
            mode = "team",
            siteId = null,
            total = 50,
            correct = 5,
            survivedMs = 1_000,
            samples = samples,
        )
        val ghosts = save["ghosts"]!!.jsonObject
        assertTrue(ghosts["trial"] == null || ghosts["trial"].toString() == "null")
    }

    @Test
    fun mergeKeepsBestGhostsFromBothSides() {
        val local = Ghosts.endRun(
            Save.DEFAULT,
            "trial",
            null,
            300,
            6,
            10_000,
            samples,
            "Local",
        )
        val remote = Ghosts.endRun(
            Save.DEFAULT,
            "blitz",
            null,
            0,
            18,
            40_000,
            samples,
            "Remote",
        )
        val pilgrimRemote = Ghosts.endRun(
            remote,
            "pilgrimage",
            "haran",
            90,
            5,
            8_000,
            samples,
            "Remote",
        )
        val merged = Ghosts.merge(
            local["ghosts"] as JsonObject,
            pilgrimRemote["ghosts"] as JsonObject,
        )
        assertEquals(300, Ghosts.fromJson(merged["trial"])?.score)
        assertEquals(18, Ghosts.fromJson(merged["blitz"])?.score)
        val sites = merged["pilgrimageBySite"]!!.jsonObject
        assertEquals(90, Ghosts.fromJson(sites["haran"])?.score)
    }

    @Test
    fun playSessionWritesGhostOnFinish() {
        val v = app.completetheverse.core.bank.Verse(
            id = "g1",
            p = "In the beginning God created the",
            a = "heaven and the earth",
            s = ".",
            d = listOf("heavens and the earth", "earth and the heaven", "the world"),
            r = "Genesis 1:1",
            b = "Genesis",
        )
        val clock = object {
            var t = 1_000L
        }
        val session = PlaySession.start(
            PlayConfig(
                questions = listOf(PlayQuestion(Mechanic.Mcq, v)),
                clockPolicy = ClockPolicy.Wall,
                lives = 3,
                save = Save.DEFAULT,
                mode = "trial",
                verses = listOf(v),
                siteVerses = listOf(v),
                rng = { 0.1 },
                nowMs = { clock.t },
            ),
        )
        session.submitChoice(session.choices.first { it == v.a })
        clock.t += 2_000
        session.advance()
        val ghosts = session.save["ghosts"]!!.jsonObject
        val trial = ghosts["trial"]!!.jsonObject
        assertTrue((trial["score"] as JsonPrimitive).doubleOrNull!! > 0)
        assertTrue(session.ghostSamples.size >= 2)
    }

    @Test
    fun cloudKeysMatchWeb() {
        assertEquals("campaign", Ghosts.cloudRunKey("trial", null))
        assertEquals("site:ur", Ghosts.cloudRunKey("pilgrimage", "ur"))
        assertEquals("blitz", Ghosts.cloudRunKey("blitz", null))
        assertEquals("trial", Ghosts.cloudMode("trial"))
        assertEquals("pilgrimage", Ghosts.cloudMode("pilgrimage"))
    }

    @Test
    fun keepBestGhostAndApplyEndRunMatchWebNames() {
        val old = GhostRecord(10, samples, 1_000, "old")
        val fresh = GhostRecord(12, samples, 800, "new")
        assertEquals("new", Ghosts.keepBestGhost(old, fresh).name)
        assertEquals("old", Ghosts.keepBestGhost(old, GhostRecord(9, samples, 900, "worse")).name)
        val result = PlayResult(
            correct = 8,
            attempts = 8,
            score = 400,
            total = 400,
            elapsedMs = 12_000,
            bestStreak = 8,
            reason = "complete",
            save = Save.DEFAULT,
        )
        val save = Ghosts.applyEndRunGhosts(Save.DEFAULT, "trial", result, samples = samples, playerName = "Ada")
        assertEquals(400, Ghosts.recordOf(save, "trial", null)?.score)
        assertEquals("Ada", Ghosts.recordOf(save, "trial", null)?.name)
    }

    @Test
    fun overlaySuccessorKeepsGhosts() {
        val withGhost = Ghosts.endRun(
            Save.DEFAULT,
            "trial",
            null,
            50,
            3,
            1_000,
            samples,
            "Keep",
        )
        val overlaid = Save.overlaySuccessorLocal(Save.DEFAULT, withGhost)
        assertEquals("Keep", Ghosts.recordOf(overlaid, "trial", null)?.name)
    }
}
