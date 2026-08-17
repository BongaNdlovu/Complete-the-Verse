/* ==================================================================
   SET-PIECES — the five special sequences and their triggers.

   Split out of game.js along its natural seams. Classic script:
   defines one global (no module system), executed before game.js,
   referenced from it at RUNTIME only — nothing here may touch a
   game.js binding while this file parses.
   ================================================================== */

/* ------------------------- CINEMATIC SET-PIECE ROUNDS ------------------------- */
const SetPieces=(function(){
  /* The five sequences, keyed so both campaigns can reference the same
     definition rather than each keeping its own copy. */
  const DEFS={
    rapid:{id:"rapid",title:"Rapid Recall",rule:"Five short verses on a fast clock. Answers lock on selection.",count:5,duration:6000,auto:true,code:"Velocity sequence",voice:"Rapid recall. Five verses. Six seconds each."},
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
     in the middle of it, which is why the briefing's verse count stays
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
    if(R.siteId && typeof applySiteSky==="function") applySiteSky(R.siteId);
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
    if(R.siteId && typeof applySiteSky==="function") applySiteSky(R.siteId);
    Snd.act();Director.speak(d.voice,true);
    afterRun(2300, ()=>{
      if(!R.setpiece || R.setpiece.id!==d.id) return;
      $("setpiece-card").classList.remove("on");
      document.body.classList.add("setpiece-active");
      go("play");nextQuestion();
    });
    return true;
  }

  function wouldLaunch(){
    if(R.mode!=="trial"||R.setpiece)return false;
    return !!TRIAL.find(x=>x.act===R.actIdx&&x.after===R.qInAct&&!R.setpieceDone.has(DEFS[x.use].id));
  }
  function maybeLaunch(){
    if(R.mode!=="trial"||R.setpiece)return false;
    const slot=TRIAL.find(x=>x.act===R.actIdx&&x.after===R.qInAct&&!R.setpieceDone.has(DEFS[x.use].id));
    if(!slot)return false;
    R.typed = false;
    document.body.classList.remove("mode-typed");
    return launch(DEFS[slot.use]);
  }

  /* Called once, when a site's verses are all answered. Returns false at
     every site that has no sequence, which is most of them — a finale at
     every stop would stop being a finale. */
  function wouldLaunchSite(){
    if(R.mode!=="pilgrimage"||R.setpiece)return false;
    const slot=SITES[R.siteId];
    if(!slot)return false;
    const base=DEFS[slot.use];
    return !R.setpieceDone.has(base.id);
  }
  function maybeLaunchSite(){
    if(!wouldLaunchSite())return false;
    const slot=SITES[R.siteId];
    const base=DEFS[slot.use];
    R.typed = false;
    document.body.classList.remove("mode-typed");
    return launch(base, {
      book:slot.book||null,
      code:slot.code||base.code,
      voice:slot.voice||base.voice
    });
  }

  function hasSite(siteId){ return !!SITES[siteId]; }
  function siteTitle(siteId){ return SITES[siteId] ? DEFS[SITES[siteId].use].title : ""; }
  /* What the site brief needs to say up front: which finale closes this
     stop and how many verses it adds, so the road is predictable. */
  function siteFinale(siteId){
    const slot=SITES[siteId];
    if(!slot) return null;
    const base=DEFS[slot.use];
    return { title:base.title, count:base.count };
  }
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
      // Never repeat a verse the site already used — if the book is
      // drained, fall back to the site pool (which also excludes used).
      const pool=poolSansRepeatRefs(VERSES.filter(x=>x.b===s.book&&!R.used.has(x.id)));
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
  function duration(base){return R.setpiece?Math.round(R.setpiece.duration*PACE+FLAT_ADD_MS):base}
  function bonus(){return R.setpiece&&R.setpiece.reward?R.setpiece.reward:1}
  function noPowers(){return !!(R.setpiece&&R.setpiece.noPowers)}
  function autoLock(){return !!(R.setpiece&&R.setpiece.auto)}
  function label(){return R.setpiece?R.setpiece.title:""}
  return {cleanup,wouldLaunch,wouldLaunchSite,maybeLaunch,maybeLaunchSite,hasSite,siteTitle,siteFinale,
          draw,duration,bonus,noPowers,autoLock,label};
})();

