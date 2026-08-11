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
