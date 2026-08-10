#!/usr/bin/env node
/* One-shot: split the current bank into what survives the gate and what
   does not, writing the failures out as a re-authoring queue rather than
   deleting them. The references were never the problem — the generated
   blanks and distractors were. Someone can work back through this list
   and write proper items for each.

     node scripts/quarantine.js
*/
const fs = require("fs");
const path = require("path");
const { loadBank } = require("./load-bank");
const QA = require("./verse-qa");

const bank = loadBank();
const V = bank.VERSES;
const errorsOf = v => QA.auditVerse(v).filter(f => f.severity === "error");

const failing = V.filter(v => errorsOf(v).length);
const out = failing.map(v => ({
  book: v.b, ref: v.r, tier: v.t,
  blank: v.a,
  distractors: v.d,
  verse: QA.fullVerse(v),
  reasons: [...new Set(errorsOf(v).map(f => f.code))],
  detail: errorsOf(v).map(f => f.detail)
}));

const byBook = {};
out.forEach(x => { (byBook[x.book] = byBook[x.book] || []).push(x); });
const byReason = {};
out.forEach(x => x.reasons.forEach(r => { byReason[r] = (byReason[r] || 0) + 1; }));

const dir = path.join(__dirname, "..", "content");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "quarantine.json"), JSON.stringify(out, null, 1));

const md = [
  "# Quarantined verses — re-authoring queue",
  "",
  "These " + out.length + " entries were cut from the playable bank because they fail",
  "`node scripts/qa-verses.js`. **The references are good; the generated blanks and",
  "distractors are not.** Nothing here is lost — each row below is a verse worth",
  "including once someone writes a real blank and three real distractors for it.",
  "",
  "Rules of thumb when re-authoring:",
  "",
  "- The blank must be a phrase you could hold in your head, not a word window.",
  "- Every distractor must be wrong *about Scripture*. If grammar alone eliminates",
  "  it, it is not a distractor.",
  "- Modernising the archaic form (`thee` -> `you`) is a giveaway, not a distractor.",
  "- Never reuse a phrase that already appears elsewhere in the same verse.",
  "",
  "Re-run the gate after each batch. Failures by rule:",
  "",
  ...Object.keys(byReason).sort((a, b) => byReason[b] - byReason[a])
    .map(k => "- `" + k + "` — " + byReason[k]),
  ""
];
Object.keys(byBook).forEach(b => {
  md.push("## " + b + " (" + byBook[b].length + ")", "");
  byBook[b].forEach(x => {
    md.push("- **" + x.ref + "** (tier " + x.tier + ") — blank was `" + x.blank + "`  ");
    md.push("  _" + x.reasons.join(", ") + "_");
  });
  md.push("");
});
fs.writeFileSync(path.join(dir, "QUARANTINE.md"), md.join("\n"));

console.log("quarantined " + out.length + " entries across " + Object.keys(byBook).length + " books");
console.log("  content/quarantine.json  (data)");
console.log("  content/QUARANTINE.md    (re-authoring queue)");
