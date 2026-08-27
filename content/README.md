# `content/` — verse QA data

Not loaded by the browser. Used by `scripts/qa-verses.js` and related tooling.

| File | Role |
|---|---|
| `quarantine.json` | Verses the QA gate has set aside |
| `QUARANTINE.md` | How quarantine is applied |
| `legacy-order.json` | Snapshot for the v2 → v3 id map |

Runtime verse packs stay in `js/verses*.js` because they must load from `file://` with no build step.
