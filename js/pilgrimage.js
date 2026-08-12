/* ==================================================================
   PILGRIMAGE — the campaign rules for the road from Ur to Patmos.

   Thirty-six sites, eight verses each, in the order Scripture walks
   them. Clear a site and it stays cleared; fail one and you lose
   nothing but that attempt. Difficulty is a function of how far along
   the road you are, not of which mode you picked. Verses already used
   anywhere on the journey stay out of later draws (usedIds).

   The load-bearing piece here is resolvePool(). The bank holds four
   verses for most books and a level needs eight, so binding a level to
   "the books of this site" cannot work on its own — Emmaus is Luke,
   and Luke is thin. So the pool widens outward in named rings
   until it can fill the level:

       site books -> arc books -> testament -> the whole bank

   and inside whichever ring it stops at, candidates are ordered by how
   close their tier is to the site's target. That gives a level that is
   thematically bound where the bank allows it and always playable where
   it does not, instead of a level that is beautifully bound and three
   verses short.

   Everything here is pure: no DOM, no Leaflet, no clock, no storage.
   The data comes in through attach() so the same module serves the
   browser (globals from sites.js) and the tests (require).
   ================================================================== */

var Pilgrimage = (function () {

  var SITE_LIST = typeof SITES  !== "undefined" ? SITES  : [];
  var ARC_LIST  = typeof ARCS   !== "undefined" ? ARCS   : [];
  var VERSE_BANK = typeof VERSES !== "undefined" ? VERSES : [];

  /* Old and New Testament split, for the third fallback ring. */
  var NT_BOOKS = {
    "Matthew":1,"Mark":1,"Luke":1,"John":1,"Acts":1,"Romans":1,"1 Corinthians":1,
    "2 Corinthians":1,"Galatians":1,"Ephesians":1,"Philippians":1,"Colossians":1,
    "1 Thessalonians":1,"2 Thessalonians":1,"1 Timothy":1,"2 Timothy":1,"Titus":1,
    "Philemon":1,"Hebrews":1,"James":1,"1 Peter":1,"2 Peter":1,"1 John":1,
    "2 John":1,"3 John":1,"Jude":1,"Revelation":1
  };

  var VERSES_PER_SITE = 8;
  var CLOCK_OPEN = 14000;   // ms at Ur
  var CLOCK_CLOSE = 6500;   // ms at Patmos
  var SIGNATURE_QUOTA = 4;  // slots held for the site's own book — see resolvePool
  /* At least 5 of 8 verses from the site's book list so a stop still
     feels like that place. Set-piece sites demand a full site-book fill
     when the bank allows. Floor slots may re-use earlier site-book
     verses when usedIds has emptied the narrowest ring. */
  var SITE_BOOK_FLOOR = 0.625;
  var FULL_PLACE_SITES = {
    sinai: 1, jericho: 1, nineveh: 1, babylon: 1, golgotha: 1, patmos: 1
  };

  function attach(d) {
    if (!d) return;
    if (d.SITES)  SITE_LIST  = d.SITES;
    if (d.ARCS)   ARC_LIST   = d.ARCS;
    if (d.VERSES) VERSE_BANK = d.VERSES;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function isNT(book) { return NT_BOOKS[book] === 1; }

  /* --------------------------- the road --------------------------- */

  function journey() { return SITE_LIST; }
  function count() { return SITE_LIST.length; }

  function indexOf(siteId) {
    for (var i = 0; i < SITE_LIST.length; i++) if (SITE_LIST[i].id === siteId) return i;
    return -1;
  }
  function siteAt(i) { return SITE_LIST[i] || null; }
  function site(siteId) { var i = indexOf(siteId); return i < 0 ? null : SITE_LIST[i]; }

  function arc(arcKey) {
    for (var i = 0; i < ARC_LIST.length; i++) if (ARC_LIST[i].key === arcKey) return ARC_LIST[i];
    return null;
  }
  function sitesInArc(arcKey) {
    return SITE_LIST.filter(function (s) { return s.arc === arcKey; });
  }

  /* How far along the road, 0 at Ur and 1 at Patmos. */
  function positionOf(i) {
    var n = SITE_LIST.length;
    return n > 1 ? clamp(i, 0, n - 1) / (n - 1) : 0;
  }

  /* Difficulty tier ramps 1 -> 5 with distance travelled, so the first
     sites are the familiar words and the last are the hidden ones. */
  function tierFor(i) {
    return clamp(1 + Math.floor(positionOf(i) * 5), 1, 5);
  }

  /* The clock closes from 14s at Ur to 6.5s at Patmos, rounded to a
     tenth of a second so the briefing can print an honest number. */
  function clockFor(i) {
    var ms = CLOCK_OPEN - positionOf(i) * (CLOCK_OPEN - CLOCK_CLOSE);
    return Math.round(ms / 100) * 100;
  }

  function versesFor(/* i */) { return VERSES_PER_SITE; }

  /* --------------------------- progress --------------------------- */

  function blankProgress() {
    return { sites: {}, lastPlayed: "", started: 0, usedIds: [] };
  }

  /* Verse ids already seen on this journey — never offered again until
     the road is restarted. */
  function usedSet(progress) {
    var set = {};
    ((progress && progress.usedIds) || []).forEach(function (id) { set[id] = 1; });
    return set;
  }

  function markUsed(progress, ids) {
    var next = {
      sites: {},
      lastPlayed: (progress && progress.lastPlayed) || "",
      started: (progress && progress.started) || 0,
      usedIds: ((progress && progress.usedIds) || []).slice()
    };
    var old = (progress && progress.sites) || {};
    Object.keys(old).forEach(function (k) {
      next.sites[k] = {
        cleared: !!old[k].cleared, best: old[k].best || 0,
        bestAccuracy: old[k].bestAccuracy || 0, attempts: old[k].attempts || 0,
        clearedAt: old[k].clearedAt || 0, perfect: !!old[k].perfect
      };
    });
    var seen = {};
    next.usedIds.forEach(function (id) { seen[id] = 1; });
    (ids || []).forEach(function (id) {
      if (id != null && !seen[id]) { seen[id] = 1; next.usedIds.push(id); }
    });
    return next;
  }

  function recordOf(progress, siteId) {
    return (progress && progress.sites && progress.sites[siteId]) || null;
  }
  function isCleared(progress, siteId) {
    var r = recordOf(progress, siteId);
    return !!(r && r.cleared);
  }

  /* A site opens when the one before it has been cleared. Ur is always
     open. This is the whole gate — no keys, no currency, no detours. */
  function isUnlocked(progress, siteId) {
    var i = indexOf(siteId);
    if (i < 0) return false;
    if (i === 0) return true;
    return isCleared(progress, SITE_LIST[i - 1].id);
  }

  /* The furthest site reached: the first one not yet cleared. When every
     site is cleared this is the last site, so the map has somewhere to
     point rather than falling off the end. */
  function currentIndex(progress) {
    for (var i = 0; i < SITE_LIST.length; i++) {
      if (!isCleared(progress, SITE_LIST[i].id)) return i;
    }
    return SITE_LIST.length - 1;
  }
  function currentSite(progress) { return siteAt(currentIndex(progress)); }

  function clearedCount(progress) {
    var n = 0;
    for (var i = 0; i < SITE_LIST.length; i++) if (isCleared(progress, SITE_LIST[i].id)) n++;
    return n;
  }
  function isComplete(progress) { return clearedCount(progress) === SITE_LIST.length; }

  /* Pure: returns a NEW progress object, never mutates the input — the
     same discipline srs.js keeps, and for the same reason. `result` is
     { cleared, score, accuracy, livesLeft }. */
  function record(progress, siteId, result) {
    var next = {
      sites: {},
      lastPlayed: siteId,
      started: (progress && progress.started) || 0,
      usedIds: ((progress && progress.usedIds) || []).slice()
    };
    var old = (progress && progress.sites) || {};
    Object.keys(old).forEach(function (k) {
      next.sites[k] = {
        cleared: !!old[k].cleared, best: old[k].best || 0,
        bestAccuracy: old[k].bestAccuracy || 0, attempts: old[k].attempts || 0,
        clearedAt: old[k].clearedAt || 0, perfect: !!old[k].perfect
      };
    });

    var r = next.sites[siteId] || {
      cleared: false, best: 0, bestAccuracy: 0, attempts: 0, clearedAt: 0, perfect: false
    };
    r.attempts += 1;
    if (result && result.score > r.best) r.best = result.score;
    if (result && result.accuracy > r.bestAccuracy) r.bestAccuracy = result.accuracy;
    if (result && result.cleared) {
      if (!r.cleared) r.clearedAt = result.at || 0;
      r.cleared = true;
      // "Perfect" is a clean sweep: every verse kept, no life lost.
      if (result.accuracy >= 100) r.perfect = true;
    }
    next.sites[siteId] = r;
    if (!next.started && result && result.at) next.started = result.at;
    if (result && result.usedIds && result.usedIds.length) {
      var seen = {};
      next.usedIds.forEach(function (id) { seen[id] = 1; });
      result.usedIds.forEach(function (id) {
        if (id != null && !seen[id]) { seen[id] = 1; next.usedIds.push(id); }
      });
    }
    return next;
  }

  function arcStatus(progress, arcKey) {
    var list = sitesInArc(arcKey);
    var done = list.filter(function (s) { return isCleared(progress, s.id); }).length;
    /* "Perfect" on a site means a clean sweep — every verse kept, which
       is also the only way to reach the end without losing a life. An
       arc is perfect when every site in it is, and because a site's
       perfect flag is sticky once earned, the arc can be perfected one
       site at a time rather than in a single flawless sitting. */
    var flawless = list.length > 0 && list.every(function (s) {
      var r = recordOf(progress, s.id);
      return !!(r && r.cleared && r.perfect);
    });
    return {
      key: arcKey, total: list.length, cleared: done,
      complete: list.length > 0 && done === list.length,
      perfect: flawless,
      // An arc is open once its first site is open.
      open: list.length > 0 && isUnlocked(progress, list[0].id)
    };
  }

  function overview(progress) {
    return {
      cleared: clearedCount(progress),
      total: SITE_LIST.length,
      complete: isComplete(progress),
      current: currentSite(progress),
      arcs: ARC_LIST.map(function (a) { return arcStatus(progress, a.key); })
    };
  }

  /* ----------------------- verses for a site ----------------------- */

  /* mulberry32, same generator game.js uses for the daily draw, so a
     seeded pilgrimage level is reproducible in a test and varied in
     play. */
  function seededRandom(seed) {
    var s = seed | 0;
    return function () {
      s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function seedFrom(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function shuffled(list, rnd) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function booksToSet(books) {
    var set = {};
    (books || []).forEach(function (b) { set[b] = 1; });
    return set;
  }

  /* Parse "Genesis 11:31" / "1 Corinthians 13:13" → { book, chapter }. */
  function parseQuoteRef(ref) {
    var m = String(ref || "").match(/^((?:\d\s)?[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+)/);
    if (!m) return null;
    return { book: m[1].replace(/\s+/g, " ").trim(), chapter: parseInt(m[2], 10) };
  }

  function verseChapter(v) {
    var m = String(v && v.r || "").match(/\s(\d+):/);
    return m ? parseInt(m[1], 10) : 0;
  }

  /* Place-affinity rank: same book+chapter as the site quote first,
     then signature book, then other site books, then tier distance. */
  function placeAffinity(v, s, target) {
    var q = parseQuoteRef(s.quoteRef);
    var signature = (s.books && s.books[0]) || "";
    var bound = booksToSet(s.books);
    var ch = verseChapter(v);
    var score = Math.abs((v.t || 3) - target) * 10;
    if (q && v.b === q.book && ch === q.chapter) score -= 40;
    else if (v.b === signature) score -= 20;
    else if (bound[v.b] === 1) score -= 10;
    return score;
  }

  function siteFloorNeed(s, need) {
    if (s && FULL_PLACE_SITES[s.id]) return need;
    return Math.ceil(need * SITE_BOOK_FLOOR);
  }

  /* The four rings, widest last. Each returns the verses it allows. */
  function ringsFor(s) {
    var siteBooks = booksToSet(s.books);
    var a = arc(s.arc);
    var arcBooks = booksToSet(a ? a.books : []);
    var wantNT = !!(a && a.key === "gospel");

    return [
      { name: "site",       test: function (v) { return siteBooks[v.b] === 1; } },
      { name: "arc",        test: function (v) { return arcBooks[v.b] === 1; } },
      { name: "testament",  test: function (v) { return isNT(v.b) === wantNT; } },
      { name: "bank",       test: function () { return true; } }
    ];
  }

  /* Ordered candidates for a site: the narrowest ring that can fill the
     level, with its verses sorted by tier distance from the target and
     shuffled within each tier band so repeat visits differ.

     Returns { verses, ring } so the briefing can honestly say whether a
     level is drawn from the site's own books or had to reach wider. */
  function resolvePool(s, opts) {
    opts = opts || {};
    var need = opts.need || VERSES_PER_SITE;
    var exclude = opts.exclude || {};
    var target = typeof opts.tier === "number" ? opts.tier : tierFor(indexOf(s.id));
    var rnd = opts.rnd || Math.random;

    var available = VERSE_BANK.filter(function (v) { return !exclude[v.id]; });
    var rings = ringsFor(s);
    var chosenRing = rings[rings.length - 1];
    var pool = [];

    for (var i = 0; i < rings.length; i++) {
      var got = available.filter(rings[i].test);
      if (got.length >= need) { chosenRing = rings[i]; pool = got; break; }
      // Keep the widest thing seen so far, in case even the bank is short
      // (an exclude list can starve it) — better a short level than none.
      if (got.length > pool.length) { chosenRing = rings[i]; pool = got; }
    }

    // Order by distance from the target tier first, so a level sits as
    // close to its intended weight as the bound books allow. Within a
    // tier distance, nudge the site's signature book forward — books[0]
    // is what the place is actually known for, Luke at Emmaus and
    // Revelation at Patmos.
    //
    // The nudge is deliberately coarse: signature book, other bound
    // book, everything else. Ranking every book strictly would carve the
    // pool into buckets of one, and a bucket of one cannot be shuffled —
    // the level would then be identical on every replay, which matters
    // because these levels are replayable and feed the scheduler.
    var signature = (s.books && s.books[0]) || "";
    var bound = booksToSet(s.books);
    function affinity(v) {
      if (v.b === signature) return 0;
      return bound[v.b] === 1 ? 1 : 2;
    }

    var buckets = {};
    pool.forEach(function (v) {
      /* Coarse bucket by place affinity so chapter-linked verses rise. */
      var key = String(placeAffinity(v, s, target));
      (buckets[key] = buckets[key] || []).push(v);
    });

    var out = [];
    Object.keys(buckets)
      .sort(function (x, y) { return Number(x) - Number(y); })
      .forEach(function (k) { out = out.concat(shuffled(buckets[k], rnd)); });

    /* Reserve a small quota for the signature book.
       Sorting by tier distance alone is correct for difficulty but wrong
       for atmosphere: the bank holds exactly one tier-5 Revelation verse,
       so a pure tier sort gives Patmos — the end of the whole road — a
       single Revelation verse out of six, behind three from Jude. The
       quota pulls the closest-to-target verses from the site's own book
       to the front, so a level always carries a real share of what the
       place is known for.

       It is capped rather than open-ended on purpose. Filling a level
       from one book would undo the tier ramp and make thin books repeat
       constantly; two of six is enough to set the tone and still leaves
       the difficulty curve doing its job. */
    var quota = [], rest = [];
    out.forEach(function (v) {
      if (v.b === signature && quota.length < SIGNATURE_QUOTA) quota.push(v);
      else rest.push(v);
    });
    out = quota.concat(rest);

    return { verses: out, ring: chosenRing.name, target: target };
  }

  /* Pull at least ceil(need * SITE_BOOK_FLOOR) verses whose book is on
     the site's list. Prefer unused (not in exclude). If unused site stock
     is short but the bank still has enough unused verses to fill the
     level, re-admit excluded site-book verses for the floor only — that
     is the late-road case. A truly starved bank (fewer unused than need)
     stays short and does not invent volume by re-using.
     `ordered` is the full resolvePool list (not yet sliced to need). */
  function enforceSiteFloor(s, ordered, need, exclude, rnd, target) {
    var bound = booksToSet(s.books);
    var floor = siteFloorNeed(s, need);
    var signature = (s.books && s.books[0]) || "";

    function rank(list) {
      return shuffled(list.slice(), rnd).sort(function (a, b) {
        return placeAffinity(a, s, target) - placeAffinity(b, s, target);
      });
    }

    var unusedSite = [], unusedOther = [], reusedSite = [];
    VERSE_BANK.forEach(function (v) {
      if (exclude[v.id]) {
        if (bound[v.b] === 1) reusedSite.push(v);
        return;
      }
      if (bound[v.b] === 1) unusedSite.push(v);
      else unusedOther.push(v);
    });
    unusedSite = rank(unusedSite);
    unusedOther = rank(unusedOther);
    reusedSite = rank(reusedSite);

    var unusedTotal = unusedSite.length + unusedOther.length;
    // Starved bank: return only what is still free, site books first.
    if (unusedTotal < need) {
      return unusedSite.concat(unusedOther).slice(0, unusedTotal);
    }

    var out = [];
    var outIds = {};
    function take(list, n) {
      for (var i = 0; i < list.length && out.length < n; i++) {
        if (!outIds[list[i].id]) {
          out.push(list[i]);
          outIds[list[i].id] = 1;
        }
      }
    }

    // Floor from unused site books, then re-admitted site books if needed.
    take(unusedSite, floor);
    if (out.length < floor) take(reusedSite, floor);
    // Fill the rest: leftover unused site, then unused other, then ordered.
    take(unusedSite, need);
    take(unusedOther, need);
    (ordered || []).forEach(function (v) {
      if (out.length >= need || !v || outIds[v.id] || exclude[v.id]) return;
      out.push(v);
      outIds[v.id] = 1;
    });
    return out.slice(0, need);
  }

  /* The actual level: exactly `need` verses where the bank can supply
     them, in play order. Seeded by site and attempt so a retry is a
     different draw rather than the same six again. */
  function drawSite(siteId, opts) {
    opts = opts || {};
    var s = site(siteId);
    if (!s) return { verses: [], ring: "none", target: 1 };

    var i = indexOf(siteId);
    var need = opts.need || VERSES_PER_SITE;
    var rnd = opts.rnd || seededRandom(seedFrom(siteId + ":" + (opts.attempt || 0)));
    var exclude = opts.exclude || {};

    var res = resolvePool(s, {
      need: need, exclude: exclude, tier: opts.tier, rnd: rnd
    });
    var picked = enforceSiteFloor(s, res.verses, need, exclude, rnd, res.target);
    picked = enforceSignatureQuota(s, picked, need, exclude, rnd, res.target);

    // Play order is shuffled so the easiest verse is not always first.
    return { verses: shuffled(picked, rnd), ring: res.ring, target: res.target };
  }

  /* After the place floor rebuilds the list, put the signature quota back.
     Tier-distance ranking alone can bury the book's own verses. Never
     invent volume on a starved bank — re-admission only when unused
     stock can already fill the level. */
  function enforceSignatureQuota(s, picked, need, exclude, rnd, target) {
    var signature = (s.books && s.books[0]) || "";
    if (!signature) return picked.slice(0, need);
    var unused = 0, avail = 0;
    VERSE_BANK.forEach(function (v) {
      if (v.b === signature) avail++;
      if (!exclude[v.id]) unused++;
    });
    if (unused < need) return picked.slice(0, Math.min(need, picked.length));

    var have = [];
    var rest = [];
    (picked || []).forEach(function (v) {
      if (v.b === signature) have.push(v);
      else rest.push(v);
    });
    var want = Math.min(SIGNATURE_QUOTA, need, avail);
    if (have.length >= want) return picked.slice(0, need);

    var seen = {};
    have.forEach(function (v) { seen[v.id] = 1; });
    var fresh = [], reused = [];
    VERSE_BANK.forEach(function (v) {
      if (v.b !== signature || seen[v.id]) return;
      if (exclude[v.id]) reused.push(v);
      else fresh.push(v);
    });
    function byTier(list) {
      return shuffled(list.slice(), rnd).sort(function (a, b) {
        return Math.abs((a.t || 3) - target) - Math.abs((b.t || 3) - target);
      });
    }
    byTier(fresh).concat(byTier(reused)).forEach(function (v) {
      if (have.length >= want) return;
      have.push(v);
      seen[v.id] = 1;
    });
    var out = have.concat(rest.filter(function (v) { return !seen[v.id]; }));
    return out.slice(0, need);
  }

  /* What the briefing card shows before a site is played. */
  function brief(siteId, progress) {
    var s = site(siteId);
    if (!s) return null;
    var i = indexOf(siteId);
    var a = arc(s.arc);
    var rec = recordOf(progress, siteId);
    return {
      site: s, index: i, ordinal: i + 1, total: SITE_LIST.length,
      arc: a, tier: tierFor(i), clockMs: clockFor(i), verses: VERSES_PER_SITE,
      unlocked: isUnlocked(progress, siteId),
      cleared: isCleared(progress, siteId),
      record: rec,
      previous: i > 0 ? SITE_LIST[i - 1] : null,
      next: i < SITE_LIST.length - 1 ? SITE_LIST[i + 1] : null
    };
  }

  return {
    VERSES_PER_SITE: VERSES_PER_SITE,
    CLOCK_OPEN: CLOCK_OPEN, CLOCK_CLOSE: CLOCK_CLOSE,
    attach: attach,
    journey: journey, count: count, indexOf: indexOf, siteAt: siteAt, site: site,
    arc: arc, sitesInArc: sitesInArc, arcs: function () { return ARC_LIST; },
    positionOf: positionOf, tierFor: tierFor, clockFor: clockFor, versesFor: versesFor,
    blankProgress: blankProgress, recordOf: recordOf, isCleared: isCleared,
    isUnlocked: isUnlocked, currentIndex: currentIndex, currentSite: currentSite,
    clearedCount: clearedCount, isComplete: isComplete, record: record,
    usedSet: usedSet, markUsed: markUsed,
    arcStatus: arcStatus, overview: overview,
    resolvePool: resolvePool, drawSite: drawSite, brief: brief,
    seededRandom: seededRandom, seedFrom: seedFrom, isNT: isNT,
    SITE_BOOK_FLOOR: SITE_BOOK_FLOOR, SIGNATURE_QUOTA: SIGNATURE_QUOTA,
    FULL_PLACE_SITES: FULL_PLACE_SITES,
    parseQuoteRef: parseQuoteRef, placeAffinity: placeAffinity, siteFloorNeed: siteFloorNeed
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Pilgrimage;
