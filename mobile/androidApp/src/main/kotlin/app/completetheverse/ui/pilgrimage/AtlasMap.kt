package app.completetheverse.ui.pilgrimage

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import app.completetheverse.core.pilgrimage.AtlasRail
import app.completetheverse.core.pilgrimage.PilgrimProgress
import app.completetheverse.core.pilgrimage.Pilgrimage
import app.completetheverse.core.pilgrimage.Site
import app.completetheverse.ui.theme.CtvColors

@Composable
fun AtlasMap(
    sites: List<Site>,
    progress: PilgrimProgress,
    engine: Pilgrimage?,
    currentId: String?,
    onOpenSite: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val plots = remember(sites) { AtlasRail.plots(sites) }
    Canvas(
        modifier
            .fillMaxSize()
            .pointerInput(plots, progress, engine) {
                detectTapGestures { tap ->
                    val nx = if (size.width == 0) 0f else tap.x / size.width
                    val ny = if (size.height == 0) 0f else tap.y / size.height
                    val id = AtlasRail.hit(plots, nx, ny) ?: return@detectTapGestures
                    if (engine?.isUnlocked(progress, id) == true) onOpenSite(id)
                }
            },
    ) {
        if (plots.isEmpty()) return@Canvas
        val path = Path()
        plots.forEachIndexed { i, p ->
            val o = Offset(p.x * size.width, p.y * size.height)
            if (i == 0) path.moveTo(o.x, o.y) else path.lineTo(o.x, o.y)
        }
        drawPath(
            path = path,
            color = CtvColors.gold.copy(alpha = 0.45f),
            style = Stroke(width = 6f, cap = StrokeCap.Round),
        )
        plots.forEach { p ->
            val unlocked = engine?.isUnlocked(progress, p.id) == true
            val cleared = engine?.isCleared(progress, p.id) == true
            val perfect = engine?.recordOf(progress, p.id)?.perfect == true
            val current = p.id == currentId
            val color = when {
                current -> CtvColors.goldHot
                perfect -> CtvColors.azure
                cleared -> CtvColors.green
                unlocked -> CtvColors.gold
                else -> CtvColors.goldDeep
            }
            val r = when {
                current -> 11f
                perfect || cleared -> 8f
                unlocked -> 7f
                else -> 5f
            }
            val center = Offset(p.x * size.width, p.y * size.height)
            if (current) {
                drawCircle(color.copy(alpha = 0.28f), radius = r * 2.2f, center = center)
            }
            drawCircle(color, radius = r, center = center)
            if (perfect) {
                drawCircle(
                    color = CtvColors.goldHot,
                    radius = r + 3f,
                    center = center,
                    style = Stroke(width = 2f),
                )
            }
        }
    }
}
