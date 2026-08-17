/**
 * Pure polish helpers — security clamps, heatmap, blitz, ghost, insights.
 * Run: node polish.test.js
 */
const Polish = require("./js/polish");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

/* clamps */
{
  const d = Polish.clampDailyScore({ play_date: "2026-04-01", score: 9e9, accuracy: 150, duration_ms: -5, diff: "watchman" });
  eq("daily score capped", d.score, Polish.MAX_DAILY_SCORE);
  eq("accuracy capped at 100", d.accuracy, 100);
  eq("duration non-negative", d.duration_ms, 0);

  const b = Polish.clampBlitzScore({ score: -3, survived_ms: 1e12 });
  eq("blitz score floor 0", b.score, 0);
  ok("blitz duration capped", b.survived_ms <= 7200000);
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

/* mode clock descriptions — must be pacedClockMs, not invented seconds */
{
  const pad = 1500;
  const range = (open, close, t, pickPad) =>
    (Polish.pacedClockMs(open, t, pickPad) / 1000).toFixed(1) + "→" +
    (Polish.pacedClockMs(close, t, pickPad) / 1000).toFixed(1) + "s";
  const one = (base, t, pickPad) =>
    (Polish.pacedClockMs(base, t, pickPad) / 1000).toFixed(1) + "s";

  eq("describeModeClock trial disciple", Polish.describeModeClock("trial", "disciple"), range(14000, 6500, 1, pad));
  eq("describeModeClock pilgrimage disciple", Polish.describeModeClock("pilgrimage", "disciple"), "23.6→14.6s");
  eq("describeModeClock pilgrimage matches pacedClockMs",
    Polish.describeModeClock("pilgrimage", "disciple"), range(14000, 6500, 1, pad));
  ok("describeModeClock pilgrimage does not invent 19.6→11.1s",
    Polish.describeModeClock("pilgrimage", "disciple").indexOf("19.6") < 0);
  eq("describeModeClock endless disciple", Polish.describeModeClock("endless", "disciple"), range(12000, 4200, 1, pad));
  eq("describeModeClock daily disciple", Polish.describeModeClock("daily", "disciple"), one(10000, 1, pad));
  eq("describeModeClock blitz disciple", Polish.describeModeClock("blitz", "disciple"), "60s");
  eq("describeModeClock practice disciple", Polish.describeModeClock("practice", "disciple"), one(12000, 1, pad));
  eq("describeModeClock recall disciple", Polish.describeModeClock("recall", "disciple"), one(32000, 1, 0));
  eq("describeModeClock daily pilgrim is pacedClockMs",
    Polish.describeModeClock("daily", "pilgrim"), one(10000, 1.35, pad));
}

console.log((fail ? "FAIL" : "PASS") + " — polish · " + pass + " assertions" + (fail ? " · " + fail + " FAILED" : ""));
process.exit(fail ? 1 : 0);

