/**
 * Pure polish helpers — security clamps, heatmap, blitz, ghost, insights.
 * Run: node polish.test.js
 */
const fs = require("fs");
const ROOT = require("../scripts/repo-root");
const path = require("path");
const Polish = require("../js/polish");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

/* motion-beat math — Streak Ignition cadence */
{
  eq("BEATS constants are the shipped cadence", JSON.stringify(Polish.BEATS), JSON.stringify({ IGNITE_START: 5, IGNITE_EVERY: 3 }));
  eq("no ignition below the start streak", Polish.streakIgniteAt(4), false);
  eq("ignition fires at the start streak", Polish.streakIgniteAt(5), true);
  eq("quiet between cadence hits", Polish.streakIgniteAt(6), false);
  eq("ignition fires at start+every", Polish.streakIgniteAt(8), true);
  eq("ignition fires at 11", Polish.streakIgniteAt(11), true);
  eq("ignition quiet at 10", Polish.streakIgniteAt(10), false);
  eq("safe on zero", Polish.streakIgniteAt(0), false);
  eq("safe on negative", Polish.streakIgniteAt(-3), false);
}

/* clamps */
{
  const d = Polish.clampDailyScore({ play_date: "2026-04-01", score: 9e9, accuracy: 150, duration_ms: -5, diff: "watchman" });
  eq("daily score capped", d.score, Polish.MAX_DAILY_SCORE);
  eq("accuracy capped at 100", d.accuracy, 100);
  eq("duration non-negative", d.duration_ms, 0);
  eq("daily negative score floored", Polish.clampDailyScore({ score: -99 }).score, 0);

  const b = Polish.clampBlitzScore({ score: -3, survived_ms: 1e12 });
  eq("blitz score floor 0", b.score, 0);
  ok("blitz duration capped", b.survived_ms <= 7200000);
}

{
  const a = Polish.settleDaily({ baseScore: 1500, best: 5, correct: 10, attempts: 10, diff: "watchman", reason: "complete" });
  eq("daily complete settlement", a.total, 3900);
  eq("daily complete accuracy", a.accuracy, 100);
  ok("daily complete plausible", Polish.plausibleDaily({
    score: 3900, accuracy: 100, baseScore: 1500, best: 5, correct: 10, attempts: 10, diff: "watchman", reason: "complete"
  }));
  const ab = Polish.settleDaily({ baseScore: 1500, best: 5, correct: 10, attempts: 10, diff: "watchman", reason: "abandon" });
  eq("daily abandon settlement", ab.total, 3315);
  ok("inflated daily rejected", !Polish.plausibleDaily({
    score: 500000, accuracy: 100, baseScore: 1500, best: 5, correct: 10, attempts: 10, diff: "watchman", reason: "complete"
  }));
  ok("blitz score must match verses", Polish.plausibleBlitz({ score: 47, correct: 47, survived_ms: 83000 }));
  ok("blitz mismatch rejected", !Polish.plausibleBlitz({ score: 9000, correct: 47, survived_ms: 83000 }));
}

/* blitz timer */
{
  eq("correct adds 2s", Polish.blitzAdjustMs(10000, true), 12000);
  eq("miss subtracts 4s", Polish.blitzAdjustMs(10000, false), 6000);
  eq("miss cannot go negative", Polish.blitzAdjustMs(1000, false), 0);
  eq("pressure high under 5s", Polish.blitzPressure(4000), 3);
  eq("pressure none when plenty", Polish.blitzPressure(40000), 0);
}

/* ghost sampling */
{
  const samples = [{ t: 0, p: 0 }, { t: 1000, p: 1 }];
  eq("ghost at start", Polish.sampleGhost(samples, 0), 0);
  eq("ghost at end", Polish.sampleGhost(samples, 1000), 1);
  ok("ghost interpolates", Math.abs(Polish.sampleGhost(samples, 500) - 0.5) < 0.001);

  let s = [];
  s = Polish.pushGhostSample(s, 0, 0);
  s = Polish.pushGhostSample(s, 100, 0.2, 2000); // merges into last
  eq("ghost min gap merges", s.length, 1);
  s = Polish.pushGhostSample(s, 3000, 0.5, 2000);
  eq("ghost adds after gap", s.length, 2);
}

/* heatmap */
{
  const verses = [
    { id: 1, b: "Genesis" }, { id: 2, b: "Genesis" }, { id: 3, b: "Exodus" }
  ];
  const cards = {
    1: { reps: 5, ivl: 10, due: 999, lapses: 0 },
    2: { reps: 1, ivl: 1, due: 0, lapses: 0 }
  };
  const m = Polish.bookMastery("Genesis", verses, v => cards[v.id], 5);
  eq("due detected", m.state, "due");
  ok("heatmap matrix length", Polish.heatmapMatrix(["Genesis", "Exodus"], verses, () => null, 0).length === 2);
}

/* names + insights */
{
  eq("sanitize strips tags", Polish.sanitizeDisplayName("<b>Hi</b>"), "Hi");
  eq("sanitize short rejected", Polish.sanitizeDisplayName("a"), "");
  const ins = Polish.insightForVerse({ b: "John", r: "John 1:1", a: "the Word", id: "j1" });
  ok("john insight has logos", ins.roots.some(r => r.w === "logos"));
  const cross = Polish.crossRefsInBank(
    { id: "a", b: "Romans", a: "righteousness of God" },
    [
      { id: "a", b: "Romans", a: "righteousness of God", r: "Romans 1:17" },
      { id: "b", b: "Romans", a: "other", r: "Romans 3:22" },
      { id: "c", b: "Psalms", a: "righteousness forever", r: "Psalm 119:142" }
    ],
    3
  );
  ok("cross refs found", cross.length >= 1);
}

/* mode clock descriptions — flat wall clocks for in-scope modes */
{
  eq("describeModeClock pilgrimage", Polish.describeModeClock("pilgrimage", "watchman"), "30s · 45s assemble · 60s fade");
  eq("describeModeClock daily", Polish.describeModeClock("daily", "watchman"), "30s · 45s assemble · 60s fade");
  eq("describeModeClock practice", Polish.describeModeClock("practice", "watchman"), "30s");
  eq("describeModeClock team", Polish.describeModeClock("team", "watchman"), "30s");
  eq("describeModeClock recall", Polish.describeModeClock("recall", "watchman"), "45s");
  eq("describeModeClock pilgrim-recall", Polish.describeModeClock("pilgrim-recall", "watchman"), "45s");
  eq("describeModeClock blitz", Polish.describeModeClock("blitz", "watchman"), "60s");
  eq("describeModeClock trial", Polish.describeModeClock("trial", "watchman"), "paced");
}

{
  const src = fs.readFileSync(path.join(ROOT, "js", "polish.js"), "utf8");
  const block = src.match(/function describeModeClock\([\s\S]*?\n  \}/);
  ok("describeModeClock source is extractable", !!block);
  ok("describeModeClock does not read DIFFS (TDZ during game.js parse)",
     block && !/\bDIFFS\b/.test(block[0]));
}

console.log((fail ? "FAIL" : "PASS") + " — polish · " + pass + " assertions" + (fail ? " · " + fail + " FAILED" : ""));
process.exit(fail ? 1 : 0);

