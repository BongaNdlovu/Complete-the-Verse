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
  /* Delegation survives the innerHTML refresh that redraws the bank after
     every drop, and keeps power clicks out of the drag board's handlers. */
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
  if(!R.assemble || typeof Assemble === "undefined" || !Assemble.isFilled(R.assemble)) return;
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
    el.setAttribute("aria-label", t ? "Placed word " + t.word + ". Press Enter to remove." : "Empty phrase slot " + (i + 1));
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
  function clearPointer(){
    const state = R.assemble;
    const p = state && state.pointer;
    if(!p) return;
    if(p.source) p.source.classList.remove("dragging");
    document.querySelectorAll(".asm-slot.drop-target").forEach(function(s){ s.classList.remove("drop-target"); });
    if(p.source && p.source.releasePointerCapture){
      try{ p.source.releasePointerCapture(p.pointerId); }catch(err){}
    }
    state.pointer = null;
  }
  /* Pointer Events are the primary drag path. They work for touch, pen and
     mouse, while the click and native drag handlers below remain fallbacks. */
  wrap.addEventListener("pointerdown", function(e){
    if(!canInteract() || (e.pointerType === "mouse" && e.button !== 0)) return;
    const el = e.target.closest && e.target.closest(".asm-tile,.asm-slot.full");
    if(!el || el.classList.contains("burn") || !el.dataset.id) return;
    R.assemble.pointer = {id:el.dataset.id, source:el, pointerId:e.pointerId, x:e.clientX, y:e.clientY, moved:false};
    el.classList.add("dragging");
    if(el.setPointerCapture){
      try{ el.setPointerCapture(e.pointerId); }catch(err){}
    }
  });
  wrap.addEventListener("pointermove", function(e){
    const p = R.assemble && R.assemble.pointer;
    if(!p || p.pointerId !== e.pointerId) return;
    const moved = Math.abs(e.clientX-p.x) > 6 || Math.abs(e.clientY-p.y) > 6;
    if(!moved && !p.moved) return;
    p.moved = true;
    e.preventDefault();
    const target = slotAt(e);
    document.querySelectorAll(".asm-slot.drop-target").forEach(function(s){ s.classList.remove("drop-target"); });
    if(target) target.classList.add("drop-target");
  });
  wrap.addEventListener("pointerup", function(e){
    const state = R.assemble, p = state && state.pointer;
    if(!p || p.pointerId !== e.pointerId) return;
    const moved = p.moved, id = p.id, target = slotAt(e);
    clearPointer();
    if(!moved) return; /* let the accessible click path place the word */
    state.suppressClickUntil = Date.now() + 600;
    if(canInteract() && target){
      Assemble.place(state, id, +target.dataset.slot);
      Snd.ui();
      renderAssembleBank();
    }
  });
  wrap.addEventListener("pointercancel", clearPointer);
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
  wrap.addEventListener("dragstart", e => {
    const el = e.target.closest("[data-id]");
    if(!el || !R.assemble || R.locked || R.assemble.pointer){ e.preventDefault(); return; }
    R.assemble.drag = el.dataset.id;
    el.classList.add("dragging");
    try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", el.dataset.id); } catch (err) {}
  });
  wrap.addEventListener("dragend", e => {
    const el = e.target.closest("[data-id]");
    if(el) el.classList.remove("dragging");
    if(R.assemble) R.assemble.drag = null;
  });
  wrap.addEventListener("dragover", e => {
    if(e.target.closest(".asm-slot")){ e.preventDefault(); }
  });
  wrap.addEventListener("drop", e => {
    const slot = e.target.closest(".asm-slot");
    if(!slot || !R.assemble || !R.assemble.drag) return;
    e.preventDefault();
    Assemble.place(R.assemble, R.assemble.drag, +slot.dataset.slot);
    R.assemble.drag = null;
    Snd.ui();
    renderAssembleBank();
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
  confirmBtn.style.display = "";
  syncTypedLock();
  const how=$("warn-how");
  if(how) how.innerHTML="Place the missing words<br>Enter locks the line";
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
