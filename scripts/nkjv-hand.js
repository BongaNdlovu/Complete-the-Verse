/* ==================================================================
   NKJV HAND — the blanks the aligner cannot cut on its own.

   scripts/nkjv-align.js maps a KJV blank onto NKJV wording by diffing the
   two verses, which handles the great majority of the bank. It misses in
   two situations:

     1. The NKJV replaces the blank's words outright ("latter day" ->
        "at last on the earth"). There is no shared token to anchor the
        span, so the aligner stops short.
     2. The thought is redistributed across the sentence ("the whole duty
        of man" -> "man's all"), so the corresponding NKJV phrase is
        longer than the KJV one and the window cap cuts it.

   Both are cases where the answer has to be read off the NKJV text by
   hand. Every entry below is taken from content/nkjv/source/, never
   reconstructed: `a` is a verbatim run of the NKJV verse, `p` and `s` are
   the text either side of it. scripts/qa-nkjv.js gates them like any
   other bank entry.

   scripts/build-nkjv.js treats a key here as final — it is not
   re-aligned — and fails the build if an entry stops passing QA.
   ================================================================== */

const VERSES = {
  "Job 19:25": {
    p: "For I know that my Redeemer lives, And He shall stand at",
    a: "last on the earth",
    s: ";"
  },
  "Job 42:2": {
    p: "I know that You can do everything, And that",
    a: "no purpose of Yours can be withheld",
    s: "from You."
  },
  "Ezekiel 36:26": {
    p: "I will give you a new heart and put a new spirit within you; I will take the heart of stone out of your flesh and give you a",
    a: "heart of flesh",
    s: "."
  },
  "2 Chronicles 16:9": {
    p: "For the eyes of the Lord run to and fro throughout the whole earth, to show Himself strong on behalf of those whose heart is",
    a: "loyal to Him",
    s: "."
  },
  "1 Chronicles 4:10": {
    p: "And Jabez called on the God of Israel saying, \u201cOh, that You would bless me indeed, and enlarge my",
    a: "territory",
    s: ", that Your hand would be with me, and that You would keep me from evil, that I may not cause pain!\u201d So God granted him what he requested."
  },
  "James 1:17": {
    p: "Every good gift and every perfect gift is from above, and comes down from the Father of lights, with whom there is no",
    a: "variation or shadow of turning",
    s: "."
  },
  "2 Samuel 24:24": {
    p: "Then the king said to Araunah, \u201cNo, but I will surely buy it from you for a price; nor will I offer burnt offerings to the Lord my God with that which",
    a: "costs me nothing",
    s: ".\u201d So David bought the threshing floor and the oxen for fifty shekels of silver."
  },
  "Esther 9:22": {
    p: "as the days on which the Jews had rest from their enemies, as the month which was turned from sorrow to joy for them, and from",
    a: "mourning to a holiday",
    s: "; that they should make them days of feasting and joy, of sending presents to one another and gifts to the poor."
  },
  "Judges 7:18": {
    p: "When I blow the trumpet, I and all who are with me, then you also blow the trumpets on every side of the whole camp, and say,",
    a: "\u2018The sword of the Lord and of Gideon!\u2019\u201d",
    s: ""
  },
  "Proverbs 20:1": {
    p: "Wine is a mocker, Strong drink is a brawler, And whoever is",
    a: "led astray by it is not wise",
    s: "."
  },
  "Genesis 12:3": {
    p: "I will bless those who bless you, And I will curse him who curses you; And in you",
    a: "all the families of the earth shall be blessed",
    s: ".\u201d"
  },
  "Judges 6:24": {
    p: "So Gideon built an altar there to the Lord, and called it The-Lord-Is-Peace. To this day it is still in Ophrah of the Abiezrites.",
    a: "The-Lord-Is-Peace",
    s: ". To this day it is still in Ophrah of the Abiezrites."
  },
  "1 Kings 19:11": {
    p: "Then He said, \u201cGo out, and stand on the mountain before the Lord.\u201d And behold, the Lord passed by, and",
    a: "a great and strong wind",
    s: "tore into the mountains and broke the rocks in pieces before the Lord."
  },
  "2 Corinthians 4:16": {
    p: "Therefore we do not lose heart. Even though our outward man is perishing, yet",
    a: "the inward man is being renewed",
    s: "day by day."
  },
  "Ezra 3:11": {
    p: "And they sang responsively, praising and giving thanks to the Lord: \u201cFor He is good, For His mercy",
    a: "endures forever toward Israel",
    s: ".\u201d Then all the people shouted with a great shout, when they praised the Lord, because the foundation of the house of the Lord was laid."
  },
  "Revelation 4:11": {
    p: "\u201cYou are worthy, O Lord, To receive glory and honor and power; For You",
    a: "created all things",
    s: ", And by Your will they exist and were created.\u201d"
  },
  "Exodus 6:7": {
    p: "I will take you as My people, and",
    a: "I will be your God",
    s: ". Then you shall know that I am the Lord your God who brings you out from under the burdens of the Egyptians."
  },
  "Matthew 7:13": {
    p: "\u201cEnter by the narrow gate; for wide is the gate and broad is the way that leads to destruction, and",
    a: "there are many who go in by it",
    s: "."
  },
  "John 13:34": {
    p: "A new commandment I give to you, that you love one another; as I have loved you,",
    a: "that you also love one another",
    s: "."
  },
  "1 John 2:6": {
    p: "He who says he abides in Him ought himself also to",
    a: "walk just as He walked",
    s: "."
  },
  "Deuteronomy 7:9": {
    p: "\u201cTherefore know that the Lord your God, He is God, the faithful God who keeps covenant and mercy for",
    a: "a thousand generations",
    s: "with those who love Him and keep His commandments,"
  },
  "Proverbs 29:18": {
    p: "Where there is no revelation, the people cast off restraint; But",
    a: "happy is he who keeps the law",
    s: "."
  },
  "James 2:17": {
    p: "Thus also faith",
    a: "by itself",
    s: ", if it does not have works, is dead."
  },
  "1 Thessalonians 5:17": {
    p: "Rejoice always,",
    a: "pray without ceasing",
    s: ",",
    qaOk: ["no-context"]
  },
  /* The bank asks for 1 Thessalonians 5:17 twice — once for "Pray without
     ceasing" and once for "without ceasing" alone. Both map onto the single
     NKJV verse, which reads "pray without ceasing," so one of the two has to
     settle for the shorter blank. Only one cut per reference is listed here;
     the other falls to the aligner, which lands on the full phrase. */
  "Ezekiel 36:26": {
    p: "I will take the heart of stone out of your flesh and give you a",
    a: "heart of flesh",
    s: "."
  }
};

