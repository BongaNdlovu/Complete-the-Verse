/* ==================================================================
   TRUE / FALSE CLAIMS — the Judgement questions.
   Each claim is a standalone statement about scripture's people,
   places, numbers and events. The claim replaces the 7th verse
   question of every pilgrimage site (slot 6) and is drawn from the
   site's book territory where possible.

   Shape: { b: territory book (BOOKS_ORDER name),
            s: the claim shown to the player,
            v: true | false,
            why: the correction shown on a miss, with its reference }

   Authoring rules (enforced by test/truefalse.test.js):
   - statements are undisputed KJV facts — no debated authorship,
     no manuscript variants, no trick phrasing that could be read
     either way;
   - `why` always carries the anchor reference so a miss teaches;
   - `b` decides which sites surface the claim (territory match).
   ================================================================== */
const TF_CLAIMS = [

/* ---------- GENESIS ---------- */
{b:"Genesis", s:"Lot was Abraham's brother.", v:false, why:"Lot was Abram's nephew — his brother Haran's son (Genesis 12:5)."},
{b:"Genesis", s:"Sarah was Abraham's wife.", v:true, why:"God said: Sarah thy wife shall bear thee a son (Genesis 17:15-19)."},
{b:"Genesis", s:"Jacob was Isaac's father.", v:false, why:"Isaac was Jacob's father — the elder bore the younger (Genesis 25:26)."},
{b:"Genesis", s:"Abel rose up against Cain and slew him.", v:false, why:"Cain rose up against Abel his brother, and slew him (Genesis 4:8)."},
{b:"Genesis", s:"The ark rested upon the mountains of Sinai.", v:false, why:"The ark rested upon the mountains of Ararat (Genesis 8:4)."},
{b:"Genesis", s:"Noah took two of every clean beast into the ark.", v:false, why:"Clean beasts came in by sevens — two was the rule for unclean (Genesis 7:2)."},
{b:"Genesis", s:"Melchizedek was king of Salem and priest of the most high God.", v:true, why:"Melchizedek king of Salem brought forth bread and wine (Genesis 14:18)."},
{b:"Genesis", s:"Rachel was Jacob's daughter.", v:false, why:"Rachel was Jacob's wife, given him in Haran (Genesis 29:28)."},
{b:"Genesis", s:"Joseph's brothers sold him to the Ishmeelites for twenty pieces of silver.", v:true, why:"They sold Joseph to the Ishmeelites for twenty pieces of silver (Genesis 37:28)."},
{b:"Genesis", s:"Benjamin was Rachel's son.", v:true, why:"Benjamin was born of Rachel on the way to Ephrath (Genesis 35:16-18)."},
{b:"Genesis", s:"Eve was formed before Adam.", v:false, why:"Adam was formed first, then Eve — the rib taken from his side (Genesis 2:7, 21-22)."},
{b:"Genesis", s:"Adam called his wife's name Eve.", v:true, why:"Adam called his wife's name Eve, because she was the mother of all living (Genesis 3:20)."},
{b:"Genesis", s:"Esau sold his birthright for gold.", v:false, why:"He sold it for bread and pottage of lentiles (Genesis 25:33-34)."},
{b:"Genesis", s:"Pharaoh set Joseph over all the land of Egypt.", v:true, why:"Pharaoh said: thou shalt be over my house — without thee shall no man lift up his hand (Genesis 41:41-44)."},

/* ---------- EXODUS ---------- */
{b:"Exodus", s:"Moses was Jethro's father.", v:false, why:"Jethro was Moses' father in law, priest of Midian (Exodus 3:1)."},
{b:"Exodus", s:"Aaron was Moses' son.", v:false, why:"Aaron was Moses' brother — his mouth in Egypt (Exodus 4:14; 7:1)."},
{b:"Exodus", s:"Miriam was Aaron's sister.", v:true, why:"Miriam the prophetess, sister to Aaron, led the women with timbrels (Exodus 15:20)."},
{b:"Exodus", s:"The golden calf was fashioned by Aaron.", v:true, why:"Aaron fashioned it with a graving tool of the people's golden earrings (Exodus 32:2-4)."},
{b:"Exodus", s:"Egypt was smitten with seven plagues.", v:false, why:"Ten plagues fell — from blood to the death of the firstborn (Exodus 7-12)."},
{b:"Exodus", s:"Moses was fourscore years old when he spake unto Pharaoh.", v:true, why:"Aaron was three and eighty, and Moses fourscore, when they spake unto Pharaoh (Exodus 7:7)."},
{b:"Exodus", s:"The tabernacle was built by Moses's own hands alone.", v:false, why:"Bezaleel and Aholiab were filled with the spirit to build it (Exodus 31:1-6)."},
{b:"Exodus", s:"Moses was drawn out of the water by Pharaoh's daughter.", v:true, why:"She called his name Moses — drawn out of the water (Exodus 2:5-10)."},
{b:"Exodus", s:"Israel ate manna in the wilderness for twenty years.", v:false, why:"Israel did eat manna forty years, until they came to Canaan's border (Exodus 16:35)."},

/* ---------- LEVITICUS / NUMBERS / DEUTERONOMY ---------- */
{b:"Numbers", s:"The LORD opened the mouth of Balaam's ass.", v:true, why:"The ass saw the angel, and the LORD opened her mouth to speak (Numbers 22:28)."},
{b:"Numbers", s:"The spies searched the land of Canaan forty days.", v:true, why:"They returned from searching after forty days, bearing the cluster of Eschol (Numbers 13:25)."},
{b:"Numbers", s:"Israel wandered in the wilderness twenty years.", v:false, why:"Forty years — a year for each day of searching (Numbers 14:33-34)."},
{b:"Deuteronomy", s:"Moses entered the land of Canaan with Israel.", v:false, why:"Moses died in Moab upon Nebo, and was buried by the LORD — he saw the land, but did not cross (Deuteronomy 34:5)."},
{b:"Deuteronomy", s:"Joshua was full of the spirit of wisdom when Moses laid hands on him.", v:true, why:"Moses laid his hands upon him, and Israel hearkened unto him (Deuteronomy 34:9)."},

/* ---------- JOSHUA / JUDGES / RUTH ---------- */
{b:"Joshua", s:"Jericho's wall fell on the third day of circling.", v:false, why:"On the seventh day they compassed the city seven times, and the wall fell (Joshua 6:15, 20)."},
{b:"Joshua", s:"Rahab hid the two spies upon the roof of her house.", v:true, why:"She hid them with stalks of flax upon the roof (Joshua 2:4-6)."},
{b:"Joshua", s:"Achan took of the accursed thing at Jericho.", v:true, why:"Achan took of the accursed thing, and Israel fell before Ai (Joshua 7:1)."},
{b:"Judges", s:"Gideon went to battle with thirty thousand men.", v:false, why:"The LORD cut the army to three hundred men with lamps and trumpets (Judges 7:7, 16)."},
{b:"Judges", s:"Delilah cut Samson's hair with her own hands.", v:false, why:"She called for a man, and caused him to shave off his seven locks (Judges 16:19)."},
{b:"Judges", s:"Samson slew a thousand men with the jawbone of an ass.", v:true, why:"With the jawbone he slew a thousand men, and called the place Ramath-lehi (Judges 15:15-17)."},
{b:"Judges", s:"Deborah was a prophetess and a judge of Israel.", v:true, why:"Deborah, a prophetess, judged Israel at that time under a palm tree (Judges 4:4-5)."},
{b:"Ruth", s:"Ruth was Naomi's daughter in law.", v:true, why:"Ruth the Moabitess clave unto her, and returned with her to Bethlehem (Ruth 1:22)."},
{b:"Ruth", s:"Boaz was Ruth's brother.", v:false, why:"Boaz took Ruth to wife, and Obed was born of the union (Ruth 4:13)."},
{b:"Ruth", s:"Ruth was a native of Bethlehem.", v:false, why:"Ruth was a Moabitess — she came to Bethlehem with Naomi (Ruth 1:22)."},
{b:"Ruth", s:"Obed, Ruth's son, was the grandfather of David.", v:true, why:"Obed begat Jesse, and Jesse begat David (Ruth 4:17)."},

/* ---------- SAMUEL / KINGS / CHRONICLES ---------- */
{b:"1 Samuel", s:"Jonathan was Saul's son.", v:true, why:"Jonathan, Saul's son, delighted much in David (1 Samuel 19:1-2)."},
{b:"1 Samuel", s:"David slew Goliath with a sword.", v:false, why:"David slew him with a sling and a stone — the sword was only used to take off his head (1 Samuel 17:49-51)."},
{b:"1 Samuel", s:"David told Saul he had slain both a lion and a bear.", v:true, why:"Thy servant slew both the lion and the bear (1 Samuel 17:36)."},
{b:"1 Samuel", s:"Goliath was a giant of Ashdod.", v:false, why:"Goliath of Gath, six cubits and a span (1 Samuel 17:4)."},
{b:"1 Samuel", s:"David was Saul's grandson.", v:false, why:"David became Saul's son in law, given Michal to wife (1 Samuel 18:27-28)."},
{b:"1 Kings", s:"Solomon asked God for an understanding heart to judge the people.", v:true, why:"Give therefore thy servant an understanding heart to judge thy people (1 Kings 3:9)."},
{b:"1 Kings", s:"Solomon built the ark of the covenant.", v:false, why:"Bezaleel made the ark in the wilderness; Solomon built the temple that housed it (Exodus 37:1; 1 Kings 6)."},
{b:"1 Kings", s:"Solomon's temple was seven years in building.", v:true, why:"He was seven years in building it (1 Kings 6:38)."},
{b:"1 Kings", s:"The queen of Sheba came to prove David with hard questions.", v:false, why:"She came to prove Solomon with hard questions at Jerusalem (1 Kings 10:1)."},
{b:"2 Kings", s:"Elijah went up by a whirlwind into heaven.", v:true, why:"A chariot of fire parted them, and Elijah went up by a whirlwind (2 Kings 2:11)."},
{b:"2 Kings", s:"Naaman the Syrian dipped himself six times in Jordan.", v:false, why:"He dipped himself seven times, and his flesh came again like a child's (2 Kings 5:14)."},
{b:"2 Kings", s:"Josiah was eight years old when he began to reign.", v:true, why:"Josiah was eight years old when he began to reign (2 Kings 22:1)."},

/* ---------- EZRA / NEHEMIAH / ESTHER ---------- */
{b:"Nehemiah", s:"Nehemiah was the king's cupbearer.", v:true, why:"I was the king's cupbearer (Nehemiah 1:11)."},
{b:"Nehemiah", s:"The wall of Jerusalem was finished in fifty and two days.", v:true, why:"So the wall was finished... in fifty and two days, notwithstanding the enemies' plots (Nehemiah 6:15)."},
{b:"Esther", s:"Esther was king Ahasuerus's daughter.", v:false, why:"Ahasuerus made Esther queen in Vashti's place — his wife, not his daughter (Esther 2:17)."},
{b:"Esther", s:"Mordecai sat in the king's gate.", v:true, why:"Mordecai sat in the king's gate, and discovered the plot of Bigthan and Teresh (Esther 2:19-21)."},
{b:"Esther", s:"Haman was Esther's cousin.", v:false, why:"Mordecai was her cousin — Haman was the Agagite who sought to destroy her people (Esther 2:7; 3:1)."},

/* ---------- JOB / PSALMS / PROVERBS / ECCLESIASTES ---------- */
{b:"Job", s:"Job's friends sat with him seven days and seven nights without speaking.", v:true, why:"They sat down with him upon the ground seven days and seven nights, and none spake a word (Job 2:13)."},
{b:"Job", s:"Job cursed God to his face.", v:false, why:"In all this Job sinned not, nor charged God foolishly (Job 1:22)."},
{b:"Psalms", s:"Psalm 23 begins 'The LORD is my shepherd'.", v:true, why:"The LORD is my shepherd; I shall not want (Psalm 23:1)."},
{b:"Psalms", s:"Psalm 1 blesses the man who walks in the counsel of the ungodly.", v:false, why:"Blessed is the man that walketh NOT in the counsel of the ungodly (Psalm 1:1)."},
{b:"Proverbs", s:"Proverbs teaches that a soft answer stirreth up wrath.", v:false, why:"A soft answer turneth away wrath; grievous words stir up anger (Proverbs 15:1)."},
{b:"Proverbs", s:"The fear of the LORD is the beginning of knowledge.", v:true, why:"The fear of the LORD is the beginning of knowledge (Proverbs 1:7)."},
{b:"Ecclesiastes", s:"Ecclesiastes opens with 'vanity of vanities... all is vanity'.", v:true, why:"Vanity of vanities, saith the Preacher, vanity of vanities; all is vanity (Ecclesiastes 1:2)."},

/* ---------- MAJOR PROPHETS ---------- */
{b:"Isaiah", s:"Isaiah was three days and three nights in the fish's belly.", v:false, why:"That was Jonah — Isaiah saw the Lord on His throne instead (Jonah 1:17; Isaiah 6:1)."},
{b:"Isaiah", s:"Isaiah saw the Lord on a throne in the year king Uzziah died.", v:true, why:"In the year that king Uzziah died I saw also the Lord sitting upon a throne (Isaiah 6:1)."},
{b:"Jeremiah", s:"Jeremiah was cast into a dungeon.", v:true, why:"They let him down with cords into the dungeon of Malchiah — he sank in the mire (Jeremiah 38:6)."},
{b:"Jeremiah", s:"Jeremiah was carried to Babylon with the captives.", v:false, why:"Jeremiah was left in the land with the poor, and later taken into Egypt (Jeremiah 39:11-12; 43:5-7)."},
{b:"Ezekiel", s:"Ezekiel prophesied to a valley of dry bones.", v:true, why:"Prophesy upon these bones, and say unto them, O ye dry bones (Ezekiel 37:4)."},
{b:"Daniel", s:"Daniel was cast into the fiery furnace.", v:false, why:"Daniel's three friends were cast into the furnace — Daniel was elsewhere (Daniel 3:21-26)."},
{b:"Daniel", s:"Daniel interpreted the handwriting on the wall.", v:true, why:"MENE, MENE, TEKEL, UPHARSIN — this is the interpretation of the thing (Daniel 5:25-28)."},
{b:"Daniel", s:"Shadrach, Meshach, and Abed-nego bowed down to the golden image.", v:false, why:"They answered: we will not serve thy gods, nor worship the golden image (Daniel 3:18)."},
{b:"Daniel", s:"Daniel's three friends came out of the fire without even the smell of flame.", v:true, why:"Neither were their coats changed, nor had the smell of fire passed on them (Daniel 3:27)."},

/* ---------- MINOR PROPHETS ---------- */
{b:"Jonah", s:"God sent Jonah to preach to Tarshish.", v:false, why:"Arise, go to Nineveh — Tarshish was the port he fled to (Jonah 1:2-3)."},
{b:"Jonah", s:"A great fish swallowed Jonah.", v:true, why:"The LORD had prepared a great fish to swallow up Jonah (Jonah 1:17)."},
{b:"Amos", s:"Amos was a priest of Bethel.", v:false, why:"I was no prophet, but an herdman of Tekoa (Amos 7:14)."},
{b:"Hosea", s:"Hosea took Gomer the daughter of Diblaim for a wife.", v:true, why:"So he went and took Gomer the daughter of Diblaim (Hosea 1:3)."},
{b:"Micah", s:"Micah foretold a ruler coming out of Bethlehem.", v:true, why:"But thou, Bethlehem Ephratah — out of thee shall he come forth unto me that is to be ruler in Israel (Micah 5:2)."},

/* ---------- MATTHEW ---------- */
{b:"Matthew", s:"Peter betrayed Jesus for thirty pieces of silver.", v:false, why:"Judas asked the chief priests for thirty pieces of silver (Matthew 26:14-15)."},
{b:"Matthew", s:"Jesus fasted in the wilderness thirty days and thirty nights.", v:false, why:"He fasted forty days and forty nights (Matthew 4:2)."},
{b:"Matthew", s:"John the Baptist did eat locusts and wild honey.", v:true, why:"His meat was locusts and wild honey (Matthew 3:4)."},
{b:"Matthew", s:"John the Baptist was Andrew's brother.", v:false, why:"Andrew was Peter's brother (Matthew 10:2)."},
{b:"Matthew", s:"Andrew was Peter's brother.", v:true, why:"The first... Andrew, and Peter his brother (Matthew 10:2)."},
{b:"Matthew", s:"Jesus fed five thousand with five loaves and two fishes.", v:true, why:"Five loaves and two fishes fed five thousand men, beside women and children (Matthew 14:19-21)."},
{b:"Matthew", s:"Jesus fed the four thousand with five loaves.", v:false, why:"The four thousand were fed with seven loaves and a few little fishes (Matthew 15:34-38)."},
{b:"Matthew", s:"The wise men offered gold, frankincense, and myrrh.", v:true, why:"They presented unto him gifts; gold, and frankincense, and myrrh (Matthew 2:11)."},
{b:"Matthew", s:"The gospel of Matthew names three wise men.", v:false, why:"Their number is never given — only their three gifts are named (Matthew 2:1, 11)."},
{b:"Matthew", s:"Peter walked on the water to go to Jesus.", v:true, why:"And when Peter was come down out of the ship, he walked on the water (Matthew 14:29)."},
{b:"Matthew", s:"The Sermon on the Mount was delivered in the synagogue.", v:false, why:"He went up into a mountain — and when he was set, he taught them (Matthew 5:1-2)."},

/* ---------- MARK ---------- */
{b:"Mark", s:"Jesus stilled the storm with the words 'Peace, be still'.", v:true, why:"And he arose, and rebuked the wind, and said unto the sea, Peace, be still (Mark 4:39)."},
{b:"Mark", s:"Mark was one of the twelve apostles.", v:false, why:"He is not in the twelve — the lists name no Mark (Matthew 10:2-4)."},
{b:"Mark", s:"Bartimaeus was a blind man healed at Jericho.", v:true, why:"Blind Bartimaeus sat by the highway side begging, and received his sight (Mark 10:46-52)."},

/* ---------- LUKE ---------- */
{b:"Luke", s:"Jesus was born in Nazareth.", v:false, why:"He was born in Bethlehem of Judaea, the city of David (Luke 2:4-7)."},
{b:"Luke", s:"The shepherds came with haste to the manger.", v:true, why:"They came with haste, and found Mary and Joseph, and the babe lying in a manger (Luke 2:16)."},
{b:"Luke", s:"Zacchaeus climbed up into a sycomore tree to see Jesus.", v:true, why:"He ran before, and climbed up into a sycomore tree to see him (Luke 19:4)."},
{b:"Luke", s:"The prodigal son made himself a keeper of swine.", v:true, why:"He sent him into his fields to feed swine, and he would fain have filled his belly with husks (Luke 15:15-16)."},
{b:"Luke", s:"Gabriel announced the birth of John to Zacharias in the temple.", v:true, why:"I am Gabriel, that stand in the presence of God — thy wife Elisabeth shall bear thee a son (Luke 1:19-20)."},
{b:"Luke", s:"Luke's gospel is addressed to a man named Theophilus.", v:true, why:"It seemed good to me also... most excellent Theophilus (Luke 1:3)."},

/* ---------- JOHN ---------- */
{b:"John", s:"Jesus turned water into blood at the marriage in Cana.", v:false, why:"He turned water into wine — the first of his miracles (John 2:9, 11)."},
{b:"John", s:"Nicodemus came to Jesus by night.", v:true, why:"The same came to Jesus by night, and said unto him, Rabbi (John 3:2)."},
{b:"John", s:"Lazarus had lain in the grave five days when Jesus called him.", v:false, why:"By this time he stinketh: for he hath been dead four days (John 11:39)."},
{b:"John", s:"Mary Magdalene was one of the twelve apostles.", v:false, why:"She is never numbered among the twelve — she followed and ministered to them (Luke 8:1-3)."},
{b:"John", s:"Mary Magdalene was the first to see the risen Jesus.", v:true, why:"Jesus saith unto her, Mary — she turned and said Rabboni (John 20:16)."},
{b:"John", s:"Thomas was called Didymus.", v:true, why:"Thomas, which is called Didymus (John 11:16)."},
{b:"John", s:"Jesus had children.", v:false, why:"The scriptures never attribute children to Jesus — nothing in any gospel or epistle says so."},
{b:"John", s:"John's gospel begins 'In the beginning was the Word'.", v:true, why:"In the beginning was the Word, and the Word was with God (John 1:1)."},

/* ---------- ACTS ---------- */
{b:"Acts", s:"Paul was one of the twelve apostles.", v:false, why:"Matthias was chosen to fill Judas' bishoprick — Paul was called later (Acts 1:26; 9:15)."},
{b:"Acts", s:"Matthias was chosen to fill the place of Judas.", v:true, why:"The lot fell upon Matthias; and he was numbered with the eleven (Acts 1:26)."},
{b:"Acts", s:"Stephen wrote the book of Acts.", v:false, why:"Acts opens as a continuation of Luke's gospel to Theophilus — Luke wrote both (Acts 1:1; Luke 1:3-4)."},
{b:"Acts", s:"Philip baptized the Ethiopian eunuch.", v:true, why:"They went down both into the water, both Philip and the eunuch; and he baptized him (Acts 8:38)."},
{b:"Acts", s:"Saul of Tarsus was three days without sight after the road to Damascus.", v:true, why:"He was three days without sight, and neither did eat nor drink (Acts 9:9)."},
{b:"Acts", s:"Paul was born in Jerusalem.", v:false, why:"I am a man which am a Jew of Tarsus — brought up in Jerusalem (Acts 22:3)."},
{b:"Acts", s:"Peter raised Tabitha, called Dorcas, from the dead.", v:true, why:"Tabitha, arise — and she opened her eyes (Acts 9:40)."},
{b:"Acts", s:"Paul was a tentmaker by trade.", v:true, why:"They were tentmakers — and he wrought with them (Acts 18:3)."},
{b:"Acts", s:"Pentecost fell upon the disciples in Galilee.", v:false, why:"They were all with one accord in one place at Jerusalem (Acts 2:1, 14)."},
{b:"Acts", s:"Paul was shipwrecked on the island called Melita.", v:true, why:"They escaped safe to land on the island called Melita (Acts 28:1)."},
{b:"Acts", s:"Paul and Barnabas parted company over John Mark.", v:true, why:"The contention was so sharp between them, that they departed asunder (Acts 15:37-39)."},

/* ---------- EPISTLES ---------- */
{b:"Romans", s:"Romans was addressed to the church at Corinth.", v:false, why:"To all that be at Rome — beloved of God, called to be saints (Romans 1:7)."},
{b:"Romans", s:"Paul calls himself a servant of Jesus Christ in Romans.", v:true, why:"Paul, a servant of Jesus Christ, called to be an apostle (Romans 1:1)."},
{b:"Ephesians", s:"Ephesians teaches that salvation is earned by works.", v:false, why:"For by grace are ye saved through faith... not of works, lest any man should boast (Ephesians 2:8-9)."},
{b:"Galatians", s:"Galatians lists love, joy, and peace among the fruit of the Spirit.", v:true, why:"The fruit of the Spirit is love, joy, peace, longsuffering... (Galatians 5:22)."},
{b:"Philippians", s:"Philippians says 'Rejoice in the Lord alway'.", v:true, why:"Rejoice in the Lord alway: and again I say, Rejoice (Philippians 4:4)."},
{b:"James", s:"James wrote to the twelve tribes scattered abroad.", v:true, why:"To the twelve tribes which are scattered abroad, greeting (James 1:1)."},
{b:"James", s:"James says faith without works is dead.", v:true, why:"But wilt thou know, O vain man, that faith without works is dead? (James 2:20)."},
{b:"Hebrews", s:"The epistle to the Hebrews names Paul as its author in the opening verse.", v:false, why:"Hebrews opens with God speaking by his Son — no human author is named (Hebrews 1:1-2)."},
{b:"1 Peter", s:"Peter bids believers cast all their care upon the Lord.", v:true, why:"Casting all your care upon him; for he careth for you (1 Peter 5:7)."},
{b:"1 John", s:"John wrote 'God is love' in his first epistle.", v:true, why:"He that loveth not knoweth not God; for God is love (1 John 4:8)."},
{b:"Titus", s:"Titus was left in Crete to ordain elders in every city.", v:true, why:"I left thee in Crete, that thou shouldest set in order... and ordain elders (Titus 1:5)."},
{b:"1 Timothy", s:"Paul called Timothy his own son in the faith.", v:true, why:"Unto Timothy, my own son in the faith (1 Timothy 1:2)."},
{b:"Revelation", s:"The Revelation was given to Peter.", v:false, why:"The Revelation of Jesus Christ... unto his servant John (Revelation 1:1)."},

/* ---------- REVELATION ---------- */
{b:"Revelation", s:"Revelation opens with messages to seven churches.", v:true, why:"John writes to the seven churches which are in Asia (Revelation 1:4; 2-3)."},
{b:"Revelation", s:"The number of the beast is six hundred sixteen.", v:false, why:"It is six hundred threescore and six — 666 (Revelation 13:18)."},
{b:"Revelation", s:"The tree of life bears twelve manner of fruits.", v:true, why:"Which bare twelve manner of fruits, and yielded her fruit every month (Revelation 22:2)."},
{b:"Revelation", s:"Jesus closes the Revelation saying 'Surely I come quickly'.", v:true, why:"Surely I come quickly. Amen. Even so, come, Lord Jesus (Revelation 22:20)."}
];

if (typeof module !== "undefined" && module.exports){
  module.exports = { TF_CLAIMS };
}
