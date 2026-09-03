#!/usr/bin/env node
/* Remaining overlays / gated screens at 390×844.
   Requires: node scripts/dev-server.js  (http://localhost:8781)
   Run:      node scripts/mobile-remaining.js
*/
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ROOT = require("./repo-root");

const CHROME = process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PAGE = "http://localhost:8781";
const DEBUG_PORT = 9335;
const SHOT = path.join(ROOT, ".tmp-live", "mobile-qa");
fs.mkdirSync(SHOT, { recursive: true });

let nextId = 1;
const fails = [];
function check(name, cond, extra) {
  if (cond) console.log("  PASS  " + name);
  else {
    fails.push(name + (extra ? " — " + extra : ""));
    console.log("  FAIL  " + name + (extra ? " — " + extra : ""));
  }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDP {
  constructor(url) { this.url = url; this.ws = null; this.cb = new Map(); }
  _failPending(reason) {
    const pending = this.cb;
    this.cb = new Map();
    for (const { reject } of pending.values()) reject(new Error(reason));
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = () => {
        this._failPending("CDP connection error");
        reject(new Error("CDP connection error: " + this.url));
      };
      this.ws.onclose = () => this._failPending("CDP connection closed");
      this.ws.onmessage = ev => {
        const msg = JSON.parse(ev.data);
        if (msg.id && this.cb.has(msg.id)) {
          const { resolve, reject } = this.cb.get(msg.id);
          this.cb.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      };
    });
  }
  send(method, params) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      this.cb.set(id, { resolve, reject });
      try {
        this.ws.send(JSON.stringify({ id, method, params }));
      } catch (e) {
        this.cb.delete(id);
        reject(e);
      }
    });
  }
  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression, returnByValue: true, awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error((res.exceptionDetails.exception &&
        res.exceptionDetails.exception.description) || res.exceptionDetails.text);
    }
    return res.result ? res.result.value : undefined;
  }
  async shot(name) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(SHOT, name), Buffer.from(res.data, "base64"));
    console.log("  SHOT  " + name);
  }
  close() {
    if (!this.ws) return;
    try { this.ws.close(); } catch (e) {}
    this._failPending("CDP connection closed");
  }
}

async function connect() {
  const tab = await fetch("http://127.0.0.1:" + DEBUG_PORT + "/json/new?" + PAGE, { method: "PUT" })
    .then(r => r.json());
  const c = new CDP(tab.webSocketDebuggerUrl);
  await c.connect();
  await c.send("Page.enable");
  await c.send("Runtime.enable");
  await c.send("Emulation.setDeviceMetricsOverride", {
    width: 390, height: 844, deviceScaleFactor: 3, mobile: true
  });
  await c.send("Emulation.setUserAgentOverride", {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  });
  for (let i = 0; i < 30; i++) {
    try {
      if (await c.eval("Boolean(window.SAVE && typeof startRun === 'function')")) break;
    } catch (e) {}
    await sleep(400);
  }
  return c;
}

async function skipChrome(c) {
  await c.eval(`
    SAVE.set.tutorialDone = true;
    SAVE.set.tutorialSeen = true;
    SAVE.set.introPlayed = true;
    SAVE.set.tabletsTutorialDone = true;
    if (typeof persist === "function") persist();
    if (typeof go === "function") go("menu");
  `);
  await sleep(400);
}

async function overflow(c, label) {
  const w = await c.eval("document.documentElement.scrollWidth");
  check(label + " scrollWidth <= 390", w <= 390, "w=" + w);
  return w;
}

async function waitPlayReady(c) {
  for (let i = 0; i < 16; i++) {
    const ready = await c.eval(`(() => {
      const wrap = document.querySelector(".answers.typed .typewrap");
      if (wrap) return getComputedStyle(wrap).opacity !== "0";
      const a = document.querySelector("#opts .ans");
      if (a) return getComputedStyle(a).opacity !== "0";
      if (document.querySelector(".cloze-chip")) return true;
      if (document.querySelector(".fade-done")) return true;
      if (document.querySelector(".asm-tile")) return true;
      return false;
    })()`);
    if (ready) return true;
    await sleep(200);
  }
  return false;
}

