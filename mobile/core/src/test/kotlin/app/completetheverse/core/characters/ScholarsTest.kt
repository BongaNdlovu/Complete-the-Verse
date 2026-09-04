package app.completetheverse.core.characters

import app.completetheverse.core.save.Save
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ScholarsTest {
    @Test
    fun eightScholarsShipAndBiblicalFiguresAreNotEquipable() {
        assertEquals(8, Scholars.ALL.size)
        assertEquals("amina", Scholars.defaultId())
        assertTrue(Scholars.isScholar("yusef"))
        assertFalse(Scholars.isScholar("abram"))
        assertFalse(Scholars.isScholar("moses"))
        assertFalse(Scholars.isScholar("david"))
        assertEquals("amina", Scholars.resolve("john").id)
        assertEquals("elias", Scholars.resolve("elias").id)
        assertEquals(4, Scholars.ALL.count { it.gender == "f" })
        assertEquals(4, Scholars.ALL.count { it.gender == "m" })
        assertEquals(8, Scholars.ALL.map { it.nationality }.toSet().size)
    }

    @Test
    fun defaultSaveIsNotProfileReadyAndIntroHasNotPlayed() {
        assertFalse(Save.introPlayed(Save.DEFAULT))
        assertFalse(Save.profileReady(Save.DEFAULT))
        assertEquals("amina", Save.scholarId(Save.DEFAULT))
        assertEquals("Pilgrim", Save.playerDisplayName(Save.DEFAULT))
    }

    @Test
    fun markIntroPlayedPersistsFlagOnSet() {
        val next = Save.markIntroPlayed(Save.DEFAULT)
        assertTrue(Save.introPlayed(next))
        assertFalse(Save.introPlayed(Save.DEFAULT))
    }

    @Test
    fun commitProfileWritesScholarAndNameIntoSet() {
        val next = Save.commitProfile(Save.DEFAULT, "  Miriam  ", "abram")
        assertTrue(Save.profileReady(next))
        assertEquals("Miriam", Save.playerName(next))
        assertEquals("amina", Save.scholarId(next))
        val set = next["set"]!!.jsonObject
        assertEquals("amina", set["character"]?.jsonPrimitive?.contentOrNull)
        assertEquals("amina", set["scholarId"]?.jsonPrimitive?.contentOrNull)
        assertEquals(true, set["profileDone"]?.jsonPrimitive?.booleanOrNull)
        assertEquals(true, set["characterDone"]?.jsonPrimitive?.booleanOrNull)
    }

    @Test
    fun profileReadyNeedsTwoLetterName() {
        val shortName = Save.commitProfile(Save.DEFAULT, "A", "soojin")
        assertFalse(Save.profileReady(shortName))
        val ok = Save.commitProfile(Save.DEFAULT, "Jo", "soojin")
        assertTrue(Save.profileReady(ok))
        assertEquals("soojin", Save.scholarId(ok))
    }

    @Test
    fun combineLocalSnapshotsPrefersMemoryIntroAndProfile() {
        val memory = Save.markIntroPlayed(Save.commitProfile(Save.DEFAULT, "Jo", "dawit"))
        val merged = Save.combineLocalSnapshots(memory, Save.DEFAULT)
        assertTrue(Save.introPlayed(merged))
        assertTrue(Save.profileReady(merged))
        assertEquals("dawit", Save.scholarId(merged))
        assertEquals("Jo", Save.playerName(merged))
    }

    @Test
    fun scholarIdNeverReturnsABiblicalFigure() {
        val withFigure = Save.patchSet(
            Save.DEFAULT,
            "scholarId" to JsonPrimitive("moses"),
            "character" to JsonPrimitive("moses"),
        )
        assertEquals("amina", Save.scholarId(withFigure))
        assertFalse(Scholars.isScholar(Save.stringSet(withFigure, "scholarId")))
    }

    @Test
    fun mergeLoadedSaveKeepsIntroAndProfileFlags() {
        val loaded = Save.mergeLoadedSave(
            parse("""{ "set": { "introPlayed": true, "profileDone": true, "playerName": "Tes", "scholarId": "dawit", "character": "dawit" } }"""),
        )
        assertTrue(Save.introPlayed(loaded))
        assertTrue(Save.profileReady(loaded))
        assertEquals("dawit", Save.scholarId(loaded))
        assertEquals("Tes", Save.playerName(loaded))
    }

    private fun parse(raw: String): JsonObject = Json.parseToJsonElement(raw).jsonObject
}
