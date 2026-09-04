package app.completetheverse.ui.play

import android.os.SystemClock
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.completetheverse.core.assemble.AssembleBoard
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.play.ClockPolicy
import app.completetheverse.core.play.ClozeBoard
import app.completetheverse.core.play.Diff
import app.completetheverse.core.play.Diffs
import app.completetheverse.core.play.DuelBoard
import app.completetheverse.core.play.FadePhase
import app.completetheverse.core.play.Mechanic
import app.completetheverse.core.play.OverdriveChoice
import app.completetheverse.core.play.PlayClock
import app.completetheverse.core.play.PlayConfig
import app.completetheverse.core.play.PlayPhase
import app.completetheverse.core.play.PlayPersister
import app.completetheverse.core.play.PlayQuestion
import app.completetheverse.core.play.PlayResult
import app.completetheverse.core.play.PlaySession
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.save.SaveCoordinator
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

class PlayViewModel : ViewModel() {
    var phase by mutableStateOf(PlayPhase.Playing)
        private set
    var index by mutableIntStateOf(0)
        private set
    var total by mutableIntStateOf(0)
        private set
    var correct by mutableIntStateOf(0)
        private set
    var attempts by mutableIntStateOf(0)
        private set
    var score by mutableIntStateOf(0)
        private set
    var streak by mutableIntStateOf(0)
        private set
    var lives by mutableIntStateOf(0)
        private set
    var maxLives by mutableIntStateOf(0)
        private set
    var locked by mutableStateOf(false)
        private set
    var lastCorrect by mutableStateOf<Boolean?>(null)
        private set
    var selected by mutableStateOf<String?>(null)
        private set
    var choices by mutableStateOf<List<String>>(emptyList())
        private set
    var assemble by mutableStateOf<AssembleBoard?>(null)
        private set
    var cloze by mutableStateOf<ClozeBoard?>(null)
        private set
    var duel by mutableStateOf<DuelBoard?>(null)
        private set
    var fadePhase by mutableStateOf<FadePhase?>(null)
        private set
    var claim by mutableStateOf<TfClaim?>(null)
        private set
    var mechanic by mutableStateOf<Mechanic?>(null)
        private set
    var verse by mutableStateOf<Verse?>(null)
        private set
    var durationMs by mutableLongStateOf(0L)
        private set
    var remainingMs by mutableLongStateOf(0L)
        private set
    var boardTick by mutableIntStateOf(0)
        private set
    var questionToken by mutableIntStateOf(0)
        private set
    var title by mutableStateOf("The Record")
        private set
    var confirmAbandon by mutableStateOf(false)
        private set
    var overdriveRide by mutableStateOf(false)
        private set
    var tfPickedTrue by mutableStateOf<Boolean?>(null)
        private set
    var result by mutableStateOf<PlayResult?>(null)
        private set
    var ready by mutableStateOf(false)
        private set

    private var session: PlaySession? = null
    private var sessionGeneration = 0
    private var beginJob: Job? = null
    private var advanceJob: Job? = null
    private var overdriveJob: Job? = null

    fun remainingNow(): Long = session?.remainingMs(SystemClock.elapsedRealtime()) ?: remainingMs

    fun fractionNow(): Double = session?.fractionNow(SystemClock.elapsedRealtime()) ?: 0.0

    fun overdriveBankAmount(): Int = session?.overdriveBankAmount() ?: 0

    fun multiplier(): Int = session?.multiplier() ?: 1

    fun tickClock() {
        val s = session ?: return
        remainingMs = s.remainingMs(SystemClock.elapsedRealtime())
        if (s.phase == PlayPhase.Playing && s.running && !s.locked && remainingMs <= 0L) {
            s.onTimeout(SystemClock.elapsedRealtime())
            publish()
            if (s.locked) scheduleAdvance(s)
        }
    }

    fun begin(
        questions: List<PlayQuestion>,
        clockPolicy: ClockPolicy,
        lives: Int,
        saves: SaveCoordinator,
        mode: String = "play",
        diff: Diff = Diffs.disciple,
        verses: List<Verse> = emptyList(),
        siteVerses: List<Verse> = emptyList(),
        tfClaims: List<TfClaim> = emptyList(),
        title: String = "The Record",
        save: SaveBlob? = null,
    ) {
        if (questions.isEmpty()) return
        cancelSessionJobs()
        val gen = ++sessionGeneration
        ready = false
        beginJob = viewModelScope.launch {
            val loaded = save ?: saves.persistMerged()
            if (gen != sessionGeneration) return@launch
            val run = PlaySession.start(
                PlayConfig(
                    questions = questions,
                    clockPolicy = clockPolicy,
                    lives = lives,
                    persist = PlayPersister { blob -> saves.persistAsync(blob) },
                    save = loaded,
                    mode = mode,
                    diff = diff,
                    verses = verses,
                    siteVerses = siteVerses,
                    tfClaims = tfClaims,
                    rng = { Random.nextDouble() },
                    nowMs = { SystemClock.elapsedRealtime() },
                    title = title,
                ),
            )
            if (gen != sessionGeneration) return@launch
            session = run
            this@PlayViewModel.title = title
            ready = true
            publish()
        }
    }

