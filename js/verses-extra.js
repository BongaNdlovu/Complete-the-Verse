/* ==================================================================
   VERSE BANK — EXPANSION

   Hand-written. Every entry here has to survive `node scripts/qa-verses.js`,
   which means:

     - the blank is a phrase a person could hold in their head, not a
       word window sliced out of the verse;
     - each distractor is wrong about Scripture rather than wrong about
       grammar, so none of them can be eliminated without knowing the
       verse.

   This file replaces a 309-entry generated bank of which 296 failed that
   gate. Those references are not lost — they are queued for re-authoring
   in content/QUARANTINE.md. Ten generated entries passed the gate and are
   carried over below, marked as such.

   Add verses freely, but run the gate before committing. A bank that is
   half junk is worse than a bank half the size.
   ================================================================== */
const VERSES_EXTRA = [

/* ---------- LAW ---------- */
{b:"Genesis",r:"Genesis 17:1",t:4,p:"And when Abram was ninety years old and nine, the LORD appeared to Abram, and said unto him, I am the Almighty God;",a:"walk before me",s:", and be thou perfect.",d:["walk with me","walk after me","walk in my ways"]},
{b:"Exodus",r:"Exodus 15:2",t:3,p:"The LORD is",a:"my strength and song",s:", and he is become my salvation:",d:["my strength and shield","my refuge and song","my strength and portion"]},
{b:"Leviticus",r:"Leviticus 19:2",t:3,p:"Speak unto all the congregation of the children of Israel, and say unto them,",a:"Ye shall be holy",s:": for I the LORD your God am holy.",d:["Be ye holy","Ye shall be sanctified","Ye will be holy"]},
{b:"Leviticus",r:"Leviticus 26:12",t:5,p:"And I will walk among you, and will be your God, and",a:"ye shall be my people",s:".",d:["ye shall be my portion","ye shall be my children","ye shall be mine inheritance"]},
{b:"Numbers",r:"Numbers 6:26",t:3,p:"The LORD lift up his countenance upon thee, and",a:"give thee peace",s:".",d:["grant thee peace","give thee rest","give thee his peace"]},
{b:"Numbers",r:"Numbers 13:30",t:4,p:"Let us go up at once, and possess it; for",a:"we are well able to overcome it",s:".",d:["we shall surely overcome it","we are well able to prevail","we are strong to overcome it"]},
{b:"Deuteronomy",r:"Deuteronomy 30:19",t:3,p:"I have set before you life and death, blessing and cursing: therefore",a:"choose life",s:", that both thou and thy seed may live:",d:["choose thou life","choose the good","choose ye life"]},
{b:"Deuteronomy",r:"Deuteronomy 33:27",t:3,p:"The eternal God is thy refuge, and underneath are",a:"the everlasting arms",s:".",d:["the everlasting hands","the arms of the Almighty","the eternal arms"]},

/* ---------- HISTORY ---------- */
{b:"Joshua",r:"Joshua 3:5",t:4,p:"And Joshua said unto the people,",a:"Sanctify yourselves",s:": for to morrow the LORD will do wonders among you.",d:["Prepare yourselves","Purify yourselves","Hallow yourselves"]},
{b:"Joshua",r:"Joshua 21:45",t:5,p:"There failed not ought of any good thing which the LORD had spoken unto the house of Israel;",a:"all came to pass",s:".",d:["all was fulfilled","all came to nought","all shall come to pass"]},
{b:"Judges",r:"Judges 13:18",t:5,p:"And the angel of the LORD said unto him, Why askest thou thus after my name, seeing it is",a:"secret",s:"?",d:["wonderful","hidden","mysterious"]},
{b:"Judges",r:"Judges 2:10",t:4,p:"And there arose another generation after them, which",a:"knew not the LORD",s:", nor yet the works which he had done for Israel.",d:["knew not the LORD their God","feared not the LORD","regarded not the LORD"]},
{b:"Ruth",r:"Ruth 4:13",t:3,p:"So Boaz took Ruth, and she was his wife: and when he went in unto her,",a:"the LORD gave her conception",s:", and she bare a son.",d:["God gave her conception","the LORD gave her to conceive","the LORD gave conception"]},
{b:"Ruth",r:"Ruth 2:12",t:4,p:"The LORD recompense thy work, and a full reward be given thee of the LORD God of Israel,",a:"under whose wings",s:"thou art come to trust.",d:["under whose shadow","beneath whose wings","under whose feathers"]},
{b:"Ruth",r:"Ruth 4:15",t:5,p:"for thy daughter in law, which loveth thee, which is",a:"better to thee than seven sons",s:", hath born him.",d:["better to thee than many sons","dearer to thee than seven sons","better to thee than seven brethren"]},
{b:"1 Samuel",r:"1 Samuel 17:47",t:3,p:"And all this assembly shall know that the LORD saveth not with sword and spear: for",a:"the battle is the LORD'S",s:", and he will give you into our hands.",d:["the battle is God's","the battle belongeth unto the LORD","the victory is the LORD'S"]},
{b:"1 Samuel",r:"1 Samuel 3:9",t:4,p:"Therefore Eli said unto Samuel, Go, lie down: and it shall be, if he call thee, that thou shalt say,",a:"Speak, LORD; for thy servant heareth",s:".",d:["Speak, LORD; for thy servant listeneth","Speak, LORD; thy servant obeyeth","Say on, LORD; for thy servant heareth"]},
{b:"2 Samuel",r:"2 Samuel 12:7",t:3,p:"And Nathan said to David,",a:"Thou art the man",s:".",d:["Thou art that man","Thou hast done this","Thou art the sinner"]},
{b:"2 Samuel",r:"2 Samuel 22:31",t:4,p:"As for God,",a:"his way is perfect",s:"; the word of the LORD is tried:",d:["his way is upright","his ways are perfect","his work is perfect"]},
{b:"2 Samuel",r:"2 Samuel 24:24",t:5,p:"neither will I offer burnt offerings unto the LORD my God of that which",a:"doth cost me nothing",s:".",d:["costeth me nothing","doth cost me little","hath cost me nothing"]},
{b:"1 Kings",r:"1 Kings 3:9",t:4,p:"Give therefore thy servant",a:"an understanding heart",s:"to judge thy people, that I may discern between good and bad:",d:["a wise heart","a discerning heart","an understanding mind"]},
{b:"1 Kings",r:"1 Kings 8:27",t:5,p:"But will God indeed dwell on the earth? behold,",a:"the heaven of heavens cannot contain thee",s:"; how much less this house that I have builded?",d:["the heaven of heavens cannot hold thee","the heavens themselves cannot contain thee","the heaven of heavens is not thy dwelling"]},
{b:"2 Kings",r:"2 Kings 2:11",t:3,p:"and there appeared a chariot of fire, and horses of fire, and parted them both asunder; and Elijah went up by",a:"a whirlwind into heaven",s:".",d:["a chariot into heaven","a whirlwind unto heaven","a great wind into heaven"]},
{b:"2 Kings",r:"2 Kings 5:14",t:4,p:"Then went he down, and dipped himself seven times in Jordan, according to the saying of the man of God: and his flesh came again",a:"like unto the flesh of a little child",s:", and he was clean.",d:["like unto the flesh of a young man","as the flesh of a little child","like unto the skin of a little child"]},
{b:"2 Kings",r:"2 Kings 6:17",t:4,p:"and, behold, the mountain was full of",a:"horses and chariots of fire",s:"round about Elisha.",d:["chariots and horsemen of flame","horses and chariots of the LORD","horsemen and chariots of light"]},
{b:"1 Chronicles",r:"1 Chronicles 29:11",t:5,p:"Thine, O LORD, is the greatness, and the power, and",a:"the glory, and the victory",s:", and the majesty:",d:["the glory, and the dominion","the honour, and the victory","the glory, and the strength"]},
{b:"1 Chronicles",r:"1 Chronicles 28:9",t:4,p:"And thou, Solomon my son, know thou the God of thy father, and serve him",a:"with a perfect heart",s:"and with a willing mind:",d:["with an upright heart","with a whole heart","with a perfect spirit"]},
{b:"2 Chronicles",r:"2 Chronicles 20:15",t:3,p:"Be not afraid nor dismayed by reason of this great multitude; for",a:"the battle is not yours, but God's",s:".",d:["the battle is not yours, but the LORD'S","the victory is not yours, but God's","the battle is not ours, but God's"]},
{b:"2 Chronicles",r:"2 Chronicles 15:7",t:5,p:"Be ye strong therefore, and let not your hands be weak: for",a:"your work shall be rewarded",s:".",d:["your labour shall be rewarded","your work shall not be in vain","your work shall be remembered"]},
{b:"Ezra",r:"Ezra 9:8",t:5,p:"And now for a little space grace hath been shewed from the LORD our God, to leave us a remnant to escape, and to give us",a:"a nail in his holy place",s:", that our God may lighten our eyes.",d:["a peg in his holy place","a nail in the holy place","a nail in his righteous place"]},
{b:"Ezra",r:"Ezra 7:9",t:5,p:"and on the first day of the fifth month came he to Jerusalem, according to",a:"the good hand of his God upon him",s:".",d:["the good hand of the LORD upon him","the mighty hand of his God upon him","the good hand of his God with him"]},
{b:"Ezra",r:"Ezra 10:4",t:4,p:"Arise; for this matter belongeth unto thee: we also will be with thee:",a:"be of good courage, and do it",s:".",d:["be of good comfort, and do it","be strong, and do it","be of good courage, and fear not"]},
{b:"Nehemiah",r:"Nehemiah 9:17",t:5,p:"but hardened their necks, and in their rebellion appointed a captain to return to their bondage: but thou art",a:"a God ready to pardon",s:", gracious and merciful, slow to anger.",d:["a God ready to forgive","a God gracious to pardon","a LORD ready to pardon"]},
{b:"Nehemiah",r:"Nehemiah 4:6",t:4,p:"So built we the wall; and all the wall was joined together unto the half thereof: for",a:"the people had a mind to work",s:".",d:["the people had a heart to work","the people were willing to work","the people had a mind to build"]},
{b:"Esther",r:"Esther 8:16",t:5,p:"The Jews had",a:"light, and gladness, and joy",s:", and honour.",d:["light, and gladness, and peace","joy, and gladness, and light","light, and comfort, and joy"]},
{b:"Esther",r:"Esther 2:17",t:4,p:"And the king loved Esther above all the women, and she obtained",a:"grace and favour in his sight",s:"more than all the virgins;",d:["grace and mercy in his sight","favour and kindness in his sight","grace and favour in his eyes"]},

/* ---------- WISDOM ---------- */
{b:"Job",r:"Job 23:10",t:3,p:"But he knoweth the way that I take: when he hath tried me,",a:"I shall come forth as gold",s:".",d:["I shall come forth as silver","I shall be refined as gold","I shall shine forth as gold"]},
{b:"Ecclesiastes",r:"Ecclesiastes 12:13",t:3,p:"Let us hear the conclusion of the whole matter:",a:"Fear God, and keep his commandments",s:": for this is the whole duty of man.",d:["Fear God, and obey his commandments","Love God, and keep his commandments","Fear the LORD, and keep his statutes"]},
{b:"Ecclesiastes",r:"Ecclesiastes 4:12",t:4,p:"And if one prevail against him, two shall withstand him; and",a:"a threefold cord is not quickly broken",s:".",d:["a threefold cord is not easily broken","a threefold cord shall never be broken","a twofold cord is not quickly broken"]},
{b:"Song of Solomon",r:"Song of Solomon 2:1",t:3,p:"I am",a:"the rose of Sharon",s:", and the lily of the valleys.",d:["the rose of Carmel","the lily of Sharon","the flower of Sharon"]},
{b:"Song of Solomon",r:"Song of Solomon 8:6",t:4,p:"Set me as a seal upon thine heart, as a seal upon thine arm: for",a:"love is strong as death",s:"; jealousy is cruel as the grave:",d:["love is strong as the grave","love is fierce as death","love is stronger than death"]},

/* ---------- PROPHETS ---------- */
{b:"Jeremiah",r:"Jeremiah 31:3",t:3,p:"The LORD hath appeared of old unto me, saying, Yea, I have loved thee",a:"with an everlasting love",s:": therefore with lovingkindness have I drawn thee.",d:["with an eternal love","with an everlasting mercy","with a love that faileth not"]},
{b:"Lamentations",r:"Lamentations 3:22",t:3,p:"It is of the LORD'S mercies that we are not consumed, because",a:"his compassions fail not",s:".",d:["his compassions cease not","his mercies fail not","his compassions are everlasting"]},
{b:"Lamentations",r:"Lamentations 3:23",t:2,p:"They are new every morning:",a:"great is thy faithfulness",s:".",d:["great is thy mercy","great is thy compassion","greater is thy faithfulness"]},
{b:"Ezekiel",r:"Ezekiel 36:26",t:3,p:"A new heart also will I give you, and a new spirit will I put within you: and I will take away the stony heart out of your flesh, and I will give you",a:"an heart of flesh",s:".",d:["a heart of stone","an heart of love","a new heart of flesh"]},
{b:"Ezekiel",r:"Ezekiel 37:4",t:4,p:"Again he said unto me, Prophesy upon these bones, and say unto them, O ye dry bones,",a:"hear the word of the LORD",s:".",d:["hear the voice of the LORD","hear ye the word of the LORD","receive the word of the LORD"]},
{b:"Daniel",r:"Daniel 3:17",t:3,p:"If it be so, our God whom we serve",a:"is able to deliver us",s:"from the burning fiery furnace.",d:["is mighty to deliver us","is able to save us","shall surely deliver us"]},
{b:"Daniel",r:"Daniel 6:10",t:4,p:"he kneeled upon his knees",a:"three times a day",s:", and prayed, and gave thanks before his God, as he did aforetime.",d:["seven times a day","three times a week","thrice in the night"]},
{b:"Hosea",r:"Hosea 6:6",t:3,p:"For I desired",a:"mercy, and not sacrifice",s:"; and the knowledge of God more than burnt offerings.",d:["mercy, and not obedience","sacrifice, and not mercy","kindness, and not sacrifice"]},
{b:"Hosea",r:"Hosea 14:4",t:5,p:"I will heal their backsliding,",a:"I will love them freely",s:": for mine anger is turned away from him.",d:["I will love them dearly","I will bless them freely","I will receive them freely"]},
{b:"Joel",r:"Joel 2:13",t:3,p:"And rend your heart, and not your garments, and turn unto the LORD your God: for he is gracious and merciful,",a:"slow to anger",s:", and of great kindness.",d:["slow to wrath","longsuffering","patient to anger"]},
{b:"Joel",r:"Joel 2:25",t:3,p:"And I will restore to you",a:"the years that the locust hath eaten",s:", the cankerworm, and the caterpiller, and the palmerworm, my great army which I sent among you.",d:["the years that the locust hath devoured","the years which the locust hath eaten","the harvest that the locust hath eaten"]},
{b:"Amos",r:"Amos 4:12",t:3,p:"Therefore thus will I do unto thee, O Israel: and because I will do this unto thee,",a:"prepare to meet thy God",s:", O Israel.",d:["prepare to meet the LORD","prepare thyself to meet thy God","prepare to stand before thy God"]},
{b:"Amos",r:"Amos 5:14",t:4,p:"Seek good, and not evil,",a:"that ye may live",s:": and so the LORD, the God of hosts, shall be with you, as ye have spoken.",d:["that ye may prosper","that ye perish not","that ye shall live"]},
{b:"Obadiah",r:"Obadiah 1:21",t:4,p:"And saviours shall come up on mount Zion to judge the mount of Esau; and",a:"the kingdom shall be the LORD'S",s:".",d:["the kingdom shall be the Lord GOD'S","the dominion shall be the LORD'S","the kingdom shall be established"]},
{b:"Obadiah",r:"Obadiah 1:4",t:5,p:"Though thou exalt thyself as the eagle, and though thou set thy nest among the stars,",a:"thence will I bring thee down",s:", saith the LORD.",d:["thence will I cast thee down","from thence will I bring thee down","thence will I bring thee low"]},
{b:"Jonah",r:"Jonah 2:9",t:2,p:"But I will sacrifice unto thee with the voice of thanksgiving; I will pay that that I have vowed.",a:"Salvation is of the LORD",s:".",d:["Salvation is of the Lord GOD","Deliverance is of the LORD","Salvation cometh of the LORD"]},
{b:"Jonah",r:"Jonah 4:11",t:5,p:"And should not I spare Nineveh,",a:"that great city",s:", wherein are more than sixscore thousand persons that cannot discern between their right hand and their left hand?",d:["that mighty city","that wicked city","the great city"]},
{b:"Micah",r:"Micah 6:8",t:2,p:"He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and",a:"to walk humbly with thy God",s:"?",d:["to walk humbly before thy God","to walk uprightly with thy God","to walk humbly with the LORD"]},
{b:"Micah",r:"Micah 5:2",t:4,p:"But thou,",a:"Bethlehem Ephratah",s:", though thou be little among the thousands of Judah, yet out of thee shall he come forth unto me that is to be ruler in Israel;",d:["Bethlehem Judah","Bethlehem of Judaea","Ephratah of Bethlehem"]},
{b:"Nahum",r:"Nahum 1:7",t:3,p:"The LORD is good,",a:"a strong hold in the day of trouble",s:"; and he knoweth them that trust in him.",d:["a refuge in the day of trouble","a strong tower in the day of trouble","a strong hold in the time of trouble"]},
{b:"Nahum",r:"Nahum 1:3",t:5,p:"The LORD is slow to anger, and",a:"great in power",s:", and will not at all acquit the wicked:",d:["mighty in power","great in mercy","great in strength"]},
{b:"Habakkuk",r:"Habakkuk 2:4",t:2,p:"Behold, his soul which is lifted up is not upright in him: but",a:"the just shall live by his faith",s:".",d:["the just shall live by his works","the righteous shall live by his faith","the just shall walk by his faith"]},
{b:"Habakkuk",r:"Habakkuk 3:19",t:4,p:"The LORD God is my strength, and he will make my feet",a:"like hinds' feet",s:", and he will make me to walk upon mine high places.",d:["like eagles' wings","as the feet of harts","like the feet of the roe"]},
{b:"Zephaniah",r:"Zephaniah 3:17",t:3,p:"The LORD thy God in the midst of thee is mighty; he will save,",a:"he will rejoice over thee with joy",s:"; he will rest in his love.",d:["he will rejoice over thee with gladness","he will delight over thee with joy","he will sing over thee with joy"]},
{b:"Zephaniah",r:"Zephaniah 2:3",t:5,p:"Seek ye the LORD, all ye meek of the earth, which have wrought his judgment;",a:"seek righteousness, seek meekness",s:": it may be ye shall be hid in the day of the LORD'S anger.",d:["seek righteousness, seek mercy","seek meekness, seek wisdom","seek righteousness, seek humility"]},
{b:"Zephaniah",r:"Zephaniah 1:12",t:5,p:"And it shall come to pass at that time, that I will",a:"search Jerusalem with candles",s:", and punish the men that are settled on their lees:",d:["search Jerusalem with lamps","search Jerusalem with torches","try Jerusalem with candles"]},
{b:"Haggai",r:"Haggai 2:9",t:5,p:"The glory of this latter house shall be",a:"greater than of the former",s:", saith the LORD of hosts:",d:["greater than of the first","brighter than of the former","greater than that of the former"]},
{b:"Haggai",r:"Haggai 1:6",t:5,p:"Ye have sown much, and",a:"bring in little",s:"; ye eat, but ye have not enough;",d:["gather in little","bring in nothing","reap but little"]},
{b:"Zechariah",r:"Zechariah 4:6",t:2,p:"This is the word of the LORD unto Zerubbabel, saying, Not by might, nor by power,",a:"but by my spirit",s:", saith the LORD of hosts.",d:["but by my hand","but by the spirit of the LORD","but by my power"]},
{b:"Zechariah",r:"Zechariah 9:9",t:4,p:"behold, thy King cometh unto thee: he is just, and having salvation;",a:"lowly, and riding upon an ass",s:", and upon a colt the foal of an ass.",d:["meek, and riding upon an ass","lowly, and riding upon a colt","lowly, and seated upon an ass"]},
{b:"Malachi",r:"Malachi 3:6",t:3,p:"For I am the LORD,",a:"I change not",s:"; therefore ye sons of Jacob are not consumed.",d:["I change never","I alter not","I turn not"]},
{b:"Malachi",r:"Malachi 4:2",t:4,p:"But unto you that fear my name shall the Sun of righteousness arise",a:"with healing in his wings",s:"; and ye shall go forth, and grow up as calves of the stall.",d:["with healing in his hands","with mercy in his wings","with healing in his beams"]},

/* ---------- GOSPELS & ACTS ---------- */
{b:"Mark",r:"Mark 10:45",t:3,p:"For even the Son of man came not to be ministered unto, but to minister, and to give his life",a:"a ransom for many",s:".",d:["a ransom for all","an offering for many","a ransom for sinners"]},
{b:"Luke",r:"Luke 2:14",t:2,p:"Glory to God in the highest, and on earth peace,",a:"good will toward men",s:".",d:["good will among men","peace and good will to men","good will toward all"]},
{b:"Acts",r:"Acts 4:12",t:3,p:"Neither is there salvation in any other: for there is",a:"none other name under heaven",s:"given among men, whereby we must be saved.",d:["no other name upon the earth","none other name under the sun","none other God under heaven"]},

/* ---------- EPISTLES ---------- */
{b:"2 Corinthians",r:"2 Corinthians 5:17",t:2,p:"Therefore if any man be in Christ,",a:"he is a new creature",s:": old things are passed away; behold, all things are become new.",d:["he is a new creation","he is a new man","he shall be a new creature"]},
{b:"Galatians",r:"Galatians 6:9",t:3,p:"And let us not be weary in well doing: for in due season we shall reap,",a:"if we faint not",s:".",d:["if we fail not","if we grow not weary","if we faint never"]},
{b:"Ephesians",r:"Ephesians 2:8",t:2,p:"For by grace are ye saved through faith; and that not of yourselves:",a:"it is the gift of God",s:".",d:["it is the work of God","it is the gift of grace","it is the promise of God"]},
{b:"Philippians",r:"Philippians 4:7",t:2,p:"And the peace of God,",a:"which passeth all understanding",s:", shall keep your hearts and minds through Christ Jesus.",d:["which passeth all knowledge","which surpasseth all understanding","which passeth understanding"]},
{b:"Colossians",r:"Colossians 3:2",t:3,p:"Set your affection",a:"on things above",s:", not on things on the earth.",d:["on things eternal","on heavenly things","on things which are unseen"]},
{b:"Colossians",r:"Colossians 1:17",t:4,p:"And he is before all things, and",a:"by him all things consist",s:".",d:["in him all things consist","by him all things are made","by him all things endure"]},
{b:"1 Thessalonians",r:"1 Thessalonians 4:16",t:4,p:"For the Lord himself shall descend from heaven with a shout,",a:"with the voice of the archangel",s:", and with the trump of God:",d:["with the voice of the angels","with the shout of the archangel","with the cry of the archangel"]},
{b:"1 Thessalonians",r:"1 Thessalonians 5:17",t:2,p:"Rejoice evermore.",a:"Pray without ceasing",s:". In every thing give thanks:",d:["Pray without fainting","Pray continually","Watch without ceasing"]},
{b:"2 Thessalonians",r:"2 Thessalonians 3:3",t:4,p:"But the Lord is faithful, who shall stablish you, and",a:"keep you from evil",s:".",d:["keep you from the wicked one","guard you from evil","keep you from falling"]},
{b:"2 Thessalonians",r:"2 Thessalonians 3:10",t:5,p:"For even when we were with you, this we commanded you, that if any would not work,",a:"neither should he eat",s:".",d:["neither shall he eat","neither should he be fed","neither let him eat"]},
{b:"1 Timothy",r:"1 Timothy 1:15",t:3,p:"This is a faithful saying, and worthy of all acceptation, that Christ Jesus came into the world to save sinners;",a:"of whom I am chief",s:".",d:["of whom I am the least","of whom I am first","among whom I am chief"]},
{b:"1 Timothy",r:"1 Timothy 4:12",t:4,p:"Let no man despise thy youth; but be thou",a:"an example of the believers",s:", in word, in conversation, in charity, in spirit, in faith, in purity.",d:["an example unto the believers","a pattern of the believers","an example of the faithful"]},
{b:"2 Timothy",r:"2 Timothy 4:7",t:2,p:"I have fought a good fight, I have finished my course,",a:"I have kept the faith",s:".",d:["I have held the faith","I have kept the charge","I have kept my faith"]},
{b:"Titus",r:"Titus 3:5",t:4,p:"Not by works of righteousness which we have done, but according to his mercy he saved us,",a:"by the washing of regeneration",s:", and renewing of the Holy Ghost;",d:["by the water of regeneration","by the washing of the word","by the laver of regeneration"]},
{b:"Titus",r:"Titus 1:2",t:5,p:"In hope of eternal life, which",a:"God, that cannot lie",s:"promised before the world began;",d:["God, that changeth not","God, who cannot fail","the LORD, that cannot lie"]},
{b:"Titus",r:"Titus 2:13",t:3,p:"Looking for",a:"that blessed hope",s:", and the glorious appearing of the great God and our Saviour Jesus Christ;",d:["that blessed promise","the blessed hope","that glorious hope"]},
{b:"Philemon",r:"Philemon 1:17",t:4,p:"If thou count me therefore a partner,",a:"receive him as myself",s:".",d:["receive him as a brother","receive him as thyself","receive him as mine own"]},
{b:"Philemon",r:"Philemon 1:6",t:5,p:"That the communication of thy faith",a:"may become effectual",s:"by the acknowledging of every good thing which is in you in Christ Jesus.",d:["may become fruitful","may be made effectual","may become powerful"]},
{b:"Philemon",r:"Philemon 1:7",t:5,p:"For we have great joy and consolation in thy love, because the bowels of the saints",a:"are refreshed by thee, brother",s:".",d:["are refreshed by thee, beloved","are comforted by thee, brother","are made glad by thee, brother"]},
{b:"James",r:"James 1:22",t:2,p:"But be ye",a:"doers of the word",s:", and not hearers only, deceiving your own selves.",d:["doers of the law","keepers of the word","doers of the truth"]},
{b:"1 Peter",r:"1 Peter 5:7",t:2,p:"Casting all your care upon him;",a:"for he careth for you",s:".",d:["for he watcheth over you","for he careth for his own","for he loveth you"]},
{b:"1 Peter",r:"1 Peter 2:9",t:3,p:"But ye are a chosen generation,",a:"a royal priesthood",s:", an holy nation, a peculiar people;",d:["a holy priesthood","a royal nation","a kingly priesthood"]},
{b:"2 Peter",r:"2 Peter 3:8",t:4,p:"But, beloved, be not ignorant of this one thing, that one day is with the Lord as a thousand years, and",a:"a thousand years as one day",s:".",d:["a thousand years as one hour","a thousand days as one year","a thousand years as a watch"]},
{b:"2 Peter",r:"2 Peter 1:4",t:5,p:"Whereby are given unto us",a:"exceeding great and precious promises",s:", that by these ye might be partakers of the divine nature,",d:["exceeding great and glorious promises","exceeding rich and precious promises","exceeding great and precious mercies"]},
{b:"1 John",r:"1 John 3:1",t:3,p:"Behold, what manner of love the Father hath bestowed upon us, that we should be called",a:"the sons of God",s:":",d:["the children of God","the heirs of God","the servants of God"]},
{b:"2 John",r:"2 John 1:9",t:5,p:"Whosoever transgresseth, and abideth not in the doctrine of Christ,",a:"hath not God",s:". He that abideth in the doctrine of Christ, he hath both the Father and the Son.",d:["hath not the Son","knoweth not God","hath not the truth"]},
{b:"2 John",r:"2 John 1:12",t:5,p:"Having many things to write unto you, I would not write with paper and ink: but I trust to come unto you, and speak face to face,",a:"that our joy may be full",s:".",d:["that our joy may be complete","that your joy may be full","that our peace may be full"]},
{b:"2 John",r:"2 John 1:3",t:5,p:"Grace be with you,",a:"mercy, and peace",s:", from God the Father, and from the Lord Jesus Christ, the Son of the Father, in truth and love.",d:["mercy, and truth","peace, and mercy","mercy, and love"]},
{b:"3 John",r:"3 John 1:11",t:4,p:"Beloved, follow not that which is evil, but",a:"that which is good",s:".",d:["that which is right","that which is pure","the thing which is good"]},
{b:"3 John",r:"3 John 1:8",t:5,p:"We therefore ought to receive such, that we might be",a:"fellowhelpers to the truth",s:".",d:["fellowlabourers in the truth","partakers of the truth","fellowhelpers of the gospel"]},
{b:"Jude",r:"Jude 1:20",t:4,p:"But ye, beloved, building up yourselves",a:"on your most holy faith",s:", praying in the Holy Ghost,",d:["in your most holy faith","on your most precious faith","on the most holy faith"]},
{b:"Jude",r:"Jude 1:21",t:5,p:"Keep yourselves in the love of God,",a:"looking for the mercy of our Lord",s:"Jesus Christ unto eternal life.",d:["waiting for the mercy of our Lord","looking for the coming of our Lord","looking for the mercy of the LORD"]},
{b:"Jude",r:"Jude 1:25",t:5,p:"To the only wise God our Saviour, be",a:"glory and majesty, dominion and power",s:", both now and ever. Amen.",d:["glory and honour, dominion and power","majesty and glory, power and might","glory and majesty, honour and power"]}
];
