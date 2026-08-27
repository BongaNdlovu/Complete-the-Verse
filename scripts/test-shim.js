/* ==================================================================
   TEST SHIM — the smallest DOM that game.js will boot against.

   Extracted from integration.test.js so every suite that needs to boot
   the engine (integration, engine-modules) shares one shim. Keep it in
   lockstep with what game.js touches at parse time: elements with
   classList/style/dataset, a localStorage map, no-op timers, no audio,
   no fetch. If game.js grows a new parse-time dependency, it belongs
   here — the parse-contract suite will fail until it is.
   ================================================================== */

function makeElement(id){
  const el = {
    id, tagName:"DIV", textContent:"", value:"", disabled:false, open:false,
    checked:false, offsetWidth:1, children:[], options:[], dataset:{},
    style:new Proxy({}, {get:(t,k)=> k==="setProperty" ? ()=>{} : (t[k]||""), set:(t,k,v)=>{t[k]=v;return true;}}),
    // Real DOMTokenList is iterable and game.js spreads it, so the shim
    // has to be too.
    classList:{
      _s:new Set(),
      add(...c){ c.forEach(x=>this._s.add(x)); }, remove(...c){ c.forEach(x=>this._s.delete(x)); },
      toggle(c,f){ const on = f===undefined ? !this._s.has(c) : !!f; on?this._s.add(c):this._s.delete(c); return on; },
      contains(c){ return this._s.has(c); },
      get length(){ return this._s.size; },
      item(i){ return [...this._s][i]; },
      [Symbol.iterator](){ return this._s.values(); }
    },
    _className:"",
    _handlers:{},
    addEventListener(t,fn){ (this._handlers[t]=this._handlers[t]||[]).push(fn); },
    removeEventListener(){},
    dispatch(t,ev){ (this._handlers[t]||[]).forEach(fn=>fn(ev||{preventDefault(){}})); },
    appendChild(c){ this.children.push(c); return c; },
    querySelector(){ return makeElement("q"); },
    querySelectorAll(){ return []; },
    closest(){ return null; },
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    focus(){}, blur(){}, click(){ this.dispatch("click"); },
    animate(){ return {cancel(){}, finish(){}, onfinish:null, finished:Promise.resolve()}; },
    scrollIntoView(){}, insertAdjacentHTML(){}, remove(){},
    getBoundingClientRect(){ return {width:100,height:100,top:0,left:0}; }
  };
  Object.defineProperty(el, "innerHTML", {
    get(){ return this._html || ""; },
    set(v){
      this._html = String(v || "");
      if(!this._html) this.children = [];
    }
  });
  Object.defineProperty(el, "className", {
    get(){ return this._className || [...this.classList._s].join(" "); },
    set(v){
      this._className = String(v || "");
      this.classList._s.clear();
      this._className.split(/\s+/).filter(Boolean).forEach(x => this.classList._s.add(x));
    }
  });
  return el;
}

function makeSandbox(){
  const els = {};
  const el = id => els[id] || (els[id] = makeElement(id));
  const body = makeElement("body");
  const doc = {
    body, hidden:false,
    getElementById:id => {
      if (els[id]) return els[id];
      for (const k in els) {
        if (els[k] && els[k].id === id) return els[k];
      }
      return el(id);
    },
    createElement:tag => {
      const e = makeElement("new");
      e.tagName = String(tag).toUpperCase();
      let _id = "new";
      Object.defineProperty(e, "id", {
        get(){ return _id; },
        set(v){ _id = v; if(v) els[v] = e; }
      });
      return e;
    },
    querySelector:() => makeElement("q"),
    querySelectorAll:() => [],
    addEventListener(){}, removeEventListener(){},
    activeElement:{tagName:"BODY"}
  };
  // No Web Audio available. game.js already handles this (Snd.init catches
  // and sets avail=false), which is the same path a browser takes when the
  // context cannot be created — so this exercises a real code path rather
  // than faking one.
  const noAudio = function(){ throw new Error("no audio device"); };
  const sandbox = {
    console, Date, Math, JSON, String, Number, Array, Object, Set, Map, Boolean, Error,
    isFinite, isNaN, parseInt, parseFloat, Infinity, NaN, Promise, RegExp,
    document: doc, window: null,
    localStorage:(() => { let s={}; return {
      getItem:k => (k in s ? s[k] : null), setItem:(k,v) => { s[k]=String(v); },
      removeItem:k => { delete s[k]; }, clear:() => { s={}; }, _dump:() => s, _load:o => { s=o; }
    }; })(),
    performance:{ now:() => Date.now() },
    requestAnimationFrame:() => 0, cancelAnimationFrame(){},
    setTimeout:() => 0, clearTimeout(){}, setInterval:() => 0, clearInterval(){},
    addEventListener(){}, removeEventListener(){},
    matchMedia:() => ({matches:false, addEventListener(){}}),
    navigator:{ share:null, clipboard:null, userAgent:"node" },
    Audio: function(){ return { play:() => Promise.resolve(), pause(){}, cloneNode(){ return this; },
      addEventListener(){}, volume:0, currentTime:0, loop:false }; },
    AudioContext: noAudio, webkitAudioContext: noAudio,
    speechSynthesis:{ getVoices:() => [], speak(){}, cancel(){} },
    SpeechSynthesisUtterance: function(){ return {}; },
    confirm:() => true, alert(){},
    _els: els
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  const vm = require("vm");
  vm.createContext(sandbox);
  return sandbox;
}

module.exports = { makeElement, makeSandbox };
