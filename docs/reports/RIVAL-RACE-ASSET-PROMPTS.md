# Rival Race Asset Specifications and Production Report

## 1. Generated Asset Roster

All three transparent rival assets were generated and processed with 512×512 master resolution, RGBA 8-bit true alpha channels (PNG color type 6), safe padding, and compact file sizes under 600 KB:

| Asset Path | Subject / Visual Role | Dimensions | Color Type | File Size | Format |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [`assets/rival/shadow-pursuer.png`](../../assets/rival/shadow-pursuer.png) | Synthetic baseline opponent (The Pursuer) | 512×512 | RGBA (Type 6) | 214.8 KB | PNG |
| [`assets/rival/previous-pilgrim.png`](../../assets/rival/previous-pilgrim.png) | Local and cloud ghost previous runs | 512×512 | RGBA (Type 6) | 337.7 KB | PNG |
| [`assets/rival/rival-mask.png`](../../assets/rival/rival-mask.png) | Threat mask (2+ consecutive misses & retreat) | 512×512 | RGBA (Type 6) | 304.9 KB | PNG |

---

## 2. Prompts Used for Generation

### 1. `assets/rival/shadow-pursuer.png`
```text
A translucent biblical shadow pursuer, hooded traveler silhouette, cracked crimson lantern with glowing red fire, dark cinematic character, gold and deep-red lighting, isolated on solid pure white background, studio character cutout, centered full body
```

### 2. `assets/rival/previous-pilgrim.png`
```text
A ghostly previous pilgrim racing ahead on an illuminated ancient road, flowing robe, spectral blue-gold aura, biblical thriller atmosphere, solid white background for cutout, isolated subject
```

### 3. `assets/rival/rival-mask.png`
```text
Close-up of a threatening rival pilgrim mask with glowing eyes and weathered bronze details, dramatic red rim light, isolated on pure solid white background, clean centered object
```

---

## 3. Runtime Integration & Source Mapping

The assets are wired via `RIVAL_ASSETS` and `rivalAssetPath()` in `js/game.js`:

```javascript
const RIVAL_ASSETS = Object.freeze({
  pursuer: "assets/rival/shadow-pursuer.png",
  pilgrim: "assets/rival/previous-pilgrim.png",
  threat: "assets/rival/rival-mask.png"
});

function rivalAssetPath(source, misses) {
  if (Number(misses) >= 2) return RIVAL_ASSETS.threat;
  return source === "pursuer" ? RIVAL_ASSETS.pursuer : RIVAL_ASSETS.pilgrim;
}
```

- **HUD Figure Rendering**:
  - Image is layered above the CSS fallback glyph `<span>◈</span>`.
  - `onerror="this.remove()"` gracefully reverts to the fallback glyph if image loading fails.
- **Results Screen**:
  - Displays `rival-mask.png` when a retreat is recorded (`R.rivalSetback === true`).
  - Retains the safety message: *"Permanent relics and cleared sites are safe."*

---

## 4. Verification Evidence

- **Automated Contracts**: `node test/rival-race.test.js` passed **52/52 contracts**.
- **Production Readiness**: `node test/production-readiness.test.js` passed all contracts.
- **Master Runner**: `node test.js` passed **46/46 test suites**.
- **Local Server**: HTTP 200 with `Content-Type: image/png` verified for all three `/assets/rival/*.png` routes.
- **Live Browser Acceptance**: Real headless Chrome browser automated testing confirmed dynamic HUD rendering, pressure state swaps, reduced motion handling, and results screen retreat display.
