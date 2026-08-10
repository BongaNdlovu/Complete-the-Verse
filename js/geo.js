/* ==================================================================
   GEO — distance, bearing, and where the sun actually is.

   This is the half of "real time" that cannot fail. Weather needs a
   network and a third party that may be down, rate-limited or blocked;
   the position of the sun over Ur right now needs nothing but the
   clock. So the campaign leans on this for its lighting and treats
   live weather as a bonus that may never arrive.

   The solar maths is the NOAA/Spencer approximation: declination good
   to about 0.2 degrees and the equation of time to about half a
   minute. That is far past what a map terminator or a choice between
   four colour gradings can perceive, and it costs no network call and
   no dependency.

   Everything here is pure. Every function that needs the time takes it
   as an argument rather than reading the clock itself, so the tests can
   pin a date and assert against published almanac values.
   ================================================================== */

var Geo = (function () {

  var R_EARTH = 6371;                 // km, mean radius
  var RAD = Math.PI / 180;
  var DEG = 180 / Math.PI;
  var SYNODIC = 29.530588853;         // days, mean lunar month

  function norm360(d) { return ((d % 360) + 360) % 360; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ------------------------------ distance ------------------------------ */

  function haversineKm(a, b) {
    var dLat = (b[0] - a[0]) * RAD;
    var dLon = (b[1] - a[1]) * RAD;
    var la1 = a[0] * RAD, la2 = b[0] * RAD;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(la1) * Math.cos(la2);
    return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /* Total length of a polyline, in km. Used for "how far is this leg". */
  function pathLengthKm(coords) {
    var total = 0;
    for (var i = 1; i < coords.length; i++) total += haversineKm(coords[i - 1], coords[i]);
    return total;
  }

  function bearing(a, b) {
    var la1 = a[0] * RAD, la2 = b[0] * RAD;
    var dLon = (b[1] - a[1]) * RAD;
    var y = Math.sin(dLon) * Math.cos(la2);
    var x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
    return norm360(Math.atan2(y, x) * DEG);
  }

  var POINTS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  function compassPoint(deg) {
    return POINTS[Math.round(norm360(deg) / 22.5) % 16];
  }

  function formatDMS(coords) {
    function one(v, pos, neg) {
      var hemi = v >= 0 ? pos : neg;
      var abs = Math.abs(v);
      var d = Math.floor(abs);
      var mFull = (abs - d) * 60;
      var m = Math.floor(mFull);
      var s = Math.round((mFull - m) * 60);
      // Rounding seconds to 60 has to carry, or you get readings like 31°46'60".
      if (s === 60) { s = 0; m += 1; }
      if (m === 60) { m = 0; d += 1; }
      return d + "°" + String(m).padStart(2, "0") + "'" + String(s).padStart(2, "0") + '"' + hemi;
    }
    return one(coords[0], "N", "S") + " " + one(coords[1], "E", "W");
  }

  /* ------------------------------ solar ------------------------------ */

  /* Fractional day of the year, including the time of day. */
  function dayOfYear(date) {
    var start = Date.UTC(date.getUTCFullYear(), 0, 1);
    return (date.getTime() - start) / 86400000;
  }

  /* Spencer's Fourier fit. `gamma` is the fractional year in radians. */
  function gammaOf(date) {
    var days = dayOfYear(date);
    var yearLen = ((date.getUTCFullYear() % 4 === 0 && date.getUTCFullYear() % 100 !== 0) ||
                   date.getUTCFullYear() % 400 === 0) ? 366 : 365;
    return 2 * Math.PI / yearLen * days;
  }

  /* Solar declination in degrees — the latitude the sun is directly over. */
  function declination(date) {
    var g = gammaOf(date);
    return DEG * (0.006918
      - 0.399912 * Math.cos(g)     + 0.070257 * Math.sin(g)
      - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
      - 0.002697 * Math.cos(3 * g) + 0.001480 * Math.sin(3 * g));
  }

  /* Equation of time in minutes: true solar time minus mean solar time. */
  function equationOfTime(date) {
    var g = gammaOf(date);
    return 229.18 * (0.000075
      + 0.001868 * Math.cos(g)     - 0.032077 * Math.sin(g)
      - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  }

  function utcMinutes(date) {
    return date.getUTCHours() * 60 + date.getUTCMinutes() +
           date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60000;
  }

  /* True solar time at a longitude, in minutes past local solar midnight. */
  function trueSolarMinutes(date, lon) {
    var t = utcMinutes(date) + equationOfTime(date) + 4 * lon;
    return ((t % 1440) + 1440) % 1440;
  }

  /* Hour angle in degrees: 0 at local solar noon, negative in the
     morning, positive in the afternoon. */
  function hourAngle(date, lon) {
    return trueSolarMinutes(date, lon) / 4 - 180;
  }

  /* The point on earth the sun is directly overhead right now. */
  function subsolarPoint(date) {
    var lon = -15 * (utcMinutes(date) / 60 + equationOfTime(date) / 60 - 12);
    lon = ((lon + 540) % 360) - 180;
    return [declination(date), lon];
  }

  /* Altitude and azimuth of the sun as seen from a site. Altitude is
     degrees above the horizon (negative below); azimuth is degrees
     clockwise from true north. */
  function sunPosition(date, lat, lon) {
    var d = declination(date) * RAD;
    var h = hourAngle(date, lon) * RAD;
    var p = lat * RAD;

    var sinAlt = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(h);
    var alt = Math.asin(clamp(sinAlt, -1, 1));

    var az = Math.atan2(
      Math.sin(h),
      Math.cos(h) * Math.sin(p) - Math.tan(d) * Math.cos(p)
    );

    return {
      altitude: alt * DEG,
      azimuth: norm360(az * DEG + 180),
      declination: d * DEG,
      hourAngle: h * DEG
    };
  }

  /* Sunrise and sunset as minutes past UTC midnight, using the standard
     -0.833 degree horizon (refraction plus the solar disc). Returns
     `null` for both when the sun never crosses — polar day or night —
     which the Aegean and Mesopotamia never see, but the maths should
     still not produce a NaN if someone points this at Patmos in a
     hypothetical or at a test latitude. */
  function sunTimes(date, lat, lon) {
    var d = declination(date) * RAD;
    var p = lat * RAD;
    var cosH0 = (Math.cos(90.833 * RAD) - Math.sin(p) * Math.sin(d)) /
                (Math.cos(p) * Math.cos(d));

    if (cosH0 > 1)  return { sunrise: null, sunset: null, dayLengthMin: 0,    polar: "night" };
    if (cosH0 < -1) return { sunrise: null, sunset: null, dayLengthMin: 1440, polar: "day" };

    var h0 = Math.acos(cosH0) * DEG;            // degrees of hour angle
    var noon = 720 - 4 * lon - equationOfTime(date);
    return {
      sunrise: ((noon - 4 * h0) % 1440 + 1440) % 1440,
      sunset:  ((noon + 4 * h0) % 1440 + 1440) % 1440,
      solarNoon: ((noon % 1440) + 1440) % 1440,
      dayLengthMin: 8 * h0,
      polar: null
    };
  }

  /* Which of the atlas gradings the site's real sky should be wearing.
     These thresholds are the photographic ones: civil twilight ends at
     -6, the golden hour runs to about +6, and everything above that is
     flat daylight. */
  function lightPhase(altitudeDeg) {
    if (altitudeDeg < -6)  return "night";
    if (altitudeDeg < 0.5) return "twilight";
    if (altitudeDeg < 6)   return "golden";
    return "day";
  }

  /* The night-side polygon. For a given longitude the terminator sits at
     the latitude where the sun's altitude is exactly zero:
        tan(lat) = -cos(H) / tan(dec)
     Walking that around the globe and closing the ring at whichever pole
     is currently dark gives a polygon that can be filled straight onto
     the map. `step` is degrees of longitude between vertices. */
  function terminator(date, step) {
    step = step || 2;
    var dec = declination(date);
    var decR = dec * RAD;
    var pts = [];

    for (var lon = -180; lon <= 180; lon += step) {
      var h = hourAngle(date, lon) * RAD;
      // tan(dec) -> 0 at the equinox, so guard the division.
      var t = Math.tan(decR);
      var lat = Math.abs(t) < 1e-9
        ? (Math.cos(h) > 0 ? -89.9 : 89.9)
        : Math.atan(-Math.cos(h) / t) * DEG;
      pts.push([clamp(lat, -89.9, 89.9), lon]);
    }

    // Close the ring over the pole that is in darkness: in northern
    // summer (dec > 0) the south pole is dark, and the other way round.
    var capLat = dec > 0 ? -90 : 90;
    pts.push([capLat, 180]);
    pts.push([capLat, -180]);

    return pts;
  }

  /* ------------------------------ moon ------------------------------ */

  /* Days since the new moon of 6 January 2000, 18:14 UTC. */
  var NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14, 0);

  var MOON_NAMES = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
                    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

  function moonPhase(date) {
    var days = (date.getTime() - NEW_MOON_EPOCH) / 86400000;
    var phase = ((days / SYNODIC) % 1 + 1) % 1;          // 0 new, 0.5 full
    // Illuminated fraction of the disc.
    var illum = (1 - Math.cos(2 * Math.PI * phase)) / 2;
    // Eight named phases, each centred on its eighth of the cycle.
    var idx = Math.floor((phase + 1 / 16) * 8) % 8;
    return { phase: phase, illumination: illum, name: MOON_NAMES[idx] };
  }

  /* ------------------------------ local time ------------------------------ */

  /* Apparent local solar time at a site, as "HH:MM". This is sundial
     time, not the civil time zone — which is the honest thing to show
     next to an ancient site, since the timezone is a modern invention
     and the sun over the ruin is not. */
  function solarClock(date, lon) {
    var mins = trueSolarMinutes(date, lon);
    var h = Math.floor(mins / 60) % 24;
    var m = Math.floor(mins % 60);
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  return {
    R_EARTH: R_EARTH,
    haversineKm: haversineKm,
    pathLengthKm: pathLengthKm,
    bearing: bearing,
    compassPoint: compassPoint,
    formatDMS: formatDMS,
    declination: declination,
    equationOfTime: equationOfTime,
    hourAngle: hourAngle,
    subsolarPoint: subsolarPoint,
    sunPosition: sunPosition,
    sunTimes: sunTimes,
    lightPhase: lightPhase,
    terminator: terminator,
    moonPhase: moonPhase,
    solarClock: solarClock
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Geo;
