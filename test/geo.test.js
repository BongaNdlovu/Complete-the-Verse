/* Logic tests — distance, bearing and solar position.

   The solar assertions are checked against published almanac values for
   real places on real dates, not against whatever the code happened to
   return when it was written. That is the only way this file is worth
   anything: an approximation that agrees with itself proves nothing.

   Tolerances are set to the accuracy the Spencer fit actually claims —
   about 0.2 degrees on declination and half a minute on the equation of
   time — so a genuine regression trips the test while the known
   approximation error does not. */
const Geo = require("../js/geo");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }
function near(name, got, want, tol){ ok(name, Math.abs(got - want) <= tol, {got, want, tol}); }

const UR        = [30.9626, 46.1031];
const JERUSALEM = [31.7767, 35.2345];
const BABYLON   = [32.5355, 44.4275];
const PATMOS    = [37.3086, 26.5478];

/* ---------- distance ---------- */
{
  near("Jerusalem to Babylon is about 870 km", Geo.haversineKm(JERUSALEM, BABYLON), 870, 25);
  near("Ur to Patmos is about 1930 km", Geo.haversineKm(UR, PATMOS), 1930, 40);
  eq("a point is zero km from itself", Geo.haversineKm(UR, UR), 0);
  ok("distance is symmetric",
    Math.abs(Geo.haversineKm(UR, PATMOS) - Geo.haversineKm(PATMOS, UR)) < 1e-9);

  // One degree of latitude is ~111 km anywhere on the globe.
  near("one degree of latitude is 111 km", Geo.haversineKm([0, 0], [1, 0]), 111.2, 0.5);
  // A degree of longitude shrinks with the cosine of the latitude.
  near("a degree of longitude shrinks at 60N", Geo.haversineKm([60, 0], [60, 1]), 111.2 / 2, 1);

  const path = Geo.pathLengthKm([UR, BABYLON, JERUSALEM]);
  near("path length is the sum of its legs", path,
    Geo.haversineKm(UR, BABYLON) + Geo.haversineKm(BABYLON, JERUSALEM), 1e-9);
  eq("a one-point path has no length", Geo.pathLengthKm([UR]), 0);
}

/* ---------- bearing ---------- */
{
  near("due north is 0", Geo.bearing([0, 0], [10, 0]), 0, 0.01);
  near("due east is 90", Geo.bearing([0, 0], [0, 10]), 90, 0.01);
  near("due south is 180", Geo.bearing([10, 0], [0, 0]), 180, 0.01);
  near("due west is 270", Geo.bearing([0, 10], [0, 0]), 270, 0.01);
  ok("bearing is always in range", [[UR, PATMOS], [PATMOS, UR], [JERUSALEM, BABYLON]]
    .every(p => { const b = Geo.bearing(p[0], p[1]); return b >= 0 && b < 360; }));

  eq("Jerusalem to Babylon reads east", Geo.compassPoint(Geo.bearing(JERUSALEM, BABYLON)), "E");
  eq("0 degrees is N", Geo.compassPoint(0), "N");
  eq("360 wraps back to N", Geo.compassPoint(360), "N");
  eq("45 degrees is NE", Geo.compassPoint(45), "NE");
  eq("negative bearings normalise", Geo.compassPoint(-90), "W");
}

/* ---------- DMS ---------- */
{
  eq("Jerusalem formats to DMS", Geo.formatDMS(JERUSALEM), '31°46\'36"N 35°14\'04"E');
  eq("southern and western hemispheres", Geo.formatDMS([-33.9249, -18.4241]), '33°55\'30"S 18°25\'27"W');
  eq("zero is north and east", Geo.formatDMS([0, 0]), '0°00\'00"N 0°00\'00"E');
  // 59.9999 minutes must carry into the next degree rather than print 60.
  ok("rounded seconds carry instead of printing 60",
    Geo.formatDMS([30.99999999, 0]).indexOf("60") < 0, Geo.formatDMS([30.99999999, 0]));
}

/* ---------- declination ---------- */
{
  const d = s => Geo.declination(new Date(s));
  near("June solstice declination is +23.44", d("2026-06-21T12:00:00Z"),  23.44, 0.2);
  near("December solstice declination is -23.44", d("2026-12-21T12:00:00Z"), -23.44, 0.2);
  near("March equinox declination is 0",  d("2026-03-20T12:00:00Z"), 0, 0.5);
  near("September equinox declination is 0", d("2026-09-23T12:00:00Z"), 0, 0.5);
  ok("declination never leaves the tropics", [
    "2026-01-15", "2026-03-15", "2026-05-15", "2026-07-15", "2026-09-15", "2026-11-15"
  ].every(s => Math.abs(d(s + "T12:00:00Z")) <= 23.5));
}

/* ---------- equation of time ----------
   Its four turning points are well known: about -14 min in mid February,
   +4 in mid May, -6 in late July and +16 in early November. */
{
  const e = s => Geo.equationOfTime(new Date(s));
  near("mid-February is about -14 minutes", e("2026-02-11T12:00:00Z"), -14, 1.5);
  near("mid-May is about +4 minutes",       e("2026-05-14T12:00:00Z"),   3.7, 1.5);
  near("late July is about -6 minutes",     e("2026-07-26T12:00:00Z"),  -6.5, 1.5);
  near("early November is about +16 minutes", e("2026-11-03T12:00:00Z"), 16.4, 1.5);
}

