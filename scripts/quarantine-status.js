#!/usr/bin/env node
/* Cross-references content/quarantine.json against the live bank and
   marks the entries that have since been re-authored, so the queue stays
   honest as it is worked through.

   An entry counts as resolved when its reference is back in the bank.
   Note that a re-authored verse often keeps the same blank — the blank
   was rarely the problem; the distractors were — so matching on the
   reference is the right test, and the gate is what guarantees the new
   version is actually sound.

     node scripts/quarantine-status.js          report
     node scripts/quarantine-status.js --write  report and rewrite the queue
*/
const fs = require("fs");
const path = require("path");
const { loadBank } = require("./load-bank");
const QA = require("./verse-qa");

const write = process.argv.includes("--write");
const dir = path.join(__dirname, "..", "content");
const queue = JSON.parse(fs.readFileSync(path.join(dir, "quarantine.json"), "utf8"));
const bank = loadBank();

const liveRefs = new Set(bank.VERSES.map(v => QA.norm(v.r)));
const liveExact = new Map();
bank.VERSES.forEach(v => liveExact.set(QA.norm(v.r) + "||" + QA.norm(v.a), v));

let resolved = 0;
queue.forEach(q => {
  const v = liveExact.get(QA.norm(q.ref) + "||" + QA.norm(q.blank));
  q.resolved = liveRefs.has(QA.norm(q.ref));
  q.sameBlank = !!v;
  if(q.resolved) resolved++;
  // A re-authored entry must not have shipped the old broken options.
  if(v && JSON.stringify(v.d) === JSON.stringify(q.distractors))
    console.error("  WARNING " + q.ref + " is live with its quarantined distractors");
});

const open = queue.filter(q => !q.resolved);
const byBook = {};
open.forEach(x => { (byBook[x.book] = byBook[x.book] || []).push(x); });
const byReason = {};
open.forEach(x => x.reasons.forEach(r => { byReason[r] = (byReason[r] || 0) + 1; }));

console.log("quarantine: " + queue.length + " entries · " + resolved + " re-authored · " + open.length + " still open");

if(!write){ console.log("(run with --write to update content/QUARANTINE.md)"); process.exit(0); }

fs.writeFileSync(path.join(dir, "quarantine.json"), JSON.stringify(queue, null, 1));
const md = [
  "# Quarantined verses — re-authoring queue",
  "",
  "`" + queue.length + "` entries were cut from the playable bank because they failed",
  "`node scripts/qa-verses.js`. **The references are good; the generated blanks and",
  "distractors are not.** Nothing here is lost — each row is a verse worth including",
  "once someone writes a real blank and three real distractors for it.",
  "",
  "**" + resolved + " re-authored · " + open.length + " still open.**",
  "Run `node scripts/quarantine-status.js` to refresh these counts.",
  "",
  "## How to re-author one",
  "",
  "- The blank must be a phrase you could hold in your head, not a word window.",
  "  In most of these entries the blank was the problem; in the rest it was fine and",
  "  only the distractors needed rewriting.",
  "- Every distractor must be wrong *about Scripture*. If grammar alone eliminates it,",
  "  it is not a distractor.",
  "- Modernising the archaic form (`thee` -> `you`) is a giveaway, not a distractor.",
  "- Never reuse a phrase that already appears elsewhere in the same verse, unless the",
  "  confusion is the point — then add `qaOk:[\"recycled\"]` and say why in a comment.",
  "",
  "Add the finished entry to `js/verses-more.js` (hand-authored; safe from",
  "regeneration) — not `js/verses-extra.js`, which `build-verse-extra.js`",
  "overwrites. Then re-run the gate.",
  "",
  "## Still open, by rule",
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
console.log("wrote content/QUARANTINE.md");
