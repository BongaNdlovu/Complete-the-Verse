# Complete the Verse — Full Changes Report

**Project:** Complete the Verse  
**Repo:** https://github.com/BongaNdlovu/Complete-the-Verse  
**Production:** https://complete-the-verse.vercel.app/  
**Supabase project:** `eanjhcktflbpbjkdjtej`  
**Report date:** 2026-08-11  

This document summarises **all work done in this development arc**: game design, backend, security, UI/UX, Three.js sky, and recent gameplay polish. It includes both **pushed commits** and **local work not yet committed** at the time of writing.

---

## 1. Executive summary

The project went from a local static scripture game to a production-ready campaign with:

| Area | Outcome |
|------|---------|
| **Core mode** | Pilgrimage expanded (36 sites × 8 verses); Daily kept; other modes hidden |
| **Difficulty** | Watchman default, lean powers, journey-wide no-repeat, harder choices |
| **Backend** | Supabase Auth + cloud save + boards + ghosts + SQL migrations |
| **Hosting** | GitHub + Vercel; CSP headers; Auth redirects for production |
| **Audio** | Mix ducking; timer tick/heartbeat timing fixed |
| **Visuals** | Phase A Three.js living sky; unlock map ceremony |
| **Study / meta** | Heatmap, journal, insights, Blitz mode, leaderboards |
| **Quality** | 20 automated test suites (when local polish is included) |

---

## 2. Git history (pushed to `master`)

| Commit | Message | Theme |
|--------|---------|--------|
| `44f5703` | Baseline before Pilgrimage | Snapshot |
| `e8b93c0` | Add The Pilgrimage (29 sites) | Campaign |
| `09020db` | Optional Node dev server | Dev UX |
| `b42f200` | Pilgrimage teeth (set pieces, sky, Overdrive) | Gameplay |
| `1af3e61` | Verse bank expansion (`verses-more`) | Content |
| `e017098` | Harden Pilgrimage + Supabase cloud | Design + backend |
| `215fbf3` | Polish pass: Blitz, headers, boards, Study tools | Meta + security |

**Remote:** `origin/master` tracked at `https://github.com/BongaNdlovu/Complete-the-Verse.git`.

### Local (uncommitted at report time)

Work after `215fbf3` still in the working tree unless committed later:

- Three.js **Phase A** sky (`js/sky3d.js`, `vendor/three/`)
- Atlas cold-open fix + unlock ceremony
- Tricky MC choices + timer SFX fix
- `gameplay-polish.test.js`, `sky3d.test.js`, `package.json` / `three` dependency

---

## 3. Game design & Pilgrimage

### 3.1 Modes

| Mode | Status |
|------|--------|
| **The Pilgrimage** | Primary campaign (menu) |
| **Daily Trial** | Kept (menu) |
| **Scripture Blitz** | Added — 60s survival, +2s correct / −4s miss |
| Trial, Endless, Practice, Recall | Hidden from menu (code retained) |
| Pilgrim-recall, Relay | Hidden extras |

### 3.2 Pilgrimage expansion

| Before | After |
|--------|--------|
| 29 sites | **36 sites** |
| 6 verses / site | **8 verses / site** |
| No journey-wide exclude | **`usedIds`** — no verse reuse until road reset |
| Disciple default | **Watchman** default |
| Selah 1, Illum 2, Wind 1 | Road: **Selah 1, Illum 1, Wind 0** |

**New sites:** Penuel, Rephidim, Gilgal, Shiloh, Megiddo, The Jordan, Philippi  

**Late road:** mixed **typed recall** questions (more as you go east).

### 3.3 Unlock ceremony (local polish)

On **first clear** of a site that opens the next place:

1. Short results (~2.2s)  
2. Auto navigate to **atlas**  
3. Fly to newly unlocked site  
4. Marker **unlock burst** + rail flash + toast  

### 3.4 Multiple-choice difficulty

`buildChoices()` ranks distractors by **visual/structural similarity** (length, word count, shared words, “the … of …” patterns) so all four options look alike.

### 3.5 Timer / heartbeat audio

Strict windows:

| Seconds left | Sound |
|--------------|--------|
| 10–6 | Soft tick |
| 5–4 | Critical tick |
| 3–1 | Heartbeat only |
| Lock / pause / time-up | Pressure SFX **stopped** |

Removed mid-question “55% of timer” ticks that felt random.

---

## 4. Backend (Supabase)

