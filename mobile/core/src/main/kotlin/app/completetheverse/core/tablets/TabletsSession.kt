package app.completetheverse.core.tablets

import app.completetheverse.core.play.Diff
import app.completetheverse.core.play.Diffs
import app.completetheverse.core.play.PlayPersister
import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import kotlin.random.Random

enum class TabletsPhase { Playing, Paused, Results, TutorialDone }

data class TabletsConfig(
    val bank: TabletsBank,
    val chapterId: String,
    val save: SaveBlob = Save.DEFAULT,
    val tutorial: Boolean? = null,
    val untimed: Boolean = false,
    val persist: PlayPersister? = null,
    val rng: (() -> Double)? = null,
    val nowMs: () -> Long = { System.currentTimeMillis() },
    val diff: Diff = Diffs.watchman,
)

data class TabletsResult(
    val held: Boolean,
    val shattered: Boolean,
    val timeout: Boolean,
    val tutorial: Boolean,
    val abandoned: Boolean,
    val pct: Int,
    val favor: Int,
    val correct: Int,
    val attempts: Int,
    val kick: String,
    val next: TabletChapter?,
    val chapter: TabletChapter,
    val save: SaveBlob,
)

class TabletsSession private constructor(private val config: TabletsConfig) {
    var phase: TabletsPhase = TabletsPhase.Playing
        private set
    var tabletIdx: Int = 0
        private set
    var gapIdx: Int = 0
        private set
    var tabletMiss: Int = 0
        private set
    var tabletLives: Int = Tablets.LIVES
        private set
    var tabletClock: Double = 0.0
        private set
    var tabletClockMax: Double = 0.0
        private set
    var tabletTimeout: Boolean = false
        private set
    var favor: Int = 0
        private set
    var streak: Int = 0
        private set
    var bestStreak: Int = 0
        private set
    var correct: Int = 0
        private set
    var attempts: Int = 0
        private set
    var resolving: Boolean = false
        private set
    var lastCorrect: Boolean? = null
        private set
    var selected: String? = null
        private set
    var choices: List<String> = emptyList()
        private set
    var grey: List<String> = emptyList()
        private set
    var hinted: Boolean = false
        private set
    var illum: Int = 1
        private set
    var winnow: Int = 2
        private set
    var ended: Boolean = false
        private set
    var save: SaveBlob = config.save
        private set
    var result: TabletsResult? = null
        private set
    var confirmAbandon: Boolean = false
        private set

    val chapter: TabletChapter = Tablets.chapter(config.bank, config.chapterId)
    val tutorial: Boolean = config.tutorial ?: (chapter.tutorial || chapter.id == "prayer")
    val untimed: Boolean = config.untimed || tutorial
    val tabletLevel: Int = if (tutorial) 1 else Tablets.pickLevel(chapter)
    val steps: List<List<TabletBlank>> = Tablets.buildSteps(chapter, Tablets.gapCount(tutorial, tabletLevel))
    val tabletTotal: Int = steps.size
    val bank: TabletsBank get() = config.bank

    private val rng: () -> Double = config.rng ?: { Random.nextDouble() }
    private var optsKey: String = ""
    private var hintedKey: String = ""
    private var winnowKey: String = ""
    private var lastTickMs: Long = 0L

    val currentStep: List<TabletBlank> get() = steps.getOrNull(tabletIdx).orEmpty()
    val currentBlank: TabletBlank? get() = currentStep.getOrNull(gapIdx) ?: currentStep.firstOrNull()
    val lampsLeft: Int get() = (tabletLives - tabletMiss).coerceAtLeast(0)
    val remainText: String
        get() {
            val total = tabletTotal.coerceAtLeast(1)
            val n = (tabletIdx + 1).coerceAtMost(total)
            return "$n / $total"
        }

    fun remainingMs(): Long = if (untimed) tabletClockMax.toLong() * 1000L else (tabletClock * 1000.0).toLong().coerceAtLeast(0L)

