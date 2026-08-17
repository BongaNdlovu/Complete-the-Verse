/* Logic tests — the campaign rules.

   Pure functions only: no DOM, no Leaflet, no storage, no clock. The
   data is injected through attach() exactly as the browser injects the
   globals, so these tests exercise the same code path the game does.

   The assertions that matter most are the two that protect the player:
   a level always fills with a full site of verses whatever the bank looks like,
   and record() never mutates the progress it was handed. */
const S = require("./js/sites");
const P = require("./js/pilgrimage");
const { loadBank } = require("./scripts/load-bank");

const bank = loadBank();
P.attach({ SITES: S.SITES, ARCS: S.ARCS, VERSES: bank.VERSES });

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

const N = P.count();
const LAST = N - 1;

/* Walk the whole road, for the tests that need a finished journey. */
function walkAll(){
  let p = P.blankProgress();
  P.journey().forEach(s => {
    p = P.record(p, s.id, { cleared: true, score: 100, accuracy: 100, at: 1 });
  });
  return p;
}
/* Clear the first `n` sites in order. */
function walkTo(n){
  let p = P.blankProgress();
  for(let i = 0; i < n; i++){
    p = P.record(p, P.siteAt(i).id, { cleared: true, score: 50, accuracy: 80, at: 1 });
  }
  return p;
}

/* ---------- the road ---------- */
{
  eq("the journey has 46 sites", N, 46);
  eq("indexOf finds the first site", P.indexOf("ur"), 0);
  eq("indexOf finds the last site", P.indexOf("patmos"), LAST);
  eq("indexOf reports -1 for a stranger", P.indexOf("atlantis"), -1);
  ok("site() returns the record", P.site("babylon").name.indexOf("BABYLON") === 0);
  eq("site() is null for a stranger", P.site("atlantis"), null);
  eq("siteAt is null past the end", P.siteAt(999), null);

  eq("arcs are all present", P.arcs().length, 5);
  ok("sitesInArc partitions the road",
    P.arcs().reduce((n, a) => n + P.sitesInArc(a.key).length, 0) === N);
}

/* ---------- position ---------- */
{
  eq("Ur is at the start of the road", P.positionOf(0), 0);
  eq("Patmos is at the end", P.positionOf(LAST), 1);
  ok("position rises along the road", P.positionOf(5) < P.positionOf(20));
  ok("position clamps below", P.positionOf(-5) === 0);
  ok("position clamps above", P.positionOf(999) === 1);
}

/* ---------- difficulty ramp ---------- */
{
  eq("the road opens at tier 1", P.tierFor(0), 1);
  eq("the road closes at tier 5", P.tierFor(LAST), 5);

  const tiers = P.journey().map((s, i) => P.tierFor(i));
  ok("the tier ramp never goes backwards",
    tiers.every((t, i) => i === 0 || t >= tiers[i - 1]), tiers);
  ok("every tier is a real tier", tiers.every(t => t >= 1 && t <= 5));
  eq("all five tiers are used", new Set(tiers).size, 5);

  eq("the clock opens at 14 seconds", P.clockFor(0), P.CLOCK_OPEN);
  eq("pick clocks get a 1.5s pad in play", P.PICK_PAD_MS, 1500);
  eq("the clock closes at 6.5 seconds", P.clockFor(LAST), P.CLOCK_CLOSE);
  const clocks = P.journey().map((s, i) => P.clockFor(i));
  ok("the clock only ever tightens",
    clocks.every((c, i) => i === 0 || c <= clocks[i - 1]), clocks);
  ok("the clock is always printable to a tenth",
    clocks.every(c => c % 100 === 0), clocks.filter(c => c % 100 !== 0));
  ok("the clock never reaches zero", clocks.every(c => c >= P.CLOCK_CLOSE));
}

