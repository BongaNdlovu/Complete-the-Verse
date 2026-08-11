-- Complete the Verse — cloud save, leaderboards, ghosts
-- Project: eanjhcktflbpbjkdjtej
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
