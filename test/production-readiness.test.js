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
const sw = read("sw.js");

const failures = [];
function assert(condition, message) {
  if (!condition) failures.push(message);
}

/* Rare Illuminate is a banked mastery reward, not an early-run handout. */
assert(/id:"illumAscendant"/.test(rewards), "rare Illuminate reward is catalogued");
assert(/n % 4 === 3/.test(rewards), "rare Illuminate has a controlled rotation");
assert(/type === "illum"/.test(rewards) && /best\) >= 8/.test(rewards),
  "rare Illuminate requires the eight-answer chain");
assert(/!run\.usedPower/.test(rewards), "rare Illuminate requires a power-free run");
assert(/illumReserve/.test(game) && /reservedIlluminate/.test(game),
  "Illuminate reward is reserved across the next eligible run");
assert(/quickRewardResult\.illuminate/.test(results), "Illuminate is paid at result settlement");
assert(/illumReserve/.test(cloud), "cloud merge preserves the Illuminate reserve");

/* Tutorial recordings are local, stable assets and must remain usable when
   browser speech synthesis is unavailable. */
const lessonClips = [
  ["lesson one choose the phrase that completes the verse", "lesson-one.mp3"],
  ["lesson two name the passage for the verse shown", "lesson-two.mp3"],
  ["lesson three tap the missing words in sequence", "lesson-three.mp3"],
  ["lesson four discern the true scripture reading", "lesson-four.mp3"],
  ["lesson five commit the words before they fade", "lesson-five.mp3"],
  ["lesson five memorize the whole verse for one minute then choose the true king james line", "lesson-five.mp3"],
  ["lesson six assemble the verse from memory", "lesson-six.mp3"]
];
assert(fs.existsSync(path.join(ROOT, "audio", "voice", "lesson-two.mp3")), "lesson-two asset exists on disk");
lessonClips.forEach(([key, file]) => {
  const abs = path.join(ROOT, "audio", "voice", file);
  assert(fs.existsSync(abs) && fs.statSync(abs).size > 500, "lesson voice asset is present: " + file);
  assert(new RegExp('"' + key + '"\\s*:\\s*"audio/voice/' + file.replace(".", "\\.") + '"').test(director),
    "lesson voice mapping is present: " + key);
});

/* The newly supplied soundtrack beds and the dedicated 30-second lesson
   recording must be real local MP3s with active runtime destinations. */
[
  ["audio/indigo.mp3", "indigo"],
  ["audio/heroes.mp3", "heroes"],
  ["audio/final-stillness.mp3", "finalStillness"],
  ["audio/sudden-descent.mp3", "suddenDescent"]
].forEach(([rel, key]) => {
  const abs = path.join(ROOT, rel);
  assert(fs.existsSync(abs) && fs.statSync(abs).size > 100000, "supplied soundtrack is present: " + rel);
  assert(audio.includes(key + ':"audio/' + rel.split("/").pop() + '"'),
    "supplied soundtrack is mapped: " + rel);
});
const lessonFive = fs.readFileSync(path.join(ROOT, "audio", "voice", "lesson-five.mp3"));
const thirtySeconds = fs.readFileSync(path.join(ROOT, "audio", "voice", "thirty-seconds.mp3"));
assert(Buffer.compare(lessonFive, thirtySeconds) !== 0,
  "lesson five is its own one-minute clip, not the thirty-seconds recording");
assert(fs.existsSync(path.join(ROOT, "audio", "voice", "thirty-seconds.mp3")),
  "30-second memorization recording is present");
assert(director.includes('"lesson five memorize the whole verse for thirty seconds then rebuild every word in order":"audio/voice/thirty-seconds.mp3"'),
  "30-second memorization tutorial selects the supplied recording");
assert(read("js/play.js").includes('Snd.ambience("indigo")'),
  "tutorial selects the supplied Indigo bed");
assert(read("js/play.js").includes("function cueQuestionMusic"),
  "live questions share the tutorial Indigo bed");

/* Top HUD visual hierarchy and clean pursuer-free state. */
assert(!/id="rival-hud"/.test(index), "rival-hud is completely removed from index.html");
assert(/class="play-top-stack"/.test(index) &&
  /<div class="play-top-stack">[\s\S]*?id="act-track"[\s\S]*?id="quick-rewards"[\s\S]*?<\/div>/.test(index),
  "top HUD elements are cleanly organized inside .play-top-stack");
assert(!/\.play-top-stack\s*\{[^}]*position:\s*absolute/.test(gameCss),
  "top HUD stack occupies an in-flow slot and cannot cover the question");

