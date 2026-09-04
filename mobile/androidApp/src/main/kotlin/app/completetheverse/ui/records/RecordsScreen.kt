package app.completetheverse.ui.records

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.records.BlitzBoardRow
import app.completetheverse.core.records.RecordStats
import app.completetheverse.core.records.Records
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.HallScreenHeader
import app.completetheverse.ui.components.SegControl
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

private enum class RecordsTab { Life, Bests, Blitz }

@Composable
fun RecordsScreen(
    save: SaveBlob,
    signedIn: Boolean,
    onFetchBlitzBoard: suspend (Int) -> List<BlitzBoardRow>,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var tab by rememberSaveable { mutableStateOf(RecordsTab.Life.name) }
    val current = runCatching { RecordsTab.valueOf(tab) }.getOrDefault(RecordsTab.Life)
    var board by remember { mutableStateOf<List<BlitzBoardRow>>(emptyList()) }
    var boardStatus by remember { mutableStateOf<String?>(null) }
    val stats = Records.stats(save)

    LaunchedEffect(signedIn, current) {
        if (current != RecordsTab.Blitz) return@LaunchedEffect
        if (!signedIn) {
            board = emptyList()
            boardStatus = "Sign in to see the global Blitz board."
            return@LaunchedEffect
        }
        boardStatus = "Loading…"
        board = try {
            val rows = onFetchBlitzBoard(25)
            boardStatus = if (rows.isEmpty()) "No scores yet." else null
            rows
        } catch (_: Exception) {
            boardStatus = "Could not reach the board."
            emptyList()
        }
    }

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
                kick = "Records",
                title = "The Chronicle",
                onBack = onBack,
            )
            SegControl(
                options = listOf(
                    RecordsTab.Life.name to "Lifetime",
                    RecordsTab.Bests.name to "Bests",
                    RecordsTab.Blitz.name to "Blitz",
                ),
                selected = current.name,
                onSelect = { tab = it },
                modifier = Modifier
                    .widthIn(max = 720.dp)
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
            )
            Column(
                modifier = Modifier
                    .widthIn(max = 720.dp)
                    .fillMaxWidth()
                    .weight(1f)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                when (current) {
                    RecordsTab.Life -> LifeGrid(stats)
                    RecordsTab.Bests -> BestsGrid(stats)
                    RecordsTab.Blitz -> BlitzBoard(
                        signedIn = signedIn,
                        rows = board,
                        status = boardStatus,
                        localBest = stats.localBlitzBest,
                    )
                }
            }
        }
    }
}

@Composable
private fun LifeGrid(stats: RecordStats) {
    StatGrid(
        listOf(
            stats.xp.toString() to "Total XP",
            stats.runs.toString() to "Runs",
            stats.correct.toString() to "Verses kept",
            "${stats.accuracy}%" to "Lifetime accuracy",
            stats.bestStreak.toString() to "Best streak",
            stats.attempts.toString() to "Attempts",
            stats.sitesCleared.toString() to "Sites cleared",
            stats.tabletHolds.toString() to "Tablet holds",
            stats.dailyDone.toString() to "Dailies completed",
        ),
    )
}

@Composable
private fun BestsGrid(stats: RecordStats) {
    StatGrid(
        listOf(
            stats.trialBest.toString() to "Trial best",
            stats.endlessBest.toString() to "Endless best",
            stats.dailyBest.toString() to "Daily best",
            stats.practiceBest.toString() to "Practice best",
            stats.pilgrimageBest.toString() to "Pilgrimage best",
            stats.blitzBest.toString() to "Blitz best",
            stats.tabletsBest.toString() to "Tablets best",
        ),
    )
}

@Composable
private fun StatGrid(cells: List<Pair<String, String>>) {
    cells.chunked(2).forEach { row ->
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            row.forEach { (value, label) ->
                StatBox(value, label, Modifier.weight(1f))
            }
            if (row.size == 1) Box(Modifier.weight(1f))
        }
    }
}

@Composable
private fun StatBox(value: String, label: String, modifier: Modifier = Modifier) {
    HallPanel(modifier = modifier, cut = 12.dp) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = 44.dp)
                .padding(horizontal = 14.dp, vertical = 16.dp),
        ) {
            Text(
                text = value,
                color = CtvColors.goldHot,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 22.sp,
            )
            Text(
                text = label.uppercase(),
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 11.sp,
                letterSpacing = 0.16.em,
                modifier = Modifier.padding(top = 6.dp),
            )
        }
    }
}

@Composable
private fun BlitzBoard(
    signedIn: Boolean,
    rows: List<BlitzBoardRow>,
    status: String?,
    localBest: Int,
) {
    if (!signedIn) {
        Text(
            text = "Sign in to see the global Blitz board. Your local best is $localBest verses.",
            color = CtvColors.parchDim,
            fontFamily = CtvFonts.body,
            fontStyle = FontStyle.Italic,
            fontSize = 16.sp,
        )
        return
    }
    Text(
        text = "Blitz global",
        color = CtvColors.goldDim,
        fontFamily = CtvFonts.ui,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp,
        letterSpacing = 0.16.em,
    )
    if (status != null) {
        Text(
            text = status,
            color = CtvColors.parchDim,
            fontFamily = CtvFonts.body,
            fontStyle = FontStyle.Italic,
            fontSize = 16.sp,
        )
    }
    rows.forEach { row ->
        HallPanel(modifier = Modifier.fillMaxWidth(), cut = 10.dp) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .defaultMinSize(minHeight = 44.dp)
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    text = row.rank.toString(),
                    color = CtvColors.goldHot,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    modifier = Modifier.widthIn(min = 28.dp),
                )
                Text(
                    text = row.name + if (row.mine) " · you" else "",
                    color = CtvColors.parch,
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    text = "${row.score} verses" +
                        (row.survivedMs?.let { " · ${it / 1000}s" } ?: ""),
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.ui,
                    fontSize = 12.sp,
                    letterSpacing = 0.08.em,
                )
            }
        }
    }
}
