# Second Report — Animations, Assets & UI

**Date:** 2026-08-19
**Scope:** Forward-looking review of *presentation layer only* — motion, media payload, and interface polish. This deliberately does **not** re-list the gameplay/product problems already catalogued in `IMPROVEMENT-REPORT.md` (default difficulty, hidden modes, usedIds, typed set-pieces, etc.). The two reports separate concerns: *product logic* vs *presentation craft*.
**Verified this session:** live file sizes for `assets/`, `audio/`, `sfx/` (69.82 MB / 128 files), sprite-sheet dimensions (via PNG IHDR reads), and the exact CSS that drives the walker and judge-burst sprites.

---

## Verdict

The presentation is already the game's strongest asset: a confident biblical-thriller identity (gold/parch/ink, KJV, film grain, letterboxing, live sky graded from real solar altitude) that most quiz apps do not have. It is not a "restyle" problem.

It **is** an *engineering and restraint* problem:

1. **Sprite sheets are mis-configured** — the map walker and the judge burst both reference PNG dimensions that do not match what the CSS ships. The walker visibly glitches; the judge burst is silently off-spec.
2. **The payload is ~2–3× heavier than the experience justifies** — oversized one-shot PNGs, a full duplicate soundtrack folder, and live MP3s at archive bitrates.
3. **The UI type scale and hit targets sit below accessibility floors**, and several motions stack on top of each other with no intensity setting.

None of these break play. All of them are finish quality: they are what a player would notice in the first 30 minutes and what a reviewer would screenshot.

---

## What is already strong — keep it

1. **Token discipline.** `game.css` defines a single palette/font/panel system; `atlas.css` explicitly inherits it instead of forking. This is the correct architecture.
2. **`prefers-reduced-motion` is respected almost everywhere** via the `body.reduced` class (grain, flashes, bootmark, route dash, beacon pulse, walker, judge burst). The pattern is consistent.
3. **The live sky is honest.** `atlas.css` grades the backdrop from the site's true solar altitude and live weather, and weather correctly wins the cascade over time-of-day. Cosmetic only, never touches the clock.
4. **Motion is signalled, not decorative.** View enter (`vIn`), play enter (`playEnter`), correct/wrong (`goldShock` / `signalBreak`), reveal (`revealFreeze`) all mark state changes. The "animation as feedback" discipline is right.
5. **The cold-open / briefing / dossier copy is excellent** and needs no animation help.

---

## 1. Animations — what should be improved

### 1.1 (FIXED) Map walker sprite sheet frame loop

`assets/traveler/walk.png` is **2152×479**, i.e. **8 cells of 269×479**.

The CSS (`css/atlas.css` 151–168) ships:

```css
background-image: url("../assets/traveler/walk.png");
background-size: 320px 72px;          /* display scale: 8 × 40×72 cells */
animation: pilgrimWalk .72s steps(7) infinite;
...
@keyframes pilgrimWalk {
  from { background-position: 0 0; }
  to   { background-position: -280px 0; }
}
```

The shipped display size is an intentional downscale of the 269×479 source cells into a 40×72 walker. The actual defect was the off-by-one loop: `steps(8)` and `-320px` advanced one frame beyond the eight-cell sheet. The CSS now uses seven transitions and ends on the seventh offset (`-7 × 40px`).

**Applied fix:**

```css
.traveler-marker.is-walking .traveler-walker,
.traveler-node.walking .traveler-walker {
  background-size: 320px 72px;         /* display scale: 8 × 40×72 */
  animation: pilgrimWalk .72s steps(7) infinite;
}
@keyframes pilgrimWalk {
  from { background-position: 0 0; }
  to   { background-position: -280px 0; }    /* 7 × 40 */
}
/* pilgrimWalkWest mirrors the same values with scaleX(-1) */
```

### 1.2 Judge burst — one-shot 5 MB, and two poses only

`assets/judge/up.png` and `down.png` are **4096×944** = **8 cells of 512×944**, at **2.54 / 2.60 MB each**. The CSS (`css/play.css`, "Judge burst" block) does:

```css
#judge-burst i { --cell-h:min(100vh,148vw); --cell-w:calc(var(--cell-h) * 512 / 944); ... }
animation: judgeBurst .64s steps(7) forwards;   /* 0 → -7 × cell */
```

That step math is **correct** (8 frames, 7 transitions, ends on the last frame). The issues are payload and posture:

