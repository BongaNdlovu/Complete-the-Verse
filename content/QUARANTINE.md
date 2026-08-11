# Quarantined verses — re-authoring queue

`296` entries were cut from the playable bank because they failed
`node scripts/qa-verses.js`. **The references are good; the generated blanks and
distractors are not.** Nothing here is lost — each row is a verse worth including
once someone writes a real blank and three real distractors for it.

**77 re-authored · 219 still open.**
Run `node scripts/quarantine-status.js` to refresh these counts.

## How to re-author one

- The blank must be a phrase you could hold in your head, not a word window.
  In most of these entries the blank was the problem; in the rest it was fine and
  only the distractors needed rewriting.
- Every distractor must be wrong *about Scripture*. If grammar alone eliminates it,
  it is not a distractor.
- Modernising the archaic form (`thee` -> `you`) is a giveaway, not a distractor.
- Never reuse a phrase that already appears elsewhere in the same verse, unless the
  confusion is the point — then add `qaOk:["recycled"]` and say why in a comment.

Add the finished entry to `js/verses-more.js` (hand-authored; safe from
regeneration) — not `js/verses-extra.js`, which `build-verse-extra.js`
overwrites. Then re-run the gate.

## Still open, by rule

- `recycled` — 183
- `mid-clause` — 115
- `register-swap` — 49
- `function-swap` — 23
- `containment` — 12
- `duplicate-option` — 3

## Genesis (4)

- **Genesis 4:9** (tier 2) — blank was `Am I my brother's keeper?`  
  _recycled_
- **Genesis 3:15** (tier 3) — blank was `her seed`  
  _recycled_
- **Genesis 8:22** (tier 4) — blank was `seedtime and harvest`  
  _recycled_
- **Genesis 39:2** (tier 4) — blank was `was in the house of his`  
  _mid-clause, recycled_

## Exodus (2)

- **Exodus 19:5** (tier 4) — blank was `a peculiar treasure`  
  _mid-clause_
- **Exodus 33:19** (tier 4) — blank was `the LORD before thee; and will`  
  _mid-clause, recycled, register-swap_

## Numbers (1)

- **Numbers 24:17** (tier 3) — blank was `destroy all the children of Sheth.`  
  _recycled_

## Deuteronomy (2)

- **Deuteronomy 10:12** (tier 3) — blank was `God, to walk in all his`  
  _mid-clause, recycled_
- **Deuteronomy 32:31** (tier 4) — blank was `not as our Rock, even our`  
  _mid-clause_

## Joshua (2)

- **Joshua 4:24** (tier 3) — blank was `of the LORD, that it is`  
  _mid-clause, recycled_
- **Joshua 10:8** (tier 4) — blank was `I have delivered them into thine`  
  _mid-clause, recycled, register-swap_

## Judges (3)

- **Judges 21:25** (tier 3) — blank was `in Israel: every man did that`  
  _mid-clause, recycled_
- **Judges 7:7** (tier 4) — blank was `save you, and deliver the Midianites`  
  _mid-clause, recycled_
- **Judges 7:2** (tier 5) — blank was `for me to give the Midianites`  
  _mid-clause, recycled_

## Ruth (3)

- **Ruth 1:1** (tier 2) — blank was `the land. And a certain man`  
  _mid-clause, recycled_
- **Ruth 4:16** (tier 2) — blank was `child, and laid it in her`  
  _mid-clause, recycled, function-swap_
- **Ruth 3:18** (tier 4) — blank was `Sit still`  
  _mid-clause_

## 1 Samuel (2)

- **1 Samuel 3:10** (tier 4) — blank was `stood, and called as at other`  
  _recycled_
- **1 Samuel 3:19** (tier 4) — blank was `LORD was with him, and did`  
  _mid-clause, recycled_

## 2 Samuel (3)

- **2 Samuel 7:12** (tier 3) — blank was `will set up thy seed after`  
  _mid-clause, recycled, register-swap_
- **2 Samuel 7:22** (tier 4) — blank was `there is none like thee`  
  _recycled, register-swap, containment_
