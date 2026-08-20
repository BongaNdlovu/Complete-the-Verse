/* Release-readiness contracts for rewards, accessibility, media and boards. */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const index = read("index.html");
const game = read("js/game.js");
const results = read("js/results.js");
const rewards = read("js/rewards.js");
const cloud = read("js/cloud.js");
const director = read("js/director.js");
const briefs = read("js/briefs.js");
const panels = read("js/panels.js");
const audio = read("js/audio.js");
const gameCss = read("css/game.css");
const playCss = read("css/play.css");
const atlasCss = read("css/atlas.css");
const edge = read("supabase/functions/submit-score/index.ts");
const migration = read("supabase/migrations/004_leaderboard_moderation.sql");
const ops = read("docs/LEADERBOARD-OPERATIONS.md");
const optimizer = read("scripts/optimise-media.py");

const failures = [];
function assert(condition, message) {
  if (!condition) failures.push(message);
}

/* Rare Illuminate is a banked mastery reward, not an early-run handout. */
assert(/id:"illumAscendant"/.test(rewards), "rare Illuminate reward is catalogued");
assert(/n % 8 === 7/.test(rewards), "rare Illuminate has a low-frequency rotation");
assert(/type === "illum"/.test(rewards) && /best\) >= 12/.test(rewards),
  "rare Illuminate requires the twelve-answer chain");
assert(/!run\.usedPower/.test(rewards), "rare Illuminate requires a power-free run");
assert(/illumReserve/.test(game) && /reservedIlluminate/.test(game),
  "Illuminate reward is reserved across the next eligible run");
assert(/quickRewardResult\.illuminate/.test(results), "Illuminate is paid at result settlement");
assert(/illumReserve/.test(cloud), "cloud merge preserves the Illuminate reserve");

/* Spoken content remains readable when audio is muted, blocked or unavailable. */
assert(/id="voice-caption"[^>]*role="status"[^>]*aria-live="polite"/.test(index),
  "voice caption status region is present");
assert(/function caption\(text\)/.test(director) && /caption\(text\)/.test(director),
  "Director exposes readable captions for spoken lines");
assert(/Director\.caption\(/.test(briefs), "direct intro audio also gets a caption");

/* Accessibility and touch contracts. */
assert(/--gold-dim:\s*#b79a58/.test(gameCss) && /--parch-dim:\s*#b4aa98/.test(gameCss),
  "default contrast tokens are readable");
assert(/\.iconbtn\{width:44px;height:44px/.test(gameCss), "icon controls meet the touch target");
assert(/\.btn\.sm\{[^}]*min-height:44px/.test(gameCss), "small buttons meet the touch target");
assert(/\.seg button\{[^}]*min-height:44px/.test(gameCss), "segmented controls meet the touch target");
assert(/\.pwr\{[^}]*min-height:44px/.test(playCss), "power buttons meet the touch target");
assert(/\.vkb-key\{[^}]*min-height:44px/.test(gameCss), "keyboard keys meet the touch target");
assert(/\.board-report\{[^}]*min-height:44px/.test(gameCss), "report controls meet the touch target");

/* Loading, offline, empty and error states are intentional UI states. */
assert(/id="offline-banner"/.test(index) && /offline-banner\.on/.test(gameCss),
  "offline state is visible and styled");
assert(/showState\("empty-draw"/.test(game) && /showState\("cloud-fail"/.test(panels),
  "empty and cloud-failure states have recovery paths");
assert(/board-loading/.test(panels) && /Could not reach the board/.test(panels),
  "leaderboard loading and error states are represented");
assert(/onSync/ .test(cloud) && /Syncing/.test(read("js/briefs.js")) && /Sync error/.test(read("js/briefs.js")),
  "cloud syncing and error status are surfaced");

/* Media is lazy by default and voice/audio does not eagerly download every bed. */
assert(/preload="none"/.test(index) && /poster="assets\/intro\.jpg"/.test(index),
  "cinematic video uses deferred loading with a poster");
assert(/a\.preload="metadata"/.test(audio) && /a\.preload = "none"/.test(audio),
  "voice metadata and music beds use bounded loading");
assert(/loading="lazy"/.test(index) && /decoding="async"/.test(index) &&
  /loading="lazy"/.test(panels), "non-critical artwork uses lazy async decoding");
assert(/write_webp/.test(optimizer) && /1024px/.test(optimizer) && /1024, 768/.test(optimizer),
  "the media pipeline emits bounded WebP journey scenes");
const journey = ["ur", "haran", "shechem", "bethel", "penuel", "hebron", "beersheba", "moriah", "dothan"];
assert(journey.every((id) => {
  const file = path.join(ROOT, "assets", "journey", id + ".webp");
  return fs.existsSync(file) && fs.statSync(file).size < 220000;
}), "all active journey scenes are compact WebP assets");
assert(journey.every((id) => !fs.existsSync(path.join(ROOT, "assets", "journey", id + ".png"))),
  "unused milestone PNG duplicates are removed");

/* Leaderboards require the trusted function, rate limiting and moderation. */
assert(/trusted-submit-unavailable/.test(cloud) && !/via: "direct"/.test(cloud),
  "browser score writes fail closed without the trusted function");
assert(/MAX_SUBMISSIONS_PER_WINDOW/.test(edge) && /rate-limited/.test(edge) &&
  /validDate/.test(edge), "edge submission validates dates and rate limits callers");
assert(/score_submission_log/.test(migration) && /leaderboard_reports/.test(migration) &&
  /enable row level security/.test(migration) && /revoke update, delete/.test(migration),
  "leaderboard abuse logging and report isolation are migrated");
assert(/reportScore/.test(cloud) && /data-report-score/.test(panels),
  "players can report a suspicious public score");
assert(/monitoring/i.test(ops) && /moderation/i.test(ops) && /recovery/i.test(ops),
  "leaderboard operations include monitoring, moderation and recovery");

if (failures.length) {
  console.error("FAIL (" + failures.length + ")");
  failures.forEach((failure) => console.error(" - " + failure));
  process.exit(1);
}
console.log("PASS — production readiness · all contracts passed");
