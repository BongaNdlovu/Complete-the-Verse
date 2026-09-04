package app.completetheverse.core.cloud

import app.completetheverse.core.mergesave.MergeSave
import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonObject

/**
 * Pure cloud helpers for JVM tests. Network lives in androidApp.
 */
object Cloud {
    private val EMAIL_RE = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")

    private var lastSubmitViaValue: String? = null
    private var lastBoardError: String? = null

    fun mergeSave(local: SaveBlob?, remote: SaveBlob?): SaveBlob = MergeSave.merge(local, remote)

    fun migrateBlitzUnits(out: SaveBlob): SaveBlob = MergeSave.migrateBlitzUnits(out)

    fun configured(): Boolean = CloudConfig.isConfigured()

    fun isSignedIn(): Boolean = false

    fun trustLabel(via: String?): String = TrustLabel.label(via)

    fun authNotice(reason: String?): String = AuthNotice.notice(reason)

    fun lastSubmitVia(): String? = lastSubmitViaValue

    fun setLastSubmitVia(value: String?) {
        lastSubmitViaValue = value
    }

    fun boardLoadFailed(): String? = lastBoardError

    fun setBoardLoadFailed(value: String?) {
        lastBoardError = value
    }

    fun checkUrlAuthError(): UrlAuthError? = null

    fun verifyOtp(email: String, token: String): AuthResult {
        val trimmedEmail = email.trim()
        val trimmedToken = token.trim()
        if (trimmedEmail.isEmpty() || !EMAIL_RE.matches(trimmedEmail)) {
            return AuthResult(ok = false, reason = "invalid-email")
        }
        if (trimmedToken.length < 6) {
            return AuthResult(ok = false, reason = "invalid-token")
        }
        return AuthResult(ok = false, reason = "not-configured")
    }

    fun shouldFlushBlitz(signedIn: Boolean, save: SaveBlob): Boolean =
        MergeSave.shouldFlushBlitz(signedIn, save)

    fun blitzSubmitPayload(save: SaveBlob): JsonObject = MergeSave.blitzSubmitPayload(save)
}

data class AuthResult(
    val ok: Boolean,
    val reason: String? = null,
    val message: String? = null,
)

data class UrlAuthError(
    val error: String?,
    val code: String?,
    val description: String,
)

data class SyncResult(
    val ok: Boolean,
    val reason: String? = null,
    val save: SaveBlob,
    val merged: Boolean = false,
)
