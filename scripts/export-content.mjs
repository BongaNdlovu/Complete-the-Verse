#!/usr/bin/env node
/* Snapshot the JS verse, site, and tablet banks into shared/content/*.json
   so native (and later the PWA) can load one committed source. Reuses
   load-bank.js and the tablet installers — no second parser.

   node scripts/export-content.mjs           write JSON
   node scripts/export-content.mjs --check   exit 1 if committed JSON is stale
*/
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadBank, ROOT, FILES: BANK_FILES } = require("./load-bank.js");

const OUT_DIR = path.join(ROOT, "shared", "content");
const OUT_FILES = ["manifest.json", "sites.json", "tablets.json", "verses.json"];
const SOURCE_FILES = uniqueSorted(BANK_FILES.concat([
  "js/verses-tf.js",
  "js/verses-notes.js",
  "js/sites.js",
  "js/tablets.js",
  "js/tablets-canon.js",
  "js/tablets-hall.js",
  "js/tablets-more.js"
]));

function uniqueSorted(list) {
  return Array.from(new Set(list)).sort();
}

function toLf(text) {
  return String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== "object") return value;
  const out = {};
  Object.keys(value).sort().forEach(function (k) {
    out[k] = sortKeys(value[k]);
  });
  return out;
}

function stableStringify(value) {
  return toLf(JSON.stringify(sortKeys(value), null, 2)) + "\n";
}

function hashSources(files) {
  const h = crypto.createHash("sha256");
  files.forEach(function (rel) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) throw new Error("missing source " + rel);
    h.update(rel + "\n");
    h.update(toLf(fs.readFileSync(abs, "utf8")));
    h.update("\n");
  });
  return h.digest("hex");
}

function loadTablets() {
  const { Tablets } = require("../js/tablets.js");
  require("../js/tablets-canon.js");
  require("../js/tablets-hall.js");
  require("../js/tablets-more.js");
  return Tablets;
}

function tierCounts(byTier) {
  const out = {};
  Object.keys(byTier || {}).sort().forEach(function (k) {
    out[String(k)] = (byTier[k] || []).length;
  });
  return out;
}

function versesPayload(bank, tf, notes) {
  const verses = bank.VERSES || [];
  if (verses.some(function (v) { return !v.id; })) {
    throw new Error("bank.js did not assign verse ids");
  }
  return {
    booksOrder: bank.BOOKS_ORDER,
    byTier: tierCounts(bank.BY_TIER),
    notes: notes.VERSE_NOTES || {},
    passages: bank.PASSAGES || [],
    tfClaims: tf.TF_CLAIMS || [],
    verses: verses
  };
}

function sitesPayload(data) {
  return {
    arcs: data.ARCS,
    empires: data.EMPIRES,
    homeView: data.HOME_VIEW,
    routes: data.ROUTES,
    sites: data.SITES,
    vignettes: data.VIGNETTES
  };
}

function idsOf(list) {
  return (list || []).map(function (ch) { return ch.id; });
}

function tabletsPayload(T) {
  return {
    blankS: T.BLANK_S,
    chapters: T.chapters,
    canonIds: idsOf(T.canon),
    hallIds: idsOf(T.hall),
    holdsToOpen: T.HOLDS_TO_OPEN,
    moreIds: idsOf(T.more)
  };
}

function buildOutputs() {
  const bank = loadBank();
  const tf = require("../js/verses-tf.js");
  const notes = require("../js/verses-notes.js");
  const sites = require("../js/sites.js");
  const tablets = loadTablets();
  const verses = versesPayload(bank, tf, notes);
  const siteData = sitesPayload(sites);
  const tabletData = tabletsPayload(tablets);
  const contentFiles = ["sites.json", "tablets.json", "verses.json"];
  const files = {
    "manifest.json": stableStringify({
      files: contentFiles,
      sourceHash: hashSources(SOURCE_FILES),
      sources: SOURCE_FILES.slice()
    }),
    "sites.json": stableStringify(siteData),
    "tablets.json": stableStringify(tabletData),
    "verses.json": stableStringify(verses)
  };
  return {
    files: files,
    counts: {
      arcs: siteData.arcs.length,
      notes: Object.keys(verses.notes).length,
      passages: verses.passages.length,
      sites: siteData.sites.length,
      tablets: tabletData.chapters.length,
      tfClaims: verses.tfClaims.length,
      verses: verses.verses.length
    }
  };
}

function writeOutputs(files) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  OUT_FILES.forEach(function (name) {
    fs.writeFileSync(path.join(OUT_DIR, name), files[name], "utf8");
  });
}

function checkOutputs(files) {
  let stale = false;
  OUT_FILES.forEach(function (name) {
    const dest = path.join(OUT_DIR, name);
    if (!fs.existsSync(dest)) {
      console.error("stale: missing " + name);
      stale = true;
      return;
    }
    const have = toLf(fs.readFileSync(dest, "utf8"));
    if (have !== files[name]) {
      console.error("stale: " + name + " does not match the JS banks");
      stale = true;
    }
  });
  return stale;
}

function main() {
  const check = process.argv.indexOf("--check") >= 0;
  const built = buildOutputs();
  if (check) {
    if (checkOutputs(built.files)) process.exit(1);
    console.log("shared/content is current");
    return;
  }
  writeOutputs(built.files);
  const c = built.counts;
  console.log(
    "wrote shared/content (" +
      c.verses + " verses, " +
      c.passages + " passages, " +
      c.tfClaims + " tf claims, " +
      c.notes + " notes, " +
      c.sites + " sites, " +
      c.arcs + " arcs, " +
      c.tablets + " tablets)"
  );
}

main();
