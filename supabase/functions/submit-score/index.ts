import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAX_DAILY = 500000;
const MAX_BLITZ = 10000;
const MAX_DURATION_MS = 7200000;
const MAX_SUBMISSIONS_PER_WINDOW = 20;
const WINDOW_MS = 10 * 60 * 1000;
const DIFFS = new Set(["disciple", "watchman"]);
const DIFF_SCORE = { disciple: 0.85, watchman: 1 };
const DAILY_MAX_ATTEMPTS = 20;
const DAILY_MAX_BASE = 348000;

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

function diffScore(diff: string) {
  return DIFF_SCORE[diff] != null ? DIFF_SCORE[diff] : DIFF_SCORE.watchman;
}

function settleDaily(row) {
  const ds = diffScore(String(row.diff || "watchman"));
  const correct = Math.max(0, Number(row.correct) || 0);
  const attempts = Math.max(0, Number(row.attempts) || 0);
  const best = Math.max(0, Number(row.best) || 0);
  const base = Math.max(0, Math.round(Number(row.baseScore) || 0));
  const acc = attempts ? correct / attempts : 0;
  const streakBonus = Math.round(best * 120 * ds);
  const accBonus = Math.round(acc * 1200 * ds);
  const survivalBonus = Math.round(correct * 60 * ds);
  const sum = base + streakBonus + accBonus + survivalBonus;
  const total = String(row.reason || "") === "abandon" ? Math.round(sum * 0.85) : sum;
  return { total, accuracy: Math.round(acc * 100) };
}

function plausibleDaily(row) {
  const correct = Number(row.correct) || 0;
  const attempts = Number(row.attempts) || 0;
  const best = Number(row.best) || 0;
  const base = Math.round(Number(row.baseScore) || 0);
  if (attempts < 1 || attempts > DAILY_MAX_ATTEMPTS) return false;
  if (correct < 0 || correct > attempts) return false;
  if (best < 0 || best > correct) return false;
  if (base < 0 || base > DAILY_MAX_BASE) return false;
  const settled = settleDaily(row);
  if (Math.abs((Number(row.accuracy) || 0) - settled.accuracy) > 1) return false;
  if (Math.abs((Number(row.score) || 0) - settled.total) > 1) return false;
  return true;
}

function plausibleBlitz(row) {
  const score = Number(row.score) || 0;
  const correct = row.correct == null ? score : Number(row.correct) || 0;
  if (score !== correct) return false;
  if (score < 0 || score > MAX_BLITZ) return false;
  const survived = Number(row.survived_ms) || 0;
  if (survived < 0 || survived > MAX_DURATION_MS) return false;
  return true;
}

async function upsertDailyScore(supabase, user, body) {
  if (!validDate(body.play_date)) return json({ error: "invalid-date" }, 400);
  const diff = String(body.diff || "watchman").slice(0, 32);
  if (!DIFFS.has(diff)) return json({ error: "invalid-difficulty" }, 400);
  const row = {
    play_date: String(body.play_date),
    score: Math.max(0, Math.min(MAX_DAILY, Number(body.score) || 0)),
    accuracy: Math.max(0, Math.min(100, Number(body.accuracy) || 0)),
    duration_ms: body.duration_ms == null ? null : Math.max(0, Math.min(MAX_DURATION_MS, Number(body.duration_ms) || 0)),
    diff,
    correct: Math.max(0, Number(body.correct) || 0),
    attempts: Math.max(0, Number(body.attempts) || 0),
    best: Math.max(0, Number(body.best) || 0),
    baseScore: Math.max(0, Math.round(Number(body.baseScore) || 0)),
    reason: String(body.reason || "")
  };
  if (!plausibleDaily(row)) return json({ error: "rejected" }, 400);
  const score = settleDaily(row).total;
  const { error } = await supabase.from("daily_scores").upsert({
    user_id: user.id,
    play_date: row.play_date,
    score,
    accuracy: row.accuracy,
    duration_ms: row.duration_ms,
    diff
  }, { onConflict: "user_id,play_date" });
  if (error) return json({ error: "rejected" }, 400);
  const log = await supabase.from("score_submission_log").insert({ user_id: user.id, kind: "daily" });
  if (log.error) return json({ error: "submission-log-failed" }, 503);
  return json({ ok: true, score });
}

async function upsertBlitzScore(supabase, user, body) {
  const diff = String(body.diff || "watchman").slice(0, 32);
  if (!DIFFS.has(diff)) return json({ error: "invalid-difficulty" }, 400);
  const row = {
    score: Math.max(0, Math.min(MAX_BLITZ, Number(body.score) || 0)),
    survived_ms: Math.max(0, Math.min(MAX_DURATION_MS, Number(body.survived_ms) || 0)),
    diff,
    correct: body.correct == null ? Math.max(0, Number(body.score) || 0) : Math.max(0, Number(body.correct) || 0)
  };
  if (!plausibleBlitz(row)) return json({ error: "rejected" }, 400);
  const existing = await supabase.from("blitz_scores")
    .select("score, survived_ms")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing.error) return json({ error: "rejected" }, 400);
  const prev = existing.data;
  if (prev && (prev.score > row.score || (prev.score === row.score && prev.survived_ms >= row.survived_ms))) {
    const logKeep = await supabase.from("score_submission_log").insert({ user_id: user.id, kind: "blitz" });
    if (logKeep.error) return json({ error: "submission-log-failed" }, 503);
    return json({ ok: true, score: prev.score });
  }
  const { error } = await supabase.from("blitz_scores").upsert({
    user_id: user.id,
    score: row.score,
    survived_ms: row.survived_ms,
    diff
  }, { onConflict: "user_id" });
  if (error) return json({ error: "rejected" }, 400);
  const log = await supabase.from("score_submission_log").insert({ user_id: user.id, kind: "blitz" });
  if (log.error) return json({ error: "submission-log-failed" }, 503);
  return json({ ok: true, score: row.score });
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
  return upsertBlitzScore(supabase, user, body);
});
