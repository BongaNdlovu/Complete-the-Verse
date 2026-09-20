# Backend — Complete the Verse (Supabase)

**Org:** https://supabase.com/dashboard/org/ceftinnoxfczhbrcfjzq  
**Project:** https://supabase.com/dashboard/project/fgwfniblkuozxlbgytfk  
**Production (Vercel):** https://complete-the-verse.vercel.app/  

**Mode C:** cross-device save + Daily/Blitz leaderboards + async ghosts.

http(s) builds require a session before Hall. Offline play continues after a session is stored on the device. `file://` stays guest so the disk-open path still works.

Canonical client project ref: `fgwfniblkuozxlbgytfk` — the same value as `js/cloud-config.js`. Do not apply migrations or deploy functions to a different project.

### Auth redirect URLs (required)

In Supabase → Authentication → URL configuration:

| Field | Value |
|--------|--------|
| Site URL | `https://complete-the-verse.vercel.app` |
| Redirect URLs | `https://complete-the-verse.vercel.app/**`, `http://localhost:8781/**`, and `completetheverse://**` |

### Play Console (account required)

Honest declaration: **sign-in is required to sync one save and post Blitz.** Guests cannot start a new run. A local `ctv_save_v3` already on the device still merges after they sign in. Offline play works only after a session has been stored on that device.

Suggested listing line (replaces “guests keep local bests”):

> Sign in with Google or email to keep one pilgrimage and appear on Blitz. Progress already on this device merges into your account.

### Score constraints (migration 003)

Run `supabase/migrations/003_score_constraints.sql` in the SQL Editor if not already applied (score/accuracy ceilings).

---

## What was added in this repo

| Path | Role |
|------|------|
| `supabase/migrations/001_complete_the_verse.sql` | Tables, RLS, signup → profile trigger |
| `js/cloud-config.js` | Project URL + anon key (you fill these in) |
| `js/cloud.js` | Auth, `mergeSave`, push/pull, scores, ghosts |
| Sign-in door + Settings | Google OAuth, email OTP, display name, Sync now. `Cloud.signInWithIdToken` is the hook for a native Google ID token. |

---

## One-time setup (your org)

### 1. Create a project

1. Open the org dashboard.  
2. **New project** (any name, e.g. `complete-the-verse`).  
3. Wait until the project is healthy.

### 2. Apply the schema

1. Project → **SQL Editor** → New query.  
2. Paste the full contents of each file in `supabase/migrations/` in order (`001` through `005`). 
3. **Run**.

### 3. Enable Auth

1. **Authentication → Providers**.  
2. Enable **Email** (OTP / magic link).  
3. Enable **Google**. Create a Google Cloud OAuth client. Add the Android package `app.completetheverse.twa` and this keystore SHA-256: `85:EB:F6:93:7D:23:74:30:7F:C1:E8:24:64:61:7C:CE:69:DA:A0:90:B8:62:16:3A:F7:62:71:66:A5:11:DE:AF`.  
4. **Authentication → URL configuration**  
   - Site URL: `https://complete-the-verse.vercel.app`  
   - Redirect URLs: `https://complete-the-verse.vercel.app/**`, `http://localhost:8781/**`, `completetheverse://**`.

The Play app is a Trusted Web Activity, so Google sign-in is the same `signInWithOAuth({ provider: "google" })` path as the PWA. A future native shell can call `window.CtvNativeAuth.signInWithGoogleIdToken(idToken)` after Credential Manager.

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
- `blitz_scores` — Scripture Blitz runs (shipped)  
- `run_ghosts` — timeline samples for async rivals  

RLS: saves = own only; boards = public read; score inserts and updates are service-role only via `submit-score`. Ghosts = public read, own write. Friend-race create/join UI is out of the production promise.

---

## Client behaviour

1. Every `persist()` writes **localStorage** first.  
2. If signed in, a **debounced push** (~1.5s) upserts `saves`.  
3. On boot / sign-in, `Cloud.syncOnBoot` **merges** remote + local (`mergeSave`) then pushes.  
4. First recorded **Daily** of the day invokes `submit-score`. Direct table writes from the browser are not used.  
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
supabase functions deploy submit-score --project-ref fgwfniblkuozxlbgytfk
```

After deploying, watch the Network tab: submissions should go to `/functions/v1/submit-score`.

---

## Later (optional)

- Friend-only ghosts  
- Weekly Blitz board  
