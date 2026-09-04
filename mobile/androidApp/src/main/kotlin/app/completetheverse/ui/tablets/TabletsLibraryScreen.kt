package app.completetheverse.ui.tablets

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.tablets.TabletsLibraryGroup
import app.completetheverse.core.tablets.TabletsLibraryRow
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun TabletsLibraryScreen(
    groups: List<TabletsLibraryGroup>,
    bankReady: Boolean,
    loadError: String?,
    onOpen: (id: String, tutorial: Boolean) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
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
            Row(
                modifier = Modifier
                    .widthIn(max = 720.dp)
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
                    Kick("Fill the Word")
                    Spacer(Modifier.height(4.dp))
                    GoldHeadline("Word Tablets")
                }
                GhostButton("Hall", onClick = onBack)
            }
            Text(
                text = "Carve the missing KJV word before the clock runs out. Two lamps guard the tablet: one miss is not Held; a second miss or empty sand shatters.",
                modifier = Modifier.widthIn(max = 560.dp).padding(bottom = 14.dp),
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 16.sp,
                lineHeight = 22.sp,
            )
            when {
                !bankReady -> Text(
                    text = "Loading the hall…",
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                )
                loadError != null -> Text(
                    text = loadError,
                    color = CtvColors.bloodHot,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                )
                else -> LazyColumn(
                    modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().weight(1f),
                    contentPadding = PaddingValues(bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    groups.forEach { group ->
                        item(key = "h-${group.title}") {
                            Text(
                                text = group.title.uppercase(),
                                color = CtvColors.gold,
                                fontFamily = CtvFonts.display,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                letterSpacing = 0.22.em,
                                modifier = Modifier.padding(top = 14.dp, bottom = 6.dp),
                            )
                        }
                        items(group.rows, key = { it.chapter.id }) { row ->
                            ChapterRow(row, onOpen)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChapterRow(
    row: TabletsLibraryRow,
    onOpen: (id: String, tutorial: Boolean) -> Unit,
) {
    val ch = row.chapter
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .alpha(if (row.locked) 0.48f else 1f)
            .background(CtvColors.panelBot)
            .border(1.dp, CtvColors.edge)
            .clickable(enabled = !row.locked, role = Role.Button) {
                onOpen(ch.id, ch.tutorial)
            }
            .defaultMinSize(minHeight = 44.dp)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f).padding(end = 10.dp)) {
            Text(
                text = ch.name,
                color = CtvColors.goldHot,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                letterSpacing = 0.08.em,
            )
            Text(
                text = row.detail,
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 13.sp,
            )
        }
        Text(
            text = if (row.locked) "·" else "${row.best}%",
            color = CtvColors.goldDim,
            fontFamily = CtvFonts.ui,
            fontWeight = FontWeight.SemiBold,
            fontSize = 13.sp,
            letterSpacing = 0.08.em,
        )
    }
}
