const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 8085;
const CDP_PORT = 9222;
const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath.replace(/^\//, ''));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Static server running at http://127.0.0.1:${PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-test-'));

  console.log('Launching headless Chrome...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-gpu',
    '--mute-audio',
    'about:blank'
  ]);

  let cdpWsUrl = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const tabs = await res.json();
      const pageTab = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTab) {
        cdpWsUrl = pageTab.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!cdpWsUrl) {
    chromeProc.kill();
    server.close();
    throw new Error('Failed to find page tab in Chrome DevTools Protocol');
  }

  console.log('Connected to Chrome page tab via CDP:', cdpWsUrl);
  const ws = new WebSocket(cdpWsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let idCounter = 1;
  const callbacks = new Map();
  let loadFired = false;

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Page.loadEventFired') {
      loadFired = true;
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args || []).map(a => (a.value !== undefined ? a.value : a.description)).join(' ');
      console.log(`  [Browser Console]`, text);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error(`  [Browser Exception]`, msg.params.exceptionDetails);
    }
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) cb.reject(new Error(msg.error.message));
      else cb.resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expr) {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error('Eval error: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log(`Navigating to http://127.0.0.1:${PORT}/index.html ...`);
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });

    for (let i = 0; i < 40 && !loadFired; i++) {
      await sleep(200);
    }
    console.log('Page loaded successfully.');

    // Allow signed-in or guest session so player is not blocked at the signin door
    await evaluate('if(typeof Cloud !== "undefined") Cloud.isSignedIn = function() { return true; };');
    await sleep(500);

    let view = await evaluate('currentView');
    console.log('Current view upon landing:', view);
    if (view === 'intro') {
      console.log('Intro is active. Skipping intro to trigger boot sequence...');
      await evaluate('finishIntro(true);');
    }

    console.log('Waiting for boot sequence to complete and redirect to edition picker...');
    for (let i = 0; i < 40; i++) {
      await sleep(300);
      view = await evaluate('typeof currentView !== "undefined" ? currentView : null');
      if (view === 'edition') break;
    }

    console.log('\n--- 1. Verification of First-Run Edition Picker ---');
    console.log('Current view after boot:', view);
    const editionModalVisible = await evaluate('document.getElementById("v-edition") && document.getElementById("v-edition").classList.contains("active")');
    console.log('#v-edition active status:', editionModalVisible);

    if (view !== 'edition' && !editionModalVisible) {
      throw new Error(`Expected edition view, got currentView=${view}, active=${editionModalVisible}`);
    }

    const nkjvBtnText = await evaluate('document.getElementById("edition-btn-nkjv").innerText');
    console.log('NKJV button text in live DOM:\n  ' + nkjvBtnText.replace(/\n/g, ' '));

    console.log('\n--- 2. Click NKJV in Live Browser & Enter Tutorial ---');
    await evaluate('document.getElementById("edition-btn-nkjv").click();');
    await sleep(1000);

    const postPickView = await evaluate('currentView');
    const chosenTranslation = await evaluate('SAVE.set.translation');
    const isChosen = await evaluate('SAVE.set.translationChosen');
    console.log('View after picking NKJV:', postPickView);
    console.log('SAVE.set.translation:', chosenTranslation);
    console.log('SAVE.set.translationChosen:', isChosen);

    if (chosenTranslation !== 'nkjv' || !isChosen) {
      throw new Error('Edition selection was not recorded in SAVE state');
    }

    const tag = await evaluate('translationTag()');
    console.log('Live translationTag():', tag);
    if (tag !== 'NKJV') throw new Error(`Expected NKJV tag, got ${tag}`);

    console.log('\n--- 3. Check Tutorial Screen Live NKJV Wording ---');
    const lesson1A = await evaluate('TUTORIAL_QUESTIONS[0].a');
    console.log('Tutorial lesson 1 answer:', lesson1A);
    if (lesson1A !== 'shall not want') throw new Error(`Expected "shall not want", got ${lesson1A}`);

    console.log('\n--- 4. Live Pilgrimage Verse Test with NKJV Text & Options ---');
    await evaluate(`
      (async () => {
        holdForSignIn = function() { return false; };
        await Defer.forRun("pilgrimage");
        startRun("pilgrimage", "disciple");
      })()
    `);
    await sleep(500);

    const pilgrimRef = await evaluate('R.siteVerses[0].r');
    const pilgrimA = await evaluate('R.siteVerses[0].a');
    const pilgrimD = await evaluate('R.siteVerses[0].d');
    const pilgrimId = await evaluate('R.siteVerses[0].id');

    console.log('First Pilgrimage verse ref:', pilgrimRef);
    console.log('First Pilgrimage verse answer:', pilgrimA);
    console.log('First Pilgrimage verse distractors:', pilgrimD);
    console.log('First Pilgrimage verse id:', pilgrimId);

    if (!pilgrimId.startsWith('nkjv~')) throw new Error('Pilgrimage verse id does not have nkjv~ prefix');

    console.log('\n--- 5. Settings Switch to KJV & Isolation Test ---');
    // Set some progress and a hold
    await evaluate(`
      SAVE.pilgrim.sites["ur"] = { cleared: true };
      SAVE.tablets["nkjv~psalm23"] = { best: 92, held: true };
      SAVE.dailyByEdition.nkjv = { date: "2026-09-28", score: 1750 };
      persist();
      Edition.activateEdition("kjv");
    `);

    const kjvCleared = await evaluate('SAVE.pilgrim.sites["ur"].cleared');
    const kjvHold = await evaluate('Tablets.recordOf(SAVE, "psalm23").held');
    const kjvDailyDate = await evaluate('SAVE.daily.date');

    console.log('KJV Site Ur cleared (shared):', kjvCleared);
    console.log('KJV Psalm 23 held (isolated):', kjvHold);
    console.log('KJV Daily date (isolated):', kjvDailyDate);

    if (!kjvCleared) throw new Error('Shared site progress was lost');
    if (kjvHold) throw new Error('NKJV hold leaked into KJV');
    if (kjvDailyDate !== '') throw new Error('NKJV daily date leaked into KJV');

    console.log('\n--- 6. Switch back to NKJV & State Recovery Test ---');
    await evaluate('Edition.activateEdition("nkjv");');

    const nkjvHold = await evaluate('Tablets.recordOf(SAVE, "psalm23").held');
    const nkjvDailyScore = await evaluate('SAVE.daily.score');

    console.log('NKJV Psalm 23 held recovered:', nkjvHold);
    console.log('NKJV Daily score recovered:', nkjvDailyScore);

    if (!nkjvHold) throw new Error('NKJV hold was lost');
    if (nkjvDailyScore !== 1750) throw new Error('NKJV daily score was lost');

    console.log('\n--- 7. Viewport & Responsive Layout Verification ---');
    const artifactsDir = path.join(ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

    // Desktop screenshot of Edition Picker
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await evaluate('go("edition");');
    await sleep(400);
    const snapDesk = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'screenshot-edition-desktop.png'), Buffer.from(snapDesk.data, 'base64'));
    console.log('Saved screenshot: artifacts/screenshot-edition-desktop.png');

    // Mobile screenshot of Edition Picker (375x812)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(400);
    const snapMob = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'screenshot-edition-mobile.png'), Buffer.from(snapMob.data, 'base64'));
    console.log('Saved screenshot: artifacts/screenshot-edition-mobile.png');

    const isPickerRenderedMobile = await evaluate(`
      const el = document.getElementById("v-edition");
      const rect = el.getBoundingClientRect();
      rect.width > 0 && rect.height > 0
    `);
    console.log('Edition picker rendered cleanly on mobile viewport:', isPickerRenderedMobile);
    if (!isPickerRenderedMobile) throw new Error('Edition picker not visible on mobile');

    // Live play screen screenshot
    await evaluate('startRun("pilgrimage", "disciple");');
    await sleep(600);
    const snapPlay = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'screenshot-play-nkjv.png'), Buffer.from(snapPlay.data, 'base64'));
    console.log('Saved screenshot: artifacts/screenshot-play-nkjv.png');

    console.log('\n======================================================');
    console.log('LIVE HEADLESS CHROME TEST COMPLETED WITH 100% SUCCESS!');
    console.log('======================================================');
  } finally {
    try { ws.close(); } catch (e) {}
    try { chromeProc.kill(); } catch (e) {}
    try { server.close(); } catch (e) {}
    await sleep(1000);
    try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (e) {}
  }
}

run().catch(err => {
  console.error('\nLIVE TEST FAILED:', err);
  process.exit(1);
});
