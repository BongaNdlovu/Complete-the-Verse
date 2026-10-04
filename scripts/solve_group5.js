const fs = require('fs');
const { validateVerse } = require('./test_validator');
const { kjvMap, normalizeText } = require('./solve_util');

const CANDIDATES = [
  // Hosea (7)
  {
    b: "Hosea", r: "Hosea 2:19", t: 3,
    a: "in righteousness, and in judgment",
    d: ["in truth and in everlasting peace", "with songs of joyful thanksgiving", "before the presence of my people"]
  },
  {
    b: "Hosea", r: "Hosea 2:20", t: 3,
    a: "thou shalt know the LORD",
    d: ["thy soul shall dwell in peace", "he will show thee his mercy", "his truth shall be thy shield"]
  },
  {
    b: "Hosea", r: "Hosea 6:1", t: 2,
    a: "Come, and let us return unto the LORD",
    d: ["Seek ye the God of Jacob while he may be found", "Praise ye the name of the Almighty for ever", "Turn again, O Israel, from the path of evil"]
  },
  {
    b: "Hosea", r: "Hosea 13:4", t: 2,
    a: "there is no saviour beside me",
    d: ["my holy throne is from everlasting", "I have redeemed thy soul from death", "beside my name there is none else"]
  },
  {
    b: "Hosea", r: "Hosea 14:1", t: 2,
    a: "return unto the LORD thy God",
    d: ["walk in all his commandments", "offer pure sacrifices of peace", "cleave unto his holy covenant"]
  },
  {
    b: "Hosea", r: "Hosea 14:2", t: 3,
    a: "receive us graciously",
    d: ["pardon our iniquities", "heal all our backslidings", "remember thy covenant"]
  },
  {
    b: "Hosea", r: "Hosea 14:9", t: 3,
    a: "the ways of the LORD are right",
    d: ["the counsel of God shall stand", "his holy judgments are true", "the path of wisdom is peace"]
  },

  // Joel (5)
  {
    b: "Joel", r: "Joel 1:14", t: 3,
    a: "Sanctify ye a fast",
    d: ["Blow ye the trumpet", "Call upon the Lord", "Gather the people"]
  },
  {
    b: "Joel", r: "Joel 2:21", t: 2,
    a: "the LORD will do great things",
    d: ["his holy arm shall deliver you", "the King of heaven will give peace", "his tender mercies shall abound"]
  },
  {
    b: "Joel", r: "Joel 3:10", t: 2,
    a: "let the weak say, I am strong",
    d: ["let the poor rejoice in the Lord", "let the sorrowful sing of his grace", "let the humble praise his holy name"]
  },
  {
    b: "Joel", r: "Joel 3:16", t: 2,
    a: "the hope of his people",
    d: ["a shield unto Israel", "the rock of salvation", "a helper in trouble"]
  },
  {
    b: "Joel", r: "Joel 3:18", t: 3,
    a: "the hills shall flow with milk",
    d: ["the valleys shall shout for joy", "the pastures shall bring forth increase", "the land shall be filled with peace"]
  },

  // Amos (7)
  {
    b: "Amos", r: "Amos 1:2", t: 2,
    a: "The LORD will roar from Zion",
    d: ["The King of heaven cometh with power", "The holy One of Israel shall judge", "His mighty voice shall shake the earth"]
  },
  {
    b: "Amos", r: "Amos 3:8", t: 2,
    a: "The lion hath roared, who will not fear?",
    d: ["The trumpet hath sounded, who will not hear?", "The day of the Lord cometh, who can abide?", "The holy God hath spoken, who can doubt?"]
  },
  {
    b: "Amos", r: "Amos 5:4", t: 2,
    a: "Seek ye me, and ye shall live",
    d: ["Turn unto my law, and find peace", "Keep my commandments, and prosper", "Hear my holy word, and be healed"]
  },
  {
    b: "Amos", r: "Amos 5:6", t: 2,
    a: "Seek the LORD, and ye shall live",
    d: ["Trust in his name, and find rest", "Call upon his mercy, and be saved", "Walk in his statutes, and have peace"]
  },
  {
    b: "Amos", r: "Amos 5:15", t: 2,
    a: "Hate the evil, and love the good",
    d: ["Cleave unto truth, and walk in peace", "Turn from pride, and seek humility", "Depart from sin, and honor the Lord"]
  },
  {
    b: "Amos", r: "Amos 9:14", t: 2,
    a: "they shall build the waste cities",
    d: ["they shall restore the holy temple", "they shall walk in righteous peace", "they shall offer pure sacrifices"]
  },
  {
    b: "Amos", r: "Amos 9:15", t: 2,
    a: "I will plant them upon their land",
    d: ["I will give them peace in their borders", "they shall dwell safely in their cities", "my mercy shall compass them about"]
  },

  // Obadiah (4)
  {
    b: "Obadiah", r: "Obadiah 1:1", t: 3,
    a: "We have heard a rumour from the LORD",
    d: ["A vision of the Almighty was declared", "The word of the holy prophet came to pass", "The judgment of heaven is revealed this day"]
  },
  {
    b: "Obadiah", r: "Obadiah 1:2", t: 3,
    a: "small among the heathen",
    d: ["a reproach to the nations", "desolate in thy borders", "fallen from thy pride"]
  },
  {
    b: "Obadiah", r: "Obadiah 1:8", t: 3,
    a: "even destroy the wise men out of Edom",
    d: ["cut off the princes of the strangers", "scatter the host of the ungodly", "bring down the pride of the haughty"]
  },
  {
    b: "Obadiah", r: "Obadiah 1:10", t: 3,
    a: "shame shall cover thee",
    d: ["judgment shall fall upon thee", "fear shall compass thy house", "sorrow shall overtake thy soul"]
  },

  // Jonah (5)
  {
    b: "Jonah", r: "Jonah 1:9", t: 2,
    a: "I fear the LORD, the God of heaven",
    d: ["I worship the Almighty King of all", "I serve the living God of Abraham", "My hope is in the Holy One of Jacob"]
  },
  {
    b: "Jonah", r: "Jonah 2:2", t: 2,
    a: "and thou heardest my voice",
    d: ["and deliveredst my soul", "and showedst thy mercy", "and healedst my plague"]
  },
  {
    b: "Jonah", r: "Jonah 2:7", t: 2,
    a: "I remembered the LORD",
    d: ["I cried unto my God", "my heart sought peace", "I turned unto him"]
  },
  {
    b: "Jonah", r: "Jonah 3:5", t: 2,
    a: "the people of Nineveh believed God",
    d: ["the king of Assyria bowed in fear", "the princes of the city repented", "all the inhabitants wept aloud"]
  },
  {
    b: "Jonah", r: "Jonah 4:2", t: 2,
    a: "thou art a gracious God, and merciful",
    d: ["thy throne is established in righteousness", "great is thy lovingkindness toward Israel", "thy holy name is exalted above the heavens"]
  },

  // Micah (7)
  {
    b: "Micah", r: "Micah 1:3", t: 3,
    a: "the LORD cometh forth out of his place",
    d: ["the King of glory shall judge the earth", "the Holy One will reveal his mighty arm", "the God of Jacob descendeth from heaven"]
  },
  {
    b: "Micah", r: "Micah 2:7", t: 3,
    a: "do not my words do good",
    d: ["shall not his truth abide", "doth not his mercy endure", "is not his promise sure"]
  },
  {
    b: "Micah", r: "Micah 4:2", t: 2,
    a: "to the house of the God of Jacob",
    d: ["before the altar of his holy temple", "unto the sanctuary of the living King", "into the courts of everlasting praise"]
  },
  {
    b: "Micah", r: "Micah 4:5", t: 2,
    a: "in the name of the LORD our God",
    d: ["before the throne of his holy temple", "according to all his commandments", "with songs of everlasting joy"]
  },
  {
    b: "Micah", r: "Micah 4:7", t: 2,
    a: "the LORD shall reign over them",
    d: ["the King of glory shall judge", "his holy arm shall deliver them", "his peace shall never be moved"]
  },
  {
    b: "Micah", r: "Micah 6:6", t: 2,
    a: "bow myself before the high God?",
    d: ["offer pure praise unto the Lord?", "enter into his glorious presence?", "make my supplication in faith?"]
  },
  {
    b: "Micah", r: "Micah 7:8", t: 1,
    a: "the LORD shall be a light unto me",
    d: ["his holy arm shall lift up my soul", "the God of my salvation will save me", "his tender mercy shall compass my path"]
  },

  // Nahum (5)
  {
    b: "Nahum", r: "Nahum 1:2", t: 3,
    a: "God is jealous, and the LORD revengeth",
    d: ["The Almighty is righteous in judgment", "The Holy One will not acquit the wicked", "The King of heaven will plead his cause"]
  },
  {
    b: "Nahum", r: "Nahum 1:4", t: 3,
    a: "rebuketh the sea, and maketh it dry",
    d: ["ruleth the heavens in his great power", "maketh the clouds his holy chariot", "judgeth the earth in righteous equity"]
  },
  {
    b: "Nahum", r: "Nahum 1:5", t: 3,
    a: "The mountains quake at him",
    d: ["The earth trembleth in fear", "The pillars of heaven shake", "The depths of the sea roar"]
  },
  {
    b: "Nahum", r: "Nahum 1:9", t: 3,
    a: "affliction shall not rise up the second time",
    d: ["his adversaries shall be consumed as stubble", "the decree of the ungodly shall be broken", "the kingdom of the oppressor is brought down"]
  },
  {
    b: "Nahum", r: "Nahum 1:12", t: 3,
    a: "I will afflict thee no more",
    d: ["my wrath is turned away", "I will heal thy wound", "thy peace shall abound"]
  },

  // Habakkuk (5)
  {
    b: "Habakkuk", r: "Habakkuk 1:5", t: 3,
    a: "I will work a work in your days",
    d: ["I will reveal my arm to the nations", "the day of judgment cometh quickly", "my word shall accomplish all my will"]
  },
  {
    b: "Habakkuk", r: "Habakkuk 2:2", t: 2,
    a: "make it plain upon tables",
    d: ["declare it unto all nations", "proclaim it with holy fear", "seal it until the time"]
  },
  {
    b: "Habakkuk", r: "Habakkuk 2:3", t: 2,
    a: "it will surely come, it will not tarry",
    d: ["the word of the Lord shall not fail", "the vision of heaven shall be fulfilled", "his righteous decree is established forever"]
  },
  {
    b: "Habakkuk", r: "Habakkuk 3:2", t: 2,
    a: "in wrath remember mercy",
    d: ["in judgment show thy love", "forgive our secret sins", "look down from heaven"]
  },
  {
    b: "Habakkuk", r: "Habakkuk 3:18", t: 1,
    a: "in the God of my salvation",
    d: ["in the rock of my refuge", "in the King of my praise", "in the Lord of my peace"]
  },

  // Zephaniah (5)
  {
    b: "Zephaniah", r: "Zephaniah 1:7", t: 2,
    a: "the day of the LORD is at hand",
    d: ["the judgment of heaven cometh soon", "the holy King shall reveal his arm", "the time of righteousness is near"]
  },
  {
    b: "Zephaniah", r: "Zephaniah 1:14", t: 2,
    a: "The great day of the LORD is near",
    d: ["The holy judgment of heaven cometh", "The glorious kingdom shall be revealed", "The day of his wrath shall overtake them"]
  },
  {
    b: "Zephaniah", r: "Zephaniah 3:12", t: 3,
    a: "an afflicted and poor people",
    d: ["a holy and humble nation", "a remnant of true worship", "a chosen and faithful seed"]
  },
  {
    b: "Zephaniah", r: "Zephaniah 3:14", t: 2,
    a: "Sing, O daughter of Zion",
    d: ["Rejoice, O chosen people", "Shout aloud, O Israel", "Praise the holy King"]
  },
  {
    b: "Zephaniah", r: "Zephaniah 3:15", t: 2,
    a: "thou shalt not see evil any more",
    d: ["thy peace shall endure forevermore", "his holy presence will deliver thee", "the fear of the enemy is taken away"]
  },

  // Haggai (5)
  {
    b: "Haggai", r: "Haggai 1:7", t: 2,
    a: "Consider your ways",
    d: ["Remember my law", "Sanctify your heart", "Keep my covenant"]
  },
  {
    b: "Haggai", r: "Haggai 1:8", t: 3,
    a: "Go up to the mountain, and bring wood",
    d: ["Enter into the courts with thanksgiving", "Offer sacrifices upon his holy altar", "Gather the elders of the congregation"]
  },
  {
    b: "Haggai", r: "Haggai 1:12", t: 2,
    a: "the people did fear before the LORD",
    d: ["the elders kept the holy covenant", "the priests offered sweet incense", "all the host bowed in thanksgiving"]
  },
  {
    b: "Haggai", r: "Haggai 1:13", t: 2,
    a: "I am with you, saith the LORD",
    d: ["Fear not the faces of the heathen", "My holy promise shall not fail", "My spirit remaineth among you"]
  },
  {
    b: "Haggai", r: "Haggai 2:5", t: 2,
    a: "my spirit remaineth among you: fear ye not",
    d: ["my holy presence shall protect your city", "my covenant shall stand with all your seed", "my righteous arm will scatter your enemies"]
  },

  // Zechariah (7)
  {
    b: "Zechariah", r: "Zechariah 1:16", t: 2,
    a: "I am returned to Jerusalem with mercies",
    d: ["My holy throne shall be established", "The glory of the Lord shall be seen", "Peace shall be within her sacred gates"]
  },
  {
    b: "Zechariah", r: "Zechariah 2:13", t: 2,
    a: "Be silent, O all flesh, before the LORD",
    d: ["Bow down, all ye nations, before the King", "Praise ye the name of the most High God", "Give thanks unto the Rock of our salvation"]
  },
  {
    b: "Zechariah", r: "Zechariah 4:10", t: 2,
    a: "the day of small things?",
    d: ["the promise of his word?", "the house of his glory?", "the counsel of the Lord?"]
  },
  {
    b: "Zechariah", r: "Zechariah 8:3", t: 2,
    a: "I am returned unto Zion",
    d: ["I will heal my people", "My peace is established", "My glory is revealed"]
  },
  {
    b: "Zechariah", r: "Zechariah 8:7", t: 2,
    a: "I will save my people",
    d: ["I will heal their land", "my peace shall abide", "my arm will defend"]
  },
  {
    b: "Zechariah", r: "Zechariah 8:8", t: 2,
    a: "in truth and in righteousness",
    d: ["with all their whole heart", "in holy peace and praise", "under my mighty hand"]
  },
  {
    b: "Zechariah", r: "Zechariah 8:19", t: 2,
    a: "therefore love the truth and peace",
    d: ["walk in his holy commandments", "offer pure sacrifices of joy", "cleave unto the living God"]
  },

  // Malachi (5)
  {
    b: "Malachi", r: "Malachi 1:6", t: 2,
    a: "where is mine honour?",
    d: ["why do ye sin?", "where is your fear?", "why doubt ye me?"]
  },
  {
    b: "Malachi", r: "Malachi 1:11", t: 2,
    a: "my name shall be great among the Gentiles",
    d: ["pure incense shall arise unto my throne", "all the ends of the earth shall fear me", "holy offerings shall be brought to my house"]
  },
  {
    b: "Malachi", r: "Malachi 2:6", t: 2,
    a: "The law of truth was in his mouth",
    d: ["The word of life was upon his lips", "The holy covenant was in his heart", "The praise of God was his strength"]
  },
  {
    b: "Malachi", r: "Malachi 3:3", t: 2,
    a: "a refiner and purifier of silver",
    d: ["a righteous king in holy power", "a faithful judge of his house", "a helper unto the fatherless"]
  },
  {
    b: "Malachi", r: "Malachi 3:17", t: 2,
    a: "when I make up my jewels",
    d: ["when I visit my people", "when I reveal my glory", "when I establish peace"]
  }
];