- **2 Samuel 23:2** (tier 5) — blank was `LORD spake by me, and his`  
  _mid-clause, function-swap_

## 1 Kings (3)

- **1 Kings 8:23** (tier 3) — blank was `above, or on earth beneath, who`  
  _recycled_
- **1 Kings 17:14** (tier 4) — blank was `neither shall the cruse of oil`  
  _recycled_
- **1 Kings 4:34** (tier 4) — blank was `wisdom of Solomon, from all kings`  
  _mid-clause, recycled_

## 2 Kings (4)

- **2 Kings 4:34** (tier 3) — blank was `eyes upon his eyes, and his`  
  _mid-clause, recycled_
- **2 Kings 2:9** (tier 4) — blank was `a double portion`  
  _mid-clause, recycled, containment_
- **2 Kings 20:5** (tier 4) — blank was `I have heard thy prayer`  
  _register-swap_
- **2 Kings 5:10** (tier 5) — blank was `Jordan seven times, and thy flesh`  
  _recycled, register-swap_

## 2 Chronicles (2)

- **2 Chronicles 20:17** (tier 3) — blank was `the LORD with you, O Judah`  
  _recycled_
- **2 Chronicles 30:9** (tier 3) — blank was `they shall come again into this`  
  _mid-clause, recycled_

## Ezra (2)

- **Ezra 3:11** (tier 3) — blank was `of the house of the LORD`  
  _mid-clause, recycled_
- **Ezra 8:22** (tier 3) — blank was `unto the king, saying, The hand`  
  _mid-clause, recycled, register-swap_

## Esther (1)

- **Esther 8:17** (tier 5) — blank was `gladness, a feast and a good`  
  _recycled_

## Job (1)

- **Job 42:5** (tier 4) — blank was `the hearing of the ear: but`  
  _mid-clause, recycled, function-swap_

## Proverbs (3)

- **Proverbs 1:7** (tier 2) — blank was `LORD is the beginning of knowledge:`  
  _recycled, function-swap_
- **Proverbs 3:6** (tier 2) — blank was `he shall direct thy paths`  
  _register-swap_
- **Proverbs 10:22** (tier 2) — blank was `LORD, it maketh rich, and he`  
  _function-swap_

## Ecclesiastes (1)

- **Ecclesiastes 11:1** (tier 5) — blank was `the waters: for thou shalt find`  
  _register-swap, function-swap_

## Song of Solomon (1)

- **Song of Solomon 1:2** (tier 4) — blank was `kisses of his mouth: for thy`  
  _mid-clause, recycled, register-swap_

## Lamentations (1)

- **Lamentations 5:21** (tier 5) — blank was `O LORD, and we shall be`  
  _mid-clause, recycled_

## Ezekiel (7)

- **Ezekiel 33:11** (tier 3) — blank was `ye die, O house of Israel?`  
  _recycled, register-swap_
- **Ezekiel 3:17** (tier 4) — blank was `the house of Israel: therefore hear`  
  _recycled_
- **Ezekiel 14:6** (tier 4) — blank was `the house of Israel, Thus saith`  
  _recycled, register-swap_
- **Ezekiel 22:30** (tier 4) — blank was `and stand in the gap before`  
  _mid-clause, recycled_
- **Ezekiel 37:27** (tier 4) — blank was `will be their God, and they`  
  _recycled_
- **Ezekiel 34:23** (tier 5) — blank was `one shepherd`  
  _recycled_
- **Ezekiel 47:12** (tier 5) — blank was `thereof be consumed: it shall bring`  
  _recycled_

## Daniel (6)

- **Daniel 2:20** (tier 4) — blank was `wisdom and might are his`  
  _mid-clause, recycled_
- **Daniel 9:9** (tier 4) — blank was `God belong mercies and forgivenesses, though`  
  _mid-clause, function-swap_
- **Daniel 1:8** (tier 4) — blank was `king's meat, nor with the wine`  
  _recycled_
- **Daniel 9:23** (tier 4) — blank was `I am come to shew thee;`  
  _recycled, register-swap_
