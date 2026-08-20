/* ==================================================================
   AUDIO (Snd) — music beds, sfx, mission voice, ducking.

   Split out of game.js along its natural seams. Classic script:
   defines one global (no module system), executed before game.js,
   referenced from it at RUNTIME only — nothing here may touch a
   game.js binding while this file parses.
   ================================================================== */

/* ------------------------- AUDIO ------------------------- */
const Snd = (function(){
  let ctx=null, mMus=null, mSfx=null, pad=[], started=false, avail=true, anal=null, freq=null;
  let bed=null, trackAudio={}, trackNodes={}, duckTimer=null, sfxHold={};
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
  /* Ones that replace themselves so rapid re-triggers do not stack. */
  const SFX_EXCL = { heart:1, tick:1 };
  /* Ones that briefly duck the bed so they cut through. */
  const SFX_DUCK = { lock:1, correct:1, wrong:1, power:1 };
  const SFX_GAIN = { hover:0.4, lock:0.68, correct:0.72, wrong:0.66, power:0.5, heart:0.85 };
  let voiceHold=null, pendingVoice=null;
  function duckMusic(factor, ms){
    if(!ctx||!mMus) return;
    const base = Math.max(0, SAVE.set.music||0);
    try{ mMus.gain.cancelScheduledValues(ctx.currentTime); }catch(e){}
    /* Music at 0 must stay at 0 — a 1% duck floor was leaking the bed. */
    if(base<=0){
      mMus.gain.setTargetAtTime(0, ctx.currentTime, .05);
      return;
    }
    const ducked = Math.max(0, base * (factor==null ? 0.2 : factor));
    mMus.gain.setTargetAtTime(ducked, ctx.currentTime, .05);
    if(duckTimer) clearTimeout(duckTimer);
    duckTimer = setTimeout(function(){
      if(!ctx||!mMus) return;
      mMus.gain.setTargetAtTime(SAVE.set.music||0, ctx.currentTime, .22);
    }, ms||480);
  }
  function playSfx(name){
    init();
    const src=SFX[name];
    if(!src||!avail) return false;
    try{
      if(SFX_EXCL[name] && sfxHold[name]){
        try{ sfxHold[name].pause(); sfxHold[name].currentTime=0; }catch(e){}
      }
      const a=new Audio(src);
      a.volume=Math.max(0,Math.min(1,(SAVE.set.sfx||0)*(SFX_GAIN[name]==null?0.7:SFX_GAIN[name])));
      if(SFX_EXCL[name]) sfxHold[name]=a;
      if(SFX_DUCK[name]) duckMusic(0.42, 380);
      const p=a.play();
      if(p&&p.catch) p.catch(()=>{});
      return true;
    }catch(e){ return false; }
  }
  /* Recorded mission voice. Exclusive — a new line cuts the previous. */
  function attemptVoice(src, duckMs, onFail){
    function notifyVoiceFailure(){
      if(!onFail) return;
      setTimeout(function(){
        /* A newer prompt owns the channel; do not let an older rejected
           promise speak over it. */
        if(pendingVoice && pendingVoice.src===src && !voiceHold) onFail();
      }, 0);
    }
    try{
      if(voiceHold){
        try{ voiceHold.pause(); voiceHold.currentTime=0; }catch(e){}
        voiceHold=null;
      }
      const a=new Audio(src);
      a.preload="metadata";
      a.volume=Math.max(0,Math.min(1,SAVE.set.sfx==null?0.7:SAVE.set.sfx));
      voiceHold=a;
      if(avail) duckMusic(0.2, duckMs==null?2400:duckMs);
      const p=a.play();
      if(p&&p.catch) p.catch(function(){
        if(voiceHold===a) voiceHold=null;
        pendingVoice={src:src,duckMs:duckMs,onFail:onFail};
        /* Let Director finish cancelling any already-speaking line before
           the fallback starts; otherwise the fallback is cancelled too. */
        notifyVoiceFailure();
      });
      a.addEventListener("ended", function(){ if(voiceHold===a) voiceHold=null; });
      return true;
    }catch(e){
      pendingVoice={src:src,duckMs:duckMs,onFail:onFail};
      notifyVoiceFailure();
      return false;
    }
  }
  /* Return playback failures to the caller. Swallowing an autoplay
     rejection here used to silence both recorded voice and TTS fallback. */
  function playVoice(src, duckMs, onFail){
    init();
    if(!src || (SAVE.set && SAVE.set.voice===false)) return false;
    pendingVoice=null;
    return attemptVoice(src, duckMs, onFail);
  }
  function stopVoice(){
    pendingVoice=null;
    if(!voiceHold) return;
    try{ voiceHold.pause(); voiceHold.currentTime=0; }catch(e){}
    voiceHold=null;
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
    a.preload = "none"; /* lazy — only fetch when this bed plays */
    a.volume = Math.max(0, Math.min(1, SAVE.set.music||0));
    try{
      const n = ctx.createMediaElementSource(a);
      n.connect(mMus);
      trackNodes[name] = n;
      a.volume = 1; /* loudness owned by mMus */
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
    /* Exactly one bed: stop every other track before starting this one. */
    Object.keys(trackAudio).forEach(k=>{ if(k!==name) stopTrack(k); });
    if(trackNodes[name]) a.volume = 1;
    else a.volume = Math.max(0, Math.min(1, SAVE.set.music||0));
    if(!a.paused) return;
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
      if(pendingVoice){
        const next=pendingVoice;
        pendingVoice=null;
        attemptVoice(next.src, next.duckMs, next.onFail);
      }
    },
    setMusic(v){
      SAVE.set.music=v;
      if(mMus&&ctx) mMus.gain.setTargetAtTime(v, ctx.currentTime, .1);
      /* Tracks not routed through Web Audio still need element volume. */
      Object.keys(trackAudio).forEach(k=>{
        if(!trackNodes[k] && trackAudio[k]) trackAudio[k].volume = Math.max(0, Math.min(1, v||0));
      });
    },
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
    ui(){ tone(1320,.045,"triangle",.035); tone(1980,.035,"sine",.018,.018); },
    hover(){ if(playSfx("hover")) return; tone(1540,.03,"sine",.03); },
    tick(crit){ tone(crit?1180:780,.04,"square",crit?.04:.018); },
    heart(){ if(playSfx("heart")) return; tone(58,.11,"sine",.1); tone(46,.14,"sine",.07,.1); },
    lock(){ if(playSfx("lock")) return; duckMusic(0.18, 520); tone(78,.32,"square",.18,0,52); tone(42,.42,"sine",.24); noise(.2,.11,680); },
    pulse(level){
      const v=.035+Math.min(4,level||0)*.014;
      tone(52,.18,"sine",v); tone(104,.07,"triangle",v*.45,.02);
      if(level>=3) noise(.06,.025,1450);
    },
    tension(level){
      if(!ctx||!mMus) return;
      const base=Math.max(0,SAVE.set.music||0);
      /* Off means off. The old .05 floor brought the bed back after mute. */
      if(base<=0){ mMus.gain.setTargetAtTime(0,ctx.currentTime,.08); return; }
      const target=base*(1+Math.min(4,level||0)*.09);
      mMus.gain.setTargetAtTime(target,ctx.currentTime,.35);
    },
    hush(){ duckMusic(0.03, 470); },
    selah(ms){ duckMusic(0.6, ms == null ? 5000 : ms); },
    correct(){
      if(playSfx("correct")) return;
      duckMusic(0.18, 520);
      [523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>tone(f,1.6,"sine",.11,i*.04));
      tone(130.81,2.0,"triangle",.09); noise(.3,.04,3000);
    },
    wrong(){
      if(playSfx("wrong")) return;
      duckMusic(0.18, 520);
      tone(146.83,1.1,"sawtooth",.10,0,73.4); tone(155.56,1.1,"sawtooth",.085,0,77.8);
      tone(40,1.4,"sine",.22); noise(.75,.18,420);
    },
    act(){ duckMusic(0.22, 900); [261.63,329.63,392,523.25,659.25,783.99].forEach((f,i)=>tone(f,2.4,"sine",.085,i*.12));
      tone(65.41,2.8,"triangle",.11); },
    seal(){ duckMusic(0.22, 700); [783.99,1046.5,1318.5,1567.98].forEach((f,i)=>tone(f,1.8,"sine",.10,i*.09)); noise(.5,.05,4200); },
    level(){ duckMusic(0.22, 900); [392,523.25,659.25,783.99,1046.5,1318.5,1567.98].forEach((f,i)=>tone(f,2.2,"sine",.09,i*.08)); },
    power(){
      if(playSfx("power")) return;
      duckMusic(0.18, 520);
      [880,1174.66,1567.98].forEach((f,i)=>tone(f,1.0,"sine",.08,i*.045));
    },
    death(){ duckMusic(0.12, 1600); tone(110,3.4,"sine",.20,0,27.5); tone(103.8,3.4,"sawtooth",.075,0,26); noise(1.7,.2,300); },
    victory(){ duckMusic(0.18, 1200); [392,493.88,587.33,783.99,987.77,1174.66].forEach((f,i)=>tone(f,3.0,"sine",.09,i*.1)); },
    /* Kill countdown SFX immediately (lock, pause, time-up, end of run). */
    stopPressure(){
      ["tick","heart"].forEach(function(name){
        if(sfxHold[name]){
          try{ sfxHold[name].pause(); sfxHold[name].currentTime=0; }catch(e){}
          sfxHold[name]=null;
        }
      });
    },
    spectrum(){ if(!anal) return null; try{ anal.getByteFrequencyData(freq); }catch(e){ return null; } return freq; },
    playVoice:playVoice,
    stopVoice:stopVoice
  };
})();

if(typeof window !== "undefined"){
  window.addEventListener("pointerdown", function(){ if(typeof Snd !== "undefined" && Snd.unlock) Snd.unlock(); }, { passive: true });
  window.addEventListener("keydown", function(){ if(typeof Snd !== "undefined" && Snd.unlock) Snd.unlock(); }, { passive: true });
}
