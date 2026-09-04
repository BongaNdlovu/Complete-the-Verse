package app.completetheverse.ui.tablets

import android.os.SystemClock
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.completetheverse.core.play.Diffs
import app.completetheverse.core.play.PlayPersister
import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.tablets.TabletBlank
import app.completetheverse.core.tablets.TabletChapter
import app.completetheverse.core.tablets.Tablets
import app.completetheverse.core.tablets.TabletsBank
import app.completetheverse.core.tablets.TabletsConfig
import app.completetheverse.core.tablets.TabletsLibraryGroup
import app.completetheverse.core.tablets.TabletsPhase
import app.completetheverse.core.tablets.TabletsResult
import app.completetheverse.core.tablets.TabletsSession
import app.completetheverse.save.SaveCoordinator
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

enum class TabletsUiPhase { Library, Hold, Results }

class TabletsViewModel : ViewModel() {
    var uiPhase by mutableStateOf(TabletsUiPhase.Library)
        private set
    var save by mutableStateOf(Save.DEFAULT)
        private set
    var groups by mutableStateOf<List<TabletsLibraryGroup>>(emptyList())
        private set
    var chapter by mutableStateOf<TabletChapter?>(null)
        private set
    var step by mutableStateOf<List<TabletBlank>>(emptyList())
        private set
    var gapIdx by mutableIntStateOf(0)
        private set
    var tabletIdx by mutableIntStateOf(0)
        private set
    var tabletTotal by mutableIntStateOf(0)
        private set
    var remain by mutableStateOf("1 / 1")
        private set
    var choices by mutableStateOf<List<String>>(emptyList())
        private set
    var grey by mutableStateOf<List<String>>(emptyList())
        private set
    var selected by mutableStateOf<String?>(null)
        private set
    var lastCorrect by mutableStateOf<Boolean?>(null)
        private set
    var resolving by mutableStateOf(false)
        private set
    var hinted by mutableStateOf(false)
        private set
    var illum by mutableIntStateOf(1)
        private set
    var winnow by mutableIntStateOf(2)
        private set
    var lamps by mutableIntStateOf(Tablets.LIVES)
        private set
    var remainingMs by mutableLongStateOf(Tablets.BLANK_S * 1000L)
        private set
    var durationMs by mutableLongStateOf(Tablets.BLANK_S * 1000L)
        private set
    var untimed by mutableStateOf(false)
        private set
    var tutorial by mutableStateOf(false)
        private set
    var tutorialPrompt by mutableStateOf("")
        private set
    var favor by mutableIntStateOf(0)
        private set
    var streak by mutableIntStateOf(0)
        private set
    var paused by mutableStateOf(false)
        private set
    var confirmAbandon by mutableStateOf(false)
        private set
    var result by mutableStateOf<TabletsResult?>(null)
        private set
    var token by mutableIntStateOf(0)
        private set
    var flyTick by mutableIntStateOf(0)
        private set
    var shatterTick by mutableIntStateOf(0)
        private set
    var pausedByHide by mutableStateOf(false)
        private set

    private var session: TabletsSession? = null
    private var sessionGeneration = 0
    private var resolveJob: Job? = null
    private var reduced = false
    private var skipHeavy = false

    fun hydrate(bank: TabletsBank?, blob: SaveBlob, reducedMotion: Boolean, quality: String) {
        reduced = reducedMotion
        skipHeavy = reducedMotion || quality != "high"
        save = blob
        if (bank != null) groups = Tablets.library(bank, blob)
        if (!Tablets.tutorialDone(blob) && uiPhase == TabletsUiPhase.Library && session == null) {
            tutorial = true
            uiPhase = TabletsUiPhase.Hold
        }
    }

    fun shouldAutoTutorial(blob: SaveBlob): Boolean = !Tablets.tutorialDone(blob)

    fun canOpenChapter(id: String, asTutorial: Boolean = false): Boolean {
        if (asTutorial || id == "prayer") return true
        return Tablets.tutorialDone(save)
    }

    fun tickClock() {
        val s = session ?: return
        if (pausedByHide || s.phase != TabletsPhase.Playing || s.untimed) {
            remainingMs = s.remainingMs()
            return
        }
        s.tickTo(SystemClock.elapsedRealtime())
        publish()
    }

    fun onHidden() {
        val s = session ?: return
        if (uiPhase != TabletsUiPhase.Hold || s.ended) return
        if (s.phase == TabletsPhase.Paused || confirmAbandon) return
        pausedByHide = true
        s.pause()
        publish()
    }

    fun onVisible() {
        if (!pausedByHide) return
        pausedByHide = false
        if (confirmAbandon) return
        resume()
    }

