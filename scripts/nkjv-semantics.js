/* ==================================================================
   NKJV SEMANTICS — the curated word data behind the NKJV distractor
   generator (scripts/nkjv-distractors.js).

   Three tables, each reviewable on its own:

     MODERNISE   archaic KJV form -> its NKJV equivalent. Applied to
                 candidate wrong answers lifted from the KJV bank so a
                 distractor reads as modern English ("saith" -> "says",
                 "thou art" -> "you are") instead of giving itself away
                 as KJV wording.

     SUBSTITUTE  content word -> same-part-of-speech alternatives. The
                 generator swaps ONE word of the aligned NKJV answer at a
                 time. Every alternative has to be a thing the verse could
                 plausibly have said, or the distractor is eliminable
                 without knowing the verse.

     PHRASES     whole-phrase alternatives for the swaps a single word
                 cannot express ("living soul" is not "living" + a
                 substitute for "soul").

   Nothing here is Scripture: these are wrong answers, and they are the
   only text in the NKJV edition that the generator invents. The rules in
   scripts/verse-qa.js are what keep them honest.
   ================================================================== */

/* ---------- register: archaic -> modern ----------

   Only forms that are unambiguously archaic are listed. Words that are
   also ordinary modern English ("art", "rent", "let", "rest") are handled
   elsewhere or left alone: rewriting "the art of the craftsman" to "the
   are of the craftsman" would be worse than the archaism. */

