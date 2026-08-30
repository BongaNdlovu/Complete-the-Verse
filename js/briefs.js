/* ==================================================================
   BRIEFS — profile, menu, briefs, pilgrimage wiring, tutorial, intro.

   Split out of game.js along its natural seams. Classic script:
   defines globals only, and references game.js bindings at RUNTIME
   exclusively (enforced by engine-modules.test.js).
   ================================================================== */

/* ------------------------- CHARACTERS / PROFILE ------------------------- */
function playerDisplayName(){
  const n = (SAVE.set.playerName || "").trim();
  return n || "Pilgrim";
}
function activeCharacter(){
  if(typeof Characters === "undefined") return null;
  return Characters.resolve(SAVE.set.scholarId || SAVE.set.character, SAVE.pilgrim);
}
function syncTravelerToken(){
  if(typeof Atlas === "undefined" || !Atlas.setTraveler) return;
  const spec = (typeof Characters !== "undefined" && Characters.walkerSpec)
    ? Characters.walkerSpec(SAVE.set.scholarId || SAVE.set.character, SAVE.pilgrim)
    : null;
  Atlas.setTraveler(spec);
}
function profileReady(){
  return !!(SAVE.set.profileDone && (SAVE.set.playerName || "").trim().length >= 2);
}
function openProfileSetup(force){
  const el = $("character-pick");
  if(!el) return;
  if(!force && profileReady()) return;
  el.dataset.mode = "setup";
  renderProfileSetup();
  el.classList.add("on");
}
function openSkinPicker(){
  const el = $("character-pick");
  if(!el) return;
  el.dataset.mode = "skins";
  renderSkinPicker();
  el.classList.add("on");
}
function closeCharacterPicker(){
  const el = $("character-pick");
  if(el) el.classList.remove("on");
}
function renderProfileSetup(){
  const title = $("char-title");
  const sub = $("char-sub");
  const host = $("char-grid");
  const nameRow = $("char-name-row");
  const confirm = $("char-confirm");
  if(title) title.textContent = "Who are you on the road?";
  if(sub) sub.textContent = "Choose a scholar, then give them your name. They walk the map.";
  if(nameRow) nameRow.classList.remove("gone");
  if(confirm){ confirm.classList.remove("gone"); confirm.disabled = true; confirm.textContent = "Enter the hall"; }
  const nameInput = $("char-name");
  if(nameInput){
    nameInput.value = SAVE.set.playerName || "";
    nameInput.oninput = ()=>{ syncProfileConfirm(); };
  }
  if(!host || typeof Characters === "undefined") return;
  const cur = SAVE.set.scholarId || Characters.defaultScholarId();
  host.innerHTML = Characters.scholars().map(ch => {
    const sel = ch.id === cur;
    return '<button type="button" class="char-card'+(sel?" sel":"")+'" data-scholar="'+esc(ch.id)+'">'+
      '<img class="char-portrait" src="'+esc(ch.portrait)+'" alt="" width="96" height="96" loading="lazy">'+
      '<b>'+esc(ch.short)+'</b>'+
      '<em class="char-nat">'+esc(ch.nationality)+'</em>'+
      '<span>'+esc(ch.blurb)+'</span>'+
      '</button>';
  }).join("");
  host.querySelectorAll("[data-scholar]").forEach(b=>{
    b.addEventListener("click", ()=>{
      SAVE.set.scholarId = b.dataset.scholar;
      SAVE.set.character = b.dataset.scholar;
      host.querySelectorAll(".char-card").forEach(x=>x.classList.toggle("sel", x===b));
      Snd.ui();
      syncTravelerToken();
      updatePlayerCard();
      syncProfileConfirm();
    });
  });
  if(confirm){
    confirm.onclick = ()=>{
      const name = (nameInput && nameInput.value || "").trim();
      if(name.length < 2){ toast("Choose a name of at least two letters"); return; }
      commitProfile(name, SAVE.set.scholarId || Characters.defaultScholarId());
    };
  }
  syncProfileConfirm();
}
function syncProfileConfirm(){
  const confirm = $("char-confirm");
  const nameInput = $("char-name");
  if(!confirm) return;
  const name = (nameInput && nameInput.value || "").trim();
  const scholar = SAVE.set.scholarId || (typeof Characters !== "undefined" && Characters.defaultScholarId());
  confirm.disabled = name.length < 2 || !scholar;
}
function commitProfile(name, scholarId){
  SAVE.set.playerName = name.slice(0, 32);
  SAVE.set.scholarId = scholarId;
  SAVE.set.character = scholarId;
  SAVE.set.profileDone = true;
  SAVE.set.characterDone = true;
  persist();
  Snd.level();
  syncTravelerToken();
  updatePlayerCard();
  closeCharacterPicker();
  if(typeof Cloud!=="undefined" && Cloud.configured() && Cloud.isSignedIn()){
    Cloud.setDisplayName(SAVE.set.playerName).then(res=>{
      if(res && res.ok) updateCloudChip();
    });
  }
  if(pendingPostTutorialAction){
    const act = pendingPostTutorialAction;
    pendingPostTutorialAction = null;
    runTutorialAction(act);
    return;
  }
  if(currentView === "settings") renderSettings();
  if(currentView === "menu") renderMenu();
  toast(playerDisplayName() + " · " + ((activeCharacter()&&activeCharacter().short)||"Scholar"));
}
function renderSkinPicker(){
  const title = $("char-title");
  const sub = $("char-sub");
  const host = $("char-grid");
  const nameRow = $("char-name-row");
  const confirm = $("char-confirm");
  if(title) title.textContent = "Choose who walks the map";
  if(sub) sub.textContent = "Your scholar is the walker on the road.";
  if(nameRow) nameRow.classList.add("gone");
  if(confirm) confirm.classList.add("gone");
  if(!host || typeof Characters === "undefined") return;
  const cur = SAVE.set.scholarId || SAVE.set.character || Characters.defaultId();
  host.innerHTML = Characters.scholars().map(ch => {
    const sel = ch.id === cur;
    return '<button type="button" class="char-card'+(sel?" sel":"")+'" data-char="'+esc(ch.id)+'">'+
      '<img class="char-portrait" src="'+esc(ch.portrait)+'" alt="" width="96" height="96" loading="lazy">'+
      '<b>'+esc(ch.short)+'</b>'+
      '<em class="char-nat">'+esc(ch.nationality)+'</em>'+
      '<span>'+esc(ch.blurb)+'</span>'+
      '</button>';
  }).join("");
  host.querySelectorAll("[data-char]").forEach(b=>{
    b.addEventListener("click", ()=>{
      SAVE.set.character = b.dataset.char;
      SAVE.set.scholarId = b.dataset.char;
      persist();
      Snd.ui();
      syncTravelerToken();
      updatePlayerCard();
      closeCharacterPicker();
      if(currentView === "settings") renderSettings();
      if(currentView === "menu") renderMenu();
      toast("Avatar · " + ((activeCharacter()&&activeCharacter().short)||"Scholar"));
    });
  });
}
/* Back-compat name used by older call sites */
function openCharacterPicker(force){
  if(force && profileReady()) openSkinPicker();
  else openProfileSetup(force);
}


