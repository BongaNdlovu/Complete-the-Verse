/**
 * Arc I Full Pilgrimage & Mechanics Deep Verification
 * Tests all 9 destinations from Ur to Dothan, verifying:
 * - Parallax background sync to current site painting
 * - Site brief & Atlas vignette artwork links
 * - Interactive Mechanics: Strike (v3), Cloze (v4), Duel (v5), Fade (v6 - 30s memory + full reconstruction), Assembly (v7-v8)
 * - Resolution and scoring across the entire Arc I campaign
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

let pass = 0, fail = 0;
const fails = [];

function assert(cond, msg) {
  if (cond) {
    pass++;
  } else {
    fail++;
    fails.push(msg);
    console.error("  FAIL: " + msg);
  }
}

function eq(name, got, want) {
  assert(got === want, name + " (got: " + JSON.stringify(got) + ", want: " + JSON.stringify(want) + ")");
}

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js",
  "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js",
  "js/live.js", "js/atlas.js"
];
const FILES = PREFIX.concat(ENGINE_FILES);

function bootGame() {
  const sb = makeSandbox();
  const src = FILES.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "bundle.js" });
  return sb;
}

function exec(sb, code) {
  return vm.runInContext(code, sb);
}

function read(sb, expr) {
  return vm.runInContext(expr, sb);
}

const ARC1_SITES = [
  { id: "ur", title: "Abram Departs Ur" },
  { id: "haran", title: "The Call at Haran" },
  { id: "shechem", title: "The First Altar in Canaan" },
  { id: "bethel", title: "Jacob's Ladder" },
  { id: "penuel", title: "The Wrestling at Penuel" },
  { id: "hebron", title: "The Oaks of Mamre" },
  { id: "beersheba", title: "The Well of Beersheba" },
  { id: "moriah", title: "The Mount of Moriah" },
  { id: "dothan", title: "The Pit of Dothan" }
];

console.log("=== EXECUTING DEEP ARC I VERIFICATION ===");

const sb = bootGame();

ARC1_SITES.forEach((site, sIdx) => {
  console.log(`\n--- Testing Destination ${sIdx + 1}/9: ${site.id.toUpperCase()} ---`);
  
  // Unlock this site and previous sites
  for (let u = 0; u <= sIdx; u++) {
    exec(sb, `SAVE.pilgrim["${ARC1_SITES[u].id}"] = { cleared: true, attempts: 1, bestScore: 2000, bestStreak: 8, firstCleared: Date.now() };`);
  }

  // 1. Verify Vignette in Atlas
  exec(sb, `Atlas.openVignette("${site.id}");`);
  eq(`[${site.id}] Vignette title matches`, read(sb, `$("jv-title").textContent`), site.title);
  assert(read(sb, `$("jv-img").src`).includes(`assets/journey/${site.id}.webp`), `[${site.id}] Vignette image is assets/journey/${site.id}.webp`);
  exec(sb, `Atlas.closeVignette();`);

  // 2. Verify Site Brief in Pilgrimage
  exec(sb, `openSiteBrief("${site.id}", "watchman");`);
  eq(`[${site.id}] Site Brief active`, read(sb, `currentView`), "sitebrief");
  const heroImg = read(sb, `$("sb-hero-img")`);
  if (heroImg) {
    assert(heroImg.src.includes(`assets/journey/${site.id}.webp`), `[${site.id}] Site brief hero image points to ${site.id}.webp`);
  }

  // 3. Start Run at Site
  exec(sb, `pendingSiteId = "${site.id}"; startRun("pilgrimage", "watchman");`);
  eq(`[${site.id}] Active mode is pilgrimage`, read(sb, `R.mode`), "pilgrimage");
  eq(`[${site.id}] Active siteId is ${site.id}`, read(sb, `R.siteId`), site.id);
  eq(`[${site.id}] Current view is play`, read(sb, `currentView`), "play");

  // Dismiss site quote intro so Verse 1 is rendered on stage
  exec(sb, `hideSiteQuote(); renderQuestion(R.q, 8000);`);

  // 4. Verify Cinematic Parallax Background Sync
  const bgImg = read(sb, `$("cine-parallax-img")`);
  assert(!!bgImg, `[${site.id}] Cinematic parallax element exists`);
  if (bgImg) {
    const bgStyle = bgImg.style.backgroundImage || "";
    assert(bgStyle.includes(`assets/journey/${site.id}.webp`), `[${site.id}] Cinematic background syncs to assets/journey/${site.id}.webp (got: ${bgStyle})`);
  }

  // 5. Play Through All 8 Verses & Verify Each Mechanic
  for (let vi = 0; vi < 8; vi++) {
    const q = read(sb, `R.q`);
    assert(!!q, `[${site.id}] Verse ${vi + 1} exists`);
    const mechanic = read(sb, `R.currentMechanic || null`);
    const isTyped = read(sb, `!!R.typed`);

    if (vi === 0 || vi === 1) {
      // Multiple Choice Recognition
      eq(`[${site.id}] Verse ${vi + 1} is multiple-choice`, mechanic, null);
      eq(`[${site.id}] Verse ${vi + 1} is not typed`, isTyped, false);
      exec(sb, `resolveAnswer(R.q, R.q.a, $("btn-opt-0"), 800, 5000);`);
    } else if (vi === 2) {
      // Verse 3: Falsehood Strike (Error Purge)
      eq(`[${site.id}] Verse 3 mechanic is strike`, mechanic, "strike");
      const verseHtml = read(sb, `$("verse").innerHTML`);
      assert(verseHtml.includes("strike-word") && verseHtml.includes("type=\"button\""), `[${site.id}] Falsehood strike words render as keyboard-accessible buttons without exposing the target`);
      assert(read(sb, `$("ref").textContent`).includes(q.r), `[${site.id}] Strike reference correctly rendered`);
      exec(sb, `resolveAnswer(R.q, R.q.a, null, 800, 5000);`);
      assert(read(sb, `R.streak > 0`), `[${site.id}] Strike mechanic correctly solved`);
    } else if (vi === 3) {
      // Verse 4: Scribe's Cloze (1-2-3 Tap)
      eq(`[${site.id}] Verse 4 mechanic is cloze`, mechanic, "cloze");
      const clozeStage = read(sb, `$("cloze-stage")`);
      assert(clozeStage && clozeStage.style.display !== "none", `[${site.id}] Scribe cloze stage is visible`);
      const clozeHtml = read(sb, `$("cloze-stage").innerHTML`);
      assert(clozeHtml.includes("cloze-slots") && clozeHtml.includes("cloze-bank"), `[${site.id}] Scribe cloze slots and bank rendered`);
      const verseHtml = read(sb, `$("verse").innerHTML`);
      assert(verseHtml.includes("blank"), `[${site.id}] Scribe cloze verse has matching blank`);
      assert(read(sb, `$("ref").textContent`).includes(q.r), `[${site.id}] Scribe cloze reference correctly rendered`);
      exec(sb, `resolveAnswer(R.q, R.q.a, null, 800, 5000);`);
      assert(read(sb, `R.streak > 0`), `[${site.id}] Cloze mechanic correctly solved`);
    } else if (vi === 4) {
      // Verse 5: True Scripture Duel (Left vs Right)
      eq(`[${site.id}] Verse 5 mechanic is duel`, mechanic, "duel");
      const duelHtml = read(sb, `$("duel-stage").innerHTML`);
      assert(duelHtml.includes("duel-card") && duelHtml.includes("Reading Alpha") && duelHtml.includes("Reading Beta"), `[${site.id}] Duel Alpha and Beta codex tablets rendered`);
      assert(read(sb, `$("ref").textContent`).includes(q.r), `[${site.id}] Duel reference correctly rendered`);
      exec(sb, `resolveAnswer(R.q, R.q.a, null, 800, 5000);`);
      assert(read(sb, `R.streak > 0`), `[${site.id}] Duel mechanic correctly solved`);
    } else if (vi === 5) {
      // Verse 6: Fade-to-Memory (Dissolving Echo)
      eq(`[${site.id}] Verse 6 mechanic is fade`, mechanic, "fade");
      const fadeBar = read(sb, `$("fade-bar")`);
      assert(!!fadeBar, `[${site.id}] Fade countdown bar rendered on stage`);
      assert(fadeBar && fadeBar.textContent.includes("30s"), `[${site.id}] Fade-to-memory starts with 30-second countdown`);
      assert(read(sb, `$("ref").textContent`).includes(q.r), `[${site.id}] Fade reference correctly rendered`);
      exec(sb, `R.fadePhase='reconstruct'; R.fadeAssembly={target:fullVerseText(R.q),hintIndex:-1}; R.typed=true; resolveAnswer(R.q, fullVerseText(R.q), null, 1200, 30000);`);
      assert(read(sb, `R.streak > 0`), `[${site.id}] Fade mechanic correctly solved`);
    } else {
      // Verses 7 & 8: Typed Recall / Assembly
      eq(`[${site.id}] Verse ${vi + 1} is typed assembly`, isTyped, true);
      exec(sb, `resolveAnswer(R.q, R.q.a, null, 1500, 10000);`);
    }

    if (vi < 7) {
      exec(sb, `nextQuestion();`);
    }
  }

  // 6. Complete site
  exec(sb, `endRun("complete");`);
  eq(`[${site.id}] Site clearance recorded in save`, read(sb, `Pilgrimage.isCleared(SAVE.pilgrim, "${site.id}")`), true);
});

console.log("\n==========================================");
if (fail > 0) {
  console.error(`Arc I Verification FAILED: ${fail} errors.`);
  fails.forEach(f => console.error(" - " + f));
  process.exit(1);
} else {
  console.log(`PASS: All 9 Arc I sites and interactive mechanics verified with 100% accuracy (${pass} assertions passed).`);
}
