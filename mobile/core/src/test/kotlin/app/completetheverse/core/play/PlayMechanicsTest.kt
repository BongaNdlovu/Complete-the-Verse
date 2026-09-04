package app.completetheverse.core.play

import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.bank.Bank
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class PlayMechanicsTest {
    private fun rng(): () -> Double {
        var i = 0
        return {
            i = (i * 9301 + 49297) % 233280
            i / 233280.0
        }
    }

    private val sichem = Verse(
        id = "mechanic-passage-ref",
        p = "And Abram passed through the land unto the place of",
        a = "Sichem",
        s = ".",
        d = listOf("Bethel"),
        r = "Genesis 12:6",
        b = "Genesis",
        t = 1,
    )

    @Test
    fun passageRefOffersFourUniqueCitationsIncludingAnswer() {
        val site = listOf(
            sichem,
            Verse(id = "site-ref-2", p = "p", a = "a", r = "Genesis 12:7", b = "Genesis"),
            Verse(id = "site-ref-3", p = "p", a = "a", r = "Genesis 13:4", b = "Genesis"),
            Verse(id = "site-ref-4", p = "p", a = "a", r = "Genesis 15:1", b = "Genesis"),
        )
        val choices = PlayMechanics.passageReferenceChoices(sichem, site, site, rng())
        assertEquals(4, choices.size)
        assertTrue(sichem.r in choices)
        assertEquals(4, choices.toSet().size)
        assertTrue(PlayMechanics.passageRefCorrect(sichem.r, sichem))
        assertFalse(PlayMechanics.passageRefCorrect("Genesis 12:7", sichem))
    }

    @Test
    fun fullPassageShowsTheAnswerAndHidesNothingOfTheVerse() {
        val passage = PlayMechanics.fullQuestionPassage(sichem)
        assertTrue(passage.contains("Sichem"))
        assertTrue(passage.contains("Abram"))
        assertTrue(passage.endsWith("Sichem."))
        assertFalse(passage.contains(sichem.r))
    }

    @Test
    fun clozeTapsWordsThenGrades() {
        val verse = Verse(
            id = "mechanic-cloze",
            p = "And God said",
            a = "Let there be light",
            s = ".",
            d = listOf("Let the earth be still"),
            r = "Genesis 1:3",
            b = "Genesis",
            t = 1,
        )
        val board = PlayMechanics.buildCloze(verse, rng())
        assertEquals(listOf("Let", "there", "be", "light"), board.words)
        assertTrue(board.bank.containsAll(board.words))
        assertTrue(board.bank.size > board.words.size)
        board.words.forEach { w -> assertTrue(board.pick(w)) }
        assertTrue(board.isComplete)
        assertTrue(PlayMechanics.clozeCorrect(board))
        val wrong = PlayMechanics.buildCloze(verse, rng())
        wrong.pick("earth")
        wrong.pick("Let")
        wrong.pick("there")
        wrong.pick("be")
        assertFalse(PlayMechanics.clozeCorrect(wrong))
    }

    @Test
    fun clozeUnfillSlotReopensTheChip() {
        val verse = Verse(
            id = "c",
            p = "p",
            a = "Let there be light",
            s = ".",
            d = listOf("still"),
            r = "r",
            b = "Genesis",
        )
        val board = PlayMechanics.buildCloze(verse) { 0.1 }
        board.pick("Let")
        board.pick("there")
        assertTrue(board.unfill(0))
        assertEquals(listOf("there"), board.filled)
        assertTrue(board.canSpend("Let"))
    }

    @Test
    fun duelLeftOrRightMatchesAnswer() {
        val verse = Verse(
            id = "mechanic-duel",
            p = "In the beginning was the Word, and the Word was with God, and the Word",
            a = "was God",
            s = ".",
            d = listOf("was divine"),
            r = "John 1:1",
            b = "John",
            t = 1,
        )
        val left = PlayMechanics.buildDuel(verse) { 0.0 }
        val right = PlayMechanics.buildDuel(verse) { 0.9 }
        assertTrue(left.leftVal == verse.a || left.rightVal == verse.a)
        assertTrue(PlayMechanics.duelCorrect(verse.a, left))
        assertFalse(PlayMechanics.duelCorrect("was divine", left))
        assertEquals(verse.a, if (right.leftVal == verse.a) right.leftVal else right.rightVal)
        assertTrue(left.leftText.contains("was God") || left.rightText.contains("was God"))
        assertTrue(left.leftText.contains("was divine") || left.rightText.contains("was divine"))
    }

    @Test
    fun fadeMemorizeThenPickIncludesTheWholeVerse() {
        val verse = Verse(
            id = "mechanic-fade",
            p = "And the earth was without form",
            a = "and void",
            s = ".",
            d = listOf("and empty"),
            r = "Genesis 1:2",
            b = "Genesis",
            t = 1,
        )
        val truth = PlayMechanics.fullVerseText(verse)
        assertEquals("And the earth was without form and void.", truth)
        val picks = PlayMechanics.fadePickChoices(verse, listOf(verse), rng())
        assertEquals(4, picks.size)
        assertTrue(truth in picks)
        assertEquals(4, picks.toSet().size)
        assertTrue(PlayMechanics.fadeCorrect(truth, verse))
        assertFalse(PlayMechanics.fadeCorrect(PlayMechanics.fadePhraseAsVerse(verse, "and empty"), verse))
    }

    @Test
    fun fadeLineEditsAreSingleWordNearMisses() {
        val truth = "And the earth was without form and void."
        val edits = PlayMechanics.fadeLineEdits(truth)
        assertTrue(edits.isNotEmpty())
        assertTrue("And a earth was without form and void." in edits)
        assertTrue(edits.all { it != truth })
    }

    @Test
    fun trueFalseGradesTheClaimNotTheVerse() {
        val claim = TfClaim(
            b = "Genesis",
            s = "Sarah was Abraham's wife.",
            t = 1,
            v = true,
            why = "God said: Sarah thy wife shall bear thee a son (Genesis 17:15-19).",
        )
        assertTrue(PlayMechanics.trueFalseCorrect(claim, pickedTrue = true, timedOut = false))
        assertFalse(PlayMechanics.trueFalseCorrect(claim, pickedTrue = false, timedOut = false))
        assertFalse(PlayMechanics.trueFalseCorrect(claim, pickedTrue = true, timedOut = true))
    }

    @Test
    fun pickClaimHonorsWantFalseAndAvoidsUsed() {
        val claims = listOf(
            TfClaim(b = "Genesis", s = "True one.", t = 1, v = true, why = "why (Genesis 1:1)"),
            TfClaim(b = "Genesis", s = "False one.", t = 1, v = false, why = "why (Genesis 1:2)"),
            TfClaim(b = "Exodus", s = "False two.", t = 1, v = false, why = "why (Exodus 1:1)"),
        )
        val picked = PlayMechanics.pickClaim(
            claims = claims,
            used = listOf(1),
            siteBooks = setOf("Genesis"),
            wantFalse = true,
            rng = { 0.0 },
        )
        assertNotNull(picked)
        assertFalse(picked.first.v)
        assertEquals(2, picked.second)
    }

    @Test
    fun mcqStillShufflesAnswerPlusThreeDistractors() {
        val verse = Verse(
            id = "v",
            p = "p",
            a = "heaven and the earth",
            s = ".",
            d = listOf("heavens and the earth", "earth and the heaven", "the world"),
            r = "Genesis 1:1",
            b = "Genesis",
            t = 1,
        )
        val choices = PlayMechanics.mcqChoices(verse, rng())
        assertEquals(4, choices.size)
        assertTrue(verse.a in choices)
        assertEquals(4, choices.toSet().size)
    }

    @Test
    fun assembleStillGradesJoinedTiles() {
        val verse = Verse(
            id = "v",
            p = "p",
            a = "heaven and the earth",
            s = ".",
            d = listOf("heavens and the earth"),
            r = "r",
            b = "Genesis",
        )
        val board = Assemble.build(verse.a, verse.d, rng())
        verse.a.split(" ").forEachIndexed { i, w ->
            val tile = board.bank.first { it.word == w && it.dest == i }
            Assemble.place(board, tile.id, i)
        }
        assertTrue(PlayMechanics.assembleMatches(board, verse.a))
    }

    @Test
    fun pilgrimageMechanicSlotsMatchJs() {
        assertEquals(Mechanic.PassageRef, PlayMechanics.pilgrimageMechanic(2, true))
        assertEquals(Mechanic.Cloze, PlayMechanics.pilgrimageMechanic(3, true))
        assertEquals(Mechanic.Duel, PlayMechanics.pilgrimageMechanic(4, true))
        assertEquals(Mechanic.Fade, PlayMechanics.pilgrimageMechanic(5, true))
        assertEquals(Mechanic.TrueFalse, PlayMechanics.pilgrimageMechanic(6, true))
        assertEquals(null, PlayMechanics.pilgrimageMechanic(6, false))
        assertEquals(null, PlayMechanics.pilgrimageMechanic(0, true))
    }

    @Test
    fun bankLoadsTfClaimsFromVersesJson() {
        val raw = javaClass.getResourceAsStream("/content/verses.json")!!.bufferedReader().use { it.readText() }
        val bank = Bank.parse(raw)
        assertTrue(bank.tfClaims.size >= 250)
        assertTrue(bank.tfClaims.any { it.v })
        assertTrue(bank.tfClaims.any { !it.v })
        val first = bank.tfClaims.first()
        assertTrue(first.s.isNotBlank())
        assertTrue(first.why.isNotBlank())
        assertTrue(first.b.isNotBlank())
    }
}
