/* ==================================================================
   SAVE — save schema, local persistence, migrations, and corrupt recovery.

   Owns DEFAULT_SAVE, load, persist, and migrations.
   Must not own run state, routing, or mode logic.
   ================================================================== */

const SAVE_KEY = "ctv_save_v3";
const LEGACY_SAVE_KEY = "ctv_save_v2";
const DEFAULT_SAVE = {
  v:3, xp:0, oil:0, illumReserve:0, runs:0,
  best:{trial:0, endless:0, daily:0, dailyByEdition:{kjv:0, nkjv:0}, practice:0, recall:0, pilgrimage:0, "pilgrim-recall":0, blitz:0, tablets:0},
  seals:[],
  life:{correct:0, attempts:0, bestStreak:0, sdBest:0, endlessBest:0, dailyDone:0, perfectActs:0,
        typedExact:0, typedAttempts:0, reviewsDone:0, sitesCleared:0, arcsCleared:0, blitzBest:0,
        oilSpent:0, oilEarned:0, quickRewards:0, quickRewardXP:0, quickRewardOil:0, illumRewards:0,
        beatGoliathHeld:false, tabletHolds:0},
  tablets:{psalm23:{best:0,held:false}, psalm91:{best:0,held:false}, john1:{best:0,held:false}},
  books:{}, verse:{}, srs:{}, board:[], journal:[],
  ghosts:{pilgrimage:null, pilgrimageBySite:{}, trial:null, blitz:null},
  daily:{date:"", score:0},
  dailyByEdition:{kjv:{date:"", score:0}, nkjv:{date:"", score:0}},
  /* Consecutive days with a recorded Daily run. */
  dailyStreak:{count:0, lastDate:"", best:0, celebrated:0},
  /* Announcement cards the player has dismissed. */
  messagesSeen:[],
  /* A Daily whose submit failed — retried until the board has it. */
  pendingDaily:null,
  /* Habit streak tracking across calendar days */
  habit:{count:0, lastDate:"", lastDay:0, best:0, history:{}},
  /* The road from Ur to Patmos. Shape is owned by pilgrimage.js —
     blankProgress() there is the authority — and stored here so a
     journey survives a reload. */
  pilgrim:{sites:{}, lastPlayed:"", started:0, usedIds:[]},
  /* Relics unlocked by first site clear. Shape owned by artifacts.js. */
  artifacts:{unlocked:{}, seen:{}},
  set:{music:0.45, sfx:0.7, musicMute:false, sfxMute:false, quality:"high", qualityLocked:false, motion:"full", reduced:false, shake:true, voice:true, diff:"disciple",
       tutorialDone:false, tutorialSeen:false, tabletsTutorialDone:false, introPlayed:false, liveWeather:true, coldOpenDone:false, urPrologueDone:false, quiet:false, contrast:false, haptics:true,
       singleTap:true,
       translation:"kjv", translationChosen:false,
       character:"amina", scholarId:"amina", playerName:"", profileDone:false, tabletStone:"sandstone", tabletTrial:false,
       vkb:false,
       noticeBox:{},
       /* legacy keys kept so old saves merge cleanly */
       characterDone:false}
};

function mergeNoticeBoxSave(s){
  const box = Object.assign({}, (s && s.set && s.set.noticeBox) || {});
  if(s && s.set && s.set.ackNoticeId && !box[s.set.ackNoticeId]){
    box[s.set.ackNoticeId] = "read";
  }
  const keys = Object.keys(box);
  if(keys.length > 80){
    const pruned = {};
    keys.slice(-80).forEach(function(k){ pruned[k] = box[k]; });
    return pruned;
  }
  return box;
}

function mergeTabletsSave(s){
  const t = (s && s.tablets) || {};
  const ids = (typeof Tablets !== "undefined" && Tablets.chapters)
    ? Tablets.chapters.map(function(c){ return c.id; })
    : ["psalm23","psalm91","john1"];
  const out = {};
  Object.keys(t).forEach(function(k){
    out[k] = Object.assign({best:0,held:false}, t[k] || {});
  });
  ids.forEach(function(id){
    if(!out[id]) out[id] = Object.assign({best:0,held:false}, t[id] || {});
  });
  return out;
}

function mergeBestSave(s){
  const mergedBest = Object.assign({}, DEFAULT_SAVE.best, s.best||{});
  mergedBest.dailyByEdition = Object.assign({kjv: (s && s.best && s.best.daily) || 0, nkjv: 0}, (s && s.best && s.best.dailyByEdition) || {});
  return mergedBest;
}

/* Only a pending daily that still carries its run numbers is kept. */
function normalizePendingDaily(v){
  return (v && v.payload) ? v : null;
}