const MODERNISE = new Map(Object.entries({
  // pronouns
  thee: "you", thou: "you", thy: "your", thine: "your", ye: "you",
  thyself: "yourself",
  // be / have / do / say
  art: "are", wert: "were", wast: "were", hast: "have", hath: "has",
  hadst: "had", dost: "do", doest: "do", didst: "did", doth: "does",
  saith: "says", sayest: "say", shalt: "shall", wilt: "will",
  shouldest: "should", wouldest: "would", couldest: "could",
  canst: "can", mayest: "may",
  // -eth third person singular
  abideth: "abides", accepteth: "accepts", addeth: "adds", answereth: "answers",
  asketh: "asks", beareth: "bears", believeth: "believes", belongeth: "belongs",
  bindeth: "binds", blesseth: "blesses", blotteth: "blots", breaketh: "breaks",
  bringeth: "brings", calleth: "calls", careth: "cares", causeth: "causes",
  changeth: "changes", cometh: "comes", comforteth: "comforts",
  concerneth: "concerns", constraineth: "constrains", consumeth: "consumes",
  declareth: "declares", delivereth: "delivers", denieth: "denies",
  dieth: "dies", directeth: "directs", divideth: "divides", drieth: "dries",
  dwelleth: "dwells", endureth: "endures", escheweth: "eschews",
  establisheth: "establishes", fadeth: "fades", faileth: "fails",
  falleth: "falls", feareth: "fears", flourisheth: "flourishes",
  forgiveth: "forgives", fulfilleth: "fulfills", giveth: "gives", goeth: "goes",
  guideth: "guides", healeth: "heals", heareth: "hears", hideth: "hides",
  increaseth: "increases", inheriteth: "inherits", judgeth: "judges",
  justifieth: "justifies", keepeth: "keeps", knoweth: "knows",
  layeth: "lays", leadeth: "leads", listeneth: "listens", liveth: "lives",
  loveth: "loves", maketh: "makes", melteth: "melts", moveth: "moves",
  obeyeth: "obeys", offereth: "offers", ordereth: "orders",
  pardoneth: "pardons", passeth: "passes", possesseth: "possesses",
  proclaimeth: "proclaims", profiteth: "profits", prospereth: "prospers",
  provideth: "provides", publisheth: "publishes", quickeneth: "quickens",
  reacheth: "reaches", receiveth: "receives", redeemeth: "redeems",
  regardeth: "regards", reigneth: "reigns", remaineth: "remains",
  remembereth: "remembers", repenteth: "repents", restoreth: "restores",
  returneth: "returns", riseth: "rises", ruleth: "rules", seeketh: "seeks",
  seeth: "sees", sendeth: "sends", setteth: "sets", shineth: "shines",
  sitteth: "sits", sleepeth: "sleeps", spareth: "spares",
  speaketh: "speaks", standeth: "stands", stayeth: "stays",
  sticketh: "sticks", stirreth: "stirs", strengtheneth: "strengthens",
  striveth: "strives", taketh: "takes", teacheth: "teaches",
  thirsteth: "thirsts", trusteth: "trusts", understandeth: "understands",
  upholdeth: "upholds", waiteth: "waits", walketh: "walks",
  watcheth: "watches", withholdeth: "withholds", winneth: "wins",
  // -est second person singular
  abidest: "abide", askest: "ask", camest: "came", dwellest: "dwell",
  givest: "give", goest: "go", hidest: "hide", labourest: "labor",
  liest: "lie", lovest: "love", makest: "make", namest: "name",
  rulest: "rule", shewest: "show", sittest: "sit", turnest: "turn",
  upholdest: "uphold", walkest: "walk", knowest: "know", seest: "see",
  thinkest: "think", hearest: "hear", believest: "believe",
  spakest: "spoke", heardest: "heard", gavest: "gave",
  // prepositions, adverbs, connectives
  unto: "to", whither: "where", wherefore: "why", thence: "there",
  whence: "where", peradventure: "perhaps",
  verily: "truly", howbeit: "however", yea: "yes", nay: "no",
  whosoever: "whoever", whatsoever: "whatever", nought: "nothing",
  // the "there-" and "where-" compounds. Each expands into two words,
  // which the shape rule tolerates for anything but a one-word blank.
  thereof: "of it", therein: "in it", thereon: "on it", thereto: "to it",
  therewith: "with it", therefrom: "from it", thereupon: "on it",
  hereof: "of this", herein: "in this",
  whereof: "of which", wherein: "in which", whereon: "on which",
  whereto: "to which", wherewith: "with which", whereupon: "on which",
  whereunto: "to which", whereby: "by which",
  hither: "here", thither: "there", hitherto: "until now",
  // Latin/anglicised spellings the NKJV respells
  saviour: "savior", honour: "honor", favour: "favor", labour: "labor",
  valour: "valor", colour: "color", neighbour: "neighbor", armour: "armor",
  behaviour: "behavior", splendour: "splendor", rumour: "rumor",
  odour: "odor", vigour: "vigor", clamour: "clamor", vapour: "vapor",
  endeavour: "endeavor", fervour: "fervor",
  shew: "show", shewed: "showed", shewbread: "showbread",
  intreat: "entreat", intreated: "entreated", ensample: "example",
  stablish: "establish", stablished: "established", sodden: "boiled",
  brasen: "bronze", morter: "mortar", murther: "murder", spake: "spoke",
  sware: "swore", tarry: "wait", froward: "perverse",
  // archaic senses and spellings that survive in the bank's wording
  lasteth: "lasts", confounded: "confused", marvellous: "marvelous",
  handywork: "handiwork", stedfast: "steadfast", wrought: "worked",
  wist: "knew", fain: "gladly", twain: "two", victuals: "food",
  raiment: "clothing", succour: "help", comely: "beautiful",
  durst: "dared", kine: "cows", sepulchre: "tomb", waxed: "grew",
  beseech: "implore", charity: "love", conversation: "conduct",
  ghost: "spirit", heaviness: "sorrow", longsuffering: "patience",
  lucre: "gain", mete: "measure", morrow: "next day", rail: "revile",
  ravening: "greedy", reverence: "respect", alway: "always",
  betwixt: "between", divers: "various", plenteous: "abundant",
  savour: "flavor", stedfastly: "steadfastly", twoedged: "two-edged",
  wiles: "schemes", whit: "bit", unction: "anointing"
}));

