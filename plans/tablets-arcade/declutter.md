# Plan: Word Tablets, declutter the top of the stage

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
On a carve the blessing banner, the milestone banner and the Favor popup pile onto the reference, The Mark and the slot: a Tithe carve with a blessing measured 4 overlaps at 1280x800 and 6 at 430x900 (`sources/overlaps-before.txt`), and the blessing was titled "Celestial visitation". Measuring the fix also showed the sand bar hidden under the tray at 1366x768 and 375x667 before this change (`sources/sand-fit.txt`). Every suite passes today, so there is no failing target; 11 mutations prove the new tests. End state: 12 edits applied to 4 files (section 7), and the same browser check reads zero overlaps at four sizes with the sand bar clear (`sources/overlaps-after.txt`).

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| L1 | The banners land on the reference, The Mark and the slot | absolute top:64px / top:70px over the card | Real bug (layout) | one 48 px feedback lane between the card and the stones; the two banners sit in it side by side; on narrow screens the lane takes turns (the Favor chip first, then compact banners) |
| L2 | The Favor popup covers the slot and the reference | it rose 65 px from the slot's centre | Real bug (layout) | beside the slot, drifting sideways (tabletsPopupAnchor); with no room beside it, a chip in the lane |
| L3 | "Celestial visitation" | the blessing kicker | Decision 3 (game words) | "A blessing" |
| L4 | The sand bar hides under the tray on short screens (and the lane would cover it on desktop) | phase B's roll floor min-height 260px (220px on phones) | Real bug (layout) | the roll's floor 160px (84px at 640px and narrower); the roll still fills any spare room |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `js/tablets-run.js`, `css/tablets.css`, `index.html`, `test/tablets.test.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** none, changed only by n/a
- **Everything else:** 1189 files stay byte-identical. No file is added or deleted.
- **Invariants:** the rules, the Favor formula, the step flow, which blessing is rolled and what it does, and the roll math stay byte-identical.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 11 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `73fc5e75cc240b9441f26a5a3b14b383cfbaef6ffe2b0d0ccc80cae1ef928025`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 4 file(s) change (`css/tablets.css`, `index.html`, `js/tablets-run.js`, `test/tablets.test.js`) and 1189 stay identical.
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
node fix-plan/gate.js pre     # required: RESULT: PASS (25/25 checks passed, mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 12 edits to 4 files
# no generate step: this plan has no generated files
node fix-plan/gate.js post    # required: RESULT: PASS (38/38 checks passed, mode=post)
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
### E1 cut the milestone banner out of the stage body  (`index.html`, serves L1)

Why: the milestone banner moves into the feedback lane (E3); its id, classes and children are kept there

Find (exactly once):

```html
        <div class="tablets-milestone" id="tablets-milestone" aria-hidden="true">
          <span class="tablets-milestone-kicker">Milestone</span>
          <b id="tablets-milestone-name">Tithe</b>
          <em id="tablets-milestone-favor">+0 FAVOR</em>
        </div>
```

Replace with:

```html
        <!-- L1: the milestone banner moved into the feedback lane under the stage. -->
```

### E2 cut the blessing banner out from under the footer  (`index.html`, serves L1)

Why: the blessing banner sat outside the stage; it moves into the feedback lane (E3) so one lane carries both

Find (exactly once):

```html
      <div class="tablets-blessing" id="tablets-blessing">
        <b id="tablets-blessing-icon">🏺</b>
        <span>
          <i>Celestial visitation</i>
          <em id="tablets-blessing-text">Manna Jar Discovered (+15s)</em>
        </span>
      </div>
```

Replace with:

```html
      <!-- L1: the blessing banner moved into the feedback lane under the stage. -->
```

### E3 insert the feedback lane between the stage and the stones  (`index.html`, serves L1, L3)

Why: a fixed strip under the stage holds both one-line banners, clear of the card, the stones and the tray; the blessing kicker reads in the game words (L3) The moved milestone block carries data-lane so it differs from the text E1 cuts.

Find (exactly once):

```html
      <div class="tablets-tray">
```

Replace with:

```html
      <!-- L1: one feedback lane between the stage and the stones; the milestone and the blessing sit in it. -->
      <div class="tablets-lane" id="tablets-lane" aria-live="polite">
        <div class="tablets-milestone" id="tablets-milestone" aria-hidden="true" data-lane="milestone">
          <span class="tablets-milestone-kicker">Milestone</span>
          <b id="tablets-milestone-name">Tithe</b>
          <em id="tablets-milestone-favor">+0 FAVOR</em>
        </div>
        <div class="tablets-blessing" id="tablets-blessing">
          <b id="tablets-blessing-icon">🏺</b>
          <span>
            <i>A blessing</i>
            <em id="tablets-blessing-text">Manna Jar Discovered (+15s)</em>
          </span>
        </div>
      </div>
      <div class="tablets-tray">
