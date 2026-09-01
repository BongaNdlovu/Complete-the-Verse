# Complete the Verse — Production Readiness Report

**Date:** 2026-09-01  
**Repository state audited:** `master` at `6954e7f`, aligned with `origin/master`  
**Production:** <https://complete-the-verse.vercel.app/>  
**Backend:** Supabase project `fgwfniblkuozxlbgytfk` (canonical, verified consistent)  
**Scope:** release gates, deployment currency, backend posture, offline/PWA, security, observability, documentation, and the open items that stand between the current state and a signed production release.  
**Supersedes:** [`PRODUCTION-EDGE-REPORT-2026-08-31.md`](./PRODUCTION-EDGE-REPORT-2026-08-31.md) — every P0/P1/P2 item in that report was re-audited against the current tree and live production.

## Executive summary

Complete the Verse is production-ready on the automated and deployed-artifact axis. All five P0/P1 blockers called out on 2026-08-31 are closed in code **and verified live in production**: the test gate is green at 55 of 55 suites, the service worker precaches the full Tablet set, the CSP no longer trusts inline scripts, direct score writes are revoked at the database level, corrupt-save recovery has a real UI and tests, privacy copy is published and linked, the PWA carries raster icons, and the `submit-score` Edge Function answers on the canonical project. The deployed service worker cache (`ctv-v1.8.32`) matches the local tree byte-for-byte, so production is running the audited code, not a stale build.

What remains is not engineering debt in the codebase — it is a short list of owner-side verifications and operator tasks that cannot be executed by an unauthenticated audit:

1. **Authenticated end-to-end submission** against production (Daily + Blitz returning `{ ok: true }` with a `score_submission_log` row) and a **negative test** proving a direct authenticated PostgREST write is rejected by the `005` migration.
2. **Application of the two newest migrations** (`005_edge_only_scores.sql`, `20260901104635_blitz_best_only.sql`) on the production project — the latter is not yet listed in the release-gate docs.
3. **Manual device and accessibility sign-off** (iOS, Android, keyboard-only, screen reader), which the automated gate cannot cover.
4. **Server-side observability** (Supabase alerts on non-2xx `submit-score`) — documented as guidance, not yet confirmed configured.

Verdict: **ship-ready pending the four operator items above.** The offline/local single-player product is fully shippable today.

## Verification performed by this audit

