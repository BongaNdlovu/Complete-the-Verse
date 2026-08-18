# Complete the Verse — Improvement & Go-Forward Report

**Date:** 2026-08-12  
**Playable build:** `index.html` · production `https://complete-the-verse.vercel.app/`  
**Verification this session:** `node test.js` → **all 23 suites passed** · bank **423 verses / 66 books / 27 passages** · **36 sites**

This is an inspection of the game as it actually plays today, not a recap of older reports. Several of those (`GAME-STATE-REPORT.md`, `BACKEND.md`, `TODAY-CHANGES-REPORT.md`) are stale.

---

## Verdict

The game already has a real identity: a KJV pilgrimage from Ur to Patmos, with a working map, a clean content gate, offline play, optional cloud, and a look that matches the material.

It is **not yet a finished product**. The hall says one game (Pilgrimage + Daily + Blitz). The code, tutorial, default difficulty, seals, and keyboard shortcuts still belong to an older game (The Trial + The Drill). The memory system is real and then hidden. The campaign shape is complete; many stops still feel like the same eight-verse loop.

**Do not add new modes, new sites, or monetization until the hall, the first hour, and the review loop match the game you already built.**

---

## What the game is now

| Surface | Reality |
|---|---|
| Public modes | **The Pilgrimage**, **Daily Trial**, **Scripture Blitz** |
| Hidden but fully coded | Trial, Endless, The Drill, Recall, Relay, Pilgrim’s Recall |
| Campaign | 36 sites · 4 arcs · 8 verses each · last 3 typed · 288 verse-plays if you never fail |
| Bank | 423 playable (196 core + 109 extra + 118 more) · Job thinnest (5) · Psalms fattest (22) |
| Quarantine | 219 famous verses still unplayable (blanks/distractors failed the gate) |
| Meta | 8 free scholars · 6 Bible skins · 36 relics · 28 seals · SM-2 SRS · Study Hall |
| Cloud | Magic-link, save merge, Daily/Blitz boards, ghost table (local PB only on screen) |
| Tests | 23 Node suites — structure, bank QA, pure logic. No browser E2E |

---

## What is already strong — keep it

1. **Content gate.** `scripts/verse-qa.js` is the right standard. Do not go back to generated distractors.
2. **Stable verse IDs** and save migration. Adding verses no longer corrupts mastery.
3. **Atlas + live fallbacks.** Weather/sky never break play. Map works without tiles.
4. **Recall grader.** Distinguishes typo / modernisation / wrong word. That is the teaching tool.
5. **Pilgrimage rules as a module.** `pilgrimage.js` is pure and tested. Keep new campaign logic there, not in `game.js`.
6. **Offline-first cloud.** Local write always wins. That contract is correct.
7. **Tone.** Biblical-thriller, KJV, place dossiers, relic reveals. Do not restyle this into a generic quiz.

---

## The core problem

The product is a **road**. The scaffolding is still a **trial**.

Evidence:

- Default difficulty is **Watchman** (2 lives, 0.72× clock). Copy still says “most runs end in Act II.”
- Enter / Space on the Main Hall opens the **hidden Trial**.
- First-run CTA is **Start the Drill**, which opens a **hidden** mode. Tutorial still sells Drill and Recall.
- Menu hint prints “N due for review” with **no button** that starts a review.
- SRS grades every answer, then `usedIds` makes those verses disappear from the road forever.
- Five Trial seals and one Endless seal are listed in Relics-adjacent Seals with **no public way to earn them**.

A new player can hit Watchman, a two-life site, typed questions, and a tutorial that does not describe the map. That is how people quit.

---

## Ranked problems

### P0 — Broken or unfair in the game you already ship

**1. Set-piece finales inherit typed mode**  
The last three verses of a site set `R.typed = true`. That flag is never cleared when Sinai / Nineveh / Golgotha launch. Rapid Recall, Book Lockdown, and No Second Chances then render as **typed** on a **6–8.5s** set-piece clock instead of multiple-choice. Designed auto-lock never fires.