    fun selectChoice(choice: String) {
        session?.selectChoice(choice)
        selected = choice
    }

    fun submitChoice(choice: String) {
        val s = session ?: return
        if (s.locked) return
        s.submitChoice(choice)
        publish()
        if (s.phase == PlayPhase.Overdrive) armOverdriveTimeout(s) else scheduleAdvance(s)
    }

    fun submitAssemble() {
        val s = session ?: return
        if (s.locked) return
        s.submitAssemble()
        publish()
        if (s.phase == PlayPhase.Overdrive) armOverdriveTimeout(s) else scheduleAdvance(s)
    }

    fun pickCloze(word: String) {
        val s = session ?: return
        if (s.locked) return
        s.pickCloze(word)
        publish()
        if (s.locked) {
            if (s.phase == PlayPhase.Overdrive) armOverdriveTimeout(s) else scheduleAdvance(s)
        }
    }

    fun unfillCloze(slot: Int) {
        session?.unfillCloze(slot)
        publish()
    }

    fun submitTrueFalse(pickedTrue: Boolean) {
        val s = session ?: return
        if (s.locked) return
        s.submitTrueFalse(pickedTrue)
        publish()
        if (s.phase == PlayPhase.Overdrive) armOverdriveTimeout(s) else scheduleAdvance(s)
    }

    fun fadeDone() {
        session?.fadeDone()
        publish()
    }

    fun bumpAssemble() {
        session?.bumpAssemble()
        boardTick = session?.boardTick ?: boardTick
    }

    fun pause() {
        session?.pause()
        publish()
    }

    fun resume() {
        session?.resume()
        publish()
    }

    fun requestAbandon() {
        session?.requestAbandon()
        publish()
    }

    fun stay() {
        session?.stay()
        publish()
    }

    fun resolveOverdrive(choice: OverdriveChoice) {
        overdriveJob?.cancel()
        overdriveJob = null
        session?.resolveOverdrive(choice)
        publish()
    }

    fun abandon(saves: SaveCoordinator) {
        sessionGeneration++
        cancelSessionJobs()
        val s = session
        if (s != null && s.phase != PlayPhase.Results) s.abandon()
        if (s != null) saves.persistAsync(s.save)
        publish()
        session = null
        ready = false
    }

    private fun scheduleAdvance(s: PlaySession) {
        if (!s.locked || s.phase == PlayPhase.Overdrive || s.phase == PlayPhase.Results) return
        val token = s.questionToken
        val gen = sessionGeneration
        cancelAdvance()
        val hold = if (s.lastCorrect == true) PlayClock.HOLD_CORRECT_MS else PlayClock.HOLD_WRONG_MS
        advanceJob = viewModelScope.launch {
            delay(hold)
            if (gen != sessionGeneration || session !== s || s.questionToken != token) return@launch
            if (s.phase == PlayPhase.Overdrive || s.phase == PlayPhase.Results) return@launch
            s.advance()
            publish()
        }
    }

    private fun armOverdriveTimeout(s: PlaySession) {
        overdriveJob?.cancel()
        val gen = sessionGeneration
        overdriveJob = viewModelScope.launch {
            delay(PlayClock.OVERDRIVE_TIMEOUT_MS)
            if (gen != sessionGeneration || session !== s || s.phase != PlayPhase.Overdrive) return@launch
            s.resolveOverdrive(OverdriveChoice.Bank)
            publish()
        }
    }

    private fun publish() {
        val s = session ?: return
        phase = s.phase
        index = s.index
        total = s.questions.size
        correct = s.correct
        attempts = s.attempts
        score = s.score
        streak = s.streak
        lives = s.lives
        maxLives = s.maxLives
        locked = s.locked
        lastCorrect = s.lastCorrect
        selected = s.selected
        choices = s.choices
        assemble = s.assemble
        cloze = s.cloze
        duel = s.duel
        fadePhase = s.fadePhase
        claim = s.claim
        mechanic = s.current?.mechanic
        verse = s.current?.verse
        durationMs = s.durationMs
        remainingMs = s.remainingMs(SystemClock.elapsedRealtime())
        boardTick = s.boardTick
        questionToken = s.questionToken
        confirmAbandon = s.confirmAbandon
        overdriveRide = s.overdriveRide
        tfPickedTrue = s.tfPickedTrue
        result = s.result
        title = s.title
    }

    private fun cancelAdvance() {
        advanceJob?.cancel()
        advanceJob = null
    }

    private fun cancelSessionJobs() {
        beginJob?.cancel()
        beginJob = null
        cancelAdvance()
        overdriveJob?.cancel()
        overdriveJob = null
    }

    override fun onCleared() {
        sessionGeneration++
        cancelSessionJobs()
        super.onCleared()
    }
}
