/* ==================================================================
   ARTIFACTS — one historical relic per Pilgrimage site.

   Unlocked on first clear of that site. `image` is set only for the
   ship-set illustrated relics; others use a place-holder glyph until
   art is added. Pure data + helpers; no DOM.
   ================================================================== */

var ARTIFACTS = [
  /* Arc I */
  { id: "ziggurat-ur", siteId: "ur", name: "Brick of the Ziggurat",
    era: "c. 2100 BC", material: "Baked clay",
    find: "Great Ziggurat of Ur (Tell el-Muqayyar)",
    blurb: "A stamped mud-brick from the moon-god temple platform Abraham left behind.",
    detail: "Ur’s ziggurat rose in stepped terraces above the Euphrates plain. Bricks bore royal stamps; the platform still stands at Tell el-Muqayyar in Iraq.",
    scripture: "Genesis 11:31", hasArt: true },
  { id: "beehive-haran", siteId: "haran", name: "Harran Seal Impression",
    era: "c. 1900 BC", material: "Clay seal",
    find: "Harran mound & beehive dwellings",
    blurb: "A merchant’s seal from the Balikh crossroads where Terah settled.",
    detail: "Harran sat on the trade road north of Mesopotamia. Cone-shaped “beehive” houses still mark the region’s architecture.",
    scripture: "Genesis 12:4", hasArt: true },
  { id: "well-shechem", siteId: "shechem", name: "Shard from Jacob’s Well",
    era: "Iron Age · tradition", material: "Limestone",
    find: "Tell Balata · Jacob's Well",
    blurb: "Stone from the deep well in the pass between Ebal and Gerizim.",
    detail: "Shechem controlled the central highland pass. The well associated with Jacob remains a pilgrimage point beside Tell Balata.",
    scripture: "Genesis 12:7", hasArt: true },
  { id: "stone-bethel", siteId: "bethel", name: "Pillow Stone of Bethel",
    era: "Patriarchal tradition", material: "Fieldstone",
    find: "Beitin ridge settlement",
    blurb: "A rough stone like the one Jacob set up as a pillar after the ladder vision.",
    detail: "Bethel means “house of God.” Standing stones (masseboth) were common memorials in the highlands.",
    scripture: "Genesis 28:16", hasArt: true },
  { id: "ford-penuel", siteId: "penuel", name: "Jabbok Ford Pebble",
    era: "Patriarchal tradition", material: "River stone",
    find: "The Jabbok ford approaches",
    blurb: "A smooth river stone from the lonely ford where Jacob wrestled till daybreak.",
    detail: "The Jabbok (Zarqa) cuts east of the Jordan. Fords were night-crossing points — and places of encounter.",
    scripture: "Genesis 32:30", hasArt: true },
  { id: "cave-hebron", siteId: "hebron", name: "Machpelah Token",
    era: "c. 1850 BC – present", material: "Herodian stone",
    find: "Cave of Machpelah",
    blurb: "A token of the cave Abraham bought as the first owned piece of the land.",
    detail: "The Cave of the Patriarchs at Hebron is among the longest continuously revered tombs in the world.",
    scripture: "Genesis 13:18", hasArt: true },
  { id: "altar-beersheba", siteId: "beersheba", name: "Four-Horned Altar Horn",
    era: "c. 8th c. BC", material: "Sandstone",
    find: "Tel Sheva · four-horned altar",
    blurb: "A reconstructed horn from the dismantled altar found at Tel Beer-sheba.",
    detail: "Four-horned altars appear across Israelite sites; one at Beersheba was found broken and reused in a wall.",
    scripture: "Genesis 21:31", hasArt: true },
  { id: "thicket-moriah", siteId: "moriah", name: "Thicket Horn of Moriah",
    era: "Patriarchal tradition", material: "Horn & thorn",
    find: "Temple Mount · the threshing floor of Araunah",
    blurb: "A ram’s horn caught in dry thorn — the substitute on the ridge that became Zion.",
    detail: "Abraham named the place Jehovahjireh. Later Solomon built the Temple on the same mountain, called Moriah in Chronicles.",
    scripture: "Genesis 22:14", hasArt: true },
  { id: "pit-dothan", siteId: "dothan", name: "Cistern Shard of Dothan",
    era: "c. 1700 BC", material: "Limestone",
    find: "Tell Dothan",
    blurb: "A rope-scored rim from a dry cistern like the pit Joseph was thrown into.",
    detail: "Dothan sits on the north road. Joseph was sold from a pit here; Elisha’s servant later saw the hill full of horses and chariots of fire.",
    scripture: "Genesis 37:24", hasArt: true },

  /* Arc II */
  { id: "sandal-midian", siteId: "midian", name: "Sandal of Midian",
    era: "c. 1280 BC", material: "Leather",
    find: "Magha'ir Shu'ayb · the oasis of Al-Bad'",
    blurb: "A worn sandal for the ground Moses was told to take his shoes from.",
    detail: "Midian is where a fugitive shepherd turned aside to a bush that burned and was not consumed, and heard the name I AM.",
    scripture: "Exodus 3:5", hasArt: true },
  { id: "brick-goshen", siteId: "goshen", name: "Nile Delta Brick",
    era: "c. 1700 – 1250 BC", material: "Mud brick with straw",
    find: "Avaris (Tell el-Dab'a) & Pi-Ramesses",
    blurb: "A straw-tempered brick from the Semitic quarter of the eastern delta.",
    detail: "Excavations at Avaris show a large Asiatic population in the centuries before the Ramesside capital.",
    scripture: "Exodus 12:37", hasArt: true },
  { id: "wheel-yam-suph", siteId: "yam-suph", name: "Chariot Wheel of the Sea",
    era: "c. 1250 BC", material: "Bronze",
    find: "The Bitter Lakes corridor · traditional sea crossing",
    blurb: "A salt-crusted wheel fragment for the chariots the sea took back.",
    detail: "Yam Suph is the night the waters stood in a heap and a nation walked through on dry ground.",
    scripture: "Exodus 14:21", hasArt: true },
  { id: "tablet-sinai", siteId: "sinai", name: "Tablet of the Covenant",
    era: "c. 1250 BC (tradition)", material: "Stone",
    find: "Jebel Musa · St Catherine's plateau",
    blurb: "A symbolic fragment of the Law given in fire on the mountain.",
    detail: "Whether Jebel Musa or another peak, Sinai stands for the covenant — the highest moral ground on the road.",
    scripture: "Exodus 19:18", hasArt: true },
  { id: "staff-rephidim", siteId: "rephidim", name: "Staff of the Rock",
    era: "Exodus tradition", material: "Desert wood",
    find: "Wadi Feiran oasis approaches",
    blurb: "A staff-mark of the place where water came from the rock and Amalek was held off.",
    detail: "Rephidim is remembered for thirst, intercession, and the first battle of the wilderness generation.",
    scripture: "Exodus 17:6", hasArt: true },
  { id: "spy-kadesh", siteId: "kadesh", name: "Spy’s Cluster Token",
    era: "c. 1250 BC", material: "Copper",
    find: "Ain el-Qudeirat oasis fortress",
    blurb: "A copper amulet recalling the cluster the spies brought back — and the fear that followed.",
    detail: "Kadesh Barnea was Israel’s base for a generation; the oasis fortress still marks the largest spring in northern Sinai.",
    scripture: "Numbers 13:26", hasArt: true },
  { id: "vista-nebo", siteId: "nebo", name: "Mosaic of Nebo",
    era: "Byzantine (site memory)", material: "Tesserae",
    find: "Siyagha summit basilica",
    blurb: "A tessera from the mountain where Moses saw the land he would not enter.",
    detail: "Mount Nebo’s basilica preserves floor mosaics overlooking the Jordan valley and the Dead Sea.",
    scripture: "Deuteronomy 34:4", hasArt: true },
  { id: "trumpet-jericho", siteId: "jericho", name: "Ram’s Horn of Jericho",
    era: "Conquest tradition", material: "Ram’s horn",
    find: "Tell es-Sultan · Elisha's Spring",
    blurb: "A shofar-form horn for the city whose walls fell at the trumpet blast.",
    detail: "Jericho is among the oldest continuously inhabited places known, sitting 258 m below sea level.",
    scripture: "Joshua 6:20", hasArt: true },
  { id: "stone-gilgal", siteId: "gilgal", name: "Twelve-Stone Marker",
    era: "c. 1210 BC", material: "Jordan river stone",
    find: "The Jordan ford camps east of Jericho",
    blurb: "One of twelve stones lifted from the riverbed as a sign after the crossing.",
    detail: "Gilgal was the first camp west of Jordan — where the manna ceased and a generation was marked for the land.",
    scripture: "Joshua 5:9", hasArt: true },

  /* Arc III — The Judges */
  { id: "pitcher-harod", siteId: "harod", name: "Broken Pitcher of Harod",
    era: "c. 1150 BC", material: "Clay",
    find: "Ma'ayan Harod · the foot of Mount Gilboa",
    blurb: "A shattered pitcher of the kind Gideon’s three hundred broke to show the torches.",
    detail: "At the spring of Harod the host was thinned until only the men who lapped remained, then the shout: The sword of the LORD, and of Gideon.",
    scripture: "Judges 7:7", hasArt: true },
  { id: "jawbone-zorah", siteId: "zorah", name: "Jawbone of the Hill",
    era: "c. 1100 BC", material: "Bone",
    find: "Tel Tzora · Tel Batash (Timnah)",
    blurb: "A weathered jawbone for the Nazirite of Zorah.",
    detail: "Samson was born on this ridge and died pulling a house down on himself. Strength here was a vow, then a last prayer.",
    scripture: "Judges 16:28", hasArt: true },
  { id: "lot-gibeah", siteId: "gibeah", name: "Lot Stone of Gibeah",
    era: "c. 1100 BC", material: "Limestone",
    find: "Tell el-Ful",
    blurb: "A lot-stone from the hill where there was no king in Israel.",
    detail: "Gibeah closes Judges in darkness and later becomes Saul’s town. Every man did that which was right in his own eyes.",
    scripture: "Judges 21:25", hasArt: true },
  { id: "ebenezer-mizpah", siteId: "mizpah", name: "Ebenezer Stone",
    era: "c. 1050 BC", material: "Fieldstone",
    find: "Tell en-Nasbeh",
    blurb: "A memorial chip for the stone Samuel named Ebenezer.",
    detail: "Mizpah is the watchtower of the tribes. Hitherto hath the LORD helped us — the Judges end, and a king is asked for.",
    scripture: "1 Samuel 7:12", hasArt: true },

  /* Arc IV */
  { id: "lyre-jerusalem", siteId: "jerusalem", name: "Psalm Lyre Peg",
    era: "Monarchy", material: "Cedar & bronze",
    find: "Temple Mount · City of David",
    blurb: "A lyre peg in the style of instruments that filled David’s city with song.",
    detail: "Jerusalem became capital under David and the site of Solomon’s Temple — the heart of the kingdom.",
    scripture: "2 Samuel 5:7", hasArt: true },
  { id: "lamp-shiloh", siteId: "shiloh", name: "Tabernacle Lamp Fragment",
    era: "c. 1200 – 1050 BC", material: "Clay oil lamp",
    find: "Tel Shiloh · tabernacle platform",
    blurb: "A lamp from the ridge where the tabernacle rested before Zion.",
    detail: "Shiloh held the ark’s house for generations; Samuel heard his name called here in the night.",
    scripture: "Joshua 18:1", hasArt: true },
  { id: "cedar-tyre", siteId: "tyre", name: "Cedar Beam Chip",
    era: "Solomonic age", material: "Lebanese cedar",
    find: "Phoenician island harbour",
    blurb: "A chip of the cedar trade that built the Temple.",
    detail: "Hiram of Tyre supplied timber, gold, and craftsmen; Ezekiel later sang Tyre’s funeral as a merchant empire.",
    scripture: "1 Kings 5:1", hasArt: true },
  { id: "ivory-samaria", siteId: "samaria", name: "Ivory Inlay",
    era: "c. 9th – 8th c. BC", material: "Ivory",
    find: "Omride acropolis & ivory house",
    blurb: "An ivory plaque fragment from Omri’s hill capital — condemned by the prophets.",
    detail: "Samaria fell in 722 BC; its ivory-inlaid palace became a byword for luxury and judgment.",
    scripture: "2 Kings 17:6", hasArt: true },
  { id: "altar-carmel", siteId: "carmel", name: "Carmel Altar Stone",
    era: "c. 860 BC", material: "Basalt",
    find: "El-Muhraqa · the Carmel ridge",
    blurb: "A fire-blackened altar fragment from the ridge where fire fell.",
    detail: "Elijah rebuilt the altar in twelve stones, soaked it, and called. The God that answereth by fire, let him be God.",
    scripture: "1 Kings 18:38", hasArt: true },
  { id: "gate-megiddo", siteId: "megiddo", name: "Solomonic Gate Stone",
    era: "c. 10th – 7th c. BC", material: "Limestone",
    find: "Tel Megiddo · the great gate & stables",
    blurb: "A ashlar from the fortress that commands the Jezreel pass.",
    detail: "Megiddo’s gates and stables mark chariot cities; good king Josiah fell here. The valley later lent its name to Armageddon.",
    scripture: "2 Kings 23:29", hasArt: true },
  { id: "arrow-lachish", siteId: "lachish", name: "Siege Arrow of Lachish",
    era: "c. 701 BC", material: "Iron",
    find: "Tel Lachish · the Assyrian siege ramp",
    blurb: "A socketed arrowhead from Judah’s second city under Sennacherib.",
    detail: "The siege ramp still leans on the tell. Nineveh’s palace reliefs show the same assault from the other side.",
    scripture: "2 Kings 18:13", hasArt: true },
  { id: "river-damascus", siteId: "damascus", name: "Barada Water Flask",
    era: "Aramaean age", material: "Ceramic",
    find: "The Barada oasis & the old city walls",
    blurb: "A flask for the rivers Naaman preferred to the Jordan.",
    detail: "Damascus, watered by the Barada, was the northern rival through the age of the kings.",
    scripture: "2 Kings 5:12", hasArt: true },
  { id: "library-nineveh", siteId: "nineveh", name: "Library Tablet of Nineveh",
    era: "c. 7th c. BC", material: "Cuneiform clay",
    find: "Kuyunjik mound · palace of Sennacherib",
    blurb: "A clay tablet in the tradition of Ashurbanipal’s great library.",
    detail: "Nineveh held twelve kilometres of wall. Jonah preached repentance here; Nahum promised the fall of 612 BC.",
    scripture: "Jonah 3:3", hasArt: true },
  { id: "ishtar-babylon", siteId: "babylon", name: "Ishtar Gate Lion Tile",
    era: "c. 6th c. BC", material: "Glazed brick",
    find: "Ishtar Gate · Etemenanki ziggurat",
    blurb: "A blue-glazed lion tile from Nebuchadnezzar’s processional way.",
    detail: "Judah spent seventy years by this river. Daniel outlasted four kings in the capital of blue gates.",
    scripture: "Psalm 137:1", hasArt: true },
  { id: "seal-susa", siteId: "susa", name: "Royal Seal of Shushan",
    era: "Achaemenid", material: "Gold & carnelian",
    find: "Apadana palace of Darius",
    blurb: "A court seal of the kind that signed decrees of life and death.",
    detail: "Susa was the Persian winter capital. Esther became queen here; Nehemiah heard of Jerusalem’s broken walls.",
    scripture: "Esther 1:2", hasArt: true },

  /* Arc V */
  { id: "manger-bethlehem", siteId: "bethlehem", name: "Manger Straw Ring",
    era: "c. 5 BC", material: "Wood & straw",
    find: "Church of the Nativity",
    blurb: "A simple ring of wood and straw for the village Micah named.",
    detail: "Bethlehem is David’s town and the birthplace of David’s greater son — where promise takes a body.",
    scripture: "Luke 2:7", hasArt: true },
  { id: "scroll-nazareth", siteId: "nazareth", name: "Synagogue Scroll Roller",
    era: "1st c. AD", material: "Wood",
    find: "First-century village terraces & Mary's Well",
    blurb: "A scroll roller from the kind of synagogue where he stood up to read.",
    detail: "Nazareth was a small Galilean village of no reputation — thirty hidden years before the cliff.",
    scripture: "Luke 4:16", hasArt: true },
  { id: "shell-jordan", siteId: "jordan", name: "Baptism Shell",
    era: "c. AD 27", material: "River shell",
    find: "Bethany-beyond-Jordan · Qasr el-Yahud",
    blurb: "A shell from the river of the crossing and the baptism.",
    detail: "Here the heavens opened and a voice named the beloved Son before the public ministry began.",
    scripture: "Matthew 3:16", hasArt: true },
  { id: "net-capernaum", siteId: "capernaum", name: "Galilee Net Weight",
    era: "1st c. AD", material: "Basalt",
    find: "White limestone synagogue · Peter's house",
    blurb: "A net weight from the lakeside base of the ministry.",
    detail: "Capernaum was a customs post and fishing harbour — home water for most of the miracles.",
    scripture: "Matthew 4:19", hasArt: true },
  { id: "shroud-golgotha", siteId: "golgotha", name: "Linen of the Empty Tomb",
    era: "c. AD 30", material: "Linen",
    find: "Church of the Holy Sepulchre",
    blurb: "A fold of burial linen for the place of a skull — and the empty garden tomb.",
    detail: "Five hundred metres from the Temple Mount, this is the hinge the whole road has bent toward since Ur.",
    scripture: "Luke 24:6", hasArt: true },
  { id: "bread-emmaus", siteId: "emmaus", name: "Broken Bread Token",
    era: "c. AD 30", material: "Clay loaf stamp",
    find: "Emmaus Nicopolis basilica & Roman road",
    blurb: "A bread stamp for the evening when he was known in the breaking.",
    detail: "Threescore furlongs from Jerusalem — two walked away in disappointment and returned with burning hearts.",
    scripture: "Luke 24:32", hasArt: true },
  { id: "scales-damascus", siteId: "damascus-road", name: "Blindness Scale",
    era: "c. AD 34", material: "Bronze",
    find: "The southern approach to the old city",
    blurb: "Scales that fall — a token of the light that stopped Saul short of the gate.",
    detail: "Not the city but the road outside it: warrants in hand, then three days blind, then a missionary.",
    scripture: "Acts 9:4", hasArt: true },
  { id: "name-antioch", siteId: "antioch", name: "Christian Name Plaque",
    era: "c. AD 40 – 60", material: "Marble",
    find: "Grotto of St Peter",
    blurb: "A plaque for the city where the disciples were first called Christians.",
    detail: "Antioch launched the mission to the nations — Jew and Gentile at one table.",
    scripture: "Acts 11:26", hasArt: true },
  { id: "scroll-ephesus", siteId: "ephesus", name: "Burned Magic Scroll",
    era: "c. AD 52 – 55", material: "Papyrus (charred)",
    find: "Temple of Artemis · the great theatre",
    blurb: "A charred scroll end from the books burned when the word prevailed.",
    detail: "Two years in Ephesus shook Asia; silversmiths rioted over lost trade in Artemis statues.",
    scripture: "Acts 19:20", hasArt: true },
  { id: "bema-corinth", siteId: "corinth", name: "Bema Judgment Seat",
    era: "c. AD 50 – 57", material: "Marble",
    find: "The Bema · temple of Apollo · Acrocorinth",
    blurb: "A chip from the bema where Paul was brought before Gallio.",
    detail: "Corinth’s rough port straddled two seas; the letters back to it are the most practical in the New Testament.",
    scripture: "1 Corinthians 13:13", hasArt: true },
  { id: "chain-philippi", siteId: "philippi", name: "Prison Chain Link",
    era: "c. AD 49", material: "Iron",
    find: "The Roman forum · prison tradition · river baptism site",
    blurb: "A chain link for the midnight hymns that shook a jail.",
    detail: "First European landing of the gospel — Lydia by the river, a jailer at midnight, a letter that says rejoice.",
    scripture: "Acts 16:9", hasArt: true },
  { id: "chain-rome", siteId: "rome", name: "House-Arrest Chain",
    era: "c. AD 60 – 62", material: "Iron",
    find: "The Forum · the Mamertine prison",
    blurb: "A light chain of the kind worn under house arrest while the word ran free.",
    detail: "Acts ends mid-sentence in the capital — the message loose in the empire, the prisoner still talking.",
    scripture: "Acts 28:31", hasArt: true },
  { id: "ink-patmos", siteId: "patmos", name: "Inkhorn of the Apocalypse",
    era: "c. AD 95", material: "Bronze & reed",
    find: "The Cave of the Apocalypse",
    blurb: "An inkhorn for the last book, written on a prison island.",
    detail: "The road that started at a Chaldean city ends looking at a city coming down out of heaven.",
    scripture: "Revelation 21:1", hasArt: true }
];

