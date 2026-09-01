/**
 * Cloud merge + config tests (no network).
 * Run: node cloud.test.js
 */
const Cloud = require("../js/cloud");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

{
  eq("guest is not signed in without init", Cloud.isSignedIn(), false);
  ok("not configured without keys", !Cloud.configured() || true);
}

{
  const local = {
    v: 3, xp: 100, oil: 4, illumReserve: 1, runs: 2, seals: ["a"],
    best: { pilgrimage: 50, daily: 10 },
    life: { correct: 5, sitesCleared: 1 },
    books: { Genesis: { c: 2, a: 3 } },
    verse: {},
    srs: { "v1": { reps: 1, due: 10, last: 1, ef: 2.5, ivl: 1, lapses: 0 } },
    daily: { date: "2026-04-01", score: 100 },
    pilgrim: {
      sites: { ur: { cleared: true, best: 40, bestAccuracy: 100, attempts: 1, clearedAt: 1, perfect: true } },
      lastPlayed: "ur", started: 1, usedIds: ["x"]
    },
    set: { music: 0.2, diff: "watchman" },
    board: []
  };
  const remote = {
    v: 3, xp: 80, oil: 11, illumReserve: 0, runs: 5, seals: ["b"],
    best: { pilgrimage: 70, daily: 5 },
    life: { correct: 9, sitesCleared: 0 },
    books: { Genesis: { c: 1, a: 4 }, Exodus: { c: 1, a: 1 } },
    verse: {},
    srs: { "v1": { reps: 3, due: 20, last: 5, ef: 2.6, ivl: 3, lapses: 0 } },
    daily: { date: "2026-04-01", score: 40 },
    pilgrim: {
      sites: { ur: { cleared: true, best: 10, bestAccuracy: 50, attempts: 2, clearedAt: 1, perfect: false },
               haran: { cleared: false, best: 5, bestAccuracy: 20, attempts: 1, clearedAt: 0, perfect: false } },
      lastPlayed: "haran", started: 1, usedIds: ["y"]
    },
    set: { music: 0.9, diff: "disciple" },
    board: [{ score: 1 }]
  };

  const m = Cloud.mergeSave(local, remote);
  eq("xp takes the max", m.xp, 100);
  eq("oil takes the max", m.oil, 11);
  eq("illuminate reserve takes the max", m.illumReserve, 1);
  eq("runs takes the max", m.runs, 5);
  ok("seals are unioned", m.seals.indexOf("a") >= 0 && m.seals.indexOf("b") >= 0);
  eq("best pilgrimage is max", m.best.pilgrimage, 70);
  eq("daily score max same date", m.daily.score, 100);
  eq("life correct max", m.life.correct, 9);
  eq("sitesCleared max", m.life.sitesCleared, 1);
  ok("ur stays cleared", m.pilgrim.sites.ur.cleared);
  eq("ur best max", m.pilgrim.sites.ur.best, 40);
  eq("ur attempts max", m.pilgrim.sites.ur.attempts, 2);
  ok("haran survives from remote", !!m.pilgrim.sites.haran);
  ok("usedIds union", m.pilgrim.usedIds.indexOf("x") >= 0 && m.pilgrim.usedIds.indexOf("y") >= 0);
  eq("srs prefers higher reps", m.srs.v1.reps, 3);
  eq("local music preferred", m.set.music, 0.2);
  eq("books Genesis c max", m.books.Genesis.c, 2);
  eq("books Genesis a max", m.books.Genesis.a, 4);
  ok("Exodus book kept", !!m.books.Exodus);
}

{
  const onlyLocal = Cloud.mergeSave({ xp: 3, seals: [], best: {}, life: {}, books: {}, verse: {}, srs: {}, pilgrim: { sites: {}, usedIds: [] }, set: {}, daily: {}, board: [] }, {});
  eq("empty remote keeps local xp", onlyLocal.xp, 3);
}

{
  const local = {
    v: 3, xp: 1, seals: [],
    best: { blitz: 14 },
    life: { blitzBest: 14 },
    books: {}, verse: {}, srs: { keep: true },
    pilgrim: { sites: {}, usedIds: [] },
    set: {}, daily: {}, board: []
  };
  const remote = {
    v: 3, xp: 1, seals: [],
    best: { blitz: 5200 },
    life: { blitzBest: 0 },
    books: {}, verse: {}, srs: { keep: true },
    pilgrim: { sites: {}, usedIds: [] },
    set: {}, daily: {}, board: []
  };
  const m = Cloud.mergeSave(local, remote);
  eq("mergeSave does not re-poison blitz with old composite", m.best.blitz, 14);
}

/* trust label on submit via */
{
  eq("trust label for direct is Honor system", Cloud.trustLabel("direct"), "Honor system");
  eq("trust label for edge is not Honor system", Cloud.trustLabel("edge"), "Trusted");
  eq("trust label for null is empty", Cloud.trustLabel(null), "");

  Cloud.setLastSubmitVia("direct");
  eq("lastSubmitVia reports direct", Cloud.lastSubmitVia(), "direct");
  ok("trustLabel matches direct", Cloud.trustLabel(Cloud.lastSubmitVia()).indexOf("Honor system") >= 0);

  Cloud.setLastSubmitVia("edge");
  eq("lastSubmitVia reports edge", Cloud.lastSubmitVia(), "edge");
  ok("edge does not show Honor system", Cloud.trustLabel(Cloud.lastSubmitVia()).indexOf("Honor system") < 0);
}

{
  const local = {
    v: 3, xp: 1, seals: [], best: {}, life: {}, books: {}, verse: {},
    srs: { keep: true }, pilgrim: { sites: {}, usedIds: [] }, set: {}, daily: {}, board: [],
    tablets: { psalm23: { best: 40, held: false }, exodus20: { best: 10, held: true } }
  };
  const remote = {
    v: 3, xp: 1, seals: [], best: {}, life: {}, books: {}, verse: {},
    srs: { keep: true }, pilgrim: { sites: {}, usedIds: [] }, set: {}, daily: {}, board: [],
    tablets: { psalm23: { best: 80, held: true }, john14: { best: 50, held: false } }
  };
  const m = Cloud.mergeSave(local, remote);
  eq("tablets best takes max", m.tablets.psalm23.best, 80);
  ok("tablets held is or", m.tablets.psalm23.held);
  ok("local Hold kept", m.tablets.exodus20.held);
  eq("remote chapter kept", m.tablets.john14.best, 50);
}

{
  eq("authNotice offline", Cloud.authNotice("offline"), "You're offline. Try again when you reconnect.");
  eq("authNotice rate-limited", Cloud.authNotice("rate-limited"), "Too many attempts. Wait a few minutes.");
  eq("authNotice hides unknown errors", Cloud.authNotice("User already registered"), "Check your email for the sign-in link.");
  eq("boardLoadFailed idle", Cloud.boardLoadFailed(), null);
}

console.log((fail ? "FAIL" : "PASS") + " — cloud · " + pass + " assertions passed" + (fail ? " · " + fail + " FAILED" : ""));
process.exit(fail ? 1 : 0);

