/* ==================================================================
   ASSEMBLE MODE — drag or tap the missing words into the blank.

   Replaces free typing. Same stage, same clock, same Lock button.
   Classic script: defines globals, executed before game.js, referenced
   from it at RUNTIME only.
   ================================================================== */

function syncTypedLock(){
  const btn = $("confirm-answer");
  if(!btn) return;
  const ready = R.assemble && typeof Assemble !== "undefined" && Assemble.isFilled(R.assemble);
  btn.disabled = !ready;
  btn.textContent = ready ? "Lock Answer" : "Place the words";
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
    if(typeof toast === "function") toast("Place all words into the phrase before locking");
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

function renderAssembleBank(){
  const bank = $("asm-bank");
  const slots = $("asm-slots");
  if(!bank || !slots || !R.assemble || typeof Assemble === "undefined") return;
  const left = Assemble.remaining(R.assemble);
  bank.innerHTML = "";
  left.forEach(t => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "asm-tile";
    b.dataset.id = t.id;
    b.draggable = true;
    b.textContent = t.word;
    b.setAttribute("role", "listitem");
    b.setAttribute("aria-label", "Place word " + t.word);
    b.setAttribute("aria-grabbed", "false");
    bank.appendChild(b);
  });
  slots.innerHTML = "";
  R.assemble.placed.forEach((t, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "asm-slot" + (t ? " full" : " empty");
    el.dataset.slot = String(i);
    el.textContent = t ? t.word : "—";
    el.setAttribute("role", "listitem");
    el.setAttribute("aria-label", t ? "Placed word " + t.word + ". Tap to remove." : "Empty phrase slot " + (i + 1));
    if(t){ el.dataset.id = t.id; el.draggable = true; el.setAttribute("aria-grabbed", "true"); }
    slots.appendChild(el);
  });
  const hidden = $("typed-answer");
  if(hidden) hidden.value = Assemble.join(R.assemble.placed);
  syncTypedLock();
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
      if(sourceSlot >= 0 && sourceSlot !== destSlot && state.placed[destSlot]){
        // Swap existing placed word with dragged word
        const existing = state.placed[destSlot];
        const current = state.placed[sourceSlot];
        state.placed[destSlot] = current;
        state.placed[sourceSlot] = existing;
      } else {
        Assemble.place(state, id, destSlot);
      }
      Snd.ui();
      renderAssembleBank();
    } else if(sourceSlot >= 0 && inBank){
      // Dragged from slot back into the bank
      Assemble.unplace(state, sourceSlot);
      Snd.ui();
      renderAssembleBank();
    }
  });

  window.addEventListener("pointercancel", clearPointer);

  /* Tap / Click fallback */
  wrap.addEventListener("click", e => {
    if(!canInteract()) return;
    if(R.assemble.suppressClickUntil && Date.now() < R.assemble.suppressClickUntil){
      R.assemble.suppressClickUntil = 0;
      return;
    }
    const tile = e.target.closest(".asm-tile");
    if(tile && !tile.classList.contains("burn")){
      Assemble.place(R.assemble, tile.dataset.id);
      Snd.ui();
      renderAssembleBank();
      return;
    }
    const slot = e.target.closest(".asm-slot.full");
    if(slot){
      Assemble.unplace(R.assemble, +slot.dataset.slot);
      Snd.ui();
      renderAssembleBank();
    }
  });

  wrap.addEventListener("keydown", function(e){
    if(!canInteract() || (e.key !== "Enter" && e.key !== " ")) return;
    const tile = e.target.closest && e.target.closest(".asm-tile");
    const slot = e.target.closest && e.target.closest(".asm-slot.full");
    if(tile && !tile.classList.contains("burn")){
      e.preventDefault();
      Assemble.place(R.assemble, tile.dataset.id);
      Snd.ui();
      renderAssembleBank();
    }else if(slot){
      e.preventDefault();
      Assemble.unplace(R.assemble, +slot.dataset.slot);
      Snd.ui();
      renderAssembleBank();
    }
  });
}

function renderTypedQuestion(q, dur, scene){
  R.hintLevel = 0;
  const rnd = R.mode==="daily" ? R.daily.rnd : Math.random;
  R.assemble = (typeof Assemble !== "undefined")
    ? Assemble.build(q.a, q.d, rnd)
    : { target:[], bank:[], placed:[] };
  const opts = $("opts");
  opts.className = "answers typed queued";
  opts.innerHTML =
    '<div class="typewrap" id="asm-wrap">'+
      '<div class="type-row">'+
        '<input id="typed-answer" class="typed-input asm-hidden" type="text" autocomplete="off" '+
          'autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="none" '+
          'aria-label="Assemble the missing words" readonly tabindex="-1">'+
        '<button type="button" class="typed-pwr" data-pw="selah">Selah</button>'+
        '<button type="button" class="typed-pwr" data-pw="illum">Illuminate</button>'+
      '</div>'+
      '<div class="asm-slots" id="asm-slots" role="list" aria-label="The missing phrase"></div>'+
      '<div class="asm-bank" id="asm-bank" role="list" aria-label="Word bank"></div>'+
      '<div class="typed-hint" id="typed-hint" aria-live="polite">Drag or tap the words into order</div>'+
    '</div>';
  bindTypedPowerButtons(opts);
  bindAssembleBoard();
  renderAssembleBank();
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
  if(how) how.innerHTML="Place the missing words<br>Lock Answer or Enter confirms";
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
  el.innerHTML =
    g.verdict === "exact"   ? '<b class="ok">Word for word.</b>' :
    g.verdict === "close"   ? '<b class="ok">Counted.</b> <span>The verse reads “'+esc(R.q.a)+'”.</span>' :
    g.verdict === "modernised" ? '<b class="no">Not the wording.</b> <span>'+esc(g.hint)+' The verse reads “'+esc(R.q.a)+'”.</span>' :
                              '<b class="no">Not this one.</b> <span>'+diffSentence(g.diff)+'The verse reads “'+esc(R.q.a)+'”.</span>';
}
