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
  /* Global pace: every stage clock gets this multiplier (playtest tuning). */
  var PACE = 1.2;
  /* Flat extra seconds added to every question clock, after pacing. */
  var FLAT_ADD_MS = 5000;

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

  /* Book-level insight cards — all 66 books, one card each. Kept short
     on purpose: a line of orientation, not exegesis. */
  var BOOK_INSIGHTS = {
    Genesis: { author: "Moses (traditional)", era: "c. 1440–1400 BC / events earlier", audience: "Israel at Sinai", theme: "Beginnings, covenant, promise", roots: [{ w: "bereshith", m: "in the beginning" }, { w: "hesed", m: "covenant loyalty" }] },
    Exodus: { author: "Moses (traditional)", era: "c. 1440 BC", audience: "Israel newly free", theme: "Deliverance and law", roots: [{ w: "YHWH", m: "the LORD" }, { w: "torah", m: "instruction" }] },
    Leviticus: { author: "Moses (traditional)", era: "c. 1440 BC", audience: "Israel at the tabernacle", theme: "Holiness and atonement", roots: [{ w: "qadosh", m: "holy, set apart" }, { w: "kopher", m: "ransom, atonement" }] },
    Numbers: { author: "Moses (traditional)", era: "c. 1440–1400 BC", audience: "Israel in the wilderness", theme: "Wandering and faithlessness", roots: [{ w: "midbar", m: "wilderness" }, { w: "edah", m: "congregation" }] },
    Deuteronomy: { author: "Moses (traditional)", era: "c. 1400 BC", audience: "Israel on the plains of Moab", theme: "Remember and love the LORD", roots: [{ w: "shema", m: "hear, obey" }, { w: "ahavah", m: "love" }] },
    Joshua: { author: "Joshua and the elders (traditional)", era: "c. 1400–1370 BC", audience: "Israel entering Canaan", theme: "Faithful God, given land", roots: [{ w: "yerushah", m: "possession, inheritance" }, { w: "chazaq", m: "be strong" }] },
    Judges: { author: "Samuel (traditional)", era: "c. 1050 BC / events c. 1370–1050", audience: "Israel before the kings", theme: "Everyone did what was right in his own eyes", roots: [{ w: "shophet", m: "judge, deliverer" }] },
    Ruth: { author: "Unnamed (perhaps Samuel's era)", era: "c. 1000 BC / events in the judges", audience: "Israel", theme: "Loyal love in ordinary lives", roots: [{ w: "goel", m: "kinsman-redeemer" }, { w: "hesed", m: "covenant loyalty" }] },
    "1 Samuel": { author: "Samuel, Nathan, Gad (traditional)", era: "c. 1000 BC", audience: "Israel under her first king", theme: "The heart God looks for", roots: [{ w: "mashiach", m: "anointed one" }] },
    "2 Samuel": { author: "The prophets (traditional)", era: "c. 960 BC", audience: "Israel under David", theme: "A covenant house, a flawed king", roots: [{ w: "beth", m: "house, dynasty" }] },
    "1 Kings": { author: "Jeremiah (traditional)", era: "c. 560 BC", audience: "Judah in exile", theme: "Wisdom, temple, and decline", roots: [{ w: "malkhut", m: "kingdom, reign" }] },
    "2 Kings": { author: "Jeremiah (traditional)", era: "c. 560 BC", audience: "Judah in exile", theme: "The fall of both houses", roots: [{ w: "golah", m: "exile" }] },
    "1 Chronicles": { author: "Ezra (traditional)", era: "c. 450 BC", audience: "Returned exiles", theme: "David's line, God's records", roots: [{ w: "divrei", m: "the words/acts of" }] },
    "2 Chronicles": { author: "Ezra (traditional)", era: "c. 450 BC", audience: "Returned exiles", theme: "Revival and ruin of the temple", roots: [{ w: "chanukkah", m: "dedication" }] },
    Ezra: { author: "Ezra (traditional)", era: "c. 457 BC", audience: "Restored Jerusalem", theme: "Rebuilding the house", roots: [{ w: "torah", m: "the Law" }, { w: "shuv", m: "return, restore" }] },
    Nehemiah: { author: "Nehemiah (traditional)", era: "c. 445 BC", audience: "Jerusalem's wall-builders", theme: "Prayer and hard work", roots: [{ w: "chomah", m: "wall" }] },
    Esther: { author: "Mordecai's circle (traditional)", era: "c. 470 BC", audience: "Diaspora Jews", theme: "Providence behind the scenes", roots: [{ w: "pur", m: "the lot" }] },
    Job: { author: "Unnamed (perhaps Moses' era)", era: "Patriarchal setting", audience: "All who suffer", theme: "Trust without answers", roots: [{ w: "yireh", m: "fears" }, { w: "goel", m: "redeemer" }] },
    Psalms: { author: "David and others", era: "c. 1000–400 BC", audience: "Worshipping Israel", theme: "Prayer, praise, lament", roots: [{ w: "hesed", m: "steadfast love" }, { w: "nephesh", m: "soul / life" }] },
    Proverbs: { author: "Solomon and others", era: "c. 950–700 BC", audience: "The young and the wise", theme: "The fear of the LORD", roots: [{ w: "chokmah", m: "wisdom" }, { w: "yirah", m: "fear, reverence" }] },
    Ecclesiastes: { author: "The Preacher (traditional: Solomon)", era: "c. 935 BC", audience: "Those who labour under the sun", theme: "Vanity, and God's gift of today", roots: [{ w: "hevel", m: "vapour, vanity" }] },
    "Song of Solomon": { author: "Solomon (traditional)", era: "c. 965 BC", audience: "Wedded love", theme: "Love strong as death", roots: [{ w: "dodi", m: "my beloved" }] },
    Isaiah: { author: "Isaiah", era: "c. 740–680 BC", audience: "Judah under threat", theme: "Judgment and hope", roots: [{ w: "emmanuel", m: "God with us" }] },
    Jeremiah: { author: "Jeremiah, via Baruch", era: "c. 627–580 BC", audience: "Judah before the fall", theme: "Tears before the fire", roots: [{ w: "bakah", m: "to weep" }, { w: "berith chadashah", m: "new covenant" }] },
    Lamentations: { author: "Jeremiah (traditional)", era: "c. 586 BC", audience: "Survivors of Jerusalem", theme: "Great is Thy faithfulness, in the ruins", roots: [{ w: "chessed", m: "mercies" }] },
    Ezekiel: { author: "Ezekiel", era: "c. 593–571 BC", audience: "Exiles in Babylon", theme: "Dry bones and a new heart", roots: [{ w: "ruach", m: "spirit, wind, breath" }] },
    Daniel: { author: "Daniel", era: "c. 605–530 BC", audience: "Exiles under four empires", theme: "The Most High rules", roots: [{ w: "malkut", m: "dominion" }] },
    Hosea: { author: "Hosea", era: "c. 750–715 BC", audience: "Northern Israel", theme: "Unfailing love to the unfaithful", roots: [{ w: "hesed", m: "steadfast love" }] },
    Joel: { author: "Joel", era: "c. 835 BC (uncertain)", audience: "Judah under locusts", theme: "The day of the LORD", roots: [{ w: "yom YHWH", m: "day of the LORD" }] },
    Amos: { author: "Amos, the herdsman", era: "c. 760 BC", audience: "Comfortable Israel", theme: "Let justice roll", roots: [{ w: "mishpat", m: "justice" }] },
    Obadiah: { author: "Obadiah", era: "c. 586 BC (uncertain)", audience: "Edom, and Judah wronged", theme: "Pride before a fall", roots: [{ w: "zedah", m: "pride, presumption" }] },
    Jonah: { author: "Jonah's school (traditional)", era: "c. 760 BC", audience: "Reluctant saints", theme: "Mercy runs wider than we want", roots: [{ w: "gadol", m: "great" }] },
    Micah: { author: "Micah", era: "c. 735–700 BC", audience: "Judah's leaders", theme: "Do justly, love mercy", roots: [{ w: "mishpat", m: "justice" }, { w: "beth-lechem", m: "house of bread" }] },
    Nahum: { author: "Nahum", era: "c. 650 BC", audience: "Judah under Assyria's shadow", theme: "The LORD is good — and a stronghold", roots: [{ w: "machseh", m: "refuge" }] },
    Habakkuk: { author: "Habakkuk", era: "c. 607 BC", audience: "The questioning faithful", theme: "The just shall live by faith", roots: [{ w: "emunah", m: "faithfulness" }] },
    Zephaniah: { author: "Zephaniah", era: "c. 625 BC", audience: "Josiah's Judah", theme: "Hidden in the day of wrath", roots: [{ w: "anavim", m: "the humble" }] },
    Haggai: { author: "Haggai", era: "c. 520 BC", audience: "Returned builders", theme: "Consider your ways", roots: [{ w: "kavod", m: "glory" }] },
    Zechariah: { author: "Zechariah", era: "c. 520–480 BC", audience: "Restored Jerusalem", theme: "Not by might, nor by power", roots: [{ w: "ruach", m: "spirit" }] },
    Malachi: { author: "Malachi", era: "c. 430 BC", audience: "Weary post-exiles", theme: "Honour the LORD; the Sun arises", roots: [{ w: "mattanah", m: "offering, gift" }] },
    Matthew: { author: "Matthew", era: "c. AD 60–70", audience: "Jewish believers", theme: "Jesus the Messiah-King", roots: [{ w: "basileia", m: "kingdom" }] },
    Mark: { author: "Mark (Peter's record)", era: "c. AD 55–65", audience: "Rome and the persecuted", theme: "The Servant who acts at once", roots: [{ w: "euthys", m: "immediately" }] },
    Luke: { author: "Luke, the physician", era: "c. AD 60", audience: "Theophilus and the nations", theme: "The Son of Man seeks the lost", roots: [{ w: "huios anthropou", m: "Son of Man" }] },
    John: { author: "John", era: "c. AD 90", audience: "Church at large", theme: "Word made flesh", roots: [{ w: "logos", m: "Word" }, { w: "agape", m: "love" }] },
    Acts: { author: "Luke", era: "c. AD 62", audience: "Theophilus / church", theme: "Spirit and mission", roots: [{ w: "pneuma", m: "Spirit / wind" }] },
    Romans: { author: "Paul", era: "c. AD 57", audience: "Church in Rome", theme: "Gospel righteousness", roots: [{ w: "dikaiosyne", m: "righteousness" }, { w: "pistis", m: "faith" }] },
    "1 Corinthians": { author: "Paul", era: "c. AD 55", audience: "A divided Greek church", theme: "Christ, the wisdom and power of God", roots: [{ w: "agape", m: "charity, love" }] },
    "2 Corinthians": { author: "Paul", era: "c. AD 56", audience: "A tested church", theme: "Strength made perfect in weakness", roots: [{ w: "paraklesis", m: "comfort" }] },
    Galatians: { author: "Paul", era: "c. AD 48–55", audience: "Churches turning to law", theme: "Liberty, not bondage", roots: [{ w: "eleutheria", m: "freedom" }] },
    Ephesians: { author: "Paul", era: "c. AD 60", audience: "Churches of Asia Minor", theme: "The church, God's workmanship", roots: [{ w: "poiema", m: "workmanship" }] },
    Philippians: { author: "Paul", era: "c. AD 61", audience: "His joyful partners", theme: "Rejoice; the peace of God keeps you", roots: [{ w: "chara", m: "joy" }] },
    Colossians: { author: "Paul", era: "c. AD 61", audience: "A church facing false wisdom", theme: "Christ is all, and in all", roots: [{ w: "pleroma", m: "fullness" }] },
    "1 Thessalonians": { author: "Paul", era: "c. AD 51", audience: "A young, persecuted church", theme: "Watch for the Lord's coming", roots: [{ w: "parousia", m: "coming" }] },
    "2 Thessalonians": { author: "Paul", era: "c. AD 52", audience: "An unsettled church", theme: "Stand fast; work while you wait", roots: [{ w: "steko", m: "stand fast" }] },
    "1 Timothy": { author: "Paul", era: "c. AD 62–64", audience: "A young pastor at Ephesus", theme: "How to behave in the house of God", roots: [{ w: "didaskalia", m: "doctrine, teaching" }] },
    "2 Timothy": { author: "Paul", era: "c. AD 67", audience: "Timothy, and every succeeding generation", theme: "Endure; keep the word", roots: [{ w: "graphē", m: "the Scripture" }] },
    Titus: { author: "Paul", era: "c. AD 63", audience: "Crete's young churches", theme: "Sound doctrine, good works", roots: [{ w: "sōphrōn", m: "sober-minded" }] },
    Philemon: { author: "Paul", era: "c. AD 61", audience: "A master, about his runaway", theme: "Receive him as a brother", roots: [{ w: "adelphos", m: "brother" }] },
    Hebrews: { author: "Unknown", era: "c. AD 60–70", audience: "Jewish Christians", theme: "Christ superior", roots: [{ w: "archiereus", m: "high priest" }] },
    James: { author: "James, the Lord's brother", era: "c. AD 45–50", audience: "Scattered believers", theme: "Faith that works", roots: [{ w: "hypomonē", m: "patience, endurance" }] },
    "1 Peter": { author: "Peter", era: "c. AD 62–64", audience: "Suffering strangers", theme: "Living hope among the fire", roots: [{ w: "elpis", m: "living hope" }] },
    "2 Peter": { author: "Peter", era: "c. AD 67", audience: "A church warned", theme: "Grow in grace; the day will come", roots: [{ w: "epignōsis", m: "full knowledge" }] },
    "1 John": { author: "John the Apostle", era: "c. AD 90", audience: "Assured believers", theme: "God is light, God is love", roots: [{ w: "koinōnia", m: "fellowship" }] },
    "2 John": { author: "The Elder (John)", era: "c. AD 90", audience: "A chosen lady and her house", theme: "Walk in truth", roots: [{ w: "alētheia", m: "truth" }] },
    "3 John": { author: "The Elder (John)", era: "c. AD 90", audience: "Gaius, a faithful host", theme: "Fellowhelpers with the truth", roots: [{ w: "philadelphia", m: "brotherly love" }] },
    Jude: { author: "Jude, brother of James", era: "c. AD 65", audience: "A church slipped in among", theme: "Keep yourselves in the love of God", roots: [{ w: "epagōnizomai", m: "earnestly contend" }] },
    Revelation: { author: "John", era: "c. AD 95", audience: "Seven churches of Asia", theme: "Christ reigns; new creation", roots: [{ w: "apokalypsis", m: "unveiling" }] }
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

  /* Overdrive "ride or bank" math (pure, shared with the tests). */
  function overdriveBank(streak, diffScore) {
    streak = Math.max(0, streak | 0);
    diffScore = diffScore == null ? 1 : Number(diffScore) || 1;
    return Math.round(streak * 60 * diffScore);
  }
  function overdriveRideGain(gain) {
    return Math.round((gain || 0) * 2);
  }

  /* The one honest clock. Every surface that PRINTS a per-verse clock
     (atlas dossier, site brief, relay brief, Trial act cards) goes
     through this so they agree with the clock play actually uses:
     (base × difficulty + pick pad) × PACE + FLAT_ADD_MS. */
  function pacedClockMs(baseMs, diffTime, pickPadMs) {
    baseMs = Number(baseMs) || 0;
    diffTime = Number(diffTime) || 1;
    var pad = pickPadMs == null ? 1500 : Number(pickPadMs) || 0;
    return Math.round((baseMs * diffTime + pad) * PACE + FLAT_ADD_MS);
  }

  /* Pure shape score used by buildChoices (mirrored for tests). */
  function choiceShapeScore(correct, cand) {
    correct = String(correct || "");
    cand = String(cand || "");
    if (!cand || cand === correct) return -1;
    function wordsOf(s) { return s.toLowerCase().split(/\W+/).filter(Boolean); }
    var cw = wordsOf(correct), aw = wordsOf(cand);
    var score = 0;
    var lenDiff = Math.abs(cand.length - correct.length);
    if (lenDiff <= 2) score += 8;
    else if (lenDiff <= 5) score += 6;
    else if (lenDiff <= 10) score += 3;
    else if (lenDiff <= 16) score += 1;
    else score -= 4;
    var wcDiff = Math.abs(aw.length - cw.length);
    if (wcDiff === 0) score += 7;
    else if (wcDiff === 1) score += 4;
    else if (wcDiff === 2) score += 1;
    else score -= 3;
    cw.filter(function (w) { return w.length > 3; }).forEach(function (w) {
      if (aw.indexOf(w) >= 0) score += 3;
    });
    if (cw[0] && aw[0] && cw[0] === aw[0]) score += 3;
    if (/^the\s+/i.test(correct) && /^the\s+/i.test(cand)) score += 2;
    if (/\sof\s/i.test(correct) && /\sof\s/i.test(cand)) score += 2;
    if (/\sand\s/i.test(correct) && /\sand\s/i.test(cand)) score += 1;
    return score;
  }

  function describeModeClock(modeKey, diffKey) {
    var t = diffKey === "pilgrim" ? 1.35 : diffKey === "watchman" ? 0.72 : 1;
    var pad = 1500;
    function sec(base, pickPad) {
      return (pacedClockMs(base, t, pickPad) / 1000).toFixed(1);
    }
    switch (modeKey) {
      case "trial":
      case "pilgrimage":
      case "relay":
        return sec(14000, pad) + "→" + sec(6500, pad) + "s";
      case "endless":
        return sec(12000, pad) + "→" + sec(4200, pad) + "s";
      case "daily":
        return sec(10000, pad) + "s";
      case "practice":
        return sec(12000, pad) + "s";
      case "recall":
        return sec(32000, 0) + "s";
      case "pilgrim-recall":
        return sec(14000, 0) + "→" + sec(6500, 0) + "s";
      case "blitz":
        return "60s";
      default:
        return "";
    }
  }

  return {
    MAX_DAILY_SCORE: MAX_DAILY_SCORE,
    MAX_BLITZ_SCORE: MAX_BLITZ_SCORE,
    BLITZ_START_MS: BLITZ_START_MS,
    BLITZ_CORRECT_MS: BLITZ_CORRECT_MS,
    BLITZ_MISS_MS: BLITZ_MISS_MS,
    PACE: PACE,
    FLAT_ADD_MS: FLAT_ADD_MS,
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
    haptic: haptic,
    choiceShapeScore: choiceShapeScore,
    overdriveBank: overdriveBank,
    overdriveRideGain: overdriveRideGain,
    pacedClockMs: pacedClockMs,
    describeModeClock: describeModeClock
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Polish;