*Where:* `js/game.js` ~1887–1891, 2145, 825.

**2. First-run and keyboard launch hidden modes**  
Tutorial “Start the Drill” → hidden Practice. Enter on menu → hidden Trial.

*Where:* `js/game.js` 3903, 3923 · `index.html` 426–435.

**3. Watchman is the default, and the road has no difficulty picker**  
Daily/Blitz get a brief. The site card only *displays* lives/clock from `SAVE.set.diff`. New players walk Ur on 2 lives, no Second Wind, last-3 typed at 14.4s.

*Where:* `js/game.js` 93, 296–297, 1409–1422.

**4. `usedIds` burn on a zero-answer quit**  
Draw is committed in `startRun`. Backing out after the brief still spends that site’s verses for the whole journey.

*Where:* `js/game.js` 1640–1644, 3856–3867.

**5. Daily records death and abandon as the one shot**  
First finish of the calendar day writes the score — complete, death, or abandon. A mis-tap locks the day.

*Where:* `js/game.js` 3133–3136.

**6. Blitz HUD draws 99 hearts**  
Blitz uses fake lives (`lives: 99`) so the life row paints ninety-nine SVGs.

*Where:* `js/game.js` 1685, 2629–2636.

### P1 — Product honesty (the hall vs the systems)

**7. The review loop is dead for the main player**  
SRS is live. Study Hall lists due verses. The Drill that would serve them is hidden. `usedIds` means the road will not show them again. Memory training is the name of the game and has no public surface after tutorial skip.

**8. Seals and Records still belong to The Trial**  
Unshaken (act), The Watchman (Act V), No Crutch, Nothing Lost, Final Witness, Iron Sharpeneth, Long Obedience (Endless 40). Players chase badges they cannot reach.

**9. Relay is a major mode behind a 6-letter button**  
“Walk it” on the atlas rail starts a whole-arc shared-life run, zeros site bests, skips typed questions and set pieces, and is easy to start by accident.

**10. Duplicate references (~33) between core and extra**  
`verses-more.js` forbids reuse. Extra does not. Same verse, different blank, can appear twice in a run. Player reads that as a bug.

**11. Site books are too thin for the binding you advertise**  
Most signature books have ~6 verses; a stop wants 4 from the first book and 8 total. Genesis is first book on all seven Patriarch sites. Acts is first on five church stops. The resolver already widens to “the whole bank.” Late road will feel less like the place.

**219 quarantine verses** include lines printed on dossiers (Luke 24:32 Emmaus, Revelation 21:1 Patmos, 1 Corinthians 13:13 Corinth) that you cannot actually play.

**12. Client-trusted leaderboards**  
Daily/Blitz write straight from the browser. The Edge Function exists and is unused. Fine for friends; not fine if you present them as competitive.

**13. Mission voice is still device TTS**  
21 authored lines. Browser speech is the current implementation. ElevenLabs files are the right next audio step (list already specified).

### P2 — Feel, payload, shipping hygiene

**14. Relics and scholars do not change play**  
36 illustrated artifacts unlock on first clear and then sit in a cabinet. Characters are portraits/tokens only.

**15. Insights are a 10-book stub**  
Genesis, Exodus, Psalms, Isaiah, Matthew, John, Romans, Revelation, Acts, Hebrews. Everything else gets “See traditional attribution.”

**16. Payload is heavy for a static quiz**  
~15.6 MB live beds + ~22.5 MB `audio/_orig_backup/` (should not ship) + inlined WebP plates in `game.css` + Three.js on every load even when quality will turn the sky off + full `node_modules/three` if that folder is the Vercel root.

**17. No store presence**  
No favicon, no `og:` tags, no description meta, no PWA, no README. Share cards and “Add to Home Screen” have nothing to show.

**18. Accessibility gaps**  
Pause is not a dialog. No focus trap. `user-select: none` on `body` hurts Study Hall. Mobile hides `.warn` (the “select then lock” hint). `qualityLocked` is read but never written, so phones cannot keep Cinematic.

