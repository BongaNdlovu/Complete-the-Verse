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
/* O2: the tier names stay as the streak label; the multiplier beside them is
   the carve's combo, because that is what the Favor is really multiplied by. */
function tabletsTier(streak){
  const n = streak || 0;
  const mult = Tablets.rules.comboOf(n);
  if(n >= 8) return { name:"DIVINE PRESENCE", mult:mult };
  if(n >= 5) return { name:"EXALTED", mult:mult };
  if(n >= 3) return { name:"ANOINTED", mult:mult };
  if(n >= 1) return { name:"SANCTIFIED", mult:mult };
  return { name:"DEVOTED", mult:mult };
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
  tabletsPaintRise();
}
/* V1: the verse card rises as the sand runs; untimed (tutorial, reduced motion) pins it at The Mark. */
function tabletsRiseOf(){
  if(tabletsUntimed()) return 1;
  return Tablets.rules.progressOf(R.tabletClock, R.tabletClockMax || tabletsClockMax() || 1);
}
function tabletsPaintRise(){
  const ms = $("tablets-ms");
  if(!ms || !ms.style || !ms.style.setProperty) return;
  ms.style.setProperty("--tablets-rise", String(Math.round(tabletsRiseOf() * 1000) / 1000));
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
    (window.matchMedia && matchMedia("(pointer:coarse)").matches)
      ? "Tap FATHER below"
      : "Tap FATHER below, or type the word (1–6 picks)",
    "The word flies into the carved slot",
    "In the true Hold the sand runs; here it stands still",
    "Illuminate carves the true word for you",
    "Winnow casts two false stones into shadow",
    "Three lamps guard a wrong word. The sand is the Hold",
    "Almost complete · Let no word be lost",
    "Final word · Engrave it to seal your first Hold and open the Hall!"
  ];
  const msg = prompts[R.tabletIdx || 0] || "Carve the missing word to complete the prayer.";
  callout.textContent = msg;
  callout.hidden = false;
}
/* Multi-gap steps: Pace I carves 2 words per stone-setting, Pace II carves
   3, Pace III carves 4. Steps group consecutive blanks at run start, so all
   144 authored chapters work unchanged. The prayer tutorial stays single-gap. */
