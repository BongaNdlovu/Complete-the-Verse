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
{b:"Revelation",r:"Revelation 22:17",t:5,p:"And the Spirit and the bride say, Come. And",a:"let him that heareth say, Come",s:". And let him that is athirst come.",d:["let all that hear give answer","bid the weary draw near","let him that thirsteth cry out"]},

/* ---------------- ROAD EXPANSION — new sites, site-first ---------------- */

{b:"Genesis",r:"Genesis 12:1",t:2,p:"Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father's house, unto",a:"a land that I will shew thee",s:":",d:["a country I have prepared","the land of the Canaanites","a place that I will give thee"]},
{b:"Genesis",r:"Genesis 22:2",t:3,p:"And he said, Take now thy son,",a:"thine only son Isaac, whom thou lovest",s:", and get thee into the land of Moriah;",d:["thy firstborn son, whom thou namest","the child of the promise, thy heir","thy beloved son, even Ishmael"]},
{b:"Genesis",r:"Genesis 22:8",t:2,p:"And Abraham said, My son,",a:"God will provide himself a lamb",s:"for a burnt offering: so they went both of them together.",d:["the LORD will send us a ram","God will furnish an offering","the Almighty will choose a sacrifice"]},
{b:"Genesis",r:"Genesis 22:12",t:3,p:"for now I know that thou fearest God, seeing",a:"thou hast not withheld thy son",s:", thine only son from me.",d:["thou hast not spared the lad","thou hast offered up thine heir","thou hast not kept back the child"]},
{b:"Genesis",r:"Genesis 22:14",t:3,p:"And Abraham called the name of that place Jehovahjireh: as it is said to this day, In",a:"the mount of the LORD",s:"it shall be seen.",d:["the hill of his holiness","the place of the offering","the land of Moriah"]},
{b:"Genesis",r:"Genesis 37:24",t:3,p:"And they took him, and cast him into a pit: and",a:"the pit was empty",s:", there was no water in it.",d:["the cistern was dry","the well was broken","the ditch was barren"]},
{b:"Genesis",r:"Genesis 37:28",t:3,p:"and they drew and lifted up Joseph out of the pit, and sold Joseph to the Ishmeelites for",a:"twenty pieces of silver",s:": and they brought Joseph into Egypt.",d:["thirty pieces of silver","twenty shekels of gold","a hundred pieces of silver"]},
{b:"Genesis",r:"Genesis 45:5",t:4,p:"Now therefore be not grieved, nor angry with yourselves, that ye sold me hither: for God did send me before you",a:"to preserve life",s:".",d:["to gather corn","to save the house","to keep you alive"]},
{b:"Genesis",r:"Genesis 3:15",t:3,p:"And I will put enmity between thee and the woman, and between thy seed and her seed;",a:"it shall bruise thy head",s:", and thou shalt bruise his heel.",d:["he shall crush thy power","it shall wound thy heel","she shall bruise thy seed"]},

{b:"Exodus",r:"Exodus 3:2",t:2,p:"and he looked, and, behold, the bush burned with fire, and",a:"the bush was not consumed",s:".",d:["the flame was not quenched","the tree was not destroyed","the fire did not go out"]},
{b:"Exodus",r:"Exodus 3:5",t:2,p:"And he said, Draw not nigh hither:",a:"put off thy shoes from off thy feet",s:", for the place whereon thou standest is holy ground.",d:["bow down upon the earth","cover thy face from the fire","stand afar off from the bush"]},
{b:"Exodus",r:"Exodus 4:12",t:3,p:"Now therefore go, and I will be with thy mouth, and",a:"teach thee what thou shalt say",s:".",d:["give thee words of power","open thy lips to speak","put my word in thy tongue"]},
{b:"Exodus",r:"Exodus 14:13",t:2,p:"And Moses said unto the people, Fear ye not, stand still, and",a:"see the salvation of the LORD",s:", which he will shew to you to day:",d:["behold the power of our God","watch the deliverance of Israel","look upon the works of his hand"]},
{b:"Exodus",r:"Exodus 14:21",t:3,p:"And Moses stretched out his hand over the sea; and the LORD caused the sea to go back by",a:"a strong east wind",s:"all that night, and made the sea dry land, and the waters were divided.",d:["a mighty west wind","a great north blast","a wind from the wilderness"]},
{b:"Exodus",r:"Exodus 15:1",t:3,p:"I will sing unto the LORD, for he hath triumphed gloriously:",a:"the horse and his rider",s:"hath he thrown into the sea.",d:["the chariot and his driver","Pharaoh and his host","the horsemen of Egypt"]},
{b:"Exodus",r:"Exodus 15:11",t:4,p:"Who is like unto thee, O LORD, among the gods? who is like thee,",a:"glorious in holiness",s:", fearful in praises, doing wonders?",d:["mighty in battle","holy in all his works","terrible in majesty"]},
{b:"Exodus",r:"Exodus 19:4",t:3,p:"Ye have seen what I did unto the Egyptians, and how I bare you",a:"on eagles' wings",s:", and brought you unto myself.",d:["in mine own arms","upon the clouds of heaven","as on the wings of the wind"]},

