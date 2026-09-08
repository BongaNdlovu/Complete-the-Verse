package app.completetheverse.core.play

import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.doubleOrNull

data class PowerBank(
    val selah: Int = 0,
    val illum: Int = 0,
    val wind: Int = 0,
)

object Powers {
    const val SELAH_MS = 5_000L

    fun start(mode: String, save: SaveBlob = Save.DEFAULT): PowerBank {
        val reserved = jsonInt(save["illumReserve"]).coerceIn(0, 2)
        val base = when (mode) {
            "beat", "team" -> PowerBank()
            "blitz" -> PowerBank()
            "pilgrimage", "pilgrim-recall" -> PowerBank(selah = 1)
            else -> PowerBank(selah = 1, wind = 1)
        }
        return base.copy(illum = base.illum + reserved)
    }

    private fun jsonInt(el: kotlinx.serialization.json.JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }
}
