# Plan — Fix the code-organisation findings

**Date:** 2026-08-18
**Source:** `docs/CODE-ORGANISATION.md`
**Job:** close every finding in that report. Not a rewrite. Not the coffee-pilgrimage product plan.
**Constraint:** the game must still run from `file://` with no bundler, no TypeScript, no ES-module conversion.

Work in this order. Each phase is shippable alone. Do not start a later phase until `node test.js` is green on the previous one.

---

## What “done” means for the whole plan

A stranger clones the repo and, from the root alone, can:

1. Read a short `README.md` and know what the game is, how to run it, how to test it, and where the real map is (`docs/DEVELOPER-GUIDE.md`).
2. See `index.html`, `README.md`, `package.json`, `test.js`, `manifest.webmanifest`, `vercel.json` — not 36 test files and 12 autopsy reports.
3. Trust the developer guide against the tree as it is (not as it was when `game.js` was 4,650 lines).
4. Find the play loop in `js/play.js` and the save/modes/router in `js/game.js`.
5. Hit a corrupt save or a persist failure and get a named panel, not a silent wipe.
6. Open Settings and copy a diagnostics blob after an unexpected exception.

Scores the report was grading, after this plan:

| Question | Now | Target |
|---|---|---|
| Files in a proper location | 6 / 10 | 9 / 10 |
| Long files under control | 7 / 10 | 8 / 10 |
| First-time developer can understand | 5 / 10 | 8 / 10 |
| Errors tracked easily | 4 / 10 | 8 / 10 |

9, not 10: globals + script tags stay, because `file://` stays.

---

## Do not

- Add a bundler, TypeScript, React, or ES modules.
- Split `js/pilgrimage.js`, `js/sites.js`, or `js/atlas.js`.
- Delete `sky3d.test.js` (move it; it is a cheap lock).
- Delete empty `catch`es on audio, video, speech, Leaflet `removeLayer`, or `share`.
- Soften the ordeal, add modes, or mix this work with `plans/coffee-pilgrimage.md`.
- Rewrite old reports. Move them. Stamp them archived.
- Move `scripts/verse-extra-plans.js`. `scripts/gen-plans.js` writes it; `scripts/build-verse-extra.js` reads it. It is a generated build input, not a leftover. Document it; do not relocate it.

---

## Phase 0 — Baseline

**Why first:** every later move is mechanical. A red suite now is a pre-existing break, not our regression.

- Run `node test.js`. Record the suite count (36 today) and that all pass.
- Run `node --check` on every file under `js/` if you want a parse-only extra. Not required if the suite is green.

**Done when:** the same command is green, and we do not “fix” unrelated failures inside this plan.

---

## Phase 1 — Front door (P0)

No runtime behaviour change. Root still messy; a newcomer can survive it.

### 1.1 `README.md` at repo root

About 20–40 lines. No history, no design argument.

Must contain:

- One sentence: static KJV verse trial, pilgrimage from Ur to Patmos.
- How to play: open `index.html`, or `npm start` / `node scripts/dev-server.js` → `http://localhost:8781`.
- How to test: `npm test` / `node test.js`.
- The mental model block from the organisation report (bank → srs/recall → road → atlas → cloud → engine → `index.html`).
- Links: `docs/DEVELOPER-GUIDE.md`, `docs/CODE-ORGANISATION.md`, `plans/coffee-pilgrimage.md`, `docs/BACKEND.md` (after Phase 2 moves it).
- One line on the rule: globals + classic `<script>` tags on purpose; `file://` must keep working.

### 1.2 `package.json` scripts

Today it is `{ "dependencies": {} }`. Give it a name and:

```json
{
  "name": "complete-the-verse",
  "private": true,
  "scripts": {
    "test": "node test.js",
    "start": "node scripts/dev-server.js"
  }
}
```

No new dependencies.

### 1.3 First pass of `docs/DEVELOPER-GUIDE.md`

Update only what is already false, so Phase 1 does not wait on later splits:

