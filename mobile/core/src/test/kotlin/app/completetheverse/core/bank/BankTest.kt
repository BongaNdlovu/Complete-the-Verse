package app.completetheverse.core.bank

import app.completetheverse.core.practice.Practice
import app.completetheverse.core.save.Save
import app.completetheverse.core.srs.Srs
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class BankTest {
    @Test
    fun parseInlineVerseShape() {
        val raw = """
            {
              "booksOrder": ["Genesis"],
              "verses": [{
                "id": "genesis-1-1~heaven-and-the-earth",
                "p": "In the beginning God created the",
                "a": "heaven and the earth",
                "s": ".",
                "d": ["heavens and the earth", "earth and the heaven"],
                "r": "Genesis 1:1",
                "b": "Genesis",
                "t": 1
              }]
            }
        """.trimIndent()
        val bank = Bank.parse(raw)
        assertEquals(1, bank.verses.size)
        val v = bank.verses[0]
        assertEquals("genesis-1-1~heaven-and-the-earth", v.id)
        assertEquals("heaven and the earth", v.a)
        assertEquals(listOf("heavens and the earth", "earth and the heaven"), v.d)
        assertEquals("Genesis 1:1", v.r)
        assertEquals("Genesis", v.b)
        assertEquals(1, v.t)
        assertEquals(v.id, Bank.verseId(v))
        assertEquals("", Bank.stemSep("."))
        assertEquals(" ", Bank.stemSep("in the cloud"))
    }

    @Test
    fun parseSharedVersesJson() {
        val raw = javaClass.getResourceAsStream("/content/verses.json")!!.bufferedReader().use { it.readText() }
        val bank = Bank.parse(raw)
        assertTrue(bank.verses.size >= 800)
        val first = bank.byId["genesis-1-1~heaven-and-the-earth"]
        assertEquals("heaven and the earth", first!!.a)
        assertEquals("Genesis", first.b)
        assertTrue(first.d.isNotEmpty())
        assertTrue(bank.verses.all { it.id.isNotEmpty() && it.p.isNotEmpty() && it.a.isNotEmpty() && it.r.isNotEmpty() })
        assertTrue(bank.tfClaims.size >= 250)
        assertTrue(bank.tfClaims.any { it.v } && bank.tfClaims.any { !it.v })
    }
}

class PracticeTest {
    @Test
    fun drillIsFifteenDueFirst() {
        val verses = (1..20).map { n ->
            Verse(id = "v$n", p = "p$n", a = "answer $n extra", s = ".", d = listOf("x", "y", "z"), r = "R $n", b = "Book", t = 1)
        }
        val T = 100
        val overdue = Srs.freshCard().copy(reps = 2, ivl = 10, due = T - 9, last = T - 10)
        val cardFor: (Verse) -> app.completetheverse.core.srs.SrsCard? = { v ->
            when (v.id) {
                "v1" -> overdue.copy(due = T + 5)
                "v2" -> overdue
                else -> null
            }
        }
        val drill = Practice.buildDrill(verses, cardFor, T, rng = null, limit = Practice.LENGTH)
        assertEquals(15, drill.size)
        assertEquals("v2", drill[0].id)
        assertTrue(Practice.usesAssemble(4, verses[0]))
        assertFalse(Practice.usesAssemble(0, verses[0]))
        assertFalse(Practice.usesAssemble(4, verses[0].copy(a = "one")))
    }

    @Test
    fun applyAnswerWritesSrsIntoSaveBlob() {
        val verse = Verse(
            id = "genesis-1-1~heaven-and-the-earth",
            p = "In the beginning God created the",
            a = "heaven and the earth",
            s = ".",
            d = listOf("heavens and the earth"),
            r = "Genesis 1:1",
            b = "Genesis",
            t = 1,
        )
        val recorded = Practice.applyAnswer(
            save = Save.DEFAULT,
            verse = verse,
            correct = true,
            timedOut = false,
            fraction = 0.2,
            today = 20000,
            mode = "choice",
        )
        val card = Srs.cardsFromSave(recorded.save["srs"])[verse.id]
        assertEquals(1, card!!.reps)
        assertEquals(5, card.lastQuality)
        assertEquals("choice", card.lastMode)
        assertTrue(Practice.choiceMatches(verse.a, verse.a))
        assertFalse(Practice.choiceMatches("heavens and the earth", verse.a))
        val book = recorded.save["books"]!!.jsonObject["Genesis"]!!.jsonObject
        assertEquals("1", book["a"]!!.jsonPrimitive.content)
        assertEquals("1", book["c"]!!.jsonPrimitive.content)
        val row = recorded.save["verse"]!!.jsonObject[verse.id]!!.jsonObject
        assertEquals("1", row["a"]!!.jsonPrimitive.content)
        assertEquals("1", row["c"]!!.jsonPrimitive.content)
    }

