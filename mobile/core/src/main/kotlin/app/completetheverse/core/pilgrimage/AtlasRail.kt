package app.completetheverse.core.pilgrimage

data class AtlasPlot(
    val id: String,
    val x: Float,
    val y: Float,
)

object AtlasRail {
    fun plots(sites: List<Site>, pad: Float = 0.08f): List<AtlasPlot> {
        if (sites.isEmpty()) return emptyList()
        val lats = sites.map { it.lat }
        val lngs = sites.map { it.lng }
        val minLat = lats.minOrNull() ?: 0.0
        val maxLat = lats.maxOrNull() ?: 0.0
        val minLng = lngs.minOrNull() ?: 0.0
        val maxLng = lngs.maxOrNull() ?: 0.0
        val dLat = (maxLat - minLat).coerceAtLeast(0.001)
        val dLng = (maxLng - minLng).coerceAtLeast(0.001)
        val usable = (1f - 2f * pad).coerceAtLeast(0.2f)
        return sites.map { site ->
            val nx = ((site.lng - minLng) / dLng).toFloat()
            val ny = (1.0 - (site.lat - minLat) / dLat).toFloat()
            AtlasPlot(
                id = site.id,
                x = pad + nx * usable,
                y = pad + ny * usable,
            )
        }
    }

    fun hit(plots: List<AtlasPlot>, nx: Float, ny: Float, radius: Float = 0.055f): String? {
        var bestId: String? = null
        var best = radius * radius
        for (p in plots) {
            val dx = p.x - nx
            val dy = p.y - ny
            val d = dx * dx + dy * dy
            if (d <= best) {
                best = d
                bestId = p.id
            }
        }
        return bestId
    }
}
