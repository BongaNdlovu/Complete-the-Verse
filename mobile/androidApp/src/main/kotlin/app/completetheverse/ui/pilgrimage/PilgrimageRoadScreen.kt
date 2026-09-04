package app.completetheverse.ui.pilgrimage

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.pilgrimage.Arc
import app.completetheverse.core.pilgrimage.Artifact
import app.completetheverse.core.pilgrimage.PilgrimProgress
import app.completetheverse.core.pilgrimage.Pilgrimage
import app.completetheverse.core.pilgrimage.Site
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun PilgrimageRoadScreen(
    engine: Pilgrimage?,
    progress: PilgrimProgress,
    relics: List<Artifact>,
    versesReady: Boolean,
    loadError: String?,
    onOpenSite: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val sites = engine?.journey().orEmpty()
    val arcs = engine?.arcs().orEmpty()
    val cleared = engine?.clearedCount(progress) ?: 0
    val total = engine?.count() ?: 46
    val current = engine?.currentSite(progress)
    Box(modifier.fillMaxSize()) {
        HallBackdrop()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            RoadHeader(onBack = onBack)
            if (!versesReady) {
                Text(
                    text = "Loading the road…",
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    modifier = Modifier.padding(top = 24.dp),
                )
            } else if (loadError != null) {
                Text(
                    text = loadError,
                    color = CtvColors.bloodHot,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    modifier = Modifier.padding(top = 24.dp),
                )
            } else {
                Text(
                    text = "$cleared / $total sites cleared",
                    color = CtvColors.gold,
                    fontFamily = CtvFonts.ui,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp,
                    letterSpacing = 0.18.em,
                    modifier = Modifier.padding(top = 8.dp, bottom = 14.dp),
                )
                AtlasPlot(
                    sites = sites,
                    progress = progress,
                    engine = engine,
                    currentId = current?.id,
                    modifier = Modifier
                        .widthIn(max = 640.dp)
                        .fillMaxWidth()
                        .height(220.dp),
                )
                Spacer(Modifier.height(18.dp))
                arcs.forEach { arc ->
                    ArcBlock(
                        arc = arc,
                        sites = engine?.sitesInArc(arc.key).orEmpty(),
                        engine = engine,
                        progress = progress,
                        onOpenSite = onOpenSite,
                    )
                    Spacer(Modifier.height(18.dp))
                }
                if (relics.isNotEmpty()) {
                    RelicList(relics)
                }
                Spacer(Modifier.height(12.dp))
            }
        }
    }
}

@Composable
private fun RoadHeader(onBack: () -> Unit) {
    Row(
        modifier = Modifier
            .widthIn(max = 640.dp)
            .fillMaxWidth()
            .drawBehind {
                drawLine(
                    color = CtvColors.edge,
                    start = Offset(0f, size.height),
                    end = Offset(size.width, size.height),
                    strokeWidth = 1.dp.toPx(),
                )
            }
            .padding(bottom = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f).padding(end = 12.dp)) {
            Kick("The long road")
            Spacer(Modifier.height(4.dp))
            GoldHeadline("The Pilgrimage")
        }
        GhostButton("Hall", onClick = onBack)
    }
}

