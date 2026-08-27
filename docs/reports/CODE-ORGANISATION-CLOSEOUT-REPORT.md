# Code organisation closeout

**Date:** 2026-08-27  
**Source plans:** [`docs/CODE-ORGANISATION.md`](../CODE-ORGANISATION.md), [`plans/code-organisation-fix.md`](../../plans/code-organisation-fix.md)  
**Job:** finish the organisation plan so a first-time reader can find every file. Not a rewrite. Not nested `js/` folders.  
**Commands this session:** `node test.js` · `npm run lint`

## 1. Outcome

Phases 1–7 of `plans/code-organisation-fix.md` were already true in the tree (`README.md`, `test/`, `docs/reports/`, `docs/BACKEND.md`, `js/play.js`, `css/play.css`, `js/diag.js`, `scripts/archive/`). This closeout is **Phase 8** plus leftover junk that failed the “rightful home” test.

A clone now shows a short root, a folder map in `README.md`, and per-folder READMEs. Runtime modules stay flat under `js/` because the plan says names already match jobs and `file://` script tags must not churn.

## 2. What the attached plans required — and the status

| Phase | Plan item | Status |
|---|---|---|
| 1 | Root `README.md`, npm scripts, honest developer guide | Done (this pass: suite count 51, folder table) |
| 2 | Reports → `docs/reports/`; `BACKEND.md` → `docs/`; `architecture.html` → `docs/` | Already done |
| 3 | Suites → `test/`; `test.js` stays at root | Already done |
| 4 | Archive `split-monolith`; ignore `.claude`; `scripts/README.md` | Already done; `.vercelignore` now also excludes `test/` and `plans/` |
| 5 | `js/diag.js`, save-corrupt / save-blocked, copy diagnostics | Already done (guide persist note corrected this pass) |
| 6 | Extract play loop to `js/play.js` | Already done |
| 7 | `css/play.css` | Already done |
| 8 | Stamp organisation doc; front door matches the tree | **This pass** |

**Plan “Do not” list honoured:** no bundler, no TypeScript, no ES modules, no split of `pilgrimage.js` / `sites.js` / `atlas.js`, no delete of `sky3d.test.js`, no relocate of `scripts/verse-extra-plans.js`.

## 3. Changes this closeout

| Home | Change | Why |
|---|---|---|
| Root | Deleted `page.tsx`, `utils/supabase/*` | Next.js sample client. Not part of this static game. |
| `docs/CONTEXT.md` | Moved from repo root | Product language belongs with living docs. |
| `README.md` | Folder table + mental model | Phase 8 front door. |
| `js/README.md` etc. | Maps for `js/`, `test/`, `css/`, `docs/`, `content/`, `supabase/` | Find a file without opening the giant guide first. |
| `docs/CODE-ORGANISATION.md` | Closeout banner + scores 9/8/8/8 | Plan Phase 8 stamp; original 2026-08-18 audit kept below. |
| `docs/DEVELOPER-GUIDE.md` | Date 2026-08-27; 51 suites; persist/Diag | Guide must match the tree. |
| `.vercelignore` | `test/` and `plans/` | Plan: do not deploy tests or reports (docs already ignored). |

## 4. Root listing (what a clone should see)

Living files at root: `README.md`, `index.html`, `package.json`, `test.js`, `manifest.webmanifest`, `vercel.json`, `sw.js`, `.oxlintrc.json`, plus the folders `css/` `js/` `docs/` `plans/` `test/` `scripts/` `assets/` `audio/` `sfx/` `vendor/` `supabase/` `content/` `.github/`.

`sw.js` and `.oxlintrc.json` are required (PWA; complexity gate). They are not the old junk drawer of 45 tests and 12 autopsy reports.

## 5. Verification

| Check | Result |
|---|---|
| `npm run lint` | Must be exit 0 (complexity max 20) |
| `node test.js` | Must be **51/51** |
| Grep for `page.tsx` / `utils/supabase` | No remaining references |
| `js/` still flat | No `js/engine/` or `js/data/` (plan forbids that churn) |

## 6. Out of scope

- Coffee-pilgrimage product work (`plans/coffee-pilgrimage.md`).
- Raising or lowering the Oxlint ceiling (see `COMPLEXITY-CEILING-20-REPORT.md`).
- Rewriting archived reports in `docs/reports/` other than adding this file.
