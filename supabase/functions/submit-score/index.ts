// Optional Edge Function — deploy with Supabase CLI when ready.
// Validates score ceilings server-side. Client already clamps via Polish.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAX_DAILY = 500000;
const MAX_BLITZ = 10000;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method" }), { status: 405 });
  }
  const auth = req.headers.get("Authorization") || "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "auth" }), { status: 401 });

  const body = await req.json();
  const kind = body.kind === "blitz" ? "blitz" : "daily";

  if (kind === "daily") {
    const score = Math.max(0, Math.min(MAX_DAILY, Number(body.score) || 0));
    const accuracy = Math.max(0, Math.min(100, Number(body.accuracy) || 0));
    const { error } = await supabase.from("daily_scores").upsert({
      user_id: user.id,
      play_date: String(body.play_date || "").slice(0, 32),
      score,
      accuracy,
      duration_ms: body.duration_ms == null ? null : Math.max(0, Number(body.duration_ms) || 0),
      diff: String(body.diff || "watchman").slice(0, 32)
    }, { onConflict: "user_id,play_date" });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    return new Response(JSON.stringify({ ok: true, score }), { headers: { "Content-Type": "application/json" } });
  }

  const score = Math.max(0, Math.min(MAX_BLITZ, Number(body.score) || 0));
  const { error } = await supabase.from("blitz_scores").insert({
    user_id: user.id,
    score,
    survived_ms: Math.max(0, Number(body.survived_ms) || 0),
    diff: String(body.diff || "watchman").slice(0, 32)
  });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify({ ok: true, score }), { headers: { "Content-Type": "application/json" } });
});
