const fs = require('fs');
const { validateVerse } = require('./test_validator');
const QA = require('./verse-qa');
const { kjvMap, usedRefs, normalizeText } = require('./solve_util');

const CANDIDATES = [
  // Isaiah (14)
  {
    b: "Isaiah", r: "Isaiah 2:3", t: 3,
    a: "we will walk in his paths",
    d: ["he shall give us peace", "we will keep his statutes", "his truth shall be our guide"]
  },
  {
    b: "Isaiah", r: "Isaiah 6:3", t: 1,
    a: "Holy, holy, holy, is the LORD of hosts",
    d: ["Great and marvellous are thy works, Lord", "Righteous and true are thy holy ways", "Praise and honor belong unto our God"]
  },
  {
    b: "Isaiah", r: "Isaiah 11:1", t: 3,
    a: "a rod out of the stem of Jesse",
    d: ["a righteous branch from the throne of David", "a holy prophet unto the house of Israel", "a mighty savior out of the tribes of Judah"]
  },
  {
    b: "Isaiah", r: "Isaiah 12:3", t: 2,
    a: "out of the wells of salvation",
    d: ["from the fountain of living waters", "before the altar of his holy presence", "by the river of his eternal mercies"]
  },
  {
    b: "Isaiah", r: "Isaiah 25:1", t: 2,
    a: "O LORD, thou art my God",
    d: ["Great is the holy King", "Thou art our strong refuge", "Praise belongeth unto thee"]
  },
  {
    b: "Isaiah", r: "Isaiah 32:17", t: 2,
    a: "the work of righteousness shall be peace",
    d: ["the fear of the Lord is fountain of life", "the path of the upright leadeth to glory", "the fruit of wisdom is everlasting joy"]
  },
  {
    b: "Isaiah", r: "Isaiah 33:22", t: 2,
    a: "the LORD is our lawgiver",
    d: ["the King of heaven is our shield", "the Almighty is our strong tower", "the Holy One is our Redeemer"]
  },
  {
    b: "Isaiah", r: "Isaiah 35:1", t: 3,
    a: "and blossom as the rose",
    d: ["and bring forth pleasant fruits", "with songs of joyful thanksgiving", "in the beauty of the spring"]
  },
  {
    b: "Isaiah", r: "Isaiah 42:3", t: 3,
    a: "A bruised reed shall he not break",
    d: ["The afflicted soul will he not despise", "The humble heart shall find great mercy", "The sheep of his flock shall not perish"]
  },
  {
    b: "Isaiah", r: "Isaiah 44:6", t: 2,
    a: "beside me there is no God",
    d: ["before my throne all shall bow", "my glorious kingdom shall stand", "my righteous word shall not fail"]
  },
  {
    b: "Isaiah", r: "Isaiah 53:3", t: 1,
    a: "a man of sorrows, and acquainted with grief",
    d: ["despised of all the rulers of the people", "bearing our transgressions in his body", "the righteous servant of the living God"]
  },
  {
    b: "Isaiah", r: "Isaiah 53:4", t: 1,
    a: "Surely he hath borne our griefs",
    d: ["Truly he was wounded for our sins", "He was delivered for our offenses", "By his stripes we are all restored"]
  },
  {
    b: "Isaiah", r: "Isaiah 60:1", t: 1,
    a: "Arise, shine; for thy light is come",
    d: ["Awake, O Zion, and put on thy strength", "Rejoice greatly, O daughter of Jerusalem", "Sing aloud, for the Lord hath redeemed thee"]
  },
  {
    b: "Isaiah", r: "Isaiah 61:10", t: 2,
    a: "my soul shall be joyful in my God",
    d: ["my heart shall praise the holy King", "my lips shall speak of all his truth", "my tongue shall magnify his grace"]
  },

  // Jeremiah (10)
  {
    b: "Jeremiah", r: "Jeremiah 1:8", t: 2,
    a: "for I am with thee to deliver thee",
    d: ["my holy spirit shall guide thy ways", "the words of my mouth shall not fail", "my righteous hand will defend thy soul"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 9:23", t: 2,
    a: "glory in his wisdom",
    d: ["trust in his riches", "boast of his power", "rejoice in his honor"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 10:10", t: 2,
    a: "the LORD is the true God",
    d: ["the Almighty is our King", "the God of heaven reigneth", "his holy name is exalted"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 10:12", t: 3,
    a: "He hath made the earth by his power",
    d: ["He ruleth the heavens in his majesty", "He created all nations for his praise", "He established the world in righteousness"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 17:8", t: 3,
    a: "as a tree planted by the waters",
    d: ["like a green olive tree of God", "as a cedar in the mount of Lebanon", "as a fruitful branch in the garden"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 23:23", t: 3,
    a: "Am I a God at hand",
    d: ["Is not my word like fire", "Can any hide in secret", "Do not I fill heaven"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 23:24", t: 2,
    a: "Do not I fill heaven and earth?",
    d: ["Is not my word an enduring rock?", "Doth not my power rule all nations?", "Shall not my counsel stand forever?"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 29:12", t: 2,
    a: "and I will hearken unto you",
    d: ["and heal all your backslidings", "and forgive your transgression", "and restore peace unto Israel"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 29:13", t: 1,
    a: "with all your heart",
    d: ["in faith and truth", "with joyful songs", "in holy reverence"]
  },
  {
    b: "Jeremiah", r: "Jeremiah 32:27", t: 2,
    a: "is there any thing too hard for me?",
    d: ["can any man resist my holy decree?", "is not the whole earth in my hand?", "shall not my counsel surely stand?"]
  },

  // Lamentations (5)
  {
    b: "Lamentations", r: "Lamentations 3:24", t: 2,
    a: "The LORD is my portion",
    d: ["God is my salvation", "He is my strong rock", "My soul hath chosen him"]
  },
  {
    b: "Lamentations", r: "Lamentations 3:32", t: 3,
    a: "according to the multitude of his mercies",
    d: ["unto all them that call upon his name", "in the day when he visiteth his people", "before the face of all the congregation"]
  },
  {
    b: "Lamentations", r: "Lamentations 3:33", t: 3,
    a: "For he doth not afflict willingly",
    d: ["The Lord will not cast off for ever", "His anger endureth but for a moment", "He delighteth not in the death of any"]
  },
  {
    b: "Lamentations", r: "Lamentations 3:40", t: 2,
    a: "Let us search and try our ways",
    d: ["Let us offer sacrifices of peace", "Turn ye unto the God of Jacob", "Bow down before his holy altar"]
  },
  {
    b: "Lamentations", r: "Lamentations 5:21", t: 2,
    a: "renew our days as of old",
    d: ["forgive the sins of our fathers", "restore the peace of Jerusalem", "remember thy holy covenant"]
  },

  // Ezekiel (8)
  {
    b: "Ezekiel", r: "Ezekiel 1:28", t: 3,
    a: "the likeness of the glory of the LORD",
    d: ["the presence of the angel of his covenant", "the majesty of his heavenly sanctuary", "the throne of his righteousness on high"]
  },
  {
    b: "Ezekiel", r: "Ezekiel 18:21", t: 3,
    a: "he shall surely live, he shall not die",
    d: ["the Lord will blot out all his sins", "his soul shall dwell in quiet peace", "he shall inherit the holy mountain"]
  },
  {
    b: "Ezekiel", r: "Ezekiel 18:23", t: 3,
    a: "that the wicked should die?",
    d: ["that my people should perish?", "in the destruction of men?", "in the sorrow of the earth?"]
  },
  {
    b: "Ezekiel", r: "Ezekiel 34:11", t: 2,
    a: "will both search my sheep",
    d: ["will heal the broken heart", "will gather the outcasts", "will restore my heritage"]
  },
  {
    b: "Ezekiel", r: "Ezekiel 34:12", t: 3,
    a: "so will I seek out my sheep",
    d: ["so shall my hand guide them", "thus will I restore Israel", "so shall my peace be given"]
  },
  {
    b: "Ezekiel", r: "Ezekiel 34:26", t: 2,
    a: "there shall be showers of blessing",
    d: ["the land shall yield her increase", "peace shall abound in their tents", "my holy presence shall dwell there"]
  },
  {
    b: "Ezekiel", r: "Ezekiel 37:3", t: 2,
    a: "O Lord GOD, thou knowest",
    d: ["Thy holy arm can save them", "Thou hast power over death", "Thy word can give them life"]
  },
  {
    b: "Ezekiel", r: "Ezekiel 48:35", t: 2,
    a: "The LORD is there",
    d: ["God is our king", "Peace unto Zion", "Holy is our Lord"]
  },

  // Daniel (8)
  {
    b: "Daniel", r: "Daniel 2:44", t: 2,
    a: "set up a kingdom",
    d: ["establish his throne", "reveal his power", "judge all nations"]
  },
  {
    b: "Daniel", r: "Daniel 4:37", t: 3,
    a: "he is able to abase",
    d: ["he will bring down low", "his wrath shall scatter", "no king can withstand"]
  },
  {
    b: "Daniel", r: "Daniel 6:27", t: 2,
    a: "signs and wonders in heaven",
    d: ["glory and honor on earth", "righteousness before all", "salvation unto his own"]
  },
  {
    b: "Daniel", r: "Daniel 7:13", t: 3,
    a: "one like the Son of man",
    d: ["the prince of the angels", "the holy king of heaven", "the messenger of peace"]
  },
  {
    b: "Daniel", r: "Daniel 7:14", t: 2,
    a: "an everlasting dominion",
    d: ["a holy habitation", "a glorious kingdom", "a righteous sceptre"]
  },
  {
    b: "Daniel", r: "Daniel 9:4", t: 3,
    a: "the great and dreadful God",
    d: ["the everlasting holy King", "the righteous judge of men", "the maker of all heavens"]
  },
  {
    b: "Daniel", r: "Daniel 9:18", t: 3,
    a: "but for thy great mercies",
    d: ["and for thy covenant's sake", "in faith of thy promise", "through thy tender love"]
  },
  {
    b: "Daniel", r: "Daniel 9:19", t: 2,
    a: "called by thy name",
    d: ["cleansed by thy blood", "kept by thy power", "guided by thy hand"]
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

console.log(`\nGroup 4 Results: Total: ${CANDIDATES.length}, Passed: ${passed}, Failed: ${failed}`);

if (failed === 0) {
  fs.writeFileSync('scripts/expansion/group4_major_prophets.json', JSON.stringify(verifiedItems, null, 2));
  console.log('Successfully wrote scripts/expansion/group4_major_prophets.json (45 items)');
}
