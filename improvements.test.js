/**
 * Structural tests for report improvements (security headers, modes, UI hooks).
 * Run: node improvements.test.js
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

const game = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "game.css"), "utf8");
const cloud = fs.readFileSync(path.join(root, "js", "cloud.js"), "utf8");
const polish = fs.readFileSync(path.join(root, "js", "polish.js"), "utf8");
const vercel = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
const mig3 = fs.readFileSync(path.join(root, "supabase", "migrations", "003_score_constraints.sql"), "utf8");

/* security */
assert(fs.existsSync(path.join(root, "vercel.json")), "vercel.json present");
assert(/Content-Security-Policy/.test(vercel), "CSP header configured");
assert(/X-Frame-Options/.test(vercel), "X-Frame-Options set");
assert(/daily_scores_score_nonneg/.test(mig3), "daily score DB constraint");
assert(/blitz_scores_score_nonneg/.test(mig3), "blitz score DB constraint");
assert(/clampDailyScore/.test(cloud), "cloud clamps daily scores");
assert(/clampBlitzScore/.test(cloud), "cloud clamps blitz scores");
assert(/stale-revision/.test(cloud), "optimistic lock on save push");
assert(/sanitizeDisplayName/.test(cloud), "display names sanitized");
assert(/initLazy/.test(cloud), "lazy supabase init");

/* performance */
assert(/preload = "none"/.test(game), "music preload none (lazy beds)");
assert(/initLazy/.test(game), "boot uses lazy cloud init");
assert(!/vendor\/supabase\/supabase\.js/.test(index) || /polish\.js/.test(index), "polish script present");
assert(/js\/polish\.js/.test(index), "polish.js wired in index");
assert(!/<script src="vendor\/supabase\/supabase\.js">/.test(index), "supabase not hard-loaded on every page");

/* modes & UI */
assert(/blitz:\s*\{\s*key:"blitz"/.test(game), "Scripture Blitz mode defined");
assert(/trial:\{ key:"trial"/.test(game), "trial mode defined");
assert(!/trial:\{ key:"trial", kick:"Campaign", hidden:true/.test(game), "trial is on the menu — hidden modes left seals unreachable");
assert(/id="cloud-chip"/.test(index), "cloud status chip");
assert(/id="offline-banner"/.test(index), "offline banner");
assert(/id="res-board"/.test(index), "results leaderboard host");
assert(/id="res-insights"/.test(index), "insights host");
assert(/id="res-retry"/.test(index), "retry site button");
assert(/id="book-heatmap"/.test(index), "book heatmap host");
assert(/id="journey-journal"/.test(index), "journey journal host");
assert(!/id="answer-reveal"/.test(index), "answer-reveal panel removed — blank scar teaches inline");
assert(/id="menu-road-progress"/.test(index), "menu road progress");
assert(/fillResultsBoard/.test(game), "results board filler");
assert(/fillResultsInsights/.test(game), "results insights filler");
assert(/drawHeatmap/.test(game), "heatmap drawer");
assert(/drawJournal/.test(game), "journal drawer");
assert(!/showAnswerReveal/.test(game), "showAnswerReveal removed with the duplicate panel");
assert(/paintGhostMarker/.test(game), "ghost marker painter");
assert(/Double-tap same letter/.test(game) || /lastPickKey/.test(game), "double-tap lock");
assert(/quiet/.test(game) && /contrast/.test(game) && /haptics/.test(game), "quiet/contrast/haptics settings");
assert(/blitz-edge/.test(css), "blitz edge flare CSS");
assert(/heatcell\.mastered/.test(css), "heatmap CSS");
assert(/offline-banner\.on/.test(css), "offline banner CSS");
assert(/ghost-mark/.test(css), "ghost mark CSS");

/* polish module surface */
assert(/bookMastery/.test(polish), "bookMastery export");
assert(/blitzAdjustMs/.test(polish), "blitzAdjustMs export");
assert(/insightForVerse/.test(polish), "insightForVerse export");
assert(/pacedClockMs/.test(polish), "pacedClockMs export — one clock for every surface");
assert(fs.existsSync(path.join(root, "supabase", "functions", "submit-score", "index.ts")), "edge function scaffold");
/* Scores go through the edge function first, direct write only as fallback. */
assert(/functions\.invoke\("submit-score"/.test(cloud), "cloud submits via the edge function");
assert(/via: "edge"/.test(cloud) && /via: "direct"/.test(cloud), "edge-first with direct fallback");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — improvements · " + [
  "security", "performance", "blitz", "boards", "heatmap", "ghost", "insights", "ux"
].join(" · "));
