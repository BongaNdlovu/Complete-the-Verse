# The Valley (Beat mode)

How David vs Goliath is wired today, and how to clone the same shape for another story.

Mode key: `beat`. Hall name: **The Valley**. Data file: `js/beat.js`. Runtime: `js/play.js` + `js/game.js` `startBeatStage`. Tests: `test/david-beat.test.js`, `test/exclusive-audio.test.js`.

A Beat is **not** a pilgrimage site. It is a self-contained twelve-question run with its own film, stills, VO, clock, and Hold rule. Word Tablets is a different mode. Do not share Tablets UI or a second `<video>` element.

---

## 1. Run loop

```
Hall "The Valley"
  → startRun("beat", …)
  → startBeatStage()
  → prologue.mp4  (or skip if reduced / low quality / Save-Data)
  → Q1 … Q5
  → cinema B  (five stills + VO/SFX, Heartbeat bed)
  → Q6 … Q12
  → results
       Held  + win.webp   if 12/12 and zero misses
       Scarred + loss.webp otherwise (including quit / timeout miss)
```

Cinema A still exists in `Beat.cinemaA` but **must not play**. The opening film replaced it. Cinema B still plays after question 5 (`R.beatQ === 5 && !R.beatBDone`).

Every Valley start plays the film. It is not a once-ever flag like Ur (`SAVE.set.urPrologueDone`).

---

## 2. Files that own the mode

| Job | File |
|---|---|
| Story data (questions, cinema plates, Hold, asset root) | `js/beat.js` |
| Film start, run object, `mode-beat` class | `js/game.js` (`startBeatStage`, `startRun`) |
| Cinema, questions, match/order/cloze/multi, clock | `js/play.js` |
| Held / Scarred copy, `beat-win` / `beat-loss` skin | `js/results.js` |
| Question bed + cinema B bed | `js/audio.js` `TRACKS` |
| Stills, film, VO, SFX | `assets/beats/goliath/` |
| Match grid + results stills | `css/play.css` |
| Hall card | `js/game.js` `MODES.beat`, `js/briefs.js` group "The Valley" |

Reuse `#ur-prologue` / `#ur-prologue-video` / `playStageFilm`. Do not add another video tag.

---

## 3. Asset folder contract

Put a new story in `assets/beats/<id>/` (example: `goliath`). `Beat.url(file)` prefixes `assets/beats/goliath/`. Filenames **must** match `/^[A-Za-z0-9._-]+$/` or `beatSky` will refuse the CSS `url()` (no path breakout).

Required pieces for this story:

| File | Role |
|---|---|
| `prologue.mp4` | Opening film. H.264 `yuv420p` + AAC, `+faststart`. Played via `playStageFilm`. |
| `01.jpeg` … `15.jpeg` | Cinema / question plates. Do not overwrite `15.jpeg` for a win still; it is Q11. |
| `question.jpeg` | Q1 plate. |
| `win.webp` / `loss.webp` | Results stills. `#v-results` has already dropped `mode-beat`, so CSS keys off `.beat-win` / `.beat-loss`. |
| `vo-*.mp3` | Spoken lines on cinema plates. Exclusive voice channel (`Snd.playVoice`). |
| `sfx-*.mp3` | Crowd, wind-shield, breath, thud. `Snd.playFile`. |

Encode a new film from the **original** master, not from a previous compress. Browser-safe flags:

```
ffmpeg -i MASTER.mp4 -vf "scale=1920:-2:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.1 -crf 20 -preset slow -c:a aac -b:a 128k -ac 2 -movflags +faststart assets/beats/<id>/prologue.mp4
```

Tests cap this file at 20MB. Ur and Team films stay under 2MB; they are different assets.

Music beds live in `audio/`, not in the beat folder:

| Track key | File | When |
|---|---|---|
| `fearOfTheDark` | `audio/fear-of-the-dark.mp3` | Live questions (`Beat.bed`) |
| `heartbeat` | `audio/heartbeat.mp3` | Cinema B only |

`Snd.ambience` is exclusive: one bed at a time. Voice ducks the bed. Cinema B starts Heartbeat after `stopBeds()`. Q6 then cues Fear of the Dark again.

Low quality, reduced motion, or Save-Data: `urPrologueAllowed()` is false, the film is skipped, Q1 starts immediately.

---

## 4. Cinema plates

A plate is:

```
{ still:"06.jpeg", vo:"vo-06-youth.mp3", sfx:"sfx-06-wind-shield.mp3", fx:"wind",
  line:"…caption…", sfxFirst: true }
```

- `still` — filename under the beat root.
- `vo` — optional. When it ends (or 8s duck window), the next plate starts.
- `sfx` — optional one-shot under the VO. `sfxFirst: true` plays SFX, then VO.
- `fx` — `wind` | `breath` | `run`. Body classes `beat-fx-*`. `run` is skipped during cinema (no shake on the film-like plates).
- `line` — `#voice-caption`. Empty string = no caption.

Click on `#v-play` skips the current plate (`beatAdvancePlate`). When the list is done, cinema class comes off and `nextBeatQuestion()` runs.

To add a mid-run cinema: after question N, set a flag like `R.beatBDone` and call `playBeatCinema(plates)`. One flag per insert so a retry of the next question does not replay the film.

---

## 5. Questions