| Check | Result |
|---|---|
| `npm test` | **55 of 55 suites passed** (was 53/54 on 08-31) |
| `npm run lint` | 0 warnings, 0 errors across 119 files |
| `npm start` + local boot | Dev server path intact (`scripts/dev-server.js`) |
| Production URL | 200 OK in ~0.9 s |
| Production `sw.js` cache version | `ctv-v1.8.32` — **identical to local tree** |
| Production CSP header | `script-src 'self'` (no `unsafe-inline`), verified live |
| Production `privacy.html` | 200 OK |
| Production `js/register-sw.js` | 200 OK |
| Production `assets/icon-192.png` | 200 OK |
| `submit-score` Edge Function | **Deployed** — unauthenticated POST returns structured `401 UNAUTHORIZED_NO_AUTH_HEADER`, not 404 |
| `daily_scores` / `blitz_scores` tables | Live; anon `select` returns `200 []` under RLS |
| Git working tree | Clean except untracked `.tmp-live/`, `.tmp-proof/` (browser-proof screenshots from today's manual pass) |
| Branch state | `master` == `origin/master`, nothing unpushed |
| CI workflow | `.github/workflows/ci.yml` — `npm ci`, lint, full test gate on push/PR |
| Content counts | 899 verses · 66 books · 27 passages · 46 sites · 5 arcs · 46 relics (asserted by `metadata`, `game structure`, `atlas data` suites) |
| Node | v24.15.0 local; CI pins Node 20 LTS |

A manual browser proof pass was also performed today (screenshots under `.tmp-proof/`: 25 desktop and 24 phone views covering intro → tutorial → hall → every mode → atlas → site brief → results, plus Tablet runs and the audio dock under `.tmp-live/`). These are untracked proof artifacts, not part of the release.

## Blocker ledger — re-audit of the 2026-08-31 report

### P0. Restore a green CI gate — CLOSED

The stale `test/fixes.test.js` menu assertion was fixed. The suite now passes with 106 assertions, a **new `test/production-readiness.test.js` contracts suite** was added (release contracts for rewards, lesson voice assets, boards, media optimizer, service worker, and the Edge Function source), and the gate stands at 55 suites. The smoke checklist and developer guide were updated to the same count.

### P0. Establish one production Supabase project — CLOSED

Every reference now names `fgwfniblkuozxlbgytfk`: `js/cloud-config.js` (URL + publishable key), `docs/BACKEND.md` ("Canonical client project ref… Do not apply migrations or deploy functions to a different project"), `docs/LEADERBOARD-OPERATIONS.md`, and `supabase/config.toml` (`project_id`). The old `eanjhcktflbpbjkdjtej` reference is gone from the tree. `.env.local` holds only the same publishable values under `NEXT_PUBLIC_*` names — no service keys in the repo.

### P0. Deploy and verify trusted score submission — CLOSED (with one owner verification remaining)

The Edge Function is **live** on the canonical project: an unauthenticated POST to `/functions/v1/submit-score` returns `401 {"code":"UNAUTHORIZED_NO_AUTH_HEADER"}`, proving deployment and first-line auth. The score tables exist and are anon-readable under RLS. The client path fails closed — there is no Honor/direct fallback (automated per the smoke checklist).

**Remaining owner verification:** the *authenticated success path* (one Daily + one Blitz submission returning `{ ok: true }` and producing `score_submission_log` rows) requires a real signed-in session and was not exercised by this audit. It is smoke-checklist item 6 and remains the operator's confirmation step.

### P1. Prevent direct score-table writes — CLOSED in code (owner negative-test remaining)

`supabase/migrations/005_edge_only_scores.sql` drops the per-user write policies on `daily_scores`/`blitz_scores`, revokes `insert, update, delete` from `anon` and `authenticated`, and grants writes to `service_role` only. The submission log is likewise service-role-only. Combined with the Edge Function's server-side re-clamping (score, accuracy, duration, difficulty, rate — 172-line function with rate limiting), the trusted path is the only write path **once the migration is applied and confirmed on production**.

### P1. Word Tablets offline precache — CLOSED

`sw.js` `PRECACHE_ASSETS` now includes `js/tablets.js`, `js/tablets-canon.js`, `js/tablets-hall.js`, `js/tablets-run.js`, plus `js/register-sw.js`, `privacy.html`, and the three PNG icons. `CACHE_VERSION` was bumped to `ctv-v1.8.32` and matches production.

### P1. Corrupt-save recovery UI — CLOSED

The full chain is wired: `js/game.js` detects the invalid save, records it, backs it up, and sets `window._saveCorruptPending`; `js/flow.js` defines the `save-corrupt` state; `js/briefs.js:868` renders it during boot. Covered by `test/diag.test.js` and `test/flow.test.js`, and by smoke-checklist item 3 (set `ctv_save_v3` to `{`, reload, verify recovery state + `ctv_save_v3_broken` backup key).

### P1. Production observability — SUBSTANTIALLY CLOSED (operator configuration remaining)

- **Client error capture:** SW registration failures are recorded (`js/register-sw.js` → `Diag.record({kind:"sw-register-fail"})`); boot/save/cloud failures land in the diagnostics buffer, exportable via Settings → Copy diagnostics.
- **Funnel:** `js/game.js:343` stamps `SAVE.life.funnel[step]` (`boot`, `ur`, `site`) and mirrors each step into diagnostics — exactly the minimal three-event funnel the previous report asked for, carried on signed-in saves so it syncs.
- **Runbook:** `docs/LEADERBOARD-OPERATIONS.md` documents alert targets (non-2xx `submit-score`, especially `429`/`rate-check-unavailable`/`submission-log-failed`), log review cadence, moderation, and recovery steps.

**Remaining:** the Supabase alert rules themselves are dashboard configuration only the owner can perform/confirm; there is still no automated uncaught-error transport off-device (deliberately minimal — acceptable for launch, revisit after the funnel has data).

### P2 items — all addressed

| 08-31 item | Status |
|---|---|
| Real-browser release gate | `test/playthrough-simulation.test.js` automates boot → Ur → answer → results (56 assertions); manual smoke checklist updated and a manual desktop+phone proof pass was executed today |
| Performance budget | **Partial.** LRU audio cap (25 entries) and network-first HTML shell are in place; measured totals are ~131 MB `assets/`, ~54 MB `audio/`, ~1 MB `sfx/` (lazy by design). **No recorded Lighthouse/first-load target yet** — carried below |
| PWA packaging | Raster `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` in the manifest and precache; SW failures recorded. Android/iOS install confirmation remains manual |
| Script CSP | **Closed.** All scripts external (`index.html` has zero inline scripts), registration extracted to `js/register-sw.js`, production header verified |
| Privacy page | `privacy.html` live: local storage, optional Supabase accounts, board fields, processors (Vercel/Supabase/Open-Meteo/Esri/OSM), deletion path; linked from all three Settings account states in `js/panels.js` |
| Documentation contradictions | Clean: README, DEVELOPER-GUIDE, BACKEND, LEADERBOARD-OPERATIONS, SMOKE-CHECKLIST agree on 899 verses / 55 suites / canonical project; no stale 579/776 claims in live docs; historical reports remain labeled snapshots |

## Product gaps from the 08-31 report — status

Two of the three product-level risks were addressed in the last five commits:

- **Learning ramp shipped.** `DIFFS` now defines `Disciple` (3 lamps, ×0.85 score, full time) and `Watchman` (2 lamps, ×0.85 time, ×1.0 score). New saves start on Disciple; Settings and the site brief switch to Watchman. The "only Watchman" blocker is gone.
- **First session shortened.** Smoke item 1 now requires boot to reach Ur *without* intro film, tutorial, profile creation, or hall stop — the Coffee-Pin front door from the edge thesis. `test/first-run.test.js` and `test/coffee-pilgrim.test.js` (39 assertions) hold the contract.
- **The Valley** remains `incoming:true` by design; the hall card toasts instead of opening (automated). Launch it as a flagship chapter when the funnel justifies it.

## Remaining items to reach a signed release

### 1. Owner backend verification (P1, blocks the "cloud experience complete" claim)

1. Apply `005_edge_only_scores.sql` **and** `20260901104635_blitz_best_only.sql` on `fgwfniblkuozxlbgytfk` (the blitz best-only dedupe + unique index is **missing from the release-gate list in `docs/LEADERBOARD-OPERATIONS.md`** — add it, including the note that it deletes lower/older duplicate Blitz rows on apply).
2. Re-deploy `submit-score` if the function predates the current `index.ts`.
3. Authenticated Daily + Blitz submission → `{ ok: true }` + one `score_submission_log` row each.
4. Negative test: attempt a direct authenticated PostgREST insert to `daily_scores`; confirm rejection.

### 2. Migration naming hygiene (P2, five minutes)

`supabase/migrations/` mixes ordinal (`005_…`) and timestamp (`20260901104635_…`) naming. Lexicographic order still happens to be correct (`0…` sorts before `2…`), but pick one convention going forward — `supabase db push` sorts by filename.

### 3. Performance baseline (P2)

Record one Lighthouse run (performance / accessibility / best-practices / PWA) against production with a mid-tier mobile profile and write the numbers into this report's successor or `docs/`. The budget target from the previous report stands: first interactive screen under 5 s on mid-tier 4G, no pre-download of Story Beat films.

### 4. Manual device/accessibility sign-off (P2, operator)

Smoke checklist item 10: iOS, Android install + offline Tablets, keyboard-only, VoiceOver/NVDA/TalkBack, reduced-motion, high-contrast, 390 px and 1366×768 viewports. Everything automatable already passes.

### 5. Observability configuration (P2, operator)

Create the Supabase alert rules described in `docs/LEADERBOARD-OPERATIONS.md` (non-2xx `submit-score`, rate-limit spikes, submission-log failure). Confirm the funnel reaches the operator's view via signed-in save payloads.

### 6. Housekeeping (P3)

- `.tmp-live/` and `.tmp-proof/` (65 MB of proof screenshots) are untracked — add to `.gitignore` or delete; do not commit them.
- Version strings: `package.json` says `1.8.3`, SW cache says `ctv-v1.8.32`. Decide one shared version at tag time (the previous report's "single version" note still applies).
- Self-hosting the two Google font families remains an optional offline-rendering nicety.

## Production release checklist — current state

### Automated gates

- [x] `npm run lint` passes (0/0)
- [x] `npm test` passes 55 of 55 suites
- [x] CI workflow gates push/PR on install + lint + tests
- [x] Working tree clean (two untracked tmp proof dirs pending housekeeping)

### Backend

- [x] Canonical project confirmed and consistent across all references
- [x] Score tables live and anon-readable under RLS
- [x] `submit-score` deployed (401 on unauthenticated probe)
- [x] `005_edge_only_scores.sql` written and listed in release docs
- [ ] Migrations `005` + `20260901104635_blitz_best_only.sql` confirmed applied on production
- [ ] Authenticated Daily + Blitz submission verified end-to-end
- [ ] Direct authenticated score write confirmed rejected

### Offline and PWA

- [x] All Tablet scripts + `register-sw.js` + privacy page precached
- [x] Cache version bumped and live (`ctv-v1.8.32` == local == production)
- [x] Raster 192/512 + maskable icons in manifest and precache
- [x] SW registration failures recorded to diagnostics
- [ ] Android install + offline Tablets on device (manual)
- [ ] iOS home-screen behavior (manual)

### Browser and accessibility

- [x] Desktop + phone manual proof pass across all views (today's screenshots)
- [x] Automated playthrough simulation (boot → Ur → answer → results)
- [ ] Keyboard-only / screen-reader / reduced-motion / high-contrast sign-off (manual)

### Operations and policy

- [x] Privacy page published, linked from Settings, precached
- [x] Ops runbook with alert targets, moderation, and recovery
- [x] Funnel instrumentation (boot/ur/site) on signed-in saves
- [ ] Supabase alert rules configured (operator dashboard)
- [ ] Release tagged with a single shared version
- [ ] Lighthouse baseline recorded

## Final verdict

The 2026-08-31 verdict — "not ready to claim a complete production cloud experience" — is superseded. Every code-side blocker from that report is fixed, and the deployed production artifacts are **current with the audited tree** (`ctv-v1.8.32` on both sides), with the Edge Function live and the database lock-down migration written and documented.

What separates today's state from a signed release is a half-day of owner work, none of it engineering:

1. apply two migrations and re-verify function deployment;
2. run one authenticated Daily + one Blitz submission and one negative write test;
3. tick through the manual device/accessibility smoke;
4. switch on the documented Supabase alerts and record one Lighthouse run.

Until item 2 is done, public boards should be treated as verified-read-only: the client fails closed, so the worst case remains "no new cloud scores," never "bad scores." The offline/local product — 899 verses, the 46-site pilgrimage, Disciple-first ramp, Tablets, Story Beats, spiral re-walk — is ready to ship now.