    @Test
    fun timeoutGradesZero() {
        val verse = Verse(id = "v1", p = "p", a = "the world", s = ".", d = listOf("the earth"), r = "R", b = "B", t = 1)
        val recorded = Practice.applyAnswer(
            save = Save.DEFAULT,
            verse = verse,
            correct = false,
            timedOut = true,
            fraction = null,
            today = 10,
            mode = "choice",
        )
        assertEquals(0, recorded.quality)
        assertEquals(0, recorded.card.reps)
        assertEquals(1, recorded.card.lapses)
        assertNull(recorded.card.lastFraction)
        val book = recorded.save["books"]!!.jsonObject["B"]!!.jsonObject
        assertEquals("1", book["a"]!!.jsonPrimitive.content)
        assertEquals(null, book["c"])
    }

    @Test
    fun combineLocalSnapshotsKeepsInMemorySrsOverStaleDisk() {
        val verse = Verse(id = "v1", p = "p", a = "the world", s = ".", d = listOf("the earth"), r = "R", b = "B", t = 1)
        val recorded = Practice.applyAnswer(
            save = Save.DEFAULT,
            verse = verse,
            correct = true,
            timedOut = false,
            fraction = 0.2,
            today = 10,
            mode = "choice",
        )
        val staleDisk = Save.DEFAULT
        val merged = Save.combineLocalSnapshots(recorded.save, staleDisk)
        val card = Srs.cardsFromSave(merged["srs"])[verse.id]
        assertEquals(1, card!!.reps)
        assertEquals("1", merged["verse"]!!.jsonObject[verse.id]!!.jsonObject["a"]!!.jsonPrimitive.content)
    }

    @Test
    fun combineLocalSnapshotsKeepsInMemoryLapseOverHigherRepsDisk() {
        val verse = Verse(id = "v1", p = "p", a = "the world", s = ".", d = listOf("the earth"), r = "R", b = "B", t = 1)
        val diskCard = Srs.freshCard().copy(reps = 3, ivl = 15, due = 20, last = 10, ef = 2.5, lapses = 0)
        val disk = Srs.putCard(Save.DEFAULT, verse.id, diskCard)
        val recorded = Practice.applyAnswer(
            save = disk,
            verse = verse,
            correct = false,
            timedOut = true,
            fraction = null,
            today = 11,
            mode = "choice",
        )
        assertEquals(0, recorded.card.reps)
        assertEquals(1, recorded.card.lapses)
        val merged = Save.combineLocalSnapshots(recorded.save, disk)
        val card = Srs.cardsFromSave(merged["srs"])[verse.id]
        assertEquals(0, card!!.reps, "in-memory lapse must not lose to disk higher reps")
        assertEquals(1, card.lapses)
        assertEquals(11, card.last)
    }

    @Test
    fun combineLocalSnapshotsCloudMergeSrsWinsWhenMemoryIsDiskSnapshot() {
        val verse = Verse(id = "v1", p = "p", a = "the world", s = ".", d = listOf("the earth"), r = "R", b = "B", t = 1)
        val localCard = Srs.freshCard().copy(reps = 2, ivl = 6, due = 12, last = 5, ef = 2.5)
        val remoteCard = Srs.freshCard().copy(reps = 5, ivl = 40, due = 50, last = 8, ef = 2.6)
        val disk = Srs.putCard(Save.DEFAULT, verse.id, localCard)
        val extra = Srs.putCard(Save.DEFAULT, verse.id, remoteCard)
        val merged = Save.combineLocalSnapshots(disk, disk, extra)
        val card = Srs.cardsFromSave(merged["srs"])[verse.id]
        assertEquals(5, card!!.reps, "idle boot must keep mergeSrs higher-reps from cloud extra")
        assertEquals(40, card.ivl)
    }
}
