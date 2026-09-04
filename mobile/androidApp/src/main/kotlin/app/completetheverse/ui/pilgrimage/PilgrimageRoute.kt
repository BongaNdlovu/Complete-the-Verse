package app.completetheverse.ui.pilgrimage

import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.lifecycle.viewmodel.compose.viewModel as composeViewModel
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.pilgrimage.Arc
import app.completetheverse.core.pilgrimage.Site
import app.completetheverse.core.play.ClockPolicy
import app.completetheverse.core.play.Diffs
import app.completetheverse.save.SaveCoordinator
import app.completetheverse.ui.play.PlayRoute
import app.completetheverse.ui.play.PlayViewModel

@Composable
fun PilgrimageRoute(
    sites: List<Site>,
    arcs: List<Arc>,
    verses: List<Verse>,
    tfClaims: List<TfClaim>,
    versesReady: Boolean,
    verseError: String?,
    saveGeneration: Int,
    saves: SaveCoordinator,
    onExit: () -> Unit,
    viewModel: PilgrimageViewModel = composeViewModel(),
) {
    LaunchedEffect(versesReady, sites, verses, saveGeneration) {
        if (versesReady && sites.isNotEmpty()) {
            viewModel.hydrate(sites, arcs, verses, saves.snapshot())
        }
    }

    BackHandler {
        when (viewModel.phase) {
            PilgrimagePhase.Road -> onExit()
            PilgrimagePhase.Brief -> viewModel.backToRoad(saves)
            PilgrimagePhase.Play -> Unit
        }
    }

    when (viewModel.phase) {
        PilgrimagePhase.Road -> PilgrimageRoadScreen(
            engine = viewModel.engine,
            progress = viewModel.progress,
            relics = viewModel.relics,
            versesReady = versesReady,
            loadError = verseError,
            onOpenSite = { viewModel.openBrief(it) },
            onBack = onExit,
        )
        PilgrimagePhase.Brief -> {
            val card = viewModel.brief
            if (card == null) {
                LaunchedEffect(Unit) { viewModel.backToRoad(saves) }
            } else {
                PilgrimageBriefScreen(
                    brief = card,
                    canBegin = versesReady && verses.isNotEmpty(),
                    onBegin = { viewModel.beginSite(verses, tfClaims, saves) },
                    onBack = { viewModel.backToRoad(saves) },
                )
            }
        }
        PilgrimagePhase.Play -> {
            val site = viewModel.playSite
            val questions = viewModel.questions
            if (site == null || questions.isEmpty()) {
                LaunchedEffect(Unit) { viewModel.leavePlay(saves) }
            } else {
                val playVm: PlayViewModel = composeViewModel(key = "pilgrimage:${site.id}:${viewModel.playGeneration}")
                PlayRoute(
                    questions = questions,
                    clockPolicy = ClockPolicy.Play,
                    lives = Diffs.disciple.lives,
                    saves = saves,
                    onExit = { viewModel.leavePlay(saves) },
                    mode = "pilgrimage",
                    diff = Diffs.disciple,
                    verses = verses,
                    siteVerses = viewModel.playSiteVerses,
                    tfClaims = tfClaims,
                    title = site.name,
                    wrapSave = viewModel.wrapSave(site.id, viewModel.playSiteVerses),
                    viewModel = playVm,
                )
            }
        }
    }
}
