/* ==================================================================
   ASSEMBLE MODE — drag or tap the missing words into the blank.

   Replaces free typing. Same stage, same clock, same Lock button.
   Classic script: defines globals, executed before game.js, referenced
   from it at RUNTIME only.
   ================================================================== */

function assemblyTargetFor(q){
  if(typeof R !== "undefined" && R.currentMechanic === "fade" && R.fadeAssembly && R.fadeAssembly.target){
    return R.fadeAssembly.target;
  }
  return q && q.a ? q.a : "";
}

function isFadeAssembly(){
  return !!(typeof R !== "undefined" && R.currentMechanic === "fade" && R.fadeAssembly);
}

function syncTypedLock(){
  const btn = $("confirm-answer");
  if(!btn) return;
  const ready = R.assemble && typeof Assemble !== "undefined" && Assemble.isFilled(R.assemble);
  btn.disabled = !ready;
  btn.textContent = ready
    ? (isFadeAssembly() ? "Lock Full Verse" : "Lock Answer")
    : (isFadeAssembly() ? "Place All Words" : "Place the words");
  btn.classList.toggle("ready", ready);
}

function syncTypedPowerButtons(){
  const p = R.powers || {};
  document.querySelectorAll(".typed-pwr[data-pw]").forEach(function(b){
    const kind = b.dataset.pw;
    const available = kind === "selah" ? (p.selah||0) : (p.illum||0);
    const blocked = kind === "illum" && R.hintLevel >= 3;
    b.disabled = !available || blocked || !!R.paused || !!R.locked;
    b.classList.toggle("spent", b.disabled);
    b.setAttribute("aria-disabled", b.disabled ? "true" : "false");
  });
}

function bindTypedPowerButtons(opts){
  if(!opts || opts.dataset.typedPowersBound) return;
  opts.dataset.typedPowersBound = "1";
  opts.addEventListener("click", function(e){
    const b = e.target.closest && e.target.closest(".typed-pwr[data-pw]");
    if(!b || b.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    Snd.ui();
    usePower(b.dataset.pw);
  });
}

function confirmTyped(){
  if(!R.running || R.paused || R.locked) return;
  if(!R.assemble || typeof Assemble === "undefined" || !Assemble.isFilled(R.assemble)){
    if(typeof toast === "function") toast(isFadeAssembly()
      ? "Place every word into the full verse before locking"
      : "Place all words into the phrase before locking");
    return;
  }
  const phrase = Assemble.join(R.assemble.placed);
  const input = $("typed-answer");
  if(input) input.value = phrase;
  answer(phrase, null);
}

function typedHint(){
  if(!R.q) return false;
  R.hintLevel = Math.min(3, R.hintLevel + 1);
  const cue = (typeof Recall !== "undefined") ? Recall.hint(R.q.a, R.hintLevel) : "";
  const blank = $("blank");
  if(blank){
    blank.textContent = cue;
    blank.classList.add("hinted");
    blank.classList.remove("filled","bad","reveal");
  }
  const el = $("typed-hint");
  if(el){
    el.textContent = R.hintLevel===1 ? "Word lengths — place the missing phrase"
      : R.hintLevel===2 ? "First letters — finish each word"
      : "First word given — finish the rest";
    el.classList.add("on");
  }
  if(R.assemble && R.hintLevel === 1){
    const fake = (R.assemble.bank || []).find(t => t.dest < 0);
    if(fake){
      const node = document.querySelector('.asm-tile[data-id="'+fake.id+'"]');
      if(node) node.classList.add("burn");
    }
  }
  return true;
}

/* Illuminate for a full Fade reconstruction: identify the next word without
   placing it automatically.  The player still has to drag/tap it into the
   correct position, preserving the memory test. */
function illuminateAssembly(){
  if(!isFadeAssembly() || !R.assemble) return false;
  var next = R.assemble.placed.findIndex(function(t){ return !t; });
  if(next < 0) return false;
  R.fadeAssembly.hintIndex = next;
  renderAssembleBank();
  var word = R.assemble.target[next];
  var hint = $("typed-hint");
  if(hint){
    hint.textContent = "Illuminate — next word: " + word;
    hint.classList.add("on");
  }
  return true;
}

function renderAssembleBoardState(){
  /* One place decides the lifted/armed visuals so taps, drags and keys
     all read the same board. */
  const liftedId = R.assemble && R.assemble.lifted;
  const hint = $("typed-hint");
  document.querySelectorAll(".asm-tile.lifted,.asm-slot.lifted").forEach(function(el){
    el.classList.remove("lifted");
  });
  document.querySelectorAll(".asm-slot.drop-hint").forEach(function(s){ s.classList.remove("drop-hint"); });
  if(!liftedId) return;
  const liftedNode = document.querySelector('.asm-tile[data-id="'+liftedId+'"], .asm-slot[data-id="'+liftedId+'"]');
  if(liftedNode) liftedNode.classList.add("lifted");
  document.querySelectorAll(".asm-slot.empty").forEach(function(s){ s.classList.add("drop-hint"); });
  if(hint && !hint.classList.contains("verdict")){
    hint.textContent = "Card lifted — tap or press Enter on a slot to swap or replace";
    hint.classList.add("on");
  }
}

function assembleDefaultHint(){
  if(isFadeAssembly()) return "Drag, tap or press Enter every word into order";
  if(R.lastBeat && R.q && typeof Recall !== "undefined"){
    const target = (typeof assemblyTargetFor === "function") ? assemblyTargetFor(R.q) : R.q.a;
    return Recall.hint(target, 3) + " — place the rest in order";
  }
  return "Drag, tap or press Enter the words into order";
}

function captureBoardRects(){
  const map = {};
  if(document.body.classList.contains("reduced")) return map;
  document.querySelectorAll(".asm-tile[data-id],.asm-slot[data-id]").forEach(el => {
    if(typeof el.getBoundingClientRect !== "function") return;
    const r = el.getBoundingClientRect();
    if(r && (r.left || r.top)) map[el.dataset.id] = { x: r.left, y: r.top };
  });
  return map;
}

function playBoardFlip(map){
  if(document.body.classList.contains("reduced")) return;
  document.querySelectorAll(".asm-tile[data-id],.asm-slot[data-id]").forEach(el => {
    const old = map[el.dataset.id];
    if(!old || typeof el.getBoundingClientRect !== "function" || typeof el.animate !== "function") return;
    const r = el.getBoundingClientRect();
    const dx = Math.round(old.x - r.left), dy = Math.round(old.y - r.top);
    if(!dx && !dy) return;
    try {
      const anim = el.animate(
        [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "translate(0,0)" }],
        { duration: 230, easing: "cubic-bezier(.2,.8,.2,1)" });
      if(anim && anim.finished && anim.finished.catch) anim.finished.catch(function(){});
    } catch(err){}
  });
}

