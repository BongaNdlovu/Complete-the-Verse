package app.completetheverse.ui.play

import androidx.compose.ui.Modifier
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEvent
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import app.completetheverse.core.play.PlayKeys

fun playKeyLabel(event: KeyEvent): String? {
    if (event.type != KeyEventType.KeyDown) return null
    return when (event.key) {
        Key.A -> "a"
        Key.B -> "b"
        Key.C -> "c"
        Key.D -> "d"
        Key.E -> "e"
        Key.F -> "f"
        Key.G -> "g"
        Key.H -> "h"
        Key.I -> "i"
        Key.One, Key.NumPad1 -> "1"
        Key.Two, Key.NumPad2 -> "2"
        Key.Three, Key.NumPad3 -> "3"
        Key.Four, Key.NumPad4 -> "4"
        Key.Five, Key.NumPad5 -> "5"
        Key.Six, Key.NumPad6 -> "6"
        Key.Seven, Key.NumPad7 -> "7"
        Key.Eight, Key.NumPad8 -> "8"
        Key.Nine, Key.NumPad9 -> "9"
        Key.Enter, Key.NumPadEnter -> "enter"
        Key.Spacebar -> " "
        Key.Escape -> "escape"
        else -> null
    }
}

fun Modifier.playChoiceKeys(onKey: (String) -> Boolean): Modifier =
    onPreviewKeyEvent { event ->
        val label = playKeyLabel(event) ?: return@onPreviewKeyEvent false
        onKey(label)
    }

fun hallDigitFromKey(key: String): Int? = PlayKeys.hallModeIndex(key)

fun playKeyEvent(
    event: KeyEvent,
    choiceCount: Int,
    selectedIndex: Int?,
    onSelect: (Int) -> Unit,
    onConfirm: () -> Unit,
    onEscape: () -> Unit,
): Boolean {
    val label = playKeyLabel(event) ?: return false
    return PlayKeys.playKeyEvent(label, choiceCount, selectedIndex, onSelect, onConfirm, onEscape)
}
