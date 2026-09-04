package app.completetheverse.ui.play

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.play.ClockPolicy
import app.completetheverse.core.play.Diff
import app.completetheverse.core.play.Diffs
import app.completetheverse.core.play.Mechanic
import app.completetheverse.core.play.OverdriveChoice
import app.completetheverse.core.play.PlayPhase
import app.completetheverse.core.play.PlayQuestion
import app.completetheverse.core.play.PlayResult
import app.completetheverse.save.SaveCoordinator
import app.completetheverse.ui.components.HallBackdrop
import kotlinx.coroutines.delay

@Composable
fun PlayRoute(
    questions: List<PlayQuestion>,
    clockPolicy: ClockPolicy,
    lives: Int,
    saves: SaveCoordinator,
    onExit: () -> Unit,
    mode: String = "play",
    diff: Diff = Diffs.disciple,
    verses: List<Verse> = emptyList(),
    siteVerses: List<Verse> = emptyList(),
    tfClaims: List<TfClaim> = emptyList(),
    title: String = "The Record",
    teamStart: String = "white",
    todayKey: String = "",
    moreQuestions: ((Int) -> PlayQuestion?)? = null,
    onResult: (PlayResult) -> Unit = {},
    viewModel: PlayViewModel = viewModel(key = mode),
) {
    LaunchedEffect(questions, clockPolicy, lives, mode, teamStart, todayKey) {
        if (questions.isEmpty()) return@LaunchedEffect
        viewModel.begin(
            questions = questions,
            clockPolicy = clockPolicy,
            lives = lives,
            saves = saves,
            mode = mode,
            diff = diff,
            verses = verses,
            siteVerses = siteVerses,
            tfClaims = tfClaims,
            title = title,
            teamStart = teamStart,
            todayKey = todayKey,
            moreQuestions = moreQuestions,
        )
    }

    LaunchedEffect(viewModel.result) {
        val result = viewModel.result ?: return@LaunchedEffect
        onResult(result)
    }

    LaunchedEffect(viewModel.questionToken, viewModel.phase, viewModel.ready) {
        if (!viewModel.ready || viewModel.phase != PlayPhase.Playing) return@LaunchedEffect
        val token = viewModel.questionToken
        while (viewModel.ready && viewModel.phase == PlayPhase.Playing && viewModel.questionToken == token) {
            viewModel.tickClock()
            if (viewModel.locked || viewModel.phase != PlayPhase.Playing) break
            delay(50)
        }
    }

    fun leave() {
        viewModel.abandon(saves)
        onExit()
    }

    BackHandler {
        when {
            !viewModel.ready -> onExit()
            viewModel.confirmAbandon -> viewModel.stay()
            viewModel.phase == PlayPhase.Overdrive -> viewModel.resolveOverdrive(OverdriveChoice.Bank)
            viewModel.phase == PlayPhase.Handoff -> viewModel.requestAbandon()
            viewModel.phase == PlayPhase.Paused -> viewModel.resume()
            viewModel.phase == PlayPhase.Results -> leave()
            viewModel.phase == PlayPhase.Playing && !viewModel.locked -> viewModel.pause()
            else -> viewModel.requestAbandon()
        }
    }

    if (!viewModel.ready) {
        Box(Modifier.fillMaxSize()) { HallBackdrop() }
        return
    }

    PlayStage(
        title = viewModel.title,
        mode = mode,
        mechanic = viewModel.mechanic,
        verse = viewModel.verse,
        claim = viewModel.claim,
        index = viewModel.index,
        total = viewModel.total,
        remainingMs = viewModel.remainingNow(),
        durationMs = viewModel.durationMs,
        lives = viewModel.lives,
        maxLives = viewModel.maxLives,
        score = viewModel.score,
        streak = viewModel.streak,
        multiplier = viewModel.multiplier(),
        correctCount = viewModel.correct,
        attemptCount = viewModel.attempts,
        locked = viewModel.locked,
        lastCorrect = viewModel.lastCorrect,
        selected = viewModel.selected,
        tfPickedTrue = viewModel.tfPickedTrue,
        choices = viewModel.choices,
        assemble = viewModel.assemble,
        cloze = viewModel.cloze,
        duel = viewModel.duel,
        fadePhase = viewModel.fadePhase,
        boardTick = viewModel.boardTick,
        phase = viewModel.phase,
        confirmAbandon = viewModel.confirmAbandon,
        overdriveBank = viewModel.overdriveBankAmount(),
        result = viewModel.result,
        teamSide = viewModel.teamSide,
        onChoice = { choice ->
            if (viewModel.locked) return@PlayStage
            when (viewModel.mechanic) {
                Mechanic.Assemble -> Unit
                Mechanic.Cloze -> viewModel.pickCloze(choice)
                Mechanic.TrueFalse -> Unit
                else -> viewModel.submitChoice(choice)
            }
        },
        onAssembleChange = { viewModel.bumpAssemble() },
        onLockAssemble = {
            val board = viewModel.assemble ?: return@PlayStage
            if (viewModel.locked || !Assemble.isFilled(board)) return@PlayStage
            viewModel.submitAssemble()
        },
        onClozeUnfill = { viewModel.unfillCloze(it) },
        onTrueFalse = { viewModel.submitTrueFalse(it) },
        onFadeDone = { viewModel.fadeDone() },
        onPause = { viewModel.pause() },
        onResume = { viewModel.resume() },
        onAbandonRequest = { viewModel.requestAbandon() },
        onStay = { viewModel.stay() },
        onConfirmAbandon = { leave() },
        onOverdrive = { viewModel.resolveOverdrive(it) },
        onHandoffContinue = { viewModel.continueHandoff() },
        onHall = { leave() },
    )
}
