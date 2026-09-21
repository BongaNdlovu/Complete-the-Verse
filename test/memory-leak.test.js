const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const Cloud = require("../js/cloud");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}

const game = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8");
const cloud = fs.readFileSync(path.join(ROOT, "js", "cloud.js"), "utf8");
const tablets = fs.readFileSync(path.join(ROOT, "js", "tablets-run.js"), "utf8");
const atlas = fs.readFileSync(path.join(ROOT, "js", "atlas.js"), "utf8");
const briefs = fs.readFileSync(path.join(ROOT, "js", "briefs.js"), "utf8");
const play = fs.readFileSync(path.join(ROOT, "js", "play.js"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");

{
  ok("1 toast clears the previous timeout before scheduling",
    /if\(hudToastTimer\)\{ clearTimeout\(hudToastTimer\); hudToastTimer = null; \}/.test(game) &&
    /hudToastTimer = setTimeout/.test(game));
  ok("1 score pop clears the previous timeout before scheduling",
    /if\(hudPopTimer\)\{ clearTimeout\(hudPopTimer\); hudPopTimer = null; \}/.test(game) &&
    /hudPopTimer = setTimeout/.test(game));
  ok("1 site plate clears the previous timeout before scheduling",
    /if\(plateTimer\)\{ clearTimeout\(plateTimer\); plateTimer = 0; \}/.test(briefs) &&
    /plateTimer = setTimeout/.test(briefs));
  ok("1 site quote clears the previous interval before scheduling",
    /if\(el\._timer\)\{ clearInterval\(el\._timer\); el\._timer = null; \}/.test(game) &&
    /el\._timer = setInterval/.test(game));
}

{
  ok("2 play loop is a single rAF and stopLoop cancels it",
    /if\(loopRaf===null&&currentView==="play"/.test(game) &&
    /if\(loopRaf!==null\)cancelAnimationFrame\(loopRaf\)/.test(game) &&
    /loopRaf=null/.test(game));
  ok("2 hidden tab stops the play loop", /visibilitychange/.test(game) && /stopLoop\(\)/.test(game));
  ok("2 fade question clears its interval",
    /function clearQuestionMechanicTimers/.test(play) &&
    /clearInterval\(activeFadeTimer\)/.test(play) &&
    /activeFadeTimer = echoTimer/.test(play));
}

{
  ok("3 tablet rAF is cancelled on stop",
    /function stopTabletsLoop/.test(tablets) &&
    /cancelAnimationFrame\(R\.tabletRaf\)/.test(tablets) &&
    /R\.tabletRaf = 0/.test(tablets));
  ok("3 tablet chrome listeners bind once",
    /if\(el && !el\._bound\)/.test(tablets) &&
    /el\._bound = true/.test(tablets));
  ok("3 atlas walk rAF and terminus interval are cancelled",
    /cancelAnimationFrame\(walkAnim\)/.test(atlas) &&
    /if \(termTimer\) \{ clearInterval\(termTimer\); termTimer = null; \}/.test(atlas));
}

{
  ok("4 cloud push debounce clears the pending timer",
    /if \(pushTimer\) clearTimeout\(pushTimer\)/.test(cloud) &&
    /pushTimer = setTimeout/.test(cloud));
  ok("4 friend-race poll stops the previous interval first",
    /function startFriendRacePolling/.test(game) &&
    /stopFriendRacePolling\(\)/.test(game) &&
    /clearInterval\(friendRacePollTimer\)/.test(game) &&
    /friendRacePollTimer = null/.test(game));
  ok("4 service worker trims audio and media caches",
    /function trimCache/.test(sw) &&
    /MAX_AUDIO_BYTES/.test(sw) &&
    /MAX_MEDIA_BYTES/.test(sw) &&
    /MAX_AUDIO_ENTRIES/.test(sw));
  ok("4 service worker sizes responses without buffering whole bodies",
    /function responseBytes/.test(sw) && !/\.blob\(\)/.test(sw) && /getReader\(\)/.test(sw));
}

{
  const local = {
    v: 3, xp: 10, oil: 1, runs: 1, seals: ["a"],
    best: { pilgrimage: 10 },
    life: { correct: 2, sitesCleared: 1 },
    books: { Genesis: { c: 1, a: 2 } },
    verse: {},
    srs: { v1: { reps: 1, due: 10, last: 1, ef: 2.5, ivl: 1, lapses: 0 } },
    daily: { date: "2026-09-21", score: 40 },
    pilgrim: { sites: { ur: { cleared: true, best: 10, bestAccuracy: 50, attempts: 1, clearedAt: 1, perfect: false } }, usedIds: ["x"] },
    set: { music: 0.2 },
    board: [{ score: 1 }]
  };
  const remote = {
    v: 3, xp: 12, oil: 2, runs: 2, seals: ["b"],
    best: { pilgrimage: 20 },
    life: { correct: 3, sitesCleared: 1 },
    books: { Exodus: { c: 1, a: 1 } },
    verse: {},
    srs: { v1: { reps: 2, due: 20, last: 2, ef: 2.6, ivl: 2, lapses: 0 } },
    daily: { date: "2026-09-21", score: 50 },
    pilgrim: { sites: { haran: { cleared: false, best: 5, bestAccuracy: 20, attempts: 1, clearedAt: 0, perfect: false } }, usedIds: ["y"] },
    set: { music: 0.4 },
    board: [{ score: 9 }]
  };
  const keysBefore = Object.keys(Cloud).slice().sort().join(",");
  const sealLen = local.seals.length;
  const before = process.memoryUsage().heapUsed;
  for (let i = 0; i < 2000; i++) Cloud.mergeSave(local, remote);
  const grew = process.memoryUsage().heapUsed - before;
  ok("5 mergeSave does not mutate the input or Cloud surface",
    local.seals.length === sealLen &&
    Object.keys(Cloud).slice().sort().join(",") === keysBefore);
  ok("5 mergeSave 2000 times stays under 40MB extra heap", grew < 40 * 1024 * 1024, { grew: grew });
}

{
  /* responseBytes must still size a body it has no Content-Length for, and do
     it by streaming instead of buffering the whole body into a blob. */
  const vm = require("vm");
  const sb = {
    console: console, URL: URL, Response: Response, Request: Request, Promise: Promise,
    Number: Number, Object: Object, JSON: JSON, Array: Array, Error: Error,
    self: { addEventListener() {}, location: { origin: "https://example.test" }, skipWaiting() {}, clients: { claim() {} } },
    caches: { open: async () => ({ keys: async () => [], match: async () => null, put: async () => {}, addAll: async () => {} }) },
    fetch: async () => new Response("")
  };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInContext(sw + "\n;globalThis.__responseBytes = responseBytes;", sb, { filename: "sw.js" });
  const bytes = new Uint8Array(3 * 1024 * 1024);
  const res = new Response(bytes);
  res.headers.delete("content-length");
  vm.runInContext("__responseBytes", sb)(res).then(function (sized) {
    ok("4 unknown-length body is measured by streaming, not a blob", sized === bytes.length, { got: sized, want: bytes.length });
    report();
  }, function (e) {
    ok("4 unknown-length body is measured by streaming, not a blob", false, String(e));
    report();
  });
}

function report() {
  if (fail) {
    console.log("FAIL — memory leak · " + pass + " passed · " + fail + " failed");
    process.exit(1);
  }
  console.log("PASS — memory leak · " + pass + " assertions");
}
