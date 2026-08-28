/* ==================================================================
   SITES — the road from Ur to Patmos.

   Forty-six places, in the order Scripture walks them, grouped into
   five arcs. This file is DATA ONLY: no DOM, no Leaflet, no fetch. The
   campaign rules live in pilgrimage.js and the rendering lives in
   atlas.js, so this can be loaded and asserted against in bare Node.

   Two decisions worth recording:

   1. Quotes are King James. The atlas this grew out of quoted a modern
      translation, which is both under copyright and out of step with a
      game whose whole identity is "King James Version · 66 Books".
      Every quote here is KJV, which is public domain.

   2. A place can appear twice when Scripture returns to it centuries
      later, but never at the same point. Jerusalem is the City of David
      in the Kingdom arc and Golgotha in the Gospel arc — two markers
      about 500 m apart, which is the real distance between the Temple
      Mount and the Church of the Holy Sepulchre. Damascus is the city
      itself under the kings, and the road outside it for Saul. This
      keeps the map honest and stops two arcs fighting over one pin.

   `books` is the verse pool a site draws from first. It is deliberately
   generous — the bank holds only four verses for most books, and a
   level needs six — but it is never relied on alone: pilgrimage.js
   widens outward (site -> arc -> testament -> whole bank) until a level
   fills. See resolvePool() there.

   Elevations are metres at the site itself, from published survey
   figures. `climate` is an authored typical-summer fallback used only
   when live weather cannot be reached; it is approximate by design and
   is always superseded by a real reading when one arrives.
   ================================================================== */

var ARCS = [
  {
    key: "patriarchs",
    n: "I",
    name: "The Patriarchs",
    sub: "A man leaves a city he will never see again, on the strength of a promise.",
    colour: "#f3c258",
    pal: "act1",
    era: "c. 2100 – 1800 BC",
    books: ["Genesis", "Joshua", "Nehemiah", "Romans", "Galatians", "Hebrews", "James"]
  },
  {
    key: "exodus",
    n: "II",
    name: "The Exodus",
    sub: "A nation is carried out of Egypt, and spends forty years learning to trust the One who carried it.",
    colour: "#e76f51",
    pal: "act2",
    era: "c. 1700 – 1200 BC",
    books: ["Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Psalms", "Hebrews"]
  },
  {
    key: "judges",
    n: "III",
    name: "The Judges",
    sub: "There is no king. Deliverers rise and fall, and every man does what is right in his own eyes.",
    colour: "#a3543d",
    pal: "act3",
    era: "c. 1200 – 1020 BC",
    books: ["Judges", "Ruth", "1 Samuel", "Psalms", "Hebrews"]
  },
  {
    key: "kingdom",
    n: "IV",
    name: "Kingdom & Exile",
    sub: "The throne rises, the prophets warn, the walls come down, and the people are carried east.",
    colour: "#457b9d",
    pal: "act4",
    era: "c. 1000 – 430 BC",
    books: [
      "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
      "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes",
      "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
      "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
      "Zephaniah", "Haggai", "Zechariah", "Malachi"
    ]
  },
  {
    key: "gospel",
    n: "V",
    name: "The Gospel & The Church",
    sub: "The Word is made flesh, the tomb is emptied, and the message runs to the edge of the empire.",
    colour: "#e9d6a8",
    pal: "act5",
    era: "c. 5 BC – AD 95",
    books: [
      "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
      "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
      "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
      "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John",
      "3 John", "Jude", "Revelation"
    ]
  }
];

