package app.completetheverse.core.play

import kotlin.math.roundToInt

object PlayClock {
    const val WALL_PICK_MS = 30_000L
    const val WALL_TYPED_MS = 45_000L
    const val WALL_FADE_MS = 60_000L
    const val FADE_PICK_MS = 45_000L
    const val FADE_MEMORY_MS = WALL_FADE_MS
    const val PICK_PAD_MS = 1_500L
    const val PACE = 1.2
    const val FLAT_ADD_MS = 5_000L
    const val MOMENTUM_STRETCH = 1.2
    val MOMENTUM_STEPS = listOf(3, 5, 8, 12)
    const val OVERDRIVE_TIMEOUT_MS = 9_000L
    const val HOLD_CORRECT_MS = 1_500L
    const val HOLD_WRONG_MS = 2_500L
    const val HOLD_OVERDRIVE_MS = 700L
    const val JUDGE_MS = 2_500L

    fun playClockMs(
        ms: Long,
        streak: Int = 0,
        typed: Boolean = false,
        skipPad: Boolean = false,
        pickPadMs: Long = PICK_PAD_MS,
        pace: Double = PACE,
        flatAddMs: Long = FLAT_ADD_MS,
    ): Long {
        if (ms <= 0L) return ms
        val padded = if (typed || skipPad) ms else ms + pickPadMs
        val momentum = if (typed || streak < MOMENTUM_STEPS[0]) {
            padded
        } else {
            (padded * MOMENTUM_STRETCH).roundToInt().toLong()
        }
        return (momentum * pace + flatAddMs).roundToInt().toLong()
    }

    fun wallClockMs(
        mechanic: Mechanic,
        typed: Boolean,
        fadePhase: FadePhase? = null,
    ): Long {
        if (mechanic == Mechanic.Fade) {
            return if (fadePhase == FadePhase.Reconstruct) FADE_PICK_MS else WALL_FADE_MS
        }
        if (typed || mechanic == Mechanic.Assemble) return WALL_TYPED_MS
        return WALL_PICK_MS
    }

    fun scaledTrueFalse(durationMs: Long, scale: Double = 0.65): Long =
        (durationMs * scale).roundToInt().toLong().coerceAtLeast(1L)

    fun multiplier(streak: Int): Int {
        var m = 1
        MOMENTUM_STEPS.forEachIndexed { i, n -> if (streak >= n) m = i + 2 }
        return m
    }

    fun overdriveBank(streak: Int, diffScore: Double): Int =
        (streak.coerceAtLeast(0) * 60.0 * diffScore).roundToInt()

    fun inOverdrive(streak: Int): Boolean =
        streak >= MOMENTUM_STEPS.last()
}

data class ClockPolicy(
    val wall: Boolean = true,
    val pickMs: Long = PlayClock.WALL_PICK_MS,
    val typedMs: Long = PlayClock.WALL_TYPED_MS,
    val fadeMemoryMs: Long = PlayClock.WALL_FADE_MS,
    val fadeReconstructMs: Long = PlayClock.FADE_PICK_MS,
    val trueFalseScale: Double = 0.65,
    val pickPadMs: Long = PlayClock.PICK_PAD_MS,
    val pace: Double = PlayClock.PACE,
    val flatAddMs: Long = PlayClock.FLAT_ADD_MS,
) {
    fun durationMs(
        mechanic: Mechanic,
        typed: Boolean,
        streak: Int,
        fadePhase: FadePhase? = null,
        clockBaseMs: Long? = null,
    ): Long {
        val baseWall = when {
            mechanic == Mechanic.Fade && fadePhase == FadePhase.Reconstruct -> fadeReconstructMs
            mechanic == Mechanic.Fade -> fadeMemoryMs
            typed || mechanic == Mechanic.Assemble -> typedMs
            else -> pickMs
        }
        val raw = if (wall) {
            clockBaseMs ?: baseWall
        } else {
            PlayClock.playClockMs(
                ms = clockBaseMs ?: baseWall,
                streak = streak,
                typed = typed || mechanic == Mechanic.Assemble,
                pickPadMs = pickPadMs,
                pace = pace,
                flatAddMs = flatAddMs,
            )
        }
        return if (mechanic == Mechanic.TrueFalse) {
            PlayClock.scaledTrueFalse(raw, trueFalseScale)
        } else {
            raw
        }
    }

    companion object {
        val Wall = ClockPolicy(wall = true)
        val Play = ClockPolicy(wall = false)
    }
}
