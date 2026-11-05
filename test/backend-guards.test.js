/* Backend abuse guards and the client side of them (2026-11 audit).
   SQL behaviour is proven against a real Postgres in the audit run; here the files are pinned so none of the guards
   can be dropped quietly, and the client code is exercised with a stub Supabase client. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got: got, want: want }); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n"); }

const mig8 = read("supabase/migrations/008_abuse_guards.sql");
const combined = require("../scripts/build-combined-migrations.js");

/* ---------- 1. run_ghosts: formats and a row cap ---------- */
ok("1 run_key format is fixed", /run_key !~ '\^\[A-Za-z0-9:~\._-\]\+\$'/.test(mig8));
ok("1 mode format is fixed", /mode !~ '\^\[a-z\]\[a-z0-9-\]\*\$'/.test(mig8));
ok("1 the trim runs after each insert", /create trigger run_ghosts_trim\s+after insert on public\.run_ghosts/.test(mig8));
ok("1 the trim function can delete although clients cannot", /function public\.trim_run_ghosts\(\)[\s\S]*?security definer/.test(mig8));
ok("1 pilgrimage keeps 64, every other mode 8, and the total is 100",
  /when 'pilgrimage' then 64 else 8 end/.test(mig8) && /total_cap constant int := 100/.test(mig8));
ok("1 the row just written is never the one trimmed", (mig8.match(/order by \(id = new\.id\) desc/g) || []).length === 2);
ok("1 the trim function is not callable by clients", /revoke all on function public\.trim_run_ghosts\(\) from anon, authenticated/.test(mig8));

/* ---------- 2. saves: a size guard, and unchanged pushes are skipped ---------- */
ok("2 the save blob is capped at 1 MiB", /pg_column_size\(new\.payload\) > 1048576/.test(mig8));
ok("2 the save blob must be an object", /jsonb_typeof\(new\.payload\) <> 'object'/.test(mig8));
ok("2 the guard covers insert and update", /create trigger saves_guard\s+before insert or update on public\.saves/.test(mig8));

