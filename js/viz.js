/* ==================================================================
   VIZ — the spectrum canvas under the answer row.

   Split out of game.js along its natural seams. Classic script:
   defines one global (no module system), executed before game.js,
   referenced from it at RUNTIME only — nothing here may touch a
   game.js binding while this file parses.
   ================================================================== */

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