- **Daniel 10:19** (tier 4) — blank was `man greatly beloved, fear not: peace`  
  _recycled_
- **Daniel 7:27** (tier 5) — blank was `to the people of the saints`  
  _mid-clause, recycled_

## Hosea (5)

- **Hosea 11:1** (tier 3) — blank was `then I loved him, and called`  
  _mid-clause, function-swap_
- **Hosea 14:1** (tier 3) — blank was `the LORD thy God; for thou`  
  _register-swap_
- **Hosea 2:23** (tier 4) — blank was `Thou art my people`  
  _recycled, register-swap_
- **Hosea 6:1** (tier 4) — blank was `unto the LORD: for he hath`  
  _mid-clause, register-swap_
- **Hosea 13:14** (tier 5) — blank was `death: O death, I will be`  
  _mid-clause, recycled_

## Joel (1)

- **Joel 1:15** (tier 4) — blank was `LORD is at hand, and as`  
  _mid-clause, recycled_

## Micah (2)

- **Micah 5:4** (tier 3) — blank was `the name of the LORD his`  
  _mid-clause, recycled_
- **Micah 6:6** (tier 4) — blank was `the high God? shall I come`  
  _recycled_

## Habakkuk (3)

- **Habakkuk 2:20** (tier 3) — blank was `in his holy temple: let all`  
  _mid-clause, recycled_
- **Habakkuk 3:18** (tier 3) — blank was `in the LORD, I will joy`  
  _mid-clause, recycled, function-swap_
- **Habakkuk 1:5** (tier 4) — blank was `will work a work in your`  
  _mid-clause, recycled_

## Zephaniah (1)

- **Zephaniah 1:7** (tier 5) — blank was `the LORD hath prepared a sacrifice`  
  _recycled, containment_

## Haggai (2)

- **Haggai 1:8** (tier 4) — blank was `build the house`  
  _recycled_
- **Haggai 2:7** (tier 5) — blank was `all nations shall come: and I`  
  _recycled_

## Zechariah (7)

- **Zechariah 14:9** (tier 3) — blank was `the earth: in that day shall`  
  _mid-clause, recycled_
- **Zechariah 1:3** (tier 4) — blank was `Turn ye unto me`  
  _recycled, register-swap, containment_
- **Zechariah 2:10** (tier 4) — blank was `lo, I come, and I will`  
  _mid-clause, recycled_
- **Zechariah 3:2** (tier 4) — blank was `even the LORD that hath chosen`  
  _recycled, register-swap_
- **Zechariah 7:9** (tier 4) — blank was `Execute true judgment, and shew mercy`  
  _recycled_
- **Zechariah 12:10** (tier 4) — blank was `the house of David, and upon`  
  _mid-clause, recycled_
- **Zechariah 13:9** (tier 5) — blank was `gold is tried: they shall call`  
  _recycled_

## Malachi (3)

- **Malachi 3:1** (tier 3) — blank was `seek, shall suddenly come to his`  
  _mid-clause, recycled_
- **Malachi 1:6** (tier 4) — blank was `a master, where is my fear?`  
  _recycled_
- **Malachi 4:5** (tier 4) — blank was `Elijah the prophet before the coming`  
  _mid-clause, recycled_

## Mark (5)

- **Mark 12:31** (tier 2) — blank was `shalt love thy neighbour as thyself.`  
  _register-swap_
- **Mark 2:17** (tier 3) — blank was `sick: I came not to call`  
  _recycled_
- **Mark 4:9** (tier 3) — blank was `unto them, He that hath ears`  
  _mid-clause, register-swap_
- **Mark 8:34** (tier 3) — blank was `said unto them, Whosoever will come`  
  _recycled, register-swap_
- **Mark 16:6** (tier 3) — blank was `was crucified: he is risen; he`  
  _recycled_

## Luke (16)

- **Luke 10:27** (tier 2) — blank was `thy heart, and with all thy`  
  _mid-clause, recycled, register-swap_
- **Luke 1:47** (tier 2) — blank was `hath rejoiced in God my`  
  _mid-clause, register-swap_