`Beat.questions` is a fixed array of 12. `nextBeatQuestion` increments `R.beatQ` **after** reading the item, so cinema B checks `R.beatQ === 5` meaning “five answers already in.”

Each item becomes a fake verse via `beatToVerse` so the shared grader, timer, and results path can run. KJV reference is `item.r`. The stem is the on-screen title (`#verse`).

Clock: `Beat.CLOCK_MS` (40s). Powers are off. A miss does **not** take a lamp; it sets `R.beatMiss` and advances. Timeout is a miss.

**Hold:** `Beat.held(R)` is `correct === 12 && !beatMiss`. Any miss, quit, or timeout → Scarred.

### Kinds

**`pick`** — four `choices`, one `a`. Same path as a normal Hall pick (`pickAnswer` → `resolveAnswer`). Default single-tap locks immediately.

**`order`** — tap lines into sequence. Chips show `1 ·` … `n ·`. Lock stays disabled until all lines are chosen. Tap again to un-choose. Grade: joined strings equal `item.order`.

**`cloze`** — `blanks` in stem order, extra bait in `bank`. Tap fills the next blank; tap a filled chip to undo. Auto-resolves when `beatFilled.length === blanks.length`. Grade: `join("|")`.

**`multi`** — `items[]` with `{ id, t, on }`. Toggle any subset, then Lock kit. Grade: selected ids vs `Beat.multiKey(item)` (ids where `on: true`, sorted, comma-joined).

**`match`** — two (or more) rows, shared `scatter` of place-names. One pick per row. Lock both stays disabled until every row has a value. Grade: each `row.id` maps to that row’s `a`.

Q7 has six kit items. Play keys `1–9` / `a–i` so all six are reachable.

---

## 6. The Q12 match (1 Samuel 17:54)

The verse is: David brought Goliath’s **head to Jerusalem** and put the **armour in his tent**.

The screen is **not** “match any two labels.” It is two independent rows that share the same six places:

1. **Head of Goliath** → correct: `Jerusalem`
2. **Goliath's armour** → correct: `David's tent`

Distractors: Saul's house, Nob, the tabernacle, the valley of Elah.

The stem is the verse with two blanks so the job is readable without extra UI copy:

> And David took the head of the Philistine, and brought it to ______; but he put his armour in ______.

The how-line adds: `One place per row`. `Lock both` stays dim until both rows have a selection. A short map (one row empty) is ignored, not scored as a miss.

Implementation: `renderBeatMatch` writes `.beat-match-lab` (full grid row) then six `.ans` buttons with `data-row` + `data-val`. Click stores `R.beatMatch[rowId] = place` and highlights only that row. `confirmBeatAnswer` compares each row to `row.a`.

To write another match: two `rows` with distinct `id`s, a `scatter` that includes both answers plus bait, and a stem that names **what** is being placed.

---

## 7. Results

`go("results")` clears `mode-beat`. Skin is `#v-results.beat-win` or `.beat-loss` (`paintResultsSkin`). CSS paints `win.webp` / `loss.webp` on `:before` with a veil; copy sits in the upper third (`.scrollpad`). Kick text stays **Held** / **Scarred**. Retry is `startRun("beat", …)`.

A Hold also sets `SAVE.life.beatGoliathHeld`.

---

## 8. Clone checklist (another story)

1. New folder `assets/beats/<id>/` with film, plates, VO, SFX, win/loss stills.
2. Either generalize `js/beat.js` (root + questions + cinemas + `bed`) or add `js/<story>.js` and a `startXStage` next to `startBeatStage`. Do not fork `playStageFilm`.
3. Register a `MODES.<key>` card and a hall group in `briefs.js`.
4. Opening: `Snd.stopBeds()` then `playStageFilm(path, nextQuestion)`. Set `R.holdQuestionMusic` during the film.
5. Mid-run cinema: flag + `playBeatCinema(plates)`. For a cinema bed, `Snd.ambience("…")` after `stopBeds`, and add the file to `TRACKS` + `test/soundtrack.test.js`.
6. Questions: pick the kinds above. Keep stems as the verse (or a concrete ask), not abstract labels like “Match both destinations.”
7. Hold rule: all correct, zero misses, or define a new `held(run)`.
8. Results classes + stills. Remember `mode-*` is gone on the results view.
9. Tests: asset existence, film path, cinema does not steal the question bed forever, Hold math, each kind’s grade.
10. Do **not**: Three.js, a second video element, precache the film in `sw.js` (Ur/Team films are not precached either), overwrite a question plate to reuse it as a win still.

---

## 9. What this story’s twelve questions are

| # | Kind | Ref | Ask |
|---|---|---|---|
| 1 | pick | 17:1-2 | Where each army pitched |
| 2 | pick | 17:5-7 | Spear head weight |
| 3 | pick | 17:17-18 | Who gets the cheeses |
| 4 | order | 17:20-22 | David's morning |
| 5 | cloze | 17:28 | Eliab’s two charges |
| — | cinema B | 17:42-45 | Youth, breath, staves, flesh, the Name |
| 6 | pick | 17:37 | Lion and bear |
| 7 | multi | 17:40 | What David takes |
| 8 | pick | 17:43 | Who says “Am I a dog…” |
| 9 | pick | 17:45 | The Name |
| 10 | pick | 17:46 | Why the fight |
| 11 | pick | 17:50-51 | After the stone |
| 12 | match | 17:54 | Head to Jerusalem, armour to David's tent |