/* ---------- verb bases for the negation rewrite ----------

   "believeth not" modernises to "believes not", which is grammatical but
   reads like the KJV it came from. NKJV says "does not believe". Only the
   verbs that actually turn up in a "V not" frame need an entry; anything
   missing simply keeps its plain -s form. */
const VERB_BASE = new Map(Object.entries({
  abides: "abide", asks: "ask", bears: "bear", believes: "believe",
  belongs: "belong", blesses: "bless", breaks: "break", brings: "bring",
  calls: "call", cares: "care", comes: "come", costs: "cost",
  delivers: "deliver", dies: "die", dwells: "dwell", endures: "endure",
  establishes: "establish", fails: "fail", falls: "fall", fears: "fear",
  forgives: "forgive", gives: "give", hears: "hear", keeps: "keep",
  knows: "know", lives: "live", loves: "love", makes: "make",
  moves: "move", passes: "pass", receives: "receive", remains: "remain",
  remembers: "remember", repents: "repent", returns: "return",
  rises: "rise", rules: "rule", sees: "see", seeks: "seek",
  sends: "send", sits: "sit", speaks: "speak", stands: "stand",
  takes: "take", teaches: "teach", trusts: "trust", walks: "walk",
  watches: "watch", has: "have", does: "do"
}));

/* ---------- connectives ----------

   Connectives and articles carry no doctrine, so a wrong answer that
   differs from the answer by one of these alone is a grammar quiz. This
   mirrors the private TRIVIAL_SWAP set in scripts/verse-qa.js: the gate
   uses it for its function-swap rule, but only reaches answers of four
   words or more. The generator applies the same line to every answer. */
const TRIVIAL = new Set([
  "and", "or", "but", "nor", "the", "a", "an", "is", "was", "are", "were", "be"
]);

/* ---------- one-word substitutions ----------

   Keyed by the exact surface form in the answer. Alternatives are the
   words a reader who half-remembers the verse might reach for: the same
   part of speech, the same theological weight, and never a synonym so
   loose that the sentence stops making sense.

   Two rules of thumb when extending this table. The alternative has to
   sit in the same grammatical slot as the word it replaces — a noun that
   reads correctly after whatever article the answer already carries, a
   verb in the same tense — because nothing downstream re-checks grammar.
   And it has to be a word the verse could plausibly have used: "the Lord
   is my shepherd" against "the Lord is my master" is a question about
   Scripture, "the Lord is my guardian" is a question about vocabulary. */
