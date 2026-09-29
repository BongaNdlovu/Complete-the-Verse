const fs = require('fs');
const { validateVerse } = require('./test_validator');
const QA = require('./verse-qa');
const { kjvMap, usedRefs, normalizeText } = require('./solve_util');

const CANDIDATES = [
  // Job (7)
  {
    b: "Job", r: "Job 5:9", t: 3,
    a: "Which doeth great things and unsearchable",
    d: ["Whose kingdom is from everlasting to everlasting", "Who healeth the broken in heart with mercy", "Who judgeth the righteous with true equity"]
  },
  {
    b: "Job", r: "Job 12:13", t: 3,
    a: "With him is wisdom and strength",
    d: ["In his hand are the depths of the earth", "Before his throne is light unapproachable", "Unto his name belongeth all thanksgiving"]
  },
  {
    b: "Job", r: "Job 22:21", t: 2,
    a: "Acquaint now thyself with him",
    d: ["Walk uprightly before the LORD", "Offer sacrifices of righteousness", "Keep the holy commandments"]
  },
  {
    b: "Job", r: "Job 23:12", t: 3,
    a: "I have esteemed the words of his mouth",
    d: ["my soul hath longed for his salvation", "I have remembered his holy covenant", "my heart hath trusted in his mercy"]
  },
  {
    b: "Job", r: "Job 33:4", t: 2,
    a: "The Spirit of God hath made me",
    d: ["The word of the Lord created the heavens", "His tender mercies are over all his works", "The hand of the Almighty formed the earth"]
  },
  {
    b: "Job", r: "Job 34:21", t: 3,
    a: "his eyes are upon the ways of man",
    d: ["his righteous throne is established on high", "his holy counsel shall stand for ever", "his mercy endureth unto all generations"]
  },
  {
    b: "Job", r: "Job 37:5", t: 3,
    a: "God thundereth marvellously with his voice",
    d: ["The LORD reigneth in beauty and great power", "His holy light shineth over all the earth", "He maketh the clouds his chariot in heaven"]
  },

  // Psalms (24)
  {
    b: "Psalms", r: "Psalm 5:3", t: 2,
    a: "My voice shalt thou hear in the morning",
    d: ["My soul shall make her boast in the LORD", "I will sing praises unto the God of Jacob", "My mouth shall speak of thy lovingkindness"]
  },
  {
    b: "Psalms", r: "Psalm 16:8", t: 2,
    a: "I have set the LORD always before me",
    d: ["My soul doth wait for the God of my salvation", "In his holy word have I placed my confidence", "I will sing praises unto the Rock of my refuge"]
  },
  {
    b: "Psalms", r: "Psalm 19:7", t: 2,
    a: "The law of the LORD is perfect",
    d: ["The word of our God shall stand", "The holy covenant is unchangeable", "The path of righteousness is peace"]
  },
  {
    b: "Psalms", r: "Psalm 20:7", t: 2,
    a: "we will remember the name of the LORD",
    d: ["our trust shall be in the God of Jacob", "his righteous arm shall give the victory", "our soul shall rejoice in his holy power"]
  },
  {
    b: "Psalms", r: "Psalm 26:8", t: 3,
    a: "the habitation of thy house",
    d: ["the beauty of thy temple", "the courts of thy praise", "the secret of thy presence"]
  },
  {
    b: "Psalms", r: "Psalm 28:7", t: 2,
    a: "The LORD is my strength and my shield",
    d: ["The God of Jacob is our high refuge", "The Lord of hosts is with his people", "His holy arm hath wrought our salvation"]
  },
  {
    b: "Psalms", r: "Psalm 31:24", t: 2,
    a: "Be of good courage",
    d: ["Stand fast in faith", "Fear not the enemy", "Trust in his mercy"]
  },
  {
    b: "Psalms", r: "Psalm 32:7", t: 2,
    a: "Thou art my hiding place",
    d: ["The LORD is my fortress", "God is our rock of hope", "He is my strong salvation"]
  },
  {
    b: "Psalms", r: "Psalm 33:4", t: 2,
    a: "the word of the LORD is right",
    d: ["the judgments of God are true", "his holy throne is exalted", "his counsel shall endure"]
  },
  {
    b: "Psalms", r: "Psalm 33:12", t: 2,
    a: "whose God is the LORD",
    d: ["that feareth his name", "that keepeth his law", "that walketh in truth"]
  },
  {
    b: "Psalms", r: "Psalm 34:3", t: 2,
    a: "O magnify the LORD with me",
    d: ["Give thanks unto the holy King", "Sing praises to the living God", "Rejoice in the Lord of hosts"]
  },
  {
    b: "Psalms", r: "Psalm 36:5", t: 3,
    a: "Thy mercy, O LORD, is in the heavens",
    d: ["Thy righteousness shineth as the morning", "Thy holy throne is established forever", "Thy truth is declared among the nations"]
  },
  {
    b: "Psalms", r: "Psalm 62:5", t: 2,
    a: "my expectation is from him",
    d: ["his mercy shall preserve me", "my soul shall not be moved", "in his word do I hope"]
  },
  {
    b: "Psalms", r: "Psalm 63:1", t: 2,
    a: "early will I seek thee",
    d: ["my tongue shall praise thee", "my soul shall bless thee", "in faith will I call"]
  },
  {
    b: "Psalms", r: "Psalm 84:1", t: 2,
    a: "How amiable are thy tabernacles",
    d: ["How glorious is thy sanctuary", "Blessed is the place of prayer", "Great is the house of praise"]
  },
  {
    b: "Psalms", r: "Psalm 92:1", t: 2,
    a: "to sing praises unto thy name",
    d: ["to declare thy lovingkindness in truth", "to worship before thy glorious throne", "to rejoice in the house of our God"]
  },
  {
    b: "Psalms", r: "Psalm 95:6", t: 2,
    a: "let us worship and bow down",
    d: ["let us praise his holy name", "let us enter his sanctuary", "let us rejoice before him"]
  },
  {
    b: "Psalms", r: "Psalm 96:9", t: 2,
    a: "in the beauty of holiness",
    d: ["with songs of thanksgiving", "before his glorious throne", "in his sacred dwelling"]
  },
  {
    b: "Psalms", r: "Psalm 100:1", t: 1,
    a: "Make a joyful noise unto the LORD",
    d: ["Praise ye the name of the Almighty", "Sing praises to the King of heaven", "Give thanks unto the God of Jacob"]
  },
  {
    b: "Psalms", r: "Psalm 103:2", t: 1,
    a: "forget not all his benefits",
    d: ["rejoice in his holy salvation", "trust in his tender compassions", "proclaim his truth to the people"]
  },
  {
    b: "Psalms", r: "Psalm 119:18", t: 2,
    a: "Open thou mine eyes",
    d: ["Incline thou my heart", "Enlighten thou my soul", "Lead me in thy truth"]
  },
  {
    b: "Psalms", r: "Psalm 121:2", t: 2,
    a: "My help cometh from the LORD",
    d: ["My hope is in the living God", "My soul trusteth in the Almighty", "His right hand hath delivered me"]
  },
  {
    b: "Psalms", r: "Psalm 145:3", t: 2,
    a: "Great is the LORD",
    d: ["Holy is our God", "The King of heaven", "The Lord of all"]
  },
  {
    b: "Psalms", r: "Psalm 145:8", t: 2,
    a: "full of compassion; slow to anger",
    d: ["glorious in holiness; fearful in praises", "righteous in judgment; holy in truth", "our rock of salvation; our strong tower"]
  },

  // Proverbs (15)
  {
    b: "Proverbs", r: "Proverbs 1:7", t: 2,
    a: "The fear of the LORD",
    d: ["The wisdom of God", "The holy statute", "The way of truth"]
  },
  {
    b: "Proverbs", r: "Proverbs 3:6", t: 1,
    a: "he shall direct thy paths",
    d: ["he shall make thee to prosper", "thy soul shall dwell at ease", "peace shall be in thy borders"]
  },
  {
    b: "Proverbs", r: "Proverbs 3:9", t: 2,
    a: "Honour the LORD with thy substance",
    d: ["Trust in the Almighty with all thy heart", "Keep the commandments of life with joy", "Offer sacrifices of praise unto the King"]
  },
  {
    b: "Proverbs", r: "Proverbs 4:7", t: 2,
    a: "Wisdom is the principal thing",
    d: ["Righteousness exalteth a nation", "The fear of God is true life", "Understanding is a wellspring"]
  },
  {
    b: "Proverbs", r: "Proverbs 4:18", t: 2,
    a: "as the shining light",
    d: ["as a watered garden", "like a fruitful tree", "as a crown of glory"]
  },
  {
    b: "Proverbs", r: "Proverbs 11:2", t: 3,
    a: "with the lowly is wisdom",
    d: ["with the upright is peace", "in the righteous is life", "before the humble is honor"]
  },
  {
    b: "Proverbs", r: "Proverbs 12:25", t: 3,
    a: "a good word maketh it glad",
    d: ["a joyful sound bringeth healing", "the counsel of peace is sweet", "a soft answer turneth wrath"]
  },
  {
    b: "Proverbs", r: "Proverbs 14:34", t: 2,
    a: "Righteousness exalteth a nation",
    d: ["Wisdom establisheth the throne", "The fear of God bringeth peace", "Mercy and truth preserve kings"]
  },
  {
    b: "Proverbs", r: "Proverbs 15:13", t: 3,
    a: "A merry heart maketh a cheerful countenance",
    d: ["A wise son heareth his father's instruction", "The soft tongue breaketh the bone of pride", "A faithful witness delivereth humble souls"]
  },
  {
    b: "Proverbs", r: "Proverbs 15:23", t: 3,
    a: "a word spoken in due season",
    d: ["the prayer of an upright heart", "a faithful friend in trouble", "the rebuke of a wise man"]
  },
  {
    b: "Proverbs", r: "Proverbs 16:7", t: 2,
    a: "please the LORD",
    d: ["keep his covenant", "walk in righteousness", "fear his judgment"]
  },
  {
    b: "Proverbs", r: "Proverbs 16:16", t: 3,
    a: "to get wisdom than gold!",
    d: ["to choose virtue than pearls!", "to love peace than great power!", "to seek truth than rubies!"]
  },
  {
    b: "Proverbs", r: "Proverbs 22:1", t: 2,
    a: "A good name",
    d: ["True wisdom", "Holy peace", "Pure honor"]
  },
  {
    b: "Proverbs", r: "Proverbs 25:11", t: 3,
    a: "apples of gold in pictures of silver",
    d: ["crowns of glory upon the head of kings", "precious jewels in a golden vessel", "honeycombs of sweet understanding"]
  },
  {
    b: "Proverbs", r: "Proverbs 31:30", t: 2,
    a: "a woman that feareth the LORD",
    d: ["the righteous that walk in truth", "a prudent servant of the house", "the humble that keep his word"]
  },

  // Ecclesiastes (8)
  {
    b: "Ecclesiastes", r: "Ecclesiastes 1:9", t: 3,
    a: "there is no new thing under the sun",
    d: ["all the days of man are vanity and sorrow", "a generation passeth away and another cometh", "the eye of man is never satisfied with seeing"]
  },
  {
    b: "Ecclesiastes", r: "Ecclesiastes 3:14", t: 3,
    a: "whatsoever God doeth, it shall be for ever",
    d: ["the counsel of the Almighty shall never fail", "his righteous works declare his eternal power", "the throne of his majesty endureth for ever"]
  },
  {
    b: "Ecclesiastes", r: "Ecclesiastes 4:9", t: 2,
    a: "Two are better than one",
    d: ["Wisdom is better than strength", "Peace is better than riches", "Patience is better than pride"]
  },
  {
    b: "Ecclesiastes", r: "Ecclesiastes 5:2", t: 2,
    a: "God is in heaven, and thou upon earth",
    d: ["The LORD is holy, and his counsel is deep", "His eyes behold the children of all men", "He searcheth the secret thoughts of hearts"]
  },
  {
    b: "Ecclesiastes", r: "Ecclesiastes 7:1", t: 2,
    a: "A good name is better than precious ointment",
    d: ["A quiet spirit is better than great possessions", "Wisdom is more profitable than houses and land", "The rebuke of the wise is better than songs"]
  },
  {
    b: "Ecclesiastes", r: "Ecclesiastes 7:8", t: 3,
    a: "the patient in spirit",
    d: ["the humble in heart", "the prudent in soul", "the upright in way"]
  },
  {
    b: "Ecclesiastes", r: "Ecclesiastes 9:11", t: 3,
    a: "the race is not to the swift",
    d: ["the kingdom is not to the proud", "the riches are not to the cruel", "the crown is not to the mighty"]
  },
  {
    b: "Ecclesiastes", r: "Ecclesiastes 12:7", t: 3,
    a: "the spirit shall return unto God",
    d: ["the soul shall dwell in peace", "the righteous shall see his face", "the memory shall never be moved"]
  },

  // Song of Solomon (5)
  {
    b: "Song of Solomon", r: "Song of Solomon 1:2", t: 2,
    a: "thy love is better than wine",
    d: ["thy beauty excelleth the roses", "thy name is as sweet incense", "thy voice bringeth gladness"]
  },
  {
    b: "Song of Solomon", r: "Song of Solomon 1:4", t: 3,
    a: "Draw me, we will run after thee",
    d: ["Lead me in the path of righteousness", "Show me the glory of thy presence", "Teach me the beauty of thy love"]
  },
  {
    b: "Song of Solomon", r: "Song of Solomon 2:10", t: 2,
    a: "Rise up, my love, my fair one",
    d: ["Awake, O daughter of Zion, and sing", "Turn again, my beloved, unto me", "Rejoice greatly, O bride of the King"]
  },
  {
    b: "Song of Solomon", r: "Song of Solomon 2:12", t: 3,
    a: "The flowers appear on the earth",
    d: ["The winter is past and gone", "The sweet morning dawneth", "The joy of heaven shineth"]
  },
  {
    b: "Song of Solomon", r: "Song of Solomon 2:16", t: 2,
    a: "he feedeth among the lilies",
    d: ["his love is sweet wine", "his countenance is as Lebanon", "his banner over me is love"]
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

console.log(`\nGroup 3 Results: Total: ${CANDIDATES.length}, Passed: ${passed}, Failed: ${failed}`);

if (failed === 0) {
  fs.writeFileSync('scripts/expansion/group3_wisdom.json', JSON.stringify(verifiedItems, null, 2));
  console.log('Successfully wrote scripts/expansion/group3_wisdom.json (59 items)');
}