async function overlayFit(c, sel) {
  return c.eval(`(() => {
    const el = document.querySelector(${JSON.stringify(sel)});
    if (!el) return { ok: false, reason: "missing" };
    const r = el.getBoundingClientRect();
    const card = el.querySelector(".od-card, .tut-card, .pause-stats, .state-card, .setpiece-inner, .reveal-card, .tablets-pause-card, .jv-card, .relic-inspect, .char-panel") || el;
    const cr = card.getBoundingClientRect();
    return {
      ok: true,
      on: el.classList.contains("on") || !el.hidden,
      t: Math.round(r.top), b: Math.round(r.bottom),
      ct: Math.round(cr.top), cb: Math.round(cr.bottom),
      ch: Math.round(cr.height),
      clipped: cr.bottom > 846 || cr.top < -2,
      scrollW: document.documentElement.scrollWidth
    };
  })()`);
}

async function playGeom(c) {
  return c.eval(`(() => {
    const play = document.getElementById("v-play");
    const bar = document.querySelector(".powerbar");
    const answers = Array.from(document.querySelectorAll("#opts .ans"));
    if (!play) return { ok: false, reason: "no play" };
    const pr = play.getBoundingClientRect();
    const br = bar ? bar.getBoundingClientRect() : null;
    const rects = answers.map(el => {
      const r = el.getBoundingClientRect();
      return { t: r.top, b: r.bottom };
    });
    const overlap = br ? rects.filter(a =>
      a.b > br.top + 2 && a.t < br.bottom - 2).length : 0;
    const visible = rects.filter(a => a.t >= pr.top - 2 && a.b <= pr.bottom + 2).length;
    return {
      ok: true, n: rects.length, overlap, visible,
      barTop: br ? Math.round(br.top) : null,
      lastB: rects.length ? Math.round(rects[rects.length - 1].b) : null,
      scrollW: document.documentElement.scrollWidth,
      view: document.body.className,
      cloze: document.querySelectorAll(".cloze-chip").length,
      fade: !!document.querySelector(".fade-done"),
      tiles: document.querySelectorAll(".asm-tile").length
    };
  })()`);
}

async function abandon(c) {
  await c.eval(`
    try { if (typeof hideState === "function") hideState(); } catch (e) {}
    try {
      var p = document.getElementById("pause"); if (p) p.classList.remove("on");
      var od = document.getElementById("overdrive-choice"); if (od) od.classList.remove("on");
      var sp = document.getElementById("setpiece-card"); if (sp) sp.classList.remove("on");
      var tut = document.getElementById("tutorial"); if (tut) tut.classList.remove("on");
      var rv = document.getElementById("reveal-stage"); if (rv) rv.classList.remove("on","play");
      var sq = document.getElementById("site-quote"); if (sq) sq.classList.remove("on");
      var tg = document.getElementById("tutorial-guide"); if (tg) tg.hidden = true;
      document.body.classList.remove("od-open","setpiece-active","onboarding");
    } catch (e) {}
    try { if (typeof endRun === "function") endRun("abandon"); } catch (e) {}
  `);
  await sleep(200);
}

async function ensureDevServer() {
  const ping = await fetch(PAGE).then(r => r.ok).catch(() => false);
  if (!ping) {
    console.error("dev server is not up at " + PAGE);
    process.exit(1);
  }
}

async function launchChrome() {
  const profile = path.join(os.tmpdir(), "ctv-mobile-rem-" + Date.now());
  const chrome = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=" + DEBUG_PORT,
    "--window-size=390,844",
    "--hide-scrollbars",
    "--mute-audio",
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + profile
  ], { stdio: "ignore" });
  await sleep(1200);
  return { chrome, profile };
}

async function stopChrome(chrome, profile) {
  try { chrome.kill(); } catch (e) {}
  await new Promise(resolve => {
    const t = setTimeout(resolve, 2000);
    chrome.once("exit", () => { clearTimeout(t); resolve(); });
  });
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
}

