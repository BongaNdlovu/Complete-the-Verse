package app.completetheverse.core.bank

import app.completetheverse.core.save.Save
import app.completetheverse.core.tablets.Tablets
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class NkjvBankTest {
    private fun load(path: String): String =
        javaClass.getResourceAsStream(path)!!.bufferedReader().use { it.readText() }

    @Test
    fun nkjvBankParsesAndMatchesKjvRefCount() {
        val kjv = Bank.parse(load("/content/verses.json"))
        val nkjv = Bank.parse(load("/content/nkjv/verses.json"))
        assertEquals(kjv.verses.size, nkjv.verses.size)
        assertTrue(nkjv.verses.isNotEmpty())
        assertTrue(nkjv.verses.all { it.a.isNotBlank() })
        // Genesis 2:7 is the edition witness: NKJV says "living being".
        val gen27 = nkjv.verses.firstOrNull { it.r == "Genesis 2:7" }
        assertEquals("living being", gen27?.a)
    }

    @Test
    fun nkjvTabletsParseAndKeepAnswersInOptions() {
        val bank = Tablets.parse(load("/content/nkjv/tablets.json"))
        assertTrue(bank.chapters.isNotEmpty())
        bank.chapters.forEach { ch ->
            ch.blanks.forEach { bl ->
                assertTrue(bl.a.isNotBlank(), "empty answer in ${ch.id}")
                assertFalse(bl.d.any { it.equals(bl.a, ignoreCase = true) }, "answer offered as option in ${ch.id}")
                assertTrue(bl.d.size >= 2, "too few options in ${ch.id}")
            }
        }
    }

    @Test
    fun editionPickerPersists() {
        val chosen = Save.chooseTranslation(Save.DEFAULT, "nkjv")
        assertEquals("nkjv", Save.translation(chosen))
        assertTrue(Save.translationChosen(chosen))
        assertEquals("NKJV", Save.translationTag(chosen))
        val back = Save.chooseTranslation(chosen, "kjv")
        assertEquals("kjv", Save.translation(back))
        assertEquals("KJV", Save.translationTag(back))
    }

    @Test
    fun nkjvStartsFreshAndKjvReturns() {
        val started = Save.DEFAULT.toMutableMap()
        started["xp"] = JsonPrimitive(40)
        val nkjv = Save.chooseTranslation(JsonObject(started), "nkjv")
        assertEquals("0", (nkjv["xp"] as JsonPrimitive).content)
        val back = Save.chooseTranslation(nkjv, "kjv")
        assertEquals("40", (back["xp"] as JsonPrimitive).content)
    }
}
