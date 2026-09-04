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
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.characters.Scholars
import app.completetheverse.core.cloud.Cloud
import app.completetheverse.core.save.Save
import app.completetheverse.save.SaveCoordinator
import app.completetheverse.ui.components.HallToast
import app.completetheverse.ui.components.QuitDialog
import app.completetheverse.ui.hall.ComingSoonScreen
import app.completetheverse.ui.hall.HallScreen
import app.completetheverse.ui.intro.BootSplash
import app.completetheverse.ui.intro.IntroScreen
import app.completetheverse.ui.practice.PracticeRoute
import app.completetheverse.ui.profile.CharacterPickScreen
import app.completetheverse.ui.settings.SettingsScreen
import app.completetheverse.ui.settings.SettingsStore
import app.completetheverse.ui.theme.CtvColors
import kotlinx.coroutines.delay

private sealed interface CtvScreen {
    data object Boot : CtvScreen
    data object Intro : CtvScreen
    data class CharacterPick(val fromSettings: Boolean) : CtvScreen
    data object SignIn : CtvScreen
    data object Hall : CtvScreen
    data object Settings : CtvScreen
    data object Practice : CtvScreen
    data class ComingSoon(val kick: String, val title: String) : CtvScreen
}

private val CtvScreenSaver = Saver<CtvScreen, String>(
    save = { screen ->
        when (screen) {
            CtvScreen.Boot -> "boot"
            CtvScreen.Intro -> "intro"
            is CtvScreen.CharacterPick -> if (screen.fromSettings) "pick-set" else "pick"
            CtvScreen.SignIn -> "signin"
            CtvScreen.Hall -> "hall"
            CtvScreen.Settings -> "settings"
            CtvScreen.Practice -> "practice"
            is CtvScreen.ComingSoon -> "soon\u001f${screen.kick}\u001f${screen.title}"
        }
    },
    restore = { saved ->
        val parts = saved.split('\u001f')
        when (parts[0]) {
            "boot" -> CtvScreen.Boot
            "intro" -> CtvScreen.Intro
            "pick" -> CtvScreen.CharacterPick(false)
            "pick-set" -> CtvScreen.CharacterPick(true)
            "signin" -> CtvScreen.SignIn
            "settings" -> CtvScreen.Settings
            "practice" -> CtvScreen.Practice
            "soon" -> CtvScreen.ComingSoon(
                parts.getOrElse(1) { "" },
                parts.getOrElse(2) { "" },
            )
            else -> CtvScreen.Hall
        }
    },
)

data class CloudUi(
    val ready: Boolean,
    val signedIn: Boolean,
    val email: String?,
    val busy: Boolean,
    val status: String,
    val pendingEmail: String,
    val configured: Boolean = Cloud.configured(),
)

