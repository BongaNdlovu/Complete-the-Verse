package app.completetheverse.save

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import kotlinx.coroutines.flow.first

private val Context.ctvSaveStore: DataStore<Preferences> by preferencesDataStore(name = Save.SAVE_KEY)

class DataStoreSaveRepository(context: Context) {
    private val dataStore = context.applicationContext.ctvSaveStore

    suspend fun load(): SaveBlob {
        val prefs = dataStore.data.first()
        val raw = prefs[saveKey]
        val result = Save.loadFromRaw(raw)
        if (result.brokenRaw != null) {
            dataStore.edit { store ->
                store[brokenKey] = result.brokenRaw!!
                store[saveKey] = Save.stringify(result.save)
            }
        }
        return result.save
    }

    suspend fun persist(save: SaveBlob) {
        dataStore.edit { store ->
            store[saveKey] = Save.stringify(save)
        }
    }

    suspend fun pendingEmail(): String =
        dataStore.data.first()[pendingEmailKey].orEmpty()

    suspend fun setPendingEmail(email: String) {
        dataStore.edit { store ->
            if (email.isEmpty()) store.remove(pendingEmailKey)
            else store[pendingEmailKey] = email
        }
    }

    companion object {
        private val saveKey = stringPreferencesKey(Save.SAVE_KEY)
        private val brokenKey = stringPreferencesKey(Save.BROKEN_KEY)
        private val pendingEmailKey = stringPreferencesKey("cloud_pending_email")
    }
}
