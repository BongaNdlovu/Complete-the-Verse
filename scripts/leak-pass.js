const { spawn } = require("child_process");
const os = require("os");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9336;
const DURATION_MS = Math.max(60000, parseInt(process.env.LEAK_MS || String(30 * 60 * 1000), 10) || 30 * 60 * 1000);
const SAMPLE_MS = Math.min(120000, Math.max(15000, Math.floor(DURATION_MS / 15)));

let nextId = 1;
class CDP {
  constructor(url) { this.url = url; this.cb = new Map(); }
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
  close() { if (this.ws) this.ws.close(); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function heapUsed(c) {
  try { await c.send("HeapProfiler.collectGarbage"); } catch (e) {}
  try {
    const usage = await c.send("Runtime.getHeapUsage");
    if (usage && usage.usedSize) return usage.usedSize;
  } catch (e) {}
  const metrics = await c.send("Performance.getMetrics");
  const row = (metrics.metrics || []).find((m) => m.name === "JSHeapUsedSize");
  return row ? row.value : 0;
}

(async () => {
  const profile = path.join(os.tmpdir(), "ctv-leak-" + Date.now());
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--window-size=1280,800",
    "--hide-scrollbars", "--mute-audio", "--no-first-run", `--user-data-dir=${profile}`
  ]);
  await sleep(1800);
  const tab = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:8781`, { method: "PUT" }).then((r) => r.json());
  const c = new CDP(tab.webSocketDebuggerUrl);
  await c.connect();
  await c.send("Page.enable");
  await c.send("Runtime.enable");
  await c.send("Performance.enable");
  for (let i = 0; i < 25; i++) {
    try { if (await c.eval("Boolean(window.SAVE && window.go)")) break; } catch (e) {}
    await sleep(400);
  }
  await c.eval("localStorage.clear(); location.reload(true)");
  await sleep(2000);
  const views = ["menu", "atlas", "settings", "records", "study", "seals", "relics"];
  const samples = [];
  const started = Date.now();
  let n = 0;
  while (Date.now() - started < DURATION_MS) {
    const view = views[n % views.length];
    await c.eval("go(" + JSON.stringify(view) + ")");
    n++;
    if (n % 8 === 0) samples.push(await heapUsed(c));
    await sleep(Math.min(SAMPLE_MS, 2500));
  }
  samples.push(await heapUsed(c));
  c.close();
  chrome.kill();
  const early = samples.slice(0, Math.max(1, Math.floor(samples.length / 3)));
  const late = samples.slice(-Math.max(1, Math.floor(samples.length / 3)));
  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const a = avg(early);
  const b = avg(late);
  const ratio = a ? b / a : 1;
  console.log("leak-pass duration_ms=" + DURATION_MS + " samples=" + samples.length + " early=" + Math.round(a) + " late=" + Math.round(b) + " ratio=" + ratio.toFixed(2));
  if (ratio > 2.5 && b - a > 20 * 1024 * 1024) {
    console.error("FAIL heap grew " + ratio.toFixed(2) + "x");
    process.exit(1);
  }
  console.log("PASS leak-pass");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
