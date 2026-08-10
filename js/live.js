/* ==================================================================
   LIVE — the real weather over the real sites, right now.

   Open-Meteo: free, no API key, CORS-enabled, and happy to answer for
   many coordinates in a single request. All twenty-nine sites come back
   in one call, which is why this fetches the whole road at once rather
   than a site at a time.

   The contract this module keeps, and the reason it is written the way
   it is: THE GAME MUST NEVER NOTICE THAT WEATHER FAILED. load() does
   not reject. Ever. Not on a dead network, not on a 500, not on a
   timeout, not on JSON that arrives in a shape nobody expected. It
   resolves with whatever it managed to get and the caller fills the
   rest from authored climate. A player on a plane gets a map graded
   from the site's typical August heat instead of a broken screen, and
   nothing anywhere needs a try/catch around it.

   `fetch` and `now` are injected so the tests can drive the failure
   paths — timeout, rubbish payload, half a payload — without a network
   and without waiting real seconds for anything.
   ================================================================== */

var Live = (function () {

  var ENDPOINT = "https://api.open-meteo.com/v1/forecast";
  var FIELDS = "temperature_2m,apparent_temperature,relative_humidity_2m," +
               "precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m";

  var cfg = {
    // Checked for callability, not merely for existence: a page where
    // `fetch` is declared but null or shimmed to something else would
    // pass a `typeof !== "undefined"` test and then throw on .bind at
    // load time, taking the whole file down before the game starts.
    fetch: (typeof fetch === "function") ? fetch.bind(null) : null,
    now: function () { return Date.now(); },
    endpoint: ENDPOINT,
    timeoutMs: 6000,
    ttlMs: 15 * 60 * 1000,   // weather does not move fast enough to ask more often
    enabled: true
  };

  var cache = {};      // siteId -> reading
  var fetchedAt = 0;
  var inFlight = null;

  function configure(o) {
    if (!o) return cfg;
    Object.keys(o).forEach(function (k) { if (o[k] !== undefined) cfg[k] = o[k]; });
    return cfg;
  }
  function reset() { cache = {}; fetchedAt = 0; inFlight = null; }

  /* ------------------------- WMO weather codes -------------------------
     Open-Meteo reports WMO 4677. These are grouped into the handful of
     treatments the atlas actually renders, because the map does not need
     to tell drizzle from light drizzle — it needs to know whether to put
     rain on the screen. */
  var CODES = [
    { max: 0,  key: "clear",  label: "Clear sky" },
    { max: 3,  key: "cloud",  label: "Partly cloudy" },
    { max: 48, key: "haze",   label: "Fog" },
    { max: 57, key: "rain",   label: "Drizzle" },
    { max: 67, key: "rain",   label: "Rain" },
    { max: 77, key: "snow",   label: "Snow" },
    { max: 82, key: "rain",   label: "Rain showers" },
    { max: 86, key: "snow",   label: "Snow showers" },
    { max: 99, key: "storm",  label: "Thunderstorm" }
  ];

  function classify(code, opts) {
    opts = opts || {};
    var band = null;
    for (var i = 0; i < CODES.length; i++) {
      if (code <= CODES[i].max) { band = CODES[i]; break; }
    }
    if (!band) band = { key: "clear", label: "Clear" };

    /* Open-Meteo has no code for blowing dust, and the Mesopotamian and
       Sinai sites spend a good part of the year in it. So it is derived,
       not reported: a dry site, a clear or lightly clouded sky, and a
       wind over 25 km/h is a dust haze. Flagged `derived` so the UI can
       be honest about which readings are measured and which are
       inferred. */
    if ((band.key === "clear" || band.key === "cloud") &&
        opts.wind >= 25 && opts.arid) {
      return { key: "dust", label: "Blowing dust", derived: true };
    }
    return { key: band.key, label: band.label, derived: false };
  }

  var ARID = { "desert": 1, "semi-arid": 1, "highland-desert": 1 };
  function isArid(site) {
    return !!(site && site.climate && ARID[site.climate.type]);
  }

  /* ------------------------- readings ------------------------- */

  /* The shape everything downstream consumes. `live: false` means this
     was assembled from authored climate rather than measured, and the UI
     labels it as typical rather than current. */
  function reading(o) {
    return {
      siteId: o.siteId,
      tempC: o.tempC,
      feelsC: (o.feelsC === undefined || o.feelsC === null) ? o.tempC : o.feelsC,
      humidity: o.humidity === undefined ? null : o.humidity,
      precip: o.precip === undefined ? null : o.precip,
      cloud: o.cloud === undefined ? null : o.cloud,
      wind: o.wind === undefined ? null : o.wind,
      windDir: o.windDir === undefined ? null : o.windDir,
      code: o.code === undefined ? 0 : o.code,
      sky: o.sky,
      live: !!o.live,
      at: o.at || 0
    };
  }

  /* The always-available answer: what this place is typically like. Used
     when the network is gone, when weather is switched off in settings,
     and for any site a partial response did not cover. */
  function fallbackFor(site) {
    var c = (site && site.climate) || { type: "mediterranean", hi: 30, lo: 18 };
    // Midpoint of the authored high and low, leaning warm — these are
    // summer figures and the atlas is mostly read in daylight.
    var t = Math.round((c.hi * 0.65) + (c.lo * 0.35));
    return reading({
      siteId: site && site.id,
      tempC: t, feelsC: t, humidity: null, precip: null,
      cloud: c.type === "mediterranean" || c.type === "coastal" ? 20 : 5,
      wind: null, windDir: null, code: 0,
      sky: { key: c.type === "coastal" ? "clear" : "clear", label: "Typically clear", derived: true },
      live: false, at: 0
    });
  }

  /* ------------------------- the request ------------------------- */

  function buildUrl(sites) {
    var lat = sites.map(function (s) { return s.coords[0].toFixed(4); }).join(",");
    var lon = sites.map(function (s) { return s.coords[1].toFixed(4); }).join(",");
    return cfg.endpoint +
      "?latitude=" + lat +
      "&longitude=" + lon +
      "&current=" + FIELDS +
      "&wind_speed_unit=kmh&timezone=UTC";
  }

  /* Open-Meteo returns a bare object for one coordinate and an array for
     many. Normalising here means the parser below only has one shape to
     think about. */
  function toArray(json) {
    if (Array.isArray(json)) return json;
    if (json && typeof json === "object") return [json];
    return [];
  }

  /* Defensive by design: any entry that is missing, malformed or has no
     temperature is simply skipped, and the caller falls back for that
     site. A half-good response is worth keeping. */
  function parseBatch(json, sites, at) {
    var rows = toArray(json);
    var out = {};
    for (var i = 0; i < sites.length; i++) {
      var row = rows[i];
      var cur = row && row.current;
      if (!cur || typeof cur.temperature_2m !== "number") continue;

      var site = sites[i];
      var wind = typeof cur.wind_speed_10m === "number" ? cur.wind_speed_10m : 0;
      out[site.id] = reading({
        siteId: site.id,
        tempC: Math.round(cur.temperature_2m),
        feelsC: typeof cur.apparent_temperature === "number"
          ? Math.round(cur.apparent_temperature) : Math.round(cur.temperature_2m),
        humidity: typeof cur.relative_humidity_2m === "number" ? cur.relative_humidity_2m : null,
        precip: typeof cur.precipitation === "number" ? cur.precipitation : null,
        cloud: typeof cur.cloud_cover === "number" ? cur.cloud_cover : null,
        wind: Math.round(wind),
        windDir: typeof cur.wind_direction_10m === "number" ? cur.wind_direction_10m : null,
        code: typeof cur.weather_code === "number" ? cur.weather_code : 0,
        sky: classify(typeof cur.weather_code === "number" ? cur.weather_code : 0,
                      { wind: wind, arid: isArid(site) }),
        live: true,
        at: at || 0
      });
    }
    return out;
  }

  /* A fetch that gives up. AbortController is used where it exists so the
     socket is actually released; the race is there so the promise settles
     on time even where it does not. */
  function fetchWithTimeout(url) {
    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var opts = ctrl ? { signal: ctrl.signal } : {};
    var timer = null;

    function clear() { if (timer) { clearTimeout(timer); timer = null; } }

    var timeout = new Promise(function (_, reject) {
      timer = setTimeout(function () {
        if (ctrl) { try { ctrl.abort(); } catch (e) {} }
        reject(new Error("timeout"));
      }, cfg.timeoutMs);
    });

    /* If the fetch wins the race, nothing is ever attached to `timeout`
       and its later rejection has no handler — which in Node is an
       unhandled rejection and takes the process down, and in a browser
       shows up as an uncaught error in the console. This is a deliberate
       no-op sink for a rejection we have already decided to ignore, not
       an error being swallowed: the race below still sees it. */
    timeout.catch(function () {});

    /* cfg.fetch is injected, and an injected function may throw
       synchronously instead of returning a rejected promise. Called
       bare inside Promise.race that exception escapes before any catch
       is attached, and load() throws despite promising it never does.
       Deferring through Promise.resolve().then() converts a synchronous
       throw into a rejection so it lands in the catch below. */
    var call = Promise.resolve().then(function () { return cfg.fetch(url, opts); });

    return Promise.race([call, timeout])
      .then(function (res) {
        clear();
        if (!res || res.ok === false) throw new Error("bad response");
        return res.json();
      })
      .catch(function (e) { clear(); throw e; });
  }

  /* Fetch every site in one request. Resolves — always — with a map of
     siteId to reading, holding only the sites that actually came back.
     Concurrent callers share one request rather than starting a second. */
  function load(sites) {
    if (!cfg.enabled || !cfg.fetch || !sites || !sites.length) {
      return Promise.resolve({});
    }
    var at = cfg.now();
    if (fetchedAt && (at - fetchedAt) < cfg.ttlMs) return Promise.resolve(cache);
    if (inFlight) return inFlight;

    /* buildUrl touches caller-supplied site data and fetchWithTimeout
       touches an injected function. Neither should be able to throw at
       this point, but load()'s contract is that it never rejects and
       never throws — so it is enforced here rather than assumed. */
    var started;
    try { started = fetchWithTimeout(buildUrl(sites)); }
    catch (e) { inFlight = null; return Promise.resolve(cache); }

    inFlight = started
      .then(function (json) {
        var parsed = parseBatch(json, sites, at);
        // Only count it as a refresh if something usable arrived,
        // otherwise the TTL would lock in an empty result for a quarter
        // of an hour after one bad response.
        if (Object.keys(parsed).length) { cache = parsed; fetchedAt = at; }
        inFlight = null;
        return cache;
      })
      .catch(function () {
        inFlight = null;
        return cache;      // whatever we had before, possibly {}
      });

    return inFlight;
  }

  function get(siteId) { return cache[siteId] || null; }

  /* Never null: the measured reading if there is one, otherwise the
     authored climate for that place. */
  function readingFor(site) {
    if (!site) return null;
    return cache[site.id] || fallbackFor(site);
  }

  function isStale() {
    return !fetchedAt || (cfg.now() - fetchedAt) >= cfg.ttlMs;
  }

  /* Short line for the dossier: "41°C · Clear sky · wind 12 km/h". */
  function summarise(r) {
    if (!r) return "";
    var bits = [r.tempC + "°C", r.sky ? r.sky.label : ""];
    if (r.wind !== null && r.wind !== undefined) bits.push("wind " + r.wind + " km/h");
    return bits.filter(Boolean).join(" · ");
  }

  return {
    configure: configure, reset: reset,
    classify: classify, isArid: isArid,
    reading: reading, fallbackFor: fallbackFor,
    buildUrl: buildUrl, parseBatch: parseBatch,
    load: load, get: get, readingFor: readingFor,
    isStale: isStale, summarise: summarise,
    CODES: CODES, FIELDS: FIELDS, ENDPOINT: ENDPOINT
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Live;
