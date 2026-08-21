/* Rival race contracts: visible opponent, recoverable pressure, and route
   scoped ghost persistence. These checks intentionally stay deterministic;
   network availability is not part of the gameplay contract. */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const game = read("js/game.js");
const play = read("js/play.js");
const results = read("js/results.js");
const index = read("index.html");
const css = read("css/game.css");

const failures = [];
let assertions = 0;
function assert(condition, message){ assertions++; if(!condition) failures.push(message); }

/* 1. HUD accessibility and baseline contracts */
assert(/id="rival-hud"[^>]*role="status"/.test(index), "rival HUD is an announced status region");
assert(/function syntheticRivalGhost\(/.test(game) && /The Pursuer/.test(game),
  "new players receive a visible pursuer baseline");
assert(/pilgrimageBySite/.test(game) && /function rivalRunKey\(/.test(game) &&
  /return R\.siteId \? "site:"/.test(game), "pilgrimage ghosts are keyed by site");
assert(/R\.mode === "trial"/.test(game) && /return "campaign"/.test(game),
  "Trial ghosts share one campaign route");
assert(/fetchGhosts\(rivalCloudMode\(\), rivalRunKey\(\), 5\)/.test(game),
  "cloud ghosts can replace the local baseline");
assert(/nextClockPenalty = Math\.min\(1800, 700/.test(play),
  "miss pressure shortens the next clock with a cap");
assert(/R\.rivalFog = R\.missStreak >= 2/.test(play) && /rival-decoy/.test(play),
  "repeated misses create a temporary readable decoy");
assert(/R\.rivalSetback = true/.test(play) && /permanent progress is safe/.test(play),
  "three misses record recoverable retreat pressure");
assert(/currentMechanic === "fade" && R\.fadePhase === "memorize"/.test(play) &&
  /dur = Math\.max\(4500, dur - penalty\)/.test(play),
  "the rival penalty excludes Fade's 30-second memory phase");
assert(/SAVE\.ghosts\.pilgrimageBySite\[R\.siteId\]/.test(results) &&
  /ghostKey = R\.mode === "trial" \? "campaign" : "site:"/.test(results),
  "results save and upload route-scoped ghost records");
assert(/Permanent relics and cleared sites are safe/.test(results),
  "results explain the non-destructive consequence");
assert(/\.rival-hud/.test(css) && /\.rival-decoy/.test(read("css/play.css")),
  "rival presentation styles are shipped");

/* 2. Rival asset file existence, PNG binary signature, dimensions, and alpha checks */
const rivalAssets = [
  { key: "pursuer", file: "assets/rival/shadow-pursuer.png" },
  { key: "pilgrim", file: "assets/rival/previous-pilgrim.png" },
  { key: "threat", file: "assets/rival/rival-mask.png" }
];

rivalAssets.forEach(({ key, file }) => {
  const abs = path.join(ROOT, file);
  assert(fs.existsSync(abs), "rival asset exists: " + file);
  if (fs.existsSync(abs)) {
    const stat = fs.statSync(abs);
    assert(stat.size > 1000, "rival asset is non-empty (>1KB): " + file);
    assert(stat.size < 600 * 1024, "rival asset file size is bounded (<600KB): " + file + " (" + (stat.size/1024).toFixed(1) + "KB)");

    const buf = fs.readFileSync(abs);
    const isPng = buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
    assert(isPng, "valid PNG signature for " + file);

    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    assert(width === 512 && height === 512, "exact 512x512 dimensions for " + file + " (got " + width + "x" + height + ")");

    const depth = buf.readUInt8(24);
    assert(depth === 8, "8-bit channel depth for " + file);

    const colorType = buf.readUInt8(25);
    assert(colorType === 4 || colorType === 6, "alpha channel present (PNG color type 4 or 6) for " + file + " (got " + colorType + ")");
  }
});

/* 3. Static runtime references to all three assets */
assert(/RIVAL_ASSETS/.test(game), "RIVAL_ASSETS map is defined in game runtime");
assert(/assets\/rival\/shadow-pursuer\.png/.test(game), "shadow-pursuer.png is referenced in game runtime");
assert(/assets\/rival\/previous-pilgrim\.png/.test(game), "previous-pilgrim.png is referenced in game runtime");
assert(/assets\/rival\/rival-mask\.png/.test(game), "rival-mask.png is referenced in game runtime");

/* 4. Rival source and pressure mapping logic */
const rivalAssetMatch = game.match(/const RIVAL_ASSETS\s*=\s*Object\.freeze\(\{[\s\S]*?\}\);[\s\S]*?function rivalAssetPath\([^\)]*\)\s*\{[\s\S]*?\}/);
assert(rivalAssetMatch, "RIVAL_ASSETS and rivalAssetPath function are extractable from game.js");

if (rivalAssetMatch) {
  const scope = {};
  new Function("scope", rivalAssetMatch[0] + "; scope.RIVAL_ASSETS = RIVAL_ASSETS; scope.rivalAssetPath = rivalAssetPath;")(scope);
  const { RIVAL_ASSETS, rivalAssetPath } = scope;

  assert(rivalAssetPath("pursuer", 0) === RIVAL_ASSETS.pursuer, "synthetic pursuer maps to shadow-pursuer.png");
  assert(rivalAssetPath("local", 0) === RIVAL_ASSETS.pilgrim, "local ghost maps to previous-pilgrim.png");
  assert(rivalAssetPath("cloud", 0) === RIVAL_ASSETS.pilgrim, "cloud ghost maps to previous-pilgrim.png");
  assert(rivalAssetPath("pursuer", 2) === RIVAL_ASSETS.threat, "pursuer with 2 misses maps to threat mask");
  assert(rivalAssetPath("local", 2) === RIVAL_ASSETS.threat, "local with 2 misses maps to threat mask");
  assert(rivalAssetPath("cloud", 3) === RIVAL_ASSETS.threat, "cloud with 3 misses maps to threat mask");
}

/* 5. Fallback handler and image layering in updateRivalRace */
assert(/<div class="rival-figure"[^>]*><span>◈<\/span><img/.test(game),
  "updateRivalRace renders fallback glyph span under the image");
assert(/onerror="this\.remove\(\)"/.test(game),
  "image element includes onerror handler to remove failed image and show fallback glyph");

/* 6. Results panel threat asset on retreat */
assert(/res-rival/.test(results) && /rival-mask\.png/.test(results),
  "results panel renders threat mask image on retreat");
assert(/Permanent relics and cleared sites are safe/.test(results),
  "results panel retains non-destructive safety message on retreat");

/* 7. CSS positioning, top stack hierarchy, and readability veil */
assert(/class="play-top-stack"/.test(index), ".play-top-stack container exists in HTML");
assert(/<div class="play-top-stack">[\s\S]*?id="act-track"[\s\S]*?id="quick-rewards"[\s\S]*?id="rival-hud"[\s\S]*?<\/div>/.test(index),
  "act-track, quick-rewards, and rival-hud are children inside .play-top-stack");
assert(/<div class="question-content">[\s\S]*?id="verse-stage"[\s\S]*?id="opts"/.test(index),
  "question-content wraps verse-stage and answer options");

assert(/\.play-top-stack\s*\{[^}]*position:\s*relative/i.test(css), ".play-top-stack is positioned relatively");
assert(/\.play-top-stack\s*\{[^}]*z-index:\s*5/i.test(css), ".play-top-stack has z-index 5");
assert(/\.play-top-stack\s*\{[^}]*display:\s*flex/i.test(css), ".play-top-stack is flex column");

assert(/\.act-track\s*\{[^}]*position:\s*relative/i.test(css), "act-track is positioned relatively");
assert(/\.quick-rewards\s*\{[^}]*position:\s*relative/i.test(css), "quick-rewards is positioned relatively");
assert(/\.rival-hud\s*\{[^}]*position:\s*relative/i.test(css), "rival-hud is positioned relatively");

const playCss = read("css/play.css");
assert(!/\.play-top-stack\s*\{[^}]*position:\s*absolute/i.test(css) &&
  !/\.rival-hud\s*\{[^}]*position:\s*absolute/i.test(css) &&
  !/\.quick-rewards\s*\{[^}]*position:\s*absolute/i.test(css) &&
  !/\.act-track\s*\{[^}]*position:\s*absolute/i.test(css),
  "top HUD stack elements are not absolutely positioned in CSS");

assert(/\.biblical-thriller\s+\.stage:?:before\s*\{[\s\S]*?z-index:\s*1/i.test(playCss),
  "readability veil on .stage::before has z-index 1");
assert(/\.question-content\s*\{[^}]*z-index:\s*3/i.test(playCss),
  "question-content has z-index 3 above the readability veil");
assert(/\.biblical-thriller\s+#backdrop\s*\{[\s\S]*?opacity:\s*\.32/i.test(playCss),
  "backdrop artwork has reduced opacity (0.32) for text readability");

assert(/\.rival-figure\s*\{[^}]*position:\s*relative/i.test(css), "rival-figure is positioned relatively");
assert(/\.rival-figure\s*img\s*\{[^}]*position:\s*absolute/i.test(css), "rival-figure img is positioned absolutely");
assert(/\.rival-figure\s*img\s*\{[^}]*object-fit:\s*contain/i.test(css), "rival-figure img has object-fit contain");
assert(/\.rival-figure\s*span\s*\{[^}]*position:\s*relative/i.test(css), "rival-figure span has relative z-index");

assert(/@media\s*\(\s*max-width:\s*600px\s*\)\s*\{[\s\S]*?\.question-content\s*\{[^}]*flex:\s*0\s*0\s*auto/i.test(playCss),
  "mobile media queries preserve normal document flow and prevent clipping");

if(failures.length){
  console.error("FAIL ("+failures.length+")");
  failures.forEach((f)=>console.error(" - "+f));
  process.exit(1);
}
console.log("PASS — rival race · " + assertions + " contracts passed");
