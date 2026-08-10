/* Logic tests — live conditions, and every way they can fail.

   live.js makes the only network call in the whole game, so the thing
   worth testing is not the happy path. It is that a dead network, a
   hanging socket, a 500, a truncated payload and a response full of
   nulls all end the same way: the game carries on with authored climate
   and nobody sees an error.

   `fetch` and `now` are injected, so none of this touches a network and
   none of it waits on a real timeout. */
const S = require("./js/sites");
const Live = require("./js/live");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

const SITES = S.SITES;
const UR = SITES.find(s => s.id === "ur");
const PATMOS = SITES.find(s => s.id === "patmos");

/* A well-formed Open-Meteo reply for `n` sites. */
function goodBody(n, over){
  return Array.from({length: n}, (_, i) => ({
    latitude: 30 + i, longitude: 40 + i,
    current: Object.assign({
      time: "2026-08-10T13:00", temperature_2m: 40 + i, apparent_temperature: 44 + i,
      relative_humidity_2m: 12, precipitation: 0, weather_code: 0,
      cloud_cover: 3, wind_speed_10m: 11, wind_direction_10m: 315
    }, over || {})
  }));
}
function res(body, okFlag){
  return Promise.resolve({ ok: okFlag !== false, json: () => Promise.resolve(body) });
}
function fresh(over){
  Live.reset();
  Live.configure(Object.assign({
    fetch: () => res(goodBody(SITES.length)),
    now: () => 1000, timeoutMs: 40, ttlMs: 60000, enabled: true
  }, over || {}));
}

/* ---------- weather code classification ---------- */
{
  eq("code 0 is clear", Live.classify(0).key, "clear");
  eq("code 2 is cloud", Live.classify(2).key, "cloud");
  eq("code 45 is haze", Live.classify(45).key, "haze");
  eq("code 61 is rain", Live.classify(61).key, "rain");
  eq("code 82 is rain", Live.classify(82).key, "rain");
  eq("code 73 is snow", Live.classify(73).key, "snow");
  eq("code 95 is storm", Live.classify(95).key, "storm");
  eq("code 99 is storm", Live.classify(99).key, "storm");
  ok("an unknown code still returns something", !!Live.classify(400).key);
  ok("every code from 0 to 99 classifies",
    Array.from({length: 100}, (_, i) => i).every(c => !!Live.classify(c).key));
  ok("a measured code is not marked derived", Live.classify(0).derived === false);
}

/* ---------- derived dust ---------- */
{
  const dusty = Live.classify(0, { wind: 30, arid: true });
  eq("wind over a dry site reads as dust", dusty.key, "dust");
  ok("and is flagged as inferred, not measured", dusty.derived === true);

  eq("light wind over a dry site is still clear", Live.classify(0, { wind: 10, arid: true }).key, "clear");
  eq("strong wind over a wet site is not dust", Live.classify(0, { wind: 40, arid: false }).key, "clear");
  eq("dust never overrides actual rain", Live.classify(61, { wind: 40, arid: true }).key, "rain");
  eq("nor a storm", Live.classify(95, { wind: 60, arid: true }).key, "storm");
  eq("partly cloudy can still blow dust", Live.classify(2, { wind: 30, arid: true }).key, "dust");

  ok("Ur is an arid site", Live.isArid(UR));
  ok("Patmos is not", !Live.isArid(PATMOS));
  ok("a site with no climate is not arid", !Live.isArid({}));
  ok("no site at all is not arid", !Live.isArid(null));
}

/* ---------- the authored fallback ---------- */
{
  const f = Live.fallbackFor(UR);
  ok("the fallback is never null", !!f);
  ok("the fallback carries a temperature", Number.isFinite(f.tempC));
  ok("the fallback is between the authored low and high",
    f.tempC >= UR.climate.lo && f.tempC <= UR.climate.hi, {t: f.tempC, c: UR.climate});
  eq("the fallback is honestly marked not-live", f.live, false);
  ok("the fallback still describes a sky", !!f.sky && !!f.sky.label);

  ok("every site has a usable fallback",
    SITES.every(s => { const r = Live.fallbackFor(s); return r && Number.isFinite(r.tempC); }));
  ok("a site with no climate still returns a reading",
    Number.isFinite(Live.fallbackFor({id: "x"}).tempC));
}

