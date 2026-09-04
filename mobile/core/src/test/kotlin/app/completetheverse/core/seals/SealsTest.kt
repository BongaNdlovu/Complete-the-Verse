package app.completetheverse.core.seals

import app.completetheverse.core.save.Save
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SealsTest {
    @Test
    fun websiteSealListIsPortedInOrder() {
        val ids = Seals.ALL.map { it.id }
        assertEquals(
            listOf(
                "first", "unshaken", "recall", "flame", "watch", "swift", "nocrutch", "flawless",
                "score25", "score50", "sd15", "end40", "daily7", "books30", "books66", "lvl20",
                "life500", "ironman", "road-first", "road-arc1", "road-half", "road-patmos",
                "road-end", "arc-patriarchs", "arc-exodus", "arc-judges", "arc-kingdom",
                "arc-gospel", "relay", "remnant", "oil50", "ascent", "assemble12",
                "seventh-lamp", "streak14", "streak30", "act6-watch",
            ),
            ids,
        )
        assertEquals(ids.size, ids.toSet().size)
        assertTrue(Seals.ALL.all { it.name.isNotBlank() && it.desc.isNotBlank() })
    }

    @Test
    fun earnedFlagsReadSaveSeals() {
        val save = Save.DEFAULT.toMutableMap()
        save["seals"] = JsonArray(listOf(JsonPrimitive("first"), JsonPrimitive("road-first")))
        val blob = kotlinx.serialization.json.JsonObject(save)
        assertEquals(2, Seals.earnedCount(blob))
        assertTrue(Seals.has(blob, "first"))
        assertFalse(Seals.has(blob, "watch"))
        assertEquals(0, Seals.earnedCount(Save.DEFAULT))
    }
}
