/* ==================================================================
   PANELS — relics, player card, study hall, seals, records, settings.

   Split out of game.js along its natural seams. Classic script:
   defines globals only, and references game.js bindings at RUNTIME
   exclusively (enforced by engine-modules.test.js).
   ================================================================== */

/* ------------------------- ARTIFACT REVEAL ------------------------- */
let pendingReveals = [];
function queueArtifactReveal(artifact){
  if(!artifact) return;
  pendingReveals.push({ kind: "artifact", artifact: artifact });
}
function flushRevealsAfterResults(done){
  if(!pendingReveals.length){ if(done) done(); return; }
  const next = pendingReveals.shift();
  const cont = ()=>flushRevealsAfterResults(done);
  if(next.kind === "artifact") showArtifactReveal(next.artifact, cont);
  else cont();
}
function showArtifactReveal(artifact, done){
  const el = $("reveal-stage");
  if(!el || !artifact){ if(done) done(); return; }
  const img = Artifacts.imagePath(artifact);
  $("reveal-kicker").textContent = "Relic recovered";
  $("reveal-title").textContent = artifact.name;
  $("reveal-meta").textContent = [artifact.era, artifact.material, artifact.find].filter(Boolean).join(" · ");
  $("reveal-copy").textContent = artifact.detail || artifact.blurb;
  $("reveal-ref").textContent = artifact.scripture || "";
  const pic = $("reveal-art");
  if(img){
    pic.innerHTML = '<img src="'+esc(img)+'" alt="" loading="lazy" decoding="async">';
    pic.classList.remove("placeholder");
  } else {
    pic.innerHTML = '<span class="reveal-glyph">✦</span>';
    pic.classList.add("placeholder");
  }
  el.dataset.kind = "artifact";
  el.classList.remove("play"); void el.offsetWidth; el.classList.add("on","play");
  Snd.level();
  const close = ()=>{
    el.classList.remove("on","play");
    SAVE.artifacts = Artifacts.markSeen(SAVE.artifacts, artifact.id);
    persist();
    if(done) done();
  };
  $("reveal-continue").onclick = ()=>{ Snd.ui(); close(); };
  setTimeout(()=>{ if(el.classList.contains("on")) close(); }, 14000);
}

/* ------------------------- RELICS HALL ------------------------- */
function renderRelics(){
  const host = $("relics-grid");
  if(!host || typeof Artifacts === "undefined") return;
  const n = Artifacts.unlockedCount(SAVE.artifacts);
  const tot = Artifacts.count();
  const title = $("relics-count");
  if(title) title.textContent = n + " of " + tot + " recovered";
  if(n === 0){
    host.innerHTML = '<div class="empty relics-empty" style="grid-column:1/-1;padding:2vh 1vw;text-align:center;color:var(--parch-dim)">No relics recovered yet — walk the road from Ur to Patmos to uncover sacred artifacts.</div>' +
      Artifacts.all().map(a => {
        const site = Pilgrimage.site(a.siteId);
        return '<div class="relic-card locked"><div class="relic-art placeholder"><span>?</span></div>'+
          '<b>Sealed</b><span>'+esc((site&&site.name)||a.siteId)+'</span></div>';
      }).join("");
  } else {
    host.innerHTML = Artifacts.all().map(a => {
      const open = Artifacts.isUnlocked(SAVE.artifacts, a.id);
      const img = Artifacts.imagePath(a);
      const site = Pilgrimage.site(a.siteId);
      const lvl = levelInfo(SAVE.xp).level;
      const unveiled = typeof Meta==="undefined" || Meta.relicUnveiled(a, lvl);
      if(!open){
        return '<div class="relic-card locked"><div class="relic-art placeholder"><span>?</span></div>'+
          '<b>Sealed</b><span>'+esc((site&&site.name)||a.siteId)+'</span></div>';
      }
      if(!unveiled){
        return '<div class="relic-card locked"><div class="relic-art placeholder"><span>veil</span></div>'+
          '<b>Veiled</b><span>Reach '+esc(rankFor(a.requiresRank))+' to unveil</span></div>';
      }
      return '<button type="button" class="relic-card" data-relic="'+esc(a.id)+'">'+
        '<div class="relic-art'+(img?"":" placeholder")+'">'+(img?'<img src="'+esc(img)+'" alt="'+esc(a.name)+'" loading="lazy" decoding="async">':'<span>✦</span>')+'</div>'+
        '<b>'+esc(a.name)+'</b><span>'+esc(a.era)+'</span></button>';
    }).join("");
  }
  host.querySelectorAll("[data-relic]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const a = Artifacts.byId(b.dataset.relic);
      if(a) openRelicInspect(a);
    });
  });
}