- **Luke 2:11** (tier 2) — blank was `David a Saviour, which is Christ`  
  _recycled_
- **Luke 1:38** (tier 3) — blank was `Lord; be it unto me according`  
  _recycled, register-swap_
- **Luke 4:18** (tier 3) — blank was `to heal the brokenhearted, to preach`  
  _mid-clause, recycled_
- **Luke 5:32** (tier 3) — blank was `to call the righteous, but sinners`  
  _mid-clause, function-swap_
- **Luke 6:38** (tier 3) — blank was `over, shall men give into your`  
  _mid-clause, recycled_
- **Luke 9:23** (tier 3) — blank was `come after me, let him deny`  
  _recycled_
- **Luke 15:7** (tier 3) — blank was `over one sinner that repenteth, more`  
  _mid-clause, recycled_
- **Luke 18:1** (tier 3) — blank was `this end, that men ought always`  
  _recycled_
- **Luke 2:52** (tier 4) — blank was `in favour with God and man`  
  _mid-clause_
- **Luke 16:13** (tier 4) — blank was `love the other; or else he`  
  _recycled_
- **Luke 17:21** (tier 4) — blank was `for, behold, the kingdom of God`  
  _mid-clause_
- **Luke 21:36** (tier 4) — blank was `stand before the Son of man.`  
  _recycled_
- **Luke 23:34** (tier 4) — blank was `they know not what they do.`  
  _mid-clause, recycled_
- **Luke 24:32** (tier 4) — blank was `heart burn within us, while he`  
  _recycled_

## John (3)

- **John 14:1** (tier 1) — blank was `troubled: ye believe in God, believe`  
  _register-swap_
- **John 1:12** (tier 2) — blank was `become the sons of God, even`  
  _mid-clause, recycled_
- **John 6:35** (tier 2) — blank was `I am the bread of life:`  
  _recycled_

## Acts (12)

- **Acts 3:19** (tier 2) — blank was `sins may be blotted out, when`  
  _mid-clause, recycled_
- **Acts 5:29** (tier 3) — blank was `apostles answered and said, We ought`  
  _recycled, function-swap_
- **Acts 1:11** (tier 3) — blank was `Jesus, which is taken up from`  
  _mid-clause, recycled_
- **Acts 20:35** (tier 4) — blank was `weak, and to remember the words`  
  _mid-clause, recycled_
- **Acts 2:21** (tier 4) — blank was `whosoever shall call on the name`  
  _mid-clause, recycled_
- **Acts 4:20** (tier 4) — blank was `but speak the things which we`  
  _mid-clause, function-swap_
- **Acts 5:42** (tier 4) — blank was `in every house, they ceased not`  
  _mid-clause, recycled_
- **Acts 16:25** (tier 4) — blank was `Silas prayed, and sang praises unto`  
  _mid-clause, recycled, register-swap, function-swap_
- **Acts 17:11** (tier 4) — blank was `received the word with all readiness`  
  _mid-clause, recycled_
- **Acts 20:24** (tier 4) — blank was `with joy, and the ministry, which`  
  _mid-clause, recycled_
- **Acts 24:16** (tier 4) — blank was `to have always a conscience void`  
  _mid-clause, recycled_
- **Acts 7:59** (tier 5) — blank was `calling upon God, and saying, Lord`  
  _function-swap_

## 1 Corinthians (7)

- **1 Corinthians 11:1** (tier 2) — blank was `as I also am of Christ.`  
  _mid-clause, recycled_
- **1 Corinthians 13:13** (tier 2) — blank was `faith, hope, charity, these three; but`  
  _mid-clause, recycled_
- **1 Corinthians 9:24** (tier 3) — blank was `a race run all, but one`  
  _recycled_
- **1 Corinthians 10:31** (tier 3) — blank was `drink, or whatsoever ye do, do`  
  _mid-clause, recycled, register-swap_
- **1 Corinthians 12:13** (tier 3) — blank was `body, whether we be Jews or`  
  _mid-clause, recycled_
- **1 Corinthians 13:8** (tier 3) — blank was `fail; whether there be tongues, they`  
  _recycled_
