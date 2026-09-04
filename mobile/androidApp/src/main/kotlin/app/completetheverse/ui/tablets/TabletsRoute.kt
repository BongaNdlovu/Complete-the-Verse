package app.completetheverse.ui.tablets

import android.os.SystemClock
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.viewmodel.compose.viewModel
import app.completetheverse.core.tablets.Tablets
import app.completetheverse.core.tablets.TabletsBank
import app.completetheverse.save.SaveCoordinator
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts
import kotlinx.coroutines.delay

@Composable
fun TabletsRoute(
    bank: TabletsBank?,
    bankReady: Boolean,
    loadError: String?,
    saveGeneration: Int,
    saves: SaveCoordinator,
    reducedMotion: Boolean,
    quality: String,
    onExit: () -> Unit,
    viewModel: TabletsViewModel = viewModel(),
) {
    val tutorialDone = Tablets.tutorialDone(saves.snapshot()) || Tablets.tutorialDone(viewModel.save)

    LaunchedEffect(bankReady, bank, saveGeneration, reducedMotion, quality) {
        viewModel.hydrate(bank, saves.snapshot(), reducedMotion, quality)
        if (!bankReady || bank == null) return@LaunchedEffect
        if (viewModel.uiPhase == TabletsUiPhase.Results) return@LaunchedEffect
        if (viewModel.shouldAutoTutorial(saves.snapshot()) &&
            (viewModel.uiPhase != TabletsUiPhase.Hold || viewModel.chapter == null)
        ) {
            viewModel.begin(bank, "prayer", saves, tutorial = true)
        }
    }

    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_STOP, Lifecycle.Event.ON_PAUSE -> viewModel.onHidden()
                Lifecycle.Event.ON_START, Lifecycle.Event.ON_RESUME -> viewModel.onVisible()
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    LaunchedEffect(
        viewModel.token,
        viewModel.uiPhase,
        viewModel.untimed,
        viewModel.paused,
        viewModel.pausedByHide,
    ) {
        if (viewModel.uiPhase != TabletsUiPhase.Hold || viewModel.untimed ||
            viewModel.paused || viewModel.pausedByHide
        ) {
            return@LaunchedEffect
        }
        val token = viewModel.token
        var last = SystemClock.elapsedRealtime()
        while (
            viewModel.uiPhase == TabletsUiPhase.Hold &&
            viewModel.token == token &&
            !viewModel.paused &&
            !viewModel.pausedByHide
        ) {
            val now = SystemClock.elapsedRealtime()
            if (now != last) viewModel.tickClock()
            last = now
            if (viewModel.uiPhase != TabletsUiPhase.Hold) break
            delay(50)
        }
    }

    fun leaveHold() {
        when {
            viewModel.uiPhase == TabletsUiPhase.Hold && viewModel.tutorial -> {
                viewModel.confirmLeave(bank, saves)
                onExit()
            }
            viewModel.uiPhase == TabletsUiPhase.Hold && !viewModel.paused -> viewModel.pause()
            viewModel.uiPhase == TabletsUiPhase.Hold && viewModel.confirmAbandon -> viewModel.stay()
            viewModel.uiPhase == TabletsUiPhase.Hold -> viewModel.resume()
            viewModel.uiPhase == TabletsUiPhase.Results -> viewModel.backToLibrary(bank)
            else -> onExit()
        }
    }

    BackHandler { leaveHold() }

    fun openChapter(id: String, tutorial: Boolean) {
        if (bank == null) return
        if (!viewModel.canOpenChapter(id, asTutorial = tutorial)) return
        viewModel.begin(bank, id, saves, tutorial = if (tutorial) true else null)
    }

    when {
        viewModel.uiPhase == TabletsUiPhase.Results -> {
            val res = viewModel.result
            if (res == null) {
                viewModel.backToLibrary(bank)
            } else {
                TabletsResultsScreen(
                    result = res,
                    onRetry = { if (bank != null) viewModel.retry(bank, saves) },
                    onNext = { if (bank != null) viewModel.nextChapter(bank, saves) },
                    onLibrary = { viewModel.backToLibrary(bank) },
                    onHall = {
                        viewModel.backToLibrary(bank)
                        onExit()
                    },
                )
            }
        }
        viewModel.uiPhase == TabletsUiPhase.Hold || !tutorialDone -> {
            val ch = viewModel.chapter
            if (ch == null) {
                LearnHoldPlaceholder(loadError = loadError)
            } else {
                TabletsHoldScreen(
                    chapter = ch,
                    step = viewModel.step,
                    gapIdx = viewModel.gapIdx,
                    remain = viewModel.remain,
                    tabletIdx = viewModel.tabletIdx,
                    tabletTotal = viewModel.tabletTotal,
                    choices = viewModel.choices,
                    grey = viewModel.grey,
                    selected = viewModel.selected,
                    lastCorrect = viewModel.lastCorrect,
                    resolving = viewModel.resolving,
                    hinted = viewModel.hinted,
                    illum = viewModel.illum,
                    winnowCharges = viewModel.winnow,
                    lamps = viewModel.lamps,
                    remainingMs = viewModel.remainingMs,
                    durationMs = viewModel.durationMs,
                    untimed = viewModel.untimed,
                    tutorial = viewModel.tutorial,
                    tutorialPrompt = viewModel.tutorialPrompt,
                    favor = viewModel.favor,
                    streak = viewModel.streak,
                    paused = viewModel.paused,
                    confirmAbandon = viewModel.confirmAbandon,
                    showPauseOverlay = (viewModel.paused && !viewModel.pausedByHide) || viewModel.confirmAbandon,
                    reducedMotion = reducedMotion,
                    skipHeavy = reducedMotion || quality != "high",
                    flyTick = viewModel.flyTick,
                    shatterTick = viewModel.shatterTick,
                    onPick = { viewModel.pick(it) },
                    onIlluminate = { viewModel.illuminate() },
                    onWinnow = { viewModel.winnow() },
                    onPause = { viewModel.pause() },
                    onResume = { viewModel.resume() },
                    onAbandonRequest = { viewModel.requestAbandon() },
                    onStay = { viewModel.stay() },
                    onConfirmAbandon = {
                        viewModel.confirmLeave(bank, saves)
                        if (viewModel.tutorial) onExit()
                    },
                )
            }
        }
        else -> TabletsLibraryScreen(
            groups = viewModel.groups,
            bankReady = bankReady,
            loadError = loadError,
            onOpen = { id, tutorial -> openChapter(id, tutorial) },
            onBack = onExit,
        )
    }
}

@Composable
private fun LearnHoldPlaceholder(loadError: String?) {
    Box(Modifier.fillMaxSize()) {
        HallBackdrop()
        Text(
            text = loadError ?: "Learn the Hold",
            modifier = Modifier.align(Alignment.Center).padding(24.dp),
            color = if (loadError != null) CtvColors.bloodHot else CtvColors.goldDim,
            fontFamily = CtvFonts.body,
            fontStyle = FontStyle.Italic,
            fontSize = 20.sp,
        )
    }
}