    fun fractionNow(): Double {
        if (untimed || tabletClockMax <= 0.0) return 1.0
        return (tabletClock / tabletClockMax).coerceIn(0.0, 1.0)
    }

    fun isCarved(gi: Int): Boolean =
        if (lastCorrect == true || phase == TabletsPhase.Results) gi <= gapIdx else gi < gapIdx

    fun gapKey(): String = "$tabletIdx:$gapIdx"

    fun pick(word: String) {
        if (ended || phase != TabletsPhase.Playing || resolving || confirmAbandon) return
        val blank = currentBlank ?: return
        selected = word
        resolve(Tablets.choiceMatches(word, blank.a))
    }

    fun resolve(ok: Boolean) {
        if (ended || phase != TabletsPhase.Playing || resolving) return
        resolving = true
        attempts += 1
        lastCorrect = ok
        if (ok) resolveHit() else resolveMiss()
    }

    fun finishResolve() {
        if (ended || !resolving) return
        resolving = false
        if (lastCorrect != true) {
            if (tutorial || tabletMiss < tabletLives) {
                resetAids()
                selected = null
                lastCorrect = null
                return
            }
            finish(timeout = false, abandoned = false)
            return
        }
        val stepSize = currentStep.size
        gapIdx += 1
        if (gapIdx >= stepSize) {
            tabletIdx += 1
            gapIdx = 0
        }
        selected = null
        lastCorrect = null
        if (tabletIdx >= steps.size) {
            if (tutorial) finishTutorial() else finish(timeout = false, abandoned = false)
            return
        }
        resetAids()
        if (!untimed) tabletClock = tabletClockMax
    }

    fun tick(dt: Double) {
        if (ended || phase != TabletsPhase.Playing || untimed) return
        tabletClock = (tabletClock - dt).coerceAtLeast(0.0)
        if (tabletClock > 0.0) return
        tabletTimeout = true
        finish(timeout = true, abandoned = false)
    }

    fun tickTo(nowMs: Long) {
        if (ended || phase != TabletsPhase.Playing || untimed) return
        if (lastTickMs == 0L) {
            lastTickMs = nowMs
            return
        }
        val dt = ((nowMs - lastTickMs).coerceAtLeast(0L) / 1000.0).coerceAtMost(0.1)
        lastTickMs = nowMs
        tick(dt)
    }

    fun pause() {
        if (ended || phase != TabletsPhase.Playing || confirmAbandon) return
        phase = TabletsPhase.Paused
    }

    fun resume() {
        if (phase != TabletsPhase.Paused) return
        confirmAbandon = false
        phase = TabletsPhase.Playing
        lastTickMs = config.nowMs()
    }

    fun requestAbandon() {
        if (ended || phase == TabletsPhase.Results || phase == TabletsPhase.TutorialDone) return
        if (phase == TabletsPhase.Playing) pause()
        confirmAbandon = true
    }

    fun stay() {
        confirmAbandon = false
        if (phase == TabletsPhase.Paused) resume()
    }

    fun abandon() {
        confirmAbandon = false
        if (tutorial) {
            ended = true
            phase = TabletsPhase.TutorialDone
            return
        }
        finish(timeout = false, abandoned = true)
    }

    fun illuminate(): Boolean {
        if (ended || phase != TabletsPhase.Playing || resolving) return false
        val key = gapKey()
        if (hintedKey == key) return false
        if (illum < 1) return false
        hintedKey = key
        hinted = true
        illum -= 1
        return true
    }

    fun winnow(): Boolean {
        if (ended || phase != TabletsPhase.Playing || resolving) return false
        val key = gapKey()
        if (winnowKey == key) return false
        if (winnow < 1) return false
        val blank = currentBlank ?: return false
        val decoys = choices.filter { !Tablets.choiceMatches(it, blank.a) && it !in grey }
        if (decoys.isEmpty()) return false
        grey = decoys.take(2)
        winnowKey = key
        winnow -= 1
        return true
    }