function buildVerseItem(c) {
  const rawTxt = kjvMap.get(c.r);
  if (!rawTxt) {
    return { ok: false, error: 'Reference not found in kjvMap: ' + c.r };
  }
  const txt = normalizeText(rawTxt);
  const a = normalizeText(c.a);
  const d = c.d.map(normalizeText);

  let idx = txt.indexOf(a);
  if (idx < 0) {
    const bareA = a.replace(/[.,;:!?]+$/, '');
    idx = txt.indexOf(bareA);
    if (idx < 0) {
      return { ok: false, error: 'Could not locate answer "' + a + '" in "' + txt + '" for ' + c.r };
    }
  }

  const p = txt.slice(0, idx).trim();
  const s = txt.slice(idx + a.length).trim();

  const item = {
    b: c.b,
    r: c.r,
    t: c.t,
    p: p,
    a: a,
    s: s,
    d: d
  };

  return validateVerse(item);
}

let passed = 0;
let failed = 0;
const verifiedItems = [];

CANDIDATES.forEach((c, idx) => {
  const res = buildVerseItem(c);
  if (res.ok) {
    passed++;
    verifiedItems.push(res.kjv);
  } else {
    failed++;
    console.log(`FAILED [${idx}] ${c.b} (${c.r}): ${res.error}`);
  }
});

console.log(`\nGroup 5 Results: Total: ${CANDIDATES.length}, Passed: ${passed}, Failed: ${failed}`);

if (failed === 0) {
  fs.writeFileSync('scripts/expansion/group5_minor_prophets.json', JSON.stringify(verifiedItems, null, 2));
  console.log('Successfully wrote scripts/expansion/group5_minor_prophets.json (67 items)');
}
