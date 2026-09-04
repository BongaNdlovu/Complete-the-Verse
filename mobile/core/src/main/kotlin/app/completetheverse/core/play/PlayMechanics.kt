package app.completetheverse.core.play

import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.assemble.AssembleBoard
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.practice.Practice
import kotlin.math.floor
import kotlin.random.Random

enum class Mechanic {
    Mcq,
    Assemble,
    PassageRef,
    Cloze,
    Duel,
    Fade,
    TrueFalse,
}

enum class FadePhase { Memorize, Reconstruct }

enum class OverdriveChoice { Ride, Bank }

enum class PlayPhase { Playing, Paused, Overdrive, ConfirmAbandon, Results }

data class PlayQuestion(
    val mechanic: Mechanic,
    val verse: Verse? = null,
    val claim: TfClaim? = null,
    val clockBaseMs: Long? = null,
) {
    val typed: Boolean
        get() = mechanic == Mechanic.Assemble || verse?.typed == true
}

class ClozeBoard(
    val words: List<String>,
    val bank: List<String>,
    val filled: MutableList<String> = mutableListOf(),
) {
    val isComplete: Boolean get() = words.isNotEmpty() && filled.size >= words.size
    fun joined(): String = filled.joinToString(" ")

    fun pick(word: String): Boolean {
        if (filled.size >= words.size) return false
        if (!canSpend(word)) return false
        filled.add(word)
        return true
    }

    fun unfill(slot: Int): Boolean {
        if (slot < 0 || slot >= filled.size) return false
        filled.removeAt(slot)
        return true
    }

    fun unfillLast(): Boolean {
        if (filled.isEmpty()) return false
        filled.removeAt(filled.lastIndex)
        return true
    }

    fun canSpend(word: String): Boolean {
        val inFilled = filled.count { it == word }
        val inBank = bank.count { it == word }
        return inFilled < inBank
    }
}

data class DuelBoard(
    val leftText: String,
    val rightText: String,
    val leftVal: String,
    val rightVal: String,
    val correctVal: String,
)

object PlayMechanics {
    val PASSAGE_REF_FALLBACK = listOf("Genesis 1:1", "Exodus 3:14", "Joshua 24:2", "Acts 7:2")
    val FADE_STOCK_PADS = listOf("the shadow of the deep", "a still small voice", "the dust of the ground")
    private val FADE_LINE_EDITS: List<Pair<Regex, String>> = listOf(
        Regex("^The\\b") to "A",
        Regex("^A\\b") to "The",
        Regex("\\bthe\\b") to "a",
        Regex("\\ba\\b") to "the",
        Regex("\\bshall\\b") to "will",
        Regex("\\bwill\\b") to "shall",
        Regex("\\bshould\\b") to "would",
        Regex("\\bwould\\b") to "should",
        Regex("\\bthee\\b") to "you",
        Regex("\\bthou\\b") to "you",
        Regex("\\bthy\\b") to "your",
        Regex("\\bthine\\b") to "your",
        Regex("\\bye\\b") to "you",
        Regex("\\byou\\b") to "ye",
        Regex("\\bhath\\b") to "has",
        Regex("\\bdoth\\b") to "does",
        Regex("\\bdoeth\\b") to "does",
        Regex("\\bsaith\\b") to "says",
        Regex("\\bgoeth\\b") to "goes",
        Regex("\\bcometh\\b") to "comes",
        Regex("\\bmaketh\\b") to "makes",
        Regex("\\btaketh\\b") to "takes",
        Regex("\\bgiveth\\b") to "gives",
        Regex("\\bknoweth\\b") to "knows",
        Regex("\\bloveth\\b") to "loves",
        Regex("\\bshew\\b") to "show",
        Regex("\\bunto\\b") to "to",
        Regex("\\bupon\\b") to "on",
        Regex("\\bamong\\b") to "amongst",
        Regex("\\btoward\\b") to "towards",
        Regex("\\bheaven\\b") to "heavens",
        Regex("\\bheavens\\b") to "heaven",
        Regex("\\bsin\\b") to "sins",
        Regex("\\bword\\b") to "words",
        Regex("\\bwords\\b") to "word",
        Regex("\\bverily\\b") to "truly",
        Regex("\\bbehold\\b") to "see",
        Regex("\\bthis\\b") to "that",
        Regex("\\bthese\\b") to "those",
        Regex("\\bthose\\b") to "these",
        Regex("\\band\\b") to "or",
        Regex("\\bor\\b") to "and",
    )

    fun pilgrimageMechanic(index: Int, hasTf: Boolean): Mechanic? = when (index) {
        2 -> Mechanic.PassageRef
        3 -> Mechanic.Cloze
        4 -> Mechanic.Duel
        5 -> Mechanic.Fade
        6 -> if (hasTf) Mechanic.TrueFalse else null
        else -> null
    }

