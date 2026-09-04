package app.completetheverse.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.completetheverse.ui.components.HallToast
import app.completetheverse.ui.components.QuitDialog
import app.completetheverse.ui.hall.ComingSoonScreen
import app.completetheverse.ui.hall.HallScreen
import app.completetheverse.ui.settings.SettingsScreen
import app.completetheverse.ui.settings.SettingsStore
import app.completetheverse.ui.theme.CtvColors
import kotlinx.coroutines.delay

private sealed interface CtvScreen {
    data object Hall : CtvScreen
    data object Settings : CtvScreen
    data class ComingSoon(val kick: String, val title: String) : CtvScreen
}

private val CtvScreenSaver = Saver<CtvScreen, String>(
    save = { screen ->
        when (screen) {
            CtvScreen.Hall -> "hall"
            CtvScreen.Settings -> "settings"
            is CtvScreen.ComingSoon -> "soon\u001f${screen.kick}\u001f${screen.title}"
        }
    },
    restore = { saved ->
        val parts = saved.split('\u001f')
        when (parts[0]) {
            "settings" -> CtvScreen.Settings
            "soon" -> CtvScreen.ComingSoon(
                parts.getOrElse(1) { "" },
                parts.getOrElse(2) { "" },
            )
            else -> CtvScreen.Hall
        }
    },
)

@Composable
fun CtvApp(
    settingsStore: SettingsStore,
    onQuit: () -> Unit,
) {
    var screen by rememberSaveable(stateSaver = CtvScreenSaver) {
        mutableStateOf<CtvScreen>(CtvScreen.Hall)
    }
    var settings by remember { mutableStateOf(settingsStore.load()) }
    var showQuit by rememberSaveable { mutableStateOf(false) }
    var toast by rememberSaveable { mutableStateOf<String?>(null) }

    BackHandler(enabled = screen !is CtvScreen.Hall || showQuit) {
        if (showQuit) showQuit = false else screen = CtvScreen.Hall
    }

    Box(
        Modifier
            .fillMaxSize()
            .background(CtvColors.inkAlt),
    ) {
        when (val current = screen) {
            CtvScreen.Hall -> HallScreen(
                onMode = { mode ->
                    if (mode.incoming) {
                        toast = "${mode.name} is incoming."
                    } else {
                        screen = CtvScreen.ComingSoon(mode.kick, mode.name)
                    }
                },
                onSubnav = { item ->
                    when (item.id) {
                        "settings" -> screen = CtvScreen.Settings
                        "quit" -> showQuit = true
                        else -> screen = CtvScreen.ComingSoon(item.kick, item.title)
                    }
                },
            )
            CtvScreen.Settings -> SettingsScreen(
                settings = settings,
                onChange = { next ->
                    settings = next
                    settingsStore.save(next)
                },
                onBack = { screen = CtvScreen.Hall },
            )
            is CtvScreen.ComingSoon -> ComingSoonScreen(
                kick = current.kick,
                title = current.title,
                onBack = { screen = CtvScreen.Hall },
            )
        }
        if (showQuit) {
            QuitDialog(
                onConfirm = onQuit,
                onDismiss = { showQuit = false },
            )
        }
        val message = toast
        if (message != null) {
            HallToast(
                text = message,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 28.dp),
            )
            LaunchedEffect(message) {
                delay(2600)
                if (toast == message) toast = null
            }
        }
    }
}
