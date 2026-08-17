/* Structure tests — the map view.

   atlas.js is the one Pilgrimage file that touches the DOM and Leaflet,
   so it is exercised against a hand-rolled stub of both rather than
   jsdom (see scripts/load-atlas.js — the project has no package.json
   and is worth keeping install-free). The stub records what was drawn,
   which is what these assertions read.

   The properties worth defending here are the ones a player would
   notice and a unit test of the pure modules cannot see: that a locked
   site never leaks its name, that the map still works with no map
   library at all, and that progress actually repaints. */
const { loadAtlas } = require("./scripts/load-atlas");
const { loadBank } = require("./scripts/load-bank");

const VERSES = loadBank().VERSES;

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

/* Every load() starts a terminator interval, and Node will not exit
   while one is pending — so every atlas opened here is unmounted. */
const opened = [];
function open(opts){
  const a = loadAtlas(Object.assign({verses: VERSES}, opts || {}));
  opened.push(a);
  return a;
}
function cleanup(){ opened.forEach(a => { try { a.Atlas.unmount(); } catch(e){} }); }
function siteMarkerCount(a){
  return a.log.markers.filter(m => {
    const opts = m._args && m._args[1];
    const icon = opts && opts.icon;
    const cls = (icon && icon._icon && icon._icon.className) || "";
    return cls.indexOf("traveler") < 0;
  }).length;
}

/* Clear the first n sites. */
function walkTo(P, n){
  let p = P.blankProgress();
  for(let i = 0; i < n; i++){
    p = P.record(p, P.siteAt(i).id, {cleared: true, score: 100, accuracy: 90, at: 1});
  }
  return p;
}

