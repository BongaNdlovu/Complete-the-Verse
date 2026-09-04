package app.completetheverse.ui.practice

import android.os.SystemClock
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.assemble.AssembleBoard
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.practice.Practice
import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.srs.Srs
import app.completetheverse.core.srs.SrsCard
import app.completetheverse.save.DataStoreSaveRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

private enum class PracticePhase { Brief, Play, Results }

@Composable
fun PracticeRoute(
    verses: List<Verse>,
    saveRepository: DataStoreSaveRepository,
    onExit: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var phase by remember { mutableStateOf(PracticePhase.Brief) }
    var save by remember { mutableStateOf(Save.DEFAULT) }
    var due by remember { mutableIntStateOf(0) }
    var queue by remember { mutableStateOf<List<Verse>>(emptyList()) }
    var index by remember { mutableIntStateOf(0) }
    var correct by remember { mutableIntStateOf(0) }
    var attempts by remember { mutableIntStateOf(0) }
    var cards by remember { mutableStateOf<List<SrsCard>>(emptyList()) }
    var runStart by remember { mutableLongStateOf(0L) }
    var elapsedMs by remember { mutableLongStateOf(0L) }
    var questionStart by remember { mutableLongStateOf(0L) }
    var now by remember { mutableLongStateOf(SystemClock.elapsedRealtime()) }
    var locked by remember { mutableStateOf(false) }
    var lastCorrect by remember { mutableStateOf<Boolean?>(null) }
    var selected by remember { mutableStateOf<String?>(null) }
    var choices by remember { mutableStateOf<List<String>>(emptyList()) }
    var assemble by remember { mutableStateOf<AssembleBoard?>(null) }
    var assembleTick by remember { mutableIntStateOf(0) }
    var questionToken by remember { mutableIntStateOf(0) }

    fun rng(): Double = Random.nextDouble()

    fun loadDue(blob: SaveBlob): Int {
        val map = Srs.cardsFromSave(blob["srs"])
        val today = Srs.dayNumber()
        return Srs.dueCount(verses, { v -> map[v.id] }, today)
    }

    LaunchedEffect(Unit) {
        val loaded = saveRepository.load()
        save = loaded
        due = loadDue(loaded)
    }

    fun armQuestion(i: Int, list: List<Verse>) {
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

    fun begin() {
        scope.launch {
            val loaded = saveRepository.load()
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

    fun finish() {
        elapsedMs = SystemClock.elapsedRealtime() - runStart
        due = loadDue(save)
        phase = PracticePhase.Results
    }

    fun submit(ok: Boolean, timedOut: Boolean, fraction: Double, mode: String) {
        if (locked) return
        locked = true
        lastCorrect = ok
        val verse = queue.getOrNull(index) ?: return
        val today = Srs.dayNumber()
        val recorded = Practice.applyAnswer(
            save = save,
            verse = verse,
            correct = ok,
            timedOut = timedOut,
            fraction = fraction,
            today = today,
            mode = mode,
        )
        save = recorded.save
        cards = cards + recorded.card
        attempts += 1
        if (ok) correct += 1
        scope.launch { saveRepository.persist(recorded.save) }
        scope.launch {
            delay(800)
            val next = index + 1
            if (next >= queue.size) {
                finish()
            } else {
                index = next
                armQuestion(next, queue)
            }
        }
    }

    fun fractionNow(): Double {
        val used = (SystemClock.elapsedRealtime() - questionStart).toDouble()
        return (used / Practice.WALL_PICK_MS).coerceIn(0.0, 1.0)
    }

    LaunchedEffect(questionToken, phase) {
        if (phase != PracticePhase.Play) return@LaunchedEffect
        val token = questionToken
        val start = questionStart
        while (phase == PracticePhase.Play && questionToken == token) {
            now = SystemClock.elapsedRealtime()
            if (locked) break
            if (now - start >= Practice.WALL_PICK_MS) {
                submit(ok = false, timedOut = true, fraction = 1.0, mode = if (assemble != null) "assembly" else "choice")
                break
            }
            delay(50)
        }
    }

    when (phase) {
        PracticePhase.Brief -> PracticeBriefScreen(
            dueCount = due,
            onBegin = { begin() },
            onBack = onExit,
        )
        PracticePhase.Play -> {
            val verse = queue.getOrNull(index)
            if (verse == null) {
                PracticeBriefScreen(dueCount = due, onBegin = { begin() }, onBack = onExit)
            } else {
                val remaining = if (locked) {
                    (Practice.WALL_PICK_MS - (now - questionStart)).coerceAtLeast(0L)
                } else {
                    (Practice.WALL_PICK_MS - (SystemClock.elapsedRealtime() - questionStart)).coerceAtLeast(0L)
                }
                PracticePlayScreen(
                    verse = verse,
                    index = index,
                    total = queue.size,
                    remainingMs = remaining,
                    assemble = assemble,
                    assembleTick = assembleTick,
                    choices = choices,
                    locked = locked,
                    lastCorrect = lastCorrect,
                    selected = selected,
                    onChoice = { choice ->
                        if (locked) return@PracticePlayScreen
                        selected = choice
                        val ok = Practice.choiceMatches(choice, verse.a)
                        submit(ok, timedOut = false, fraction = fractionNow(), mode = "choice")
                    },
                    onAssembleChange = { assembleTick++ },
                    onLockAssemble = {
                        val board = assemble ?: return@PracticePlayScreen
                        if (locked || !Assemble.isFilled(board)) return@PracticePlayScreen
                        val ok = Practice.assembleMatches(board, verse.a)
                        submit(ok, timedOut = false, fraction = fractionNow(), mode = "assembly")
                    },
                    onHall = onExit,
                )
            }
        }
        PracticePhase.Results -> PracticeResultsScreen(
            results = PracticeResults(
                correct = correct,
                attempts = attempts,
                elapsedMs = elapsedMs,
                cards = cards,
                dueCount = due,
            ),
            onHall = onExit,
        )
    }
}