/* ---- intro / boot ---- */
async function introBoot(c) {
  await c.eval(`
    SAVE.set.introPlayed = false;
    introReady = true; introDone = false; introStarted = false; introTapPending = false;
    var stg = document.getElementById("v-intro");
    if (stg) stg.classList.remove("playing","leaving");
    var card = document.getElementById("intro-start");
    if (card) card.removeAttribute("hidden");
    go("intro");
  `);
  await sleep(400);
  await overflow(c, "intro");
  await c.shot("30-intro.png");

  await c.eval("go('boot')");
  await sleep(300);
  await overflow(c, "boot");
  await c.shot("31-boot.png");
}

/* ---- how to play modal ---- */
async function howToPlay(c) {
  await c.eval(`
    go("menu");
    var el = document.getElementById("tutorial");
    if (el) el.classList.add("on");
  `);
  await sleep(250);
  const tutFit = await overlayFit(c, "#tutorial");
  check("how-to-play card on screen", tutFit.ok && !tutFit.clipped, JSON.stringify(tutFit));
  await overflow(c, "how-to-play");
  await c.shot("32-howto.png");
  await c.eval(`document.getElementById("tutorial").classList.remove("on")`);
}

/* ---- onboarding L2–L6 ---- */
async function onboarding(c) {
  await c.eval("startTutorialRun()");
  await waitPlayReady(c);
  await c.shot("33-onboard-L1.png");
  for (let lesson = 2; lesson <= 6; lesson++) {
    await c.eval("tutorialNextQuestion()");
    await waitPlayReady(c);
    const g = await playGeom(c);
    const label = "onboard L" + lesson;
    check(label + " no overflow", g.scrollW <= 390, "w=" + g.scrollW);
    if (g.n === 4) {
      check(label + " answers visible", g.visible === 4, "visible=" + g.visible);
      check(label + " no dock overlap", g.overlap === 0, "lastB=" + g.lastB + " barTop=" + g.barTop);
    }
    if (lesson === 3) check("onboard L3 cloze chips", g.cloze > 0, "cloze=" + g.cloze);
    if (lesson === 5) check("onboard L5 fade-done", g.fade, "fade=" + g.fade);
    if (lesson === 6) check("onboard L6 tiles", g.tiles > 0, "tiles=" + g.tiles);
    await c.shot("33-onboard-L" + lesson + ".png");
  }
  await abandon(c);
}

/* ---- trial act card then in-play ---- */
async function trialPlay(c) {
  await c.eval("startRun('trial','watchman')");
  await sleep(500);
  await overflow(c, "trial act");
  await c.shot("34-trial-act.png");
  await sleep(3200);
  await waitPlayReady(c);
  const trialG = await playGeom(c);
  if (trialG.n === 4) {
    check("trial play answers visible", trialG.visible === 4, "visible=" + trialG.visible);
    check("trial play no dock overlap", trialG.overlap === 0, "lastB=" + trialG.lastB + " barTop=" + trialG.barTop);
  }
  await overflow(c, "trial play");
  await c.shot("35-trial-play.png");
}

/* ---- pause ---- */
async function pauseOverlay(c) {
  await abandon(c);
  await c.eval("startRun('practice','watchman')");
  await waitPlayReady(c);
  await c.eval(`
    R.running = true;
    if (typeof setPaused === "function") setPaused(true);
  `);
  await sleep(250);
  const pauseFit = await overlayFit(c, "#pause");
  check("pause overlay on screen", pauseFit.ok && pauseFit.on && !pauseFit.clipped, JSON.stringify(pauseFit));
  await overflow(c, "pause");
  await c.shot("36-pause.png");
  await c.eval("if (typeof setPaused === 'function') setPaused(false)");
}

/* ---- game over ---- */
async function gameOver(c) {
  await c.eval(`
    if (typeof showState === "function") showState("fallen");
  `);
  await sleep(250);
  const fallen = await overlayFit(c, "#state-panel");
  check("fallen overlay on screen", fallen.ok && fallen.on && !fallen.clipped, JSON.stringify(fallen));
  await overflow(c, "fallen");
  await c.shot("37-fallen.png");
  await c.eval("if (typeof hideState === 'function') hideState()");
}