- Date and “written against” line → today.
- Companion links: `ASSESSMENT-REPORT.md` → `docs/reports/ASSESSMENT-REPORT.md` (will exist after Phase 2; if Phase 1 ships alone, keep a one-line “reports are moving” note, then fix links in Phase 2).
- Tree map: `test/*.test.js` + root `test.js` (write it as the *target* layout; Phase 3 makes it true).
- Script load order: the **actual** `index.html` list (verses-ascent, assemble, meta, flow, util, audio, director, setpieces, viz, typed, sequences, panels, cinematic, results, briefs, then game). The guide currently stops at `cloud.js` then `game.js` and is wrong.
- Module map: drop `game.js` 4,650. List the engine files from `scripts/engine-source.js`. `Snd` → `js/audio.js`. `Backdrop` / `Director` → `js/director.js`. `SetPieces` → `js/setpieces.js`. `Viz` → `js/viz.js`.
- §4 “the engine is one file” → “the engine is `ENGINE_FILES`; `game.js` is save, modes, router, run orchestration.”
- §6.1 still describes Disciple as default with three difficulties. The code is Watchman-only (`DIFFS.watchman`, `resolveDiff` always returns it). Fix the guide to the code. Do not reintroduce Disciple here.
- §10 “Adding a suite”: `test/foo.test.js`, append to `test.js`. After Phase 3 this is true.
- `metadata.test.js` pins live verse/site/suite counts in the guide. After editing, run that suite. Do not write “36 sites” or “423 verses” as current.

**Done when:** `README.md` exists; `npm test` is documented; the guide no longer claims `game.js` is 4,650 lines or that `Snd` lives inside it; `node metadata.test.js` still passes (or will, once suite-count wording matches).

---

## Phase 2 — Put documents where they belong (P1)

### 2.1 Root reports → `docs/reports/`

Move, do not edit, these files:

- `ASSESSMENT-REPORT.md`
- `CHANGES-REPORT.md`
- `FULL-CHANGES-REPORT.md`
- `TODAY-CHANGES-REPORT.md`
- `IMPROVEMENT-REPORT.md`
- `COMPETING-FEATURES-REPORT.md`
- `EXCITEMENT-REPORT.md`
- `EVIDENCE-CHECKLIST.md`
- `NEXT-STEPS-REPORT.md`
- `UI-REPORT.md`
- `GAME-STATE-REPORT.md`

Add `docs/reports/README.md` (five lines): these are snapshots; they drift; trust tests + `docs/DEVELOPER-GUIDE.md` + `plans/` for current truth.

### 2.2 `BACKEND.md` → `docs/BACKEND.md`

It is a runbook, not an autopsy. Update references in:

- `docs/DEVELOPER-GUIDE.md`
- `docs/BACKEND-EVALUATION.md`
- `docs/SECURITY-EVALUATION.md` (if it links the old path)
- `docs/CODE-ORGANISATION.md`
- `README.md`

Do not rewrite the runbook.

### 2.3 `architecture.html` → `docs/architecture.html`

Player-facing explainer, not a code map. Leave content. Link it from the README under “how the game plays.”

### 2.4 Living docs stay

| Stays | Why |
|---|---|
| `docs/DEVELOPER-GUIDE.md` | the map |
| `docs/CODE-ORGANISATION.md` | the findings this plan closes |
| `docs/SECURITY-EVALUATION.md` | living |
| `docs/BACKEND-EVALUATION.md` | living |
| `plans/coffee-pilgrimage.md` | product |
| `plans/SMOKE-CHECKLIST.md` | QA |
| `plans/v1.4-truth-onboarding-review.md` | historical plan, already in `plans/` |

**Done when:** root has no `*-REPORT.md` and no `BACKEND.md`; grep for those old paths in `docs/` and `plans/` is clean or redirected; the game still boots (no runtime file moved).

---

## Phase 3 — Tests live in `test/` (P1)

This is the largest mechanical change. Do it as one commit.

### 3.1 Layout

```
test.js                 stays at root — the public gate (`node test.js` / `npm test`)
test/*.test.js          every suite, including sky3d.test.js
scripts/repo-root.js    NEW: module.exports = path.join(__dirname, "..")
```

Do **not** move `test.js` into `test/`. The front door command stays one token.

### 3.2 One root helper

`scripts/repo-root.js` is the only place that knows where the repo root is. Every suite that today does `const root = __dirname` switches to:

```js
const ROOT = require("../scripts/repo-root");
```

`readEngine(ROOT)` — never `readEngine(__dirname)` after the move.

Requires change from `./js/…` / `./scripts/…` to `../js/…` / `../scripts/…`.

### 3.3 `test.js`

`SUITE` entries become `"test/srs.test.js"` etc. `path.join(__dirname, file)` keeps working because `__dirname` is still the repo root.

