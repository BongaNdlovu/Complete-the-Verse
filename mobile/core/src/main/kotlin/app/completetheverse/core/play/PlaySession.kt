package app.completetheverse.core.play

import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.assemble.AssembleBoard
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.practice.Practice
import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.srs.Srs
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.put
import kotlin.random.Random

fun interface PlayPersister {
    fun persist(save: SaveBlob)
}

data class PlayConfig(
    val questions: List<PlayQuestion>,
    val clockPolicy: ClockPolicy = ClockPolicy.Wall,
    val lives: Int = Diffs.disciple.lives,
    val persist: PlayPersister? = null,
    val save: SaveBlob = Save.DEFAULT,
    val mode: String = "play",
    val diff: Diff = Diffs.disciple,
    val verses: List<Verse> = emptyList(),
    val siteVerses: List<Verse> = emptyList(),
    val tfClaims: List<TfClaim> = emptyList(),
    val rng: (() -> Double)? = null,
    val nowMs: () -> Long = { System.currentTimeMillis() },
    val title: String = "The Record",
    val todayKey: String = Modes.todayKey(),
    val teamStart: String = "white",
    val moreQuestions: ((Int) -> PlayQuestion?)? = null,
    val today: Int = Srs.dayNumber(),
)

data class PlayResult(
    val correct: Int,
    val attempts: Int,
    val score: Int,
    val total: Int,
    val elapsedMs: Long,
    val bestStreak: Int,
    val reason: String,
    val pendingSeals: List<String> = emptyList(),
    val save: SaveBlob,
    val dailyRecorded: Boolean = false,
    val teamWinner: String? = null,
    val teamWhiteKept: Int = 0,
    val teamWhiteMs: Long = 0,
    val teamBlueKept: Int = 0,
    val teamBlueMs: Long = 0,
)

class PlaySession private constructor(private val config: PlayConfig) {
    var phase: PlayPhase = PlayPhase.Playing
        private set
    var index: Int = 0
        private set
    var correct: Int = 0
        private set
    var attempts: Int = 0
        private set
    var score: Int = 0
        private set
    var streak: Int = 0
        private set
    var bestStreak: Int = 0
        private set
    var lives: Int = config.lives
        private set
    var maxLives: Int = config.lives
        private set
    var save: SaveBlob = config.save
        private set
    var locked: Boolean = false
        private set
    var running: Boolean = true
        private set
    var lastCorrect: Boolean? = null
        private set
    var selected: String? = null
        private set
    var choices: List<String> = emptyList()
        private set
    var assemble: AssembleBoard? = null
        private set
    var cloze: ClozeBoard? = null
        private set
    var duel: DuelBoard? = null
        private set
    var fadePhase: FadePhase? = null
        private set
    var claim: TfClaim? = null
        private set
    var tfPickedTrue: Boolean? = null
        private set
    var overdriveRide: Boolean = false
        private set
    var overdriveOffered: Boolean = false
        private set
    var pendingOverdrive: Boolean = false
        private set
    var boardTick: Int = 0
        private set
    var questionToken: Int = 0
        private set
    var durationMs: Long = 0L
        private set
    var result: PlayResult? = null
        private set
    var confirmAbandon: Boolean = false
        private set
    var reason: String = ""
        private set
    var title: String = config.title
        private set
    var teamSide: String = if (config.teamStart == "blue") "blue" else "white"
        private set
    var teamHanded: Boolean = false
        private set
    var teamWhiteKept: Int = 0
        private set
    var teamWhiteMs: Long = 0L
        private set
    var teamBlueKept: Int = 0
        private set
    var teamBlueMs: Long = 0L
        private set
    var dailyRecorded: Boolean = false
        private set

    private val questionList: MutableList<PlayQuestion> = config.questions.toMutableList()
    val questions: List<PlayQuestion> get() = questionList
    val mode: String get() = config.mode
    val diff: Diff get() = config.diff
    val clockPolicy: ClockPolicy get() = config.clockPolicy
    val useLives: Boolean get() = maxLives > 0
    private var handoffPending: Boolean = false

    private var deadlineMs: Long = 0L
    private var pauseStampMs: Long = 0L
    private var runStartMs: Long = 0L
    private var elapsedMs: Long = 0L
    private val rng: () -> Double = config.rng ?: { Random.nextDouble() }
    private val nowMs: () -> Long = config.nowMs
    private val usedTf = mutableListOf<Int>()

