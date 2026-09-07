package app.completetheverse.ui.theme

import androidx.compose.runtime.compositionLocalOf

data class VisualProfile(
    val quality: String = "high",
    val motion: String = "full",
    val reduced: Boolean = false,
    val systemReduced: Boolean = false,
) {
    val isReduced: Boolean get() = reduced || motion == "reduced" || systemReduced
    val isCalm: Boolean get() = motion == "calm" && !isReduced
    val showHeavyFx: Boolean get() = quality == "high" && !isReduced
    val showVideo: Boolean get() = quality != "low" && !isReduced
}

val LocalVisualProfile = compositionLocalOf { VisualProfile() }