{b:"Judges",r:"Judges 6:14",t:3,p:"And the LORD looked upon him, and said, Go in this thy might, and thou shalt save Israel from the hand of the Midianites:",a:"have not I sent thee",s:"?",d:["am not I with thee","hath not the LORD called thee","is not this the day"]},
{b:"Judges",r:"Judges 6:16",t:4,p:"And the LORD said unto him, Surely I will be with thee, and thou shalt smite the Midianites",a:"as one man",s:".",d:["as a great host","like the sand of the sea","with a mighty army"]},
{b:"Judges",r:"Judges 7:2",t:4,p:"And the LORD said unto Gideon, The people that are with thee are",a:"too many for me",s:"to give the Midianites into their hands, lest Israel vaunt themselves against me, saying, Mine own hand hath saved me.",d:["too few for war","too fearful to fight","too weak for battle"]},
{b:"Judges",r:"Judges 7:7",t:3,p:"And the LORD said unto Gideon, By",a:"the three hundred men that lapped",s:"will I save you, and deliver the Midianites into thine hand:",d:["the thousand that knelt","the mighty men of valour","the remnant that remained"]},
{b:"Judges",r:"Judges 16:17",t:4,p:"If I be shaven, then my strength will go from me, and I shall become weak, and be",a:"like any other man",s:".",d:["as a child of the Philistines","like a man that is bound","as one that hath no vow"]},
{b:"Judges",r:"Judges 16:20",t:5,p:"And he awoke out of his sleep, and said, I will go out as at other times before, and shake myself. And he wist not that",a:"the LORD was departed from him",s:".",d:["his vow was broken in secret","his strength had left the locks","the Philistines had bound him"]},
{b:"Judges",r:"Judges 16:30",t:4,p:"And Samson said,",a:"Let me die with the Philistines",s:". And he bowed himself with all his might; and the house fell upon the lords, and upon all the people that were therein.",d:["Let the house fall upon me","Let God avenge me this day","Let me be avenged of mine enemies"]},
{b:"Judges",r:"Judges 21:25",t:3,p:"In those days there was no king in Israel:",a:"every man did that which was right",s:"in his own eyes.",d:["the people walked after their heart","each tribe judged its own cause","the land had rest from war"]},
{b:"Judges",r:"Judges 4:14",t:4,p:"And Deborah said unto Barak, Up; for",a:"this is the day",s:"in which the LORD hath delivered Sisera into thine hand: is not the LORD gone out before thee?",d:["now is the hour","the time is at hand","this is the night"]},

{b:"1 Samuel",r:"1 Samuel 3:10",t:2,p:"And the LORD came, and stood, and called as at other times, Samuel, Samuel. Then Samuel answered,",a:"Speak; for thy servant heareth",s:".",d:["Here am I; for thou calledst me","Speak, Lord, I am listening","Thy servant waiteth upon thee"]},
{b:"1 Samuel",r:"1 Samuel 7:3",t:4,p:"And Samuel spake unto all the house of Israel, saying, If ye do return unto the LORD with all your hearts, then",a:"put away the strange gods",s:"and Ashtaroth from among you, and prepare your hearts unto the LORD, and serve him only:",d:["break down every high place","return from your backsliding","cast out the priests of Baal"]},
{b:"1 Samuel",r:"1 Samuel 7:12",t:3,p:"Then Samuel took a stone, and set it between Mizpeh and Shen, and called the name of it Ebenezer, saying,",a:"Hitherto hath the LORD helped us",s:".",d:["The LORD is our banner this day","Thus far hath God delivered us","The LORD hath done great things"]},
{b:"1 Samuel",r:"1 Samuel 8:7",t:4,p:"And the LORD said unto Samuel, Hearken unto the voice of the people in all that they say unto thee: for they have not rejected thee, but",a:"they have rejected me",s:", that I should not reign over them.",d:["they have refused the judge","they have despised the prophet","they have chosen another lord"]},
{b:"1 Samuel",r:"1 Samuel 17:45",t:3,p:"Then said David to the Philistine, Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee",a:"in the name of the LORD of hosts",s:", the God of the armies of Israel, whom thou hast defied.",d:["in the strength of the living God","with the sword of the LORD","by the power of the Almighty"]},

{b:"1 Kings",r:"1 Kings 17:1",t:4,p:"And Elijah the Tishbite, who was of the inhabitants of Gilead, said unto Ahab, As the LORD God of Israel liveth, before whom I stand,",a:"there shall not be dew nor rain",s:"these years, but according to my word.",d:["the heavens shall be shut up","the land shall see no water","there shall be famine in Samaria"]},
{b:"1 Kings",r:"1 Kings 18:24",t:3,p:"And call ye on the name of your gods, and I will call on the name of the LORD: and",a:"the God that answereth by fire",s:", let him be God.",d:["the LORD that sendeth the rain","the God that speaketh from heaven","the one that consumeth the altar"]},
{b:"1 Kings",r:"1 Kings 18:38",t:3,p:"Then",a:"the fire of the LORD fell",s:", and consumed the burnt sacrifice, and the wood, and the stones, and the dust, and licked up the water that was in the trench.",d:["a flame from heaven came down","the lightning of God struck","the fire from the altar rose"]},
{b:"1 Kings",r:"1 Kings 18:36",t:4,p:"LORD God of Abraham, Isaac, and of Israel, let it be known this day that",a:"thou art God in Israel",s:", and that I am thy servant, and that I have done all these things at thy word.",d:["thou wilt send the rain","Baal is no god at all","the fire is thine alone"]},
{b:"1 Kings",r:"1 Kings 19:10",t:5,p:"And he said, I have been very jealous for the LORD God of hosts: for the children of Israel have forsaken thy covenant,",a:"thrown down thine altars",s:", and slain thy prophets with the sword; and I, even I only, am left; and they seek my life, to take it away.",d:["broken thy holy law","burned up thy sanctuaries","polluted thy holy places"]},

