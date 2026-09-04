package app.completetheverse.ui.lessons

import androidx.compose.runtime.Composable
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.play.ClockPolicy
import app.completetheverse.core.play.Tutorial
import app.completetheverse.save.SaveCoordinator
import app.completetheverse.ui.play.PlayRoute

@Composable
fun LessonsRoute(
    verses: List<Verse>,
    saves: SaveCoordinator,
    onExit: () -> Unit,
) {
    PlayRoute(
        questions = Tutorial.QUESTIONS,
        clockPolicy = ClockPolicy.Wall,
        lives = 0,
        saves = saves,
        onExit = onExit,
        mode = "tutorial",
        verses = verses,
        siteVerses = Tutorial.QUESTIONS.mapNotNull { it.verse },
        title = "First Light",
        wrapSave = Tutorial::wrapSave,
        resultsPrimaryLabel = "Enter the hall",
        guides = Tutorial.GUIDE,
        guideKickPrefix = "First light",
    )
}
