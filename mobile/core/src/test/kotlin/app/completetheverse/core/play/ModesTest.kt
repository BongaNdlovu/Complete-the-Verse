package app.completetheverse.core.play

import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.save.Save
import app.completetheverse.core.srs.Srs
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class ModesTest {
    private class Clock(var t: Long = 0L) {
        fun now(): Long = t
    }

    private fun verses(perTier: Int = 12): List<Verse> =
        (1..5).flatMap { t ->
            (1..perTier).map { i ->
                Verse(
                    id = "t$t-$i",
                    p = "Prefix $t $i",
                    a = "answer $t $i extra",
                    s = ".",
                    d = listOf("x $t $i", "y $t $i", "z $t $i"),
                    r = "Book $t:$i",
                    b = "Book$t",
                    t = t,
                )
            }
        }

    @Test
    fun mulberry32MatchesJsDailySeed() {
        assertEquals(2927454622u, Modes.seedFromString("ctv-2026-09-04").toUInt())
        val rng = Modes.mulberry32(Modes.seedFromString("ctv-2026-09-04"))
        val got = List(5) { rng() }
        val expect = listOf(
            0.06822054786607623,
            0.5660972790792584,
            0.674104826990515,
            0.4624905469827354,
            0.5062805283814669,
        )
        expect.forEachIndexed { i, v ->
            assertEquals(v, got[i], absoluteTolerance = 1e-12)
        }
    }

    @Test
    fun dailySeedIsStableForTheSameDate() {
        val bank = verses(8)
        val a = Modes.buildDaily(bank, "2026-09-04")
        val b = Modes.buildDaily(bank, "2026-09-04")
        val c = Modes.buildDaily(bank, "2026-09-05")
        assertEquals(20, a.size)
        assertEquals(a.map { it.verse!!.id }, b.map { it.verse!!.id })
        assertNotEquals(a.map { it.verse!!.id }, c.map { it.verse!!.id })
        assertEquals(1, a[0].verse!!.t)
        assertEquals(5, a.last().verse!!.t)
        assertEquals(Mechanic.Duel, a[4].mechanic)
        assertEquals(Mechanic.Cloze, a[9].mechanic)
        assertEquals(Mechanic.PassageRef, a[13].mechanic)
        assertEquals(Mechanic.Assemble, a[16].mechanic)
        assertTrue(a[16].typed)
        assertEquals(Mechanic.Fade, a[19].mechanic)
        assertEquals(a.map { it.verse!!.id }.toSet().size, a.size)
    }

    @Test
    fun trialActLengthsMatchJsAndHideViUntilRankAndSeal() {
        val bank = verses(16)
        val five = Modes.buildTrial(bank, Save.DEFAULT, rng = { 0.1 })
        assertEquals(8, five.count { it.clockBaseMs == 14_000L })
        assertEquals(8, five.count { it.clockBaseMs == 12_000L })
        assertEquals(9, five.count { it.clockBaseMs == 10_000L })
        assertEquals(9, five.count { it.clockBaseMs == 8_500L })
        assertEquals(5, five.count { it.clockBaseMs == 6_500L })
        assertEquals(listOf(14_000L, 12_000L, 10_000L, 8_500L, 6_500L), five.map { it.clockBaseMs }.distinct())
        assertTrue(five.take(34).none { it.oneLife })
        assertTrue(five.drop(34).all { it.oneLife })
        assertEquals(5, five.count { it.oneLife })

        val bestOnly = JsonObject(Save.DEFAULT.toMutableMap().apply {
            this["best"] = JsonObject(Save.DEFAULT["best"]!!.jsonObject.toMutableMap().apply {
                this["trial"] = JsonPrimitive(900)
            })
        })
        assertEquals(5, Modes.trialActs(bestOnly).size)

        val rankOnly = JsonObject(Save.DEFAULT.toMutableMap().apply {
            this["xp"] = JsonPrimitive(Modes.xpToReach(20))
        })
        assertEquals(5, Modes.trialActs(rankOnly).size)

        val sealOnly = JsonObject(Save.DEFAULT.toMutableMap().apply {
            this["seals"] = JsonArray(listOf(JsonPrimitive(Modes.ACT_VI_SEAL)))
        })
        assertEquals(5, Modes.trialActs(sealOnly).size)

        val unlocked = JsonObject(Save.DEFAULT.toMutableMap().apply {
            this["xp"] = JsonPrimitive(Modes.xpToReach(20))
            this["seals"] = JsonArray(listOf(JsonPrimitive(Modes.ACT_VI_SEAL)))
        })
        val six = Modes.buildTrial(bank, unlocked, rng = { 0.2 })
        assertEquals(8 + 8 + 9 + 9 + 5 + 7, six.size)
        assertEquals(5_500L, six.last().clockBaseMs)
        assertTrue(six.takeLast(7).all { it.oneLife && it.label == "The Remnant" })
    }

    @Test
    fun trialAbandonDoesNotUnlockActVi() {
        val clock = Clock()
        val v = verses()[0]
        val session = PlaySession.start(
            PlayConfig(
                questions = listOf(
                    PlayQuestion(Mechanic.Mcq, v),
                    PlayQuestion(Mechanic.Mcq, verses()[1]),
                ),
                clockPolicy = ClockPolicy.Play,
                lives = 3,
                mode = "trial",
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        session.submitChoice(v.a)
        session.abandon()
        assertTrue(session.result!!.save["best"]!!.jsonObject["trial"]!!.jsonPrimitive.content.toInt() > 0)
        assertEquals(5, Modes.trialActs(session.result!!.save).size)
        assertEquals(39, Modes.buildTrial(verses(16), session.result!!.save, rng = { 0.1 }).size)
    }

    @Test
    fun trialActFiveDropsToOneLife() {
        val clock = Clock()
        val qs = (1..9).map { i ->
            PlayQuestion(
                Mechanic.Mcq,
                verses()[i],
                clockBaseMs = if (i < 8) 14_000L else 6_500L,
                oneLife = i >= 8,
            )
        }
        val session = PlaySession.start(
            PlayConfig(
                questions = qs,
                clockPolicy = ClockPolicy.Play,
                lives = 3,
                diff = Diffs.disciple,
                rng = { 0.1 },
                nowMs = { clock.now() },
                mode = "trial",
            ),
        )
        assertEquals(3, session.lives)
        repeat(8) { i ->
            session.submitChoice(qs[i].verse!!.a)
            session.advance()
        }
        assertEquals(1, session.maxLives)
        assertEquals(1, session.lives)
        assertEquals(6_500L, qs[8].clockBaseMs)
    }

    @Test
    fun blitzAddsTwoSecondsOnHitAndBurnsFourOnMiss() {
        val clock = Clock(0L)
        val qs = (1..4).map { i -> PlayQuestion(Mechanic.Mcq, verses()[i]) }
        val session = PlaySession.start(
            PlayConfig(
                questions = qs,
                clockPolicy = ClockPolicy.Blitz,
                lives = 0,
                mode = "blitz",
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        assertEquals(PlayClock.BLITZ_START_MS, session.durationMs)
        assertEquals(60_000L, session.remainingMs())
        session.submitChoice(qs[0].verse!!.a)
        assertEquals(true, session.lastCorrect)
        assertEquals(62_000L, session.remainingMs())
        session.advance()
        assertEquals(62_000L, session.remainingMs())
        session.submitChoice("nope")
        assertEquals(false, session.lastCorrect)
        assertEquals(58_000L, session.remainingMs())
        session.advance()
        assertEquals(PlayPhase.Playing, session.phase)
        clock.t = 58_000L
        assertTrue(session.onTimeout())
        session.advance()
        assertEquals("death", session.result!!.reason)
        assertEquals(1, session.result!!.correct)
        val best = session.result!!.save["best"]!!.jsonObject["blitz"]!!.jsonPrimitive.content.toInt()
        assertEquals(1, best)
    }

    @Test
    fun teamIsFiveAndFiveUniqueAndMissesDoNotEnd() {
        val clock = Clock()
        val qs = Modes.buildTeam(verses(6), Save.DEFAULT, rng = { 0.4 })
        assertEquals(10, qs.size)
        assertEquals(10, qs.map { it.verse!!.id }.toSet().size)
        val session = PlaySession.start(
            PlayConfig(
                questions = qs,
                clockPolicy = ClockPolicy.Wall,
                lives = 0,
                mode = "team",
                teamStart = "white",
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        assertEquals("white", session.teamSide)
        repeat(5) { i ->
            session.submitChoice("nope")
            assertEquals(0, session.lives)
            assertEquals(PlayPhase.Playing, session.phase)
            session.advance()
        }
        assertEquals(PlayPhase.Handoff, session.phase)
        assertEquals("blue", session.teamSide)
        assertEquals(0, session.teamWhiteKept)
        session.continueHandoff()
        assertEquals(PlayPhase.Playing, session.phase)
        repeat(5) { i ->
            session.submitChoice(qs[5 + i].verse!!.a)
            if (i < 4) session.advance() else session.advance()
        }
        assertEquals("complete", session.result!!.reason)
        assertEquals("blue", session.result!!.teamWinner)
        assertEquals(0, session.result!!.teamWhiteKept)
        assertEquals(5, session.result!!.teamBlueKept)
        assertEquals("0", session.result!!.save["runs"]!!.jsonPrimitive.content)
        assertEquals("0", session.result!!.save["best"]!!.jsonObject["team"]?.jsonPrimitive?.content ?: "0")
    }

    @Test
    fun dailyCompleteRecordsOnceAndAbandonDoesNot() {
        val clock = Clock()
        val bank = verses(8)
        val qs = Modes.buildDaily(bank, "2026-09-04")
        val writes = mutableListOf<app.completetheverse.core.save.SaveBlob>()
        val session = PlaySession.start(
            PlayConfig(
                questions = qs.take(2),
                clockPolicy = ClockPolicy.Wall,
                lives = 3,
                persist = PlayPersister { writes.add(it) },
                mode = "daily",
                todayKey = "2026-09-04",
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        session.submitChoice(qs[0].verse!!.a)
        session.abandon()
        val dailyAfterQuit = session.result!!.save["daily"]!!.jsonObject
        assertEquals("", dailyAfterQuit["date"]!!.jsonPrimitive.content)
        assertFalse(session.result!!.dailyRecorded)

        val finish = PlaySession.start(
            PlayConfig(
                questions = qs.take(1),
                clockPolicy = ClockPolicy.Wall,
                lives = 3,
                persist = PlayPersister { writes.add(it) },
                mode = "daily",
                todayKey = "2026-09-04",
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        finish.submitChoice(qs[0].verse!!.a)
        finish.advance()
        assertTrue(finish.result!!.dailyRecorded)
        assertEquals("2026-09-04", finish.result!!.save["daily"]!!.jsonObject["date"]!!.jsonPrimitive.content)
        val merged = Save.combineLocalSnapshots(finish.result!!.save, Save.DEFAULT)
        assertEquals("2026-09-04", merged["daily"]!!.jsonObject["date"]!!.jsonPrimitive.content)
    }

    @Test
    fun endlessClockUsesShrinkingBase() {
        val qs = Modes.buildEndless(verses(16), rng = { 0.3 }, count = 5)
        assertEquals(PlayClock.endlessBaseMs(1), qs[0].clockBaseMs)
        assertEquals(PlayClock.endlessBaseMs(5), qs[4].clockBaseMs)
        val clock = Clock(0L)
        val session = PlaySession.start(
            PlayConfig(
                questions = qs,
                clockPolicy = ClockPolicy.Play,
                lives = 3,
                mode = "endless",
                diff = Diffs.disciple,
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        val expected = PlayClock.playClockMs(PlayClock.endlessBaseMs(1), streak = 0, typed = false)
        assertEquals(expected, session.durationMs)
    }

    @Test
    fun endlessAndBlitzRefillInsteadOfCompletingTheBatch() {
        val clock = Clock()
        val bank = verses(8)
        val session = PlaySession.start(
            PlayConfig(
                questions = listOf(PlayQuestion(Mechanic.Mcq, bank[0], clockBaseMs = PlayClock.endlessBaseMs(1))),
                clockPolicy = ClockPolicy.Play,
                lives = 3,
                mode = "endless",
                moreQuestions = { i ->
                    PlayQuestion(
                        Mechanic.Mcq,
                        bank[i % bank.size],
                        clockBaseMs = PlayClock.endlessBaseMs(i + 1),
                    )
                },
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        session.submitChoice(bank[0].a)
        session.advance()
        assertEquals(PlayPhase.Playing, session.phase)
        assertEquals(2, session.questions.size)
        assertEquals(PlayClock.endlessBaseMs(2), session.questions[1].clockBaseMs)

        val blitz = PlaySession.start(
            PlayConfig(
                questions = listOf(PlayQuestion(Mechanic.Mcq, bank[0])),
                clockPolicy = ClockPolicy.Blitz,
                lives = 0,
                mode = "blitz",
                moreQuestions = { i -> PlayQuestion(Mechanic.Mcq, bank[(i + 1) % bank.size]) },
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        blitz.submitChoice(bank[0].a)
        blitz.advance()
        assertEquals(PlayPhase.Playing, blitz.phase)
        assertEquals(2, blitz.questions.size)
        assertTrue(blitz.remainingMs() > 0L)
    }

    @Test
    fun recallKeepReschedulesSrs() {
        val clock = Clock()
        val v = verses()[0]
        val session = PlaySession.start(
            PlayConfig(
                questions = listOf(PlayQuestion(Mechanic.Assemble, v.copy(typed = true))),
                clockPolicy = ClockPolicy.Wall,
                lives = 3,
                mode = "recall",
                today = 100,
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        val board = session.assemble!!
        v.a.split(" ").forEachIndexed { i, w ->
            val tile = board.bank.first { it.word == w && it.dest == i }
            Assemble.place(board, tile.id, i)
        }
        session.submitAssemble()
        assertEquals(true, session.lastCorrect)
        val card = Srs.cardFromJson((session.save["srs"] as JsonObject)[v.id])
        assertEquals(1, card!!.reps)
        assertEquals(101, card.due)
        assertEquals("1", session.save["life"]!!.jsonObject["reviewsDone"]!!.jsonPrimitive.content)
    }
}
