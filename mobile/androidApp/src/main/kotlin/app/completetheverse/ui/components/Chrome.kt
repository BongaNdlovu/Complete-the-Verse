package app.completetheverse.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.shape.GenericShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import app.completetheverse.R
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts
import app.completetheverse.ui.theme.HallCutShape
import app.completetheverse.ui.theme.SkewButtonShape

@Composable
fun HallBackdrop(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize()) {
        Image(
            painter = painterResource(R.drawable.hall_still),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
            alpha = 0.42f,
        )
        Box(
            Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color(0xCC04040A),
                            Color(0x9904040A),
                            Color(0xE604040A),
                        ),
                    ),
                ),
        )
        Box(
            Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0x330B0908), Color(0xD1000000)),
                    ),
                ),
        )
    }
}

@Composable
fun Kick(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text.uppercase(),
        modifier = modifier,
        color = CtvColors.kick,
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.SemiBold,
        fontSize = 11.sp,
        letterSpacing = 0.42.em,
        textAlign = TextAlign.Center,
    )
}

@Composable
fun GoldHeadline(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text.uppercase(),
        modifier = modifier,
        style = TextStyle(
            fontFamily = CtvFonts.display,
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp,
            letterSpacing = 0.18.em,
            textAlign = TextAlign.Center,
            brush = Brush.linearGradient(
                listOf(Color(0xFFFFF7E5), CtvColors.gold, Color(0xFF8D6731)),
            ),
        ),
    )
}

@Composable
fun Filigree(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .widthIn(max = 280.dp)
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(
            Modifier
                .weight(1f)
                .height(1.dp)
                .background(
                    Brush.horizontalGradient(
                        listOf(Color.Transparent, CtvColors.goldDeep, CtvColors.gold, CtvColors.goldDeep, Color.Transparent),
                    ),
                ),
        )
        Box(
            Modifier
                .size(7.dp)
                .background(CtvColors.gold, diamond()),
        )
        Box(
            Modifier
                .weight(1f)
                .height(1.dp)
                .background(
                    Brush.horizontalGradient(
                        listOf(Color.Transparent, CtvColors.goldDeep, CtvColors.gold, CtvColors.goldDeep, Color.Transparent),
                    ),
                ),
        )
    }
}

private fun diamond() = GenericShape { size, _ ->
    moveTo(size.width / 2f, 0f)
    lineTo(size.width, size.height / 2f)
    lineTo(size.width / 2f, size.height)
    lineTo(0f, size.height / 2f)
    close()
}

@Composable
fun CloudChip(text: String, dim: Boolean = true, modifier: Modifier = Modifier) {
    Text(
        text = text.uppercase(),
        modifier = modifier
            .alpha(if (dim) 0.55f else 1f)
            .border(1.dp, Color(0x4CE8C478))
            .padding(horizontal = 12.dp, vertical = 6.dp),
        color = CtvColors.goldDim,
        fontFamily = CtvFonts.ui,
        fontWeight = FontWeight.SemiBold,
        fontSize = 11.sp,
        letterSpacing = 0.16.em,
    )
}

@Composable
fun GhostButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    small: Boolean = true,
) {
    val shape = SkewButtonShape(if (small) 10.dp else 13.dp)
    Text(
        text = text.uppercase(),
        modifier = modifier
            .defaultMinSize(minHeight = 44.dp)
            .clip(shape)
            .border(1.dp, CtvColors.edge, shape)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(
                start = if (small) 18.dp else 28.dp,
                top = if (small) 12.dp else 16.dp,
                end = if (small) 16.dp else 24.dp,
                bottom = if (small) 10.dp else 14.dp,
            )
            .wrapContentHeight(Alignment.CenterVertically),
        color = CtvColors.gold,
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.SemiBold,
        fontSize = if (small) 11.sp else 13.sp,
        letterSpacing = 0.24.em,
        textAlign = TextAlign.Center,
    )
}

@Composable
fun GoldButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    small: Boolean = false,
) {
    val shape = SkewButtonShape(if (small) 10.dp else 13.dp)
    Text(
        text = text.uppercase(),
        modifier = modifier
            .defaultMinSize(minHeight = 44.dp)
            .clip(shape)
            .background(
                Brush.verticalGradient(
                    listOf(CtvColors.goldHot, CtvColors.gold, Color(0xFF9A7A33)),
                ),
                shape,
            )
            .clickable(role = Role.Button, onClick = onClick)
            .padding(
                start = if (small) 18.dp else 28.dp,
                top = if (small) 12.dp else 16.dp,
                end = if (small) 16.dp else 24.dp,
                bottom = if (small) 10.dp else 14.dp,
            )
            .wrapContentHeight(Alignment.CenterVertically),
        color = CtvColors.buttonInk,
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.SemiBold,
        fontSize = if (small) 11.sp else 13.sp,
        letterSpacing = 0.24.em,
        textAlign = TextAlign.Center,
    )
}

@Composable
fun HallPanel(
    modifier: Modifier = Modifier,
    cut: Dp = 18.dp,
    incoming: Boolean = false,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    val shape = HallCutShape(cut)
    val click = if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
    Box(
        modifier
            .alpha(if (incoming) 0.58f else 1f)
            .clip(shape)
            .background(
                Brush.linearGradient(listOf(CtvColors.panelTop, CtvColors.panelBot)),
                shape,
            )
            .border(1.dp, CtvColors.edge, shape)
            .then(click),
    ) {
        content()
    }
}

@Composable
fun <T> SegControl(
    options: List<Pair<T, String>>,
    selected: T,
    onSelect: (T) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.border(1.dp, CtvColors.edge),
    ) {
        options.forEach { (value, label) ->
            val on = value == selected
            Text(
                text = label.uppercase(),
                modifier = Modifier
                    .defaultMinSize(minHeight = 44.dp)
                    .clickable(role = Role.Button) { onSelect(value) }
                    .then(
                        if (on) {
                            Modifier.background(
                                Brush.verticalGradient(listOf(CtvColors.goldHot, CtvColors.gold)),
                            )
                        } else {
                            Modifier
                        },
                    )
                    .padding(horizontal = 12.dp)
                    .wrapContentHeight(Alignment.CenterVertically),
                color = if (on) CtvColors.buttonInk else CtvColors.parchDim,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 11.sp,
                letterSpacing = 0.16.em,
            )
        }
    }
}

@Composable
fun QuitDialog(onConfirm: () -> Unit, onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        HallPanel(cut = 14.dp, modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Kick("The record")
                Spacer(Modifier.height(8.dp))
                GoldHeadline("Close Complete the Verse?")
                Filigree()
                Text(
                    text = "Leave the hall and return to the device.",
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 16.sp,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(22.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    GhostButton("Stay", onClick = onDismiss)
                    GoldButton("Quit game", onClick = onConfirm, small = true)
                }
            }
        }
    }
}

@Composable
fun HallToast(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text.uppercase(),
        modifier = modifier
            .widthIn(max = 420.dp)
            .background(Color(0xDB06070B))
            .border(1.dp, CtvColors.gold)
            .padding(horizontal = 20.dp, vertical = 12.dp),
        color = CtvColors.goldHot,
        fontFamily = CtvFonts.ui,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp,
        letterSpacing = 0.22.em,
        textAlign = TextAlign.Center,
    )
}
