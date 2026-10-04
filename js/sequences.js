/* ==================================================================
   SEQUENCES — multi-blank passages and final reconstruction.

   Split out of game.js along its natural seams. Classic script:
   defines one global (no module system), executed before game.js,
   referenced from it at RUNTIME only — nothing here may touch a
   game.js binding while this file parses.
   ================================================================== */

/* ==================================================================
   SPECIAL SEQUENCE ENGINE — multi-blank passages and reconstruction.
   Both run as ONE question with several sub-answers: partial credit,
   and at most a single life lost however many parts go wrong.
   ================================================================== */
function drawPassage(){
  const prefer = R.setpiece && (R.setpiece.book || (R.siteId && (Pilgrimage.site(R.siteId)||{}).books||[])[0]);
  let pool = PASSAGES.filter(p=>!R.usedPass.has(p.id));
  if(!pool.length){ R.usedPass.clear(); pool = PASSAGES.slice(); }
  const bound = prefer ? pool.filter(p=>p.b===prefer) : [];
  const pick = bound.length ? bound : pool;
  const p = pick[Math.floor(Math.random()*pick.length)];
  R.usedPass.add(p.id);
  return p;
}
/* A trailing comma, semicolon, or period is not a different word.
   "for ever." and "for ever" are the same token in a player's sequence.
   Colons, question marks, and apostrophes stay — they can change the line. */
function verseTokenKey(word){
  return String(word == null ? "" : word).toLowerCase().replace(/[,;.]+$/g, "");
}
function verseTokenSequence(text){
  return String(text == null ? "" : text).trim().split(/\s+/).filter(Boolean).map(verseTokenKey).join(" ");
}
function verseTokensMatch(a, b){
  const left = verseTokenSequence(a), right = verseTokenSequence(b);
  return left.length > 0 && left === right;
}
function verseSequencesMatch(player, expected){
  if(!player || !expected || player.length !== expected.length || !player.length) return false;
  for(let i = 0; i < player.length; i++){
    if(!verseTokensMatch(player[i], expected[i])) return false;
  }
  return true;
}
/* The passage is right when the rebuilt line reads as the verse.
   Two copies of a refrain are interchangeable; the fragment index is not. */
function gradeReconstruction(slots, frags){
  const parts = frags || [];
  const placed = slots || [];
  const built = placed.map(function(f){
    return f == null || parts[f] == null ? "" : parts[f];
  }).join(" ");
  const whole = verseTokensMatch(built, parts.join(" "));
  const slotOk = placed.map(function(f, i){
    if(whole) return true;
    if(f == null || parts[f] == null) return false;
    return verseTokensMatch(parts[f], parts[i]);
  });
  let right = 0;
  for(let i = 0; i < slotOk.length; i++) if(slotOk[i]) right++;
  return { right: right, total: parts.length, whole: whole, slotOk: slotOk };
}

function clearSequence(){
  R.sceneToken = (R.sceneToken||0) + 1;
  R.passage = null; R.recon = null;
  if(typeof clearQuestionMechanicTimers === "function") clearQuestionMechanicTimers();
  $("assembly").className = "assembly";
  $("assembly").innerHTML = "";
  $("opts").style.display = "";
}

