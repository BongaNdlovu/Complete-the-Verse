# `test/` — automated suites

Run them from the repo root: `npm test` or `node test.js`. Do not move `test.js` into this folder — that command is the public gate.

Every suite resolves the repo with `require("../scripts/repo-root")`. Engine concatenation goes through `scripts/engine-source.js`.

| Job | Suites |
|---|---|
| Verse bank / QA | `verse-qa`, `verses-more`, `verses-ascent` (+ `scripts/qa-verses.js` as the content gate) |
| Pure rules | `srs`, `recall`, `assemble`, `geo`, `pilgrimage`, `polish`, `flow`, `meta`, `rewards` |
| Play loop | `clocks-powers`, `question-mechanics`, `answering`, `truefalse`, `onboarding`, `beats` |
| Modes / campaign | `all-game-modes`, `arc1-deep-verification`, `coffee-pilgrimage`, `menu-modes` |
| Cloud / save | `cloud`, `diag`, `friend-race` |
| Views / chrome | `atlas`, `sites`, `ui-structure`, `mobile-layout`, `patriarchs-question-screen`, `motion` |
| Engine contract | `engine-modules`, `integration`, `game-structure`, `e2e-game-elements` |
| Production locks | `production-readiness`, `metadata`, `sky3d`, `fixes` |

Adding a suite: create `test/foo.test.js`, append a row to the `SUITE` array in root `test.js`. See [`docs/DEVELOPER-GUIDE.md`](../docs/DEVELOPER-GUIDE.md) §10.
