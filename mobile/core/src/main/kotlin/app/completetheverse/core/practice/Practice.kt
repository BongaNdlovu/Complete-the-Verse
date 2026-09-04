package app.completetheverse.core.practice

import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.assemble.AssembleBoard
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.srs.GradeInput
import app.completetheverse.core.srs.Srs
import app.completetheverse.core.srs.SrsCard
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.doubleOrNull
import java.util.Locale

object Practice {
    const val LENGTH = 15
    const val WALL_PICK_MS = 30_000L

    /**
     * Assemble when the verse is stamped `typed`, or on every 5th question
     * (1-based 5 / 10 / 15) whose blank has two or more words. MCQ is the default.
     */
    fun usesAssemble(indexZeroBased: Int, verse: Verse): Boolean {
        if (Assemble.words(verse.a).size < 2) return false
        if (verse.typed) return true
        return (indexZeroBased + 1) % 5 == 0
    }

    fun buildDrill(
        verses: List<Verse>,
        cardFor: (Verse) -> SrsCard?,
        today: Int,
        limit: Int = LENGTH,
        rng: (() -> Double)? = null,
    ): List<Verse> {
        val shuffle: (List<Verse>) -> List<Verse> = { list ->
            if (rng == null) list else Assemble.shuffle(list, rng)
        }
        return Srs.buildQueue(verses, cardFor, today, limit, shuffle)
    }

    fun mcqChoices(verse: Verse, rng: (() -> Double)? = null): List<String> {
        val correct = verse.a
        val picked = mutableListOf<String>()
        val ban = mutableSetOf(correct.trim())
        for (d in verse.d) {
            val s = d.trim()
            if (s.isEmpty() || s in ban) continue
            ban.add(s)
            picked.add(s)
            if (picked.size >= 3) break
        }
        return Assemble.shuffle(listOf(correct) + picked, rng)
    }

    fun choiceMatches(choice: String, answer: String): Boolean {
        if (choice == answer) return true
        val choiceNorm = choice.trim().replace(Regex("\\s+"), " ").lowercase(Locale.ROOT)
        val targetNorm = answer.trim().replace(Regex("\\s+"), " ").lowercase(Locale.ROOT)
        return choiceNorm.isNotEmpty() && choiceNorm == targetNorm
    }

    fun assembleMatches(board: AssembleBoard, answer: String): Boolean =
        Assemble.join(board.placed) == answer

    data class AnswerRecord(
        val save: SaveBlob,
        val card: SrsCard,
        val quality: Int,
        val correct: Boolean,
    )

    fun applyAnswer(
        save: SaveBlob,
        verse: Verse,
        correct: Boolean,
        timedOut: Boolean,
        fraction: Double?,
        today: Int,
        mode: String,
        near: Boolean = false,
    ): AnswerRecord {
        val outcome = GradeInput(
            timedOut = timedOut,
            correct = correct,
            near = near,
            fraction = fraction,
            mode = mode,
        )
        val prev = Srs.cardFromJson((save["srs"] as? JsonObject)?.get(verse.id))
        val quality = Srs.gradeAnswer(outcome)
        val scheduled = Srs.schedule(prev, quality, today)
        val card = scheduled.copy(
            lastQuality = quality,
            lastMode = mode,
            lastFraction = fraction,
            lastCueLevel = 0,
            lastNear = near,
        )
        var next = Srs.putCard(save, verse.id, card)
        next = bumpLife(next, correct)
        next = recordVerse(next, verse, correct)
        return AnswerRecord(save = next, card = card, quality = quality, correct = correct)
    }

    private fun recordVerse(save: SaveBlob, verse: Verse, correct: Boolean): SaveBlob {
        val books = ((save["books"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        val book = ((books[verse.b] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        book["a"] = JsonPrimitive(jsonInt(book["a"]) + 1)
        if (correct) book["c"] = JsonPrimitive(jsonInt(book["c"]) + 1)
        books[verse.b] = JsonObject(book)
        val verses = ((save["verse"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        val row = ((verses[verse.id] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        row["a"] = JsonPrimitive(jsonInt(row["a"]) + 1)
        if (correct) row["c"] = JsonPrimitive(jsonInt(row["c"]) + 1)
        verses[verse.id] = JsonObject(row)
        val out = save.toMutableMap()
        out["books"] = JsonObject(books)
        out["verse"] = JsonObject(verses)
        return JsonObject(out)
    }

    private fun bumpLife(save: SaveBlob, correct: Boolean): SaveBlob {
        val life = ((save["life"] as? JsonObject)?.toMutableMap() ?: mutableMapOf())
        life["reviewsDone"] = JsonPrimitive(jsonInt(life["reviewsDone"]) + 1)
        life["attempts"] = JsonPrimitive(jsonInt(life["attempts"]) + 1)
        if (correct) life["correct"] = JsonPrimitive(jsonInt(life["correct"]) + 1)
        val out = save.toMutableMap()
        out["life"] = JsonObject(life)
        return JsonObject(out)
    }

    private fun jsonInt(el: kotlinx.serialization.json.JsonElement?): Int {
        val p = el as? JsonPrimitive ?: return 0
        p.doubleOrNull?.let { return it.toInt() }
        return p.content.toIntOrNull() ?: 0
    }
}
