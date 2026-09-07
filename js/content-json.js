var ContentJson = (function(){
  function canFetch(){
    return typeof fetch === "function" &&
      typeof location !== "undefined" &&
      (location.protocol === "http:" || location.protocol === "https:");
  }

  function replaceArray(target, next){
    if(!target || !next) return;
    target.length = 0;
    next.forEach(function(item){ target.push(item); });
  }

  function applyVerses(data){
    if(!data || !data.verses || typeof VERSES === "undefined") return;
    replaceArray(VERSES, data.verses);
    if(typeof PASSAGES !== "undefined" && data.passages) replaceArray(PASSAGES, data.passages);
    if(typeof TF_CLAIMS !== "undefined" && data.tfClaims) replaceArray(TF_CLAIMS, data.tfClaims);
    if(typeof VERSE_NOTES !== "undefined" && data.notes){
      Object.keys(VERSE_NOTES).forEach(function(k){ delete VERSE_NOTES[k]; });
      Object.keys(data.notes).forEach(function(k){ VERSE_NOTES[k] = data.notes[k]; });
    }
    if(typeof BY_ID !== "undefined"){
      Object.keys(BY_ID).forEach(function(k){ delete BY_ID[k]; });
    }
    if(typeof BY_TIER !== "undefined"){
      Object.keys(BY_TIER).forEach(function(k){ BY_TIER[k].length = 0; });
    }
    VERSES.forEach(function(v){
      if(!v.id && typeof verseId === "function") v.id = verseId(v);
      if(typeof BY_ID !== "undefined") BY_ID[v.id] = v;
      if(typeof BY_TIER !== "undefined" && BY_TIER[v.t]) BY_TIER[v.t].push(v);
    });
    if(typeof PASSAGES !== "undefined"){
      PASSAGES.forEach(function(p){
        if(!p.id) p.id = "P~" + String(p.r).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        p.blanks = p.parts ? p.parts.filter(function(x){ return typeof x !== "string"; }) : p.blanks;
      });
    }
  }

  function applySites(data){
    if(!data) return;
    if(typeof SITES !== "undefined" && data.sites) replaceArray(SITES, data.sites);
    if(typeof ARCS !== "undefined" && data.arcs) replaceArray(ARCS, data.arcs);
    if(typeof ROUTES !== "undefined" && data.routes) replaceArray(ROUTES, data.routes);
    if(typeof EMPIRES !== "undefined" && data.empires){
      if(Array.isArray(EMPIRES) && Array.isArray(data.empires)) replaceArray(EMPIRES, data.empires);
      else Object.keys(data.empires).forEach(function(k){ EMPIRES[k] = data.empires[k]; });
    }
    if(typeof VIGNETTES !== "undefined" && data.vignettes){
      Object.keys(VIGNETTES).forEach(function(k){ delete VIGNETTES[k]; });
      Object.keys(data.vignettes).forEach(function(k){ VIGNETTES[k] = data.vignettes[k]; });
    }
    if(typeof HOME_VIEW !== "undefined" && data.homeView){
      HOME_VIEW.center = data.homeView.center;
      HOME_VIEW.zoom = data.homeView.zoom;
    }
  }

  function applyTablets(data){
    if(typeof Tablets !== "undefined" && Tablets.applyShared) Tablets.applyShared(data);
  }

  function load(){
    if(!canFetch()) return null;
    return Promise.all([
      fetch("shared/content/verses.json").then(function(r){ if(!r.ok) throw new Error("verses"); return r.json(); }),
      fetch("shared/content/sites.json").then(function(r){ if(!r.ok) throw new Error("sites"); return r.json(); }),
      fetch("shared/content/tablets.json").then(function(r){ if(!r.ok) throw new Error("tablets"); return r.json(); })
    ]).then(function(parts){
      applyVerses(parts[0]);
      applySites(parts[1]);
      applyTablets(parts[2]);
      return true;
    }).catch(function(){
      return false;
    });
  }

  return {
    applyVerses: applyVerses,
    applySites: applySites,
    applyTablets: applyTablets,
    load: load
  };
})();
if(typeof module !== "undefined" && module.exports){
  module.exports = { ContentJson: ContentJson };
}
