/* ==================================================================
   VERSES — MORE. Hand-authored expansion of the bank.

   Kept separate from verses-extra.js because that file is regenerated
   by scripts/build-verse-extra.js and anything written here by hand
   would be destroyed the next time it runs.

   Three rules this file holds itself to, beyond the QA gate:

   1. NO SINGLE-WORD BLANKS. A one-word gap is a vocabulary question —
      "I do set my ___ in the cloud" tests whether you know the word
      "bow", not whether you know Genesis 9. Every blank here is a
      phrase somebody could hold in their head, which is the thing the
      game is named after.

   2. Distractors have to be wrong about Scripture, not wrong about
      English. If you can throw one out without knowing the verse — a
      tense that does not agree, a modernised "thee" — it is doing no
      work. The gate enforces most of this; the rest is judgement.

   3. NO REFERENCE THAT THE BANK ALREADY USES. The gate only rejects a
      repeated reference AND blank together, so the same verse could
      legally appear twice with different gaps — but a player would just
      see the same verse twice in one run. Every reference below is new
      to the bank.

   Text is King James throughout, which is public domain.
   ================================================================== */

var VERSES_MORE = [

/* ---------------------------- LAW ---------------------------- */
{b:"Genesis",r:"Genesis 1:27",t:2,p:"So God created man in his own image,",a:"in the image of God",s:"created he him; male and female created he them.",d:["after his own likeness","in the likeness of angels","after the similitude of God"]},
{b:"Genesis",r:"Genesis 15:6",t:3,p:"And he believed in the LORD; and he counted it to him",a:"for righteousness",s:".",d:["for a blessing","for his justice","unto salvation"]},
{b:"Genesis",r:"Genesis 28:15",t:4,p:"And, behold, I am with thee, and will keep thee in all places",a:"whither thou goest",s:", and will bring thee again into this land.",d:["wheresoever thou art","where thou dwellest","whithersoever thou turnest"]},

{b:"Exodus",r:"Exodus 33:14",t:2,p:"And he said, My presence shall go with thee, and",a:"I will give thee rest",s:".",d:["I will grant thee peace","I will give thee comfort","thou shalt find favour"]},
{b:"Exodus",r:"Exodus 34:6",t:3,p:"And the LORD passed by before him, and proclaimed, The LORD, The LORD God,",a:"merciful and gracious",s:", longsuffering, and abundant in goodness and truth,",d:["mighty and terrible","holy and righteous","gracious and merciful"]},

{b:"Leviticus",r:"Leviticus 19:32",t:5,p:"Thou shalt rise up before the hoary head, and",a:"honour the face of the old man",s:", and fear thy God: I am the LORD.",d:["reverence them that are aged","give place unto the elder","bow before the grey headed"]},
{b:"Leviticus",r:"Leviticus 6:13",t:5,p:"The fire shall ever be burning upon the altar;",a:"it shall never go out",s:".",d:["it shall not be quenched","the flame shall not fail","it shall burn continually"]},

{b:"Numbers",r:"Numbers 14:18",t:4,p:"The LORD is longsuffering, and of great mercy,",a:"forgiving iniquity and transgression",s:", and by no means clearing the guilty.",d:["pardoning sin and rebellion","forgiving trespass and folly","blotting out every offence"]},
{b:"Numbers",r:"Numbers 32:23",t:3,p:"But if ye will not do so, behold, ye have sinned against the LORD: and",a:"be sure your sin will find you out",s:".",d:["your iniquity shall be remembered","the LORD shall require it of you","your transgression shall not be hid"]},

{b:"Deuteronomy",r:"Deuteronomy 8:3",t:3,p:"man doth not live by bread only, but by every word that proceedeth out of",a:"the mouth of the LORD",s:"doth man live.",d:["the mouth of his prophets","the law of the LORD","the counsel of God"]},
{b:"Deuteronomy",r:"Deuteronomy 6:7",t:4,p:"And thou shalt teach them diligently unto thy children, and shalt talk of them",a:"when thou sittest in thine house",s:", and when thou walkest by the way,",d:["when thou art at rest","while thou abidest at home","when thou liest down at even"]},

/* ---------------------------- HISTORY ---------------------------- */
{b:"Joshua",r:"Joshua 1:8",t:3,p:"This book of the law shall not depart out of thy mouth; but thou shalt",a:"meditate therein day and night",s:", that thou mayest observe to do according to all that is written therein.",d:["keep it in thine heart","ponder it morning and evening","teach it to thy children"]},
{b:"Joshua",r:"Joshua 10:25",t:3,p:"And Joshua said unto them, Fear not, nor be dismayed,",a:"be strong and of good courage",s:": for thus shall the LORD do to all your enemies.",d:["be valiant and of great might","stand fast and be of good cheer","be bold and of a stout heart"]},

{b:"Judges",r:"Judges 7:20",t:4,p:"and they cried, The sword of the LORD,",a:"and of Gideon",s:".",d:["and of Israel","and of his host","and of the mighty men"]},
{b:"Judges",r:"Judges 16:28",t:5,p:"And Samson called unto the LORD, and said, O Lord GOD,",a:"remember me, I pray thee",s:", and strengthen me, I pray thee, only this once, O God,",d:["hear me yet this once","forget not thy servant","look upon mine affliction"]},

{b:"Ruth",r:"Ruth 4:14",t:4,p:"And the women said unto Naomi, Blessed be the LORD, which hath not left thee this day",a:"without a kinsman",s:", that his name may be famous in Israel.",d:["without an heir","without a redeemer","without a son"]},
{b:"Ruth",r:"Ruth 1:17",t:5,p:"Where thou diest, will I die, and there will I be buried:",a:"the LORD do so to me",s:", and more also, if ought but death part thee and me.",d:["the LORD judge between us","God be witness betwixt thee and me","the LORD deal kindly with me"]},

{b:"1 Samuel",r:"1 Samuel 2:2",t:4,p:"There is none holy as the LORD: for there is none beside thee:",a:"neither is there any rock like our God",s:".",d:["nor any refuge save the LORD","neither is there strength but in him","nor any fortress like unto him"]},
{b:"1 Samuel",r:"1 Samuel 12:24",t:4,p:"Only fear the LORD, and",a:"serve him in truth with all your heart",s:": for consider how great things he hath done for you.",d:["walk before him in uprightness","cleave unto him with a perfect mind","obey his voice with all your soul"]},

{b:"2 Samuel",r:"2 Samuel 7:16",t:4,p:"And thine house and thy kingdom shall be established for ever before thee:",a:"thy throne shall be established for ever",s:".",d:["thy seed shall endure for ever","thy name shall be great among the nations","thy kingdom shall not be moved"]},
{b:"2 Samuel",r:"2 Samuel 12:13",t:4,p:"And David said unto Nathan, I have sinned against the LORD. And Nathan said unto David,",a:"The LORD also hath put away thy sin",s:"; thou shalt not die.",d:["The LORD hath heard thy prayer","The LORD hath covered thy transgression","The LORD hath turned from his anger"]},

{b:"1 Kings",r:"1 Kings 8:57",t:4,p:"The LORD our God be with us, as he was with our fathers: let him not leave us,",a:"nor forsake us",s:":",d:["nor cast us off","nor turn from us","nor forget us"]},
{b:"1 Kings",r:"1 Kings 17:16",t:5,p:"And the barrel of meal wasted not,",a:"neither did the cruse of oil fail",s:", according to the word of the LORD.",d:["nor did the jar of oil empty","neither was the vessel found dry","nor did her store diminish"]},

{b:"2 Kings",r:"2 Kings 5:13",t:5,p:"if the prophet had bid thee do some great thing, wouldest thou not have done it? how much rather then, when he saith to thee,",a:"Wash, and be clean",s:"?",d:["Go, and be healed","Bathe, and be made whole","Dip, and be cleansed"]},
{b:"2 Kings",r:"2 Kings 22:19",t:5,p:"Because thine heart was tender, and thou hast humbled thyself before the LORD,",a:"I also have heard thee",s:", saith the LORD.",d:["I have not forgotten thee","I have seen thy tears","I have spared thee this day"]},

{b:"1 Chronicles",r:"1 Chronicles 16:11",t:4,p:"Seek the LORD and his strength,",a:"seek his face continually",s:".",d:["call upon his name alway","wait upon him without ceasing","seek his favour evermore"]},
{b:"1 Chronicles",r:"1 Chronicles 29:14",t:5,p:"But who am I, and what is my people, that we should be able",a:"to offer so willingly after this sort",s:"? for all things come of thee.",d:["to bring such gifts before thee","to give of our own hand","to present so great an offering"]},

{b:"2 Chronicles",r:"2 Chronicles 15:2",t:4,p:"The LORD is with you, while ye be with him; and if ye seek him,",a:"he will be found of you",s:"; but if ye forsake him, he will forsake you.",d:["he will hear your cry","he will not turn away","he will answer you speedily"]},
{b:"2 Chronicles",r:"2 Chronicles 32:8",t:5,p:"With him is an arm of flesh; but with us is",a:"the LORD our God to help us",s:", and to fight our battles.",d:["the mighty God of Israel","the arm of the Almighty","the LORD of hosts our shield"]},

{b:"Ezra",r:"Ezra 8:23",t:5,p:"So we fasted and besought our God for this: and",a:"he was intreated of us",s:".",d:["he heard our petition","he turned away his anger","he answered from heaven"]},
{b:"Ezra",r:"Ezra 1:3",t:5,p:"Who is there among you of all his people?",a:"his God be with him",s:", and let him go up to Jerusalem,",d:["the LORD be his portion","may his God prosper him","let the Almighty keep him"]},

{b:"Nehemiah",r:"Nehemiah 4:14",t:4,p:"Be not ye afraid of them: remember the Lord, which is great and terrible, and",a:"fight for your brethren",s:", your sons, and your daughters, your wives, and your houses.",d:["stand up for your people","contend for your households","defend ye the city"]},
{b:"Nehemiah",r:"Nehemiah 2:20",t:5,p:"Then answered I them, and said unto them, The God of heaven,",a:"he will prosper us",s:"; therefore we his servants will arise and build:",d:["he shall defend our cause","he will establish the work","he hath given us favour"]},

{b:"Esther",r:"Esther 9:22",t:5,p:"the month which was turned unto them from sorrow to joy, and",a:"from mourning into a good day",s:".",d:["from weeping into laughter","from darkness into light","from grief unto gladness"]},
{b:"Esther",r:"Esther 6:1",t:5,p:"On that night",a:"could not the king sleep",s:", and he commanded to bring the book of records of the chronicles;",d:["the king was sore troubled","sleep fled from the king","the king arose in haste"]},

/* ---------------------------- POETRY ---------------------------- */
{b:"Job",r:"Job 42:2",t:4,p:"I know that thou canst do every thing, and that",a:"no thought can be withholden from thee",s:".",d:["none can stay thy hand","thy counsel shall surely stand","nothing is hid from thine eyes"]},
/* Job 23:10 is already in verses-extra.js with the same blank — a second
   copy would only reappear as the same verse mid-run. */

{b:"Ecclesiastes",r:"Ecclesiastes 3:11",t:4,p:"He hath made every thing beautiful in his time: also",a:"he hath set the world in their heart",s:", so that no man can find out the work that God maketh.",d:["he hath given them a season","he hath put wisdom in their inward parts","he hath hid his counsel from them"]},
{b:"Ecclesiastes",r:"Ecclesiastes 9:10",t:4,p:"Whatsoever thy hand findeth to do,",a:"do it with thy might",s:"; for there is no work, nor device, nor knowledge, nor wisdom, in the grave, whither thou goest.",d:["do it with all thy heart","do it without delay","perform it faithfully"]},

{b:"Song of Solomon",r:"Song of Solomon 2:4",t:5,p:"He brought me to the banqueting house, and",a:"his banner over me was love",s:".",d:["his hand upon me was gentle","his love toward me was great","his shadow over me was sweet"]},
{b:"Song of Solomon",r:"Song of Solomon 4:7",t:5,p:"Thou art all fair, my love;",a:"there is no spot in thee",s:".",d:["thou art without blemish","no fault is found in thee","there is no stain upon thee"]},

/* ---------------------------- PROPHETS ---------------------------- */
{b:"Jeremiah",r:"Jeremiah 1:5",t:4,p:"Before I formed thee in the belly I knew thee; and",a:"before thou camest forth out of the womb",s:"I sanctified thee, and I ordained thee a prophet unto the nations.",d:["or ever thou wast conceived","while thou wast yet unborn","before thy days began"]},
{b:"Jeremiah",r:"Jeremiah 6:16",t:4,p:"ask for the old paths, where is the good way, and walk therein, and",a:"ye shall find rest for your souls",s:".",d:["your soul shall be at peace","ye shall be established for ever","ye shall walk in safety"]},

{b:"Lamentations",r:"Lamentations 3:25",t:5,p:"The LORD is good unto them that wait for him, to",a:"the soul that seeketh him",s:".",d:["the heart that trusteth in him","every one that calleth on him","the man that feareth him"]},
{b:"Lamentations",r:"Lamentations 3:26",t:5,p:"It is good that a man should both hope and",a:"quietly wait for the salvation of the LORD",s:".",d:["patiently abide the day of the LORD","silently look for his deliverance","meekly trust in the mercy of God"]},

{b:"Ezekiel",r:"Ezekiel 18:32",t:5,p:"For I have no pleasure in the death of him that dieth, saith the Lord GOD: wherefore",a:"turn yourselves, and live ye",s:".",d:["repent, and be ye saved","return, and ye shall not die","turn ye, and be healed"]},
{b:"Ezekiel",r:"Ezekiel 34:16",t:5,p:"I will seek that which was lost, and",a:"bring again that which was driven away",s:", and will bind up that which was broken,",d:["gather them that were scattered","restore the wanderer to the fold","fetch home the strayed sheep"]},

{b:"Daniel",r:"Daniel 2:22",t:5,p:"He revealeth the deep and secret things: he knoweth what is in the darkness, and",a:"the light dwelleth with him",s:".",d:["the day is his also","darkness hideth not from him","the light is his dwelling place"]},
{b:"Daniel",r:"Daniel 4:35",t:5,p:"and he doeth according to his will in the army of heaven, and",a:"among the inhabitants of the earth",s:": and none can stay his hand,",d:["over all the kingdoms of men","throughout the whole world","in all the dwellings of men"]},

{b:"Hosea",r:"Hosea 10:12",t:5,p:"Sow to yourselves in righteousness, reap in mercy;",a:"break up your fallow ground",s:": for it is time to seek the LORD,",d:["plough up the hardened field","cast away the stones thereof","prepare the soil of your hearts"]},
{b:"Hosea",r:"Hosea 12:6",t:5,p:"Therefore turn thou to thy God:",a:"keep mercy and judgment",s:", and wait on thy God continually.",d:["do justice and love kindness","hold fast truth and right","observe his statutes and laws"]},

{b:"Joel",r:"Joel 2:32",t:4,p:"And it shall come to pass, that whosoever shall call on the name of the LORD",a:"shall be delivered",s:": for in mount Zion and in Jerusalem shall be deliverance,",d:["shall find mercy","shall be established","shall not perish"]},
{b:"Joel",r:"Joel 2:12",t:5,p:"Therefore also now, saith the LORD, turn ye even to me",a:"with all your heart",s:", and with fasting, and with weeping, and with mourning:",d:["in truth and sincerity","with a contrite spirit","in humbleness of mind"]},

{b:"Amos",r:"Amos 8:11",t:5,p:"I will send a famine in the land, not a famine of bread, nor a thirst for water, but",a:"of hearing the words of the LORD",s:":",d:["a hunger for his commandments","a longing after his statutes","of seeking the counsel of God"]},
{b:"Amos",r:"Amos 9:13",t:5,p:"Behold, the days come, saith the LORD, that",a:"the plowman shall overtake the reaper",s:", and the treader of grapes him that soweth seed;",d:["the harvest shall not fail","the fields shall yield abundantly","the sower shall follow the thresher"]},

{b:"Obadiah",r:"Obadiah 1:17",t:5,p:"But upon mount Zion shall be deliverance, and",a:"there shall be holiness",s:"; and the house of Jacob shall possess their possessions.",d:["there shall be a remnant","the LORD shall reign there","peace shall dwell therein"]},
{b:"Obadiah",r:"Obadiah 1:12",t:5,p:"But thou shouldest not have looked on the day of thy brother in",a:"the day that he became a stranger",s:";",d:["the hour of his calamity","the time of his affliction","the day of his overthrow"]},

{b:"Jonah",r:"Jonah 1:3",t:4,p:"But Jonah rose up to flee unto Tarshish",a:"from the presence of the LORD",s:", and went down to Joppa;",d:["out of the land of Israel","away from the word of God","far from the house of prayer"]},
{b:"Jonah",r:"Jonah 3:10",t:5,p:"And God saw their works, that they turned from their evil way; and",a:"God repented of the evil",s:", that he had said that he would do unto them;",d:["the LORD turned from his anger","God withheld his judgment","the LORD had compassion on them"]},

{b:"Micah",r:"Micah 7:18",t:5,p:"Who is a God like unto thee,",a:"that pardoneth iniquity",s:", and passeth by the transgression of the remnant of his heritage?",d:["that blotteth out sin","which forgiveth trespasses","that remembereth mercy"]},
{b:"Micah",r:"Micah 4:3",t:4,p:"and they shall",a:"beat their swords into plowshares",s:", and their spears into pruninghooks:",d:["turn their weapons to ploughs","break their bows in sunder","cast their armour to the ground"]},

{b:"Nahum",r:"Nahum 1:15",t:5,p:"Behold upon the mountains",a:"the feet of him that bringeth good tidings",s:", that publisheth peace!",d:["the messenger of the LORD of hosts","the herald of the coming king","the voice of one crying peace"]},
{b:"Nahum",r:"Nahum 2:1",t:5,p:"He that dasheth in pieces is come up before thy face:",a:"keep the munition, watch the way",s:", make thy loins strong, fortify thy power mightily.",d:["guard the tower, mark the road","hold the gate, keep the watch","man the wall, set the guard"]},

{b:"Habakkuk",r:"Habakkuk 2:14",t:4,p:"For the earth shall be filled with",a:"the knowledge of the glory of the LORD",s:", as the waters cover the sea.",d:["the fear of the Almighty","the praise of his holy name","the light of his countenance"]},
{b:"Habakkuk",r:"Habakkuk 3:17",t:5,p:"Although the fig tree shall not blossom, neither shall fruit be in the vines;",a:"yet I will rejoice in the LORD",s:", I will joy in the God of my salvation.",d:["still will I praise his name","I will not cease to trust him","yet shall my heart be glad"]},

{b:"Zephaniah",r:"Zephaniah 3:9",t:5,p:"For then will I turn to the people a pure language, that they may all",a:"call upon the name of the LORD",s:", to serve him with one consent.",d:["walk in the ways of the LORD","seek the face of the Almighty","praise him with one voice"]},
{b:"Zephaniah",r:"Zephaniah 3:20",t:5,p:"At that time will I bring you again, even in the time that I gather you: for",a:"I will make you a name",s:"and a praise among all people of the earth,",d:["I will give you renown","I will set you on high","I will make you a joy"]},

{b:"Haggai",r:"Haggai 1:5",t:5,p:"Now therefore thus saith the LORD of hosts;",a:"Consider your ways",s:".",d:["Regard your doings","Ponder your paths","Weigh your works"]},
{b:"Haggai",r:"Haggai 2:4",t:5,p:"be strong, all ye people of the land, saith the LORD, and work:",a:"for I am with you",s:", saith the LORD of hosts:",d:["for I have chosen you","for my spirit remaineth","for the work is mine"]},

{b:"Zechariah",r:"Zechariah 2:8",t:4,p:"for he that toucheth you toucheth",a:"the apple of his eye",s:".",d:["the treasure of his heart","the crown of his glory","the jewel of his hand"]},
{b:"Zechariah",r:"Zechariah 8:16",t:5,p:"These are the things that ye shall do;",a:"Speak ye every man the truth",s:"to his neighbour; execute the judgment of truth and peace in your gates:",d:["Deal ye justly one with another","Let none deceive his brother","Put away lying from among you"]},

{b:"Malachi",r:"Malachi 2:10",t:5,p:"Have we not all one father?",a:"hath not one God created us",s:"? why do we deal treacherously every man against his brother,",d:["are we not the work of his hand","did not one Lord make us","hath he not fashioned us all"]},
{b:"Malachi",r:"Malachi 3:16",t:5,p:"Then they that feared the LORD spake often one to another: and",a:"the LORD hearkened, and heard it",s:", and a book of remembrance was written before him",d:["the LORD gave ear unto them","heaven took note of their words","the Almighty regarded their speech"]},

/* ---------------------------- GOSPELS & ACTS ---------------------------- */
{b:"Mark",r:"Mark 8:36",t:3,p:"For what shall it profit a man, if he shall gain the whole world, and",a:"lose his own soul",s:"?",d:["forfeit his own life","suffer the loss of his spirit","destroy his own heart"]},
{b:"Mark",r:"Mark 12:30",t:4,p:"And thou shalt love the Lord thy God with all thy heart, and with all thy soul, and",a:"with all thy mind",s:", and with all thy strength: this is the first commandment.",d:["with all thy understanding","with thy whole spirit","with all thine inward parts"]},

{b:"Luke",r:"Luke 11:9",t:3,p:"And I say unto you, Ask, and it shall be given you;",a:"seek, and ye shall find",s:"; knock, and it shall be opened unto you.",d:["search, and ye shall discover","seek, and ye shall obtain","look, and ye shall behold"]},
{b:"Luke",r:"Luke 15:20",t:4,p:"But when he was yet a great way off, his father saw him, and",a:"had compassion, and ran",s:", and fell on his neck, and kissed him.",d:["was moved with pity","rose up and hastened","wept, and went forth"]},

{b:"Acts",r:"Acts 2:38",t:4,p:"Then Peter said unto them,",a:"Repent, and be baptized every one of you",s:"in the name of Jesus Christ for the remission of sins,",d:["Believe, and turn from your wickedness","Repent ye, and be converted","Confess, and be washed every one"]},
{b:"Acts",r:"Acts 16:31",t:3,p:"And they said,",a:"Believe on the Lord Jesus Christ",s:", and thou shalt be saved, and thy house.",d:["Call upon the name of the Lord","Turn unto God with all thine heart","Receive the word of the gospel"]},

/* ---------------------------- EPISTLES ---------------------------- */
{b:"1 Corinthians",r:"1 Corinthians 16:14",t:4,p:"Let all your things",a:"be done with charity",s:".",d:["be done in meekness","be wrought in love","be ordered with kindness"]},
{b:"1 Corinthians",r:"1 Corinthians 2:9",t:4,p:"Eye hath not seen, nor ear heard, neither have entered into the heart of man,",a:"the things which God hath prepared",s:"for them that love him.",d:["the glory that shall be revealed","that which is laid up in heaven","the riches of his inheritance"]},

{b:"2 Corinthians",r:"2 Corinthians 4:18",t:4,p:"for the things which are seen are temporal; but",a:"the things which are not seen are eternal",s:".",d:["that which is unseen abideth for ever","the invisible things endure","things eternal are not beheld"]},
{b:"2 Corinthians",r:"2 Corinthians 9:7",t:3,p:"so let him give; not grudgingly, or of necessity: for",a:"God loveth a cheerful giver",s:".",d:["the LORD blesseth a willing heart","God regardeth a bountiful hand","the Lord accepteth a glad offering"]},

{b:"Galatians",r:"Galatians 3:28",t:4,p:"There is neither Jew nor Greek, there is neither bond nor free, there is neither male nor female: for",a:"ye are all one in Christ Jesus",s:".",d:["ye are one body in the Lord","all are made one in him","ye are heirs together of the promise"]},
{b:"Galatians",r:"Galatians 5:1",t:4,p:"Stand fast therefore in the liberty",a:"wherewith Christ hath made us free",s:", and be not entangled again with the yoke of bondage.",d:["which the Son hath purchased","whereunto ye are called","by which ye are redeemed"]},

{b:"Ephesians",r:"Ephesians 4:32",t:4,p:"And be ye kind one to another, tenderhearted, forgiving one another, even",a:"as God for Christ's sake hath forgiven you",s:".",d:["as the Lord hath pardoned your sins","seeing ye also are forgiven","as he hath shewed mercy unto you"]},
{b:"Ephesians",r:"Ephesians 5:2",t:4,p:"And walk in love, as Christ also hath loved us, and",a:"hath given himself for us",s:"an offering and a sacrifice to God",d:["hath laid down his life","was made a ransom for many","hath poured out his soul"]},

{b:"Philippians",r:"Philippians 1:21",t:4,p:"For to me to live is Christ, and",a:"to die is gain",s:".",d:["to depart is better","death hath no sting","to rest is sweet"]},
{b:"Philippians",r:"Philippians 4:8",t:4,p:"Finally, brethren,",a:"whatsoever things are true",s:", whatsoever things are honest, whatsoever things are just, whatsoever things are pure,",d:["whatsoever things are holy","whatsoever things are faithful","whatsoever is of good report"]},

{b:"Colossians",r:"Colossians 3:12",t:5,p:"Put on therefore, as the elect of God, holy and beloved,",a:"bowels of mercies, kindness",s:", humbleness of mind, meekness, longsuffering;",d:["hearts of compassion, gentleness","tender affection, goodness","a spirit of pity, patience"]},
{b:"Colossians",r:"Colossians 2:6",t:4,p:"As ye have therefore received Christ Jesus the Lord,",a:"so walk ye in him",s:":",d:["so abide ye in his love","let your steps be ordered of him","so continue ye in the faith"]},

{b:"1 Thessalonians",r:"1 Thessalonians 5:21",t:4,p:"Despise not prophesyings. Prove all things;",a:"hold fast that which is good",s:".",d:["keep that which is pure","cleave to what is right","retain the thing that is honest"]},
{b:"1 Thessalonians",r:"1 Thessalonians 5:11",t:5,p:"Wherefore comfort yourselves together, and",a:"edify one another",s:", even as also ye do.",d:["build up the weak","strengthen the fainthearted","exhort one another daily"]},

{b:"2 Thessalonians",r:"2 Thessalonians 2:15",t:5,p:"Therefore, brethren, stand fast, and",a:"hold the traditions which ye have been taught",s:", whether by word, or our epistle.",d:["keep the doctrine ye received","observe the things delivered unto you","maintain the faith once given"]},
{b:"2 Thessalonians",r:"2 Thessalonians 3:16",t:5,p:"Now the Lord of peace himself",a:"give you peace always by all means",s:". The Lord be with you all.",d:["grant you rest continually","keep your hearts in quietness","bestow his favour upon you ever"]},

{b:"1 Timothy",r:"1 Timothy 6:12",t:4,p:"Fight the good fight of faith,",a:"lay hold on eternal life",s:", whereunto thou art also called,",d:["take hold of the promise","press toward the prize","seize the crown that fadeth not"]},
{b:"1 Timothy",r:"1 Timothy 2:5",t:4,p:"For there is one God, and",a:"one mediator between God and men",s:", the man Christ Jesus;",d:["one advocate with the Father","one high priest for ever","one intercessor for the people"]},

{b:"2 Timothy",r:"2 Timothy 2:3",t:4,p:"Thou therefore endure hardness,",a:"as a good soldier of Jesus Christ",s:".",d:["like a faithful servant of the Lord","as a labourer worthy of his hire","as one that striveth for the mastery"]},
{b:"2 Timothy",r:"2 Timothy 4:8",t:4,p:"Henceforth there is laid up for me",a:"a crown of righteousness",s:", which the Lord, the righteous judge, shall give me at that day:",d:["a robe of glory","an incorruptible inheritance","a garland of life"]},

{b:"Titus",r:"Titus 2:7",t:5,p:"In all things shewing thyself",a:"a pattern of good works",s:": in doctrine shewing uncorruptness, gravity, sincerity,",d:["an example of sound living","a light unto the faithful","a model of true religion"]},

{b:"Philemon",r:"Philemon 1:11",t:5,p:"Which in time past was to thee unprofitable, but now",a:"profitable to thee and to me",s:":",d:["useful in the work of the Lord","serviceable unto us both","of good report among the brethren"]},
{b:"Philemon",r:"Philemon 1:16",t:5,p:"Not now as a servant, but above a servant,",a:"a brother beloved",s:", specially to me, but how much more unto thee,",d:["a fellowlabourer","a son in the faith","a partner in the gospel"]},

{b:"Hebrews",r:"Hebrews 12:2",t:4,p:"Looking unto Jesus",a:"the author and finisher of our faith",s:"; who for the joy that was set before him endured the cross,",d:["the captain of our salvation","the beginner and perfecter of grace","the shepherd and bishop of souls"]},
{b:"Hebrews",r:"Hebrews 4:16",t:4,p:"Let us therefore come boldly unto the throne of grace, that we may",a:"obtain mercy, and find grace",s:"to help in time of need.",d:["receive pardon, and win favour","find pity, and gain strength","have compassion, and get help"]},

{b:"James",r:"James 1:5",t:4,p:"If any of you lack wisdom, let him ask of God,",a:"that giveth to all men liberally",s:", and upbraideth not; and it shall be given him.",d:["who heareth the cry of the humble","which withholdeth no good thing","that is rich unto all that call"]},
{b:"James",r:"James 5:16",t:4,p:"and pray one for another, that ye may be healed.",a:"The effectual fervent prayer of a righteous man",s:"availeth much.",d:["The humble cry of a contrite heart","The steadfast supplication of the faithful","The earnest petition of a holy soul"]},

{b:"1 Peter",r:"1 Peter 1:3",t:5,p:"Blessed be the God and Father of our Lord Jesus Christ, which according to his abundant mercy",a:"hath begotten us again unto a lively hope",s:"by the resurrection of Jesus Christ from the dead,",d:["hath called us out of darkness","hath made us heirs of promise","hath raised us to newness of life"]},
{b:"1 Peter",r:"1 Peter 3:15",t:4,p:"But sanctify the Lord God in your hearts: and",a:"be ready always to give an answer",s:"to every man that asketh you a reason of the hope that is in you",d:["be swift to declare your faith","stand prepared to speak the truth","be willing ever to make defence"]},

{b:"2 Peter",r:"2 Peter 1:5",t:5,p:"And beside this, giving all diligence,",a:"add to your faith virtue",s:"; and to virtue knowledge;",d:["join unto your faith patience","let your faith abound in works","increase your faith with wisdom"]},
{b:"2 Peter",r:"2 Peter 3:18",t:4,p:"But grow in grace, and in",a:"the knowledge of our Lord and Saviour",s:"Jesus Christ. To him be glory both now and for ever.",d:["the wisdom that cometh from above","the favour of the living God","the fear of the Almighty"]},

{b:"1 John",r:"1 John 4:19",t:3,p:"We love him,",a:"because he first loved us",s:".",d:["for he hath shewed us mercy","seeing he gave himself for us","for his love constraineth us"]},
{b:"1 John",r:"1 John 5:14",t:4,p:"And this is the confidence that we have in him, that, if we ask any thing according to his will,",a:"he heareth us",s:":",d:["he answereth us","our prayer is heard","he denieth us not"]},

{b:"2 John",r:"2 John 1:4",t:5,p:"I rejoiced greatly that I found of thy children",a:"walking in truth",s:", as we have received a commandment from the Father.",d:["abiding in the doctrine","standing in the faith","keeping the commandment"]},
{b:"2 John",r:"2 John 1:8",t:5,p:"Look to yourselves, that we lose not those things which we have wrought, but",a:"that we receive a full reward",s:".",d:["that our joy may be full","that we be found faithful","that none take our crown"]},

{b:"3 John",r:"3 John 1:5",t:5,p:"Beloved,",a:"thou doest faithfully whatsoever thou doest",s:"to the brethren, and to strangers;",d:["thou labourest greatly in the truth","thou walkest uprightly before all men","thou shewest kindness unto all"]},
{b:"3 John",r:"3 John 1:14",t:5,p:"but I trust I shall shortly see thee, and",a:"we shall speak face to face",s:". Peace be to thee.",d:["we shall rejoice together","thou shalt hear my words","we shall commune as friends"]},

{b:"Jude",r:"Jude 1:22",t:5,p:"And of some",a:"have compassion, making a difference",s:":",d:["shew mercy, judging righteously","take pity, discerning the truth","have patience, bearing with them"]},

{b:"Revelation",r:"Revelation 5:12",t:4,p:"Saying with a loud voice,",a:"Worthy is the Lamb that was slain",s:"to receive power, and riches, and wisdom,",d:["Holy is the Lamb of God","Blessed is he that was crucified","Great is the Lamb upon the throne"]},
{b:"Revelation",r:"Revelation 22:17",t:5,p:"And the Spirit and the bride say, Come. And",a:"let him that heareth say, Come",s:". And let him that is athirst come.",d:["let all that hear give answer","bid the weary draw near","let him that thirsteth cry out"]}

];

if(typeof module !== "undefined" && module.exports) module.exports = VERSES_MORE;
