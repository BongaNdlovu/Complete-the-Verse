package app.completetheverse.core.cloud

import kotlin.random.Random

object FriendRace {
    const val ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

    fun generateRoomCode(len: Int = 5, rng: Random = Random.Default): String {
        val n = len.coerceAtLeast(1)
        val out = StringBuilder(n)
        repeat(n) {
            out.append(ROOM_ALPHABET[rng.nextInt(ROOM_ALPHABET.length)])
        }
        return out.toString()
    }

    fun formatRaceUrl(roomCode: String, base: String = AppLinks.ORIGIN + "/"): String {
        val root = if (base.endsWith("/")) base else "$base/"
        return root + "#race=" + roomCode.uppercase().trim()
    }

    fun parseRaceCodeFromUrl(urlOrHash: String?): String? {
        if (urlOrHash.isNullOrBlank()) return null
        val m = Regex("""[#?&]race=([A-Z0-9]{5})""", RegexOption.IGNORE_CASE).find(urlOrHash)
        return m?.groupValues?.get(1)?.uppercase()
    }
}