@Composable
private fun AtlasPlot(
    sites: List<Site>,
    progress: PilgrimProgress,
    engine: Pilgrimage?,
    currentId: String?,
    modifier: Modifier = Modifier,
) {
    HallPanel(modifier = modifier, cut = 12.dp) {
        if (sites.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("The atlas is empty.", color = CtvColors.parchDim, fontFamily = CtvFonts.body)
            }
            return@HallPanel
        }
        val minLat = sites.minOf { it.lat }
        val maxLat = sites.maxOf { it.lat }
        val minLng = sites.minOf { it.lng }
        val maxLng = sites.maxOf { it.lng }
        val latSpan = (maxLat - minLat).let { if (it < 0.01) 1.0 else it }
        val lngSpan = (maxLng - minLng).let { if (it < 0.01) 1.0 else it }
        Canvas(Modifier.fillMaxSize().padding(16.dp)) {
            val pad = 10f
            fun xOf(lng: Double): Float =
                pad + ((lng - minLng) / lngSpan).toFloat() * (size.width - pad * 2)
            fun yOf(lat: Double): Float =
                pad + (1f - ((lat - minLat) / latSpan).toFloat()) * (size.height - pad * 2)
            val path = Path()
            sites.forEachIndexed { i, s ->
                val p = Offset(xOf(s.lng), yOf(s.lat))
                if (i == 0) path.moveTo(p.x, p.y) else path.lineTo(p.x, p.y)
            }
            drawPath(
                path = path,
                color = CtvColors.gold.copy(alpha = 0.35f),
                style = Stroke(width = 2.5f, cap = StrokeCap.Round),
            )
            sites.forEach { s ->
                val unlocked = engine?.isUnlocked(progress, s.id) == true
                val cleared = engine?.isCleared(progress, s.id) == true
                val current = s.id == currentId
                val color = when {
                    current -> CtvColors.goldHot
                    cleared -> CtvColors.green
                    unlocked -> CtvColors.gold
                    else -> CtvColors.goldDeep
                }
                val r = if (current) 6.5f else if (cleared) 4.5f else 3.5f
                drawCircle(color, radius = r, center = Offset(xOf(s.lng), yOf(s.lat)))
            }
        }
    }
}

@Composable
private fun ArcBlock(
    arc: Arc,
    sites: List<Site>,
    engine: Pilgrimage?,
    progress: PilgrimProgress,
    onOpenSite: (String) -> Unit,
) {
    val status = engine?.arcStatus(progress, arc.key)
    Column(
        modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(
                text = "ARC ${arc.n}  ${arc.name.uppercase()}".trim(),
                color = CtvColors.gold,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                letterSpacing = 0.2.em,
            )
            Box(
                Modifier
                    .weight(1f)
                    .height(1.dp)
                    .background(CtvColors.gold.copy(alpha = 0.35f)),
            )
            Text(
                text = "${status?.cleared ?: 0}/${status?.total ?: sites.size}",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 11.sp,
                letterSpacing = 0.12.em,
            )
        }
        sites.forEachIndexed { i, site ->
            val idx = engine?.indexOf(site.id) ?: i
            val unlocked = engine?.isUnlocked(progress, site.id) == true
            val cleared = engine?.isCleared(progress, site.id) == true
            SiteRow(
                ordinal = idx + 1,
                site = site,
                unlocked = unlocked,
                cleared = cleared,
                onClick = { if (unlocked) onOpenSite(site.id) },
            )
        }
    }
}

@Composable
private fun SiteRow(
    ordinal: Int,
    site: Site,
    unlocked: Boolean,
    cleared: Boolean,
    onClick: () -> Unit,
) {
    val label = when {
        cleared -> "Cleared"
        unlocked -> "Next"
        else -> "Locked"
    }
    HallPanel(
        modifier = Modifier
            .fillMaxWidth()
            .alpha(if (unlocked) 1f else 0.48f),
        cut = 12.dp,
        onClick = if (unlocked) onClick else null,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = ordinal.toString().padStart(2, '0'),
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp,
            )
            Column(Modifier.weight(1f)) {
                Text(
                    text = site.name,
                    color = CtvColors.goldHot,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    letterSpacing = 0.08.em,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = site.era,
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 13.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            Text(
                text = label.uppercase(),
                color = if (cleared) CtvColors.green else if (unlocked) CtvColors.gold else CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 10.sp,
                letterSpacing = 0.16.em,
            )
        }
    }
}

@Composable
private fun RelicList(relics: List<Artifact>) {
    Column(
        modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(
            text = "RELICS  ${relics.size}/46",
            color = CtvColors.gold,
            fontFamily = CtvFonts.display,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            letterSpacing = 0.2.em,
        )
        relics.forEach { a ->
            Text(
                text = a.name,
                color = CtvColors.parch,
                fontFamily = CtvFonts.body,
                fontSize = 15.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CtvColors.edge)
                    .padding(horizontal = 14.dp, vertical = 10.dp),
            )
        }
    }
}
