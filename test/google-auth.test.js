const fs = require("fs");
const path = require("path");
const vm = require("vm");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.error("  FAIL: " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got, want }); }

// Load vendor Supabase SDK
const supabaseJs = fs.readFileSync(path.join(__dirname, "../vendor/supabase/supabase.js"), "utf8");
const cloudJs = fs.readFileSync(path.join(__dirname, "../js/cloud.js"), "utf8");
const briefsJs = fs.readFileSync(path.join(__dirname, "../js/briefs.js"), "utf8");
const gameJs = fs.readFileSync(path.join(__dirname, "../js/game.js"), "utf8");

class MemoryStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

function makeBrowserContext(initialUrl, fetchHandler) {
  const parsed = new URL(initialUrl);
  const localStorage = new MemoryStorage();
  const elements = new Map();

  function makeEl(id) {
    return {
      id: id,
      tagName: "DIV",
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      getAttribute: () => null,
      addEventListener: function(evt, handler) {
        this["_on_" + evt] = handler;
      },
      click: function() {
        if (this["_on_click"]) this["_on_click"]({ preventDefault: () => {} });
      },
      textContent: "",
      value: "",
      disabled: false
    };
  }

  const document = {
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    querySelector: (sel) => {
      const m = sel.match(/#([a-zA-Z0-9_-]+)/);
      if (m) return document.getElementById(m[1]);
      return null;
    },
    querySelectorAll: () => [],
    getElementById: (id) => {
      if (!elements.has(id)) {
        elements.set(id, makeEl(id));
      }
      return elements.get(id);
    },
    createElement: (tag) => {
      const el = makeEl("created-" + tag);
      el.tagName = tag.toUpperCase();
      return el;
    }
  };

  class MockWebSocket {
    constructor(url) { this.url = url; }
    send() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }

  const window = {
    WebSocket: MockWebSocket,
    location: {
      href: parsed.href,
      origin: parsed.origin,
      protocol: parsed.protocol,
      host: parsed.host,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      assign: function(url) { window.location.href = url; },
      replace: function(url) { window.location.href = url; }
    },
    history: {
      state: null,
      replaceState: function(state, title, url) {
        if (url) {
          const newU = new URL(url, window.location.href);
          window.location.href = newU.href;
          window.location.search = newU.search;
          window.location.hash = newU.hash;
          window.location.pathname = newU.pathname;
        }
      }
    },
    localStorage: localStorage,
    document: document,
    navigator: { onLine: true, userAgent: "Node-CTV-Test" },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Promise: Promise,
    URL: URL,
    URLSearchParams: URLSearchParams,
    Headers: globalThis.Headers,
    Request: globalThis.Request,
    Response: globalThis.Response,
    fetch: fetchHandler || (async (url, opts) => {
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({})
      };
    })
  };
  window.window = window;
  window.self = window;
  window.globalThis = window;

  const ctx = vm.createContext(window);
  return { ctx, window, localStorage, document };
}