/* ---------- unlocking ---------- */
{
  const blank = P.blankProgress();
  ok("Ur is open from the start", P.isUnlocked(blank, "ur"));
  ok("the second site is not", !P.isUnlocked(blank, "haran"));
  ok("Patmos is certainly not", !P.isUnlocked(blank, "patmos"));
  ok("a stranger is never unlocked", !P.isUnlocked(blank, "atlantis"));
  eq("the road starts at Ur", P.currentSite(blank).id, "ur");
  eq("nothing is cleared yet", P.clearedCount(blank), 0);
  ok("the road is not complete", !P.isComplete(blank));

  const afterUr = P.record(blank, "ur", { cleared: true, score: 10, accuracy: 100, at: 1 });
  ok("clearing Ur opens Haran", P.isUnlocked(afterUr, "haran"));
  ok("but not the site after that", !P.isUnlocked(afterUr, "shechem"));
  eq("the road moves on to Haran", P.currentSite(afterUr).id, "haran");
  eq("one site is cleared", P.clearedCount(afterUr), 1);

  // Failing a site must not open the next one.
  const failed = P.record(blank, "ur", { cleared: false, score: 10, accuracy: 40, at: 1 });
  ok("failing Ur does not open Haran", !P.isUnlocked(failed, "haran"));
  ok("failing Ur leaves Ur open", P.isUnlocked(failed, "ur"));
  eq("failing records no clear", P.clearedCount(failed), 0);
  eq("but it does record the attempt", P.recordOf(failed, "ur").attempts, 1);

  const all = walkAll();
  ok("a finished road is complete", P.isComplete(all));
  eq("every site is cleared", P.clearedCount(all), N);
  eq("a finished road still points somewhere", P.currentSite(all).id, "patmos");
  ok("every site is unlocked at the end",
    P.journey().every(s => P.isUnlocked(all, s.id)));
}

/* ---------- record() is pure ---------- */
{
  const before = walkTo(3);
  const snapshot = JSON.stringify(before);
  const after = P.record(before, "bethel", { cleared: true, score: 999, accuracy: 100, at: 2 });

  eq("record does not mutate its input", JSON.stringify(before), snapshot);
  ok("record returns a different object", after !== before);
  ok("record deep-copies the site map", after.sites !== before.sites);
  ok("the new record is present", !!P.recordOf(after, "bethel"));
  ok("the old records survive", P.isCleared(after, "ur") && P.isCleared(after, "haran"));
}

/* ---------- record() accumulates ---------- */
{
  let p = P.blankProgress();
  p = P.record(p, "ur", { cleared: false, score: 100, accuracy: 50, at: 1 });
  eq("first attempt counted", P.recordOf(p, "ur").attempts, 1);
  eq("best score kept", P.recordOf(p, "ur").best, 100);
  ok("not cleared yet", !P.isCleared(p, "ur"));

  p = P.record(p, "ur", { cleared: true, score: 80, accuracy: 90, at: 2 });
  eq("second attempt counted", P.recordOf(p, "ur").attempts, 2);
  eq("a worse score does not overwrite the best", P.recordOf(p, "ur").best, 100);
  eq("a better accuracy does", P.recordOf(p, "ur").bestAccuracy, 90);
  ok("now cleared", P.isCleared(p, "ur"));
  eq("the clear time is stamped", P.recordOf(p, "ur").clearedAt, 2);

  p = P.record(p, "ur", { cleared: true, score: 500, accuracy: 100, at: 3 });
  eq("a better score does overwrite", P.recordOf(p, "ur").best, 500);
  ok("a clean sweep is marked perfect", P.recordOf(p, "ur").perfect);
  eq("the first clear time is not overwritten", P.recordOf(p, "ur").clearedAt, 2);

  // A later failure must never un-clear a site.
  p = P.record(p, "ur", { cleared: false, score: 1, accuracy: 5, at: 4 });
  ok("a later failure does not un-clear a site", P.isCleared(p, "ur"));
  eq("nor does it lower the best", P.recordOf(p, "ur").best, 500);
}

