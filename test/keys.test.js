/* Keyboard parity: the whole game answers to keys, not just tablets.
 * Boots the shipped engine in the DOM shim and drives the real key
 * routers (handlePlayMechanicKeys / handlePlayKeydown / handleNavKeydown)
 * with fake events — no test doubles of the routing itself. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");
const { makeSandbox } = require("../scripts/test-shim");
const { ENGINE_FILES } = require("../scripts/engine-source");

const PREFIX = [
  "js/verses.js", "js/verses-extra.js", "js/passages.js", "js/legacy-ids.js",
  "js/bank.js", "js/srs.js", "js/recall.js", "js/assemble.js", "js/meta.js",
  "js/flow.js", "js/sites.js", "js/empires.js", "js/geo.js", "js/pilgrimage.js",
  "js/live.js", "js/atlas.js"
];
function boot() {
  const sb = makeSandbox();
  const src = PREFIX.concat(ENGINE_FILES)
    .map(f => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n");
  vm.runInContext(src, sb, { filename: "keys.js" });
  return sb;
}
function exec(sb, code) { return vm.runInContext(code, sb); }
function read(sb, expr) { return vm.runInContext(expr, sb); }
function ev(sb) { return read(sb, "({preventDefault:function(){}})"); }

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "")); }
}

/* ---------- cloze: 1-9 taps a live chip, Backspace unfills ---------- */
{
  const sb = boot();
  exec(sb, "startRun('practice','watchman')");
  exec(sb, `R.q = {id:"keys-cloze",b:"Genesis",r:"Genesis 1:1",t:1,p:"In the beginning",a:"God created",s:".",d:["the Word formed","light and land"]};
    Object.assign(R,{locked:false,running:true,paused:false,attempts:0,correct:0,missed:[],rescheduled:[],lives:2,powers:{selah:1,illum:1,wind:0}});
    renderClozeQuestion(R.q, 30000);`);
  ok("cloze exposes a key picker", read(sb, "typeof R.cloze.pickByIndex === 'function'"));
  sb.__ev = ev(sb);
  exec(sb, "handlePlayMechanicKeys(__ev, '1')");
  ok("key 1 fills one cloze word", read(sb, "R.cloze.filled.length") === 1);
  exec(sb, "handlePlayMechanicKeys(__ev, 'backspace')");
  ok("Backspace unfills the word", read(sb, "R.cloze.filled.length") === 0);
  exec(sb, "handlePlayMechanicKeys(__ev, '9')");
  ok("an out-of-range key fills nothing", read(sb, "R.cloze.filled.length") === 0);
  ok("cloze keeps S/I as powers", read(sb, "handlePlayMechanicKeys({preventDefault:function(){}}, 's')") === false);
}

/* ---------- fade: memorize swallows choices, D ends it early ---------- */
{
  const sb = boot();
  exec(sb, "startRun('practice','watchman')");
  exec(sb, `R.q = {id:"keys-fade",b:"Genesis",r:"Genesis 1:2",t:1,p:"And the earth was",a:"without form",s:".",d:["void and dark"]};
    Object.assign(R,{siteIdx:6,locked:false,running:true,paused:false,attempts:0,correct:0,missed:[],rescheduled:[],lives:2,powers:{selah:1,illum:1,wind:0}});
    (function(){var o=$("opts");o.className="answers";o.innerHTML="";var b=document.createElement("button");b.className="ans";b.dataset.val="stale";b.addEventListener("click",function(){R.__staleClicked=true;});o.appendChild(b);})();
    renderFadeQuestion(R.q, 60000, 99);`);
  ok("fade opens in memorize", read(sb, "R.fadePhase") === "memorize");
  sb.__ev = ev(sb);
  exec(sb, "handlePlayKeydown(__ev, '1')");
  ok("a number key cannot answer the unseen verse", !read(sb, "R.__staleClicked") && read(sb, "R.selected") == null);
  exec(sb, "handlePlayKeydown(__ev, 'd')");
  ok("D ends memorizing early", read(sb, "R.fadePhase") === "dissolve");
  exec(sb, "handlePlayKeydown(__ev, '1')");
  ok("dissolve swallows choices too", !read(sb, "R.__staleClicked"));
}

/* ---------- results: N follows Next/Continue ---------- */
{
  const sb = boot();
  exec(sb, "startRun('practice','watchman')");
  exec(sb, `currentView="results"; __nextClicked=false;
    (function(){var b=$("res-next");b.style.display="";b.addEventListener("click",function(){__nextClicked=true;});})();`);
  sb.__ev = ev(sb);
  exec(sb, "handleNavKeydown(__ev, 'n')");
  ok("N clicks Next when shown", read(sb, "__nextClicked") === true);
  exec(sb, `(function(){__nextClicked=false;var b=$("res-next");b.style.display="none";})();`);
  exec(sb, "handleNavKeydown(__ev, 'n')");
  ok("N does nothing when Next is hidden", read(sb, "__nextClicked") === false);
}

/* ---------- pause: R resumes, Q quits, others are swallowed ---------- */
{
  const sb = boot();
  exec(sb, "startRun('practice','watchman')");
  exec(sb, `currentView="play"; R.paused=true;
    var __resumed=false, __quit=false;
    togglePause=function(){__resumed=true;}; quitPlay=function(){__quit=true;};`);
  sb.__ev = ev(sb);
  exec(sb, "handleNavKeydown(__ev, 'r')");
  ok("R resumes a paused run", read(sb, "__resumed") === true);
  exec(sb, "handleNavKeydown(__ev, 'q')");
  ok("Q quits a paused run", read(sb, "__quit") === true);
  exec(sb, "R.paused=false;");
  ok("unpaused keys fall through", read(sb, "handleNavKeydown({preventDefault:function(){}}, 'r')") === false);
}

/* ---------- brief diffs + atlas jump never throw ---------- */
{
  const sb = boot();
  exec(sb, "startRun('practice','watchman')");
  exec(sb, `currentView="brief";`);
  sb.__ev = ev(sb);
  let threw = false;
  try { exec(sb, "handleNavKeydown(__ev, '1')"); } catch (e) { threw = true; }
  ok("brief diff keys never throw without pills", !threw);
  exec(sb, `currentView="atlas";`);
  threw = false;
  try { exec(sb, "handleNavKeydown(__ev, 'c')"); } catch (e) { threw = true; }
  ok("atlas jump never throws without a map", !threw);
}

if (fail) {
  console.log("FAIL — keys · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — keys · " + pass + " assertions");
