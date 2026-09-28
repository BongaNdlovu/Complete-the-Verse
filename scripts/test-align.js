const { loadBank } = require("./load-bank");
const bank = loadBank("kjv");
const fs = require("fs");
const path = require("path");
const dump = JSON.parse(fs.readFileSync(path.join(__dirname, "../content/nkjv/source/nkjv.json"), "utf8"));

// Expand multi-verse for known spanning items like 1 Thess 5:19
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

// Stop words for content word checking
const STOP = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","up","about","into","over","after","is","are","was","were","be","been","being","have","has","had","do","does","did","shall","will","should","would","may","might","must","can","could","thou","thee","thy","thine","ye","you","your","yours","he","him","his","she","her","hers","it","its","they","them","their","theirs","i","me","my","mine","we","us","our","ours","that","this","these","those"]);

function contentWords(words) {
  return words.filter(w => !STOP.has(w));
}

const SPECIAL_ALIGN = {
  "Ezra 7:10": { p: "For Ezra had prepared his heart to seek the Law of the Lord, and to do it, and to teach", a: "statutes and ordinances", s: "in Israel." },
  "Zephaniah 3:17": { p: "The Lord your God in your midst, The Mighty One, will save; He will rejoice over you with gladness, He will quiet you with His love,", a: "He will rejoice over you with singing", s: ".”" },
  "Zechariah 1:3": { p: "Therefore say to them, ‘Thus says the Lord of hosts: “", a: "Return to Me", s: ",” says the Lord of hosts, “and I will return to you,” says the Lord of hosts." },
  "James 2:17": { p: "Thus also faith", a: "by itself", s: ", if it does not have works, is dead." }
};

function align(v, nkjvText) {
  if (SPECIAL_ALIGN[v.r]) {
    return Object.assign({}, SPECIAL_ALIGN[v.r]);
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

let okCount = 0;
let failCount = 0;
const fails = [];

bank.VERSES.forEach(v => {
  const text = getNkjvText(v.r);
  const res = align(v, text);
  if (res && res.a) okCount++;
  else {
    failCount++;
    fails.push({ r: v.r, origA: v.a, text });
  }
});

console.log("Aligned:", okCount, "/ 899");
console.log("Failed :", failCount);
