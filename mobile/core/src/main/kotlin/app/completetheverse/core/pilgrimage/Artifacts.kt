package app.completetheverse.core.pilgrimage

import app.completetheverse.core.save.SaveBlob
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.doubleOrNull

data class Artifact(
    val id: String,
    val siteId: String,
    val name: String,
    val era: String = "",
    val blurb: String = "",
    val scripture: String = "",
)

data class ArtifactStore(
    val unlocked: Map<String, Long> = emptyMap(),
    val seen: Map<String, Boolean> = emptyMap(),
)

data class ArtifactUnlock(
    val store: ArtifactStore,
    val artifact: Artifact?,
    val firstUnlock: Boolean,
)

object Artifacts {
    val all: List<Artifact> = listOf(
        Artifact("ziggurat-ur", "ur", "Brick of the Ziggurat", "c. 2100 BC", "A stamped mud-brick from the moon-god temple platform Abraham left behind.", "Genesis 11:31"),
        Artifact("beehive-haran", "haran", "Harran Seal Impression", "c. 1900 BC", "A merchant's seal from the Balikh crossroads where Terah settled.", "Genesis 12:4"),
        Artifact("well-shechem", "shechem", "Shard from Jacob's Well", "Iron Age · tradition", "Stone from the deep well in the pass between Ebal and Gerizim.", "Genesis 12:7"),
        Artifact("stone-bethel", "bethel", "Pillow Stone of Bethel", "Patriarchal tradition", "A rough stone like the one Jacob set up as a pillar after the ladder vision.", "Genesis 28:16"),
        Artifact("ford-penuel", "penuel", "Jabbok Ford Pebble", "Patriarchal tradition", "A smooth river stone from the lonely ford where Jacob wrestled till daybreak.", "Genesis 32:30"),
        Artifact("cave-hebron", "hebron", "Machpelah Token", "c. 1850 BC – present", "A token of the cave Abraham bought as the first owned piece of the land.", "Genesis 13:18"),
        Artifact("altar-beersheba", "beersheba", "Four-Horned Altar Horn", "c. 8th c. BC", "A reconstructed horn from the dismantled altar found at Tel Beer-sheba.", "Genesis 21:31"),
        Artifact("thicket-moriah", "moriah", "Thicket Horn of Moriah", "Patriarchal tradition", "A ram's horn caught in dry thorn — the substitute on the ridge that became Zion.", "Genesis 22:14"),
        Artifact("pit-dothan", "dothan", "Cistern Shard of Dothan", "c. 1700 BC", "A rope-scored rim from a dry cistern like the pit Joseph was thrown into.", "Genesis 37:24"),
        Artifact("sandal-midian", "midian", "Sandal of Midian", "c. 1280 BC", "A worn sandal for the ground Moses was told to take his shoes from.", "Exodus 3:5"),
        Artifact("brick-goshen", "goshen", "Nile Delta Brick", "c. 1700 – 1250 BC", "A straw-tempered brick from the Semitic quarter of the eastern delta.", "Exodus 12:37"),
        Artifact("wheel-yam-suph", "yam-suph", "Chariot Wheel of the Sea", "c. 1250 BC", "A salt-crusted wheel fragment for the chariots the sea took back.", "Exodus 14:21"),
        Artifact("tablet-sinai", "sinai", "Tablet of the Covenant", "c. 1250 BC (tradition)", "A symbolic fragment of the Law given in fire on the mountain.", "Exodus 19:18"),
        Artifact("staff-rephidim", "rephidim", "Staff of the Rock", "Exodus tradition", "A staff-mark of the place where water came from the rock and Amalek was held off.", "Exodus 17:6"),
        Artifact("spy-kadesh", "kadesh", "Spy's Cluster Token", "c. 1250 BC", "A copper amulet recalling the cluster the spies brought back — and the fear that followed.", "Numbers 13:26"),
        Artifact("vista-nebo", "nebo", "Mosaic of Nebo", "Byzantine (site memory)", "A tessera from the mountain where Moses saw the land he would not enter.", "Deuteronomy 34:4"),
        Artifact("trumpet-jericho", "jericho", "Ram's Horn of Jericho", "Conquest tradition", "A shofar-form horn for the city whose walls fell at the trumpet blast.", "Joshua 6:20"),
        Artifact("stone-gilgal", "gilgal", "Twelve-Stone Marker", "c. 1210 BC", "One of twelve stones lifted from the riverbed as a sign after the crossing.", "Joshua 5:9"),
        Artifact("pitcher-harod", "harod", "Broken Pitcher of Harod", "c. 1150 BC", "A shattered pitcher of the kind Gideon's three hundred broke to show the torches.", "Judges 7:7"),
        Artifact("jawbone-zorah", "zorah", "Jawbone of the Hill", "c. 1100 BC", "A weathered jawbone for the Nazirite of Zorah.", "Judges 16:28"),
        Artifact("lot-gibeah", "gibeah", "Lot Stone of Gibeah", "c. 1100 BC", "A lot-stone from the hill where there was no king in Israel.", "Judges 21:25"),
        Artifact("ebenezer-mizpah", "mizpah", "Ebenezer Stone", "c. 1050 BC", "A memorial chip for the stone Samuel named Ebenezer.", "1 Samuel 7:12"),
        Artifact("lyre-jerusalem", "jerusalem", "Psalm Lyre Peg", "Monarchy", "A lyre peg in the style of instruments that filled David's city with song.", "2 Samuel 5:7"),
        Artifact("lamp-shiloh", "shiloh", "Tabernacle Lamp Fragment", "c. 1200 – 1050 BC", "A lamp from the ridge where the tabernacle rested before Zion.", "Joshua 18:1"),
        Artifact("cedar-tyre", "tyre", "Cedar Beam Chip", "Solomonic age", "A chip of the cedar trade that built the Temple.", "1 Kings 5:1"),
        Artifact("ivory-samaria", "samaria", "Ivory Inlay", "c. 9th – 8th c. BC", "An ivory plaque fragment from Omri's hill capital — condemned by the prophets.", "2 Kings 17:6"),
        Artifact("altar-carmel", "carmel", "Carmel Altar Stone", "c. 860 BC", "A fire-blackened altar fragment from the ridge where fire fell.", "1 Kings 18:38"),
        Artifact("gate-megiddo", "megiddo", "Solomonic Gate Stone", "c. 10th – 7th c. BC", "An ashlar from the fortress that commands the Jezreel pass.", "2 Kings 23:29"),
        Artifact("arrow-lachish", "lachish", "Siege Arrow of Lachish", "c. 701 BC", "A socketed arrowhead from Judah's second city under Sennacherib.", "2 Kings 18:13"),
        Artifact("river-damascus", "damascus", "Barada Water Flask", "Aramaean age", "A flask for the rivers Naaman preferred to the Jordan.", "2 Kings 5:12"),
        Artifact("library-nineveh", "nineveh", "Library Tablet of Nineveh", "c. 7th c. BC", "A clay tablet in the tradition of Ashurbanipal's great library.", "Jonah 3:3"),
        Artifact("ishtar-babylon", "babylon", "Ishtar Gate Lion Tile", "c. 6th c. BC", "A blue-glazed lion tile from Nebuchadnezzar's processional way.", "Psalm 137:1"),
        Artifact("seal-susa", "susa", "Royal Seal of Shushan", "Achaemenid", "A court seal of the kind that signed decrees of life and death.", "Esther 1:2"),
        Artifact("manger-bethlehem", "bethlehem", "Manger Straw Ring", "c. 5 BC", "A simple ring of wood and straw for the village Micah named.", "Luke 2:7"),
        Artifact("scroll-nazareth", "nazareth", "Synagogue Scroll Roller", "1st c. AD", "A scroll roller from the kind of synagogue where he stood up to read.", "Luke 4:16"),
        Artifact("shell-jordan", "jordan", "Baptism Shell", "c. AD 27", "A shell from the river of the crossing and the baptism.", "Matthew 3:16"),
        Artifact("net-capernaum", "capernaum", "Galilee Net Weight", "1st c. AD", "A net weight from the lakeside base of the ministry.", "Matthew 4:19"),
        Artifact("shroud-golgotha", "golgotha", "Linen of the Empty Tomb", "c. AD 30", "A fold of burial linen for the place of a skull — and the empty garden tomb.", "Luke 24:6"),
        Artifact("bread-emmaus", "emmaus", "Broken Bread Token", "c. AD 30", "A bread stamp for the evening when he was known in the breaking.", "Luke 24:32"),
        Artifact("scales-damascus", "damascus-road", "Blindness Scale", "c. AD 34", "Scales that fall — a token of the light that stopped Saul short of the gate.", "Acts 9:4"),
        Artifact("name-antioch", "antioch", "Christian Name Plaque", "c. AD 40 – 60", "A plaque for the city where the disciples were first called Christians.", "Acts 11:26"),
        Artifact("scroll-ephesus", "ephesus", "Burned Magic Scroll", "c. AD 52 – 55", "A charred scroll end from the books burned when the word prevailed.", "Acts 19:20"),
        Artifact("bema-corinth", "corinth", "Bema Judgment Seat", "c. AD 50 – 57", "A chip from the bema where Paul was brought before Gallio.", "1 Corinthians 13:13"),
        Artifact("chain-philippi", "philippi", "Prison Chain Link", "c. AD 49", "A chain link for the midnight hymns that shook a jail.", "Acts 16:9"),
        Artifact("chain-rome", "rome", "House-Arrest Chain", "c. AD 60 – 62", "A light chain of the kind worn under house arrest while the word ran free.", "Acts 28:31"),
        Artifact("ink-patmos", "patmos", "Inkhorn of the Apocalypse", "c. AD 95", "An inkhorn for the last book, written on a prison island.", "Revelation 21:1"),
    )