{b:"2 Kings",r:"2 Kings 18:13",t:4,p:"Now in the fourteenth year of king Hezekiah did Sennacherib king of Assyria come up against",a:"all the fenced cities of Judah",s:", and took them.",d:["the strong holds of Israel","every city of Samaria","the defenced towns of Zion"]},
{b:"2 Kings",r:"2 Kings 19:32",t:4,p:"Therefore thus saith the LORD concerning the king of Assyria, He shall not come into this city,",a:"nor shoot an arrow there",s:", nor come before it with shield, nor cast a bank against it.",d:["nor set a watch against it","nor break the wall thereof","nor lift a spear toward it"]},
{b:"2 Kings",r:"2 Kings 19:35",t:4,p:"And it came to pass that night, that the angel of the LORD went out, and smote in the camp of the Assyrians",a:"an hundred fourscore and five thousand",s:": and when they arose early in the morning, behold, they were all dead corpses.",d:["threescore and ten thousand","an hundred thousand horsemen","forty and two thousand men"]},

{b:"Isaiah",r:"Isaiah 37:36",t:4,p:"Then the angel of the LORD went forth, and smote in the camp of the Assyrians a hundred and fourscore and five thousand: and when they arose early in the morning, behold,",a:"they were all dead corpses",s:".",d:["the host was fled away","the camp was left empty","they were fallen by the sword"]},
{b:"Isaiah",r:"Isaiah 37:33",t:5,p:"Therefore thus saith the LORD concerning the king of Assyria, He shall not come into this city, nor shoot an arrow there, nor come before it with shields,",a:"nor cast a bank against it",s:".",d:["nor break down the gate","nor raise a tower beside it","nor set his throne therein"]},

{b:"2 Chronicles",r:"2 Chronicles 3:1",t:4,p:"Then Solomon began to build the house of the LORD at Jerusalem in",a:"mount Moriah",s:", where the LORD appeared unto David his father, in the place that David had prepared in the threshingfloor of Ornan the Jebusite.",d:["the city of David","the hill of Zion","the valley of Jehoshaphat"]},
{b:"2 Chronicles",r:"2 Chronicles 32:9",t:5,p:"After this did Sennacherib king of Assyria send his servants to Jerusalem, (but he himself",a:"laid siege against Lachish",s:", and all his power with him,)",d:["encamped against Jerusalem","sat down before Samaria","drew near unto Libnah"]},

{b:"Hebrews",r:"Hebrews 11:17",t:3,p:"By faith Abraham, when he was tried,",a:"offered up Isaac",s:": and he that had received the promises offered up his only begotten son,",d:["laid the wood in order","bound his son upon the altar","stretched forth his hand"]},
{b:"Hebrews",r:"Hebrews 11:19",t:4,p:"Accounting that God was able to raise him up,",a:"even from the dead",s:"; from whence also he received him in a figure.",d:["after many days","out of the thicket","from the mount again"]},
{b:"Hebrews",r:"Hebrews 11:29",t:3,p:"By faith they passed through the Red sea",a:"as by dry land",s:": which the Egyptians assaying to do were drowned.",d:["on the wings of the wind","in the midst of the waters","by a path through the deep"]},

{b:"James",r:"James 5:17",t:4,p:"Elias was a man subject to like passions as we are, and he",a:"prayed earnestly that it might not rain",s:": and it rained not on the earth by the space of three years and six months.",d:["called fire down from heaven","shut the heavens for a season","stood before Ahab in Samaria"]},

{b:"Hosea",r:"Hosea 10:9",t:5,p:"O Israel, thou hast sinned",a:"from the days of Gibeah",s:": there they stood: the battle in Gibeah against the children of iniquity did not overtake them.",d:["in the valley of Achor","at the waters of Meribah","from the days of Bethel"]},

/* ---- quarantine batch: thin books (Job, Law/History, Mark, Luke, Acts) ---- */

{b:"Job",r:"Job 42:5",t:4,p:"I have heard of thee by the hearing of the ear: but now",a:"mine eye seeth thee",s:".",d:["my heart understandeth thee","my mouth can praise thee","my soul waiteth for thee"]},

{b:"Numbers",r:"Numbers 24:17",t:3,p:"there shall come a Star out of Jacob, and",a:"a Sceptre shall rise out of Israel",s:", and shall smite the corners of Moab,",d:["a sword shall go forth from Judah","a king shall arise out of Moab","a prophet shall stand in Zion"]},

{b:"Deuteronomy",r:"Deuteronomy 10:12",t:3,p:"And now, Israel, what doth",a:"the LORD thy God require of thee",s:", but to fear the LORD thy God, to walk in all his ways,",d:["when wilt thou return unto the land","how long will ye tempt the LORD","who shall go up for us"]},
{b:"Deuteronomy",r:"Deuteronomy 32:31",t:4,p:"For their rock is",a:"not as our Rock",s:", even our enemies themselves being judges.",d:["broken in pieces","weaker than our sword","hidden from their eyes"]},

{b:"Joshua",r:"Joshua 4:24",t:3,p:"That all the people of the earth might know",a:"the hand of the LORD",s:", that it is mighty: that ye might fear the LORD your God for ever.",d:["the fear of Israel","the name of Joshua","the ark of the covenant"]},
{b:"Joshua",r:"Joshua 10:8",t:4,p:"And the LORD said unto Joshua, Fear them not: for",a:"I have delivered them into thine hand",s:"; there shall not a man of them stand before thee.",d:["I have given thee the city","I will fight for Israel this day","they shall flee before thy face"]},

