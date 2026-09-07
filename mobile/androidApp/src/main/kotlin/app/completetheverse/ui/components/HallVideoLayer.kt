package app.completetheverse.ui.components

import android.view.TextureView
import androidx.annotation.RawRes
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import app.completetheverse.R

@Composable
fun HallVideoLayer(
    visible: Boolean,
    modifier: Modifier = Modifier,
) {
    MutedVideoLayer(
        rawRes = R.raw.hall,
        visible = visible,
        loop = true,
        modifier = modifier,
    )
}

@Composable
fun IntroVideoLayer(
    visible: Boolean,
    modifier: Modifier = Modifier,
    onEnded: (() -> Unit)? = null,
    onFailed: (() -> Unit)? = null,
) {
    MutedVideoLayer(
        rawRes = R.raw.intro,
        visible = visible,
        loop = false,
        modifier = modifier,
        onEnded = onEnded,
        onFailed = onFailed,
    )
}

@Composable
private fun MutedVideoLayer(
    @RawRes rawRes: Int,
    visible: Boolean,
    loop: Boolean,
    modifier: Modifier = Modifier,
    onEnded: (() -> Unit)? = null,
    onFailed: (() -> Unit)? = null,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val endedCb by rememberUpdatedState(onEnded)
    val failedCb by rememberUpdatedState(onFailed)
    val player = remember(context, rawRes, loop) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri("android.resource://${context.packageName}/$rawRes"))
            repeatMode = if (loop) Player.REPEAT_MODE_ALL else Player.REPEAT_MODE_OFF
            volume = 0f
            playWhenReady = false
            prepare()
        }
    }
    fun syncPlayback() {
        val started = lifecycleOwner.lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED)
        if (visible && started) player.play() else player.pause()
    }
    DisposableEffect(player) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_ENDED) endedCb?.invoke()
            }
            override fun onPlayerError(error: PlaybackException) {
                failedCb?.invoke()
            }
        }
        player.addListener(listener)
        onDispose {
            player.removeListener(listener)
            player.release()
        }
    }
    DisposableEffect(lifecycleOwner, player, visible) {
        val observer = LifecycleEventObserver { _, _ -> syncPlayback() }
        lifecycleOwner.lifecycle.addObserver(observer)
        syncPlayback()
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            player.pause()
        }
    }
    LaunchedEffect(visible, player) {
        syncPlayback()
    }
    AndroidView(
        factory = { ctx ->
            TextureView(ctx).also { view ->
                player.setVideoTextureView(view)
            }
        },
        modifier = modifier,
        onRelease = { view ->
            player.clearVideoTextureView(view)
        },
    )
}
