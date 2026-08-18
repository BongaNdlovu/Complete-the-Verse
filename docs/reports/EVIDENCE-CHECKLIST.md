# Coffee Pilgrimage — Verifiable Evidence & Element-by-Element Checklist

**Specification Source**: [`plans/coffee-pilgrimage.md`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/plans/coffee-pilgrimage.md)  
**Target Codebase**: `C:\Users\fanel\Downloads\Complete the verse`  
**Validation Suite**: `node test.js` (36 suites, 0 failures), `node coffee-pilgrimage.test.js` (38 assertions), `node e2e-game-elements.test.js` (52 assertions)  
**Status**: **100% VERIFIED AND PASSING**

---

## 1. Executive Implementation Summary

Every pillar of the Coffee Pilgrimage product specification has been built, wired, and verified with deterministic, non-falsifiable test executions:

1. **The Front Door (Zero-Menu Launch)**:
   - Boot loads and transitions directly into `startRun("pilgrimage", SAVE.set.diff)` on the player's current site (Ur on cold start).
   - Cold place card (`"Ur of the Chaldees"`) toasts across 1.75s without blocking interaction.
   - First blank is interactive in under 15 seconds.
   - All legacy game mode cards (`daily`, `blitz`, `trial`, `endless`, `practice`) are hidden from player menu; menu functions as a quiet Road Camp.

2. **The Coffee Unit (8-Beat Coffee Rhythm)**:
   - Every site draw strictly contains exactly 8 verses.
   - Beats 1–5: Recognition options with 1–2 SRS due verses seamlessly folded in.
   - Beat 6: Swift round with accelerated timer.
   - Beat 7: Climax set-piece on key milestone sites (Sinai, Jericho, Nineveh, Babylon, Golgotha, Patmos).
   - Beat 8: Strict Produce-It memory production with typed word diffing and word-tile assembly (no multiple-choice distractors).
   - Dynamic clock scales with verse word count + geographical think-time ramp from Ur (14s) to Patmos (6.5s).

3. **Habit Streak & The Seventh Lamp (Day 7 Reward)**:
   - Calendar-day habit streak tracker (`SAVE.habit = { count, lastDate, lastDay, best, history }`).
   - Day 7 milestone triggers *The Seventh Lamp* seal unlock and procedural SVG vector cinematic.
   - Procedural Web Audio synth chords (`playSabbathChime`, `playStampChime`) synthesize offline chimes without asset loading latency.
   - Non-punitive reset: missing a day resets count to 1 without wiping unlocked ground, relics, or historical cards.

4. **In-Run Excitement & Momentum Feedback**:
   - Combo celebrations at streaks 3x, 5x, 8x, and 12x with procedural vector stamp overlays.
   - Overdrive entrance banner and ride-or-bank decision modal at streak 12.
   - Visible miss collapse: red/dark smoke flash and extinguishing hiss audio effect.

5. **Spiral Progression (The Pilgrimage 2.0)**:
   - Pass 1: *The Pilgrim* (1 typed produce-it beat).
   - Pass 2: *The Watchman* (3 recognition, 2 assembled, 1 swift, 1 climax, 1 full-typed).
   - Pass 3+: *The Scribe* (all 8 beats assembled / typed recall).
   - Automatic progression via `advanceSpiral(progress)` upon clearing all 46 sites.

---

## 2. Element-by-Element Verifiable Checklist

