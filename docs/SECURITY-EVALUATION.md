# Security Evaluation — Complete the Verse

**Scope:** client (`index.html`, `js/*`), static hosting (Vercel),
backend (Supabase: Postgres + Auth + Edge Functions), content pipeline.
**Evaluated:** 2026-08-16, against the tree that passes all 28 test
suites (including the `fixes` suite).
**Overall posture: sound for a client-side game with optional social
features. One open item (Edge Function deployment) and a short list of
accepted-by-design risks.**

Companion: `docs/BACKEND-EVALUATION.md` (schema/RLS detail),
`docs/DEVELOPER-GUIDE.md` (architecture).

---

## 1. Assets & trust boundaries

The game is a static page. Everything below runs in the player's
browser; the server holds only identity, saves, scores and ghosts.

```
┌── Browser (fully trusted with UX, NEVER with truth) ──────────────┐
│  game state · localStorage save · clocks · score computation      │
│  supabase-js (anon key) ──── HTTPS ───► Supabase                  │
│      │                                 ├─ Auth (email OTP)        │
│      │                                 ├─ Postgres + RLS  ← truth │
│      │                                 └─ Edge Function submit-score
│  Leaflet ──► OpenStreetMap / ArcGIS tiles (img/GET only)          │
│  live.js ──► api.open-meteo.com (GET only, no keys)               │
└────────────────────────────────────────────────────────────────────┘
```

Design principles observed in the code:

1. **The client is untrusted for anything shared.** Local progress can
   be tampered with freely — it only cheats yourself. Anything that
   other players see (boards, ghosts) is written under server-side
   identity (RLS `auth.uid()`), never accepts a user_id from the payload
   in the trusted path, and is ceiling-clamped server-side once the Edge
   Function is deployed.
2. **No secrets in the client.** The only key in the repo is the
   Supabase **anon** key (`js/cloud-config.js`), which is public by
   design and protected by RLS. Verified: no `service_role`, no private
   key, no token beyond the anon JWT anywhere in the tree.
3. **CSP matches reality.** `connect-src` lists exactly the four remote
   hosts the code actually calls (`*.supabase.co`, `api.open-meteo.com`,
   `*.arcgisonline.com`, `tile.openstreetmap.org`) — verified by grep
   against the source. No inline scripts exist, so `script-src 'self'`
   holds; `object-src 'none'`, `base-uri 'self'` etc. are set.

---

## 2. Authentication & authorization

- **Mechanism:** Supabase email magic link (OTP). No passwords exist.
  `detectSessionInUrl` completes the link hand-off; sessions persist and
  auto-refresh (`cloud.js` client options).
- **Redirect surface:** magic-link redirects are configured in the
  Supabase dashboard to the production origin and localhost (BACKEND.md).
  `emailRedirectTo` is built from `location.href.split("#")[0]` — an
  open-redirect via the URL is not possible because Supabase only
  redirects to allow-listed URLs.
- **Authorization:** entirely RLS (see BACKEND-EVALUATION §3). Summary:
  - `saves` — owner read/write only.
  - `profiles` — public read (display names), self-update.
  - `daily_scores` / `blitz_scores` — public read, owner insert/upsert.
  - `run_ghosts` — public read, owner write.
- **Identity in writes:** the RLS policies stamp `auth.uid()`; the
  client sends its user_id too, but a forged id simply fails the policy.

---

## 3. Injection surfaces — reviewed

| Surface | Protection | Where |
|---|---|---|
| Any HTML built from data | `esc()` (HTML-entity escape) at every interpolation — study list, boards, relics, settings, callouts, dossier | `js/game.js`, `js/atlas.js` |
| Cloud display names on boards | `Polish.sanitizeDisplayName` strips tags + `<>&"'` + length 2–32 before store AND before render | `js/polish.js`, `js/cloud.js` |
| Player's own name | `maxlength=32`, trimmed, min 2 chars; rendered via textContent/esc | profile flow |
| URL / session | no URL ever reaches innerHTML; magic-link hash consumed by SDK | — |
| SQL | parameterized by supabase-js / PostgREST; Edge Function uses the SDK, no string SQL | `supabase/functions/submit-score/index.ts` |
| localStorage save | parsed with try/catch; corrupt saves fall back to defaults — untrusted input by definition, never executed | `load()` |

Grep-verified during the 2026-08-16 audit: no `eval`, no `Function(`
constructor use, no `innerHTML` with unescaped interpolation found in
the renderers reviewed.

---

## 4. Client-trusted values (accepted risks)

| Value | Risk | Mitigation / status |
|---|---|---|
| localStorage progress | player can inflate their own XP/seals | by design — no economic value; boards unaffected |
| Score *computation* | runs in browser | Edge Function clamps ceilings server-side (§5); DB CHECK constraints (migration 003) reject negatives/over-ceiling rows |
| Score *submission* | client could post any under-ceiling value | **Edge-first submit shipped 2026-08-16** (`functions.invoke("submit-score")` with direct-write fallback). Until the function is deployed, boards remain client-trusted below the ceilings — see the open item |
| Ghost timelines | coarse 0–1 progress curves, no impact on scores | cosmetic; accepted |
| Clock/timer | inspectable & pausable | single-player fairness only; pausing hides the tab (auto-pause on `visibilitychange`) |