/* ------------------------- MENU ------------------------- */
function updateCloudChip(){
  const el = $("cloud-chip");
  if(!el) return;
  if(typeof Cloud==="undefined" || !Cloud.configured()){
    el.textContent = "Local only"; el.className = "cloud-chip dim"; return;
  }
  if(typeof navigator !== "undefined" && navigator.onLine === false){
    el.textContent = "Offline"; el.className = "cloud-chip warn"; return;
  }
  if(typeof Cloud.isSyncing === "function" && Cloud.isSyncing()){
    el.textContent = "Syncing…"; el.className = "cloud-chip syncing"; return;
  }
  if(typeof Cloud.lastError === "function" && Cloud.lastError()){
    el.textContent = "Sync error"; el.className = "cloud-chip warn";
    el.title = Cloud.lastError();
    return;
  }
  if(Cloud.isSignedIn()){
    const who = (Cloud.profile() && Cloud.profile().display_name) || "Synced";
    const trust = (typeof Cloud.lastSubmitVia === "function" && Cloud.lastSubmitVia() === "direct") ? " (Honor system)" : "";
    el.textContent = "☁ "+who+trust; el.className = "cloud-chip on"; return;
  }
  el.textContent = "Cloud ready"; el.className = "cloud-chip";
}
function updateOfflineBanner(){
  const b = $("offline-banner");
  if(!b) return;
  b.classList.toggle("on", !navigator.onLine);
  b.textContent = navigator.onLine ? "" : "You are offline — progress stays on this device until you reconnect.";
}
const MENU_GROUPS = [
  { name: "The Road",   modes: ["pilgrimage"] },
  { name: "The Valley", modes: ["beat"] },
  { name: "The Tablets", modes: ["tablets"] },
  { name: "Today",      modes: ["daily"] },
  { name: "Practice",   modes: ["practice", "recall", "team"] },
  { name: "Challenges", modes: ["blitz", "trial", "endless"] }
];
const MENU_ORDER = ["pilgrimage", "beat", "tablets", "daily", "blitz", "trial", "endless", "practice", "team"];

