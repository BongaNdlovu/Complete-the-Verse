/* ==================================================================
   UTIL — shared helpers every engine module may use, including at
   parse time (listener wiring). References nothing outside this file.
   Loaded before all other engine files.
   ================================================================== */

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
/* After a code or link goes out, keeps its send button off for `ms`, counting down on the label. A resend is a
   second email, and the hosted project only allows a few an hour. */
function holdButton(btn, ms){
  if(!btn) return;
  /* A second hold on a button already holding restarts the count and keeps the real label. */
  clearTimeout(btn._holdTimer);
  if(btn._holdLabel === undefined) btn._holdLabel = btn.textContent;
  const label = btn._holdLabel;
  const until = Date.now() + ms;
  btn.disabled = true;
  const tick = function(){
    const left = Math.ceil((until - Date.now()) / 1000);
    if(left <= 0){
      btn.textContent = label;
      btn.disabled = false;
      btn._holdLabel = undefined;
      return;
    }
    btn.textContent = label + " (" + left + "s)";
    btn._holdTimer = setTimeout(tick, 1000);
  };
  tick();
}
const sep = s => /^[.,;:!?]/.test(s) ? "" : " ";
const fullVerse = v => v.p + " " + v.a + sep(v.s) + v.s;
function shuffle(a, rnd){ a = a.slice(); const r = rnd || Math.random;
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function mulberry32(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0;
  let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
  return ((t^t>>>14)>>>0)/4294967296; }; }
function todayKey(d){ d=d||new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
/* Shift a YYYY-MM-DD local key by whole days (negative goes back).
   Pure date math on the key itself — no clock reads. */
function offsetDateKey(dateKey, days){
  const p = String(dateKey||"").split("-").map(Number);
  const d = new Date(p[0]||1970, (p[1]||1)-1, p[2]||1);
  d.setDate(d.getDate() + (days|0));
  const pad = n => (n<10?"0":"")+n;
  return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
}
function seedFromString(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
const fmt = n => Math.round(n).toLocaleString();
/* 33 references appear twice in the bank (two blanks on one verse). Ids
   protect nothing there, so every draw path also excludes by reference —
   the same verse must never surface twice in one run. */
const refKey = v => String(v && v.r || "").toLowerCase();
function poolSansRepeatRefs(pool, usedRefs){
  const seen = new Set();
  const out = [];
  for(let i=0;i<pool.length;i++){
    const k = refKey(pool[i]);
    if(usedRefs.has(k) || seen.has(k)) continue;
    seen.add(k);
    out.push(pool[i]);
  }
  return out.length ? out : pool;
}
function runningInStandaloneApp(){
  try { return location.hostname === "appassets.androidplatform.net"; }
  catch (e) { return false; }
}
function jsDialogsWork(){
  /* Android WebView returns false from window.confirm with no dialog
     unless onJsConfirm is wired. The standalone APK uses in-UI confirm. */
  if (runningInStandaloneApp()) return false;
  try {
    return !(typeof navigator !== "undefined" && navigator.userAgent && /\bwv\b/.test(navigator.userAgent));
  } catch (e) { return true; }
}
function standaloneAppBridge(){
  try {
    return (typeof window !== "undefined" && window.CtvApp && typeof window.CtvApp.quit === "function")
      ? window.CtvApp : null;
  } catch (e) { return null; }
}
function quitStandaloneApp(){
  const bridge = standaloneAppBridge();
  if (!bridge && !runningInStandaloneApp()) return;
  if (typeof confirm === "function" && !confirm("Close Complete the Verse?")) return;
  if (typeof Snd !== "undefined" && Snd.ui) Snd.ui();
  if (bridge) bridge.quit();
}
function revealStandaloneChrome(){
  const btn = $("menu-quit-app");
  if (!btn) return;
  if (runningInStandaloneApp() || standaloneAppBridge()) btn.hidden = false;
}

if (typeof window !== "undefined") {
  window.$ = $;
  window.esc = esc;
  window.holdButton = holdButton;
  window.sep = sep;
  window.fullVerse = fullVerse;
  window.shuffle = shuffle;
  window.mulberry32 = mulberry32;
  window.todayKey = todayKey;
  window.offsetDateKey = offsetDateKey;
  window.seedFromString = seedFromString;
  window.fmt = fmt;
  window.refKey = refKey;
  window.poolSansRepeatRefs = poolSansRepeatRefs;
  window.runningInStandaloneApp = runningInStandaloneApp;
  window.jsDialogsWork = jsDialogsWork;
  window.quitStandaloneApp = quitStandaloneApp;
  window.revealStandaloneChrome = revealStandaloneChrome;
}
