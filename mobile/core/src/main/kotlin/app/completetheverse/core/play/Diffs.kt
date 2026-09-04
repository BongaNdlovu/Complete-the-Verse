package app.completetheverse.core.play

data class Diff(
    val key: String,
    val name: String,
    val lives: Int,
    val time: Double,
    val score: Double,
)

object Diffs {
    val disciple = Diff(
        key = "disciple",
        name = "Disciple",
        lives = 3,
        time = 1.0,
        score = 0.85,
    )
    val watchman = Diff(
        key = "watchman",
        name = "Watchman",
        lives = 2,
        time = 0.85,
        score = 1.0,
    )

    fun resolve(key: String?): Diff =
        if (key == disciple.key) disciple else watchman
}