function tabletsGapCount(){
  if(typeof R !== "undefined" && R && R.tabletTutorial) return 1;
  const lvl = (typeof R !== "undefined" && R && R.tabletLevel) || 1;
  return Math.min(4, Math.max(1, (lvl | 0) + 1));
}
function tabletsBuildSteps(ch, k){
  const steps = [];
  const blanks = (ch && ch.blanks) || [];
  for(let i = 0; i < blanks.length; i += k) steps.push(blanks.slice(i, i + k));
  return steps;
}
function tabletsStepBlanks(){
  const steps = (typeof R !== "undefined" && R && R.tabletSteps) || [];
  return steps[(R && R.tabletIdx) || 0] || [];
}
function tabletsGapBlank(){
  const step = tabletsStepBlanks();
  return step[(R && R.gapIdx) || 0] || step[0] || null;
}
function tabletsGapKey(){
  return (((R && R.tabletIdx) || 0) + ":" + ((R && R.gapIdx) || 0));
}
function paintTabletsVerseLine(host, blank, carved){
  const line = document.createElement("div");
  line.className = "tablets-gap-line";
  const ref = document.createElement("span");
  ref.className = "tablets-gap-ref";
  ref.textContent = blank.r;
  const pre = document.createElement("span");
  pre.textContent = blank.prefix + " ";
  const mid = document.createElement("span");
  mid.className = "tablets-blank-word" + (carved ? " in" : "");
  mid.textContent = carved ? blank.a : "___";
  const suf = document.createElement("span");
  suf.textContent = blank.suffix ? (" " + blank.suffix) : "";
  line.appendChild(ref);
  line.appendChild(pre);
  line.appendChild(mid);
  line.appendChild(suf);
  host.appendChild(line);
}
function paintTabletsVerse(stepBlanks, gapIdx, answer){
  const verse = $("tablets-verse");
  if(!verse) return;
  verse.innerHTML = "";
  if(verse.dataset) verse.dataset.gaps = String((stepBlanks || []).length || 1);
  if(!stepBlanks || !stepBlanks.length){ verse.textContent = ""; return; }
  stepBlanks.forEach(function(blank, gi){
    /* A hit carves through the current gap; earlier gaps stay carved, later
       gaps stay empty. A miss keeps whatever was already carved. */
    const carved = (answer === "hit" || answer === "done") ? gi <= gapIdx : gi < gapIdx;
    paintTabletsVerseLine(verse, blank, carved);
  });
}
function paintTabletsSlot(blank, kind){
  const slot = $("tablets-slot");
  if(!slot) return;
  slot.classList.remove("glow");
  if(kind === "hit" && blank){
    slot.textContent = blank.a;
    slot.classList.add("glow");
    return;
  }
  /* The letters of the word being typed stand in the slot until it lands. */
  slot.textContent = (R && R.tabletTyped) ? R.tabletTyped : "— — —";
}
function tabletsShowFracture(){
  const f = $("tablets-fracture");
  if(!f) return;
  f.classList.add("active");
  setTimeout(function(){ try{ f.classList.remove("active"); }catch(e){} }, 500);
}
function paintTabletsTablet(answer){
  const ch = tabletsChapter();
  const step = tabletsStepBlanks();
  const gap = tabletsGapBlank();
  const refEl = $("tablets-ref");
  if(refEl) refEl.textContent = gap ? gap.r : ch.r;
  paintTabletsVerse(step, (R && R.gapIdx) || 0, answer);
  paintTabletsSlot(gap, answer === "hit" ? "hit" : "");
  if(answer === "miss") tabletsShowFracture();
  paintTabletsPips();
  paintTabletsClock();
  tabletsKeepGapInView();
}
/* On small screens a tall multi-gap card scrolls inside the stage: keep
   the active gap line visible after every repaint. No-op on desktop
   (nothing overflows) and in tests (shim no-op). */