const SUBSTITUTE = new Map(Object.entries({
  // titles and names of God
  lord: ["master", "king", "shepherd"],
  christ: ["Jesus", "Messiah", "Savior"],
  jesus: ["Christ", "Messiah", "Savior"],
  father: ["maker", "master", "shepherd"],
  spirit: ["power", "presence", "word"],
  savior: ["redeemer", "shepherd", "king"],
  almighty: ["everlasting", "sovereign", "eternal", "most high"],
  host: ["armies", "angels", "heavens"],
  hosts: ["armies", "angels", "heavens"],
  // creation and the world
  earth: ["world", "land", "ground"],
  world: ["earth", "nations", "flesh"],
  heaven: ["glory", "the heavens", "the sky"],
  heavens: ["skies", "glory", "the earth"],
  land: ["earth", "country", "ground"],
  city: ["nation", "town", "country"],
  ground: ["earth", "field", "dust"],
  dust: ["earth", "ashes", "clay"],
  whirlwind: ["storm", "tempest", "chariot"],
  darkness: ["night", "shadow", "blindness"],
  light: ["truth", "life", "glory"],
  fire: ["flame", "judgment", "wrath"],
  // people
  man: ["servant", "son", "mortal"],
  men: ["people", "servants", "sons"],
  sons: ["children", "servants", "heirs"],
  believers: ["saints", "faithful", "disciples"],
  saints: ["faithful", "brethren", "chosen"],
  servant: ["son", "messenger", "steward"],
  neighbor: ["brother", "friend", "stranger"],
  brother: ["neighbor", "friend", "companion"],
  nations: ["peoples", "kingdoms", "tribes"],
  people: ["nations", "multitude", "flock"],
  king: ["ruler", "prince", "lord"],
  // heart, mind and soul
  heart: ["mind", "soul", "will"],
  hearts: ["minds", "souls", "wills"],
  soul: ["heart", "spirit", "life"],
  souls: ["hearts", "spirits", "lives"],
  mind: ["heart", "understanding", "will"],
  understanding: ["wisdom", "knowledge", "counsel"],
  wisdom: ["knowledge", "understanding", "counsel"],
  knowledge: ["wisdom", "understanding", "truth"],
  // the Christian life
  love: ["grace", "mercy", "goodness"],
  loved: ["cherished", "chosen", "blessed"],
  faith: ["hope", "trust", "belief"],
  hope: ["trust", "faith", "peace"],
  grace: ["mercy", "favor", "peace"],
  mercy: ["grace", "compassion", "kindness"],
  mercies: ["compassions", "kindnesses", "goodness"],
  compassions: ["mercies", "kindnesses", "goodness"],
  peace: ["rest", "joy", "mercy"],
  joy: ["peace", "gladness", "comfort"],
  gladness: ["joy", "comfort", "peace"],
  truth: ["light", "grace", "wisdom"],
  righteous: ["holy", "faithful", "upright"],
  righteousness: ["holiness", "justice", "truth"],
  holy: ["righteous", "pure", "faithful"],
  holiness: ["righteousness", "purity", "glory"],
  blessed: ["happy", "favored", "holy"],
  merciful: ["gracious", "faithful", "kind"],
  gracious: ["merciful", "compassionate", "kind"],
  perfect: ["complete", "blameless", "holy"],
  faultless: ["blameless", "perfect", "upright"],
  evil: ["sin", "wrong", "wickedness"],
  sin: ["evil", "transgression", "iniquity"],
  iniquity: ["sin", "transgression", "wickedness"],
  unrighteousness: ["wickedness", "sin", "injustice"],
  repentance: ["obedience", "faith", "sorrow"],
  salvation: ["deliverance", "redemption", "mercy"],
  glory: ["honor", "majesty", "power"],
  majesty: ["glory", "honor", "power"],
  strength: ["might", "power", "glory"],
  power: ["strength", "might", "glory"],
  might: ["strength", "power", "glory"],
  stronghold: ["refuge", "fortress", "shelter"],
  refuge: ["stronghold", "shelter", "strength"],
  // promises and answers
  eternal: ["everlasting", "endless", "immortal"],
  everlasting: ["eternal", "endless", "unchanging"],
  forever: ["eternally", "always", "forevermore"],
  forevermore: ["forever", "eternally", "always"],
  possible: ["impossible", "attainable", "easy"],
  impossible: ["possible", "hopeless", "beyond reach"],
  saved: ["healed", "freed", "redeemed"],
  save: ["heal", "deliver", "rescue"],
  healed: ["restored", "forgiven", "saved"],
  risen: ["ascended", "alive", "exalted"],
  born: ["begotten", "created", "sent"],
  alive: ["safe", "living", "free"],
  living: ["alive", "breathing", "risen"],
  dead: ["fallen", "asleep", "perished"],
  perish: ["fade", "fail", "die"],
  lost: ["broken", "driven away", "straying"],
  // verbs
  give: ["grant", "bring", "send"],
  gives: ["grants", "sends", "shows"],
  given: ["granted", "offered", "entrusted"],
  gave: ["sent", "offered", "granted"],
  make: ["let", "bid", "grant"],
  made: ["formed", "created", "built"],
  walk: ["live", "abide", "dwell"],
  live: ["dwell", "walk", "abide"],
  dwell: ["live", "abide", "remain"],
  dwells: ["abides", "lives", "remains"],
  receive: ["obtain", "accept", "inherit"],
  seek: ["search for", "follow", "serve"],
  find: ["receive", "obtain", "discover"],
  keep: ["guard", "observe", "hold"],
  want: ["fear", "faint", "lack"],
  strengthens: ["comforts", "keeps", "upholds"],
  kept: ["held", "guarded", "finished"],
  stand: ["remain", "endure", "abide"],
  stands: ["endures", "remains", "abides"],
  establish: ["strengthen", "confirm", "build"],
  turn: ["return", "repent", "come"],
  depart: ["go", "withdraw", "turn away"],
  flee: ["depart", "turn", "run"],
  bring: ["lead", "gather", "send"],
  send: ["call", "lead", "bring"],
  sent: ["given", "chosen", "called"],
  choose: ["seek", "love", "keep"],
  eat: ["drink", "receive", "labor"],
  taste: ["see", "know", "prove"],
  see: ["know", "behold", "taste"],
  opened: ["given", "shown", "revealed"],
  glorify: ["praise", "honor", "magnify"],
  filled: ["satisfied", "fed", "comforted"],
  binds: ["heals", "mends", "covers"],
  wounds: ["sorrows", "bruises", "griefs"],
  cares: ["burdens", "worries", "fears"],
  provide: ["prepare", "give", "supply"],
  reward: ["blessing", "crown", "portion"],
  shows: ["teaches", "reveals", "proves"],
  consist: ["endure", "hold together", "remain"],
  escape: ["deliverance", "rescue", "refuge"],
  pass: ["cross over", "come", "depart"],
  prosper: ["succeed", "flourish", "increase"],
  meditate: ["reflect", "ponder", "muse"],
  remember: ["consider", "recall", "keep"],
  declare: ["proclaim", "tell", "show"],
  rejoice: ["be glad", "sing", "celebrate"],
  singing: ["praising", "rejoicing", "shouting"],
  praise: ["glory", "honor", "thanksgiving"],
  worship: ["serve", "praise", "bow"],
  // nouns and modifiers
  things: ["works", "blessings", "wonders"],
  works: ["deeds", "labors", "ways"],
  words: ["sayings", "truth", "commandments"],
  word: ["truth", "message", "promise"],
  way: ["path", "road", "door"],
  ways: ["paths", "works", "deeds"],
  thing: ["matter", "work", "word"],
  good: ["great", "perfect", "gracious"],
  great: ["mighty", "strong", "holy"],
  strong: ["mighty", "great", "bold"],
  full: ["great", "perfect", "complete"],
  little: ["nothing", "much", "scarcely"],
  small: ["quiet", "gentle", "still"],
  voice: ["word", "sound", "call"],
  time: ["hour", "day", "season"],
  day: ["hour", "time", "season"],
  hand: ["arm", "power", "sight"],
  face: ["presence", "eyes", "countenance"],
  sight: ["presence", "appearance", "eyes"],
  eyes: ["sight", "face", "heart"],
  head: ["chief", "crown", "cornerstone"],
  name: ["glory", "honor", "praise"],
  kingdom: ["throne", "dominion", "rule"],
  throne: ["kingdom", "dominion", "seat"],
  dominion: ["kingdom", "power", "rule"],
  image: ["likeness", "form", "glory"],
  handiwork: ["workmanship", "creation", "power"],
  likeness: ["image", "form", "nature"],
  root: ["source", "foundation", "fountain"],
  kinds: ["forms", "sorts", "manner"],
  inspiration: ["revelation", "breath", "the Spirit"],
  purpose: ["plan", "counsel", "will"],
  future: ["hope", "purpose", "blessing"],
  former: ["early", "first", "latter"],
  latter: ["former", "last", "second"],
  first: ["last", "beginning", "head"],
  last: ["first", "end", "least"],
  chief: ["greatest", "least", "first"],
  example: ["pattern", "witness", "model"],
  means: ["way", "door", "chance"],
  safety: ["peace", "quietness", "rest"],
  weakness: ["infirmity", "frailty", "sorrow"],
  pleasures: ["joys", "delights", "riches"],
  riches: ["wealth", "treasures", "honors"],
  teaching: ["preaching", "doctrine", "wisdom"],
  preaching: ["teaching", "healing", "praying"],
  prophesy: ["rejoice", "preach", "declare"],
  decision: ["judgment", "harvest", "vengeance"],
  unity: ["peace", "harmony", "concord"],
  eagles: ["doves", "angels", "sparrows"],
  snow: ["wool", "milk", "light"],
  conception: ["children", "fruit", "blessing"],
  lamb: ["sheep", "offering", "sacrifice"],
  temple: ["house", "sanctuary", "altar"],
  altar: ["temple", "offering", "sanctuary"],
  // adverbs and adjectives of manner
  humbly: ["faithfully", "sincerely", "quietly"],
  liberally: ["generously", "freely", "abundantly"],
  abundantly: ["richly", "freely", "greatly"],
  freely: ["openly", "boldly", "graciously"],
  likewise: ["willingly", "readily", "faithfully"],
  always: ["continually", "constantly", "forever"],
  never: ["not ever", "no more", "scarcely"],
  nothing: ["little", "much", "anything"],
  mine: ["yours", "His", "theirs"],
  complaining: ["murmuring", "grumbling", "doubting"],
  complain: ["murmur", "grumble", "doubt"]
}));

