/**
 * Live Browser Verification Suite for Complete the Verse
 * Uses Chrome DevTools Protocol (CDP) via native WebSocket to drive a real
 * headless Chrome browser against http://localhost:8781, taking high-res screenshots
 * and asserting layout, DOM state, and mechanics in a real browser rendering engine.
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\fanel\\.gemini\\antigravity\\brain\\bae03995-cb7b-4b39-b465-3126af92ec6e";
const SHOT_DIR = path.join(ARTIFACT_DIR, "screenshots");
if (!fs.existsSync(SHOT_DIR)) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
}

let nextId = 1;

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.callbacks = new Map();
    this.events = [];
    this.consoleLogs = [];
    this.errors = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        } else if (msg.method) {
          if (msg.method === "Runtime.consoleAPICalled") {
            const args = (msg.params.args || []).map(a => a.value || a.description).join(" ");
            this.consoleLogs.push(`[${msg.params.type}] ${args}`);
          } else if (msg.method === "Runtime.exceptionThrown") {
            this.errors.push(msg.params.exceptionDetails.text + " " + (msg.params.exceptionDetails.exception?.description || ""));
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error("Eval Exception: " + (res.exceptionDetails.text || "") + " " + (res.exceptionDetails.exception?.description || ""));
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(filename) {
    const res = await this.send("Page.captureScreenshot", { format: "png", quality: 95 });
    const buf = Buffer.from(res.data, "base64");
    const filePath = path.join(SHOT_DIR, filename);
    fs.writeFileSync(filePath, buf);
    console.log(`  📸 Screenshot saved: ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
    return filePath;
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runLiveVerification() {
  console.log("=== STARTING LIVE CHROME BROWSER VERIFICATION ===");
  console.log(`Target URL: http://localhost:8781`);

  const tmpProfile = path.join(os.tmpdir(), "chrome-live-profile-" + Date.now());
  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--window-size=1920,1080",
    "--hide-scrollbars",
    "--mute-audio",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${tmpProfile}`
  ]);

  let client = null;
  const results = { passed: 0, failed: 0, checks: [] };

  function check(name, cond, extra = "") {
    if (cond) {
      results.passed++;
      results.checks.push({ name, status: "PASS", extra });
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      results.failed++;
      results.checks.push({ name, status: "FAIL", extra });
      console.error(`  ❌ [FAIL] ${name} ${extra ? "— " + extra : ""}`);
    }
  }

  try {
    await sleep(1500);

    const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://localhost:8781", { method: "PUT" });
    const tabData = await newTabRes.json();
    const wsUrl = tabData.webSocketDebuggerUrl;

    client = new CDPClient(wsUrl);
    await client.connect();

    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("DOM.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    await sleep(1500);

    // Reset progress to Pass 1 for clean campaign verification
    await client.eval(`SAVE.pilgrim = Pilgrimage.blankProgress(); SAVE.runs = 0; if (typeof persist === "function") persist();`);

    // Verify page title and boot
    const title = await client.eval("document.title");
    check("Page loaded with title", title && title.includes("Complete the Verse"), `title: "${title}"`);

    // -----------------------------------------------------------------
    // STEP 1: Main Menu View
    // -----------------------------------------------------------------
    console.log("\n--- 1. VERIFYING MAIN MENU ---");
    await client.eval(`go("menu");`);
    await sleep(500);
    const currentView = await client.eval("currentView");
    check("Main menu is active view", currentView === "menu");
    await client.captureScreenshot("01_main_menu.png");

    // -----------------------------------------------------------------
    // STEP 2: Atlas Map View & Layers
    // -----------------------------------------------------------------
    console.log("\n--- 2. VERIFYING THE ATLAS MAP ---");
    await client.eval(`go("atlas");`);
    await sleep(600);
    check("Atlas view is active", await client.eval("currentView === 'atlas'"));
    const siteMarkers = await client.eval("document.querySelectorAll('.site-marker').length");
    check("Atlas has site markers rendered", siteMarkers > 0, `markers: ${siteMarkers}`);
    await client.captureScreenshot("02_atlas_map.png");

    // -----------------------------------------------------------------
    // STEP 3: Atlas Vignette Modal (Ur of the Chaldees)
    // -----------------------------------------------------------------
    console.log("\n--- 3. VERIFYING ATLAS VIGNETTE (UR) ---");
    await client.eval(`Atlas.openVignette("ur");`);
    await sleep(400);
    const vigTitle = await client.eval(`$("jv-title").textContent`);
    const vigImgSrc = await client.eval(`$("jv-img").src`);
    check("Vignette modal shows correct title", vigTitle === "Abram Departs Ur", `title: "${vigTitle}"`);
    check("Vignette modal uses assets/journey/ur.webp", vigImgSrc.includes("assets/journey/ur.webp"));
    await client.captureScreenshot("03_atlas_vignette_ur.png");
    await client.eval(`Atlas.closeVignette();`);

    // -----------------------------------------------------------------
    // STEP 4: Site Brief Hero Card
    // -----------------------------------------------------------------
    console.log("\n--- 4. VERIFYING SITE BRIEF HERO CARD ---");
    await client.eval(`openSiteBrief("ur", "watchman");`);
    await sleep(400);
    check("Site brief active", await client.eval("currentView === 'sitebrief'"));
    const heroSrc = await client.eval(`$("sb-hero-img").src`);
    check("Site brief displays hero painting", heroSrc.includes("assets/journey/ur.webp"));
    await client.captureScreenshot("04_site_brief_ur.png");

    // -----------------------------------------------------------------
    // STEP 5: Play View — Pilgrimage All 8 Verses (All Mechanics)
    // -----------------------------------------------------------------
    console.log("\n--- 5. VERIFYING PLAY: PILGRIMAGE VERSES 1-8 ---");
    await client.eval(`startRun("pilgrimage", "watchman"); hideSiteQuote(); renderQuestion(R.q, 14000);`);
    await sleep(400);

    // Verse 1: Recognition
    console.log("  -> Testing Verse 1 (Recognition)");
    const bgImageStyle = await client.eval(`window.getComputedStyle($("cine-parallax-img")).backgroundImage`);
    check("Parallax backdrop displays Ur painting", bgImageStyle.includes("assets/journey/ur.webp"), `bg: ${bgImageStyle}`);
    const quitRect = await client.eval(`$("play-quit").getBoundingClientRect().toJSON()`);
    const railRightRect = await client.eval(`document.querySelector('.rail.r').getBoundingClientRect().toJSON()`);
    const isQuitColliding = (quitRect.bottom > railRightRect.top && quitRect.top < railRightRect.bottom && quitRect.right > railRightRect.left && quitRect.left < railRightRect.right);
    check("Quit button has ZERO collision with Score/Multiplier rail", !isQuitColliding, `quit.top=${quitRect.top}, rail.top=${railRightRect.top}`);
    await client.captureScreenshot("05_play_verse1_multiple_choice.png");
    await client.eval(`nextQuestion();`);
    await sleep(200);

    // Verse 2: Recognition
    console.log("  -> Testing Verse 2 (Recognition)");
    check("Verse 2 is multiple choice", await client.eval("R.currentMechanic === null && !R.typed"));
    await client.eval(`nextQuestion();`);
    await sleep(200);

    // Verse 3: Falsehood Strike
    console.log("  -> Testing Verse 3 (Falsehood Strike)");
    check("Current mechanic is Falsehood Strike", await client.eval("R.currentMechanic === 'strike'"));
    const strikeCount = await client.eval("document.querySelectorAll('.strike-word').length");
    check("Strike words rendered in verse text", strikeCount > 0, `count: ${strikeCount}`);
    await client.captureScreenshot("06_play_verse3_strike_falsehood.png");
    await client.eval(`nextQuestion();`);
    await sleep(200);

    // Verse 4: Scribe's Rapid Cloze
    console.log("  -> Testing Verse 4 (Scribe's Rapid Cloze)");
    check("Current mechanic is Scribe Cloze", await client.eval("R.currentMechanic === 'cloze'"));
    const clozeVerseText = await client.eval(`$("verse").textContent`);
    const qPrefix = await client.eval(`R.q.p`);
    check("Scribe cloze displays matching verse text (not stale previous verse)", clozeVerseText.includes(qPrefix.trim().slice(0, 10)), `text: "${clozeVerseText}"`);
    const slotsCount = await client.eval("document.querySelectorAll('.cloze-slot').length");
    const chipsCount = await client.eval("document.querySelectorAll('.cloze-chip').length");
    check("Scribe cloze has slots and word chips rendered", slotsCount > 0 && chipsCount > 0, `slots=${slotsCount}, chips=${chipsCount}`);
    await client.captureScreenshot("07_play_verse4_scribe_cloze.png");
    await client.eval(`nextQuestion();`);
    await sleep(200);

    // Verse 5: True Scripture Duel
    console.log("  -> Testing Verse 5 (True Scripture Duel)");
    check("Current mechanic is Duel", await client.eval("R.currentMechanic === 'duel'"));
    const duelLeft = await client.eval(`!!$("duel-left")`);
    const duelRight = await client.eval(`!!$("duel-right")`);
    check("Reading Alpha and Beta codex tablets rendered", duelLeft && duelRight);
    await client.captureScreenshot("08_play_verse5_scripture_duel.png");
    await client.eval(`nextQuestion();`);
    await sleep(200);

    // Verse 6: Fade-to-Memory (7s Timer)
    console.log("  -> Testing Verse 6 (Fade-to-Memory)");
    check("Current mechanic is Fade-to-Memory", await client.eval("R.currentMechanic === 'fade'"));
    const fadeBarText = await client.eval(`$("fade-bar") ? $("fade-bar").textContent : ""`);
    check("Fade bar starts with 7s countdown", fadeBarText.includes("7s") || fadeBarText.includes("6s"), `bar: "${fadeBarText}"`);
    await client.captureScreenshot("09_play_verse6_fade_7s.png");
    await client.eval(`nextQuestion();`);
    await sleep(200);

    // Verse 7: Assembled Recall
    console.log("  -> Testing Verse 7 (Assembled Recall)");
    check("Verse 7 is Assembled Recall (typed mode)", await client.eval("R.typed === true"));
    await client.captureScreenshot("10_play_verse7_assembled_recall.png");
    await client.eval(`nextQuestion();`);
    await sleep(200);

    // Verse 8: Assembled Recall & Completion
    console.log("  -> Testing Verse 8 (Assembled Recall & Completion)");
    check("Verse 8 is Assembled Recall (typed mode)", await client.eval("R.typed === true"));
    await client.eval(`endRun("complete");`);
    await sleep(400);
    check("Ur cleared in SAVE.pilgrim", await client.eval(`Pilgrimage.isCleared(SAVE.pilgrim, "ur")`));

    // -----------------------------------------------------------------
    // STEP 6: Onboarding Tutorial (All 6 Lessons)
    // -----------------------------------------------------------------
    console.log("\n--- 6. VERIFYING ONBOARDING TUTORIAL (ALL 6 LESSONS) ---");
    await client.eval(`startTutorialRun();`);
    await sleep(300);
    check("Tutorial started with 6 lessons", await client.eval("R.mode === 'tutorial' && R.tutorial.total === 6"));

    // Lesson 1: Recognition
    check("Tutorial Lesson 1 is Recognition", await client.eval("R.tutorial.index === 0"));
    await client.captureScreenshot("11_onboarding_lesson1_choice.png");
    await client.eval(`resolveAnswer(R.q, R.q.a, null, 800, 20000);`);
    await sleep(1400);

    // Lesson 2: Strike
    check("Tutorial Lesson 2 is Falsehood Strike", await client.eval("R.tutorial.index === 1 && R.currentMechanic === 'strike'"));
    await client.captureScreenshot("12_onboarding_lesson2_strike.png");
    await client.eval(`resolveAnswer(R.q, R.q.a, null, 800, 20000);`);
    await sleep(1400);

    // Lesson 3: Cloze
    check("Tutorial Lesson 3 is Scribe Cloze", await client.eval("R.tutorial.index === 2 && R.currentMechanic === 'cloze'"));
    await client.captureScreenshot("13_onboarding_lesson3_cloze.png");
    await client.eval(`resolveAnswer(R.q, R.q.a, null, 800, 20000);`);
    await sleep(1400);

    // Lesson 4: Duel
    check("Tutorial Lesson 4 is Scripture Duel", await client.eval("R.tutorial.index === 3 && R.currentMechanic === 'duel'"));
    await client.captureScreenshot("14_onboarding_lesson4_duel.png");
    await client.eval(`resolveAnswer(R.q, R.q.a, null, 800, 20000);`);
    await sleep(1400);

    // Lesson 5: Fade
    check("Tutorial Lesson 5 is Fade-to-Memory", await client.eval("R.tutorial.index === 4 && R.currentMechanic === 'fade'"));
    await client.captureScreenshot("15_onboarding_lesson5_fade.png");
    await client.eval(`resolveAnswer(R.q, R.q.a, null, 800, 20000);`);
    await sleep(1400);

    // Lesson 6: Assembled Recall
    check("Tutorial Lesson 6 is Assembled Recall", await client.eval("R.tutorial.index === 5 && R.typed === true"));
    await client.captureScreenshot("16_onboarding_lesson6_assemble.png");
    await client.eval(`resolveAnswer(R.q, R.q.a, null, 800, 20000);`);
    await sleep(1400);

    // Verify Completion & Menu
    check("Tutorial finished and returned to menu", await client.eval("currentView === 'menu' && SAVE.set.tutorialDone === true"));
    await client.captureScreenshot("17_tutorial_completion_menu.png");

    // -----------------------------------------------------------------
    // Check Console Logs & Errors
    // -----------------------------------------------------------------
    console.log("\n--- CONSOLE LOGS & RUNTIME EXCEPTION AUDIT ---");
    if (client.errors.length > 0) {
      console.error("Runtime Exceptions Detected in Browser:", client.errors);
      check("No runtime JavaScript exceptions in browser", false, client.errors.join("; "));
    } else {
      check("Zero runtime JavaScript exceptions in live browser", true);
    }

    console.log("\n=======================================================");
    console.log(`LIVE BROWSER VERIFICATION SUMMARY:`);
    console.log(`Passed: ${results.passed} / ${results.passed + results.failed}`);
    if (results.failed > 0) {
      console.error(`FAILED: ${results.failed} checks.`);
      process.exit(1);
    } else {
      console.log(`🎉 ALL LIVE BROWSER VERIFICATION CHECKS PASSED WITH 100% ACCURACY!`);
    }

  } catch (err) {
    console.error("Live Browser Verification Error:", err);
    process.exit(1);
  } finally {
    if (client) client.close();
    chrome.kill();
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch (_) {}
  }
}

runLiveVerification();
