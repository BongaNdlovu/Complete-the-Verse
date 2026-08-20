-- Trusted leaderboard operations: rate limits, abuse reports, and recovery.
-- Apply after 003_score_constraints.sql. Safe to re-run.

create table if not exists public.score_submission_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('daily', 'blitz')),
  created_at timestamptz not null default now()
);

create index if not exists score_submission_log_user_time_idx
  on public.score_submission_log (user_id, created_at desc);

grant select, insert on table public.score_submission_log to authenticated, service_role;

alter table public.score_submission_log enable row level security;

drop policy if exists "users read own score submission log" on public.score_submission_log;
create policy "users read own score submission log"
  on public.score_submission_log for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users create own score submission log" on public.score_submission_log;
create policy "users create own score submission log"
  on public.score_submission_log for insert
  to authenticated
  with check (auth.uid() = user_id);

revoke update, delete on table public.score_submission_log from anon, authenticated;

create table if not exists public.leaderboard_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  board text not null check (board in ('daily', 'blitz')),
  score_id uuid not null,
  reason text not null check (char_length(reason) between 8 and 500),
  status text not null default 'pending'
    check (status in ('pending', 'reviewing', 'dismissed', 'removed')),
  moderator_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create unique index if not exists leaderboard_reports_dedupe_idx
  on public.leaderboard_reports (reporter_id, board, score_id);

create index if not exists leaderboard_reports_queue_idx
  on public.leaderboard_reports (status, created_at);

grant select, insert on table public.leaderboard_reports to authenticated, service_role;

alter table public.leaderboard_reports enable row level security;

drop policy if exists "users read own leaderboard reports" on public.leaderboard_reports;
create policy "users read own leaderboard reports"
  on public.leaderboard_reports for select
  to authenticated
  using (auth.uid() = reporter_id);

drop policy if exists "users create leaderboard reports" on public.leaderboard_reports;
create policy "users create leaderboard reports"
  on public.leaderboard_reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

revoke update, delete on table public.leaderboard_reports from anon, authenticated;
revoke update, delete on table public.score_submission_log from anon, authenticated;

notify pgrst, 'reload schema';
