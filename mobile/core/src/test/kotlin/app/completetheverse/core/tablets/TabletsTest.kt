package app.completetheverse.core.tablets

import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class TabletsTest {
    private val bank: TabletsBank by lazy {
        val raw = javaClass.getResourceAsStream("/content/tablets.json")!!.bufferedReader().use { it.readText() }
        Tablets.parse(raw)
    }

    private fun rng(): () -> Double {
        var i = 0L
        return {
            i = (i * 9301 + 49297) % 233280
            i / 233280.0
        }
    }

    private fun start(
        id: String,
        save: SaveBlob = Save.DEFAULT,
        tutorial: Boolean? = null,
        untimed: Boolean = false,
    ): TabletsSession = TabletsSession.start(
        TabletsConfig(
            bank = bank,
            chapterId = id,
            save = save,
            tutorial = tutorial,
            untimed = untimed,
            rng = rng(),
        ),
    )

    private fun holdAll(session: TabletsSession) {
        var i = 0
        while (!session.ended && i < 600) {
            val blank = session.currentBlank ?: break
            session.pick(blank.a)
            session.finishResolve()
            i++
        }
    }

    private fun saveHeld(vararg ids: String): SaveBlob {
        val tablets = (Save.DEFAULT["tablets"] as JsonObject).toMutableMap()
        for (id in ids) {
            tablets[id] = buildJsonObject {
                put("best", 100)
                put("held", true)
            }
        }
        val out = Save.DEFAULT.toMutableMap()
        out["tablets"] = JsonObject(tablets)
        return JsonObject(out)
    }

    @Test
    fun blankClockAndPaceMatchJs() {
        val p23 = Tablets.chapter(bank, "psalm23")
        val p91 = Tablets.chapter(bank, "psalm91")
        assertEquals(11, p23.blanks.size)
        assertEquals(17, p91.blanks.size)
        assertEquals(25, Tablets.BLANK_S)
        assertEquals(25, Tablets.clockS(bank))
        assertEquals(25, Tablets.clockS(bank, 3))
        assertEquals(1, Tablets.paceOf(p23))
        assertEquals(1, Tablets.paceOf(p91))
        assertEquals(1, Tablets.paceOf(Tablets.chapter(bank, "john1")))
        assertEquals(3, Tablets.HOLDS_TO_OPEN)
        assertEquals(3, bank.holdsToOpen)
        assertTrue(Tablets.paceGateOpen(1, Save.DEFAULT, bank))
        assertFalse(Tablets.paceGateOpen(2, Save.DEFAULT, bank))
        assertFalse(Tablets.paceGateOpen(3, Save.DEFAULT, bank))
    }

    @Test
    fun psalm23And91AnswersAreKjv() {
        val p23 = Tablets.chapter(bank, "psalm23")
        val p91 = Tablets.chapter(bank, "psalm91")
        val want23 = listOf(
            "want", "pastures", "waters", "soul", "righteousness", "evil",
            "staff", "enemies", "oil", "mercy", "ever",
        )
        val want91 = listOf(
            "Almighty", "fortress", "fowler", "feathers", "buckler", "night", "noonday",
            "right", "wicked", "habitation", "dwelling", "angels", "stone", "trample",
            "deliver", "trouble", "salvation",
        )
        assertEquals(want23, p23.blanks.map { it.a })
        assertEquals(want91, p91.blanks.map { it.a })
        (p23.blanks + p91.blanks).forEach { blank ->
            val opts = Tablets.options(blank, rng())
            assertEquals(4, opts.size)
            assertTrue(blank.a in opts)
            assertTrue(blank.d.size >= 3)
        }
    }

    @Test
    fun unlockOrderPrayerThen23Then91ThenJohn1ThenHall() {
        assertTrue(Tablets.unlocked("prayer", Save.DEFAULT, bank))
        assertTrue(Tablets.unlocked("psalm23", Save.DEFAULT, bank))
        assertFalse(Tablets.unlocked("psalm91", Save.DEFAULT, bank))
        assertFalse(Tablets.unlocked("psalm91", saveHeld(), bank))
        val after23 = saveHeld("psalm23")
        assertTrue(Tablets.unlocked("psalm91", after23, bank))
        assertNull(Tablets.nextPlayable("psalm23", Save.DEFAULT, bank))
        assertEquals("psalm91", Tablets.nextPlayable("psalm23", after23, bank)?.id)
        val after23only91locked = saveHeld("psalm23")
        assertFalse(Tablets.unlocked("john1", after23only91locked, bank))
        val after91 = saveHeld("psalm23", "psalm91")
        assertTrue(Tablets.unlocked("john1", after91, bank))
        assertFalse(Tablets.unlocked("genesis3", Save.DEFAULT, bank))
        val afterJohn = saveHeld("psalm23", "psalm91", "john1")
        assertTrue(Tablets.unlocked("genesis3", afterJohn, bank))
        assertTrue(Tablets.paceGateOpen(2, afterJohn, bank))
        assertTrue(Tablets.unlocked("exodus12", afterJohn, bank))
    }

    @Test
    fun bankCountsCanonHallMoreAndPaces() {
        assertEquals("exodus20", Tablets.chapter(bank, "exodus20").id)
        assertEquals("john14", Tablets.chapter(bank, "john14").id)
        assertEquals(20, bank.canon.size)
        assertEquals(20, bank.hall.size)
        assertEquals(100, bank.more.size)
        assertEquals(144, bank.chapters.size)
        val playable = bank.chapters.filter { !it.tutorial }
        assertEquals(47, playable.count { Tablets.paceOf(it) == 1 })
        assertEquals(48, playable.count { Tablets.paceOf(it) == 2 })
        assertEquals(48, playable.count { Tablets.paceOf(it) == 3 })
        assertTrue(bank.hall.all { it.after.isEmpty() && it.hall })
        val prayer = Tablets.chapter(bank, "prayer")
        assertEquals(8, prayer.blanks.size)
        assertTrue(prayer.tutorial)
        assertEquals(51, Tablets.chapter(bank, "john1").blanks.size)
        assertEquals("Word", Tablets.chapter(bank, "john1").blanks[0].a)
    }

    @Test
    fun everyChapterHasFourUniqueStones() {
        for (ch in bank.chapters) {
            assertTrue(ch.blanks.size >= 8, ch.id)
            for (blank in ch.blanks) {
                val opts = Tablets.options(blank, rng())
                assertEquals(4, opts.size, "${ch.id} ${blank.r}")
                assertTrue(blank.a in opts)
                assertTrue(blank.d.size >= 3)
                val uniq = (listOf(blank.a) + blank.d.take(3)).map { it.lowercase() }.toSet()
                assertEquals(4, uniq.size, "${ch.id} ${blank.r}")
            }
        }
    }

    @Test
    fun heldFlagRequiresCleanFullRun() {
        assertTrue(Tablets.held(0, 11, 11))
        assertFalse(Tablets.held(1, 11, 11))
        assertFalse(Tablets.held(0, 4, 11))
        assertFalse(Tablets.held(0, 0, 0))
    }

    @Test
    fun cleanPsalm23HoldPersistsAndOpensPsalm91() {
        val session = start("psalm23")
        assertEquals("psalm23", session.chapter.id)
        assertEquals(1, session.tabletLevel)
        assertEquals(6, session.tabletTotal)
        assertEquals(2, session.currentStep.size)
        assertEquals(1, session.illum)
        assertEquals(2, session.winnow)
        assertEquals(2, session.tabletLives)
        holdAll(session)
        assertTrue(session.ended)
        assertTrue(Tablets.held(session.tabletMiss, session.tabletIdx, session.tabletTotal))
        val rec = Tablets.recordOf(session.save, "psalm23")
        assertTrue(rec.held)
        assertEquals(100, rec.best)
        assertEquals(100, Tablets.jsonInt((session.save["best"] as JsonObject)["tablets"]))
        assertEquals(1, Tablets.jsonInt((session.save["life"] as JsonObject)["tabletHolds"]))
        assertTrue(Tablets.jsonInt(session.save["xp"]) > 0)
        assertTrue(Tablets.unlocked("psalm91", session.save, bank))
        assertEquals("psalm91", session.result?.next?.id)
        assertEquals("Pace I held. Psalm 91 is open.", session.result?.kick)
        assertFalse(session.result!!.shattered)
    }

    @Test
    fun oneMissIsNotHeldAndSecondMissShatters() {
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
        assertFalse(Tablets.held(session.tabletMiss, session.tabletIdx, session.tabletTotal))
        assertFalse(Tablets.recordOf(session.save, "psalm23").held)
        assertEquals("The tablet shattered", session.result?.kick)
        assertTrue(session.result!!.shattered)
        assertNull(session.result?.next)
    }

    @Test
    fun pauseStopsTheSandUntilResume() {
        val session = start("psalm23")
        session.pause()
        session.tick(25.1)
        assertFalse(session.ended)
        assertEquals(25.0, session.tabletClock, 0.001)
        session.resume()
        session.tick(25.1)
        assertTrue(session.ended)
        assertTrue(session.tabletTimeout)
    }

    @Test
    fun timeoutShattersTheHold() {
        val session = start("psalm23")
        assertEquals(25.0, session.tabletClock, 0.001)
        session.pick("want")
        session.finishResolve()
        assertEquals(25.0, session.tabletClock, 0.001)
        session.tick(25.1)
        assertTrue(session.ended)
        assertTrue(session.tabletTimeout)
        assertFalse(Tablets.recordOf(session.save, "psalm23").held)
        assertEquals("The tablet shattered", session.result?.kick)
    }

    @Test
    fun clockKeepsRacingAfterAHit() {
        val session = start("psalm23")
        session.pick("want")
        assertTrue(session.resolving)
        session.tick(1.0)
        assertEquals(24.0, session.tabletClock, 0.001)
        session.finishResolve()
        assertEquals(25.0, session.tabletClock, 0.001)
        assertEquals(1, session.gapIdx)
        assertEquals(0, session.tabletIdx)
    }

    @Test
    fun prayerTutorialIsUntimedAndAMissDoesNotShatter() {
        val session = start("prayer")
        assertTrue(session.tutorial)
        assertTrue(session.untimed)
        assertEquals(1, Tablets.gapCount(true, 1))
        assertEquals(8, session.tabletTotal)
        session.pick("Master")
        session.finishResolve()
        assertFalse(session.ended)
        assertEquals(0, session.tabletMiss)
        assertEquals(0, session.tabletIdx)
        holdAll(session)
        assertEquals(TabletsPhase.TutorialDone, session.phase)
        assertTrue(Tablets.tutorialDone(session.save))
        assertEquals(0, Tablets.jsonInt(session.save["xp"]))
        assertFalse(Tablets.recordOf(session.save, "prayer").held)
    }

    @Test
    fun psalm91AndJohn1HoldOpenTheHall() {
        val after23 = saveHeld("psalm23")
        val p91 = start("psalm91", after23)
        assertEquals(9, p91.tabletTotal)
        holdAll(p91)
        assertTrue(Tablets.recordOf(p91.save, "psalm91").held)

        val after91 = saveHeld("psalm23", "psalm91")
        val john = start("john1", after91)
        assertEquals(26, john.tabletTotal)
        holdAll(john)
        assertTrue(Tablets.recordOf(john.save, "john1").held)
        assertTrue(Tablets.unlocked("genesis3", john.save, bank))
        assertTrue(Tablets.paceGateOpen(2, john.save, bank))
        assertTrue(Tablets.unlocked("exodus12", john.save, bank))
    }

    @Test
    fun paceChunksMatchJs() {
        val p23 = start("psalm23")
        assertEquals(2, Tablets.gapCount(false, 1))
        assertEquals(6, p23.tabletTotal)
        assertEquals(2, p23.steps[0].size)
        assertEquals(1, p23.steps.last().size)
        val g1 = start("genesis1")
        assertEquals(3, Tablets.gapCount(false, 2))
        assertEquals(4, g1.tabletTotal)
        val g22 = start("genesis22")
        assertEquals(4, Tablets.gapCount(false, 3))
        assertEquals(3, g22.tabletTotal)
    }

    @Test
    fun illuminateAndWinnowArePerGapAndDoNotBreakAHold() {
        val session = start("psalm23")
        assertTrue(session.winnow())
        assertEquals("0:0", session.gapKey())
        assertEquals(1, session.winnow)
        assertFalse(session.winnow())
        assertEquals(1, session.winnow)
        assertTrue(session.illuminate())
        assertEquals(0, session.illum)
        assertFalse(session.illuminate())
        holdAll(session)
        assertTrue(Tablets.held(session.tabletMiss, session.tabletIdx, session.tabletTotal))
    }

    @Test
    fun libraryOpensWithPrayerAndThreePaces() {
        val groups = Tablets.library(bank, Save.DEFAULT)
        assertEquals(4, groups.size)
        assertEquals("The prayer", groups[0].title)
        assertEquals("prayer", groups[0].rows[0].chapter.id)
        assertFalse(groups[0].rows[0].locked)
        assertEquals("Pace I", groups[1].title)
        assertTrue(groups[1].rows.any { it.chapter.id == "psalm23" && !it.locked })
        assertTrue(groups[1].rows.any { it.chapter.id == "psalm91" && it.locked })
        assertTrue(groups[2].title.contains("Pace II"))
        assertTrue(groups[3].title.contains("Pace III"))
    }

    @Test
    fun persistRecordShapeIsBestAndHeld() {
        val session = start("psalm23")
        holdAll(session)
        val rec = session.save["tablets"] as JsonObject
        val row = rec["psalm23"] as JsonObject
        assertTrue(row.containsKey("best"))
        assertTrue(row.containsKey("held"))
        assertEquals("true", (row["held"] as JsonPrimitive).content)
        assertEquals(100, Tablets.jsonInt(row["best"]))
    }
}
