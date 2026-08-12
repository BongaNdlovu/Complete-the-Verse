/* Characters — scholars free, biblical figures unlock as skins. */
const S = require("./js/sites");
const P = require("./js/pilgrimage");
const Cmod = require("./js/characters");
const { loadBank } = require("./scripts/load-bank");

const bank = loadBank();
P.attach({ SITES: S.SITES, ARCS: S.ARCS, VERSES: bank.VERSES });

const SCHOLARS = Cmod.SCHOLARS;
const FIGURES = Cmod.BIBLE_FIGURES;
const Characters = Cmod.Characters;
Characters.attach(P);

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

function walkArc(key){
  let p = P.blankProgress();
  // clear all prior arcs too so isUnlocked on later arcs is honest
  const order = ["patriarchs","exodus","kingdom","gospel"];
  for(const k of order){
    P.sitesInArc(k).forEach(s => {
      p = P.record(p, s.id, { cleared: true, score: 50, accuracy: 90, at: 1 });
    });
    if(k === key) break;
  }
  return p;
}
function walkAll(){
  let p = P.blankProgress();
  P.journey().forEach(s => {
    p = P.record(p, s.id, { cleared: true, score: 50, accuracy: 90, at: 1 });
  });
  return p;
}
function walkSites(n){
  let p = P.blankProgress();
  for(let i = 0; i < n; i++){
    p = P.record(p, P.siteAt(i).id, { cleared: true, score: 50, accuracy: 90, at: 1 });
  }
  return p;
}
function unlocked(ch, progress){
  return Characters.isUnlocked(ch, progress);
}

eq("eight scholars ship", SCHOLARS.length, 8);
eq("six biblical figures ship", FIGURES.length, 6);
eq("combined roster is 14", Characters.all().length, 14);

{
  const f = SCHOLARS.filter(c => c.gender === "f").length;
  const m = SCHOLARS.filter(c => c.gender === "m").length;
  eq("four female scholars", f, 4);
  eq("four male scholars", m, 4);
  const nats = new Set(SCHOLARS.map(c => c.nationality));
  eq("eight distinct nationalities", nats.size, 8);
}

{
  const blank = P.blankProgress();
  ok("all scholars free at start", SCHOLARS.every(ch => unlocked(ch, blank)));
  ok("no biblical figure free at start", FIGURES.every(ch => !unlocked(ch, blank)));
  eq("default id is a scholar", Characters.defaultId(), "amina");
  ok("resolve falls back to scholar", Characters.resolve("john", blank).kind === "scholar");
}

{
  const p1 = walkArc("patriarchs");
  ok("Abram unlocks after Patriarchs", unlocked(FIGURES.find(c => c.id === "abram"), p1));
  ok("Moses still locked after Patriarchs", !unlocked(FIGURES.find(c => c.id === "moses"), p1));
}

{
  const p2 = walkArc("exodus");
  ok("Moses unlocks after Exodus", unlocked(FIGURES.find(c => c.id === "moses"), p2));
}

{
  const p3 = walkArc("kingdom");
  ok("David unlocks after Kingdom", unlocked(FIGURES.find(c => c.id === "david"), p3));
}

{
  const p = walkSites(18);
  ok("Esther unlocks at 18 sites", unlocked(FIGURES.find(c => c.id === "esther"), p));
  const early = walkSites(17);
  ok("Esther locked at 17 sites", !unlocked(FIGURES.find(c => c.id === "esther"), early));
}

{
  const p4 = walkArc("gospel");
  ok("Peter unlocks after Gospel arc", unlocked(FIGURES.find(c => c.id === "peter"), p4));
  // gospel complete is full road if all arcs walked in walkArc('gospel')
  ok("John unlocks when road complete", unlocked(FIGURES.find(c => c.id === "john"), p4));
}

{
  const before = walkSites(6); // end of patriarchs is 7 sites
  const after = walkArc("patriarchs");
  const newly = Characters.newlyUnlockedFigures(before, after);
  ok("newlyUnlockedFigures reports Abram after Patriarchs",
    newly.some(c => c.id === "abram"), newly.map(c => c.id));
}

FIGURES.concat(SCHOLARS).forEach(ch => {
  ok(ch.id + " has portrait path", !!ch.portrait && ch.portrait.indexOf(ch.id) >= 0);
  ok(ch.id + " has token path", !!ch.token && ch.token.indexOf(ch.id) >= 0);
});

if(fail){ console.log("FAIL — characters · " + pass + " passed · " + fail + " failed"); process.exit(1); }
console.log("PASS — characters · " + pass + " assertions");
