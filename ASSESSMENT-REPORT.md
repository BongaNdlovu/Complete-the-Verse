# Complete the Verse — Full Game & Code Assessment

**Date:** 2026-08-16
**Scope:** every source file, the full test suite, asset/config audit, and a live browser play-through of the shipped game.
**Verification this session:**

- `node test.js` → **all 27 suites passed** (content gate, verse QA, SRS, recall, geo, pilgrimage, characters, artifacts, menu modes, live data, integration, game structure, UI structure, atlas data + view, soundtrack, sfx, voice, cloud merge, polish, improvements, sky3d, gameplay polish, excitement, answering, motion).
- `node --check` clean on `game.js`, `atlas.js`, `pilgrimage.js`, `cloud.js`.
- Static audit: every asset path referenced in `index.html`, `js/*`, `css/*` verified present on disk (78 unique paths, **0 missing**).
- Runtime: played the game in a real browser — intro → boot → menu → tutorial → profile → atlas (map, rail, dossier, **live weather**) → site brief → play → timeout → death → results (SRS rescheduling, insights, missed-verses list). Everything listed executed and was observed working.

Every claim below carries evidence: a file:line citation, a test-suite result, a measured number, or a runtime observation.

---

## 1. What is verifiably good

| Area | Evidence |
|---|---|
| **Test discipline** | 27 suites, ~1,900 assertions, all green. Logic tests are pure (no DOM) and pin real behaviour: SRS scheduling (SM-2), typed-answer grading, geo/solar math, campaign rules, bank integrity. |
| **Pure modules** | `srs.js`, `recall.js`, `pilgrimage.js`, `geo.js`, `polish.js`, `live.js` have no DOM, return new objects instead of mutating, and are loadable in Node. This is why they're testable and why the tests mean something. |
| **Typed-recall grading** | `recall.js` distinguishes exact / close (typo budget scaled to length) / modernised English ("you" vs "thee") / inflections ("heavens" vs "heaven" is never forgiven) / distractor cross-checks, and reports *which* word was wrong (`wordDiff`). Genuinely thoughtful design. |
| **Asset integrity** | 423 verses · 66 books · 27 passages · 36 sites · 36 relics · 24 voice clips · 7 music beds · 8 SFX — all present, all referenced, counts cross-checked by tests (artifacts 199 assertions, atlas 178). |
| **Cloud architecture** | Supabase with RLS (29 policy statements across 3 migrations), anon key only (no service key anywhere in the repo — scanned), lazy SDK load that never blocks boot, field-aware save merge (`cloud.js:168`), optimistic-lock revision push (`cloud.js:302-331`), offline-safe no-ops. |
| **Security headers** | `vercel.json` CSP `connect-src` allow-list matches **exactly** the four remote hosts the code actually calls (verified by grep) — no more, no less. |
| **Live-world feature** | Runtime-verified at Ur: real Open-Meteo data (39 °C, clear sky, 17 km/h N), computed local solar time 23:39, sunrise/sunset, moon phase — with honest "Typical" fallback labelling when offline. |
| **Save migration** | v2→v3 re-points index-based verse IDs through `LEGACY_IDS` (`game.js:123`), so old players keep progress. Merge-on-load for pre-Pilgrimage saves (`game.js:103`). |
| **Performance hygiene** | RAF loop only runs on the play view; leaving the atlas unmounts its clocks (`game.js:982`); visualiser throttled to ~30 fps; quality tiers scale ember count and DPR; music beds load lazily (`preload="none"`, `game.js:409`). |

The bones of this game are strong. The issues below are almost all **product decisions and unfinished removals**, not rotten code.

---

## 2. Critical — fix before anything else (P0)

### 2.1 New players get the hardest difficulty by default
- **Evidence:** `js/game.js:77` — `DEFAULT_SAVE.set.diff = "watchman"`. Runtime: created a fresh profile, opened Ur's site brief → **"2 Lives · 18.9s per verse"** (exactly Watchman: `(14000×0.72+1500)×1.2+5000`). My smoke-test player **died to two timeouts on verse 1–2**, on the tutorial's own recommendation.
- **Contradiction:** `DIFFS.disciple.desc` calls Disciple "the intended ordeal" (`game.js:282`), and the site brief has **no difficulty picker at all** (`openSiteBrief` never renders `#diffs`; only the standard brief view does).
- **Impact:** the single worst first-run experience in the product, on the primary campaign.
- **Fix (small):** default `diff:"disciple"`; add the difficulty row to the site brief (or Settings). Add a test pinning the default.

