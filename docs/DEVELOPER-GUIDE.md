# Complete the Verse — Developer Guide

Everything a developer needs to work in this codebase, including the
details that are hard to find because they live in comments, in test
files, or in the gap between modules. Written against the tree as of
2026-08-27 (organisation closeout + Oxlint complexity ceiling of 20).

Companion documents: `docs/SECURITY-EVALUATION.md` (trust model, audit
checklist), `docs/BACKEND-EVALUATION.md` (Supabase schema, sync, failure
modes), `docs/reports/ASSESSMENT-REPORT.md` (state of the product), `docs/BACKEND.md`
(setup runbook for the Supabase project), `docs/CODE-ORGANISATION.md`.

---

## 1. What this project is

A **static, zero-build web game** — King James Version verse completion
framed as a biblical thriller and geographical pilgrimage. One `index.html`,
modular plain-JS files, CSS files, vendored libraries. It must run:

1. from **disk** (`file://`) with no network at all,
2. from any static host (production: Vercel),
3. with **optional** Supabase cloud (sync + leaderboards) that never
   blocks boot or play.

There is no bundler, no framework, no package installation needed to
play. `node test.js` (or `npm test`) is the logic gate. `npm run lint` runs Oxlint with a global cyclomatic-complexity ceiling of 20.

```
index.html          the single page — all views are <section class="view">s
README.md           repository entry point
test.js             root test runner (runs all 54 test suites)
js/*.js             see module map below (loaded as classic <script>, globals)
css/*.css           game styling, film FX, and atlas map
vendor/leaflet/     Leaflet 1.9.4 (map — vendored, never CDN)
vendor/supabase/    supabase-js 2.112.3 (lazy-loaded only when configured)
assets/             art (46 relics, 8 scholars × portrait+token+walker, judge sheets…)
audio/              7 music beds · audio/voice/ 24 narration clips
sfx/                8 effect samples
content/            verse QA data (quarantine.json, legacy-order.json)
scripts/            dev server + content QA/generation scripts
supabase/           migrations + edge function (see BACKEND-EVALUATION.md)
test/*.test.js      54 registered test suites (see §10)
docs/               living documentation and runbooks (see docs/README.md)
docs/reports/       archived snapshot reports — not current truth
plans/              product and smoke plans
js/README.md        first-read map of every runtime module
```

---

## 2. Script load order — and why it is exactly this

`index.html` loads, in order:

```
vendor/leaflet/leaflet.js
js/verses.js        → defines VERSES (core), BOOKS_ORDER, verseId inputs
js/verses-extra.js  → VERSES_EXTRA (generated — see §8.3)
js/verses-more.js   → VERSES_MORE (hand-authored)
js/verses-ascent.js → VERSES_ASCENT (ascent pool)
js/passages.js      → PASSAGES (multi-blank passages), BOOKS_ORDER helper data
js/legacy-ids.js    → LEGACY_ID_TABLE (v2 index → v3 id map)
js/bank.js          → merges verse packs, assigns ids, builds BY_TIER/BY_ID
js/srs.js           → spaced repetition (pure)
js/recall.js        → typed-answer grader (pure)
js/assemble.js      → word-tile assembly logic (pure)
js/meta.js          → meta progression, rank math
js/flow.js          → state transitions and modal flows
js/sites.js         → SITES + ARCS data (the 46-stop journey)
js/empires.js       → historical empire polygons for the map
js/geo.js           → solar math, compass, sun/moon (pure)
js/pilgrimage.js    → campaign rules (pure; captures merged VERSES at parse)
js/characters.js    → 8 scholars + retired Bible figures for old saves
js/artifacts.js     → 46 relics, unlock rules (pure-ish)
js/live.js          → weather fetch/cache + authored climate fallback (pure-ish)
js/atlas.js         → the Leaflet map view
js/polish.js        → pure helpers (clamps, PACE, insights, ghosts)
js/cloud-config.js  → CLOUD_CONFIG (url + anon key, or empty)
js/cloud.js         → Supabase client, lazy SDK loader
js/util.js          → common string/DOM helpers
js/audio.js         → Snd audio subsystem (Web Audio + synthesized sound)
js/director.js      → presentation, voice, callouts, momentum
js/setpieces.js     → special set-piece sequences
js/viz.js           → spectrum canvas and visualizer
js/typed.js         → typed recall UI and on-screen keyboard
js/sequences.js     → cutscene and passage sequence flows
js/panels.js        → UI dialogs, settings, player card
js/cinematic.js     → procedural vector art, Seventh Lamp, combo stamps
js/results.js       → run completion, scoring, habit streak, XP
js/diag.js          → diagnostics ring buffer, error logging, telemetry dump
js/briefs.js        → boot sequence, mode briefs, cold launch
js/play.js          → stage clocks, live question timer, answering, life loss
js/game.js          → the engine orchestrator (everything above is in scope)
```

