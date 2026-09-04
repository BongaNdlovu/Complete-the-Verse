package app.completetheverse.core.play

import app.completetheverse.core.save.Save
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TutorialTest {
    @Test
    fun sixLessonsMatchWebsiteMechanics() {
        assertEquals(6, Tutorial.QUESTIONS.size)
        assertEquals(6, Tutorial.GUIDE.size)
        assertEquals(
            listOf(
                Mechanic.Mcq,
                Mechanic.PassageRef,
                Mechanic.Cloze,
                Mechanic.Duel,
                Mechanic.Fade,
                Mechanic.Assemble,
            ),
            Tutorial.QUESTIONS.map { it.mechanic },
        )
        assertEquals(
            listOf(
                "tutorial-choice",
                "tutorial-passage-ref",
                "tutorial-cloze",
                "tutorial-duel",
                "tutorial-fade",
                "tutorial-assemble",
            ),
            Tutorial.QUESTIONS.map { it.verse!!.id },
        )
        assertTrue(Tutorial.ASSEMBLE.typed)
    }

    @Test
    fun completeMarksTutorialDoneOnTheSaveBlob() {
        assertFalse(Tutorial.isDone(Save.DEFAULT))
        val done = Tutorial.wrapSave(
            Save.DEFAULT,
            PlayFinishInfo(reason = "complete", total = 6, index = 5, correct = 6, attempts = 6, score = 100),
        )
        assertTrue(Tutorial.isDone(done))
        assertTrue(Save.tutorialDone(done))
        assertTrue(Save.boolSet(done, "tutorialSeen"))
        val abandoned = Tutorial.wrapSave(
            Save.DEFAULT,
            PlayFinishInfo(reason = "abandon", total = 0, index = 0, correct = 0, attempts = 1, score = 0),
        )
        assertFalse(Tutorial.isDone(abandoned))
    }
}
