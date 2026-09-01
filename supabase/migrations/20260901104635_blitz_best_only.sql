delete from public.blitz_scores a
using public.blitz_scores b
where a.user_id = b.user_id
  and (
    a.score < b.score
    or (a.score = b.score and a.survived_ms < b.survived_ms)
    or (a.score = b.score and a.survived_ms = b.survived_ms and a.created_at < b.created_at)
    or (a.score = b.score and a.survived_ms = b.survived_ms and a.created_at = b.created_at and a.id < b.id)
  );

drop index if exists public.blitz_scores_user_uidx;
create unique index blitz_scores_user_uidx on public.blitz_scores (user_id);

notify pgrst, 'reload schema';
