package app.completetheverse.core.mergesave

import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlin.math.max

object MergeSave {
    private const val BLITZ_VERSE_CEILING = 200.0

    fun merge(local: SaveBlob?, remote: SaveBlob?): SaveBlob {
        val loc = local ?: JsonObject(emptyMap())
        val rem = remote ?: JsonObject(emptyMap())
        if (isJsFalsy(rem["pilgrim"]) && isJsFalsy(rem["best"]) && isJsFalsy(rem["srs"])) {
            return migrateBlitzUnits(Save.clone(loc))
        }
        val out = Save.clone(loc).toMutableMap()
        out["v"] = JsonPrimitive(max(orDefault(loc["v"], 3), orDefault(rem["v"], 3)))
        out["xp"] = maxNum(loc["xp"], rem["xp"])
        out["oil"] = maxNum(loc["oil"], rem["oil"])
        out["illumReserve"] = maxNum(loc["illumReserve"], rem["illumReserve"])
        out["runs"] = maxNum(loc["runs"], rem["runs"])
        out["seals"] = unionArr(loc["seals"], rem["seals"])
        mergeBestLife(out, loc, rem)
        out["books"] = mergeMapMax(obj(loc["books"]), obj(rem["books"]), listOf("c", "a"))
        out["verse"] = mergeMapMax(obj(loc["verse"]), obj(rem["verse"]), listOf("c", "a", "streak", "best"))
        out["srs"] = mergeSrs(obj(loc["srs"]), obj(rem["srs"]))
        out["pilgrim"] = mergePilgrim(obj(loc["pilgrim"]), obj(rem["pilgrim"]))
        out["tablets"] = mergeTablets(obj(loc["tablets"]), obj(rem["tablets"]))
        out["daily"] = mergeDaily(loc, rem)
        out["set"] = assign(obj(rem["set"]), obj(loc["set"]))
        val localBoard = loc["board"]
        out["board"] = if (localBoard is JsonArray && localBoard.isNotEmpty()) {
            localBoard
        } else {
            val rb = rem["board"]
            if (rb != null && rb !is JsonNull) rb else JsonArray(emptyList())
        }
        return migrateBlitzUnits(JsonObject(out))
    }

    fun migrateBlitzUnits(out: SaveBlob): SaveBlob {
        val map = out.toMutableMap()
        val best = obj(map["best"]).toMutableMap()
        val life = obj(map["life"]).toMutableMap()
        val bestBlitz = jsNumber(best["blitz"])
        val verses = jsNumber(life["blitzBest"])
        if (bestBlitz > BLITZ_VERSE_CEILING && bestBlitz != verses) {
            best["blitz"] = jsonNumber(verses)
        }
        map["best"] = JsonObject(best)
        map["life"] = JsonObject(life)
        val ghostsEl = map["ghosts"]
        if (ghostsEl is JsonObject && ghostsEl["blitz"] != null && ghostsEl["blitz"] !is JsonNull) {
            val g = obj(ghostsEl["blitz"])
            val gs = jsNumber(g["score"])
            val newBest = jsNumber(JsonObject(best)["blitz"])
            if (gs > BLITZ_VERSE_CEILING && gs != newBest) {
                val ghosts = ghostsEl.toMutableMap()
                ghosts["blitz"] = JsonNull
                map["ghosts"] = JsonObject(ghosts)
            }
        }
        return JsonObject(map)
    }

    fun mergeSrs(a: JsonObject, b: JsonObject): JsonObject {
        val keys = linkedSetOf<String>()
        keys.addAll(a.keys)
        keys.addAll(b.keys)
        val out = mutableMapOf<String, JsonElement>()
        for (k in keys) {
            val x = a[k]
            val y = b[k]
            if (x == null || x is JsonNull) {
                if (y != null) out[k] = y
                continue
            }
            if (y == null || y is JsonNull) {
                out[k] = x
                continue
            }
            val xr = jsNumber(x.jsonObjectOrNull()?.get("reps"))
            val yr = jsNumber(y.jsonObjectOrNull()?.get("reps"))
            out[k] = when {
                yr > xr -> y
                xr > yr -> x
                else -> {
                    val xl = jsNumber(x.jsonObjectOrNull()?.get("last"))
                    val yl = jsNumber(y.jsonObjectOrNull()?.get("last"))
                    if (yl >= xl) y else x
                }
            }
        }
        return JsonObject(out)
    }