function setElText(id, text){
  const el = $(id); if(el) el.textContent = text;
}
function fillRelicInspectFields(a){
  const img = Artifacts.imagePath(a);
  const site = Pilgrimage.site(a.siteId);
  const imgEl = $("inspect-img");
  if(imgEl){
    if(img){ imgEl.src = img; imgEl.alt = a.name || ""; imgEl.style.display = "block"; }
    else imgEl.style.display = "none";
  }
  setElText("inspect-title", a.name || "Sacred Relic");
  setElText("inspect-meta", [a.era, a.material, a.find].filter(Boolean).join(" · "));
  setElText("inspect-copy", a.detail || a.blurb || "");
  setElText("inspect-site", (site && site.name) ? site.name + " (" + site.arc + ")" : (a.siteId || "—"));
  setElText("inspect-era", a.era || "—");
  setElText("inspect-mat", a.material || "—");
  setElText("inspect-find", a.find || "—");
  setElText("inspect-scripture", a.scripture || "—");
}
function openRelicInspect(a){
  if(!a) return;
  const modal = $("relic-inspect-modal");
  if(!modal) return;
  fillRelicInspectFields(a);
  modal.removeAttribute("hidden");
  modal.classList.remove("on");
  void modal.offsetWidth;
  modal.classList.add("on");
  Snd.ui();
  const close = function(){
    modal.classList.remove("on");
    setTimeout(()=>{ modal.setAttribute("hidden", ""); }, 400);
  };
  const closeBtn = $("inspect-close"); if(closeBtn) closeBtn.onclick = close;
  const doneBtn = $("inspect-done"); if(doneBtn) doneBtn.onclick = close;
  modal.onclick = function(e){ if(e.target === modal) close(); };
}

/* ------------------------- PLAYER CARD ------------------------- */
function buildPlayerCard(){
  const d=document.createElement("div"); d.className="playercard"; d.id="playercard"; d.style.display="none";
  d.innerHTML='<div class="pc-sigil"><img id="pc-avatar" class="pc-avatar" alt=""><b id="pc-lvl">1</b></div><div class="pc-meta">'+
    '<div class="pc-rank" id="pc-rank">Hearer</div><div class="pc-name" id="pc-name"></div>'+
    '<div class="pc-xp"><i id="pc-xpfill"></i></div>'+
    '<div class="pc-sub" id="pc-sub">0 / 320 XP</div>'+
    '<div class="pc-oil" id="pc-oil">0 oil</div></div>';
  document.body.appendChild(d);
}
function updatePlayerCard(){
  const card = $("playercard"); if(!card) return;
  // Player card belongs on the Main Hall menu and stands down elsewhere to prevent chrome collision.
  card.style.display = (currentView === "menu") ? "flex" : "none";
  const li = levelInfo(SAVE.xp);
  $("pc-lvl").textContent = li.level;
  $("pc-rank").textContent = rankFor(li.level);
  $("pc-xpfill").style.width = (li.into/li.need*100)+"%";
  $("pc-sub").textContent = fmt(li.into)+" / "+fmt(li.need)+" XP";
  const oilEl = $("pc-oil");
  if(oilEl) oilEl.textContent = (SAVE.oil||0)+" oil";
  const ch = activeCharacter();
  const av = $("pc-avatar");
  const nm = $("pc-name");
  if(av){
    if(ch && ch.portrait){ av.src = ch.portrait; av.style.display = "block"; }
    else av.style.display = "none";
  }
  if(nm){
    const skin = ch ? ch.short : "";
    nm.textContent = playerDisplayName() + (skin ? " · " + skin : "");
  }
}


/* ------------------------- STUDY HALL ------------------------- */
/* Study Hall filter buckets. "due" is the one that matters: it is the
   list the Drill will actually serve you next. */
