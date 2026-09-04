package app.completetheverse.ui.practice

import android.os.SystemClock
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.assemble.AssembleBoard
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.practice.Practice
import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.srs.Srs
import app.completetheverse.core.srs.SrsCard
import app.completetheverse.save.SaveCoordinator
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

enum class PracticePhase { Brief, Play, Results }

class PracticeViewModel : ViewModel() {
    var phase by mutableStateOf(PracticePhase.Brief)
        private set
    var save by mutableStateOf(Save.DEFAULT)
        private set
    var due by mutableIntStateOf(0)
        private set
    var queue by mutableStateOf<List<Verse>>(emptyList())
        private set
    var index by mutableIntStateOf(0)
        private set
    var correct by mutableIntStateOf(0)
        private set
    var attempts by mutableIntStateOf(0)
        private set
    var cards by mutableStateOf<List<SrsCard>>(emptyList())
        private set
    var runStart by mutableLongStateOf(0L)
        private set
    var elapsedMs by mutableLongStateOf(0L)
        private set
    var questionStart by mutableLongStateOf(0L)
        private set
    var now by mutableLongStateOf(SystemClock.elapsedRealtime())
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
    var assembleTick by mutableIntStateOf(0)
        private set
    var questionToken by mutableIntStateOf(0)
        private set

    private var advanceJob: Job? = null

    private fun rng(): Double = Random.nextDouble()

    fun loadDue(verses: List<Verse>, blob: SaveBlob): Int {
        val map = Srs.cardsFromSave(blob["srs"])
        return Srs.dueCount(verses, { v -> map[v.id] }, Srs.dayNumber())
    }

    fun hydrate(verses: List<Verse>, blob: SaveBlob) {
        if (phase != PracticePhase.Brief) return
        save = blob
        due = loadDue(verses, blob)
    }

    fun tickClock() {
        now = SystemClock.elapsedRealtime()
    }

    private fun armQuestion(i: Int, list: List<Verse>) {
        val verse = list[i]
        val useAssemble = Practice.usesAssemble(i, verse)
        assemble = if (useAssemble) Assemble.build(verse.a, verse.d, rng = { rng() }) else null
        choices = if (useAssemble) emptyList() else Practice.mcqChoices(verse, rng = { rng() })
        locked = false
        lastCorrect = null
        selected = null
        assembleTick = 0
        questionStart = SystemClock.elapsedRealtime()
        now = questionStart
        questionToken++
    }

    fun begin(verses: List<Verse>, saves: SaveCoordinator) {
        if (verses.isEmpty()) return
        cancelAdvance()
        viewModelScope.launch {
            val loaded = saves.persistMerged()
            save = loaded
            val today = Srs.dayNumber()
            val map = Srs.cardsFromSave(loaded["srs"])
            val drill = Practice.buildDrill(verses, { v -> map[v.id] }, today, rng = { rng() })
            if (drill.isEmpty()) return@launch
            queue = drill
            index = 0
            correct = 0
            attempts = 0
            cards = emptyList()
            runStart = SystemClock.elapsedRealtime()
            elapsedMs = 0L
            armQuestion(0, drill)
            phase = PracticePhase.Play
        }
    }

    fun bumpAssemble() {
        assembleTick++
    }

    fun selectChoice(choice: String) {
        selected = choice
    }

    fun submit(
        ok: Boolean,
        timedOut: Boolean,
        fraction: Double?,
        mode: String,
        saves: SaveCoordinator,
        verses: List<Verse>,
    ) {
        if (locked) return
        locked = true
        lastCorrect = ok
        val verse = queue.getOrNull(index) ?: return
        val recorded = Practice.applyAnswer(
            save = save,
            verse = verse,
            correct = ok,
            timedOut = timedOut,
            fraction = fraction,
            today = Srs.dayNumber(),
            mode = mode,
        )
        save = recorded.save
        cards = cards + recorded.card
        attempts += 1
        if (ok) correct += 1
        saves.persistAsync(recorded.save)
        val token = questionToken
        cancelAdvance()
        advanceJob = viewModelScope.launch {
            delay(800)
            if (phase != PracticePhase.Play || questionToken != token || queue.isEmpty()) return@launch
            val next = index + 1
            if (next >= queue.size) {
                elapsedMs = SystemClock.elapsedRealtime() - runStart
                due = loadDue(verses, save)
                phase = PracticePhase.Results
            } else {
                index = next
                armQuestion(next, queue)
            }
        }
    }

    fun remainingMs(): Long {
        val used = if (locked) now - questionStart else SystemClock.elapsedRealtime() - questionStart
        return (Practice.WALL_PICK_MS - used).coerceAtLeast(0L)
    }

    fun fractionNow(): Double {
        val used = (SystemClock.elapsedRealtime() - questionStart).toDouble()
        return (used / Practice.WALL_PICK_MS).coerceIn(0.0, 1.0)
    }

    fun abandon(verses: List<Verse>, saves: SaveCoordinator) {
        cancelAdvance()
        if (phase != PracticePhase.Brief) saves.persistAsync(save)
        phase = PracticePhase.Brief
        queue = emptyList()
        index = 0
        locked = false
        lastCorrect = null
        assemble = null
        due = loadDue(verses, saves.snapshot())
    }

    private fun cancelAdvance() {
        advanceJob?.cancel()
        advanceJob = null
    }
}
