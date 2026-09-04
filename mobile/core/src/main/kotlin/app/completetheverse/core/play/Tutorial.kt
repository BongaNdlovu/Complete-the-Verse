package app.completetheverse.core.play

import app.completetheverse.core.bank.Verse
import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob

object Tutorial {
    val CHOICE = Verse(
        id = "tutorial-choice",
        b = "Psalms",
        r = "Psalm 23:1",
        t = 1,
        p = "The LORD is my shepherd; I",
        a = "shall not want",
        s = ".",
        d = listOf("shall not fear", "shall not faint", "shall not wander"),
    )
    val PASSAGE_REF = Verse(
        id = "tutorial-passage-ref",
        b = "Proverbs",
        r = "Proverbs 3:5",
        t = 1,
        p = "Trust in the LORD with all thine heart; and lean not unto thine",
        a = "own understanding",
        s = ".",
        d = listOf("carnal wisdom", "earthly counsel", "proud imagination"),
    )
    val CLOZE = Verse(
        id = "tutorial-cloze",
        b = "Genesis",
        r = "Genesis 1:1",
        t = 1,
        p = "In the beginning",
        a = "God created the heaven and the earth",
        s = ".",
        d = listOf("the Word formed the light and land", "the Almighty established the deep"),
    )
    val DUEL = Verse(
        id = "tutorial-duel",
        b = "John",
        r = "John 1:1",
        t = 1,
        p = "In the beginning was the Word, and the Word was with God, and the Word",
        a = "was God",
        s = ".",
        d = listOf("was divine", "became flesh", "dwelt in light"),
    )
    val FADE = Verse(
        id = "tutorial-fade",
        b = "Philippians",
        r = "Philippians 4:13",
        t = 1,
        p = "I can do all things through Christ which",
        a = "strengtheneth me",
        s = ".",
        d = listOf("keepeth me", "comforteth me", "teacheth me"),
    )
    val ASSEMBLE = Verse(
        id = "tutorial-assemble",
        b = "Psalms",
        r = "Psalm 118:24",
        t = 1,
        p = "This is the day which the LORD hath made; we will",
        a = "rejoice and be glad in it",
        s = ".",
        d = listOf("sing and give thanks", "stand and praise his name", "remember and be glad"),
        typed = true,
    )

    val QUESTIONS: List<PlayQuestion> = listOf(
        PlayQuestion(Mechanic.Mcq, CHOICE),
        PlayQuestion(Mechanic.PassageRef, PASSAGE_REF),
        PlayQuestion(Mechanic.Cloze, CLOZE),
        PlayQuestion(Mechanic.Duel, DUEL),
        PlayQuestion(Mechanic.Fade, FADE),
        PlayQuestion(Mechanic.Assemble, ASSEMBLE),
    )

    val GUIDE: List<String> = listOf(
        "Lesson 1 · Recognition: Choose the phrase that completes the verse.",
        "Lesson 2 · Name the Passage: Select its book, chapter, and verse.",
        "Lesson 3 · Scribe's Cloze: Tap the missing words in sequence from the tray below.",
        "Lesson 4 · True Scripture Duel: Discern and choose the genuine King James reading.",
        "Lesson 5 · Fade-to-Memory: Memorize the whole verse — tap I'm Done when you hold it, then choose the true King James line.",
        "Lesson 6 · Assembled Recall: Drag or tap the words in order, then lock your answer.",
    )

    fun isDone(save: SaveBlob): Boolean = Save.tutorialDone(save)

    fun markDone(save: SaveBlob): SaveBlob = Save.markTutorialDone(save)

    fun wrapSave(blob: SaveBlob, info: PlayFinishInfo): SaveBlob =
        if (info.reason == "complete") markDone(blob) else blob
}