/* ---------------- The Missing Passage ---------------- */
function startPassage(){
  const p = drawPassage();
  R.sceneToken++;
  R.q = null; R.recon = null; R.locked = false; R.qTotal++;
  R.passage = {p, idx:0, wrong:0};
  R.setpiece.remaining = p.blanks.length;
  if(typeof syncAbrahamPresentation === "function") syncAbrahamPresentation("passage");
  if(typeof cueQuestionMusic === "function") cueQuestionMusic();

  Director.pressure(0);
  $("ref").textContent = p.r + " — " + (typeof translationTag === "function" ? translationTag() : "KJV");
  let bi = 0;
  $("verse").innerHTML = p.parts.map(x =>
    typeof x === "string" ? highlightVerse(x)
      : '<span class="blank pblank" data-b="'+(bi++)+'">&#8195;&#8195;</span>'
  ).join("");
  fitVerseSize(p.parts.reduce((n,x)=>n+(typeof x==="string"?x.length:(x.a||"").length),0));
  $("assembly").className = "assembly";
  $("opts").style.display = "";
  $("confirm-answer").style.display = "none";
  $("confirm-answer").disabled = true;
  renderPowers();
  startTimer(SetPieces.duration(questionDuration()));
  renderBlankOptions();
}
function renderBlankOptions(){
  const st = R.passage, b = st.p.blanks[st.idx];
  $("verse").querySelectorAll(".pblank").forEach((el,i)=>el.classList.toggle("active", i===st.idx));
  const opts = $("opts"); opts.className = "answers queued"; opts.innerHTML = "";
  shuffle([b.a].concat(b.d)).forEach((c,i)=>{
    if(i){ const ch=document.createElement("div"); ch.className="chev"; ch.innerHTML="&#8250;"; opts.appendChild(ch); }
    const el=document.createElement("button");
    el.className="ans"; el.dataset.val=c;
    el.innerHTML='<span class="ltr">'+LETTERS[i]+'.</span>'+esc(c);
    el.addEventListener("click", ()=>fillBlank(c, el));
    opts.appendChild(el);
  });
  requestAnimationFrame(()=>{
    opts.classList.remove("queued"); opts.classList.add("entering");
    setTimeout(()=>opts.classList.remove("entering"),700);
  });
  Snd.lock();
}
function fillBlank(val, btn){
  const st = R.passage;
  if(!st || !R.running || R.paused || R.locked) return;
  const b = st.p.blanks[st.idx];
  if(!b) return;
  R.locked = true;
  const ok = val === b.a;
  const spanIdx = st.idx;
  st.idx++;
  R.setpiece.remaining = st.p.blanks.length - st.idx;
  afterRun(ok ? 700 : 1000, ()=>{
    if(R.passage!==st) return;
    R.locked = false;
    if(st.idx >= st.p.blanks.length) resolvePassage();
    else renderBlankOptions();
  });
  const verse = $("verse");
  const span = verse && verse.querySelectorAll(".pblank")[spanIdx];
  if(span){
    span.classList.remove("active");
    span.textContent = ok ? b.a : val;
    span.classList.add(ok ? "filled" : "bad", "reveal");
  }

  answerButtons().forEach(x=>{
    if(x.dataset.val===b.a) x.classList.add("right");
    else if(x===btn) x.classList.add("bad");
    else x.classList.add("mute");
  });
  const opts = $("opts");
  if(opts) opts.classList.add("locked");
  if(ok){ Snd.correct(); doFlash("gold"); Director.impact("correct"); if(typeof reactAbraham === "function") reactAbraham(true); }
  else { st.wrong++; if(typeof reactAbraham === "function") reactAbraham(false); Snd.wrong(); doFlash("red"); Director.impact("wrong"); shakeUI(true); }
  updateChips();
}
function resolvePassage(){
  const st = R.passage; if(!st) return;
  R.passage = null;                     // stops any queued fillBlank step re-entering
  stopTimer(); R.locked = true;
  // any blank left unfilled when the clock ran out counts against the passage
  $("verse").querySelectorAll(".pblank").forEach((el,i)=>{
    if(el.classList.contains("filled")||el.classList.contains("bad")) return;
    el.classList.remove("active");
    el.textContent = "— lost —"; el.classList.add("bad");
    st.wrong++;
  });
  const total = st.p.blanks.length, right = total - st.wrong;
  finishSequence({book:st.p.b, id:st.p.id, right, total, base:220});
}

/* ---------------- Final Reconstruction ---------------- */
/* Shatter the passage on its own punctuation where it can, so each
   fragment still reads like a phrase rather than a random word run. */