{b:"Ruth",r:"Ruth 1:1",t:2,p:"Now it came to pass in the days when the judges ruled, that there was",a:"a famine in the land",s:". And a certain man of Bethlehemjudah went to sojourn in the country of Moab,",d:["war in the coasts","pestilence upon Judah","drought upon Bethlehem"]},
{b:"Ruth",r:"Ruth 4:16",t:2,p:"And Naomi took the child, and",a:"laid it in her bosom",s:", and became nurse unto it.",d:["set it upon her knees","gave it unto the women","brought it into the house"]},
{b:"Ruth",r:"Ruth 3:18",t:4,p:"Then said she,",a:"Sit still, my daughter",s:", until thou know how the matter will fall:",d:["Go up to the gate","Speak to the elders","Wait not for this man"]},

{b:"2 Samuel",r:"2 Samuel 7:12",t:3,p:"And when thy days be fulfilled, and thou shalt sleep with thy fathers, I will",a:"set up thy seed after thee",s:", which shall proceed out of thy bowels, and I will establish his kingdom.",d:["give thee rest from thy wars","build thee an house of cedar","make thy name like the great"]},
{b:"2 Samuel",r:"2 Samuel 7:22",t:4,p:"Wherefore thou art great, O LORD God: for",a:"there is none like thee",s:", neither is there any God beside thee, according to all that we have heard with our ears.",d:["thy name is above all names","the heavens cannot contain thee","thou only art the Holy One"]},
{b:"2 Samuel",r:"2 Samuel 23:2",t:5,p:"The Spirit of the LORD spake by me, and",a:"his word was in my tongue",s:".",d:["his fire sat upon my lips","his law was in my heart","his angel stood at my right"]},

{b:"Mark",r:"Mark 12:31",t:2,p:"And the second is like, namely this, Thou",a:"shalt love thy neighbour as thyself",s:". There is none other commandment greater than these.",d:["shalt honour the elders of thy people","shalt keep the traditions of men","shalt give alms in the streets"]},
{b:"Mark",r:"Mark 2:17",t:3,p:"They that are whole have no need of the physician, but they that are sick:",a:"I came not to call the righteous",s:", but sinners to repentance.",d:["I came to gather the lost sheep only","I came to judge the world","I came to keep the law only"]},
{b:"Mark",r:"Mark 4:9",t:3,p:"And he said unto them,",a:"He that hath ears to hear",s:", let him hear.",d:["He that hath eyes to see","Blessed are they that listen","Let the wise man understand"]},
{b:"Mark",r:"Mark 8:34",t:3,p:"Whosoever will come after me, let him deny himself, and",a:"take up his cross",s:", and follow me.",d:["leave his father's house","sell all that he hath","keep the whole law"]},
{b:"Mark",r:"Mark 16:6",t:3,p:"Ye seek Jesus of Nazareth, which was crucified:",a:"he is risen; he is not here",s:": behold the place where they laid him.",d:["he sleepeth in the garden","he is taken away by night","he goeth before you to Rome"]},

{b:"Luke",r:"Luke 10:27",t:2,p:"Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy strength, and with all thy mind; and",a:"thy neighbour as thyself",s:".",d:["the stranger within thy gates","thine enemies that despitefully use thee","the poor of the land"]},
{b:"Luke",r:"Luke 1:47",t:2,p:"And my spirit hath rejoiced in",a:"God my Saviour",s:".",d:["the Holy One of Israel","the God of Abraham","the LORD of hosts"]},
{b:"Luke",r:"Luke 2:11",t:2,p:"For unto you is born this day in the city of David",a:"a Saviour, which is Christ the Lord",s:".",d:["a prophet, which is John the Baptist","a king, which is son of David","a priest, after the order of Aaron"]},
{b:"Luke",r:"Luke 1:38",t:3,p:"And Mary said, Behold the handmaid of the Lord;",a:"be it unto me according to thy word",s:". And the angel departed from her.",d:["let this cup pass from me","I am not worthy that thou shouldest come","how shall this be, seeing I know not a man"]},
{b:"Luke",r:"Luke 4:18",t:3,p:"The Spirit of the Lord is upon me, because he hath",a:"anointed me to preach the gospel",s:" to the poor; he hath sent me to heal the brokenhearted,",d:["called me to sit on David's throne","sent me to keep the law of Moses","chosen me to gather only Israel"]},
{b:"Luke",r:"Luke 5:32",t:3,p:"I came not to call the righteous, but",a:"sinners to repentance",s:".",d:["the Jews to the kingdom","the priests to the temple","the rich to give alms"]},
{b:"Luke",r:"Luke 6:38",t:3,p:"Give, and it shall be given unto you;",a:"good measure, pressed down",s:", and shaken together, and running over, shall men give into your bosom.",d:["an hundredfold in this life","treasure laid up in heaven","the firstfruits of the land"]},
{b:"Luke",r:"Luke 9:23",t:3,p:"If any man will come after me, let him deny himself, and",a:"take up his cross daily",s:", and follow me.",d:["leave father and mother","keep the sabbath day","give tithes of all he hath"]},
{b:"Luke",r:"Luke 15:7",t:3,p:"I say unto you, that likewise joy shall be in heaven over",a:"one sinner that repenteth",s:", more than over ninety and nine just persons, which need no repentance.",d:["the ninety and nine that went not astray","the righteous that keep the law","a nation that offereth sacrifice"]},
{b:"Luke",r:"Luke 18:1",t:3,p:"And he spake a parable unto them to this end, that men ought",a:"always to pray",s:", and not to faint;",d:["always to fast","always to give alms","always to keep watch in the temple"]},
{b:"Luke",r:"Luke 2:52",t:4,p:"And Jesus",a:"increased in wisdom and stature",s:", and in favour with God and man.",d:["grew in years and in riches","rose in honour among the priests","excelled in the law of the fathers"]},
{b:"Luke",r:"Luke 16:13",t:4,p:"No servant can serve two masters: for either he will hate the one, and love the other; or else he will hold to the one, and despise the other. Ye cannot",a:"serve God and mammon",s:".",d:["serve God and Caesar","serve the law and the prophets","serve God and the temple"]},
{b:"Luke",r:"Luke 17:21",t:4,p:"Neither shall they say, Lo here! or, lo there! for, behold,",a:"the kingdom of God is within you",s:".",d:["the kingdom of God is in Jerusalem","the kingdom of God cometh with observation","the kingdom of heaven is at hand"]},
{b:"Luke",r:"Luke 21:36",t:4,p:"Watch ye therefore, and pray always, that ye may be accounted worthy to escape all these things that shall come to pass, and to",a:"stand before the Son of man",s:".",d:["sit on twelve thrones in Israel","enter into the holy place","inherit the land of Canaan"]},
{b:"Luke",r:"Luke 23:34",t:4,p:"Then said Jesus,",a:"Father, forgive them",s:"; for they know not what they do. And they parted his raiment, and cast lots.",d:["My God, why hast thou forsaken me","Lord, remember me when thou comest","It is finished"]},
{b:"Luke",r:"Luke 24:32",t:4,p:"And they said one to another, Did not our",a:"heart burn within us",s:", while he talked with us by the way, and while he opened to us the scriptures?",d:["eyes open to see him","faith fail by the way","souls rejoice in the law"]},

