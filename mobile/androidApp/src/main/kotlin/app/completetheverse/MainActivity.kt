package app.completetheverse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.toArgb
import androidx.lifecycle.viewmodel.compose.viewModel
import app.completetheverse.cloud.SupabaseCloudClient
import app.completetheverse.save.AppSaveViewModel
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
            CtvTheme {
                LaunchedEffect(Unit) {
                    cloud.awaitInitialization()
                    val local = saveVm.saves.persistMerged()
                    if (cloud.isSignedIn()) {
                        val synced = cloud.syncOnBoot(local)
                        saveVm.saves.persistMerged(synced.save)
                        if (synced.ok) cloud.flushBlitzBest(saveVm.saves.snapshot())
                    }
                }
                CtvApp(
                    settingsStore = settingsStore,
                    saves = saveVm.saves,
                    verses = saveVm.verses,
                    versesReady = saveVm.versesReady,
                    verseError = saveVm.verseError,
                    saveGeneration = saveVm.saveGeneration,
                    onQuit = {
                        finishAffinity()
                    },
                )
            }
        }
    }
}
