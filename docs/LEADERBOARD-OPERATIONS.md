# Leaderboard Operations

The public boards are trusted only when submissions pass through the
submit-score Edge Function. The browser now fails closed if that function is
unavailable; it never falls back to a client-authored score. Local records
continue to work offline.

## Release gate

Apply migrations 001_complete_the_verse.sql, 002_lock_trigger_functions.sql,
003_score_constraints.sql, 004_leaderboard_moderation.sql, and
005_edge_only_scores.sql, then deploy:

    supabase functions deploy submit-score --project-ref fgwfniblkuozxlbgytfk

Verify an authenticated Daily and Blitz submission in the Network panel. The
request must reach /functions/v1/submit-score, return { ok: true }, and create
one row in score_submission_log. A failed function must produce no public
score row from the browser.

Deployment requires the project owner's Supabase CLI authentication and was not
performed by the local code/test pass.

## Monitoring

- Alert on non-2xx submit-score responses, especially 429,
  rate-check-unavailable, and submission-log-failed.
- Review the Edge Function logs after each release and sample the
  score_submission_log rate by user and kind.
- First-session funnel lives on signed-in saves at `payload.life.funnel`
  (`boot`, `ur`, `site` timestamps). Service worker register failures are
  in the local diagnostics dump (Settings → Copy diagnostics).
- Keep the public board read-only for anonymous users; only authenticated users
  can submit or report.
- Treat repeated reports for one score as one moderation case; the unique index
  prevents report spam from the same reporter.

## Moderation and recovery

1. Review leaderboard_reports rows with status = pending using the Supabase
   service-role console.
2. For an abusive score, mark its report removed, remove or quarantine the
   referenced row in daily_scores or blitz_scores, and record the reason in
   moderator_note.
3. For a false report, mark it dismissed.
4. If the function is unhealthy, leave the boards unavailable rather than
   re-enable client writes. Players retain their local record and can retry
   submission after recovery.
5. If a bad release writes scores, export the affected rows before cleanup,
   disable the function, correct the code/migration, and re-run the smoke test.

The database constraints remain the final ceiling even if a future client is
tampered with: score, accuracy, duration, difficulty, submission rate, and
report reason are all bounded.
