function tabletsReduced(){
  return !!(document.body && (document.body.classList.contains("reduced") || document.body.classList.contains("motion-calm")));
}
function tabletsUntimed(){
  return tabletsReduced() || !!(typeof R !== "undefined" && R && R.tabletTutorial);
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
function tabletsClockMax(){
  if(typeof Tablets !== "undefined" && Tablets.clockS) return Tablets.clockS();
  return 25;
}
function tabletsTier(streak){
  if(streak >= 8) return { name:"DIVINE PRESENCE", mult:4 };
  if(streak >= 5) return { name:"EXALTED", mult:3 };
  if(streak >= 3) return { name:"ANOINTED", mult:2 };
  if(streak >= 1) return { name:"SANCTIFIED", mult:1.5 };
  return { name:"DEVOTED", mult:1 };
}
function paintTabletsClock(){
  const fill = $("tablets-clock-fill");
  const lab = $("tablets-clock-lab");
  const max = R.tabletClockMax || tabletsClockMax() || 1;
  const left = tabletsUntimed() ? 1 : (R.tabletClock || 0) / max;
  if(fill){
    fill.style.width = (Math.min(100, Math.max(0, left) * 100)) + "%";
    fill.classList.toggle("banked", left > 1 && !tabletsUntimed());
    fill.classList.toggle("urgent", (R.tabletClock || 0) <= 6 && !tabletsUntimed());
  }
  if(lab){
    if(tabletsUntimed()) lab.textContent = "Untimed Hold";
    else lab.textContent = (Math.max(0, R.tabletClock || 0)).toFixed(1) + "s";
  }
}
function spawnTabletsScorePopup(text, slotEl){
  const ms = $("tablets-ms");
  if(!ms) return;
  const popup = document.createElement("div");
  popup.className = "tablets-score-popup";
  popup.textContent = text;
  if(slotEl && slotEl.getBoundingClientRect){
    const msRect = ms.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();
    popup.style.left = Math.max(50, Math.min((ms.clientWidth || 500) - 50, slotRect.left + (slotRect.width || 0) / 2 - msRect.left)) + "px";
    popup.style.top = Math.max(30, Math.min((ms.clientHeight || 400) - 30, slotRect.top + (slotRect.height || 0) / 2 - msRect.top)) + "px";
  } else {
    popup.style.left = "50%";
    popup.style.top = "40%";
  }
  ms.appendChild(popup);
  setTimeout(function(){ try{ popup.remove(); }catch(e){} }, 900);
}
function tabletsPlayGoldChime(){
  if(!(typeof Snd !== "undefined" && Snd.ctx)) return;
  try{
    const ctx = Snd.ctx;
    if(ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(f, t);
      const d = i * 0.025;
      g.gain.setValueAtTime(0.001, t);
      g.gain.setValueAtTime(0.18 / (i + 1), t + d);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.55);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t + d);
      o.stop(t + d + 0.55);
    });
  }catch(e){}
}
function tabletsPlayDangerWarn(){
  if(!(typeof Snd !== "undefined" && Snd.ctx)) return;
  try{
    const ctx = Snd.ctx;
    if(ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(220, t);
    o.frequency.linearRampToValueAtTime(196, t + 0.09);
    g.gain.setValueAtTime(0.09, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.09);
  }catch(e){}
}
function paintTabletsTutorialCallout(){
  const callout = $("tablets-tut-callout");
  if(!callout) return;
  if(!R || !R.tabletTutorial){
    callout.hidden = true;
    callout.textContent = "";
    return;
  }
  const prompts = [
    "Tap FATHER below (or press 1–4)",
    "The word flies into the carved slot",
    "In the true Hold the sand runs; here it stands still",
    "Illuminate glows the true stone for a breath",
    "Winnow casts two false stones into shadow",
    "Two lamps guard a wrong word. The sand is the Hold",
    "Almost complete · Let no word be lost",
    "Final word · Engrave it to seal your first Hold and open the Hall!"
  ];
  const msg = prompts[R.tabletIdx || 0] || "Carve the missing word to complete the prayer.";
  callout.textContent = msg;
  callout.hidden = false;
}
function paintTabletsVerse(blank, carved){
  const verse = $("tablets-verse");
  if(!verse) return;
  verse.innerHTML = "";
  if(!blank){ verse.textContent = ""; return; }
  const pre = document.createElement("span");
  pre.textContent = blank.prefix + " ";
  const mid = document.createElement("span");
  mid.className = "tablets-blank-word" + (carved ? " in" : "");
  mid.textContent = carved ? blank.a : "___";
  const suf = document.createElement("span");
  suf.textContent = blank.suffix ? (" " + blank.suffix) : "";
  verse.appendChild(pre);
  verse.appendChild(mid);
  verse.appendChild(suf);
}
function paintTabletsSlot(blank, kind){
  const slot = $("tablets-slot");
  if(!slot) return;
  slot.classList.remove("glow");
  if(kind === "hit" && blank){
    slot.textContent = blank.a;
    slot.classList.add("glow");
  } else {
    slot.textContent = "— — —";
  }
}
function tabletsShowFracture(){
  const f = $("tablets-fracture");
  if(!f) return;
  f.classList.add("active");
  setTimeout(function(){ try{ f.classList.remove("active"); }catch(e){} }, 500);
}
function paintTabletsTablet(answer){
  const ch = tabletsChapter();
  const i = R.tabletIdx || 0;
  const blank = ch.blanks[i];
  const refEl = $("tablets-ref");
  if(refEl) refEl.textContent = blank ? blank.r : ch.r;
  paintTabletsVerse(blank, answer === "hit" || answer === "done");
  paintTabletsSlot(blank, answer === "hit" ? "hit" : "");
  if(answer === "miss") tabletsShowFracture();
  paintTabletsPips();
  paintTabletsClock();
}
function paintTabletsStage(answer){
  paintTabletsTablet(answer);
}
function paintTabletsPips(){
  const host = $("tablets-pips");
  if(!host) return;
  host.innerHTML = "";
  const ch = tabletsChapter();
  const idx = R.tabletIdx || 0;
  if(ch.blanks.length > 20) return;
  const n = ch.blanks.length;
  ch.blanks.forEach(function(_, i){
    const pip = document.createElement("i");
    pip.className = "tablets-pip" + (i < idx ? " done" : (i === idx ? " on" : ""));
    pip.style.left = (n > 1 ? (i / (n - 1)) * 96 + 2 : 50) + "%";
    host.appendChild(pip);
  });
}
function tabletsParentSite(){
  const ch = tabletsChapter();
  if(!(ch && ch.after) || typeof Pilgrimage === "undefined" || !Pilgrimage.site) return null;
  return Pilgrimage.site(ch.after) || null;
}
function tabletsReact(ok){
  const fig = $("tablets-companion");
  if(!fig || fig.hidden) return;
  fig.classList.remove("success", "failure");
  void fig.offsetWidth;
  fig.classList.add(ok ? "success" : "failure");
  clearTimeout(fig._t);
  fig._t = setTimeout(function(){ fig.classList.remove("success", "failure"); }, ok ? 1100 : 820);
}
function paintTabletsPlaceCard(ch, site){
  const place = $("tablets-place");
  const sub = $("tablets-place-sub");
  const kicker = $("tablets-place-kicker");
  if(kicker) kicker.textContent = "The tablet";
  if(place) place.textContent = site ? (ch.afterName || site.name) : (R.tabletTutorial ? "The Lord's Prayer" : "The Hall");
  if(sub) sub.textContent = site ? (ch.name + " · " + (site.modernCountry || "")) : (ch.subtitle || "");
}
function paintTabletsCompanion(site){
  const fig = $("tablets-companion");
  const img = $("tablets-companion-img");
  const sign = $("tablets-companion-sign");
  if(fig && site && typeof companionQuestionSrc === "function"){
    fig.hidden = false;
    fig.removeAttribute("hidden");
    if(img) img.src = companionQuestionSrc(site);
    if(sign) sign.textContent = typeof companionQuestionName === "function" ? companionQuestionName(site) : "";
  } else if(fig){
    fig.hidden = true;
    fig.setAttribute("hidden", "");
  }
}
function paintTabletsCast(){
  const ch = tabletsChapter();
  const site = tabletsParentSite();
  paintTabletsPlaceCard(ch, site);
  paintTabletsCompanion(site);
}
function paintTabletsProgressStats(pct, rec){
  const pctEl = $("tablets-pct");
  if(pctEl) pctEl.textContent = pct + "%";
  const fill = $("tablets-fill");
  if(fill) fill.style.width = pct + "%";
  const ghost = $("tablets-ghost");
  if(ghost){
    const hasBest = (rec && rec.best > 0);
    ghost.hidden = !hasBest;
    if(hasBest) ghost.style.left = rec.best + "%";
  }
}
function paintTabletsTier(){
  const t = tabletsTier(R.streak || 0);
  const name = $("tablets-tier-name");
  const mult = $("tablets-mult");
  const pill = $("tablets-tier");
  if(name) name.textContent = t.name;
  if(mult) mult.textContent = t.mult.toFixed(1) + "×";
  if(pill) pill.classList.toggle("elevated", (R.streak || 0) >= 3);
}
function paintTabletsSurge(){
  const fill = $("tablets-surge-fill");
  const status = $("tablets-surge-status");
  const panel = $("tablets-surge");
  const pct = Math.min(100, Math.round(R.surge || 0));
  if(fill) fill.style.width = pct + "%";
  if(status){
    if(R.surgeOn) status.textContent = Math.ceil(R.surgeLeft || 0) + "s";
    else if((R.surge || 0) >= 100) status.textContent = "READY!";
    else status.textContent = pct + "%";
  }
  if(panel){
    panel.classList.toggle("ready", !!(R.surgeOn || (R.surge || 0) >= 100));
    panel.classList.toggle("spent", !!R.tabletTutorial);
  }
  const aura = $("tablets-aura");
  if(aura) aura.classList.toggle("active", !!R.surgeOn);
}
function paintTabletsHud(){
  const ch = tabletsChapter();
  const pct = tabletsPct();
  const rec = Tablets.recordOf(typeof SAVE !== "undefined" ? SAVE : null, ch.id);
  const idx = R.tabletIdx || 0;
  paintTabletsCast();
  const chEl = $("tablets-chapter");
  if(chEl) chEl.textContent = ch.name;
  const subEl = $("tablets-sub");
  if(subEl){
    const pace = R.tabletTutorial ? "Learn the Hold" : ((Tablets.levelName && Tablets.levelName(R.tabletLevel)) || "I");
    subEl.textContent = pace + " · " + (ch.subtitle || "KJV");
  }
  const remEl = $("tablets-remain");
  if(remEl) remEl.textContent = Math.min(idx + 1, ch.blanks.length) + " / " + ch.blanks.length;
  const strkEl = $("tablets-streak");
  if(strkEl) strkEl.textContent = String(R.streak || 0);
  const favEl = $("tablets-favor");
  if(favEl) favEl.textContent = String(R.favor || 0);
  const bestEl = $("tablets-best");
  if(bestEl) bestEl.textContent = (rec.best || 0) + "%";
  paintTabletsProgressStats(pct, rec);
  paintTabletsTier();
  paintTabletsSurge();
  paintTabletsIllumBtn();
  paintTabletsTutorialCallout();
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
function paintTabletsPowers(){
  const illum = $("tablets-illum");
  if(illum){
    const n = (R.powers && R.powers.illum) || 0;
    const lab = $("tablets-illum-n");
    if(lab) lab.textContent = String(n);
    else illum.textContent = "Illuminate ×" + n;
    illum.disabled = n < 1;
    illum.classList.toggle("spent", n < 1);
  }
  const winnow = $("tablets-winnow");
  if(winnow){
    const n = (R.powers && R.powers.winnow) || 0;
    const lab = $("tablets-winnow-n");
    if(lab) lab.textContent = String(n);
    else winnow.textContent = "Winnow ×" + n;
    winnow.disabled = n < 1;
    winnow.classList.toggle("spent", n < 1);
  }
  const lamps = $("tablets-lamps");
  if(lamps){
    const left = Math.max(0, (R.tabletLives || 1) - (R.tabletMiss || 0));
    const lab = $("tablets-lamps-n");
    if(lab && lamps.children && lamps.children.indexOf && lamps.children.indexOf(lab) >= 0) lab.textContent = String(left);
    else lamps.textContent = "Lamps ×" + left;
    lamps.classList.toggle("low", left <= 1);
  }
}
function paintTabletsIllumBtn(){
  paintTabletsPowers();
}
function tabletsStoneButtons(){
  const grid = $("tablets-grid");
  return (grid && grid.children) ? [].slice.call(grid.children) : [];
}
function paintTabletsTray(){
  const grid = $("tablets-grid");
  if(!grid) return;
  grid.classList.remove("locked");
  grid.innerHTML = "";
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return;
  const grey = tabletsGreyWords();
  const badges = ["A", "B", "C", "D"];
  tabletsOptsForBlank().forEach(function(word, i){
    const b = document.createElement("button");
    b.type = "button";
    const dimmed = grey.indexOf(word) >= 0;
    b.className = "tablets-stone" + (String(word).length > 10 ? " long" : "") + (dimmed ? " dim" : "");
    b.dataset.word = word;
    b.dataset.idx = String(i);
    b.disabled = dimmed;
    const key = document.createElement("span");
    key.className = "tablets-key";
    key.textContent = badges[i] || String(i + 1);
    const w = document.createElement("span");
    w.className = "tablets-word";
    w.textContent = word;
    b.appendChild(key);
    b.appendChild(w);
    if(!dimmed) b.addEventListener("click", function(){ tabletsPick(word); });
    grid.appendChild(b);
  });
  paintTabletsIllumBtn();
}
function tabletsTrueStone(){
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return null;
  const need = String(blank.a || "").toLowerCase().trim();
  const btns = tabletsStoneButtons();
  let i = 0;
  for(; i < btns.length; i++){
    if(String(btns[i].dataset && btns[i].dataset.word || "").toLowerCase().trim() === need) return btns[i];
  }
  return null;
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
  const target = tabletsTrueStone();
  if(!target) return;
  R.tabletHintedIdx = R.tabletIdx;
  R.powers.illum--;
  R.usedPower = true;
  R.powersSpent = (R.powersSpent || 0) + 1;
  if(R.illumFromReserve > 0) R.illumFromReserve--;
  target.classList.add("revealed");
  setTimeout(function(){ try{ target.classList.remove("revealed"); }catch(e){} }, 2000);
  paintTabletsIllumBtn();
  if(typeof toast === "function") toast("Illuminate — the true stone glows");
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
}
function tabletsGreyWords(){
  if(R.tabletWinnowIdx === R.tabletIdx && R.tabletWinnow) return R.tabletWinnow.slice();
  return [];
}
function tabletsWinnow(){
  if(!R || R.ended || R.paused || R.mode !== "tablets") return;
  if(R.tabletWinnowIdx === R.tabletIdx){
    if(typeof toast === "function") toast("This blank is already winnowed");
    return;
  }
  if(!R.powers || (R.powers.winnow || 0) < 1){
    if(typeof toast === "function") toast("No Winnow left");
    return;
  }
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return;
  const opts = tabletsOptsForBlank();
  const grey = tabletsGreyWords();
  const decoys = opts.filter(function(w){
    return String(w).toLowerCase() !== String(blank.a).toLowerCase() && grey.indexOf(w) < 0;
  });
  if(decoys.length < 1){
    if(typeof toast === "function") toast("Nothing left to winnow");
    return;
  }
  R.tabletWinnow = decoys.slice(0, 2);
  R.tabletWinnowIdx = R.tabletIdx;
  R.powers.winnow--;
  R.usedPower = true;
  R.powersSpent = (R.powersSpent || 0) + 1;
  paintTabletsTray();
  if(typeof toast === "function") toast("Winnow — a false stone falls away");
  if(typeof Director !== "undefined" && Director.speak) Director.speak("Winnow — a false stone falls away.", true);
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
  } else if(!R.tabletResolving){
    R.tabletLast = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    R.tabletRacing = true;
    if(typeof requestAnimationFrame === "function") R.tabletRaf = requestAnimationFrame(tabletsTick);
  }
}
function toggleTabletsPause(){
  if(!R || R.mode !== "tablets" || R.ended) return;
  setTabletsPaused(!R.paused);
}
function tabletsMarkPicked(word){
  tabletsStoneButtons().forEach(function(b){
    if(!b || !b.classList) return;
    if(b.dataset && b.dataset.word === word) b.classList.add("selected");
    else b.classList.remove("selected");
  });
}
function tabletsPick(word){
  if(!R || R.ended || R.paused || R.mode !== "tablets") return;
  const ch = tabletsChapter();
  const blank = ch.blanks[R.tabletIdx];
  if(!blank) return;
  tabletsMarkPicked(word);
  const got = String(word || "").toLowerCase().trim();
  const need = String(blank.a || "").toLowerCase().trim();
  if(got === need) tabletsResolve(true);
  else tabletsResolve(false);
}
function tabletsApplyTrauma(amount){
  if(tabletsReduced()) return;
  R.trauma = Math.min(1, (R.trauma || 0) + (amount || 0.9));
  if(typeof SAVE !== "undefined" && SAVE.set && SAVE.set.haptics && typeof navigator !== "undefined" && navigator.vibrate){
    try{ navigator.vibrate([100, 50, 100]); }catch(e){}
  }
}
function tabletsTickTrauma(dt){
  if(!(R.trauma > 0)){
    const stage = $("tablets-stage");
    if(stage && stage.style) stage.style.transform = "";
    return;
  }
  R.trauma = Math.max(0, R.trauma - dt * 1.8);
  const stage = $("tablets-stage");
  if(!stage || !stage.style) return;
  const shake = R.trauma * R.trauma * 16;
  const rx = (Math.random() * 2 - 1) * shake;
  const ry = (Math.random() * 2 - 1) * shake;
  stage.style.transform = "translate(" + rx + "px," + ry + "px)";
}
function finishTabletsTutorial(){
  stopTabletsLoop();
  R.ended = true;
  R.tabletRacing = false;
  if(typeof SAVE !== "undefined" && SAVE.set){
    SAVE.set.tabletsTutorialDone = true;
    if(typeof persist === "function") persist();
  }
  if(typeof toast === "function") toast("The Lord's Prayer is held. The Hall is open.");
  if(typeof Snd !== "undefined" && Snd.victory) Snd.victory();
  if(typeof openBrief === "function") openBrief("tablets");
}
function tabletsResolveMiss(){
  if(!R.tabletTutorial){
    R.tabletMiss = (R.tabletMiss || 0) + 1;
    R.streak = 0;
    R.surge = Math.max(0, (R.surge || 0) - 25);
  }
  if(typeof Snd !== "undefined" && Snd.shatter) Snd.shatter();
  paintTabletsTablet("miss");
  tabletsReact(false);
  const failedGrid = $("tablets-grid");
  if(failedGrid) failedGrid.classList.add("locked");
  tabletsApplyTrauma(0.9);
  const picked = tabletsStoneButtons().filter(function(b){ return b.classList && b.classList.contains("selected"); })[0];
  if(picked) picked.classList.add("shatter");
  paintTabletsHud();
}
function tabletsHitFavor(){
  const t = tabletsTier(R.streak || 0);
  const mult = t.mult * (R.surgeOn ? 3 : 1) * (R.tabletTrial ? 2.5 : 1);
  return Math.round((120 + (R.tabletClock || 0) * 8) * mult);
}
function tabletsChargeSurge(elapsed){
  if(R.tabletTutorial) return;
  const add = elapsed < 4 ? 34 : 18;
  R.surge = Math.min(100, (R.surge || 0) + add);
}
function tabletsResolveHit(){
  R.correct = (R.correct || 0) + 1;
  R.score = (R.score || 0) + 1;
  R.streak = (R.streak || 0) + 1;
  R.best = Math.max(R.best || 0, R.streak);
  const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  tabletsChargeSurge((now - (R.tabletBlankStart || now)) / 1000);
  const favor = tabletsHitFavor();
  R.favor = (R.favor || 0) + favor;
  const slot = $("tablets-slot");
  spawnTabletsScorePopup("+" + favor + " FAVOR", slot);
  if(typeof Snd !== "undefined" && Snd.carve) Snd.carve();
  tabletsPlayGoldChime();
  paintTabletsTablet("hit");
  tabletsPulseSpeech();
  tabletsReact(true);
  const grid = $("tablets-grid");
  if(grid) grid.classList.add("locked");
  const picked = tabletsStoneButtons().filter(function(b){ return b.classList && b.classList.contains("selected"); })[0];
  tabletsFlyWord(picked, slot, (tabletsChapter().blanks[R.tabletIdx] || {}).a, function(){});
  if(!R.tabletTutorial) tabletsRollBlessing();
}
function tabletsResolve(ok){
  if(!R || R.ended || R.paused || R.mode !== "tablets" || R.tabletResolving) return;
  R.tabletResolving = true;
  R.attempts = (R.attempts || 0) + 1;
  setTimeout(function(){ tabletsFinishResolve(ok); }, ok ? 500 : 800);
  if(!ok){ tabletsResolveMiss(); return; }
  tabletsResolveHit();
}
function tabletsUnlockGrid(){
  const grid = $("tablets-grid");
  if(grid) grid.classList.remove("locked");
}
function tabletsResetBlankAids(){
  R.tabletOpts = null;
  R.tabletGrey = [];
  R.tabletWinnow = [];
  R.tabletHintedIdx = -1;
  R.tabletWinnowIdx = -1;
  R.tabletBlankStart = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
}
function tabletsFinishResolve(ok){
  if(!R || R.ended || R.mode !== "tablets" || !R.tabletResolving) return;
  const ch = tabletsChapter();
  R.tabletResolving = false;
  if(!ok){
    if(R.tabletTutorial || (R.tabletMiss || 0) < (R.tabletLives || 1)){
      tabletsResetBlankAids();
      tabletsUnlockGrid();
      paintTabletsHud();
      paintTabletsTablet();
      paintTabletsTray();
      return;
    }
    if(typeof endRun === "function") endRun("death");
    return;
  }
  R.tabletIdx++;
  tabletsResetBlankAids();
  if(R.tabletIdx >= ch.blanks.length){
    if(R.tabletTutorial) finishTabletsTutorial();
    else if(typeof endRun === "function") endRun("complete");
    return;
  }
  if(!R.tabletTutorial){
    R.tabletClock = tabletsClockMax();
    R.tabletLastWarnSec = -1;
  }
  tabletsUnlockGrid();
  paintTabletsHud();
  paintTabletsTablet();
  paintTabletsTray();
}
function tabletsBurnSand(dt){
  if(!R || R.ended || R.surgeOn || tabletsUntimed()) return;
  const rate = R.tabletTrial ? 1.35 : 1;
  R.tabletClock = Math.max(0, (R.tabletClock || 0) - dt * rate);
  const sec = Math.floor(R.tabletClock);
  if(R.tabletClock <= 5 && sec !== R.tabletLastWarnSec){
    R.tabletLastWarnSec = sec;
    tabletsPlayDangerWarn();
  }
  if(R.tabletClock > 0) return;
  R.tabletTimeout = true;
  if(typeof endRun === "function") endRun("death");
}
function tabletsTickSurge(dt){
  if(!R.surgeOn) return;
  R.surgeLeft = (R.surgeLeft || 0) - dt;
  if(R.surgeLeft > 0) return;
  R.surgeOn = false;
  R.surge = 0;
  R.surgeLeft = 0;
}
function tabletsTick(now){
  if(!R || R.ended || R.paused || R.mode !== "tablets" || !R.tabletRacing) return;
  const dt = Math.min((now - (R.tabletLast || now)) / 1000, 0.1);
  R.tabletLast = now;
  if(R.surgeOn) tabletsTickSurge(dt);
  if(!tabletsUntimed() && !R.surgeOn) tabletsBurnSand(dt);
  if(R.ended) return;
  tabletsTickTrauma(dt);
  drawTabletsFx(dt, now);
  paintTabletsClock();
  paintTabletsSurge();
  R.tabletRaf = requestAnimationFrame(tabletsTick);
}
function startTabletsLoop(){
  stopTabletsLoop();
  const ch = tabletsChapter();
  R.tabletIdx = 0;
  R.tabletClock = tabletsClockMax();
  R.tabletClockMax = R.tabletClock;
  R.tabletTimeout = false;
  R.tabletLastWarnSec = -1;
  R.tabletMiss = 0;
  R.tabletLives = 2;
  R.tabletResolving = false;
  R.favor = 0;
  R.surge = 0;
  R.surgeOn = false;
  R.surgeLeft = 0;
  R.trauma = 0;
  tabletsResetBlankAids();
  R.tabletTotal = ch.blanks.length;
  R.qTotal = ch.blanks.length;
  R.tabletRacing = true;
  R.paused = false;
  R.streak = 0;
  const ov = $("tablets-pause");
  if(ov){ ov.hidden = true; ov.classList.remove("on"); }
  paintTabletsHud();
  paintTabletsTablet();
  paintTabletsTray();
  R.tabletLast = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  if(typeof requestAnimationFrame === "function") R.tabletRaf = requestAnimationFrame(tabletsTick);
}
function tabletsPulseSpeech(){
  const el = $("tablets-speech");
  if(!el || tabletsReduced()) return;
  el.hidden = false;
  el.classList.add("active");
  clearTimeout(el._t);
  el._t = setTimeout(function(){ el.classList.remove("active"); el.hidden = true; }, 2000);
}
function tabletsApplyTrial(on){
  if(typeof R !== "undefined" && R) R.tabletTrial = !!on;
  const el = $("v-tablets");
  if(el) el.classList.toggle("trial-mode", !!on);
  const btn = $("tablets-trial");
  if(btn){
    btn.classList.toggle("on", !!on);
    btn.textContent = on ? "Trial on" : "Trial";
  }
}
function tabletsToggleTrial(){
  if(!R || R.mode !== "tablets") return;
  const on = !R.tabletTrial;
  tabletsApplyTrial(on);
  if(typeof SAVE !== "undefined" && SAVE.set){
    SAVE.set.tabletTrial = on;
    if(typeof persist === "function") persist();
  }
  if(typeof toast === "function") toast(on ? "Trial · sand runs faster, Favor is 2.5×" : "Trial off");
}
function tabletsBindOnce(id, fn){
  const el = $(id);
  if(el && !el._bound){
    el._bound = true;
    el.addEventListener("click", fn);
  }
}
function bindTabletsChrome(){
  tabletsBindOnce("tablets-quit", function(){
    if(typeof quitTablets === "function") quitTablets();
    else if(typeof abandonRun === "function") abandonRun();
  });
  tabletsBindOnce("tablets-pause-btn", function(){ toggleTabletsPause(); });
  tabletsBindOnce("tablets-resume", function(){ setTabletsPaused(false); });
  tabletsBindOnce("tablets-pause-quit", function(){
    setTabletsPaused(false);
    if(typeof quitTablets === "function") quitTablets();
  });
  tabletsBindOnce("tablets-illum", tabletsIlluminate);
  tabletsBindOnce("tablets-winnow", tabletsWinnow);
  tabletsBindOnce("tablets-surge", tabletsSurge);
  tabletsBindOnce("tablets-theme", tabletsCycleStone);
  tabletsBindOnce("tablets-trial", tabletsToggleTrial);
  if(typeof window !== "undefined" && !window._tabletsKeys){
    window._tabletsKeys = true;
    window.addEventListener("keydown", tabletsOnKey);
    window.addEventListener("resize", tabletsOnResize);
  }
}
function tabletsOnKey(e){
  if(typeof currentView === "undefined" || currentView !== "tablets") return;
  if(!R || R.ended || R.mode !== "tablets") return;
  const k = (e.key || "").toLowerCase();
  if(R.paused){
    if(k === "enter" || k === " "){ e.preventDefault(); setTabletsPaused(false); }
    return;
  }
  if(k === "i"){ e.preventDefault(); tabletsIlluminate(); return; }
  if(k === "w"){ e.preventDefault(); tabletsWinnow(); return; }
  if(k === "s"){ e.preventDefault(); tabletsSurge(); return; }
  const letters = { a:0, b:1, c:2, d:3 };
  let n = parseInt(e.key, 10);
  if(k in letters) n = letters[k] + 1;
  if(!(n >= 1 && n <= 4)) return;
  const btn = tabletsStoneButtons()[n - 1];
  if(btn && !btn.disabled) tabletsPick(btn.dataset.word);
}
function tabletsOnResize(){
  if(typeof currentView !== "undefined" && currentView === "tablets") tabletsFxSize();
}
function tabletsSpeakStart(){
  if(!(typeof Director !== "undefined" && Director.speak)) return;
  if(R.tabletTutorial) Director.speak("Learn the Hold. Choose the missing word.", true);
  else Director.speak("Carve the missing word. Two lamps guard the tablet.", true);
}
function startTabletsStage(){
  bindTabletsChrome();
  tabletsApplyStone((typeof SAVE !== "undefined" && SAVE.set && SAVE.set.tabletStone) || "sandstone");
  tabletsApplyTrial(!!(typeof SAVE !== "undefined" && SAVE.set && SAVE.set.tabletTrial));
  tabletsFxInit();
  const ch = tabletsChapter();
  const site = tabletsParentSite();
  if($("hud-round")) $("hud-round").textContent = ch.name;
  if(typeof Snd !== "undefined"){
    if(Snd.stopBeds) Snd.stopBeds();
    if(Snd.ambience) Snd.ambience("indigo");
  }
  if(site && typeof Backdrop !== "undefined" && Backdrop.palette && typeof Pilgrimage !== "undefined"){
    const arc = Pilgrimage.arc ? Pilgrimage.arc(site.arc) : null;
    Backdrop.palette((arc && arc.pal) || "act2");
  }
  go("tablets");
  if(typeof applySiteSky === "function") applySiteSky(site ? site.id : null);
  startTabletsLoop();
  tabletsSpeakStart();
}
function tabletsSurge(){
  if(!R || R.ended || R.paused || R.mode !== "tablets" || R.tabletTutorial) return;
  if((R.surge || 0) < 100 || R.surgeOn) return;
  R.surgeOn = true;
  R.surgeLeft = 9;
  tabletsPlayGoldChime();
  spawnTabletsSparks(0, 0, 24);
  if((R.powers && R.powers.winnow) || 0) tabletsWinnow();
  paintTabletsSurge();
  paintTabletsHud();
}
function tabletsRollBlessing(){
  if(Math.random() >= 0.22) return;
  const picks = [
    { icon:"🏺", text:"Manna Jar Discovered (+15s Sand)", apply:function(){
      const cap = R.tabletClockMax || tabletsClockMax();
      R.tabletClock = Math.min(cap, (R.tabletClock || 0) + 15);
    } },
    { icon:"🕯️", text:"Golden Censer (+1 Lamp Restored)", apply:function(){ R.tabletLives = (R.tabletLives || 2) + 1; } },
    { icon:"✨", text:"Shekinah Glory (+35% Surge Charge)", apply:function(){ R.surge = Math.min(100, (R.surge || 0) + 35); } }
  ];
  const b = picks[Math.floor(Math.random() * picks.length)];
  b.apply();
  const el = $("tablets-blessing");
  const icon = $("tablets-blessing-icon");
  const text = $("tablets-blessing-text");
  if(icon) icon.textContent = b.icon;
  if(text) text.textContent = b.text;
  if(el){
    el.classList.add("active");
    setTimeout(function(){ try{ el.classList.remove("active"); }catch(e){} }, 2800);
  }
  paintTabletsClock();
  paintTabletsPowers();
  paintTabletsSurge();
}
const TABLET_STONES = ["sandstone", "basalt", "limestone", "lapis"];
const TABLET_STONE_NAMES = {
  sandstone:"Sinai Sandstone",
  basalt:"Horeb Basalt",
  limestone:"Jerusalem Limestone",
  lapis:"Sanctuary Lapis"
};
function tabletsApplyStone(name){
  const el = $("v-tablets");
  if(!el) return;
  TABLET_STONES.forEach(function(s){ el.classList.remove("stone-" + s); });
  if(name && name !== "sandstone") el.classList.add("stone-" + name);
}
function tabletsCycleStone(){
  const cur = (typeof SAVE !== "undefined" && SAVE.set && SAVE.set.tabletStone) || "sandstone";
  const i = Math.max(0, TABLET_STONES.indexOf(cur));
  const next = TABLET_STONES[(i + 1) % TABLET_STONES.length];
  if(typeof SAVE !== "undefined" && SAVE.set){
    SAVE.set.tabletStone = next;
    if(typeof persist === "function") persist();
  }
  tabletsApplyStone(next);
  if(typeof toast === "function") toast("Stone · " + (TABLET_STONE_NAMES[next] || next));
}
var tabletsFx = { ctx:null, canvas:null, embers:[], sparks:[], rays:[], w:0, h:0 };
function tabletsFxSize(){
  const canvas = tabletsFx.canvas || $("tablets-fx");
  const stage = $("tablets-stage");
  if(!canvas || !stage) return;
  tabletsFx.canvas = canvas;
  tabletsFx.w = canvas.width = stage.clientWidth || 800;
  tabletsFx.h = canvas.height = stage.clientHeight || 450;
  tabletsFx.rays = [
    { x: tabletsFx.w * 0.15, angle: 0.35, width: 90, base: 0.07 },
    { x: tabletsFx.w * 0.50, angle: 0.20, width: 140, base: 0.09 },
    { x: tabletsFx.w * 0.85, angle: 0.05, width: 100, base: 0.06 }
  ];
}
function tabletsFxInit(){
  tabletsFx.ctx = null;
  tabletsFx.embers = [];
  tabletsFx.sparks = [];
  if(tabletsReduced()) return;
  const canvas = $("tablets-fx");
  if(!canvas || typeof canvas.getContext !== "function") return;
  let ctx = null;
  try{ ctx = canvas.getContext("2d"); }catch(e){ return; }
  if(!ctx) return;
  tabletsFx.canvas = canvas;
  tabletsFx.ctx = ctx;
  tabletsFxSize();
  let i = 0;
  for(; i < 45; i++) tabletsFx.embers.push(tabletsFxMakeEmber(true));
}
function tabletsFxMakeEmber(randomY){
  return {
    x: Math.random() * (tabletsFx.w || 800),
    y: randomY ? Math.random() * (tabletsFx.h || 450) : (tabletsFx.h || 450) + 15,
    vx: (Math.random() - 0.5) * 0.7,
    vy: -(0.5 + Math.random() * 1.1),
    size: 1 + Math.random() * 2.2,
    life: 0,
    max: 180 + Math.random() * 140
  };
}
function spawnTabletsSparks(x, y, count){
  if(!tabletsFx.ctx || tabletsReduced()) return;
  const n = count || 16;
  let i = 0;
  for(; i < n; i++){
    const a = Math.random() * Math.PI * 2;
    const sp = 2 + Math.random() * 5;
    tabletsFx.sparks.push({
      x: x || tabletsFx.w / 2, y: y || tabletsFx.h * 0.45,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5,
      size: 1.5 + Math.random() * 2.5, life: 1, decay: 0.03
    });
  }
}
function drawTabletsFx(dt, now){
  const ctx = tabletsFx.ctx;
  if(!ctx) return;
  const w = tabletsFx.w;
  const h = tabletsFx.h;
  ctx.clearRect(0, 0, w, h);
  const time = (now || 0) * 0.002;
  (tabletsFx.rays || []).forEach(function(ray){
    const alpha = Math.max(0.02, ray.base + Math.sin(time + ray.x) * 0.02 + ((R && R.streak) || 0) * 0.012);
    const grad = ctx.createLinearGradient(ray.x, 0, ray.x + (h * ray.angle), h);
    grad.addColorStop(0, "rgba(255,230,150," + alpha + ")");
    grad.addColorStop(0.6, "rgba(220,160,60," + (alpha * 0.4) + ")");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ray.x - ray.width * 0.5, 0);
    ctx.lineTo(ray.x + ray.width * 0.5, 0);
    ctx.lineTo(ray.x + (h * ray.angle) + ray.width, h);
    ctx.lineTo(ray.x + (h * ray.angle) - ray.width, h);
    ctx.closePath();
    ctx.fill();
  });
  tabletsFx.embers.forEach(function(p){
    p.x += p.vx * (dt * 60);
    p.y += p.vy * (dt * 60);
    p.life += dt * 60;
    if(p.life >= p.max || p.y < -10){
      const n = tabletsFxMakeEmber(false);
      p.x = n.x; p.y = n.y; p.vx = n.vx; p.vy = n.vy; p.size = n.size; p.life = 0; p.max = n.max;
    }
    const a = Math.sin((p.life / p.max) * Math.PI) * 0.65;
    ctx.fillStyle = "hsla(42,95%,65%," + a + ")";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  for(let i = tabletsFx.sparks.length - 1; i >= 0; i--){
    const s = tabletsFx.sparks[i];
    s.x += s.vx * (dt * 60);
    s.y += s.vy * (dt * 60);
    s.vy += 0.15;
    s.life -= s.decay * (dt * 60);
    if(s.life <= 0){ tabletsFx.sparks.splice(i, 1); continue; }
    ctx.fillStyle = "rgba(255,225,130," + s.life + ")";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
function tabletsFlyWord(fromBtn, toSlot, text, done){
  if(!text){ if(done) done(); return; }
  if(tabletsReduced() || !fromBtn || !toSlot || !fromBtn.getBoundingClientRect){
    if(done) done();
    return;
  }
  const start = fromBtn.getBoundingClientRect();
  const target = toSlot.getBoundingClientRect();
  const flyer = document.createElement("div");
  flyer.className = "tablets-flying-word";
  flyer.textContent = text;
  flyer.style.left = (start.left + start.width / 2) + "px";
  flyer.style.top = (start.top + start.height / 2) + "px";
  document.body.appendChild(flyer);
  spawnTabletsSparks(start.left, start.top, 10);
  requestAnimationFrame(function(){
    flyer.style.left = (target.left + target.width / 2) + "px";
    flyer.style.top = (target.top + target.height / 2) + "px";
  });
  setTimeout(function(){
    try{ flyer.remove(); }catch(e){}
    if(done) done();
  }, 460);
}
if(typeof window !== "undefined"){
  window.finishTabletsTutorial = finishTabletsTutorial;
  window.startTabletsStage = startTabletsStage;
  window.stopTabletsLoop = stopTabletsLoop;
  window.tabletsResolve = tabletsResolve;
  window.tabletsFinishResolve = tabletsFinishResolve;
  window.tabletsPick = tabletsPick;
  window.tabletsIlluminate = tabletsIlluminate;
  window.tabletsWinnow = tabletsWinnow;
  window.toggleTabletsPause = toggleTabletsPause;
  window.setTabletsPaused = setTabletsPaused;
  window.tabletsBurnSand = tabletsBurnSand;
  window.tabletsSurge = tabletsSurge;
  window.tabletsCycleStone = tabletsCycleStone;
  window.tabletsToggleTrial = tabletsToggleTrial;
  window.tabletsRollBlessing = tabletsRollBlessing;
  window.tabletsTier = tabletsTier;
  window.paintTabletsHud = paintTabletsHud;
  window.paintTabletsTablet = paintTabletsTablet;
  window.paintTabletsStage = paintTabletsStage;
  window.tabletsGreyWords = tabletsGreyWords;
}
