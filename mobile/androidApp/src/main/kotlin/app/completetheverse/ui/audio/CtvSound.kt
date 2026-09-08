package app.completetheverse.ui.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import app.completetheverse.ui.settings.CtvSettings

object CtvMedia {
    const val ORIGIN = "https://complete-the-verse.vercel.app"
    fun journeyFilm(siteId: String) = "$ORIGIN/assets/journey/$siteId.mp4"
    fun journeyStill(siteId: String) = "$ORIGIN/assets/journey/$siteId.webp"
    fun audio(file: String) = "$ORIGIN/audio/$file"
}

interface CtvSoundHolder {
    fun apply(next: CtvSettings)
    fun ambience(name: String)
    fun play(key: String)
    fun haptic(crit: Boolean)
}

object CtvSoundNone : CtvSoundHolder {
    override fun apply(next: CtvSettings) {}
    override fun ambience(name: String) {}
    override fun play(key: String) {}
    override fun haptic(crit: Boolean) {}
}

val LocalCtvSound = staticCompositionLocalOf<CtvSoundHolder> { CtvSoundNone }

class CtvSound(private val context: Context) : CtvSoundHolder {
    private var settings = CtvSettings()
    private val pool: SoundPool = SoundPool.Builder()
        .setMaxStreams(6)
        .setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build(),
        )
        .build()
    private val sfxIds = mutableMapOf<String, Int>()
    private var bed: ExoPlayer? = null
    private var bedName: String? = null

    init {
        listOf(
            "ui", "hover", "lock", "correct", "wrong", "tick", "tick-crit", "heart",
            "power", "seal", "level", "death", "victory", "act",
        ).forEach { key ->
            try {
                val afd = context.assets.openFd("sfx/$key.mp3")
                sfxIds[key] = pool.load(afd, 1)
                afd.close()
            } catch (_: Exception) {
            }
        }
    }

    override fun apply(next: CtvSettings) {
        settings = next
        val v = musicOut()
        bed?.volume = v
        if (v <= 0f) bed?.pause() else if (bedName != null) bed?.play()
    }

    override fun ambience(name: String) {
        if (bedName == name && bed != null) {
            apply(settings)
            return
        }
        bedName = name
        val file = when (name) {
            "menu" -> "menu.mp3"
            "results" -> "results.mp3"
            "indigo" -> "indigo.mp3"
            "heroes" -> "heroes.mp3"
            else -> "menu.mp3"
        }
        bed?.release()
        val player = ExoPlayer.Builder(context).build()
        player.setMediaItem(MediaItem.fromUri(CtvMedia.audio(file)))
        player.repeatMode = Player.REPEAT_MODE_ALL
        player.volume = musicOut()
        player.playWhenReady = musicOut() > 0f
        player.prepare()
        bed = player
    }

    override fun play(key: String) {
        val id = sfxIds[key] ?: return
        val v = sfxOut()
        if (v <= 0f) return
        pool.play(id, v, v, 1, 0, 1f)
    }

    override fun haptic(crit: Boolean) {
        if (!settings.haptics) return
        val vib = if (Build.VERSION.SDK_INT >= 31) {
            context.getSystemService(VibratorManager::class.java).defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        val ms = if (crit) 40L else 24L
        if (Build.VERSION.SDK_INT >= 26) {
            vib.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vib.vibrate(ms)
        }
    }

    fun release() {
        bed?.release()
        bed = null
        pool.release()
    }

    private fun musicOut(): Float {
        if (settings.musicMute) return 0f
        return settings.music.coerceIn(0f, 1f)
    }

    private fun sfxOut(): Float {
        if (settings.sfxMute) return 0f
        return settings.sfx.coerceIn(0f, 1f)
    }
}