### 3.4 Files that will break if forgotten

These assume they live at the repo root today. Every one must be opened:

| Suite | Typical trap |
|---|---|
| `game-structure.test.js` | `root` + existence list for `index.html`, `js/`, `content/` |
| `engine-modules.test.js` | reads `index.html` and `integration.test.js` by path |
| `integration.test.js` | `path.join(__dirname, f)` for engine files |
| `e2e-game-elements.test.js` | same |
| `atlas.test.js` | `js/atlas.js` via `__dirname` |
| `metadata.test.js` | `index.html`, `docs/DEVELOPER-GUIDE.md`, `test.js`, `manifest.webmanifest` |
| `ui-structure.test.js` | markup + CSS paths |
| `fixes.test.js` | mentions `ASSESSMENT-REPORT.md` in a comment only — comment may point at `docs/reports/` |
| every suite using `readEngine(__dirname)` | must pass `ROOT` |

`engine-modules.test.js` currently reads `integration.test.js` from root. After the move: `path.join(ROOT, "test", "integration.test.js")`.

### 3.5 Guide + comments

`docs/DEVELOPER-GUIDE.md` §10: suites live in `test/`. `scripts/engine-source.js` comment that names `integration.test.js` should say `test/integration.test.js`.

**Done when:** `node test.js` is 36/36 green from the repo root; `npm test` is the same; a `dir` of the root shows no `*.test.js` except nothing — only `test.js`; `test/sky3d.test.js` still exists.

---

## Phase 4 — Leftovers (P1 remainder)

- Move `scripts/split-monolith.js` → `scripts/archive/split-monolith.js`. Nothing requires it. Add `scripts/archive/README.md`: one-shot tools, not part of `node test.js`.
- Add `.claude/` to `.gitignore`. If `.claude/launch.json` is tracked, `git rm -r --cached .claude` in the same change. Do not delete the folder on disk if the user still uses it.
- Confirm `audio/_orig_backup/` is in `.gitignore` (it already is). Confirm `.vercelignore` excludes tests, `content/`, `scripts/`, `*.md` if that file exists; if it is untracked, commit it. Do not deploy `test/` or `docs/reports/`.
- Add a short `scripts/README.md`: which scripts a human runs (`dev-server.js`, `qa-verses.js`, `verse-stats.js`) vs generated (`verse-extra-plans.js` via `gen-plans.js`).

**Done when:** a first `ls` of `scripts/` is a toolbox, not a museum; `.claude` is not a committed concern.

---

## Phase 5 — Runtime errors become visible (P3)

Player-facing. Do this before the `game.js` extract so the new states are not mid-split.

### 5.1 New `js/diag.js`

Small. Parse-safe. No `SAVE`, no `R` at parse time.

Owns:

- A ring of the last **20** events in `sessionStorage` (`ctv_diag_v1`).
- `Diag.record({ kind, message, stack, at })`.
- `Diag.dump()` → plain text: game name, user agent, save schema version, last N events.
- `Diag.install()` → `window.onerror` and `window.onunhandledrejection`.

Load it from `index.html` **before** `js/game.js`, and add it to `ENGINE_FILES` **immediately before** `js/game.js` (or before `js/play.js` once that exists). Same parse contract as everything else.

### 5.2 Save load — stop the silent wipe

Today `load()` is:

```js
}catch(e){ return JSON.parse(JSON.stringify(DEFAULT_SAVE)); }
```

Change to:

1. `console.error` the exception.
2. `Diag.record` with kind `save-corrupt`.
3. Copy the raw string to `localStorage` key `ctv_save_v3_broken` (best effort).
4. Return a default save **for this session**.
5. After boot (`briefs.js` / first `go`), if that flag is set, `showState("save-corrupt")`.

New `Flow` state `save-corrupt`:

- Kick / title / body: the record on this device would not open; a copy of the broken file is held; continuing starts a fresh local record.
- Primary: Continue with a new record.
- Secondary: Copy diagnostics.

Do **not** overwrite the broken key until they confirm Continue.

### 5.3 Save persist — stop the silent no-op

Today `persist()` empty-catches `localStorage.setItem`.

Change to:

1. `console.error`.
2. `Diag.record` kind `save-blocked`.
3. `showState("save-blocked")` once per session (do not loop if they keep playing).
4. Copy: the lamps are still burning on screen; this device refused to write the record (private mode, quota, blocked storage).

