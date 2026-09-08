package app.completetheverse.core.play

import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlin.math.min
import kotlin.math.round

data class GhostSample(
    val t: Long,
    val p: Double,
)

data class GhostRecord(
    val score: Int,
    val samples: List<GhostSample>,
    val totalMs: Long,
    val name: String,
)

data class CloudGhost(
    val name: String,
    val bestScore: Int,
)

object Ghosts {
    const val BLITZ_CAP = 30

    fun keepBest(slot: GhostRecord?, record: GhostRecord, score: Int): GhostRecord {
        if (slot == null || score >= slot.score) return record
        return slot
    }

    fun keepBestGhost(existing: GhostRecord?, candidate: GhostRecord): GhostRecord =
        keepBest(existing, candidate, candidate.score)

    fun ghostKey(mode: String): String? = when (mode) {
        "team" -> null
        "blitz" -> "blitz"
        "pilgrimage", "pilgrim-recall" -> "pilgrimage"
        "trial" -> "trial"
        else -> null
    }

    fun isPilgrim(mode: String): Boolean = mode == "pilgrimage" || mode == "pilgrim-recall"

    fun ghostScore(mode: String, total: Int, correct: Int): Int =
        if (mode == "blitz") correct else total

    fun progress(
        mode: String,
        index: Int,
        correct: Int,
        questionCount: Int,
        siteVerseCount: Int = questionCount,
        trialTotal: Int = questionCount,
    ): Double {
        val p = when {
            isPilgrim(mode) -> index.toDouble() / siteVerseCount.coerceAtLeast(1)
            mode == "blitz" -> correct.toDouble() / BLITZ_CAP
            mode == "trial" -> index.toDouble() / trialTotal.coerceAtLeast(1)
            else -> index.toDouble() / 8.0
        }
        return round(min(1.0, p) * 100.0) / 100.0
    }

    fun sample(
        samples: List<GhostSample>,
        elapsedMs: Long,
        progress: Double,
    ): List<GhostSample> = samples + GhostSample(elapsedMs, progress)

    fun atElapsed(samples: List<GhostSample>, elapsedMs: Long): Double {
        if (samples.isEmpty()) return 0.0
        if (elapsedMs <= samples.first().t) return samples.first().p
        for (i in 1 until samples.size) {
            if (elapsedMs <= samples[i].t) {
                val a = samples[i - 1]
                val b = samples[i]
                val span = (b.t - a.t).coerceAtLeast(1L)
                val k = (elapsedMs - a.t).toDouble() / span
                return a.p + (b.p - a.p) * k
            }
        }
        return samples.last().p
    }

    fun endRun(
        save: SaveBlob,
        mode: String,
        siteId: String?,
        total: Int,
        correct: Int,
        survivedMs: Long,
        samples: List<GhostSample>,
        playerName: String? = null,
    ): SaveBlob {
        val key = ghostKey(mode) ?: return save
        if (samples.isEmpty()) return save
        val score = ghostScore(mode, total, correct)
        val name = playerName?.trim()?.ifEmpty { null }
            ?: Save.stringSet(save, "playerName").trim().ifEmpty { "Your previous run" }
        val record = GhostRecord(score = score, samples = samples, totalMs = survivedMs, name = name)
        val ghosts = obj(save["ghosts"]).toMutableMap()
        if (isPilgrim(mode)) {
            val bySite = obj(ghosts["pilgrimageBySite"]).toMutableMap()
            if (!siteId.isNullOrEmpty()) {
                bySite[siteId] = toJson(keepBest(fromJson(bySite[siteId]), record, score))
            }
            ghosts["pilgrimageBySite"] = JsonObject(bySite)
            ghosts["pilgrimage"] = toJson(keepBest(fromJson(ghosts["pilgrimage"]), record, score))
        } else {
            ghosts[key] = toJson(keepBest(fromJson(ghosts[key]), record, score))
        }
        val out = save.toMutableMap()
        out["ghosts"] = JsonObject(ghosts)
        return JsonObject(out)
    }

    fun applyEndRunGhosts(
        save: SaveBlob,
        mode: String,
        result: PlayResult,
        siteId: String? = null,
        samples: List<GhostSample> = emptyList(),
        playerName: String? = null,
    ): SaveBlob = endRun(
        save = save,
        mode = mode,
        siteId = siteId,
        total = result.total,
        correct = result.correct,
        survivedMs = result.elapsedMs,
        samples = samples,
        playerName = playerName,
    )

