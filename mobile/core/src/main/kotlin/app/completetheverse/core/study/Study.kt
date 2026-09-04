package app.completetheverse.core.study

import app.completetheverse.core.bank.Verse
import app.completetheverse.core.practice.Practice
import app.completetheverse.core.save.SaveBlob
import app.completetheverse.core.srs.Srs
import app.completetheverse.core.srs.SrsCard

object Study {
    fun cards(save: SaveBlob): Map<String, SrsCard> = Srs.cardsFromSave(save["srs"])

    fun cardFor(save: SaveBlob, verseId: String): SrsCard? = cards(save)[verseId]

    fun dueCount(
        verses: List<Verse>,
        save: SaveBlob,
        today: Int = Srs.dayNumber(),
    ): Int = Srs.dueCount(verses, { cardFor(save, it.id) }, today)

    /** UI label for [Srs.strength]; `lapsed` is shown as lapsing. */
    fun strength(card: SrsCard?): String {
        val raw = Srs.strength(card)
        return if (raw == "lapsed") "lapsing" else raw
    }

    fun filterState(card: SrsCard?, today: Int): String {
        if (card == null || (card.reps == 0 && card.lapses == 0)) return "unseen"
        if (card.due <= today) return "due"
        return if (Srs.strength(card) == "held") "held" else "learning"
    }

    fun scheduleLabel(card: SrsCard?, today: Int): String {
        if (card == null || (card.reps == 0 && card.lapses == 0)) return "Never seen"
        if (card.reps == 0) return "Lost — due now"
        val inDays = card.due - today
        if (inDays <= 0) return if (inDays == 0) "Due today" else "${-inDays}d overdue"
        val band = if (Srs.strength(card) == "held") "Held" else "Learning"
        return "$band · due in ${inDays}d"
    }

    fun applyReview(
        save: SaveBlob,
        verse: Verse,
        correct: Boolean,
        timedOut: Boolean,
        fraction: Double?,
        mode: String,
        today: Int = Srs.dayNumber(),
    ): SaveBlob = Practice.applyAnswer(
        save = save,
        verse = verse,
        correct = correct,
        timedOut = timedOut,
        fraction = fraction,
        today = today,
        mode = mode,
    ).save

    fun matchesFilter(card: SrsCard?, filter: String, today: Int): Boolean = when (filter) {
        "all" -> true
        "due" -> filterState(card, today) == "due"
        "lapsing" -> strength(card) == "lapsing"
        else -> filterState(card, today) == filter
    }

    fun matchesQuery(verse: Verse, query: String): Boolean {
        if (query.isBlank()) return true
        val q = query.lowercase()
        val hay = "${verse.p} ${verse.a} ${verse.s} ${verse.r} ${verse.b}".lowercase()
        return q in hay
    }
}