    fun mcqChoices(verse: Verse, rng: (() -> Double)? = null): List<String> =
        Practice.mcqChoices(verse, rng)

    fun choiceMatches(choice: String, answer: String): Boolean =
        Practice.choiceMatches(choice, answer)

    fun assembleMatches(board: AssembleBoard, answer: String): Boolean =
        Practice.assembleMatches(board, answer)

    fun fullVerseText(verse: Verse): String {
        val prefix = verse.p.trim()
        val answer = verse.a.trim()
        val suffix = verse.s.trim()
        var text = listOf(prefix, answer).filter { it.isNotEmpty() }.joinToString(" ")
        if (suffix.isNotEmpty()) {
            text += if (suffix[0] in ".,;:!?") suffix else " $suffix"
        }
        return text
    }

    fun fullQuestionPassage(verse: Verse): String =
        listOf(verse.p, verse.a, verse.s)
            .filter { it.isNotEmpty() }
            .joinToString(" ")
            .replace(Regex("\\s+([,.;:!?])"), "$1")
            .replace(Regex("\\s+"), " ")
            .trim()

    fun passageReferenceChoices(
        verse: Verse,
        siteVerses: List<Verse> = emptyList(),
        bank: List<Verse> = emptyList(),
        rng: (() -> Double)? = null,
    ): List<String> {
        val choices = mutableListOf(verse.r)
        val seen = mutableSetOf(verse.r)
        fun addFrom(pool: List<Verse>) {
            Assemble.shuffle(pool, rng).forEach { v ->
                if (choices.size >= 4 || v.r.isEmpty() || v.id == verse.id || v.r in seen) return@forEach
                seen.add(v.r)
                choices.add(v.r)
            }
        }
        addFrom(siteVerses)
        addFrom(bank.filter { it.b == verse.b })
        addFrom(bank)
        for (reference in PASSAGE_REF_FALLBACK) {
            if (choices.size < 4 && reference !in seen) {
                seen.add(reference)
                choices.add(reference)
            }
        }
        return Assemble.shuffle(choices, rng)
    }

    fun passageRefCorrect(choice: String, verse: Verse): Boolean =
        choiceMatches(choice, verse.r)

    fun buildCloze(verse: Verse, rng: (() -> Double)? = null): ClozeBoard {
        val words = Assemble.words(verse.a)
        val distractors = verse.d.joinToString(" ").split(Regex("\\s+")).filter { it.isNotEmpty() }
        val take = maxOf(2, 6 - words.size)
        val bank = Assemble.shuffle(words + distractors.take(take), rng)
        return ClozeBoard(words = words, bank = bank)
    }

    fun clozeCorrect(board: ClozeBoard): Boolean =
        choiceMatches(board.joined(), board.words.joinToString(" "))

    fun buildDuel(verse: Verse, rng: (() -> Double)? = null): DuelBoard {
        val r = rng ?: { Random.nextDouble() }
        val trueVerse = duelLine(verse.p, verse.a, verse.s)
        val fakePhrase = verse.d.firstOrNull()?.takeIf { it.isNotEmpty() } ?: "the shadow of the deep"
        val fakeVerse = duelLine(verse.p, fakePhrase, verse.s)
        val leftTrue = r() < 0.5
        return DuelBoard(
            leftText = if (leftTrue) trueVerse else fakeVerse,
            rightText = if (leftTrue) fakeVerse else trueVerse,
            leftVal = if (leftTrue) verse.a else fakePhrase,
            rightVal = if (!leftTrue) verse.a else fakePhrase,
            correctVal = verse.a,
        )
    }

    fun duelCorrect(choice: String, board: DuelBoard): Boolean =
        choiceMatches(choice, board.correctVal)

    fun fadePhraseAsVerse(verse: Verse, phrase: String): String {
        val prefix = verse.p.trim()
        val mid = phrase.trim()
        val suffix = verse.s.trim()
        var text = listOf(prefix, mid).filter { it.isNotEmpty() }.joinToString(" ")
        if (suffix.isNotEmpty()) {
            text += if (suffix[0] in ".,;:!?") suffix else " $suffix"
        }
        return text
    }

    fun fadeLineEdits(text: String): List<String> {
        val out = mutableListOf<String>()
        for ((pattern, repl) in FADE_LINE_EDITS) {
            if (!pattern.containsMatchIn(text)) continue
            val edited = pattern.replaceFirst(text, repl)
            if (edited != text && edited !in out) out.add(edited)
        }
        return out
    }

