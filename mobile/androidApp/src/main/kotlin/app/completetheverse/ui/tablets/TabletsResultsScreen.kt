package app.completetheverse.ui.tablets

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.tablets.Tablets
import app.completetheverse.core.tablets.TabletsResult
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun TabletsResultsScreen(
    result: TabletsResult,
    onRetry: () -> Unit,
    onNext: () -> Unit,
    onLibrary: () -> Unit,
    onHall: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val rec = Tablets.recordOf(result.save, result.chapter.id)
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
                    Kick(result.kick)
                    Spacer(Modifier.height(4.dp))
                    GoldHeadline(if (result.held) "Held" else "Shattered")
                }
                GhostButton("Hall", onClick = onHall)
            }
            HallPanel(
                modifier = Modifier.widthIn(max = 520.dp).fillMaxWidth(),
                cut = 14.dp,
            ) {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 18.dp)) {
                    Text(
                        text = result.chapter.name.uppercase(),
                        color = CtvColors.gold,
                        fontFamily = CtvFonts.display,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        letterSpacing = 0.18.em,
                        modifier = Modifier.padding(bottom = 10.dp),
                    )
                    StatRow("Words carved", "${result.correct} / ${result.chapter.blanks.size}")
                    StatRow("Hold", if (result.held) "Held" else "Shattered")
                    StatRow("Chapter best", "${rec.best}%")
                    StatRow("Favor", result.favor.toString())
                }
            }
            Spacer(Modifier.height(28.dp))
            GoldButton("Carve again", onClick = onRetry)
            val nxt = result.next
            if (result.held && nxt != null) {
                Spacer(Modifier.height(12.dp))
                GoldButton("Next · ${nxt.name}", onClick = onNext, small = true)
            }
            Spacer(Modifier.height(12.dp))
            GhostButton("The hall library", onClick = onLibrary)
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun StatRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            color = CtvColors.parchDim,
            fontFamily = CtvFonts.body,
            fontSize = 16.sp,
        )
        Text(
            text = value,
            color = CtvColors.goldHot,
            fontFamily = CtvFonts.display,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            textAlign = TextAlign.End,
        )
    }
}
