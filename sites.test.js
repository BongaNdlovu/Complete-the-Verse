/* Data tests — the road itself.

   sites.js is hand-authored data, which is exactly the kind of thing
   that rots quietly: a typo in a coordinate puts Nineveh in the sea, a
   book name that does not match BOOKS_ORDER silently narrows a level's
   verse pool to nothing, a duplicate id makes one site unreachable.
   None of that throws — it just makes the game slightly wrong forever.
   So it is asserted here. */
const S = require("./js/sites");
const E = require("./js/empires");
const Geo = require("./js/geo");
const { loadBank } = require("./scripts/load-bank");

const bank = loadBank();
const BOOKS = {};
bank.BOOKS_ORDER.forEach(b => BOOKS[b] = 1);
const HAS_VERSES = {};
bank.VERSES.forEach(v => HAS_VERSES[v.b] = (HAS_VERSES[v.b] || 0) + 1);

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }

/* ---------- shape ---------- */
{
  eq("the road has 46 sites", S.SITES.length, 46);
  eq("the road has 5 arcs", S.ARCS.length, 5);
  eq("it begins at Ur", S.SITES[0].id, "ur");
  eq("it ends at Patmos", S.SITES[S.SITES.length - 1].id, "patmos");

  const ids = S.SITES.map(s => s.id);
  eq("every site id is unique", new Set(ids).size, ids.length);
  ok("every id is a usable slug", ids.every(i => /^[a-z0-9-]+$/.test(i)),
    ids.filter(i => !/^[a-z0-9-]+$/.test(i)));

  const arcKeys = S.ARCS.map(a => a.key);
  eq("every arc key is unique", new Set(arcKeys).size, arcKeys.length);
}

/* ---------- required fields ---------- */
{
  const REQUIRED = ["id", "arc", "name", "tag", "coords", "elevation", "modernCountry",
                    "scripture", "quote", "quoteRef", "era", "empire", "archaeology",
                    "region", "place", "description", "context", "books", "climate"];
  const missing = [];
  S.SITES.forEach(s => REQUIRED.forEach(f => {
    if(s[f] === undefined || s[f] === null || s[f] === "") missing.push(s.id + "." + f);
  }));
  ok("no site is missing a field", missing.length === 0, missing.slice(0, 8));

  ok("every description is a real sentence",
    S.SITES.every(s => s.description.length > 60),
    S.SITES.filter(s => s.description.length <= 60).map(s => s.id));
  ok("every quote is a real quotation",
    S.SITES.every(s => s.quote.length > 20),
    S.SITES.filter(s => s.quote.length <= 20).map(s => s.id));

  /* Every quoteRef must name a book the game knows. The one wrinkle is
     the Psalms: the bank itself stores b:"Psalms" but cites r:"Psalm
     23:1", because that is how a single psalm is actually referenced in
     English. sites.js follows the same convention, so the test has to
     know about it rather than treat it as a typo. */
  const bookOfRef = ref => {
    const b = ref.replace(/\s+\d+:.*$/, "").trim();
    return b === "Psalm" ? "Psalms" : b;
  };
  const badRef = S.SITES.filter(s => !BOOKS[bookOfRef(s.quoteRef)]);
  ok("every quote cites a real book", badRef.length === 0,
    badRef.map(s => s.id + " -> " + s.quoteRef));

  // And the cited book should be one the site actually draws from.
  const offBook = S.SITES.filter(s => s.books.indexOf(bookOfRef(s.quoteRef)) < 0);
  ok("every quote comes from a book the site is bound to", offBook.length === 0,
    offBook.map(s => s.id + ": " + bookOfRef(s.quoteRef) + " not in " + s.books.join("/")));
}

