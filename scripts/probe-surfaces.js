#!/usr/bin/env node
/* Scratch probe: what does the site / tablet / beat / tutorial content
   actually look like, so the NKJV generator knows which fields are Scripture
   quotations and which are authored prose. */
const S = require("../js/sites");
require("../js/tablets");
require("../js/tablets-canon");
require("../js/tablets-hall");
require("../js/tablets-more");
const { Tablets } = require("../js/tablets");
const Beat = require("../js/beat");

console.log("SITES:", (S.SITES || []).length, "| VIGNETTES:", Object.keys(S.VIGNETTES || {}).length);
const withQuote = (S.SITES || []).filter(s => s.quoteRef);
console.log("sites with quoteRef:", withQuote.length);
console.log(JSON.stringify(withQuote[0], null, 1).slice(0, 1200));
const vk = Object.keys(S.VIGNETTES || {});
console.log("\nvignette keys:", vk.slice(0, 6));
console.log(JSON.stringify(S.VIGNETTES[vk[0]], null, 1).slice(0, 700));

console.log("\n=== TABLETS ===");
console.log("chapters:", (Tablets.chapters || []).length, "| blankS:", Tablets.BLANK_S, "| holdsToOpen:", Tablets.HOLDS_TO_OPEN);
const ch = Tablets.chapters[0];
console.log(JSON.stringify(ch, null, 1).slice(0, 1400));

console.log("\n=== BEAT ===");
console.log("questions:", (Beat.questions || []).length, "cinemaA:", (Beat.cinemaA || []).length, "cinemaB:", (Beat.cinemaB || []).length);
console.log(JSON.stringify((Beat.questions || [])[0], null, 1));
const qWithR = (Beat.questions || []).filter(q => q.r);
console.log("questions with r:", qWithR.length);
console.log(JSON.stringify((Beat.cinemaA || [])[0], null, 1));