function verseState(v){
  const c = cardFor(v), t = today();
  if(!c || (!c.reps && !c.lapses)) return "unseen";
  if(c.due <= t) return "due";
  return SRS.strength(c) === "held" ? "held" : "learning";
}
function verseScheduleLabel(v){
  const c = cardFor(v), t = today();
  if(!c || (!c.reps && !c.lapses)) return {label:"Never seen", cls:""};
  if(!c.reps) return {label:"Lost — due now", cls:"m0"};
  const inDays = c.due - t;
  if(inDays <= 0) return {label: inDays === 0 ? "Due today" : (-inDays)+"d overdue", cls:"m0"};
  return {label: (SRS.strength(c)==="held" ? "Held · " : "Learning · ")+"due in "+inDays+"d",
          cls: SRS.strength(c)==="held" ? "m1" : "m2"};
}
function renderStudy(){
  const sel = $("study-book");
  if(sel.options.length<=1){
    BOOKS_ORDER.forEach(b=>{
      if(VERSES.some(v=>v.b===b)){ const o=document.createElement("option"); o.value=b; o.textContent=b; sel.appendChild(o); }
    });
    sel.addEventListener("change", drawStudy);
    $("study-filter").addEventListener("change", drawStudy);
    $("study-q").addEventListener("input", drawStudy);
  }
  const reviewBtn = $("study-review-due");
  const due = typeof dueToday === "function" ? dueToday() : 0;
  if(reviewBtn){
    if(due > 0){
      reviewBtn.style.display = "";
      reviewBtn.textContent = "Review " + due + " due";
      reviewBtn.onclick = ()=>{ Snd.unlock(); startRun("practice", SAVE.set.diff); };
    } else {
      reviewBtn.style.display = "none";
    }
  }
  drawHeatmap();
  drawJournal();
  drawThinPlaces();
  drawStudy();
}
function drawHeatmap(){
  const host = $("book-heatmap");
  if(!host || typeof Polish==="undefined") return;
  const matrix = Polish.heatmapMatrix(BOOKS_ORDER, VERSES, cardFor, today());
  host.innerHTML = '<div class="mtitle">66-book mastery</div><div class="heatgrid">'+
    matrix.map(c=>'<button type="button" class="heatcell '+esc(c.state)+'" title="'+esc(c.key)+': '+esc(c.label)+
      ' ('+c.held+'/'+c.total+')" data-book="'+esc(c.key)+'"><span>'+esc(c.key.replace(/^[123]\s*/,"").slice(0,3))+'</span></button>').join("")+
    '</div><div class="heatleg"><i class="mastered"></i>Mastered <i class="learning"></i>Learning <i class="due"></i>Due <i class="unseen"></i>Unseen</div>';
  host.querySelectorAll("[data-book]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const s = $("study-book");
      if(s){ s.value = b.dataset.book; drawStudy(); }
      Snd.ui();
    });
  });
}
function drawJournal(){
  const host = $("journey-journal");
  if(!host) return;
  const rows = SAVE.journal || [];
  if(!rows.length){
    host.innerHTML = '<div class="mtitle">Journey journal</div><div class="empty">Cleared sites will appear here.</div>';
    return;
  }
  host.innerHTML = '<div class="mtitle">Journey journal</div>'+rows.slice(0,12).map(r=>
    '<div class="jrow"><b>'+esc(r.name||r.siteId)+'</b><span>'+esc(r.at)+
    (r.cleared?' · cleared':' · held')+' · '+esc(String(r.acc))+'%</span></div>'
  ).join("");
}
function drawThinPlaces(){
  const host = $("thin-places");
  if(!host) return;
  const rows = BOOKS_ORDER.filter(b=>SAVE.books && SAVE.books[b] && SAVE.books[b].a > 0)
    .map(b=>({b, c:SAVE.books[b].c, a:SAVE.books[b].a, p:SAVE.books[b].c/SAVE.books[b].a}));
  if(!rows.length){
    host.innerHTML = '<div class="mtitle">Thin places · revision priorities</div><div class="empty">No book accuracy recorded yet — answer verses across the road to map weaknesses.</div>';
    return;
  }
  rows.sort((x,y)=>x.p-y.p);
  host.innerHTML = '<div class="mtitle">Thin places · weakest books first</div>' +
    '<div class="thin-grid">' + rows.slice(0, 6).map(r =>
      '<div class="tp-row"><b>'+esc(r.b)+'</b>' +
      '<div class="bar"><u style="width:'+Math.round(r.p*100)+'%"></u></div>' +
      '<span>'+Math.round(r.p*100)+'%</span>' +
      '<button type="button" class="btn sm ghost tp-practice-btn" data-practice-book="'+esc(r.b)+'">Practice</button></div>'
    ).join("") + '</div>';
  host.querySelectorAll("[data-practice-book]").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      const bk = btn.dataset.practiceBook;
      const bVerses = VERSES.filter(v=>v.b===bk);
      if(bVerses.length){
        Snd.unlock();
        startRun("practice", SAVE.set.diff, { queue: bVerses, book: bk });
      }
    });
  });
}
function drawStudy(){
  const q = ($("study-q").value||"").toLowerCase().trim();
  const bk = $("study-book").value;
  const f = $("study-filter").value;
  const order = {};
  BOOKS_ORDER.forEach((b,i)=>order[b]=i);
  const list = VERSES.filter(v=>{
    if(bk && v.b!==bk) return false;
    if(f!=="all" && verseState(v)!==f) return false;
    if(q && (fullVerse(v)+" "+v.r).toLowerCase().indexOf(q)<0) return false;
    return true;
  }).sort((a,b)=> (order[a.b]-order[b.b]) || (a.t-b.t));
  const el = $("study-list");
  if(!list.length){
    const msg = (f==="due")
      ? "No verses due for review — your memory is clear. Walk new ground on the road."
      : "Nothing here yet. Change the filter, or go earn some scars.";
    el.innerHTML='<div class="empty">'+msg+'</div>';
    return;
  }
  const hasTTS = typeof window !== "undefined" && ('speechSynthesis' in window);
  el.innerHTML = list.map(v=>{
    const sch = verseScheduleLabel(v);
    const note = (typeof VERSE_NOTES !== "undefined" && v.id && VERSE_NOTES[v.id])
      ? '<div class="vcard-note">' + esc(VERSE_NOTES[v.id]) + '</div>' : '';
    const listenBtn = hasTTS
      ? '<button type="button" class="btn sm ghost vcard-listen" data-listen-vid="'+esc(String(v.id))+'" title="Listen and rebuild this verse from memory">Listen & Rebuild</button>'
      : '';
    return '<div class="vcard" data-vid="'+esc(String(v.id))+'"><div class="vr"><i><span class="tierdot" style="opacity:'+(0.35+v.t*0.13)+'"></span>'+
      esc(v.r)+' · Tier '+v.t+'</i><span class="mastery '+sch.cls+'">'+esc(sch.label)+'</span></div>'+
      '<p>'+esc(v.p)+' <em>'+esc(v.a)+'</em>'+sep(v.s)+esc(v.s)+'</p>'+
      note+
      (listenBtn ? '<div class="vcard-actions">'+listenBtn+'</div>' : '')+
      '<div class="vcard-insight" hidden></div></div>';
  }).join("");
  el.querySelectorAll(".vcard").forEach(card=>{
    card.addEventListener("click", (e)=>{
      if(e.target.closest(".vcard-listen")) return;
      const id = card.dataset.vid;
      const v = VERSES.find(x=>String(x.id)===id);
      const box = card.querySelector(".vcard-insight");
      if(!box || !v || typeof Polish==="undefined") return;
      if(!box.hidden){ box.hidden = true; return; }
      const info = Polish.insightForVerse(v);
      const cross = Polish.crossRefsInBank(v, VERSES, 3);
      box.hidden = false;
      box.innerHTML = '<b>'+esc(info.theme)+'</b> · '+esc(info.author)+
        (info.roots.length?' · '+info.roots.map(r=>esc(r.w)).join(", "):'')+
        (cross.length?' · see '+cross.map(esc).join(", "):'');
    });
  });
  el.querySelectorAll(".vcard-listen").forEach(lBtn => {
    lBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = lBtn.dataset.listenVid;
      const v = VERSES.find(x => String(x.id) === id);
      if(!v) return;
      if(typeof window !== "undefined" && ('speechSynthesis' in window)){
        window.speechSynthesis.cancel();
        const fullText = (v.p ? v.p + " " : "") + (v.a || "") + (v.s ? " " + v.s : "");
        const utter = new SpeechSynthesisUtterance(fullText);
        utter.rate = 0.9;
        utter.onend = () => { startRun("recall", SAVE.set.diff, { queue: [v], forcedVerse: v }); };
        utter.onerror = () => { startRun("recall", SAVE.set.diff, { queue: [v], forcedVerse: v }); };
        window.speechSynthesis.speak(utter);
        if(typeof toast === "function") toast("Listening to " + v.r + "…");
      }
    });
  });
}

