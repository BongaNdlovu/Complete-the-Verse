/* ==================================================================
   BACKDROP — a static cinematic field. No 3D scene, no particles.
   Deep black with a faint act-coloured wash; the vignette and grain
   layers sit above it. Values are raw rgb triples for rgba() use.
   ================================================================== */
const PALETTES = {
  menu:    {a:'138,111,52', b:'26,20,9',  c:'90,72,34'},
  act1:    {a:'138,111,52', b:'26,20,9',  c:'90,72,34'},
  act2:    {a:'44,74,110',  b:'10,18,32', c:'30,52,80'},
  act3:    {a:'150,72,26',  b:'29,12,5',  c:'104,44,14'},
  act4:    {a:'80,57,120',  b:'18,12,30', c:'52,36,84'},
  act5:    {a:'128,20,24',  b:'26,4,7',   c:'96,14,18'},
  results: {a:'154,124,60', b:'28,21,9',  c:'104,82,40'}
};

const Backdrop = (function(){
  let el = null;
  function apply(name){
    if(!el) return;
    const p = PALETTES[name] || PALETTES.menu;
    el.style.setProperty('--bd-a', p.a);
    el.style.setProperty('--bd-b', p.b);
    el.style.setProperty('--bd-c', p.c);
  }
  return {
    init(){ el = document.getElementById('backdrop'); apply('menu'); return !!el; },
    palette(name){ apply(name); },
    hit(kind){
      if(!el) return;
      if(kind === 'wrong' || kind === 'death' || kind === 'levelup'){
        el.classList.remove('jolt'); void el.offsetWidth; el.classList.add('jolt');
      }
    }
  };
})();

/* ==================================================================
   GAME — modes, progression, meta, UI
   ================================================================== */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const sep = s => /^[.,;:!?]/.test(s) ? "" : " ";
const fullVerse = v => v.p + " " + v.a + sep(v.s) + v.s;
function shuffle(a, rnd){ a = a.slice(); const r = rnd || Math.random;
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function mulberry32(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0;
  let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
  return ((t^t>>>14)>>>0)/4294967296; }; }
function todayKey(d){ d=d||new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function seedFromString(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
const fmt = n => Math.round(n).toLocaleString();

/* ------------------------- SAVE ------------------------- */
const SAVE_KEY = "ctv_save_v3";
const LEGACY_SAVE_KEY = "ctv_save_v2";
const DEFAULT_SAVE = {
  v:3, xp:0, runs:0,
  best:{trial:0, endless:0, daily:0, practice:0, recall:0, pilgrimage:0, "pilgrim-recall":0},
  seals:[],
  life:{correct:0, attempts:0, bestStreak:0, sdBest:0, endlessBest:0, dailyDone:0, perfectActs:0,
        typedExact:0, typedAttempts:0, reviewsDone:0, sitesCleared:0, arcsCleared:0},
  books:{}, verse:{}, srs:{}, board:[],
  daily:{date:"", score:0},
  /* The road from Ur to Patmos. Shape is owned by pilgrimage.js —
     blankProgress() there is the authority — and stored here so a
     journey survives a reload. */
  pilgrim:{sites:{}, lastPlayed:"", started:0},
  set:{music:0.45, sfx:0.7, quality:"high", reduced:false, shake:true, voice:true, diff:"disciple",
       tutorialDone:false, liveWeather:true, coldOpenDone:false}
};
let SAVE = load();
function load(){
  try{
    let raw = localStorage.getItem(SAVE_KEY), migrating = false;
    if(!raw){ raw = localStorage.getItem(LEGACY_SAVE_KEY); migrating = !!raw; }
    if(!raw) return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    const s = JSON.parse(raw);
    const out = Object.assign(JSON.parse(JSON.stringify(DEFAULT_SAVE)), s, {
      v:3,
      best:Object.assign({}, DEFAULT_SAVE.best, s.best||{}),
      life:Object.assign({}, DEFAULT_SAVE.life, s.life||{}),
      set:Object.assign({}, DEFAULT_SAVE.set, s.set||{}),
      daily:Object.assign({}, DEFAULT_SAVE.daily, s.daily||{}),
      srs:Object.assign({}, s.srs||{}),
      // A save written before the Pilgrimage existed has no `pilgrim`
      // key at all. Merging rather than replacing means such a player
      // simply starts the journey at Ur with everything else intact —
      // no wipe, no reset, no lost seals.
      pilgrim:Object.assign({sites:{}, lastPlayed:"", started:0}, s.pilgrim||{}, {
        sites:Object.assign({}, (s.pilgrim && s.pilgrim.sites) || {})
      })
    });
    if(migrating) migrateV2(out, s);
    return out;
  }catch(e){ return JSON.parse(JSON.stringify(DEFAULT_SAVE)); }
}

/* v2 keyed verse stats by position in the VERSES array. This release cuts
   296 verses, so those positions no longer mean anything — re-point every
   record through LEGACY_IDS and drop the ones whose verse is gone.
   Lifetime totals, seals, XP and records are untouched. */
function migrateV2(out, old){
  const table = (typeof LEGACY_IDS !== "undefined" && LEGACY_IDS) || null;
  const moved = {};
  if(table && old.verse){
    Object.keys(old.verse).forEach(k => {
      const idx = parseInt(k, 10);
      if(!Number.isFinite(idx)) return;
      const id = table[idx];
      if(id) moved[id] = old.verse[k];
    });
  }
  out.verse = moved;
  // v2 kept no scheduling, so seed a card from what it did know: anything
  // answered correctly is treated as one successful review due today, so
  // returning players start with a full drill rather than an empty one.
  out.srs = {};
  const today = SRS.dayNumber();
  Object.keys(moved).forEach(id => {
    const st = moved[id];
    if(!st || !st.a) return;
    const card = SRS.freshCard();
    if(st.c > 0){ card.reps = 1; card.ivl = 1; card.due = today; card.last = today; }
    else { card.lapses = 1; card.due = today; }
    out.srs[id] = card;
  });
}
function persist(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){} }

/* ------------------------- SRS ACCESS ------------------------- */
function today(){ return SRS.dayNumber(); }
function cardFor(v){ return SAVE.srs[v.id]; }
function reviewVerse(q, opts){
  const prev = SAVE.srs[q.id];
  const quality = SRS.gradeAnswer(opts);
  SAVE.srs[q.id] = SRS.schedule(prev, quality, today());
  SAVE.life.reviewsDone++;
  return SAVE.srs[q.id];
}
function dueToday(){ return SRS.dueCount(VERSES, cardFor, today()); }

/* ------------------------- PROGRESSION ------------------------- */
function xpNeeded(l){ return Math.round(320 * Math.pow(l, 1.32)); }
function levelInfo(xp){
  let l=1, rem=xp;
  while(l < 99 && rem >= xpNeeded(l)){ rem -= xpNeeded(l); l++; }
  return {level:l, into:rem, need:xpNeeded(l)};
}
const RANKS = [
  {l:1,t:"Hearer"},{l:3,t:"Reader"},{l:5,t:"Scribe"},{l:8,t:"Levite"},
  {l:11,t:"Watchman"},{l:15,t:"Seer"},{l:20,t:"Keeper of the Word"},{l:27,t:"Prophet of the Living God"}
];
function rankFor(level){ let r=RANKS[0]; RANKS.forEach(x=>{ if(level>=x.l) r=x; }); return r.t; }
const RUN_TITLES = [
  {s:0,t:"Hearer"},{s:3500,t:"Reader"},{s:9000,t:"Scribe"},{s:18000,t:"Levite"},
  {s:30000,t:"Watchman"},{s:46000,t:"Seer"},{s:68000,t:"Keeper of the Word"},{s:95000,t:"Prophet of the Living God"}
];
function runTitle(score){ let r=RUN_TITLES[0]; RUN_TITLES.forEach(x=>{ if(score>=x.s) r=x; }); return r.t; }

/* ------------------------- SEALS ------------------------- */
const SEALS = [
  {id:"first",   n:"First Light",        d:"Complete your first run."},
  {id:"unshaken",n:"Unshaken",           d:"Clear a full act without losing a life."},
  {id:"recall",  n:"Perfect Recall",     d:"Answer 10 correct in a row."},
  {id:"flame",   n:"Flame Keeper",       d:"Answer 20 correct in a row."},
  {id:"watch",   n:"The Watchman",       d:"Reach Act V of the Trial."},
  {id:"swift",   n:"Swift of Tongue",    d:"Answer 10 times under 1.5 seconds in one run."},
  {id:"nocrutch",n:"No Crutch",          d:"Finish the Trial without spending a single power."},
  {id:"flawless",n:"Nothing Lost",       d:"Finish the Trial with no wrong answers."},
  {id:"score25", n:"Weight of Glory",    d:"Score 25,000 in a single run."},
  {id:"score50", n:"Crown of Gold",      d:"Score 50,000 in a single run."},
  {id:"sd15",    n:"Final Witness",      d:"Complete the five-question Final Test."},
  {id:"end40",   n:"Long Obedience",     d:"Answer 40 questions in one Endless run."},
  {id:"daily7",  n:"Daily Bread",        d:"Complete 7 Daily Trials."},
  {id:"books30", n:"Testament Bearer",   d:"Answer correctly from 30 different books."},
  {id:"books66", n:"The Whole Counsel",  d:"Answer correctly from all 66 books."},
  {id:"lvl20",   n:"Master of the Word", d:"Reach level 20."},
  {id:"life500", n:"Scribe's Hand",      d:"500 correct answers, all-time."},
  {id:"ironman", n:"Iron Sharpeneth",    d:"Complete the Trial on Watchman difficulty."},
  {id:"road-first", n:"Get Thee Out",    d:"Clear your first site on the Pilgrimage."},
  {id:"road-arc1",  n:"Out of Ur",       d:"Complete the Patriarchs — Ur to Beersheba."},
  {id:"road-half",  n:"Half the Road",   d:"Complete two full arcs of the Pilgrimage."},
  {id:"road-patmos",n:"The Last Island", d:"Reach and clear Patmos."},
  {id:"road-end",   n:"Ur to Patmos",    d:"Clear all 29 sites on the Pilgrimage."},
  /* One per arc. A site's perfect flag is sticky, so an arc can be
     perfected a site at a time — the seal rewards precision over the
     whole stretch, not one flawless sitting. */
  {id:"arc-patriarchs",n:"Faith of Abraham", d:"Keep every verse at every site from Ur to Beersheba."},
  {id:"arc-exodus",    n:"Out of Egypt",     d:"Keep every verse at every site from Goshen to Jericho."},
  {id:"arc-kingdom",   n:"By the Rivers",    d:"Keep every verse at every site from Jerusalem to Susa."},
  {id:"arc-gospel",    n:"To the Ends",      d:"Keep every verse at every site from Bethlehem to Patmos."},
  {id:"relay",         n:"Without Rest",     d:"Walk a whole arc in one unbroken run."}
];
function hasSeal(id){ return SAVE.seals.indexOf(id) >= 0; }

/* ------------------------- MODES / DIFFICULTY / ACTS ------------------------- */
const MODES = {
  /* The Pilgrimage does not use the standard brief screen — it opens the
     atlas instead, and the site you pick there is the level. `atlas:true`
     is what routes it. `hidden:true` keeps a mode off the menu without
     hiding it from the results screen, which still needs its name. */
  pilgrimage:{ key:"pilgrimage", name:"The Pilgrimage", kick:"The long road", atlas:true,
    desc:"Twenty-nine places, in the order Scripture walks them — from the city Abraham left to the island where the last book was written. Each site is six verses drawn from its own scripture, and clearing it opens the next stretch of road. The clock closes as you go east.",
    tagline:"29 sites · Ur to Patmos", info:[["29","Sites"],["6","Verses each"],["14→6.5s","Clock"]] },
  "pilgrim-recall":{ key:"pilgrim-recall", name:"Pilgrim’s Recall", kick:"Typed from memory", hidden:true,
    desc:"A site you have already cleared, walked again with no options on the screen. Same place, same verses, typed out word for word.",
    tagline:"Typed · cleared sites", info:[["6","Verses"],["Typed","No options"],["22s","Clock"]] },
  /* The relay is opt-in and launched from an arc on the map, never from
     the menu — it is the harder way to walk ground the site-by-site
     campaign already lets you take at your own pace. */
  relay:{ key:"relay", name:"The Long Road", kick:"One unbroken walk", hidden:true,
    desc:"A whole arc in a single run. Lives carry from site to site and never come back, and the clock keeps tightening the way the road does. Sites you pass stay cleared even if the road ends you.",
    tagline:"A whole arc · shared lives", info:[["1","Run"],["Shared","Lives"],["No","Rest"]] },
  trial:{ key:"trial", name:"The Trial", kick:"Campaign",
    desc:"Five acts. The clock tightens with every one. Reach Act V with one life, clear its five questions, and earn the ending.",
    tagline:"5 acts · one-life finale", info:[["5","Acts"],["39+","Verses"],["14→6.5s","Clock"]] },
  endless:{ key:"endless", name:"Endless Gauntlet", kick:"Survival",
    desc:"One continuous run. The timer shrinks a fraction each question and never resets. Difficulty climbs through the tiers until the whole Bible is on the table. There is no finish line — only a number.",
    tagline:"Infinite · shrinking clock", info:[["∞","Questions"],["12→4.2s","Clock"],["All 5","Tiers"]] },
  daily:{ key:"daily", name:"Daily Trial", kick:"One shot a day",
    desc:"Twenty verses, drawn by today's date. Everyone who plays today gets exactly the same twenty in exactly the same order. One recorded attempt — after that you may practise, but the score stands.",
    tagline:"20 verses · same for everyone", info:[["20","Verses"],["1","Recorded run"],["10s","Clock"]] },
  practice:{ key:"practice", name:"The Drill", kick:"Spaced review",
    desc:"The verses that have fallen due, most overdue first, then whatever you have never seen. Every answer reschedules the verse — get it right and it comes back later, get it wrong and it comes back tomorrow. Longer clock. Built to teach, not to crown a score.",
    tagline:"15 verses · due first", info:[["15","Verses"],["Due","Ordered by"],["12s","Clock"]] },
  recall:{ key:"recall", name:"Recall", kick:"Type it from memory",
    desc:"No options to choose between. The blank is empty and you fill it yourself, word for word. Typos are forgiven; the wrong words are not. This is the mode that actually puts a verse in your memory — and the hardest one in the hall.",
    tagline:"12 verses · typed", info:[["12","Verses"],["Typed","No options"],["22s","Clock"]] }
};
const DIFFS = {
  pilgrim:{ key:"pilgrim", name:"Pilgrim", lives:4, time:1.35, score:0.75,
    desc:"Room to breathe. Four lives and a generous clock, for learning the words rather than surviving them." },
  disciple:{ key:"disciple", name:"Disciple", lives:3, time:1.0, score:1.0,
    desc:"The intended ordeal. Three lives, the clock as written. This is the honest measure of what you know." },
  watchman:{ key:"watchman", name:"Watchman", lives:2, time:0.72, score:1.6,
    desc:"Two lives and barely time to read. Scores are worth 60% more because most runs end in Act II." }
};
const ACTS = [
  {n:"I",  name:"The Signal",          tier:1, q:8, t:14000, pal:"act1", sub:"The record opens. Familiar words establish the signal."},
  {n:"II", name:"The Pursuit",         tier:2, q:8, t:12000, pal:"act2", sub:"The pace accelerates. Exact recall is the only way forward."},
  {n:"III",name:"The Blackout",        tier:3, q:9, t:10000, pal:"act3", sub:"Light falls away. Lifelines narrow and the hidden books emerge."},
  {n:"IV", name:"No Turning Back",     tier:4, q:9, t:8500,  pal:"act4", sub:"Rapid decisions. Reduced time. Every answer changes the ending."},
  {n:"V",  name:"The Final Test",      tier:5, q:5, t:6500, pal:"act5", sub:"One life. Five decisions. Complete the passage and hold the line."}
];

/* The streaks at which the score multiplier steps up. Both the
   multiplier and the momentum meter read from this one list, because
   they used to disagree: the meter filled to 100% at a streak of 10
   while ×5 did not land until 12, so the bar sat pinned at "Overdrive"
   for two verses before the reward it was promising actually arrived.
   The meter is now a readout of the multiplier rather than a second
   scale that happens to look like it. */
const MOMENTUM_STEPS = [3, 5, 8, 12];

/* ------------------------- AUDIO ------------------------- */
const Snd = (function(){
  let ctx=null, mMus=null, mSfx=null, pad=[], started=false, avail=true, anal=null, freq=null;
  let bed=null, trackAudio={}, trackNodes={};
  const TRACKS = {
    menu:"audio/menu.mp3",
    act1:"audio/act1.mp3",
    act2:"audio/act2.mp3",
    act3:"audio/act3.mp3",
    act4:"audio/act4.mp3",
    act5:"audio/act5.mp3",
    results:"audio/results.mp3"
  };
  const SFX = {
    ui:"sfx/ui.mp3",
    hover:"sfx/hover.mp3",
    lock:"sfx/lock.mp3",
    correct:"sfx/correct.mp3",
    wrong:"sfx/wrong.mp3",
    tick:"sfx/tick.mp3",
    heart:"sfx/heart.mp3",
    power:"sfx/power.mp3"
  };
  let heartAudio=null;
  function playSfx(name){
    init();
    const src=SFX[name];
    if(!src||!avail) return false;
    try{
      if(name==="heart" && heartAudio){ try{ heartAudio.pause(); }catch(e){} }
      const a=new Audio(src);
      a.volume=Math.max(0,Math.min(1,SAVE.set.sfx||0));
      if(name==="heart") heartAudio=a;
      const p=a.play();
      if(p&&p.catch) p.catch(()=>{});
      return true;
    }catch(e){ return false; }
  }
  function init(){
    if(ctx||!avail) return;
    try{
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      mMus = ctx.createGain(); mMus.gain.value = SAVE.set.music; mMus.connect(ctx.destination);
      mSfx = ctx.createGain(); mSfx.gain.value = SAVE.set.sfx; mSfx.connect(ctx.destination);
      anal = ctx.createAnalyser(); anal.fftSize = 128; anal.smoothingTimeConstant = 0.76;
      freq = new Uint8Array(anal.frequencyBinCount);
      mMus.connect(anal); mSfx.connect(anal);
    }catch(e){ avail=false; }
  }
  function ensureTrack(name){
    if(trackAudio[name] || !ctx || !TRACKS[name]) return;
    const a = new Audio(TRACKS[name]);
    a.loop = true;
    a.preload = "auto";
    try{
      const n = ctx.createMediaElementSource(a);
      n.connect(mMus);
      trackNodes[name] = n;
    }catch(e){}
    trackAudio[name] = a;
  }
  function stopTrack(name){
    const a = trackAudio[name];
    if(!a) return;
    a.pause();
    try{ a.currentTime = 0; }catch(e){}
  }
  function stopAllTracks(){
    Object.keys(trackAudio).forEach(stopTrack);
  }
  function playTrack(name){
    ensureTrack(name);
    const a = trackAudio[name];
    if(!a) return;
    Object.keys(trackAudio).forEach(k=>{ if(k!==name) stopTrack(k); });
    const p = a.play();
    if(p && p.catch) p.catch(()=>{});
  }
  function setPadGain(level){
    if(!ctx || !pad.length) return;
    const t = ctx.currentTime;
    pad.forEach((p,i)=>{
      const target = level * (i===3 ? .03 : .075);
      p.g.gain.cancelScheduledValues(t);
      p.g.gain.linearRampToValueAtTime(Math.max(.0001, target), t + 0.55);
    });
  }
  function startOrRetunePad(notes){
    if(!started){
      started = true;
      notes.forEach((f,i)=>{
        const o=ctx.createOscillator(), g=ctx.createGain(), lfo=ctx.createOscillator(), lg=ctx.createGain();
        o.type = i===3 ? "triangle" : "sine"; o.frequency.value=f;
        g.gain.value=0; g.gain.linearRampToValueAtTime(i===3?.03:.075, ctx.currentTime+3.2);
        lfo.frequency.value=0.05+i*0.033; lg.gain.value=f*0.004;
        lfo.connect(lg); lg.connect(o.frequency); lfo.start();
        o.connect(g); g.connect(mMus); o.start();
        pad.push({o,g,lfo});
      });
    } else {
      pad.forEach((p,i)=>{ if(notes[i]) p.o.frequency.setTargetAtTime(notes[i], ctx.currentTime, 1.1); });
      setPadGain(1);
    }
  }
  function tone(f,dur,type,vol,when,glide){
    if(!ctx||!avail) return;
    const t0=ctx.currentTime+(when||0);
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type||"sine"; o.frequency.setValueAtTime(f,t0);
    if(glide) o.frequency.exponentialRampToValueAtTime(Math.max(20,glide), t0+dur);
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol||.15), t0+Math.min(.03,dur*.25));
    g.gain.exponentialRampToValueAtTime(.0001, t0+dur);
    o.connect(g); g.connect(mSfx); o.start(t0); o.stop(t0+dur+.06);
  }
  function noise(dur,vol,freq,q){
    if(!ctx||!avail) return;
    const t0=ctx.currentTime, len=Math.max(1,Math.floor(ctx.sampleRate*dur));
    const buf=ctx.createBuffer(1,len,ctx.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.5);
    const src=ctx.createBufferSource(); src.buffer=buf;
    const f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=freq||900; f.Q.value=q||1;
    const g=ctx.createGain(); g.gain.value=vol||.12;
    src.connect(f); f.connect(g); g.connect(mSfx); src.start(t0);
  }
  const CHORDS = {
    menu:[55,82.41,110,164.81], act1:[55,82.41,110,164.81], act2:[49,73.42,98,146.83],
    act3:[58.27,87.31,116.54,174.61], act4:[51.91,77.78,103.83,155.56],
    act5:[46.25,61.74,92.5,138.59], results:[65.41,98,130.81,196]
  };
  return {
    unlock(){
      init();
      if(ctx && ctx.state==="suspended") ctx.resume();
      if(TRACKS[bed]) playTrack(bed);
    },
    setMusic(v){ SAVE.set.music=v; if(mMus) mMus.gain.setTargetAtTime(v, ctx.currentTime, .1); },
    setSfx(v){ SAVE.set.sfx=v; if(mSfx) mSfx.gain.setTargetAtTime(v, ctx.currentTime, .05); },
    ambience(name){
      init(); if(!ctx||!avail) return;
      bed = name;
      if(TRACKS[name]){
        setPadGain(0);
        playTrack(name);
        return;
      }
      stopAllTracks();
      startOrRetunePad(CHORDS[name] || CHORDS.menu);
    },
    ui(){ if(playSfx("ui")) return; tone(1320,.05,"triangle",.05); tone(1980,.04,"sine",.025,.02); },
    hover(){ if(playSfx("hover")) return; tone(1540,.03,"sine",.03); },
    tick(crit){ if(playSfx("tick")) return; tone(crit?1240:840,.045,"square",crit?.075:.03); },
    heart(){ if(playSfx("heart")) return; tone(58,.17,"sine",.26); tone(45,.22,"sine",.19,.18); },
    lock(){ if(playSfx("lock")) return; tone(78,.32,"square",.18,0,52); tone(42,.42,"sine",.24); noise(.2,.11,680); },
    pulse(level){
      const v=.035+Math.min(4,level||0)*.014;
      tone(52,.18,"sine",v); tone(104,.07,"triangle",v*.45,.02);
      if(level>=3) noise(.06,.025,1450);
    },
    tension(level){
      if(!ctx||!mMus) return;
      const target=Math.max(.05,SAVE.set.music*(1+Math.min(4,level||0)*.09));
      mMus.gain.setTargetAtTime(target,ctx.currentTime,.35);
    },
    hush(){
      if(!ctx||!mMus) return;
      mMus.gain.setTargetAtTime(.015,ctx.currentTime,.06);
      setTimeout(()=>{ if(ctx&&mMus) mMus.gain.setTargetAtTime(SAVE.set.music,ctx.currentTime,.2); },470);
    },
    correct(){
      if(playSfx("correct")) return;
      [523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>tone(f,1.6,"sine",.11,i*.04));
      tone(130.81,2.0,"triangle",.09); noise(.3,.04,3000);
    },
    wrong(){
      if(playSfx("wrong")) return;
      tone(146.83,1.1,"sawtooth",.10,0,73.4); tone(155.56,1.1,"sawtooth",.085,0,77.8);
      tone(40,1.4,"sine",.22); noise(.75,.18,420);
    },
    act(){ [261.63,329.63,392,523.25,659.25,783.99].forEach((f,i)=>tone(f,2.4,"sine",.085,i*.12));
      tone(65.41,2.8,"triangle",.11); },
    seal(){ [783.99,1046.5,1318.5,1567.98].forEach((f,i)=>tone(f,1.8,"sine",.10,i*.09)); noise(.5,.05,4200); },
    level(){ [392,523.25,659.25,783.99,1046.5,1318.5,1567.98].forEach((f,i)=>tone(f,2.2,"sine",.09,i*.08)); },
    power(){
      if(playSfx("power")) return;
      [880,1174.66,1567.98].forEach((f,i)=>tone(f,1.0,"sine",.08,i*.045));
    },
    death(){ tone(110,3.4,"sine",.20,0,27.5); tone(103.8,3.4,"sawtooth",.075,0,26); noise(1.7,.2,300); },
    victory(){ [392,493.88,587.33,783.99,987.77,1174.66].forEach((f,i)=>tone(f,3.0,"sine",.09,i*.1)); },
    spectrum(){ if(!anal) return null; try{ anal.getByteFrequencyData(freq); }catch(e){ return null; } return freq; }
  };
})();

