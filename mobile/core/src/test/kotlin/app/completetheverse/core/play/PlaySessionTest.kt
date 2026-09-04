package app.completetheverse.core.play

import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.save.Save
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class PlaySessionTest {
    private class Clock(var t: Long = 1_000L) {
        fun now(): Long = t
    }

    private fun verse(
        id: String = "genesis-1-1",
        p: String = "In the beginning God created the",
        a: String = "heaven and the earth",
        s: String = ".",
        d: List<String> = listOf("heavens and the earth", "earth and the heaven", "the world"),
        r: String = "Genesis 1:1",
        b: String = "Genesis",
    ) = Verse(id = id, p = p, a = a, s = s, d = d, r = r, b = b, t = 1)

    private fun start(
        questions: List<PlayQuestion>,
        clock: Clock,
        lives: Int = 3,
        persist: MutableList<app.completetheverse.core.save.SaveBlob>? = null,
        save: app.completetheverse.core.save.SaveBlob = Save.DEFAULT,
        mode: String = "play",
        diff: Diff = Diffs.disciple,
        verses: List<Verse> = emptyList(),
        tfClaims: List<TfClaim> = emptyList(),
    ): PlaySession = PlaySession.start(
        PlayConfig(
            questions = questions,
            clockPolicy = ClockPolicy.Wall,
            lives = lives,
            persist = persist?.let { bag -> PlayPersister { blob -> bag.add(blob) } },
            save = save,
            mode = mode,
            diff = diff,
            verses = verses.ifEmpty { questions.mapNotNull { it.verse } },
            siteVerses = verses.ifEmpty { questions.mapNotNull { it.verse } },
            tfClaims = tfClaims,
            rng = { 0.1 },
            nowMs = { clock.now() },
        ),
    )

    @Test
    fun startApiMatchesTheContract() {
        val session = PlaySession.start(
            questions = listOf(PlayQuestion(Mechanic.Mcq, verse())),
            clockPolicy = ClockPolicy.Wall,
            lives = Diffs.watchman.lives,
            persist = null,
        )
        assertEquals(PlayPhase.Playing, session.phase)
        assertEquals(2, session.maxLives)
        assertEquals(PlayClock.WALL_PICK_MS, session.durationMs)
    }

    @Test
    fun mcqCorrectAdvancesScoreAndPersistsLife() {
        val clock = Clock()
        val writes = mutableListOf<app.completetheverse.core.save.SaveBlob>()
        val v = verse()
        val session = start(listOf(PlayQuestion(Mechanic.Mcq, v)), clock, persist = writes)
        assertEquals(4, session.choices.size)
        session.submitChoice(v.a)
        assertEquals(true, session.lastCorrect)
        assertEquals(1, session.correct)
        assertEquals(1, session.attempts)
        assertTrue(session.score > 0)
        assertTrue(writes.isNotEmpty())
        val life = writes.last()["life"]!!.jsonObject
        assertEquals("1", life["attempts"]!!.jsonPrimitive.content)
        assertEquals("1", life["correct"]!!.jsonPrimitive.content)
        session.advance()
        assertEquals(PlayPhase.Results, session.phase)
        assertEquals("complete", session.result!!.reason)
        assertTrue(session.result!!.pendingSeals.isEmpty())
    }

    @Test
    fun pauseFreezesTheClockAndResumeAddsTheGap() {
        val clock = Clock(0L)
        val session = start(listOf(PlayQuestion(Mechanic.Mcq, verse())), clock)
        assertEquals(30_000L, session.remainingMs())
        clock.t = 4_000L
        assertEquals(26_000L, session.remainingMs())
        session.pause()
        assertEquals(PlayPhase.Paused, session.phase)
        clock.t = 20_000L
        assertEquals(26_000L, session.remainingMs())
        session.submitChoice(verse().a)
        assertEquals(PlayPhase.Paused, session.phase)
        assertEquals(0, session.attempts)
        assertEquals(26_000L, session.remainingMs())
        session.resume()
        assertEquals(PlayPhase.Playing, session.phase)
        assertEquals(26_000L, session.remainingMs())
        clock.t = 21_000L
        assertEquals(25_000L, session.remainingMs())
    }

    @Test
    fun timeoutMissesAndCanEndTheRun() {
        val clock = Clock(0L)
        val session = start(
            questions = listOf(PlayQuestion(Mechanic.Mcq, verse())),
            clock = clock,
            lives = 1,
        )
        clock.t = 30_000L
        assertTrue(session.onTimeout())
        assertEquals(false, session.lastCorrect)
        assertEquals(0, session.lives)
        session.advance()
        assertEquals("death", session.result!!.reason)
    }

    @Test
    fun overdriveOffersAtStreakTwelveThenRideDoublesAMissCost() {
        val clock = Clock()
        val questions = (1..13).map { i ->
            val v = verse(id = "v$i", a = "answer $i", d = listOf("x", "y", "z"), r = "R $i")
            PlayQuestion(Mechanic.Mcq, v)
        }
        val session = start(questions, clock, lives = 3)
        repeat(12) { i ->
            session.submitChoice(questions[i].verse!!.a)
            if (i < 11) {
                assertEquals(PlayPhase.Playing, session.phase)
                session.advance()
            }
        }
        assertEquals(12, session.streak)
        assertTrue(session.pendingOverdrive)
        session.offerOverdrive()
        assertEquals(PlayPhase.Overdrive, session.phase)
        session.resolveOverdrive(OverdriveChoice.Ride)
        assertTrue(session.overdriveRide)
        assertEquals(12, session.index)
        session.submitChoice("nope")
        assertEquals(1, session.lives)
        assertFalse(session.overdriveRide)
        assertEquals(0, session.streak)
    }

    @Test
    fun overdriveBankCashesTheStreak() {
        val clock = Clock()
        val questions = (1..13).map { i ->
            PlayQuestion(Mechanic.Mcq, verse(id = "v$i", a = "answer $i", d = listOf("x", "y", "z"), r = "R $i"))
        }
        val session = start(questions, clock, diff = Diffs.watchman)
        repeat(12) { i ->
            session.submitChoice(questions[i].verse!!.a)
            if (i < 11) session.advance()
        }
        val before = session.score
        val bank = session.overdriveBankAmount()
        assertEquals(720, bank)
        assertTrue(session.pendingOverdrive)
        session.offerOverdrive()
        session.resolveOverdrive(OverdriveChoice.Bank)
        assertEquals(before + 720, session.score)
        assertEquals(0, session.streak)
        assertFalse(session.overdriveRide)
    }

    @Test
    fun clozeAutoSubmitsWhenFilled() {
        val clock = Clock()
        val v = verse(a = "Let there be light", d = listOf("Let the earth be still"))
        val session = start(listOf(PlayQuestion(Mechanic.Cloze, v)), clock)
        val board = session.cloze!!
        board.words.forEach { session.pickCloze(it) }
        assertEquals(true, session.lastCorrect)
        assertTrue(session.locked)
    }

    @Test
    fun duelGradesTheGenuineReading() {
        val clock = Clock()
        val v = verse(
            p = "In the beginning was the Word, and the Word was with God, and the Word",
            a = "was God",
            d = listOf("was divine"),
            r = "John 1:1",
            b = "John",
            id = "john-1-1",
        )
        val session = start(listOf(PlayQuestion(Mechanic.Duel, v)), clock)
        val board = session.duel!!
        session.submitChoice(board.correctVal)
        assertEquals(true, session.lastCorrect)
    }

    @Test
    fun passageRefGradesTheCitation() {
        val clock = Clock()
        val v = verse()
        val session = start(listOf(PlayQuestion(Mechanic.PassageRef, v)), clock, verses = listOf(v) + (2..4).map {
            verse(id = "x$it", r = "Genesis 1:$it", a = "other")
        })
        assertEquals(4, session.choices.size)
        assertTrue(v.r in session.choices)
        session.submitChoice(v.r)
        assertEquals(true, session.lastCorrect)
    }

    @Test
    fun fadeMemorizeThenReconstruct() {
        val clock = Clock(0L)
        val v = verse(p = "And the earth was without form", a = "and void", d = listOf("and empty"))
        val session = start(listOf(PlayQuestion(Mechanic.Fade, v)), clock)
        assertEquals(FadePhase.Memorize, session.fadePhase)
        assertEquals(PlayClock.WALL_FADE_MS, session.durationMs)
        session.fadeDone()
        assertEquals(FadePhase.Reconstruct, session.fadePhase)
        assertEquals(PlayClock.FADE_PICK_MS, session.durationMs)
        assertEquals(4, session.choices.size)
        session.submitChoice(PlayMechanics.fullVerseText(v))
        assertEquals(true, session.lastCorrect)
    }

    @Test
    fun fadeMemorizeTimeoutMovesToReconstructNotMiss() {
        val clock = Clock(0L)
        val v = verse(p = "And the earth was without form", a = "and void")
        val session = start(listOf(PlayQuestion(Mechanic.Fade, v)), clock)
        clock.t = PlayClock.WALL_FADE_MS
        assertTrue(session.onTimeout())
        assertEquals(FadePhase.Reconstruct, session.fadePhase)
        assertEquals(null, session.lastCorrect)
        assertFalse(session.locked)
    }

    @Test
    fun trueFalseDoesNotWriteVerseMastery() {
        val clock = Clock()
        val writes = mutableListOf<app.completetheverse.core.save.SaveBlob>()
        val claim = TfClaim(
            b = "Genesis",
            s = "Sarah was Abraham's wife.",
            t = 1,
            v = true,
            why = "God said: Sarah thy wife shall bear thee a son (Genesis 17:15-19).",
        )
        val v = verse()
        val session = start(
            questions = listOf(PlayQuestion(Mechanic.TrueFalse, verse = v, claim = claim)),
            clock = clock,
            persist = writes,
        )
        assertEquals(PlayClock.scaledTrueFalse(PlayClock.WALL_PICK_MS), session.durationMs)
        session.submitTrueFalse(pickedTrue = true)
        assertEquals(true, session.lastCorrect)
        assertTrue(writes.isEmpty())
        session.advance()
        assertNotNull(session.result)
        val verseRow = session.result!!.save["verse"] as? JsonObject
        assertTrue(verseRow == null || verseRow.isEmpty() || verseRow[v.id] == null)
    }

    @Test
    fun assembleLockGradesTheBoard() {
        val clock = Clock()
        val v = verse()
        val session = start(listOf(PlayQuestion(Mechanic.Assemble, v)), clock)
        val board = session.assemble!!
        v.a.split(" ").forEachIndexed { i, w ->
            val tile = board.bank.first { it.word == w && it.dest == i }
            Assemble.place(board, tile.id, i)
        }
        session.submitAssemble()
        assertEquals(true, session.lastCorrect)
        assertEquals(PlayClock.WALL_TYPED_MS, session.durationMs)
    }

    @Test
    fun abandonWithAnswersPersistsBestAndLife() {
        val clock = Clock()
        val writes = mutableListOf<app.completetheverse.core.save.SaveBlob>()
        val v = verse()
        val session = start(
            questions = listOf(
                PlayQuestion(Mechanic.Mcq, v),
                PlayQuestion(Mechanic.Mcq, verse(id = "v2", a = "other", r = "Genesis 1:2")),
            ),
            clock = clock,
            persist = writes,
            mode = "trial",
        )
        session.submitChoice(v.a)
        session.requestAbandon()
        assertTrue(session.confirmAbandon)
        session.stay()
        assertFalse(session.confirmAbandon)
        session.abandon()
        assertEquals(PlayPhase.Results, session.phase)
        assertEquals("abandon", session.result!!.reason)
        val best = session.result!!.save["best"]!!.jsonObject["trial"]!!.jsonPrimitive.content
        assertTrue(best.toInt() > 0)
        val life = session.result!!.save["life"]!!.jsonObject
        assertEquals("1", life["attempts"]!!.jsonPrimitive.content)
        val merged = Save.combineLocalSnapshots(session.result!!.save, Save.DEFAULT)
        assertEquals(best, merged["best"]!!.jsonObject["trial"]!!.jsonPrimitive.content)
        assertEquals("1", merged["life"]!!.jsonObject["attempts"]!!.jsonPrimitive.content)
    }

    @Test
    fun abandonWithNoAnswersSkipsRunPersist() {
        val clock = Clock()
        val writes = mutableListOf<app.completetheverse.core.save.SaveBlob>()
        val session = start(listOf(PlayQuestion(Mechanic.Mcq, verse())), clock, persist = writes)
        session.abandon()
        assertEquals("abandon", session.result!!.reason)
        assertTrue(writes.none { (it["runs"] as? JsonPrimitive)?.content != "0" })
        assertEquals(0, session.result!!.attempts)
    }

    @Test
    fun overlayKeepsJustWrittenLifeOverStaleDisk() {
        val clock = Clock()
        val v = verse()
        val session = start(listOf(PlayQuestion(Mechanic.Mcq, v)), clock)
        session.submitChoice(v.a)
        session.advance()
        val local = session.result!!.save
        val stale = Save.DEFAULT
        val merged = Save.combineLocalSnapshots(local, stale)
        assertEquals("1", merged["life"]!!.jsonObject["attempts"]!!.jsonPrimitive.content)
        assertEquals("1", merged["life"]!!.jsonObject["correct"]!!.jsonPrimitive.content)
        assertTrue(merged["best"]!!.jsonObject["play"]!!.jsonPrimitive.content.toInt() > 0)
    }

    @Test
    fun playPolicyUsesDiffTimeFromConfig() {
        val clock = Clock(0L)
        val session = PlaySession.start(
            PlayConfig(
                questions = listOf(PlayQuestion(Mechanic.Mcq, verse())),
                clockPolicy = ClockPolicy.Play,
                lives = 2,
                diff = Diffs.watchman,
                rng = { 0.1 },
                nowMs = { clock.now() },
            ),
        )
        val scaled = kotlin.math.round(PlayClock.WALL_PICK_MS * Diffs.watchman.time).toLong()
        assertEquals(PlayClock.playClockMs(scaled, streak = 0, typed = false), session.durationMs)
    }

    @Test
    fun trueFalseWithoutClaimTimesOutAsAMiss() {
        val clock = Clock(0L)
        val session = start(
            questions = listOf(PlayQuestion(Mechanic.TrueFalse)),
            clock = clock,
            lives = 2,
        )
        assertEquals(null, session.claim)
        assertEquals(PlayPhase.Playing, session.phase)
        clock.t = session.durationMs
        assertTrue(session.onTimeout())
        assertEquals(false, session.lastCorrect)
        assertTrue(session.locked)
        assertEquals(1, session.attempts)
        assertEquals(1, session.lives)
        session.advance()
        assertEquals("complete", session.result!!.reason)
    }
}
