/* ==================================================================
   POLISH — pure helpers for security clamps, mastery, blitz, ghosts,
   haptics, and insight lookups. No DOM. Safe to require() in Node tests.
   ================================================================== */

var Polish = (function () {
  /* Soft anti-cheat ceilings used client-side and mirrored in SQL checks. */
  var MAX_DAILY_SCORE = 500000;
  var MAX_BLITZ_SCORE = 10000;
  var MAX_ACCURACY = 100;
  var MAX_DURATION_MS = 2 * 60 * 60 * 1000;
  var BLITZ_START_MS = 60000;
  var BLITZ_CORRECT_MS = 2000;
  var BLITZ_MISS_MS = 4000;

  function clamp(n, lo, hi) {
    n = Number(n);
    if (!isFinite(n)) n = lo;
    return n < lo ? lo : n > hi ? hi : n;
  }

  function clampDailyScore(row) {
    row = row || {};
    return {
      play_date: String(row.play_date || "").slice(0, 32),
      score: Math.round(clamp(row.score, 0, MAX_DAILY_SCORE)),
      accuracy: clamp(row.accuracy, 0, MAX_ACCURACY),
      duration_ms: row.duration_ms == null ? null : Math.round(clamp(row.duration_ms, 0, MAX_DURATION_MS)),
      diff: String(row.diff || "watchman").slice(0, 32)
    };
  }

  function clampBlitzScore(row) {
    row = row || {};
    return {
      score: Math.round(clamp(row.score, 0, MAX_BLITZ_SCORE)),
      survived_ms: Math.round(clamp(row.survived_ms, 0, MAX_DURATION_MS)),
      diff: String(row.diff || "watchman").slice(0, 32)
    };
  }

  /* SRS health for the 66-book heatmap. */
  function bookMastery(bookName, verses, cardFor, today) {
    var list = (verses || []).filter(function (v) { return v.b === bookName; });
    if (!list.length) return { key: bookName, state: "empty", label: "No verses", pct: 0 };
    var due = 0, held = 0, learning = 0, unseen = 0, lapsed = 0;
    list.forEach(function (v) {
      var c = cardFor ? cardFor(v) : null;
      if (!c || (!c.reps && !c.lapses)) { unseen++; return; }
      if (c.lapses && (!c.reps || c.due <= today)) { lapsed++; due++; return; }
      if (c.due <= today) { due++; return; }
      if (c.reps >= 3 && c.ivl >= 7) held++;
      else learning++;
    });
    var seen = list.length - unseen;
    var pct = list.length ? Math.round((held / list.length) * 100) : 0;
    var state = "unseen";
    if (lapsed > 0 || due > 0) state = "due";
    else if (held > 0 && held >= Math.ceil(list.length * 0.5)) state = "mastered";
    else if (seen > 0) state = "learning";
    return {
      key: bookName, state: state, label:
        state === "mastered" ? "Mastered" :
        state === "due" ? "Due / lapsed" :
        state === "learning" ? "Learning" : "Unseen",
      pct: pct, due: due, held: held, learning: learning, unseen: unseen, total: list.length
    };
  }

  function heatmapMatrix(booksOrder, verses, cardFor, today) {
    return (booksOrder || []).map(function (b) {
      return bookMastery(b, verses, cardFor, today);
    });
  }

  /* Ghost progress: sample elapsed → 0..1 progress. */
  function sampleGhost(samples, elapsedMs) {
    samples = samples || [];
    if (!samples.length) return 0;
    if (elapsedMs <= samples[0].t) return samples[0].p || 0;
    for (var i = 1; i < samples.length; i++) {
      if (elapsedMs <= samples[i].t) {
        var a = samples[i - 1], b = samples[i];
        var span = (b.t - a.t) || 1;
        var k = (elapsedMs - a.t) / span;
        return (a.p || 0) + ((b.p || 0) - (a.p || 0)) * k;
      }
    }
    return samples[samples.length - 1].p || 0;
  }

  function pushGhostSample(samples, t, p, minGapMs) {
    samples = samples ? samples.slice() : [];
    minGapMs = minGapMs == null ? 2000 : minGapMs;
    p = clamp(p, 0, 1);
    t = Math.max(0, t | 0);
    var last = samples[samples.length - 1];
    if (last && t - last.t < minGapMs) {
      samples[samples.length - 1] = { t: t, p: p };
      return samples;
    }
    samples.push({ t: t, p: p });
    return samples;
  }

  function blitzAdjustMs(leftMs, correct) {
    leftMs = Math.max(0, leftMs | 0);
    if (correct) return leftMs + BLITZ_CORRECT_MS;
    return Math.max(0, leftMs - BLITZ_MISS_MS);
  }

  function blitzPressure(leftMs) {
    if (leftMs <= 5000) return 3;
    if (leftMs <= 12000) return 2;
    if (leftMs <= 25000) return 1;
    return 0;
  }

  function sanitizeDisplayName(name) {
    name = String(name == null ? "" : name)
      .replace(/<[^>]*>/g, "")
      .replace(/[<>&"'`]/g, "")
      .trim();
    if (name.length < 2) return "";
    return name.slice(0, 32);
  }

  /* Book-level insight cards (MVP — not per-verse exegesis). */
  var BOOK_INSIGHTS = {
    Genesis: { author: "Moses (traditional)", era: "c. 1440–1400 BC / events earlier", audience: "Israel at Sinai", theme: "Beginnings, covenant, promise", roots: [{ w: "bereshith", m: "in the beginning" }, { w: "hesed", m: "covenant loyalty" }] },
    Exodus: { author: "Moses (traditional)", era: "c. 1440 BC", audience: "Israel newly free", theme: "Deliverance and law", roots: [{ w: "YHWH", m: "the LORD" }, { w: "torah", m: "instruction" }] },
    Psalms: { author: "David and others", era: "c. 1000–400 BC", audience: "Worshipping Israel", theme: "Prayer, praise, lament", roots: [{ w: "hesed", m: "steadfast love" }, { w: "nephesh", m: "soul / life" }] },
    Isaiah: { author: "Isaiah", era: "c. 740–680 BC", audience: "Judah under threat", theme: "Judgment and hope", roots: [{ w: "emmanuel", m: "God with us" }] },
    Matthew: { author: "Matthew", era: "c. AD 60–70", audience: "Jewish believers", theme: "Jesus the Messiah-King", roots: [{ w: "basileia", m: "kingdom" }] },
    John: { author: "John", era: "c. AD 90", audience: "Church at large", theme: "Word made flesh", roots: [{ w: "logos", m: "Word" }, { w: "agape", m: "love" }] },
    Romans: { author: "Paul", era: "c. AD 57", audience: "Church in Rome", theme: "Gospel righteousness", roots: [{ w: "dikaiosyne", m: "righteousness" }, { w: "pistis", m: "faith" }] },
    Revelation: { author: "John", era: "c. AD 95", audience: "Seven churches of Asia", theme: "Christ reigns; new creation", roots: [{ w: "apokalypsis", m: "unveiling" }] },
    Acts: { author: "Luke", era: "c. AD 62", audience: "Theophilus / church", theme: "Spirit and mission", roots: [{ w: "pneuma", m: "Spirit / wind" }] },
    Hebrews: { author: "Unknown", era: "c. AD 60–70", audience: "Jewish Christians", theme: "Christ superior", roots: [{ w: "archiereus", m: "high priest" }] }
  };

  function insightForVerse(v) {
    if (!v) return null;
    var base = BOOK_INSIGHTS[v.b] || {
      author: "See traditional attribution",
      era: "Scripture",
      audience: "The people of God",
      theme: "The word of the LORD",
      roots: []
    };
    return {
      ref: v.r,
      book: v.b,
      author: base.author,
      era: base.era,
      audience: base.audience,
      theme: base.theme,
      roots: base.roots || [],
      crossRefs: []
    };
  }

  function crossRefsInBank(v, verses, limit) {
    limit = limit || 3;
    if (!v || !verses) return [];
    var words = String(v.a || "").toLowerCase().split(/\W+/).filter(function (w) { return w.length > 4; });
    var out = [];
    for (var i = 0; i < verses.length && out.length < limit; i++) {
      var o = verses[i];
      if (!o || o.id === v.id) continue;
      if (o.b === v.b) {
        out.push(o.r);
        continue;
      }
      var blob = ((o.a || "") + " " + (o.p || "")).toLowerCase();
      if (words.some(function (w) { return blob.indexOf(w) >= 0; })) out.push(o.r);
    }
    return out;
  }

  function shouldVibrate() {
    return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  }

  function haptic(kind) {
    if (!shouldVibrate()) return false;
    try {
      if (kind === "correct") navigator.vibrate(18);
      else if (kind === "wrong") navigator.vibrate([30, 40, 30]);
      else navigator.vibrate(10);
      return true;
    } catch (e) { return false; }
  }

  return {
    MAX_DAILY_SCORE: MAX_DAILY_SCORE,
    MAX_BLITZ_SCORE: MAX_BLITZ_SCORE,
    BLITZ_START_MS: BLITZ_START_MS,
    BLITZ_CORRECT_MS: BLITZ_CORRECT_MS,
    BLITZ_MISS_MS: BLITZ_MISS_MS,
    clamp: clamp,
    clampDailyScore: clampDailyScore,
    clampBlitzScore: clampBlitzScore,
    bookMastery: bookMastery,
    heatmapMatrix: heatmapMatrix,
    sampleGhost: sampleGhost,
    pushGhostSample: pushGhostSample,
    blitzAdjustMs: blitzAdjustMs,
    blitzPressure: blitzPressure,
    sanitizeDisplayName: sanitizeDisplayName,
    insightForVerse: insightForVerse,
    crossRefsInBank: crossRefsInBank,
    BOOK_INSIGHTS: BOOK_INSIGHTS,
    haptic: haptic
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Polish;
