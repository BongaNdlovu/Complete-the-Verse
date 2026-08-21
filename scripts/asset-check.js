/* Check that asset files referenced from CSS and HTML exist on disk. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let issues = 0;

function checkRef(ref, fromFile) {
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:')) return;
  const p = path.join(root, ref.replace(/^\//, '').split('?')[0]);
  if (!fs.existsSync(p)) { console.log(`MISSING: ${ref}  (referenced in ${fromFile})`); issues++; }
}

// CSS url(...) references
for (const css of ['game.css', 'play.css', 'atlas.css']) {
  const src = fs.readFileSync(path.join(root, 'css', css), 'utf8');
  for (const m of src.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    let ref = m[1];
    if (ref.startsWith('../')) ref = ref.slice(3);
    checkRef(ref, 'css/' + css);
  }
}

// HTML src/href/poster references
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href|poster)="([^"]+)"/g)) checkRef(m[1], 'index.html');

// JS string references to assets/ or audio/ or sfx/
const jsDir = path.join(root, 'js');
for (const f of fs.readdirSync(jsDir).filter(f => f.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
  for (const m of src.matchAll(/["']((?:assets|audio|sfx)\/[^"']+)["']/g)) checkRef(m[1], 'js/' + f);
}

console.log(issues === 0 ? 'ASSET CHECK CLEAN' : `ASSET CHECK FOUND ${issues} missing file(s)`);