{b:"Acts",r:"Acts 3:19",t:2,p:"Repent ye therefore, and be converted, that your",a:"sins may be blotted out",s:", when the times of refreshing shall come from the presence of the Lord;",d:["names may be written in heaven","hearts may be circumcised","offerings may be accepted"]},
{b:"Acts",r:"Acts 5:29",t:3,p:"Then Peter and the other apostles answered and said,",a:"We ought to obey God rather than men",s:".",d:["We ought to keep the peace of the city","We ought to honour the high priest","We ought to be subject unto Caesar"]},
{b:"Acts",r:"Acts 1:11",t:3,p:"this same Jesus, which is taken up from you into heaven,",a:"shall so come in like manner",s:" as ye have seen him go into heaven.",d:["shall send the Spirit only","shall remain at the right hand for ever","shall come first to Jerusalem alone"]},
{b:"Acts",r:"Acts 20:35",t:4,p:"and to remember the words of the Lord Jesus, how he said, It is",a:"more blessed to give than to receive",s:".",d:["better to keep than to scatter","more holy to fast than to feast","wiser to save than to spend"]},
{b:"Acts",r:"Acts 2:21",t:4,p:"And it shall come to pass, that whosoever shall",a:"call on the name of the Lord",s:" shall be saved.",d:["keep the whole law of Moses","be born of the stock of Abraham","wash in the river Jordan"]},
{b:"Acts",r:"Acts 4:20",t:4,p:"For we cannot but speak",a:"the things which we have seen",s:" and heard.",d:["only what the council permitteth","the traditions of the fathers","nothing in this name any more"]},
{b:"Acts",r:"Acts 5:42",t:4,p:"And daily in the temple, and in every house, they ceased not to",a:"teach and preach Jesus Christ",s:".",d:["argue with the Grecians","gather alms for the saints","keep the custom of Moses"]},
{b:"Acts",r:"Acts 16:25",t:4,p:"And at midnight Paul and Silas",a:"prayed, and sang praises unto God",s:": and the prisoners heard them.",d:["slept, waiting for the morning","wrote a letter unto the church","called for the magistrates"]},
{b:"Acts",r:"Acts 17:11",t:4,p:"These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and",a:"searched the scriptures daily",s:", whether those things were so.",d:["asked a sign from heaven","sent unto Jerusalem for a word","trusted in the traditions of the elders"]},
{b:"Acts",r:"Acts 20:24",t:4,p:"neither count I my life dear unto myself, so that I might",a:"finish my course with joy",s:", and the ministry, which I have received of the Lord Jesus,",d:["see Rome before I die","return unto Jerusalem in peace","gain the honour of the churches"]},
{b:"Acts",r:"Acts 24:16",t:4,p:"And herein do I exercise myself, to have always a conscience",a:"void of offence toward God",s:", and toward men.",d:["clear before the council","open toward the governor","clean according to the law"]},
{b:"Acts",r:"Acts 7:59",t:5,p:"And they stoned Stephen, calling upon God, and saying,",a:"Lord Jesus, receive my spirit",s:".",d:["Father, forgive them this sin","My God, why hast thou forsaken me","Let me die the death of the righteous"]},

/* ---- quarantine batch: Ephesians, 1 Peter, 1 John, Ezekiel, Zechariah, 1 Cor, Daniel, 1 Tim ---- */

