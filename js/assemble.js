/* ==================================================================
   ASSEMBLE — drag (or tap) the missing phrase into order.

   Harder than four options, easier than free typing. Pure functions so
   the bank, the grader and the tests share one set of rules. The DOM
   lives in typed.js; this file must not touch it.
   ================================================================== */
var Assemble = (function(){

  var PAD = ["selah","amen","covenant","mercy","altar","host"," ram","forever","truth","zion"].map(function(w){ return w.trim(); });

  function words(s){
    return String(s == null ? "" : s).trim().split(/\s+/).filter(Boolean);
  }

  function keyOf(w){
    return String(w || "").toLowerCase().replace(/[^a-z0-9']/g, "");
  }

  function fakeCount(n){
    if(n <= 2) return 2;
    return 3;
  }

  function distractorWords(distractors, taken){
    var out = [];
    (distractors || []).forEach(function(d){
      words(d).forEach(function(w){
        var k = keyOf(w);
        if(!k || taken[k]) return;
        if(out.indexOf(w) < 0) out.push(w);
      });
    });
    return out;
  }

  function shuffle(arr, rng){
    var a = arr.slice(), i, j, t;
    rng = rng || Math.random;
    for(i = a.length - 1; i > 0; i--){
      j = Math.floor(rng() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Build a bank: every target word plus 2–3 fakes drawn from the
     verse's own distractors (so the fakes are wrong about Scripture,
     not random English). Deterministic when `rng` is. */
  function build(answer, distractors, rng){
    var target = words(answer);
    var taken = {};
    target.forEach(function(w){ taken[keyOf(w)] = 1; });
    var fakes = distractorWords(distractors, taken);
    var need = fakeCount(target.length);
    var i = 0;
    while(fakes.length < need && i < PAD.length){
      var p = PAD[i++];
      if(!taken[keyOf(p)] && fakes.indexOf(p) < 0) fakes.push(p);
    }
    fakes = shuffle(fakes, rng).slice(0, need);
    var bank = target.map(function(w, idx){
      return { id: "t" + idx, word: w, dest: idx };
    }).concat(fakes.map(function(w, idx){
      return { id: "f" + idx, word: w, dest: -1 };
    }));
    return {
      target: target,
      bank: shuffle(bank, rng),
      placed: target.map(function(){ return null; })
    };
  }

  /* Fade-to-Memory reconstructs the complete passage.  The challenge is
     ordering every word, so adding distractors would make punctuation and
     long verses noisy rather than clearer.  Keep this separate from build()
     so the normal Assemble mode retains its authored false-word bank. */
  function buildExact(answer, rng){
    var target = words(answer);
    var bank = target.map(function(w, idx){
      return { id: "t" + idx, word: w, dest: idx };
    });
    return {
      target: target,
      bank: shuffle(bank, rng),
      placed: target.map(function(){ return null; })
    };
  }

  function tileById(state, id){
    var i;
    for(i = 0; i < state.bank.length; i++) if(state.bank[i].id === id) return state.bank[i];
    return null;
  }

  function isLocked(state, slot){
    return !!(state && state.locked && state.locked[slot]);
  }

  /* Fade rebuild: gift 2–3 correct words already locked in their slots. */
  function giftLocked(state, rng){
    if(!state || !state.target || !state.target.length) return state;
    var n = state.target.length;
    var count = n <= 2 ? n : (Math.floor((rng || Math.random)() * 2) + 2);
    var indices = state.target.map(function(_, i){ return i; });
    indices = shuffle(indices, rng).slice(0, count);
    state.locked = {};
    indices.forEach(function(slot){
      state.locked[slot] = true;
      var tile = null;
      for(var i = 0; i < state.bank.length; i++){
        if(state.bank[i].dest === slot){ tile = state.bank[i]; break; }
      }
      if(tile) state.placed[slot] = tile;
    });
    return state;
  }

  function unplace(state, slot){
    if(!state || slot < 0 || slot >= state.placed.length) return state;
    if(isLocked(state, slot)) return state;
    state.placed[slot] = null;
    return state;
  }

  function place(state, bankId, slot){
    if(!state) return state;
    var tile = tileById(state, bankId);
    if(!tile) return state;
    var already = state.placed.indexOf(tile);
    if(already >= 0) state.placed[already] = null;
    if(slot == null || slot < 0){
      slot = state.placed.indexOf(null);
    }
    if(slot < 0 || slot >= state.placed.length) return state;
    if(isLocked(state, slot)) return state;
    if(state.placed[slot]) state.placed[slot] = null;
    state.placed[slot] = tile;
    return state;
  }

  function join(placed){
    return (placed || []).map(function(p){ return p && p.word ? p.word : ""; })
      .filter(Boolean).join(" ");
  }

  function isFilled(state){
    return !!(state && state.placed && state.placed.length && state.placed.every(Boolean));
  }

  function remaining(state){
    if(!state) return [];
    var used = {};
    state.placed.forEach(function(p){ if(p) used[p.id] = 1; });
    return state.bank.filter(function(t){ return !used[t.id]; });
  }

  /* ---------- Lift & commit (tap + keyboard parity) ----------
     Lifting picks a card up without moving it; committing it to a slot
     places, swaps or replaces depending on where it came from. Pure so
     the tests drive every branch without a DOM. */

  function lift(state, id){
    if(!state || !tileById(state, id)) return null;
    state.lifted = id;
    return state;
  }

  function liftedTile(state){
    return (state && state.lifted) ? tileById(state, state.lifted) : null;
  }

  /* Resolve one tap/Enter on either a bank tile or a slot. Returns what
     happened ("place" | "lift" | "relift" | "cancel" | "swap" |
     "replace") or null for a no-op, so callers can sound and respond. */
  function resolveTap(state, target){
    if(!state) return null;
    var t = liftedTile(state);
    if(target && target.tileId != null){
      if(t && t.id === target.tileId){ delete state.lifted; return { kind: "cancel" }; }
      if(t){ state.lifted = target.tileId; return { kind: "relift" }; }
      var firstEmpty = state.placed.indexOf(null);
      if(firstEmpty < 0){ state.lifted = target.tileId; return { kind: "lift" }; }
      place(state, target.tileId, firstEmpty);
      return { kind: "place" };
    }
    if(target && target.slot != null){
      if(isLocked(state, target.slot)) return null;
      if(t){
        var from = state.placed.indexOf(t);
        var occupant = state.placed[target.slot];
        if(from >= 0 && from === target.slot){
          delete state.lifted;
          return { kind: "cancel" };
        }
        if(from >= 0){
          state.placed[target.slot] = t;
          state.placed[from] = occupant || null;
          delete state.lifted;
          return { kind: "swap", evicted: null };
        }
        if(from < 0 && occupant){
          state.placed[target.slot] = t;
          delete state.lifted;
          return { kind: "replace", evicted: occupant };
        }
        place(state, t.id, target.slot);
        delete state.lifted;
        return { kind: "place", evicted: null };
      }
      var occupant2 = state.placed[target.slot];
      if(occupant2){
        if(isLocked(state, target.slot)) return null;
        state.lifted = occupant2.id; return { kind: "lift" };
      }
      return null;
    }
    return null;
  }

  return {
    words: words, keyOf: keyOf, fakeCount: fakeCount,
    build: build, buildExact: buildExact, giftLocked: giftLocked, isLocked: isLocked,
    place: place, unplace: unplace,
    join: join, isFilled: isFilled, remaining: remaining,
    shuffle: shuffle, tileById: tileById,
    lift: lift, liftedTile: liftedTile, resolveTap: resolveTap
  };
})();

if(typeof module !== "undefined" && module.exports) module.exports = Assemble;
