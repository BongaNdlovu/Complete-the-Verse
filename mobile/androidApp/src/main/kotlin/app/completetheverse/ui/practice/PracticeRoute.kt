package app.completetheverse.ui.practice

import android.os.SystemClock
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.lifecycle.viewmodel.compose.viewModel
import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.practice.Practice
import app.completetheverse.save.SaveCoordinator
import kotlinx.coroutines.delay

@Composable
fun PracticeRoute(
    verses: List<Verse>,
    versesReady: Boolean,
    verseError: String?,
    saves: SaveCoordinator,
    onExit: () -> Unit,
    viewModel: PracticeViewModel = viewModel(),
) {
    LaunchedEffect(versesReady, verses) {
        if (versesReady) viewModel.hydrate(verses, saves.snapshot())
    }

    LaunchedEffect(viewModel.questionToken, viewModel.phase) {
        if (viewModel.phase != PracticePhase.Play) return@LaunchedEffect
        val token = viewModel.questionToken
        val start = viewModel.questionStart
        while (viewModel.phase == PracticePhase.Play && viewModel.questionToken == token) {
            viewModel.tickClock()
            if (viewModel.locked) break
            if (SystemClock.elapsedRealtime() - start >= Practice.WALL_PICK_MS) {
                val mode = if (viewModel.assemble != null) "assembly" else "choice"
                viewModel.submit(
                    ok = false,
                    timedOut = true,
                    fraction = null,
                    mode = mode,
                    saves = saves,
                    verses = verses,
                )
                break
            }
            delay(50)
        }
    }

    fun leave() {
        viewModel.abandon(verses, saves)
        onExit()
    }

    BackHandler { leave() }

    when (viewModel.phase) {
        PracticePhase.Brief -> PracticeBriefScreen(
            dueCount = viewModel.due,
            versesReady = versesReady,
            loadError = verseError,
            canBegin = versesReady && verses.isNotEmpty(),
            onBegin = { viewModel.begin(verses, saves) },
            onBack = { leave() },
        )
        PracticePhase.Play -> {
            val verse = viewModel.queue.getOrNull(viewModel.index)
            if (verse == null) {
                PracticeBriefScreen(
                    dueCount = viewModel.due,
                    versesReady = versesReady,
                    loadError = verseError,
                    canBegin = versesReady && verses.isNotEmpty(),
                    onBegin = { viewModel.begin(verses, saves) },
                    onBack = { leave() },
                )
            } else {
                PracticePlayScreen(
                    verse = verse,
                    index = viewModel.index,
                    total = viewModel.queue.size,
                    remainingMs = viewModel.remainingMs(),
                    assemble = viewModel.assemble,
                    assembleTick = viewModel.assembleTick,
                    choices = viewModel.choices,
                    locked = viewModel.locked,
                    lastCorrect = viewModel.lastCorrect,
                    selected = viewModel.selected,
                    onChoice = { choice ->
                        if (viewModel.locked) return@PracticePlayScreen
                        viewModel.selectChoice(choice)
                        val ok = Practice.choiceMatches(choice, verse.a)
                        viewModel.submit(
                            ok = ok,
                            timedOut = false,
                            fraction = viewModel.fractionNow(),
                            mode = "choice",
                            saves = saves,
                            verses = verses,
                        )
                    },
                    onAssembleChange = { viewModel.bumpAssemble() },
                    onLockAssemble = {
                        val board = viewModel.assemble ?: return@PracticePlayScreen
                        if (viewModel.locked || !Assemble.isFilled(board)) return@PracticePlayScreen
                        val ok = Practice.assembleMatches(board, verse.a)
                        viewModel.submit(
                            ok = ok,
                            timedOut = false,
                            fraction = viewModel.fractionNow(),
                            mode = "assembly",
                            saves = saves,
                            verses = verses,
                        )
                    },
                    onHall = { leave() },
                )
            }
        }
        PracticePhase.Results -> PracticeResultsScreen(
            results = PracticeResults(
                correct = viewModel.correct,
                attempts = viewModel.attempts,
                elapsedMs = viewModel.elapsedMs,
                cards = viewModel.cards,
                dueCount = viewModel.due,
            ),
            onHall = { leave() },
        )
    }
}
