package app.completetheverse.core.play

import app.completetheverse.core.save.Save
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals

class PowersTest {
    @Test
    fun startMatchesPwaWithoutOil() {
        assertEquals(PowerBank(), Powers.start("team"))
        assertEquals(PowerBank(), Powers.start("blitz"))
        assertEquals(PowerBank(selah = 1), Powers.start("pilgrimage"))
        assertEquals(PowerBank(selah = 1, wind = 1), Powers.start("trial"))
        val with = Save.DEFAULT.toMutableMap()
        with["illumReserve"] = JsonPrimitive(2)
        assertEquals(2, Powers.start("trial", JsonObject(with)).illum)
    }
}
