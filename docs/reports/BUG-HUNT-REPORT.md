# Complete the Verse — Bug Hunt Report

**Date:** August 21, 2026
**Scope:** Full codebase audit (38 JS files, ~15,000 lines, index.html, CSS, assets, audio)
**Result:** 5 real bugs found → **all 5 fixed** · 46/46 test suites pass after fixes

---

## First Principles: What Is a Bug, Really?

Before listing bugs, let's build the idea from the ground up.

**A program is a machine made of promises.** Every line of code is a small promise:
*"when this happens, that will follow."* The HTML promises an element exists. A function
promises to compute a number. One file promises another file that a name will be there.

**A bug is a broken promise.** Not bad style, not missing features — a place where the
machine's own promises contradict each other. So a bug hunt is not random poking. It is
a *contract audit*: collect every promise the code makes, then hunt for the places where
two promises collide.

**How you find collisions — three questions:**
1. **Does every promise have a keeper?** (Every function called must exist; every element
   referenced must be in the page.)
2. **Do keepers keep them forever, or only sometimes?** (State set in one mode must be
   cleaned up when the mode ends.)
3. **When two promises touch the same thing, who wins?** (Two systems writing the same
   setting will fight.)

Everything below was found by asking these three questions of the code.

---

## How the Hunt Worked

| Step | Tool | What it proved |
|---|---|---|
| Baseline | `node test.js` | All **46 suites** passed before I touched anything |
| Syntax gate | `node --check` on all 38 JS files | Zero parse errors |
| Structure scan | `node scripts/bug-scan.js` | Duplicate IDs + missing elements |
| Dependency audit | grep over every new function call | Every helper the new code calls actually exists |
| Asset audit | `node scripts/asset-check.js` + manual fallback check | Missing art degrades gracefully |
| Live serve | `node scripts/dev-server.js` + curl | Page and images actually load (HTTP 200) |

The game had just grown a big new feature — a **"rival race"** (a ghost opponent that
races you through each site) plus three new music tracks and onboarding voice lines.
New code is where fresh bugs live, so it got the deepest audit.

---

## The Bugs

### Bug 1 — The Duplicate `judge-burst` (invalid HTML, dead markup)

**The promise:** An element ID is like a person's name — the browser assumes each name
belongs to exactly one element. When JavaScript calls `document.getElementById("judge-burst")`,
the browser promises to return *that one* element.

**The break:** `index.html` contained **two** different `<div id="judge-burst">` elements
(line 284 inside the play stage, line 341 near the section overlays). Git history shows
commit `0827a1e` added the second copy without removing the first.

**Why nothing visibly broke:** the browser keeps its promise by returning only the *first*
match. But that means the second copy is dead weight — invisible, unaddressable, and a
trap: any future edit that styles or moves "the other copy" would silently do nothing.

**The fix:** Deleted the second copy. Verified: served HTML now contains exactly one.

---

### Bug 2 — Trial-Mode Ghost Timelines Sawtoothed Back to Zero

**The promise:** The rival race draws your opponent's progress as a line from 0% to 100%.
For that line to mean anything, progress must be measured against the *whole run*.

**The break:** In Trial mode (the 5-act campaign), recorded progress used `qInAct / 8` —
questions done **in the current act**, out of 8. But `beginAct()` resets `qInAct = 0`
at every act boundary. So the saved timeline climbed toward 100%, snapped back to ~0%
at each act change, and climbed again — five times. Meanwhile the *live* race bar used
`qTotal / total`, which counts the whole campaign. Two promises, two different rulers.

**Consequence:** Your previous-run ghost would sprint ahead, teleport back, and sprint
again — the rival marker lurching across the track for reasons the player can't see.

**The fix:** Added a trial branch to `noteGhostProgress()` measuring `(R.qTotal || 0)`
against the full campaign question count — the same ruler the live bar uses.

---

### Bug 3 — Two Systems Fighting Over One Body Class

**The promise:** A CSS class on `<body>` is a shared switch. Whoever flips it owns the
screen effect attached to it.

**The break:** The rival system added `pressure-3` to `<body>` for its "retreat" state
(3 misses). But the Director (the countdown announcer) *also* uses `pressure-3/5/7` for
final-seconds tension — and every single second, `Director.pressure()` runs
`clearBody(["pressure-"])`, which strips **every** class starting with `pressure-`.
So:

- Rival sets retreat → Director wipes it within a second → retreat visual vanishes.
- Worse, the reverse: rival's cleanup (`classList.remove("pressure-3")`) could erase
  Director's genuine last-3-seconds warning mid-countdown.

Two writers, one switch, no coordination — a classic collision.

**The fix:** Gave the rival its own dedicated class, `retreat`, with matching CSS
(same visual language as pressure-3, so the look is unchanged). Each system now owns
its own switch and can never unplug the other. Also added `retreat` to all three
cleanup lists (set-piece transitions, quit-run, end-of-run) so it can never leak into
the next run or menu.

---

### Bug 4 — A Slow Network Answer Could Haunt the Next Run

**The promise:** When a new run starts, everything belonging to the old run is gone.