function renderModeCard(k, due, dailyDone, road){
  const m = MODES[k];
  if(!m || m.hidden) return "";
  let pill = "";
  if(k==="daily") pill = dailyDone
    ? '<span class="pill done">Done · '+fmt(SAVE.daily.score)+'</span>'
    : '<span class="pill">Today</span>';
  else if(k==="practice" && due) pill = '<span class="pill due">'+fmt(due)+' due</span>';
  else if(k==="pilgrimage") pill = road.complete
    ? '<span class="pill done">Road walked</span>'
    : '<span class="pill">'+road.cleared+' / '+road.total+'</span>';
  else if(SAVE.best[k]) pill = '<span class="pill">Best '+fmt(SAVE.best[k])+'</span>';
  return '<button class="mode" data-mode="'+k+'">'+pill+'<b>'+esc(m.name)+'</b><p>'+esc(m.desc)+'</p>'+
    '<span class="tagline">'+esc(m.tagline)+'</span></button>';
}

function renderMenu(){
  const today = todayKey();
  const dailyDone = SAVE.daily.date === today;
  const due = dueToday();
  const road = pilgrimOverview();
  updateCloudChip();
  updateOfflineBanner();
  const prog = $("menu-road-progress");
  if(prog){
    prog.textContent = road.complete
      ? "Road complete · Ur to Patmos"
      : (road.cleared+" of "+road.total+" sites · next: "+(road.current?road.current.name:"Ur"));
  }
  const reviewBtn = $("menu-review-due");
  const reviewBar = $("menu-review-bar");
  if(reviewBtn){
    if(due > 0){
      if(reviewBar) reviewBar.style.display = "";
      reviewBtn.style.display = "";
      reviewBtn.textContent = "Review " + due + " due";
      reviewBtn.onclick = ()=>{ Snd.unlock(); startRun("practice", SAVE.set.diff); };
    } else {
      if(reviewBar) reviewBar.style.display = "none";
      reviewBtn.style.display = "none";
    }
  }
  const rendered = new Set();
  let groupsHtml = MENU_GROUPS.map(g => {
    const visibleModes = g.modes.filter(k => MODES[k] && !MODES[k].hidden);
    if(!visibleModes.length) return "";
    visibleModes.forEach(k => rendered.add(k));
    return '<div class="mode-group">' +
      '<div class="mode-group-head">' + esc(g.name) + '</div>' +
      '<div class="mode-group-cards">' +
      visibleModes.map(k => renderModeCard(k, due, dailyDone, road)).join("") +
      '</div></div>';
  }).join("");

  const orphans = Object.keys(MODES).filter(k => !rendered.has(k) && !MODES[k].hidden);
  if(orphans.length){
    groupsHtml += '<div class="mode-group"><div class="mode-group-cards">' +
      orphans.map(k => renderModeCard(k, due, dailyDone, road)).join("") +
      '</div></div>';
  }
  $("modes").innerHTML = groupsHtml;
  $("modes").querySelectorAll("[data-mode]").forEach(b=>{
    b.addEventListener("click",()=>{
      Snd.unlock(); Snd.ui();
      // The Pilgrimage picks its level on the map, not on a brief card.
      if(MODES[b.dataset.mode].atlas) go("atlas"); else openBrief(b.dataset.mode);
    });
  });
  const done = SAVE.seals.length, tot = SEALS.length;
  $("menu-hint").textContent = SAVE.runs
    ? fmt(SAVE.runs)+" runs · "+fmt(SAVE.life.correct)+" verses kept · "+done+"/"+tot+" seals"
      + (due ? " · "+fmt(due)+" due for review" : " · nothing due")
    : VERSES.length+" verses · all 66 books · King James Version";
}

