#!/usr/bin/env node
/* The content gate. Exits non-zero when the bank contains a verse that
   cannot teach. Run it before shipping any change to js/verses*.js.

     node scripts/qa-verses.js            summary + first failures
     node scripts/qa-verses.js --all      every failure
     node scripts/qa-verses.js --json     machine-readable
*/
const { loadBank } = require("./load-bank");
const QA = require("./verse-qa");

const args = process.argv.slice(2);
const showAll = args.includes("--all");
const asJson = args.includes("--json");

const bank = loadBank();
const verses = bank.VERSES || [];
const passageBlanks = (bank.PASSAGES || []).flatMap(QA.passageToVerses);

const vRes = QA.auditBank(verses);
const pRes = QA.auditBank(passageBlanks);

const byCode = {};
[...vRes.failing, ...pRes.failing].forEach(x =>
  x.flags.forEach(f => { byCode[f.code] = (byCode[f.code] || 0) + 1; }));

if(asJson){
  console.log(JSON.stringify({
    verses:{total:vRes.total, clean:vRes.clean, failing:vRes.failing.length, bank:vRes.bank},
    passageBlanks:{total:pRes.total, clean:pRes.clean, failing:pRes.failing.length},
    byCode,
    failures:[...vRes.failing, ...pRes.failing].map(x => ({
      r:x.verse.r, a:x.verse.a, flags:x.flags.map(f => f.code), detail:x.flags.map(f => f.detail)
    }))
  }, null, 2));
  process.exit(vRes.ok && pRes.ok ? 0 : 1);
}

const pct = (n, d) => d ? Math.round(n / d * 100) + "%" : "—";
const line = (label, r) => label + " " + r.clean + " / " + r.total + " clean (" + pct(r.clean, r.total) +
  ")  " + r.failing.length + " error · " + r.warned.length + " warn · " + r.waived.length + " waived";
console.log(line("Verses        ", vRes));
console.log(line("Passage blanks", pRes));
[...vRes.waived, ...pRes.waived].forEach(x => {
  const w = x.flags.filter(f => f.severity === "waived").map(f => f.code).join(", ");
  console.log("  WAIVED  " + x.verse.r + " — " + w);
});
if(Object.keys(byCode).length){
  console.log("\nFlags by rule:");
  Object.keys(byCode).sort((a,b) => byCode[b] - byCode[a])
    .forEach(k => console.log("  " + String(byCode[k]).padStart(4) + "  " + k));
}
[...vRes.bank, ...pRes.bank].forEach(f => console.log("  BANK  " + f.code + ": " + f.detail));

const failures = [...vRes.failing, ...pRes.failing];
if(failures.length){
  console.log("\nFailures" + (showAll ? "" : " (first 25 — use --all for every one)") + ":");
  (showAll ? failures : failures.slice(0, 25)).forEach(x => {
    console.log("  " + x.verse.r + '  "' + x.verse.a + '"');
    x.flags.forEach(f => console.log("        - " + f.code + ": " + f.detail));
  });
}

const ok = vRes.ok && pRes.ok;
console.log("\n" + (ok ? "PASS — verse bank is clean" : "FAIL — " + failures.length + " entries must be repaired or cut"));
process.exit(ok ? 0 : 1);