### 5.4 Settings

In `renderSettings` (`js/panels.js`): a quiet button **Copy diagnostics**. Writes `Diag.dump()` to the clipboard. Toast on success. Same blob the `save-corrupt` secondary uses.

### 5.5 Tests

New `test/diag.test.js` (name follows Phase 3 layout):

- `Diag.record` then `dump()` contains the message.
- Ring caps at 20.
- `load()` fixture with garbage JSON: returns a default save **and** records `save-corrupt` (sandbox `localStorage` in `test-shim.js`).
- `persist` failure path: shim `setItem` to throw; assert a record is stored and `Flow` knows `save-blocked`.
- Pin that `audio.js` / `director.js` speech catches stay empty (optional; do not “fix” them).

Add the suite to `test.js`. Update `Flow.VIEWS` / `STATES` tests in `flow.test.js`.

**Done when:** corrupting `localStorage` by hand and reloading shows `save-corrupt`, not a silent new pilgrim; Settings can copy a dump; `node test.js` includes the new suite and is green; audio/speech catches are untouched.

---

## Phase 6 — Extract the play loop (P2)

The only remaining runtime giant. Do this **after** tests have a home and diagnostics exist.

### 6.1 New file `js/play.js`

Header: **PLAY — the live question: clocks on stage, timer, next question, answering, life loss.** Does not own save, modes, the router, or results.

Move these functions **as-is** from `js/game.js` (line numbers as of 2026-08-18, will shift; use names):

| Block | Functions |
|---|---|
| Stage clocks | `pickPadMs`, `pacedClockMs`, `pickClockMs`, `momentumClockMs`, `playClockMs`, `questionDuration`, `currentTier` |
| Advance | `nextQuestion` (and any private helper it already calls that nothing else needs) |
| Timer | `armTimer`, `startTimer`, `tickTimer`, `stopTimer`, and the existing time-up path |
| Answering | `answerButtons`, `buildChoices`, `confirmAnswer`, `answer`, `recordDecision`, `resolveAnswer`, `loseLife` |

**Stay in `js/game.js`:**

- `DEFAULT_SAVE`, `load`, `persist`, migrations
- `MODES`, `DIFFS`, `ACTS`, `SEALS`, `MOMENTUM_STEPS`
- `go`, `applyLeave`
- `startRun`, `beginAct`, `endRun`
- HUD / chips / witness / judge that other views call
- Input map that is not confirm/answer

`startRun` remains the orchestrator. It calls `nextQuestion` at runtime. That is the same pattern as today’s `Director` / `SetPieces`.

### 6.2 Load order

Insert `js/play.js` in `ENGINE_FILES` **immediately before** `js/game.js`:

```
… briefs.js, play.js, game.js
```

Same tag, same order, in `index.html`.

Parse contract: `play.js` may mention `SAVE`, `R`, `persist`, `MODES` **only inside functions**. A top-level read of `SAVE` fails `engine-modules.test.js`. Follow the existing `typeof X!=="undefined"` guard if a constant is needed at bind time.

### 6.3 Tests that grep the engine

`readEngine()` concatenates the list. Suites that search the concatenation (`answering.test.js`, `excitement.test.js`, `coffee-pilgrimage.test.js`, `game-structure.test.js`) keep working **if** the functions still exist somewhere in `ENGINE_FILES`.

Suites that read `js/game.js` as a raw path for a function name must be pointed at `js/play.js` or at `readEngine(ROOT)`.

Add one assertion to `engine-modules.test.js`: `typeof nextQuestion === "function"` and `typeof startRun === "function"` after a full boot; after the no-`game.js` parse, `nextQuestion` exists and `startRun` does not.

### 6.4 Guide

§4 of `docs/DEVELOPER-GUIDE.md`: play loop is `js/play.js`; `game.js` is save / modes / router / `startRun` / `endRun`. Refresh the approximate line count.

**Done when:** `js/game.js` is no longer the place a newcomer hunts for “what happens when I tap B”; `node test.js` green; parse contract still forbids `play.js` from touching `startRun` at parse time; a real browser coffee at Ur still answers, times out, and loses a lamp.

**Do not** also extract HUD, quotes, or Overdrive in this phase. One seam.

---

## Phase 7 — Split `css/game.css` (P2 optional in the report, in scope here)

