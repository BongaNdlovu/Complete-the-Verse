package app.completetheverse.ui.seals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.seals.Seal
import app.completetheverse.core.seals.Seals
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.HallScreenHeader
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun SealsScreen(
    save: SaveBlob,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val earned = Seals.earnedIds(save)
    val got = earned.size
    val total = Seals.count()
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
                kick = "Achievements",
                title = "Seals — $got / $total",
                onBack = onBack,
            )
            if (got == 0) {
                Text(
                    text = "No seals unlocked yet — step onto the road to earn your first honor.",
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
                items(Seals.ALL, key = { it.id }) { seal ->
                    SealCard(seal = seal, earned = seal.id in earned)
                }
            }
        }
    }
}

@Composable
private fun SealCard(seal: Seal, earned: Boolean) {
    HallPanel(
        modifier = Modifier.fillMaxWidth().defaultMinSize(minHeight = 44.dp),
        cut = 12.dp,
        incoming = !earned,
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(
                        if (earned) CtvColors.gold.copy(alpha = 0.22f) else CtvColors.ink3,
                        CircleShape,
                    )
                    .border(1.dp, if (earned) CtvColors.gold else CtvColors.edge, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = if (earned) "✦" else "·",
                    color = if (earned) CtvColors.goldHot else CtvColors.goldDim,
                    fontFamily = CtvFonts.display,
                    fontSize = 16.sp,
                )
            }
            Text(
                text = seal.name.uppercase(),
                color = CtvColors.goldHot,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                letterSpacing = 0.1.em,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 10.dp).alpha(if (earned) 1f else 0.7f),
            )
            Text(
                text = seal.desc,
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 6.dp).alpha(if (earned) 1f else 0.75f),
            )
        }
    }
}
