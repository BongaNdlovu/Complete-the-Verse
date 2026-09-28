#!/usr/bin/env node
/* ==================================================================
   NKJV SOURCE PARSER & COVERAGE AUDITOR
   Accepts licensed NKJV dumps dropped in content/nkjv/source/ in order:
     1. JSON ({ "Genesis 1:1": "..." } or hierarchical books array)
     2. Book C:V<tab>text lines
     3. USFX / OSIS XML
   Audits coverage against the union of all game required references.
   Exits non-zero and reports gap list if incomplete.
   ================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = require("./repo-root");
const { loadBank } = require("./load-bank");

const SOURCE_DIR = path.join(ROOT, "content", "nkjv", "source");

// Canonical book names
const BOOK_CANONICAL = {
  "Psalm": "Psalms"
};

function normalizeBook(name) {
  name = (name || "").trim();
  return BOOK_CANONICAL[name] || name;
}

// Expands a ref string like "Genesis 12:1-3", "Psalm 23:1-6", "Genesis 2:7, 21-22"
function expandRef(ref) {
  if (!ref || typeof ref !== "string") return [];
  ref = ref.trim().replace(/^[\s(]+|[\s).]+$/g, "");
  
  // Handle compound refs separated by semicolon: e.g. "Exodus 4:14; 7:1"
  if (ref.includes(";")) {
    const parts = ref.split(";").map(s => s.trim());
    const res = [];
    let currentBook = "";
    parts.forEach(p => {
      // If the part starts with a book name
      const m = p.match(/^([1-3]?\s*[A-Za-z]+)\s+(\d+.*)$/);
      if (m) {
        currentBook = m[1];
        res.push(...expandRef(p));
      } else if (currentBook) {
        res.push(...expandRef(currentBook + " " + p));
      }
    });
    return res;
  }

  // Handle book and verse specification
  // Match "1 Corinthians 13:1-13" or "Genesis 2:7, 21-22"
  const m = ref.match(/^([1-3]?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(.+)$/);
  if (!m) return [ref];

  const book = normalizeBook(m[1].trim());
  const spec = m[2].trim();

  // Handle multiple comma segments: "2:7, 21-22" -> chapter 2 verse 7, and chapter 2 verses 21-22
  if (spec.includes(",")) {
    const segments = spec.split(",").map(s => s.trim());
    const res = [];
    let chapter = 1;
    segments.forEach((seg, idx) => {
      if (seg.includes(":")) {
        const cParts = seg.split(":");
        chapter = parseInt(cParts[0], 10);
        const vPart = cParts[1];
        res.push(...expandVerseRange(book, chapter, vPart));
      } else {
        res.push(...expandVerseRange(book, chapter, seg));
      }
    });
    return res;
  }

  // Handle single segment like "23:1-6" or "23:1"
  if (spec.includes(":")) {
    const [cStr, vStr] = spec.split(":");
    const chapter = parseInt(cStr, 10);
    return expandVerseRange(book, chapter, vStr);
  }

  // Whole chapter range or single chapter, e.g. "Exodus 7-12"
  // For these, we preserve the ref format
  return [book + " " + spec];
}

function expandVerseRange(book, chapter, vRange) {
  vRange = (vRange || "").trim();
  if (vRange.includes("-")) {
    const [startStr, endStr] = vRange.split("-").map(s => s.trim());
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      const list = [];
      for (let v = start; v <= end; v++) {
        list.push(book + " " + chapter + ":" + v);
      }
      return list;
    }
  }
  const single = parseInt(vRange, 10);
  if (!isNaN(single)) {
    return [book + " " + chapter + ":" + single];
  }
  return [book + " " + chapter + ":" + vRange];
}

// Gathers the union of all required references across the game
function getRequiredRefs() {
  const refs = new Set();
  function add(r) {
    expandRef(r).forEach(v => refs.add(v));
  }

  // 1. Bank verses (899)
  const bank = loadBank();
  (bank.VERSES || []).forEach(v => add(v.r));

  // 2. Passages (27)
  (bank.PASSAGES || []).forEach(p => add(p.r));

  // 3. Sites quoteRef (46)
  const S = require("../js/sites");
  (S.SITES || []).forEach(s => { if (s.quoteRef) add(s.quoteRef); });

  // 4. Tablets (144 chapters)
  const { Tablets } = require("../js/tablets");
  require("../js/tablets-canon");
  require("../js/tablets-hall");
  require("../js/tablets-more");
  (Tablets.chapters || []).forEach(c => {
    (c.blanks || []).forEach(b => { if (b.r) add(b.r); });
  });

  // 5. Beat questions & cinema lines
  const Beat = require("../js/beat");
  (Beat.questions || []).forEach(q => { if (q.r) add(q.r); });
  // Goliath cinema quotes 1 Sam 17:42, 43, 44, 45
  ["1 Samuel 17:42", "1 Samuel 17:43", "1 Samuel 17:44", "1 Samuel 17:45"].forEach(add);

  // 6. Tutorial questions (6)
  const playSrc = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
  const tutMatches = [...playSrc.matchAll(/id:\s*"tutorial-[^"]+",[^}]+r:\s*"([^"]+)"/g)];
  tutMatches.forEach(m => add(m[1]));

  // 7. True/False claims (280)
  const tf = require("../js/verses-tf");
  (tf.TF_CLAIMS || []).forEach(c => {
    if (!c.why) return;
    const m = c.why.match(/\(([^)]+)\)[^()]*$/);
    if (m) add(m[1]);
  });

  return Array.from(refs).sort();
}

function ingestJsonSource(data, map) {
  // Flat map: { "Genesis 1:1": "..." }
  if (typeof data === "object" && !Array.isArray(data) && !data.books && !data.verses) {
    Object.keys(data).forEach(k => {
      if (typeof data[k] === "string") {
        map[normalizeBookRef(k)] = cleanVerseText(data[k]);
      } else if (typeof data[k] === "object") {
        const book = normalizeBook(k);
        Object.keys(data[k]).forEach(c => {
          Object.keys(data[k][c]).forEach(v => {
            map[book + " " + c + ":" + v] = cleanVerseText(data[k][c][v]);
          });
        });
      }
    });
    return map;
  }
  if (data.books && Array.isArray(data.books)) {
    data.books.forEach(b => {
      const book = normalizeBook(b.name || b.book || "");
      (b.chapters || []).forEach((c, cIdx) => {
        const cNum = c.num != null ? c.num : (c.chapter != null ? c.chapter : (cIdx + 1));
        (c.verses || []).forEach((v, vIdx) => {
          const vNum = v.num != null ? v.num : (v.verse != null ? v.verse : (vIdx + 1));
          const text = v.text || (typeof v === "string" ? v : "");
          if (book && text) map[book + " " + cNum + ":" + vNum] = cleanVerseText(text);
        });
      });
    });
    return map;
  }
  const list = Array.isArray(data) ? data : data.verses;
  if (Array.isArray(list)) {
    list.forEach(item => {
      const ref = item.r || (item.b && item.c && item.v ? (normalizeBook(item.b) + " " + item.c + ":" + item.v) : null);
      const text = item.t || item.text || "";
      if (ref && text) map[normalizeBookRef(ref)] = cleanVerseText(text);
    });
  }
  return map;
}

function ingestLineSource(content, map) {
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const tabParts = line.split(/\t|\|/);
    if (tabParts.length >= 2) {
      const ref = tabParts[0].trim();
      const text = tabParts.slice(1).join("\t").trim();
      if (isRefPattern(ref) && text) {
        map[normalizeBookRef(ref)] = cleanVerseText(text);
        continue;
      }
    }
    const m = line.match(/^([1-3]?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?\s+\d+:\d+)\s+(.+)$/);
    if (m) {
      map[normalizeBookRef(m[1])] = cleanVerseText(m[2]);
    }
  }
  return map;
}

// Parses JSON, TSV, or XML source into a map of { "Book C:V": "text" }
function parseSourceContent(content, filename) {
  const map = {};
  filename = (filename || "").toLowerCase();

  if (filename.endsWith(".json") || content.trim().startsWith("{") || content.trim().startsWith("[")) {
    try {
      const data = JSON.parse(content);
      const filled = ingestJsonSource(data, map);
      if (Object.keys(filled).length) return filled;
    } catch (e) {
      // Fall through to text line parser
    }
  }

  return ingestLineSource(content, map);
}

function isRefPattern(str) {
  return /^[1-3]?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?\s+\d+:\d+$/.test(str.trim());
}

function normalizeBookRef(ref) {
  const m = ref.trim().match(/^([1-3]?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(.+)$/);
  if (!m) return ref.trim();
  return normalizeBook(m[1].trim()) + " " + m[2].trim();
}

function cleanVerseText(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, "") // strip HTML / XML tags
    .replace(/\s+/g, " ")
    .trim();
}

// Scans content/nkjv/source/ and loads all available parsed verses
function loadSourceDump() {
  if (!fs.existsSync(SOURCE_DIR)) {
    return { ok: false, error: "Source directory does not exist: " + SOURCE_DIR, verses: {} };
  }
  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => !f.startsWith(".") && f !== "README.md");

  if (!files.length) {
    return { ok: false, error: "No dump files found in " + SOURCE_DIR, verses: {} };
  }

  const combined = {};
  files.forEach(f => {
    const full = path.join(SOURCE_DIR, f);
    if (fs.statSync(full).isFile()) {
      const content = fs.readFileSync(full, "utf8");
      const parsed = parseSourceContent(content, f);
      Object.assign(combined, parsed);
    }
  });

  return { ok: true, count: Object.keys(combined).length, verses: combined };
}

// Audits coverage against required references
function auditCoverage() {
  const required = getRequiredRefs();
  const dump = loadSourceDump();
  const available = dump.verses || {};

  const missing = [];
  const present = [];

  required.forEach(r => {
    if (available[r]) {
      present.push(r);
    } else {
      missing.push(r);
    }
  });

  return {
    dumpLoaded: dump.ok,
    dumpError: dump.error || null,
    totalRequired: required.length,
    presentCount: present.length,
    missingCount: missing.length,
    coveragePct: Math.round((present.length / required.length) * 100),
    missingRefs: missing,
    presentRefs: present,
    verses: available
  };
}

function main() {
  console.log("=== NKJV Source Coverage Audit ===");
  const audit = auditCoverage();

  console.log("Required references: " + audit.totalRequired);
  console.log("Source directory:    " + path.relative(ROOT, SOURCE_DIR));

  if (!audit.dumpLoaded) {
    console.error("\n[HARD GATE BLOCKED] " + audit.dumpError);
    console.error("Execution cannot generate NKJV bank without the licensed source dump.");
    console.error("Please place the licensed NKJV file into: content/nkjv/source/\n");
    console.error("Total missing required references: " + audit.totalRequired);
    console.error("First 25 missing required references:");
    audit.missingRefs.slice(0, 25).forEach(r => console.error("  - " + r));
    process.exit(1);
  }

  console.log("Found in dump:       " + audit.presentCount + " / " + audit.totalRequired + " (" + audit.coveragePct + "%)");

  if (audit.missingCount > 0) {
    console.error("\n[HARD GATE BLOCKED] Incomplete NKJV source dump.");
    console.error("Missing " + audit.missingCount + " required references:\n");
    audit.missingRefs.slice(0, 50).forEach(r => console.error("  - " + r));
    if (audit.missingCount > 50) {
      console.error("  ... and " + (audit.missingCount - 50) + " more.");
    }
    process.exit(1);
  }

  console.log("\n[PASS] Complete 100% NKJV coverage for all required references.");
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  getRequiredRefs,
  parseSourceContent,
  auditCoverage,
  loadSourceDump,
  expandRef,
  normalizeBookRef
};
