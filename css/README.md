# `css/` — stylesheets

Loaded from `index.html` in this order: `game.css` → `play.css` → `atlas.css`.

| File | Owns |
|---|---|
| `game.css` | Tokens, film layers, intro, boot, menu, brief, act, results, panels, settings, shared buttons |
| `play.css` | `#v-play`, HUD, verse stage, options, timer ring, typed/assemble, set-piece, overdrive, pause, judge burst |
| `atlas.css` | Leaflet map, rail, dossier, traveler, atlas chrome |

A selector that is shared and ugly to split stays in `game.css`. Do not introduce a bundler or CSS modules.
