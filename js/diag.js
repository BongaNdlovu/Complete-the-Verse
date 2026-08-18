/* ==================================================================
   DIAG — client diagnostics, error buffer, and save failure tracking.

   Pure and parse-safe: no references to SAVE or R at parse time.
   Maintains a ring buffer of the last 20 runtime events in sessionStorage.
   ================================================================== */

var Diag = (function () {
  var KEY = "ctv_diag_v1";
  var MAX_EVENTS = 20;
  var _memRing = [];

  function _loadRing() {
    try {
      if (typeof sessionStorage === "undefined") return _memRing.slice();
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return _memRing.slice();
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return _memRing.slice();
    }
  }

  function _saveRing(arr) {
    _memRing = arr.slice(-MAX_EVENTS);
    try {
      if (typeof sessionStorage === "undefined") return;
      sessionStorage.setItem(KEY, JSON.stringify(_memRing));
    } catch (e) {}
  }

  function record(ev) {
    if (!ev || typeof ev !== "object") return;
    var entry = {
      kind: String(ev.kind || "info"),
      message: String(ev.message || ""),
      stack: ev.stack ? String(ev.stack).slice(0, 500) : "",
      at: ev.at || new Date().toISOString()
    };
    var ring = _loadRing();
    ring.push(entry);
    if (ring.length > MAX_EVENTS) ring = ring.slice(-MAX_EVENTS);
    _saveRing(ring);
  }

  function dump() {
    var ring = _loadRing();
    var ua = (typeof navigator !== "undefined" && navigator.userAgent) || "unknown";
    var saveVer = (typeof SAVE !== "undefined" && SAVE && SAVE.v) ? SAVE.v : "unknown";
    var out = [
      "=== COMPLETE THE VERSE — DIAGNOSTICS ===",
      "Timestamp: " + new Date().toISOString(),
      "User Agent: " + ua,
      "Save Schema: " + saveVer,
      "Recorded Events (" + ring.length + "):",
      "----------------------------------------"
    ];
    if (!ring.length) {
      out.push("(No diagnostic events recorded)");
    } else {
      ring.forEach(function (e, i) {
        out.push("[" + (i + 1) + "] " + e.at + " [" + e.kind + "] " + e.message);
        if (e.stack) out.push("    " + e.stack.split("\n")[0]);
      });
    }
    out.push("========================================");
    return out.join("\n");
  }

  function install() {
    if (typeof window === "undefined") return;
    window.addEventListener("error", function (ev) {
      record({
        kind: "uncaught-error",
        message: ev.message || "Unknown error",
        stack: ev.error && ev.error.stack
      });
    });
    window.addEventListener("unhandledrejection", function (ev) {
      record({
        kind: "unhandled-rejection",
        message: (ev.reason && (ev.reason.message || String(ev.reason))) || "Promise rejected",
        stack: ev.reason && ev.reason.stack
      });
    });
  }

  return {
    record: record,
    dump: dump,
    install: install,
    _loadRing: _loadRing,
    _saveRing: _saveRing
  };
})();

if (typeof window !== "undefined") {
  Diag.install();
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Diag;
}
