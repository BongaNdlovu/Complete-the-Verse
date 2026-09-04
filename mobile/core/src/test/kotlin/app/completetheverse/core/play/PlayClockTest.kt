package app.completetheverse.core.play

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PlayClockTest {
    @Test
    fun wallConstantsMatchJs() {
        assertEquals(30_000L, PlayClock.WALL_PICK_MS)
        assertEquals(45_000L, PlayClock.WALL_TYPED_MS)
        assertEquals(60_000L, PlayClock.WALL_FADE_MS)
        assertEquals(45_000L, PlayClock.FADE_PICK_MS)
        assertEquals(1_500L, PlayClock.PICK_PAD_MS)
        assertEquals(1.2, PlayClock.PACE)
        assertEquals(5_000L, PlayClock.FLAT_ADD_MS)
        assertEquals(listOf(3, 5, 8, 12), PlayClock.MOMENTUM_STEPS)
        assertEquals(PlayClock.JUDGE_MS, PlayClock.HOLD_WRONG_MS)
        assertEquals(700L, PlayClock.HOLD_OVERDRIVE_MS)
    }

    @Test
    fun playClockMsAddsPadPaceAndFlat() {
        // (14000 + 1500) * 1.2 + 5000 = 23600
        assertEquals(23_600L, PlayClock.playClockMs(14_000L, streak = 0, typed = false))
    }

    @Test
    fun playClockMsSkipsPadWhenTyped() {
        // 45000 * 1.2 + 5000 = 59000
        assertEquals(59_000L, PlayClock.playClockMs(45_000L, streak = 0, typed = true))
    }

    @Test
    fun playClockMsStretchesAfterFirstMomentumStep() {
        val padded = 14_000L + 1_500L
        val stretched = kotlin.math.round(padded * 1.2).toLong()
        val expected = kotlin.math.round(stretched * 1.2 + 5_000.0).toLong()
        assertEquals(expected, PlayClock.playClockMs(14_000L, streak = 3, typed = false))
    }

    @Test
    fun wallClockPicksTypedAndFade() {
        assertEquals(30_000L, PlayClock.wallClockMs(Mechanic.Mcq, typed = false))
        assertEquals(45_000L, PlayClock.wallClockMs(Mechanic.Assemble, typed = false))
        assertEquals(60_000L, PlayClock.wallClockMs(Mechanic.Fade, typed = false, fadePhase = FadePhase.Memorize))
        assertEquals(45_000L, PlayClock.wallClockMs(Mechanic.Fade, typed = false, fadePhase = FadePhase.Reconstruct))
    }

    @Test
    fun trueFalseTightensToSixtyFivePercent() {
        assertEquals(19_500L, PlayClock.scaledTrueFalse(30_000L))
    }

    @Test
    fun multiplierStepsWithMomentum() {
        assertEquals(1, PlayClock.multiplier(0))
        assertEquals(1, PlayClock.multiplier(2))
        assertEquals(2, PlayClock.multiplier(3))
        assertEquals(3, PlayClock.multiplier(5))
        assertEquals(4, PlayClock.multiplier(8))
        assertEquals(5, PlayClock.multiplier(12))
        assertTrue(PlayClock.inOverdrive(12))
        assertFalse(PlayClock.inOverdrive(11))
    }

    @Test
    fun overdriveBankMatchesPolish() {
        assertEquals(720, PlayClock.overdriveBank(12, 1.0))
        assertEquals(612, PlayClock.overdriveBank(12, 0.85))
    }

    @Test
    fun clockPolicyWallVsPlay() {
        val wall = ClockPolicy.Wall.durationMs(Mechanic.Mcq, typed = false, streak = 0)
        val play = ClockPolicy.Play.durationMs(Mechanic.Mcq, typed = false, streak = 0)
        assertEquals(30_000L, wall)
        assertEquals(PlayClock.playClockMs(30_000L, streak = 0, typed = false), play)
        val tf = ClockPolicy.Wall.durationMs(Mechanic.TrueFalse, typed = false, streak = 0)
        assertEquals(19_500L, tf)
    }

    @Test
    fun playPolicyAppliesDiffTimeAndSkipPad() {
        val watchman = ClockPolicy.Play.durationMs(
            Mechanic.Mcq,
            typed = false,
            streak = 0,
            diffTime = Diffs.watchman.time,
        )
        val scaled = kotlin.math.round(30_000.0 * Diffs.watchman.time).toLong()
        assertEquals(PlayClock.playClockMs(scaled, streak = 0, typed = false), watchman)
        val blitz = ClockPolicy.Play.copy(skipPad = true).durationMs(Mechanic.Mcq, typed = false, streak = 0)
        assertEquals(PlayClock.playClockMs(30_000L, streak = 0, typed = false, skipPad = true), blitz)
    }

    @Test
    fun blitzAdjustAddsTwoOrBurnsFour() {
        assertEquals(62_000L, PlayClock.blitzAdjustMs(60_000L, true))
        assertEquals(56_000L, PlayClock.blitzAdjustMs(60_000L, false))
        assertEquals(0L, PlayClock.blitzAdjustMs(3_000L, false))
        assertEquals(60_000L, PlayClock.BLITZ_START_MS)
    }

    @Test
    fun endlessClockShrinksThenFloors() {
        assertEquals(11_820L, PlayClock.endlessBaseMs(1))
        assertEquals(11_640L, PlayClock.endlessBaseMs(2))
        assertEquals(4_200L, PlayClock.endlessBaseMs(44))
        assertEquals(4_200L, PlayClock.endlessBaseMs(80))
    }

    @Test
    fun diffsMatchJs() {
        assertEquals(3, Diffs.disciple.lives)
        assertEquals(2, Diffs.watchman.lives)
        assertEquals(0.85, Diffs.disciple.score)
        assertEquals(1.0, Diffs.watchman.score)
        assertEquals(Diffs.watchman, Diffs.resolve("unknown"))
        assertEquals(Diffs.disciple, Diffs.resolve("disciple"))
    }
}