**Constraints that are easy to break:**

- `pilgrimage.js` captures `VERSES` **at parse time** (`typeof VERSES !== "undefined" ? VERSES : []`), so it must load **after** `bank.js` has merged the packs. Its comment block says this; the tests pin the order (`game-structure.test.js`).
- `game.js` reads `Polish.PACE`, `Pilgrimage.PICK_PAD_MS` etc. with `typeof` guards and numeric fallbacks, so the **integration test sandbox can omit polish.js/verses-more.js/cloud.js** and game.js still boots (see §10.2). If you add a new cross-module constant read, follow the same `(typeof X!=="undefined" && X.K) || fallback` pattern or you will break the sandbox.
- `atlas.js` loads **before** `polish.js`/`game.js` but renders at runtime, so it may reference `Polish`, `SAVE`, `DIFFS` inside functions (guarded) — never at top level.
- Leaflet must be first because `atlas.js` references `L` lazily (everything goes through `hasMap()`).

---

## 3. Module map

| File | Lines (approx) | Kind | Owns |
|---|---|---|---|
| `js/game.js` | 1,200 | engine | save layer, modes, router, run orchestration |
| `js/play.js` | 550 | engine | stage clocks, live question timer, answering, life loss |
| `js/diag.js` | 90 | engine | session diagnostics ring buffer, error listener, dump export |
| `js/briefs.js` | 740 | engine | boot sequence, mode briefs, cold launch |
| `js/results.js` | 610 | engine | end of run, scoring, habit streak, results view |
| `js/panels.js` | 650 | engine | settings, player card, records, journal dialogs |
| `js/director.js` | 550 | engine | voice narration, callouts, momentum classes, ending stages |
| `js/cinematic.js` | 270 | engine | procedural vector art, Seventh Lamp, combo stamps |
| `js/setpieces.js` | 420 | engine | special milestone set-piece sequences |
| `js/audio.js` | 410 | engine | Web Audio sound synthesizers, sample player |
| `js/pilgrimage.js` | 750 | **pure** | site order, unlocking, clocks, verse pools, progress records |
| `js/atlas.js` | 1,100 | view | Leaflet map, rail, dossier, layers, unlock ceremony |
| `js/sites.js` / `js/empires.js` | 732/111 | data | 46 sites with coords/quotes/books/eras; empire polygons |
| `js/srs.js` | 165 | **pure** | SM-2 scheduler, day numbers, queue builder |
| `js/recall.js` | 195 | **pure** | typed grading (exact/close/modernised/wrong), hints |
| `js/assemble.js` | 130 | **pure** | word-tile assembly tokenization and slots |
| `js/meta.js` | 120 | **pure** | XP curves, rank titles, meta progression |
| `js/flow.js` | 150 | **pure** | UI state machine and modal flows |
| `js/polish.js` | 340 | **pure** | clamps, PACE/FLAT clock constants, `pacedClockMs`, heatmap, ghosts, 66 book insights |
| `js/live.js` | 300 | pure-ish | Open-Meteo fetch + 15-min cache + authored climate normals |
| `js/geo.js` | 280 | **pure** | sun position/times, moon phase, solar clock, compass |
| `js/characters.js` | 290 | data | 8 equipable scholars; Bible figures kept only for save compat |
| `js/artifacts.js` | 325 | pure-ish | 46 relics; `unlockForSite` returns a **new** store |
| `js/cloud.js` | 640 | client | auth, mergeSave, save push/pull, boards, trusted-edge score submit |
| `js/bank.js` | 55 | data | merges verse packs, assigns stable ids |

"Pure" = no DOM, no storage, returns new objects, `module.exports` in
Node — that is what makes the logic suites possible.

---

