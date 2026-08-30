/* ==================================================================
   DIRECTOR — cinematic grading (Backdrop) + presentation direction.

   Split out of game.js along its natural seams. Classic script:
   defines one global (no module system), executed before game.js,
   referenced from it at RUNTIME only — nothing here may touch a
   game.js binding while this file parses.
   ================================================================== */

/* ==================================================================
   BACKDROP — cinematic field under the UI. CSS wash only.
   Values are raw rgb triples for rgba() use.
   ================================================================== */
const PALETTES = {
  menu:    {a:'138,111,52', b:'26,20,9',  c:'90,72,34'},
  act1:    {a:'138,111,52', b:'26,20,9',  c:'90,72,34'},
  act2:    {a:'44,74,110',  b:'10,18,32', c:'30,52,80'},
  act3:    {a:'150,72,26',  b:'29,12,5',  c:'104,44,14'},
  act4:    {a:'80,57,120',  b:'18,12,30', c:'52,36,84'},
  act5:    {a:'128,20,24',  b:'26,4,7',   c:'96,14,18'},
  results: {a:'154,124,60', b:'28,21,9',  c:'104,82,40'},
  finalStillness: {a:'90,24,32', b:'18,6,8', c:'64,16,22'},
  suddenDescent:  {a:'120,40,20', b:'24,8,4', c:'90,30,12'}
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
    init(){
      el = document.getElementById('backdrop');
      apply('menu');
      return !!el;
    },
    palette(name){ apply(name); },
    hit(kind){
      if(!el) return;
      /* Play-stage misses sit on an opaque .stage; a backdrop jolt
         there is invisible. Only end-of-run / act beats show it. */
      if(kind === 'death' || kind === 'levelup'){
        el.classList.remove('jolt'); void el.offsetWidth; el.classList.add('jolt');
      }
    },
    syncSky(){}
  };
})();


