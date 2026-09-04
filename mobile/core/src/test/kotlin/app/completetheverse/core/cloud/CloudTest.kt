package app.completetheverse.core.cloud

import app.completetheverse.core.save.Save
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class CloudTest {
    @BeforeTest
    fun resetCloudState() {
        Cloud.setLastSubmitVia(null)
        Cloud.setBoardLoadFailed(null)
    }

    @Test
    fun guestIsNotSignedInWithoutInit() {
        assertEquals(false, Cloud.isSignedIn())
    }

    @Test
    fun configuredWithEmbeddedKeys() {
        assertTrue(Cloud.configured())
    }

    @Test
    fun mergeSaveTakesMaxUnionsAndPrefersLocalSettings() {
        val local = parse(
            """
            {
              "v": 3, "xp": 100, "oil": 4, "illumReserve": 1, "runs": 2, "seals": ["a"],
              "best": { "pilgrimage": 50, "daily": 10 },
              "life": { "correct": 5, "sitesCleared": 1 },
              "books": { "Genesis": { "c": 2, "a": 3 } },
              "verse": {},
              "srs": { "v1": { "reps": 1, "due": 10, "last": 1, "ef": 2.5, "ivl": 1, "lapses": 0 } },
              "daily": { "date": "2026-04-01", "score": 100 },
              "pilgrim": {
                "sites": { "ur": { "cleared": true, "best": 40, "bestAccuracy": 100, "attempts": 1, "clearedAt": 1, "perfect": true } },
                "lastPlayed": "ur", "started": 1, "usedIds": ["x"]
              },
              "set": { "music": 0.2, "diff": "watchman" },
              "board": []
            }
            """.trimIndent(),
        )
        val remote = parse(
            """
            {
              "v": 3, "xp": 80, "oil": 11, "illumReserve": 0, "runs": 5, "seals": ["b"],
              "best": { "pilgrimage": 70, "daily": 5 },
              "life": { "correct": 9, "sitesCleared": 0 },
              "books": { "Genesis": { "c": 1, "a": 4 }, "Exodus": { "c": 1, "a": 1 } },
              "verse": {},
              "srs": { "v1": { "reps": 3, "due": 20, "last": 5, "ef": 2.6, "ivl": 3, "lapses": 0 } },
              "daily": { "date": "2026-04-01", "score": 40 },
              "pilgrim": {
                "sites": {
                  "ur": { "cleared": true, "best": 10, "bestAccuracy": 50, "attempts": 2, "clearedAt": 1, "perfect": false },
                  "haran": { "cleared": false, "best": 5, "bestAccuracy": 20, "attempts": 1, "clearedAt": 0, "perfect": false }
                },
                "lastPlayed": "haran", "started": 1, "usedIds": ["y"]
              },
              "set": { "music": 0.9, "diff": "disciple" },
              "board": [{ "score": 1 }]
            }
            """.trimIndent(),
        )

        val m = Cloud.mergeSave(local, remote)
        assertEquals(100, m.int("xp"), "xp takes the max")
        assertEquals(11, m.int("oil"), "oil takes the max")
        assertEquals(1, m.int("illumReserve"), "illuminate reserve takes the max")
        assertEquals(5, m.int("runs"), "runs takes the max")
        val seals = m.arr("seals").map { it.jsonPrimitive.content }
        assertTrue("a" in seals && "b" in seals, "seals are unioned")
        assertEquals(70, m.obj("best").int("pilgrimage"), "best pilgrimage is max")
        assertEquals(100, m.obj("daily").int("score"), "daily score max same date")
        assertEquals(9, m.obj("life").int("correct"), "life correct max")
        assertEquals(1, m.obj("life").int("sitesCleared"), "sitesCleared max")
        assertTrue(m.obj("pilgrim").obj("sites").obj("ur").bool("cleared"), "ur stays cleared")
        assertEquals(40, m.obj("pilgrim").obj("sites").obj("ur").int("best"), "ur best max")
        assertEquals(2, m.obj("pilgrim").obj("sites").obj("ur").int("attempts"), "ur attempts max")
        assertNotNull(m.obj("pilgrim").obj("sites")["haran"], "haran survives from remote")
        val used = m.obj("pilgrim").arr("usedIds").map { it.jsonPrimitive.content }
        assertTrue("x" in used && "y" in used, "usedIds union")
        assertEquals(3, m.obj("srs").obj("v1").int("reps"), "srs prefers higher reps")
        assertEquals(0.2, m.obj("set").double("music"), 1e-9, "local music preferred")
        assertEquals(2, m.obj("books").obj("Genesis").int("c"), "books Genesis c max")
        assertEquals(4, m.obj("books").obj("Genesis").int("a"), "books Genesis a max")
        assertNotNull(m.obj("books")["Exodus"], "Exodus book kept")
    }

    @Test
    fun emptyRemoteKeepsLocalXp() {
        val onlyLocal = Cloud.mergeSave(
            parse(
                """
                {
                  "xp": 3, "seals": [], "best": {}, "life": {}, "books": {}, "verse": {},
                  "srs": {}, "pilgrim": { "sites": {}, "usedIds": [] }, "set": {}, "daily": {}, "board": []
                }
                """.trimIndent(),
            ),
            JsonObject(emptyMap()),
        )
        assertEquals(3, onlyLocal.int("xp"), "empty remote keeps local xp")
    }

    @Test
    fun mergeSaveKeepsBeatGoliathHeldTruthy() {
        val blob = parse(
            """
            {
              "life": { "beatGoliathHeld": true },
              "srs": { "keep": true },
              "best": {},
              "pilgrim": { "sites": {}, "usedIds": [] }
            }
            """.trimIndent(),
        )
        val m = Cloud.mergeSave(blob, blob)
        val held = m.obj("life")["beatGoliathHeld"]
        val truthy = held?.jsonPrimitive?.booleanOrNull == true ||
            (held.doubleVal() != 0.0)
        assertTrue(truthy, "beatGoliathHeld stays truthy after mergeSave with itself")
    }

    @Test
    fun mergeSaveDoesNotRePoisonBlitzWithOldComposite() {
        val local = parse(
            """
            {
              "v": 3, "xp": 1, "seals": [],
              "best": { "blitz": 14 },
              "life": { "blitzBest": 14 },
              "books": {}, "verse": {}, "srs": { "keep": true },
              "pilgrim": { "sites": {}, "usedIds": [] },
              "set": {}, "daily": {}, "board": []
            }
            """.trimIndent(),
        )
        val remote = parse(
            """
            {
              "v": 3, "xp": 1, "seals": [],
              "best": { "blitz": 5200 },
              "life": { "blitzBest": 0 },
              "books": {}, "verse": {}, "srs": { "keep": true },
              "pilgrim": { "sites": {}, "usedIds": [] },
              "set": {}, "daily": {}, "board": []
            }
            """.trimIndent(),
        )
        val m = Cloud.mergeSave(local, remote)
        assertEquals(14, m.obj("best").int("blitz"), "mergeSave does not re-poison blitz with old composite")
    }

    @Test
    fun trustLabelDirectIsHonorSystem() {
        assertEquals("Honor system", Cloud.trustLabel("direct"))
    }

    @Test
    fun trustLabelForEdgeIsNotHonorSystem() {
        assertEquals("Trusted", Cloud.trustLabel("edge"))
        assertTrue("Honor system" !in Cloud.trustLabel("edge"))
    }

    @Test
    fun trustLabelForNullIsEmpty() {
        assertEquals("", Cloud.trustLabel(null))
    }

    @Test
    fun lastSubmitViaReportsDirectAndTrustLabelMatches() {
        Cloud.setLastSubmitVia("direct")
        assertEquals("direct", Cloud.lastSubmitVia())
        assertTrue("Honor system" in Cloud.trustLabel(Cloud.lastSubmitVia()))
    }

    @Test
    fun lastSubmitViaReportsEdgeAndDoesNotShowHonorSystem() {
        Cloud.setLastSubmitVia("edge")
        assertEquals("edge", Cloud.lastSubmitVia())
        assertTrue("Honor system" !in Cloud.trustLabel(Cloud.lastSubmitVia()))
    }

    @Test
    fun tabletsMergeBestHeldOrAndKeepsBothSides() {
        val local = parse(
            """
            {
              "v": 3, "xp": 1, "seals": [], "best": {}, "life": {}, "books": {}, "verse": {},
              "srs": { "keep": true }, "pilgrim": { "sites": {}, "usedIds": [] }, "set": {}, "daily": {}, "board": [],
              "tablets": { "psalm23": { "best": 40, "held": false }, "exodus20": { "best": 10, "held": true } }
            }
            """.trimIndent(),
        )
        val remote = parse(
            """
            {
              "v": 3, "xp": 1, "seals": [], "best": {}, "life": {}, "books": {}, "verse": {},
              "srs": { "keep": true }, "pilgrim": { "sites": {}, "usedIds": [] }, "set": {}, "daily": {}, "board": [],
              "tablets": { "psalm23": { "best": 80, "held": true }, "john14": { "best": 50, "held": false } }
            }
            """.trimIndent(),
        )
        val m = Cloud.mergeSave(local, remote)
        assertEquals(80, m.obj("tablets").obj("psalm23").int("best"), "tablets best takes max")
        assertTrue(m.obj("tablets").obj("psalm23").bool("held"), "tablets held is or")
        assertTrue(m.obj("tablets").obj("exodus20").bool("held"), "local Hold kept")
        assertEquals(50, m.obj("tablets").obj("john14").int("best"), "remote chapter kept")
    }

    @Test
    fun authNoticeOffline() {
        assertEquals("You're offline. Try again when you reconnect.", Cloud.authNotice("offline"))
    }

    @Test
    fun authNoticeRateLimited() {
        assertEquals("Too many attempts. Wait a few minutes.", Cloud.authNotice("rate-limited"))
    }

    @Test
    fun authNoticeHidesUnknownErrors() {
        assertEquals("Check your email for the sign-in link.", Cloud.authNotice("User already registered"))
    }

    @Test
    fun authNoticeOtpExpired() {
        assertTrue("expired" in Cloud.authNotice("otp-expired"))
    }

    @Test
    fun boardLoadFailedIdle() {
        assertNull(Cloud.boardLoadFailed())
    }

    @Test
    fun verifyOtpExists() {
        val result = Cloud.verifyOtp("user@example.com", "123456")
        assertNotNull(result)
        assertFalse(result.ok)
        assertEquals("not-configured", result.reason)
    }

    @Test
    fun checkUrlAuthErrorExists() {
        assertNull(Cloud.checkUrlAuthError())
    }

    @Test
    fun guestsMustNeverFlushBlitz() {
        val save = parse("""{ "best": { "blitz": 14 } }""")
        assertFalse(Cloud.shouldFlushBlitz(signedIn = false, save = save))
    }

    @Test
    fun signedInFlushesBlitzWhenBestIsPositive() {
        val save = parse("""{ "best": { "blitz": 14 }, "set": { "diff": "watchman" } }""")
        assertTrue(Cloud.shouldFlushBlitz(signedIn = true, save = save))
        val payload = Cloud.blitzSubmitPayload(save)
        assertEquals("blitz", payload["kind"]?.jsonPrimitive?.contentOrNull)
        assertEquals(14, payload.int("score"))
        assertEquals(14, payload.int("correct"))
    }

    @Test
    fun signedInDoesNotFlushBlitzWhenBestIsZero() {
        val save = parse("""{ "best": { "blitz": 0 } }""")
        assertFalse(Cloud.shouldFlushBlitz(signedIn = true, save = save))
    }

    @Test
    fun mergeLoadedSaveFillsDefaultsAndKeepsProgress() {
        val loaded = Save.mergeLoadedSave(parse("""{ "xp": 9, "best": { "blitz": 4 } }"""))
        assertEquals(3, loaded.int("v"))
        assertEquals(9, loaded.int("xp"))
        assertEquals(4, loaded.obj("best").int("blitz"))
        assertEquals(0, loaded.obj("best").int("pilgrimage"))
        assertEquals(0.45, loaded.obj("set").double("music"), 1e-9)
        assertEquals("disciple", loaded.obj("set")["diff"]?.jsonPrimitive?.content)
    }

    @Test
    fun corruptRawRecoversDefaultAndStashesBroken() {
        val result = Save.loadFromRaw("{not json")
        assertEquals(Save.DEFAULT.int("xp"), result.save.int("xp"))
        assertEquals("{not json", result.brokenRaw)
    }

    @Test
    fun emptyRawLoadsDefault() {
        val result = Save.loadFromRaw(null)
        assertNull(result.brokenRaw)
        assertEquals(0, result.save.int("xp"))
        assertEquals(Save.SAVE_KEY, "ctv_save_v3")
    }

    @Test
    fun stringifyRoundTripKeepsXp() {
        val raw = Save.stringify(Save.mergeLoadedSave(parse("""{ "xp": 12 }""")))
        val loaded = Save.loadFromRaw(raw).save
        assertEquals(12, loaded.int("xp"))
        assertNull(Save.loadFromRaw(raw).brokenRaw)
    }

    private fun parse(raw: String): JsonObject = Json.parseToJsonElement(raw).jsonObject

    private fun JsonObject.obj(key: String): JsonObject = this[key]!!.jsonObject

    private fun JsonObject.arr(key: String): JsonArray = this[key]!!.jsonArray

    private fun JsonObject.int(key: String): Int = this[key].intVal()

    private fun JsonObject.double(key: String): Double = this[key].doubleVal()

    private fun JsonObject.bool(key: String): Boolean =
        this[key]?.jsonPrimitive?.booleanOrNull ?: false

    private fun JsonElement?.intVal(): Int = doubleVal().toInt()

    private fun JsonElement?.doubleVal(): Double {
        val p = this?.jsonPrimitive ?: return 0.0
        return p.doubleOrNull ?: p.content.toDoubleOrNull() ?: 0.0
    }
}
