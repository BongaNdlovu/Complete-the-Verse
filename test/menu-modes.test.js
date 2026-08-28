/* Menu mode visibility — what the main hall offers.

   The menu shows the Pilgrimage first, then Daily, Blitz, Trial, Endless
   and the Drill. Hiding Trial/Endless left seven seals with no public
   path, and hiding the Drill hid the only mode that serves SRS-due
   verses. Standalone Recall, Pilgrim's Recall and the relay stay off the
   menu: the road covers typed recall, and the relay is a deliberate
   detour reached from the map. */
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

const publicModes = ["pilgrimage", "beat", "daily", "blitz", "trial", "endless", "practice", "recall"];
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
ok("menu Enter routes through MENU_ORDER, not a hidden mode",
  /MENU_ORDER\.filter\(x=>MODES\[x\]\s*&&\s*!MODES\[x\]\.hidden\)\[0\]/.test(src));
ok("menu Enter no longer opens the hidden Trial directly",
  !/openBrief\("trial"\); return;/.test(src));

/* Typed recall still exists on the Pilgrimage road and as a discoverable
   dedicated practice mode. */
ok("pilgrimage still mixes typed questions",
  /typedN\s*=\s*Math\.min\(2/.test(src) || /last two of every stop are typed/.test(src) ||
  /R\.typed\s*=\s*n\s*>\s*0\s*&&\s*R\.siteIdx\s*>\s*\(n\s*-\s*typedN\)/.test(src) ||
  /isLastBeat/.test(src));
ok("Recall is surfaced as a practice mode",
  /Practice[\s\S]*modes: \["practice", "recall"\]/.test(src));

/* Menu hall grouping — The Road */
ok("MENU_GROUPS covers The Valley",
  /The Valley[\s\S]*modes:\s*\[[^\]]*"beat"/.test(src));
ok("MENU_GROUPS defines The Road",
  /The Road/.test(src));
ok("MENU_GROUPS covers pilgrimage",
  /modes:\s*\[[^\]]*"pilgrimage"/.test(src));

if (fail) {
  console.log("FAIL — menu modes · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — menu modes · " + pass + " assertions");
