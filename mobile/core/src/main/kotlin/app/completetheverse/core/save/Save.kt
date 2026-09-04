package app.completetheverse.core.save

import app.completetheverse.core.mergesave.MergeSave
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject

/** One save blob. Guest and signed-in share `ctv_save_v3`. */
typealias SaveBlob = JsonObject

object SaveJson {
    val json: Json = Json {
        encodeDefaults = true
        ignoreUnknownKeys = true
        isLenient = true
        prettyPrint = false
    }
}

object Save {
    const val SAVE_KEY = "ctv_save_v3"
    const val BROKEN_KEY = "ctv_save_v3_broken"

    val DEFAULT: SaveBlob = defaultSave()

    fun stringify(save: SaveBlob): String = SaveJson.json.encodeToString(JsonObject.serializer(), save)

    fun parse(raw: String): SaveBlob = SaveJson.json.parseToJsonElement(raw).jsonObject

    fun clone(save: SaveBlob): SaveBlob = parse(stringify(save))

    /**
     * Union an in-memory snapshot with the latest disk blob (and an optional
     * extra, e.g. a cloud pull). Overlay SRS last-writer-wins vs **disk** only so
     * a just-graded lapse beats a stale local card; a cloud [extra] then uses
     * [MergeSave.merge] / `mergeSrs` with no second overlay.
     */
    fun combineLocalSnapshots(memory: SaveBlob?, disk: SaveBlob, extra: SaveBlob? = null): SaveBlob {
        val local = if (memory == null) {
            disk
        } else {
            overlaySuccessorSrs(MergeSave.merge(memory, disk), memory)
        }
        if (extra == null) return local
        return MergeSave.merge(local, extra)
    }

