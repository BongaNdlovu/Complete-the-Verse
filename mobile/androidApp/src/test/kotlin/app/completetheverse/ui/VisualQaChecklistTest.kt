package app.completetheverse.ui

import app.completetheverse.ui.theme.VisualProfile
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class VisualQaChecklistTest {
    @Test
    fun visualProfileGatesVideoAndHeavyFx() {
        val cinematic = VisualProfile(quality = "high", motion = "full", reduced = false)
        assertFalse(cinematic.isReduced)
        assertFalse(cinematic.isCalm)
        assertTrue(cinematic.showHeavyFx)
        assertTrue(cinematic.showVideo)

        val balanced = VisualProfile(quality = "balanced", motion = "full", reduced = false)
        assertTrue(balanced.showVideo)
        assertFalse(balanced.showHeavyFx)

        val low = VisualProfile(quality = "low", motion = "full", reduced = false)
        assertFalse(low.showHeavyFx)
        assertFalse(low.showVideo)

        val reduced = VisualProfile(quality = "high", motion = "reduced", reduced = true)
        assertTrue(reduced.isReduced)
        assertFalse(reduced.isCalm)
        assertFalse(reduced.showHeavyFx)
        assertFalse(reduced.showVideo)

        val calm = VisualProfile(quality = "high", motion = "calm", reduced = false)
        assertTrue(calm.isCalm)
        assertFalse(calm.isReduced)
        assertTrue(calm.showVideo)
        assertTrue(calm.showHeavyFx)

        val system = VisualProfile(quality = "high", motion = "full", reduced = false, systemReduced = true)
        assertTrue(system.isReduced)
        assertFalse(system.showHeavyFx)
        assertFalse(system.showVideo)
    }

    @Test
    fun hallAndIntroFilmsAreBundled() {
        val main = moduleMain()
        val hallMp4 = File(main, "res/raw/hall.mp4")
        val introMp4 = File(main, "res/raw/intro.mp4")
        assertTrue("hall.mp4 missing", hallMp4.isFile)
        assertTrue("intro.mp4 missing", introMp4.isFile)
        assertTrue("hall.mp4 should stay near 549KB", hallMp4.length() in 400_000..800_000)
    }

    private fun moduleMain(): File {
        val candidates = listOf(
            File("src/main"),
            File("androidApp/src/main"),
            File("mobile/androidApp/src/main"),
        )
        return candidates.first { File(it, "kotlin/app/completetheverse").isDirectory }
    }
}