function settlePlacedCard(id){
  /* The dropped card lands: a short settle reads as weight coming to
     rest under the player's hand. */
  if(!id || document.body.classList.contains("reduced")) return;
  const el = document.querySelector('.asm-slot[data-id="' + id + '"]');
  if(!el || typeof el.animate !== "function") return;
  try {
    const anim = el.animate(
      [{ transform: "scale(1.08)" }, { transform: "scale(1)" }],
      { duration: 120, easing: "ease-out" });
    if(anim && anim.finished && anim.finished.catch) anim.finished.catch(function(){});
  } catch(err){}
}

function renderAssembleBank(){
  const bank = $("asm-bank");
  const slots = $("asm-slots");
  if(!bank || !slots || !R.assemble || typeof Assemble === "undefined") return;
  const beforeRects = captureBoardRects();
  const left = Assemble.remaining(R.assemble);
  bank.innerHTML = "";
  left.forEach(t => {
    const b = document.createElement("button");
    b.type = "button";
    var hintIndex = isFadeAssembly() ? R.fadeAssembly.hintIndex : -1;
    var fadeHint = isFadeAssembly() && hintIndex >= 0 && !R.assemble.placed[hintIndex] &&
      t.word === R.assemble.target[hintIndex];
    b.className = "asm-tile" + (fadeHint ? " illuminate-target" : "");
    b.dataset.id = t.id;
    b.draggable = true;
    b.textContent = t.word;
    b.setAttribute("role", "listitem");
    b.setAttribute("aria-label", "Place word " + t.word);
    b.setAttribute("aria-grabbed", "false");
    bank.appendChild(b);
  });
  slots.innerHTML = "";
  const makeSlot = (t, i) => {
    const locked = !!(R.assemble && R.assemble.locked && R.assemble.locked[i]);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "asm-slot" + (t ? " full" : " empty") + (locked ? " locked" : "");
    el.dataset.slot = String(i);
    el.textContent = t ? t.word : "—";
    el.setAttribute("role", "listitem");
    if(locked){
      el.disabled = true;
      el.draggable = false;
      el.setAttribute("aria-label", "Gift word " + t.word + " (locked)");
    } else {
      el.setAttribute("aria-label", t
        ? "Placed word " + t.word + ". Tap to lift, then choose another slot to swap."
        : (isFadeAssembly() ? "Empty full-verse slot " : "Empty phrase slot ") + (i + 1));
      if(t){ el.dataset.id = t.id; el.draggable = true; el.setAttribute("aria-grabbed", "false"); }
    }
    return el;
  };
  /* Fade rebuilds read as phrases: group the slot order at KJV clause
     punctuation so a long verse scans in chunks instead of one ribbon.
     Pure grouping — same state model underneath. */
  const chunks = (typeof Polish !== "undefined" && Polish.verseChunks && isFadeAssembly())
    ? Polish.verseChunks(R.assemble.target) : null;
  if(chunks){
    chunks.forEach(chunk => {
      const g = document.createElement("div");
      g.className = "asm-chunk";
      chunk.forEach(i => { g.appendChild(makeSlot(R.assemble.placed[i], i)); });
      slots.appendChild(g);
    });
  } else {
    R.assemble.placed.forEach((t, i) => { slots.appendChild(makeSlot(t, i)); });
  }
  const hidden = $("typed-answer");
  if(hidden) hidden.value = Assemble.join(R.assemble.placed);
  syncTypedLock();
  renderAssembleBoardState();
  playBoardFlip(beforeRects);
}

