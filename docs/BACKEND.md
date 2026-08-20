# Backend — Complete the Verse (Supabase)

**Org:** https://supabase.com/dashboard/org/ceftinnoxfczhbrcfjzq  
**Project:** https://supabase.com/dashboard/project/eanjhcktflbpbjkdjtej  
**Production (Vercel):** https://complete-the-verse.vercel.app/  

**Mode C:** cross-device save + Daily/Blitz leaderboards + async ghosts.

The game stays playable fully offline. Cloud is optional sync + social.

### Auth redirect URLs (required)

In Supabase → Authentication → URL configuration:

| Field | Value |
|--------|--------|
| Site URL | `https://complete-the-verse.vercel.app` |
| Redirect URLs | `https://complete-the-verse.vercel.app/**` and `http://localhost:8781/**` |

### Score constraints (migration 003)

Run `supabase/migrations/003_score_constraints.sql` in the SQL Editor if not already applied (score/accuracy ceilings).

---

## What was added in this repo

| Path | Role |
|------|------|
| `supabase/migrations/001_complete_the_verse.sql` | Tables, RLS, signup → profile trigger |
| `js/cloud-config.js` | Project URL + anon key (you fill these in) |
| `js/cloud.js` | Auth, `mergeSave`, push/pull, scores, ghosts |
| Settings → **Cloud account** | Magic-link sign-in, display name, Sync now |

---

## One-time setup (your org)

### 1. Create a project

1. Open the org dashboard.  
2. **New project** (any name, e.g. `complete-the-verse`).  
3. Wait until the project is healthy.

### 2. Apply the schema

1. Project → **SQL Editor** → New query.  
2. Paste the full contents of  
   `supabase/migrations/001_complete_the_verse.sql`  
3. **Run**.

### 3. Enable Auth

1. **Authentication → Providers**.  
2. Enable **Email** (magic link).  
3. (Optional) Enable Google later.  
4. **Authentication → URL configuration**  
   - Site URL: your game origin (e.g. `http://localhost:8781` while testing).  
   - Redirect URLs: same origin (and production URL when you deploy).

### 4. Wire keys into the game

1. **Project Settings → API**.  
2. Copy:
   - **Project URL**
   - **anon public** key  
3. Paste into `js/cloud-config.js`:

```js
var CLOUD_CONFIG = {
  url: "https://YOUR_REF.supabase.co",
  anonKey: "eyJhbGciOi..."
};
```

Do **not** put the **service_role** key in the client.

### 5. Test

```bash
node scripts/dev-server.js
```

1. Open the game → **Settings**.  
2. Enter email → **Send link**.  
3. Open the email, complete sign-in.  
4. Confirm Settings shows your display name.  
5. Play / clear a site → progress should reappear after a refresh on another browser (same account).

---

## Data model (short)

- `profiles` — display name  
- `saves` — full `SAVE` JSON + `revision`  
- `daily_scores` — one row per user per day  
- `blitz_scores` — Blitz runs (mode not shipped yet; table ready)  
- `run_ghosts` — timeline samples for async rivals  

RLS: saves = own only; boards/ghosts = public read, own write.

---

## Client behaviour

1. Every `persist()` writes **localStorage** first.  
2. If signed in, a **debounced push** (~1.5s) upserts `saves`.  
3. On boot / sign-in, `Cloud.syncOnBoot` **merges** remote + local (`mergeSave`) then pushes.  
4. First recorded **Daily** of the day also upserts `daily_scores`.  
5. Cleared Pilgrimage sites can publish a coarse **ghost** on `run_ghosts`.

`mergeSave` rules (tested in `cloud.test.js`): max of scores/XP, union of seals/`usedIds`, per-site best progress, SRS prefers higher `reps`.

---

## What I cannot do from this agent session

There is **no Supabase access token** in the environment, so this agent cannot create the project or run SQL on your org for you. After you paste URL + anon key, the client is ready.

If you paste those two values here (anon key is public with RLS), the config file can be filled in for you. Never share **service_role**.

---

## Server-trusted scores (deploy once)

`supabase/functions/submit-score/index.ts` re-clamps scores, rate-limits submissions, and writes under the caller's own auth. The client (`js/cloud.js`) **requires this Edge Function** for every Daily/Blitz submit and fails closed if it is unreachable, so untrusted browser writes cannot enter the boards. Deploy to enable trusted submissions:

```bash
supabase functions deploy submit-score --project-ref eanjhcktflbpbjkdjtej
```

After deploying, watch the Network tab: submissions should go to `/functions/v1/submit-score`.

---

## Later (optional)

- Friend-only ghosts  
- Weekly Blitz board  
- Google OAuth  
- Production Site URL + redirect allowlist  