/* ------------------------- BRIEF ------------------------- */
let briefMode = "trial";
function paintTabletsBrief(on){
  const host = $("brief-tablets-pick");
  if(!host) return;
  host.hidden = !on;
  if(!on){ host.innerHTML = ""; return; }
  host.innerHTML = "";
  Tablets.chapters.forEach(function(ch){
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tablets-ch-btn";
    b.dataset.chapter = ch.id;
    const locked = !Tablets.unlocked(ch.id, SAVE);
    b.disabled = locked;
    const title = document.createElement("b");
    title.textContent = ch.name;
    const sub = document.createElement("span");
    const rec = Tablets.recordOf(SAVE, ch.id);
    sub.textContent = locked ? "Hold Psalm 23 to unlock" : (ch.blanks.length + " tablets · best " + (rec.best || 0) + "%");
    b.appendChild(title);
    b.appendChild(sub);
    host.appendChild(b);
  });
}
function openBrief(mode){
  briefMode = mode;
  const m = MODES[mode];
  $("brief-kick").textContent = m.kick;
  $("brief-title").textContent = m.name;
  $("brief-desc").textContent = m.desc;
  $("brief-info").innerHTML = m.info.map(i=>'<div class="bi"><b>'+esc(i[0])+'</b><span>'+esc(i[1])+'</span></div>').join("");
  const team = mode==="team";
  const tablets = mode==="tablets";
  const start = $("brief-start");
  const pick = $("brief-team-pick");
  const diffs = $("diffs");
  const diffLab = $("brief-difflabel");
  if(start) start.style.display = (team || tablets) ? "none" : "";
  if(pick) pick.hidden = !team;
  if(diffs) diffs.style.display = (team || tablets) ? "none" : "";
  if(diffLab) diffLab.style.display = (team || tablets) ? "none" : "";
  if(!team && !tablets) renderDiffs();
  paintTabletsBrief(tablets);
  go("brief");
}
function renderDiffs(){
  const d = resolveDiff(SAVE.set.diff);
  const label = $("brief-difflabel");
  if(label) label.textContent = "The ordeal";
  const host = $("diffs");
  if(!host) return;
  host.innerHTML = '<div class="diff sel locked"><b>'+esc(d.name)+'</b><span>'+esc(d.desc)+'</span>'+
    '<span class="stats">'+d.lives+' lamps · clock ×'+d.time.toFixed(2)+'</span></div>';
}
$("brief-start").addEventListener("click", ()=>{ Snd.unlock(); startRun(briefMode, SAVE.set.diff); });
const teamPick = $("brief-team-pick");
if(teamPick) teamPick.addEventListener("click", function(e){
  const btn = e.target.closest("[data-team]");
  if(!btn) return;
  Snd.unlock();
  startRun("team", SAVE.set.diff, { teamSide: btn.dataset.team });
});
const tabletsPickHost = $("brief-tablets-pick");
if(tabletsPickHost) tabletsPickHost.addEventListener("click", function(e){
  const btn = e.target.closest("[data-chapter]");
  if(!btn || btn.disabled) return;
  Snd.unlock();
  startRun("tablets", SAVE.set.diff, { tabletChapter: btn.dataset.chapter });
});

/* ------------------------- THE PILGRIMAGE -------------------------
   The campaign rules live in pilgrimage.js and the map lives in
   atlas.js. What follows is only the wiring between them and the run
   machinery below: which site was picked, what happens when it is
   cleared, and where the player is sent afterwards. */

function pilgrimOverview(){ return Pilgrimage.overview(SAVE.pilgrim); }
function savePilgrim(p){ SAVE.pilgrim = p; persist(); }

let pendingSiteId = null;
let pendingArcKey = null;
let pendingUnlockId = null; /* site that just unlocked — celebrate on atlas */
let atlasWired = false;

function wireAtlas(){
  if(atlasWired) return;
  atlasWired = true;

  Atlas.on("begin",  id => openSiteBrief(id, "pilgrimage"));
  Atlas.on("recall", id => openSiteBrief(id, "pilgrim-recall"));
  Atlas.on("relay",  key => openRelayBrief(key));

  const rail = $("atlas-rail"), toggle = $("atlas-rail-toggle");
  if(toggle && rail) toggle.addEventListener("click", ()=>{ Snd.ui(); rail.classList.toggle("hidden"); });

  const zin = $("atlas-zin"), zout = $("atlas-zout"), zfit = $("atlas-zfit");
  if(zin)  zin.addEventListener("click",  ()=>{ Snd.ui(); if(Atlas.hasMap()) Atlas.focus(Atlas.activeSite()?Atlas.activeSite().id:null,{zoom:9}); });
  if(zout) zout.addEventListener("click", ()=>{ Snd.ui(); if(Atlas.hasMap()) Atlas.focus(Atlas.activeSite()?Atlas.activeSite().id:null,{zoom:6}); });
  if(zfit) zfit.addEventListener("click", ()=>{ Snd.ui(); Atlas.fitAll(); });

  // On a phone the rail covers the map, so it starts out of the way.
  if(rail && window.innerWidth < 720) rail.classList.add("hidden");
}

