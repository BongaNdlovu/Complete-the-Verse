# Complete the Verse — Production Readiness and Product Edge Report

**Date:** 2026-08-31  
**Repository state audited:** `master` at `9bc159f`  
**Production:** <https://complete-the-verse.vercel.app/>  
**Scope:** release gates, deployment, offline support, security, accessibility, performance, first-session experience, retention, and differentiation.

## Executive summary

Complete the Verse is beyond prototype stage. It has a strong offline single-player experience, 899 KJV verse items, a 46-site pilgrimage, 46 relics, spaced repetition, extensive automated tests, cinematic media, Word Tablets, and a complete but currently locked Valley story.

The full cloud-enabled product is not production-ready yet. The immediate blockers are:

1. The automated test gate passes only 53 of 54 suites.
2. The production Supabase project is inconsistent across configuration and documentation.
3. Deployment of the trusted `submit-score` Edge Function is not verified.
4. Existing database policies may still permit authenticated users to bypass the trusted score path.
5. Word Tablets scripts are missing from the service worker precache.

The product’s strongest competitive edge is not another mode. It is:

> Scripture memory that feels like walking holy ground, not studying flashcards.

The product should lead with a short daily pilgrimage, place-bound recall, ceremonial progression, Story Beats, and a colder re-walk after Patmos.

## Verification performed

| Check | Result |
|---|---|
| `npm run lint` | Passed |
| `npm test` | 53 of 54 suites passed |
| Production URL | Responding |
| Git working tree | Clean |
| Current branch | `master`, aligned with `origin/master` |
| Verse bank | 899 items across 66 books |
| Journey | 46 sites across 5 arcs |
| Relics | 46 |
| Frontend model | Static, zero-build application |
| Hosting | Vercel |
| Optional backend | Supabase |

The failing suite is `test/fixes.test.js`. Its menu keyboard assertion still expects:

```js
MENU_ORDER.filter(x => MODES[x] && !MODES[x].hidden)[0]
```

The current implementation correctly also excludes incoming modes:

```js
MENU_ORDER.filter(x => MODES[x] && !MODES[x].hidden && !MODES[x].incoming)[0]
```

This is a stale test contract caused by locking The Valley as incoming. It is a small fix, but CI remains red until it is corrected.

## What is already production-strength

### Content and campaign

- 899 KJV verse items across all 66 books.
- A 46-site chronological pilgrimage from Ur to Patmos.
- A relic associated with every journey site.
- Site-specific verse drawing and typed closing questions.
- Post-Patmos spiral passes with increasingly demanding recall.
- Content QA and quarantine tooling.

### Learning system

- SM-2-inspired spaced repetition.
- Due verses folded back into journey play.
- Multiple mechanics: choice, typed recall, assembly, cloze, duel, Fade, passage naming, true/false, and set pieces.
- Review scheduling across normal modes.
- Daily due-review entry point.

### Technical foundation

- Static application with no production build step.
- CI runs dependency installation, lint, and the complete test gate.
- 54 registered test suites.
- Oxlint complexity ceiling of 20.
- Offline-capable service worker with bounded runtime audio caching.
- Optional cloud functions do not block offline play.
- Media quality and data-saver gates.
- Security headers including CSP, frame protection, referrer policy, permissions policy, and `nosniff`.

### Accessibility and resilience

- Keyboard controls.
- Reduced-motion support.
- High-contrast setting.
- Voice captions and live regions.
- Minimum touch-target contracts.
- Named failure states.
- Local save backup when corrupt JSON is encountered.
- Fail-closed cloud score submission.

### Presentation

- Cohesive biblical-thriller visual identity.
- Journey stills and significant-site video loops.
- Music, voice, and dedicated sound effects.
- Word Tablets with unique carve and shatter feedback.
- A complete David and Goliath Story Beat in The Valley.

## Production release blockers

### P0. Restore a green CI gate

**Evidence:** `npm test` exits with one failed suite.  
**Location:** `test/fixes.test.js:80–81`.  
**Impact:** GitHub Actions will fail on push or pull request. A production release should not proceed with the main regression gate red.

**Acceptance criterion:**

- Update the stale assertion to exclude `incoming` modes.
- Run `npm test`.
- Confirm 54 of 54 suites pass locally and in GitHub Actions.

### P0. Establish one production Supabase project

**Evidence:**

- `js/cloud-config.js` points to `fgwfniblkuozxlbgytfk`.
- `docs/BACKEND.md` still names `eanjhcktflbpbjkdjtej`.
- Deployment commands do not consistently use the same project.

**Impact:** Migrations or functions could be deployed to a project different from the one used by the browser.

