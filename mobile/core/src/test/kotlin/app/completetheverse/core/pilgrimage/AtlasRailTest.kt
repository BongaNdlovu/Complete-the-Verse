package app.completetheverse.core.pilgrimage

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class AtlasRailTest {
    private val ur = Site(id = "ur", name = "Ur", arc = "begin", coords = listOf(30.96, 46.10))
    private val haran = Site(id = "haran", name = "Haran", arc = "begin", coords = listOf(36.86, 39.03))
    private val patmos = Site(id = "patmos", name = "Patmos", arc = "end", coords = listOf(37.32, 26.54))

    @Test
    fun plotsKeepNorthUpAndWestLeft() {
        val plots = AtlasRail.plots(listOf(ur, haran, patmos), pad = 0.1f)
        val byId = plots.associateBy { it.id }
        assertTrue(byId.getValue("ur").x > byId.getValue("patmos").x)
        assertTrue(byId.getValue("ur").y > byId.getValue("haran").y)
        assertTrue(plots.all { it.x in 0f..1f && it.y in 0f..1f })
    }

    @Test
    fun hitReturnsNearestPlotWithinRadius() {
        val plots = AtlasRail.plots(listOf(ur, haran), pad = 0.1f)
        val first = plots.first()
        assertEquals(first.id, AtlasRail.hit(plots, first.x, first.y))
        assertNull(AtlasRail.hit(plots, 0.5f, 0.5f, radius = 0.001f))
    }
}
