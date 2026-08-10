# UI Report — Complete the Verse

**Date:** 2026-07-29  
**Source review:** UI evaluation (play HUD density, mobile Lock, AI chrome, results wall, duplicate nav, micro-type)  
**Play entry:** `index.html` (split from former single-file HTML; monolith deleted)  
**Verification:** `node ui-structure.test.js` → `PASS`; browser preview of `index.html`

---

## Summary

All agreed UI-evaluation fixes were applied in a surgical pass before the later game-state / multi-file split. Goal: keep the biblical-thriller atmosphere while making the **verse + answers + Lock** the play-screen heroes.

---

## Changes shipped

### 1. Slim play HUD
| Kept visible | Hidden (still in DOM for JS) |
|---|---|
| Lives, score, multiplier, verse counter | Streak (`.hud-away`) |
| Act progress track | Run accuracy (`.hud-away`) |
| Verse, answers, timer, Lock Answer, powers | Momentum meter |
| Minimal header (difficulty + round) | KJV medallion, play header brand title |

- Streak + accuracy surface on the **pause** overlay instead.
- CSS: `#v-play .hud-away`, `#v-play .momentum`, `#v-play .kjv`, `#v-play .hdr-title { display:none }`.
- Mobile: act-track kept (no longer `display:none` at ≤600px); positioned as a static strip.

### 2. Larger mobile Lock Answer CTA
| Breakpoint | Change |
|---|---|
| ≤900px | `min-height:48px`, `font-size:.72rem`, wider min-width |
| ≤600px | `min-height:52px`, `font-size:.78rem`, `min-width:min(240px,70vw)` |

Previously Lock shrank to ~`.55rem` while answers grew — inverted that.

### 3. AI chrome removal (markup) + copy unify
**Removed from DOM:**
- `#neural-bg` canvas
- `.ai-orbit`, `.ai-scan`, `.ai-chrome` (status bar / corners)
- `.ai-analysis` on the play stage
- Ambient “neural field” second `<script>` block

**Copy:** boot kick `The Scripture Trial // Preparing the arena` → `The Scripture Trial · Preparing the record`.

**Not removed in the UI pass:** global AI *stylesheet* restyles (cyan/Orbitron layer still in CSS, overridden by `body.biblical-thriller`). Flagged for the game-state split / CSS purge pass.

### 4. Results screen staging
Primary path after a run:
1. Ending stage (outcome)
2. Kick + rank + **big score**
3. **Primary CTA row** (Run It Back / Study Missed / Main Hall)
4. Best-score hint
5. Collapsed `<details>`: “Score breakdown & progress” (breakdown, stats, XP, seals)
6. Collapsed `<details>`: “Verses to review” (auto-opens if any misses)

### 5. Duplicate menu icon nav removed
- Deleted floating `.topright` emoji buttons (⚙ ✦ ▤) from `buildPlayerCard` / `updatePlayerCard`.
- Study / Seals / Records / Settings remain on the menu **subnav** text buttons.

### 6. Micro-label type bumps
Raised floors for rail/header labels, hints, act-step labels, momentum labels, mode pills/taglines (~`.42–.56rem` → ~`.55–.72rem` where touched).

---

## Files touched (UI pass)

| File | Role |
|---|---|
| Former `complete-the-verse(1) (1).html` | Original UI edits (later split; file deleted) |
| `ui-structure.test.js` | Structural assertions (now targets `index.html`) |

---

## Verification evidence

```
PASS — index.html UI structure checks
```

Manual: default browser preview of `index.html`.

---

## Intentionally left alone (UI pass)

- Full deletion of the entangled AI theme CSS block — handled in the game-state split / CSS purge pass.
- Monolith split — handled in the game-state execution pass (monolith since deleted).
- Game systems (verse bank, practice mode, tutorial, abandon scoring, daily share) — see `GAME-STATE-REPORT.md`.
