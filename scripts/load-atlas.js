/* Loads the atlas and everything it depends on into Node, on top of a
   hand-rolled DOM and Leaflet stub.

   This exists so atlas.js can be tested without jsdom and without a
   browser — the project has no package.json and no node_modules, and it
   is worth keeping it that way. The stub is deliberately small: it
   implements the handful of DOM and Leaflet calls atlas.js actually
   makes, and records them so the tests can assert on what was drawn.

   The browser files are concatenated and compiled in one module scope,
   exactly as load-bank.js does, so their top-level `var`s see each
   other the same way they do behind a row of <script> tags. */
const fs = require("fs");
const path = require("path");
const Module = require("module");

const ROOT = path.join(__dirname, "..");
const FILES = ["js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
               "js/live.js", "js/atlas.js"];

/* ------------------------------ DOM stub ------------------------------ */

function makeClassList(el){
  const set = new Set();
  return {
    add: (...c) => c.forEach(x => x && set.add(x)),
    remove: (...c) => c.forEach(x => set.delete(x)),
    contains: c => set.has(c),
    toggle: (c, force) => {
      const on = force === undefined ? !set.has(c) : !!force;
      if(on) set.add(c); else set.delete(c);
      return on;
    },
    _all: () => Array.from(set),
    get length(){ return set.size; }
  };
}

