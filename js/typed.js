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
    bank.appendChild(b);
  });
  slots.innerHTML = "";
  R.assemble.placed.forEach((t, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "asm-slot" + (t ? " full" : " empty");
    el.dataset.slot = String(i);
    el.textContent = t ? t.word : "—";
    if(t){ el.dataset.id = t.id; el.draggable = true; }
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
  wrap.addEventListener("click", e => {
    if(!R.assemble || !R.running || R.paused || R.locked) return;
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
  wrap.addEventListener("dragstart", e => {
    const el = e.target.closest("[data-id]");
    if(!el || !R.assemble || R.locked){ e.preventDefault(); return; }
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
  bindAssembleBoard();
  renderAssembleBank();
  const input = $("typed-answer");
  if(input){
    input.addEventListener("keydown", e=>{
      if(e.key === "Enter"){ e.preventDefault(); confirmTyped(); }
    });
  }
  opts.querySelectorAll("[data-pw]").forEach(b=>{
    b.addEventListener("click", ()=>{ Snd.ui(); usePower(b.dataset.pw); });
  });
  const confirmBtn = $("confirm-answer");
  confirmBtn.style.display = "";
  syncTypedLock();
  const how=$("warn-how");
  if(how) how.innerHTML="Place the missing words<br>Enter locks the line";
  renderPowers();
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
