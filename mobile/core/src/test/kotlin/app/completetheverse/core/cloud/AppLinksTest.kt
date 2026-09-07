package app.completetheverse.core.cloud

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class AppLinksTest {
    @Test
    fun hostMatchesTheLiveSite() {
        assertEquals("complete-the-verse.vercel.app", AppLinks.HOST)
        assertEquals("https://complete-the-verse.vercel.app", AppLinks.ORIGIN)
        assertEquals("completetheverse", AppLinks.SCHEME)
        assertTrue(AppLinks.isHttpsHost("complete-the-verse.vercel.app"))
        assertTrue(AppLinks.isCustomScheme("completetheverse"))
        assertTrue(AppLinks.isAppLink("https", AppLinks.HOST))
        assertTrue(AppLinks.isAppLink(AppLinks.SCHEME, "auth"))
    }

    @Test
    fun authUrlsAreDetected() {
        assertTrue(AppLinks.looksLikeAuth("https://complete-the-verse.vercel.app/auth#access_token=abc"))
        assertTrue(AppLinks.looksLikeAuth("completetheverse://auth?token=123456"))
        assertTrue(AppLinks.looksLikeAuth("https://complete-the-verse.vercel.app/#access_token=x&type=magiclink"))
        assertFalse(AppLinks.looksLikeAuth("https://complete-the-verse.vercel.app/"))
        assertFalse(AppLinks.looksLikeAuth("https://complete-the-verse.vercel.app/auth"))
        assertFalse(AppLinks.looksLikeAuth("https://complete-the-verse.vercel.app/?code=pkce"))
        assertFalse(AppLinks.looksLikeAuth("https://complete-the-verse.vercel.app/?type=email"))
        assertFalse(AppLinks.looksLikeAuth("https://complete-the-verse.vercel.app/#type=magiclink"))
        assertFalse(AppLinks.looksLikeAuth(null))
    }

    @Test
    fun friendRaceParsesHashAndQuery() {
        assertEquals("AB3K9", FriendRace.parseRaceCodeFromUrl("https://complete-the-verse.vercel.app/#race=AB3K9"))
        assertEquals("AB3K9", FriendRace.parseRaceCodeFromUrl("https://complete-the-verse.vercel.app/?race=ab3k9"))
        assertEquals("AB3K9", FriendRace.parseRaceCodeFromUrl("#race=AB3K9"))
        assertNull(FriendRace.parseRaceCodeFromUrl("https://complete-the-verse.vercel.app/"))
        assertNull(FriendRace.parseRaceCodeFromUrl("https://complete-the-verse.vercel.app/#trace=AB3K9"))
        val code = FriendRace.generateRoomCode(5)
        assertEquals(5, code.length)
        assertTrue(code.all { it in FriendRace.ROOM_ALPHABET })
        assertTrue(FriendRace.formatRaceUrl("ab3k9").endsWith("#race=AB3K9"))
    }
}