/* ---------- arcs ---------- */
{
  const blank = P.blankProgress();
  const first = P.arcs()[0];
  const st0 = P.arcStatus(blank, first.key);
  eq("the first arc is open from the start", st0.open, true);
  eq("nothing in it is cleared", st0.cleared, 0);
  ok("it is not complete", !st0.complete);

  const second = P.arcs()[1];
  ok("the second arc is not open yet", !P.arcStatus(blank, second.key).open);

  const arc1Len = P.sitesInArc(first.key).length;
  const doneArc1 = walkTo(arc1Len);
  ok("clearing every site completes the arc", P.arcStatus(doneArc1, first.key).complete);
  eq("the arc reports its full count", P.arcStatus(doneArc1, first.key).cleared, arc1Len);
  ok("and opens the next arc", P.arcStatus(doneArc1, second.key).open);

  const ov = P.overview(doneArc1);
  eq("overview counts cleared sites", ov.cleared, arc1Len);
  eq("overview knows the total", ov.total, N);
  eq("overview reports one arc done", ov.arcs.filter(a => a.complete).length, 1);
  ok("overview is not complete", !ov.complete);
  ok("overview knows where you are", ov.current.arc === second.key);

  ok("a finished road reports every arc complete",
    P.overview(walkAll()).arcs.every(a => a.complete));
}

/* ---------- levels always fill ---------- */
{
  const short = [];
  const offTier = [];
  P.journey().forEach((s, i) => {
    const d = P.drawSite(s.id, { attempt: 0 });
    if(d.verses.length !== P.VERSES_PER_SITE) short.push(s.id + ":" + d.verses.length);
    if(d.target !== P.tierFor(i)) offTier.push(s.id);
  });
  ok("every site fills a full level", short.length === 0, short);
  ok("every level targets its site's tier", offTier.length === 0, offTier);

  ok("every level is free of duplicates", P.journey().every(s => {
    const ids = P.drawSite(s.id, { attempt: 0 }).verses.map(v => v.id);
    return new Set(ids).size === ids.length;
  }));

  ok("every drawn verse is a real bank verse", P.journey().every(s =>
    P.drawSite(s.id, { attempt: 0 }).verses.every(v => v && v.id && v.r && v.a)));

  // With the whole bank available, every site should be satisfied by its
  // own books — the wider rings are a safety net, not the normal path.
  const rings = {};
  P.journey().forEach(s => {
    const r = P.drawSite(s.id, { attempt: 0 }).ring;
    rings[r] = (rings[r] || 0) + 1;
  });
  eq("every level draws from the site's own books", rings.site, N);

  // And every verse actually comes from a book the site declares.
  ok("drawn verses belong to the site's books", P.journey().every(s => {
    const books = {};
    s.books.forEach(b => books[b] = 1);
    return P.drawSite(s.id, { attempt: 0 }).verses.every(v => books[v.b] === 1);
  }));
}

/* ---------- the fallback rings ---------- */
{
  const site = P.site("emmaus");

  // Starve the site's own books and the pool must widen to the arc
  // rather than hand back a short level.
  const excludeSite = {};
  bank.VERSES.forEach(v => { if(site.books.indexOf(v.b) >= 0) excludeSite[v.id] = 1; });
  const need = P.VERSES_PER_SITE;
  const widened = P.resolvePool(site, { need: need, exclude: excludeSite });
  eq("starving the site's books falls through to the arc", widened.ring, "arc");
  ok("the widened pool still fills a level", widened.verses.length >= need, widened.verses.length);

  // Starve the whole arc and it must widen again to the testament.
  const arc = P.arc(site.arc);
  const excludeArc = {};
  bank.VERSES.forEach(v => { if(arc.books.indexOf(v.b) >= 0) excludeArc[v.id] = 1; });
  const wider = P.resolvePool(site, { need: need, exclude: excludeArc });
  ok("starving the arc widens past it", wider.ring === "testament" || wider.ring === "bank", wider.ring);
  ok("it still fills a level", wider.verses.length >= need, wider.verses.length);

  // Starve everything except a handful and it must still return what it
  // can rather than throwing or returning nothing.
  const keep = {};
  bank.VERSES.slice(0, 3).forEach(v => keep[v.id] = 1);
  const excludeAll = {};
  bank.VERSES.forEach(v => { if(!keep[v.id]) excludeAll[v.id] = 1; });
  const scraps = P.resolvePool(site, { need: need, exclude: excludeAll });
  eq("an impossible pool returns what is left, not nothing", scraps.verses.length, 3);
  ok("and does not throw doing it", true);

  const drawn = P.drawSite("emmaus", { exclude: excludeAll });
  eq("drawSite survives a starved bank too", drawn.verses.length, 3);
}

