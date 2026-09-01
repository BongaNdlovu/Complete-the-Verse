-- Complete the Verse — Combined Supabase Migrations (001 to 005)
-- Target Project: fgwfniblkuozxlbgytfk

-- ==========================================
-- FILE: 001_complete_the_verse.sql
-- ==========================================
-- Complete the Verse — cloud save, leaderboards, ghosts
-- Project: fgwfniblkuozxlbgytfk
-- Apply in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Safe to re-run (idempotent where possible).

-- ---------------------------------------------------------------------------
-- Extensions (optional; PG13+ has gen_random_uuid in core)
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_len check (char_length(display_name) between 2 and 32)
);

create unique index if not exists profiles_display_name_lower_idx
  on public.profiles (lower(display_name));

-- ---------------------------------------------------------------------------
-- saves (one cloud blob per user)
-- ---------------------------------------------------------------------------
create table if not exists public.saves (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1,
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- daily_scores
-- ---------------------------------------------------------------------------
create table if not exists public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  play_date date not null,
  score integer not null default 0,
  accuracy numeric(5,2) not null default 0,
  duration_ms integer,
  diff text not null default 'watchman',
  created_at timestamptz not null default now(),
  constraint daily_scores_user_date unique (user_id, play_date)
);

create index if not exists daily_scores_board_idx
  on public.daily_scores (play_date, score desc);

-- ---------------------------------------------------------------------------
-- blitz_scores
-- ---------------------------------------------------------------------------
create table if not exists public.blitz_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  score integer not null default 0,
  survived_ms integer not null default 0,
  diff text not null default 'watchman',
  created_at timestamptz not null default now()
);

create index if not exists blitz_scores_board_idx
  on public.blitz_scores (score desc, survived_ms desc);

-- ---------------------------------------------------------------------------
-- run_ghosts (async rivals + personal bests)
-- ---------------------------------------------------------------------------
create table if not exists public.run_ghosts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null,
  run_key text not null,
  best_score integer not null default 0,
  timeline jsonb not null default '{"version":1,"samples":[]}'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint run_ghosts_user_mode_key unique (user_id, mode, run_key)
);

create index if not exists run_ghosts_lookup_idx
  on public.run_ghosts (mode, run_key, best_score desc);

-- ---------------------------------------------------------------------------
-- Auto profile + empty save on signup
-- security definer + empty search_path (Supabase-recommended)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    'Pilgrim-' || upper(substr(replace(new.id::text, '-', ''), 1, 4))
  );
  -- Clamp to check constraint (2–32 chars)
  if char_length(base) < 2 then
    base := 'Pilgrim';
  end if;
  candidate := left(base, 32);

  while exists (
    select 1 from public.profiles p where lower(p.display_name) = lower(candidate)
  ) loop
    n := n + 1;
    candidate := left(base, 28) || '-' || n::text;
  end loop;

  insert into public.profiles (id, display_name)
  values (new.id, candidate)
  on conflict (id) do nothing;

  insert into public.saves (user_id, payload, revision)
  values (new.id, '{}'::jsonb, 1)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep server_updated_at fresh on save updates.
-- INVOKER is enough: the caller already passed RLS to update their own row.
create or replace function public.touch_save_server_time()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.server_updated_at := now();
  return new;
end;
$$;

drop trigger if exists saves_touch on public.saves;
create trigger saves_touch
  before update on public.saves
  for each row execute procedure public.touch_save_server_time();

-- ---------------------------------------------------------------------------
-- Grants (required for PostgREST / anon + authenticated roles)
-- RLS still enforces row access on top of these.
-- ---------------------------------------------------------------------------
grant usage on schema public to postgres, anon, authenticated, service_role;

grant select on table public.profiles to anon, authenticated, service_role;
grant update on table public.profiles to authenticated, service_role;
grant insert on table public.profiles to service_role;

grant select, insert, update on table public.saves to authenticated, service_role;

grant select on table public.daily_scores to anon, authenticated, service_role;
grant insert, update on table public.daily_scores to authenticated, service_role;

grant select on table public.blitz_scores to anon, authenticated, service_role;
grant insert on table public.blitz_scores to authenticated, service_role;

grant select on table public.run_ghosts to anon, authenticated, service_role;
grant insert, update on table public.run_ghosts to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.saves enable row level security;
alter table public.daily_scores enable row level security;
alter table public.blitz_scores enable row level security;
alter table public.run_ghosts enable row level security;

-- profiles
drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- saves: own only
drop policy if exists "users read own save" on public.saves;
create policy "users read own save"
  on public.saves for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users insert own save" on public.saves;
create policy "users insert own save"
  on public.saves for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users update own save" on public.saves;
create policy "users update own save"
  on public.saves for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- daily_scores
drop policy if exists "daily scores readable" on public.daily_scores;
create policy "daily scores readable"
  on public.daily_scores for select
  to anon, authenticated
  using (true);

drop policy if exists "users write own daily" on public.daily_scores;
create policy "users write own daily"
  on public.daily_scores for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users update own daily" on public.daily_scores;
create policy "users update own daily"
  on public.daily_scores for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- blitz_scores
drop policy if exists "blitz scores readable" on public.blitz_scores;
create policy "blitz scores readable"
  on public.blitz_scores for select
  to anon, authenticated
  using (true);

