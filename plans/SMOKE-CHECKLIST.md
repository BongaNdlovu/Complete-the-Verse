# Manual smoke checklist

CI already runs `npm run lint` and `npm test` (54 suites). `test/playthrough-simulation.test.js` is the automated boot → Ur → answer → results path. Device, offline, and install checks stay manual.

Use `npm start` → `http://localhost:8781` or the production URL. Hard-refresh (Ctrl+F5) after media or service-worker changes.

## Automated already covered

- Bank counts: 899 verses, 66 books, 46 sites, 46 relics.
- Mode start/finish for Pilgrimage, Daily, Blitz, Trial, Endless, Drill, Recall, Team, Tablets, tutorial lessons.
- Trusted submit-score client path (fail closed; no Honor/direct fallback).
- Incoming Valley hall card does not open a brief.

## Manual sign-off

1. **First session.** Incognito. Boot should reach Ur without intro, six-lesson tutorial, profile, or hall. Answer one verse.
2. **Return.** Reload. Atlas (or hall if the road has not started) — not the intro film.
3. **Corrupt save.** In DevTools, set `ctv_save_v3` to `{`. Reload. Recovery state appears; Continue starts a fresh record; backup key `ctv_save_v3_broken` exists.
4. **Hall.** Pilgrimage leads. Today / Practice / Challenges are quieter. Valley is Incoming and toasts instead of opening.
5. **Difficulty.** New save is Disciple (3 lamps). Settings and the site brief can switch to Watchman.
6. **Daily / Blitz boards.** Signed-in submit hits `/functions/v1/submit-score` and returns `{ ok: true }`. A failed function writes no public row. UI does not say Honor system.
7. **Offline PWA.** Install, go offline, reload, open Word Tablets. Icons are 192 and 512 PNG.
8. **Privacy.** Settings cloud block links to `privacy.html`.
9. **Relics.** Reliquary shows `0 of 46` on a fresh save.
10. **iOS / Android / keyboard / VoiceOver.** Operator sign-off; not automated.

## Remaining owner steps

- Apply migrations `001`–`005` on project `fgwfniblkuozxlbgytfk`.
- `supabase functions deploy submit-score --project-ref fgwfniblkuozxlbgytfk`
- Auth redirect URLs for production and `http://localhost:8781/**`.
- Watch Edge Function logs after deploy.