/* ------------------------- CINEMATIC DIRECTOR ------------------------- */
const Director = (function(){
  let lastPressure=-1,lastMomentum=-1,lastVoice=0;
  function clearBody(prefixes){
    [...document.body.classList].forEach(c=>{ if(prefixes.some(p=>c.indexOf(p)===0)) document.body.classList.remove(c); });
  }
  let voice=null, voiceTried=false;
  /* Rank what the device offers: named baritones first, then accent, then locale.
     Anything non-English scores below zero and is never used. */
  function scoreVoice(v){
    const nm=v.name.toLowerCase();
    if(!/^en/i.test(v.lang)) return -1;
    let s=0;
    if(/daniel|arthur|george|oliver|ryan|brian|guy|james|alfie|thomas|reed|rocko/.test(nm)) s+=40;
    if(/male/.test(nm) && !/female/.test(nm)) s+=25;
    if(/female|samantha|karen|moira|tessa|fiona|zira|susan|catherine/.test(nm)) s-=30;
    if(/en-GB/i.test(v.lang)) s+=30; else if(/en-(ZA|AU|IE)/i.test(v.lang)) s+=18;
    if(/natural|neural|enhanced|premium/.test(nm)) s+=22;
    if(/google/.test(nm)) s+=10;
    if(v.localService) s+=6;
    if(/novelty|whisper|bells|bubbles|zarvox|trinoids|albert|bad news|good news/.test(nm)) s-=80;
    return s;
  }
  function bestVoice(){
    if(voice) return voice;
    const list=speechSynthesis.getVoices();
    if(!list.length){                       // Chrome populates this asynchronously
      if(!voiceTried){ voiceTried=true; speechSynthesis.addEventListener("voiceschanged", bestVoice, {once:true}); }
      return null;
    }
    let best=null,bs=0;
    list.forEach(v=>{ const s=scoreVoice(v); if(s>bs){ bs=s; best=v; } });
    voice=best||list.find(v=>/^en/i.test(v.lang))||null;
    return voice;
  }
  function speak(text,force){
    if(!SAVE.set.voice || !("speechSynthesis" in window) || (!force && Date.now()-lastVoice<2400)) return;
    lastVoice=Date.now();
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.voice=bestVoice();
      u.rate=.84;u.pitch=.76;u.volume=Math.min(1,.78*(SAVE.set.sfx||.7));
      speechSynthesis.speak(u);
    }catch(e){}
  }
  function callout(text){
    const p=document.createElement("div");p.className="mission-callout";p.textContent=text;
    document.body.appendChild(p);setTimeout(()=>p.remove(),1500);
  }
  function setAct(i){
    clearBody(["act-","pressure-"]);
    document.body.classList.add("act-"+(i+1));
    lastPressure=-1;
  }
  function pressure(sec){
    const p=sec<=3?3:sec<=5?5:sec<=7?7:0;
    if(p===lastPressure)return;
    lastPressure=p;clearBody(["pressure-"]);
    if(p)document.body.classList.add("pressure-"+p);
    Snd.tension(p===3?4:p===5?3:p===7?2:Math.min(4,Math.floor((R.streak||0)/3)));
  }
  function momentum(announce){
    if(!$("momentum-fill"))return;
    const s=R.streak||0;
    const top=MOMENTUM_STEPS[MOMENTUM_STEPS.length-1];
    const pct=Math.min(100, s/top*100);
    let level=0;
    MOMENTUM_STEPS.forEach((n,i)=>{ if(s>=n) level=i+1; });
    const names=["Cold Start","Building","Unbroken","Scripture Locked","Overdrive"];
    $("momentum-fill").style.width=pct+"%";
    $("momentum-pct").textContent=pct+"%";
    $("momentum-name").textContent=names[level];
    clearBody(["momentum-"]);
    if(level)document.body.classList.add("momentum-"+level);
    document.body.classList.toggle("overdrive",level===4);
    Snd.tension(level);
    if(announce && level>lastMomentum){
      const lines=["","Momentum rising","Unbroken","Scripture locked","Overdrive"];
      callout(lines[level]);
      if(level===4)speak("Overdrive. Scripture locked.",true);
    }
    lastMomentum=level;
  }
  function beat(kind){
    if(SAVE.set.reduced) return;
    const systemReduced=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
    if(systemReduced) return;
    const cls="fx-"+kind;
    document.body.classList.remove("fx-lock","fx-correct","fx-wrong","fx-act");
    void document.body.offsetWidth;
    document.body.classList.add(cls);
    setTimeout(()=>document.body.classList.remove(cls), kind==="act"?980:640);
  }
  function impact(kind){
    const cls=kind==="correct"?"correct-impact":"wrong-impact";
    document.body.classList.remove(cls);void document.body.offsetWidth;document.body.classList.add(cls);
    setTimeout(()=>document.body.classList.remove(cls),720);
    beat(kind==="correct"?"correct":"wrong");
  }
  function syncFx(){
    const fx=$("cinematic-fx");if(!fx)return;
    const profile=SAVE.set.quality||"high";
    const count=profile==="high"?14:profile==="balanced"?6:0;
    const current=fx.querySelectorAll(".ember");
    if(current.length===count)return;
    current.forEach(e=>e.remove());
    for(let i=0;i<count;i++){
      const e=document.createElement("i");e.className="ember";
      e.style.left=(2+Math.random()*96)+"%";
      e.style.setProperty("--dur",(7+Math.random()*8)+"s");
      e.style.setProperty("--delay",(-Math.random()*12)+"s");
      e.style.setProperty("--drift",(-70+Math.random()*140)+"px");
      fx.appendChild(e);
    }
  }
  function ending(o){
    const acc=R.attempts?R.correct/R.attempts:0;
    const reachedFinal=R.mode==="trial"&&R.actIdx>=4;
    let key,title,copy,voice;
    if(o.reason==="abandon"){
      key="defeated";title="Abandoned";copy="The run ends by your hand. The score still stands in the record.";voice="The run is abandoned.";
    }else if((o.reason==="complete"&&acc===1)||(reachedFinal&&R.correct>=48&&acc>=.96)){
      key="perfect";title="Perfect Run";copy="Every phrase held. The completed record stands illuminated.";voice="Perfect recall. The record is complete.";
    }else if(acc>=.9&&R.correct>=15){
      key="mastered";title="Scripture Mastered";copy="The hall answers with light. Your strongest run has become part of the chronicle.";voice="Scripture mastered.";
    }else if(reachedFinal||acc>=.7||o.reason==="complete"){
      key="survived";title="The Dawn Breaks";copy="You crossed the final threshold. The mission continues with the words you kept.";voice="You survived the final test.";
    }else{
      key="defeated";title="The Record Closes";copy="The hall grows still, but the words remain. Study the missed passages and return.";voice="The record closes. Prepare for another run.";
    }
    const el=$("ending-stage");
    el.className="ending-stage "+key;                       // restart the staged reveal
    void el.offsetWidth; el.classList.add("play");
    $("ending-label").textContent=key==="perfect"?"Unique ending unlocked":"Mission outcome";
    $("ending-title").textContent=title;$("ending-copy").textContent=copy;
    setTimeout(()=>speak(voice,true),900);
  }
  return {speak,callout,setAct,pressure,momentum,beat,impact,syncFx,ending};
})();

