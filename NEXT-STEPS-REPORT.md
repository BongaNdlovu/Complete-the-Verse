# Complete the Verse — Next Steps & Assets Report

**Date:** 2026-08-16
**Build:** `index.html` · production `https://complete-the-verse.vercel.app/`
**Verification this session:** `node test.js` → **all 26 suites passed** (incl. new `excitement.test.js`); `node --check` clean on every edited file.

This documents (1) what the "action & excitement" pass just shipped, (2) the features that remain, and (3) the game assets still needed. It supersedes the excitement plan in `EXCITEMENT-REPORT.md` for the items now done.

---

## 1. What just shipped (the excitement pass)

| # | Change | Where | Test |
|---|---|---|---|
| M1 | Correct answers chain at **420–520 ms** (was 1450 ms dead air); misses keep the long teach pause | `js/game.js` `correctAdvance()` | `excitement.test.js` |
| M5 | **Overdrive is now a choice** — "Ride the fire" (double pay, a miss costs 2 lamps) vs "Bank the streak" (cash out, reset ×1). Timer stops while the choice is up; 9 s auto-bank prevents deadlock; Enter rides, B/Esc banks | `js/game.js` + `#overdrive-choice` in `index.html` + CSS | ✓ |
| M7 | **Miniboss** — a fast 6-verse "Narrow Gate" spike at each arc's midpoint site (Bethel, Kadesh, Megiddo, Damascus-road), distinct from the six place-finales | `js/game.js` `SetPieces` + `js/pilgrimage.js` `midbossSite()` | ✓ |
| M8 | **Speed round** — one 3-second "Swift" question in every site body, "Swift Lock" label + gold ring state | `js/game.js` + `js/pilgrimage.js` `speedSlot()` | ✓ |
| M10 | **Mixed barrage** — Kingdom & Gospel arcs drop a typed recall mid-site, not just the closing pair | `js/game.js` + `js/pilgrimage.js` `mixedTypedSlot()` | ✓ |
| M11 | **Relic armor** — a recovered relic absorbs the first miss at a site (streak still resets, the lamp holds) | `js/game.js` `loseLife()` | ✓ |
| — | **Payload trim** — new `.vercelignore` (drops `node_modules/`, `audio/_orig_backup/`, tests, reports from the Vercel deploy); `.gitignore` now ignores `audio/_orig_backup/` | `.vercelignore`, `.gitignore` | — |

M2/M3/M4 (combo audio escalation, lamp-shatter, Overdrive entrance) were already implemented in the current tree — the momentum meter, `.break`/`.overdrive`/`.momentum-*` CSS, and the "One life remains" voice all existed before this pass and were left intact.

**Evidence of no breakage:** all 25 pre-existing suites still pass *plus* the new suite, and `node --check` passes on `game.js`, `pilgrimage.js`, `polish.js`. The browser smoke test could not run this session (the local `browser-use` CLI is broken — missing `pydantic_core`), so a manual `node scripts/dev-server.js` → localhost:8781 play-through is the recommended next check.

---

## 2. Features still needed (in priority order)

### P0 — bugs the player hits first (from the earlier honesty report, still open)

1. **Typed-finale inheritance** — the last two verses of a site set `R.typed`, and that flag is not cleared before Sinai/Nineveh/Golgotha set pieces launch, so those "Rapid/Lockdown/No-Chance" finales render as typed on a 6–8.5 s clock. (`SetPieces.maybeLaunchSite` now clears it for midbosses; the six finale sites still need the same guard.)
2. **First-run / keyboard launch hidden modes** — tutorial "Start the Drill" and Enter-on-menu still open hidden Trial/Practice.
3. **Watchman is still the default** difficulty; the road has no difficulty picker on the site brief.
4. **Daily records death/abandon as the one shot** — a mis-tap locks the day.
5. **`usedIds` burns on a zero-answer quit** — backing out of a brief still spends the site's verses.

### P1 — product honesty