function openAtlas(){
  wireAtlas();
  const unlockId = pendingUnlockId;
  /* Unlock ceremony owns the entrance — skip cold open so it is not buried. */
  if(unlockId) Atlas.seenColdOpen(true);
  else Atlas.seenColdOpen(!!SAVE.set.coldOpenDone);
  syncTravelerToken();
  Atlas.mount(SAVE.pilgrim);
  if(!SAVE.set.coldOpenDone){ SAVE.set.coldOpenDone = true; persist(); }
  if(SAVE.set.liveWeather) Atlas.loadWeather();
  if(unlockId){
    pendingUnlockId = null;
    /* Let Leaflet measure the container, then fly + burst. */
    requestAnimationFrame(function(){
      setTimeout(function(){
        if(typeof Atlas.celebrateUnlock==="function") Atlas.celebrateUnlock(unlockId);
      }, 120);
    });
  }
}

/* ---- the real sky over the real place ----
   The atlas already knows the true solar altitude and the live weather
   at every site. Until now that only graded the map, which made the
   most distinctive thing about this campaign purely decorative. This
   carries it into the play view: answering at Nineveh after dark
   actually happens in the dark, and a dust storm over Ur puts dust on
   the screen.

   Strictly cosmetic. Real weather must never touch the clock or the
   difficulty — a player cannot plan around the wind in Iraq, and losing
   a run to it would be unfair in a way no amount of atmosphere pays
   for. */
let plateTimer = 0;
function applySitePlate(siteId){
  const b = document.body;
  const next = siteId || "";
  const prev = b.getAttribute("data-site") || "";
  const motif = $("site-motif");
  if(plateTimer){ clearTimeout(plateTimer); plateTimer = 0; }
  function stamp(){
    if(next) b.setAttribute("data-site", next);
    else b.removeAttribute("data-site");
    if(motif) motif.style.opacity = "";
  }
  if(!motif || next === prev || b.classList.contains("reduced")){
    stamp();
    return;
  }
  motif.style.opacity = "0";
  plateTimer = setTimeout(stamp, 280);
}

function applySiteSky(siteId){
  const b = document.body;
  ["sky-night","sky-twilight","sky-golden","sky-day",
   "wx-dust","wx-rain","wx-storm","wx-haze","wx-snow",
   "motif-sand","motif-smoke","motif-river","motif-sea",
   "motif-ash","motif-olive","motif-dust","motif-stars","motif-hall"]
    .forEach(c=>b.classList.remove(c));
  if(!siteId){
    applySitePlate("");
    return;
  }
  const site = Pilgrimage.site(siteId);
  if(!site){
    applySitePlate("");
    return;
  }

  const now = new Date();
  const sun = Geo.sunPosition(now, site.coords[0], site.coords[1]);
  b.classList.add("sky-" + Geo.lightPhase(sun.altitude));

  // readingFor never returns null — live if we have it, authored climate
  // if we do not — so there is no offline branch to write here.
  const r = Live.readingFor(site);
  const key = r && r.sky ? r.sky.key : "clear";
  if(key !== "clear" && key !== "cloud") b.classList.add("wx-" + key);
  applySitePlate(siteId);
}

/* ---- the briefing card for one site ---- */
let sbSiteId = null, sbMode = "pilgrimage";

function siteClockMs(siteId, mode){
  // Typed recall needs a clock sized for typing, not for picking — the
  // same reasoning the standard Recall mode uses.
  if(mode === "pilgrim-recall") return 32000;
  return Pilgrimage.clockFor(Pilgrimage.indexOf(siteId));
}

function siteBriefClockLabel(mode){
  if(mode === "pilgrim-recall") return "45s";
  return "30s · 45s assemble · 60s fade";
}

function fillSiteBriefHero(siteId, vig){
  const heroWrap = $("sb-hero-media");
  const heroImg = $("sb-hero-img");
  if(heroWrap && heroImg && vig && vig.image){
    heroImg.src = vig.image;
    heroImg.onerror = function(){
      if(vig.fallback) heroImg.src = vig.fallback;
      else heroWrap.style.display = "none";
    };
    heroWrap.style.display = "block";
  } else if(heroWrap){
    heroWrap.style.display = "none";
  }
}

