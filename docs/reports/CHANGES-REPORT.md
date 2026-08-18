# Changes Report — content gate, verse bank, typing, spaced repetition

**Date:** 2026-08-02
**Scope:** steps 1–4 of the review (5 and 6 — a backend and internationalisation — explicitly out of scope)
**Verify:** `node test.js` → 9 suites, 212 assertions, all passing
**Play:** `index.html`

---

## Summary

Four changes, in the order they had to happen:

1. **A content gate that actually fails bad items** (`scripts/verse-qa.js`). The previous
   gate reported "0 mechanical flags" on a bank where 296 of 309 generated entries could
   not teach anything.
2. **The bank rebuilt around that gate.** 296 entries cut and queued for re-authoring,
   109 hand-written, 4 repaired. 305 verses, every one passing the gate, all 66 books at
   ≥4. Verse IDs made stable so cutting verses no longer corrupts saved progress.
3. **Recall — a typing mode.** No options; you produce the words. Recognition is the
   weakest form of memory practice and it was the only form the game had.
4. **SM-2 spaced repetition with real due dates**, driving the Drill, the menu, and the
   Study Hall. Every answer in every mode reschedules the verse.

One thing you should know up front: **the playable bank got smaller, from 505 to 305.**
That is the point rather than a regression — 60% of the old bank was unusable — but it is
a visible change and the reasoning is in [§2](#2-the-verse-bank).

---

## 1. The content gate

`scripts/qa-verses.js` (CLI) over `scripts/verse-qa.js` (rules, pure functions).

### What the old gate missed

`scripts/qa-verses-extra.js` checked for anagram reorderings, punctuation-only duplicates,
answers over 6 words, and empty context. It reported zero problems. Running the new rules
over the same bank:

| Rule | Meaning | Hits in the old bank |
|---|---|---|
| `recycled` | distractor lifted verbatim from the same verse | 248 |
| `mid-clause` | blank cut mid-phrase (`"was in the house of his"`) | 148 |
| `register-swap` | distractor only modernises the wording (`thee`→`you`) | 71 |
| `function-swap` | distractor differs only in `and`/`or`, `the`/`a` | 29 |
| `containment` | distractor is the answer plus the rest of the verse | 16 |
| `duplicate-option` | the same distractor twice | 5 |

The common thread: every one of these can be eliminated **without knowing the verse**.
A distractor you can rule out on grammar is not a distractor, and a blank that ends on
"into this" is not a phrase anyone can hold in their head.

### Calibration

A gate with false positives is as damaging as one with false negatives — it forces you to
delete good verses. The rules were tuned against the 196 hand-written entries, which are
good, and every relaxation is recorded as a test in `verse-qa.test.js` with both a case it
must catch and a case it must not. Concretely:

- **`bow` / `rainbow`** — containment now compares whole words, not substrings.
- **`I AM THAT I AM`** — all-caps declarations are exempt from the phrase-shape rules.
- **`thine own understanding` vs `thy own understanding`** — both are archaic, and the
  distinction is precise KJV recall. Register-swap is now directional: only archaic→modern
  is a giveaway.
- **`glorify your Father` vs `our Father`, `all evil` vs `every evil`** — real questions.
  Connective-swap is now limited to `and/or/but/nor/the/a/an` and only in blanks of 4+ words.
- **`with an everlasting love`, `of whom I am chief`, `it is the gift of God`** — complete
  phrases that open with a preposition or pronoun. Flagged only when the window also runs
  into a new clause or trails a verb.
- **single-word blanks** (`might`, `atonement`) are exempt from phrase-shape rules entirely.

### Waivers

Three items are deliberately waived with `qaOk:[...]` and a comment saying why:

| Item | Rule | Why |
|---|---|---|
| John 1:1 | `recycled` | `"was with God"` is lifted from the verse *because* the distinction from `"was God"` is the entire weight of the verse. |
| Genesis 1:1-2 | `recycled` | `"face of the deep"` appears earlier in the passage and is exactly what a half-remembering reader reaches for. |
| Isaiah 53:5 | `recycled` | The two blanks offer each other's answer on purpose — transposing "transgressions" and "iniquities" is the classic error here. |

Waivers are counted and printed on every gate run, so they cannot quietly become the way
failures get handled.

### Severity

`error` blocks a release. `thin-context` is a `warn` — Numbers 6:24 (`"The LORD ___"`) has
almost no context, which is a real weakness, but it is the Aaronic blessing and cutting it
would be silly. Two verses carry that warning.

---

## 2. The verse bank

### Before and after

| | Before | After |
|---|---:|---:|
| Playable verses | 505 | **305** |
| Passing the gate | 209 (41%) | **305 (100%)** |
| Hand-written | 196 | **305** |
| Machine-generated | 309 | **0** |
| Books with <4 verses | 56 | **0** |
| Minimum per book | 1 | **4** |

Split by source, the old bank was **190/196 clean (97%) hand-written** against
**20/309 (6.5%) generated**. The generated content was not marginally worse; it was a
different category of thing.

### What was done

- **296 entries cut**, written to `content/quarantine.json` and `content/QUARANTINE.md` as
  a re-authoring queue. Nothing is lost: the references were always fine, only the blanks
  and distractors were broken. Each row carries the reference, the old blank, and the rules
  it failed, plus a short guide to writing a good replacement.
- **109 entries hand-written** into `js/verses-extra.js` — 10 generated entries that passed
  the gate on their merits, and 99 new ones sized to bring every book to ≥4.
- **4 hand-written entries repaired** in `js/verses.js`: Matthew 7:7, Titus 2:11 and
  Jude 1:3 had a distractor that merely modernised the wording; John 1:1 took a waiver.
- **`scripts/quarantine-status.js`** tracks the queue as it is worked through.
  Currently **28 re-authored, 268 open**.

### Distribution

Tiers 1–5: 21 / 51 / 91 / 82 / 60. Every tier has enough to draw a full run from; the
Trial needs 39 verses across five tiers and the Daily needs 20.

### Stable verse IDs — the bug underneath all of this

`js/verses-extra.js` used to end with:

```js
VERSES.forEach((v,i)=>{ v.id=i; ... });     // id = position in the array
```

`SAVE.verse` was keyed by that id. **Adding, moving or cutting a single verse silently
re-pointed every saved mastery record at a different verse.** Cutting 296 would have
scrambled every existing player's history, and spaced repetition on unstable keys is
meaningless.

IDs now derive from the reference and the blank (`genesis-1-1~heaven-and-the-earth`) in
`js/bank.js`, and are asserted stable under reordering. Existing saves are migrated:
`js/legacy-ids.js` maps each old array position to its new ID (211 of 505 slots carry over;
the other 294 held verses that were cut). XP, seals, records, book stats, lifetime totals
and settings are untouched. The save key moved `ctv_save_v2` → `ctv_save_v3`; v2 is still
read once, migrated, and re-saved.

---

## 3. Recall — the typing mode

New mode on the menu. 12 verses, 22-second clock, drawn from the review queue. The blank is
empty and you fill it yourself.

`js/recall.js` holds the grading, as pure functions.

### What is forgiven and what is not

The grader has one job beyond string comparison: separate "you do not know this verse" from
"your thumb slipped". Getting this wrong in either direction breaks the mode.

- **Forgiven** — case, punctuation, spacing, curly quotes, and typos within a
  length-scaled budget (1 edit under 8 characters, up to 4 for a long phrase).
- **Not forgiven** — a different word. `"heavens"` for `"heaven"` is one edit and would
  have passed on distance alone. Two guards prevent it:
  1. **Inflections are never typos.** A whole-word change wearing a typo's clothes
     (`heaven`/`heavens`, `walk`/`walketh`, `love`/`loved`) is rejected however small the
     edit, and the verdict names both forms.
  2. **The verse's own distractors are handed to the grader.** If what you typed is at
     least as close to one of the three hand-written wrong answers as to the right one, it
     is a wrong recall, not a slip. The content already encodes the near-misses that must
     not be forgiven.
- **Reported separately** — modern English for archaic (`"bless you, and keep you"`).
  Marked wrong, but told *why*, rather than left looking like a mystery.

Every verdict shows the exact wording. Being marked wrong without seeing the gap teaches
nothing.

### Fitting the existing systems

- **Illuminate** burns two wrong options, and there are none here, so in Recall it buys
  progressively more of the answer's shape: word lengths → first letters → the first word
  whole. Capped at three levels; never reveals the answer.
- **Selah** is unchanged (+5s).
- **Scoring** pays per verse rather than per correct answer, and pays more for an exact
  match than a forgiven typo — producing the words is strictly harder than recognising them.
- The input sets `autocomplete/autocorrect/autocapitalize/spellcheck` off, so a phone
  keyboard cannot quietly rewrite the answer.

---

## 4. Spaced repetition

`js/srs.js` — SM-2 (Anki's ancestor), pure, scheduling in whole days.

### What it replaces

`drawPracticeVerse()` weighted verses by lifetime accuracy. A verse missed once a year ago
and one missed this morning looked identical; a verse answered correctly three times running
came back at the same rate forever. Neither is how memory works.

### How it works now

Each verse carries `{ef, reps, ivl, due, lapses, last}`. Answer quality maps onto SM-2's
0–5 scale from what the game already knows:

| Outcome | Quality |
|---|---:|
| Timed out | 0 |
| Wrong | 1 |
| Typed close but not right | 2 |
| Correct but slow, or after a lifeline | 3 |
| Correct at a normal pace | 4 |
| Correct and fast | 5 |

Intervals run 1 day → 6 days → `previous × easiness`, capped at a year. A miss resets the
interval to 1 but keeps the history, so a chronically hard verse stays easy to spot and
comes back faster than merely new material. A lifeline can never score higher than unaided
recall — otherwise the scheduler rewards using them.

**Days are counted from the local calendar date** via `Date.UTC(y, m, d)`. Using UTC
directly would roll the day over mid-evening for anyone west of Greenwich, breaking a daily
streak while they were still awake on the same date.

### Where it shows up

- **The Drill** (was "Practice Misses") serves the queue: due verses first, most overdue
  leading, then never-seen, then anything still comfortably scheduled.
- **Every mode feeds the scheduler.** The Trial, Endless and Daily all reschedule the
  verses they ask, so playing the campaign fills the Drill. That is why there is one
  scheduler rather than a practice-only side channel.
- **The menu** shows a due count on the Drill card and in the hint line.
- **The Study Hall** filters by schedule state — Due / Still learning / Held / Never seen —
  and each verse shows when it is next due. This replaces the old accuracy filter, which
  told you about the past rather than what to do next.
- **The results screen** shows what the run did to your schedule: how many verses were
  rescheduled, how many come back tomorrow, the longest gap earned, and what is due today.
  Without this the spacing is invisible and there is no reason to believe it exists.
- **Returning players** get a seeded schedule from their v2 history — verses previously
  answered correctly become due today, verses previously missed are marked lapsed — so the
  first Drill after upgrading is a real one rather than empty.

---

## Tests

`node test.js` runs everything. **212 assertions across 9 suites.**

| Suite | Assertions | What it covers |
|---|---:|---|
| content gate | — | `scripts/qa-verses.js` exits zero on the shipped bank |
| `verse-qa.test.js` | 42 | every detector, on synthetic fixtures, in **both** directions |
| `srs.test.js` | 49 | day arithmetic, grade mapping, the SM-2 ladder, lapses, bounds, purity, queue order |
| `recall.test.js` | 65 | normalisation, edit distance, what is forgiven, what is not, inflections, distractor-awareness, hints |
| `integration.test.js` | 56 | boots the real `js/game.js` in a DOM shim and drives real runs |
| `game-structure.test.js` | — | bank invariants, ID stability, migration, quarantine, load order |
| `ui-structure.test.js` | — | markup and CSS for the new surfaces, plus the original UI checks |
| soundtrack / sfx | — | unchanged |

Two notes on the test design:

**The old structure test asserted `verse total in 400–600`.** That assertion is exactly
what let the generated bank in — it defended size, which is not a property worth defending.
It has been replaced by assertions on the properties that matter: the gate passes, every
book carries ≥4 verses, every tier can fill a run, IDs are unique and stable under
reordering, and nothing quarantined is live with its broken distractors.

**The detector tests assert both directions.** Every rule has fixtures it must catch *and*
fixtures it must not, because an over-eager gate would be just as damaging as the old
permissive one — it would force good verses to be deleted.

### Bugs the tests caught

Both were found by tests written before the code was believed finished:

1. **`SRS.dueCount` ignored the due date for lapsed cards** — a verse you had lost stayed
   permanently "due" regardless of when it was next scheduled, so the menu count never went
   down. `srs.test.js:"nothing is due far in the past"`.
2. **The typing grader accepted `"heavens"` for `"heaven"`** — one edit, well inside the
   typo budget. This is the single worst failure this mode could have: it teaches the wrong
   text while telling the player they are right. Fixed with the inflection guard and
   distractor-awareness described above. `recall.test.js:"heaven vs heavens is wrong"`.

### Browser verification

Not just Node. `index.html` was rendered in headless Chrome — boots with **zero console
errors**, all five modes render, the menu reads "305 verses · all 66 books". A scripted
probe then drove a Recall run against the real markup: **16/16 checks passed**, covering the
typed input rendering, Lock Answer enabling on input, Illuminate producing a hint that is
not the answer, exact grading, the verdict display, the Study Hall schedule bands, the
next-review panel, and the menu due count. The probe was removed afterwards.

---

## Retired

Both of these were still runnable and both would have undone the work:

- **`scripts/qa-verses-extra.js`** — the gate that reported "0 mechanical flags" on the
  broken bank. Replaced with a stub that exits non-zero and points at the real gate. A gate
  that passes junk is worse than no gate, because it gets cited as evidence.
- **`scripts/build-verse-extra.js`** — the generator. Now refuses to run without an explicit
  `--i-know-this-overwrites-hand-written-content` flag, and its header documents exactly
  what its output failed. Kept because its reference list is a reasonable starting point for
  working the re-authoring queue.

---

## Files

**New**
```
js/srs.js                        SM-2 scheduling (pure)
js/recall.js                     typed-answer grading (pure)
js/bank.js                       merges sources, stable IDs, BY_TIER
js/legacy-ids.js                 generated v2→v3 ID map
scripts/verse-qa.js              the rules
scripts/qa-verses.js             the gate CLI
scripts/load-bank.js             loads browser globals into Node
scripts/quarantine.js            cut → re-authoring queue
scripts/quarantine-status.js     tracks the queue
scripts/build-legacy-map.js      builds the migration table
content/quarantine.json          296 cut entries
content/QUARANTINE.md            the queue, human-readable
content/legacy-order.json        v2 bank order snapshot
srs.test.js recall.test.js verse-qa.test.js integration.test.js test.js
```

**Rewritten** — `js/verses-extra.js` (309 generated → 109 hand-written),
`game-structure.test.js`

**Modified** — `js/verses.js` (4 repairs), `js/passages.js` (2 waivers, ID assignment moved),
`js/game.js` (save v3 + migration, SRS access, review draw, typed rendering and grading,
Recall mode, Illuminate adaptation, scoring, menu, Study Hall, results),
`index.html` (script order, results panel, study filters, tutorial copy),
`css/game.css` (typed input, verdict, due pill, schedule panel, mobile sizes),
`ui-structure.test.js`

**Retired** — `scripts/qa-verses-extra.js`, `scripts/build-verse-extra.js`

---

## Review — what I'd flag

Honest assessment of what was done and what it does not do.

**What genuinely improved.** The bank is now trustworthy: every playable item has been
checked by a rule set that is itself tested in both directions. The typing mode is a real
pedagogical change rather than a reskin — it moves the game from recognition to production,
which is the difference between "Bible trivia" and "Scripture memorisation", and the one
claim about helping people learn that now survives scrutiny. The scheduler means the game
finally has a reason to be opened tomorrow that isn't a streak counter. The stable-ID fix
was not on the list but had to happen; without it, steps 1 and 4 would each have silently
corrupted saved progress.

**The bank is small.** 305 verses, and 268 references still sit in the queue. A dedicated
player will see repeats sooner than before. Working `content/QUARANTINE.md` is the single
highest-value follow-up, and it is now a mechanical task with a gate to check the work —
roughly 20–30 verses an hour by hand.

**The gate encodes editorial judgment, not truth.** Thresholds like "connective swaps only
matter in blanks of 4+ words" and "a distractor 3+ words longer than the answer is
containment" are defensible calls, not facts. They are all in one file with the reasoning
written down, and every one has a test pinning both directions, so they can be argued with
and changed. Expect to adjust them as more verses are written.

**Typo tolerance will still need tuning against real players.** The inflection guard and
distractor-awareness handle the cases I could construct, but the honest limit is that
character distance cannot in general tell a slip from a different word. Watch for players
being marked wrong on genuine typos; the budget is one constant in `Recall.tolerance`.

**SM-2 is not state of the art.** FSRS schedules better. SM-2 was chosen because it is
simple enough to test exhaustively and to reason about with no data; it is a large
improvement on accuracy-weighting and a small step behind current practice. The interfaces
in `js/srs.js` are narrow enough to swap the algorithm later without touching the game.

**Still true from the original review, and still unaddressed by design** (steps 5 and 6 were
out of scope): no backend, so no accounts, no cross-device sync, and no group play — which
remains the feature churches would actually use. English/KJV only. And `localStorage` is
still the only store, so iOS Safari will evict a lapsed player's entire history after
roughly seven days without a visit. That last one now costs more than it used to, because
there is a schedule worth losing. If you do one more thing after the queue, make it that.
