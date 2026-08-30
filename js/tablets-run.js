function tabletsReduced(){
  return !!(document.body && (document.body.classList.contains("reduced") || document.body.classList.contains("motion-calm")));
}
function stopTabletsLoop(){
  if(typeof R === "undefined" || !R) return;
  if(R.tabletRaf){
    try{ cancelAnimationFrame(R.tabletRaf); }catch(e){}
    R.tabletRaf = 0;
  }
  R.tabletRacing = false;
}
function tabletsChapter(){
  const id = (R && R.tabletChapter) || "psalm23";
  return Tablets.chapter(id);
}
function tabletsPct(){
  const total = R.tabletTotal || 1;
  return Math.round(((R.tabletIdx || 0) / total) * 100);
}
function tabletsEsc(s){
  return (typeof esc === "function") ? esc(s) : String(s || "");
}
function buildTabletsSheet(){
  const sheet = $("tablets-sheet");
  if(!sheet) return;
  const ch = tabletsChapter();
  sheet.innerHTML = "";
  ch.blanks.forEach(function(blank, idx){
    const line = document.createElement("div");
    line.className = "tablets-verse" + (idx === 0 ? " on" : "");
    line.id = "tablets-line-" + idx;
    const pre = document.createElement("span");
    pre.textContent = blank.prefix + " ";
    const slot = document.createElement("span");
    slot.className = "tablets-blank";
    slot.id = "tablets-blank-" + idx;
    const suf = document.createElement("span");
    suf.textContent = " " + blank.suffix;
    line.appendChild(pre);
    line.appendChild(slot);
    line.appendChild(suf);
    sheet.appendChild(line);
  });
}
function alignTabletsBlank(instant){
  const sheet = $("tablets-sheet");
  const stage = $("tablets-stage");
  const slot = $("tablets-blank-" + (R.tabletIdx || 0));
  if(!sheet || !stage || !slot) return;
  const vh = stage.clientHeight || 450;
  const entryY = vh * 0.78;
  const lineY = vh * 0.42;
  const desired = entryY - (entryY - lineY) * (R.tabletProgress || 0);
  const sheetRect = sheet.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();
  const rel = slotRect.top - sheetRect.top;
  R.tabletScroll = desired - rel;
  if(instant || tabletsReduced()){
    sheet.style.transform = "translateY(" + R.tabletScroll + "px)";
  }
}
function paintTabletsHud(){
  const ch = tabletsChapter();
  const pct = tabletsPct();
  const rec = Tablets.recordOf(typeof SAVE !== "undefined" ? SAVE : null, ch.id);
  if($("tablets-chapter")) $("tablets-chapter").textContent = ch.name;
  if($("tablets-streak")) $("tablets-streak").textContent = String(R.streak || 0);
  if($("tablets-best")) $("tablets-best").textContent = (rec.best || 0) + "%";
  if($("tablets-pct")) $("tablets-pct").textContent = pct + "%";
  if($("tablets-fill")) $("tablets-fill").style.width = pct + "%";
  const ghost = $("tablets-ghost");
  if(ghost){
    if(rec.best > 0){ ghost.hidden = false; ghost.style.left = rec.best + "%"; }
    else ghost.hidden = true;
  }
  const blank = ch.blanks[R.tabletIdx];
  if($("tablets-ref")) $("tablets-ref").textContent = blank ? blank.r : ch.r;
}
function paintTabletsTray(){
  const grid = $("tablets-grid");
  if(!grid) return;
  grid.innerHTML = "";
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return;
  Tablets.options(blank).forEach(function(word, i){
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tablets-stone";
    b.dataset.word = word;
    b.textContent = tabletsEsc(word);
    const em = document.createElement("em");
    em.textContent = String(i + 1);
    b.appendChild(em);
    b.addEventListener("click", function(){ tabletsPick(word); });
    grid.appendChild(b);
  });
}
function tabletsPick(word){
  if(!R || R.ended || R.mode !== "tablets") return;
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return;
  const got = String(word || "").toLowerCase().trim();
  const need = String(blank.a || "").toLowerCase().trim();
  if(got === need) tabletsResolve(true);
  else tabletsResolve(false);
}
function tabletsCarve(){
  const idx = R.tabletIdx;
  const ch = tabletsChapter();
  const blank = ch.blanks[idx];
  const slot = $("tablets-blank-" + idx);
  const line = $("tablets-line-" + idx);
  if(slot && blank){
    slot.className = "tablets-carved in";
    slot.textContent = blank.a;
  }
  if(line){ line.className = "tablets-verse done"; }
}
function tabletsAdvanceLine(){
  const line = $("tablets-line-" + R.tabletIdx);
  const slot = $("tablets-blank-" + R.tabletIdx);
  if(line) line.className = "tablets-verse on";
  if(slot) slot.classList.add("on");
}
function tabletsShatter(){
  const stage = $("tablets-stage");
  if(!stage) return;
  const flash = document.createElement("div");
  flash.className = "tablets-flash";
  stage.appendChild(flash);
  stage.classList.add("tablets-shake");
  setTimeout(function(){
    try{ flash.remove(); }catch(e){}
    stage.classList.remove("tablets-shake");
  }, 600);
}
function tabletsResolve(ok){
  if(!R || R.ended || R.mode !== "tablets") return;
  const ch = tabletsChapter();
  R.attempts = (R.attempts || 0) + 1;
  if(!ok){
    R.tabletMiss = (R.tabletMiss || 0) + 1;
    if(typeof Snd !== "undefined" && Snd.wrong) Snd.wrong();
    tabletsShatter();
    if(typeof endRun === "function") endRun("death");
    return;
  }
  R.correct = (R.correct || 0) + 1;
  R.score = (R.score || 0) + 1;
  R.streak = (R.streak || 0) + 1;
  R.best = Math.max(R.best || 0, R.streak);
  if(typeof Snd !== "undefined" && Snd.correct) Snd.correct();
  tabletsCarve();
  R.tabletIdx++;
  R.tabletProgress = 0;
  paintTabletsHud();
  if(R.tabletIdx >= ch.blanks.length){
    if(typeof endRun === "function") endRun("complete");
    return;
  }
  tabletsAdvanceLine();
  paintTabletsTray();
  alignTabletsBlank(true);
}
function tabletsTick(now){
  if(!R || R.ended || R.mode !== "tablets" || !R.tabletRacing) return;
  const last = R.tabletLast || now;
  const dt = Math.min((now - last) / 1000, 0.1);
  R.tabletLast = now;
  if(!tabletsReduced()){
    const dur = (typeof Tablets !== "undefined" && Tablets.BLANK_MS) ? Tablets.BLANK_MS / 1000 : 6.5;
    R.tabletProgress = (R.tabletProgress || 0) + dt / dur;
    const slot = $("tablets-blank-" + (R.tabletIdx || 0));
    if(slot){
      if(R.tabletProgress > 0.7) slot.classList.add("danger");
      else slot.classList.remove("danger");
    }
    alignTabletsBlank(true);
    if(R.tabletProgress >= 1){
      tabletsResolve(false);
      return;
    }
  }
  R.tabletRaf = requestAnimationFrame(tabletsTick);
}
function startTabletsLoop(){
  stopTabletsLoop();
  const ch = tabletsChapter();
  R.tabletIdx = 0;
  R.tabletProgress = 0;
  R.tabletMiss = 0;
  R.tabletTotal = ch.blanks.length;
  R.qTotal = ch.blanks.length;
  R.tabletRacing = true;
  R.streak = 0;
  buildTabletsSheet();
  paintTabletsHud();
  paintTabletsTray();
  alignTabletsBlank(true);
  R.tabletLast = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  if(typeof requestAnimationFrame === "function") R.tabletRaf = requestAnimationFrame(tabletsTick);
}
function bindTabletsChrome(){
  const quit = $("tablets-quit");
  if(quit && !quit._bound){
    quit._bound = true;
    quit.addEventListener("click", function(){
      if(typeof quitTablets === "function") quitTablets();
      else if(typeof abandonRun === "function") abandonRun();
    });
  }
  if(typeof window !== "undefined" && !window._tabletsKeys){
    window._tabletsKeys = true;
    window.addEventListener("keydown", function(e){
      if(typeof currentView === "undefined" || currentView !== "tablets") return;
      if(!R || R.ended || R.mode !== "tablets") return;
      const n = parseInt(e.key, 10);
      if(n >= 1 && n <= 4){
        const grid = $("tablets-grid");
        const btns = grid ? grid.querySelectorAll(".tablets-stone") : [];
        if(btns[n - 1]) tabletsPick(btns[n - 1].dataset.word);
      }
    });
  }
}
function startTabletsStage(){
  bindTabletsChrome();
  const ch = tabletsChapter();
  if($("hud-round")) $("hud-round").textContent = ch.name;
  if(typeof applySiteSky === "function") applySiteSky(null);
  if(typeof Snd !== "undefined"){
    if(Snd.stopBeds) Snd.stopBeds();
    if(Snd.ambience) Snd.ambience("indigo");
  }
  go("tablets");
  startTabletsLoop();
}
if(typeof window !== "undefined"){
  window.startTabletsStage = startTabletsStage;
  window.stopTabletsLoop = stopTabletsLoop;
  window.tabletsResolve = tabletsResolve;
  window.tabletsPick = tabletsPick;
}