    private val bySite: Map<String, Artifact> = all.associateBy { it.siteId }
    private val byId: Map<String, Artifact> = all.associateBy { it.id }

    fun count(): Int = all.size
    fun forSite(siteId: String): Artifact? = bySite[siteId]
    fun byId(id: String): Artifact? = byId[id]
    fun assetPath(artifact: Artifact): String = "artifacts/${artifact.id}.png"
    fun assetPath(id: String): String = "artifacts/$id.png"

    fun blank(): ArtifactStore = ArtifactStore()

    fun fromSave(save: SaveBlob): ArtifactStore {
        val bag = save["artifacts"] as? JsonObject ?: return blank()
        return normalize(bag)
    }

    fun normalize(store: JsonObject?): ArtifactStore {
        if (store == null) return blank()
        return ArtifactStore(
            unlocked = longMap(store["unlocked"] as? JsonObject),
            seen = boolMap(store["seen"] as? JsonObject),
        )
    }

    fun normalize(store: ArtifactStore?): ArtifactStore =
        ArtifactStore(
            unlocked = store?.unlocked ?: emptyMap(),
            seen = store?.seen ?: emptyMap(),
        )

    fun writeSave(save: SaveBlob, store: ArtifactStore): SaveBlob {
        val out = save.toMutableMap()
        out["artifacts"] = toJson(store)
        return JsonObject(out)
    }

