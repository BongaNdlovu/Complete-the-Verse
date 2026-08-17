/* ==================================================================
   GAME — modes, progression, meta, UI
   ================================================================== */
/* ------------------------- SAVE ------------------------- */
const SAVE_KEY = "ctv_save_v3";
const LEGACY_SAVE_KEY = "ctv_save_v2";
const DEFAULT_SAVE = {
  v:3, xp:0, oil:0, runs:0,
  best:{trial:0, endless:0, daily:0, practice:0, recall:0, pilgrimage:0, "pilgrim-recall":0, blitz:0},
  seals:[],
  life:{correct:0, attempts:0, bestStreak:0, sdBest:0, endlessBest:0, dailyDone:0, perfectActs:0,
        typedExact:0, typedAttempts:0, reviewsDone:0, sitesCleared:0, arcsCleared:0, blitzBest:0,
        oilSpent:0, oilEarned:0},
  books:{}, verse:{}, srs:{}, board:[], journal:[],
  ghosts:{pilgrimage:null, blitz:null},
  daily:{date:"", score:0},
  /* The road from Ur to Patmos. Shape is owned by pilgrimage.js —
     blankProgress() there is the authority — and stored here so a
     journey survives a reload. */
  pilgrim:{sites:{}, lastPlayed:"", started:0, usedIds:[]},
  /* Relics unlocked by first site clear. Shape owned by artifacts.js. */
  artifacts:{unlocked:{}, seen:{}},
  set:{music:0.45, sfx:0.7, quality:"high", qualityLocked:false, reduced:false, shake:true, voice:true, diff:"watchman",
       tutorialDone:false, liveWeather:true, coldOpenDone:false, quiet:false, contrast:false, haptics:true,
       singleTap:true,
       character:"amina", scholarId:"amina", playerName:"", profileDone:false,
       vkb:false,
       /* legacy keys kept so old saves merge cleanly */
       characterDone:false}
};
let SAVE = load();
function load(){
  try{
    let raw = localStorage.getItem(SAVE_KEY), migrating = false;
    if(!raw){ raw = localStorage.getItem(LEGACY_SAVE_KEY); migrating = !!raw; }
    if(!raw) return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    const s = JSON.parse(raw);
    const out = Object.assign(JSON.parse(JSON.stringify(DEFAULT_SAVE)), s, {
      v:3,
      best:Object.assign({}, DEFAULT_SAVE.best, s.best||{}),
      life:Object.assign({}, DEFAULT_SAVE.life, s.life||{}),
      set:Object.assign({}, DEFAULT_SAVE.set, s.set||{}),
      daily:Object.assign({}, DEFAULT_SAVE.daily, s.daily||{}),
      srs:Object.assign({}, s.srs||{}),
      // A save written before the Pilgrimage existed has no `pilgrim`
      // key at all. Merging rather than replacing means such a player
      // simply starts the journey at Ur with everything else intact —
      // no wipe, no reset, no lost seals.
      pilgrim:Object.assign({sites:{}, lastPlayed:"", started:0, usedIds:[]}, s.pilgrim||{}, {
        sites:Object.assign({}, (s.pilgrim && s.pilgrim.sites) || {}),
        usedIds: Array.isArray(s.pilgrim && s.pilgrim.usedIds) ? s.pilgrim.usedIds.slice() : []
      }),
      artifacts: (typeof Artifacts !== "undefined")
        ? Artifacts.normalize(s.artifacts)
        : Object.assign({unlocked:{}, seen:{}}, s.artifacts||{}),
      journal: Array.isArray(s.journal) ? s.journal.slice(0, 40) : [],
      ghosts: Object.assign({pilgrimage:null, blitz:null}, s.ghosts||{})
    });
    if(migrating) migrateV2(out, s);
    migrateProfile(out);
    migrateBlitzUnits(out);
    return out;
  }catch(e){ return JSON.parse(JSON.stringify(DEFAULT_SAVE)); }
}

/* v2 keyed verse stats by position in the VERSES array. This release cuts
   296 verses, so those positions no longer mean anything — re-point every
   record through LEGACY_IDS and drop the ones whose verse is gone.
   Lifetime totals, seals, XP and records are untouched. */
function migrateV2(out, old){
  const table = (typeof LEGACY_IDS !== "undefined" && LEGACY_IDS) || null;
  const moved = {};
  if(table && old.verse){
    Object.keys(old.verse).forEach(k => {
      const idx = parseInt(k, 10);
      if(!Number.isFinite(idx)) return;
      const id = table[idx];
      if(id) moved[id] = old.verse[k];
    });
  }
  out.verse = moved;
  // v2 kept no scheduling, so seed a card from what it did know: anything
  // answered correctly is treated as one successful review due today, so
  // returning players start with a full drill rather than an empty one.
  out.srs = {};
  const today = SRS.dayNumber();
  Object.keys(moved).forEach(id => {
    const st = moved[id];
    if(!st || !st.a) return;
    const card = SRS.freshCard();
    if(st.c > 0){ card.reps = 1; card.ivl = 1; card.due = today; card.last = today; }
    else { card.lapses = 1; card.due = today; }
    out.srs[id] = card;
  });
}
/* Scholars only — Bible-figure skins are retired. Keep the scholar they picked. */
function migrateProfile(out){
  if(!out || !out.set) return;
  if(out.set.characterDone && !out.set.profileDone) out.set.profileDone = true;
  if(out.set.playerName == null) out.set.playerName = "";
  if(out.set.diff !== "watchman") out.set.diff = "watchman";
  const id = out.set.character;
  const known = typeof Characters !== "undefined" && Characters.byId(id);
  if(!known){
    out.set.character = (typeof Characters !== "undefined" && Characters.defaultScholarId()) || "amina";
    out.set.scholarId = out.set.character;
  } else if(Characters.isScholar(known)){
    out.set.scholarId = known.id;
  } else {
    if(!out.set.scholarId) out.set.scholarId = Characters.defaultScholarId() || "amina";
    out.set.character = out.set.scholarId;
  }
}

/* Old Blitz records stored composite totals (thousands). Verse counts
   stay well below this; a value above it that is not already life.blitzBest
   is the old unit and must be rewritten. Ceiling lives inside the
   function because load() runs at parse time, before later consts. */
function migrateBlitzUnits(out){
  if(!out) return out;
  const ceiling = 200;
  out.best = out.best || {};
  out.life = out.life || {};
  const best = Number(out.best.blitz) || 0;
  const verses = Number(out.life.blitzBest) || 0;
  if(best > ceiling && best !== verses) out.best.blitz = verses;
  if(out.ghosts && out.ghosts.blitz){
    const gs = Number(out.ghosts.blitz.score) || 0;
    if(gs > ceiling && gs !== (Number(out.best.blitz)||0)) out.ghosts.blitz = null;
  }
  return out;
}

function persist(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){}
  /* Debounced cloud push when signed in — local write never waits on network. */
  if(typeof Cloud!=="undefined" && Cloud.configured() && Cloud.isSignedIn()){
    Cloud.schedulePush(SAVE);
  }
}

/* ------------------------- SRS ACCESS ------------------------- */
function today(){ return SRS.dayNumber(); }
function cardFor(v){ return SAVE.srs[v.id]; }
function reviewVerse(q, opts){
  const prev = SAVE.srs[q.id];
  const quality = SRS.gradeAnswer(opts);
  SAVE.srs[q.id] = SRS.schedule(prev, quality, today());
  SAVE.life.reviewsDone++;
  return SAVE.srs[q.id];
}
function dueToday(){ return SRS.dueCount(VERSES, cardFor, today()); }

/* ------------------------- ROAD VERSE LEDGER -------------------------
   A journey verse is spent when it is actually served, not when the run
   opens — quitting a site you never answered must not burn its draw. */
function commitSiteVerse(v){
  if(!v || !v.id) return;
  if(!(R.mode==="pilgrimage" || R.mode==="pilgrim-recall" || R.mode==="relay")) return;
  if(R.siteCommitted[v.id]) return;
  R.siteCommitted[v.id] = 1;
  SAVE.pilgrim = Pilgrimage.markUsed(SAVE.pilgrim, [v.id]);
  persist();
}

/* ------------------------- PROGRESSION ------------------------- */
function xpNeeded(l){ return (typeof Meta!=="undefined" && Meta.xpNeeded) ? Meta.xpNeeded(l) : Math.round(320 * Math.pow(l, 1.32)); }
function levelInfo(xp){
  if(typeof Meta!=="undefined" && Meta.levelInfo) return Meta.levelInfo(xp);
  let l=1, rem=xp;
  while(l < 160 && rem >= xpNeeded(l)){ rem -= xpNeeded(l); l++; }
  return {level:l, into:rem, need:xpNeeded(l)};
}
const RANKS = (typeof Meta!=="undefined" && Meta.RANKS) ? Meta.RANKS : [
  {l:1,t:"Hearer"},{l:3,t:"Reader"},{l:5,t:"Scribe"},{l:8,t:"Levite"},
  {l:11,t:"Watchman"},{l:15,t:"Seer"},{l:20,t:"Keeper of the Word"},{l:27,t:"Prophet of the Living God"}
];
function rankFor(level){ return (typeof Meta!=="undefined" && Meta.rankFor) ? Meta.rankFor(level) : (RANKS.filter(x=>level>=x.l).pop()||RANKS[0]).t; }
function trialActs(){
  const n = (typeof Meta!=="undefined" && Meta.trialActCount) ? Meta.trialActCount(SAVE) : 5;
  return ACTS.slice(0, Math.min(ACTS.length, n));
}
const RUN_TITLES = [
  {s:0,t:"Hearer"},{s:3500,t:"Reader"},{s:9000,t:"Scribe"},{s:18000,t:"Levite"},
  {s:30000,t:"Watchman"},{s:46000,t:"Seer"},{s:68000,t:"Keeper of the Word"},{s:95000,t:"Prophet of the Living God"}
];
function runTitle(score){ let r=RUN_TITLES[0]; RUN_TITLES.forEach(x=>{ if(score>=x.s) r=x; }); return r.t; }

/* ------------------------- SEALS ------------------------- */
const SEALS = [
  {id:"first",   n:"First Light",        d:"Complete your first run."},
  {id:"unshaken",n:"Unshaken",           d:"Clear a full act without losing a life."},
  {id:"recall",  n:"Perfect Recall",     d:"Answer 10 correct in a row."},
  {id:"flame",   n:"Flame Keeper",       d:"Answer 20 correct in a row."},
  {id:"watch",   n:"The Watchman",       d:"Reach Act V of the Trial."},
  {id:"swift",   n:"Swift of Tongue",    d:"Answer 10 times under 1.5 seconds in one run."},
  {id:"nocrutch",n:"No Crutch",          d:"Finish the Trial without spending a single power."},
  {id:"flawless",n:"Nothing Lost",       d:"Finish the Trial with no wrong answers."},
  {id:"score25", n:"Weight of Glory",    d:"Score 25,000 in a single run."},
  {id:"score50", n:"Crown of Gold",      d:"Score 50,000 in a single run."},
  {id:"sd15",    n:"Final Witness",      d:"Complete the five-question Final Test."},
  {id:"end40",   n:"Long Obedience",     d:"Answer 40 questions in one Endless run."},
  {id:"daily7",  n:"Daily Bread",        d:"Complete 7 Daily Trials."},
  {id:"books30", n:"Testament Bearer",   d:"Answer correctly from 30 different books."},
  {id:"books66", n:"The Whole Counsel",  d:"Answer correctly from all 66 books."},
  {id:"lvl20",   n:"Master of the Word", d:"Reach level 20."},
  {id:"life500", n:"Scribe's Hand",      d:"500 correct answers, all-time."},
  {id:"ironman", n:"Iron Sharpeneth",    d:"Complete the Trial."},
  {id:"road-first", n:"Get Thee Out",    d:"Clear your first site on the Pilgrimage."},
  {id:"road-arc1",  n:"Out of Ur",       d:"Complete the Patriarchs — Ur to Dothan."},
  {id:"road-half",  n:"Half the Road",   d:"Complete two full arcs of the Pilgrimage."},
  {id:"road-patmos",n:"The Last Island", d:"Reach and clear Patmos."},
  {id:"road-end",   n:"Ur to Patmos",    d:"Clear every site on the Pilgrimage."},
  /* One per arc. A site's perfect flag is sticky, so an arc can be
     perfected a site at a time — the seal rewards precision over the
     whole stretch, not one flawless sitting. */
  {id:"arc-patriarchs",n:"Faith of Abraham", d:"Keep every verse at every site from Ur to Dothan."},
  {id:"arc-exodus",    n:"Out of Egypt",     d:"Keep every verse at every site from Midian to Gilgal."},
  {id:"arc-judges",    n:"No King in Israel",d:"Keep every verse at every site from Harod to Mizpah."},
  {id:"arc-kingdom",   n:"By the Rivers",    d:"Keep every verse at every site from Jerusalem to Susa."},
  {id:"arc-gospel",    n:"To the Ends",      d:"Keep every verse at every site from Bethlehem to Patmos."},
  {id:"relay",         n:"Without Rest",     d:"Walk a whole arc in one unbroken run."},
  {id:"remnant",       n:"The Remnant",      d:"Complete Act VI of the Trial."},
  {id:"oil50",         n:"Anointed",         d:"Spend 50 oil on extra lifelines."},
  {id:"ascent",        n:"The Ascent",       d:"Reach level 35 — Elder of the Gate."},
  {id:"assemble12",    n:"Fitted Stones",    d:"Place 12 phrases word for word in one run."},
  {id:"act6-watch",    n:"The Last Watch",   d:"Complete Act VI on Watchman difficulty."}
];
function hasSeal(id){ return SAVE.seals.indexOf(id) >= 0; }

/* Printed clock on a mode card. Always Polish.pacedClockMs via
   describeModeClock so the hall cannot invent a second set of numbers. */
