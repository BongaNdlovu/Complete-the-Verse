# `supabase/` — optional backend

The game boots and plays with no project configured. This folder is the schema and the trusted score path when cloud is on.

| Path | Role |
|---|---|
| `migrations/` | Postgres + RLS |
| `functions/submit-score/` | Edge function: clamps, rate limit, auth |

Runbook: [`docs/BACKEND.md`](../docs/BACKEND.md). Evaluation: [`docs/BACKEND-EVALUATION.md`](../docs/BACKEND-EVALUATION.md).