    fun mergePilgrim(a: JsonObject, b: JsonObject): JsonObject {
        val aSites = obj(a["sites"])
        val bSites = obj(b["sites"])
        val keys = linkedSetOf<String>()
        keys.addAll(aSites.keys)
        keys.addAll(bSites.keys)
        val sites = mutableMapOf<String, JsonElement>()
        for (k in keys) {
            sites[k] = mergeSiteRec(obj(aSites[k]), obj(bSites[k]))
        }
        return buildJsonObject {
            put("sites", JsonObject(sites))
            put("lastPlayed", firstTruthyString(b["lastPlayed"], a["lastPlayed"]))
            put("started", jsonNumber(firstTruthyNumber(a["started"], b["started"])))
            put("usedIds", unionArr(a["usedIds"], b["usedIds"]))
        }
    }

    fun mergeTablets(a: JsonObject, b: JsonObject): JsonObject {
        val keys = linkedSetOf<String>()
        keys.addAll(a.keys)
        keys.addAll(b.keys)
        val out = mutableMapOf<String, JsonElement>()
        for (k in keys) {
            val x = obj(a[k])
            val y = obj(b[k])
            val row = mutableMapOf<String, JsonElement>(
                "best" to maxNum(x["best"], y["best"]),
                "held" to JsonPrimitive(isJsTruthy(x["held"]) || isJsTruthy(y["held"])),
            )
            val lv = mutableMapOf<String, JsonElement>()
            val xLevels = obj(x["levels"])
            val yLevels = obj(y["levels"])
            for (n in 1..3) {
                val ns = n.toString()
                val lx = obj(xLevels[ns] ?: xLevels[n.toString()])
                val ly = obj(yLevels[ns] ?: yLevels[n.toString()])
                if (!(isJsTruthy(lx["held"]) || isJsTruthy(lx["best"]) || isJsTruthy(ly["held"]) || isJsTruthy(ly["best"]))) {
                    continue
                }
                lv[ns] = buildJsonObject {
                    put("best", maxNum(lx["best"], ly["best"]))
                    put("held", isJsTruthy(lx["held"]) || isJsTruthy(ly["held"]))
                }
            }
            if (lv.isNotEmpty()) row["levels"] = JsonObject(lv)
            out[k] = JsonObject(row)
        }
        return JsonObject(out)
    }

    fun mergeDaily(local: SaveBlob, remote: SaveBlob): JsonObject {
        val ld = obj(local["daily"])
        val rd = obj(remote["daily"])
        val ldDate = ld["date"]?.jsonPrimitive?.contentOrNull
        val rdDate = rd["date"]?.jsonPrimitive?.contentOrNull
        if (!ldDate.isNullOrEmpty() && !rdDate.isNullOrEmpty() && ldDate == rdDate) {
            return buildJsonObject {
                put("date", ldDate)
                put("score", maxNum(ld["score"], rd["score"]))
            }
        }
        if (!ldDate.isNullOrEmpty()) {
            return buildJsonObject {
                put("date", ldDate)
                put("score", jsonNumber(jsNumber(ld["score"])))
            }
        }
        return buildJsonObject {
            put("date", rdDate ?: "")
            put("score", jsonNumber(jsNumber(rd["score"])))
        }
    }

    fun mergeBestLife(out: MutableMap<String, JsonElement>, local: SaveBlob, remote: SaveBlob) {
        val lb = obj(local["best"])
        val rb = obj(remote["best"])
        val best = assign(rb, lb).toMutableMap()
        for (k in best.keys.toList()) {
            best[k] = maxNum(lb[k], rb[k])
        }
        out["best"] = JsonObject(best)
        val ll = obj(local["life"])
        val rl = obj(remote["life"])
        val life = assign(rl, ll).toMutableMap()
        val lifeKeys = linkedSetOf<String>()
        lifeKeys.addAll(ll.keys)
        lifeKeys.addAll(rl.keys)
        for (k in lifeKeys) {
            life[k] = maxNum(ll[k], rl[k])
        }
        out["life"] = JsonObject(life)
    }

    fun maxNum(a: JsonElement?, b: JsonElement?): JsonPrimitive {
        val an = jsNumber(a)
        val bn = jsNumber(b)
        return jsonNumber(if (an > bn) an else bn)
    }

    fun unionArr(a: JsonElement?, b: JsonElement?): JsonArray {
        val out = mutableListOf<JsonElement>()
        val seen = mutableSetOf<String>()
        val items = mutableListOf<JsonElement>()
        if (a is JsonArray) items.addAll(a)
        if (b is JsonArray) items.addAll(b)
        for (x in items) {
            val k = jsString(x)
            if (k !in seen) {
                seen.add(k)
                out.add(x)
            }
        }
        return JsonArray(out)
    }

    fun shouldFlushBlitz(signedIn: Boolean, save: SaveBlob): Boolean {
        if (!signedIn) return false
        return blitzBest(save) > 0
    }

