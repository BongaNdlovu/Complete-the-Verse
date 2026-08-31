if ("serviceWorker" in navigator) {
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
