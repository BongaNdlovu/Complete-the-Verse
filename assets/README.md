# Complete the Verse — Asset Specifications & Sprite Contracts

## Sprite Sheets & Animations

### 1. Scholar walkers (`assets/characters/<id>/walk.png`)
- **Total Dimensions**: 2152 × 479 px
- **Frames**: 8
- **Cell Dimensions**: 269 × 479 px per frame (Aspect ratio ~1:1.78)
- **Rendered Size in UI**: 40px width × 72px height
- **CSS Animation**: `steps(7)` from `background-position: 0 0` to `-280px 0` with `background-size: 320px 72px`.
- Each of the 8 scholars has a matching `idle.png` (269 × 479). `assets/traveler/` is the fallback sheet.

### 2. Traveler Idle fallback (`assets/traveler/idle.png`)
- **Total Dimensions**: 269 × 479 px (1 frame)
- **Rendered Size in UI**: 40px width × 72px height (`background-size: contain`)

### 3. Judge Bursts (`assets/judge/up.webp` and `assets/judge/down.webp`)
- **Total Dimensions**: 4096 × 944 px
- **Frames**: 8
- **Cell Dimensions**: 512 × 944 px per frame (Aspect ratio ~1:1.84)
- **Rendered Size in UI**: `--cell-h: min(100vh, 148vw); --cell-w: calc(var(--cell-h) * 512 / 944);`
- **CSS Animation**: `steps(7)` forwards from `0 0` to `calc(var(--cell-w) * -7) 0` with `background-size: calc(var(--cell-w) * 8) var(--cell-h)`.

---

## Static Artwork Dimensions

- **Artifact Relics (`assets/artifacts/*.png`)**: 512 × 512 px max, optimized PNG
- **Character Portraits (`assets/characters/<id>/portrait.png`)**: 512 × 512 px max, optimized PNG
- **Character Tokens (`assets/characters/<id>/token.png`)**: 128 × 128 px max, optimized PNG
- **Scholar walkers (`assets/characters/<id>/{idle,walk}.png`)**: idle 269 × 479; walk 2152 × 479 (8 cells)
- **Intro & Hall Videos (`assets/intro.mp4`, `assets/hall.mp4`)**: 1080p H.264, baseline audio stream
- **Valley prologue (`assets/beats/goliath/prologue.mp4`)**: 1080p H.264 `yuv420p` + AAC, CRF 20, `+faststart`, under 20MB. Same `<video id="ur-prologue-video">` as Ur/Team.
- **PWA icons**: `assets/icon-192.png`, `assets/icon-512.png`, `assets/icon-maskable-512.png` (from the lamp seal)

## Payload budget

First interactive screen should not wait on Story Beat films or journey loops. Those load when requested.

| Class | Cap |
|---|---|
| Valley prologue film | 20 MB (test-enforced) |
| Journey still (active WebP) | 220 KB |
| Character question art | 1.5 MB |
| Music bed | 10 MB |
| SFX sample | 200 KB |

Do not precache Beat stills, films, or `/audio/`. Measure Lighthouse on a mid-tier 4G profile after each media drop.