var SITES = [

  /* ============================ ARC I — THE PATRIARCHS ============================ */
  {
    id: "ur", arc: "patriarchs", name: "UR OF THE CHALDEES", tag: "PATRIARCHAL ROUTE",
    coords: [30.9626, 46.1031], elevation: 10, modernCountry: "Iraq",
    scripture: "Genesis 11:31 · Nehemiah 9:7 · Hebrews 11:8",
    quote: "And they went forth with them from Ur of the Chaldees, to go into the land of Canaan.",
    quoteRef: "Genesis 11:31",
    era: "c. 2100 – 1900 BC", empire: "ur3",
    archaeology: "Great Ziggurat of Ur (Tell el-Muqayyar)",
    region: "Lower Mesopotamia", place: "Sumerian Euphrates basin",
    description: "A paramount Sumerian city near the head of the Persian Gulf, with a moon-god temple complex, courtyard housing and river trade reaching the Indus. Abraham's family departs from here, and never comes back.",
    context: "Where the journey begins.",
    books: ["Genesis", "Nehemiah", "Joshua", "Hebrews"],
    climate: { type: "desert", hi: 45, lo: 27 }
  },
  {
    id: "haran", arc: "patriarchs", name: "HARAN", tag: "PATRIARCHAL ROUTE",
    coords: [36.8642, 39.0308], elevation: 380, modernCountry: "Turkey",
    scripture: "Genesis 11:31 – 12:4 · Acts 7:2-4",
    quote: "So Abram departed, as the LORD had spoken unto him… and Abram was seventy and five years old when he departed out of Haran.",
    quoteRef: "Genesis 12:4",
    era: "c. 1900 BC", empire: "ur3",
    archaeology: "Harran mound & beehive dwellings",
    region: "Northern Mesopotamia", place: "Upper Euphrates trade hub",
    description: "A commercial crossroads on the Balikh where Terah settled and died, and where the promise was renewed before Abraham turned southwest toward a land he had never seen.",
    context: "The pivot of the migration.",
    books: ["Genesis", "Acts", "Hebrews", "Romans"],
    climate: { type: "semi-arid", hi: 40, lo: 22 }
  },
  {
    id: "shechem", arc: "patriarchs", name: "SHECHEM", tag: "PATRIARCHAL ROUTE",
    coords: [32.2137, 35.2807], elevation: 550, modernCountry: "Palestine",
    scripture: "Genesis 12:6-7 · Joshua 24:1 · John 4:5-6",
    quote: "And there builded he an altar unto the LORD, who appeared unto him.",
    quoteRef: "Genesis 12:7",
    era: "c. 1850 – 1200 BC", empire: "canaan",
    archaeology: "Tell Balata · Jacob's Well",
    region: "Canaan highlands", place: "The pass between Ebal and Gerizim",
    description: "The first stop inside Canaan, set in the saddle between two mountains that would later stage the blessings and the curses. Joshua renewed the covenant on this ground at the end of his life.",
    context: "The first altar in the land of promise.",
    books: ["Genesis", "Joshua", "John", "Judges"],
    climate: { type: "mediterranean", hi: 30, lo: 18 }
  },
  {
    id: "hebron", arc: "patriarchs", name: "HEBRON (MAMRE)", tag: "PATRIARCHAL ROUTE",
    coords: [31.5326, 35.0998], elevation: 930, modernCountry: "Palestine",
    scripture: "Genesis 13:18 · Genesis 23:19 · 2 Samuel 5:3",
    quote: "Then Abram removed his tent, and came and dwelt in the plain of Mamre, which is in Hebron, and built there an altar unto the LORD.",
    quoteRef: "Genesis 13:18",
    era: "c. 1850 BC – present", empire: "canaan",
    archaeology: "Cave of Machpelah",
    region: "Judean highlands", place: "The highest city on the Judean ridge",
    description: "The patriarchal home, and the first piece of the promised land actually owned — a burial cave bought at full price, holding Sarah, Abraham, Isaac, Rebekah, Jacob and Leah.",
    context: "The family home and the ancestral tomb.",
    books: ["Genesis", "2 Samuel", "Joshua", "Numbers"],
    climate: { type: "mediterranean", hi: 28, lo: 16 }
  },
  {
    id: "beersheba", arc: "patriarchs", name: "BEERSHEBA", tag: "PATRIARCHAL ROUTE",
    coords: [31.2447, 34.8406], elevation: 260, modernCountry: "Israel",
    scripture: "Genesis 21:31 · Genesis 26:23-25 · 1 Kings 19:3",
    quote: "Wherefore he called that place Beersheba; because there they sware both of them.",
    quoteRef: "Genesis 21:31",
    era: "c. 1800 – 700 BC", empire: "canaan",
    archaeology: "Tel Sheva · four-horned altar",
    region: "Northern Negev", place: "Wells at the desert threshold",
    description: "The wells at the edge of the Negev, where Abraham and Isaac settled water disputes and swore treaties. \"From Dan to Beersheba\" became the standard measure of the whole land.",
    context: "The southern marker of Israel.",
    books: ["Genesis", "1 Kings", "Amos", "Joshua"],
    climate: { type: "desert", hi: 34, lo: 20 }
  },
  {
    id: "moriah", arc: "patriarchs", name: "THE LAND OF MORIAH", tag: "PATRIARCHAL ROUTE",
    coords: [31.7738, 35.2372], elevation: 740, modernCountry: "Israel",
    scripture: "Genesis 22:2 · Genesis 22:14 · Hebrews 11:17 · 2 Chronicles 3:1",
    quote: "And Abraham called the name of that place Jehovahjireh: as it is said to this day, In the mount of the LORD it shall be seen.",
    quoteRef: "Genesis 22:14",
    era: "c. 1870 BC", empire: "canaan",
    archaeology: "Temple Mount · the threshing floor of Araunah",
    region: "Judean mountains", place: "The ridge that would become Zion",
    description: "The mountain Abraham climbed with the knife and the wood, and came down with his son still alive. Later generations built the Temple on this same ridge — Scripture returns to a place centuries later, and this one it never leaves.",
    context: "Where the ram was caught in the thicket.",
    books: ["Genesis", "Hebrews", "James", "2 Chronicles"],
    climate: { type: "mediterranean", hi: 29, lo: 17 }
  },
  {
    id: "bethel", arc: "patriarchs", name: "BETHEL", tag: "PATRIARCHAL ROUTE",
    coords: [31.9308, 35.2211], elevation: 880, modernCountry: "Palestine",
    scripture: "Genesis 12:8 · Genesis 28:12-19",
    quote: "Surely the LORD is in this place; and I knew it not.",
    quoteRef: "Genesis 28:16",
    era: "c. 1850 – 722 BC", empire: "canaan",
    archaeology: "Beitin ridge settlement",
    region: "Ephraim highlands", place: "The central watershed road",
    description: "A high point on the ridge route where Abraham pitched his tent, and where Jacob — running for his life — slept on a stone and saw a ladder set up to heaven. He called it the House of God.",
    context: "Abraham's altar and Jacob's ladder.",
    books: ["Genesis", "1 Kings", "Amos", "Hosea"],
    climate: { type: "mediterranean", hi: 29, lo: 17 }
  },
  {
    id: "penuel", arc: "patriarchs", name: "PENUEL", tag: "PATRIARCHAL ROUTE",
    coords: [32.1833, 35.6167], elevation: 50, modernCountry: "Jordan",
    scripture: "Genesis 32:24-30 · Genesis 32:28",
    quote: "And Jacob called the name of the place Peniel: for I have seen God face to face, and my life is preserved.",
    quoteRef: "Genesis 32:30",
    era: "c. 1850 BC", empire: "canaan",
    archaeology: "The Jabbok ford approaches",
    region: "East of Jordan", place: "The ford of the Jabbok",
    description: "A lonely ford on the Jabbok where Jacob, returning home after twenty years, wrestled until daybreak and would not let go until he was blessed — and limped away with a new name.",
    context: "Where Jacob becomes Israel.",
    books: ["Genesis", "Hosea", "Hebrews", "Romans"],
    climate: { type: "semi-arid", hi: 34, lo: 20 }
  },
  {
    id: "dothan", arc: "patriarchs", name: "DOTHAN", tag: "PATRIARCHAL ROUTE",
    coords: [32.4139, 35.2394], elevation: 347, modernCountry: "Palestine",
    scripture: "Genesis 37:17-28 · 2 Kings 6:13-17",
    quote: "And they took him, and cast him into a pit: and the pit was empty, there was no water in it.",
    quoteRef: "Genesis 37:24",
    era: "c. 1700 BC · 850 BC", empire: "canaan",
    archaeology: "Tell Dothan",
    region: "Northern Samaria", place: "The pasture road toward the Jezreel",
    description: "A cistern town on the north road where Joseph's brothers sold him, and where, centuries later, Elisha's servant saw the mountain full of horses and chariots of fire. The pit and the opened eyes belong to the same ground.",
    context: "Where a brother was sold, and a servant saw.",
    books: ["Genesis", "2 Kings", "Psalms", "Acts"],
    climate: { type: "mediterranean", hi: 30, lo: 18 }
  },

  /* ============================== ARC II — THE EXODUS ============================== */
  {
    id: "midian", arc: "exodus", name: "MIDIAN", tag: "EXODUS TRAIL",
    coords: [28.4860, 35.0080], elevation: 220, modernCountry: "Saudi Arabia",
    scripture: "Exodus 3:1-5 · Exodus 3:14 · Acts 7:30",
    quote: "And he said, Draw not nigh hither: put off thy shoes from off thy feet, for the place whereon thou standest is holy ground.",
    quoteRef: "Exodus 3:5",
    era: "c. 1280 BC", empire: "egypt",
    archaeology: "Magha'ir Shu'ayb · the oasis of Al-Bad'",
    region: "Northwest Arabia", place: "The wilderness east of the Gulf of Aqaba",
    description: "The far country Moses fled to after he killed the Egyptian, where he kept Jethro's flock and turned aside to a bush that burned and was not consumed. The Exodus begins not in the brickyards, but with a shepherd taking off his shoes.",
    context: "The bush, and the name I AM.",
    books: ["Exodus", "Acts", "Hebrews", "Numbers"],
    climate: { type: "desert", hi: 38, lo: 24 }
  },
  {
    id: "goshen", arc: "exodus", name: "GOSHEN (RAMESES)", tag: "EXODUS TRAIL",
    coords: [30.7986, 31.8333], elevation: 10, modernCountry: "Egypt",
    scripture: "Genesis 47:6 · Exodus 12:37",
    quote: "And the children of Israel journeyed from Rameses to Succoth, about six hundred thousand on foot that were men, beside children.",
    quoteRef: "Exodus 12:37",
    era: "c. 1700 – 1250 BC", empire: "egypt",
    archaeology: "Avaris (Tell el-Dab'a) & Pi-Ramesses",
    region: "Eastern Nile delta", place: "Lower Egypt floodplain",
    description: "The fertile delta given to Joseph's family in the famine, and the brickyards their descendants were broken in. Excavation at Tell el-Dab'a shows a large Semitic population here long before it became the Ramesside capital.",
    context: "Four hundred years of waiting, and one night of leaving.",
    books: ["Exodus", "Genesis", "Psalms", "Acts"],
    climate: { type: "desert", hi: 36, lo: 22 }
  },
  {
    id: "yam-suph", arc: "exodus", name: "YAM SUPH (THE SEA)", tag: "EXODUS TRAIL",
    coords: [29.5200, 32.8800], elevation: 2, modernCountry: "Egypt",
    scripture: "Exodus 14:21-22 · Exodus 15:1 · Hebrews 11:29",
    quote: "And Moses stretched out his hand over the sea; and the LORD caused the sea to go back by a strong east wind all that night, and made the sea dry land, and the waters were divided.",
    quoteRef: "Exodus 14:21",
    era: "c. 1250 BC", empire: "egypt",
    archaeology: "The Bitter Lakes corridor · traditional sea crossing",
    region: "Eastern Egypt", place: "The reed sea between delta and wilderness",
    description: "The water that opened for a nation on foot and closed on the chariots that followed. Whether the crossing was the Bitter Lakes or a gulf further south, this is the night Israel stopped being slaves and started being a people.",
    context: "Dry land through the sea.",
    books: ["Exodus", "Hebrews", "Psalms", "Isaiah"],
    climate: { type: "desert", hi: 35, lo: 22 }
  },
  {
    id: "rephidim", arc: "exodus", name: "REPHIDIM", tag: "EXODUS TRAIL",
    coords: [28.7200, 33.6200], elevation: 900, modernCountry: "Egypt",
    scripture: "Exodus 17:1-13 · Exodus 17:6",
    quote: "Behold, I will stand before thee there upon the rock in Horeb; and thou shalt smite the rock, and there shall come water out of it.",
    quoteRef: "Exodus 17:6",
    era: "c. 1250 BC", empire: "egypt",
    archaeology: "Wadi Feiran oasis approaches",
    region: "Southern Sinai", place: "The last camp before the mountain",
    description: "A dry station in the wilderness where the people nearly stoned Moses for water, where the rock was struck, and where Amalek was held off only while Moses' hands stayed raised.",
    context: "Water from the rock, and the first battle.",
    books: ["Exodus", "Numbers", "Deuteronomy", "Psalms", "1 Corinthians"],
    climate: { type: "desert", hi: 34, lo: 18 }
  },
  {
    id: "sinai", arc: "exodus", name: "MOUNT SINAI (HOREB)", tag: "EXODUS TRAIL",
    coords: [28.5392, 33.9750], elevation: 2285, modernCountry: "Egypt",
    scripture: "Exodus 19:18 · Exodus 20:1-17 · Deuteronomy 5:2",
    quote: "And mount Sinai was altogether on a smoke, because the LORD descended upon it in fire.",
    quoteRef: "Exodus 19:18",
    era: "c. 1250 BC", empire: "egypt",
    archaeology: "Jebel Musa · St Catherine's plateau",
    region: "Sinai peninsula", place: "Granite ranges above the Red Sea",
    description: "The mountain of the Law, rising over 2,200 m out of the southern Sinai massif — the highest ground on the entire journey, by a wide margin. The Law was given here, and broken here, and given again.",
    context: "The covenant, and the highest point on the road.",
    books: ["Exodus", "Deuteronomy", "Leviticus", "Hebrews"],
    climate: { type: "highland-desert", hi: 30, lo: 14 }
  },
  {
    id: "kadesh", arc: "exodus", name: "KADESH BARNEA", tag: "EXODUS TRAIL",
    coords: [30.6725, 34.4269], elevation: 460, modernCountry: "Egypt",
    scripture: "Numbers 13:26 · Numbers 14:1-4 · Numbers 20:1",
    quote: "And they went and came to Moses… unto the wilderness of Paran, to Kadesh; and brought back word unto them.",
    quoteRef: "Numbers 13:26",
    era: "c. 1250 – 1210 BC", empire: "egypt",
    archaeology: "Ain el-Qudeirat oasis fortress",
    region: "Wilderness of Zin", place: "The largest spring in northern Sinai",
    description: "The oasis that served as Israel's base for a generation. Twelve spies went out from here and ten came back afraid — and that refusal, at this spring, bought forty years of wandering.",
    context: "The turning point that cost a generation.",
    books: ["Numbers", "Deuteronomy", "Hebrews", "Psalms"],
    climate: { type: "desert", hi: 35, lo: 19 }
  },
  {
    id: "nebo", arc: "exodus", name: "MOUNT NEBO", tag: "EXODUS TRAIL",
    coords: [31.7683, 35.7256], elevation: 710, modernCountry: "Jordan",
    scripture: "Deuteronomy 34:1-5",
    quote: "I have caused thee to see it with thine eyes, but thou shalt not go over thither.",
    quoteRef: "Deuteronomy 34:4",
    era: "c. 1210 BC", empire: "israel",
    archaeology: "Siyagha summit basilica",
    region: "Plains of Moab", place: "The escarpment above the Dead Sea",
    description: "The Moabite ridge looking out over the Jordan valley, nearly a kilometre above the river below. Moses climbed it, saw the whole land, and died within sight of the thing he had spent forty years walking toward.",
    context: "The last vantage point of Moses.",
    books: ["Deuteronomy", "Numbers", "Joshua", "Psalms"],
    climate: { type: "semi-arid", hi: 32, lo: 19 }
  },
  {
    id: "gilgal", arc: "exodus", name: "GILGAL", tag: "EXODUS TRAIL",
    coords: [31.8500, 35.4800], elevation: -240, modernCountry: "Palestine",
    scripture: "Joshua 4:19-24 · Joshua 5:9 · 1 Samuel 11:14",
    quote: "And the LORD said unto Joshua, This day have I rolled away the reproach of Egypt from off you. Wherefore the name of the place is called Gilgal unto this day.",
    quoteRef: "Joshua 5:9",
    era: "c. 1210 BC", empire: "israel",
    archaeology: "The Jordan ford camps east of Jericho",
    region: "Jordan rift valley", place: "The first camp west of Jordan",
    description: "The base camp after the crossing, where twelve stones from the riverbed stood as a sign, the manna ceased, and a new generation was marked for the land they had just entered.",
    context: "Where Egypt's reproach was rolled away.",
    books: ["Joshua", "1 Samuel", "Hosea", "Amos", "Judges"],
    climate: { type: "desert", hi: 39, lo: 24 }
  },
  {
    id: "jericho", arc: "exodus", name: "JERICHO", tag: "EXODUS TRAIL",
    coords: [31.8711, 35.4444], elevation: -258, modernCountry: "Palestine",
    scripture: "Joshua 6:20 · Hebrews 11:30",
    quote: "So the people shouted when the priests blew with the trumpets… and the wall fell down flat.",
    quoteRef: "Joshua 6:20",
    era: "c. 9000 BC – present", empire: "israel",
    archaeology: "Tell es-Sultan · Elisha's Spring",
    region: "Jordan rift valley", place: "The lowest city on earth, −258 m",
    description: "A spring-fed oasis and one of the oldest continuously inhabited places known, sitting 258 m below sea level — the lowest ground on the journey, and the first city taken as Israel came into Canaan.",
    context: "The gate into the promised land.",
    books: ["Joshua", "Hebrews", "Luke", "2 Kings"],
    climate: { type: "desert", hi: 39, lo: 24 }
  },

  /* =========================== ARC III — THE JUDGES =========================== */
  {
    id: "harod", arc: "judges", name: "THE SPRING OF HAROD", tag: "THE JUDGES",
    coords: [32.5506, 35.3570], elevation: 15, modernCountry: "Israel",
    scripture: "Judges 7:1-7 · Judges 7:20",
    quote: "And the LORD said unto Gideon, By the three hundred men that lapped will I save you, and deliver the Midianites into thine hand.",
    quoteRef: "Judges 7:7",
    era: "c. 1150 BC", empire: "israel",
    archaeology: "Ma'ayan Harod · the foot of Mount Gilboa",
    region: "Jezreel valley", place: "The spring under Gilboa",
    description: "The water where Gideon sent home the fearful and then the kneelers, until three hundred men who lapped like dogs were left to face a host like locusts. Pitchers, torches, and a shout — The sword of the LORD, and of Gideon.",
    context: "Where a host was thinned to three hundred.",
    books: ["Judges", "Hebrews", "Psalms", "1 Samuel"],
    climate: { type: "mediterranean", hi: 33, lo: 20 }
  },
  {
    id: "zorah", arc: "judges", name: "ZORAH & TIMNAH", tag: "THE JUDGES",
    coords: [31.7747, 34.9856], elevation: 280, modernCountry: "Israel",
    scripture: "Judges 13:2 · Judges 16:28-30",
    quote: "And Samson called unto the LORD, and said, O Lord GOD, remember me, I pray thee, and strengthen me, I pray thee, only this once, O God.",
    quoteRef: "Judges 16:28",
    era: "c. 1100 BC", empire: "israel",
    archaeology: "Tel Tzora · Tel Batash (Timnah)",
    region: "The Shephelah", place: "The Philistine border hills",
    description: "The ridge where a Nazirite was born, and the valley where he tore a lion, loved a Philistine, and at the last pulled a house down on himself. Strength and ruin share the same few miles of lowland.",
    context: "Where strength was a vow, and then a prayer.",
    books: ["Judges", "Hebrews", "1 Samuel", "Psalms"],
    climate: { type: "mediterranean", hi: 31, lo: 18 }
  },
  {
    id: "gibeah", arc: "judges", name: "GIBEAH OF BENJAMIN", tag: "THE JUDGES",
    coords: [31.8236, 35.2308], elevation: 838, modernCountry: "Israel",
    scripture: "Judges 19:14 · Judges 21:25 · 1 Samuel 10:26",
    quote: "In those days there was no king in Israel: every man did that which was right in his own eyes.",
    quoteRef: "Judges 21:25",
    era: "c. 1100 – 1010 BC", empire: "israel",
    archaeology: "Tell el-Ful",
    region: "Benjamin highlands", place: "The hill just north of Jerusalem",
    description: "The town that closes the book of Judges in horror, and later becomes Saul's capital. Between the outrage and the crown the refrain is the same: there was no king, and every man did what was right in his own eyes.",
    context: "The last darkness before a king.",
    books: ["Judges", "1 Samuel", "Hosea", "Psalms"],
    climate: { type: "mediterranean", hi: 29, lo: 17 }
  },
  {
    id: "mizpah", arc: "judges", name: "MIZPAH", tag: "THE JUDGES",
    coords: [31.8850, 35.2167], elevation: 784, modernCountry: "Palestine",
    scripture: "1 Samuel 7:5-12 · Judges 20:1 · Jeremiah 40:6",
    quote: "Then Samuel took a stone, and set it between Mizpeh and Shen, and called the name of it Ebenezer, saying, Hitherto hath the LORD helped us.",
    quoteRef: "1 Samuel 7:12",
    era: "c. 1050 – 580 BC", empire: "israel",
    archaeology: "Tell en-Nasbeh",
    region: "Benjamin highlands", place: "The watchtower north of Gibeah",
    description: "The assembly ground of the tribes, where Israel gathered against Benjamin, and where Samuel later set a stone and named it Ebenezer. The Judges end here; the kingdom is asked for on this ridge.",
    context: "Hitherto hath the LORD helped us.",
    books: ["1 Samuel", "Judges", "Psalms", "Jeremiah"],
    climate: { type: "mediterranean", hi: 29, lo: 17 }
  },

  /* =========================== ARC IV — KINGDOM & EXILE =========================== */
  {
    id: "jerusalem", arc: "kingdom", name: "JERUSALEM (ZION)", tag: "KINGDOM & EXILE",
    coords: [31.7767, 35.2345], elevation: 754, modernCountry: "Israel",
    scripture: "2 Samuel 5:7 · 1 Kings 8:1 · Psalm 122:1",
    quote: "Nevertheless David took the strong hold of Zion: the same is the city of David.",
    quoteRef: "2 Samuel 5:7",
    era: "c. 3000 BC – present", empire: "monarchy",
    archaeology: "Temple Mount · City of David",
    region: "Judean mountains", place: "The ridge between the Kidron and the Hinnom",
    description: "Taken by David as the capital of a united kingdom and made the site of Solomon's Temple. Burned by Babylon in 586 BC, rebuilt after the exile, and argued over ever since.",
    context: "The heart of the kingdom.",
    books: ["2 Samuel", "1 Kings", "Psalms", "2 Chronicles", "Isaiah"],
    climate: { type: "mediterranean", hi: 29, lo: 17 }
  },
  {
    id: "shiloh", arc: "kingdom", name: "SHILOH", tag: "KINGDOM & EXILE",
    coords: [32.0556, 35.2897], elevation: 700, modernCountry: "Palestine",
    scripture: "Joshua 18:1 · 1 Samuel 1:3 · 1 Samuel 3:21 · Jeremiah 7:12",
    quote: "And the whole congregation of the children of Israel assembled together at Shiloh, and set up the tabernacle of the congregation there.",
    quoteRef: "Joshua 18:1",
    era: "c. 1200 – 1050 BC", empire: "monarchy",
    archaeology: "Tel Shiloh · tabernacle platform",
    region: "Ephraim highlands", place: "The ridge road north of Bethel",
    description: "The resting place of the tabernacle for generations, where Hannah prayed and Samuel heard his name in the night — and where the ark was lost to the Philistines when the priesthood failed.",
    context: "Where the tabernacle stood before Zion.",
    books: ["Joshua", "1 Samuel", "Psalms", "Jeremiah", "Judges"],
    climate: { type: "mediterranean", hi: 29, lo: 17 }
  },
  {
    id: "tyre", arc: "kingdom", name: "TYRE & SIDON", tag: "KINGDOM & EXILE",
    coords: [33.2705, 35.2038], elevation: 10, modernCountry: "Lebanon",
    scripture: "1 Kings 5:1 · Ezekiel 27:3 · Matthew 15:21",
    quote: "And Hiram king of Tyre sent his servants unto Solomon… for Hiram was ever a lover of David.",
    quoteRef: "1 Kings 5:1",
    era: "c. 2000 BC – present", empire: "monarchy",
    archaeology: "Phoenician island harbour",
    region: "Phoenician coast", place: "A fortified island port",
    description: "The sea powers that supplied the cedar, the gold and the craftsmen for Solomon's Temple, and whose purple dye and alphabet travelled the whole Mediterranean. Ezekiel later sang its funeral.",
    context: "Where the Temple's cedar came from.",
    books: ["1 Kings", "Ezekiel", "Matthew", "2 Chronicles"],
    climate: { type: "coastal", hi: 30, lo: 23 }
  },
  {
    id: "samaria", arc: "kingdom", name: "SAMARIA (SEBASTE)", tag: "KINGDOM & EXILE",
    coords: [32.2764, 35.1897], elevation: 430, modernCountry: "Palestine",
    scripture: "1 Kings 16:24 · Amos 6:1 · 2 Kings 17:6",
    quote: "In the ninth year of Hoshea the king of Assyria took Samaria, and carried Israel away into Assyria.",
    quoteRef: "2 Kings 17:6",
    era: "c. 880 – 722 BC", empire: "assyria",
    archaeology: "Omride acropolis & ivory house",
    region: "Northern kingdom of Israel", place: "An isolated hill above the Shechem road",
    description: "The capital Omri built on a defensible hill, famous for its ivory-inlaid palace and condemned for it by Amos and Hosea. Its fall in 722 BC ended the northern kingdom for good.",
    context: "The capital lost to Assyria.",
    books: ["1 Kings", "2 Kings", "Amos", "Hosea", "Micah"],
    climate: { type: "mediterranean", hi: 30, lo: 18 }
  },
  {
    id: "carmel", arc: "kingdom", name: "MOUNT CARMEL", tag: "KINGDOM & EXILE",
    coords: [32.6725, 35.0880], elevation: 482, modernCountry: "Israel",
    scripture: "1 Kings 18:21-39 · 1 Kings 18:38 · James 5:17",
    quote: "Then the fire of the LORD fell, and consumed the burnt sacrifice, and the wood, and the stones, and the dust, and licked up the water that was in the trench.",
    quoteRef: "1 Kings 18:38",
    era: "c. 860 BC", empire: "monarchy",
    archaeology: "El-Muhraqa · the Carmel ridge",
    region: "The Carmel range", place: "The high ridge above the sea road",
    description: "The mountain where Elijah rebuilt an altar in twelve stones, soaked it three times, and called down fire in front of four hundred and fifty prophets of Baal. How long halt ye between two opinions, he asked, and the fire answered.",
    context: "The God that answereth by fire.",
    books: ["1 Kings", "James", "Malachi", "2 Kings"],
    climate: { type: "mediterranean", hi: 30, lo: 20 }
  },
  {
    id: "megiddo", arc: "kingdom", name: "MEGIDDO", tag: "KINGDOM & EXILE",
    coords: [32.5850, 35.1850], elevation: 150, modernCountry: "Israel",
    scripture: "1 Kings 9:15 · 2 Kings 23:29 · 2 Chronicles 35:22 · Zechariah 12:11",
    quote: "In his days Pharaoh-nechoh king of Egypt went up against the king of Assyria to the river Euphrates: and king Josiah went against him; and he slew him at Megiddo, when he had seen him.",
    quoteRef: "2 Kings 23:29",
    era: "c. 1000 – 609 BC", empire: "monarchy",
    archaeology: "Tel Megiddo · the great gate & stables",
    region: "Jezreel valley", place: "The pass that commands the plain",
    description: "A fortress city on the narrow pass between the coast and the inland road — Solomonic gates, chariot cities, and the place good king Josiah fell. The valley below would later lend its name to Armageddon.",
    context: "Where kings die at the pass.",
    books: ["1 Kings", "2 Kings", "2 Chronicles", "Zechariah", "Judges", "Revelation"],
    climate: { type: "mediterranean", hi: 32, lo: 19 }
  },
  {
    id: "lachish", arc: "kingdom", name: "LACHISH", tag: "KINGDOM & EXILE",
    coords: [31.5654, 34.8492], elevation: 250, modernCountry: "Israel",
    scripture: "2 Kings 18:13-17 · Isaiah 36:1-2 · 2 Chronicles 32:9",
    quote: "Now in the fourteenth year of king Hezekiah did Sennacherib king of Assyria come up against all the fenced cities of Judah, and took them.",
    quoteRef: "2 Kings 18:13",
    era: "c. 701 BC", empire: "assyria",
    archaeology: "Tel Lachish · the Assyrian siege ramp",
    region: "The Shephelah of Judah", place: "Judah's second city",
    description: "The fortress Sennacherib took while Hezekiah watched from Jerusalem. The siege ramp still leans against the tell, and the palace reliefs in Nineveh show the same ramp from the other side — a city remembered by the army that broke it.",
    context: "Where Assyria came up against Judah.",
    books: ["2 Kings", "Isaiah", "2 Chronicles", "Jeremiah"],
    climate: { type: "mediterranean", hi: 32, lo: 19 }
  },
  {
    id: "damascus", arc: "kingdom", name: "DAMASCUS", tag: "KINGDOM & EXILE",
    coords: [33.5138, 36.2765], elevation: 680, modernCountry: "Syria",
    scripture: "1 Kings 20:34 · 2 Kings 5:12 · Isaiah 17:1",
    quote: "Are not Abana and Pharpar, rivers of Damascus, better than all the waters of Israel?",
    quoteRef: "2 Kings 5:12",
    era: "c. 2500 BC – present", empire: "assyria",
    archaeology: "The Barada oasis & the old city walls",
    region: "Syrian oasis basin", place: "The Barada river oasis",
    description: "The Aramaean capital watered by the Barada, fought over through the whole age of the kings. Naaman's rivers ran here, and he had to be talked into a muddier one.",
    context: "The northern rival, and the road north.",
    books: ["2 Kings", "1 Kings", "Isaiah", "Amos"],
    climate: { type: "semi-arid", hi: 36, lo: 18 }
  },
  {
    id: "nineveh", arc: "kingdom", name: "NINEVEH", tag: "KINGDOM & EXILE",
    coords: [36.3597, 43.1526], elevation: 220, modernCountry: "Iraq",
    scripture: "Jonah 3:3-4 · Nahum 1:1 · 2 Kings 19:36",
    quote: "Now Nineveh was an exceeding great city of three days' journey.",
    quoteRef: "Jonah 3:3",
    era: "c. 1800 – 612 BC", empire: "assyria",
    archaeology: "Kuyunjik mound · palace of Sennacherib",
    region: "Upper Tigris, Assyria", place: "The imperial Assyrian capital",
    description: "The Assyrian capital on the Tigris, holding Ashurbanipal's library and some twelve kilometres of wall. Jonah preached here and it repented; Nahum promised the fall that came in 612 BC.",
    context: "The power that carried off the north.",
    books: ["Jonah", "Nahum", "2 Kings", "Isaiah", "Zephaniah"],
    climate: { type: "desert", hi: 43, lo: 26 }
  },
  {
    id: "babylon", arc: "kingdom", name: "BABYLON", tag: "KINGDOM & EXILE",
    coords: [32.5355, 44.4275], elevation: 34, modernCountry: "Iraq",
    scripture: "2 Kings 25:8-11 · Psalm 137:1 · Daniel 1:1-4",
    quote: "By the rivers of Babylon, there we sat down, yea, we wept, when we remembered Zion.",
    quoteRef: "Psalm 137:1",
    era: "c. 2300 – 539 BC", empire: "babylon",
    archaeology: "Ishtar Gate · Etemenanki ziggurat",
    region: "Lower Mesopotamia", place: "The Euphrates metropolis",
    description: "Nebuchadnezzar's capital of blue-glazed gates and processional ways, where Judah spent seventy years and where Daniel outlasted four kings. The exile ends where the journey began — back on the Euphrates.",
    context: "Seventy years by the river.",
    books: ["Daniel", "Jeremiah", "Psalms", "2 Kings", "Lamentations", "Ezekiel"],
    climate: { type: "desert", hi: 44, lo: 26 }
  },
  {
    id: "susa", arc: "kingdom", name: "SUSA (SHUSHAN)", tag: "KINGDOM & EXILE",
    coords: [32.1892, 48.2577], elevation: 65, modernCountry: "Iran",
    scripture: "Esther 1:2 · Nehemiah 1:1 · Daniel 8:2",
    quote: "That in those days, when the king Ahasuerus sat on the throne of his kingdom, which was in Shushan the palace.",
    quoteRef: "Esther 1:2",
    era: "c. 2000 – 330 BC", empire: "persia",
    archaeology: "Apadana palace of Darius",
    region: "Elam · the Persian empire", place: "The royal Persian citadel",
    description: "The Achaemenid winter capital at the eastern end of the Royal Road, where Esther became queen for such a time as this, and where Nehemiah heard that the walls of Jerusalem were still down.",
    context: "The court that signed the decree to return.",
    books: ["Esther", "Nehemiah", "Daniel", "Ezra"],
    climate: { type: "desert", hi: 46, lo: 28 }
  },

  /* ======================= ARC IV — THE GOSPEL & THE CHURCH ======================= */
  {
    id: "bethlehem", arc: "gospel", name: "BETHLEHEM", tag: "THE GOSPEL",
    coords: [31.7042, 35.2072], elevation: 775, modernCountry: "Palestine",
    scripture: "Micah 5:2 · Luke 2:7 · Matthew 2:1",
    quote: "And she brought forth her firstborn son… and laid him in a manger; because there was no room for them in the inn.",
    quoteRef: "Luke 2:7",
    era: "c. 5 BC", empire: "rome",
    archaeology: "Church of the Nativity",
    region: "Judean highlands", place: "The shepherds' fields, six miles from Jerusalem",
    description: "The village Micah named seven hundred years early — little among the thousands of Judah, and the birthplace of David and of David's greater son. The journey turns here from promise to person.",
    context: "The promise takes a body.",
    books: ["Luke", "Matthew", "Micah", "John"],
    climate: { type: "mediterranean", hi: 28, lo: 16 }
  },
  {
    id: "nazareth", arc: "gospel", name: "NAZARETH", tag: "THE GOSPEL",
    coords: [32.7009, 35.2035], elevation: 350, modernCountry: "Israel",
    scripture: "Luke 4:16-21 · John 1:46 · Matthew 2:23",
    quote: "And he came to Nazareth, where he had been brought up: and, as his custom was, he went into the synagogue on the sabbath day, and stood up for to read.",
    quoteRef: "Luke 4:16",
    era: "c. 5 BC – AD 28", empire: "rome",
    archaeology: "First-century village terraces & Mary's Well",
    region: "Lower Galilee", place: "A hill village above the Jezreel valley",
    description: "A small Galilean village of no reputation — \"can there any good thing come out of Nazareth?\" — where thirty of the thirty-three years were quietly spent, and where the hometown crowd tried to throw him off a cliff.",
    context: "Thirty hidden years.",
    books: ["Luke", "John", "Matthew", "Mark"],
    climate: { type: "mediterranean", hi: 31, lo: 19 }
  },
  {
    id: "jordan", arc: "gospel", name: "THE JORDAN", tag: "THE GOSPEL",
    coords: [31.8370, 35.5470], elevation: -350, modernCountry: "Palestine",
    scripture: "Matthew 3:13-17 · Mark 1:9-11 · Luke 3:21-22 · John 1:29-34",
    quote: "And Jesus, when he was baptized, went up straightway out of the water: and, lo, the heavens were opened unto him.",
    quoteRef: "Matthew 3:16",
    era: "c. AD 27", empire: "rome",
    archaeology: "Bethany-beyond-Jordan · Qasr el-Yahud",
    region: "Jordan rift valley", place: "The river of the crossing and the baptism",
    description: "The same river Israel crossed into the land, and the water where John baptized — where the heavens opened, the Spirit descended, and a voice named the beloved Son before the public ministry began.",
    context: "Where the ministry is opened from heaven.",
    books: ["Matthew", "Mark", "Luke", "John", "Acts"],
    climate: { type: "desert", hi: 38, lo: 22 }
  },
  {
    id: "capernaum", arc: "gospel", name: "CAPERNAUM & GALILEE", tag: "THE GOSPEL",
    coords: [32.8807, 35.5751], elevation: -210, modernCountry: "Israel",
    scripture: "Matthew 4:13-19 · Mark 2:1 · John 6:35",
    quote: "Follow me, and I will make you fishers of men.",
    quoteRef: "Matthew 4:19",
    era: "c. AD 28 – 30", empire: "rome",
    archaeology: "White limestone synagogue · Peter's house",
    region: "Sea of Galilee", place: "The north shore, 210 m below sea level",
    description: "The lakeside town that became the base of operations — a customs post and fishing harbour where the first disciples were called off their boats, and where most of the miracles happened.",
    context: "The ministry's home water.",
    books: ["Matthew", "Mark", "Luke", "John"],
    climate: { type: "semi-arid", hi: 37, lo: 23 }
  },
  {
    id: "golgotha", arc: "gospel", name: "GOLGOTHA & THE TOMB", tag: "THE GOSPEL",
    coords: [31.7784, 35.2297], elevation: 760, modernCountry: "Israel",
    scripture: "John 19:17-18 · Luke 24:6 · 1 Corinthians 15:3-4",
    quote: "He is not here, but is risen.",
    quoteRef: "Luke 24:6",
    era: "c. AD 30", empire: "rome",
    archaeology: "Church of the Holy Sepulchre",
    region: "Jerusalem, outside the second wall", place: "The place of a skull",
    description: "A quarry face and a garden tomb just outside the city wall — five hundred metres from the Temple Mount, and the hinge the whole road has been bending toward since Ur.",
    context: "The hinge of the whole journey.",
    books: ["John", "Luke", "Matthew", "Mark", "1 Corinthians", "Hebrews"],
    climate: { type: "mediterranean", hi: 29, lo: 17 }
  },
  {
    id: "emmaus", arc: "gospel", name: "EMMAUS", tag: "THE GOSPEL",
    coords: [31.8392, 34.9892], elevation: 150, modernCountry: "Israel",
    scripture: "Luke 24:13-35",
    quote: "Did not our heart burn within us, while he talked with us by the way, and while he opened to us the scriptures?",
    quoteRef: "Luke 24:32",
    era: "c. AD 30", empire: "rome",
    archaeology: "Emmaus Nicopolis basilica & Roman road",
    region: "The Ayalon valley", place: "Threescore furlongs from Jerusalem",
    description: "A road, an evening, and two people walking away from the city in disappointment — who had the whole of Moses and the prophets explained to them by a stranger, and only recognised him when he broke the bread.",
    context: "Where the Scriptures were opened.",
    books: ["Luke", "John", "Acts", "Romans"],
    climate: { type: "mediterranean", hi: 31, lo: 19 }
  },
  {
    id: "damascus-road", arc: "gospel", name: "THE DAMASCUS ROAD", tag: "THE CHURCH",
    coords: [33.4700, 36.1900], elevation: 700, modernCountry: "Syria",
    scripture: "Acts 9:3-6 · Acts 22:6-11 · Galatians 1:15-16",
    quote: "And he fell to the earth, and heard a voice saying unto him, Saul, Saul, why persecutest thou me?",
    quoteRef: "Acts 9:4",
    era: "c. AD 34", empire: "rome",
    archaeology: "The southern approach to the old city",
    region: "The Damascus plain", place: "On the road, still short of the gate",
    description: "Not the city but the road outside it, where a man carrying warrants against the church was knocked flat by a light and stood up blind, and three days later became its most relentless missionary.",
    context: "The persecutor is turned around.",
    books: ["Acts", "Galatians", "Romans", "1 Timothy", "Philippians"],
    climate: { type: "semi-arid", hi: 36, lo: 18 }
  },
  {
    id: "antioch", arc: "gospel", name: "ANTIOCH", tag: "THE CHURCH",
    coords: [36.2021, 36.1603], elevation: 70, modernCountry: "Turkey",
    scripture: "Acts 11:26 · Acts 13:1-3",
    quote: "And the disciples were called Christians first in Antioch.",
    quoteRef: "Acts 11:26",
    era: "c. AD 40 – 60", empire: "rome",
    archaeology: "Grotto of St Peter",
    region: "Northern Levant · the Orontes", place: "The Orontes valley gateway",
    description: "Third city of the Roman empire, and the first church where Jew and Gentile ate at the same table. The base from which Paul and Barnabas were sent out — the hinge between the homeland and the world.",
    context: "Where the mission was launched.",
    books: ["Acts", "Galatians", "Romans", "Ephesians"],
    climate: { type: "mediterranean", hi: 33, lo: 21 }
  },
  {
    id: "ephesus", arc: "gospel", name: "EPHESUS", tag: "THE CHURCH",
    coords: [37.9395, 27.3417], elevation: 20, modernCountry: "Turkey",
    scripture: "Acts 19:20 · Ephesians 6:11-12 · Revelation 2:4",
    quote: "So mightily grew the word of God and prevailed.",
    quoteRef: "Acts 19:20",
    era: "c. AD 52 – 95", empire: "rome",
    archaeology: "Temple of Artemis · the great theatre",
    region: "Roman Asia", place: "The harbour city of the Cayster",
    description: "A port and temple city where the gospel ran for two years, the silversmiths rioted over lost trade, and the magic books were burned in the street. Later the first of the seven churches to be written to.",
    context: "Two years that shook Asia.",
    books: ["Acts", "Ephesians", "Revelation", "1 Timothy", "2 Timothy"],
    climate: { type: "mediterranean", hi: 33, lo: 21 }
  },
  {
    id: "corinth", arc: "gospel", name: "CORINTH", tag: "THE CHURCH",
    coords: [37.9061, 22.8791], elevation: 80, modernCountry: "Greece",
    scripture: "Acts 18:9-11 · 1 Corinthians 13:13 · 2 Corinthians 12:9",
    quote: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.",
    quoteRef: "1 Corinthians 13:13",
    era: "c. AD 50 – 57", empire: "rome",
    archaeology: "The Bema · temple of Apollo · Acrocorinth",
    region: "Achaia, Greece", place: "The isthmus between two seas",
    description: "A wealthy, rough port straddling the isthmus, where Paul stayed eighteen months and wrote to a church that argued about everything. The letters back to it are the most practical in the New Testament.",
    context: "The difficult church that got the best letters.",
    books: ["1 Corinthians", "2 Corinthians", "Acts", "Romans"],
    climate: { type: "mediterranean", hi: 32, lo: 21 }
  },
  {
    id: "philippi", arc: "gospel", name: "PHILIPPI", tag: "THE CHURCH",
    coords: [41.0120, 24.2860], elevation: 60, modernCountry: "Greece",
    scripture: "Acts 16:9-14 · Acts 16:25-31 · Philippians 1:3-6 · Philippians 4:4",
    quote: "And a vision appeared to Paul in the night; There stood a man of Macedonia, and prayed him, saying, Come over into Macedonia, and help us.",
    quoteRef: "Acts 16:9",
    era: "c. AD 49 – 62", empire: "rome",
    archaeology: "The Roman forum · prison tradition · river baptism site",
    region: "Macedonia", place: "A colony on the Via Egnatia",
    description: "The first European landing of the gospel — a Roman colony where Lydia believed by the riverside, a jailer was baptized at midnight, and a letter later taught the church to rejoice always.",
    context: "Where the gospel crosses into Europe.",
    books: ["Acts", "Philippians", "1 Thessalonians", "2 Corinthians", "Romans"],
    climate: { type: "mediterranean", hi: 31, lo: 18 }
  },
  {
    id: "rome", arc: "gospel", name: "ROME", tag: "THE CHURCH",
    coords: [41.8925, 12.4853], elevation: 21, modernCountry: "Italy",
    scripture: "Acts 28:30-31 · Romans 1:16 · 2 Timothy 4:7",
    quote: "Preaching the kingdom of God… with all confidence, no man forbidding him.",
    quoteRef: "Acts 28:31",
    era: "c. AD 60 – 68", empire: "rome",
    archaeology: "The Forum · the Mamertine prison",
    region: "Italy · the imperial capital", place: "The centre of the known world",
    description: "The capital Paul reached in chains and preached in for two years at his own hired house. Acts ends here mid-sentence, with the message loose in the empire and the prisoner still talking.",
    context: "The gospel reaches the capital.",
    books: ["Acts", "Romans", "Philippians", "2 Timothy", "Colossians", "Philemon"],
    climate: { type: "mediterranean", hi: 31, lo: 19 }
  },
  {
    id: "patmos", arc: "gospel", name: "PATMOS", tag: "THE CHURCH",
    coords: [37.3086, 26.5478], elevation: 160, modernCountry: "Greece",
    scripture: "Revelation 1:9 · Revelation 21:1-4 · Revelation 22:20",
    quote: "And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away.",
    quoteRef: "Revelation 21:1",
    era: "c. AD 95", empire: "rome",
    archaeology: "The Cave of the Apocalypse",
    region: "The Aegean · the Dodecanese", place: "A prison island off the coast of Asia",
    description: "A bare rock in the Aegean where an old man was sent to be forgotten, and where instead the last book was given — the road that started at a Chaldean city ends looking at a city coming down out of heaven.",
    context: "The last place, and the last word.",
    books: ["Revelation", "1 John", "John", "2 Peter", "Jude"],
    climate: { type: "mediterranean", hi: 29, lo: 23 }
  }
];

