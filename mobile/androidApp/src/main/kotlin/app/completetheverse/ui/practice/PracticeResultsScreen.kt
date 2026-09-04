package app.completetheverse.ui.practice

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
import app.completetheverse.core.srs.SrsCard
import app.completetheverse.ui.components.Filigree
import app.completetheverse.ui.components.GoldButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

data class PracticeResults(
    val correct: Int,
    val attempts: Int,
    val elapsedMs: Long,
    val cards: List<SrsCard>,
    val dueCount: Int,
)

@Composable
fun PracticeResultsScreen(
    results: PracticeResults,
    onHall: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val acc = if (results.attempts == 0) 0 else (results.correct * 100) / results.attempts
    val backTomorrow = results.cards.count { it.reps == 0 }
    val furthest = results.cards.maxOfOrNull { it.ivl } ?: 1
    val seconds = results.elapsedMs / 1000.0
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
                    Kick("The drill is finished")
                    Spacer(Modifier.height(4.dp))
                    GoldHeadline("The Record")
                }
            }
            Filigree()
            HallPanel(
                modifier = Modifier.widthIn(max = 520.dp).fillMaxWidth(),
                cut = 14.dp,
            ) {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 18.dp)) {
                    StatRow("Verses kept", "${results.correct} / ${results.attempts}")
                    StatRow("Accuracy", "$acc%")
                    StatRow("Time", String.format("%.1fs", seconds))
                    StatRow("Questions", results.attempts.toString())
                }
            }
            Spacer(Modifier.height(16.dp))
            HallPanel(
                modifier = Modifier.widthIn(max = 520.dp).fillMaxWidth(),
                cut = 14.dp,
            ) {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 18.dp)) {
                    Text(
                        text = "NEXT REVIEW",
                        color = CtvColors.gold,
                        fontFamily = CtvFonts.display,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        letterSpacing = 0.18.em,
                        modifier = Modifier.padding(bottom = 10.dp),
                    )
                    StatRow("Verses rescheduled", results.cards.size.toString())
                    StatRow("Back tomorrow", backTomorrow.toString())
                    StatRow("Longest gap, in days", furthest.coerceAtLeast(1).toString())
                    Text(
                        text = "Due today: ${results.dueCount} verses.",
                        color = CtvColors.parchDim,
                        fontFamily = CtvFonts.body,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(top = 10.dp),
                    )
                }
            }
            Spacer(Modifier.height(28.dp))
            GoldButton("Return to the hall", onClick = onHall)
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun StatRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
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
