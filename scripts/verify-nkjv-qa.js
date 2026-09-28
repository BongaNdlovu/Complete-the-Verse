const { loadBank } = require("./load-bank");
const bank = loadBank("kjv");
const fs = require("fs");
const path = require("path");
const QA = require("./verse-qa");
const dump = JSON.parse(fs.readFileSync(path.join(__dirname, "../content/nkjv/source/nkjv.json"), "utf8"));

function getNkjvText(r) {
  if (r === "1 Thessalonians 5:19") {
    return [dump["1 Thessalonians 5:19"], dump["1 Thessalonians 5:20"], dump["1 Thessalonians 5:21"]].filter(Boolean).join(" ");
  }
  return dump[r] || dump[r.replace(/^Psalm\b/, "Psalms")] || dump[r.replace(/^Psalms\b/, "Psalm")];
}

function clean(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function normWords(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

const STOP = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","up","about","into","over","after","is","are","was","were","be","been","being","have","has","had","do","does","did","shall","will","should","would","may","might","must","can","could","thou","thee","thy","thine","ye","you","your","yours","he","him","his","she","her","hers","it","its","they","them","their","theirs","i","me","my","mine","we","us","our","ours","that","this","these","those"]);

function contentWords(words) {
  return words.filter(w => !STOP.has(w));
}

const { EXPLICIT } = require("./nkjv-alignments");

function align(v, nkjvText) {
  if (EXPLICIT[v.r]) {
    return Object.assign({}, EXPLICIT[v.r]);
  }

  const nkjv = clean(nkjvText);
  if (!nkjv) return null;

  // 1. Direct substring match of answer (case-insensitive)
  const lowerNkjv = nkjv.toLowerCase();
  const lowerA = v.a.toLowerCase().trim();
  const directIdx = lowerNkjv.indexOf(lowerA);
  if (directIdx >= 0) {
    const p = clean(nkjv.slice(0, directIdx));
    const a = nkjv.slice(directIdx, directIdx + lowerA.length);
    const s = clean(nkjv.slice(directIdx + lowerA.length));
    return { p, a, s };
  }

  // 2. Token match for answer with punctuation tolerance
  const nkjvTokens = nkjv.split(" ");
  const nkjvWordTokens = nkjvTokens.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const aWords = normWords(v.a);
  const pWords = normWords(v.p);
  const sWords = normWords(v.s);

  if (aWords.length > 0) {
    for (let i = 0; i <= nkjvWordTokens.length - aWords.length; i++) {
      let match = true;
      for (let j = 0; j < aWords.length; j++) {
        if (nkjvWordTokens[i + j] !== aWords[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        const p = nkjvTokens.slice(0, i).join(" ");
        let a = nkjvTokens.slice(i, i + aWords.length).join(" ");
        const s = nkjvTokens.slice(i + aWords.length).join(" ");
        a = a.replace(/^[“"'(]+/, "").replace(/[”"',.;:!?)]+$/, "");
        return { p, a, s };
      }
    }
  }

  // 3. Content word span matching
  const aContent = contentWords(aWords);
  if (aContent.length >= 1) {
    let bestSpan = null;
    let maxScore = -1;
    for (let i = 0; i < nkjvWordTokens.length; i++) {
      for (let len = Math.max(1, aWords.length - 2); len <= aWords.length + 3 && (i + len) <= nkjvWordTokens.length; len++) {
        const span = nkjvWordTokens.slice(i, i + len);
        let matchCount = 0;
        aContent.forEach(cw => {
          if (span.includes(cw)) matchCount++;
        });
        if (matchCount >= Math.min(2, aContent.length)) {
          const score = (matchCount * 10) - Math.abs(len - aWords.length);
          if (score > maxScore) {
            maxScore = score;
            bestSpan = { start: i, end: i + len };
          }
        }
      }
    }
    if (bestSpan) {
      const p = nkjvTokens.slice(0, bestSpan.start).join(" ");
      let a = nkjvTokens.slice(bestSpan.start, bestSpan.end).join(" ");
      const s = nkjvTokens.slice(bestSpan.end).join(" ");
      a = a.replace(/^[“"'(]+/, "").replace(/[”"',.;:!?)]+$/, "");
      return { p, a, s };
    }
  }

  // 4. Prefix / Suffix boundary matching
  let pEndToken = 0;
  if (pWords.length > 0) {
    for (let len = Math.min(4, pWords.length); len >= 1; len--) {
      const sliceP = pWords.slice(-len);
      let found = -1;
      for (let i = 0; i <= nkjvWordTokens.length - len; i++) {
        let m = true;
        for (let j = 0; j < len; j++) {
          if (nkjvWordTokens[i + j] !== sliceP[j]) { m = false; break; }
        }
        if (m) found = i + len;
      }
      if (found >= 0) {
        pEndToken = found;
        break;
      }
    }
  }

  let sStartToken = nkjvWordTokens.length;
  if (sWords.length > 0) {
    for (let len = Math.min(4, sWords.length); len >= 1; len--) {
      const sliceS = sWords.slice(0, len);
      let found = -1;
      for (let i = pEndToken; i <= nkjvWordTokens.length - len; i++) {
        let m = true;
        for (let j = 0; j < len; j++) {
          if (nkjvWordTokens[i + j] !== sliceS[j]) { m = false; break; }
        }
        if (m) { found = i; break; }
      }
      if (found >= 0) {
        sStartToken = found;
        break;
      }
    }
  }

  if (pEndToken < sStartToken && sStartToken <= nkjvWordTokens.length) {
    const p = nkjvTokens.slice(0, pEndToken).join(" ");
    let a = nkjvTokens.slice(pEndToken, sStartToken).join(" ");
    const s = nkjvTokens.slice(sStartToken).join(" ");
    a = a.replace(/^[“"'(]+/, "").replace(/[”"',.;:!?)]+$/, "");
    if (a.length > 0) {
      return { p, a, s };
    }
  }

  return null;
}

// Modernize archaic pronouns in distractors so they don't get flagged as register swaps or archaic
function modernizeDistractor(d) {
  return d
    .replace(/\bthee\b/gi, "you")
    .replace(/\bthou\b/gi, "you")
    .replace(/\bthy\b/gi, "your")
    .replace(/\bthine\b/gi, "your")
    .replace(/\bye\b/gi, "you")
    .replace(/\bhath\b/gi, "has")
    .replace(/\bdoth\b/gi, "does")
    .replace(/\bunto\b/gi, "to")
    .replace(/\bart\b/gi, "are")
    .replace(/\bshalt\b/gi, "shall")
    .replace(/\bwilt\b/gi, "will")
    .replace(/\bwhoso\b/gi, "whoever")
    .replace(/\bwhosoever\b/gi, "whoever");
}

function hasRegisterSwap(a, d) {
  if (!QA.detectRegisterSwap) return false;
  const res = QA.detectRegisterSwap({ a: a, d: [d] });
  return res && res.length > 0;
}

function hasFunctionSwap(a, d) {
  if (!QA.detectFunctionSwap) return false;
  const res = QA.detectFunctionSwap({ a: a, d: [d] });
  return res && res.length > 0;
}

function hasContainment(a, d) {
  if (!QA.detectContainment) return false;
  const res = QA.detectContainment({ a: a, d: [d] });
  return res && res.length > 0;
}

function isDistinct(a, d) {
  return normWords(a).join(" ") !== normWords(d).join(" ");
}

function adaptDistractors(v, aligned, nkjvText) {
  if (EXPLICIT[v.r] && EXPLICIT[v.r].d && EXPLICIT[v.r].d.length === 3) {
    return EXPLICIT[v.r].d.slice();
  }

  const answer = aligned.a.toLowerCase().trim();
  const lowerVerse = nkjvText.toLowerCase();
  const out = [];
  const seen = new Set([answer, normWords(answer).join(" ")]);

  function tryAdd(candidate) {
    if (!candidate) return false;
    const cleanCand = clean(candidate).replace(/^[“"'(]+/, "").replace(/[”"',.;:!?)]+$/, "");
    if (!cleanCand) return false;
    const lower = cleanCand.toLowerCase();
    const normed = normWords(cleanCand).join(" ");
    if (lowerVerse.includes(lower)) return false;
    if (seen.has(lower) || seen.has(normed)) return false;
    if (hasRegisterSwap(aligned.a, cleanCand)) return false;
    if (hasFunctionSwap(aligned.a, cleanCand)) return false;
    if (hasContainment(aligned.a, cleanCand)) return false;
    if (!isDistinct(aligned.a, cleanCand)) return false;

    out.push(cleanCand);
    seen.add(lower);
    seen.add(normed);
    return true;
  }

  // 1. If KJV answer differs, test it as a distractor
  if (v.a.toLowerCase().trim() !== answer) {
    tryAdd(v.a);
    if (out.length < 3) tryAdd(modernizeDistractor(v.a));
  }

  // 2. Existing KJV distractors
  (v.d || []).forEach(d => {
    if (out.length >= 3) return;
    if (!tryAdd(d)) {
      tryAdd(modernizeDistractor(d));
    }
  });

  return out.slice(0, 3);
}

// Build and test all verses
const nkjvVerses = [];
bank.VERSES.forEach(v => {
  const text = getNkjvText(v.r);
  const aligned = align(v, text);
  if (!aligned) throw new Error("Could not align: " + v.r);

  const distractors = adaptDistractors(v, aligned, text);
  // Ensure exactly 3 distractors
  if (distractors.length < 3) {
    const backupPool = [
      "walk in His righteousness",
      "praise the Lord of hosts",
      "keep His holy commandments",
      "remember His lovingkindness",
      "seek His face continually",
      "abide in His eternal peace"
    ];
    for (const b of backupPool) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(b) && !text.toLowerCase().includes(b.toLowerCase())) {
        distractors.push(b);
      }
    }
  }

  const item = {
    b: v.b,
    r: v.r,
    t: v.t,
    p: aligned.p,
    a: aligned.a,
    s: aligned.s,
    d: distractors
  };
  if (aligned.qaOk) item.qaOk = aligned.qaOk.slice();
  else if (v.qaOk) item.qaOk = v.qaOk.slice();
  if (v.typed) item.typed = true;
  if (v.mechanic) item.mechanic = v.mechanic;
  nkjvVerses.push(item);
});

console.log("Built " + nkjvVerses.length + " verses.");
const vRes = QA.auditBank(nkjvVerses);
console.log("Clean: " + vRes.clean + " / " + vRes.total);
console.log("Failing: " + vRes.failing.length);

const byCode = {};
vRes.failing.forEach(x => {
  x.flags.forEach(f => { byCode[f.code] = (byCode[f.code] || 0) + 1; });
});
console.log("Flags by code:", byCode);

console.log("FAILING REFS (" + vRes.failing.length + "):");
vRes.failing.forEach(f => {
  console.log(f.verse.r + ' | "' + f.verse.a + '" => ' + f.flags.map(x => x.code + ": " + x.detail).join("; "));
});
