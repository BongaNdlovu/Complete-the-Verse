/* ==================================================================
   TYPED MODE — on-screen keyboard, typed rendering, grading verdicts.

   Split out of game.js along its natural seams. Classic script:
   defines one global (no module system), executed before game.js,
   referenced from it at RUNTIME only — nothing here may touch a
   game.js binding while this file parses.
   ================================================================== */

/* ------------------------- TYPED (RECALL MODE) ------------------------- */
/* Same stage, same clock, same Lock button — the four options become an
   empty line plus an on-screen keyboard so phones do not need the OS IME. */
const VKB_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l","'"],
  ["z","x","c","v","b","n","m","-","⌫"],
  ["space","clear"]
];
function buildVirtualKeyboardHtml(){
  return '<div class="vkb" id="vkb" role="group" aria-label="On-screen keyboard">' +
    VKB_ROWS.map(row =>
      '<div class="vkb-row">' + row.map(k => {
        if(k === "space") return '<button type="button" class="vkb-key wide" data-k=" ">Space</button>';
        if(k === "clear") return '<button type="button" class="vkb-key wide danger" data-k="clear">Clear</button>';
        if(k === "⌫") return '<button type="button" class="vkb-key" data-k="back" aria-label="Backspace">⌫</button>';
        return '<button type="button" class="vkb-key" data-k="'+k+'">'+k.toUpperCase()+'</button>';
      }).join("") + '</div>'
    ).join("") +
  '</div>';
}
function syncTypedLock(){
  const input = $("typed-answer");
  const btn = $("confirm-answer");
  if(!input || !btn) return;
  const has = !!(input.value && input.value.trim());
  btn.disabled = !has;
  btn.textContent = has ? "Lock Answer" : "Type your answer";
}
function typeIntoAnswer(ch){
  const input = $("typed-answer");
  if(!input || input.disabled || R.locked) return;
  if(ch === "back") input.value = input.value.slice(0, -1);
  else if(ch === "clear") input.value = "";
  else input.value += ch;
  syncTypedLock();
}
function bindVirtualKeyboard(){
  const board = $("vkb");
  if(!board) return;
  board.addEventListener("click", e=>{
    const b = e.target.closest("[data-k]");
    if(!b) return;
    e.preventDefault();
    typeIntoAnswer(b.dataset.k);
    Snd.ui();
  });
  /* Keep pointer events from stealing focus into a phantom OS keyboard. */
  board.addEventListener("mousedown", e=>e.preventDefault());
}
function setVkbOpen(on, persistIt){
  SAVE.set.vkb = !!on;
  if(persistIt !== false) persist();
  const board = $("vkb");
  const input = $("typed-answer");
  const tog = $("vkb-toggle");
  if(board) board.classList.toggle("on", SAVE.set.vkb);
  if(tog){
    tog.setAttribute("aria-pressed", SAVE.set.vkb ? "true" : "false");
    tog.textContent = SAVE.set.vkb ? "Hide keyboard" : "Keyboard";
  }
  if(input) input.setAttribute("inputmode", SAVE.set.vkb ? "none" : "text");
}
function renderTypedQuestion(q, dur, scene){
  R.hintLevel = 0;
  const opts = $("opts");
  opts.className = "answers typed queued";
  opts.innerHTML =
    '<div class="typewrap">' +
      '<div class="type-row">' +
        '<input id="typed-answer" class="typed-input" type="text" autocomplete="off" ' +
          'autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="text" ' +
          'aria-label="Type the missing words" placeholder="type the missing words">' +
        '<button type="button" class="typed-pwr" data-pw="selah">Selah</button>' +
        '<button type="button" class="typed-pwr" data-pw="illum">Illuminate</button>' +
        '<button type="button" class="vkb-toggle" id="vkb-toggle" aria-pressed="false" aria-controls="vkb">Keyboard</button>' +
      '</div>' +
      '<div class="typed-hint" id="typed-hint" aria-live="polite"></div>' +
      buildVirtualKeyboardHtml() +
    '</div>';
  const input = $("typed-answer");
  input.addEventListener("input", syncTypedLock);
  input.addEventListener("keydown", e=>{
    if(e.key === "Enter"){ e.preventDefault(); confirmTyped(); }
  });
  bindVirtualKeyboard();
  opts.querySelectorAll("[data-pw]").forEach(b=>{
    b.addEventListener("click", ()=>{ Snd.ui(); usePower(b.dataset.pw); });
  });
  const tog = $("vkb-toggle");
  if(tog) tog.addEventListener("click", ()=>{ Snd.ui(); setVkbOpen(!SAVE.set.vkb); });
  setVkbOpen(!!SAVE.set.vkb, false);
  const confirmBtn = $("confirm-answer");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Type your answer";
  const how=$("warn-how");
  if(how) how.innerHTML="Type the missing phrase<br>Enter locks the line";
  renderPowers();
  armTimer(dur);
  const entranceDelay = Math.min(1450, Math.max(520, dur*.08));
  afterRun(entranceDelay, ()=>{
    if(R.q!==q || R.sceneToken!==scene || currentView!=="play") return;
    opts.classList.remove("queued"); opts.classList.add("entering");
    startTimer(dur);
    /* Desktop: allow physical typing. Mobile: keep OS keyboard closed —
       the on-screen board is the input surface. */
    if(!("ontouchstart" in window)) input.focus();
    afterRun(760, ()=>{ if(R.q===q && R.sceneToken===scene) opts.classList.remove("entering"); });
    Snd.lock();
  });
}
function confirmTyped(){
  if(!R.running || R.paused || R.locked) return;
  const input = $("typed-answer");
  if(!input || !input.value.trim()) return;
  answer(input.value, null);
}
/* Typed Illuminate never burns options. It writes a production cue into
   the blank itself: word-lengths, then initials, then the first word. */
