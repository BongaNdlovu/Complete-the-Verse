package app.completetheverse.ui.study

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.play.ClockPolicy
import app.completetheverse.core.play.Mechanic
import app.completetheverse.core.play.PlayQuestion
import app.completetheverse.core.practice.Practice
import app.completetheverse.core.study.Study
import app.completetheverse.save.SaveCoordinator
import app.completetheverse.ui.play.PlayRoute

@Composable
fun StudyRoute(
    verses: List<Verse>,
    versesReady: Boolean,
    verseError: String?,
    saves: SaveCoordinator,
    onExit: () -> Unit,
) {
    var reviewId by rememberSaveable { mutableStateOf<String?>(null) }
    val review = verses.firstOrNull { it.id == reviewId }
    if (review != null) {
        val assemble = Practice.usesAssemble(0, review)
        val mechanic = if (assemble) Mechanic.Assemble else Mechanic.Mcq
        PlayRoute(
            questions = listOf(PlayQuestion(mechanic, review)),
            clockPolicy = ClockPolicy.Wall,
            lives = 0,
            saves = saves,
            onExit = { reviewId = null },
            mode = "study",
            verses = verses,
            siteVerses = listOf(review),
            title = review.r,
            wrapSave = { blob, info ->
                Study.applyReview(
                    save = blob,
                    verse = review,
                    correct = info.correct > 0,
                    timedOut = info.timedOut,
                    fraction = info.fraction,
                    mode = if (mechanic == Mechanic.Assemble) "assembly" else "choice",
                )
            },
            resultsPrimaryLabel = "Back to Study Hall",
        )
    } else {
        StudyScreen(
            verses = verses,
            versesReady = versesReady,
            loadError = verseError,
            save = saves.snapshot(),
            onReview = { reviewId = it.id },
            onBack = onExit,
        )
    }
}