function fragmentize(text, n){
  const words = text.split(/\s+/), out = [], target = Math.ceil(words.length/n);
  let cur = [];
  for(let i=0;i<words.length;i++){
    cur.push(words[i]);
    const breakable = /[,;:.]$/.test(words[i]);
    const last = out.length === n-1;
    if(!last && (cur.length>=target+2 || (cur.length>=target-1 && breakable))){
      out.push(cur.join(" ")); cur = [];
    }
  }
  if(cur.length) out.push(cur.join(" "));
  while(out.length>n){ out[out.length-2] += " " + out.pop(); }
  return out;
}
function startReconstruct(){
  const p = drawPassage();
  const full = p.parts.map(x => typeof x === "string" ? x : x.a).join("");
  const frags = fragmentize(full, 5);
  R.sceneToken++;
  R.q = null; R.passage = null; R.locked = false; R.qTotal++;
  R.recon = {p, frags, slots:new Array(frags.length).fill(null), drag:null};
  R.setpiece.remaining = frags.length;
  if(typeof syncAbrahamPresentation === "function") syncAbrahamPresentation("reconstruct");
  if(typeof cueQuestionMusic === "function") cueQuestionMusic();

  Director.pressure(0);
  $("ref").textContent = p.r + " — " + (typeof translationTag === "function" ? translationTag() : "KJV");
  $("verse").innerHTML = '<span class="recon-prompt">Restore the passage</span>';
  fitVerseSize(0);
  $("opts").innerHTML = ""; $("opts").className = "answers"; $("opts").style.display = "none";
  $("confirm-answer").style.display = "none";
  $("confirm-answer").disabled = true;

  const a = $("assembly");
  a.className = "assembly on";
  a.innerHTML = '<div class="recon-slots" id="recon-slots"></div>'
              + '<div class="recon-bank" id="recon-bank"></div>'
              + '<div class="recon-hint">Drag or click fragments. Filled slots can be returned and reordered.</div>'
              + '<button class="recon-confirm" id="recon-confirm" type="button" disabled>Lock Passage</button>';
  shuffle(frags.map((t,i)=>({t,i}))).forEach(f=>{
    const el = document.createElement("button");
    el.className = "frag"; el.textContent = f.t; el.dataset.i = f.i; el.draggable = true;
    $("recon-bank").appendChild(el);
  });
  drawSlots();
  bindReconDrag();
  $("recon-confirm").addEventListener("click", ()=>{
    if(R.recon && R.running && !R.paused && !R.locked && R.recon.slots.indexOf(null)<0) resolveRecon();
  });
  renderPowers();
  startTimer(SetPieces.duration(questionDuration()));
  Snd.lock();
}
function drawSlots(){
  const st = R.recon, host = $("recon-slots");
  host.innerHTML = "";
  st.slots.forEach((f,i)=>{
    const el = document.createElement("div");
    el.className = "slot" + (f===null ? " empty" : " full");
    el.dataset.slot = i;
    el.innerHTML = '<b>'+(i+1)+'</b><span>'+(f===null ? "" : esc(st.frags[f]))+'</span>';
    if(f!==null){ el.draggable = true; el.dataset.i = f; }
    host.appendChild(el);
  });
  R.setpiece.remaining = st.slots.filter(x=>x===null).length;
  const confirm = $("recon-confirm");
  if(confirm) confirm.disabled = st.slots.indexOf(null)>=0 || R.locked;
  updateChips();
}
function placeFrag(fi){
  const st = R.recon;
  const slot = st.slots.indexOf(null);
  if(slot < 0) return;
  st.slots[slot] = fi;
  const b = $("recon-bank").querySelector('[data-i="'+fi+'"]');
  if(b) b.remove();
  Snd.ui(); drawSlots();
}
function returnFrag(slotIdx){
  const st = R.recon, fi = st.slots[slotIdx];
  if(fi === null) return;
  st.slots[slotIdx] = null;
  const el = document.createElement("button");
  el.className = "frag"; el.textContent = st.frags[fi]; el.dataset.i = fi; el.draggable = true;
  $("recon-bank").appendChild(el);
  Snd.ui(); drawSlots();
}
function bindReconDrag(){
  const a = $("assembly");
  if(a.dataset.bound) return;
  a.dataset.bound = "1";
  a.addEventListener("click", e=>{
    const st = R.recon;
    if(!st || !R.running || R.paused || R.locked) return;
    const f = e.target.closest(".frag");
    if(f){ placeFrag(+f.dataset.i); return; }
    const s = e.target.closest(".slot");
    if(s) returnFrag(+s.dataset.slot);
  });
  a.addEventListener("dragstart", e=>{
    const el = e.target.closest("[data-i]");
    if(!el || !R.recon || R.locked){ e.preventDefault(); return; }
    R.recon.drag = {i:+el.dataset.i, from: el.classList.contains("slot") ? +el.dataset.slot : -1};
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", el.dataset.i);
  });
  a.addEventListener("dragend", e=>{
    const el = e.target.closest("[data-i]"); if(el) el.classList.remove("dragging");
    a.querySelectorAll(".over").forEach(x=>x.classList.remove("over"));
  });
  a.addEventListener("dragover", e=>{
    if(!R.recon || !R.recon.drag) return;
    const s = e.target.closest(".slot"), bank = e.target.closest(".recon-bank");
    if(!s && !bank) return;
    e.preventDefault();
    a.querySelectorAll(".over").forEach(x=>x.classList.remove("over"));
    (s||bank).classList.add("over");
  });
  a.addEventListener("drop", e=>{
    const st = R.recon;
    if(!st || !st.drag || !R.running || R.paused || R.locked) return;
    e.preventDefault();
    a.querySelectorAll(".over").forEach(x=>x.classList.remove("over"));
    const d = st.drag; st.drag = null;
    const s = e.target.closest(".slot");
    if(!s){                                   // dropped back on the bank
      if(d.from >= 0) returnFrag(d.from);
      return;
    }
    const to = +s.dataset.slot;
    if(d.from >= 0){                          // reorder: swap the two slots
      st.slots[d.from] = st.slots[to]; st.slots[to] = d.i;
    } else {
      if(st.slots[to] !== null) returnFrag(to);
      st.slots[to] = d.i;
      const b = $("recon-bank").querySelector('[data-i="'+d.i+'"]');
      if(b) b.remove();
    }
    Snd.ui(); drawSlots();
  });
}
function resolveRecon(){
  const st = R.recon; if(!st) return;
  R.recon = null;
  stopTimer(); R.locked = true;
  const graded = gradeReconstruction(st.slots, st.frags);
  const right = graded.right;
  const slots = $("recon-slots");
  if(slots) slots.querySelectorAll(".slot").forEach((el,i)=>{
    const ok = !!graded.slotOk[i];
    el.classList.remove("empty","full");
    el.classList.add(ok ? "ok" : "no");
    if(!ok){
      const sp = el.querySelector("span");
      if(sp) sp.textContent = st.frags[i];
    }
  });
  const verseEl = $("verse");
  if(verseEl) verseEl.innerHTML = '<span class="recon-prompt">'+
    (right===st.frags.length ? "The passage stands whole" : "Fragments out of order")+'</span>';
  finishSequence({book:st.p.b, id:st.p.id, right, total:graded.total, base:200});
}