**The break:** At run start, the game fetches cloud ghosts ("other players' runs") to
use as the rival. That fetch takes time — the network doesn't care about your game.
If the player finished or quit while the request was still flying, the response would
land *after* the new run began, and the stale ghost would be injected into the brand-new
race. The code checked nothing; late data just walked right in.

**The fix:** Captured the run's ID token (`R.runToken`) before the request and compared
it when the response arrived. Different token → the run has changed → discard the answer.
This is the same guard pattern the codebase already uses for timers (`afterRun`).

---

### Bug 5 — The Rival HUD Rebuilt Its Entire DOM Up to 60× per Second

**The promise:** CSS transitions animate smoothly only if the element stays alive while
its inputs change. Replace the element, and the animation restarts from zero.

**The break:** `updateRivalRace()` ran once per animation frame (~60 fps) and every
single frame executed `host.innerHTML = ...`, destroying and recreating the HUD's whole
DOM tree — including the rival avatar `<img>`. Consequences: the progress bars' CSS
transitions (`.45s ease`) could never complete because their elements kept being replaced;
the image re-requested/re-decoded up to 60 times per second; and screen readers announcing
the status region got spammed with churn.

**The fix:** Build the HTML string first, compare with the last rendered string, and only
touch the DOM when something actually changed. Bars now transition smoothly; the image
loads once per real change.

---

## Suspected, Investigated, and Cleared (Not Bugs)

A good report shows its work. These looked wrong but check out:

| Finding | Why it's fine |
|---|---|
| Scanner flags 5 IDs used in `cinematic.js` but "missing" from HTML | Those elements are created on demand at runtime — false positives |
| `asset-check.js`: 40 missing journey images (Arc II+ sites) | Known content gap; every site defines a fallback image, and all 40 fallbacks exist. Art renders via fallback until authored |
| `armTimer` clamp `Math.max(4500, dur - penalty)` could lengthen short clocks | Real clocks are always ≥ ~12 s (PACE ×1.2 + 5000 ms flat add), so the floor is unreachable |
| `surgeUntil` read but never written | **Fixed in this pass:** misses now set `surgeUntil = Date.now() + 12000` so surge decays after 12 calm seconds (and a correct answer wipes it) — restoring the code's own "temporary pressure" intent |
| New music keys (`indigo`, `finalStillness`, `suddenDescent`) | All three MP3s exist and are wired in the audio map |
| New rival PNGs | Exist, valid PNGs, correct 512×512 dimensions (asserted by tests) |
| Global name collisions between the 38 script files | None found (checked programmatically) |
| Scanner flagged 5 `cinematic.js` IDs as missing from HTML | **Fixed in this pass:** those elements are created at runtime (`el.id = …` / JS-built markup); `bug-scan.js` now recognizes runtime-created IDs → SCAN CLEAN |
| Live-browser E2E expected Fade memory phase = "7s" | **Fixed in this pass:** stale expectation; game deliberately ships 30 s (`FADE_MEMORY_MS = 30000` + `thirty-seconds.mp3`). Script updated → 32/32 live checks pass |

---

## Verification After Fixes

```
node --check js/game.js js/play.js js/results.js   → SYNTAX OK
node scripts/bug-scan.js                           → duplicate gone (5 known false positives remain)
node test.js                                       → all 46 suites passed
node scripts/dev-server.js + curl                  → HTTP 200, judge-burst count = 1, rival PNG serves
```

**Follow-up pass (same day) — closing the remaining items:**

```
node scripts/bug-scan.js                           → SCAN CLEAN (runtime-created IDs now recognized)
surge decay wired (surgeUntil set on miss)         → rival surge is temporary as designed
scripts/live-browser-verification.js (real Chrome) → 32/32 checks passed · zero runtime exceptions
node test.js                                       → all 46 suites passed
```

**Live-browser proof:** the game was booted in headless Chrome via the repo's CDP suite —
full 8-verse Ur site (all mechanics), all 6 tutorial lessons, results, and a runtime
exception audit. **32/32 passed, zero JavaScript exceptions.** The only E2E fix needed was
in the verification script itself: its Fade expectation ("7s") predated the deliberate
30-second memory phase that shipped in commit `2c4007a`.

**`hermes verify` note:** invoke it as `hermes verify --port 8781` — the generic Node
recipe otherwise probes port 8000 and reports the app "not ready" even though it is.
Its test phase (`npm run test`) passes; on this Windows host the tool can hang during
server teardown after a successful run, so prefer `npm run test` +
`scripts/live-browser-verification.js` as the canonical evidence pair.

---

## Rules of Thumb This Hunt Teaches

1. **One ID, one element.** Duplicates don't crash — they quietly make half your work
   unreachable.
2. **Measure a journey with one ruler.** If the live bar and the recording use different
   definitions of "progress," they will disagree.
3. **Shared switches need owners.** Two systems writing the same body class is two
   drivers grabbing one wheel. Give each state its own name.
4. **The network doesn't wait for you.** Any response that arrives after a state change
   must prove it still belongs before it's applied.
5. **Don't rebuild what you can update.** Per-frame DOM replacement kills animations and
   burns battery; compare first, write only on change.
