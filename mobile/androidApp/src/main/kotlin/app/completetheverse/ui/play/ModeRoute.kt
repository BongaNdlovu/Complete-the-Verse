package app.completetheverse.ui.play

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.play.Diff
import app.completetheverse.core.play.Diffs
import app.completetheverse.core.play.ModeRun
import app.completetheverse.core.play.Modes
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.save.SaveCoordinator
import app.completetheverse.ui.hall.MODES
import kotlin.random.Random

class ModeRunViewModel : ViewModel() {
    var run by mutableStateOf<ModeRun?>(null)
        private set

    fun begin(
        mode: String,
        verses: List<Verse>,
        save: SaveBlob,
        diff: Diff,
        teamStart: String = "white",
    ) {
        if (verses.isEmpty()) return
        run = Modes.build(
            mode = mode,
            verses = verses,
            save = save,
            diff = diff,
            rng = { Random.nextDouble() },
            today = Modes.todayKey(),
            teamStart = teamStart,
        )
    }

    fun reset() {
        run = null
    }
}

@Composable
fun ModeRoute(
    modeKey: String,
    verses: List<Verse>,
    versesReady: Boolean,
    verseError: String?,
    tfClaims: List<TfClaim>,
    saveGeneration: Int,
    saves: SaveCoordinator,
    onExit: () -> Unit,
    onBlitzScore: (SaveBlob) -> Unit = {},
    viewModel: ModeRunViewModel = viewModel(key = "mode-$modeKey"),
) {
    val hall = MODES[modeKey] ?: return
    var diffKey by rememberSaveable(modeKey) { mutableStateOf(Diffs.disciple.key) }
    val diff = Diffs.resolve(diffKey)
    val save = saves.snapshot().also { saveGeneration }
    val run = viewModel.run

    if (run == null || run.questions.isEmpty()) {
        ModeBriefScreen(
            mode = hall,
            diff = diff,
            onDiff = { next -> diffKey = next.key },
            versesReady = versesReady,
            loadError = verseError,
            canBegin = versesReady && verses.isNotEmpty(),
            dailyPractise = modeKey == "daily" && Modes.dailyAlreadyRecorded(save),
            onBegin = { viewModel.begin(modeKey, verses, save, diff) },
            onTeamStart = { side -> viewModel.begin(modeKey, verses, save, diff, side) },
            onBack = {
                viewModel.reset()
                onExit()
            },
        )
        return
    }

    PlayRoute(
        questions = run.questions,
        clockPolicy = run.clockPolicy,
        lives = run.lives,
        saves = saves,
        onExit = {
            viewModel.reset()
            onExit()
        },
        mode = run.mode,
        diff = run.diff,
        verses = verses,
        siteVerses = verses,
        tfClaims = tfClaims,
        title = run.title,
        teamStart = run.teamStart,
        todayKey = Modes.todayKey(),
        moreQuestions = run.moreQuestions,
        onResult = { result ->
            if (run.mode == "blitz") onBlitzScore(result.save)
        },
    )
}