- **1 Corinthians 14:33** (tier 3) — blank was `of confusion, but of peace, as`  
  _mid-clause, recycled_

## 2 Corinthians (3)

- **2 Corinthians 4:7** (tier 4) — blank was `treasure in earthen vessels`  
  _recycled, containment_
- **2 Corinthians 1:3** (tier 5) — blank was `the Father of mercies`  
  _recycled, containment_
- **2 Corinthians 11:14** (tier 5) — blank was `himself is transformed into an angel`  
  _mid-clause_

## Galatians (4)

- **Galatians 6:7** (tier 3) — blank was `not mocked: for whatsoever a man`  
  _recycled_
- **Galatians 5:13** (tier 3) — blank was `called unto liberty; only use not`  
  _recycled, register-swap_
- **Galatians 5:16** (tier 3) — blank was `the Spirit, and ye shall not`  
  _recycled, register-swap_
- **Galatians 6:2** (tier 3) — blank was `so fulfil the law of Christ.`  
  _recycled, function-swap_

## Ephesians (12)

- **Ephesians 6:1** (tier 2) — blank was `parents in the Lord: for this`  
  _mid-clause, function-swap_
- **Ephesians 1:7** (tier 3) — blank was `redemption through his blood`  
  _recycled, containment_
- **Ephesians 2:10** (tier 3) — blank was `Jesus unto good works, which God`  
  _recycled, register-swap_
- **Ephesians 3:20** (tier 3) — blank was `that we ask or think, according`  
  _mid-clause, recycled_
- **Ephesians 4:2** (tier 3) — blank was `and meekness, with longsuffering, forbearing one`  
  _mid-clause, function-swap_
- **Ephesians 4:26** (tier 3) — blank was `sin not: let not the sun`  
  _function-swap_
- **Ephesians 4:29** (tier 3) — blank was `which is good to the use`  
  _mid-clause, recycled_
- **Ephesians 5:8** (tier 3) — blank was `Lord: walk as children of light:`  
  _recycled_
- **Ephesians 6:10** (tier 3) — blank was `the Lord, and in the power`  
  _mid-clause, recycled, function-swap_
- **Ephesians 5:25** (tier 4) — blank was `wives, even as Christ also loved`  
  _recycled_
- **Ephesians 1:3** (tier 4) — blank was `Jesus Christ, who hath blessed us`  
  _recycled, register-swap_
- **Ephesians 5:11** (tier 4) — blank was `the unfruitful works of darkness, but`  
  _mid-clause, function-swap_

## Philippians (5)

- **Philippians 4:19** (tier 2) — blank was `his riches in glory by Christ`  
  _recycled_
- **Philippians 2:5** (tier 4) — blank was `you, which was also in Christ`  
  _mid-clause_
- **Philippians 3:14** (tier 4) — blank was `the prize of the high calling`  
  _mid-clause, recycled, function-swap_
- **Philippians 2:8** (tier 4) — blank was `he humbled himself, and became obedient`  
  _mid-clause, recycled_
- **Philippians 3:10** (tier 4) — blank was `of his resurrection, and the fellowship`  
  _mid-clause, recycled_

## Colossians (1)

- **Colossians 1:15** (tier 4) — blank was `the firstborn of every creature`  
  _recycled_

## 1 Thessalonians (1)

- **1 Thessalonians 5:22** (tier 3) — blank was `appearance of`  
  _mid-clause, recycled_

## 2 Thessalonians (1)

- **2 Thessalonians 1:11** (tier 5) — blank was `worthy of this calling, and fulfil`  
  _recycled_

## 1 Timothy (6)

- **1 Timothy 2:1** (tier 3) — blank was `all, supplications, prayers, intercessions, and giving`  
  _mid-clause, recycled_
- **1 Timothy 4:8** (tier 3) — blank was `things, having promise of the life`  
  _recycled_
- **1 Timothy 6:6** (tier 3) — blank was `contentment is great`  
  _recycled_
- **1 Timothy 6:11** (tier 3) — blank was `God, flee these things; and follow`  
  _recycled_
