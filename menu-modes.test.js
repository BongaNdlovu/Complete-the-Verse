/* Menu mode visibility — what the main hall offers.

   The menu shows the Pilgrimage first, then Daily, Blitz, Trial, Endless
   and the Drill. Hiding Trial/Endless left seven seals with no public
   path, and hiding the Drill hid the only mode that serves SRS-due
   verses. Standalone Recall, Pilgrim's Recall and the relay stay off the
   menu: the road covers typed recall, and the relay is a deliberate
   detour reached from the map. */
const fs = require("fs");
const path = require("path");

const { readEngine } = require("./scripts/engine-source");
const src = readEngine(__dirname);

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : ""));
  }
}

/* Pull a MODE entry block: key:{...} or "key":{...} */
function modeBlock(key) {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    "(?:\"?" + esc + "\"?)\\s*:\\s*\\{([\\s\\S]*?)\\n  (?:[a-zA-Z\"']|\\}|const )"
  );
  const m = src.match(re);
  return m ? m[1] : "";
}

const publicModes = ["pilgrimage", "daily", "blitz", "trial", "endless", "practice"];
const hiddenModes = ["recall", "relay", "pilgrim-recall"];

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
ok("MENU_ORDER lists every public mode",
  ["daily","blitz","trial","endless","practice"].every(k =>
    new RegExp("const MENU_ORDER = \\[[^\\]]*" + k).test(src)));

/* renderMenu must still filter on .hidden */
ok("renderMenu filters hidden modes",
  /keys\.filter\(k=>MODES\[k\]\s*&&\s*!MODES\[k\]\.hidden\)/.test(src));

/* Enter on the menu must open a mode the menu actually shows. */
ok("menu Enter routes through MENU_ORDER, not a hidden mode",
  /MENU_ORDER\.filter\(x=>MODES\[x\]\s*&&\s*!MODES\[x\]\.hidden\)\[0\]/.test(src));
ok("menu Enter no longer opens the hidden Trial directly",
  !/openBrief\("trial"\); return;/.test(src));

/* Typed recall still exists on the Pilgrimage road */
ok("pilgrimage still mixes typed questions",
  /typedN\s*=\s*Math\.min\(2/.test(src) || /last two of every stop are typed/.test(src) ||
  /R\.typed\s*=\s*n\s*>\s*0\s*&&\s*R\.siteIdx\s*>\s*\(n\s*-\s*typedN\)/.test(src));

if (fail) {
  console.log("FAIL — menu modes · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — menu modes · " + pass + " assertions");
