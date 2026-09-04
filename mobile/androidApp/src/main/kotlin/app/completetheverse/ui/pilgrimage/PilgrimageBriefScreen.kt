package app.completetheverse.ui.pilgrimage

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
import app.completetheverse.core.pilgrimage.SiteBrief
import app.completetheverse.ui.components.Filigree
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun PilgrimageBriefScreen(
    brief: SiteBrief,
    canBegin: Boolean,
    onBegin: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val clockSec = brief.clockMs / 1000.0
    val clockLabel = String.format("%.1fs", clockSec)
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
                    Kick(brief.arc?.name ?: "The Pilgrimage")
                    Spacer(Modifier.height(4.dp))
                    GoldHeadline(brief.site.name)
                }
                GhostButton("Road", onClick = onBack)
            }
            Text(
                text = "Site ${brief.ordinal} of ${brief.total}",
                color = CtvColors.gold,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 12.sp,
                letterSpacing = 0.2.em,
                modifier = Modifier.padding(top = 8.dp),
            )
            Filigree()
            HallPanel(
                modifier = Modifier.widthIn(max = 520.dp).fillMaxWidth(),
                cut = 14.dp,
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        text = brief.site.era,
                        color = CtvColors.goldDim,
                        fontFamily = CtvFonts.ui,
                        fontSize = 12.sp,
                        letterSpacing = 0.16.em,
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = "“${brief.site.quote}”",
                        color = CtvColors.parch,
                        fontFamily = CtvFonts.body,
                        fontStyle = FontStyle.Italic,
                        fontSize = 18.sp,
                        lineHeight = 26.sp,
                        textAlign = TextAlign.Center,
                    )
                    if (brief.site.quoteRef.isNotEmpty()) {
                        Text(
                            text = brief.site.quoteRef,
                            color = CtvColors.gold,
                            fontFamily = CtvFonts.ui,
                            fontSize = 12.sp,
                            letterSpacing = 0.12.em,
                            modifier = Modifier.padding(top = 10.dp),
                        )
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
            Text(
                text = "${brief.verses} verses · last assembled · $clockLabel then pace",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 15.sp,
                textAlign = TextAlign.Center,
            )
            if (brief.cleared) {
                Text(
                    text = "Already cleared — walk it again if you will.",
                    color = CtvColors.green,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 8.dp),
                    textAlign = TextAlign.Center,
                )
            }
            Spacer(Modifier.height(28.dp))
            GoldButton(
                text = if (brief.cleared) "Walk it again" else "Begin",
                onClick = { if (canBegin) onBegin() },
            )
            Spacer(Modifier.height(24.dp))
        }
    }
}
