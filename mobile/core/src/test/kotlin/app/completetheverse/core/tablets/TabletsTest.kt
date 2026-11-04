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
        assertEquals(6.5, Tablets.clockS(bank), 0.001)
        assertEquals(6.5, Tablets.clockS(bank, 3), 0.001)
        assertEquals(11.5, Tablets.speed("meditative").base, 0.001)
        assertEquals(2.3, Tablets.speed("seraphim").base, 0.001)
        assertEquals(6.5, Tablets.speed("nope").base, 0.001)
        assertEquals(0.75, Tablets.speed("meditative").mult, 0.001)
        assertEquals(2.5, Tablets.speed("seraphim").mult, 0.001)
        assertEquals(6.5, TabletsRules.blankSeconds(6.5, 0, 0), 0.001)
        assertEquals(6.3375, TabletsRules.blankSeconds(6.5, 1, 1), 0.001)
        assertEquals(1.55, TabletsRules.blankSeconds(2.0, 100, 100), 0.001)
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
            assertEquals(6, opts.size)
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
    fun everyChapterHasSixUniqueStones() {
        for (ch in bank.chapters) {
            assertTrue(ch.blanks.size >= 8, ch.id)
            for (blank in ch.blanks) {
                val opts = Tablets.options(blank, rng())
                assertEquals(6, opts.size, "${ch.id} ${blank.r}")
                assertTrue(blank.a in opts)
                assertTrue(blank.d.size >= 3)
                val uniq = (listOf(blank.a) + blank.d.take(5)).map { it.lowercase() }.toSet()
                assertEquals(6, uniq.size, "${ch.id} ${blank.r}")
            }
        }
    }

    @Test
    fun heldFlagFollowsTheLamps() {
        assertTrue(Tablets.held(0, 2, 11, 11))
        assertTrue(Tablets.held(1, 2, 11, 11))
        assertFalse(Tablets.held(2, 2, 11, 11))
        assertFalse(Tablets.held(0, 2, 4, 11))
        assertFalse(Tablets.held(0, 2, 0, 0))
    }

    @Test
    fun cleanPsalm23HoldPersistsAndOpensPsalm91() {
        val session = start("psalm23")
        assertEquals("psalm23", session.chapter.id)
        assertEquals(1, session.tabletLevel)
        assertEquals(11, session.tabletTotal)
        assertEquals(1, session.currentStep.size)
        assertEquals(1, session.illum)
        assertEquals(2, session.winnow)
        assertEquals(3, session.tabletLives)
        holdAll(session)
        assertTrue(session.ended)
        assertTrue(Tablets.held(session.tabletMiss, session.tabletLives, session.tabletIdx, session.tabletTotal))
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
    fun firstTwoMissesContinueAndThirdMissShatters() {
        val session = start("psalm23")
        assertEquals(3, session.lampsLeft)
        session.pick("fear")
        session.finishResolve()
        assertFalse(session.ended)
        assertEquals(1, session.tabletMiss)
        assertEquals(0, session.tabletIdx)
        assertEquals(5.72, session.tabletClock, 0.001)
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

    @Test
    fun pauseStopsTheSandUntilResume() {
        val session = start("psalm23")
        session.pause()
        session.tick(25.1)
        assertFalse(session.ended)
        assertEquals(6.5, session.tabletClock, 0.001)
        session.resume()
        session.tick(6.6)
        assertFalse(session.ended)
        assertEquals(1, session.tabletMiss)
        assertEquals(0.55, 1.0 - session.tabletClock / session.tabletClockMax, 0.001)
    }

    @Test
    fun timeoutSpendsALampAndPushesBack() {
        val session = start("psalm23")
        assertEquals(6.5, session.tabletClock, 0.001)
        session.tick(6.6)
        assertFalse(session.ended)
        assertFalse(session.tabletTimeout)
        assertEquals(1, session.tabletMiss)
        assertEquals(3, session.tabletLives)
        assertEquals(0.55, 1.0 - session.tabletClock / session.tabletClockMax, 0.001)
        session.tick(6.6)
        assertEquals(2, session.tabletMiss)
        session.tick(6.6)
        assertTrue(session.ended)
        assertTrue(session.tabletTimeout)
        assertEquals("The tablet shattered", session.result?.kick)
    }

    @Test
    fun speedChangesRescaleTheSandAndKeepTheRise() {
        val session = start("psalm23")
        assertEquals(6.5, session.tabletClockMax, 0.001)
        session.tick(3.25)
        assertEquals(0.5, 1.0 - session.tabletClock / session.tabletClockMax, 0.001)
        session.setSpeed("fast")
        assertEquals("fast", session.speed.id)
        assertEquals(4.5, session.tabletClockMax, 0.001)
        assertEquals(0.5, 1.0 - session.tabletClock / session.tabletClockMax, 0.001)
    }

    @Test
    fun clockFreezesWhileAHitResolves() {
        val session = start("psalm23")
        session.pick("want")
        assertTrue(session.resolving)
        session.tick(1.0)
        assertEquals(6.5, session.tabletClock, 0.001)
        session.finishResolve()
        assertEquals(6.3375, session.tabletClock, 0.001)
        assertEquals(0, session.gapIdx)
        assertEquals(1, session.tabletIdx)
    }

    @Test
    fun prayerTutorialIsTimedAndRefillsAtTheSlowestSpeed() {
        val session = start("prayer")
        assertTrue(session.tutorial)
        assertFalse(session.untimed)
        assertEquals("meditative", session.speed.id)
        assertEquals(11.5, session.tabletClock, 0.001)
        assertEquals(8, session.tabletTotal)
        session.tick(11.6)
        assertFalse(session.ended)
        assertEquals(11.5, session.tabletClock, 0.001)
        assertEquals(0, session.tabletMiss)
        session.pick("Master")
        session.finishResolve()
        assertFalse(session.ended)
        assertEquals(11.5, session.tabletClock, 0.001)
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
        assertEquals(17, p91.tabletTotal)
        holdAll(p91)
        assertTrue(Tablets.recordOf(p91.save, "psalm91").held)

        val after91 = saveHeld("psalm23", "psalm91")
        val john = start("john1", after91)
        assertEquals(51, john.tabletTotal)
        holdAll(john)
        assertTrue(Tablets.recordOf(john.save, "john1").held)
        assertTrue(Tablets.unlocked("genesis3", john.save, bank))
        assertTrue(Tablets.paceGateOpen(2, john.save, bank))
        assertTrue(Tablets.unlocked("exodus12", john.save, bank))
    }

    @Test
    fun paceChunksMatchJs() {
        val p23 = start("psalm23")
        assertEquals(1, Tablets.gapCount(false, 1))
        assertEquals(11, p23.tabletTotal)
        assertEquals(1, p23.steps[0].size)
        assertEquals(1, p23.steps.last().size)
        val g1 = start("genesis1")
        assertEquals(1, Tablets.gapCount(false, 2))
        assertEquals(10, g1.tabletTotal)
        val g22 = start("genesis22")
        assertEquals(1, Tablets.gapCount(false, 3))
        assertEquals(10, g22.tabletTotal)
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
        assertTrue(Tablets.held(session.tabletMiss, session.tabletLives, session.tabletIdx, session.tabletTotal))
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

    @Test
    fun dualEditionTabletsIsolation() {
        assertEquals("psalm23", Tablets.editionKey("psalm23", "kjv"))
        assertEquals("nkjv~psalm23", Tablets.editionKey("psalm23", "nkjv"))

        val saveWithKjvHold = saveHeld("psalm23")
        assertTrue(Tablets.recordOf(saveWithKjvHold, "psalm23", "kjv").held)
        assertFalse(Tablets.recordOf(saveWithKjvHold, "psalm23", "nkjv").held)

        val saveWithNkjvHold = saveHeld("nkjv~psalm23")
        assertTrue(Tablets.recordOf(saveWithNkjvHold, "psalm23", "nkjv").held)
        assertFalse(Tablets.recordOf(saveWithNkjvHold, "psalm23", "kjv").held)

        assertEquals("kjv", Save.translation(Save.DEFAULT))
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
    fun carveDuringAHitResolveHoldsWhenTheSandRunsLow() {
        val session = start("psalm23")
        while (session.tabletIdx < session.steps.size - 1) {
            session.pick(session.currentBlank!!.a)
            session.finishResolve()
        }
        session.tick(session.tabletClockMax - 0.3)
        assertEquals(0.3, session.tabletClock, 0.001)
        session.pick(session.currentBlank!!.a)
        assertTrue(session.resolving)
        session.tick(1.0)
        assertFalse(session.ended)
        session.finishResolve()
        assertTrue(session.ended)
        assertTrue(session.result!!.held)
        assertFalse(session.result!!.timeout)
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

    @Test
    fun aGreyDecoyCannotBePicked() {
        val session = start("psalm23")
        assertTrue(session.winnow())
        val attemptsBefore = session.attempts
        val lampsBefore = session.lampsLeft
        session.pick(session.grey.first())
        assertFalse(session.resolving)
        assertEquals(attemptsBefore, session.attempts)
        assertEquals(lampsBefore, session.lampsLeft)
    }
}
