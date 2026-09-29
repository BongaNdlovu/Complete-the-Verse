-- ============================================================================
-- Complete the Verse — Seed Script
-- Target Project: fgwfniblkuozxlbgytfk
-- Target Admin: fanelesibonge50@gmail.com
-- ============================================================================

-- Ensure profile exists for fanelesibonge50@gmail.com if they exist in auth.users
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

-- Grant site admin status to fanelesibonge50@gmail.com
insert into public.site_admins (user_id)
select p.id
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('fanelesibonge50@gmail.com')
on conflict (user_id) do nothing;
