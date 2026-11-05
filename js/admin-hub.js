/* Admin Hub (admin.html). Lives in its own file: the site CSP allows
   scripts from 'self' only, so inline script never runs in production. */
(function () {
  var sb = supabase.createClient(CLOUD_CONFIG.url, CLOUD_CONFIG.anonKey);
  var $ = function (id) { return document.getElementById(id); };
  var isAdmin = false;
  var notices = [];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function setStatus(id, msg, isErr) {
    var el = $(id);
    el.textContent = msg;
    el.classList.toggle("err", !!isErr);
  }

  /* ---------- sign in ---------- */
  $("btn-magic").addEventListener("click", async function () {
    var email = $("email").value.trim();
    if (!email) return setStatus("auth-status", "Enter your email first.", true);
    setStatus("auth-status", "Sending the link…");
    var res = await sb.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname }
    });
    if (res.error) setStatus("auth-status", res.error.message, true);
    else setStatus("auth-status", "Link sent — open it from this same browser.", false);
  });
  $("btn-password").addEventListener("click", async function () {
    var email = $("email").value.trim(), password = $("password").value;
    if (!email || !password) return setStatus("auth-status", "Email and password, or use the email link.", true);
    setStatus("auth-status", "Signing in…");
    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) setStatus("auth-status", res.error.message, true);
  });
  $("btn-signout").addEventListener("click", async function () {
    await sb.auth.signOut();
    location.reload();
  });

  /* ---------- composer ---------- */
  function counters() {
    var t = $("n-title").value, b = $("n-body").value;
    $("title-counter").textContent = t.length + " / 120";
    $("body-counter").textContent = b.length + " / 2000";
    $("title-counter").classList.toggle("over", t.length > 120);
    $("body-counter").classList.toggle("over", b.length > 2000);
    $("pv-title").textContent = t || "—";
    $("btn-publish").disabled = !(t.trim().length >= 1 && t.length <= 120 &&
                                  b.trim().length >= 8 && b.length <= 2000);
  }
  $("n-title").addEventListener("input", counters);
  $("n-body").addEventListener("input", counters);

  $("btn-publish").addEventListener("click", async function () {
    var title = $("n-title").value.trim();
    var body = $("n-body").value;
    var btn = $("btn-publish");
    btn.disabled = true;
    setStatus("publish-status", "Publishing…");
    var ins = await sb.from("site_notices").insert({ title: title, body: body, active: true }).select("id").single();
    if (ins.error) {
      var hint = ins.error.message || "The server refused the notice.";
      if (/row-level security|policy/i.test(hint)) {
        hint += " — your account is not in site_admins yet. Run the bootstrap SQL above, then retry.";
        renderBootstrap();
      }
      setStatus("publish-status", hint, true);
      btn.disabled = false;
      return;
    }
    if ($("n-retire").checked && ins.data && ins.data.id) {
      await sb.from("site_notices").update({ active: false }).eq("active", true).neq("id", ins.data.id);
    }
    $("n-title").value = "";
    $("n-body").value = "";
    counters();
    setStatus("publish-status", "Published. Players will see the signal card at their next visit to the hall.");
    await refreshNotices();
    btn.disabled = false;
  });

  /* ---------- tip jar ---------- */
  /* The numbers behind the menu's Tip Jar ring, kept by hand: type in what has really reached PayPal. */
  var TIP_MAX = 1000000;
  var tipSaved = null;
  function parseMoney(text) {
    var clean = String(text || "").trim().replace(/^\$/, "").replace(/,/g, "");
    if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
    return Number(clean);
  }
  function money(n) {
    return "$" + (Number.isInteger(n) ? String(n) : n.toFixed(2));
  }
  function tipForm() {
    var raised = parseMoney($("tip-raised").value);
    var goal = parseMoney($("tip-goal").value);
    var isValid = raised !== null && raised <= TIP_MAX && goal !== null && goal >= 1 && goal <= TIP_MAX;
    var isChanged = !!tipSaved && isValid && (raised !== tipSaved.raised || goal !== tipSaved.goal);
    return { raised: raised, goal: goal, isValid: isValid, isChanged: isChanged };
  }
  function tipFormEdited() {
    var form = tipForm();
    $("btn-tip-save").disabled = !form.isChanged;
    var isEmpty = !$("tip-raised").value.trim() && !$("tip-goal").value.trim();
    if (!form.isValid && !isEmpty) setStatus("tip-status", "Use plain amounts such as 42 or 42.50. The goal must be at least 1.", true);
    else setStatus("tip-status", "");
  }
  $("tip-raised").addEventListener("input", tipFormEdited);
  $("tip-goal").addEventListener("input", tipFormEdited);

  async function refreshTipJar() {
    var res = await sb.from("tip_jar").select("raised_usd,goal_usd,updated_at").eq("id", 1).maybeSingle();
    if (res.error || !res.data) {
      var why = res.error ? res.error.message : "the tip_jar row is missing";
      setStatus("tip-status", "Could not read the tip jar: " + why + ". Run migration 010_tip_jar.sql first.", true);
      return false;
    }
    tipSaved = { raised: Number(res.data.raised_usd), goal: Number(res.data.goal_usd) };
    $("tip-raised").value = tipSaved.raised.toFixed(2);
    $("tip-goal").value = tipSaved.goal.toFixed(2);
    $("btn-tip-save").disabled = true;
    var when = new Date(res.data.updated_at);
    setStatus("tip-status", "Showing " + money(tipSaved.raised) + " of " + money(tipSaved.goal) + ". Last saved " +
      when.toLocaleDateString() + " " + when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ".");
    return true;
  }
  $("btn-tip-save").addEventListener("click", async function () {
    var form = tipForm();
    if (!form.isChanged) return;
    var btn = $("btn-tip-save");
    btn.disabled = true;
    setStatus("tip-status", "Saving…");
    var res = await sb.from("tip_jar").update({ raised_usd: form.raised, goal_usd: form.goal }).eq("id", 1).select("id");
    if (res.error) {
      setStatus("tip-status", res.error.message, true);
      btn.disabled = false;
      return;
    }
    if (!res.data || !res.data.length) {
      setStatus("tip-status", "Nothing was saved: your account is not in site_admins, or the tip_jar row is missing.", true);
      btn.disabled = false;
      return;
    }
    if (await refreshTipJar()) {
      setStatus("tip-status", "Saved. Players see " + money(form.raised) + " of " + money(form.goal) + " the next time the Tip Jar opens.");
    }
  });

  /* ---------- notices list ---------- */
  async function refreshNotices() {
    var res = await sb.from("site_notices")
      .select("id,title,body,active,created_at")
      .order("created_at", { ascending: false });
    var host = $("notice-list");
    if (res.error) { host.innerHTML = '<p class="hint">Could not load notices: ' + esc(res.error.message) + '</p>'; return; }
    notices = res.data || [];
    if (!notices.length) { host.innerHTML = '<p class="hint">Nothing published yet.</p>'; return; }
    host.innerHTML = notices.map(function (n) {
      var d = new Date(n.created_at);
      var stamp = d.toLocaleDateString() + " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return '<div class="notice" data-id="' + esc(n.id) + '">' +
        '<div class="nhead">' +
        '<span class="badge ' + (n.active ? "live" : "retired") + '">' + (n.active ? "Live" : "Retired") + '</span>' +
        '<span class="ndate">' + esc(stamp) + '</span></div>' +
        '<div class="ntitle">' + esc(n.title) + '</div>' +
        '<div class="nbody">' + esc(n.body) + '</div>' +
        '<div class="nrow">' +
        '<button class="btn ghost small" data-toggle="' + esc(n.id) + '">' + (n.active ? "Retire" : "Restore") + '</button>' +
        '</div></div>';
    }).join("");
    host.querySelectorAll("[data-toggle]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var id = btn.getAttribute("data-toggle");
        var n = notices.find(function (x) { return x.id === id; });
        var res = await sb.from("site_notices").update({ active: !n.active }).eq("id", id);
        if (res.error) { setStatus("publish-status", res.error.message, true); return; }
        refreshNotices();
      });
    });
  }

  /* ---------- admin gate ---------- */
  var currentUid = "";
  function renderBootstrap(uid) {
    $("bootstrap-card").classList.remove("hidden");
    $("composer-card").classList.add("hidden");
    $("list-card").classList.add("hidden");
    $("bootstrap-sql").textContent =
      "insert into public.site_admins (user_id)\n" +
      "values ('" + (uid || currentUid) + "');";
  }
  function renderHub() {
    $("bootstrap-card").classList.add("hidden");
    $("composer-card").classList.remove("hidden");
    $("tip-card").classList.remove("hidden");
    $("list-card").classList.remove("hidden");
    counters();
    refreshNotices();
    refreshTipJar();
  }

  async function afterAuth(user) {
    currentUid = user.id;
    $("auth-card").classList.add("hidden");
    $("hub").classList.remove("hidden");
    $("who-email").textContent = user.email || user.id;
    setStatus("admin-status", "Checking publish rights…");
    var res = await sb.rpc("is_site_admin");
    if (res.error) {
      setStatus("admin-status", "Could not check publish rights: " + res.error.message + ". Press Re-check.", true);
      renderBootstrap(user.id);
      return;
    }
    isAdmin = (res.data === true);
    if (isAdmin) {
      setStatus("admin-status", "You may publish announcements.");
      renderHub();
    } else {
      setStatus("admin-status", "Not a publisher yet.", true);
      renderBootstrap(user.id);
    }
  }

  async function boot() {
    var res = await sb.auth.getSession();
    var session = res.data && res.data.session;
    if (session) await afterAuth(session.user);
  }
  sb.auth.onAuthStateChange(function (event, session) {
    if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
      afterAuth(session.user);
    } else if (event === "SIGNED_OUT") {
      location.reload();
    }
  });
  $("btn-recheck").addEventListener("click", async function () {
    var res = await sb.auth.getUser();
    if (res.data && res.data.user) afterAuth(res.data.user);
  });

  boot();
})();
