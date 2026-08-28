# Complete the Verse

Static King James Bible memory ordeal and geographical pilgrimage from Ur to Patmos.

There is no bundler and no TypeScript. Classic `<script>` tags and globals are on purpose so `file://` keeps working.

---

## How to play

- Open [`index.html`](./index.html) in a modern browser (`file://` needs no server).
- Or run `npm start` / `node scripts/dev-server.js` and open `http://localhost:8781`.

## How to test and lint

```bash
npm test          # node test.js — 52 suites
npm run lint      # Oxlint cyclomatic complexity, max 20
```

## Where things live

A stranger should only need this table, then [`docs/DEVELOPER-GUIDE.md`](./docs/DEVELOPER-GUIDE.md).

| Path | What it is |
|---|---|
| `index.html` | The single page. Every screen is a `<section class="view">`. |
| `sw.js` | Service worker for offline play. |
| `js/` | Runtime modules. Names match jobs. Map: [`js/README.md`](./js/README.md). |
| `css/` | Hall (`game.css`), play (`play.css`), atlas (`atlas.css`). |
| `assets/` `audio/` `sfx/` | Art, music beds, voice, effects. |
| `vendor/` | Leaflet + supabase-js. Never a CDN. |
| `content/` | Verse QA data (quarantine). Tooling only. |
| `scripts/` | Dev server, QA, generators. Map: [`scripts/README.md`](./scripts/README.md). |
| `test.js` | Public test gate. Suites live in `test/`. |
| `test/` | All `*.test.js` suites. Map: [`test/README.md`](./test/README.md). |
| `docs/` | Living docs. Snapshots in `docs/reports/`. |
| `plans/` | Product and smoke plans. |
| `supabase/` | Migrations + `submit-score` edge function. |

```
Bank (js/verses*.js, js/bank.js)
  ↳ Learning (js/srs.js, js/recall.js, js/assemble.js)
    ↳ The road (js/pilgrimage.js, js/sites.js, js/geo.js)
      ↳ Map (js/atlas.js)
        ↳ Optional cloud (js/cloud.js)
          ↳ Play loop (js/play.js) · save/modes/router (js/game.js)
            ↳ index.html
```

## Documentation

- [`docs/DEVELOPER-GUIDE.md`](./docs/DEVELOPER-GUIDE.md) — load order, module map, how to add a suite.
- [`docs/CODE-ORGANISATION.md`](./docs/CODE-ORGANISATION.md) — layout findings and closeout.
- [`docs/CONTEXT.md`](./docs/CONTEXT.md) — shared product language (journey, question screen, mechanic).
- [`docs/BACKEND.md`](./docs/BACKEND.md) — Supabase runbook.
- [`docs/architecture.html`](./docs/architecture.html) — how the game *plays*, not a code map.
- [`plans/coffee-pilgrimage.md`](./plans/coffee-pilgrimage.md) — product specification.
- [`docs/reports/`](./docs/reports/) — dated snapshots. Trust tests + the developer guide for current truth.
