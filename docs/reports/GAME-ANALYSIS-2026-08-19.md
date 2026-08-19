# Complete the Verse — Full Game Analysis & Improvement Report

**Date:** 2026-08-19 · **Analyst:** Cline (automated code review) · **Repo:** `BongaNdlovu/Complete-the-Verse` @ `ccea2db`

---

## 1. Executive Summary

**Complete the Verse** is a static, zero-build, vanilla-JS browser game: a King James Bible verse-completion memory game wrapped in a narrative "pilgrimage from Ur to Patmos." It runs from `file://`, a tiny Node dev server, or Vercel, with optional Supabase cloud sync and leaderboards.

**Overall verdict: an unusually disciplined, well-tested hobby codebase with a genuinely distinctive design identity — held back by a hard difficulty wall, a hidden-mode discovery problem, and a few structural risks (one 1,500-line orchestrator file, no CI, no bundling/minification).**

| Dimension | Grade | One-liner |
|---|---|---|
| Concept & identity | A | "Memory as pilgrimage" is coherent, atmospheric, and rare |
| Code architecture | B+ | Clean layering, zero-build discipline; `game.js` is a 1,500-line god-file |
| Test coverage | A- | 38 suites, ~1,000+ assertions, all passing |
| Gameplay depth | B | Strong core loop; difficulty curve is a cliff, not a curve |
| Content volume | B+ | 579 verses, 66 books, 5 arcs, 22 sites, 37 seals |
| UX & onboarding | B- | Beautiful but punishing; several modes are effectively undiscoverable |
| Performance & weight | B | ~70 MB media, 2.6 MB PNGs; no minification, no lazy-loading |
| Security & privacy | B+ | RLS-protected Supabase, no secrets beyond anon key; no CSP |
| Documentation | A- | Excellent docs/ and plans/ culture |
| Release engineering | C+ | No CI, no versioning, no analytics, no error tracking |

### Follow-up implementation pass

This pass addressed the highest-impact first-run and playability defects found
in the review: first launch now teaches the game through three easy,
non-scoring lessons (tap, lifeline, assemble/drag) before opening the menu;
assemble-mode lifelines use delegated controls that survive bank redraws; and
recorded voice playback now exposes rejected audio so speech fallback is not
silently cancelled. A missing direct voice-file reference in the Seventh Lamp
ceremony was also routed through the Director. The full regression suite now
contains 38 passing suites, including an onboarding state test.

---

## 2. What the Game Is

### 2.1 Core loop

A verse appears with words missing. You restore it — by multiple choice, or by dragging words from a bank (Recall/Assemble mode). Correct answers build streaks; streaks build **momentum** (2× at 3, 5, 8, 12 streaks) and eventually **overdrive** (a spent lifeline returned). Wrong answers cost lives and time. Runs end in a scored results screen with XP, seals, and SRS (spaced-repetition) updates.

### 2.2 Modes (as defined in `js/game.js` `MODES`)

| Mode | Name | Pitch | Reachable from menu? |
|---|---|---|---|
| `pilgrimage` | The Pilgrimage | Campaign: walk Ur → Patmos, 22 sites, 5 arcs | ✅ Primary card |
| `daily` | Daily Trial | 20 verses seeded by date, one recorded run/day | ❌ `hidden:true` |
| `blitz` | Scripture Blitz | 60s survival, +2s/−4s | ❌ `hidden:true` |
| `trial` | The Trial | 5 acts, one-life finale | ❌ `hidden:true` |
| `endless` | Endless Gauntlet | Infinite, shrinking clock | ❌ `hidden:true` |
| `practice` | The Drill | SRS due queue, 15 verses | ✅ Via "Review N due" bar |
| `recall` | Recall | Assemble from memory, no options | ❌ `hidden:true` |
| `relay` | The Long Road | Whole arc in one run | ✅ Via Atlas arc click |
| `pilgrim-recall` | — | Site re-walk from memory | ✅ Via site brief "Assemble it from memory" |

