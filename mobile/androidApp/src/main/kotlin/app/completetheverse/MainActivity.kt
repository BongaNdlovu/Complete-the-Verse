package app.completetheverse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import app.completetheverse.cloud.SupabaseCloudClient
import app.completetheverse.core.cloud.AuthNotice
import app.completetheverse.save.DataStoreSaveRepository
import app.completetheverse.ui.SignInScreen
import app.completetheverse.ui.theme.CompleteTheVerseTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val saveRepository = DataStoreSaveRepository(applicationContext)
        val cloud = SupabaseCloudClient(applicationContext, saveRepository)

        setContent {
            CompleteTheVerseTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background,
                ) {
                    val scope = rememberCoroutineScope()
                    var email by remember { mutableStateOf("") }
                    var otp by remember { mutableStateOf("") }
                    var status by remember { mutableStateOf("") }
                    var busy by remember { mutableStateOf(false) }
                    var signedIn by remember { mutableStateOf(false) }
                    var signedInEmail by remember { mutableStateOf<String?>(null) }

                    LaunchedEffect(Unit) {
                        cloud.awaitInitialization()
                        email = saveRepository.pendingEmail()
                        val local = saveRepository.load()
                        if (cloud.isSignedIn()) {
                            signedIn = true
                            signedInEmail = cloud.currentEmail()
                            cloud.syncOnBootAndFlush(local)
                        } else {
                            saveRepository.persist(local)
                        }
                    }

                    SignInScreen(
                        email = email,
                        otp = otp,
                        status = status,
                        busy = busy,
                        signedIn = signedIn,
                        signedInEmail = signedInEmail,
                        onEmailChange = { email = it },
                        onOtpChange = { otp = it },
                        onSendCode = {
                            scope.launch {
                                busy = true
                                val result = cloud.signInWithEmail(email)
                                status = AuthNotice.notice(if (result.ok) "sent" else result.reason)
                                busy = false
                            }
                        },
                        onVerify = {
                            scope.launch {
                                busy = true
                                val result = cloud.verifyOtp(email, otp)
                                if (result.ok) {
                                    val local = saveRepository.load()
                                    cloud.syncOnBootAndFlush(local)
                                    signedIn = true
                                    signedInEmail = cloud.currentEmail()
                                    otp = ""
                                    status = AuthNotice.notice("verified")
                                } else {
                                    status = AuthNotice.notice(result.reason)
                                }
                                busy = false
                            }
                        },
                        onSignOut = {
                            scope.launch {
                                busy = true
                                cloud.signOut()
                                signedIn = false
                                signedInEmail = null
                                status = "Signed out — progress stays on this device"
                                busy = false
                            }
                        },
                    )
                }
            }
        }
    }
}
