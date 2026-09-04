package app.completetheverse.core.assemble

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class AssembleTest {
    private fun rng(): () -> Double {
        var i = 0
        return {
            i = (i * 9301 + 49297) % 233280
            i / 233280.0
        }
    }

    @Test
    fun buildKeepsTargetAndAddsFakes() {
        val st = Assemble.build(
            "still small voice",
            listOf("mighty rushing wind", "great and strong wind", "earthquake and fire"),
            rng(),
        )
        assertEquals("still small voice", st.target.joinToString(" "))
        assertEquals(3, st.placed.size)
        assertTrue(st.target.all { w -> st.bank.any { it.word == w } })
        assertEquals(Assemble.fakeCount(3), st.bank.size - st.target.size)
        assertTrue(st.bank.filter { it.dest < 0 }.all { it.word !in st.target })
    }

    @Test
    fun shortPhraseGetsTwoFakes() {
        val st = Assemble.build("the world", listOf("the earth", "all flesh", "the nations"), rng())
        assertEquals(2, Assemble.fakeCount(2))
        assertEquals(4, st.bank.size)
    }

    @Test
    fun placeJoinFillAndExactGrade() {
        val st = Assemble.build(
            "heaven and the earth",
            listOf("heavens and the earth", "earth and the heaven", "the world and the earth"),
            rng(),
        )
        val heaven = st.bank.first { it.word == "heaven" }
        Assemble.place(st, heaven.id, 0)
        assertEquals("heaven", Assemble.join(st.placed))
        assertFalse(Assemble.isFilled(st))
        st.target.forEachIndexed { i, w ->
            val tile = st.bank.first { it.word == w && it.dest == i }
            Assemble.place(st, tile.id, i)
        }
        assertEquals("heaven and the earth", Assemble.join(st.placed))
        assertTrue(Assemble.isFilled(st))
        assertEquals("heaven and the earth", Assemble.join(st.placed))
    }

    @Test
    fun fakeWordInPhraseIsWrong() {
        val st = Assemble.build("heaven and the earth", listOf("heavens and the earth"), rng())
        val heavens = st.bank.firstOrNull { it.word == "heavens" }
        val and = st.bank.first { it.word == "and" }
        val the = st.bank.first { it.word == "the" }
        val earth = st.bank.first { it.word == "earth" }
        if (heavens != null) Assemble.place(st, heavens.id, 0)
        Assemble.place(st, and.id, 1)
        Assemble.place(st, the.id, 2)
        Assemble.place(st, earth.id, 3)
        assertTrue(Assemble.join(st.placed) != "heaven and the earth")
    }

    @Test
    fun unplaceClearsSlot() {
        val st = Assemble.build("keep thee", listOf("bless thee", "hold thee", "save thee"), rng())
        val first = st.bank[0]
        Assemble.place(st, first.id, 0)
        Assemble.unplace(st, 0)
        assertNull(st.placed[0])
        assertTrue(Assemble.remaining(st).any { it.id == first.id })
    }

    @Test
    fun sameRngSameBankOrder() {
        val a = Assemble.build("still small voice", listOf("mighty rushing wind")) { 0.1 }
        val b = Assemble.build("still small voice", listOf("mighty rushing wind")) { 0.1 }
        assertEquals(a.bank.map { it.id }.joinToString(","), b.bank.map { it.id }.joinToString(","))
    }

    @Test
    fun buildExactHasNoFakesAndShuffles() {
        val st = Assemble.buildExact("And the earth was without form and void.") { 0.1 }
        assertEquals("And the earth was without form and void.", st.target.joinToString(" "))
        assertEquals(st.target.size, st.bank.size)
        assertTrue(st.bank.map { it.word }.joinToString(" ") != st.target.joinToString(" "))
    }

    @Test
    fun giftLockedCannotBeUnplaced() {
        val st = Assemble.buildExact("And the earth was without form and void.") { 0.42 }
        Assemble.giftLocked(st) { 0.42 }
        val lockedCount = st.locked?.size ?: 0
        assertTrue(lockedCount in 2..3)
        st.locked!!.keys.forEach { slot ->
            assertTrue(st.placed[slot] != null && st.placed[slot]!!.dest == slot)
        }
        val firstLocked = st.locked!!.keys.first()
        val before = st.placed[firstLocked]
        Assemble.unplace(st, firstLocked)
        assertEquals(before, st.placed[firstLocked])
        assertNull(Assemble.build("still small voice", listOf("wind"), rng()).locked)
    }

    @Test
    fun twoWordVerseLocksBoth() {
        val short = Assemble.buildExact("the world") { 0.5 }
        Assemble.giftLocked(short) { 0.5 }
        assertEquals(2, short.locked?.size ?: 0)
    }

    @Test
    fun resolveTapPlaceLiftSwapCancelReplace() {
        val st = Assemble.build("still small voice", listOf("mighty rushing wind"), rng())
        val still = st.bank.first { it.word == "still" }

        var r = Assemble.resolveTap(st, TapTarget(tileId = still.id))
        assertEquals("place", r!!.kind)
        assertEquals("still", st.placed[0]?.word)

        r = Assemble.resolveTap(st, TapTarget(slot = 0))
        assertEquals("lift", r!!.kind)
        assertNotNull(Assemble.liftedTile(st))
        assertEquals(still.id, Assemble.liftedTile(st)!!.id)

        val fake = st.bank.first { it.dest < 0 }
        Assemble.place(st, fake.id, 2)
        r = Assemble.resolveTap(st, TapTarget(slot = 2))
        assertEquals("swap", r!!.kind)
        assertEquals("still", st.placed[2]!!.word)
        assertEquals(fake.word, st.placed[0]!!.word)
        assertNull(Assemble.liftedTile(st))

        Assemble.resolveTap(st, TapTarget(slot = 2))
        r = Assemble.resolveTap(st, TapTarget(slot = 2))
        assertEquals("cancel", r!!.kind)
        assertEquals("still", st.placed[2]!!.word)

        val st2 = Assemble.buildExact("And God saw the light") { 0.5 }
        st2.target.forEachIndexed { i, w ->
            val tile = st2.bank.first { it.word == w && it.dest == i }
            Assemble.place(st2, tile.id, i)
        }
        assertNull(st2.bank.firstOrNull { t -> st2.placed.none { p -> p != null && p.id == t.id } })
        Assemble.unplace(st2, 3)
        val bankTile = Assemble.remaining(st2)[0]
        Assemble.lift(st2, bankTile.id)
        val occupant = st2.placed[1]
        val res = Assemble.resolveTap(st2, TapTarget(slot = 1))
        assertEquals("replace", res!!.kind)
        assertEquals(occupant!!.id, res.evicted!!.id)
        assertEquals(bankTile.id, st2.placed[1]!!.id)
        assertTrue(Assemble.remaining(st2).any { it.id == res.evicted.id })
        assertNull(Assemble.liftedTile(st2))
    }

    @Test
    fun keyboardStyleSwapReorders() {
        val st = Assemble.build("heaven and earth", emptyList(), rng())
        val heaven = st.bank.first { it.word == "heaven" }
        val and = st.bank.first { it.word == "and" }
        Assemble.resolveTap(st, TapTarget(tileId = heaven.id))
        Assemble.resolveTap(st, TapTarget(tileId = and.id))
        Assemble.resolveTap(st, TapTarget(slot = 1))
        Assemble.resolveTap(st, TapTarget(slot = 0))
        assertEquals("and heaven", Assemble.join(st.placed))
    }
}