function tabletsKeepGapInView(){
  try{
    const verse = $("tablets-verse");
    if(!verse || !verse.children || verse.children.length < 2) return;
    const line = verse.children[Math.min((R && R.gapIdx) || 0, verse.children.length - 1)];
    if(line && typeof line.scrollIntoView === "function") line.scrollIntoView({ block: "nearest" });
  }catch(e){}
}
function paintTabletsStage(answer){
  paintTabletsTablet(answer);
}
function paintTabletsPips(){
  const host = $("tablets-pips");
  if(!host) return;
  host.innerHTML = "";
  const ch = tabletsChapter();
  const steps = (R && R.tabletSteps) || [];
  const idx = R.tabletIdx || 0;
  if(ch.blanks.length > 20) return;
  const n = steps.length || 1;
  steps.forEach(function(_, i){
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
function tabletsRemainText(){
  const steps = (typeof R !== "undefined" && R && R.tabletSteps) || [];
  const total = steps.length || 1;
  const idx = (typeof R !== "undefined" && R && R.tabletIdx) || 0;
  return Math.min(idx + 1, total) + " / " + total;
}
function paintTabletsHud(){
  const ch = tabletsChapter();
  const pct = tabletsPct();
  const rec = Tablets.recordOf(typeof SAVE !== "undefined" ? SAVE : null, ch.id);
  paintTabletsCast();
  const chEl = $("tablets-chapter");
  if(chEl) chEl.textContent = ch.name;
  const subEl = $("tablets-sub");
  if(subEl){
    const pace = R.tabletTutorial ? "Learn the Hold" : ((Tablets.levelName && Tablets.levelName(R.tabletLevel)) || "I");
    subEl.textContent = pace + " · " + (ch.subtitle || (typeof translationTag === "function" ? translationTag() : "KJV"));
  }
  const remEl = $("tablets-remain");
  if(remEl) remEl.textContent = tabletsRemainText();
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
  const blank = tabletsGapBlank();
  if(!blank) return [];
  const key = tabletsGapKey();
  if(R.tabletOptsIdx === key && R.tabletOpts && R.tabletOpts.length) return R.tabletOpts;
  R.tabletOpts = Tablets.options(blank);
  R.tabletOptsIdx = key;
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
  const blank = tabletsGapBlank();
  if(!blank) return;
  const grey = tabletsGreyWords();
  const badges = ["1", "2", "3", "4", "5", "6"];
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
  paintTabletsTrayWord();
  paintTabletsIllumBtn();
}
function paintTabletsTrayWord(){
  const lab = $("tablets-tray-word");
  if(!lab) return;
  const step = tabletsStepBlanks();
  const k = step.length;
  if(k > 1){
    const g = Math.min(((R && R.gapIdx) || 0) + 1, k);
    const compact = (typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(max-width: 640px)").matches);
    lab.textContent = compact ? ("Word " + g + " of " + k)
      : ("Word " + g + " of " + k + " · Choose the missing word");
  } else {
    lab.textContent = "Choose the missing word";
  }
}
function tabletsTrueStone(){
  const blank = tabletsGapBlank();
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
  if(R.tabletHintedIdx === tabletsGapKey()){
    if(typeof toast === "function") toast("This blank is already lit");
    return;
  }
  if(!R.powers || R.powers.illum < 1){
    if(typeof toast === "function") toast("No Illuminate left");
    return;
  }
  const blank = tabletsGapBlank();
  const target = tabletsTrueStone();
  if(!target || !blank) return;
  R.tabletHintedIdx = tabletsGapKey();
  R.powers.illum--;
  R.usedPower = true;
  R.powersSpent = (R.powersSpent || 0) + 1;
  if(R.illumFromReserve > 0) R.illumFromReserve--;
  target.classList.add("revealed");
  setTimeout(function(){ try{ target.classList.remove("revealed"); }catch(e){} }, 2000);
  paintTabletsIllumBtn();
  if(typeof toast === "function") toast("Illuminate — the true word is carved");
  if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
  /* O4: the power carves the true word at the Carved grade. It counts for the
     streak and the Favor, and it earns no typed bonus. */
  R.tabletGrade = "carved";
  tabletsPick(String(blank.a || ""));
}
function tabletsGreyWords(){
  if(R.tabletWinnowIdx === tabletsGapKey() && R.tabletWinnow) return R.tabletWinnow.slice();
  return [];
}
function tabletsWinnow(){
  if(!R || R.ended || R.paused || R.mode !== "tablets") return;
  if(R.tabletWinnowIdx === tabletsGapKey()){
    if(typeof toast === "function") toast("This blank is already winnowed");
    return;
  }
  if(!R.powers || (R.powers.winnow || 0) < 1){
    if(typeof toast === "function") toast("No Winnow left");
    return;
  }
  const blank = tabletsGapBlank();
  if(!blank) return;
  const opts = tabletsOptsForBlank();
  const grey = tabletsGreyWords();
  const decoys = opts.filter(function(w){
    return String(w).toLowerCase() !== String(blank.a).toLowerCase() && grey.indexOf(w) < 0;
  });
  const take = Tablets.rules.winnowCount(decoys.length);
  if(take < 1){
    if(typeof toast === "function") toast("Nothing left to winnow");
    return;
  }
  R.tabletWinnow = decoys.slice(0, take);
  R.tabletWinnowIdx = tabletsGapKey();
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
  const blank = tabletsGapBlank();
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
    /* D1: a miss spends a lamp and pushes the sand back. The rules decide
       both; the run applies the verdict and keeps the lamp count. */
    const lives = R.tabletLives || 1;
    const lit = Math.max(0, lives - (R.tabletMiss || 0));
    const max = R.tabletClockMax || tabletsClockMax() || 1;
    const cracked = Tablets.rules.miss(lit, R.tabletMode === "judgment", Tablets.rules.progressOf(R.tabletClock, max));
    R.tabletMiss = lives - cracked.lit;
    R.tabletLampOut = !!cracked.ended;
    R.tabletClock = max * (1 - cracked.progress);
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
/* D4/O1: the arcade grade ids wear the game's words. */
const TABLET_GRADE_NAMES = { divine:"Fresh sand", sacred:"Sure", carved:"Carved", clutch:"Last grain" };
function tabletsGradeName(id){
  return TABLET_GRADE_NAMES[id] || "Sure";
}
/* The live run grades every carve from the sand that is left. The rules own
   the numbers (grade band, combo, Surge x2); the run only reads them. */
function tabletsCarve(){
  const max = R.tabletClockMax || tabletsClockMax() || 1;
  return Tablets.rules.carve({
    progress: Tablets.rules.progressOf(R.tabletClock, max),
    streak: R.streak || 0,
    surge: !!R.surgeOn,
    typed: !!R.tabletTypedHit,
    grade: R.tabletGrade || null
  });
}
/* O2: the carve's points are the Favor. Trial stays an outer 2.5x. */
function tabletsHitFavor(carve){
  return Math.round((carve.points || 0) * (R.tabletTrial ? 2.5 : 1));
}
/* The popup names the grade, and the milestone when the carve reaches one
   (D4: a Favor popup, so the blessing banner stays the blessing's). The
   tutorial stays ungraded. */
function tabletsScoreText(carve, favor){
  if(R.tabletTutorial) return "+" + favor + " FAVOR";
  const grade = tabletsGradeName(carve.grade);
  if(carve.milestone) return grade + " · " + tabletsMilestoneName(carve.milestone.streak) + " · +" + favor + " FAVOR";
  return grade + " · +" + favor + " FAVOR";
}
/* D4: the three milestones wear the game's names. */
function tabletsMilestoneName(streak){
  if(streak >= 50) return "Jubilee";
  if(streak >= 25) return "Double portion";
  return "Tithe";
}
/* The rules' charge ids, in the words on the power buttons. */
const TABLET_POWER_NAMES = { winnow:"Winnow", illuminate:"Illuminate" };
function tabletsPowerName(id){
  return TABLET_POWER_NAMES[id] || id;
}
/* D2: the streak gives the charges back, and the rules decide how. */
function tabletsRecharge(carve){
  const award = Tablets.rules.recharge({ winnow:R.powers.winnow || 0, illuminate:R.powers.illum || 0 }, R.streak, carve.milestone);
  R.powers.winnow = award.charges.winnow;
  R.powers.illum = award.charges.illuminate;
  if(!award.gained.length) return;
  paintTabletsPowers();
  if(typeof toast === "function") toast("Restored · " + award.gained.map(tabletsPowerName).join(" · "));
}
function tabletsResolveHit(){
  R.correct = (R.correct || 0) + 1;
  R.score = (R.score || 0) + 1;
  /* The carve reads the streak before this hit and returns the next one. */
  const carve = tabletsCarve();
  R.streak = carve.streak;
  R.best = Math.max(R.best || 0, R.streak);
  if(!R.tabletTutorial) R.surge = Math.min(100, (R.surge || 0) + carve.fill);
  const favor = tabletsHitFavor(carve);
  R.favor = (R.favor || 0) + favor;
  const slot = $("tablets-slot");
  spawnTabletsScorePopup(tabletsScoreText(carve, favor), slot);
  if(typeof Snd !== "undefined" && Snd.carve) Snd.carve();
  tabletsReact(true);
  const grid = $("tablets-grid");
  if(grid) grid.classList.add("locked");
  const picked = tabletsStoneButtons().filter(function(b){ return b.classList && b.classList.contains("selected"); })[0];
  const word = (tabletsGapBlank() || {}).a;
  tabletsFlyWord(picked, slot, word, function(){
    paintTabletsTablet("hit");
    tabletsPulseSpeech();
    tabletsPlayGoldChime();
  });
  if(!R.tabletTutorial){
    tabletsRollBlessing();
    tabletsRecharge(carve);
  }
}
function tabletsResolve(ok){
  if(!R || R.ended || R.paused || R.mode !== "tablets" || R.tabletResolving) return;
  R.tabletResolving = true;
  R.attempts = (R.attempts || 0) + 1;
  setTimeout(function(){ tabletsFinishResolve(ok); }, ok ? 1000 : 800);
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
  R.tabletTyped = "";
  R.tabletTypedHit = false;
  R.tabletGrade = null;
  R.tabletHintedIdx = -1;
  R.tabletWinnowIdx = -1;
  R.tabletBlankStart = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
}
/* P3: the chapter's last step. Returns true when the run is over; an Endless run reads on instead. */
function tabletsChapterDone(){
  if(R.tabletTutorial){ finishTabletsTutorial(); return true; }
  if(R.tabletMode === "endless"){ tabletsNextReading(); return false; }
  if(typeof endRun === "function") endRun("complete");
  return true;
}
function tabletsFinishResolve(ok){
  if(!R || R.ended || R.mode !== "tablets" || !R.tabletResolving) return;
  R.tabletResolving = false;
  if(!ok){
    if(R.tabletTutorial || !R.tabletLampOut){
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
  /* A carved gap advances within the step; only a finished step moves the
     stone-setting forward. Each gap re-arms the tray and the sand. */
  const step = tabletsStepBlanks();
  R.gapIdx = (R.gapIdx || 0) + 1;
  if(R.gapIdx >= step.length){
    R.tabletIdx++;
    R.gapIdx = 0;
  }
  tabletsResetBlankAids();
  if(R.tabletIdx >= ((R && R.tabletSteps) || []).length && tabletsChapterDone()) return;
  if(!R.tabletTutorial){
    R.tabletClock = tabletsStepSeconds();
    R.tabletClockMax = R.tabletClock;
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
  drawTabletsFx(dt);
  paintTabletsClock();
  paintTabletsSurge();
  R.tabletRaf = requestAnimationFrame(tabletsTick);
}
/* P3: an Endless run reads the chapter again; the reading names count the passes. */
const TABLET_READINGS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
function tabletsReadingName(n){
  const word = TABLET_READINGS[n - 1];
  return word ? word + " reading" : "Reading " + n;
}
/* P3: an Endless step's sand is ramped by the words carved so far (the rules' blankSeconds). */
function tabletsStepSeconds(){
  const base = tabletsClockMax();
  if(R.tabletMode !== "endless") return base;
  return Tablets.rules.blankSeconds(base, R.correct || 0, R.streak || 0, false);
}
/* P3: finishing a reading Holds the chapter; the same words come round again on shorter sand. */
function tabletsNextReading(){
  R.tabletEndlessHeld = true;
  R.tabletPass = (R.tabletPass || 1) + 1;
  R.tabletIdx = 0;
  R.gapIdx = 0;
  spawnTabletsScorePopup(tabletsReadingName(R.tabletPass), $("tablets-slot"));
}
/* P2: the footer names the lamps this run really has. */
const TABLET_MODE_NOTES = {
  hold: "Three lamps guard the Hold",
  judgment: "One lamp guards the Hold",
  endless: "Three lamps · the chapter reads again"
};
function tabletsPaintModeNote(){
  const el = $("tablets-hold-note");
  if(!el) return;
  const mode = R.tabletTutorial ? "hold" : R.tabletMode;
  el.textContent = TABLET_MODE_NOTES[mode] || TABLET_MODE_NOTES.hold;
}
function startTabletsLoop(){
  stopTabletsLoop();
  const ch = tabletsChapter();
  R.tabletIdx = 0;
  R.gapIdx = 0;
  R.tabletSteps = tabletsBuildSteps(ch, tabletsGapCount());
  R.tabletClock = tabletsStepSeconds();
  R.tabletClockMax = R.tabletClock;
  R.tabletPass = 1;
  R.tabletEndlessHeld = false;
  R.tabletTimeout = false;
  R.tabletLastWarnSec = -1;
  R.tabletMiss = 0;
  R.tabletLives = Tablets.rules.lampsFor(R.tabletMode);
  R.tabletLampOut = false;
  R.tabletResolving = false;
  R.favor = 0;
  R.surge = 0;
  R.surgeOn = false;
  R.surgeLeft = 0;
  R.trauma = 0;
  tabletsResetBlankAids();
  R.tabletTotal = R.tabletSteps.length;
  R.qTotal = ch.blanks.length;
  R.tabletRacing = true;
  R.paused = false;
  R.streak = 0;
  const ov = $("tablets-pause");
  if(ov){ ov.hidden = true; ov.classList.remove("on"); }
  paintTabletsHud();
  paintTabletsTablet();
  paintTabletsTray();
  tabletsPaintModeNote();
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
    if(typeof quitTablets === "function") quitTablets(true);
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
/* The word being carved, lower-cased, letters only: a space or an
   apostrophe ("All hail", "eagle's") is not typed. */
function tabletsNeedWord(){
  const blank = tabletsGapBlank();
  return blank ? String(blank.a || "").toLowerCase().replace(/[^a-z]/g, "") : "";
}
/* A power key fires only while nothing is typed and the word cannot start
   with that letter; otherwise the letter is typing. */
function tabletsPowerKey(k){
  if((R && R.tabletTyped) || (k !== "i" && k !== "w" && k !== "s")) return false;
  const need = tabletsNeedWord();
  if(k === need.charAt(0)) return false;
  if(k === "i") tabletsIlluminate();
  else if(k === "w") tabletsWinnow();
  else tabletsSurge();
  return true;
}
/* A wrong letter is ignored. It is not a miss. 1-6 pick a tablet; letters
   type the word; Backspace takes the last letter back. */
function tabletsTypeKey(k){
  const blank = tabletsGapBlank();
  const need = tabletsNeedWord();
  const typed = (R && R.tabletTyped) || "";
  if(k === "backspace"){
    R.tabletTyped = typed.slice(0, -1);
    paintTabletsSlot(blank, "");
    return true;
  }
  if(k.length !== 1 || k < "a" || k > "z") return false;
  if(need.indexOf(typed + k) !== 0) return true;
  R.tabletTyped = typed + k;
  paintTabletsSlot(blank, "");
  if(R.tabletTyped === need && !R.tabletResolving){
    R.tabletTypedHit = true;
    tabletsResolve(true);
  }
  return true;
}
function tabletsOnKey(e){
  if(typeof currentView === "undefined" || currentView !== "tablets") return;
  if(!R || R.ended || R.mode !== "tablets") return;
  const k = (e.key || "").toLowerCase();
  if(R.paused){
    if(k === "enter" || k === " "){ e.preventDefault(); setTabletsPaused(false); }
    return;
  }
  if(tabletsPowerKey(k)){ e.preventDefault(); return; }
  const n = parseInt(e.key, 10);
  if(n >= 1 && n <= 6){
    const btn = tabletsStoneButtons()[n - 1];
    if(btn && !btn.disabled) tabletsPick(btn.dataset.word);
    return;
  }
  if(tabletsTypeKey(k)) e.preventDefault();
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
  if(typeof Director !== "undefined" && Director.speak) Director.speak("Surge. The clock holds.", true);
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
    { icon:"🕯️", text:"Golden Censer (+1 Lamp Restored)", apply:function(){ R.tabletLives = (R.tabletLives || 3) + 1; } },
    { icon:"✨", text:"Shekinah Glory (+35% Surge Charge)", apply:function(){ R.surge = Math.min(100, (R.surge || 0) + 35); } }
  ];
  /* P2: in Judgment the Censer leaves the pool, so the HUD never shows a lamp the run cannot use. */
  const pool = R.tabletMode === "judgment" ? picks.filter(function(p){ return p.text.indexOf("Golden Censer") < 0; }) : picks;
  const b = pool[Math.floor(Math.random() * pool.length)];
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
var tabletsFx = { ctx:null, canvas:null, embers:[], sparks:[], glyphs:[], w:0, h:0 };
function tabletsFxSize(){
  const canvas = tabletsFx.canvas || $("tablets-fx");
  const stage = $("tablets-stage");
  if(!canvas || !stage) return;
  tabletsFx.canvas = canvas;
  tabletsFx.w = canvas.width = stage.clientWidth || 800;
  tabletsFx.h = canvas.height = stage.clientHeight || 450;
}
function tabletsFxInit(){
  tabletsFx.ctx = null;
  tabletsFx.embers = [];
  tabletsFx.sparks = [];
  tabletsFx.glyphs = [];
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
  for(; i < 8; i++) tabletsFx.embers.push(tabletsFxMakeEmber(true));
  /* V2: twelve signs across the three depth layers; none in reduced motion (the early return above). */
  for(i = 0; i < 12; i++) tabletsFx.glyphs.push(tabletsMakeGlyph(i % 3, tabletsFx.w || 800, tabletsFx.h || 450, true));
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
/* V2: faint cuneiform signs in three depth layers, behind the embers. */
const TABLET_GLYPH_SPEED = [18, 28, 46];
const TABLET_GLYPH_DEPTH = [0.35, 0.68, 1.18];
const TABLET_GLYPH_ALPHA = [0.07, 0.11, 0.16];
const TABLET_GLYPH_SURGE = 1.35;
/* Each sign is a list of strokes [x1, y1, x2, y2, headSize, chevron] in a -1..1 box.
   Order: DINGIR, DUB_TABLET, KA_WORD, ZI_SOUL, LUGAL_KING, PA_SCEPTER. */
const TABLET_GLYPHS = [
  [[-0.75,0,0.75,0,0.28,0],[0,-0.78,0,0.78,0.28,0],[-0.55,-0.55,0.55,0.55,0.24,0],[0.55,-0.55,-0.55,0.55,0.24,0]],
  [[-0.72,-0.52,0.68,-0.52,0.26,0],[-0.72,0,0.58,0,0.24,0],[-0.72,0.52,0.68,0.52,0.26,0],[-0.45,-0.72,-0.45,0.72,0.25,0],[0.38,-0.72,0.38,0.72,0.25,0]],
  [[-0.75,-0.4,0.45,-0.4,0.26,0],[-0.75,0.4,0.45,0.4,0.26,0],[-0.52,-0.68,-0.52,0.68,0.26,0],[0.1,-0.1,0.4,-0.1,0.28,1],[0.55,-0.68,0.55,0.68,0.28,0]],
  [[-0.7,-0.32,0.65,-0.32,0.25,0],[-0.7,0.32,0.65,0.32,0.25,0],[-0.25,-0.7,-0.25,0.7,0.25,0],[0.25,-0.7,0.25,0.7,0.25,0],[0.52,0,0.78,0,0.28,1]],
  [[-0.78,-0.48,0.72,-0.48,0.26,0],[-0.78,0,0.72,0,0.26,0],[-0.78,0.48,0.72,0.48,0.26,0],[-0.45,-0.22,-0.15,-0.22,0.26,1],[0.48,-0.72,0.48,0.72,0.28,0]],
  [[-0.72,-0.28,0.72,-0.28,0.26,0],[-0.72,0.28,0.72,0.28,0.26,0],[0,-0.75,0,0.75,0.28,0]]
];
/* V2: Pace I/II/III speed; Surge speeds the signs up. */
function tabletsGlyphSpeed(pace, surge){
  const p = Math.min(3, Math.max(1, Math.round(pace) || 1));
  return TABLET_GLYPH_SPEED[p - 1] * (surge ? TABLET_GLYPH_SURGE : 1);
}
function tabletsMakeGlyph(layer, w, h, randomY){
  const size = 16 + layer * 12;
  return {
    layer: layer, x: Math.random() * w, y: randomY ? Math.random() * h : h + size,
    size: size, sign: Math.floor(Math.random() * TABLET_GLYPHS.length)
  };
}
/* V2: a sign drifts up at its depth; one that leaves the top comes back below the stage. */
function tabletsGlyphStep(g, dt, speed, w, h){
  g.y -= speed * TABLET_GLYPH_DEPTH[g.layer] * dt;
  if(g.y < -g.size){
    g.y = h + g.size;
    g.x = Math.random() * w;
    g.sign = Math.floor(Math.random() * TABLET_GLYPHS.length);
  }
  return g;
}
function tabletsGlyphHead(ctx, x, y, dx, dy, size){
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy * size * 0.5, py = ux * size * 0.5;
  ctx.beginPath();
  ctx.moveTo(x + ux * size, y + uy * size);
  ctx.lineTo(x + px, y + py);
  ctx.lineTo(x - px, y - py);
  ctx.closePath();
  ctx.fill();
}
function tabletsDrawGlyphStroke(ctx, g, s){
  const half = g.size / 2;
  const x1 = g.x + s[0] * half, y1 = g.y + s[1] * half;
  const x2 = g.x + s[2] * half, y2 = g.y + s[3] * half;
  const hs = s[4] * half;
  ctx.beginPath();
  if(s[5]){
    ctx.moveTo(x1 + hs, y1 - hs);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 + hs, y1 + hs);
    ctx.stroke();
    return;
  }
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  tabletsGlyphHead(ctx, x1, y1, x1 - x2, y1 - y2, hs);
}
function drawTabletsGlyph(ctx, g){
  ctx.strokeStyle = "rgba(229,181,88," + TABLET_GLYPH_ALPHA[g.layer] + ")";
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = Math.max(1, g.size * 0.07);
  (TABLET_GLYPHS[g.sign] || []).forEach(function(s){ tabletsDrawGlyphStroke(ctx, g, s); });
}
function drawTabletsGlyphs(dt){
  const ctx = tabletsFx.ctx;
  const pace = Tablets.paceOf ? Tablets.paceOf(tabletsChapter()) : 1;
  const speed = tabletsGlyphSpeed(pace, !!R.surgeOn);
  tabletsFx.glyphs.forEach(function(g){
    tabletsGlyphStep(g, dt, speed, tabletsFx.w, tabletsFx.h);
    drawTabletsGlyph(ctx, g);
  });
}
function drawTabletsFx(dt){
  const ctx = tabletsFx.ctx;
  if(!ctx) return;
  const w = tabletsFx.w;
  const h = tabletsFx.h;
  ctx.clearRect(0, 0, w, h);
  if(typeof R !== "undefined" && R && typeof R.tabletClock === "number" && R.tabletClock <= 5 && !tabletsUntimed()){
    return;
  }
  drawTabletsGlyphs(dt);
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
  function land(){
    if(done) done();
  }
  if(!text){ land(); return; }
  if(tabletsReduced() || !fromBtn || !toSlot || !fromBtn.getBoundingClientRect){
    land();
    return;
  }
  const start = fromBtn.getBoundingClientRect();
  const target = toSlot.getBoundingClientRect();
  if(!start.width || (start.left === target.left && start.top === target.top)){
    land();
    return;
  }
  const flyer = document.createElement("div");
  flyer.className = "tablets-flying-word";
  flyer.textContent = text;
  flyer.style.left = (start.left + start.width / 2) + "px";
  flyer.style.top = (start.top + start.height / 2) + "px";
  document.body.appendChild(flyer);
  spawnTabletsSparks(start.left + start.width / 2, start.top + start.height / 2, 10);
  requestAnimationFrame(function(){
    flyer.style.left = (target.left + target.width / 2) + "px";
    flyer.style.top = (target.top + target.height / 2) + "px";
    flyer.style.transform = "translate(-50%,-50%) scale(1.15)";
  });
  setTimeout(function(){
    spawnTabletsSparks(target.left + target.width / 2, target.top + target.height / 2, 16);
    try{ flyer.remove(); }catch(e){}
    land();
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