if(typeof module !== "undefined" && module.exports){
  module.exports = {
    verseTokenKey: verseTokenKey,
    verseTokenSequence: verseTokenSequence,
    verseTokensMatch: verseTokensMatch,
    verseSequencesMatch: verseSequencesMatch,
    gradeReconstruction: gradeReconstruction,
    fragmentize: fragmentize
  };
}

/* ---------------- shared resolution ---------------- */
function finishSequence(o){
  R.attempts++;
  recordDecision(performance.now()-R.qStart);
  R.setpiece.finishing = true;
  recordVerse({b:o.book, id:o.id}, o.right===o.total);
  const perfect = o.right === o.total;
  if(o.right){
    const gained = Math.round(o.base * o.right * multiplier() * R.diff.score * SetPieces.bonus());
    R.score += gained;
    animateScore();
  }
  if(perfect){
    afterRun(1700, nextQuestion);
    if(typeof reactAbraham === "function") reactAbraham(true);
    R.correct++; R.streak++; R.best = Math.max(R.best, R.streak);
    R.booksRun.add(o.book);
    Snd.correct(); doFlash("gold");
    Director.callout(SetPieces.label()+" restored");
    setMult(true); Director.momentum(true);
  } else {
    if(typeof reactAbraham === "function") reactAbraham(false);
    R.streak = 0; setMult();
    const passage = PASSAGES.find(p=>p.id===o.id);
    if(passage){
      const full = passage.parts.map(x=>typeof x==="string" ? x : x.a).join("");
      R.missed.push({r:passage.r,p:"",a:full,s:""});
    }
    Director.momentum(false); Snd.wrong();
    Director.callout(o.right ? o.right+" of "+o.total+" restored" : "The passage is lost");
    loseLife();
  }
}

if (typeof window !== "undefined") {
  window.clearSequence = clearSequence;
  window.startPassage = startPassage;
  window.startReconstruct = startReconstruct;
}