    val current: PlayQuestion? get() = questions.getOrNull(index)

    fun remainingMs(atMs: Long = nowMs()): Long {
        if (durationMs <= 0L) return 0L
        val frozen = !running || locked || phase == PlayPhase.Paused ||
            phase == PlayPhase.Overdrive || phase == PlayPhase.ConfirmAbandon ||
            phase == PlayPhase.Handoff
        val reference = if (frozen && pauseStampMs != 0L) pauseStampMs else atMs
        return (deadlineMs - reference).coerceAtLeast(0L)
    }

    fun fractionNow(atMs: Long = nowMs()): Double {
        if (durationMs <= 0L) return 1.0
        val left = remainingMs(atMs)
        return (1.0 - left.toDouble() / durationMs.toDouble()).coerceIn(0.0, 1.0)
    }

    fun elapsedMs(): Long = if (phase == PlayPhase.Results) elapsedMs else nowMs() - runStartMs

    fun multiplier(): Int = PlayClock.multiplier(streak)

    fun overdriveBankAmount(): Int = PlayClock.overdriveBank(streak, diff.score)

    fun pause() {
        if (phase != PlayPhase.Playing || !running || confirmAbandon) return
        pauseStampMs = nowMs()
        phase = PlayPhase.Paused
    }

    fun resume() {
        if (phase != PlayPhase.Paused) return
        val d = (nowMs() - pauseStampMs).coerceAtLeast(0L)
        deadlineMs += d
        pauseStampMs = 0L
        confirmAbandon = false
        phase = PlayPhase.Playing
    }

    fun requestAbandon() {
        if (phase == PlayPhase.Results) return
        if (phase == PlayPhase.Handoff) {
            handoffPending = true
            confirmAbandon = true
            phase = PlayPhase.ConfirmAbandon
            return
        }
        if (phase == PlayPhase.Playing && running) pause()
        confirmAbandon = true
        if (phase == PlayPhase.Paused) return
        phase = PlayPhase.ConfirmAbandon
    }

    fun stay() {
        confirmAbandon = false
        if (handoffPending) {
            handoffPending = false
            phase = PlayPhase.Handoff
            return
        }
        if (phase == PlayPhase.ConfirmAbandon) {
            phase = PlayPhase.Playing
        }
    }

    fun abandon() {
        confirmAbandon = false
        if (attempts == 0) {
            running = false
            locked = true
            finish("abandon", persistRun = false)
            return
        }
        finish("abandon")
    }

    private fun canAnswer(timedOut: Boolean = false): Boolean {
        if (locked) return false
        if (phase != PlayPhase.Playing) return false
        if (!running && !timedOut) return false
        return true
    }

    fun selectChoice(choice: String) {
        if (!canAnswer()) return
        selected = choice
    }

    fun submitChoice(choice: String, timedOut: Boolean = false) {
        val q = current ?: return
        if (!canAnswer(timedOut)) return
        selected = choice
        val ok = when (q.mechanic) {
            Mechanic.Mcq -> q.verse != null && PlayMechanics.choiceMatches(choice, q.verse.a)
            Mechanic.PassageRef -> q.verse != null && PlayMechanics.passageRefCorrect(choice, q.verse)
            Mechanic.Duel -> duel != null && PlayMechanics.duelCorrect(choice, duel!!)
            Mechanic.Fade -> q.verse != null && fadePhase == FadePhase.Reconstruct &&
                PlayMechanics.fadeCorrect(choice, q.verse)
            else -> false
        }
        resolve(ok, timedOut)
    }

    fun submitAssemble(timedOut: Boolean = false) {
        val q = current ?: return
        if (!canAnswer(timedOut)) return
        val board = assemble
        val ok = !timedOut && board != null && q.verse != null &&
            Assemble.isFilled(board) && PlayMechanics.assembleMatches(board, q.verse.a)
        resolve(ok, timedOut)
    }

    fun pickCloze(word: String): Boolean {
        val board = cloze ?: return false
        if (!canAnswer()) return false
        if (!board.pick(word)) return false
        boardTick++
        if (board.isComplete) {
            resolve(PlayMechanics.clozeCorrect(board), timedOut = false)
        }
        return true
    }

    fun unfillCloze(slot: Int): Boolean {
        val board = cloze ?: return false
        if (!canAnswer()) return false
        if (!board.unfill(slot)) return false
        boardTick++
        return true
    }

