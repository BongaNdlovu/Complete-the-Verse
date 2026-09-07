package app.completetheverse.core.beat

data class BeatCinema(
    val still: String,
    val vo: String? = null,
    val sfx: String? = null,
    val sfxFirst: Boolean = false,
    val fx: String,
    val line: String,
)

data class BeatMultiItem(
    val id: String,
    val t: String,
    val on: Boolean,
)

data class BeatMatchRow(
    val id: String,
    val prompt: String,
    val a: String,
)

data class BeatQuestion(
    val id: String,
    val kind: String,
    val plate: String,
    val r: String,
    val stem: String,
    val choices: List<String> = emptyList(),
    val a: String? = null,
    val order: List<String> = emptyList(),
    val blanks: List<String> = emptyList(),
    val bank: List<String> = emptyList(),
    val items: List<BeatMultiItem> = emptyList(),
    val rows: List<BeatMatchRow> = emptyList(),
    val scatter: List<String> = emptyList(),
    val sfx: String? = null,
    val fx: String = "wind",
)

object Beat {
    const val CLOCK_MS = 40_000L
    const val NAME = "the LORD of hosts, the God of the armies of Israel"
    const val ROOT = "assets/beats/goliath/"

    fun url(file: String): String = ROOT + file

    val cinemaA = listOf(
        BeatCinema("01.webp", vo = "vo-01-valley.mp3", fx = "wind", line = "The valley of Elah. Two camps. Forty days of this."),
        BeatCinema("02.webp", vo = "vo-02-ridge.mp3", fx = "wind", line = "Saul's men hold the ridge. They do not come down."),
        BeatCinema("03.webp", vo = "vo-03-defy.mp3", fx = "run", line = "I defy the armies of Israel this day. Give me a man, that we may fight together."),
        BeatCinema("04.webp", vo = "vo-04-again.mp3", fx = "breath", line = "He has come out again."),
        BeatCinema("05.webp", sfx = "sfx-05-crowd.mp3", fx = "wind", line = ""),
    )

    val cinemaB = listOf(
        BeatCinema("06.webp", vo = "vo-06-youth.mp3", sfx = "sfx-06-wind-shield.mp3", fx = "wind", line = "And when the Philistine looked about, and saw David, he disdained him: for he was but a youth."),
        BeatCinema("07.webp", sfx = "sfx-07-breath.mp3", fx = "breath", line = ""),
        BeatCinema("08.webp", vo = "vo-08-staves.mp3", fx = "run", line = "Am I a dog, that thou comest to me with staves?"),
        BeatCinema("09.webp", vo = "vo-09-flesh.mp3", fx = "breath", line = "Come to me, and I will give thy flesh unto the fowls of the air, and to the beasts of the field."),
        BeatCinema("10.webp", vo = "vo-10-name.mp3", sfx = "sfx-10-thud.mp3", sfxFirst = true, fx = "run", line = "I come to thee in the name of the LORD of hosts, the God of the armies of Israel, whom thou hast defied."),
    )

