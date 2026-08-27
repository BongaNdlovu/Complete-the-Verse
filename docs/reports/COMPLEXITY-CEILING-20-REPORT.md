# Oxlint complexity ceiling of 20

**Date:** 2026-08-27  
**Commit:** `a0dce1a` (`chore(lint): ratchets Oxlint complexity to a global ceiling of 20`)  
**Plan / rule:** ongoing maintainability gate, not a one-shot cleanup. Classic McCabe via Oxlint `eslint/complexity`.  
**Commands this session:** `npx oxlint` · `npm run lint` · `node test.js`

## 1. Outcome

CI and local lint fail any function whose classic cyclomatic complexity is **21 or higher**. The ceiling is global (game, scripts, tests, edge function). Verse data packs stay ignored because they are data, not control flow.

Automated gate after the split: **`npm run lint` exit 0**. **`node test.js` — all 51 suites passed**.

## 2. Why 20

An earlier pass measured this repo’s real scores (the worst were `endRun` 184, `renderResults` 98, play keydown 90) and landed a first ceiling of 80 so the three 81+ functions could be split without grandfathering. 20 is the ratchet the team asked for next: a function that needs more branches should be named helpers, not a longer `if` chain.

`&&` `||` `??` ternary `if`/`for`/`case`/`catch` all count. Nested functions score separately, so extracting a sibling helper is the legal move.

## 3. Changes executed

| Area | What changed | Evidence |
|---|---|---|
| Config | `.oxlintrc.json` `complexity` `max: 20`, `variant: classic`; data packs ignored | `.oxlintrc.json` |
| CI | `npm ci` → `npm run lint` → `npm test` | `.github/workflows/ci.yml` |
| `endRun` | Context / score / persist / seals / habit / ghosts / cloud submit helpers | `js/results.js` |
| Play loop | TF pick/resolve, choices, backdrop video, timer, correct-answer celebrate | `js/play.js` |
| Orchestrator | `load`, `go`/`applyLeave`, `startRun`, HUD, wipe, overlay keys | `js/game.js` |
| Other modules | atlas walk/dossier, settings bind, `mergeSave`, pilgrimage `record`, director stamp, briefs hero, polish shape score, rewards `value` | matching `js/*.js` |
| Tooling | `build-verse-extra`, `verse-qa`, live Chrome runner, `submit-score` handler, Arc I verifier | `scripts/`, `supabase/functions/submit-score/`, `test/arc1-deep-verification.test.js` |
| Guide | Ceiling documented as 20, not 80 | `docs/DEVELOPER-GUIDE.md` |

No `eslint-disable` grandfathering. Behaviour was kept; this was structure.

## 4. Accuracy / scoring (unchanged by this pass)

Scoring, clocks, and graders were not retuned. Suites that pin end-of-run refund, true/false weighting, pilgrimage `record`, and cloud `mergeSave` stayed green, including `test/truefalse.test.js` (picker helpers now extracted with the function under test) and `test/fixes.test.js`.

## 5. How to keep the ceiling

1. `npm run lint` before `npm test`.
2. If Oxlint names a function, extract helpers — do not raise `max`.
3. Do not ignore `test/` or `scripts/` unless the team agrees; the rule is global on purpose.

## 6. Out of scope

- Nested `js/` folders (forbidden by the organisation plan; names already match jobs).
- Product / coffee-pilgrimage work.
- Live Chrome re-run of the clocks pass (that report is `CLOCKS-POWERS-RECALL-REPORT.md`).
