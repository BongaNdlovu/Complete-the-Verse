# Production Fixes and Verification Report

**Date:** 2026-08-21
**Project:** Complete the Verse  
**Scope:** question mechanics, lifecycle safety, accessibility, data consistency, and release verification

## Outcome

The requested reward, audio, rival-race, and mistake-pressure work is implemented and the complete automated gate is green: **46 of 46 registered suites passed**. The local server served the edited application, the ten soundtrack beds, and the dedicated memorization recording successfully.

## Fixes executed

| Area | Fix | Evidence |
|---|---|---|
| Falsehood Strike | Replaced the selected answer-position token by index, so repeated words in the prefix cannot be corrupted accidentally. Only one token is injected, and the DOM no longer exposes a `data-corrupt`/`corrupt-target` answer marker. | [`js/play.js:433`](../../js/play.js:433), [`js/play.js:453`](../../js/play.js:453) |
| Strike state | A wrong click now locks the question and uses the normal answer-resolution path: attempt count, miss history, review scheduling, life loss, and advance behavior all occur once. Correct reveals are run-token/scene guarded. | [`js/play.js:466`](../../js/play.js:466), [`js/game.js:419`](../../js/game.js:419) |
| Fade lifecycle | Fade intervals are cleared when stages change or a run is invalidated. Callbacks verify run token, scene token, question identity, and active view before changing controls. | [`js/play.js:400`](../../js/play.js:400), [`js/play.js:641`](../../js/play.js:641), [`js/game.js:423`](../../js/game.js:423) |
| Fade memory flow | Fade now gives the player exactly 30 seconds with the complete verse visible, dissolves the displayed answer, and transitions to a full-verse word bank. Every word must be dragged or tapped into its correct position before the player can lock the reconstruction; no multiple-choice shortcut remains. | [`js/play.js:640`](../../js/play.js:640), [`js/play.js:717`](../../js/play.js:717), [`js/typed.js:273`](../../js/typed.js:273), [`js/assemble.js:74`](../../js/assemble.js:74) |
| Mode-specific Illuminate | Illuminate now has a clear mechanic-specific action: narrows Strike to a half, marks the next Cloze word, marks the genuine Duel reading, highlights the next Fade reconstruction word, and retains progressive hints for normal assembly or two burned false options for standard choice. The power is unavailable during Fade memorization so the 30-second memory test remains honest. | [`js/game.js:972`](../../js/game.js:972), [`js/game.js:1020`](../../js/game.js:1020), [`js/play.js:500`](../../js/play.js:500), [`js/typed.js:98`](../../js/typed.js:98), [`css/play.css:813`](../../css/play.css:813) |
| Accessibility | Strike words are buttons; duel cards have button role, focus order, and Enter/Space activation; cloze and full-verse assembly slots are buttons; the live verse region announces question changes; focus-visible, power explanations, and reduced-motion styles were added. | [`index.html:281`](../../index.html:281), [`js/play.js:521`](../../js/play.js:521), [`js/typed.js:103`](../../js/typed.js:103), [`css/play.css:803`](../../css/play.css:803) |
| Book identity | Legacy `Psalm` rows are normalized to canonical `Psalms` when the bank is assembled, before filters, maps, and stats consume the data. | [`js/bank.js:34`](../../js/bank.js:34) |
| Regression protection | Added coverage for exact full-passage assembly, 30-second Fade lifecycle, full-verse reconstruction, stale Fade callbacks, and Illuminate behavior across Strike, Cloze, Duel, and Fade. Registered the all-modes and Arc I deep verifications in the main runner. | [`test/assemble.test.js`](../../test/assemble.test.js), [`test/question-mechanics.test.js`](../../test/question-mechanics.test.js), [`test/arc1-deep-verification.test.js`](../../test/arc1-deep-verification.test.js), [`test.js:20`](../../test.js:20) |
| Quick rewards | Added three rotating, skill-based per-run contracts: streak/precision/discipline. Rewards require real milestones, announce readiness in play, and bank only on a completed run (or Blitz timeout), preventing restart farming. | [`js/rewards.js`](../../js/rewards.js), [`js/game.js`](../../js/game.js), [`js/results.js`](../../js/results.js), [`test/rewards.test.js`](../../test/rewards.test.js) |
| Rare Illuminate reward | Made The Hidden Flame easier while keeping it uncommon: it appears on a controlled 1-in-4 eligible rotation, requires an 8-answer streak with no power used, settles only at run completion, and banks one Illuminate in a persistent reserve for a later run. | [`js/rewards.js`](../../js/rewards.js), [`js/game.js`](../../js/game.js), [`js/results.js`](../../js/results.js), [`js/cloud.js`](../../js/cloud.js), [`test/rewards.test.js`](../../test/rewards.test.js) |
| Tutorial lesson audio | Copied the six supplied lesson recordings into stable local filenames and mapped each exact tutorial phrase to its recording. Captions remain available as the readable fallback. | [`audio/voice`](../../audio/voice), [`js/director.js`](../../js/director.js), [`test/production-readiness.test.js`](../../test/production-readiness.test.js) |
| Supplied soundtrack additions | Added `Indigo` as a lazy soundtrack bed for the first-run tutorial; routed completed runs to `Final Stillness` and death/abandon results to `Sudden Descent`. The supplied `thirty seconds.mp3` now speaks the exact Lesson 5 thirty-second memorization instruction, with captions retained as fallback. | [`audio/indigo.mp3`](../../audio/indigo.mp3), [`audio/final-stillness.mp3`](../../audio/final-stillness.mp3), [`audio/sudden-descent.mp3`](../../audio/sudden-descent.mp3), [`audio/voice/thirty-seconds.mp3`](../../audio/voice/thirty-seconds.mp3), [`js/audio.js`](../../js/audio.js), [`js/play.js`](../../js/play.js), [`js/results.js`](../../js/results.js), [`js/director.js`](../../js/director.js), [`test/soundtrack.test.js`](../../test/soundtrack.test.js) |
| Rival races | Added a visible pursuer HUD to Trial and Pilgrimage. A new player receives a local pacing baseline immediately; a saved previous run is preferred; a cloud ghost from `fetchGhosts()` replaces it when available. Trial ghosts use the campaign route, while Pilgrimage ghosts are keyed per site. The HUD now occupies an in-flow slot, so it cannot cover the verse or answer buttons on desktop or mobile layouts. | [`index.html`](../../index.html), [`js/game.js`](../../js/game.js), [`js/results.js`](../../js/results.js), [`css/game.css`](../../css/game.css), [`test/rival-race.test.js`](../../test/rival-race.test.js) |
| Recoverable mistake pressure | In the confirmed recommended pressure model, the first miss shortens the next clock, two consecutive misses veil one wrong reading briefly, low time makes the HUD urgent, and three consecutive misses record a recoverable retreat. Permanent relics, rewards, and cleared sites are never deleted. | [`js/play.js`](../../js/play.js), [`js/results.js`](../../js/results.js), [`css/play.css`](../../css/play.css), [`test/rival-race.test.js`](../../test/rival-race.test.js) |
| Rival assets & rendering | Generated and integrated the three 512×512 transparent RGBA rival assets (`shadow-pursuer.png`, `previous-pilgrim.png`, and `rival-mask.png`). The HUD overlays the dynamic asset with graceful fallback to the `◈` glyph on error. Mistake pressure switches the figure to the threat mask, and the results screen displays the retreat mask with the non-destructive safety message. | [`assets/rival`](../../assets/rival), [`js/game.js`](../../js/game.js), [`js/results.js`](../../js/results.js), [`css/game.css`](../../css/game.css), [`test/rival-race.test.js`](../../test/rival-race.test.js) |
| Contrast and touch targets | Raised default dim text contrast and brought compact controls, power buttons, virtual keys, segmented controls, report controls, and icon buttons to a minimum 44px target. | [`css/game.css`](../../css/game.css), [`css/play.css`](../../css/play.css), [`css/atlas.css`](../../css/atlas.css), [`test/production-readiness.test.js`](../../test/production-readiness.test.js) |
| Spoken-line access | Added an aria-live readable caption surface for Director speech and the direct intro voice clip, including when voice playback is disabled or blocked. | [`index.html`](../../index.html), [`js/director.js`](../../js/director.js), [`js/briefs.js`](../../js/briefs.js) |
| State feedback | Added explicit syncing and sync-error cloud states while retaining offline, loading, empty, board-error, and cloud-failure recovery states. | [`js/cloud.js`](../../js/cloud.js), [`js/briefs.js`](../../js/briefs.js), [`js/panels.js`](../../js/panels.js) |
| Media payload | Switched active journey scenes to compact WebP, removed 18 unused JPG/PNG duplicates, added lazy async image loading, deferred video/music loading, and retained poster/fallback artwork. | [`scripts/optimise-media.py`](../../scripts/optimise-media.py), [`assets/journey`](../../assets/journey), [`index.html`](../../index.html), [`js/audio.js`](../../js/audio.js) |
| Trusted leaderboard | Removed direct browser writes when the Edge Function is unavailable. Added date/difficulty validation, submission rate limiting, audit logging, score reports, RLS policies, and an operations runbook. | [`js/cloud.js`](../../js/cloud.js), [`supabase/functions/submit-score/index.ts`](../../supabase/functions/submit-score/index.ts), [`supabase/migrations/004_leaderboard_moderation.sql`](../../supabase/migrations/004_leaderboard_moderation.sql), [`docs/LEADERBOARD-OPERATIONS.md`](../LEADERBOARD-OPERATIONS.md) |

