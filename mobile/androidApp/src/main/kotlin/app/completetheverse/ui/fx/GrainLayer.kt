package app.completetheverse.ui.fx

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import app.completetheverse.ui.theme.LocalVisualProfile
import kotlin.random.Random

@Composable
fun GrainLayer(modifier: Modifier = Modifier) {
    val profile = LocalVisualProfile.current
    if (profile.quality == "low") return
    val grainAlpha = when {
        profile.isReduced -> 0.08f
        profile.isCalm -> 0.05f
        profile.quality == "balanced" -> 0.06f
        else -> 0.11f
    }
    if (grainAlpha <= 0f) return
    val animateGrain = !profile.isReduced && !profile.isCalm
    if (animateGrain) {
        val transition = rememberInfiniteTransition(label = "grain")
        val phase by transition.animateFloat(
            initialValue = 0f,
            targetValue = 4f,
            animationSpec = infiniteRepeatable(
                animation = tween(850, easing = LinearEasing),
                repeatMode = RepeatMode.Restart,
            ),
            label = "grain-phase",
        )
        GrainCanvas(intensity = grainAlpha, phase = phase, modifier = modifier)
    } else {
        GrainCanvas(intensity = grainAlpha, phase = 0f, modifier = modifier)
    }
}

@Composable
private fun GrainCanvas(intensity: Float, phase: Float, modifier: Modifier = Modifier) {
    Canvas(modifier.fillMaxSize().alpha(intensity)) {
        val step = 7.dp.toPx()
        val seed = phase.toInt()
        val rng = Random(seed * 9973 + 13)
        val speckle = Color.White.copy(alpha = 0.55f)
        var x = 0f
        while (x < size.width) {
            var y = 0f
            while (y < size.height) {
                if (rng.nextFloat() > 0.78f) {
                    drawCircle(
                        color = speckle,
                        radius = 0.7f,
                        center = Offset(
                            x + rng.nextFloat() * step,
                            y + rng.nextFloat() * step,
                        ),
                    )
                }
                y += step
            }
            x += step
        }
    }
}
