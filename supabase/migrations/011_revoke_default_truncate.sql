-- Takes TRUNCATE, REFERENCES, TRIGGER and MAINTAIN away from the API roles on every public table. Apply after 010.
-- Safe to re-run.
--
-- Supabase gives anon and authenticated every table privilege on each new table in public, and the earlier
-- migrations only revoked insert, update and delete where they cared. TRUNCATE is the one that matters: row-level
-- security does not apply to it, so a role holding it could empty a table whatever the policies say. MAINTAIN
-- (Postgres 17 and later: VACUUM, ANALYZE, REINDEX, CLUSTER and LOCK TABLE, which can take an exclusive lock) is
-- outside row-level security too. The app's API (PostgREST) offers no way to run any of these, so none is reachable
-- through the game today. They are still not privileges a browser role should hold, and REFERENCES and TRIGGER are
-- not used by any client either.
--
-- SELECT, INSERT, UPDATE and DELETE are left exactly as each migration set them, and service_role is untouched.

do $$
declare
  t record;
  has_maintain constant boolean := current_setting('server_version_num')::int >= 170000;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format('revoke truncate, references, trigger on table public.%I from anon, authenticated', t.relname);
    if has_maintain then
      execute format('revoke maintain on table public.%I from anon, authenticated', t.relname);
    end if;
  end loop;
end;
$$;

-- A table created from now on by the role that runs migrations and the SQL Editor (postgres) starts the same way, so
-- the next migration does not have to remember. Supabase keeps a second default for tables made by its own
-- supabase_admin role; that one is not ours to change, and no migration or SQL Editor query creates tables as it.
alter default privileges in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;

do $$
begin
  if current_setting('server_version_num')::int >= 170000 then
    execute 'alter default privileges in schema public revoke maintain on tables from anon, authenticated';
  end if;
end;
$$;

notify pgrst, 'reload schema';
