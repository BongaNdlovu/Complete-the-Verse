/* ==================================================================
   EDITION — manages KJV and NKJV editions of Complete the Verse.
   Shares engine, map progress, and mechanics.
   Isolates verse memory, Daily records, and Word Tablets holds.
   ================================================================== */
var Edition = (function(){
  var currentEdition = "kjv";

  function replaceArray(target, next){
    if(!target || !next) return;
    target.length = 0;
    next.forEach(function(item){ target.push(item); });
  }

  // Backing stores for editions
  var STORES = {
    kjv: {
      verses: [],
      passages: [],
      tfClaims: [],
      notes: {},
      tablets: null,
      quotes: {},
      beat: null,
      tutorial: []
    },
    nkjv: {
      verses: [],
      passages: [],
      tfClaims: [],
      notes: {},
      tablets: null,
      quotes: {},
      beat: null,
      tutorial: []
    }
  };

  var initialized = false;

  function copyList(list){
    return (list || []).map(function(x){ return Object.assign({}, x); });
  }

  function snapshotKjv(){
    if(typeof VERSES !== "undefined") STORES.kjv.verses = copyList(VERSES);
    if(typeof PASSAGES !== "undefined") STORES.kjv.passages = copyList(PASSAGES);
    if(typeof TF_CLAIMS !== "undefined") STORES.kjv.tfClaims = copyList(TF_CLAIMS);
    if(typeof VERSE_NOTES !== "undefined") STORES.kjv.notes = Object.assign({}, VERSE_NOTES);
    if(typeof TUTORIAL_QUESTIONS !== "undefined") STORES.kjv.tutorial = copyList(TUTORIAL_QUESTIONS);
    if(typeof Beat !== "undefined") {
      STORES.kjv.beat = {
        questions: copyList(Beat.questions),
        cinemaA: copyList(Beat.cinemaA),
        cinemaB: copyList(Beat.cinemaB)
      };
    }
    if(typeof Tablets !== "undefined" && Tablets.chapters) {
      STORES.kjv.tablets = {
        blankS: Tablets.BLANK_S,
        holdsToOpen: Tablets.HOLDS_TO_OPEN,
        chapters: copyList(Tablets.chapters),
        canonIds: (Tablets.canon || []).map(function(c){ return c.id; }),
        hallIds: (Tablets.hall || []).map(function(c){ return c.id; }),
        moreIds: (Tablets.more || []).map(function(c){ return c.id; })
      };
    }
  }

  function loadNkjvGlobals(){
    if(typeof NKJV_VERSES !== "undefined") STORES.nkjv.verses = NKJV_VERSES;
    if(typeof NKJV_PASSAGES !== "undefined") STORES.nkjv.passages = NKJV_PASSAGES;
    if(typeof NKJV_TF_CLAIMS !== "undefined") STORES.nkjv.tfClaims = NKJV_TF_CLAIMS;
    if(typeof NKJV_VERSE_NOTES !== "undefined") STORES.nkjv.notes = NKJV_VERSE_NOTES;
    if(typeof NKJV_TABLETS !== "undefined") STORES.nkjv.tablets = NKJV_TABLETS;
    if(typeof NKJV_QUOTES !== "undefined") STORES.nkjv.quotes = NKJV_QUOTES;
    if(typeof NKJV_BEAT !== "undefined") STORES.nkjv.beat = NKJV_BEAT;
    if(typeof NKJV_TUTORIAL_QUESTIONS !== "undefined") STORES.nkjv.tutorial = NKJV_TUTORIAL_QUESTIONS;
  }

  function initStores(){
    if(initialized) return;
    initialized = true;
    snapshotKjv();
    loadNkjvGlobals();
  }

  function getEdition(){
    if(typeof SAVE !== "undefined" && SAVE.set && SAVE.set.translation) {
      return SAVE.set.translation;
    }
    return currentEdition || "kjv";
  }

  function translationTag(){
    return getEdition() === "nkjv" ? "NKJV" : "KJV";
  }

  function translationName(){
    return getEdition() === "nkjv" ? "New King James Version" : "King James Version";
  }

  function registerNkjvStore(data){
    if(!data) return;
    if(data.verses) STORES.nkjv.verses = data.verses;
    if(data.passages) STORES.nkjv.passages = data.passages;
    if(data.tfClaims) STORES.nkjv.tfClaims = data.tfClaims;
    if(data.notes) STORES.nkjv.notes = data.notes;
    if(data.tablets) STORES.nkjv.tablets = data.tablets;
    if(data.quotes) STORES.nkjv.quotes = data.quotes;
    if(data.beat) STORES.nkjv.beat = data.beat;
    if(data.tutorial) STORES.nkjv.tutorial = data.tutorial;
    if(currentEdition === "nkjv") activateEdition("nkjv");
  }

  // The road keeps its Scripture inline: each site and vignette carries the
  // verse it displays, so swapping editions means rewriting those fields.
  // The KJV wording is copied into the KJV store once, on the first switch,
  // and both stores are then authoritative.
  function snapshotQuotes(){
    if(STORES.kjv.quotesReady) return;
    STORES.kjv.quotesReady = true;
    if(typeof SITES === "undefined") return;
    SITES.forEach(function(site){
      if(site.quoteRef) STORES.kjv.quotes[site.id] = site.quote;
    });
    if(typeof VIGNETTES !== "undefined"){
      Object.keys(VIGNETTES).forEach(function(id){
        var vig = VIGNETTES[id];
        if(vig && vig.ref) STORES.kjv.quotes["vig:" + id] = vig.quote;
      });
    }
  }

  function applyQuotes(store){
    if(typeof SITES === "undefined" || !store) return;
    SITES.forEach(function(site){
      var text = store[site.id];
      if(text) site.quote = text;
    });
    if(typeof VIGNETTES !== "undefined"){
      Object.keys(VIGNETTES).forEach(function(id){
        var text = store["vig:" + id];
        if(text && VIGNETTES[id]) VIGNETTES[id].quote = text;
      });
    }
  }

  function applyVerses(store, isNkjv){
    if(typeof VERSES === "undefined" || !store.verses || !store.verses.length) return;
    var nextVerses = store.verses.map(function(v){
      var item = Object.assign({}, v);
      var baseId = (typeof verseId === "function") ? verseId(item) : (item.id || (item.r + "~" + item.a));
      item.id = isNkjv ? ("nkjv~" + baseId.replace(/^nkjv~/, "")) : baseId.replace(/^nkjv~/, "");
      return item;
    });
    replaceArray(VERSES, nextVerses);
    if(typeof BY_ID !== "undefined") {
      Object.keys(BY_ID).forEach(function(k){ delete BY_ID[k]; });
    }
    if(typeof BY_TIER !== "undefined") {
      Object.keys(BY_TIER).forEach(function(k){ BY_TIER[k].length = 0; });
    }
    VERSES.forEach(function(v){
      if(typeof BY_ID !== "undefined") BY_ID[v.id] = v;
      if(typeof BY_TIER !== "undefined" && BY_TIER[v.t]) BY_TIER[v.t].push(v);
    });
  }

  function applyPassages(store){
    if(typeof PASSAGES === "undefined" || !store.passages || !store.passages.length) return;
    replaceArray(PASSAGES, store.passages);
    PASSAGES.forEach(function(p){
      if(!p.id) p.id = "P~" + String(p.r).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      p.blanks = p.parts ? p.parts.filter(function(x){ return typeof x !== "string"; }) : p.blanks;
    });
  }

  function applyNotes(store){
    if(typeof VERSE_NOTES === "undefined" || !store.notes) return;
    Object.keys(VERSE_NOTES).forEach(function(k){ delete VERSE_NOTES[k]; });
    Object.keys(store.notes).forEach(function(k){ VERSE_NOTES[k] = store.notes[k]; });
  }

  function applyBeat(store){
    if(typeof Beat === "undefined" || !store.beat) return;
    if(store.beat.questions && Beat.questions) replaceArray(Beat.questions, store.beat.questions);
    if(store.beat.cinemaA && Beat.cinemaA) replaceArray(Beat.cinemaA, store.beat.cinemaA);
    if(store.beat.cinemaB && Beat.cinemaB) replaceArray(Beat.cinemaB, store.beat.cinemaB);
  }

  function syncDaily(key){
    if(typeof SAVE === "undefined") return;
    if(!SAVE.dailyByEdition) {
      SAVE.dailyByEdition = {
        kjv: Object.assign({}, SAVE.daily || { date: "", score: 0 }),
        nkjv: { date: "", score: 0 }
      };
    }
    if(!SAVE.dailyByEdition[key]) SAVE.dailyByEdition[key] = { date: "", score: 0 };
    SAVE.daily = SAVE.dailyByEdition[key];
    if(!SAVE.best) SAVE.best = {};
    if(!SAVE.best.dailyByEdition) {
      SAVE.best.dailyByEdition = { kjv: SAVE.best.daily || 0, nkjv: 0 };
    }
    if(SAVE.best.dailyByEdition[key] === undefined) SAVE.best.dailyByEdition[key] = 0;
    SAVE.best.daily = SAVE.best.dailyByEdition[key];
  }

  function activateEdition(key){
    initStores();
    key = (key === "nkjv") ? "nkjv" : "kjv";
    currentEdition = key;
    if(typeof SAVE !== "undefined" && SAVE.set) {
      SAVE.set.translation = key;
    }

    var store = STORES[key];
    var isNkjv = (key === "nkjv");

    applyVerses(store, isNkjv);
    applyPassages(store);
    if(typeof TF_CLAIMS !== "undefined" && store.tfClaims && store.tfClaims.length) {
      replaceArray(TF_CLAIMS, store.tfClaims);
    }
    applyNotes(store);
    if(typeof Tablets !== "undefined" && Tablets.applyShared && store.tablets) {
      Tablets.applyShared(store.tablets);
    }
    snapshotQuotes();
    applyQuotes(store.quotes);
    applyBeat(store);
    if(typeof TUTORIAL_QUESTIONS !== "undefined" && store.tutorial && store.tutorial.length) {
      replaceArray(TUTORIAL_QUESTIONS, store.tutorial);
    }
    syncDaily(key);
    updateDomLabels();
    return key;
  }

  function updateDomLabels(){
    if(typeof document === "undefined") return;
    var tag = translationTag();
    var name = translationName();

    // Update HUD badges
    var badges = document.querySelectorAll("#v-play .kjv b, .kjv b, .kjv");
    badges.forEach(function(el){
      if(el.tagName === "B" || el.querySelector("b") === null) {
        el.textContent = tag;
      }
    });

    // The verse-stage kicker is drawn from a CSS ::before; it reads the
    // element's data-kick so it can follow the edition.
    var stage = document.querySelector(".verse-stage");
    if(stage) stage.setAttribute("data-kick", tag === "NKJV" ? "NEW KING JAMES VERSION" : "KING JAMES VERSION");

    // Update menu kick if present
    var kick = document.getElementById("menu-edition-kick") || document.querySelector("#v-menu .menu-brand .kick");
    if(kick) {
      kick.innerHTML = name + " &nbsp;·&nbsp; 66 Books &nbsp;·&nbsp; One final answer";
    }

    // Update boot ref if present
    var bootRef = document.querySelector(".boot-ref");
    if(bootRef) {
      bootRef.textContent = "Hebrews 4:12 · " + (tag === "NKJV" ? "New King James" : "King James");
    }
  }

  // Absorb deferred packs: only into KJV store, never into NKJV
  function absorbDeferred(pack){
    initStores();
    if(!pack || !pack.length) return 0;
    var n = 0;
    pack.forEach(function(v){
      if(v.b === "Psalm") v.b = "Psalms";
      // Add to KJV backing store
      STORES.kjv.verses.push(Object.assign({}, v));
      n++;
    });

    // If KJV is currently active, re-apply so live views update
    if(getEdition() === "kjv") {
      activateEdition("kjv");
    }
    return n;
  }

  function selectEdition(key){
    key = (key === "nkjv") ? "nkjv" : "kjv";
    if(typeof SAVE !== "undefined") {
      if(!SAVE.set) SAVE.set = {};
      SAVE.set.translation = key;
      SAVE.set.translationChosen = true;
      if(typeof persist === "function") persist();
    }
    activateEdition(key);
    if(typeof enterCoffeePath === "function") {
      enterCoffeePath();
    } else if(typeof showTutorialIfNeeded === "function" && typeof SAVE !== "undefined" && !SAVE.set.tutorialSeen) {
      showTutorialIfNeeded(false);
    } else if(typeof go === "function") {
      go("menu");
    }
  }

  return {
    getEdition: getEdition,
    activateEdition: activateEdition,
    selectEdition: selectEdition,
    translationTag: translationTag,
    translationName: translationName,
    registerNkjvStore: registerNkjvStore,
    absorbDeferred: absorbDeferred,
    updateDomLabels: updateDomLabels,
    _stores: STORES
  };
})();

// Global convenience bindings
function translationTag(){
  return (typeof Edition !== "undefined" && Edition.translationTag) ? Edition.translationTag() : "KJV";
}
function translationName(){
  return (typeof Edition !== "undefined" && Edition.translationName) ? Edition.translationName() : "King James Version";
}

if(typeof module !== "undefined" && module.exports){
  module.exports = { Edition: Edition, translationTag: translationTag, translationName: translationName };
}
