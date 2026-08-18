# Competing Features Evaluation — Complete the Verse

**Date:** 2026-08-16
**Trigger:** "There are too many competing features when I get the answer wrong."
**Action taken:** Removed the single least-needed feature — the floating `answer-reveal` panel.
**Test state:** `node --check` clean, `node test.js` **27/27 suites pass**.

---

## 1. What was removed and why

### Removed: the floating `.answer-reveal` panel (least needed)

On every multiple-choice miss **and** every timeout, two elements were simultaneously
showing the correct answer:

1. **The in-verse blank scar** (`markBlankScar`) — the blank itself turns into a
   struck-through wrong word with the correct word sitting right in the verse,
   exactly where the eye already is.
2. **The answer-reveal panel** — a fixed-position box sliding up at `bottom:18%`,
   showing the reference + answer text again, **floating over the answer area**
   (z-index 40, right where the options live).

They carried **identical information at the same moment** — a textbook competing pair.
The panel was the least-needed of the two because:

| Criterion | Blank scar | answer-reveal panel |
|---|---|---|
| Unique information | none lost — shows struck wrong word **and** correct answer | duplicate only |
| Where the eye is | inside the verse, inline | detached, floats over the buttons |
| Competes with other UI | no | overlays the answer zone |
| Per-mode role | all MC + timeout paths | same two paths, nothing else |

Typed answers were unaffected: they already teach through `renderTypedVerdict`
("Not this one. → the verse reads …" with the word-level diff), which was never
paired with the panel.

### Edits (all verified)

- `js/game.js` — removed `showAnswerReveal()` function + its 2 call sites
  (MC miss and timeout paths).
- `index.html` — removed `<div class="answer-reveal" id="answer-reveal">`.
- `css/game.css` — removed the 3 `.answer-reveal` rules.
- `improvements.test.js` — flipped the 2 assertions to negative
  (`!answer-reveal`, `!showAnswerReveal`) so a regression is caught.

---

## 2. The wrong-answer moment, fully inventoried

What fired on **one** multiple-choice miss (before this removal):

| # | Channel | What it does | Verdict |
|---|---|---|---|
| 1 | `Snd.wrong()` | wrong SFX (ducks the music) | keep — primary audio signal |
| 2 | `Director.impact("wrong")` → `body.wrong-impact` | `.stage` `signalBreak` filter/translate, 0.72 s | keep — smoothed, calm |
| 3 | `Director.impact("wrong")` → `beat("wrong")` | `body.fx-wrong` grain/ember tweak, 0.64 s | near-invisible; candidate |
| 4 | `Director.impact("wrong")` → `showJudgeBurst("down")` | full-screen judge sprite, 0.88 s | keep — signature asset |
| 5 | `doFlash("red")` | red vignette flash, 0.7 s | keep |
| 6 | `shakeUI(true)` | `#v-play` shake 420 ms | keep (has a setting toggle) |
| 7 | `Backdrop.hit("wrong")` | `#backdrop.jolt` animation, 0.55 s | **effectively invisible** — see §4 |
| 8 | `Polish.haptic("wrong")` | vibration | keep (has a setting toggle) |
| 9 | `markBlankScar` | inline strike-through + correct word | keep — the teaching |
| 10 | ~~`showAnswerReveal`~~ | ~~floating duplicate answer box, 2.2 s~~ | **REMOVED** |
| 11 | `witnessLook(true)` | witness avatar darkens/tilts | keep — small, narrative |
| 12 | `loseLife` → lamp break | `.hrt.lamp.break` 0.7 s in HUD | keep — stakes |
| 13 | `Director.momentum(false)` | momentum meter drop | keep — stakes |
| 14 | `Director.speak("One life remains.")` | voice at 1 life left | keep |

That is **14 simultaneous channels** — 5 screen-level animations (4, 5, 6, 7 + the
stage break), 2 audio, 1 haptic, 2 answer displays, and 3 state/HUD reactions.
The answer displays were the only *redundant* pair; the rest is layered noise.

### Competing pairs inside the wrong-answer stack

- **Red flash + judge burst + shake + signalBreak + backdrop jolt** — five
  whole-screen reactions at once. The backdrop jolt is the weakest (see §4).
- **SFX + voice + haptic** — three channels; acceptable, but the shield event
  below makes it four.
