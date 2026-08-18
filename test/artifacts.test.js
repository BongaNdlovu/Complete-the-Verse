/* Artifacts — one per site, unlock on first clear, pure helpers. */
const S = require("../js/sites");
const P = require("../js/pilgrimage");
const Amod = require("../js/artifacts");
const { loadBank } = require("../scripts/load-bank");

const bank = loadBank();
P.attach({ SITES: S.SITES, ARCS: S.ARCS, VERSES: bank.VERSES });
const Artifacts = Amod.Artifacts;
const ARTIFACTS = Amod.ARTIFACTS;

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

eq("one artifact per site", Artifacts.count(), P.count());
eq("data table matches count", ARTIFACTS.length, P.count());

{
  const ids = new Set(ARTIFACTS.map(a => a.id));
  eq("artifact ids are unique", ids.size, ARTIFACTS.length);
  const sites = new Set(ARTIFACTS.map(a => a.siteId));
  eq("one artifact per distinct site", sites.size, ARTIFACTS.length);
}

P.journey().forEach(s => {
  const a = Artifacts.forSite(s.id);
  ok(s.id + " has an artifact", !!a);
  if(a){
    ok(s.id + " artifact has name", !!a.name);
    ok(s.id + " artifact has blurb", !!a.blurb);
    ok(s.id + " artifact has scripture", !!a.scripture);
    ok(s.id + " artifact has find/provenance", !!a.find);
  }
});

{
  const blank = Artifacts.blankProgress();
  eq("blank has no unlocks", Artifacts.unlockedCount(blank), 0);
  const first = Artifacts.unlockForSite(blank, "ur", 100);
  ok("first clear unlocks Ur relic", first.firstUnlock);
  eq("store records the unlock", !!first.store.unlocked[first.artifact.id], true);
  eq("unlocked count is 1", Artifacts.unlockedCount(first.store), 1);
  const again = Artifacts.unlockForSite(first.store, "ur", 200);
  ok("second clear is not a first unlock", !again.firstUnlock);
  eq("still one unlock", Artifacts.unlockedCount(again.store), 1);
}

{
  let store = Artifacts.blankProgress();
  P.journey().forEach(s => {
    const u = Artifacts.unlockForSite(store, s.id, 1);
    store = u.store;
  });
  eq("full road unlocks every relic", Artifacts.unlockedCount(store), Artifacts.count());
}

{
  const a = Artifacts.forSite("sinai");
  ok("Sinai is in the illustrated ship set", a && a.hasArt);
  ok("Sinai image path is set", !!Artifacts.imagePath(a));
  const plain = Artifacts.forSite("haran");
  ok("Haran is illustrated with the full set", plain && plain.hasArt);
  ok("Haran image path is set", !!Artifacts.imagePath(plain));
}

{
  let store = Artifacts.blankProgress();
  const u = Artifacts.unlockForSite(store, "babylon", 1);
  store = u.store;
  ok("unseen list includes new unlock", Artifacts.unseenUnlocks(store).some(x => x.id === u.artifact.id));
  store = Artifacts.markSeen(store, u.artifact.id);
  ok("markSeen clears unseen", Artifacts.unseenUnlocks(store).length === 0);
}

{
  const snap = Artifacts.blankProgress();
  const before = JSON.stringify(snap);
  Artifacts.unlockForSite(snap, "patmos", 1);
  eq("unlockForSite is pure on input", JSON.stringify(snap), before);
}

const shipArt = ARTIFACTS.filter(a => a.hasArt);
eq("every relic is illustrated", shipArt.length, ARTIFACTS.length);

{
  const Meta = require("../js/meta");
  const gated = ARTIFACTS.filter(a => a.requiresRank);
  ok("some relics are veiled behind a rank", gated.length >= 3);
  gated.forEach(a => {
    ok(a.id + " is veiled at rank 1", !Meta.relicUnveiled(a, 1));
    ok(a.id + " unveils at its rank", Meta.relicUnveiled(a, a.requiresRank));
  });
}

if(fail){ console.log("FAIL — artifacts · " + pass + " passed · " + fail + " failed"); process.exit(1); }
console.log("PASS — artifacts · " + pass + " assertions · relics=" + Artifacts.count() + " · art=" + shipArt.length);
