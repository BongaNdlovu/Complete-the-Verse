const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const vm = require("vm");
const ROOT = require("./repo-root");
const { makeSandbox } = require("./test-shim");
const { ENGINE_FILES } = require("./engine-source");

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/verses-more.js", "js/verses-ascent.js",
  "js/verses-tf.js", "js/beat.js", "js/tablets.js", "js/tablets-canon.js", "js/tablets-hall.js", "js/tablets-more.js",
  "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js", "js/flow.js",
  "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/characters.js", "js/artifacts.js", "js/live.js", "js/atlas.js"
];
const BUNDLE = PREFIX.concat(ENGINE_FILES, ["js/tablets-run.js"]);
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS  " + name); }
  else {
    fail++;
    const msg = name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "");
    fails.push(msg);
    console.log("  FAIL  " + msg);
  }
}
function eq(name, got, want) { ok(name, got === want, { got: got, want: want }); }

function boot(preload) {
  const sb = makeSandbox();
  if (preload) Object.keys(preload).forEach(k => sb.localStorage.setItem(k, JSON.stringify(preload[k])));
  vm.runInContext(BUNDLE.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n"), sb, { filename: "bundle.js" });
  return sb;
}
function read(sb, expr) { return vm.runInContext(expr, sb); }
function exec(sb, code) { return vm.runInContext(code, sb); }

function smash(sb, n) {
  let answered = 0;
  for (let i = 0; i < n; i++) {
    if (read(sb, "R.ended || !R.q")) break;
    exec(sb, `(function(){
      var q=R.q; if(!q) return;
      var choice = R.typed
        ? ((typeof assemblyTargetFor==="function" && assemblyTargetFor(q)) || q.a)
        : q.a;
      if(choice==null) return;
      resolveAnswer(q, choice, $("btn-opt-0"), 280, 4000);
      if(!R.ended && currentView==="play") nextQuestion();
    })()`);
    answered++;
  }
  return answered;
}

function profile(sb, scholar, name) {
  exec(sb, `commitProfile(${JSON.stringify(name)}, ${JSON.stringify(scholar)}); syncTravelerToken();`);
}

console.log("STRESS PLAN");
console.log("  1 mode-thrash         start/end every playable mode in a tight loop");
console.log("  2 answer-storm        120 correct answers through live questions");
console.log("  3 end-reasons         death / abandon / complete on several modes");
console.log("  4 road-companions     every site: companion is the SITE figure, not the scholar");
console.log("  5 scholar-walkers     all 8 scholars bind idle+walk files; figures never walk");
console.log("  6 corrupt-identity    old Abram save, missing keys, empty name");
console.log("  7 first-run-funnel    intro → coffee → First Light → profile → Ur");
console.log("  8 tablets-beat-relay  tablets / beat / team / relay start and finish");
console.log("  9 clock-powers        selah/illum mid-run, pause, double endRun");
console.log(" 10 live-chrome         real browser: pick Dawit, atlas walker, Ur companion, viewport flip");
console.log("");

{
  console.log("STRESS 1  mode-thrash");
  const sb = boot();
  profile(sb, "amina", "Stress");
  const modes = ["daily","practice","recall","blitz","endless","team","beat","trial","tablets","pilgrimage","pilgrim-recall","relay"];
  let threw = 0, started = 0;
  for (let round = 0; round < 6; round++) {
    for (const mode of modes) {
      try {
        if (mode === "relay") exec(sb, `pendingArcKey="patriarchs"`);
        if (mode === "pilgrimage" || mode === "pilgrim-recall") exec(sb, `pendingSiteId="ur"`);
        if (mode === "tablets") exec(sb, `SAVE.set.tabletsTutorialDone=true; persist(); startRun("tablets","watchman",{tabletChapter:"psalm23"})`);
        else exec(sb, `startRun(${JSON.stringify(mode)},"watchman")`);
        started++;
        const view = read(sb, "currentView");
        ok("s1 " + mode + " r" + round + " opened", view === "play" || view === "act" || view === "tablets" || view === "results", view);
        exec(sb, `if(!R.ended) endRun("abandon")`);
      } catch (e) {
        threw++;
        ok("s1 " + mode + " r" + round + " no throw", false, String(e && e.message || e));
      }
    }
  }
  ok("s1 looped 6 rounds", started === modes.length * 6, started);
  ok("s1 zero throws", threw === 0, threw);
}

{
  console.log("STRESS 2  answer-storm");
  const sb = boot();
  profile(sb, "elias", "Storm");
  exec(sb, `startRun("endless","watchman")`);
  const n = smash(sb, 120);
  ok("s2 answered at least 40", n >= 40, n);
  ok("s2 still a live run or a clean end", read(sb, "R.mode==='endless' && (R.running || R.ended || currentView==='results' || currentView==='play')"));
  ok("s2 no NaN score", Number.isFinite(read(sb, "R.score")));
}

{
  console.log("STRESS 3  end-reasons");
  const sb = boot();
  profile(sb, "soojin", "Ends");
  const cases = [
    ["daily", "abandon"],
    ["practice", "death"],
    ["blitz", "complete"],
    ["endless", "abandon"],
    ["trial", "death"]
  ];
  for (const [mode, reason] of cases) {
    exec(sb, `startRun(${JSON.stringify(mode)},"watchman"); R.correct=3; R.attempts=3; endRun(${JSON.stringify(reason)})`);
    eq("s3 " + mode + " " + reason + " lands results", read(sb, "currentView"), "results");
    ok("s3 " + mode + " marked ended", read(sb, "R.ended") === true);
    exec(sb, `endRun("abandon")`);
    eq("s3 double endRun is a no-op", read(sb, "currentView"), "results");
  }
}

{
  console.log("STRESS 4  road-companions");
  const sb = boot();
  profile(sb, "lucia", "Road");
  const sites = read(sb, "Pilgrimage.journey().map(s=>s.id)");
  ok("s4 forty-six sites", sites.length === 46, sites.length);
  let mismatch = 0;
  for (const id of sites) {
    const row = read(sb, `(function(){
      var site=Pilgrimage.site(${JSON.stringify(id)});
      return {
        id: site.id,
        arc: site.arc,
        companion: companionQuestionName(site),
        src: companionQuestionSrc(site),
        walker: Characters.walkerSpec(SAVE.set.scholarId, SAVE.pilgrim).id
      };
    })()`);
    if (row.walker !== "lucia") mismatch++;
    if (!row.src || row.src.indexOf("assets/characters/") !== 0) mismatch++;
    if (row.companion === "Lúcia" || row.companion === "Lucia") mismatch++;
  }
  eq("s4 walker stays Lucia on every site", mismatch, 0);
  eq("s4 Ur companion is Abram", read(sb, `companionQuestionName(Pilgrimage.site("ur"))`), "Abram");
  eq("s4 Jericho companion is Joshua", read(sb, `companionQuestionName(Pilgrimage.site("jericho"))`), "Joshua");
  eq("s4 Carmel companion is Elijah", read(sb, `companionQuestionName(Pilgrimage.site("carmel"))`), "Elijah");
  eq("s4 Golgotha companion is Jesus", read(sb, `companionQuestionName(Pilgrimage.site("golgotha"))`), "Jesus");
  eq("s4 Rome companion is Paul", read(sb, `companionQuestionName(Pilgrimage.site("rome"))`), "Paul");
  exec(sb, `pendingSiteId="jericho"; startRun("pilgrimage","watchman"); if(typeof hideSiteQuote==="function") hideSiteQuote();`);
  eq("s4 live Jericho run keeps Lucia as scholar", read(sb, "activeCharacter().id"), "lucia");
  eq("s4 live Jericho still names Joshua on the plate", read(sb, `companionQuestionName(Pilgrimage.site(R.siteId))`), "Joshua");
}

{
  console.log("STRESS 5  scholar-walkers");
  const sb = boot();
  const ids = read(sb, "Characters.scholars().map(c=>c.id)");
  eq("s5 eight scholars", ids.length, 8);
  for (const id of ids) {
    const spec = read(sb, `Characters.walkerSpec(${JSON.stringify(id)}, SAVE.pilgrim)`);
    eq("s5 " + id + " walker id", spec.id, id);
    ok("s5 " + id + " idle file", fs.existsSync(path.join(ROOT, spec.idle)), spec.idle);
    ok("s5 " + id + " walk file", fs.existsSync(path.join(ROOT, spec.walk)), spec.walk);
    exec(sb, `SAVE.set.scholarId=${JSON.stringify(id)}; SAVE.set.character=${JSON.stringify(id)}; syncTravelerToken();`);
    eq("s5 " + id + " activeCharacter", read(sb, "activeCharacter().id"), id);
  }
  const figures = read(sb, "Characters.figures().map(c=>c.id)");
  for (const id of figures) {
    const spec = read(sb, `Characters.walkerSpec(${JSON.stringify(id)}, SAVE.pilgrim)`);
    ok("s5 figure " + id + " does not walk as themselves", spec.id !== id && spec.id != null, spec);
    const ch = read(sb, `Characters.byId(${JSON.stringify(id)})`);
    ok("s5 figure " + id + " has no walk sheet", !ch.walk && !ch.idle);
  }
}

{
  console.log("STRESS 6  corrupt-identity");
  const dirty = boot();
  exec(dirty, `SAVE.set.character="abram"; SAVE.set.scholarId="abram"; persist();`);
  eq("s6 Abram save resolves to a scholar", read(dirty, "activeCharacter().kind"), "scholar");
  ok("s6 Abram save walker is a scholar sheet", read(dirty, `Characters.walkerSpec("abram", SAVE.pilgrim).idle`).indexOf("/abram/") < 0);
  const missing = boot({ ctv_save_v3: { set: { playerName: "X" } } });
  ok("s6 partial save still boots", read(missing, "SAVE.set.scholarId")==="amina" || read(missing, "typeof SAVE.set.scholarId")==="string");
  exec(missing, `try{ commitProfile("A", "amina") }catch(e){}`);
  ok("s6 one-letter name is not profile-ready", read(missing, "profileReady()") === false);
  exec(missing, `commitProfile("Ok", "dawit")`);
  ok("s6 two-letter name commits", read(missing, "profileReady()") === true);
  eq("s6 committed Dawit", read(missing, "SAVE.set.scholarId"), "dawit");
}

{
  console.log("STRESS 7  first-run-funnel");
  const sb = boot();
  exec(sb, `SAVE.set.introPlayed=false; SAVE.set.tutorialDone=false; persist(); introDone=false; introStarted=false; go("intro"); finishIntro(true);`);
  ok("s7 intro stamps introPlayed", read(sb, "SAVE.set.introPlayed") === true);
  exec(sb, `SAVE.set.tutorialDone=false; persist(); enterCoffeePath()`);
  eq("s7 coffee opens tutorial", read(sb, "R.mode"), "tutorial");
  eq("s7 tutorial not pre-stamped", read(sb, "SAVE.set.tutorialDone"), false);
  smash(sb, 8);
  if (read(sb, "R.mode==='tutorial' && !R.ended")) exec(sb, `completeTutorialRun()`);
  ok("s7 tutorial can complete", read(sb, "SAVE.set.tutorialDone") === true);
  exec(sb, `commitProfile("Funnel", "priya"); go("atlas"); pendingSiteId="ur"; startRun("pilgrimage","watchman")`);
  eq("s7 Ur after funnel", read(sb, "R.siteId"), "ur");
  eq("s7 walker is Priya", read(sb, "activeCharacter().id"), "priya");
}

{
  console.log("STRESS 8  tablets-beat-relay");
  const sb = boot();
  profile(sb, "thomas", "Modes");
  exec(sb, `SAVE.set.tabletsTutorialDone=true; persist(); startRun("tablets","watchman",{tabletChapter:"psalm23"})`);
  eq("s8 tablets view", read(sb, "currentView"), "tablets");
  const blanks = read(sb, "R.tabletTotal") || 0;
  for (let i = 0; i < Math.min(blanks, 14); i++) exec(sb, `if(!R.ended){ tabletsResolve(true); tabletsFinishResolve(true); }`);
  if (!read(sb, "R.ended")) exec(sb, `endRun("complete")`);
  eq("s8 tablets ended cleanly", read(sb, "R.ended"), true);
  exec(sb, `startRun("beat","watchman")`);
  eq("s8 beat starts", read(sb, "R.mode"), "beat");
  exec(sb, `if(!R.ended) endRun("abandon"); startRun("team","watchman")`);
  eq("s8 team starts", read(sb, "R.mode"), "team");
  exec(sb, `if(!R.ended) endRun("abandon"); pendingArcKey="patriarchs"; startRun("relay","watchman")`);
  eq("s8 relay starts", read(sb, "R.mode"), "relay");
  ok("s8 relay has a queue", read(sb, "R.relay && R.relay.queue && R.relay.queue.length>0") === true);
}

{
  console.log("STRESS 9  clock-powers");
  const sb = boot();
  profile(sb, "yusef", "Clock");
  exec(sb, `startRun("daily","watchman"); R.running=true; R.powers.selah=2; R.powers.illum=2; R.tEnd=performance.now()+8000; R.tTotal=8000;`);
  exec(sb, `usePower("selah"); usePower("illum");`);
  ok("s9 selah spent", read(sb, "R.powers.selah") <= 1);
  smash(sb, 5);
  exec(sb, `if(typeof pauseRun==="function") pauseRun(); else R.paused=true;`);
  exec(sb, `if(typeof resumeRun==="function") resumeRun(); else R.paused=false;`);
  exec(sb, `endRun("abandon"); endRun("death"); endRun("complete")`);
  eq("s9 still results after stacked endRun", read(sb, "currentView"), "results");
  const views = ["menu","atlas","settings","study","relics","seals","records","brief"];
  for (let i = 0; i < 40; i++) exec(sb, `go(${JSON.stringify(views[i % views.length])})`);
  ok("s9 forty view flips held", true);
}

async function liveChrome() {
  console.log("STRESS 10 live-chrome");
  if (!fs.existsSync(CHROME)) {
    ok("s10 chrome installed", false, CHROME);
    return;
  }
  const profile = path.join(os.tmpdir(), "ctv-stress-" + Date.now());
  const chrome = spawn(CHROME, [
    "--headless=new", "--remote-debugging-port=9335", "--window-size=1920,1080",
    "--hide-scrollbars", "--mute-audio", "--no-first-run", `--user-data-dir=${profile}`
  ]);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  await sleep(1800);
  let tab;
  try {
    tab = await fetch("http://127.0.0.1:9335/json/new?http://localhost:8781", { method: "PUT" }).then(r => r.json());
  } catch (e) {
    chrome.kill();
    ok("s10 connected to app", false, String(e && e.message || e));
    return;
  }
  const WebSocket = globalThis.WebSocket;
  let nextId = 1;
  const c = { errors: [] };
  await new Promise((resolve, reject) => {
    c.ws = new WebSocket(tab.webSocketDebuggerUrl);
    c.cb = new Map();
    c.ws.onopen = resolve;
    c.ws.onerror = reject;
    c.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && c.cb.has(msg.id)) {
        const { resolve, reject } = c.cb.get(msg.id);
        c.cb.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method === "Runtime.exceptionThrown") {
        c.errors.push((msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description) || msg.params.exceptionDetails.text);
      }
    };
  });
  const send = (method, params) => new Promise((resolve, reject) => {
    const id = nextId++;
    c.cb.set(id, { resolve, reject });
    c.ws.send(JSON.stringify({ id, method, params }));
  });
  const ev = async (expression) => {
    const res = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error((res.exceptionDetails.exception && res.exceptionDetails.exception.description) || res.exceptionDetails.text);
    return res.result ? res.result.value : undefined;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  for (let i = 0; i < 25; i++) {
    try { if (await ev("Boolean(window.SAVE && window.go)")) break; } catch (e) {}
    await sleep(400);
  }
  await ev(`localStorage.clear(); location.reload(true)`);
  await sleep(2200);
  for (let i = 0; i < 25; i++) {
    try { if (await ev("Boolean(window.SAVE && window.commitProfile)")) break; } catch (e) {}
    await sleep(400);
  }
  const info = await ev(`(function(){
    SAVE.set.introPlayed=true; SAVE.set.tutorialDone=true; persist();
    commitProfile("StressLive","dawit");
    go("atlas");
    pendingSiteId="ur";
    startRun("pilgrimage","watchman");
    if(typeof hideSiteQuote==="function") hideSiteQuote();
    var site=Pilgrimage.site(R.siteId);
    var spec=Characters.walkerSpec(SAVE.set.scholarId, SAVE.pilgrim);
    var walkerEl=document.querySelector(".traveler-walker");
    return {
      scholar: SAVE.set.scholarId,
      active: activeCharacter() && activeCharacter().id,
      walkerId: spec.id,
      walkerIdle: spec.idle,
      css: walkerEl && walkerEl.getAttribute("style") || "",
      companion: companionQuestionName(site),
      companionSrc: companionQuestionSrc(site),
      site: R.siteId,
      view: currentView
    };
  })()`);
  eq("s10 scholar is Dawit", info.scholar, "dawit");
  eq("s10 active scholar is Dawit", info.active, "dawit");
  eq("s10 atlas walker is Dawit", info.walkerId, "dawit");
  ok("s10 walker idle is Dawit's sheet", String(info.walkerIdle).indexOf("characters/dawit/idle.png") >= 0, info.walkerIdle);
  eq("s10 Ur companion is still Abram", info.companion, "Abram");
  ok("s10 Abram art is the question plate", String(info.companionSrc).indexOf("abram/question.png") >= 0, info.companionSrc);
  eq("s10 live site is Ur", info.site, "ur");
  const modes = ["daily","practice","blitz","endless","team","beat","tablets"];
  for (const mode of modes) {
    try {
      await ev(`endRun("abandon"); ${mode==="tablets" ? 'SAVE.set.tabletsTutorialDone=true; persist(); startRun("tablets","watchman",{tabletChapter:"psalm23"})' : 'startRun("'+mode+'","watchman")'}`);
      const st = await ev(`({view:currentView, mode:R&&R.mode, scholar:SAVE.set.scholarId})`);
      ok("s10 " + mode + " held Dawit", st.scholar === "dawit" && st.mode === mode, st);
    } catch (e) {
      ok("s10 " + mode + " eval", false, String(e.message || e));
    }
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await ev(`endRun("abandon"); pendingSiteId="jericho"; startRun("pilgrimage","watchman"); if(typeof hideSiteQuote==="function") hideSiteQuote();`);
  const phone = await ev(`({site:R.siteId, companion:companionQuestionName(Pilgrimage.site(R.siteId)), scholar:SAVE.set.scholarId, ans:document.querySelectorAll("#opts .ans").length, w:innerWidth})`);
  eq("s10 phone Jericho", phone.site, "jericho");
  eq("s10 phone companion Joshua", phone.companion, "Joshua");
  eq("s10 phone still Dawit", phone.scholar, "dawit");
  ok("s10 phone has answers or typed beat", phone.ans === 4 || phone.ans === 0, phone.ans);
  ok("s10 phone width", phone.w === 390, phone.w);
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  ok("s10 no live exceptions", c.errors.length === 0, c.errors.join(" | "));
  c.ws.close();
  chrome.kill();
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
}

(async () => {
  try { await liveChrome(); }
  catch (e) { ok("s10 live chrome", false, String(e && e.stack || e)); }
  console.log("");
  if (fails.length) fails.forEach(f => console.log("FAIL  " + f));
  console.log(fail ? ("STRESS  " + pass + " passed · " + fail + " failed") : ("STRESS  all " + pass + " checks passed"));
  if (fail) process.exit(1);
})();
