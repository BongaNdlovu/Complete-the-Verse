package app.completetheverse.core.pilgrimage

import app.completetheverse.core.bank.Verse
import app.completetheverse.core.play.Mechanic
import app.completetheverse.core.play.PlayMechanics
import app.completetheverse.core.play.PlayQuestion
import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.floor

data class SiteRecord(
    val cleared: Boolean = false,
    val best: Int = 0,
    val bestAccuracy: Int = 0,
    val attempts: Int = 0,
    val clearedAt: Long = 0,
    val perfect: Boolean = false,
)

data class PilgrimProgress(
    val sites: Map<String, SiteRecord> = emptyMap(),
    val lastPlayed: String = "",
    val started: Long = 0,
    val usedIds: List<String> = emptyList(),
)

data class SiteResult(
    val cleared: Boolean,
    val score: Int = 0,
    val accuracy: Int = 0,
    val at: Long = 0,
    val usedIds: List<String> = emptyList(),
)

data class PoolDraw(
    val verses: List<Verse>,
    val ring: String,
    val target: Int,
    val dueFolded: Int = 0,
)

data class SiteBrief(
    val site: Site,
    val index: Int,
    val ordinal: Int,
    val total: Int,
    val arc: Arc?,
    val tier: Int,
    val clockMs: Long,
    val verses: Int,
    val unlocked: Boolean,
    val cleared: Boolean,
    val record: SiteRecord?,
    val previous: Site?,
    val next: Site?,
)

data class ArcStatus(
    val key: String,
    val total: Int,
    val cleared: Int,
    val complete: Boolean,
    val perfect: Boolean,
    val open: Boolean,
)

data class RoadOverview(
    val cleared: Int,
    val total: Int,
    val complete: Boolean,
    val current: Site?,
    val arcs: List<ArcStatus>,
)

data class QuoteRef(val book: String, val chapter: Int)

