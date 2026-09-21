create table if not exists public.site_notices (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Notice',
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint site_notices_title_len check (char_length(title) between 1 and 120),
  constraint site_notices_body_len check (char_length(body) between 8 and 2000)
);

create index if not exists site_notices_active_idx
  on public.site_notices (active, created_at desc);

alter table public.site_notices enable row level security;

-- Who may publish notices. The identity lives here, not in policy text, so
-- ownership can change without a schema edit.
create table if not exists public.site_admins (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_admins enable row level security;

drop policy if exists "self read site admins" on public.site_admins;
create policy "self read site admins"
  on public.site_admins for select
  to authenticated
  using (user_id = auth.uid());

revoke insert, update, delete on table public.site_admins from anon, authenticated;
grant select on table public.site_admins to authenticated, service_role;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.site_admins where user_id = auth.uid());
$$;

revoke all on function public.is_site_admin() from public;
revoke all on function public.is_site_admin() from anon;
grant execute on function public.is_site_admin() to authenticated, service_role;

drop policy if exists "active site notices readable" on public.site_notices;
create policy "active site notices readable"
  on public.site_notices for select
  to anon, authenticated
  using (active = true);

drop policy if exists "owner read site notices" on public.site_notices;
create policy "owner read site notices"
  on public.site_notices for select
  to authenticated
  using (public.is_site_admin());

drop policy if exists "owner manage site notices" on public.site_notices;
create policy "owner manage site notices"
  on public.site_notices for insert
  to authenticated
  with check (public.is_site_admin());

drop policy if exists "owner update site notices" on public.site_notices;
create policy "owner update site notices"
  on public.site_notices for update
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

-- Postgres checks table privileges before RLS, so these grants are what make
-- the policies reachable.
revoke insert, update, delete on table public.site_notices from anon, authenticated;
grant select on table public.site_notices to anon, authenticated, service_role;
grant insert, update on table public.site_notices to authenticated, service_role;

-- Grant yourself publish rights once (SQL editor; replace the address):
-- insert into public.site_admins (user_id)
--   select id from auth.users where lower(email) = lower('owner@example.com');

notify pgrst, 'reload schema';