/* A few tablet blanks are cut out of verses the NKJV recasts completely, so
   there is no anchor chain to follow and the aligner collapses. Each of
   these is a one-word blank whose KJV word the NKJV replaced with a
   different construction entirely ("comprehended it not" -> "did not
   comprehend it"), which is the hardest case for a diff and the easiest to
   settle by reading. Keyed "reference|KJV answer" because two tablets can
   blank the same verse differently. Excerpts are verbatim runs of the
   licensed text. */
const TABLET = {
  "Proverbs 25:2|the honour of kings": {
    prefix: "It is the glory of God to conceal a matter, But the glory of kings is to",
    a: "search out a matter",
    suffix: "."
  },
  "John 1:5|not": {
    prefix: "And the light shines in the darkness, and the darkness did",
    a: "not comprehend it",
    suffix: "."
  },
  "John 1:10|not": {
    prefix: "He was in the world, and the world was made through Him, and the world did",
    a: "not know Him",
    suffix: "."
  },
  "Genesis 6:22|did": {
    prefix: "Thus",
    a: "Noah did",
    suffix: "; according to all that God commanded him, so he did."
  },
  "Judges 16:17|razor": {
    prefix: "\u201cNo",
    a: "razor has ever come",
    suffix: "upon my head, for I have been a Nazirite to God from my mother\u2019s womb."
  },
  "Acts 16:33|straightway": {
    prefix: "And",
    a: "immediately he and all his family were baptized",
    suffix: "."
  },
  "2 Kings 5:2|maid": {
    prefix: "And the Syrians had gone out on raids, and had brought back captive a young",
    a: "girl",
    suffix: "from the land of Israel."
  },
  "Psalm 27:10|up": {
    prefix: "When my father and my mother forsake me, Then the Lord will take",
    a: "care of me",
    suffix: "."
  },
  "Ezekiel 36:26|heart": {
    prefix: "I will give you a new",
    a: "heart",
    suffix: "and put a new spirit within you;"
  },
  "Zechariah 9:11|water": {
    prefix: "Because of the blood of your covenant, I will set your prisoners free from the",
    a: "waterless pit",
    suffix: "."
  }
};
/* Bank blanks the aligner cuts badly and no other source covers. Keyed
   "reference|KJV answer" for the same reason as TABLET: the bank puts two
   blanks on some verses, and a cut belongs to one of them. Every excerpt is
   a verbatim run of the licensed text.

   Verses the bank asks twice are listed twice — once under each KJV answer —
   so the two questions keep two different NKJV answers. */
