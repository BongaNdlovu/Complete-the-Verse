package app.completetheverse.ui.relics

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import app.completetheverse.core.pilgrimage.Artifact
import app.completetheverse.core.pilgrimage.ArtifactStore
import app.completetheverse.core.pilgrimage.Artifacts
import app.completetheverse.core.pilgrimage.Site
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.HallScreenHeader
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun RelicsScreen(
    store: ArtifactStore,
    sites: List<Site>,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var inspectId by rememberSaveable { mutableStateOf<String?>(null) }
    val unlocked = Artifacts.unlockedCount(store)
    val total = Artifacts.count()
    val names = sites.associate { it.id to it.name }
    val inspect = inspectId?.let { Artifacts.byId(it) }?.takeIf { Artifacts.isUnlocked(store, it.id) }
    Box(modifier.fillMaxSize()) {
        HallBackdrop()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            HallScreenHeader(
                kick = "The Reliquary",
                title = "Historical Artifacts",
                onBack = onBack,
            )
            Text(
                text = "$unlocked of $total recovered",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 12.sp,
                letterSpacing = 0.16.em,
                modifier = Modifier
                    .widthIn(max = 720.dp)
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
            )
            if (unlocked == 0) {
                Text(
                    text = "No relics recovered yet — walk the road from Ur to Patmos to uncover sacred artifacts.",
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 16.sp,
                    modifier = Modifier
                        .widthIn(max = 720.dp)
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                )
            }
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 148.dp),
                modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 12.dp),
            ) {
                items(Artifacts.all, key = { it.id }) { artifact ->
                    val open = Artifacts.isUnlocked(store, artifact.id)
                    RelicCard(
                        artifact = artifact,
                        unlocked = open,
                        siteName = names[artifact.siteId] ?: artifact.siteId,
                        onClick = { if (open) inspectId = artifact.id },
                    )
                }
            }
        }
        if (inspect != null) {
            RelicInspectDialog(
                artifact = inspect,
                siteName = names[inspect.siteId] ?: inspect.siteId,
                onDismiss = { inspectId = null },
            )
        }
    }
}

@Composable
private fun RelicCard(
    artifact: Artifact,
    unlocked: Boolean,
    siteName: String,
    onClick: () -> Unit,
) {
    HallPanel(
        modifier = Modifier.fillMaxWidth().defaultMinSize(minHeight = 44.dp),
        cut = 12.dp,
        incoming = !unlocked,
        onClick = onClick,
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f),
            ) {
                if (unlocked) {
                    RelicImage(
                        artifactId = artifact.id,
                        contentDescription = artifact.name,
                        modifier = Modifier.fillMaxSize(),
                    )
                } else {
                    RelicPlaceholder()
                }
            }
            Text(
                text = (if (unlocked) artifact.name else "Sealed").uppercase(),
                color = CtvColors.goldHot,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                letterSpacing = 0.08.em,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 10.dp),
            )
            Text(
                text = if (unlocked) artifact.era else siteName,
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 4.dp).alpha(if (unlocked) 1f else 0.85f),
            )
        }
    }
}

@Composable
private fun RelicInspectDialog(
    artifact: Artifact,
    siteName: String,
    onDismiss: () -> Unit,
) {
    Dialog(onDismissRequest = onDismiss) {
        HallPanel(cut = 14.dp, modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 22.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Kick("Relic recovered")
                RelicImage(
                    artifactId = artifact.id,
                    contentDescription = artifact.name,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .padding(top = 12.dp),
                )
                GoldHeadline(artifact.name, modifier = Modifier.padding(top = 12.dp))
                Text(
                    text = artifact.era,
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.ui,
                    fontSize = 12.sp,
                    letterSpacing = 0.12.em,
                    modifier = Modifier.padding(top = 6.dp),
                )
                Text(
                    text = artifact.blurb,
                    color = CtvColors.parch,
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 12.dp),
                )
                Text(
                    text = "$siteName  ·  ${artifact.scripture}",
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 10.dp, bottom = 18.dp),
                )
                GhostButton("Done", onClick = onDismiss)
            }
        }
    }
}
