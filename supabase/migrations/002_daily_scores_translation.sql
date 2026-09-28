-- Complete the Verse — Add translation/edition to daily_scores
-- Migration 002: Support independent KJV / NKJV daily leaderboards

alter table public.daily_scores
  add column if not exists translation text not null default 'kjv';

-- Replace single-edition unique constraint with per-edition unique constraint
alter table public.daily_scores
  drop constraint if exists daily_scores_user_date;

alter table public.daily_scores
  add constraint daily_scores_user_date_translation
  unique (user_id, play_date, translation);

-- Per-edition daily leaderboard index
drop index if exists daily_scores_board_idx;

create index if not exists daily_scores_board_translation_idx
  on public.daily_scores (play_date, translation, score desc);