/* ---------- 4. the submission log is pruned; the function pins its JWT check and its origins ---------- */
ok("4 the log is pruned after 30 days", /created_at < now\(\) - interval '30 days'/.test(mig8));
ok("4 the prune is scheduled daily when pg_cron exists", /cron\.schedule\(\s*'prune-score-submission-log',\s*'17 3 \* \* \*'/.test(mig8));
ok("4 a missing pg_cron does not fail the migration", /exception when others then\s+raise notice 'pg_cron schedule skipped/.test(mig8));
ok("4 the prune is not callable by clients", /revoke all on function public\.prune_score_submission_log\(\) from anon, authenticated/.test(mig8));
ok("4 the gateway checks the JWT for submit-score", /\[functions\.submit-score\]\s*verify_jwt = true/.test(read("supabase/config.toml")));
{
  const edge = read("supabase/functions/submit-score/index.ts");
  ok("4 CORS no longer answers every origin", !/"Access-Control-Allow-Origin": "\*"/.test(edge));
  const start = edge.indexOf("const ALLOWED_ORIGINS");
  const end = edge.indexOf("function json(");
  const js = edge.slice(start, end)
    .replace(/: (Request|Response)/g, "")
    .replace(/Deno\.env\.get\("ALLOWED_ORIGINS"\)/, "ENV_ORIGINS");
  function corsFor(envOrigins, origin) {
    const ctx = vm.createContext({ ENV_ORIGINS: envOrigins, Headers, Response, Request });
    vm.runInContext("const CORS_HEADERS = {};\n" + js + ";this.withCors = withCors;", ctx);
    const req = new Request("https://fn.example/", { headers: origin ? { Origin: origin } : {} });
    const res = ctx.withCors(req, new Response("{}", { status: 201, headers: { "Content-Type": "application/json" } }));
    return { allow: res.headers.get("Access-Control-Allow-Origin"), status: res.status, type: res.headers.get("Content-Type") };
  }
  const game = "https://complete-the-verse.vercel.app";
  eq("4 the game's own origin is echoed", corsFor(undefined, game).allow, game);
  eq("4 another site is answered with the game's origin, not its own", corsFor(undefined, "https://evil.example").allow, game);
  eq("4 no Origin header gets the game's origin", corsFor(undefined, "").allow, game);
  eq("4 the local dev server is allowed", corsFor(undefined, "http://localhost:8781").allow, "http://localhost:8781");
  eq("4 ALLOWED_ORIGINS adds a preview deployment", corsFor("https://a.vercel.app, https://b.vercel.app", "https://b.vercel.app").allow, "https://b.vercel.app");
  eq("4 the response keeps its status and body type", corsFor(undefined, game).status, 201);
  eq("4 the response keeps its content type", corsFor(undefined, game).type, "application/json");
  ok("4 the handler's response always passes through withCors", /Deno\.serve\(async \(req\) => withCors\(req, await handle\(req\)\)\)/.test(edge));
}

/* ---------- 5. the one-paste bundle is generated and current ---------- */
ok("5 combined_migrations.sql matches the migrations folder", combined.isFresh());
{
  const bundle = read("supabase/combined_migrations.sql");
  combined.migrationFiles().forEach(function (name) {
    ok("5 the bundle holds " + name, bundle.indexOf("-- FILE: " + name + "\n") >= 0);
  });
  ok("5 the bundle adds the daily translation column the scores function writes", /add column if not exists translation text/.test(bundle));
  ok("5 db:check is a package script", /"db:check": "node scripts\/build-combined-migrations\.js --check"/.test(read("package.json")));
}

/* ---------- 5. every migration has its own version (the CLI keys its history on the leading number) ---------- */
{
  const versions = combined.migrationFiles().map(function (name) { return /^(\d+)_/.exec(name)[1]; });
  eq("5 no two migrations share a version", new Set(versions).size, versions.length);
  const asNumbers = versions.map(Number);
  const byName = combined.migrationFiles().join("|");
  const byNumber = combined.migrationFiles().slice().sort(function (a, b) { return Number(/^(\d+)_/.exec(a)[1]) - Number(/^(\d+)_/.exec(b)[1]); }).join("|");
  eq("5 file-name order and version order are the same, so any tool applies them alike", byName, byNumber);
  ok("5 the lock migration kept its work under its new number", /revoke all on function public\.handle_new_user\(\) from anon, authenticated/.test(read("supabase/migrations/009_lock_trigger_functions.sql")));
  ok("5 versions are plain numbers", asNumbers.every(function (n) { return n > 0; }));
}

/* ---------- 11. the tip jar's numbers: public to read, the owner's alone to change ---------- */
{
  const mig10 = read("supabase/migrations/010_tip_jar.sql");
  ok("11 the table holds exactly one row", /constraint tip_jar_single_row check \(id = 1\)/.test(mig10) && /insert into public\.tip_jar \(id\) values \(1\) on conflict \(id\) do nothing/.test(mig10));
  ok("11 the total and goal are bounded", /raised_usd >= 0 and raised_usd <= 1000000/.test(mig10) && /goal_usd >= 1 and goal_usd <= 1000000/.test(mig10));
  ok("11 anyone may read it", /create policy "tip jar readable"\s+on public\.tip_jar for select\s+to anon, authenticated\s+using \(true\)/.test(mig10));
  ok("11 only a site admin may update it", /create policy "owner update tip jar"[\s\S]*?using \(public\.is_site_admin\(\)\)[\s\S]*?with check \(public\.is_site_admin\(\)\)/.test(mig10));
  ok("11 players may touch only the two numbers, never who or when", /grant update \(raised_usd, goal_usd\) on table public\.tip_jar to authenticated/.test(mig10) && /new\.updated_by := auth\.uid\(\)/.test(mig10));
  ok("11 players cannot insert or delete", /revoke insert, update, delete on table public\.tip_jar from anon, authenticated/.test(mig10) && !/grant insert[^;]*to authenticated/.test(mig10));
  ok("11 the touch function is not callable by clients", /revoke all on function public\.touch_tip_jar\(\) from anon, authenticated/.test(mig10));
  const page = read("admin.html");
  const hub = read("js/admin-hub.js");
  ok("11 the admin page has the tip jar card, hidden until the gate passes", /id="tip-card"/.test(page) && /class="card hidden" id="tip-card"/.test(page));
  ok("11 the card is shown only for an admin, in the same place as the composer", /function renderHub\(\) \{[\s\S]*?\$\("tip-card"\)\.classList\.remove\("hidden"\)[\s\S]*?refreshTipJar\(\)/.test(hub));
  ok("11 the card updates the one row, and an empty result is reported as not saved", /from\("tip_jar"\)\.update\(\{ raised_usd: form\.raised, goal_usd: form\.goal \}\)\.eq\("id", 1\)\.select\("id"\)/.test(hub) && /Nothing was saved: your account is not in site_admins/.test(hub));
  ok("11 the jar asks the cloud for the numbers when it opens", /Cloud\.fetchTipJar\(\)/.test(read("js/tip-jar.js")) && /id="tip-updated"/.test(read("index.html")));
  ok("11 the docs name the table", /tip_jar/.test(read("docs/BACKEND.md")));
}

/* ---------- 6. esc() escapes the single quote too ---------- */
{
  const escFrom = function (rel) {
    const src = read(rel);
    const m = /(?:const esc = (s => [^\n]+)|function esc\(s\) \{([\s\S]*?)\n  \})/.exec(src);
    const body = m[1] ? "(" + m[1].replace(/;\s*$/, "") + ")" : "(function esc(s) {" + m[2] + "\n})";
    return vm.runInNewContext(body);
  };
  ["js/util.js", "js/admin-hub.js", "js/leaderboard.js", "js/messages.js", "js/atlas.js"].forEach(function (rel) {
    const esc = escFrom(rel);
    eq("6 " + rel + " escapes a single quote", esc("a'b"), "a&#39;b");
    eq("6 " + rel + " still escapes the rest", esc("<a href=\"x\">&"), "&lt;a href=&quot;x&quot;&gt;&amp;");
  });
}

/* ---------- 3. the held send button counts down, restores its label, and survives a second hold ---------- */
{
  const src = read("js/util.js");
  const start = src.indexOf("function holdButton");
  const fnText = src.slice(start, src.indexOf("\n}\n", start) + 2);
  let now = 1000000;
  const timers = [];
  const ctx = vm.createContext({
    Date: { now: function () { return now; } }, Math: Math,
    setTimeout: function (fn, ms) { timers.push({ fn: fn, at: now + ms }); return timers.length; },
    clearTimeout: function (id) { if (timers[id - 1]) timers[id - 1].fn = null; }
  });
  vm.runInContext(fnText + ";this.holdButton = holdButton;", ctx);
  const advance = function (ms) {
    now += ms;
    timers.slice().forEach(function (t) { if (t.fn && t.at <= now) { const fn = t.fn; t.fn = null; fn(); } });
  };
  const btn = { textContent: "Send code", disabled: false };
  ctx.holdButton(btn, 60000);
  eq("3 a held button is off and shows the count", btn.disabled === true && btn.textContent, "Send code (60s)");
  advance(3000);
  eq("3 the count goes down", btn.textContent, "Send code (57s)");
  ctx.holdButton(btn, 60000);
  eq("3 a second hold keeps the real label", btn.textContent, "Send code (60s)");
  advance(59000);
  eq("3 still held a second before the end", btn.disabled, true);
  advance(1000);
  eq("3 the button comes back with its own label", btn.disabled === false && btn.textContent, "Send code");
  ctx.holdButton(btn, 2000);
  eq("3 and can be held again from the clean label", btn.textContent, "Send code (2s)");
  ctx.holdButton(null, 1000);
  ok("3 holding nothing is harmless", true);
  ok("3 util.js exposes it to the other scripts", /window.holdButton = holdButton/.test(src));
}

/* ---------- 7. the local save is scrubbed like the cloud copy ---------- */
{
  const src = read("js/save.js");
  const start = src.indexOf("function scrubSavePayload");
  const end = src.indexOf("function load()");
  const scrub = vm.runInNewContext("(" + src.slice(start, end).replace(/^[\s\S]*?(?=function scrubSavePayload)/, "").trim() + ")");
  const hostile = JSON.parse('{"__proto__":{"polluted":1},"constructor":{"x":1},"a":{"__proto__":{"b":2},"ok":true},"list":[{"prototype":1,"keep":2}]}');
  const clean = scrub(hostile);
  ok("7 the __proto__ key is dropped", !Object.prototype.hasOwnProperty.call(clean, "__proto__") && clean.polluted === undefined);
  ok("7 constructor and prototype keys are dropped", Object.keys(clean).indexOf("constructor") < 0 && Object.keys(clean.list[0]).indexOf("prototype") < 0);
  ok("7 ordinary keys survive", clean.a.ok === true && clean.list[0].keep === 2);
  ok("7 load() scrubs before it merges", /scrubSavePayload\(JSON\.parse\(raw\)\)/.test(src));
}

/* ---------- 2, 3, 8. the cloud client against a stub Supabase ---------- */
function bootCloud(options) {
  options = options || {};
  const calls = [];
  const state = { remote: options.remote === undefined ? { revision: 3 } : options.remote, hang: false, selectError: null, upsertError: null, otpError: null };
  const otpCalls = [];
  const builder = function (table) {
    const api = {
      select: function (cols) { api.cols = cols; return api; },
      eq: function () { return api; },
      order: function () { return api; },
      limit: function () {
        calls.push({ op: "list", table: table, cols: api.cols });
        return state.hang ? new Promise(function () {}) : Promise.resolve({ data: [], error: null });
      },
      maybeSingle: function () {
        calls.push({ op: "select", table: table, cols: api.cols });
        if (state.hang) return new Promise(function () {});
        return Promise.resolve({ data: state.remote, error: state.selectError });
      },
      upsert: function (row) {
        calls.push({ op: "upsert", table: table, row: row });
        if (state.hang) return new Promise(function () {});
        return Promise.resolve({ error: state.upsertError });
      }
    };
    return api;
  };
  const client = {
    auth: {
      onAuthStateChange: function (cb) { setImmediate(function () { cb("INITIAL_SESSION", { user: { id: "u1" } }); }); return { data: { subscription: {} } }; },
      getSession: function () { return Promise.resolve({ data: { session: { user: { id: "u1" } } } }); },
      signInWithOtp: function (args) {
        otpCalls.push(args);
        return Promise.resolve({ error: state.otpError });
      }
    },
    from: builder
  };
  const store = { "sb-proj-auth-token": JSON.stringify({ user: { id: "u1" }, refresh_token: "r" }) };
  const shown = [];
  const sandbox = {
    console: console, Promise: Promise, JSON: JSON, Date: Date, Math: Math, Object: Object, Array: Array, String: String, Number: Number, Error: Error,
    setImmediate: setImmediate, queueMicrotask: queueMicrotask,
    /* A real wait of 1 s or more elapses on the next tick, so a hung request times out at once. */
    setTimeout: function (fn, ms) { return ms >= 1000 ? setImmediate(fn) : setTimeout(fn, ms); },
    clearTimeout: function (t) { clearImmediate(t); clearTimeout(t); },
    navigator: { onLine: true },
    localStorage: { getItem: function (k) { return store[k] || null; }, setItem: function (k, v) { store[k] = String(v); }, removeItem: function (k) { delete store[k]; } },
    CLOUD_CONFIG: Object.assign({ url: "https://proj.supabase.co", anonKey: "k" }, options.config || {}),
    supabase: { createClient: function () { return client; } },
    module: { exports: {} }
  };
  if (options.turnstile) {
    sandbox.window = { turnstile: { render: function (host, opts) { shown.push(opts); opts.callback(options.turnstile); return 1; }, remove: function () {} } };
    sandbox.document = { head: {}, body: { appendChild: function () {} }, createElement: function () { return { style: {}, remove: function () {} }; } };
  }
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "cloud.js"), "utf8"), sandbox);
  return { Cloud: sandbox.module.exports, calls: calls, state: state, otpCalls: otpCalls, shown: shown };
}
const sync = function (calls) { return calls.filter(function (c) { return c.table === "saves"; }); };

