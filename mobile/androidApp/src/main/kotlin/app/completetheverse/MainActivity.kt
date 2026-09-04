package app.completetheverse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.graphics.toArgb
import androidx.lifecycle.viewmodel.compose.viewModel
import app.completetheverse.cloud.SupabaseCloudClient
import kotlinx.coroutines.launch
import app.completetheverse.save.AppSaveViewModel
import app.completetheverse.ui.CloudUi
import app.completetheverse.ui.CtvApp
import app.completetheverse.ui.settings.SettingsStore
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val ink = CtvColors.inkAlt.toArgb()
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(ink),
            navigationBarStyle = SystemBarStyle.dark(ink),
        )
        super.onCreate(savedInstanceState)
        val settingsStore = SettingsStore(this)
        setContent {
            val saveVm: AppSaveViewModel = viewModel()
            val cloud = remember(saveVm) {
                SupabaseCloudClient(applicationContext, saveVm.saveRepository)
            }
            val scope = rememberCoroutineScope()
            CtvTheme {
                CtvApp(
                    settingsStore = settingsStore,
                    saves = saveVm.saves,
                    verses = saveVm.verses,
                    tfClaims = saveVm.tfClaims,
                    sites = saveVm.sites,
                    arcs = saveVm.arcs,
                    versesReady = saveVm.versesReady,
                    verseError = saveVm.verseError,
                    tablets = saveVm.tablets,
                    tabletsReady = saveVm.tabletsReady,
                    tabletsError = saveVm.tabletsError,
                    saveGeneration = saveVm.saveGeneration,
                    cloudUi = CloudUi(
                        ready = saveVm.authReady,
                        signedIn = saveVm.signedIn,
                        email = saveVm.signedInEmail,
                        busy = saveVm.authBusy,
                        status = saveVm.authStatus,
                        pendingEmail = saveVm.pendingEmail,
                    ),
                    onSendCode = saveVm::sendCode,
                    onVerify = saveVm::verify,
                    onSignOut = saveVm::signOut,
                    onQuit = {
                        finishAffinity()
                    },
                    onBlitzScore = { blob ->
                        scope.launch {
                            if (cloud.isSignedIn()) cloud.flushBlitzBest(blob)
                        }
                    },
                    onFetchBlitzBoard = saveVm::fetchBlitzBoard,
                )
            }
        }
    }
}
