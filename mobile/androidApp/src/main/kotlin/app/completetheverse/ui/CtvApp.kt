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
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.characters.Scholars
import app.completetheverse.core.cloud.Cloud
import app.completetheverse.core.pilgrimage.Arc
import app.completetheverse.core.pilgrimage.Site
import app.completetheverse.core.pilgrimage.Artifacts
import app.completetheverse.core.records.BlitzBoardRow
import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.tablets.TabletsBank
import app.completetheverse.save.SaveCoordinator
import app.completetheverse.ui.components.HallToast
import app.completetheverse.ui.components.QuitDialog
import app.completetheverse.ui.hall.ComingSoonScreen
import app.completetheverse.ui.hall.HallScreen
import app.completetheverse.ui.hall.PLAYABLE_MODE_KEYS
import app.completetheverse.ui.intro.BootSplash
import app.completetheverse.ui.intro.IntroScreen
import app.completetheverse.ui.lessons.LessonsRoute
import app.completetheverse.ui.pilgrimage.PilgrimageRoute
import app.completetheverse.ui.play.ModeRoute
import app.completetheverse.ui.practice.PracticeRoute
import app.completetheverse.ui.profile.CharacterPickScreen
import app.completetheverse.ui.records.RecordsScreen
import app.completetheverse.ui.relics.RelicsScreen
import app.completetheverse.ui.seals.SealsScreen
import app.completetheverse.ui.settings.SettingsScreen
import app.completetheverse.ui.settings.SettingsStore
import app.completetheverse.ui.study.StudyRoute
import app.completetheverse.ui.tablets.TabletsRoute
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
    data class Mode(val key: String) : CtvScreen
    data object Pilgrimage : CtvScreen
    data object Tablets : CtvScreen
    data object Study : CtvScreen
    data object Relics : CtvScreen
    data object Seals : CtvScreen
    data object Records : CtvScreen
    data class Lessons(val fromSettings: Boolean) : CtvScreen
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
            is CtvScreen.Mode -> "mode\u001f${screen.key}"
            CtvScreen.Pilgrimage -> "pilgrimage"
            CtvScreen.Tablets -> "tablets"
            CtvScreen.Study -> "study"
            CtvScreen.Relics -> "relics"
            CtvScreen.Seals -> "seals"
            CtvScreen.Records -> "records"
            is CtvScreen.Lessons -> if (screen.fromSettings) "lessons-set" else "lessons"
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
            "mode" -> CtvScreen.Mode(parts.getOrElse(1) { "trial" })
            "pilgrimage" -> CtvScreen.Pilgrimage
            "tablets" -> CtvScreen.Tablets
            "study" -> CtvScreen.Study
            "relics" -> CtvScreen.Relics
            "seals" -> CtvScreen.Seals
            "records" -> CtvScreen.Records
            "lessons" -> CtvScreen.Lessons(false)
            "lessons-set" -> CtvScreen.Lessons(true)
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
    tfClaims: List<TfClaim> = emptyList(),
    sites: List<Site> = emptyList(),
    arcs: List<Arc> = emptyList(),
    versesReady: Boolean,
    verseError: String?,
    tablets: TabletsBank?,
    tabletsReady: Boolean,
    tabletsError: String?,
    saveGeneration: Int,
    cloudUi: CloudUi,
    onSendCode: (String) -> Unit,
    onVerify: (email: String, otp: String) -> Unit,
    onSignOut: () -> Unit,
    onQuit: () -> Unit,
    onBlitzScore: (SaveBlob) -> Unit = {},
    onFetchBlitzBoard: suspend (Int) -> List<BlitzBoardRow> = { emptyList() },
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
        screen = reconcileOnboarding(screen, saves.snapshot())
    }

    fun finishIntro() {
        if (saveGeneration == 0) return
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

    val introActive = saveGeneration > 0 && screen is CtvScreen.Intro
    BackHandler(enabled = !introActive && (saveGeneration == 0 || screen !is CtvScreen.Hall || showQuit)) {
        when {
            showQuit -> showQuit = false
            saveGeneration == 0 || screen is CtvScreen.Boot -> showQuit = true
            screen is CtvScreen.CharacterPick -> {
                val pick = screen as CtvScreen.CharacterPick
                if (pick.fromSettings) screen = CtvScreen.Settings else showQuit = true
            }
            screen is CtvScreen.Lessons -> {
                val lessons = screen as CtvScreen.Lessons
                screen = if (lessons.fromSettings) CtvScreen.Settings else CtvScreen.Hall
            }
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
        when (val current = if (saveGeneration == 0) CtvScreen.Boot else screen) {
            CtvScreen.Boot -> BootSplash()
            CtvScreen.Intro -> IntroScreen(onFinished = { finishIntro() })
            is CtvScreen.CharacterPick -> CharacterPickScreen(
                initialName = playerName,
                initialScholarId = scholar.id,
                fromSettings = current.fromSettings,
                onConfirm = { name, scholarId ->
                    if (saveGeneration == 0) return@CharacterPickScreen
                    val next = Save.commitProfile(saves.snapshot(), name, scholarId)
                    saves.persistAsync(next)
                    screen = when {
                        current.fromSettings -> CtvScreen.Settings
                        !Save.tutorialDone(next) -> CtvScreen.Lessons(false)
                        else -> CtvScreen.Hall
                    }
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
                        mode.key == "pilgrimage" -> screen = CtvScreen.Pilgrimage
                        mode.key == "tablets" -> screen = CtvScreen.Tablets
                        mode.key in PLAYABLE_MODE_KEYS -> screen = CtvScreen.Mode(mode.key)
                        else -> screen = CtvScreen.ComingSoon(mode.kick, mode.name)
                    }
                },
                onSubnav = { item ->
                    when (item.id) {
                        "settings" -> screen = CtvScreen.Settings
                        "quit" -> showQuit = true
                        "study" -> screen = CtvScreen.Study
                        "relics" -> screen = CtvScreen.Relics
                        "seals" -> screen = CtvScreen.Seals
                        "records" -> screen = CtvScreen.Records
                        "lessons" -> screen = CtvScreen.Lessons(false)
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
                onChangeAvatar = {
                    if (saveGeneration == 0) return@SettingsScreen
                    screen = CtvScreen.CharacterPick(true)
                },
                onLessons = { screen = CtvScreen.Lessons(true) },
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
            is CtvScreen.Mode -> ModeRoute(
                modeKey = current.key,
                verses = verses,
                versesReady = versesReady,
                verseError = verseError,
                tfClaims = tfClaims,
                saveGeneration = saveGeneration,
                saves = saves,
                onExit = { screen = CtvScreen.Hall },
                onBlitzScore = onBlitzScore,
            )
            CtvScreen.Pilgrimage -> PilgrimageRoute(
                sites = sites,
                arcs = arcs,
                verses = verses,
                tfClaims = tfClaims,
                versesReady = versesReady,
                verseError = verseError,
                saveGeneration = saveGeneration,
                saves = saves,
                onExit = { screen = CtvScreen.Hall },
            )
            CtvScreen.Tablets -> TabletsRoute(
                bank = tablets,
                bankReady = tabletsReady,
                loadError = tabletsError,
                saveGeneration = saveGeneration,
                saves = saves,
                reducedMotion = settings.reduced || settings.motion != "full",
                quality = settings.quality,
                onExit = { screen = CtvScreen.Hall },
            )
            CtvScreen.Study -> StudyRoute(
                verses = verses,
                versesReady = versesReady,
                verseError = verseError,
                save = save,
                saves = saves,
                onExit = { screen = CtvScreen.Hall },
            )
            CtvScreen.Relics -> RelicsScreen(
                store = Artifacts.fromSave(save),
                sites = sites,
                onBack = { screen = CtvScreen.Hall },
            )
            CtvScreen.Seals -> SealsScreen(
                save = save,
                onBack = { screen = CtvScreen.Hall },
            )
            CtvScreen.Records -> RecordsScreen(
                save = save,
                signedIn = cloudUi.ready && cloudUi.signedIn,
                onFetchBlitzBoard = onFetchBlitzBoard,
                onBack = { screen = CtvScreen.Hall },
            )
            is CtvScreen.Lessons -> LessonsRoute(
                verses = verses,
                saves = saves,
                onExit = {
                    screen = if (current.fromSettings) CtvScreen.Settings else CtvScreen.Hall
                },
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

private fun reconcileOnboarding(current: CtvScreen, save: SaveBlob): CtvScreen {
    if (!Save.introPlayed(save)) return CtvScreen.Intro
    if (!Save.profileReady(save)) return CtvScreen.CharacterPick(false)
    return when (current) {
        CtvScreen.Boot, CtvScreen.Intro -> CtvScreen.Hall
        is CtvScreen.CharacterPick -> if (current.fromSettings) current else CtvScreen.Hall
        else -> current
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
