package app.completetheverse.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.components.SegControl
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun SettingsScreen(
    settings: CtvSettings,
    scholarShort: String?,
    scholarHint: String,
    onChange: (CtvSettings) -> Unit,
    onChangeAvatar: () -> Unit,
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
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Row(
                modifier = Modifier
                    .widthIn(max = 640.dp)
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
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
                    Kick("Settings")
                    Spacer(Modifier.height(4.dp))
                    GoldHeadline("The Lamp Room")
                }
                GhostButton("Back", onClick = onBack)
            }
            Column(
                modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
            ) {
                SetRow(
                    label = "Avatar",
                    hint = scholarHint,
                ) {
                    GhostButton(
                        text = scholarShort?.let { "Change · $it" } ?: "Choose avatar",
                        onClick = onChangeAvatar,
                    )
                }
                SetRow(
                    label = "Visual quality",
                    hint = "Choose the effects profile that best matches this device.",
                ) {
                    SegControl(
                        options = listOf(
                            "high" to "Cinematic",
                            "balanced" to "Balanced",
                            "low" to "Efficient",
                        ),
                        selected = settings.quality,
                        onSelect = { onChange(settings.copy(quality = it)) },
                    )
                }
                SetRow(
                    label = "Reduced motion",
                    hint = "Motion level for effects, grain and ambient loops.",
                ) {
                    SegControl(
                        options = listOf(false to "Off", true to "On"),
                        selected = settings.reduced,
                        onSelect = { reduced ->
                            onChange(
                                settings.copy(
                                    reduced = reduced,
                                    motion = if (reduced) "reduced" else "full",
                                ),
                            )
                        },
                    )
                }
                SetRow(
                    label = "Haptics",
                    hint = "Short vibration on correct and wrong answers (supported devices).",
                ) {
                    SegControl(
                        options = listOf(true to "On", false to "Off"),
                        selected = settings.haptics,
                        onSelect = { onChange(settings.copy(haptics = it)) },
                    )
                }
                SetRow(
                    label = "Music",
                    hint = "Ambient drone beneath the cathedral.",
                ) {
                    VolumeControls(
                        level = settings.music,
                        muted = settings.musicMute,
                        onLevel = { onChange(settings.copy(music = it, musicMute = false)) },
                        onMute = { onChange(settings.copy(musicMute = it)) },
                    )
                }
                SetRow(
                    label = "Sound effects",
                    hint = "Ticks, heartbeat, the hit when you are wrong.",
                ) {
                    VolumeControls(
                        level = settings.sfx,
                        muted = settings.sfxMute,
                        onLevel = { onChange(settings.copy(sfx = it, sfxMute = false)) },
                        onMute = { onChange(settings.copy(sfxMute = it)) },
                    )
                }
            }
        }
    }
}

@Composable
private fun SetRow(
    label: String,
    hint: String,
    control: @Composable () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .drawBehind {
                drawLine(
                    color = CtvColors.gold.copy(alpha = 0.10f),
                    start = Offset(0f, size.height),
                    end = Offset(size.width, size.height),
                    strokeWidth = 1.dp.toPx(),
                )
            }
            .padding(vertical = 16.dp),
    ) {
        Text(
            text = label.uppercase(),
            color = CtvColors.parch,
            fontFamily = CtvFonts.ui,
            fontWeight = FontWeight.SemiBold,
            fontSize = 12.sp,
            letterSpacing = 0.18.em,
        )
        Text(
            text = hint,
            color = CtvColors.parchDim,
            fontFamily = CtvFonts.body,
            fontSize = 14.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp),
        )
        Box(Modifier.align(Alignment.End)) {
            control()
        }
    }
}

@Composable
private fun VolumeControls(
    level: Float,
    muted: Boolean,
    onLevel: (Float) -> Unit,
    onMute: (Boolean) -> Unit,
) {
    var sliding by remember { mutableStateOf<Float?>(null) }
    Column(horizontalAlignment = Alignment.End) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Slider(
                value = sliding ?: level,
                onValueChange = { value ->
                    if (sliding == null && muted) onMute(false)
                    sliding = value
                },
                onValueChangeFinished = {
                    val value = sliding ?: level
                    sliding = null
                    onLevel(value)
                },
                valueRange = 0f..1f,
                steps = 19,
                modifier = Modifier.width(140.dp),
                colors = SliderDefaults.colors(
                    thumbColor = CtvColors.goldHot,
                    activeTrackColor = CtvColors.gold,
                    inactiveTrackColor = CtvColors.gold.copy(alpha = 0.25f),
                ),
            )
        }
        SegControl(
            options = listOf(false to "On", true to "Mute"),
            selected = muted,
            onSelect = onMute,
        )
    }
}
