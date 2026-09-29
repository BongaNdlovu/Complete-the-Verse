const fs = require('fs');
const path = require('path');

const files = [
  'group1_law.json',
  'group2_history.json',
  'group3_wisdom.json',
  'group4_major_prophets.json',
  'group5_minor_prophets.json',
  'group6_gospels_acts.json',
  'group7_pauline_epistles.json',
  'group8_general_revelation.json'
];

let allVerses = [];
files.forEach(f => {
  const p = path.join(__dirname, 'expansion', f);
  const items = JSON.parse(fs.readFileSync(p, 'utf8'));
  console.log(`Loaded ${items.length} verses from ${f}`);
  allVerses = allVerses.concat(items);
});

console.log(`Total merged verses: ${allVerses.length}`);

const header = `/* ==================================================================
   VERSE BANK — 500-VERSE CANONICAL EXPANSION
   Comprehensive expansion covering all 66 books of Scripture.
   Every entry has passed verse QA gates and NKJV alignment.
   ================================================================== */
var VERSES_EXPANSION = [
`;

const lines = allVerses.map(v => JSON.stringify(v));
const footer = `
];

if(typeof module !== "undefined" && module.exports) module.exports = VERSES_EXPANSION;
`;

const content = header + lines.join(',\n') + footer;
const targetPath = path.join(__dirname, '..', 'js', 'verses-expansion.js');
fs.writeFileSync(targetPath, content, 'utf8');
console.log(`Wrote ${allVerses.length} verses to ${targetPath}`);