### 2.2 Dying or abandoning the Daily consumes the day's one shot
- **Evidence:** `game.js:3493-3496` — the daily is recorded for **any** end-run reason (`death`, `abandon`, `complete`) once the player has answered anything. Mode copy promises "One recorded attempt" (`game.js:264`), but a death on question 3 locks the day at that score. (A pre-answer quit correctly does *not* record — `abandonRun` `game.js:4297`.)
- **Impact:** with the Watchman default (2 lives), a new player can permanently ruin today's Daily in ~40 seconds.
- **Fix (small):** record only `reason==="complete"`, or keep best-of-attempts per date. The UI already handles the "practice run" case (`game.js:3643`).

### 2.3 Starting a site permanently burns its 8 verses — even if you answer nothing
- **Evidence:** `game.js:1727-1730` — `startRun` calls `Pilgrimage.markUsed(...)` for the whole draw **before the first question**, with the stated intent "a quit mid-site still consumes them". `usedIds` exclude verses from *every later site* for the rest of the journey (`pilgrimage.js:114-120`), and nothing ever returns them — not on death, not on zero-answer abandon. Retries draw 8 fresh verses each time (`drawSite` seeds by attempt count, `pilgrimage.js:498`).
- **Math:** 36 sites × 8 = **288 of 423 verses** are needed for one clean walk. Every abandoned start permanently removes 8 more from the pool; a player who retries sites heavily pushes late sites into the starved-bank path, which silently returns **short levels** (`pilgrimage.js:446-448`).
- **Fix (moderate):** commit `usedIds` incrementally — mark a verse used when it is actually served (or when the site is cleared), not when the run starts. Keep the anti-savescum property by seeding the draw from attempts (already done).

### 2.4 Hidden modes are launched by accident; one mode and seven seals are unreachable
- **Evidence:**
  - Enter/Space on the menu opens **The Trial** (`game.js:4385`) — a mode deliberately marked `hidden:true` and absent from the menu (`game.js:257`).
  - The tutorial's "Start the Drill" opens **The Drill/practice** (`game.js:4345`) — also `hidden:true` — and after the first run it is **reachable by nothing**: `openBrief` is called only from the menu (visible modes only), the tutorial, and that Enter shortcut.
  - **Endless has no launch path at all** (grep of every `startRun`/`openBrief` call site) → the `end40` seal ("Answer 40 in one Endless run", `game.js:218`) is unobtainable.
  - Six Trial-only seals (`unshaken`, `watch`, `sd15`, `nocrutch`, `flawless`, `ironman`, `game.js:207-224`) are reachable only through the hidden keyboard shortcut.
