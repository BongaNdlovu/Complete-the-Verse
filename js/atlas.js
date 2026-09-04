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
  var hooks = { begin: null, recall: null, relay: null, exit: null, tablet: null };
  var termTimer = null, noteTimer = null;
  var layers = { routes: true, empires: true, borders: false, terminator: true };
  var coldOpenDone = false;
  var travelerIdle = null;     // scholar idle sprite on the road
  var travelerWalk = null;     // scholar walk sheet on the road
  var travelerMarker = null;   // separate map marker that can walk between sites
  var walkAnim = null;
  var travelerAt = null;       // site id the walker last stood on
  var travelerFacing = 1;      // 1 east / -1 west
  var travelerLatLng = null;   // last drawn position (so a new click continues from here)

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
  function speak(text) {
    if (typeof Director === "undefined" || !Director.speak) return;
    try { Director.speak(text, true); } catch (e) {}
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
          /* Skipping the flight still has to dismiss the title card —
             otherwise it stays full opacity over the map forever. */
          var card = $("atlas-open");
          if (card) card.classList.add("gone");
          var c = Pilgrimage.currentSite(progress);
          if (c) focus(c.id, { fly: false });
        }
      });
    } else {
      // No Leaflet: still a working level select.
      var c = Pilgrimage.currentSite(progress);
      if (c && c.kind === "tablets") showTabletDossier(c);
      else showDossier(c || Pilgrimage.siteAt(0));
      note("Map library unavailable — the journey list on the left still works", 6000);
    }
    startTerminatorClock();
    bindDossierSheet();
  }

  function unmount() {
    stopTerminatorClock();
    clearTravelerMarker();
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

  /* The four arc polylines, joined in road order, with shared join
     points dropped. This is the same geometry drawRoutes paints. */
  function fullRoad() {
    var pts = [];
    var arcs = (typeof Pilgrimage !== "undefined" && Pilgrimage.arcs) ? Pilgrimage.arcs() : [];
    var routes = typeof ROUTES !== "undefined" ? ROUTES : {};
    arcs.forEach(function (arc) {
      var route = routes[arc.key];
      if (!route || !route.coords || !route.coords.length) return;
      route.coords.forEach(function (c) {
        var last = pts[pts.length - 1];
        if (last && last[0] === c[0] && last[1] === c[1]) return;
        pts.push(c);
      });
    });
    return pts;
  }

  /* A walk from one pin to another that stays on the painted road,
     including when the two sites sit in different arcs. Falls back to
     the two pins if the route table is missing. */
  function pathBetween(fromCoords, toCoords) {
    if (!fromCoords || !toCoords) return [];
    var road = fullRoad();
    if (road.length < 2) return [fromCoords, toCoords];
    var i = nearestWaypoint(road, fromCoords);
    var j = nearestWaypoint(road, toCoords);
    var slice = i <= j ? road.slice(i, j + 1) : road.slice(j, i + 1).reverse();
    var path = [fromCoords];
    slice.forEach(function (c) {
      var last = path[path.length - 1];
      if (last[0] === c[0] && last[1] === c[1]) return;
      path.push(c);
    });
    var last = path[path.length - 1];
    if (last[0] !== toCoords[0] || last[1] !== toCoords[1]) path.push(toCoords);
    return path;
  }

  function polylineAt(path, distKm) {
    if (!path.length) return null;
    if (path.length === 1 || distKm <= 0) return path[0];
    var acc = 0;
    for (var i = 1; i < path.length; i++) {
      var seg = Geo.haversineKm(path[i - 1], path[i]);
      if (acc + seg >= distKm || i === path.length - 1) {
        var t = seg < 1e-6 ? 1 : (distKm - acc) / seg;
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        return [
          path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t,
          path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t
        ];
      }
      acc += seg;
    }
    return path[path.length - 1];
  }

  /* Fast enough to follow the road without waiting on it. Neighbours
     take ~1.4s; a long hop caps at 5.2s. */
  function durationForPath(path) {
    var km = (typeof Geo !== "undefined" && Geo.pathLengthKm) ? Geo.pathLengthKm(path) : 0;
    var ms = km * 24;
    if (ms < 1400) return 1400;
    if (ms > 5200) return 5200;
    return ms;
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
          color: "#05060a", weight: 3.2, opacity: .45,
          className: "route-casing", interactive: false
        }).addTo(map));
        routeLayers.push(L.polyline(coords, {
          color: route.colour, weight: 1.6, opacity: opacity,
          className: "route-line " + cls, interactive: false
        }).addTo(map));
      }

      if (split > 0) add(route.coords.slice(0, split + 1), "route-walked", .95);
      add(route.coords.slice(Math.max(0, split)), "route-ahead", .75);
    });
  }

  /* ------------------------------ markers ------------------------------ */

  function setTraveler(spec) {
    spec = spec || {};
    travelerIdle = spec.idle || null;
    travelerWalk = spec.walk || null;
    if (built) {
      drawMarkers();
      wireMarkerDom();
      placeTravelerAtCurrent(false);
    }
  }

  /* The vars are consumed inside css/atlas.css, and browsers resolve url()
     inside a custom property against the sheet that USES the var — so a
     page-relative sprite path must climb out of css/ or the sprite 404s. */
  function sheetRelative(path) {
    var p = String(path || "");
    if (/^(data:|https?:|\/|\.\.\/)/.test(p)) return p;
    return "../" + p;
  }
  function walkerCssVars() {
    var idle = sheetRelative(travelerIdle || "assets/traveler/idle.png");
    var walk = sheetRelative(travelerWalk || "assets/traveler/walk.png");
    return "--walker-idle:url('" + esc(idle) + "');--walker-walk:url('" + esc(walk) + "')";
  }

  function travelerIconHtml(walking) {
    var face = travelerFacing < 0 ? " face-west" : "";
    return '<div class="traveler-node' + (walking ? " walking" : "") + face + '">' +
      '<i class="traveler-walker" style="' + walkerCssVars() + '" aria-hidden="true"></i>' +
      '<i class="traveler-shadow" aria-hidden="true"></i>' +
      '</div>';
  }

  function ensureTravelerMarker(latlng, walking) {
    if (!hasMap()) {
      clearTravelerMarker();
      return null;
    }
    var html = travelerIconHtml(!!walking);
    var icon = L.divIcon({
      className: "traveler-marker" + (walking ? " is-walking" : ""),
      html: html,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
    if (!travelerMarker) {
      travelerMarker = L.marker(latlng, {
        icon: icon,
        keyboard: false,
        interactive: false,
        zIndexOffset: 1200
      }).addTo(map);
    } else {
      travelerMarker.setIcon(icon);
      travelerMarker.setLatLng(latlng);
      if (!map.hasLayer(travelerMarker)) travelerMarker.addTo(map);
    }
    return travelerMarker;
  }

  function clearTravelerMarker() {
    if (walkAnim) {
      cancelAnimationFrame(walkAnim);
      walkAnim = null;
    }
    if (travelerMarker && hasMap()) {
      try { map.removeLayer(travelerMarker); } catch (e) {}
    }
    travelerMarker = null;
  }

  function placeTravelerAtCurrent(walking) {
    if (!hasMap()) {
      clearTravelerMarker();
      return;
    }
    var cur = (typeof Pilgrimage.place === "function" && travelerAt && Pilgrimage.place(travelerAt))
      || Pilgrimage.currentSite(progress);
    if (!cur) return;
    travelerAt = cur.id;
    travelerLatLng = cur.coords;
    ensureTravelerMarker(cur.coords, !!walking);
  }

  /* Walk the token along the painted road, not a straight cut. */
  function snapTraveler(toId, to, opts) {
    travelerAt = toId || travelerAt;
    if (to) travelerLatLng = to.coords;
    placeTravelerAtCurrent(false);
    if (opts.onDone) opts.onDone();
  }
  function walkTraveler(fromId, toId, opts) {
    opts = opts || {};
    var to = (typeof Pilgrimage.place === "function" ? Pilgrimage.place(toId) : Pilgrimage.site(toId));
    var from = (typeof Pilgrimage.place === "function" ? Pilgrimage.place(fromId) : Pilgrimage.site(fromId));
    if (!hasMap() || reduced() || opts.duration === 0) {
      snapTraveler(toId, to, opts);
      return;
    }
    if (!to) {
      placeTravelerAtCurrent(false);
      if (opts.onDone) opts.onDone();
      return;
    }
    var startPt = travelerLatLng || (from && from.coords) || to.coords;
    if (from && from.id === to.id && !travelerLatLng) {
      travelerAt = to.id;
      travelerLatLng = to.coords;
      ensureTravelerMarker(to.coords, false);
      if (opts.onDone) opts.onDone();
      return;
    }
    var path = pathBetween(startPt, to.coords);
    if (path.length < 2) {
      travelerAt = to.id;
      travelerLatLng = to.coords;
      ensureTravelerMarker(to.coords, false);
      if (opts.onDone) opts.onDone();
      return;
    }
    startTravelerWalk(fromId, to, startPt, path, opts);
  }
  function startTravelerWalk(fromId, to, startPt, path, opts) {
    if (walkAnim) cancelAnimationFrame(walkAnim);
    var totalKm = Geo.pathLengthKm(path);
    var duration = typeof opts.duration === "number" ? opts.duration : durationForPath(path);
    var start = null;
    var lastPos = startPt;
    travelerFacing = (to.coords[1] >= startPt[1]) ? 1 : -1;
    travelerAt = fromId || travelerAt;
    ensureTravelerMarker(startPt, true);
    if (path.length > 2) {
      try {
        var bounds = L.latLngBounds(path).pad(0.2);
        if (map.fitBounds) map.fitBounds(bounds, { animate: true, duration: 0.4 });
        else if (map.flyToBounds) map.flyToBounds(bounds, { duration: 0.4 });
      } catch (e) {}
    }
    function step(ts) {
      if (start == null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      var pos = polylineAt(path, totalKm * e);
      if (pos) {
        var face = pos[1] >= lastPos[1] ? 1 : -1;
        if (face !== travelerFacing) {
          travelerFacing = face;
          ensureTravelerMarker(pos, true);
        } else if (travelerMarker) {
          travelerMarker.setLatLng(pos);
        }
        lastPos = pos;
        travelerLatLng = pos;
      }
      if (t < 1) {
        walkAnim = requestAnimationFrame(step);
      } else {
        walkAnim = null;
        travelerAt = to.id;
        travelerLatLng = to.coords;
        ensureTravelerMarker(to.coords, false);
        if (opts.onDone) opts.onDone();
      }
    }
    walkAnim = requestAnimationFrame(step);
  }

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
    /* Traveler is drawn as its own map marker so it can walk the road;
       site markers only show the beacon/dot. */

    return '<div class="node">' +
      (st.current ? '<i class="beacon"></i>' : '') +
      '<i class="node-dot" role="button" tabindex="0" aria-label="' + esc(label) + '"></i>' +
      '<span class="node-label"><span class="node-ord">' + ordinal + '</span>' +
      '<b>' + esc(shown) + '</b>' + mark + '</span>' +
      '</div>';
  }

  function tabletStops() {
    if (!Pilgrimage.stops) return [];
    return Pilgrimage.stops().filter(function (s) { return s.kind === "tablets"; });
  }
  function tabletsAfter(siteId) {
    return tabletStops().filter(function (s) { return s.after === siteId; });
  }

  function classesFor(st, extra) {
    var c = ["site-marker"];
    if (extra) c.push(extra);
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

    tabletStops().forEach(function (stop) {
      var st = stateOf(stop);
      var icon = L.divIcon({
        className: classesFor(st, "tablet-marker"),
        html: markerHtml(stop, st, "✦"),
        iconSize: [0, 0], iconAnchor: [0, 0]
      });
      var m = L.marker(stop.coords, { icon: icon, keyboard: false, riseOnHover: true }).addTo(map);
      m.on("click", function () { sfx("ui"); select(stop.id); });
      markers[stop.id] = m;
    });

    wireMarkerDom();
    placeTravelerAtCurrent(false);
  }

  /* divIcon content is plain HTML inside the marker pane, so the click
     and keyboard handlers are attached to the DOM rather than through
     Leaflet's event system — that way the label and the dot are both
     real, focusable controls. */
  function markedPlaces() {
    return Pilgrimage.journey().concat(tabletStops());
  }
  function wireMarkerDom() {
    markedPlaces().forEach(function (site) {
      var m = markers[site.id];
      if (!m) return;
      var el = m.getElement();
      if (!el || el._atlasWired) return;
      el._atlasWired = true;
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(site.id); }
      });
      el.addEventListener("pointerenter", function () { el.classList.add("hovered"); });
      el.addEventListener("pointerleave", function () { el.classList.remove("hovered"); });
    });
  }

  function refreshMarkers() {
    if (!hasMap()) return;
    markedPlaces().forEach(function (site, i) {
      var m = markers[site.id];
      if (!m) return;
      var st = stateOf(site);
      var el = m.getElement();
      if (!el) return;
      var extra = site.kind === "tablets" ? "tablet-marker" : "";
      el.className = classesFor(st, extra) + " leaflet-marker-icon leaflet-zoom-animated leaflet-interactive";
      el.innerHTML = markerHtml(site, st, site.kind === "tablets" ? "✦" : (Pilgrimage.indexOf(site.id) + 1));
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
    var site = (typeof Pilgrimage.place === "function" ? Pilgrimage.place(siteId) : Pilgrimage.site(siteId));
    if (!site) return;
    var st = stateOf(site);
    var fromId = travelerAt;
    activeId = siteId;
    var willWalk = !st.locked && (fromId || travelerLatLng) && fromId !== siteId && !reduced();
    focus(siteId, willWalk ? { fly: false } : opts);
    if (site.kind === "tablets") showTabletDossier(site);
    else showDossier(site);
    refreshMarkers();
    renderRail();
    var empireSite = site.kind === "tablets" ? Pilgrimage.site(site.parent) : site;
    if (empireSite) {
      drawEmpire(empireSite);
      applyLight(empireSite);
    }
    if (st.locked) {
    } else if (willWalk) {
      walkTraveler(fromId, siteId);
    } else if (!walkAnim) {
      travelerAt = siteId;
      travelerLatLng = site.coords;
      if (hasMap()) ensureTravelerMarker(site.coords, false);
    }
  }

  function focus(siteId, opts) {
    opts = opts || {};
    var site = (typeof Pilgrimage.place === "function" ? Pilgrimage.place(siteId) : Pilgrimage.site(siteId));
    if (!site || !hasMap()) { activeId = siteId; return; }
    activeId = siteId;

    var zoom = opts.zoom || Math.max(map.getZoom(), 7);
    var fly = opts.fly !== false && !reduced();
    var size = map.getSize && map.getSize();
    if (size && (!size.x || !size.y)) fly = false;
    if (fly) map.flyTo(site.coords, zoom, { duration: opts.duration || 1.8, easeLinearity: .22 });
    else map.setView(site.coords, zoom, { animate: false });
  }

  function fitAll() {
    if (!hasMap()) return;
    var size = map.getSize && map.getSize();
    if (size && (!size.x || !size.y)) return;
    var pts = Pilgrimage.journey().map(function (s) { return s.coords; }).filter(function (c) {
      return c && isFinite(c[0]) && isFinite(c[1]);
    });
    if (pts.length < 2) return;
    try {
      map.flyToBounds(L.latLngBounds(pts).pad(0.12), { duration: reduced() ? 0 : 2.2 });
    } catch (e) {}
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
        // Named after the mode, not a verb: "Walk it" read as navigation
        // and started a whole-arc run by accident.
        (st.open ? '<button class="arc-relay" type="button" data-relay="' + esc(arc.key) +
                   '" title="Walk the whole arc in one unbroken run — lives are shared and never return">The Long Road</button>' : '') +
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
        tabletsAfter(site.id).forEach(function (stop) {
          var ts = stateOf(stop);
          var tcls = ["rail-site", "rail-tablet"];
          if (ts.locked) tcls.push("locked");
          if (ts.cleared) tcls.push("cleared");
          if (current && current.id === stop.id && !ts.cleared) tcls.push("current");
          if (activeId === stop.id) tcls.push("active");
          html += '<button class="' + tcls.join(" ") + '" data-site="' + esc(stop.id) + '" type="button">' +
            '<span class="ord">✦</span>' +
            '<span class="nm">' + esc(ts.locked ? "Sealed tablet" : stop.name + " · the tablet") + '</span>' +
            '<span class="mk">' + (ts.cleared ? "✦" : ts.locked ? "·" : "▸") + '</span>' +
            '</button>';
        });
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

  /* The printed clock matches the site brief and the play clock: base ×
     the player's difficulty + pad, paced, plus the flat seconds. It used
     to print base+pad only, so the dossier promised 15.5s and the brief
     said 23.6s for the same site. */
  function dossClockLabel(b) {
    var diffTime = 1;
    try {
      if (typeof SAVE !== "undefined" && SAVE.set && typeof DIFFS !== "undefined") {
        diffTime = (typeof resolveDiff==="function" ? resolveDiff(SAVE.set.diff) : (DIFFS.watchman||DIFFS.disciple)).time;
      }
    } catch (e) {}
    var ms = (typeof Polish !== "undefined" && Polish.pacedClockMs)
      ? Polish.pacedClockMs(b.clockMs, diffTime, Pilgrimage.PICK_PAD_MS || 1500)
      : b.clockMs + (Pilgrimage.PICK_PAD_MS || 1500);
    return (ms / 1000).toFixed(1) + " s";
  }

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

  function dossierRelicHtml(site, st) {
    var art = Artifacts.forSite(site.id);
    var store = (typeof SAVE !== "undefined" && SAVE.artifacts) ? SAVE.artifacts : null;
    if (art && store && Artifacts.isUnlocked(store, art.id)) {
      var img = Artifacts.imagePath(art);
      return '<button type="button" class="doss-relic clickable" data-inspect-relic="' + esc(art.id) + '" style="width:100%;text-align:left;background:rgba(217,182,103,.08);border:1px solid rgba(217,182,103,.35);cursor:pointer;border-radius:4px;display:flex;align-items:center;gap:10px;padding:8px 10px;color:inherit;font:inherit">' +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">' : '<span class="doss-relic-glyph">✦</span>') +
        '<div><div class="doss-relic-tag">Relic recovered · Tap to inspect</div>' +
        '<b>' + esc(art.name) + '</b>' +
        '<span>' + esc(art.blurb) + '</span></div></button>';
    }
    if (art && st.cleared) {
      return '<div class="doss-relic dim"><span class="doss-relic-glyph">✦</span><div><div class="doss-relic-tag">Relic</div><b>' + esc(art.name) + '</b><span>Recovered on first clear</span></div></div>';
    }
    if (art) {
      return '<div class="doss-relic dim"><span class="doss-relic-glyph">?</span><div><div class="doss-relic-tag">Relic sealed</div><b>Unknown find</b><span>Clear this site to recover it</span></div></div>';
    }
    return "";
  }
  function showTabletDossier(stop) {
    var host = $("atlas-dossier");
    var body = $("atlas-doss-body");
    var actions = $("atlas-doss-actions");
    if (!host || !body || !stop) return;
    var st = stateOf(stop);
    var parent = Pilgrimage.site(stop.parent);
    var head =
      '<div class="doss-tag">Word Tablets</div>' +
      '<div class="doss-name">' + esc(st.locked ? "Sealed tablet" : stop.name) + '</div>' +
      '<div class="doss-where">' + esc(parent ? parent.name : "") + ' · Hold to open the next place</div>';
    if (st.locked) {
      body.innerHTML = head +
        '<div class="doss-body doss-locked">This tablet is still sealed. Clear <b>' +
        esc(parent ? parent.name : "the last place") + '</b> and the road opens.</div>';
    } else {
      body.innerHTML = head +
        '<div class="doss-body">A special-edition chapter at this ground. Hold every blank — a miss shatters the stop.</div>';
    }
    if (actions) {
      if (st.locked) {
        actions.innerHTML = '<button class="btn ghost sm" data-atlas="goto-current" type="button">Go to the road</button>';
      } else {
        actions.innerHTML =
          '<button class="btn sm" data-atlas="tablet" type="button">' +
          (st.cleared ? "Carve again" : "Hold the tablet") + '</button>' +
          '<button class="btn ghost sm" data-atlas="fit" type="button">Whole road</button>';
      }
      actions.querySelectorAll("[data-atlas]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var act = btn.dataset.atlas;
          sfx("ui");
          if (act === "tablet" && hooks.tablet) hooks.tablet(stop.id);
          if (act === "fit") fitAll();
          if (act === "goto-current") {
            var c = Pilgrimage.currentSite(progress);
            if (c) select(c.id);
          }
        });
      });
    }
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
    var relicHtml = typeof Artifacts !== "undefined" ? dossierRelicHtml(site, st) : "";

    var sealStampHtml = st.cleared
      ? '<div class="doss-seal-wrap" style="display:flex;justify-content:center;margin:1.4vh 0 .6vh"><div class="doss-seal-stamp wax-seal-stamp stamped"></div></div>'
      : "";

    var vignetteBtnHtml = (!st.locked)
      ? '<div style="margin:1vh 0"><button class="btn ghost sm doss-vignette-btn" type="button" data-view-vignette="' + esc(site.id) + '">✦ View Journey Milestone</button></div>'
      : "";

    body.innerHTML = head +
      sealStampHtml +
      '<div class="doss-quote">' + esc(site.quote) + '</div>' +
      '<div class="doss-ref">' + esc(site.quoteRef) + '</div>' +
      '<div class="doss-body">' + esc(site.description) + '</div>' +
      vignetteBtnHtml +
      relicHtml +
      liveRows(site) +
      profileSvg(site) +
      '<div class="doss-grid">' +
        '<div class="doss-cell"><b>Elevation</b><span>' + site.elevation + ' m</span></div>' +
        '<div class="doss-cell"><b>Era</b><span>' + esc(site.era) + '</span></div>' +
        '<div class="doss-cell wide"><b>Archaeology</b><span>' + esc(site.archaeology) + '</span></div>' +
        '<div class="doss-cell wide"><b>Scripture</b><span>' + esc(site.scripture) + '</span></div>' +
        '<div class="doss-cell"><b>Difficulty</b><span>Tier ' + b.tier + '</span></div>' +
        '<div class="doss-cell"><b>Clock</b><span>' + dossClockLabel(b) + '</span></div>' +
      '</div>' +
      (st.cleared && b.record
        ? '<div class="doss-record">' +
            '<div><b>' + Number(b.record.best).toLocaleString() + '</b><span>Best score</span></div>' +
            '<div><b>' + Math.round(b.record.bestAccuracy) + '%</b><span>Best accuracy</span></div>' +
            '<div><b>' + b.record.attempts + '</b><span>Visits</span></div>' +
          '</div>'
        : "");

    body.querySelectorAll("[data-inspect-relic]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (typeof openRelicInspect === "function" && typeof Artifacts !== "undefined") {
          var a = Artifacts.byId(btn.dataset.inspectRelic);
          if (a) openRelicInspect(a);
        }
      });
    });

    body.querySelectorAll("[data-view-vignette]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        sfx("ui");
        openJourneyVignette(btn.dataset.viewVignette);
      });
    });

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
    var settled = false;

    function finish() {
      if (settled) return;
      settled = true;
      if (card) {
        card.classList.add("gone");
        card.removeEventListener("click", finish);
      }
      if (current) {
        select(current.id, { fly: false });
        if (hasMap()) fitAll();
        if (Pilgrimage.clearedCount(progress) === 0) {
          setTimeout(function () {
            if (typeof currentView === "string" && currentView !== "atlas") return;
            openJourneyVignette("ur");
          }, reduced() ? 300 : 2600);
        }
      }
    }

    speak("The pilgrimage. Ur to Patmos.");
    if (reduced() || !hasMap()) {
      finish();
      return;
    }

    if (card) {
      card.classList.remove("gone");
      /* Tap anywhere on the title to skip the wait. */
      card.addEventListener("click", finish);
    }
    fitAll();
    setTimeout(finish, 2800);
  }

  function replayColdOpen() { coldOpenDone = false; coldOpen(); }
  /* The opening flight is a once-ever moment, not a once-per-session
     one, so whether it has been seen is the save's business rather than
     this module's. game.js sets this from SAVE before mounting. */
  function seenColdOpen(v) { coldOpenDone = !!v; }

  /* ------------------------------ unlock ceremony ------------------------------ */

  /* First time a site opens on the road: fly there, break the seal on the
     marker, open the dossier. Called after a clear when the next place unlocks. */
  function celebrateTabletUnlock(stop) {
    activeId = stop.id;
    refreshMarkers();
    renderRail();
    showTabletDossier(stop);
    var parent = Pilgrimage.site(stop.parent);
    if (parent) { drawEmpire(parent); applyLight(parent); }
    if (hasMap()) focus(stop.id, { fly: !reduced(), duration: 1.4, zoom: 8 });
    note((stop.name || "The tablet") + " · the tablet is open", 4200);
    speak("A tablet waits.");
    sfx("power");
  }
  function celebrateUnlock(siteId) {
    var stop = Pilgrimage.stop && Pilgrimage.stop(siteId);
    if (stop && stop.kind === "tablets") {
      celebrateTabletUnlock(stop);
      return;
    }
    var site = Pilgrimage.site(siteId);
    if (!site) return;
    var card = $("atlas-open");
    if (card) card.classList.add("gone");

    var prev = null;
    var idx = Pilgrimage.indexOf(siteId);
    if (idx > 0) prev = Pilgrimage.siteAt(idx - 1);

    activeId = siteId;
    refreshMarkers();
    renderRail();
    showDossier(site);
    drawEmpire(site);
    applyLight(site);

    if (hasMap()) {
      focus(siteId, { fly: !reduced(), duration: 1.9, zoom: 8 });
    }

    /* Pilgrim walks from the last site to the newly opened one. */
    if (prev) {
      walkTraveler(prev.id, siteId, reduced() ? { duration: 0 } : {});
    } else {
      placeTravelerAtCurrent(false);
    }

    /* Open the story vignette milestone artwork after the traveler completes the walk */
    setTimeout(function () {
      openJourneyVignette(siteId);
    }, reduced() ? 300 : 1800);

    var m = markers[siteId];
    var el = m && m.getElement ? m.getElement() : null;
    if (el) {
      el.classList.add("unlocking");
      setTimeout(function () {
        if (el) el.classList.remove("unlocking");
      }, 2400);
    }

    /* Also flash the rail row if present */
    var rail = document.querySelector('.rail-site[data-site="' + siteId + '"]');
    if (rail) {
      rail.classList.add("unlocking");
      setTimeout(function () { rail.classList.remove("unlocking"); }, 2400);
    }

    note((site.name || "This place") + " is open", 4200);
    speak("The next place is open.");
    sfx("power");
    if (hooks.unlock) {
      try { hooks.unlock(siteId); } catch (e) {}
    }
  }

  function fillJourneyVignetteCopy(d) {
    if ($("jv-kick")) $("jv-kick").textContent = "The Pilgrimage Road · " + d.arcName;
    if ($("jv-era")) $("jv-era").textContent = d.era;
    if ($("jv-title")) $("jv-title").textContent = d.title;
    if ($("jv-ref")) $("jv-ref").textContent = d.ref;
    if ($("jv-quote")) $("jv-quote").textContent = '"' + d.quote + '"';
    if ($("jv-narrative")) $("jv-narrative").textContent = d.narrative;
  }

  /* ------------------------------ story vignette modal ------------------------------ */

  function openJourneyVignette(siteId) {
    bindJourneyVignette();
    var site = Pilgrimage.site(siteId);
    if (!site) return;
    var vig = (typeof Pilgrimage !== "undefined" && Pilgrimage.vignette) ? Pilgrimage.vignette(siteId) : null;
    var modal = $("journey-vignette-modal");
    if (!modal) return;

    var title = vig ? vig.title : ("Arrival at " + site.name);
    var quote = vig ? vig.quote : site.quote;
    var ref = (vig ? vig.ref : site.quoteRef) + " — " + site.name;
    var narrative = vig ? vig.narrative : site.description;
    var era = site.era || "Antiquity";
    var imgUrl = vig ? vig.image : ("assets/journey/" + site.id + ".png");

    var arcMeta = (typeof Pilgrimage !== "undefined" && Pilgrimage.arc) ? Pilgrimage.arc(site.arc) : null;
    var arcName = arcMeta ? (arcMeta.n + " · " + arcMeta.name) : "The Pilgrimage Road";

    var imgEl = $("jv-img");
    if (imgEl) {
      imgEl.src = imgUrl;
      imgEl.onerror = function () {
        if (vig && vig.fallback) imgEl.src = vig.fallback;
        else imgEl.src = "assets/journey/ur.webp";
      };
    }

    fillJourneyVignetteCopy({ title: title, quote: quote, ref: ref, narrative: narrative, era: era, arcName: arcName });

    modal.hidden = false;
    modal.classList.remove("on");
    void modal.offsetWidth;
    modal.classList.add("on");

    if (typeof Snd !== "undefined" && Snd.seal) Snd.seal();

    if (modal._autoTimer) clearTimeout(modal._autoTimer);
    modal._autoTimer = setTimeout(function () {
      closeJourneyVignette();
    }, 6500);
  }

  function closeJourneyVignette() {
    var modal = $("journey-vignette-modal");
    if (!modal || modal.hidden) return;
    if (modal._autoTimer) { clearTimeout(modal._autoTimer); modal._autoTimer = null; }
    modal.classList.remove("on");
    setTimeout(function () {
      if (!modal.classList.contains("on")) modal.hidden = true;
    }, 350);
  }

  var vignetteBound = false;
  function bindJourneyVignette() {
    if (vignetteBound) return;
    vignetteBound = true;
    var modal = $("journey-vignette-modal");
    var closeBtn = $("jv-close");
    var contBtn = $("jv-continue");
    if (closeBtn) closeBtn.addEventListener("click", function () { closeJourneyVignette(); });
    if (contBtn) contBtn.addEventListener("click", function () { closeJourneyVignette(); });
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeJourneyVignette();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (modal && !modal.hidden && modal.classList.contains("on")) {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          closeJourneyVignette();
        }
      }
    });
  }

  /* ------------------------------ refresh ------------------------------ */

  /* Called after a level is played, when progress has changed. */
  function refresh(p) {
    if (p) setProgress(p);
    drawRoutes();
    refreshMarkers();
    renderRail();
    renderTools();
    var s = (typeof Pilgrimage.place === "function" ? Pilgrimage.place(activeId) : Pilgrimage.site(activeId))
      || Pilgrimage.currentSite(progress);
    if (s && s.kind === "tablets") {
      showTabletDossier(s);
      var parent = Pilgrimage.site(s.parent);
      if (parent) { drawEmpire(parent); applyLight(parent); }
    } else if (s) { showDossier(s); drawEmpire(s); applyLight(s); }
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

  var sheetFrac = 0.42;
  function phoneAtlas() {
    return !!(window.matchMedia && window.matchMedia("(max-width:720px)").matches);
  }
  function applySheet(frac, remeasure) {
    sheetFrac = Math.max(0.18, Math.min(0.9, frac));
    var host = $("v-atlas");
    if (host && host.style && typeof host.style.setProperty === "function") {
      host.style.setProperty("--atlas-sheet", (Math.round(sheetFrac * 1000) / 10) + "vh");
    }
    if (host && host.classList) host.classList.toggle("sheet-full", sheetFrac > 0.72);
    if (remeasure !== false && hasMap()) {
      requestAnimationFrame(function () { if (map) map.invalidateSize(); });
    }
  }
  function snapSheet() {
    applySheet(sheetFrac < 0.3 ? 0.2 : (sheetFrac < 0.64 ? 0.42 : 0.86));
  }
  function cycleSheet() {
    applySheet(sheetFrac < 0.3 ? 0.42 : (sheetFrac < 0.64 ? 0.86 : 0.2));
  }
  function bindDossierSheet() {
    var handle = $("atlas-doss-handle");
    if (!handle || handle._sheetBound) return;
    handle._sheetBound = true;
    var drag = null;
    handle.addEventListener("pointerdown", function (e) {
      if (!phoneAtlas()) return;
      drag = { y: e.clientY, start: sheetFrac, h: window.innerHeight || 1, moved: false };
      if (handle.setPointerCapture && e.pointerId != null) {
        try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      }
    });
    handle.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dy = drag.y - e.clientY;
      if (Math.abs(dy) > 6) drag.moved = true;
      applySheet(drag.start + dy / drag.h, false);
    });
    function endDrag() {
      if (!drag) return;
      var moved = drag.moved;
      drag = null;
      if (moved) snapSheet();
      else cycleSheet();
    }
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
  }

  return {
    mount: mount, unmount: unmount, refresh: refresh,
    setProgress: setProgress, on: on,
    select: select, focus: focus, fitAll: fitAll,
    celebrateUnlock: celebrateUnlock,
    openVignette: openJourneyVignette, closeVignette: closeJourneyVignette,
    setLayer: setLayer, layers: function () { return layers; },
    loadWeather: loadWeather, note: note,
    setTraveler: setTraveler,
    walkTraveler: walkTraveler,
    placeTravelerAtCurrent: placeTravelerAtCurrent,
    coldOpen: coldOpen, replayColdOpen: replayColdOpen, seenColdOpen: seenColdOpen,
    renderRail: renderRail, renderTools: renderTools,
    activeSite: function () { return (typeof Pilgrimage.place === "function" ? Pilgrimage.place(activeId) : Pilgrimage.site(activeId)); },
    hasMap: hasMap,
    /* exposed for the structure tests */
    _profileSvg: profileSvg, _markerHtml: markerHtml, _stateOf: stateOf,
    _nearestWaypoint: nearestWaypoint,
    _fullRoad: fullRoad, _pathBetween: pathBetween,
    _polylineAt: polylineAt, _durationForPath: durationForPath
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Atlas;