/* ---- overdrive ---- */
async function overdriveChoice(c) {
  await c.eval(`
    R.ended = false;
    R.overdriveOffered = false;
    if (typeof offerOverdriveChoice === "function") offerOverdriveChoice();
    else document.getElementById("overdrive-choice").classList.add("on");
  `);
  await sleep(300);
  const od = await overlayFit(c, "#overdrive-choice");
  check("overdrive overlay on screen", od.ok && od.on && !od.clipped, JSON.stringify(od));
  await overflow(c, "overdrive");
  await c.shot("38-overdrive.png");
  await c.eval(`
    var el = document.getElementById("overdrive-choice");
    if (el) el.classList.remove("on");
    document.body.classList.remove("od-open");
    clearTimeout(R._odTimer);
  `);
}

/* ---- setpiece card ---- */
async function setpieceCard(c) {
  await abandon(c);
  await c.eval("startRun('trial','watchman')");
  await sleep(3600);
  await waitPlayReady(c);
  await c.eval(`
    R.actIdx = 0; R.qInAct = 3; R.setpiece = null;
    R.setpieceDone = new Set();
    SetPieces.maybeLaunch();
  `);
  await sleep(400);
  const sp = await overlayFit(c, "#setpiece-card");
  check("setpiece overlay on screen", sp.ok && sp.on && !sp.clipped, JSON.stringify(sp));
  await overflow(c, "setpiece");
  await c.shot("39-setpiece.png");
  await c.eval(`document.getElementById("setpiece-card").classList.remove("on")`);
  await abandon(c);
}

/* ---- site quote ---- */
async function siteQuote(c) {
  await c.eval(`
    startRun("practice","watchman");
  `);
  await waitPlayReady(c);
  await c.eval(`
    var site = (typeof Pilgrimage !== "undefined" && Pilgrimage.site) ? Pilgrimage.site("ur") : {name:"Ur", quote:"Get thee out of thy country.", quoteRef:"Genesis 12:1"};
    if (typeof showSiteQuote === "function") showSiteQuote(site, function(){});
    else document.getElementById("site-quote").classList.add("on");
  `);
  await sleep(400);
  await overflow(c, "site-quote");
  await c.shot("40-site-quote.png");
  await c.eval(`
    var sq = document.getElementById("site-quote");
    if (sq) { sq.classList.remove("on"); if (sq._timer) clearInterval(sq._timer); }
  `);
  await abandon(c);
}

/* ---- atlas dossier + vignette ---- */
async function atlasVignette(c) {
  await c.eval(`
    if (typeof Atlas !== "undefined" && Atlas.seenColdOpen) Atlas.seenColdOpen(true);
    go("atlas");
  `);
  await sleep(400);
  await c.eval(`
    var o = document.getElementById("atlas-open");
    if (o) { o.click(); o.classList.add("gone"); }
    if (typeof Atlas !== "undefined" && Atlas.select) Atlas.select("ur");
  `);
  await sleep(700);
  await overflow(c, "atlas dossier");
  await c.shot("41-atlas-dossier.png");
  await c.eval(`if (typeof Atlas !== "undefined" && Atlas.openVignette) Atlas.openVignette("ur")`);
  await sleep(500);
  const jv = await overlayFit(c, "#journey-vignette-modal");
  check("journey vignette on screen", jv.ok && !jv.clipped, JSON.stringify(jv));
  await overflow(c, "journey vignette");
  await c.shot("42-journey-vignette.png");
  await c.eval(`if (typeof Atlas !== "undefined" && Atlas.closeVignette) Atlas.closeVignette()`);
}

