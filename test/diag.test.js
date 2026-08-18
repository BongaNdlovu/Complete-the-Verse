/**
 * Diag & Save Failure Tests
 * Tests error ring buffer, save-corrupt detection, and save-blocked notifications.
 * Run: node test/diag.test.js
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const Diag = require("../js/diag");
const Flow = require("../js/flow");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

let pass = 0, fail = 0;
const fails = [];

function ok(name, cond, extra) {
  if (cond) {
    pass++;
  } else {
    fail++;
    const msg = "FAIL: " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "");
    fails.push(msg);
    console.log("  " + msg);
  }
}

function eq(name, got, want) {
  ok(name, got === want, { got, want });
}

/* ==================================================================
   1. DIAGNOSTICS MODULE & RING BUFFER
   ================================================================== */
{
  ok("Diag defines record", typeof Diag.record === "function");
  ok("Diag defines dump", typeof Diag.dump === "function");

  Diag.record({ kind: "test-event", message: "Verification event logged" });
  const dumpText = Diag.dump();
  ok("dump() includes logged event message", dumpText.includes("Verification event logged"));
  ok("dump() includes header", dumpText.includes("COMPLETE THE VERSE — DIAGNOSTICS"));

  // Ring buffer capping at 20
  for (let i = 0; i < 30; i++) {
    Diag.record({ kind: "bulk", message: "Bulk message " + i });
  }
  const ring = Diag._loadRing();
  ok("Ring buffer caps at 20 events", ring.length <= 20);
}

/* ==================================================================
   2. CORRUPTED SAVE LOAD RECOVERY
   ================================================================== */
{
  const PREFIX = [
    "js/verses.js", "js/verses-extra.js", "js/passages.js", "js/legacy-ids.js",
    "js/bank.js", "js/srs.js", "js/recall.js",
    "js/assemble.js", "js/meta.js", "js/flow.js",
    "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
    "js/live.js", "js/atlas.js"
  ];
  const FILES = PREFIX.concat(ENGINE_FILES);

  const origErr = console.error;
  console.error = function () {}; // silence expected log
  const sb = makeSandbox();
  // Set invalid JSON in localStorage to simulate save corruption
  sb.localStorage.setItem("ctv_save_v3", "{ corrupted json syntax !!!");

  const src = FILES.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });

  const save = vm.runInContext("SAVE", sb);
  ok("Corrupted save returns valid DEFAULT_SAVE object", save && save.v === 3);
  const brokenCopy = sb.localStorage.getItem("ctv_save_v3_broken");
  ok("Broken save is backed up to ctv_save_v3_broken", !!brokenCopy);
  const saveCorruptPending = vm.runInContext("window._saveCorruptPending", sb);
  ok("Corrupted save sets pending warning flag", !!saveCorruptPending);
  console.error = origErr;
}

/* ==================================================================
   3. PERSIST BLOCK NOTIFICATION
   ================================================================== */
{
  const sb = makeSandbox();
  const PREFIX = [
    "js/verses.js", "js/verses-extra.js", "js/passages.js", "js/legacy-ids.js",
    "js/bank.js", "js/srs.js", "js/recall.js",
    "js/assemble.js", "js/meta.js", "js/flow.js",
    "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
    "js/live.js", "js/atlas.js"
  ];
  const FILES = PREFIX.concat(ENGINE_FILES);
  const src = FILES.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });

  const origErr = console.error;
  console.error = function () {}; // silence expected log
  // Mock setItem to throw (e.g. QuotaExceededError or private browsing)
  sb.localStorage.setItem = function () {
    throw new Error("QuotaExceededError: LocalStorage quota exceeded");
  };

  let stateShown = null;
  sb.showState = function (st) { stateShown = st; };

  vm.runInContext("persist()", sb);
  eq("Persist failure triggers save-blocked state", stateShown, "save-blocked");
  console.error = origErr;
}

/* ==================================================================
   SUMMARY
   ================================================================== */
if (fail) {
  console.log("\nFAIL — diag · " + pass + " passed · " + fail + " failed");
  process.exit(1);
} else {
  console.log("PASS — diag · all " + pass + " assertions passed");
}
