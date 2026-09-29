const fs = require('fs');
const { validateVerse } = require('./test_validator');
const QA = require('./verse-qa');
const { kjvMap, usedRefs, normalizeText } = require('./solve_util');

const CANDIDATES = [
  // Hebrews (10)
  {
    b: "Hebrews", r: "Hebrews 1:1", t: 2,
    a: "spake in time past unto the fathers",
    d: ["revealed his glory unto the ancient elders", "showed forth his salvation unto the patriarchs", "declared his holy covenant unto the people"]
  },
  {
    b: "Hebrews", r: "Hebrews 1:3", t: 2,
    a: "the brightness of his glory",
    d: ["the fountain of his mercy", "the mystery of his grace", "the beginning of his kingdom"]
  },
  {
    b: "Hebrews", r: "Hebrews 2:1", t: 2,
    a: "give the more earnest heed",
    d: ["hold fast the faithful word", "abide in the holy commandments", "stand firm in true righteousness"]
  },
  {
    b: "Hebrews", r: "Hebrews 2:3", t: 2,
    a: "if we neglect so great salvation",
    d: ["if we despise the heavenly calling", "if we turn from the holy covenant", "if we refuse the word of grace"]
  },
  {
    b: "Hebrews", r: "Hebrews 4:14", t: 2,
    a: "let us hold fast our profession",
    d: ["let us draw near with boldness", "let us keep the holy faith", "let us rejoice in hope of glory"]
  },
  {
    b: "Hebrews", r: "Hebrews 7:25", t: 2,
    a: "to make intercession for them",
    d: ["to give everlasting life unto all", "to establish them in his kingdom", "to cleanse their hearts from evil"]
  },
  {
    b: "Hebrews", r: "Hebrews 10:24", t: 2,
    a: "to provoke unto love and to good works",
    d: ["to establish peace and brotherly kindness", "to walk in holiness and true righteousness", "to keep the commandments of the Lord"]
  },
  {
    b: "Hebrews", r: "Hebrews 10:25", t: 2,
    a: "the assembling of ourselves together",
    d: ["the holy communion of the saints", "the fellowship of the righteous", "the gathering of the faithful"]
  },
  {
    b: "Hebrews", r: "Hebrews 13:15", t: 2,
    a: "the sacrifice of praise to God continually",
    d: ["the prayer of faith before the Lord always", "the offering of righteous deeds with joy", "the pure worship of our holy Father"]
  },
  {
    b: "Hebrews", r: "Hebrews 13:16", t: 2,
    a: "God is well pleased",
    d: ["the Lord is delighted", "our King is glorified", "the Father is praised"]
  },

  // James (6)
  {
    b: "James", r: "James 1:19", t: 1,
    a: "slow to speak, slow to wrath",
    d: ["patient in spirit, meek in mind", "gentle to all, harmless in heart", "sober in life, peaceful in speech"]
  },
  {
    b: "James", r: "James 1:21", t: 2,
    a: "receive with meekness the engrafted word",
    d: ["hear with gladness the message of truth", "keep with diligence the holy commandments", "follow with patience the heavenly counsel"]
  },
  {
    b: "James", r: "James 1:27", t: 1,
    a: "unspotted from the world",
    d: ["blameless before all men", "faultless in every way", "cleansed from every sin"]
  },
  {
    b: "James", r: "James 2:26", t: 1,
    a: "faith without works is dead",
    d: ["hope without patience is vain", "knowledge without love is nothing", "righteousness without truth faileth"]
  },
  {
    b: "James", r: "James 3:18", t: 2,
    a: "the fruit of righteousness",
    d: ["the blessing of eternal peace", "the wisdom of heavenly grace", "the reward of faithful obedience"]
  },
  {
    b: "James", r: "James 4:10", t: 2,
    a: "Humble yourselves in the sight of the Lord",
    d: ["Bow down before the majesty of God", "Seek ye the face of the Most High", "Walk meekly in the paths of wisdom"]
  },

  // 1 Peter (6)
  {
    b: "1 Peter", r: "1 Peter 1:15", t: 2,
    a: "holy in all manner of conversation",
    d: ["blameless in every work of faith", "righteous in all the ways of truth", "steadfast in the hope of glory"]
  },
  {
    b: "1 Peter", r: "1 Peter 1:22", t: 2,
    a: "love one another with a pure heart fervently",
    d: ["walk together in brotherly peace continually", "abide in the truth with all meekness of spirit", "serve the Lord Jesus Christ with great joy"]
  },
  {
    b: "1 Peter", r: "1 Peter 2:2", t: 2,
    a: "desire the sincere milk of the word",
    d: ["seek after the true bread of heaven", "receive the faithful promises of Christ", "drink of the living waters of life"]
  },
  {
    b: "1 Peter", r: "1 Peter 3:8", t: 2,
    a: "be ye all of one mind",
    d: ["walk ye in the holy truth", "stand ye fast in the faith", "abide ye in perfect peace"]
  },
  {
    b: "1 Peter", r: "1 Peter 4:8", t: 2,
    a: "charity shall cover the multitude of sins",
    d: ["righteousness shall deliver the soul from death", "grace shall establish your hearts in all truth", "mercy shall triumph over righteous judgment"]
  },
  {
    b: "1 Peter", r: "1 Peter 5:10", t: 2,
    a: "make you perfect, stablish, strengthen, settle you",
    d: ["guide your footsteps into everlasting life", "keep you blameless in holiness and peace", "preserve your souls until the heavenly kingdom"]
  },

  // 2 Peter (5)
  {
    b: "2 Peter", r: "2 Peter 1:2", t: 2,
    a: "Grace and peace be multiplied unto you",
    d: ["Mercy and truth be granted unto you", "Hope and comfort be with your spirits", "Righteousness and joy abide in you"]
  },
  {
    b: "2 Peter", r: "2 Peter 1:3", t: 2,
    a: "pertain unto life and godliness",
    d: ["lead unto righteousness and peace", "belong unto the heavenly calling", "bring forth everlasting salvation"]
  },
  {
    b: "2 Peter", r: "2 Peter 1:8", t: 2,
    a: "neither be barren nor unfruitful",
    d: ["never stumble nor turn aside", "not be shaken nor dismayed", "always walk in living light"]
  },
  {
    b: "2 Peter", r: "2 Peter 1:10", t: 2,
    a: "make your calling and election sure",
    d: ["keep the commandments of the Lord", "stand steadfast in the holy truth", "abide faithful unto the great end"]
  },
  {
    b: "2 Peter", r: "2 Peter 3:14", t: 2,
    a: "without spot, and blameless",
    d: ["in holiness and true peace", "established in righteous faith", "cleansed from every evil work"]
  },

  // 1 John (6)
  {
    b: "1 John", r: "1 John 2:17", t: 2,
    a: "abideth for ever",
    d: ["shall never perish", "hath eternal peace", "reigneth in life"]
  },
  {
    b: "1 John", r: "1 John 3:2", t: 2,
    a: "we shall be like him",
    d: ["we shall behold his face", "we shall reign with him", "we shall enter into rest"]
  },
  {
    b: "1 John", r: "1 John 3:23", t: 2,
    a: "love one another",
    d: ["walk in the light", "keep his sayings", "abide in his peace"]
  },
  {
    b: "1 John", r: "1 John 4:16", t: 2,
    a: "dwelleth in God, and God in him",
    d: ["abideth in the light of eternal life", "walketh in the holy truth of heaven", "hath the fellowship of the Holy Spirit"]
  },
  {
    b: "1 John", r: "1 John 5:12", t: 2,
    a: "He that hath the Son hath life",
    d: ["He that believeth the word shall endure", "Whosoever loveth the Lord hath peace", "He that followeth the light hath joy"]
  },
  {
    b: "1 John", r: "1 John 5:13", t: 2,
    a: "ye have eternal life",
    d: ["ye are born of God", "your sins are forgiven", "ye know the true God"]
  },

  // 2 John (3)
  {
    b: "2 John", r: "2 John 1:2", t: 2,
    a: "shall be with us for ever",
    d: ["abideth in our hearts always", "guideth our feet into peace", "comforteth our souls continually"]
  },
  {
    b: "2 John", r: "2 John 1:5", t: 2,
    a: "that we love one another",
    d: ["that ye walk in truth", "that ye keep his law", "that we abide in peace"]
  },
  {
    b: "2 John", r: "2 John 1:7", t: 2,
    a: "Jesus Christ is come in the flesh",
    d: ["the Lord Jesus is the holy Son of God", "the eternal Word was made known unto men", "the Saviour hath redeemed us from our sins"]
  },

  // 3 John (3)
  {
    b: "3 John", r: "3 John 1:1", t: 2,
    a: "whom I love in the truth",
    d: ["whom I greet in the Lord", "who abideth in holy peace", "who walketh in all charity"]
  },
  {
    b: "3 John", r: "3 John 1:3", t: 2,
    a: "even as thou walkest in the truth",
    d: ["because thou art faithful in all things", "seeing thou lovest the brethren with pure heart", "forasmuch as thou keepest the holy word"]
  },
  {
    b: "3 John", r: "3 John 1:12", t: 2,
    a: "good report of all men",
    d: ["great honor among the saints", "praise from all the brethren", "good testimony in the church"]
  },

  // Jude (4)
  {
    b: "Jude", r: "Jude 1:1", t: 2,
    a: "preserved in Jesus Christ",
    d: ["sealed with the Holy Spirit", "called unto eternal life", "established in the faith"]
  },
  {
    b: "Jude", r: "Jude 1:2", t: 2,
    a: "peace, and love, be multiplied",
    d: ["mercy, and truth, be with you", "grace, and hope, abound in you", "joy, and light, fill your hearts"]
  },
  {
    b: "Jude", r: "Jude 1:18", t: 2,
    a: "mockers in the last time",
    d: ["false teachers in the world", "ungodly men full of deceit", "deceivers walking in darkness"]
  },
  {
    b: "Jude", r: "Jude 1:23", t: 2,
    a: "pulling them out of the fire",
    d: ["turning them from every evil way", "leading them into righteous truth", "delivering them from utter ruin"]
  },

  // Revelation (10)
  {
    b: "Revelation", r: "Revelation 1:3", t: 2,
    a: "the words of this prophecy",
    d: ["the voice of the Lord", "the counsel of the Spirit", "the gospel of the kingdom"]
  },
  {
    b: "Revelation", r: "Revelation 1:7", t: 2,
    a: "every eye shall see him",
    d: ["all the nations shall fear", "the heavens shall depart", "the saints shall rejoice"]
  },
  {
    b: "Revelation", r: "Revelation 1:17", t: 2,
    a: "I am the first and the last",
    d: ["I am the root of David", "I am the light of the world", "I am the prince of life"]
  },
  {
    b: "Revelation", r: "Revelation 4:8", t: 1,
    a: "Holy, holy, holy, Lord God Almighty",
    d: ["Great, great, great, King of eternity", "Worthy, worthy, worthy, Lord of all hosts", "Righteous, righteous, righteous, God Most High"]
  },
  {
    b: "Revelation", r: "Revelation 7:12", t: 2,
    a: "Blessing, and glory, and wisdom, and thanksgiving",
    d: ["Salvation, and majesty, and peace, and righteousness", "Praise, and adoration, and dominion, and truth", "Kingdom, and eternal grace, and mercy, and love"]
  },
  {
    b: "Revelation", r: "Revelation 14:13", t: 2,
    a: "that they may rest from their labours",
    d: ["for they shall enter into eternal glory", "because their reward is with the Most High", "and they shall receive the crown of life"]
  },
  {
    b: "Revelation", r: "Revelation 15:3", t: 2,
    a: "just and true are thy ways",
    d: ["holy and righteous are thy judgments", "great and mighty are thy wonders", "glorious and fearful are thy deeds"]
  },
  {
    b: "Revelation", r: "Revelation 19:6", t: 2,
    a: "Alleluia: for the Lord God omnipotent reigneth",
    d: ["Hosanna: for the day of righteous salvation is come", "Amen: for the eternal Lamb of God hath conquered", "Glory: for the sovereign Creator of heaven is exalted"]
  },
  {
    b: "Revelation", r: "Revelation 21:3", t: 2,
    a: "the tabernacle of God is with men",
    d: ["the kingdom of our Lord is established", "the dwelling of the Holy One is revealed", "the glorious city cometh down in peace"]
  },
  {
    b: "Revelation", r: "Revelation 21:6", t: 2,
    a: "I am Alpha and Omega",
    d: ["I am the true Light", "I am the Lord of glory", "I am the Prince of peace"]
  }
];

function buildVerseItem(c) {
  const rawTxt = kjvMap.get(c.r);
  if (!rawTxt) {
    return { ok: false, error: 'Verse not found in KJV map: ' + c.r };
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

console.log(`\nGroup 8 Results: Total: ${CANDIDATES.length}, Passed: ${passed}, Failed: ${failed}`);

if (failed === 0) {
  fs.writeFileSync('scripts/expansion/group8_general_revelation.json', JSON.stringify(verifiedItems, null, 2));
  console.log('Successfully wrote scripts/expansion/group8_general_revelation.json (53 items)');
}
