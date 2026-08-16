/* ==================================================================
   ENGINE MODULES — the split's own guard rails.

   1. PARSE CONTRACT: every engine module must parse and execute WITHOUT
      game.js. Modules may reference game.js bindings ($ aside, which
      lives in util.js) only inside functions called after boot. A
      violation here is a ReferenceError or TDZ error in the sandbox —
      exactly the bug class the split introduced, caught before it ships.
   2. ORDER: index.html's script tags, engine-source.js and
      integration.test.js must agree on the engine list — one source of
      truth, mechanically enforced.
   3. SURFACE: each module actually defines the globals the engine
      expects from it.
   ================================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { makeSandbox } = require("./scripts/test-shim");
const { ENGINE_FILES } = require("./scripts/engine-source");

const root = __dirname;
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

/* ---------- 1. parse contract: modules load without game.js ---------- */
{
  const PREFIX = ["js/verses.js","js/verses-extra.js","js/passages.js","js/legacy-ids.js",
                  "js/bank.js","js/srs.js","js/recall.js",
                  "js/sites.js","js/empires.js","js/geo.js","js/pilgrimage.js",
                  "js/live.js","js/atlas.js"];
  const modules = ENGINE_FILES.filter(f => f !== "js/game.js");
  const sb = makeSandbox();
  let err = null;
  try {
    PREFIX.concat(modules).forEach(f =>
      vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), sb, { filename: f }));
  } catch (e) { err = e; }
  ok("every engine module parses and executes without game.js", !err,
     err && (err.message + " @ " + err.stack.split("\n")[0]));

  /* ---------- 3. module surface ---------- */
  if (!err) {
    const t = name => vm.runInContext("typeof " + name, sb);
    ok("util exports the DOM helper", t("$") === "function");
    ok("util exports the ref-dedupe pool helper", t("poolSansRepeatRefs") === "function");
    ok("audio defines Snd", t("Snd") === "object");
    ok("director defines Director", t("Director") === "object");
    ok("set-pieces define SetPieces", t("SetPieces") === "object");
    ok("viz defines Viz", t("Viz") === "object");
    ok("typed defines the on-screen keyboard builder", t("buildVirtualKeyboardHtml") === "function");
    ok("typed defines the verdict renderer", t("renderTypedVerdict") === "function");
    ok("sequences defines passage play", t("startPassage") === "function");
    ok("sequences defines reconstruction play", t("startReconstruct") === "function");
    ok("panels defines Study Hall", t("renderStudy") === "function");
    ok("panels defines Records", t("renderRecords") === "function");
    ok("panels defines Settings", t("renderSettings") === "function");
    ok("panels defines the relics hall", t("renderRelics") === "function");
    ok("panels defines the player card update", t("updatePlayerCard") === "function");
    ok("results defines renderResults", t("renderResults") === "function");
    ok("results defines the board filler", t("fillResultsBoard") === "function");
    ok("briefs defines the menu", t("renderMenu") === "function");
    ok("briefs defines the site brief", t("openSiteBrief") === "function");
    ok("briefs defines the intro flow", t("beginIntroPlayback") === "function");
    ok("briefs defines the tutorial", t("showTutorialIfNeeded") === "function");
  }
}

/* ---------- 2. one list, three places ---------- */
{
  const tags = [...index.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
  ok("every engine file is loaded by index.html",
     ENGINE_FILES.every(f => tags.includes(f)),
     ENGINE_FILES.filter(f => !tags.includes(f)));
  const engineTags = tags.filter(t => ENGINE_FILES.includes(t));
  ok("index.html loads the engine files in the canonical order",
     JSON.stringify(engineTags) === JSON.stringify(ENGINE_FILES),
     { html: engineTags, canonical: ENGINE_FILES });
  ok("game.js is the last engine script",
     engineTags[engineTags.length - 1] === "js/game.js");

  const integ = fs.readFileSync(path.join(root, "integration.test.js"), "utf8");
  const filesBlock = integ.match(/const FILES = PREFIX\.concat\(ENGINE_FILES\);/);
  ok("integration boots the sandbox from the shared engine list", !!filesBlock);
}

if (fail) {
  console.log("FAIL — engine modules · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — engine modules · " + pass + " assertions · " + ENGINE_FILES.length + " files · parse contract + order + surface");
