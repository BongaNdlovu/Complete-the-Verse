package app.completetheverse.ui.tablets

import android.os.SystemClock
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.lifecycle.viewmodel.compose.viewModel
import app.completetheverse.core.tablets.TabletsBank
import app.completetheverse.save.SaveCoordinator
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
    LaunchedEffect(bankReady, bank, saveGeneration, reducedMotion, quality) {
        viewModel.hydrate(bank, saves.snapshot(), reducedMotion, quality)
        if (bankReady && bank != null && viewModel.uiPhase == TabletsUiPhase.Library &&
            viewModel.shouldAutoTutorial(saves.snapshot())
        ) {
            viewModel.begin(bank, "prayer", saves, tutorial = true)
        }
    }

    LaunchedEffect(viewModel.token, viewModel.uiPhase, viewModel.untimed, viewModel.paused) {
        if (viewModel.uiPhase != TabletsUiPhase.Hold || viewModel.untimed || viewModel.paused) return@LaunchedEffect
        val token = viewModel.token
        var last = SystemClock.elapsedRealtime()
        while (viewModel.uiPhase == TabletsUiPhase.Hold && viewModel.token == token && !viewModel.paused) {
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

    when (viewModel.uiPhase) {
        TabletsUiPhase.Library -> TabletsLibraryScreen(
            groups = viewModel.groups,
            bankReady = bankReady,
            loadError = loadError,
            onOpen = { id, tutorial ->
                if (bank != null) viewModel.begin(bank, id, saves, tutorial = if (tutorial) true else null)
            },
            onBack = onExit,
        )
        TabletsUiPhase.Hold -> {
            val ch = viewModel.chapter
            if (ch == null) {
                TabletsLibraryScreen(
                    groups = viewModel.groups,
                    bankReady = bankReady,
                    loadError = loadError,
                    onOpen = { id, tutorial ->
                        if (bank != null) viewModel.begin(bank, id, saves, tutorial = if (tutorial) true else null)
                    },
                    onBack = onExit,
                )
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
        TabletsUiPhase.Results -> {
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
    }
}