- **1 Timothy 3:16** (tier 4) — blank was `flesh, justified in the Spirit, seen`  
  _mid-clause, recycled_
- **1 Timothy 6:17** (tier 4) — blank was `nor trust in uncertain riches, but`  
  _mid-clause, recycled_

## 2 Timothy (4)

- **2 Timothy 2:2** (tier 4) — blank was `faithful men`  
  _recycled, containment, duplicate-option_
- **2 Timothy 1:9** (tier 4) — blank was `our works, but according to his`  
  _mid-clause, recycled_
- **2 Timothy 3:12** (tier 4) — blank was `that will live godly in Christ`  
  _mid-clause_
- **2 Timothy 4:18** (tier 4) — blank was `will preserve me unto his heavenly`  
  _recycled, register-swap_

## Titus (5)

- **Titus 3:1** (tier 3) — blank was `to principalities and powers, to obey`  
  _mid-clause, recycled_
- **Titus 2:12** (tier 4) — blank was `denying ungodliness and worldly lusts`  
  _recycled, containment_
- **Titus 1:9** (tier 4) — blank was `faithful word as he hath been`  
  _mid-clause, recycled, register-swap_
- **Titus 2:14** (tier 4) — blank was `he might redeem us from all`  
  _recycled_
- **Titus 3:8** (tier 5) — blank was `maintain good works`  
  _recycled, containment_

## Philemon (2)

- **Philemon 1:25** (tier 4) — blank was `Lord Jesus Christ be with your`  
  _mid-clause_
- **Philemon 1:9** (tier 5) — blank was `beseech thee, being such an one`  
  _recycled, register-swap_

## Hebrews (16)

- **Hebrews 10:23** (tier 2) — blank was `the profession of our faith without`  
  _mid-clause, recycled_
- **Hebrews 11:6** (tier 2) — blank was `to God must believe that he`  
  _mid-clause, recycled_
- **Hebrews 13:5** (tier 2) — blank was `he hath said, I will never`  
  _recycled, register-swap_
- **Hebrews 10:25** (tier 3) — blank was `manner of some is; but exhorting`  
  _recycled_
- **Hebrews 3:8** (tier 3) — blank was `in the provocation, in the day`  
  _mid-clause, function-swap_
- **Hebrews 4:15** (tier 3) — blank was `high priest which cannot be touched`  
  _recycled_
- **Hebrews 9:27** (tier 3) — blank was `unto men once to die, but`  
  _mid-clause, register-swap_
- **Hebrews 12:28** (tier 3) — blank was `let us have grace, whereby we`  
  _recycled_
- **Hebrews 1:1** (tier 4) — blank was `in divers manners spake in time`  
  _mid-clause, recycled_
- **Hebrews 3:13** (tier 4) — blank was `is called To day; lest any`  
  _mid-clause, recycled_
- **Hebrews 2:14** (tier 4) — blank was `of the same; that through death`  
  _mid-clause, recycled_
- **Hebrews 6:10** (tier 4) — blank was `love, which ye have shewed toward`  
  _mid-clause, recycled, register-swap_
- **Hebrews 7:25** (tier 4) — blank was `uttermost that come unto God by`  
  _mid-clause, recycled, register-swap_
- **Hebrews 9:14** (tier 4) — blank was `eternal Spirit offered himself without spot`  
  _recycled_
- **Hebrews 13:16** (tier 4) — blank was `communicate forget not: for with such`  
  _mid-clause, recycled_
- **Hebrews 2:18** (tier 5) — blank was `suffered being tempted, he is able`  
  _recycled_

## James (4)

- **James 4:8** (tier 3) — blank was `to you. Cleanse your hands, ye`  
  _mid-clause, recycled, register-swap_
- **James 2:26** (tier 4) — blank was `faith without works is dead`  
  _recycled_
- **James 3:1** (tier 4) — blank was `many masters, knowing that we shall`  
  _mid-clause_
- **James 3:17** (tier 5) — blank was `first pure, then peaceable`  
  _recycled, duplicate-option_

## 1 Peter (9)