function openSiteBrief(siteId, mode){
  const b = Pilgrimage.brief(siteId, SAVE.pilgrim);
  if(!b) return;
  if(!b.unlocked){ Atlas.note("That place is still sealed."); Director.speak("That place is still sealed.",true); return; }

  sbSiteId = siteId; sbMode = mode || "pilgrimage"; pendingSiteId = siteId;
  const s = b.site, arc = b.arc, D = resolveDiff(SAVE.set.diff);
  const secsLabel = siteBriefClockLabel(sbMode);

  $("sb-arc").textContent = arc ? arc.n + " · " + arc.name : s.tag;
  $("sb-name").textContent = s.name;
  $("sb-quote").textContent = s.quote;
  $("sb-ref").textContent = s.quoteRef;
  const vig = (typeof Pilgrimage !== "undefined" && Pilgrimage.vignette) ? Pilgrimage.vignette(siteId) : null;
  fillSiteBriefHero(siteId, vig);

  $("sb-info").innerHTML = [
    [b.ordinal + " / " + b.total, "Site on the road"],
    [String(b.verses), sbMode === "pilgrim-recall" ? "Verses, assembled" : "Verses"],
    [TIER_NAMES[b.tier] || "Foundation", "Difficulty"],
    [secsLabel, "Per verse"],
    [String(D.lives), "Lives"]
  ].map(i=>'<div class="bi"><b>'+esc(i[0])+'</b><span>'+esc(i[1])+'</span></div>').join("");

  // Conditions at the real place, right now.
  const r = Live.readingFor(s);
  const now = new Date();
  const sun = Geo.sunPosition(now, s.coords[0], s.coords[1]);
  $("sb-live").innerHTML = [
    [r.tempC + "°C", r.live ? "Temperature now" : "Typical temperature"],
    [r.sky ? r.sky.label : "—", "Sky"],
    [Geo.solarClock(now, s.coords[1]), "Local solar time"],
    [s.elevation + " m", "Elevation"]
  ].map(i=>'<div class="bl"><b>'+esc(i[0])+'</b><span>'+esc(i[1])+'</span></div>').join("");

  $("sb-start").textContent = sbMode === "pilgrim-recall" ? "Assemble it from memory" : (b.cleared ? "Walk it again" : "Begin");

  /* Named up front, not a spoiler: the player should know this stop ends
     with an extra sequence and exactly how many verses it adds. */
  const fin = sbMode === "pilgrimage" ? SetPieces.siteFinale(siteId) : null;
  const finale = fin
    ? " · closes with " + fin.title + " — " + fin.count + " more verses" : "";
  $("sb-hint").textContent = (sbMode === "pilgrim-recall"
    ? "Type the missing phrase · Keyboard if you want the board · Enter to lock · Esc pauses"
    : "A–D or 1–4 or tap to answer · last 2 assembled · S Selah · I Illuminate · Esc pauses") + finale;

  renderSiteDiffs();
  go("sitebrief");
}

/* The road deserves the same difficulty choice the brief always had —
   before this, a site started on whatever the global setting held, with
   no way to see or change it at the point of play. */
function renderSiteDiffs(){
  const host = $("sb-diffs");
  if(host) host.innerHTML = "";
}

/* ---- the briefing for a whole arc walked in one run ----
   Deliberately blunt about the cost. The relay is the optional hard way
   through ground the campaign already lets you take one site at a time,
   so the card should read as a warning rather than an invitation. */
function openRelayBrief(arcKey){
  const arc = Pilgrimage.arc(arcKey);
  if(!arc) return;
  const st = Pilgrimage.arcStatus(SAVE.pilgrim, arcKey);
  if(!st.open){ Atlas.note("That stretch of road is not open yet."); return; }

  pendingArcKey = arcKey; sbSiteId = null; sbMode = "relay";
  const sites = Pilgrimage.sitesInArc(arcKey);
  const D = resolveDiff(SAVE.set.diff);
  const first = Pilgrimage.indexOf(sites[0].id);
  const last  = Pilgrimage.indexOf(sites[sites.length-1].id);
  const secs  = i => (pacedClockMs(Pilgrimage.clockFor(i), D.time, Pilgrimage.PICK_PAD_MS || 1500) / 1000).toFixed(1);

  $("sb-arc").textContent = arc.n + " · " + arc.name;
  $("sb-name").textContent = "The Long Road";
  $("sb-quote").textContent = arc.sub;
  $("sb-ref").textContent = sites[0].name + "  →  " + sites[sites.length-1].name;

  $("sb-info").innerHTML = [
    [String(sites.length), "Sites, unbroken"],
    [String(sites.length * Pilgrimage.VERSES_PER_SITE), "Verses"],
    [String(D.lives), "Lives, shared"],
    [secs(first) + "s → " + secs(last) + "s", "Clock tightens"],
    [st.cleared + " / " + st.total, "Already cleared"]
  ].map(i=>'<div class="bi"><b>'+esc(i[0])+'</b><span>'+esc(i[1])+'</span></div>').join("");

  $("sb-live").innerHTML = "";
  $("sb-start").textContent = "Walk it";
  $("sb-hint").textContent = "Lives do not come back · every site you pass stays cleared, even if the road ends you";
  renderSiteDiffs();
  go("sitebrief");
}

$("sb-start").addEventListener("click", ()=>{ Snd.unlock(); startRun(sbMode, SAVE.set.diff); });
$("sb-back").addEventListener("click", ()=>{ Snd.ui(); go("atlas"); });