/* ------------------------- CINEMATIC SET-PIECE ROUNDS ------------------------- */
const SetPieces=(function(){
  /* The five sequences, keyed so both campaigns can reference the same
     definition rather than each keeping its own copy. */
  const DEFS={
    rapid:{id:"rapid",title:"Rapid Recall",rule:"Five short verses. Six seconds each. Answers lock on selection.",count:5,duration:6000,auto:true,code:"Velocity sequence",voice:"Rapid recall. Five verses. Six seconds each."},
    lockdown:{id:"lockdown",title:"Book Lockdown",rule:"Three transmissions from one Bible book. Hold the source.",count:3,duration:8500,sameBook:true,code:"Source restricted",voice:"Book lockdown. Source restricted."},
    missing:{id:"missing",title:"The Missing Passage",rule:"One passage, three phrases torn out. Lifelines are offline until it is whole.",count:3,duration:24000,passage:true,noPowers:true,code:"Blackout protocol",voice:"The missing passage. Three phrases gone. Lifelines offline."},
    nochance:{id:"nochance",title:"No Second Chances",rule:"One difficult verse. Triple reward. No lifeline can change the result.",count:1,duration:7000,noPowers:true,reward:3,code:"Red-line decision",voice:"No second chances."},
    reconstruct:{id:"reconstruct",title:"Final Reconstruction",rule:"One passage shattered into fragments. Rebuild it, then lock the passage.",count:5,duration:30000,reconstruct:true,noPowers:true,reward:2,code:"Passage assembly",voice:"Final reconstruction. Rebuild the passage."}
  };

  /* The Trial fires them by act and question number, as it always has. */
  const TRIAL=[
    {use:"rapid",       act:0, after:3},
    {use:"lockdown",    act:1, after:3},
    {use:"missing",     act:2, after:4},
    {use:"nochance",    act:3, after:3},
    {use:"reconstruct", act:3, after:7}
  ];

  /* The Pilgrimage fires them by PLACE, after the site's verses are kept
     — the sequence is the climax of the site rather than an interruption
     in the middle of it, which is why the briefing's "six verses" stays
     true and the finale still lands as a surprise.

     Each one is chosen because the place asks for it: the walls of
     Jericho fall and you rebuild the passage out of the rubble; Sinai is
     where the Law was given, so the source is locked to Exodus; Golgotha
     is the hinge of the whole road and takes the one-shot; Babylon is
     the exile, so the lifelines go dark; Patmos closes the journey the
     way Revelation closes the book. `code` overrides the generic banner
     so the card names the moment, not the mechanic. */
  const SITES={
    sinai:    {use:"lockdown",    book:"Exodus", code:"The Law is given",
               voice:"Book lockdown. The source is Exodus."},
    jericho:  {use:"reconstruct", code:"The walls come down",
               voice:"The wall is fallen. Rebuild what stood."},
    babylon:  {use:"missing",     code:"By the rivers of Babylon",
               voice:"The exile. Three phrases gone. Lifelines offline."},
    golgotha: {use:"nochance",    code:"The hinge of the road",
               voice:"No second chances."},
    nineveh:  {use:"rapid",       code:"Forty days and Nineveh falls",
               voice:"Rapid recall. Five verses. Six seconds each."},
    patmos:   {use:"reconstruct", code:"The last word",
               voice:"Final reconstruction. Rebuild the ending."}
  };

  function cleanup(){
    if(!R.setpiece)return;
    document.body.classList.remove("setpiece-active");
    Director.callout("Sequence complete");
    R.setpiece=null;
  }

  /* Shared launch. `over` carries the per-site overrides. */
  function launch(base, over){
    const d=Object.assign({},base,over||{});
    R.setpieceDone.add(d.id);
    R.setpiece=Object.assign({},d,{
      remaining:d.count, book:d.book||null, finishing:false
    });
    R.running=false;
    $("setpiece-code").textContent=d.code;
    $("setpiece-title").textContent=d.title;
    $("setpiece-rule").textContent=d.rule;
    $("setpiece-count").textContent=d.count+"-part special sequence";
    $("setpiece-card").classList.add("on");
    Snd.act();Director.speak(d.voice,true);
    afterRun(2300, ()=>{
      if(!R.setpiece || R.setpiece.id!==d.id) return;
      $("setpiece-card").classList.remove("on");
      document.body.classList.add("setpiece-active");
      go("play");nextQuestion();
    });
    return true;
  }

  function maybeLaunch(){
    if(R.mode!=="trial"||R.setpiece)return false;
    const slot=TRIAL.find(x=>x.act===R.actIdx&&x.after===R.qInAct&&!R.setpieceDone.has(DEFS[x.use].id));
    if(!slot)return false;
    return launch(DEFS[slot.use]);
  }

  /* Called once, when a site's verses are all answered. Returns false at
     every site that has no sequence, which is most of them — a finale at
     every stop would stop being a finale. */
  function maybeLaunchSite(){
    if(R.mode!=="pilgrimage"||R.setpiece)return false;
    const slot=SITES[R.siteId];
    if(!slot)return false;
    const base=DEFS[slot.use];
    if(R.setpieceDone.has(base.id))return false;
    return launch(base, {
      book:slot.book||null,
      code:slot.code||base.code,
      voice:slot.voice||base.voice
    });
  }

  function hasSite(siteId){ return !!SITES[siteId]; }
  function siteTitle(siteId){ return SITES[siteId] ? DEFS[SITES[siteId].use].title : ""; }
  /* On the road, a sequence should still sound like the place it is
     happening in — a Rapid Recall at Nineveh drawing from Philippians
     would undo the whole point of binding levels to sites. So a
     pilgrimage set piece draws from the site's own books first and only
     falls back to the tier pool if they cannot supply it. */
  function drawBound(tier){
    if(R.mode!=="pilgrimage"||!R.siteId) return drawVerse(tier);
    const site=Pilgrimage.site(R.siteId);
    if(!site) return drawVerse(tier);
    const exclude={}; R.used.forEach(id=>exclude[id]=1);
    const pool=Pilgrimage.resolvePool(site,{need:1,exclude:exclude,tier:tier}).verses;
    if(!pool.length) return drawVerse(tier);
    const v=pool[0];
    R.used.add(v.id);
    return v;
  }

  function draw(tier){
    const s=R.setpiece;if(!s)return drawVerse(tier);
    let v;
    if(s.sameBook&&s.book){
      let pool=VERSES.filter(x=>x.b===s.book&&!R.used.has(x.id));
      if(!pool.length)pool=VERSES.filter(x=>x.b===s.book);
      v=pool.length?pool[Math.floor(Math.random()*pool.length)]:drawBound(tier);
      R.used.add(v.id);
    }else{
      v=drawBound(tier);
      if(s.sameBook)s.book=v.b;
    }
    s.remaining--;
    if(s.remaining<=0)s.finishing=true;
    return v;
  }
  function duration(base){return R.setpiece?R.setpiece.duration:base}
  function bonus(){return R.setpiece&&R.setpiece.reward?R.setpiece.reward:1}
  function noPowers(){return !!(R.setpiece&&R.setpiece.noPowers)}
  function autoLock(){return !!(R.setpiece&&R.setpiece.auto)}
  function label(){return R.setpiece?R.setpiece.title:""}
  return {cleanup,maybeLaunch,maybeLaunchSite,hasSite,siteTitle,
          draw,duration,bonus,noPowers,autoLock,label};
})();

/* ------------------------- AUDIO VISUALISER ------------------------- */
const Viz = (function(){
  const N = 56;
  let c=null, x=null, w=0, h=0, dpr=1, gradient=null,smooth=new Float32Array(N);
  function size(){
    c = $("viz"); if(!c || !c.getContext) return false;
    const profile=SAVE.set.quality||"high";
    dpr = Math.min(window.devicePixelRatio||1, profile==="high"?2:1.35);
    w = c.clientWidth || 900; h = c.clientHeight || 60;
    if(!w || !h) return false;
    c.width = Math.floor(w*dpr); c.height = Math.floor(h*dpr);
    x = c.getContext("2d");
    if(x){
      gradient=x.createLinearGradient(0,0,0,h);
      gradient.addColorStop(0,"rgba(255,236,190,.95)");
      gradient.addColorStop(.55,"rgba(226,182,102,.75)");
      gradient.addColorStop(1,"rgba(150,110,44,.10)");
    }
    return !!x;
  }
  function draw(t){
    if((SAVE.set.quality||"high")==="low")return;
    if(!c && !size()) return;
    if(!x) return;
    if(Math.abs((c.clientWidth||0)*dpr - c.width) > 2) size();
    x.setTransform(dpr,0,0,dpr,0,0);
    x.clearRect(0,0,w,h);
    const data = Snd.spectrum();
    const bw = w / N;
    for(let i=0;i<N;i++){
      // centre-weighted envelope so the bars arch like the reference
      const env = Math.pow(Math.sin(Math.PI*(i+0.5)/N), 0.55);
      const idle = 0.09 + 0.075*Math.abs(Math.sin(t*0.0017 + i*0.44))
                        + 0.045*Math.abs(Math.sin(t*0.0033 + i*0.93));
      const live = data ? Math.pow(data[Math.min(data.length-1, 2 + i)] / 255, 1.25) : 0;
      const target = Math.max(idle, live) * env;
      smooth[i] += (target - smooth[i]) * (target > smooth[i] ? 0.55 : 0.12);
      const bh = Math.max(1.5, smooth[i] * h * 0.95);
      const bx = i*bw, by = h - bh;
      x.fillStyle = gradient;
      x.fillRect(bx + bw*0.22, by, bw*0.56, bh);
      if(smooth[i] > 0.42){
        x.fillStyle = "rgba(255,226,160," + Math.min(.5,(smooth[i]-0.42)) + ")";
        x.fillRect(bx + bw*0.10, by - 1, bw*0.80, bh + 1);
      }
    }
  }
  return {draw, size};
})();

/* ------------------------- ROUTER ------------------------- */
let currentView = "boot";
function go(view){
  const leaving = currentView;
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("on"));
  const el = $("v-"+view); if(el) el.classList.add("on");
  currentView = view;
  // the play view supplies its own header/footer letterboxing
  document.body.classList.toggle("cine", view==="act"||view==="boot");
  // Leaving the map stops its clocks; a terminator redraw on a hidden
  // view is pure waste and keeps a timer alive for the whole session.
  if(leaving==="atlas" && view!=="atlas") Atlas.unmount();
  // The site's sky belongs to the site. Anywhere else gets the game's
  // own grading back.
  if(view!=="play") applySiteSky(null);
  if(view==="atlas"){ Backdrop.palette("menu"); Snd.ambience("menu"); openAtlas(); }
  if(view==="menu"){ Backdrop.palette("menu"); Snd.ambience("menu"); renderMenu(); }
  if(view==="results"){ Backdrop.palette("results"); Snd.ambience("results"); }
  if(view==="study") renderStudy();
  if(view==="seals") renderSeals();
  if(view==="records") renderRecords();
  if(view==="settings") renderSettings();
  updatePlayerCard();   // shows/hides the player card and top-right icons per view
  if(view==="play") ensureLoop(); else stopLoop();
}
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-go]");
  if(b){ Snd.unlock(); Snd.ui(); go(b.dataset.go); }
});
let lastHoverAt=0, lastHoverEl=null;
document.addEventListener("pointerover", e=>{
  if(currentView==="play"||currentView==="boot"||currentView==="act") return;
  const t=e.target.closest(".btn, .mode, .tab, .pwr:not(.spent)");
  if(!t || t===lastHoverEl || t.disabled) return;
  lastHoverEl=t;
  const now=Date.now();
  if(now-lastHoverAt<90) return;
  lastHoverAt=now;
  Snd.hover();
});
document.addEventListener("pointerout", e=>{
  const t=e.target.closest(".btn, .mode, .tab, .pwr");
  if(t && t===lastHoverEl) lastHoverEl=null;
});

/* ------------------------- PLAYER CARD ------------------------- */
function buildPlayerCard(){
  const d=document.createElement("div"); d.className="playercard"; d.id="playercard"; d.style.display="none";
  d.innerHTML='<div class="pc-sigil"><b id="pc-lvl">1</b></div><div class="pc-meta">'+
    '<div class="pc-rank" id="pc-rank">Hearer</div><div class="pc-xp"><i id="pc-xpfill"></i></div>'+
    '<div class="pc-sub" id="pc-sub">0 / 320 XP</div></div>';
  document.body.appendChild(d);
}
function updatePlayerCard(){
  const li = levelInfo(SAVE.xp);
  const card = $("playercard"); if(!card) return;
  // The atlas has its own chrome in that corner, so the card stands down.
  card.style.display = (currentView==="play"||currentView==="boot"||
                        currentView==="act"||currentView==="atlas") ? "none" : "flex";
  $("pc-lvl").textContent = li.level;
  $("pc-rank").textContent = rankFor(li.level);
  $("pc-xpfill").style.width = (li.into/li.need*100)+"%";
  $("pc-sub").textContent = fmt(li.into)+" / "+fmt(li.need)+" XP";
}

/* ------------------------- MENU ------------------------- */
function renderMenu(){
  const today = todayKey();
  const dailyDone = SAVE.daily.date === today;
  const due = dueToday();
  const road = pilgrimOverview();
  $("modes").innerHTML = Object.keys(MODES).filter(k=>!MODES[k].hidden).map(k=>{
    const m = MODES[k];
    let pill = "";
    if(k==="daily") pill = dailyDone
      ? '<span class="pill done">Done · '+fmt(SAVE.daily.score)+'</span>'
      : '<span class="pill">Today</span>';
    else if(k==="practice" && due) pill = '<span class="pill due">'+fmt(due)+' due</span>';
    else if(k==="pilgrimage") pill = road.complete
      ? '<span class="pill done">Road walked</span>'
      : '<span class="pill">'+road.cleared+' / '+road.total+'</span>';
    else if(SAVE.best[k]) pill = '<span class="pill">Best '+fmt(SAVE.best[k])+'</span>';
    return '<button class="mode" data-mode="'+k+'">'+pill+'<b>'+esc(m.name)+'</b><p>'+esc(m.desc)+'</p>'+
      '<span class="tagline">'+esc(m.tagline)+'</span></button>';
  }).join("");
  $("modes").querySelectorAll("[data-mode]").forEach(b=>{
    b.addEventListener("click",()=>{
      Snd.unlock(); Snd.ui();
      // The Pilgrimage picks its level on the map, not on a brief card.
      if(MODES[b.dataset.mode].atlas) go("atlas"); else openBrief(b.dataset.mode);
    });
  });
  const done = SAVE.seals.length, tot = SEALS.length;
  $("menu-hint").textContent = SAVE.runs
    ? fmt(SAVE.runs)+" runs · "+fmt(SAVE.life.correct)+" verses kept · "+done+"/"+tot+" seals"
      + (due ? " · "+fmt(due)+" due for review" : " · nothing due")
    : VERSES.length+" verses · all 66 books · King James Version";
}

/* ------------------------- BRIEF ------------------------- */
let briefMode = "trial";
function openBrief(mode){
  briefMode = mode;
  const m = MODES[mode];
  $("brief-kick").textContent = m.kick;
  $("brief-title").textContent = m.name;
  $("brief-desc").textContent = m.desc;
  $("brief-info").innerHTML = m.info.map(i=>'<div class="bi"><b>'+esc(i[0])+'</b><span>'+esc(i[1])+'</span></div>').join("");
  renderDiffs();
  go("brief");
}
function renderDiffs(){
  $("diffs").innerHTML = Object.keys(DIFFS).map(k=>{
    const d = DIFFS[k], sel = SAVE.set.diff===k ? " sel" : "";
    return '<button class="diff'+sel+'" data-diff="'+k+'"><b>'+esc(d.name)+'</b><span>'+esc(d.desc)+'</span>'+
      '<span class="stats">'+d.lives+' lives · clock ×'+d.time.toFixed(2)+' · score ×'+d.score.toFixed(2)+'</span></button>';
  }).join("");
  $("diffs").querySelectorAll("[data-diff]").forEach(b=>{
    b.addEventListener("click",()=>{ SAVE.set.diff=b.dataset.diff; persist(); Snd.ui(); renderDiffs(); });
  });
}
$("brief-start").addEventListener("click", ()=>{ Snd.unlock(); startRun(briefMode, SAVE.set.diff); });

/* ------------------------- THE PILGRIMAGE -------------------------
   The campaign rules live in pilgrimage.js and the map lives in
   atlas.js. What follows is only the wiring between them and the run
   machinery below: which site was picked, what happens when it is
   cleared, and where the player is sent afterwards. */

function pilgrimOverview(){ return Pilgrimage.overview(SAVE.pilgrim); }
function savePilgrim(p){ SAVE.pilgrim = p; persist(); }

let pendingSiteId = null;
let pendingArcKey = null;
let atlasWired = false;

function wireAtlas(){
  if(atlasWired) return;
  atlasWired = true;

  Atlas.on("begin",  id => openSiteBrief(id, "pilgrimage"));
  Atlas.on("recall", id => openSiteBrief(id, "pilgrim-recall"));
  Atlas.on("relay",  key => openRelayBrief(key));

  const rail = $("atlas-rail"), toggle = $("atlas-rail-toggle");
  if(toggle && rail) toggle.addEventListener("click", ()=>{ Snd.ui(); rail.classList.toggle("hidden"); });

  const zin = $("atlas-zin"), zout = $("atlas-zout"), zfit = $("atlas-zfit");
  if(zin)  zin.addEventListener("click",  ()=>{ Snd.ui(); if(Atlas.hasMap()) Atlas.focus(Atlas.activeSite()?Atlas.activeSite().id:null,{zoom:9}); });
  if(zout) zout.addEventListener("click", ()=>{ Snd.ui(); if(Atlas.hasMap()) Atlas.focus(Atlas.activeSite()?Atlas.activeSite().id:null,{zoom:6}); });
  if(zfit) zfit.addEventListener("click", ()=>{ Snd.ui(); Atlas.fitAll(); });

  // On a phone the rail covers the map, so it starts out of the way.
  if(rail && window.innerWidth < 720) rail.classList.add("hidden");
}

function openAtlas(){
  wireAtlas();
  Atlas.seenColdOpen(!!SAVE.set.coldOpenDone);
  Atlas.mount(SAVE.pilgrim);
  if(!SAVE.set.coldOpenDone){ SAVE.set.coldOpenDone = true; persist(); }
  // Live weather is a bonus, never a dependency: this promise cannot
  // reject (see live.js) and nothing waits on it.
  if(SAVE.set.liveWeather) Atlas.loadWeather();
}

