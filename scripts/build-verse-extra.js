#!/usr/bin/env node
/**
 * RETIRED GENERATOR — do not run this to rebuild the bank.
 *
 * This produced js/verses-extra.js by slicing word windows out of fetched
 * KJV text and deriving distractors mechanically. 296 of its 309 entries
 * failed the content gate: 248 handed the player a distractor lifted
 * verbatim out of the same verse, 148 cut the blank mid-phrase, 71 merely
 * modernised the archaic wording. js/verses-extra.js is now hand-written,
 * and running this would overwrite it with that output again.
 *
 * It is kept because its reference list and fetch logic are a reasonable
 * starting point for re-authoring the queue in content/QUARANTINE.md —
 * but its blank-cutting and distractor generation are what has to change,
 * and anything it emits must pass `node scripts/qa-verses.js`.
 *
 * Run: node scripts/build-verse-extra.js --i-know-this-overwrites-hand-written-content
 */
const fs = require("fs");
const path = require("path");

if(!process.argv.includes("--i-know-this-overwrites-hand-written-content")){
  console.error("REFUSED — this generator would overwrite the hand-written js/verses-extra.js");
  console.error("with the output that failed the content gate 296 times.");
  console.error("");
  console.error("To re-author cut verses see content/QUARANTINE.md, and verify with:");
  console.error("  node scripts/qa-verses.js");
  process.exit(2);
}

const ROOT = path.join(__dirname, "..");
const VERSES_PATH = path.join(ROOT, "js/verses.js");
const OUT_PATH = path.join(ROOT, "js/verses-extra.js");
const TARGET_TOTAL = 500;
const MIN_TOTAL = 400;
const MAX_TOTAL = 600;

const BOOKS_ORDER = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah",
  "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
  "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

// Curated plans: { ref: "chapter:verse", t: tier, a?: exact answer, d?: distractors }
const { PLANS } = require("./verse-extra-plans");

const OVERRIDES = new Map();
for (const [book, items] of Object.entries(PLANS)) {
  for (const item of items) {
    if (item.a) OVERRIDES.set(`${book}|${item.ref}`, item);
  }
}

