-- Bounds on client-written ghost rows (rival ghosts + live race state).
--
-- run_ghosts stays writable by authenticated clients because friend races
-- upsert it every 3 seconds (js/game.js startFriendRacePolling) and the
-- submit-score rate limit would break them. The payload can no longer be
-- unbounded, though: a client used to be able to push a 500,000 score or an
-- arbitrarily large timeline/meta straight through PostgREST.

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
  if char_length(new.run_key) < 1 or char_length(new.run_key) > 64 then
    raise exception 'run_ghosts.run_key length';
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

drop trigger if exists run_ghosts_guard on public.run_ghosts;
create trigger run_ghosts_guard
  before insert or update on public.run_ghosts
  for each row execute function public.guard_run_ghost();

revoke all on function public.guard_run_ghost() from public;
revoke all on function public.guard_run_ghost() from anon, authenticated;

notify pgrst, 'reload schema';
