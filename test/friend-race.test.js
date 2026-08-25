/* ==================================================================
   FRIEND RACE CONTRACTS (Suite 48)
   Tests live room code generation, URL sharing, payload formatting,
   polling throttle, in-flight guard, and graceful offline fallback.
   ================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

const Cloud = require("../js/cloud");
const game = read("js/game.js");
const results = read("js/results.js");

const failures = [];
let assertions = 0;
function assert(condition, message) {
  assertions++;
  if (!condition) failures.push(message);
}

/* 1. Room code generation contract */
assert(typeof Cloud.generateRoomCode === "function", "generateRoomCode is exported by Cloud");

const code1 = Cloud.generateRoomCode();
const code2 = Cloud.generateRoomCode();
assert(typeof code1 === "string" && code1.length === 5, "generateRoomCode produces a 5-character string (got " + code1 + ")");
assert(/^[A-HJ-NP-Z2-9]{5}$/.test(code1), "room code contains only unambiguous uppercase alphanumeric characters (no 0/O/1/I)");
assert(/^[A-HJ-NP-Z2-9]{5}$/.test(code2), "second room code also conforms to character whitelist");

const generatedSet = new Set();
for (let i = 0; i < 50; i++) {
  const c = Cloud.generateRoomCode();
  assert(c.length === 5 && /^[A-HJ-NP-Z2-9]{5}$/.test(c), "code " + i + " meets 5-char spec");
  generatedSet.add(c);
}
assert(generatedSet.size >= 45, "room codes are sufficiently distributed");

/* 2. URL formatting and hash parsing */
assert(typeof Cloud.formatRaceUrl === "function", "formatRaceUrl is exported by Cloud");
assert(typeof Cloud.parseRaceCodeFromUrl === "function", "parseRaceCodeFromUrl is exported by Cloud");

const url = Cloud.formatRaceUrl("ABC23");
assert(/#race=ABC23$/.test(url), "formatRaceUrl attaches #race=ABC23 to base URL (got " + url + ")");

const parsed1 = Cloud.parseRaceCodeFromUrl("#race=ABC23");
assert(parsed1 === "ABC23", "parseRaceCodeFromUrl extracts uppercase room code from hash");

const parsed2 = Cloud.parseRaceCodeFromUrl("https://complete-the-verse.vercel.app/#race=k9m2p");
assert(parsed2 === "K9M2P", "parseRaceCodeFromUrl normalizes to uppercase from full URL");

const parsedInvalid = Cloud.parseRaceCodeFromUrl("#other=123");
assert(parsedInvalid === null, "parseRaceCodeFromUrl returns null for non-race URLs");

/* 3. Live race upsert & fetch signatures */
assert(typeof Cloud.upsertLiveRaceState === "function", "upsertLiveRaceState is exported by Cloud");
assert(typeof Cloud.fetchLiveRaceGhosts === "function", "fetchLiveRaceGhosts is exported by Cloud");

/* Test signed-out / unconfigured graceful fallback */
Cloud.upsertLiveRaceState("ABC23", {
  score: 1200,
  question_index: 3,
  accuracy: 100,
  display_name: "TestRunner"
}).then(res => {
  assert(res && (res.ok === false || res.reason), "upsertLiveRaceState resolves gracefully without throwing when unconfigured");
}).catch(err => {
  assert(false, "upsertLiveRaceState should never throw: " + err.message);
});

Cloud.fetchLiveRaceGhosts("ABC23").then(rows => {
  assert(Array.isArray(rows), "fetchLiveRaceGhosts resolves with an array fallback");
}).catch(err => {
  assert(false, "fetchLiveRaceGhosts should never throw: " + err.message);
});

/* 4. Polling throttle & in-flight guard contracts in game.js */
assert(/function startFriendRacePolling\(/.test(game), "startFriendRacePolling is defined in game.js");
assert(/function stopFriendRacePolling\(/.test(game), "stopFriendRacePolling is defined in game.js");
assert(/POLL_INTERVAL_MS\s*=\s*(2[5-9]\d{2}|[3-9]\d{3})/.test(game),
  "friend race polling interval is throttled to at least 2500ms");
assert(/friendRaceInFlight/.test(game), "friend race polling enforces an in-flight guard to avoid stacked requests");

/* 5. Engine integration & lifecycle contracts */
assert(/if\(R\.friendRoom\)\s*(\{?\s*)?startFriendRacePolling\(R\.friendRoom\)/.test(game),
  "startRun launches friend race polling when R.friendRoom is set");
assert(/stopFriendRacePolling\(\)/.test(results),
  "endRun cleanly terminates friend race polling");

if (failures.length) {
  console.error("FAIL (" + failures.length + ")");
  failures.forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — friend race · " + assertions + " contracts passed");