/* ---- the relay banks each site as it is passed ----
   Sites are recorded the moment the road leaves them, so ending at the
   fifth site of an arc still keeps the four behind it. The score is
   deliberately left at zero: the relay proves you can walk the stretch
   without rest, and the site's best score stays something you earn by
   walking it properly. Accuracy is real, so an arc can still be
   perfected this way. */
function bankRelaySite(siteId){
  const rl = R.relay;
  if(!rl || !siteId || rl.banked.indexOf(siteId) >= 0) return;
  const c = R.correct  - (rl.markCorrect  || 0);
  const a = R.attempts - (rl.markAttempts || 0);
  rl.banked.push(siteId);
  rl.markCorrect = R.correct; rl.markAttempts = R.attempts;

  const wasCleared = Pilgrimage.isCleared(SAVE.pilgrim, siteId);
  SAVE.pilgrim = Pilgrimage.record(SAVE.pilgrim, siteId, {
    cleared:true, score:0, accuracy: a ? Math.round(c/a*100) : 100, at:Date.now()
  });
  if(!wasCleared){
    SAVE.life.sitesCleared++;
    if(typeof Artifacts !== "undefined"){
      const u = Artifacts.unlockForSite(SAVE.artifacts, siteId, Date.now());
      SAVE.artifacts = u.store;
      if(u.firstUnlock && u.artifact) queueArtifactReveal(u.artifact);
    }
  }
  persist();
  const s = Pilgrimage.site(siteId);
  if(s) Director.callout(s.name + " — behind you");
}

/* ---- what a finished site does to the journey ---- */
function recordSiteResult(cleared, total, acc){
  if(!R.siteId) return null;
  const before = Pilgrimage.overview(SAVE.pilgrim);
  const wasCleared = Pilgrimage.isCleared(SAVE.pilgrim, R.siteId);

  const next = Pilgrimage.record(SAVE.pilgrim, R.siteId, {
    cleared: cleared, score: total, accuracy: Math.round(acc*100),
    livesLeft: R.lives, at: Date.now()
  });
  SAVE.pilgrim = next;

  const after = Pilgrimage.overview(next);
  if(cleared && !wasCleared){
    SAVE.life.sitesCleared++;
    const arcsBefore = before.arcs.filter(a=>a.complete).length;
    const arcsAfter  = after.arcs.filter(a=>a.complete).length;
    if(arcsAfter > arcsBefore) SAVE.life.arcsCleared++;
  }
  return {before, after, firstClear: cleared && !wasCleared};
}


/* ------------------------- FIRST-RUN TUTORIAL ------------------------- */
let pendingPostTutorialAction = null;
function showTutorialIfNeeded(){
  if(SAVE.set.tutorialDone){
    if(!profileReady()) openProfileSetup(true);
    return;
  }
  if(typeof startTutorialRun === "function"){
    startTutorialRun();
    return;
  }
  const el=$("tutorial"); if(!el) return;
  el.classList.add("on");
}
function runTutorialAction(action){
  if(action === "pilgrimage" || action === "ur" || action === true){
    Snd.unlock();
    go("atlas");
  } else if(action === "practice" || action === "drill"){
    Snd.unlock();
    openBrief("practice");
  }
}
function finishTutorial(action){
  SAVE.set.tutorialDone = true; persist();
  const el=$("tutorial"); if(el) el.classList.remove("on");
  if(!profileReady()){
    pendingPostTutorialAction = action;
    openProfileSetup(true);
    return;
  }
  runTutorialAction(action);
}
function bindTutorial(){
  const skip=$("tut-skip"), goBtn=$("tut-go"), drillBtn=$("tut-drill");
  if(skip) skip.addEventListener("click", ()=>{ Snd.ui(); finishTutorial(false); });
  if(drillBtn) drillBtn.addEventListener("click", ()=>{ Snd.ui(); finishTutorial("practice"); });
  if(goBtn) goBtn.addEventListener("click", ()=>{ Snd.ui(); finishTutorial("pilgrimage"); });
}


