package app.completetheverse.cloud

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import app.completetheverse.core.cloud.AuthResult
import app.completetheverse.core.cloud.Cloud
import app.completetheverse.core.cloud.CloudConfig
import app.completetheverse.core.cloud.SyncResult
import app.completetheverse.core.records.BlitzBoardRow
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.save.DataStoreSaveRepository
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.OtpType
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.OTP
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.functions.functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import app.completetheverse.core.save.SaveJson
import io.ktor.client.statement.bodyAsText
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withTimeout
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put
import java.io.IOException
import java.time.Instant
import kotlin.coroutines.cancellation.CancellationException

class SupabaseCloudClient(
    context: Context,
    private val saveRepository: DataStoreSaveRepository,
) {
    private val appContext = context.applicationContext
    private val emailRe = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
    private var lastRevision: Long = 0

    private val supabase = createSupabaseClient(CloudConfig.URL, CloudConfig.ANON_KEY) {
        install(Auth)
        install(Postgrest)
        install(Functions)
    }

    fun configured(): Boolean = CloudConfig.isConfigured()

    fun isSignedIn(): Boolean = supabase.auth.currentUserOrNull()?.id != null

    fun currentEmail(): String? = supabase.auth.currentUserOrNull()?.email

    suspend fun awaitInitialization() {
        supabase.auth.awaitInitialization()
    }

    suspend fun signInWithEmail(email: String): AuthResult {
        if (!configured()) return AuthResult(ok = false, reason = "not-configured")
        if (!isOnline()) return AuthResult(ok = false, reason = "offline")
        val trimmed = email.trim()
        if (!emailRe.matches(trimmed)) return AuthResult(ok = false, reason = "invalid-email")
        saveRepository.setPendingEmail(trimmed)
        return try {
            withTimeout(8_000) {
                supabase.auth.signInWith(OTP) {
                    this.email = trimmed
                }
            }
            AuthResult(ok = true, reason = "sent")
        } catch (e: TimeoutCancellationException) {
            AuthResult(ok = false, reason = if (!isOnline()) "offline" else "unavailable")
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            val msg = (e.message ?: "").lowercase()
            when {
                "rate" in msg || "too many" in msg -> AuthResult(ok = false, reason = "rate-limited")
                "invalid" in msg && "email" in msg -> AuthResult(ok = false, reason = "invalid-email")
                else -> AuthResult(ok = false, reason = if (!isOnline()) "offline" else "unavailable")
            }
        }
    }

    suspend fun verifyOtp(email: String, token: String): AuthResult {
        if (!configured()) return AuthResult(ok = false, reason = "not-configured")
        if (!isOnline()) return AuthResult(ok = false, reason = "offline")
        val trimmedEmail = email.trim().ifEmpty { saveRepository.pendingEmail() }
        val trimmedToken = token.trim()
        if (trimmedEmail.isEmpty() || !emailRe.matches(trimmedEmail)) {
            return AuthResult(ok = false, reason = "invalid-email")
        }
        if (trimmedToken.length < 6) return AuthResult(ok = false, reason = "invalid-token")
        return try {
            withTimeout(10_000) {
                supabase.auth.verifyEmailOtp(
                    type = OtpType.Email.EMAIL,
                    email = trimmedEmail,
                    token = trimmedToken,
                )
            }
            if (isSignedIn()) AuthResult(ok = true, reason = "verified")
            else AuthResult(ok = false, reason = "no-session")
        } catch (e: TimeoutCancellationException) {
            AuthResult(ok = false, reason = "unavailable")
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            val msg = (e.message ?: "").lowercase()
            when {
                "expired" in msg -> AuthResult(ok = false, reason = "otp-expired")
                e is IOException -> AuthResult(ok = false, reason = "unavailable")
                else -> AuthResult(ok = false, reason = "invalid-token", message = e.message)
            }
        }
    }

    suspend fun signOut(): AuthResult {
        try {
            supabase.auth.signOut()
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
        }
        lastRevision = 0
        Cloud.setLastSubmitVia(null)
        return AuthResult(ok = true)
    }

    suspend fun pullSave(): PullSaveResult {
        val userId = supabase.auth.currentUserOrNull()?.id
            ?: return PullSaveResult(ok = false, reason = "signed-out")
        return try {
            val rows = withTimeout(8_000) {
                supabase.from("saves").select {
                    filter {
                        eq("user_id", userId)
                    }
                }.decodeList<JsonObject>()
            }
            PullSaveResult(ok = true, row = rows.firstOrNull())
        } catch (e: TimeoutCancellationException) {
            PullSaveResult(ok = false, reason = "pull-failed")
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            PullSaveResult(ok = false, reason = "pull-failed")
        }
    }

    suspend fun pushSave(save: SaveBlob): AuthResult {
        val userId = supabase.auth.currentUserOrNull()?.id
            ?: return AuthResult(ok = false, reason = "signed-out")
        return try {
            val peek = pullSave()
            if (!peek.ok) return AuthResult(ok = false, reason = peek.reason ?: "rejected")
            val remoteRev = peek.row?.get("revision")?.jsonPrimitive?.longOrNull ?: 0L
            if (lastRevision > 0 && remoteRev > lastRevision) {
                return AuthResult(ok = false, reason = "stale-revision")
            }
            val nextRev = maxOf(lastRevision, remoteRev) + 1
            val row = buildJsonObject {
                put("user_id", userId)
                put("payload", save)
                put("revision", nextRev)
                put("client_updated_at", Instant.now().toString())
            }
            withTimeout(8_000) {
                supabase.from("saves").upsert(row)
            }
            lastRevision = nextRev
            AuthResult(ok = true)
        } catch (e: TimeoutCancellationException) {
            AuthResult(ok = false, reason = "rejected")
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            AuthResult(ok = false, reason = "rejected")
        }
    }

    suspend fun syncOnBoot(localSave: SaveBlob): SyncResult {
        if (!isSignedIn()) return SyncResult(ok = false, reason = "signed-out", save = localSave)
        val pull = pullSave()
        if (!pull.ok) return SyncResult(ok = false, reason = pull.reason ?: "pull-failed", save = localSave)
        val remote = pull.row
        val payload = remote?.get("payload") as? JsonObject
        if (payload == null || payload.isEmpty()) {
            pushSave(localSave)
            return SyncResult(ok = true, save = localSave, merged = false)
        }
        lastRevision = remote["revision"]?.jsonPrimitive?.longOrNull ?: lastRevision
        val merged = Cloud.mergeSave(localSave, payload)
        pushSave(merged)
        return SyncResult(ok = true, save = merged, merged = true)
    }

    suspend fun syncOnBootAndFlush(localSave: SaveBlob): SaveBlob {
        val sync = syncOnBoot(localSave)
        val save = sync.save
        saveRepository.persist(save)
        if (sync.ok) flushBlitzBest(save)
        return save
    }

    suspend fun flushBlitzBest(save: SaveBlob): AuthResult {
        if (!isSignedIn()) return AuthResult(ok = false, reason = "signed-out")
        if (!Cloud.shouldFlushBlitz(signedIn = true, save = save)) {
            return AuthResult(ok = false, reason = "empty")
        }
        return submitBlitz(Cloud.blitzSubmitPayload(save))
    }

    suspend fun fetchBlitzBoard(limit: Int = 25): List<BlitzBoardRow> {
        if (!isSignedIn()) return emptyList()
        Cloud.setBoardLoadFailed(null)
        return try {
            val rows = withTimeout(8_000) {
                supabase.from("blitz_scores").select(
                    Columns.raw("id, user_id, score, survived_ms, diff, profiles(display_name)"),
                ) {
                    order("score", Order.DESCENDING)
                    order("survived_ms", Order.DESCENDING)
                    limit(limit.toLong())
                }.decodeList<JsonObject>()
            }
            val mine = supabase.auth.currentUserOrNull()?.id
            rows.mapIndexed { i, row ->
                BlitzBoardRow(
                    rank = i + 1,
                    id = row["id"]?.jsonPrimitive?.contentOrNull ?: "",
                    name = displayNameOf(row["profiles"]),
                    score = jsonInt(row["score"]),
                    survivedMs = row["survived_ms"]?.let { jsonLong(it) },
                    mine = mine != null && row["user_id"]?.jsonPrimitive?.contentOrNull == mine,
                )
            }
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            Cloud.setBoardLoadFailed(if (!isOnline()) "offline" else "load-failed")
            emptyList()
        }
    }

    private fun displayNameOf(el: JsonElement?): String {
        val raw = when (el) {
            is JsonObject -> el["display_name"]?.jsonPrimitive?.contentOrNull
            is JsonArray -> (el.firstOrNull() as? JsonObject)?.get("display_name")
                ?.jsonPrimitive?.contentOrNull
            is JsonPrimitive -> el.contentOrNull
            else -> null
        }?.trim().orEmpty()
        return raw.take(32).ifBlank { "Pilgrim" }
    }

    private fun jsonInt(el: JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }

    private fun jsonLong(el: JsonElement?): Long? {
        val p = el as? JsonPrimitive ?: return null
        p.longOrNull?.let { return it }
        p.doubleOrNull?.let { return it.toLong() }
        return p.content.toLongOrNull()
    }

    suspend fun submitBlitz(payload: JsonObject): AuthResult {
        if (!isSignedIn()) return AuthResult(ok = false, reason = "signed-out")
        return try {
            val response = withTimeout(8_000) {
                supabase.functions.invoke(
                    function = "submit-score",
                    body = payload,
                    headers = Headers.build {
                        append(HttpHeaders.ContentType, "application/json")
                    },
                )
            }
            val body = try {
                SaveJson.json.parseToJsonElement(response.bodyAsText()).jsonObject
            } catch (_: Exception) {
                null
            }
            val error = body?.get("error")?.jsonPrimitive?.contentOrNull
            when {
                error == "rate-limited" -> {
                    Cloud.setLastSubmitVia(null)
                    AuthResult(ok = false, reason = "rate-limited")
                }
                error == "auth" -> {
                    Cloud.setLastSubmitVia(null)
                    AuthResult(ok = false, reason = "signed-out")
                }
                error != null -> {
                    Cloud.setLastSubmitVia(null)
                    AuthResult(ok = false, reason = "trusted-submit-unavailable")
                }
                else -> {
                    Cloud.setLastSubmitVia("edge")
                    AuthResult(ok = true)
                }
            }
        } catch (e: TimeoutCancellationException) {
            Cloud.setLastSubmitVia(null)
            AuthResult(ok = false, reason = "trusted-submit-unavailable")
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            Cloud.setLastSubmitVia(null)
            AuthResult(ok = false, reason = "trusted-submit-unavailable")
        }
    }

    private fun isOnline(): Boolean {
        val cm = appContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            ?: return true
        val network = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}

data class PullSaveResult(
    val ok: Boolean,
    val row: JsonObject? = null,
    val reason: String? = null,
)
