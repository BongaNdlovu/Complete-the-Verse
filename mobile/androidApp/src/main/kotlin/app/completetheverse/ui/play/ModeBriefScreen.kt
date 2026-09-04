package app.completetheverse.ui.play

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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.play.Diff
import app.completetheverse.core.play.Diffs
import app.completetheverse.ui.components.Filigree
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.hall.HallMode
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun ModeBriefScreen(
    mode: HallMode,
    diff: Diff,
    onDiff: (Diff) -> Unit,
    versesReady: Boolean,
    loadError: String?,
    canBegin: Boolean,
    dailyPractise: Boolean,
    onBegin: () -> Unit,
    onTeamStart: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val team = mode.key == "team"
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
                    Kick(mode.kick)
                    Spacer(Modifier.height(4.dp))
                    GoldHeadline(mode.name)
                }
                GhostButton("Hall", onClick = onBack)
            }
            Spacer(Modifier.height(18.dp))
            Filigree()
            Text(
                text = mode.desc,
                modifier = Modifier.widthIn(max = 480.dp).padding(horizontal = 8.dp),
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 18.sp,
                lineHeight = 26.sp,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(12.dp))
            Text(
                text = mode.tagline.uppercase(),
                color = CtvColors.gold,
                fontFamily = CtvFonts.ui,
                fontSize = 13.sp,
                letterSpacing = 0.2.em,
                textAlign = TextAlign.Center,
            )
            if (dailyPractise) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Today's score already stands — this run is practise.",
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 15.sp,
                    textAlign = TextAlign.Center,
                )
            }
            Spacer(Modifier.height(22.dp))
            Text(
                text = "THE ORDEAL",
                color = CtvColors.gold,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                letterSpacing = 0.24.em,
            )
            Spacer(Modifier.height(12.dp))
            Column(
                modifier = Modifier.widthIn(max = 520.dp).fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                listOf(Diffs.disciple, Diffs.watchman).forEach { option ->
                    DiffCard(option, selected = option.key == diff.key, onClick = { onDiff(option) })
                }
            }
            Spacer(Modifier.height(10.dp))
            Text(
                text = when {
                    !versesReady -> "Loading the bank…"
                    loadError != null -> loadError
                    else -> "${diff.lives} lamps · clock ×${"%.2f".format(diff.time)}"
                },
                color = if (loadError != null) CtvColors.bloodHot else CtvColors.goldDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 15.sp,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(28.dp))
            if (team) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    GoldButton("White starts", onClick = { if (canBegin) onTeamStart("white") }, small = true)
                    GoldButton("Blue starts", onClick = { if (canBegin) onTeamStart("blue") }, small = true)
                }
            } else {
                GoldButton(
                    text = if (dailyPractise) "Practise" else "Begin",
                    onClick = { if (canBegin) onBegin() },
                )
            }
            if (!canBegin) {
                Text(
                    text = if (!versesReady) "Wait for the bank." else "This mode cannot start.",
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 12.dp),
                )
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun DiffCard(diff: Diff, selected: Boolean, onClick: () -> Unit) {
    HallPanel(cut = 12.dp, incoming = !selected, onClick = onClick) {
        Column(Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
            Text(
                text = diff.name.uppercase(),
                color = CtvColors.goldHot,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                letterSpacing = 0.16.em,
            )
            Text(
                text = diff.desc,
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontSize = 14.sp,
                modifier = Modifier.padding(top = 4.dp),
            )
            Text(
                text = "${diff.lives} lamps · clock ×${"%.2f".format(diff.time)}",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 11.sp,
                letterSpacing = 0.16.em,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
    }
}
