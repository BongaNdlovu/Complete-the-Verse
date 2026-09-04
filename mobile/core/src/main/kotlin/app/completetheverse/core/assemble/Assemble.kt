package app.completetheverse.core.assemble

import kotlin.math.floor
import kotlin.random.Random

data class Tile(
    val id: String,
    val word: String,
    val dest: Int,
)

class AssembleBoard(
    val target: List<String>,
    var bank: List<Tile>,
    val placed: MutableList<Tile?>,
    var locked: MutableMap<Int, Boolean>? = null,
    var lifted: String? = null,
)

data class TapTarget(
    val tileId: String? = null,
    val slot: Int? = null,
)

data class TapResult(
    val kind: String,
    val evicted: Tile? = null,
)

object Assemble {
    val PAD: List<String> = listOf(
        "selah", "amen", "covenant", "mercy", "altar", "host", " ram", "forever", "truth", "zion",
    ).map { it.trim() }

    fun words(s: String?): List<String> =
        (s ?: "").trim().split(Regex("\\s+")).filter { it.isNotEmpty() }

    fun keyOf(w: String?): String =
        (w ?: "").lowercase().replace(Regex("[^a-z0-9']"), "")

    fun fakeCount(n: Int): Int = if (n <= 2) 2 else 3

    fun <T> shuffle(arr: List<T>, rng: (() -> Double)? = null): List<T> {
        val a = arr.toMutableList()
        val r = rng ?: { Random.nextDouble() }
        for (i in a.lastIndex downTo 1) {
            val j = floor(r() * (i + 1)).toInt()
            val t = a[i]
            a[i] = a[j]
            a[j] = t
        }
        return a
    }

    fun build(answer: String, distractors: List<String>?, rng: (() -> Double)? = null): AssembleBoard {
        val target = words(answer)
        val taken = mutableMapOf<String, Int>()
        target.forEach { w -> taken[keyOf(w)] = 1 }
        val fakes = distractorWords(distractors, taken).toMutableList()
        val need = fakeCount(target.size)
        var i = 0
        while (fakes.size < need && i < PAD.size) {
            val p = PAD[i++]
            if (taken[keyOf(p)] == null && p !in fakes) fakes.add(p)
        }
        val picked = shuffle(fakes, rng).take(need)
        val bank = target.mapIndexed { idx, w ->
            Tile(id = "t$idx", word = w, dest = idx)
        } + picked.mapIndexed { idx, w ->
            Tile(id = "f$idx", word = w, dest = -1)
        }
        return AssembleBoard(
            target = target,
            bank = shuffle(bank, rng),
            placed = MutableList(target.size) { null },
        )
    }

    fun buildExact(answer: String, rng: (() -> Double)? = null): AssembleBoard {
        val target = words(answer)
        val bank = target.mapIndexed { idx, w ->
            Tile(id = "t$idx", word = w, dest = idx)
        }
        return AssembleBoard(
            target = target,
            bank = shuffle(bank, rng),
            placed = MutableList(target.size) { null },
        )
    }

    fun tileById(state: AssembleBoard?, id: String?): Tile? {
        if (state == null || id == null) return null
        return state.bank.firstOrNull { it.id == id }
    }

    fun isLocked(state: AssembleBoard?, slot: Int): Boolean {
        val locked = state?.locked ?: return false
        return locked[slot] == true
    }

    fun giftLocked(state: AssembleBoard?, rng: (() -> Double)? = null): AssembleBoard? {
        if (state == null || state.target.isEmpty()) return state
        val n = state.target.size
        val r = rng ?: { Random.nextDouble() }
        val count = if (n <= 2) n else floor(r() * 2).toInt() + 2
        val indices = shuffle(state.target.indices.toList(), rng).take(count)
        state.locked = mutableMapOf()
        for (slot in indices) {
            state.locked!![slot] = true
            val tile = state.bank.firstOrNull { it.dest == slot }
            if (tile != null) state.placed[slot] = tile
        }
        return state
    }