```

### E4 lane css: a fixed one-line strip, banners static inside it  (`css/tablets.css`, serves L1)

Why: the lane is a 48 px strip that takes its space whether or not a banner shows, so the stones never move; inside it the banners are one-line, static and rise 12 px on .active

Find (exactly once):

```css
.tablets-blessing em{display:block;font-style:normal;font-family:var(--disp);font-size:.78rem;color:#fff;font-weight:700}
```

Replace with:

```css
.tablets-blessing em{display:block;font-style:normal;font-family:var(--disp);font-size:.78rem;color:#fff;font-weight:700}
/* L1: one feedback lane between the stage and the stones: a fixed strip, the banners one line each side by side. */
.tablets-lane{
  flex:0 0 auto;height:48px;position:relative;z-index:17;pointer-events:none;min-width:0;
  display:flex;align-items:flex-start;justify-content:center;gap:10px;padding:0 10px}
.tablets-lane .tablets-milestone,.tablets-lane .tablets-blessing{position:static;top:auto;left:auto;transform:none;display:none;min-width:0;max-width:100%;box-sizing:border-box;margin:0;height:34px;padding:0 14px;white-space:nowrap;overflow:hidden}
.tablets-lane .tablets-milestone.active{display:flex;align-items:center;gap:8px;animation:tabletsLaneRise .3s ease both}
.tablets-lane .tablets-blessing.active{display:flex;align-items:center;gap:8px;animation:tabletsLaneRise .3s ease both}
.tablets-lane .tablets-milestone b,.tablets-lane .tablets-milestone em,.tablets-lane .tablets-milestone-kicker,.tablets-lane .tablets-blessing i,.tablets-lane .tablets-blessing em{display:inline;margin:0}
.tablets-lane .tablets-blessing span{display:block;min-width:0;overflow:hidden}
@keyframes tabletsLaneRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
```

### E5 popup css: right of the slot drifts sideways and fades; below keeps the centred pop  (`css/tablets.css`, serves L2)

Why: the Favor beside the slot drifts 24 px to the right and fades, with no upward travel, so it never reaches The Mark; the Favor below the slot stays centred and drifts down, never rising into the slot

Find (exactly once):

```css
@keyframes tabletsPopRise{
  0%{transform:translate(-50%,0) scale(.6);opacity:0}
  20%{transform:translate(-50%,-10px) scale(1.15);opacity:1}
  100%{transform:translate(-50%,-65px) scale(1);opacity:0}
}
```

Replace with:

```css
@keyframes tabletsPopRise{
  0%{transform:translate(-50%,0) scale(.6);opacity:0}
  20%{transform:translate(-50%,-10px) scale(1.15);opacity:1}
  100%{transform:translate(-50%,-65px) scale(1);opacity:0}
}
/* L2: the Favor beside the slot drifts sideways from its left edge and fades; the Favor below keeps the centred pop. */
.tablets-score-popup[data-side="right"]{transform:translate(0,-50%);transform-origin:left center;animation-name:tabletsPopRiseRight}
.tablets-score-popup[data-side="below"]{animation-name:tabletsPopRiseBelow}
/* L2: in the lane the Favor is a chip in the row, not a floating word. */
.tablets-lane .tablets-score-popup[data-lane]{position:static;transform:none;animation:tabletsLaneFavor .9s ease forwards;font-size:.95rem;white-space:nowrap;align-self:center}
@keyframes tabletsLaneFavor{0%{opacity:0}15%{opacity:1}75%{opacity:1}100%{opacity:0}}
@keyframes tabletsPopRiseRight{
  0%{transform:translate(0,-50%) scale(.6);opacity:0}
  20%{transform:translate(12px,-50%) scale(1.15);opacity:1}
  100%{transform:translate(24px,-50%) scale(1);opacity:0}
}
@keyframes tabletsPopRiseBelow{
  0%{transform:translate(-50%,0) scale(.6);opacity:0}
  20%{transform:translate(-50%,4px) scale(1.15);opacity:1}
  100%{transform:translate(-50%,12px) scale(1);opacity:0}
}
```

### E6 reduced motion: the lane banners and the Favor pop do not animate  (`css/tablets.css`, serves L1, L2)

Why: under reduced motion and motion-calm the banners just appear and the Favor does not move

Find (exactly once):

```css
body.reduced .tablets-relic-pill,
body.motion-calm .tablets-relic-pill{animation:none;transition:none}
```

Replace with:

```css
body.reduced .tablets-relic-pill,
body.motion-calm .tablets-relic-pill{animation:none;transition:none}
body.reduced .tablets-lane .active,body.motion-calm .tablets-lane .active,body.reduced .tablets-score-popup,body.motion-calm .tablets-score-popup{animation:none;transition:none}
```

### E7 js: tabletsPopupAnchor, the pure side and offset helper  (`js/tablets-run.js`, serves L2)

Why: a pure helper picks right of the slot when the card has 190 px to spare, otherwise below it, and returns the offsets

Find (exactly once):

```js
function spawnTabletsScorePopup(text, slotEl){
```

Replace with:

```js
/* L2: where the Favor pops. Right of the slot when the card has 190 px to spare; otherwise below the slot. */
function tabletsPopupAnchor(msRect, slotRect){
  const room = msRect.right - slotRect.right;
  if(room >= 190) return { x: slotRect.right - msRect.left + 16, y: (slotRect.top + slotRect.bottom) / 2 - msRect.top, side: "right" };
  return { x: (slotRect.left + slotRect.right) / 2 - msRect.left, y: slotRect.bottom - msRect.top + 18, side: "below" };
}
function spawnTabletsScorePopup(text, slotEl){
```

### E8 js: the popup takes its anchor and records its side  (`js/tablets-run.js`, serves L2)

Why: the score popup is placed by tabletsPopupAnchor and carries data-side for the CSS; the no-rect fallback stays

Find (exactly once):

```js
  if(slotEl && slotEl.getBoundingClientRect){
    const msRect = ms.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();
    popup.style.left = Math.max(50, Math.min((ms.clientWidth || 500) - 50, slotRect.left + (slotRect.width || 0) / 2 - msRect.left)) + "px";
    popup.style.top = Math.max(30, Math.min((ms.clientHeight || 400) - 30, slotRect.top + (slotRect.height || 0) / 2 - msRect.top)) + "px";
```

Replace with:

```js
  if(slotEl && slotEl.getBoundingClientRect){
    /* L2: the Favor pops beside the slot, or below it when the card has no room to its right. */
    const anchor = tabletsPopupAnchor(ms.getBoundingClientRect(), slotEl.getBoundingClientRect());
    popup.style.left = anchor.x + "px";
    popup.style.top = anchor.y + "px";
    popup.dataset.side = anchor.side;
    /* L2: with no room beside the slot the Favor joins the feedback lane, clear of the verse. */
    if(anchor.side === "below" && $("tablets-lane") && typeof ms.getBoundingClientRect().right === "number") popup.dataset.lane = "1";
```

### E9 tests: lane placement, kicker, popup anchor, popup drift, lane css  (`test/tablets.test.js`, serves L1, L2, L3)

Why: the new behaviour is asserted before the final summary so the word tablets suite fails if it breaks

Find (exactly once):

```js
unstubRandom();
if (fail) {
```

Replace with:

```js
{
  // L1-L3: one feedback lane between the stage and the stones, the Favor beside the slot, the blessing in the game's words.
  const laneAt = html.indexOf('id="tablets-lane"');
  const stageAt = html.indexOf('id="tablets-stage"');
  const trayAt = html.indexOf('<div class="tablets-tray">');
  ok("the feedback lane sits between the stage and the stones", laneAt > stageAt && laneAt < trayAt);
  ok("the lane holds the milestone", laneAt >= 0 && html.indexOf('id="tablets-milestone"') > laneAt && html.indexOf('id="tablets-milestone"') < trayAt);
  ok("the lane holds the blessing", laneAt >= 0 && html.indexOf('id="tablets-blessing"') > laneAt && html.indexOf('id="tablets-blessing"') < trayAt);
  ok("the blessing kicker reads A blessing", html.indexOf("<i>A blessing</i>") >= 0);
  ok("Celestial appears nowhere in index.html", html.indexOf("Celestial") < 0);
  const sbL = boot();
  const wide = read(sbL, "tabletsPopupAnchor({left:0,right:900,top:0,bottom:500},{left:300,right:400,top:200,bottom:248})");
  eq("a wide card pops the Favor on the right", wide.side, "right");
  eq("the right pop starts 16 px past the slot", wide.x, 416);
  eq("the right pop sits on the slot's centre", wide.y, 224);
  const narrow = read(sbL, "tabletsPopupAnchor({left:0,right:500,top:40,bottom:500},{left:300,right:400,top:200,bottom:248})");
  eq("a narrow card pops the Favor below", narrow.side, "below");
  eq("the below pop sits 18 px under the slot", narrow.y, 226);
  eq("the below pop centres on the slot", narrow.x, 350);
  exec(sbL, "startRun('tablets','watchman'); $('tablets-ms').getBoundingClientRect = function(){ return {left:0,right:900,top:0,bottom:500}; }; $('tablets-slot').getBoundingClientRect = function(){ return {left:300,right:400,top:200,bottom:248}; }; spawnTabletsScorePopup('Test', $('tablets-slot'));");
  eq("a popup spawned beside a wide slot carries data-side right", read(sbL, "$('tablets-ms').children[$('tablets-ms').children.length - 1].dataset.side"), "right");
  const laneCss = fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8");
  ok("the lane banners are static inside the lane", /\.tablets-lane \.tablets-milestone,\.tablets-lane \.tablets-blessing\{[^}]*position:static/.test(laneCss));
  ok("the lane is a fixed 48 px strip", /\.tablets-lane\{[^}]*height:48px/.test(laneCss));
  ok("the right Favor drifts sideways and does not rise", /@keyframes tabletsPopRiseRight\{[\s\S]*?100%\{transform:translate\(24px,-50%\)/.test(laneCss));
  ok("reduced motion stills the lane", /body\.reduced \.tablets-lane \.active/.test(laneCss));
}
{
  // L4: the roll yields room on short screens so the sand bar never hides under the lane or the tray.
  const rollCss = fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8");
  ok("the roll's floor is 160px", rollCss.indexOf(".tablets-roll{position:relative;flex:1 1 auto;min-height:160px;") >= 0);
  ok("the phone roll's floor is 84px", rollCss.indexOf("@media (max-width:640px){.tablets-roll{min-height:84px}}") >= 0);
}
{
  // L2: with no room beside the slot, the Favor shows in the lane, not over the verse.
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "$('tablets-ms').getBoundingClientRect = function(){ return { left:0, top:0, right:375, bottom:400, width:375, height:400 }; }");
  exec(sb, "var __slot = { getBoundingClientRect: function(){ return { left:87, top:60, right:287, bottom:108, width:200, height:48 }; } }");
  exec(sb, "spawnTabletsScorePopup('Sure · +180 FAVOR', __slot)");
  const lane = read(sb, "$('tablets-lane').children");
  ok("a narrow card sends the Favor to the lane", lane.some(function(c){ return c.className === 'tablets-score-popup' && c.dataset && c.dataset.lane === '1'; }));
}
{
  // L1: a narrow lane takes turns: while the Favor chip shows, the banners wait.
  const laneCss = fs.readFileSync(path.join(ROOT, "css", "tablets.css"), "utf8");
  ok("the narrow lane gives the Favor chip the row", laneCss.indexOf("#tablets-lane:has(.tablets-score-popup[data-lane]) .tablets-milestone") >= 0);
}
unstubRandom();
if (fail) {
```

### E10 the roll yields room so the sand bar stays on screen (css/tablets.css)  (`css/tablets.css`, serves L4)

Why: Measured (sources/sand-fit.txt): phase B's min-height 260px (220px on phones) keeps the roll taller than the room on short screens, so the sand bar slid under the tray at 1366x768 and 375x667 before this change, and under the new lane at 1280x800. 160px (100px at 640px and narrower) clears it at all four sizes while the roll still fills any spare room (flex 1 1 auto).

Find (exactly once):

```css
.tablets-roll{position:relative;flex:1 1 auto;min-height:260px;overflow:hidden;
```

Replace with:

```css
.tablets-roll{position:relative;flex:1 1 auto;min-height:160px;overflow:hidden;
```

### E11 the phone roll yields room too (css/tablets.css)  (`css/tablets.css`, serves L4)

Why: pairs with E10: on a 375x667 phone an 84px floor (100px still left the lane over the sand bar's bottom 6px) keeps the sand bar above the lane. On a 375 px phone three items do not fit one 48 px row (the frame showed the banners squeezed to clipped circles), so the narrow lane takes turns: Favor first, then compact banners.

Find (exactly once):

```css
@media (max-width:640px){.tablets-roll{min-height:220px}}
```

Replace with:

```css
@media (max-width:640px){.tablets-roll{min-height:84px}}
/* L1: a narrow lane takes turns instead of squeezing: the Favor chip has the row to itself while it shows, then the banners follow in compact form. */
@media (max-width:640px){
  #tablets-lane:has(.tablets-score-popup[data-lane]) .tablets-milestone,#tablets-lane:has(.tablets-score-popup[data-lane]) .tablets-blessing{display:none}
  #tablets-lane .tablets-milestone-kicker,#tablets-lane .tablets-blessing i{display:none}
  #tablets-lane .tablets-milestone,#tablets-lane .tablets-blessing{flex:0 1 auto;min-width:0;padding:0 10px}
  #tablets-lane .tablets-milestone b{flex:0 0 auto}
  #tablets-lane .tablets-milestone em{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}
  #tablets-lane .tablets-blessing em{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;white-space:normal;font-size:.7rem;line-height:1.15;overflow:hidden}
}
```

### E12 a Favor with no room beside the slot is shown in the lane (js/tablets-run.js)  (`js/tablets-run.js`, serves L2)

Why: Measured at 375x667: a Favor popped below the slot lands on the active line, because the roll sits right under the slot on a short phone. In the lane it is a chip beside the milestone and the blessing.

Find (exactly once):

```js
  ms.appendChild(popup);
  setTimeout(function(){ try{ popup.remove(); }catch(e){} }, 900);
```

Replace with:

```js
  (popup.dataset.lane ? $("tablets-lane") : ms).appendChild(popup);
  setTimeout(function(){ try{ popup.remove(); }catch(e){} }, 900);
```

What does not change: no rule, score, timing, blessing or milestone; only where the banners and the popup appear, and how far the roll may shrink.

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)                80 ms  applied 12 edits to 4 files
make-expected                    49734 ms  expected.json written: 1193 baseline files; changed: css/tablets.css, index.html, js/tablets-run.js, test/tablets.test.js
tamper-test (+ full gate post)  234963 ms  TAMPER-TEST: PASS  (control passed; 8 tampers)
scope-report pristine              101 ms  SCOPE VERDICT: READY  (12 edit(s) pending, 0 already applied)
scope-report dry-run               102 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 12 already applied)
scope-report (real project)        101 ms  SCOPE VERDICT: READY  (12 edit(s) pending, 0 already applied)
gate pre (real project)          27609 ms  RESULT: PASS  (25/25 checks passed, mode=pre)

# make-expected
expected.json written: 1193 baseline files; changed: css/tablets.css, index.html, js/tablets-run.js, test/tablets.test.js
tests before {"pass":75,"fail":0} (exit 0) -> after {"pass":75,"fail":0} (exit 0)
  anchor index.html:519 x1  <div class="tablets-milestone" id="tablets-milestone" aria-hidden="tru
  anchor index.html:631 x1  <div class="tablets-blessing" id="tablets-blessing">
  anchor index.html:634 x1  <i>Celestial visitation</i>
  anchor css/tablets.css:127 x1  .tablets-milestone{
  anchor css/tablets.css:456 x1  .tablets-blessing{
  anchor css/tablets.css:292 x1  .tablets-score-popup{
  anchor js/tablets-run.js:112 x1  function spawnTabletsScorePopup(text, slotEl){

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (38/38 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (16/21 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-css/tablets.css  css/tablets.css is byte-identical , X-index.html  index.html is byte-identical to the dry, X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    a stray file was added -> RESULT: FAIL  (19/21 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S2  no file was added or deleted
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (20/21 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    edited file drifted by one byte: css/tablets.css -> RESULT: FAIL  (20/21 checks passed, mode=post)   caught by: X-css/tablets.css  css/tablets.css is byte-identical 
  OK    edited file drifted by one byte: index.html -> RESULT: FAIL  (20/21 checks passed, mode=post)   caught by: X-index.html  index.html is byte-identical to the dry
  OK    edited file drifted by one byte: test/tablets.test.js -> RESULT: FAIL  (20/21 checks passed, mode=post)   caught by: X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (19/21 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S3  the other 1189 files are byte-identical to the ba
  OK    half-applied: edit "E1 cut the milestone banner out of the stage body" undone -> RESULT: FAIL  (20/21 checks passed, mode=post)   caught by: X-index.html  index.html is byte-identical to the dry
TAMPER-TEST: PASS  (control passed; 8 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 73fc5e75cc240b9441f26a5a3b14b383cfbaef6ffe2b0d0ccc80cae1ef928025
```

## 8. Not measured
- **Other browsers:** the narrow lane's turn-taking uses CSS :has(); checked in Chromium only (Safari 15.4+ and Firefox 121+ support it; older browsers would show the banners squeezed beside the chip).
- **Sizes beyond the four measured** (1280x800, 1366x768, 430x900, 375x667) and landscape phones are not measured.
- **Android:** no lane there.
- **CI:** the stacked PR targets the feel branch; `ci.yml` runs on PRs to master only.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