class Pilgrimage(
    val sites: List<Site>,
    val arcs: List<Arc>,
    val verses: List<Verse>,
) {
    companion object {
        const val VERSES_PER_SITE = 8
        const val CLOCK_OPEN = 14_000L
        const val CLOCK_CLOSE = 6_500L
        const val SIGNATURE_QUOTA = 4
        const val SITE_BOOK_FLOOR = 0.625
        const val PICK_PAD_MS = 1_500L

        val FULL_PLACE_SITES = setOf("sinai", "jericho", "nineveh", "babylon", "golgotha", "patmos")

        val NT_BOOKS = setOf(
            "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
            "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
            "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
            "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John",
            "2 John", "3 John", "Jude", "Revelation",
        )

        fun isNT(book: String): Boolean = book in NT_BOOKS

        fun blankProgress(): PilgrimProgress = PilgrimProgress()

        fun seededRandom(seed: Int): () -> Double {
            var s = seed
            return {
                s += 0x6D2B79F5
                var t = (s xor (s ushr 15)) * (1 or s)
                t = (t + ((t xor (t ushr 7)) * (61 or t))) xor t
                ((t xor (t ushr 14)).toUInt().toDouble() / 4294967296.0)
            }
        }

        fun seedFrom(str: String): Int {
            var h = 0x811C9DC5L.toInt()
            for (ch in str) {
                h = h xor ch.code
                h *= 16777619
            }
            return h
        }

        fun parseQuoteRef(ref: String?): QuoteRef? {
            val m = Regex("""^((?:\d\s)?[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+)""").find(ref ?: "") ?: return null
            return QuoteRef(
                book = m.groupValues[1].replace(Regex("""\s+"""), " ").trim(),
                chapter = m.groupValues[2].toInt(),
            )
        }

        fun fromSave(save: SaveBlob): PilgrimProgress {
            val bag = save["pilgrim"] as? JsonObject ?: return blankProgress()
            return fromJson(bag)
        }

        fun fromJson(obj: JsonObject): PilgrimProgress {
            val sitesObj = obj["sites"] as? JsonObject ?: JsonObject(emptyMap())
            val sites = linkedMapOf<String, SiteRecord>()
            for ((id, el) in sitesObj) {
                val row = el as? JsonObject ?: continue
                sites[id] = SiteRecord(
                    cleared = jsonBool(row["cleared"]),
                    best = jsonInt(row["best"]),
                    bestAccuracy = jsonInt(row["bestAccuracy"]),
                    attempts = jsonInt(row["attempts"]),
                    clearedAt = jsonLong(row["clearedAt"]),
                    perfect = jsonBool(row["perfect"]),
                )
            }
            val used = (obj["usedIds"] as? JsonArray)?.mapNotNull { el ->
                (el as? JsonPrimitive)?.content
            } ?: emptyList()
            return PilgrimProgress(
                sites = sites,
                lastPlayed = (obj["lastPlayed"] as? JsonPrimitive)?.content ?: "",
                started = jsonLong(obj["started"]),
                usedIds = used,
            )
        }

        fun toJson(progress: PilgrimProgress): JsonObject {
            val sites = linkedMapOf<String, kotlinx.serialization.json.JsonElement>()
            for ((id, rec) in progress.sites) {
                sites[id] = JsonObject(
                    mapOf(
                        "cleared" to JsonPrimitive(rec.cleared),
                        "best" to JsonPrimitive(rec.best),
                        "bestAccuracy" to JsonPrimitive(rec.bestAccuracy),
                        "attempts" to JsonPrimitive(rec.attempts),
                        "clearedAt" to JsonPrimitive(rec.clearedAt),
                        "perfect" to JsonPrimitive(rec.perfect),
                    ),
                )
            }
            return JsonObject(
                mapOf(
                    "sites" to JsonObject(sites),
                    "lastPlayed" to JsonPrimitive(progress.lastPlayed),
                    "started" to JsonPrimitive(progress.started),
                    "usedIds" to JsonArray(progress.usedIds.map { JsonPrimitive(it) }),
                ),
            )
        }

        fun writeProgress(save: SaveBlob, progress: PilgrimProgress): SaveBlob {
            val out = save.toMutableMap()
            out["pilgrim"] = toJson(progress)
            return JsonObject(out)
        }

        private fun jsonInt(el: kotlinx.serialization.json.JsonElement?): Int {
            val p = el as? JsonPrimitive ?: return 0
            p.doubleOrNull?.let { return it.toInt() }
            p.booleanOrNull?.let { return if (it) 1 else 0 }
            return p.content.toIntOrNull() ?: 0
        }

        private fun jsonLong(el: kotlinx.serialization.json.JsonElement?): Long {
            val p = el as? JsonPrimitive ?: return 0L
            p.doubleOrNull?.let { return it.toLong() }
            return p.content.toLongOrNull() ?: 0L
        }

        private fun jsonBool(el: kotlinx.serialization.json.JsonElement?): Boolean {
            val p = el as? JsonPrimitive ?: return false
            p.booleanOrNull?.let { return it }
            p.doubleOrNull?.let { return it != 0.0 }
            return p.content == "true"
        }
    }

    fun count(): Int = sites.size
    fun journey(): List<Site> = sites
    fun arcs(): List<Arc> = arcs

    fun indexOf(siteId: String): Int = sites.indexOfFirst { it.id == siteId }

    fun siteAt(i: Int): Site? = sites.getOrNull(i)

    fun site(siteId: String): Site? {
        val i = indexOf(siteId)
        return if (i < 0) null else sites[i]
    }

    fun arc(arcKey: String): Arc? = arcs.firstOrNull { it.key == arcKey }

    fun sitesInArc(arcKey: String): List<Site> = sites.filter { it.arc == arcKey }

    fun positionOf(i: Int): Double {
        val n = sites.size
        if (n <= 1) return 0.0
        val clamped = i.coerceIn(0, n - 1)
        return clamped.toDouble() / (n - 1)
    }

    fun tierFor(i: Int): Int =
        (1 + floor(positionOf(i) * 5).toInt()).coerceIn(1, 5)

    fun clockFor(i: Int): Long {
        val ms = CLOCK_OPEN - positionOf(i) * (CLOCK_OPEN - CLOCK_CLOSE)
        return kotlin.math.round(ms / 100.0).toLong() * 100L
    }

    fun versesFor(@Suppress("UNUSED_PARAMETER") i: Int): Int = VERSES_PER_SITE

    fun isClimaxSite(siteId: String): Boolean = siteId in FULL_PLACE_SITES

    fun usedSet(progress: PilgrimProgress?): Set<String> =
        (progress?.usedIds ?: emptyList()).toSet()

    fun markUsed(progress: PilgrimProgress?, ids: List<String>): PilgrimProgress {
        val next = cloneProgress(progress, progress?.lastPlayed ?: "")
        val seen = next.usedIds.toMutableSet()
        val used = next.usedIds.toMutableList()
        for (id in ids) {
            if (id.isNotEmpty() && id !in seen) {
                seen.add(id)
                used.add(id)
            }
        }
        return next.copy(usedIds = used)
    }

    fun recordOf(progress: PilgrimProgress?, siteId: String): SiteRecord? =
        progress?.sites?.get(siteId)

    fun isCleared(progress: PilgrimProgress?, siteId: String): Boolean =
        recordOf(progress, siteId)?.cleared == true

    fun isUnlocked(progress: PilgrimProgress?, siteId: String): Boolean {
        val i = indexOf(siteId)
        if (i < 0) return false
        if (i == 0) return true
        return isCleared(progress, sites[i - 1].id)
    }

    fun currentIndex(progress: PilgrimProgress?): Int {
        for (i in sites.indices) {
            if (!isCleared(progress, sites[i].id)) return i
        }
        return (sites.size - 1).coerceAtLeast(0)
    }

    fun currentSite(progress: PilgrimProgress?): Site? =
        sites.getOrNull(currentIndex(progress)) ?: sites.firstOrNull()

    fun clearedCount(progress: PilgrimProgress?): Int =
        sites.count { isCleared(progress, it.id) }

    fun isComplete(progress: PilgrimProgress?): Boolean =
        sites.isNotEmpty() && clearedCount(progress) == sites.size

    fun record(progress: PilgrimProgress?, siteId: String, result: SiteResult): PilgrimProgress {
        val next = cloneProgress(progress, siteId)
        val r = next.sites[siteId] ?: SiteRecord()
        val sitesMap = next.sites.toMutableMap()
        sitesMap[siteId] = applySiteRecord(r, result)
        var started = next.started
        if (started == 0L && result.at != 0L) started = result.at
        val used = mergeUsedIds(next.usedIds, result.usedIds)
        return next.copy(sites = sitesMap, started = started, usedIds = used)
    }

    fun arcStatus(progress: PilgrimProgress?, arcKey: String): ArcStatus {
        val list = sitesInArc(arcKey)
        val done = list.count { isCleared(progress, it.id) }
        val flawless = list.isNotEmpty() && list.all { s ->
            val r = recordOf(progress, s.id)
            r != null && r.cleared && r.perfect
        }
        return ArcStatus(
            key = arcKey,
            total = list.size,
            cleared = done,
            complete = list.isNotEmpty() && done == list.size,
            perfect = flawless,
            open = list.isNotEmpty() && isUnlocked(progress, list[0].id),
        )
    }

    fun overview(progress: PilgrimProgress?): RoadOverview =
        RoadOverview(
            cleared = clearedCount(progress),
            total = sites.size,
            complete = isComplete(progress),
            current = currentSite(progress),
            arcs = arcs.map { arcStatus(progress, it.key) },
        )

    fun placeAffinity(v: Verse, s: Site, target: Int): Int {
        val q = parseQuoteRef(s.quoteRef)
        val signature = s.books.firstOrNull() ?: ""
        val bound = s.books.toSet()
        val ch = verseChapter(v)
        var score = abs((if (v.t == 0) 3 else v.t) - target) * 10
        score -= when {
            q != null && v.b == q.book && ch == q.chapter -> 40
            v.b == signature -> 20
            v.b in bound -> 10
            else -> 0
        }
        return score
    }

    fun siteFloorNeed(s: Site, need: Int): Int {
        if (s.id in FULL_PLACE_SITES) return need
        return ceil(need * SITE_BOOK_FLOOR).toInt()
    }

    fun resolvePool(
        s: Site,
        need: Int = VERSES_PER_SITE,
        exclude: Set<String> = emptySet(),
        tier: Int? = null,
        rnd: () -> Double = { Math.random() },
    ): PoolDraw {
        val target = tier ?: tierFor(indexOf(s.id))
        val available = verses.filter { it.id !in exclude }
        val rings = ringsFor(s)
        var chosen = rings.last()
        var pool = emptyList<Verse>()
        for (ring in rings) {
            val got = available.filter { ring.second(it) }
            if (got.size >= need) {
                chosen = ring
                pool = got
                break
            }
            if (got.size > pool.size) {
                chosen = ring
                pool = got
            }
        }
        val signature = s.books.firstOrNull() ?: ""
        val buckets = linkedMapOf<Int, MutableList<Verse>>()
        for (v in pool) {
            val key = placeAffinity(v, s, target)
            buckets.getOrPut(key) { mutableListOf() }.add(v)
        }
        val ordered = buckets.keys.sorted().flatMap { k -> shuffled(buckets[k]!!, rnd) }
        val quota = mutableListOf<Verse>()
        val rest = mutableListOf<Verse>()
        for (v in ordered) {
            if (v.b == signature && quota.size < SIGNATURE_QUOTA) quota.add(v)
            else rest.add(v)
        }
        return PoolDraw(verses = quota + rest, ring = chosen.first, target = target)
    }

    fun drawSite(
        siteId: String,
        attempt: Int = 0,
        exclude: Set<String> = emptySet(),
        need: Int = VERSES_PER_SITE,
        dueVerses: List<Verse> = emptyList(),
        rnd: (() -> Double)? = null,
        tier: Int? = null,
    ): PoolDraw {
        val s = site(siteId) ?: return PoolDraw(emptyList(), "none", 1)
        val generator = rnd ?: seededRandom(seedFrom("$siteId:$attempt"))
        val banned = expandExclude(exclude).toMutableSet()
        val dueList = mutableListOf<Verse>()
        if (dueVerses.isNotEmpty()) {
            val maxDue = minOf(2, floor(need / 4.0).toInt())
            for (dv in dueVerses) {
                if (dueList.size >= maxDue) break
                if (dv.id.isNotEmpty() && dv.id !in banned) {
                    dueList.add(dv)
                    banned.add(dv.id)
                }
            }
        }
        val poolNeed = maxOf(1, need - dueList.size)
        val res = resolvePool(s, need = poolNeed, exclude = banned, tier = tier, rnd = generator)
        var picked = enforceSiteFloor(s, res.verses, poolNeed, banned, generator, res.target)
        picked = enforceSignatureQuota(s, picked, poolNeed, banned, generator, res.target)
        val combined = picked.toMutableList()
        if (dueList.isNotEmpty()) {
            for ((di, dv) in dueList.withIndex()) {
                val insertPos = minOf(di * 2 + 1, combined.size)
                combined.add(insertPos, dv)
            }
        }
        return PoolDraw(
            verses = shuffled(combined, generator),
            ring = res.ring,
            target = res.target,
            dueFolded = dueList.size,
        )
    }

    fun brief(siteId: String, progress: PilgrimProgress?): SiteBrief? {
        val s = site(siteId) ?: return null
        val i = indexOf(siteId)
        return SiteBrief(
            site = s,
            index = i,
            ordinal = i + 1,
            total = sites.size,
            arc = arc(s.arc),
            tier = tierFor(i),
            clockMs = clockFor(i),
            verses = VERSES_PER_SITE,
            unlocked = isUnlocked(progress, siteId),
            cleared = isCleared(progress, siteId),
            record = recordOf(progress, siteId),
            previous = if (i > 0) sites[i - 1] else null,
            next = if (i < sites.size - 1) sites[i + 1] else null,
        )
    }

    fun questionsFor(
        drawn: List<Verse>,
        siteIndex: Int,
        hasTf: Boolean,
    ): List<PlayQuestion> {
        if (drawn.isEmpty()) return emptyList()
        val clock = clockFor(siteIndex)
        val last = drawn.lastIndex
        return drawn.mapIndexed { i, v ->
            val lastBeat = i == last
            val mechanic = when {
                lastBeat -> Mechanic.Assemble
                else -> PlayMechanics.pilgrimageMechanic(i, hasTf) ?: Mechanic.Mcq
            }
            PlayQuestion(
                mechanic = mechanic,
                verse = v,
                clockBaseMs = clock,
            )
        }
    }

    fun applyRun(
        save: SaveBlob,
        siteId: String,
        servedIds: List<String>,
        cleared: Boolean,
        score: Int,
        accuracy: Int,
        at: Long,
    ): SaveBlob {
        val before = fromSave(save)
        val wasCleared = isCleared(before, siteId)
        val next = record(
            before,
            siteId,
            SiteResult(
                cleared = cleared,
                score = score,
                accuracy = accuracy,
                at = at,
                usedIds = servedIds,
            ),
        )
        var out = writeProgress(save, next)
        if (cleared && !wasCleared) {
            out = bumpLife(out, sitesCleared = 1)
            val beforeArcs = overview(before).arcs.count { it.complete }
            val afterArcs = overview(next).arcs.count { it.complete }
            if (afterArcs > beforeArcs) {
                out = bumpLife(out, arcsCleared = afterArcs - beforeArcs)
            }
            val unlocked = Artifacts.unlockForSite(Artifacts.fromSave(out), siteId, at)
            out = Artifacts.writeSave(out, unlocked.store)
        }
        return out
    }

    private fun bumpLife(save: SaveBlob, sitesCleared: Int = 0, arcsCleared: Int = 0): SaveBlob {
        val life = ((save["life"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        if (sitesCleared != 0) {
            life["sitesCleared"] = JsonPrimitive(jsonInt(life["sitesCleared"]) + sitesCleared)
        }
        if (arcsCleared != 0) {
            life["arcsCleared"] = JsonPrimitive(jsonInt(life["arcsCleared"]) + arcsCleared)
        }
        val out = save.toMutableMap()
        out["life"] = JsonObject(life)
        return JsonObject(out)
    }

    private fun jsonInt(el: kotlinx.serialization.json.JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }

    private fun cloneProgress(progress: PilgrimProgress?, lastPlayed: String): PilgrimProgress {
        val old = progress?.sites ?: emptyMap()
        val copy = linkedMapOf<String, SiteRecord>()
        for ((k, rec) in old) {
            copy[k] = rec.copy()
        }
        return PilgrimProgress(
            sites = copy,
            lastPlayed = lastPlayed,
            started = progress?.started ?: 0L,
            usedIds = (progress?.usedIds ?: emptyList()).toList(),
        )
    }

    private fun applySiteRecord(r: SiteRecord, result: SiteResult): SiteRecord {
        var best = r.best
        var bestAccuracy = r.bestAccuracy
        var cleared = r.cleared
        var clearedAt = r.clearedAt
        var perfect = r.perfect
        if (result.score > best) best = result.score
        if (result.accuracy > bestAccuracy) bestAccuracy = result.accuracy
        if (result.cleared) {
            if (!cleared) clearedAt = result.at
            cleared = true
            if (result.accuracy >= 100) perfect = true
        }
        return SiteRecord(
            cleared = cleared,
            best = best,
            bestAccuracy = bestAccuracy,
            attempts = r.attempts + 1,
            clearedAt = clearedAt,
            perfect = perfect,
        )
    }

    private fun mergeUsedIds(current: List<String>, extra: List<String>): List<String> {
        if (extra.isEmpty()) return current
        val seen = current.toMutableSet()
        val out = current.toMutableList()
        for (id in extra) {
            if (id.isNotEmpty() && id !in seen) {
                seen.add(id)
                out.add(id)
            }
        }
        return out
    }

    private fun ringsFor(s: Site): List<Pair<String, (Verse) -> Boolean>> {
        val siteBooks = s.books.toSet()
        val a = arc(s.arc)
        val arcBooks = a?.books?.toSet() ?: emptySet()
        val wantNT = a?.key == "gospel"
        return listOf(
            "site" to { v: Verse -> v.b in siteBooks },
            "arc" to { v: Verse -> v.b in arcBooks },
            "testament" to { v: Verse -> isNT(v.b) == wantNT },
            "bank" to { _: Verse -> true },
        )
    }

    private fun verseChapter(v: Verse): Int {
        val m = Regex("""\s(\d+):""").find(v.r)
        return m?.groupValues?.get(1)?.toIntOrNull() ?: 0
    }

    private fun shuffled(list: List<Verse>, rnd: () -> Double): List<Verse> {
        val a = list.toMutableList()
        for (i in a.lastIndex downTo 1) {
            val j = floor(rnd() * (i + 1)).toInt()
            val t = a[i]
            a[i] = a[j]
            a[j] = t
        }
        return a
    }

    private fun expandExclude(exclude: Set<String>): Set<String> {
        if (exclude.isEmpty()) return emptySet()
        val set = exclude.toMutableSet()
        val refs = mutableSetOf<String>()
        for (v in verses) {
            if (v.id in set && v.r.isNotEmpty()) refs.add(v.r.lowercase())
        }
        if (refs.isEmpty()) return set
        for (v in verses) {
            if (v.r.isNotEmpty() && v.r.lowercase() in refs) set.add(v.id)
        }
        return set
    }

    private fun enforceSiteFloor(
        s: Site,
        ordered: List<Verse>,
        need: Int,
        exclude: Set<String>,
        rnd: () -> Double,
        target: Int,
    ): List<Verse> {
        val bound = s.books.toSet()
        val floor = siteFloorNeed(s, need)
        fun rank(list: List<Verse>): List<Verse> =
            shuffled(list, rnd).sortedBy { placeAffinity(it, s, target) }

        val unusedSite = mutableListOf<Verse>()
        val unusedOther = mutableListOf<Verse>()
        for (v in verses) {
            if (v.id in exclude) continue
            if (v.b in bound) unusedSite.add(v) else unusedOther.add(v)
        }
        val rankedSite = rank(unusedSite)
        val rankedOther = rank(unusedOther)
        val unusedTotal = rankedSite.size + rankedOther.size
        if (unusedTotal < need) {
            return (rankedSite + rankedOther).take(unusedTotal)
        }
        val out = mutableListOf<Verse>()
        val outIds = mutableSetOf<String>()
        fun take(list: List<Verse>, n: Int) {
            for (v in list) {
                if (out.size >= n) break
                if (v.id !in outIds) {
                    out.add(v)
                    outIds.add(v.id)
                }
            }
        }
        take(rankedSite, floor)
        take(rankedSite, need)
        take(rankedOther, need)
        for (v in ordered) {
            if (out.size >= need) break
            if (v.id in outIds || v.id in exclude) continue
            out.add(v)
            outIds.add(v.id)
        }
        return out.take(need)
    }

    private fun enforceSignatureQuota(
        s: Site,
        picked: List<Verse>,
        need: Int,
        exclude: Set<String>,
        rnd: () -> Double,
        target: Int,
    ): List<Verse> {
        val signature = s.books.firstOrNull() ?: return picked.take(need)
        var unused = 0
        var avail = 0
        for (v in verses) {
            if (v.b == signature) avail++
            if (v.id !in exclude) unused++
        }
        if (unused < need) return picked.take(minOf(need, picked.size))
        val have = mutableListOf<Verse>()
        val rest = mutableListOf<Verse>()
        for (v in picked) {
            if (v.b == signature) have.add(v) else rest.add(v)
        }
        val want = minOf(SIGNATURE_QUOTA, need, avail)
        if (have.size >= want) return picked.take(need)
        val seen = have.map { it.id }.toMutableSet()
        val fresh = verses.filter { v ->
            v.b == signature && v.id !in seen && v.id !in exclude
        }
        val byTier = shuffled(fresh, rnd).sortedBy { abs((if (it.t == 0) 3 else it.t) - target) }
        for (v in byTier) {
            if (have.size >= want) break
            have.add(v)
            seen.add(v.id)
        }
        val out = have + rest.filter { it.id !in seen }
        return out.take(need)
    }
}