### 4.1 Architecture

```
Browser (static game on Vercel)
  ├─ localStorage SAVE (always)
  └─ Supabase (optional, when signed in)
        ├─ profiles
        ├─ saves          (full SAVE JSON + revision)
        ├─ daily_scores
        ├─ blitz_scores
        └─ run_ghosts
```

### 4.2 Migrations

| File | Purpose |
|------|---------|
| `001_complete_the_verse.sql` | Tables, RLS, signup → profile + empty save, grants |
| `002_lock_trigger_functions.sql` | Revoke RPC execute on SECURITY DEFINER triggers |
| `003_score_constraints.sql` | Score/accuracy/duration CHECK ceilings |

**Applied on project:** migrations run successfully by project owner.

### 4.3 Client modules

| File | Role |
|------|------|
| `js/cloud-config.js` | Project URL + **anon** key |
| `js/cloud.js` | Auth (magic link), mergeSave, push/pull, boards, ghosts |
| `js/polish.js` | Score clamps, heatmap, blitz math, insights, shape score |

### 4.4 Behaviours

- **Guest play** always works offline  
- **Magic link** sign-in from Settings  
- **Debounced cloud push** after `persist()`  
- **mergeSave** on boot/sign-in (max scores, union seals/`usedIds`, per-site best)  
- **Optimistic revision lock** on push (`stale-revision`)  
- Daily first recorded run → `daily_scores`  
- Blitz end → `blitz_scores`  
- Optional Edge Function scaffold: `supabase/functions/submit-score/`  

### 4.5 Auth URL configuration (production)

| Field | Value |
|--------|--------|
| Site URL | `https://complete-the-verse.vercel.app` |
| Redirect URLs | Production `/**` + `http://localhost:8781/**` |

**Documented in:** `BACKEND.md`

---

## 5. Security

| Item | Status |
|------|--------|
| Anon key in client | Expected; RLS required |
| RLS: saves own-only | Yes |
| Boards/ghosts public read | Yes |
| Trigger functions not callable as RPC | Yes (migration 002) |
| Score CHECK constraints | Yes (migration 003) |
| Client score clamps | Yes (`Polish.clampDailyScore` / `clampBlitzScore`) |
| Display name sanitize | Yes |
| CSP + security headers | Yes (`vercel.json`) |
| Service role never in frontend | Yes |
| Client-trusted scores | Soft anti-cheat only (full server validation optional Edge Function) |

---

## 6. Performance

| Change | Detail |
|--------|--------|
| Music | `preload = "none"` — beds fetch only when played |
| Supabase SDK | Lazy-loaded only when cloud is configured/used |
| Mobile quality | Prefers balanced over high on coarse/small screens |
| Quiet mode | Caps music/SFX |
| Soundtrack size | Still large (~21MB) — re-encode not done |

---

## 7. UI / Study / Results

| Feature | Where |
|---------|--------|
| Cloud status chip | Menu |
| Offline banner | Global |
| Road progress line | Menu (“2 of 36 · next: …”) |
| Daily / Blitz boards | Results (if cloud configured) |
| Scroll of Insights | Results + Study card expand (book-level MVP) |
| 66-book mastery heatmap | Study Hall |
| Journey journal | Study Hall |
| Answer reveal toast | After wrong / time-up |
| Retry this site | Results (failed Pilgrimage) |
| Double-tap A–D / 1–4 to lock | Play |
| Quiet / high contrast / haptics | Settings |
| Ghost marker on progress | Play (local PB samples) |

---

## 8. Three.js Phase A — living sky

| Item | Detail |
|------|--------|
| Files | `js/sky3d.js`, `vendor/three/three.module.min.js` + `three.core.min.js` |
| Load | ES module + import map in `index.html` |
| Behaviour | Gradient vault, slow haze/dust, faint stars, palette per act |
| Integration | `Backdrop.palette()` / `Backdrop.syncSky()` |
| Off when | Quality = Efficient, or reduced motion |
| Visible on | Menu, brief, play, results, study, seals, records, settings |
| **Not visible on** | Atlas map (satellite covers full view) |
| Menu colour | **Warm gold / amber / yellow** (menu palette) |

**Bugs fixed along the way:**

1. Missing `three.core.min.js` → sky never loaded  
2. Thriller CSS opaque black layers covering canvas  
3. Atlas cold-open title stuck forever when skipped  

---

## 9. Audio mix (earlier pass)