function bindAssembleBoard(){
  const wrap = $("asm-wrap");
  if(!wrap || wrap.dataset.bound) return;
  wrap.dataset.bound = "1";

  function canInteract(){
    return !!(R.assemble && R.running && !R.paused && !R.locked);
  }

  function slotAt(e){
    let node = e && e.target;
    if(typeof document.elementFromPoint === "function" && e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY)){
      node = document.elementFromPoint(e.clientX, e.clientY) || node;
    }
    return node && node.closest ? node.closest(".asm-slot") : null;
  }

  function bankAt(e){
    let node = e && e.target;
    if(typeof document.elementFromPoint === "function" && e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY)){
      node = document.elementFromPoint(e.clientX, e.clientY) || node;
    }
    return node && node.closest ? node.closest(".asm-bank") : null;
  }

  function clearPointer(){
    const state = R.assemble;
    const p = state && state.pointer;
    if(!p) return;
    if(p.avatar){ try { p.avatar.remove(); } catch(err){} }
    if(p.source) p.source.classList.remove("dragging");
    document.querySelectorAll(".asm-slot.drop-target").forEach(function(s){ s.classList.remove("drop-target"); });
    state.pointer = null;
  }

  /* One tap/Enter resolver for clicks and keys alike: lift, commit,
     swap or replace via the pure Assemble.resolveTap, then respond. */
  function applyTap(target){
    const state = R.assemble;
    if(!state || !canInteract()) return;
    const liftedId = state.lifted || null;
    const result = Assemble.resolveTap(state, target);
    if(!result) return;
    Snd.ui();
    renderAssembleBank();
    /* The committed card settles where it landed. */
    if(result.kind === "place") settlePlacedCard(liftedId || target.tileId);
    else if(result.kind === "swap" || result.kind === "replace") settlePlacedCard(liftedId);
  }

  /* Pointer Events: Smooth realistic drag with floating avatar and slot preview */
  wrap.addEventListener("pointerdown", function(e){
    if(!canInteract() || (e.pointerType === "mouse" && e.button !== 0)) return;
    const el = e.target.closest && e.target.closest(".asm-tile,.asm-slot.full");
    if(!el || el.classList.contains("burn") || !el.dataset.id) return;
    const isSlot = el.classList.contains("asm-slot");
    const sourceSlot = isSlot ? +el.dataset.slot : -1;
    const tileObj = Assemble.tileById(R.assemble, el.dataset.id);
    R.assemble.pointer = {
      id: el.dataset.id,
      word: tileObj ? tileObj.word : el.textContent,
      source: el,
      sourceSlot: sourceSlot,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      avatar: null,
      moved: false
    };
  });

  window.addEventListener("pointermove", function(e){
    const p = R.assemble && R.assemble.pointer;
    if(!p || p.pointerId !== e.pointerId) return;
    const dist = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    if(dist > 5){
      p.moved = true;
      e.preventDefault();
      if(!p.avatar && typeof document.createElement === "function"){
        p.source.classList.add("dragging");
        const av = document.createElement("div");
        av.className = "asm-drag-avatar";
        av.textContent = p.word;
        document.body.appendChild(av);
        p.avatar = av;
      }
      if(p.avatar){
        p.avatar.style.left = e.clientX + "px";
        p.avatar.style.top = e.clientY + "px";
      }
      const target = slotAt(e);
      document.querySelectorAll(".asm-slot.drop-target").forEach(function(s){ s.classList.remove("drop-target"); });
      if(target) target.classList.add("drop-target");
    }
  });

  window.addEventListener("pointerup", function(e){
    const state = R.assemble, p = state && state.pointer;
    if(!p || p.pointerId !== e.pointerId) return;
    const moved = p.moved, id = p.id, sourceSlot = p.sourceSlot;
    const target = slotAt(e);
    const inBank = bankAt(e);
    clearPointer();
    if(!moved) return; /* Accessible click / tap fallback handles in-place taps */

    state.suppressClickUntil = Date.now() + 400;
    if(!canInteract()) return;

    if(target){
      const destSlot = +target.dataset.slot;
      let settledId = id;
      if(sourceSlot < 0 && state.placed[destSlot]){
        /* A bank card dropped onto an occupied slot REPLACES that word:
           the evicted word flies back to the bank instead of the drop
           silently landing in the first empty slot. */
        Assemble.place(state, id, destSlot);
        delete state.lifted;
        Snd.ui();
        renderAssembleBank();
      } else if(sourceSlot >= 0 && sourceSlot !== destSlot && state.placed[destSlot]){
        // Swap existing placed word with dragged word
        const existing = state.placed[destSlot];
        const current = state.placed[sourceSlot];
        state.placed[destSlot] = current;
        state.placed[sourceSlot] = existing;
        delete state.lifted;
        settledId = current ? current.id : id;
        Snd.ui();
        renderAssembleBank();
      } else {
        if(Assemble.liftedTile(state) && Assemble.liftedTile(state).id === id) delete state.lifted;
        Assemble.place(state, id, destSlot);
        Snd.ui();
        renderAssembleBank();
      }
      settlePlacedCard(settledId);
    } else if(sourceSlot >= 0 && inBank){
      // Dragged from slot back into the bank
      Assemble.unplace(state, sourceSlot);
      if(Assemble.liftedTile(state) && Assemble.liftedTile(state).id === id) delete state.lifted;
      Snd.ui();
      renderAssembleBank();
    }
  });

  window.addEventListener("pointercancel", clearPointer);

  /* Tap / Click fallback — the same lift & commit model as keyboard:
     tap a card to pick it up, tap again to commit it where you point. */
  wrap.addEventListener("click", e => {
    if(!canInteract()) return;
    if(R.assemble.suppressClickUntil && Date.now() < R.assemble.suppressClickUntil){
      R.assemble.suppressClickUntil = 0;
      return;
    }
    const tile = e.target.closest(".asm-tile");
    if(tile && !tile.classList.contains("burn")){
      applyTap({ tileId: tile.dataset.id });
      return;
    }
    const slot = e.target.closest(".asm-slot");
    if(slot){
      applyTap({ slot: +slot.dataset.slot });
    }
  });

  /* Keyboard parity: Enter/Space lifts or commits exactly like a tap.
     Arrows move focus between cards and slots so a full verse is fully
     reorderable without ever touching the mouse. */
  function focusables(){
    return Array.from(
      document.querySelectorAll("#asm-bank .asm-tile, #asm-slots .asm-slot")
    ).filter(el => !el.disabled && !el.classList.contains("burn"));
  }

  wrap.addEventListener("keydown", function(e){
    const tile = e.target.closest && e.target.closest(".asm-tile");
    const slot = e.target.closest && e.target.closest(".asm-slot");

    if(e.key === "ArrowRight" || e.key === "ArrowLeft"){
      const items = focusables();
      const i = items.indexOf(document.activeElement);
      if(i >= 0){
        e.preventDefault();
        const d = e.key === "ArrowRight" ? 1 : -1;
        const n = items[(i + d + items.length) % items.length];
        if(n) n.focus();
      }
      return;
    }
    if(!canInteract() || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    if(tile && !tile.classList.contains("burn")){
      applyTap({ tileId: tile.dataset.id });
    }else if(slot){
      applyTap({ slot: +slot.dataset.slot });
    }
  });
}