    fun submitTrueFalse(pickedTrue: Boolean, timedOut: Boolean = false) {
        val q = current ?: return
        if (q.mechanic != Mechanic.TrueFalse) return
        if (!canAnswer(timedOut)) return
        val c = q.claim ?: claim
        tfPickedTrue = pickedTrue
        val ok = c != null && PlayMechanics.trueFalseCorrect(c, pickedTrue, timedOut)
        resolve(ok, timedOut, recordVerse = false)
    }

    fun fadeDone() {
        val q = current ?: return
        if (q.mechanic != Mechanic.Fade || fadePhase != FadePhase.Memorize) return
        if (!canAnswer()) return
        beginFadeReconstruct(q)
    }

    fun bumpAssemble() {
        boardTick++
    }

    fun onTimeout(atMs: Long = nowMs()): Boolean {
        if (locked || !running) return false
        if (phase != PlayPhase.Playing) return false
        if (remainingMs(atMs) > 0L) return false
        val q = current ?: return false
        if (q.mechanic == Mechanic.Fade && fadePhase == FadePhase.Memorize) {
            beginFadeReconstruct(q)
            return true
        }
        when (q.mechanic) {
            Mechanic.Assemble -> submitAssemble(timedOut = true)
            Mechanic.Cloze -> resolve(ok = false, timedOut = true)
            Mechanic.TrueFalse -> submitTrueFalse(pickedTrue = claim?.v != true, timedOut = true)
            else -> submitChoice(selected ?: "", timedOut = true)
        }
        return true
    }

    fun resolveOverdrive(choice: OverdriveChoice) {
        if (phase != PlayPhase.Overdrive && !pendingOverdrive) return
        pendingOverdrive = false
        if (choice == OverdriveChoice.Bank) {
            score += overdriveBankAmount()
            streak = 0
            overdriveRide = false
        } else {
            overdriveRide = true
        }
        advance()
    }

    fun offerOverdrive() {
        if (!pendingOverdrive || phase == PlayPhase.Results) return
        pendingOverdrive = false
        phase = PlayPhase.Overdrive
    }

    fun advance() {
        if (phase == PlayPhase.Results) return
        if (phase == PlayPhase.Paused || phase == PlayPhase.ConfirmAbandon || phase == PlayPhase.Handoff) return
        if (clockPolicy.sharedRemaining && remainingMs() <= 0L) {
            finish("death")
            return
        }
        if (useLives && lives <= 0) {
            finish("death")
            return
        }
        if (mode == "team" && !teamHanded && index + 1 >= Modes.TEAM_EACH) {
            teamHanded = true
            teamSide = if (teamSide == "blue") "white" else "blue"
            phase = PlayPhase.Handoff
            return
        }
        val next = index + 1
        if (ensureQuestion(next) == null) {
            finish("complete")
            return
        }
        index = next
        armQuestion()
    }

    fun continueHandoff() {
        if (phase != PlayPhase.Handoff) return
        confirmAbandon = false
        handoffPending = false
        val next = index + 1
        if (ensureQuestion(next) == null) {
            finish("complete")
            return
        }
        index = next
        armQuestion()
    }

    private fun ensureQuestion(at: Int): PlayQuestion? {
        while (at >= questionList.size) {
            val extra = config.moreQuestions?.invoke(questionList.size) ?: return null
            questionList.add(extra)
        }
        return questionList.getOrNull(at)
    }

    fun shouldOfferOverdrive(): Boolean {
        if (overdriveOffered) return false
        if (config.mode == "beat" || config.mode == "team" || config.mode == "blitz") return false
        return streak == PlayClock.MOMENTUM_STEPS.last()
    }

    private fun beginFadeReconstruct(q: PlayQuestion) {
        val verse = q.verse ?: return
        fadePhase = FadePhase.Reconstruct
        assemble = null
        choices = PlayMechanics.fadePickChoices(verse, config.verses, rng)
        selected = null
        locked = false
        lastCorrect = null
        running = true
        durationMs = clockDuration(
            mechanic = Mechanic.Fade,
            typed = false,
            fadePhase = FadePhase.Reconstruct,
            clockBaseMs = q.clockBaseMs,
        )
        val start = nowMs()
        deadlineMs = start + durationMs
        pauseStampMs = 0L
        questionToken++
        boardTick++
    }

