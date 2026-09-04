package app.completetheverse.ui.hall

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.R
import app.completetheverse.ui.components.CloudChip
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HallScreen(
    onMode: (HallMode) -> Unit,
    onSubnav: (HallSubnav) -> Unit,
    modifier: Modifier = Modifier,
) {
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
            Kick("King James Version  ·  66 Books  ·  One final answer")
            Image(
                painter = painterResource(R.drawable.logo),
                contentDescription = "Complete the Verse",
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .fillMaxWidth(0.68f)
                    .widthIn(max = 352.dp)
                    .padding(top = 8.dp),
            )
            Text(
                text = "The words appear. One phrase is taken away. Complete it before the final second falls.",
                modifier = Modifier
                    .widthIn(max = 520.dp)
                    .padding(top = 8.dp, bottom = 12.dp),
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 17.sp,
                lineHeight = 26.sp,
                textAlign = TextAlign.Center,
            )
            CloudChip("Local only")
            Spacer(Modifier.height(22.dp))
            BoxWithConstraints(Modifier.fillMaxWidth()) {
                val twoCol = maxWidth >= 560.dp
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(28.dp),
                ) {
                    MENU_GROUPS.forEach { group ->
                        val modes = visibleGroupModes(group)
                        if (modes.isNotEmpty()) {
                            ModeGroupBlock(group, modes, twoCol, onMode)
                        }
                    }
                    val orphans = orphanMenuModes()
                    if (orphans.isNotEmpty()) {
                        ModeCards(orphans, twoCol = twoCol, quiet = false, onMode = onMode)
                    }
                }
            }
            Spacer(Modifier.height(28.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                HALL_SUBNAV.forEach { item ->
                    GhostButton(item.label, onClick = { onSubnav(item) })
                }
            }
            Text(
                text = "all 66 books · King James Version",
                modifier = Modifier.padding(top = 18.dp, bottom = 12.dp),
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.ui,
                fontSize = 12.sp,
                letterSpacing = 0.12.em,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun ModeGroupBlock(
    group: HallModeGroup,
    modes: List<HallMode>,
    twoCol: Boolean,
    onMode: (HallMode) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(
                text = group.name.uppercase(),
                color = if (group.quiet) CtvColors.goldDim else CtvColors.gold,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = if (group.quiet) 11.sp else 13.sp,
                letterSpacing = 0.24.em,
            )
            Box(
                Modifier
                    .weight(1f)
                    .height(1.dp)
                    .background(CtvColors.gold.copy(alpha = 0.35f)),
            )
        }
        ModeCards(modes, twoCol = twoCol, quiet = group.quiet, onMode = onMode)
    }
}

@Composable
private fun ModeCards(
    modes: List<HallMode>,
    twoCol: Boolean,
    quiet: Boolean,
    onMode: (HallMode) -> Unit,
) {
    if (twoCol) {
        modes.chunked(2).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                row.forEach { mode ->
                    ModeCard(mode, quiet, onMode, Modifier.weight(1f))
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    } else {
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            modes.forEach { ModeCard(it, quiet, onMode, Modifier.fillMaxWidth()) }
        }
    }
}

@Composable
private fun ModeCard(
    mode: HallMode,
    quiet: Boolean,
    onMode: (HallMode) -> Unit,
    modifier: Modifier = Modifier,
) {
    HallPanel(
        modifier = modifier,
        incoming = mode.incoming,
        onClick = { onMode(mode) },
    ) {
        Box(Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.padding(
                    start = 18.dp,
                    top = 22.dp,
                    end = 18.dp,
                    bottom = if (quiet) 16.dp else 18.dp,
                ),
            ) {
                Text(
                    text = mode.name.uppercase(),
                    color = CtvColors.goldHot,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    letterSpacing = 0.18.em,
                    modifier = Modifier.padding(end = 72.dp, bottom = if (quiet) 0.dp else 8.dp),
                )
                if (!quiet) {
                    Text(
                        text = mode.desc,
                        color = CtvColors.parchDim,
                        fontFamily = CtvFonts.body,
                        fontSize = 15.sp,
                        lineHeight = 22.sp,
                    )
                }
                Text(
                    text = (if (mode.incoming) "Incoming" else mode.tagline).uppercase(),
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.ui,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 11.sp,
                    letterSpacing = 0.2.em,
                    modifier = Modifier.padding(top = if (quiet) 10.dp else 14.dp),
                )
            }
            if (mode.incoming) {
                Text(
                    text = "INCOMING",
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(top = 14.dp, end = 14.dp)
                        .background(CtvColors.gold.copy(alpha = 0.14f))
                        .border(1.dp, CtvColors.edge)
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    color = CtvColors.goldHot,
                    fontFamily = CtvFonts.ui,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 10.sp,
                    letterSpacing = 0.16.em,
                )
            }
        }
    }
}
