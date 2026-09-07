package app.completetheverse.ui.fx

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import app.completetheverse.ui.theme.LocalVisualProfile

@Composable
fun FlashLayer(
    beat: FxBeat,
    modifier: Modifier = Modifier,
) {
    val profile = LocalVisualProfile.current
    val flashColor = when (beat) {
        FxBeat.Wrong -> Color(0x6BFF5A62)
        FxBeat.Correct, FxBeat.Combo, FxBeat.Lock -> Color(0x80FFE3A6)
        FxBeat.Overdrive -> Color(0x66D9B667)
        FxBeat.Idle -> Color.Transparent
    }
    val flash = remember { Animatable(0f) }
    LaunchedEffect(beat) {
        if (beat == FxBeat.Idle || flashColor == Color.Transparent) {
            flash.snapTo(0f)
            return@LaunchedEffect
        }
        flash.snapTo(if (profile.isReduced) 0.18f else 1f)
        if (profile.isReduced) {
            flash.animateTo(0f, tween(1))
        } else {
            flash.animateTo(0f, tween(if (profile.isCalm) 320 else 600))
        }
    }
    if (flash.value > 0f && flashColor != Color.Transparent) {
        Box(
            modifier
                .fillMaxSize()
                .alpha(flash.value)
                .background(
                    Brush.radialGradient(
                        colors = listOf(flashColor, Color.Transparent),
                    ),
                ),
        )
    }
}
