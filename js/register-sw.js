/* In the standalone Android app every asset is already local through
   WebViewAssetLoader — a service worker would only double-cache them and
   churn storage at boot, so registration is skipped there. */
if (typeof runningInStandaloneApp === "function" && runningInStandaloneApp()) {
  console.log("ctv-sw: skipped — assets are local in the standalone app");
} else if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").catch(function (err) {
      if (typeof Diag !== "undefined" && Diag.record) {
        Diag.record({
          kind: "sw-register-fail",
          message: (err && err.message) || String(err || "register failed")
        });
      }
    });
  });
}