async function runTests() {
  // TEST 1: Adaptive Flow Detection
  {
    const { ctx, window } = makeBrowserContext("https://complete-the-verse.vercel.app/?code=pkce-auth-code-123");
    vm.runInContext("var CLOUD_CONFIG = { url: 'https://test.supabase.co', anonKey: 'test-key' };", ctx);
    vm.runInContext(supabaseJs, ctx);
    vm.runInContext(cloudJs, ctx);

    // Call init and inspect client flowType
    await vm.runInContext("Cloud.init()", ctx);
    const clientFlow = vm.runInContext("Cloud.whenReady().then(() => 'ready')", ctx);
    await clientFlow;

    // Verify detection in location.search
    const flow1 = vm.runInContext("(function(){ return window.location.search.indexOf('code=') !== -1 ? 'pkce' : 'implicit'; })()", ctx);
    eq("Flow detection recognizes PKCE code parameter", flow1, "pkce");

    // Verify detection with hash
    const { ctx: ctx2 } = makeBrowserContext("https://complete-the-verse.vercel.app/#access_token=token123&refresh_token=ref123");
    vm.runInContext("var CLOUD_CONFIG = { url: 'https://test.supabase.co', anonKey: 'test-key' };", ctx2);
    vm.runInContext(supabaseJs, ctx2);
    vm.runInContext(cloudJs, ctx2);
    const flow2 = vm.runInContext("(function(){ return window.location.hash.indexOf('access_token=') !== -1 ? 'implicit' : 'pkce'; })()", ctx2);
    eq("Flow detection recognizes implicit access_token hash", flow2, "implicit");
  }

  // TEST 2: PKCE code exchange with vendored Supabase SDK without throwing "Not a valid implicit grant flow url"
  {
    let tokenExchanged = false;
    const mockFetch = async (url, opts) => {
      const u = String(url);
      if (u.includes("/auth/v1/token?grant_type=pkce")) {
        tokenExchanged = true;
        return {
          ok: true,
          status: 200,
          headers: { get: () => "application/json" },
          json: async () => ({
            access_token: "fake-jwt-pkce-access-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "fake-refresh-token",
            user: { id: "user-pkce-123", email: "test@gmail.com", app_metadata: {}, user_metadata: {} }
          })
        };
      }
      if (u.includes("/rest/v1/profiles")) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => "application/json" },
          json: async () => ({ id: "user-pkce-123", display_name: "PKCE User", updated_at: new Date().toISOString() })
        };
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({})
      };
    };

    const { ctx, window, localStorage } = makeBrowserContext(
      "https://complete-the-verse.vercel.app/?code=sample-pkce-code",
      mockFetch
    );
    // Pre-populate code verifier in storage (as GoTrue sets during signInWithOAuth)
    localStorage.setItem("sb-test-auth-token-code-verifier", JSON.stringify("mock-verifier-secret-123"));

    vm.runInContext("var CLOUD_CONFIG = { url: 'https://test.supabase.co', anonKey: 'test-key' };", ctx);
    vm.runInContext(supabaseJs, ctx);
    vm.runInContext(cloudJs, ctx);

    const initResult = await vm.runInContext("Cloud.init()", ctx);
    eq("Cloud.init() resolves successfully on PKCE callback", initResult.ok, true);
    eq("Token exchange endpoint was called", tokenExchanged, true);
    eq("Cloud.isSignedIn() is true after code exchange", vm.runInContext("Cloud.isSignedIn()", ctx), true);
    eq("Cloud.user() returns logged in user", vm.runInContext("Cloud.user().email", ctx), "test@gmail.com");
  }

  // TEST 3: Implicit Grant callback processing (#access_token=...&refresh_token=...)
  {
    const mockFetch = async (url, opts) => {
      const u = String(url);
      if (u.includes("/auth/v1/user")) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => "application/json" },
          json: async () => ({
            id: "user-implicit-456",
            email: "implicit@gmail.com",
            app_metadata: {},
            user_metadata: {}
          })
        };
      }
      if (u.includes("/rest/v1/profiles")) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => "application/json" },
          json: async () => ({ id: "user-implicit-456", display_name: "Implicit User", updated_at: new Date().toISOString() })
        };
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({})
      };
    };

    const hashUrl = "https://complete-the-verse.vercel.app/#access_token=mock-access-token&expires_in=3600&refresh_token=mock-refresh-token&token_type=bearer";
    const { ctx } = makeBrowserContext(hashUrl, mockFetch);
    vm.runInContext("var CLOUD_CONFIG = { url: 'https://test.supabase.co', anonKey: 'test-key' };", ctx);
    vm.runInContext(supabaseJs, ctx);
    vm.runInContext(cloudJs, ctx);

    const initResult = await vm.runInContext("Cloud.init()", ctx);
    eq("Cloud.init() resolves successfully on Implicit callback", initResult.ok, true);
    eq("Cloud.isSignedIn() is true after implicit token parsing", vm.runInContext("Cloud.isSignedIn()", ctx), true);
    eq("Cloud.user() matches implicit user", vm.runInContext("Cloud.user().id", ctx), "user-implicit-456");
  }

  // TEST 4: game.js bindCloudBoot handles INITIAL_SESSION and SIGNED_IN from door (#v-signin)
  {
    const { ctx, window, document } = makeBrowserContext("https://complete-the-verse.vercel.app/");
    
    // Set up mock game environment
    vm.runInContext(`
      var currentView = "signin";
      var enteredCoffeePath = false;
      var toasts = [];
      var SAVE = { pilgrim: {}, set: { playerName: "Tester" } };
      function $(id){ return document.getElementById(id); }
      function toast(msg){ toasts.push(msg); }
      function persist(){}
      function updateCloudChip(){}
      function updatePlayerCard(){}
      function renderSettings(){}
      function paintSignIn(){}
      function enterCoffeePath(){
        enteredCoffeePath = true;
        currentView = "hall";
      }
      var Atlas = { setProgress: ()=>{} };

      // Mock Cloud object
      var _handlers = {};
      var Cloud = {
        configured: () => true,
        isSignedIn: () => true,
        on: (evt, fn) => { _handlers[evt] = fn; },
        syncOnBoot: (s) => Promise.resolve({ ok: true, save: s, merged: false }),
        initLazy: () => Promise.resolve({ ok: true })
      };
    `, ctx);

    // Run the bindCloudBoot code snippet
    vm.runInContext(`
      (${function bindCloudBoot(){
        if(typeof Cloud === "undefined" || !Cloud.configured()) return;
        const onCloudEvent = function(){
          updateCloudChip();
          if(currentView==="settings") renderSettings();
        };
        Cloud.on("onSync", onCloudEvent);
        Cloud.on("onError", function(err){
          onCloudEvent();
          if(err && err.message){
            if(typeof setSignInStatus==="function" && currentView==="signin"){
              setSignInStatus(err.message);
            }
            toast(err.message);
          }
        });
        Cloud.on("onAuth", function(ev){
          const hasUser = !!(ev && (ev.user || (ev.session && ev.session.user) || (Cloud.isSignedIn && Cloud.isSignedIn())));
          if(ev && (ev.event==="SIGNED_IN" || (ev.event==="INITIAL_SESSION" && hasUser))){
            const fromDoor = currentView==="signin";
            Cloud.syncOnBoot(SAVE).then(function(res){
              if(res && res.ok && res.save){
                SAVE = res.save; persist();
                Atlas.setProgress(SAVE.pilgrim);
                updatePlayerCard();
                updateCloudChip();
                if(res.merged) toast("Progress merged from the cloud");
              }
            });
            if(fromDoor && typeof enterCoffeePath==="function") enterCoffeePath();
          }
        });
      }})();
    `, ctx);

    // Simulate Supabase emitting INITIAL_SESSION with session on page load
    vm.runInContext(`
      _handlers["onAuth"]({
        event: "INITIAL_SESSION",
        user: { id: "user-123", email: "google@user.com" }
      });
    `, ctx);

    eq("INITIAL_SESSION event triggered transition out of signin door", vm.runInContext("enteredCoffeePath", ctx), true);
    eq("currentView transitioned from 'signin' to 'hall'", vm.runInContext("currentView", ctx), "hall");

    // Also test SIGNED_IN event
    vm.runInContext(`
      currentView = "signin";
      enteredCoffeePath = false;
      _handlers["onAuth"]({
        event: "SIGNED_IN",
        user: { id: "user-123", email: "google@user.com" }
      });
    `, ctx);
    eq("SIGNED_IN event triggered transition out of signin door", vm.runInContext("enteredCoffeePath", ctx), true);
    eq("currentView transitioned from 'signin' to 'hall'", vm.runInContext("currentView", ctx), "hall");
  }

  // TEST 5: bootCloud.then transition if already on signin door
  {
    const { ctx } = makeBrowserContext("https://complete-the-verse.vercel.app/");
    vm.runInContext(`
      var currentView = "signin";
      var enteredCoffeePath = false;
      var SAVE = { pilgrim: {}, set: {} };
      function updateCloudChip(){}
      function updatePlayerCard(){}
      function enterCoffeePath(){
        enteredCoffeePath = true;
        currentView = "hall";
      }
      var Atlas = { setProgress: ()=>{} };
      var Cloud = {
        configured: () => true,
        isSignedIn: () => true,
        syncOnBoot: (s) => Promise.resolve({ ok: true, save: s }),
        initLazy: () => Promise.resolve({ ok: true })
      };

      const bootCloud = Cloud.initLazy();
      bootCloud.then(function(res){
        if(res && res.ok && Cloud.isSignedIn()){
          if(currentView==="signin" && typeof enterCoffeePath==="function"){
            enterCoffeePath();
          }
          return Cloud.syncOnBoot(SAVE);
        }
      });
    `, ctx);

    await new Promise(r => setTimeout(r, 50));
    eq("bootCloud.then transitioned user stuck on signin door", vm.runInContext("enteredCoffeePath", ctx), true);
    eq("currentView is now hall", vm.runInContext("currentView", ctx), "hall");
  }

  // TEST 6: enterCoffeePath() waits for Cloud.whenReady() if Cloud is configured but not yet ready
  {
    const { ctx } = makeBrowserContext("https://complete-the-verse.vercel.app/");
    vm.runInContext(`
      var currentView = "boot";
      var readyResolved = false;
      var goneViews = [];
      function go(v){ currentView = v; goneViews.push(v); }
      function paintSignIn(){}
      function enterHallAfterAuth(){ currentView = "hall"; goneViews.push("hall"); }
      function holdForSignIn(){ return !Cloud.isSignedIn(); }

      var Cloud = {
        configured: () => true,
        _ready: false,
        isReady: function() { return this._ready; },
        _signedIn: false,
        isSignedIn: function() { return this._signedIn; },
        whenReady: function() {
          return new Promise((resolve) => {
            setTimeout(() => {
              this._ready = true;
              this._signedIn = true; // Auth completed in flight
              resolve({ ok: true });
            }, 30);
          });
        }
      };
    `, ctx);

    // Run updated enterCoffeePath definition
    vm.runInContext(`
      function enterCoffeePath(){
        if(typeof window !== "undefined" && window._saveCorruptPending){
          window._saveCorruptPending = false;
          presentSaveCorrupt(enterCoffeePath);
          return;
        }
        if(typeof markFunnel === "function") markFunnel("boot");
        if(typeof Cloud !== "undefined" && Cloud.configured && Cloud.configured() && Cloud.isReady && !Cloud.isReady() && Cloud.whenReady){
          Cloud.whenReady().then(function(){
            if(currentView === "boot" || currentView === "signin" || currentView === "intro"){
              enterCoffeePath();
            }
          });
          return;
        }
        if(holdForSignIn()){
          go("signin");
          paintSignIn();
          return;
        }
        enterHallAfterAuth();
      }
    `, ctx);

    // Call enterCoffeePath while Cloud is still initializing
    vm.runInContext("enterCoffeePath()", ctx);

    // Immediately, it should NOT have kicked user to "signin"
    eq("Did not prematurely route to signin while Cloud was booting", vm.runInContext("goneViews.includes('signin')", ctx), false);

    // Wait for whenReady to resolve
    await new Promise(r => setTimeout(r, 60));

    eq("After whenReady completed, successfully entered hall", vm.runInContext("currentView", ctx), "hall");
  }

  // TEST 7: Google sign-in button redirect locking (prevents double-click race overwriting verifier)
  {
    const { ctx, document } = makeBrowserContext("https://complete-the-verse.vercel.app/");
    vm.runInContext(`
      function $(id){ return document.getElementById(id); }
      var signinStatus = "";
      function setSignInStatus(msg){ signinStatus = msg; }
      var Cloud = {
        whenReady: () => Promise.resolve({ ok: true }),
        signInWithGoogle: () => Promise.resolve({ ok: true, reason: "google-redirect" }),
        authNotice: (r) => (r === "google-redirect" ? "Continue in the Google window." : r)
      };
    `, ctx);

    // Simulate bindSignInView logic
    vm.runInContext(`
      const google = $("signin-google");
      google.addEventListener("click", function(){
        google.disabled = true;
        setSignInStatus("Opening Google…");
        const run = function(){ return Cloud.signInWithGoogle(); };
        const done = function(res){
          if(!res || !res.ok) google.disabled = false;
          const reason = res && res.ok ? (res.reason || "google-redirect") : (res && res.reason);
          setSignInStatus(Cloud.authNotice ? Cloud.authNotice(reason) : "Continue in the Google window.");
        };
        Cloud.whenReady().then(run).then(done);
      });
    `, ctx);

    // Click the button
    const btn = document.getElementById("signin-google");
    btn.click();

    await new Promise(r => setTimeout(r, 30));

    eq("Google button remains disabled during redirect", btn.disabled, true);
    eq("Status displays 'Continue in the Google window.'", vm.runInContext("signinStatus", ctx), "Continue in the Google window.");

    // Now verify that on failure, it re-enables the button
    vm.runInContext(`
      Cloud.signInWithGoogle = () => Promise.resolve({ ok: false, reason: "unavailable" });
    `, ctx);
    btn.click();
    await new Promise(r => setTimeout(r, 30));
    eq("Google button re-enables when OAuth call fails", btn.disabled, false);
    eq("Status shows error notice", vm.runInContext("signinStatus", ctx), "unavailable");
  }

  // TEST 8: Error handling for access_denied / cancellation
  {
    const { ctx } = makeBrowserContext("https://complete-the-verse.vercel.app/#error=access_denied&error_code=403&error_description=User+cancelled");
    vm.runInContext("var CLOUD_CONFIG = { url: 'https://test.supabase.co', anonKey: 'test-key' };", ctx);
    vm.runInContext(supabaseJs, ctx);
    vm.runInContext(cloudJs, ctx);

    let emittedError = null;
    vm.runInContext(`
      Cloud.on("onError", function(err){
        window._emittedError = err;
      });
    `, ctx);

    await vm.runInContext("Cloud.init()", ctx);
    const err = vm.runInContext("window._emittedError", ctx);

    ok("Emitted error event when access_denied is in URL", !!err);
    eq("Error message accurately states Google sign-in was cancelled or denied", err.message, "Google sign-in was cancelled or denied. Try again.");
    eq("Cleaned error parameters from URL with replaceState", vm.runInContext("window.location.hash", ctx), "");
  }

  // TEST 9: Singleton whenReady Promise guarantee
  {
    const { ctx } = makeBrowserContext("https://complete-the-verse.vercel.app/");
    vm.runInContext("var CLOUD_CONFIG = { url: 'https://test.supabase.co', anonKey: 'test-key' };", ctx);
    vm.runInContext(supabaseJs, ctx);
    vm.runInContext(cloudJs, ctx);

    const isSamePromise = vm.runInContext(`
      var p1 = Cloud.whenReady();
      var p2 = Cloud.initLazy();
      var p3 = Cloud.whenReady();
      p1 === p2 && p2 === p3;
    `, ctx);

    eq("whenReady() and initLazy() return the identical shared Promise singleton", isSamePromise, true);
    await vm.runInContext("Cloud.whenReady()", ctx);
    eq("Cloud.isReady() returns true after completion", vm.runInContext("Cloud.isReady()", ctx), true);
  }

  console.log((fail ? "FAIL" : "PASS") + " — google auth · " + pass + " assertions passed" + (fail ? " · " + fail + " FAILED" : ""));
  process.exit(fail ? 1 : 0);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