{b:"Ezekiel",r:"Ezekiel 33:11",t:3,p:"As I live, saith the Lord GOD, I have no pleasure in the death of the wicked; but that the wicked",a:"turn from his way and live",s:": turn ye, turn ye from your evil ways;",d:["perish in his iniquity","keep the feasts of the LORD","offer a bullock for his sin"]},
{b:"Ezekiel",r:"Ezekiel 3:17",t:4,p:"Son of man, I have made thee",a:"a watchman unto the house of Israel",s:": therefore hear the word at my mouth, and give them warning from me.",d:["a priest to the sanctuary","a prince over the captives","a scribe of the law"]},
{b:"Ezekiel",r:"Ezekiel 14:6",t:4,p:"Thus saith the Lord GOD;",a:"Repent, and turn yourselves from your idols",s:"; and turn away your faces from all your abominations.",d:["Keep the new moons and the sabbaths","Offer the blood of bulls in Zion","Return unto Egypt for help"]},
{b:"Ezekiel",r:"Ezekiel 22:30",t:4,p:"And I sought for a man among them, that should make up the hedge, and",a:"stand in the gap before me",s:" for the land, that I should not destroy it: but I found none.",d:["build again the broken wall","sit in the gate of the city","offer incense upon the altar"]},
{b:"Ezekiel",r:"Ezekiel 37:27",t:4,p:"My tabernacle also shall be with them: yea,",a:"I will be their God",s:", and they shall be my people.",d:["they shall choose another shepherd","I will give them a king","they shall return unto Egypt"]},
{b:"Ezekiel",r:"Ezekiel 34:23",t:5,p:"And I will set up",a:"one shepherd over them",s:", and he shall feed them, even my servant David; he shall feed them, and he shall be their shepherd.",d:["many shepherds in the land","a hireling over the flock","watchmen upon every hill"]},
{b:"Ezekiel",r:"Ezekiel 47:12",t:5,p:"whose leaf shall not fade, neither shall the fruit thereof be consumed: it shall bring forth",a:"new fruit according to his months",s:", because their waters they issued out of the sanctuary:",d:["corn and wine in their season","manna as in the wilderness","oil from the olive yards"]},

{b:"Daniel",r:"Daniel 2:20",t:4,p:"Daniel answered and said, Blessed be",a:"the name of God for ever",s:" and ever: for wisdom and might are his:",d:["the king of Babylon this day","the gods of the Chaldeans","the wisdom of the magicians"]},
{b:"Daniel",r:"Daniel 9:9",t:4,p:"To the Lord our God",a:"belong mercies and forgivenesses",s:", though we have rebelled against him;",d:["belong the kingdoms of the earth","belong the stars of heaven","belong the treasures of the temple"]},
{b:"Daniel",r:"Daniel 1:8",t:4,p:"But Daniel",a:"purposed in his heart",s:" that he would not defile himself with the portion of the king's meat, nor with the wine which he drank:",d:["asked for the king's honour","sought a place among the magicians","kept the custom of Babylon"]},
{b:"Daniel",r:"Daniel 9:23",t:4,p:"At the beginning of thy supplications the commandment came forth, and I am come to shew thee; for",a:"thou art greatly beloved",s:": therefore understand the matter, and consider the vision.",d:["thou art a man of war","thou shalt sit on a throne","thy people shall be few"]},
{b:"Daniel",r:"Daniel 10:19",t:4,p:"And said, O man greatly beloved,",a:"fear not: peace be unto thee",s:", be strong, yea, be strong.",d:["hide the vision until the end","return unto thy people in Judah","ask a sign of the king"]},
{b:"Daniel",r:"Daniel 7:27",t:5,p:"whose kingdom is",a:"an everlasting kingdom",s:", and all dominions shall serve and obey him.",d:["a kingdom of this world","a kingdom for a thousand years","a kingdom given to the Chaldeans"]},

{b:"Zechariah",r:"Zechariah 14:9",t:3,p:"And the LORD shall be",a:"king over all the earth",s:": in that day shall there be one LORD, and his name one.",d:["judge of Judah only","a light unto Jerusalem","prince among the nations for a season"]},
{b:"Zechariah",r:"Zechariah 1:3",t:4,p:"Thus saith the LORD of hosts;",a:"Turn ye unto me",s:", saith the LORD of hosts, and I will turn unto you, saith the LORD of hosts.",d:["Prepare ye the way","Return unto the land","Keep the former fasts"]},
{b:"Zechariah",r:"Zechariah 2:10",t:4,p:"Sing and rejoice, O daughter of Zion: for, lo, I come, and I will",a:"dwell in the midst of thee",s:", saith the LORD.",d:["give thee rest from Babylon","set a king over Judah","build again the wall only"]},
{b:"Zechariah",r:"Zechariah 3:2",t:4,p:"is not this",a:"a brand plucked out of the fire",s:"?",d:["a stone rejected of the builders","a lamb taken from the flock","a vessel chosen for honour"]},
{b:"Zechariah",r:"Zechariah 7:9",t:4,p:"Thus speaketh the LORD of hosts, saying,",a:"Execute true judgment, and shew mercy",s:" and compassions every man to his brother:",d:["Offer the tithes of the land","Keep the fast of the fifth month","Build the house with cedar"]},
{b:"Zechariah",r:"Zechariah 12:10",t:4,p:"and they shall",a:"look upon me whom they have pierced",s:", and they shall mourn for him, as one mourneth for his only son,",d:["seek a sign from heaven","ask for a king like the nations","turn again unto the law of Moses"]},
{b:"Zechariah",r:"Zechariah 13:9",t:5,p:"they shall call on my name, and I will hear them: I will say,",a:"It is my people",s:": and they shall say, The LORD is my God.",d:["They have chosen another god","Judah is cut off this day","The remnant is too few"]},

