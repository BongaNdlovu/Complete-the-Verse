package app.completetheverse.core.pilgrimage

import app.completetheverse.core.bank.Bank
import app.completetheverse.core.play.Mechanic
import app.completetheverse.core.save.Save
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class PilgrimageTest {
    private val bank = Bank.parse(
        javaClass.getResourceAsStream("/content/verses.json")!!.bufferedReader().use { it.readText() },
    )
    private val road = Sites.parse(
        javaClass.getResourceAsStream("/content/sites.json")!!.bufferedReader().use { it.readText() },
    )
    private val P = Pilgrimage(road.sites, road.arcs, bank.verses)
    private val N = P.count()
    private val LAST = N - 1

    private fun walkAll(): PilgrimProgress {
        var p = Pilgrimage.blankProgress()
        for (s in P.journey()) {
            p = P.record(p, s.id, SiteResult(cleared = true, score = 100, accuracy = 100, at = 1))
        }
        return p
    }

    private fun walkTo(n: Int): PilgrimProgress {
        var p = Pilgrimage.blankProgress()
        for (i in 0 until n) {
            val site = P.siteAt(i) ?: break
            p = P.record(p, site.id, SiteResult(cleared = true, score = 50, accuracy = 80, at = 1))
        }
        return p
    }

    @Test
    fun theJourneyHasFortySixSites() {
        assertEquals(46, N)
        assertEquals(0, P.indexOf("ur"))
        assertEquals(LAST, P.indexOf("patmos"))
        assertEquals(-1, P.indexOf("atlantis"))
        assertTrue(P.site("babylon")!!.name.startsWith("BABYLON"))
        assertNull(P.site("atlantis"))
        assertNull(P.siteAt(999))
        assertEquals(5, P.arcs().size)
        assertEquals(N, P.arcs().sumOf { P.sitesInArc(it.key).size })
    }

    @Test
    fun positionRampsAlongTheRoad() {
        assertEquals(0.0, P.positionOf(0))
        assertEquals(1.0, P.positionOf(LAST))
        assertTrue(P.positionOf(5) < P.positionOf(20))
        assertEquals(0.0, P.positionOf(-5))
        assertEquals(1.0, P.positionOf(999))
    }

    @Test
    fun difficultyAndClockTightenEast() {
        assertEquals(1, P.tierFor(0))
        assertEquals(5, P.tierFor(LAST))
        val tiers = P.journey().mapIndexed { i, _ -> P.tierFor(i) }
        assertTrue(tiers.zipWithNext().all { (a, b) -> b >= a })
        assertTrue(tiers.all { it in 1..5 })
        assertEquals(5, tiers.toSet().size)
        assertEquals(Pilgrimage.CLOCK_OPEN, P.clockFor(0))
        assertEquals(Pilgrimage.CLOCK_CLOSE, P.clockFor(LAST))
        assertEquals(1_500L, Pilgrimage.PICK_PAD_MS)
        val clocks = P.journey().mapIndexed { i, _ -> P.clockFor(i) }
        assertTrue(clocks.zipWithNext().all { (a, b) -> b <= a })
        assertTrue(clocks.all { it % 100L == 0L })
        assertTrue(clocks.all { it >= Pilgrimage.CLOCK_CLOSE })
    }

    @Test
    fun unlockingWalksTheRoadAndFailureDoesNotUnclear() {
        val blank = Pilgrimage.blankProgress()
        assertTrue(P.isUnlocked(blank, "ur"))
        assertFalse(P.isUnlocked(blank, "haran"))
        assertFalse(P.isUnlocked(blank, "patmos"))
        assertFalse(P.isUnlocked(blank, "atlantis"))
        assertEquals("ur", P.currentSite(blank)!!.id)
        assertEquals(0, P.clearedCount(blank))
        assertFalse(P.isComplete(blank))

        val afterUr = P.record(blank, "ur", SiteResult(cleared = true, score = 10, accuracy = 100, at = 1))
        assertTrue(P.isUnlocked(afterUr, "haran"))
        assertFalse(P.isUnlocked(afterUr, "shechem"))
        assertEquals("haran", P.currentSite(afterUr)!!.id)
        assertEquals(1, P.clearedCount(afterUr))

        val failed = P.record(blank, "ur", SiteResult(cleared = false, score = 10, accuracy = 40, at = 1))
        assertFalse(P.isUnlocked(failed, "haran"))
        assertTrue(P.isUnlocked(failed, "ur"))
        assertEquals(0, P.clearedCount(failed))
        assertEquals(1, P.recordOf(failed, "ur")!!.attempts)

        val all = walkAll()
        assertTrue(P.isComplete(all))
        assertEquals(N, P.clearedCount(all))
        assertTrue(P.journey().all { P.isUnlocked(all, it.id) })
    }

    @Test
    fun recordIsPureAndAccumulates() {
        val before = walkTo(3)
        val snapshot = Pilgrimage.toJson(before).toString()
        val after = P.record(before, "bethel", SiteResult(cleared = true, score = 999, accuracy = 100, at = 2))
        assertEquals(snapshot, Pilgrimage.toJson(before).toString())
        assertTrue(after !== before)
        assertNotNull(P.recordOf(after, "bethel"))
        assertTrue(P.isCleared(after, "ur") && P.isCleared(after, "haran"))

        var p = Pilgrimage.blankProgress()
        p = P.record(p, "ur", SiteResult(cleared = false, score = 100, accuracy = 50, at = 1))
        assertEquals(1, P.recordOf(p, "ur")!!.attempts)
        assertEquals(100, P.recordOf(p, "ur")!!.best)
        assertFalse(P.isCleared(p, "ur"))

        p = P.record(p, "ur", SiteResult(cleared = true, score = 80, accuracy = 90, at = 2))
        assertEquals(2, P.recordOf(p, "ur")!!.attempts)
        assertEquals(100, P.recordOf(p, "ur")!!.best)
        assertEquals(90, P.recordOf(p, "ur")!!.bestAccuracy)
        assertTrue(P.isCleared(p, "ur"))
        assertEquals(2, P.recordOf(p, "ur")!!.clearedAt)

        p = P.record(p, "ur", SiteResult(cleared = true, score = 500, accuracy = 100, at = 3))
        assertEquals(500, P.recordOf(p, "ur")!!.best)
        assertTrue(P.recordOf(p, "ur")!!.perfect)
        assertEquals(2, P.recordOf(p, "ur")!!.clearedAt)

        p = P.record(p, "ur", SiteResult(cleared = false, score = 1, accuracy = 5, at = 4))
        assertTrue(P.isCleared(p, "ur"))
        assertEquals(500, P.recordOf(p, "ur")!!.best)
    }

    @Test
    fun everySiteFillsEightAndDrawsFromSiteBooks() {
        val short = mutableListOf<String>()
        val offTier = mutableListOf<String>()
        for ((i, s) in P.journey().withIndex()) {
            val d = P.drawSite(s.id, attempt = 0)
            if (d.verses.size != Pilgrimage.VERSES_PER_SITE) short.add("${s.id}:${d.verses.size}")
            if (d.target != P.tierFor(i)) offTier.add(s.id)
        }
        assertTrue(short.isEmpty(), short.toString())
        assertTrue(offTier.isEmpty(), offTier.toString())
        assertTrue(
            P.journey().all { s ->
                val ids = P.drawSite(s.id, attempt = 0).verses.map { it.id }
                ids.toSet().size == ids.size
            },
        )
        assertTrue(
            P.journey().all { s ->
                P.drawSite(s.id, attempt = 0).verses.all { v -> v.id.isNotEmpty() && v.r.isNotEmpty() && v.a.isNotEmpty() }
            },
        )
        val rings = P.journey().groupingBy { P.drawSite(it.id, attempt = 0).ring }.eachCount()
        assertEquals(N, rings["site"])
        assertTrue(
            P.journey().all { s ->
                val books = s.books.toSet()
                P.drawSite(s.id, attempt = 0).verses.all { it.b in books }
            },
        )
    }

    @Test
    fun resolvePoolWidensWhenSiteBooksAreStarved() {
        val site = P.site("emmaus")!!
        val need = Pilgrimage.VERSES_PER_SITE
        val excludeSite = bank.verses.filter { it.b in site.books }.map { it.id }.toSet()
        val widened = P.resolvePool(site, need = need, exclude = excludeSite)
        assertEquals("arc", widened.ring)
        assertTrue(widened.verses.size >= need, "${widened.verses.size}")

        val arc = P.arc(site.arc)!!
        val excludeArc = bank.verses.filter { it.b in arc.books }.map { it.id }.toSet()
        val wider = P.resolvePool(site, need = need, exclude = excludeArc)
        assertTrue(wider.ring == "testament" || wider.ring == "bank", wider.ring)
        assertTrue(wider.verses.size >= need)

        val keep = bank.verses.take(3).map { it.id }.toSet()
        val excludeAll = bank.verses.map { it.id }.filter { it !in keep }.toSet()
        val scraps = P.resolvePool(site, need = need, exclude = excludeAll)
        assertEquals(3, scraps.verses.size)
        val drawn = P.drawSite("emmaus", exclude = excludeAll)
        assertEquals(3, drawn.verses.size)
    }

    @Test
    fun drawsAreSeeded() {
        val a = P.drawSite("babylon", attempt = 0).verses.joinToString(",") { it.id }
        val b = P.drawSite("babylon", attempt = 0).verses.joinToString(",") { it.id }
        assertEquals(a, b)
        val c = P.drawSite("babylon", attempt = 1).verses.joinToString(",") { it.id }
        assertNotEquals(a, c)
        val other = P.drawSite("nineveh", attempt = 0).verses.joinToString(",") { it.id }
        assertNotEquals(a, other)
        val r1 = Pilgrimage.seededRandom(42)
        val r2 = Pilgrimage.seededRandom(42)
        assertEquals(r1(), r2())
        repeat(6) {
            val v = r1()
            assertTrue(v >= 0.0 && v < 1.0)
        }
        assertEquals(Pilgrimage.seedFrom("ur:0"), Pilgrimage.seedFrom("ur:0"))
        assertNotEquals(Pilgrimage.seedFrom("ur:0"), Pilgrimage.seedFrom("ur:1"))
    }

    @Test
    fun siteBookFloorAndUsedIdsNeverRepeat() {
        var exclude = emptySet<String>()
        val seen = mutableListOf<String>()
        for (s in P.journey()) {
            val d = P.drawSite(s.id, attempt = 0, exclude = exclude)
            for (v in d.verses) {
                seen.add(v.id)
                exclude = exclude + v.id
            }
        }
        assertEquals(seen.size, seen.toSet().size)
        assertTrue(seen.size >= N * 4, "${seen.size}")

        for (id in listOf("ur", "sinai", "jericho", "jerusalem", "golgotha", "emmaus", "corinth", "patmos")) {
            val s = P.site(id)!!
            val d = P.drawSite(id, attempt = 0, exclude = emptySet())
            val bound = s.books.toSet()
            val siteN = d.verses.count { it.b in bound }
            assertEquals(Pilgrimage.VERSES_PER_SITE, siteN, id)
        }
        for (id in Pilgrimage.FULL_PLACE_SITES) {
            val s = P.site(id)!!
            val d = P.drawSite(id, attempt = 0)
            val bound = s.books.toSet()
            assertEquals(Pilgrimage.VERSES_PER_SITE, d.verses.count { it.b in bound }, id)
        }

        val blank = Pilgrimage.blankProgress()
        assertEquals(0, blank.usedIds.size)
        val marked = P.markUsed(blank, listOf("a", "b", "a"))
        assertEquals(2, marked.usedIds.size)
        assertEquals(0, blank.usedIds.size)
        assertTrue("a" in P.usedSet(marked) && "b" in P.usedSet(marked))
    }

    @Test
    fun lastBeatIsAssembleAndPoolSizeIsEight() {
        val drawn = P.drawSite("ur", attempt = 0)
        assertEquals(8, drawn.verses.size)
        val qs = P.questionsFor(drawn.verses, 0, hasTf = true)
        assertEquals(8, qs.size)
        assertEquals(Mechanic.Assemble, qs.last().mechanic)
        assertEquals(Mechanic.PassageRef, qs[2].mechanic)
        assertEquals(Mechanic.TrueFalse, qs[6].mechanic)
        assertTrue(qs.dropLast(1).none { it.mechanic == Mechanic.Assemble })
    }

    @Test
    fun applyRunPersistsPilgrimBlobAndUnlocksArtifact() {
        val save = Save.clone(Save.DEFAULT)
        val drawn = P.drawSite("ur", attempt = 0).verses.map { it.id }
        val next = P.applyRun(
            save = save,
            siteId = "ur",
            servedIds = drawn,
            cleared = true,
            score = 400,
            accuracy = 100,
            at = 42,
        )
        val progress = Pilgrimage.fromSave(next)
        assertTrue(P.isCleared(progress, "ur"))
        assertEquals("ur", progress.lastPlayed)
        assertEquals(drawn.toSet(), progress.usedIds.toSet())
        assertEquals(1, ((next["life"] as kotlinx.serialization.json.JsonObject)["sitesCleared"] as kotlinx.serialization.json.JsonPrimitive).content.toInt())
        val relics = Artifacts.fromSave(next)
        assertEquals(1, Artifacts.unlockedCount(relics))
        assertTrue(Artifacts.isUnlocked(relics, "ziggurat-ur"))

        val failed = P.applyRun(
            next,
            siteId = "haran",
            servedIds = listOf("x"),
            cleared = false,
            score = 10,
            accuracy = 40,
            at = 50,
        )
        val afterFail = Pilgrimage.fromSave(failed)
        assertTrue(P.isCleared(afterFail, "ur"))
        assertFalse(P.isCleared(afterFail, "haran"))
        assertEquals(1, P.recordOf(afterFail, "haran")!!.attempts)
        assertEquals(1, Artifacts.unlockedCount(Artifacts.fromSave(failed)))
    }

    @Test
    fun testamentSplit() {
        assertFalse(Pilgrimage.isNT("Genesis"))
        assertFalse(Pilgrimage.isNT("Malachi"))
        assertTrue(Pilgrimage.isNT("Matthew"))
        assertTrue(Pilgrimage.isNT("Revelation"))
        assertEquals(27, bank.booksOrder.count { Pilgrimage.isNT(it) })
        assertEquals(39, bank.booksOrder.count { !Pilgrimage.isNT(it) })
    }

    @Test
    fun briefingCarriesOrdinalClockAndNeighbors() {
        val blank = Pilgrimage.blankProgress()
        val b = P.brief("ur", blank)!!
        assertEquals(1, b.ordinal)
        assertEquals(N, b.total)
        assertEquals(P.tierFor(0), b.tier)
        assertEquals(P.clockFor(0), b.clockMs)
        assertEquals(Pilgrimage.VERSES_PER_SITE, b.verses)
        assertNull(b.previous)
        assertEquals("haran", b.next!!.id)
        assertTrue(b.unlocked)
        assertFalse(b.cleared)
        assertNull(P.brief("atlantis", blank))
        val last = P.brief("patmos", walkAll())!!
        assertNull(last.next)
        assertTrue(last.cleared)
        assertEquals(N, last.ordinal)
    }

    @Test
    fun artifactsUnlockOncePerSite() {
        assertEquals(N, Artifacts.count())
        val blank = Artifacts.blank()
        val first = Artifacts.unlockForSite(blank, "ur", 100)
        assertTrue(first.firstUnlock)
        assertEquals(1, Artifacts.unlockedCount(first.store))
        val again = Artifacts.unlockForSite(first.store, "ur", 200)
        assertFalse(again.firstUnlock)
        assertEquals(1, Artifacts.unlockedCount(again.store))
        assertEquals(0, blank.unlocked.size)
    }
}
