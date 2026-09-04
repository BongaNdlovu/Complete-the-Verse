package app.completetheverse.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val CtvColorScheme = darkColorScheme(
    primary = CtvColors.gold,
    onPrimary = CtvColors.buttonInk,
    secondary = CtvColors.goldDim,
    onSecondary = CtvColors.buttonInk,
    background = CtvColors.inkAlt,
    onBackground = CtvColors.parch,
    surface = CtvColors.ink,
    onSurface = CtvColors.parch,
    surfaceVariant = CtvColors.ink2,
    onSurfaceVariant = CtvColors.parchDim,
    error = CtvColors.blood,
    onError = CtvColors.parch,
    outline = CtvColors.edge,
    tertiary = CtvColors.goldHot,
    onTertiary = CtvColors.buttonInk,
)

@Composable
fun CtvTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = CtvColorScheme,
        typography = CtvTypography,
        content = content,
    )
}