/* Route geometry. Sites are joined by intermediate waypoints so the drawn
   line follows a plausible ancient corridor — the King's Highway, the
   coastal road, a sea lane — rather than cutting straight across a desert
   nobody crossed. Waypoints are travel geography only; they are never
   levels and never appear in the site list. */
var ROUTES = {
  patriarchs: {
    label: "The Patriarchs",
    colour: "#f3c258",
    coords: [
      [30.9626, 46.1031], // Ur
      [32.5355, 44.4275], // up the Euphrates past Babylon
      [34.4500, 40.9000], // Mari, middle Euphrates
      [35.9500, 39.0300], // the Balikh confluence
      [36.8642, 39.0308], // Haran
      [36.2021, 36.1603], // the Orontes gap
      [35.1300, 36.7500], // the Hamath corridor
      [33.5138, 36.2765], // Damascus
      [32.9000, 35.8000], // down past the Sea of Galilee
      [32.2137, 35.2807], // Shechem
      [31.8500, 35.4000], // Jordan rift south, off the ridge
      [31.5326, 35.0998], // Hebron
      [31.2447, 34.8406], // Beersheba
      [31.4000, 35.0000], // north up the ridge
      [31.7738, 35.2372], // Moriah
      [31.9308, 35.2211], // Bethel
      [32.0000, 35.4200], // east toward the Jabbok
      [32.1833, 35.6167], // Penuel
      [32.3000, 35.4000], // back west of the Jordan
      [32.4139, 35.2394]  // Dothan
    ]
  },
  exodus: {
    label: "The Exodus",
    colour: "#e76f51",
    coords: [
      [28.4860, 35.0080], // Midian
      [28.8000, 34.2000], // west toward the Sinai
      [29.5000, 33.2000], // across the peninsula
      [30.4000, 32.2000], // toward the delta
      [30.7986, 31.8333], // Rameses / Goshen
      [30.2000, 32.5500], // Succoth, toward the Bitter Lakes
      [29.5200, 32.8800], // Yam Suph
      [28.7200, 33.6200], // Rephidim
      [28.5392, 33.9750], // Mount Sinai
      [29.6000, 34.2000], // north through the wilderness of Paran
      [30.6725, 34.4269], // Kadesh Barnea
      [29.5500, 34.9500], // Ezion-geber, after the forty years
      [30.3200, 35.4400], // Edom, up the King's Highway
      [30.9000, 35.4500], // the brook Zered
      [31.7683, 35.7256], // Mount Nebo
      [31.8500, 35.4800], // Gilgal
      [31.8711, 35.4444]  // Jericho
    ]
  },
  judges: {
    label: "The Judges",
    colour: "#a3543d",
    coords: [
      [32.5506, 35.3570], // Harod
      [32.4000, 35.2000], // down the Jezreel
      [32.1000, 35.0500], // the western approach
      [31.7747, 34.9856], // Zorah
      [31.7800, 35.1200], // east toward the ridge
      [31.8236, 35.2308], // Gibeah
      [31.8850, 35.2167]  // Mizpah
    ]
  },
  /* Ordered to match the SITE sequence, not the tidiest line on the
     map. The sites run in the order Scripture reaches them — Tyre under
     Solomon before Samaria under Omri — so the route doubles back down
     the coast rather than pretending the history was a straight walk
     north. A route that took the neater path would put the "already
     walked" marker past places the player has not been. */
  kingdom: {
    label: "Kingdom & Exile",
    colour: "#457b9d",
    coords: [
      [31.7767, 35.2345], // Jerusalem
      [32.0556, 35.2897], // Shiloh
      [32.0800, 34.7600], // down to the coast road at Joppa
      [32.8300, 35.0700], // north past Acco
      [33.2705, 35.2038], // Tyre
      [32.9000, 35.3000], // back inland and south
      [32.2764, 35.1897], // Samaria
      [32.6725, 35.0880], // Carmel
      [32.5850, 35.1850], // Megiddo
      [32.0000, 35.0000], // south through the hills
      [31.5654, 34.8492], // Lachish
      [31.8000, 35.2000], // back toward the ridge
      [32.7000, 35.6000], // north-east across Galilee
      [33.2000, 36.0000], // toward the Barada
      [33.5138, 36.2765], // Damascus
      [35.1300, 36.7500], // the Hamath corridor
      [36.2000, 37.1000], // the Aleppo gap
      [36.8000, 40.5000], // east along the crescent's rim
      [36.3597, 43.1526], // Nineveh
      [34.5000, 43.8000], // down the Tigris
      [32.5355, 44.4275], // Babylon
      [32.1892, 48.2577]  // Susa
    ]
  },
  gospel: {
    label: "The Gospel & The Church",
    colour: "#e9d6a8",
    coords: [
      [31.7042, 35.2072], // Bethlehem
      [32.7009, 35.2035], // north to Nazareth
      [31.8370, 35.5470], // the Jordan baptism
      [32.8807, 35.5751], // Capernaum, on the lake
      [32.2000, 35.5200], // down the Jordan valley
      [31.8711, 35.4444], // past Jericho
      [31.7784, 35.2297], // Jerusalem — Golgotha
      [31.8392, 34.9892], // out to Emmaus
      [32.5000, 35.3000], // back north
      [33.4700, 36.1900], // the Damascus road
      [34.5000, 36.3000], // up the Orontes
      [36.2021, 36.1603], // Antioch
      [36.8000, 34.6000], // through the Cilician gates
      [37.5000, 30.5000], // across Asia Minor
      [37.9395, 27.3417], // Ephesus
      [37.7000, 24.5000], // the Aegean crossing
      [37.9061, 22.8791], // Corinth
      [41.0120, 24.2860], // Philippi
      [40.0000, 18.0000], // west toward Italy
      [41.8925, 12.4853], // Rome
      [39.0000, 20.0000], // east again, into exile
      [37.3086, 26.5478]  // Patmos
    ]
  }
};