/* ------------------------- SEALS SCREEN ------------------------- */
function renderSeals(){
  $("seals-title").textContent = "Seals — "+SAVE.seals.length+" / "+SEALS.length;
  const emptyBanner = (!SAVE.seals || !SAVE.seals.length)
    ? '<div class="empty seals-empty" style="grid-column:1/-1;padding:2vh 1vw;text-align:center;color:var(--parch-dim)">No seals unlocked yet — step onto the road to earn your first honor.</div>'
    : '';
  $("sealgrid").innerHTML = emptyBanner + SEALS.map(s=>
    '<div class="seal'+(hasSeal(s.id)?" got":"")+'"><div class="ic"></div><b>'+esc(s.n)+'</b><span>'+esc(s.d)+'</span></div>'
  ).join("");
}

/* ------------------------- RECORDS ------------------------- */
let rtab = "board";
document.querySelectorAll("[data-rtab]").forEach(b=>{
  b.addEventListener("click", ()=>{
    rtab=b.dataset.rtab; Snd.ui();
    document.querySelectorAll("[data-rtab]").forEach(x=>x.classList.toggle("on", x===b));
    renderRecords();
  });
});
function renderRecords(){
  const el=$("records-body");
  if(rtab==="board"){
    if(!SAVE.board.length){ el.innerHTML='<div class="empty">No runs recorded on this device. The local chronicle is blank.</div>'; return; }
    el.innerHTML='<div class="mtitle" style="color:var(--gold-dim);margin-bottom:1vh">Best runs on this device</div><div class="lb">'+SAVE.board.map((r,i)=>
      '<div class="lbrow'+(i===0?" top":"")+'"><div class="pos">'+(i+1)+'</div>'+
      '<div class="mode">'+esc(MODES[r.mode]?MODES[r.mode].name:r.mode)+' · '+esc((typeof resolveDiff==="function"?resolveDiff(r.diff):DIFFS.watchman).name)+' · '+r.acc+'%</div>'+
      '<div class="sc">'+fmt(r.score)+'</div><div class="dt">'+esc(r.date)+'</div></div>').join("")+'</div>';
  } else if(rtab==="daily" || rtab==="blitz"){
    const cloudOn = typeof Cloud!=="undefined" && Cloud.configured();
    if(!cloudOn){
      el.innerHTML='<div class="empty">Cloud boards need a configured Supabase project (see BACKEND.md). Local play still works.</div>';
      return;
    }
    const trustTag = (typeof Cloud!=="undefined" && typeof Cloud.lastSubmitVia === "function" && Cloud.lastSubmitVia() === "direct")
      ? ' <span class="trust-pill">(Honor system)</span>' : '';
    const title = (rtab==="daily" ? "Daily global · "+todayKey() : "Blitz global") + trustTag;
    el.innerHTML='<div class="mtitle">'+title+'</div><div class="board-loading">Loading…</div>';
    const p = rtab==="daily"
      ? Promise.all([Cloud.fetchDailyBoard(todayKey(), 25), Cloud.isSignedIn()?Cloud.fetchMyDailyRank(todayKey()):null])
      : Promise.all([Cloud.fetchBlitzBoard(25), Cloud.isSignedIn()?Cloud.fetchMyBlitzRank():null]);
    p.then(([rows, mine])=>{
      if(mine && rows) rows.forEach(function(r){ if(r.id === mine.id) r.mine = true; });
      if(!rows || !rows.length){
        const fail = Cloud.boardLoadFailed && Cloud.boardLoadFailed();
        el.innerHTML='<div class="mtitle">'+esc(title)+'</div><div class="empty">'+(fail
          ? "Could not reach the board."
          : "No scores yet. Sign in and finish a run to appear here.")+'</div>';
        return;
      }
      let html = '<div class="mtitle">'+title+'</div><div class="lb global-lb">';
      rows.forEach(r=>{
        const extra = rtab==="daily"
          ? fmt(r.score)+(r.accuracy!=null?' · '+Math.round(Number(r.accuracy))+'%':'')+(r.diff?' · '+esc(r.diff):'')
          : fmt(r.score)+' verses'+(r.survived_ms!=null?' · '+Math.round(r.survived_ms/1000)+'s':'');
        html += '<div class="lbrow'+(r.mine?" mine":"")+(r.rank===1?" top":"")+'" data-score-id="'+esc(r.id||"")+'" data-score-board="'+rtab+'">'+
          '<div class="pos">'+r.rank+'</div>'+
          '<div class="mode">'+esc(r.name)+(r.mine?' · you':'')+'</div>'+
          '<div class="sc">'+extra+'</div>'+
          (Cloud.isSignedIn() && r.id ? '<button type="button" class="board-report" data-report-score="'+esc(r.id)+'">Report</button>' : '')+
          '</div>';
      });
      html += '</div>';
      if(mine && !rows.some(r=>r.mine)){
        html += '<div class="board-you-sep">Your best on this board</div><div class="lb global-lb">'+
          '<div class="lbrow mine"><div class="pos">'+mine.rank+'</div><div class="mode">'+esc(mine.name)+' · you</div>'+
          '<div class="sc">'+fmt(mine.score)+(rtab==="blitz"?' verses':'')+'</div></div></div>';
      }
      if(!Cloud.isSignedIn()){
        html += '<div class="hint" style="margin-top:1.4vh">Sign in under Settings to post scores and see your rank.</div>';
      }
      el.innerHTML = html;
      bindLeaderboardReports(el, rtab);
    }).catch(()=>{
      el.innerHTML='<div class="mtitle">'+esc(title)+'</div><div class="empty">Could not reach the board.</div>';
    });
  } else if(rtab==="life"){
    const li=levelInfo(SAVE.xp);
    const acc = SAVE.life.attempts ? Math.round(SAVE.life.correct/SAVE.life.attempts*100) : 0;
    const booksC = Object.keys(SAVE.books).filter(b=>SAVE.books[b].c>0).length;
    el.innerHTML='<div class="statgrid">'+
      box(li.level,"Level")+box(rankFor(li.level),"Rank")+box(fmt(SAVE.xp),"Total XP")+
      box(fmt(SAVE.runs),"Runs")+box(fmt(SAVE.life.correct),"Verses kept")+box(acc+"%","Lifetime accuracy")+
      box(SAVE.life.bestStreak,"Best streak")+box(booksC+" / 66","Books touched")+
      box(fmt(SAVE.best.trial),"Trial best")+box(fmt(SAVE.best.endless),"Endless best")+
      box(fmt(SAVE.best.daily),"Daily best")+box(SAVE.life.sdBest,"Final Test best")+
      box(SAVE.life.endlessBest,"Longest gauntlet")+box(SAVE.life.dailyDone,"Dailies completed")+
      box(SAVE.life.quickRewards||0,"Quick rewards banked")+
      box(SAVE.life.illumRewards||0,"Illuminate earned")+
      box(Pilgrimage.clearedCount(SAVE.pilgrim)+" / "+Pilgrimage.count(),"Sites cleared")+
      box(fmt(SAVE.best.pilgrimage),"Pilgrimage best")+
      box(SAVE.seals.length+" / "+SEALS.length,"Seals")+
      '</div>';
    function box(a,b){ return '<div class="sbox"><b>'+esc(String(a))+'</b><span>'+esc(b)+'</span></div>'; }
  } else {
    const rows = BOOKS_ORDER.filter(b=>SAVE.books[b] && SAVE.books[b].a>0)
      .map(b=>({b, c:SAVE.books[b].c, a:SAVE.books[b].a, p:SAVE.books[b].c/SAVE.books[b].a}));
    if(!rows.length){ el.innerHTML='<div class="empty">No book has been tested yet.</div>'; return; }
    rows.sort((x,y)=>x.p-y.p);
    el.innerHTML='<div class="bookbars"><div class="mtitle" style="color:var(--gold-dim)">Weakest books first — this is your revision list</div>'+
      rows.map(r=>'<div class="bb"><i>'+esc(r.b)+'</i><div class="bar"><u style="width:'+(r.p*100)+'%"></u></div>'+
      '<b>'+Math.round(r.p*100)+'%</b></div>').join("")+'</div>';
  }
}

