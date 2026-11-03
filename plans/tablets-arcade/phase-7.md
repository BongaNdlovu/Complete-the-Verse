# Plan: Word Tablets phase 7, the rising card and the cuneiform parallax

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
Today the verse card stands still while the sand runs, and the stage canvas draws only embers and sparks (`tabletsFx.embers.forEach`, `sources/p7-sites.txt`). Phase 7 brings the download's two visual ideas in the form the user chose (V1, V2, 2026-11-03): the card rises toward the existing "✦ The Mark ✦" line as the sand runs, and faint cuneiform signs drift up the canvas behind it at Pace-based speeds. Every suite passes today, so there is no failing target; 9 mutations prove the new tests. End state: 10 edits applied to 4 files (section 7), every other file byte-identical, every required suite passing.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| V1 | The card does not move with the sand | `paintTabletsClock` paints only the fill and the label | Decision: the card rises to The Mark; untimed pins it there | `tabletsRiseOf`, `--tablets-rise`, the CSS `translate` (not `transform`, which `.tablets-slot.glow` already uses for its scale) |
| V2 | No glyph layer | the canvas has embers and sparks only | Decision: cuneiform parallax on the existing canvas | `TABLET_GLYPHS` (6 signs from the download), `tabletsGlyphSpeed` 18/28/46 px/s, depth 0.35/0.68/1.18, Surge 1.35x |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `js/tablets-run.js`, `css/tablets.css`, `test/tablets.test.js`, `test/motion.test.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1175 files stay byte-identical. No file is added or deleted.
- **Invariants:** the Favor formula, the sand burn, the miss and its pushback, the step and chapter flow, typing, what counts as reduced motion, the sparks, and all of `js/tablets.js` stay byte-identical (so no content hash change).

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 9 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `4fe57d34867c2fd82bdd48f4389d8c79168806bc29f9b4fc163d3c7e2660404d`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 4 file(s) change (`css/tablets.css`, `js/tablets-run.js`, `test/motion.test.js`, `test/tablets.test.js`) and 1175 stay identical.
- **What it entails.**
- **What is in it.**
- **How it connects with the plan:** each edit → its goal → the tests that must pass → its mutations.

**Stop and ask** if:
- the verdict isn't READY;
- an edit or goal isn't linked;
- the code doesn't match this plan;
- this document and `edits.js` disagree;
- the change affects something not mentioned here.

Otherwise, continue to section 5 without waiting. ALREADY APPLIED: run `gate.js post` and report; don't re-apply.

## 5. Steps (from `C:\Users\fanel\Downloads\ctv-push`)
```bash
sha256sum fix-plan/gate.js fix-plan/expected.json   # must match rule 5
node fix-plan/gate.js pre     # required: RESULT: PASS (28/28 checks passed, mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 10 edits to 4 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (40/40 checks passed, mode=post)
```
**On any other output:**
1. Copy each edited file back from `%TEMP%/fix-plan-backup` (`/` in the path is written as `__`).
2. Regenerate.
3. Report FAILED, quoting the `[FAIL]` lines.

What the gate checks (each check's result is in the report JSON it prints):
- **pre:** tooling hashes, a byte-identical baseline, anchors, line endings, invariants, the recorded test results, and
  verified backups.
- **post:**
  - only the planned files changed, each byte-identical to the dry run, with the rest unchanged;
  - invariants and extra checks;
  - fresh regeneration;
  - test tallies, names and statuses;
  - every mutation caught.

After the first FAIL, the gate skips the slow steps (`[SKIP]`), because the RESULT is FAIL anyway.

## 6. The exact change (ground truth: `fix-plan/edits.js`)
### E1 the card rise is painted from the clock  (`js/tablets-run.js`, serves V1)

Why: paintTabletsClock calls tabletsPaintRise, which sets --tablets-rise on #tablets-ms from tabletsRiseOf (progress of the sand, pinned at The Mark when untimed). The clock fill and label code are unchanged.

Find (exactly once):

```js
    else lab.textContent = (Math.max(0, R.tabletClock || 0)).toFixed(1) + "s";
  }
}
function spawnTabletsScorePopup(text, slotEl){
```

Replace with:

```js
    else lab.textContent = (Math.max(0, R.tabletClock || 0)).toFixed(1) + "s";
  }
  tabletsPaintRise();
}
/* V1: the verse card rises as the sand runs; untimed (tutorial, reduced motion) pins it at The Mark. */
function tabletsRiseOf(){
  if(tabletsUntimed()) return 1;
  return Tablets.rules.progressOf(R.tabletClock, R.tabletClockMax || tabletsClockMax() || 1);
}
function tabletsPaintRise(){
  const ms = $("tablets-ms");
  if(!ms || !ms.style || !ms.style.setProperty) return;
  ms.style.setProperty("--tablets-rise", String(Math.round(tabletsRiseOf() * 1000) / 1000));
}
function spawnTabletsScorePopup(text, slotEl){
```

### E2 the rise and its px range in CSS  (`css/tablets.css`, serves V1)

Why: the slot and the verse translate down by (1 - rise) of the px range; translate, not transform, so the .glow scale still composes. The rule goes after .tablets-mark-row, before the .tablets-slot rule.

Find (exactly once):

```css
.tablets-mark-row{display:flex;align-items:center;gap:12px;margin:8px 0 12px}
```

Replace with:

```css
.tablets-mark-row{display:flex;align-items:center;gap:12px;margin:8px 0 12px}
.tablets-ms{--tablets-rise-px:clamp(10px,4vh,40px)}
.tablets-slot,.tablets-verse{translate:0 calc((1 - var(--tablets-rise, 1)) * var(--tablets-rise-px, 0px));transition:translate .3s ease-out}
```

### E3 space reserved under the verse for the lowered card  (`css/tablets.css`, serves V1)

Why: the .tablets-verse rule later in the file sets margin:0 0 14px, which would override a margin-bottom placed at .tablets-mark-row. So this rule goes after .tablets-blank-word, which follows the verse rule, and keeps the sand bar clear.

Find (exactly once):

```css
.tablets-blank-word{color:#c7943f;text-shadow:0 0 12px rgba(229,181,88,.7);font-weight:700;letter-spacing:.04em}
```

Replace with:

```css
.tablets-blank-word{color:#c7943f;text-shadow:0 0 12px rgba(229,181,88,.7);font-weight:700;letter-spacing:.04em}
.tablets-verse{margin-bottom:calc(14px + var(--tablets-rise-px, 0px))}
```

### E4 reduced motion and motion-calm release the rising card  (`css/tablets.css`, serves V1)

Why: the rising card is pinned at The Mark in reduced and calm motion, so the translate and its transition are switched off there.

Find (exactly once):

```css
body.reduced #tablets-fx,body.motion-calm #tablets-fx{display:none}
```

Replace with:

```css
body.reduced #tablets-fx,body.motion-calm #tablets-fx{display:none}
body.reduced .tablets-slot,body.reduced .tablets-verse,body.motion-calm .tablets-slot,body.motion-calm .tablets-verse{translate:none;transition:none}
```

### E5 motion test lists the rising card as a reduced-motion hook  (`test/motion.test.js`, serves V1)

Why: the reducedHooks list in motion.test.js proves the rising card is killed under reduced motion (the E4 rule).

Find (exactly once):

```js
  [".tablets-candle", "tablets scene candle"]
```

Replace with:

```js
  [".tablets-candle", "tablets scene candle"],
  [".tablets-verse", "tablets rising card"]
```

### E6 the field keeps a list of glyphs  (`js/tablets-run.js`, serves V2)

Why: tabletsFx gets a glyphs list next to embers and sparks. It is always set by tabletsFxInit before a draw, so no test protects this line on its own.

Find (exactly once):

```js
var tabletsFx = { ctx:null, canvas:null, embers:[], sparks:[], w:0, h:0 };
```

Replace with:

```js
var tabletsFx = { ctx:null, canvas:null, embers:[], sparks:[], glyphs:[], w:0, h:0 };
```

### E7 tabletsFxInit resets and seeds the glyphs  (`js/tablets-run.js`, serves V2)

Why: the glyph list is reset next to the embers and sparks, before the reduced early return, so reduced motion makes no glyphs. After the eight embers, twelve glyphs are seeded across the three layers (layer i % 3).

Find (exactly once):

```js
  tabletsFx.sparks = [];
  if(tabletsReduced()) return;
  const canvas = $("tablets-fx");
  if(!canvas || typeof canvas.getContext !== "function") return;
  let ctx = null;
  try{ ctx = canvas.getContext("2d"); }catch(e){ return; }
  if(!ctx) return;
  tabletsFx.canvas = canvas;
  tabletsFx.ctx = ctx;
  tabletsFxSize();
  let i = 0;
  for(; i < 8; i++) tabletsFx.embers.push(tabletsFxMakeEmber(true));
```

Replace with:

```js
  tabletsFx.sparks = [];
  tabletsFx.glyphs = [];
  if(tabletsReduced()) return;
  const canvas = $("tablets-fx");
  if(!canvas || typeof canvas.getContext !== "function") return;
  let ctx = null;
  try{ ctx = canvas.getContext("2d"); }catch(e){ return; }
  if(!ctx) return;
  tabletsFx.canvas = canvas;
  tabletsFx.ctx = ctx;
  tabletsFxSize();
  let i = 0;
  for(; i < 8; i++) tabletsFx.embers.push(tabletsFxMakeEmber(true));
  /* V2: twelve signs across the three depth layers; none in reduced motion (the early return above). */
  for(i = 0; i < 12; i++) tabletsFx.glyphs.push(tabletsMakeGlyph(i % 3, tabletsFx.w || 800, tabletsFx.h || 450, true));
```

### E8 cuneiform signs: constants, speed, step and draw  (`js/tablets-run.js`, serves V2)

Why: ports the download's six signs (DINGIR, DUB_TABLET, KA_WORD, ZI_SOUL, LUGAL_KING, PA_SCEPTER) as strokes [x1, y1, x2, y2, headSize, chevron] in a -1..1 box, with the Pace speeds (18/28/46 px/s), depth multipliers, alpha and Surge x1.35. Pure helpers are tested; the draw is not (the shim has no canvas context).

Find (exactly once):

```js
function drawTabletsFx(dt){
```

Replace with:

```js
/* V2: faint cuneiform signs in three depth layers, behind the embers. */
const TABLET_GLYPH_SPEED = [18, 28, 46];
const TABLET_GLYPH_DEPTH = [0.35, 0.68, 1.18];
const TABLET_GLYPH_ALPHA = [0.07, 0.11, 0.16];
const TABLET_GLYPH_SURGE = 1.35;
/* Each sign is a list of strokes [x1, y1, x2, y2, headSize, chevron] in a -1..1 box.
   Order: DINGIR, DUB_TABLET, KA_WORD, ZI_SOUL, LUGAL_KING, PA_SCEPTER. */
const TABLET_GLYPHS = [
  [[-0.75,0,0.75,0,0.28,0],[0,-0.78,0,0.78,0.28,0],[-0.55,-0.55,0.55,0.55,0.24,0],[0.55,-0.55,-0.55,0.55,0.24,0]],
  [[-0.72,-0.52,0.68,-0.52,0.26,0],[-0.72,0,0.58,0,0.24,0],[-0.72,0.52,0.68,0.52,0.26,0],[-0.45,-0.72,-0.45,0.72,0.25,0],[0.38,-0.72,0.38,0.72,0.25,0]],
  [[-0.75,-0.4,0.45,-0.4,0.26,0],[-0.75,0.4,0.45,0.4,0.26,0],[-0.52,-0.68,-0.52,0.68,0.26,0],[0.1,-0.1,0.4,-0.1,0.28,1],[0.55,-0.68,0.55,0.68,0.28,0]],
  [[-0.7,-0.32,0.65,-0.32,0.25,0],[-0.7,0.32,0.65,0.32,0.25,0],[-0.25,-0.7,-0.25,0.7,0.25,0],[0.25,-0.7,0.25,0.7,0.25,0],[0.52,0,0.78,0,0.28,1]],
  [[-0.78,-0.48,0.72,-0.48,0.26,0],[-0.78,0,0.72,0,0.26,0],[-0.78,0.48,0.72,0.48,0.26,0],[-0.45,-0.22,-0.15,-0.22,0.26,1],[0.48,-0.72,0.48,0.72,0.28,0]],
  [[-0.72,-0.28,0.72,-0.28,0.26,0],[-0.72,0.28,0.72,0.28,0.26,0],[0,-0.75,0,0.75,0.28,0]]
];
/* V2: Pace I/II/III speed; Surge speeds the signs up. */
function tabletsGlyphSpeed(pace, surge){
  const p = Math.min(3, Math.max(1, Math.round(pace) || 1));
  return TABLET_GLYPH_SPEED[p - 1] * (surge ? TABLET_GLYPH_SURGE : 1);
}
function tabletsMakeGlyph(layer, w, h, randomY){
  const size = 16 + layer * 12;
  return {
    layer: layer, x: Math.random() * w, y: randomY ? Math.random() * h : h + size,
    size: size, sign: Math.floor(Math.random() * TABLET_GLYPHS.length)
  };
}
/* V2: a sign drifts up at its depth; one that leaves the top comes back below the stage. */
function tabletsGlyphStep(g, dt, speed, w, h){
  g.y -= speed * TABLET_GLYPH_DEPTH[g.layer] * dt;
  if(g.y < -g.size){
    g.y = h + g.size;
    g.x = Math.random() * w;
    g.sign = Math.floor(Math.random() * TABLET_GLYPHS.length);
  }
  return g;
}
function tabletsGlyphHead(ctx, x, y, dx, dy, size){
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy * size * 0.5, py = ux * size * 0.5;
  ctx.beginPath();
  ctx.moveTo(x + ux * size, y + uy * size);
  ctx.lineTo(x + px, y + py);
  ctx.lineTo(x - px, y - py);
  ctx.closePath();
  ctx.fill();
}
function tabletsDrawGlyphStroke(ctx, g, s){
  const half = g.size / 2;
  const x1 = g.x + s[0] * half, y1 = g.y + s[1] * half;
  const x2 = g.x + s[2] * half, y2 = g.y + s[3] * half;
  const hs = s[4] * half;
  ctx.beginPath();
  if(s[5]){
    ctx.moveTo(x1 + hs, y1 - hs);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 + hs, y1 + hs);
    ctx.stroke();
    return;
  }
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  tabletsGlyphHead(ctx, x1, y1, x1 - x2, y1 - y2, hs);
}
function drawTabletsGlyph(ctx, g){
  ctx.strokeStyle = "rgba(229,181,88," + TABLET_GLYPH_ALPHA[g.layer] + ")";
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = Math.max(1, g.size * 0.07);
  (TABLET_GLYPHS[g.sign] || []).forEach(function(s){ tabletsDrawGlyphStroke(ctx, g, s); });
}
function drawTabletsGlyphs(dt){
  const ctx = tabletsFx.ctx;
  const pace = Tablets.paceOf ? Tablets.paceOf(tabletsChapter()) : 1;
  const speed = tabletsGlyphSpeed(pace, !!R.surgeOn);
  tabletsFx.glyphs.forEach(function(g){
    tabletsGlyphStep(g, dt, speed, tabletsFx.w, tabletsFx.h);
    drawTabletsGlyph(ctx, g);
  });
}
function drawTabletsFx(dt){
```

### E9 the glyphs are drawn before the embers  (`js/tablets-run.js`, serves V2)

Why: drawTabletsGlyphs runs after the existing clear and the existing five-second early return, so the signs fade out in the last five seconds like the embers.

Find (exactly once):

```js
  tabletsFx.embers.forEach(function(p){
```

Replace with:

```js
  drawTabletsGlyphs(dt);
  tabletsFx.embers.forEach(function(p){
```

### E10 tests for the rise, the speeds, the wrap, the data, the seeding and the CSS  (`test/tablets.test.js`, serves V1, V2)

Why: appended before the final unstubRandom() and the fail check. The shim has no getPropertyValue, so the CSS variable is not read back; the paint is only checked not to throw.

Find (exactly once):

```js
unstubRandom();
if (fail) {
```

Replace with:

```js
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("the card sits low on a fresh step", read(sb, "tabletsRiseOf()"), 0);
  exec(sb, "R.tabletClock = R.tabletClockMax / 2");
  eq("the card is halfway up at half the sand", read(sb, "tabletsRiseOf()"), 0.5);
  exec(sb, "R.tabletClock = 0.25 * R.tabletClockMax");
  eq("the card is three-quarters up at a quarter of the sand", read(sb, "tabletsRiseOf()"), 0.75);
  exec(sb, "R.tabletClock = R.tabletClockMax * 0.1; tabletsResolve(false); tabletsFinishResolve(false)");
  ok("a miss at 90% gone pushes the card back to 0.45", Math.abs(read(sb, "tabletsRiseOf()") - 0.45) < 1e-9, read(sb, "tabletsRiseOf()"));
  ok("painting the clock with the rise does not throw", (function(){ try { exec(sb, "paintTabletsClock()"); return true; } catch (e) { return false; } })());
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman',{tabletChapter:'prayer',tabletTutorial:true})");
  eq("the tutorial pins the card at The Mark", read(sb, "tabletsRiseOf()"), 1);
}
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "document.body.classList.add('reduced')");
  eq("reduced motion pins the card at The Mark", read(sb, "tabletsRiseOf()"), 1);
}
{
  const sb = boot();
  eq("Pace I drifts at 18 px/s", read(sb, "tabletsGlyphSpeed(1,false)"), 18);
  eq("Pace III drifts at 46 px/s", read(sb, "tabletsGlyphSpeed(3,false)"), 46);
  ok("Surge speeds Pace II by 1.35", Math.abs(read(sb, "tabletsGlyphSpeed(2,true)") - 37.8) < 1e-9, read(sb, "tabletsGlyphSpeed(2,true)"));
  eq("a pace past III clamps to 46", read(sb, "tabletsGlyphSpeed(9,false)"), 46);
  exec(sb, "var TG = tabletsGlyphStep({layer:2,x:5,y:100,size:40,sign:0}, 0.5, 20, 800, 450)");
  ok("a near glyph drifts up at its depth", Math.abs(read(sb, "TG.y") - (100 - 20 * 1.18 * 0.5)) < 1e-9, read(sb, "TG.y"));
  exec(sb, "var TW = tabletsGlyphStep({layer:2,x:5,y:-50,size:40,sign:0}, 0, 20, 800, 450)");
  eq("a glyph above the stage comes back below it", read(sb, "TW.y"), 490);
}
{
  const sb = boot();
  const signs = JSON.parse(read(sb, "JSON.stringify(TABLET_GLYPHS)"));
  eq("six cuneiform signs are ported", signs.length, 6);
  ok("every sign has at least three strokes", signs.every(function(s){ return s.length >= 3; }));
  ok("every stroke coordinate sits in the -1..1 box", signs.every(function(s){
    return s.every(function(st){ return st.slice(0, 4).every(function(v){ return Math.abs(v) <= 1; }); });
  }));
}
{
  const sb = boot();
  exec(sb, "$('tablets-fx').getContext = function(){ return {}; }; tabletsFxInit()");
  eq("the field seeds twelve glyphs beside the eight embers", read(sb, "tabletsFx.glyphs.length"), 12);
  eq("the field still seeds eight embers", read(sb, "tabletsFx.embers.length"), 8);
}
{
  const sb = boot();
  exec(sb, "document.body.classList.add('reduced'); $('tablets-fx').getContext = function(){ return {}; }; tabletsFxInit()");
  eq("reduced motion makes no glyphs", read(sb, "tabletsFx.glyphs.length"), 0);
}
{
  const riseCss = fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8");
  ok("the card rises with translate, so the glow scale still composes", /\.tablets-slot,\.tablets-verse\{translate:0 calc\(/.test(riseCss));
  ok("reduced motion sets translate:none on the rising card", /body\.reduced[^{]*\{translate:none/.test(riseCss));
}
unstubRandom();
if (fail) {
```

What does not change: no game rule, timing, lamp, power or mode changes; the card only moves. Reduced motion and motion-calm keep it still (`translate:none`) and get no glyphs, because `tabletsFxInit` already returns before making any.

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)                65 ms  applied 10 edits to 4 files
make-expected                    44470 ms  expected.json written: 1179 baseline files; changed: css/tablets.css, js/tablets-run.js, test/motion.test.js, test/tablets.test.js
tamper-test (+ full gate post)  147292 ms  TAMPER-TEST: PASS  (control passed; 8 tampers)
scope-report pristine              139 ms  SCOPE VERDICT: READY  (10 edit(s) pending, 0 already applied)
scope-report dry-run               107 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 10 already applied)
scope-report (real project)        182 ms  SCOPE VERDICT: READY  (10 edit(s) pending, 0 already applied)
gate pre (real project)          25639 ms  RESULT: PASS  (28/28 checks passed, mode=pre)

# make-expected
expected.json written: 1179 baseline files; changed: css/tablets.css, js/tablets-run.js, test/motion.test.js, test/tablets.test.js
tests before {"pass":75,"fail":0} (exit 0) -> after {"pass":75,"fail":0} (exit 0)
  anchor js/tablets-run.js:38 x1  function paintTabletsClock(){
  anchor js/tablets-run.js:1073 x1  var tabletsFx = { ctx:null, canvas:null, embers:[], sparks:[], w:0, h:
  anchor js/tablets-run.js:1096 x1    for(; i < 8; i++) tabletsFx.embers.push(tabletsFxMakeEmber(true));
  anchor js/tablets-run.js:1132 x1    tabletsFx.embers.forEach(function(p){
  anchor css/tablets.css:156 x1  .tablets-mark-row{display:flex;align-items:center;gap:12px;margin:8px 
  anchor css/tablets.css:366 x1  body.reduced .tablets-tier.elevated,
  anchor test/motion.test.js:156 x1    [".tablets-candle", "tablets scene candle"]

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (40/40 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (20/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, js/, X-css/tablets.css  css/tablets.css is byte-identical , X-js/tablets-run.js  js/tablets-run.js is byte-identi, X-test/motion.test.js  test/motion.test.js is byte-id
  OK    a stray file was added -> RESULT: FAIL  (23/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, js/, S2  no file was added or deleted
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    edited file drifted by one byte: css/tablets.css -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-css/tablets.css  css/tablets.css is byte-identical 
  OK    edited file drifted by one byte: test/tablets.test.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    edited file drifted by one byte: test/motion.test.js -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-test/motion.test.js  test/motion.test.js is byte-id
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (23/25 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, js/, S3  the other 1175 files are byte-identical to the ba
  OK    half-applied: edit "E1 the card rise is painted from the clock" undone -> RESULT: FAIL  (24/25 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
TAMPER-TEST: PASS  (control passed; 8 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 4fe57d34867c2fd82bdd48f4389d8c79168806bc29f9b4fc163d3c7e2660404d
```

## 8. Not measured
- **The look:** how the rise and the signs read on a phone and on a desktop is not measured until the browser check.
- **The CSS variable** cannot be read back in the test sandbox (its style has no getPropertyValue), so the paint is tested only not to throw; the rise value itself is tested through `tabletsRiseOf`.
- **The glyph drawing** (E8's draw helpers, E9's call) has no assertion beyond the pure helpers; the browser check is the evidence.
- **Performance:** 12 glyphs a frame on a low-end phone is not measured.
- **Android:** no rising card or glyphs there. Not in scope.
- **CI:** the stacked PR targets the phase 6 branch; `ci.yml` runs on PRs to master only.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
