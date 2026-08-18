/* ==================================================================
   ENGINE SOURCE — the single source of truth for the engine's file
   list and load order.

   index.html loads these files, integration.test.js boots them in this
   order, and every static suite reads the concatenation through
   readEngine(). Adding an engine file? Add it HERE and to index.html —
   engine-modules.test.js fails if the two lists drift.

   Contract (enforced by the parse-contract test): these files may
   reference each other's and game.js's bindings at RUNTIME only. A
   module that touches a later file's binding while it parses breaks the
   no-game.js sandbox load.
   ================================================================== */
const fs = require("fs");
const path = require("path");

/* Order matters: util (shared helpers, safe at parse time) → audio →
   director (uses Snd) → setpieces → viz → typed → sequences → panels →
   results → briefs → game. */
const ENGINE_FILES = [
  "js/util.js",
  "js/audio.js",
  "js/director.js",
  "js/setpieces.js",
  "js/viz.js",
  "js/typed.js",
  "js/sequences.js",
  "js/panels.js",
  "js/cinematic.js",
  "js/results.js",
  "js/diag.js",
  "js/briefs.js",
  "js/play.js",
  "js/game.js"
];

function readEngineSource(root){
  root = root || process.cwd();
  return ENGINE_FILES
    .map(f => fs.readFileSync(path.join(root, f), "utf8"))
    .join("\n;\n");
}

module.exports = { ENGINE_FILES, readEngine: readEngineSource };
