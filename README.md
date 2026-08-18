# Complete the Verse

Static King James Bible memory ordeal and geographical pilgrimage from Ur to Patmos.

---

## How to Play

- **Direct in browser**: Open [`index.html`](./index.html) in any modern web browser (`file://` works without a server).
- **Local dev server**: Run `npm start` or `node scripts/dev-server.js`, then navigate to `http://localhost:8781`.

---

## How to Test

Run the full automated test suite (36 suites):

```bash
npm test
# or
node test.js
```

---

## Architecture & Mental Model

The codebase is built with zero build step, zero bundler, and zero TypeScript. It executes directly in browsers from `file://` via classic `<script>` tags.

```
Bank (verses.js, bank.js)
  ↳ Learning Model (srs.js, recall.js, assemble.js)
    ↳ The Road (pilgrimage.js, sites.js, geo.js)
      ↳ Map & Atmosphere (atlas.js, live.js, audio.js, cinematic.js)
        ↳ Run Orchestration (game.js, play.js, flow.js, results.js)
          ↳ index.html
```

---

## Documentation

- [`docs/DEVELOPER-GUIDE.md`](./docs/DEVELOPER-GUIDE.md) — Comprehensive technical reference, script load order, and testing guide.
- [`docs/CODE-ORGANISATION.md`](./docs/CODE-ORGANISATION.md) — Codebase organisation principles and findings.
- [`docs/BACKEND.md`](./docs/BACKEND.md) — Supabase backend runbook and edge functions.
- [`docs/architecture.html`](./docs/architecture.html) — Visual architectural overview.
- [`plans/coffee-pilgrimage.md`](./plans/coffee-pilgrimage.md) — Coffee Pilgrimage product specification.
