/**
 * Daily Trial — streak ladder, hero button, instruction card, once-a-day.
 * Run: node test/daily-trial.test.js
 */
const fs = require("fs");
const path = require("path");
const Polish = require("../js/polish");

const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }
function read(p) { return fs.readFileSync(path.join(ROOT, p), "utf8"); }

/* ---------- Streak milestones ---------- */
[3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 300, 365].forEach(n =>
  ok("milestone " + n, Polish.dailyStreakMilestone(n) === true, n));
[1, 2, 4, 5, 6, 8, 10, 13, 20, 25, 29, 40, 60, 90, 120, 250].forEach(n =>
  ok("not a milestone " + n, Polish.dailyStreakMilestone(n) === false, n));
[400, 500, 600].forEach(n => ok("every 100 past the ladder " + n, Polish.dailyStreakMilestone(n) === true, n));
ok("465 is not a milestone", Polish.dailyStreakMilestone(465) === false);
ok("0 is not a milestone", Polish.dailyStreakMilestone(0) === false);

/* ---------- Streak counting (pure) ---------- */
{
  eq("first ever daily starts the streak", Polish.nextDailyStreak(0, "", "2026-09-29"), 1);
  eq("yesterday's run extends it", Polish.nextDailyStreak(3, "2026-09-28", "2026-09-29"), 4);
  eq("a skipped day resets to 1", Polish.nextDailyStreak(9, "2026-09-26", "2026-09-29"), 1);
  eq("same-day double-call keeps the count", Polish.nextDailyStreak(4, "2026-09-29", "2026-09-29"), 4);
  eq("month rollover counts as consecutive", Polish.nextDailyStreak(1, "2026-09-30", "2026-10-01"), 2);
  eq("year rollover counts as consecutive", Polish.nextDailyStreak(5, "2026-12-31", "2027-01-01"), 6);
}

/* ---------- Menu: the Daily hero leads the hall ---------- */
{
  const briefs = read("js/briefs.js");
  ok("menu renders the daily hero", briefs.includes("renderDailyHero") && briefs.includes('daily-hero'));
  ok("hero sits above the groups in renderMenu",
     /let groupsHtml = renderDailyHero\(dailyDone\);[\s\S]*?groupsHtml \+= MENU_GROUPS\.filter\(g => !g\.more\)/.test(briefs));
  ok("the old Today group is gone", !/{ name: "Today",\s*quiet: true, modes: \["daily"\] }/.test(briefs));
  ok("hero carries the streak line", briefs.includes("dh-streak"));
  ok("hero shows the standing score", briefs.includes("score stands"));
  ok("hero notes one shot a day", briefs.includes("One shot a day"));
}

/* ---------- Brief: instruction card + seen tick ---------- */
{
  const briefs = read("js/briefs.js");
  const html = read("index.html");
  ok("brief hosts the daily card", html.includes('id="daily-brief-card"'));
  ok("card explains the 20-verse draw", briefs.includes("Twenty verses drawn by today's date"));
  ok("card explains what the board measures", briefs.includes("What the board measures"));
  ok("card states the one-score rule", briefs.includes("One score stands"));
  ok("card offers the seen tick", briefs.includes("I have seen this"));
  ok("the tick persists in the save", briefs.includes("SAVE.set.dailyBriefSeen = true"));
  ok("a recorded day shows the practice banner", briefs.includes("this run is practice"));
  ok("card shows the current streak", briefs.includes("dbrief-streak"));
  ok("other modes never render the card",
     /function paintDailyBriefChrome\(mode\)[\s\S]*?if\(mode!=="daily"\)\{[\s\S]*?daily-brief-card/.test(briefs));
}

/* ---------- Confetti celebration ---------- */
{
  const confetti = read("js/confetti.js");
  const html = read("index.html");
  ok("confetti module is loaded", html.includes("js/confetti.js"));
  ok("celebration stands down for reduced motion", confetti.includes('contains("reduced")'));
  ok("streak celebration checks the milestone ladder",
     confetti.includes("dailyStreakMilestone"));
  ok("bigger streaks throw more confetti", /count >= 100 \? 240 : count >= 30 \? 190 : 140/.test(confetti));
  ok("openBrief fires the milestone once", /ds\.celebrated = ds\.count/.test(read("js/briefs.js")));
}

/* ---------- Once-a-day: first finished run stands ---------- */
{
  const results = read("js/results.js");
  const edge = read("supabase/functions/submit-score/index.ts");
  ok("local record keeps the one-recorded-run gate",
     results.includes('R.mode==="daily" && reason==="complete" && SAVE.daily.date !== dailyKey'));
  ok("recording a daily bumps the streak", /dailyStreak/.test(results) && results.includes("nextDailyStreak"));
  ok("daily replay is labelled practice, never a record shot",
     results.includes('"Practice the Same 20"'));
  ok("edge keeps the stored score when one exists", edge.includes("kept: true"));
  ok("a failed submit keeps the run's numbers for retry",
     /SAVE\.pendingDaily = \{ date: todayKey\(\), payload: dailyPayload/.test(results));
  ok("a confirmed submit clears the pending record",
     (results.match(/SAVE\.pendingDaily = null/g) || []).length >= 1);
  ok("the board offers a resend while pending",
     results.includes("Resend my score") && results.includes("pending-resend"));
  ok("the cloud retries pending dailies at boot and gives up after five",
     /async function retryPendingDaily/.test(read("js/cloud.js")) &&
     /gave-up/.test(read("js/cloud.js")) &&
     /pend\.tries \|\| 0\) >= 5/.test(read("js/cloud.js")));
  ok("boot syncs trigger the retry",
     (read("js/game.js").match(/Cloud\.retryPendingDaily\(\)/g) || []).length >= 2);
  ok("edge checks the existing row before writing",
     /from\("daily_scores"\)\s*\n?\s*\.select\("score"\)/.test(edge));
}

/* ---------- Service worker ships the new module ---------- */
{
  const sw = read("sw.js");
  ok("sw precaches confetti.js", sw.includes('"js/confetti.js"'));
  ok("sw precaches leaderboard.js", sw.includes('"js/leaderboard.js"'));
}

console.log((fail ? "FAIL" : "PASS") + " — daily trial · " + pass + " assertions" + (fail ? " · " + fail + " FAILED" : ""));
process.exit(fail ? 1 : 0);
