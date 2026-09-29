/* In the standalone Android app every asset is already local through
   WebViewAssetLoader — a service worker would only double-cache them and
   churn storage at boot, so registration is skipped there. */
if (typeof runningInStandaloneApp === "function" && runningInStandaloneApp()) {
  console.log("ctv-sw: skipped — assets are local in the standalone app");
} else if ("serviceWorker" in navigator) {
  /* A worker that is already running must reload the page when a new one
     takes over, or the open tab keeps the previous scripts in memory. */
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      function reloadWhenSafe() {
        var view = typeof currentView === "string" ? currentView : "";
        if (view === "play" || view === "tablets") {
          setTimeout(reloadWhenSafe, 2000);
          return;
        }
        window.location.reload();
      }
      reloadWhenSafe();
    });
  }
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).then(function (reg) {
      function check() {
        reg.update().catch(function () {});
      }
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) check();
      });
      setInterval(check, 60 * 60 * 1000);
      check();
    }).catch(function (err) {
      if (typeof Diag !== "undefined" && Diag.record) {
        Diag.record({
          kind: "sw-register-fail",
          message: (err && err.message) || String(err || "register failed")
        });
      }
    });
  });
}