- One music bed at a time  
- Duck bed under important SFX  
- Exclusive tick/heart instances  
- Calmer countdown layering (later refined to strict windows above)  

---

## 10. Hosting & tooling

| Piece | Choice |
|-------|--------|
| Source | GitHub |
| Production host | **Vercel** (`complete-the-verse.vercel.app`) |
| Optional | Cloudflare Workers service exists but Vercel is primary |
| Local preview | `node scripts/dev-server.js` → `http://localhost:8781` |
| npm | `three` installed for vendoring (`package.json`) |

---

## 11. Tests

Suite runner: `node test.js`

| Suite | Focus |
|-------|--------|
| content gate, verse-qa, verses-more | Bank quality |
| srs, recall | Review / typing |
| geo, pilgrimage, live, atlas, sites | Map & campaign |
| integration, game-structure, ui-structure | Wiring |
| soundtrack, sfx | Audio assets |
| cloud | mergeSave purity |
| polish | clamps, blitz math, heatmap, insights |
| improvements | Structure of security/UI/perf hooks |
| sky3d | Three wiring |
| gameplay-polish | Timer, choices, unlock ceremony |

**Latest full run:** all suites passed (20 when local polish tests are included).

---

## 12. Key files map

### New

```
BACKEND.md
js/cloud.js
js/cloud-config.js
js/polish.js
js/sky3d.js
js/verses-more.js          (earlier)
supabase/migrations/001_*.sql
supabase/migrations/002_*.sql
supabase/migrations/003_*.sql
supabase/functions/submit-score/index.ts
vendor/supabase/supabase.js
vendor/three/*
vercel.json
package.json / package-lock.json
*.test.js (cloud, polish, improvements, sky3d, gameplay-polish, verses-more)
```

### Heavily modified

```
js/game.js          — modes, audio, choices, results, settings, unlock flow
js/atlas.js         — cold open fix, celebrateUnlock
js/pilgrimage.js    — 8 verses, usedIds, markUsed
js/sites.js         — +7 sites, routes
css/game.css        — UI polish, sky visibility
css/atlas.css       — unlock animation, cold open
index.html          — hosts, import map, UI nodes
test.js             — suite registration
```

---

## 13. Player-facing flow (current)

1. **Main Hall** — Pilgrimage / Daily / Blitz; gold sky; cloud chip  
2. **Pilgrimage** — atlas; clear site → results → auto map unlock ceremony  
3. **Daily** — 20 shared verses; optional board on results  
4. **Blitz** — 60s survival; edge flare; board on results  
5. **Study Hall** — heatmap, journal, verse list + insight expand  
6. **Settings** — audio, quiet/contrast/haptics, cloud magic-link  

---

## 14. Known limitations / follow-ups

| Topic | Note |
|-------|------|
| Competitive integrity | Scores still client-submitted; Edge Function optional hardening |
| Insights | Book-level MVP, not full Hebrew/Greek per verse |
| Audio pack size | ~21MB beds; re-encode not done |
| Sky on atlas | Intentionally hidden under map |
| Admin role | Not implemented in-app (dashboard owner only) |
| Uncommitted local | Sky + unlock + timer/choices may still need commit/push |

---

## 15. How to verify quickly

```bash
# Tests
node test.js

# Local play
node scripts/dev-server.js
# → http://localhost:8781
```

| Check | Action |
|-------|--------|
| Sky | Main Hall, quality High/Balanced, reduced motion off |
| Unlock | Clear a Pilgrimage site first time → wait for map + burst |
| Choices | Play MC — options should look similar |
| Timer SFX | Last 10s: tick → 5–4 crit tick → 3–1 heart only |
| Cloud | Settings → magic link → name shows on chip |

---

## 16. Chronological work log (this arc)

1. Push full repo to empty GitHub remote  
2. Start/stop local dev server  
3. Fix competing audio  
4. Redesign Pilgrimage difficulty & expansion; hide non-Daily modes  
5. Design Mode C backend; scaffold Supabase; wire keys  
6. Fix SQL linter (SECURITY DEFINER execute)  
7. Security / performance / UI report → implement polish pass  
8. Deploy notes for Vercel; Auth URLs  
9. Commit `e017098` + `215fbf3`  
10. Install Three.js; Phase A living sky  
11. Fix stuck atlas title; fix missing `three.core`; brighten sky  
12. Unlock ceremony + tricky choices + timer SFX  
13. This full report  

---

*End of report.*
