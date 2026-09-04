package app.completetheverse.ui.pilgrimage

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.pilgrimage.Arc
import app.completetheverse.core.pilgrimage.Artifact
import app.completetheverse.core.pilgrimage.Artifacts
import app.completetheverse.core.pilgrimage.PilgrimProgress
import app.completetheverse.core.pilgrimage.Pilgrimage
import app.completetheverse.core.pilgrimage.Site
import app.completetheverse.core.pilgrimage.SiteBrief
import app.completetheverse.core.play.Diff
import app.completetheverse.core.play.Diffs
import app.completetheverse.core.play.PlayFinishInfo
import app.completetheverse.core.play.PlayQuestion
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.srs.Srs
import app.completetheverse.save.SaveCoordinator
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

enum class PilgrimagePhase { Road, Brief, Play }

class PilgrimageViewModel : ViewModel() {
    var phase by mutableStateOf(PilgrimagePhase.Road)
        private set
    var progress by mutableStateOf(Pilgrimage.blankProgress())
        private set
    var relics by mutableStateOf<List<Artifact>>(emptyList())
        private set
    var brief by mutableStateOf<SiteBrief?>(null)
        private set
    var questions by mutableStateOf<List<PlayQuestion>>(emptyList())
        private set
    var playSite by mutableStateOf<Site?>(null)
        private set
    var playSiteVerses by mutableStateOf<List<Verse>>(emptyList())
        private set
    var playGeneration by mutableStateOf(0)
        private set
    var engine by mutableStateOf<Pilgrimage?>(null)
        private set
    var diff by mutableStateOf(Diffs.disciple)
        private set

    fun hydrate(sites: List<Site>, arcs: List<Arc>, verses: List<Verse>, save: SaveBlob) {
        engine = Pilgrimage(sites, arcs, verses)
        progress = Pilgrimage.fromSave(save)
        relics = Artifacts.unlockedList(Artifacts.fromSave(save))
        diff = diffFromSave(save)
        if (phase == PilgrimagePhase.Play && questions.isEmpty()) {
            phase = PilgrimagePhase.Road
        }
    }

    fun openBrief(siteId: String) {
        val p = engine ?: return
        val card = p.brief(siteId, progress) ?: return
        if (!card.unlocked) return
        brief = card
        phase = PilgrimagePhase.Brief
    }

    fun backToRoad(saves: SaveCoordinator) {
        progress = Pilgrimage.fromSave(saves.snapshot())
        relics = Artifacts.unlockedList(Artifacts.fromSave(saves.snapshot()))
        questions = emptyList()
        playSite = null
        playSiteVerses = emptyList()
        brief = null
        phase = PilgrimagePhase.Road
    }

    fun beginSite(verses: List<Verse>, tfClaims: List<TfClaim>, saves: SaveCoordinator) {
        val p = engine ?: return
        val card = brief ?: return
        val save = saves.snapshot()
        progress = Pilgrimage.fromSave(save)
        val rec = p.recordOf(progress, card.site.id)
        val exclude = p.usedSet(progress)
        diff = diffFromSave(save)
        val drawn = p.drawSite(
            siteId = card.site.id,
            attempt = rec?.attempts ?: 0,
            exclude = exclude,
            dueVerses = dueVerses(save, exclude),
        )
        if (drawn.verses.isEmpty()) return
        questions = p.questionsFor(drawn.verses, card.index, hasTf = tfClaims.isNotEmpty())
        playSite = card.site
        playSiteVerses = drawn.verses
        playGeneration++
        phase = PilgrimagePhase.Play
    }

    fun wrapSave(siteId: String, verses: List<Verse>): (SaveBlob, PlayFinishInfo) -> SaveBlob = { blob, info ->
        val p = engine
        if (p == null) {
            blob
        } else {
            val served = verses.take(info.index + 1).map { it.id }
            val acc = if (info.attempts == 0) 0 else kotlin.math.round(info.correct * 100.0 / info.attempts).toInt()
            p.applyRun(
                save = blob,
                siteId = siteId,
                servedIds = served,
                cleared = info.reason == "complete",
                score = info.total,
                accuracy = acc,
                at = System.currentTimeMillis(),
            )
        }
    }

    fun leavePlay(saves: SaveCoordinator) {
        progress = Pilgrimage.fromSave(saves.snapshot())
        relics = Artifacts.unlockedList(Artifacts.fromSave(saves.snapshot()))
        questions = emptyList()
        playSite = null
        playSiteVerses = emptyList()
        brief = null
        phase = PilgrimagePhase.Road
    }

    private fun dueVerses(save: SaveBlob, exclude: Set<String>): List<Verse> {
        val p = engine ?: return emptyList()
        val cards = Srs.cardsFromSave(save["srs"])
        val today = Srs.dayNumber()
        return p.verses.filter { v ->
            if (v.id in exclude) return@filter false
            val c = cards[v.id] ?: return@filter false
            (c.reps != 0 || c.lapses != 0) && Srs.isDue(c, today)
        }
    }

    private fun diffFromSave(save: SaveBlob): Diff {
        val key = ((save["set"] as? JsonObject)?.get("diff") as? JsonPrimitive)?.content
        return Diffs.resolve(key)
    }
}