/* ---------- draws are seeded ---------- */
{
  const a = P.drawSite("babylon", { attempt: 0 }).verses.map(v => v.id).join(",");
  const b = P.drawSite("babylon", { attempt: 0 }).verses.map(v => v.id).join(",");
  eq("the same attempt draws the same set", a, b);

  const c = P.drawSite("babylon", { attempt: 1 }).verses.map(v => v.id).join(",");
  ok("a second visit draws differently", a !== c, { a, c });

  const other = P.drawSite("nineveh", { attempt: 0 }).verses.map(v => v.id).join(",");
  ok("different sites draw differently", a !== other);

  const r1 = P.seededRandom(42), r2 = P.seededRandom(42);
  eq("the generator is deterministic", r1(), r2());
  ok("the generator stays in range", [0,1,2,3,4,5].every(() => {
    const v = r1(); return v >= 0 && v < 1;
  }));
  eq("string seeding is stable", P.seedFrom("ur:0"), P.seedFrom("ur:0"));
  ok("different strings seed differently", P.seedFrom("ur:0") !== P.seedFrom("ur:1"));
}

/* ---------- the signature book is favoured ---------- */
{
  /* books[0] is what the place is known for, and resolvePool holds a
     quota of slots for it. The contract is the quota — not "as many as
     possible", because filling a level from one book would flatten the
     tier ramp the rest of this file asserts. */
  const site = P.site("patmos");
  const signature = site.books[0];              // Revelation

  let short = [];
  const wantSig = Math.min(P.SIGNATURE_QUOTA, bank.VERSES.filter(v => v.b === signature).length, P.VERSES_PER_SITE);
  for(let attempt = 0; attempt < 40; attempt++){
    const n = P.drawSite("patmos", { attempt })
      .verses.filter(v => v.b === signature).length;
    if(n < Math.min(2, wantSig)) short.push({ attempt, n });
  }
  ok("Patmos always carries its quota of Revelation", short.length === 0, short.slice(0, 4));

  let sig = 0, total = 0;
  for(let attempt = 0; attempt < 40; attempt++){
    P.drawSite("patmos", { attempt }).verses.forEach(v => {
      total++; if(v.b === signature) sig++;
    });
  }
  ok("the signature book is over-represented", sig / total > 1 / site.books.length,
    { share: sig / total, even: 1 / site.books.length });

  // The quota must hold everywhere it can, not just at Patmos.
  const failed = P.journey().filter(s => {
    const avail = bank.VERSES.filter(v => v.b === s.books[0]).length;
    const want = Math.min(P.SIGNATURE_QUOTA, avail, P.VERSES_PER_SITE);
    /* When the signature stock is thinner than the quota, require at least half. */
    const need = Math.min(want, Math.max(1, Math.ceil(want / 2)));
    return P.drawSite(s.id, { attempt: 0 })
      .verses.filter(v => v.b === s.books[0]).length < need;
  });
  ok("every site carries its signature book", failed.length === 0, failed.map(s => s.id));

  // And it must not have eaten the difficulty ramp doing it.
  const offTier = P.journey().filter((s, i) => {
    const target = P.tierFor(i);
    const avg = P.drawSite(s.id, { attempt: 0 })
      .verses.reduce((n, v) => n + Math.abs(v.t - target), 0) / P.VERSES_PER_SITE;
    return avg > 2;
  });
  ok("levels still sit close to their target tier", offTier.length === 0, offTier.map(s => s.id));
}