/* ---------- geography ---------- */
{
  ok("every coordinate is a lat/lng pair",
    S.SITES.every(s => Array.isArray(s.coords) && s.coords.length === 2 &&
      Number.isFinite(s.coords[0]) && Number.isFinite(s.coords[1])));

  ok("every site is inside the biblical world",
    S.SITES.every(s => s.coords[0] > 20 && s.coords[0] < 55 &&
                       s.coords[1] > -12 && s.coords[1] < 60),
    S.SITES.filter(s => !(s.coords[0] > 20 && s.coords[0] < 55 &&
                          s.coords[1] > -12 && s.coords[1] < 60)).map(s => s.id));

  // Two sites on the same pin would be indistinguishable on the map.
  const clashes = [];
  for(let i = 0; i < S.SITES.length; i++){
    for(let j = i + 1; j < S.SITES.length; j++){
      const d = Geo.haversineKm(S.SITES[i].coords, S.SITES[j].coords);
      if(d < 0.3) clashes.push(S.SITES[i].id + "/" + S.SITES[j].id);
    }
  }
  ok("no two sites share a point", clashes.length === 0, clashes);

  // Jerusalem appears twice by design — the Temple Mount and Golgotha —
  // and they must be near each other but genuinely distinct.
  const zion = S.SITES.find(s => s.id === "jerusalem");
  const golg = S.SITES.find(s => s.id === "golgotha");
  const apart = Geo.haversineKm(zion.coords, golg.coords);
  ok("Zion and Golgotha are distinct points", apart > 0.3, apart);
  ok("Zion and Golgotha are in the same city", apart < 2, apart);

  const moriah = S.SITES.find(s => s.id === "moriah");
  const fromZion = Geo.haversineKm(zion.coords, moriah.coords);
  const fromGolg = Geo.haversineKm(golg.coords, moriah.coords);
  ok("Moriah is distinct from Zion", fromZion > 0.3, fromZion);
  ok("Moriah is distinct from Golgotha", fromGolg > 0.3, fromGolg);
  ok("Moriah is still on the Jerusalem ridge", fromZion < 3, fromZion);

  ok("elevations are plausible",
    S.SITES.every(s => s.elevation > -450 && s.elevation < 3000),
    S.SITES.filter(s => !(s.elevation > -450 && s.elevation < 3000)).map(s => s.id + ":" + s.elevation));

  // The two extremes of the journey are real and worth pinning.
  const sinai = S.SITES.find(s => s.id === "sinai");
  const jordan = S.SITES.find(s => s.id === "jordan");
  const jericho = S.SITES.find(s => s.id === "jericho");
  eq("Sinai is the roof of the journey",
    Math.max.apply(null, S.SITES.map(s => s.elevation)), sinai.elevation);
  eq("the Jordan is its floor",
    Math.min.apply(null, S.SITES.map(s => s.elevation)), jordan.elevation);
  ok("Jericho is below sea level", jericho.elevation < 0, jericho.elevation);
  ok("the Jordan is below Jericho", jordan.elevation < jericho.elevation);
}

/* ---------- arcs ---------- */
{
  const arcOf = {};
  S.ARCS.forEach(a => arcOf[a.key] = 1);
  ok("every site belongs to a real arc",
    S.SITES.every(s => arcOf[s.arc] === 1),
    S.SITES.filter(s => !arcOf[s.arc]).map(s => s.id));

  // Sites must be grouped: an arc's sites are contiguous in the journey,
  // or the rail and the route split both misreport progress.
  const seen = [];
  S.SITES.forEach(s => { if(seen[seen.length - 1] !== s.arc) seen.push(s.arc); });
  eq("arcs are contiguous blocks", seen.length, S.ARCS.length);
  ok("arcs appear in declared order",
    seen.join(",") === S.ARCS.map(a => a.key).join(","), seen);

  ok("every arc has sites", S.ARCS.every(a => S.SITES.some(s => s.arc === a.key)));
  ok("every arc declares its books", S.ARCS.every(a => Array.isArray(a.books) && a.books.length > 0));
  ok("every arc book is a real book",
    S.ARCS.every(a => a.books.every(b => BOOKS[b] === 1)),
    S.ARCS.map(a => a.books.filter(b => !BOOKS[b])).filter(x => x.length));
  ok("every arc names an audio bed", S.ARCS.every(a => /^act[1-5]$/.test(a.pal)));
}

/* ---------- books ---------- */
{
  ok("every site names at least one book",
    S.SITES.every(s => Array.isArray(s.books) && s.books.length > 0));

  const unknown = [];
  S.SITES.forEach(s => s.books.forEach(b => { if(!BOOKS[b]) unknown.push(s.id + " -> " + b); }));
  ok("every site book is a real book of the Bible", unknown.length === 0, unknown);

  // A bound book with no verses in the bank contributes nothing.
  const empty = [];
  S.SITES.forEach(s => s.books.forEach(b => { if(!HAS_VERSES[b]) empty.push(s.id + " -> " + b); }));
  ok("every site book has verses in the bank", empty.length === 0, empty);

  // The site's own books must be able to fill a level on their own,
  // which is what keeps levels thematically bound rather than falling
  // through to the wider rings. See pilgrimage.test.js for the fallback.
  const thin = S.SITES.filter(s =>
    s.books.reduce((n, b) => n + (HAS_VERSES[b] || 0), 0) < 6);
  ok("every site's own books can fill a 6-verse level", thin.length === 0,
    thin.map(s => s.id + ":" + s.books.reduce((n, b) => n + (HAS_VERSES[b] || 0), 0)));

  ok("a site's signature book is listed first and is real",
    S.SITES.every(s => BOOKS[s.books[0]] === 1));
}

