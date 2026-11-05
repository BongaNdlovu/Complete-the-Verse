-- Takes TRUNCATE, REFERENCES and TRIGGER away from the API roles on every public table. Apply after 010. Safe to re-run.
--
-- Supabase gives anon and authenticated every table privilege on each new table in public, and the earlier
-- migrations only revoked insert, update and delete where they cared. TRUNCATE is the one that matters: row-level
-- security does not apply to it, so a role holding it could empty a table whatever the policies say. The app's API
-- (PostgREST) offers no way to run TRUNCATE, so this is not reachable through the game today. It is still not a
-- privilege a browser role should hold, and REFERENCES and TRIGGER are not used by any client either.
--
-- SELECT, INSERT, UPDATE and DELETE are left exactly as each migration set them, and service_role is untouched.

do $$
declare
  t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format('revoke truncate, references, trigger on table public.%I from anon, authenticated', t.relname);
  end loop;
end;
$$;

-- A table created from now on by the role that runs migrations and the SQL Editor (postgres) starts the same way, so
-- the next migration does not have to remember. Supabase keeps a second default for tables made by its own
-- supabase_admin role; that one is not ours to change, and no migration or SQL Editor query creates tables as it.
alter default privileges in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;

notify pgrst, 'reload schema';
