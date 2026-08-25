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
  console.log("=== EXECUTING BROWSER ACCEPTANCE SUITE (60s FADE, 4s ANSWER DISPLAY, FADE ILLUMINATE REWARD, CLEAN HUD) ===");
  const tmpProfile = path.join(os.tmpdir(), "chrome-test-profile-" + Date.now());
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

    // 1. Clean Top HUD: No Pursuer Element
    console.log("\n--- 1. TOP HUD: PURSUER REMOVAL & CLEAN STACK ---");
    await client.eval(`SAVE.pilgrim = Pilgrimage.blankProgress(); startRun("pilgrimage", "watchman"); hideSiteQuote(); renderQuestion(R.q, 14000);`);
    await sleep(400);

    const rivalHudExists = await client.eval(`!!$("rival-hud")`);
    check("Rival HUD element is removed from DOM", !rivalHudExists);

    const actTrackExists = await client.eval(`!!$("act-track")`);
    check("Act track exists in top stack", actTrackExists);

    const quickRewardsExists = await client.eval(`!!$("quick-rewards")`);
    check("Quick rewards exists in top stack", quickRewardsExists);

    await client.captureScreenshot("clean_hud_01_play.png");

    // 2. Fade-to-Memory Timing (60s Memorization)
    console.log("\n--- 2. FADE-TO-MEMORY: 60s MEMORIZATION TIMING ---");
    await client.eval(`
      const q = {id:"t-fade", b:"Philippians", r:"Philippians 4:13", t:1, p:"I can do all things through Christ which", a:"strengtheneth me", s:".", mechanic:"fade"};
      Object.assign(R, {q: q, locked: false, running: true, paused: false, sceneToken: 20});
      renderFadeQuestion(q, 60000, 20);
    `);
    await sleep(300);

    const fadePhase = await client.eval(`R.fadePhase`);
    check("Fade enters memorize phase", fadePhase === "memorize");

    const fadeBarText = await client.eval(`$("fade-bar") ? $("fade-bar").textContent : ""`);
    check("Fade countdown displays 60s", fadeBarText.includes("60s"), `text: ${fadeBarText}`);

    const fadeTotalTime = await client.eval(`R.tTotal`);
    check("Fade total timer is 60,000 ms", fadeTotalTime === 60000);

    await client.captureScreenshot("fade_02_60s_memorization.png");

    // 2b. Memorization mastery pays an Illuminate card
    console.log("\n--- 2B. MEMORIZATION MASTERY PAYS AN ILLUMINATE CARD ---");
    const fadeHandoff = await client.eval(`
      (() => {
        try {
          timeUp(); /* the memorize window ends -> dissolve -> reconstruct */
          return {ok: true};
        } catch (e) { return {ok: false, err: String(e)}; }
      })()
    `);
    check("Fade memorize window hands off to reconstruction", fadeHandoff && fadeHandoff.ok, fadeHandoff ? (fadeHandoff.err || "") : "");
    await sleep(1600); /* dissolve animation (1200ms) then the rebuild board */

    const fadeReward = await client.eval(`
      (() => {
        try {
          if (R.fadePhase !== "reconstruct") return {ok: false, err: "phase=" + R.fadePhase};
          const before = R.powers.illum || 0;
          resolveAnswer(R.q, R.fadeAssembly.target, null, 500, 30000);
          const after = R.powers.illum || 0;
          return {ok: after === before + 1, err: "illum before=" + before + " after=" + after};
        } catch (e) { return {ok: false, err: String(e)}; }
      })()
    `);
    check("Correct Fade reconstruction earns an Illuminate card", fadeReward && fadeReward.ok, fadeReward ? (fadeReward.err || "") : "");

    await client.captureScreenshot("fade_reward_illuminate_card.png");

    // 3. 4-Second Answer Review Display
    console.log("\n--- 3. 4-SECOND ANSWER REVIEW DISPLAY ---");
    await client.eval(`
      const qNormal = {id:"t-rec", b:"Psalms", r:"Psalm 23:1", t:1, p:"The LORD is my shepherd; I", a:"shall not want", s:".", d:["shall not fear", "shall not faint", "shall not wander"]};
      Object.assign(R, {q: qNormal, locked: false, running: true, paused: false, sceneToken: 21, attempts: 0, correct: 0});
      renderQuestion(qNormal, 20000);
      resolveAnswer(qNormal, "shall not want", null, 1000, 19000);
    `);
    await sleep(1000);

    const isAnswerStillShowing = await client.eval(`currentView === "play" && $("blank") && $("blank").textContent === "shall not want"`);
    check("Answer remains displayed during 4-second review window", isAnswerStillShowing);

    const flowJudgeMs = await client.eval(`Flow.JUDGE_MS`);
    check("Flow.JUDGE_MS is 4000ms", flowJudgeMs === 4000);

    await client.captureScreenshot("answer_reveal_03_4s_display.png");

    // 4. Viewport Matrix Checks across Viewports
    console.log("\n--- 4. VIEWPORT MATRIX & RESPONSIVE GEOMETRY CHECKS ---");
    const viewports = [
      { name: "desktop_1920x1080", w: 1920, h: 1080 },
      { name: "laptop_1366x768", w: 1366, h: 768 },
      { name: "tablet_1024x768", w: 1024, h: 768 },
      { name: "mobile_390x844", w: 390, h: 844 },
      { name: "mobile_430x932", w: 430, h: 932 }
    ];

    for (const vp of viewports) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.w <= 600
      });
      await sleep(300);

      const geom = await client.eval(`
        (() => {
          const stack = document.querySelector(".play-top-stack");
          const qContent = document.querySelector(".question-content");
          const verse = document.querySelector("#verse-stage");
          const opts = document.querySelector("#opts");
          const quit = document.querySelector(".play-quit");
          const sR = stack ? stack.getBoundingClientRect() : null;
          const qR = qContent ? qContent.getBoundingClientRect() : null;
          const vR = verse ? verse.getBoundingClientRect() : null;
          const oR = opts ? opts.getBoundingClientRect() : null;
          const qtr = quit ? quit.getBoundingClientRect() : null;

          return {
            stackBottom: sR ? sR.bottom : 0,
            verseTop: vR ? vR.top : 0,
            verseBottom: vR ? vR.bottom : 0,
            optsTop: oR ? oR.top : 0,
            optsBottom: oR ? oR.bottom : 0,
            quitRight: qtr ? qtr.right : 0,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
          };
        })()
      `);

      check(`[${vp.name}] Top HUD stack does not overlap question`, geom.stackBottom <= geom.verseTop + 30);
      check(`[${vp.name}] Verse text sits above answer choices`, geom.verseBottom <= geom.optsTop + 20);
      check(`[${vp.name}] Answer options fit within viewport height`, geom.optsBottom <= geom.viewportHeight + 20);

      await client.captureScreenshot(`layout_${vp.name}.png`);
    }

    console.log(`\n========================================`);
    console.log(`ACCEPTANCE RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
    console.log(`========================================`);

    if (results.failed > 0) {
      process.exit(1);
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