- **Impact:** the Seals screen shows 29 achievements a normal player can never complete; the core spaced-repetition loop (the game's stated purpose) is hidden behind a first-run-only button.
- **Fix (small):** menu Enter opens the first *visible* mode; add a "Review N due" entry point on the menu/pilgrim HUD when `dueToday() > 0`; either surface Trial/Endless as late unlocks or retarget their seals to road goals (the self-report proposes the same).

---

## 3. High priority (P1)

### 3.1 The learning loop is invisible
The SRS is real, tested, and every answer feeds it (`scheduleReview`, `game.js:3003`). The menu even prints "N due for review" (`game.js:1336`) — but the only mode that serves due verses (The Drill) is hidden (§2.4), and Study Hall's "Due for review" filter is passive. **The feature the game exists for has no button.** This is the highest product-value fix after the P0s.

### 3.2 Leaderboards are client-trusted
- **Evidence:** `cloud.js:359-380` writes `daily_scores` / `blitz_scores` straight from the browser; the client-side clamps in `polish.js` (`MAX_DAILY_SCORE` etc.) are advisory. The server-side clamp already exists — `supabase/functions/submit-score/index.ts` — and is **referenced by nothing** (grep confirms no call site). The SQL CHECK constraints in migration 003 help, but any value under the ceiling is forgeable, including a perfect fake daily.
- **Fix:** route submissions through the Edge Function (it's already written), keep reads direct.

### 3.3 Duplicate verse references — measured, not estimated
Loading the merged bank in a VM: **423 verses, 33 references appear twice** (0 duplicate IDs; each pair asks a *different blank* of the same verse). `expandExclude` guards pilgrimage draws (`pilgrimage.js:475-486`) but Daily/Blitz/Endless can serve the same verse twice in one run. A dedupe pass over the two packs (or extending ref-aware exclusion to all modes) fixes it.

### 3.4 The clock lies in three different places
- Atlas dossier: **15.5 s** at Ur — `atlas.js:857` computes `clockMs + PICK_PAD_MS` only (no difficulty, no pacing).
- Site brief: **18.9 s** (Watchman) / **23.6 s** (Disciple) — `game.js:1498` applies difficulty × `PACE` + `FLAT_ADD_MS`.
- Actual play clock: a third value — `playClockMs` (`game.js:1912`) adds +20 % again at streak ≥ 3 (`momentumClockMs`).
- Trial act cards also show the raw `A.t × diff` without PACE/flat (`game.js:1869`), so Act I advertises ~10-14 s while serving ~18-23 s.
- **Runtime-verified:** dossier said 15.5 s, brief said 18.9 s, for the same site, same player, two clicks apart.
- **Fix:** one `describeClock(site, diff)` helper used by all three surfaces.

### 3.5 The relay is one accidental tap away
Runtime: every arc header in the journey rail carries a **"Walk it"** button — a whole-arc, shared-lives, no-rest run — with no confirm step, next to routine navigation. `openRelayBrief` shows a warning card, but the results are already committed as you pass sites (`bankRelaySite`, `game.js:1585`). Add a confirm or move it behind the arc header.

### 3.6 Report drift
`EXCITEMENT-REPORT.md` still lists a Three.js sky that no longer exists anywhere in the tree, and `NEXT-STEPS-REPORT.md` claims a shipped "Narrow Gate" miniboss that was later **removed** (`excitement.test.js:43-48` now asserts its absence). Anyone planning work from those documents will chase ghosts. This report supersedes them; archive the stale ones.

---

## 4. Medium priority (P2)

### 4.1 ~30 MB of dead payload, some of it deployed
Measured on disk:

| Item | Size | Status |
|---|---|---|
| `vendor/three/` | 2.8 MB | **Zero references** — three.js removal was incomplete; still deployed (`.vercelignore` doesn't exclude it) |
| `node_modules/three` + `package.json` dep | 25 MB | Same — unused dependency |
| `assets/hosts/` | 2.4 MB | Orphaned (host skins retired; nothing references it); deployed |
| `assets/characters/*/full.png` | 2.7 MB (14 files) | Orphaned (only portrait+token are referenced); deployed |
| `audio/_orig_backup/` | 22 MB | Orphaned but correctly excluded from git & deploy |
| `assets/judge/up.png` + `down.png` | 5.3 MB | **Used** — but two 2.6 MB PNGs for a 0.9 s animation; compress |

**Fix (an hour):** delete `vendor/three` and the `three` dependency, delete `assets/hosts` and `full.png`, add all three to `.vercelignore`, compress the judge sprites (or convert to WebP/AVIF — CSP `img-src` already allows data/self).

### 4.2 First-load weight
`assets/intro.mp4` is **11.4 MB** with `preload="auto"` (`index.html:38`), alongside `hall.mp4` 4.1 MB also `preload="auto"` (`index.html:19`) and Google Fonts CSS. On a phone this competes with the boot sequence. Re-encode the intro (~2-4 MB is achievable at this art style), consider `preload="metadata"` + load-on-tap for the intro, and re-encode the seven 2.1-2.8 MB music beds (already lazy — still heavy when they land).

### 4.3 First-run instructions contradict the shipped controls
The tutorial teaches "Select A–D (or tap), then **Lock Answer / Enter**" (`index.html:465`) and the site brief prints "Enter to lock" — but the shipped default is **single-tap answers** (runtime HUD: "Tap a phrase to answer"; `SAVE.set.singleTap` default true, `game.js:79`). Update the copy once, in both places.

### 4.4 Insights are a 10-book stub
`polish.js:133-144` — `BOOK_INSIGHTS` covers 10 of 66 books; the other 56 render generic filler ("See traditional attribution"). Either write the remaining cards or relabel the panel "Book note" so it doesn't promise exegesis it can't deliver.

### 4.5 Accessibility gaps
- The pause overlay is not a `role="dialog"`, has no focus trap; same for the Overdrive choice and reveal card (the tutorial and character picker do have `aria-modal`).
- No visible focus styles documented for keyboard play (the game is heavily keyboard-driven: A-D/1-4, Enter, Esc, S, I — all verified working).
- Reduced-motion is respected in FX (`Director.beat`, judge burst, shake) — good — but the site-quote typewriter is only skipped by the `body.reduced` class, not by the OS setting alone (`game.js:2043` checks the class; `applySettings` does fold the OS setting in, so this is mostly covered).

### 4.6 Store presence
No favicon, no `<meta name="description">`, no `og:` tags, no `manifest.webmanifest`, no README. The share-card and PWA asset list in `NEXT-STEPS-REPORT.md` §3 remains accurate and undone.

### 4.7 Content gaps carried over (self-reported, still true)
219-verse quarantine backlog; thin signature books (the code itself documents Luke-at-Emmaus problems, `pilgrimage.js:10-22`); single-word blanks remaining in the bank.

---

## 5. Low priority / code quality (P3)

1. **`game.js` is 4,612 lines.** The seams already exist (`Backdrop`, `Snd`, `Director`, `SetPieces`, `Viz` are inline IIFEs). Splitting them into files is mechanical and would cut the biggest review burden. (The repo's own later-goals list says the same.)
2. **Dead branches:** `game.js:3694` — `o.road.after ? SAVE.pilgrim : SAVE.pilgrim` (both arms identical); `game.js:2126` — `A.q===Infinity ? "Verse" : "Verse"`.
3. **Distractor last resort:** `buildChoices` can surface "the word of the LORD 2" as a visible option (`game.js:2329-2335`) if the bank can't produce three shape-matched distractors. Rare, but it looks broken when it happens.
4. **HUD tier label vs site tier:** verse 1 at Ur (site Tier 1 / "Foundation") displayed "Testimony" (verse-level tier from `resolvePool`'s distance ranking). By design, but it contradicts the brief one screen earlier.
5. **Repo hygiene:** 10 top-level report `.md` files + 24 test files at root; `.claude/launch.json` tooling artifact committed. Suggest `docs/reports/` and `test/`.
6. **`.vercelignore` is untracked** — the deploy-trim config itself isn't in git.
7. **Transient anomaly (unconfirmed):** in one session, dossier/rail buttons stopped responding to synthetic clicks until reload (map markers kept working). Could not reproduce after reload; likely a detached-node race when live weather re-renders the dossier. Worth a manual check, not proven.

---

## 6. Security assessment

| Check | Result |
|---|---|
| Service key / secret committed | **None** (scanned repo). The anon JWT in `js/cloud-config.js` is intentional and RLS-backed per `BACKEND.md`. |
| RLS | 29 policy statements across 3 migrations; per-user rows on `saves`, `profiles`, score tables. |
| CSP | Complete; `connect-src` matches the exact set of remote hosts the code calls. No inline scripts; `script-src` is `'self'` plus vendored files. |
| XSS | `esc()` applied at every interpolation I audited (study list, boards, settings, relics, callouts). `Polish.sanitizeDisplayName` strips HTML before cloud display names. |
| Cheat surface | Client-trusted score writes (§3.2) — the one real gap. Local save tampering is inherent to localStorage and acceptable. |
| Dependencies | Leaflet 1.9.4 and supabase-js 2.112.3, both vendored (no CDN) — current majors. The `three` dependency is dead weight (§4.1). |

---

## 7. Recommended fix order

| # | Item | Effort | Section |
|---|---|---|---|
| 1 | Default difficulty → Disciple; difficulty picker on site brief | ~30 min | 2.1 |
| 2 | Daily records only on completion (or best-of-day) | ~30 min | 2.2 |
| 3 | Menu Enter → visible mode; surface "Review N due"; decide Trial/Endless fate | ~1 h | 2.4 / 3.1 |
| 4 | Move `markUsed` to serve-time (stop burning verses on quit) | ~2 h + tests | 2.3 |
| 5 | Delete three.js ×2, hosts, full.png; extend `.vercelignore`; drop dep | ~1 h | 4.1 |
| 6 | One clock formula for dossier/brief/act cards | ~1 h | 3.4 |
| 7 | Dedupe the 33 duplicate refs | ~1 h + QA gate | 3.3 |
| 8 | Route score submits through the existing Edge Function | ~0.5 day | 3.2 |
| 9 | Relay confirm; tutorial copy for single-tap; judge PNG compression; intro re-encode | ~0.5 day | 3.5 / 4.3 / 4.1 / 4.2 |
| 10 | Insights stub, a11y dialogs, favicon/og/manifest, split game.js | ongoing | 4.4-4.6, 5.1 |

Items 1-5 are a single afternoon and remove every P0 plus a third of the payload.

---

*Verification commands: `node test.js` (27 suites) · `node scripts/dev-server.js` → browser play-through · bank loaded in a VM for duplicate counting · full asset reference scan.*
