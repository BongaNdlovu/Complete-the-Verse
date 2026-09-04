package app.completetheverse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.graphics.toArgb
import app.completetheverse.cloud.SupabaseCloudClient
import app.completetheverse.core.bank.Bank
import app.completetheverse.save.DataStoreSaveRepository
import app.completetheverse.ui.CtvApp
import app.completetheverse.ui.settings.SettingsStore
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvTheme
import androidx.compose.runtime.remember

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val ink = CtvColors.inkAlt.toArgb()
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(ink),
            navigationBarStyle = SystemBarStyle.dark(ink),
        )
        super.onCreate(savedInstanceState)
        val settingsStore = SettingsStore(this)
        val saveRepository = DataStoreSaveRepository(applicationContext)
        val cloud = SupabaseCloudClient(applicationContext, saveRepository)
        setContent {
            CtvTheme {
                val verses = remember {
                    try {
                        assets.open("content/verses.json").bufferedReader().use { Bank.parse(it.readText()).verses }
                    } catch (_: Exception) {
                        emptyList()
                    }
                }
                LaunchedEffect(Unit) {
                    cloud.awaitInitialization()
                    val local = saveRepository.load()
                    if (cloud.isSignedIn()) {
                        cloud.syncOnBootAndFlush(local)
                    } else {
                        saveRepository.persist(local)
                    }
                }
                CtvApp(
                    settingsStore = settingsStore,
                    saveRepository = saveRepository,
                    verses = verses,
                    onQuit = {
                        finishAffinity()
                    },
                )
            }
        }
    }
}
