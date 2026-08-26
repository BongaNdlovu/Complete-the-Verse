/* ==================================================================
   GAME — modes, progression, meta, UI
   ================================================================== */
/* ------------------------- SAVE ------------------------- */
const SAVE_KEY = "ctv_save_v3";
const LEGACY_SAVE_KEY = "ctv_save_v2";
const DEFAULT_SAVE = {
  v:3, xp:0, oil:0, illumReserve:0, runs:0,
  best:{trial:0, endless:0, daily:0, practice:0, recall:0, pilgrimage:0, "pilgrim-recall":0, blitz:0},
  seals:[],
  life:{correct:0, attempts:0, bestStreak:0, sdBest:0, endlessBest:0, dailyDone:0, perfectActs:0,
        typedExact:0, typedAttempts:0, reviewsDone:0, sitesCleared:0, arcsCleared:0, blitzBest:0,
        oilSpent:0, oilEarned:0, quickRewards:0, quickRewardXP:0, quickRewardOil:0, illumRewards:0},
  books:{}, verse:{}, srs:{}, board:[], journal:[],
  ghosts:{pilgrimage:null, pilgrimageBySite:{}, trial:null, blitz:null},
  daily:{date:"", score:0},
  /* Habit streak tracking across calendar days */
  habit:{count:0, lastDate:"", lastDay:0, best:0, history:{}},
  /* The road from Ur to Patmos. Shape is owned by pilgrimage.js —
     blankProgress() there is the authority — and stored here so a
     journey survives a reload. */
  pilgrim:{sites:{}, lastPlayed:"", started:0, usedIds:[]},
  /* Relics unlocked by first site clear. Shape owned by artifacts.js. */
  artifacts:{unlocked:{}, seen:{}},
  set:{music:0.45, sfx:0.7, quality:"high", qualityLocked:false, motion:"full", reduced:false, shake:true, voice:true, diff:"watchman",
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
      habit:Object.assign({count:0, lastDate:"", lastDay:0, best:0, history:{}}, s.habit||{}),
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
      ghosts: Object.assign({pilgrimage:null, pilgrimageBySite:{}, trial:null, blitz:null}, s.ghosts||{}, {
        pilgrimageBySite: Object.assign({}, (s.ghosts && s.ghosts.pilgrimageBySite) || {})
      })
    });
    if(migrating) migrateV2(out, s);
    migrateProfile(out);
    migrateBlitzUnits(out);
    return out;
  }catch(e){
    console.error("Save load failure:", e);
    if(typeof Diag !== "undefined" && Diag.record){
      Diag.record({ kind: "save-corrupt", message: e.message || String(e), stack: e.stack });
    }
    try{
      let rawBroken = localStorage.getItem(SAVE_KEY);
      if(rawBroken) localStorage.setItem("ctv_save_v3_broken", rawBroken);
    }catch(err){}
    if(typeof window !== "undefined") window._saveCorruptPending = true;
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
  }
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

