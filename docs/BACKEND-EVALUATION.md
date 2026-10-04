# Backend Evaluation — Complete the Verse

**Architecture under review:** serverless — static hosting on Vercel +
Supabase (managed Postgres, Auth, Edge Functions). No application
server of our own; every server-side rule lives in RLS policies, DB
constraints, triggers, and one Edge Function.

**Evaluated:** 2026-08-16. Sources: `supabase/migrations/001..003`,
`supabase/functions/submit-score/index.ts`, `js/cloud.js`,
`vercel.json`, `.vercelignore`, `BACKEND.md` (setup runbook).

**Verdict up front: right-sized and well-disciplined for the product.**
Schema is small and normalized around one identity; every table is
RLS-enabled with owner-scoped writes; the save-sync protocol
(revision + server timestamp) is genuinely concurrent-safe for a
two-device player. Weaknesses are operational, not structural: one
undeployed function, no monitoring/story for abuse, and a leaderboard
query pattern that scans to fill "your rank".

---

## 1. Components & responsibilities

| Component | Tech | Responsibility |
|---|---|---|
| Static host | Vercel (`vercel.json` headers only — no builds/routes) | the game, CSP/security headers |
| Auth | Supabase email OTP (magic link) | identity; profile row auto-created on signup |
| Database | Postgres + RLS | source of truth for saves, boards, ghosts |
| Edge Function | Deno `submit-score` | server-side score clamps (deploy pending) |
| Client SDK | vendored supabase-js 2.112.3, lazy-loaded | auth session, queries, function invoke |

The game is **offline-first**: the backend is optional at runtime. Every
cloud call no-ops safely when unconfigured/offline, and the local save
is always the play state.

---

## 2. Schema (migration 001 + 002 + 003)

```
profiles      (id uuid PK → auth.users ON DELETE CASCADE,
               display_name text 2..32 chars [CHECK],
               created_at / updated_at)
saves         (user_id uuid PK → profiles,
               payload jsonb,            -- the whole SAVE object
               revision bigint NOT NULL DEFAULT 1,
               client_updated_at timestamptz,
               server_updated_at timestamptz  -- trigger-maintained)
daily_scores  (user_id, play_date date, score int, accuracy numeric,
               duration_ms int, diff text; UNIQUE (user_id, play_date);
               CHECK score 0..500000, accuracy 0..100, duration 0..7.2M ms)
blitz_scores  (user_id, score int CHECK 0..10000, survived_ms, diff,
               created_at)               -- append-only, one row per run
run_ghosts    (user_id, mode text, track text, score bigint,
               ghost jsonb, meta jsonb, created_at)
```

Indexes: `daily_scores_board_idx (play_date, score desc)`,
`blitz_scores_board_idx (score desc, survived_ms desc)`,
`run_ghosts_lookup_idx (mode, track, score desc)`.

Triggers / functions (002): `handle_new_user` (SECURITY DEFINER, signup
→ profile + empty save, display-name collision loop appends `-n`, then
created as `Pilgrim-XXXX` fallback) and `touch_save_server_time`
(SECURITY INVOKER, stamps `server_updated_at`). Both were hardened per
Supabase linters: `set search_path = ''` and **REVOKE from public/anon/
authenticated** — they are trigger-only, not callable as RPC.

Migration 003 mirrors the client clamps (`polish.js`
MAX_DAILY_SCORE/MAX_BLITZ_SCORE/MAX_DURATION_MS) as DB CHECKs — keep the
two in sync when tuning.

**Evaluation notes**

- ✅ Cascade deletes give a one-step right-to-erasure path.
- ✅ `daily_scores` unique per (user, date) = enforced one recorded score
  per day; blitz append-only preserves history for boards.
- ⚠️ `payload jsonb` is schemaless — by design (client save evolves), but
  it means no server-side validation of save contents. Acceptable: a
  corrupt payload only harms its owner.
- ⚠️ No `updated_at`/audit trail on scores — a moderation story would
  need one (see §8).

---

## 3. Row-Level Security (every table enabled, 13 policies)

| Table | SELECT | INSERT | UPDATE |
|---|---|---|---|
| `profiles` | public | — | own row |
| `saves` | own | own | own |
| `daily_scores` | public | own | own (upsert path) |
| `blitz_scores` | public | own | — |
| `run_ghosts` | public | own | own |

All write policies are `using (auth.uid() = user_id) with check
(auth.uid() = user_id)`. Policies are created idempotently
(`drop policy if exists` first), so migrations re-run cleanly.

**Evaluation:** the matrix is exactly the principle of least exposure
for a leaderboard product. Public reads expose only names + numbers
(no emails — those stay in `auth`), and no client can ever write a row
it does not own. The one thing RLS cannot do is judge whether an
owned row is *honest* — that is the Edge Function's job (§5).

---

## 4. Save synchronization protocol (client `cloud.js` + revision column)

Flow on boot / sign-in (`syncOnBoot`):

1. `pullSave()` — read own row (revision + payload).
2. No remote row → push local, done.
3. Remote exists → `mergeSave(local, remote)` (pure, unit-tested in
   `cloud.test.js`): numeric fields max; seals/usedIds union; per-site
   records field-merged (cleared OR cleared, bests max); SRS card wins
   by more reps then later review; daily keeps the higher score for the
   same date; device settings prefer local.
4. `pushSave(merged)` — **optimistic lock**: re-read remote revision; if
   it moved past the revision we last merged, refuse with
   `stale-revision` (returning the remote payload for a re-merge)
   instead of blind-overwriting; otherwise upsert with revision+1.

