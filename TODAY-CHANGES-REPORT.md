# Daily Changes Report — 2026-08-10

**Repo:** Complete the Verse  
**Branch:** `master`  
**HEAD:** `b42f200` — *Give the Pilgrimage teeth: set pieces, stakes, real sky, live Overdrive*  
**Author (all commits):** Claude (Claude Opus 5)  
**Timezone:** +0200  

---

## Executive summary

Today the project went from an empty git history to a full playable game, then to a sixth mode — **The Pilgrimage** — and a substantial gameplay polish pass. Four commits landed on `master`. Work still in the working tree expands the verse bank with a new hand-authored file (`js/verses-more.js`).

| Phase | Time | Commit | Theme |
|-------|------|--------|--------|
| 1. Baseline | 14:14 | `44f5703` | Snapshot the complete game before Pilgrimage |
| 2. Pilgrimage | 14:58 | `e8b93c0` | 29-site campaign from Ur → Patmos |
| 3. Dev server | 15:47 | `09020db` | Optional Node static server |
| 4. Gameplay teeth | 16:47 | `b42f200` | Set pieces, stakes, live sky, Overdrive fix |
| 5. WIP (uncommitted) | after HEAD | — | Hand-authored bank expansion |

**Committed today (after baseline):** +6,341 / −45 lines across 28 files  
**Baseline alone:** 53 files, ~20,172 insertions (initial import)  
**Uncommitted:** 2 modified + 1 new file (~119 new verses)

---

## Timeline

```
14:14  44f5703  Baseline: Complete the Verse before Pilgrimage integration
14:58  e8b93c0  Add The Pilgrimage: a 29-site campaign from Ur to Patmos
15:47  09020db  Add an optional dev server for previewing in a browser
16:47  b42f200  Give the Pilgrimage teeth: set pieces, stakes, real sky, live Overdrive
  …    (working tree)  verses-more bank expansion, not yet committed
```

All four commits are on `master`. There are no other branches and no remotes in this snapshot of history.

---

## Commit 1 — Baseline (`44f5703`)

**Message:** *Baseline: Complete the Verse before Pilgrimage integration*  
**Stat:** 53 files changed, 20,172 insertions(+)  
**Tests at commit:** 9 suites passing (`node test.js`)

### What landed

This is the initial git import of the pre-Pilgrimage game: content gate, verse bank, typing (Recall), SM-2 spaced repetition, audio/SFX, and the main play loop.

| Area | Paths | Notes |
|------|--------|--------|
| Core game | `index.html`, `js/game.js`, `css/game.css` | Main shell, modes, HUD |
| Verse bank | `js/verses.js`, `js/verses-extra.js`, `js/passages.js`, `js/bank.js`, `js/legacy-ids.js` | KJV bank + stable IDs |
| Memory systems | `js/recall.js`, `js/srs.js` | Typing mode + SM-2 scheduler |
| Content tooling | `scripts/*`, `content/quarantine.*` | QA gate, plans, quarantine |
| Tests | `*.test.js`, `test.js` | 9 suites |
| Audio | `audio/*.mp3`, `sfx/*.mp3` | Soundtrack acts + UI SFX |
| Docs | `CHANGES-REPORT.md`, `GAME-STATE-REPORT.md`, `UI-REPORT.md` | Prior design/state notes |

### Why it matters

Everything after this commit is layered on a known-good, tested baseline. Old saves and the existing modes remain the foundation Pilgrimage hooks into.

---

## Commit 2 — The Pilgrimage (`e8b93c0`)

**Message:** *Add The Pilgrimage: a 29-site campaign from Ur to Patmos*  
**Stat:** 26 files changed, +5,816 / −24  
**Tests at commit:** 14 suites pass (5 new)

### Feature overview

Pilgrimage is a **sixth game mode**. The map is the level select; level order is the biblical journey from Ur to Patmos.

| Module | Role |
|--------|------|
| `js/sites.js` | 29 sites in 4 arcs, routes, book bindings (KJV quotes) |
| `js/empires.js` | Schematic era overlays that shift as you travel |
| `js/geo.js` | Haversine, bearing, NOAA solar position, terminator |
| `js/pilgrimage.js` | Unlock rules, tier/clock ramp, site-bound verse draw |
| `js/live.js` | Open-Meteo client designed so network failure cannot break play |
| `js/atlas.js` | Leaflet rendering, dossiers, cinematics |
| `css/atlas.css` | Map UI on the game’s own tokens (no Tailwind) |
| `vendor/leaflet/` | Vendored Leaflet — offline, no npm |
| `scripts/load-atlas.js` | Node loader for atlas tests |

### Gameplay design (as committed)

- Each site level draws **six verses** from that site’s own scripture; bank widens only if needed.
- All 29 sites can fill from their own books.
- Difficulty ramps **tier 1 → 5**; clock closes **14s → 6.5s** along the road.
- Progress is **per-site** and saved; answers feed the existing SRS scheduler.
- Cleared sites unlock a **typed replay**.
- Old saves **migrate** rather than reset.

### Bugs fixed while building

| Area | Issue |
|------|--------|
| `live.js` | Synchronously throwing `fetch` escaped `load()`’s promise |
| `live.js` | Orphaned timeout rejection crashed the process |
| `live.js` | `typeof` guard called `.bind` on a null `fetch` at load time |
| `atlas.js` | Marker `aria-label` leaked every locked site’s name |
| `game.js` | `endRun` was not idempotent (could bank a run twice) |
| `sites.js` | Kingdom route visited sites out of journey order |

### Tests added

- `atlas.test.js`, `geo.test.js`, `live.test.js`, `pilgrimage.test.js`, `sites.test.js`
- Updates to `game-structure.test.js`, `integration.test.js`, `ui-structure.test.js`, `test.js`