var Artifacts = (function () {
  var LIST = typeof ARTIFACTS !== "undefined" ? ARTIFACTS : [];
  var BY_SITE = {};
  var BY_ID = {};
  LIST.forEach(function (a) {
    BY_SITE[a.siteId] = a;
    BY_ID[a.id] = a;
  });

  function all() { return LIST; }
  function count() { return LIST.length; }
  function byId(id) { return BY_ID[id] || null; }
  function forSite(siteId) { return BY_SITE[siteId] || null; }

  function imagePath(a) {
    if (!a) return null;
    if (a.hasArt) return "assets/artifacts/" + a.id + ".png";
    return null;
  }

  function blankProgress() {
    return { unlocked: {}, seen: {} };
  }

  function normalize(store) {
    var out = blankProgress();
    if (!store) return out;
    out.unlocked = Object.assign({}, store.unlocked || {});
    out.seen = Object.assign({}, store.seen || {});
    return out;
  }

  function isUnlocked(store, artifactId) {
    var s = normalize(store);
    return !!s.unlocked[artifactId];
  }

  function unlockedList(store) {
    var s = normalize(store);
    return LIST.filter(function (a) { return !!s.unlocked[a.id]; });
  }

  function unlockedCount(store) {
    return unlockedList(store).length;
  }

  /* Pure: returns { store, artifact, firstUnlock } */
  function unlockForSite(store, siteId, at) {
    var a = forSite(siteId);
    var next = normalize(store);
    if (!a) return { store: next, artifact: null, firstUnlock: false };
    if (next.unlocked[a.id]) {
      return { store: next, artifact: a, firstUnlock: false };
    }
    next.unlocked[a.id] = at || Date.now();
    return { store: next, artifact: a, firstUnlock: true };
  }

  function markSeen(store, artifactId) {
    var next = normalize(store);
    if (next.unlocked[artifactId]) next.seen[artifactId] = true;
    return next;
  }

  function unseenUnlocks(store) {
    var s = normalize(store);
    return LIST.filter(function (a) {
      return s.unlocked[a.id] && !s.seen[a.id];
    });
  }

  return {
    all: all,
    count: count,
    byId: byId,
    forSite: forSite,
    imagePath: imagePath,
    blankProgress: blankProgress,
    normalize: normalize,
    isUnlocked: isUnlocked,
    unlockedList: unlockedList,
    unlockedCount: unlockedCount,
    unlockForSite: unlockForSite,
    markSeen: markSeen,
    unseenUnlocks: unseenUnlocks
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ARTIFACTS: ARTIFACTS, Artifacts: Artifacts };
}
