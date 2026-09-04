package app.completetheverse.core.srs

import kotlin.math.abs
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import java.time.LocalDateTime
import java.time.ZoneId

class SrsTest {
    private val T = 20000
    private val zone: ZoneId = ZoneId.of("America/Los_Angeles")

    @Test
    fun dayNumberSameLocalDay() {
        val a = local(2026, 8, 2, 0, 0, 1)
        val b = local(2026, 8, 2, 23, 59, 59)
        val c = local(2026, 8, 3, 0, 0, 1)
        assertEquals(Srs.dayNumber(a, zone), Srs.dayNumber(b, zone))
        assertEquals(Srs.dayNumber(a, zone) + 1, Srs.dayNumber(c, zone))
        val n = Srs.dayNumber(a, zone)
        assertTrue(n > 0)
        assertEquals(
            Srs.dayNumber(local(2026, 1, 15, 23, 59, 0), zone),
            Srs.dayNumber(local(2026, 1, 15, 6, 0, 0), zone),
        )
    }

    @Test
    fun gradeAnswerScale() {
        assertEquals(0, Srs.gradeAnswer(GradeInput(timedOut = true)))
        assertEquals(1, Srs.gradeAnswer(GradeInput(correct = false)))
        assertEquals(2, Srs.gradeAnswer(GradeInput(correct = false, near = true)))
        assertEquals(5, Srs.gradeAnswer(GradeInput(correct = true, fraction = 0.2)))
        assertEquals(4, Srs.gradeAnswer(GradeInput(correct = true, fraction = 0.6)))
        assertEquals(3, Srs.gradeAnswer(GradeInput(correct = true, fraction = 0.95)))
        assertEquals(3, Srs.gradeAnswer(GradeInput(correct = true, fraction = 0.1, usedPower = true)))
        assertEquals(3, Srs.gradeAnswer(GradeInput(correct = true, fraction = 0.1, near = true)))
        assertTrue(
            Srs.gradeAnswer(GradeInput(correct = true, fraction = 0.1, usedPower = true)) <
                Srs.gradeAnswer(GradeInput(correct = true, fraction = 0.1)),
        )
    }

    @Test
    fun scheduleSm2Ladder() {
        val c1 = Srs.schedule(null, 4, T)
        assertEquals(1, c1.ivl)
        assertEquals(T + 1, c1.due)
        assertEquals(1, c1.reps)

        val c2 = Srs.schedule(c1, 4, T + 1)
        assertEquals(6, c2.ivl)
        assertEquals(T + 7, c2.due)

        val c3 = Srs.schedule(c2, 4, T + 7)
        assertEquals(jsRound(6 * c2.ef), c3.ivl)
        assertTrue(c3.ivl > c2.ivl)
    }

    @Test
    fun scheduleFailureResetsInterval() {
        var c = Srs.schedule(null, 5, T)
        c = Srs.schedule(c, 5, T + 1)
        c = Srs.schedule(c, 5, T + 7)
        val beforeEf = c.ef
        val beforeIvl = c.ivl
        assertTrue(beforeIvl > 6)

        val lapsed = Srs.schedule(c, 1, T + 40)
        assertEquals(1, lapsed.ivl)
        assertEquals(T + 41, lapsed.due)
        assertEquals(0, lapsed.reps)
        assertEquals(1, lapsed.lapses)
        assertTrue(lapsed.ef < beforeEf)
    }

    @Test
    fun scheduleBoundsAndPurity() {
        var c = Srs.freshCard()
        for (i in 0 until 40) c = Srs.schedule(c, 0, T + i)
        assertTrue(c.ef >= Srs.MIN_EF)
        assertTrue(abs(c.ef - Srs.MIN_EF) < 1e-9)

        var d = Srs.freshCard()
        for (i in 0 until 40) d = Srs.schedule(d, 5, T + i)
        assertTrue(d.ivl <= Srs.MAX_INTERVAL)

        val original = Srs.freshCard()
        Srs.schedule(original, 5, T)
        assertEquals(Srs.freshCard(), original)

        val junk = Srs.schedule(SrsCard(ef = Double.NaN, reps = 0, ivl = 0, due = 0, lapses = 0), 4, T)
        assertTrue(junk.ef.isFinite() && junk.ef > 0)
    }

    @Test
    fun isDueAndOverdueBy() {
        assertTrue(Srs.isDue(null, T))
        assertTrue(Srs.isDue(Srs.freshCard(), T))
        val c = Srs.schedule(null, 4, T)
        assertFalse(Srs.isDue(c, T))
        assertTrue(Srs.isDue(c, T + 1))
        assertTrue(Srs.isDue(c, T + 9))
        assertEquals(3, Srs.overdueBy(c, T + 4))
        assertEquals(-1, Srs.overdueBy(c, T))
    }

    @Test
    fun queueOrdering() {
        data class V(val id: String)
        fun v(n: Int) = V("v$n")
        val verses = listOf(v(1), v(2), v(3), v(4), v(5))
        val cards = mapOf(
            "v1" to SrsCard(ef = 2.5, reps = 2, ivl = 10, due = T + 5, lapses = 0),
            "v2" to SrsCard(ef = 2.5, reps = 2, ivl = 10, due = T - 9, lapses = 0),
            "v4" to SrsCard(ef = 2.5, reps = 2, ivl = 10, due = T - 1, lapses = 0),
            "v5" to SrsCard(ef = 1.6, reps = 0, ivl = 1, due = T - 3, lapses = 2),
        )
        val cardFor: (V) -> SrsCard? = { cards[it.id] }
        val q = Srs.buildQueue(verses, cardFor, T, 5) { it }
        val ids = q.map { it.id }

        assertEquals("v2", ids[0])
        assertTrue(ids.indexOf("v3") > ids.indexOf("v4") && ids.indexOf("v3") > ids.indexOf("v5"))
        assertEquals("v1", ids.last())
        assertTrue(ids.indexOf("v5") < ids.indexOf("v3"))
        assertEquals(2, Srs.buildQueue(verses, cardFor, T, 2) { it }.size)
        assertEquals(3, Srs.dueCount(verses, cardFor, T))
        assertEquals(0, Srs.dueCount(verses, cardFor, T - 100))
    }

    @Test
    fun strengthBuckets() {
        assertEquals("unseen", Srs.strength(null))
        assertEquals("lapsed", Srs.strength(SrsCard(reps = 0, ivl = 1, lapses = 3, ef = 2.0, due = 0)))
        assertEquals("learning", Srs.strength(SrsCard(reps = 1, ivl = 1, lapses = 0, ef = 2.5, due = 0)))
        assertEquals("held", Srs.strength(SrsCard(reps = 4, ivl = 30, lapses = 0, ef = 2.5, due = 0)))
    }

    private fun local(year: Int, month: Int, day: Int, hour: Int, minute: Int, second: Int) =
        LocalDateTime.of(year, month, day, hour, minute, second).atZone(zone).toInstant()
}