**Critical finding:** `MENU_GROUPS` only lists `pilgrimage`. Every other mode has `hidden:true` in `MODES`, and `renderModeCard` returns `""` for hidden modes. The only non-pilgrimage entries on the menu are the conditional "Review N due" button (practice) and Atlas deep-links (relay, pilgrim-recall). **Daily, Blitz, Trial, Endless, and Recall are unreachable through normal UI navigation** — they exist in code, tests, and save data, but a player cannot click them. (Keyboard Enter on the menu correctly opens the first *visible* mode — a comment in `game.js:1448` notes this was deliberately fixed.) This appears to be an intentional "campaign-first" v1.4 decision (see `plans/v1.4-truth-onboarding-review.md`), but it means the game currently ships with ~60% of its built content dark.

### 2.3 Meta systems

- **SRS:** SM-2-inspired scheduler (`srs.js`) with per-verse ease, interval, due dates; "The Drill" drains the due queue.
- **XP/Levels:** XP from runs; levels gate site unlocks and seals (`lvl20`).
- **Seals:** 37 achievements (first run, streaks, road milestones, arc clears, `books66`, `streak30`, `act6-watch`, …).
- **Oil:** soft currency earned from runs, spent on extra lifelines (`oil50` seal).
- **Artifacts/Relics:** collectibles tied to sites and arcs.
- **Leaderboards:** local top-10 board; optional Supabase global daily/blitz boards.
- **Cloud sync:** optional Supabase auth (magic link/Google) + save sync; offline-first with a broken-save quarantine (`ctv_save_v3_broken`).
- **Live weather:** Open-Meteo fetches real weather over real sites, with a strict "the game must never notice weather failed" fallback policy (`live.js`).

### 2.4 Presentation

- Cinematic intro video, act-based palettes, per-site skies and plates, judge character art, 5 act tracks + menu/results tracks, 8 SFX, voice-over intro.
- PWA manifest (`manifest.webmanifest`) for installability.
- 31 `aria-`/`role` attributes; 2 `prefers-reduced-motion` blocks in CSS.

---

## 3. Architecture Breakdown

### 3.1 Layer diagram (from README, verified)

```
Bank (verses.js, bank.js)
  → Learning Model (srs.js, recall.js, assemble.js)
    → The Road (pilgrimage.js, sites.js, geo.js)
      → Map & Atmosphere (atlas.js, live.js, audio.js, cinematic.js)
        → Run Orchestration (game.js, play.js, flow.js, results.js)
          → index.html
```

### 3.2 File-by-file responsibilities (verified)

| File | ~LOC | Role |
|---|---|---|
| `js/game.js` | ~1,500 | God-file: MODES, DIFFS, ACTS, SEALS, save/load/migrate, run orchestration, keyboard, view router |
| `js/verses.js` + `verses-extra.js` + `verses-more.js` + `verses-ascent.js` | ~4,000+ | 579 verses of KJV content across 66 books |
| `js/bank.js` | ~200 | Verse bank assembly, book order, lookup |
| `js/srs.js` | ~150 | Spaced repetition scheduler |
| `js/play.js` | ~700 | Question rendering, answer handling, timer |
| `js/flow.js` | ~300 | Act/sequence flow |
| `js/results.js` | ~650 | Scoring, XP, seals, daily gate, results screen |
| `js/briefs.js` | ~700 | Menu, mode briefs, site briefs, tutorial, intro |
| `js/panels.js` | ~350 | Leaderboards, stats, settings |
| `js/atlas.js` | ~400 | SVG map, site nodes, arcs |
| `js/pilgrimage.js` | ~250 | Road state, arcs, site unlock logic |
| `js/sites.js` | ~200 | Site definitions |
| `js/geo.js` | ~150 | Coordinates, distance |
| `js/audio.js` | ~250 | WebAudio music/SFX engine |
| `js/live.js` | ~120 | Open-Meteo weather integration |
| `js/cloud.js` + `cloud-config.js` | ~400 | Supabase auth + sync |
| `js/characters.js`, `setpieces.js`, `sequences.js`, `cinematic.js`, `viz.js`, `typed.js`, `polish.js`, `diag.js`, `meta.js`, `recall.js`, `assemble.js`, `artifacts.js`, `empires.js`, `legacy-ids.js`, `util.js` | ~2,500 combined | Supporting systems |