- **~5 MB of PNG for two sub-second moments nobody can pause.** Re-encode as WebP (lossy ~q92 with alpha) or quantized 8-bit PNG. Expect 60–75% size reduction with no visible difference in a 0.64s burst.
- **Only "thumb up" and "thumb down."** The game has four meaningful outcomes (perfect, correct, wrong, heart-lost). Two extra poses (or a neutral "gavel / scroll" idle for miss and a golden variant for perfect) would cost little once the encode pipeline is fixed.
- **No audio coupling.** The burst and `sfx/correct.mp3` / `sfx/wrong.mp3` fire independently; a 40–80ms pre-roll offset on the SFX would land the sound *with* the pose, not beside it. Currently best-effort.

### 1.3 Add a motion-intensity setting (the current three-body problem)

During a resolve, all of these can be live at once: `#grain` (full-viewport turbulence), `bdJolt`, `goldShock`/`signalBreak`, `ringPulse`, `selPulse`, lamp `flameFlicker`, `candleFlicker`, and the route-line `atlasDash`. Each is fine alone; stacked, the result is visual noise that fights the "verse + answers + Lock" hierarchy the UI pass worked to protect.

Recommend a **Motion: Full / Calm / Reduced** setting (stored like quality):
- **Full** — current.
- **Calm** — drop grain opacity to `.05`, shorten flash durations, disable decorative loops (`atlasDash`, `sealSpin`, `smokeMove`, `motifTwinkle`), keep only feedback motion (correct/wrong/reveal).
- **Reduced** — current `body.reduced` behaviour.

This is a small amount of work because the `body.reduced` hook already exists; "Calm" is a third value on that axis, not a rewrite.

### 1.4 The full-screen grain is the most GPU-hostile element

`#grain` is an inline SVG `feTurbulence` animated with `transform: translate(...)` over the entire viewport at `.85s steps(3)` (game.css 41–44). On high-DPI phones this is a per-frame full-surface composite, and it never stops unless the hall is ready or `reduced`.

Improvements:
- Pre-render the noise to a **static 256×256 PNG** and animate a tiled `background-position`, or use a single `will-change` layer.
- Respect `document.visibilityState` — pause `#grain` and `#hall-bg` when the tab is hidden (a battery drain on mobile).
- In "Calm" mode, make the noise static at `.04–.06` opacity.

### 1.5 Route/beacon loops run while invisible

`atlasDash` (route line) and `atlasPulse` (beacon) animate indefinitely even when the atlas view is not `.on`. Cheap but wasted. Gate them with `body:has(#v-atlas.on)` or toggle a class on view switch, matching how the hall already stops `#grain`.

### 1.6 `will-change` is over- and under-used in equal measure

- Under-used on the transform-animated layers (walker, grain) — these animate *every frame* and should have `will-change: transform` (or backface-visibility).
- Over-used / unnecessary on `#hall-bg` and `.intro-video` where the transition is a one-time opacity fade and `will-change` pins a full layer for minutes.

Recommend a pass: `will-change` only on infinite/looping transform animators, and only while their view is active.

### 1.7 Missing micro-motion that would add polish (low cost, high feel)

Not new systems — single-token additions:
- **Answer press:** a 1-frame `:active` scale on `.ans` (currently only `.sel` afterglow is animated).
- **Lock button:** a subtle gold pulse *only when a choice is selected*, so the CTA announces "ready."
- **Tab/panel entry:** `vIn` is global; the dossier/rail slide correctly, but the results `<details>` and Study Hall cards pop with no entry easing.
- **Heart lost:** `heartFlash` exists; pair it with a brief `.hrt` shake on the *wrong* answer for symmetry with `goldShock`.

---

## 2. Assets — what should be improved

### 2.1 Full inventory (measured today)

| Area | Size | Files | Note |
|---|---|---|---|
| `audio/_orig_backup/` | **~20.4 MB** | 8 | exact duplicate of the live soundtrack; ignored at deploy *and* `.gitignore`d, but **still in the repository and git history** |
| Live `audio/*.mp3` | **~19.0 MB** | 7 | menu + 5 acts + results at ~2–2.7 MB each |
| `assets/judge/*.png` | **~5.1 MB** | 2 | 4096×944 one-shot bursts |
| `assets/artifacts/*.png` | **~20 MB** (45 files) | 45 | several > 0.9 MB; largest artifacts 1.18 / 1.04 / 1.03 MB |
| `assets/characters/*` | **~8 MB** (30 files) | 30 | 15 portraits + 15 tokens, ~0.26–0.28 MB each |
| `assets/traveler/*.png` | **~0.47 MB** | 2 | walk 2152×479, idle 269×479 |
| `assets/intro.mp4` | **2.10 MB** | 1 | |
| `assets/hall.mp4` | **0.52 MB** | 1 | |
| `sfx/*.mp3` | **~0.6 MB** | 8 | small, fine |
| **Total** | **~69.8 MB** | **128** | local; deploy omits backup/tooling per `.vercelignore` |