let _persistWarned = false;
function persist(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){
    console.error("Save persist failure:", e);
    if(typeof Diag !== "undefined" && Diag.record){
      Diag.record({ kind: "save-blocked", message: e.message || String(e), stack: e.stack });
    }
    if(!_persistWarned && typeof showState === "function"){
      _persistWarned = true;
      showState("save-blocked", {
        onPrimary: function(){ hideState(); },
        onSecondary: function(){
          if(typeof navigator !== "undefined" && navigator.clipboard && typeof Diag !== "undefined"){
            navigator.clipboard.writeText(Diag.dump());
            if(typeof toast === "function") toast("Diagnostics copied");
          }
        }
      });
    }
  }
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
  /* Keep the learning evidence beside the interval. The scheduler remains
     pure, while Study Hall and future adaptive draws can distinguish a
     fluent answer from a cued or slow one without rewriting old saves. */
  SAVE.srs[q.id].lastQuality = quality;
  SAVE.srs[q.id].lastMode = opts && opts.mode || (R.typed ? "assembly" : "choice");
  SAVE.srs[q.id].lastFraction = opts && typeof opts.fraction === "number" ? opts.fraction : null;
  SAVE.srs[q.id].lastCueLevel = opts && opts.cueLevel || 0;
  SAVE.srs[q.id].lastNear = !!(opts && opts.near);
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
  {id:"seventh-lamp",  n:"The Seventh Lamp", d:"Finish a coffee on seven consecutive calendar days."},
  {id:"streak14",      n:"Two Weeks Unbroken", d:"Finish a coffee on 14 consecutive calendar days."},
  {id:"streak30",      n:"Thirty Days",      d:"Finish a coffee on 30 consecutive calendar days."},
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
  /* The Pilgrimage is the core campaign and primary road mode. */
  pilgrimage:{ key:"pilgrimage", name:"The Pilgrimage", kick:"The long road", atlas:true,
    desc:"Forty-six places, in the order Scripture walks them — from the city Abraham left to the island where the last book was written. Each site is eight verses drawn without repeating earlier stops; the last beat is produced from memory with no options. The clock closes as you go east.",
    tagline:"46 sites · Ur to Patmos", info:[["46","Sites"],["8","Verses each"],[modeClockLabel("pilgrimage"),"Clock"]] },
  "pilgrim-recall":{ key:"pilgrim-recall", name:"Pilgrim’s Recall", kick:"Typed from memory", hidden:true,
    desc:"A site you have already cleared, walked again with no options on the screen. Same place, assembled word for word.",
    tagline:"Assemble · cleared sites", info:[["8","Verses"],["Assemble","No options"],[modeClockLabel("pilgrim-recall"),"Clock"]] },
  /* Relay and Pilgrim's Recall stay contextual to an atlas-selected arc or
     cleared site; the rest of the modes are discoverable from the hall. */
  relay:{ key:"relay", name:"The Long Road", kick:"One unbroken walk", hidden:true,
    desc:"A whole arc in a single run. Lives carry from site to site and never come back, and the clock keeps tightening the way the road does. Sites you pass stay cleared even if the road ends you.",
    tagline:"A whole arc · shared lives", info:[["1","Run"],["Shared","Lives"],["No","Rest"]] },
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
  practice:{ key:"practice", name:"The Drill", kick:"Spaced review",
    desc:"The verses that have fallen due, most overdue first, then whatever you have never seen.",
    tagline:"15 verses · due first", info:[["15","Verses"],["Due","Ordered by"],[modeClockLabel("practice"),"Clock"]] },
  recall:{ key:"recall", name:"Recall", kick:"Assemble it from memory",
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
      "blitz-edge","blitz-edge-2","blitz-edge-3","retreat");
  }
  if(plan.bumpScene) R.sceneToken = (R.sceneToken||0) + 1;
  if(plan.hideState && currentView!=="play") hideState();
  const siteVid = $("cine-parallax-video");
  if(siteVid && plan && !plan.same && plan.stopLoop !== false){
    try { siteVid.pause(); } catch(e){}
    siteVid.style.display = "none";
  }
  if(typeof Snd !== "undefined" && typeof Snd.setRain === "function" && plan && !plan.same && plan.stopLoop !== false){
    Snd.setRain(false);
  }
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
  if(view==="results"){
    Backdrop.palette("results");
    /* Completion and failure have distinct musical resolutions; older
       callers still fall back to the neutral results bed. */
    Snd.ambience((R && R.resultTrack) || "results");
  }
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
  if(typeof clearQuestionMechanicTimers === "function") clearQuestionMechanicTimers();
  R.strike = null;
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
  /* Late-day mechanic beats give the fixed draw its difficulty curve —
     and the weighted board something real to reward. Positions are fixed
     so every player faces the identical sequence of mechanics. */
  const MECHANIC_SLOTS = {4:"duel", 9:"cloze", 13:"strike", 16:"typed", 19:"fade"};
  const used = new Set(), out = [];
  pattern.forEach((t,i)=>{
    let pool = poolSansRepeatRefs(BY_TIER[t].filter(v=>!used.has(v.id)));
    if(!pool.length) pool = BY_TIER[t].slice();
    const v = pool[Math.floor(rnd()*pool.length)];
    used.add(v.id); R.usedRefs.add(refKey(v));
    const mech = MECHANIC_SLOTS[i];
    /* Clone before stamping so the bank's verse objects stay pristine. */
    out.push({v: mech ? Object.assign({}, v, mech==="typed" ? {typed:true} : {mechanic:mech}) : v, rnd:rnd});
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
    siteId = pendingSiteId || R.siteId || (typeof Pilgrimage !== "undefined" && Pilgrimage.currentSite ? (Pilgrimage.currentSite(SAVE.pilgrim)||{}).id : "ur") || "ur";
    siteIndex = Pilgrimage.indexOf(siteId);
    const rec = Pilgrimage.recordOf(SAVE.pilgrim, siteId);
    const exclude = Pilgrimage.usedSet(SAVE.pilgrim);
    const dueList = [];
    if(typeof VERSES !== "undefined" && typeof SRS !== "undefined" && SAVE.srs){
      const t = today();
      VERSES.forEach(v => {
        const c = cardFor(v);
        if(c && (c.reps || c.lapses) && SRS.isDue(c, t) && !exclude[v.id]){
          dueList.push(v);
        }
      });
    }
    siteDraw = Pilgrimage.drawSite(siteId, {
      attempt: rec ? rec.attempts : 0,
      exclude: exclude,
      dueVerses: dueList
    });
    if(!siteDraw || !siteDraw.verses || !siteDraw.verses.length){
      showState("empty-draw", {
        onPrimary: function(){ hideState(); go("atlas"); },
        onSecondary: function(){ hideState(); go("menu"); }
      });
      return;
    }
    if(typeof Cinematic !== "undefined" && Cinematic.showColdPlaceToast){
      const sObj = Pilgrimage.site(siteId);
      const aObj = sObj ? Pilgrimage.arc(sObj.arc) : null;
      Cinematic.showColdPlaceToast(sObj ? sObj.name : "Ur of the Chaldees", aObj ? aObj.name : "The Long Road");
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
  const reservedIlluminate = Math.min(2, Math.max(0, Number(SAVE.illumReserve)||0));
  startPowers.illum += reservedIlluminate;
  const blitzMs = (typeof Polish!=="undefined" && Polish.BLITZ_START_MS) || 60000;

  Object.assign(R, {
    runToken, sceneToken:0, ended:false,
    mode, diff:D, actIdx:0, qInAct:0, qTotal:0,
    score:0, disp:0, lives: mode==="blitz" ? 99 : D.lives, maxLives: mode==="blitz" ? 99 : D.lives,
    streak:0, best:0, correct:0, attempts:0, missed:[], used:new Set(), usedRefs:new Set(),
    siteCommitted:{},
    powers:startPowers, usedPower:false, qUsedPower:false, powersSpent:0,
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
    typedExact:0, typedClose:0, rescheduled:[], strike:null,
    siteId: siteId, siteIndex: siteIndex, siteIdx: 0,
    siteVerses: siteDraw ? siteDraw.verses : null,
    siteRing: siteDraw ? siteDraw.ring : "",
    relay: relay,
    blitzEnd: mode==="blitz" ? performance.now() + blitzMs : 0,
    ghostSamples: [{ t:0, p:0 }],
    missStreak:0,
    tf: null, tfUsed: [],
    lastPickKey: "", lastPickAt: 0,
    quoteShown: false, assemble: null,
    quickRewards: (typeof QuickRewards !== "undefined" && QuickRewards.pick)
      ? QuickRewards.pick(mode, runToken + (SAVE.runs||0)) : [],
    quickRewardAnnounced: new Set(), quickResult: null,
    reservedIlluminate: reservedIlluminate
  });
  if(R.friendRoom) startFriendRacePolling(R.friendRoom);
  document.body.classList.remove("setpiece-active","overdrive","momentum-1","momentum-2","momentum-3","momentum-4","blitz-edge","blitz-edge-2","blitz-edge-3");
  if(mode==="daily") R.daily = buildDailyList();
  renderLives();
  syncWitness();
  $("score").textContent = "0"; setMult();
  Director.momentum(false);
  renderPowers();
  renderQuickRewards();
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
  claimIlluminateReserve();
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

function claimIlluminateReserve(){
  const n = Math.min(2, Math.max(0, Number(R.reservedIlluminate)||0));
  if(!n) return;
  SAVE.illumReserve = Math.max(0, (Number(SAVE.illumReserve)||0) - n);
  R.reservedIlluminate = 0;
  persist();
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
/* One clock to print on every surface. Mirrors Polish.pacedClockMs; the
   local fallback keeps loads without polish.js (the test sandbox) honest. */
function pacedClockMs(base, diffTime, pad){
  if(typeof Polish !== "undefined" && Polish.pacedClockMs) return Polish.pacedClockMs(base, diffTime, pad);
  return Math.round((base * diffTime + (pad == null ? 1500 : pad)) * PACE + FLAT_ADD_MS);
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
/* ------------------------- FRIEND RACE POLLING ------------------------- */
let friendRacePollTimer = null;
let friendRaceInFlight = false;

function startFriendRacePolling(roomCode){
  stopFriendRacePolling();
  if(!roomCode) return;
  const POLL_INTERVAL_MS = 3000;
  const poll = async function(){
    if(friendRaceInFlight || !R || !R.running || R.ended) return;
    friendRaceInFlight = true;
    try {
      if(typeof Cloud !== "undefined" && Cloud.upsertLiveRaceState){
        await Cloud.upsertLiveRaceState(roomCode, {
          score: R.score || 0,
          timeline: { version: 1, samples: R.ghostSamples || [] },
          display_name: (SAVE.profile && SAVE.profile.name) || "Friend",
          question_index: R.qTotal || 0,
          accuracy: R.attempts ? Math.round(R.correct / R.attempts * 100) : 100
        });
      }
      if(typeof Cloud !== "undefined" && Cloud.fetchLiveRaceGhosts){
        await Cloud.fetchLiveRaceGhosts(roomCode);
      }
    } catch(err){
      // Graceful offline fallback
    } finally {
      friendRaceInFlight = false;
    }
  };
  poll();
  friendRacePollTimer = setInterval(poll, POLL_INTERVAL_MS);
}

function stopFriendRacePolling(){
  if(friendRacePollTimer){
    clearInterval(friendRacePollTimer);
    friendRacePollTimer = null;
  }
  friendRaceInFlight = false;
}
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
  } else if(R.mode==="tutorial"){
    $("hud-round").textContent = "First light";
    $("hud-qlab").textContent = "Lesson";
    $("hud-q").textContent = R.tutorial ? (R.tutorial.index+1)+" / "+R.tutorial.total : "1 / 3";
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
  }else if(R.mode==="tutorial"){
    const total = R.tutorial ? R.tutorial.total : 3;
    const current = R.tutorial ? R.tutorial.index : 0;
    el.innerHTML = Array.from({length:total},(_,i)=>{
      const done=i<current, active=i===current;
      return '<div class="act-step'+(done?" done":"")+(active?" current":"")+'"><i style="width:'+(done?100:active?55:0)+'%"></i><span>'+(i+1)+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Tutorial lesson "+(current+1)+" of "+total);
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
const HEART_SVG = '<svg viewBox="0 0 24 24"><path d="M12 21.6l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.7L12 21.6z" fill="url(#hg)"/></svg>';
const HEART_BROKEN = '<svg viewBox="0 0 24 24"><path d="M12 21.6l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.7L12 21.6z" fill="url(#hg)"/><path d="M12.6 4.6l-2.5 4.9 3 1.9-2.4 4.6" fill="none" stroke="#07070a" stroke-width="1.7" stroke-linejoin="round"/></svg>';
const LAMP_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 14.2c0 2.6 1.8 4.6 4 4.6s4-2 4-4.6c0-2.2-1.5-3.3-2.8-4.2V8.2h1.8V6.6H9v1.6h1.8v1.8C9.5 10.9 8 12 8 14.2z" fill="url(#hg)"/><path class="lamp-flame" d="M12 3.2c.7 1.1 1.1 1.8.7 2.7-.5.2-1.2-.4-1.6-1.1.5-.2 1-.8.9-1.6z" fill="#ffe3a6"/></svg>';


/* ------------------------- POWERS ------------------------- */
function illuminateLabel(){
  if(R.currentMechanic === "fade") return R.fadePhase === "memorize" ? "after memory" : "next word";
  if(R.currentMechanic === "strike") return "narrow the zone";
  if(R.currentMechanic === "cloze") return "reveal next word";
  if(R.currentMechanic === "duel") return "reveal KJV cue";
  if(R.currentMechanic === "truefalse") return "reveal judgement";
  if(R.typed) return "hint";
  return "burn 2 wrong";
}

function illuminateBlocked(){
  if(R.currentMechanic === "fade" && R.fadePhase === "memorize") return true;
  if(R.currentMechanic === "strike") return !!(R.strike && R.strike.illuminated);
  if(R.currentMechanic === "cloze") return !!(R.cloze && R.cloze.filled.length >= R.cloze.words.length);
  if(R.currentMechanic === "duel") return !!(R.duel && R.duel.illuminated);
  if(R.currentMechanic === "truefalse") return !!(R.tf && R.tf.illuminated);
  if(R.typed) return R.hintLevel >= 3;
  return false;
}

function renderPowers(){
  const p=R.powers; if(!p) return;
  if(SetPieces.noPowers()){
    $("powers").innerHTML='<button class="pwr spent">Lifelines Offline <em>Special sequence</em></button>';
    return;
  }
  const oil = SAVE.oil||0;
  const memoryLock = R.currentMechanic === "fade" && R.fadePhase === "memorize";
  const illumBlocked = illuminateBlocked();
  const illumDisabled = !p.illum || illumBlocked;
  const selahDisabled = !p.selah || memoryLock;
  $("powers").innerHTML =
    '<button type="button" class="pwr'+(selahDisabled?" spent":"")+'" data-pw="selah"'+(selahDisabled?' disabled="disabled"':'')+' title="Selah adds five seconds to the active phase">Selah <em>+5s ×'+p.selah+'</em></button>'+
    '<button type="button" class="pwr'+(!p.illum?" spent":illumBlocked?" unavailable":"")+'" data-pw="illum"'+(illumDisabled?' disabled="disabled"':'')+' title="Illuminate: '+illuminateLabel()+'">Illuminate <em>'+illuminateLabel()+' ×'+p.illum+'</em></button>'+
    '<button type="button" class="pwr oil-buy'+(oil>=((typeof Meta!=="undefined"&&Meta.OIL_COST.selah)||8)?"":" spent")+'" data-pw="oil-selah">Anoint Selah <em>'+oil+' oil</em></button>'+
    '<button class="pwr passive'+(p.wind?"":" spent")+'" tabindex="-1">Second Wind <em>Automatic ×'+p.wind+'</em></button>';
  $("powers").querySelectorAll("[data-pw]").forEach(b=>{
    b.addEventListener("click", ()=>usePower(b.dataset.pw));
  });
  if(typeof syncTypedPowerButtons === "function") syncTypedPowerButtons();
}

function renderQuickRewards(){
  const host = $("quick-rewards");
  if(!host) return;
  const goals = R.quickRewards || [];
  if(!goals.length || !R.q && !R.running){ host.innerHTML = ""; return; }
  host.innerHTML = goals.map(g=>{
    const p = (typeof QuickRewards !== "undefined") ? QuickRewards.progress(g, R) : {value:0,target:g.target,complete:false};
    const announced = R.quickRewardAnnounced && R.quickRewardAnnounced.has(g.id);
    const cls = p.complete ? " done" : announced ? " ready" : "";
    const current = g.type === "clean" || g.type === "noPower"
      ? (p.complete ? "READY" : "RUN END")
      : p.value + "/" + p.target;
    const icon = g.group === "chain" ? "🔥" : g.group === "precision" ? "⚡" : g.group === "mastery" ? "✨" : "🛡️";
    return '<div class="quick-reward'+cls+'" title="'+esc(g.name)+': '+esc(g.desc)+' ('+esc(quickRewardPayout(g))+')">'+
      '<span class="qr-tag">'+icon+'</span>'+
      '<b>'+esc(g.name)+'</b>'+
      '<span class="qr-val">'+esc(current)+'</span>'+
      '<i>'+esc(quickRewardPayout(g))+'</i></div>';
  }).join("");
}

function quickRewardPayout(g){
  if(!g) return "";
  return "+"+(g.xp||0)+" XP"+
    (g.oil ? " Â· +"+g.oil+" oil" : "")+
    (g.illuminate ? " Â· +"+g.illuminate+" Illuminate" : "");
}

function updateQuickRewards(){
  if(typeof QuickRewards === "undefined" || !R.quickRewards) return;
  let changed = false;
  R.quickRewards.forEach(g=>{
    if(QuickRewards.progress(g, R).complete && !R.quickRewardAnnounced.has(g.id)){
      R.quickRewardAnnounced.add(g.id);
      changed = true;
      if(typeof Snd !== "undefined" && Snd.power) Snd.power();
      if(typeof toast === "function") toast("Quick reward ready — "+g.name+" banks at run end");
    }
  });
  renderQuickRewards();
}

function usePower(kind){
  if(R.paused || R.locked) return;
  const armed = R.running || (!!R.tTotal && !R.ended);
  if(!armed) return;
  if(SetPieces.noPowers()){ toast("Lifelines are offline for this sequence"); return; }
  if(R.currentMechanic === "fade" && R.fadePhase === "memorize" && (kind === "selah" || kind === "illum")){
    toast("Powers become available after the memory phase");
    return;
  }
  if(kind==="selah" && R.powers.selah){
    R.powers.selah--; R.usedPower=true; R.qUsedPower=true; R.powersSpent++; R.tEnd += 5000; R.tTotal += 5000;
    R.pendingSelah = (R.pendingSelah||0) + 5000;
    Snd.power();
    if(Snd.selah) Snd.selah(5000);
    doFlash("gold"); toast("Selah — five seconds granted");
  } else if(kind==="illum" && R.powers.illum){
    if(!R.q){ toast("Illuminate needs a verse on the stage"); return; }
    if(R.currentMechanic === "fade" && R.fadePhase === "memorize"){
      toast("Illuminate becomes available after the memory phase");
      return;
    }
    let handled = false;
    if(R.currentMechanic === "strike" && typeof illuminateStrike === "function"){
      handled = illuminateStrike();
    } else if(R.currentMechanic === "cloze" && typeof illuminateCloze === "function"){
      handled = illuminateCloze();
    } else if(R.currentMechanic === "duel" && typeof illuminateDuel === "function"){
      handled = illuminateDuel();
    } else if(R.currentMechanic === "truefalse" && typeof illuminateTrueFalse === "function"){
      handled = illuminateTrueFalse();
    } else if(R.currentMechanic === "fade" && typeof illuminateAssembly === "function"){
      handled = illuminateAssembly();
    } else if(R.typed){
      if(R.hintLevel >= 3){ toast("Nothing further to illuminate"); return; }
      R.powers.illum--; R.usedPower=true; R.qUsedPower=true; R.powersSpent++;
      typedHint();
      Snd.power(); doFlash("violet");
      toast(R.hintLevel===1 ? "Illuminate — the shape of the words"
          : R.hintLevel===2 ? "Illuminate — first letters" : "Illuminate — the first word");
      renderPowers();
      return;
    }
    if(handled){
      R.powers.illum--; R.usedPower=true; R.qUsedPower=true; R.powersSpent++;
      Snd.power(); doFlash("violet"); renderPowers();
      return;
    }
    const wrong = answerButtons().filter(b=>b.dataset.val!==R.q.a && !b.classList.contains("burn"));
    if(wrong.length<2) return;
    R.powers.illum--; R.usedPower=true; R.qUsedPower=true; R.powersSpent++;
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
/* Correct answers chain at a readable pace — the old 650/800ms snap was
   too quick to register the previous verdict, so every chain beat now
   holds a full 1.5s. Wrong answers still keep the longer JUDGE_MS teach
   pause; the hotter the streak, the tighter the snap. */
function correctAdvance(){
  if(SetPieces.autoLock()) return 720;
  return (R.streak >= MOMENTUM_STEPS[2]) ? 1400 : 1500;
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
  /* ===== Beat: OVERDRIVE SURGE (arming) =====
     Shockwave from the meter + sub hit, layered under the existing gold
     flash. One-shot; the choice overlay carries the animation. */
  if(!SAVE.set.reduced){
    el.classList.remove("od-ready"); void el.offsetWidth;
    el.classList.add("od-ready");
    setTimeout(function(){ el.classList.remove("od-ready"); }, 600);
  }
  Snd.odReady();
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
    /* ===== Beat: OVERDRIVE SURGE (riding) =====
       Ember drift along the stage edges for as long as the ride lives. */
    R.overdriveRide = true;
    document.body.classList.add("ember-ride");
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
    document.body.classList.remove("setpiece-active","overdrive","pressure-3","pressure-5","pressure-7","retreat");
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
  if(R.currentMechanic === "truefalse"){
    if(k === "t" || k === "arrowleft" || k === "1"){
      e.preventDefault();
      const trueBtn = $("tf-true"); if(trueBtn) trueBtn.click();
      return;
    }
    if(k === "f" || k === "arrowright" || k === "2"){
      e.preventDefault();
      const falseBtn = $("tf-false"); if(falseBtn) falseBtn.click();
      return;
    }
  }
  if(R.currentMechanic === "duel"){
    if(k === "arrowleft" || k === "a" || k === "1"){
      e.preventDefault();
      const leftBtn = $("duel-left"); if(leftBtn) leftBtn.click();
      return;
    }
    if(k === "arrowright" || k === "d" || k === "2"){
      e.preventDefault();
      const rightBtn = $("duel-right"); if(rightBtn) rightBtn.click();
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
  const confirmBtn = $("confirm-answer");
  if(confirmBtn){
    confirmBtn.addEventListener("click", function(){
      if(R.typed && typeof confirmTyped === "function") confirmTyped();
      else if(typeof confirmAnswer === "function") confirmAnswer();
    });
  }
  /* Overdrive ride-or-bank choice buttons. */
  const odRide = $("od-ride"), odBank = $("od-bank");
  if(odRide) odRide.addEventListener("click", ()=>{ Snd.ui(); resolveOverdrive("ride"); });
  if(odBank) odBank.addEventListener("click", ()=>{ Snd.ui(); resolveOverdrive("bank"); });

  /* Cloud is optional. Lazy-load SDK; never block boot. */
  if(typeof Cloud!=="undefined" && Cloud.configured()){
    Cloud.on("onSync", function(){
      updateCloudChip();
      if(currentView==="settings") renderSettings();
    });
    Cloud.on("onError", function(){
      updateCloudChip();
      if(currentView==="settings") renderSettings();
    });
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

  document.addEventListener("visibilitychange", function(){
    if(document.hidden){
      const v = $("hall-bg");
      if(v && typeof v.pause === "function") try{ v.pause(); }catch(e){}
    } else {
      if(typeof applySettings === "function") applySettings();
    }
  });

  if(introAllowed()){
    go("intro");
    return;
  }
  playBootSequence({fast:false});
})();