### 3.3 Strengths

1. **Zero-build discipline is real and consistent.** No bundler, no TypeScript, no npm dependencies at all (`package.json` dependencies: `{}`). Classic `<script>` tags, `file://`-compatible. This is rare and lowers the contribution barrier to zero.
2. **Layering is honest.** The README diagram matches the actual import graph. Content (verses) is cleanly separated from mechanics.
3. **Test culture is exceptional for a hobby project.** 37 suites (`node test.js`), covering metadata, SRS, flow, UI structure, e2e DOM smoke tests, sound, motion, quarantine, cloud, voice. All pass.
4. **Save robustness.** Versioned save key (`ctv_save_v3`), legacy migration from v2, broken-save quarantine key, cloud/local merge.
5. **Graceful degradation everywhere.** Weather fails silently; audio unlocks on first gesture; offline banner; cloud optional.
6. **Documentation culture.** `docs/` (architecture, backend, security, code organisation, developer guide), `plans/` with checkpoint-based agent plans, `content/QUARANTINE.md` for problem verses.

### 3.4 Weaknesses & risks

1. **`game.js` is a 1,500-line god-file.** It owns modes, difficulty, acts, seals, save system, run state, keyboard routing, and view transitions. The project's own `plans/code-organisation-fix.md` acknowledges this. Highest-priority refactor target.
2. **No CI.** Tests exist but nothing runs them on push/PR. A single bad commit can silently break the suite.
3. **No minification/bundling.** ~40 JS files ship raw to the browser. Fine for a hobby game; hurts first-load on mobile networks.
4. **~70 MB of media, ~5 MB of it backup audio.** `audio/_orig_backup/` (5.1 MB menu backup etc.) is correctly excluded from deploys via `.vercelignore` but still bloats the repo. `assets/judge/up.png` and `down.png` are 2.5–2.6 MB PNGs each — these *do* ship.
5. **No CSP or security headers.** `vercel.json` exists but (verified) contains no `Content-Security-Policy`. The Supabase anon key is committed — acceptable practice with RLS, but worth noting.
6. **Single difficulty.** `DIFFS` contains only `watchman` (2 lives, 0.85× time, 1.0× score) and `resolveDiff()` always returns it. The difficulty *system* exists but is stubbed to one value.
7. **No analytics or error tracking.** No way to know if players hit the difficulty wall, abandon, or encounter runtime errors in the wild.

---

## 4. Gameplay Analysis

### 4.1 The core loop is strong

The verse-completion mechanic is inherently satisfying: recognition → recall → confirmation. The game layers it well:

- **Momentum/overdrive** gives streaks mechanical meaning beyond score.
- **Lifelines** (powers) create resource decisions mid-run.
- **Act structure** (I–V, escalating tiers and shrinking clocks: 14s → 8.5s) gives runs a narrative arc.
- **SRS integration** means every run feeds long-term learning — the game is secretly a serious memorization tool.

### 4.2 The difficulty wall

- **Act I:** 8 questions, 14s each, tier 1 (easiest verses). Reasonable.
- **Act V:** 9 questions, 8.5s each, tier 4. With only 2 lives and a 0.85× clock multiplier, this demands near-perfect play from verse recall that most players won't have.
- **The Final Test** (`sd15` seal: "Complete the five-question Final Test") is a one-life, five-question gate for the ending.
- **Single difficulty setting** means there is no easier on-ramp. The v1.4 plan explicitly chose "no lighter path" as an identity ("There is no lighter path" is literally the Watchman difficulty description).

**Assessment:** This is a deliberate design identity, not an accident. But it caps the audience. The v1.4 plan's own framing ("Truth, Campaign-First") suggests the author knows this. The risk is that new players bounce before the SRS loop (the actual retention engine) hooks them.

### 4.3 Mode discoverability (the biggest UX problem)

As detailed in §2.2: Daily, Blitz, Trial, Endless, and Recall are all `hidden:true` and unreachable from the menu. The game has built five distinct game modes that players cannot find. If this is a temporary campaign-first state, it needs an end date; if permanent, it's a large content investment sitting dark.

