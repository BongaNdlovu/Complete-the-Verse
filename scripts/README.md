# Developer & Tooling Scripts

This directory contains development servers, QA tools, and data generators for Complete the Verse.

---

## Interactive / Tooling Scripts

- [`dev-server.js`](./dev-server.js) — Lightweight HTTP static server for local playtesting on port 8781 (`npm start`).
- [`qa-verses.js`](./qa-verses.js) — Verse bank QA validator enforcing word-count, punctuation, and distractor integrity.
- [`verse-stats.js`](./verse-stats.js) — Verse distribution and corpus coverage statistics.
- [`load-bank.js`](./load-bank.js) — Headless verse bank loader for Node test suites.
- [`load-atlas.js`](./load-atlas.js) — Headless Leaflet/DOM stub loader for map test suites.
- [`test-shim.js`](./test-shim.js) — Minimal VM sandbox DOM shim for integration and e2e testing without `jsdom`.
- [`repo-root.js`](./repo-root.js) — Single source of truth for resolving repository root path across tests.
- [`engine-source.js`](./engine-source.js) — Canonical definition and loader for the engine script list (`ENGINE_FILES`).

---

## Build / Data Generators

- [`gen-plans.js`](./gen-plans.js) — Generates plan artifacts from verse data.
- [`build-verse-extra.js`](./build-verse-extra.js) — Compiles generated verses into `js/verses-extra.js`. Reads `scripts/verse-extra-plans.js`.
- [`verse-extra-plans.js`](./verse-extra-plans.js) — Generated build input for `build-verse-extra.js`.
- [`export-content.mjs`](./export-content.mjs) — Writes `shared/content/*.json` from the JS verse, site, and tablet banks (`npm run content:export`). `--check` fails if the committed JSON is stale (`npm run content:check`).

---

## Archive

- [`archive/`](./archive/) — Historical one-off migration tools.
