/* ==================================================================
   CLOUD — Supabase client for Complete the Verse.

   Responsibilities:
     - optional auth (email magic link)
     - merge local + remote SAVE (field-aware, pure mergeSave)
     - push/pull cloud save
     - daily / blitz score submit + leaderboards
     - run ghost upsert / fetch

   The game always plays from local SAVE. Cloud is sync + social only.
   If CLOUD_CONFIG is empty or the network fails, every call no-ops safely.
   ================================================================== */

var Cloud = (function () {
  var client = null;
  var user = null;
  var profile = null;
  var lastRevision = 0;
  var lastSubmitVia = null;
  var lastError = "";
  var pushTimer = null;
  var syncing = false;
  var hooks = { onAuth: null, onSync: null, onError: null };

  function cfg() {
    return (typeof CLOUD_CONFIG !== "undefined" && CLOUD_CONFIG) ? CLOUD_CONFIG : {};
  }

  function configured() {
    var c = cfg();
    return !!(c.url && c.anonKey && String(c.url).indexOf("http") === 0);
  }

  function emit(kind, payload) {
    if(kind === "onError") lastError = (payload && payload.message) || "Cloud request failed";
    if(kind === "onSync" && payload && payload.direction !== "start" && payload.direction !== "idle") lastError = "";
    var fn = hooks[kind];
    if (typeof fn === "function") {
      try { fn(payload); } catch (e) {}
    }
  }

  function setSyncing(value){
    syncing = !!value;
    emit("onSync", { direction: syncing ? "start" : "idle" });
  }

  function ensureClient() {
    if (client) return client;
    if (!configured()) return null;
    if (typeof supabase === "undefined" || !supabase.createClient) {
      emit("onError", { message: "Supabase SDK not loaded" });
      return null;
    }
    client = supabase.createClient(cfg().url, cfg().anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return client;
  }

  /** Lazy-load vendored SDK only when cloud is configured and needed. */
  function loadSdk() {
    return new Promise(function (resolve) {
      if (typeof supabase !== "undefined" && supabase.createClient) {
        resolve(true); return;
      }
      if (!configured() || typeof document === "undefined") {
        resolve(false); return;
      }
      var existing = document.querySelector('script[data-supabase-sdk]');
      if (existing) {
        existing.addEventListener("load", function () { resolve(!!(supabase && supabase.createClient)); });
        return;
      }
      var s = document.createElement("script");
      s.src = "vendor/supabase/supabase.js";
      s.async = true;
      s.setAttribute("data-supabase-sdk", "1");
      s.onload = function () { resolve(!!(typeof supabase !== "undefined" && supabase.createClient)); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
  }

  async function initLazy() {
    if (!configured()) return { ok: false, reason: "not-configured" };
    var ok = await loadSdk();
    if (!ok) return { ok: false, reason: "no-sdk" };
    return init();
  }

  /* ----------------------- pure merge ----------------------- */

  function maxNum(a, b) {
    a = Number(a) || 0; b = Number(b) || 0;
    return a > b ? a : b;
  }

  function unionArr(a, b) {
    var out = [], seen = {};
    (a || []).concat(b || []).forEach(function (x) {
      var k = String(x);
      if (!seen[k]) { seen[k] = 1; out.push(x); }
    });
    return out;
  }

  function mergeSiteRec(a, b) {
    a = a || {}; b = b || {};
    return {
      cleared: !!(a.cleared || b.cleared),
      best: maxNum(a.best, b.best),
      bestAccuracy: maxNum(a.bestAccuracy, b.bestAccuracy),
      attempts: maxNum(a.attempts, b.attempts),
      clearedAt: a.clearedAt || b.clearedAt || 0,
      perfect: !!(a.perfect || b.perfect)
    };
  }

  function mergePilgrim(a, b) {
    a = a || {}; b = b || {};
    var sites = {}, keys = {};
    Object.keys(a.sites || {}).forEach(function (k) { keys[k] = 1; });
    Object.keys(b.sites || {}).forEach(function (k) { keys[k] = 1; });
    Object.keys(keys).forEach(function (k) {
      sites[k] = mergeSiteRec((a.sites || {})[k], (b.sites || {})[k]);
    });
    return {
      sites: sites,
      lastPlayed: b.lastPlayed || a.lastPlayed || "",
      started: a.started || b.started || 0,
      usedIds: unionArr(a.usedIds, b.usedIds)
    };
  }

  function mergeMapMax(a, b, fields) {
    a = a || {}; b = b || {};
    var out = {}, keys = {};
    Object.keys(a).forEach(function (k) { keys[k] = 1; });
    Object.keys(b).forEach(function (k) { keys[k] = 1; });
    Object.keys(keys).forEach(function (k) {
      var x = a[k] || {}, y = b[k] || {}, row = {};
      (fields || Object.keys(Object.assign({}, x, y))).forEach(function (f) {
        row[f] = maxNum(x[f], y[f]);
      });
      // preserve non-numeric leftovers from either side
      Object.keys(Object.assign({}, x, y)).forEach(function (f) {
        if (row[f] === undefined) row[f] = y[f] !== undefined ? y[f] : x[f];
      });
      out[k] = row;
    });
    return out;
  }

  function mergeSrs(a, b) {
    a = a || {}; b = b || {};
    var out = {}, keys = {};
    Object.keys(a).forEach(function (k) { keys[k] = 1; });
    Object.keys(b).forEach(function (k) { keys[k] = 1; });
    Object.keys(keys).forEach(function (k) {
      var x = a[k], y = b[k];
      if (!x) { out[k] = y; return; }
      if (!y) { out[k] = x; return; }
      // Prefer the card with more reps, then later last review.
      if ((y.reps || 0) > (x.reps || 0)) out[k] = y;
      else if ((x.reps || 0) > (y.reps || 0)) out[k] = x;
      else if ((y.last || 0) >= (x.last || 0)) out[k] = y;
      else out[k] = x;
    });
    return out;
  }

  /* Old Blitz records stored composite totals (thousands). Verse counts
     stay well below this; a value above it that is not already life.blitzBest
     is the old unit and must be rewritten, or max() re-poisons a migrated local. */
  var BLITZ_VERSE_CEILING = 200;
  function migrateBlitzUnits(out) {
    if (!out) return out;
    out.best = out.best || {};
    out.life = out.life || {};
    var best = Number(out.best.blitz) || 0;
    var verses = Number(out.life.blitzBest) || 0;
    if (best > BLITZ_VERSE_CEILING && best !== verses) out.best.blitz = verses;
    if (out.ghosts && out.ghosts.blitz) {
      var gs = Number(out.ghosts.blitz.score) || 0;
      if (gs > BLITZ_VERSE_CEILING && gs !== (Number(out.best.blitz) || 0)) out.ghosts.blitz = null;
    }
    return out;
  }

  function mergeBestLife(out, local, remote) {
    out.best = Object.assign({}, remote.best || {}, local.best || {});
    Object.keys(out.best).forEach(function (k) {
      out.best[k] = maxNum((local.best || {})[k], (remote.best || {})[k]);
    });
    out.life = Object.assign({}, remote.life || {}, local.life || {});
    Object.keys(Object.assign({}, local.life || {}, remote.life || {})).forEach(function (k) {
      out.life[k] = maxNum((local.life || {})[k], (remote.life || {})[k]);
    });
  }

  function mergeDaily(local, remote) {
    var ld = local.daily || {}, rd = remote.daily || {};
    if (ld.date && rd.date && ld.date === rd.date) {
      return { date: ld.date, score: maxNum(ld.score, rd.score) };
    }
    if (ld.date) return { date: ld.date, score: ld.score || 0 };
    return { date: rd.date || "", score: rd.score || 0 };
  }

  function mergeSave(local, remote) {
    local = local || {};
    remote = remote || {};
    if (!remote || (!remote.pilgrim && !remote.best && !remote.srs)) {
      return migrateBlitzUnits(JSON.parse(JSON.stringify(local)));
    }
    var out = JSON.parse(JSON.stringify(local));
    out.v = Math.max(local.v || 3, remote.v || 3);
    out.xp = maxNum(local.xp, remote.xp);
    out.illumReserve = maxNum(local.illumReserve, remote.illumReserve);
    out.runs = maxNum(local.runs, remote.runs);
    out.seals = unionArr(local.seals, remote.seals);
    mergeBestLife(out, local, remote);
    out.books = mergeMapMax(local.books, remote.books, ["c", "a"]);
    out.verse = mergeMapMax(local.verse, remote.verse, ["c", "a", "streak", "best"]);
    out.srs = mergeSrs(local.srs, remote.srs);
    out.pilgrim = mergePilgrim(local.pilgrim, remote.pilgrim);
    out.daily = mergeDaily(local, remote);
    out.set = Object.assign({}, remote.set || {}, local.set || {});
    out.board = (local.board && local.board.length) ? local.board
      : (remote.board || []);
    return migrateBlitzUnits(out);
  }

  /* ----------------------- auth ----------------------- */

  function sessionUser() {
    return user;
  }

  function isSignedIn() {
    return !!(user && user.id);
  }

  async function init() {
    if (!configured()) return { ok: false, reason: "not-configured" };
    var sb = ensureClient();
    if (!sb) return { ok: false, reason: "no-sdk" };

    var sess = await sb.auth.getSession();
    if (sess.data && sess.data.session) {
      user = sess.data.session.user;
      await refreshProfile();
    }

    sb.auth.onAuthStateChange(function (event, session) {
      user = session && session.user ? session.user : null;
      if (user) refreshProfile();
      else { profile = null; lastRevision = 0; }
      emit("onAuth", { event: event, user: user, profile: profile });
    });

    return { ok: true, user: user };
  }

  async function refreshProfile() {
    var sb = ensureClient();
    if (!sb || !user) return null;
    var res = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (res.data) profile = res.data;
    return profile;
  }

  async function signInWithEmail(email) {
    var sb = ensureClient();
    if (!sb) return { ok: false, reason: "not-configured" };
    var res = await sb.auth.signInWithOtp({
      email: String(email || "").trim(),
      options: { emailRedirectTo: typeof location !== "undefined" ? location.href.split("#")[0] : undefined }
    });
    if (res.error) {
      emit("onError", { message: res.error.message });
      return { ok: false, reason: res.error.message };
    }
    return { ok: true, message: "Check your email for the sign-in link." };
  }

  async function signOut() {
    var sb = ensureClient();
    if (!sb) return { ok: true };
    await sb.auth.signOut();
    user = null;
    profile = null;
    lastRevision = 0;
    return { ok: true };
  }

  async function setDisplayName(name) {
    var sb = ensureClient();
    if (!sb || !user) return { ok: false, reason: "signed-out" };
    name = (typeof Polish !== "undefined" && Polish.sanitizeDisplayName)
      ? Polish.sanitizeDisplayName(name) : String(name || "").trim().slice(0, 32);
    if (name.length < 2) return { ok: false, reason: "name-too-short" };
    var res = await sb.from("profiles").update({
      display_name: name,
      updated_at: new Date().toISOString()
    }).eq("id", user.id);
    if (res.error) return { ok: false, reason: res.error.message };
    await refreshProfile();
    return { ok: true, profile: profile };
  }

  /* ----------------------- save sync ----------------------- */

  async function pullSave() {
    var sb = ensureClient();
    if (!sb || !user) return null;
    setSyncing(true);
    try {
      var res = await sb.from("saves").select("payload, revision, client_updated_at")
        .eq("user_id", user.id).maybeSingle();
      if (res.error) {
        emit("onError", { message: res.error.message });
        return null;
      }
      if (!res.data) return null;
      lastRevision = res.data.revision || 0;
      return res.data;
    } finally {
      setSyncing(false);
    }
  }

  async function pushSave(saveObj) {
    var sb = ensureClient();
    if (!sb || !user) return { ok: false, reason: "signed-out" };
    setSyncing(true);
    try {
      /* Optimistic lock: if remote moved past what we last merged, refuse blind overwrite. */
      var peek = await sb.from("saves").select("revision, payload, client_updated_at")
        .eq("user_id", user.id).maybeSingle();
      var remoteRev = (peek.data && peek.data.revision) || 0;
      if (lastRevision > 0 && remoteRev > lastRevision) {
        return {
          ok: false,
          reason: "stale-revision",
          remote: peek.data
        };
      }
      var nextRev = Math.max(lastRevision || 0, remoteRev) + 1;
      var row = {
        user_id: user.id,
        payload: saveObj || {},
        revision: nextRev,
        client_updated_at: new Date().toISOString()
      };
      var res = await sb.from("saves").upsert(row, { onConflict: "user_id" });
      if (res.error) {
        emit("onError", { message: res.error.message });
        return { ok: false, reason: res.error.message };
      }
      lastRevision = nextRev;
      emit("onSync", { direction: "push", revision: nextRev });
      return { ok: true, revision: nextRev };
    } finally {
      setSyncing(false);
    }
  }

  function schedulePush(saveObj) {
    if (!isSignedIn() || !configured()) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      pushTimer = null;
      pushSave(saveObj);
    }, 1500);
  }

  /** Merge remote into local SAVE object; caller assigns + persist(). */
  async function syncOnBoot(localSave) {
    if (!isSignedIn()) return { ok: false, reason: "signed-out", save: localSave };
    setSyncing(true);
    try {
      var remote = await pullSave();
      if (!remote || !remote.payload || !Object.keys(remote.payload).length) {
        await pushSave(localSave);
        return { ok: true, save: localSave, merged: false };
      }
      var merged = mergeSave(localSave, remote.payload);
      lastRevision = remote.revision || lastRevision;
      await pushSave(merged);
      emit("onSync", { direction: "pull-merge", revision: lastRevision });
      return { ok: true, save: merged, merged: true };
    } finally {
      setSyncing(false);
    }
  }

  /* ----------------------- scores ----------------------- */

  /* Server-trusted path: the submit-score Edge Function re-clamps and writes
     under the caller's own auth (see supabase/functions/). Board writes fail
     closed when the trusted path is unavailable; the local record remains. */
  async function submitViaEdge(kind, payload) {
    var sb = ensureClient();
    if (!sb || !sb.functions || typeof sb.functions.invoke !== "function") {
      return { ok: false, reason: "no-edge" };
    }
    try {
      var res = await sb.functions.invoke("submit-score", {
        body: Object.assign({ kind: kind }, payload)
      });
      if (res && res.error) return { ok: false, reason: res.error.message || "edge-error" };
      if (res && res.data && res.data.error) return { ok: false, reason: res.data.error };
      return { ok: true, via: "edge" };
    } catch (e) {
      return { ok: false, reason: "edge-unreachable" };
    }
  }

  async function submitDailyScore(row) {
    var sb = ensureClient();
    if (!sb || !user) return { ok: false, reason: "signed-out" };
    var c = (typeof Polish !== "undefined" && Polish.clampDailyScore)
      ? Polish.clampDailyScore(row) : row;
    var payload = {
      play_date: c.play_date,
      score: c.score | 0,
      accuracy: Number(c.accuracy) || 0,
      duration_ms: c.duration_ms == null ? null : c.duration_ms | 0,
      diff: c.diff || "watchman"
    };
    var edge = await submitViaEdge("daily", payload);
    if (edge.ok) {
      lastSubmitVia = "edge";
      emit("onSync", { direction: "score-submit" });
      return { ok: true, score: payload.score, via: "edge" };
    }
    /* No trusted write path is available; keep this local result intact. */
    lastSubmitVia = null;
    emit("onError", { message: "Trusted leaderboard submission is unavailable." });
    return { ok: false, reason: "trusted-submit-unavailable", via: "none" };
  }

  async function submitBlitzScore(row) {
    var sb = ensureClient();
    if (!sb || !user) return { ok: false, reason: "signed-out" };
    var c = (typeof Polish !== "undefined" && Polish.clampBlitzScore)
      ? Polish.clampBlitzScore(row) : row;
    var payload = {
      score: c.score | 0,
      survived_ms: c.survived_ms | 0,
      diff: c.diff || "watchman"
    };
    var edge = await submitViaEdge("blitz", payload);
    if (edge.ok) {
      lastSubmitVia = "edge";
      emit("onSync", { direction: "score-submit" });
      return { ok: true, score: payload.score, via: "edge" };
    }
    lastSubmitVia = null;
    emit("onError", { message: "Trusted leaderboard submission is unavailable." });
    return { ok: false, reason: "trusted-submit-unavailable", via: "none" };
  }

  async function fetchDailyBoard(playDate, limit) {
    var sb = ensureClient();
    if (!sb) return [];
    limit = limit || 20;
    var res = await sb.from("daily_scores")
      .select("id, score, accuracy, diff, user_id, profiles(display_name)")
      .eq("play_date", playDate)
      .order("score", { ascending: false })
      .limit(limit);
    if (res.error) return [];
    return (res.data || []).map(function (r, i) {
      var raw = (r.profiles && r.profiles.display_name) || "Pilgrim";
      var name = (typeof Polish !== "undefined" && Polish.sanitizeDisplayName)
        ? (Polish.sanitizeDisplayName(raw) || "Pilgrim") : String(raw).slice(0, 32);
      return {
        rank: i + 1,
        id: r.id,
        score: r.score,
        accuracy: r.accuracy,
        diff: r.diff,
        name: name,
        user_id: r.user_id,
        mine: !!(user && r.user_id === user.id)
      };
    });
  }

  async function fetchBlitzBoard(limit) {
    var sb = ensureClient();
    if (!sb) return [];
    limit = limit || 20;
    var res = await sb.from("blitz_scores")
      .select("id, score, survived_ms, diff, user_id, profiles(display_name)")
      .order("score", { ascending: false })
      .order("survived_ms", { ascending: false })
      .limit(limit);
    if (res.error) return [];
    return (res.data || []).map(function (r, i) {
      var raw = (r.profiles && r.profiles.display_name) || "Pilgrim";
      var name = (typeof Polish !== "undefined" && Polish.sanitizeDisplayName)
        ? (Polish.sanitizeDisplayName(raw) || "Pilgrim") : String(raw).slice(0, 32);
      return {
        rank: i + 1,
        id: r.id,
        score: r.score,
        survived_ms: r.survived_ms,
        diff: r.diff,
        name: name,
        user_id: r.user_id,
        mine: !!(user && r.user_id === user.id)
      };
    });
  }

  /* How many players posted a score on a given date (for "of M" on the
     results screen). Read-only on the same table the board already uses. */
  async function fetchDailyEntryCount(playDate) {
    var sb = ensureClient();
    if (!sb || !playDate) return 0;
    var res = await sb.from("daily_scores")
      .select("id", { count: "exact", head: true })
      .eq("play_date", playDate);
    if (res.error) return 0;
    return (res.count != null) ? Number(res.count) : 0;
  }

  /* Best daily score for a signed-in user on a given date (for "you" row). */
  async function fetchMyDailyRank(playDate) {
    var sb = ensureClient();
    if (!sb || !user) return null;
    var res = await sb.from("daily_scores")
      .select("id, score, accuracy, diff, user_id, profiles(display_name)")
      .eq("play_date", playDate)
      .order("score", { ascending: false })
      .limit(100);
    if (res.error || !res.data) return null;
    var rows = res.data;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].user_id === user.id) {
        var raw = (rows[i].profiles && rows[i].profiles.display_name) || "You";
        return {
          id: rows[i].id,
          rank: i + 1,
          score: rows[i].score,
          accuracy: rows[i].accuracy,
          diff: rows[i].diff,
          name: raw,
          mine: true,
          total: rows.length
        };
      }
    }
    return null;
  }

  async function fetchMyBlitzRank() {
    var sb = ensureClient();
    if (!sb || !user) return null;
    var res = await sb.from("blitz_scores")
      .select("id, score, survived_ms, diff, user_id, profiles(display_name)")
      .order("score", { ascending: false })
      .order("survived_ms", { ascending: false })
      .limit(100);
    if (res.error || !res.data) return null;
    var rows = res.data;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].user_id === user.id) {
        var raw = (rows[i].profiles && rows[i].profiles.display_name) || "You";
        return {
          id: rows[i].id,
          rank: i + 1,
          score: rows[i].score,
          survived_ms: rows[i].survived_ms,
          diff: rows[i].diff,
          name: raw,
          mine: true,
          total: rows.length
        };
      }
    }
    return null;
  }

  async function reportScore(board, scoreId, reason) {
    var sb = ensureClient();
    if (!sb || !user) return { ok: false, reason: "signed-out" };
    board = board === "blitz" ? "blitz" : board === "daily" ? "daily" : "";
    scoreId = String(scoreId || "");
    reason = String(reason || "").replace(/[<>]/g, "").trim().slice(0, 500);
    if (!board || !/^[0-9a-f-]{20,}$/i.test(scoreId) || reason.length < 8) {
      return { ok: false, reason: "invalid-report" };
    }
    var res = await sb.from("leaderboard_reports").insert({
      reporter_id: user.id, board: board, score_id: scoreId, reason: reason
    });
    if (res.error) return { ok: false, reason: res.error.message };
    return { ok: true };
  }

  /* ----------------------- ghosts ----------------------- */

  async function upsertGhost(mode, runKey, bestScore, timeline, meta) {
    var sb = ensureClient();
    if (!sb || !user) return { ok: false, reason: "signed-out" };
    var res = await sb.from("run_ghosts").upsert({
      user_id: user.id,
      mode: mode,
      run_key: runKey,
      best_score: bestScore | 0,
      timeline: timeline || { version: 1, samples: [] },
      meta: meta || {},
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,mode,run_key" });
    if (res.error) return { ok: false, reason: res.error.message };
    return { ok: true };
  }

  async function fetchGhosts(mode, runKey, limit) {
    var sb = ensureClient();
    if (!sb) return [];
    limit = limit || 5;
    var res = await sb.from("run_ghosts")
      .select("best_score, timeline, meta, user_id, profiles(display_name)")
      .eq("mode", mode)
      .eq("run_key", runKey)
      .order("best_score", { ascending: false })
      .limit(limit);
    if (res.error) return [];
    return (res.data || []).map(function (r) {
      return {
        name: (r.profiles && r.profiles.display_name) || "Pilgrim",
        best_score: r.best_score,
        timeline: r.timeline,
        meta: r.meta,
        mine: !!(user && r.user_id === user.id)
      };
    });
  }

  /* ------------------- friend races ------------------- */

  var ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  function generateRoomCode(len) {
    len = len || 5;
    var code = "";
    for (var i = 0; i < len; i++) {
      code += ROOM_ALPHABET.charAt(Math.floor(Math.random() * ROOM_ALPHABET.length));
    }
    return code;
  }

  function formatRaceUrl(roomCode) {
    var base = typeof location !== "undefined" ? (location.origin + location.pathname) : "https://complete-the-verse.vercel.app/";
    return base + "#race=" + (roomCode || "").toUpperCase().trim();
  }

  function parseRaceCodeFromUrl(urlOrHash) {
    var str = urlOrHash || (typeof location !== "undefined" ? location.hash : "");
    var m = String(str).match(/#?race=([A-Z0-9]{5})/i);
    return m ? m[1].toUpperCase() : null;
  }

  async function upsertLiveRaceState(roomCode, state) {
    if (!roomCode) return { ok: false, reason: "missing-room" };
    var score = (state && state.score) || 0;
    var timeline = (state && state.timeline) || { version: 1, samples: [] };
    var meta = {
      display_name: (state && state.display_name) || "Friend",
      question_index: (state && state.question_index) || 0,
      accuracy: (state && state.accuracy) || 100,
      updated_at: new Date().toISOString()
    };
    return upsertGhost("live", roomCode.toUpperCase().trim(), score, timeline, meta);
  }

  async function fetchLiveRaceGhosts(roomCode) {
    if (!roomCode) return [];
    return fetchGhosts("live", roomCode.toUpperCase().trim(), 10);
  }

  function trustLabel(via) {
    if (!via) return "";
    return via === "direct" ? "Honor system" : "Trusted";
  }

  function on(evt, fn) {
    if (evt in hooks) hooks[evt] = fn;
  }

  return {
    configured: configured,
    init: init,
    initLazy: initLazy,
    loadSdk: loadSdk,
    mergeSave: mergeSave,
    isSignedIn: isSignedIn,
    user: sessionUser,
    profile: function () { return profile; },
    signInWithEmail: signInWithEmail,
    signOut: signOut,
    setDisplayName: setDisplayName,
    pullSave: pullSave,
    pushSave: pushSave,
    schedulePush: schedulePush,
    syncOnBoot: syncOnBoot,
    submitDailyScore: submitDailyScore,
    submitBlitzScore: submitBlitzScore,
    lastSubmitVia: function () { return lastSubmitVia; },
    setLastSubmitVia: function (v) { lastSubmitVia = v; },
    lastError: function () { return lastError; },
    trustLabel: trustLabel,
    fetchDailyBoard: fetchDailyBoard,
    fetchDailyEntryCount: fetchDailyEntryCount,
    fetchBlitzBoard: fetchBlitzBoard,
    fetchMyDailyRank: fetchMyDailyRank,
    fetchMyBlitzRank: fetchMyBlitzRank,
    reportScore: reportScore,
    upsertGhost: upsertGhost,
    fetchGhosts: fetchGhosts,
    generateRoomCode: generateRoomCode,
    formatRaceUrl: formatRaceUrl,
    parseRaceCodeFromUrl: parseRaceCodeFromUrl,
    upsertLiveRaceState: upsertLiveRaceState,
    fetchLiveRaceGhosts: fetchLiveRaceGhosts,
    isSyncing: function () { return syncing; },
    on: on
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Cloud;