## 4. The engine — structure and architecture

The engine is loaded via `ENGINE_FILES` in strict dependency order:

1. **`js/util.js`** — DOM query, string formatting, sanitization.
2. **`js/audio.js`** (`Snd`) — Web Audio synthesis and element audio.
3. **`js/director.js`** (`Director`, `Backdrop`) — presentation: voice, callouts, body classes, ending stages.
4. **`js/setpieces.js`** (`SetPieces`) — milestone set pieces.
5. **`js/viz.js`** (`Viz`) — spectrum canvas visualizer.
6. **`js/typed.js`** — typed recall UI and on-screen keyboard.
7. **`js/sequences.js`** — multi-blank passages and reconstruct cutscenes.
8. **`js/panels.js`** — player card, settings, records, journal.
9. **`js/cinematic.js`** (`Cinematic`) — Seventh Lamp reward, combo celebrations.
10. **`js/results.js`** — end of run, scoring bonuses, habit streak tracker, XP.
11. **`js/diag.js`** (`Diag`) — session diagnostics ring buffer, error logging, telemetry dump.
12. **`js/briefs.js`** — boot sequence, mode briefs, cold launch into Ur.
13. **`js/play.js`** — stage clocks, live question timer, answering, life loss.
14. **`js/game.js`** — save layer, modes, router `go(view)`, run orchestration.
10. **Menu + brief + site brief + relay brief** (§6.1).
11. **Run state `R` + startRun/questionDuration/nextQuestion** (§5).
12. **Play rendering** — choices, typed mode + on-screen keyboard, timer ring, powers, answering, passage/reconstruct engines, FX helpers.
13. **Seals / endRun / renderResults / Study Hall / Records / Settings.**
14. **Pause, input map, main loop, intro, boot.**

### 4.1 Run tokens — how stale callbacks are killed

Two counters invalidate every deferred action:

- `R.runToken` — bumped by `startRun` and `invalidateRun()`. `afterRun(ms, fn)` wraps `setTimeout` and only fires `fn` if the token still matches. **Every** gameplay timeout goes through it.
- `R.sceneToken` — bumped per question/sequence so per-question entrance animations die on fast answers.

`endRun` is **idempotent** (`if (R.ended) return`) because it is reachable from a timer and a click in the same tick; running it twice would double-bank a run. Tests pin this.

### 4.2 The one run-state object `R`

Assigned wholesale in `startRun`. The fields that matter most:

| Field | Meaning |
|---|---|
| `mode` | one of the 8 mode keys (§6.1) |
| `diff` | resolved DIFFS row (`D.time`, `D.lives`, `D.score`) |
| `used` / `usedRefs` | Sets of served verse **ids** / **references** (dedupe, §8.2) |
| `siteVerses`, `siteIdx` | the pilgrimage site's fixed draw and cursor |
| `siteCommitted` | ledger for serve-time `usedIds` commits |
| `relay` | arc relay queue + per-site banking marks |
| `setpiece`, `setpieceDone` | active sequence + which fired this run |
| `typed`, `speed` | current question is typed / a Swift round |
| `streak`, `best`, `fast` | momentum inputs |
| `overdriveRide/…Offered/…Gift` | the ride-or-bank state machine |
| `pendingSelah` | +5 s carried into the *next* `startTimer` |
| `blitzEnd` | `performance.now()` deadline for Blitz |
| `ghostSamples` | [{t,p}] progress timeline, ≥1.5 s apart |
| `rescheduled` | per-run SRS receipts for the results panel |

---

## 5. The clock — one formula, many surfaces

All times in ms. Constants live in `polish.js` so tests can pin them:

```
PACE        = 1.2    global +20 % (playtest tuning)
FLAT_ADD_MS = 5000   flat +5 s on every question
PICK_PAD_MS = 1500   extra beat on pick questions (pilgrimage.js)
SPEED_MS    = 6000   Swift round base
BLITZ_START_MS = 60000; correct +2000; miss −4000
```

The play clock composes:

```
questionDuration() per mode → playClockMs(ms)
playClockMs(ms)    = momentumClockMs(pickClockMs(ms)) × PACE + FLAT_ADD_MS
pickClockMs(ms)    = ms + PICK_PAD_MS          (pick modes only)
momentumClockMs    = ms × 1.2 when streak ≥ 3  (Building and up)
```

