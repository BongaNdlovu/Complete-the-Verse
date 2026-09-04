/**
 * Legacy UI structure checks — retargeted to split index.html after monolith deletion.
 * Run: node ui-structure.test.js
 */
const fs = require("fs");
const ROOT = require("../scripts/repo-root");
const path = require("path");

const file = path.join(ROOT, "index.html");
const html = fs.readFileSync(file, "utf8");
const css = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8") + "\n" + fs.readFileSync(path.join(ROOT, "css", "play.css"), "utf8");
/* The engine is split across module files; static checks read the
   concatenation through the one shared list (scripts/engine-source.js). */
const { readEngine } = require("../scripts/engine-source");
const game = readEngine(ROOT);
const fails = [];

function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

assert(!fs.existsSync(path.join(ROOT, "complete-the-verse(1) (1).html")), "old monolith must be deleted");
assert(!html.includes('id="neural-bg"'), "neural-bg canvas must be removed");
assert(!/<div class="ai-chrome"/.test(html), "ai-chrome must be removed from markup");
assert(!/<div class="ai-orbit"/.test(html), "ai-orbit must be removed from markup");
assert(!/<div class="ai-scan"/.test(html), "ai-scan must be removed from markup");
assert(!/<div class="ai-analysis"/.test(html), "ai-analysis must be removed from markup");
assert(!html.includes("Ambient neural field"), "neural ambient script must be removed");
assert(!html.includes("Preparing the arena"), "cyber boot copy must be unified");
assert(html.includes("Preparing the record"), "scripture boot copy must be present");
assert(html.includes("boot-verse"), "boot screen carries a verse line");
assert(/function playBootSequence\(/.test(game), "playBootSequence helper present");

assert(html.includes('id="v-intro"'), "intro view present");
assert(html.includes('id="v-tablets"'), "tablets view present");
assert(html.includes('id="tablets-pause"'), "tablets pause overlay present");
assert(!html.includes('id="tablets-hear"'), "tablets hear control removed");
assert(html.includes('id="tablets-illum"'), "tablets illuminate control present");
assert(html.includes('id="tablets-remain"'), "tablets remaining counter present");
assert(html.includes('id="tablets-candle"'), "tablets scene candle present");
assert(html.includes('id="tablets-companion"'), "tablets companion present");
assert(html.includes('id="intro-video"'), "intro video element present");
assert(fs.existsSync(path.join(ROOT, "assets", "intro.mp4")), "assets/intro.mp4 exists");
assert(fs.existsSync(path.join(ROOT, "audio", "voice", "intro-word.mp3")), "intro voice file exists");
assert(html.includes("assets/intro.mp4"), "intro video path wired");
assert(game.includes("audio/voice/intro-word.mp3"), "intro voice line wired");
assert(/function beginIntroPlayback\(/.test(game), "intro playback helper present");
assert(/function finishIntro\(/.test(game), "intro finish helper present");

assert(html.includes('id="hall-bg"'), "hall background video element present");
assert(fs.existsSync(path.join(ROOT, "assets", "hall.mp4")), "assets/hall.mp4 exists");
assert(fs.statSync(path.join(ROOT, "assets", "hall.mp4")).size < 14 * 1024 * 1024,
  "hall.mp4 stays under 14MB for the web pack");
assert(html.includes("assets/hall.mp4"), "hall video is sourced in the page");
assert(html.includes('id="ur-prologue"') && html.includes('id="ur-prologue-skip"'),
  "stage film overlay and skip are in the play stage");
assert(!html.includes("assets/ur-prologue.mp4"), "Abraham Ur film is not sourced");
assert(/function maybePlayUrPrologue\(\)\{[\s\S]{0,140}return false/.test(game),
  "Ur start does not play an opening film");
assert(/function maybePlayTeamPrologue/.test(game), "Team Mode plays a film before the first team");
assert(css.includes(".team-mark"), "Team Mode paints White/Blue side marks");
assert(css.includes("body.biblical-thriller.team-white .hdr-rule"), "White Team tints the play header");
assert(css.includes("body.biblical-thriller.team-blue .hdr-rule"), "Blue Team tints the play header");
assert(css.includes(".brow.team-row"), "Team tally rows carry side color");
assert(/class="team-mark white/.test(game), "Team Mode HUD renders White/Blue marks");
assert(fs.existsSync(path.join(ROOT, "assets", "team-prologue.mp4")), "assets/team-prologue.mp4 exists");
assert(fs.statSync(path.join(ROOT, "assets", "team-prologue.mp4")).size < 2 * 1024 * 1024,
  "Team Mode film stays under 2MB");
const beatPrologue = path.join(ROOT, "assets", "beats", "goliath", "prologue.mp4");
assert(fs.existsSync(beatPrologue), "assets/beats/goliath/prologue.mp4 exists");
assert(fs.statSync(beatPrologue).size < 20 * 1024 * 1024, "Valley prologue film stays under 20MB");
  assert(fs.existsSync(path.join(ROOT, "assets", "beats", "goliath", "win.webp")), "Valley win still exists");
  assert(fs.existsSync(path.join(ROOT, "assets", "beats", "goliath", "loss.webp")), "Valley loss still exists");
assert(game.includes('playStageFilm("assets/beats/goliath/prologue.mp4"'),
  "Valley start plays the prologue film");
assert(!/function startBeatStage\(\)\{[\s\S]*?playBeatCinema\(Beat\.cinemaA\)/.test(game),
  "Valley start no longer plays cinema A");
assert(css.includes("#v-results.beat-win") && css.includes("#v-results.beat-loss"),
  "Valley results paint win and loss stills");
assert(/\.ending-stage\{[^}]*flex-shrink:\s*0/.test(css),
  "results ending card cannot shrink under the title");
assert(/urPrologueDone/.test(game), "Ur opening film is once per save");
assert(/function syncHallVideo\(/.test(game), "syncHallVideo helper present");
assert(css.includes("body.hall-ready #hall-bg"), "hall video fades in when ready");
assert(css.includes("body.quality-low #hall-bg"), "efficient profile hides the hall video");

assert(css.includes("hud-away") || html.includes("hud-away"), "play HUD secondary chrome class required");
assert(css.includes("#v-play .hud-away"), "CSS must hide hud-away on play");
assert(css.includes("#v-play .momentum"), "CSS must hide momentum on play");
assert(css.includes("#v-play .kjv"), "CSS must hide KJV badge on play");
assert(css.includes("#v-play .hdr-title"), "CSS must hide play header brand");
assert(!/biblical-thriller #v-play \.hdr-title\{display:block!important\}/.test(css),
  "play header brand stays hidden in every mode");
assert(/\.stage\{[^}]*z-index:3/.test(css) || /\.stage\{[^}]*z-index:\s*3/.test(css.replace(/\s/g,"")),
  "play stage stacks above the companion art");
assert(/\.fade-countdown-bar\s*\{[^}]*display:\s*none/.test(css),
  "Fade uses the HUD clock instead of a second timer");
assert(css.includes("body.abraham-active .witness"), "companion sites do not stack two portraits");
assert(css.includes("body.onboarding .play-top-stack"), "tutorial does not stack the act track under the lesson card");
assert(css.includes("body.onboarding .rail.l"), "tutorial hides the lamp rail so the lesson card is clear");
assert(css.includes("body.view-play .voice-caption"), "play voice captions sit above the power row");

assert(html.includes('id="hud-streak"'), "streak id kept for JS updates");
assert(html.includes('id="hud-accuracy"'), "accuracy id kept for JS updates");
assert(html.includes('id="hud-lives"'), "lives remain on play HUD");
assert(html.includes('id="score"'), "score remains on play HUD");
assert(html.includes('id="confirm-answer"'), "Lock Answer control required");
assert(html.includes('id="play-control"'), "play action row hosts I'm Done");
assert(html.includes('id="play-quit"'), "play view offers a Quit control");
assert(html.includes('id="audio-dock"'), "play HUD offers music and SFX toggles");
assert(html.includes('id="audio-music"') && html.includes('id="audio-sfx"'), "music and SFX toggle ids present");
assert(html.includes('data-audio="music"') && html.includes('data-audio="sfx"'), "audio toggles name their layer");
assert(css.includes("body.view-play #audio-dock") && css.includes("body.view-tablets #audio-dock") && css.includes("body.cine #audio-dock"),
  "audio toggles show during play, tablets, and act cards");
assert(/function paintAudioDock\(/.test(game) && /toggleMute\(/.test(game),
  "audio dock bind and mute live in the engine");
assert(html.includes('id="play-candle"'), "play view offers the progress candle");

assert(css.includes("min-height:52px"), "mobile Lock CTA min-height 52px");
assert(css.includes("font-size:.78rem"), "mobile Lock CTA readable font size");

assert(!html.includes('class="topright"'), "duplicate icon nav must be gone");
assert(!game.includes('className="topright"'), "topright not created in JS");
assert(html.includes('data-go="settings"'), "settings still reachable via subnav");

assert(html.includes('class="res-details"'), "results details panels required");
assert(html.includes("res-primary"), "primary results CTA cluster required");
assert(html.includes('id="res-again"'), "Run It Back still present");

assert(game.includes("Accuracy</span>"), "pause includes accuracy");

assert(/function fitVerseSize\(len\)/.test(game), "fitVerseSize helper required");
assert(game.includes("vlen-md") && game.includes("vlen-lg") && game.includes("vlen-xl"), "verse length tier classes required");
assert(css.includes(".verse-main.vlen-md") && css.includes(".verse-main.vlen-xl"), "CSS verse length tiers required");

/* ---------- Recall mode: the missing phrase is assembled, not typed ---------- */
assert(game.includes('id="typed-answer"'), "hidden assembled-answer field is rendered");
assert(game.includes('autocomplete="off"') && game.includes('spellcheck="false"'),
  "the hidden field must not autocomplete or spellcheck the answer away");
assert(game.includes('id="asm-bank"') && game.includes('id="asm-slots"'),
  "assemble bank and slots are rendered");
assert(game.includes('aria-label="Assemble the missing words"') || game.includes('aria-label="The missing phrase"'),
  "assemble surface is labelled for screen readers");
assert(game.includes('aria-live="polite"'), "the verdict is announced");
assert(css.includes(".asm-bank") && css.includes(".asm-slot") && css.includes(".asm-tile"),
  "assemble bank, slots and tiles are styled");
assert(css.includes(".typed-hint"), "hint/verdict styled");
assert(/@media \(max-width:600px\)[\s\S]*\.asm-/.test(css) || /@media \(max-width:600px\)[\s\S]*\.typed-input/.test(css),
  "assemble has a mobile size");

/* The verdict must always show the exact wording — being marked wrong
   without seeing the verse teaches nothing. */
assert(game.includes("function renderTypedVerdict"), "typed verdict renderer required");
assert(/The verse reads/.test(game), "verdict shows the exact wording");

/* Enter submits from inside the input, which the global key handler
   deliberately ignores while an input has focus. */
assert(/input\.addEventListener\("keydown"/.test(game), "Enter submits from the input");
assert(game.includes("function confirmTyped"), "typed confirm path exists");
assert(/if\(R\.typed\) return confirmTyped\(\);/.test(game), "Lock Answer routes to the typed path");

/* ---------- review scheduling surfaces ---------- */
assert(html.includes('id="res-schedule"'), "next-review panel present in results");
assert(css.includes(".schedule"), "next-review panel styled");
assert(css.includes(".schedrow"), "next-review rows styled");
assert(html.includes('value="due"'), "Study Hall filters to due verses");
assert(html.includes('value="held"') && html.includes('value="learning"'),
  "Study Hall exposes the schedule bands");
assert(!html.includes('value="mastered"'), "accuracy-based filter replaced by schedule bands");
assert(css.includes(".mode .pill.due"), "due-count pill styled");
assert(css.includes(".mastery.m2"), "learning band styled in Study Hall");
assert(game.includes("function verseScheduleLabel"), "Study Hall shows the schedule");

/* ---------- the Pilgrimage: markup the atlas reaches for by id ----------
   atlas.js resolves these with getElementById and quietly does nothing
   when one is absent, which is the right behaviour at runtime and a
   terrible way to find out you deleted a div. So the contract between
   the markup and the module is asserted here instead. */
const atlas = fs.readFileSync(path.join(ROOT, "css", "atlas.css"), "utf8");
const atlasJs = fs.readFileSync(path.join(ROOT, "js", "atlas.js"), "utf8");

[ "v-atlas", "atlas-map", "atlas-rail", "atlas-rail-list", "atlas-dossier",
  "atlas-doss-body", "atlas-doss-actions", "atlas-doss-handle", "atlas-layers", "atlas-note",
  "atlas-open", "atlas-fill", "atlas-count", "atlas-zin", "atlas-zout",
  "atlas-zfit", "atlas-rail-toggle"
].forEach(id => assert(html.includes('id="' + id + '"'), "atlas markup provides #" + id));

[ "v-sitebrief", "sb-arc", "sb-name", "sb-quote", "sb-ref", "sb-info",
  "sb-live", "sb-start", "sb-back", "sb-hint"
].forEach(id => assert(html.includes('id="' + id + '"'), "site briefing provides #" + id));

assert(html.includes('id="res-road"'), "results offers a way back to the road");

/* Every id atlas.js looks up must actually exist in the markup. This is
   the assertion that catches a rename on one side only. */
const wanted = new Set();
let m, re = /\$\("([a-z0-9-]+)"\)/g;
while ((m = re.exec(atlasJs))) wanted.add(m[1]);
const orphans = [...wanted].filter(id => !html.includes('id="' + id + '"'));
assert(orphans.length === 0, "atlas.js reaches for ids the markup does not define: " + orphans.join(", "));

/* ---------- atlas styling ---------- */
assert(html.includes('href="css/atlas.css"'), "atlas stylesheet is loaded");
assert(html.includes('href="vendor/leaflet/leaflet.css"'), "vendored Leaflet CSS is loaded");
assert(html.indexOf('href="vendor/leaflet/leaflet.css"') < html.indexOf('href="css/atlas.css"'),
  "atlas.css loads after Leaflet so it can override it");

assert(atlas.includes(".site-marker"), "site markers styled");
assert(atlas.includes(".site-marker.locked") && atlas.includes(".site-marker.cleared") &&
       atlas.includes(".site-marker.current"), "marker states are visually distinct");
assert(atlas.includes(".route-walked") && atlas.includes(".route-ahead"),
  "the walked road and the road ahead are drawn differently");
assert(atlas.includes(".terminator-shape") && atlas.includes(".empire-shape"),
  "night side and empire overlays styled");
assert(/\[data-light="night"\]/.test(atlas) && /\[data-light="day"\]/.test(atlas),
  "the map is graded by the real sky at the site");
assert(/\[data-sky="dust"\]/.test(atlas) && /\[data-sky="rain"\]/.test(atlas),
  "live weather grades the map");

/* The atlas must use the game's own tokens rather than a second palette:
   that is the whole reason it was ported off Tailwind. */
assert(/var\(--gold/.test(atlas) && /var\(--parch/.test(atlas) && /var\(--disp\)/.test(atlas),
  "atlas.css is built on the game's design tokens");
/* Checks for an actual reference, not the word: atlas.css's header
   comment explains why the map was ported off Tailwind, and matching
   prose would fail on the very comment documenting the decision. */
assert(!/cdn\.tailwindcss|tailwind\.min\.css|font-awesome|fontawesome/i.test(html),
  "no Tailwind or FontAwesome is loaded alongside the game's own styles");
assert(!/class="[^"]*\b(?:fa-solid|fa-regular|text-amber-\d|bg-stone-\d)\b/.test(html),
  "no Tailwind or FontAwesome class names survive in the markup");

/* Reduced motion has to reach the map too, not just the game chrome. */
assert(/prefers-reduced-motion/.test(atlas), "atlas respects reduced motion");
assert(atlas.includes("body.reduced .route-line"), "route animation stops under reduced motion");
assert(/@media \(max-width: ?720px\)/.test(atlas), "the atlas has a phone layout");

/* ---------- the Pilgrimage in game.js ---------- */
assert(game.includes('pilgrimage:{ key:"pilgrimage"'), "the Pilgrimage is a mode");
assert(game.includes('"pilgrim-recall"'), "cleared sites can be replayed typed");
assert(/hidden:true/.test(game), "the typed replay is kept off the menu");
assert(game.includes("function openSiteBrief"), "sites get a briefing card");
assert(game.includes("function recordSiteResult"), "finishing a site updates the journey");
assert(game.includes("SAVE.pilgrim"), "journey progress is saved");
assert(/pilgrim:Object\.assign/.test(game), "an older save migrates rather than being wiped");
assert(game.includes("Live.configure"), "live conditions follow the setting");
assert(game.includes('seg("liveWeather"'), "live conditions can be switched off");
assert(game.includes('id="set-road"') || game.includes("set-road"),
  "the journey can be restarted without erasing everything else");
assert(html.includes('id="relic-inspect-modal"'), "relic inspect modal is present in markup");
assert(html.includes('id="inspect-art"'), "inspect art container is in the modal");
assert(css.includes(".brass-corners"), "brass corners framing is defined in CSS");
assert(css.includes(".wax-seal-stamp"), "wax seal stamp is defined in CSS");
assert(/function openRelicInspect\(/.test(game), "openRelicInspect helper is wired");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — index.html UI structure checks · atlas & inspect modal wired");