/* ---------- whole-phrase substitutions ----------

   For the swaps a single word cannot express: an idiom ("do also to
   them"), a possessive phrase ("man's all"), or a slot where the words
   either side of the one that has to change are part of the same unit
   ("not have God" -> "not have the Son"). Keyed by the phrase as the
   answer spells it, lowercased, with the answer's punctuation ignored —
   the same normalising the rest of the generator uses. */
const PHRASES = new Map(Object.entries({
  "do also to them": ["do even so to them", "do the same to them", "do likewise to them"],
  "man's all": ["man's whole duty", "man's chief end", "man's true purpose"],
  "have god": ["have the Son", "have the truth", "know the Father"],
  "was god": ["was divine", "was a God", "became flesh"],
  "no other gods": ["no other lords", "no strange gods", "no graven images"],
  "the lord's": ["the master's", "the king's", "the shepherd's"]
}));

/* ---------- per-reference overrides ----------

   For the handful of verses where no table reaches: the answer is a
   function word, an idiom, or so short that only a hand-written set will
   do. Keyed by the bank reference. */
const SPECIAL = new Map(Object.entries({
  // "the head, even Christ" is one unit, and the aligned blank keeps only
  // its first three words, so neither half can be swapped on its own.
  "Ephesians 4:15": ["the chief cornerstone", "the head of all"],
  // "does not have God" against "not have God" is a shape mismatch rather
  // than a wording one — the KJV's "hath" modernises into two words.
  "2 John 1:9": ["has not the Son", "denies the Son"],
  // The one place the KJV answer itself is wanted but cannot be
  // generated: "was with God" is already the verse's own words.
  "John 1:1": ["was the Creator", "dwelt among us"],
  // "through a glass, darkly" is the KJV's phrasing of a blank the NKJV
  // cuts to two words, so neither the KJV answer nor the bank's shorter
  // options fit the sentence the NKJV leaves around it.
  "1 Corinthians 13:12": ["glass, darkly", "riddle, plainly", "shadow, faintly"],
  // A blank of nothing but function words takes only function words, and
  // the bank's wrong answers here are all nouns.
  "Zechariah 9:9": ["upon"],
  "Galatians 6:9": ["will not", "must not", "should not"],
  // "Why hidest thou thyself" modernises into English that has lost its
  // auxiliary, so this one is written out.
  "Genesis 3:9": ["Why are you hiding?"],
  // The aligned blank is the tail of the KJV's "whole duty of man", and
  // the bank's own wrong answers for it do not stand on their own.
  "Ecclesiastes 12:13": ["man's whole duty", "man's chief end", "man's true purpose"]
}));

module.exports = { MODERNISE, VERB_BASE, TRIVIAL, SUBSTITUTE, PHRASES, SPECIAL };