function loadExistingRefs() {
  const src = fs.readFileSync(VERSES_PATH, "utf8");
  const refs = new Set();
  const re = /r:"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) refs.add(m[1]);
  const counts = {};
  const re2 = /\{b:"([^"]+)",r:"([^"]+)"/g;
  while ((m = re2.exec(src))) counts[m[1]] = (counts[m[1]] || 0) + 1;
  return { refs, counts, baseCount: refs.size };
}

function refLabel(book, ref) {
  if (book === "Psalms") return `Psalm ${ref}`;
  return `${book} ${ref}`;
}

function apiRef(book, ref) {
  return encodeURIComponent(`${book} ${ref}`);
}

function normalize(text) {
  return text.replace(/\s+/g, " ").replace(/\u2019/g, "'").trim();
}

const STOP = new Set([
  "a", "an", "the", "and", "but", "for", "nor", "or", "so", "yet", "to", "of", "in", "on", "at",
  "by", "with", "from", "into", "unto", "upon", "that", "which", "who", "whom", "whose",
  "this", "these", "those", "it", "its", "he", "she", "they", "we", "ye", "thou", "thee", "thy",
  "his", "her", "their", "our", "your", "my", "me", "him", "them", "us", "be", "is", "are", "was",
  "were", "been", "being", "have", " hath", "had", "do", "did", "done", "shall", "will", "would",
  "should", "may", "might", "must", "can", "could", "not", "no", "if", "as", "when", "where",
  "while", "then", "there", "here", "also", "even", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "than", "too", "very", "saith", "said", "saying", "say",
]);

const KEYWORDS =
  /LORD|God|Christ|Jesus|Spirit|spirit|faith|love|heart|soul|peace|righteousness|salvation|mercy|grace|truth|life|death|sin|heaven|earth|word|light|glory|power|kingdom|holy|everlasting|eternal|righteous|wicked|prayer|praise|bless|covenant|redeem|shepherd|vine|bread|water|fire|blood|cross|resurrection|repent|forgive|commandment|scripture|prophecy|angel|devil|world|flesh|hope|joy|wisdom|knowledge|understanding|strength|deliver|save|sanctif|justif|comfort|abide|dwell|trust|believe|confess|witness|testimony|temple|altar|sacrifice|offering|priest|prophet|king|servant|son|daughter|children|brethren|church|gospel|apostle|disciple|sheep|wolf|lion|lamb|gold|silver|stone|rock|mountain|river|sea|wind|cloud|rain|star|sun|moon|light|darkness|morning|night|day|way|path|gate|door|key|name|voice|hand|eye|face|mouth|lip|tongue|ear|foot|head|body|bone|flesh|blood|wine|oil|salt|bread|meat|table|house|land|nation|people|man|woman|child|seed|fruit|tree|branch|root|harvest|field|work|labour|rest|sleep|awake|rise|fall|stand|walk|run|fly|come|go|send|give|take|receive|bring|bear|carry|lift|cast|break|bind|loose|open|shut|knock|call|cry|hear|see|know|think|remember|forget|fear|afraid|ashamed|glad|rejoice|mourn|weep|sing|speak|tell|declare|preach|teach|learn|understand|wise|fool|rich|poor|humble|proud|meek|gentle|kind|good|evil|clean|unclean|pure|perfect|upright|faithful|true|false|vanity|forever|ever|never|always|all things|no man|every man/i;

function scorePhrase(phrase, tier, startIdx, totalWords) {
  const words = phrase.split(/\s+/);
  if (words.length < 2 || words.length > 6) return -1;
  if (phrase.length < 5) return -1;
  // Need readable context before the blank (match base bank style).
  if (startIdx < 3) return -1;
  if (totalWords - (startIdx + words.length) < 1 && startIdx < 4) return -1;
  if (words.length === 2 && STOP.has(words[0].toLowerCase().replace(/[^a-z']/g, ""))) return -1;
  let score = words.length * 3;
  if (KEYWORDS.test(phrase)) score += 12;
  if (/^I AM|Son of man|kingdom of|house of|children of|word of|spirit of/i.test(phrase)) score += 8;
  if (/[;:,]$/.test(phrase)) score -= 3;
  if (tier <= 2 && /LORD|God|love|faith|heart|peace|life|truth|grace|mercy|salvation|Christ|Jesus/i.test(phrase))
    score += 6;
  if (tier >= 4 && words.length >= 3) score += 4;
  // Prefer mid-verse blanks.
  const mid = totalWords / 2;
  const center = startIdx + words.length / 2;
  score += Math.max(0, 8 - Math.abs(center - mid));
  const last = words[words.length - 1].toLowerCase().replace(/[^a-z']/g, "");
  if (["the", "a", "an", "of", "to", "and", "in", "on", "for", "with"].includes(last)) score -= 14;
  if (words.length === 1) score -= 20;
  return score;
}

function pickBlankFallback(text) {
  const words = text.split(/\s+/);
  for (const len of [5, 4, 3, 2]) {
    for (let i = 3; i <= words.length - len - 1; i++) {
      const phrase = words.slice(i, i + len).join(" ");
      if (phrase.length < 5) continue;
      if (findAnswer(text, phrase)) return phrase;
    }
  }
  return null;
}

function pickBlank(text, tier) {
  const words = text.split(/\s+/);
  let best = null;
  for (let len = 6; len >= 2; len--) {
    for (let i = 3; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(" ");
      const score = scorePhrase(phrase, tier, i, words.length);
      if (score < 0) continue;
      if (!best || score > best.score) best = { phrase, score, i };
    }
  }
  return best;
}

const SWAP_PAIRS = [
  ["LORD", "God"],
  ["Lord", "God"],
  ["God", "LORD"],
  ["the LORD", "the Lord"],
  ["Jehovah", "the LORD"],
  ["thou", "you"],
  ["thee", "you"],
  ["thy", "your"],
  ["thine", "your"],
  ["ye", "you"],
  ["shall", "will"],
  ["shalt", "shall"],
  ["hath", "has"],
  ["doth", "does"],
  ["unto", "to"],
  ["verily", "truly"],
  ["everlasting", "eternal"],
  ["eternal", "everlasting"],
  ["hold", "keep"],
  ["keep", "hold"],
  ["soul", "spirit"],
  ["spirit", "soul"],
  ["heart", "mind"],
  ["mind", "heart"],
  ["world", "earth"],
  ["earth", "world"],
  ["righteousness", "righteousness of God"],
  ["faith", "belief"],
  ["repent", "turn"],
  ["repentance", "salvation"],
  ["holy", "righteous"],
  ["wicked", "evil"],
  ["evil", "wicked"],
  ["salvation", "redemption"],
  ["grace", "mercy"],
  ["mercy", "grace"],
  ["truth", "light"],
  ["light", "truth"],
  ["peace", "rest"],
  ["rest", "peace"],
  ["love", "charity"],
  ["charity", "love"],
  ["behold", "see"],
  ["saith", "says"],
  ["saith the LORD", "says the Lord"],
  ["living", "live"],
  ["living soul", "living being"],
  ["heaven and earth", "heavens and earth"],
  ["heavens and the earth", "heaven and the earth"],
  ["Son of God", "Son of man"],
  ["Son of man", "Son of God"],
  ["kingdom of God", "kingdom of heaven"],
  ["kingdom of heaven", "kingdom of God"],
  ["Holy Ghost", "Holy Spirit"],
  ["Holy Spirit", "Holy Ghost"],
  ["comforter", "advocate"],
  ["only begotten", "beloved"],
  ["begotten Son", "beloved Son"],
  ["confess", "profess"],
  ["believe", "trust"],
  ["trust", "believe"],
  ["abide", "remain"],
  ["remain", "abide"],
  ["dwelleth", "lives"],
  ["fear not", "be not afraid"],
  ["be not afraid", "fear not"],
  ["good courage", "great courage"],
  ["living water", "water of life"],
  ["bread of life", "living bread"],
  ["word of God", "word of the Lord"],
  ["word of the LORD", "word of God"],
  ["name of the LORD", "name of the Lord"],
  ["house of the LORD", "house of God"],
  ["day of the LORD", "day of the Lord"],
  ["spirit of the LORD", "Spirit of God"],
  ["Spirit of God", "spirit of the LORD"],
  ["children of Israel", "people of Israel"],
  ["children of God", "sons of God"],
  ["law of the LORD", "law of God"],
  ["law of God", "law of the LORD"],
  ["face of the LORD", "presence of the LORD"],
  ["presence of the LORD", "face of the LORD"],
  ["arm of the LORD", "hand of the LORD"],
  ["hand of the LORD", "arm of the LORD"],
  ["voice of the LORD", "voice of God"],
  ["mountains", "hills"],
  ["hills", "mountains"],
  ["forever", "for ever"],
  ["for ever", "forever"],
  ["for ever and ever", "forever and ever"],
  ["without ceasing", "continually"],
  ["continually", "without ceasing"],
  ["hold your peace", "keep silence"],
  ["keep silence", "hold your peace"],
  ["living soul", "living creature"],
  ["living creature", "living soul"],
  ["firmament", "expanse"],
  ["expanse", "firmament"],
  ["conversation", "conduct"],
  ["conduct", "conversation"],
  ["variableness", "variation"],
  ["variation", "variableness"],
  ["peculiar people", "chosen people"],
  ["chosen people", "peculiar people"],
  ["quick", "living"],
  ["quick and powerful", "living and active"],
  ["twoedged sword", "sharp sword"],
  ["stablish", "establish"],
  ["establish", "stablish"],
  ["hinds' feet", "deer's feet"],
  ["strong hold", "strong tower"],
  ["strong tower", "strong hold"],
  ["fat of rams", "blood of bulls"],
  ["burnt offerings", "sacrifices"],
  ["Prince of Peace", "Prince of Life"],
  ["I AM THAT I AM", "I AM WHO I AM"],
  ["I AM WHO I AM", "I AM THAT I AM"],
  ["still small voice", "gentle whisper"],
  ["golden image", "image of gold"],
  ["dry bones", "dead bones"],
  ["stony heart", "heart of stone"],
  ["heart of stone", "stony heart"],
  ["windows of heaven", "floodgates of heaven"],
  ["teach all nations", "make disciples of all nations"],
  ["make disciples of all nations", "teach all nations"],
  ["everlasting life", "eternal life"],
  ["eternal life", "everlasting life"],
  ["root of all evil", "root of every kind of evil"],
  ["inspiration of God", "breath of God"],
  ["sound mind", "sound spirit"],
  ["sound spirit", "sound mind"],
  ["rightly dividing", "rightly handling"],
  ["rightly handling", "rightly dividing"],
  ["must be saved", "shall be saved"],
  ["shall be saved", "must be saved"],
  ["walk in truth", "walk in the truth"],
  ["delivered unto the saints", "entrusted to the saints"],
];

function applySwap(text, from, to) {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "g");
  if (!re.test(text)) return null;
  return text.replace(re, to);
}

function reorderWords(phrase) {
  return null;
}

function dropWord(phrase) {
  return null;
}

function addWord(phrase) {
  return null;
}

function normKey(s) {
  return s.toLowerCase().replace(/[.,;:!?"""']/g, "").replace(/\s+/g, " ").trim();
}

function isWordSwapOnly(a, b) {
  const aw = normKey(a).split(/\s+/).filter(Boolean).sort().join(" ");
  const bw = normKey(b).split(/\s+/).filter(Boolean).sort().join(" ");
  return aw === bw && normKey(a) !== normKey(b);
}

function generateDistractors(answer, text) {
  const out = [];
  const seen = new Set([normKey(answer)]);
  const push = (d) => {
    if (!d || d.length < 2) return;
    const k = normKey(d);
    if (!k || seen.has(k) || isWordSwapOnly(answer, d)) return;
    if (k === normKey(answer)) return;
    seen.add(k);
    out.push(d.trim());
  };

  for (const [from, to] of SWAP_PAIRS) {
    push(applySwap(answer, from, to));
  }

  // Nearby phrases from the same verse (same length) — common memory traps.
  const idx = text.indexOf(answer);
  if (idx >= 0) {
    const words = text.split(/\s+/);
    const aw = answer.split(/\s+/).length;
    const start = text.slice(0, idx).trim() ? text.slice(0, idx).trim().split(/\s+/).length : 0;
    for (const off of [-aw - 1, aw + 1, -aw - 2, aw + 2, -aw, aw]) {
      const i = start + off;
      if (i >= 0 && i + aw <= words.length) {
        push(words.slice(i, i + aw).join(" "));
      }
    }
  }

  // Semantic / modernization traps (not punctuation clones).
  const modern = [
    answer.replace(/\bthou\b/gi, "you").replace(/\bthee\b/gi, "you").replace(/\bthy\b/gi, "your").replace(/\bye\b/gi, "you"),
    answer.replace(/\bhath\b/gi, "has").replace(/\bdoth\b/gi, "does").replace(/\bshalt\b/gi, "shall"),
    answer.replace(/\bunto\b/gi, "to").replace(/\bverily\b/gi, "truly"),
    answer.replace(/\bLORD\b/g, "Lord").replace(/\bHoly Ghost\b/g, "Holy Spirit"),
    answer.replace(/\bcharity\b/gi, "love").replace(/\blove\b/gi, "charity"),
    answer.replace(/\beverlasting\b/gi, "eternal").replace(/\beternal\b/gi, "everlasting"),
  ];
  modern.forEach(push);

  const pads = [
    answer.replace(/\bthe\b/i, "a"),
    answer.replace(/\bof\b/i, "in"),
    answer.replace(/\band\b/i, "or"),
    answer.replace(/\bin\b/i, "of"),
    answer.replace(/\bnot\b/i, "never"),
  ];
  pads.forEach(push);

  // Last-resort distinct fillers that are not anagrams of the answer.
  const fillers = [
    "the LORD thy God",
    "the kingdom of heaven",
    "everlasting life",
    "the Holy Ghost",
    "my father's house",
    "the word of God",
  ];
  for (const f of fillers) {
    if (out.length >= 3) break;
    push(f);
  }

  return out.slice(0, 3);
}

function stripPunct(s) {
  return s.replace(/[.,;:!?"'\u2019]+/g, "").replace(/\s+/g, " ").trim();
}

function findAnswer(text, answer) {
  const tries = [answer, answer.replace(/[.,;:!?]+$/, ""), answer.replace(/^[.,;:!?\s]+/, "")];
  for (const cand of tries) {
    if (!cand) continue;
    let idx = text.indexOf(cand);
    if (idx >= 0) return { idx, answer: cand };
    const lower = text.toLowerCase();
    const aLower = cand.toLowerCase();
    idx = lower.indexOf(aLower);
    if (idx >= 0) return { idx, answer: text.slice(idx, idx + cand.length) };
  }
  // fuzzy: match answer words consecutively in text
  const words = stripPunct(answer).split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const tw = text.split(/\s+/);
    outer: for (let i = 0; i <= tw.length - words.length; i++) {
      for (let j = 0; j < words.length; j++) {
        if (stripPunct(tw[i + j]).toLowerCase() !== words[j].toLowerCase()) continue outer;
      }
      const phrase = tw.slice(i, i + words.length).join(" ");
      const idx = text.indexOf(phrase);
      if (idx >= 0) return { idx, answer: phrase };
    }
  }
  return null;
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatEntry(entry) {
  const d = entry.d.map((x) => `"${esc(x)}"`).join(",");
  return `{b:"${esc(entry.b)}",r:"${esc(entry.r)}",t:${entry.t},p:"${esc(entry.p)}",a:"${esc(entry.a)}",s:"${esc(entry.s)}",d:[${d}]},`;
}

async function fetchKjv(book, ref) {
  const url = `https://bible-api.com/${apiRef(book, ref)}?translation=kjv`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
      const data = await res.json();
      if (!data.text) continue;
      return normalize(data.text);
    } catch {
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return null;
}

function flattenPlans(existingRefs, baseCounts) {
  const need = TARGET_TOTAL - Object.values(baseCounts).reduce((a, b) => a + b, 0);
  const items = [];

  for (const book of BOOKS_ORDER) {
    const plan = PLANS[book] || [];
    for (const item of plan) {
      const r = refLabel(book, item.ref);
      if (existingRefs.has(r)) continue;
      items.push({ book, ref: item.ref, r, t: item.t, a: item.a, d: item.d });
    }
  }

  // Sort: thin books first, then lower tier first for familiar books
  items.sort((a, b) => {
    const ca = baseCounts[a.book] || 0;
    const cb = baseCounts[b.book] || 0;
    if (ca !== cb) return ca - cb;
    if (a.t !== b.t) return a.t - b.t;
    return 0;
  });

  return { items, need };
}

async function buildEntry(spec, text) {
  const override = OVERRIDES.get(`${spec.book}|${spec.ref}`);
  let answer = spec.a || override?.a;
  let distractors = spec.d || override?.d;
  let found = answer ? findAnswer(text, answer) : null;

  const usableOverride = () => {
    if (!found) return false;
    const pWords = text.slice(0, found.idx).trim().split(/\s+/).filter(Boolean).length;
    const aWords = found.answer.trim().split(/\s+/).length;
    return pWords >= 3 && aWords >= 1 && aWords <= 6;
  };

  if (!usableOverride()) {
    const pick = pickBlank(text, spec.t);
    const phrase = pick?.phrase || pickBlankFallback(text);
    if (!phrase) return null;
    found = findAnswer(text, phrase);
    if (!found) return null;
    distractors = null;
  }
  answer = found.answer;

  const p = text.slice(0, found.idx);
  const s = text.slice(found.idx + answer.length);
  const pWords = p.trim().split(/\s+/).filter(Boolean).length;
  const aWords = answer.trim().split(/\s+/).length;
  if (pWords < 3 || aWords > 6 || aWords < 1) return null;
  if (!p.trim() || (!s.trim() && pWords < 5)) return null;

  let list = (distractors || []).filter(
    (d) => d && normKey(d) !== normKey(answer) && !isWordSwapOnly(answer, d)
  );
  for (const g of generateDistractors(answer, text)) {
    if (list.length >= 3) break;
    if (!list.some((x) => normKey(x) === normKey(g))) list.push(g);
  }
  list = list.slice(0, 3);
  if (list.length < 3) return null;

  return {
    b: spec.book,
    r: spec.r,
    t: spec.t,
    p,
    a: answer,
    s,
    d: list,
  };
}

async function main() {
  const { refs: existingRefs, counts: baseCounts, baseCount } = loadExistingRefs();
  const { items, need } = flattenPlans(existingRefs, baseCounts);

  console.log(`Base verses: ${baseCount}. Target new: ~${need} (${MIN_TOTAL}-${MAX_TOTAL} total).`);
  console.log(`Candidate specs: ${items.length}`);

  const built = [];
  const seen = new Set(existingRefs);
  let fetched = 0;
  let failed = 0;

  for (const spec of items) {
    if (built.length >= need) break;
    if (seen.has(spec.r)) continue;

    const text = await fetchKjv(spec.book, spec.ref);
    fetched++;
    if (!text) {
      failed++;
      continue;
    }

    const entry = await buildEntry(spec, text);
    if (!entry) {
      failed++;
      continue;
    }

    built.push(entry);
    seen.add(spec.r);
    baseCounts[spec.book] = (baseCounts[spec.book] || 0) + 1;

    if (built.length % 25 === 0) {
      console.log(`  built ${built.length}…`);
    }

    // gentle rate limit
    if (fetched % 10 === 0) await new Promise((r) => setTimeout(r, 120));
  }

  // Ensure every book reaches at least 3 verses after merge.
  for (const book of BOOKS_ORDER) {
    while ((baseCounts[book] || 0) < 3) {
      const more = (PLANS[book] || []).find((item) => {
        const r = refLabel(book, item.ref);
        return !seen.has(r);
      });
      if (!more) break;
      const text = await fetchKjv(book, more.ref);
      if (!text) break;
      const entry = await buildEntry(
        { book, ref: more.ref, r: refLabel(book, more.ref), t: more.t, a: more.a, d: more.d },
        text
      );
      if (!entry) {
        seen.add(refLabel(book, more.ref));
        continue;
      }
      built.push(entry);
      seen.add(entry.r);
      baseCounts[book] = (baseCounts[book] || 0) + 1;
    }
  }

  const total = baseCount + built.length;
  if (total < MIN_TOTAL) {
    console.error(`ERROR: only ${total} total verses (need ${MIN_TOTAL}-${MAX_TOTAL}). Built ${built.length} new.`);
    process.exit(1);
  }
  if (total > MAX_TOTAL) {
    // Prefer dropping from fat books, never below floor of 3.
    built.sort((a, b) => (baseCounts[b.b] || 0) - (baseCounts[a.b] || 0));
    while (baseCount + built.length > MAX_TOTAL) {
      const idx = built.findIndex((e) => (baseCounts[e.b] || 0) > 3);
      if (idx < 0) break;
      const [removed] = built.splice(idx, 1);
      baseCounts[removed.b]--;
    }
  }

  const sections = {};
  for (const e of built) {
    if (!sections[e.b]) sections[e.b] = [];
    sections[e.b].push(e);
  }

  let out = "/* Auto-generated by scripts/build-verse-extra.js — do not edit by hand */\n";
  out += "const VERSES_EXTRA = [\n";
  for (const book of BOOKS_ORDER) {
    const rows = sections[book];
    if (!rows?.length) continue;
    out += `\n/* ---------- ${book.toUpperCase()} ---------- */\n`;
    for (const e of rows) out += formatEntry(e) + "\n";
  }
  out += "];\n\n";
  out += "VERSES.push(...VERSES_EXTRA);\n\n";
  out += "const BY_TIER = {1:[],2:[],3:[],4:[],5:[]};\n";
  out += "VERSES.forEach((v,i)=>{ v.id=i; BY_TIER[v.t].push(v); });\n";

  fs.writeFileSync(OUT_PATH, out, "utf8");

  console.log(`\nWrote ${built.length} new verses -> ${OUT_PATH}`);
  console.log(`Final total (when loaded): ${baseCount + built.length}`);
  console.log(`Fetch attempts: ${fetched}, skipped/failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