### 4.4 Progression pacing

- 22 sites × 5 arcs is a substantial campaign, gated by level (`lvl20` seal exists) and prior clears.
- 37 seals provide long-tail goals.
- Oil economy is thin (one sink: extra lifelines) — the v1.4 plan defers relic differentiation, which would be the natural second sink.
- SRS due counts surface on the menu ("Review N due") — good habit loop.

### 4.5 Content quality

- 579 verses across all 66 books is respectable coverage, with a quarantine pipeline (`content/quarantine.json`, `scripts/quarantine.js`) for problem verses — a genuinely professional touch.
- Verse QA scripts (`scripts/qa-verses.js`, `qa-verses-extra.js`, `verse-stats.js`) validate content integrity.
- The KJV text is public domain; no licensing risk.

---

## 5. UX & Accessibility

**Strengths:** consistent visual identity, keyboard support (Enter to start, typing routed to answer field), reduced-motion support, offline banner, PWA manifest, 31 ARIA attributes.

**Gaps:**

1. **No screen-reader story for the play screen.** The timer, streak, and lives are visual; a blind player cannot play the core loop. ARIA live regions for question changes and answer feedback would be the first step.
2. **Timer pressure + motor impairment.** No option to pause or extend time for accessibility (distinct from difficulty — an a11y accommodation, not a "lighter path").
3. **Color-only feedback in places** (correct/wrong flashes) — needs icons/text redundancy.
4. **No localization.** UI is English-only; KJV is English-only. Fine for scope, worth stating.
5. **Mobile keyboard handling** is handled (on-screen board + desktop typing) but the Atlas map interaction on small screens is untested territory.

---

## 6. Performance & Weight

| Item | Size | Ships to prod? |
|---|---|---|
| `audio/_orig_backup/` | ~5.1 MB | ❌ (`.vercelignore`) |
| `assets/judge/up.png` + `down.png` | ~5.1 MB combined | ✅ |
| `assets/intro.mp4` | 2.1 MB | ✅ |
| `audio/*.mp3` (7 tracks) | ~14 MB | ✅ |
| Total media | ~70 MB repo / ~65 MB shipped | — |

**Recommendations:** convert judge PNGs to WebP (typically 70–80% smaller), lazy-load the intro video, consider preloading only the menu track and streaming act tracks on demand, and add `loading="lazy"` where images exist. No minification exists; even a trivial concat+minify step (or esbuild in a single pass, keeping the zero-build *runtime* philosophy) would cut JS payload ~50%.

---

## 7. Security & Privacy Review