**Acceptance criterion:**

- Confirm the intended production project.
- Use that project reference in `cloud-config.js`, `BACKEND.md`, `LEADERBOARD-OPERATIONS.md`, and migration documentation.
- Verify sign-in, save sync, Daily submission, and Blitz submission against it.

### P0. Deploy and verify trusted score submission

**Evidence:** The Edge Function exists at `supabase/functions/submit-score/index.ts`, but repository documentation says deployment was not performed by the local release pass.

The browser fails closed if the function is unavailable. That protects public boards, but signed-in players cannot submit scores until the function is live.

**Acceptance criterion:**

1. Apply migrations `001` through `004`.
2. Deploy `submit-score` to the canonical project.
3. Submit one authenticated Daily result.
4. Submit one authenticated Blitz result.
5. Confirm `{ "ok": true }`.
6. Confirm corresponding `score_submission_log` rows.

## High-priority production gaps

### P1. Prevent direct score-table writes

The Edge Function validates authentication, score ceilings, difficulty, dates, and submission rate. However, existing RLS policies may still let an authenticated user insert or update their own score rows through PostgREST.

That would bypass rate limiting and submission logging.

**Acceptance criterion:**

- Revoke direct authenticated inserts and updates on shared score tables.
- Permit writes only through the trusted server path.
- Attempt a direct REST write with a normal user JWT and confirm rejection.

### P1. Add Word Tablets to offline precaching

`index.html` loads:

- `js/tablets.js`
- `js/tablets-run.js`

Neither is currently listed in `sw.js` `PRECACHE_ASSETS`.

**Impact:** Word Tablets may fail after an offline reload even though the rest of the shell is cached.

**Acceptance criterion:**

- Add both scripts to the precache.
- Bump `CACHE_VERSION`.
- Install the PWA, go offline, reload, and complete a Tablets run.

### P1. Show corrupt-save recovery

The save loader backs up invalid data and sets `_saveCorruptPending`. A `save-corrupt` Flow state exists, but no runtime path displays it.

**Impact:** A player can appear to lose progress without explanation even though a backup was retained.

**Acceptance criterion:**

- Display the recovery state during boot.
- Explain that a backup was preserved.
- Offer diagnostics copy or reset continuation.
- Add an integration test.

### P1. Add production observability

The game has a local diagnostics buffer, but no information reaches the operator.

Important production failures currently depend on players reporting them:

- boot exceptions;
- service worker failures;
- cloud sign-in failures;
- save-sync failures;
- Edge Function outages;
- first-session abandonment.

**Minimum viable acceptance criterion:**

- Supabase alerts for Edge Function failures and rate-limit spikes.
- A release/on-call runbook.
- Privacy-respecting reporting for uncaught client errors.
- A small funnel: boot reached, first Ur question reached, first site completed.

Avoid a large analytics platform initially. Three or four events are enough to verify the product thesis.

## Medium-priority production gaps

### P2. Add a real-browser release gate

Most automated tests run in Node or a VM shim. They provide broad structural coverage but cannot fully prove:

- media autoplay and audio unlocking;
- service worker lifecycle;
- offline reload;
- browser focus behavior;
- real drag/tap assembly;
- mobile geometry;
- PWA installability.

**Acceptance criterion:**

- Add one headless CI smoke: boot → menu/atlas → start Ur → answer → results.
- Require manual sign-off for offline, iOS, Android, keyboard-only, and screen-reader checks.

### P2. Establish a performance budget

Measured local media totals:

- `assets/`: approximately 128.6 MB
- `audio/`: approximately 53.3 MB
- `sfx/`: approximately 0.7 MB

Largest files include:

| Asset | Approximate size |
|---|---:|
| Valley prologue | 18.5 MB |
| Dothan journey loop | 11.0 MB |
| `audio/heroes.mp3` | 8.9 MB |
| Moses question art | 7.4 MB |
| Shechem journey loop | 6.6 MB |
| Moriah journey loop | 5.0 MB |

The assets are mostly lazy, so repository size is not equal to first-load size. The problem is the absence of a measured target.

**Acceptance criterion:**

- First interactive screen in under five seconds on a mid-tier mobile 4G profile.
- No automatic download of Story Beat films before they are requested.
- Compress the largest PNG and legacy media outliers.
- Record Lighthouse performance, accessibility, best-practices, and PWA results.

### P2. Finish PWA packaging

The manifest currently uses SVG icons only. Some mobile installation surfaces expect raster 192×192 and 512×512 icons.

Service worker registration failures are silently swallowed.

**Acceptance criterion:**

