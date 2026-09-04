package app.completetheverse.ui.hall

data class HallMode(
    val key: String,
    val name: String,
    val kick: String,
    val desc: String,
    val tagline: String,
    val incoming: Boolean = false,
    val hidden: Boolean = false,
)

data class HallModeGroup(
    val name: String,
    val quiet: Boolean = false,
    val modeKeys: List<String>,
)

data class HallSubnav(
    val id: String,
    val label: String,
    val kick: String = "",
    val title: String = "",
)

val MENU_ORDER = listOf(
    "pilgrimage", "beat", "tablets", "daily", "blitz", "trial", "endless", "practice", "team",
)

val MODES = listOf(
    HallMode(
        key = "pilgrimage",
        name = "The Pilgrimage",
        kick = "The long road",
        desc = "Forty-six places, in the order Scripture walks them — from the city Abraham left to the island where the last book was written. Each site is eight verses drawn without repeating earlier stops; the last beat is produced from memory with no options. The clock closes as you go east.",
        tagline = "46 places · 20 tablets on the road",
    ),
    HallMode(
        key = "beat",
        name = "The Valley",
        kick = "A Beat of Faith",
        desc = "David and Goliath in the valley of Elah. Twelve questions from 1 Samuel 17. Forty seconds each. Held only if none are wrong.",
        tagline = "Goliath · twelve questions · replay any time",
        incoming = true,
    ),
    HallMode(
        key = "tablets",
        name = "Word Tablets",
        kick = "Fill the Word",
        desc = "Carve the missing KJV word before the clock runs out. One miss shatters the Hold. Learn the prayer, then Hold Psalm 23 to open Psalm 91, then John 1.",
        tagline = "Pace I–III · the hall",
    ),
    HallMode(
        key = "trial",
        name = "The Trial",
        kick = "Campaign",
        desc = "Five acts. The clock tightens with every one. Reach Act V with one life, clear its five questions, and earn the ending. A sixth act waits for those who have already been through the fire.",
        tagline = "5 acts · one-life finale",
    ),
    HallMode(
        key = "endless",
        name = "Endless Gauntlet",
        kick = "Survival",
        desc = "One continuous run. The timer shrinks a fraction each question and never resets.",
        tagline = "Infinite · shrinking clock",
    ),
    HallMode(
        key = "daily",
        name = "Daily Trial",
        kick = "One shot a day",
        desc = "Twenty verses, drawn by today's date. Everyone who plays today gets exactly the same twenty in exactly the same order. Your first finished run sets the day's score — a run that ends early does not count, and after the score stands you may practise.",
        tagline = "20 verses · same for everyone",
    ),
    HallMode(
        key = "blitz",
        name = "Scripture Blitz",
        kick = "Sixty seconds",
        desc = "A survival clock. Every correct answer adds two seconds; every miss burns four. The screen edges flare as time runs thin. How many verses can you hold?",
        tagline = "60s · +2s / −4s",
    ),
    HallMode(
        key = "practice",
        name = "The Drill",
        kick = "Spaced review",
        desc = "The verses that have fallen due, most overdue first, then whatever you have never seen.",
        tagline = "15 verses · due first",
    ),
    HallMode(
        key = "team",
        name = "Team Mode",
        kick = "White vs Blue",
        desc = "Pass-and-play. Tap who starts. That team answers five, then the other answers five different verses. Misses do not end the round. Keeps win; faster total time breaks a tie. Nothing is recorded.",
        tagline = "Pick who starts · 5 each · not recorded",
    ),
).associateBy { it.key }

val MENU_GROUPS = listOf(
    HallModeGroup("The Road", modeKeys = listOf("pilgrimage")),
    HallModeGroup("The Valley", modeKeys = listOf("beat")),
    HallModeGroup("The Tablets", modeKeys = listOf("tablets")),
    HallModeGroup("Today", quiet = true, modeKeys = listOf("daily")),
    HallModeGroup("Practice", quiet = true, modeKeys = listOf("practice", "team")),
    HallModeGroup("Challenges", quiet = true, modeKeys = listOf("blitz", "trial", "endless")),
)

val HALL_SUBNAV = listOf(
    HallSubnav("study", "Study Hall", kick = "Study Hall", title = "The Whole Counsel"),
    HallSubnav("relics", "Relics", kick = "The Reliquary", title = "Historical Artifacts"),
    HallSubnav("seals", "Seals", kick = "Achievements", title = "Seals"),
    HallSubnav("records", "Records", kick = "Records", title = "The Chronicle"),
    HallSubnav("settings", "Settings"),
    HallSubnav("quit", "Quit game"),
)

fun visibleGroupModes(group: HallModeGroup): List<HallMode> =
    group.modeKeys.mapNotNull { key ->
        MODES[key]?.takeUnless { it.hidden }
    }

fun orphanMenuModes(): List<HallMode> {
    val grouped = MENU_GROUPS.flatMap { it.modeKeys }.toSet()
    return MENU_ORDER.mapNotNull { key ->
        MODES[key]?.takeUnless { it.hidden || key in grouped }
    }
}