**19. `game.js` is 3,922 lines**  
Modes, audio, HUD, results, study, settings, pilgrimage wiring, set pieces, and first-run all live in one file. Further features will keep colliding. Split only after P0/P1 — not as a vanity refactor.

**20. Docs lie**  
`GAME-STATE-REPORT` still says 505 verses and Practice on the menu. `BACKEND.md` still says Blitz is not shipped. `TODAY-CHANGES-REPORT` still says `verses-more.js` is unwired.

---

## What should be done — in this order

### Phase A — Make the first hour honest (1–2 working days)

Do these before anything new.

| # | Change | Done when |
|---|---|---|
| A1 | Default difficulty → **Disciple**. Put Pilgrim / Disciple / Watchman on the **site brief** and in Settings. Rewrite Watchman copy so it is not “Act II.” | New save starts Disciple. Road can change difficulty without opening Daily. |
| A2 | Rewrite tutorial for **the map**: one phrase gone → lock → last three typed → Selah / Illuminate. Primary CTA: **Walk to Ur**. Remove Drill/Recall language. | First-run never mentions hidden modes. |
| A3 | Enter / Space on the hall focuses the first public mode (or opens the atlas). Never Trial. | Keyboard cannot start hidden Trial. |
| A4 | Clear `R.typed` when a set piece launches. Rapid / Lockdown / No Chance stay multiple-choice. | Sinai/Nineveh/Golgotha play as designed. |
| A5 | Do not `markUsed` until the first locked answer (or roll back on 0-attempt abandon). | Quitting a brief does not spend the site. |
| A6 | Daily records **only** `reason === "complete"`. Brief must say this is the one counted run. | A death or abandon is practice, not the day. |
| A7 | Blitz: hide the heart row; the clock is the life. | No 99-heart HUD. |
| A8 | Align Blitz local best and cloud board (both **verses kept**, or both points). Pick one and label it. | Results number matches the board. |

Add tests that **fail** if Enter-on-menu opens Trial, if tutorial opens Practice, and if `R.typed` is still true after `SetPieces.launch`.

### Phase B — Give memory a door (2–3 days)

The SRS work is already paid for. Expose it.

| # | Change | Done when |
|---|---|---|
| B1 | Study Hall: **Review N due** button → The Drill (keep Drill off the hall if you want a quiet menu). | Due count is clickable. |
| B2 | After a site: if any of today’s misses are now due, offer **Review these** from results. | Failures re-enter the loop the same day. |
| B3 | Hide or retarget Trial/Endless seals. Add seals that match the road: all relics, all skins, perfect site, whole-road perfect. | Every seal on the wall is earnable from public play. |
| B4 | Relay: rename, bigger warning, do not start from a 6-letter control next to “Walk it again.” | Accidental arc-runs stop. |
| B5 | Dedup extra-pack references (same `r` cannot appear twice in one run). | Daily/Pilgrimage never show the same verse twice. |
| B6 | Wire the 21 ElevenLabs lines in place of `speechSynthesis`. Same filenames as the voice brief. | Mission voice is one recorded baritone. |

### Phase C — Make the road feel like the places (ongoing content)

This is the long game. Author into `js/verses-more.js` only.

**Order of verses to write (not “add random books”):**

1. Dossier quotes that are still in quarantine: Luke 24:32, Revelation 21:1, 1 Corinthians 13:13, Luke 2:11, John 6:35.
2. Signature books to **12–16 phrase blanks** each: Genesis, Exodus, Joshua, Luke, Acts, Psalms.
3. Rest of the 219-open queue, worst books first (Luke, Hebrews, Ephesians, Acts).
4. Lift remaining **single-word** blanks in `verses.js` to phrases. Ur should not be a vocabulary quiz while Patmos is a memory test.

**Then, and only then:**

