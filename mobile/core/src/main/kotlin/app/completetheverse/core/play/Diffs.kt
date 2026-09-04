package app.completetheverse.core.play

data class Diff(
    val key: String,
    val name: String,
    val lives: Int,
    val time: Double,
    val score: Double,
    val desc: String = "",
)

object Diffs {
    val disciple = Diff(
        key = "disciple",
        name = "Disciple",
        lives = 3,
        time = 1.0,
        score = 0.85,
        desc = "Three lamps. The clock as it is written.",
    )
    val watchman = Diff(
        key = "watchman",
        name = "Watchman",
        lives = 2,
        time = 0.85,
        score = 1.0,
        desc = "Two lamps. The clock as the ordeal writes it.",
    )

    fun resolve(key: String?): Diff =
        if (key == disciple.key) disciple else watchman
}