/* Empire overlays. These are SCHEMATIC — coarse outlines meant to show
   which power held the ground when the story passed through, not survey
   boundaries. Modern national borders come from a real reference tile
   layer instead (see atlas.js), because those can be accurate and these
   honestly cannot. */
var EMPIRES = {
  ur3:      { name: "Sumer & Akkad",          when: "c. 2100 BC", colour: "#c8a24a" },
  canaan:   { name: "Canaanite city-states",  when: "c. 1850 BC", colour: "#b08d55" },
  egypt:    { name: "Egypt, New Kingdom",     when: "c. 1250 BC", colour: "#d8a13c" },
  israel:   { name: "Israel enters Canaan",   when: "c. 1210 BC", colour: "#c96f4a" },
  monarchy: { name: "The United Monarchy",    when: "c. 1000 BC", colour: "#8fb46b" },
  assyria:  { name: "The Assyrian Empire",    when: "c. 700 BC",  colour: "#9a5f4e" },
  babylon:  { name: "The Babylonian Empire",  when: "c. 580 BC",  colour: "#5f7fa8" },
  persia:   { name: "The Persian Empire",     when: "c. 500 BC",  colour: "#6f8fbd" },
  rome:     { name: "The Roman Empire",       when: "c. AD 60",   colour: "#a8474a" }
};

