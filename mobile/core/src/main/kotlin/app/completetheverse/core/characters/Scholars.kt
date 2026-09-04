package app.completetheverse.core.characters

/**
 * Playable scholars only. Biblical figure ids stay in older saves
 * but [resolve] never equips them.
 */
data class Scholar(
    val id: String,
    val name: String,
    val short: String,
    val nationality: String,
    val gender: String,
    val blurb: String,
)

object Scholars {
    val ALL: List<Scholar> = listOf(
        Scholar(
            id = "amina",
            name = "Amina Okonkwo",
            short = "Amina",
            nationality = "Nigerian",
            gender = "f",
            blurb = "A careful reader from Lagos, trained in Hebrew and history.",
        ),
        Scholar(
            id = "elias",
            name = "Elias Papadopoulos",
            short = "Elias",
            nationality = "Greek",
            gender = "m",
            blurb = "An Athens classicist who still walks with a field notebook.",
        ),
        Scholar(
            id = "soojin",
            name = "Soo-jin Park",
            short = "Soo-jin",
            nationality = "Korean",
            gender = "f",
            blurb = "A Seoul linguist who maps KJV cadence against the Hebrew.",
        ),
        Scholar(
            id = "yusef",
            name = "Yusef Al-Hakim",
            short = "Yusef",
            nationality = "Egyptian",
            gender = "m",
            blurb = "A Cairo historian of the Near East and the long road.",
        ),
        Scholar(
            id = "lucia",
            name = "Lúcia Mendes",
            short = "Lúcia",
            nationality = "Brazilian",
            gender = "f",
            blurb = "A São Paulo theologian who traces the prophets through Portuguese Bibles.",
        ),
        Scholar(
            id = "priya",
            name = "Priya Sharma",
            short = "Priya",
            nationality = "Indian",
            gender = "f",
            blurb = "A Delhi Hebraist who compares KJV cadence with the Sanskrit of her home.",
        ),
        Scholar(
            id = "thomas",
            name = "Thomas Hale",
            short = "Thomas",
            nationality = "English",
            gender = "m",
            blurb = "An Oxford reader of the Church Fathers with mud still on his boots.",
        ),
        Scholar(
            id = "dawit",
            name = "Dawit Bekele",
            short = "Dawit",
            nationality = "Ethiopian",
            gender = "m",
            blurb = "An Addis Ababa scholar of Ge'ez scripture and the long African church.",
        ),
    )

    fun defaultId(): String = ALL.first().id

    fun byId(id: String?): Scholar? = ALL.firstOrNull { it.id == id }

    fun isScholar(id: String?): Boolean = byId(id) != null

    fun resolve(id: String?): Scholar = byId(id) ?: ALL.first()
}