### 2.2 Priority fixes

| # | Asset issue | Fix | Est. saving |
|---|---|---|---|
| 1 | `_orig_backup/` duplicated 20 MB in repo | `git rm -r audio/_orig_backup` and add to history if feasible (or at minimum stop re-shipping it). Already deploy-ignored, but it bloats clone/CI and misleads future sessions. | ~20 MB |
| 2 | Judge burst PNGs = 5.1 MB for two 0.64s frames | Re-encode WebP lossy q90 → ~1.2–1.5 MB, or quantized 8-bit PNG. | ~3.6 MB |
| 3 | Artifacts avg ~0.45 MB each, max 1.18 MB, drawn at ≤52 px | Re-encode WebP/AVIF with alpha, cap longest edge at 512 px (dossier shows 52 px; the largest "full reveal" maybe 220 px). | ~12–14 MB |
| 4 | Character tokens 0.27 MB each, drawn at 16–44 px | Export a separate `token` at 96–128 px. This is the single easiest, largest win per image. | ~3 MB |
| 5 | Portraits 0.26–0.28 MB, drawn at ≤ maybe 200 px | Cap at 512 px WebP. | ~2 MB |
| 6 | Live MP3s ~19 MB | Re-encode to 128 kbps Opus (fallback AAC) or 96 kbps where it is a bed loop. Optionally stream rather than preload all five acts. | ~8–10 MB |
| 7 | `intro.mp4` 2.1 MB | Bitrate re-encode to ~1 MB; it is a dark title treatment, visually tolerant. | ~1 MB |
| 8 | No responsive/lazy image loading | Add `loading="lazy"` and `decoding="async"` to dossier/artifact/character `<img>`; the atlas only needs the active site. | perceived |
| 9 | No poster/webp fallbacks for `intro.mp4`/`hall.mp4` | Add `poster` (existing `intro.jpg` may already serve intro; none for hall) and a `<video>` poster so low-data users see *something*. | resilience |

**Realistic deploy payload after fixes: ~25–30 MB → ~10–13 MB**, mostly audio.

### 2.3 Structural asset improvements

- **Adopt an image pipeline.** The project already has Node tooling (`scripts/`). Add `scripts/optimise-media.js` (sharp-based) so artifacts/portraits/tokens are resized + WebP-ised in a reproducible step instead of hand-exported. This is a build step, not a runtime dependency.
- **Use `srcset` for artifacts** — the dossier thumbnail (52 px) and the reveal view (up to ~400 px) should not share one 1 MB file.
- **Define an explicit sprite contract** (document cell size + frame count in the file name or a `assets/README.md`). The walker bug (1.1) exists because the PNG and the CSS were authored separately with no shared source of truth:
  - `walk.png` → `walk-8x269@479.png`
  - `judge/up.png` → `judge-up-8x512@944.png`
- **Alt text / `title` for every character and artifact image.** Decorative where invisible, but the relic cabinet and scholar roster are *content*; they currently ship as untagged `<img>`.

### 2.4 Audio specifics

- `audio/` is loaded eagerly enough that five ~2 MB acts pressure low-end devices before a single verse is played. Confirm `audio.js` streams acts on demand; if it preloads all five, stop.
- Mission voice now prefers the authored recordings in `audio/voice/` and falls back to device TTS when browser playback is blocked. The remaining audio-quality gap is content authoring: several tutorial and ceremony prompts still need dedicated recorded lines rather than fallback speech.
- SFX are appropriately small and themed. Only `.tick.mp3` is 0.27 MB (fine); consider a single consolidated `ui` sprite with seek offsets to cut 8 HTTP requests to one.

---

## 3. UI — what should be improved

The prior UI pass (see `UI-REPORT.md`) already achieved its goal: the play screen heroes the verse/answers/Lock. The remaining items are **accessibility floors, contrast, touch targets, and loading honesty** — finish work, not redesign.

### 3.1 Type scale still dives below the readable floor

Measured in CSS: `.doss-cell b` **.52rem**, `.doss-live .lv-state` **.5rem**, `.rail-site .ord` **.56rem**, `.arc-head span` **.54rem**, `.atlas-note` **.54rem**, `.lyr` **.56rem**, `.doss-tag` **.55rem**, `.brief-live .bl span` **.54rem**.

At a 2× mobile viewport that is ~6–7 physical px. These are labels, but they are also **content** (book title, arc progress, live-weather state). Recommendation:

- Raise the **global micro-label floor to `.62rem`** and the **state/ord floors to `.68rem`** where the value is data, not decoration.
- Keep the *decorative* kick/kicker flourishes at their current small sizes if desired, but never below `.55rem`.

