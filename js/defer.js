/* ==================================================================
   DEFER — load play, atlas, and extra banks after first paint.

   Classic script tags stay on the boot path so file:// still works.
   These packs are injected the first time a view needs them, then
   idle-prefetched once the hall is open so a later offline session
   still has the full bank. Node tests have no document.head, so every
   loader resolves immediately and the suites keep concatenating files.
   ================================================================== */
var Defer = (function () {
  var PACKS = {
    play: ["css/play.css"],
    banks: ["js/verses-ascent.js", "js/verses-tf.js"],
    tablets: ["css/tablets.css", "js/tablets-more.js"],
    atlas: ["vendor/leaflet/leaflet.css", "css/atlas.css", "vendor/leaflet/leaflet.js"]
  };
  var loading = {};
  var done = {};

  function headless() {
    if (typeof document === "undefined" || !document.head) return true;
    if (typeof HTMLScriptElement === "undefined") return true;
    try {
      if (typeof navigator !== "undefined" && /node/i.test(navigator.userAgent || "")) return true;
    } catch (e) { return true; }
    return false;
  }
  function already(src) {
    if (done[src]) return true;
    if (src.indexOf("verses-ascent") >= 0) return typeof VERSES_ASCENT !== "undefined";
    if (src.indexOf("verses-tf") >= 0) return typeof TF_CLAIMS !== "undefined";
    if (src.indexOf("tablets-more") >= 0) {
      return typeof Tablets !== "undefined" && Tablets.more && Tablets.more.length;
    }
    if (src.indexOf("leaflet.js") >= 0) return typeof L !== "undefined";
    if (typeof document === "undefined") return false;
    return !!(document.querySelector('script[src="' + src + '"], link[href="' + src + '"]'));
  }
  function afterScript(src) {
    if (src.indexOf("verses-ascent") >= 0 && typeof absorbDeferredBanks === "function") {
      absorbDeferredBanks();
    }
  }
  function loadCss(href) {
    if (already(href) || headless()) { done[href] = true; return Promise.resolve(); }
    if (loading[href]) return loading[href];
    loading[href] = new Promise(function (resolve) {
      var el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      el.onload = function () { done[href] = true; resolve(); };
      el.onerror = function () { done[href] = true; resolve(); };
      document.head.appendChild(el);
    });
    return loading[href];
  }
  function loadScript(src) {
    if (already(src) || headless()) {
      done[src] = true;
      afterScript(src);
      return Promise.resolve();
    }
    if (loading[src]) return loading[src];
    loading[src] = new Promise(function (resolve) {
      var el = document.createElement("script");
      el.src = src;
      el.onload = function () { done[src] = true; afterScript(src); resolve(); };
      el.onerror = function () { done[src] = true; resolve(); };
      (document.body || document.head).appendChild(el);
    });
    return loading[src];
  }
  function loadOne(url) {
    return /\.css$/i.test(url) ? loadCss(url) : loadScript(url);
  }
  function loadPack(name) {
    var list = PACKS[name] || [];
    return Promise.all(list.map(loadOne));
  }
  function readyFor(mode) {
    if (headless()) return true;
    var banks = already(PACKS.banks[0]) && already(PACKS.banks[1]);
    var play = already(PACKS.play[0]);
    if (mode === "atlas") return already(PACKS.atlas[PACKS.atlas.length - 1]) && already(PACKS.atlas[0]);
    if (mode === "tablets") return banks && play && already(PACKS.tablets[1]) && already(PACKS.tablets[0]);
    return banks && play;
  }
  function forRun(mode) {
    var jobs = [loadPack("play"), loadPack("banks")];
    if (mode === "tablets") jobs.push(loadPack("tablets"));
    return Promise.all(jobs);
  }
  function forAtlas() { return loadPack("atlas"); }
  function forTablets() { return Promise.all([loadPack("tablets"), loadPack("banks")]); }
  function prefetch() {
    return Promise.all([loadPack("play"), loadPack("banks"), loadPack("tablets"), loadPack("atlas")]);
  }

  var api = {
    PACKS: PACKS,
    readyFor: readyFor,
    forRun: forRun,
    forAtlas: forAtlas,
    forTablets: forTablets,
    prefetch: prefetch
  };
  if (typeof module !== "undefined" && module.exports) module.exports = { Defer: api };
  return api;
})();