function makeEl(id, tag){
  const el = {
    id: id || "", tagName: (tag || "div").toUpperCase(),
    innerHTML: "", textContent: "", value: "",
    dataset: {}, style: {}, attributes: {},
    children: [], parent: null,
    events: {},
    disabled: false
  };
  el.classList = makeClassList(el);
  el.className = "";
  el.setAttribute = (k, v) => { el.attributes[k] = String(v); };
  el.getAttribute = k => (k in el.attributes ? el.attributes[k] : null);
  el.removeAttribute = k => { delete el.attributes[k]; };
  el.addEventListener = (t, fn) => { (el.events[t] = el.events[t] || []).push(fn); };
  el.removeEventListener = (t, fn) => {
    el.events[t] = (el.events[t] || []).filter(f => f !== fn);
  };
  /* Fire a handler the way a real click would. */
  el.dispatch = (t, ev) => (el.events[t] || []).forEach(fn => fn(ev || {preventDefault(){}}));
  el.appendChild = c => { el.children.push(c); c.parent = el; return c; };
  el.remove = () => { if(el.parent) el.parent.children = el.parent.children.filter(x => x !== el); };
  el.closest = () => null;
  el.setPointerCapture = function () {};
  el.releasePointerCapture = function () {};
  /* Good enough for the markup atlas.js writes: find the elements whose
     rendered HTML carries a given attribute, and hand back stubs whose
     dataset is parsed out of it. */
  el.querySelectorAll = sel => {
    const attr = (sel.match(/^\[([a-z-]+)\]$/) || [])[1];
    if(!attr) return [];
    const out = [];
    const re = new RegExp(attr + '="([^"]*)"', "g");
    let m;
    while((m = re.exec(el.innerHTML))){
      const child = makeEl("", "button");
      child.dataset[attr.replace(/^data-/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = m[1];
      out.push(child);
    }
    el._found = (el._found || []).concat(out);
    return out;
  };
  el.querySelector = sel => el.querySelectorAll(sel)[0] || null;
  return el;
}

function makeDocument(){
  const byId = {};
  const doc = {
    _byId: byId,
    body: makeEl("body", "body"),
    documentElement: makeEl("html", "html"),
    getElementById: id => byId[id] || null,
    createElement: tag => makeEl("", tag),
    querySelectorAll: () => [],
    addEventListener: () => {},
    _add: id => (byId[id] = makeEl(id))
  };
  /* Every id the atlas markup provides. */
  ["atlas-map", "atlas-rail", "atlas-rail-list", "atlas-dossier", "atlas-doss-body",
   "atlas-doss-actions", "atlas-doss-handle", "atlas-layers", "atlas-note", "atlas-open", "atlas-fill",
   "atlas-count", "atlas-zin", "atlas-zout", "atlas-zfit", "atlas-rail-toggle", "v-atlas"
  ].forEach(doc._add);
  return doc;
}

/* ------------------------------ Leaflet stub ------------------------------ */

function makeLeaflet(log){
  function layer(kind, args){
    const l = {
      _kind: kind, _args: args, _added: false,
      addTo(m){ this._added = true; log.layers.push(this); m._layers.push(this); return this; },
      bringToBack(){ this._back = true; return this; },
      bringToFront(){ return this; },
      on(t, fn){ (this._on = this._on || {})[t] = fn; return this; },
      setStyle(){ return this; },
      getElement(){ return this._el || (this._el = makeEl("", "div")); },
      setIcon(i){ this._icon = i; return this; },
      setLatLng(c){ this._latlng = c; return this; },
      getLatLng(){ return this._latlng; },
      remove(){ this._added = false; }
    };
    return l;
  }

  const L = {
    map(host, opts){
      const m = {
        _host: host, _opts: opts, _layers: [], _on: {},
        _zoom: opts.zoom, _center: opts.center, _flights: 0,
        setView(c, z){ this._center = c; if(z != null) this._zoom = z; log.setView++; return this; },
        flyTo(c, z){ this._center = c; if(z != null) this._zoom = z; this._flights++; log.flyTo++; return this; },
        flyToBounds(){ this._flights++; log.fitBounds++; return this; },
        fitBounds(){ this._flights++; log.fitBounds++; return this; },
        getZoom(){ return this._zoom; },
        setZoom(z){ this._zoom = z; return this; },
        on(t, fn){ this._on[t] = fn; return this; },
        off(){ return this; },
        removeLayer(l){ this._layers = this._layers.filter(x => x !== l); log.removed++; return this; },
        invalidateSize(){ log.invalidate++; return this; },
        addLayer(l){ this._layers.push(l); return this; },
        hasLayer(l){ return this._layers.indexOf(l) >= 0; }
      };
      log.maps.push(m);
      return m;
    },
    tileLayer(url, o){ const l = layer("tile", [url, o]); log.tiles.push(l); return l; },
    polyline(c, o){ const l = layer("polyline", [c, o]); log.lines.push(l); return l; },
    polygon(c, o){ const l = layer("polygon", [c, o]); log.polys.push(l); return l; },
    marker(c, o){ const l = layer("marker", [c, o]); log.markers.push(l); return l; },
    divIcon(o){ log.icons.push(o); return {_icon: o}; },
    latLngBounds(pts){ return { pad(){ return this; }, _pts: pts }; },
    control: { scale(){ return { addTo(){ return this; } }; } }
  };
  return L;
}

/* ------------------------------ load ------------------------------ */

function loadAtlas(opts){
  opts = opts || {};
  const log = {
    maps: [], tiles: [], lines: [], polys: [], markers: [], icons: [], layers: [],
    setView: 0, flyTo: 0, fitBounds: 0, invalidate: 0, removed: 0
  };
  const doc = makeDocument();
  const L = opts.noLeaflet ? undefined : makeLeaflet(log);

  const header = "var window = GLOBALS.window, document = GLOBALS.document," +
                 " L = GLOBALS.L, requestAnimationFrame = GLOBALS.raf," +
                 " matchMedia = GLOBALS.window.matchMedia, fetch = GLOBALS.fetch;\n";

  const src = header +
    FILES.map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n") +
    "\n;module.exports = {Atlas: Atlas, Pilgrimage: Pilgrimage, Geo: Geo, Live: Live," +
    " SITES: SITES, ARCS: ARCS, ROUTES: ROUTES, EMPIRES: EMPIRES," +
    " EMPIRE_SHAPES: EMPIRE_SHAPES, HOME_VIEW: HOME_VIEW};";

  const m = new Module(path.join(ROOT, "js/__atlas__.js"));
  m.filename = path.join(ROOT, "js/__atlas__.js");
  m.paths = Module._nodeModulePaths(path.join(ROOT, "js"));

  /* requestAnimationFrame is synchronous here on purpose: mount() defers
     its measure-and-draw into one, and a test that had to await a real
     frame would be racy for no benefit. */
  const GLOBALS = {
    window: {
      innerWidth: 1280, innerHeight: 800,
      matchMedia: () => ({ matches: !!opts.reducedMotion, addListener(){}, addEventListener(){} })
    },
    document: doc,
    L: L,
    raf: fn => { fn(); return 1; },
    fetch: opts.fetch || null
  };

  const wrapper = Module.wrap("var GLOBALS = arguments[5];\n" + src);
  const fn = require("vm").runInThisContext(wrapper, {filename: m.filename});
  fn.call(m.exports, m.exports, id => m.require(id), m, m.filename, path.dirname(m.filename), GLOBALS);

  const api = m.exports;
  api.Pilgrimage.attach({SITES: api.SITES, ARCS: api.ARCS, VERSES: opts.verses || []});
  return Object.assign(api, {doc, L, log, makeEl});
}

module.exports = { loadAtlas, makeEl, makeDocument, makeLeaflet, ROOT, FILES };