### 3.2 Touch targets are under 44 px in several places

- `.zbtn` 30×30, `.iconbtn` 38×38, `.rail-site` (~34 px tall), `.arc-relay` (~22 px tall, `font-size:.5rem` with `.3em` padding), `.atlas-layers .lyr`.

On the map (a primary surface) these are the core navigation controls. Fix: **min 44×44 px** hit areas via padding (visual size can stay compact), and give `.arc-relay` at least `.7em` vertical padding with `display:inline-flex`.

### 3.3 Contrast misses WCAG AA on dark panels

Notable pairs (background `rgba(6,7,11,.8+)` ≈ `#090a0f`):

- `--gold-dim #8a7239` on ink ≈ **~2.3:1** (used for `.muted`, `.arc-relay`, `.atlas-sub`, `.boot-ref`).
- `#5d5a50` / `#6b6552` "record/label" greys ≈ **~2.5–3:1** (`.doss-cell b`, `.doss-live .lv-row b.dim`, `.atlas-note`, `.doss-record span`).

These are used for *info the player may need* (arc status, live reading state, record labels). Bump the dim-grey to `#8f8975`+ and use `--gold-dim` only for genuinely decorative text, swapping to `--parch-dim` for readable labels.

### 3.4 Loading / state honesty

- **Cloud sync has no skeleton or pending state** in the menu or Study Hall — a save merge resolves as a silent jump. Add a one-line "syncing…" chip in the top-right while `cloud.js` is busy, and a non-blocking "offline" mark in the atlas when the map tiles or weather fail (the game already degrades gracefully; make that visible instead of invisible).
- **Media quality is decided, not communicated.** Like `qualityLocked` (still read but never written), there is no way to force "low data" and see what is excluded. Expose it in Settings (this also fixes the flagged `qualityLocked` gap).
- **No empty states** for zero relics / zero seals / zero due cards — these render as blank cabinets. A single "nothing here yet — walk the road" line in each empty collection would close the loop the content systems have already earned.

### 3.5 Small polish / consistency

- **Study Hall selection.** `user-select:none` on `body` is still global; Study Hall and dossier quote are content the player will want to select/copy. The `.doss-quote`/`.doss-body` already opt back into `user-select:text` — extend the same opt-in to Study Hall passage and results breakdown.
- **Results `<details>`** use the browser's default disclosure marker, which clashes with the gold/ink theme (a default black triangle on a dark panel). Style `::marker` or replace with a custom chevron to match the rest.
- **Mobile dossier sheet (62vh)** has no visible drag-handle affordance and no `overscroll-behavior: contain`, so a swipe at the bottom propagates to the body and traps. Add a centered grab-handle bar and `overscroll-behavior: contain`.
- **Focus state is inconsistent.** Atlas has its own gold `:focus-visible`; the rest rely on the global `outline:2px solid var(--gold-hot)`. Verify keyboard navigation on the map tools and results `.details` — the global focus ring can be clipped by `clip-path` panels.
- **`#v-menu` top bar density** is good, but the player card + topright duplicates the subnav's Study/Seals/Records/Settings. Confirm the emoji `.topright` controls (⚙ ✦ ▤) removed in the UI pass are still gone in production; if any remain, they are dead weight next to the styled subnav.

---

## Suggested order of work (presentation only)

| # | Task | Effort | Impact |
|---|---|---|---|
| 1 | **Fix walker sprite CSS** (1.1) | **Done** | Bug — immediately visible |
| 2 | **Re-encode judge burst to WebP** (2.2-2) | 1 h | 3.6 MB off |
| 3 | **Downscale artifacts + character tokens** (2.2-3/4) | 2–3 h | 15 MB off |
| 4 | **Add Motion: Calm tier** (1.3) | 1–2 h | Feel/battery |
| 5 | **Micro-label floor + contrast pass** (3.1/3.3) | 2–3 h | Accessibility |
| 6 | **Touch targets ≥44 px on map controls** (3.2) | 1 h | Accessibility |
| 7 | **Sync/offline/empty states** (3.4) | 1–2 h | Honesty |
| 8 | **Audio re-encode + on-demand streaming** (2.2-6) | 1–2 h | 8–10 MB off |
| 9 | **Remove `_orig_backup/` from repo** (2.2-1) | 15 min | 20 MB off clone/CI |
| 10 | **Judge pose pair (perfect/neutral) + SFX offset** (1.2) | 2 h | Feel — do after the pixel pipeline |

The walker fix (1) and the repository trim (9) are cheap enough to do in the same session as the prior report's Phase A bugs, because they are the two presentation defects a playtester would notice *today*.

---

*End of report.*