- **Scar + answer-reveal** — *removed.* One answer display remains.
- **Red wrong stack, then gold flash + power SFX on a relic shield** — a shielded
  miss plays the full red "wrong" stack and then immediately `doFlash("gold")` +
  `Snd.power()` + callout + toast. Red-then-gold reads as contradictory feedback.
  Flagged, not changed.

---

## 3. Whole-game competing-feature clusters

### 3.1 Correct-answer moment (~11 channels)
`Snd.correct` + `Backdrop.hit("correct")` **(no-op — see §4)** + `doFlash("gold")`
+ haptic + `Director.impact("correct")` (goldShock + fx-correct + judge burst "up")
+ `popScore` (floating +N) + `animateScore` (HUD count-up) + `setMult` +
`Director.momentum(true)` + streak callouts (×5 / ×10) + seal toasts.

- `popScore` and `animateScore` both animate the score at the same time — two
  competing displays of the same number. Conventional, but the floating pop is the
  weaker of the two.
- Streak callouts + seal toasts + goldShock can co-fire on milestone answers.

### 3.2 Relic shield on a miss (4 channels for one event)
Callout ("A relic shields you…") + toast ("Relic shield — one miss absorbed") +
`Snd.power()` + `doFlash("gold")` — all immediately after the red wrong stack.
Two text messages saying the same thing is the clearest redundancy here.

### 3.3 Overdrive moment
`callout` + voice line + `body.od-open` stage blur + modal — acceptable, it is a
deliberate pause-and-decide beat, but the callout and the modal title repeat the
same message.

### 3.4 Powers / Second Wind / Seals
Each fires toast + SFX (+ flash for powers). Fine individually; they stack on top
of whichever answer feedback just happened.

### 3.5 HUD (9 persistent elements)
`hud-accuracy`, `hud-diff`, `hud-lives`, `hud-q`, `hud-round`, `hud-streak`,
score, multiplier, momentum meter, clock. Persistent HUD is not "competing
feedback" — flagged only to note that the *transient* effects in §2 fire on top
of a dense HUD, which is why misses feel overwhelming.

---

## 4. Dead / near-dead code found (unnecessary features)

1. **`Backdrop.hit("correct")` and `Backdrop.hit("tick")` are no-ops.**
   `Backdrop.hit()` only animates for `wrong`, `death`, `levelup`; every
   `correct`/`tick` call does literally nothing. Dead calls, safe to delete.
2. **The backdrop jolt on wrong is effectively invisible.**
   `#backdrop` sits at z-index 0, and `.biblical-thriller .stage` paints an opaque
   `background:#050505` over it. During play the jolt is hidden behind the stage —
   it only shows around the edges. It adds a class flip + reflow per miss for
   ~zero visual return. **Strongest remaining removal candidate** (keep the jolt
   for `death`/`levelup`, where the stage is gone).
3. **`body.fx-wrong` grain/ember tweak** — 0.14 opacity change on the film grain;
   imperceptible next to the flash/shake/judge burst. Candidate to fold into the
   reduced-motion set or drop.

---

## 5. Ranked recommendations (not yet executed — awaiting approval)

| Priority | Change | Effect |
|---|---|---|
| 1 (done) | Remove answer-reveal panel | one answer display, teaching intact |
| 2 | Delete `Backdrop.hit` on the two miss paths (+ the no-op `correct`/`tick` calls) | kills an invisible jolt + dead calls |
| 3 | Drop `beat("wrong")` grain tweak (keep judge burst) | one less imperceptible channel |
| 4 | Shield event: keep the toast, drop the duplicate callout **or** the gold flash | de-clutters the red→gold clash |
| 5 | Consider `popScore` vs `animateScore` — keep the HUD count-up only | calmer correct moments |

Each of 2–5 is a small, independently testable change; none touches the
teaching core (SRS, typed recall, fill-in-the-blank identity, KJV tone).

---

## 6. Verification evidence

- `node --check js/game.js` → clean
- `node --check improvements.test.js` → clean
- `node test.js` → **all 27 suites passed** (including the two flipped negative
  assertions that pin the removal).
- No live-browser proof available (browser CLI broken in this environment) —
  visual feel needs a manual playtest, as usual.

*Nothing committed — awaiting your playtest feel-check, per project convention.*