@Composable
fun CtvApp(
    settingsStore: SettingsStore,
    saves: SaveCoordinator,
    verses: List<Verse>,
    versesReady: Boolean,
    verseError: String?,
    saveGeneration: Int,
    cloudUi: CloudUi,
    onSendCode: (String) -> Unit,
    onVerify: (email: String, otp: String) -> Unit,
    onSignOut: () -> Unit,
    onQuit: () -> Unit,
) {
    var screen by rememberSaveable(stateSaver = CtvScreenSaver) {
        mutableStateOf<CtvScreen>(CtvScreen.Boot)
    }
    var settings by remember { mutableStateOf(settingsStore.load()) }
    var showQuit by rememberSaveable { mutableStateOf(false) }
    var toast by rememberSaveable { mutableStateOf<String?>(null) }
    var email by rememberSaveable { mutableStateOf("") }
    var otp by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(cloudUi.pendingEmail) {
        if (email.isEmpty() && cloudUi.pendingEmail.isNotEmpty()) {
            email = cloudUi.pendingEmail
        }
    }

    LaunchedEffect(saveGeneration) {
        if (saveGeneration == 0) return@LaunchedEffect
        if (screen != CtvScreen.Boot) return@LaunchedEffect
        val save = saves.snapshot()
        screen = when {
            !Save.introPlayed(save) -> CtvScreen.Intro
            !Save.profileReady(save) -> CtvScreen.CharacterPick(false)
            else -> CtvScreen.Hall
        }
    }

    fun finishIntro() {
        val next = Save.markIntroPlayed(saves.snapshot())
        saves.persistAsync(next)
        screen = if (!Save.profileReady(next)) {
            CtvScreen.CharacterPick(false)
        } else {
            CtvScreen.Hall
        }
    }

    fun afterHallBack() {
        screen = CtvScreen.Hall
    }

    BackHandler(enabled = screen !is CtvScreen.Hall || showQuit) {
        when {
            showQuit -> showQuit = false
            screen is CtvScreen.Intro -> finishIntro()
            screen is CtvScreen.CharacterPick -> {
                val pick = screen as CtvScreen.CharacterPick
                if (pick.fromSettings) screen = CtvScreen.Settings else showQuit = true
            }
            screen is CtvScreen.Boot -> showQuit = true
            else -> afterHallBack()
        }
    }

    val save = saves.snapshot()
    val scholar = Scholars.resolve(Save.scholarId(save))
    val playerName = Save.playerName(save)
    val chipLabel = cloudChipLabel(
        ready = cloudUi.ready,
        signedIn = cloudUi.signedIn,
        email = cloudUi.email,
        playerName = playerName,
        configured = cloudUi.configured,
    )

    Box(
        Modifier
            .fillMaxSize()
            .background(CtvColors.inkAlt),
    ) {
        when (val current = screen) {
            CtvScreen.Boot -> BootSplash()
            CtvScreen.Intro -> IntroScreen(onFinished = { finishIntro() })
            is CtvScreen.CharacterPick -> CharacterPickScreen(
                initialName = playerName,
                initialScholarId = scholar.id,
                fromSettings = current.fromSettings,
                onConfirm = { name, scholarId ->
                    saves.persistAsync(Save.commitProfile(saves.snapshot(), name, scholarId))
                    screen = if (current.fromSettings) CtvScreen.Settings else CtvScreen.Hall
                },
                onBack = if (current.fromSettings) {
                    { screen = CtvScreen.Settings }
                } else {
                    null
                },
            )
            CtvScreen.SignIn -> SignInScreen(
                email = email,
                otp = otp,
                status = cloudUi.status,
                busy = cloudUi.busy || !cloudUi.ready,
                signedIn = cloudUi.ready && cloudUi.signedIn,
                signedInEmail = cloudUi.email,
                onEmailChange = { email = it },
                onOtpChange = { otp = it },
                onSendCode = {
                    if (!cloudUi.busy && cloudUi.ready && email.isNotBlank()) onSendCode(email)
                },
                onVerify = {
                    if (!cloudUi.busy && cloudUi.ready && otp.length == 6) onVerify(email, otp)
                },
                onSignOut = {
                    if (!cloudUi.busy && cloudUi.ready) onSignOut()
                },
                onBack = { afterHallBack() },
            )
            CtvScreen.Hall -> HallScreen(
                onMode = { mode ->
                    when {
                        mode.incoming -> toast = "${mode.name} is incoming."
                        mode.key == "practice" -> screen = CtvScreen.Practice
                        else -> screen = CtvScreen.ComingSoon(mode.kick, mode.name)
                    }
                },
                onSubnav = { item ->
                    when (item.id) {
                        "settings" -> screen = CtvScreen.Settings
                        "quit" -> showQuit = true
                        else -> screen = CtvScreen.ComingSoon(item.kick, item.title)
                    }
                },
                cloudLabel = chipLabel,
                cloudDim = !(cloudUi.ready && cloudUi.signedIn),
                showSignIn = cloudUi.ready && cloudUi.configured && !cloudUi.signedIn,
                onCloud = { screen = CtvScreen.SignIn },
            )
            CtvScreen.Settings -> SettingsScreen(
                settings = settings,
                scholarShort = scholar.short,
                scholarHint = "${scholar.name} — your scholar. Portrait on the menu; they walk the map.",
                onChange = { next ->
                    settings = next
                    settingsStore.save(next)
                },
                onChangeAvatar = { screen = CtvScreen.CharacterPick(true) },
                onBack = { screen = CtvScreen.Hall },
            )
            CtvScreen.Practice -> PracticeRoute(
                verses = verses,
                versesReady = versesReady,
                verseError = verseError,
                saveGeneration = saveGeneration,
                saves = saves,
                onExit = { screen = CtvScreen.Hall },
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

internal fun cloudChipLabel(
    ready: Boolean,
    signedIn: Boolean,
    email: String?,
    playerName: String,
    configured: Boolean,
): String {
    if (!configured) return "Local only"
    if (ready && signedIn) {
        val name = playerName.trim()
        return name.ifEmpty { email?.ifBlank { null } ?: "Synced" }
    }
    return if (ready) "Cloud ready" else "Local only"
}