drop policy if exists "users write own blitz" on public.blitz_scores;
create policy "users write own blitz"
  on public.blitz_scores for insert
  to authenticated
  with check (auth.uid() = user_id);

-- run_ghosts
drop policy if exists "ghosts readable" on public.run_ghosts;
create policy "ghosts readable"
  on public.run_ghosts for select
  to anon, authenticated
  using (true);

drop policy if exists "users insert own ghosts" on public.run_ghosts;
create policy "users insert own ghosts"
  on public.run_ghosts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users update own ghosts" on public.run_ghosts;
create policy "users update own ghosts"
  on public.run_ghosts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Lock down trigger helpers (Supabase linter 0028 / 0029)
-- Default is EXECUTE for PUBLIC, which exposes SECURITY DEFINER via /rest/v1/rpc.
-- Triggers still run as the function owner; clients must not call these as RPC.
-- ---------------------------------------------------------------------------
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
revoke all on function public.touch_save_server_time() from public;
revoke all on function public.touch_save_server_time() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Refresh PostgREST schema cache (fixes API 404 right after create)
-- ---------------------------------------------------------------------------
notify pgrst, 'reload schema';


-- ==========================================
-- FILE: 002_lock_trigger_functions.sql
-- ==========================================
-- Fix Supabase linter WARN: SECURITY DEFINER functions executable by anon/authenticated
-- Safe to run alone if 001 already applied.
-- Lints: 0028_anon_security_definer_function_executable
--        0029_authenticated_security_definer_function_executable

-- Timestamp trigger does not need elevated privileges
create or replace function public.touch_save_server_time()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.server_updated_at := now();
  return new;
end;
$$;

-- Signup trigger must stay DEFINER (inserts profiles/saves during auth.users insert)
-- but must NOT be callable as RPC by clients
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    'Pilgrim-' || upper(substr(replace(new.id::text, '-', ''), 1, 4))
  );
  if char_length(base) < 2 then
    base := 'Pilgrim';
  end if;
  candidate := left(base, 32);

  while exists (
    select 1 from public.profiles p where lower(p.display_name) = lower(candidate)
  ) loop
    n := n + 1;
    candidate := left(base, 28) || '-' || n::text;
  end loop;

  insert into public.profiles (id, display_name)
  values (new.id, candidate)
  on conflict (id) do nothing;

  insert into public.saves (user_id, payload, revision)
  values (new.id, '{}'::jsonb, 1)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
revoke all on function public.touch_save_server_time() from public;
revoke all on function public.touch_save_server_time() from anon, authenticated;

notify pgrst, 'reload schema';


-- ==========================================
-- FILE: 003_score_constraints.sql
-- ==========================================
-- Soft anti-cheat ceilings for leaderboard tables (client also clamps).

alter table public.daily_scores
  drop constraint if exists daily_scores_score_nonneg;
alter table public.daily_scores
  add constraint daily_scores_score_nonneg check (score >= 0 and score <= 500000);

alter table public.daily_scores
  drop constraint if exists daily_scores_accuracy_range;
alter table public.daily_scores
  add constraint daily_scores_accuracy_range check (accuracy >= 0 and accuracy <= 100);

alter table public.daily_scores
  drop constraint if exists daily_scores_duration_range;
alter table public.daily_scores
  add constraint daily_scores_duration_range
  check (duration_ms is null or (duration_ms >= 0 and duration_ms <= 7200000));

alter table public.blitz_scores
  drop constraint if exists blitz_scores_score_nonneg;
alter table public.blitz_scores
  add constraint blitz_scores_score_nonneg check (score >= 0 and score <= 10000);

alter table public.blitz_scores
  drop constraint if exists blitz_scores_survived_range;
alter table public.blitz_scores
  add constraint blitz_scores_survived_range
  check (survived_ms >= 0 and survived_ms <= 7200000);

alter table public.run_ghosts
  drop constraint if exists run_ghosts_score_nonneg;
alter table public.run_ghosts
  add constraint run_ghosts_score_nonneg check (best_score >= 0 and best_score <= 500000);

notify pgrst, 'reload schema';


-- ==========================================
-- FILE: 004_leaderboard_moderation.sql
-- ==========================================
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


-- ==========================================
-- FILE: 005_edge_only_scores.sql
-- ==========================================
-- Score writes go only through submit-score (service role).
-- Apply after 004_leaderboard_moderation.sql. Safe to re-run.

drop policy if exists "users write own daily" on public.daily_scores;
drop policy if exists "users update own daily" on public.daily_scores;
drop policy if exists "users write own blitz" on public.blitz_scores;

revoke insert, update, delete on table public.daily_scores from anon, authenticated;
revoke insert, update, delete on table public.blitz_scores from anon, authenticated;

grant select on table public.daily_scores to anon, authenticated, service_role;
grant insert, update on table public.daily_scores to service_role;
grant select on table public.blitz_scores to anon, authenticated, service_role;
grant insert on table public.blitz_scores to service_role;

drop policy if exists "users create own score submission log" on public.score_submission_log;
revoke insert, update, delete on table public.score_submission_log from anon, authenticated;
grant select, insert on table public.score_submission_log to service_role;

notify pgrst, 'reload schema';


