# Clocks, powers, and Fade gifts

**Date:** 2026-08-26  
**Commands this session:** `node test.js` · `node test/clocks-powers.test.js` · `node scripts/live-browser-verification.js`

## 1. Outcome

Pilgrimage, relay, daily, practice, recall, pilgrim-recall, and tutorial now use exact wall clocks: **30s** pick/cloze/duel/passage-ref/true-false/speed, **45s** assembled recall (and Recall / pilgrim-recall), **60s** Fade memorize and rebuild. Trial and Blitz keep paced / survival clocks. Selah and Illuminate sit in a reserved play footer on every mechanic. Fade rebuild gifts **2–3** locked correct words. Automated gate: **all 51 suites passed**. Live Chrome: **79 / 79**, zero runtime exceptions.

A Fade-to-typed leak (`R.currentMechanic` still `"fade"` when the next verse’s duration was measured) armed Assembled Recall at 60s in Chrome. `nextQuestion()` now clears mechanic/fade state before `questionDuration()`, and `wallClockMs()` ignores a stale fade flag on a typed non-fade verse. After that fix, live Chrome measured verse 7 at 45s.

## 2. Changes executed

| Area | Fix | Evidence |
|---|---|---|
| Powerbar | `#powers` is a reserved footer outside `.question-body`; body scrolls | `index.html`, `css/play.css`; `clocks-powers` “question-body” / “reserved footer” |
| Duplicate powers | Assemble template no longer injects `.typed-pwr` | `js/typed.js`; clocks-powers + live “no duplicate .typed-pwr” |
| Wall clocks | `WALL_PICK_MS=30000`, `WALL_TYPED_MS=45000`, `WALL_FADE_MS=60000`; `usesWallClock` / `wallClockMs` | `js/play.js`; `test/clocks-powers.test.js` (29 contracts) |
| Fade leak | Clear mechanic before duration; typed non-fade does not keep 60s | `js/play.js` `nextQuestion` / `wallClockMs`; clocks-powers “typed verse after fade…” |
| Labels | Hall / site brief print 30/45/60, not paced site clocks | `js/polish.js` `describeModeClock`, `js/briefs.js` `siteBriefClockLabel`; `test/fixes.test.js` |
| Fade gifts | `Assemble.giftLocked`; locked slots cannot unplace/place | `js/assemble.js`, `js/typed.js`, `css/game.css`; `test/assemble.test.js` |
| Live checks | Powerbar geometry, 30/45/60, gifts, mobile 390×844 | `scripts/live-browser-verification.js` |

## 3. Accuracy benchmarks

| Contract | Target | Measured command | Result |
|---|---|---|---|
| Picker clock | `R.tTotal === 30000` | `node test/clocks-powers.test.js` | pass (`questionDuration()` / `R.tTotal` 30000 on Ur picker) |
| Late-road picker | same 30000, no ramp | clocks-powers “late-road picker matches Ur at 30s” | pass |
| Assembled Recall | 45000 | clocks-powers + live “Assembled recall wall clock is 45s” | pass (live `tTotal=45000`) |
| Recall mode | 45000 | clocks-powers “recall mode is 45s”; integration “recall gets a longer clock than the drill” | pass |
| Practice | 30000 | clocks-powers “practice is 30s” | pass |
| Fade memorize + reconstruct | 60000 | clocks-powers; live Fade `tTotal=60000`, bar `60s` | pass |
| Trial clock | not flattened to 30000 | clocks-powers “trial is not flattened to 30s”; excitement “trial keeps the paced act clock” | pass |
| Blitz clock | remaining survival / 60s label | `Polish.describeModeClock("blitz")` → `"60s"`; excitement still asserts survival path | pass (not wall-flattened) |
| Fade gifts | 2–3 locked correct tiles; phrase assemble ungifted | `node test/assemble.test.js`; live locked count in 2–3 | pass |
| Powerbar occupancy | Selah + Illuminate `data-pw` | clocks-powers picker/cloze; live on choice, passage-ref, cloze, duel, fade, typed | pass |
| Powerbar geometry desktop | fully inside `#v-play` at 1920×1080 | live-browser verses 1, 3–7 | pass |
| Powerbar geometry phone | fully inside `#v-play` at 390×844 | live “Mobile verse 1 choice” + `18_mobile_powerbar_choice.png` | pass |
| Duplicate typed powers | 0 `.typed-pwr` | clocks-powers + live on every checked mechanic | pass |
| Full automated gate | 0 failed suites | `node test.js` | **all 51 suites passed** |
| Live Chrome gate | 0 failed checks | `node scripts/live-browser-verification.js` | **79 / 79** |
| Runtime exceptions | 0 | live “Zero runtime JavaScript exceptions” | pass |

Live screenshots (Chrome CDP): `05_play_verse1_multiple_choice.png`, `07_play_verse4_scribe_cloze.png`, `08_play_verse5_scripture_duel.png`, `09_play_verse6_fade_7s.png`, `09b_play_verse6_fade_reconstruct.png`, `10_play_verse7_assembled_recall.png`, `18_mobile_powerbar_choice.png`.

## 4. Scoring accuracy

Fade gifts do not auto-complete the verse: `giftLocked` places 2–3 tiles; remaining slots stay empty until the player fills them. Grading is still `confirmTyped` → `Recall.grade` (`js/typed.js`). Locked unplace is a no-op (`Assemble.unplace` returns the same tile; assemble “locked gifts cannot be unplaced”) and does not call `resolveAnswer`. Phrase assemble (`Assemble.build`) has no `locked` map. Illuminate on Fade still costs one Illuminate and only hints the next **empty** slot (`illuminateAssembly` uses `placed.findIndex` of empty — gifted slots are already filled, so they are skipped).

## 5. Out of scope / still open

- Trial and Blitz clocks are unchanged (paced act clock; Blitz survival).
- Speed slots keep `speed-round` presentation but use the 30s wall clock.
- Quarantine / famous-verse re-author is not this pass.
- HUD default in `index.html` is `00:30` (no 14s flash).