/* ==================================================================
   VIGNETTES — cinematic journey milestones across all 46 sites.
   ================================================================== */
var VIGNETTES = {
  ur: {
    figure: "Abram", title: "Abram Departs Ur",
    quote: "And they went forth with them from Ur of the Chaldees, to go into the land of Canaan.",
    ref: "Genesis 11:31",
    narrative: "Leaving the shadow of the great ziggurat behind, Abram sets out with his household into the desert on the strength of an unseen promise.",
    image: "assets/journey/ur.webp", fallback: "assets/artifacts/ziggurat-ur.png"
  },
  haran: {
    figure: "Abram", title: "The Call at Haran",
    quote: "Get thee out of thy country, and from thy kindred, and from thy father's house, unto a land that I will shew thee.",
    ref: "Genesis 12:1",
    narrative: "At the crossroads of the northern trade routes, the voice of the Almighty calls Abram southwest into the unknown.",
    image: "assets/journey/haran.webp", fallback: "assets/artifacts/beehive-haran.png"
  },
  shechem: {
    figure: "Abram", title: "The First Altar in Canaan",
    quote: "Unto thy seed will I give this land: and there builded he an altar unto the LORD.",
    ref: "Genesis 12:7",
    narrative: "Standing between the heights of Ebal and Gerizim, Abram builds an altar of stone to mark the land of promise.",
    image: "assets/journey/shechem.webp", fallback: "assets/artifacts/well-shechem.png"
  },
  bethel: {
    figure: "Jacob", title: "Jacob's Ladder",
    quote: "Surely the LORD is in this place; and I knew it not.",
    ref: "Genesis 28:16",
    narrative: "Fleeing into the night with a stone for a pillow, Jacob beholds angels ascending and descending a stairway to heaven.",
    image: "assets/journey/bethel.webp", fallback: "assets/artifacts/stone-bethel.png"
  },
  penuel: {
    figure: "Jacob", title: "The Wrestling at Penuel",
    quote: "I will not let thee go, except thou bless me.",
    ref: "Genesis 32:26",
    narrative: "At the solitary ford of the Jabbok, Jacob wrestles through the night and limps into the sunrise bearing the name Israel.",
    image: "assets/journey/penuel.webp", fallback: "assets/artifacts/ford-penuel.png"
  },
  hebron: {
    figure: "Abraham", title: "The Oaks of Mamre",
    quote: "Then Abram removed his tent, and came and dwelt in the plain of Mamre, which is in Hebron.",
    ref: "Genesis 13:18",
    narrative: "Beneath the ancient terebinth trees, Abraham pitches his tent and acquires the burial cave of Machpelah for his seed.",
    image: "assets/journey/hebron.webp", fallback: "assets/artifacts/cave-hebron.png"
  },
  beersheba: {
    figure: "Abraham", title: "The Well of Beersheba",
    quote: "Wherefore he called that place Beersheba; because there they sware both of them.",
    ref: "Genesis 21:31",
    narrative: "At the edge of the southern desert, Abraham plants a tamarisk tree and calls on the name of the everlasting God.",
    image: "assets/journey/beersheba.webp", fallback: "assets/artifacts/altar-beersheba.png"
  },
  moriah: {
    figure: "Abraham", title: "The Mount of Moriah",
    quote: "God will provide himself a lamb for a burnt offering, my son.",
    ref: "Genesis 22:8",
    narrative: "Ascending the silent ridge with wood and fire, Abraham's faith is proved as a ram caught in the thicket is offered instead.",
    image: "assets/journey/moriah.webp", fallback: "assets/artifacts/thicket-moriah.png"
  },
  dothan: {
    figure: "Joseph", title: "The Pit of Dothan",
    quote: "Come now therefore, and let us slay him, and cast him into some pit.",
    ref: "Genesis 37:20",
    narrative: "Stripped of his coat of many colours, young Joseph is cast into an empty cistern before being sold into Egyptian bondage.",
    image: "assets/journey/dothan.webp", fallback: "assets/artifacts/pit-dothan.png"
  },
  goshen: {
    figure: "Moses", title: "The Brickmakers of Goshen",
    quote: "And the children of Israel sighed by reason of the bondage, and they cried.",
    ref: "Exodus 2:23",
    narrative: "In the fertile delta under Egyptian taskmasters, Israel groans beneath heavy mortar until God remembers His covenant.",
    image: "assets/journey/goshen.png", fallback: "assets/artifacts/brick-goshen.png"
  },
  midian: {
    figure: "Moses", title: "The Burning Bush",
    quote: "Put off thy shoes from off thy feet, for the place whereon thou standest is holy ground.",
    ref: "Exodus 3:5",
    narrative: "Tending sheep on the backside of the desert, Moses stops before a desert thorn bush blazing with fire yet unconsumed.",
    image: "assets/journey/midian.png", fallback: "assets/artifacts/sandal-midian.png"
  },
  "yam-suph": {
    figure: "Moses", title: "The Parting of the Sea",
    quote: "Fear ye not, stand still, and see the salvation of the LORD.",
    ref: "Exodus 14:13",
    narrative: "With Pharaoh's chariots pursuing behind and waters before, Moses lifts his rod as the sea splits into towering walls of water.",
    image: "assets/journey/yam-suph.png", fallback: "assets/artifacts/wheel-yam-suph.png"
  },
  rephidim: {
    figure: "Moses", title: "Water from the Rock",
    quote: "Behold, I will stand before thee there upon the rock in Horeb; and thou shalt smite the rock.",
    ref: "Exodus 17:6",
    narrative: "In the parched wilderness, Moses strikes the granite crag, and living water gushes forth to quench the thirst of the multitude.",
    image: "assets/journey/rephidim.png", fallback: "assets/artifacts/staff-rephidim.png"
  },
  sinai: {
    figure: "Moses", title: "The Glory on Mount Sinai",
    quote: "And mount Sinai was altogether on a smoke, because the LORD descended upon it in fire.",
    ref: "Exodus 19:18",
    narrative: "Wrapped in thunder, lightning, and thick cloud, Moses ascends into the presence of God to receive the stone tablets.",
    image: "assets/journey/sinai.png", fallback: "assets/artifacts/tablet-sinai.png"
  },
  kadesh: {
    figure: "Joshua & Caleb", title: "The Spies of Kadesh",
    quote: "The land, which we passed through to search it, is an exceeding good land.",
    ref: "Numbers 14:7",
    narrative: "Returning from Canaan bearing giant clusters of grapes, Caleb and Joshua urge the congregation to trust the LORD.",
    image: "assets/journey/kadesh.png", fallback: "assets/artifacts/spy-kadesh.png"
  },
  nebo: {
    figure: "Moses", title: "The Vista from Mount Nebo",
    quote: "I have caused thee to see it with thine eyes, but thou shalt not go over thither.",
    ref: "Deuteronomy 34:4",
    narrative: "Standing on the windswept summit of Pisgah, the aged prophet gazes across the Jordan Valley at the inheritance of Israel.",
    image: "assets/journey/nebo.png", fallback: "assets/artifacts/vista-nebo.png"
  },
  jordan: {
    figure: "Joshua", title: "The Crossing of Jordan",
    quote: "The waters of Jordan shall be cut off from the waters that come down from above.",
    ref: "Joshua 3:13",
    narrative: "As the priests step into the flooded river bearing the Ark, the waters roll back in a heap, and Israel crosses into Canaan.",
    image: "assets/journey/jordan.png", fallback: "assets/artifacts/shell-jordan.png"
  },
  gilgal: {
    figure: "Joshua", title: "The Stones of Gilgal",
    quote: "What mean ye by these stones? Then ye shall let your children know, saying, Israel came over this Jordan on dry land.",
    ref: "Joshua 4:21-22",
    narrative: "Twelve riverbed stones are hoisted from the riverbed and piled at Gilgal as a perpetual monument of divine deliverance.",
    image: "assets/journey/gilgal.png", fallback: "assets/artifacts/stone-gilgal.png"
  },
  jericho: {
    figure: "Joshua", title: "The Trumpets of Jericho",
    quote: "So the people shouted when the priests blew with the trumpets... and the wall fell down flat.",
    ref: "Joshua 6:20",
    narrative: "After seven days of marching in solemn silence, the blast of rams' horns and the roar of the multitude bring down the fortress walls.",
    image: "assets/journey/jericho.png", fallback: "assets/artifacts/trumpet-jericho.png"
  },
  shiloh: {
    figure: "Samuel", title: "The Voice at Shiloh",
    quote: "Speak, LORD; for thy servant heareth.",
    ref: "1 Samuel 3:9",
    narrative: "In the sanctuary where the lamp of God burns through the night, a young boy hears his name called in the darkness.",
    image: "assets/journey/shiloh.png", fallback: "assets/artifacts/lamp-shiloh.png"
  },
  harod: {
    figure: "Gideon", title: "The Spring of Harod",
    quote: "By the three hundred men that lapped will I save you, and deliver the Midianites into thine hand.",
    ref: "Judges 7:7",
    narrative: "At the cool waters beneath Mount Gilboa, Gideon watches his warriors drink, paring the army down to three hundred clay jars and torches.",
    image: "assets/journey/harod.png", fallback: "assets/artifacts/pitcher-harod.png"
  },
  zorah: {
    figure: "Samson", title: "The Strong Man of Dan",
    quote: "And the Spirit of the LORD came mightily upon him... and he found a new jawbone of an ass.",
    ref: "Judges 15:14-15",
    narrative: "Amid the rocky crags of the Sorek Valley, the Nazarite champion breaks his bonds and scatters the Philistine host.",
    image: "assets/journey/zorah.png", fallback: "assets/artifacts/jawbone-zorah.png"
  },
  mizpah: {
    figure: "Samuel", title: "The Stone of Help",
    quote: "Hitherto hath the LORD helped us.",
    ref: "1 Samuel 7:12",
    narrative: "Samuel raises a standing stone on the ridge, naming it Ebenezer in thanksgiving for the thunderous deliverance of Israel.",
    image: "assets/journey/mizpah.png", fallback: "assets/artifacts/ebenezer-mizpah.png"
  },
  gibeah: {
    figure: "Saul & Jonathan", title: "The Pass of Bozez",
    quote: "There is no restraint to the LORD to save by many or by few.",
    ref: "1 Samuel 14:6",
    narrative: "From the rocky fortress of Gibeah, Jonathan and his armour-bearer scale the sharp crags of the pass to strike the Philistine garrison.",
    image: "assets/journey/gibeah.png", fallback: "assets/artifacts/lot-gibeah.png"
  },
  bethlehem: {
    figure: "David", title: "The Anointing of David",
    quote: "Arise, anoint him: for this is he.",
    ref: "1 Samuel 16:12",
    narrative: "Brought in from the sheep pastures with ruddiness and bright eyes, David is anointed by Samuel amidst his brethren.",
    image: "assets/journey/bethlehem.png", fallback: "assets/artifacts/lyre-jerusalem.png"
  },
  jerusalem: {
    figure: "David", title: "Zion, the City of David",
    quote: "So David dwelt in the fort, and called it the city of David.",
    ref: "2 Samuel 5:9",
    narrative: "Scaling the water shaft of the Jebusite stronghold, David establishes the royal citadel and brings up the Ark with joy.",
    image: "assets/journey/jerusalem.png", fallback: "assets/artifacts/lyre-jerusalem.png"
  },
  tyre: {
    figure: "Solomon & Hiram", title: "The Cedars of Lebanon",
    quote: "Now therefore command thou that they hew me cedar trees out of Lebanon.",
    ref: "1 Kings 5:6",
    narrative: "Gigantic cedar beams are floated down the Mediterranean coast to build the glorious house of the LORD on Mount Moriah.",
    image: "assets/journey/tyre.png", fallback: "assets/artifacts/cedar-tyre.png"
  },
  carmel: {
    figure: "Elijah", title: "The Fire on Mount Carmel",
    quote: "The God that answereth by fire, let him be God.",
    ref: "1 Kings 18:24",
    narrative: "Before the prophets of Baal and all Israel, Elijah calls upon the God of Abraham, and fire consumes the soaked sacrifice.",
    image: "assets/journey/carmel.png", fallback: "assets/artifacts/altar-carmel.png"
  },
  samaria: {
    figure: "Amos & Hosea", title: "The Ivory Houses of Samaria",
    quote: "The houses of ivory shall perish, and the great houses shall have an end, saith the LORD.",
    ref: "Amos 3:15",
    narrative: "The hilltop capital of Israel falls to the Assyrian siege engines as the prophets' warnings come to pass.",
    image: "assets/journey/samaria.png", fallback: "assets/artifacts/ivory-samaria.png"
  },
  megiddo: {
    figure: "Josiah", title: "The Plain of Megiddo",
    quote: "And king Josiah went against him; and he slew him at Megiddo.",
    ref: "2 Kings 23:29",
    narrative: "The ancient strategic pass and fortress where kings clashed and where prophecies foreshadow the final battle.",
    image: "assets/journey/megiddo.png", fallback: "assets/artifacts/gate-megiddo.png"
  },
  nineveh: {
    figure: "Jonah", title: "The Preacher at Nineveh",
    quote: "Yet forty days, and Nineveh shall be overthrown. So the people of Nineveh believed God.",
    ref: "Jonah 3:4-5",
    narrative: "Walking three days through the colossal Assyrian capital, Jonah's single message brings the king and citizens to sackcloth and ashes.",
    image: "assets/journey/nineveh.png", fallback: "assets/artifacts/library-nineveh.png"
  },
  lachish: {
    figure: "Hezekiah & Isaiah", title: "The Siege of Lachish",
    quote: "Be strong and courageous, be not afraid nor dismayed for the king of Assyria: for there be more with us than with him.",
    ref: "2 Chronicles 32:7",
    narrative: "Hezekiah's fortress burns under Assyrian catapults, but Jerusalem looks to Isaiah's God for shelter.",
    image: "assets/journey/lachish.png", fallback: "assets/artifacts/arrow-lachish.png"
  },
  babylon: {
    figure: "Daniel & Ezekiel", title: "Exile by the Euphrates",
    quote: "By the rivers of Babylon, there we sat down, yea, we wept, when we remembered Zion.",
    ref: "Psalms 137:1",
    narrative: "Beneath the blue-glazed Ishtar Gate, Daniel and the exiles resolve in their hearts not to defile themselves with the king's meat.",
    image: "assets/journey/babylon.png", fallback: "assets/artifacts/ishtar-babylon.png"
  },
  susa: {
    figure: "Esther", title: "For Such a Time as This",
    quote: "If I perish, I perish.",
    ref: "Esther 4:16",
    narrative: "In the marble halls of the Persian winter palace, Queen Esther approaches King Ahasuerus unbidden to plead for her people.",
    image: "assets/journey/susa.png", fallback: "assets/artifacts/seal-susa.png"
  },
  "damascus-exile": {
    figure: "Naaman & Elisha", title: "The Waters of Damascus",
    quote: "Are not Abana and Pharpar, rivers of Damascus, better than all the waters of Israel?",
    ref: "2 Kings 5:12",
    narrative: "The Syrian captain learns humility in the waters of Jordan, while Damascus remains the enduring crossroads of kings.",
    image: "assets/journey/damascus-exile.png", fallback: "assets/artifacts/scales-damascus.png"
  },
  "bethlehem-gospel": {
    figure: "Jesus, Mary & Joseph", title: "The Birth of the Messiah",
    quote: "And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a manger.",
    ref: "Luke 2:7",
    narrative: "Under the brilliance of the eastern star, shepherds find the newborn King of kings resting in a humble rock-cut manger.",
    image: "assets/journey/bethlehem-gospel.png", fallback: "assets/artifacts/manger-bethlehem.png"
  },
  nazareth: {
    figure: "Jesus", title: "The Spirit of the Lord",
    quote: "This day is this scripture fulfilled in your ears.",
    ref: "Luke 4:21",
    narrative: "Standing in the hilltop synagogue of his childhood, Jesus unrolls the scroll of Isaiah and proclaims liberty to the captives.",
    image: "assets/journey/nazareth.png", fallback: "assets/artifacts/scroll-nazareth.png"
  },
  "jordan-gospel": {
    figure: "Jesus & John the Baptist", title: "The Heavens Opened",
    quote: "This is my beloved Son, in whom I am well pleased.",
    ref: "Matthew 3:17",
    narrative: "As Jesus rises from the rushing waters of the Jordan, the Holy Spirit descends like a dove and the Father's voice speaks.",
    image: "assets/journey/jordan-gospel.png", fallback: "assets/artifacts/shell-jordan.png"
  },
  capernaum: {
    figure: "Peter & Jesus", title: "Fishers of Men",
    quote: "Fear not; from henceforth thou shalt catch men.",
    ref: "Luke 5:10",
    narrative: "On the shore of the sparkling Sea of Galilee, fishermen leave their nets, boats, and families to follow the Master.",
    image: "assets/journey/capernaum.png", fallback: "assets/artifacts/net-capernaum.png"
  },
  golgotha: {
    figure: "Jesus", title: "It is Finished",
    quote: "He is not here: for he is risen, as he said. Come, see the place where the Lord lay.",
    ref: "Matthew 28:6",
    narrative: "Outside the city gates, the Saviour yields up His spirit on the cross, and on the third day breaks the bonds of the tomb forever.",
    image: "assets/journey/golgotha.png", fallback: "assets/artifacts/shroud-golgotha.png"
  },
  emmaus: {
    figure: "The Resurrected Lord", title: "The Road to Emmaus",
    quote: "Did not our heart burn within us, while he talked with us by the way, and while he opened to us the scriptures?",
    ref: "Luke 24:32",
    narrative: "Walking at twilight, two sorrowful disciples have their eyes opened as the risen Lord breaks bread at their table.",
    image: "assets/journey/emmaus.png", fallback: "assets/artifacts/bread-emmaus.png"
  },
  "damascus-road": {
    figure: "Paul", title: "The Light from Heaven",
    quote: "Saul, Saul, why persecutest thou me?",
    ref: "Acts 9:4",
    narrative: "A blinding flash brighter than the midday sun strikes the persecutor to the earth, transforming Saul into the Apostle to the Gentiles.",
    image: "assets/journey/damascus-road.png", fallback: "assets/artifacts/river-damascus.png"
  },
  antioch: {
    figure: "Barnabas & Paul", title: "The Church at Antioch",
    quote: "And the disciples were called Christians first in Antioch.",
    ref: "Acts 11:26",
    narrative: "In the sprawling Syrian metropolis, Jews and Gentiles unite in the faith, commissioning Paul and Barnabas for their global mission.",
    image: "assets/journey/antioch.png", fallback: "assets/artifacts/name-antioch.png"
  },
  ephesus: {
    figure: "Paul", title: "The Word Prevails at Ephesus",
    quote: "So mightily grew the word of God and prevailed.",
    ref: "Acts 19:20",
    narrative: "Standing against the silver shrines of Artemis, Paul ministers for three years as the Gospel sweeps through Asia Minor.",
    image: "assets/journey/ephesus.png", fallback: "assets/artifacts/scroll-ephesus.png"
  },
  philippi: {
    figure: "Paul & Silas", title: "Songs at Midnight in Philippi",
    quote: "And at midnight Paul and Silas prayed, and sang praises unto God: and the prisoners heard them.",
    ref: "Acts 16:25",
    narrative: "Beaten and bound in the inner dungeon, midnight hymns bring an earthquake that shakes the foundations and frees the captives.",
    image: "assets/journey/philippi.png", fallback: "assets/artifacts/chain-philippi.png"
  },
  rome: {
    figure: "Paul", title: "The Prisoner in Rome",
    quote: "Preaching the kingdom of God, and teaching those things which concern the Lord Jesus Christ, with all confidence.",
    ref: "Acts 28:31",
    narrative: "Chained to a Roman soldier in his hired house, Paul writes the epistles that would anchor churches across the ages.",
    image: "assets/journey/rome.png", fallback: "assets/artifacts/chain-rome.png"
  },
  patmos: {
    figure: "John", title: "The Revelation on Patmos",
    quote: "I am Alpha and Omega, the beginning and the ending, saith the Lord, which is, and which was, and which is to come, the Almighty.",
    ref: "Revelation 1:8",
    narrative: "Exiled on the rocky Aegean island on the Lord's Day, John beholds the glorified Christ and the celestial New Jerusalem coming down from heaven.",
    image: "assets/journey/patmos.png", fallback: "assets/artifacts/ink-patmos.png"
  }
};

var HOME_VIEW = { center: [34.5, 36.0], zoom: 5 };

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SITES: SITES, ARCS: ARCS, ROUTES: ROUTES, EMPIRES: EMPIRES, VIGNETTES: VIGNETTES, HOME_VIEW: HOME_VIEW };
}
