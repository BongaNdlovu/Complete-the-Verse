# Production Fixes and Verification Report

**Date:** 2026-08-20  
**Project:** Complete the Verse  
**Scope:** question mechanics, lifecycle safety, accessibility, data consistency, and release verification

## Outcome

The audited P0/P1 gameplay defects were fixed and the complete automated gate is green: **45 of 45 registered suites passed**. The local static server also served the edited application and optimized core assets successfully.

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
| Rare Illuminate reward | Added The Hidden Flame as a rare long-run mastery contract. It appears only on the hard rotation, requires a 12-answer streak with no power used, settles only at run completion, and banks one Illuminate in a persistent reserve for a later run. | [`js/rewards.js`](../../js/rewards.js), [`js/game.js`](../../js/game.js), [`js/results.js`](../../js/results.js), [`js/cloud.js`](../../js/cloud.js), [`test/rewards.test.js`](../../test/rewards.test.js) |
| Contrast and touch targets | Raised default dim text contrast and brought compact controls, power buttons, virtual keys, segmented controls, report controls, and icon buttons to a minimum 44px target. | [`css/game.css`](../../css/game.css), [`css/play.css`](../../css/play.css), [`css/atlas.css`](../../css/atlas.css), [`test/production-readiness.test.js`](../../test/production-readiness.test.js) |
| Spoken-line access | Added an aria-live readable caption surface for Director speech and the direct intro voice clip, including when voice playback is disabled or blocked. | [`index.html`](../../index.html), [`js/director.js`](../../js/director.js), [`js/briefs.js`](../../js/briefs.js) |
| State feedback | Added explicit syncing and sync-error cloud states while retaining offline, loading, empty, board-error, and cloud-failure recovery states. | [`js/cloud.js`](../../js/cloud.js), [`js/briefs.js`](../../js/briefs.js), [`js/panels.js`](../../js/panels.js) |
| Media payload | Switched active journey scenes to compact WebP, removed 18 unused JPG/PNG duplicates, added lazy async image loading, deferred video/music loading, and retained poster/fallback artwork. | [`scripts/optimise-media.py`](../../scripts/optimise-media.py), [`assets/journey`](../../assets/journey), [`index.html`](../../index.html), [`js/audio.js`](../../js/audio.js) |
| Trusted leaderboard | Removed direct browser writes when the Edge Function is unavailable. Added date/difficulty validation, submission rate limiting, audit logging, score reports, RLS policies, and an operations runbook. | [`js/cloud.js`](../../js/cloud.js), [`supabase/functions/submit-score/index.ts`](../../supabase/functions/submit-score/index.ts), [`supabase/migrations/004_leaderboard_moderation.sql`](../../supabase/migrations/004_leaderboard_moderation.sql), [`docs/LEADERBOARD-OPERATIONS.md`](../LEADERBOARD-OPERATIONS.md) |

## Verification evidence

The following checks were run after the fixes:

- `npm test` / `node test.js` — **all 45 suites passed**.
- `node test/rewards.test.js` — 27 assertions covering rotation, rare Illuminate difficulty, settlement gating, payout amounts, and Blitz timeout behavior.
- Fade regression coverage confirms complete-verse display, a 30-second memorization clock, delayed dissolve, full-passage word-bank construction, required ordered reconstruction, and fresh-question unlock behavior.
- Illuminate regression coverage confirms each special mechanic receives a usable, distinct clue instead of assuming that four answer buttons exist.
- `node test/question-mechanics.test.js` — Strike positions/lockout, 30-second Fade reconstruction, mode-specific Illuminate, keyboard semantics, and Psalms normalization passed.
- `node test/all-game-modes.test.js` — all 10 game modes, 43 assertions passed.
- `node test/arc1-deep-verification.test.js` — all 9 Arc I sites, 387 assertions passed.
- `Get-ChildItem js -Filter *.js | ForEach-Object { node --check $_.FullName }` — all 38 JavaScript files parsed successfully.
- `node test/production-readiness.test.js` — reward reserve, contrast, 44px controls, captions, state feedback, media loading, trusted submission, rate limits, reporting, RLS, and operations evidence passed.
- Media evidence: nine active journey WebP files are present, each under 220KB; the nine old JPG and nine old PNG duplicates were removed after a reference audit.
- Server smoke check: `http://localhost:8781/`, `index.html`, `js/rewards.js`, `assets/journey/ur.webp`, and the moderation migration returned HTTP 200.
- The content gate inside `node test.js` passed the verse and passage QA checks.
- Local server smoke check: `http://localhost:8781/`, `index.html`, `js/rewards.js`, `js/play.js`, and `css/play.css` all returned HTTP 200. Served-content checks confirmed the reward script tag, quick-reward HUD, resolver, play wiring, and reward styles are available from the running server.

## Browser/computer test status

I attempted to connect to the browser surface for a live playthrough. The environment reported **no browser available**, and its browser availability list was empty. Therefore I am not claiming screenshot- or pointer-level browser evidence. The local server and deterministic runtime simulations provide the available evidence, but a human or CI browser session should still perform the final visual/mobile pass before a public release. :codex-annotation{index="1"}

## External release step still required

The leaderboard migration and `submit-score` Edge Function are implemented and tested locally, but deployment was not executed because it requires the project owner's authenticated Supabase CLI session. Follow [`docs/LEADERBOARD-OPERATIONS.md`](../LEADERBOARD-OPERATIONS.md), apply migration `004_leaderboard_moderation.sql`, deploy the function, and verify an authenticated Daily and Blitz request before enabling public leaderboard claims.

## Deliberate product boundary

Passage/reconstruction prompts continue to record aggregate verse statistics but do not create SRS cards: they have synthetic passage IDs rather than standalone bank verse IDs, and the SRS queue is verse-bank based. Turning them into review cards needs a separate passage-card model; silently adding dead cards would be misleading.

The worktree contained pre-existing user changes before this pass. Those changes were preserved; the fixes above were layered onto the existing state.