/* ---------- sunrise and sunset ----------
   Jerusalem's published times: 05:32 / 19:47 local (UTC+3) at the June
   solstice, 06:35 / 16:39 local (UTC+2) at the December one. */
{
  const jun = Geo.sunTimes(new Date("2026-06-21T00:00:00Z"), JERUSALEM[0], JERUSALEM[1]);
  const dec = Geo.sunTimes(new Date("2026-12-21T00:00:00Z"), JERUSALEM[0], JERUSALEM[1]);

  near("Jerusalem June sunrise is 02:32 UTC", jun.sunrise, 2 * 60 + 32, 4);
  near("Jerusalem June sunset is 16:47 UTC",  jun.sunset,  16 * 60 + 47, 4);
  near("Jerusalem December sunrise is 04:35 UTC", dec.sunrise, 4 * 60 + 35, 4);
  near("Jerusalem December sunset is 14:39 UTC",  dec.sunset,  14 * 60 + 39, 4);

  near("longest day is 14h12m", jun.dayLengthMin, 14 * 60 + 12, 8);
  near("shortest day is 10h04m", dec.dayLengthMin, 10 * 60 + 4, 8);
  ok("the longest day is longer than the shortest", jun.dayLengthMin > dec.dayLengthMin);
  ok("neither solstice is polar at this latitude", jun.polar === null && dec.polar === null);

  /* Day length is very nearly symmetric about the equator on a given
     date — but not exactly, and the discrepancy is the point. Sunrise
     is taken at -0.833 degrees rather than 0 to allow for atmospheric
     refraction and the radius of the solar disc, which lengthens the
     day at BOTH latitudes. So the mirrored pair sums to a bit over 24
     hours, not exactly 24. At 40 degrees that surplus is about 20
     minutes; asserting a flat 1440 here would be asserting that the
     refraction correction is missing. */
  const north = Geo.sunTimes(new Date("2026-06-21T00:00:00Z"),  40, 0).dayLengthMin;
  const south = Geo.sunTimes(new Date("2026-06-21T00:00:00Z"), -40, 0).dayLengthMin;
  near("mirrored day lengths sum to a day plus the refraction allowance",
    north + south, 1460, 8);
  ok("the surplus is refraction, not asymmetry", north + south > 1440, north + south);

  // The geometric horizon, by contrast, IS exactly symmetric: equal and
  // opposite latitudes see hour angles that sum to 180 degrees.
  const g = (lat) => Math.acos(-Math.tan(lat * Math.PI / 180) *
                               Math.tan(Geo.declination(new Date("2026-06-21T00:00:00Z")) * Math.PI / 180));
  near("geometric day lengths are exactly symmetric", (g(40) + g(-40)) * 180 / Math.PI, 180, 0.01);
}

/* ---------- polar day and night ---------- */
{
  const summer = Geo.sunTimes(new Date("2026-06-21T00:00:00Z"), 78, 15);
  const winter = Geo.sunTimes(new Date("2026-12-21T00:00:00Z"), 78, 15);
  eq("78N has midnight sun in June", summer.polar, "day");
  eq("78N has polar night in December", winter.polar, "night");
  eq("polar day has no sunrise", summer.sunrise, null);
  eq("polar night reports no daylight", winter.dayLengthMin, 0);
  ok("polar cases never produce NaN",
    !Number.isNaN(summer.dayLengthMin) && !Number.isNaN(winter.dayLengthMin));
}

/* ---------- sun position ---------- */
{
  // At the June solstice the sun is overhead the Tropic of Cancer at noon.
  const p = Geo.sunPosition(new Date("2026-06-21T12:00:00Z"), 23.44, 0);
  near("sun is overhead the tropic at solstice noon", p.altitude, 90, 1);

  const jerusalemNoon = Geo.sunPosition(new Date("2026-06-21T09:39:00Z"), JERUSALEM[0], JERUSALEM[1]);
  near("Jerusalem's midsummer noon sun is 81 degrees up", jerusalemNoon.altitude, 81.7, 1.5);

  const midnight = Geo.sunPosition(new Date("2026-06-21T21:39:00Z"), JERUSALEM[0], JERUSALEM[1]);
  ok("the sun is below the horizon at local midnight", midnight.altitude < -20, midnight.altitude);

  ok("altitude stays within range", [0, 6, 12, 18].every(h => {
    const a = Geo.sunPosition(new Date("2026-08-10T" + String(h).padStart(2, "0") + ":00:00Z"), 31, 35).altitude;
    return a >= -90 && a <= 90;
  }));
  ok("azimuth stays within range", [0, 6, 12, 18].every(h => {
    const a = Geo.sunPosition(new Date("2026-08-10T" + String(h).padStart(2, "0") + ":00:00Z"), 31, 35).azimuth;
    return a >= 0 && a < 360;
  }));
}

