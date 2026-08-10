#!/usr/bin/env node
/* RETIRED — superseded by scripts/qa-verses.js.
 *
 * This script reported "0 mechanical flags" on a bank in which 296 of 309
 * entries could not teach anything: it only looked for anagram-style
 * reorderings and punctuation-only duplicates, so it never saw a
 * distractor lifted verbatim out of the verse, a blank cut mid-phrase, or
 * an archaic form swapped for its modern equivalent.
 *
 * A gate that passes junk is worse than no gate, because it is cited as
 * evidence. It is left here only so that anything still calling it is
 * redirected rather than silently reassured.
 */
console.error("scripts/qa-verses-extra.js has been retired — it passed content it should have failed.");
console.error("Use:  node scripts/qa-verses.js  (add --all for every failure, --json to script it)");
process.exit(2);
