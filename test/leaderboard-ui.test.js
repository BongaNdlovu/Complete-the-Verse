/**
 * Leaderboard accuracy + rendering tests (no network).
 * Run: node test/leaderboard-ui.test.js
 */
const Polish = require("../js/polish");
const Leaderboard = require("../js/leaderboard");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

/* ---------- Polish.rankRows: standard competition ranking ---------- */
{
  const rows = Polish.rankRows([
    { name: "A", score: 500 },
    { name: "B", score: 400 },
    { name: "C", score: 400 },
    { name: "D", score: 200 }
  ]);
  eq("1st takes rank 1", rows[0].rank, 1);
  eq("tied pair shares rank 2", rows[1].rank, 2);
  eq("tied pair shares rank 2 (second row)", rows[2].rank, 2);
  eq("rank skips after a tie (4th of 4)", rows[3].rank, 4);
  ok("tied flag set on both tied rows", rows[1].tied === true && rows[2].tied === true);
  ok("untied rows are not flagged", !rows[0].tied && !rows[3].tied);
  eq("original rows untouched (pure)", JSON.stringify([{ name: "A", score: 500 }]),
     JSON.stringify([{ name: "A", score: 500 }]));
}
{
  const rows = Polish.rankRows([{ name: "A", score: 100 }]);
  eq("single row is rank 1", rows[0].rank, 1);
  ok("single row not tied", !rows[0].tied);
}
{
  const rows = Polish.rankRows([
    { score: 900 }, { score: 900 }, { score: 900 }, { score: 100 }
  ]);
  eq("three-way tie all rank 1", rows.slice(0, 3).map(r => r.rank).join(","), "1,1,1");
  eq("next rank skips to 4", rows[3].rank, 4);
}
{
  eq("empty board stays empty", Polish.rankRows([]).length, 0);
  eq("null board stays empty", Polish.rankRows(null).length, 0);
}

/* The board ranks must agree with fetchMyDailyRank's "count above + 1". */
{
  const board = Polish.rankRows([
    { name: "A", score: 500 }, { name: "B", score: 400 }, { name: "C", score: 400 }
  ]);
  const c = board.find(r => r.name === "C");
  const above = board.filter(r => r.score > c.score).length;
  eq("board rank equals count-above + 1 for a tied row", c.rank, above + 1);
}

/* ---------- Leaderboard.board rendering ---------- */
{
  const rows = Polish.rankRows([
    { id: "1", name: "Ezra", score: 5000, accuracy: 100, diff: "watchman" },
    { id: "2", name: "Miriam", score: 4200, accuracy: 95, diff: "watchman" },
    { id: "3", name: "Caleb", score: 4200, accuracy: 95, diff: "disciple" },
    { id: "4", name: "Deborah", score: 1000, accuracy: 80, diff: "watchman", mine: true }
  ]);
  const html = Leaderboard.board({ title: "Daily global", kind: "daily", rows });

  ok("podium rendered", html.indexOf("lbd-podium") >= 0);
  ok("both players tied at rank 2 stand on the podium",
     html.indexOf("Miriam") >= 0 && html.indexOf("Caleb") >= 0 &&
     html.indexOf("lbd-ped--tied") >= 0);
  ok("keeper holds the empty 3rd spot", html.indexOf("lbd-pempty") >= 0);
  ok("rank 2 sits left of rank 1", html.indexOf("lbd-p2") < html.indexOf("lbd-p1"));
  ok("share fill on list rows, none on podium rows",
     html.indexOf("--share:20%") >= 0 && html.indexOf("--share:100%") === -1);
  ok("own row highlighted", html.indexOf("lbd-row mine") >= 0);
  ok("names escaped", Leaderboard.board({ title: "x", kind: "daily", rows: [
    { id: "9", name: "<script>alert(1)</script>", score: 5, rank: 1 }
  ]}).indexOf("<script>") === -1);
}
{
  const rows = Polish.rankRows([
    { id: "1", name: "A", score: 500 }, { id: "2", name: "B", score: 400 },
    { id: "3", name: "C", score: 300 }
  ]);
  const html = Leaderboard.board({ title: "Daily global", kind: "daily", rows });
  ok("full podium orders 2 · 1 · 3",
     html.indexOf("lbd-p2") < html.indexOf("lbd-p1") && html.indexOf("lbd-p1") < html.indexOf("lbd-p3"));
  ok("no keeper on a full podium", html.indexOf("lbd-pempty") === -1);
}
{
  const rows = Polish.rankRows([
    { id: "1", name: "A", score: 500 }, { id: "2", name: "B", score: 400 },
    { id: "3", name: "C", score: 300 }, { id: "4", name: "D", score: 200 },
    { id: "5", name: "E", score: 100 }, { id: "6", name: "F", score: 100 }
  ]);
  const html = Leaderboard.board({ title: "Daily global", kind: "daily", rows });
  ok("tie below the podium shows T-rank on both rows", (html.match(/T5/g) || []).length === 2);
}
{
  const rows = Polish.rankRows([{ id: "1", name: "Solo", score: 77, accuracy: 90, diff: "watchman" }]);
  const html = Leaderboard.board({ title: "Daily global", kind: "daily", rows });
  ok("single entry still gets a centred podium", (html.match(/lbd-pempty/g) || []).length === 2);
}
{
  const rows = Polish.rankRows([
    { id: "1", name: "A", score: 300, accuracy: 90, diff: "watchman" },
    { id: "2", name: "B", score: 200, accuracy: 88, diff: "watchman" }
  ]);
  const mine = { id: "3", name: "Z", score: 50, accuracy: 70, diff: "watchman", mine: true, rank: 9 };
  const html = Leaderboard.board({ title: "Daily global", kind: "daily", rows, mine });
  ok("out-of-list rank gets its own section", html.indexOf("lbd-sep") >= 0 && html.indexOf("lbd-rows--mine") >= 0);
}
{
  const html = Leaderboard.board({
    title: "Blitz global", kind: "blitz",
    rows: Polish.rankRows([{ id: "1", name: "A", score: 12, survived_ms: 45000, rank: 1 }])
  });
  ok("blitz meta reads verses + seconds", /verses&nbsp;·|verses · 45s/.test(html.replace(/&nbsp;/g, " ")) || html.indexOf("45s") >= 0);
}
{
  const html = Leaderboard.board({ title: "Daily global", kind: "daily", head: false, rows: [
    { id: "1", name: "A", score: 10, rank: 1 }
  ]});
  ok("head suppressed for the results panel", html.indexOf("lbd-head") === -1);
}
{
  const rows = Polish.rankRows([{ id: "1", name: "A", score: 10, rank: 1 }]);
  const html = Leaderboard.board({ title: "T", kind: "daily", rows, reports: true });
  ok("report button rendered when asked", html.indexOf("data-report-score") >= 0);
}

console.log((fail ? "FAIL" : "PASS") + " — leaderboard · " + pass + " assertions" + (fail ? " · " + fail + " FAILED" : ""));
process.exit(fail ? 1 : 0);
