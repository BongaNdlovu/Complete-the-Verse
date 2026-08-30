# `js/` — runtime modules

Loaded as classic `<script>` tags from `index.html`. Globals are intentional (`file://`, no bundler). Do not convert these to ES modules.

**Where to look**

| If you need… | Open |
|---|---|
| Save, modes, `go()`, `startRun` | `game.js` |
| Timer, next question, answering, life loss | `play.js` (`runPhase`, `applyCorrect` / `applyMiss`) |
| End-of-run score, XP, results view | `results.js` |
| Settings, player card, study, relics | `panels.js` |
| Boot, menu, site brief, tutorial | `briefs.js` |
| Campaign rules (unlock, clocks, pools) | `pilgrimage.js` |
| Leaflet map, dossier, traveler | `atlas.js` |
| Typed grader | `recall.js` |
| SM-2 scheduler | `srs.js` |
| Optional Supabase client | `cloud.js` + `cloud-config.js` |
| Unexpected errors / copy diagnostics | `diag.js` |

**Kinds (keep files here — do not nest folders)**

- **Data:** `verses.js`, `verses-extra.js`, `verses-more.js`, `verses-ascent.js`, `verses-tf.js`, `verses-notes.js`, `passages.js`, `legacy-ids.js`, `sites.js`, `empires.js`, `characters.js`, `beat.js`, `tablets.js`
- **Pure rules:** `bank.js`, `srs.js`, `recall.js`, `assemble.js`, `meta.js`, `flow.js`, `geo.js`, `pilgrimage.js`, `polish.js`, `artifacts.js`, `live.js`
- **View:** `atlas.js`
- **Engine (also listed in `scripts/engine-source.js`):** `util.js` → `audio.js` → `director.js` → `setpieces.js` → `viz.js` → `typed.js` → `rewards.js` → `sequences.js` → `panels.js` → `cinematic.js` → `results.js` → `diag.js` → `briefs.js` → `play.js` → `game.js`

`js/tablets-run.js` loads after `play.js` and is not an engine module. Load order is pinned by `index.html` and `engine-modules.test.js`. Adding an engine file means adding it to **both** `index.html` and `scripts/engine-source.js`.

Full map: [`docs/DEVELOPER-GUIDE.md`](../docs/DEVELOPER-GUIDE.md) §2–§3.