    private fun resolve(ok: Boolean, timedOut: Boolean, recordVerse: Boolean = true) {
        if (locked) return
        locked = true
        running = false
        pauseStampMs = nowMs()
        lastCorrect = ok
        val q = current
        val wasRiding = overdriveRide && PlayClock.inOverdrive(streak)
        attempts++
        if (ok) {
            correct++
            streak++
            bestStreak = maxOf(bestStreak, streak)
            val left = remainingMs()
            val denom = durationMs.coerceAtLeast(1L)
            val timeBonus = kotlin.math.round(left.toDouble() / denom * 140.0).toInt()
            val weight = if (q?.mechanic == Mechanic.TrueFalse) 1.24 else 1.0
            val riding = overdriveRide && PlayClock.inOverdrive(streak)
            val gained = kotlin.math.round(
                (150 + timeBonus) * multiplier() * diff.score * weight * (if (riding) 2.0 else 1.0),
            ).toInt()
            score += gained
        } else {
            overdriveRide = false
            streak = 0
            val lost = if (wasRiding) 2 else 1
            if (useLives) lives = (lives - lost).coerceAtLeast(0)
        }
        if (mode == "team") tallyTeam(ok)
        if (clockPolicy.sharedRemaining) {
            val nextLeft = PlayClock.blitzAdjustMs(remainingMs(), ok)
            deadlineMs = nowMs() + nextLeft
        }
        val skipMastery = mode == "team" || mode == "beat"
        if (recordVerse && !skipMastery && q?.verse != null && q.mechanic != Mechanic.TrueFalse) {
            val gradeMode = if (q.typed) "assembly" else "choice"
            val applied = Practice.applyAnswer(
                save = save,
                verse = q.verse,
                correct = ok,
                timedOut = timedOut,
                fraction = fractionNow(),
                today = config.today,
                mode = gradeMode,
            )
            save = applied.save
            config.persist?.persist(save)
        }
        if (ok && shouldOfferOverdrive()) {
            overdriveOffered = true
            pendingOverdrive = true
            return
        }
        phase = PlayPhase.Playing
    }

    private fun armQuestion() {
        val q = current ?: return
        locked = false
        lastCorrect = null
        selected = null
        tfPickedTrue = null
        assemble = null
        cloze = null
        duel = null
        fadePhase = null
        claim = q.claim
        choices = emptyList()
        confirmAbandon = false
        if (q.oneLife) {
            maxLives = 1
            lives = 1
        }
        q.label?.let { title = it }
        val verse = q.verse
        when (q.mechanic) {
            Mechanic.Mcq -> {
                if (verse != null) choices = PlayMechanics.mcqChoices(verse, rng)
            }
            Mechanic.Assemble -> {
                if (verse != null) assemble = Assemble.build(verse.a, verse.d, rng)
            }
            Mechanic.PassageRef -> {
                if (verse != null) {
                    choices = PlayMechanics.passageReferenceChoices(
                        verse,
                        config.siteVerses,
                        config.verses,
                        rng,
                    )
                }
            }
            Mechanic.Cloze -> {
                if (verse != null) cloze = PlayMechanics.buildCloze(verse, rng)
            }
            Mechanic.Duel -> {
                if (verse != null) duel = PlayMechanics.buildDuel(verse, rng)
            }
            Mechanic.Fade -> {
                fadePhase = FadePhase.Memorize
            }
            Mechanic.TrueFalse -> {
                if (claim == null && config.tfClaims.isNotEmpty()) {
                    val books = config.siteVerses.map { it.b }.toSet()
                    val picked = PlayMechanics.pickClaim(
                        claims = config.tfClaims,
                        used = usedTf,
                        siteBooks = books,
                        rng = rng,
                    )
                    claim = picked?.first
                    if (picked != null) {
                        PlayMechanics.rememberUsedClaim(usedTf, picked.second, config.tfClaims)
                    }
                }
            }
        }
        val start = nowMs()
        pauseStampMs = 0L
        running = true
        if (clockPolicy.sharedRemaining) {
            if (index == 0 && questionToken == 0) {
                durationMs = PlayClock.BLITZ_START_MS
                deadlineMs = start + durationMs
            } else {
                durationMs = remainingMs(start).coerceAtLeast(900L)
            }
        } else {
            durationMs = clockDuration(
                mechanic = q.mechanic,
                typed = q.typed,
                fadePhase = fadePhase,
                clockBaseMs = q.clockBaseMs,
            )
            deadlineMs = start + durationMs
        }
        phase = PlayPhase.Playing
        questionToken++
        boardTick++
    }

