const { spawn } = require('child_process');
const tmpProfile = require('os').tmpdir() + '/chrome-debug-' + Date.now();
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--remote-debugging-port=9222', '--user-data-dir=' + tmpProfile
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/new?http://localhost:8781', { method: 'PUT' });
    const tab = await res.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = async () => {
      let id = 1;
      const send = (m, p={}) => new Promise(r => {
        const i = id++;
        const h = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === i) { ws.removeEventListener('message', h); r(d.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: i, method: m, params: p }));
      });
      await send('Runtime.enable');
      await send('Page.enable');
      await new Promise(r => setTimeout(r, 1200));

      await send('Runtime.evaluate', { expression: 'SAVE.pilgrim = Pilgrimage.blankProgress(); SAVE.runs = 0; startRun("pilgrimage", "watchman"); hideSiteQuote(); renderQuestion(R.q, 14000);' });
      for (let i = 0; i < 8; i++) {
        const evalRes = await send('Runtime.evaluate', {
          expression: 'JSON.stringify({ vi: R.siteIdx - 1, qRef: R.q ? R.q.r : null, typed: R.typed, mechanic: R.currentMechanic })',
          returnByValue: true
        });
        console.log('Verse ' + (i + 1) + ':', evalRes.result.value);
        
        if (i < 7) {
          await send('Runtime.evaluate', { expression: 'nextQuestion();' });
          await new Promise(r => setTimeout(r, 100));
        }
      }
      chrome.kill();
    };
  } catch(e) { console.error(e); chrome.kill(); }
}, 1500);
