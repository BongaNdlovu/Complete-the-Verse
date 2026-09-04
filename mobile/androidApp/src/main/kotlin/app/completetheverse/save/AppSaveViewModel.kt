package app.completetheverse.save

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import app.completetheverse.core.bank.Bank
import app.completetheverse.core.bank.Verse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AppSaveViewModel(app: Application) : AndroidViewModel(app) {
    val saveRepository = DataStoreSaveRepository(app)
    val saves = SaveCoordinator(saveRepository)

    var verses by mutableStateOf<List<Verse>>(emptyList())
        private set
    var verseError by mutableStateOf<String?>(null)
        private set
    var versesReady by mutableStateOf(false)
        private set

    init {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val list = app.assets.open("content/verses.json").bufferedReader().use {
                    Bank.parse(it.readText()).verses
                }
                withContext(Dispatchers.Main) {
                    verses = list
                    verseError = if (list.isEmpty()) "The verse bank is empty." else null
                    versesReady = true
                }
            } catch (_: Exception) {
                withContext(Dispatchers.Main) {
                    verses = emptyList()
                    verseError = "Could not load the verse bank."
                    versesReady = true
                }
            }
        }
    }
}