- **1 Peter 1:16** (tier 3) — blank was `written, Be ye holy; for I`  
  _register-swap_
- **1 Peter 2:24** (tier 3) — blank was `by whose stripes ye were healed`  
  _mid-clause, recycled, register-swap_
- **1 Peter 1:8** (tier 3) — blank was `now ye see him not, yet`  
  _recycled, register-swap_
- **1 Peter 2:5** (tier 3) — blank was `house, an holy priesthood, to offer`  
  _recycled_
- **1 Peter 4:10** (tier 3) — blank was `same one to another, as good`  
  _recycled_
- **1 Peter 1:7** (tier 4) — blank was `it be tried with fire, might`  
  _mid-clause, recycled_
- **1 Peter 1:25** (tier 4) — blank was `ever. And this is the word`  
  _recycled_
- **1 Peter 2:11** (tier 4) — blank was `strangers and pilgrims, abstain from fleshly`  
  _recycled, function-swap_
- **1 Peter 3:18** (tier 4) — blank was `unjust, that he might bring us`  
  _recycled_

## 2 Peter (4)

- **2 Peter 2:9** (tier 4) — blank was `reserve the unjust unto the day`  
  _mid-clause, recycled, register-swap_
- **2 Peter 1:2** (tier 4) — blank was `multiplied unto you through the knowledge`  
  _mid-clause, recycled, register-swap_
- **2 Peter 2:1** (tier 4) — blank was `among you, who privily shall bring`  
  _mid-clause, recycled_
- **2 Peter 3:14** (tier 4) — blank was `found of him in peace, without`  
  _mid-clause, recycled_

## 1 John (9)

- **1 John 1:7** (tier 2) — blank was `another, and the blood of Jesus`  
  _recycled_
- **1 John 4:7** (tier 2) — blank was `is of God; and every one`  
  _recycled_
- **1 John 2:15** (tier 3) — blank was `the world. If any man love`  
  _recycled_
- **1 John 2:1** (tier 3) — blank was `sin not. And if any man`  
  _recycled_
- **1 John 2:6** (tier 3) — blank was `abideth in him ought himself also`  
  _mid-clause, recycled_
- **1 John 3:16** (tier 3) — blank was `his life for us: and we`  
  _recycled_
- **1 John 3:18** (tier 3) — blank was `in word, neither in tongue; but`  
  _mid-clause, recycled_
- **1 John 5:3** (tier 3) — blank was `of God, that we keep his`  
  _mid-clause, recycled_
- **1 John 5:11** (tier 3) — blank was `God hath given to us eternal`  
  _register-swap_

## 2 John (4)

- **2 John 1:1** (tier 4) — blank was `love in the truth; and not`  
  _recycled_
- **2 John 1:5** (tier 4) — blank was `a new commandment unto thee, but`  
  _mid-clause, recycled, register-swap_
- **2 John 1:10** (tier 5) — blank was `receive him not into your house`  
  _recycled, containment, duplicate-option_
- **2 John 1:11** (tier 5) — blank was `biddeth him God speed is partaker`  
  _mid-clause_

## 3 John (1)

- **3 John 1:12** (tier 4) — blank was `truth itself: yea, and we also`  
  _mid-clause, recycled_

## Jude (1)

- **Jude 1:6** (tier 5) — blank was `habitation, he hath reserved in everlasting`  
  _recycled, register-swap_

## Revelation (6)

- **Revelation 1:5** (tier 3) — blank was `and the prince of the kings`  
  _mid-clause, recycled_
- **Revelation 21:1** (tier 3) — blank was `the first heaven and the first`  
  _recycled_
- **Revelation 21:6** (tier 3) — blank was `and the end. I will give`  
  _mid-clause, recycled_
- **Revelation 2:10** (tier 4) — blank was `be thou faithful unto death`  
  _recycled, register-swap, containment_
- **Revelation 1:17** (tier 4) — blank was `he laid his right hand upon`  
  _mid-clause, recycled_
- **Revelation 2:4** (tier 4) — blank was `thou hast left thy first love.`  
  _register-swap_