/* ------------------------- INTRO ------------------------- */
let introStarted=false, introDone=false, introReady=false, introTapPending=false;
function dataSaverOn(){
  return !!(navigator.connection && navigator.connection.saveData);
}
function introAllowed(){
  const v=$("intro-video");
  if(!v || typeof v.play!=="function") return false;
  if(document.body.classList.contains("reduced")) return false;
  if((SAVE.set.quality||"high")==="low") return false;
  /* An explicit data-saver preference skips the 2 MB video entirely. */
  if(dataSaverOn()) return false;
  return true;
}
function setIntroHint(text){
  const hint=document.querySelector("#intro-start .intro-hint");
  if(hint) hint.textContent=text;
}
function beginIntroPlayback(){
  if(introStarted || introDone || currentView!=="intro") return;
  const v=$("intro-video");
  /* The video is no longer fetched at boot (preload="none"): the first
     tap starts the download and playback begins the moment enough is
     buffered. A slow network waits on the poster instead of spending
     its bytes unprompted — the menu never pays for the intro. */
  if(v && !introReady && v.readyState<3){
    if(!introTapPending){
      introTapPending=true;
      setIntroHint("Preparing the record…");
      try{ v.load(); }catch(e){}
    }
    return;
  }
  introStarted=true;
  const card=$("intro-start"), skip=$("intro-skip"), stage=$("v-intro");
  if(card) card.setAttribute("hidden","");
  if(stage) stage.classList.add("playing");
  if(skip) skip.hidden=false;
  Snd.unlock();
  Snd.ambience("menu");
  if(typeof Director!=="undefined" && Director.caption){
    Director.caption("The word of God is quick, and powerful, and sharper than any twoedged sword.");
  }
  Snd.playVoice("audio/voice/intro-word.mp3", 13000);
  if(v){
    try{ v.currentTime=0; }catch(e){}
    const p=v.play();
    if(p&&p.catch) p.catch(function(){});
  }
}
function finishIntro(skipped){
  if(introDone) return;
  introDone=true;
  const v=$("intro-video"), stage=$("v-intro");
  if(skipped && typeof Snd!=="undefined" && Snd.stopVoice) Snd.stopVoice();
  if(stage) stage.classList.add("leaving");
  setTimeout(()=>{
    if(v){ try{ v.pause(); }catch(e){} }
    go("boot");
    playBootSequence({fast:!!skipped});
  }, skipped?280:900);
}
function playBootSequence(opts){
  if(typeof VERSES==="undefined" || !VERSES.length){
    if(typeof showState==="function") showState("load-fail", {
      onPrimary: function(){ location.reload(); }
    });
    return;
  }
  const fast=!!(opts&&opts.fast);
  const msgs=["Opening the sacred record…","Gathering the witnesses…","Preparing the trial…",
    "Lighting the final lamp…"];
  const marks=[22,48,76,100];
  const step=fast?320:620;
  let i=0;
  const fill=$("boot-fill"), msg=$("boot-msg"), bar=$("boot-bar");
  if(fill) fill.style.width="8%";
  if(msg) msg.textContent=msgs[0];
  if(bar) bar.setAttribute("aria-valuenow","8");
  const tick=setInterval(()=>{
    i++;
    if(fill) fill.style.width=marks[Math.min(i,marks.length-1)]+"%";
    if(bar) bar.setAttribute("aria-valuenow",String(marks[Math.min(i,marks.length-1)]));
    if(i<msgs.length && msg) msg.textContent=msgs[i];
    if(i>=marks.length){
      clearInterval(tick);
      if(msg) msg.textContent="The record is open.";
      setTimeout(()=>{
        if(currentView==="boot"){
          if(!SAVE.set.tutorialDone && typeof startTutorialRun === "function"){
            startTutorialRun();
          }else{
            go("menu");
            if(typeof profileReady==="function" && !profileReady()) openProfileSetup(true);
          }
        }
      }, fast?220:480);
    }
  }, step);
}
function armIntro(){
  const start=$("intro-start"), skip=$("intro-skip"), v=$("intro-video");
  if(start) start.addEventListener("click", ()=>{ Snd.ui(); beginIntroPlayback(); });
  if(skip) skip.addEventListener("click", e=>{ e.stopPropagation(); Snd.ui(); finishIntro(true); });
  if(!v) return;
  v.addEventListener("ended", ()=>finishIntro(false));
  v.addEventListener("error", ()=>{
    setIntroHint("Tap to enter the hall");
    /* A failed fetch must never strand the player on the poster — the
       pending tap path finishes straight into the hall. */
    if(introTapPending || introStarted) finishIntro(true);
  });
  function markReady(){
    if(introReady) return;
    introReady=true;
    if(introTapPending){ setIntroHint(""); beginIntroPlayback(); }
    else setIntroHint("Tap to begin");
  }
  v.addEventListener("canplaythrough", markReady, {once:true});
  v.addEventListener("canplay", markReady, {once:true});
  /* Nothing is fetched here. The poster carries the screen; the video
     loads on the first tap (see beginIntroPlayback). */
  setIntroHint("Tap to begin");
  if(v.readyState>=3) markReady();
}