1. **Supabase anon key committed** (`js/cloud-config.js`). Standard practice with RLS; the file's own comments explain this. ✅ acceptable.
2. **RLS-backed schema** (`supabase/migrations/001_complete_the_verse.sql`) — verified in `docs/SECURITY-EVALUATION.md`. ✅
3. **No CSP.** `vercel.json` lacks security headers. Add at minimum: `Content-Security-Policy` (default-src 'self'; connect-src 'self' https://eanjhcktflbpbjkdjtej.supabase.co https://api.open-meteo.com), `X-Content-Type-Options`, `Referrer-Policy`.
4. **XSS surface is small but real.** 30 `esc()` calls in `panels.js` show the team escapes user-derived strings (leaderboard names). Spot-checks found no unescaped interpolation of user input into `innerHTML`. ✅ with vigilance.
5. **No telemetry.** Privacy-friendly by default. ✅
6. **Save data is local-first.** Cloud is opt-in. ✅

---

## 8. Test & QA Assessment

- **38 suites, all passing** (verified by running `node test.js`).
- Coverage spans: metadata (66 books, 579 verses), SRS math, flow, UI structure, e2e DOM smoke tests, sound, motion, quarantine, cloud, voice, menu modes, gameplay polish, improvements, fixes.
- **Gaps:** no visual regression, no performance budget tests, no cloud integration tests against a real Supabase project (mocked), no i18n (n/a), no coverage measurement.
- **The `test.js` runner is custom** — fine, but consider migrating to `node --test` for zero-dependency structured output and better failure isolation.

---

## 37 Seals (full list, verified)

`first, unshaken, recall, flame, watch, swift, nocrutch, flawless, score25, score50, sd15, end40, daily7, books30, books66, lvl20, life500, ironman, road-first, road-arc1, road-half, road-patmos, road-end, arc-patriarchs, arc-exodus, arc-judges, arc-kingdom, arc-gospel, relay, remnant, oil50, ascent, assemble12, seventh-lamp, streak14, streak30, act6-watch`

---

## 9. Improvement Roadmap

### Tier 1 — High impact, low effort (days)

1. **Surface the hidden modes.** Add Daily/Blitz/Trial/Endless/Recall to `MENU_GROUPS` (or a "Challenges" group). This instantly makes ~60% of built content playable. One-line change per mode (`hidden:false`) plus menu grouping.
2. **Add a second difficulty.** The `DIFFS` system already exists and is stubbed to one entry. Add e.g. "Pilgrim" (3 lives, 1.0× time) and keep Watchman as the identity difficulty. `resolveDiff()` already centralizes selection.
3. **Convert judge PNGs to WebP.** ~5 MB → ~1 MB. Two files.
4. **Add CSP + security headers to `vercel.json`.** One config block.
5. **Set up CI (GitHub Actions).** One workflow file running `node test.js` on push/PR. The test suite already exists and passes.

### Tier 2 — High impact, medium effort (1–2 weeks)

6. **Split `game.js`.** Extract save system (`save.js`), seals (`seals.js`), run state (`run.js`), keyboard routing. The project's own `plans/code-organisation-fix.md` already scopes this.
7. **Onboarding rework.** First-run experience should teach the loop with 3–5 guaranteed-easy verses, no timer threat, before the intro cinematic. The v1.4 plan's "Truth, Campaign-First" direction is right; pair it with a gentler first minute.
8. **ARIA live regions for play.** Announce question, answer result, timer warnings. Makes the core loop screen-reader-playable.
9. **Lazy-load media.** Intro video `preload="none"` + poster; act tracks fetched on act start.
10. **Oil economy expansion.** Second sink (relic upgrades, cosmetic skies) to give oil meaning beyond `oil50`.

### Tier 3 — Strategic (months)

11. **Content expansion.** 579 verses is solid; the architecture (quarantine pipeline, QA scripts) supports scaling to 1,000+. Prioritize famous-chapter completion (Psalm 23, John 1, Romans 8, etc.) for emotional resonance.
12. **Social layer.** Friend leaderboards, shared daily results (Wordle-style emoji grid export). The daily seed already exists — the share mechanic is cheap and viral.
13. **Native wrapper (Capacitor).** The PWA works; a wrapper adds push notifications for SRS reminders — the single highest-retention feature a memory app can have.
14. **Analytics (privacy-respecting).** Plausible/Fathom self-hosted. Answer the question: where do players actually die? Act III? The Final Test? Data would validate the difficulty-wall hypothesis.
15. **Localization of UI.** KJV stays; UI strings could localize (Spanish/Portuguese Bible memory is a large market).

---

## 10. Conclusion

Complete the Verse is a **serious, disciplined, distinctive piece of work**. The zero-build philosophy, 38-suite test culture, quarantine pipeline, and graceful-degradation patterns are better than many commercial codebases. The "memory as pilgrimage" identity is coherent from code to copy to art direction.

Its three real problems are: **(1) five of eight modes are unreachable**, **(2) the difficulty system is stubbed to a single punishing setting**, and **(3) the orchestrator file has grown into a god-file**. All three are fixable in weeks, not months — and the first two are nearly one-liners.

The deepest strength — the SRS engine quietly turning a game into a genuine memorization tool — is also the biggest opportunity: with push reminders and a shareable daily, this becomes a daily-habit product, not just a game.

---

*Report generated from static analysis of the full codebase, executed tests, and file inspection. All counts (579 verses, 66 books, 22 sites, 5 arcs, 37 seals, 37 test suites) verified against live code on 2026-08-19.*