A determined cheater with the anon key can always insert rows as
themselves (e.g. via the REST endpoint directly) — the Edge Function
reduces but cannot eliminate this for under-ceiling values. Full
server-authoritative scoring would require replaying runs server-side;
out of scope for this product stage and documented as such.

---

## 5. Open item — deploy `submit-score`

State: the function exists (`supabase/functions/submit-score/index.ts`),
validates method + auth + ceilings, and the client calls it first
(pinned by `fixes.test.js` / `improvements.test.js`). It is **not yet
deployed** (no Supabase access token in dev environments). Until
deployed:

- submissions fall back to direct RLS writes (still identity-scoped),
- CHECK constraints in migration 003 remain the last line of defense.

Deploy command and verification steps: `BACKEND.md` § "Server-trusted
scores".

---

## 6. Headers & transport

`vercel.json` (all routes):

- `Content-Security-Policy` — `default-src 'self'`; `script-src 'self'`;
  `style-src 'self' 'unsafe-inline'` (fonts/CSS vars only — no inline
  scripts exist); `img-src 'self' https: data:` (map tiles);
  `media-src 'self' blob:`; `connect-src` exact host allow-list;
  `object-src 'none'`; `base-uri 'self'`; `frame-ancestors 'none'`.
- `X-Frame-Options: DENY` — clickjacking / tab-nabbing.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — the
  game requests none of them; haptics uses the vibrate API which is not
  permission-gated.
- Transport: HTTPS everywhere in production (Vercel + Supabase +
  tile/weather hosts). The game also runs from `file://` offline, where
  these headers don't apply but no remote content is loaded.

---

## 7. Privacy

- Personal data: **email** (auth) and **display name** (self-chosen).
  No analytics, no trackers, no cookies beyond Supabase's auth storage.
- Progress lives in the browser's localStorage until the player signs
  in; sync payload is the same JSON (`saves.payload`), scoped by RLS.
- Third parties see only: Supabase (auth + data), Open-Meteo (weather by
  site coords — no user identifier), OSM/ArcGIS (tile requests by map
  viewport — standard Leaflet traffic).
- Right-to-erasure path: delete the Supabase user (cascades per
  migration 001 FKs) + clear localStorage.

---

## 8. Threat model summary (STRIDE-lite)

| Threat | Vector | Status |
|---|---|---|
| Spoofed identity on boards | forged user_id | blocked by RLS `auth.uid()` policies |
| Tampered scores | client posts arbitrary values | ceilings clamped (edge once deployed; DB CHECKs now); under-ceiling forging remains possible (accepted, §4) |
| XSS via display name / verse text | boards, study list | sanitized + escaped at all render sites reviewed |
| CSRF on writes | PostgREST with SDK token | not cookie-based; auth header per request — no classic CSRF surface |
| Clickjacking | iframe embedding | `X-Frame-Options: DENY` + `frame-ancestors 'none'` |
| Cross-user data access | save/board reads | RLS owner-only for `saves`; boards expose only names+scores by design |
| Key leakage | anon key in repo | public by design; rotate if abused (see §9) |
| Supply chain | vendored Leaflet 1.9.4 / supabase-js 2.112.3 | pinned local copies, no CDN; the `three` dependency was removed entirely (2026-08-16) |
| DoS of Supabase | aggressive client loops | PostgREST rate limits at the platform; game makes O(1) calls per run |
| Session theft | token in localStorage (SDK default) | standard supabase-js posture; no refresh-token exposure in code |

---

## 9. Audit checklist (re-run before each release)

```bash
# 1. No service key / secret material:
grep -rniE "service_role|service key|BEGIN (RSA|EC|OPENSSH)" --include="*" . |
  grep -v node_modules | grep -v _orig_backup

# 2. CSP hosts still match the code's remote calls:
grep -oE "https?://[a-z0-9.*-]+" js/*.js | sort -u        # code side
grep -A2 "connect-src" vercel.json                        # policy side

# 3. Every new innerHTML interpolation goes through esc()/text:
#    review diff of js/game.js js/atlas.js for `innerHTML =` lines.

# 4. New remote endpoint added? → vercel.json CSP + this document.

# 5. Full suite green (includes fixes.test.js security pins):
node test.js

# 6. Rotation runbook (if the anon key leaks or is abused):
#    Supabase → Settings → API → rotate anon key → update js/cloud-config.js
#    → redeploy. RLS is unaffected; old key dies immediately.
```

---

## 10. Findings register (this evaluation)

| # | Finding | Severity | Status |
|---|---|---|---|
| S1 | Scores written client-side only; edge function unused | Medium | **Fixed 2026-08-16** — edge-first submission with fallback; deploy pending (§5) |
| S2 | Anon JWT in repo | Info | by design, RLS-backed, rotation runbook §9 |
| S3 | Under-ceiling score forgery remains possible even with edge | Low | accepted (§4); full server replay out of scope |
| S4 | `style-src 'unsafe-inline'` | Info | styles only; zero inline scripts exist |
| S5 | `three` npm dependency shipped unused supply-chain surface | Low | **Fixed** — dependency and vendor copy removed |
| S6 | Local save tampering | Info | accepted by design; no shared impact |
