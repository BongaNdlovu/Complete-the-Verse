const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9334;
const SHOT = path.join(__dirname, "..", ".tmp-proof");
if (!fs.existsSync(SHOT)) fs.mkdirSync(SHOT, { recursive: true });

let nextId = 1;
class CDP {
  constructor(url) { this.url = url; this.cb = new Map(); this.errors = []; }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id && this.cb.has(msg.id)) {
          const { resolve, reject } = this.cb.get(msg.id);
          this.cb.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        } else if (msg.method === "Runtime.exceptionThrown") {
          this.errors.push((msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description) || msg.params.exceptionDetails.text);
        }
      };
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      this.cb.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const res = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error((res.exceptionDetails.exception && res.exceptionDetails.exception.description) || res.exceptionDetails.text);
    }
    return res.result ? res.result.value : undefined;
  }
  async shot(name) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(SHOT, name), Buffer.from(res.data, "base64"));
    console.log("SHOT", name);
  }
  close() { if (this.ws) this.ws.close(); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log("PASS", name); }
  else { failed++; console.log("FAIL", name, extra || ""); }
}

(async () => {
  const profile = path.join(os.tmpdir(), "ctv-proof-" + Date.now());
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--window-size=1920,1080",
    "--hide-scrollbars", "--mute-audio", "--no-first-run", `--user-data-dir=${profile}`
  ]);
  await sleep(1800);
  const tab = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:8781`, { method: "PUT" }).then((r) => r.json());
  const c = new CDP(tab.webSocketDebuggerUrl);
  await c.connect();
  await c.send("Page.enable");
  await c.send("Runtime.enable");
  await c.send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  try { await c.send("Emulation.setAutoplayPolicy", { policy: "noUserGestureRequired" }); } catch (e) {}
  for (let i = 0; i < 25; i++) {
    try { if (await c.eval("Boolean(window.SAVE && window.go)")) break; } catch (e) {}
    await sleep(400);
  }

  await c.eval(`localStorage.clear(); location.reload(true)`);
  await sleep(2500);
  for (let i = 0; i < 25; i++) {
    try { if (await c.eval("Boolean(window.SAVE && window.go)")) break; } catch (e) {}
    await sleep(400);
  }

  const snap = async (label) => {
    const info = await c.eval(`({
      view: currentView,
      mode: (typeof R !== "undefined" && R && R.mode) || null,
      filmOn: !!($("ur-prologue") && $("ur-prologue").classList.contains("on")),
      quoteOn: !!($("site-quote") && $("site-quote").classList.contains("on")),
      introOn: !!($("v-intro") && $("v-intro").classList.contains("on")),
      introPlaying: !!($("v-intro") && $("v-intro").classList.contains("playing")),
      introSrc: $("intro-video") && ($("intro-video").getAttribute("src") || $("intro-video").src || ""),
      introPaused: $("intro-video") && $("intro-video").paused,
      captionOn: !!($("voice-caption") && $("voice-caption").classList.contains("on")),
      caption: $("voice-caption") && $("voice-caption").textContent || "",
      guideOn: !!($("tutorial-guide") && !$("tutorial-guide").hidden),
      guide: $("tutorial-guide") && $("tutorial-copy") && $("tutorial-copy").textContent || "",
      onboarding: document.body.classList.contains("onboarding"),
      introPlayed: !!(SAVE.set && SAVE.set.introPlayed),
      tutorialDone: !!(SAVE.set && SAVE.set.tutorialDone),
      ans: document.querySelectorAll("#opts .ans").length,
      ansInView: (function(){
        var a=document.querySelector("#opts .ans");
        if(!a) return false;
        var r=a.getBoundingClientRect();
        return r.height>8 && r.bottom<=window.innerHeight+8 && r.top>=-8;
      })(),
      pickerOn: !!($("character-pick") && $("character-pick").classList.contains("on")),
      vignetteOn: !!(function(){
        var m=$("journey-vignette-modal");
        return m && !m.hidden && m.classList.contains("on");
      })(),
      site: (typeof R !== "undefined" && R && R.siteId) || null
    })`);
    console.log("STATE", label, JSON.stringify(info));
    return info;
  };

  await c.eval(`SAVE.set.quality='high'; SAVE.set.reduced=false; SAVE.set.voice=true; SAVE.set.introPlayed=false; SAVE.set.tutorialDone=false; persist(); introReady=true; introDone=false; introStarted=false; introTapPending=false; go("intro")`);
  await sleep(400);
  let st = await snap("intro-idle");
  check("intro view is on", st.view === "intro" && st.introOn);
  check("intro video is sourced", String(st.introSrc).indexOf("assets/intro.mp4") >= 0);
  await c.shot("desktop-01-intro.png");

  await c.eval(`beginIntroPlayback()`);
  await sleep(800);
  st = await snap("intro-playing");
  check("intro starts playback", st.introPlaying === true);
  check("intro voice caption is on", st.captionOn === true && st.caption.length > 8);
  await c.shot("desktop-02-intro-playing.png");

  await c.eval(`finishIntro(true)`);
  await sleep(500);
  await c.eval(`SAVE.set.tutorialDone=false; persist(); enterCoffeePath()`);
  await sleep(600);
  st = await snap("tutorial-l1");
  check("tutorial is the live mode", st.mode === "tutorial" && st.view === "play");
  check("tutorial guide is visible", st.guideOn === true && st.guide.length > 8);
  check("lesson voice caption is visible", st.captionOn === true);
  check("tutorial is not stamped done", st.tutorialDone === false);
  check("tutorial shows four answers", st.ans === 4, "ans="+st.ans);
  check("tutorial answers are on screen", st.ansInView === true);
  await c.shot("desktop-03-tutorial.png");
  await c.eval(`SAVE.set.playerName="Proof"; SAVE.set.profileDone=true; persist(); if(typeof closeCharacterPicker==="function") closeCharacterPicker();`);
  check("tutorial overlay is closed", st.pickerOn === false);

  const screens = [
    ["menu", `if(typeof completeTutorialRun==="function" && R && R.mode==="tutorial") completeTutorialRun(); else { if(R){ R.ended=true; R.running=false; } go("menu"); }`, "desktop-04-menu.png"],
    ["atlas", `go("atlas")`, "desktop-05-atlas.png"],
    ["settings", `go("settings")`, "desktop-06-settings.png"],
    ["study", `go("study")`, "desktop-07-study.png"],
    ["relics", `go("relics")`, "desktop-08-relics.png"],
    ["seals", `go("seals")`, "desktop-09-seals.png"],
    ["records", `go("records")`, "desktop-10-records.png"],
    ["daily", `startRun("daily","watchman")`, "desktop-11-daily.png"],
    ["trial", `endRun("abandon"); startRun("trial","watchman")`, "desktop-12-trial.png"],
    ["practice", `endRun("abandon"); startRun("practice","watchman")`, "desktop-13-practice.png"],
    ["recall", `endRun("abandon"); startRun("recall","watchman")`, "desktop-14-recall.png"],
    ["blitz", `endRun("abandon"); startRun("blitz","watchman")`, "desktop-15-blitz.png"],
    ["endless", `endRun("abandon"); startRun("endless","watchman")`, "desktop-16-endless.png"],
    ["team", `endRun("abandon"); startRun("team","watchman")`, "desktop-17-team.png"],
    ["beat", `endRun("abandon"); startRun("beat","watchman")`, "desktop-18-beat.png"],
    ["tablets", `endRun("abandon"); SAVE.set.tabletsTutorialDone=true; persist(); startRun("tablets","watchman",{tabletChapter:"psalm23"})`, "desktop-19-tablets.png"],
    ["pilgrimage", `endRun("abandon"); pendingSiteId="ur"; startRun("pilgrimage","watchman"); if(typeof hideSiteQuote==="function") hideSiteQuote();`, "desktop-20-pilgrimage-ur.png"],
    ["relay", `endRun("abandon"); pendingArcKey="patriarchs"; startRun("relay","watchman")`, "desktop-21-relay.png"],
    ["pilgrim-recall", `endRun("abandon"); pendingSiteId="ur"; startRun("pilgrim-recall","watchman"); if(typeof hideSiteQuote==="function") hideSiteQuote();`, "desktop-22-pilgrim-recall.png"],
    ["brief-daily", `endRun("abandon"); openBrief("daily")`, "desktop-23-brief.png"],
    ["sitebrief", `openSiteBrief("ur")`, "desktop-24-sitebrief.png"],
    ["results", `startRun("daily","watchman"); endRun("abandon")`, "desktop-25-results.png"]
  ];

  for (const [label, code, file] of screens) {
    try { await c.eval(code); }
    catch (e) { check(label + " eval", false, String(e.message || e)); }
    await sleep(450);
    st = await snap(label);
    check(label + " did not throw", st.view != null);
    if (st.view === "play" || st.view === "tablets" || st.view === "act") {
      check(label + " profile overlay closed", st.pickerOn === false);
      check(label + " atlas vignette closed", st.vignetteOn === false);
    }
    if (st.view === "play" && st.mode !== "recall" && st.mode !== "pilgrim-recall" && st.mode !== "beat") {
      check(label + " answers on screen", st.ansInView === true, "ans="+st.ans);
    }
    await c.shot(file);
  }

  await c.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await c.eval(`introReady=true; introDone=false; introStarted=false; introTapPending=false; SAVE.set.introPlayed=false; persist(); var stg=$("v-intro"); if(stg){ stg.classList.remove("playing","leaving"); } var card=$("intro-start"); if(card) card.removeAttribute("hidden"); go("intro")`);
  await sleep(350);
  st = await snap("phone-intro");
  check("phone intro is on", st.view === "intro");
  await c.shot("phone-01-intro.png");
  await c.eval(`beginIntroPlayback()`);
  await sleep(600);
  st = await snap("phone-intro-playing");
  check("phone intro caption", st.captionOn === true);
  await c.shot("phone-02-intro-playing.png");
  await c.eval(`finishIntro(true)`);
  await sleep(500);
  await c.eval(`SAVE.set.tutorialDone=false; persist(); enterCoffeePath()`);
  await sleep(500);
  st = await snap("phone-tutorial");
  check("phone tutorial is live", st.mode === "tutorial" && st.guideOn);
  check("phone tutorial has four answers", st.ans === 4, "ans="+st.ans);
  check("phone tutorial answers are on screen", st.ansInView === true);
  await c.shot("phone-03-tutorial.png");
  await c.eval(`SAVE.set.playerName="Proof"; SAVE.set.profileDone=true; persist(); if(typeof closeCharacterPicker==="function") closeCharacterPicker();`);

  const phone = [
    ["menu", `if(typeof completeTutorialRun==="function" && R && R.mode==="tutorial") completeTutorialRun(); else { if(R){ R.ended=true; R.running=false; } go("menu"); }`, "phone-04-menu.png"],
    ["atlas", `go("atlas")`, "phone-05-atlas.png"],
    ["settings", `go("settings")`, "phone-06-settings.png"],
    ["study", `go("study")`, "phone-07-study.png"],
    ["relics", `go("relics")`, "phone-08-relics.png"],
    ["seals", `go("seals")`, "phone-09-seals.png"],
    ["records", `go("records")`, "phone-10-records.png"],
    ["daily", `startRun("daily","watchman")`, "phone-11-daily.png"],
    ["trial", `endRun("abandon"); startRun("trial","watchman")`, "phone-12-trial.png"],
    ["practice", `endRun("abandon"); startRun("practice","watchman")`, "phone-13-practice.png"],
    ["recall", `endRun("abandon"); startRun("recall","watchman")`, "phone-14-recall.png"],
    ["blitz", `endRun("abandon"); startRun("blitz","watchman")`, "phone-15-blitz.png"],
    ["endless", `endRun("abandon"); startRun("endless","watchman")`, "phone-16-endless.png"],
    ["team", `endRun("abandon"); startRun("team","watchman")`, "phone-17-team.png"],
    ["beat", `endRun("abandon"); startRun("beat","watchman")`, "phone-18-beat.png"],
    ["tablets", `endRun("abandon"); SAVE.set.tabletsTutorialDone=true; persist(); startRun("tablets","watchman",{tabletChapter:"psalm23"})`, "phone-19-tablets.png"],
    ["pilgrimage", `endRun("abandon"); pendingSiteId="ur"; startRun("pilgrimage","watchman"); if(typeof hideSiteQuote==="function") hideSiteQuote();`, "phone-20-pilgrimage-ur.png"],
    ["relay", `endRun("abandon"); pendingArcKey="patriarchs"; startRun("relay","watchman")`, "phone-21-relay.png"],
    ["brief", `endRun("abandon"); openBrief("daily")`, "phone-22-brief.png"],
    ["sitebrief", `openSiteBrief("ur")`, "phone-23-sitebrief.png"],
    ["results", `startRun("daily","watchman"); endRun("abandon")`, "phone-24-results.png"]
  ];
  for (const [label, code, file] of phone) {
    try { await c.eval(code); }
    catch (e) { check("phone " + label + " eval", false, String(e.message || e)); }
    await sleep(400);
    st = await snap("phone-" + label);
    check("phone " + label + " did not throw", st.view != null);
    if (st.view === "play" || st.view === "tablets" || st.view === "act") {
      check("phone " + label + " profile overlay closed", st.pickerOn === false);
      check("phone " + label + " atlas vignette closed", st.vignetteOn === false);
    }
    if (st.view === "play" && st.mode !== "recall" && st.mode !== "pilgrim-recall" && st.mode !== "beat") {
      check("phone " + label + " answers on screen", st.ansInView === true, "ans="+st.ans);
    }
    await c.shot(file);
  }

  console.log("EXCEPTIONS", c.errors.length ? c.errors.join(" | ") : "none");
  check("no runtime exceptions", c.errors.length === 0, c.errors.join(" | "));
  console.log("PROOF", passed, "passed", failed, "failed", "shots in .tmp-proof");
  c.close();
  chrome.kill();
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  if (failed) process.exit(1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
