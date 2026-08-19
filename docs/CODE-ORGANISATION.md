# Complete the Verse — Code organisation

**Date:** 2026-08-18  
**Status:** **Executed and Verified (all 39 test suites green)**
**Scope:** directory layout, file size and seams, first-read understandability, how errors surface.  
**Not in scope:** product design, verse quality, whether the game is worth $8–12.  
**Evidence this session:** line counts from a walk of every text file (excluding `node_modules`, `vendor`, `assets`, `audio`, `sfx`); `index.html` script order; `scripts/engine-source.js`; `js/flow.js` state table; all 39 test suites passing under `test/`.

---

## Verdict

The **runtime code is better organised than the repository**. Logic that can be pure lives in named files with honest headers. The engine has already been split once (`game.js` is 2,149 lines, not the 4,650 the developer guide still claims). A newcomer who is pointed at `docs/DEVELOPER-GUIDE.md` and `js/pilgrimage.js` can work. A newcomer who opens the repo root cannot — they land in a junk drawer of reports and tests.

Errors that the **tests** can see are tracked well. Errors that happen **in a player’s browser** are mostly swallowed. There is no crash reporter, no session log, and no `window.onerror`. Known failures have a player-facing panel. Unknown ones vanish.

Nothing here needs a framework or a bundler. The `file://` + zero-install constraint is real and the layout should keep honouring it.

---

## 1. Does every file have a proper location?

### What is in the right place

| Home | What lives there | Verdict |
|---|---|---|
| `js/` | 35 modules: data, pure rules, engine, views | Correct. Names match jobs. |
| `css/` | `game.css` (play/hall) + `atlas.css` (map) | Correct split. |
| `assets/` | relics, scholars, intro, traveler, judge | Correct. Character folders are consistent (`portrait.png` + `token.png`). |
| `audio/` + `audio/voice/` + `sfx/` | beds, narration, effects | Correct. |
| `vendor/` | Leaflet + supabase-js, no CDN | Correct and tested. |
| `content/` | quarantine bank + legacy id snapshot | Correct — tooling only. |
| `scripts/` | QA, bank loaders, test shim, engine file list, dev server | Correct. |
| `supabase/` | migrations + `submit-score` edge function | Correct. |
| `docs/` | developer / security / backend evaluations | Correct. |
| `plans/` | product and smoke plans | Correct. |

Load order is not folklore. `index.html` lists the scripts. `scripts/engine-source.js` is the engine tail. `engine-modules.test.js` fails if those two lists drift. That is real organisation, not a comment.

### What is in the wrong place

**The repo root is the problem.** Measured this session: **54 text files at root, 9,164 lines.** Of those:

- **39 `*.test.js` files + `test.js`** sit next to `index.html`. They belong in `test/`.
- **12 report markdown files** (`ASSESSMENT-REPORT.md`, `CHANGES-REPORT.md`, `EXCITEMENT-REPORT.md`, …) sit next to the game. They belong in `docs/reports/` or an archive. Several contradict each other and the current tree (the assessment still says `game.js` is 4,612 lines and there is no favicon; both are stale).
- **`architecture.html`** is a player-facing explainer, not architecture. Fine to keep; it should not be mistaken for the code map. The code map is `docs/DEVELOPER-GUIDE.md`.
- **`BACKEND.md`** is a runbook. It should live under `docs/` with the other backend writing.
- **`package.json`** has empty `dependencies` and no scripts. It does not tell a newcomer `node test.js` or `node scripts/dev-server.js`.
- **No `README.md`.** Three older reports already flag this. It is still true.

**Leftovers that are not a home:**

| Path | Why it is odd |
|---|---|
| `scripts/split-monolith.js` | One-shot splitter. Reads a file named `complete-the-verse(1) (1).html`. Not part of day-to-day work. |
| `scripts/verse-extra-plans.js` | 4,410 lines — the largest *text* file in the repo after quarantine JSON. Generation notes, not runtime. |
| `audio/_orig_backup/` | Orphaned masters. Fine if gitignored; should never ship. |
| `sky3d.test.js` | A tombstone that asserts Three.js is gone. Useful as a regression lock, misplaced at root. |
| `.claude/` | Tooling artifact at repo root. |

**`js/` itself is mostly honest.** Verse packs (`verses.js`, `verses-extra.js`, `verses-more.js`, `verses-ascent.js`) are in the right folder even though they are data. They must load in the browser with no build step, so they cannot live only under `content/`. `legacy-ids.js` is 5 lines and looks lonely; it is in the right place because `bank.js` needs it at parse time.

---

## 2. Super-long files — what still needs a split

Text files over ~800 lines, with a verdict.

