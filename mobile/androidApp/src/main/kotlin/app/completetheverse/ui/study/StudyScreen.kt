package app.completetheverse.ui.study

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.srs.Srs
import app.completetheverse.core.study.Study
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.HallScreenHeader
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

private val FILTERS = listOf(
    "all" to "All",
    "due" to "Due",
    "unseen" to "Unseen",
    "lapsing" to "Lapsing",
    "learning" to "Learning",
    "held" to "Held",
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun StudyScreen(
    verses: List<Verse>,
    versesReady: Boolean,
    loadError: String?,
    save: SaveBlob,
    onReview: (Verse) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var query by rememberSaveable { mutableStateOf("") }
    var filter by rememberSaveable { mutableStateOf("all") }
    val today = Srs.dayNumber()
    val due = Study.dueCount(verses, save, today)
    val rows = verses.filter { verse ->
        if (!Study.matchesQuery(verse, query)) return@filter false
        val card = Study.cardFor(save, verse.id)
        when (filter) {
            "all" -> true
            "due" -> Study.filterState(card, today) == "due"
            "lapsing" -> Study.strength(card) == "lapsing"
            else -> Study.filterState(card, today) == filter || Study.strength(card) == filter
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
                kick = "Study Hall",
                title = "The Whole Counsel",
                onBack = onBack,
            )
            Text(
                text = if (due > 0) "$due due for review" else "Nothing due today",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 12.sp,
                letterSpacing = 0.16.em,
                modifier = Modifier
                    .widthIn(max = 720.dp)
                    .fillMaxWidth()
                    .padding(bottom = 10.dp),
            )
            BasicTextField(
                value = query,
                onValueChange = { query = it },
                singleLine = true,
                textStyle = androidx.compose.ui.text.TextStyle(
                    color = CtvColors.parch,
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                ),
                cursorBrush = SolidColor(CtvColors.gold),
                modifier = Modifier
                    .widthIn(max = 720.dp)
                    .fillMaxWidth()
                    .defaultMinSize(minHeight = 44.dp)
                    .border(1.dp, CtvColors.edge)
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                decorationBox = { inner ->
                    Box(contentAlignment = Alignment.CenterStart) {
                        if (query.isEmpty()) {
                            Text(
                                text = "Search text, book or reference…",
                                color = CtvColors.parchDim,
                                fontFamily = CtvFonts.body,
                                fontSize = 16.sp,
                            )
                        }
                        inner()
                    }
                },
            )
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier
                    .widthIn(max = 720.dp)
                    .fillMaxWidth()
                    .padding(top = 10.dp, bottom = 12.dp),
            ) {
                FILTERS.forEach { (key, label) ->
                    val on = filter == key
                    Text(
                        text = label.uppercase(),
                        modifier = Modifier
                            .defaultMinSize(minHeight = 44.dp)
                            .border(1.dp, if (on) CtvColors.gold else CtvColors.edge)
                            .background(if (on) CtvColors.gold.copy(alpha = 0.18f) else androidx.compose.ui.graphics.Color.Transparent)
                            .clickable(role = Role.Button) { filter = key }
                            .padding(horizontal = 12.dp, vertical = 12.dp),
                        color = if (on) CtvColors.goldHot else CtvColors.goldDim,
                        fontFamily = CtvFonts.ui,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 11.sp,
                        letterSpacing = 0.16.em,
                    )
                }
            }
            when {
                !versesReady -> Text(
                    text = "Loading the counsel…",
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 16.sp,
                )
                loadError != null -> Text(
                    text = loadError,
                    color = CtvColors.bloodHot,
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                )
                rows.isEmpty() -> Text(
                    text = if (filter == "due") {
                        "No verses due for review — your memory is clear."
                    } else {
                        "Nothing here yet. Change the filter, or go earn some scars."
                    },
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 16.sp,
                    modifier = Modifier
                        .widthIn(max = 720.dp)
                        .fillMaxWidth()
                        .padding(top = 12.dp),
                )
                else -> LazyColumn(
                    modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(bottom = 12.dp),
                ) {
                    items(rows, key = { it.id }) { verse ->
                        val card = Study.cardFor(save, verse.id)
                        VerseRow(
                            verse = verse,
                            strength = Study.strength(card),
                            schedule = Study.scheduleLabel(card, today),
                            onClick = { onReview(verse) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun VerseRow(
    verse: Verse,
    strength: String,
    schedule: String,
    onClick: () -> Unit,
) {
    HallPanel(
        modifier = Modifier.fillMaxWidth(),
        cut = 12.dp,
        onClick = onClick,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = 44.dp)
                .padding(horizontal = 16.dp, vertical = 14.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = verse.r,
                    color = CtvColors.goldHot,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp,
                    letterSpacing = 0.08.em,
                    modifier = Modifier.weight(1f).padding(end = 8.dp),
                )
                Text(
                    text = strength.uppercase(),
                    color = when (strength) {
                        "held" -> CtvColors.green
                        "lapsing" -> CtvColors.bloodHot
                        "learning" -> CtvColors.azure
                        else -> CtvColors.goldDim
                    },
                    fontFamily = CtvFonts.ui,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 10.sp,
                    letterSpacing = 0.16.em,
                )
            }
            Text(
                text = schedule,
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 11.sp,
                letterSpacing = 0.08.em,
                modifier = Modifier.padding(top = 4.dp, bottom = 8.dp),
            )
            Text(
                text = "${verse.p} ${verse.a}${if (verse.s.startsWith(",") || verse.s.startsWith(".") || verse.s.startsWith(";") || verse.s.startsWith(":") || verse.s.startsWith("!") || verse.s.startsWith("?")) verse.s else " ${verse.s}"}",
                color = CtvColors.parch,
                fontFamily = CtvFonts.body,
                fontSize = 15.sp,
                lineHeight = 22.sp,
            )
        }
    }
}
