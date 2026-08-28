/* ==================================================================
   UTIL — shared helpers every engine module may use, including at
   parse time (listener wiring). References nothing outside this file.
   Loaded before all other engine files.
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
/* 33 references appear twice in the bank (two blanks on one verse). Ids
   protect nothing there, so every draw path also excludes by reference —
   the same verse must never surface twice in one run. */
const refKey = v => String(v && v.r || "").toLowerCase();
function poolSansRepeatRefs(pool){
  const seen = new Set();
  const out = [];
  for(let i=0;i<pool.length;i++){
    const k = refKey(pool[i]);
    if(R.usedRefs.has(k) || seen.has(k)) continue;
    seen.add(k);
    out.push(pool[i]);
  }
  return out.length ? out : pool;
}