package app.completetheverse.ui.settings

import android.content.Context

data class CtvSettings(
    val quality: String = "high",
    val reduced: Boolean = false,
    val motion: String = "full",
    val haptics: Boolean = true,
    val music: Float = 0.45f,
    val sfx: Float = 0.7f,
    val musicMute: Boolean = false,
    val sfxMute: Boolean = false,
)

class SettingsStore(context: Context) {
    private val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun load(): CtvSettings {
        val reduced = prefs.getBoolean(KEY_REDUCED, false)
        val motion = prefs.getString(KEY_MOTION, null)
            ?: if (reduced) "reduced" else "full"
        return CtvSettings(
            quality = prefs.getString(KEY_QUALITY, "high") ?: "high",
            reduced = reduced,
            motion = motion,
            haptics = prefs.getBoolean(KEY_HAPTICS, true),
            music = prefs.getFloat(KEY_MUSIC, 0.45f),
            sfx = prefs.getFloat(KEY_SFX, 0.7f),
            musicMute = prefs.getBoolean(KEY_MUSIC_MUTE, false),
            sfxMute = prefs.getBoolean(KEY_SFX_MUTE, false),
        )
    }

    fun save(settings: CtvSettings) {
        prefs.edit()
            .putString(KEY_QUALITY, settings.quality)
            .putBoolean(KEY_REDUCED, settings.reduced)
            .putString(KEY_MOTION, settings.motion)
            .putBoolean(KEY_HAPTICS, settings.haptics)
            .putFloat(KEY_MUSIC, settings.music)
            .putFloat(KEY_SFX, settings.sfx)
            .putBoolean(KEY_MUSIC_MUTE, settings.musicMute)
            .putBoolean(KEY_SFX_MUTE, settings.sfxMute)
            .apply()
    }

    companion object {
        const val PREFS = "ctv_set"
        const val KEY_QUALITY = "quality"
        const val KEY_REDUCED = "reduced"
        const val KEY_MOTION = "motion"
        const val KEY_HAPTICS = "haptics"
        const val KEY_MUSIC = "music"
        const val KEY_SFX = "sfx"
        const val KEY_MUSIC_MUTE = "musicMute"
        const val KEY_SFX_MUTE = "sfxMute"
    }
}