    /** Same-verse cards in the successor blob win, including a local lapse. */
    fun overlaySuccessorSrs(base: SaveBlob, successor: SaveBlob): SaveBlob {
        val successorSrs = successor["srs"] as? JsonObject ?: return base
        if (successorSrs.isEmpty()) return base
        val srs = ((base["srs"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        srs.putAll(successorSrs)
        val out = base.toMutableMap()
        out["srs"] = JsonObject(srs)
        return JsonObject(out)
    }

    /**
     * Recover corrupt JSON to DEFAULT_SAVE and stash the broken raw under [BROKEN_KEY].
     */
    fun loadFromRaw(raw: String?): LoadResult {
        if (raw.isNullOrEmpty()) return LoadResult(clone(DEFAULT))
        return try {
            val parsed = parse(raw)
            LoadResult(MergeSave.migrateBlitzUnits(mergeLoadedSave(parsed)))
        } catch (_: Exception) {
            LoadResult(clone(DEFAULT), brokenRaw = raw)
        }
    }

    fun mergeLoadedSave(s: SaveBlob): SaveBlob {
        val out = DEFAULT.toMutableMap()
        out.putAll(s)
        out["v"] = JsonPrimitive(3)
        out["best"] = assign(DEFAULT["best"]!!.jsonObject, obj(s["best"]))
        out["life"] = assign(DEFAULT["life"]!!.jsonObject, obj(s["life"]))
        out["set"] = assign(DEFAULT["set"]!!.jsonObject, obj(s["set"]))
        out["daily"] = assign(DEFAULT["daily"]!!.jsonObject, obj(s["daily"]))
        out["srs"] = obj(s["srs"])
        out["habit"] = assign(
            buildJsonObject {
                put("count", 0)
                put("lastDate", "")
                put("lastDay", 0)
                put("best", 0)
                put("history", JsonObject(emptyMap()))
            },
            obj(s["habit"]),
        )
        val pilgrimIn = obj(s["pilgrim"])
        val used = pilgrimIn["usedIds"]
        out["pilgrim"] = assign(
            buildJsonObject {
                put("sites", JsonObject(emptyMap()))
                put("lastPlayed", "")
                put("started", 0)
                put("usedIds", JsonArray(emptyList()))
            },
            pilgrimIn,
            buildJsonObject {
                put("sites", obj(pilgrimIn["sites"]))
                put(
                    "usedIds",
                    if (used is JsonArray) JsonArray(used.toList()) else JsonArray(emptyList()),
                )
            },
        )
        out["artifacts"] = assign(
            buildJsonObject {
                put("unlocked", JsonObject(emptyMap()))
                put("seen", JsonObject(emptyMap()))
            },
            obj(s["artifacts"]),
        )
        val journal = s["journal"]
        out["journal"] = if (journal is JsonArray) JsonArray(journal.take(40)) else JsonArray(emptyList())
        val ghostsIn = obj(s["ghosts"])
        out["ghosts"] = assign(
            buildJsonObject {
                put("pilgrimage", JsonNull)
                put("pilgrimageBySite", JsonObject(emptyMap()))
                put("trial", JsonNull)
                put("blitz", JsonNull)
            },
            ghostsIn,
            buildJsonObject {
                put("pilgrimageBySite", obj(ghostsIn["pilgrimageBySite"]))
            },
        )
        out["tablets"] = mergeTabletsSave(s)
        return JsonObject(out)
    }

    private fun mergeTabletsSave(s: SaveBlob): JsonObject {
        val t = obj(s["tablets"])
        // Without Tablets.chapters, keep the game.js fallback ids plus any already stored.
        val ids = linkedSetOf("psalm23", "psalm91", "john1")
        ids.addAll(t.keys)
        val out = mutableMapOf<String, JsonElement>()
        val blank = buildJsonObject {
            put("best", 0)
            put("held", false)
        }
        for (id in ids) {
            out[id] = assign(blank, obj(t[id]))
        }
        return JsonObject(out)
    }

    private fun defaultSave(): SaveBlob = buildJsonObject {
        put("v", 3)
        put("xp", 0)
        put("oil", 0)
        put("illumReserve", 0)
        put("runs", 0)
        putJsonObject("best") {
            put("trial", 0)
            put("endless", 0)
            put("daily", 0)
            put("practice", 0)
            put("recall", 0)
            put("pilgrimage", 0)
            put("pilgrim-recall", 0)
            put("blitz", 0)
            put("tablets", 0)
        }
        put("seals", JsonArray(emptyList()))
        putJsonObject("life") {
            put("correct", 0)
            put("attempts", 0)
            put("bestStreak", 0)
            put("sdBest", 0)
            put("endlessBest", 0)
            put("dailyDone", 0)
            put("perfectActs", 0)
            put("typedExact", 0)
            put("typedAttempts", 0)
            put("reviewsDone", 0)
            put("sitesCleared", 0)
            put("arcsCleared", 0)
            put("blitzBest", 0)
            put("oilSpent", 0)
            put("oilEarned", 0)
            put("quickRewards", 0)
            put("quickRewardXP", 0)
            put("quickRewardOil", 0)
            put("illumRewards", 0)
            put("beatGoliathHeld", false)
            put("tabletHolds", 0)
        }
        putJsonObject("tablets") {
            putJsonObject("psalm23") {
                put("best", 0)
                put("held", false)
            }
            putJsonObject("psalm91") {
                put("best", 0)
                put("held", false)
            }
            putJsonObject("john1") {
                put("best", 0)
                put("held", false)
            }
        }
        put("books", JsonObject(emptyMap()))
        put("verse", JsonObject(emptyMap()))
        put("srs", JsonObject(emptyMap()))
        put("board", JsonArray(emptyList()))
        put("journal", JsonArray(emptyList()))
        putJsonObject("ghosts") {
            put("pilgrimage", JsonNull)
            put("pilgrimageBySite", JsonObject(emptyMap()))
            put("trial", JsonNull)
            put("blitz", JsonNull)
        }
        putJsonObject("daily") {
            put("date", "")
            put("score", 0)
        }
        putJsonObject("habit") {
            put("count", 0)
            put("lastDate", "")
            put("lastDay", 0)
            put("best", 0)
            put("history", JsonObject(emptyMap()))
        }
        putJsonObject("pilgrim") {
            put("sites", JsonObject(emptyMap()))
            put("lastPlayed", "")
            put("started", 0)
            put("usedIds", JsonArray(emptyList()))
        }
        putJsonObject("artifacts") {
            put("unlocked", JsonObject(emptyMap()))
            put("seen", JsonObject(emptyMap()))
        }
        putJsonObject("set") {
            put("music", 0.45)
            put("sfx", 0.7)
            put("musicMute", false)
            put("sfxMute", false)
            put("quality", "high")
            put("qualityLocked", false)
            put("motion", "full")
            put("reduced", false)
            put("shake", true)
            put("voice", true)
            put("diff", "disciple")
            put("tutorialDone", false)
            put("tutorialSeen", false)
            put("tabletsTutorialDone", false)
            put("introPlayed", false)
            put("liveWeather", true)
            put("coldOpenDone", false)
            put("urPrologueDone", false)
            put("quiet", false)
            put("contrast", false)
            put("haptics", true)
            put("singleTap", true)
            put("character", "amina")
            put("scholarId", "amina")
            put("playerName", "")
            put("profileDone", false)
            put("tabletStone", "sandstone")
            put("tabletTrial", false)
            put("vkb", false)
            put("characterDone", false)
        }
    }

    private fun obj(el: JsonElement?): JsonObject =
        el as? JsonObject ?: JsonObject(emptyMap())

    private fun assign(vararg objs: JsonObject): JsonObject {
        val map = mutableMapOf<String, JsonElement>()
        for (o in objs) map.putAll(o)
        return JsonObject(map)
    }
}

data class LoadResult(
    val save: SaveBlob,
    val brokenRaw: String? = null,
)