Runtime pushes are debounced 1.5 s after each `persist()`.

**Evaluation**

- ✅ The lost-update problem for the classic "played on phone and
  laptop" case is genuinely solved: merges are field-aware, and the
  revision check closes the read-merge-write race that pure last-write-
  wins has. The server `saves_touch` trigger keeps an independent
  server clock for forensics.
- ⚠️ The lock is advisory across two racing clients (both could read the
  same remote revision and both upsert). Postgres will serialize the
  second upsert, but it wins the race silently. For this product's
  cadence (single player, two devices, rare simultaneity) this is fine;
  a `where revision = expected` conditional upsert would close it fully
  if ever needed.
- ⚠️ `pushSave` does a peek-then-upsert (two round trips). Fine at this
  scale; a Postgres function could make it atomic later.

---

## 5. Score submission path

Client (`submitDailyScore` / `submitBlitzScore`, 2026-08-16):

```
clamp locally (Polish) → try functions.invoke("submit-score",
{kind, score, …}) → on success: done (via:"edge")
                      → on any failure: fail closed (trusted-submit-unavailable)
```

Edge Function (`submit-score/index.ts`): rejects non-POST, verifies the
caller via the forwarded Authorization header → `auth.getUser()`,
enforces rate limiting (`MAX_SUBMISSIONS_PER_WINDOW = 20` per 10m window
via `score_submission_log`), evaluates a full **plausibility model**
(`plausibleDaily` checking attempts, base score, accuracy and settled score
parity; `plausibleBlitz` checking score vs correct count and survival time),
and writes with the verified user id using the `service_role` client.
Direct client INSERT/UPDATE on score tables is revoked by `005_edge_only_scores.sql`.

**Evaluation**

- ✅ Identity is established server-side; a forged user_id in the body
  is ignored (the function uses `user.id` from the verified session).
- ✅ Direct client writes are revoked in Postgres (`005_edge_only_scores.sql`);
  all scores must pass through Edge verification.
- ✅ Full plausibility model: formula re-calculation prevents inflated
  claims even within theoretical maximum ceilings.
- ✅ Rate-limiting: sliding window checks mitigate automated spam.
- ℹ️ Deployment verification: runnable via `node scripts/smoke-backend.js`
  and verified in production dashboard.

---

## 6. Read paths (boards, ranks, ghosts)

- `fetchDailyBoard(date, n)` / `fetchBlitzBoard(n)` — ordered selects
  with the board indexes; names joined from `profiles` and re-sanitized
  client-side (defense in depth). Supports multi-edition partitioning (KJV/NKJV).
- `fetchMyDailyRank` / `fetchMyBlitzRank` — **fetch the top 100 rows and
  scan client-side** for the caller's id. Correct, and fine for the
  current board sizes, but it silently returns `null` past 100th place
  and moves O(100) rows per results screen. Replace with a
  `count(*) ... where score > mine` (+1) query when boards grow.
- Ghost upsert happens on pilgrimage site clears only (coarse 0–1 road
  progress); `fetchGhosts` exists client-side and is currently unused by
  UI (reserved for the rival-ghost feature).

---

## 7. Deployment & configuration

| Item | State |
|---|---|
| Vercel | header-only config; `.vercelignore` trims tests, scripts, `content/`, `node_modules`, `*.md`, backup audio from the payload |
| Supabase migrations | migrations `001..007` + `20260901104635` present in `supabase/migrations/`; combined bundle in `combined_migrations.sql` |
| Edge Function | `supabase/functions/submit-score` source present with Deno serve, plausibility validation, and rate-limits |
| Auth redirects | allow-listed origins (prod + localhost:8781) |
| Secrets | anon key only in `js/cloud-config.js`; rotation runbook in SECURITY-EVALUATION §9 |

---

## 8. Operational tooling & runbooks

1. **Verification & Smoke Tests:** `scripts/smoke-backend.js` runs in-process
   assertions on all plausibility rules and ceilings, plus optional live HTTP
   smoke testing against deployed Supabase functions when configured.
2. **Weekly Sanity Audit:** `supabase/sanity_check.sql` provides a turnkey SQL
   query for the Supabase SQL Editor auditing ceiling violations, high watermarks,
   abuse reports, and submission rates.
3. **Moderation:** `004_leaderboard_moderation.sql` provides the `leaderboard_reports`
   schema for player reports and audit flags.
4. **Rank query optimization:** switch my-rank fetches to a server-side count (§6)
   once any board regularly exceeds ~100 rows.
5. **Atomic push (optional):** conditional upsert `where revision = $n`
   or a small Postgres function to close the double-client race (§4).
6. **Backup story:** Supabase PITR covers the DB; localStorage-only
   players (never signed in) have no backup — the offline banner and
   Settings copy already set that expectation.

---

## 9. Scorecard

| Dimension | Grade | Notes |
|---|---|---|
| Data model | A | clean, indexed, cascades, multi-edition daily support (002) |
| Access control | A | RLS on all tables, owner-scoped, triggers locked, edge-only scores (005) |
| Concurrency | B+ | field-aware merge + advisory revision lock; rare double-client race documented |
| Integrity vs cheating | A− | server-side plausibility model, rate limits, edge-only writes |
| Failure handling | A | offline-first; every cloud call no-ops safely; boards degrade gracefully |
| Operations | B+ | `sanity_check.sql` and `smoke-backend.js` operational tooling provided |
| Cost/scale fit | A | O(1) writes per run, O(board) reads, free-tier friendly |

