-- Score writes go only through submit-score (service role).
-- Apply after 004_leaderboard_moderation.sql. Safe to re-run.

drop policy if exists "users write own daily" on public.daily_scores;
drop policy if exists "users update own daily" on public.daily_scores;
drop policy if exists "users write own blitz" on public.blitz_scores;

revoke insert, update, delete on table public.daily_scores from anon, authenticated;
revoke insert, update, delete on table public.blitz_scores from anon, authenticated;

grant select on table public.daily_scores to anon, authenticated, service_role;
grant insert, update on table public.daily_scores to service_role;
grant select on table public.blitz_scores to anon, authenticated, service_role;
grant insert on table public.blitz_scores to service_role;

drop policy if exists "users create own score submission log" on public.score_submission_log;
revoke insert, update, delete on table public.score_submission_log from anon, authenticated;
grant select, insert on table public.score_submission_log to service_role;

notify pgrst, 'reload schema';
