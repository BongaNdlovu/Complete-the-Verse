package app.completetheverse.core.bank

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.util.Locale

@Serializable
data class Verse(
    val id: String,
    val p: String,
    val a: String,
    val s: String = "",
    val d: List<String> = emptyList(),
    val r: String,
    val b: String,
    val t: Int = 3,
    val typed: Boolean = false,
)

data class VerseBank(
    val verses: List<Verse>,
    val byId: Map<String, Verse>,
    val byTier: Map<Int, List<Verse>>,
    val booksOrder: List<String>,
)

@Serializable
private data class VerseFile(
    val verses: List<Verse> = emptyList(),
    val booksOrder: List<String> = emptyList(),
)

object Bank {
    val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    fun parse(raw: String): VerseBank {
        val file = json.decodeFromString(VerseFile.serializer(), raw)
        val verses = file.verses.map { v ->
            if (v.b == "Psalm") v.copy(b = "Psalms") else v
        }
        val byId = linkedMapOf<String, Verse>()
        val byTier = mutableMapOf<Int, MutableList<Verse>>()
        for (v in verses) {
            byId[v.id] = v
            byTier.getOrPut(v.t) { mutableListOf() }.add(v)
        }
        return VerseBank(
            verses = verses,
            byId = byId,
            byTier = byTier,
            booksOrder = file.booksOrder,
        )
    }

    fun verseId(v: Verse): String {
        fun slug(s: String): String =
            s.lowercase(Locale.ROOT).replace(Regex("[^a-z0-9]+"), "-").trim('-')
        return slug(v.r) + "~" + slug(v.a).split("-").take(4).joinToString("-")
    }

    fun stemSep(suffix: String): String =
        if (suffix.isNotEmpty() && suffix[0] in ".,;:!?") "" else " "
}
