/* Loads the browser-global verse data files into Node so the QA gate and
   the test suite can read exactly what the game reads — no second copy of
   the bank, no parallel parser to drift out of sync. */
const fs = require("fs");
const path = require("path");
const Module = require("module");

const ROOT = path.join(__dirname, "..");
const FILES = ["js/verses.js", "js/verses-extra.js", "js/verses-more.js",
               "js/passages.js", "js/bank.js"];

function loadBank(){
  const src = FILES
    .filter(f => fs.existsSync(path.join(ROOT, f)))
    .map(f => fs.readFileSync(path.join(ROOT, f), "utf8"))
    .join("\n;\n") +
    "\n;module.exports = (function(){ const out = {};" +
    ["VERSES","VERSES_EXTRA","VERSES_MORE","PASSAGES","BY_TIER","BOOKS_ORDER","LEGACY_IDS","verseId"]
      .map(n => "try{ out." + n + " = " + n + "; }catch(e){}").join("") +
    " return out; })();";
  const m = new Module(path.join(ROOT, "js/__bank__.js"));
  m.filename = path.join(ROOT, "js/__bank__.js");
  m.paths = Module._nodeModulePaths(path.join(ROOT, "js"));
  m._compile(src, m.filename);
  return m.exports;
}

module.exports = { loadBank, ROOT, FILES };
