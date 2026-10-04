-- ============================================================================
-- Complete the Verse — Weekly Backend Sanity & Health Check
-- Run in Supabase SQL Editor to audit data integrity, ceilings, and abuse.
-- Target project: fgwfniblkuozxlbgytfk
-- ============================================================================

-- 1. CEILING & INTEGRITY VIOLATION CHECK
-- Returns any scores that exceed server-side limits or violate constraints.
-- MUST RETURN 0 ROWS in a healthy production database.
select
  'daily_scores' as table_name,
  id,
  user_id,
  score,
  accuracy,
  duration_ms,
  created_at,
  'score > 500000 or accuracy > 100 or duration > 7.2M ms' as violation_reason
from public.daily_scores
where score > 500000
   or score < 0
   or accuracy > 100
   or accuracy < 0
   or (duration_ms is not null and (duration_ms > 7200000 or duration_ms < 0))

union all

select
  'blitz_scores' as table_name,
  id,
  user_id,
  score,
  null as accuracy,
  survived_ms as duration_ms,
  created_at,
  'blitz score > 10000 or survived_ms > 7.2M ms' as violation_reason
from public.blitz_scores
where score > 10000
   or score < 0
   or (survived_ms is not null and (survived_ms > 7200000 or survived_ms < 0));

-- 2. HIGH WATERMARK SUMMARY
-- Quick sanity check on current record highs vs designed maximums
select
  'Daily Scores' as board,
  count(*) as total_rows,
  coalesce(max(score), 0) as max_score_recorded,
  500000 as max_allowed_ceiling,
  coalesce(round(avg(score), 1), 0) as avg_score,
  coalesce(round(avg(accuracy), 1), 0) as avg_accuracy
from public.daily_scores

union all

select
  'Blitz Scores' as board,
  count(*) as total_rows,
  coalesce(max(score), 0) as max_score_recorded,
  10000 as max_allowed_ceiling,
  coalesce(round(avg(score), 1), 0) as avg_score,
  null as avg_accuracy
from public.blitz_scores;

-- 3. ABUSE & REPORT LOG AUDIT (Migration 004+)
-- Aggregates any unresolved reports filed against players
select
  target_user_id,
  reason,
  count(*) as report_count,
  min(created_at) as first_reported,
  max(created_at) as last_reported
from public.leaderboard_reports
where not resolved
group by target_user_id, reason
order by report_count desc;

-- 4. SUBMISSION VELOCITY / RATE-LIMIT WATCH (Last 24 Hours)
-- Flags accounts that submitted more than 50 times in 24 hours
select
  user_id,
  kind,
  count(*) as submissions_last_24h,
  max(created_at) as last_submission
from public.score_submission_log
where created_at >= now() - interval '24 hours'
group by user_id, kind
having count(*) > 50
order by submissions_last_24h desc;

-- 5. DAILY PARTICIPATION TREND (Past 7 Days)
select
  play_date,
  translation,
  count(*) as player_count,
  max(score) as top_score,
  round(avg(score), 1) as mean_score
from public.daily_scores
where play_date >= current_date - 7
group by play_date, translation
order by play_date desc, translation;