    fun blitzBest(save: SaveBlob): Int = jsNumber(obj(save["best"])["blitz"]).toInt()

    fun blitzSubmitPayload(save: SaveBlob): JsonObject {
        val score = blitzBest(save)
        val diff = obj(save["set"])["diff"]?.jsonPrimitive?.contentOrNull ?: "watchman"
        val ghost = obj(save["ghosts"])["blitz"]
        val survived = when (ghost) {
            is JsonObject -> jsNumber(ghost["survived_ms"] ?: ghost["total_ms"])
            else -> 0.0
        }
        return buildJsonObject {
            put("kind", "blitz")
            put("score", score)
            put("correct", score)
            put("survived_ms", survived.toInt())
            put("diff", diff)
        }
    }

    private fun mergeSiteRec(a: JsonObject, b: JsonObject): JsonObject = buildJsonObject {
        put("cleared", isJsTruthy(a["cleared"]) || isJsTruthy(b["cleared"]))
        put("best", maxNum(a["best"], b["best"]))
        put("bestAccuracy", maxNum(a["bestAccuracy"], b["bestAccuracy"]))
        put("attempts", maxNum(a["attempts"], b["attempts"]))
        put("clearedAt", jsonNumber(firstTruthyNumber(a["clearedAt"], b["clearedAt"])))
        put("perfect", isJsTruthy(a["perfect"]) || isJsTruthy(b["perfect"]))
    }

    private fun mergeMapMax(a: JsonObject, b: JsonObject, fields: List<String>): JsonObject {
        val keys = linkedSetOf<String>()
        keys.addAll(a.keys)
        keys.addAll(b.keys)
        val out = mutableMapOf<String, JsonElement>()
        for (k in keys) {
            val x = obj(a[k])
            val y = obj(b[k])
            val row = mutableMapOf<String, JsonElement>()
            for (f in fields) {
                row[f] = maxNum(x[f], y[f])
            }
            val leftoverKeys = linkedSetOf<String>()
            leftoverKeys.addAll(x.keys)
            leftoverKeys.addAll(y.keys)
            for (f in leftoverKeys) {
                if (f !in row) {
                    row[f] = y[f] ?: x[f]!!
                }
            }
            out[k] = JsonObject(row)
        }
        return JsonObject(out)
    }

    private fun obj(el: JsonElement?): JsonObject = el as? JsonObject ?: JsonObject(emptyMap())

    private fun assign(vararg objs: JsonObject): JsonObject {
        val map = mutableMapOf<String, JsonElement>()
        for (o in objs) map.putAll(o)
        return JsonObject(map)
    }

    private fun JsonElement.jsonObjectOrNull(): JsonObject? = this as? JsonObject
}

internal fun jsNumber(el: JsonElement?): Double {
    if (el == null || el is JsonNull) return 0.0
    val p = el as? JsonPrimitive ?: return 0.0
    p.doubleOrNull?.let { return if (it.isNaN()) 0.0 else it }
    val content = p.content
    return content.toDoubleOrNull() ?: 0.0
}

internal fun jsonNumber(n: Double): JsonPrimitive {
    val i = n.toLong()
    return if (n == i.toDouble()) JsonPrimitive(i) else JsonPrimitive(n)
}

internal fun jsString(el: JsonElement): String {
    val p = el as? JsonPrimitive ?: return el.toString()
    return p.content
}

internal fun isJsFalsy(el: JsonElement?): Boolean {
    if (el == null || el is JsonNull) return true
    val p = el as? JsonPrimitive ?: return false
    p.booleanOrNullCompat()?.let { return !it }
    p.doubleOrNull?.let { return it == 0.0 || it.isNaN() }
    if (p.isString) return p.content.isEmpty()
    return false
}

internal fun isJsTruthy(el: JsonElement?): Boolean = !isJsFalsy(el)

internal fun orDefault(el: JsonElement?, default: Int): Int =
    if (isJsFalsy(el)) default else jsNumber(el).toInt()

internal fun firstTruthyNumber(a: JsonElement?, b: JsonElement?): Double {
    if (isJsTruthy(a)) return jsNumber(a)
    if (isJsTruthy(b)) return jsNumber(b)
    return 0.0
}

internal fun firstTruthyString(a: JsonElement?, b: JsonElement?): String {
    if (isJsTruthy(a)) return jsString(a!!)
    if (isJsTruthy(b)) return jsString(b!!)
    return ""
}

private fun JsonPrimitive.booleanOrNullCompat(): Boolean? {
    if (content == "true") return true
    if (content == "false") return false
    return null
}
