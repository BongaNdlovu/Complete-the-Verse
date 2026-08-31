// Optional Edge Function — deploy with Supabase CLI when ready.
// Validates score ceilings server-side. Client already clamps via Polish.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAX_DAILY = 500000;
const MAX_BLITZ = 10000;
const MAX_SUBMISSIONS_PER_WINDOW = 20;
const WINDOW_MS = 10 * 60 * 1000;
const DIFFS = new Set(["disciple", "watchman"]);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function validDate(value: unknown) {
  const date = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + "T00:00:00.000Z");
  return parsed.toISOString().slice(0, 10) === date && date <= todayUtc();
}

async function upsertDailyScore(supabase, user, body) {
  if (!validDate(body.play_date)) return json({ error: "invalid-date" }, 400);
  const score = Math.max(0, Math.min(MAX_DAILY, Number(body.score) || 0));
  const accuracy = Math.max(0, Math.min(100, Number(body.accuracy) || 0));
  const duration = body.duration_ms == null ? null : Math.max(0, Math.min(7200000, Number(body.duration_ms) || 0));
  const diff = String(body.diff || "watchman").slice(0, 32);
  if (!DIFFS.has(diff)) return json({ error: "invalid-difficulty" }, 400);
  const { error } = await supabase.from("daily_scores").upsert({
    user_id: user.id,
    play_date: String(body.play_date),
    score,
    accuracy,
    duration_ms: duration,
    diff
  }, { onConflict: "user_id,play_date" });
  if (error) return json({ error: error.message }, 400);
  const log = await supabase.from("score_submission_log").insert({ user_id: user.id, kind: "daily" });
  if (log.error) return json({ error: "submission-log-failed" }, 503);
  return json({ ok: true, score });
}
async function insertBlitzScore(supabase, user, body) {
  const score = Math.max(0, Math.min(MAX_BLITZ, Number(body.score) || 0));
  const survived = Math.max(0, Math.min(7200000, Number(body.survived_ms) || 0));
  const diff = String(body.diff || "watchman").slice(0, 32);
  if (!DIFFS.has(diff)) return json({ error: "invalid-difficulty" }, 400);
  const { error } = await supabase.from("blitz_scores").insert({
    user_id: user.id,
    score,
    survived_ms: survived,
    diff
  });
  if (error) return json({ error: error.message }, 400);
  const log = await supabase.from("score_submission_log").insert({ user_id: user.id, kind: "blitz" });
  if (log.error) return json({ error: "submission-log-failed" }, 503);
  return json({ ok: true, score });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method" }), { status: 405 });
  }
  const auth = req.headers.get("Authorization") || "";
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } }
  );
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "auth" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.json();
  const kind = body.kind === "blitz" ? "blitz" : "daily";
  const recent = await supabase
    .from("score_submission_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - WINDOW_MS).toISOString());
  if (recent.error) return json({ error: "rate-check-unavailable" }, 503);
  if ((recent.count || 0) >= MAX_SUBMISSIONS_PER_WINDOW) {
    return json({ error: "rate-limited" }, 429);
  }

  if (kind === "daily") return upsertDailyScore(supabase, user, body);
  return insertBlitzScore(supabase, user, body);
});
