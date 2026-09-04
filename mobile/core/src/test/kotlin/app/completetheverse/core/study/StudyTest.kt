package app.completetheverse.core.study

import app.completetheverse.core.bank.Verse
import app.completetheverse.core.save.Save
import app.completetheverse.core.srs.SrsCard
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class StudyTest {
    private val verse = Verse(
        id = "psalm-23-1",
        p = "The LORD is my shepherd; I",
        a = "shall not want",
        s = ".",
        r = "Psalm 23:1",
        b = "Psalms",
        t = 1,
    )

    @Test
    fun unseenLapsingLearningHeldAndDue() {
        val today = 20000
        assertEquals("unseen", Study.strength(null))
        assertEquals("unseen", Study.filterState(null, today))
        assertEquals("Never seen", Study.scheduleLabel(null, today))

        val lapsed = SrsCard(reps = 0, lapses = 1, due = today, ivl = 1)
        assertEquals("lapsing", Study.strength(lapsed))
        assertEquals("due", Study.filterState(lapsed, today))
        assertEquals("Lost — due now", Study.scheduleLabel(lapsed, today))

        val learning = SrsCard(reps = 1, ivl = 6, due = today + 3, lapses = 0)
        assertEquals("learning", Study.strength(learning))
        assertEquals("learning", Study.filterState(learning, today))
        assertEquals("Learning · due in 3d", Study.scheduleLabel(learning, today))

        val held = SrsCard(reps = 3, ivl = 21, due = today + 10, lapses = 0)
        assertEquals("held", Study.strength(held))
        assertEquals("held", Study.filterState(held, today))
        assertEquals("Held · due in 10d", Study.scheduleLabel(held, today))

        val dueHeld = held.copy(due = today - 2)
        assertEquals("due", Study.filterState(dueHeld, today))
        assertEquals("2d overdue", Study.scheduleLabel(dueHeld, today))
    }

    @Test
    fun applyReviewWritesSrsLastWriterCard() {
        val today = 20000
        val next = Study.applyReview(
            save = Save.DEFAULT,
            verse = verse,
            correct = true,
            timedOut = false,
            fraction = 0.2,
            mode = "choice",
            today = today,
        )
        val card = Study.cardFor(next, verse.id)!!
        assertEquals(1, card.reps)
        assertEquals(today + 1, card.due)
        assertEquals(5, card.lastQuality)
        assertEquals("choice", card.lastMode)
        assertEquals(1, Study.dueCount(listOf(verse), next, today + 1))
        assertEquals(0, Study.dueCount(listOf(verse), Save.DEFAULT, today))
    }

    @Test
    fun searchMatchesReferenceAndText() {
        assertTrue(Study.matchesQuery(verse, "shepherd"))
        assertTrue(Study.matchesQuery(verse, "Psalm 23"))
        assertTrue(Study.matchesQuery(verse, ""))
        assertEquals(false, Study.matchesQuery(verse, "Job"))
    }
}
