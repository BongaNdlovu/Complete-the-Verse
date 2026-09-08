package app.completetheverse.ui.pilgrimage

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import android.graphics.BitmapFactory
import app.completetheverse.ui.audio.CtvMedia
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
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
    liveWeather: Boolean = true,
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
                AtlasLeafletView(
                    sites = sites,
                    progress = progress,
                    engine = engine,
                    currentId = current?.id,
                    onOpenSite = onOpenSite,
                    modifier = Modifier
                        .widthIn(max = 720.dp)
                        .fillMaxWidth()
                        .height(420.dp),
                )
                if (current != null) {
                    Spacer(Modifier.height(14.dp))
                    SiteDossier(
                        site = current,
                        liveWeather = liveWeather,
                    )
                }
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
        val currentId = engine?.currentSite(progress)?.id
        sites.forEachIndexed { i, site ->
            val idx = engine?.indexOf(site.id) ?: i
            val unlocked = engine?.isUnlocked(progress, site.id) == true
            val cleared = engine?.isCleared(progress, site.id) == true
            val perfect = engine?.recordOf(progress, site.id)?.perfect == true
            SiteRow(
                ordinal = idx + 1,
                site = site,
                unlocked = unlocked,
                cleared = cleared,
                current = site.id == currentId,
                perfect = perfect,
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
    current: Boolean,
    perfect: Boolean,
    onClick: () -> Unit,
) {
    val label = when {
        perfect -> "Perfect"
        cleared -> "Cleared"
        current && unlocked -> "Here"
        unlocked -> "Next"
        else -> "Locked"
    }
    HallPanel(
        modifier = Modifier
            .fillMaxWidth()
            .alpha(if (unlocked) 1f else 0.48f)
            .then(
                if (current && unlocked) Modifier.border(1.dp, CtvColors.goldHot)
                else Modifier
            ),
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
                color = when {
                    perfect -> CtvColors.azure
                    cleared -> CtvColors.green
                    current && unlocked -> CtvColors.goldHot
                    unlocked -> CtvColors.gold
                    else -> CtvColors.goldDim
                },
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

@Composable
private fun SiteDossier(site: Site, liveWeather: Boolean) {
    HallPanel(
        modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
        cut = 12.dp,
    ) {
        Column(Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
            JourneyStill(site.id)
            Text(
                text = site.name.uppercase(),
                color = CtvColors.goldHot,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                letterSpacing = 0.12.em,
                modifier = Modifier.padding(top = 10.dp),
            )
            Text(
                text = site.era,
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 12.sp,
                letterSpacing = 0.12.em,
                modifier = Modifier.padding(top = 4.dp),
            )
            if (site.quote.isNotEmpty()) {
                Text(
                    text = "“${site.quote}”",
                    color = CtvColors.parch,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 16.sp,
                    modifier = Modifier.padding(top = 10.dp),
                )
            }
            WeatherLine(lat = site.lat, lng = site.lng, enabled = liveWeather)
        }
    }
}

@Composable
private fun JourneyStill(siteId: String) {
    val bmp by produceState<androidx.compose.ui.graphics.ImageBitmap?>(initialValue = null, siteId) {
        value = withContext(Dispatchers.IO) {
            try {
                val conn = URL(CtvMedia.journeyStill(siteId)).openConnection() as HttpURLConnection
                conn.connectTimeout = 6000
                conn.readTimeout = 6000
                conn.inputStream.use { BitmapFactory.decodeStream(it)?.asImageBitmap() }
            } catch (_: Exception) {
                null
            }
        }
    }
    val image = bmp
    if (image != null) {
        Image(
            bitmap = image,
            contentDescription = siteId,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxWidth().height(140.dp),
        )
    }
}

@Composable
private fun WeatherLine(lat: Double, lng: Double, enabled: Boolean) {
    val label by produceState(initialValue = if (enabled) "…" else "Typical", lat, lng, enabled) {
        if (!enabled) {
            value = "Typical"
            return@produceState
        }
        value = withContext(Dispatchers.IO) {
            try {
                val url =
                    "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lng&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=UTC"
                val conn = URL(url).openConnection() as HttpURLConnection
                conn.connectTimeout = 6000
                conn.readTimeout = 6000
                val raw = conn.inputStream.bufferedReader().use { it.readText() }
                val temp = Regex("\"temperature_2m\"\\s*:\\s*(-?[0-9.]+)").find(raw)?.groupValues?.get(1)
                val code = Regex("\"weather_code\"\\s*:\\s*([0-9]+)").find(raw)?.groupValues?.get(1)?.toIntOrNull() ?: 0
                val sky = when {
                    code <= 0 -> "Clear sky"
                    code <= 3 -> "Partly cloudy"
                    code <= 48 -> "Fog"
                    code <= 67 -> "Rain"
                    code <= 77 -> "Snow"
                    else -> "Storm"
                }
                if (temp != null) "${temp.toFloat().toInt()}°C · $sky" else "Typical"
            } catch (_: Exception) {
                "Typical"
            }
        }
    }
    Text(
        text = label,
        color = CtvColors.goldDim,
        fontFamily = CtvFonts.ui,
        fontSize = 12.sp,
        modifier = Modifier.padding(top = 10.dp),
    )
}