{b:"1 Corinthians",r:"1 Corinthians 11:1",t:2,p:"Be ye",a:"followers of me",s:", even as I also am of Christ.",d:["teachers of the law","lords over the faith","judges of another man's servant"]},
{b:"1 Corinthians",r:"1 Corinthians 13:13",t:2,p:"And now abideth faith, hope, charity, these three; but",a:"the greatest of these is charity",s:".",d:["the first of these is faith","the last of these is hope","the strongest of these is knowledge"]},
{b:"1 Corinthians",r:"1 Corinthians 9:24",t:3,p:"Know ye not that they which run in a race run all, but one",a:"receiveth the prize",s:"? So run, that ye may obtain.",d:["keepeth the law","inheriteth the land","sitteth on a throne"]},
{b:"1 Corinthians",r:"1 Corinthians 10:31",t:3,p:"Whether therefore ye eat, or drink, or whatsoever ye do,",a:"do all to the glory of God",s:".",d:["do all to please the brethren","do all according to the law","do all that ye may be seen of men"]},
{b:"1 Corinthians",r:"1 Corinthians 12:13",t:3,p:"For by one Spirit are we all",a:"baptized into one body",s:", whether we be Jews or Gentiles, whether we be bond or free;",d:["gathered into one nation","circumcised after the manner of Moses","joined to one synagogue"]},
{b:"1 Corinthians",r:"1 Corinthians 13:8",t:3,p:"Charity",a:"never faileth",s:": but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.",d:["always seeketh her own","endureth only for a season","is greater than faith alone"]},
{b:"1 Corinthians",r:"1 Corinthians 14:33",t:3,p:"For God is not",a:"the author of confusion",s:", but of peace, as in all churches of the saints.",d:["the author of the law only","a God of the Jews alone","the author of tongues without interpretation"]},

{b:"Ephesians",r:"Ephesians 6:1",t:2,p:"Children,",a:"obey your parents in the Lord",s:": for this is right.",d:["honour the elders of the synagogue","keep the tradition of the fathers","give tithes of all ye possess"]},
{b:"Ephesians",r:"Ephesians 1:7",t:3,p:"In whom we have",a:"redemption through his blood",s:", the forgiveness of sins, according to the riches of his grace;",d:["peace by the works of the law","wisdom from the Greeks","pardon by our own righteousness"]},
{b:"Ephesians",r:"Ephesians 2:10",t:3,p:"For we are his workmanship,",a:"created in Christ Jesus unto good works",s:", which God hath before ordained that we should walk in them.",d:["born of the will of the flesh","made righteous by the law","chosen according to our works"]},
{b:"Ephesians",r:"Ephesians 3:20",t:3,p:"Now unto him that is able to do",a:"exceeding abundantly above all",s:" that we ask or think, according to the power that worketh in us,",d:["according to our labour only","as much as the law requireth","whatever the Gentiles seek after"]},
{b:"Ephesians",r:"Ephesians 4:2",t:3,p:"With all lowliness and meekness, with longsuffering,",a:"forbearing one another in love",s:";",d:["judging one another in the law","exalting ourselves above the brethren","keeping separate from the Gentiles"]},
{b:"Ephesians",r:"Ephesians 4:26",t:3,p:"Be ye angry, and sin not: let not the sun",a:"go down upon your wrath",s:":",d:["rise upon your fasting","set upon your offering","go down upon the sabbath"]},
{b:"Ephesians",r:"Ephesians 4:29",t:3,p:"Let no corrupt communication proceed out of your mouth, but that which is good to the use of edifying, that it may",a:"minister grace unto the hearers",s:".",d:["please the ears of the Greeks","establish you in the law","gain a name among men"]},
{b:"Ephesians",r:"Ephesians 5:8",t:3,p:"For ye were sometimes darkness, but now are ye light in the Lord:",a:"walk as children of light",s:":",d:["walk as children of the day of Moses","sit still until the kingdom come","hide the light under a bushel"]},
{b:"Ephesians",r:"Ephesians 6:10",t:3,p:"Finally, my brethren,",a:"be strong in the Lord",s:", and in the power of his might.",d:["be strong in your own flesh","stand fast in the tradition of the elders","trust in the armour of men"]},
{b:"Ephesians",r:"Ephesians 5:25",t:4,p:"Husbands,",a:"love your wives",s:", even as Christ also loved the church, and gave himself for it;",d:["rule your houses with a rod","put away your wives for every cause","leave father and mother only"]},
{b:"Ephesians",r:"Ephesians 1:3",t:4,p:"Blessed be the God and Father of our Lord Jesus Christ, who hath blessed us with",a:"all spiritual blessings",s:" in heavenly places in Christ:",d:["the riches of this world","the honour of the Gentiles","the promises made to Abraham only"]},
{b:"Ephesians",r:"Ephesians 5:11",t:4,p:"And have no fellowship with",a:"the unfruitful works of darkness",s:", but rather reprove them.",d:["the brethren that are weak","the church that is at Antioch","the feast of the new moon"]},

{b:"1 Timothy",r:"1 Timothy 2:1",t:3,p:"I exhort therefore, that, first of all,",a:"supplications, prayers, intercessions",s:", and giving of thanks, be made for all men;",d:["tithes, offerings, and firstfruits","vows, fasts, and washings","psalms, hymns, and spiritual songs"]},
{b:"1 Timothy",r:"1 Timothy 4:8",t:3,p:"For bodily exercise profiteth little: but",a:"godliness is profitable unto all things",s:", having promise of the life that now is, and of that which is to come.",d:["knowledge puffeth up the weak","riches profit a man in this life","the law is profitable unto the Jew only"]},
{b:"1 Timothy",r:"1 Timothy 6:6",t:3,p:"But godliness with contentment is",a:"great gain",s:".",d:["a snare","little worth","only for this life"]},
{b:"1 Timothy",r:"1 Timothy 6:11",t:3,p:"But thou, O man of God,",a:"flee these things",s:"; and follow after righteousness, godliness, faith, love, patience, meekness.",d:["lay hold on uncertain riches","strive about words to no profit","keep the fables of the elders"]},
{b:"1 Timothy",r:"1 Timothy 3:16",t:4,p:"And without controversy great is",a:"the mystery of godliness",s:": God was manifest in the flesh,",d:["the mystery of iniquity","the tradition of the elders","the wisdom of the Greeks"]},
{b:"1 Timothy",r:"1 Timothy 6:17",t:4,p:"Charge them that are rich in this world, that they be not highminded, nor",a:"trust in uncertain riches",s:", but in the living God, who giveth us richly all things to enjoy;",d:["trust in the law of Moses","boast in the honour of men","lay up treasure upon earth only"]},