function renderTypedQuestion(q, dur, scene){
  R.hintLevel = 0;
  const rnd = R.mode==="daily" ? R.daily.rnd : Math.random;
  const target = assemblyTargetFor(q);
  R.assemble = (typeof Assemble !== "undefined")
    ? (isFadeAssembly() && Assemble.buildExact
      ? Assemble.buildExact(target, rnd)
      : Assemble.build(target, q.d, rnd))
    : { target:[], bank:[], placed:[] };
  if(isFadeAssembly() && R.assemble && typeof Assemble !== "undefined" && Assemble.giftLocked)
    Assemble.giftLocked(R.assemble, rnd);
  const opts = $("opts");
  opts.className = "answers typed queued";
  opts.innerHTML =
    '<div class="typewrap" id="asm-wrap">'+
      '<input id="typed-answer" class="typed-input asm-hidden" type="text" autocomplete="off" '+
        'autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="none" '+
        'aria-label="Assemble the missing words" readonly tabindex="-1">'+
      '<div class="asm-slots" id="asm-slots" role="list" aria-label="The missing phrase"></div>'+
      '<div class="asm-bank" id="asm-bank" role="list" aria-label="Word bank"></div>'+
      '<div class="typed-hint" id="typed-hint" aria-live="polite"></div>'+
    '</div>';
  bindAssembleBoard();
  renderAssembleBank();
  const hintEl = $("typed-hint");
  if(hintEl && typeof assembleDefaultHint === "function"){
    hintEl.textContent = assembleDefaultHint();
    if(R.lastBeat) hintEl.classList.add("on");
  }
  const input = $("typed-answer");
  if(input){
    input.addEventListener("keydown", e=>{
      if(e.key === "Enter"){ e.preventDefault(); confirmTyped(); }
    });
  }
  const confirmBtn = $("confirm-answer");
  if(confirmBtn){
    confirmBtn.style.display = "";
    confirmBtn.onclick = confirmTyped;
  }
  syncTypedLock();
  const how=$("warn-how");
  if(how) how.innerHTML = isFadeAssembly()
    ? "Rebuild the whole verse in order<br>Drag, tap or press Enter to place each word"
    : "Place the missing words<br>Drag, tap or press Enter — lift a card to swap or replace";
  renderPowers();
  syncTypedPowerButtons();
  armTimer(dur);
  const entranceDelay = Math.min(1450, Math.max(520, dur*.08));
  afterRun(entranceDelay, ()=>{
    if(R.q!==q || R.sceneToken!==scene || currentView!=="play") return;
    opts.classList.remove("queued"); opts.classList.add("entering");
    startTimer(dur);
    afterRun(760, ()=>{ if(R.q===q && R.sceneToken===scene) opts.classList.remove("entering"); });
    Snd.lock();
  });
}