Per-mode bases: Trial `ACTS[act].t × diff`; Daily `10000 × diff`;
practice `12000 × diff`; recall/pilgrim-recall `32000 × diff` (typed);
pilgrimage `Pilgrimage.clockFor(index)` (14.0 s at Ur → 6.5 s at Patmos,
ramped by position, §6.2); relay inherits each site's clock; endless
`max(4200, 12000 − qTotal×180) × diff`; blitz is the shared survival
deadline, min 900 ms per question.

**Printed clocks** (dossier, site brief, relay brief, Trial act cards)
all go through `pacedClockMs(base, diffTime, pad)` — game.js has a local
fallback copy for sandbox loads. Do not compute a printed clock any
other way; four surfaces once disagreed (15.5 s vs 18.9 s vs 23.6 s for
one site — see ASSESSMENT-REPORT §3.4).

Selah (+5 s) mutates `R.tEnd/R.tTotal` immediately **and** banks
`R.pendingSelah` so the next question's `startTimer` inherits it if the
current one resolves first.

---

## 6. Game rules worth knowing cold

### 6.1 Modes and menu policy

`MODES` object + `MENU_ORDER` starting with `"pilgrimage"`. Public hall
cards: Pilgrimage, The Valley (incoming), Word Tablets, Daily, Drill,
Recall, Team, Blitz, Trial, Endless. Hidden (save keys / atlas):
`pilgrim-recall`, `relay`. Challenges and Practice sit in quieter hall
groups. Enter/Space on the menu opens the **first visible, non-incoming**
mode. `atlas:true` routes a mode to the map instead of a brief.

Difficulties (`DIFFS`): **Disciple 3 lives ×1.0 clock ×0.85 score (new-save default)** ·
Watchman 2 lives ×0.85 ×1.0. Unknown keys resolve to Watchman. The site
brief picker (`#sb-diffs`) and Settings both write `SAVE.set.diff`.

Boot skips the intro film. A first session marks the tutorial complete
and calls `startRun("pilgrimage")` at Ur. Returning players with road
progress open the atlas. Corrupted JSON shows the `save-corrupt` state
before that path.

### 6.2 The Pilgrimage (campaign)

- 46 sites × 8 verses, gated linearly: a site unlocks when the previous
  is cleared (`Pilgrimage.isUnlocked`).
- **Draw rings** (`resolvePool`): site books → arc books → testament →
  whole bank; the narrowest ring that can fill 8 wins. Then tier-distance
  ranking, a place-affinity nudge (same book+chapter as the site quote),
  a signature-book quota (`SIGNATURE_QUOTA = 4`), and a site-book floor
  (`SITE_BOOK_FLOOR = 0.625`; six `FULL_PLACE_SITES` demand a full
  site-book draw when the bank allows).
- `drawSite` is **seeded** by `siteId:attempt` (mulberry32) — a retry is
  a different draw, a test is reproducible.
- **`usedIds` are committed serve-time** (`commitSiteVerse` in
  `nextQuestion`): quitting after the verse on stage burns exactly that
  verse, never the whole draw. `expandExclude` also treats a used
  verse's **same-reference siblings** as used, so both blanks of one
  verse cannot both be spent on the journey.
- A site is cleared by surviving it; `record()` keeps per-site
  best/accuracy/attempts and a **sticky `perfect` flag** (100 % clean
  sweep). Arc seals read the sticky flags, so arcs can be perfected a
  site at a time.
- **Relay** (`relay`): a whole arc in one run with shared lives; sites
  bank the moment you pass them (`bankRelaySite`), even if you die later;
  score is deliberately 0 for banked sites.

### 6.3 Set pieces (the cinematic sequences)

