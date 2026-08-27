# Thermo-nuclear judo (follow-up)

**Date:** 2026-08-27  
**Plans honoured:** [`docs/CODE-ORGANISATION.md`](../CODE-ORGANISATION.md), [`plans/code-organisation-fix.md`](../../plans/code-organisation-fix.md)  
**Not done:** nested `js/` folders; split of `pilgrimage.js` / `sites.js` / `atlas.js`.

## What changed

| Delete / unify | Where |
|---|---|
| One `runPhase()` for advance and wipe | `js/play.js` + `wipeContext` in `js/game.js` |
| One `applyCorrect` / `applyMiss` (Judgement sets `srs` via existing `resolveAnswer` path only; TF still skips `recordVerse`) | `js/play.js` |
| Dead global `showJudgeBurst` | removed from `game.js`; live copy stays in `Director` |
| Dual mechanic index | `verseMechanicIndex` only |
| `Flow.judgeMs` identity wrapper | `Flow.JUDGE_MS` only |
| Copied XP/rank formulas | `Meta.xpNeeded` / `levelInfo` / `rankFor` |
| `Cinematic.event` else-branches | stamp / collapse / overdrive go through `event` |

Organisation Phase 8 (folder maps, Next.js stub delete, `docs/CONTEXT.md`) is unchanged and still uncommitted unless you ask.

## Verification

`npm run lint` · `node test.js`