/* ---- tablets pause / trial / shatter / chapters ---- */
async function tabletsScreens(c) {
  await abandon(c);
  await c.eval(`
    SAVE.set.tabletsTutorialDone = true; persist();
    startRun("tablets","watchman",{tabletChapter:"psalm23"});
  `);
  await sleep(900);
  await c.eval("if (typeof setTabletsPaused === 'function') setTabletsPaused(true)");
  await sleep(250);
  const tp = await overlayFit(c, "#tablets-pause");
  check("tablets pause on screen", tp.ok && tp.on && !tp.clipped, JSON.stringify(tp));
  await overflow(c, "tablets pause");
  await c.shot("43-tablets-pause.png");
  await c.eval("if (typeof setTabletsPaused === 'function') setTabletsPaused(false)");
  await c.eval("if (typeof tabletsApplyTrial === 'function') tabletsApplyTrial(true)");
  await sleep(250);
  await overflow(c, "tablets trial");
  await c.shot("44-tablets-trial.png");
  await c.eval(`
    var s = document.querySelector(".tablets-stone");
    if (s) s.classList.add("shatter");
  `);
  await sleep(200);
  await c.shot("45-tablets-shatter.png");

  await abandon(c);
  await c.eval(`
    SAVE.tablets = SAVE.tablets || {};
    SAVE.tablets.psalm23 = {best:100, held:true};
    persist();
    startRun("tablets","watchman",{tabletChapter:"psalm91"});
  `);
  await sleep(900);
  await overflow(c, "tablets psalm91");
  await c.shot("46-tablets-psalm91.png");

  await abandon(c);
  await c.eval(`
    SAVE.tablets.psalm23 = {best:100, held:true};
    SAVE.tablets.psalm91 = {best:100, held:true};
    persist();
    startRun("tablets","watchman",{tabletChapter:"john1"});
  `);
  await sleep(900);
  await overflow(c, "tablets john1");
  await c.shot("47-tablets-john1.png");

  await abandon(c);
  await c.eval(`
    SAVE.tablets.psalm23 = {best:100, held:true};
    SAVE.tablets.psalm91 = {best:100, held:true};
    SAVE.tablets.john1 = {best:100, held:true};
    persist();
    startRun("tablets","watchman",{tabletChapter:"genesis2"});
  `);
  await sleep(900);
  await overflow(c, "tablets hall");
  await c.shot("48-tablets-hall.png");
  await abandon(c);
}

/* ---- relics with data + inspect + reveal ---- */
async function relicScreens(c) {
  await c.eval(`
    var pack = Artifacts.unlockForSite(SAVE.artifacts, "ur", Date.now());
    SAVE.artifacts = pack.store;
    persist();
    go("relics");
    if (typeof renderRelics === "function") renderRelics();
  `);
  await sleep(400);
  await overflow(c, "relics filled");
  await c.shot("49-relics-filled.png");
  await c.eval(`
    var a = Artifacts.forSite("ur") || Artifacts.byId("ziggurat-ur");
    if (a && typeof openRelicInspect === "function") openRelicInspect(a);
  `);
  await sleep(400);
  const insp = await overlayFit(c, "#relic-inspect-modal");
  check("relic inspect on screen", insp.ok && !insp.clipped, JSON.stringify(insp));
  const doneBtn = await c.eval(`(() => {
    const b = document.getElementById("inspect-done");
    if (!b) return { ok: false };
    const r = b.getBoundingClientRect();
    return { ok: true, t: Math.round(r.top), b: Math.round(r.bottom), inView: r.top >= 0 && r.bottom <= 846 };
  })()`);
  check("relic inspect close button in view", doneBtn.inView, JSON.stringify(doneBtn));
  await overflow(c, "relic inspect");
  await c.shot("50-relic-inspect.png");
  await c.eval(`
    var m = document.getElementById("relic-inspect-modal");
    if (m) { m.classList.remove("on"); m.setAttribute("hidden",""); }
  `);
  await c.eval(`
    var a = Artifacts.forSite("ur") || Artifacts.byId("ziggurat-ur");
    if (a && typeof showArtifactReveal === "function") showArtifactReveal(a, function(){});
  `);
  await sleep(700);
  const rev = await overlayFit(c, "#reveal-stage");
  check("artifact reveal on screen", rev.ok && rev.on && !rev.clipped, JSON.stringify(rev));
  await overflow(c, "artifact reveal");
  await c.shot("51-artifact-reveal.png");
  await c.eval(`
    var el = document.getElementById("reveal-stage");
    if (el) el.classList.remove("on","play");
  `);
}

