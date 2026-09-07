package app.completetheverse.core.play

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class PlayKeysTest {
    @Test
    fun lettersMapAToZero() {
        assertEquals(0, PlayKeys.choiceIndex("A"))
        assertEquals(0, PlayKeys.choiceIndex("a"))
        assertEquals(1, PlayKeys.choiceIndex("B"))
        assertEquals(2, PlayKeys.choiceIndex("c"))
        assertEquals(3, PlayKeys.choiceIndex("D"))
    }

    @Test
    fun digitsMapOneToZero() {
        assertEquals(0, PlayKeys.choiceIndex("1"))
        assertEquals(1, PlayKeys.choiceIndex("2"))
        assertEquals(3, PlayKeys.choiceIndex("4"))
        assertEquals(8, PlayKeys.choiceIndex("9"))
    }

    @Test
    fun unknownKeysAreIgnored() {
        assertNull(PlayKeys.choiceIndex("x"))
        assertNull(PlayKeys.choiceIndex("0"))
        assertNull(PlayKeys.choiceIndex("enter"))
    }

    @Test
    fun confirmAndEscape() {
        assertTrue(PlayKeys.isConfirm("Enter"))
        assertTrue(PlayKeys.isConfirm(" "))
        assertTrue(PlayKeys.isConfirm("Space"))
        assertTrue(PlayKeys.isEscape("Escape"))
        assertFalse(PlayKeys.isConfirm("a"))
        assertTrue(PlayKeys.isFadeDone("D"))
    }

    @Test
    fun hallDigitsOneToNine() {
        assertEquals(0, PlayKeys.hallModeIndex("1"))
        assertEquals(8, PlayKeys.hallModeIndex("9"))
        assertNull(PlayKeys.hallModeIndex("A"))
    }

    @Test
    fun playKeyEventSelectsConfirmsAndEscapes() {
        var selected: Int? = null
        var confirmed = false
        var escaped = false
        assertTrue(
            PlayKeys.playKeyEvent("A", 4, null, { selected = it }, { confirmed = true }, { escaped = true }),
        )
        assertEquals(0, selected)
        assertTrue(
            PlayKeys.playKeyEvent("enter", 4, 2, { selected = it }, { confirmed = true }, { escaped = true }),
        )
        assertTrue(confirmed)
        assertTrue(
            PlayKeys.playKeyEvent("escape", 4, 0, { }, { }, { escaped = true }),
        )
        assertTrue(escaped)
        assertFalse(
            PlayKeys.playKeyEvent("5", 4, null, { selected = it }, { }, { }),
        )
        assertFalse(
            PlayKeys.playKeyEvent(" ", 4, null, { }, { confirmed = false }, { }),
        )
    }

    @Test
    fun doubleTapConfirmWindow() {
        assertTrue(PlayKeys.shouldConfirmRepeat("0", "0", 100, 400, true))
        assertFalse(PlayKeys.shouldConfirmRepeat("0", "0", 100, 600, true))
        assertFalse(PlayKeys.shouldConfirmRepeat("1", "0", 100, 200, true))
        assertFalse(PlayKeys.shouldConfirmRepeat("0", "0", 100, 200, false))
    }
}
