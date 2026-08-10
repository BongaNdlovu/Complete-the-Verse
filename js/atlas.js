/* ==================================================================
   ATLAS — the map, and everything drawn on it.

   Reads from sites.js (where the places are), pilgrimage.js (which are
   open), geo.js (where the sun is) and live.js (what the weather is
   doing). Owns no rules of its own: if you want to change what unlocks
   a site, change pilgrimage.js, not this file.

   Three things worth knowing before editing:

   1. Leaflet is optional at runtime. The vendored copy is local so it
      should always be there, but if `L` is missing — a blocked file, a
      broken copy — the atlas does not throw and does not white-screen.
      The rail on the left is a complete level select on its own, so the
      campaign stays fully playable with no map at all. Everything that
      touches `L` goes through hasMap().

   2. A Leaflet map built inside a `display:none` view measures 0x0 and
      renders one grey tile forever. The view has to be shown first and
      `invalidateSize()` called after. That is what mount() is for, and
      why it is called on entering the view rather than at load.

   3. Marker icons are 0x0 divs anchored at [0,0]. That makes the icon's
      origin the coordinate itself, so the dot, the label and the pulse
      all hang off the true point instead of drifting from it at
      different zooms.
   ================================================================== */

var Atlas = (function () {

  var SAT_URL    = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  /* Real, accurate national borders and place names, from the same
     provider as the imagery. Hand-drawn modern borders would have been
     a lie; these are surveyed. The empire overlays are the schematic
     layer and are labelled as such. */
  var BORDER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
  var OSM_URL    = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  var map = null, satLayer = null, borderLayer = null, osmLayer = null;
  var built = false, tileErrors = 0, osmAdded = false;
  var markers = {};            // siteId -> L.Marker
  var routeLayers = [];
  var empireLayer = null, terminatorLayer = null;
  var activeId = null, progress = null;
  var hooks = { begin: null, recall: null, relay: null, exit: null };
  var termTimer = null, noteTimer = null;
  var layers = { routes: true, empires: true, borders: false, terminator: true };
  var coldOpenDone = false;

  var $ = function (id) { return document.getElementById(id); };
  function reduced() {
    return document.body.classList.contains("reduced") ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function hasMap() { return !!(map && typeof L !== "undefined"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
    });
  }
  function sfx(name) {
    if (typeof Snd === "undefined") return;
    try { if (Snd[name]) Snd[name](); } catch (e) {}
  }

  /* ------------------------------ state ------------------------------ */

  function setProgress(p) { progress = p || Pilgrimage.blankProgress(); }
  function on(evt, fn) { if (evt in hooks) hooks[evt] = fn; }

  function stateOf(site) {
    var cleared = Pilgrimage.isCleared(progress, site.id);
    var unlocked = Pilgrimage.isUnlocked(progress, site.id);
    var current = Pilgrimage.currentSite(progress);
    var rec = Pilgrimage.recordOf(progress, site.id);
    return {
      cleared: cleared,
      unlocked: unlocked,
      locked: !unlocked,
      current: !!(current && current.id === site.id && !cleared),
      perfect: !!(rec && rec.perfect),
      active: activeId === site.id
    };
  }

  /* ------------------------------ the map ------------------------------ */

  function buildMap() {
    if (built || typeof L === "undefined") return;
    var host = $("atlas-map");
    if (!host) return;

    map = L.map(host, {
      center: HOME_VIEW.center, zoom: HOME_VIEW.zoom,
      minZoom: 3, maxZoom: 12,
      zoomControl: false, attributionControl: false,
      worldCopyJump: true, zoomSnap: 0.25
    });

    satLayer = L.tileLayer(SAT_URL, { maxZoom: 18, crossOrigin: true }).addTo(map);

    /* Satellite imagery is a remote service. If it will not answer —
       offline, blocked, rate-limited — fall back to OSM once rather
       than leaving the player staring at an empty black plate. If that
       fails too, the map simply stays dark and the rail still works. */
    satLayer.on("tileerror", function () {
      if (osmAdded || ++tileErrors < 3) return;
      osmAdded = true;
      osmLayer = L.tileLayer(OSM_URL, { maxZoom: 18 }).addTo(map);
      osmLayer.bringToBack();
      note("Satellite imagery unavailable — using open map tiles");
    });

    borderLayer = L.tileLayer(BORDER_URL, { maxZoom: 18, opacity: 0.85, crossOrigin: true });

    L.control.scale({ position: "bottomleft", imperial: true, maxWidth: 130 }).addTo(map);
    map.on("zoomend", updateDensity);
    map.on("click", function () { /* keeps focus off markers when panning */ });

    built = true;
    drawRoutes();
    drawMarkers();
    updateDensity();
  }

  /* Called every time the view is entered: Leaflet has to re-measure
     because the container was display:none until a moment ago. */
  function mount(p) {
    if (p) setProgress(p);
    if (!progress) setProgress(null);
    buildMap();
    renderRail();
    if (hasMap()) {
      // A frame's delay so the browser has actually laid the view out.
      requestAnimationFrame(function () {
        map.invalidateSize();
        refresh();
        if (!coldOpenDone) coldOpen();
        else {
          var c = Pilgrimage.currentSite(progress);
          if (c) focus(c.id, { fly: false });
        }
      });
    } else {
      // No Leaflet: still a working level select.
      var c = Pilgrimage.currentSite(progress);
      showDossier(c || Pilgrimage.siteAt(0));
      note("Map library unavailable — the journey list on the left still works", 6000);
    }
    startTerminatorClock();
  }

  function unmount() {
    stopTerminatorClock();
  }

  /* ------------------------------ routes ------------------------------ */

  function nearestWaypoint(coords, point) {
    var best = 0, bestD = Infinity;
    for (var i = 0; i < coords.length; i++) {
      var d = Geo.haversineKm(coords[i], point);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  /* Each arc is drawn twice: the stretch already walked as a solid gold
     line, the road ahead dashed and dim. The split point is the route
     waypoint nearest the last cleared site in that arc, so the line's
     shape reports progress without needing a legend. */
  function drawRoutes() {
    if (!hasMap()) return;
    routeLayers.forEach(function (l) { map.removeLayer(l); });
    routeLayers = [];
    if (!layers.routes) return;

    Pilgrimage.arcs().forEach(function (arc) {
      var route = ROUTES[arc.key];
      if (!route || !route.coords.length) return;

      var sites = Pilgrimage.sitesInArc(arc.key);
      var lastCleared = -1;
      sites.forEach(function (s, i) { if (Pilgrimage.isCleared(progress, s.id)) lastCleared = i; });

      var split = 0;
      if (lastCleared >= 0) split = nearestWaypoint(route.coords, sites[lastCleared].coords);

      function add(coords, cls, opacity) {
        if (coords.length < 2) return;
        routeLayers.push(L.polyline(coords, {
          color: "#05060a", weight: 7, opacity: .5,
          className: "route-casing", interactive: false
        }).addTo(map));
        routeLayers.push(L.polyline(coords, {
          color: route.colour, weight: 3.4, opacity: opacity,
          className: "route-line " + cls, interactive: false
        }).addTo(map));
      }

      if (split > 0) add(route.coords.slice(0, split + 1), "route-walked", .95);
      add(route.coords.slice(Math.max(0, split)), "route-ahead", .75);
    });
  }

  /* ------------------------------ markers ------------------------------ */

  function markerHtml(site, st, ordinal) {
    /* A locked site is masked everywhere, including in the accessible
       name. Masking only the visible label would keep the road ahead
       secret from people reading the screen and hand the whole list to
       anyone using a screen reader — the same information, leaked
       through the accessibility tree. */
    var shown = st.locked ? "———" : site.name;
    var label = st.locked
      ? "Site " + ordinal + ", sealed"
      : site.name + ", site " + ordinal + (st.cleared ? ", cleared" : "");
    var mark = st.cleared ? " ✦" : "";

    return '<div class="node">' +
      (st.current ? '<i class="beacon"></i>' : '') +
      '<i class="node-dot" role="button" tabindex="0" aria-label="' + esc(label) + '"></i>' +
      '<span class="node-label"><span class="node-ord">' + ordinal + '</span>' +
      '<b>' + esc(shown) + '</b>' + mark + '</span>' +
      '</div>';
  }

  function classesFor(st) {
    var c = ["site-marker"];
    if (st.locked) c.push("locked");
    if (st.cleared) c.push("cleared");
    if (st.perfect) c.push("perfect");
    if (st.current) c.push("current");
    if (st.active) c.push("active");
    return c.join(" ");
  }

  function drawMarkers() {
    if (!hasMap()) return;
    Object.keys(markers).forEach(function (id) { map.removeLayer(markers[id]); });
    markers = {};

    Pilgrimage.journey().forEach(function (site, i) {
      var st = stateOf(site);
      var icon = L.divIcon({
        className: classesFor(st),
        html: markerHtml(site, st, i + 1),
        iconSize: [0, 0], iconAnchor: [0, 0]
      });
      var m = L.marker(site.coords, { icon: icon, keyboard: false, riseOnHover: true }).addTo(map);
      m.on("click", function () { sfx("ui"); select(site.id); });
      markers[site.id] = m;
    });

    wireMarkerDom();
  }

  /* divIcon content is plain HTML inside the marker pane, so the click
     and keyboard handlers are attached to the DOM rather than through
     Leaflet's event system — that way the label and the dot are both
     real, focusable controls. */
  function wireMarkerDom() {
    Pilgrimage.journey().forEach(function (site) {
      var m = markers[site.id];
      if (!m) return;
      var el = m.getElement();
      if (!el) return;
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(site.id); }
      });
      el.addEventListener("pointerenter", function () { el.classList.add("hovered"); });
      el.addEventListener("pointerleave", function () { el.classList.remove("hovered"); });
    });
  }

  function refreshMarkers() {
    if (!hasMap()) return;
    Pilgrimage.journey().forEach(function (site, i) {
      var m = markers[site.id];
      if (!m) return;
      var st = stateOf(site);
      var el = m.getElement();
      if (!el) return;
      el.className = classesFor(st) + " leaflet-marker-icon leaflet-zoom-animated leaflet-interactive";
      el.innerHTML = markerHtml(site, st, i + 1);
    });
    wireMarkerDom();
  }

  function updateDensity() {
    var el = $("atlas-map");
    if (el && hasMap()) el.classList.toggle("compact", map.getZoom() < 6);
  }

  /* ------------------------------ overlays ------------------------------ */

  function drawEmpire(site) {
    if (!hasMap()) return;
    if (empireLayer) { map.removeLayer(empireLayer); empireLayer = null; }
    if (!layers.empires || !site) return;

    var shape = EMPIRE_SHAPES[site.empire];
    var meta = EMPIRES[site.empire];
    if (!shape || !meta) return;

    empireLayer = L.polygon(shape, {
      color: meta.colour, weight: 1.4, opacity: .55,
      fillColor: meta.colour, fillOpacity: .1,
      className: "empire-shape", interactive: false
    }).addTo(map);
    empireLayer.bringToBack();
  }

  function drawTerminator() {
    if (!hasMap()) return;
    if (terminatorLayer) { map.removeLayer(terminatorLayer); terminatorLayer = null; }
    if (!layers.terminator) return;

    terminatorLayer = L.polygon(Geo.terminator(new Date(), 2), {
      className: "terminator-shape", interactive: false,
      color: "#6fb6ff", weight: 1, opacity: .3,
      fillColor: "#020410", fillOpacity: .46
    }).addTo(map);
    terminatorLayer.bringToBack();
  }

  /* The night line moves about a quarter of a degree a minute, so
     redrawing every couple of minutes is plenty and costs nothing. */
  function startTerminatorClock() {
    stopTerminatorClock();
    drawTerminator();
    termTimer = setInterval(function () {
      drawTerminator();
      var s = Pilgrimage.site(activeId);
      if (s) applyLight(s);
    }, 120000);
  }
  function stopTerminatorClock() {
    if (termTimer) { clearInterval(termTimer); termTimer = null; }
  }

  function setLayer(key, on) {
    if (!(key in layers)) return;
    layers[key] = on === undefined ? !layers[key] : !!on;

    if (key === "routes") drawRoutes();
    if (key === "empires") drawEmpire(Pilgrimage.site(activeId));
    if (key === "terminator") drawTerminator();
    if (key === "borders" && hasMap() && borderLayer) {
      if (layers.borders) borderLayer.addTo(map); else map.removeLayer(borderLayer);
    }
    renderTools();
  }

  /* ------------------------------ light & weather ------------------------------ */

  /* The map wears the sky the site is actually under: real solar
     altitude picks the grading, and live weather layers over it. */
  function applyLight(site) {
    var el = $("atlas-map");
    if (!el || !site) return;
    var now = new Date();
    var sun = Geo.sunPosition(now, site.coords[0], site.coords[1]);
    el.setAttribute("data-light", Geo.lightPhase(sun.altitude));

    var r = Live.readingFor(site);
    var sky = r && r.sky ? r.sky.key : "clear";
    if (sky === "clear" || sky === "cloud") el.removeAttribute("data-sky");
    else el.setAttribute("data-sky", sky);
  }

  /* ------------------------------ selection ------------------------------ */

  function select(siteId, opts) {
    var site = Pilgrimage.site(siteId);
    if (!site) return;
    activeId = siteId;
    focus(siteId, opts);
    showDossier(site);
    refreshMarkers();
    renderRail();
    drawEmpire(site);
    applyLight(site);
  }

  function focus(siteId, opts) {
    opts = opts || {};
    var site = Pilgrimage.site(siteId);
    if (!site || !hasMap()) { activeId = siteId; return; }
    activeId = siteId;

    var zoom = opts.zoom || Math.max(map.getZoom(), 7);
    var fly = opts.fly !== false && !reduced();
    if (fly) map.flyTo(site.coords, zoom, { duration: opts.duration || 1.8, easeLinearity: .22 });
    else map.setView(site.coords, zoom, { animate: false });
  }

  function fitAll() {
    if (!hasMap()) return;
    var pts = Pilgrimage.journey().map(function (s) { return s.coords; });
    map.flyToBounds(L.latLngBounds(pts).pad(0.12), { duration: reduced() ? 0 : 2.2 });
  }

  /* ------------------------------ rail ------------------------------ */

  function renderRail() {
    var host = $("atlas-rail-list");
    if (!host) return;
    var html = "";
    var current = Pilgrimage.currentSite(progress);

    Pilgrimage.arcs().forEach(function (arc) {
      var st = Pilgrimage.arcStatus(progress, arc.key);
      html += '<div class="arc-head' + (st.complete ? " done" : "") + (st.perfect ? " flawless" : "") + '">' +
        esc(arc.n + ". " + arc.name) +
        '<span>' + st.cleared + "/" + st.total + (st.perfect ? " ✦" : "") + '</span>' +
        // The relay is offered only once the arc is reachable, and it is
        // always optional — the site-by-site road is the main way through.
        (st.open ? '<button class="arc-relay" type="button" data-relay="' + esc(arc.key) +
                   '" title="Walk the whole arc in one unbroken run">Walk it</button>' : '') +
        '</div>';

      Pilgrimage.sitesInArc(arc.key).forEach(function (site) {
        var i = Pilgrimage.indexOf(site.id);
        var s = stateOf(site);
        var cls = ["rail-site"];
        if (s.locked) cls.push("locked");
        if (s.cleared) cls.push("cleared");
        if (current && current.id === site.id && !s.cleared) cls.push("current");
        if (activeId === site.id) cls.push("active");
        html += '<button class="' + cls.join(" ") + '" data-site="' + esc(site.id) + '" type="button">' +
          '<span class="ord">' + (i + 1) + '</span>' +
          '<span class="nm">' + esc(s.locked ? "Sealed" : site.name) + '</span>' +
          '<span class="mk">' + (s.cleared ? "✦" : s.locked ? "·" : "▸") + '</span>' +
          '</button>';
      });
    });

    host.innerHTML = html;
    host.querySelectorAll("[data-site]").forEach(function (b) {
      b.addEventListener("click", function () { sfx("ui"); select(b.dataset.site); });
    });
    host.querySelectorAll("[data-relay]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        // The button sits inside the arc header; without this the click
        // would also fall through to whatever is behind it.
        if (e && e.stopPropagation) e.stopPropagation();
        sfx("ui");
        if (hooks.relay) hooks.relay(b.dataset.relay);
      });
    });

    var ov = Pilgrimage.overview(progress);
    var fill = $("atlas-fill"), count = $("atlas-count");
    if (fill) fill.style.width = (ov.cleared / ov.total * 100) + "%";
    if (count) count.textContent = ov.cleared + " of " + ov.total + " sites";
  }

  /* ------------------------------ dossier ------------------------------ */

  function liveRows(site) {
    var r = Live.readingFor(site);
    var now = new Date();
    var sun = Geo.sunPosition(now, site.coords[0], site.coords[1]);
    var times = Geo.sunTimes(now, site.coords[0], site.coords[1]);
    var moon = Geo.moonPhase(now);
    var dim = r.live ? "" : " class=\"dim\"";

    function hm(min) {
      if (min == null) return "—";
      // Sun times come back in UTC minutes; show them in the site's own
      // solar time, which is what a sundial there would read.
      var solar = (min + 4 * site.coords[1] + 1440) % 1440;
      return String(Math.floor(solar / 60)).padStart(2, "0") + ":" +
             String(Math.floor(solar % 60)).padStart(2, "0");
    }

    return '<div class="doss-live">' +
      '<div class="lv-head"><span class="lv-title">Conditions now</span>' +
      '<span class="lv-state ' + (r.live ? "on" : "off") + '">' +
      (r.live ? "Live" : "Typical") + '</span></div>' +

      '<div class="lv-row"><span>Temperature</span><b' + dim + '>' + r.tempC + '°C' +
      (r.live && r.feelsC !== r.tempC ? ' <em style="opacity:.6">feels ' + r.feelsC + '°</em>' : '') + '</b></div>' +

      '<div class="lv-row"><span>Sky</span><b' + dim + '>' + esc(r.sky ? r.sky.label : "—") +
      (r.sky && r.sky.derived ? " *" : "") + '</b></div>' +

      (r.wind != null ? '<div class="lv-row"><span>Wind</span><b' + dim + '>' + r.wind + ' km/h ' +
        (r.windDir != null ? Geo.compassPoint(r.windDir) : "") + '</b></div>' : '') +

      '<div class="lv-row"><span>Sun</span><b>' +
      (sun.altitude > 0 ? sun.altitude.toFixed(0) + "° above horizon" : Math.abs(sun.altitude).toFixed(0) + "° below") +
      '</b></div>' +
      '<div class="lv-row"><span>Local solar time</span><b>' + Geo.solarClock(now, site.coords[1]) + '</b></div>' +
      '<div class="lv-row"><span>Sunrise · sunset</span><b>' + hm(times.sunrise) + " · " + hm(times.sunset) + '</b></div>' +
      '<div class="lv-row"><span>Moon</span><b>' + esc(moon.name) + " · " + Math.round(moon.illumination * 100) + '%</b></div>' +
      '</div>';
  }

  /* Elevation profile across the site's own arc, with the site marked.
     Sinai at 2,285 m and Jericho at −258 m in the same run of levels is
     a real feature of this journey and worth showing. */
  function profileSvg(site) {
    var leg = Pilgrimage.sitesInArc(site.arc);
    if (leg.length < 2) return "";

    var W = 340, H = 96, PADX = 10, PADT = 14, PADB = 20;
    var els = leg.map(function (s) { return s.elevation; });
    var min = Math.min.apply(null, els), max = Math.max.apply(null, els);
    if (max === min) { max += 50; min -= 50; }
    var span = max - min;

    // Space nodes by real distance travelled, not evenly, so the shape
    // of the leg is honest about where the ground actually rises.
    var dist = [0];
    for (var i = 1; i < leg.length; i++) {
      dist.push(dist[i - 1] + Geo.haversineKm(leg[i - 1].coords, leg[i].coords));
    }
    var total = dist[dist.length - 1] || 1;

    function X(i) { return PADX + (dist[i] / total) * (W - PADX * 2); }
    function Y(v) { return PADT + (1 - (v - min) / span) * (H - PADT - PADB); }

    var line = leg.map(function (s, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(s.elevation).toFixed(1); }).join(" ");
    var fill = line + " L" + X(leg.length - 1).toFixed(1) + " " + (H - PADB) + " L" + X(0).toFixed(1) + " " + (H - PADB) + " Z";

    var seaY = (min <= 0 && max >= 0) ? Y(0) : null;
    var nodes = leg.map(function (s, i) {
      var on = s.id === site.id;
      return '<circle class="prof-node' + (on ? " on" : "") + '" cx="' + X(i).toFixed(1) +
             '" cy="' + Y(s.elevation).toFixed(1) + '" r="' + (on ? 3.4 : 2.2) + '"/>';
    }).join("");

    var here = leg.indexOf(site);
    var labelX = Math.min(Math.max(X(here), 26), W - 26);

    return '<div class="doss-profile"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Elevation across this leg">' +
      '<path class="prof-fill" d="' + fill + '"/>' +
      (seaY !== null ? '<line class="prof-sea" x1="' + PADX + '" y1="' + seaY.toFixed(1) + '" x2="' + (W - PADX) + '" y2="' + seaY.toFixed(1) + '"/>' : '') +
      '<path class="prof-line" d="' + line + '"/>' + nodes +
      '<text class="prof-txt" x="' + labelX.toFixed(1) + '" y="' + (Y(site.elevation) - 7).toFixed(1) + '" text-anchor="middle">' +
      esc(site.elevation + " m") + '</text>' +
      '<text class="prof-txt" x="' + PADX + '" y="' + (H - 6) + '">' + esc(leg[0].name.split(" ")[0]) + '</text>' +
      '<text class="prof-txt" x="' + (W - PADX) + '" y="' + (H - 6) + '" text-anchor="end">' + esc(leg[leg.length - 1].name.split(" ")[0]) + '</text>' +
      '</svg></div>';
  }

  function showDossier(site) {
    var host = $("atlas-dossier");
    if (!host || !site) return;
    var body = $("atlas-doss-body");
    if (!body) return;

    var b = Pilgrimage.brief(site.id, progress);
    var st = stateOf(site);
    var arc = Pilgrimage.arc(site.arc);
    var prevName = b.previous ? b.previous.name : "";

    var head =
      '<div class="doss-tag">' + esc(arc ? arc.n + " · " + arc.name : site.tag) + '</div>' +
      '<div class="doss-name">' + esc(st.locked ? "Sealed" : site.name) + '</div>' +
      '<div class="doss-where">Site ' + b.ordinal + " of " + b.total + " · " + esc(site.modernCountry) +
      " · " + esc(Geo.formatDMS(site.coords)) + '</div>';

    if (st.locked) {
      body.innerHTML = head +
        '<div class="doss-quote">' + esc(site.scripture) + '</div>' +
        '<div class="doss-body doss-locked">This place is still sealed. Clear <b>' + esc(prevName) +
        '</b> and the road opens.</div>' +
        profileSvg(site);
      renderDossActions(site, b, st);
      return;
    }

    body.innerHTML = head +
      '<div class="doss-quote">' + esc(site.quote) + '</div>' +
      '<div class="doss-ref">' + esc(site.quoteRef) + '</div>' +
      '<div class="doss-body">' + esc(site.description) + '</div>' +
      liveRows(site) +
      profileSvg(site) +
      '<div class="doss-grid">' +
        '<div class="doss-cell"><b>Elevation</b><span>' + site.elevation + ' m</span></div>' +
        '<div class="doss-cell"><b>Era</b><span>' + esc(site.era) + '</span></div>' +
        '<div class="doss-cell wide"><b>Archaeology</b><span>' + esc(site.archaeology) + '</span></div>' +
        '<div class="doss-cell wide"><b>Scripture</b><span>' + esc(site.scripture) + '</span></div>' +
        '<div class="doss-cell"><b>Difficulty</b><span>Tier ' + b.tier + '</span></div>' +
        '<div class="doss-cell"><b>Clock</b><span>' + (b.clockMs / 1000).toFixed(1) + ' s</span></div>' +
      '</div>' +
      (st.cleared && b.record
        ? '<div class="doss-record">' +
            '<div><b>' + Number(b.record.best).toLocaleString() + '</b><span>Best score</span></div>' +
            '<div><b>' + Math.round(b.record.bestAccuracy) + '%</b><span>Best accuracy</span></div>' +
            '<div><b>' + b.record.attempts + '</b><span>Visits</span></div>' +
          '</div>'
        : "");

    renderDossActions(site, b, st);
  }

  function renderDossActions(site, b, st) {
    var host = $("atlas-doss-actions");
    if (!host) return;

    if (st.locked) {
      host.innerHTML = '<button class="btn ghost sm" data-atlas="goto-current" type="button">Go to the road</button>';
    } else {
      host.innerHTML =
        '<button class="btn sm" data-atlas="begin" type="button">' +
        (st.cleared ? "Walk it again" : "Begin · " + b.verses + " verses") + '</button>' +
        (st.cleared ? '<button class="btn ghost sm" data-atlas="recall" type="button">Pilgrim’s Recall</button>' : "") +
        '<button class="btn ghost sm" data-atlas="fit" type="button">Whole road</button>';
    }

    host.querySelectorAll("[data-atlas]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.dataset.atlas;
        sfx("ui");
        if (act === "begin" && hooks.begin) hooks.begin(site.id, "pilgrimage");
        if (act === "recall" && hooks.recall) hooks.recall(site.id, "pilgrim-recall");
        if (act === "fit") fitAll();
        if (act === "goto-current") {
          var c = Pilgrimage.currentSite(progress);
          if (c) select(c.id);
        }
      });
    });
  }

  /* ------------------------------ tools ------------------------------ */

  function renderTools() {
    var host = $("atlas-layers");
    if (!host) return;
    var defs = [
      ["routes", "Routes"], ["empires", "Empires"],
      ["borders", "Borders"], ["terminator", "Night"]
    ];
    host.innerHTML = defs.map(function (d) {
      return '<button class="lyr' + (layers[d[0]] ? " on" : "") + '" data-layer="' + d[0] +
             '" type="button" aria-pressed="' + !!layers[d[0]] + '">' + d[1] + '</button>';
    }).join("") +
      // The opening flight already existed and nothing ever called it.
      '<button class="lyr" data-tour="1" type="button" title="Fly the whole road, Ur to Patmos">Fly the road</button>';

    host.querySelectorAll("[data-layer]").forEach(function (b) {
      b.addEventListener("click", function () { sfx("ui"); setLayer(b.dataset.layer); });
    });
    host.querySelectorAll("[data-tour]").forEach(function (b) {
      b.addEventListener("click", function () { sfx("ui"); replayColdOpen(); });
    });
  }

  function note(msg, ms) {
    var el = $("atlas-note");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("on");
    if (noteTimer) clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { el.classList.remove("on"); }, ms || 4200);
  }

  /* ------------------------------ cold open ------------------------------ */

  /* Plays once: the whole road from Ur to Patmos under a title card,
     then settles on wherever the player actually is. Skipped entirely
     under reduced motion, which should get the destination and not the
     journey. */
  function coldOpen() {
    coldOpenDone = true;
    var card = $("atlas-open");
    var current = Pilgrimage.currentSite(progress);

    if (reduced() || !hasMap()) {
      if (card) card.classList.add("gone");
      if (current) select(current.id, { fly: false });
      return;
    }

    if (card) card.classList.remove("gone");
    fitAll();

    setTimeout(function () {
      if (card) card.classList.add("gone");
      if (current) select(current.id, { fly: true, duration: 2.6 });
    }, 3400);
  }

  function replayColdOpen() { coldOpenDone = false; coldOpen(); }
  /* The opening flight is a once-ever moment, not a once-per-session
     one, so whether it has been seen is the save's business rather than
     this module's. game.js sets this from SAVE before mounting. */
  function seenColdOpen(v) { coldOpenDone = !!v; }

  /* ------------------------------ refresh ------------------------------ */

  /* Called after a level is played, when progress has changed. */
  function refresh(p) {
    if (p) setProgress(p);
    drawRoutes();
    refreshMarkers();
    renderRail();
    renderTools();
    var s = Pilgrimage.site(activeId) || Pilgrimage.currentSite(progress);
    if (s) { showDossier(s); drawEmpire(s); applyLight(s); }
  }

  /* Pull live weather and repaint whatever it touches. Never rejects —
     see live.js — so there is deliberately no error branch here. */
  function loadWeather() {
    return Live.load(Pilgrimage.journey()).then(function (readings) {
      var n = Object.keys(readings || {}).length;
      if (n) {
        var s = Pilgrimage.site(activeId);
        if (s) { showDossier(s); applyLight(s); }
      }
      return readings;
    });
  }

  return {
    mount: mount, unmount: unmount, refresh: refresh,
    setProgress: setProgress, on: on,
    select: select, focus: focus, fitAll: fitAll,
    setLayer: setLayer, layers: function () { return layers; },
    loadWeather: loadWeather, note: note,
    coldOpen: coldOpen, replayColdOpen: replayColdOpen, seenColdOpen: seenColdOpen,
    renderRail: renderRail, renderTools: renderTools,
    activeSite: function () { return Pilgrimage.site(activeId); },
    hasMap: hasMap,
    /* exposed for the structure tests */
    _profileSvg: profileSvg, _markerHtml: markerHtml, _stateOf: stateOf,
    _nearestWaypoint: nearestWaypoint
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Atlas;