function bindLeaderboardReports(host, board){
  if(!host || typeof Cloud==="undefined" || !Cloud.reportScore) return;
  host.querySelectorAll("[data-report-score]").forEach(function(btn){
    btn.addEventListener("click", async function(){
      const reason = window.prompt("Why should this score be reviewed? (8–500 characters)");
      if(reason == null) return;
      btn.disabled = true;
      const res = await Cloud.reportScore(board, btn.dataset.reportScore, reason);
      btn.disabled = false;
      toast(res.ok ? "Report submitted for moderation" : "Report could not be submitted");
    });
  });
}

/* ------------------------- SETTINGS ------------------------- */
function setRow(l,sub,ctrl){ return '<div class="setrow"><div><label>'+esc(l)+'</label><small>'+esc(sub)+'</small></div>'+ctrl+'</div>'; }
function seg(key,opts,cur){
  return '<div class="seg" data-seg="'+key+'">'+opts.map(o=>
    '<button data-val="'+o[0]+'" class="'+(String(cur)===String(o[0])?"on":"")+'">'+esc(o[1])+'</button>').join("")+'</div>';
}
function settingsAccountHtml(){
  const cloudOn = typeof Cloud!=="undefined" && Cloud.configured();
  const signedIn = cloudOn && Cloud.isSignedIn();
  const who = signedIn
    ? ((Cloud.profile() && Cloud.profile().display_name) || (Cloud.user() && Cloud.user().email) || "Signed in")
    : "";
  if(!cloudOn){
    return '<div class="setrow account"><div><label>Cloud account</label><small>Offline only — add Project URL and anon key in js/cloud-config.js (see BACKEND.md). <a href="privacy.html">Privacy</a></small></div><span class="cloud-pill dim">Local</span></div>';
  }
  if(signedIn){
    return '<div class="setrow account"><div><label>Cloud account</label><small>Synced as <b>'+esc(who)+'</b>. Progress pushes after each save. <a href="privacy.html">Privacy</a></small></div>'+
      '<button class="btn ghost sm" id="cloud-signout" type="button">Sign out</button></div>'+
      setRow("Display name","Shown on Daily and Blitz boards.",
        '<div class="cloud-name"><input id="cloud-name" type="text" maxlength="32" value="'+esc((Cloud.profile()&&Cloud.profile().display_name)||"")+'"><button class="btn ghost sm" id="cloud-name-save" type="button">Save</button></div>')+
      '<div class="setrow"><div><label>Sync now</label><small>Pull and merge this device with the cloud, then push.</small></div>'+
      '<button class="btn ghost sm" id="cloud-sync" type="button">Sync</button></div>';
  }
  return '<div class="setrow account"><div><label>Cloud account</label><small>Sign in to sync the Pilgrimage across devices and appear on leaderboards. <a href="privacy.html">Privacy</a></small></div></div>'+
    '<div class="setrow"><div><label>Email sign-in</label><small>We email a one-tap magic link & 6-digit code.</small></div>'+
    '<div class="cloud-name"><input id="cloud-email" type="email" placeholder="you@example.com" value="'+esc((typeof localStorage!=="undefined"?localStorage.getItem("cloud_pending_email"):"")||"")+'" autocomplete="email"><button class="btn sm" id="cloud-signin" type="button">Send code</button></div></div>'+
    '<div class="setrow"><div><label>Enter 6-digit code</label><small>Email link expired or pre-scanned? Type the 6-digit code here.</small></div>'+
    '<div class="cloud-name"><input id="cloud-otp" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="10" placeholder="123456" autocomplete="one-time-code"><button class="btn ghost sm" id="cloud-verify-otp" type="button">Confirm code</button></div></div>';
}
function renderSettings(){
  const s=SAVE.set;
  const accountBlock = settingsAccountHtml();

  const ch = activeCharacter();
  const nameNow = playerDisplayName();
  const profileBlock =
    setRow("Your name", "Shown on this device and on cloud boards when signed in.",
      '<div class="cloud-name"><input id="set-player-name" type="text" maxlength="32" value="'+esc(SAVE.set.playerName||"")+'"><button class="btn ghost sm" id="set-name-save" type="button">Save</button></div>') +
    setRow("Avatar",
      ch ? (ch.name + " — your scholar. Portrait on the menu; they walk the map.")
         : "Choose a scholar.",
      '<button class="btn ghost sm" id="set-character" type="button">'+(ch ? "Change · "+esc(ch.short) : "Choose avatar")+'</button>');

  $("settings-body").innerHTML =
    accountBlock +
    profileBlock +
    setRow("Ordeal","Disciple is the learning path. Watchman is the full clock.",
      seg("diff",[["disciple","Disciple"],["watchman","Watchman"]],s.diff||"disciple")) +
    setRow("Music","Ambient drone beneath the cathedral.",
      '<input type="range" id="set-music" min="0" max="1" step="0.05" value="'+s.music+'">') +
    setRow("Sound effects","Ticks, heartbeat, the hit when you are wrong.",
      '<input type="range" id="set-sfx" min="0" max="1" step="0.05" value="'+s.sfx+'">') +
    setRow("Mission voice","Narrates act changes, special sequences and major outcomes.",
      seg("voice",[[true,"On"],[false,"Off"]],s.voice)) +
    setRow("Visual quality","Choose the effects profile that best matches this device.",
      seg("quality",[["high","Cinematic"],["balanced","Balanced"],["low","Efficient"]],s.quality||"high")) +
    setRow("Motion intensity","Motion level for effects, grain and ambient loops.",
      seg("motion",[["full","Full"],["calm","Calm"],["reduced","Reduced"]],s.motion||(s.reduced?"reduced":"full"))) +
    setRow("Screen shake","The kick when you lose a life.",
      seg("shake",[[true,"On"],[false,"Off"]],s.shake)) +
    setRow("Live conditions","Real current weather at each site on the Pilgrimage map. Off, or offline, it uses that place's typical climate instead — the map never waits on it.",
      seg("liveWeather",[[true,"On"],[false,"Off"]],s.liveWeather)) +
    setRow("Quiet mode","Lowers music and softens SFX in one step.",
      seg("quiet",[[false,"Off"],[true,"On"]],!!s.quiet)) +
    setRow("High contrast","Stronger parchment and ink for readability.",
      seg("contrast",[[false,"Off"],[true,"On"]],!!s.contrast)) +
    setRow("Haptics","Short vibration on correct and wrong answers (supported devices).",
      seg("haptics",[[true,"On"],[false,"Off"]],s.haptics!==false)) +
    setRow("Single-tap answers","Answer the moment you tap a phrase. Off restores select-then-lock.",
      seg("singleTap",[[true,"On"],[false,"Off"]],s.singleTap!==false)) +
    '<div class="footer"><button class="btn ghost sm" id="set-diag">Copy diagnostics</button>' +
    '<button class="btn ghost sm" id="set-road">Restart the Pilgrimage</button>' +
    '<button class="btn ghost sm" id="set-reset">Erase all progress</button></div>';

  bindSettingsHandlers();
}

