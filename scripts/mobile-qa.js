#!/usr/bin/env node
/* 390×844 geometry pass against the local dev server.
   Requires: node scripts/dev-server.js  (http://localhost:8781)
   Run:      node scripts/mobile-qa.js
*/
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ROOT = require("./repo-root");

const CHROME = process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PAGE = "http://localhost:8781";
const DEBUG_PORT = 9333;
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
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
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
      this.ws.send(JSON.stringify({ id, method, params }));
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
  }
  close() { if (this.ws) this.ws.close(); }
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
      return { t: r.top, b: r.bottom, l: r.left, r: r.right };
    });
    const overlap = br ? rects.filter(a =>
      a.b > br.top + 2 && a.t < br.bottom - 2 && a.r > br.left + 2 && a.l < br.right - 2).length : 0;
    const visible = rects.filter(a => a.t >= pr.top - 2 && a.b <= pr.bottom + 2).length;
    const aboveBar = !br || rects.every(a => a.b <= br.top + 4);
    return {
      ok: true, n: rects.length, overlap, visible, aboveBar,
      barTop: br ? Math.round(br.top) : null,
      lastB: rects.length ? Math.round(rects[rects.length - 1].b) : null,
      scrollW: document.documentElement.scrollWidth,
      view: document.body.className
    };
  })()`);
}

async function main() {
  const ping = await fetch(PAGE).then(r => r.ok).catch(() => false);
  if (!ping) {
    console.error("dev server is not up at " + PAGE);
    process.exit(1);
  }
  const profile = path.join(os.tmpdir(), "ctv-mobile-qa-" + Date.now());
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

  let c;
  try {
    c = await connect();
    await skipChrome(c);

    async function overflow(label) {
      const w = await c.eval("document.documentElement.scrollWidth");
      check(label + " scrollWidth <= 390", w <= 390, "w=" + w);
      return w;
    }
    async function goShot(view, file, label) {
      await c.eval("go(" + JSON.stringify(view) + ")");
      await sleep(350);
      await overflow(label || view);
      await c.shot(file);
    }

    await c.eval("go('menu')");
    await sleep(300);
    await overflow("hub");
    await c.shot("01-hub.png");
    await c.eval(`(function(){ var p=document.querySelector("#v-menu .scrollpad"); if(p) p.scrollTop=p.scrollHeight; })()`);
    await sleep(200);
    await c.shot("01b-hub-bottom.png");

    await c.eval(`(function(){ var b=document.getElementById("menu-signin"); if(b){ b.hidden=false; b.click(); } })()`);
    await sleep(250);
    await c.shot("01c-signin.png");

    await goShot("brief", "21-brief.png", "brief");
    await c.eval("openBrief('daily')");
    await sleep(300);
    await overflow("daily brief");
    await c.shot("21b-brief-daily.png");
    await c.eval("openBrief('tablets')");
    await sleep(350);
    await overflow("tablets brief");
    await c.shot("21c-brief-tablets.png");
    await c.eval("openBrief('team')");
    await sleep(300);
    await c.shot("21d-brief-team.png");

    await goShot("relics", "22-relics.png", "relics");
    await goShot("seals", "23-seals.png", "seals");
    await goShot("records", "24-records.png", "records");
    await goShot("settings", "25-settings.png", "settings");
    await c.eval(`(function(){ var p=document.querySelector("#v-settings .scrollpad"); if(p) p.scrollTop=p.scrollHeight; })()`);
    await sleep(200);
    await c.shot("25b-settings-bottom.png");

    await c.eval(`(function(){ if (typeof openProfileSetup==="function") openProfileSetup(true); else { var el=document.getElementById("character-pick"); if(el) el.classList.add("on"); } })()`);
    await sleep(300);
    await overflow("scholar picker");
    await c.shot("26-scholar.png");
    await c.eval(`(function(){ var el=document.getElementById("character-pick"); if(el) el.classList.remove("on"); })()`);

    await c.eval("openSiteBrief('ur','pilgrimage')");
    await sleep(400);
    await overflow("site brief");
    await c.shot("27-sitebrief.png");

    await c.eval("go('atlas'); var o=document.getElementById('atlas-open'); if(o) o.classList.add('gone'); if (typeof Atlas!=='undefined' && Atlas.select) Atlas.select('ur');");
    await sleep(500);
    await overflow("atlas map");
    await c.shot("28-atlas-dossier.png");

    await c.eval("go('menu')");
    await sleep(200);

    await c.eval("go('study')");
    await sleep(300);
    const study = await c.eval(`({
      w: document.documentElement.scrollWidth,
      cols: getComputedStyle(document.querySelector(".heatgrid") || document.body).gridTemplateColumns
    })`);
    check("Study Hall scrollWidth <= 390", study.w <= 390, "w=" + study.w);
    check("Study Hall is 6 columns", (study.cols || "").split(" ").filter(Boolean).length === 6, study.cols);
    await c.shot("02-study.png");

    const modes = [
      ["practice", "03-drill.png"],
      ["daily", "04-daily.png"],
      ["blitz", "05-blitz.png"],
      ["trial", "06-trial.png"],
      ["endless", "07-gauntlet.png"],
      ["recall", "08-recall.png"],
      ["team", "09-team.png"]
    ];
    for (const [mode, shot] of modes) {
      await c.eval("if (typeof endRun === 'function') try { endRun('abandon'); } catch (e) {}");
      await sleep(200);
      if (mode === "team") {
        await c.eval("startRun('team','watchman',{ teamSide: 'white' })");
      } else {
        await c.eval("startRun('" + mode + "','watchman')");
      }
      await sleep(450);
      await c.eval("if (typeof hideSiteQuote === 'function') hideSiteQuote()");
      for (let i = 0; i < 12; i++) {
        const ready = await c.eval(`(() => {
          const wrap = document.querySelector(".answers.typed .typewrap");
          if (wrap) return getComputedStyle(wrap).opacity !== "0";
          const a = document.querySelector("#opts .ans");
          if (!a) return false;
          return getComputedStyle(a).opacity !== "0";
        })()`);
        if (ready) break;
        await sleep(200);
      }
      const g = await playGeom(c);
      const label = mode;
      check(label + ": four answers (or assemble)", g.n === 4 || g.n === 0, "n=" + g.n);
      if (g.n === 4) {
        check(label + ": answers visible", g.visible === 4, "visible=" + g.visible + " lastB=" + g.lastB);
        check(label + ": no overlap with dock", g.overlap === 0, "overlap=" + g.overlap + " lastB=" + g.lastB + " barTop=" + g.barTop);
        check(label + ": answers above dock", g.aboveBar, "lastB=" + g.lastB + " barTop=" + g.barTop);
      }
      check(label + ": no horizontal overflow", g.scrollW <= 390, "w=" + g.scrollW);
      if (mode === "recall") {
        const bank = await c.eval(`(() => {
          const play = document.getElementById("v-play").getBoundingClientRect();
          const tiles = [...document.querySelectorAll(".asm-tile")];
          const vis = tiles.filter(t => {
            const r = t.getBoundingClientRect();
            const o = getComputedStyle(t).opacity;
            return r.width > 8 && r.height > 8 && r.top >= play.top - 2 && r.bottom <= play.bottom + 2 && o !== "0";
          }).length;
          return { n: tiles.length, vis };
        })()`);
        check("recall: word tiles on screen", bank.vis > 0, "vis=" + bank.vis + " n=" + bank.n);
      }
      await c.shot(shot);
    }

    await c.eval("pendingSiteId='ur'; startRun('pilgrimage','watchman'); if (typeof hideSiteQuote==='function') hideSiteQuote();");
    await sleep(1600);
    const pil = await playGeom(c);
    if (pil.n === 4) {
      check("pilgrimage: answers visible", pil.visible === 4, "visible=" + pil.visible);
      check("pilgrimage: no overlap with dock", pil.overlap === 0, "lastB=" + pil.lastB + " barTop=" + pil.barTop);
    }
    await c.shot("10-pilgrimage-play.png");

    await c.eval("endRun('abandon'); go('results')");
    await sleep(400);
    const resW = await c.eval("document.documentElement.scrollWidth");
    check("results scrollWidth <= 390", resW <= 390, "w=" + resW);
    await c.shot("11-results.png");

    await c.eval("go('atlas')");
    await sleep(500);
    await c.shot("12-atlas.png");

    await c.eval("if (typeof endRun === 'function') try { endRun('abandon'); } catch (e) {}");
    await sleep(200);
    await c.eval("SAVE.set.tabletsTutorialDone = true; persist(); startRun('tablets','watchman',{tabletChapter:'psalm23'})");
    await sleep(900);
    const tab = await c.eval(`(() => {
      const r = el => el && el.getBoundingClientRect();
      const top = r(document.querySelector(".tablets-top"));
      const stage = r(document.querySelector(".tablets-stage"));
      const tray = r(document.querySelector(".tablets-tray"));
      const foot = r(document.querySelector(".tablets-foot"));
      const ms = r(document.querySelector(".tablets-ms"));
      const stones = [...document.querySelectorAll(".tablets-stone")].map(s => {
        const b = s.getBoundingClientRect();
        return { t: Math.round(b.top), b: Math.round(b.bottom), h: Math.round(b.height) };
      });
      return {
        topH: top && Math.round(top.height),
        stageH: stage && Math.round(stage.height),
        trayH: tray && Math.round(tray.height),
        footH: foot && Math.round(foot.height),
        msH: ms && Math.round(ms.height),
        stones: stones.length,
        stoneH: stones[0] && stones[0].h,
        lastStoneB: stones.length ? stones[stones.length-1].b : null,
        trayTop: tray && Math.round(tray.top),
        scrollW: document.documentElement.scrollWidth
      };
    })()`);
    console.log("  tablets geom", JSON.stringify(tab));
    check("tablets: four stones", tab.stones === 4, "n=" + tab.stones);
    check("tablets: no horizontal overflow", tab.scrollW <= 390, "w=" + tab.scrollW);
    check("tablets: stones visible", tab.stones === 4 && tab.lastStoneB <= 846, "lastB=" + tab.lastStoneB);
    await c.shot("20-tablets.png");

    await c.eval("startTutorialRun()");
    await sleep(1600);
    const tut = await playGeom(c);
    if (tut.n === 4) {
      check("onboarding L1: answers visible", tut.visible === 4, "visible=" + tut.visible);
      check("onboarding L1: no overlap", tut.overlap === 0, "lastB=" + tut.lastB + " barTop=" + tut.barTop);
    }
    await c.shot("13-onboarding.png");
  } finally {
    if (c) c.close();
    chrome.kill();
  }

  console.log("\nscreenshots: " + SHOT);
  if (fails.length) {
    console.error("\nFAIL ×" + fails.length + "\n  " + fails.join("\n  "));
    process.exit(1);
  }
  console.log("PASS — mobile 390×844 geometry");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
