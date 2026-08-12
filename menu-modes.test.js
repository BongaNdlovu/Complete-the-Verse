/* Menu mode visibility — what the main hall offers.

   Practice (Drill) and standalone Recall stay in the code for save keys
   and results labels, but must not appear on the menu: Pilgrimage already
   covers recognition + typed recall on the road. */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "js", "game.js"), "utf8");

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

const publicModes = ["pilgrimage", "daily", "blitz"];
const hiddenModes = ["practice", "recall", "trial", "endless", "relay", "pilgrim-recall"];

publicModes.forEach(k => {
  const b = modeBlock(k);
  ok(k + " is defined", b.length > 0);
  ok(k + " is not hidden on the menu", !/\bhidden:\s*true\b/.test(b));
});

hiddenModes.forEach(k => {
  const b = modeBlock(k);
  ok(k + " is defined", b.length > 0);
  ok(k + " is hidden from the menu", /\bhidden:\s*true\b/.test(b));
});

/* renderMenu must filter on .hidden */
ok("renderMenu filters hidden modes",
  /Object\.keys\(MODES\)\.filter\(k\s*=>\s*!MODES\[k\]\.hidden\)/.test(src));

/* Typed recall still exists on the Pilgrimage road */
ok("pilgrimage still mixes typed questions",
  /typedN\s*=\s*Math\.min\(3/.test(src) || /last three of every stop are typed/.test(src) ||
  /R\.typed\s*=\s*n\s*>\s*0\s*&&\s*R\.siteIdx\s*>\s*\(n\s*-\s*typedN\)/.test(src));

if (fail) {
  console.log("FAIL — menu modes · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — menu modes · " + pass + " assertions");