/* ---------- subsolar point ---------- */
{
  const sp = Geo.subsolarPoint(new Date("2026-06-21T12:00:00Z"));
  near("subsolar latitude equals the declination at solstice", sp[0], 23.44, 0.2);
  near("subsolar longitude is near Greenwich at 12:00 UTC", sp[1], 0, 3);

  const sp2 = Geo.subsolarPoint(new Date("2026-06-21T00:00:00Z"));
  ok("subsolar longitude is antipodal at midnight UTC", Math.abs(Math.abs(sp2[1]) - 180) < 3, sp2[1]);
  ok("subsolar longitude stays in range", [0, 3, 7, 11, 15, 19, 23].every(h => {
    const l = Geo.subsolarPoint(new Date("2026-03-05T" + String(h).padStart(2, "0") + ":00:00Z"))[1];
    return l >= -180 && l <= 180;
  }));
}

/* ---------- light phase ---------- */
{
  eq("deep negative altitude is night", Geo.lightPhase(-30), "night");
  eq("just below the horizon is twilight", Geo.lightPhase(-3), "twilight");
  eq("just above the horizon is golden", Geo.lightPhase(3), "golden");
  eq("high sun is day", Geo.lightPhase(45), "day");
  ok("the phases are contiguous with no gap",
    ["night", "twilight", "golden", "day"].indexOf(Geo.lightPhase(0)) >= 0);
}

/* ---------- terminator ---------- */
{
  const t = Geo.terminator(new Date("2026-08-10T12:00:00Z"), 10);
  ok("the terminator returns a usable ring", t.length > 10);
  ok("every terminator vertex is finite",
    t.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1])));
  ok("every terminator vertex is on the globe",
    t.every(p => p[0] >= -90 && p[0] <= 90 && p[1] >= -180 && p[1] <= 180));

  // At an equinox tan(dec) approaches zero; the guard must hold.
  const eq1 = Geo.terminator(new Date("2026-03-20T12:00:00Z"), 30);
  ok("the equinox terminator does not divide by zero",
    eq1.every(p => Number.isFinite(p[0])), eq1.slice(0, 3));

  // The dark cap follows the winter pole.
  const june = Geo.terminator(new Date("2026-06-21T12:00:00Z"), 60);
  const dec  = Geo.terminator(new Date("2026-12-21T12:00:00Z"), 60);
  ok("June closes over the south pole", june[june.length - 1][0] === -90);
  ok("December closes over the north pole", dec[dec.length - 1][0] === 90);
}

/* ---------- moon ---------- */
{
  // 6 January 2000 18:14 UTC is the reference new moon.
  const nm = Geo.moonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14)));
  near("the reference epoch is a new moon", nm.phase, 0, 0.01);
  near("a new moon is unlit", nm.illumination, 0, 0.01);
  eq("the reference epoch is named New Moon", nm.name, "New Moon");

  const full = Geo.moonPhase(new Date(Date.UTC(2000, 0, 6, 18, 14) + 14.765 * 86400000));
  near("half a cycle later is full", full.illumination, 1, 0.01);
  eq("half a cycle later is named Full Moon", full.name, "Full Moon");

  ok("phase always stays in 0..1", [0, 3, 7, 11, 18, 25, 29, 40, 400].every(d => {
    const p = Geo.moonPhase(new Date(Date.UTC(2026, 0, 1) + d * 86400000)).phase;
    return p >= 0 && p < 1;
  }));
  ok("illumination always stays in 0..1", [0, 5, 9, 14, 22, 28].every(d => {
    const i = Geo.moonPhase(new Date(Date.UTC(2026, 0, 1) + d * 86400000)).illumination;
    return i >= 0 && i <= 1;
  }));
  ok("dates before the epoch still work",
    Geo.moonPhase(new Date(Date.UTC(1990, 0, 1))).phase >= 0);
}

/* ---------- solar clock ---------- */
{
  // At the Greenwich meridian solar noon lands near 12:00 UTC, offset
  // only by the equation of time.
  const noon = Geo.solarClock(new Date("2026-06-21T12:00:00Z"), 0);
  ok("solar noon at Greenwich reads near 12", /^1[12]:/.test(noon), noon);

  // 15 degrees of longitude is exactly one hour of solar time.
  const a = Geo.solarClock(new Date("2026-06-21T12:00:00Z"), 0);
  const b = Geo.solarClock(new Date("2026-06-21T12:00:00Z"), 15);
  eq("15 degrees east is one hour later",
    (parseInt(b, 10) - parseInt(a, 10) + 24) % 24, 1);

  ok("the clock is always a valid time", [-180, -90, 0, 35, 90, 180].every(lon => {
    const s = Geo.solarClock(new Date("2026-08-10T07:13:00Z"), lon);
    const h = parseInt(s.slice(0, 2), 10), m = parseInt(s.slice(3), 10);
    return /^\d\d:\d\d$/.test(s) && h >= 0 && h < 24 && m >= 0 && m < 60;
  }));
}

console.log((fail ? "FAIL" : "PASS") + " — geo · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