/* ---- the real sky over the real place ----
   The atlas already knows the true solar altitude and the live weather
   at every site. Until now that only graded the map, which made the
   most distinctive thing about this campaign purely decorative. This
   carries it into the play view: answering at Nineveh after dark
   actually happens in the dark, and a dust storm over Ur puts dust on
   the screen.

   Strictly cosmetic. Real weather must never touch the clock or the
   difficulty — a player cannot plan around the wind in Iraq, and losing
   a run to it would be unfair in a way no amount of atmosphere pays
   for. */
function applySiteSky(siteId){
  const b = document.body;
  ["sky-night","sky-twilight","sky-golden","sky-day",
   "wx-dust","wx-rain","wx-storm","wx-haze","wx-snow"].forEach(c=>b.classList.remove(c));
  if(!siteId) return;
  const site = Pilgrimage.site(siteId);
  if(!site) return;

  const now = new Date();
  const sun = Geo.sunPosition(now, site.coords[0], site.coords[1]);
  b.classList.add("sky-" + Geo.lightPhase(sun.altitude));

  // readingFor never returns null — live if we have it, authored climate
  // if we do not — so there is no offline branch to write here.
  const r = Live.readingFor(site);
  const key = r && r.sky ? r.sky.key : "clear";
  if(key !== "clear" && key !== "cloud") b.classList.add("wx-" + key);
}

/* ---- the briefing card for one site ---- */
let sbSiteId = null, sbMode = "pilgrimage";

function siteClockMs(siteId, mode){
  // Typed recall needs a clock sized for typing, not for picking — the
  // same reasoning the standard Recall mode uses.
  if(mode === "pilgrim-recall") return 22000;
  return Pilgrimage.clockFor(Pilgrimage.indexOf(siteId));
}

function openSiteBrief(siteId, mode){
  const b = Pilgrimage.brief(siteId, SAVE.pilgrim);
  if(!b) return;
  if(!b.unlocked){ Atlas.note("That place is still sealed."); return; }

  sbSiteId = siteId; sbMode = mode || "pilgrimage"; pendingSiteId = siteId;
  const s = b.site, arc = b.arc, D = DIFFS[SAVE.set.diff] || DIFFS.disciple;
  const secs = (siteClockMs(siteId, sbMode) * D.time / 1000).toFixed(1);

  $("sb-arc").textContent = arc ? arc.n + " · " + arc.name : s.tag;
  $("sb-name").textContent = s.name;
  $("sb-quote").textContent = s.quote;
  $("sb-ref").textContent = s.quoteRef;

  $("sb-info").innerHTML = [
    [b.ordinal + " / " + b.total, "Site on the road"],
    [String(b.verses), sbMode === "pilgrim-recall" ? "Verses, typed" : "Verses"],
    [TIER_NAMES[b.tier] || "Foundation", "Difficulty"],
    [secs + "s", "Per verse"],
    [String(D.lives), "Lives"]
  ].map(i=>'<div class="bi"><b>'+esc(i[0])+'</b><span>'+esc(i[1])+'</span></div>').join("");

  // Conditions at the real place, right now.
  const r = Live.readingFor(s);
  const now = new Date();
  const sun = Geo.sunPosition(now, s.coords[0], s.coords[1]);
  $("sb-live").innerHTML = [
    [r.tempC + "°C", r.live ? "Temperature now" : "Typical temperature"],
    [r.sky ? r.sky.label : "—", "Sky"],
    [Geo.solarClock(now, s.coords[1]), "Local solar time"],
    [s.elevation + " m", "Elevation"]
  ].map(i=>'<div class="bl"><b>'+esc(i[0])+'</b><span>'+esc(i[1])+'</span></div>').join("");

  $("sb-start").textContent = sbMode === "pilgrim-recall" ? "Type it from memory" : (b.cleared ? "Walk it again" : "Begin");

  /* Named as a warning, not a spoiler: the player should know this stop
     ends differently and find out how when it arrives. */
  const finale = sbMode === "pilgrimage" && SetPieces.hasSite(siteId)
    ? " · this place does not end quietly" : "";
  $("sb-hint").textContent = (sbMode === "pilgrim-recall"
    ? "Type the missing phrase · Enter to lock · Esc pauses"
    : "A–D or 1–4 to select · Enter to lock · S Selah · I Illuminate · Esc pauses") + finale;

  go("sitebrief");
}

/* ---- the briefing for a whole arc walked in one run ----
   Deliberately blunt about the cost. The relay is the optional hard way
   through ground the campaign already lets you take one site at a time,
   so the card should read as a warning rather than an invitation. */
function openRelayBrief(arcKey){
  const arc = Pilgrimage.arc(arcKey);
  if(!arc) return;
  const st = Pilgrimage.arcStatus(SAVE.pilgrim, arcKey);
  if(!st.open){ Atlas.note("That stretch of road is not open yet."); return; }

  pendingArcKey = arcKey; sbSiteId = null; sbMode = "relay";
  const sites = Pilgrimage.sitesInArc(arcKey);
  const D = DIFFS[SAVE.set.diff] || DIFFS.disciple;
  const first = Pilgrimage.indexOf(sites[0].id);
  const last  = Pilgrimage.indexOf(sites[sites.length-1].id);
  const secs  = i => (Pilgrimage.clockFor(i) * D.time / 1000).toFixed(1);

  $("sb-arc").textContent = arc.n + " · " + arc.name;
  $("sb-name").textContent = "The Long Road";
  $("sb-quote").textContent = arc.sub;
  $("sb-ref").textContent = sites[0].name + "  →  " + sites[sites.length-1].name;

  $("sb-info").innerHTML = [
    [String(sites.length), "Sites, unbroken"],
    [String(sites.length * Pilgrimage.VERSES_PER_SITE), "Verses"],
    [String(D.lives), "Lives, shared"],
    [secs(first) + "s → " + secs(last) + "s", "Clock tightens"],
    [st.cleared + " / " + st.total, "Already cleared"]
  ].map(i=>'<div class="bi"><b>'+esc(i[0])+'</b><span>'+esc(i[1])+'</span></div>').join("");

  $("sb-live").innerHTML = "";
  $("sb-start").textContent = "Walk it";
  $("sb-hint").textContent = "Lives do not come back · every site you pass stays cleared, even if the road ends you";
  go("sitebrief");
}

$("sb-start").addEventListener("click", ()=>{ Snd.unlock(); startRun(sbMode, SAVE.set.diff); });
$("sb-back").addEventListener("click", ()=>{ Snd.ui(); go("atlas"); });

/* ---- the relay banks each site as it is passed ----
   Sites are recorded the moment the road leaves them, so ending at the
   fifth site of an arc still keeps the four behind it. The score is
   deliberately left at zero: the relay proves you can walk the stretch
   without rest, and the site's best score stays something you earn by
   walking it properly. Accuracy is real, so an arc can still be
   perfected this way. */
function bankRelaySite(siteId){
  const rl = R.relay;
  if(!rl || !siteId || rl.banked.indexOf(siteId) >= 0) return;
  const c = R.correct  - (rl.markCorrect  || 0);
  const a = R.attempts - (rl.markAttempts || 0);
  rl.banked.push(siteId);
  rl.markCorrect = R.correct; rl.markAttempts = R.attempts;

  const wasCleared = Pilgrimage.isCleared(SAVE.pilgrim, siteId);
  SAVE.pilgrim = Pilgrimage.record(SAVE.pilgrim, siteId, {
    cleared:true, score:0, accuracy: a ? Math.round(c/a*100) : 100, at:Date.now()
  });
  if(!wasCleared) SAVE.life.sitesCleared++;
  persist();
  const s = Pilgrimage.site(siteId);
  if(s) Director.callout(s.name + " — behind you");
}

/* ---- what a finished site does to the journey ---- */
function recordSiteResult(cleared, total, acc){
  if(!R.siteId) return null;
  const before = Pilgrimage.overview(SAVE.pilgrim);
  const wasCleared = Pilgrimage.isCleared(SAVE.pilgrim, R.siteId);

  const next = Pilgrimage.record(SAVE.pilgrim, R.siteId, {
    cleared: cleared, score: total, accuracy: Math.round(acc*100),
    livesLeft: R.lives, at: Date.now()
  });
  SAVE.pilgrim = next;

  const after = Pilgrimage.overview(next);
  if(cleared && !wasCleared){
    SAVE.life.sitesCleared++;
    const arcsBefore = before.arcs.filter(a=>a.complete).length;
    const arcsAfter  = after.arcs.filter(a=>a.complete).length;
    if(arcsAfter > arcsBefore) SAVE.life.arcsCleared++;
  }
  return {before, after, firstClear: cleared && !wasCleared};
}

/* ------------------------- RUN STATE ------------------------- */
const R = {};
function afterRun(delay, fn){
  const token = R.runToken;
  return setTimeout(()=>{ if(R.runToken===token) fn(); }, delay);
}
function invalidateRun(){
  R.runToken = (R.runToken||0) + 1;
  R.sceneToken = (R.sceneToken||0) + 1;
  stopTimer();
}
function drawVerse(tier, rnd){
  const r = rnd || Math.random;
  let pool = BY_TIER[tier].filter(v=>!R.used.has(v.id));
  if(!pool.length){ R.used.clear(); pool = BY_TIER[tier].slice(); }
  const v = pool[Math.floor(r()*pool.length)];
  R.used.add(v.id);
  return v;
}
function drawEndlessVerse(tier){
  let pool=BY_TIER[tier].filter(v=>!R.used.has(v.id));
  if(!pool.length){
    BY_TIER[tier].forEach(v=>R.used.delete(v.id));
    pool=BY_TIER[tier].slice();
  }
  const weighted=pool.map(v=>{
    const s=SAVE.verse[v.id],book=SAVE.books[v.b];
    let weight=!s||!s.a?1.8:s.c===0?4:s.c/s.a<.5?3.2:s.c/s.a<.7?2:.78;
    if(book&&book.a>=3&&book.c/book.a<.65)weight*=1.25;
    return {v,weight};
  });
  let roll=Math.random()*weighted.reduce((n,x)=>n+x.weight,0),chosen=weighted[weighted.length-1].v;
  for(const item of weighted){roll-=item.weight;if(roll<=0){chosen=item.v;break;}}
  const seen=SAVE.verse[chosen.id];
  R.adaptivePick=!seen||!seen.a?"New ground":seen.c/seen.a<.7?"Review target":"Mastery check";
  R.used.add(chosen.id);
  return chosen;
}
/* The Drill and Recall both pull from the SRS queue: due verses first
   (most overdue leading), then never-seen, then anything still scheduled.
   The queue is built once at the start of the run so the session is a
   coherent list rather than a fresh weighted roll each question. */
function buildReviewQueue(len){
  const pool = VERSES.filter(v => !R.used.has(v.id));
  return SRS.buildQueue(pool.length ? pool : VERSES.slice(), cardFor, today(), len,
    list => shuffle(list));
}
function drawReviewVerse(){
  if(!R.queue || !R.queue.length) R.queue = buildReviewQueue(40);
  let chosen = R.queue.shift();
  while(chosen && R.used.has(chosen.id) && R.queue.length) chosen = R.queue.shift();
  if(!chosen){ R.used.clear(); R.queue = buildReviewQueue(40); chosen = R.queue.shift(); }
  const card = cardFor(chosen), t = today();
  const over = SRS.overdueBy(card, t);
  R.adaptivePick = !card || (!card.reps && !card.lapses) ? "Never seen"
    : card.lapses && !card.reps ? "Lost last time"
    : over > 0 ? over + (over === 1 ? " day overdue" : " days overdue")
    : over === 0 ? "Due today" : "Ahead of schedule";
  R.used.add(chosen.id);
  return chosen;
}
function buildDailyList(){
  const rnd = mulberry32(seedFromString("ctv-"+todayKey()));
  const pattern = [1,1,2,2,2,3,3,3,3,3,4,4,4,4,5,5,5,5,5,5];
  const used = new Set(), out = [];
  pattern.forEach(t=>{
    let pool = BY_TIER[t].filter(v=>!used.has(v.id));
    if(!pool.length) pool = BY_TIER[t].slice();
    const v = pool[Math.floor(rnd()*pool.length)];
    used.add(v.id); out.push({v:v, rnd:rnd});
  });
  return {list:out, rnd:rnd};
}

function startRun(mode, diffKey){
  const D = DIFFS[diffKey] || DIFFS.disciple;
  const runToken = (R.runToken||0) + 1;
  pendingSeals = [];

  /* A pilgrimage level is a fixed list of verses drawn from the site's
     own scripture, decided here and then played straight through. The
     attempt count seeds the draw, so walking a site again gives you a
     different six rather than the same six. */
  const isPilgrim = mode==="pilgrimage" || mode==="pilgrim-recall";
  let siteId = null, siteDraw = null, siteIndex = -1;
  if(isPilgrim){
    siteId = pendingSiteId || R.siteId;
    siteIndex = Pilgrimage.indexOf(siteId);
    const rec = Pilgrimage.recordOf(SAVE.pilgrim, siteId);
    siteDraw = Pilgrimage.drawSite(siteId, {attempt: rec ? rec.attempts : 0});
  }

  /* The relay flattens a whole arc into one queue, each entry tagged
     with the site it came from so the clock, the tier and the HUD can
     follow the road as it goes. Sites are banked as they are passed —
     dying at the fifth site does not take the four behind it. */
  let relay = null;
  if(mode==="relay"){
    const arcKey = pendingArcKey || (R.relay && R.relay.arcKey);
    const list = Pilgrimage.sitesInArc(arcKey);
    const queue = [];
    list.forEach(s=>{
      const rec = Pilgrimage.recordOf(SAVE.pilgrim, s.id);
      Pilgrimage.drawSite(s.id, {attempt: rec ? rec.attempts : 0}).verses
        .forEach(v => queue.push({siteId:s.id, index:Pilgrimage.indexOf(s.id), v:v}));
    });
    relay = {arcKey:arcKey, sites:list.map(s=>s.id), queue:queue, idx:0, banked:[], current:null};
  }

  Object.assign(R, {
    runToken, sceneToken:0, ended:false,
    mode, diff:D, actIdx:0, qInAct:0, qTotal:0,
    score:0, disp:0, lives:D.lives, maxLives:D.lives,
    streak:0, best:0, correct:0, attempts:0, missed:[], used:new Set(),
    powers:{selah:1, illum:2, wind:1}, usedPower:false, powersSpent:0,
    fast:0, sdCount:0, tiersSeen:new Set(), booksRun:new Set(),
    running:false, tEnd:0, tTotal:0, qStart:0, q:null, paused:false, locked:false, selected:null,
    actNoLoss:true, gotUnshaken:false, dailyIdx:0, daily:null, endlessBase:12000,
    startedAt:Date.now(), lastTickSec:-1, lastHeart:0, pressureStage:-1,
    setpiece:null, setpieceDone:new Set(), oneLifeCalled:false, overdriveGift:false,
    passage:null, recon:null, usedPass:new Set(), adaptivePick:"",
    decisionMs:0, timedDecisions:0, fastestMs:Infinity,
    actStartAttempts:0, actStartCorrect:0,
    practiceLen: mode==="practice" ? 15 : mode==="recall" ? 12
               : isPilgrim ? siteDraw.verses.length : 0,
    typed: mode==="recall" || mode==="pilgrim-recall", hintLevel:0, queue:null,
    typedExact:0, typedClose:0, rescheduled:[],
    siteId: siteId, siteIndex: siteIndex, siteIdx: 0,
    siteVerses: siteDraw ? siteDraw.verses : null,
    siteRing: siteDraw ? siteDraw.ring : "",
    relay: relay
  });
  document.body.classList.remove("setpiece-active","overdrive","momentum-1","momentum-2","momentum-3","momentum-4");
  if(mode==="daily") R.daily = buildDailyList();
  renderLives();
  $("score").textContent = "0"; setMult();
  Director.momentum(false);
  renderPowers();
  updateActTrack();
  if(mode==="practice" || mode==="recall") R.queue = buildReviewQueue(R.practiceLen + 12);
  if(mode==="trial"){ beginAct(0); }
  else {
    // Each arc of the road carries its own bed, so the Patriarchs and
    // the Church do not sound like the same afternoon.
    let pal = mode==="endless" ? "act3" : mode==="practice" ? "act1" : mode==="recall" ? "act4" : "act2";
    if(isPilgrim){
      const site = Pilgrimage.site(siteId);
      const arc = site ? Pilgrimage.arc(site.arc) : null;
      pal = (arc && arc.pal) || "act2";
    }
    if(mode==="relay"){
      const arc = Pilgrimage.arc(relay.arcKey);
      pal = (arc && arc.pal) || "act3";
    }
    Backdrop.palette(pal);
    Snd.ambience(pal);
    $("hud-round").textContent = isPilgrim && Pilgrimage.site(siteId)
      ? Pilgrimage.site(siteId).name
      : mode==="relay" ? (Pilgrimage.arc(relay.arcKey) || {name:"The Long Road"}).name
      : MODES[mode].name;
    // The play view wears the sky the site is actually under.
    applySiteSky(isPilgrim ? siteId : mode==="relay" ? relay.sites[0] : null);
    go("play"); nextQuestion();
  }
}

