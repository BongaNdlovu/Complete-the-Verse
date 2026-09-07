package app.completetheverse.ui.fx

import app.completetheverse.core.play.PlayPhase

enum class FxBeat {
    Idle,
    Correct,
    Wrong,
    Lock,
    Overdrive,
    Combo,
}

fun fxBeatOf(
    phase: PlayPhase,
    locked: Boolean,
    lastCorrect: Boolean?,
    streak: Int,
): FxBeat = when {
    phase == PlayPhase.Overdrive -> FxBeat.Overdrive
    locked && lastCorrect == true && streak >= 3 -> FxBeat.Combo
    locked && lastCorrect == true -> FxBeat.Correct
    locked && lastCorrect == false -> FxBeat.Wrong
    locked -> FxBeat.Lock
    else -> FxBeat.Idle
}