- Site-specific passages (Jericho is not Psalm 23).
- One extra set piece at Ur, Jerusalem, Susa — not a set piece at every stop.
- Bind orphan books (Job, Ruth, Proverbs, James…) onto existing sites so `books66` can happen on the road.
- Paul / Mary / Jonah / Daniel skins. Bind Esther to Susa or Kingdom-complete, not “18 sites” (that is Emmaus).
- Relic **sets** (one small bonus per arc when all relics in that arc are held) + a 36/36 seal.
- Use `act3` music on Kingdom so the four arcs have four colours.

**Do not add Red Sea / Athens / Malta until the bank can fill the 36 sites you already have.**

### Phase D — Ship like a product (in parallel with C, after A)

| # | Change |
|---|---|
| D1 | `.vercelignore`: `node_modules/`, `audio/_orig_backup/`, local reports if they must not ship. |
| D2 | Extract inlined CSS WebP to `assets/`. Re-encode beds to ~128 kbps AAC/Opus. Lazy-load Three.js only when quality is High/Balanced. |
| D3 | Favicon, `og:image`, description, short README. PWA later if people ask to install. |
| D4 | Label Daily/Blitz boards “honor system” **or** deploy `submit-score` and stop client upserts. |
| D5 | Insights: write the other 56 books as short cards, or rename the panel “Book note.” |
| D6 | A11y: pause as dialog, focus trap, allow select in Study Hall, keep the lock hint on phones. |
| D7 | Fix `qualityLocked` (honor the player’s Cinematic choice). |
| D8 | Archive or stamp old reports so the next pass does not re-implement finished work. |

### Later — only if Phase A–C are done

- Friends / weekly boards / real rival ghosts (`fetchGhosts` exists and is unused).
- Bring **The Trial** back as a late unlock (“The Hall of Acts”) once seals exist for it — or delete the mode.
- Split `game.js` along the seams that already exist (Director, SetPieces, Study, Results).
- Other Bible translations (NIV/ESV) as a **separate licensed bank**, never mixed with KJV IDs.
- Monetization (Paddle is connected in the agent environment, **not** in the game). Cosmetics only: extra skins, no paywalled verses.

---

## What not to do

- Do not generate another verse pack with `build-verse-extra.js`. The last generated bank was 6.5% usable.
- Do not add a seventh public mode. Three is already the right hall.
- Do not spend a week on sky / Three.js / more weather. Live sky is cosmetic and finished enough.
- Do not “clean up” `game.js` as a first task. Fix the typed-finale and first-run bugs first.
- Do not treat 23 green suites as playtests. They never opened a browser.
- Do not ship `audio/_orig_backup`.

---

## Suggested sequence for the next three sessions

1. **Session 1 — Phase A.** Default Disciple, tutorial, Enter key, typed-finale reset, usedIds, Daily record, Blitz hearts. Tests for the three regressions. Play Ur → Haran on a phone.
2. **Session 2 — Phase B.** Review-due CTA, seal retarget, Relay warning, reference dedup, ElevenLabs hookup if the files are ready.
3. **Session 3 — start Phase C.** Re-author the five dossier verses + deepen Genesis and Acts. Play Patriarchs and the first church stops and listen for “this is the same verse again.”

After that, the game you already designed is the one on the screen.

---

## Snapshot numbers (2026-08-12)

| Item | Count |
|---|---|
| Playable verses | 423 |
| Tiers 1→5 | 21 / 53 / 102 / 131 / 116 |
| Duplicate references (core+extra) | 33 |
| Quarantine still open | 219 |
| Passages | 27 |
| Sites / arcs / relics | 36 / 4 / 36 |
| Scholars / Bible skins | 8 / 6 |
| Seals | 28 (several unreachable from the hall) |
| Public modes | 3 |
| Hidden modes still in code | 6 |
| `game.js` | 3,922 lines |
| Live soundtrack | ~15.6 MB (plus ~22.5 MB unused backup) |
| Mission-voice lines to record | 21 |
| Test suites | 23, all passing |

---

*End of report.*