function beginAct(i){
  const report=$("act-report");
  if(i>0){
    const tried=Math.max(0,R.attempts-R.actStartAttempts);
    const kept=Math.max(0,R.correct-R.actStartCorrect);
    const accuracy=tried?Math.round(kept/tried*100):100;
    let supply="No recharge needed";
    if(R.actNoLoss){
      if(R.powers.selah<1){R.powers.selah=1;supply="Selah restored";}
      else if(R.powers.illum<2){R.powers.illum++;supply="Illuminate restored";}
      Director.callout(supply==="No recharge needed"?"Act cleared — unshaken":supply);
    }
    report.innerHTML=
      '<div><b>'+kept+' / '+tried+'</b><span>Verses kept</span></div>'+
      '<div><b>'+accuracy+'%</b><span>Act accuracy</span></div>'+
      '<div><b>'+(R.actNoLoss?"Unshaken":"Survived")+'</b><span>'+esc(supply)+'</span></div>';
    report.classList.add("on");
  }else{
    report.innerHTML="";report.classList.remove("on");
  }
  R.actIdx = i; R.qInAct = 0; R.actNoLoss = true;
  R.actStartAttempts=R.attempts;R.actStartCorrect=R.correct;
  const A = ACTS[i];
  if(i===4){
    R.maxLives = 1;
    R.lives = 1;
    R.powers.wind = 0;
    R.oneLifeCalled = true;
  }
  Director.setAct(i);
  renderLives();
  renderPowers();
  Backdrop.palette(A.pal); Backdrop.hit("levelup");
  Snd.ambience(A.pal); Snd.act();
  $("act-num").textContent = A.n;
  $("act-name").textContent = A.name;
  $("act-sub").textContent = A.sub;
  const secs = (A.t * R.diff.time / 1000).toFixed(1);
  $("act-meta").textContent = A.q+" verses · "+secs+" seconds each"
    +(i===4 ? " · one life" : "");
  $("hud-round").textContent = A.name;
  updateActTrack();
  if(i===4 && !hasSeal("watch")) grantSeal("watch");
  const voiceLines=["The signal is live.","The pursuit begins.","Blackout protocol.","No turning back.","This is the final test."];
  Director.speak(voiceLines[i],true);
  Director.beat("act");
  const actEl=$("v-act");
  if(actEl) actEl.classList.remove("departing");
  go("act");
  afterRun(2750, ()=>{
    if(currentView!=="act") return;
    if(actEl) actEl.classList.add("departing");
  });
  afterRun(3300, ()=>{
    if(currentView!=="act") return;
    if(actEl) actEl.classList.remove("departing");
    document.body.classList.add("play-enter");
    go("play");
    nextQuestion();
    afterRun(820, ()=>document.body.classList.remove("play-enter"));
  });
}

function questionDuration(){
  if(R.mode==="trial"){ return ACTS[R.actIdx].t * R.diff.time; }
  if(R.mode==="daily"){ return 10000 * R.diff.time; }
  if(R.mode==="practice"){ return 12000 * R.diff.time; }
  // Typing a phrase takes far longer than picking one, so Recall gets a
  // clock sized for the work rather than the same one the pickers use.
  if(R.mode==="recall"){ return 22000 * R.diff.time; }
  // The road's clock is a function of how far east you are: 14s at Ur,
  // 6.5s at Patmos. pilgrimage.js owns the ramp.
  if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    return siteClockMs(R.siteId, R.mode) * R.diff.time;
  }
  // The relay inherits each site's own clock as it reaches it, so the
  // road tightens inside a single run exactly as it does across many.
  if(R.mode==="relay"){
    const cur = R.relay && R.relay.current;
    return Pilgrimage.clockFor(cur ? cur.index : 0) * R.diff.time;
  }
  return Math.max(4200, R.endlessBase - R.qTotal*180) * R.diff.time;
}
function currentTier(){
  if(R.mode==="trial") return ACTS[R.actIdx].tier;
  if(R.mode==="daily") return R.daily.list[R.dailyIdx] ? R.daily.list[R.dailyIdx].v.t : 5;
  if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    // A closing sequence draws fresh verses, so it wants the site's own
    // target tier rather than the tier of the verse just answered.
    if(R.setpiece) return Pilgrimage.tierFor(R.siteIndex);
    return R.q ? R.q.t : Pilgrimage.tierFor(R.siteIndex);
  }
  if(R.mode==="relay"){
    const cur = R.relay && R.relay.current;
    return R.q ? R.q.t : Pilgrimage.tierFor(cur ? cur.index : 0);
  }
  if(R.mode==="practice" || R.mode==="recall") return R.q ? R.q.t : 2;
  const n = R.qTotal;
  if(n<5) return 1; if(n<11) return 2; if(n<19) return 3; if(n<29) return 4;
  return (n%5===0) ? 4 : 5;
}

function nextQuestion(){
  clearSequence();
  if(R.setpiece && R.setpiece.finishing) SetPieces.cleanup();
  if(R.mode==="trial"){
    const A = ACTS[R.actIdx];
    if(A.q !== Infinity && R.qInAct >= A.q){
      if(R.actNoLoss && !hasSeal("unshaken")) grantSeal("unshaken");
      if(R.actIdx < ACTS.length-1){ beginAct(R.actIdx+1); return; }
      endRun("complete"); return;
    }
    if(SetPieces.maybeLaunch()) return;
  }
  if(R.mode==="daily" && R.dailyIdx >= R.daily.list.length){ endRun("complete"); return; }
  if((R.mode==="practice" || R.mode==="recall") && R.qTotal >= R.practiceLen){ endRun("complete"); return; }
  /* The site's own verses are exhausted. A handful of places close with
     a set piece rather than simply ending — the sequence is the climax
     of the site, which is why it fires here and not partway through. */
  if((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece &&
     R.siteIdx >= (R.siteVerses ? R.siteVerses.length : 0)){
    if(SetPieces.maybeLaunchSite()) return;
    endRun("complete"); return;
  }
  if(R.mode==="relay" && R.relay.idx >= R.relay.queue.length){ endRun("complete"); return; }
  if(R.setpiece && R.setpiece.passage){ startPassage(); updateChips(); return; }
  if(R.setpiece && R.setpiece.reconstruct){ startReconstruct(); updateChips(); return; }

  let v;
  if(R.mode==="daily"){ v = R.daily.list[R.dailyIdx].v; R.dailyIdx++; }
  // During a site's closing sequence the fixed list is finished, so the
  // verses come from SetPieces.draw below instead.
  else if((R.mode==="pilgrimage" || R.mode==="pilgrim-recall") && !R.setpiece){ v = R.siteVerses[R.siteIdx]; R.siteIdx++; }
  else if(R.mode==="relay"){
    const rl = R.relay, entry = rl.queue[rl.idx];
    // Leaving a site banks it before the next one starts.
    if(rl.current && rl.current.siteId !== entry.siteId) bankRelaySite(rl.current.siteId);
    rl.current = entry; rl.idx++;
    const site = Pilgrimage.site(entry.siteId);
    if(site){
      const arc = Pilgrimage.arc(site.arc);
      if(arc) Backdrop.palette(arc.pal);
      applySiteSky(entry.siteId);
    }
    v = entry.v;
  }
  else if(R.mode==="practice" || R.mode==="recall"){ v = drawReviewVerse(); }
  else v = R.mode==="endless"&&!R.setpiece ? drawEndlessVerse(currentTier()) : SetPieces.draw(currentTier());

  R.q = v; if(!R.setpiece) R.qInAct++; R.qTotal++;
  R.tiersSeen.add(v.t);
  if(R.mode==="trial" && R.actIdx===4) R.sdCount++;
  renderQuestion(v, SetPieces.duration(questionDuration()));
  updateChips();
}

function updateChips(){
  const tier = R.q ? R.q.t : currentTier();
  const diffEl = $("hud-diff");
  diffEl.textContent = TIER_NAMES[tier] || "Foundation";
  diffEl.classList.toggle("danger", tier>=5);

  if(R.mode==="trial"){
    const A=ACTS[R.actIdx];
    $("hud-round").textContent = R.setpiece
      ? SetPieces.label()+(R.setpiece.sameBook&&R.setpiece.book?" · "+R.setpiece.book:"") : A.name;
    $("hud-qlab").textContent = A.q===Infinity ? "Verse" : "Verse";
    $("hud-q").textContent = R.setpiece
      ? (R.setpiece.count-R.setpiece.remaining)+" / "+R.setpiece.count
      : A.q===Infinity ? String(R.qInAct) : R.qInAct+" / "+A.q;
  } else if(R.mode==="daily"){
    $("hud-round").textContent = "Daily Trial";
    $("hud-qlab").textContent = "Verse";
    $("hud-q").textContent = R.dailyIdx+" / "+R.daily.list.length;
  } else if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    const site = Pilgrimage.site(R.siteId);
    const n = R.siteVerses ? R.siteVerses.length : 0;
    $("hud-round").textContent = R.setpiece ? SetPieces.label()
      : site ? site.name : "The Pilgrimage";
    $("hud-qlab").textContent = R.setpiece ? "Sequence"
      : R.mode==="pilgrim-recall" ? "Typed" : "Verse";
    $("hud-q").textContent = R.setpiece
      ? (R.setpiece.count-R.setpiece.remaining)+" / "+R.setpiece.count
      : R.siteIdx+" / "+n;
  } else if(R.mode==="relay"){
    const cur = R.relay.current, site = cur ? Pilgrimage.site(cur.siteId) : null;
    $("hud-round").textContent = site ? site.name : "The Long Road";
    $("hud-qlab").textContent = "Site "+(R.relay.banked.length+1)+" of "+R.relay.sites.length;
    $("hud-q").textContent = R.relay.idx+" / "+R.relay.queue.length;
  } else if(R.mode==="practice" || R.mode==="recall"){
    $("hud-round").textContent = (R.mode==="recall" ? "Recall · " : "Drill · ")+(R.adaptivePick||"Spaced review");
    $("hud-qlab").textContent = R.mode==="recall" ? "Typed" : "Drill";
    $("hud-q").textContent = R.qTotal+" / "+R.practiceLen;
  } else {
    $("hud-round").textContent = "Endless · "+(R.adaptivePick||"Adaptive Recall");
    $("hud-qlab").textContent = "Adaptive Verse";
    $("hud-q").textContent = String(R.qTotal);
  }
  $("hud-streak").textContent = R.streak + (R.streak===1 ? " Verse" : " Verses");
  $("hud-accuracy").textContent = R.attempts ? Math.round(R.correct/R.attempts*100)+"%" : "—";
  updateActTrack();
}