/* ---------- the request ---------- */
{
  const url = Live.buildUrl(SITES);
  ok("all sites go in one request", url.split("latitude=")[1].split("&")[0].split(",").length === SITES.length);
  eq("latitudes and longitudes are paired",
    url.split("latitude=")[1].split("&")[0].split(",").length,
    url.split("longitude=")[1].split("&")[0].split(",").length);
  ok("the request asks for the fields it parses", url.indexOf("temperature_2m") > 0);
  ok("wind is requested in km/h", url.indexOf("wind_speed_unit=kmh") > 0);
  ok("it is a single https call", url.indexOf("https://") === 0 && url.indexOf("?") > 0);
}

/* ---------- parsing ---------- */
{
  const parsed = Live.parseBatch(goodBody(SITES.length), SITES, 5);
  eq("every site parses", Object.keys(parsed).length, SITES.length);
  eq("the reading is keyed by site id", parsed.ur.siteId, "ur");
  eq("temperature is rounded", parsed.ur.tempC, 40);
  eq("a parsed reading is marked live", parsed.ur.live, true);
  eq("the fetch time is stamped", parsed.ur.at, 5);
  ok("the sky is classified", !!parsed.ur.sky.key);

  // A single-coordinate reply comes back as a bare object, not an array.
  const one = Live.parseBatch(goodBody(1)[0], [UR], 1);
  eq("a bare object parses as one site", Object.keys(one).length, 1);

  // Partial and broken payloads must not lose the good rows.
  const half = goodBody(SITES.length);
  half[3] = null; half[5] = {}; half[7] = { current: null };
  half[9] = { current: { temperature_2m: "hot" } };
  const partial = Live.parseBatch(half, SITES, 1);
  eq("broken rows are dropped, not fatal", Object.keys(partial).length, SITES.length - 4);
  ok("the good rows survive alongside them", !!partial.ur);

  eq("a short payload yields only what it covers",
    Object.keys(Live.parseBatch(goodBody(3), SITES, 1)).length, 3);
  eq("nonsense parses to nothing", Object.keys(Live.parseBatch(null, SITES, 1)).length, 0);
  eq("a string parses to nothing", Object.keys(Live.parseBatch("nope", SITES, 1)).length, 0);
  eq("an empty array parses to nothing", Object.keys(Live.parseBatch([], SITES, 1)).length, 0);

  // Missing optional fields must not poison a row that has a temperature.
  const sparse = [{ current: { temperature_2m: 30 } }];
  const sp = Live.parseBatch(sparse, [UR], 1);
  ok("a sparse row still yields a reading", !!sp.ur);
  eq("missing apparent temperature falls back to the real one", sp.ur.feelsC, 30);
  eq("missing humidity is null, not zero", sp.ur.humidity, null);
}

/* ---------- summarising ---------- */
{
  const r = Live.parseBatch(goodBody(1), [UR], 1).ur;
  ok("a summary mentions the temperature", Live.summarise(r).indexOf("40°C") === 0, Live.summarise(r));
  ok("a summary mentions the wind", Live.summarise(r).indexOf("km/h") > 0);
  eq("no reading summarises to nothing", Live.summarise(null), "");
}

