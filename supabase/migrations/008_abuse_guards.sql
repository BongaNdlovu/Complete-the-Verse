-- Abuse guards from the 2026-11 backend audit. Apply after 007_run_ghosts_guard.sql. Safe to re-run.
--
-- 1. run_ghosts: a signed-in client could still write unlimited rows (own-row
--    RLS, a client-chosen run_key, up to ~128 KB of timeline each). Row counts
--    are now capped per user and the key formats are fixed.
-- 2. saves: 007 guarded ghosts but not the cloud save, which the client pushes
--    as one blob. The blob is now capped at 1 MiB.
-- 3. score_submission_log: one row per submission, rejected ones included,
--    forever. Rows older than 30 days are pruned daily.

-- ---------------------------------------------------------------------------
-- 1. run_ghosts: key formats and a per-user row cap
-- ---------------------------------------------------------------------------
-- Keys the game really writes: modes trial / pilgrimage / blitz / live; run keys
-- "campaign", "blitz", "site:<id>", a five-character room code, and the
-- "<edition>~<key>" form of the old daily ghosts.

create or replace function public.guard_run_ghost()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  samples int;
begin
  if char_length(new.mode) < 1 or char_length(new.mode) > 32 then
    raise exception 'run_ghosts.mode length';
  end if;
  if new.mode !~ '^[a-z][a-z0-9-]*$' then
    raise exception 'run_ghosts.mode format';
  end if;
  if char_length(new.run_key) < 1 or char_length(new.run_key) > 64 then
    raise exception 'run_ghosts.run_key length';
  end if;
  if new.run_key !~ '^[A-Za-z0-9:~._-]+$' then
    raise exception 'run_ghosts.run_key format';
  end if;
  if new.best_score < 0 or new.best_score > 500000 then
    raise exception 'run_ghosts.best_score range';
  end if;
  if jsonb_typeof(new.timeline) <> 'object' then
    raise exception 'run_ghosts.timeline shape';
  end if;
  if new.timeline ? 'samples' then
    if jsonb_typeof(new.timeline -> 'samples') <> 'array' then
      raise exception 'run_ghosts.timeline samples shape';
    end if;
    samples := jsonb_array_length(new.timeline -> 'samples');
    if samples > 2000 then
      raise exception 'run_ghosts.timeline samples';
    end if;
  end if;
  if pg_column_size(new.timeline) > 131072 then
    raise exception 'run_ghosts.timeline size';
  end if;
  if jsonb_typeof(new.meta) <> 'object' then
    raise exception 'run_ghosts.meta shape';
  end if;
  if pg_column_size(new.meta) > 8192 then
    raise exception 'run_ghosts.meta size';
  end if;
  return new;
end;
$$;

-- Deletes a user's oldest ghosts beyond the cap instead of rejecting the new one,
-- because every Pilgrimage site and every friend-race room is a new key and a
-- long-time player must keep saving ghosts. SECURITY DEFINER because clients
-- have no DELETE grant. The row just written always survives, so a device with a
-- wrong clock cannot delete its own new ghost.
create or replace function public.trim_run_ghosts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  per_mode_cap int;
  total_cap constant int := 100;
begin
  per_mode_cap := case new.mode when 'pilgrimage' then 64 else 8 end;

  delete from public.run_ghosts
  where id in (
    select id from public.run_ghosts
    where user_id = new.user_id and mode = new.mode
    order by (id = new.id) desc, updated_at desc, id desc
    offset per_mode_cap
  );

  delete from public.run_ghosts
  where id in (
    select id from public.run_ghosts
    where user_id = new.user_id
    order by (id = new.id) desc, updated_at desc, id desc
    offset total_cap
  );

  return null;
end;
$$;

drop trigger if exists run_ghosts_trim on public.run_ghosts;
create trigger run_ghosts_trim
  after insert on public.run_ghosts
  for each row execute function public.trim_run_ghosts();

revoke all on function public.trim_run_ghosts() from public;
revoke all on function public.trim_run_ghosts() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. saves: a size guard on the cloud save blob
-- ---------------------------------------------------------------------------
-- A save with a spaced-repetition card for every one of the 1,493 verses in the
-- banks measures about 224 KB as JSON text, so 1 MiB leaves a heavy player room
-- to grow while stopping a scripted account from storing megabytes per row.

create or replace function public.guard_save_payload()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(new.payload) <> 'object' then
    raise exception 'saves.payload shape';
  end if;
  if pg_column_size(new.payload) > 1048576 then
    raise exception 'saves.payload size';
  end if;
  return new;
end;
$$;

drop trigger if exists saves_guard on public.saves;
create trigger saves_guard
  before insert or update on public.saves
  for each row execute function public.guard_save_payload();

revoke all on function public.guard_save_payload() from public;
revoke all on function public.guard_save_payload() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. score_submission_log: prune after 30 days
-- ---------------------------------------------------------------------------
-- The rate limit looks back 10 minutes and the weekly audit 24 hours, so 30 days
-- is generous.

create index if not exists score_submission_log_created_idx
  on public.score_submission_log (created_at);

create or replace function public.prune_score_submission_log()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.score_submission_log
  where created_at < now() - interval '30 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.prune_score_submission_log() from public;
revoke all on function public.prune_score_submission_log() from anon, authenticated;

-- Runs daily when pg_cron is available (Supabase has it; enable it under
-- Database -> Extensions). Without it the migration still applies: run
-- `select public.prune_score_submission_log();` by hand now and then.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule(
      'prune-score-submission-log',
      '17 3 * * *',
      'select public.prune_score_submission_log()'
    );
  else
    raise notice 'pg_cron is not available: schedule public.prune_score_submission_log() yourself';
  end if;
exception when others then
  raise notice 'pg_cron schedule skipped: %', sqlerrm;
end;
$$;

notify pgrst, 'reload schema';
