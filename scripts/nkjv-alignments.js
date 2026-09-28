// Curated explicit alignments and distractors for verses where NKJV shifts the phrase or boundary
const EXPLICIT = {
  "Genesis 1:1": {
    p: "In the beginning God created the", a: "heavens and the earth", s: ".",
    d: ["earth and the heavens", "heavens and the land", "firmament and the earth"]
  },
  "Genesis 2:7": {
    p: "And the Lord God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a", a: "living being", s: ".",
    d: ["living soul", "living spirit", "living creature"]
  },
  "Genesis 4:9": {
    p: "Then the Lord said to Cain, “Where is Abel your brother?” He said, “I do not know.", a: "Am I my brother’s keeper", s: "?”",
    d: ["“He is departed into the field”", "“I know not where he dwells”", "“I have not seen my brother”"],
    qaOk: ["recycled"]
  },
  "Genesis 9:13": {
    p: "I set My", a: "rainbow", s: "in the cloud, and it shall be for the sign of the covenant between Me and the earth.",
    d: ["promise", "light", "token"]
  },
  "Genesis 12:1": {
    p: "Now the Lord had said to Abram: “Get out of your country, from your family and from your father’s house,", a: "to a land that I will show you", s: ".”",
    d: ["to a land flowing with milk", "to the mountains of promise", "unto the place of blessing"],
    qaOk: ["mid-clause"]
  },
  "Genesis 12:3": {
    p: "I will bless those who bless you, and I will curse him who curses you; and in you", a: "all the families of the earth", s: "shall be blessed.",
    d: ["all kingdoms of the world", "many nations of promise", "all the generations of men"]
  },
  "Genesis 28:15": {
    p: "Behold, I am with you and will keep you", a: "wherever you go", s: ", and will bring you back to this land.",
    d: ["in all your ways", "through the deep waters", "in the strange land"]
  },
  "Exodus 3:14": {
    p: "And God said to Moses,", a: "I AM WHO I AM", s: ". And He said, “Thus you shall say to the children of Israel, ‘I AM has sent me to you.’”",
    d: ["I AM THE LORD", "I AM THE FIRST AND LAST", "I AM ALMIGHTY GOD"]
  },
  "Exodus 20:12": {
    p: "“Honor your father and your mother, that", a: "your days may be long upon the land", s: "which the Lord your God is giving you.",
    d: ["you may dwell safely in the land", "your house may be established", "peace may be multiplied to you"]
  },
  "Exodus 33:18": {
    p: "And he said, “Please,", a: "show me Your glory", s: ".”",
    d: ["reveal Your presence", "manifest Your power", "declare Your holy name"]
  },
  "Numbers 6:24": {
    p: "The Lord", a: "bless you and keep you", s: "; the Lord make His face shine upon you.",
    d: ["comfort and guide you", "defend and deliver you", "preserve and prosper you"]
  },
  "Deuteronomy 6:5": {
    p: "You shall love the Lord your God with all your heart, with all your soul, and with all your", a: "strength", s: ".",
    d: ["might", "mind", "power"]
  },
  "Deuteronomy 10:12": {
    p: "And now, Israel, what does the Lord your God require of you, but", a: "to fear the Lord your God", s: ", to walk in all His ways and to love Him?",
    d: ["to keep the commandments of the Lord", "to offer sacrifices of thanksgiving", "to walk humbly before God"]
  },
  "Deuteronomy 10:17": {
    p: "For the Lord your God is God of gods and Lord of lords, the great God, mighty and awesome, who", a: "shows no partiality nor takes a bribe", s: ".",
    d: ["regardeth not persons", "rules over the nations", "executes righteousness"]
  },
  "Deuteronomy 31:6": {
    p: "for the Lord your God, He is the One who goes with you. He will", a: "not leave you nor forsake you", s: ".",
    d: ["keep you from all evil", "deliver you out of trouble", "establish your footstep"]
  },
  "Deuteronomy 32:4": {
    p: "He is the Rock, His work is perfect; for all His ways are justice, a God of truth and without injustice;", a: "righteous and upright is He", s: ".",
    d: ["holy and exalted is He", "glorious in holiness", "faithful forever is He"]
  },
  "Joshua 1:9": {
    p: "Be strong and of good courage; do not be afraid, nor be", a: "dismayed", s: ", for the Lord your God is with you wherever you go.",
    d: ["discouraged", "troubled", "faint-hearted"]
  },
  "Judges 5:31": {
    p: "Thus let all Your enemies perish, O Lord! But let those who love Him be like the sun when it comes out in full", a: "strength", s: ".” So the land had rest for forty years.",
    d: ["glory", "might", "splendor"]
  },
  "Judges 6:12": {
    p: "And the Angel of the Lord appeared to him, and said to him, “The Lord is with you, you mighty man of", a: "valor", s: "!”",
    d: ["might", "courage", "war"]
  },
  "Judges 6:24": {
    p: "So Gideon built an altar there to the Lord, and called it The-Lord-Is-Peace.", a: "To this day it is still in Ophrah", s: "of the Abiezrites.",
    d: ["For a perpetual memorial", "And the altar remains", "Even unto this generation"],
    qaOk: ["mid-clause"]
  },
  "Judges 7:18": {
    p: "When I blow the trumpet, I and all who are with me, then you also blow the trumpets on every side of the whole camp, and say,", a: "The sword of the Lord and of Gideon", s: "!”",
    d: ["The battle is the Lord's", "The Lord hath delivered Midian", "The victory of Israel"]
  },
  "Ruth 1:16": {
    p: "Wherever you go, I will go; and wherever you lodge, I will lodge; your people shall be my people, and", a: "your God, my God", s: ".",
    d: ["my God shall be your God", "the Lord our God", "your God shall keep us"]
  },
  "Ruth 4:14": {
    p: "Blessed be the Lord, who has not left you this day", a: "without a close relative", s: "; and may his name be famous in Israel!",
    d: ["without a redeemer", "without a kinsman", "without an heir"]
  },
  "1 Samuel 16:7": {
    p: "For the Lord does not see as man sees; for man looks at the outward appearance, but the Lord looks at the", a: "heart", s: ".",
    d: ["inward spirit", "hidden man", "humble soul"]
  },
  "2 Samuel 12:7": {
    p: "Then Nathan said to David,", a: "You are the man", s: "! Thus says the Lord God of Israel: ‘I anointed you king over Israel.’",
    d: ["The guilt is thine", "Thou hast done this", "Thy sin is judged"]
  },
  "2 Samuel 24:24": {
    p: "nor will I offer burnt offerings to the Lord my God with that which", a: "costs me nothing", s: ".”",
    d: ["was freely given", "is not mine own", "is without price"]
  },
  "1 Kings 6": {
    p: "Solomon built the temple of the Lord,", a: "and finished it", s: ".",
    d: ["with cedar and gold", "in seven years", "upon Mount Moriah"]
  },
  "1 Kings 17:16": {
    p: "The bin of flour was not used up,", a: "nor did the jar of oil run dry", s: ", according to the word of the Lord which He spoke by Elijah.",
    d: ["neither did the cruse of oil fail", "nor did the meal waste", "and the vessel was ever full"]
  },
  "2 Kings 6:16": {
    p: "So he answered, “Do not fear, for those who are with us are", a: "more than those who are with them", s: ".”",
    d: ["mightier than the Syrian host", "greater than the army of Aram", "a chariot of fire round about"]
  },
  "2 Kings 22:19": {
    p: "because your heart was tender, and you humbled yourself before the Lord... and wept before Me,", a: "I also have heard you, says the Lord", s: ".",
    d: ["I will deliver you from all evil", "your kingdom shall be established", "mercy shall follow your house"]
  },
  "1 Chronicles 4:10": {
    p: "Oh, that You would bless me indeed, and enlarge my", a: "territory", s: ", that Your hand would be with me.",
    d: ["borders", "coast", "inheritance"]
  },
  "2 Chronicles 16:9": {
    p: "For the eyes of the Lord run to and fro throughout the whole earth, to show Himself strong on behalf of those whose heart is", a: "loyal to Him", s: ".",
    d: ["perfect toward Him", "upright before Him", "cleaving unto Him"]
  },
  "2 Chronicles 20:12": {
    p: "nor do we know what to do,", a: "but our eyes are upon You", s: ".”",
    d: ["our hope is in Your mercy", "our prayer is made to heaven", "we look for Your salvation"]
  },
  "2 Chronicles 20:15": {
    p: "Do not be afraid nor dismayed because of this great multitude,", a: "for the battle is not yours, but God’s", s: ".",
    d: ["for the Lord will fight for Israel", "the victory is already won", "stand still and see salvation"],
    qaOk: ["recycled"]
  },
  "Ezra 7:10": {
    p: "For Ezra had prepared his heart to seek the Law of the Lord, and to do it, and to teach", a: "statutes and ordinances", s: "in Israel.",
    d: ["statutes and judgments", "commandments and laws", "ordinances and precepts"]
  },
  "Job 19:25": {
    p: "For I know that my Redeemer lives, and He shall stand", a: "at last on the earth", s: ";",
    d: ["at the latter day", "upon Mount Zion", "in the final judgment"]
  },
  "Job 42:2": {
    p: "I know that You can do everything, and that", a: "no purpose of Yours can be withheld", s: "from You.",
    d: ["all Your thoughts are righteous", "no thought can be withholden", "Your counsel standeth sure"]
  },
  "Psalm 9:1": {
    p: "I will praise You, O Lord, with my whole heart;", a: "I will tell of all Your marvelous works", s: ".",
    d: ["I will sing praises to Thy name", "my mouth shall speak Your truth", "I will shew forth Your wonders"]
  },
  "Psalm 23:1": {
    p: "The Lord is my shepherd; I", a: "shall not want", s: ".",
    d: ["shall not fear", "shall not faint", "lack nothing"]
  },
  "Psalm 23:4": {
    p: "Yea, though I walk through the valley of the shadow of death, I will fear no evil; for You are with me;", a: "Your rod and Your staff, they comfort me", s: ".",
    d: ["Your hand and Your word they keep me", "Your presence and grace uphold my soul", "the angel of the Lord camps round me"],
    qaOk: ["recycled"]
  },
  "Psalm 27:1": {
    p: "The Lord is my light and my salvation; whom shall I fear? The Lord is the", a: "strength of my life", s: "; of whom shall I be afraid?",
    d: ["rock of my defense", "shield of my soul", "strong tower of hope"],
    qaOk: ["mid-clause"]
  },
  "Psalm 37:4": {
    p: "Delight yourself also in the Lord, and He shall give you the", a: "desires of your heart", s: ".",
    d: ["blessings of the covenant", "inheritance of the faithful", "peace that passeth understanding"]
  },
  "Psalm 40:8": {
    p: "I delight to do Your will, O my God, and", a: "Your law is within my heart", s: ".”",
    d: ["Your truth is my shield", "Your word have I treasured", "Thy statutes are my song"]
  },
  "Psalm 46:1": {
    p: "God is our refuge and strength, a", a: "very present help in trouble", s: ".",
    d: ["sure fortress in battle", "mighty deliverer in distress", "rock and shield forever"]
  },
  "Psalm 51:10": {
    p: "Create in me a clean heart, O God, and renew a", a: "steadfast spirit within me", s: ".",
    d: ["right spirit within me", "humble spirit in my soul", "faithful heart before Thee"]
  },
  "Psalm 91:1": {
    p: "He who dwells in the secret place of the Most High shall", a: "abide under the shadow of the Almighty", s: ".",
    d: ["dwell safely in His holy tent", "find refuge beneath His wings", "rest upon His holy hill"]
  },
  "Psalm 96:1": {
    p: "Oh, sing to the Lord a new song!", a: "Sing to the Lord, all the earth", s: ".",
    d: ["Praise His name among nations", "Declare His marvelous deeds", "Make a joyful noise to God"]
  },
  "Psalm 113:3": {
    p: "From the rising of the sun to its going down", a: "The Lord’s name is to be praised", s: ".",
    d: ["His glory shines in all the earth", "all nations shall bow down and worship", "His righteousness endureth forever"],
    qaOk: ["recycled"]
  },
  "Psalm 118:24": {
    p: "This is the day the Lord has made; we will", a: "rejoice and be glad in it", s: ".",
    d: ["praise and give thanks therein", "sing of His righteousness", "stand and bless His name"]
  },
  "Psalm 119:11": {
    p: "Your word I have hidden in my heart, that", a: "I might not sin against You", s: ".",
    d: ["I might walk in Your truth", "I might teach Your statutes", "my steps should never falter"]
  },
  "Psalm 119:105": {
    p: "Your word is a", a: "lamp to my feet", s: "and a light to my path.",
    d: ["shield to my soul", "light unto my eyes", "guide to my steps"]
  },
  "Psalm 121:1": {
    p: "I will lift up my eyes to the hills—from", a: "whence comes my help", s: "?",
    d: ["whence shall salvation arise", "which the Lord hath blessed", "where the temple stands"]
  },
  "Psalm 138:8": {
    p: "The Lord will", a: "perfect that which concerns me", s: "; Your mercy, O Lord, endures forever.",
    d: ["preserve my going out and coming in", "guide me with His holy counsel", "deliver my soul from the pit"]
  },
  "Psalm 139:14": {
    p: "I will praise You, for I am", a: "fearfully and wonderfully made", s: "; marvelous are Your works.",
    d: ["fashioned by Your wisdom", "formed by Your hands", "created in Your image"]
  },
  "Proverbs 3:5": {
    p: "Trust in the Lord with all your heart, and lean not on your", a: "own understanding", s: ";",
    d: ["carnal wisdom", "earthly counsel", "proud imagination"]
  },
  "Proverbs 8:17": {
    p: "I love those who love me, and", a: "those who seek me diligently will find me", s: ".",
    d: ["those who wait upon my wisdom shall prosper", "he who keepeth my commandments shall live", "they that seek my counsel shall find peace"]
  },
  "Proverbs 15:1": {
    p: "A soft answer turns away wrath, but a", a: "harsh word stirs up anger", s: ".",
    d: ["grievous word stirs up wrath", "bitter speech kindles fire", "proud retort brings trouble"]
  },
  "Ecclesiastes 3:1": {
    p: "To everything there is a season, a time for every", a: "purpose under heaven", s: ":",
    d: ["matter upon the earth", "counsel of the heart", "work of man's hands"]
  },
  "Ecclesiastes 3:11": {
    p: "He has made everything beautiful in its time. Also", a: "He has put eternity in their hearts", s: ",",
    d: ["He hath set the world in them", "wisdom is given to the wise", "His glory fills the earth"]
  },
  "Ecclesiastes 12:13": {
    p: "Fear God and keep His commandments, for", a: "this is man’s all", s: ".",
    d: ["this is the whole duty of man", "the end of all wisdom", "this brings life eternal"]
  },
  "Song of Solomon 2:1": {
    p: "I am the rose of Sharon, and the", a: "lily of the valleys", s: ".",
    d: ["flower of the field", "cedar of Lebanon", "beauty of the vineyard"]
  },
  "Isaiah 1:18": {
    p: "“Come now, and let us reason together,” says the Lord, “Though your sins are like scarlet, they shall be as", a: "white as snow", s: ";",
    d: ["pure as wool", "cleansed from stain", "washed in the fountain"]
  },
  "Isaiah 37:33": {
    p: "He shall not come into this city, nor shoot an arrow there, nor come before it with shield,", a: "nor build a siege mound against it", s: ".",
    d: ["nor shall his army compass it about", "neither shall the battering ram prevail", "nor shall he cast a bank before the gates"]
  },
  "Isaiah 37:36": {
    p: "And when people arose early in the morning,", a: "there were the corpses—all dead", s: ".",
    d: ["they were all dead corpses", "the host of Assyria was fallen", "the camp was utterly slain"]
  },
  "Isaiah 40:31": {
    p: "But those who wait on the Lord shall renew their strength; they shall", a: "mount up with wings like eagles", s: ",",
    d: ["run and not be weary", "soar above the tempest", "walk and never faint"]
  },
  "Jeremiah 17:7": {
    p: "Blessed is the man who", a: "trusts in the Lord", s: ", and whose hope is the Lord.",
    d: ["fears the Almighty", "walks in His statutes", "cleaves unto His name"]
  },
  "Jeremiah 29:11": {
    p: "For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil,", a: "to give you a future and a hope", s: ".",
    d: ["to bring you to an expected end", "to deliver you from trouble", "to bless your latter days"]
  },
  "Lamentations 3:22": {
    p: "Through the Lord’s mercies we are not consumed, because His", a: "compassions fail not", s: ".",
    d: ["mercies endure forever", "lovingkindness is eternal", "faithfulness is great"]
  },
  "Ezekiel 36:26": {
    p: "I will take the heart of stone out of your flesh and give you a", a: "heart of flesh", s: ".",
    d: ["new heart of peace", "living spirit within", "clean heart of truth"]
  },
  "Ezekiel 37:4": {
    p: "Again He said to me, “Prophesy to these bones, and say to them, ‘O", a: "dry bones, hear the word of the Lord", s: "!’”",
    d: ["slain of Israel, arise and live", "scattered host, assemble together", "valley of death, behold your King"]
  },
  "Ezekiel 47:12": {
    p: "Their leaves will not wither, and their fruit will not fail.", a: "They will bear fruit every month", s: ",",
    d: ["New fruit shall grow continually", "Twelve manners of fruit shall blossom", "Their branch shall never cease"]
  },
  "Daniel 6:22": {
    p: "My God sent His angel and shut the lions’ mouths, so that they have not hurt me, because", a: "I was found innocent before Him", s: "; and also, O king, I have done no wrong before you.”",
    d: ["he found no fault in my life", "my hands were clean of evil", "the Lord upheld my integrity"]
  },
  "Daniel 10:19": {
    p: "And he said,", a: "“O man greatly beloved, fear not", s: "! Peace be to you; be strong, yes, be strong!”",
    d: ["“Arise, O Daniel, and stand upright”", "“Fear not, for thy prayer is heard”", "“Peace be multiplied unto you”"],
    qaOk: ["recycled"]
  },
  "Hosea 6:6": {
    p: "For I desire mercy and not sacrifice, and the knowledge of God more than", a: "burnt offerings", s: ".",
    d: ["the blood of bulls", "the fat of rams", "solemn assemblies"]
  },
  "Joel 2:25": {
    p: "So I will restore to you", a: "the years that the swarming locust has eaten", s: ",",
    d: ["the harvest of former years", "the vineyard that was ruined", "all the storehouse that was empty"]
  },
  "Joel 2:28": {
    p: "I will pour out My Spirit on all flesh; your sons and your daughters shall", a: "prophesy", s: ", your old men shall dream dreams.",
    d: ["see visions", "declare My glory", "rejoice in the Lord"]
  },
  "Obadiah 1:3": {
    p: "The pride of your heart has deceived you, you who dwell in the", a: "clefts of the rock", s: ",",
    d: ["heights of the mountains", "strongholds of Edom", "fortresses of the hills"]
  },
  "Obadiah 1:12": {
    p: "You should not have gazed on the day of your brother in", a: "the day of his captivity", s: ";",
    d: ["the day that he became a stranger", "the time of his calamity", "the hour of his destruction"]
  },
  "Obadiah 1:15": {
    p: "As you have done, it shall be done to you; your reprisal shall return upon", a: "your own head", s: ".",
    d: ["the house of Edom", "the children of pride", "the land of your fathers"]
  },
  "Nahum 2:1": {
    p: "He who scatters has come up before your face.", a: "Man the fort! Watch the road!", s: "Strengthen your flanks! Fortify your power mightily.",
    d: ["Keep the munition, watch the way!", "Sound the trumpet in Zion!", "Set the watchmen upon the wall!"]
  },
  "Habakkuk 3:17-18": {
    p: "Though the fig tree may not blossom, nor fruit be on the vines... yet", a: "I will rejoice in the Lord", s: ", I will joy in the God of my salvation.",
    d: ["my soul shall sing His praise", "the Lord shall be my strength", "I will trust and not fear"]
  },
  "Zechariah 1:3": {
    p: "Therefore say to them, ‘Thus says the Lord of hosts: “", a: "Return to Me", s: ",” says the Lord of hosts, “and I will return to you,” says the Lord of hosts.",
    d: ["Turn ye unto me", "Seek ye my face", "Repent and be converted"]
  },
  "Zechariah 9:9": {
    p: "Behold, your King is coming to you; He is just and having salvation, lowly and riding on a", a: "donkey", s: ", a colt, the foal of a donkey.",
    d: ["colt", "foal", "mule"]
  },
  "Zechariah 12:10": {
    p: "then they will", a: "look on Me whom they pierced", s: ". Yes, they will mourn for Him as one mourns for his only son.",
    d: ["behold the King in His beauty", "know that I am the Lord", "mourn for their transgression"]
  },
  "Zephaniah 3:17": {
    p: "The Lord your God in your midst, The Mighty One, will save; He will rejoice over you with gladness, He will quiet you with His love,", a: "He will rejoice over you with singing", s: ".”",
    d: ["He will joy over you with joy", "His heart shall be full of praise", "The angels shall sing above you"]
  },
  "Matthew 5:14": {
    p: "You are the light of the world. A city that is set on a hill", a: "cannot be hidden", s: ".",
    d: ["gives light to all", "shines in darkness", "shall never fall"]
  },
  "Matthew 25:21": {
    p: "His lord said to him, ‘Well done, good and faithful servant; you were faithful over a few things, I will make you ruler over many things.", a: "Enter into the joy of your lord", s: ".’",
    d: ["Receive the kingdom prepared for you", "Sit with me on my throne", "Great is your reward in heaven"]
  },
  "Mark 12:31": {
    p: "And the second, like it, is this:", a: "‘You shall love your neighbor as yourself", s: ".’ There is no other commandment greater than these.”",
    d: ["‘Walk humbly before your God", "‘Keep the commandments and live", "‘Do unto others in righteousness"]
  },
  "Luke 11:9": {
    p: "So I say to you, ask, and it will be given to you;", a: "seek, and you will find", s: "; knock, and it will be opened to you.",
    d: ["search, and you shall know", "ask, and you shall receive", "call, and He will answer"]
  },
  "John 1:1": {
    p: "In the beginning was the Word, and the Word was with God, and the Word", a: "was God", s: ".",
    d: ["was with God", "was divine", "became flesh"],
    qaOk: ["recycled"]
  },
  "John 10:10": {
    p: "I have come that they may have life, and that they may have it", a: "more abundantly", s: ".",
    d: ["forever and ever", "without measure", "in fullness of joy"]
  },
  "John 11:25": {
    p: "Jesus said to her, “I am the resurrection and the life. He who believes in Me, though he may die,", a: "he shall live", s: ".",
    d: ["shall never perish", "hath life everlasting", "shall see the kingdom"]
  },
  "John 13:34": {
    p: "A new commandment I give to you, that you love one another; as I have loved you,", a: "that you also love one another", s: ".",
    d: ["that you keep My words in truth", "that you abide in My holy grace", "that you bear much fruit for God"]
  },
  "John 14:6": {
    p: "Jesus said to him, “I am the way, the truth, and the life. No one comes to the Father", a: "except through Me", s: ".”",
    d: ["but by my word", "without my grace", "save through the cross"]
  },
  "John 17:17": {
    p: "Sanctify them by Your truth.", a: "Your word is truth", s: ".",
    d: ["Thy word is a lamp", "Your law is righteousness", "The truth shall make you free"]
  },
  "Acts 1:8": {
    p: "and you shall be", a: "witnesses to Me", s: "in Jerusalem, and in all Judea and Samaria, and to the end of the earth.",
    d: ["ministers of the gospel", "apostles of the kingdom", "servants of the truth"]
  },
  "Acts 2:38": {
    p: "Then Peter said to them, “Repent, and", a: "let every one of you be baptized", s: "in the name of Jesus Christ for the remission of sins.”",
    d: ["turn with all your heart to God", "believe on the Lord Jesus Christ", "wash away your iniquities in faith"]
  },
  "Acts 10:34": {
    p: "Then Peter opened his mouth and said: “In truth", a: "I perceive that God shows no partiality", s: ".",
    d: ["God is no respecter of persons", "the kingdom of heaven is at hand", "the promise is unto all nations"]
  },
  "Romans 8:14": {
    p: "For as many as are led by the Spirit of God,", a: "these are sons of God", s: ".",
    d: ["they shall inherit the kingdom", "they walk in eternal light", "heirs of promise shall they be"]
  },
  "Romans 8:28": {
    p: "And we know that all things", a: "work together for good", s: "to those who love God, to those who are the called according to His purpose.",
    d: ["turn unto salvation", "work for eternal glory", "prosper in righteousness"]
  },
  "1 Corinthians 3:16": {
    p: "Do you not know that you are the temple of God and that the", a: "Spirit of God dwells in you", s: "?",
    d: ["Holy Ghost abideth in your hearts", "power of the Most High overshadows you", "grace of Christ is magnified in you"]
  },
  "1 Corinthians 9:24": {
    p: "Do you not know that those who run in a race all run, but one", a: "receives the prize", s: "? Run in such a way that you may obtain it.",
    d: ["win the crown", "gain the reward", "receiveth the trophy"]
  },
  "1 Corinthians 11:1": {
    p: "Imitate me, just as", a: "I also imitate Christ", s: ".",
    d: ["I follow the footsteps of the Lord", "I keep the commandments of God", "the apostles have instructed you"]
  },
  "1 Corinthians 13:12": {
    p: "For now we see in a mirror, dimly, but then", a: "face to face", s: ".",
    d: ["in the light of His glory", "as He truly is", "without a veil"]
  },
  "1 Corinthians 16:14": {
    p: "Let all that you do", a: "be done with love", s: ".",
    d: ["be done with charity", "be done in faith", "bring glory to God"]
  },
  "Galatians 5:22": {
    p: "But the fruit of the Spirit is love, joy, peace,", a: "longsuffering, kindness, goodness", s: ", faithfulness, gentleness, self-control.",
    d: ["patience, temperance, meekness", "mercy, compassion, truth", "righteousness, faith, charity"]
  },
  "Ephesians 4:32": {
    p: "And be kind to one another, tenderhearted, forgiving one another,", a: "even as God in Christ forgave you", s: ".",
    d: ["as Christ also loved the church", "for His mercy endureth forever", "that your sins may be blotted out"]
  },
  "Philippians 2:3": {
    p: "Let nothing be done through selfish ambition or conceit, but in lowliness of mind let", a: "each esteem others better than himself", s: ".",
    d: ["each seek the good of his brother", "all dwell together in unity", "every man walk in humility"]
  },
  "Philippians 4:13": {
    p: "I can do all things through Christ who", a: "strengthens me", s: ".",
    d: ["keeps me", "comforts me", "teaches me"]
  },
  "Colossians 1:13": {
    p: "He has delivered us from the power of darkness and conveyed us into", a: "the kingdom of the Son of His love", s: ",",
    d: ["the glorious liberty of the saints", "the marvelous light of His presence", "the everlasting inheritance of the saints"]
  },
  "1 Thessalonians 5:19": {
    p: "Do not quench the Spirit.", a: "Do not despise prophecies", s: ". Test all things; hold fast what is good.",
    d: ["Do not grieve the Lord", "Do not reject instruction", "Do not follow after vanity"]
  },
  "2 Thessalonians 2:15": {
    p: "Therefore, brethren, stand fast and", a: "hold the traditions which you were taught", s: ", whether by word or our epistle.",
    d: ["cleave unto the faith once delivered", "keep the commandments of Christ", "walk in the path of the saints"]
  },
  "2 Thessalonians 3:3": {
    p: "But the Lord is faithful, who will establish you and", a: "guard you from the evil one", s: ".",
    d: ["preserve your soul in peace", "keep your foot from stumbling", "strengthen you in every good work"]
  },
  "Hebrews 13:5": {
    p: "For He Himself has said,", a: "“I will never leave you nor forsake you", s: ".”",
    d: ["“Fear not, for I am with thee always”", "“My grace is sufficient for thee”", "“I will strengthen and uphold thee”"],
    qaOk: ["recycled"]
  },
  "James 2:17": {
    p: "Thus also faith", a: "by itself", s: ", if it does not have works, is dead.",
    d: ["being alone", "without fruit", "in the word only"]
  },
  "James 4:8": {
    p: "Draw near to God and He will draw near to you. Cleanse your hands, you sinners; and", a: "purify your hearts, you double-minded", s: ".",
    d: ["humble your souls before the Almighty", "seek the Lord while He may be found", "turn unto Him with all your strength"],
    qaOk: ["recycled"]
  },
  "1 Peter 1:16": {
    p: "because it is written,", a: "“Be holy, for I am holy", s: ".”",
    d: ["“Walk in the light of the Lord”", "“Keep my statutes and live”", "“Sanctify the Lord in your heart”"]
  },
  "1 Peter 1:25": {
    p: "but the word of the Lord", a: "endures forever", s: ".” Now this is the word which by the gospel was preached to you.",
    d: ["endureth for ever", "shall never pass away", "standeth firm in heaven"]
  },
  "1 Peter 2:9": {
    p: "But you are a chosen generation, a royal priesthood, a holy nation,", a: "His own special people", s: ",",
    d: ["a peculiar people", "the sons of promise", "an inheritance for God"]
  },
  "1 John 3:1": {
    p: "Behold what manner of love the Father has bestowed on us, that we should be called", a: "children of God", s: "! Therefore the world does not know us, because it did not know Him.",
    d: ["the sons of God", "heirs of promise", "saints in the light"]
  },
  "3 John 1:5": {
    p: "Beloved, you do faithfully", a: "whatever you do for the brethren", s: "and for strangers,",
    d: ["your labor of love for the saints", "the good works ordained of Christ", "all things in the service of God"]
  },
  "3 John 1:8": {
    p: "We therefore ought to receive such, that we may become", a: "fellow workers for the truth", s: ".",
    d: ["fellowhelpers to the truth", "partakers of the grace", "laborers in the vineyard"]
  },
  "3 John 1:11": {
    p: "Beloved, do not imitate what is evil, but", a: "what is good", s: ". He who does good is of God, but he who does evil has not seen God.",
    d: ["that which is good", "walk in righteousness", "follow that which is holy"]
  }
};

module.exports = { EXPLICIT };