    fun begin(bank: TabletsBank, id: String, saves: SaveCoordinator, tutorial: Boolean? = null) {
        if (!canOpenChapter(id, asTutorial = tutorial == true)) return
        val chapterId = if (!Tablets.tutorialDone(save)) "prayer" else id
        val wantTut = tutorial == true || chapterId == "prayer" || Tablets.chapter(bank, chapterId).tutorial
        chapter = Tablets.chapter(bank, chapterId)
        this.tutorial = wantTut
        untimed = reduced || wantTut
        uiPhase = TabletsUiPhase.Hold
        result = null
        pausedByHide = false
        cancelJobs()
        val loaded = saves.snapshot()
        save = loaded
        val run = TabletsSession.start(
            TabletsConfig(
                bank = bank,
                chapterId = chapterId,
                save = loaded,
                tutorial = wantTut,
                untimed = reduced || wantTut,
                persist = PlayPersister { blob -> saves.persistAsync(blob) },
                rng = { Random.nextDouble() },
                nowMs = { SystemClock.elapsedRealtime() },
                diff = Diffs.watchman,
            ),
        )
        session = run
        token++
        publish()
        saves.persistAsync(loaded)
    }

    fun pick(word: String) {
        val s = session ?: return
        if (s.resolving || s.ended || s.phase != TabletsPhase.Playing) return
        s.pick(word)
        publish()
        if (s.lastCorrect == true) flyTick++ else if (s.lastCorrect == false) shatterTick++
        afterResolve(s)
    }

    fun illuminate() {
        session?.illuminate()
        publish()
    }

    fun winnow() {
        session?.winnow()
        publish()
    }

    fun pause() {
        session?.pause()
        publish()
    }

    fun resume() {
        pausedByHide = false
        session?.resume()
        token++
        publish()
    }

    fun requestAbandon() {
        session?.requestAbandon()
        publish()
    }

    fun stay() {
        session?.stay()
        token++
        publish()
    }

    fun confirmLeave(bank: TabletsBank?, saves: SaveCoordinator) {
        val s = session ?: return
        val wasTutorial = s.tutorial
        s.abandon()
        save = s.save
        if (wasTutorial) {
            session = null
            uiPhase = TabletsUiPhase.Library
            if (bank != null) groups = Tablets.library(bank, save)
        } else {
            result = s.result
            uiPhase = TabletsUiPhase.Results
        }
        publish()
        saves.persistAsync(save)
    }

    fun backToLibrary(bank: TabletsBank?) {
        session = null
        result = null
        uiPhase = TabletsUiPhase.Library
        if (bank != null) groups = Tablets.library(bank, save)
        token++
    }

    fun retry(bank: TabletsBank, saves: SaveCoordinator) {
        val id = chapter?.id ?: return
        begin(bank, id, saves, tutorial = if (tutorial) true else null)
    }

    fun nextChapter(bank: TabletsBank, saves: SaveCoordinator) {
        val nxt = result?.next ?: return
        begin(bank, nxt.id, saves)
    }

    private fun afterResolve(s: TabletsSession) {
        if (!s.resolving) return
        val gen = sessionGeneration
        val hold = if (skipHeavy) 180L else if (s.lastCorrect == true) Tablets.HIT_HOLD_MS else Tablets.MISS_HOLD_MS
        resolveJob?.cancel()
        resolveJob = viewModelScope.launch {
            delay(hold)
            if (gen != sessionGeneration) return@launch
            val cur = session ?: return@launch
            cur.finishResolve()
            save = cur.save
            when (cur.phase) {
                TabletsPhase.TutorialDone -> {
                    result = cur.result
                    session = null
                    uiPhase = TabletsUiPhase.Library
                    groups = Tablets.library(cur.bank, save)
                }
                TabletsPhase.Results -> {
                    result = cur.result
                    uiPhase = TabletsUiPhase.Results
                }
                else -> token++
            }
            publish()
        }
    }

    private fun publish() {
        val s = session
        if (s == null) {
            resolving = false
            paused = false
            confirmAbandon = false
            return
        }
        chapter = s.chapter
        step = s.currentStep
        gapIdx = s.gapIdx
        tabletIdx = s.tabletIdx
        tabletTotal = s.tabletTotal
        remain = s.remainText
        choices = s.choices
        grey = s.grey
        selected = s.selected
        lastCorrect = s.lastCorrect
        resolving = s.resolving
        hinted = s.hinted
        illum = s.illum
        winnow = s.winnow
        lamps = s.lampsLeft
        remainingMs = s.remainingMs()
        durationMs = (s.tabletClockMax * 1000).toLong()
        untimed = s.untimed
        tutorial = s.tutorial
        tutorialPrompt = if (s.tutorial) Tablets.tutorialPrompt(s.tabletIdx) else ""
        favor = s.favor
        streak = s.streak
        paused = s.phase == TabletsPhase.Paused
        confirmAbandon = s.confirmAbandon
        result = s.result ?: result
        save = s.save
    }

    private fun cancelJobs() {
        sessionGeneration++
        resolveJob?.cancel()
        resolveJob = null
        session = null
    }
}
