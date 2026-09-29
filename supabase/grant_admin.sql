-- ============================================================================
-- Complete the Verse — Grant Admin Rights
-- Target Project: fgwfniblkuozxlbgytfk
-- Target Admin: fanelesibonge50@gmail.com
--
-- Instructions:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/fgwfniblkuozxlbgytfk
-- 2. Go to SQL Editor -> New Query.
-- 3. Paste this script and click "Run".
-- ============================================================================

-- Clean up any legacy trigger on auth.users that may run before profiles exist:
drop trigger if exists on_auth_user_admin on auth.users;

-- 1. Ensure profile exists for fanelesibonge50@gmail.com if already in auth.users
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    'Bonga'
  )
from auth.users u
where lower(u.email) = lower('fanelesibonge50@gmail.com')
on conflict (id) do nothing;

-- 2. Grant admin rights in public.site_admins for existing user:
insert into public.site_admins (user_id)
select p.id
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('fanelesibonge50@gmail.com')
on conflict (user_id) do nothing;

-- 3. Auto-grant admin rights on new profile creation (guarantees profile exists):
create or replace function public.handle_admin_profile_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_email text;
begin
  select email into user_email from auth.users where id = new.id;
  if lower(coalesce(user_email, '')) = lower('fanelesibonge50@gmail.com') then
    insert into public.site_admins (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_admin_assignment on public.profiles;
create trigger on_profile_admin_assignment
  after insert on public.profiles
  for each row execute function public.handle_admin_profile_assignment();

-- 4. Handle email updates on auth.users (if an existing user updates their email):
create or replace function public.handle_admin_email_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) = lower('fanelesibonge50@gmail.com') then
    if exists (select 1 from public.profiles where id = new.id) then
      insert into public.site_admins (user_id)
      values (new.id)
      on conflict (user_id) do nothing;
    end if;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_admin
  after update of email on auth.users
  for each row execute function public.handle_admin_email_update();

-- 5. Verification query: Display current admin status
select
  a.user_id,
  u.email,
  p.display_name,
  a.created_at as admin_granted_at,
  'ACTIVE ADMIN' as status
from public.site_admins a
left join auth.users u on u.id = a.user_id
left join public.profiles p on p.id = a.user_id;