function bindSettingsDiag(){
  const diagBtn = $("set-diag");
  if(!diagBtn) return;
  diagBtn.addEventListener("click", ()=>{
    Snd.ui();
    if(!(typeof Diag !== "undefined" && typeof Diag.dump === "function")) return;
    const dumpText = Diag.dump();
    if(typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(dumpText).then(()=>{
        if(typeof toast === "function") toast("Diagnostics copied to clipboard");
      }).catch(()=>{
        if(typeof toast === "function") toast("Could not write to clipboard");
      });
    } else if(typeof toast === "function") toast("Clipboard unavailable");
  });
}
function bindSettingsHandlers(){
  $("set-music").addEventListener("input", e=>{
    SAVE.set.musicMute = false;
    Snd.unlock(); Snd.setMusic(parseFloat(e.target.value)); persist();
    if(typeof paintAudioDock==="function") paintAudioDock();
  });
  $("set-sfx").addEventListener("input", e=>{
    SAVE.set.sfxMute = false;
    Snd.unlock(); Snd.setSfx(parseFloat(e.target.value)); persist();
    if(typeof paintAudioDock==="function") paintAudioDock();
  });
  bindSettingsDiag();
  const charBtn = $("set-character");
  if(charBtn) charBtn.addEventListener("click", ()=>{ Snd.ui(); openSkinPicker(); });
  const nameSave = $("set-name-save");
  if(nameSave){
    nameSave.addEventListener("click", ()=>{
      const raw = ($("set-player-name") && $("set-player-name").value || "").trim();
      if(raw.length < 2){ toast("Name needs at least two letters"); return; }
      SAVE.set.playerName = raw.slice(0, 32);
      SAVE.set.profileDone = true;
      persist();
      Snd.ui();
      updatePlayerCard();
      if(typeof Cloud!=="undefined" && Cloud.configured() && Cloud.isSignedIn()){
        Cloud.setDisplayName(SAVE.set.playerName).then(res=>{
          toast(res.ok ? "Name saved" : (Cloud.authNotice ? Cloud.authNotice(res.reason) : "Saved locally"));
          if(res.ok){ updateCloudChip(); renderSettings(); }
        });
      } else toast("Name saved");
      updatePlayerCard();
    });
  }
  document.querySelectorAll("[data-seg]").forEach(g=>{
    g.querySelectorAll("button").forEach(b=>{
      b.addEventListener("click", ()=>{
        const key=g.dataset.seg; let v=b.dataset.val;
        if(v==="true") v=true; else if(v==="false") v=false;
        SAVE.set[key]=v;
        if(key==="motion"){ SAVE.set.reduced = (v === "reduced"); }
        if(key==="reduced"){ SAVE.set.motion = v ? "reduced" : "full"; }
        if(key==="quality") SAVE.set.qualityLocked=true;
        persist(); Snd.ui();
        g.querySelectorAll("button").forEach(x=>x.classList.toggle("on", x===b));
        applySettings();
      });
    });
  });

  const signInBtn = $("cloud-signin");
  if(signInBtn){
    signInBtn.addEventListener("click", async ()=>{
      const email = ($("cloud-email") && $("cloud-email").value || "").trim();
      if(!email){ toast("Enter an email address"); return; }
      signInBtn.disabled = true;
      const res = await Cloud.signInWithEmail(email);
      signInBtn.disabled = false;
      toast(Cloud.authNotice ? Cloud.authNotice(res.ok ? "sent" : res.reason) : (res.ok ? "Check your email for the sign-in code/link" : "Sign-in failed"));
    });
  }
  const verifyOtpBtn = $("cloud-verify-otp");
  if(verifyOtpBtn){
    verifyOtpBtn.addEventListener("click", async ()=>{
      const email = ($("cloud-email") && $("cloud-email").value || "").trim();
      const token = ($("cloud-otp") && $("cloud-otp").value || "").trim();
      if(!email){ toast("Enter your email address above"); return; }
      if(!token){ toast("Enter the 6-digit code from your email"); return; }
      verifyOtpBtn.disabled = true;
      const res = await Cloud.verifyOtp(email, token);
      verifyOtpBtn.disabled = false;
      if(res.ok){
        if(typeof Snd !== "undefined" && Snd.ui) Snd.ui();
        renderSettings();
        toast("Signed in successfully");
      } else {
        toast(Cloud.authNotice ? Cloud.authNotice(res.reason) : "Invalid code. Try again.");
      }
    });
  }
  const signOutBtn = $("cloud-signout");
  if(signOutBtn){
    signOutBtn.addEventListener("click", async ()=>{
      await Cloud.signOut(); Snd.ui(); renderSettings(); toast("Signed out — progress stays on this device");
    });
  }
  const cloudNameSave = $("cloud-name-save");
  if(cloudNameSave){
    cloudNameSave.addEventListener("click", async ()=>{
      const res = await Cloud.setDisplayName(($("cloud-name") && $("cloud-name").value) || "");
      toast(res.ok ? "Display name saved" : (Cloud.authNotice ? Cloud.authNotice(res.reason) : "Could not save name"));
      if(res.ok) renderSettings();
    });
  }
  const syncBtn = $("cloud-sync");
  if(syncBtn){
    syncBtn.addEventListener("click", async ()=>{
      syncBtn.disabled = true;
      const res = await Cloud.syncOnBoot(SAVE);
      if(res.ok && res.save){ SAVE = res.save; persist(); Atlas.setProgress(SAVE.pilgrim); updatePlayerCard(); }
      syncBtn.disabled = false;
      if(!res.ok && typeof showState==="function"){
        showState("cloud-fail", {
          onPrimary: function(){ hideState(); },
          onSecondary: function(){ hideState(); if(syncBtn) syncBtn.click(); }
        });
      } else {
        toast(res.ok ? (res.merged ? "Cloud merge complete" : "Cloud save updated") : (res.reason === "stale-revision" ? "Another device saved first. Sync again." : "Sync failed"));
      }
      renderSettings();
    });
  }

  /* Deliberately separate from the full erase: a player who wants to
     walk the road again from Ur should not have to give up their seals,
     their level and their whole scheduling history to do it. */
  $("set-road").addEventListener("click", ()=>{
    const done = Pilgrimage.clearedCount(SAVE.pilgrim);
    if(!done){ toast("The journey has not started yet"); return; }
    if(!confirm("Seal all "+done+" cleared sites again and start the road from Ur? Seals, level and verse history are kept.")) return;
    SAVE.pilgrim = Pilgrimage.blankProgress(); persist();
    Atlas.setProgress(SAVE.pilgrim); Snd.ui(); renderSettings(); toast("The road is sealed back to Ur");
  });
  $("set-reset").addEventListener("click", ()=>{
    if(!confirm("Erase every seal, record and statistic? This cannot be undone.")) return;
    SAVE = JSON.parse(JSON.stringify(DEFAULT_SAVE)); persist();
    Atlas.setProgress(SAVE.pilgrim);
    applySettings(); updatePlayerCard(); renderSettings(); toast("All progress erased");
  });
}
function syncHallVideo(quality){
  const v=$("hall-bg");
  if(!v || typeof v.play!=="function") return;
  const holdForIntro=currentView==="intro" || (currentView==="boot" && !introDone && introAllowed());
  /* The hall bed plays only when quality, motion and the user's data
     preference all allow it — and it is never fetched until then. */
  // The hall is menu scenery, never a second gameplay backdrop.
  const allow=currentView!=="play" && currentView!=="tablets" && quality!=="low" && !document.body.classList.contains("reduced") && !holdForIntro && !dataSaverOn();
  if(!allow){
    try{ v.pause(); }catch(e){}
    document.body.classList.remove("hall-ready");
    return;
  }
  if(!v._hallBound){
    v._hallBound=true;
    v.preload="auto";
    v.addEventListener("playing", ()=>document.body.classList.add("hall-ready"));
    v.addEventListener("stalled", ()=>{ try{ v.play(); }catch(e){} });
  }
  if(!v.paused) return;
  const p=v.play();
  if(p&&p.catch) p.catch(()=>{});
}
function applySettings(){
  const systemReduced=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
  const motionMode = SAVE.set.motion || (SAVE.set.reduced ? "reduced" : "full");
  const isReduced = motionMode === "reduced" || systemReduced || !!SAVE.set.reduced;
  const isCalm = motionMode === "calm" && !isReduced;
  document.body.classList.toggle("reduced", isReduced);
  document.body.classList.toggle("motion-calm", isCalm);
  document.body.classList.toggle("contrast", !!SAVE.set.contrast);
  document.body.classList.remove("quality-high","quality-balanced","quality-low");
  let quality=["high","balanced","low"].includes(SAVE.set.quality)?SAVE.set.quality:"high";
  /* Prefer efficient profile on small/touch devices unless the player chose. */
  if(!SAVE.set.qualityLocked && window.matchMedia && matchMedia("(max-width:720px), (pointer:coarse)").matches){
    if(quality==="high") quality="balanced";
  }
  document.body.classList.add("quality-"+quality);
  syncHallVideo(quality);
  if(typeof Snd!=="undefined" && Snd.syncLevels) Snd.syncLevels();
  if(typeof paintAudioDock==="function") paintAudioDock();
  if(typeof updateSiteVideoVolume==="function") updateSiteVideoVolume();
  Live.configure({enabled: SAVE.set.liveWeather !== false});
  Director.syncFx();
  if(typeof Backdrop!=="undefined" && Backdrop.syncSky) Backdrop.syncSky();
  if(currentView==="play")Viz.size();
  updateCloudChip();
  updateOfflineBanner();
}
