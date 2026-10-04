const fs = require('fs');
const { validateVerse } = require('./test_validator');
const { kjvMap, normalizeText } = require('./solve_util');

const CANDIDATES = [
  // Matthew (12)
  {
    b: "Matthew", r: "Matthew 3:17", t: 1,
    a: "This is my beloved Son",
    d: ["Behold the Lamb of God", "He is the King of Israel", "Thou art the chosen One"]
  },
  {
    b: "Matthew", r: "Matthew 4:19", t: 1,
    a: "fishers of men",
    d: ["servants of truth", "heralds of peace", "preachers of faith"]
  },
  {
    b: "Matthew", r: "Matthew 5:4", t: 1,
    a: "they shall be comforted",
    d: ["they shall inherit glory", "their joy shall be full", "great is their reward"]
  },
  {
    b: "Matthew", r: "Matthew 5:5", t: 1,
    a: "they shall inherit the earth",
    d: ["theirs is the kingdom of heaven", "they shall obtain great mercy", "they shall see the holy God"]
  },
  {
    b: "Matthew", r: "Matthew 5:7", t: 1,
    a: "they shall obtain mercy",
    d: ["they shall see God", "peace shall be theirs", "they shall find rest"]
  },
  {
    b: "Matthew", r: "Matthew 6:10", t: 1,
    a: "Thy kingdom come",
    d: ["Thy name be praised", "Thy power appear", "Thy glory shine"]
  },
  {
    b: "Matthew", r: "Matthew 9:13", t: 2,
    a: "I will have mercy, and not sacrifice",
    d: ["the humble in spirit shall find life", "offer pure thanksgiving unto God", "keep the commandments of the law"]
  },
  {
    b: "Matthew", r: "Matthew 10:32", t: 2,
    a: "confess me before men",
    d: ["keep my holy words", "walk in my truth", "bear witness of me"]
  },
  {
    b: "Matthew", r: "Matthew 16:16", t: 1,
    a: "the Son of the living God",
    d: ["the King of all nations", "the prophet of the Highest", "the Redeemer of our souls"]
  },
  {
    b: "Matthew", r: "Matthew 21:22", t: 2,
    a: "believing, ye shall receive",
    d: ["asking, it shall be given", "in faith, ye shall prosper", "in prayer, ye shall find"]
  },
  {
    b: "Matthew", r: "Matthew 28:18", t: 1,
    a: "All power is given unto me",
    d: ["The glory of the Father shineth", "The kingdom of heaven is at hand", "The everlasting truth is revealed"]
  },
  {
    b: "Matthew", r: "Matthew 28:20", t: 1,
    a: "I am with you alway",
    d: ["my peace I give unto you", "my grace shall be sufficient", "my spirit will lead you"]
  },

  // Mark (10)
  {
    b: "Mark", r: "Mark 1:1", t: 1,
    a: "the Son of God",
    d: ["the King of Israel", "the holy prophet", "the Lord from heaven"]
  },
  {
    b: "Mark", r: "Mark 2:5", t: 1,
    a: "thy sins be forgiven thee",
    d: ["thy faith hath saved thee", "thy soul shall have peace", "arise, and walk in joy"]
  },
  {
    b: "Mark", r: "Mark 3:35", t: 2,
    a: "shall do the will of God",
    d: ["heareth my holy words", "walketh in all my ways", "loveth the true light"]
  },
  {
    b: "Mark", r: "Mark 4:39", t: 1,
    a: "there was a great calm",
    d: ["the waves were made quiet", "the storm was turned away", "all his disciples marvelled"]
  },
  {
    b: "Mark", r: "Mark 10:52", t: 1,
    a: "thy faith hath made thee whole",
    d: ["thy prayer is heard in heaven", "go in the peace of the Lord", "thy sins are forgiven thee"]
  },
  {
    b: "Mark", r: "Mark 12:32", t: 1,
    a: "there is one God",
    d: ["the Lord is King", "God is righteous", "holy is his name"]
  },
  {
    b: "Mark", r: "Mark 12:34", t: 2,
    a: "not far from the kingdom of God",
    d: ["established in all righteous truth", "an heir of the heavenly promise", "walking in the light of the Lord"]
  },
  {
    b: "Mark", r: "Mark 13:31", t: 1,
    a: "my words shall not pass away",
    d: ["the truth of God shall endure", "his holy throne is for ever", "his righteous counsel standeth"]
  },
  {
    b: "Mark", r: "Mark 16:16", t: 1,
    a: "believeth and is baptized shall be saved",
    d: ["keepeth my holy commandments shall live", "followeth in my pathway shall find rest", "confesseth my name shall see the Father"]
  },
  {
    b: "Mark", r: "Mark 2:28", t: 1,
    a: "Lord also of the sabbath",
    d: ["King of all the holy earth", "Judge of both quick and dead", "Savior of all that believe"]
  },

  // Luke (12)
  {
    b: "Luke", r: "Luke 1:28", t: 1,
    a: "the Lord is with thee",
    d: ["thy faith is great", "fear not the day", "rejoice in hope"]
  },
  {
    b: "Luke", r: "Luke 1:46", t: 1,
    a: "My soul doth magnify the Lord",
    d: ["My heart rejoiceth in my God", "My tongue shall sing his praise", "My lips shall give thanksgiving"]
  },
  {
    b: "Luke", r: "Luke 1:68", t: 2,
    a: "visited and redeemed his people",
    d: ["shown great mercy unto Israel", "established his covenant forever", "lifted up the horn of salvation"]
  },
  {
    b: "Luke", r: "Luke 1:78", t: 2,
    a: "the dayspring from on high hath visited us",
    d: ["the glory of the Father hath appeared", "the arm of the Lord hath brought peace", "the everlasting light hath dawned on all"]
  },
  {
    b: "Luke", r: "Luke 2:10", t: 1,
    a: "good tidings of great joy",
    d: ["the peace of the kingdom", "the salvation of our God", "a holy light from heaven"]
  },
  {
    b: "Luke", r: "Luke 6:36", t: 2,
    a: "as your Father also is merciful",
    d: ["even as the Lord hath forgiven you", "that ye may be children of light", "according to his holy commandment"]
  },
  {
    b: "Luke", r: "Luke 7:50", t: 1,
    a: "go in peace",
    d: ["sin no more", "fear not now", "rejoice today"]
  },
  {
    b: "Luke", r: "Luke 10:2", t: 2,
    a: "the labourers are few",
    d: ["the fields are white", "the time is at hand", "the harvest is great"]
  },
  {
    b: "Luke", r: "Luke 10:20", t: 2,
    a: "your names are written in heaven",
    d: ["the kingdom of God is within you", "ye have believed on the true light", "great is your reward in eternity"]
  },
  {
    b: "Luke", r: "Luke 11:28", t: 2,
    a: "hear the word of God, and keep it",
    d: ["walk in his truth and do his will", "believe on the Son of the Highest", "worship the Father in the spirit"]
  },
  {
    b: "Luke", r: "Luke 15:10", t: 2,
    a: "in the presence of the angels of God",
    d: ["before the throne of his everlasting kingdom", "among all the hosts of the heavenly spirits", "unto the ends of the earth with rejoicing"]
  },
  {
    b: "Luke", r: "Luke 24:49", t: 2,
    a: "with power from on high",
    d: ["with the holy anointing", "by the heavenly spirit", "through the true gospel"]
  },

  // John (12)
  {
    b: "John", r: "John 1:4", t: 1,
    a: "the light of men",
    d: ["the hope of all", "the life eternal", "the way of truth"]
  },
  {
    b: "John", r: "John 1:5", t: 2,
    a: "the light shineth in darkness",
    d: ["the truth is revealed to all", "his glorious glory appeared", "the day of salvation is come"]
  },
  {
    b: "John", r: "John 1:9", t: 2,
    a: "That was the true Light",
    d: ["He was the holy Prophet", "In him was life eternal", "He is the Lord of glory"]
  },
  {
    b: "John", r: "John 1:12", t: 1,
    a: "power to become the sons of God",
    d: ["grace to enter the heavenly rest", "faith to inherit everlasting life", "peace to dwell before his throne"]
  },
  {
    b: "John", r: "John 1:17", t: 1,
    a: "grace and truth came by Jesus Christ",
    d: ["eternal life was manifested unto us", "the glory of the Father was revealed", "remission of sins was preached to all"]
  },
  {
    b: "John", r: "John 1:18", t: 2,
    a: "in the bosom of the Father",
    d: ["at the right hand of power", "before the foundation of all", "full of holy grace and truth"]
  },
  {
    b: "John", r: "John 4:14", t: 1,
    a: "springing up into everlasting life",
    d: ["flowing unto all the thirsty nations", "bringing forth peace and righteousness", "giving joy unto all the humble souls"]
  },
  {
    b: "John", r: "John 6:68", t: 1,
    a: "thou hast the words of eternal life",
    d: ["thou art the Christ the Son of God", "in thee alone do our souls find rest", "thou art the true bread from heaven"]
  },
  {
    b: "John", r: "John 8:36", t: 1,
    a: "ye shall be free indeed",
    d: ["ye shall have life eternal", "ye shall know the true God", "peace shall dwell with you"]
  },
  {
    b: "John", r: "John 12:32", t: 1,
    a: "will draw all men unto me",
    d: ["shall be glorified in heaven", "will give my life for the sheep", "shall overcome the whole world"]
  },
  {
    b: "John", r: "John 14:15", t: 1,
    a: "keep my commandments",
    d: ["follow my footsteps", "walk in my pathway", "believe on my word"]
  },
  {
    b: "John", r: "John 15:4", t: 1,
    a: "Abide in me, and I in you",
    d: ["Walk in love, as brethren", "Cleave to me with all joy", "Love the Lord in sincerity"]
  },

  // Acts (10)
  {
    b: "Acts", r: "Acts 2:4", t: 1,
    a: "filled with the Holy Ghost",
    d: ["gathered in one accord", "endued with great faith", "rejoicing in the Lord"]
  },
  {
    b: "Acts", r: "Acts 2:32", t: 2,
    a: "whereof we all are witnesses",
    d: ["according to the scriptures", "by his mighty outstretched arm", "in the presence of the people"]
  },
  {
    b: "Acts", r: "Acts 2:42", t: 2,
    a: "in the apostles' doctrine and fellowship",
    d: ["in prayer and holy praise unto God", "with great joy and simplicity of heart", "according to the commandment of Christ"]
  },
  {
    b: "Acts", r: "Acts 3:6", t: 1,
    a: "Silver and gold have I none",
    d: ["Earthly riches I possess not", "Gifts of this world I bring not", "Houses and land I offer not"]
  },
  {
    b: "Acts", r: "Acts 5:32", t: 2,
    a: "we are his witnesses of these things",
    d: ["we preach Christ crucified and risen", "the Holy Ghost hath spoken unto us", "we declare the counsel of God to all"]
  },
  {
    b: "Acts", r: "Acts 7:56", t: 2,
    a: "standing on the right hand of God",
    d: ["sitting upon the throne of his glory", "crowned with majesty in the heavens", "surrounded with the host of angels"]
  },
  {
    b: "Acts", r: "Acts 13:38", t: 2,
    a: "the forgiveness of sins",
    d: ["the kingdom of heaven", "the promise of the Spirit", "the gift of eternal life"]
  },
  {
    b: "Acts", r: "Acts 14:22", t: 2,
    a: "enter into the kingdom of God",
    d: ["inherit the heavenly reward", "obtain the crown of life", "stand before the true King"]
  },
  {
    b: "Acts", r: "Acts 18:10", t: 2,
    a: "I have much people in this city",
    d: ["my holy gospel shall be preached", "the Lord of glory will defend thee", "the word of truth shall not fail"]
  },
  {
    b: "Acts", r: "Acts 26:18", t: 2,
    a: "to turn them from darkness to light",
    d: ["to preach the glorious gospel to all", "to declare the holy truth of heaven", "to open the ancient gates of Zion"]
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

console.log(`\nGroup 6 Results: Total: ${CANDIDATES.length}, Passed: ${passed}, Failed: ${failed}`);

if (failed === 0) {
  fs.writeFileSync('scripts/expansion/group6_gospels_acts.json', JSON.stringify(verifiedItems, null, 2));
  console.log('Successfully wrote scripts/expansion/group6_gospels_acts.json (56 items)');
}