    fun fadePickChoices(
        verse: Verse,
        bank: List<Verse> = emptyList(),
        rng: (() -> Double)? = null,
    ): List<String> {
        val r = rng ?: { Random.nextDouble() }
        val truth = fullVerseText(verse)
        val seen = mutableSetOf(truth)
        val fakes = mutableListOf<String>()
        fun pushFake(line: String) {
            val trimmed = line.trim()
            if (trimmed.isEmpty() || fakes.size >= 3 || trimmed in seen) return
            seen.add(trimmed)
            fakes.add(trimmed)
        }
        val edits = fadeLineEdits(truth).toMutableList()
        while (edits.isNotEmpty() && fakes.size < 3) {
            val i = floor(r() * edits.size).toInt().coerceIn(0, edits.lastIndex)
            pushFake(edits.removeAt(i))
        }
        verse.d.forEach { pushFake(fadePhraseAsVerse(verse, it)) }
        if (fakes.size < 3) {
            val sibs = bank
                .filter { it.b == verse.b && it.id != verse.id && it.a.isNotEmpty() && it.a != verse.a }
                .map { it.a }
                .distinct()
                .toMutableList()
            while (sibs.isNotEmpty() && fakes.size < 3) {
                val i = floor(r() * sibs.size).toInt().coerceIn(0, sibs.lastIndex)
                pushFake(fadePhraseAsVerse(verse, sibs.removeAt(i)))
            }
        }
        FADE_STOCK_PADS.forEach { pushFake(fadePhraseAsVerse(verse, it)) }
        return Assemble.shuffle(listOf(truth) + fakes, rng)
    }

    fun fadeCorrect(choice: String, verse: Verse): Boolean =
        choiceMatches(choice, fullVerseText(verse))

    fun trueFalseCorrect(claim: TfClaim, pickedTrue: Boolean, timedOut: Boolean): Boolean =
        !timedOut && pickedTrue == claim.v

    fun tfReuseWindow(claims: List<TfClaim>): Int {
        val falseCount = claims.count { !it.v }
        return maxOf(1, minOf(40, falseCount - 8))
    }

    fun rememberUsedClaim(used: MutableList<Int>, index: Int, claims: List<TfClaim>) {
        used.add(index)
        val window = tfReuseWindow(claims)
        while (used.size > window) used.removeAt(0)
    }

    fun pickClaim(
        claims: List<TfClaim>,
        used: List<Int> = emptyList(),
        siteBooks: Set<String> = emptySet(),
        wantFalse: Boolean? = null,
        targetTier: Int? = null,
        rng: (() -> Double)? = null,
    ): Pair<TfClaim, Int>? {
        if (claims.isEmpty()) return null
        val r = rng ?: { Random.nextDouble() }
        var poolIdx = claims.indices.filter { it !in used }
        if (poolIdx.isEmpty()) poolIdx = claims.indices.toList()
        val pool = poolIdx.map { claims[it] }
        val rollFalse = wantFalse ?: (r() < 0.65)
        val territory = r() < 0.75
        val books = siteBooks
        val candidates = tfPickFromPool(pool, books, rollFalse, targetTier, territory)
        if (candidates.isEmpty()) return null
        val claim = candidates[floor(r() * candidates.size).toInt().coerceIn(0, candidates.lastIndex)]
        val idx = claims.indexOf(claim)
        return claim to idx
    }

    private fun tfPickFromPool(
        pool: List<TfClaim>,
        books: Set<String>,
        wantFalse: Boolean,
        targetTier: Int?,
        preferTerritory: Boolean,
    ): List<TfClaim> {
        fun ofVerdict(list: List<TfClaim>, trueClaim: Boolean) = list.filter { it.v == trueClaim }
        fun ofTier(list: List<TfClaim>, t: Int?): List<TfClaim> {
            if (t == null) return list
            val match = list.filter { (it.t) == t }
            return match.ifEmpty { list }
        }
        var candidates: List<TfClaim> = emptyList()
        if (preferTerritory) {
            val territory = pool.filter { it.b in books }
            val terrV = ofVerdict(territory, !wantFalse)
            candidates = ofTier(terrV, targetTier)
            if (candidates.isEmpty()) candidates = terrV
            if (candidates.isEmpty()) {
                val poolV = ofVerdict(pool, !wantFalse)
                candidates = ofTier(poolV, targetTier)
                if (candidates.isEmpty()) candidates = poolV
            }
            if (candidates.isEmpty()) candidates = ofTier(territory, targetTier)
            if (candidates.isEmpty()) candidates = territory
        }
        if (candidates.isEmpty()) {
            val poolV = ofVerdict(pool, !wantFalse)
            candidates = ofTier(poolV, targetTier)
            if (candidates.isEmpty()) candidates = poolV
        }
        if (candidates.isEmpty()) candidates = ofTier(pool, targetTier)
        if (candidates.isEmpty()) candidates = pool
        return candidates
    }

    private fun duelLine(p: String, mid: String, s: String): String {
        val left = if (p.isNotEmpty()) "$p " else ""
        val right = if (s.isNotEmpty()) " $s" else ""
        return left + mid + right
    }
}