Five `DEFS`: `rapid` (5×6 s auto-lock), `lockdown` (3 from one book),
`missing` (passage, 3 blanks, no powers), `nochance` (1 hard verse, ×3
reward, no powers), `reconstruct` (shatter a passage into 5 fragments,
drag/click to rebuild). The Trial fires them by act+question (`TRIAL`);
six sites fire place-bound finales (`SITES`: sinai, jericho, babylon,
golgotha, nineveh, patmos) **after** the site's verses. `launch()` shows
the card, stops the run clock, then chains into `nextQuestion` with the
sequence active. Both `maybeLaunch*` clear `R.typed` first (a finale must
never inherit the closing typed slot's clock). Passage/reconstruct run as
ONE question with sub-answers and at most one life lost
(`finishSequence`).

### 6.4 Momentum, Overdrive, lifelines

- `MOMENTUM_STEPS = [3,5,8,12]` → multiplier ×2…×5; the meter is a pure
  readout of the multiplier. Names: Cold Start/Building/Unbroken/
  Scripture Locked/Overdrive.
- At a streak of exactly 12 the run **stops** and offers ride-or-bank
  (`offerOverdriveChoice`, 9 s auto-bank, Enter rides, B/Esc banks).
  Ride = ×2 gains while held, a miss costs **2 lamps**. Bank = +
  `Polish.overdriveBank(streak, diffScore)` and reset to ×1.
- Lifelines: Selah +5 s; Illuminate burns 2 wrong options (pick) or
  gives 3-level production cues (typed: lengths → initials → first
  word); Second Wind auto-revives once (never in Act V / set pieces /
  the road). Pilgrimage runs lean: 1 Selah, 1 Illuminate, no Wind.
- **Relic armor**: holding ≥1 relic absorbs the first lamp-loss per road
  site (streak still resets).
- Daily: 20 verses seeded by `mulberry32(seedFromString("ctv-"+YYYY-M-D))`
  — everyone gets the same list in the same order. **Only a completed
  run records the day's score**; deaths/abandons are practice.

### 6.5 Scoring (endRun)

```
gained per correct = round((150 + timeBonus) × multiplier × diff.score
                           × (1 + tier×0.12) × setpieceBonus × (riding?2:1))
timeBonus = round(left / total × 140)
end bonuses: streak ×120·diff, accuracy ×1200·diff, per-mode survival,
             pilgrimage ×(1 + road position) ×1.35 if cleared,
             first-clear bonus +90 % of (base+survival)
abandon scores ×0.85. XP = round(total/12 + correct×14 + 300 if finished)
```

---

## 7. Audio system

- Beds: 7 mp3s, `ensureTrack` lazily creates `Audio` elements routed
  through WebAudio (`createMediaElementSource`); if routing fails, the
  element's own volume tracks the music setting. Exactly one bed plays
  (`playTrack` stops the others).
- SFX: 8 samples with per-name gains; `SFX_EXCL` (heart, tick) replace
  themselves so rapid re-triggers don't stack; `SFX_DUCK` briefly duck
  the bed. **If an mp3 is missing, `playSfx` returns false and the
  caller falls back to a synthesized tone** — deleting a sample never
  breaks the game.
- Voice: recorded mp3s keyed by a normalized sentence (`VOICE_FILES` +
  `voiceKey`); new lines without a file fall back to device TTS with a
  scored voice pick (baritone English preferred). Voice is exclusive — a
  new line cuts the previous.
- AudioContext is created on the **first user gesture** (`Snd.unlock`);
  browsers block earlier.
- Music at volume 0 stays at 0: every duck/tension helper early-returns
  to silence rather than using a floor.

---

## 8. Content: the verse bank

### 8.1 Shape

Every verse: `{ r:"Ref", b:"Book", t:1-5 tier, p:"prefix", a:"answer",
s:"suffix", d:[authored distractors] }`. 899 verses · 66 books ·
27 passages. `fullVerse(v) = p + " " + a + sep(s) + s`.

### 8.2 Identity and duplicates

- **ids are content-derived**: `verseId(v) = slug(r) + "~" + first-4-words-of-slug(a)`
  (`bank.js`). Ids survive reordering; positions never meant anything
  again after v2.
- **33 references exist twice** (two blanks on the same verse —
  intentional content, verified by loading the bank in a VM). Two guards
  keep them from meeting in play:
  1. journey draws: `expandExclude` (pilgrimage.js) treats same-ref
     siblings as used;
  2. every pick-mode draw wraps its pool in `poolSansRepeatRefs`
     (game.js: drawVerse, drawEndlessVerse, buildDailyList,
     buildReviewQueue, SetPieces same-book) against `R.usedRefs`,
     which is added the moment a verse is served.
     A drained tier relaxes the rule rather than stalling.

### 8.3 Three packs, one rule

`verses.js` (hand core) · `verses-extra.js` (**generated** by
`scripts/build-verse-extra.js` — never hand-edit) · `verses-more.js`
(hand-authored). `bank.js` concatenates in that order. QA gate
(`scripts/qa-verses.js` + `content/quarantine.json`) blocks bad verses
from ever entering — run before every content change.

### 8.4 Distractors

`buildChoices` prefers authored `d[]`, then bank answers ranked by a
shape score (length, word count, shared content words, openings —
mirrored in `Polish.choiceShapeScore` for tests). Last resort uses real
bank answers nearest in length — numbered fakes were removed.

---

## 9. Persistence & cloud (see also BACKEND-EVALUATION.md)

- `localStorage["ctv_save_v3"]`. `load()` deep-merges over
  `DEFAULT_SAVE` per section so **new fields default in without a
  migration**, old v2 saves re-point verse stats through
  `LEGACY_IDS` and seed SRS cards, and `migrateProfile` folds retired
  Bible-figure skins into scholars.
- `persist()` logs and records `save-blocked` via `Diag` if `localStorage` throws, and shows a named panel once per session. It still never throws to the play loop. Cloud push is debounced only when signed in and configured.
- `mergeSave` (cloud.js, pure, tested): max of numeric bests/life/xp,
  union of seals/usedIds, per-site field merge (cleared OR-cleared,
  bests max), SRS card = more reps then later review, daily = higher
  score for the same date. Push uses an optimistic revision lock —
  a remote revision ahead of the last merge refuses the blind overwrite.
- Score submission is **trusted-edge-only**: `functions.invoke("submit-score")`
  applies server-side clamps, rate limits, and caller auth. If it fails,
  the browser does not write directly to leaderboard tables; local records
  remain available and the UI reports the unavailable board state.

---

## 10. Testing — the three styles (know which one you are writing)

`node test.js` runs 54 suites in a fixed order: content gate → pure
logic → integration sandbox → structural/static suites. CI also runs
`npm run lint` (Oxlint `complexity` max 20) before the suite.

1. **Pure requires** (`srs.test.js`, `recall.test.js`, `geo.test.js`,
   `pilgrimage.test.js`, `polish.test.js`, parts of `cloud.test.js`):
   `require()` the module, assert behaviour. Prefer this whenever the
   logic can live in a pure module.
2. **Integration sandbox** (`integration.test.js`): boots the real
   bundle (verses, extra, passages, legacy-ids, bank, srs, recall,
   sites, empires, geo, pilgrimage, live, atlas, game) in a `vm` context
   with a hand-rolled DOM shim — **no jsdom dependency**. It executes
   actual runs: `startRun`, `nextQuestion`, `resolveAnswer`, `endRun`,
   save migrations, daily one-shot, serve-time usedIds. Gotchas:
   - the sandbox omits `verses-more.js` → `VERSES.length === 305` there
     (899 verses in the browser). Assert against what the sandbox loads.
   - it omits `polish.js`/`cloud.js` → game.js's `typeof`-guarded
     fallbacks are load-bearing. If you made game.js call
     `Polish.foo()` unguarded, this suite is what catches it.
   - `setTimeout` returns 0 (no-op) — afterRun callbacks never fire;
     tests call the next step directly.
   - `document.hidden=false`, no `fetch`, `AudioContext` throws —
     all real degradation paths the game is written to survive.
3. **Static source pins** (`menu-modes`, `improvements`, `excitement`,
   `answering`, `motion`, `game-structure`, `ui-structure`, `sky3d`,
   `fixes`): read `game.js`/`index.html`/CSS as text and assert the
   pattern exists. Used where the *behaviour is the source shape*
   (script order, menu policy, CSS keyframes, removed features). When
   you change a pinned behavior, change the pin in the same commit —
   a failing static suite is the design conversation, not noise.

`fixes.test.js` pins the 2026-08-16 improvement set (default difficulty,
daily completion-gating, serve-time usedIds, menu policy, clock helper,
ref dedupe, payload deletions, 66 insight cards, meta/a11y).

**Adding a suite:** create `foo.test.js`, print `PASS — foo · n
assertions` / exit 1 on failure, and append it to `SUITE` in `test.js`.

---

## 11. Hard-to-find details & gotchas

- **The intro replays on every reload** by design (`introDone` is a
  session variable, not saved). Skip button appears once playback starts;
  Escape skips; the video error handler degrades to "Tap to enter".
- **`user-select:none`** is on the game body, but quotes/dossier/study
  verses opt back in with `user-select:text` — keep that when adding
  copyable text.
- **`#judge-burst` sprite sheets** are 8-frame steps() animations; cells
  are 512×944; `--cell-h:min(100vh,148vw)` derives the width. The two
  source PNGs are the largest assets in `assets/` (~2.6 MB each).
- **Cloud chip states**: Local only (unconfigured) / Offline /
  Cloud ready / ☁ name (signed in). Boards show a Sign-in hint when
  anonymous — anonymous players never appear on boards.
- **`Atlas.unmount()` on leaving the map** stops the day/night
  terminator clock; without it a hidden-view redraw loop keeps a timer
  alive for the whole session.
- **`R.lastPickKey/lastPickAt`** — pressing the same option letter twice
  within 420 ms locks immediately (keyboard fast-path for two-tap mode).
- **Keyboard map**: A–D / 1–4 answer · double-letter locks · Enter/Space
  confirm (two-tap mode) or pause-resume contexts · S Selah · I
  Illuminate · **Ctrl/Alt+S / Ctrl/Alt+I** work while the typed input is
  focused · Esc walks back one step (play→pause, sitebrief→atlas,
  else→menu) · in the Overdrive dialog: Enter rides, B/Esc banks · any
  key skips the site quote.
- **Typed mode input routing**: on touch devices the on-screen keyboard
  is the surface (`inputmode=none` when open); desktop focuses the real
  input. Physical keys are also intercepted globally so focus is never
  required.
- **`BY_TIER` drain behavior**: when a tier's unused pool empties,
  `drawVerse` clears `R.used` **for that tier only** and re-draws —
  endless runs cannot starve.
- **Ghosts**: sampled ≥1.5 s apart (`pushGhostSample`), stored only when
  the run beats the previous best; the marker interpolates your live
  progress against it (`sampleGhost`). Pilgrimage ghost publishes to the
  cloud as a coarse 0–1 road-progress timeline.
- **Study Hall** is rebuilt on every visit; the book `<select>` is
  populated once (guarded by `options.length<=1`) — don't re-wire
  listeners per render.
- **`SAVE.board`** is the local top-10 across modes, sliced and re-sorted
  on every run; the Records screen's "By Book" tab reads `SAVE.books`
  accuracy — your revision list.
- **`.vercelignore` excludes `content/`, `scripts/`, tests and `*.md`**
  — runtime code never reads `content/`; it exists for QA tooling.
- **A mysterious "♛ SCRIPTURE RECALL…" overlay** sometimes seen in the
  in-app browser is a browser-extension artifact, **not game code**
  (verified: zero matches in the DOM tree).
- **Deleting/renaming an sfx or voice mp3** is safe (synth/TTS
  fallbacks); deleting a bed pauses ambience only; deleting art shows
  the glyph placeholders. Only verse/passage data has a hard gate.
- **Windows line endings**: the repo is CRLF; grep patterns in tests
  normalize (`\r`) — write source pins tolerant of both.

---

## 12. Common tasks

| Task | Do this |
|---|---|
| Add verses | edit `verses-more.js` (hand) or regenerate extra; run `node test.js` — the QA gate validates refs/typos/distractors |
| Add a site | append to `SITES` in `js/sites.js` (coords, books, quote, era…); arcs in `ARCS`; pilgrimage tests assert count/order |
| Tune clocks | change `PACE`/`FLAT_ADD_MS` in `polish.js` only; every surface follows; update `excitement.test.js` pins |
| Add a mode | extend `MODES` (+ `best` key in DEFAULT_SAVE), decide `MENU_ORDER`/`hidden`, wire a draw path in `nextQuestion`/`questionDuration` |
| Add a set piece | add a `DEFS` entry + trigger (`TRIAL` or `SITES`); banner copy in `index.html` setpiece card is static default text |
| Change save shape | add the field to `DEFAULT_SAVE` (merge does the rest); bump nothing — v3 merges per-section |
| Ship | `node test.js` → commit → Vercel deploys on push; Supabase changes go through the SQL editor / `supabase functions deploy` (see BACKEND.md) |
| Local run | `node scripts/dev-server.js` → http://localhost:8781 |