- Add 192×192 and 512×512 PNG icons, including a maskable icon.
- Verify Android Chrome installation.
- Verify iOS home-screen behavior.
- Record service worker registration failures in diagnostics.

### P2. Tighten the script CSP

`vercel.json` permits `'unsafe-inline'` for scripts because service worker registration is inline in `index.html`.

**Acceptance criterion:**

- Move registration into a small external script.
- Remove `'unsafe-inline'` from `script-src`.
- Verify production headers after deployment.

### P2. Publish privacy information

Cloud accounts collect email and display name through Supabase. No public privacy page is present.

**Acceptance criterion:**

- Add a short privacy page.
- Link it from Settings near Cloud account controls.
- Explain stored data, processors, public leaderboard fields, optional cloud use, deletion, and localStorage.

### P2. Clean release documentation

Current contradictions include:

- 579, 776, and 899 verse claims.
- 28, 36, 46, 51, and 54 test-suite claims.
- two Supabase project references.
- historical reports describing removed rival HUD behavior.
- old descriptions of direct score fallback.
- backend documentation saying Blitz is not shipped.

Historical reports can remain historical, but operational checklists must describe the current product.

**Acceptance criterion:**

- Make `README.md`, `DEVELOPER-GUIDE.md`, `BACKEND.md`, `LEADERBOARD-OPERATIONS.md`, and `SMOKE-CHECKLIST.md` authoritative and current.
- Clearly label old reports as snapshots.

## Lower-priority engineering cleanup

These should not delay the production blockers:

1. Remove unused `@supabase/ssr` if there is no planned SSR client.
2. Document why npm `@supabase/supabase-js` exists while the browser uses a vendored build, or remove the unused package.
3. Update or delete `scripts/verify-rival-browser.js`, which still references the removed rival HUD.
4. Add release tags and a single version shared by the package and service-worker cache.
5. Consider self-hosting the critical fonts for consistent first-offline rendering.

## Product edge assessment

### The current product identity is split

The intended product is a single daily pilgrimage:

- one location;
- eight verses;
- due review folded in;
- a final typed recall;
- a clear stopping point;
- return tomorrow.

The current hall gives equal visual weight to many modes:

- Pilgrimage;
- Word Tablets;
- Daily Trial;
- Drill;
- Recall;
- Team;
- Blitz;
- Trial;
- Endless;
- The Valley as Incoming.

Each mode may be worthwhile, but equal presentation weakens the product story. New players see a mode collection before they understand why this game is different.

### The first session is too long for the promise

The current new-player path can include:

1. Intro video.
2. Boot sequence.
3. Six-lesson tutorial.
4. Main hall.
5. Profile creation.
6. Atlas.
7. Site brief.
8. Ur prologue.
9. First playable verse.

The strongest product specification in the repository calls for reaching the first Ur blank in roughly 45 seconds.

This is likely the largest product risk because the target audience includes people who have already abandoned other Bible-reading or memorization products.

### Watchman is the only difficulty

`DIFFS` contains only Watchman, and `resolveDiff()` always returns it.

Pressure is part of the game’s identity, but there is currently no learning ramp. Players who need the memory system most may leave before reaching it.

### The Valley is complete but unavailable

The David and Goliath Story Beat includes:

- an opening film;
- twelve authored questions;
- multiple mechanics;
- cinema B;
- dedicated voice and sound;
- Held/Scarred outcomes.

It is currently marked `incoming:true`, which is intentional. When it is ready to unlock, it should be launched as a flagship story chapter, not presented as another ordinary mode card.

### The spiral re-walk is under-marketed

The game already has an answer to what happens after Patmos:

- Pass 1 includes a typed finale.
- Pass 2 increases assembly.
- Pass 3 and later demand full assembly.

That is a strong retention and mastery feature, but the player-facing product does not strongly explain it.

### Social features are incomplete

The game has:

- global Daily and Blitz boards;
- text sharing;
- cloud APIs and tests related to friend races;
- local pass-and-play Team Mode.

Friend-race infrastructure lacks a clear user-facing create/join/share flow. This should either receive one minimal interface or remain out of the production promise.

## Recommended edge thesis

### Positioning

> Complete the Verse is a daily Scripture pilgrimage: walk one biblical place, restore eight verses, and carry the Word forward from Ur to Patmos.

### Five signature pillars

#### 1. The Coffee Pin

Returning players open directly onto today’s next location. Due verses are folded into the site. The final beat is produced from memory.

Most of the underlying engine already exists. The missing work is routing and first-session simplification.

#### 2. Geography-bound memory

Verse, site, map, relic, archaeology, atmosphere, and live conditions create a memory context that ordinary flashcards do not provide.

This is already shipped and should lead the product’s marketing.