---

## Commit 3 — Dev server (`09020db`)

**Message:** *Add an optional dev server for previewing in a browser*  
**Stat:** 2 files, +64

| File | Purpose |
|------|---------|
| `scripts/dev-server.js` | Zero-dependency Node static server |
| `.claude/launch.json` | Launch config for the server |

**Design note:** The game still needs no server — `index.html` opens from disk. This is only for a real origin (harness, phone preview, etc.).

---

## Commit 4 — Pilgrimage “teeth” (`b42f200`)

**Message:** *Give the Pilgrimage teeth: set pieces, stakes, real sky, live Overdrive*  
**Stat:** 5 files, +479 / −39  
**Tests at commit:** all 14 suites still pass

### Set pieces (site-specific finales)

Set pieces run **after** the site’s six verses so briefings and finales still line up:

| Site | Set piece |
|------|-----------|
| Jericho | Rebuild a shattered passage |
| Sinai | Source locked to Exodus |
| Babylon | Lifelines removed |
| Golgotha | One-shot |
| Nineveh | Sprint |
| Patmos | Final reconstruction |

### Stakes (non-gating)

- **First clear** pays roughly double; retries still bank, for less.
- **Per-arc seals** for keeping every verse across a whole stretch.
- **The Long Road:** opt-in relay through an arc on shared lives; sites bank as passed, so a death later keeps earlier clears.

### Live sky / weather (cosmetic only)

Play view reflects the site’s real sky (night darkness, dust storms, etc.). Weather is **strictly cosmetic** — it never changes the clock or difficulty.

### Overdrive / momentum fix

- Momentum bar filled at streak 10 while ×5 landed at 12 — UI lied about Overdrive.
- Both now share one step list.
- Overdrive **does work**: clock bonus doubles; reaching it **returns a spent lifeline**.

### UX polish

- Chain straight to the **next site** from results.
- Opening flight is reachable — `replayColdOpen` existed but nothing called it.

### Files touched

`css/atlas.css`, `index.html`, `js/atlas.js`, `js/game.js` (largest delta), `js/pilgrimage.js`

---

## Uncommitted work (working tree as of report)

Not in any commit yet:

| Path | Status | Change |
|------|--------|--------|
| `js/verses-more.js` | **Untracked** | New hand-authored verse pack (~119 verses, ~150 lines / ~32 KB) |
| `js/bank.js` | Modified | Merges `VERSES_MORE` into `VERSES` if present; exports `VERSES_MORE` |
| `scripts/load-bank.js` | Modified | Loads `js/verses-more.js`; exports `VERSES_MORE` for Node tests |

### Design of `verses-more.js`

Kept **separate from `verses-extra.js` on purpose**: `build-verse-extra.js` regenerates the latter and would wipe hand work.

Self-imposed rules documented in the file header:

1. **No single-word blanks** — gaps are phrases, not vocabulary quizzes.  
2. **Distractors wrong about Scripture**, not about English.  
3. **No reference already used** in the bank (avoids same verse twice in a run).  

Text is King James (public domain).

### Content snapshot

| Metric | Value |
|--------|--------|
| Verses | **119** |
| Books covered | **~60** (mostly 2 per book; Genesis 3; Jude/Titus 1) |
| Tier mix | t2: 2 · t3: 11 · t4: 50 · t5: 56 (skewed hard) |

### Important gap

`index.html` still loads only:

```text
js/verses.js → js/verses-extra.js → js/passages.js → …
```

It does **not** yet include `js/verses-more.js`.  
So:

- **Node / `load-bank.js` path:** new verses are available (once the file is present).  
- **Browser play path:** new verses are **not** in the live bank until a script tag is added (ideally before `js/bank.js`).

`bank.js` already guards with `typeof VERSES_MORE !== "undefined"`, so the browser will not break without the file — it simply ignores the expansion.

---

## Aggregate picture of the day

### Architecture after today

```text
Modes: Classic / Drill / Study Hall / … + Pilgrimage (6th)
                │
                ├─ bank (verses + extra [+ more WIP]) → SRS
                ├─ recall (typing)
                └─ Pilgrimage
                     sites → pilgrimage rules → atlas (Leaflet)
                     geo + empires + live weather (cosmetic)
```

### Net committed deltas (baseline → HEAD)

Beyond the initial import, Pilgrimage + polish + dev server:

- **+28 files** meaningfully evolved or added in post-baseline commits  
- **~+6.3k lines** of game code, tests, CSS, and vendored Leaflet  
- **Test suites:** 9 → **14**  
- **Still zero runtime npm dependencies** for the game itself  

### Risk / follow-up checklist

| Item | Severity | Notes |
|------|----------|--------|
| Wire `verses-more.js` into `index.html` | High (for the expansion to matter in play) | Missing script tag |
| Commit WIP bank expansion | Medium | Untracked + local mods only |
| Run `node test.js` after wiring more | Medium | Confirm QA gate and bank load |
| Live weather depends on network | Low | Designed to fail closed; cosmetic only |
| Leaflet vendored | Info | Offline-friendly; watch for security updates later |

---

## How to verify

```bash
# All suites (14 expected at HEAD)
node test.js

# Optional browser origin
node scripts/dev-server.js

# Or open index.html directly from disk
```

---

## Sources for this report

- `git log` / `git show` for all commits dated **2026-08-10**
- `git status` / `git diff` for uncommitted work
- Inspection of `js/verses-more.js` and script includes in `index.html`
- Existing prior doc: `CHANGES-REPORT.md` (2026-08-02 content-gate era; pre-dates today’s git history)

---

*Generated 2026-08-10 from local git history and working tree.*
