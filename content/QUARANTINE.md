# Quarantined verses — re-authoring queue

`296` entries were cut from the playable bank because they failed
`node scripts/qa-verses.js`. **The references are good; the generated blanks and
distractors are not.** Nothing here is lost — each row is a verse worth including
once someone writes a real blank and three real distractors for it.

**250 re-authored · 46 still open.**
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

- `recycled` — 36
- `mid-clause` — 27
- `register-swap` — 13
- `function-swap` — 3
- `containment` — 3
- `duplicate-option` — 2

## Exodus (1)

- **Exodus 33:19** (tier 4) — blank was `the LORD before thee; and will`  
  _mid-clause, recycled, register-swap_

## 1 Samuel (1)

- **1 Samuel 3:19** (tier 4) — blank was `LORD was with him, and did`  
  _mid-clause, recycled_

## 1 Kings (2)

- **1 Kings 8:23** (tier 3) — blank was `above, or on earth beneath, who`  
  _recycled_
- **1 Kings 4:34** (tier 4) — blank was `wisdom of Solomon, from all kings`  
  _mid-clause, recycled_

## 2 Kings (2)

- **2 Kings 4:34** (tier 3) — blank was `eyes upon his eyes, and his`  
  _mid-clause, recycled_
- **2 Kings 5:10** (tier 5) — blank was `Jordan seven times, and thy flesh`  
  _recycled, register-swap_

## Ezra (1)

- **Ezra 8:22** (tier 3) — blank was `unto the king, saying, The hand`  
  _mid-clause, recycled, register-swap_

## Ecclesiastes (1)

- **Ecclesiastes 11:1** (tier 5) — blank was `the waters: for thou shalt find`  
  _register-swap, function-swap_

## Hosea (3)

- **Hosea 11:1** (tier 3) — blank was `then I loved him, and called`  
  _mid-clause, function-swap_
- **Hosea 2:23** (tier 4) — blank was `Thou art my people`  
  _recycled, register-swap_
- **Hosea 13:14** (tier 5) — blank was `death: O death, I will be`  
  _mid-clause, recycled_

## Joel (1)

- **Joel 1:15** (tier 4) — blank was `LORD is at hand, and as`  
  _mid-clause, recycled_

## Micah (1)

- **Micah 5:4** (tier 3) — blank was `the name of the LORD his`  
  _mid-clause, recycled_

## Habakkuk (1)

- **Habakkuk 3:17** (tier 4) — blank was `fail, and the fields shall yield`  
  _recycled_

## Malachi (1)

- **Malachi 4:5** (tier 4) — blank was `Elijah the prophet before the coming`  
  _mid-clause, recycled_

## 2 Corinthians (1)

- **2 Corinthians 11:14** (tier 5) — blank was `himself is transformed into an angel`  
  _mid-clause_

## Philippians (2)

- **Philippians 2:8** (tier 4) — blank was `he humbled himself, and became obedient`  
  _mid-clause, recycled_
- **Philippians 3:10** (tier 4) — blank was `of his resurrection, and the fellowship`  
  _mid-clause, recycled_

## 1 Thessalonians (1)

- **1 Thessalonians 5:22** (tier 3) — blank was `appearance of`  
  _mid-clause, recycled_

## 2 Thessalonians (1)

- **2 Thessalonians 1:11** (tier 5) — blank was `worthy of this calling, and fulfil`  
  _recycled_

## 2 Timothy (3)

- **2 Timothy 2:2** (tier 4) — blank was `faithful men`  
  _recycled, containment, duplicate-option_
- **2 Timothy 3:12** (tier 4) — blank was `that will live godly in Christ`  
  _mid-clause_
- **2 Timothy 4:18** (tier 4) — blank was `will preserve me unto his heavenly`  
  _recycled, register-swap_

## Titus (2)

- **Titus 2:12** (tier 4) — blank was `denying ungodliness and worldly lusts`  
  _recycled, containment_
- **Titus 1:9** (tier 4) — blank was `faithful word as he hath been`  
  _mid-clause, recycled, register-swap_

## Philemon (2)

- **Philemon 1:25** (tier 4) — blank was `Lord Jesus Christ be with your`  
  _mid-clause_
- **Philemon 1:9** (tier 5) — blank was `beseech thee, being such an one`  
  _recycled, register-swap_

## Hebrews (9)

- **Hebrews 3:8** (tier 3) — blank was `in the provocation, in the day`  
  _mid-clause, function-swap_
- **Hebrews 4:15** (tier 3) — blank was `high priest which cannot be touched`  
  _recycled_
- **Hebrews 9:27** (tier 3) — blank was `unto men once to die, but`  
  _mid-clause, register-swap_
- **Hebrews 12:28** (tier 3) — blank was `let us have grace, whereby we`  
  _recycled_
- **Hebrews 3:13** (tier 4) — blank was `is called To day; lest any`  
  _mid-clause, recycled_
- **Hebrews 2:14** (tier 4) — blank was `of the same; that through death`  
  _mid-clause, recycled_
- **Hebrews 6:10** (tier 4) — blank was `love, which ye have shewed toward`  
  _mid-clause, recycled, register-swap_
- **Hebrews 9:14** (tier 4) — blank was `eternal Spirit offered himself without spot`  
  _recycled_
- **Hebrews 2:18** (tier 5) — blank was `suffered being tempted, he is able`  
  _recycled_

## James (1)

- **James 3:1** (tier 4) — blank was `many masters, knowing that we shall`  
  _mid-clause_

## 2 Peter (2)

- **2 Peter 2:9** (tier 4) — blank was `reserve the unjust unto the day`  
  _mid-clause, recycled, register-swap_
- **2 Peter 2:1** (tier 4) — blank was `among you, who privily shall bring`  
  _mid-clause, recycled_

## 2 John (3)

- **2 John 1:1** (tier 4) — blank was `love in the truth; and not`  
  _recycled_
- **2 John 1:10** (tier 5) — blank was `receive him not into your house`  
  _recycled, containment, duplicate-option_
- **2 John 1:11** (tier 5) — blank was `biddeth him God speed is partaker`  
  _mid-clause_

## Jude (1)

- **Jude 1:6** (tier 5) — blank was `habitation, he hath reserved in everlasting`  
  _recycled, register-swap_

## Revelation (3)

- **Revelation 1:5** (tier 3) — blank was `and the prince of the kings`  
  _mid-clause, recycled_
- **Revelation 21:1** (tier 3) — blank was `the first heaven and the first`  
  _recycled_
- **Revelation 2:4** (tier 4) — blank was `thou hast left thy first love.`  
  _register-swap_