    fun unplace(state: AssembleBoard?, slot: Int): AssembleBoard? {
        if (state == null || slot < 0 || slot >= state.placed.size) return state
        if (isLocked(state, slot)) return state
        state.placed[slot] = null
        return state
    }

    fun place(state: AssembleBoard?, bankId: String, slot: Int? = null): AssembleBoard? {
        if (state == null) return state
        val tile = tileById(state, bankId) ?: return state
        val already = state.placed.indexOf(tile)
        if (already >= 0) state.placed[already] = null
        val dest = if (slot == null || slot < 0) state.placed.indexOf(null) else slot
        if (dest < 0 || dest >= state.placed.size) return state
        if (isLocked(state, dest)) return state
        if (state.placed[dest] != null) state.placed[dest] = null
        state.placed[dest] = tile
        return state
    }

    fun join(placed: List<Tile?>?): String =
        (placed ?: emptyList()).map { p -> if (p != null && p.word.isNotEmpty()) p.word else "" }
            .filter { it.isNotEmpty() }
            .joinToString(" ")

    fun isFilled(state: AssembleBoard?): Boolean =
        state != null && state.placed.isNotEmpty() && state.placed.all { it != null }

    fun remaining(state: AssembleBoard?): List<Tile> {
        if (state == null) return emptyList()
        val used = mutableSetOf<String>()
        state.placed.forEach { p -> if (p != null) used.add(p.id) }
        return state.bank.filter { it.id !in used }
    }

    fun lift(state: AssembleBoard?, id: String): AssembleBoard? {
        if (state == null || tileById(state, id) == null) return null
        state.lifted = id
        return state
    }

    fun liftedTile(state: AssembleBoard?): Tile? =
        if (state?.lifted != null) tileById(state, state.lifted) else null

    fun resolveTap(state: AssembleBoard?, target: TapTarget?): TapResult? {
        if (state == null) return null
        val t = liftedTile(state)
        if (target != null && target.tileId != null) {
            if (t != null && t.id == target.tileId) {
                state.lifted = null
                return TapResult(kind = "cancel")
            }
            if (t != null) {
                state.lifted = target.tileId
                return TapResult(kind = "relift")
            }
            val firstEmpty = state.placed.indexOf(null)
            if (firstEmpty < 0) {
                state.lifted = target.tileId
                return TapResult(kind = "lift")
            }
            place(state, target.tileId, firstEmpty)
            return TapResult(kind = "place")
        }
        if (target != null && target.slot != null) {
            if (isLocked(state, target.slot)) return null
            if (t != null) {
                val from = state.placed.indexOf(t)
                val occupant = state.placed[target.slot]
                if (from >= 0 && from == target.slot) {
                    state.lifted = null
                    return TapResult(kind = "cancel")
                }
                if (from >= 0) {
                    state.placed[target.slot] = t
                    state.placed[from] = occupant
                    state.lifted = null
                    return TapResult(kind = "swap", evicted = null)
                }
                if (from < 0 && occupant != null) {
                    state.placed[target.slot] = t
                    state.lifted = null
                    return TapResult(kind = "replace", evicted = occupant)
                }
                place(state, t.id, target.slot)
                state.lifted = null
                return TapResult(kind = "place", evicted = null)
            }
            val occupant2 = state.placed[target.slot]
            if (occupant2 != null) {
                if (isLocked(state, target.slot)) return null
                state.lifted = occupant2.id
                return TapResult(kind = "lift")
            }
            return null
        }
        return null
    }

    private fun distractorWords(distractors: List<String>?, taken: Map<String, Int>): List<String> {
        val out = mutableListOf<String>()
        (distractors ?: emptyList()).forEach { d ->
            words(d).forEach { w ->
                val k = keyOf(w)
                if (k.isEmpty() || taken[k] != null) return@forEach
                if (w !in out) out.add(w)
            }
        }
        return out
    }
}