## Verification evidence

The following checks were run after the fixes:

- `npm test` / `node test.js` — **all 46 suites passed**.
- `node test/rival-race.test.js` — **66 contracts passed** covering asset existence, 512×512 dimensions, RGBA alpha channels, file size boundaries, runtime asset map, source mapping, fallback error handlers, results threat asset, CSS layering, `.play-top-stack` document flow, readability veil z-index, and responsive layout.
- `node test/production-readiness.test.js` — passed all contracts including rival asset presence, runtime path resolution, accessible status region, `.play-top-stack` organization, and readability veil contrast.
- `Get-ChildItem js -Filter *.js | ForEach-Object { node --check $_.FullName }` — all 38 JavaScript files parsed successfully.
- `node test/soundtrack.test.js` — **10 beds wired**, including `Indigo`, `Final Stillness`, and `Sudden Descent`.
- `node test/voice.test.js` — **23 local voice files / 24 spoken keys passed**; the Lesson 5 exact phrase resolves to `thirty-seconds.mp3`.
- `node test/production-readiness.test.js` — passed the supplied-audio presence, MP3, mapping, and tutorial-selection contracts.
- Localhost HTTP evidence against `http://localhost:8781`:
  - `/` — HTTP 200, `text/html`
  - `/audio/indigo.mp3` — HTTP 200, `audio/mpeg`, 1,982,285 bytes
  - `/audio/final-stillness.mp3` — HTTP 200, `audio/mpeg`, 2,840,111 bytes
  - `/audio/sudden-descent.mp3` — HTTP 200, `audio/mpeg`, 2,829,743 bytes
  - `/audio/voice/thirty-seconds.mp3` — HTTP 200, `audio/mpeg`, 60,951 bytes
  - `/assets/rival/shadow-pursuer.png` — HTTP 200, `image/png`, 214.8 KB
  - `/assets/rival/previous-pilgrim.png` — HTTP 200, `image/png`, 337.7 KB
  - `/assets/rival/rival-mask.png` — HTTP 200, `image/png`, 304.9 KB