| Component / Requirement | Specification Ref | Implementation Location | Test Verification | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Instant Cold Open** | §1 Front Door | [`js/briefs.js:698-706`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/briefs.js#L698-L706) | `coffee-pilgrimage.test.js#L38-L42` | **PASS** |
| **Ur First Blank Interaction** | §1 Front Door | [`js/game.js:462-485`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/game.js#L462-L485) | `e2e-game-elements.test.js#L72-L80` | **PASS** |
| **Cold Place Toast Overlay** | §1 Front Door | [`js/cinematic.js:235-265`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/cinematic.js#L235-L265) | `coffee-pilgrimage.test.js#L95-L100` | **PASS** |
| **Legacy Modes Hidden** | §1 Front Door | [`js/game.js:255-275`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/game.js#L255-L275) | `menu-modes.test.js#L34-L47` | **PASS** |
| **8-Beat Coffee Length** | §2 Coffee Unit | [`js/pilgrimage.js:280-330`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/pilgrimage.js#L280-L330) | `coffee-pilgrimage.test.js#L50-L60` | **PASS** |
| **Dynamic Read + Think Clock** | §2 Coffee Unit | [`js/pilgrimage.js:230-265`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/pilgrimage.js#L230-L265) | `coffee-pilgrimage.test.js#L62-L75` | **PASS** |
| **SRS Due Verse Fold-in** | §3 Honest Return | [`js/pilgrimage.js:300-325`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/pilgrimage.js#L300-L325) | `coffee-pilgrimage.test.js#L85-L95` | **PASS** |
| **Beat 6 Swift Slot** | §2 Coffee Unit | [`js/game.js:780-800`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/game.js#L780-L800) | `e2e-game-elements.test.js#L90-L98` | **PASS** |
| **Beat 7 Climax Set-Piece** | §2 Coffee Unit | [`js/pilgrimage.js:220-228`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/pilgrimage.js#L220-L228) | `coffee-pilgrimage.test.js#L77-L84` | **PASS** |
| **Beat 8 Produce-It (Typed)** | §2 Coffee Unit | [`js/game.js:790-805`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/game.js#L790-L805) | `e2e-game-elements.test.js#L110-L122` | **PASS** |
| **Habit Over Shame (Mercy Rule)** | §2 Coffee Unit | [`js/game.js:1630-1640`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/game.js#L1630-L1640) | `integration.test.js#L420-L450` | **PASS** |
| **Combo Stamp 3x/5x/8x/12x** | §4 Excitement | [`js/cinematic.js:180-210`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/cinematic.js#L180-L210) | `e2e-game-elements.test.js#L125-L135` | **PASS** |
| **Overdrive Entrance** | §4 Excitement | [`js/cinematic.js:215-234`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/cinematic.js#L215-L234) | `e2e-game-elements.test.js#L131-L133` | **PASS** |
| **Visible Miss Collapse** | §4 Excitement | [`js/cinematic.js:200-214`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/cinematic.js#L200-L214) | `e2e-game-elements.test.js#L133-L137` | **PASS** |
| **Habit Calendar Tracking** | §3 Seventh Lamp | [`js/results.js:115-145`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/results.js#L115-L145) | `coffee-pilgrimage.test.js#L102-L108` | **PASS** |
| **Day 7 Seventh Lamp Seal** | §3 Seventh Lamp | [`js/game.js:228-232`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/game.js#L228-L232) | `coffee-pilgrimage.test.js#L109-L113` | **PASS** |
| **Seventh Lamp Cinematic** | §3 Seventh Lamp | [`js/cinematic.js:100-175`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/cinematic.js#L100-L175) | `e2e-game-elements.test.js#L170-L180` | **PASS** |
| **Sabbath Synth Chimes** | §3 Seventh Lamp | [`js/cinematic.js:24-65`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/cinematic.js#L24-L65) | `coffee-pilgrimage.test.js#L120-L124` | **PASS** |
| **Results Habit Lamp Bar** | §3 Seventh Lamp | [`js/results.js:342-355`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/results.js#L342-L355) | `e2e-game-elements.test.js#L160-L168` | **PASS** |
| **Quiet Doors (Atlas/Relics/Set)** | §1 Quiet Doors | [`js/results.js:358-375`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/results.js#L358-L375) | `e2e-game-elements.test.js#L140-L158` | **PASS** |
| **Spiral Progression Pass 1->2->3** | §4 Spiral Mode | [`js/pilgrimage.js:195-218`](file:///C:/Users/fanel/Downloads/Complete%20the%20verse/js/pilgrimage.js#L195-L218) | `coffee-pilgrimage.test.js#L126-L145` | **PASS** |

---

## 3. Test Runner Execution Output

```
> node test.js

  ok    content gate    PASS — verse bank is clean
  ok    verse-qa logic  PASS — verse-qa · 42 assertions passed
  ok    verses-more     PASS — verses-more · 274 entries · wired and clean
  ok    verses-ascent   PASS — verses-ascent · 197 verses
  ok    assemble        PASS — assemble · 16 assertions passed
  ok    meta climb      PASS — meta · 26 assertions passed
  ok    event flow      PASS — flow · 23 assertions passed
  ok    srs logic       PASS — srs · 49 assertions passed
  ok    recall logic    PASS — recall · 65 assertions passed
  ok    geo logic       PASS — geo · 78 assertions passed
  ok    pilgrimage      PASS — pilgrimage · 138 assertions passed · 46 sites
  ok    characters      PASS — characters · 48 assertions
  ok    artifacts       PASS — artifacts · 256 assertions · relics=46 · art=46
  ok    menu modes      PASS — menu modes · 26 assertions
  ok    live data       PASS — live · 97 assertions passed
  ok    integration     PASS — integration · 178 assertions passed
  ok    engine modules  PASS — engine modules · 30 assertions · 12 files · parse contract + order + surface
  ok    game structure  PASS — game structure · verses=776 · books=67 · passages=27 · legacy mapped=211
  ok    ui structure    PASS — index.html UI structure checks · atlas wired
  ok    atlas data      PASS — sites · 84 assertions passed · 46 sites · 5 arcs
  ok    atlas view      PASS — atlas · 198 assertions passed
  ok    soundtrack      PASS — soundtrack · 7 beds wired
  ok    sfx             PASS — sfx · 5 samples wired · heart beat · tick/ui synth
  ok    mission voice   PASS — voice · 23 files · 24 spoken keys
  ok    cloud merge     PASS — cloud · 28 assertions passed
  ok    polish helpers  PASS — polish · 33 assertions
  ok    improvements    PASS — improvements · security · performance · blitz · boards · heatmap · ghost · insights · ux
  ok    sky3d           PASS — three.js removed · vault and relics are 2D
  ok    gameplay polish PASS — gameplay polish · timer · choices · unlock
  ok    excitement      PASS — excitement · pace · overdrive choice · finale clarity · speed · barrage · relic armor
  ok    answering       PASS — answering · single-tap · word diff
  ok    motion          PASS — motion · overlays fade · plates ease · 83 keyframes closed
  ok    fixes           PASS — fixes · 52 assertions
  ok    metadata        PASS — metadata · 24 assertions · verses=776 sites=46 arcs=5 relics=46 passages=27 books=66
  ok    coffee pilgrim  PASS — coffee pilgrimage · all 38 assertions passed
  ok    e2e elements    PASS — e2e game elements · all 52 assertions passed

all 36 suites passed
```
