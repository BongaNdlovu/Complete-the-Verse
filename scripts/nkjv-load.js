/* ==================================================================
   NKJV LOAD — read the browser-global content modules from Node.

   js/tablets.js declares `const Tablets` at file scope and the three
   installers (canon, hall, more) attach their chapters to a *global* named
   Tablets. In the browser that is one shared scope and it works; in Node
   `const` never becomes a global, so requiring an installer on its own
   throws "Tablets is not defined".

   Publishing the instance as a global for the duration of the install
   steps is the smallest thing that makes the Node path behave like the
   page. scripts/export-content.mjs already leans on this working, so the
   loader lives here and both use it.
   ================================================================== */

let cached = null;

function loadTablets() {
  if (cached) return cached;
  const { Tablets } = require("../js/tablets");
  const had = Object.prototype.hasOwnProperty.call(globalThis, "Tablets");
  const prev = globalThis.Tablets;
  globalThis.Tablets = Tablets;
  try {
    require("../js/tablets-canon");
    require("../js/tablets-hall");
    require("../js/tablets-more");
  } finally {
    if (had) globalThis.Tablets = prev;
    else delete globalThis.Tablets;
  }
  cached = Tablets;
  return cached;
}

module.exports = { loadTablets };