    private fun finish(why: String, persistRun: Boolean = true) {
        running = false
        locked = true
        reason = why
        elapsedMs = nowMs() - runStartMs
        val acc = if (attempts == 0) 0.0 else correct.toDouble() / attempts
        val streakBonus = kotlin.math.round(bestStreak * 120.0 * diff.score).toInt()
        val accBonus = kotlin.math.round(acc * 1200.0 * diff.score).toInt()
        val raw = score + streakBonus + accBonus
        val total = if (why == "abandon") kotlin.math.round(raw * 0.85).toInt() else raw
        val skipRun = mode == "team"
        if (persistRun && !skipRun) {
            save = persistRunRecords(save, total, why)
            config.persist?.persist(save)
        }
        result = PlayResult(
            correct = correct,
            attempts = attempts,
            score = score,
            total = total,
            elapsedMs = elapsedMs,
            bestStreak = bestStreak,
            reason = why,
            pendingSeals = emptyList(),
            save = save,
            dailyRecorded = dailyRecorded,
            teamWinner = if (mode == "team") Modes.teamWinner(teamWhiteKept, teamWhiteMs, teamBlueKept, teamBlueMs) else null,
            teamWhiteKept = teamWhiteKept,
            teamWhiteMs = teamWhiteMs,
            teamBlueKept = teamBlueKept,
            teamBlueMs = teamBlueMs,
        )
        phase = PlayPhase.Results
    }

    private fun persistRunRecords(blob: SaveBlob, total: Int, why: String): SaveBlob {
        val out = blob.toMutableMap()
        out["runs"] = JsonPrimitive(jsonInt(blob["runs"]) + 1)
        val life = ((blob["life"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        life["bestStreak"] = JsonPrimitive(maxOf(jsonInt(life["bestStreak"]), bestStreak))
        if (mode == "endless") {
            life["endlessBest"] = JsonPrimitive(maxOf(jsonInt(life["endlessBest"]), index + 1))
        }
        if (mode == "blitz") {
            life["blitzBest"] = JsonPrimitive(maxOf(jsonInt(life["blitzBest"]), correct))
        }
        val best = ((blob["best"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        val recordScore = if (mode == "blitz") correct else total
        if (recordScore > jsonInt(best[mode])) best[mode] = JsonPrimitive(recordScore)
        out["best"] = JsonObject(best)
        val today = config.todayKey.ifEmpty { Modes.todayKey() }
        if (mode == "daily" && why == "complete") {
            val daily = blob["daily"] as? JsonObject
            val prior = (daily?.get("date") as? JsonPrimitive)?.content
            if (prior != today) {
                out["daily"] = buildJsonObject {
                    put("date", today)
                    put("score", total)
                }
                life["dailyDone"] = JsonPrimitive(jsonInt(life["dailyDone"]) + 1)
                dailyRecorded = true
            }
        }
        out["life"] = JsonObject(life)
        return JsonObject(out)
    }

    private fun tallyTeam(ok: Boolean) {
        val spent = (durationMs - remainingMs()).coerceAtLeast(0L).coerceAtMost(durationMs + 500L)
        if (teamSide == "blue") {
            if (ok) teamBlueKept++
            teamBlueMs += spent
        } else {
            if (ok) teamWhiteKept++
            teamWhiteMs += spent
        }
    }

    private fun clockDuration(
        mechanic: Mechanic,
        typed: Boolean,
        fadePhase: FadePhase?,
        clockBaseMs: Long?,
    ): Long = clockPolicy.durationMs(
        mechanic = mechanic,
        typed = typed,
        streak = streak,
        fadePhase = fadePhase,
        clockBaseMs = clockBaseMs,
        diffTime = if (clockPolicy.wall) 1.0 else config.diff.time,
    )

    private fun jsonInt(el: kotlinx.serialization.json.JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }

    companion object {
        fun start(
            questions: List<PlayQuestion>,
            clockPolicy: ClockPolicy = ClockPolicy.Wall,
            lives: Int = Diffs.disciple.lives,
            persist: PlayPersister? = null,
        ): PlaySession = start(
            PlayConfig(
                questions = questions,
                clockPolicy = clockPolicy,
                lives = lives,
                persist = persist,
            ),
        )

        fun start(config: PlayConfig): PlaySession {
            require(config.questions.isNotEmpty()) { "PlaySession needs at least one question" }
            val session = PlaySession(config)
            session.runStartMs = config.nowMs()
            session.armQuestion()
            return session
        }
    }
}
