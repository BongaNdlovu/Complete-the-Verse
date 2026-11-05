-- The tip jar's numbers, kept by hand on the admin page (admin.html). Apply after 009. Safe to re-run.
--
-- Nothing here reads PayPal: the owner types in what has really arrived. One row holds the raised total and the
-- goal, anyone may read it (the menu's Tip Jar shows it), and only accounts in site_admins may change it.

create table if not exists public.tip_jar (
  id smallint primary key default 1,
  raised_usd numeric(10, 2) not null default 0,
  goal_usd numeric(10, 2) not null default 100,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint tip_jar_single_row check (id = 1),
  constraint tip_jar_raised_range check (raised_usd >= 0 and raised_usd <= 1000000),
  constraint tip_jar_goal_range check (goal_usd >= 1 and goal_usd <= 1000000)
);

insert into public.tip_jar (id) values (1) on conflict (id) do nothing;

-- Who changed it and when comes from the server, not from the request, so neither can be written by hand.
create or replace function public.touch_tip_jar()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists tip_jar_touch on public.tip_jar;
create trigger tip_jar_touch
  before insert or update on public.tip_jar
  for each row execute function public.touch_tip_jar();

revoke all on function public.touch_tip_jar() from public;
revoke all on function public.touch_tip_jar() from anon, authenticated;

alter table public.tip_jar enable row level security;

drop policy if exists "tip jar readable" on public.tip_jar;
create policy "tip jar readable"
  on public.tip_jar for select
  to anon, authenticated
  using (true);

drop policy if exists "owner update tip jar" on public.tip_jar;
create policy "owner update tip jar"
  on public.tip_jar for update
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

-- Postgres checks table privileges before RLS, so these grants are what make the policy reachable.
-- Supabase gives every new table all privileges for anon and authenticated by default, including TRUNCATE (which
-- row-level security does not cover), so everything is taken away first and only what is needed is given back.
-- There is no insert or delete for clients: the one row is created above.
revoke all on table public.tip_jar from anon, authenticated;
grant select on table public.tip_jar to anon, authenticated, service_role;
grant update (raised_usd, goal_usd) on table public.tip_jar to authenticated;
grant insert, update on table public.tip_jar to service_role;

notify pgrst, 'reload schema';