/* Readability layer and visual hierarchy contracts. */
assert(/\.stage:?:before\s*\{[\s\S]*?z-index:\s*1/.test(playCss), "readability veil on .stage::before has z-index 1");
assert(/\.question-content\s*\{[^}]*z-index:\s*3/.test(playCss), "question content has z-index 3 above veil");
assert(/\.play-top-stack\s*\{[^}]*z-index:\s*5/.test(gameCss), "top HUD stack has z-index 5 above question content");
assert(/#backdrop\s*\{[\s\S]*?opacity:\s*\.32/.test(playCss), "backdrop opacity is reduced for contrast");

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

/* PWA service worker and offline capability contracts. */
assert(/navigator\.serviceWorker\.register\(['"]\.\/sw\.js['"]\)/.test(read("js/register-sw.js")),
  "service worker registration is wired in register-sw.js");
assert(/js\/register-sw\.js/.test(index), "register-sw.js is loaded from index.html");
assert(/const CACHE_NAME =/.test(sw) && /CACHE_VERSION/.test(sw),
  "service worker defines a version-stamped cache name");
assert(/request\.mode === "navigate"/.test(sw) && /fetch\(request\)/.test(sw),
  "service worker implements network-first strategy for navigation / HTML shell");
assert(/!path\.includes\("audio\/"\)/.test(sw) && /!path\.endsWith\("\.mp3"\)/.test(sw),
  "audio is explicitly excluded from precaching");
assert(!/assets\/beats\/goliath/.test(sw),
  "David Beat stills are not precached — they load when that mode starts");
const questionStill = path.join(ROOT, "assets", "beats", "goliath", "question.jpeg");
assert(fs.existsSync(questionStill) && fs.statSync(questionStill).size < 700000,
  "beat question still is a compact JPEG");
["up.webp", "down.webp"].forEach(function (file) {
  const abs = path.join(ROOT, "assets", "judge", file);
  assert(fs.existsSync(abs) && fs.statSync(abs).size < 500000, "judge burst is compact: " + file);
});
const play = read("js/play.js");
assert(/function heavyMediaAllowed/.test(play), "heavy media has a shared gate");
assert(/allowVideo[\s\S]{0,180}heavyMediaAllowed\(\)/.test(play),
  "site ambient video uses the heavy-media gate");
assert(/function urPrologueAllowed[\s\S]{0,220}heavyMediaAllowed\(\)/.test(play),
  "Ur prologue uses the heavy-media gate");
assert(/MAX_AUDIO_ENTRIES\s*=\s*25/.test(sw) && /trimCache/.test(sw),
  "audio runtime caching is bounded with an LRU cap of 25 entries");
assert(/js\/tablets\.js/.test(sw) && /js\/tablets-canon\.js/.test(sw) && /js\/tablets-hall\.js/.test(sw) && /js\/tablets-run\.js/.test(sw),
  "Word Tablets scripts are precached for offline play");
assert(/privacy\.html/.test(sw) && fs.existsSync(path.join(ROOT, "privacy.html")),
  "privacy page ships and is precached");
assert(!/script-src 'self' 'unsafe-inline'/.test(read("vercel.json")),
  "script-src does not allow unsafe-inline");
const icon192 = path.join(ROOT, "assets", "icon-192.png");
const icon512 = path.join(ROOT, "assets", "icon-512.png");
const iconMask = path.join(ROOT, "assets", "icon-maskable-512.png");
assert(fs.existsSync(icon192) && fs.statSync(icon192).size > 200, "192 PNG icon exists");
assert(fs.existsSync(icon512) && fs.statSync(icon512).size > 400, "512 PNG icon exists");
assert(fs.existsSync(iconMask) && fs.statSync(iconMask).size > 400, "maskable 512 PNG icon exists");
assert(/icon-192\.png/.test(read("manifest.webmanifest")) &&
  /icon-512\.png/.test(read("manifest.webmanifest")),
  "manifest lists raster install icons");
const mig5 = read("supabase/migrations/005_edge_only_scores.sql");
assert(/revoke insert, update, delete on table public\.daily_scores/.test(mig5) &&
  /grant insert, update on table public\.daily_scores to service_role/.test(mig5),
  "score writes are revoked from authenticated and granted to service_role");
assert(/SUPABASE_SERVICE_ROLE_KEY/.test(edge),
  "submit-score writes with the service role after verifying the caller");

/* Media is lazy by default and voice/audio does not eagerly download every bed. */
assert(/preload="none"/.test(index) && /poster="assets\/intro\.jpg"/.test(index),
  "cinematic video uses deferred loading with a poster");
assert(/a\.preload="metadata"/.test(audio) && /a\.preload = "none"/.test(audio),
  "voice metadata and music beds use bounded loading");
assert(/loading="lazy"/.test(index) && /decoding="async"/.test(index) &&
  /loading="lazy"/.test(panels), "non-critical artwork uses lazy async decoding");
assert(/write_webp/.test(optimizer) && /1024px/.test(optimizer) && /1024, 768/.test(optimizer),
  "the media pipeline emits bounded WebP journey scenes");
const journey = ["ur", "haran", "shechem", "hebron", "beersheba", "moriah", "bethel", "penuel", "dothan"];
assert(journey.every((id) => {
  const file = path.join(ROOT, "assets", "journey", id + ".webp");
  return fs.existsSync(file) && fs.statSync(file).size < 220000;
}), "all active journey scenes are compact WebP assets");
assert(journey.every((id) => !fs.existsSync(path.join(ROOT, "assets", "journey", id + ".png"))),
  "unused milestone PNG duplicates are removed");
const mosesQ = path.join(ROOT, "assets", "characters", "moses", "question.png");
assert(fs.existsSync(mosesQ) && fs.statSync(mosesQ).size < 1500000,
  "Moses question art stays under the 1.5MB payload cap");
const gideonQ = path.join(ROOT, "assets", "characters", "gideon", "question.png");
assert(fs.existsSync(gideonQ) && fs.statSync(gideonQ).size < 1500000,
  "Gideon question art stays under the 1.5MB payload cap");
const solomonQ = path.join(ROOT, "assets", "characters", "solomon", "question.png");
assert(fs.existsSync(solomonQ) && fs.statSync(solomonQ).size < 1500000,
  "Solomon question art stays under the 1.5MB payload cap");
const joshuaQ = path.join(ROOT, "assets", "characters", "joshua", "question.png");
assert(fs.existsSync(joshuaQ) && fs.statSync(joshuaQ).size < 1500000,
  "Joshua question art stays under the 1.5MB payload cap");
const elijahQ = path.join(ROOT, "assets", "characters", "elijah", "question.png");
assert(fs.existsSync(elijahQ) && fs.statSync(elijahQ).size < 1500000,
  "Elijah question art stays under the 1.5MB payload cap");
const elijahExileQ = path.join(ROOT, "assets", "characters", "elijah", "question-exile.png");
assert(fs.existsSync(elijahExileQ) && fs.statSync(elijahExileQ).size < 1500000,
  "Elijah exile question art stays under the 1.5MB payload cap");
const jonahQ = path.join(ROOT, "assets", "characters", "jonah", "question.png");
assert(fs.existsSync(jonahQ) && fs.statSync(jonahQ).size < 1500000,
  "Jonah question art stays under the 1.5MB payload cap");
const danielQ = path.join(ROOT, "assets", "characters", "daniel", "question.png");
assert(fs.existsSync(danielQ) && fs.statSync(danielQ).size < 1500000,
  "Daniel question art stays under the 1.5MB payload cap");
const samsonQ = path.join(ROOT, "assets", "characters", "samson", "question.png");
assert(fs.existsSync(samsonQ) && fs.statSync(samsonQ).size < 1500000,
  "Samson question art stays under the 1.5MB payload cap");
const jesusQ = path.join(ROOT, "assets", "characters", "jesus", "question.png");
assert(fs.existsSync(jesusQ) && fs.statSync(jesusQ).size < 1500000,
  "Jesus question art stays under the 1.5MB payload cap");
const baptistQ = path.join(ROOT, "assets", "characters", "baptist", "question.png");
assert(fs.existsSync(baptistQ) && fs.statSync(baptistQ).size < 1500000,
  "John the Baptist question art stays under the 1.5MB payload cap");
const paulQ = path.join(ROOT, "assets", "characters", "paul", "question.png");
assert(fs.existsSync(paulQ) && fs.statSync(paulQ).size < 1500000,
  "Paul question art stays under the 1.5MB payload cap");

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

/* Learning Loop & Context Notes contracts. */
const { loadBank } = require("../scripts/load-bank");
const { VERSES, verseId } = loadBank();
const bankById = {};
VERSES.forEach(v => { bankById[verseId(v)] = v; });

const { VERSE_NOTES } = require("../js/verses-notes");
assert(typeof VERSE_NOTES === "object" && Object.keys(VERSE_NOTES).length >= 100,
  "verse context notes catalog launches with at least 100 notes (got " + Object.keys(VERSE_NOTES).length + ")");

const noteKeys = Object.keys(VERSE_NOTES);
const allNotesValid = noteKeys.every(k => !!bankById[k]);
assert(allNotesValid, "every verse note key resolves to a valid verse in the bank");

assert(/<script src="js\/verses-notes\.js"><\/script>/.test(index),
  "verses-notes.js is loaded in index.html");
assert(/res-verse-note/.test(results) && /VERSE_NOTES\[q\.id\]/.test(results),
  "verse context notes are surfaced on results resolution lines");
assert(/vcard-note/.test(panels) && /VERSE_NOTES\[v\.id\]/.test(panels),
  "verse context notes are surfaced in Study Hall cards");

/* Thin places & Listen-and-rebuild study action contracts. */
assert(/id="thin-places"/.test(index) && /drawThinPlaces/.test(panels),
  "thin places section is wired in Study Hall and index.html");
assert(/SAVE\.books/.test(panels) && /data-practice-book/.test(panels),
  "thin places renders from SAVE.books and provides practice action");
assert(/'speechSynthesis'\s*in\s*window/.test(panels) && /SpeechSynthesisUtterance/.test(panels),
  "Listen & Rebuild study action is guarded by speechSynthesis feature detection");

if (failures.length) {
  console.error("FAIL (" + failures.length + ")");
  failures.forEach((failure) => console.error(" - " + failure));
  process.exit(1);
}
console.log("PASS — production readiness · all contracts passed");
