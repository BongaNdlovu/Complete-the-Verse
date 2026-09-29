const fs = require('fs');
const { validateVerse } = require('./test_validator');
const QA = require('./verse-qa');
const { kjvMap, usedRefs, normalizeText } = require('./solve_util');

const CANDIDATES = [
  // Romans (10)
  {
    b: "Romans", r: "Romans 1:17", t: 2,
    a: "The just shall live by faith",
    d: ["The law of God is holy and true", "The gift of grace is eternal life", "The glory of the Lord shall appear"]
  },
  {
    b: "Romans", r: "Romans 5:5", t: 2,
    a: "the love of God",
    d: ["the peace of Christ", "the light of truth", "the hope of glory"]
  },
  {
    b: "Romans", r: "Romans 8:16", t: 2,
    a: "we are the children of God",
    d: ["our redemption draweth nigh", "he hath forgiven all our sins", "we shall reign with him forever"]
  },
  {
    b: "Romans", r: "Romans 8:37", t: 1,
    a: "more than conquerors through him that loved us",
    d: ["heirs of the kingdom of everlasting glory", "partakers of the holy heavenly calling", "justified by faith in the blood of Christ"]
  },
  {
    b: "Romans", r: "Romans 8:38", t: 2,
    a: "neither death, nor life",
    d: ["neither tribulations, nor pain", "neither height, nor depth", "neither principalities, nor powers"]
  },
  {
    b: "Romans", r: "Romans 10:10", t: 2,
    a: "confession is made unto salvation",
    d: ["the heart is cleansed from all sin", "we receive the promised Holy Spirit", "grace is multiplied unto all peace"]
  },
  {
    b: "Romans", r: "Romans 12:9", t: 2,
    a: "cleave to that which is good",
    d: ["walk in the holy commandments", "love one another with pure heart", "offer your bodies a sacrifice"]
  },
  {
    b: "Romans", r: "Romans 12:12", t: 2,
    a: "Rejoicing in hope; patient in tribulation",
    d: ["Standing fast in faith; steadfast in truth", "Walking in pure love; fervent in prayer", "Abounding in great peace; holy in heart"]
  },
  {
    b: "Romans", r: "Romans 12:18", t: 2,
    a: "live peaceably with all men",
    d: ["walk uprightly in the truth", "keep the unity of the Spirit", "do good unto the brethren"]
  },
  {
    b: "Romans", r: "Romans 16:20", t: 2,
    a: "shall bruise Satan under your feet shortly",
    d: ["shall establish your hearts in all truth", "shall give you peace through Jesus Christ", "shall deliver your souls from all evil"]
  },

  // 1 Corinthians (10)
  {
    b: "1 Corinthians", r: "1 Corinthians 1:9", t: 2,
    a: "God is faithful",
    d: ["Christ is risen", "The Lord reigneth", "Grace is given"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 1:30", t: 2,
    a: "wisdom, and righteousness, and sanctification",
    d: ["glory, and honour, and eternal majesty", "grace, and peace, and holy lovingkindness", "truth, and power, and heavenly salvation"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 3:11", t: 2,
    a: "which is Jesus Christ",
    d: ["the Lord of all glory", "the rock of our salvation", "the holy Son of God"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 6:20", t: 2,
    a: "glorify God in your body",
    d: ["walk in the light of truth", "keep the commandments of life", "offer pure spiritual praise"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 12:27", t: 1,
    a: "the body of Christ",
    d: ["the temple of God", "the flock of peace", "the heirs of life"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 13:7", t: 2,
    a: "Beareth all things, believeth all things",
    d: ["Seeketh not her own, thinketh no evil", "Rejoiceth not in sin, loveth the truth", "Endureth with joy, abideth in holy peace"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 15:3", t: 2,
    a: "Christ died for our sins",
    d: ["the Lord was raised in power", "he was delivered for our peace", "he gave his life for the world"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 15:4", t: 2,
    a: "he rose again the third day",
    d: ["he ascended into the heavens", "he sat down on the right hand", "he shall come again in glory"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 15:20", t: 2,
    a: "now is Christ risen from the dead",
    d: ["the day of eternal redemption is come", "the victory over death is accomplished", "the glorious kingdom of heaven is at hand"]
  },
  {
    b: "1 Corinthians", r: "1 Corinthians 15:54", t: 2,
    a: "Death is swallowed up in victory",
    d: ["The corruptible hath put on life", "The saints shall reign for evermore", "The kingdom of darkness is destroyed"]
  },

  // 2 Corinthians (6)
  {
    b: "2 Corinthians", r: "2 Corinthians 1:4", t: 2,
    a: "Who comforteth us in all our tribulation",
    d: ["Who delivereth our souls from eternal death", "Who forgiveth all our secret iniquities", "Who leadeth his chosen sheep with peace"]
  },
  {
    b: "2 Corinthians", r: "2 Corinthians 3:17", t: 2,
    a: "there is liberty",
    d: ["there is peace", "the Lord reigneth", "truth shall abide"]
  },
  {
    b: "2 Corinthians", r: "2 Corinthians 4:7", t: 2,
    a: "this treasure in earthen vessels",
    d: ["the holy light in our spirits", "the heavenly hope in our souls", "the glorious gospel in our hearts"]
  },
  {
    b: "2 Corinthians", r: "2 Corinthians 4:17", t: 2,
    a: "our light affliction",
    d: ["our earthly trial", "this present sorrow", "our heavy burden"]
  },
  {
    b: "2 Corinthians", r: "2 Corinthians 5:20", t: 2,
    a: "we are ambassadors for Christ",
    d: ["we preach the word of truth", "we seek the heavenly kingdom", "we walk in uprightness of heart"]
  },
  {
    b: "2 Corinthians", r: "2 Corinthians 13:14", t: 1,
    a: "the communion of the Holy Ghost",
    d: ["the everlasting peace of God", "the glorious hope of salvation", "the heavenly joy of our Lord"]
  },

  // Galatians (6)
  {
    b: "Galatians", r: "Galatians 4:7", t: 2,
    a: "no more a servant, but a son",
    d: ["heirs of the kingdom of God", "partakers of the holy calling", "bought with a great price"]
  },
  {
    b: "Galatians", r: "Galatians 5:13", t: 2,
    a: "by love serve one another",
    d: ["walk in the holy commandments", "keep the unity of the brethren", "seek the kingdom of the Lord"]
  },
  {
    b: "Galatians", r: "Galatians 5:23", t: 2,
    a: "against such there is no law",
    d: ["in these things is great peace", "these are the fruits of light", "such shall inherit the kingdom"]
  },
  {
    b: "Galatians", r: "Galatians 6:7", t: 1,
    a: "that shall he also reap",
    d: ["he shall find his reward", "his soul shall be judged", "he shall inherit life"]
  },
  {
    b: "Galatians", r: "Galatians 1:4", t: 2,
    a: "Who gave himself for our sins",
    d: ["Who redeemed us from all iniquity", "Who hath called us unto his kingdom", "Who was delivered for our offenses"]
  },
  {
    b: "Galatians", r: "Galatians 6:14", t: 2,
    a: "in the cross of our Lord Jesus Christ",
    d: ["in the glorious heavenly promise of God", "in the rich mercy of our living Redeemer", "in the eternal throne of righteous truth"]
  },

  // Ephesians (8)
  {
    b: "Ephesians", r: "Ephesians 1:13", t: 2,
    a: "sealed with that holy Spirit of promise",
    d: ["cleansed by the precious blood of the Lamb", "justified through faith in his holy name", "sanctified unto the everlasting inheritance"]
  },
  {
    b: "Ephesians", r: "Ephesians 2:9", t: 1,
    a: "Not of works, lest any man should boast",
    d: ["According to the purpose of his holy will", "By the free gift of everlasting righteousness", "Through the operation of the Holy Spirit of God"]
  },
  {
    b: "Ephesians", r: "Ephesians 2:14", t: 2,
    a: "For he is our peace",
    d: ["He is the true light", "God is our salvation", "He hath redeemed us"]
  },
  {
    b: "Ephesians", r: "Ephesians 2:19", t: 2,
    a: "fellowcitizens with the saints",
    d: ["partakers of the holy promise", "heirs of the heavenly kingdom", "children of the living God"]
  },
  {
    b: "Ephesians", r: "Ephesians 3:19", t: 2,
    a: "the love of Christ, which passeth knowledge",
    d: ["the glorious mystery of the gospel of God", "the heavenly peace that keepeth all hearts", "the unsearchable riches of his holy grace"]
  },
  {
    b: "Ephesians", r: "Ephesians 4:1", t: 2,
    a: "walk worthy of the vocation",
    d: ["keep the unity of the Spirit", "stand fast in holy righteousness", "abound in all truth and love"]
  },
  {
    b: "Ephesians", r: "Ephesians 4:3", t: 2,
    a: "the unity of the Spirit",
    d: ["the fellowship of saints", "the righteousness of faith", "the peace of Jesus Christ"]
  },
  {
    b: "Ephesians", r: "Ephesians 5:1", t: 2,
    a: "followers of God, as dear children",
    d: ["servants of Christ in all sincerity", "heirs of the kingdom of heaven", "children of the glorious light"]
  },

  // Philippians (6)
  {
    b: "Philippians", r: "Philippians 1:3", t: 2,
    a: "upon every remembrance of you",
    d: ["in all my holy prayers to God", "for your fellowship in the gospel", "with thanksgiving for your love"]
  },
  {
    b: "Philippians", r: "Philippians 2:9", t: 2,
    a: "a name which is above every name",
    d: ["all power in the heavens and the earth", "the everlasting throne of righteousness", "the glory of the Father from beginning"]
  },
  {
    b: "Philippians", r: "Philippians 3:8", t: 2,
    a: "the excellency of the knowledge of Christ Jesus",
    d: ["the glorious hope of our heavenly calling above", "the unsearchable riches of the holy covenant", "the eternal inheritance prepared for all saints"]
  },
  {
    b: "Philippians", r: "Philippians 3:13", t: 2,
    a: "forgetting those things which are behind",
    d: ["pressing toward the mark of our high calling", "laying aside every weight of sin that doth beset", "looking unto the glorious author of our faith"]
  },
  {
    b: "Philippians", r: "Philippians 4:4", t: 1,
    a: "Rejoice in the Lord alway",
    d: ["Give thanks unto our God", "Praise the King of glory", "Sing praises with the heart"]
  },
  {
    b: "Philippians", r: "Philippians 4:19", t: 1,
    a: "shall supply all your need",
    d: ["will establish all your ways", "shall preserve your spirit", "will give you perfect peace"]
  },

  // Colossians (6)
  {
    b: "Colossians", r: "Colossians 1:15", t: 2,
    a: "the image of the invisible God",
    d: ["the prince of the heavenly host", "the author of eternal salvation", "the righteous judge of all men"]
  },
  {
    b: "Colossians", r: "Colossians 1:18", t: 2,
    a: "the head of the body, the church",
    d: ["the foundation of our holy faith", "the prince of everlasting peace", "the mediator of the new covenant"]
  },
  {
    b: "Colossians", r: "Colossians 1:27", t: 2,
    a: "Christ in you, the hope of glory",
    d: ["the word of life, which is eternal", "the holy spirit of promise in power", "the glorious riches of his grace"]
  },
  {
    b: "Colossians", r: "Colossians 3:1", t: 2,
    a: "seek those things which are above",
    d: ["walk in the light of his holy truth", "put on the new man in righteousness", "cleave unto the Lord with all your heart"]
  },
  {
    b: "Colossians", r: "Colossians 3:15", t: 2,
    a: "the peace of God",
    d: ["the word of truth", "the holy spirit", "the love of Christ"]
  },
  {
    b: "Colossians", r: "Colossians 3:17", t: 2,
    a: "in the name of the Lord Jesus",
    d: ["before the presence of our God", "according to all the holy law", "unto the praise of the Father"]
  },

  // 1 Thessalonians (6)
  {
    b: "1 Thessalonians", r: "1 Thessalonians 1:3", t: 2,
    a: "your work of faith, and labour of love",
    d: ["your fellowship in the holy gospel of peace", "your patience in all trials and tribulations", "your righteous walk before the living God"]
  },
  {
    b: "1 Thessalonians", r: "1 Thessalonians 1:9", t: 2,
    a: "to serve the living and true God",
    d: ["to keep the commandments of Jesus", "to walk in the path of righteousness", "to wait for the heavenly kingdom"]
  },
  {
    b: "1 Thessalonians", r: "1 Thessalonians 3:12", t: 2,
    a: "increase and abound in love",
    d: ["walk worthy of the Lord God", "stand fast in the holy truth", "cleave unto all righteousness"]
  },
  {
    b: "1 Thessalonians", r: "1 Thessalonians 4:17", t: 2,
    a: "shall we ever be with the Lord",
    d: ["shall our joy be full for ever", "shall all sorrow pass away", "we shall reign in righteousness"]
  },
  {
    b: "1 Thessalonians", r: "1 Thessalonians 5:16", t: 1,
    a: "Rejoice evermore",
    d: ["Pray without fear", "Give thanks always", "Stand fast in hope"]
  },
  {
    b: "1 Thessalonians", r: "1 Thessalonians 5:25", t: 1,
    a: "Brethren, pray for us",
    d: ["Walk in holy peace", "Serve the Lord alway", "Fear not the wicked"]
  },

  // 2 Thessalonians (5)
  {
    b: "2 Thessalonians", r: "2 Thessalonians 1:3", t: 3,
    a: "your faith groweth exceedingly",
    d: ["ye walk worthy of the Lord", "your love aboundeth in all", "ye stand fast in the truth"]
  },
  {
    b: "2 Thessalonians", r: "2 Thessalonians 1:12", t: 2,
    a: "may be glorified in you",
    d: ["shall be revealed on high", "will give you perfect peace", "doth rule in all your hearts"]
  },
  {
    b: "2 Thessalonians", r: "2 Thessalonians 2:14", t: 2,
    a: "the glory of our Lord Jesus Christ",
    d: ["the eternal kingdom of our Father", "the heavenly inheritance of saints", "the holy promise of his coming"]
  },
  {
    b: "2 Thessalonians", r: "2 Thessalonians 3:5", t: 2,
    a: "into the love of God",
    d: ["in the path of peace", "unto the holy kingdom", "through the true faith"]
  },
  {
    b: "2 Thessalonians", r: "2 Thessalonians 3:18", t: 1,
    a: "be with you all. Amen",
    d: ["abide with your spirit", "give you holy peace", "dwell in your hearts"]
  },

  // 1 Timothy (6)
  {
    b: "1 Timothy", r: "1 Timothy 1:2", t: 2,
    a: "Grace, mercy, and peace",
    d: ["Faith, and holy love", "Glory, and great praise", "Truth, and perfect joy"]
  },
  {
    b: "1 Timothy", r: "1 Timothy 1:14", t: 2,
    a: "exceeding abundant with faith and love",
    d: ["manifested unto all them that believe", "full of heavenly peace and righteous joy", "established according to the holy promise"]
  },
  {
    b: "1 Timothy", r: "1 Timothy 1:17", t: 1,
    a: "the King eternal, immortal, invisible",
    d: ["the Lord of lords, and maker of all", "the righteous judge, holy and true", "the rock of ages, glorious on high"]
  },
  {
    b: "1 Timothy", r: "1 Timothy 2:3", t: 2,
    a: "good and acceptable in the sight of God",
    d: ["the true commandment of the holy gospel", "well pleasing before our heavenly Father", "righteous according to the ancient promise"]
  },
  {
    b: "1 Timothy", r: "1 Timothy 2:4", t: 2,
    a: "to come unto the knowledge of the truth",
    d: ["to enter into the glorious rest of heaven", "to receive the forgiveness of their sins", "to walk in the light of his holy presence"]
  },
  {
    b: "1 Timothy", r: "1 Timothy 4:10", t: 2,
    a: "we trust in the living God",
    d: ["we seek the heavenly kingdom", "we preach the word of truth", "we walk by faith and peace"]
  },

  // 2 Timothy (6)
  {
    b: "2 Timothy", r: "2 Timothy 1:6", t: 2,
    a: "stir up the gift of God",
    d: ["walk in the light of truth", "keep the holy commandment", "stand fast in the gospel"]
  },
  {
    b: "2 Timothy", r: "2 Timothy 1:9", t: 2,
    a: "called us with an holy calling",
    d: ["justified us by his free grace", "redeemed us from all iniquity", "sealed us with the Holy Spirit"]
  },
  {
    b: "2 Timothy", r: "2 Timothy 2:1", t: 2,
    a: "be strong in the grace",
    d: ["walk in the holy faith", "cleave unto all truth", "stand in the light of God"]
  },
  {
    b: "2 Timothy", r: "2 Timothy 2:11", t: 2,
    a: "we shall also live with him",
    d: ["our souls shall dwell at ease", "we shall reign in his kingdom", "we shall inherit life eternal"]
  },
  {
    b: "2 Timothy", r: "2 Timothy 2:24", t: 2,
    a: "gentle unto all men",
    d: ["blameless in the faith", "holy before the Lord", "righteous in your way"]
  },
  {
    b: "2 Timothy", r: "2 Timothy 4:2", t: 1,
    a: "Preach the word; be instant in season",
    d: ["Fight the good fight of faith in love", "Stand fast in the liberty of Christ", "Walk worthy of the holy calling of God"]
  },

  // Titus (5)
  {
    b: "Titus", r: "Titus 1:15", t: 2,
    a: "all things are pure",
    d: ["all grace is given", "truth shall abide", "peace is restored"]
  },
  {
    b: "Titus", r: "Titus 2:1", t: 2,
    a: "the things which become sound doctrine",
    d: ["the holy words of the new covenant", "the glorious gospel of our salvation", "the righteous statutes of our God"]
  },
  {
    b: "Titus", r: "Titus 2:14", t: 2,
    a: "a peculiar people, zealous of good works",
    d: ["a holy priesthood, offering spiritual praise", "the chosen flock of the heavenly Shepherd", "an elect generation, walking in all truth"]
  },
  {
    b: "Titus", r: "Titus 3:1", t: 2,
    a: "ready to every good work",
    d: ["established in holy faith", "zealous of righteous peace", "walking in all his truth"]
  },
  {
    b: "Titus", r: "Titus 3:8", t: 2,
    a: "careful to maintain good works",
    d: ["steadfast in the holy calling", "blameless before all the saints", "diligent in prayer and fasting"]
  },

  // Philemon (4)
  {
    b: "Philemon", r: "Philemon 1:3", t: 2,
    a: "Grace to you, and peace",
    d: ["Mercy, and holy joy", "Praise unto our God", "Love from heaven above"]
  },
  {
    b: "Philemon", r: "Philemon 1:4", t: 3,
    a: "making mention of thee always in my prayers",
    d: ["giving thanks to the Father of our salvation", "rejoicing in the fellowship of the gospel", "beseeching the Lord to establish thy house"]
  },
  {
    b: "Philemon", r: "Philemon 1:5", t: 2,
    a: "Hearing of thy love and faith",
    d: ["Rejoicing in thy great peace", "Giving thanks for thy holy walk", "Blessing God for thy good works"]
  },
  {
    b: "Philemon", r: "Philemon 1:20", t: 3,
    a: "refresh my bowels in the Lord",
    d: ["comfort my heart in the truth", "grant peace unto my spirit", "strengthen my soul in faith"]
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

console.log(`\nGroup 7 Results: Total: ${CANDIDATES.length}, Passed: ${passed}, Failed: ${failed}`);

if (failed === 0) {
  fs.writeFileSync('scripts/expansion/group7_pauline_epistles.json', JSON.stringify(verifiedItems, null, 2));
  console.log('Successfully wrote scripts/expansion/group7_pauline_epistles.json (84 items)');
}