const BANK = {
  "Zechariah 9:9|ass": {
    p: "Behold, your King is coming to you; He is just and having salvation, Lowly and riding on a",
    a: "donkey",
    s: ", A colt, the foal of a donkey.",
    d: ["mule", "young donkey", "horse"]
  },
  "Zechariah 9:9|lowly, and riding upon an ass": {
    p: "Behold, your King is coming to you; He is just and having salvation,",
    a: "Lowly and riding on a donkey",
    s: ", A colt, the foal of a donkey.",
    d: ["Lowly and riding on a colt", "Meek and riding on a donkey", "Lowly and seated on a throne"]
  },
  "Psalm 66:1|all ye lands": {
    p: "Make a joyful shout to God,",
    a: "all the earth",
    s: "!",
    d: ["all ye nations", "all the people", "every land"]
  },
  "James 1:17|variableness": {
    p: "Every good gift and every perfect gift is from above, and comes down from the Father of lights, with whom there is no",
    a: "variation or shadow of turning",
    s: ".",
    d: ["change or shadow of turning", "variation or shade of night", "shadow of death or turning"]
  },
  "Esther 9:22|from mourning into a good day": {
    p: "as the month which was turned from sorrow to joy for them, and from",
    a: "mourning to a holiday",
    s: "; that they should make them days of feasting and joy,",
    d: ["weeping to a feast", "darkness to a feast day", "grief to a glad day"]
  },
  "Proverbs 29:18|happy is he": {
    p: "Where there is no revelation, the people cast off restraint; But",
    a: "happy is he who keeps the law",
    s: ".",
    d: ["blessed is he who knows God", "wise is he who fears the Lord", "safe is he who keeps the commandments"]
  },
  "James 2:17|being alone": {
    p: "Thus also faith",
    a: "by itself",
    s: ", if it does not have works, is dead.",
    d: ["without deeds", "standing alone", "without action"]
  },
  "1 John 3:1|the sons of God": {
    p: "Behold what manner of love the Father has bestowed on us, that we should be called",
    a: "children of God",
    s: "! Therefore the world does not know us, because it did not know Him.",
    d: ["sons of promise", "servants of God", "heirs of God"]
  },
  "1 Corinthians 16:14|be done with charity": {
    p: "Let all that you do",
    a: "be done with love",
    s: ".",
    d: ["be done in meekness", "be wrought in kindness", "be ordered with grace"]
  },
  /* Dual-blank verses: one cut per KJV answer so the bank keeps two
     distinct questions. */
  "Ecclesiastes 12:13|Fear God, and keep his commandments": {
    p: "Let us hear the conclusion of the whole matter:",
    a: "Fear God and keep His commandments",
    s: ", For this is man’s all.",
    d: ["Love God and obey His voice", "Serve the Lord with all your heart", "Keep the statutes of the Most High"]
  },
  "Ecclesiastes 12:13|whole duty of man": {
    p: "Fear God and keep His commandments, For",
    a: "this is man’s all",
    s: ".",
    d: ["man’s whole duty", "man’s chief end", "man’s true purpose"]
  },
  "Song of Solomon 2:1|lily of the valleys": {
    p: "I am the rose of Sharon, and the",
    a: "lily of the valleys",
    s: ".",
    d: ["flower of the field", "rose of the desert", "beauty of Carmel"]
  },
  "Song of Solomon 2:1|the rose of Sharon": {
    p: "I am",
    a: "the rose of Sharon",
    s: ", And the lily of the valleys.",
    d: ["the lily of Sharon", "the flower of the field", "the plant of renown"]
  },
  "Lamentations 3:22|compassions": {
    p: "Through the Lord’s mercies we are not consumed, Because His",
    a: "compassions",
    s: " fail not.",
    d: ["mercies", "lovingkindness", "faithfulness"]
  },
  "Lamentations 3:22|his compassions fail not": {
    p: "Through the Lord’s mercies we are not consumed, Because",
    a: "His compassions fail not",
    s: ".",
    d: ["His mercies cease not", "His anger endures not", "His wrath lasts forever"]
  },
  "Ezekiel 36:26|stony heart": {
    p: "I will give you a new heart and put a new spirit within you; I will take the",
    a: "heart of stone",
    s: " out of your flesh and give you a heart of flesh.",
    d: ["stony heart", "heart of flesh", "heart of pride"]
  },
  "Ezekiel 36:26|an heart of flesh": {
    p: "I will take the heart of stone out of your flesh and give you a",
    a: "heart of flesh",
    s: ".",
    d: ["heart of stone", "new heart of peace", "heart of humility"]
  },
  "Ezekiel 37:4|dry bones": {
    p: "Again He said to me, “Prophesy to these bones, and say to them, ‘O",
    a: "dry bones",
    s: ", hear the word of the Lord!",
    d: ["dead bones", "valley of bones", "withered bones"]
  },
  "Ezekiel 37:4|hear the word of the LORD": {
    p: "Again He said to me, “Prophesy to these bones, and say to them, ‘O dry bones,",
    a: "hear the word of the Lord",
    s: "!",
    d: ["hear the voice of the Lord", "receive the word of God", "listen to the Spirit"]
  },
  "Hosea 6:6|burnt offerings": {
    p: "For I desire mercy and not sacrifice, And the knowledge of God more than",
    a: "burnt offerings",
    s: ".",
    d: ["solemn assemblies", "sacrifices of praise", "many offerings"]
  },
  "Hosea 6:6|mercy, and not sacrifice": {
    p: "For I desire",
    a: "mercy and not sacrifice",
    s: ", And the knowledge of God more than burnt offerings.",
    d: ["sacrifice and not mercy", "obedience and not offerings", "justice and not ritual"]
  },
  "Zephaniah 3:17|singing": {
    p: "The Lord your God in your midst, The Mighty One, will save; He will rejoice over you with gladness, He will quiet you with His love, He will rejoice over you with",
    a: "singing",
    s: ".”",
    d: ["shouting", "gladness", "rejoicing"]
  },
  "Zephaniah 3:17|he will rejoice over thee with joy": {
    p: "The Lord your God in your midst, The Mighty One, will save;",
    a: "He will rejoice over you with gladness",
    s: ", He will quiet you with His love, He will rejoice over you with singing.”",
    d: ["He will sing over you with joy", "He will dance over you with praise", "He will rest in you with peace"]
  },
  "1 Thessalonians 5:17|without ceasing": {
    p: "Rejoice always, pray",
    a: "without ceasing",
    s: ",",
    d: ["without fail", "in season", "with fear"]
  },
  "1 Thessalonians 5:17|Pray without ceasing": {
    p: "Rejoice always,",
    a: "pray without ceasing",
    s: ",",
    d: ["watch without sleeping", "work without rest", "fast without end"]
  },
  "2 Thessalonians 3:3|stablish you": {
    p: "But the Lord is faithful, who will",
    a: "establish you",
    s: " and guard you from the evil one.",
    d: ["strengthen you", "uphold you", "comfort you"]
  },
  "2 Thessalonians 3:3|keep you from evil": {
    p: "But the Lord is faithful, who will establish you and",
    a: "guard you from the evil one",
    s: ".",
    d: ["deliver you from death", "keep you from falling", "preserve your soul in peace"]
  },
  "1 Peter 2:9|peculiar people": {
    p: "But you are a chosen generation, a royal priesthood, a holy nation,",
    a: "His own special people",
    s: ", that you may proclaim the praises of Him who called you out of darkness into His marvelous light;",
    d: ["a peculiar people", "the people of God", "a purchased nation"]
  },
  "1 Peter 2:9|a royal priesthood": {
    p: "But you are a chosen generation,",
    a: "a royal priesthood",
    s: ", a holy nation, His own special people,",
    d: ["a holy priesthood", "a kingly nation", "an eternal kingdom"]
  },
  "2 Chronicles 16:9|perfect": {
    p: "For the eyes of the Lord run to and fro throughout the whole earth, to show Himself strong on behalf of those whose heart is",
    a: "loyal to Him",
    s: ".",
    d: ["perfect toward Him", "upright before Him", "whole toward Him"]
  },
  "Psalm 119:105|light": {
    p: "Your word is a",
    a: "lamp to my feet",
    s: " and a light to my path.",
    d: ["shield to my soul", "guide to my steps", "lantern to my way"]
  },
  "Psalm 121:1|help": {
    p: "I will lift up my eyes to the hills—From",
    a: "whence comes my help",
    s: "?",
    d: ["where my help comes", "whom I fear", "where the temple stands"]
  },
  "Galatians 5:22|longsuffering": {
    p: "But the fruit of the Spirit is love, joy, peace,",
    a: "longsuffering, kindness, goodness",
    s: ", faithfulness, gentleness, self-control.",
    d: ["patience, temperance, meekness", "mercy, compassion, truth", "joy, peace, patience"]
  }
};

module.exports = { VERSES, TABLET, BANK };

