package app.completetheverse.core.beat

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class BeatTest {
    @Test
    fun twelveQuestions() {
        assertEquals(12, Beat.questions.size)
        assertEquals("beat-q1", Beat.questions.first().id)
        assertEquals("beat-q12", Beat.questions.last().id)
    }

    @Test
    fun pickAnswersMatchTheWebBank() {
        val q1 = Beat.questions.first { it.id == "beat-q1" }
        assertEquals("between Shochoh and Azekah, in Ephes-dammim / in the valley of Elah", q1.a)
        assertEquals(4, q1.choices.size)
        val q9 = Beat.questions.first { it.id == "beat-q9" }
        assertEquals(Beat.NAME, q9.a)
    }

    @Test
    fun heldRequiresACleanTwelve() {
        assertTrue(Beat.held(12, beatMiss = false))
        assertFalse(Beat.held(12, beatMiss = true))
        assertFalse(Beat.held(11, beatMiss = false))
    }

    @Test
    fun multiKeyIsStaffStonesSling() {
        assertEquals("sling,staff,stones", Beat.multiKey())
    }
}