| File | Lines | Verdict |
|---|---|---|
| `content/quarantine.json` | 6,677 | Data dump. Leave it. |
| `scripts/verse-extra-plans.js` | 4,410 | Too big for a script. Archive or generate; do not grow it. |
| **`js/game.js`** | **2,149** | **Still the god file.** Split once already (audio, director, set pieces, viz, typed, panels, results, briefs, cinematic). What remains is save + modes + router + **the entire run/question/answer loop** + HUD. Further split is justified, but only along seams that already have names: answering, clocks, run lifecycle. Do not slice it into twelve 200-line files that all close over `R` and `SAVE`. |
| **`css/game.css`** | **1,884** | Large but sectioned (`BACKDROP`, `INTRO`, `BOOT`, `MENU`, …). A play-vs-hall split would help; a component-CSS rewrite would not. |
| `js/atlas.js` | 1,099 | One view, one job (Leaflet + rail + dossier). Long, coherent. Leave it unless a second map appears. |
| `js/sites.js` | 911 | Data. Leave it. |
| `js/briefs.js` | 732 | Menu, intro, boot, briefs. A bit of a leftover bucket from the split. Readable. Not urgent. |
| `js/pilgrimage.js` | 726 | Pure campaign rules. This is the model file. Do not split. |
| `index.html` | 595 | Every view in one page, by design. Fine. |
| `js/cloud.js` | 632 | One client. Fine. |
| `js/results.js` | 613 | One screen. Fine. |
| `docs/DEVELOPER-GUIDE.md` | 478 | **Stale.** Still describes `game.js` as 4,650 lines and lists `Snd` / `Director` / `SetPieces` as living inside it. They live in `js/audio.js` and `js/director.js` now. A first-time reader who trusts this file will search the wrong place. |

**Do not refactor for its own sake.** The last split left a parse contract (`engine-modules.test.js`: every engine file must execute *without* `game.js`). Any new file has to join `ENGINE_FILES` **and** `index.html` or the suite fails. That discipline is why the split did not become spaghetti. Keep it.

`game.js` is the one remaining file I would call “needs a next cut,” and only for the play loop — `startRun` / `nextQuestion` / answering / timer — if someone is about to live in that code for weeks. A drive-by extract will break the sandbox.

---

## 3. Can a first-time developer understand this?

### If they are pointed

**Yes, better than most no-build games.**

- Almost every `js/` file opens with a block comment that says what the file owns and what it must not do. `pilgrimage.js`, `bank.js`, `flow.js`, `engine-source.js`, `test-shim.js` are teaching documents, not decoration.
- Pure modules (`srs.js`, `recall.js`, `geo.js`, `pilgrimage.js`, `polish.js`) have no DOM, return new objects, and `module.exports` for Node. You can read them without the game running.
- `architecture.html` explains the *player* loop without code.
- `node test.js` is one command, 39 suites, names that match jobs (`recall logic`, `pilgrimage`, `cloud merge`).

### If they just clone the repo

**No.**

1. The first screen is 39 test files and 12 autopsy reports.
2. The document that *should* be the map (`docs/DEVELOPER-GUIDE.md`) is two splits behind the tree.
3. Globals + script tags mean “who owns `R`?” is a grep, not an import. That is a constraint of `file://`, but nobody writes it on the front door.
4. `game.js` still mixes save migration, mode tables, the router, and the live question. A newcomer looking for “where does a wrong answer go?” has to scroll a 2,100-line file even though the header says only “modes, progression, meta, UI.”
5. Reports at root disagree with the code. Trust the tests and the file headers, not `ASSESSMENT-REPORT.md`.

### Mental model that actually works

```
content + js/verses*.js     → the bank
js/bank.js                  → stable ids
js/srs.js + js/recall.js    → learning
js/sites.js + pilgrimage.js → the road
js/atlas.js                 → the map
js/cloud.js                 → optional remote
scripts/engine-source.js    → engine file list
js/game.js                  → save, modes, the live run
index.html                  → every view
node test.js                → the gate
```

A 20-line README that says only this would change the first hour.

---

## 4. Are errors tracked easily?

**Two systems. One is good. One is almost absent.**

### What is good — errors the suite can see

- `node test.js` runs 39 named suites. A failure prints `FAIL <name>` plus stdout/stderr. You know *which job* broke.
- Logic suites are pure. If SM-2 or typed grading is wrong, you do not need a browser.
- `integration.test.js` boots the real engine against `scripts/test-shim.js` and drives runs. Wiring bugs (forgot to persist, scheduled the previous verse) can be caught.
- `engine-modules.test.js` catches the split’s own bug class: a module that touches `game.js` at parse time.
- `scripts/qa-verses.js` is a content gate, not a unit test. Bad verses fail the build the same way bad code does.
- Cloud functions return `{ ok, reason }` (`signed-out`, `edge-unreachable`, `no-edge`). That is a real error vocabulary.

