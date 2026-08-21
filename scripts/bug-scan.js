/* Quick bug scan: duplicate IDs in index.html, missing referenced files,
   and duplicate element IDs referenced from JS. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// 1. Duplicate IDs in HTML
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const seen = new Map();
for (const id of ids) seen.set(id, (seen.get(id) || 0) + 1);
let issues = 0;
for (const [id, n] of seen) {
  if (n > 1) { console.log(`DUPLICATE ID in index.html: "${id}" appears ${n} times`); issues++; }
}

// 2. Referenced local files exist?
const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1]);
for (const r of refs) {
  if (/^(https?:)?\/\//.test(r)) continue; // external
  const p = path.join(root, r.split('?')[0]);
  if (!fs.existsSync(p)) { console.log(`MISSING FILE referenced in index.html: ${r}`); issues++; }
}

// 3. Duplicate getElementById targets across JS (same id fetched twice is fine,
//    but flag ids used in JS that don't exist in HTML)
const jsDir = path.join(root, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
const htmlIds = new Set(ids);
const usedIds = new Map();
for (const f of jsFiles) {
  const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
  for (const m of src.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    usedIds.set(m[1], f);
  }
}
// Ids that JS itself creates at runtime are self-fulfilling promises:
// `el.id = "x"` assignments, or id="x" inside JS-built markup strings
// (plain or backslash-escaped quotes). They never need to exist in
// index.html, so they must not be flagged.
const createdIds = new Set();
for (const f of jsFiles) {
  const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
  for (const m of src.matchAll(/\.id\s*=\s*['"]([^'"]+)['"]/g)) createdIds.add(m[1]);
  for (const m of src.matchAll(/\\?id=\\?"([^"\\]+)\\?"/g)) createdIds.add(m[1]);
}
for (const [id, f] of usedIds) {
  if (htmlIds.has(id) || createdIds.has(id)) continue;
  console.log(`JS uses id "${id}" (${f}) but it is NOT in index.html`); issues++;
}

// 4. Duplicate id="judge-burst" style check already covered by #1.

console.log(issues === 0 ? 'SCAN CLEAN — no issues found' : `SCAN FOUND ${issues} issue(s)`);