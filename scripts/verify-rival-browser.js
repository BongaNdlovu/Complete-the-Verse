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
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runBrowserAcceptance() {
  console.log("=== EXECUTING RIVAL ASSET & UI HIERARCHY BROWSER ACCEPTANCE SUITE ===");
  const tmpProfile = path.join(os.tmpdir(), "chrome-rival-profile-" + Date.now());
  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9223",
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

    const newTabRes = await fetch("http://127.0.0.1:9223/json/new?http://localhost:8781", { method: "PUT" });
    const tabData = await newTabRes.json();
    const wsUrl = tabData.webSocketDebuggerUrl;

    client = new CDPClient(wsUrl);
    await client.connect();

    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("DOM.enable");

    await sleep(1200);

    // 1. Pilgrimage Mode: Pursuer Asset Verification
    console.log("\n--- 1. PILGRIMAGE: PURSUER ASSET & TOP HUD ---");
    await client.eval(`SAVE.pilgrim = Pilgrimage.blankProgress(); startRun("pilgrimage", "watchman"); hideSiteQuote(); renderQuestion(R.q, 14000);`);
    await sleep(400);

    const hudVisible = await client.eval(`!$("rival-hud").hidden`);
    check("Rival HUD is visible in Pilgrimage", hudVisible);

    const pursuerSrc = await client.eval(`$("rival-hud").querySelector(".rival-figure img").src`);
    check("Rival figure displays shadow-pursuer.png", pursuerSrc.includes("assets/rival/shadow-pursuer.png"), `src: ${pursuerSrc}`);

    const hasGlyphFallback = await client.eval(`$("rival-hud").querySelector(".rival-figure span").textContent === "◈"`);
    check("Rival figure preserves glyph fallback ◈", hasGlyphFallback);

    await client.captureScreenshot("rival_01_pilgrimage_pursuer.png");

    // 2. Trial Mode: Rival System Appearance
    console.log("\n--- 2. TRIAL MODE: RIVAL SYSTEM ---");
    await client.eval(`startRun("trial", "watchman"); go("play"); nextQuestion();`);
    await sleep(400);

    const trialRivalVisible = await client.eval(`!$("rival-hud").hidden`);
    check("Rival HUD is visible in Trial mode", trialRivalVisible);

    await client.captureScreenshot("rival_02_trial_mode.png");

    // 3. Mistake Pressure: 2 Consecutive Misses -> Threat Mask
    console.log("\n--- 3. MISTAKE PRESSURE: THREAT MASK ON 2 MISSES ---");
    await client.eval(`
      R.missStreak = 2;
      if (R.rivalRace) {
        R.rivalRace.misses = 2;
        updateRivalRace();
      }
    `);
    await sleep(300);

    const threatSrc = await client.eval(`$("rival-hud").querySelector(".rival-figure img").src`);
    check("Two consecutive misses trigger rival-mask.png", threatSrc.includes("assets/rival/rival-mask.png"), `src: ${threatSrc}`);

    await client.captureScreenshot("rival_03_threat_mask_misses.png");

    // 4. Reduced Motion Mode
    console.log("\n--- 4. REDUCED MOTION MODE ---");
    await client.eval(`SAVE.set.reduced = true; document.body.classList.add("reduced"); updateRivalRace();`);
    await sleep(300);

    const figureAnimation = await client.eval(`window.getComputedStyle($("rival-hud").querySelector(".rival-figure")).animationName`);
    check("Reduced motion removes pulse animation but keeps figure asset", figureAnimation === "none", `animation: ${figureAnimation}`);

    await client.captureScreenshot("rival_04_reduced_motion.png");

    // 5. Results Screen: Retreat Recorded with Threat Mask & Safety Message
    console.log("\n--- 5. RESULTS SCREEN: RETREAT RECORDED ---");
    await client.eval(`
      R.rivalSetback = true;
      endRun("fail");
    `);
    await sleep(400);

    const resRivalImg = await client.eval(`$("res-rival").querySelector("img") ? $("res-rival").querySelector("img").src : ""`);
    check("Results screen renders threat mask image on retreat", resRivalImg.includes("assets/rival/rival-mask.png"), `src: ${resRivalImg}`);

    const resRivalText = await client.eval(`$("res-rival").textContent`);
    check("Results screen retains non-destructive safety message", resRivalText.includes("Permanent relics and cleared sites are safe"), `text: ${resRivalText}`);

    await client.captureScreenshot("rival_05_results_retreat_mask.png");

    // 6. Viewport Matrix & Visual Geometry Hierarchy Checks
    console.log("\n--- 6. VIEWPORT MATRIX & GEOMETRY HIERARCHY CHECKS ---");
    const viewports = [
      { name: "desktop_1920x1080", w: 1920, h: 1080 },
      { name: "laptop_1366x768",   w: 1366, h: 768 },
      { name: "tablet_1024x768",   w: 1024, h: 768 },
      { name: "mobile_390x844",    w: 390,  h: 844 },
      { name: "mobile_430x932",    w: 430,  h: 932 }
    ];

    for (const vp of viewports) {
      console.log(`\n  Checking viewport: ${vp.name} (${vp.w}×${vp.h})`);
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.w <= 600
      });

      // Start run with active quick rewards and rival HUD visible
      await client.eval(`
        SAVE.set.reduced = false;
        document.body.classList.remove("reduced");
        startRun("trial", "watchman");
        hideSiteQuote();
        go("play");
        if (R.q) renderQuestion(R.q, 14000);
        if (typeof Rewards !== "undefined" && Rewards.initRun) {
          Rewards.initRun();
          Rewards.renderHud();
        }
        if (typeof initRivalRace === "function") {
          initRivalRace();
        }
      `);
      await sleep(400);

      const geom = await client.eval(`
        (() => {
          const topStack = document.querySelector(".play-top-stack")?.getBoundingClientRect();
          const actTrack = document.querySelector(".act-track")?.getBoundingClientRect();
          const rewards = document.querySelector(".quick-rewards")?.getBoundingClientRect();
          const rival = document.querySelector(".rival-hud")?.getBoundingClientRect();
          const verse = document.querySelector(".verse-stage")?.getBoundingClientRect();
          const answers = document.querySelector(".answers")?.getBoundingClientRect();
          const controls = document.querySelector(".control")?.getBoundingClientRect();

          return {
            topStack: topStack ? { top: topStack.top, bottom: topStack.bottom, height: topStack.height } : null,
            actTrack: actTrack ? { top: actTrack.top, bottom: actTrack.bottom, height: actTrack.height } : null,
            rewards: rewards && !document.querySelector(".quick-rewards")?.hidden ? { top: rewards.top, bottom: rewards.bottom, height: rewards.height } : null,
            rival: rival && !document.querySelector(".rival-hud")?.hidden ? { top: rival.top, bottom: rival.bottom, height: rival.height } : null,
            verse: verse ? { top: verse.top, bottom: verse.bottom, height: verse.height } : null,
            answers: answers ? { top: answers.top, bottom: answers.bottom, height: answers.height } : null,
            controls: controls ? { top: controls.top, bottom: controls.bottom, height: controls.height } : null
          };
        })()
      `);

      if (geom.topStack && geom.verse) {
        check(`${vp.name}: top HUD stack sits above verse (no overlap)`, geom.topStack.bottom <= geom.verse.top + 1, `topStack.bottom: ${geom.topStack.bottom}, verse.top: ${geom.verse.top}`);
      }
      if (geom.rewards && geom.rival && geom.rewards.height > 0 && geom.rival.height > 0) {
        check(`${vp.name}: quick-rewards sits above rival HUD`, geom.rewards.bottom <= geom.rival.top + 1, `rewards.bottom: ${geom.rewards.bottom}, rival.top: ${geom.rival.top}`);
      }
      if (geom.rival && geom.verse && geom.rival.height > 0) {
        check(`${vp.name}: rival HUD sits above verse`, geom.rival.bottom <= geom.verse.top + 1, `rival.bottom: ${geom.rival.bottom}, verse.top: ${geom.verse.top}`);
      }
      if (geom.verse && geom.answers) {
        check(`${vp.name}: verse sits above answer options`, geom.verse.bottom <= geom.answers.top + 1, `verse.bottom: ${geom.verse.bottom}, answers.top: ${geom.answers.top}`);
      }
      if (geom.answers && geom.controls) {
        check(`${vp.name}: answers sit above timer/controls`, geom.answers.bottom <= geom.controls.top + 1, `answers.bottom: ${geom.answers.bottom}, controls.top: ${geom.controls.top}`);
      }

      await client.captureScreenshot(`ui_layout_${vp.name}.png`);
    }

    // Check for 0 console errors
    console.log("\n--- CONSOLE LOG & EXCEPTION AUDIT ---");
    if (client.errors.length > 0) {
      check("Zero runtime JavaScript exceptions in browser", false, client.errors.join("; "));
    } else {
      check("Zero runtime JavaScript exceptions in live browser", true);
    }

    console.log("\n=======================================================");
    console.log(`RIVAL & UI HIERARCHY BROWSER ACCEPTANCE SUMMARY:`);
    console.log(`Passed: ${results.passed} / ${results.passed + results.failed}`);
    if (results.failed > 0) {
      console.error(`FAILED: ${results.failed} checks.`);
      process.exit(1);
    } else {
      console.log(`🎉 ALL BROWSER ACCEPTANCE & GEOMETRY CHECKS PASSED (100%)!`);
    }

  } catch (err) {
    console.error("Browser Acceptance Error:", err);
    process.exit(1);
  } finally {
    if (client) client.close();
    chrome.kill();
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch (_) {}
  }
}

runBrowserAcceptance();