function modeClockLabel(mode){
  if(typeof Polish!=="undefined" && Polish.describeModeClock) return Polish.describeModeClock(mode);
  return "";
}

/* ------------------------- MODES / DIFFICULTY / ACTS ------------------------- */
const MODES = {
  /* The Pilgrimage does not use the standard brief screen — it opens the
     atlas instead, and the site you pick there is the level. `atlas:true`
     is what routes it. `hidden:true` keeps a mode off the menu without
     hiding it from the results screen, which still needs its name. */
  pilgrimage:{ key:"pilgrimage", name:"The Pilgrimage", kick:"The long road", atlas:true,
    desc:"Forty-six places, in the order Scripture walks them — from the city Abraham left to the island where the last book was written. Each site is eight verses drawn without repeating earlier stops; the last two of every stop are assembled from memory. The clock closes as you go east.",
    tagline:"46 sites · Ur to Patmos", info:[["46","Sites"],["8","Verses each"],[modeClockLabel("pilgrimage"),"Clock"]] },
  "pilgrim-recall":{ key:"pilgrim-recall", name:"Pilgrim’s Recall", kick:"Typed from memory", hidden:true,
    desc:"A site you have already cleared, walked again with no options on the screen. Same place, assembled word for word.",
    tagline:"Assemble · cleared sites", info:[["8","Verses"],["Assemble","No options"],[modeClockLabel("pilgrim-recall"),"Clock"]] },
  /* Hidden campaign extras — not on the menu. */
  relay:{ key:"relay", name:"The Long Road", kick:"One unbroken walk", hidden:true,
    desc:"A whole arc in a single run. Lives carry from site to site and never come back, and the clock keeps tightening the way the road does. Sites you pass stay cleared even if the road ends you.",
    tagline:"A whole arc · shared lives", info:[["1","Run"],["Shared","Lives"],["No","Rest"]] },
  /* Trial, Endless and the Drill are back on the menu: hiding them left
     six Trial-only seals and the Endless seal with no public path, and
     the Drill is the only mode that serves SRS-due verses. The menu
     order below (MENU_ORDER) puts the Pilgrimage first. */
  trial:{ key:"trial", name:"The Trial", kick:"Campaign",
    desc:"Five acts. The clock tightens with every one. Reach Act V with one life, clear its five questions, and earn the ending. A sixth act waits for those who have already been through the fire.",
    tagline:"5 acts · one-life finale", info:[["5","Acts"],["39+","Verses"],[modeClockLabel("trial"),"Clock"]] },
  endless:{ key:"endless", name:"Endless Gauntlet", kick:"Survival",
    desc:"One continuous run. The timer shrinks a fraction each question and never resets.",
    tagline:"Infinite · shrinking clock", info:[["∞","Questions"],[modeClockLabel("endless"),"Clock"],["All 5","Tiers"]] },
  daily:{ key:"daily", name:"Daily Trial", kick:"One shot a day",
    desc:"Twenty verses, drawn by today's date. Everyone who plays today gets exactly the same twenty in exactly the same order. Your first finished run sets the day's score — a run that ends early does not count, and after the score stands you may practise.",
    tagline:"20 verses · same for everyone", info:[["20","Verses"],["1","Recorded run"],[modeClockLabel("daily"),"Clock"]] },
  blitz:{ key:"blitz", name:"Scripture Blitz", kick:"Sixty seconds",
    desc:"A survival clock. Every correct answer adds two seconds; every miss burns four. The screen edges flare as time runs thin. How many verses can you hold?",
    tagline:"60s · +2s / −4s", info:[[modeClockLabel("blitz"),"Start"],["+2s","Correct"],["−4s","Miss"]] },
  /* The Drill serves the spaced-repetition queue — it is the game's
     learning loop and belongs on the menu, not behind the tutorial. */
  practice:{ key:"practice", name:"The Drill", kick:"Spaced review",
    desc:"The verses that have fallen due, most overdue first, then whatever you have never seen.",
    tagline:"15 verses · due first", info:[["15","Verses"],["Due","Ordered by"],[modeClockLabel("practice"),"Clock"]] },
  recall:{ key:"recall", name:"Recall", kick:"Assemble it from memory", hidden:true,
    desc:"No options to choose between. The missing words sit in a bank with a few fakes. Place them in order.",
    tagline:"12 verses · assemble", info:[["12","Verses"],["Assemble","No options"],[modeClockLabel("recall"),"Clock"]] }
};
const DIFFS = {
  watchman:{ key:"watchman", name:"Watchman", lives:2, time:0.85, score:1.0,
    desc:"Two lamps. The clock as the ordeal writes it. There is no lighter path." }
};
function resolveDiff(key){
  return DIFFS.watchman;
}
const ACTS = [
  {n:"I",  name:"The Signal",          tier:1, q:8, t:14000, pal:"act1", sub:"The record opens. Familiar words establish the signal."},
  {n:"II", name:"The Pursuit",         tier:2, q:8, t:12000, pal:"act2", sub:"The pace accelerates. Exact recall is the only way forward."},
  {n:"III",name:"The Blackout",        tier:3, q:9, t:10000, pal:"act3", sub:"Light falls away. Lifelines narrow and the hidden books emerge."},
  {n:"IV", name:"No Turning Back",     tier:4, q:9, t:8500,  pal:"act4", sub:"Rapid decisions. Reduced time. Every answer changes the ending."},
  {n:"V",  name:"The Final Test",      tier:5, q:5, t:6500, pal:"act5", sub:"One life. Five decisions. Complete the passage and hold the line."},
  {n:"VI", name:"The Remnant",         tier:5, q:7, t:5500, pal:"act5", sub:"The record does not close. Seven last phrases. One life still."}
];

/* The streaks at which the score multiplier steps up. Both the
   multiplier and the momentum meter read from this one list, because
   they used to disagree: the meter filled to 100% at a streak of 10
   while ×5 did not land until 12, so the bar sat pinned at "Overdrive"
   for two verses before the reward it was promising actually arrived.
   The meter is now a readout of the multiplier rather than a second
   scale that happens to look like it. */
const MOMENTUM_STEPS = [3, 5, 8, 12];
/* Global pace: +20% on every stage clock. Lives in polish.js so the
   tests can pin it. */
const PACE = (typeof Polish!=="undefined" && Polish.PACE) || 1.2;
/* Flat +5s on every question clock, after pacing and difficulty. */
const FLAT_ADD_MS = (typeof Polish!=="undefined" && Polish.FLAT_ADD_MS) || 5000;

/* ------------------------- ROUTER ------------------------- */
let currentView = "boot";
function applyLeave(plan){
  if(!plan || plan.same) return;
  if(plan.unmountAtlas && typeof Atlas!=="undefined" && Atlas.unmount) Atlas.unmount();
  if(plan.stopTimer) stopTimer();
  if(plan.hideWipe) hideWipe();
  if(plan.hidePause){ const p=$("pause"); if(p) p.classList.remove("on"); R.paused=false; }
  if(plan.hideJudge){ const j=$("judge-burst"); if(j) j.classList.remove("on","up","down"); }
  if(plan.hideOverdrive){
    clearTimeout(R._odTimer);
    const od=$("overdrive-choice"); if(od) od.classList.remove("on");
    document.body.classList.remove("od-open");
  }
  if(plan.hideQuote && typeof hideSiteQuote==="function") hideSiteQuote();
  if(plan.clearPlayClasses){
    document.body.classList.remove("setpiece-active","overdrive","od-open","wiping",
      "mode-typed","speed-round","reveal-freeze","pressure-3","pressure-5","pressure-7",
      "blitz-edge","blitz-edge-2","blitz-edge-3");
  }
  if(plan.bumpScene) R.sceneToken = (R.sceneToken||0) + 1;
  if(plan.hideState && currentView!=="play") hideState();
}
function go(view){
  const leaving = currentView;
  const plan = (typeof Flow!=="undefined" && Flow.leaveView) ? Flow.leaveView(leaving, view) : null;
  applyLeave(plan);
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("on"));
  const el = $("v-"+view); if(el) el.classList.add("on");
  currentView = view;
  // the play view supplies its own header/footer letterboxing
  document.body.classList.toggle("cine", view==="act");
  // The site's sky belongs to the site. Anywhere else gets the game's
  // own grading back.
  if(view!=="play"){ applySiteSky(null); document.body.classList.remove("mode-typed"); }
  if(view==="intro"){ syncHallVideo(SAVE.set.quality); }
  if(view==="atlas"){ Backdrop.palette("menu"); Snd.ambience("menu"); openAtlas(); }
  if(view==="boot"){ Backdrop.palette("menu"); syncHallVideo(SAVE.set.quality); }
  if(view==="menu"){ Backdrop.palette("menu"); Snd.ambience("menu"); renderMenu(); syncHallVideo(SAVE.set.quality); }
  if(view==="brief"||view==="study"||view==="seals"||view==="records"||view==="settings"||view==="relics"){
    syncHallVideo(SAVE.set.quality);
  }
  if(view==="results"){ Backdrop.palette("results"); Snd.ambience("results"); }
  if(view==="study") renderStudy();
  if(view==="relics") renderRelics();
  if(view==="seals") renderSeals();
  if(view==="records") renderRecords();
  if(view==="settings") renderSettings();
  updatePlayerCard();   // shows/hides the player card and top-right icons per view
  document.body.classList.toggle("view-play", view==="play");
  if(typeof Director!=="undefined" && Director.syncFx) Director.syncFx();
  if(view==="play") ensureLoop(); else if(!(plan && plan.stopLoop===false)) stopLoop();
}
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-go]");
  if(b){ Snd.unlock(); Snd.ui(); go(b.dataset.go); }
});
let lastHoverAt=0, lastHoverEl=null;
document.addEventListener("pointerover", e=>{
  if(currentView==="play"||currentView==="boot"||currentView==="act") return;
  const t=e.target.closest(".btn, .mode, .tab, .pwr:not(.spent)");
  if(!t || t===lastHoverEl || t.disabled) return;
  lastHoverEl=t;
  const now=Date.now();
  if(now-lastHoverAt<90) return;
  lastHoverAt=now;
  Snd.hover();
});
document.addEventListener("pointerout", e=>{
  const t=e.target.closest(".btn, .mode, .tab, .pwr");
  if(t && t===lastHoverEl) lastHoverEl=null;
});

/* ------------------------- RUN STATE ------------------------- */
const R = {};
function afterRun(delay, fn){
  const token = R.runToken;
  return setTimeout(()=>{ if(R.runToken===token) fn(); }, delay);
}
function invalidateRun(){
  R.runToken = (R.runToken||0) + 1;
  R.sceneToken = (R.sceneToken||0) + 1;
  stopTimer();
}
function drawVerse(tier, rnd){
  const r = rnd || Math.random;
  let pool = poolSansRepeatRefs(BY_TIER[tier].filter(v=>!R.used.has(v.id)));
  if(!pool.length){ R.used.clear(); pool = BY_TIER[tier].slice(); }
  const v = pool[Math.floor(r()*pool.length)];
  R.used.add(v.id);
  return v;
}
function drawEndlessVerse(tier){
  let pool=poolSansRepeatRefs(BY_TIER[tier].filter(v=>!R.used.has(v.id)));
  if(!pool.length){
    BY_TIER[tier].forEach(v=>R.used.delete(v.id));
    pool=BY_TIER[tier].slice();
  }
  const weighted=pool.map(v=>{
    const s=SAVE.verse[v.id],book=SAVE.books[v.b];
    let weight=!s||!s.a?1.8:s.c===0?4:s.c/s.a<.5?3.2:s.c/s.a<.7?2:.78;
    if(book&&book.a>=3&&book.c/book.a<.65)weight*=1.25;
    return {v,weight};
  });
  let roll=Math.random()*weighted.reduce((n,x)=>n+x.weight,0),chosen=weighted[weighted.length-1].v;
  for(const item of weighted){roll-=item.weight;if(roll<=0){chosen=item.v;break;}}
  const seen=SAVE.verse[chosen.id];
  R.adaptivePick=!seen||!seen.a?"New ground":seen.c/seen.a<.7?"Review target":"Mastery check";
  R.used.add(chosen.id);
  return chosen;
}
/* The Drill and Recall both pull from the SRS queue: due verses first
   (most overdue leading), then never-seen, then anything still scheduled.
   The queue is built once at the start of the run so the session is a
   coherent list rather than a fresh weighted roll each question. */
function buildReviewQueue(len){
  const pool = poolSansRepeatRefs(VERSES.filter(v => !R.used.has(v.id)));
  return SRS.buildQueue(pool.length ? pool : VERSES.slice(), cardFor, today(), len,
    list => shuffle(list));
}
function drawReviewVerse(){
  if(!R.queue || !R.queue.length) R.queue = buildReviewQueue(40);
  let chosen = R.queue.shift();
  while(chosen && R.used.has(chosen.id) && R.queue.length) chosen = R.queue.shift();
  if(!chosen){ R.used.clear(); R.queue = buildReviewQueue(40); chosen = R.queue.shift(); }
  const card = cardFor(chosen), t = today();
  const over = SRS.overdueBy(card, t);
  R.adaptivePick = !card || (!card.reps && !card.lapses) ? "Never seen"
    : card.lapses && !card.reps ? "Lost last time"
    : over > 0 ? over + (over === 1 ? " day overdue" : " days overdue")
    : over === 0 ? "Due today" : "Ahead of schedule";
  R.used.add(chosen.id);
  return chosen;
}
function buildDailyList(){
  const rnd = mulberry32(seedFromString("ctv-"+todayKey()));
  const pattern = [1,1,2,2,2,3,3,3,3,3,4,4,4,4,5,5,5,5,5,5];
  const used = new Set(), out = [];
  pattern.forEach(t=>{
    let pool = poolSansRepeatRefs(BY_TIER[t].filter(v=>!used.has(v.id)));
    if(!pool.length) pool = BY_TIER[t].slice();
    const v = pool[Math.floor(rnd()*pool.length)];
    used.add(v.id); R.usedRefs.add(refKey(v)); out.push({v:v, rnd:rnd});
  });
  return {list:out, rnd:rnd};
}