6. **Review loop is hidden** — SRS is live, Study Hall lists due verses, but there is no "Review N due" button; the Drill that would serve them is off the menu.
7. **Unreachable seals** — five Trial seals + one Endless seal have no public path. Retarget them to road goals.
8. **Relay** is a whole-arc shared-life run behind a 6-letter "Walk it" control — easy to start by accident.
9. **~33 duplicate references** between core and extra packs can show the same verse twice in a run.
10. **Client-trusted leaderboards** — Daily/Blitz write straight from the browser; the Edge Function exists and is unused.

### P2 — depth & feel

11. **M6 — personify the clock as a pursuer.** The pressure tiering exists (`pressure-3/5/7`); give it a face that gains ground on hesitation. The single biggest remaining "action" lever.
12. **M9 — rival ghosts.** `fetchGhosts` exists and is unused; seed a "previous pilgrim" rival. Needs server-trusted scores first (see #10).
13. **Content depth** — lift signature books (Genesis, Exodus, Joshua, Luke, Acts, Psalms) to 12–16 blanks each; clear the 219-verse quarantine queue worst-books-first; lift remaining single-word blanks to phrases.
14. **Insights** are a 10-book stub — write the other 56 books as short cards or rename the panel "Book note."
15. **Accessibility** — pause is not a dialog, no focus trap, `user-select:none` on `body` hurts Study Hall, the "select then lock" hint is hidden on mobile.
16. **Store presence** — no favicon, no `og:` tags, no description meta, no PWA, no README.
17. **`qualityLocked`** is read but never written, so phones can't keep Cinematic.

### Later (only after the above)

- Friends / weekly boards / real rival ghosts.
- Bring **The Trial** back as a late unlock ("The Hall of Acts") once seals exist for it — or delete it.
- Split `game.js` along the seams that already exist (Director, SetPieces, Study, Results).
- Other translations (NIV/ESV) as a **separate licensed bank**, never mixed with KJV IDs.
- Monetization (cosmetics only: extra skins, no paywalled verses).

---

## 3. Gaming assets still needed

| Asset | Why | State today |
|---|---|---|
| **2 new mission-voice clips** | The new Overdrive choice ("Overdrive. Ride the fire, or bank it.") and the miniboss ("The road narrows. Six verses. Half time.") have no mp3 in `audio/voice/`, so they fall back to device TTS. Record them in the same baritone as the existing 24 clips and add entries to `VOICE_FILES`. | Missing — falls back to `speechSynthesis` |
| **Favicon + `og:image` + social card** | Share links and the browser tab show nothing. A 512×512 seal/candle glyph + a 1200×630 card in the same biblical-thriller palette. | None (no favicon, no `og:` tags) |
| **PWA icon set + manifest** | "Add to Home Screen" needs 192/512 icons and a `manifest.webmanifest`. | None |
| **Music-bed re-encode** | `audio/*.mp3` beds total ~15.6 MB. Re-encode to ~96–128 kbps AAC/Opus to roughly halve the first-load weight. | Beds are 2.1–2.8 MB each |
| **Pursuer / rival-ghost sprite** | Needed when M6/M9 are built: a single dark figure (or closing light) for the Chaser, and a ghost token for rival runs. | None |
| **Per-arc music colour** | `act3` is reused for Kingdom; a dedicated Kingdom bed would give all four arcs distinct colours (flagged in the earlier plan). | Reuses `act3` |

The 24 existing voice clips, 7 music beds, 8 SFX, 14 scholar portraits, 6 host portraits, traveler idle/walk sprites, and 36 relic art pieces are all present and wired.

---

## 4. How to verify this pass

```bash
node test.js              # 26 suites, all green
node scripts/dev-server.js # then open http://localhost:8781
```

Play through and check, by hand:

1. **Chain** six correct answers — they should snap forward with no dead air; a miss should pause.
2. **Reach streak 12** — the game should *stop* and ask "Ride the fire / Bank the streak." Ride, then miss on purpose → two lamps lost.
3. **Clear a midboss site** (Bethel/Kadesh/Megiddo/Damascus-road) — the "Narrow Gate" 6-verse spike fires as the site finale.
4. **Play any site** — one question is a 3-second "Swift" round; in Kingdom/Gospel arcs a typed recall appears mid-site.
5. **Hold a relic, then miss on the road** — the first miss is absorbed ("Relic shield").
6. Confirm `node test.js` is still green (regression guard).

---

*End of report.*