    fun toJson(store: ArtifactStore): JsonObject {
        val unlocked = store.unlocked.mapValues { (_, v) -> JsonPrimitive(v) as kotlinx.serialization.json.JsonElement }
        val seen = store.seen.mapValues { (_, v) -> JsonPrimitive(v) as kotlinx.serialization.json.JsonElement }
        return JsonObject(
            mapOf(
                "unlocked" to JsonObject(unlocked),
                "seen" to JsonObject(seen),
            ),
        )
    }

    fun isUnlocked(store: ArtifactStore, artifactId: String): Boolean =
        store.unlocked.containsKey(artifactId)

    fun unlockedList(store: ArtifactStore): List<Artifact> =
        all.filter { store.unlocked.containsKey(it.id) }

    fun unlockedCount(store: ArtifactStore): Int = unlockedList(store).size

    fun unlockForSite(store: ArtifactStore, siteId: String, at: Long): ArtifactUnlock {
        val next = normalize(store)
        val a = forSite(siteId)
        if (a == null) return ArtifactUnlock(next, null, false)
        if (next.unlocked.containsKey(a.id)) {
            return ArtifactUnlock(next, a, false)
        }
        val unlocked = next.unlocked.toMutableMap()
        unlocked[a.id] = if (at != 0L) at else System.currentTimeMillis()
        return ArtifactUnlock(next.copy(unlocked = unlocked), a, true)
    }

    fun markSeen(store: ArtifactStore, artifactId: String): ArtifactStore {
        val next = normalize(store)
        if (!next.unlocked.containsKey(artifactId)) return next
        val seen = next.seen.toMutableMap()
        seen[artifactId] = true
        return next.copy(seen = seen)
    }

    fun unseenUnlocks(store: ArtifactStore): List<Artifact> =
        all.filter { store.unlocked.containsKey(it.id) && store.seen[it.id] != true }

    private fun longMap(obj: JsonObject?): Map<String, Long> {
        if (obj == null) return emptyMap()
        val out = linkedMapOf<String, Long>()
        for ((k, v) in obj) {
            val p = v as? JsonPrimitive ?: continue
            val n = p.doubleOrNull ?: p.content.toLongOrNull()?.toDouble() ?: continue
            out[k] = n.toLong()
        }
        return out
    }

    private fun boolMap(obj: JsonObject?): Map<String, Boolean> {
        if (obj == null) return emptyMap()
        val out = linkedMapOf<String, Boolean>()
        for ((k, v) in obj) {
            val p = v as? JsonPrimitive ?: continue
            out[k] = p.content == "true" || (p.doubleOrNull ?: 0.0) != 0.0
        }
        return out
    }
}