function typedHint(){
  if(!R.q) return false;
  R.hintLevel = Math.min(3, R.hintLevel + 1);
  const cue = Recall.hint(R.q.a, R.hintLevel);
  const blank = $("blank");
  if(blank){
    blank.textContent = cue;
    blank.classList.add("hinted");
    blank.classList.remove("filled","bad","reveal");
  }
  const el = $("typed-hint");
  if(el){
    el.textContent = R.hintLevel===1 ? "Word lengths — type the missing phrase"
      : R.hintLevel===2 ? "First letters — complete each word"
      : "First word given — finish the rest";
    el.classList.add("on");
  }
  return true;
}


/* Turn a word-level diff into a sentence: which word was wrong, not just
   that the line was. */
function diffSentence(diff){
  if(!diff) return "";
  const t=diff.typed, e=diff.expected;
  if(!t && e) return 'You left out “'+esc(e)+'”. ';
  if(t && !e) return '“'+esc(t)+'” is not in the verse. ';
  return 'You wrote “'+esc(t)+'” — the verse says “'+esc(e)+'”. ';
}
/* Show what was typed against what the verse says. Being told you were
   "wrong" without seeing the gap teaches nothing. */
function renderTypedVerdict(g){
  const el = $("typed-hint"); if(!el) return;
  const input = $("typed-answer");
  if(input){ input.disabled = true; input.classList.add(Recall.isCorrect(g.verdict) ? "right" : "bad"); }
  el.classList.add("on", "verdict");
  el.innerHTML =
    g.verdict === "exact"   ? '<b class="ok">Word for word.</b>' :
    g.verdict === "close"   ? '<b class="ok">Counted.</b> <span>The verse reads “'+esc(R.q.a)+'”.</span>' :
    g.verdict === "modernised" ? '<b class="no">Not the wording.</b> <span>'+esc(g.hint)+' The verse reads “'+esc(R.q.a)+'”.</span>' :
                              '<b class="no">Not this one.</b> <span>'+diffSentence(g.diff)+'The verse reads “'+esc(R.q.a)+'”.</span>';
}