function startRun(mode, diffKey, options){
  const D = resolveDiff(diffKey);
  const runToken = (R.runToken||0) + 1;
  pendingSeals = [];

  /* A pilgrimage level is a fixed list of verses drawn from the site's
     own scripture, decided here and then played straight through. The
     attempt count seeds the draw, so walking a site again gives a
     different set — and journey usedIds keep earlier sites out forever. */
  const isPilgrim = mode==="pilgrimage" || mode==="pilgrim-recall";
  let siteId = null, siteDraw = null, siteIndex = -1;
  if(isPilgrim){
    siteId = pendingSiteId || R.siteId;
    siteIndex = Pilgrimage.indexOf(siteId);
    const rec = Pilgrimage.recordOf(SAVE.pilgrim, siteId);
    const exclude = Pilgrimage.usedSet(SAVE.pilgrim);
    siteDraw = Pilgrimage.drawSite(siteId, {
      attempt: rec ? rec.attempts : 0,
      exclude: exclude
    });
    if(!siteDraw || !siteDraw.verses || !siteDraw.verses.length){
      showState("empty-draw", {
        onPrimary: function(){ hideState(); go("atlas"); },
        onSecondary: function(){ hideState(); go("menu"); }
      });
      return;
    }
    /* Verses are committed as they are SERVED (commitSiteVerse below), not
     here. Burning the whole draw at startRun meant backing out of a brief
     you never answered still spent the site's eight verses forever. */
  }

  /* The relay flattens a whole arc into one queue, each entry tagged
     with the site it came from so the clock, the tier and the HUD can
     follow the road as it goes. Sites are banked as they are passed —
     dying at the fifth site does not take the four behind it. */
  let relay = null;
  if(mode==="relay"){
    const arcKey = pendingArcKey || (R.relay && R.relay.arcKey);
    const list = Pilgrimage.sitesInArc(arcKey);
    const queue = [];
    let exclude = Pilgrimage.usedSet(SAVE.pilgrim);
    list.forEach(s=>{
      const rec = Pilgrimage.recordOf(SAVE.pilgrim, s.id);
      const drawn = Pilgrimage.drawSite(s.id, {attempt: rec ? rec.attempts : 0, exclude: exclude});
      drawn.verses.forEach(v => {
        queue.push({siteId:s.id, index:Pilgrimage.indexOf(s.id), v:v});
        exclude[v.id] = 1;
      });
    });
    relay = {arcKey:arcKey, sites:list.map(s=>s.id), queue:queue, idx:0, banked:[], current:null};
  }

  /* Pilgrimage is lean: one Selah, one Illuminate, no Second Wind.
     Blitz: no lifelines. Daily keeps the full toolkit. */
  const leanRoad = isPilgrim || mode==="relay";
  const startPowers = mode==="blitz"
    ? {selah:0, illum:0, wind:0}
    : leanRoad
    ? {selah:1, illum:1, wind:0}
    : {selah:1, illum:2, wind:1};
  const blitzMs = (typeof Polish!=="undefined" && Polish.BLITZ_START_MS) || 60000;

  Object.assign(R, {
    runToken, sceneToken:0, ended:false,
    mode, diff:D, actIdx:0, qInAct:0, qTotal:0,
    score:0, disp:0, lives: mode==="blitz" ? 99 : D.lives, maxLives: mode==="blitz" ? 99 : D.lives,
    streak:0, best:0, correct:0, attempts:0, missed:[], used:new Set(), usedRefs:new Set(),
    siteCommitted:{},
    powers:startPowers, usedPower:false, powersSpent:0,
    fast:0, sdCount:0, tiersSeen:new Set(), booksRun:new Set(),
    running:false, tEnd:0, tTotal:0, qStart:0, q:null, paused:false, locked:false, selected:null,
    actNoLoss:true, gotUnshaken:false, dailyIdx:0, daily:null, endlessBase:12000,
    startedAt:Date.now(), lastTickSec:-1, lastHeart:0, pressureStage:-1,
    setpiece:null, setpieceDone:new Set(), oneLifeCalled:false, overdriveGift:false,
    overdriveRide:false, overdriveOffered:false, armorUsed:false, speed:false,
    passage:null, recon:null, usedPass:new Set(), adaptivePick:"",
    decisionMs:0, timedDecisions:0, fastestMs:Infinity,
    actStartAttempts:0, actStartCorrect:0,
    practiceLen: (options && options.queue && options.queue.length) ? options.queue.length
               : mode==="practice" ? 15 : mode==="recall" ? 12
               : isPilgrim ? siteDraw.verses.length : 0,
    typed: mode==="recall" || mode==="pilgrim-recall", hintLevel:0, queue:null,
    typedExact:0, typedClose:0, rescheduled:[],
    siteId: siteId, siteIndex: siteIndex, siteIdx: 0,
    siteVerses: siteDraw ? siteDraw.verses : null,
    siteRing: siteDraw ? siteDraw.ring : "",
    relay: relay,
    blitzEnd: mode==="blitz" ? performance.now() + blitzMs : 0,
    ghostSamples: [{ t:0, p:0 }],
    lastPickKey: "", lastPickAt: 0,
    quoteShown: false, assemble: null
  });
  document.body.classList.remove("setpiece-active","overdrive","momentum-1","momentum-2","momentum-3","momentum-4","blitz-edge","blitz-edge-2","blitz-edge-3");
  if(mode==="daily") R.daily = buildDailyList();
  renderLives();
  syncWitness();
  $("score").textContent = "0"; setMult();
  Director.momentum(false);
  renderPowers();
  updateActTrack();
  if(mode==="practice" || mode==="recall"){
    if(options && options.queue && options.queue.length){
      R.queue = options.queue.slice();
    } else {
      R.queue = buildReviewQueue(R.practiceLen + 12);
    }
    if(!VERSES || !VERSES.length || !R.queue || !R.queue.length){
      showState("empty-drill", { onPrimary: function(){ hideState(); go("menu"); } });
      return;
    }
  }
  if(mode==="trial"){ beginAct(0); }
  else {
    // Each arc of the road carries its own bed, so the Patriarchs and
    // the Church do not sound like the same afternoon.
    let pal = mode==="endless" ? "act3" : mode==="practice" ? "act1" : mode==="recall" ? "act4" : mode==="blitz" ? "act5" : "act2";
    if(isPilgrim){
      const site = Pilgrimage.site(siteId);
      const arc = site ? Pilgrimage.arc(site.arc) : null;
      pal = (arc && arc.pal) || "act2";
    }
    if(mode==="relay"){
      const arc = Pilgrimage.arc(relay.arcKey);
      pal = (arc && arc.pal) || "act3";
    }
    Backdrop.palette(pal);
    Snd.ambience(pal);
    $("hud-round").textContent = isPilgrim && Pilgrimage.site(siteId)
      ? Pilgrimage.site(siteId).name
      : mode==="relay" ? (Pilgrimage.arc(relay.arcKey) || {name:"The Long Road"}).name
      : MODES[mode].name;
    // The play view wears the sky the site is actually under.
    applySiteSky(isPilgrim ? siteId : mode==="relay" ? relay.sites[0] : null);
    if(!(isPilgrim || mode==="relay")) applySitePlate("hall");
    go("play"); nextQuestion();
  }
}

function beginAct(i){
  const report=$("act-report");
  if(i>0){
    const tried=Math.max(0,R.attempts-R.actStartAttempts);
    const kept=Math.max(0,R.correct-R.actStartCorrect);
    const accuracy=tried?Math.round(kept/tried*100):100;
    let supply="No recharge needed";
    if(R.actNoLoss){
      if(R.powers.selah<1){R.powers.selah=1;supply="Selah restored";}
      else if(R.powers.illum<2){R.powers.illum++;supply="Illuminate restored";}
      Director.callout(supply==="No recharge needed"?"Act cleared — unshaken":supply);
    }
    report.innerHTML=
      '<div><b>'+kept+' / '+tried+'</b><span>Verses kept</span></div>'+
      '<div><b>'+accuracy+'%</b><span>Act accuracy</span></div>'+
      '<div><b>'+(R.actNoLoss?"Unshaken":"Survived")+'</b><span>'+esc(supply)+'</span></div>';
    report.classList.add("on");
  }else{
    report.innerHTML="";report.classList.remove("on");
  }
  R.actIdx = i; R.qInAct = 0; R.actNoLoss = true;
  R.actStartAttempts=R.attempts;R.actStartCorrect=R.correct;
  const A = ACTS[i];
  if(i>=4){
    R.maxLives = 1;
    R.lives = 1;
    R.powers.wind = 0;
    R.oneLifeCalled = true;
  }
  Director.setAct(i);
  renderLives();
  renderPowers();
  Backdrop.palette(A.pal); Backdrop.hit("levelup");
  Snd.ambience(A.pal); Snd.act();
  $("act-num").textContent = A.n;
  $("act-name").textContent = A.name;
  $("act-sub").textContent = A.sub;
  /* The act card prints the same clock play uses — it used to omit the
     pace multiplier and the flat seconds, promising ~14s and giving ~20. */
  const secs = (pacedClockMs(A.t, R.diff.time, Pilgrimage.PICK_PAD_MS || 1500) / 1000).toFixed(1);
  $("act-meta").textContent = A.q+" verses · "+secs+" seconds each"
    +(i>=4 ? " · one life" : "");
  $("hud-round").textContent = A.name;
  updateActTrack();
  if(i===4 && !hasSeal("watch")) grantSeal("watch");
  const voiceLines=["The signal is live.","The pursuit begins.","Blackout protocol.","No turning back.","This is the final test.","The remnant remains."];
  Director.speak(voiceLines[i]||"The remnant remains.",true);
  Director.beat("act");
  const actEl=$("v-act");
  if(actEl) actEl.classList.remove("departing");
  go("act");
  afterRun(2750, ()=>{
    if(currentView!=="act") return;
    if(actEl) actEl.classList.add("departing");
  });
  afterRun(3300, ()=>{
    if(currentView!=="act") return;
    if(actEl) actEl.classList.remove("departing");
    document.body.classList.add("play-enter");
    go("play");
    if(R.mode==="trial") applySitePlate("hall");
    nextQuestion();
    afterRun(820, ()=>document.body.classList.remove("play-enter"));
  });
}

/* High momentum used to grant extra time only at an 8-streak, so an
   8-verse site never saw it. From Building (3) onward the pick clock
   gets 20%. Every pick clock also gets a flat extra beat. Typed, Blitz,
   and set-pieces keep the clocks they already own. */
function pickPadMs(){
  return (typeof Pilgrimage !== "undefined" && Pilgrimage.PICK_PAD_MS) || 1500;
}
/* One clock to print on every surface. Mirrors Polish.pacedClockMs; the
   local fallback keeps loads without polish.js (the test sandbox) honest. */
function pacedClockMs(base, diffTime, pad){
  if(typeof Polish !== "undefined" && Polish.pacedClockMs) return Polish.pacedClockMs(base, diffTime, pad);
  return Math.round((base * diffTime + (pad == null ? 1500 : pad)) * PACE + FLAT_ADD_MS);
}
function pickClockMs(ms){
  if(!ms || R.typed || R.mode==="blitz" || R.mode==="recall" || R.mode==="pilgrim-recall") return ms;
  return ms + pickPadMs();
}
function momentumClockMs(ms){
  if(!ms || R.typed || R.mode==="blitz") return ms;
  if((R.streak||0) >= MOMENTUM_STEPS[0]) return Math.round(ms * 1.2);
  return ms;
}
function playClockMs(ms){
  return Math.round(momentumClockMs(pickClockMs(ms)) * PACE + FLAT_ADD_MS);
}
function questionDuration(){
  if(R.mode==="trial"){ return playClockMs(ACTS[R.actIdx].t * R.diff.time); }
  if(R.mode==="daily"){ return playClockMs(10000 * R.diff.time); }
  if(R.mode==="blitz"){
    const left = Math.max(0, (R.blitzEnd || 0) - performance.now());
    return Math.max(900, left);
  }
  if(R.mode==="practice"){ return playClockMs(12000 * R.diff.time); }
  // Typing a phrase takes far longer than picking one, so Recall gets a
  // clock sized for the work rather than the same one the pickers use.
  if(R.mode==="recall"){ return Math.round(32000 * R.diff.time * PACE + FLAT_ADD_MS); }
  // The road's clock is a function of how far east you are: 14s at Ur,
  // 6.5s at Patmos. pilgrimage.js owns the ramp. Typed slots on a mixed
  // site always get a typing-sized clock (at least 20s base).
  if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    if(R.speed) return playClockMs((Pilgrimage.SPEED_MS || 6000) * R.diff.time);
    const base = siteClockMs(R.siteId, R.mode);
    if(R.mode==="pilgrimage" && R.typed) return Math.round(Math.max(32000, base) * R.diff.time * PACE + FLAT_ADD_MS);
    return playClockMs(base * R.diff.time);
  }
  // The relay inherits each site's own clock as it reaches it, so the
  // road tightens inside a single run exactly as it does across many.
  if(R.mode==="relay"){
    const cur = R.relay && R.relay.current;
    return playClockMs(Pilgrimage.clockFor(cur ? cur.index : 0) * R.diff.time);
  }
  return playClockMs(Math.max(4200, R.endlessBase - R.qTotal*180) * R.diff.time);
}
function currentTier(){
  if(R.mode==="trial") return ACTS[R.actIdx].tier;
  if(R.mode==="daily") return R.daily.list[R.dailyIdx] ? R.daily.list[R.dailyIdx].v.t : 5;
  if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    // A closing sequence draws fresh verses, so it wants the site's own
    // target tier rather than the tier of the verse just answered.
    if(R.setpiece) return Pilgrimage.tierFor(R.siteIndex);
    return R.q ? R.q.t : Pilgrimage.tierFor(R.siteIndex);
  }
  if(R.mode==="relay"){
    const cur = R.relay && R.relay.current;
    return R.q ? R.q.t : Pilgrimage.tierFor(cur ? cur.index : 0);
  }
  if(R.mode==="practice" || R.mode==="recall") return R.q ? R.q.t : 2;
  const n = R.qTotal;
  if(n<5) return 1; if(n<11) return 2; if(n<19) return 3; if(n<29) return 4;
  return (n%5===0) ? 4 : 5;
}