    val questions = listOf(
        BeatQuestion(
            id = "beat-q1",
            kind = "pick",
            plate = "question.webp",
            r = "1 Samuel 17:1-2",
            stem = "The Philistines gathered themselves together at Shochoh, which belongeth to Judah, and pitched ______. And Saul and the men of Israel were gathered together, and pitched ______.",
            choices = listOf(
                "in the valley of Elah / between Shochoh and Azekah",
                "between Shochoh and Azekah, in Ephes-dammim / in the valley of Elah",
                "at Gath / at Mizpah",
                "at Ekron / in the valley of Jezreel",
            ),
            a = "between Shochoh and Azekah, in Ephes-dammim / in the valley of Elah",
        ),
        BeatQuestion(
            id = "beat-q2",
            kind = "pick",
            plate = "03.webp",
            r = "1 Samuel 17:5-7",
            stem = "Goliath's spear's head weighed:",
            choices = listOf(
                "600 shekels of iron",
                "5,000 shekels of brass",
                "300 shekels of iron",
                "600 shekels of brass",
            ),
            a = "600 shekels of iron",
        ),
        BeatQuestion(
            id = "beat-q3",
            kind = "pick",
            plate = "05.webp",
            r = "1 Samuel 17:17-18",
            stem = "Jesse sends an ephah of parched corn, ten loaves, and ten cheeses. Who gets the cheeses?",
            choices = listOf(
                "David's brethren",
                "Saul",
                "the captain of their thousand",
                "the keeper of the carriage",
            ),
            a = "the captain of their thousand",
            sfx = "sfx-05-crowd.mp3",
        ),
        BeatQuestion(
            id = "beat-q4",
            kind = "order",
            plate = "06.webp",
            r = "1 Samuel 17:20-22",
            stem = "Put David's morning in verse order.",
            order = listOf(
                "Left the sheep with a keeper",
                "Took, and went, as Jesse had commanded him",
                "Left his carriage in the hand of the keeper of the carriage",
                "Ran into the army, and came and saluted his brethren",
            ),
            sfx = "sfx-06-wind-shield.mp3",
        ),
        BeatQuestion(
            id = "beat-q5",
            kind = "cloze",
            plate = "07.webp",
            r = "1 Samuel 17:28",
            stem = "Why camest thou down hither? and with whom hast thou left ______? I know thy pride, and the naughtiness of thine heart; for thou art come down ______.",
            blanks = listOf("those few sheep in the wilderness", "that thou mightest see the battle"),
            bank = listOf(
                "those few sheep in the wilderness",
                "that thou mightest see the battle",
                "Saul",
                "Abner",
                "Goliath",
                "to see the battle",
            ),
            sfx = "sfx-07-breath.mp3",
            fx = "breath",
        ),
        BeatQuestion(
            id = "beat-q6",
            kind = "pick",
            plate = "08.webp",
            r = "1 Samuel 17:37",
            stem = "The LORD that delivered me out of the paw of the lion, and out of the paw of the bear, he will deliver me ______.",
            choices = listOf(
                "out of the hand of this Philistine",
                "out of the armies of the uncircumcised",
                "out of the giant of Gath",
                "out of the sword of Goliath",
            ),
            a = "out of the hand of this Philistine",
            fx = "run",
        ),
        BeatQuestion(
            id = "beat-q7",
            kind = "multi",
            plate = "10.webp",
            r = "1 Samuel 17:40",
            stem = "What doth David take toward the Philistine? Select all that apply.",
            items = listOf(
                BeatMultiItem("helm", "Saul's helmet of brass", false),
                BeatMultiItem("mail", "Saul's coat of mail", false),
                BeatMultiItem("staff", "His staff", true),
                BeatMultiItem("stones", "Five smooth stones out of the brook", true),
                BeatMultiItem("sling", "His sling", true),
                BeatMultiItem("sword", "A sword of his own", false),
            ),
            sfx = "sfx-10-thud.mp3",
            fx = "run",
        ),
        BeatQuestion(
            id = "beat-q8",
            kind = "pick",
            plate = "12.webp",
            r = "1 Samuel 17:43",
            stem = "Am I a dog, that thou comest to me with staves?",
            choices = listOf("Eliab", "Saul", "Goliath", "Abner"),
            a = "Goliath",
            fx = "run",
        ),
        BeatQuestion(
            id = "beat-q9",
            kind = "pick",
            plate = "13.webp",
            r = "1 Samuel 17:45",
            stem = "Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of ______.",
            choices = listOf(
                NAME,
                "the LORD my shepherd",
                "the God of Abraham, Isaac, and Jacob",
                "the LORD that sitteth between the cherubims",
            ),
            a = NAME,
            fx = "breath",
        ),
        BeatQuestion(
            id = "beat-q10",
            kind = "pick",
            plate = "14.webp",
            r = "1 Samuel 17:46",
            stem = "Why doth David say this fight is happening?",
            choices = listOf(
                "that all the earth may know that there is a God in Israel",
                "that Saul may know I am fit to be king",
                "that my brethren may see I am no longer a child",
                "that Gath may become subject to Bethlehem",
            ),
            a = "that all the earth may know that there is a God in Israel",
            fx = "run",
        ),
        BeatQuestion(
            id = "beat-q11",
            kind = "pick",
            plate = "15.webp",
            r = "1 Samuel 17:50-51",
            stem = "After the stone hits, what is true?",
            choices = listOf(
                "David's own sword was already drawn",
                "David ran, and stood upon the Philistine, and took his sword, and drew it out of the sheath thereof, and slew him, and cut off his head therewith",
                "The Israelites reached Goliath first and finished him",
                "David left the body and took only the shield to Saul",
            ),
            a = "David ran, and stood upon the Philistine, and took his sword, and drew it out of the sheath thereof, and slew him, and cut off his head therewith",
            fx = "run",
        ),
        BeatQuestion(
            id = "beat-q12",
            kind = "match",
            plate = "11.webp",
            r = "1 Samuel 17:54",
            stem = "And David took the head of the Philistine, and brought it to ______; but he put his armour in ______.",
            rows = listOf(
                BeatMatchRow("head", "Head of Goliath", "Jerusalem"),
                BeatMatchRow("armour", "Goliath's armour", "David's tent"),
            ),
            scatter = listOf("Jerusalem", "David's tent", "Saul's house", "Nob", "the tabernacle", "the valley of Elah"),
        ),
    )

    fun held(correct: Int, beatMiss: Boolean): Boolean =
        correct == questions.size && !beatMiss

    fun multiKey(items: List<BeatMultiItem> = questions.first { it.id == "beat-q7" }.items): String =
        items.filter { it.on }.map { it.id }.sorted().joinToString(",")
}