function updateActTrack(){
  const el=$("act-track");if(!el||!R.mode)return;
  if(R.mode==="trial"){
    el.innerHTML=ACTS.map((a,i)=>{
      const done=i<R.actIdx,current=i===R.actIdx;
      const pct=done?100:current&&a.q!==Infinity?Math.min(100,R.qInAct/a.q*100):0;
      return '<div class="act-step'+(done?" done":"")+(current?" current":"")+'"><i style="width:'+pct+'%"></i><span>'+a.n+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Act "+(R.actIdx+1)+" of 5");
  }else if(R.mode==="daily"){
    el.innerHTML=[4,8,12,16,20].map((mark,i)=>{
      const prev=i*4,pct=Math.max(0,Math.min(100,(R.dailyIdx-prev)/4*100));
      return '<div class="act-step'+(pct>=100?" done":pct>0?" current":"")+'"><i style="width:'+pct+'%"></i><span>'+(i+1)+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Daily progress "+R.dailyIdx+" of 20");
  }else if(R.mode==="pilgrimage" || R.mode==="pilgrim-recall"){
    // One step per verse: a six-verse site reads cleanly as six marks,
    // and the player can see exactly how much of the site is left.
    const n=R.siteVerses?R.siteVerses.length:0;
    el.innerHTML=Array.from({length:n},(_,i)=>{
      const done=i<R.siteIdx-1, current=i===R.siteIdx-1;
      return '<div class="act-step'+(done?" done":"")+(current?" current":"")+'"><i style="width:'+(done?100:current?60:0)+'%"></i><span>'+(i+1)+'</span></div>';
    }).join("");
    const site=Pilgrimage.site(R.siteId);
    el.setAttribute("aria-label",(site?site.name+" — ":"")+"verse "+R.siteIdx+" of "+n);
  }else if(R.mode==="relay"){
    // One step per site in the arc — the track IS the road.
    const rl=R.relay, cur=rl.current?rl.current.siteId:null;
    el.innerHTML=rl.sites.map((id,i)=>{
      const done=rl.banked.indexOf(id)>=0, current=id===cur&&!done;
      const s=Pilgrimage.site(id);
      return '<div class="act-step'+(done?" done":"")+(current?" current":"")+'"><i style="width:'+(done?100:current?55:0)+'%"></i><span>'+
        esc(s?s.name.split(/[ (]/)[0].slice(0,3):String(i+1))+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Site "+(rl.banked.length+1)+" of "+rl.sites.length);
  }else if(R.mode==="practice" || R.mode==="recall"){
    const step=Math.max(1,Math.round(R.practiceLen/5));
    const marks=[1,2,3,4,5].map(n=>Math.min(R.practiceLen, n*step));
    el.innerHTML=marks.map((mark,i)=>{
      const prev=i?marks[i-1]:0,pct=Math.max(0,Math.min(100,(R.qTotal-prev)/Math.max(1,mark-prev)*100));
      return '<div class="act-step'+(pct>=100?" done":pct>0?" current":"")+'"><i style="width:'+pct+'%"></i><span>'+mark+'</span></div>';
    }).join("");
    el.setAttribute("aria-label",(R.mode==="recall"?"Recall ":"Drill ")+R.qTotal+" of "+R.practiceLen);
  }else{
    const marks=[5,10,20,30,40];
    el.innerHTML=marks.map((mark,i)=>{
      const prev=i?marks[i-1]:0,pct=Math.max(0,Math.min(100,(R.qTotal-prev)/(mark-prev)*100));
      return '<div class="act-step'+(pct>=100?" done":pct>0?" current":"")+'"><i style="width:'+pct+'%"></i><span>'+mark+'</span></div>';
    }).join("");
    el.setAttribute("aria-label","Endless distance "+R.qTotal);
  }
}

/* ------------------------- BROADCAST HUD HELPERS ------------------------- */
const TIER_NAMES = {1:"Foundation", 2:"Testimony", 3:"Refining", 4:"Wilderness", 5:"Tribulation"};
const LETTERS = ["A","B","C","D"];

/* Words worth setting in gold. Divine names win first, then weighty nouns.
   Capped at three per verse so the emphasis still means something. */
const DIVINE = new Set(["lord","lords","god","gods","jesus","christ","spirit","ghost","almighty",
  "father","son","saviour","redeemer","messiah","emmanuel","jehovah","most","high"]);
const KEYWORDS = new Set(["shepherd","faith","love","charity","hope","grace","mercy","mercies","truth",
  "light","life","death","glory","salvation","righteousness","holy","heart","soul","peace","joy",
  "strength","power","word","blood","cross","sin","sins","heaven","heavens","earth","kingdom",
  "covenant","promise","wisdom","knowledge","courage","fear","refuge","rock","fortress","tower",
  "lamp","path","gift","prayer","name","throne","temple","sword","armour","crown","eagles","fire",
  "waters","shadow","valley","wilderness","harvest","vine","branches","gospel","witness","judgment",
  "repentance","forgive","forgiveness","everlasting","eternal","begotten","resurrection","redemption"]);
function highlightVerse(text){
  let budget = 3;
  return text.replace(/[A-Za-z']+/g, w => {
    if(!budget) return esc(w);
    const k = w.toLowerCase().replace(/'/g,"");
    if(DIVINE.has(k) || (w === w.toUpperCase() && w.length > 2) || KEYWORDS.has(k)){
      budget--; return '<span class="kw">'+esc(w)+'</span>';
    }
    return esc(w);
  });
}
/* Scale verse type by full-text length so long lines stay on screen. */
function fitVerseSize(len){
  const el=$("verse"); if(!el) return;
  el.classList.remove("vlen-md","vlen-lg","vlen-xl");
  if(len>=230) el.classList.add("vlen-xl");
  else if(len>=160) el.classList.add("vlen-lg");
  else if(len>=100) el.classList.add("vlen-md");
}
function answerButtons(){
  return [].slice.call($("opts").children).filter(b => b.classList && b.classList.contains("ans"));
}
const HEART_SVG = '<svg viewBox="0 0 24 24"><path d="M12 21.6l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.7L12 21.6z" fill="url(#hg)"/></svg>';
const HEART_BROKEN = '<svg viewBox="0 0 24 24"><path d="M12 21.6l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.7L12 21.6z" fill="url(#hg)"/><path d="M12.6 4.6l-2.5 4.9 3 1.9-2.4 4.6" fill="none" stroke="#07070a" stroke-width="1.7" stroke-linejoin="round"/></svg>';

function renderQuestion(q, dur){
  const scene = ++R.sceneToken;
  Director.pressure(0);
  $("ref").textContent = q.r + " — KJV";
  // blank is a fixed width so the length of the answer is never a clue
  $("verse").innerHTML = highlightVerse(q.p) +
    ' <span class="blank" id="blank">&#8195;&#8195;&#8195;</span>' + sep(q.s) + highlightVerse(q.s);
  fitVerseSize((q.p||"").length+(q.a||"").length+(q.s||"").length);
  R.locked = false; R.selected = null;
  if(R.typed) return renderTypedQuestion(q, dur, scene);
  const confirmBtn = $("confirm-answer");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.textContent = SetPieces.autoLock() ? "Rapid Lock" : "Lock Answer";
  const opts = $("opts"); opts.className = "answers queued"; opts.innerHTML = "";
  const rnd = R.mode==="daily" ? R.daily.rnd : Math.random;
  const choices = shuffle([q.a].concat(q.d), rnd);
  choices.forEach((c,i)=>{
    if(i){ const ch=document.createElement("div"); ch.className="chev"; ch.innerHTML="&#8250;"; opts.appendChild(ch); }
    const b=document.createElement("button");
    b.className="ans"; b.dataset.val=c;
    b.setAttribute("aria-pressed","false");
    b.innerHTML='<span class="ltr">'+LETTERS[i]+'.</span>'+esc(c);
    b.addEventListener("click", ()=>pickAnswer(c,b));
    opts.appendChild(b);
  });
  renderPowers();
  armTimer(dur);
  const entranceDelay=R.setpiece?180:Math.min(1450,Math.max(520,dur*.12));
  afterRun(entranceDelay, ()=>{
    if(R.q!==q || R.sceneToken!==scene || currentView!=="play")return;
    opts.classList.remove("queued");opts.classList.add("entering");
    startTimer(dur);
    afterRun(760, ()=>{ if(R.q===q && R.sceneToken===scene) opts.classList.remove("entering"); });
    Snd.lock();
  });
}

/* ------------------------- TYPED (RECALL MODE) ------------------------- */
/* Same stage, same clock, same Lock button — the only difference is that
   the four options are replaced by an empty line you have to fill. */
function renderTypedQuestion(q, dur, scene){
  R.hintLevel = 0;
  const opts = $("opts");
  opts.className = "answers typed queued";
  opts.innerHTML =
    '<div class="typewrap">' +
      '<input id="typed-answer" class="typed-input" type="text" autocomplete="off" ' +
        'autocorrect="off" autocapitalize="off" spellcheck="false" ' +
        'aria-label="Type the missing words" placeholder="type the missing words">' +
      '<div class="typed-hint" id="typed-hint" aria-live="polite"></div>' +
    '</div>';
  const input = $("typed-answer");
  input.addEventListener("input", ()=>{
    const btn = $("confirm-answer");
    btn.disabled = !input.value.trim();
    btn.textContent = input.value.trim() ? "Lock Answer" : "Type your answer";
  });
  input.addEventListener("keydown", e=>{
    if(e.key === "Enter"){ e.preventDefault(); confirmTyped(); }
  });
  const confirmBtn = $("confirm-answer");
  confirmBtn.style.display = "";
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Type your answer";
  renderPowers();
  armTimer(dur);
  const entranceDelay = Math.min(1450, Math.max(520, dur*.08));
  afterRun(entranceDelay, ()=>{
    if(R.q!==q || R.sceneToken!==scene || currentView!=="play") return;
    opts.classList.remove("queued"); opts.classList.add("entering");
    startTimer(dur);
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
/* Illuminate burns two wrong options — there are none here, so in Recall
   it buys progressively more of the answer's shape instead. */
function typedHint(){
  const el = $("typed-hint");
  if(!el || !R.q) return false;
  R.hintLevel = Math.min(3, R.hintLevel + 1);
  el.textContent = Recall.hint(R.q.a, R.hintLevel);
  el.classList.add("on");
  return true;
}

/* Select first, then confirm. Rapid Recall deliberately auto-locks. */
function pickAnswer(val, btn){
  if(!R.running || R.paused || R.locked) return;
  answerButtons().forEach(b=>{b.classList.remove("sel");b.setAttribute("aria-pressed","false");});
  btn.classList.add("sel");
  btn.setAttribute("aria-pressed","true");
  R.selected = {val, btn};
  const confirm=$("confirm-answer");
  confirm.disabled = false;
  confirm.textContent = "Lock "+LETTERS[Math.max(0,answerButtons().indexOf(btn))];
  Snd.ui();
  if(SetPieces.autoLock()) answer(val, btn);
}
function confirmAnswer(){
  if(R.typed) return confirmTyped();
  if(!R.selected || !R.running || R.paused || R.locked) return;
  answer(R.selected.val, R.selected.btn);
}
$("confirm-answer").addEventListener("click", confirmAnswer);

/* ------------------------- TIMER ------------------------- */
function armTimer(dur){
  R.tTotal = dur; R.tEnd = 0; R.qStart = 0;
  R.running = false; R.paused = false; R.lastTickSec = -1; R.lastHeart = 0;
  const sec = Math.ceil(dur/1000);
  $("clock").textContent = "00:" + String(sec).padStart(2,"0");
  $("warn-1").textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
  $("ring").classList.remove("crit");
  $("ring-arc").style.strokeDashoffset = "0";
}
function startTimer(dur){
  R.tTotal = dur; R.tEnd = performance.now()+dur; R.qStart = performance.now();
  R.running = true; R.paused = false; R.lastTickSec = -1; R.lastHeart = 0;
  if(document.hidden){pauseStamp=performance.now();setPaused(true);}
  else ensureLoop();
}
const RING_C = 2 * Math.PI * 52;   // circumference of the countdown arc
function tickTimer(now){
  if(!R.running || R.paused) return;
  let left = R.tEnd - now; if(left<0) left=0;
  const frac = R.tTotal ? Math.max(0, Math.min(1, left/R.tTotal)) : 0;
  const sec = Math.ceil(left/1000);

  const arc = $("ring-arc");
  if(arc.style) arc.style.strokeDashoffset = String(RING_C * (1-frac));
  if(sec!==R.lastTickSec){
    R.lastTickSec = sec;
    $("clock").textContent = "00:" + String(sec).padStart(2,"0");
    $("ring").classList.toggle("crit", sec<=5);
    const w1 = $("warn-1");
    w1.textContent = sec + (sec===1 ? " second remaining" : " seconds remaining");
    w1.classList.toggle("hot", sec<=5);
    Director.pressure(sec);
    if(left>0){
      if(frac<=.55){ Snd.tick(sec<=5); if(sec<=5) Backdrop.hit("tick"); }
      if(sec<=7) Snd.pulse(sec<=3?4:sec<=5?3:2);
    }
  }
  if(sec<=5 && now-R.lastHeart>560){ R.lastHeart=now; Snd.heart(); doFlash("heart"); }
  if(left<=0) timeUp();
}
function stopTimer(){ R.running=false; }

/* ------------------------- POWERS ------------------------- */
function renderPowers(){
  const p=R.powers; if(!p) return;
  if(SetPieces.noPowers()){
    $("powers").innerHTML='<button class="pwr spent">Lifelines Offline <em>Special sequence</em></button>';
    return;
  }
  $("powers").innerHTML =
    '<button class="pwr'+(p.selah?"":" spent")+'" data-pw="selah">Selah <em>+5s ×'+p.selah+'</em></button>'+
    '<button class="pwr'+(p.illum?"":" spent")+'" data-pw="illum">Illuminate <em>−2 ×'+p.illum+'</em></button>'+
    '<button class="pwr passive'+(p.wind?"":" spent")+'" tabindex="-1">Second Wind <em>Automatic ×'+p.wind+'</em></button>';
  $("powers").querySelectorAll("[data-pw]").forEach(b=>{
    b.addEventListener("click", ()=>usePower(b.dataset.pw));
  });
}
function usePower(kind){
  if(!R.running || R.paused) return;
  if(SetPieces.noPowers()){ toast("Lifelines are offline for this sequence"); return; }
  if(kind==="selah" && R.powers.selah){
    R.powers.selah--; R.usedPower=true; R.powersSpent++; R.tEnd += 5000; R.tTotal += 5000;
    Snd.power(); doFlash("gold"); toast("Selah — five seconds granted");
  } else if(kind==="illum" && R.powers.illum){
    if(!R.q){ toast("Illuminate needs a verse on the stage"); return; }
    if(R.typed){
      if(R.hintLevel >= 3){ toast("Nothing further to illuminate"); return; }
      R.powers.illum--; R.usedPower=true; R.powersSpent++;
      typedHint();
      Snd.power(); doFlash("violet");
      toast(R.hintLevel===1 ? "Illuminate — the shape of the words"
          : R.hintLevel===2 ? "Illuminate — first letters" : "Illuminate — the first word");
      renderPowers();
      return;
    }
    const wrong = answerButtons().filter(b=>b.dataset.val!==R.q.a && !b.classList.contains("burn"));
    if(wrong.length<2) return;
    R.powers.illum--; R.usedPower=true; R.powersSpent++;
    const burned = shuffle(wrong).slice(0,2);
    burned.forEach(b=>b.classList.add("burn"));
    if(R.selected && burned.indexOf(R.selected.btn)>=0){
      R.selected = null;
      $("confirm-answer").disabled = true;
      $("confirm-answer").textContent = "Lock Answer";
    }
    Snd.power(); doFlash("violet"); toast("Illuminate — two falsehoods burned");
  } else return;
  renderPowers();
}

/* ------------------------- ANSWERING ------------------------- */
function multiplier(){
  const s=R.streak;
  let m = 1;
  MOMENTUM_STEPS.forEach((n,i)=>{ if(s>=n) m=i+2; });
  if(R.mode==="trial" && R.actIdx===4) m += 2;
  return m;
}
/* Overdrive is the top of the meter. It used to be pure spectacle — the
   loudest state in the game did nothing a quieter one did not. Now it
   pays: the clock bonus doubles while it holds, and reaching it once in
   a run hands back a spent lifeline. */
function inOverdrive(){ return (R.streak||0) >= MOMENTUM_STEPS[MOMENTUM_STEPS.length-1]; }
function overdriveReward(){
  if(R.streak !== MOMENTUM_STEPS[MOMENTUM_STEPS.length-1] || R.overdriveGift) return;
  R.overdriveGift = true;
  if(R.powers.selah < 1){ R.powers.selah = 1; Director.callout("Overdrive — Selah restored"); }
  else if(R.powers.illum < 2){ R.powers.illum++; Director.callout("Overdrive — Illuminate restored"); }
  else { Director.callout("Overdrive — the clock pays double"); }
  renderPowers();
}
function setMult(pop){
  const m=multiplier(), el=$("mult");
  el.textContent="×"+m;
  el.classList.toggle("hot", m>1);
  if(pop && m>1){ el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
  const s=$("hud-streak"); if(s) s.textContent = R.streak + (R.streak===1?" Verse":" Verses");
}
function answer(choice, btn){
  if(!R.running || R.paused) return;
  stopTimer();
  R.locked = true;
  $("confirm-answer").disabled = true;
  $("confirm-answer").textContent = "Answer Locked";
  const q=R.q;
  const elapsed = performance.now()-R.qStart;
  const left = Math.max(0, R.tEnd - performance.now());
  const opts=$("opts"); opts.classList.add("locked");
  Snd.lock();Snd.hush();
  Director.beat("lock");
  document.body.classList.remove("reveal-freeze");void document.body.offsetWidth;document.body.classList.add("reveal-freeze");
  afterRun(430, ()=>resolveAnswer(q,choice,btn,elapsed,left));
}
function recordDecision(ms){
  if(!Number.isFinite(ms)||ms<0)return;
  const safe=Math.min(ms,(R.tTotal||ms)+500);
  R.decisionMs+=safe;R.timedDecisions++;
  R.fastestMs=Math.min(R.fastestMs,safe);
}
function resolveAnswer(q,choice,btn,elapsed,left){
  if(R.q!==q)return;
  R.attempts++;
  recordDecision(elapsed);

  let ok, graded = null;
  if(R.typed){
    // The verse's own distractors are handed to the grader so a typed
    // near-miss is measured against the readings it could be confused
    // with, not just against character distance.
    graded = Recall.grade(choice, q.a, q.d);
    ok = Recall.isCorrect(graded.verdict);
    if(graded.verdict === "exact") R.typedExact++;
    if(graded.verdict === "close") R.typedClose++;
    SAVE.life.typedAttempts++;
    if(graded.verdict === "exact") SAVE.life.typedExact++;
    renderTypedVerdict(graded);
  } else {
    ok = choice===q.a;
    answerButtons().forEach(b=>{
      b.classList.remove("sel");
      if(b.dataset.val===q.a) b.classList.add("right");
      else if(b===btn) b.classList.add("bad");
      else b.classList.add("mute");
    });
  }
  recordVerse(q, ok);
  scheduleReview(q, {
    correct: ok,
    near: graded ? (graded.verdict === "close" || graded.verdict === "modernised") : false,
    fraction: R.tTotal ? Math.min(1, elapsed / R.tTotal) : 0.5,
    usedPower: R.hintLevel > 0
  });
  if(ok){
    const blank=$("blank"); blank.textContent=q.a; blank.classList.add("filled","reveal");
    R.correct++; R.streak++; R.best=Math.max(R.best,R.streak);
    R.booksRun.add(q.b);
    if(elapsed < 1500) R.fast++;
    overdriveReward();
    const timeBonus = Math.round(left / R.tTotal * 140 * (inOverdrive() ? 2 : 1));
    const tierW = 1 + q.t*0.12;
    const gained = Math.round((150 + timeBonus) * multiplier() * R.diff.score * tierW * SetPieces.bonus());
    R.score += gained;
    Snd.correct(); Backdrop.hit("correct"); doFlash("gold");
    Director.impact("correct");popScore("+"+fmt(gained)); animateScore(); setMult(true);Director.momentum(true);
    if(R.streak===5)Director.callout("Unbroken ×5");
    if(R.streak===10)Director.callout("Perfect Recall");
    if(R.streak>=10 && !hasSeal("recall")) grantSeal("recall");
    if(R.streak>=20 && !hasSeal("flame")) grantSeal("flame");
    if(R.fast>=10 && !hasSeal("swift")) grantSeal("swift");
    afterRun(SetPieces.autoLock()?720:1450, nextQuestion);
  } else {
    const blank=$("blank"); blank.textContent=choice; blank.classList.add("bad","reveal");
    R.streak=0; setMult(); R.missed.push(q);
    Director.momentum(false);Director.impact("wrong");
    Snd.wrong(); Backdrop.hit("wrong"); doFlash("red"); shakeUI(true);
    afterRun(520, ()=>{ if(R.q===q){ blank.textContent=q.a; blank.classList.remove("bad"); blank.classList.add("filled","reveal"); } });
    loseLife();
  }
}
function timeUp(){
  if(R.passage) return resolvePassage();
  if(R.recon) return resolveRecon();
  stopTimer(); R.locked=true; R.selected=null; R.attempts++; recordDecision(R.tTotal); R.streak=0; setMult();
  $("confirm-answer").disabled = true;
  $("confirm-answer").textContent = "Time Expired";
  Director.momentum(false);Director.pressure(0);
  const q=R.q, opts=$("opts"); opts.classList.add("locked");
  if(R.typed){
    const input=$("typed-answer"); if(input) input.disabled = true;
    renderTypedVerdict({verdict:"wrong", hint:""});
  } else {
    answerButtons().forEach(b=>{
      b.classList.remove("sel");
      if(b.dataset.val===q.a) b.classList.add("right"); else b.classList.add("mute");
    });
  }
  const blank=$("blank"); blank.textContent="— time —"; blank.classList.add("bad");
  recordVerse(q,false);
  scheduleReview(q, {correct:false, timedOut:true});
  R.missed.push(q);
  Director.impact("wrong");Snd.wrong(); Backdrop.hit("wrong"); doFlash("red"); shakeUI(true);
  afterRun(520, ()=>{ if(R.q===q){ blank.textContent=q.a; blank.classList.remove("bad"); blank.classList.add("filled","reveal"); } });
  loseLife();
}
function loseLife(){
  R.actNoLoss = false;
  R.lives = Math.max(0, R.lives-1);
  renderLives(true);
  if(R.lives===1 && !R.oneLifeCalled){ R.oneLifeCalled=true; Director.speak("One life remains.",true); }
  if(R.lives<=0){
    const finalAct = R.mode==="trial" && R.actIdx===4;
    const canUseWind = !finalAct && !SetPieces.noPowers() && R.powers.wind>0;
    if(canUseWind){
      R.powers.wind--; R.usedPower=true; R.powersSpent++; R.lives=1; renderLives(); renderPowers();
      toast("Second Wind — one life restored");
      Snd.power(); afterRun(1900, nextQuestion); return;
    }
    afterRun(1900, ()=>endRun("death")); return;
  }
  afterRun(SetPieces.autoLock()?950:1900, nextQuestion);
}
function renderLives(justLost){
  const el=$("hud-lives"); if(!el) return;
  const n = R.maxLives;
  let html = "";
  for(let i=0;i<n;i++){
    const alive = i < R.lives;
    const last  = alive && R.lives===1;
    const broke = justLost && !alive && i===R.lives;
    html += '<span class="hrt'+(alive?"":" gone")+(last?" last":"")+(broke?" break":"")+'">'+(last?HEART_BROKEN:HEART_SVG)+'</span>';
  }
  html += '<b>'+R.lives+'</b>';
  el.innerHTML = html;
}
function recordVerse(q, ok){
  const b = SAVE.books[q.b] || (SAVE.books[q.b]={c:0,a:0});
  b.a++; if(ok) b.c++;
  const v = SAVE.verse[q.id] || (SAVE.verse[q.id]={c:0,a:0});
  v.a++; if(ok) v.c++;
  SAVE.life.attempts++; if(ok) SAVE.life.correct++;
}
/* Every answer in every mode reschedules the verse — the Trial feeds the
   Drill, which is the point of having one scheduler rather than a
   practice-only side channel. Passage sub-answers are skipped: they carry
   no verse id of their own. */
function scheduleReview(q, outcome){
  if(!q || !q.id) return;
  const card = reviewVerse(q, outcome);
  R.rescheduled.push({ r:q.r, ivl:card.ivl, correct:!!outcome.correct });
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
                              '<b class="no">Not this one.</b> <span>The verse reads “'+esc(R.q.a)+'”.</span>';
}

/* ==================================================================
   SPECIAL SEQUENCE ENGINE — multi-blank passages and reconstruction.
   Both run as ONE question with several sub-answers: partial credit,
   and at most a single life lost however many parts go wrong.
   ================================================================== */
function drawPassage(){
  let pool = PASSAGES.filter(p=>!R.usedPass.has(p.id));
  if(!pool.length){ R.usedPass.clear(); pool = PASSAGES.slice(); }
  const p = pool[Math.floor(Math.random()*pool.length)];
  R.usedPass.add(p.id);
  return p;
}
function clearSequence(){
  R.sceneToken = (R.sceneToken||0) + 1;
  R.passage = null; R.recon = null;
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

  Director.pressure(0);
  $("ref").textContent = p.r + " — KJV";
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
  R.locked = true;
  const b = st.p.blanks[st.idx];
  const ok = val === b.a;
  const span = $("verse").querySelectorAll(".pblank")[st.idx];
  span.classList.remove("active");
  span.textContent = ok ? b.a : val;
  span.classList.add(ok ? "filled" : "bad", "reveal");

  answerButtons().forEach(x=>{
    if(x.dataset.val===b.a) x.classList.add("right");
    else if(x===btn) x.classList.add("bad");
    else x.classList.add("mute");
  });
  $("opts").classList.add("locked");
  if(ok){ Snd.correct(); doFlash("gold"); Director.impact("correct"); }
  else { st.wrong++; Snd.wrong(); doFlash("red"); Director.impact("wrong"); shakeUI(true); }

  st.idx++;
  R.setpiece.remaining = st.p.blanks.length - st.idx;
  updateChips();
  afterRun(ok ? 700 : 1000, ()=>{
    if(R.passage!==st) return;
    R.locked = false;
    if(st.idx >= st.p.blanks.length) resolvePassage();
    else renderBlankOptions();
  });
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

  Director.pressure(0);
  $("ref").textContent = p.r + " — KJV";
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
  const right = st.slots.reduce((n,f,i)=> n + (f===i ? 1 : 0), 0);
  $("recon-slots").querySelectorAll(".slot").forEach((el,i)=>{
    el.classList.remove("empty","full");
    el.classList.add(st.slots[i]===i ? "ok" : "no");
    if(st.slots[i]!==i) el.querySelector("span").textContent = st.frags[i];
  });
  $("verse").innerHTML = '<span class="recon-prompt">'+
    (right===st.frags.length ? "The passage stands whole" : "Fragments out of order")+'</span>';
  finishSequence({book:st.p.b, id:st.p.id, right, total:st.frags.length, base:200});
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
    popScore("+"+fmt(gained)); animateScore();
  }
  if(perfect){
    R.correct++; R.streak++; R.best = Math.max(R.best, R.streak);
    R.booksRun.add(o.book);
    Snd.correct(); Backdrop.hit("correct"); doFlash("gold");
    Director.callout(SetPieces.label()+" restored");
    setMult(true); Director.momentum(true);
    afterRun(1700, nextQuestion);
  } else {
    R.streak = 0; setMult();
    const passage = PASSAGES.find(p=>p.id===o.id);
    if(passage){
      const full = passage.parts.map(x=>typeof x==="string" ? x : x.a).join("");
      R.missed.push({r:passage.r,p:"",a:full,s:""});
    }
    Director.momentum(false); Snd.wrong(); Backdrop.hit("wrong");
    Director.callout(o.right ? o.right+" of "+o.total+" restored" : "The passage is lost");
    loseLife();
  }
}

/* ------------------------- FX HELPERS ------------------------- */
function doFlash(cls){ const f=$("flash"); f.className=""; void f.offsetWidth; f.className=cls; }
function shakeUI(soft){
  if(!SAVE.set.shake || SAVE.set.reduced) return;
  const v=$("v-play"); if(!v) return;
  const frames = soft
    ? [{transform:"translate(0,0)"},{transform:"translate(-4px,2px)"},{transform:"translate(3px,-2px)"},{transform:"translate(0,0)"}]
    : [{transform:"translate(0,0)"},{transform:"translate(-7px,4px)"},{transform:"translate(6px,-4px)"},
       {transform:"translate(-4px,-2px)"},{transform:"translate(3px,2px)"},{transform:"translate(0,0)"}];
  v.animate(frames, {duration:soft?360:420, easing:"cubic-bezier(.36,.07,.19,.97)"});
}
function popScore(t){
  const p=document.createElement("div"); p.className="pop"; p.textContent=t;
  p.style.left="50%"; p.style.top="44%"; document.body.appendChild(p);
  setTimeout(()=>p.remove(),1450);
}
function toast(t){
  const p=document.createElement("div"); p.className="toast"; p.textContent=t;
  document.body.appendChild(p); setTimeout(()=>p.remove(),2700);
}
function animateScore(){
  const el=$("score"), from=R.disp, to=R.score, t0=performance.now();
  (function step(t){
    const k=Math.min(1,(t-t0)/650), e=1-Math.pow(1-k,3);
    R.disp=Math.round(from+(to-from)*e); el.textContent=fmt(R.disp);
    if(k<1) requestAnimationFrame(step);
  })(t0);
}

/* ------------------------- SEALS ------------------------- */
let pendingSeals = [];
function grantSeal(id){
  if(hasSeal(id)) return;
  SAVE.seals.push(id); persist();
  const s = SEALS.find(x=>x.id===id);
  pendingSeals.push(s);
  Snd.seal(); toast("Seal unlocked — "+s.n);
}
function checkMetaSeals(){
  const li = levelInfo(SAVE.xp);
  if(li.level>=20) grantSeal("lvl20");
  if(SAVE.life.correct>=500) grantSeal("life500");
  const booksC = Object.keys(SAVE.books).filter(b=>SAVE.books[b].c>0).length;
  if(booksC>=30) grantSeal("books30");
  if(booksC>=66) grantSeal("books66");
  if(SAVE.life.dailyDone>=7) grantSeal("daily7");
}

/* ------------------------- END OF RUN ------------------------- */
function endRun(reason){
  /* Idempotent on purpose. This is the one function that writes
     permanent progress — records, XP, seals, and now a cleared site on
     the Pilgrimage — and it is reachable from two directions at once: a
     timer running out and a player locking an answer in the same tick.
     Running it twice would bank the run twice and count a site visit
     that never happened. The guard is cleared by startRun. */
  if(R.ended) return;
  R.ended = true;
  invalidateRun();
  clearSequence();
  document.body.classList.remove("setpiece-active","overdrive","pressure-3","pressure-5","pressure-7");
  R.setpiece=null;
  const reachedV = (R.mode==="trial" && R.actIdx>=4);
  const trialWon = R.mode==="trial" && reason==="complete";
  const finished = reason==="complete";
  const isPilgrim = R.mode==="pilgrimage" || R.mode==="pilgrim-recall";
  // A site is cleared by answering every verse in it — surviving to the
  // end. Dying or abandoning leaves it exactly as it was.
  const siteCleared = isPilgrim && reason==="complete";
  /* Read BEFORE recordSiteResult writes, or every clear looks like a
     repeat. Walking new ground pays roughly double, so pushing further
     down the road always beats farming a site you have already beaten —
     without ever making the retry itself worthless. */
  const firstVisit = isPilgrim && R.siteId && !Pilgrimage.isCleared(SAVE.pilgrim, R.siteId);
  if(reason==="death" || reason==="abandon"){ Snd.death(); Backdrop.hit("death"); }
  else { Snd.victory(); Backdrop.hit("levelup"); }

  const acc = R.attempts ? R.correct/R.attempts : 0;
  // ---- bonuses ----
  const baseScore = R.score;
  const streakBonus = Math.round(R.best * 120 * R.diff.score);
  const accBonus = Math.round(acc * 1200 * R.diff.score);
  const survivalBonus = R.mode==="trial" ? Math.round((R.actIdx + (trialWon?1:0)) * 900 * R.diff.score)
                      : R.mode==="endless" ? Math.round(R.qTotal * 45 * R.diff.score)
                      : R.mode==="practice" ? Math.round(R.correct * 40 * R.diff.score)
                      // Recall pays more per verse: producing the words is
                      // strictly harder than recognising them, and an exact
                      // match is worth more than a forgiven typo.
                      : R.mode==="recall" ? Math.round((R.typedExact * 220 + R.typedClose * 120) * R.diff.score)
                      // The road pays by distance: a verse kept at Patmos is
                      // worth roughly double the same verse kept at Ur, which
                      // is the honest weighting when the clock has halved.
                      : isPilgrim ? Math.round(R.correct * 90 * R.diff.score *
                          (1 + Pilgrimage.positionOf(R.siteIndex)) * (siteCleared ? 1.35 : 1))
                      : Math.round(R.correct * 60 * R.diff.score);
  /* New ground pays. Shown as its own line rather than folded into a
     multiplier so the player can see exactly what the first clear was
     worth and why the second one pays less. */
  const firstClearBonus = (siteCleared && firstVisit)
    ? Math.round((baseScore + survivalBonus) * 0.9) : 0;
  const total = reason==="abandon" ? Math.round((baseScore + streakBonus + accBonus + survivalBonus) * 0.85)
              : baseScore + streakBonus + accBonus + survivalBonus + firstClearBonus;

  // ---- seals ----
  if(!hasSeal("first")) grantSeal("first");
  if(total>=25000) grantSeal("score25");
  if(total>=50000) grantSeal("score50");
  if(trialWon) grantSeal("sd15");
  if(R.mode==="endless" && R.qTotal>=40) grantSeal("end40");
  if(trialWon && !R.usedPower) grantSeal("nocrutch");
  if(trialWon && R.missed.length===0) grantSeal("flawless");
  if(trialWon && R.diff.key==="watchman") grantSeal("ironman");

  // ---- persist ----
  SAVE.runs++;
  SAVE.life.bestStreak = Math.max(SAVE.life.bestStreak, R.best);
  if(R.mode==="trial") SAVE.life.sdBest = Math.max(SAVE.life.sdBest, R.sdCount);
  if(R.mode==="endless") SAVE.life.endlessBest = Math.max(SAVE.life.endlessBest, R.qTotal);
  /* The relay banks each site as it leaves it, so all that is left at
     the end is the one still underfoot — and only if it was finished. */
  if(R.mode==="relay" && R.relay){
    if(reason==="complete" && R.relay.current) bankRelaySite(R.relay.current.siteId);
    if(reason==="complete" && !hasSeal("relay")) grantSeal("relay");
  }
  const road = isPilgrim ? recordSiteResult(siteCleared, total, acc) : null;
  if(road && road.firstClear){
    if(!hasSeal("road-first")) grantSeal("road-first");
    if(road.after.arcs[0].complete && !hasSeal("road-arc1")) grantSeal("road-arc1");
    if(road.after.arcs.filter(a=>a.complete).length >= 2 && !hasSeal("road-half")) grantSeal("road-half");
    if(road.after.complete && !hasSeal("road-end")) grantSeal("road-end");
    if(R.siteId==="patmos" && !hasSeal("road-patmos")) grantSeal("road-patmos");
  }
  /* Read straight off the saved journey rather than off `road`, because
     the relay banks its sites itself and never produces a `road`.
     Checked on every finish, not only a first clear: perfecting an arc
     usually means going back to tidy up a site you scraped through. */
  if(isPilgrim || R.mode==="relay"){
    Pilgrimage.overview(SAVE.pilgrim).arcs.forEach(a=>{
      if(a.perfect && !hasSeal("arc-"+a.key)) grantSeal("arc-"+a.key);
    });
  }
  const isRecord = total > (SAVE.best[R.mode]||0);
  const prevBest = SAVE.best[R.mode]||0;
  if(isRecord) SAVE.best[R.mode] = total;

  let dailyRecorded = false;
  if(R.mode==="daily" && SAVE.daily.date !== todayKey()){
    SAVE.daily = {date:todayKey(), score:total};
    SAVE.life.dailyDone++; dailyRecorded = true;
  }
  SAVE.board.push({score:total, mode:R.mode, diff:R.diff.key, acc:Math.round(acc*100), date:todayKey(), q:R.qTotal});
  SAVE.board.sort((a,b)=>b.score-a.score);
  SAVE.board = SAVE.board.slice(0,10);

  // ---- xp ----
  const beforeLvl = levelInfo(SAVE.xp).level;
  const xpGain = Math.round(total/12 + R.correct*14 + (finished?300:0));
  SAVE.xp += xpGain;
  const afterInfo = levelInfo(SAVE.xp);
  checkMetaSeals();
  persist();

  renderResults({reason, total, baseScore, streakBonus, accBonus, survivalBonus, acc,
    xpGain, beforeLvl, afterInfo, isRecord, prevBest, dailyRecorded, road, siteCleared,
    firstClearBonus});
  if(afterInfo.level>beforeLvl){ setTimeout(()=>{ Snd.level(); Backdrop.hit("levelup"); toast("Level "+afterInfo.level+" — "+rankFor(afterInfo.level)); }, 1400); }
  go("results");
}

function renderResults(o){
  Director.ending(o);
  $("res-kick").textContent =
    o.reason==="abandon" ? "The run was abandoned" :
    o.reason==="complete" && R.mode==="trial" ? "The Final Test is complete" :
    o.reason==="complete" && R.mode==="daily" ? "The daily reading is finished" :
    o.reason==="complete" && R.mode==="practice" ? "The drill is finished" :
    o.reason==="complete" && R.mode==="recall" ? "You wrote them out from memory" :
    (R.mode==="trial" && R.actIdx===4) ? "The Final Test ended the run" :
    R.mode==="endless" ? "The gauntlet closed" : "The trial is ended";
  $("res-rank").textContent = runTitle(o.total);
  $("res-score").textContent = "0";
  const t0=performance.now();
  (function count(t){
    const k=Math.min(1,(t-t0)/1200), e=1-Math.pow(1-k,3);
    $("res-score").textContent = fmt(o.total*e);
    if(k<1) requestAnimationFrame(count);
  })(t0);

  $("res-breakdown").innerHTML =
    row("Verses kept", fmt(o.baseScore)) +
    row("Longest streak ×"+R.best, "+"+fmt(o.streakBonus)) +
    row("Accuracy "+Math.round(o.acc*100)+"%", "+"+fmt(o.accBonus)) +
    row(R.mode==="trial" ? "Acts survived" : R.mode==="endless" ? "Distance"
        : R.mode==="relay" ? "Sites walked" : "Verses answered", "+"+fmt(o.survivalBonus)) +
    (o.firstClearBonus ? row("New ground — first clear", "+"+fmt(o.firstClearBonus)) : "") +
    '<div class="brow tot"><span>Final</span><b>'+fmt(o.total)+'</b></div>';
  function row(a,b){ return '<div class="brow"><span>'+esc(a)+'</span><b>'+esc(b)+'</b></div>'; }

  /* What the run did to your schedule. Without this the spacing is
     invisible and the player has no reason to believe it exists. */
  const sched = $("res-schedule");
  if(sched){
    if(R.rescheduled.length){
      const back = R.rescheduled.filter(x=>!x.correct).length;
      const soonest = R.rescheduled.reduce((m,x)=>Math.min(m,x.ivl), Infinity);
      const furthest = R.rescheduled.reduce((m,x)=>Math.max(m,x.ivl), 0);
      sched.innerHTML = '<div class="mtitle">Next review</div>' +
        '<div class="schedrow"><b>'+R.rescheduled.length+'</b><span>verses rescheduled</span></div>' +
        '<div class="schedrow"><b>'+back+'</b><span>back tomorrow</span></div>' +
        '<div class="schedrow"><b>'+(furthest>=1?furthest:1)+'</b><span>longest gap, in days</span></div>' +
        '<div class="schedhint">Due today: '+dueToday()+' verses.</div>';
      sched.style.display = "";
    } else sched.style.display = "none";
  }

  $("res-stats").innerHTML =
    stat(R.correct, "Verses kept") +
    (R.typed ? stat(R.typedExact, "Word for word") + stat(R.typedClose, "Close enough") : "") +
    stat(R.best, "Best streak") +
    stat(R.mode==="trial" ? ACTS[R.actIdx].n : R.qTotal, R.mode==="trial" ? "Act reached" : "Questions") +
    stat(Math.round(o.acc*100)+"%", "Accuracy") +
    stat(R.booksRun.size, "Books touched") +
    stat(R.timedDecisions ? (R.decisionMs/R.timedDecisions/1000).toFixed(1)+"s" : "—", "Average response") +
    stat(Number.isFinite(R.fastestMs) ? (R.fastestMs/1000).toFixed(1)+"s" : "—", "Fastest response") +
    stat(R.powersSpent, "Lifelines spent");
  function stat(a,b){ return '<div class="stat"><b>'+esc(String(a))+'</b><span>'+esc(b)+'</span></div>'; }

  $("xp-lvl").textContent = "Level "+o.afterInfo.level+" · "+rankFor(o.afterInfo.level);
  $("xp-gain").textContent = "+"+fmt(o.xpGain)+" XP";
  $("xp-fill").style.width = "0%";
  setTimeout(()=>{ $("xp-fill").style.width = (o.afterInfo.into/o.afterInfo.need*100)+"%"; }, 260);

  $("res-seals").innerHTML = pendingSeals.map(s=>
    '<div class="sealwin"><b>'+esc(s.n)+'</b><span>'+esc(s.d)+'</span></div>').join("");
  pendingSeals = [];

  const m=$("res-missed");
  if(R.missed.length){
    m.innerHTML='<div class="mtitle">Verses that got away — learn these</div>'+
      R.missed.map(q=>'<div class="mrow"><i>'+esc(q.r)+'</i>'+esc(q.p)+' <em>'+esc(q.a)+'</em>'+sep(q.s)+esc(q.s)+'</div>').join("");
  } else {
    m.innerHTML='<div class="mtitle">Not one verse lost</div><div class="mrow" style="text-align:center">Flawless. Every word held.</div>';
  }
  const missedPanel=$("res-details-missed");
  if(missedPanel) missedPanel.open = R.missed.length > 0;

  let best = "";
  if(o.isRecord) best = "New "+MODES[R.mode].name+" record — previous "+fmt(o.prevBest);
  else best = MODES[R.mode].name+" best — "+fmt(SAVE.best[R.mode]||0);
  if(R.mode==="daily" && !o.dailyRecorded) best += " · today's score already recorded (practice run)";
  $("res-best").textContent = best;
  const shareBtn=$("res-share");
  if(shareBtn){
    shareBtn.style.display = R.mode==="daily" ? "" : "none";
    shareBtn.onclick = ()=>shareDailyResult(o.total);
  }

  /* On the road, the results screen reports where you are rather than
     just what you scored, and sends you back to the map instead of the
     main hall. */
  const isPilgrim = R.mode==="pilgrimage" || R.mode==="pilgrim-recall";
  const onRoad = isPilgrim || R.mode==="relay";
  const roadBtn=$("res-road");
  if(roadBtn){
    roadBtn.style.display = onRoad ? "" : "none";
    roadBtn.onclick = ()=>{ Snd.ui(); go("atlas"); };
  }

  /* Straight on to the next site, without a round trip to the map. With
     29 stops the map screen between every one of them becomes a toll
     rather than a moment, so a player on a run can just keep walking. */
  const nextBtn=$("res-next");
  if(nextBtn){
    const nxt = isPilgrim && o.siteCleared ? Pilgrimage.currentSite(SAVE.pilgrim) : null;
    const showNext = !!(nxt && !Pilgrimage.isCleared(SAVE.pilgrim, nxt.id));
    nextBtn.style.display = showNext ? "" : "none";
    if(showNext){
      nextBtn.textContent = "On to " + nxt.name.replace(/\s*\(.*\)$/, "");
      nextBtn.onclick = ()=>{ Snd.unlock(); Snd.ui(); openSiteBrief(nxt.id, "pilgrimage"); };
    }
  }

  if(R.mode==="relay" && R.relay){
    const arc = Pilgrimage.arc(R.relay.arcKey);
    const done = R.relay.banked.length, all = R.relay.sites.length;
    $("res-kick").textContent = o.reason==="complete"
      ? (arc ? arc.name + " — walked without rest" : "The arc is walked")
      : "The road ended early";
    $("res-best").textContent = done === all
      ? "Every site from " + (Pilgrimage.site(R.relay.sites[0])||{name:""}).name + " onward is cleared"
      : done + " of " + all + " sites banked before the road ended · they stay cleared";
  }
  if(isPilgrim && o.road){
    const site = Pilgrimage.site(R.siteId);
    const nxt = Pilgrimage.currentSite(o.road.after ? SAVE.pilgrim : SAVE.pilgrim);
    $("res-kick").textContent = o.siteCleared
      ? (site ? site.name + " is behind you" : "The site is cleared")
      : (site ? site.name + " holds" : "The site holds");
    const line = o.siteCleared
      ? o.road.after.complete
        ? "Every site from Ur to Patmos is cleared. The road is walked."
        : "The road opens to " + (nxt ? nxt.name : "the next site") +
          " · " + o.road.after.cleared + " of " + o.road.after.total + " sites"
      : "Walk it again when you are ready · " + o.road.after.cleared +
        " of " + o.road.after.total + " sites cleared";
    $("res-best").textContent = line;
  }
  updatePlayerCard();
}
$("res-again").addEventListener("click", ()=>{ Snd.ui(); startRun(R.mode, R.diff.key); });

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
  drawStudy();
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
  if(!list.length){ el.innerHTML='<div class="empty">Nothing here yet. Change the filter, or go earn some scars.</div>'; return; }
  el.innerHTML = list.map(v=>{
    const sch = verseScheduleLabel(v);
    return '<div class="vcard"><div class="vr"><i><span class="tierdot" style="opacity:'+(0.35+v.t*0.13)+'"></span>'+
      esc(v.r)+' · Tier '+v.t+'</i><span class="mastery '+sch.cls+'">'+esc(sch.label)+'</span></div>'+
      '<p>'+esc(v.p)+' <em>'+esc(v.a)+'</em>'+sep(v.s)+esc(v.s)+'</p></div>';
  }).join("");
}

/* ------------------------- SEALS SCREEN ------------------------- */
function renderSeals(){
  $("seals-title").textContent = "Seals — "+SAVE.seals.length+" / "+SEALS.length;
  $("sealgrid").innerHTML = SEALS.map(s=>
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
    if(!SAVE.board.length){ el.innerHTML='<div class="empty">No runs recorded. The chronicle is blank.</div>'; return; }
    el.innerHTML='<div class="lb">'+SAVE.board.map((r,i)=>
      '<div class="lbrow'+(i===0?" top":"")+'"><div class="pos">'+(i+1)+'</div>'+
      '<div class="mode">'+esc(MODES[r.mode]?MODES[r.mode].name:r.mode)+' · '+esc(DIFFS[r.diff]?DIFFS[r.diff].name:r.diff)+' · '+r.acc+'%</div>'+
      '<div class="sc">'+fmt(r.score)+'</div><div class="dt">'+esc(r.date)+'</div></div>').join("")+'</div>';
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

/* ------------------------- SETTINGS ------------------------- */
function renderSettings(){
  const s=SAVE.set;
  $("settings-body").innerHTML =
    setRow("Music","Ambient drone beneath the cathedral.",
      '<input type="range" id="set-music" min="0" max="1" step="0.05" value="'+s.music+'">') +
    setRow("Sound effects","Ticks, heartbeat, the hit when you are wrong.",
      '<input type="range" id="set-sfx" min="0" max="1" step="0.05" value="'+s.sfx+'">') +
    setRow("Mission voice","Narrates act changes, special sequences and major outcomes.",
      seg("voice",[[true,"On"],[false,"Off"]],s.voice)) +
    setRow("Visual quality","Choose the effects profile that best matches this device.",
      seg("quality",[["high","Cinematic"],["balanced","Balanced"],["low","Efficient"]],s.quality||"high")) +
    setRow("Reduced motion","Stops film grain, pulsing and screen shake.",
      seg("reduced",[[false,"Off"],[true,"On"]],s.reduced)) +
    setRow("Screen shake","The kick when you lose a life.",
      seg("shake",[[true,"On"],[false,"Off"]],s.shake)) +
    setRow("Live conditions","Real current weather at each site on the Pilgrimage map. Off, or offline, it uses that place's typical climate instead — the map never waits on it.",
      seg("liveWeather",[[true,"On"],[false,"Off"]],s.liveWeather)) +
    '<div class="footer"><button class="btn ghost sm" id="set-road">Restart the Pilgrimage</button>' +
    '<button class="btn ghost sm" id="set-reset">Erase all progress</button></div>';

  function setRow(l,sub,ctrl){ return '<div class="setrow"><div><label>'+esc(l)+'</label><small>'+esc(sub)+'</small></div>'+ctrl+'</div>'; }
  function seg(key,opts,cur){
    return '<div class="seg" data-seg="'+key+'">'+opts.map(o=>
      '<button data-val="'+o[0]+'" class="'+(String(cur)===String(o[0])?"on":"")+'">'+esc(o[1])+'</button>').join("")+'</div>';
  }

  $("set-music").addEventListener("input", e=>{ Snd.unlock(); Snd.setMusic(parseFloat(e.target.value)); persist(); });
  $("set-sfx").addEventListener("input", e=>{ Snd.unlock(); Snd.setSfx(parseFloat(e.target.value)); persist(); });
  document.querySelectorAll("[data-seg]").forEach(g=>{
    g.querySelectorAll("button").forEach(b=>{
      b.addEventListener("click", ()=>{
        const key=g.dataset.seg; let v=b.dataset.val;
        if(v==="true") v=true; else if(v==="false") v=false;
        SAVE.set[key]=v; persist(); Snd.ui();
        g.querySelectorAll("button").forEach(x=>x.classList.toggle("on", x===b));
        applySettings();
      });
    });
  });
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
function applySettings(){
  const systemReduced=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
  document.body.classList.toggle("reduced", !!SAVE.set.reduced||systemReduced);
  document.body.classList.remove("quality-high","quality-balanced","quality-low");
  const quality=["high","balanced","low"].includes(SAVE.set.quality)?SAVE.set.quality:"high";
  document.body.classList.add("quality-"+quality);
  Snd.setMusic(SAVE.set.music); Snd.setSfx(SAVE.set.sfx);
  Live.configure({enabled: SAVE.set.liveWeather !== false});
  Director.syncFx();
  if(currentView==="play")Viz.size();
}

/* ------------------------- PAUSE ------------------------- */
function setPaused(v){
  if(currentView!=="play") return;
  R.paused = v;
  $("pause").classList.toggle("on", v);
  if(v){
    const progress=R.mode==="trial" ? ACTS[R.actIdx].n+" / V"
      : (R.mode==="practice"||R.mode==="recall") ? R.qTotal+" / "+R.practiceLen
      : String(R.qTotal);
    const acc=R.attempts ? Math.round(R.correct/R.attempts*100)+"%" : "—";
    $("pause-stats").innerHTML=
      '<div><b>'+fmt(R.score)+'</b><span>Score</span></div>'+
      '<div><b>'+R.streak+'</b><span>Streak</span></div>'+
      '<div><b>'+acc+'</b><span>Accuracy</span></div>'+
      '<div><b>'+progress+'</b><span>'+(R.mode==="trial"?"Act":R.mode==="practice"?"Drill":R.mode==="recall"?"Recall":"Distance")+'</span></div>';
    stopLoop();
  }else ensureLoop();
}
let pauseStamp=0;
function togglePause(){
  if(currentView!=="play" || !R.running) return;
  if(!R.paused){ pauseStamp = performance.now(); setPaused(true); }
  else { const d = performance.now()-pauseStamp; R.tEnd += d; setPaused(false); }
}
$("pause-resume").addEventListener("click", togglePause);
function abandonRun(){
  setPaused(false);
  if(!R.attempts){
    invalidateRun();
    clearSequence();
    R.setpiece = null;
    pendingSeals = [];
    $("setpiece-card").classList.remove("on");
    document.body.classList.remove("setpiece-active","overdrive","pressure-3","pressure-5","pressure-7");
    Snd.ui();
    // Backing out of a site before answering anything drops you on the
    // map you came from, not in the main hall.
    go(R.mode==="pilgrimage"||R.mode==="pilgrim-recall"||R.mode==="relay" ? "atlas" : "menu");
    return;
  }
  endRun("abandon");
}
$("pause-quit").addEventListener("click", abandonRun);

function shareDailyResult(total){
  const text = "Complete the Verse — Daily Trial "+todayKey()+"\nScore: "+fmt(total)+
    "\nKept "+R.correct+"/"+R.attempts+" · "+MODES.daily.name+" · KJV";
  if(navigator.share){
    navigator.share({title:"Complete the Verse", text:text}).catch(()=>{});
    return;
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>toast("Daily result copied")).catch(()=>toast(text));
    return;
  }
  toast("Share unavailable on this device");
}

/* ------------------------- FIRST-RUN TUTORIAL ------------------------- */
function showTutorialIfNeeded(){
  if(SAVE.set.tutorialDone) return;
  const el=$("tutorial"); if(!el) return;
  el.classList.add("on");
}
function finishTutorial(startPractice){
  SAVE.set.tutorialDone = true; persist();
  const el=$("tutorial"); if(el) el.classList.remove("on");
  if(startPractice){ Snd.unlock(); openBrief("practice"); }
}
function bindTutorial(){
  const skip=$("tut-skip"), goBtn=$("tut-go");
  if(skip) skip.addEventListener("click", ()=>{ Snd.ui(); finishTutorial(false); });
  if(goBtn) goBtn.addEventListener("click", ()=>{ Snd.ui(); finishTutorial(true); });
}

/* ------------------------- INPUT ------------------------- */
addEventListener("keydown", e=>{
  const k = e.key.toLowerCase();
  if(document.activeElement && /input|select|textarea/i.test(document.activeElement.tagName)) return;
  // Escape walks back one step rather than always jumping to the hall:
  // a site briefing belongs to the map, so it returns there.
  if(k==="escape"){
    if(currentView==="play") togglePause();
    else if(currentView==="sitebrief") go("atlas");
    else if(currentView!=="menu") go("menu");
    return;
  }
  if(currentView==="menu" && (k==="enter"||k===" ")){ e.preventDefault(); Snd.unlock(); openBrief("trial"); return; }
  if(currentView==="brief" && (k==="enter")){ e.preventDefault(); Snd.unlock(); startRun(briefMode, SAVE.set.diff); return; }
  if(currentView==="sitebrief" && (k==="enter")){ e.preventDefault(); Snd.unlock(); startRun(sbMode, SAVE.set.diff); return; }
  if(currentView==="results" && (k==="enter"||k===" ")){ e.preventDefault(); startRun(R.mode, R.diff.key); return; }
  if(currentView!=="play") return;
  if(k==="s"){ usePower("selah"); return; }
  if(k==="i"){ usePower("illum"); return; }
  if(k==="enter" || k===" "){
    e.preventDefault();
    if(R.recon){
      const b=$("recon-confirm"); if(b && !b.disabled) b.click();
    } else confirmAnswer();
    return;
  }
  const idx = (k>="1"&&k<="4") ? parseInt(k,10)-1 : "abcd".indexOf(k);
  if(idx >= 0){
    const b = answerButtons()[idx];
    if(b && !b.classList.contains("burn")) b.click();
  }
});
addEventListener("resize", ()=>{ if(currentView==="play")Viz.size(); });
document.addEventListener("pointerdown", ()=>Snd.unlock(), {once:true});
document.addEventListener("visibilitychange", ()=>{
  if(document.hidden){
    stopLoop();
    if(currentView==="play"&&R.running&&!R.paused){
      pauseStamp=performance.now();
      setPaused(true);
    }
  }else if(currentView==="play"){
    ensureLoop();
  }
});

/* ------------------------- MAIN LOOP ------------------------- */
let loopRaf=null,lastVizFrame=0;
function ensureLoop(){
  if(loopRaf===null&&currentView==="play"&&!document.hidden&&!R.paused)loopRaf=requestAnimationFrame(loop);
}
function stopLoop(){
  if(loopRaf!==null)cancelAnimationFrame(loopRaf);
  loopRaf=null;
}
function loop(ts){
  loopRaf=null;
  if(currentView!=="play"||document.hidden)return;
  tickTimer(ts);
  if(ts-lastVizFrame>=33){
    lastVizFrame=ts;
    Viz.draw(ts||0);
  }
  ensureLoop();
}

/* ------------------------- BOOT ------------------------- */
(function boot(){
  buildPlayerCard();
  Backdrop.init();
  applySettings();
  bindTutorial();

  const msgs = ["Opening the sacred record…","Gathering the witnesses…","Preparing the trial…",
    "Lighting the final lamp…"];
  const marks=[28,58,86,100];
  let i=0;
  const tick = setInterval(()=>{
    $("boot-fill").style.width = marks[i]+"%";
    $("boot-msg").textContent = msgs[i];
    i++;
    if(i>=marks.length){
      clearInterval(tick);
      $("boot-msg").textContent = "Enter.";
      setTimeout(()=>{
        if(currentView==="boot"){
          go("menu");
          showTutorialIfNeeded();
        }
      }, 180);
    }
  }, 150);
})();