    private fun begin() {
        tabletIdx = 0
        gapIdx = 0
        tabletMiss = 0
        tabletLives = Tablets.LIVES
        tabletClockMax = Tablets.clockS(config.bank).toDouble()
        tabletClock = tabletClockMax
        tabletTimeout = false
        resolving = false
        favor = 0
        streak = 0
        bestStreak = 0
        correct = 0
        attempts = 0
        illum = 1
        winnow = 2
        ended = false
        phase = TabletsPhase.Playing
        lastTickMs = config.nowMs()
        resetAids()
    }

    private fun resetAids() {
        optsKey = ""
        grey = emptyList()
        hinted = false
        hintedKey = ""
        winnowKey = ""
        selected = null
        lastCorrect = null
        armChoices()
    }

    private fun armChoices() {
        val blank = currentBlank
        val key = gapKey()
        if (optsKey == key && choices.isNotEmpty()) return
        choices = Tablets.options(blank, rng)
        optsKey = key
    }

    private fun resolveHit() {
        correct += 1
        streak += 1
        if (streak > bestStreak) bestStreak = streak
        val mult = tierMult(streak)
        favor += kotlin.math.round((120 + tabletClock * 8) * mult).toInt()
    }

    private fun resolveMiss() {
        if (!tutorial) {
            tabletMiss += 1
            streak = 0
        }
    }

    private fun tierMult(streak: Int): Double = when {
        streak >= 8 -> 4.0
        streak >= 5 -> 3.0
        streak >= 3 -> 2.0
        streak >= 1 -> 1.5
        else -> 1.0
    }

    private fun pct(): Int {
        val total = tabletTotal.coerceAtLeast(1)
        return ((tabletIdx.toDouble() / total) * 100).roundToPct()
    }

    private fun finishTutorial() {
        ended = true
        phase = TabletsPhase.TutorialDone
        save = Tablets.persistTutorialDone(save)
        config.persist?.persist(save)
        result = TabletsResult(
            held = false,
            shattered = false,
            timeout = false,
            tutorial = true,
            abandoned = false,
            pct = 100,
            favor = favor,
            correct = correct,
            attempts = attempts,
            kick = "The Lord's Prayer is held. The Hall is open.",
            next = null,
            chapter = chapter,
            save = save,
        )
    }

    private fun finish(timeout: Boolean, abandoned: Boolean) {
        if (ended) return
        ended = true
        resolving = false
        val nowHeld = Tablets.held(tabletMiss, tabletIdx, tabletTotal)
        val finished = nowHeld || (tabletIdx >= tabletTotal && tabletTotal > 0)
        save = Tablets.persistRun(
            save = save,
            id = chapter.id,
            pct = pct(),
            nowHeld = nowHeld,
            correct = correct,
            attempts = attempts,
            bestStreak = bestStreak,
            finished = finished && !abandoned,
            scoreMul = config.diff.score,
        )
        config.persist?.persist(save)
        val kick = Tablets.kickText(nowHeld, abandoned, chapter.id, save, config.bank)
        result = TabletsResult(
            held = nowHeld,
            shattered = !nowHeld,
            timeout = timeout,
            tutorial = false,
            abandoned = abandoned,
            pct = pct(),
            favor = favor,
            correct = correct,
            attempts = attempts,
            kick = kick,
            next = if (nowHeld) Tablets.nextPlayable(chapter.id, save, config.bank) else null,
            chapter = chapter,
            save = save,
        )
        phase = TabletsPhase.Results
    }

    companion object {
        fun start(config: TabletsConfig): TabletsSession {
            val session = TabletsSession(config)
            session.begin()
            return session
        }
    }
}

private fun Double.roundToPct(): Int = kotlin.math.round(this).toInt()