function nextQuestion(){
  clearSequence();
  if(R.setpiece && R.setpiece.finishing) SetPieces.cleanup();
  if(R.mode==="trial"){
    const acts = trialActs();
    const A = acts[R.actIdx];
    if(A && A.q !== Infinity && R.qInAct >= A.q){
      if(R.actNoLoss && !hasSeal("unshaken")) grantSeal("unshaken");
      if(R.actIdx < acts.length-1){ beginAct(R.actIdx+1); return; }
      endRun("complete"); return;
    }
    if(SetPieces.maybeLaunch()) return;
  }
  if(R.mode==="daily" && R.dailyIdx >= R.daily.list.length){ endRun("complete"); return; }
  if(R.mode==="blitz" && R.blitzEnd && performance.now() >= R.blitzEnd){ endRun("death"); return; }
  if((R.mode==="practice" || R.mode==="recall") && R.qTotal >= R.practiceLen){ endRun("complete"); return; }
  /* The site's own verses are exhausted. A handful of places close with
     a set piece rather than simply ending — the sequence is the climax
     of the site, which is why it fires here and not partway through. */
  if((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece &&
     R.siteIdx >= (R.siteVerses ? R.siteVerses.length : 0)){
    if(SetPieces.maybeLaunchSite()) return;
    endRun("complete"); return;
  }
  if(R.mode==="relay" && R.relay.idx >= R.relay.queue.length){ endRun("complete"); return; }
  if(R.setpiece && R.setpiece.passage){ startPassage(); updateChips(); return; }
  if(R.setpiece && R.setpiece.reconstruct){ startReconstruct(); updateChips(); return; }

  let v;
  if(R.mode==="daily"){ v = R.daily.list[R.dailyIdx].v; R.dailyIdx++; }
  // During a site's closing sequence the fixed list is finished, so the
  // verses come from SetPieces.draw below instead.
  else if((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece){
    v = R.siteVerses[R.siteIdx]; R.siteIdx++;
    /* Pilgrim’s Recall is fully typed. Mixed pilgrimage ends with two
       typed questions so production is trained without dominating the
       stop. Late arcs also drop a typed recall mid-site (the road gets
       busier east), and every site carries one swift 3-second round so
       the body is not eight copies of the same tap. */
    const vi = R.siteIdx - 1;
    if(R.mode==="pilgrim-recall"){ R.typed = true; R.speed = false; }
    else if(R.mode==="pilgrimage"){
      const n = R.siteVerses ? R.siteVerses.length : 0;
      const typedN = Math.min(2, n);
      const arcKey = R.siteId ? (Pilgrimage.site(R.siteId)||{}).arc : null;
      const mixed = arcKey ? Pilgrimage.mixedTypedSlot(vi, n, arcKey) : false;
      R.typed = (n > 0 && vi >= (n - typedN)) || mixed;
      R.speed = Pilgrimage.speedSlot(vi, n);
    }
  }
  else if(R.mode==="relay"){
    const rl = R.relay, entry = rl.queue[rl.idx];
    // Leaving a site banks it before the next one starts.
    if(rl.current && rl.current.siteId !== entry.siteId) bankRelaySite(rl.current.siteId);
    rl.current = entry; rl.idx++;
    const site = Pilgrimage.site(entry.siteId);
    if(site){
      const arc = Pilgrimage.arc(site.arc);
      if(arc) Backdrop.palette(arc.pal);
      applySiteSky(entry.siteId);
    }
    v = entry.v;
  }
  else if(R.mode==="practice" || R.mode==="recall"){ v = drawReviewVerse(); }
  else v = R.mode==="endless"&&!R.setpiece ? drawEndlessVerse(currentTier()) : SetPieces.draw(currentTier());

  R.q = v; R.usedRefs.add(refKey(v)); commitSiteVerse(v);
  if(!R.setpiece) R.qInAct++; R.qTotal++;
  R.tiersSeen.add(v.t);
  if(R.mode==="trial" && R.actIdx===4) R.sdCount++;
  const dur = SetPieces.duration(questionDuration());
  updateChips();
  if(maybePlaySiteQuote(v, dur)) return;
  witnessLook(false);
  renderQuestion(v, dur);
}

function maybePlaySiteQuote(v, dur){
  if((R.mode!=="pilgrimage" && R.mode!=="pilgrim-recall") || R.setpiece) return false;
  if(R.siteIdx!==1 || R.quoteShown) return false;
  const site = Pilgrimage.site(R.siteId);
  if(!site || !site.quote) return false;
  R.quoteShown = true;
  if(document.body.classList.contains("reduced")) return false;
  showSiteQuote(site, function(){ witnessLook(false); renderQuestion(v, dur); });
  return true;
}
function hideSiteQuote(){
  const el = $("site-quote");
  if(!el) return;
  el._done = true;
  if(el._timer){ clearInterval(el._timer); el._timer = null; }
  el.classList.remove("on");
  el.onclick = null;
}
function showSiteQuote(site, done){
  const el = $("site-quote");
  const line = $("site-quote-line");
  if(!el || !line){ if(done) done(); return; }
  const text = String(site.quote || "");
  const kick = $("site-quote-kicker");
  const ref = $("site-quote-ref");
  if(kick) kick.textContent = site.name || "";
  if(ref) ref.textContent = site.quoteRef || "";
  line.textContent = "";
  el.classList.add("on");
  el._done = false;
  let i = 0;
  const step = Math.max(16, Math.min(40, 1600 / Math.max(1, text.length)));
  el._timer = setInterval(function(){
    i++;
    line.textContent = text.slice(0, i);
    if(i >= text.length){ clearInterval(el._timer); el._timer = null; }
  }, step);
  function finish(){
    if(el._done) return;
    el._done = true;
    if(el._timer){ clearInterval(el._timer); el._timer = null; }
    el.classList.remove("on");
    el.onclick = null;
    if(done) done();
  }
  el.onclick = finish;
  afterRun(Math.max(2400, text.length * step + 800), finish);
}
function syncWitness(){
  const el = $("witness"), img = $("witness-face");
  if(!el || !img) return;
  const ch = typeof activeCharacter === "function" ? activeCharacter() : null;
  if(!R || R.mode==="blitz" || !ch || !(ch.token || ch.portrait)){
    el.hidden = true;
    return;
  }
  img.src = ch.token || ch.portrait;
  img.alt = ch.short || ch.name || "";
  img.onerror = function(){ if(ch.portrait && img.src.indexOf(ch.portrait) < 0) img.src = ch.portrait; };
  el.hidden = false;
  el.classList.remove("look");
}
function witnessLook(down){
  const el = $("witness");
  if(el) el.classList.toggle("look", !!down);
}
/* Full-screen judge burst — same sprite-sheet steps() as the map walker.
   Plays once, never takes hits, skipped under reduced motion. */
function showJudgeBurst(kind){
  const el = $("judge-burst");
  if(!el) return;
  if(SAVE.set.reduced) return;
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.classList.remove("on","up","down");
  void el.offsetWidth;
  el.classList.add("on", kind==="down" ? "down" : "up");
  clearTimeout(el._t);
  el._t = setTimeout(function(){ el.classList.remove("on","up","down"); }, 920);
}
function updateChips(){
  const tier = R.q ? R.q.t : currentTier();
  const diffEl = $("hud-diff");
  diffEl.textContent = TIER_NAMES[tier] || "Foundation";
  diffEl.classList.toggle("danger", tier>=5);

  if(R.mode==="trial"){
    const A=ACTS[R.actIdx];
    $("hud-round").textContent = R.setpiece
      ? SetPieces.label()+(R.setpiece.sameBook&&R.setpiece.book?" · "+R.setpiece.book:"") : A.name;
    $("hud-qlab").textContent = "Verse";
    $("hud-q").textContent = R.setpiece
      ? (R.setpiece.count-R.setpiece.remaining)+" / "+R.setpiece.count
      : A.q===Infinity ? String(R.qInAct) : R.qInAct+" / "+A.q;
  } else if(R.mode==="daily"){
    $("hud-round").textContent = "Daily Trial";
    $("hud-qlab").textContent = "Verse";
    $("hud-q").textContent = R.dailyIdx+" / "+R.daily.list.length;
  } else if(R.mode==="blitz"){
    const left = Math.max(0, Math.ceil(((R.blitzEnd||0) - performance.now())/1000));
    $("hud-round").textContent = "Scripture Blitz";
    $("hud-qlab").textContent = "Kept";
    $("hud-q").textContent = String(R.correct)+" · "+left+"s";
    paintGhostMarker();
  } else if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    const site = Pilgrimage.site(R.siteId);
    const n = R.siteVerses ? R.siteVerses.length : 0;
    $("hud-round").textContent = R.setpiece ? SetPieces.label()
      : site ? site.name : "The Pilgrimage";
    $("hud-qlab").textContent = R.setpiece ? "Sequence"
      : R.mode==="pilgrim-recall" ? "Typed" : "Verse";
    $("hud-q").textContent = R.setpiece
      ? (R.setpiece.count-R.setpiece.remaining)+" / "+R.setpiece.count
      : R.siteIdx+" / "+n;
  } else if(R.mode==="relay"){
    const cur = R.relay.current, site = cur ? Pilgrimage.site(cur.siteId) : null;
    $("hud-round").textContent = site ? site.name : "The Long Road";
    $("hud-qlab").textContent = "Site "+(R.relay.banked.length+1)+" of "+R.relay.sites.length;
    $("hud-q").textContent = R.relay.idx+" / "+R.relay.queue.length;
  } else if(R.mode==="practice" || R.mode==="recall"){
    $("hud-round").textContent = (R.mode==="recall" ? "Recall · " : "Drill · ")+(R.adaptivePick||"Spaced review");
    $("hud-qlab").textContent = R.mode==="recall" ? "Typed" : "Drill";
    $("hud-q").textContent = R.qTotal+" / "+R.practiceLen;
  } else {
    $("hud-round").textContent = "Endless · "+(R.adaptivePick||"Adaptive Recall");
    $("hud-qlab").textContent = "Adaptive Verse";
    $("hud-q").textContent = String(R.qTotal);
  }
  $("hud-streak").textContent = R.streak + (R.streak===1 ? " Verse" : " Verses");
  $("hud-accuracy").textContent = R.attempts ? Math.round(R.correct/R.attempts*100)+"%" : "—";
  updateActTrack();
  updateCandle();
}

function updateActTrack(){
  const el=$("act-track");if(!el||!R.mode)return;
  if(R.mode==="trial"){
    el.innerHTML=ACTS.map((a,i)=>{
      const done=i<R.actIdx,current=i===R.actIdx;
      const pct=done?100:current&&a.q!==Infinity?Math.min(100,R.qInAct/a.q*100):0;
      return '<div class="act-step'+(done?" done":"")+(current?" current":"")+'"><i style="width:'+pct+'%"></i><span>'+a.n+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Act "+(R.actIdx+1)+" of 5");
  }else if(R.mode==="daily"){
    el.innerHTML=[4,8,12,16,20].map((mark,i)=>{
      const prev=i*4,pct=Math.max(0,Math.min(100,(R.dailyIdx-prev)/4*100));
      return '<div class="act-step'+(pct>=100?" done":pct>0?" current":"")+'"><i style="width:'+pct+'%"></i><span>'+(i+1)+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Daily progress "+R.dailyIdx+" of 20");
  }else if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    // One step per verse: a six-verse site reads cleanly as six marks,
    // and the player can see exactly how much of the site is left.
    const n=R.siteVerses?R.siteVerses.length:0;
    el.innerHTML=Array.from({length:n},(_,i)=>{
      const done=i<R.siteIdx-1, current=i===R.siteIdx-1;
      return '<div class="act-step'+(done?" done":"")+(current?" current":"")+'"><i style="width:'+(done?100:current?60:0)+'%"></i><span>'+(i+1)+'</span></div>';
    }).join("");
    const site=Pilgrimage.site(R.siteId);
    el.setAttribute("aria-label",(site?site.name+" — ":"")+"verse "+R.siteIdx+" of "+n);
  }else if(R.mode==="relay"){
    // One step per site in the arc — the track IS the road.
    const rl=R.relay, cur=rl.current?rl.current.siteId:null;
    el.innerHTML=rl.sites.map((id,i)=>{
      const done=rl.banked.indexOf(id)>=0, current=id===cur&&!done;
      const s=Pilgrimage.site(id);
      return '<div class="act-step'+(done?" done":"")+(current?" current":"")+'"><i style="width:'+(done?100:current?55:0)+'%"></i><span>'+
        esc(s?s.name.split(/[ (]/)[0].slice(0,3):String(i+1))+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Site "+(rl.banked.length+1)+" of "+rl.sites.length);
  }else if(R.mode==="practice" || R.mode==="recall"){
    const step=Math.max(1,Math.round(R.practiceLen/5));
    const marks=[1,2,3,4,5].map(n=>Math.min(R.practiceLen, n*step));
    el.innerHTML=marks.map((mark,i)=>{
      const prev=i?marks[i-1]:0,pct=Math.max(0,Math.min(100,(R.qTotal-prev)/Math.max(1,mark-prev)*100));
      return '<div class="act-step'+(pct>=100?" done":pct>0?" current":"")+'"><i style="width:'+pct+'%"></i><span>'+mark+'</span></div>';
    }).join("");
    el.setAttribute("aria-label",(R.mode==="recall"?"Recall ":"Drill ")+R.qTotal+" of "+R.practiceLen);
  }else{
    const marks=[5,10,20,30,40];
    el.innerHTML=marks.map((mark,i)=>{
      const prev=i?marks[i-1]:0,pct=Math.max(0,Math.min(100,(R.qTotal-prev)/(mark-prev)*100));
      return '<div class="act-step'+(pct>=100?" done":pct>0?" current":"")+'"><i style="width:'+pct+'%"></i><span>'+mark+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Endless distance "+R.qTotal);
  }
  const n = el.children.length || 1;
  el.style.gridTemplateColumns = "repeat("+n+",minmax(20px,1fr))";
}

/* ------------------------- BROADCAST HUD HELPERS ------------------------- */
const TIER_NAMES = {1:"Foundation", 2:"Testimony", 3:"Refining", 4:"Wilderness", 5:"Tribulation"};
const LETTERS = ["A","B","C","D"];

/* Words worth setting in gold. Divine names win first, then weighty nouns.
   Capped at three per verse so the emphasis still means something. */
const DIVINE = new Set(["lord","lords","god","gods","jesus","christ","spirit","ghost","almighty",
  "father","son","saviour","redeemer","messiah","emmanuel","jehovah","most","high"]);
const KEYWORDS = new Set(["shepherd","faith","love","charity","hope","grace","mercy","mercies","truth",
  "light","life","death","glory","salvation","righteousness","holy","heart","soul","peace","joy",
  "strength","power","word","blood","cross","sin","sins","heaven","heavens","earth","kingdom",
  "covenant","promise","wisdom","knowledge","courage","fear","refuge","rock","fortress","tower",
  "lamp","path","gift","prayer","name","throne","temple","sword","armour","crown","eagles","fire",
  "waters","shadow","valley","wilderness","harvest","vine","branches","gospel","witness","judgment",
  "repentance","forgive","forgiveness","everlasting","eternal","begotten","resurrection","redemption"]);
function highlightVerse(text){
  let budget = 3;
  return text.replace(/[A-Za-z']+/g, w => {
    if(!budget) return esc(w);
    const k = w.toLowerCase().replace(/'/g,"");
    if(DIVINE.has(k) || (w === w.toUpperCase() && w.length > 2) || KEYWORDS.has(k)){
      budget--; return '<span class="kw">'+esc(w)+'</span>';
    }
    return esc(w);
  });
}
/* Scale verse type by full-text length so long lines stay on screen. */
function fitVerseSize(len){
  const el=$("verse"); if(!el) return;
  el.classList.remove("vlen-md","vlen-lg","vlen-xl");
  if(len>=230) el.classList.add("vlen-xl");
  else if(len>=160) el.classList.add("vlen-lg");
  else if(len>=100) el.classList.add("vlen-md");
}
function answerButtons(){
  return [].slice.call($("opts").children).filter(b => b.classList && b.classList.contains("ans"));
}
const HEART_SVG = '<svg viewBox="0 0 24 24"><path d="M12 21.6l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.7L12 21.6z" fill="url(#hg)"/></svg>';
const HEART_BROKEN = '<svg viewBox="0 0 24 24"><path d="M12 21.6l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.7L12 21.6z" fill="url(#hg)"/><path d="M12.6 4.6l-2.5 4.9 3 1.9-2.4 4.6" fill="none" stroke="#07070a" stroke-width="1.7" stroke-linejoin="round"/></svg>';
const LAMP_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 14.2c0 2.6 1.8 4.6 4 4.6s4-2 4-4.6c0-2.2-1.5-3.3-2.8-4.2V8.2h1.8V6.6H9v1.6h1.8v1.8C9.5 10.9 8 12 8 14.2z" fill="url(#hg)"/><path class="lamp-flame" d="M12 3.2c.7 1.1 1.1 1.8.7 2.7-.5.2-1.2-.4-1.6-1.1.5-.2 1-.8.9-1.6z" fill="#ffe3a6"/></svg>';

/* Prefer distractors that *look* like the correct phrase so all four
   options feel similar — length, word count, shape — and English alone
   cannot discard the wrong ones. */
function buildChoices(q, rnd){
  const r = rnd || Math.random;
  const correct = String(q.a||"");
  const ban = {}; if(correct) ban[correct] = 1;
  const picked = [];
  function push(s){
    s = String(s||"").trim();
    if(!s || ban[s]) return false;
    ban[s] = 1; picked.push(s); return true;
  }
  /* Ranking lives in Polish.choiceShapeScore so the tests pin the same
     math the game uses — the two copies had drifted before this dedupe.
     Local fallback keeps the no-polish sandbox honest. */
  const shapeScore = (typeof Polish !== "undefined" && Polish.choiceShapeScore)
    ? (cand => Polish.choiceShapeScore(correct, cand))
    : (cand => (cand && cand !== correct) ? 1 : -1);
  const cands = [];
  const wantWords = correct.trim().split(/\s+/).filter(Boolean).length;
  function similarEnough(s){
    const t = String(s||"");
    const wc = t.trim().split(/\s+/).filter(Boolean).length;
    const lenDiff = Math.abs(t.length - correct.length);
    return Math.abs(wc - wantWords) <= 1 && lenDiff <= 12;
  }
  (q.d||[]).forEach(d=>{
    if(!d || d===correct) return;
    cands.push({ s:d, score: shapeScore(d) + (similarEnough(d) ? 8 : 5) });
  });
  if(typeof Polish!=="undefined" && Polish.lookalikePhrases && typeof VERSES!=="undefined"){
    Polish.lookalikePhrases(correct, VERSES.map(v=>v && v.a), 8).forEach(s=>{
      cands.push({ s:s, score: shapeScore(s) + 6 });
    });
  }
  if(typeof VERSES!=="undefined"){
    VERSES.forEach(v=>{
      if(!v || v.id===q.id || !v.a || v.a===correct || ban[v.a]) return;
      let score = shapeScore(v.a);
      if(v.b===q.b) score += 5;
      if(Math.abs((v.t||3)-(q.t||3))<=1) score += 2;
      if(similarEnough(v.a)) score += 6;
      if(score>=6) cands.push({ s:v.a, score });
    });
  }
  cands.sort((a,b)=> (b.score-a.score) || (r()-0.5));
  for(let i=0;i<cands.length && picked.length<3;i++){
    if(!similarEnough(cands[i].s) && picked.length) continue;
    push(cands[i].s);
  }
  for(let i=0;i<cands.length && picked.length<3;i++){
    const lenDiff = Math.abs(String(cands[i].s).length - correct.length);
    if(lenDiff>16 && picked.length) continue;
    push(cands[i].s);
  }
  (q.d||[]).forEach(d=>{ if(picked.length<3) push(d); });
  /* Last resort: real answers from the bank, nearest in length. The old
     numbered fakes ("the word of the LORD 2") looked broken on screen. */
  if(picked.length<3 && typeof VERSES!=="undefined"){
    VERSES.filter(x=>x && x.a && x.a!==correct && !ban[x.a])
      .sort((a,b)=>Math.abs(a.a.length-correct.length)-Math.abs(b.a.length-correct.length))
      .slice(0,6).forEach(x=>{ if(picked.length<3) push(x.a); });
  }
  const fillBase = correct.length>18 ? "the word of the LORD forever" :
    correct.length>10 ? "the word of the LORD" : "the LORD";
  let n=0;
  while(picked.length<3 && n<3){
    n++;
    push(fillBase);
  }
  return shuffle([correct].concat(picked.slice(0,3)), r);
}

function renderQuestion(q, dur){
  const scene = ++R.sceneToken;
  Director.pressure(0);
  $("ref").textContent = q.r + " — KJV";
  // blank is a fixed width so the length of the answer is never a clue
  $("verse").innerHTML = highlightVerse(q.p) +
    ' <span class="blank" id="blank">&#8195;&#8195;&#8195;</span>' + sep(q.s) + highlightVerse(q.s);
  fitVerseSize((q.p||"").length+(q.a||"").length+(q.s||"").length);
  /* A light entrance on each new verse so question-to-question feels
     like a handoff, not a hard swap. */
  const verseEl = $("verse");
  if(verseEl && !document.body.classList.contains("reduced")){
    verseEl.classList.remove("q-in"); void verseEl.offsetWidth; verseEl.classList.add("q-in");
  }
  R.locked = false; R.selected = null;
  document.body.classList.toggle("mode-typed", !!R.typed);
  document.body.classList.toggle("speed-round", !!R.speed);
  if(R.typed) return renderTypedQuestion(q, dur, scene);
  const confirmBtn = $("confirm-answer");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.textContent = SetPieces.autoLock() ? "Rapid Lock"
    : (R.speed ? "Swift Lock"
    : (SAVE.set.singleTap === false ? "Lock Answer" : "One-tap answer"));
  const how=$("warn-how");
  if(how) how.innerHTML = (SAVE.set.singleTap === false)
    ? "Select a phrase, then lock it<br>Enter or Space confirms"
    : "Tap a phrase to answer";
  const opts = $("opts"); opts.className = "answers queued"; opts.innerHTML = "";
  const rnd = R.mode==="daily" ? R.daily.rnd : Math.random;
  const choices = buildChoices(q, rnd);
  choices.forEach((c,i)=>{
    if(i){ const ch=document.createElement("div"); ch.className="chev"; ch.innerHTML="&#8250;"; opts.appendChild(ch); }
    const b=document.createElement("button");
    b.className="ans"; b.dataset.val=c;
    b.setAttribute("aria-pressed","false");
    b.innerHTML='<span class="ans-float"><span class="ltr">'+LETTERS[i]+'.</span>'+esc(c)+'</span>';
    b.style.setProperty("--drift-delay", (i * 0.85) + "s");
    b.addEventListener("click", ()=>pickAnswer(c,b));
    opts.appendChild(b);
  });
  if(!SetPieces.autoLock() && !document.body.classList.contains("reduced")) opts.classList.add("drift");
  renderPowers();
  armTimer(dur);
  const entranceDelay=R.setpiece?180:Math.min(1450,Math.max(520,dur*.12));
  afterRun(entranceDelay, ()=>{
    if(R.q!==q || R.sceneToken!==scene || currentView!=="play")return;
    opts.classList.remove("queued");opts.classList.add("entering");
    startTimer(dur);
    afterRun(760, ()=>{ if(R.q===q && R.sceneToken===scene) opts.classList.remove("entering"); });
    Snd.lock();
  });
}

/* Single-tap answers by default — the tap IS the answer. Rapid Recall has
   always auto-locked; the rest of the game now does too, unless the player
   opts back into select-then-lock under Settings. */
function pickAnswer(val, btn){
  if(!R.running || R.paused || R.locked) return;
  answerButtons().forEach(b=>{b.classList.remove("sel");b.setAttribute("aria-pressed","false");});
  btn.classList.add("sel");
  btn.setAttribute("aria-pressed","true");
  R.selected = {val, btn};
  const confirm=$("confirm-answer");
  if(SetPieces.autoLock() || SAVE.set.singleTap !== false){
    answer(val, btn);
    return;
  }
  confirm.disabled = false;
  confirm.textContent = "Lock "+LETTERS[Math.max(0,answerButtons().indexOf(btn))];
  Snd.ui();
}
function confirmAnswer(){
  if(R.typed) return confirmTyped();
  if(!R.selected || !R.running || R.paused || R.locked) return;
  answer(R.selected.val, R.selected.btn);
}
$("confirm-answer").addEventListener("click", confirmAnswer);

/* ------------------------- TIMER ------------------------- */
function armTimer(dur){
  R.tTotal = dur; R.tEnd = 0; R.qStart = 0;
  R.running = false; R.paused = false; R.lastTickSec = -1; R.lastHeart = 0; R.lastHeartSec = -1;
  if(typeof Snd!=="undefined" && Snd.stopPressure) Snd.stopPressure();
  const sec = Math.ceil(dur/1000);
  $("clock").textContent = "00:" + String(sec).padStart(2,"0");
  $("warn-1").textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
  $("ring").classList.remove("crit");
  $("ring-arc").style.strokeDashoffset = "0";
}
function startTimer(dur){
  const extra = R.pendingSelah||0;
  R.pendingSelah = 0;
  R.tTotal = dur + extra; R.tEnd = performance.now()+dur+extra; R.qStart = performance.now();
  R.running = true; R.paused = false; R.lastTickSec = -1; R.lastHeart = 0; R.lastHeartSec = -1;
  if(document.hidden){pauseStamp=performance.now();setPaused(true);}
  else ensureLoop();
}
const RING_C = 2 * Math.PI * 52;   // circumference of the countdown arc
function tickTimer(now){
  if(!R.running || R.paused) return;
  if(R.mode==="blitz" && R.blitzEnd){
    const bLeft = R.blitzEnd - now;
    document.body.classList.remove("blitz-edge","blitz-edge-2","blitz-edge-3");
    const pr = typeof Polish!=="undefined" ? Polish.blitzPressure(bLeft) : 0;
    if(pr) document.body.classList.add(pr===3?"blitz-edge-3":pr===2?"blitz-edge-2":"blitz-edge");
    if(bLeft<=0){ timeUp(); return; }
    /* Blitz uses one shared survival clock — refresh arm each tick. */
    R.tEnd = R.blitzEnd; R.tTotal = Math.max(R.tTotal, typeof Polish!=="undefined"?Polish.BLITZ_START_MS:60000);
  }
  let left = R.tEnd - now; if(left<0) left=0;
  const frac = R.tTotal ? Math.max(0, Math.min(1, left/R.tTotal)) : 0;
  const sec = Math.ceil(left/1000);

  const arc = $("ring-arc");
  if(arc.style) arc.style.strokeDashoffset = String(RING_C * (1-frac));
  if(sec!==R.lastTickSec){
    R.lastTickSec = sec;
    $("clock").textContent = "00:" + String(sec).padStart(2,"0");
    $("ring").classList.toggle("crit", sec<=5);
    const w1 = $("warn-1");
    w1.textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
    w1.classList.toggle("hot", sec<=5);
    Director.pressure(sec);
    /* Strict countdown SFX (whole seconds only, never mid-bar 55% ticks):
       10–6 soft tick · 5–4 critical tick · 3–1 heartbeat only (no double stack). */
    if(left>0 && R.mode!=="blitz"){
      if(sec===4 || sec===5){
        Snd.tick(true);
      } else if(sec>=6 && sec<=10){
        Snd.tick(false);
      }
      /* sec 3–1: heartbeat only (below), no tick stack */
    }
  }
  /* Heartbeat owns the final three seconds — one pulse per second, stops on lock. */
  if(R.running && !R.locked && !R.paused && R.mode!=="blitz" &&
     sec>=1 && sec<=3 && left>0 && sec!==R.lastHeartSec){
    R.lastHeartSec = sec;
    R.lastHeart = now;
    Snd.heart();
    doFlash("heart");
  }
  if(left<=0) timeUp();
}
function stopTimer(){
  R.running=false;
  if(typeof Snd!=="undefined" && Snd.stopPressure) Snd.stopPressure();
  if(typeof Director!=="undefined" && Director.pressure) Director.pressure(0);
}

/* ------------------------- POWERS ------------------------- */
function renderPowers(){
  const p=R.powers; if(!p) return;
  if(SetPieces.noPowers()){
    $("powers").innerHTML='<button class="pwr spent">Lifelines Offline <em>Special sequence</em></button>';
    return;
  }
  const oil = SAVE.oil||0;
  $("powers").innerHTML =
    '<button class="pwr'+(p.selah?"":" spent")+'" data-pw="selah">Selah <em>+5s ×'+p.selah+'</em></button>'+
    '<button class="pwr'+(p.illum?"":" spent")+'" data-pw="illum">Illuminate <em>'+(R.typed?"hint ×":"−2 ×")+p.illum+'</em></button>'+
    '<button class="pwr oil-buy'+(oil>=((typeof Meta!=="undefined"&&Meta.OIL_COST.selah)||8)?"":" spent")+'" data-pw="oil-selah">Anoint Selah <em>'+oil+' oil</em></button>'+
    '<button class="pwr passive'+(p.wind?"":" spent")+'" tabindex="-1">Second Wind <em>Automatic ×'+p.wind+'</em></button>';
  $("powers").querySelectorAll("[data-pw]").forEach(b=>{
    b.addEventListener("click", ()=>usePower(b.dataset.pw));
  });
}
function usePower(kind){
  if(R.paused || R.locked) return;
  const armed = R.running || (!!R.tTotal && !R.ended);
  if(!armed) return;
  if(SetPieces.noPowers()){ toast("Lifelines are offline for this sequence"); return; }
  if(kind==="selah" && R.powers.selah){
    R.powers.selah--; R.usedPower=true; R.powersSpent++; R.tEnd += 5000; R.tTotal += 5000;
    R.pendingSelah = (R.pendingSelah||0) + 5000;
    Snd.power();
    if(Snd.selah) Snd.selah(5000);
    doFlash("gold"); toast("Selah — five seconds granted");
  } else if(kind==="illum" && R.powers.illum){
    if(!R.q){ toast("Illuminate needs a verse on the stage"); return; }
    if(R.typed){
      if(R.hintLevel >= 3){ toast("Nothing further to illuminate"); return; }
      R.powers.illum--; R.usedPower=true; R.powersSpent++;
      typedHint();
      Snd.power(); doFlash("violet");
      toast(R.hintLevel===1 ? "Illuminate — the shape of the words"
          : R.hintLevel===2 ? "Illuminate — first letters" : "Illuminate — the first word");
      renderPowers();
      return;
    }
    const wrong = answerButtons().filter(b=>b.dataset.val!==R.q.a && !b.classList.contains("burn"));
    if(wrong.length<2) return;
    R.powers.illum--; R.usedPower=true; R.powersSpent++;
    const burned = shuffle(wrong).slice(0,2);
    burned.forEach(b=>b.classList.add("burn"));
    if(R.selected && burned.indexOf(R.selected.btn)>=0){
      R.selected = null;
      $("confirm-answer").disabled = true;
      $("confirm-answer").textContent = "Lock Answer";
    }
    Snd.power(); doFlash("violet"); toast("Illuminate — two falsehoods burned");
  } else if((kind==="oil-selah" || kind==="oil-illum") && typeof Meta!=="undefined"){
    const which = kind==="oil-selah" ? "selah" : "illum";
    const spent = Meta.spendOil(SAVE.oil||0, which);
    if(!spent.ok){ toast("Not enough oil"); return; }
    SAVE.oil = spent.oil;
    SAVE.life.oilSpent = (SAVE.life.oilSpent||0) + spent.cost;
    if(which==="selah") R.powers.selah++;
    else R.powers.illum++;
    persist();
    Snd.power(); doFlash("gold");
    toast(which==="selah" ? "Anointed — Selah bought with oil" : "Anointed — Illuminate bought with oil");
    if((SAVE.life.oilSpent||0)>=50 && !hasSeal("oil50")) grantSeal("oil50");
  } else return;
  renderPowers();
}

/* ------------------------- ANSWERING ------------------------- */
function multiplier(){
  const s=R.streak;
  let m = 1;
  MOMENTUM_STEPS.forEach((n,i)=>{ if(s>=n) m=i+2; });
  if(R.mode==="trial" && R.actIdx===trialActs().length-1) m += 2;
  return m;
}
/* Overdrive is the top of the meter. Reaching it stops the run and asks
   the player to ride or bank; choosing to ride doubles every answer's
   score while it holds and hands back a spent lifeline. */
function inOverdrive(){ return (R.streak||0) >= MOMENTUM_STEPS[MOMENTUM_STEPS.length-1]; }
function overdriveReward(){
  if(R.streak !== MOMENTUM_STEPS[MOMENTUM_STEPS.length-1] || R.overdriveGift) return;
  R.overdriveGift = true;
  const illumCap = (R.mode==="pilgrimage"||R.mode==="pilgrim-recall"||R.mode==="relay") ? 1 : 2;
  if(R.powers.selah < 1){ R.powers.selah = 1; Director.callout("Overdrive — Selah restored"); }
  else if(R.powers.illum < illumCap){ R.powers.illum++; Director.callout("Overdrive — Illuminate restored"); }
  else { Director.callout("Overdrive — the meter is full"); }
  renderPowers();
}
/* Correct answers chain fast; wrong answers keep the long pause so the
   miss can teach. The hotter the streak, the tighter the snap. */
function correctAdvance(){
  if(SetPieces.autoLock()) return 720;
  return (R.streak >= MOMENTUM_STEPS[2]) ? 650 : 800;
}

/* The Overdrive moment. Reaching the top of the momentum meter used to
   silently hand out a reward; now it stops the run and makes the player
   choose — ride (double pay, a miss costs two lamps) or bank (cash the
   streak, reset to ×1). The clock is stopped so it cannot bleed while
   the choice is on screen, and a timeout banks by default so the game
   can never deadlock. */
function offerOverdriveChoice(){
  if(R.overdriveOffered || R.ended) return;
  R.overdriveOffered = true;
  const el = $("overdrive-choice");
  if(!el){ resolveOverdrive("ride"); return; }
  stopTimer();
  R.running = false;
  document.body.classList.add("od-open");
  el.classList.add("on");
  Snd.power(); doFlash("gold");
  clearTimeout(R._odTimer);
  R._odTimer = setTimeout(function(){
    const c = $("overdrive-choice");
    if(c && c.classList.contains("on")) resolveOverdrive("bank");
  }, 9000);
}
function resolveOverdrive(choice){
  if(R.ended) return;
  clearTimeout(R._odTimer);
  const el = $("overdrive-choice");
  if(el) el.classList.remove("on");
  document.body.classList.remove("od-open");
  if(choice === "bank"){
    const bank = (typeof Polish!=="undefined" && Polish.overdriveBank)
      ? Polish.overdriveBank(R.streak, R.diff.score)
      : Math.round(R.streak * 60 * R.diff.score);
    R.score += bank;
    R.streak = 0; setMult(); Director.momentum(false);
    popScore("+"+fmt(bank)); toast("Overdrive banked — "+fmt(bank)+" added");
    Snd.power();
  } else {
    R.overdriveRide = true;
    overdriveReward();
    Director.callout("Riding the fire — double pay, double risk");
    Snd.power(); doFlash("gold");
  }
  queueAdvance();
}

function setMult(pop){
  const m=multiplier(), el=$("mult");
  el.textContent="×"+m;
  el.classList.toggle("hot", m>1);
  if(pop && m>1){ el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
  const s=$("hud-streak"); if(s) s.textContent = R.streak + (R.streak===1?" Verse":" Verses");
}
function answer(choice, btn){
  if(!R.running || R.paused) return;
  stopTimer();
  R.locked = true;
  $("confirm-answer").disabled = true;
  $("confirm-answer").textContent = "Answer Locked";
  const q=R.q;
  const elapsed = performance.now()-R.qStart;
  const left = Math.max(0, R.tEnd - performance.now());
  const opts=$("opts"); opts.classList.add("locked");
  Snd.lock();Snd.hush();
  Director.beat("lock");
  document.body.classList.remove("reveal-freeze");void document.body.offsetWidth;document.body.classList.add("reveal-freeze");
  afterRun(430, ()=>resolveAnswer(q,choice,btn,elapsed,left));
}
function recordDecision(ms){
  if(!Number.isFinite(ms)||ms<0)return;
  const safe=Math.min(ms,(R.tTotal||ms)+500);
  R.decisionMs+=safe;R.timedDecisions++;
  R.fastestMs=Math.min(R.fastestMs,safe);
}
function resolveAnswer(q,choice,btn,elapsed,left){
  if(R.q!==q)return;
  R.attempts++;
  recordDecision(elapsed);

  let ok, graded = null;
  if(R.typed){
    // The verse's own distractors are handed to the grader so a typed
    // near-miss is measured against the readings it could be confused
    // with, not just against character distance.
    graded = Recall.grade(choice, q.a, q.d);
    ok = Recall.isCorrect(graded.verdict);
    if(graded.verdict === "exact") R.typedExact++;
    if(graded.verdict === "close") R.typedClose++;
    SAVE.life.typedAttempts++;
    if(graded.verdict === "exact") SAVE.life.typedExact++;
    renderTypedVerdict(graded);
  } else {
    ok = choice===q.a;
    answerButtons().forEach(b=>{
      b.classList.remove("sel");
      if(b.dataset.val===q.a) b.classList.add("right");
      else if(b===btn) b.classList.add("bad");
      else b.classList.add("mute");
    });
  }
  recordVerse(q, ok);
  scheduleReview(q, {
    correct: ok,
    near: graded ? (graded.verdict === "close" || graded.verdict === "modernised") : false,
    fraction: R.tTotal ? Math.min(1, elapsed / R.tTotal) : 0.5,
    usedPower: R.hintLevel > 0
  });
  if(ok){
    const blank=$("blank"); blank.textContent=q.a; blank.classList.add("filled","reveal");
    R.correct++; R.streak++; R.best=Math.max(R.best,R.streak);
    R.booksRun.add(q.b);
    if(elapsed < 1500) R.fast++;
    // The "double pay" is no longer automatic — it only holds while the
    // player is riding the fire, a choice made at the Overdrive moment.
    const riding = R.overdriveRide && inOverdrive();
    const timeBonus = Math.round(left / R.tTotal * 140);
    const tierW = 1 + q.t*0.12;
    const gained = Math.round((150 + timeBonus) * multiplier() * R.diff.score * tierW * SetPieces.bonus() * (riding ? 2 : 1));
    R.score += gained;
    payCorrect(graded);
    if(R.mode==="blitz" && typeof Polish!=="undefined"){
      const leftB = Math.max(0, (R.blitzEnd||0) - performance.now());
      R.blitzEnd = performance.now() + Polish.blitzAdjustMs(leftB, true);
    }
    noteGhostProgress();
    Snd.correct(); doFlash("gold");
    if(SAVE.set.haptics!==false && typeof Polish!=="undefined") Polish.haptic("correct");
    Director.impact("correct"); animateScore(); setMult(true);Director.momentum(true);
    if(R.streak===5)Director.callout("Unbroken ×5");
    if(R.streak===10)Director.callout("Perfect Recall");
    if(R.streak>=10 && !hasSeal("recall")) grantSeal("recall");
    if(R.streak>=20 && !hasSeal("flame")) grantSeal("flame");
    if(R.fast>=10 && !hasSeal("swift")) grantSeal("swift");
    // The Overdrive moment: reaching the top of the meter pauses the run
    // and asks the player to ride (double pay, double risk) or bank.
    if(R.streak === MOMENTUM_STEPS[MOMENTUM_STEPS.length-1] && !R.setpiece && R.mode!=="blitz"){
      afterRun(700, offerOverdriveChoice);
      return;
    }
    afterRun(typeof Flow!=="undefined" ? Flow.JUDGE_MS : 820, queueAdvance);
  } else {
    // Riding the fire turns a miss into two lost lamps — the risk that
    // paid for the double reward. Capture before the streak resets.
    const wasRiding = R.overdriveRide && inOverdrive();
    R.overdriveRide = false;
    spillOil(R.streak||0);
    R.streak=0; setMult(); R.missed.push(q);
    if(R.mode==="blitz" && typeof Polish!=="undefined"){
      const leftB = Math.max(0, (R.blitzEnd||0) - performance.now());
      R.blitzEnd = performance.now() + Polish.blitzAdjustMs(leftB, false);
    }
    Director.momentum(false);Director.impact("wrong");
    Snd.wrong(); doFlash("red"); shakeUI(true);
    if(SAVE.set.haptics!==false && typeof Polish!=="undefined") Polish.haptic("wrong");
    markBlankScar(choice, q.a);
    witnessLook(true);
    if(R.mode==="blitz"){
      afterRun(typeof Flow!=="undefined" ? Flow.JUDGE_MS : 820, ()=>{
        if(R.blitzEnd && performance.now()>=R.blitzEnd) presentRunEnd("timeout-death");
        else queueAdvance();
      });
    } else {
      loseLife(wasRiding ? 2 : 1);
    }
  }
}
function markBlankScar(wrong, right){
  const blank = $("blank");
  if(!blank) return;
  blank.classList.remove("filled","bad","hinted");
  blank.classList.add("scar","reveal");
  blank.innerHTML = '<s class="scar-miss">'+esc(wrong == null || wrong === "" ? "—" : wrong)+'</s>'+
    '<em class="scar-true">'+esc(right || "")+'</em>';
}
function noteGhostProgress(){
  if(typeof Polish==="undefined" || !R.startedAt) return;
  const t = Date.now() - R.startedAt;
  let p = 0;
  if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    const n = R.siteVerses ? R.siteVerses.length : 1;
    p = Math.min(1, (R.siteIdx||0) / n);
  } else if(R.mode==="blitz"){
    p = Math.min(1, (R.correct||0) / 30);
  } else if(R.mode==="daily" && R.daily && R.daily.list){
    p = Math.min(1, (R.dailyIdx||0) / R.daily.list.length);
  } else {
    p = Math.min(1, (R.qTotal||0) / 40);
  }
  R.ghostSamples = Polish.pushGhostSample(R.ghostSamples||[], t, p, 1500);
  paintGhostMarker();
}
function paintGhostMarker(){
  const track = $("act-track");
  if(!track) return;
  let ghost = track.querySelector(".ghost-mark");
  const pb = SAVE.ghosts && (R.mode==="blitz" ? SAVE.ghosts.blitz : SAVE.ghosts.pilgrimage);
  if(!pb || !pb.samples || !pb.samples.length){
    if(ghost) ghost.remove();
    return;
  }
  const elapsed = Date.now() - (R.startedAt||Date.now());
  const p = typeof Polish!=="undefined" ? Polish.sampleGhost(pb.samples, elapsed) : 0;
  if(!ghost){
    ghost = document.createElement("i");
    ghost.className = "ghost-mark";
    ghost.title = "Your best run";
    track.appendChild(ghost);
  }
  ghost.style.left = (Math.max(0, Math.min(1, p)) * 100) + "%";
}
function timeUp(){
  if(R.mode==="blitz"){ presentRunEnd("timeout-death"); return; }
  if(R.passage) return resolvePassage();
  if(R.recon) return resolveRecon();
  stopTimer(); R.locked=true; R.selected=null; R.attempts++; recordDecision(R.tTotal);
  spillOil(R.streak||0);
  R.streak=0; setMult();
  $("confirm-answer").disabled = true;
  $("confirm-answer").textContent = "Time Expired";
  Director.momentum(false);Director.pressure(0);
  const q=R.q, opts=$("opts"); opts.classList.add("locked");
  if(R.typed){
    const input=$("typed-answer"); if(input) input.disabled = true;
    renderTypedVerdict({verdict:"wrong", hint:""});
  } else {
    answerButtons().forEach(b=>{
      b.classList.remove("sel");
      if(b.dataset.val===q.a) b.classList.add("right"); else b.classList.add("mute");
    });
  }
  if(q) markBlankScar("— time —", q.a);
  witnessLook(true);
  recordVerse(q,false);
  scheduleReview(q, {correct:false, timedOut:true});
  R.missed.push(q);
  Director.impact("wrong");Snd.wrong(); doFlash("red"); shakeUI(true);
  loseLife();
}
function loseLife(count){
  count = count || 1;
  /* A recovered relic shields the road once per site: the miss still
     costs the streak, but the lamp holds. */
  const onRoad = R.mode==="pilgrimage" || R.mode==="pilgrim-recall" || R.mode==="relay";
  if(onRoad && count===1 && !R.armorUsed && typeof Artifacts!=="undefined" && Artifacts.unlockedCount(SAVE.artifacts) > 0){
    R.armorUsed = true;
    toast("Relic shield — one miss absorbed");
    Snd.power();
    afterRun(1200, nextQuestion);
    return;
  }
  R.actNoLoss = false;
  R.lives = Math.max(0, R.lives - count);
  renderLives(count);
  if(R.lives===1 && !R.oneLifeCalled){ R.oneLifeCalled=true; Director.speak("One life remains.",true); }
  if(R.lives<=0){
    const finalAct = R.mode==="trial" && R.actIdx===trialActs().length-1;
    const canUseWind = !finalAct && !SetPieces.noPowers() && R.powers.wind>0;
    if(canUseWind){
      R.powers.wind--; R.usedPower=true; R.powersSpent++; R.lives=1; renderLives(); renderPowers();
      toast("Second Wind — one life restored");
      Snd.power(); afterRun(1900, queueAdvance); return;
    }
    afterRun(900, ()=>presentRunEnd("fallen")); return;
  }
  afterRun(SetPieces.autoLock()?950:1900, queueAdvance);
}
function renderLives(lost){
  lost = lost || 0;
  const el=$("hud-lives"); if(!el) return;
  const wrap=$("hud-lives-wrap");
  const lab=$("hud-lives-lab");
  if(R.mode==="blitz"){
    if(wrap) wrap.style.display="none";
    el.innerHTML="";
    return;
  }
  if(wrap) wrap.style.display="";
  if(lab) lab.textContent="Lamps";
  const n = R.maxLives;
  let html = "";
  for(let i=0;i<n;i++){
    const alive = i < R.lives;
    const last  = alive && R.lives===1;
    const broke = lost && !alive && i>=R.lives && i < R.lives+lost;
    html += '<span class="hrt lamp'+(alive?"":" gone")+(last?" last":"")+(broke?" break":"")+'">'+LAMP_SVG+'</span>';
  }
  html += '<b>'+R.lives+'</b>';
  el.innerHTML = html;
}
function recordVerse(q, ok){
  const b = SAVE.books[q.b] || (SAVE.books[q.b]={c:0,a:0});
  b.a++; if(ok) b.c++;
  const v = SAVE.verse[q.id] || (SAVE.verse[q.id]={c:0,a:0});
  v.a++; if(ok) v.c++;
  SAVE.life.attempts++; if(ok) SAVE.life.correct++;
}
/* Every answer in every mode reschedules the verse — the Trial feeds the
   Drill, which is the point of having one scheduler rather than a
   practice-only side channel. Passage sub-answers are skipped: they carry
   no verse id of their own. */
function scheduleReview(q, outcome){
  if(!q || !q.id) return;
  const card = reviewVerse(q, outcome);
  R.rescheduled.push({ r:q.r, ivl:card.ivl, correct:!!outcome.correct });
}
/* ------------------------- FX HELPERS ------------------------- */
function doFlash(cls){ const f=$("flash"); f.className=""; void f.offsetWidth; f.className=cls; }
function shakeUI(soft){
  if(!SAVE.set.shake || SAVE.set.reduced) return;
  const v=$("v-play"); if(!v) return;
  const frames = soft
    ? [{transform:"translate(0,0)"},{transform:"translate(-4px,2px)"},{transform:"translate(3px,-2px)"},{transform:"translate(0,0)"}]
    : [{transform:"translate(0,0)"},{transform:"translate(-7px,4px)"},{transform:"translate(6px,-4px)"},
       {transform:"translate(-4px,-2px)"},{transform:"translate(3px,2px)"},{transform:"translate(0,0)"}];
  v.animate(frames, {duration:soft?360:420, easing:"cubic-bezier(.36,.07,.19,.97)"});
}
function popScore(t){
  const p=document.createElement("div"); p.className="pop"; p.textContent=t;
  p.style.left="50%"; p.style.top="44%"; document.body.appendChild(p);
  setTimeout(()=>p.remove(),1450);
}
function toast(t){
  const p=document.createElement("div"); p.className="toast"; p.textContent=t;
  document.body.appendChild(p); setTimeout(()=>p.remove(),2700);
}
function spillOil(streak){
  if(typeof Meta==="undefined" || !Meta.oilForMiss) return 0;
  const take = Math.min(SAVE.oil||0, Meta.oilForMiss(streak));
  if(!take) return 0;
  SAVE.oil = (SAVE.oil||0) - take;
  persist();
  if(typeof updatePlayerCard==="function") updatePlayerCard();
  toast("The oil spilled — −"+take);
  return take;
}
function payCorrect(graded){
  const exact = !!(graded && graded.verdict === "exact") || !R.typed;
  const oil = (typeof Meta!=="undefined" && Meta.oilForCorrect) ? Meta.oilForCorrect(R.streak, exact) : 2;
  const xp = (typeof Meta!=="undefined" && Meta.xpTick) ? Meta.xpTick(R.q ? R.q.t : 1, R.streak) : 10;
  SAVE.oil = (SAVE.oil||0) + oil;
  SAVE.life.oilEarned = (SAVE.life.oilEarned||0) + oil;
  SAVE.xp = (SAVE.xp||0) + xp;
  if(R.typed && (R.typedExact||0) >= 12 && !hasSeal("assemble12")) grantSeal("assemble12");
  persist();
  updatePlayerCard();
  popScore("+"+xp+" XP  +"+oil+" oil");
}
function wipeContext(){
  if(R.ended) return { ended:true };
  const reduced = !!(SAVE.set && SAVE.set.reduced);
  if(R.mode==="trial"){
    const acts = trialActs();
    const A = acts[R.actIdx];
    if(A && A.q !== Infinity && R.qInAct >= A.q){
      return { reduced, toAct: R.actIdx < acts.length-1, toEnd: R.actIdx >= acts.length-1 };
    }
    if(typeof SetPieces!=="undefined" && SetPieces.wouldLaunch && SetPieces.wouldLaunch()) return { reduced, toSetpiece:true };
  }
  if(R.mode==="daily" && R.daily && R.dailyIdx >= R.daily.list.length) return { reduced, toEnd:true };
  if(R.mode==="blitz" && R.blitzEnd && performance.now() >= R.blitzEnd) return { reduced, toDeath:true };
  if((R.mode==="practice" || R.mode==="recall") && R.qTotal >= R.practiceLen) return { reduced, toEnd:true };
  if((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece &&
     R.siteIdx >= (R.siteVerses ? R.siteVerses.length : 0)){
    const finale = typeof SetPieces!=="undefined" && SetPieces.wouldLaunchSite && SetPieces.wouldLaunchSite();
    return { reduced, toEnd:!finale, toSetpiece:!!finale };
  }
  if(R.mode==="relay" && R.relay && R.relay.idx >= R.relay.queue.length) return { reduced, toEnd:true };
  return { reduced };
}
function hideWipe(){
  const el = $("wipe-right");
  if(el){ el.classList.remove("on"); el.setAttribute("aria-hidden","true"); }
  document.body.classList.remove("wiping");
}
function playWipe(then){
  const skip = !!(SAVE.set && SAVE.set.reduced);
  const el = $("wipe-right");
  if(skip || !el){ if(then) then(); return; }
  document.body.classList.add("wiping");
  el.classList.remove("on"); void el.offsetWidth;
  el.classList.add("on");
  el.setAttribute("aria-hidden","false");
  const ms = (typeof Flow!=="undefined" && Flow.WIPE_MS) || 750;
  afterRun(ms, function(){
    hideWipe();
    if(then) then();
  });
}
function queueAdvance(){
  if(R.ended) return;
  const ctx = wipeContext();
  const wipe = (typeof Flow!=="undefined" && Flow.shouldWipe) ? Flow.shouldWipe(ctx) : !ctx.toEnd;
  if(!wipe){ nextQuestion(); return; }
  playWipe(nextQuestion);
}
function hideState(){
  const el = $("state-panel");
  if(!el) return;
  el.classList.remove("on");
  el.setAttribute("hidden","");
  el.setAttribute("aria-hidden","true");
  R._state = null;
}
function showState(kind, extra){
  extra = extra || {};
  const spec = (typeof Flow!=="undefined" && Flow.state) ? Flow.state(kind) : null;
  const el = $("state-panel");
  if(!spec || !el || !el.querySelector){
    if(extra.onPrimary) extra.onPrimary();
    return;
  }
  R._state = { kind, extra };
  const kick = $("state-kick"), title = $("state-title"), body = $("state-body");
  const pri = $("state-primary"), sec = $("state-secondary");
  if(kick) kick.textContent = spec.kick;
  if(title) title.textContent = spec.title;
  if(body) body.textContent = spec.body;
  if(pri){ pri.textContent = spec.primary || "Continue"; pri.style.display = spec.primary ? "" : "none"; }
  if(sec){
    sec.textContent = spec.secondary || "";
    sec.style.display = spec.secondary ? "" : "none";
  }
  el.classList.add("on");
  el.removeAttribute("hidden");
  el.setAttribute("aria-hidden","false");
  if(pri && pri.focus) pri.focus();
}
function presentRunEnd(kind){
  if(R.ended) return;
  showState(kind, {
    onPrimary: function(){ hideState(); endRun(kind==="fallen"||kind==="timeout-death" ? "death" : "death"); }
  });
}
function bindStatePanel(){
  const pri = $("state-primary"), sec = $("state-secondary");
  if(pri) pri.addEventListener("click", function(){
    const st = R._state; hideState();
    if(st && st.extra && st.extra.onPrimary) st.extra.onPrimary();
  });
  if(sec) sec.addEventListener("click", function(){
    const st = R._state; hideState();
    if(st && st.extra && st.extra.onSecondary) st.extra.onSecondary();
    else if(st && st.extra && st.extra.onPrimary) st.extra.onPrimary();
  });
}
function animateScore(){
  const el=$("score"), from=R.disp, to=R.score, t0=performance.now();
  (function step(t){
    const k=Math.min(1,(t-t0)/650), e=1-Math.pow(1-k,3);
    R.disp=Math.round(from+(to-from)*e); el.textContent=fmt(R.disp);
    if(k<1) requestAnimationFrame(step);
  })(t0);
}

/* ------------------------- SEALS ------------------------- */
let pendingSeals = [];
function grantSeal(id){
  if(hasSeal(id)) return;
  SAVE.seals.push(id); persist();
  const s = SEALS.find(x=>x.id===id);
  if(!s) return;
  pendingSeals.push(Object.assign({announced: !R.ended}, s));
  if(!R.ended){ Snd.seal(); toast("Seal unlocked — "+s.n); }
}
function checkMetaSeals(){
  const li = levelInfo(SAVE.xp);
  if(li.level>=20) grantSeal("lvl20");
  if(li.level>=35) grantSeal("ascent");
  if(SAVE.life.correct>=500) grantSeal("life500");
  const booksC = Object.keys(SAVE.books).filter(b=>SAVE.books[b].c>0).length;
  if(booksC>=30) grantSeal("books30");
  if(booksC>=66) grantSeal("books66");
  if(SAVE.life.dailyDone>=7) grantSeal("daily7");
}

/* ------------------------- PAUSE ------------------------- */
function setPaused(v){
  if(currentView!=="play") return;
  R.paused = v;
  const pauseEl = $("pause");
  if(pauseEl) pauseEl.classList.toggle("on", v);
  if(v){
    if(typeof Snd!=="undefined" && Snd.stopPressure) Snd.stopPressure();
    const acts=trialActs();
    const progress=R.mode==="trial" ? ACTS[R.actIdx].n+" / "+acts[acts.length-1].n
      : (R.mode==="practice"||R.mode==="recall") ? R.qTotal+" / "+R.practiceLen
      : String(R.qTotal);
    const acc=R.attempts ? Math.round(R.correct/R.attempts*100)+"%" : "—";
    $("pause-stats").innerHTML=
      '<div><b>'+fmt(R.score)+'</b><span>Score</span></div>'+
      '<div><b>'+R.streak+'</b><span>Streak</span></div>'+
      '<div><b>'+acc+'</b><span>Accuracy</span></div>'+
      '<div><b>'+progress+'</b><span>'+(R.mode==="trial"?"Act":R.mode==="practice"?"Drill":R.mode==="recall"?"Recall":"Distance")+'</span></div>';
    stopLoop();
    /* A dialog that opens should take focus — keyboard players land on
       Resume instead of whatever they last answered with. */
    const resume = $("pause-resume");
    if(resume && resume.focus) resume.focus();
  }else ensureLoop();
}
let pauseStamp=0;
function togglePause(){
  if(currentView!=="play" || !R.running) return;
  if(!R.paused){ pauseStamp = performance.now(); setPaused(true); }
  else { const d = performance.now()-pauseStamp; R.tEnd += d; setPaused(false); }
}
$("pause-resume").addEventListener("click", togglePause);
function abandonRun(){
  setPaused(false);
  if(!R.attempts){
    invalidateRun();
    clearSequence();
    hideSiteQuote();
    R.setpiece = null;
    pendingSeals = [];
    $("setpiece-card").classList.remove("on");
    document.body.classList.remove("setpiece-active","overdrive","pressure-3","pressure-5","pressure-7");
    Snd.ui();
    // Backing out of a site before answering anything drops you on the
    // map you came from, not in the main hall.
    go(R.mode==="pilgrimage"||R.mode==="pilgrim-recall"||R.mode==="relay" ? "atlas" : "menu");
    return;
  }
  endRun("abandon");
}
$("pause-quit").addEventListener("click", abandonRun);
function candleProgress(){
  if(!R) return 0;
  let denom = 8;
  if(R.mode==="trial"){
    const acts = trialActs();
    denom = acts.reduce((n,a)=>n+(a.q||0),0) || 39;
  } else if(R.mode==="daily") denom = (R.daily && R.daily.list && R.daily.list.length) || 20;
  else if(R.mode==="practice" || R.mode==="recall") denom = R.practiceLen || 15;
  else if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall") denom = (R.siteVerses && R.siteVerses.length) || 8;
  else if(R.mode==="relay" && R.relay) denom = R.relay.queue.length || 8;
  else if(R.mode==="blitz") denom = 20;
  else denom = 30;
  const through = Math.min(1, (R.correct||0) / denom);
  const streak = Math.min(1, (R.streak||0) / 12);
  return Math.max(0, Math.min(1, through * 0.75 + streak * 0.25));
}
function updateCandle(){
  const el = $("play-candle");
  if(!el) return;
  const heat = candleProgress();
  el.style.setProperty("--heat", String(heat));
  el.classList.toggle("lit", !!(R && (R.qTotal || R.correct)));
  el.classList.toggle("hot", heat >= 0.62);
  el.classList.toggle("blaze", heat >= 0.88);
}
function quitPlay(){
  if(R.ended || currentView!=="play") return;
  if(!R.paused && R.running){
    pauseStamp = performance.now();
    setPaused(true);
  }
  if(R.attempts && !confirm("Leave this run? It will be recorded as abandoned.")){
    if(R.paused) togglePause();
    return;
  }
  Snd.ui();
  abandonRun();
}

function shareDailyResult(total){
  const text = "Complete the Verse — Daily Trial "+todayKey()+"\nScore: "+fmt(total)+
    "\nKept "+R.correct+"/"+R.attempts+" · "+MODES.daily.name+" · KJV";
  if(navigator.share){
    navigator.share({title:"Complete the Verse", text:text}).catch(()=>{});
    return;
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>toast("Daily result copied")).catch(()=>toast(text));
    return;
  }
  toast("Share unavailable on this device");
}

/* ------------------------- INPUT ------------------------- */
addEventListener("keydown", e=>{
  const k = e.key.toLowerCase();
  if(document.activeElement && /input|select|textarea/i.test(document.activeElement.tagName)) return;
  const stEl = $("state-panel");
  if(stEl && stEl.classList.contains("on")){
    if(k==="enter" || k===" "){ e.preventDefault(); const b=$("state-primary"); if(b) b.click(); return; }
    if(k==="escape"){ e.preventDefault(); const b=$("state-secondary"); if(b && b.style.display!=="none") b.click(); else { const p=$("state-primary"); if(p) p.click(); } return; }
    return;
  }
  const odEl = $("overdrive-choice");
  if(odEl && odEl.classList.contains("on")){
    if(k==="enter"){ e.preventDefault(); resolveOverdrive("ride"); return; }
    if(k==="b" || k==="escape"){ e.preventDefault(); resolveOverdrive("bank"); return; }
    return;
  }
  const quoteEl = $("site-quote");
  if(quoteEl && quoteEl.classList.contains("on")){
    if(k==="escape"||k==="enter"||k===" "){
      e.preventDefault();
      if(typeof quoteEl.onclick==="function") quoteEl.onclick();
    }
    return;
  }
  // Escape walks back one step rather than always jumping to the hall:
  // a site briefing belongs to the map, so it returns there.
  if(k==="escape"){
    if(currentView==="play") togglePause();
    else if(currentView==="sitebrief") go("atlas");
    else if(currentView!=="menu") go("menu");
    return;
  }
  if(currentView==="intro"){
    e.preventDefault();
    if(k==="escape") finishIntro(true);
    else beginIntroPlayback();
    return;
  }
  if(currentView==="menu" && (k==="enter"||k===" ")){
    e.preventDefault(); Snd.unlock();
    /* Enter opens the first mode the menu actually shows — never a
       hidden one. Launching hidden Trial from an Enter tap was a bug. */
    const first = MENU_ORDER.filter(x=>MODES[x] && !MODES[x].hidden)[0] || "pilgrimage";
    if(MODES[first].atlas) go("atlas"); else openBrief(first);
    return;
  }
  if(currentView==="brief" && (k==="enter")){ e.preventDefault(); Snd.unlock(); startRun(briefMode, SAVE.set.diff); return; }
  if(currentView==="sitebrief" && (k==="enter")){ e.preventDefault(); Snd.unlock(); startRun(sbMode, SAVE.set.diff); return; }
  if(currentView==="results" && (k==="enter"||k===" ")){ e.preventDefault(); startRun(R.mode, R.diff.key); return; }
  if(currentView!=="play") return;
  /* Typed mode: route keys into the answer field even when it is not
     focused (mobile uses the on-screen board; desktop may type either way). */
  if((e.ctrlKey||e.altKey||e.metaKey) && (k==="s"||k==="i")){
    e.preventDefault();
    usePower(k==="s"?"selah":"illum");
    return;
  }
  if(R.typed && !R.locked){
    if(k==="enter"){ e.preventDefault(); confirmTyped(); return; }
    if(k==="backspace"){
      e.preventDefault();
      if(R.assemble && typeof Assemble!=="undefined"){
        const last = R.assemble.placed.lastIndexOf(R.assemble.placed.filter(Boolean).pop() || null);
        const idx = R.assemble.placed.map((p,i)=>p?i:-1).filter(i=>i>=0).pop();
        if(idx>=0){ Assemble.unplace(R.assemble, idx); renderAssembleBank(); }
      }
      return;
    }
  }
  if(k==="s"){ usePower("selah"); return; }
  if(k==="i"){ usePower("illum"); return; }
  if(k==="enter" || k===" "){
    e.preventDefault();
    if(R.recon){
      const b=$("recon-confirm"); if(b && !b.disabled) b.click();
    } else confirmAnswer();
    return;
  }
  const idx = (k>="1"&&k<="4") ? parseInt(k,10)-1 : "abcd".indexOf(k);
  if(idx >= 0){
    const b = answerButtons()[idx];
    if(b && !b.classList.contains("burn")){
      const key = String(idx);
      const now = performance.now();
      /* Double-tap same letter within 420ms locks instantly. */
      if(R.lastPickKey===key && now-(R.lastPickAt||0)<420 && R.selected){
        confirmAnswer();
      } else {
        b.click();
        R.lastPickKey = key;
        R.lastPickAt = now;
      }
    }
  }
});
addEventListener("resize", ()=>{ if(currentView==="play")Viz.size(); });
addEventListener("online", ()=>{ updateOfflineBanner(); updateCloudChip(); });
addEventListener("offline", ()=>{ updateOfflineBanner(); updateCloudChip(); });
document.addEventListener("pointerdown", ()=>Snd.unlock(), {once:true});
document.addEventListener("visibilitychange", ()=>{
  if(document.hidden){
    stopLoop();
    if(currentView==="play"&&R.running&&!R.paused){
      pauseStamp=performance.now();
      setPaused(true);
    }
  }else if(currentView==="play"){
    ensureLoop();
  }
});

/* ------------------------- MAIN LOOP ------------------------- */
let loopRaf=null,lastVizFrame=0;
function ensureLoop(){
  if(loopRaf===null&&currentView==="play"&&!document.hidden&&!R.paused)loopRaf=requestAnimationFrame(loop);
}
function stopLoop(){
  if(loopRaf!==null)cancelAnimationFrame(loopRaf);
  loopRaf=null;
}
function loop(ts){
  loopRaf=null;
  if(currentView!=="play"||document.hidden)return;
  tickTimer(ts);
  if(ts-lastVizFrame>=33){
    lastVizFrame=ts;
    Viz.draw(ts||0);
  }
  ensureLoop();
}

/* ------------------------- BOOT ------------------------- */
(function boot(){
  buildPlayerCard();
  Backdrop.init();
  applySettings();
  bindTutorial();
  armIntro();

  bindStatePanel();
  const playQuit = $("play-quit");
  if(playQuit) playQuit.addEventListener("click", quitPlay);
  /* Overdrive ride-or-bank choice buttons. */
  const odRide = $("od-ride"), odBank = $("od-bank");
  if(odRide) odRide.addEventListener("click", ()=>{ Snd.ui(); resolveOverdrive("ride"); });
  if(odBank) odBank.addEventListener("click", ()=>{ Snd.ui(); resolveOverdrive("bank"); });

  /* Cloud is optional. Lazy-load SDK; never block boot. */
  if(typeof Cloud!=="undefined" && Cloud.configured()){
    Cloud.on("onAuth", function(ev){
      if(ev && ev.event==="SIGNED_IN"){
        Cloud.syncOnBoot(SAVE).then(function(res){
          if(res && res.ok && res.save){
            SAVE = res.save; persist();
            Atlas.setProgress(SAVE.pilgrim);
            updatePlayerCard();
            updateCloudChip();
            if(res.merged) toast("Progress merged from the cloud");
          }
        });
      }
      updateCloudChip();
      if(currentView==="settings") renderSettings();
    });
    const bootCloud = Cloud.initLazy ? Cloud.initLazy() : Cloud.init();
    bootCloud.then(function(res){
      if(res && res.ok && Cloud.isSignedIn()){
        return Cloud.syncOnBoot(SAVE).then(function(sync){
          if(sync && sync.ok && sync.save){
            SAVE = sync.save; persist();
            Atlas.setProgress(SAVE.pilgrim);
            updatePlayerCard();
          }
          updateCloudChip();
        });
      }
      updateCloudChip();
    }).catch(function(){});
  }
  updateOfflineBanner();

  if(introAllowed()){
    go("intro");
    return;
  }
  playBootSequence({fast:false});
})();