/* ---- seals + records with data ---- */
async function sealsRecords(c) {
  await c.eval(`
    ["watch","life500","daily7"].forEach(function(id){
      if (typeof grantSeal === "function") grantSeal(id);
      else if (SAVE.seals.indexOf(id) < 0) SAVE.seals.push(id);
    });
    persist();
    go("seals");
    if (typeof renderSeals === "function") renderSeals();
  `);
  await sleep(350);
  await overflow(c, "seals filled");
  await c.shot("52-seals-filled.png");

  await c.eval(`
    SAVE.life = SAVE.life || {};
    SAVE.life.best = Math.max(SAVE.life.best || 0, 12400);
    SAVE.life.correct = Math.max(SAVE.life.correct || 0, 88);
    SAVE.runs = Math.max(SAVE.runs || 0, 12);
    persist();
    go("records");
    if (typeof renderRecords === "function") renderRecords();
  `);
  await sleep(350);
  await overflow(c, "records filled");
  await c.shot("53-records-filled.png");
}

/* ---- settings scrolled to erase ---- */
async function settingsBottom(c) {
  await c.eval("go('settings')");
  await sleep(350);
  await c.eval(`
    var p = document.getElementById("settings-body");
    if (p) p.scrollTop = p.scrollHeight;
  `);
  await sleep(250);
  await overflow(c, "settings bottom");
  await c.shot("54-settings-bottom.png");
}

/* ---- Listen & Rebuild on journal ---- */
async function studyListen(c) {
  await c.eval(`
    var v = VERSES[0];
    SAVE.srs = SAVE.srs || {};
    SAVE.srs[v.id] = { reps: 3, due: today() - 1, last: today() - 2, ef: 2.5, ivl: 4, lapses: 0 };
    persist();
    go("study");
    if (typeof renderStudy === "function") renderStudy();
    var fil = document.getElementById("study-filter");
    if (fil) { fil.value = "due"; fil.dispatchEvent(new Event("change")); }
  `);
  await sleep(400);
  await overflow(c, "study listen");
  await c.shot("55-study-listen.png");
  await c.eval(`
    var v = VERSES[0];
    startRun("recall", SAVE.set.diff, { queue: [v], forcedVerse: v });
  `);
  await waitPlayReady(c);
  const rec = await playGeom(c);
  check("listen-rebuild tiles on screen", rec.tiles > 0, "tiles=" + rec.tiles);
  await overflow(c, "listen rebuild");
  await c.shot("56-listen-rebuild.png");
  await abandon(c);
}

/* ---- Valley incoming toast ---- */
async function valleyToast(c) {
  await c.eval(`
    go("menu");
    var b = document.querySelector('.mode.incoming, [data-mode="beat"]');
    if (b) b.click();
  `);
  await sleep(400);
  await overflow(c, "valley toast");
  await c.shot("57-valley-toast.png");
}

async function main() {
  await ensureDevServer();
  const { chrome, profile } = await launchChrome();

  let c;
  try {
    c = await connect();
    await skipChrome(c);
    await introBoot(c);
    await howToPlay(c);
    await onboarding(c);
    await trialPlay(c);
    await pauseOverlay(c);
    await gameOver(c);
    await overdriveChoice(c);
    await setpieceCard(c);
    await siteQuote(c);
    await atlasVignette(c);
    await tabletsScreens(c);
    await relicScreens(c);
    await sealsRecords(c);
    await settingsBottom(c);
    await studyListen(c);
    await valleyToast(c);
  } finally {
    if (c) c.close();
    await stopChrome(chrome, profile);
  }

  console.log("\nscreenshots: " + SHOT);
  if (fails.length) {
    console.error("\nFAIL ×" + fails.length + "\n  " + fails.join("\n  "));
    process.exit(1);
  }
  console.log("PASS — remaining screens 390×844");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