### What is weak — errors a player hits

| Situation | What happens | Trackable? |
|---|---|---|
| Verse bank missing | `Flow` state `load-fail` — a panel with Retry | Yes, if they tell you |
| Cloud sync fails | `cloud-fail` — continue locally | Yes, in the UI only |
| Site cannot draw | `empty-draw` | Yes, in the UI only |
| Drill empty | `empty-drill` | Yes, in the UI only |
| `localStorage` full or blocked | `persist()` empty `catch` — save silently does not write | **No** |
| Corrupt save JSON | `load()` empty `catch` — **wiped to `DEFAULT_SAVE`** | **No. Data loss with no log.** |
| Duplicate verse id | `console.warn` in `bank.js` | Only if DevTools is open |
| Audio / speech / video / share APIs | ~30 empty `catch (e) {}` | By design (optional APIs). Invisible. |
| Unexpected exception in the play loop | Nothing. No `window.onerror`, no `unhandledrejection`, no Sentry, no in-game journal of crashes | **No** |
| Edge score submit fails | Falls back to direct RLS write; reason stays in memory | Only if you inspect the client |

`js/flow.js` is the right idea: named failure *states* with copy a player can read. It covers **expected** dead ends. It does not cover **unexpected** ones.

There is no debug flag, no on-screen log, no “copy diagnostics” in settings. A tester saying “it broke” gives you nothing but a save blob — and if the save failed to parse, you do not even have that.

Empty `catch` around `audio.play()`, `speechSynthesis`, and Leaflet `removeLayer` is correct. Empty `catch` around **save load and persist** is not. Those two are the ones that should at least `console.error` and, for persist, tell the player the record did not write.

---

## 5. What I would change (organisation only)

Do these. Do not rewrite the game.

### P0 — first hour

1. Add a short **`README.md`**: what the game is, `node test.js`, `node scripts/dev-server.js`, link to `docs/DEVELOPER-GUIDE.md`, link to `plans/coffee-pilgrimage.md`.
2. **Update `docs/DEVELOPER-GUIDE.md`** so the module map matches the tree (`game.js` ~2,150; `Snd` in `audio.js`; `Director`/`Backdrop` in `director.js`; engine list = `scripts/engine-source.js`).

### P1 — make the root readable

3. Move `*.test.js` → `test/`. Point `test.js` at the new paths. One afternoon. Huge first-read win.
4. Move the twelve root `*-REPORT.md` files → `docs/reports/` (or `docs/archive/`). Keep `docs/DEVELOPER-GUIDE.md` and `plans/` as the living docs.
5. Move `BACKEND.md` → `docs/BACKEND.md`.
6. Add `"test": "node test.js"` and `"start": "node scripts/dev-server.js"` to `package.json` so the empty file does some work.

### P2 — the one remaining long file

7. If someone is about to live in the play loop: extract **answering + timer + `nextQuestion`** into something like `js/play.js`, add it to `ENGINE_FILES` and `index.html`, keep the parse contract. Do not extract “helpers.”
8. Optionally split `css/game.css` into hall vs play. Not required.

### P3 — make runtime errors visible

9. Log (and do not silently wipe) save parse failures. Show a `Flow` state if persist fails.
10. One `window.onerror` + `unhandledrejection` handler that writes the last N errors onto `SAVE` (or a `sessionStorage` ring) and a Settings line “Copy diagnostics.” No third-party tracker required.
11. Leave the empty catches on audio/video/speech. Those are not bugs.

### Do not

- Introduce a bundler, TypeScript, or ES modules that break `file://`.
- Split `pilgrimage.js`, `sites.js`, or `atlas.js` for line-count vanity.
- Delete tombstone tests (`sky3d.test.js`) — they are cheap locks.
- Trust old root reports as the map of the code.

---

## 6. Scores (first-read, not moral)

| Question | Score | One line |
|---|---|---|
| Files in a proper location? | **6 / 10** | Runtime yes. Root no. |
| Long files under control? | **7 / 10** | Split already happened. `game.js` is the leftover giant. |
| First-time developer can understand? | **5 / 10** | Excellent internals, hostile front door, stale guide. |
| Errors tracked easily? | **4 / 10** | Tests: yes. Production runtime: almost no. |

The bones are those of a careful no-build game. The mess is around the bones: reports, tests on the stoop, a guide that remembers the last house. Fix the stoop before you remodel the hall.
