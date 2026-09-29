/* Loads the browser-global verse data files into Node so the QA gate and
   the test suite can read exactly what the game reads — no second copy of
   the bank, no parallel parser to drift out of sync. */
const fs = require("fs");
const path = require("path");
const Module = require("module");

const ROOT = path.join(__dirname, "..");
const KJV_FILES = ["js/verses.js", "js/verses-extra.js", "js/verses-more.js",
               "js/verses-ascent.js", "js/verses-expansion.js",
               "js/passages.js", "js/bank.js"];
const NKJV_FILES = ["js/nkjv/verses.js", "js/nkjv/passages.js", "js/bank.js"];

function loadBank(edition){
  edition = (edition === "nkjv") ? "nkjv" : "kjv";
  const files = (edition === "nkjv") ? NKJV_FILES : KJV_FILES;
  const existingFiles = files.filter(f => fs.existsSync(path.join(ROOT, f)));
  if(edition === "nkjv" && existingFiles.length < 2){
    return { empty: true, edition: "nkjv" };
  }
  let shim = "";
  if(edition === "nkjv") {
    shim = "\n;var VERSES = (typeof NKJV_VERSES !== 'undefined') ? NKJV_VERSES.slice() : [];\n" +
           "var PASSAGES = (typeof NKJV_PASSAGES !== 'undefined') ? NKJV_PASSAGES.slice() : [];\n" +
           "var VERSES_EXTRA = [];\n" +
           "if(typeof BOOKS_ORDER === 'undefined'){ var BOOKS_ORDER = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation']; }\n";
  }
  const src = existingFiles
    .map(f => {
      const code = fs.readFileSync(path.join(ROOT, f), "utf8");
      if(edition === "nkjv" && f === "js/bank.js") {
        return shim + "\n;\n" + code;
      }
      return code;
    })
    .join("\n;\n") +
    "\n;module.exports = (function(){ const out = {};" +
    ["VERSES","VERSES_EXTRA","VERSES_MORE","VERSES_ASCENT","VERSES_EXPANSION","PASSAGES","BY_TIER","BOOKS_ORDER","LEGACY_IDS","verseId"]
      .map(n => "try{ out." + n + " = " + n + "; }catch(e){}").join("") +
    " return out; })();";
  const m = new Module(path.join(ROOT, "js/__bank__.js"));
  m.filename = path.join(ROOT, "js/__bank__.js");
  m.paths = Module._nodeModulePaths(path.join(ROOT, "js"));
  m._compile(src, m.filename);
  return m.exports;
}

const FILES = KJV_FILES;

module.exports = { loadBank, ROOT, FILES, KJV_FILES, NKJV_FILES };
