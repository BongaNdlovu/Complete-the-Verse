package app.completetheverse.core.seals

import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

data class Seal(
    val id: String,
    val name: String,
    val desc: String,
)

object Seals {
    val ALL: List<Seal> = listOf(
        Seal("first", "First Light", "Complete your first run."),
        Seal("unshaken", "Unshaken", "Clear a full act without losing a life."),
        Seal("recall", "Perfect Recall", "Answer 10 correct in a row."),
        Seal("flame", "Flame Keeper", "Answer 20 correct in a row."),
        Seal("watch", "The Watchman", "Reach Act V of the Trial."),
        Seal("swift", "Swift of Tongue", "Answer 10 times under 1.5 seconds in one run."),
        Seal("nocrutch", "No Crutch", "Finish the Trial without spending a single power."),
        Seal("flawless", "Nothing Lost", "Finish the Trial with no wrong answers."),
        Seal("score25", "Weight of Glory", "Score 25,000 in a single run."),
        Seal("score50", "Crown of Gold", "Score 50,000 in a single run."),
        Seal("sd15", "Final Witness", "Complete the five-question Final Test."),
        Seal("end40", "Long Obedience", "Answer 40 questions in one Endless run."),
        Seal("daily7", "Daily Bread", "Complete 7 Daily Trials."),
        Seal("books30", "Testament Bearer", "Answer correctly from 30 different books."),
        Seal("books66", "The Whole Counsel", "Answer correctly from all 66 books."),
        Seal("lvl20", "Master of the Word", "Reach level 20."),
        Seal("life500", "Scribe's Hand", "500 correct answers, all-time."),
        Seal("ironman", "Iron Sharpeneth", "Complete the Trial."),
        Seal("road-first", "Get Thee Out", "Clear your first site on the Pilgrimage."),
        Seal("road-arc1", "Out of Ur", "Complete the Patriarchs — Ur to Dothan."),
        Seal("road-half", "Half the Road", "Complete two full arcs of the Pilgrimage."),
        Seal("road-patmos", "The Last Island", "Reach and clear Patmos."),
        Seal("road-end", "Ur to Patmos", "Clear every site on the Pilgrimage."),
        Seal("arc-patriarchs", "Faith of Abraham", "Keep every verse at every site from Ur to Dothan."),
        Seal("arc-exodus", "Out of Egypt", "Keep every verse at every site from Midian to Jericho."),
        Seal("arc-judges", "No King in Israel", "Keep every verse at every site from Harod to Mizpah."),
        Seal("arc-kingdom", "By the Rivers", "Keep every verse at every site from Jerusalem to Susa."),
        Seal("arc-gospel", "To the Ends", "Keep every verse at every site from Bethlehem to Patmos."),
        Seal("relay", "Without Rest", "Walk a whole arc in one unbroken run."),
        Seal("remnant", "The Remnant", "Complete Act VI of the Trial."),
        Seal("oil50", "Anointed", "Spend 50 oil on extra lifelines."),
        Seal("ascent", "The Ascent", "Reach level 35 — Elder of the Gate."),
        Seal("assemble12", "Fitted Stones", "Place 12 phrases word for word in one run."),
        Seal("seventh-lamp", "The Seventh Lamp", "Finish a coffee on seven consecutive calendar days."),
        Seal("streak14", "Two Weeks Unbroken", "Finish a coffee on 14 consecutive calendar days."),
        Seal("streak30", "Thirty Days", "Finish a coffee on 30 consecutive calendar days."),
        Seal("act6-watch", "The Last Watch", "Complete Act VI on Watchman difficulty."),
    )

    fun count(): Int = ALL.size

    fun earnedIds(save: SaveBlob): Set<String> {
        val arr = save["seals"] as? JsonArray ?: return emptySet()
        return arr.mapNotNull { (it as? JsonPrimitive)?.contentOrNull }.toSet()
    }

    fun earnedCount(save: SaveBlob): Int = earnedIds(save).size

    fun has(save: SaveBlob, id: String): Boolean = id in earnedIds(save)
}