function diffSentence(diff){
  if(!diff) return "";
  const t=diff.typed, e=diff.expected;
  if(!t && e) return 'You left out “'+esc(e)+'”. ';
  if(t && !e) return '“'+esc(t)+'” is not in the verse. ';
  return 'You wrote “'+esc(t)+'” — the verse says “'+esc(e)+'”. ';
}

function renderTypedVerdict(g){
  const el = $("typed-hint"); if(!el) return;
  const input = $("typed-answer");
  if(input){ input.disabled = true; input.classList.add(Recall.isCorrect(g.verdict) ? "right" : "bad"); }
  document.querySelectorAll(".asm-slot").forEach(s => { s.disabled = true; });
  document.querySelectorAll(".asm-tile").forEach(s => { s.disabled = true; });
  el.classList.add("on", "verdict");
  var target = assemblyTargetFor(R.q);
  el.innerHTML =
    g.verdict === "exact"   ? '<b class="ok">'+(isFadeAssembly() ? "Full verse restored." : "Word for word.")+'</b>' :
    g.verdict === "close"   ? '<b class="ok">Counted.</b> <span>The verse reads “'+esc(target)+'”.</span>' :
    g.verdict === "modernised" ? '<b class="no">Not the wording.</b> <span>'+esc(g.hint)+' The verse reads “'+esc(target)+'”.</span>' :
                              '<b class="no">Not this one.</b> <span>'+diffSentence(g.diff)+'The verse reads “'+esc(target)+'”.</span>';
}