#### 3. Ceremonial habit

Completion should feel like closing a short daily office, not feeding a guilt streak.

Existing assets already support this:

- Seventh Lamp;
- seals;
- relics;
- chapter holds;
- restrained ceremonial sound;
- completion cinematics.

#### 4. Story Beats

The Valley proves that Scripture stories can become authored, replayable cinematic chapters.

Do not build a generic Story Beat framework yet. Launch The Valley, measure it, then create one second story using the existing documented pattern.

#### 5. Spiral re-walk

The same road becomes harder after Patmos. This gives the 46-site campaign long-term mastery without requiring hundreds of new locations.

## Recommended product sequence

### Phase 1 — Stabilize the release

**Estimated window:** one to two days.

- Restore 54 of 54 passing suites.
- Confirm the production Supabase project.
- Apply migrations.
- Deploy and test `submit-score`.
- Restrict direct score writes.
- Add Tablets scripts to the service worker.
- Bump the cache version.

### Phase 2 — Release safely

**Estimated window:** two to four days.

- Display corrupt-save recovery.
- Add privacy information.
- Add raster PWA icons.
- Tighten the script CSP.
- Add production alerts and minimal error reporting.
- Run the complete manual browser/device smoke.
- Establish the media budget.

### Phase 3 — Sharpen the product

**Estimated window:** one to two weeks.

- Get a new player to the first Ur blank in under 45 seconds.
- Make Pilgrimage the front door.
- Treat Today and Drill as supporting loops.
- Move challenges behind a secondary path.
- Add a gentler learning ramp.
- Explain Pass 2 when Patmos is completed.

### Phase 4 — Build the edge

Only after the funnel is measured:

- Unlock and launch The Valley.
- Create one additional Story Beat.
- Add spoiler-safe daily sharing.
- Add optional due-review reminders.
- Add a minimal friend-race create/join/share flow or remove it from the product promise.

## What not to build yet

To avoid diluting the product:

- Do not add another public game mode.
- Do not build a relic power tree before measuring first-session completion.
- Do not expand friend-race backend infrastructure without a minimal player-facing flow.
- Do not perform a large architecture rewrite while release gates remain open.
- Do not add commentary merely to increase content volume.
- Do not make leaderboards the core differentiator.

The moat is place-bound recall, daily completion, authored atmosphere, ceremony, and mastery through the re-walk.

## Production release checklist

### Automated gates

- [ ] `npm run lint` passes.
- [ ] `npm test` passes 54 of 54 suites.
- [ ] GitHub Actions passes on `master`.
- [ ] Working tree is clean.

### Backend

- [ ] Canonical Supabase project confirmed.
- [ ] Migrations `001`–`004` applied.
- [ ] Auth redirect URLs verified.
- [ ] `submit-score` deployed.
- [ ] Daily submission verified.
- [ ] Blitz submission verified.
- [ ] Submission audit rows verified.
- [ ] Direct client score writes rejected.

### Offline and PWA

- [ ] `tablets.js` and `tablets-run.js` precached.
- [ ] Service-worker cache version bumped.
- [ ] Offline Pilgrimage tested.
- [ ] Offline Word Tablets tested.
- [ ] Runtime audio-cache behavior tested.
- [ ] Android install tested.
- [ ] iOS home-screen behavior tested.

### Browser and accessibility

- [ ] Chrome desktop playthrough.
- [ ] Firefox desktop playthrough.
- [ ] Safari playthrough.
- [ ] Keyboard-only completion.
- [ ] VoiceOver or NVDA completion.
- [ ] TalkBack completion.
- [ ] Reduced-motion completion.
- [ ] High-contrast completion.
- [ ] 390 px mobile viewport checked.
- [ ] 1366×768 laptop viewport checked.

### Operations and policy

- [ ] Privacy page linked.
- [ ] Error and backend alerts configured.
- [ ] Release version tagged.
- [ ] Smoke checklist updated.
- [ ] Backend project references reconciled.
- [ ] Current verse and test counts documented.

## Final verdict

Complete the Verse is shippable as a strong offline/local single-player game after the one stale test is fixed.

It is not ready to claim a complete production cloud experience until Supabase deployment, score-write authority, offline Word Tablets, and operational verification are complete.

The shortest route to an edge is not adding more systems. It is:

1. shorten the first session;
2. make the daily pilgrimage unmistakably primary;
3. retain the pressure while adding a learning ramp;
4. launch The Valley as a flagship chapter;
5. make the spiral re-walk visible.

That combination is difficult for ordinary Bible quiz and flashcard products to imitate because it depends on the whole existing system working together: Scripture, place, memory, atmosphere, and return.
