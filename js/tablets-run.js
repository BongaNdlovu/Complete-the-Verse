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
function tabletsClockLeft(){
  if(tabletsReduced()) return 1;
  return Math.max(0, 1 - (R.tabletProgress || 0));
}
function fillVerseLine(host, blank, kind, idx){
  if(!host) return;
  host.innerHTML = "";
  if(!blank){ host.textContent = ""; return; }
  const pre = document.createElement("span");
  pre.textContent = blank.prefix + " ";
  const slot = document.createElement("span");
  const suf = document.createElement("span");
  suf.textContent = blank.suffix ? (" " + blank.suffix) : "";
  if(kind === "done"){
    slot.className = "tablets-carved";
    slot.textContent = blank.a;
  } else if(kind === "on"){
    slot.className = "tablets-blank";
    slot.id = "tablets-blank-" + idx;
    slot.style.minWidth = Math.max(4, String(blank.a || "").length + 1) + "ch";
  } else {
    slot.className = "tablets-blank";
    slot.textContent = "·";
    slot.style.minWidth = "3ch";
    slot.style.opacity = ".45";
  }
  host.appendChild(pre);
  host.appendChild(slot);
  host.appendChild(suf);
}
function paintTabletsPips(){
  const host = $("tablets-pips");
  if(!host) return;
  const ch = tabletsChapter();
  const idx = R.tabletIdx || 0;
  host.innerHTML = "";
  ch.blanks.forEach(function(_, i){
    const pip = document.createElement("i");
    pip.className = "tablets-pip" + (i < idx ? " done" : (i === idx ? " on" : ""));
    host.appendChild(pip);
  });
}
function paintTabletsClock(){
  const fill = $("tablets-clock-fill");
  const lab = $("tablets-clock-lab");
  const bar = fill && fill.parentNode;
  const left = tabletsClockLeft();
  if(fill) fill.style.width = (left * 100) + "%";
  if(bar && bar.classList) bar.classList.toggle("late", left < 0.3 && !tabletsReduced());
  if(lab){
    if(tabletsReduced()) lab.textContent = "Untimed Hold";
    else lab.textContent = (left * ((Tablets.BLANK_MS || 6500) / 1000)).toFixed(1) + "s left";
  }
  const slot = $("tablets-blank-" + (R.tabletIdx || 0));
  if(slot){
    if(left < 0.3 && !tabletsReduced()) slot.classList.add("danger");
    else slot.classList.remove("danger");
  }
}
function paintTabletsStage(answer){
  const ch = tabletsChapter();
  const i = R.tabletIdx || 0;
  fillVerseLine($("tablets-prev"), ch.blanks[i - 1], "done", i - 1);
  fillVerseLine($("tablets-sheet"), ch.blanks[i], answer ? "done" : "on", i);
  if(answer){
    const carved = $("tablets-sheet").querySelector(".tablets-carved");
    if(carved) carved.classList.add("in", answer === "miss" ? "shattered" : "");
  }
  fillVerseLine($("tablets-next"), ch.blanks[i + 1], "wait", i + 1);
  paintTabletsPips();
  paintTabletsClock();
}
function buildTabletsSheet(){
  paintTabletsStage();
}
function alignTabletsBlank(){
  paintTabletsClock();
}
function paintTabletsHud(){
  const ch = tabletsChapter();
  const pct = tabletsPct();
  const rec = Tablets.recordOf(typeof SAVE !== "undefined" ? SAVE : null, ch.id);
  const idx = R.tabletIdx || 0;
  if($("tablets-chapter")) $("tablets-chapter").textContent = ch.name;
  if($("tablets-sub")) $("tablets-sub").textContent = ch.subtitle || "KJV";
  if($("tablets-remain")) $("tablets-remain").textContent = Math.min(idx + 1, ch.blanks.length) + " / " + ch.blanks.length;
  if($("tablets-streak")) $("tablets-streak").textContent = String(R.streak || 0);
  if($("tablets-best")) $("tablets-best").textContent = (rec.best || 0) + "%";
  if($("tablets-pct")) $("tablets-pct").textContent = pct + "%";
  if($("tablets-fill")) $("tablets-fill").style.width = pct + "%";
  const ghost = $("tablets-ghost");
  if(ghost){
    if(rec.best > 0){ ghost.hidden = false; ghost.style.left = rec.best + "%"; }
    else ghost.hidden = true;
  }
  const blank = ch.blanks[idx];
  if($("tablets-ref")) $("tablets-ref").textContent = blank ? blank.r : ch.r;
  paintTabletsIllumBtn();
}
function tabletsOptsForBlank(){
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return [];
  if(R.tabletOptsIdx === R.tabletIdx && R.tabletOpts && R.tabletOpts.length) return R.tabletOpts;
  R.tabletOpts = Tablets.options(blank);
  R.tabletOptsIdx = R.tabletIdx;
  return R.tabletOpts;
}
function paintTabletsIllumBtn(){
  const btn = $("tablets-illum");
  if(!btn) return;
  const n = (R.powers && R.powers.illum) || 0;
  btn.textContent = "Illuminate ×" + n;
  btn.disabled = n < 1;
}
function paintTabletsTray(){
  const grid = $("tablets-grid");
  if(!grid) return;
  grid.innerHTML = "";
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return;
  const grey = (R.tabletHintedIdx === R.tabletIdx && R.tabletGrey) ? R.tabletGrey : [];
  tabletsOptsForBlank().forEach(function(word, i){
    const b = document.createElement("button");
    b.type = "button";
    const hinted = grey.indexOf(word) >= 0;
    b.className = "tablets-stone" + (String(word).length > 10 ? " long" : "") + (hinted ? " hinted" : "");
    b.dataset.word = word;
    b.disabled = hinted;
    const key = document.createElement("span");
    key.className = "tablets-key";
    key.textContent = String(i + 1);
    const w = document.createElement("span");
    w.className = "tablets-word";
    w.textContent = word;
    b.appendChild(key);
    b.appendChild(w);
    if(!hinted) b.addEventListener("click", function(){ tabletsPick(word); });
    grid.appendChild(b);
  });
  paintTabletsIllumBtn();
}
function tabletsIlluminate(){
  if(!R || R.ended || R.paused || R.mode !== "tablets") return;
  if(R.tabletHintedIdx === R.tabletIdx){
    if(typeof toast === "function") toast("This blank is already lit");
    return;
  }
  if(!R.powers || R.powers.illum < 1){
    if(typeof toast === "function") toast("No Illuminate left");
    return;
  }
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return;
  const opts = tabletsOptsForBlank();
  const decoys = opts.filter(function(w){ return String(w).toLowerCase() !== String(blank.a).toLowerCase(); });
  R.tabletGrey = decoys.slice(0, 2);
  R.tabletHintedIdx = R.tabletIdx;
  R.powers.illum--;
  R.usedPower = true;
  R.powersSpent = (R.powersSpent || 0) + 1;
  if(R.illumFromReserve > 0) R.illumFromReserve--;
  paintTabletsTray();
  if(typeof toast === "function") toast("Illuminate — two stones dimmed");
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
}
function setTabletsPaused(on){
  if(!R || R.mode !== "tablets" || R.ended) return;
  R.paused = !!on;
  const ov = $("tablets-pause");
  if(ov){
    ov.hidden = !R.paused;
    ov.classList.toggle("on", R.paused);
  }
  if(R.paused){
    stopTabletsLoop();
  } else {
    R.tabletLast = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    R.tabletRacing = true;
    if(typeof requestAnimationFrame === "function") R.tabletRaf = requestAnimationFrame(tabletsTick);
  }
}
function toggleTabletsPause(){
  if(!R || R.mode !== "tablets" || R.ended) return;
  setTabletsPaused(!R.paused);
}
function tabletsPick(word){
  if(!R || R.ended || R.paused || R.mode !== "tablets") return;
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return;
  const got = String(word || "").toLowerCase().trim();
  const need = String(blank.a || "").toLowerCase().trim();
  if(got === need) tabletsResolve(true);
  else tabletsResolve(false);
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
  if(!R || R.ended || R.paused || R.mode !== "tablets" || R.tabletResolving) return;
  const ch = tabletsChapter();
  R.tabletResolving = true;
  stopTabletsLoop();
  R.attempts = (R.attempts || 0) + 1;
  if(!ok){
    R.tabletMiss = (R.tabletMiss || 0) + 1;
    if(typeof Snd !== "undefined" && Snd.shatter) Snd.shatter();
    paintTabletsStage("miss");
    const failedGrid = $("tablets-grid");
    if(failedGrid) failedGrid.classList.add("locked");
    tabletsShatter();
    setTimeout(function(){ tabletsFinishResolve(false); }, 800);
    return;
  }
  R.correct = (R.correct || 0) + 1;
  R.score = (R.score || 0) + 1;
  R.streak = (R.streak || 0) + 1;
  R.best = Math.max(R.best || 0, R.streak);
  if(typeof Snd !== "undefined" && Snd.carve) Snd.carve();
  paintTabletsStage("hit");
  const grid = $("tablets-grid");
  if(grid) grid.classList.add("locked");
  setTimeout(function(){ tabletsFinishResolve(true); }, 500);
}
function tabletsFinishResolve(ok){
  if(!R || R.ended || R.mode !== "tablets" || !R.tabletResolving) return;
  const ch = tabletsChapter();
  R.tabletResolving = false;
  if(!ok){
    if(typeof endRun === "function") endRun("death");
    return;
  }
  R.tabletIdx++;
  R.tabletProgress = 0;
  R.tabletOpts = null;
  R.tabletGrey = [];
  R.tabletHintedIdx = -1;
  paintTabletsHud();
  if(R.tabletIdx >= ch.blanks.length){
    if(typeof endRun === "function") endRun("complete");
    return;
  }
  paintTabletsStage();
  paintTabletsTray();
}
function tabletsTick(now){
  if(!R || R.ended || R.paused || R.mode !== "tablets" || !R.tabletRacing) return;
  const last = R.tabletLast || now;
  const dt = Math.min((now - last) / 1000, 0.1);
  R.tabletLast = now;
  if(!tabletsReduced()){
    const dur = (typeof Tablets !== "undefined" && Tablets.BLANK_MS) ? Tablets.BLANK_MS / 1000 : 6.5;
    R.tabletProgress = (R.tabletProgress || 0) + dt / dur;
    paintTabletsClock();
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
  R.tabletResolving = false;
  R.tabletOpts = null;
  R.tabletGrey = [];
  R.tabletHintedIdx = -1;
  R.tabletTotal = ch.blanks.length;
  R.qTotal = ch.blanks.length;
  R.tabletRacing = true;
  R.paused = false;
  R.streak = 0;
  const ov = $("tablets-pause");
  if(ov){ ov.hidden = true; ov.classList.remove("on"); }
  paintTabletsHud();
  paintTabletsStage();
  paintTabletsTray();
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
  const pauseBtn = $("tablets-pause-btn");
  if(pauseBtn && !pauseBtn._bound){
    pauseBtn._bound = true;
    pauseBtn.addEventListener("click", function(){ toggleTabletsPause(); });
  }
  const resume = $("tablets-resume");
  if(resume && !resume._bound){
    resume._bound = true;
    resume.addEventListener("click", function(){ setTabletsPaused(false); });
  }
  const pauseQuit = $("tablets-pause-quit");
  if(pauseQuit && !pauseQuit._bound){
    pauseQuit._bound = true;
    pauseQuit.addEventListener("click", function(){
      setTabletsPaused(false);
      if(typeof quitTablets === "function") quitTablets();
    });
  }
  const illum = $("tablets-illum");
  if(illum && !illum._bound){
    illum._bound = true;
    illum.addEventListener("click", tabletsIlluminate);
  }
  if(typeof window !== "undefined" && !window._tabletsKeys){
    window._tabletsKeys = true;
    window.addEventListener("keydown", function(e){
      if(typeof currentView === "undefined" || currentView !== "tablets") return;
      if(!R || R.ended || R.mode !== "tablets") return;
      const k = (e.key || "").toLowerCase();
      if(R.paused){
        if(k === "enter" || k === " "){
          e.preventDefault();
          setTabletsPaused(false);
        }
        return;
      }
      const letters = { a:0, b:1, c:2, d:3 };
      let n = parseInt(e.key, 10);
      if(k in letters) n = letters[k] + 1;
      if(n >= 1 && n <= 4){
        const grid = $("tablets-grid");
        const btns = grid ? grid.querySelectorAll(".tablets-stone") : [];
        const btn = btns[n - 1];
        if(btn && !btn.disabled) tabletsPick(btn.dataset.word);
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
  window.tabletsFinishResolve = tabletsFinishResolve;
  window.tabletsPick = tabletsPick;
  window.tabletsIlluminate = tabletsIlluminate;
  window.toggleTabletsPause = toggleTabletsPause;
  window.setTabletsPaused = setTabletsPaused;
}