    fun merge(local: JsonObject, remote: JsonObject): JsonObject {
        val bySite = linkedMapOf<String, JsonElement>()
        val localSites = obj(local["pilgrimageBySite"])
        val remoteSites = obj(remote["pilgrimageBySite"])
        val siteKeys = linkedSetOf<String>()
        siteKeys.addAll(localSites.keys)
        siteKeys.addAll(remoteSites.keys)
        for (k in siteKeys) {
            bySite[k] = keepBestJson(localSites[k], remoteSites[k])
        }
        return buildJsonObject {
            put("pilgrimage", keepBestJson(local["pilgrimage"], remote["pilgrimage"]))
            put("trial", keepBestJson(local["trial"], remote["trial"]))
            put("blitz", keepBestJson(local["blitz"], remote["blitz"]))
            put("pilgrimageBySite", JsonObject(bySite))
        }
    }

    fun keepBestJson(a: JsonElement?, b: JsonElement?): JsonElement {
        val left = fromJson(a)
        val right = fromJson(b)
        return when {
            left == null && right == null -> JsonNull
            left == null -> b ?: JsonNull
            right == null -> a ?: JsonNull
            else -> toJson(keepBest(left, right, right.score))
        }
    }

    fun cloudMode(mode: String): String? = when (mode) {
        "trial" -> "trial"
        "pilgrimage", "pilgrim-recall" -> "pilgrimage"
        "blitz" -> "blitz"
        "live" -> "live"
        else -> null
    }

    fun cloudRunKey(mode: String, siteId: String?): String = when (mode) {
        "trial" -> "campaign"
        "blitz" -> "blitz"
        "live" -> (siteId ?: "").uppercase().trim()
        else -> if (!siteId.isNullOrEmpty()) "site:$siteId" else "campaign"
    }

    fun timelineJson(samples: List<GhostSample>, totalMs: Long, endP: Double): JsonObject = buildJsonObject {
        put("version", 1)
        put("samples", samplesToJson(samples))
        put("total_ms", totalMs)
        put("end_p", endP)
    }

    fun recordOf(save: SaveBlob, mode: String, siteId: String?): GhostRecord? {
        val ghosts = obj(save["ghosts"])
        return if (isPilgrim(mode) && !siteId.isNullOrEmpty()) {
            fromJson(obj(ghosts["pilgrimageBySite"])[siteId]) ?: fromJson(ghosts["pilgrimage"])
        } else {
            fromJson(ghosts[ghostKey(mode)])
        }
    }

    fun toJson(record: GhostRecord): JsonObject = buildJsonObject {
        put("score", record.score)
        put("samples", samplesToJson(record.samples))
        put("total_ms", record.totalMs)
        put("name", record.name)
    }

    fun fromJson(el: JsonElement?): GhostRecord? {
        val obj = el as? JsonObject ?: return null
        val score = jsonInt(obj["score"])
        val samplesEl = obj["samples"] as? JsonArray ?: return GhostRecord(
            score = score,
            samples = emptyList(),
            totalMs = jsonLong(obj["total_ms"] ?: obj["survived_ms"]),
            name = obj["name"]?.jsonPrimitive?.contentOrNull ?: "Your previous run",
        )
        val samples = samplesEl.mapNotNull { item ->
            val row = item as? JsonObject ?: return@mapNotNull null
            GhostSample(jsonLong(row["t"]), jsonDouble(row["p"]))
        }
        return GhostRecord(
            score = score,
            samples = samples,
            totalMs = jsonLong(obj["total_ms"] ?: obj["survived_ms"]),
            name = obj["name"]?.jsonPrimitive?.contentOrNull ?: "Your previous run",
        )
    }

    private fun samplesToJson(samples: List<GhostSample>): JsonArray = buildJsonArray {
        for (s in samples) {
            add(
                buildJsonObject {
                    put("t", s.t)
                    put("p", s.p)
                },
            )
        }
    }

    private fun obj(el: JsonElement?): JsonObject = el as? JsonObject ?: JsonObject(emptyMap())

    private fun jsonInt(el: JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }

    private fun jsonLong(el: JsonElement?): Long {
        val p = el as? JsonPrimitive ?: return 0L
        p.doubleOrNull?.let { return it.toLong() }
        return p.content.toLongOrNull() ?: 0L
    }

    private fun jsonDouble(el: JsonElement?): Double {
        val p = el as? JsonPrimitive ?: return 0.0
        return p.doubleOrNull ?: p.content.toDoubleOrNull() ?: 0.0
    }
}