/* ------------------------- CINEMATIC DIRECTOR ------------------------- */
const Director = (function(){
  let lastPressure=-1,lastMomentum=-1,lastVoice=0;
  function clearBody(prefixes){
    [...document.body.classList].forEach(c=>{ if(prefixes.some(p=>c.indexOf(p)===0)) document.body.classList.remove(c); });
  }
  let voice=null, voiceTried=false, captionTimer=null;
  function caption(text){
    const el = typeof $ === "function" ? $("voice-caption") : document.getElementById("voice-caption");
    if(!el) return;
    el.textContent = String(text || "");
    el.classList.add("on");
    clearTimeout(captionTimer);
    captionTimer = setTimeout(function(){ el.classList.remove("on"); }, 5600);
  }
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
  /* Spoken line -> recorded file. Keys are lowercase, punctuation stripped. */
  const VOICE_FILES = {
    "the signal is live":"audio/voice/act-1-signal.mp3",
    "the pursuit begins":"audio/voice/act-2-pursuit.mp3",
    "blackout protocol":"audio/voice/act-3-blackout.mp3",
    "no turning back":"audio/voice/act-4-no-turning-back.mp3",
    "this is the final test":"audio/voice/act-5-final-test.mp3",
    "rapid recall five verses six seconds each":"audio/voice/set-rapid.mp3",
    "book lockdown source restricted":"audio/voice/set-lockdown.mp3",
    "the missing passage three phrases gone lifelines offline":"audio/voice/set-missing.mp3",
    "no second chances":"audio/voice/set-nochance.mp3",
    "final reconstruction rebuild the passage":"audio/voice/set-reconstruct.mp3",
    "final reconstruction rebuild the ending":"audio/voice/set-reconstruct.mp3",
    "book lockdown the source is exodus":"audio/voice/set-sinai.mp3",
    "the wall is fallen":"audio/voice/set-jericho.mp3",
    "the wall is fallen rebuild what stood":"audio/voice/set-jericho.mp3",
    "the exile three phrases gone lifelines offline":"audio/voice/set-babylon.mp3",
    "overdrive scripture locked":"audio/voice/overdrive.mp3",
    "one life remains":"audio/voice/one-life.mp3",
    "the run is abandoned":"audio/voice/end-abandon.mp3",
    "perfect recall the record is complete":"audio/voice/end-perfect.mp3",
    "scripture mastered":"audio/voice/end-mastered.mp3",
    "you survived the final test":"audio/voice/end-survived.mp3",
    "the record closes prepare for another run":"audio/voice/end-defeated.mp3",
    "the pilgrimage ur to patmos":"audio/voice/map-open.mp3",
    "the next place is open":"audio/voice/map-unlocked.mp3",
    "that place is still sealed":"audio/voice/map-sealed.mp3",
    "lesson one choose the phrase that completes the verse":"audio/voice/lesson-one.mp3",
    "lesson two name the passage for the verse shown":"audio/voice/lesson-two.mp3",
    "lesson three tap the missing words in sequence":"audio/voice/lesson-three.mp3",
    "lesson four discern the true scripture reading":"audio/voice/lesson-four.mp3",
    "lesson five commit the words before they fade":"audio/voice/lesson-five.mp3",
    "lesson five memorize the whole verse for one minute then choose the true king james line":"audio/voice/lesson-five.mp3",
    "lesson five memorize the whole verse for thirty seconds then rebuild every word in order":"audio/voice/thirty-seconds.mp3",
    "memorize the whole verse for thirty seconds then rebuild every word in order":"audio/voice/thirty-seconds.mp3",
    "thirty second memorization tutorial":"audio/voice/thirty-seconds.mp3",
    "thirty seconds":"audio/voice/thirty-seconds.mp3",
    "lesson six assemble the verse from memory":"audio/voice/lesson-six.mp3"
  };
  function voiceKey(text){
    return String(text||"").toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
  }
  function speakFallback(text){
    if(!("speechSynthesis" in window)) return;
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.voice=bestVoice();
      u.rate=.84;u.pitch=.76;u.volume=Math.min(1,.78*(SAVE.set.sfx==null?.7:SAVE.set.sfx));
      speechSynthesis.speak(u);
    }catch(e){}
  }
  function speak(text,force){
    if(!text) return;
    caption(text);
    if(!SAVE.set.voice || (!force && Date.now()-lastVoice<2400)) return;
    const src=VOICE_FILES[voiceKey(text)];
    if(src && typeof Snd!=="undefined" && Snd.playVoice){
      lastVoice=Date.now();
      const played=Snd.playVoice(src, 2400, function(){ speakFallback(text); });
      if(played){
        try{ if("speechSynthesis" in window) speechSynthesis.cancel(); }catch(e){}
        return;
      }
    }
    lastVoice=Date.now();
    speakFallback(text);
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
  function stampVerse(motionOff){
    const v = document.getElementById("verse");
    if(!v) return;
    if(motionOff || (window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){
      v.classList.remove("verdict-stamp");
      return;
    }
    v.classList.remove("verdict-stamp"); void v.offsetWidth;
    v.classList.add("verdict-stamp");
    clearTimeout(v._stampT);
    v._stampT = setTimeout(function(){ v.classList.remove("verdict-stamp"); }, 430);
  }
  function showJudgeBurst(kind){
    const motionOff = typeof SAVE!=="undefined" && SAVE.set && (SAVE.set.reduced || (SAVE.set.motion && SAVE.set.motion!=="full"));
    stampVerse(motionOff);
    if(typeof Snd!=="undefined" && Snd.stamp) Snd.stamp();
    if(typeof SAVE!=="undefined" && SAVE.set && (SAVE.set.reduced || (SAVE.set.motion && SAVE.set.motion!=="full"))) return;
    const systemReduced=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
    if(systemReduced) return;
    let el = document.getElementById("judge-burst");
    if(!el){
      el = document.createElement("div");
      el.id = "judge-burst";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = "<i></i>";
      const wrap = document.querySelector("#v-play .cine-wrap") || document.getElementById("v-play") || document.body;
      wrap.appendChild(el);
    }
    el.className = "on " + (kind==="up"?"up":"down");
    clearTimeout(el._burstTimer);
    el._burstTimer = setTimeout(function(){
      el.className = "";
    }, 900);
  }
  function impact(kind){
    const cls=kind==="correct"?"correct-impact":"wrong-impact";
    document.body.classList.remove(cls);void document.body.offsetWidth;document.body.classList.add(cls);
    setTimeout(()=>document.body.classList.remove(cls),800);
    beat(kind==="correct"?"correct":"wrong");
    if(kind==="correct"||kind==="wrong") showJudgeBurst(kind==="correct"?"up":"down");
  }
  function syncFx(){
    const fx=$("cinematic-fx");if(!fx)return;
    fx.querySelectorAll(".ember").forEach(e=>e.remove());
    delete fx.dataset.emberMark;
  }
  function tabletEnding(){
    const held = typeof Tablets!=="undefined" && Tablets.held(R);
    return held
      ? {key:"perfect",title:"The Hold Stands",copy:"Every word is carved. The next chapter opens.",voice:"The hold stands. The next chapter is open."}
      : {key:"defeated",title:"The Tablet Shattered",copy:"The missing word is shown. Carry it into your next carving.",voice:"The tablet shattered. The word remains to be learned."};
  }
  function ending(o){
    const acc=R.attempts?R.correct/R.attempts:0;
    const reachedFinal=R.mode==="trial"&&R.actIdx>=4;
    let key,title,copy,voice;
    if(R.mode==="tablets"){
      const tablet = tabletEnding();
      key=tablet.key;title=tablet.title;copy=tablet.copy;voice=tablet.voice;
    }else if(o.reason==="abandon"){
      key="defeated";title="Abandoned";copy="The run ends by your hand. The score still stands in the record.";voice="The run is abandoned.";
    }else if(o.reason==="death"){
      key="defeated";title="The Record Closes";copy="The hall grows still, but the words remain. Study the missed passages and return.";voice="The record closes. Prepare for another run.";
    }else if(o.reason==="complete"&&acc===1){
      key="perfect";title="Perfect Run";copy="Every phrase held. The completed record stands illuminated.";voice="Perfect recall. The record is complete.";
    }else if(o.reason==="complete"&&acc>=.9&&R.correct>=8){
      key="mastered";title="Scripture Mastered";copy="The hall answers with light. Your strongest run has become part of the chronicle.";voice="Scripture mastered.";
    }else if(o.reason==="complete"&&R.mode==="trial"&&reachedFinal){
      key="survived";title="The Dawn Breaks";copy="You crossed the final threshold. The mission continues with the words you kept.";voice="You survived the final test.";
    }else if(o.reason==="complete"){
      key="survived";title="The Record Stands";copy="The run is finished. The words you kept remain in the chronicle.";voice="The record closes. Prepare for another run.";
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
  return {speak,caption,callout,setAct,pressure,momentum,beat,impact,syncFx,ending};
})();