function mergeLoadedSave(s){
  if(s && s.set && typeof s.set.translation === "undefined"){
    s.set.translation = "kjv";
    s.set.translationChosen = true;
  }
  const mergedSet = Object.assign({}, DEFAULT_SAVE.set, (s && s.set) || {});
  mergedSet.noticeBox = mergeNoticeBoxSave(s);
  return Object.assign(JSON.parse(JSON.stringify(DEFAULT_SAVE)), s, {
    v:3,
    best:mergeBestSave(s),
    life:Object.assign({}, DEFAULT_SAVE.life, s.life||{}),
    set:mergedSet,
    daily:Object.assign({}, DEFAULT_SAVE.daily, s.daily||{}),
    dailyByEdition:Object.assign({kjv:(s && s.daily)||{date:"",score:0}, nkjv:{date:"",score:0}}, (s && s.dailyByEdition)||{}),
    dailyStreak:Object.assign({count:0, lastDate:"", best:0, celebrated:0}, s.dailyStreak||{}),
    messagesSeen: Array.isArray(s.messagesSeen) ? s.messagesSeen.slice() : [],
    pendingDaily: normalizePendingDaily(s.pendingDaily),
    srs:Object.assign({}, s.srs||{}),
    habit:Object.assign({count:0, lastDate:"", lastDay:0, best:0, history:{}}, s.habit||{}),
    pilgrim: mergePilgrimSave(s),
    artifacts: (typeof Artifacts !== "undefined")
      ? Artifacts.normalize(s.artifacts)
      : Object.assign({unlocked:{}, seen:{}}, s.artifacts||{}),
    journal: Array.isArray(s.journal) ? s.journal.slice(0, 40) : [],
    ghosts: mergeGhostsSave(s),
    tablets: mergeTabletsSave(s)
  });
}

function mergePilgrimSave(s){
  return Object.assign({sites:{}, lastPlayed:"", started:0, usedIds:[]}, s.pilgrim||{}, {
    sites:Object.assign({}, (s.pilgrim && s.pilgrim.sites) || {}),
    usedIds: Array.isArray(s.pilgrim && s.pilgrim.usedIds) ? s.pilgrim.usedIds.slice() : []
  });
}

function mergeGhostsSave(s){
  return Object.assign({pilgrimage:null, pilgrimageBySite:{}, trial:null, blitz:null}, s.ghosts||{}, {
    pilgrimageBySite: Object.assign({}, (s.ghosts && s.ghosts.pilgrimageBySite) || {})
  });
}

function recoverCorruptSave(e){
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

function load(){
  try{
    if(typeof localStorage === "undefined") return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    let raw = localStorage.getItem(SAVE_KEY), migrating = false;
    if(!raw){ raw = localStorage.getItem(LEGACY_SAVE_KEY); migrating = !!raw; }
    if(!raw) return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    const s = JSON.parse(raw);
    const out = mergeLoadedSave(s);
    if(migrating) migrateV2(out, s);
    migrateProfile(out);
    migrateBlitzUnits(out);
    return out;
  }catch(e){
    return recoverCorruptSave(e);
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
  const today = (typeof SRS !== "undefined" && SRS.dayNumber) ? SRS.dayNumber() : 0;
  Object.keys(moved).forEach(id => {
    const st = moved[id];
    if(!st || !st.a) return;
    const card = (typeof SRS !== "undefined" && SRS.freshCard) ? SRS.freshCard() : { reps: 0, ivl: 1, ease: 250, due: today, lapses: 0, last: today };
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
  if(out.set.diff !== "disciple" && out.set.diff !== "watchman") out.set.diff = "disciple";
  const id = out.set.character;
  const known = typeof Characters !== "undefined" && Characters.byId(id);
  if(!known){
    out.set.character = (typeof Characters !== "undefined" && Characters.defaultScholarId()) || "amina";
    out.set.scholarId = out.set.character;
  } else if(Characters.isScholar(known)){
    out.set.scholarId = known.id;
  } else {
    if(!out.set.scholarId) out.set.scholarId = (typeof Characters !== "undefined" && Characters.defaultScholarId()) || "amina";
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

var SAVE = load();
if(typeof window !== "undefined"){
  window.SAVE = SAVE;
  window.DEFAULT_SAVE = DEFAULT_SAVE;
  window.load = load;
  window.persist = persist;
  window.mergeLoadedSave = mergeLoadedSave;
  window.mergeNoticeBoxSave = mergeNoticeBoxSave;
  window.mergeTabletsSave = mergeTabletsSave;
  window.mergeBestSave = mergeBestSave;
  window.recoverCorruptSave = recoverCorruptSave;
  window.migrateV2 = migrateV2;
  window.migrateProfile = migrateProfile;
  window.migrateBlitzUnits = migrateBlitzUnits;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SAVE_KEY, LEGACY_SAVE_KEY, DEFAULT_SAVE, load, persist,
    mergeLoadedSave, mergeNoticeBoxSave, mergeTabletsSave, mergeBestSave,
    recoverCorruptSave, migrateV2, migrateProfile, migrateBlitzUnits
  };
}