{b:"1 Peter",r:"1 Peter 1:16",t:3,p:"Because it is written,",a:"Be ye holy; for I am holy",s:".",d:["Keep the feasts of the fathers","Wash often according to the law","Offer the blood of bulls"]},
{b:"1 Peter",r:"1 Peter 2:24",t:3,p:"Who his own self bare our sins in his own body on the tree, that we, being dead to sins, should live unto righteousness: by whose",a:"stripes ye were healed",s:".",d:["works ye were justified","offerings ye were cleansed","washings ye were made whole"]},
{b:"1 Peter",r:"1 Peter 1:8",t:3,p:"Whom having not seen, ye love; in whom, though now ye see him not, yet believing, ye rejoice with",a:"joy unspeakable and full of glory",s:":",d:["fear unspeakable and full of dread","honour among the Gentiles","the joy of the harvest"]},
{b:"1 Peter",r:"1 Peter 2:5",t:3,p:"Ye also, as lively stones, are built up",a:"a spiritual house",s:", an holy priesthood, to offer up spiritual sacrifices, acceptable to God by Jesus Christ.",d:["an earthly tabernacle","a house of cedar","a synagogue of the Jews"]},
{b:"1 Peter",r:"1 Peter 4:10",t:3,p:"As every man hath received the gift, even so minister the same one to another, as",a:"good stewards of the manifold grace of God",s:".",d:["lords over God's heritage","teachers of the law of Moses","keepers of the tradition of the elders"]},
{b:"1 Peter",r:"1 Peter 1:7",t:4,p:"That the trial of your faith, being much more precious than of gold that perisheth, though it be tried with fire, might be found unto",a:"praise and honour and glory",s:" at the appearing of Jesus Christ:",d:["silver and gold and precious stones","rest in the land of Canaan","honour among the rulers of this world"]},
{b:"1 Peter",r:"1 Peter 1:25",t:4,p:"But the word of the Lord",a:"endureth for ever",s:". And this is the word which by the gospel is preached unto you.",d:["standeth for a season","returneth void unto him","is written in tables of stone only"]},
{b:"1 Peter",r:"1 Peter 2:11",t:4,p:"Dearly beloved, I beseech you as strangers and pilgrims,",a:"abstain from fleshly lusts",s:", which war against the soul;",d:["keep the customs of the Gentiles","seek a continuing city here","return unto the beggarly elements"]},
{b:"1 Peter",r:"1 Peter 3:18",t:4,p:"For Christ also hath once suffered for sins,",a:"the just for the unjust",s:", that he might bring us to God, being put to death in the flesh, but quickened by the Spirit:",d:["the strong for the weak only","the Jew for the Gentile only","the priest for the people yearly"]},

{b:"1 John",r:"1 John 1:7",t:2,p:"But if we walk in the light, as he is in the light, we have fellowship one with another, and",a:"the blood of Jesus Christ his Son",s:" cleanseth us from all sin.",d:["the washings of the law","the blood of bulls and goats","our own righteousness before God"]},
{b:"1 John",r:"1 John 4:7",t:2,p:"Beloved, let us love one another: for",a:"love is of God",s:"; and every one that loveth is born of God, and knoweth God.",d:["love is of the world","love is the fulfilling of the law only","love is a gift of the Greeks"]},
{b:"1 John",r:"1 John 2:15",t:3,p:"Love not the world, neither the things that are in the world. If any man love the world,",a:"the love of the Father",s:" is not in him.",d:["the fear of the LORD","the hope of Israel","the promise of the Spirit"]},
{b:"1 John",r:"1 John 2:1",t:3,p:"My little children, these things write I unto you, that ye sin not. And if any man sin, we have",a:"an advocate with the Father",s:", Jesus Christ the righteous:",d:["a priest after the order of Aaron","a mediator of the old covenant","an offering of turtledoves"]},
{b:"1 John",r:"1 John 2:6",t:3,p:"He that saith he abideth in him ought himself also",a:"so to walk, even as he walked",s:".",d:["so to keep the whole law","so to sit at the right hand","so to be seen of men"]},
{b:"1 John",r:"1 John 3:16",t:3,p:"Hereby perceive we the love of God, because he",a:"laid down his life for us",s:": and we ought to lay down our lives for the brethren.",d:["gave us the law at Sinai","chose us out of the Gentiles","sent us the prophets only"]},
{b:"1 John",r:"1 John 3:18",t:3,p:"My little children, let us not",a:"love in word, neither in tongue",s:"; but in deed and in truth.",d:["walk after the flesh","judge one another any more","keep company with sinners"]},
{b:"1 John",r:"1 John 5:3",t:3,p:"For this is the love of God, that we",a:"keep his commandments",s:": and his commandments are not grievous.",d:["keep the traditions of men","seek a sign from heaven","fulfil the law by works alone"]},
{b:"1 John",r:"1 John 5:11",t:3,p:"And this is the record, that",a:"God hath given to us eternal life",s:", and this life is in his Son.",d:["God hath given us the land of Canaan","Moses hath given us the law","Abraham hath obtained the promise only"]}

];

if(typeof module !== "undefined" && module.exports) module.exports = VERSES_MORE;