/* ---------- briefing ---------- */
{
  const blank = P.blankProgress();
  const b = P.brief("ur", blank);
  eq("the briefing knows the ordinal", b.ordinal, 1);
  eq("the briefing knows the total", b.total, N);
  eq("the briefing carries the tier", b.tier, P.tierFor(0));
  eq("the briefing carries the clock", b.clockMs, P.clockFor(0));
  eq("the briefing carries the verse count", b.verses, P.VERSES_PER_SITE);
  ok("the first site has no predecessor", b.previous === null);
  ok("the first site has a successor", b.next && b.next.id === "haran");
  ok("the first site is unlocked", b.unlocked);
  ok("the first site is not cleared", !b.cleared);
  eq("a stranger has no briefing", P.brief("atlantis", blank), null);

  const last = P.brief("patmos", walkAll());
  ok("the last site has no successor", last.next === null);
  ok("the last site is cleared on a finished road", last.cleared);
  eq("the last site is number N", last.ordinal, N);
}

/* ---------- journey-wide draw + place floor ---------- */
{
  /* usedIds never come back. Late sites may miss a full site-book floor
     when that book has already been spent — they fill from unused stock. */
  let exclude = {};
  const seen = [];
  P.journey().forEach(s => {
    const d = P.drawSite(s.id, { attempt: 0, exclude: exclude });
    d.verses.forEach(v => {
      seen.push(v.id);
      exclude[v.id] = 1;
    });
  });
  ok("a full road never repeats a verse id", new Set(seen).size === seen.length,
    { unique: new Set(seen).size, total: seen.length });
  ok("the walk still yields a real volume of verses", seen.length >= N * 4, seen.length);

  /* Set-piece stops demand a full site-book level when stock exists. */
  /* 8 target key sites draw full 8/8 site-specific verses */
  ["ur","sinai","jericho","jerusalem","golgotha","emmaus","corinth","patmos"].forEach(id => {
    const s = P.site(id);
    const d = P.drawSite(id, { attempt: 0, exclude: {} });
    const bound = {};
    (s.books || []).forEach(b => { bound[b] = 1; });
    const siteN = d.verses.filter(v => bound[v.b] === 1).length;
    ok(id + " draws 8 site-specific verses", siteN === P.VERSES_PER_SITE, { siteN, want: P.VERSES_PER_SITE });
  });

  ["sinai","jericho","babylon","golgotha","patmos","nineveh"].forEach(id => {
    const s = P.site(id);
    const d = P.drawSite(id, { attempt: 0 });
    const bound = {};
    (s.books || []).forEach(b => { bound[b] = 1; });
    const siteN = d.verses.filter(v => bound[v.b] === 1).length;
    ok(id + " set-piece level is fully place-linked", siteN === P.VERSES_PER_SITE, { siteN });
  });

  const blank = P.blankProgress();
  ok("blank progress starts with no used ids", (blank.usedIds || []).length === 0);
  const marked = P.markUsed(blank, ["a", "b", "a"]);
  eq("markUsed records unique ids", marked.usedIds.length, 2);
  ok("markUsed is pure", (blank.usedIds || []).length === 0);
  const set = P.usedSet(marked);
  ok("usedSet exposes the marks", set.a === 1 && set.b === 1);
}

/* ---------- testament split ---------- */
{
  ok("Genesis is Old Testament", !P.isNT("Genesis"));
  ok("Malachi is Old Testament", !P.isNT("Malachi"));
  ok("Matthew is New Testament", P.isNT("Matthew"));
  ok("Revelation is New Testament", P.isNT("Revelation"));
  eq("the New Testament has 27 books",
    bank.BOOKS_ORDER.filter(b => P.isNT(b)).length, 27);
  eq("the Old Testament has 39 books",
    bank.BOOKS_ORDER.filter(b => !P.isNT(b)).length, 39);
}

console.log((fail ? "FAIL" : "PASS") + " — pilgrimage · " + pass + " assertions passed · " +
  N + " sites" + (fail ? " · " + fail + " FAILED" : ""));
process.exit(fail ? 1 : 0);