The report called this optional. “Completely” includes it, as one last file-home fix.

### 7.1 Cut

| File | Owns |
|---|---|
| `css/game.css` | tokens (`:root`), film layers, intro, boot, menu, brief, act, results, panels, settings, shared buttons |
| `css/play.css` **new** | `#v-play`, HUD, verse stage, options, timer ring, typed/assemble, set-piece, overdrive dialog, pause, judge burst, pressure/momentum body classes |

`css/atlas.css` stays the third file.

### 7.2 Load

`index.html`: `game.css` then `play.css` then `atlas.css`.

### 7.3 Tests

Every suite that reads `css/game.css` for play selectors (`ui-structure`, `excitement`, `gameplay-polish`, …) must read **both** files, or concatenate. Do not leave a pin that fails because `.ring` moved.

**Done when:** visual play at Ur is unchanged (same classes, new file); hall screens unchanged; tests green.

If a selector is shared and the cut is ugly, **stop**. Leave one CSS file. A bad split is worse than 1,884 sectioned lines. The escape hatch is allowed; record it in `docs/CODE-ORGANISATION.md` if you take it.

---

## Phase 8 — Close the loop

- Re-read `docs/DEVELOPER-GUIDE.md` top to bottom against `index.html` + `scripts/engine-source.js` + `test.js`. Fix leftover “root test files”, old companion paths, old line counts.
- Stamp `docs/CODE-ORGANISATION.md` with a status line at the top: findings closed by this plan on DATE; leftover exceptions (globals, `verse-extra-plans.js` staying put, CSS escape hatch if used).
- `architecture.html` link in the README is the `docs/` path.
- Root listing should look like:

```
README.md
index.html
package.json
test.js
manifest.webmanifest
vercel.json
css/
js/
docs/
plans/
test/
scripts/
assets/
audio/
sfx/
vendor/
supabase/
content/
```

**Done when:** that listing is true (plus `.gitignore` / `.vercelignore` / `node_modules` locally); `node test.js` green; a stranger can follow the README without opening a report.

---

## Suggested commits (one phase each)

1. `docs: README, npm scripts, and a guide that matches the tree`
2. `docs: move reports to docs/reports and BACKEND.md to docs/`
3. `test: move suites into test/ and resolve the repo root in one place`
4. `chore: archive split-monolith, ignore .claude, document scripts`
5. `fix: surface save failures and unexpected exceptions`
6. `refactor: extract the play loop into js/play.js`
7. `refactor: split play CSS from the hall` (or skip, with a note)
8. `docs: mark organisation findings closed`

Do not squash Phase 3 with Phase 6. If the extract is dirty, the test move must still be revertible alone.

---

## Verification (every phase)

```
node test.js
```

After Phases 5–7, also:

- `node scripts/dev-server.js` → open Ur → answer one, miss one, timeout one.
- Phase 5 extra: in DevTools, set `ctv_save_v3` to `{`, reload, confirm `save-corrupt`. Settings → Copy diagnostics → paste contains `save-corrupt`.
- Phase 6 extra: confirm typed prove-it (last verse of a site) still grades.
- Phase 7 extra: menu, atlas, play — no unstyled flash.

No browser-automation requirement. A human pass of Ur is enough.

---

## Out of this plan (findings we are explicitly not “fixing” by changing them)

| Finding | Why it stays |
|---|---|
| Globals instead of imports | `file://` + no bundler |
| `js/sites.js` 911 lines | data |
| `js/atlas.js` 1,099 lines | one view |
| `js/pilgrimage.js` 726 lines | the model |
| `content/quarantine.json` | data dump |
| `scripts/verse-extra-plans.js` | generated input to the extra-verse builder |
| Empty catches on media APIs | correct |
| `sky3d.test.js` | keep, just move |
| Coffee-pilgrimage product work | different plan |

---

## Order vs the original P0–P3

| Report item | Phase |
|---|---|
| README | 1 |
| Update developer guide | 1, then 8 |
| Move tests | 3 |
| Move reports | 2 |
| Move BACKEND.md | 2 |
| package.json scripts | 1 |
| Extract play loop | 6 |
| Split CSS | 7 |
| Save load/persist visibility | 5 |
| window.onerror + copy diagnostics | 5 |
| Leave media catches | 5 (do not touch) |
| Archive split-monolith / ignore .claude | 4 |