/* ---------- mounting ---------- */
{
  const a = open();
  a.Atlas.mount(a.Pilgrimage.blankProgress());

  eq("exactly one map is built", a.log.maps.length, 1);
  ok("the satellite plate is laid down", a.log.tiles.length >= 1);
  ok("the imagery comes from a real tile service",
    a.log.tiles.some(t => /^https:\/\//.test(t._args[0])));
  eq("one marker per site", siteMarkerCount(a), a.SITES.length);
  ok("the routes are drawn", a.log.lines.length > 0);

  /* A Leaflet map built inside a display:none view measures 0x0 and
     renders one grey tile forever. mount() must re-measure. */
  ok("the map is re-measured after the view is shown", a.log.invalidate >= 1);

  ok("the map opens on the home view",
    a.log.maps[0]._opts.center === a.HOME_VIEW.center);
  ok("zoom is bounded", a.log.maps[0]._opts.minZoom >= 3 && a.log.maps[0]._opts.maxZoom <= 12);

  // Re-entering the view must re-measure but not rebuild: a second map
  // or a second set of markers would stack pins on every visit.
  a.Atlas.mount(a.Pilgrimage.blankProgress());
  eq("mounting twice does not build a second map", a.log.maps.length, 1);
  eq("nor does it duplicate the markers", siteMarkerCount(a), a.SITES.length);
  ok("but it does re-measure again", a.log.invalidate >= 2);
}

/* ---------- no Leaflet at all ---------- */
{
  const a = open({noLeaflet: true});
  let threw = false;
  try { a.Atlas.mount(a.Pilgrimage.blankProgress()); } catch(e){ threw = true; console.log("    " + e.message); }

  ok("a missing map library does not throw", !threw);
  ok("and the atlas knows it has no map", !a.Atlas.hasMap());

  /* The rail is a complete level select on its own, which is what makes
     the campaign playable with no map at all. */
  const rail = a.doc.getElementById("atlas-rail-list").innerHTML;
  ok("the journey list still renders", rail.length > 0);
  ok("every site is still listed",
    a.SITES.every(s => rail.indexOf('data-site="' + s.id + '"') >= 0));
  ok("the dossier still renders", a.doc.getElementById("atlas-doss-body").innerHTML.length > 0);
  ok("the player is told why", a.doc.getElementById("atlas-note").textContent.length > 0);

  // And every navigation call must still be safe.
  let threw2 = false;
  try {
    a.Atlas.select("babylon");
    a.Atlas.focus("patmos");
    a.Atlas.fitAll();
    a.Atlas.setLayer("empires");
    a.Atlas.refresh();
  } catch(e){ threw2 = true; console.log("    " + e.message); }
  ok("navigating without a map is safe", !threw2);
}

/* ---------- locked sites keep their secrets ---------- */
{
  const a = open();
  const P = a.Pilgrimage;
  a.Atlas.mount(P.blankProgress());

  const rail = a.doc.getElementById("atlas-rail-list").innerHTML;
  const locked = a.SITES.slice(1);

  /* A locked site must not reveal its name on the rail or on the map —
     the road ahead is meant to be unknown. */
  const leaked = locked.filter(s => rail.indexOf(s.name) >= 0);
  ok("no locked site leaks its name on the rail", leaked.length === 0,
    leaked.slice(0, 4).map(s => s.id));
  ok("the open site does show its name", rail.indexOf(a.SITES[0].name) >= 0);

  const markerHtml = a.SITES.map((s, i) =>
    a.Atlas._markerHtml(s, a.Atlas._stateOf(s), i + 1)).join("");
  const leakedPins = locked.filter(s => markerHtml.indexOf(s.name) >= 0);
  ok("no locked site leaks its name on the map", leakedPins.length === 0,
    leakedPins.slice(0, 4).map(s => s.id));

  // The dossier for a locked site names the gate, not the contents.
  a.Atlas.select("patmos");
  const doss = a.doc.getElementById("atlas-doss-body").innerHTML;
  ok("a locked dossier says it is sealed", doss.indexOf("Sealed") >= 0);
  ok("a locked dossier does not print the quote", doss.indexOf("new heaven") < 0);
  ok("a locked dossier names the site that opens it", doss.indexOf("ROME") >= 0);
}

/* ---------- marker state ---------- */
{
  const a = open();
  const P = a.Pilgrimage;
  a.Atlas.mount(walkTo(P, 3));

  const st = id => a.Atlas._stateOf(P.site(id));
  ok("a cleared site reads cleared", st("ur").cleared);
  ok("a cleared site is not the current one", !st("ur").current);
  ok("the next site is current", st("bethel").current);
  ok("the current site is unlocked", st("bethel").unlocked);
  ok("the site after it is locked", st("hebron").locked);
  ok("a far site is locked", st("patmos").locked);

  const rail = a.doc.getElementById("atlas-rail-list").innerHTML;
  ok("cleared sites are marked on the rail", rail.indexOf("cleared") >= 0);
  ok("the current site is marked on the rail", rail.indexOf("current") >= 0);
  ok("locked sites are marked on the rail", rail.indexOf("locked") >= 0);
  eq("progress is counted", a.doc.getElementById("atlas-count").textContent,
    "3 of " + a.SITES.length + " sites");
}

/* ---------- progress repaints ---------- */
{
  const a = open();
  const P = a.Pilgrimage;
  a.Atlas.mount(P.blankProgress());
  eq("nothing cleared at the start", a.doc.getElementById("atlas-count").textContent,
    "0 of " + a.SITES.length + " sites");

  const linesBefore = a.log.lines.length;
  a.Atlas.refresh(walkTo(P, 6));
  eq("clearing sites updates the count", a.doc.getElementById("atlas-count").textContent,
    "6 of " + a.SITES.length + " sites");
  ok("the routes are redrawn", a.log.lines.length > linesBefore);
  ok("the walked stretch is drawn as walked",
    a.log.lines.some(l => (l._args[1].className || "").indexOf("route-walked") >= 0));
  ok("the road ahead is drawn as ahead",
    a.log.lines.some(l => (l._args[1].className || "").indexOf("route-ahead") >= 0));

  const rail = a.doc.getElementById("atlas-rail-list").innerHTML;
  ok("a newly opened site now shows its name", rail.indexOf(a.SITES[6].name) >= 0);
}

/* ---------- selection and flight ---------- */
{
  const a = open();
  a.Atlas.mount(a.Pilgrimage.blankProgress());
  const before = a.log.flyTo;

  a.Atlas.select("ur");
  eq("selecting a site sets it active", a.Atlas.activeSite().id, "ur");
  ok("the dossier shows that site",
    a.doc.getElementById("atlas-doss-body").innerHTML.indexOf("UR OF THE CHALDEES") >= 0);
  ok("the map flies to it", a.log.flyTo > before);

  a.Atlas.focus("ur", {fly: false});
  ok("a non-flying focus does not animate", a.log.setView > 0);

  const map = a.log.maps[0];
  ok("the map ends up on the site's coordinates",
    map._center === a.Pilgrimage.site("ur").coords);

  a.Atlas.fitAll();
  ok("the whole road can be framed", a.log.fitBounds > 0);
  ok("focusing a stranger is safe", (() => {
    try { a.Atlas.focus("atlantis"); return true; } catch(e){ return false; }
  })());
}

/* ---------- reduced motion ---------- */
{
  const a = open({reducedMotion: true});
  a.Atlas.mount(a.Pilgrimage.blankProgress());
  const flights = a.log.flyTo;
  a.Atlas.select("babylon");
  eq("reduced motion never animates the camera", a.log.flyTo, flights);
  ok("it still arrives at the site", a.log.setView > 0);
  ok("the cold open is skipped entirely",
    a.doc.getElementById("atlas-open").classList.contains("gone"));
}

/* ---------- layers ---------- */
{
  const a = open();
  a.Atlas.mount(a.Pilgrimage.blankProgress());
  a.Atlas.select("babylon");

  ok("the era empire is drawn", a.log.polys.some(p => p._args[1].className === "empire-shape"));
  ok("the night side is drawn", a.log.polys.some(p => p._args[1].className === "terminator-shape"));

  const L = a.Atlas.layers();
  ok("routes start visible", L.routes);
  ok("empires start visible", L.empires);
  ok("night starts visible", L.terminator);
  ok("modern borders start hidden", !L.borders);

  a.Atlas.setLayer("borders", true);
  ok("borders can be switched on", a.Atlas.layers().borders);
  a.Atlas.setLayer("borders");
  ok("and toggled back off", !a.Atlas.layers().borders);

  a.Atlas.setLayer("empires", false);
  ok("empires can be switched off", !a.Atlas.layers().empires);
  a.Atlas.setLayer("routes", false);
  ok("routes can be switched off", !a.Atlas.layers().routes);

  ok("an unknown layer is ignored", (() => {
    try { a.Atlas.setLayer("nonsense", true); return true; } catch(e){ return false; }
  })());

  const tools = a.doc.getElementById("atlas-layers").innerHTML;
  ["routes", "empires", "borders", "terminator"].forEach(k =>
    ok("the " + k + " toggle is offered", tools.indexOf('data-layer="' + k + '"') >= 0));
}

/* ---------- light and weather grading ---------- */
{
  const a = open();
  a.Atlas.mount(a.Pilgrimage.blankProgress());
  a.Atlas.select("ur");

  const map = a.doc.getElementById("atlas-map");
  const phase = map.getAttribute("data-light");
  ok("the map is graded by the real sky over the site",
    ["night", "twilight", "golden", "day"].indexOf(phase) >= 0, phase);

  // With no live weather, a clear authored sky sets no override.
  eq("authored clear weather adds no override", map.getAttribute("data-sky"), null);
}

/* ---------- the dossier ---------- */
{
  const a = open();
  a.Atlas.mount(a.Pilgrimage.blankProgress());
  a.Atlas.select("ur");
  const d = a.doc.getElementById("atlas-doss-body").innerHTML;

  ok("the dossier carries the scripture quote", d.indexOf("Ur of the Chaldees") >= 0);
  ok("the dossier cites the reference", d.indexOf("Genesis 11:31") >= 0);
  ok("the dossier gives the archaeology", d.indexOf("Ziggurat") >= 0);
  ok("the dossier gives the modern country", d.indexOf("Iraq") >= 0);
  // The seconds mark comes through esc() as &quot; — correct escaping,
  // and it still renders as a double quote, so match either form.
  ok("the dossier gives the coordinates", /\d+°\d+'\d+(?:"|&quot;)[NS]/.test(d), d.slice(0, 200));
  ok("the dossier gives the elevation", d.indexOf("10 m") >= 0);
  ok("the dossier reports conditions", d.indexOf("Conditions now") >= 0);
  ok("conditions are labelled typical when not live", d.indexOf("Typical") >= 0);
  ok("the dossier gives local solar time", /\d\d:\d\d/.test(d));
  ok("the dossier gives the difficulty", d.indexOf("Tier") >= 0);

  const actions = a.doc.getElementById("atlas-doss-actions").innerHTML;
  ok("an open site can be begun", actions.indexOf('data-atlas="begin"') >= 0);
  ok("an unplayed site offers no recall replay", actions.indexOf('data-atlas="recall"') < 0);

  // A cleared site gains the typed replay.
  a.Atlas.refresh(walkTo(a.Pilgrimage, 1));
  a.Atlas.select("ur");
  const cleared = a.doc.getElementById("atlas-doss-actions").innerHTML;
  ok("a cleared site offers the typed replay", cleared.indexOf('data-atlas="recall"') >= 0);
  ok("a cleared site can be walked again", cleared.indexOf('data-atlas="begin"') >= 0);
  ok("a cleared site shows its record",
    a.doc.getElementById("atlas-doss-body").innerHTML.indexOf("Best score") >= 0);
}

/* ---------- hooks ---------- */
{
  const a = open();
  a.Atlas.mount(a.Pilgrimage.blankProgress());

  let began = null, recalled = null;
  a.Atlas.on("begin", id => { began = id; });
  a.Atlas.on("recall", id => { recalled = id; });

  a.Atlas.select("ur");
  const host = a.doc.getElementById("atlas-doss-actions");
  (host._found || []).filter(b => b.dataset.atlas === "begin").forEach(b => b.dispatch("click"));
  eq("beginning a site reports which one", began, "ur");

  a.Atlas.refresh(walkTo(a.Pilgrimage, 1));
  a.Atlas.select("ur");
  const host2 = a.doc.getElementById("atlas-doss-actions");
  (host2._found || []).filter(b => b.dataset.atlas === "recall").forEach(b => b.dispatch("click"));
  eq("the typed replay reports which site", recalled, "ur");

  ok("an unknown hook is ignored", (() => {
    try { a.Atlas.on("nonsense", () => {}); return true; } catch(e){ return false; }
  })());
}

/* ---------- elevation profile ---------- */
{
  const a = open();
  a.Atlas.mount(a.Pilgrimage.blankProgress());

  a.SITES.forEach(s => {
    const svg = a.Atlas._profileSvg(s);
    ok(s.id + " renders an elevation profile", svg.indexOf("<svg") >= 0);
    ok(s.id + " profile has no broken coordinates",
      svg.indexOf("NaN") < 0 && svg.indexOf("Infinity") < 0 && svg.indexOf("undefined") < 0,
      svg.slice(0, 120));
  });

  // Sinai at 2285 m and Jericho at -258 m share the Exodus leg, so that
  // profile must show a sea-level line.
  ok("a leg crossing sea level draws the sea line",
    a.Atlas._profileSvg(a.Pilgrimage.site("jericho")).indexOf("prof-sea") >= 0);
  ok("the active site is marked on its profile",
    a.Atlas._profileSvg(a.Pilgrimage.site("sinai")).indexOf("prof-node on") >= 0);
}

/* ---------- route splitting ---------- */
{
  const a = open();
  const P = a.Pilgrimage;
  const coords = a.ROUTES.patriarchs.coords;

  eq("the first waypoint is nearest Ur", a.Atlas._nearestWaypoint(coords, P.site("ur").coords), 0);
  eq("the last waypoint is nearest Dothan",
    a.Atlas._nearestWaypoint(coords, P.site("dothan").coords), coords.length - 1);

  // The split index must advance as sites are cleared, never jump back.
  const legs = P.sitesInArc("patriarchs");
  const idx = legs.map(s => a.Atlas._nearestWaypoint(coords, s.coords));
  ok("waypoints advance with the journey",
    idx.every((v, i) => i === 0 || v >= idx[i - 1]), idx);
}

/* ---------- pilgrim follows the painted road ---------- */
{
  const a = open();
  const P = a.Pilgrimage;
  const ur = P.site("ur").coords;
  const haran = P.site("haran").coords;
  const beersheba = P.site("beersheba").coords;
  const road = a.Atlas._fullRoad();
  ok("the joined road is longer than one arc", road.length > a.ROUTES.patriarchs.coords.length);

  const forth = a.Atlas._pathBetween(ur, haran);
  const back = a.Atlas._pathBetween(haran, ur);
  ok("Ur→Haran uses intermediate waypoints, not a cut", forth.length > 3, forth.length);
  eq("the walk starts on Ur", forth[0][0], ur[0]);
  eq("the walk ends on Haran", forth[forth.length - 1][0], haran[0]);
  eq("the return trip has the same number of vertices", back.length, forth.length);
  eq("the return trip starts on Haran", back[0][0], haran[0]);

  const long = a.Atlas._pathBetween(ur, beersheba);
  ok("a longer hop has more road than Ur→Haran", long.length > forth.length, { long: long.length, forth: forth.length });

  const mid = a.Atlas._polylineAt(forth, 0);
  const end = a.Atlas._polylineAt(forth, 1e9);
  eq("distance 0 is the start", mid[0], ur[0]);
  eq("past the end is the last vertex", end[0], haran[0]);

  const shortMs = a.Atlas._durationForPath(forth);
  const longMs = a.Atlas._durationForPath(long);
  ok("a short hop is at least 1.4s", shortMs >= 1400, shortMs);
  ok("a short hop is well under the old 5.5s crawl", shortMs < 5500, shortMs);
  ok("a longer hop takes longer or hits the cap", longMs >= shortMs, { longMs, shortMs });
  ok("no hop exceeds 5.2s", longMs <= 5200, longMs);

  const src = require("fs").readFileSync(require("path").join(__dirname, "js", "atlas.js"), "utf8");
  ok("select walks along pathBetween, not a two-point lerp",
    /pathBetween\(startPt, to\.coords\)/.test(src));
  ok("select does not fly the camera away from a walking pilgrim",
    /willWalk \? \{ fly: false \}/.test(src));
}

/* ---------- an untouched map does no work ---------- */
{
  const a = open();
  a.Atlas.mount(a.Pilgrimage.blankProgress());
  a.Atlas.unmount();
  const polys = a.log.polys.length;
  // Once unmounted, the terminator clock must stop redrawing.
  ok("unmounting stops the night clock", a.log.polys.length === polys);
}

cleanup();
console.log((fail ? "FAIL" : "PASS") + " — atlas · " + pass + " assertions passed" +
  (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