/* ---------- the async paths ---------- */
(async function(){

  /* --- the happy path --- */
  {
    fresh();
    const out = await Live.load(SITES);
    eq("a good response fills every site", Object.keys(out).length, SITES.length);
    ok("get() returns a cached reading", !!Live.get("ur"));
    eq("readingFor prefers the live value", Live.readingFor(UR).live, true);
    ok("the cache is not stale yet", !Live.isStale());
  }

  /* --- every failure mode --- */
  {
    const failures = [
      ["a rejected fetch",     () => Promise.reject(new Error("offline"))],
      ["a thrown fetch",       () => { throw new Error("boom"); }],
      ["a non-ok response",    () => res(goodBody(SITES.length), false)],
      ["unparseable json",     () => Promise.resolve({ok: true, json: () => Promise.reject(new Error("bad json"))})],
      ["a null response",      () => Promise.resolve(null)],
      ["a hanging socket",     () => new Promise(() => {})]
    ];

    for(const [label, f] of failures){
      fresh({ fetch: f });
      let threw = false, out = null;
      try { out = await Live.load(SITES); } catch(e){ threw = true; }
      ok(label + " never rejects", !threw);
      ok(label + " resolves to an empty cache", out && Object.keys(out).length === 0, out && Object.keys(out).length);
      // And the game still has something to draw.
      ok(label + " still leaves a usable reading", Live.readingFor(UR).tempC > 0);
      eq(label + " marks that reading as not-live", Live.readingFor(UR).live, false);
    }
  }

  /* --- a failure must not wipe good data already held --- */
  {
    fresh();
    await Live.load(SITES);
    const before = Live.get("ur").tempC;

    Live.configure({ fetch: () => Promise.reject(new Error("dropped")), now: () => 1000 + 60001 });
    const after = await Live.load(SITES);
    eq("a later failure keeps the readings already held", after.ur.tempC, before);
    eq("and they are still marked live", after.ur.live, true);
  }

  /* --- caching --- */
  {
    let calls = 0;
    fresh({ fetch: () => { calls++; return res(goodBody(SITES.length)); } });

    await Live.load(SITES);
    await Live.load(SITES);
    await Live.load(SITES);
    eq("repeat calls inside the TTL hit the cache", calls, 1);

    Live.configure({ now: () => 1000 + 60001 });
    ok("the cache goes stale after the TTL", Live.isStale());
    await Live.load(SITES);
    eq("a stale cache refetches", calls, 2);
  }

  /* --- an empty result must not lock in for the whole TTL --- */
  {
    let calls = 0;
    fresh({ fetch: () => { calls++; return Promise.reject(new Error("down")); } });
    await Live.load(SITES);
    await Live.load(SITES);
    eq("a failed fetch does not poison the cache window", calls, 2);
  }

  /* --- concurrent callers share one request --- */
  {
    let calls = 0;
    fresh({ fetch: () => { calls++; return res(goodBody(SITES.length)); } });
    const [a, b, c] = await Promise.all([Live.load(SITES), Live.load(SITES), Live.load(SITES)]);
    eq("three concurrent callers make one request", calls, 1);
    ok("and all three get the readings", !!a.ur && !!b.ur && !!c.ur);
  }

  /* --- switched off --- */
  {
    let calls = 0;
    fresh({ fetch: () => { calls++; return res(goodBody(SITES.length)); }, enabled: false });
    const out = await Live.load(SITES);
    eq("disabled means no request at all", calls, 0);
    eq("disabled resolves empty", Object.keys(out).length, 0);
    eq("disabled still returns authored climate", Live.readingFor(UR).live, false);
  }

  /* --- no fetch implementation at all --- */
  {
    Live.reset();
    Live.configure({ fetch: null, now: () => 1, enabled: true });
    let threw = false;
    try { await Live.load(SITES); } catch(e){ threw = true; }
    ok("a missing fetch does not throw", !threw);
    ok("and readings still resolve", Live.readingFor(UR).tempC > 0);
  }

  /* --- degenerate inputs --- */
  {
    fresh();
    eq("no sites means no request", Object.keys(await Live.load([])).length, 0);
    eq("null sites means no request", Object.keys(await Live.load(null)).length, 0);
    eq("readingFor(null) is null", Live.readingFor(null), null);
  }

  Live.reset();
  console.log((fail ? "FAIL" : "PASS") + " — live · " + pass + " assertions passed" +
    (fail ? ", " + fail + " failed" : ""));
  process.exit(fail ? 1 : 0);
})();
