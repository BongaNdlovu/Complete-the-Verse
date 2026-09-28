#!/usr/bin/env node
/* Scratch probe: does scripts/nkjv-alignments.js (EXPLICIT) agree with the
   licensed NKJV text? Prints per-entry drift so we can tell a good curated
   alignment from a paraphrase. */
const { EXPLICIT } = require("./nkjv-alignments");
const { loadSourceDump } = require("./nkjv-parse");
const A = require("./nkjv-align");

const src = loadSourceDump().verses;
const SPLIT = {
  "1 Thessalonians 5:19": ["1 Thessalonians 5:19", "1 Thessalonians 5:20", "1 Thessalonians 5:21"]
};
function sourceFor(ref) {
  const list = SPLIT[ref] || [ref, ref.replace(/^Psalm\b/, "Psalms")];
  for (const r of list) if (src[r]) return list.map(x => src[x]).filter(Boolean).join(" ");
  return null;
}

const keys = Object.keys(EXPLICIT);
let noSource = 0, inText = 0, near = 0, far = 0;
const drift = [];

keys.forEach(ref => {
  const text = sourceFor(ref);
  if (!text) { noSource++; drift.push({ ref, verdict: "no-source" }); return; }
  const e = EXPLICIT[ref];
  const nt = A.norm(text);
  const ea = A.norm(e.a);
  if (nt.includes(ea)) { inText++; return; }
  // How many of the curated answer's words appear in the NKJV verse at all?
  const words = ea.split(" ").filter(Boolean);
  const hit = words.filter(w => nt.split(" ").some(t => A.sameWord(t, w))).length;
  const ratio = words.length ? hit / words.length : 0;
  const entry = { ref, curated: e.a, ratio: Math.round(ratio * 100), src: text.slice(0, 160) };
  if (ratio >= 0.6) near++; else far++;
  drift.push(entry);
});

console.log("EXPLICIT entries:", keys.length);
console.log("no source:", noSource, "| answer literally in NKJV:", inText,
  "| >=60% words present:", near, "| <60% words present:", far);

console.log("\n--- low overlap (curated wording does not match NKJV) ---");
drift.filter(d => d.verdict !== "no-source" && d.ratio !== undefined && d.ratio < 60)
  .slice(0, 40)
  .forEach(d => {
    console.log("\n" + d.ref + "  (" + d.ratio + "% overlap)");
    console.log("  curated: " + d.curated);
    console.log("  nkjv   : " + d.src);
  });
