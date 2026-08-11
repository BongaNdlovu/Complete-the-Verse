-- Soft anti-cheat ceilings for leaderboard tables (client also clamps).

alter table public.daily_scores
  drop constraint if exists daily_scores_score_nonneg;
alter table public.daily_scores
  add constraint daily_scores_score_nonneg check (score >= 0 and score <= 500000);

alter table public.daily_scores
  drop constraint if exists daily_scores_accuracy_range;
alter table public.daily_scores
  add constraint daily_scores_accuracy_range check (accuracy >= 0 and accuracy <= 100);

alter table public.daily_scores
  drop constraint if exists daily_scores_duration_range;
alter table public.daily_scores
  add constraint daily_scores_duration_range
  check (duration_ms is null or (duration_ms >= 0 and duration_ms <= 7200000));

alter table public.blitz_scores
  drop constraint if exists blitz_scores_score_nonneg;
alter table public.blitz_scores
  add constraint blitz_scores_score_nonneg check (score >= 0 and score <= 10000);

alter table public.blitz_scores
  drop constraint if exists blitz_scores_survived_range;
alter table public.blitz_scores
  add constraint blitz_scores_survived_range
  check (survived_ms >= 0 and survived_ms <= 7200000);

alter table public.run_ghosts
  drop constraint if exists run_ghosts_score_nonneg;
alter table public.run_ghosts
  add constraint run_ghosts_score_nonneg check (best_score >= 0 and best_score <= 500000);

notify pgrst, 'reload schema';