(async function () {
  /* 2. an unchanged save is not pushed again, and the blob no longer comes down with every push */
  {
    const h = bootCloud();
    await h.Cloud.whenReady();
    const saveA = { v: 3, xp: 10 };
    const first = await h.Cloud.pushSave(saveA);
    eq("2 the first push goes through", first.ok === true && first.unchanged !== true, true);
    const afterFirst = sync(h.calls).length;
    ok("2 a push reads only the revision, not the save blob", sync(h.calls)[0].cols === "revision", sync(h.calls)[0]);
    const again = await h.Cloud.pushSave({ v: 3, xp: 10 });
    eq("2 an identical save is skipped", again.unchanged, true);
    eq("2 a skipped push makes no request", sync(h.calls).length, afterFirst);
    const changed = await h.Cloud.pushSave({ v: 3, xp: 11 });
    ok("2 a changed save is pushed", changed.ok === true && changed.unchanged !== true);
    eq("2 the revision climbs with each real push", changed.revision, first.revision + 1);
  }

  /* 8. a hung request ends in a result instead of hanging, and a failed read never overwrites the cloud */
  {
    const h = bootCloud();
    await h.Cloud.whenReady();
    h.state.hang = true;
    const pushed = await h.Cloud.pushSave({ v: 3, xp: 1 });
    eq("8 a hung push times out", pushed.reason, "unavailable");
    const pulled = await h.Cloud.pullSave();
    eq("8 a hung read times out to nothing", pulled, null);
    const boot = await h.Cloud.syncOnBoot({ v: 3, xp: 1 });
    eq("8 a failed read stops the boot sync", boot.reason, "pull-failed");
    eq("8 the local save is handed back untouched", boot.save.xp, 1);
    eq("8 a failed read never pushes the local copy over the cloud", h.calls.filter(function (c) { return c.op === "upsert"; }).length, 0);
    const ghost = await h.Cloud.upsertGhost("trial", "campaign", 5, null, null);
    eq("8 a hung ghost write times out", ghost.reason, "unavailable");
    const rivals = await h.Cloud.fetchLiveRaceGhosts("ABCDE");
    ok("8 a hung ghost read times out to an empty list", Array.isArray(rivals) && rivals.length === 0);
  }
  {
    const h = bootCloud({ remote: { revision: 2, payload: { v: 3, xp: 50 } } });
    await h.Cloud.whenReady();
    const boot = await h.Cloud.syncOnBoot({ v: 3, xp: 5, seals: [], best: {}, life: {}, books: {}, verse: {}, srs: {}, pilgrim: { sites: {}, usedIds: [] }, set: {}, daily: {}, board: [] });
    ok("8 a healthy read still merges and pushes", boot.ok === true && boot.merged === true);
  }

  /* 3. a code is not re-sent to the same address inside a minute; a captcha token rides along when one is set */
  {
    const h = bootCloud();
    const first = await h.Cloud.signInWithEmail("Pilgrim@Example.com");
    eq("3 the first code is sent", first.ok, true);
    const second = await h.Cloud.signInWithEmail("pilgrim@example.com");
    eq("3 the same address is held for the cooldown", second.reason, "cooldown");
    eq("3 a held resend makes no request", h.otpCalls.length, 1);
    const other = await h.Cloud.signInWithEmail("someone.else@example.com");
    eq("3 another address is not held", other.ok, true);
    eq("3 the cooldown is a minute", h.Cloud.OTP_COOLDOWN_MS, 60000);
    ok("3 the cooldown has a message", /Wait a minute/.test(h.Cloud.authNotice("cooldown")));
    ok("3 no captcha token is sent when no site key is set", h.otpCalls[0].options.captchaToken === undefined);
  }
  {
    const h = bootCloud({ config: { turnstileSiteKey: "0xSITEKEY" }, turnstile: "TOKEN123" });
    const res = await h.Cloud.signInWithEmail("pilgrim@example.com");
    eq("3 sign-in goes through with a captcha", res.ok, true);
    eq("3 the Turnstile token is sent to Supabase", h.otpCalls[0].options.captchaToken, "TOKEN123");
    eq("3 the widget is made with the configured site key", h.shown[0].sitekey, "0xSITEKEY");
    ok("3 the widget stays hidden unless a challenge is needed", h.shown[0].appearance === "interaction-only");
  }
  {
    const h = bootCloud({ config: { turnstileSiteKey: "0xSITEKEY" } });
    const res = await h.Cloud.signInWithEmail("pilgrim@example.com");
    eq("3 with a site key and no widget, sign-in is refused, not sent", res.reason, "captcha-failed");
    eq("3 nothing is sent without its token", h.otpCalls.length, 0);
  }
  {
    const h = bootCloud();
    h.state.otpError = { message: "captcha verification process failed" };
    const res = await h.Cloud.signInWithEmail("pilgrim@example.com");
    eq("3 a captcha refusal from the server is named", res.reason, "captcha-failed");
    const again = await h.Cloud.signInWithEmail("pilgrim@example.com");
    ok("3 a refused send does not start the cooldown", again.reason !== "cooldown");
  }
  ok("3 the CSP lets the Turnstile widget load", /script-src 'self' https:\/\/challenges\.cloudflare\.com; frame-src https:\/\/challenges\.cloudflare\.com;/.test(read("vercel.json")));
  ok("3 the resend buttons are held for the cooldown",
    /holdButton\(signInBtn, Cloud\.OTP_COOLDOWN_MS/.test(read("js/panels.js")) &&
    (read("js/briefs.js").match(/holdButton\((send), Cloud\.OTP_COOLDOWN_MS/g) || []).length === 2);

  /* 11. the jar reads the owner's numbers, and any doubt leaves the built-in ones showing */
  {
    const h = bootCloud({ remote: { raised_usd: "42.50", goal_usd: "150.00", updated_at: "2026-11-05T18:00:00Z" } });
    const jar = await h.Cloud.fetchTipJar();
    eq("11 the raised total is read as a number", jar.raisedUsd, 42.5);
    eq("11 the goal is read as a number", jar.goalUsd, 150);
    eq("11 the date comes through", jar.updatedAt, "2026-11-05T18:00:00Z");
    const call = h.calls.filter(function (c) { return c.table === "tip_jar"; })[0];
    ok("11 only the three columns are asked for", call && call.cols === "raised_usd, goal_usd, updated_at", call);
    const plain = bootCloud({ remote: { raised_usd: 7, goal_usd: 100, updated_at: "" } });
    eq("11 plain numbers work too", (await plain.Cloud.fetchTipJar()).raisedUsd, 7);
    const none = bootCloud({ remote: null });
    eq("11 a missing row reads as nothing", await none.Cloud.fetchTipJar(), null);
    const failing = bootCloud({ remote: { raised_usd: 5, goal_usd: 100 } });
    failing.state.selectError = { message: "relation public.tip_jar does not exist" };
    eq("11 a missing table reads as nothing", await failing.Cloud.fetchTipJar(), null);
    const hung = bootCloud();
    hung.state.hang = true;
    eq("11 a hung request reads as nothing", await hung.Cloud.fetchTipJar(), null);
    eq("11 a negative total is refused", await bootCloud({ remote: { raised_usd: -1, goal_usd: 100 } }).Cloud.fetchTipJar(), null);
    eq("11 a zero goal is refused", await bootCloud({ remote: { raised_usd: 5, goal_usd: 0 } }).Cloud.fetchTipJar(), null);
    eq("11 text instead of a number is refused", await bootCloud({ remote: { raised_usd: "lots", goal_usd: 100 } }).Cloud.fetchTipJar(), null);
    const off = bootCloud({ config: { url: "", anonKey: "" } });
    eq("11 with the cloud off the jar keeps its own numbers", await off.Cloud.fetchTipJar(), null);
  }

  /* 9. the admin hub escapes the notice id it writes into attributes */
  {
    const hub = read("js/admin-hub.js");
    ok("9 the notice id is escaped in both attributes", /data-id="' \+ esc\(n\.id\)/.test(hub) && /data-toggle="' \+ esc\(n\.id\)/.test(hub));
    ok("9 sanity_check.sql no longer names columns that do not exist", !/target_user_id|not resolved/.test(read("supabase/sanity_check.sql")));
    ok("9 content-json.js is no longer shipped with the game", !fs.existsSync(path.join(ROOT, "js", "content-json.js")) && fs.existsSync(path.join(ROOT, "scripts", "content-json.js")));
  }

  /* 10. cache headers and the idle prefetch */
  {
    const vercel = JSON.parse(read("vercel.json"));
    const cacheOf = function (source) {
      const rule = vercel.headers.filter(function (h) { return h.source === source; })[0];
      return rule && rule.headers.filter(function (x) { return x.key === "Cache-Control"; })[0].value;
    };
    eq("10 fonts are cached for a year", cacheOf("/fonts/:path*"), "public, max-age=31536000, immutable");
    eq("10 the prologue film is cached for a year", cacheOf("/assets/beats/goliath/prologue.mp4"), "public, max-age=31536000, immutable");
    const sources = vercel.headers.map(function (h) { return h.source; });
    ok("10 the prologue rule comes after the general assets rule, so it wins", sources.indexOf("/assets/beats/goliath/prologue.mp4") > sources.indexOf("/assets/:path*"));
    eq("10 other assets keep their one-day cache", cacheOf("/assets/:path*"), "public, max-age=86400");
    const defer = read("js/defer.js");
    ok("10 the first use of a mode starts the idle prefetch", (defer.match(/\.then\(afterFirstUse\)/g) || []).length === 3);
    ok("10 a first-time visitor is not prefetched for at boot", /SAVE\.runs > 0\)\) return;\n  Defer\.prefetchWhenIdle\(\)/.test(read("js/briefs.js")));
  }

  if (fail) {
    console.log("FAIL — backend guards · " + pass + " passed · " + fail + " failed");
    process.exit(1);
  }
  console.log("PASS — backend guards · " + pass + " assertions");
})().catch(function (e) {
  console.log("FAIL — backend guards · crashed: " + (e && e.stack || e));
  process.exit(1);
});
