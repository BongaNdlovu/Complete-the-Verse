/**
 * Leaderboard accuracy: what a Daily or Blitz run posts, and whether the
 * submit-score edge function would accept it.
 * Run: node test/leaderboard.test.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js",
  "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js",
  "js/live.js", "js/atlas.js", "js/beat.js", "js/tablets.js", "js/tablets-canon.js", "js/tablets-hall.js", "js/tablets-more.js",
  "js/polish.js"
];
const FILES = PREFIX.concat(ENGINE_FILES, ["js/tablets-run.js"]);

const CLOUD_STUB = `
  var __posts = { daily: [], blitz: [] };
  var __clock = 1000;
  performance.now = function(){ return __clock; };
  Cloud = {
    configured: function(){ return true; },
    isSignedIn: function(){ return true; },
    user: function(){ return { id: "u1" }; },
    profile: function(){ return null; },
    lastSubmitVia: function(){ return "edge"; },
    schedulePush: function(){},
    upsertGhost: function(){ return Promise.resolve({ ok: true }); },
    submitDailyScore: function(row){ __posts.daily.push(row); return Promise.resolve({ ok: true }); },
    submitBlitzScore: function(row){ __posts.blitz.push(row); return Promise.resolve({ ok: true }); },
    fetchDailyBoard: function(){ return Promise.resolve([]); },
    fetchMyDailyRank: function(){ return Promise.resolve(null); },
    fetchDailyEntryCount: function(){ return Promise.resolve(0); },
    fetchBlitzBoard: function(){ return Promise.resolve([]); },
    fetchMyBlitzRank: function(){ return Promise.resolve(null); }
  };
`;

function boot() {
  const sb = makeSandbox();
  const src = FILES.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });
  vm.runInContext(CLOUD_STUB, sb);
  return sb;
}
function exec(sb, code) { return vm.runInContext(code, sb); }
function read(sb, expr) { return vm.runInContext(expr, sb); }

/* The edge function's validators, loaded from its own source so the test
   checks the rules the server runs rather than a copy of them. */
function loadEdge(nowMs) {
  const src = fs.readFileSync(path.join(ROOT, "supabase", "functions", "submit-score", "index.ts"), "utf8");
  const head = src.slice(src.indexOf("const MAX_DAILY"), src.indexOf("const CORS_HEADERS"));
  const body = src.slice(src.indexOf("const DAY_MS"), src.indexOf("async function upsertDailyScore"));
  const js = (head + body).replace(/(\w+): (?:unknown|number|string)(?=[,)])/g, "$1");
  const ctx = vm.createContext({ Date: class extends Date {
    constructor(...a) { if (a.length) super(...a); else super(nowMs); }
    static now() { return nowMs; }
  }, Math, Number, String, isNaN });
  vm.runInContext(js + ";this.edge={validDate,settleDaily,plausibleDaily,plausibleBlitz};", ctx);
  return ctx.edge;
}

console.log("=== LEADERBOARD ACCURACY ===");

// A full Daily: 20 questions, one attempt each, and a payload the server accepts.
{
  const sb = boot();
  exec(sb, `startRun("daily", "watchman");`);
  eq("Daily draws 20 questions", read(sb, "R.daily.list.length"), 20);
  const dayKey = read(sb, "R.dailyKey");
  ok("Daily run carries the day it was drawn", /^\d{4}-\d{2}-\d{2}$/.test(dayKey), dayKey);
  for (let i = 0; i < 20; i++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 6000);`);
    if (i < 19) exec(sb, `nextQuestion();`);
  }
  eq("20 questions make 20 attempts", read(sb, "R.attempts"), 20);
  exec(sb, `endRun("complete");`);
  const posts = read(sb, "JSON.stringify(__posts.daily)");
  const daily = JSON.parse(posts);
  eq("a finished Daily posts once", daily.length, 1);
  const row = daily[0] || {};
  eq("Daily post uses the drawn day", row.play_date, dayKey);
  eq("Daily post names the translation", row.translation, "kjv");
  eq("Daily post is a finished run", row.reason, "complete");
  eq("Daily post attempts", row.attempts, 20);
  eq("posted score matches the results screen", row.score, read(sb, "SAVE.dailyByEdition.kjv.score"));
  ok("client check accepts the Daily post", read(sb, "Polish.plausibleDaily(" + JSON.stringify(row) + ")"));
  const edge = loadEdge(Date.parse(dayKey + "T12:00:00Z"));
  ok("server check accepts the Daily post", edge.plausibleDaily(row), row);
  eq("server settles the same score", edge.settleDaily(row).total, row.score);

  exec(sb, `startRun("daily", "watchman");`);
  for (let i = 0; i < 20; i++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 6000);`);
    if (i < 19) exec(sb, `nextQuestion();`);
  }
  exec(sb, `endRun("complete");`);
  eq("a second Daily the same day does not post", read(sb, "__posts.daily.length"), 1);
}

