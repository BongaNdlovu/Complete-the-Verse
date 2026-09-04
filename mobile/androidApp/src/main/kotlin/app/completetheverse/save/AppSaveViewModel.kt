package app.completetheverse.save

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import app.completetheverse.cloud.SupabaseCloudClient
import app.completetheverse.core.bank.Bank
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.cloud.Cloud
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.coroutines.cancellation.CancellationException

class AppSaveViewModel(app: Application) : AndroidViewModel(app) {
    val saveRepository = DataStoreSaveRepository(app)
    val saves = SaveCoordinator(saveRepository)
    val cloud = SupabaseCloudClient(app, saveRepository)

    var verses by mutableStateOf<List<Verse>>(emptyList())
        private set
    var tfClaims by mutableStateOf<List<TfClaim>>(emptyList())
        private set
    var verseError by mutableStateOf<String?>(null)
        private set
    var versesReady by mutableStateOf(false)
        private set
    var saveGeneration by mutableIntStateOf(0)
        private set

    var authReady by mutableStateOf(false)
        private set
    var signedIn by mutableStateOf(false)
        private set
    var signedInEmail by mutableStateOf<String?>(null)
        private set
    var authBusy by mutableStateOf(false)
        private set
    var authStatus by mutableStateOf("")
        private set
    var pendingEmail by mutableStateOf("")
        private set

    init {
        viewModelScope.launch(Dispatchers.IO) {
            saves.loadFromDisk()
            val pending = saveRepository.pendingEmail()
            withContext(Dispatchers.Main) {
                pendingEmail = pending
                saveGeneration++
            }
            try {
                cloud.awaitInitialization()
                val local = saves.persistMerged()
                val session = cloud.isSignedIn()
                withContext(Dispatchers.Main) {
                    authReady = true
                    signedIn = session
                    signedInEmail = cloud.currentEmail()
                }
                if (session) {
                    val synced = cloud.syncOnBoot(local)
                    saves.persistMerged(synced.save)
                    if (synced.ok) cloud.flushBlitzBest(saves.snapshot())
                    withContext(Dispatchers.Main) {
                        signedIn = cloud.isSignedIn()
                        signedInEmail = cloud.currentEmail()
                        saveGeneration++
                    }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                withContext(Dispatchers.Main) { authReady = true }
            }
        }
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val bank = app.assets.open("content/verses.json").bufferedReader().use {
                    Bank.parse(it.readText())
                }
                withContext(Dispatchers.Main) {
                    verses = bank.verses
                    tfClaims = bank.tfClaims
                    verseError = if (bank.verses.isEmpty()) "The verse bank is empty." else null
                    versesReady = true
                }
            } catch (_: Exception) {
                withContext(Dispatchers.Main) {
                    verses = emptyList()
                    tfClaims = emptyList()
                    verseError = "Could not load the verse bank."
                    versesReady = true
                }
            }
        }
    }

    fun sendCode(email: String) {
        if (authBusy) return
        viewModelScope.launch {
            authBusy = true
            authStatus = ""
            try {
                val res = cloud.signInWithEmail(email)
                pendingEmail = email.trim()
                authStatus = Cloud.authNotice(if (res.ok) "sent" else res.reason)
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                authStatus = Cloud.authNotice("unavailable")
            } finally {
                authBusy = false
            }
        }
    }

    fun verify(email: String, otp: String) {
        if (authBusy) return
        viewModelScope.launch {
            authBusy = true
            authStatus = ""
            try {
                val res = cloud.verifyOtp(email, otp)
                if (res.ok) {
                    val synced = cloud.syncOnBootAndFlush(saves.snapshot())
                    saves.persistMerged(synced)
                    signedIn = cloud.isSignedIn()
                    signedInEmail = cloud.currentEmail()
                    saveGeneration++
                }
                authStatus = Cloud.authNotice(if (res.ok) "verified" else res.reason)
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                authStatus = Cloud.authNotice("unavailable")
            } finally {
                authBusy = false
            }
        }
    }

    fun signOut() {
        if (authBusy) return
        viewModelScope.launch {
            authBusy = true
            try {
                cloud.signOut()
            } finally {
                signedIn = false
                signedInEmail = null
                authStatus = ""
                authBusy = false
            }
        }
    }

    fun clearAuthStatus() {
        authStatus = ""
    }
}