## Browser Verification & Geometry Hierarchy Status

Automated live browser verification was executed against the running dev server using headless Google Chrome connected via Chrome DevTools Protocol (CDP):

- **Pilgrimage Mode**: Verified the pursuer figure renders `shadow-pursuer.png` above the `◈` glyph fallback.
- **Trial Mode**: Verified the rival HUD appears on the campaign route.
- **Mistake Pressure**: Verified that two consecutive misses trigger a dynamic switch to `rival-mask.png` while keeping the status text and progress bar readable.
- **Reduced Motion**: Verified that `.reduced` mode disables pulse animation while preserving the image figure.
- **Results Screen**: Verified that recorded retreats display the threat mask image alongside the non-destructive safety message.
- **Console Log Audit**: 0 runtime JavaScript exceptions or errors in the live browser.
- **Viewport Matrix Geometry Verification (34/34 checks passed)**:
  - `1920×1080` (Desktop): Verified strict vertical order (`top-stack.bottom <= verse.top`, `rewards.bottom <= rival.top`, `rival.bottom <= verse.top`, `verse.bottom <= answers.top`, `answers.bottom <= controls.top`).
  - `1366×768` (Laptop): Verified zero overlap between HUD stack, verse stage, answers, and timer.
  - `1024×768` (Tablet): Verified clean spacing and readable typography.
  - `390×844` (Mobile): Verified 2-column rewards grid, collapsed HUD, and scrollable stage.
  - `430×932` (Large Mobile): Verified fluid stack with no content clipping.
- **Screenshots Captured**:
  - `rival_01_pilgrimage_pursuer.png`
  - `rival_02_trial_mode.png`
  - `rival_03_threat_mask_misses.png`
  - `rival_04_reduced_motion.png`
  - `rival_05_results_retreat_mask.png`
  - `ui_layout_desktop_1920x1080.png`
  - `ui_layout_laptop_1366x768.png`
  - `ui_layout_tablet_1024x768.png`
  - `ui_layout_mobile_390x844.png`
  - `ui_layout_mobile_430x932.png`

## UI Hierarchy & Layout Correction Architecture

1. **Dedicated Top HUD Stack (`.play-top-stack`)**:
   - Groups `.act-track`, `.quick-rewards`, and `.rival-hud` in a single flex column container with relative positioning (`z-index: 5`).
   - Replaced legacy absolute top offsets with in-flow ordering so progress, rewards, and the rival stack cleanly in separate rows.
2. **Dedicated Question Content (`.question-content`)**:
   - Encapsulates `.verse-stage`, `.answers`, `.control` (timer + lock), and `.powerbar` (`z-index: 3`).
   - Ensures the verse begins only after the top stack ends.
3. **Readability Veil & Contrast**:
   - `.biblical-thriller .stage::before` creates a dedicated readability veil (`z-index: 1`) using radial and linear dark gradients.
   - Reduced `#backdrop` artwork opacity to `0.32` and applied brightness/saturation filters, eliminating visual competition while preserving the atmospheric background.
4. **Explicit Visual Hierarchy**:
   `#backdrop` (z: 0) < readability veil (z: 1) < `.question-content` (z: 3) < `.play-top-stack` (z: 5) < `.rail` (z: 6) < `#judge-burst`/alerts (z: 10).

## Deliberate product boundary

Passage/reconstruction prompts continue to record aggregate verse statistics but do not create SRS cards: they have synthetic passage IDs rather than standalone bank verse IDs, and the SRS queue is verse-bank based. Turning them into review cards needs a separate passage-card model; silently adding dead cards would be misleading.

The worktree contained pre-existing user changes before this pass. Those changes were preserved; the fixes above were layered onto the existing state.