/* ---------- empires ---------- */
{
  ok("every site names a known empire",
    S.SITES.every(s => !!S.EMPIRES[s.empire]),
    S.SITES.filter(s => !S.EMPIRES[s.empire]).map(s => s.id + ":" + s.empire));

  ok("every named empire has a drawn shape",
    S.SITES.every(s => Array.isArray(E.EMPIRE_SHAPES[s.empire])),
    S.SITES.filter(s => !E.EMPIRE_SHAPES[s.empire]).map(s => s.empire));

  ok("no empire shape is unused",
    Object.keys(E.EMPIRE_SHAPES).every(k => S.SITES.some(s => s.empire === k)),
    Object.keys(E.EMPIRE_SHAPES).filter(k => !S.SITES.some(s => s.empire === k)));

  ok("every empire polygon can actually be drawn",
    Object.keys(E.EMPIRE_SHAPES).every(k => E.EMPIRE_SHAPES[k].length >= 3),
    Object.keys(E.EMPIRE_SHAPES).filter(k => E.EMPIRE_SHAPES[k].length < 3));

  const outOfRange = [];
  Object.keys(E.EMPIRE_SHAPES).forEach(k => E.EMPIRE_SHAPES[k].forEach((p, i) => {
    if(!(p[0] >= -90 && p[0] <= 90 && p[1] >= -180 && p[1] <= 180)) outOfRange.push(k + "[" + i + "]");
  }));
  ok("every empire vertex is on the globe", outOfRange.length === 0, outOfRange);

  ok("every empire has a name and a date",
    Object.keys(S.EMPIRES).every(k => S.EMPIRES[k].name && S.EMPIRES[k].when && S.EMPIRES[k].colour));
  eq("the ordering list covers every shape",
    E.EMPIRE_ORDER.length, Object.keys(E.EMPIRE_SHAPES).length);
}

/* ---------- routes ---------- */
{
  ok("every arc has a route", S.ARCS.every(a => !!S.ROUTES[a.key]),
    S.ARCS.filter(a => !S.ROUTES[a.key]).map(a => a.key));

  Object.keys(S.ROUTES).forEach(key => {
    const r = S.ROUTES[key];
    ok(key + " route has enough points to draw", r.coords.length >= 2);
    ok(key + " route has a label and a colour", !!r.label && /^#[0-9a-f]{6}$/i.test(r.colour));
    ok(key + " route stays on the globe",
      r.coords.every(c => c[0] >= -90 && c[0] <= 90 && c[1] >= -180 && c[1] <= 180));
  });

  // The line must start where the arc starts and end where it ends.
  S.ARCS.forEach(a => {
    const leg = S.SITES.filter(s => s.arc === a.key);
    const r = S.ROUTES[a.key];
    ok(a.key + " route begins at its first site",
      Geo.haversineKm(r.coords[0], leg[0].coords) < 5,
      Geo.haversineKm(r.coords[0], leg[0].coords));
    ok(a.key + " route ends at its last site",
      Geo.haversineKm(r.coords[r.coords.length - 1], leg[leg.length - 1].coords) < 5,
      Geo.haversineKm(r.coords[r.coords.length - 1], leg[leg.length - 1].coords));
  });

  /* The important one. atlas.js splits each route into "walked" and
     "ahead" at the waypoint nearest the last cleared site. If the route
     visits its sites in a different order from the site list, that split
     lands past places the player has never been, and the map lies about
     progress. This is the assertion that catches it. */
  S.ARCS.forEach(a => {
    const leg = S.SITES.filter(s => s.arc === a.key);
    const coords = S.ROUTES[a.key].coords;
    const nearest = leg.map(s => {
      let best = 0, bestD = Infinity;
      coords.forEach((c, i) => {
        const d = Geo.haversineKm(c, s.coords);
        if(d < bestD){ bestD = d; best = i; }
      });
      return { id: s.id, at: best, km: bestD };
    });

    ok(a.key + " route passes through every one of its sites",
      nearest.every(n => n.km < 5),
      nearest.filter(n => n.km >= 5));

    const order = nearest.map(n => n.at);
    const sorted = order.slice().sort((x, y) => x - y);
    ok(a.key + " route visits its sites in journey order",
      order.join(",") === sorted.join(","),
      { order, sites: nearest.map(n => n.id) });
  });
}

/* ---------- climate fallback ---------- */
{
  ok("every site declares a climate type",
    S.SITES.every(s => typeof s.climate.type === "string" && s.climate.type.length > 0));
  ok("every climate has a plausible high and low",
    S.SITES.every(s => s.climate.hi > s.climate.lo &&
                       s.climate.hi < 55 && s.climate.lo > -10),
    S.SITES.filter(s => !(s.climate.hi > s.climate.lo)).map(s => s.id));
}

/* ---------- home view ---------- */
{
  ok("the home view is on the globe",
    S.HOME_VIEW.center[0] > -90 && S.HOME_VIEW.center[0] < 90 &&
    S.HOME_VIEW.center[1] > -180 && S.HOME_VIEW.center[1] < 180);
  ok("the home view zoom is sane", S.HOME_VIEW.zoom >= 3 && S.HOME_VIEW.zoom <= 12);
}

console.log((fail ? "FAIL" : "PASS") + " — sites · " + pass + " assertions passed · " +
  S.SITES.length + " sites · " + S.ARCS.length + " arcs" + (fail ? " · " + fail + " FAILED" : ""));
process.exit(fail ? 1 : 0);