// An NKJV Daily posts to the NKJV board.
{
  const sb = boot();
  exec(sb, `Edition.activateEdition("nkjv"); startRun("daily", "disciple");`);
  for (let i = 0; i < 20; i++) {
    exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 6000);`);
    if (i < 19) exec(sb, `nextQuestion();`);
  }
  exec(sb, `endRun("complete");`);
  const row = JSON.parse(read(sb, "JSON.stringify(__posts.daily[0] || {})"));
  eq("NKJV Daily posts to the NKJV board", row.translation, "nkjv");
  ok("server accepts a Disciple Daily", loadEdge(Date.parse(row.play_date + "T12:00:00Z")).plausibleDaily(row), row);
}

// A left Daily posts once — the score earned stands, penalty included.
{
  const sb = boot();
  exec(sb, `startRun("daily", "watchman"); resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 6000); endRun("abandon");`);
  eq("an abandoned Daily posts once", read(sb, "__posts.daily.length"), 1);
  eq("the posted reason is the leave", read(sb, "__posts.daily[0].reason"), "abandon");
  exec(sb, `startRun("daily", "watchman"); endRun("complete");`);
  eq("a later run cannot post again", read(sb, "__posts.daily.length"), 1);
}

// Blitz: pausing holds the clock and does not count as time survived.
{
  const sb = boot();
  exec(sb, `startRun("blitz", "watchman"); R.running = true;`);
  const end0 = read(sb, "R.blitzEnd");
  exec(sb, `togglePause();`);
  eq("Blitz pauses", read(sb, "R.paused"), true);
  exec(sb, `__clock += 30000; togglePause();`);
  eq("Blitz resumes", read(sb, "R.paused"), false);
  eq("pause adds its length back to the Blitz clock", read(sb, "R.blitzEnd") - end0, 30000);
  eq("pause length is recorded", read(sb, "R.pausedMs"), 30000);
  exec(sb, `R.correct = 7; R.startedAt = Date.now() - 40000; endRun("timeout-death");`);
  const row = JSON.parse(read(sb, "JSON.stringify(__posts.blitz[0] || {})"));
  eq("Blitz posts verses correct", row.score, 7);
  ok("Blitz time survived leaves out the pause", Math.abs(row.survived_ms - 10000) < 500, row.survived_ms);
  ok("server accepts the Blitz post", loadEdge(Date.now()).plausibleBlitz(row), row);
}

// Blitz ended while paused still leaves out the open pause.
{
  const sb = boot();
  exec(sb, `startRun("blitz", "watchman"); R.running = true; togglePause(); __clock += 20000;`);
  exec(sb, `R.correct = 3; R.startedAt = Date.now() - 25000; endRun("abandon");`);
  const row = JSON.parse(read(sb, "JSON.stringify(__posts.blitz[0] || {})"));
  ok("Blitz abandoned mid-pause leaves out the pause", Math.abs(row.survived_ms - 5000) < 500, row.survived_ms);
}

// The server takes the player's local day, a day either side of UTC.
{
  const noon = Date.parse("2026-09-29T12:00:00Z");
  const edge = loadEdge(noon);
  ok("server accepts today", edge.validDate("2026-09-29"));
  ok("server accepts a player a day ahead of UTC", edge.validDate("2026-09-30"));
  ok("server accepts a run finished after midnight", edge.validDate("2026-09-28"));
  ok("server rejects two days ahead", !edge.validDate("2026-10-01"));
  ok("server rejects an old day", !edge.validDate("2026-09-20"));
  ok("server rejects a malformed day", !edge.validDate("2026-02-30"));
  ok("server rejects more than 20 attempts", !edge.plausibleDaily({ correct: 21, attempts: 21, best: 21, baseScore: 1000, score: 0, accuracy: 100 }));
}

// Board order and "your rank" break ties the same way.
{
  const cloud = fs.readFileSync(path.join(ROOT, "js", "cloud.js"), "utf8");
  const edgeSrc = fs.readFileSync(path.join(ROOT, "supabase", "functions", "submit-score", "index.ts"), "utf8");
  ok("Daily board breaks ties by first to post",
    /from\("daily_scores"\)[\s\S]{0,400}order\("score"[\s\S]{0,120}order\("created_at", \{ ascending: true \}\)/.test(cloud));
  ok("Daily rank shares ties (competition ranking, board-consistent)",
    /\.gt\("score", mine\.data\.score\)[\s\S]{0,320}\.eq\("score", mine\.data\.score\)/.test(cloud));
  ok("Blitz rank counts earlier ties", /survived_ms\.eq\.[\s\S]{0,60}created_at\.lt\./.test(cloud));
  ok("server keeps the first Daily of the day", /!existing\.data\) return null;[\s\S]{0,300}kept: true/.test(edgeSrc) &&
    /const kept = await keptDailyScore[\s\S]{0,60}if \(kept\) return kept;/.test(edgeSrc) &&
    !/from\("daily_scores"\)\.upsert/.test(edgeSrc));
  ok("server stamps a new Blitz best", /blitz_scores"\)\.upsert\(\{[\s\S]{0,200}created_at:/.test(edgeSrc));
}

if (fail) {
  console.log("FAIL — leaderboard · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — leaderboard · " + pass + " assertions passed");
