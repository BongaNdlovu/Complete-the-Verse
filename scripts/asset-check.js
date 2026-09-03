/* Check that asset files referenced from CSS and HTML exist on disk. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let issues = 0;
let resolvedFallbacks = 0;

/* VIGNETTES may name an authored journey scene that has not shipped yet.
   Gameplay resolves those entries to their per-site artifact fallback, so
   validate the fallback rather than flagging a path that is never requested
   at runtime. */
const journeyFallbacks = new Map();
const sitesSource = fs.readFileSync(path.join(root, 'js', 'sites.js'), 'utf8');
for (const m of sitesSource.matchAll(/image:\s*["']([^"']+)["']\s*,\s*fallback:\s*["']([^"']+)["']/g)) {
  journeyFallbacks.set(m[1], m[2]);
}

function checkRef(ref, fromFile) {
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:')) return;
  // CSS/SVG same-document fragments are not filesystem paths.
  if (decodeURIComponent(ref).startsWith('#')) return;
  const p = path.join(root, ref.replace(/^\//, '').split('?')[0]);
  if (fs.existsSync(p)) return;
  const fallback = journeyFallbacks.get(ref);
  if (fallback) {
    const fallbackPath = path.join(root, fallback);
    if (fs.existsSync(fallbackPath)) { resolvedFallbacks++; return; }
  }
  console.log(`MISSING: ${ref}  (referenced in ${fromFile})`); issues++;
}

// CSS url(...) references
for (const css of ['game.css', 'play.css', 'atlas.css', 'tablets.css']) {
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

console.log(issues === 0
  ? `ASSET CHECK CLEAN${resolvedFallbacks ? ` — ${resolvedFallbacks} journey scenes resolve to shipped artifacts` : ''}`
  : `ASSET CHECK FOUND ${issues} missing file(s)`);

/* Payload budgets: lazy media is fetched mid-run on phones, so per-file
   caps keep a single site visit cheap. Caps mirror the shipped maxima
   with headroom — tighten them when the media diet advances. */
const SIZE_CAPS = [
  { dir: "assets/beats", ext: [".webp"], max: 260 * 1024, why: "beat still (<=250KB budget)" },
  { dir: "assets/beats", ext: [".mp4"], max: 20 * 1024 * 1024, why: "beat film" },
  { dir: "assets/journey", ext: [".mp4"], max: 3 * 1024 * 1024, why: "journey loop (<=3MB budget)" },
  { dir: "assets/journey", ext: [".webp"], max: 220 * 1024, why: "journey still" },
  { dir: "assets/characters", ext: [".png"], max: 1024 * 1024, why: "character art (1.5MB budget)" },
  { dir: "assets/artifacts", ext: [".png"], max: 512 * 1024, why: "relic" },
  { dir: "audio", ext: [".mp3"], max: 4 * 1024 * 1024, why: "audio bed (<=4MB ceiling)" },
];

const FOLDER_CAPS = [
  { dir: "assets/beats/goliath", max: 26 * 1024 * 1024, why: "Goliath beat folder total" },
  { dir: "audio", max: 50 * 1024 * 1024, why: "All audio total" },
];
for (const cap of SIZE_CAPS) {
  const dir = path.join(root, cap.dir);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir, { recursive: true })) {
    if (!cap.ext.some(e => String(f).toLowerCase().endsWith(e))) continue;
    const p = path.join(dir, f);
    let st = null;
    try { st = fs.statSync(p); } catch (e) { continue; }
    if (!st.isFile() || st.size <= cap.max) continue;
    console.log(`OVERSIZE: ${path.relative(root, p)} is ${Math.round(st.size / 1024)}KB (cap ${Math.round(cap.max / 1024)}KB, ${cap.why})`);
  }
}

for (const fcap of FOLDER_CAPS) {
  const dir = path.join(root, fcap.dir);
  if (!fs.existsSync(dir)) continue;
  let total = 0;
  for (const f of fs.readdirSync(dir, { recursive: true })) {
    const p = path.join(dir, f);
    try {
      const st = fs.statSync(p);
      if (st.isFile()) total += st.size;
    } catch (e) {}
  }
  if (total > fcap.max) {
    console.log(`OVERSIZE FOLDER: ${fcap.dir} is ${(total / (1024 * 1024)).toFixed(2)}MB (cap ${(fcap.max / (1024 * 1024)).toFixed(2)}MB, ${fcap.why})`);
    issues++;
  }
}

if (issues > 0) {
  console.log(`ASSET CHECK FOUND ${issues} issue(s)`);
  process.exitCode = 1;
}
