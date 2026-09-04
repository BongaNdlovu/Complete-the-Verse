/**
 * Mobile layout contracts at 390×844: compact play shell, Study Hall
 * grid, toast anchor, keyboard-hint hide. Static CSS/HTML checks.
 * Run: node test/mobile-layout.test.js
 */
const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");

const play = fs.readFileSync(path.join(ROOT, "css", "play.css"), "utf8");
const game = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8");
const atlas = fs.readFileSync(path.join(ROOT, "css", "atlas.css"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const fails = [];
function assert(name, cond) {
  if (!cond) fails.push(name);
}

assert("phone play shell sits after biblical-thriller rules",
  play.lastIndexOf("Phone play shell") > play.lastIndexOf("body.biblical-thriller{"));
assert("phone stage is a 3-row grid",
  /#v-play \.stage\{[^}]*grid-template-rows:auto auto minmax\(0,1fr\)/.test(play));
assert("phone question-content has no max-height cap",
  /#v-play \.question-content\{[^}]*max-height:none/.test(play));
assert("phone answers stay a 2×2 grid",
  /#v-play \.answers\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/.test(play));
assert("phone typed/assemble bank is a single column",
  /#v-play \.answers\.typed\{[^}]*display:flex;flex-direction:column/.test(play));
assert("phone powerbar stays in-flow and nowrap",
  /#v-play \.powerbar\{[^}]*position:static[^}]*flex-wrap:nowrap/.test(play));
assert("phone decorative footer collapses",
  /#v-play \.ftr\{[^}]*height:0/.test(play));
assert("phone header does not wrap to a second row",
  /#v-play \.hdr\{[^}]*flex-wrap:nowrap/.test(play));
assert("powerbar remains a reserved flex footer",
  /\.powerbar\{[^}]*flex:\s*0\s*0\s*auto/.test(play));

assert("Study Hall uses 6 columns on phones",
  /@media \(max-width:600px\)[\s\S]*\.heatgrid\{grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/.test(game));
assert("results stats stack 2-up on phones",
  /@media \(max-width:600px\)[\s\S]*\.stats\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/.test(game));
assert("toasts sit on the bottom safe area, not 12vh",
  /\.toast\{[^}]*bottom:max\(12px,env\(safe-area-inset-bottom/.test(game) &&
  !/\.toast\{[^}]*bottom:12vh/.test(game));
assert("coarse pointers hide keyboard-only hints",
  /pointer:coarse\)\{[\s\S]*\.kb-hint/.test(game));
assert("narrow viewports hide keyboard-only hints",
  /@media \(max-width:600px\)[\s\S]*\.kb-hint,\.tablets-keys-hint,\.tablets-hotkey\{display:none!important\}/.test(game));
assert("how-to-play keyboard chords are marked kb-hint",
  /class="kb-hint"> \(or press A–D \/ 1–4\)/.test(html));
assert("phone inspect art shrinks so the close button stays on screen",
  /@media \(max-width:600px\)[\s\S]*\.inspect-art\{width:min\(160px,42vw\)/.test(game));
assert("phone journey kicker clears the close button",
  /@media \(max-width:600px\)[\s\S]*#jv-kick\{padding-right:52px/.test(game));
assert("tablets brief list is a page scroll on phones",
  /@media \(max-width:600px\)[\s\S]*#brief-tablets-pick\{max-height:none/.test(game));
assert("brief keyboard legend is marked kb-hint",
  /class="hint kb-hint"/.test(html));
assert("assemble chips meet 44px on phones",
  /@media \(max-width:600px\)[\s\S]*\.asm-tile,\.asm-slot,\.cloze-chip\{min-height:44px/.test(game));

assert("atlas tools sit on the bottom safe area on phones",
  /@media \(max-width: 720px\)[\s\S]*\.atlas-tools \{[\s\S]*bottom: max\(10px, env\(safe-area-inset-bottom\)\)/.test(atlas));
assert("phone atlas hides the Leaflet scale under Night",
  /@media \(max-width: 720px\)[\s\S]*#v-atlas \.leaflet-bottom\.leaflet-left \{ display: none; \}/.test(atlas));
assert("phone atlas tools follow the dossier sheet height",
  /@media \(max-width: 720px\)[\s\S]*\.atlas-dossier:not\(\.hidden\) ~ \.atlas-tools \{[\s\S]*bottom: calc\(var\(--atlas-sheet\) \+ 8px\)/.test(atlas));
assert("phone atlas dossier is a variable-height sheet",
  /@media \(max-width: 720px\)[\s\S]*\.atlas-dossier \{[\s\S]*height: var\(--atlas-sheet\)/.test(atlas));
assert("phone atlas exposes a drag handle for the dossier",
  /id="atlas-doss-handle"/.test(html));
assert("atlas.js binds the dossier sheet handle",
  /function bindDossierSheet/.test(fs.readFileSync(path.join(ROOT, "js", "atlas.js"), "utf8")));
assert("phone Study Hall lists verses before the heatmap",
  /@media \(max-width:600px\)[\s\S]*#v-study \.listwrap\{order:2/.test(game));
assert("phone scholar confirm stays in the sheet footer",
  /@media \(max-width:600px\)[\s\S]*\.char-panel \.footer\{flex:0 0 auto/.test(game));
assert("phone site brief hides weather so Begin stays on screen",
  /@media \(max-width:600px\)[\s\S]*#v-sitebrief \.brief-live\{order:7;display:none\}/.test(game));
assert("phone site brief puts Begin above the ordeal cards",
  /@media \(max-width:600px\)[\s\S]*#v-sitebrief \.scrollpad > div:has\(#sb-start\)\{order:5/.test(game));
assert("phone play audio dock sits on the quit side, not the clock",
  /@media \(max-width:600px\)[\s\S]*body\.view-play #audio-dock\{[\s\S]*right:max\(8px,env\(safe-area-inset-right\)\)/.test(game));

const tablets = fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8");
assert("tablets phone header does not wrap",
  /Phone shell[\s\S]*\.tablets-top\{[^}]*flex-wrap:nowrap/.test(tablets));
assert("tablets phone hides the stats row",
  /Phone shell[\s\S]*\.tablets-chip span,\.tablets-stats,\.tablets-tier\{display:none\}/.test(tablets));
assert("tablets phone stones stay tappable",
  /Phone shell[\s\S]*\.tablets-stone\{height:56px/.test(tablets));

if (fails.length) {
  console.error("FAIL — mobile layout\n  " + fails.join("\n  "));
  process.exit(1);
}
console.log("PASS — mobile layout · play shell · study hall · toast · kb hints · atlas · tablets");
