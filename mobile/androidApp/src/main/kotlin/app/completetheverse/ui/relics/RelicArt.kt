package app.completetheverse.ui.relics

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.sp
import app.completetheverse.core.pilgrimage.Artifacts
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun RelicImage(
    artifactId: String,
    contentDescription: String?,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val bmp by produceState<ImageBitmap?>(initialValue = null, artifactId) {
        value = withContext(Dispatchers.IO) {
            try {
                context.assets.open(Artifacts.assetPath(artifactId)).use { stream ->
                    BitmapFactory.decodeStream(stream)?.asImageBitmap()
                }
            } catch (_: Exception) {
                null
            }
        }
    }
    val image = bmp
    if (image != null) {
        Image(
            bitmap = image,
            contentDescription = contentDescription,
            contentScale = ContentScale.Crop,
            modifier = modifier,
        )
    } else {
        Box(
            modifier = modifier.background(CtvColors.ink3),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "✦",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.display,
                fontSize = 22.sp,
            )
        }
    }
}

@Composable
fun RelicPlaceholder(modifier: Modifier = Modifier, glyph: String = "?") {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(CtvColors.ink3),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = glyph,
            color = CtvColors.goldDim,
            fontFamily = CtvFonts.display,
            fontSize = 22.sp,
        )
    }
}
