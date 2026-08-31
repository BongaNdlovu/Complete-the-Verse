const fs = require("fs");
const ROOT = require("../scripts/repo-root");
const path = require("path");

const { readEngine } = require("../scripts/engine-source");
const src = readEngine(ROOT);

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : ""));
  }
}

/* Pull a MODE entry block from const MODES = { ... } */
function modeBlock(key) {
  const modesMatch = src.match(/const MODES = \{([\s\S]*?)\n\s*\};/);
  const modesSrc = modesMatch ? modesMatch[1] : src;
  const markers = ["\n  " + key + ":", "\n  \"" + key + "\":", "\n" + key + ":", "\n\"" + key + "\":"];
  let start = -1, marker = "";
  markers.some(function(m){ const i = modesSrc.indexOf(m); if(i < 0) return false; start = i + m.length; marker = m; return true; });
  if(start < 0) return "";
  const rest = modesSrc.slice(start);
  const next = rest.slice(1).search(/\n\s*\"?[A-Za-z0-9-]+\"?\s*:\s*\{/);
  return next < 0 ? rest : rest.slice(0, next + 1);
}

const publicModes = ["pilgrimage", "beat", "tablets", "daily", "blitz", "trial", "endless", "practice", "recall", "team"];
const hiddenModes = ["relay", "pilgrim-recall"];

publicModes.forEach(k => {
  const b = modeBlock(k);
  ok(k + " is defined", b.length > 0);
  ok(k + " is on the menu", !/\bhidden:\s*true\b/.test(b));
});

hiddenModes.forEach(k => {
  const b = modeBlock(k);
  ok(k + " is defined", b.length > 0);
  ok(k + " is hidden from the menu", /\bhidden:\s*true\b/.test(b));
});

/* The menu renders in a fixed order with the campaign first. */
ok("MENU_ORDER puts the Pilgrimage first",
  /const MENU_ORDER = \["pilgrimage"/.test(src));
ok("MENU_ORDER lists pilgrimage",
  new RegExp("const MENU_ORDER = \\[[^\\]]*\"pilgrimage\"").test(src));

/* renderMenu must still filter on .hidden */
ok("renderMenu filters hidden modes",
  /g\.modes\.filter\(k\s*=>\s*MODES\[k\]\s*&&\s*!MODES\[k\]\.hidden\)/.test(src) ||
  /keys\.filter\(k\s*=>\s*MODES\[k\]\s*&&\s*!MODES\[k\]\.hidden\)/.test(src));

/* Enter on the menu must open a mode the menu actually shows. */
ok("menu Enter routes through MENU_ORDER, not a hidden or incoming mode",
  /MENU_ORDER\.filter\(x=>MODES\[x\]\s*&&\s*!MODES\[x\]\.hidden\s*&&\s*!MODES\[x\]\.incoming\)\[0\]/.test(src));
ok("menu Enter no longer opens the hidden Trial directly",
  !/openBrief\("trial"\); return;/.test(src));

ok("pilgrimage still mixes typed questions",
  /typedN\s*=\s*Math\.min\(2/.test(src) || /last two of every stop are typed/.test(src) ||
  /R\.typed\s*=\s*n\s*>\s*0\s*&&\s*R\.siteIdx\s*>\s*\(n\s*-\s*typedN\)/.test(src) ||
  /isLastBeat/.test(src));
ok("Recall and Team Mode sit with the Drill",
  /Practice[\s\S]*modes: \["practice", "recall", "team"\]/.test(src));

ok("The Valley is incoming, not hidden",
  /beat:\{[^}]*incoming:\s*true/.test(src) && !/\bbeat:\{[^}]*hidden:\s*true/.test(src));
ok("MENU_GROUPS covers The Valley",
  /The Valley[\s\S]*modes:\s*\[[^\]]*"beat"/.test(src));
ok("incoming hall cards do not open a brief",
  /if\(!m \|\| m\.incoming\)/.test(src));
ok("MENU_GROUPS covers The Tablets",
  /The Tablets[\s\S]*modes:\s*\[[^\]]*"tablets"/.test(src));
ok("MENU_GROUPS defines The Road",
  /The Road/.test(src));
ok("MENU_GROUPS covers pilgrimage",
  /modes:\s*\[[^\]]*"pilgrimage"/.test(src));
ok("MENU_GROUPS covers Challenges with trial and endless",
  /Challenges[\s\S]*modes:\s*\["blitz", "trial", "endless"\]/.test(src));

if (fail) {
  console.log("FAIL — menu modes · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — menu modes · " + pass + " assertions");
