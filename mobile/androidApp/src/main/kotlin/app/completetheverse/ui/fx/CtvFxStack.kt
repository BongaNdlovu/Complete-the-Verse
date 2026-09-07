package app.completetheverse.ui.fx

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts
import app.completetheverse.ui.theme.LocalVisualProfile

@Composable
fun CtvFxStack(
    beat: FxBeat = FxBeat.Idle,
    streak: Int = 0,
    multiplier: Int = 1,
    modifier: Modifier = Modifier,
) {
    val profile = LocalVisualProfile.current
    Box(modifier.fillMaxSize()) {
        Box(
            Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color.Transparent, Color(0x99000000)),
                    ),
                ),
        )
        GrainLayer()
        if (profile.showHeavyFx) {
            SmokeWisps(animated = !profile.isCalm)
        }
        FlashLayer(beat = beat)
        if (beat == FxBeat.Overdrive) {
            Box(
                Modifier
                    .fillMaxSize()
                    .background(
                        Brush.radialGradient(
                            colors = listOf(Color(0x33FFE3A6), Color.Transparent),
                        ),
                    ),
            )
        }
        if (streak >= 3 && (beat == FxBeat.Combo || beat == FxBeat.Correct)) {
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = "$streak IN A ROW",
                    color = CtvColors.goldHot,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp,
                    letterSpacing = 0.18.em,
                    textAlign = TextAlign.Center,
                )
                Text(
                    text = "×$multiplier",
                    color = CtvColors.gold,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 16.sp,
                    letterSpacing = 0.16.em,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

@Composable
private fun SmokeWisps(animated: Boolean) {
    if (animated) {
        val transition = rememberInfiniteTransition(label = "smoke")
        val drift by transition.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(14000, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "smoke-drift",
        )
        SmokeWispLayer(drift)
    } else {
        SmokeWispLayer(0.35f)
    }
}

@Composable
private fun SmokeWispLayer(drift: Float) {
    Box(Modifier.fillMaxSize()) {
        Box(
            Modifier
                .align(Alignment.BottomStart)
                .offset(x = (-48).dp + (24 * drift).dp, y = (18 - 10 * drift).dp)
                .size(220.dp, 150.dp)
                .alpha(0.13f)
                .background(Color(0x66D9B667), CircleShape),
        )
        Box(
            Modifier
                .align(Alignment.BottomEnd)
                .offset(x = (36).dp - (20 * drift).dp, y = (8 + 12 * drift).dp)
                .size(200.dp, 140.dp)
                .alpha(0.10f)
                .background(Color(0x559A7A33), CircleShape),
        )
    }
}
