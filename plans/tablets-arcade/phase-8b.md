# Plan: Word Tablets phase 8b, six tablets per blank (KJV)

**Status: plan only, nothing applied.** Every number was measured, and `gate pre` re-checks it before anything changes.

<!-- Fields with "=" inside double braces are filled by render-plan.js from tool output. The other double-brace fields are
     prose you write from this session's tool output. `render-plan.js <project> --check` must PASS before reporting. -->

## 1. Goal
Every KJV blank has 3 decoys today and the tray shows 4 tablets (`slice(0, 3)` in js/tablets.js, `sources/p8-sites.txt`). Phase 8 gives each blank 5 decoys so the tray shows 6, as the user decided. Haiku drafted 2462 decoys in six batches; check-decoys.js rejected 227 (all for a word outside the project's KJV text), Haiku redrafted them from the 4664-word vocabulary, the executor replaced 5 pairs on review, and the final check accepted all 2462 (`sources/p8-sites.txt`). Every suite passes today, so there is no failing target; 4 mutations prove the new tests. End state: 1249 edits (18 code, 1231 data) applied to 8 files, the exporter regenerating 4 content files (section 7), every other file byte-identical.

| # | Problem (exact test name or symptom) | Cause (file:line from an anchor) | Kind | Fix |
|---|---|---|---|---|
| S1 | The tray shows 4 tablets | 3 decoys per blank and `slice(0, 3)` | Decision: 6 tablets; N1 KJV now, NKJV keeps 3 decoys (4 tablets) | 1231 data edits + `slice(0, 5)` |
| S2 | Keys stop at 4 | `n <= 4` in tabletsOnKey | follows S1 | keys 1–6, badges, hints |
| S3 | A 4-column desktop grid | the 720px rule | follows S1 | 2 columns on phones, 3 at 720px, 6 at 1150px |
| S4 | Tests pin 4 stones and Winnow's 2 | test/tablets.test.js | Stale test (decided change) | 6 options, 6 unique stones, Winnow greys 3 (winnowCount(5)); new data, key, badge and fallback tests |

Out of scope, unchanged before and after: none.

## 2. Scope
- **Edited:** `js/tablets.js`, `js/tablets-canon.js`, `js/tablets-hall.js`, `js/tablets-more.js`, `js/tablets-run.js`, `index.html`, `css/tablets.css`, `test/tablets.test.js`, changed only by `node fix-plan/apply.js .`
- **Generated:** `shared/content/tablets.json`, `shared/content/manifest.json`, `mobile/androidApp/src/main/assets/content/tablets.json`, `mobile/core/src/test/resources/content/tablets.json`, changed only by `node C:/Users/fanel/AppData/Local/Temp/claude/C--Users-fanel-Downloads-ctv-push/f5ba8b0d-f406-419b-9793-69407862a041/scratchpad/fix-plan-p8/gen.js`
- **Everything else:** 1168 files stay byte-identical. No file is added or deleted.
- **Invariants:** the Winnow rule (min(3, decoys − 1)), the carve and Hold rules, the Favor formula, the step flow, typing and the Winnow power stay byte-identical. NKJV data is not touched.

## 3. Hard rules (any violation = the plan FAILS)
1. **Fail closed.** Any `[FAIL]`, crash or timeout fails the plan. Never edit the gate, `config.js` or `expected.json`
   to get past one. Restore the backups and report.
2. **No hand edits.** Only `apply.js` changes edited files: each edit is applied exactly once, or nothing is written.
3. **No weakened tests.** Changed files must be byte-identical to the dry run. No test may be renamed, dropped, skipped
   or made always-true. The gate breaks the fixed code in 4 way(s), and each must be caught.
4. **Zero hallucination.** Report only what the gate or a tool printed. Write "not run" or "not measured" for
   anything else.
5. **Pinned tooling.**
   - `fix-plan/gate.js` sha256 `61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587`
   - `fix-plan/expected.json` sha256 `395adb5245f47e97a32782ade4470956bfbb97f93a9e4d8113692d3e3801bb5e`

   The gate pins the other files itself.
6. **Real run only.** The final `RESULT:` lines must not contain `DRY-RUN`.

## 4. Before execution: scope analysis
Read-only. Check the pins, run `node fix-plan/scope-report.js` (required: `SCOPE VERDICT: READY`), read sections 1–2
and 6 and `fix-plan/edits.js`, and grep the callers and tests of each edit site.

Present it under four headings, citing `file:line`:
- **Scope covered:** 12 file(s) change (`css/tablets.css`, `index.html`, `js/tablets-canon.js`, `js/tablets-hall.js`, `js/tablets-more.js`, `js/tablets-run.js`, `js/tablets.js`, `mobile/androidApp/src/main/assets/content/tablets.json`, `mobile/core/src/test/resources/content/tablets.json`, `shared/content/manifest.json`, `shared/content/tablets.json`, `test/tablets.test.js`) and 1168 stay identical.
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
node fix-plan/gate.js pre     # required: RESULT: PASS (31/31 checks passed, mode=pre); writes backups
node fix-plan/apply.js .      # required: applied 1249 edits to 8 files
node C:/Users/fanel/AppData/Local/Temp/claude/C--Users-fanel-Downloads-ctv-push/f5ba8b0d-f406-419b-9793-69407862a041/scratchpad/fix-plan-p8/gen.js    # regenerate
node fix-plan/gate.js post    # required: RESULT: PASS (46/46 checks passed, mode=post)
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
### E1 options slices five decoys  (`js/tablets.js`, serves S1)

Why: a KJV blank now shows six tablets (the answer and five decoys); a three-decoy blank still shows four (N1)

Find (exactly once):

```js
return shuffle([blank.a].concat((blank.d || []).slice(0, 3)));
```

Replace with:

```js
/* Six tablets per blank (decision 2026-11-03): the answer and five decoys. A three-decoy blank (NKJV, N1) still shows four. */
    return shuffle([blank.a].concat((blank.d || []).slice(0, 5)));
```

### E2 tray badges run to six  (`js/tablets-run.js`, serves S2)

Why: the tray labels its six stones 1 to 6 so each one has a key (equivalent to the existing String(i + 1) fallback, so no mutation can catch it; kept so the six labels read plainly)

Find (exactly once):

```js
const badges = ["1", "2", "3", "4"];
```

Replace with:

```js
const badges = ["1", "2", "3", "4", "5", "6"];
```

### E3 keys 1 to 6 pick a tablet  (`js/tablets-run.js`, serves S2)

Why: the number keys reach the sixth stone (six tablets per blank)

Find (exactly once):

```js
if(n >= 1 && n <= 4){
```

Replace with:

```js
if(n >= 1 && n <= 6){
```

### E4 tutorial prompt says 1 to 6  (`js/tablets-run.js`, serves S2)

Why: the tutorial prompt tells the player the number keys go to six (six tablets per blank)

Find (exactly once):

```js
(1–4 picks)
```

Replace with:

```js
(1–6 picks)
```

### E5 comment says 1 to 6  (`js/tablets-run.js`, serves S2)

Why: the key comment matches the six-tablet tray

Find (exactly once):

```js
1-4 pick a tablet
```

Replace with:

```js
1-6 pick a tablet
```

### E6 keys hint says 1 to 6  (`index.html`, serves S2)

Why: the keys hint on the tablets screen shows 1–6 (six tablets per blank); other modes unchanged

Find (exactly once):

```html
1–4 · I · W · S
```

Replace with:

```html
1–6 · I · W · S
```

### E7 tray grid three then six columns  (`css/tablets.css`, serves S3)

Why: phones keep two columns; from 720px the six stones sit three to a row; from 1150px they sit in one row of six

Find (exactly once):

```css
@media (min-width:720px){.tablets-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
```

Replace with:

```css
@media (min-width:720px){.tablets-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (min-width:1150px){.tablets-grid{grid-template-columns:repeat(6,minmax(0,1fr))}}
```

### T1 Psalm 23 and 91 blanks show six, with five decoys  (`test/tablets.test.js`, serves S4)

Why: the pinned four-option and three-decoy assertions for Psalm 23 and 91 are the decided six-tablet truth

Find (exactly once):

```js
eq(blank.r + " has 4 options", opts.length, 4);
```

Replace with:

```js
eq(blank.r + " has 6 options", opts.length, 6);
```

### T2 Psalm 23 and 91 decoy count is five  (`test/tablets.test.js`, serves S4)

Why: the three-decoy pin becomes five (decided change)

Find (exactly once):

```js
ok(blank.r + " has 3 decoys", blank.d.length >= 3);
```

Replace with:

```js
ok(blank.r + " has 5 decoys", blank.d.length >= 5);
```

### T3 every blank shows six options  (`test/tablets.test.js`, serves S4)

Why: the pinned four-option assertion for every chapter blank becomes six (decided change)

Find (exactly once):

```js
eq(ch.id + " " + blank.r + " has 4 options", opts.length, 4);
```

Replace with:

```js
eq(ch.id + " " + blank.r + " has 6 options", opts.length, 6);
```

### T4 every blank has five decoys  (`test/tablets.test.js`, serves S4)

Why: the three-decoy pin for every chapter blank becomes five (decided change)

Find (exactly once):

```js
ok(ch.id + " " + blank.r + " has 3 decoys", blank.d.length >= 3);
```

Replace with:

```js
ok(ch.id + " " + blank.r + " has 5 decoys", blank.d.length >= 5);
```

### T5 uniqueness counts six stones  (`test/tablets.test.js`, serves S4)

Why: the uniqueness check takes the answer and five decoys, and expects six distinct stones (decided change)

Find (exactly once):

```js
[blank.a].concat(blank.d.slice(0, 3)).forEach(
```

Replace with:

```js
[blank.a].concat(blank.d.slice(0, 5)).forEach(
```

### T6 stones are unique, six of them  (`test/tablets.test.js`, serves S4)

Why: the expected unique-stone count becomes six (decided change)

Find (exactly once):

```js
eq(ch.id + " " + blank.r + " stones are unique", Object.keys(uniq).length, 4);
```

Replace with:

```js
eq(ch.id + " " + blank.r + " stones are unique", Object.keys(uniq).length, 6);
```

### T7 illuminate leaves six stones live  (`test/tablets.test.js`, serves S4)

Why: with six stones on the tray and no Winnow, every stone is live (decided change)

Find (exactly once):

```js
eq("illuminate leaves four stones live", read(sb, "$('tablets-grid').children.filter(function(c){ return !c.disabled; }).length"), 4);
```

Replace with:

```js
eq("illuminate leaves six stones live", read(sb, "$('tablets-grid').children.filter(function(c){ return !c.disabled; }).length"), 6);
```

### T8 winnow greys three of five decoys  (`test/tablets.test.js`, serves S4)

Why: Winnow takes min(3, decoys - 1) = 3 of the five decoys (decided change)

Find (exactly once):

```js
eq("winnow dims two decoys", read(sb, "tabletsGreyWords().length"), 2);
```

Replace with:

```js
eq("winnow dims three decoys", read(sb, "tabletsGreyWords().length"), 3);
```

### T9 three stones stay live after Winnow  (`test/tablets.test.js`, serves S4)

Why: six stones minus three greyed leaves three live (decided change)

Find (exactly once):

```js
eq("two stones stay live", read(sb, "$('tablets-grid').children.filter(function(c){ return !c.classList.contains('dim'); }).length"), 2);
```

Replace with:

```js
eq("three stones stay live", read(sb, "$('tablets-grid').children.filter(function(c){ return !c.classList.contains('dim'); }).length"), 3);
```

### T10 new six-tablet tests  (`test/tablets.test.js`, serves S4)

Why: pins every KJV blank to five distinct decoys, the N1 three-decoy fallback, keys 5 and 6, the six-stone tray and badges, and Winnow on six stones

Find (exactly once):

```js
eq("charges carry across blanks", read(sb, "R.powers.winnow"), 0);
}
```

Replace with:

```js
eq("charges carry across blanks", read(sb, "R.powers.winnow"), 0);
}

// Six tablets per blank (decision 2026-11-03): every KJV blank carries exactly five distinct decoys, none the answer.
Tablets.chapters.forEach(function(ch){
  ch.blanks.forEach(function(blank){
    const low = blank.d.map(function(w){ return String(w).toLowerCase(); });
    eq(ch.id + " " + blank.r + " has exactly 5 decoys", blank.d.length, 5);
    ok(ch.id + " " + blank.r + " decoys are distinct", low.filter(function(w, i){ return low.indexOf(w) === i; }).length === low.length);
    ok(ch.id + " " + blank.r + " no decoy is the answer", low.indexOf(String(blank.a).toLowerCase()) < 0);
  });
});

// N1: a blank with only three decoys (NKJV) still shows four tablets.
{
  const threeDecoys = Tablets.options({ a: "want", d: ["fear", "fall", "fail"] });
  eq("a blank with three decoys shows four tablets", threeDecoys.length, 4);
  ok("the three-decoy blank keeps the answer", threeDecoys.indexOf("want") >= 0);
}

// Keys 5 and 6 pick the fifth and sixth stones.
[["5", 4], ["6", 5]].forEach(function(pair){
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  const want = read(sb, "tabletsOptsForBlank()[" + pair[1] + "]");
  exec(sb, "window._picked = []; var _tp = tabletsPick; tabletsPick = function(w){ window._picked.push(w); _tp(w); }");
  exec(sb, "tabletsOnKey({ key: " + JSON.stringify(pair[0]) + ", preventDefault: function(){} })");
  eq("key " + pair[0] + " picks stone " + (pair[1] + 1), read(sb, "window._picked[0]"), want);
});

// The tray paints six stones labelled 1 to 6.
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  eq("the tray shows six stones", read(sb, "$('tablets-grid').children.length"), 6);
  eq("the stones carry badges 1 to 6", read(sb, "$('tablets-grid').children.map(function(c){ return c.children[0].textContent; }).join(',')"), "1,2,3,4,5,6");
}

// Winnow on a six-stone tray greys three of the five decoys.
{
  const sb = boot();
  exec(sb, "startRun('tablets','watchman')");
  exec(sb, "tabletsWinnow()");
  eq("winnow greys three of five decoys on six stones", read(sb, "tabletsGreyWords().length"), 3);
  eq("the six-stone tray keeps three live", read(sb, "$('tablets-grid').children.filter(function(c){ return !c.disabled; }).length"), 3);
}
```

### T11 six-column rule is pinned  (`test/tablets.test.js`, serves S4)

Why: a source assertion pins the three-column tablet at 720px and the six-column rule at 1150px

Find (exactly once):

```js
ok("reduced motion sets translate:none on the rising card", /body\.reduced[^{]*\{translate:none/.test(riseCss));
```

Replace with:

```js
ok("reduced motion sets translate:none on the rising card", /body\.reduced[^{]*\{translate:none/.test(riseCss));
  ok("six tablets lay out three to a row at 720px, then six at 1150px", /@media \(min-width:720px\)\{\.tablets-grid\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}\}\s*@media \(min-width:1150px\)\{\.tablets-grid\{grid-template-columns:repeat\(6,minmax\(0,1fr\)\)\}\}/.test(riseCss));
```

### D psalm23 blank 0 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The LORD is my shepherd; I shall not", a:"want", suffix:".", d:["fear","fall","fail"]
```

Replace with:

```js
prefix:"The LORD is my shepherd; I shall not", a:"want", suffix:".", d:["fear","fall","fail","wander","stumble"]
```

### D psalm23 blank 1 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He maketh me to lie down in green", a:"pastures", suffix:":", d:["meadows","valleys","fields"]
```

Replace with:

```js
prefix:"He maketh me to lie down in green", a:"pastures", suffix:":", d:["meadows","valleys","fields","gardens","wilderness"]
```

### D psalm23 blank 2 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"he leadeth me beside the still", a:"waters", suffix:".", d:["rivers","streams","fountains"]
```

Replace with:

```js
prefix:"he leadeth me beside the still", a:"waters", suffix:".", d:["rivers","streams","fountains","wells","seas"]
```

### D psalm23 blank 3 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He restoreth my", a:"soul", suffix:":", d:["heart","spirit","strength"]
```

Replace with:

```js
prefix:"He restoreth my", a:"soul", suffix:":", d:["heart","spirit","strength","flesh","body"]
```

### D psalm23 blank 4 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"he leadeth me in the paths of", a:"righteousness", suffix:"for his name's sake.", d:["holiness","peace","truth"]
```

Replace with:

```js
prefix:"he leadeth me in the paths of", a:"righteousness", suffix:"for his name's sake.", d:["holiness","peace","truth","wisdom","judgment"]
```

### D psalm23 blank 5 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Yea, though I walk through the valley of the shadow of death, I will fear no", a:"evil", suffix:":", d:["death","darkness","trouble"]
```

Replace with:

```js
prefix:"Yea, though I walk through the valley of the shadow of death, I will fear no", a:"evil", suffix:":", d:["death","darkness","trouble","sin","lion"]
```

### D psalm23 blank 6 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"for thou art with me; thy rod and thy", a:"staff", suffix:"they comfort me.", d:["shield","sword","hand"]
```

Replace with:

```js
prefix:"for thou art with me; thy rod and thy", a:"staff", suffix:"they comfort me.", d:["shield","sword","hand","spear","bow"]
```

### D psalm23 blank 7 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou preparest a table before me in the presence of mine", a:"enemies", suffix:":", d:["foes","brethren","rulers"]
```

Replace with:

```js
prefix:"Thou preparest a table before me in the presence of mine", a:"enemies", suffix:":", d:["foes","brethren","rulers","servants","kings"]
```

### D psalm23 blank 8 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"thou anointest my head with", a:"oil", suffix:"; my cup runneth over.", d:["wine","grace","water"]
```

Replace with:

```js
prefix:"thou anointest my head with", a:"oil", suffix:"; my cup runneth over.", d:["wine","grace","water","myrrh","honey"]
```

### D psalm23 blank 9 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Surely goodness and", a:"mercy", suffix:"shall follow me all the days of my life:", d:["truth","peace","glory"]
```

Replace with:

```js
prefix:"Surely goodness and", a:"mercy", suffix:"shall follow me all the days of my life:", d:["truth","peace","glory","love","faith"]
```

### D psalm23 blank 10 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and I will dwell in the house of the LORD for", a:"ever", suffix:".", d:["ages","safety","eternity"]
```

Replace with:

```js
prefix:"and I will dwell in the house of the LORD for", a:"ever", suffix:".", d:["ages","safety","eternity","now","once"]
```

### D psalm91 blank 0 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He that dwelleth in the secret place of the most High shall abide under the shadow of the", a:"Almighty", suffix:".", d:["Father","Rock","King"]
```

Replace with:

```js
prefix:"He that dwelleth in the secret place of the most High shall abide under the shadow of the", a:"Almighty", suffix:".", d:["Father","Rock","King","Creator","Judge"]
```

### D psalm91 blank 1 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I will say of the LORD, He is my refuge and my", a:"fortress", suffix:": my God; in him will I trust.", d:["strength","shield","tower"]
```

Replace with:

```js
prefix:"I will say of the LORD, He is my refuge and my", a:"fortress", suffix:": my God; in him will I trust.", d:["strength","shield","tower","garden","wilderness"]
```

### D psalm91 blank 2 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Surely he shall deliver thee from the snare of the", a:"fowler", suffix:", and from the noisome pestilence.", d:["hunter","wicked","lion"]
```

Replace with:

```js
prefix:"Surely he shall deliver thee from the snare of the", a:"fowler", suffix:", and from the noisome pestilence.", d:["hunter","wicked","lion","shepherd","watchman"]
```

### D psalm91 blank 3 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He shall cover thee with his", a:"feathers", suffix:", and under his wings shalt thou trust:", d:["hands","mantle","shadow"]
```

Replace with:

```js
prefix:"He shall cover thee with his", a:"feathers", suffix:", and under his wings shalt thou trust:", d:["hands","mantle","shadow","garments","gold"]
```

### D psalm91 blank 4 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"his truth shall be thy shield and", a:"buckler", suffix:".", d:["helmet","sword","rock"]
```

Replace with:

```js
prefix:"his truth shall be thy shield and", a:"buckler", suffix:".", d:["helmet","sword","rock","spear","breastplate"]
```

### D psalm91 blank 5 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt not be afraid for the terror by", a:"night", suffix:"; nor for the arrow that flieth by day;", d:["storm","death","fire"]
```

Replace with:

```js
prefix:"Thou shalt not be afraid for the terror by", a:"night", suffix:"; nor for the arrow that flieth by day;", d:["storm","death","fire","wind","thunder"]
```

### D psalm91 blank 6 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at", a:"noonday", suffix:".", d:["midnight","daybreak","evening"]
```

Replace with:

```js
prefix:"Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at", a:"noonday", suffix:".", d:["midnight","daybreak","evening","morning","night"]
```

### D psalm91 blank 7 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"A thousand shall fall at thy side, and ten thousand at thy", a:"right", suffix:"hand; but it shall not come nigh thee.", d:["left","own","other"]
```

Replace with:

```js
prefix:"A thousand shall fall at thy side, and ten thousand at thy", a:"right", suffix:"hand; but it shall not come nigh thee.", d:["left","own","other","mighty","holy"]
```

### D psalm91 blank 8 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Only with thine eyes shalt thou behold and see the reward of the", a:"wicked", suffix:".", d:["righteous","nations","proud"]
```

Replace with:

```js
prefix:"Only with thine eyes shalt thou behold and see the reward of the", a:"wicked", suffix:".", d:["righteous","nations","proud","heathen","rich"]
```

### D psalm91 blank 9 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Because thou hast made the LORD, which is my refuge, even the most High, thy", a:"habitation", suffix:";", d:["dwelling","fortress","refuge"]
```

Replace with:

```js
prefix:"Because thou hast made the LORD, which is my refuge, even the most High, thy", a:"habitation", suffix:";", d:["dwelling","fortress","refuge","portion","inheritance"]
```

### D psalm91 blank 10 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"There shall no evil befall thee, neither shall any plague come nigh thy", a:"dwelling", suffix:".", d:["house","tent","habitation"]
```

Replace with:

```js
prefix:"There shall no evil befall thee, neither shall any plague come nigh thy", a:"dwelling", suffix:".", d:["house","tent","habitation","camp","city"]
```

### D psalm91 blank 11 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For he shall give his", a:"angels", suffix:"charge over thee, to keep thee in all thy ways.", d:["spirits","hosts","saints"]
```

Replace with:

```js
prefix:"For he shall give his", a:"angels", suffix:"charge over thee, to keep thee in all thy ways.", d:["spirits","hosts","saints","servants","prophets"]
```

### D psalm91 blank 12 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"They shall bear thee up in their hands, lest thou dash thy foot against a", a:"stone", suffix:".", d:["rock","snare","serpent"]
```

Replace with:

```js
prefix:"They shall bear thee up in their hands, lest thou dash thy foot against a", a:"stone", suffix:".", d:["rock","snare","serpent","thorn","bush"]
```

### D psalm91 blank 13 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt tread upon the lion and adder: the young lion and the dragon shalt thou", a:"trample", suffix:"under feet.", d:["conquer","cast","break"]
```

Replace with:

```js
prefix:"Thou shalt tread upon the lion and adder: the young lion and the dragon shalt thou", a:"trample", suffix:"under feet.", d:["conquer","cast","break","slay","devour"]
```

### D psalm91 blank 14 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Because he hath set his love upon me, therefore will I", a:"deliver", suffix:"him: I will set him on high, because he hath known my name.", d:["preserve","save","strengthen"]
```

Replace with:

```js
prefix:"Because he hath set his love upon me, therefore will I", a:"deliver", suffix:"him: I will set him on high, because he hath known my name.", d:["preserve","save","strengthen","forsake","bless"]
```

### D psalm91 blank 15 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He shall call upon me, and I will answer him: I will be with him in", a:"trouble", suffix:"; I will deliver him, and honour him.", d:["danger","need","battle"]
```

Replace with:

```js
prefix:"He shall call upon me, and I will answer him: I will be with him in", a:"trouble", suffix:"; I will deliver him, and honour him.", d:["danger","need","battle","fire","sickness"]
```

### D psalm91 blank 16 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"With long life will I satisfy him, and shew him my", a:"salvation", suffix:".", d:["mercy","glory","favour"]
```

Replace with:

```js
prefix:"With long life will I satisfy him, and shew him my", a:"salvation", suffix:".", d:["mercy","glory","favour","strength","wisdom"]
```

### D john1 blank 0 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"In the beginning was the", a:"Word", suffix:", and the Word was with God, and the Word was God.", d:["Light","Law","Voice"]
```

Replace with:

```js
prefix:"In the beginning was the", a:"Word", suffix:", and the Word was with God, and the Word was God.", d:["Light","Law","Voice","Life","Spirit"]
```

### D john1 blank 1 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The same was in the beginning with", a:"God", suffix:".", d:["man","heaven","us"]
```

Replace with:

```js
prefix:"The same was in the beginning with", a:"God", suffix:".", d:["man","heaven","us","Moses","Abraham"]
```

### D john1 blank 2 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"All things were made by him; and without him was not any thing", a:"made", suffix:"that was made.", d:["done","seen","formed"]
```

Replace with:

```js
prefix:"All things were made by him; and without him was not any thing", a:"made", suffix:"that was made.", d:["done","seen","formed","begotten","born"]
```

### D john1 blank 3 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"In him was life; and the life was the light of", a:"men", suffix:".", d:["God","heaven","angels"]
```

Replace with:

```js
prefix:"In him was life; and the life was the light of", a:"men", suffix:".", d:["God","heaven","angels","saints","kings"]
```

### D john1 blank 4 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the light shineth in darkness; and the darkness comprehended it", a:"not", suffix:".", d:["well","fully","ever"]
```

Replace with:

```js
prefix:"And the light shineth in darkness; and the darkness comprehended it", a:"not", suffix:".", d:["well","fully","ever","then","now"]
```

### D john1 blank 5 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"There was a man sent from God, whose name was", a:"John", suffix:".", d:["Jesus","Elijah","Moses"]
```

Replace with:

```js
prefix:"There was a man sent from God, whose name was", a:"John", suffix:".", d:["Jesus","Elijah","Moses","Peter","Paul"]
```

### D john1 blank 6 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The same came for a witness, to bear witness of the Light, that all men through him might", a:"believe", suffix:".", d:["live","see","follow"]
```

Replace with:

```js
prefix:"The same came for a witness, to bear witness of the Light, that all men through him might", a:"believe", suffix:".", d:["live","see","follow","hear","know"]
```

### D john1 blank 7 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He was not that Light, but was sent to bear witness of that", a:"Light", suffix:".", d:["Word","truth","life"]
```

Replace with:

```js
prefix:"He was not that Light, but was sent to bear witness of that", a:"Light", suffix:".", d:["Word","truth","life","Saviour","Prophet"]
```

### D john1 blank 8 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"That was the true Light, which lighteth every man that cometh into the", a:"world", suffix:".", d:["kingdom","earth","day"]
```

Replace with:

```js
prefix:"That was the true Light, which lighteth every man that cometh into the", a:"world", suffix:".", d:["kingdom","earth","day","city","house"]
```

### D john1 blank 9 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He was in the world, and the world was made by him, and the world knew him", a:"not", suffix:".", d:["never","little","again"]
```

Replace with:

```js
prefix:"He was in the world, and the world was made by him, and the world knew him", a:"not", suffix:".", d:["never","little","again","well","fully"]
```

### D john1 blank 10 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He came unto his own, and his own received him", a:"not", suffix:".", d:["gladly","fully","never"]
```

Replace with:

```js
prefix:"He came unto his own, and his own received him", a:"not", suffix:".", d:["gladly","fully","never","well","again"]
```

### D john1 blank 11 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But as many as received him, to them gave he power to become the sons of", a:"God", suffix:", even to them that believe on his name:", d:["man","Abraham","Israel"]
```

Replace with:

```js
prefix:"But as many as received him, to them gave he power to become the sons of", a:"God", suffix:", even to them that believe on his name:", d:["man","Abraham","Israel","Adam","Jacob"]
```

### D john1 blank 12 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of", a:"God", suffix:".", d:["grace","heaven","truth"]
```

Replace with:

```js
prefix:"Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of", a:"God", suffix:".", d:["grace","heaven","truth","Jesus","Abraham"]
```

### D john1 blank 13 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the", a:"Father", suffix:",) full of grace and truth.", d:["Son","Lord","Most High"]
```

Replace with:

```js
prefix:"And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the", a:"Father", suffix:",) full of grace and truth.", d:["Son","Lord","Most High","Spirit","Christ"]
```

### D john1 blank 14 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was", a:"before", suffix:"me.", d:["above","with","near"]
```

Replace with:

```js
prefix:"John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was", a:"before", suffix:"me.", d:["above","with","near","behind","beyond"]
```

### D john1 blank 15 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And of his fulness have all we received, and grace for", a:"grace", suffix:".", d:["mercy","truth","truth's sake"]
```

Replace with:

```js
prefix:"And of his fulness have all we received, and grace for", a:"grace", suffix:".", d:["mercy","truth","truth's sake","love","faith"]
```

### D john1 blank 16 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For the law was given by Moses, but grace and truth came by Jesus", a:"Christ", suffix:".", d:["the Lord","of Nazareth","Messiah"]
```

Replace with:

```js
prefix:"For the law was given by Moses, but grace and truth came by Jesus", a:"Christ", suffix:".", d:["the Lord","of Nazareth","Messiah","Abraham","David"]
```

### D john1 blank 17 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath", a:"declared", suffix:"him.", d:["revealed","seen","known"]
```

Replace with:

```js
prefix:"No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath", a:"declared", suffix:"him.", d:["revealed","seen","known","beheld","sought"]
```

### D john1 blank 18 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And this is the record of John, when the Jews sent priests and Levites from Jerusalem to ask him, Who art", a:"thou", suffix:"?", d:["ye","he","this"]
```

Replace with:

```js
prefix:"And this is the record of John, when the Jews sent priests and Levites from Jerusalem to ask him, Who art", a:"thou", suffix:"?", d:["ye","he","this","you","thyself"]
```

### D john1 blank 19 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he confessed, and denied not; but confessed, I am not the", a:"Christ", suffix:".", d:["prophet","Messiah","king"]
```

Replace with:

```js
prefix:"And he confessed, and denied not; but confessed, I am not the", a:"Christ", suffix:".", d:["prophet","Messiah","king","Lord","Elias"]
```

### D john1 blank 20 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And they asked him, What then? Art thou Elias? And he saith, I am not. Art thou that", a:"prophet", suffix:"? And he answered, No.", d:["priest","scribe","teacher"]
```

Replace with:

```js
prefix:"And they asked him, What then? Art thou Elias? And he saith, I am not. Art thou that", a:"prophet", suffix:"? And he answered, No.", d:["priest","scribe","teacher","judge","shepherd"]
```

### D john1 blank 21 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Then said they unto him, Who art thou? that we may give an answer to them that sent us. What sayest thou of", a:"thyself", suffix:"?", d:["the Christ","the kingdom","this man"]
```

Replace with:

```js
prefix:"Then said they unto him, Who art thou? that we may give an answer to them that sent us. What sayest thou of", a:"thyself", suffix:"?", d:["the Christ","the kingdom","this man","others","prophets"]
```

### D john1 blank 22 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He said, I am the voice of one crying in the wilderness, Make straight the way of the", a:"Lord", suffix:", as said the prophet Esaias.", d:["king","Christ","Most High"]
```

Replace with:

```js
prefix:"He said, I am the voice of one crying in the wilderness, Make straight the way of the", a:"Lord", suffix:", as said the prophet Esaias.", d:["king","Christ","Most High","Father","Shepherd"]
```

### D john1 blank 23 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And they which were sent were of the", a:"Pharisees", suffix:".", d:["Sadducees","scribes","priests"]
```

Replace with:

```js
prefix:"And they which were sent were of the", a:"Pharisees", suffix:".", d:["Sadducees","scribes","priests","Romans","Egyptians"]
```

### D john1 blank 24 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Why baptizest thou then, if thou be not that Christ, nor Elias, neither that", a:"prophet", suffix:"?", d:["priest","teacher","king"]
```

Replace with:

```js
prefix:"Why baptizest thou then, if thou be not that Christ, nor Elias, neither that", a:"prophet", suffix:"?", d:["priest","teacher","king","judge","shepherd"]
```

### D john1 blank 25 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"John answered them, saying, I baptize with water: but there standeth one among you, whom ye know", a:"not", suffix:";", d:["little","already","well"]
```

Replace with:

```js
prefix:"John answered them, saying, I baptize with water: but there standeth one among you, whom ye know", a:"not", suffix:";", d:["little","already","well","now","again"]
```

### D john1 blank 26 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He it is, who coming after me is preferred before me, whose shoe's latchet I am not worthy to", a:"unloose", suffix:".", d:["bear","touch","take"]
```

Replace with:

```js
prefix:"He it is, who coming after me is preferred before me, whose shoe's latchet I am not worthy to", a:"unloose", suffix:".", d:["bear","touch","take","wash","kiss"]
```

### D john1 blank 27 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"These things were done in Bethabara beyond Jordan, where John was", a:"baptizing", suffix:".", d:["preaching","dwelling","teaching"]
```

Replace with:

```js
prefix:"These things were done in Bethabara beyond Jordan, where John was", a:"baptizing", suffix:".", d:["preaching","dwelling","teaching","praying","fasting"]
```

### D john1 blank 28 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The next day John seeth Jesus coming unto him, and saith, Behold the Lamb of God, which taketh away the sin of the", a:"world", suffix:".", d:["people","nations","earth"]
```

Replace with:

```js
prefix:"The next day John seeth Jesus coming unto him, and saith, Behold the Lamb of God, which taketh away the sin of the", a:"world", suffix:".", d:["people","nations","earth","land","city"]
```

### D john1 blank 29 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"After me cometh a man which is preferred before me: for he was", a:"before", suffix:"me.", d:["above","with","near"]
```

Replace with:

```js
prefix:"After me cometh a man which is preferred before me: for he was", a:"before", suffix:"me.", d:["above","with","near","behind","beyond"]
```

### D john1 blank 30 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And I knew him not: but that he should be made manifest to Israel, therefore am I come", a:"baptizing", suffix:"with water.", d:["preaching","teaching","calling"]
```

Replace with:

```js
prefix:"And I knew him not: but that he should be made manifest to Israel, therefore am I come", a:"baptizing", suffix:"with water.", d:["preaching","teaching","calling","fasting","rejoicing"]
```

### D john1 blank 31 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And John bare record, saying, I saw the Spirit descending from heaven like a", a:"dove", suffix:", and it abode upon him.", d:["cloud","flame","bird"]
```

Replace with:

```js
prefix:"And John bare record, saying, I saw the Spirit descending from heaven like a", a:"dove", suffix:", and it abode upon him.", d:["cloud","flame","bird","eagle","lamb"]
```

### D john1 blank 32 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Upon whom thou shalt see the Spirit descending, and remaining on him, the same is he which baptizeth with the Holy", a:"Ghost", suffix:".", d:["Spirit","fire","water"]
```

Replace with:

```js
prefix:"Upon whom thou shalt see the Spirit descending, and remaining on him, the same is he which baptizeth with the Holy", a:"Ghost", suffix:".", d:["Spirit","fire","water","Word","Name"]
```

### D john1 blank 33 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And I saw, and bare record that this is the Son of", a:"God", suffix:".", d:["man","David","Israel"]
```

Replace with:

```js
prefix:"And I saw, and bare record that this is the Son of", a:"God", suffix:".", d:["man","David","Israel","Abraham","Moses"]
```

### D john1 blank 34 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Again the next day after John stood, and two of his", a:"disciples", suffix:";", d:["brethren","servants","followers"]
```

Replace with:

```js
prefix:"Again the next day after John stood, and two of his", a:"disciples", suffix:";", d:["brethren","servants","followers","sons","children"]
```

### D john1 blank 35 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And looking upon Jesus as he walked, he saith, Behold the Lamb of", a:"God", suffix:"!", d:["heaven","Israel","the Lord"]
```

Replace with:

```js
prefix:"And looking upon Jesus as he walked, he saith, Behold the Lamb of", a:"God", suffix:"!", d:["heaven","Israel","the Lord","Christ","Light"]
```

### D john1 blank 36 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the two disciples heard him speak, and they followed", a:"Jesus", suffix:".", d:["John","him","after"]
```

Replace with:

```js
prefix:"And the two disciples heard him speak, and they followed", a:"Jesus", suffix:".", d:["John","him","after","Peter","Andrew"]
```

### D john1 blank 37 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Then Jesus turned, and saw them following, and saith unto them, What seek", a:"ye", suffix:"?", d:["thou","they","we"]
```

Replace with:

```js
prefix:"Then Jesus turned, and saw them following, and saith unto them, What seek", a:"ye", suffix:"?", d:["thou","they","we","you","these"]
```

### D john1 blank 38 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He saith unto them, Come and see. They came and saw where he dwelt, and abode with him that day: for it was about the", a:"tenth", suffix:"hour.", d:["sixth","ninth","third"]
```

Replace with:

```js
prefix:"He saith unto them, Come and see. They came and saw where he dwelt, and abode with him that day: for it was about the", a:"tenth", suffix:"hour.", d:["sixth","ninth","third","seventh","first"]
```

### D john1 blank 39 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"One of the two which heard John speak, and followed him, was Andrew, Simon Peter's", a:"brother", suffix:".", d:["father","son","friend"]
```

Replace with:

```js
prefix:"One of the two which heard John speak, and followed him, was Andrew, Simon Peter's", a:"brother", suffix:".", d:["father","son","friend","wife","sister"]
```

### D john1 blank 40 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"We have found the Messias, which is, being interpreted, the", a:"Christ", suffix:".", d:["King","Prophet","Saviour"]
```

Replace with:

```js
prefix:"We have found the Messias, which is, being interpreted, the", a:"Christ", suffix:".", d:["King","Prophet","Saviour","Lord","Shepherd"]
```

### D john1 blank 41 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he brought him to Jesus. And when Jesus beheld him, he said, Thou art Simon the son of Jona: thou shalt be called Cephas, which is by interpretation, A", a:"stone", suffix:".", d:["rock","disciple","Peter"]
```

Replace with:

```js
prefix:"And he brought him to Jesus. And when Jesus beheld him, he said, Thou art Simon the son of Jona: thou shalt be called Cephas, which is by interpretation, A", a:"stone", suffix:".", d:["rock","disciple","Peter","tower","pillar"]
```

### D john1 blank 42 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The day following Jesus would go forth into Galilee, and findeth Philip, and saith unto him, Follow", a:"me", suffix:".", d:["him","Jesus","thee"]
```

Replace with:

```js
prefix:"The day following Jesus would go forth into Galilee, and findeth Philip, and saith unto him, Follow", a:"me", suffix:".", d:["him","Jesus","thee","myself","mine"]
```

### D john1 blank 43 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Now Philip was of Bethsaida, the city of Andrew and", a:"Peter", suffix:".", d:["John","Philip","Nathanael"]
```

Replace with:

```js
prefix:"Now Philip was of Bethsaida, the city of Andrew and", a:"Peter", suffix:".", d:["John","Philip","Nathanael","James","Thomas"]
```

### D john1 blank 44 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"We have found him, of whom Moses in the law, and the prophets, did write, Jesus of Nazareth, the son of", a:"Joseph", suffix:".", d:["David","Mary","God"]
```

Replace with:

```js
prefix:"We have found him, of whom Moses in the law, and the prophets, did write, Jesus of Nazareth, the son of", a:"Joseph", suffix:".", d:["David","Mary","God","Jacob","Jesse"]
```

### D john1 blank 45 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Nathanael said unto him, Can there any good thing come out of Nazareth? Philip saith unto him, Come and", a:"see", suffix:".", d:["follow","believe","hear"]
```

Replace with:

```js
prefix:"And Nathanael said unto him, Can there any good thing come out of Nazareth? Philip saith unto him, Come and", a:"see", suffix:".", d:["follow","believe","hear","wait","dwell"]
```

### D john1 blank 46 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Jesus saw Nathanael coming to him, and saith of him, Behold an Israelite indeed, in whom is no", a:"guile", suffix:"!", d:["sin","deceit","doubt"]
```

Replace with:

```js
prefix:"Jesus saw Nathanael coming to him, and saith of him, Behold an Israelite indeed, in whom is no", a:"guile", suffix:"!", d:["sin","deceit","doubt","pride","fear"]
```

### D john1 blank 47 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Nathanael saith unto him, Whence knowest thou me? Jesus answered and said unto him, Before that Philip called thee, when thou wast under the fig tree, I saw", a:"thee", suffix:".", d:["him","me","it"]
```

Replace with:

```js
prefix:"Nathanael saith unto him, Whence knowest thou me? Jesus answered and said unto him, Before that Philip called thee, when thou wast under the fig tree, I saw", a:"thee", suffix:".", d:["him","me","it","you","thyself"]
```

### D john1 blank 48 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Nathanael answered and saith unto him, Rabbi, thou art the Son of God; thou art the King of", a:"Israel", suffix:".", d:["the Jews","heaven","men"]
```

Replace with:

```js
prefix:"Nathanael answered and saith unto him, Rabbi, thou art the Son of God; thou art the King of", a:"Israel", suffix:".", d:["the Jews","heaven","men","Judah","Jacob"]
```

### D john1 blank 49 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Because I said unto thee, I saw thee under the fig tree, believest thou? thou shalt see greater things than", a:"these", suffix:".", d:["this","before","now"]
```

Replace with:

```js
prefix:"Because I said unto thee, I saw thee under the fig tree, believest thou? thou shalt see greater things than", a:"these", suffix:".", d:["this","before","now","those","others"]
```

### D john1 blank 50 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Verily, verily, I say unto you, Hereafter ye shall see heaven open, and the angels of God ascending and descending upon the Son of", a:"man", suffix:".", d:["God","David","Joseph"]
```

Replace with:

```js
prefix:"Verily, verily, I say unto you, Hereafter ye shall see heaven open, and the angels of God ascending and descending upon the Son of", a:"man", suffix:".", d:["God","David","Joseph","Adam","Abraham"]
```

### D prayer blank 0 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Our", a:"Father", suffix:"which art in heaven, Hallowed be thy name.", d:["Master","Maker","Lord"]
```

Replace with:

```js
prefix:"Our", a:"Father", suffix:"which art in heaven, Hallowed be thy name.", d:["Master","Maker","Lord","Shepherd","Judge"]
```

### D prayer blank 1 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Our Father which art in heaven, Hallowed be thy", a:"name", suffix:".", d:["glory","word","throne"]
```

Replace with:

```js
prefix:"Our Father which art in heaven, Hallowed be thy", a:"name", suffix:".", d:["glory","word","throne","will","kingdom"]
```

### D prayer blank 2 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thy", a:"kingdom", suffix:"come. Thy will be done in earth, as it is in heaven.", d:["power","glory","spirit"]
```

Replace with:

```js
prefix:"Thy", a:"kingdom", suffix:"come. Thy will be done in earth, as it is in heaven.", d:["power","glory","spirit","throne","word"]
```

### D prayer blank 3 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thy kingdom come. Thy", a:"will", suffix:"be done in earth, as it is in heaven.", d:["word","law","peace"]
```

Replace with:

```js
prefix:"Thy kingdom come. Thy", a:"will", suffix:"be done in earth, as it is in heaven.", d:["word","law","peace","glory","power"]
```

### D prayer blank 4 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Give us this day our daily", a:"bread", suffix:".", d:["portion","manna","food"]
```

Replace with:

```js
prefix:"Give us this day our daily", a:"bread", suffix:".", d:["portion","manna","food","water","wine"]
```

### D prayer blank 5 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And forgive us our debts, as we forgive our", a:"debtors", suffix:".", d:["enemies","brothers","neighbors"]
```

Replace with:

```js
prefix:"And forgive us our debts, as we forgive our", a:"debtors", suffix:".", d:["enemies","brothers","neighbors","sinners","servants"]
```

### D prayer blank 6 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And lead us not into temptation, but deliver us from", a:"evil", suffix:":", d:["darkness","sin","trouble"]
```

Replace with:

```js
prefix:"And lead us not into temptation, but deliver us from", a:"evil", suffix:":", d:["darkness","sin","trouble","death","famine"]
```

### D prayer blank 7 gains two decoys (js/tablets.js)  (`js/tablets.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For thine is the kingdom, and the power, and the", a:"glory", suffix:", for ever. Amen.", d:["honor","praise","might"]
```

Replace with:

```js
prefix:"For thine is the kingdom, and the power, and the", a:"glory", suffix:", for ever. Amen.", d:["honor","praise","might","throne","wisdom"]
```

### D genesis1 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"In the beginning God created the heaven and the", a:"earth", suffix:".", d:["world","deep","light"]
```

Replace with:

```js
prefix:"In the beginning God created the heaven and the", a:"earth", suffix:".", d:["world","deep","light","sea","dust"]
```

### D genesis1 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the earth was without form, and void; and darkness was upon the face of the", a:"deep", suffix:".", d:["waters","void","night"]
```

Replace with:

```js
prefix:"And the earth was without form, and void; and darkness was upon the face of the", a:"deep", suffix:".", d:["waters","void","night","heaven","sea"]
```

### D genesis1 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And God said, Let there be", a:"light", suffix:": and there was light.", d:["day","life","order"]
```

Replace with:

```js
prefix:"And God said, Let there be", a:"light", suffix:": and there was light.", d:["day","life","order","land","water"]
```

### D genesis1 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And God called the light Day, and the darkness he called", a:"Night", suffix:".", d:["Eve","Shadow","Dusk"]
```

Replace with:

```js
prefix:"And God called the light Day, and the darkness he called", a:"Night", suffix:".", d:["Eve","Shadow","Dusk","Morning","Midnight"]
```

### D genesis1 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And God made two great lights; the greater light to rule the day, and the lesser light to rule the", a:"night", suffix:":", d:["heaven","earth","seas"]
```

Replace with:

```js
prefix:"And God made two great lights; the greater light to rule the day, and the lesser light to rule the", a:"night", suffix:":", d:["heaven","earth","seas","land","world"]
```

### D genesis1 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And God created great", a:"whales", suffix:", and every living creature that moveth,", d:["beasts","fishes","serpents"]
```

Replace with:

```js
prefix:"And God created great", a:"whales", suffix:", and every living creature that moveth,", d:["beasts","fishes","serpents","lions","eagles"]
```

### D genesis1 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And God said, Let us make man in our", a:"image", suffix:", after our likeness:", d:["glory","spirit","likeness"]
```

Replace with:

```js
prefix:"And God said, Let us make man in our", a:"image", suffix:", after our likeness:", d:["glory","spirit","likeness","name","hand"]
```

### D genesis1 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"So God created man in his own image, in the image of God created he him; male and female created he", a:"them", suffix:".", d:["him","us","all"]
```

Replace with:

```js
prefix:"So God created man in his own image, in the image of God created he him; male and female created he", a:"them", suffix:".", d:["him","us","all","those","these"]
```

### D genesis1 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And God blessed them, and God said unto them, Be fruitful, and", a:"multiply", suffix:", and replenish the earth,", d:["increase","fill","spread"]
```

Replace with:

```js
prefix:"And God blessed them, and God said unto them, Be fruitful, and", a:"multiply", suffix:", and replenish the earth,", d:["increase","fill","spread","rest","rejoice"]
```

### D genesis1 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And God saw every thing that he had made, and, behold, it was very", a:"good", suffix:".", d:["fair","true","done"]
```

Replace with:

```js
prefix:"And God saw every thing that he had made, and, behold, it was very", a:"good", suffix:".", d:["fair","true","done","great","wicked"]
```

### D genesis12 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father's", a:"house", suffix:",", d:["land","tent","people"]
```

Replace with:

```js
prefix:"Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father's", a:"house", suffix:",", d:["land","tent","people","gods","sons"]
```

### D genesis12 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"unto a land that I will shew", a:"thee", suffix:":", d:["you","him","it"]
```

Replace with:

```js
prefix:"unto a land that I will shew", a:"thee", suffix:":", d:["you","him","it","thyself","them"]
```

### D genesis12 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And I will make of thee a great", a:"nation", suffix:", and I will bless thee,", d:["people","house","kingdom"]
```

Replace with:

```js
prefix:"And I will make of thee a great", a:"nation", suffix:", and I will bless thee,", d:["people","house","kingdom","city","name"]
```

### D genesis12 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and make thy name great; and thou shalt be a", a:"blessing", suffix:":", d:["witness","light","father"]
```

Replace with:

```js
prefix:"and make thy name great; and thou shalt be a", a:"blessing", suffix:":", d:["witness","light","father","curse","gift"]
```

### D genesis12 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And I will bless them that bless thee, and curse him that curseth thee: and in thee shall all families of the earth be", a:"blessed", suffix:".", d:["gathered","saved","named"]
```

Replace with:

```js
prefix:"And I will bless them that bless thee, and curse him that curseth thee: and in thee shall all families of the earth be", a:"blessed", suffix:".", d:["gathered","saved","named","loved","chosen"]
```

### D genesis12 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"So Abram departed, as the LORD had spoken unto him; and Lot went with", a:"him", suffix:":", d:["them","Abram","thee"]
```

Replace with:

```js
prefix:"So Abram departed, as the LORD had spoken unto him; and Lot went with", a:"him", suffix:":", d:["them","Abram","thee","her","it"]
```

### D genesis12 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the LORD appeared unto Abram, and said, Unto thy seed will I give this", a:"land", suffix:":", d:["place","country","earth"]
```

Replace with:

```js
prefix:"And the LORD appeared unto Abram, and said, Unto thy seed will I give this", a:"land", suffix:":", d:["place","country","earth","city","mountain"]
```

### D genesis12 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and there he builded an altar unto the LORD, and called upon the name of the", a:"LORD", suffix:".", d:["Most High","Almighty","God"]
```

Replace with:

```js
prefix:"and there he builded an altar unto the LORD, and called upon the name of the", a:"LORD", suffix:".", d:["Most High","Almighty","God","Father","Shepherd"]
```

### D genesis22 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he said, Take now thy son, thine only son Isaac, whom thou", a:"lovest", suffix:",", d:["knowest","fearest","keepest"]
```

Replace with:

```js
prefix:"And he said, Take now thy son, thine only son Isaac, whom thou", a:"lovest", suffix:",", d:["knowest","fearest","keepest","seest","heardest"]
```

### D genesis22 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and get thee into the land of Moriah; and offer him there for a burnt offering upon one of the", a:"mountains", suffix:"which I will tell thee of.", d:["hills","altars","places"]
```

Replace with:

```js
prefix:"and get thee into the land of Moriah; and offer him there for a burnt offering upon one of the", a:"mountains", suffix:"which I will tell thee of.", d:["hills","altars","places","valleys","rivers"]
```

### D genesis22 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Abraham took the wood of the burnt offering, and laid it upon Isaac his", a:"son", suffix:";", d:["servant","lad","heir"]
```

Replace with:

```js
prefix:"And Abraham took the wood of the burnt offering, and laid it upon Isaac his", a:"son", suffix:";", d:["servant","lad","heir","firstborn","daughter"]
```

### D genesis22 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Isaac spake unto Abraham his father, and said, My father: and he said, Here am I, my son. And he said, Behold the fire and the wood: but where is the lamb for a burnt", a:"offering", suffix:"?", d:["sacrifice","altar","gift"]
```

Replace with:

```js
prefix:"And Isaac spake unto Abraham his father, and said, My father: and he said, Here am I, my son. And he said, Behold the fire and the wood: but where is the lamb for a burnt", a:"offering", suffix:"?", d:["sacrifice","altar","gift","beast","incense"]
```

### D genesis22 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Abraham said, My son, God will provide himself a", a:"lamb", suffix:"for a burnt offering:", d:["ram","kid","bull"]
```

Replace with:

```js
prefix:"And Abraham said, My son, God will provide himself a", a:"lamb", suffix:"for a burnt offering:", d:["ram","kid","bull","goat","sheep"]
```

### D genesis22 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he said, Lay not thine hand upon the lad, neither do thou any thing unto him: for now I know that thou fearest God, seeing thou hast not withheld thy son, thine only", a:"son", suffix:"from me.", d:["child","heir","seed"]
```

Replace with:

```js
prefix:"And he said, Lay not thine hand upon the lad, neither do thou any thing unto him: for now I know that thou fearest God, seeing thou hast not withheld thy son, thine only", a:"son", suffix:"from me.", d:["child","heir","seed","daughter","brother"]
```

### D genesis22 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and Abraham went and took the ram, and offered him up for a burnt offering in the stead of his", a:"son", suffix:".", d:["lad","child","seed"]
```

Replace with:

```js
prefix:"and Abraham went and took the ram, and offered him up for a burnt offering in the stead of his", a:"son", suffix:".", d:["lad","child","seed","servant","brother"]
```

### D genesis22 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Abraham called the name of that place Jehovahjireh: as it is said to this day, In the mount of the LORD it shall be", a:"seen", suffix:".", d:["done","given","known"]
```

Replace with:

```js
prefix:"And Abraham called the name of that place Jehovahjireh: as it is said to this day, In the mount of the LORD it shall be", a:"seen", suffix:".", d:["done","given","known","heard","provided"]
```

### D genesis22 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"That in blessing I will bless thee, and in multiplying I will multiply thy seed as the stars of the", a:"heaven", suffix:",", d:["sky","night","host"]
```

Replace with:

```js
prefix:"That in blessing I will bless thee, and in multiplying I will multiply thy seed as the stars of the", a:"heaven", suffix:",", d:["sky","night","host","sea","earth"]
```

### D genesis22 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And in thy seed shall all the nations of the earth be", a:"blessed", suffix:"; because thou hast obeyed my voice.", d:["gathered","saved","named"]
```

Replace with:

```js
prefix:"And in thy seed shall all the nations of the earth be", a:"blessed", suffix:"; because thou hast obeyed my voice.", d:["gathered","saved","named","cursed","called"]
```

### D exodus20 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt have no other gods before", a:"me", suffix:".", d:["him","us","thee"]
```

Replace with:

```js
prefix:"Thou shalt have no other gods before", a:"me", suffix:".", d:["him","us","thee","them","myself"]
```

### D exodus20 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt not make unto thee any graven", a:"image", suffix:",", d:["idol","likeness","altar"]
```

Replace with:

```js
prefix:"Thou shalt not make unto thee any graven", a:"image", suffix:",", d:["idol","likeness","altar","god","calf"]
```

### D exodus20 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt not take the name of the LORD thy God in", a:"vain", suffix:";", d:["jest","anger","haste"]
```

Replace with:

```js
prefix:"Thou shalt not take the name of the LORD thy God in", a:"vain", suffix:";", d:["jest","anger","haste","pride","sin"]
```

### D exodus20 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Remember the sabbath day, to keep it", a:"holy", suffix:".", d:["clean","set","apart"]
```

Replace with:

```js
prefix:"Remember the sabbath day, to keep it", a:"holy", suffix:".", d:["clean","set","apart","secret","quiet"]
```

### D exodus20 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Honour thy father and thy", a:"mother", suffix:": that thy days may be long upon the land which the LORD thy God giveth thee.", d:["house","kin","elders"]
```

Replace with:

```js
prefix:"Honour thy father and thy", a:"mother", suffix:": that thy days may be long upon the land which the LORD thy God giveth thee.", d:["house","kin","elders","brother","sister"]
```

### D exodus20 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt not", a:"kill", suffix:".", d:["steal","swear","covet"]
```

Replace with:

```js
prefix:"Thou shalt not", a:"kill", suffix:".", d:["steal","swear","covet","lie","forsake"]
```

### D exodus20 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt not commit", a:"adultery", suffix:".", d:["murder","idolatry","theft"]
```

Replace with:

```js
prefix:"Thou shalt not commit", a:"adultery", suffix:".", d:["murder","idolatry","theft","covetousness","treason"]
```

### D exodus20 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt not", a:"steal", suffix:".", d:["kill","lie","covet"]
```

Replace with:

```js
prefix:"Thou shalt not", a:"steal", suffix:".", d:["kill","lie","covet","swear","forsake"]
```

### D exodus20 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt not bear false witness against thy", a:"neighbour", suffix:".", d:["brother","friend","people"]
```

Replace with:

```js
prefix:"Thou shalt not bear false witness against thy", a:"neighbour", suffix:".", d:["brother","friend","people","enemy","stranger"]
```

### D exodus20 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thou shalt not", a:"covet", suffix:"thy neighbour's house,", d:["take","touch","keep"]
```

Replace with:

```js
prefix:"Thou shalt not", a:"covet", suffix:"thy neighbour's house,", d:["take","touch","keep","build","sell"]
```

### D deuteronomy6 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Hear, O Israel: The LORD our God is one", a:"LORD", suffix:":", d:["God","King","Name"]
```

Replace with:

```js
prefix:"Hear, O Israel: The LORD our God is one", a:"LORD", suffix:":", d:["God","King","Name","Father","Judge"]
```

### D deuteronomy6 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy", a:"might", suffix:".", d:["mind","strength","spirit"]
```

Replace with:

```js
prefix:"And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy", a:"might", suffix:".", d:["mind","strength","spirit","body","will"]
```

### D deuteronomy6 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And these words, which I command thee this day, shall be in thine", a:"heart", suffix:":", d:["mouth","house","hand"]
```

Replace with:

```js
prefix:"And these words, which I command thee this day, shall be in thine", a:"heart", suffix:":", d:["mouth","house","hand","eyes","bosom"]
```

### D deuteronomy6 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And thou shalt teach them diligently unto thy", a:"children", suffix:",", d:["sons","people","house"]
```

Replace with:

```js
prefix:"And thou shalt teach them diligently unto thy", a:"children", suffix:",", d:["sons","people","house","servants","brethren"]
```

### D deuteronomy6 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and shalt talk of them when thou sittest in thine house, and when thou walkest by the way, and when thou liest down, and when thou risest", a:"up", suffix:".", d:["again","early","forth"]
```

Replace with:

```js
prefix:"and shalt talk of them when thou sittest in thine house, and when thou walkest by the way, and when thou liest down, and when thou risest", a:"up", suffix:".", d:["again","early","forth","awake","out"]
```

### D deuteronomy6 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And thou shalt bind them for a sign upon thine", a:"hand", suffix:",", d:["arm","brow","door"]
```

Replace with:

```js
prefix:"And thou shalt bind them for a sign upon thine", a:"hand", suffix:",", d:["arm","brow","door","foot","heart"]
```

### D deuteronomy6 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And thou shalt write them upon the posts of thy house, and on thy", a:"gates", suffix:".", d:["doors","walls","lintel"]
```

Replace with:

```js
prefix:"And thou shalt write them upon the posts of thy house, and on thy", a:"gates", suffix:".", d:["doors","walls","lintel","tables","hearts"]
```

### D deuteronomy6 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Then beware lest thou forget the LORD, which brought thee forth out of the land of", a:"Egypt", suffix:", from the house of bondage.", d:["Canaan","Horeb","Goshen"]
```

Replace with:

```js
prefix:"Then beware lest thou forget the LORD, which brought thee forth out of the land of", a:"Egypt", suffix:", from the house of bondage.", d:["Canaan","Horeb","Goshen","Babylon","Assyria"]
```

### D joshua1 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Moses my servant is dead; now therefore arise, go over this Jordan, thou, and all this people, unto the land which I do give to them, even to the children of", a:"Israel", suffix:".", d:["Abraham","Jacob","Judah"]
```

Replace with:

```js
prefix:"Moses my servant is dead; now therefore arise, go over this Jordan, thou, and all this people, unto the land which I do give to them, even to the children of", a:"Israel", suffix:".", d:["Abraham","Jacob","Judah","Esau","Levi"]
```

### D joshua1 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"There shall not any man be able to stand before thee all the days of thy life: as I was with Moses, so I will be with", a:"thee", suffix:":", d:["you","him","us"]
```

Replace with:

```js
prefix:"There shall not any man be able to stand before thee all the days of thy life: as I was with Moses, so I will be with", a:"thee", suffix:":", d:["you","him","us","them","thyself"]
```

### D joshua1 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I will not fail thee, nor", a:"forsake", suffix:"thee.", d:["leave","forget","fear"]
```

Replace with:

```js
prefix:"I will not fail thee, nor", a:"forsake", suffix:"thee.", d:["leave","forget","fear","hate","praise"]
```

### D joshua1 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Be strong and of a good", a:"courage", suffix:":", d:["heart","faith","hope"]
```

Replace with:

```js
prefix:"Be strong and of a good", a:"courage", suffix:":", d:["heart","faith","hope","conscience","report"]
```

### D joshua1 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"This book of the law shall not depart out of thy", a:"mouth", suffix:";", d:["hand","heart","sight"]
```

Replace with:

```js
prefix:"This book of the law shall not depart out of thy", a:"mouth", suffix:";", d:["hand","heart","sight","house","land"]
```

### D joshua1 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"but thou shalt meditate therein day and", a:"night", suffix:",", d:["evening","dawn","always"]
```

Replace with:

```js
prefix:"but thou shalt meditate therein day and", a:"night", suffix:",", d:["evening","dawn","always","morning","year"]
```

### D joshua1 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou", a:"dismayed", suffix:":", d:["troubled","weak","moved"]
```

Replace with:

```js
prefix:"Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou", a:"dismayed", suffix:":", d:["troubled","weak","moved","proud","wise"]
```

### D joshua1 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"for the LORD thy God is with thee whithersoever thou", a:"goest", suffix:".", d:["walkest","turnest","dwellest"]
```

Replace with:

```js
prefix:"for the LORD thy God is with thee whithersoever thou", a:"goest", suffix:".", d:["walkest","turnest","dwellest","sittest","sleepest"]
```

### D psalm51 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my", a:"transgressions", suffix:".", d:["iniquities","sins","offences"]
```

Replace with:

```js
prefix:"Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my", a:"transgressions", suffix:".", d:["iniquities","sins","offences","sorrows","tears"]
```

### D psalm51 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Wash me throughly from mine iniquity, and cleanse me from my", a:"sin", suffix:".", d:["guilt","stain","shame"]
```

Replace with:

```js
prefix:"Wash me throughly from mine iniquity, and cleanse me from my", a:"sin", suffix:".", d:["guilt","stain","shame","pride","fear"]
```

### D psalm51 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Purge me with hyssop, and I shall be clean: wash me, and I shall be whiter than", a:"snow", suffix:".", d:["wool","light","linen"]
```

Replace with:

```js
prefix:"Purge me with hyssop, and I shall be clean: wash me, and I shall be whiter than", a:"snow", suffix:".", d:["wool","light","linen","milk","gold"]
```

### D psalm51 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Create in me a clean heart, O God; and renew a right spirit within", a:"me", suffix:".", d:["us","thee","him"]
```

Replace with:

```js
prefix:"Create in me a clean heart, O God; and renew a right spirit within", a:"me", suffix:".", d:["us","thee","him","it","them"]
```

### D psalm51 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Cast me not away from thy presence; and take not thy holy spirit from", a:"me", suffix:".", d:["us","thee","him"]
```

Replace with:

```js
prefix:"Cast me not away from thy presence; and take not thy holy spirit from", a:"me", suffix:".", d:["us","thee","him","it","them"]
```

### D psalm51 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Restore unto me the joy of thy", a:"salvation", suffix:";", d:["mercy","presence","truth"]
```

Replace with:

```js
prefix:"Restore unto me the joy of thy", a:"salvation", suffix:";", d:["mercy","presence","truth","strength","glory"]
```

### D psalm51 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and uphold me with thy free", a:"spirit", suffix:".", d:["hand","grace","word"]
```

Replace with:

```js
prefix:"and uphold me with thy free", a:"spirit", suffix:".", d:["hand","grace","word","gift","will"]
```

### D psalm51 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Then will I teach transgressors thy ways; and sinners shall be converted unto", a:"thee", suffix:".", d:["God","truth","life"]
```

Replace with:

```js
prefix:"Then will I teach transgressors thy ways; and sinners shall be converted unto", a:"thee", suffix:".", d:["God","truth","life","you","him"]
```

### D psalm51 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The sacrifices of God are a broken", a:"spirit", suffix:":", d:["heart","will","pride"]
```

Replace with:

```js
prefix:"The sacrifices of God are a broken", a:"spirit", suffix:":", d:["heart","will","pride","offering","vessel"]
```

### D psalm51 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"a broken and a contrite heart, O God, thou wilt not", a:"despise", suffix:".", d:["refuse","forget","break"]
```

Replace with:

```js
prefix:"a broken and a contrite heart, O God, thou wilt not", a:"despise", suffix:".", d:["refuse","forget","break","accept","forsake"]
```

### D proverbs3 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Trust in the LORD with all thine", a:"heart", suffix:";", d:["soul","mind","might"]
```

Replace with:

```js
prefix:"Trust in the LORD with all thine", a:"heart", suffix:";", d:["soul","mind","might","hand","eyes"]
```

### D proverbs3 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and lean not unto thine own", a:"understanding", suffix:".", d:["wisdom","strength","counsel"]
```

Replace with:

```js
prefix:"and lean not unto thine own", a:"understanding", suffix:".", d:["wisdom","strength","counsel","hand","sight"]
```

### D proverbs3 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"In all thy ways acknowledge him, and he shall direct thy", a:"paths", suffix:".", d:["steps","ways","feet"]
```

Replace with:

```js
prefix:"In all thy ways acknowledge him, and he shall direct thy", a:"paths", suffix:".", d:["steps","ways","feet","thoughts","hearts"]
```

### D proverbs3 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Be not wise in thine own eyes: fear the LORD, and depart from", a:"evil", suffix:".", d:["sin","pride","folly"]
```

Replace with:

```js
prefix:"Be not wise in thine own eyes: fear the LORD, and depart from", a:"evil", suffix:".", d:["sin","pride","folly","idols","anger"]
```

### D proverbs3 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Honour the LORD with thy substance, and with the firstfruits of all thine", a:"increase", suffix:":", d:["labour","field","house"]
```

Replace with:

```js
prefix:"Honour the LORD with thy substance, and with the firstfruits of all thine", a:"increase", suffix:":", d:["labour","field","house","garden","treasure"]
```

### D proverbs3 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"My son, despise not the chastening of the LORD; neither be weary of his", a:"correction", suffix:":", d:["rebuke","rod","law"]
```

Replace with:

```js
prefix:"My son, despise not the chastening of the LORD; neither be weary of his", a:"correction", suffix:":", d:["rebuke","rod","law","love","favour"]
```

### D proverbs3 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Happy is the man that findeth", a:"wisdom", suffix:", and the man that getteth understanding.", d:["knowledge","riches","honour"]
```

Replace with:

```js
prefix:"Happy is the man that findeth", a:"wisdom", suffix:", and the man that getteth understanding.", d:["knowledge","riches","honour","gold","peace"]
```

### D proverbs3 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Withhold not good from them to whom it is due, when it is in the power of thine hand to do", a:"it", suffix:".", d:["so","this","good"]
```

Replace with:

```js
prefix:"Withhold not good from them to whom it is due, when it is in the power of thine hand to do", a:"it", suffix:".", d:["so","this","good","that","him"]
```

### D isaiah53 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He is despised and rejected of men; a man of sorrows, and acquainted with", a:"grief", suffix:":", d:["pain","shame","death"]
```

Replace with:

```js
prefix:"He is despised and rejected of men; a man of sorrows, and acquainted with", a:"grief", suffix:":", d:["pain","shame","death","joy","sin"]
```

### D isaiah53 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Surely he hath borne our griefs, and carried our", a:"sorrows", suffix:":", d:["sins","pains","burdens"]
```

Replace with:

```js
prefix:"Surely he hath borne our griefs, and carried our", a:"sorrows", suffix:":", d:["sins","pains","burdens","tears","treasures"]
```

### D isaiah53 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But he was wounded for our transgressions, he was bruised for our", a:"iniquities", suffix:":", d:["sins","offences","guilts"]
```

Replace with:

```js
prefix:"But he was wounded for our transgressions, he was bruised for our", a:"iniquities", suffix:":", d:["sins","offences","guilts","griefs","weakness"]
```

### D isaiah53 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"the chastisement of our peace was upon him; and with his stripes we are", a:"healed", suffix:".", d:["saved","cleansed","kept"]
```

Replace with:

```js
prefix:"the chastisement of our peace was upon him; and with his stripes we are", a:"healed", suffix:".", d:["saved","cleansed","kept","lost","wounded"]
```

### D isaiah53 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"All we like sheep have gone", a:"astray", suffix:";", d:["away","aside","forth"]
```

Replace with:

```js
prefix:"All we like sheep have gone", a:"astray", suffix:";", d:["away","aside","forth","back","abroad"]
```

### D isaiah53 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"we have turned every one to his own way; and the LORD hath laid on him the iniquity of us", a:"all", suffix:".", d:["both","now","then"]
```

Replace with:

```js
prefix:"we have turned every one to his own way; and the LORD hath laid on him the iniquity of us", a:"all", suffix:".", d:["both","now","then","many","some"]
```

### D isaiah53 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He was oppressed, and he was afflicted, yet he opened not his", a:"mouth", suffix:":", d:["lips","voice","hand"]
```

Replace with:

```js
prefix:"He was oppressed, and he was afflicted, yet he opened not his", a:"mouth", suffix:":", d:["lips","voice","hand","heart","eyes"]
```

### D isaiah53 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"he is brought as a lamb to the", a:"slaughter", suffix:",", d:["altar","shearer","cross"]
```

Replace with:

```js
prefix:"he is brought as a lamb to the", a:"slaughter", suffix:",", d:["altar","shearer","cross","sheepfold","pasture"]
```

### D isaiah53 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he made his grave with the wicked, and with the rich in his", a:"death", suffix:";", d:["tomb","sleep","end"]
```

Replace with:

```js
prefix:"And he made his grave with the wicked, and with the rich in his", a:"death", suffix:";", d:["tomb","sleep","end","pit","house"]
```

### D isaiah53 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"because he hath poured out his soul unto death: and he was numbered with the", a:"transgressors", suffix:";", d:["wicked","sinners","thieves"]
```

Replace with:

```js
prefix:"because he hath poured out his soul unto death: and he was numbered with the", a:"transgressors", suffix:";", d:["wicked","sinners","thieves","prophets","saints"]
```

### D daniel6 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Now when Daniel knew that the writing was signed, he went into his house; and his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed, and gave thanks before his", a:"God", suffix:",", d:["King","Lord","Father"]
```

Replace with:

```js
prefix:"Now when Daniel knew that the writing was signed, he went into his house; and his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed, and gave thanks before his", a:"God", suffix:",", d:["King","Lord","Father","Judge","Shepherd"]
```

### D daniel6 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Then the king commanded, and they brought Daniel, and cast him into the den of", a:"lions", suffix:".", d:["beasts","fire","stone"]
```

Replace with:

```js
prefix:"Then the king commanded, and they brought Daniel, and cast him into the den of", a:"lions", suffix:".", d:["beasts","fire","stone","wolves","ravens"]
```

### D daniel6 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And when he came to the den, he cried with a lamentable voice unto Daniel: and the king spake and said to Daniel, O Daniel, servant of the living God, is thy God, whom thou servest continually, able to deliver thee from the", a:"lions", suffix:"?", d:["pit","king","law"]
```

Replace with:

```js
prefix:"And when he came to the den, he cried with a lamentable voice unto Daniel: and the king spake and said to Daniel, O Daniel, servant of the living God, is thy God, whom thou servest continually, able to deliver thee from the", a:"lions", suffix:"?", d:["pit","king","law","wolves","fire"]
```

### D daniel6 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"My God hath sent his angel, and hath shut the lions'", a:"mouths", suffix:",", d:["jaws","teeth","roar"]
```

Replace with:

```js
prefix:"My God hath sent his angel, and hath shut the lions'", a:"mouths", suffix:",", d:["jaws","teeth","roar","eyes","gates"]
```

### D daniel6 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"that they have not hurt me: forasmuch as before him innocency was found in me; and also before thee, O king, have I done no", a:"hurt", suffix:".", d:["wrong","harm","ill"]
```

Replace with:

```js
prefix:"that they have not hurt me: forasmuch as before him innocency was found in me; and also before thee, O king, have I done no", a:"hurt", suffix:".", d:["wrong","harm","ill","good","service"]
```

### D daniel6 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"So Daniel was taken up out of the den, and no manner of hurt was found upon him, because he believed in his", a:"God", suffix:".", d:["King","word","angel"]
```

Replace with:

```js
prefix:"So Daniel was taken up out of the den, and no manner of hurt was found upon him, because he believed in his", a:"God", suffix:".", d:["King","word","angel","Father","Judge"]
```

### D daniel6 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I make a decree, That in every dominion of my kingdom men tremble and fear before the God of Daniel: for he is the living God, and stedfast for", a:"ever", suffix:",", d:["aye","always","ages"]
```

Replace with:

```js
prefix:"I make a decree, That in every dominion of my kingdom men tremble and fear before the God of Daniel: for he is the living God, and stedfast for", a:"ever", suffix:",", d:["aye","always","ages","now","once"]
```

### D daniel6 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He delivereth and rescueth, and he worketh signs and wonders in heaven and in", a:"earth", suffix:",", d:["land","world","deep"]
```

Replace with:

```js
prefix:"He delivereth and rescueth, and he worketh signs and wonders in heaven and in", a:"earth", suffix:",", d:["land","world","deep","sea","hell"]
```

### D luke2 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a", a:"manger", suffix:";", d:["crib","bed","stall"]
```

Replace with:

```js
prefix:"And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a", a:"manger", suffix:";", d:["crib","bed","stall","field","tent"]
```

### D luke2 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the angel said unto them, Fear not: for, behold, I bring you good tidings of great", a:"joy", suffix:",", d:["peace","hope","glory"]
```

Replace with:

```js
prefix:"And the angel said unto them, Fear not: for, behold, I bring you good tidings of great", a:"joy", suffix:",", d:["peace","hope","glory","sorrow","light"]
```

### D luke2 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For unto you is born this day in the city of David a", a:"Saviour", suffix:", which is Christ the Lord.", d:["King","Prophet","Son"]
```

Replace with:

```js
prefix:"For unto you is born this day in the city of David a", a:"Saviour", suffix:", which is Christ the Lord.", d:["King","Prophet","Son","Shepherd","Stranger"]
```

### D luke2 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And this shall be a sign unto you; Ye shall find the babe wrapped in swaddling clothes, lying in a", a:"manger", suffix:".", d:["crib","bed","house"]
```

Replace with:

```js
prefix:"And this shall be a sign unto you; Ye shall find the babe wrapped in swaddling clothes, lying in a", a:"manger", suffix:".", d:["crib","bed","house","field","tent"]
```

### D luke2 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Glory to God in the highest, and on earth peace, good will toward", a:"men", suffix:".", d:["us","all","Israel"]
```

Replace with:

```js
prefix:"Glory to God in the highest, and on earth peace, good will toward", a:"men", suffix:".", d:["us","all","Israel","saints","kings"]
```

### D luke2 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Lord, now lettest thou thy servant depart in", a:"peace", suffix:", according to thy word:", d:["joy","rest","hope"]
```

Replace with:

```js
prefix:"Lord, now lettest thou thy servant depart in", a:"peace", suffix:", according to thy word:", d:["joy","rest","hope","death","glory"]
```

### D luke2 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For mine eyes have seen thy", a:"salvation", suffix:",", d:["glory","Christ","mercy"]
```

Replace with:

```js
prefix:"For mine eyes have seen thy", a:"salvation", suffix:",", d:["glory","Christ","mercy","power","wrath"]
```

### D luke2 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"A light to lighten the Gentiles, and the glory of thy people", a:"Israel", suffix:".", d:["Judah","Jacob","Zion"]
```

Replace with:

```js
prefix:"A light to lighten the Gentiles, and the glory of thy people", a:"Israel", suffix:".", d:["Judah","Jacob","Zion","Abraham","Moses"]
```

### D luke2 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the child grew, and waxed strong in spirit, filled with wisdom: and the grace of God was upon", a:"him", suffix:".", d:["them","us","it"]
```

Replace with:

```js
prefix:"And the child grew, and waxed strong in spirit, filled with wisdom: and the grace of God was upon", a:"him", suffix:".", d:["them","us","it","her","thee"]
```

### D luke2 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Jesus increased in wisdom and stature, and in favour with God and", a:"man", suffix:".", d:["men","Israel","heaven"]
```

Replace with:

```js
prefix:"And Jesus increased in wisdom and stature, and in favour with God and", a:"man", suffix:".", d:["men","Israel","heaven","angels","saints"]
```

### D john3 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of", a:"God", suffix:".", d:["heaven","man","light"]
```

Replace with:

```js
prefix:"Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of", a:"God", suffix:".", d:["heaven","man","light","Adam","David"]
```

### D john3 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of", a:"God", suffix:".", d:["heaven","man","life"]
```

Replace with:

```js
prefix:"Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of", a:"God", suffix:".", d:["heaven","man","life","Israel","David"]
```

### D john3 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Marvel not that I said unto thee, Ye must be born", a:"again", suffix:".", d:["anew","of God","from above"]
```

Replace with:

```js
prefix:"Marvel not that I said unto thee, Ye must be born", a:"again", suffix:".", d:["anew","of God","from above","twice","alone"]
```

### D john3 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the", a:"Spirit", suffix:".", d:["water","word","light"]
```

Replace with:

```js
prefix:"The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the", a:"Spirit", suffix:".", d:["water","word","light","flesh","blood"]
```

### D john3 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted", a:"up", suffix:":", d:["high","forth","again"]
```

Replace with:

```js
prefix:"And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted", a:"up", suffix:":", d:["high","forth","again","down","out"]
```

### D john3 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For God so loved the world, that he gave his only begotten", a:"Son", suffix:",", d:["Child","Word","Lamb"]
```

Replace with:

```js
prefix:"For God so loved the world, that he gave his only begotten", a:"Son", suffix:",", d:["Child","Word","Lamb","Spirit","Prophet"]
```

### D john3 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"that whosoever believeth in him should not perish, but have everlasting", a:"life", suffix:".", d:["hope","peace","joy"]
```

Replace with:

```js
prefix:"that whosoever believeth in him should not perish, but have everlasting", a:"life", suffix:".", d:["hope","peace","joy","glory","rest"]
```

### D john3 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For God sent not his Son into the world to condemn the world; but that the world through him might be", a:"saved", suffix:".", d:["healed","kept","known"]
```

Replace with:

```js
prefix:"For God sent not his Son into the world to condemn the world; but that the world through him might be", a:"saved", suffix:".", d:["healed","kept","known","judged","warned"]
```

### D matthew5 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Blessed are the poor in spirit: for theirs is the kingdom of", a:"heaven", suffix:".", d:["God","life","peace"]
```

Replace with:

```js
prefix:"Blessed are the poor in spirit: for theirs is the kingdom of", a:"heaven", suffix:".", d:["God","life","peace","earth","glory"]
```

### D matthew5 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Blessed are they that mourn: for they shall be", a:"comforted", suffix:".", d:["healed","kept","lifted"]
```

Replace with:

```js
prefix:"Blessed are they that mourn: for they shall be", a:"comforted", suffix:".", d:["healed","kept","lifted","saved","heard"]
```

### D matthew5 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Blessed are the meek: for they shall inherit the", a:"earth", suffix:".", d:["land","kingdom","world"]
```

Replace with:

```js
prefix:"Blessed are the meek: for they shall inherit the", a:"earth", suffix:".", d:["land","kingdom","world","heaven","throne"]
```

### D matthew5 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Blessed are they which do hunger and thirst after righteousness: for they shall be", a:"filled", suffix:".", d:["fed","kept","blessed"]
```

Replace with:

```js
prefix:"Blessed are they which do hunger and thirst after righteousness: for they shall be", a:"filled", suffix:".", d:["fed","kept","blessed","troubled","scattered"]
```

### D matthew5 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Blessed are the pure in heart: for they shall see", a:"God", suffix:".", d:["Christ","heaven","light"]
```

Replace with:

```js
prefix:"Blessed are the pure in heart: for they shall see", a:"God", suffix:".", d:["Christ","heaven","light","serve","fear"]
```

### D matthew5 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Blessed are the peacemakers: for they shall be called the children of", a:"God", suffix:".", d:["peace","heaven","light"]
```

Replace with:

```js
prefix:"Blessed are the peacemakers: for they shall be called the children of", a:"God", suffix:".", d:["peace","heaven","light","Israel","Abraham"]
```

### D matthew5 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Ye are the light of the", a:"world", suffix:".", d:["earth","house","city"]
```

Replace with:

```js
prefix:"Ye are the light of the", a:"world", suffix:".", d:["earth","house","city","sea","nation"]
```

### D matthew5 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Let your light so shine before men, that they may see your good works, and glorify your Father which is in", a:"heaven", suffix:".", d:["glory","secret","truth"]
```

Replace with:

```js
prefix:"Let your light so shine before men, that they may see your good works, and glorify your Father which is in", a:"heaven", suffix:".", d:["glory","secret","truth","earth","hell"]
```

### D matthew5 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Think not that I am come to destroy the law, or the prophets: I am not come to destroy, but to", a:"fulfil", suffix:".", d:["keep","teach","finish"]
```

Replace with:

```js
prefix:"Think not that I am come to destroy the law, or the prophets: I am not come to destroy, but to", a:"fulfil", suffix:".", d:["keep","teach","finish","build","sin"]
```

### D matthew5 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But I say unto you, Love your enemies, bless them that curse you, do good to them that hate you, and pray for them which despitefully use you, and persecute", a:"you", suffix:";", d:["thee","us","them"]
```

Replace with:

```js
prefix:"But I say unto you, Love your enemies, bless them that curse you, do good to them that hate you, and pray for them which despitefully use you, and persecute", a:"you", suffix:";", d:["thee","us","them","me","him"]
```

### D john14 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Let not your heart be", a:"troubled", suffix:": ye believe in God, believe also in me.", d:["afraid","weary","moved"]
```

Replace with:

```js
prefix:"Let not your heart be", a:"troubled", suffix:": ye believe in God, believe also in me.", d:["afraid","weary","moved","broken","lost"]
```

### D john14 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"In my Father's house are many", a:"mansions", suffix:":", d:["rooms","places","thrones"]
```

Replace with:

```js
prefix:"In my Father's house are many", a:"mansions", suffix:":", d:["rooms","places","thrones","sons","servants"]
```

### D john14 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be", a:"also", suffix:".", d:["too","then","now"]
```

Replace with:

```js
prefix:"And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be", a:"also", suffix:".", d:["too","then","now","here","once"]
```

### D john14 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Jesus saith unto him, I am the way, the truth, and the", a:"life", suffix:":", d:["light","word","door"]
```

Replace with:

```js
prefix:"Jesus saith unto him, I am the way, the truth, and the", a:"life", suffix:":", d:["light","word","door","bread","vine"]
```

### D john14 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"no man cometh unto the Father, but by", a:"me", suffix:".", d:["him","us","thee"]
```

Replace with:

```js
prefix:"no man cometh unto the Father, but by", a:"me", suffix:".", d:["him","us","thee","it","them"]
```

### D john14 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"he that hath seen me hath seen the", a:"Father", suffix:";", d:["Son","Lord","Spirit"]
```

Replace with:

```js
prefix:"he that hath seen me hath seen the", a:"Father", suffix:";", d:["Son","Lord","Spirit","Word","Prophet"]
```

### D john14 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"If ye love me, keep my", a:"commandments", suffix:".", d:["words","sayings","law"]
```

Replace with:

```js
prefix:"If ye love me, keep my", a:"commandments", suffix:".", d:["words","sayings","law","ways","servants"]
```

### D john14 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And I will pray the Father, and he shall give you another", a:"Comforter", suffix:",", d:["Helper","Spirit","Advocate"]
```

Replace with:

```js
prefix:"And I will pray the Father, and he shall give you another", a:"Comforter", suffix:",", d:["Helper","Spirit","Advocate","Shepherd","Adversary"]
```

### D john14 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be", a:"afraid", suffix:".", d:["moved","weary","cast"]
```

Replace with:

```js
prefix:"Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be", a:"afraid", suffix:".", d:["moved","weary","cast","glad","hidden"]
```

### D john14 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Peace I leave with you, my peace I give unto", a:"you", suffix:":", d:["thee","us","them"]
```

Replace with:

```js
prefix:"Peace I leave with you, my peace I give unto", a:"you", suffix:":", d:["thee","us","them","me","him"]
```

### D matthew28 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the angel answered and said unto the women, Fear not ye: for I know that ye seek Jesus, which was", a:"crucified", suffix:".", d:["buried","slain","taken"]
```

Replace with:

```js
prefix:"And the angel answered and said unto the women, Fear not ye: for I know that ye seek Jesus, which was", a:"crucified", suffix:".", d:["buried","slain","taken","stoned","rejected"]
```

### D matthew28 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He is not here: for he is risen, as he", a:"said", suffix:".", d:["spake","promised","told"]
```

Replace with:

```js
prefix:"He is not here: for he is risen, as he", a:"said", suffix:".", d:["spake","promised","told","commanded","wept"]
```

### D matthew28 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Come, see the place where the Lord", a:"lay", suffix:".", d:["slept","rested","was"]
```

Replace with:

```js
prefix:"Come, see the place where the Lord", a:"lay", suffix:".", d:["slept","rested","was","stood","sat"]
```

### D matthew28 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Jesus came and spake unto them, saying, All power is given unto me in heaven and in", a:"earth", suffix:".", d:["hell","glory","the world"]
```

Replace with:

```js
prefix:"And Jesus came and spake unto them, saying, All power is given unto me in heaven and in", a:"earth", suffix:".", d:["hell","glory","the world","sea","dust"]
```

### D matthew28 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy", a:"Ghost", suffix:":", d:["Spirit","One","Name"]
```

Replace with:

```js
prefix:"Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy", a:"Ghost", suffix:":", d:["Spirit","One","Name","Word","Light"]
```

### D matthew28 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the", a:"world", suffix:".", d:["age","earth","day"]
```

Replace with:

```js
prefix:"Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the", a:"world", suffix:".", d:["age","earth","day","land","city"]
```

### D matthew28 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And as they went to tell his disciples, behold, Jesus met them, saying,", a:"All hail", suffix:".", d:["Peace","Fear not","Follow me"]
```

Replace with:

```js
prefix:"And as they went to tell his disciples, behold, Jesus met them, saying,", a:"All hail", suffix:".", d:["Peace","Fear not","Follow me","Good tidings","Go forth"]
```

### D matthew28 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And when they saw him, they worshipped him: but some", a:"doubted", suffix:".", d:["feared","wondered","fled"]
```

Replace with:

```js
prefix:"And when they saw him, they worshipped him: but some", a:"doubted", suffix:".", d:["feared","wondered","fled","believed","rejoiced"]
```

### D acts2 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And when the day of Pentecost was fully come, they were all with one accord in one", a:"place", suffix:".", d:["house","mind","spirit"]
```

Replace with:

```js
prefix:"And when the day of Pentecost was fully come, they were all with one accord in one", a:"place", suffix:".", d:["house","mind","spirit","city","temple"]
```

### D acts2 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And suddenly there came a sound from heaven as of a rushing mighty", a:"wind", suffix:",", d:["fire","voice","cloud"]
```

Replace with:

```js
prefix:"And suddenly there came a sound from heaven as of a rushing mighty", a:"wind", suffix:",", d:["fire","voice","cloud","stream","river"]
```

### D acts2 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And there appeared unto them cloven tongues like as of", a:"fire", suffix:",", d:["flame","light","gold"]
```

Replace with:

```js
prefix:"And there appeared unto them cloven tongues like as of", a:"fire", suffix:",", d:["flame","light","gold","water","brass"]
```

### D acts2 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And they were all filled with the Holy Ghost, and began to speak with other tongues, as the Spirit gave them", a:"utterance", suffix:".", d:["speech","words","power"]
```

Replace with:

```js
prefix:"And they were all filled with the Holy Ghost, and began to speak with other tongues, as the Spirit gave them", a:"utterance", suffix:".", d:["speech","words","power","strength","courage"]
```

### D acts2 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And it shall come to pass, that whosoever shall call on the name of the Lord shall be", a:"saved", suffix:".", d:["healed","kept","blessed"]
```

Replace with:

```js
prefix:"And it shall come to pass, that whosoever shall call on the name of the Lord shall be", a:"saved", suffix:".", d:["healed","kept","blessed","lost","glad"]
```

### D acts2 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Whom God hath raised up, having loosed the pains of death: because it was not possible that he should be holden of", a:"it", suffix:".", d:["them","death","hell"]
```

Replace with:

```js
prefix:"Whom God hath raised up, having loosed the pains of death: because it was not possible that he should be holden of", a:"it", suffix:".", d:["them","death","hell","him","her"]
```

### D acts2 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"This Jesus hath God raised up, whereof we all are", a:"witnesses", suffix:".", d:["disciples","apostles","servants"]
```

Replace with:

```js
prefix:"This Jesus hath God raised up, whereof we all are", a:"witnesses", suffix:".", d:["disciples","apostles","servants","prophets","debtors"]
```

### D acts2 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Therefore let all the house of Israel know assuredly, that God hath made that same Jesus, whom ye have crucified, both Lord and", a:"Christ", suffix:".", d:["King","Saviour","Son"]
```

Replace with:

```js
prefix:"Therefore let all the house of Israel know assuredly, that God hath made that same Jesus, whom ye have crucified, both Lord and", a:"Christ", suffix:".", d:["King","Saviour","Son","Judge","Father"]
```

### D acts2 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of", a:"sins", suffix:",", d:["guilt","debts","offences"]
```

Replace with:

```js
prefix:"Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of", a:"sins", suffix:",", d:["guilt","debts","offences","pains","wages"]
```

### D acts2 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And they continued stedfastly in the apostles' doctrine and fellowship, and in breaking of bread, and in", a:"prayers", suffix:".", d:["psalms","alms","fasts"]
```

Replace with:

```js
prefix:"And they continued stedfastly in the apostles' doctrine and fellowship, and in breaking of bread, and in", a:"prayers", suffix:".", d:["psalms","alms","fasts","labours","fasting"]
```

### D ephesians2 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And you hath he quickened, who were dead in trespasses and", a:"sins", suffix:";", d:["debts","works","flesh"]
```

Replace with:

```js
prefix:"And you hath he quickened, who were dead in trespasses and", a:"sins", suffix:";", d:["debts","works","flesh","tears","cares"]
```

### D ephesians2 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But God, who is rich in mercy, for his great love wherewith he loved", a:"us", suffix:",", d:["you","them","me"]
```

Replace with:

```js
prefix:"But God, who is rich in mercy, for his great love wherewith he loved", a:"us", suffix:",", d:["you","them","me","him","it"]
```

### D ephesians2 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Even when we were dead in sins, hath quickened us together with Christ, (by grace ye are", a:"saved", suffix:";)", d:["kept","healed","called"]
```

Replace with:

```js
prefix:"Even when we were dead in sins, hath quickened us together with Christ, (by grace ye are", a:"saved", suffix:";)", d:["kept","healed","called","blessed","chosen"]
```

### D ephesians2 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For by grace are ye saved through", a:"faith", suffix:";", d:["works","hope","love"]
```

Replace with:

```js
prefix:"For by grace are ye saved through", a:"faith", suffix:";", d:["works","hope","love","prayer","baptism"]
```

### D ephesians2 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and that not of yourselves: it is the gift of", a:"God", suffix:":", d:["Christ","grace","heaven"]
```

Replace with:

```js
prefix:"and that not of yourselves: it is the gift of", a:"God", suffix:":", d:["Christ","grace","heaven","Moses","Abraham"]
```

### D ephesians2 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Not of works, lest any man should", a:"boast", suffix:".", d:["glory","trust","rise"]
```

Replace with:

```js
prefix:"Not of works, lest any man should", a:"boast", suffix:".", d:["glory","trust","rise","fear","pray"]
```

### D ephesians2 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For we are his workmanship, created in Christ Jesus unto good", a:"works", suffix:",", d:["fruit","deeds","paths"]
```

Replace with:

```js
prefix:"For we are his workmanship, created in Christ Jesus unto good", a:"works", suffix:",", d:["fruit","deeds","paths","gifts","ends"]
```

### D ephesians2 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For he is our peace, who hath made both one, and hath broken down the middle wall of", a:"partition", suffix:"between us;", d:["hatred","stone","law"]
```

Replace with:

```js
prefix:"For he is our peace, who hath made both one, and hath broken down the middle wall of", a:"partition", suffix:"between us;", d:["hatred","stone","law","gate","hedge"]
```

### D corinthians13 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling", a:"cymbal", suffix:".", d:["bell","drum","harp"]
```

Replace with:

```js
prefix:"Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling", a:"cymbal", suffix:".", d:["bell","drum","harp","trumpet","psaltery"]
```

### D corinthians13 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And though I have the gift of prophecy, and understand all mysteries, and all knowledge; and though I have all faith, so that I could remove mountains, and have not charity, I am", a:"nothing", suffix:".", d:["empty","vain","lost"]
```

Replace with:

```js
prefix:"And though I have the gift of prophecy, and understand all mysteries, and all knowledge; and though I have all faith, so that I could remove mountains, and have not charity, I am", a:"nothing", suffix:".", d:["empty","vain","lost","rich","wise"]
```

### D corinthians13 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Charity suffereth long, and is", a:"kind", suffix:";", d:["meek","true","pure"]
```

Replace with:

```js
prefix:"Charity suffereth long, and is", a:"kind", suffix:";", d:["meek","true","pure","proud","bold"]
```

### D corinthians13 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"charity envieth not; charity vaunteth not itself, is not", a:"puffed", suffix:"up,", d:["lifted","set","raised"]
```

Replace with:

```js
prefix:"charity envieth not; charity vaunteth not itself, is not", a:"puffed", suffix:"up,", d:["lifted","set","raised","bound","filled"]
```

### D corinthians13 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Charity never", a:"faileth", suffix:":", d:["endeth","ceaseth","falleth"]
```

Replace with:

```js
prefix:"Charity never", a:"faileth", suffix:":", d:["endeth","ceaseth","falleth","changeth","sleepeth"]
```

### D corinthians13 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For now we see through a glass,", a:"darkly", suffix:";", d:["dimly","faintly","partly"]
```

Replace with:

```js
prefix:"For now we see through a glass,", a:"darkly", suffix:";", d:["dimly","faintly","partly","quickly","boldly"]
```

### D corinthians13 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"but then face to", a:"face", suffix:":", d:["glory","light","truth"]
```

Replace with:

```js
prefix:"but then face to", a:"face", suffix:":", d:["glory","light","truth","eye","hand"]
```

### D corinthians13 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And now abideth faith, hope, charity, these three; but the greatest of these is", a:"charity", suffix:".", d:["faith","hope","love"]
```

Replace with:

```js
prefix:"And now abideth faith, hope, charity, these three; but the greatest of these is", a:"charity", suffix:".", d:["faith","hope","love","knowledge","prophecy"]
```

### D corinthians13 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Beareth all things, believeth all things, hopeth all things, endureth all", a:"things", suffix:".", d:["days","trials","pains"]
```

Replace with:

```js
prefix:"Beareth all things, believeth all things, hopeth all things, endureth all", a:"things", suffix:".", d:["days","trials","pains","men","sufferings"]
```

### D corinthians13 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"When I was a child, I spake as a child, I understood as a child, I thought as a child: but when I became a man, I put away childish", a:"things", suffix:".", d:["ways","words","fears"]
```

Replace with:

```js
prefix:"When I was a child, I spake as a child, I understood as a child, I thought as a child: but when I became a man, I put away childish", a:"things", suffix:".", d:["ways","words","fears","dreams","tears"]
```

### D romans8 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the", a:"Spirit", suffix:".", d:["truth","word","law"]
```

Replace with:

```js
prefix:"There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the", a:"Spirit", suffix:".", d:["truth","word","law","light","faith"]
```

### D romans8 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For as many as are led by the Spirit of God, they are the sons of", a:"God", suffix:".", d:["light","Abraham","heaven"]
```

Replace with:

```js
prefix:"For as many as are led by the Spirit of God, they are the sons of", a:"God", suffix:".", d:["light","Abraham","heaven","Adam","Israel"]
```

### D romans8 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The Spirit itself beareth witness with our spirit, that we are the children of", a:"God", suffix:":", d:["light","promise","heaven"]
```

Replace with:

```js
prefix:"The Spirit itself beareth witness with our spirit, that we are the children of", a:"God", suffix:":", d:["light","promise","heaven","Abraham","Israel"]
```

### D romans8 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in", a:"us", suffix:".", d:["you","them","me"]
```

Replace with:

```js
prefix:"For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in", a:"us", suffix:".", d:["you","them","me","him","it"]
```

### D romans8 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be", a:"uttered", suffix:".", d:["spoken","named","told"]
```

Replace with:

```js
prefix:"Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be", a:"uttered", suffix:".", d:["spoken","named","told","written","touched"]
```

### D romans8 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And we know that all things work together for good to them that love", a:"God", suffix:",", d:["Christ","truth","life"]
```

Replace with:

```js
prefix:"And we know that all things work together for good to them that love", a:"God", suffix:",", d:["Christ","truth","life","Israel","Jesus"]
```

### D romans8 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"What shall we then say to these things? If God be for us, who can be against", a:"us", suffix:"?", d:["thee","him","them"]
```

Replace with:

```js
prefix:"What shall we then say to these things? If God be for us, who can be against", a:"us", suffix:"?", d:["thee","him","them","me","you"]
```

### D romans8 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Nay, in all these things we are more than conquerors through him that loved", a:"us", suffix:".", d:["you","them","me"]
```

Replace with:

```js
prefix:"Nay, in all these things we are more than conquerors through him that loved", a:"us", suffix:".", d:["you","them","me","her","it"]
```

### D romans8 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to", a:"come", suffix:",", d:["pass","be","end"]
```

Replace with:

```js
prefix:"For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to", a:"come", suffix:",", d:["pass","be","end","go","remain"]
```

### D romans8 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our", a:"Lord", suffix:".", d:["King","Saviour","Head"]
```

Replace with:

```js
prefix:"Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our", a:"Lord", suffix:".", d:["King","Saviour","Head","Shepherd","Father"]
```

### D revelation21 blank 0 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And I saw a new heaven and a new", a:"earth", suffix:":", d:["world","city","sea"]
```

Replace with:

```js
prefix:"And I saw a new heaven and a new", a:"earth", suffix:":", d:["world","city","sea","garden","garment"]
```

### D revelation21 blank 1 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"for the first heaven and the first earth were passed away; and there was no more", a:"sea", suffix:".", d:["night","death","pain"]
```

Replace with:

```js
prefix:"for the first heaven and the first earth were passed away; and there was no more", a:"sea", suffix:".", d:["night","death","pain","tears","light"]
```

### D revelation21 blank 2 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And I John saw the holy city, new Jerusalem, coming down from God out of", a:"heaven", suffix:",", d:["glory","the sky","the cloud"]
```

Replace with:

```js
prefix:"And I John saw the holy city, new Jerusalem, coming down from God out of", a:"heaven", suffix:",", d:["glory","the sky","the cloud","earth","Zion"]
```

### D revelation21 blank 3 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And God shall wipe away all tears from their eyes; and there shall be no more", a:"death", suffix:",", d:["night","pain","fear"]
```

Replace with:

```js
prefix:"And God shall wipe away all tears from their eyes; and there shall be no more", a:"death", suffix:",", d:["night","pain","fear","sickness","sin"]
```

### D revelation21 blank 4 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed", a:"away", suffix:".", d:["on","by","off"]
```

Replace with:

```js
prefix:"neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed", a:"away", suffix:".", d:["on","by","off","over","behind"]
```

### D revelation21 blank 5 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he that sat upon the throne said, Behold, I make all things", a:"new", suffix:".", d:["whole","good","true"]
```

Replace with:

```js
prefix:"And he that sat upon the throne said, Behold, I make all things", a:"new", suffix:".", d:["whole","good","true","clean","old"]
```

### D revelation21 blank 6 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he said unto me, It is done. I am Alpha and Omega, the beginning and the", a:"end", suffix:".", d:["last","finish","close"]
```

Replace with:

```js
prefix:"And he said unto me, It is done. I am Alpha and Omega, the beginning and the", a:"end", suffix:".", d:["last","finish","close","middle","height"]
```

### D revelation21 blank 7 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the city had no need of the sun, neither of the moon, to shine in it: for the glory of God did lighten it, and the", a:"Lamb", suffix:" is the light thereof.", d:["Lord","Word","Son"]
```

Replace with:

```js
prefix:"And the city had no need of the sun, neither of the moon, to shine in it: for the glory of God did lighten it, and the", a:"Lamb", suffix:" is the light thereof.", d:["Lord","Word","Son","Father","Spirit"]
```

### D revelation21 blank 8 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and there shall be no more death, neither sorrow, nor crying, neither shall there be any more", a:"pain", suffix:":", d:["fear","night","tears"]
```

Replace with:

```js
prefix:"and there shall be no more death, neither sorrow, nor crying, neither shall there be any more", a:"pain", suffix:":", d:["fear","night","tears","sickness","shame"]
```

### D revelation21 blank 9 gains two decoys (js/tablets-canon.js)  (`js/tablets-canon.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And there shall in no wise enter into it any thing that defileth, neither whatsoever worketh abomination, or maketh a lie: but they which are written in the Lamb's book of", a:"life", suffix:".", d:["names","heaven","glory"]
```

Replace with:

```js
prefix:"And there shall in no wise enter into it any thing that defileth, neither whatsoever worketh abomination, or maketh a lie: but they which are written in the Lamb's book of", a:"life", suffix:".", d:["names","heaven","glory","death","record"]
```

### D genesis3 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Now the serpent was more", a:"subtil", suffix:"than any beast of the field which the LORD God had made.", d:["subtle","crafty","wise"]
```

Replace with:

```js
prefix:"Now the serpent was more", a:"subtil", suffix:"than any beast of the field which the LORD God had made.", d:["subtle","crafty","wise","fierce","strong"]
```

### D genesis3 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the serpent said unto the woman, Ye shall not surely", a:"die", suffix:":", d:["fall","sin","eat"]
```

Replace with:

```js
prefix:"And the serpent said unto the woman, Ye shall not surely", a:"die", suffix:":", d:["fall","sin","eat","touch","taste"]
```

### D genesis3 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"she took of the fruit thereof, and did eat, and gave also unto her husband with her; and he did", a:"eat", suffix:".", d:["drink","take","see"]
```

Replace with:

```js
prefix:"she took of the fruit thereof, and did eat, and gave also unto her husband with her; and he did", a:"eat", suffix:".", d:["drink","take","see","hear","smell"]
```

### D genesis3 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the eyes of them both were opened, and they knew that they were", a:"naked", suffix:";", d:["ashamed","afraid","lost"]
```

Replace with:

```js
prefix:"And the eyes of them both were opened, and they knew that they were", a:"naked", suffix:";", d:["ashamed","afraid","lost","blind","wise"]
```

### D genesis3 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"it shall bruise thy head, and thou shalt bruise his", a:"heel", suffix:".", d:["hand","foot","side"]
```

Replace with:

```js
prefix:"it shall bruise thy head, and thou shalt bruise his", a:"heel", suffix:".", d:["hand","foot","side","neck","knee"]
```

### D genesis3 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"for dust thou art, and unto dust shalt thou", a:"return", suffix:".", d:["go","rest","sleep"]
```

Replace with:

```js
prefix:"for dust thou art, and unto dust shalt thou", a:"return", suffix:".", d:["go","rest","sleep","remain","wander"]
```

### D genesis3 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Therefore the LORD God sent him forth from the garden of", a:"Eden", suffix:", to till the ground from whence he was taken.", d:["Haran","Zion","Canaan"]
```

Replace with:

```js
prefix:"Therefore the LORD God sent him forth from the garden of", a:"Eden", suffix:", to till the ground from whence he was taken.", d:["Haran","Zion","Canaan","Gilead","Carmel"]
```

### D genesis3 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"So he drove out the man; and he placed at the east of the garden of Eden Cherubims, and a flaming", a:"sword", suffix:"which turned every way,", d:["spear","fire","gate"]
```

Replace with:

```js
prefix:"So he drove out the man; and he placed at the east of the garden of Eden Cherubims, and a flaming", a:"sword", suffix:"which turned every way,", d:["spear","fire","gate","brand","lamp"]
```

### D exodus14 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Moses said unto the people, Fear ye not, stand still, and see the salvation of the", a:"LORD", suffix:",", d:["Most High","Almighty","God"]
```

Replace with:

```js
prefix:"And Moses said unto the people, Fear ye not, stand still, and see the salvation of the", a:"LORD", suffix:",", d:["Most High","Almighty","God","Saviour","Redeemer"]
```

### D exodus14 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The LORD shall fight for you, and ye shall hold your", a:"peace", suffix:".", d:["tongue","place","rest"]
```

Replace with:

```js
prefix:"The LORD shall fight for you, and ye shall hold your", a:"peace", suffix:".", d:["tongue","place","rest","breath","hands"]
```

### D exodus14 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But lift thou up thy rod, and stretch out thine hand over the", a:"sea", suffix:", and divide it:", d:["river","deep","waters"]
```

Replace with:

```js
prefix:"But lift thou up thy rod, and stretch out thine hand over the", a:"sea", suffix:", and divide it:", d:["river","deep","waters","land","mountain"]
```

### D exodus14 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and the LORD caused the sea to go back by a strong east", a:"wind", suffix:"all that night,", d:["blast","storm","breath"]
```

Replace with:

```js
prefix:"and the LORD caused the sea to go back by a strong east", a:"wind", suffix:"all that night,", d:["blast","storm","breath","tempest","spirit"]
```

### D exodus14 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And the children of Israel went into the midst of the sea upon the dry ground: and the waters were a", a:"wall", suffix:"unto them on their right hand, and on their left.", d:["hedge","bank","tower"]
```

Replace with:

```js
prefix:"And the children of Israel went into the midst of the sea upon the dry ground: and the waters were a", a:"wall", suffix:"unto them on their right hand, and on their left.", d:["hedge","bank","tower","shadow","fire"]
```

### D exodus14 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and the LORD overthrew the Egyptians in the midst of the", a:"sea", suffix:".", d:["deep","flood","wave"]
```

Replace with:

```js
prefix:"and the LORD overthrew the Egyptians in the midst of the", a:"sea", suffix:".", d:["deep","flood","wave","river","host"]
```

### D exodus14 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and there remained not so much as one of", a:"them", suffix:".", d:["us","him","these"]
```

Replace with:

```js
prefix:"and there remained not so much as one of", a:"them", suffix:".", d:["us","him","these","those","whom"]
```

### D exodus14 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Israel saw that great work which the LORD did upon the Egyptians: and the people feared the LORD, and believed the LORD, and his servant", a:"Moses", suffix:".", d:["Aaron","Joshua","Joseph"]
```

Replace with:

```js
prefix:"And Israel saw that great work which the LORD did upon the Egyptians: and the people feared the LORD, and believed the LORD, and his servant", a:"Moses", suffix:".", d:["Aaron","Joshua","Joseph","Caleb","David"]
```

### D ruth1 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And Ruth said, Intreat me not to leave thee, or to return from following after", a:"thee", suffix:":", d:["him","us","her"]
```

Replace with:

```js
prefix:"And Ruth said, Intreat me not to leave thee, or to return from following after", a:"thee", suffix:":", d:["him","us","her","them","you"]
```

### D ruth1 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"for whither thou goest, I will", a:"go", suffix:";", d:["stay","come","walk"]
```

Replace with:

```js
prefix:"for whither thou goest, I will", a:"go", suffix:";", d:["stay","come","walk","tarry","remain"]
```

### D ruth1 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and where thou lodgest, I will", a:"lodge", suffix:":", d:["dwell","rest","abide"]
```

Replace with:

```js
prefix:"and where thou lodgest, I will", a:"lodge", suffix:":", d:["dwell","rest","abide","sleep","eat"]
```

### D ruth1 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"thy people shall be my people, and thy God my", a:"God", suffix:":", d:["LORD","King","help"]
```

Replace with:

```js
prefix:"thy people shall be my people, and thy God my", a:"God", suffix:":", d:["LORD","King","help","Saviour","Judge"]
```

### D ruth1 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Where thou diest, will I", a:"die", suffix:", and there will I be buried:", d:["lie","sleep","rest"]
```

Replace with:

```js
prefix:"Where thou diest, will I", a:"die", suffix:", and there will I be buried:", d:["lie","sleep","rest","live","stay"]
```

### D ruth1 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"the LORD do so to me, and more also, if ought but death part thee and", a:"me", suffix:".", d:["thee","us","her"]
```

Replace with:

```js
prefix:"the LORD do so to me, and more also, if ought but death part thee and", a:"me", suffix:".", d:["thee","us","her","him","them"]
```

### D ruth1 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And she said unto them, Call me not Naomi, call me", a:"Mara", suffix:": for the Almighty hath dealt very bitterly with me.", d:["Rachel","Hannah","Sarah"]
```

Replace with:

```js
prefix:"And she said unto them, Call me not Naomi, call me", a:"Mara", suffix:": for the Almighty hath dealt very bitterly with me.", d:["Rachel","Hannah","Sarah","Ruth","Miriam"]
```

### D ruth1 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I went out full, and the LORD hath brought me home again", a:"empty", suffix:":", d:["poor","bare","alone"]
```

Replace with:

```js
prefix:"I went out full, and the LORD hath brought me home again", a:"empty", suffix:":", d:["poor","bare","alone","weary","rich"]
```

### D job38 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Who is this that darkeneth counsel by words without", a:"knowledge", suffix:"?", d:["wisdom","understanding","truth"]
```

Replace with:

```js
prefix:"Who is this that darkeneth counsel by words without", a:"knowledge", suffix:"?", d:["wisdom","understanding","truth","fear","shame"]
```

### D job38 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Where wast thou when I laid the foundations of the", a:"earth", suffix:"? declare, if thou hast understanding.", d:["world","deep","heavens"]
```

Replace with:

```js
prefix:"Where wast thou when I laid the foundations of the", a:"earth", suffix:"? declare, if thou hast understanding.", d:["world","deep","heavens","sea","mountains"]
```

### D job38 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"When the morning stars sang together, and all the sons of God shouted for", a:"joy", suffix:"?", d:["praise","glory","wonder"]
```

Replace with:

```js
prefix:"When the morning stars sang together, and all the sons of God shouted for", a:"joy", suffix:"?", d:["praise","glory","wonder","war","fear"]
```

### D job38 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Or who shut up the sea with", a:"doors", suffix:", when it brake forth, as if it had issued out of the womb?", d:["bars","gates","bonds"]
```

Replace with:

```js
prefix:"Or who shut up the sea with", a:"doors", suffix:", when it brake forth, as if it had issued out of the womb?", d:["bars","gates","bonds","walls","fetters"]
```

### D job38 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And said, Hitherto shalt thou come, but no", a:"further", suffix:": and here shall thy proud waves be stayed?", d:["more","beyond","longer"]
```

Replace with:

```js
prefix:"And said, Hitherto shalt thou come, but no", a:"further", suffix:": and here shall thy proud waves be stayed?", d:["more","beyond","longer","lower","less"]
```

### D job38 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Hast thou entered into the treasures of the", a:"snow", suffix:"? or hast thou seen the treasures of the hail,", d:["rain","ice","frost"]
```

Replace with:

```js
prefix:"Hast thou entered into the treasures of the", a:"snow", suffix:"? or hast thou seen the treasures of the hail,", d:["rain","ice","frost","dew","wind"]
```

### D job38 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Canst thou bind the sweet influences of Pleiades, or loose the bands of", a:"Orion", suffix:"?", d:["Arcturus","Mazzaroth","the Bear"]
```

Replace with:

```js
prefix:"Canst thou bind the sweet influences of Pleiades, or loose the bands of", a:"Orion", suffix:"?", d:["Arcturus","Mazzaroth","the Bear","Edom","Gilead"]
```

### D job38 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Who provideth for the raven his food? when his young ones cry unto", a:"God", suffix:", they wander for lack of meat.", d:["the LORD","heaven","man"]
```

Replace with:

```js
prefix:"Who provideth for the raven his food? when his young ones cry unto", a:"God", suffix:", they wander for lack of meat.", d:["the LORD","heaven","man","Elijah","Baal"]
```

### D psalm1 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Blessed is the man that walketh not in the counsel of the", a:"ungodly", suffix:",", d:["wicked","sinners","proud"]
```

Replace with:

```js
prefix:"Blessed is the man that walketh not in the counsel of the", a:"ungodly", suffix:",", d:["wicked","sinners","proud","scornful","evil"]
```

### D psalm1 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But his delight is in the law of the", a:"LORD", suffix:"; and in his law doth he meditate day and night.", d:["Most High","Almighty","God"]
```

Replace with:

```js
prefix:"But his delight is in the law of the", a:"LORD", suffix:"; and in his law doth he meditate day and night.", d:["Most High","Almighty","God","Saviour","Redeemer"]
```

### D psalm1 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he shall be like a tree planted by the rivers of", a:"water", suffix:",", d:["life","Eden","peace"]
```

Replace with:

```js
prefix:"And he shall be like a tree planted by the rivers of", a:"water", suffix:",", d:["life","Eden","peace","oil","milk"]
```

### D psalm1 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"his leaf also shall not", a:"wither", suffix:"; and whatsoever he doeth shall prosper.", d:["fail","fade","fall"]
```

Replace with:

```js
prefix:"his leaf also shall not", a:"wither", suffix:"; and whatsoever he doeth shall prosper.", d:["fail","fade","fall","cease","blossom"]
```

### D psalm1 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The ungodly are not so: but are like the", a:"chaff", suffix:"which the wind driveth away.", d:["dust","stubble","ash"]
```

Replace with:

```js
prefix:"The ungodly are not so: but are like the", a:"chaff", suffix:"which the wind driveth away.", d:["dust","stubble","ash","stone","rock"]
```

### D psalm1 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Therefore the ungodly shall not stand in the", a:"judgment", suffix:", nor sinners in the congregation of the righteous.", d:["fire","gate","day"]
```

Replace with:

```js
prefix:"Therefore the ungodly shall not stand in the", a:"judgment", suffix:", nor sinners in the congregation of the righteous.", d:["fire","gate","day","assembly","temple"]
```

### D psalm1 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For the LORD knoweth the way of the", a:"righteous", suffix:":", d:["just","holy","meek"]
```

Replace with:

```js
prefix:"For the LORD knoweth the way of the", a:"righteous", suffix:":", d:["just","holy","meek","wicked","faithful"]
```

### D psalm1 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"but the way of the ungodly shall", a:"perish", suffix:".", d:["fail","end","fall"]
```

Replace with:

```js
prefix:"but the way of the ungodly shall", a:"perish", suffix:".", d:["fail","end","fall","wither","burn"]
```

### D psalm121 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I will lift up mine eyes unto the hills, from whence cometh my", a:"help", suffix:".", d:["hope","strength","peace"]
```

Replace with:

```js
prefix:"I will lift up mine eyes unto the hills, from whence cometh my", a:"help", suffix:".", d:["hope","strength","peace","refuge","shield"]
```

### D psalm121 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"My help cometh from the LORD, which made heaven and", a:"earth", suffix:".", d:["sea","all","man"]
```

Replace with:

```js
prefix:"My help cometh from the LORD, which made heaven and", a:"earth", suffix:".", d:["sea","all","man","hell","waters"]
```

### D psalm121 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He will not suffer thy foot to be moved: he that keepeth thee will not", a:"slumber", suffix:".", d:["sleep","fail","leave"]
```

Replace with:

```js
prefix:"He will not suffer thy foot to be moved: he that keepeth thee will not", a:"slumber", suffix:".", d:["sleep","fail","leave","faint","rest"]
```

### D psalm121 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Behold, he that keepeth Israel shall neither slumber nor", a:"sleep", suffix:".", d:["rest","fail","tire"]
```

Replace with:

```js
prefix:"Behold, he that keepeth Israel shall neither slumber nor", a:"sleep", suffix:".", d:["rest","fail","tire","dream","faint"]
```

### D psalm121 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The LORD is thy keeper: the LORD is thy shade upon thy right", a:"hand", suffix:".", d:["side","arm","path"]
```

Replace with:

```js
prefix:"The LORD is thy keeper: the LORD is thy shade upon thy right", a:"hand", suffix:".", d:["side","arm","path","eye","foot"]
```

### D psalm121 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The sun shall not smite thee by day, nor the moon by", a:"night", suffix:".", d:["dark","even","watch"]
```

Replace with:

```js
prefix:"The sun shall not smite thee by day, nor the moon by", a:"night", suffix:".", d:["dark","even","watch","morning","summer"]
```

### D psalm121 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The LORD shall preserve thee from all", a:"evil", suffix:": he shall preserve thy soul.", d:["harm","fear","death"]
```

Replace with:

```js
prefix:"The LORD shall preserve thee from all", a:"evil", suffix:": he shall preserve thy soul.", d:["harm","fear","death","sorrow","famine"]
```

### D psalm121 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The LORD shall preserve thy going out and thy", a:"coming", suffix:"in from this time forth, and even for evermore.", d:["rising","walking","standing"]
```

Replace with:

```js
prefix:"The LORD shall preserve thy going out and thy", a:"coming", suffix:"in from this time forth, and even for evermore.", d:["rising","walking","standing","sitting","dwelling"]
```

### D ecclesiastes3 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"To every thing there is a season, and a time to every purpose under the", a:"heaven", suffix:":", d:["sun","earth","sky"]
```

Replace with:

```js
prefix:"To every thing there is a season, and a time to every purpose under the", a:"heaven", suffix:":", d:["sun","earth","sky","moon","stars"]
```

### D ecclesiastes3 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"A time to be born, and a time to", a:"die", suffix:";", d:["live","sleep","end"]
```

Replace with:

```js
prefix:"A time to be born, and a time to", a:"die", suffix:";", d:["live","sleep","end","plant","eat"]
```

### D ecclesiastes3 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"A time to weep, and a time to", a:"laugh", suffix:";", d:["sing","dance","rejoice"]
```

Replace with:

```js
prefix:"A time to weep, and a time to", a:"laugh", suffix:";", d:["sing","dance","rejoice","hate","embrace"]
```

### D ecclesiastes3 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"a time to mourn, and a time to", a:"dance", suffix:";", d:["sing","feast","leap"]
```

Replace with:

```js
prefix:"a time to mourn, and a time to", a:"dance", suffix:";", d:["sing","feast","leap","weep","cast"]
```

### D ecclesiastes3 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"A time to keep silence, and a time to", a:"speak", suffix:";", d:["cry","pray","teach"]
```

Replace with:

```js
prefix:"A time to keep silence, and a time to", a:"speak", suffix:";", d:["cry","pray","teach","hear","answer"]
```

### D ecclesiastes3 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"A time to love, and a time to hate; a time of war, and a time of", a:"peace", suffix:".", d:["rest","ease","quiet"]
```

Replace with:

```js
prefix:"A time to love, and a time to hate; a time of war, and a time of", a:"peace", suffix:".", d:["rest","ease","quiet","famine","hunger"]
```

### D ecclesiastes3 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He hath made every thing beautiful in his", a:"time", suffix:":", d:["way","hour","season"]
```

Replace with:

```js
prefix:"He hath made every thing beautiful in his", a:"time", suffix:":", d:["way","hour","season","day","hand"]
```

### D ecclesiastes3 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I know that, whatsoever God doeth, it shall be for", a:"ever", suffix:":", d:["good","us","nought"]
```

Replace with:

```js
prefix:"I know that, whatsoever God doeth, it shall be for", a:"ever", suffix:":", d:["good","us","nought","evil","years"]
```

### D isaiah40 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Comfort ye, comfort ye my people, saith your", a:"God", suffix:".", d:["King","LORD","Father"]
```

Replace with:

```js
prefix:"Comfort ye, comfort ye my people, saith your", a:"God", suffix:".", d:["King","LORD","Father","Redeemer","Saviour"]
```

### D isaiah40 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The voice of him that crieth in the wilderness, Prepare ye the way of the", a:"LORD", suffix:",", d:["King","Christ","Most High"]
```

Replace with:

```js
prefix:"The voice of him that crieth in the wilderness, Prepare ye the way of the", a:"LORD", suffix:",", d:["King","Christ","Most High","Judge","Redeemer"]
```

### D isaiah40 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"The grass withereth, the flower fadeth: but the word of our God shall stand for", a:"ever", suffix:".", d:["aye","truth","us"]
```

Replace with:

```js
prefix:"The grass withereth, the flower fadeth: but the word of our God shall stand for", a:"ever", suffix:".", d:["aye","truth","us","evil","years"]
```

### D isaiah40 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He shall feed his flock like a", a:"shepherd", suffix:":", d:["father","king","guide"]
```

Replace with:

```js
prefix:"He shall feed his flock like a", a:"shepherd", suffix:":", d:["father","king","guide","husbandman","gardener"]
```

### D isaiah40 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Hast thou not known? hast thou not heard, that the everlasting God, the LORD, the Creator of the ends of the earth, fainteth not, neither is", a:"weary", suffix:"?", d:["weak","spent","tired"]
```

Replace with:

```js
prefix:"Hast thou not known? hast thou not heard, that the everlasting God, the LORD, the Creator of the ends of the earth, fainteth not, neither is", a:"weary", suffix:"?", d:["weak","spent","tired","afraid","wise"]
```

### D isaiah40 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But they that wait upon the LORD shall renew their", a:"strength", suffix:";", d:["youth","hope","heart"]
```

Replace with:

```js
prefix:"But they that wait upon the LORD shall renew their", a:"strength", suffix:";", d:["youth","hope","heart","faith","spirit"]
```

### D isaiah40 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"they shall mount up with wings as", a:"eagles", suffix:";", d:["doves","angels","cherubims"]
```

Replace with:

```js
prefix:"they shall mount up with wings as", a:"eagles", suffix:";", d:["doves","angels","cherubims","ravens","lambs"]
```

### D isaiah40 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"they shall run, and not be weary; and they shall walk, and not", a:"faint", suffix:".", d:["fall","fail","tire"]
```

Replace with:

```js
prefix:"they shall run, and not be weary; and they shall walk, and not", a:"faint", suffix:".", d:["fall","fail","tire","stumble","sleep"]
```

### D jeremiah29 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And seek the peace of the city whither I have caused you to be carried away", a:"captives", suffix:",", d:["exiles","strangers","servants"]
```

Replace with:

```js
prefix:"And seek the peace of the city whither I have caused you to be carried away", a:"captives", suffix:",", d:["exiles","strangers","servants","kings","gold"]
```

### D jeremiah29 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For I know the thoughts that I think toward you, saith the LORD, thoughts of", a:"peace", suffix:", and not of evil,", d:["mercy","hope","good"]
```

Replace with:

```js
prefix:"For I know the thoughts that I think toward you, saith the LORD, thoughts of", a:"peace", suffix:", and not of evil,", d:["mercy","hope","good","love","wrath"]
```

### D jeremiah29 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"to give you an expected", a:"end", suffix:".", d:["hope","future","rest"]
```

Replace with:

```js
prefix:"to give you an expected", a:"end", suffix:".", d:["hope","future","rest","reward","return"]
```

### D jeremiah29 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto", a:"you", suffix:".", d:["them","us","thee"]
```

Replace with:

```js
prefix:"Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto", a:"you", suffix:".", d:["them","us","thee","him","her"]
```

### D jeremiah29 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And ye shall seek me, and find me, when ye shall search for me with all your", a:"heart", suffix:".", d:["soul","might","mind"]
```

Replace with:

```js
prefix:"And ye shall seek me, and find me, when ye shall search for me with all your", a:"heart", suffix:".", d:["soul","might","mind","strength","spirit"]
```

### D jeremiah29 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And I will be found of you, saith the LORD: and I will turn away your", a:"captivity", suffix:",", d:["sorrow","bondage","shame"]
```

Replace with:

```js
prefix:"And I will be found of you, saith the LORD: and I will turn away your", a:"captivity", suffix:",", d:["sorrow","bondage","shame","transgressions","anger"]
```

### D jeremiah29 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For thus saith the LORD, That after seventy years be accomplished at Babylon I will visit you, and perform my good", a:"word", suffix:"toward you,", d:["oath","work","promise"]
```

Replace with:

```js
prefix:"For thus saith the LORD, That after seventy years be accomplished at Babylon I will visit you, and perform my good", a:"word", suffix:"toward you,", d:["oath","work","promise","pleasure","counsel"]
```

### D jeremiah29 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and I will gather you from all the nations, and from all the places whither I have driven you, saith the LORD; and I will bring you again into the place whence I caused you to be carried away", a:"captive", suffix:".", d:["bound","lost","sold"]
```

Replace with:

```js
prefix:"and I will gather you from all the nations, and from all the places whither I have driven you, saith the LORD; and I will bring you again into the place whence I caused you to be carried away", a:"captive", suffix:".", d:["bound","lost","sold","afflicted","strangers"]
```

### D ezekiel37 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he said unto me, Son of man, can these bones", a:"live", suffix:"? And I answered, O Lord GOD, thou knowest.", d:["rise","stand","speak"]
```

Replace with:

```js
prefix:"And he said unto me, Son of man, can these bones", a:"live", suffix:"? And I answered, O Lord GOD, thou knowest.", d:["rise","stand","speak","move","breathe"]
```

### D ezekiel37 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Again he said unto me, Prophesy upon these bones, and say unto them, O ye dry bones, hear the word of the", a:"LORD", suffix:".", d:["Most High","Almighty","God"]
```

Replace with:

```js
prefix:"Again he said unto me, Prophesy upon these bones, and say unto them, O ye dry bones, hear the word of the", a:"LORD", suffix:".", d:["Most High","Almighty","God","Saviour","Redeemer"]
```

### D ezekiel37 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Thus saith the Lord GOD unto these bones; Behold, I will cause breath to enter into you, and ye shall", a:"live", suffix:":", d:["rise","stand","wake"]
```

Replace with:

```js
prefix:"Thus saith the Lord GOD unto these bones; Behold, I will cause breath to enter into you, and ye shall", a:"live", suffix:":", d:["rise","stand","wake","move","sleep"]
```

### D ezekiel37 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"So I prophesied as I was commanded: and as I prophesied, there was a noise, and behold a", a:"shaking", suffix:", and the bones came together, bone to his bone.", d:["wind","thunder","quake"]
```

Replace with:

```js
prefix:"So I prophesied as I was commanded: and as I prophesied, there was a noise, and behold a", a:"shaking", suffix:", and the bones came together, bone to his bone.", d:["wind","thunder","quake","rushing","earthquake"]
```

### D ezekiel37 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and the sinews and the flesh came up upon them, and the skin covered them above: but there was no breath in", a:"them", suffix:".", d:["us","him","it"]
```

Replace with:

```js
prefix:"and the sinews and the flesh came up upon them, and the skin covered them above: but there was no breath in", a:"them", suffix:".", d:["us","him","it","these","those"]
```

### D ezekiel37 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Then said he unto me, Prophesy unto the wind, prophesy, son of man, and say to the wind, Thus saith the Lord GOD; Come from the four winds, O", a:"breath", suffix:", and breathe upon these slain, that they may live.", d:["spirit","air","life"]
```

Replace with:

```js
prefix:"Then said he unto me, Prophesy unto the wind, prophesy, son of man, and say to the wind, Thus saith the Lord GOD; Come from the four winds, O", a:"breath", suffix:", and breathe upon these slain, that they may live.", d:["spirit","air","life","soul","fire"]
```

### D ezekiel37 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and they lived, and stood up upon their feet, an exceeding great", a:"army", suffix:".", d:["host","people","nation"]
```

Replace with:

```js
prefix:"and they lived, and stood up upon their feet, an exceeding great", a:"army", suffix:".", d:["host","people","nation","company","flock"]
```

### D ezekiel37 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And shall put my spirit in you, and ye shall live, and I shall place you in your own", a:"land", suffix:":", d:["house","city","place"]
```

Replace with:

```js
prefix:"And shall put my spirit in you, and ye shall live, and I shall place you in your own", a:"land", suffix:":", d:["house","city","place","country","ground"]
```

### D matthew11 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Come unto me, all ye that labour and are heavy laden, and I will give you", a:"rest", suffix:".", d:["peace","life","joy"]
```

Replace with:

```js
prefix:"Come unto me, all ye that labour and are heavy laden, and I will give you", a:"rest", suffix:".", d:["peace","life","joy","hope","help"]
```

### D matthew11 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Take my yoke upon you, and learn of me; for I am meek and lowly in", a:"heart", suffix:":", d:["spirit","mind","soul"]
```

Replace with:

```js
prefix:"Take my yoke upon you, and learn of me; for I am meek and lowly in", a:"heart", suffix:":", d:["spirit","mind","soul","deed","speech"]
```

### D matthew11 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"and ye shall find rest unto your", a:"souls", suffix:".", d:["hearts","minds","flesh"]
```

Replace with:

```js
prefix:"and ye shall find rest unto your", a:"souls", suffix:".", d:["hearts","minds","flesh","bodies","spirits"]
```

### D matthew11 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For my yoke is easy, and my burden is", a:"light", suffix:".", d:["small","kind","fair"]
```

Replace with:

```js
prefix:"For my yoke is easy, and my burden is", a:"light", suffix:".", d:["small","kind","fair","heavy","sweet"]
```

### D matthew11 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I thank thee, O Father, Lord of heaven and earth, because thou hast hid these things from the wise and prudent, and hast revealed them unto", a:"babes", suffix:".", d:["children","the poor","sinners"]
```

Replace with:

```js
prefix:"I thank thee, O Father, Lord of heaven and earth, because thou hast hid these things from the wise and prudent, and hast revealed them unto", a:"babes", suffix:".", d:["children","the poor","sinners","saints","fools"]
```

### D matthew11 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"All things are delivered unto me of my Father: and no man knoweth the Son, but the", a:"Father", suffix:";", d:["Spirit","Lord","Most High"]
```

Replace with:

```js
prefix:"All things are delivered unto me of my Father: and no man knoweth the Son, but the", a:"Father", suffix:";", d:["Spirit","Lord","Most High","Saviour","Creator"]
```

### D matthew11 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Come unto me, all ye that labour and are heavy", a:"laden", suffix:",", d:["tried","worn","spent"]
```

Replace with:

```js
prefix:"Come unto me, all ye that labour and are heavy", a:"laden", suffix:",", d:["tried","worn","spent","weary","afflicted"]
```

### D matthew11 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Take my yoke upon you, and learn of", a:"me", suffix:";", d:["him","God","this"]
```

Replace with:

```js
prefix:"Take my yoke upon you, and learn of", a:"me", suffix:";", d:["him","God","this","them","thee"]
```

### D mark16 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he saith unto them, Be not affrighted: Ye seek Jesus of Nazareth, which was crucified: he is risen; he is not", a:"here", suffix:":", d:["dead","gone","lost"]
```

Replace with:

```js
prefix:"And he saith unto them, Be not affrighted: Ye seek Jesus of Nazareth, which was crucified: he is risen; he is not", a:"here", suffix:":", d:["dead","gone","lost","there","near"]
```

### D mark16 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"behold the place where they laid", a:"him", suffix:".", d:["Jesus","the Lord","them"]
```

Replace with:

```js
prefix:"behold the place where they laid", a:"him", suffix:".", d:["Jesus","the Lord","them","it","her"]
```

### D mark16 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he said unto them, Go ye into all the world, and preach the gospel to every", a:"creature", suffix:".", d:["nation","people","tongue"]
```

Replace with:

```js
prefix:"And he said unto them, Go ye into all the world, and preach the gospel to every", a:"creature", suffix:".", d:["nation","people","tongue","man","kindred"]
```

### D mark16 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He that believeth and is baptized shall be", a:"saved", suffix:"; but he that believeth not shall be damned.", d:["blessed","kept","healed"]
```

Replace with:

```js
prefix:"He that believeth and is baptized shall be", a:"saved", suffix:"; but he that believeth not shall be damned.", d:["blessed","kept","healed","sanctified","forgiven"]
```

### D mark16 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And these signs shall follow them that believe; In my name shall they cast out", a:"devils", suffix:";", d:["spirits","demons","serpents"]
```

Replace with:

```js
prefix:"And these signs shall follow them that believe; In my name shall they cast out", a:"devils", suffix:";", d:["spirits","demons","serpents","sins","sorrows"]
```

### D mark16 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"So then after the Lord had spoken unto them, he was received up into", a:"heaven", suffix:", and sat on the right hand of God.", d:["glory","the cloud","the sky"]
```

Replace with:

```js
prefix:"So then after the Lord had spoken unto them, he was received up into", a:"heaven", suffix:", and sat on the right hand of God.", d:["glory","the cloud","the sky","wilderness","sea"]
```

### D mark16 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And they went forth, and preached every where, the Lord working with them, and confirming the word with", a:"signs", suffix:"following.", d:["wonders","miracles","power"]
```

Replace with:

```js
prefix:"And they went forth, and preached every where, the Lord working with them, and confirming the word with", a:"signs", suffix:"following.", d:["wonders","miracles","power","promises","tears"]
```

### D mark16 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Ye seek Jesus of Nazareth, which was crucified: he is", a:"risen", suffix:"; he is not here:", d:["alive","gone","taken"]
```

Replace with:

```js
prefix:"Ye seek Jesus of Nazareth, which was crucified: he is", a:"risen", suffix:"; he is not here:", d:["alive","gone","taken","dead","buried"]
```

### D luke15 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is", a:"lost", suffix:", until he find it?", d:["gone","strayed","hurt"]
```

Replace with:

```js
prefix:"What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is", a:"lost", suffix:", until he find it?", d:["gone","strayed","hurt","wandering","scattered"]
```

### D luke15 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Rejoice with me; for I have found my sheep which was", a:"lost", suffix:".", d:["dead","gone","stolen"]
```

Replace with:

```js
prefix:"Rejoice with me; for I have found my sheep which was", a:"lost", suffix:".", d:["dead","gone","stolen","hurt","sick"]
```

### D luke15 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Either what woman having ten pieces of silver, if she lose one piece, doth not light a candle, and sweep the house, and seek diligently till she find", a:"it", suffix:"?", d:["her","them","one"]
```

Replace with:

```js
prefix:"Either what woman having ten pieces of silver, if she lose one piece, doth not light a candle, and sweep the house, and seek diligently till she find", a:"it", suffix:"?", d:["her","them","one","that","him"]
```

### D luke15 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And not many days after the younger son gathered all together, and took his journey into a far country, and there wasted his substance with riotous", a:"living", suffix:".", d:["drink","pleasure","waste"]
```

Replace with:

```js
prefix:"And not many days after the younger son gathered all together, and took his journey into a far country, and there wasted his substance with riotous", a:"living", suffix:".", d:["drink","pleasure","waste","mirth","wine"]
```

### D luke15 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I will arise and go to my father, and will say unto him, Father, I have sinned against heaven, and before", a:"thee", suffix:",", d:["God","you","him"]
```

Replace with:

```js
prefix:"I will arise and go to my father, and will say unto him, Father, I have sinned against heaven, and before", a:"thee", suffix:",", d:["God","you","him","me","them"]
```

### D luke15 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had", a:"compassion", suffix:", and ran, and fell on his neck, and kissed him.", d:["mercy","pity","joy"]
```

Replace with:

```js
prefix:"And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had", a:"compassion", suffix:", and ran, and fell on his neck, and kissed him.", d:["mercy","pity","joy","gladness","sorrow"]
```

### D luke15 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For this my son was dead, and is alive again; he was lost, and is", a:"found", suffix:".", d:["home","saved","kept"]
```

Replace with:

```js
prefix:"For this my son was dead, and is alive again; he was lost, and is", a:"found", suffix:".", d:["home","saved","kept","returned","restored"]
```

### D luke15 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"It was meet that we should make merry, and be glad: for this thy brother was dead, and is alive again; and was lost, and is", a:"found", suffix:".", d:["home","here","kept"]
```

Replace with:

```js
prefix:"It was meet that we should make merry, and be glad: for this thy brother was dead, and is alive again; and was lost, and is", a:"found", suffix:".", d:["home","here","kept","sought","restored"]
```

### D john11 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Jesus said unto her, I am the resurrection, and the", a:"life", suffix:":", d:["way","truth","light"]
```

Replace with:

```js
prefix:"Jesus said unto her, I am the resurrection, and the", a:"life", suffix:":", d:["way","truth","light","death","hope"]
```

### D john11 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"he that believeth in me, though he were dead, yet shall he", a:"live", suffix:":", d:["rise","stand","wake"]
```

Replace with:

```js
prefix:"he that believeth in me, though he were dead, yet shall he", a:"live", suffix:":", d:["rise","stand","wake","die","return"]
```

### D john11 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And whosoever liveth and believeth in me shall never", a:"die", suffix:". Believest thou this?", d:["fall","perish","sleep"]
```

Replace with:

```js
prefix:"And whosoever liveth and believeth in me shall never", a:"die", suffix:". Believest thou this?", d:["fall","perish","sleep","fail","thirst"]
```

### D john11 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Jesus", a:"wept", suffix:".", d:["sighed","groaned","prayed"]
```

Replace with:

```js
prefix:"Jesus", a:"wept", suffix:".", d:["sighed","groaned","prayed","marvelled","rejoiced"]
```

### D john11 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Jesus said, Take ye away the", a:"stone", suffix:".", d:["cloth","door","grave"]
```

Replace with:

```js
prefix:"Jesus said, Take ye away the", a:"stone", suffix:".", d:["cloth","door","grave","cave","pit"]
```

### D john11 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And when he thus had spoken, he cried with a loud voice, Lazarus, come", a:"forth", suffix:".", d:["out","up","here"]
```

Replace with:

```js
prefix:"And when he thus had spoken, he cried with a loud voice, Lazarus, come", a:"forth", suffix:".", d:["out","up","here","back","in"]
```

### D john11 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he that was dead came forth, bound hand and foot with", a:"graveclothes", suffix:":", d:["linen","bands","cloths"]
```

Replace with:

```js
prefix:"And he that was dead came forth, bound hand and foot with", a:"graveclothes", suffix:":", d:["linen","bands","cloths","fetters","silver"]
```

### D john11 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"When Jesus heard that, he said, This sickness is not unto death, but for the glory of", a:"God", suffix:", that the Son of God might be glorified thereby.", d:["the Father","heaven","the Lord"]
```

Replace with:

```js
prefix:"When Jesus heard that, he said, This sickness is not unto death, but for the glory of", a:"God", suffix:", that the Son of God might be glorified thereby.", d:["the Father","heaven","the Lord","Christ","Moses"]
```

### D acts9 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And as he journeyed, he came near Damascus: and suddenly there shined round about him a light from", a:"heaven", suffix:":", d:["God","the sun","glory"]
```

Replace with:

```js
prefix:"And as he journeyed, he came near Damascus: and suddenly there shined round about him a light from", a:"heaven", suffix:":", d:["God","the sun","glory","clouds","fire"]
```

### D acts9 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he fell to the earth, and heard a voice saying unto him, Saul, Saul, why persecutest thou", a:"me", suffix:"?", d:["us","them","him"]
```

Replace with:

```js
prefix:"And he fell to the earth, and heard a voice saying unto him, Saul, Saul, why persecutest thou", a:"me", suffix:"?", d:["us","them","him","her","those"]
```

### D acts9 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he said, Who art thou, Lord? And the Lord said, I am Jesus whom thou", a:"persecutest", suffix:":", d:["hatest","huntest","scourgest"]
```

Replace with:

```js
prefix:"And he said, Who art thou, Lord? And the Lord said, I am Jesus whom thou", a:"persecutest", suffix:":", d:["hatest","huntest","scourgest","fearest","lovest"]
```

### D acts9 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he trembling and astonished said, Lord, what wilt thou have me to", a:"do", suffix:"?", d:["say","be","go"]
```

Replace with:

```js
prefix:"And he trembling and astonished said, Lord, what wilt thou have me to", a:"do", suffix:"?", d:["say","be","go","suffer","hear"]
```

### D acts9 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And he was three days without sight, and neither did eat nor", a:"drink", suffix:".", d:["sleep","speak","pray"]
```

Replace with:

```js
prefix:"And he was three days without sight, and neither did eat nor", a:"drink", suffix:".", d:["sleep","speak","pray","fast","taste"]
```

### D acts9 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But the Lord said unto him, Go thy way: for he is a chosen vessel unto me, to bear my name before the Gentiles, and kings, and the children of", a:"Israel", suffix:".", d:["men","Judah","Abraham"]
```

Replace with:

```js
prefix:"But the Lord said unto him, Go thy way: for he is a chosen vessel unto me, to bear my name before the Gentiles, and kings, and the children of", a:"Israel", suffix:".", d:["men","Judah","Abraham","Levi","Benjamin"]
```

### D acts9 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And immediately there fell from his eyes as it had been", a:"scales", suffix:": and he received sight forthwith, and arose, and was baptized.", d:["dust","film","veils"]
```

Replace with:

```js
prefix:"And immediately there fell from his eyes as it had been", a:"scales", suffix:": and he received sight forthwith, and arose, and was baptized.", d:["dust","film","veils","tears","stones"]
```

### D acts9 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And straightway he preached Christ in the synagogues, that he is the Son of", a:"God", suffix:".", d:["man","David","Abraham"]
```

Replace with:

```js
prefix:"And straightway he preached Christ in the synagogues, that he is the Son of", a:"God", suffix:".", d:["man","David","Abraham","Judah","Moses"]
```

### D romans12 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living", a:"sacrifice", suffix:", holy, acceptable unto God, which is your reasonable service.", d:["offering","gift","altar"]
```

Replace with:

```js
prefix:"I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living", a:"sacrifice", suffix:", holy, acceptable unto God, which is your reasonable service.", d:["offering","gift","altar","witness","candle"]
```

### D romans12 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And be not conformed to this world: but be ye transformed by the renewing of your", a:"mind", suffix:",", d:["heart","soul","spirit"]
```

Replace with:

```js
prefix:"And be not conformed to this world: but be ye transformed by the renewing of your", a:"mind", suffix:",", d:["heart","soul","spirit","faith","understanding"]
```

### D romans12 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Let love be without dissimulation. Abhor that which is evil; cleave to that which is", a:"good", suffix:".", d:["true","holy","just"]
```

Replace with:

```js
prefix:"Let love be without dissimulation. Abhor that which is evil; cleave to that which is", a:"good", suffix:".", d:["true","holy","just","right","pure"]
```

### D romans12 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Rejoicing in hope; patient in tribulation; continuing instant in", a:"prayer", suffix:".", d:["faith","watch","fasting"]
```

Replace with:

```js
prefix:"Rejoicing in hope; patient in tribulation; continuing instant in", a:"prayer", suffix:".", d:["faith","watch","fasting","praise","charity"]
```

### D romans12 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Rejoice with them that do rejoice, and weep with them that", a:"weep", suffix:".", d:["mourn","cry","sorrow"]
```

Replace with:

```js
prefix:"Rejoice with them that do rejoice, and weep with them that", a:"weep", suffix:".", d:["mourn","cry","sorrow","laugh","sing"]
```

### D romans12 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"If it be possible, as much as lieth in you, live peaceably with all", a:"men", suffix:".", d:["people","brethren","nations"]
```

Replace with:

```js
prefix:"If it be possible, as much as lieth in you, live peaceably with all", a:"men", suffix:".", d:["people","brethren","nations","saints","things"]
```

### D romans12 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Be not overcome of evil, but overcome evil with", a:"good", suffix:".", d:["love","truth","light"]
```

Replace with:

```js
prefix:"Be not overcome of evil, but overcome evil with", a:"good", suffix:".", d:["love","truth","light","patience","meekness"]
```

### D romans12 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"For I say, through the grace given unto me, to every man that is among you, not to think of himself more highly than he ought to think; but to think", a:"soberly", suffix:",", d:["lowly","meekly","truly"]
```

Replace with:

```js
prefix:"For I say, through the grace given unto me, to every man that is among you, not to think of himself more highly than he ought to think; but to think", a:"soberly", suffix:",", d:["lowly","meekly","truly","wisely","rightly"]
```

### D philippians2 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than", a:"themselves", suffix:".", d:["himself","ourselves","yourselves"]
```

Replace with:

```js
prefix:"Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than", a:"themselves", suffix:".", d:["himself","ourselves","yourselves","those","these"]
```

### D philippians2 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Let this mind be in you, which was also in Christ", a:"Jesus", suffix:":", d:["the Lord","our Lord","Jesus Christ"]
```

Replace with:

```js
prefix:"Let this mind be in you, which was also in Christ", a:"Jesus", suffix:":", d:["the Lord","our Lord","Jesus Christ","Paul","Timothy"]
```

### D philippians2 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Who, being in the form of God, thought it not robbery to be equal with", a:"God", suffix:":", d:["the Father","heaven","man"]
```

Replace with:

```js
prefix:"Who, being in the form of God, thought it not robbery to be equal with", a:"God", suffix:":", d:["the Father","heaven","man","Abraham","Moses"]
```

### D philippians2 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But made himself of no reputation, and took upon him the form of a", a:"servant", suffix:",", d:["man","slave","son"]
```

Replace with:

```js
prefix:"But made himself of no reputation, and took upon him the form of a", a:"servant", suffix:",", d:["man","slave","son","king","prophet"]
```

### D philippians2 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And being found in fashion as a man, he humbled himself, and became obedient unto death, even the death of the", a:"cross", suffix:".", d:["tree","grave","world"]
```

Replace with:

```js
prefix:"And being found in fashion as a man, he humbled himself, and became obedient unto death, even the death of the", a:"cross", suffix:".", d:["tree","grave","world","sword","altar"]
```

### D philippians2 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Wherefore God also hath highly exalted him, and given him a name which is above every", a:"name", suffix:":", d:["power","throne","title"]
```

Replace with:

```js
prefix:"Wherefore God also hath highly exalted him, and given him a name which is above every", a:"name", suffix:":", d:["power","throne","title","kingdom","nation"]
```

### D philippians2 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"That at the name of Jesus every knee should", a:"bow", suffix:",", d:["bend","fall","kneel"]
```

Replace with:

```js
prefix:"That at the name of Jesus every knee should", a:"bow", suffix:",", d:["bend","fall","kneel","stoop","tremble"]
```

### D philippians2 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And that every tongue should confess that Jesus Christ is Lord, to the glory of God the", a:"Father", suffix:".", d:["Most High","Almighty","Holy Ghost"]
```

Replace with:

```js
prefix:"And that every tongue should confess that Jesus Christ is Lord, to the glory of God the", a:"Father", suffix:".", d:["Most High","Almighty","Holy Ghost","Son","Spirit"]
```

### D hebrews11 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Now faith is the substance of things hoped for, the evidence of things not", a:"seen", suffix:".", d:["known","held","named"]
```

Replace with:

```js
prefix:"Now faith is the substance of things hoped for, the evidence of things not", a:"seen", suffix:".", d:["known","held","named","heard","bought"]
```

### D hebrews11 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Through faith we understand that the worlds were framed by the word of", a:"God", suffix:",", d:["the LORD","his mouth","power"]
```

Replace with:

```js
prefix:"Through faith we understand that the worlds were framed by the word of", a:"God", suffix:",", d:["the LORD","his mouth","power","Christ","Moses"]
```

### D hebrews11 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek", a:"him", suffix:".", d:["thee","us","it"]
```

Replace with:

```js
prefix:"But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek", a:"him", suffix:".", d:["thee","us","it","her","all"]
```

### D hebrews11 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"By faith Noah, being warned of God of things not seen as yet, moved with fear, prepared an", a:"ark", suffix:"to the saving of his house;", d:["altar","house","tent"]
```

Replace with:

```js
prefix:"By faith Noah, being warned of God of things not seen as yet, moved with fear, prepared an", a:"ark", suffix:"to the saving of his house;", d:["altar","house","tent","vessel","ship"]
```

### D hebrews11 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"By faith Abraham, when he was called to go out into a place which he should after receive for an inheritance, obeyed; and he went out, not knowing whither he", a:"went", suffix:".", d:["came","walked","sailed"]
```

Replace with:

```js
prefix:"By faith Abraham, when he was called to go out into a place which he should after receive for an inheritance, obeyed; and he went out, not knowing whither he", a:"went", suffix:".", d:["came","walked","sailed","ran","rested"]
```

### D hebrews11 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"By faith Abraham, when he was tried, offered up", a:"Isaac", suffix:":", d:["Ishmael","his son","the lad"]
```

Replace with:

```js
prefix:"By faith Abraham, when he was tried, offered up", a:"Isaac", suffix:":", d:["Ishmael","his son","the lad","Jacob","Lot"]
```

### D hebrews11 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"By faith the harlot Rahab perished not with them that believed not, when she had received the spies with", a:"peace", suffix:".", d:["bread","wine","haste"]
```

Replace with:

```js
prefix:"By faith the harlot Rahab perished not with them that believed not, when she had received the spies with", a:"peace", suffix:".", d:["bread","wine","haste","joy","fear"]
```

### D hebrews11 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"These all died in faith, not having received the promises, but having seen them afar off, and were persuaded of them, and embraced them, and confessed that they were strangers and pilgrims on the", a:"earth", suffix:".", d:["land","way","world"]
```

Replace with:

```js
prefix:"These all died in faith, not having received the promises, but having seen them afar off, and were persuaded of them, and embraced them, and confessed that they were strangers and pilgrims on the", a:"earth", suffix:".", d:["land","way","world","sea","hills"]
```

### D james1 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"My brethren, count it all joy when ye fall into divers", a:"temptations", suffix:";", d:["trials","troubles","sorrows"]
```

Replace with:

```js
prefix:"My brethren, count it all joy when ye fall into divers", a:"temptations", suffix:";", d:["trials","troubles","sorrows","snares","pleasures"]
```

### D james1 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Knowing this, that the trying of your faith worketh", a:"patience", suffix:".", d:["hope","peace","strength"]
```

Replace with:

```js
prefix:"Knowing this, that the trying of your faith worketh", a:"patience", suffix:".", d:["hope","peace","strength","joy","courage"]
```

### D james1 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given", a:"him", suffix:".", d:["thee","you","them"]
```

Replace with:

```js
prefix:"If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given", a:"him", suffix:".", d:["thee","you","them","me","us"]
```

### D james1 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of", a:"life", suffix:",", d:["glory","righteousness","joy"]
```

Replace with:

```js
prefix:"Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of", a:"life", suffix:",", d:["glory","righteousness","joy","honour","gold"]
```

### D james1 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Every good gift and every perfect gift is from above, and cometh down from the Father of", a:"lights", suffix:",", d:["spirits","glory","heaven"]
```

Replace with:

```js
prefix:"Every good gift and every perfect gift is from above, and cometh down from the Father of", a:"lights", suffix:",", d:["spirits","glory","heaven","mercies","stars"]
```

### D james1 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to", a:"wrath", suffix:":", d:["anger","judge","strife"]
```

Replace with:

```js
prefix:"Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to", a:"wrath", suffix:":", d:["anger","judge","strife","sin","pride"]
```

### D james1 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"But be ye doers of the word, and not hearers only, deceiving your own", a:"selves", suffix:".", d:["hearts","souls","minds"]
```

Replace with:

```js
prefix:"But be ye doers of the word, and not hearers only, deceiving your own", a:"selves", suffix:".", d:["hearts","souls","minds","eyes","gods"]
```

### D james1 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction, and to keep himself unspotted from the", a:"world", suffix:".", d:["flesh","evil","age"]
```

Replace with:

```js
prefix:"Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction, and to keep himself unspotted from the", a:"world", suffix:".", d:["flesh","evil","age","sin","devil"]
```

### D firstjohn4 blank 0 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth", a:"God", suffix:".", d:["truth","light","life"]
```

Replace with:

```js
prefix:"Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth", a:"God", suffix:".", d:["truth","light","life","Christ","Jesus"]
```

### D firstjohn4 blank 1 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"He that loveth not knoweth not God; for God is", a:"love", suffix:".", d:["light","life","truth"]
```

Replace with:

```js
prefix:"He that loveth not knoweth not God; for God is", a:"love", suffix:".", d:["light","life","truth","spirit","power"]
```

### D firstjohn4 blank 2 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"In this was manifested the love of God toward us, because that God sent his only begotten Son into the world, that we might live through", a:"him", suffix:".", d:["Christ","Jesus","the Word"]
```

Replace with:

```js
prefix:"In this was manifested the love of God toward us, because that God sent his only begotten Son into the world, that we might live through", a:"him", suffix:".", d:["Christ","Jesus","the Word","it","them"]
```

### D firstjohn4 blank 3 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"Herein is love, not that we loved God, but that he loved us, and sent his Son to be the propitiation for our", a:"sins", suffix:".", d:["souls","guilt","death"]
```

Replace with:

```js
prefix:"Herein is love, not that we loved God, but that he loved us, and sent his Son to be the propitiation for our", a:"sins", suffix:".", d:["souls","guilt","death","burdens","wages"]
```

### D firstjohn4 blank 4 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"There is no fear in love; but perfect love casteth out", a:"fear", suffix:":", d:["death","hate","doubt"]
```

Replace with:

```js
prefix:"There is no fear in love; but perfect love casteth out", a:"fear", suffix:":", d:["death","hate","doubt","pain","sin"]
```

### D firstjohn4 blank 5 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"We love him, because he first loved", a:"us", suffix:".", d:["me","thee","them"]
```

Replace with:

```js
prefix:"We love him, because he first loved", a:"us", suffix:".", d:["me","thee","them","you","all"]
```

### D firstjohn4 blank 6 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"And we have known and believed the love that God hath to us. God is love; and he that dwelleth in love dwelleth in God, and God in", a:"him", suffix:".", d:["us","them","thee"]
```

Replace with:

```js
prefix:"And we have known and believed the love that God hath to us. God is love; and he that dwelleth in love dwelleth in God, and God in", a:"him", suffix:".", d:["us","them","thee","me","it"]
```

### D firstjohn4 blank 7 gains two decoys (js/tablets-hall.js)  (`js/tablets-hall.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
prefix:"That he who loveth God love his", a:"brother", suffix:"also.", d:["neighbour","friend","enemy"]
```

Replace with:

```js
prefix:"That he who loveth God love his", a:"brother", suffix:"also.", d:["neighbour","friend","enemy","sister","father"]
```

### D genesis2 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And on the seventh day God ended his work which he had made; and he",
        "a": "rested",
        "suffix": "on the seventh day from all his work which he had made.",
        "d": [
          "slept",
          "stayed",
          "stopped"
        ]
```

Replace with:

```js
"prefix": "And on the seventh day God ended his work which he had made; and he",
        "a": "rested",
        "suffix": "on the seventh day from all his work which he had made.",
        "d": [
          "slept",
          "stayed",
          "stopped",
          "blessed",
          "walked"
        ]
```

### D genesis2 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And God",
        "a": "blessed",
        "suffix": "the seventh day, and sanctified it: because that in it he had rested from all his work",
        "d": [
          "made",
          "kept",
          "named"
        ]
```

Replace with:

```js
"prefix": "And God",
        "a": "blessed",
        "suffix": "the seventh day, and sanctified it: because that in it he had rested from all his work",
        "d": [
          "made",
          "kept",
          "named",
          "finished",
          "loved"
        ]
```

### D genesis2 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of",
        "a": "life",
        "suffix": "; and man became a living soul.",
        "d": [
          "air",
          "spirit",
          "days"
        ]
```

Replace with:

```js
"prefix": "And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of",
        "a": "life",
        "suffix": "; and man became a living soul.",
        "d": [
          "air",
          "spirit",
          "days",
          "heaven",
          "wind"
        ]
```

### D genesis2 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the LORD God planted a garden eastward in",
        "a": "Eden",
        "suffix": "; and there he put the man whom he had formed.",
        "d": [
          "Zion",
          "Ur",
          "Shinar"
        ]
```

Replace with:

```js
"prefix": "And the LORD God planted a garden eastward in",
        "a": "Eden",
        "suffix": "; and there he put the man whom he had formed.",
        "d": [
          "Zion",
          "Ur",
          "Shinar",
          "Gilead",
          "Carmel"
        ]
```

### D genesis2 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And out of the ground made the LORD God to grow every tree that is pleasant to the sight, and good for",
        "a": "food",
        "suffix": "; the tree of life also in the midst of the garden,",
        "d": [
          "fruit",
          "meat",
          "shade"
        ]
```

Replace with:

```js
"prefix": "And out of the ground made the LORD God to grow every tree that is pleasant to the sight, and good for",
        "a": "food",
        "suffix": "; the tree of life also in the midst of the garden,",
        "d": [
          "fruit",
          "meat",
          "shade",
          "drink",
          "use"
        ]
```

### D genesis2 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the LORD God took the man, and put him into the garden of Eden to dress it and to",
        "a": "keep",
        "suffix": "it.",
        "d": [
          "till",
          "watch",
          "hold"
        ]
```

Replace with:

```js
"prefix": "And the LORD God took the man, and put him into the garden of Eden to dress it and to",
        "a": "keep",
        "suffix": "it.",
        "d": [
          "till",
          "watch",
          "hold",
          "guard",
          "water"
        ]
```

### D genesis2 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the LORD God said, It is not good that the man should be",
        "a": "alone",
        "suffix": "; I will make him an help meet for him.",
        "d": [
          "afraid",
          "idle",
          "silent"
        ]
```

Replace with:

```js
"prefix": "And the LORD God said, It is not good that the man should be",
        "a": "alone",
        "suffix": "; I will make him an help meet for him.",
        "d": [
          "afraid",
          "idle",
          "silent",
          "naked",
          "wise"
        ]
```

### D genesis2 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore shall a man leave his father and his mother, and shall cleave unto his",
        "a": "wife",
        "suffix": ": and they shall be one flesh.",
        "d": [
          "house",
          "people",
          "God"
        ]
```

Replace with:

```js
"prefix": "Therefore shall a man leave his father and his mother, and shall cleave unto his",
        "a": "wife",
        "suffix": ": and they shall be one flesh.",
        "d": [
          "house",
          "people",
          "God",
          "son",
          "brother"
        ]
```

### D genesis6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But Noah found",
        "a": "grace",
        "suffix": "in the eyes of the LORD.",
        "d": [
          "favour",
          "mercy",
          "peace"
        ]
```

Replace with:

```js
"prefix": "But Noah found",
        "a": "grace",
        "suffix": "in the eyes of the LORD.",
        "d": [
          "favour",
          "mercy",
          "peace",
          "rest",
          "fault"
        ]
```

### D genesis6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Noah was a just man and",
        "a": "perfect",
        "suffix": "in his generations, and Noah walked with God.",
        "d": [
          "holy",
          "humble",
          "faithful"
        ]
```

Replace with:

```js
"prefix": "Noah was a just man and",
        "a": "perfect",
        "suffix": "in his generations, and Noah walked with God.",
        "d": [
          "holy",
          "humble",
          "faithful",
          "wise",
          "strong"
        ]
```

### D genesis6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And God said unto Noah, The end of all flesh is come before me; for the earth is filled with",
        "a": "violence",
        "suffix": "through them; and, behold, I will destroy them with the earth.",
        "d": [
          "blood",
          "wickedness",
          "pride"
        ]
```

Replace with:

```js
"prefix": "And God said unto Noah, The end of all flesh is come before me; for the earth is filled with",
        "a": "violence",
        "suffix": "through them; and, behold, I will destroy them with the earth.",
        "d": [
          "blood",
          "wickedness",
          "pride",
          "sin",
          "idols"
        ]
```

### D genesis6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Make thee an ark of gopher",
        "a": "wood",
        "suffix": "; rooms shalt thou make in the ark, and shalt pitch it within and without with pitch.",
        "d": [
          "cedar",
          "stone",
          "reed"
        ]
```

Replace with:

```js
"prefix": "Make thee an ark of gopher",
        "a": "wood",
        "suffix": "; rooms shalt thou make in the ark, and shalt pitch it within and without with pitch.",
        "d": [
          "cedar",
          "stone",
          "reed",
          "brass",
          "gold"
        ]
```

### D genesis6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "A window shalt thou make to the ark, and in a cubit shalt thou finish it above; and the door of the ark shalt thou set in the",
        "a": "side",
        "suffix": "thereof; with lower, second, and third stories shalt thou make it.",
        "d": [
          "end",
          "roof",
          "front"
        ]
```

Replace with:

```js
"prefix": "A window shalt thou make to the ark, and in a cubit shalt thou finish it above; and the door of the ark shalt thou set in the",
        "a": "side",
        "suffix": "thereof; with lower, second, and third stories shalt thou make it.",
        "d": [
          "end",
          "roof",
          "front",
          "midst",
          "ground"
        ]
```

### D genesis6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But with thee will I establish my",
        "a": "covenant",
        "suffix": "; and thou shalt come into the ark, thou, and thy sons, and thy wife, and thy sons' wives with thee.",
        "d": [
          "promise",
          "word",
          "peace"
        ]
```

Replace with:

```js
"prefix": "But with thee will I establish my",
        "a": "covenant",
        "suffix": "; and thou shalt come into the ark, thou, and thy sons, and thy wife, and thy sons' wives with thee.",
        "d": [
          "promise",
          "word",
          "peace",
          "oath",
          "statute"
        ]
```

### D genesis6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And of every living thing of all flesh, two of every",
        "a": "sort",
        "suffix": "shalt thou bring into the ark, to keep them alive with thee;",
        "d": [
          "kind",
          "one",
          "beast"
        ]
```

Replace with:

```js
"prefix": "And of every living thing of all flesh, two of every",
        "a": "sort",
        "suffix": "shalt thou bring into the ark, to keep them alive with thee;",
        "d": [
          "kind",
          "one",
          "beast",
          "creature",
          "fowl"
        ]
```

### D genesis6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thus",
        "a": "did",
        "suffix": "Noah; according to all that God commanded him, so did he.",
        "d": [
          "built",
          "went",
          "said"
        ]
```

Replace with:

```js
"prefix": "Thus",
        "a": "did",
        "suffix": "Noah; according to all that God commanded him, so did he.",
        "d": [
          "built",
          "went",
          "said",
          "wrought",
          "dwelt"
        ]
```

### D genesis7 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the LORD said unto Noah, Come thou and all thy house into the",
        "a": "ark",
        "suffix": "; for thee have I seen righteous before me in this generation.",
        "d": [
          "garden",
          "ship",
          "tent"
        ]
```

Replace with:

```js
"prefix": "And the LORD said unto Noah, Come thou and all thy house into the",
        "a": "ark",
        "suffix": "; for thee have I seen righteous before me in this generation.",
        "d": [
          "garden",
          "ship",
          "tent",
          "vessel",
          "city"
        ]
```

### D genesis7 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For yet seven days, and I will cause it to rain upon the earth forty",
        "a": "days",
        "suffix": "and forty nights; and every living substance that I have made will I destroy from off the face of the earth.",
        "d": [
          "years",
          "nights",
          "hours"
        ]
```

Replace with:

```js
"prefix": "For yet seven days, and I will cause it to rain upon the earth forty",
        "a": "days",
        "suffix": "and forty nights; and every living substance that I have made will I destroy from off the face of the earth.",
        "d": [
          "years",
          "nights",
          "hours",
          "months",
          "moons"
        ]
```

### D genesis7 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Noah did according unto all that the LORD commanded",
        "a": "him",
        "suffix": ".",
        "d": [
          "them",
          "God",
          "Moses"
        ]
```

Replace with:

```js
"prefix": "And Noah did according unto all that the LORD commanded",
        "a": "him",
        "suffix": ".",
        "d": [
          "them",
          "God",
          "Moses",
          "thee",
          "us"
        ]
```

### D genesis7 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the rain was upon the earth forty days and forty",
        "a": "nights",
        "suffix": ".",
        "d": [
          "years",
          "weeks",
          "storms"
        ]
```

Replace with:

```js
"prefix": "And the rain was upon the earth forty days and forty",
        "a": "nights",
        "suffix": ".",
        "d": [
          "years",
          "weeks",
          "storms",
          "moons",
          "ages"
        ]
```

### D genesis7 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they went in, went in male and female of all flesh, as God had commanded him: and the LORD shut him",
        "a": "in",
        "suffix": ".",
        "d": [
          "out",
          "up",
          "safe"
        ]
```

Replace with:

```js
"prefix": "And they went in, went in male and female of all flesh, as God had commanded him: and the LORD shut him",
        "a": "in",
        "suffix": ".",
        "d": [
          "out",
          "up",
          "safe",
          "away",
          "fast"
        ]
```

### D genesis7 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Fifteen cubits upward did the waters",
        "a": "prevail",
        "suffix": "; and the mountains were covered.",
        "d": [
          "rise",
          "grow",
          "stand"
        ]
```

Replace with:

```js
"prefix": "Fifteen cubits upward did the waters",
        "a": "prevail",
        "suffix": "; and the mountains were covered.",
        "d": [
          "rise",
          "grow",
          "stand",
          "increase",
          "overflow"
        ]
```

### D genesis7 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And every living substance was destroyed which was upon the face of the ground, both man, and cattle, and the creeping things, and the fowl of the heaven; and Noah only remained",
        "a": "alive",
        "suffix": ", and they that were with him in the ark.",
        "d": [
          "safe",
          "there",
          "whole"
        ]
```

Replace with:

```js
"prefix": "And every living substance was destroyed which was upon the face of the ground, both man, and cattle, and the creeping things, and the fowl of the heaven; and Noah only remained",
        "a": "alive",
        "suffix": ", and they that were with him in the ark.",
        "d": [
          "safe",
          "there",
          "whole",
          "sound",
          "quiet"
        ]
```

### D genesis7 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the waters prevailed upon the earth an hundred and fifty",
        "a": "days",
        "suffix": ".",
        "d": [
          "nights",
          "years",
          "weeks"
        ]
```

Replace with:

```js
"prefix": "And the waters prevailed upon the earth an hundred and fifty",
        "a": "days",
        "suffix": ".",
        "d": [
          "nights",
          "years",
          "weeks",
          "months",
          "ages"
        ]
```

### D genesis18 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he lift up his eyes and looked, and, lo, three",
        "a": "men",
        "suffix": "stood by him: and when he saw them, he ran to meet them from the tent door,",
        "d": [
          "angels",
          "voices",
          "strangers"
        ]
```

Replace with:

```js
"prefix": "And he lift up his eyes and looked, and, lo, three",
        "a": "men",
        "suffix": "stood by him: and when he saw them, he ran to meet them from the tent door,",
        "d": [
          "angels",
          "voices",
          "strangers",
          "kings",
          "elders"
        ]
```

### D genesis18 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Let a little water, I pray you, be fetched, and wash your",
        "a": "feet",
        "suffix": ", and rest yourselves under the tree:",
        "d": [
          "hands",
          "face",
          "head"
        ]
```

Replace with:

```js
"prefix": "Let a little water, I pray you, be fetched, and wash your",
        "a": "feet",
        "suffix": ", and rest yourselves under the tree:",
        "d": [
          "hands",
          "face",
          "head",
          "eyes",
          "garments"
        ]
```

### D genesis18 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I will certainly return unto thee according to the time of life; and, lo, Sarah thy wife shall have a",
        "a": "son",
        "suffix": ". And Sarah heard it in the tent door, which was behind him.",
        "d": [
          "child",
          "seed",
          "daughter"
        ]
```

Replace with:

```js
"prefix": "I will certainly return unto thee according to the time of life; and, lo, Sarah thy wife shall have a",
        "a": "son",
        "suffix": ". And Sarah heard it in the tent door, which was behind him.",
        "d": [
          "child",
          "seed",
          "daughter",
          "heir",
          "servant"
        ]
```

### D genesis18 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore Sarah laughed within herself, saying, After I am waxed old shall I have",
        "a": "pleasure",
        "suffix": ", my lord being old also?",
        "d": [
          "rest",
          "a child",
          "joy"
        ]
```

Replace with:

```js
"prefix": "Therefore Sarah laughed within herself, saying, After I am waxed old shall I have",
        "a": "pleasure",
        "suffix": ", my lord being old also?",
        "d": [
          "rest",
          "a child",
          "joy",
          "strength",
          "riches"
        ]
```

### D genesis18 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Is any thing too",
        "a": "hard",
        "suffix": "for the LORD? At the time appointed I will return unto thee, according to the time of life, and Sarah shall have a son.",
        "d": [
          "great",
          "hidden",
          "far"
        ]
```

Replace with:

```js
"prefix": "Is any thing too",
        "a": "hard",
        "suffix": "for the LORD? At the time appointed I will return unto thee, according to the time of life, and Sarah shall have a son.",
        "d": [
          "great",
          "hidden",
          "far",
          "strange",
          "high"
        ]
```

### D genesis18 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For I know him, that he will command his children and his household after him, and they shall keep the way of the LORD, to do",
        "a": "justice",
        "suffix": "and judgment; that the LORD may bring upon Abraham that which he hath spoken of him.",
        "d": [
          "mercy",
          "truth",
          "good"
        ]
```

Replace with:

```js
"prefix": "For I know him, that he will command his children and his household after him, and they shall keep the way of the LORD, to do",
        "a": "justice",
        "suffix": "and judgment; that the LORD may bring upon Abraham that which he hath spoken of him.",
        "d": [
          "mercy",
          "truth",
          "good",
          "evil",
          "service"
        ]
```

### D genesis18 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "That be far from thee to do after this manner, to slay the righteous with the wicked: Shall not the Judge of all the earth do",
        "a": "right",
        "suffix": "?",
        "d": [
          "just",
          "well",
          "thus"
        ]
```

Replace with:

```js
"prefix": "That be far from thee to do after this manner, to slay the righteous with the wicked: Shall not the Judge of all the earth do",
        "a": "right",
        "suffix": "?",
        "d": [
          "just",
          "well",
          "thus",
          "wrong",
          "good"
        ]
```

### D genesis18 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Peradventure ten shall be found there. And he said, I will not destroy it for",
        "a": "ten",
        "suffix": "'s sake.",
        "d": [
          "their",
          "one",
          "pity"
        ]
```

Replace with:

```js
"prefix": "Peradventure ten shall be found there. And he said, I will not destroy it for",
        "a": "ten",
        "suffix": "'s sake.",
        "d": [
          "their",
          "one",
          "pity",
          "fifty",
          "twenty"
        ]
```

### D genesis28 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he dreamed, and behold a ladder set up on the earth, and the top of it reached to",
        "a": "heaven",
        "suffix": ": and behold the angels of God ascending and descending on it.",
        "d": [
          "sky",
          "Zion",
          "light"
        ]
```

Replace with:

```js
"prefix": "And he dreamed, and behold a ladder set up on the earth, and the top of it reached to",
        "a": "heaven",
        "suffix": ": and behold the angels of God ascending and descending on it.",
        "d": [
          "sky",
          "Zion",
          "light",
          "clouds",
          "stars"
        ]
```

### D genesis28 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And, behold, the LORD stood above it, and said, I am the LORD God of Abraham thy father, and the God of",
        "a": "Isaac",
        "suffix": ": the land whereon thou liest, to thee will I give it, and to thy seed;",
        "d": [
          "Jacob",
          "Israel",
          "Sarah"
        ]
```

Replace with:

```js
"prefix": "And, behold, the LORD stood above it, and said, I am the LORD God of Abraham thy father, and the God of",
        "a": "Isaac",
        "suffix": ": the land whereon thou liest, to thee will I give it, and to thy seed;",
        "d": [
          "Jacob",
          "Israel",
          "Sarah",
          "Esau",
          "Ishmael"
        ]
```

### D genesis28 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And, behold, I am with",
        "a": "thee",
        "suffix": ", and will keep thee in all places whither thou goest, and will bring thee again into this land; for I will not leave thee, until I have done that which I have spoken to thee of.",
        "d": [
          "him",
          "us",
          "Israel"
        ]
```

Replace with:

```js
"prefix": "And, behold, I am with",
        "a": "thee",
        "suffix": ", and will keep thee in all places whither thou goest, and will bring thee again into this land; for I will not leave thee, until I have done that which I have spoken to thee of.",
        "d": [
          "him",
          "us",
          "Israel",
          "you",
          "me"
        ]
```

### D genesis28 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Jacob awaked out of his sleep, and he said, Surely the LORD is in this",
        "a": "place",
        "suffix": "; and I knew it not.",
        "d": [
          "house",
          "land",
          "dream"
        ]
```

Replace with:

```js
"prefix": "And Jacob awaked out of his sleep, and he said, Surely the LORD is in this",
        "a": "place",
        "suffix": "; and I knew it not.",
        "d": [
          "house",
          "land",
          "dream",
          "temple",
          "city"
        ]
```

### D genesis28 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he was afraid, and said, How",
        "a": "dreadful",
        "suffix": "is this place! this is none other but the house of God, and this is the gate of heaven.",
        "d": [
          "holy",
          "strange",
          "great"
        ]
```

Replace with:

```js
"prefix": "And he was afraid, and said, How",
        "a": "dreadful",
        "suffix": "is this place! this is none other but the house of God, and this is the gate of heaven.",
        "d": [
          "holy",
          "strange",
          "great",
          "fair",
          "solemn"
        ]
```

### D genesis28 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Jacob rose up early in the morning, and took the stone that he had put for his pillows, and set it up for a",
        "a": "pillar",
        "suffix": ", and poured oil upon the top of it.",
        "d": [
          "altar",
          "mark",
          "heap"
        ]
```

Replace with:

```js
"prefix": "And Jacob rose up early in the morning, and took the stone that he had put for his pillows, and set it up for a",
        "a": "pillar",
        "suffix": ", and poured oil upon the top of it.",
        "d": [
          "altar",
          "mark",
          "heap",
          "memorial",
          "witness"
        ]
```

### D genesis28 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he called the name of that place",
        "a": "Bethel",
        "suffix": ": but the name of that city was called Luz at the first.",
        "d": [
          "Peniel",
          "Shiloh",
          "Mizpah"
        ]
```

Replace with:

```js
"prefix": "And he called the name of that place",
        "a": "Bethel",
        "suffix": ": but the name of that city was called Luz at the first.",
        "d": [
          "Peniel",
          "Shiloh",
          "Mizpah",
          "Hebron",
          "Gilgal"
        ]
```

### D genesis28 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And this stone, which I have set for a pillar, shall be God's",
        "a": "house",
        "suffix": ": and of all that thou shalt give me I will surely give the tenth unto thee.",
        "d": [
          "altar",
          "field",
          "land"
        ]
```

Replace with:

```js
"prefix": "And this stone, which I have set for a pillar, shall be God's",
        "a": "house",
        "suffix": ": and of all that thou shalt give me I will surely give the tenth unto thee.",
        "d": [
          "altar",
          "field",
          "land",
          "tabernacle",
          "temple"
        ]
```

### D exodus3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the angel of the LORD appeared unto him in a flame of fire out of the midst of a",
        "a": "bush",
        "suffix": ": and he looked, and, behold, the bush burned with fire, and the bush was not consumed.",
        "d": [
          "cloud",
          "tree",
          "rock"
        ]
```

Replace with:

```js
"prefix": "And the angel of the LORD appeared unto him in a flame of fire out of the midst of a",
        "a": "bush",
        "suffix": ": and he looked, and, behold, the bush burned with fire, and the bush was not consumed.",
        "d": [
          "cloud",
          "tree",
          "rock",
          "thicket",
          "stone"
        ]
```

### D exodus3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And when the LORD saw that he turned aside to see, God called unto him out of the midst of the bush, and said,",
        "a": "Moses",
        "suffix": ", Moses. And he said, Here am I.",
        "d": [
          "Aaron",
          "Abraham",
          "master"
        ]
```

Replace with:

```js
"prefix": "And when the LORD saw that he turned aside to see, God called unto him out of the midst of the bush, and said,",
        "a": "Moses",
        "suffix": ", Moses. And he said, Here am I.",
        "d": [
          "Aaron",
          "Abraham",
          "master",
          "Samuel",
          "Joshua"
        ]
```

### D exodus3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Put off thy shoes from off thy feet, for the place whereon thou standest is",
        "a": "holy",
        "suffix": "ground.",
        "d": [
          "clean",
          "set",
          "blessed"
        ]
```

Replace with:

```js
"prefix": "Put off thy shoes from off thy feet, for the place whereon thou standest is",
        "a": "holy",
        "suffix": "ground.",
        "d": [
          "clean",
          "set",
          "blessed",
          "burning",
          "barren"
        ]
```

### D exodus3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am the God of thy father, the God of Abraham, the God of Isaac, and the God of",
        "a": "Jacob",
        "suffix": ". And Moses hid his face; for he was afraid to look upon God.",
        "d": [
          "Israel",
          "Joseph",
          "David"
        ]
```

Replace with:

```js
"prefix": "I am the God of thy father, the God of Abraham, the God of Isaac, and the God of",
        "a": "Jacob",
        "suffix": ". And Moses hid his face; for he was afraid to look upon God.",
        "d": [
          "Israel",
          "Joseph",
          "David",
          "Esau",
          "Ishmael"
        ]
```

### D exodus3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I have surely seen the affliction of my people which are in Egypt, and have heard their cry by reason of their",
        "a": "taskmasters",
        "suffix": "; for I know their sorrows;",
        "d": [
          "burdens",
          "enemies",
          "sorrows"
        ]
```

Replace with:

```js
"prefix": "I have surely seen the affliction of my people which are in Egypt, and have heard their cry by reason of their",
        "a": "taskmasters",
        "suffix": "; for I know their sorrows;",
        "d": [
          "burdens",
          "enemies",
          "sorrows",
          "chariots",
          "idols"
        ]
```

### D exodus3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And I am come down to deliver them out of the hand of the Egyptians, and to bring them up out of that land unto a good land and a",
        "a": "large",
        "suffix": ", unto a land flowing with milk and honey;",
        "d": [
          "wide",
          "rich",
          "free"
        ]
```

Replace with:

```js
"prefix": "And I am come down to deliver them out of the hand of the Egyptians, and to bring them up out of that land unto a good land and a",
        "a": "large",
        "suffix": ", unto a land flowing with milk and honey;",
        "d": [
          "wide",
          "rich",
          "free",
          "fair",
          "pleasant"
        ]
```

### D exodus3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Come now therefore, and I will send thee unto Pharaoh, that thou mayest bring forth my people the children of",
        "a": "Israel",
        "suffix": "out of Egypt.",
        "d": [
          "Jacob",
          "Judah",
          "Abraham"
        ]
```

Replace with:

```js
"prefix": "Come now therefore, and I will send thee unto Pharaoh, that thou mayest bring forth my people the children of",
        "a": "Israel",
        "suffix": "out of Egypt.",
        "d": [
          "Jacob",
          "Judah",
          "Abraham",
          "Levi",
          "Joseph"
        ]
```

### D exodus3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath",
        "a": "sent",
        "suffix": "me unto you.",
        "d": [
          "called",
          "made",
          "kept"
        ]
```

Replace with:

```js
"prefix": "And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath",
        "a": "sent",
        "suffix": "me unto you.",
        "d": [
          "called",
          "made",
          "kept",
          "brought",
          "led"
        ]
```

### D exodus15 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then sang Moses and the children of Israel this",
        "a": "song",
        "suffix": "unto the LORD, and spake, saying, I will sing unto the LORD, for he hath triumphed gloriously: the horse and his rider hath he thrown into the sea.",
        "d": [
          "psalm",
          "prayer",
          "word"
        ]
```

Replace with:

```js
"prefix": "Then sang Moses and the children of Israel this",
        "a": "song",
        "suffix": "unto the LORD, and spake, saying, I will sing unto the LORD, for he hath triumphed gloriously: the horse and his rider hath he thrown into the sea.",
        "d": [
          "psalm",
          "prayer",
          "word",
          "mourning",
          "dance"
        ]
```

### D exodus15 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD is my",
        "a": "strength",
        "suffix": "and song, and he is become my salvation: he is my God, and I will prepare him an habitation;",
        "d": [
          "shield",
          "refuge",
          "tower"
        ]
```

Replace with:

```js
"prefix": "The LORD is my",
        "a": "strength",
        "suffix": "and song, and he is become my salvation: he is my God, and I will prepare him an habitation;",
        "d": [
          "shield",
          "refuge",
          "tower",
          "glory",
          "fortress"
        ]
```

### D exodus15 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD is a man of",
        "a": "war",
        "suffix": ": the LORD is his name.",
        "d": [
          "battle",
          "power",
          "mercy"
        ]
```

Replace with:

```js
"prefix": "The LORD is a man of",
        "a": "war",
        "suffix": ": the LORD is his name.",
        "d": [
          "battle",
          "power",
          "mercy",
          "sorrows",
          "peace"
        ]
```

### D exodus15 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thy right hand, O LORD, is become glorious in",
        "a": "power",
        "suffix": ": thy right hand, O LORD, hath dashed in pieces the enemy.",
        "d": [
          "anger",
          "might",
          "war"
        ]
```

Replace with:

```js
"prefix": "Thy right hand, O LORD, is become glorious in",
        "a": "power",
        "suffix": ": thy right hand, O LORD, hath dashed in pieces the enemy.",
        "d": [
          "anger",
          "might",
          "war",
          "majesty",
          "holiness"
        ]
```

### D exodus15 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who is like unto thee, O LORD, among the gods? who is like thee,",
        "a": "glorious",
        "suffix": "in holiness, fearful in praises, doing wonders?",
        "d": [
          "holy",
          "mighty",
          "radiant"
        ]
```

Replace with:

```js
"prefix": "Who is like unto thee, O LORD, among the gods? who is like thee,",
        "a": "glorious",
        "suffix": "in holiness, fearful in praises, doing wonders?",
        "d": [
          "holy",
          "mighty",
          "radiant",
          "terrible",
          "righteous"
        ]
```

### D exodus15 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou in thy mercy hast led forth the people which thou hast",
        "a": "redeemed",
        "suffix": ": thou hast guided them in thy strength unto thy holy habitation.",
        "d": [
          "chosen",
          "saved",
          "gathered"
        ]
```

Replace with:

```js
"prefix": "Thou in thy mercy hast led forth the people which thou hast",
        "a": "redeemed",
        "suffix": ": thou hast guided them in thy strength unto thy holy habitation.",
        "d": [
          "chosen",
          "saved",
          "gathered",
          "forgiven",
          "remembered"
        ]
```

### D exodus15 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Fear and dread shall fall upon them; by the greatness of thine arm they shall be as still as a",
        "a": "stone",
        "suffix": "; till thy people pass over, O LORD, till the people pass over, which thou hast purchased.",
        "d": [
          "rock",
          "wall",
          "grave"
        ]
```

Replace with:

```js
"prefix": "Fear and dread shall fall upon them; by the greatness of thine arm they shall be as still as a",
        "a": "stone",
        "suffix": "; till thy people pass over, O LORD, till the people pass over, which thou hast purchased.",
        "d": [
          "rock",
          "wall",
          "grave",
          "pillar",
          "sea"
        ]
```

### D exodus15 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD shall",
        "a": "reign",
        "suffix": "for ever and ever.",
        "d": [
          "rule",
          "judge",
          "stand"
        ]
```

Replace with:

```js
"prefix": "The LORD shall",
        "a": "reign",
        "suffix": "for ever and ever.",
        "d": [
          "rule",
          "judge",
          "stand",
          "sing",
          "rest"
        ]
```

### D numbers6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Speak unto Aaron and unto his sons, saying, On this wise ye shall bless the children of",
        "a": "Israel",
        "suffix": ", saying unto them,",
        "d": [
          "Jacob",
          "Judah",
          "Levi"
        ]
```

Replace with:

```js
"prefix": "Speak unto Aaron and unto his sons, saying, On this wise ye shall bless the children of",
        "a": "Israel",
        "suffix": ", saying unto them,",
        "d": [
          "Jacob",
          "Judah",
          "Levi",
          "Abraham",
          "Joseph"
        ]
```

### D numbers6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "All the days of the vow of his separation there shall no",
        "a": "razor",
        "suffix": "come upon his head: until the days be fulfilled, in the which he separateth himself unto the LORD, he shall be holy,",
        "d": [
          "iron",
          "blade",
          "hand"
        ]
```

Replace with:

```js
"prefix": "All the days of the vow of his separation there shall no",
        "a": "razor",
        "suffix": "come upon his head: until the days be fulfilled, in the which he separateth himself unto the LORD, he shall be holy,",
        "d": [
          "iron",
          "blade",
          "hand",
          "sword",
          "dew"
        ]
```

### D numbers6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "All the days that he separateth himself unto the LORD he shall come at no dead",
        "a": "body",
        "suffix": ".",
        "d": [
          "grave",
          "place",
          "man"
        ]
```

Replace with:

```js
"prefix": "All the days that he separateth himself unto the LORD he shall come at no dead",
        "a": "body",
        "suffix": ".",
        "d": [
          "grave",
          "place",
          "man",
          "soul",
          "beast"
        ]
```

### D numbers6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "All the days of his separation he is",
        "a": "holy",
        "suffix": "unto the LORD.",
        "d": [
          "clean",
          "given",
          "sealed"
        ]
```

Replace with:

```js
"prefix": "All the days of his separation he is",
        "a": "holy",
        "suffix": "unto the LORD.",
        "d": [
          "clean",
          "given",
          "sealed",
          "vowed",
          "faithful"
        ]
```

### D numbers6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD",
        "a": "bless",
        "suffix": "thee, and keep thee:",
        "d": [
          "keep",
          "love",
          "guard"
        ]
```

Replace with:

```js
"prefix": "The LORD",
        "a": "bless",
        "suffix": "thee, and keep thee:",
        "d": [
          "keep",
          "love",
          "guard",
          "guide",
          "defend"
        ]
```

### D numbers6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD make his face shine upon",
        "a": "thee",
        "suffix": ", and be gracious unto thee:",
        "d": [
          "us",
          "me",
          "them"
        ]
```

Replace with:

```js
"prefix": "The LORD make his face shine upon",
        "a": "thee",
        "suffix": ", and be gracious unto thee:",
        "d": [
          "us",
          "me",
          "them",
          "him",
          "you"
        ]
```

### D numbers6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD lift up his countenance upon thee, and give thee",
        "a": "peace",
        "suffix": ".",
        "d": [
          "rest",
          "joy",
          "grace"
        ]
```

Replace with:

```js
"prefix": "The LORD lift up his countenance upon thee, and give thee",
        "a": "peace",
        "suffix": ".",
        "d": [
          "rest",
          "joy",
          "grace",
          "favour",
          "life"
        ]
```

### D numbers6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they shall put my name upon the children of Israel; and I will",
        "a": "bless",
        "suffix": "them.",
        "d": [
          "keep",
          "hear",
          "honour"
        ]
```

Replace with:

```js
"prefix": "And they shall put my name upon the children of Israel; and I will",
        "a": "bless",
        "suffix": "them.",
        "d": [
          "keep",
          "hear",
          "honour",
          "curse",
          "lead"
        ]
```

### D joshua6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I have given into thine hand",
        "a": "Jericho",
        "suffix": ", and the king thereof, and the mighty men of valour.",
        "d": [
          "Ai",
          "Canaan",
          "Gibeon"
        ]
```

Replace with:

```js
"prefix": "I have given into thine hand",
        "a": "Jericho",
        "suffix": ", and the king thereof, and the mighty men of valour.",
        "d": [
          "Ai",
          "Canaan",
          "Gibeon",
          "Gilgal",
          "Shechem"
        ]
```

### D joshua6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And seven",
        "a": "priests",
        "suffix": "shall bear before the ark seven trumpets of rams' horns: and the seventh day ye shall compass the city seven times,",
        "d": [
          "levites",
          "soldiers",
          "men"
        ]
```

Replace with:

```js
"prefix": "And seven",
        "a": "priests",
        "suffix": "shall bear before the ark seven trumpets of rams' horns: and the seventh day ye shall compass the city seven times,",
        "d": [
          "levites",
          "soldiers",
          "men",
          "elders",
          "prophets"
        ]
```

### D joshua6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "when they make a long blast with the ram's horn, and when ye hear the sound of the trumpet, all the people shall",
        "a": "shout",
        "suffix": "with a great shout; and the wall of the city shall fall down flat,",
        "d": [
          "cry",
          "sing",
          "knock"
        ]
```

Replace with:

```js
"prefix": "when they make a long blast with the ram's horn, and when ye hear the sound of the trumpet, all the people shall",
        "a": "shout",
        "suffix": "with a great shout; and the wall of the city shall fall down flat,",
        "d": [
          "cry",
          "sing",
          "knock",
          "rejoice",
          "tremble"
        ]
```

### D joshua6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he said unto the people, Pass on, and compass the city; and let him that is armed pass on before the",
        "a": "ark",
        "suffix": "of the LORD.",
        "d": [
          "priests",
          "trumpets",
          "king"
        ]
```

Replace with:

```js
"prefix": "And he said unto the people, Pass on, and compass the city; and let him that is armed pass on before the",
        "a": "ark",
        "suffix": "of the LORD.",
        "d": [
          "priests",
          "trumpets",
          "king",
          "glory",
          "cloud"
        ]
```

### D joshua6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And it came to pass at the seventh time, when the priests blew with the trumpets, Joshua said unto the people, Shout; for the LORD hath given you the",
        "a": "city",
        "suffix": ".",
        "d": [
          "land",
          "victory",
          "spoil"
        ]
```

Replace with:

```js
"prefix": "And it came to pass at the seventh time, when the priests blew with the trumpets, Joshua said unto the people, Shout; for the LORD hath given you the",
        "a": "city",
        "suffix": ".",
        "d": [
          "land",
          "victory",
          "spoil",
          "enemy",
          "battle"
        ]
```

### D joshua6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "So the people shouted when the priests blew with the trumpets: and the people shouted with a great shout, that the",
        "a": "wall",
        "suffix": "fell down flat, so that the people went up into the city, every man straight before him,",
        "d": [
          "gate",
          "tower",
          "city"
        ]
```

Replace with:

```js
"prefix": "So the people shouted when the priests blew with the trumpets: and the people shouted with a great shout, that the",
        "a": "wall",
        "suffix": "fell down flat, so that the people went up into the city, every man straight before him,",
        "d": [
          "gate",
          "tower",
          "city",
          "house",
          "altar"
        ]
```

### D joshua6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they utterly destroyed all that was in the city, both man and woman, young and old, and ox, and sheep, and",
        "a": "ass",
        "suffix": ", with the edge of the sword.",
        "d": [
          "camel",
          "goat",
          "dog"
        ]
```

Replace with:

```js
"prefix": "And they utterly destroyed all that was in the city, both man and woman, young and old, and ox, and sheep, and",
        "a": "ass",
        "suffix": ", with the edge of the sword.",
        "d": [
          "camel",
          "goat",
          "dog",
          "horses",
          "lions"
        ]
```

### D joshua6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Cursed be the man before the LORD, that riseth up and buildeth this city",
        "a": "Jericho",
        "suffix": ": he shall lay the foundation thereof in his firstborn, and with his youngest son shall he set up the gates of it.",
        "d": [
          "again",
          "Ai",
          "Shiloh"
        ]
```

Replace with:

```js
"prefix": "Cursed be the man before the LORD, that riseth up and buildeth this city",
        "a": "Jericho",
        "suffix": ": he shall lay the foundation thereof in his firstborn, and with his youngest son shall he set up the gates of it.",
        "d": [
          "again",
          "Ai",
          "Shiloh",
          "Bethel",
          "Hebron"
        ]
```

### D judges16 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And it came to pass afterward, that he loved a woman in the valley of Sorek, whose name was",
        "a": "Delilah",
        "suffix": ".",
        "d": [
          "Tamar",
          "Jael",
          "Rahab"
        ]
```

Replace with:

```js
"prefix": "And it came to pass afterward, that he loved a woman in the valley of Sorek, whose name was",
        "a": "Delilah",
        "suffix": ".",
        "d": [
          "Tamar",
          "Jael",
          "Rahab",
          "Ruth",
          "Abigail"
        ]
```

### D judges16 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "tell me, I pray thee, wherein thy great",
        "a": "strength",
        "suffix": "lieth, and wherewith thou mightest be bound to afflict thee.",
        "d": [
          "power",
          "secret",
          "courage"
        ]
```

Replace with:

```js
"prefix": "tell me, I pray thee, wherein thy great",
        "a": "strength",
        "suffix": "lieth, and wherewith thou mightest be bound to afflict thee.",
        "d": [
          "power",
          "secret",
          "courage",
          "wisdom",
          "glory"
        ]
```

### D judges16 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "There hath not come a",
        "a": "razor",
        "suffix": "upon mine head; for I have been a Nazarite unto God from my mother's womb: if I be shaven, then my strength will go from me,",
        "d": [
          "knife",
          "hand",
          "cord"
        ]
```

Replace with:

```js
"prefix": "There hath not come a",
        "a": "razor",
        "suffix": "upon mine head; for I have been a Nazarite unto God from my mother's womb: if I be shaven, then my strength will go from me,",
        "d": [
          "knife",
          "hand",
          "cord",
          "snare",
          "helmet"
        ]
```

### D judges16 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "she began to afflict him, and his strength went from",
        "a": "him",
        "suffix": ".",
        "d": [
          "her",
          "them",
          "it"
        ]
```

Replace with:

```js
"prefix": "she began to afflict him, and his strength went from",
        "a": "him",
        "suffix": ".",
        "d": [
          "her",
          "them",
          "it",
          "thee",
          "us"
        ]
```

### D judges16 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the Philistines took him, and put out his",
        "a": "eyes",
        "suffix": ", and brought him down to Gaza, and bound him with fetters of brass;",
        "d": [
          "hair",
          "hands",
          "armour"
        ]
```

Replace with:

```js
"prefix": "the Philistines took him, and put out his",
        "a": "eyes",
        "suffix": ", and brought him down to Gaza, and bound him with fetters of brass;",
        "d": [
          "hair",
          "hands",
          "armour",
          "locks",
          "sight"
        ]
```

### D judges16 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O Lord GOD, remember me, I pray thee, and",
        "a": "strengthen",
        "suffix": "me, I pray thee, only this once, O God, that I may be at once avenged of the Philistines for my two eyes.",
        "d": [
          "hear",
          "help",
          "bless"
        ]
```

Replace with:

```js
"prefix": "O Lord GOD, remember me, I pray thee, and",
        "a": "strengthen",
        "suffix": "me, I pray thee, only this once, O God, that I may be at once avenged of the Philistines for my two eyes.",
        "d": [
          "hear",
          "help",
          "bless",
          "comfort",
          "save"
        ]
```

### D judges16 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Samson took hold of the two middle pillars upon which the house stood... and he bowed himself with all his might; and the",
        "a": "house",
        "suffix": "fell upon the lords, and upon all the people that were therein.",
        "d": [
          "wall",
          "tower",
          "temple"
        ]
```

Replace with:

```js
"prefix": "And Samson took hold of the two middle pillars upon which the house stood... and he bowed himself with all his might; and the",
        "a": "house",
        "suffix": "fell upon the lords, and upon all the people that were therein.",
        "d": [
          "wall",
          "tower",
          "temple",
          "roof",
          "palace"
        ]
```

### D judges16 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "So the dead which he slew at his death were more than they which he slew in his",
        "a": "life",
        "suffix": ".",
        "d": [
          "youth",
          "days",
          "wars"
        ]
```

Replace with:

```js
"prefix": "So the dead which he slew at his death were more than they which he slew in his",
        "a": "life",
        "suffix": ".",
        "d": [
          "youth",
          "days",
          "wars",
          "strength",
          "power"
        ]
```

### D 1samuel17 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And there went out a champion out of the camp of the Philistines, named",
        "a": "Goliath",
        "suffix": ", of Gath, whose height was six cubits and a span.",
        "d": [
          "Saul",
          "Samson",
          "Abner"
        ]
```

Replace with:

```js
"prefix": "And there went out a champion out of the camp of the Philistines, named",
        "a": "Goliath",
        "suffix": ", of Gath, whose height was six cubits and a span.",
        "d": [
          "Saul",
          "Samson",
          "Abner",
          "Jonathan",
          "Nabal"
        ]
```

### D 1samuel17 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "When Saul and all Israel heard those words of the Philistine, they were",
        "a": "dismayed",
        "suffix": ", and greatly afraid.",
        "d": [
          "angry",
          "moved",
          "silent"
        ]
```

Replace with:

```js
"prefix": "When Saul and all Israel heard those words of the Philistine, they were",
        "a": "dismayed",
        "suffix": ", and greatly afraid.",
        "d": [
          "angry",
          "moved",
          "silent",
          "ashamed",
          "glad"
        ]
```

### D 1samuel17 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "who is this uncircumcised Philistine, that he should defy the armies of the",
        "a": "living",
        "suffix": "God?",
        "d": [
          "holy",
          "great",
          "eternal"
        ]
```

Replace with:

```js
"prefix": "who is this uncircumcised Philistine, that he should defy the armies of the",
        "a": "living",
        "suffix": "God?",
        "d": [
          "holy",
          "great",
          "eternal",
          "sovereign",
          "jealous"
        ]
```

### D 1samuel17 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And David said to Saul, Let no man's heart fail because of him; thy servant will go and",
        "a": "fight",
        "suffix": "with this Philistine.",
        "d": [
          "stand",
          "wrestle",
          "speak"
        ]
```

Replace with:

```js
"prefix": "And David said to Saul, Let no man's heart fail because of him; thy servant will go and",
        "a": "fight",
        "suffix": "with this Philistine.",
        "d": [
          "stand",
          "wrestle",
          "speak",
          "smite",
          "reason"
        ]
```

### D 1samuel17 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD that delivered me out of the paw of the lion, and out of the paw of the bear, he will deliver me out of the hand of this",
        "a": "Philistine",
        "suffix": ".",
        "d": [
          "giant",
          "man",
          "warrior"
        ]
```

Replace with:

```js
"prefix": "The LORD that delivered me out of the paw of the lion, and out of the paw of the bear, he will deliver me out of the hand of this",
        "a": "Philistine",
        "suffix": ".",
        "d": [
          "giant",
          "man",
          "warrior",
          "Hittite",
          "Egyptian"
        ]
```

### D 1samuel17 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he took his staff in his hand, and chose him five",
        "a": "smooth",
        "suffix": "stones out of the brook, and put them in a shepherd's bag which he had,",
        "d": [
          "round",
          "plain",
          "small"
        ]
```

Replace with:

```js
"prefix": "And he took his staff in his hand, and chose him five",
        "a": "smooth",
        "suffix": "stones out of the brook, and put them in a shepherd's bag which he had,",
        "d": [
          "round",
          "plain",
          "small",
          "white",
          "golden"
        ]
```

### D 1samuel17 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of the LORD of",
        "a": "hosts",
        "suffix": ", the God of the armies of Israel, whom thou hast defied.",
        "d": [
          "Israel",
          "armies",
          "glory"
        ]
```

Replace with:

```js
"prefix": "Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of the LORD of",
        "a": "hosts",
        "suffix": ", the God of the armies of Israel, whom thou hast defied.",
        "d": [
          "Israel",
          "armies",
          "glory",
          "majesty",
          "heaven"
        ]
```

### D 1samuel17 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and smote the Philistine in his forehead, that the stone sunk into his forehead; and he fell upon his face to the",
        "a": "earth",
        "suffix": ".",
        "d": [
          "ground",
          "dust",
          "sea"
        ]
```

Replace with:

```js
"prefix": "and smote the Philistine in his forehead, that the stone sunk into his forehead; and he fell upon his face to the",
        "a": "earth",
        "suffix": ".",
        "d": [
          "ground",
          "dust",
          "sea",
          "heaven",
          "water"
        ]
```

### D 2samuel22 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD is my",
        "a": "rock",
        "suffix": ", and my fortress, and my deliverer;",
        "d": [
          "shield",
          "tower",
          "strength"
        ]
```

Replace with:

```js
"prefix": "The LORD is my",
        "a": "rock",
        "suffix": ", and my fortress, and my deliverer;",
        "d": [
          "shield",
          "tower",
          "strength",
          "help",
          "hope"
        ]
```

### D 2samuel22 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "he is my shield, and the horn of my salvation, my high tower, and my refuge, my saviour; thou savest me from",
        "a": "violence",
        "suffix": ".",
        "d": [
          "danger",
          "enemies",
          "death"
        ]
```

Replace with:

```js
"prefix": "he is my shield, and the horn of my salvation, my high tower, and my refuge, my saviour; thou savest me from",
        "a": "violence",
        "suffix": ".",
        "d": [
          "danger",
          "enemies",
          "death",
          "sin",
          "sorrow"
        ]
```

### D 2samuel22 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "In my distress I called upon the LORD, and",
        "a": "cried",
        "suffix": "to my God: and he did hear my voice out of his temple, and my cry did enter into his ears.",
        "d": [
          "sang",
          "prayed",
          "looked"
        ]
```

Replace with:

```js
"prefix": "In my distress I called upon the LORD, and",
        "a": "cried",
        "suffix": "to my God: and he did hear my voice out of his temple, and my cry did enter into his ears.",
        "d": [
          "sang",
          "prayed",
          "looked",
          "wept",
          "spake"
        ]
```

### D 2samuel22 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For thou art my lamp, O LORD: and the LORD will",
        "a": "light",
        "suffix": "my darkness.",
        "d": [
          "lift",
          "tame",
          "fill"
        ]
```

Replace with:

```js
"prefix": "For thou art my lamp, O LORD: and the LORD will",
        "a": "light",
        "suffix": "my darkness.",
        "d": [
          "lift",
          "tame",
          "fill",
          "scatter",
          "clear"
        ]
```

### D 2samuel22 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "As for God, his way is",
        "a": "perfect",
        "suffix": "; the word of the LORD is tried: he is a buckler to all them that trust in him.",
        "d": [
          "pure",
          "just",
          "holy"
        ]
```

Replace with:

```js
"prefix": "As for God, his way is",
        "a": "perfect",
        "suffix": "; the word of the LORD is tried: he is a buckler to all them that trust in him.",
        "d": [
          "pure",
          "just",
          "holy",
          "straight",
          "hidden"
        ]
```

### D 2samuel22 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "God is my strength and",
        "a": "power",
        "suffix": ": and he maketh my way perfect.",
        "d": [
          "refuge",
          "might",
          "peace"
        ]
```

Replace with:

```js
"prefix": "God is my strength and",
        "a": "power",
        "suffix": ": and he maketh my way perfect.",
        "d": [
          "refuge",
          "might",
          "peace",
          "glory",
          "wisdom"
        ]
```

### D 2samuel22 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD liveth; and blessed be my rock; and exalted be the God of the rock of my",
        "a": "salvation",
        "suffix": ".",
        "d": [
          "strength",
          "mercy",
          "hope"
        ]
```

Replace with:

```js
"prefix": "The LORD liveth; and blessed be my rock; and exalted be the God of the rock of my",
        "a": "salvation",
        "suffix": ".",
        "d": [
          "strength",
          "mercy",
          "hope",
          "help",
          "fortress"
        ]
```

### D 2samuel22 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore I will give thanks unto thee, O LORD, among the",
        "a": "heathen",
        "suffix": ", and I will sing praises unto thy name.",
        "d": [
          "nations",
          "people",
          "brethren"
        ]
```

Replace with:

```js
"prefix": "Therefore I will give thanks unto thee, O LORD, among the",
        "a": "heathen",
        "suffix": ", and I will sing praises unto thy name.",
        "d": [
          "nations",
          "people",
          "brethren",
          "kings",
          "princes"
        ]
```

### D 1kings18 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for it was so, when Jezebel cut off the prophets of the LORD, that Obadiah took an hundred prophets, and hid them by fifty in a",
        "a": "cave",
        "suffix": ", and fed them with bread and water.)",
        "d": [
          "tower",
          "house",
          "den"
        ]
```

Replace with:

```js
"prefix": "for it was so, when Jezebel cut off the prophets of the LORD, that Obadiah took an hundred prophets, and hid them by fifty in a",
        "a": "cave",
        "suffix": ", and fed them with bread and water.)",
        "d": [
          "tower",
          "house",
          "den",
          "pit",
          "tomb"
        ]
```

### D 1kings18 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "How long halt ye between two",
        "a": "opinions",
        "suffix": "? if the LORD be God, follow him: but if Baal, then follow him. And the people answered him not a word.",
        "d": [
          "minds",
          "gods",
          "ways"
        ]
```

Replace with:

```js
"prefix": "How long halt ye between two",
        "a": "opinions",
        "suffix": "? if the LORD be God, follow him: but if Baal, then follow him. And the people answered him not a word.",
        "d": [
          "minds",
          "gods",
          "ways",
          "masters",
          "kings"
        ]
```

### D 1kings18 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "call ye on the name of your gods, and I will call on the name of the LORD: and the God that answereth by",
        "a": "fire",
        "suffix": ", let him be God. And all the people answered and said, It is well spoken.",
        "d": [
          "rain",
          "voice",
          "sign"
        ]
```

Replace with:

```js
"prefix": "call ye on the name of your gods, and I will call on the name of the LORD: and the God that answereth by",
        "a": "fire",
        "suffix": ", let him be God. And all the people answered and said, It is well spoken.",
        "d": [
          "rain",
          "voice",
          "sign",
          "water",
          "thunder"
        ]
```

### D 1kings18 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "he mocked them... Cry aloud: for he is a god; either he is talking, or he is pursuing, or he is in a journey, or peradventure he",
        "a": "sleepeth",
        "suffix": ", and must be awaked.",
        "d": [
          "hideth",
          "resteth",
          "fainteth"
        ]
```

Replace with:

```js
"prefix": "he mocked them... Cry aloud: for he is a god; either he is talking, or he is pursuing, or he is in a journey, or peradventure he",
        "a": "sleepeth",
        "suffix": ", and must be awaked.",
        "d": [
          "hideth",
          "resteth",
          "fainteth",
          "walketh",
          "cometh"
        ]
```

### D 1kings18 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Elijah said unto all the people, Come near unto",
        "a": "me",
        "suffix": ". And all the people came near unto him. And he repaired the altar of the LORD that was broken down.",
        "d": [
          "him",
          "God",
          "us"
        ]
```

Replace with:

```js
"prefix": "And Elijah said unto all the people, Come near unto",
        "a": "me",
        "suffix": ". And all the people came near unto him. And he repaired the altar of the LORD that was broken down.",
        "d": [
          "him",
          "God",
          "us",
          "thee",
          "you"
        ]
```

### D 1kings18 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "let it be known this day that thou art God in",
        "a": "Israel",
        "suffix": ", and that I am thy servant, and that I have done all these things at thy word.",
        "d": [
          "Zion",
          "Judah",
          "the world"
        ]
```

Replace with:

```js
"prefix": "let it be known this day that thou art God in",
        "a": "Israel",
        "suffix": ", and that I am thy servant, and that I have done all these things at thy word.",
        "d": [
          "Zion",
          "Judah",
          "the world",
          "Egypt",
          "Canaan"
        ]
```

### D 1kings18 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then the fire of the LORD fell, and consumed the burnt",
        "a": "sacrifice",
        "suffix": ", and the wood, and the stones, and the dust, and licked up the water that was in the trench.",
        "d": [
          "offering",
          "altar",
          "lamb"
        ]
```

Replace with:

```js
"prefix": "Then the fire of the LORD fell, and consumed the burnt",
        "a": "sacrifice",
        "suffix": ", and the wood, and the stones, and the dust, and licked up the water that was in the trench.",
        "d": [
          "offering",
          "altar",
          "lamb",
          "incense",
          "bread"
        ]
```

### D 1kings18 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And when all the people saw this, they fell on their",
        "a": "faces",
        "suffix": ": and they said, The LORD, he is the God; the LORD, he is the God.",
        "d": [
          "knees",
          "feet",
          "hands"
        ]
```

Replace with:

```js
"prefix": "And when all the people saw this, they fell on their",
        "a": "faces",
        "suffix": ": and they said, The LORD, he is the God; the LORD, he is the God.",
        "d": [
          "knees",
          "feet",
          "hands",
          "heads",
          "shoulders"
        ]
```

### D 2kings2 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the LORD would take up Elijah into heaven by a",
        "a": "whirlwind",
        "suffix": ". And Elijah went with Elisha from Gilgal.",
        "d": [
          "storm",
          "cloud",
          "wind"
        ]
```

Replace with:

```js
"prefix": "the LORD would take up Elijah into heaven by a",
        "a": "whirlwind",
        "suffix": ". And Elijah went with Elisha from Gilgal.",
        "d": [
          "storm",
          "cloud",
          "wind",
          "chariot",
          "fire"
        ]
```

### D 2kings2 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "he took his mantle, and wrapped it together, and",
        "a": "smote",
        "suffix": "the waters, and they were divided hither and thither, so that they two went over on dry ground.",
        "d": [
          "touched",
          "parted",
          "hit"
        ]
```

Replace with:

```js
"prefix": "he took his mantle, and wrapped it together, and",
        "a": "smote",
        "suffix": "the waters, and they were divided hither and thither, so that they two went over on dry ground.",
        "d": [
          "touched",
          "parted",
          "hit",
          "lifted",
          "blessed"
        ]
```

### D 2kings2 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ask what I shall do for thee, before I be taken away from thee. And Elisha said, I pray thee, let a double portion of thy",
        "a": "spirit",
        "suffix": "be upon me.",
        "d": [
          "power",
          "blessing",
          "grace"
        ]
```

Replace with:

```js
"prefix": "Ask what I shall do for thee, before I be taken away from thee. And Elisha said, I pray thee, let a double portion of thy",
        "a": "spirit",
        "suffix": "be upon me.",
        "d": [
          "power",
          "blessing",
          "grace",
          "glory",
          "mantle"
        ]
```

### D 2kings2 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "behold, there appeared a",
        "a": "chariot",
        "suffix": "of fire, and horses of fire, and parted them both asunder; and Elijah went up by a whirlwind into heaven.",
        "d": [
          "horse",
          "cloud",
          "wind"
        ]
```

Replace with:

```js
"prefix": "behold, there appeared a",
        "a": "chariot",
        "suffix": "of fire, and horses of fire, and parted them both asunder; and Elijah went up by a whirlwind into heaven.",
        "d": [
          "horse",
          "cloud",
          "wind",
          "pillar",
          "flame"
        ]
```

### D 2kings2 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he took hold of his own",
        "a": "clothes",
        "suffix": ", and rent them in two pieces.",
        "d": [
          "mantle",
          "garments",
          "robe"
        ]
```

Replace with:

```js
"prefix": "And he took hold of his own",
        "a": "clothes",
        "suffix": ", and rent them in two pieces.",
        "d": [
          "mantle",
          "garments",
          "robe",
          "hair",
          "hands"
        ]
```

### D 2kings2 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he took the mantle of Elijah that fell from him, and smote the waters, and said, Where is the LORD God of",
        "a": "Elijah",
        "suffix": "? and when he also had smitten the waters, they parted hither and thither: and Elisha went over.",
        "d": [
          "Israel",
          "Abraham",
          "Zion"
        ]
```

Replace with:

```js
"prefix": "And he took the mantle of Elijah that fell from him, and smote the waters, and said, Where is the LORD God of",
        "a": "Elijah",
        "suffix": "? and when he also had smitten the waters, they parted hither and thither: and Elisha went over.",
        "d": [
          "Israel",
          "Abraham",
          "Zion",
          "Moses",
          "Joshua"
        ]
```

### D 2kings2 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thus saith the LORD, I have healed these",
        "a": "waters",
        "suffix": "; there shall not be from thence any more death or barren land.",
        "d": [
          "springs",
          "lands",
          "people"
        ]
```

Replace with:

```js
"prefix": "Thus saith the LORD, I have healed these",
        "a": "waters",
        "suffix": "; there shall not be from thence any more death or barren land.",
        "d": [
          "springs",
          "lands",
          "people",
          "cities",
          "gates"
        ]
```

### D 2kings2 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "there came forth little children out of the city, and mocked him, and said unto him, Go up, thou bald",
        "a": "head",
        "suffix": "; go up, thou bald head.",
        "d": [
          "man",
          "prophet",
          "fool"
        ]
```

Replace with:

```js
"prefix": "there came forth little children out of the city, and mocked him, and said unto him, Go up, thou bald",
        "a": "head",
        "suffix": "; go up, thou bald head.",
        "d": [
          "man",
          "prophet",
          "fool",
          "priest",
          "stranger"
        ]
```

### D psalm8 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O LORD our Lord, how excellent is thy",
        "a": "name",
        "suffix": "in all the earth! who hast set thy glory above the heavens.",
        "d": [
          "word",
          "praise",
          "mercy"
        ]
```

Replace with:

```js
"prefix": "O LORD our Lord, how excellent is thy",
        "a": "name",
        "suffix": "in all the earth! who hast set thy glory above the heavens.",
        "d": [
          "word",
          "praise",
          "mercy",
          "majesty",
          "power"
        ]
```

### D psalm8 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Out of the mouth of babes and sucklings hast thou ordained",
        "a": "strength",
        "suffix": "because of thine enemies, that thou mightest still the enemy and the avenger.",
        "d": [
          "praise",
          "power",
          "words"
        ]
```

Replace with:

```js
"prefix": "Out of the mouth of babes and sucklings hast thou ordained",
        "a": "strength",
        "suffix": "because of thine enemies, that thou mightest still the enemy and the avenger.",
        "d": [
          "praise",
          "power",
          "words",
          "victory",
          "glory"
        ]
```

### D psalm8 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "When I consider thy heavens, the work of thy",
        "a": "fingers",
        "suffix": ", the moon and the stars, which thou hast ordained;",
        "d": [
          "hands",
          "power",
          "spirit"
        ]
```

Replace with:

```js
"prefix": "When I consider thy heavens, the work of thy",
        "a": "fingers",
        "suffix": ", the moon and the stars, which thou hast ordained;",
        "d": [
          "hands",
          "power",
          "spirit",
          "wonders",
          "word"
        ]
```

### D psalm8 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "What is",
        "a": "man",
        "suffix": ", that thou art mindful of him? and the son of man, that thou visitest him?",
        "d": [
          "Adam",
          "flesh",
          "dust"
        ]
```

Replace with:

```js
"prefix": "What is",
        "a": "man",
        "suffix": ", that thou art mindful of him? and the son of man, that thou visitest him?",
        "d": [
          "Adam",
          "flesh",
          "dust",
          "sin",
          "vanity"
        ]
```

### D psalm8 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For thou hast made him a little lower than the",
        "a": "angels",
        "suffix": ", and hast crowned him with glory and honour.",
        "d": [
          "heavens",
          "kings",
          "thrones"
        ]
```

Replace with:

```js
"prefix": "For thou hast made him a little lower than the",
        "a": "angels",
        "suffix": ", and hast crowned him with glory and honour.",
        "d": [
          "heavens",
          "kings",
          "thrones",
          "stars",
          "beasts"
        ]
```

### D psalm8 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou madest him to have",
        "a": "dominion",
        "suffix": "over the works of thy hands; thou hast put all things under his feet:",
        "d": [
          "power",
          "rule",
          "charge"
        ]
```

Replace with:

```js
"prefix": "Thou madest him to have",
        "a": "dominion",
        "suffix": "over the works of thy hands; thou hast put all things under his feet:",
        "d": [
          "power",
          "rule",
          "charge",
          "care",
          "glory"
        ]
```

### D psalm8 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "All sheep and",
        "a": "oxen",
        "suffix": ", yea, and the beasts of the field;",
        "d": [
          "cattle",
          "herds",
          "goats"
        ]
```

Replace with:

```js
"prefix": "All sheep and",
        "a": "oxen",
        "suffix": ", yea, and the beasts of the field;",
        "d": [
          "cattle",
          "herds",
          "goats",
          "lambs",
          "horses"
        ]
```

### D psalm8 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O LORD our Lord, how excellent is thy name in all the",
        "a": "earth",
        "suffix": "!",
        "d": [
          "world",
          "lands",
          "heavens"
        ]
```

Replace with:

```js
"prefix": "O LORD our Lord, how excellent is thy name in all the",
        "a": "earth",
        "suffix": "!",
        "d": [
          "world",
          "lands",
          "heavens",
          "sea",
          "field"
        ]
```

### D psalm19 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The heavens declare the glory of God; and the firmament sheweth his",
        "a": "handywork",
        "suffix": ".",
        "d": [
          "glory",
          "power",
          "wonders"
        ]
```

Replace with:

```js
"prefix": "The heavens declare the glory of God; and the firmament sheweth his",
        "a": "handywork",
        "suffix": ".",
        "d": [
          "glory",
          "power",
          "wonders",
          "majesty",
          "truth"
        ]
```

### D psalm19 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Day unto day uttereth",
        "a": "speech",
        "suffix": ", and night unto night sheweth knowledge.",
        "d": [
          "words",
          "praise",
          "wisdom"
        ]
```

Replace with:

```js
"prefix": "Day unto day uttereth",
        "a": "speech",
        "suffix": ", and night unto night sheweth knowledge.",
        "d": [
          "words",
          "praise",
          "wisdom",
          "songs",
          "wonders"
        ]
```

### D psalm19 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The law of the LORD is",
        "a": "perfect",
        "suffix": ", converting the soul: the testimony of the LORD is sure, making wise the simple.",
        "d": [
          "pure",
          "holy",
          "good"
        ]
```

Replace with:

```js
"prefix": "The law of the LORD is",
        "a": "perfect",
        "suffix": ", converting the soul: the testimony of the LORD is sure, making wise the simple.",
        "d": [
          "pure",
          "holy",
          "good",
          "pleasant",
          "sweet"
        ]
```

### D psalm19 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The statutes of the LORD are",
        "a": "right",
        "suffix": ", rejoicing the heart: the commandment of the LORD is pure, enlightening the eyes.",
        "d": [
          "true",
          "just",
          "good"
        ]
```

Replace with:

```js
"prefix": "The statutes of the LORD are",
        "a": "right",
        "suffix": ", rejoicing the heart: the commandment of the LORD is pure, enlightening the eyes.",
        "d": [
          "true",
          "just",
          "good",
          "sure",
          "sweet"
        ]
```

### D psalm19 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "More to be desired are they than",
        "a": "gold",
        "suffix": ", yea, than much fine gold: sweeter also than honey and the honeycomb.",
        "d": [
          "silver",
          "jewels",
          "riches"
        ]
```

Replace with:

```js
"prefix": "More to be desired are they than",
        "a": "gold",
        "suffix": ", yea, than much fine gold: sweeter also than honey and the honeycomb.",
        "d": [
          "silver",
          "jewels",
          "riches",
          "brass",
          "wine"
        ]
```

### D psalm19 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who can understand his",
        "a": "errors",
        "suffix": "? cleanse thou me from secret faults.",
        "d": [
          "ways",
          "heart",
          "law"
        ]
```

Replace with:

```js
"prefix": "Who can understand his",
        "a": "errors",
        "suffix": "? cleanse thou me from secret faults.",
        "d": [
          "ways",
          "heart",
          "law",
          "counsels",
          "judgments"
        ]
```

### D psalm19 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Keep back thy servant also from presumptuous sins; let them not have dominion over me: then shall I be upright, and I shall be innocent from the great",
        "a": "transgression",
        "suffix": ".",
        "d": [
          "fall",
          "offence",
          "wickedness"
        ]
```

Replace with:

```js
"prefix": "Keep back thy servant also from presumptuous sins; let them not have dominion over me: then shall I be upright, and I shall be innocent from the great",
        "a": "transgression",
        "suffix": ".",
        "d": [
          "fall",
          "offence",
          "wickedness",
          "rebellion",
          "wrath"
        ]
```

### D psalm19 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my",
        "a": "strength",
        "suffix": ", and my redeemer.",
        "d": [
          "rock",
          "refuge",
          "shield"
        ]
```

Replace with:

```js
"prefix": "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my",
        "a": "strength",
        "suffix": ", and my redeemer.",
        "d": [
          "rock",
          "refuge",
          "shield",
          "help",
          "hope"
        ]
```

### D psalm46 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "God is our refuge and",
        "a": "strength",
        "suffix": ", a very present help in trouble.",
        "d": [
          "shield",
          "tower",
          "hope"
        ]
```

Replace with:

```js
"prefix": "God is our refuge and",
        "a": "strength",
        "suffix": ", a very present help in trouble.",
        "d": [
          "shield",
          "tower",
          "hope",
          "power",
          "comfort"
        ]
```

### D psalm46 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore will not we fear, though the earth be removed, and though the",
        "a": "mountains",
        "suffix": "be carried into the midst of the sea;",
        "d": [
          "waters",
          "nations",
          "hills"
        ]
```

Replace with:

```js
"prefix": "Therefore will not we fear, though the earth be removed, and though the",
        "a": "mountains",
        "suffix": "be carried into the midst of the sea;",
        "d": [
          "waters",
          "nations",
          "hills",
          "rocks",
          "islands"
        ]
```

### D psalm46 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "There is a river, the streams whereof shall make glad the",
        "a": "city",
        "suffix": "of God, the holy place of the tabernacles of the most High.",
        "d": [
          "house",
          "Zion",
          "heart"
        ]
```

Replace with:

```js
"prefix": "There is a river, the streams whereof shall make glad the",
        "a": "city",
        "suffix": "of God, the holy place of the tabernacles of the most High.",
        "d": [
          "house",
          "Zion",
          "heart",
          "temple",
          "camp"
        ]
```

### D psalm46 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "God is in the midst of her; she shall not be",
        "a": "moved",
        "suffix": ": God shall help her, and that right early.",
        "d": [
          "shaken",
          "fallen",
          "lost"
        ]
```

Replace with:

```js
"prefix": "God is in the midst of her; she shall not be",
        "a": "moved",
        "suffix": ": God shall help her, and that right early.",
        "d": [
          "shaken",
          "fallen",
          "lost",
          "broken",
          "forsaken"
        ]
```

### D psalm46 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The heathen raged, the kingdoms were moved: he uttered his voice, the earth",
        "a": "melted",
        "suffix": ".",
        "d": [
          "shook",
          "burned",
          "trembled"
        ]
```

Replace with:

```js
"prefix": "The heathen raged, the kingdoms were moved: he uttered his voice, the earth",
        "a": "melted",
        "suffix": ".",
        "d": [
          "shook",
          "burned",
          "trembled",
          "fled",
          "groaned"
        ]
```

### D psalm46 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD of hosts is with us; the God of Jacob is our",
        "a": "refuge",
        "suffix": ". Selah.",
        "d": [
          "strength",
          "fortress",
          "hope"
        ]
```

Replace with:

```js
"prefix": "The LORD of hosts is with us; the God of Jacob is our",
        "a": "refuge",
        "suffix": ". Selah.",
        "d": [
          "strength",
          "fortress",
          "hope",
          "rock",
          "tower"
        ]
```

### D psalm46 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He maketh wars to cease unto the end of the earth; he breaketh the",
        "a": "bow",
        "suffix": ", and cutteth the spear in sunder; he burneth the chariot in the fire.",
        "d": [
          "sword",
          "spear",
          "shield"
        ]
```

Replace with:

```js
"prefix": "He maketh wars to cease unto the end of the earth; he breaketh the",
        "a": "bow",
        "suffix": ", and cutteth the spear in sunder; he burneth the chariot in the fire.",
        "d": [
          "sword",
          "spear",
          "shield",
          "arrow",
          "staff"
        ]
```

### D psalm46 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the",
        "a": "earth",
        "suffix": ".",
        "d": [
          "nations",
          "world",
          "skies"
        ]
```

Replace with:

```js
"prefix": "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the",
        "a": "earth",
        "suffix": ".",
        "d": [
          "nations",
          "world",
          "skies",
          "heavens",
          "city"
        ]
```

### D psalm100 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Make a joyful noise unto the LORD, all ye",
        "a": "lands",
        "suffix": ".",
        "d": [
          "people",
          "nations",
          "earth"
        ]
```

Replace with:

```js
"prefix": "Make a joyful noise unto the LORD, all ye",
        "a": "lands",
        "suffix": ".",
        "d": [
          "people",
          "nations",
          "earth",
          "saints",
          "servants"
        ]
```

### D psalm100 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Serve the LORD with",
        "a": "gladness",
        "suffix": ": come before his presence with singing.",
        "d": [
          "fear",
          "pride",
          "sorrow"
        ]
```

Replace with:

```js
"prefix": "Serve the LORD with",
        "a": "gladness",
        "suffix": ": come before his presence with singing.",
        "d": [
          "fear",
          "pride",
          "sorrow",
          "trembling",
          "faith"
        ]
```

### D psalm100 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Know ye that the LORD he is",
        "a": "God",
        "suffix": ": it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture.",
        "d": [
          "king",
          "good",
          "one"
        ]
```

Replace with:

```js
"prefix": "Know ye that the LORD he is",
        "a": "God",
        "suffix": ": it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture.",
        "d": [
          "king",
          "good",
          "one",
          "Shepherd",
          "Judge"
        ]
```

### D psalm100 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "it is he that hath made us, and not we ourselves; we are his people, and the sheep of his",
        "a": "pasture",
        "suffix": ".",
        "d": [
          "hand",
          "field",
          "fold"
        ]
```

Replace with:

```js
"prefix": "it is he that hath made us, and not we ourselves; we are his people, and the sheep of his",
        "a": "pasture",
        "suffix": ".",
        "d": [
          "hand",
          "field",
          "fold",
          "flock",
          "tent"
        ]
```

### D psalm100 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Enter into his gates with",
        "a": "thanksgiving",
        "suffix": ", and into his courts with praise: be thankful unto him, and bless his name.",
        "d": [
          "praise",
          "singing",
          "joy"
        ]
```

Replace with:

```js
"prefix": "Enter into his gates with",
        "a": "thanksgiving",
        "suffix": ", and into his courts with praise: be thankful unto him, and bless his name.",
        "d": [
          "praise",
          "singing",
          "joy",
          "trumpets",
          "music"
        ]
```

### D psalm100 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "be thankful unto him, and",
        "a": "bless",
        "suffix": "his name.",
        "d": [
          "praise",
          "love",
          "call"
        ]
```

Replace with:

```js
"prefix": "be thankful unto him, and",
        "a": "bless",
        "suffix": "his name.",
        "d": [
          "praise",
          "love",
          "call",
          "fear",
          "remember"
        ]
```

### D psalm100 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For the LORD is good; his mercy is",
        "a": "everlasting",
        "suffix": "; and his truth endureth to all generations.",
        "d": [
          "eternal",
          "boundless",
          "great"
        ]
```

Replace with:

```js
"prefix": "For the LORD is good; his mercy is",
        "a": "everlasting",
        "suffix": "; and his truth endureth to all generations.",
        "d": [
          "eternal",
          "boundless",
          "great",
          "sure",
          "plenteous"
        ]
```

### D psalm100 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and his truth",
        "a": "endureth",
        "suffix": "to all generations.",
        "d": [
          "lasteth",
          "standeth",
          "liveth"
        ]
```

Replace with:

```js
"prefix": "and his truth",
        "a": "endureth",
        "suffix": "to all generations.",
        "d": [
          "lasteth",
          "standeth",
          "liveth",
          "fadeth",
          "changeth"
        ]
```

### D psalm150 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Praise ye the LORD. Praise God in his",
        "a": "sanctuary",
        "suffix": ": praise him in the firmament of his power.",
        "d": [
          "temple",
          "glory",
          "house"
        ]
```

Replace with:

```js
"prefix": "Praise ye the LORD. Praise God in his",
        "a": "sanctuary",
        "suffix": ": praise him in the firmament of his power.",
        "d": [
          "temple",
          "glory",
          "house",
          "heavens",
          "kingdom"
        ]
```

### D psalm150 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "praise him in the firmament of his",
        "a": "power",
        "suffix": ".",
        "d": [
          "glory",
          "strength",
          "might"
        ]
```

Replace with:

```js
"prefix": "praise him in the firmament of his",
        "a": "power",
        "suffix": ".",
        "d": [
          "glory",
          "strength",
          "might",
          "majesty",
          "wisdom"
        ]
```

### D psalm150 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Praise him for his mighty",
        "a": "acts",
        "suffix": ": praise him according to his excellent greatness.",
        "d": [
          "deeds",
          "works",
          "grace"
        ]
```

Replace with:

```js
"prefix": "Praise him for his mighty",
        "a": "acts",
        "suffix": ": praise him according to his excellent greatness.",
        "d": [
          "deeds",
          "works",
          "grace",
          "wonders",
          "power"
        ]
```

### D psalm150 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Praise him with the sound of the",
        "a": "trumpet",
        "suffix": ": praise him with the psaltery and harp.",
        "d": [
          "cymbal",
          "shout",
          "organ"
        ]
```

Replace with:

```js
"prefix": "Praise him with the sound of the",
        "a": "trumpet",
        "suffix": ": praise him with the psaltery and harp.",
        "d": [
          "cymbal",
          "shout",
          "organ",
          "timbrel",
          "thunder"
        ]
```

### D psalm150 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "praise him with the psaltery and",
        "a": "harp",
        "suffix": ".",
        "d": [
          "trumpet",
          "organ",
          "flute"
        ]
```

Replace with:

```js
"prefix": "praise him with the psaltery and",
        "a": "harp",
        "suffix": ".",
        "d": [
          "trumpet",
          "organ",
          "flute",
          "cymbal",
          "timbrel"
        ]
```

### D psalm150 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Praise him with the timbrel and",
        "a": "dance",
        "suffix": ": praise him with stringed instruments and organs.",
        "d": [
          "singing",
          "music",
          "psaltery"
        ]
```

Replace with:

```js
"prefix": "Praise him with the timbrel and",
        "a": "dance",
        "suffix": ": praise him with stringed instruments and organs.",
        "d": [
          "singing",
          "music",
          "psaltery",
          "trumpet",
          "harp"
        ]
```

### D psalm150 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Let every thing that hath",
        "a": "breath",
        "suffix": "praise the LORD. Praise ye the LORD.",
        "d": [
          "life",
          "voice",
          "being"
        ]
```

Replace with:

```js
"prefix": "Let every thing that hath",
        "a": "breath",
        "suffix": "praise the LORD. Praise ye the LORD.",
        "d": [
          "life",
          "voice",
          "being",
          "soul",
          "heart"
        ]
```

### D psalm150 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Let every thing that hath breath praise the",
        "a": "LORD",
        "suffix": ". Praise ye the LORD.",
        "d": [
          "name",
          "God",
          "king"
        ]
```

Replace with:

```js
"prefix": "Let every thing that hath breath praise the",
        "a": "LORD",
        "suffix": ". Praise ye the LORD.",
        "d": [
          "name",
          "God",
          "king",
          "SAVIOUR",
          "CREATOR"
        ]
```

### D matthew6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Take heed that ye do not your alms before men, to be",
        "a": "seen",
        "suffix": "of them: otherwise ye have no reward of your Father which is in heaven.",
        "d": [
          "known",
          "praised",
          "heard"
        ]
```

Replace with:

```js
"prefix": "Take heed that ye do not your alms before men, to be",
        "a": "seen",
        "suffix": "of them: otherwise ye have no reward of your Father which is in heaven.",
        "d": [
          "known",
          "praised",
          "heard",
          "feared",
          "served"
        ]
```

### D matthew6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in",
        "a": "secret",
        "suffix": "; and thy Father which seeth in secret shall reward thee openly.",
        "d": [
          "heaven",
          "silence",
          "quiet"
        ]
```

Replace with:

```js
"prefix": "enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in",
        "a": "secret",
        "suffix": "; and thy Father which seeth in secret shall reward thee openly.",
        "d": [
          "heaven",
          "silence",
          "quiet",
          "darkness",
          "shadow"
        ]
```

### D matthew6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "After this manner therefore pray ye: Our Father which art in heaven,",
        "a": "Hallowed",
        "suffix": "be thy name.",
        "d": [
          "Holy",
          "Blessed",
          "Glorious"
        ]
```

Replace with:

```js
"prefix": "After this manner therefore pray ye: Our Father which art in heaven,",
        "a": "Hallowed",
        "suffix": "be thy name.",
        "d": [
          "Holy",
          "Blessed",
          "Glorious",
          "Honoured",
          "Feared"
        ]
```

### D matthew6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thy kingdom come. Thy will be done in earth, as it is in",
        "a": "heaven",
        "suffix": ".",
        "d": [
          "Zion",
          "the church",
          "the world"
        ]
```

Replace with:

```js
"prefix": "Thy kingdom come. Thy will be done in earth, as it is in",
        "a": "heaven",
        "suffix": ".",
        "d": [
          "Zion",
          "the church",
          "the world",
          "glory",
          "hell"
        ]
```

### D matthew6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Give us this day our daily",
        "a": "bread",
        "suffix": ".",
        "d": [
          "food",
          "portion",
          "grace"
        ]
```

Replace with:

```js
"prefix": "Give us this day our daily",
        "a": "bread",
        "suffix": ".",
        "d": [
          "food",
          "portion",
          "grace",
          "water",
          "wine"
        ]
```

### D matthew6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For if ye forgive men their trespasses, your heavenly Father will also forgive",
        "a": "you",
        "suffix": ":",
        "d": [
          "them",
          "us",
          "all"
        ]
```

Replace with:

```js
"prefix": "For if ye forgive men their trespasses, your heavenly Father will also forgive",
        "a": "you",
        "suffix": ":",
        "d": [
          "them",
          "us",
          "all",
          "thee",
          "him"
        ]
```

### D matthew6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But lay up for yourselves",
        "a": "treasures",
        "suffix": "in heaven, where neither moth nor rust doth corrupt, and where thieves do not break through nor steal:",
        "d": [
          "riches",
          "gifts",
          "crowns"
        ]
```

Replace with:

```js
"prefix": "But lay up for yourselves",
        "a": "treasures",
        "suffix": "in heaven, where neither moth nor rust doth corrupt, and where thieves do not break through nor steal:",
        "d": [
          "riches",
          "gifts",
          "crowns",
          "pearls",
          "horses"
        ]
```

### D matthew6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But seek ye first the kingdom of God, and his",
        "a": "righteousness",
        "suffix": "; and all these things shall be added unto you.",
        "d": [
          "mercy",
          "truth",
          "peace"
        ]
```

Replace with:

```js
"prefix": "But seek ye first the kingdom of God, and his",
        "a": "righteousness",
        "suffix": "; and all these things shall be added unto you.",
        "d": [
          "mercy",
          "truth",
          "peace",
          "glory",
          "power"
        ]
```

### D matthew7 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Judge not, that ye be not",
        "a": "judged",
        "suffix": ".",
        "d": [
          "condemned",
          "blamed",
          "scorned"
        ]
```

Replace with:

```js
"prefix": "Judge not, that ye be not",
        "a": "judged",
        "suffix": ".",
        "d": [
          "condemned",
          "blamed",
          "scorned",
          "tempted",
          "tried"
        ]
```

### D matthew7 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And why beholdest thou the mote that is in thy brother's eye, but considerest not the",
        "a": "beam",
        "suffix": "that is in thine own eye?",
        "d": [
          "stick",
          "mote",
          "plank"
        ]
```

Replace with:

```js
"prefix": "And why beholdest thou the mote that is in thy brother's eye, but considerest not the",
        "a": "beam",
        "suffix": "that is in thine own eye?",
        "d": [
          "stick",
          "mote",
          "plank",
          "thorn",
          "spear"
        ]
```

### D matthew7 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ask, and it shall be given you;",
        "a": "seek",
        "suffix": ", and ye shall find; knock, and it shall be opened unto you:",
        "d": [
          "call",
          "cry",
          "wait"
        ]
```

Replace with:

```js
"prefix": "Ask, and it shall be given you;",
        "a": "seek",
        "suffix": ", and ye shall find; knock, and it shall be opened unto you:",
        "d": [
          "call",
          "cry",
          "wait",
          "pray",
          "sleep"
        ]
```

### D matthew7 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore all things whatsoever ye would that men should do to you, do ye even so to",
        "a": "them",
        "suffix": ": for this is the law and the prophets.",
        "d": [
          "God",
          "all",
          "him"
        ]
```

Replace with:

```js
"prefix": "Therefore all things whatsoever ye would that men should do to you, do ye even so to",
        "a": "them",
        "suffix": ": for this is the law and the prophets.",
        "d": [
          "God",
          "all",
          "him",
          "others",
          "thee"
        ]
```

### D matthew7 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Enter ye in at the strait",
        "a": "gate",
        "suffix": ": for wide is the gate, and broad is the way, that leadeth to destruction,",
        "d": [
          "door",
          "path",
          "way"
        ]
```

Replace with:

```js
"prefix": "Enter ye in at the strait",
        "a": "gate",
        "suffix": ": for wide is the gate, and broad is the way, that leadeth to destruction,",
        "d": [
          "door",
          "path",
          "way",
          "road",
          "highway"
        ]
```

### D matthew7 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Beware of false prophets, which come to you in sheep's clothing, but inwardly they are ravening",
        "a": "wolves",
        "suffix": ".",
        "d": [
          "lions",
          "dogs",
          "serpents"
        ]
```

Replace with:

```js
"prefix": "Beware of false prophets, which come to you in sheep's clothing, but inwardly they are ravening",
        "a": "wolves",
        "suffix": ".",
        "d": [
          "lions",
          "dogs",
          "serpents",
          "oxen",
          "eagles"
        ]
```

### D matthew7 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ye shall know them by their",
        "a": "fruits",
        "suffix": ". Do men gather grapes of thorns, or figs of thistles?",
        "d": [
          "words",
          "deeds",
          "works"
        ]
```

Replace with:

```js
"prefix": "Ye shall know them by their",
        "a": "fruits",
        "suffix": ". Do men gather grapes of thorns, or figs of thistles?",
        "d": [
          "words",
          "deeds",
          "works",
          "ways",
          "names"
        ]
```

### D matthew7 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "whosoever heareth these sayings of mine, and doeth them, I will liken him unto a wise man, which built his house upon a",
        "a": "rock",
        "suffix": ":",
        "d": [
          "hill",
          "stone",
          "cliff"
        ]
```

Replace with:

```js
"prefix": "whosoever heareth these sayings of mine, and doeth them, I will liken him unto a wise man, which built his house upon a",
        "a": "rock",
        "suffix": ":",
        "d": [
          "hill",
          "stone",
          "cliff",
          "mountain",
          "river"
        ]
```

### D mark1 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The beginning of the gospel of Jesus Christ, the Son of",
        "a": "God",
        "suffix": ";",
        "d": [
          "man",
          "David",
          "glory"
        ]
```

Replace with:

```js
"prefix": "The beginning of the gospel of Jesus Christ, the Son of",
        "a": "God",
        "suffix": ";",
        "d": [
          "man",
          "David",
          "glory",
          "Abraham",
          "Adam"
        ]
```

### D mark1 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The voice of one crying in the wilderness, Prepare ye the way of the Lord, make his paths",
        "a": "straight",
        "suffix": ".",
        "d": [
          "plain",
          "level",
          "open"
        ]
```

Replace with:

```js
"prefix": "The voice of one crying in the wilderness, Prepare ye the way of the Lord, make his paths",
        "a": "straight",
        "suffix": ".",
        "d": [
          "plain",
          "level",
          "open",
          "crooked",
          "narrow"
        ]
```

### D mark1 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I indeed have baptized you with water: but he shall baptize you with the Holy",
        "a": "Ghost",
        "suffix": ".",
        "d": [
          "fire",
          "water",
          "grace"
        ]
```

Replace with:

```js
"prefix": "I indeed have baptized you with water: but he shall baptize you with the Holy",
        "a": "Ghost",
        "suffix": ".",
        "d": [
          "fire",
          "water",
          "grace",
          "Power",
          "Angel"
        ]
```

### D mark1 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And there came a voice from heaven, saying, Thou art my beloved Son, in whom I am well",
        "a": "pleased",
        "suffix": ".",
        "d": [
          "content",
          "glad",
          "honoured"
        ]
```

Replace with:

```js
"prefix": "And there came a voice from heaven, saying, Thou art my beloved Son, in whom I am well",
        "a": "pleased",
        "suffix": ".",
        "d": [
          "content",
          "glad",
          "honoured",
          "displeased",
          "grieved"
        ]
```

### D mark1 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The time is fulfilled, and the kingdom of God is at hand:",
        "a": "repent",
        "suffix": "ye, and believe the gospel.",
        "d": [
          "return",
          "watch",
          "pray"
        ]
```

Replace with:

```js
"prefix": "The time is fulfilled, and the kingdom of God is at hand:",
        "a": "repent",
        "suffix": "ye, and believe the gospel.",
        "d": [
          "return",
          "watch",
          "pray",
          "rejoice",
          "hear"
        ]
```

### D mark1 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Come ye after me, and I will make you to become fishers of",
        "a": "men",
        "suffix": ".",
        "d": [
          "souls",
          "sheep",
          "nations"
        ]
```

Replace with:

```js
"prefix": "Come ye after me, and I will make you to become fishers of",
        "a": "men",
        "suffix": ".",
        "d": [
          "souls",
          "sheep",
          "nations",
          "beasts",
          "gods"
        ]
```

### D mark1 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Jesus rebuked him, saying, Hold thy peace, and come out of",
        "a": "him",
        "suffix": ".",
        "d": [
          "me",
          "them",
          "ye"
        ]
```

Replace with:

```js
"prefix": "And Jesus rebuked him, saying, Hold thy peace, and come out of",
        "a": "him",
        "suffix": ".",
        "d": [
          "me",
          "them",
          "ye",
          "her",
          "it"
        ]
```

### D mark1 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he healed many that were sick of divers",
        "a": "diseases",
        "suffix": ", and cast out many devils; and suffered not the devils to speak, because they knew him.",
        "d": [
          "plagues",
          "sicknesses",
          "ills"
        ]
```

Replace with:

```js
"prefix": "And he healed many that were sick of divers",
        "a": "diseases",
        "suffix": ", and cast out many devils; and suffered not the devils to speak, because they knew him.",
        "d": [
          "plagues",
          "sicknesses",
          "ills",
          "sorrows",
          "measures"
        ]
```

### D luke1 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Fear not, Zacharias: for thy prayer is",
        "a": "heard",
        "suffix": "; and thy wife Elisabeth shall bear thee a son, and thou shalt call his name John.",
        "d": [
          "known",
          "answered",
          "seen"
        ]
```

Replace with:

```js
"prefix": "Fear not, Zacharias: for thy prayer is",
        "a": "heard",
        "suffix": "; and thy wife Elisabeth shall bear thee a son, and thou shalt call his name John.",
        "d": [
          "known",
          "answered",
          "seen",
          "granted",
          "forgiven"
        ]
```

### D luke1 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "he shall be great in the sight of the Lord, and shall drink neither wine nor strong drink; and he shall be filled with the Holy",
        "a": "Ghost",
        "suffix": ", even from his mother's womb.",
        "d": [
          "Spirit",
          "grace",
          "faith"
        ]
```

Replace with:

```js
"prefix": "he shall be great in the sight of the Lord, and shall drink neither wine nor strong drink; and he shall be filled with the Holy",
        "a": "Ghost",
        "suffix": ", even from his mother's womb.",
        "d": [
          "Spirit",
          "grace",
          "faith",
          "Wisdom",
          "Light"
        ]
```

### D luke1 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Fear not, Mary: for thou hast found",
        "a": "favour",
        "suffix": "with God.",
        "d": [
          "grace",
          "peace",
          "mercy"
        ]
```

Replace with:

```js
"prefix": "Fear not, Mary: for thou hast found",
        "a": "favour",
        "suffix": "with God.",
        "d": [
          "grace",
          "peace",
          "mercy",
          "rest",
          "help"
        ]
```

### D luke1 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "thou shalt conceive in thy womb, and bring forth a son, and shalt call his name",
        "a": "JESUS",
        "suffix": ".",
        "d": [
          "Emmanuel",
          "Saviour",
          "Christ"
        ]
```

Replace with:

```js
"prefix": "thou shalt conceive in thy womb, and bring forth a son, and shalt call his name",
        "a": "JESUS",
        "suffix": ".",
        "d": [
          "Emmanuel",
          "Saviour",
          "Christ",
          "JOHN",
          "ISAAC"
        ]
```

### D luke1 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He shall be great, and shall be called the Son of the",
        "a": "Highest",
        "suffix": ": and the Lord God shall give unto him the throne of his father David:",
        "d": [
          "King",
          "Lord",
          "Living"
        ]
```

Replace with:

```js
"prefix": "He shall be great, and shall be called the Son of the",
        "a": "Highest",
        "suffix": ": and the Lord God shall give unto him the throne of his father David:",
        "d": [
          "King",
          "Lord",
          "Living",
          "Mighty",
          "Holy"
        ]
```

### D luke1 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For with God nothing shall be",
        "a": "impossible",
        "suffix": ".",
        "d": [
          "hidden",
          "denied",
          "lost"
        ]
```

Replace with:

```js
"prefix": "For with God nothing shall be",
        "a": "impossible",
        "suffix": ".",
        "d": [
          "hidden",
          "denied",
          "lost",
          "hard",
          "cold"
        ]
```

### D luke1 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "behold the handmaid of the Lord; be it unto me according to thy",
        "a": "word",
        "suffix": ". And the angel departed from her.",
        "d": [
          "will",
          "promise",
          "grace"
        ]
```

Replace with:

```js
"prefix": "behold the handmaid of the Lord; be it unto me according to thy",
        "a": "word",
        "suffix": ". And the angel departed from her.",
        "d": [
          "will",
          "promise",
          "grace",
          "command",
          "law"
        ]
```

### D luke1 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "My soul doth magnify the",
        "a": "Lord",
        "suffix": ", and my spirit hath rejoiced in God my Saviour.",
        "d": [
          "Father",
          "King",
          "God"
        ]
```

Replace with:

```js
"prefix": "My soul doth magnify the",
        "a": "Lord",
        "suffix": ", and my spirit hath rejoiced in God my Saviour.",
        "d": [
          "Father",
          "King",
          "God",
          "Creator",
          "Christ"
        ]
```

### D luke10 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The harvest truly is great, but the labourers are",
        "a": "few",
        "suffix": ": pray ye therefore the Lord of the harvest, that he would send forth labourers into his harvest.",
        "d": [
          "ready",
          "gone",
          "weak"
        ]
```

Replace with:

```js
"prefix": "The harvest truly is great, but the labourers are",
        "a": "few",
        "suffix": ": pray ye therefore the Lord of the harvest, that he would send forth labourers into his harvest.",
        "d": [
          "ready",
          "gone",
          "weak",
          "many",
          "rich"
        ]
```

### D luke10 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I send you forth as",
        "a": "lambs",
        "suffix": "among wolves.",
        "d": [
          "sheep",
          "doves",
          "children"
        ]
```

Replace with:

```js
"prefix": "I send you forth as",
        "a": "lambs",
        "suffix": "among wolves.",
        "d": [
          "sheep",
          "doves",
          "children",
          "goats",
          "lions"
        ]
```

### D luke10 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "into whatsoever house ye enter, first say,",
        "a": "Peace",
        "suffix": "be to this house.",
        "d": [
          "Grace",
          "Joy",
          "Health"
        ]
```

Replace with:

```js
"prefix": "into whatsoever house ye enter, first say,",
        "a": "Peace",
        "suffix": "be to this house.",
        "d": [
          "Grace",
          "Joy",
          "Health",
          "Mercy",
          "Blessing"
        ]
```

### D luke10 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy strength, and with all thy",
        "a": "mind",
        "suffix": "; and thy neighbour as thyself.",
        "d": [
          "might",
          "being",
          "life"
        ]
```

Replace with:

```js
"prefix": "Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy strength, and with all thy",
        "a": "mind",
        "suffix": "; and thy neighbour as thyself.",
        "d": [
          "might",
          "being",
          "life",
          "body",
          "will"
        ]
```

### D luke10 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But he, willing to justify himself, said unto Jesus, And who is my",
        "a": "neighbour",
        "suffix": "?",
        "d": [
          "brother",
          "friend",
          "equal"
        ]
```

Replace with:

```js
"prefix": "But he, willing to justify himself, said unto Jesus, And who is my",
        "a": "neighbour",
        "suffix": "?",
        "d": [
          "brother",
          "friend",
          "equal",
          "kinsman",
          "enemy"
        ]
```

### D luke10 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But a certain Samaritan, as he journeyed, came where he was: and when he saw him, he had",
        "a": "compassion",
        "suffix": "on him,",
        "d": [
          "mercy",
          "pity",
          "love"
        ]
```

Replace with:

```js
"prefix": "But a certain Samaritan, as he journeyed, came where he was: and when he saw him, he had",
        "a": "compassion",
        "suffix": "on him,",
        "d": [
          "mercy",
          "pity",
          "love",
          "anger",
          "fear"
        ]
```

### D luke10 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Which now of these three, thinkest thou, was neighbour unto him that fell among the",
        "a": "thieves",
        "suffix": "?",
        "d": [
          "robbers",
          "men",
          "dead"
        ]
```

Replace with:

```js
"prefix": "Which now of these three, thinkest thou, was neighbour unto him that fell among the",
        "a": "thieves",
        "suffix": "?",
        "d": [
          "robbers",
          "men",
          "dead",
          "enemies",
          "beasts"
        ]
```

### D luke10 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Martha, Martha, thou art careful and troubled about many",
        "a": "things",
        "suffix": ":",
        "d": [
          "works",
          "tasks",
          "needs"
        ]
```

Replace with:

```js
"prefix": "Martha, Martha, thou art careful and troubled about many",
        "a": "things",
        "suffix": ":",
        "d": [
          "works",
          "tasks",
          "needs",
          "cares",
          "sorrows"
        ]
```

### D luke12 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Beware ye of the leaven of the Pharisees, which is",
        "a": "hypocrisy",
        "suffix": ".",
        "d": [
          "pride",
          "envy",
          "lies"
        ]
```

Replace with:

```js
"prefix": "Beware ye of the leaven of the Pharisees, which is",
        "a": "hypocrisy",
        "suffix": ".",
        "d": [
          "pride",
          "envy",
          "lies",
          "malice",
          "covetousness"
        ]
```

### D luke12 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For there is nothing covered, that shall not be",
        "a": "revealed",
        "suffix": "; neither hid, that shall not be known.",
        "d": [
          "hidden",
          "shown",
          "spoken"
        ]
```

Replace with:

```js
"prefix": "For there is nothing covered, that shall not be",
        "a": "revealed",
        "suffix": "; neither hid, that shall not be known.",
        "d": [
          "hidden",
          "shown",
          "spoken",
          "destroyed",
          "forgotten"
        ]
```

### D luke12 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Are not five sparrows sold for two farthings, and not one of them is",
        "a": "forgotten",
        "suffix": "before God?",
        "d": [
          "known",
          "named",
          "lost"
        ]
```

Replace with:

```js
"prefix": "Are not five sparrows sold for two farthings, and not one of them is",
        "a": "forgotten",
        "suffix": "before God?",
        "d": [
          "known",
          "named",
          "lost",
          "seen",
          "heard"
        ]
```

### D luke12 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But even the very hairs of your head are all",
        "a": "numbered",
        "suffix": ". Fear not therefore: ye are of more value than many sparrows.",
        "d": [
          "counted",
          "known",
          "kept"
        ]
```

Replace with:

```js
"prefix": "But even the very hairs of your head are all",
        "a": "numbered",
        "suffix": ". Fear not therefore: ye are of more value than many sparrows.",
        "d": [
          "counted",
          "known",
          "kept",
          "white",
          "green"
        ]
```

### D luke12 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Take heed, and beware of covetousness: for a man's life consisteth not in the abundance of the things which he",
        "a": "possesseth",
        "suffix": ".",
        "d": [
          "owneth",
          "keeps",
          "gathereth"
        ]
```

Replace with:

```js
"prefix": "Take heed, and beware of covetousness: for a man's life consisteth not in the abundance of the things which he",
        "a": "possesseth",
        "suffix": ".",
        "d": [
          "owneth",
          "keeps",
          "gathereth",
          "seeketh",
          "burneth"
        ]
```

### D luke12 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Take no thought for your life, what ye shall",
        "a": "eat",
        "suffix": "; neither for the body, what ye shall put on.",
        "d": [
          "drink",
          "wear",
          "lack"
        ]
```

Replace with:

```js
"prefix": "Take no thought for your life, what ye shall",
        "a": "eat",
        "suffix": "; neither for the body, what ye shall put on.",
        "d": [
          "drink",
          "wear",
          "lack",
          "taste",
          "buy"
        ]
```

### D luke12 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Consider the",
        "a": "lilies",
        "suffix": "how they grow: they toil not, they spin not; and yet I say unto you, that Solomon in all his glory was not arrayed like one of these.",
        "d": [
          "flowers",
          "fields",
          "roses"
        ]
```

Replace with:

```js
"prefix": "Consider the",
        "a": "lilies",
        "suffix": "how they grow: they toil not, they spin not; and yet I say unto you, that Solomon in all his glory was not arrayed like one of these.",
        "d": [
          "flowers",
          "fields",
          "roses",
          "ravens",
          "trees"
        ]
```

### D luke12 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For where your treasure is, there will your",
        "a": "heart",
        "suffix": "be also.",
        "d": [
          "hope",
          "wealth",
          "soul"
        ]
```

Replace with:

```js
"prefix": "For where your treasure is, there will your",
        "a": "heart",
        "suffix": "be also.",
        "d": [
          "hope",
          "wealth",
          "soul",
          "mind",
          "joy"
        ]
```

### D john2 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "there was a marriage in",
        "a": "Cana",
        "suffix": "of Galilee; and the mother of Jesus was there:",
        "d": [
          "Nazareth",
          "Capernaum",
          "Bethany"
        ]
```

Replace with:

```js
"prefix": "there was a marriage in",
        "a": "Cana",
        "suffix": "of Galilee; and the mother of Jesus was there:",
        "d": [
          "Nazareth",
          "Capernaum",
          "Bethany",
          "Bethsaida",
          "Jericho"
        ]
```

### D john2 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And when they wanted",
        "a": "wine",
        "suffix": ", the mother of Jesus saith unto him, They have no wine.",
        "d": [
          "bread",
          "help",
          "room"
        ]
```

Replace with:

```js
"prefix": "And when they wanted",
        "a": "wine",
        "suffix": ", the mother of Jesus saith unto him, They have no wine.",
        "d": [
          "bread",
          "help",
          "room",
          "oil",
          "water"
        ]
```

### D john2 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Jesus saith unto her, Woman, what have I to do with thee? mine",
        "a": "hour",
        "suffix": "is not yet come.",
        "d": [
          "time",
          "day",
          "work"
        ]
```

Replace with:

```js
"prefix": "Jesus saith unto her, Woman, what have I to do with thee? mine",
        "a": "hour",
        "suffix": "is not yet come.",
        "d": [
          "time",
          "day",
          "work",
          "glory",
          "power"
        ]
```

### D john2 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Jesus saith unto them, Fill the waterpots with",
        "a": "water",
        "suffix": ". And they filled them up to the brim.",
        "d": [
          "wine",
          "oil",
          "grain"
        ]
```

Replace with:

```js
"prefix": "Jesus saith unto them, Fill the waterpots with",
        "a": "water",
        "suffix": ". And they filled them up to the brim.",
        "d": [
          "wine",
          "oil",
          "grain",
          "milk",
          "honey"
        ]
```

### D john2 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the ruler of the feast had tasted the water that was made wine, and knew not whence it was: (but the servants which drew the water",
        "a": "knew",
        "suffix": ";) the governor of the feast called the bridegroom,",
        "d": [
          "saw",
          "spake",
          "feared"
        ]
```

Replace with:

```js
"prefix": "the ruler of the feast had tasted the water that was made wine, and knew not whence it was: (but the servants which drew the water",
        "a": "knew",
        "suffix": ";) the governor of the feast called the bridegroom,",
        "d": [
          "saw",
          "spake",
          "feared",
          "heard",
          "drank"
        ]
```

### D john2 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "This beginning of",
        "a": "miracles",
        "suffix": "did Jesus in Cana of Galilee, and manifested forth his glory; and his disciples believed on him.",
        "d": [
          "signs",
          "works",
          "wonders"
        ]
```

Replace with:

```js
"prefix": "This beginning of",
        "a": "miracles",
        "suffix": "did Jesus in Cana of Galilee, and manifested forth his glory; and his disciples believed on him.",
        "d": [
          "signs",
          "works",
          "wonders",
          "power",
          "blessings"
        ]
```

### D john2 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "he poured out the changers' money, and overthrew the",
        "a": "tables",
        "suffix": ";",
        "d": [
          "seats",
          "trays",
          "coins"
        ]
```

Replace with:

```js
"prefix": "he poured out the changers' money, and overthrew the",
        "a": "tables",
        "suffix": ";",
        "d": [
          "seats",
          "trays",
          "coins",
          "altars",
          "doves"
        ]
```

### D john2 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Jesus answered and said unto them, Destroy this",
        "a": "temple",
        "suffix": ", and in three days I will raise it up.",
        "d": [
          "house",
          "body",
          "place"
        ]
```

Replace with:

```js
"prefix": "Jesus answered and said unto them, Destroy this",
        "a": "temple",
        "suffix": ", and in three days I will raise it up.",
        "d": [
          "house",
          "body",
          "place",
          "city",
          "altar"
        ]
```

### D john10 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He that entereth not by the door into the sheepfold, but climbeth up some other way, the same is a",
        "a": "thief",
        "suffix": "and a robber.",
        "d": [
          "wolf",
          "stranger",
          "coward"
        ]
```

Replace with:

```js
"prefix": "He that entereth not by the door into the sheepfold, but climbeth up some other way, the same is a",
        "a": "thief",
        "suffix": "and a robber.",
        "d": [
          "wolf",
          "stranger",
          "coward",
          "hireling",
          "shepherd"
        ]
```

### D john10 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the sheep hear his voice: and he calleth his own sheep by",
        "a": "name",
        "suffix": ", and leadeth them out.",
        "d": [
          "heart",
          "kind",
          "love"
        ]
```

Replace with:

```js
"prefix": "the sheep hear his voice: and he calleth his own sheep by",
        "a": "name",
        "suffix": ", and leadeth them out.",
        "d": [
          "heart",
          "kind",
          "love",
          "sign",
          "word"
        ]
```

### D john10 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am the door of the",
        "a": "sheep",
        "suffix": ".",
        "d": [
          "fold",
          "field",
          "world"
        ]
```

Replace with:

```js
"prefix": "I am the door of the",
        "a": "sheep",
        "suffix": ".",
        "d": [
          "fold",
          "field",
          "world",
          "house",
          "tent"
        ]
```

### D john10 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am the door: by me if any man enter in, he shall be",
        "a": "saved",
        "suffix": ", and shall go in and out, and find pasture.",
        "d": [
          "safe",
          "fed",
          "kept"
        ]
```

Replace with:

```js
"prefix": "I am the door: by me if any man enter in, he shall be",
        "a": "saved",
        "suffix": ", and shall go in and out, and find pasture.",
        "d": [
          "safe",
          "fed",
          "kept",
          "healed",
          "blessed"
        ]
```

### D john10 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am the good shepherd: the good shepherd giveth his life for the",
        "a": "sheep",
        "suffix": ".",
        "d": [
          "fold",
          "flock",
          "lambs"
        ]
```

Replace with:

```js
"prefix": "I am the good shepherd: the good shepherd giveth his life for the",
        "a": "sheep",
        "suffix": ".",
        "d": [
          "fold",
          "flock",
          "lambs",
          "people",
          "friends"
        ]
```

### D john10 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am the good shepherd, and",
        "a": "know",
        "suffix": "my sheep, and am known of mine.",
        "d": [
          "love",
          "keep",
          "feed"
        ]
```

Replace with:

```js
"prefix": "I am the good shepherd, and",
        "a": "know",
        "suffix": "my sheep, and am known of mine.",
        "d": [
          "love",
          "keep",
          "feed",
          "call",
          "lead"
        ]
```

### D john10 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "My sheep hear my",
        "a": "voice",
        "suffix": ", and I know them, and they follow me:",
        "d": [
          "name",
          "word",
          "call"
        ]
```

Replace with:

```js
"prefix": "My sheep hear my",
        "a": "voice",
        "suffix": ", and I know them, and they follow me:",
        "d": [
          "name",
          "word",
          "call",
          "sound",
          "cry"
        ]
```

### D john10 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And I give unto them eternal",
        "a": "life",
        "suffix": "; and they shall never perish, neither shall any man pluck them out of my hand.",
        "d": [
          "peace",
          "bread",
          "rest"
        ]
```

Replace with:

```js
"prefix": "And I give unto them eternal",
        "a": "life",
        "suffix": "; and they shall never perish, neither shall any man pluck them out of my hand.",
        "d": [
          "peace",
          "bread",
          "rest",
          "joy",
          "glory"
        ]
```

### D john20 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The first day of the week cometh Mary Magdalene early, when it was yet",
        "a": "dark",
        "suffix": ", unto the sepulchre, and seeth the stone taken away from the sepulchre.",
        "d": [
          "night",
          "dawn",
          "cold"
        ]
```

Replace with:

```js
"prefix": "The first day of the week cometh Mary Magdalene early, when it was yet",
        "a": "dark",
        "suffix": ", unto the sepulchre, and seeth the stone taken away from the sepulchre.",
        "d": [
          "night",
          "dawn",
          "cold",
          "light",
          "dry"
        ]
```

### D john20 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "they have taken away the Lord out of the sepulchre, and we know not where they have",
        "a": "laid",
        "suffix": "him.",
        "d": [
          "hid",
          "put",
          "gone"
        ]
```

Replace with:

```js
"prefix": "they have taken away the Lord out of the sepulchre, and we know not where they have",
        "a": "laid",
        "suffix": "him.",
        "d": [
          "hid",
          "put",
          "gone",
          "moved",
          "hidden"
        ]
```

### D john20 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For as yet they knew not the scripture, that he must rise again from the",
        "a": "dead",
        "suffix": ".",
        "d": [
          "death",
          "sleep",
          "darkness"
        ]
```

Replace with:

```js
"prefix": "For as yet they knew not the scripture, that he must rise again from the",
        "a": "dead",
        "suffix": ".",
        "d": [
          "death",
          "sleep",
          "darkness",
          "earth",
          "sea"
        ]
```

### D john20 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "She supposing him to be the gardener, saith unto him, Sir, if thou have",
        "a": "borne",
        "suffix": "him hence, tell me where thou hast laid him, and I will take him away.",
        "d": [
          "hidden",
          "carried",
          "laid"
        ]
```

Replace with:

```js
"prefix": "She supposing him to be the gardener, saith unto him, Sir, if thou have",
        "a": "borne",
        "suffix": "him hence, tell me where thou hast laid him, and I will take him away.",
        "d": [
          "hidden",
          "carried",
          "laid",
          "moved",
          "sent"
        ]
```

### D john20 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Jesus saith unto her,",
        "a": "Mary",
        "suffix": ". She turned herself, and saith unto him, Rabboni; which is to say, Master.",
        "d": [
          "Woman",
          "Martha",
          "Rabboni"
        ]
```

Replace with:

```js
"prefix": "Jesus saith unto her,",
        "a": "Mary",
        "suffix": ". She turned herself, and saith unto him, Rabboni; which is to say, Master.",
        "d": [
          "Woman",
          "Martha",
          "Rabboni",
          "Sarah",
          "Rachel"
        ]
```

### D john20 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "came Jesus and stood in the midst, and saith unto them,",
        "a": "Peace",
        "suffix": "be unto you.",
        "d": [
          "Grace",
          "Joy",
          "Fear not"
        ]
```

Replace with:

```js
"prefix": "came Jesus and stood in the midst, and saith unto them,",
        "a": "Peace",
        "suffix": "be unto you.",
        "d": [
          "Grace",
          "Joy",
          "Fear not",
          "Love",
          "Mercy"
        ]
```

### D john20 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thomas answered and said unto him, My Lord and my",
        "a": "God",
        "suffix": ".",
        "d": [
          "King",
          "Master",
          "Saviour"
        ]
```

Replace with:

```js
"prefix": "Thomas answered and said unto him, My Lord and my",
        "a": "God",
        "suffix": ".",
        "d": [
          "King",
          "Master",
          "Saviour",
          "Father",
          "Christ"
        ]
```

### D john20 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "because thou hast seen me, thou hast believed: blessed are they that have not",
        "a": "seen",
        "suffix": ", and yet have believed.",
        "d": [
          "known",
          "touched",
          "followed"
        ]
```

Replace with:

```js
"prefix": "because thou hast seen me, thou hast believed: blessed are they that have not",
        "a": "seen",
        "suffix": ", and yet have believed.",
        "d": [
          "known",
          "touched",
          "followed",
          "tasted",
          "eaten"
        ]
```

### D acts16 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And so were the churches established in the faith, and increased in",
        "a": "number",
        "suffix": "daily.",
        "d": [
          "grace",
          "strength",
          "favour"
        ]
```

Replace with:

```js
"prefix": "And so were the churches established in the faith, and increased in",
        "a": "number",
        "suffix": "daily.",
        "d": [
          "grace",
          "strength",
          "favour",
          "power",
          "measure"
        ]
```

### D acts16 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "there stood a man of Macedonia, and prayed him, saying, Come over into Macedonia, and",
        "a": "help",
        "suffix": "us.",
        "d": [
          "save",
          "teach",
          "see"
        ]
```

Replace with:

```js
"prefix": "there stood a man of Macedonia, and prayed him, saying, Come over into Macedonia, and",
        "a": "help",
        "suffix": "us.",
        "d": [
          "save",
          "teach",
          "see",
          "bless",
          "lead"
        ]
```

### D acts16 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "whose heart the Lord",
        "a": "opened",
        "suffix": ", that she attended unto the things which were spoken of Paul.",
        "d": [
          "softened",
          "touched",
          "changed"
        ]
```

Replace with:

```js
"prefix": "whose heart the Lord",
        "a": "opened",
        "suffix": ", that she attended unto the things which were spoken of Paul.",
        "d": [
          "softened",
          "touched",
          "changed",
          "kindled",
          "hardened"
        ]
```

### D acts16 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "These men are the servants of the most high God, which shew unto us the way of",
        "a": "salvation",
        "suffix": ".",
        "d": [
          "peace",
          "truth",
          "the Lord"
        ]
```

Replace with:

```js
"prefix": "These men are the servants of the most high God, which shew unto us the way of",
        "a": "salvation",
        "suffix": ".",
        "d": [
          "peace",
          "truth",
          "the Lord",
          "vengeance",
          "destruction"
        ]
```

### D acts16 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "at midnight Paul and Silas",
        "a": "prayed",
        "suffix": ", and sang praises unto God: and the prisoners heard them.",
        "d": [
          "sang",
          "called",
          "woke"
        ]
```

Replace with:

```js
"prefix": "at midnight Paul and Silas",
        "a": "prayed",
        "suffix": ", and sang praises unto God: and the prisoners heard them.",
        "d": [
          "sang",
          "called",
          "woke",
          "wept",
          "fasted"
        ]
```

### D acts16 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "suddenly there was a great",
        "a": "earthquake",
        "suffix": ", so that the foundations of the prison were shaken: and immediately all the doors were opened, and every one's bands were loosed.",
        "d": [
          "thunder",
          "wind",
          "noise"
        ]
```

Replace with:

```js
"prefix": "suddenly there was a great",
        "a": "earthquake",
        "suffix": ", so that the foundations of the prison were shaken: and immediately all the doors were opened, and every one's bands were loosed.",
        "d": [
          "thunder",
          "wind",
          "noise",
          "tempest",
          "flood"
        ]
```

### D acts16 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they said, Believe on the Lord Jesus Christ, and thou shalt be",
        "a": "saved",
        "suffix": ", and thy house.",
        "d": [
          "healed",
          "kept",
          "blessed"
        ]
```

Replace with:

```js
"prefix": "And they said, Believe on the Lord Jesus Christ, and thou shalt be",
        "a": "saved",
        "suffix": ", and thy house.",
        "d": [
          "healed",
          "kept",
          "blessed",
          "delivered",
          "chosen"
        ]
```

### D acts16 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and was baptized, he and all his,",
        "a": "straightway",
        "suffix": ": and he took them the same hour of the night, and washed their stripes; and was baptized, he and all his.",
        "d": [
          "then",
          "anon",
          "that hour"
        ]
```

Replace with:

```js
"prefix": "and was baptized, he and all his,",
        "a": "straightway",
        "suffix": ": and he took them the same hour of the night, and washed their stripes; and was baptized, he and all his.",
        "d": [
          "then",
          "anon",
          "that hour",
          "afterward",
          "gladly"
        ]
```

### D philippians4 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "my brethren dearly beloved and longed for, my",
        "a": "joy",
        "suffix": "and crown, so stand fast in the Lord, dearly beloved.",
        "d": [
          "hope",
          "crown",
          "peace"
        ]
```

Replace with:

```js
"prefix": "my brethren dearly beloved and longed for, my",
        "a": "joy",
        "suffix": "and crown, so stand fast in the Lord, dearly beloved.",
        "d": [
          "hope",
          "crown",
          "peace",
          "glory",
          "pride"
        ]
```

### D philippians4 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Rejoice in the Lord",
        "a": "alway",
        "suffix": ": and again I say, Rejoice.",
        "d": [
          "always",
          "today",
          "still"
        ]
```

Replace with:

```js
"prefix": "Rejoice in the Lord",
        "a": "alway",
        "suffix": ": and again I say, Rejoice.",
        "d": [
          "always",
          "today",
          "still",
          "sometimes",
          "never"
        ]
```

### D philippians4 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Let your moderation be known unto all men. The Lord is at",
        "a": "hand",
        "suffix": ".",
        "d": [
          "peace",
          "work",
          "rest"
        ]
```

Replace with:

```js
"prefix": "Let your moderation be known unto all men. The Lord is at",
        "a": "hand",
        "suffix": ".",
        "d": [
          "peace",
          "work",
          "rest",
          "war",
          "ease"
        ]
```

### D philippians4 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Be careful for nothing; but in every thing by prayer and supplication with",
        "a": "thanksgiving",
        "suffix": "let your requests be made known unto God.",
        "d": [
          "praise",
          "fasting",
          "faith"
        ]
```

Replace with:

```js
"prefix": "Be careful for nothing; but in every thing by prayer and supplication with",
        "a": "thanksgiving",
        "suffix": "let your requests be made known unto God.",
        "d": [
          "praise",
          "fasting",
          "faith",
          "tears",
          "humility"
        ]
```

### D philippians4 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the peace of God, which passeth all",
        "a": "understanding",
        "suffix": ", shall keep your hearts and minds through Christ Jesus.",
        "d": [
          "thought",
          "knowledge",
          "words"
        ]
```

Replace with:

```js
"prefix": "And the peace of God, which passeth all",
        "a": "understanding",
        "suffix": ", shall keep your hearts and minds through Christ Jesus.",
        "d": [
          "thought",
          "knowledge",
          "words",
          "power",
          "sorrow"
        ]
```

### D philippians4 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I have learned, in whatsoever state I am, therewith to be",
        "a": "content",
        "suffix": ".",
        "d": [
          "thankful",
          "patient",
          "still"
        ]
```

Replace with:

```js
"prefix": "I have learned, in whatsoever state I am, therewith to be",
        "a": "content",
        "suffix": ".",
        "d": [
          "thankful",
          "patient",
          "still",
          "afraid",
          "troubled"
        ]
```

### D philippians4 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I can do all things through",
        "a": "Christ",
        "suffix": "which strengtheneth me.",
        "d": [
          "faith",
          "grace",
          "God"
        ]
```

Replace with:

```js
"prefix": "I can do all things through",
        "a": "Christ",
        "suffix": "which strengtheneth me.",
        "d": [
          "faith",
          "grace",
          "God",
          "Moses",
          "David"
        ]
```

### D philippians4 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But my God shall",
        "a": "supply",
        "suffix": "all your need according to his riches in glory by Christ Jesus.",
        "d": [
          "give",
          "fill",
          "grant"
        ]
```

Replace with:

```js
"prefix": "But my God shall",
        "a": "supply",
        "suffix": "all your need according to his riches in glory by Christ Jesus.",
        "d": [
          "give",
          "fill",
          "grant",
          "remove",
          "forget"
        ]
```

### D exodus12 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "they shall take to them every man a",
        "a": "lamb",
        "suffix": ", according to the house of their fathers, a lamb for an house:",
        "d": [
          "goat",
          "bullock",
          "ram"
        ]
```

Replace with:

```js
"prefix": "they shall take to them every man a",
        "a": "lamb",
        "suffix": ", according to the house of their fathers, a lamb for an house:",
        "d": [
          "goat",
          "bullock",
          "ram",
          "calf",
          "dove"
        ]
```

### D exodus12 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Your lamb shall be without",
        "a": "blemish",
        "suffix": ", a male of the first year:",
        "d": [
          "spot",
          "fault",
          "sin"
        ]
```

Replace with:

```js
"prefix": "Your lamb shall be without",
        "a": "blemish",
        "suffix": ", a male of the first year:",
        "d": [
          "spot",
          "fault",
          "sin",
          "fear",
          "wound"
        ]
```

### D exodus12 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they shall take of the blood, and strike it on the two side posts and on the upper door",
        "a": "post",
        "suffix": "of the houses,",
        "d": [
          "frame",
          "beam",
          "sill"
        ]
```

Replace with:

```js
"prefix": "And they shall take of the blood, and strike it on the two side posts and on the upper door",
        "a": "post",
        "suffix": "of the houses,",
        "d": [
          "frame",
          "beam",
          "sill",
          "gate",
          "window"
        ]
```

### D exodus12 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and ye shall eat it in haste: it is the LORD'S",
        "a": "passover",
        "suffix": ".",
        "d": [
          "covenant",
          "feast",
          "supper"
        ]
```

Replace with:

```js
"prefix": "and ye shall eat it in haste: it is the LORD'S",
        "a": "passover",
        "suffix": ".",
        "d": [
          "covenant",
          "feast",
          "supper",
          "sacrifice",
          "offering"
        ]
```

### D exodus12 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and when I see the blood, I will pass",
        "a": "over",
        "suffix": "you, and the plague shall not be upon you to destroy you,",
        "d": [
          "by",
          "through",
          "near"
        ]
```

Replace with:

```js
"prefix": "and when I see the blood, I will pass",
        "a": "over",
        "suffix": "you, and the plague shall not be upon you to destroy you,",
        "d": [
          "by",
          "through",
          "near",
          "under",
          "beside"
        ]
```

### D exodus12 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And this day shall be unto you for a",
        "a": "memorial",
        "suffix": "; and ye shall keep it a feast to the LORD throughout your generations;",
        "d": [
          "sign",
          "token",
          "statute"
        ]
```

Replace with:

```js
"prefix": "And this day shall be unto you for a",
        "a": "memorial",
        "suffix": "; and ye shall keep it a feast to the LORD throughout your generations;",
        "d": [
          "sign",
          "token",
          "statute",
          "reproach",
          "warning"
        ]
```

### D exodus12 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And it came to pass, that at",
        "a": "midnight",
        "suffix": "the LORD smote all the firstborn in the land of Egypt,",
        "d": [
          "evening",
          "daybreak",
          "noon"
        ]
```

Replace with:

```js
"prefix": "And it came to pass, that at",
        "a": "midnight",
        "suffix": "the LORD smote all the firstborn in the land of Egypt,",
        "d": [
          "evening",
          "daybreak",
          "noon",
          "morning",
          "day"
        ]
```

### D exodus12 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he called for Moses and Aaron by night, and said, Rise up, and get you",
        "a": "forth",
        "suffix": "from among my people,",
        "d": [
          "away",
          "out",
          "flee"
        ]
```

Replace with:

```js
"prefix": "And he called for Moses and Aaron by night, and said, Rise up, and get you",
        "a": "forth",
        "suffix": "from among my people,",
        "d": [
          "away",
          "out",
          "flee",
          "abroad",
          "apart"
        ]
```

### D exodus32 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for as for this Moses, the man that brought us up out of the land of Egypt, we wot not what is become of",
        "a": "him",
        "suffix": ".",
        "d": [
          "us",
          "them",
          "this"
        ]
```

Replace with:

```js
"prefix": "for as for this Moses, the man that brought us up out of the land of Egypt, we wot not what is become of",
        "a": "him",
        "suffix": ".",
        "d": [
          "us",
          "them",
          "this",
          "it",
          "her"
        ]
```

### D exodus32 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and fashioned it with a graving tool, after he had made it a molten",
        "a": "calf",
        "suffix": ":",
        "d": [
          "image",
          "idol",
          "bull"
        ]
```

Replace with:

```js
"prefix": "and fashioned it with a graving tool, after he had made it a molten",
        "a": "calf",
        "suffix": ":",
        "d": [
          "image",
          "idol",
          "bull",
          "lamb",
          "stone"
        ]
```

### D exodus32 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I have seen this people, and, behold, it is a",
        "a": "stiffnecked",
        "suffix": "people:",
        "d": [
          "stubborn",
          "rebellious",
          "wicked"
        ]
```

Replace with:

```js
"prefix": "I have seen this people, and, behold, it is a",
        "a": "stiffnecked",
        "suffix": "people:",
        "d": [
          "stubborn",
          "rebellious",
          "wicked",
          "faithful",
          "patient"
        ]
```

### D exodus32 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and Moses' anger waxed hot, and he cast the tables out of his hands, and",
        "a": "brake",
        "suffix": "them beneath the mount.",
        "d": [
          "burned",
          "dashed",
          "dropped"
        ]
```

Replace with:

```js
"prefix": "and Moses' anger waxed hot, and he cast the tables out of his hands, and",
        "a": "brake",
        "suffix": "them beneath the mount.",
        "d": [
          "burned",
          "dashed",
          "dropped",
          "hid",
          "laid"
        ]
```

### D exodus32 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he took the calf which they had made, and burnt it in the",
        "a": "fire",
        "suffix": ", and ground it to powder,",
        "d": [
          "furnace",
          "flame",
          "heat"
        ]
```

Replace with:

```js
"prefix": "And he took the calf which they had made, and burnt it in the",
        "a": "fire",
        "suffix": ", and ground it to powder,",
        "d": [
          "furnace",
          "flame",
          "heat",
          "wilderness",
          "garden"
        ]
```

### D exodus32 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then Moses stood in the gate of the camp, and said, Who is on the LORD'S",
        "a": "side",
        "suffix": "? let him come unto me.",
        "d": [
          "hand",
          "part",
          "way"
        ]
```

Replace with:

```js
"prefix": "Then Moses stood in the gate of the camp, and said, Who is on the LORD'S",
        "a": "side",
        "suffix": "? let him come unto me.",
        "d": [
          "hand",
          "part",
          "way",
          "host",
          "throne"
        ]
```

### D exodus32 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Yet now, if thou wilt forgive their sin--; and if not, blot me, I pray thee, out of thy",
        "a": "book",
        "suffix": "which thou hast written.",
        "d": [
          "scroll",
          "life",
          "record"
        ]
```

Replace with:

```js
"prefix": "Yet now, if thou wilt forgive their sin--; and if not, blot me, I pray thee, out of thy",
        "a": "book",
        "suffix": "which thou hast written.",
        "d": [
          "scroll",
          "life",
          "record",
          "law",
          "word"
        ]
```

### D exodus32 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "behold, mine",
        "a": "Angel",
        "suffix": "shall go before thee: nevertheless in the day when I visit I will visit their sin upon them.",
        "d": [
          "Spirit",
          "Presence",
          "Cloud"
        ]
```

Replace with:

```js
"prefix": "behold, mine",
        "a": "Angel",
        "suffix": "shall go before thee: nevertheless in the day when I visit I will visit their sin upon them.",
        "d": [
          "Spirit",
          "Presence",
          "Cloud",
          "Captain",
          "Prophet"
        ]
```

### D leviticus19 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ye shall be holy: for I the LORD your God am",
        "a": "holy",
        "suffix": ".",
        "d": [
          "just",
          "pure",
          "true"
        ]
```

Replace with:

```js
"prefix": "Ye shall be holy: for I the LORD your God am",
        "a": "holy",
        "suffix": ".",
        "d": [
          "just",
          "pure",
          "true",
          "jealous",
          "mighty"
        ]
```

### D leviticus19 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "thou shalt not wholly reap the corners of thy field, neither shalt thou gather the",
        "a": "gleanings",
        "suffix": "of thy harvest.",
        "d": [
          "remnant",
          "corn",
          "sheaves"
        ]
```

Replace with:

```js
"prefix": "thou shalt not wholly reap the corners of thy field, neither shalt thou gather the",
        "a": "gleanings",
        "suffix": "of thy harvest.",
        "d": [
          "remnant",
          "corn",
          "sheaves",
          "fruits",
          "grapes"
        ]
```

### D leviticus19 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ye shall not steal, neither deal falsely, neither",
        "a": "lie",
        "suffix": "one to another.",
        "d": [
          "swear",
          "speak",
          "boast"
        ]
```

Replace with:

```js
"prefix": "Ye shall not steal, neither deal falsely, neither",
        "a": "lie",
        "suffix": "one to another.",
        "d": [
          "swear",
          "speak",
          "boast",
          "covet",
          "curse"
        ]
```

### D leviticus19 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the wages of him that is hired shall not abide with thee all night until the",
        "a": "morning",
        "suffix": ".",
        "d": [
          "sun",
          "daybreak",
          "morrow"
        ]
```

Replace with:

```js
"prefix": "the wages of him that is hired shall not abide with thee all night until the",
        "a": "morning",
        "suffix": ".",
        "d": [
          "sun",
          "daybreak",
          "morrow",
          "evening",
          "noonday"
        ]
```

### D leviticus19 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou shalt not curse the deaf, nor put a",
        "a": "stumblingblock",
        "suffix": "before the blind, but shalt fear thy God: I am the LORD.",
        "d": [
          "snare",
          "stone",
          "trap"
        ]
```

Replace with:

```js
"prefix": "Thou shalt not curse the deaf, nor put a",
        "a": "stumblingblock",
        "suffix": "before the blind, but shalt fear thy God: I am the LORD.",
        "d": [
          "snare",
          "stone",
          "trap",
          "burden",
          "sword"
        ]
```

### D leviticus19 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou shalt not hate thy brother in thine",
        "a": "heart",
        "suffix": ":",
        "d": [
          "mind",
          "soul",
          "house"
        ]
```

Replace with:

```js
"prefix": "Thou shalt not hate thy brother in thine",
        "a": "heart",
        "suffix": ":",
        "d": [
          "mind",
          "soul",
          "house",
          "eye",
          "hand"
        ]
```

### D leviticus19 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as",
        "a": "thyself",
        "suffix": ": I am the LORD.",
        "d": [
          "a brother",
          "a friend",
          "thy life"
        ]
```

Replace with:

```js
"prefix": "Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as",
        "a": "thyself",
        "suffix": ": I am the LORD.",
        "d": [
          "a brother",
          "a friend",
          "thy life",
          "himself",
          "herself"
        ]
```

### D leviticus19 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the stranger that dwelleth with you shall be unto you as one born among you, and thou shalt love him as",
        "a": "thyself",
        "suffix": "; for ye were strangers in the land of Egypt:",
        "d": [
          "thy son",
          "a brother",
          "thy kin"
        ]
```

Replace with:

```js
"prefix": "the stranger that dwelleth with you shall be unto you as one born among you, and thou shalt love him as",
        "a": "thyself",
        "suffix": "; for ye were strangers in the land of Egypt:",
        "d": [
          "thy son",
          "a brother",
          "thy kin",
          "myself",
          "themselves"
        ]
```

### D deuteronomy28 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "if thou shalt hearken diligently unto the voice of the LORD thy God, to observe and to do all his",
        "a": "commandments",
        "suffix": "which I command thee this day,",
        "d": [
          "statutes",
          "laws",
          "ways"
        ]
```

Replace with:

```js
"prefix": "if thou shalt hearken diligently unto the voice of the LORD thy God, to observe and to do all his",
        "a": "commandments",
        "suffix": "which I command thee this day,",
        "d": [
          "statutes",
          "laws",
          "ways",
          "judgments",
          "promises"
        ]
```

### D deuteronomy28 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And all these blessings shall come on thee, and",
        "a": "overtake",
        "suffix": "thee, if thou shalt hearken unto the voice of the LORD thy God.",
        "d": [
          "follow",
          "cover",
          "fill"
        ]
```

Replace with:

```js
"prefix": "And all these blessings shall come on thee, and",
        "a": "overtake",
        "suffix": "thee, if thou shalt hearken unto the voice of the LORD thy God.",
        "d": [
          "follow",
          "cover",
          "fill",
          "forsake",
          "forget"
        ]
```

### D deuteronomy28 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Blessed shalt thou be in the city, and blessed shalt thou be in the",
        "a": "field",
        "suffix": ".",
        "d": [
          "land",
          "gate",
          "house"
        ]
```

Replace with:

```js
"prefix": "Blessed shalt thou be in the city, and blessed shalt thou be in the",
        "a": "field",
        "suffix": ".",
        "d": [
          "land",
          "gate",
          "house",
          "garden",
          "wilderness"
        ]
```

### D deuteronomy28 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Blessed shalt thou be when thou comest in, and blessed shalt thou be when thou",
        "a": "goest",
        "suffix": "out.",
        "d": [
          "walkest",
          "departest",
          "sleepest"
        ]
```

Replace with:

```js
"prefix": "Blessed shalt thou be when thou comest in, and blessed shalt thou be when thou",
        "a": "goest",
        "suffix": "out.",
        "d": [
          "walkest",
          "departest",
          "sleepest",
          "sittest",
          "risest"
        ]
```

### D deuteronomy28 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "they shall come out against thee one way, and flee before thee",
        "a": "seven",
        "suffix": "ways.",
        "d": [
          "three",
          "many",
          "ten"
        ]
```

Replace with:

```js
"prefix": "they shall come out against thee one way, and flee before thee",
        "a": "seven",
        "suffix": "ways.",
        "d": [
          "three",
          "many",
          "ten",
          "four",
          "twelve"
        ]
```

### D deuteronomy28 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD shall command the blessing upon thee in thy",
        "a": "storehouses",
        "suffix": ", and in all that thou settest thine hand unto;",
        "d": [
          "barns",
          "fields",
          "dwellings"
        ]
```

Replace with:

```js
"prefix": "The LORD shall command the blessing upon thee in thy",
        "a": "storehouses",
        "suffix": ", and in all that thou settest thine hand unto;",
        "d": [
          "barns",
          "fields",
          "dwellings",
          "cities",
          "kingdoms"
        ]
```

### D deuteronomy28 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD shall establish thee an",
        "a": "holy",
        "suffix": "people unto himself, as he hath sworn unto thee,",
        "d": [
          "chosen",
          "righteous",
          "great"
        ]
```

Replace with:

```js
"prefix": "The LORD shall establish thee an",
        "a": "holy",
        "suffix": "people unto himself, as he hath sworn unto thee,",
        "d": [
          "chosen",
          "righteous",
          "great",
          "everlasting",
          "ancient"
        ]
```

### D deuteronomy28 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the LORD shall make thee the",
        "a": "head",
        "suffix": ", and not the tail; and thou shalt be above only, and thou shalt not be beneath;",
        "d": [
          "crown",
          "first",
          "king"
        ]
```

Replace with:

```js
"prefix": "And the LORD shall make thee the",
        "a": "head",
        "suffix": ", and not the tail; and thou shalt be above only, and thou shalt not be beneath;",
        "d": [
          "crown",
          "first",
          "king",
          "eye",
          "hand"
        ]
```

### D deuteronomy30 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For this commandment which I command thee this day, it is not hidden from thee, neither is it far",
        "a": "off",
        "suffix": ".",
        "d": [
          "away",
          "above",
          "out"
        ]
```

Replace with:

```js
"prefix": "For this commandment which I command thee this day, it is not hidden from thee, neither is it far",
        "a": "off",
        "suffix": ".",
        "d": [
          "away",
          "above",
          "out",
          "behind",
          "beneath"
        ]
```

### D deuteronomy30 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "It is not in",
        "a": "heaven",
        "suffix": ", that thou shouldest say, Who shall go up for us to heaven, and bring it unto us,",
        "d": [
          "the clouds",
          "the sky",
          "Zion"
        ]
```

Replace with:

```js
"prefix": "It is not in",
        "a": "heaven",
        "suffix": ", that thou shouldest say, Who shall go up for us to heaven, and bring it unto us,",
        "d": [
          "the clouds",
          "the sky",
          "Zion",
          "earth",
          "waters"
        ]
```

### D deuteronomy30 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Neither is it beyond the",
        "a": "sea",
        "suffix": ", that thou shouldest say, Who shall go over the sea for us,",
        "d": [
          "deep",
          "ocean",
          "flood"
        ]
```

Replace with:

```js
"prefix": "Neither is it beyond the",
        "a": "sea",
        "suffix": ", that thou shouldest say, Who shall go over the sea for us,",
        "d": [
          "deep",
          "ocean",
          "flood",
          "river",
          "mountain"
        ]
```

### D deuteronomy30 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But the word is very nigh unto thee, in thy mouth, and in thy",
        "a": "heart",
        "suffix": ", that thou mayest do it.",
        "d": [
          "mind",
          "soul",
          "breast"
        ]
```

Replace with:

```js
"prefix": "But the word is very nigh unto thee, in thy mouth, and in thy",
        "a": "heart",
        "suffix": ", that thou mayest do it.",
        "d": [
          "mind",
          "soul",
          "breast",
          "hand",
          "head"
        ]
```

### D deuteronomy30 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "See, I have set before thee this day life and good, and",
        "a": "death",
        "suffix": "and evil;",
        "d": [
          "judgment",
          "sorrow",
          "wrath"
        ]
```

Replace with:

```js
"prefix": "See, I have set before thee this day life and good, and",
        "a": "death",
        "suffix": "and evil;",
        "d": [
          "judgment",
          "sorrow",
          "wrath",
          "bondage",
          "sickness"
        ]
```

### D deuteronomy30 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I call heaven and earth to record this day against you, that I have set before you life and death, blessing and",
        "a": "cursing",
        "suffix": ":",
        "d": [
          "plague",
          "famine",
          "wrath"
        ]
```

Replace with:

```js
"prefix": "I call heaven and earth to record this day against you, that I have set before you life and death, blessing and",
        "a": "cursing",
        "suffix": ":",
        "d": [
          "plague",
          "famine",
          "wrath",
          "mourning",
          "weeping"
        ]
```

### D deuteronomy30 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "therefore choose",
        "a": "life",
        "suffix": ", that both thou and thy seed may live:",
        "d": [
          "peace",
          "the LORD",
          "truth"
        ]
```

Replace with:

```js
"prefix": "therefore choose",
        "a": "life",
        "suffix": ", that both thou and thy seed may live:",
        "d": [
          "peace",
          "the LORD",
          "truth",
          "wisdom",
          "riches"
        ]
```

### D deuteronomy30 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "That thou mayest love the LORD thy God, and that thou mayest obey his voice, and that thou mayest cleave unto him: for he is thy",
        "a": "life",
        "suffix": ", and the length of thy days:",
        "d": [
          "shield",
          "rock",
          "glory"
        ]
```

Replace with:

```js
"prefix": "That thou mayest love the LORD thy God, and that thou mayest obey his voice, and that thou mayest cleave unto him: for he is thy",
        "a": "life",
        "suffix": ", and the length of thy days:",
        "d": [
          "shield",
          "rock",
          "glory",
          "portion",
          "strength"
        ]
```

### D joshua24 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Now therefore fear the LORD, and serve him in sincerity and in",
        "a": "truth",
        "suffix": ":",
        "d": [
          "peace",
          "righteousness",
          "holiness"
        ]
```

Replace with:

```js
"prefix": "Now therefore fear the LORD, and serve him in sincerity and in",
        "a": "truth",
        "suffix": ":",
        "d": [
          "peace",
          "righteousness",
          "holiness",
          "faith",
          "love"
        ]
```

### D joshua24 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and put away the gods which your fathers served on the other side of the",
        "a": "flood",
        "suffix": ", and in Egypt; and serve ye the LORD.",
        "d": [
          "river",
          "sea",
          "mount"
        ]
```

Replace with:

```js
"prefix": "and put away the gods which your fathers served on the other side of the",
        "a": "flood",
        "suffix": ", and in Egypt; and serve ye the LORD.",
        "d": [
          "river",
          "sea",
          "mount",
          "wilderness",
          "hill"
        ]
```

### D joshua24 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "choose you this day whom ye will",
        "a": "serve",
        "suffix": "; whether the gods which your fathers served",
        "d": [
          "follow",
          "fear",
          "worship"
        ]
```

Replace with:

```js
"prefix": "choose you this day whom ye will",
        "a": "serve",
        "suffix": "; whether the gods which your fathers served",
        "d": [
          "follow",
          "fear",
          "worship",
          "praise",
          "forsake"
        ]
```

### D joshua24 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "but as for me and my house, we will serve the",
        "a": "LORD",
        "suffix": ".",
        "d": [
          "God",
          "King",
          "Most High"
        ]
```

Replace with:

```js
"prefix": "but as for me and my house, we will serve the",
        "a": "LORD",
        "suffix": ".",
        "d": [
          "God",
          "King",
          "Most High",
          "Baal",
          "Mammon"
        ]
```

### D joshua24 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "God forbid that we should forsake the LORD, to serve other",
        "a": "gods",
        "suffix": ";",
        "d": [
          "kings",
          "idols",
          "masters"
        ]
```

Replace with:

```js
"prefix": "God forbid that we should forsake the LORD, to serve other",
        "a": "gods",
        "suffix": ";",
        "d": [
          "kings",
          "idols",
          "masters",
          "nations",
          "men"
        ]
```

### D joshua24 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD our God will we serve, and his voice will we",
        "a": "obey",
        "suffix": ".",
        "d": [
          "hear",
          "keep",
          "follow"
        ]
```

Replace with:

```js
"prefix": "The LORD our God will we serve, and his voice will we",
        "a": "obey",
        "suffix": ".",
        "d": [
          "hear",
          "keep",
          "follow",
          "fear",
          "trust"
        ]
```

### D joshua24 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and took a great",
        "a": "stone",
        "suffix": ", and set it up there under an oak, that was by the sanctuary of the LORD.",
        "d": [
          "rock",
          "pillar",
          "tablet"
        ]
```

Replace with:

```js
"prefix": "and took a great",
        "a": "stone",
        "suffix": ", and set it up there under an oak, that was by the sanctuary of the LORD.",
        "d": [
          "rock",
          "pillar",
          "tablet",
          "altar",
          "tree"
        ]
```

### D joshua24 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Behold, this stone shall be a",
        "a": "witness",
        "suffix": "unto us; for it hath heard all the words of the LORD",
        "d": [
          "sign",
          "memorial",
          "token"
        ]
```

Replace with:

```js
"prefix": "Behold, this stone shall be a",
        "a": "witness",
        "suffix": "unto us; for it hath heard all the words of the LORD",
        "d": [
          "sign",
          "memorial",
          "token",
          "judge",
          "guide"
        ]
```

### D judges5 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Praise ye the LORD for the avenging of Israel, when the people willingly offered",
        "a": "themselves",
        "suffix": ".",
        "d": [
          "their gifts",
          "their swords",
          "praises"
        ]
```

Replace with:

```js
"prefix": "Praise ye the LORD for the avenging of Israel, when the people willingly offered",
        "a": "themselves",
        "suffix": ".",
        "d": [
          "their gifts",
          "their swords",
          "praises",
          "yourselves",
          "ourselves"
        ]
```

### D judges5 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Hear, O ye kings; give ear, O ye princes; I, even I, will sing unto the",
        "a": "LORD",
        "suffix": ";",
        "d": [
          "King",
          "Most High",
          "God"
        ]
```

Replace with:

```js
"prefix": "Hear, O ye kings; give ear, O ye princes; I, even I, will sing unto the",
        "a": "LORD",
        "suffix": ";",
        "d": [
          "King",
          "Most High",
          "God",
          "Israel",
          "Moses"
        ]
```

### D judges5 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "until that I Deborah arose, that I arose a",
        "a": "mother",
        "suffix": "in Israel.",
        "d": [
          "prophetess",
          "judge",
          "leader"
        ]
```

Replace with:

```js
"prefix": "until that I Deborah arose, that I arose a",
        "a": "mother",
        "suffix": "in Israel.",
        "d": [
          "prophetess",
          "judge",
          "leader",
          "captain",
          "sister"
        ]
```

### D judges5 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Awake, awake, Deborah: awake, awake, utter a",
        "a": "song",
        "suffix": ": arise, Barak,",
        "d": [
          "voice",
          "prayer",
          "word"
        ]
```

Replace with:

```js
"prefix": "Awake, awake, Deborah: awake, awake, utter a",
        "a": "song",
        "suffix": ": arise, Barak,",
        "d": [
          "voice",
          "prayer",
          "word",
          "cry",
          "wail"
        ]
```

### D judges5 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "They fought from heaven; the",
        "a": "stars",
        "suffix": "in their courses fought against Sisera.",
        "d": [
          "angels",
          "clouds",
          "winds"
        ]
```

Replace with:

```js
"prefix": "They fought from heaven; the",
        "a": "stars",
        "suffix": "in their courses fought against Sisera.",
        "d": [
          "angels",
          "clouds",
          "winds",
          "waters",
          "lions"
        ]
```

### D judges5 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The river of Kishon swept them away, that ancient river, the river",
        "a": "Kishon",
        "suffix": ". O my soul, thou hast trodden down strength.",
        "d": [
          "Jordan",
          "Arnon",
          "Jabbok"
        ]
```

Replace with:

```js
"prefix": "The river of Kishon swept them away, that ancient river, the river",
        "a": "Kishon",
        "suffix": ". O my soul, thou hast trodden down strength.",
        "d": [
          "Jordan",
          "Arnon",
          "Jabbok",
          "Euphrates",
          "Abana"
        ]
```

### D judges5 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Blessed above women shall",
        "a": "Jael",
        "suffix": "the wife of Heber the Kenite be,",
        "d": [
          "Hannah",
          "Ruth",
          "Esther"
        ]
```

Replace with:

```js
"prefix": "Blessed above women shall",
        "a": "Jael",
        "suffix": "the wife of Heber the Kenite be,",
        "d": [
          "Hannah",
          "Ruth",
          "Esther",
          "Deborah",
          "Miriam"
        ]
```

### D judges5 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "So let all thine enemies perish, O LORD: but let them that love him be as the",
        "a": "sun",
        "suffix": "when he goeth forth in his might.",
        "d": [
          "stars",
          "day",
          "light"
        ]
```

Replace with:

```js
"prefix": "So let all thine enemies perish, O LORD: but let them that love him be as the",
        "a": "sun",
        "suffix": "when he goeth forth in his might.",
        "d": [
          "stars",
          "day",
          "light",
          "moon",
          "lion"
        ]
```

### D 1samuel2 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "My heart rejoiceth in the LORD, mine",
        "a": "horn",
        "suffix": "is exalted in the LORD: my mouth is enlarged over mine enemies;",
        "d": [
          "head",
          "glory",
          "voice"
        ]
```

Replace with:

```js
"prefix": "My heart rejoiceth in the LORD, mine",
        "a": "horn",
        "suffix": "is exalted in the LORD: my mouth is enlarged over mine enemies;",
        "d": [
          "head",
          "glory",
          "voice",
          "hand",
          "soul"
        ]
```

### D 1samuel2 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "There is none holy as the LORD: for there is none beside thee: neither is there any",
        "a": "rock",
        "suffix": "like our God.",
        "d": [
          "shield",
          "tower",
          "king"
        ]
```

Replace with:

```js
"prefix": "There is none holy as the LORD: for there is none beside thee: neither is there any",
        "a": "rock",
        "suffix": "like our God.",
        "d": [
          "shield",
          "tower",
          "king",
          "river",
          "spring"
        ]
```

### D 1samuel2 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for the LORD is a God of knowledge, and by him actions are",
        "a": "weighed",
        "suffix": ".",
        "d": [
          "judged",
          "counted",
          "tried"
        ]
```

Replace with:

```js
"prefix": "for the LORD is a God of knowledge, and by him actions are",
        "a": "weighed",
        "suffix": ".",
        "d": [
          "judged",
          "counted",
          "tried",
          "hidden",
          "known"
        ]
```

### D 1samuel2 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The bows of the mighty men are broken, and they that stumbled are girded with",
        "a": "strength",
        "suffix": ".",
        "d": [
          "power",
          "glory",
          "might"
        ]
```

Replace with:

```js
"prefix": "The bows of the mighty men are broken, and they that stumbled are girded with",
        "a": "strength",
        "suffix": ".",
        "d": [
          "power",
          "glory",
          "might",
          "armour",
          "courage"
        ]
```

### D 1samuel2 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD killeth, and maketh alive: he bringeth down to the",
        "a": "grave",
        "suffix": ", and bringeth up.",
        "d": [
          "pit",
          "dust",
          "deep"
        ]
```

Replace with:

```js
"prefix": "The LORD killeth, and maketh alive: he bringeth down to the",
        "a": "grave",
        "suffix": ", and bringeth up.",
        "d": [
          "pit",
          "dust",
          "deep",
          "prison",
          "heaven"
        ]
```

### D 1samuel2 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD maketh poor, and maketh",
        "a": "rich",
        "suffix": ": he bringeth low, and lifteth up.",
        "d": [
          "great",
          "strong",
          "wise"
        ]
```

Replace with:

```js
"prefix": "The LORD maketh poor, and maketh",
        "a": "rich",
        "suffix": ": he bringeth low, and lifteth up.",
        "d": [
          "great",
          "strong",
          "wise",
          "sick",
          "glad"
        ]
```

### D 1samuel2 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He raiseth up the poor out of the",
        "a": "dust",
        "suffix": ", and lifteth up the beggar from the dunghill,",
        "d": [
          "mire",
          "earth",
          "ground"
        ]
```

Replace with:

```js
"prefix": "He raiseth up the poor out of the",
        "a": "dust",
        "suffix": ", and lifteth up the beggar from the dunghill,",
        "d": [
          "mire",
          "earth",
          "ground",
          "prison",
          "well"
        ]
```

### D 1samuel2 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He will keep the feet of his",
        "a": "saints",
        "suffix": ", and the wicked shall be silent in darkness; for by strength shall no man prevail.",
        "d": [
          "servants",
          "chosen",
          "holy"
        ]
```

Replace with:

```js
"prefix": "He will keep the feet of his",
        "a": "saints",
        "suffix": ", and the wicked shall be silent in darkness; for by strength shall no man prevail.",
        "d": [
          "servants",
          "chosen",
          "holy",
          "prophets",
          "angels"
        ]
```

### D 1samuel16 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "fill thine horn with oil, and go, I will send thee to Jesse the",
        "a": "Bethlehemite",
        "suffix": ": for I have provided me a king among his sons.",
        "d": [
          "Ephrathite",
          "Levite",
          "Judean"
        ]
```

Replace with:

```js
"prefix": "fill thine horn with oil, and go, I will send thee to Jesse the",
        "a": "Bethlehemite",
        "suffix": ": for I have provided me a king among his sons.",
        "d": [
          "Ephrathite",
          "Levite",
          "Judean",
          "Benjamite",
          "Hittite"
        ]
```

### D 1samuel16 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Look not on his countenance, or on the height of his",
        "a": "stature",
        "suffix": "; because I have refused him:",
        "d": [
          "head",
          "crown",
          "body"
        ]
```

Replace with:

```js
"prefix": "Look not on his countenance, or on the height of his",
        "a": "stature",
        "suffix": "; because I have refused him:",
        "d": [
          "head",
          "crown",
          "body",
          "hair",
          "wisdom"
        ]
```

### D 1samuel16 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for man looketh on the outward appearance, but the LORD looketh on the",
        "a": "heart",
        "suffix": ".",
        "d": [
          "soul",
          "mind",
          "inward parts"
        ]
```

Replace with:

```js
"prefix": "for man looketh on the outward appearance, but the LORD looketh on the",
        "a": "heart",
        "suffix": ".",
        "d": [
          "soul",
          "mind",
          "inward parts",
          "face",
          "hand"
        ]
```

### D 1samuel16 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "There remaineth yet the youngest, and, behold, he keepeth the",
        "a": "sheep",
        "suffix": ".",
        "d": [
          "flock",
          "cattle",
          "lambs"
        ]
```

Replace with:

```js
"prefix": "There remaineth yet the youngest, and, behold, he keepeth the",
        "a": "sheep",
        "suffix": ".",
        "d": [
          "flock",
          "cattle",
          "lambs",
          "goats",
          "oxen"
        ]
```

### D 1samuel16 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the LORD said, Arise, anoint him: for this is",
        "a": "he",
        "suffix": ".",
        "d": [
          "David",
          "the king",
          "the chosen"
        ]
```

Replace with:

```js
"prefix": "And the LORD said, Arise, anoint him: for this is",
        "a": "he",
        "suffix": ".",
        "d": [
          "David",
          "the king",
          "the chosen",
          "she",
          "it"
        ]
```

### D 1samuel16 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then Samuel took the horn of oil, and anointed him in the",
        "a": "midst",
        "suffix": "of his brethren:",
        "d": [
          "presence",
          "sight",
          "house"
        ]
```

Replace with:

```js
"prefix": "Then Samuel took the horn of oil, and anointed him in the",
        "a": "midst",
        "suffix": "of his brethren:",
        "d": [
          "presence",
          "sight",
          "house",
          "family",
          "company"
        ]
```

### D 1samuel16 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and the Spirit of the LORD came upon David from that day",
        "a": "forward",
        "suffix": ".",
        "d": [
          "forth",
          "on",
          "always"
        ]
```

Replace with:

```js
"prefix": "and the Spirit of the LORD came upon David from that day",
        "a": "forward",
        "suffix": ".",
        "d": [
          "forth",
          "on",
          "always",
          "backward",
          "again"
        ]
```

### D 1samuel16 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "David took an",
        "a": "harp",
        "suffix": ", and played with his hand: so Saul was refreshed, and was well,",
        "d": [
          "psaltery",
          "viol",
          "pipe"
        ]
```

Replace with:

```js
"prefix": "David took an",
        "a": "harp",
        "suffix": ", and played with his hand: so Saul was refreshed, and was well,",
        "d": [
          "psaltery",
          "viol",
          "pipe",
          "timbrel",
          "cymbal"
        ]
```

### D 2samuel7 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "See now, I dwell in an house of cedar, but the ark of God dwelleth within",
        "a": "curtains",
        "suffix": ".",
        "d": [
          "tents",
          "boards",
          "linen"
        ]
```

Replace with:

```js
"prefix": "See now, I dwell in an house of cedar, but the ark of God dwelleth within",
        "a": "curtains",
        "suffix": ".",
        "d": [
          "tents",
          "boards",
          "linen",
          "walls",
          "cities"
        ]
```

### D 2samuel7 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I took thee from the sheepcote, from following the sheep, to be",
        "a": "ruler",
        "suffix": "over my people, over Israel:",
        "d": [
          "king",
          "captain",
          "shepherd"
        ]
```

Replace with:

```js
"prefix": "I took thee from the sheepcote, from following the sheep, to be",
        "a": "ruler",
        "suffix": "over my people, over Israel:",
        "d": [
          "king",
          "captain",
          "shepherd",
          "servant",
          "prophet"
        ]
```

### D 2samuel7 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I will set up thy seed after thee, which shall proceed out of thy bowels, and I will establish his",
        "a": "kingdom",
        "suffix": ".",
        "d": [
          "throne",
          "house",
          "glory"
        ]
```

Replace with:

```js
"prefix": "I will set up thy seed after thee, which shall proceed out of thy bowels, and I will establish his",
        "a": "kingdom",
        "suffix": ".",
        "d": [
          "throne",
          "house",
          "glory",
          "name",
          "mercy"
        ]
```

### D 2samuel7 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He shall build an house for my",
        "a": "name",
        "suffix": ", and I will stablish the throne of his kingdom for ever.",
        "d": [
          "glory",
          "habitation",
          "praise"
        ]
```

Replace with:

```js
"prefix": "He shall build an house for my",
        "a": "name",
        "suffix": ", and I will stablish the throne of his kingdom for ever.",
        "d": [
          "glory",
          "habitation",
          "praise",
          "people",
          "servant"
        ]
```

### D 2samuel7 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I will be his father, and he shall be my",
        "a": "son",
        "suffix": ".",
        "d": [
          "servant",
          "chosen",
          "king"
        ]
```

Replace with:

```js
"prefix": "I will be his father, and he shall be my",
        "a": "son",
        "suffix": ".",
        "d": [
          "servant",
          "chosen",
          "king",
          "daughter",
          "brother"
        ]
```

### D 2samuel7 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And thine house and thy kingdom shall be established for ever before thee: thy throne shall be established for",
        "a": "ever",
        "suffix": ".",
        "d": [
          "all time",
          "ages",
          "generations"
        ]
```

Replace with:

```js
"prefix": "And thine house and thy kingdom shall be established for ever before thee: thy throne shall be established for",
        "a": "ever",
        "suffix": ".",
        "d": [
          "all time",
          "ages",
          "generations",
          "years",
          "nights"
        ]
```

### D 2samuel7 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who am I, O Lord GOD? and what is my house, that thou hast brought me",
        "a": "hitherto",
        "suffix": "?",
        "d": [
          "here",
          "thus far",
          "nigh"
        ]
```

Replace with:

```js
"prefix": "Who am I, O Lord GOD? and what is my house, that thou hast brought me",
        "a": "hitherto",
        "suffix": "?",
        "d": [
          "here",
          "thus far",
          "nigh",
          "thither",
          "thence"
        ]
```

### D 2samuel7 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Wherefore thou art great, O LORD God: for there is none like thee, neither is there any God beside",
        "a": "thee",
        "suffix": ",",
        "d": [
          "our Lord",
          "the Father",
          "the King"
        ]
```

Replace with:

```js
"prefix": "Wherefore thou art great, O LORD God: for there is none like thee, neither is there any God beside",
        "a": "thee",
        "suffix": ",",
        "d": [
          "our Lord",
          "the Father",
          "the King",
          "me",
          "him"
        ]
```

### D 1kings8 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "when the priests were come out of the holy place, that the",
        "a": "cloud",
        "suffix": "filled the house of the LORD,",
        "d": [
          "smoke",
          "glory",
          "fire"
        ]
```

Replace with:

```js
"prefix": "when the priests were come out of the holy place, that the",
        "a": "cloud",
        "suffix": "filled the house of the LORD,",
        "d": [
          "smoke",
          "glory",
          "fire",
          "dust",
          "flood"
        ]
```

### D 1kings8 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for the glory of the LORD had filled the house of the",
        "a": "LORD",
        "suffix": ".",
        "d": [
          "God",
          "King",
          "Most High"
        ]
```

Replace with:

```js
"prefix": "for the glory of the LORD had filled the house of the",
        "a": "LORD",
        "suffix": ".",
        "d": [
          "God",
          "King",
          "Most High",
          "Israel",
          "Zion"
        ]
```

### D 1kings8 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD said that he would dwell in the thick",
        "a": "darkness",
        "suffix": ".",
        "d": [
          "clouds",
          "shadow",
          "silence"
        ]
```

Replace with:

```js
"prefix": "The LORD said that he would dwell in the thick",
        "a": "darkness",
        "suffix": ".",
        "d": [
          "clouds",
          "shadow",
          "silence",
          "night",
          "mire"
        ]
```

### D 1kings8 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "LORD God of Israel, there is no God like thee, in heaven above, or on earth",
        "a": "beneath",
        "suffix": ",",
        "d": [
          "below",
          "under",
          "around"
        ]
```

Replace with:

```js
"prefix": "LORD God of Israel, there is no God like thee, in heaven above, or on earth",
        "a": "beneath",
        "suffix": ",",
        "d": [
          "below",
          "under",
          "around",
          "beyond",
          "afar"
        ]
```

### D 1kings8 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "behold, the heaven and heaven of heavens cannot contain thee; how much less this",
        "a": "house",
        "suffix": "that I have builded?",
        "d": [
          "temple",
          "place",
          "altar"
        ]
```

Replace with:

```js
"prefix": "behold, the heaven and heaven of heavens cannot contain thee; how much less this",
        "a": "house",
        "suffix": "that I have builded?",
        "d": [
          "temple",
          "place",
          "altar",
          "city",
          "palace"
        ]
```

### D 1kings8 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and when thou hearest,",
        "a": "forgive",
        "suffix": ".",
        "d": [
          "answer",
          "pardon",
          "hear"
        ]
```

Replace with:

```js
"prefix": "and when thou hearest,",
        "a": "forgive",
        "suffix": ".",
        "d": [
          "answer",
          "pardon",
          "hear",
          "remember",
          "punish"
        ]
```

### D 1kings8 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "there hath not failed one",
        "a": "word",
        "suffix": "of all his good promise, which he promised by the hand of Moses his servant.",
        "d": [
          "statute",
          "covenant",
          "thought"
        ]
```

Replace with:

```js
"prefix": "there hath not failed one",
        "a": "word",
        "suffix": "of all his good promise, which he promised by the hand of Moses his servant.",
        "d": [
          "statute",
          "covenant",
          "thought",
          "thing",
          "blessing"
        ]
```

### D 1kings8 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Let your heart therefore be",
        "a": "perfect",
        "suffix": "with the LORD our God, to walk in his statutes, and to keep his commandments,",
        "d": [
          "clean",
          "upright",
          "true"
        ]
```

Replace with:

```js
"prefix": "Let your heart therefore be",
        "a": "perfect",
        "suffix": "with the LORD our God, to walk in his statutes, and to keep his commandments,",
        "d": [
          "clean",
          "upright",
          "true",
          "humble",
          "faithful"
        ]
```

### D 1kings19 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and sat down under a",
        "a": "juniper",
        "suffix": "tree: and he requested for himself that he might die;",
        "d": [
          "palm",
          "fig",
          "myrtle"
        ]
```

Replace with:

```js
"prefix": "and sat down under a",
        "a": "juniper",
        "suffix": "tree: and he requested for himself that he might die;",
        "d": [
          "palm",
          "fig",
          "myrtle",
          "cedar",
          "thorn"
        ]
```

### D 1kings19 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "then an angel touched him, and said unto him, Arise and",
        "a": "eat",
        "suffix": ".",
        "d": [
          "drink",
          "pray",
          "stand"
        ]
```

Replace with:

```js
"prefix": "then an angel touched him, and said unto him, Arise and",
        "a": "eat",
        "suffix": ".",
        "d": [
          "drink",
          "pray",
          "stand",
          "sleep",
          "rest"
        ]
```

### D 1kings19 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and went in the strength of that meat forty days and forty nights unto",
        "a": "Horeb",
        "suffix": "the mount of God.",
        "d": [
          "Sinai",
          "Carmel",
          "Zion"
        ]
```

Replace with:

```js
"prefix": "and went in the strength of that meat forty days and forty nights unto",
        "a": "Horeb",
        "suffix": "the mount of God.",
        "d": [
          "Sinai",
          "Carmel",
          "Zion",
          "Gilead",
          "Edom"
        ]
```

### D 1kings19 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "What doest thou here,",
        "a": "Elijah",
        "suffix": "?",
        "d": [
          "servant",
          "prophet",
          "Elisha"
        ]
```

Replace with:

```js
"prefix": "What doest thou here,",
        "a": "Elijah",
        "suffix": "?",
        "d": [
          "servant",
          "prophet",
          "Elisha",
          "Jonah",
          "Samuel"
        ]
```

### D 1kings19 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the LORD passed by, and a great and strong wind rent the mountains, but the LORD was not in the",
        "a": "wind",
        "suffix": ":",
        "d": [
          "tempest",
          "storm",
          "blast"
        ]
```

Replace with:

```js
"prefix": "the LORD passed by, and a great and strong wind rent the mountains, but the LORD was not in the",
        "a": "wind",
        "suffix": ":",
        "d": [
          "tempest",
          "storm",
          "blast",
          "fire",
          "rain"
        ]
```

### D 1kings19 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and after the wind an earthquake; but the LORD was not in the",
        "a": "earthquake",
        "suffix": ":",
        "d": [
          "tremor",
          "ground",
          "mountain"
        ]
```

Replace with:

```js
"prefix": "and after the wind an earthquake; but the LORD was not in the",
        "a": "earthquake",
        "suffix": ":",
        "d": [
          "tremor",
          "ground",
          "mountain",
          "fire",
          "thunder"
        ]
```

### D 1kings19 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And after the earthquake a fire; but the LORD was not in the fire: and after the fire a still small",
        "a": "voice",
        "suffix": ".",
        "d": [
          "sound",
          "whisper",
          "breath"
        ]
```

Replace with:

```js
"prefix": "And after the earthquake a fire; but the LORD was not in the fire: and after the fire a still small",
        "a": "voice",
        "suffix": ".",
        "d": [
          "sound",
          "whisper",
          "breath",
          "word",
          "thunder"
        ]
```

### D 1kings19 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Yet I have left me seven",
        "a": "thousand",
        "suffix": "in Israel, all the knees which have not bowed unto Baal,",
        "d": [
          "hundred",
          "score",
          "men"
        ]
```

Replace with:

```js
"prefix": "Yet I have left me seven",
        "a": "thousand",
        "suffix": "in Israel, all the knees which have not bowed unto Baal,",
        "d": [
          "hundred",
          "score",
          "men",
          "fifty",
          "twelve"
        ]
```

### D 2kings5 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Now Naaman, captain of the host of the king of Syria, was a great man with his master, but he was a",
        "a": "leper",
        "suffix": ".",
        "d": [
          "stranger",
          "heathen",
          "servant"
        ]
```

Replace with:

```js
"prefix": "Now Naaman, captain of the host of the king of Syria, was a great man with his master, but he was a",
        "a": "leper",
        "suffix": ".",
        "d": [
          "stranger",
          "heathen",
          "servant",
          "captive",
          "soldier"
        ]
```

### D 2kings5 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "had brought away captive out of the land of Israel a little",
        "a": "maid",
        "suffix": "; and she waited on Naaman's wife.",
        "d": [
          "child",
          "daughter",
          "virgin"
        ]
```

Replace with:

```js
"prefix": "had brought away captive out of the land of Israel a little",
        "a": "maid",
        "suffix": "; and she waited on Naaman's wife.",
        "d": [
          "child",
          "daughter",
          "virgin",
          "servant",
          "stranger"
        ]
```

### D 2kings5 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Go and wash in Jordan",
        "a": "seven",
        "suffix": "times, and thy flesh shall come again to thee, and thou shalt be clean.",
        "d": [
          "three",
          "ten",
          "twelve"
        ]
```

Replace with:

```js
"prefix": "Go and wash in Jordan",
        "a": "seven",
        "suffix": "times, and thy flesh shall come again to thee, and thou shalt be clean.",
        "d": [
          "three",
          "ten",
          "twelve",
          "five",
          "nine"
        ]
```

### D 2kings5 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But Naaman was",
        "a": "wroth",
        "suffix": ", and went away, and said, Behold, I thought, He will surely come out to me,",
        "d": [
          "glad",
          "ashamed",
          "afraid"
        ]
```

Replace with:

```js
"prefix": "But Naaman was",
        "a": "wroth",
        "suffix": ", and went away, and said, Behold, I thought, He will surely come out to me,",
        "d": [
          "glad",
          "ashamed",
          "afraid",
          "weary",
          "merry"
        ]
```

### D 2kings5 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Are not Abana and Pharpar, rivers of",
        "a": "Damascus",
        "suffix": ", better than all the waters of Israel?",
        "d": [
          "Syria",
          "Tyre",
          "Sidon"
        ]
```

Replace with:

```js
"prefix": "Are not Abana and Pharpar, rivers of",
        "a": "Damascus",
        "suffix": ", better than all the waters of Israel?",
        "d": [
          "Syria",
          "Tyre",
          "Sidon",
          "Egypt",
          "Babylon"
        ]
```

### D 2kings5 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "if the prophet had bid thee do some great thing, wouldest thou not have done it? how much rather then, when he saith to thee, Wash, and be",
        "a": "clean",
        "suffix": "?",
        "d": [
          "whole",
          "healed",
          "pure"
        ]
```

Replace with:

```js
"prefix": "if the prophet had bid thee do some great thing, wouldest thou not have done it? how much rather then, when he saith to thee, Wash, and be",
        "a": "clean",
        "suffix": "?",
        "d": [
          "whole",
          "healed",
          "pure",
          "holy",
          "free"
        ]
```

### D 2kings5 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and dipped himself seven times in Jordan, and his flesh came again like unto the flesh of a little",
        "a": "child",
        "suffix": ", and he was clean.",
        "d": [
          "lamb",
          "maid",
          "youth"
        ]
```

Replace with:

```js
"prefix": "and dipped himself seven times in Jordan, and his flesh came again like unto the flesh of a little",
        "a": "child",
        "suffix": ", and he was clean.",
        "d": [
          "lamb",
          "maid",
          "youth",
          "goat",
          "dove"
        ]
```

### D 2kings5 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "now I know that there is no God in all the earth, but in",
        "a": "Israel",
        "suffix": ":",
        "d": [
          "Zion",
          "heaven",
          "truth"
        ]
```

Replace with:

```js
"prefix": "now I know that there is no God in all the earth, but in",
        "a": "Israel",
        "suffix": ":",
        "d": [
          "Zion",
          "heaven",
          "truth",
          "Judah",
          "Syria"
        ]
```

### D 2chronicles7 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "when Solomon had made an end of praying, the",
        "a": "fire",
        "suffix": "came down from heaven, and consumed the burnt offering",
        "d": [
          "cloud",
          "glory",
          "light"
        ]
```

Replace with:

```js
"prefix": "when Solomon had made an end of praying, the",
        "a": "fire",
        "suffix": "came down from heaven, and consumed the burnt offering",
        "d": [
          "cloud",
          "glory",
          "light",
          "wind",
          "rain"
        ]
```

### D 2chronicles7 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "they bowed themselves with their faces to the ground upon the pavement, and worshipped, and praised the LORD, saying, For he is good; for his mercy endureth for",
        "a": "ever",
        "suffix": ".",
        "d": [
          "generations",
          "all",
          "ages"
        ]
```

Replace with:

```js
"prefix": "they bowed themselves with their faces to the ground upon the pavement, and worshipped, and praised the LORD, saying, For he is good; for his mercy endureth for",
        "a": "ever",
        "suffix": ".",
        "d": [
          "generations",
          "all",
          "ages",
          "years",
          "nights"
        ]
```

### D 2chronicles7 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If my people, which are called by my name, shall",
        "a": "humble",
        "suffix": "themselves, and pray, and seek my face, and turn from their wicked ways;",
        "d": [
          "bow",
          "prostrate",
          "chasten"
        ]
```

Replace with:

```js
"prefix": "If my people, which are called by my name, shall",
        "a": "humble",
        "suffix": "themselves, and pray, and seek my face, and turn from their wicked ways;",
        "d": [
          "bow",
          "prostrate",
          "chasten",
          "gather",
          "stir"
        ]
```

### D 2chronicles7 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "then will I hear from heaven, and will forgive their sin, and will heal their",
        "a": "land",
        "suffix": ".",
        "d": [
          "people",
          "nation",
          "cities"
        ]
```

Replace with:

```js
"prefix": "then will I hear from heaven, and will forgive their sin, and will heal their",
        "a": "land",
        "suffix": ".",
        "d": [
          "people",
          "nation",
          "cities",
          "wounds",
          "sickness"
        ]
```

### D 2chronicles7 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Now mine eyes shall be open, and mine ears attent unto the prayer that is made in this",
        "a": "place",
        "suffix": ".",
        "d": [
          "house",
          "temple",
          "court"
        ]
```

Replace with:

```js
"prefix": "Now mine eyes shall be open, and mine ears attent unto the prayer that is made in this",
        "a": "place",
        "suffix": ".",
        "d": [
          "house",
          "temple",
          "court",
          "city",
          "day"
        ]
```

### D 2chronicles7 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For now have I chosen and sanctified this house, that my",
        "a": "name",
        "suffix": "may be there for ever:",
        "d": [
          "glory",
          "power",
          "presence"
        ]
```

Replace with:

```js
"prefix": "For now have I chosen and sanctified this house, that my",
        "a": "name",
        "suffix": "may be there for ever:",
        "d": [
          "glory",
          "power",
          "presence",
          "word",
          "kingdom"
        ]
```

### D 2chronicles7 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and mine eyes and mine heart shall be there",
        "a": "perpetually",
        "suffix": ".",
        "d": [
          "for ever",
          "always",
          "continually"
        ]
```

Replace with:

```js
"prefix": "and mine eyes and mine heart shall be there",
        "a": "perpetually",
        "suffix": ".",
        "d": [
          "for ever",
          "always",
          "continually",
          "sometimes",
          "never"
        ]
```

### D 2chronicles7 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "if thou wilt walk before me, as David thy father walked, and do according to all that I have commanded thee, and shalt observe my statutes and my",
        "a": "judgments",
        "suffix": ";",
        "d": [
          "commandments",
          "laws",
          "words"
        ]
```

Replace with:

```js
"prefix": "if thou wilt walk before me, as David thy father walked, and do according to all that I have commanded thee, and shalt observe my statutes and my",
        "a": "judgments",
        "suffix": ";",
        "d": [
          "commandments",
          "laws",
          "words",
          "promises",
          "sacrifices"
        ]
```

### D nehemiah8 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and they spake unto Ezra the scribe to bring the",
        "a": "book",
        "suffix": "of the law of Moses, which the LORD had commanded to Israel.",
        "d": [
          "scroll",
          "roll",
          "words"
        ]
```

Replace with:

```js
"prefix": "and they spake unto Ezra the scribe to bring the",
        "a": "book",
        "suffix": "of the law of Moses, which the LORD had commanded to Israel.",
        "d": [
          "scroll",
          "roll",
          "words",
          "record",
          "chronicles"
        ]
```

### D nehemiah8 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and the ears of all the people were attentive unto the book of the",
        "a": "law",
        "suffix": ".",
        "d": [
          "commandment",
          "covenant",
          "Lord"
        ]
```

Replace with:

```js
"prefix": "and the ears of all the people were attentive unto the book of the",
        "a": "law",
        "suffix": ".",
        "d": [
          "commandment",
          "covenant",
          "Lord",
          "word",
          "prophets"
        ]
```

### D nehemiah8 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Ezra opened the book in the sight of all the people; and when he opened it, all the people stood",
        "a": "up",
        "suffix": ":",
        "d": [
          "still",
          "in awe",
          "together"
        ]
```

Replace with:

```js
"prefix": "And Ezra opened the book in the sight of all the people; and when he opened it, all the people stood",
        "a": "up",
        "suffix": ":",
        "d": [
          "still",
          "in awe",
          "together",
          "down",
          "forth"
        ]
```

### D nehemiah8 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Ezra blessed the LORD, the great God. And all the people answered,",
        "a": "Amen",
        "suffix": ", Amen, with lifting up their hands:",
        "d": [
          "Selah",
          "Holy",
          "Praise"
        ]
```

Replace with:

```js
"prefix": "And Ezra blessed the LORD, the great God. And all the people answered,",
        "a": "Amen",
        "suffix": ", Amen, with lifting up their hands:",
        "d": [
          "Selah",
          "Holy",
          "Praise",
          "Verily",
          "Surely"
        ]
```

### D nehemiah8 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "So they read in the book in the law of God distinctly, and gave the",
        "a": "sense",
        "suffix": ", and caused them to understand the reading.",
        "d": [
          "meaning",
          "truth",
          "light"
        ]
```

Replace with:

```js
"prefix": "So they read in the book in the law of God distinctly, and gave the",
        "a": "sense",
        "suffix": ", and caused them to understand the reading.",
        "d": [
          "meaning",
          "truth",
          "light",
          "words",
          "order"
        ]
```

### D nehemiah8 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Mourn not, nor weep. For all the people",
        "a": "wept",
        "suffix": ", when they heard the words of the law.",
        "d": [
          "mourned",
          "trembled",
          "cried"
        ]
```

Replace with:

```js
"prefix": "Mourn not, nor weep. For all the people",
        "a": "wept",
        "suffix": ", when they heard the words of the law.",
        "d": [
          "mourned",
          "trembled",
          "cried",
          "sang",
          "prayed"
        ]
```

### D nehemiah8 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "neither be ye sorry; for the joy of the LORD is your",
        "a": "strength",
        "suffix": ".",
        "d": [
          "shield",
          "portion",
          "song"
        ]
```

Replace with:

```js
"prefix": "neither be ye sorry; for the joy of the LORD is your",
        "a": "strength",
        "suffix": ".",
        "d": [
          "shield",
          "portion",
          "song",
          "hope",
          "refuge"
        ]
```

### D nehemiah8 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And all the people went their way to eat, and to drink, and to send portions, and to make great",
        "a": "mirth",
        "suffix": ", because they had understood the words that were declared unto them.",
        "d": [
          "joy",
          "gladness",
          "praise"
        ]
```

Replace with:

```js
"prefix": "And all the people went their way to eat, and to drink, and to send portions, and to make great",
        "a": "mirth",
        "suffix": ", because they had understood the words that were declared unto them.",
        "d": [
          "joy",
          "gladness",
          "praise",
          "feasts",
          "war"
        ]
```

### D esther4 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "When Mordecai perceived all that was done, Mordecai rent his clothes, and put on",
        "a": "sackcloth",
        "suffix": "with ashes,",
        "d": [
          "mourning",
          "linen",
          "garments"
        ]
```

Replace with:

```js
"prefix": "When Mordecai perceived all that was done, Mordecai rent his clothes, and put on",
        "a": "sackcloth",
        "suffix": "with ashes,",
        "d": [
          "mourning",
          "linen",
          "garments",
          "purple",
          "ornaments"
        ]
```

### D esther4 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "whosoever, whether man or woman, shall come unto the king into the inner court, who is not called, there is one law of his to put him to",
        "a": "death",
        "suffix": ",",
        "d": [
          "shame",
          "judgment",
          "prison"
        ]
```

Replace with:

```js
"prefix": "whosoever, whether man or woman, shall come unto the king into the inner court, who is not called, there is one law of his to put him to",
        "a": "death",
        "suffix": ",",
        "d": [
          "shame",
          "judgment",
          "prison",
          "bondage",
          "trial"
        ]
```

### D esther4 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "except such to whom the king shall hold out the golden",
        "a": "sceptre",
        "suffix": ", that he may live:",
        "d": [
          "rod",
          "crown",
          "hand"
        ]
```

Replace with:

```js
"prefix": "except such to whom the king shall hold out the golden",
        "a": "sceptre",
        "suffix": ", that he may live:",
        "d": [
          "rod",
          "crown",
          "hand",
          "ring",
          "sword"
        ]
```

### D esther4 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Think not with thyself that thou shalt escape in the king's house, more than all the",
        "a": "Jews",
        "suffix": ".",
        "d": [
          "people",
          "servants",
          "captives"
        ]
```

Replace with:

```js
"prefix": "Think not with thyself that thou shalt escape in the king's house, more than all the",
        "a": "Jews",
        "suffix": ".",
        "d": [
          "people",
          "servants",
          "captives",
          "Egyptians",
          "Philistines"
        ]
```

### D esther4 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "then shall there enlargement and deliverance arise to the Jews from another",
        "a": "place",
        "suffix": "; but thou and thy father's house shall be destroyed:",
        "d": [
          "quarter",
          "hand",
          "king"
        ]
```

Replace with:

```js
"prefix": "then shall there enlargement and deliverance arise to the Jews from another",
        "a": "place",
        "suffix": "; but thou and thy father's house shall be destroyed:",
        "d": [
          "quarter",
          "hand",
          "king",
          "people",
          "country"
        ]
```

### D esther4 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and who knoweth whether thou art come to the kingdom for such a",
        "a": "time",
        "suffix": "as this?",
        "d": [
          "day",
          "hour",
          "season"
        ]
```

Replace with:

```js
"prefix": "and who knoweth whether thou art come to the kingdom for such a",
        "a": "time",
        "suffix": "as this?",
        "d": [
          "day",
          "hour",
          "season",
          "need",
          "war"
        ]
```

### D esther4 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Go, gather together all the Jews that are present in Shushan, and",
        "a": "fast",
        "suffix": "ye for me, and neither eat nor drink three days, night or day:",
        "d": [
          "pray",
          "cry",
          "weep"
        ]
```

Replace with:

```js
"prefix": "Go, gather together all the Jews that are present in Shushan, and",
        "a": "fast",
        "suffix": "ye for me, and neither eat nor drink three days, night or day:",
        "d": [
          "pray",
          "cry",
          "weep",
          "watch",
          "wait"
        ]
```

### D esther4 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and so will I go in unto the king, which is not according to the law: and if I perish, I",
        "a": "perish",
        "suffix": ".",
        "d": [
          "die",
          "fall",
          "stand"
        ]
```

Replace with:

```js
"prefix": "and so will I go in unto the king, which is not according to the law: and if I perish, I",
        "a": "perish",
        "suffix": ".",
        "d": [
          "die",
          "fall",
          "stand",
          "faint",
          "fear"
        ]
```

### D job19 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "How long will ye vex my soul, and break me in pieces with",
        "a": "words",
        "suffix": "?",
        "d": [
          "reproaches",
          "speeches",
          "judgment"
        ]
```

Replace with:

```js
"prefix": "How long will ye vex my soul, and break me in pieces with",
        "a": "words",
        "suffix": "?",
        "d": [
          "reproaches",
          "speeches",
          "judgment",
          "swords",
          "stones"
        ]
```

### D job19 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He hath stripped me of my glory, and taken the",
        "a": "crown",
        "suffix": "from my head.",
        "d": [
          "garment",
          "honour",
          "diadem"
        ]
```

Replace with:

```js
"prefix": "He hath stripped me of my glory, and taken the",
        "a": "crown",
        "suffix": "from my head.",
        "d": [
          "garment",
          "honour",
          "diadem",
          "mantle",
          "helmet"
        ]
```

### D job19 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Have pity upon me, have pity upon me, O ye my friends; for the",
        "a": "hand",
        "suffix": "of God hath touched me.",
        "d": [
          "rod",
          "wrath",
          "judgment"
        ]
```

Replace with:

```js
"prefix": "Have pity upon me, have pity upon me, O ye my friends; for the",
        "a": "hand",
        "suffix": "of God hath touched me.",
        "d": [
          "rod",
          "wrath",
          "judgment",
          "arm",
          "plague"
        ]
```

### D job19 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Oh that my words were now written! oh that they were printed in a",
        "a": "book",
        "suffix": "!",
        "d": [
          "scroll",
          "roll",
          "tablet"
        ]
```

Replace with:

```js
"prefix": "Oh that my words were now written! oh that they were printed in a",
        "a": "book",
        "suffix": "!",
        "d": [
          "scroll",
          "roll",
          "tablet",
          "letter",
          "pillar"
        ]
```

### D job19 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "That they were graven with an iron pen and lead in the",
        "a": "rock",
        "suffix": "for ever!",
        "d": [
          "stone",
          "pillar",
          "wall"
        ]
```

Replace with:

```js
"prefix": "That they were graven with an iron pen and lead in the",
        "a": "rock",
        "suffix": "for ever!",
        "d": [
          "stone",
          "pillar",
          "wall",
          "dust",
          "water"
        ]
```

### D job19 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For I know that my",
        "a": "redeemer",
        "suffix": "liveth, and that he shall stand at the latter day upon the earth:",
        "d": [
          "Saviour",
          "God",
          "Lord"
        ]
```

Replace with:

```js
"prefix": "For I know that my",
        "a": "redeemer",
        "suffix": "liveth, and that he shall stand at the latter day upon the earth:",
        "d": [
          "Saviour",
          "God",
          "Lord",
          "friend",
          "witness"
        ]
```

### D job19 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And though after my skin worms destroy this body, yet in my flesh shall I see",
        "a": "God",
        "suffix": ":",
        "d": [
          "the King",
          "the Lord",
          "Him"
        ]
```

Replace with:

```js
"prefix": "And though after my skin worms destroy this body, yet in my flesh shall I see",
        "a": "God",
        "suffix": ":",
        "d": [
          "the King",
          "the Lord",
          "Him",
          "Moses",
          "Abraham"
        ]
```

### D job19 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Whom I shall see for myself, and mine eyes shall behold, and not",
        "a": "another",
        "suffix": "; though my reins be consumed within me.",
        "d": [
          "a stranger",
          "an enemy",
          "a foe"
        ]
```

Replace with:

```js
"prefix": "Whom I shall see for myself, and mine eyes shall behold, and not",
        "a": "another",
        "suffix": "; though my reins be consumed within me.",
        "d": [
          "a stranger",
          "an enemy",
          "a foe",
          "others",
          "other"
        ]
```

### D psalm24 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The earth is the LORD'S, and the",
        "a": "fulness",
        "suffix": "thereof; the world, and they that dwell therein.",
        "d": [
          "riches",
          "glory",
          "nations"
        ]
```

Replace with:

```js
"prefix": "The earth is the LORD'S, and the",
        "a": "fulness",
        "suffix": "thereof; the world, and they that dwell therein.",
        "d": [
          "riches",
          "glory",
          "nations",
          "beauty",
          "treasures"
        ]
```

### D psalm24 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For he hath founded it upon the seas, and established it upon the",
        "a": "floods",
        "suffix": ".",
        "d": [
          "waters",
          "rivers",
          "deep"
        ]
```

Replace with:

```js
"prefix": "For he hath founded it upon the seas, and established it upon the",
        "a": "floods",
        "suffix": ".",
        "d": [
          "waters",
          "rivers",
          "deep",
          "hills",
          "rocks"
        ]
```

### D psalm24 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who shall ascend into the hill of the LORD? or who shall stand in his",
        "a": "holy",
        "suffix": "place?",
        "d": [
          "secret",
          "sanctuary",
          "glorious"
        ]
```

Replace with:

```js
"prefix": "Who shall ascend into the hill of the LORD? or who shall stand in his",
        "a": "holy",
        "suffix": "place?",
        "d": [
          "secret",
          "sanctuary",
          "glorious",
          "high",
          "strong"
        ]
```

### D psalm24 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He that hath clean hands, and a",
        "a": "pure",
        "suffix": "heart; who hath not lifted up his soul unto vanity, nor sworn deceitfully.",
        "d": [
          "clean",
          "humble",
          "true"
        ]
```

Replace with:

```js
"prefix": "He that hath clean hands, and a",
        "a": "pure",
        "suffix": "heart; who hath not lifted up his soul unto vanity, nor sworn deceitfully.",
        "d": [
          "clean",
          "humble",
          "true",
          "faithful",
          "tender"
        ]
```

### D psalm24 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He shall receive the blessing from the LORD, and",
        "a": "righteousness",
        "suffix": "from the God of his salvation.",
        "d": [
          "mercy",
          "peace",
          "grace"
        ]
```

Replace with:

```js
"prefix": "He shall receive the blessing from the LORD, and",
        "a": "righteousness",
        "suffix": "from the God of his salvation.",
        "d": [
          "mercy",
          "peace",
          "grace",
          "favour",
          "strength"
        ]
```

### D psalm24 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Lift up your heads, O ye gates; and be ye lift up, ye everlasting doors; and the King of",
        "a": "glory",
        "suffix": "shall come in.",
        "d": [
          "kings",
          "peace",
          "Israel"
        ]
```

Replace with:

```js
"prefix": "Lift up your heads, O ye gates; and be ye lift up, ye everlasting doors; and the King of",
        "a": "glory",
        "suffix": "shall come in.",
        "d": [
          "kings",
          "peace",
          "Israel",
          "power",
          "wrath"
        ]
```

### D psalm24 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who is this King of glory? The LORD strong and",
        "a": "mighty",
        "suffix": ", the LORD mighty in battle.",
        "d": [
          "great",
          "terrible",
          "holy"
        ]
```

Replace with:

```js
"prefix": "Who is this King of glory? The LORD strong and",
        "a": "mighty",
        "suffix": ", the LORD mighty in battle.",
        "d": [
          "great",
          "terrible",
          "holy",
          "patient",
          "gentle"
        ]
```

### D psalm24 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD of",
        "a": "hosts",
        "suffix": ", he is the King of glory. Selah.",
        "d": [
          "armies",
          "heaven",
          "glory"
        ]
```

Replace with:

```js
"prefix": "The LORD of",
        "a": "hosts",
        "suffix": ", he is the King of glory. Selah.",
        "d": [
          "armies",
          "heaven",
          "glory",
          "saints",
          "nations"
        ]
```

### D psalm27 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD is my light and my salvation; whom shall I",
        "a": "fear",
        "suffix": "? the LORD is the strength of my life; of whom shall I be afraid?",
        "d": [
          "dread",
          "flee",
          "know"
        ]
```

Replace with:

```js
"prefix": "The LORD is my light and my salvation; whom shall I",
        "a": "fear",
        "suffix": "? the LORD is the strength of my life; of whom shall I be afraid?",
        "d": [
          "dread",
          "flee",
          "know",
          "trust",
          "seek"
        ]
```

### D psalm27 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Though an host should encamp against me, my heart shall not",
        "a": "fear",
        "suffix": ": though war should rise against me, in this will I be confident.",
        "d": [
          "faint",
          "fail",
          "tremble"
        ]
```

Replace with:

```js
"prefix": "Though an host should encamp against me, my heart shall not",
        "a": "fear",
        "suffix": ": though war should rise against me, in this will I be confident.",
        "d": [
          "faint",
          "fail",
          "tremble",
          "yield",
          "doubt"
        ]
```

### D psalm27 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "One thing have I desired of the LORD, that will I seek after; that I may dwell in the house of the LORD all the",
        "a": "days",
        "suffix": "of my life,",
        "d": [
          "years",
          "time",
          "hours"
        ]
```

Replace with:

```js
"prefix": "One thing have I desired of the LORD, that will I seek after; that I may dwell in the house of the LORD all the",
        "a": "days",
        "suffix": "of my life,",
        "d": [
          "years",
          "time",
          "hours",
          "nights",
          "tears"
        ]
```

### D psalm27 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "to behold the beauty of the LORD, and to enquire in his",
        "a": "temple",
        "suffix": ".",
        "d": [
          "sanctuary",
          "palace",
          "house"
        ]
```

Replace with:

```js
"prefix": "to behold the beauty of the LORD, and to enquire in his",
        "a": "temple",
        "suffix": ".",
        "d": [
          "sanctuary",
          "palace",
          "house",
          "garden",
          "throne"
        ]
```

### D psalm27 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For in the time of trouble he shall hide me in his",
        "a": "pavilion",
        "suffix": ": in the secret of his tabernacle shall he hide me; he shall set me up upon a rock.",
        "d": [
          "tabernacle",
          "tent",
          "chamber"
        ]
```

Replace with:

```js
"prefix": "For in the time of trouble he shall hide me in his",
        "a": "pavilion",
        "suffix": ": in the secret of his tabernacle shall he hide me; he shall set me up upon a rock.",
        "d": [
          "tabernacle",
          "tent",
          "chamber",
          "shadow",
          "bosom"
        ]
```

### D psalm27 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "When thou saidst, Seek ye my face; my heart said unto thee, Thy face, LORD, will I",
        "a": "seek",
        "suffix": ".",
        "d": [
          "find",
          "behold",
          "praise"
        ]
```

Replace with:

```js
"prefix": "When thou saidst, Seek ye my face; my heart said unto thee, Thy face, LORD, will I",
        "a": "seek",
        "suffix": ".",
        "d": [
          "find",
          "behold",
          "praise",
          "serve",
          "love"
        ]
```

### D psalm27 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "When my father and my mother forsake me, then the LORD will take me",
        "a": "up",
        "suffix": ".",
        "d": [
          "in",
          "on",
          "home"
        ]
```

Replace with:

```js
"prefix": "When my father and my mother forsake me, then the LORD will take me",
        "a": "up",
        "suffix": ".",
        "d": [
          "in",
          "on",
          "home",
          "out",
          "away"
        ]
```

### D psalm27 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Wait on the LORD: be of good",
        "a": "courage",
        "suffix": ", and he shall strengthen thine heart: wait, I say, on the LORD.",
        "d": [
          "cheer",
          "hope",
          "mind"
        ]
```

Replace with:

```js
"prefix": "Wait on the LORD: be of good",
        "a": "courage",
        "suffix": ", and he shall strengthen thine heart: wait, I say, on the LORD.",
        "d": [
          "cheer",
          "hope",
          "mind",
          "report",
          "speed"
        ]
```

### D psalm34 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I will bless the LORD at all times: his praise shall continually be in my",
        "a": "mouth",
        "suffix": ".",
        "d": [
          "heart",
          "lips",
          "song"
        ]
```

Replace with:

```js
"prefix": "I will bless the LORD at all times: his praise shall continually be in my",
        "a": "mouth",
        "suffix": ".",
        "d": [
          "heart",
          "lips",
          "song",
          "soul",
          "hand"
        ]
```

### D psalm34 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O magnify the LORD with me, and let us exalt his",
        "a": "name",
        "suffix": "together.",
        "d": [
          "praise",
          "glory",
          "voice"
        ]
```

Replace with:

```js
"prefix": "O magnify the LORD with me, and let us exalt his",
        "a": "name",
        "suffix": "together.",
        "d": [
          "praise",
          "glory",
          "voice",
          "word",
          "works"
        ]
```

### D psalm34 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The angel of the LORD encampeth round about them that",
        "a": "fear",
        "suffix": "him, and delivereth them.",
        "d": [
          "love",
          "serve",
          "seek"
        ]
```

Replace with:

```js
"prefix": "The angel of the LORD encampeth round about them that",
        "a": "fear",
        "suffix": "him, and delivereth them.",
        "d": [
          "love",
          "serve",
          "seek",
          "hate",
          "forsake"
        ]
```

### D psalm34 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O taste and see that the LORD is",
        "a": "good",
        "suffix": ": blessed is the man that trusteth in him.",
        "d": [
          "great",
          "holy",
          "gracious"
        ]
```

Replace with:

```js
"prefix": "O taste and see that the LORD is",
        "a": "good",
        "suffix": ": blessed is the man that trusteth in him.",
        "d": [
          "great",
          "holy",
          "gracious",
          "near",
          "mighty"
        ]
```

### D psalm34 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The young lions do lack, and suffer hunger: but they that seek the LORD shall not want any",
        "a": "good",
        "suffix": "thing.",
        "d": [
          "clean",
          "living",
          "holy"
        ]
```

Replace with:

```js
"prefix": "The young lions do lack, and suffer hunger: but they that seek the LORD shall not want any",
        "a": "good",
        "suffix": "thing.",
        "d": [
          "clean",
          "living",
          "holy",
          "earthly",
          "evil"
        ]
```

### D psalm34 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Keep thy tongue from evil, and thy lips from speaking",
        "a": "guile",
        "suffix": ".",
        "d": [
          "lies",
          "wrath",
          "deceit"
        ]
```

Replace with:

```js
"prefix": "Keep thy tongue from evil, and thy lips from speaking",
        "a": "guile",
        "suffix": ".",
        "d": [
          "lies",
          "wrath",
          "deceit",
          "folly",
          "treason"
        ]
```

### D psalm34 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD is nigh unto them that are of a broken",
        "a": "heart",
        "suffix": "; and saveth such as be of a contrite spirit.",
        "d": [
          "soul",
          "mind",
          "life"
        ]
```

Replace with:

```js
"prefix": "The LORD is nigh unto them that are of a broken",
        "a": "heart",
        "suffix": "; and saveth such as be of a contrite spirit.",
        "d": [
          "soul",
          "mind",
          "life",
          "hope",
          "promise"
        ]
```

### D psalm34 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Many are the afflictions of the righteous: but the LORD delivereth him out of them",
        "a": "all",
        "suffix": ".",
        "d": [
          "now",
          "soon",
          "whole"
        ]
```

Replace with:

```js
"prefix": "Many are the afflictions of the righteous: but the LORD delivereth him out of them",
        "a": "all",
        "suffix": ".",
        "d": [
          "now",
          "soon",
          "whole",
          "some",
          "none"
        ]
```

### D psalm103 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Bless the LORD, O my soul: and all that is within me, bless his holy",
        "a": "name",
        "suffix": ".",
        "d": [
          "word",
          "glory",
          "presence"
        ]
```

Replace with:

```js
"prefix": "Bless the LORD, O my soul: and all that is within me, bless his holy",
        "a": "name",
        "suffix": ".",
        "d": [
          "word",
          "glory",
          "presence",
          "house",
          "temple"
        ]
```

### D psalm103 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Bless the LORD, O my soul, and forget not all his",
        "a": "benefits",
        "suffix": ":",
        "d": [
          "mercies",
          "works",
          "gifts"
        ]
```

Replace with:

```js
"prefix": "Bless the LORD, O my soul, and forget not all his",
        "a": "benefits",
        "suffix": ":",
        "d": [
          "mercies",
          "works",
          "gifts",
          "promises",
          "sins"
        ]
```

### D psalm103 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who forgiveth all thine iniquities; who healeth all thy",
        "a": "diseases",
        "suffix": ";",
        "d": [
          "sickness",
          "pains",
          "wounds"
        ]
```

Replace with:

```js
"prefix": "Who forgiveth all thine iniquities; who healeth all thy",
        "a": "diseases",
        "suffix": ";",
        "d": [
          "sickness",
          "pains",
          "wounds",
          "sorrows",
          "hunger"
        ]
```

### D psalm103 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who redeemeth thy life from destruction; who crowneth thee with lovingkindness and tender",
        "a": "mercies",
        "suffix": ";",
        "d": [
          "grace",
          "favour",
          "peace"
        ]
```

Replace with:

```js
"prefix": "Who redeemeth thy life from destruction; who crowneth thee with lovingkindness and tender",
        "a": "mercies",
        "suffix": ";",
        "d": [
          "grace",
          "favour",
          "peace",
          "blessings",
          "promises"
        ]
```

### D psalm103 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who satisfieth thy mouth with good things; so that thy youth is renewed like the",
        "a": "eagle's",
        "suffix": ".",
        "d": [
          "lion's",
          "dove's",
          "cedar"
        ]
```

Replace with:

```js
"prefix": "Who satisfieth thy mouth with good things; so that thy youth is renewed like the",
        "a": "eagle's",
        "suffix": ".",
        "d": [
          "lion's",
          "dove's",
          "cedar",
          "hart",
          "lamb's"
        ]
```

### D psalm103 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD is merciful and gracious, slow to anger, and plenteous in",
        "a": "mercy",
        "suffix": ".",
        "d": [
          "truth",
          "grace",
          "goodness"
        ]
```

Replace with:

```js
"prefix": "The LORD is merciful and gracious, slow to anger, and plenteous in",
        "a": "mercy",
        "suffix": ".",
        "d": [
          "truth",
          "grace",
          "goodness",
          "power",
          "love"
        ]
```

### D psalm103 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For as the heaven is high above the earth, so great is his mercy toward them that",
        "a": "fear",
        "suffix": "him.",
        "d": [
          "love",
          "praise",
          "serve"
        ]
```

Replace with:

```js
"prefix": "For as the heaven is high above the earth, so great is his mercy toward them that",
        "a": "fear",
        "suffix": "him.",
        "d": [
          "love",
          "praise",
          "serve",
          "forget",
          "hate"
        ]
```

### D psalm103 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "As far as the east is from the west, so far hath he removed our",
        "a": "transgressions",
        "suffix": "from us.",
        "d": [
          "sins",
          "iniquities",
          "faults"
        ]
```

Replace with:

```js
"prefix": "As far as the east is from the west, so far hath he removed our",
        "a": "transgressions",
        "suffix": "from us.",
        "d": [
          "sins",
          "iniquities",
          "faults",
          "burdens",
          "griefs"
        ]
```

### D psalm139 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O LORD, thou hast searched me, and",
        "a": "known",
        "suffix": "me.",
        "d": [
          "tried",
          "seen",
          "found"
        ]
```

Replace with:

```js
"prefix": "O LORD, thou hast searched me, and",
        "a": "known",
        "suffix": "me.",
        "d": [
          "tried",
          "seen",
          "found",
          "loved",
          "heard"
        ]
```

### D psalm139 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou knowest my downsitting and mine uprising, thou understandest my thought afar",
        "a": "off",
        "suffix": ".",
        "d": [
          "away",
          "above",
          "out"
        ]
```

Replace with:

```js
"prefix": "Thou knowest my downsitting and mine uprising, thou understandest my thought afar",
        "a": "off",
        "suffix": ".",
        "d": [
          "away",
          "above",
          "out",
          "beyond",
          "apart"
        ]
```

### D psalm139 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Whither shall I go from thy spirit? or whither shall I flee from thy",
        "a": "presence",
        "suffix": "?",
        "d": [
          "face",
          "sight",
          "glory"
        ]
```

Replace with:

```js
"prefix": "Whither shall I go from thy spirit? or whither shall I flee from thy",
        "a": "presence",
        "suffix": "?",
        "d": [
          "face",
          "sight",
          "glory",
          "hand",
          "wrath"
        ]
```

### D psalm139 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If I ascend up into heaven, thou art there: if I make my bed in",
        "a": "hell",
        "suffix": ", behold, thou art there.",
        "d": [
          "the grave",
          "the pit",
          "the deep"
        ]
```

Replace with:

```js
"prefix": "If I ascend up into heaven, thou art there: if I make my bed in",
        "a": "hell",
        "suffix": ", behold, thou art there.",
        "d": [
          "the grave",
          "the pit",
          "the deep",
          "dust",
          "death"
        ]
```

### D psalm139 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If I take the wings of the morning, and dwell in the uttermost parts of the",
        "a": "sea",
        "suffix": ";",
        "d": [
          "earth",
          "deep",
          "world"
        ]
```

Replace with:

```js
"prefix": "If I take the wings of the morning, and dwell in the uttermost parts of the",
        "a": "sea",
        "suffix": ";",
        "d": [
          "earth",
          "deep",
          "world",
          "desert",
          "heavens"
        ]
```

### D psalm139 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Even there shall thy hand lead me, and thy right hand shall",
        "a": "hold",
        "suffix": "me.",
        "d": [
          "keep",
          "guide",
          "save"
        ]
```

Replace with:

```js
"prefix": "Even there shall thy hand lead me, and thy right hand shall",
        "a": "hold",
        "suffix": "me.",
        "d": [
          "keep",
          "guide",
          "save",
          "lift",
          "bless"
        ]
```

### D psalm139 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I will praise thee; for I am fearfully and wonderfully",
        "a": "made",
        "suffix": ": marvellous are thy works;",
        "d": [
          "formed",
          "created",
          "fashioned"
        ]
```

Replace with:

```js
"prefix": "I will praise thee; for I am fearfully and wonderfully",
        "a": "made",
        "suffix": ": marvellous are thy works;",
        "d": [
          "formed",
          "created",
          "fashioned",
          "born",
          "kept"
        ]
```

### D psalm139 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Search me, O God, and know my",
        "a": "heart",
        "suffix": ": try me, and know my thoughts:",
        "d": [
          "soul",
          "mind",
          "ways"
        ]
```

Replace with:

```js
"prefix": "Search me, O God, and know my",
        "a": "heart",
        "suffix": ": try me, and know my thoughts:",
        "d": [
          "soul",
          "mind",
          "ways",
          "name",
          "feet"
        ]
```

### D proverbs4 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Hear, ye children, the instruction of a father, and attend to know",
        "a": "understanding",
        "suffix": ".",
        "d": [
          "wisdom",
          "knowledge",
          "truth"
        ]
```

Replace with:

```js
"prefix": "Hear, ye children, the instruction of a father, and attend to know",
        "a": "understanding",
        "suffix": ".",
        "d": [
          "wisdom",
          "knowledge",
          "truth",
          "discretion",
          "judgment"
        ]
```

### D proverbs4 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For I give you good doctrine, forsake ye not my",
        "a": "law",
        "suffix": ".",
        "d": [
          "words",
          "counsel",
          "way"
        ]
```

Replace with:

```js
"prefix": "For I give you good doctrine, forsake ye not my",
        "a": "law",
        "suffix": ".",
        "d": [
          "words",
          "counsel",
          "way",
          "gospel",
          "truth"
        ]
```

### D proverbs4 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Wisdom is the principal thing; therefore get wisdom: and with all thy getting get",
        "a": "understanding",
        "suffix": ".",
        "d": [
          "knowledge",
          "prudence",
          "instruction"
        ]
```

Replace with:

```js
"prefix": "Wisdom is the principal thing; therefore get wisdom: and with all thy getting get",
        "a": "understanding",
        "suffix": ".",
        "d": [
          "knowledge",
          "prudence",
          "instruction",
          "judgment",
          "righteousness"
        ]
```

### D proverbs4 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Exalt her, and she shall promote thee: she shall bring thee to honour, when thou dost",
        "a": "embrace",
        "suffix": "her.",
        "d": [
          "love",
          "seek",
          "hold"
        ]
```

Replace with:

```js
"prefix": "Exalt her, and she shall promote thee: she shall bring thee to honour, when thou dost",
        "a": "embrace",
        "suffix": "her.",
        "d": [
          "love",
          "seek",
          "hold",
          "despise",
          "forsake"
        ]
```

### D proverbs4 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But the path of the just is as the shining light, that shineth more and more unto the",
        "a": "perfect",
        "suffix": "day.",
        "d": [
          "holy",
          "bright",
          "glorious"
        ]
```

Replace with:

```js
"prefix": "But the path of the just is as the shining light, that shineth more and more unto the",
        "a": "perfect",
        "suffix": "day.",
        "d": [
          "holy",
          "bright",
          "glorious",
          "fair",
          "dark"
        ]
```

### D proverbs4 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The way of the wicked is as",
        "a": "darkness",
        "suffix": ": they know not at what they stumble.",
        "d": [
          "night",
          "shadow",
          "folly"
        ]
```

Replace with:

```js
"prefix": "The way of the wicked is as",
        "a": "darkness",
        "suffix": ": they know not at what they stumble.",
        "d": [
          "night",
          "shadow",
          "folly",
          "mire",
          "brightness"
        ]
```

### D proverbs4 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Keep thy heart with all diligence; for out of it are the issues of",
        "a": "life",
        "suffix": ".",
        "d": [
          "truth",
          "wisdom",
          "soul"
        ]
```

Replace with:

```js
"prefix": "Keep thy heart with all diligence; for out of it are the issues of",
        "a": "life",
        "suffix": ".",
        "d": [
          "truth",
          "wisdom",
          "soul",
          "death",
          "joy"
        ]
```

### D proverbs4 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Turn not to the right hand nor to the left: remove thy foot from",
        "a": "evil",
        "suffix": ".",
        "d": [
          "sin",
          "darkness",
          "mischief"
        ]
```

Replace with:

```js
"prefix": "Turn not to the right hand nor to the left: remove thy foot from",
        "a": "evil",
        "suffix": ".",
        "d": [
          "sin",
          "darkness",
          "mischief",
          "folly",
          "gold"
        ]
```

### D isaiah9 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The people that walked in darkness have seen a great",
        "a": "light",
        "suffix": ":",
        "d": [
          "sign",
          "star",
          "glory"
        ]
```

Replace with:

```js
"prefix": "The people that walked in darkness have seen a great",
        "a": "light",
        "suffix": ":",
        "d": [
          "sign",
          "star",
          "glory",
          "vision",
          "wonder"
        ]
```

### D isaiah9 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "they that dwell in the land of the shadow of death, upon them hath the light",
        "a": "shined",
        "suffix": ".",
        "d": [
          "fallen",
          "risen",
          "come"
        ]
```

Replace with:

```js
"prefix": "they that dwell in the land of the shadow of death, upon them hath the light",
        "a": "shined",
        "suffix": ".",
        "d": [
          "fallen",
          "risen",
          "come",
          "appeared",
          "fled"
        ]
```

### D isaiah9 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For unto us a child is born, unto us a",
        "a": "son",
        "suffix": "is given:",
        "d": [
          "king",
          "saviour",
          "prince"
        ]
```

Replace with:

```js
"prefix": "For unto us a child is born, unto us a",
        "a": "son",
        "suffix": "is given:",
        "d": [
          "king",
          "saviour",
          "prince",
          "ruler",
          "heir"
        ]
```

### D isaiah9 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and the government shall be upon his",
        "a": "shoulder",
        "suffix": ":",
        "d": [
          "hand",
          "head",
          "arm"
        ]
```

Replace with:

```js
"prefix": "and the government shall be upon his",
        "a": "shoulder",
        "suffix": ":",
        "d": [
          "hand",
          "head",
          "arm",
          "neck",
          "back"
        ]
```

### D isaiah9 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and his name shall be called Wonderful, Counsellor, The mighty",
        "a": "God",
        "suffix": ",",
        "d": [
          "King",
          "Lord",
          "Prince"
        ]
```

Replace with:

```js
"prefix": "and his name shall be called Wonderful, Counsellor, The mighty",
        "a": "God",
        "suffix": ",",
        "d": [
          "King",
          "Lord",
          "Prince",
          "Judge",
          "Shepherd"
        ]
```

### D isaiah9 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The everlasting Father, The Prince of",
        "a": "Peace",
        "suffix": ".",
        "d": [
          "Life",
          "Glory",
          "Israel"
        ]
```

Replace with:

```js
"prefix": "The everlasting Father, The Prince of",
        "a": "Peace",
        "suffix": ".",
        "d": [
          "Life",
          "Glory",
          "Israel",
          "Light",
          "Righteousness"
        ]
```

### D isaiah9 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Of the increase of his government and peace there shall be no",
        "a": "end",
        "suffix": ",",
        "d": [
          "bounds",
          "measure",
          "stay"
        ]
```

Replace with:

```js
"prefix": "Of the increase of his government and peace there shall be no",
        "a": "end",
        "suffix": ",",
        "d": [
          "bounds",
          "measure",
          "stay",
          "rest",
          "ceasing"
        ]
```

### D isaiah9 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The zeal of the LORD of hosts will perform",
        "a": "this",
        "suffix": ".",
        "d": [
          "it",
          "all",
          "so"
        ]
```

Replace with:

```js
"prefix": "The zeal of the LORD of hosts will perform",
        "a": "this",
        "suffix": ".",
        "d": [
          "it",
          "all",
          "so",
          "that",
          "nothing"
        ]
```

### D isaiah55 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ho, every one that thirsteth, come ye to the",
        "a": "waters",
        "suffix": ", and he that hath no money; come ye, buy, and eat;",
        "d": [
          "wells",
          "fountains",
          "streams"
        ]
```

Replace with:

```js
"prefix": "Ho, every one that thirsteth, come ye to the",
        "a": "waters",
        "suffix": ", and he that hath no money; come ye, buy, and eat;",
        "d": [
          "wells",
          "fountains",
          "streams",
          "springs",
          "rivers"
        ]
```

### D isaiah55 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "yea, come, buy wine and milk without money and without",
        "a": "price",
        "suffix": ".",
        "d": [
          "cost",
          "labour",
          "measure"
        ]
```

Replace with:

```js
"prefix": "yea, come, buy wine and milk without money and without",
        "a": "price",
        "suffix": ".",
        "d": [
          "cost",
          "labour",
          "measure",
          "silver",
          "gold"
        ]
```

### D isaiah55 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Incline your ear, and come unto me: hear, and your soul shall",
        "a": "live",
        "suffix": ";",
        "d": [
          "prosper",
          "rejoice",
          "see"
        ]
```

Replace with:

```js
"prefix": "Incline your ear, and come unto me: hear, and your soul shall",
        "a": "live",
        "suffix": ";",
        "d": [
          "prosper",
          "rejoice",
          "see",
          "die",
          "rest"
        ]
```

### D isaiah55 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Seek ye the LORD while he may be",
        "a": "found",
        "suffix": ", call ye upon him while he is near:",
        "d": [
          "seen",
          "heard",
          "known"
        ]
```

Replace with:

```js
"prefix": "Seek ye the LORD while he may be",
        "a": "found",
        "suffix": ", call ye upon him while he is near:",
        "d": [
          "seen",
          "heard",
          "known",
          "sought",
          "shown"
        ]
```

### D isaiah55 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Let the wicked forsake his way, and the unrighteous man his",
        "a": "thoughts",
        "suffix": ": and let him return unto the LORD,",
        "d": [
          "words",
          "counsel",
          "deeds"
        ]
```

Replace with:

```js
"prefix": "Let the wicked forsake his way, and the unrighteous man his",
        "a": "thoughts",
        "suffix": ": and let him return unto the LORD,",
        "d": [
          "words",
          "counsel",
          "deeds",
          "desires",
          "feet"
        ]
```

### D isaiah55 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For my thoughts are not your thoughts, neither are your ways my",
        "a": "ways",
        "suffix": ", saith the LORD.",
        "d": [
          "paths",
          "counsels",
          "works"
        ]
```

Replace with:

```js
"prefix": "For my thoughts are not your thoughts, neither are your ways my",
        "a": "ways",
        "suffix": ", saith the LORD.",
        "d": [
          "paths",
          "counsels",
          "works",
          "deeds",
          "steps"
        ]
```

### D isaiah55 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "So shall my word be that goeth forth out of my mouth: it shall not return unto me",
        "a": "void",
        "suffix": ",",
        "d": [
          "empty",
          "fruitless",
          "broken"
        ]
```

Replace with:

```js
"prefix": "So shall my word be that goeth forth out of my mouth: it shall not return unto me",
        "a": "void",
        "suffix": ",",
        "d": [
          "empty",
          "fruitless",
          "broken",
          "full",
          "bare"
        ]
```

### D isaiah55 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the mountains and the hills shall break forth before you into singing, and all the trees of the field shall clap their",
        "a": "hands",
        "suffix": ".",
        "d": [
          "boughs",
          "leaves",
          "branches"
        ]
```

Replace with:

```js
"prefix": "the mountains and the hills shall break forth before you into singing, and all the trees of the field shall clap their",
        "a": "hands",
        "suffix": ".",
        "d": [
          "boughs",
          "leaves",
          "branches",
          "feet",
          "heads"
        ]
```

### D isaiah60 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Arise, shine; for thy light is come, and the glory of the LORD is risen upon",
        "a": "thee",
        "suffix": ".",
        "d": [
          "Zion",
          "Jerusalem",
          "the earth"
        ]
```

Replace with:

```js
"prefix": "Arise, shine; for thy light is come, and the glory of the LORD is risen upon",
        "a": "thee",
        "suffix": ".",
        "d": [
          "Zion",
          "Jerusalem",
          "the earth",
          "you",
          "them"
        ]
```

### D isaiah60 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For, behold, the darkness shall cover the earth, and gross darkness the",
        "a": "people",
        "suffix": ":",
        "d": [
          "nations",
          "gentiles",
          "lands"
        ]
```

Replace with:

```js
"prefix": "For, behold, the darkness shall cover the earth, and gross darkness the",
        "a": "people",
        "suffix": ":",
        "d": [
          "nations",
          "gentiles",
          "lands",
          "kings",
          "tribes"
        ]
```

### D isaiah60 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the Gentiles shall come to thy",
        "a": "light",
        "suffix": ", and kings to the brightness of thy rising.",
        "d": [
          "dawn",
          "sun",
          "glory"
        ]
```

Replace with:

```js
"prefix": "And the Gentiles shall come to thy",
        "a": "light",
        "suffix": ", and kings to the brightness of thy rising.",
        "d": [
          "dawn",
          "sun",
          "glory",
          "word",
          "truth"
        ]
```

### D isaiah60 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore thy gates shall be open continually; they shall not be shut day nor",
        "a": "night",
        "suffix": ";",
        "d": [
          "even",
          "season",
          "moment"
        ]
```

Replace with:

```js
"prefix": "Therefore thy gates shall be open continually; they shall not be shut day nor",
        "a": "night",
        "suffix": ";",
        "d": [
          "even",
          "season",
          "moment",
          "morning",
          "evening"
        ]
```

### D isaiah60 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Violence shall no more be heard in thy land, wasting nor destruction within thy borders; but thou shalt call thy walls",
        "a": "Salvation",
        "suffix": ", and thy gates Praise.",
        "d": [
          "Peace",
          "Glory",
          "Righteousness"
        ]
```

Replace with:

```js
"prefix": "Violence shall no more be heard in thy land, wasting nor destruction within thy borders; but thou shalt call thy walls",
        "a": "Salvation",
        "suffix": ", and thy gates Praise.",
        "d": [
          "Peace",
          "Glory",
          "Righteousness",
          "Mercy",
          "Holiness"
        ]
```

### D isaiah60 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The sun shall be no more thy light by day; neither for brightness shall the",
        "a": "moon",
        "suffix": "give light unto thee:",
        "d": [
          "stars",
          "lamps",
          "heavens"
        ]
```

Replace with:

```js
"prefix": "The sun shall be no more thy light by day; neither for brightness shall the",
        "a": "moon",
        "suffix": "give light unto thee:",
        "d": [
          "stars",
          "lamps",
          "heavens",
          "fire",
          "candle"
        ]
```

### D isaiah60 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "but the LORD shall be unto thee an everlasting light, and thy God thy",
        "a": "glory",
        "suffix": ".",
        "d": [
          "portion",
          "defence",
          "crown"
        ]
```

Replace with:

```js
"prefix": "but the LORD shall be unto thee an everlasting light, and thy God thy",
        "a": "glory",
        "suffix": ".",
        "d": [
          "portion",
          "defence",
          "crown",
          "strength",
          "joy"
        ]
```

### D isaiah60 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "A little one shall become a thousand, and a small one a strong",
        "a": "nation",
        "suffix": ": I the LORD will hasten it in his time.",
        "d": [
          "people",
          "kingdom",
          "host"
        ]
```

Replace with:

```js
"prefix": "A little one shall become a thousand, and a small one a strong",
        "a": "nation",
        "suffix": ": I the LORD will hasten it in his time.",
        "d": [
          "people",
          "kingdom",
          "host",
          "city",
          "tribe"
        ]
```

### D jeremiah31 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD hath appeared of old unto me, saying, Yea, I have loved thee with an everlasting",
        "a": "love",
        "suffix": ":",
        "d": [
          "mercy",
          "covenant",
          "grace"
        ]
```

Replace with:

```js
"prefix": "The LORD hath appeared of old unto me, saying, Yea, I have loved thee with an everlasting",
        "a": "love",
        "suffix": ":",
        "d": [
          "mercy",
          "covenant",
          "grace",
          "wrath",
          "sorrow"
        ]
```

### D jeremiah31 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "therefore with lovingkindness have I drawn",
        "a": "thee",
        "suffix": ".",
        "d": [
          "Israel",
          "my people",
          "Zion"
        ]
```

Replace with:

```js
"prefix": "therefore with lovingkindness have I drawn",
        "a": "thee",
        "suffix": ".",
        "d": [
          "Israel",
          "my people",
          "Zion",
          "them",
          "us"
        ]
```

### D jeremiah31 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for I will turn their mourning into",
        "a": "joy",
        "suffix": ", and will comfort them, and make them rejoice from their sorrow.",
        "d": [
          "gladness",
          "praise",
          "peace"
        ]
```

Replace with:

```js
"prefix": "for I will turn their mourning into",
        "a": "joy",
        "suffix": ", and will comfort them, and make them rejoice from their sorrow.",
        "d": [
          "gladness",
          "praise",
          "peace",
          "weeping",
          "ashes"
        ]
```

### D jeremiah31 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Behold, the days come, saith the LORD, that I will make a new",
        "a": "covenant",
        "suffix": "with the house of Israel, and with the house of Judah:",
        "d": [
          "law",
          "statute",
          "word"
        ]
```

Replace with:

```js
"prefix": "Behold, the days come, saith the LORD, that I will make a new",
        "a": "covenant",
        "suffix": "with the house of Israel, and with the house of Judah:",
        "d": [
          "law",
          "statute",
          "word",
          "promise",
          "name"
        ]
```

### D jeremiah31 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I will put my law in their inward parts, and write it in their",
        "a": "hearts",
        "suffix": "; and will be their God, and they shall be my people.",
        "d": [
          "minds",
          "souls",
          "hands"
        ]
```

Replace with:

```js
"prefix": "I will put my law in their inward parts, and write it in their",
        "a": "hearts",
        "suffix": "; and will be their God, and they shall be my people.",
        "d": [
          "minds",
          "souls",
          "hands",
          "eyes",
          "lips"
        ]
```

### D jeremiah31 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they shall teach no more every man his neighbour, and every man his brother, saying, Know the",
        "a": "LORD",
        "suffix": ": for they shall all know me,",
        "d": [
          "Word",
          "Law",
          "King"
        ]
```

Replace with:

```js
"prefix": "And they shall teach no more every man his neighbour, and every man his brother, saying, Know the",
        "a": "LORD",
        "suffix": ": for they shall all know me,",
        "d": [
          "Word",
          "Law",
          "King",
          "Shepherd",
          "Judge"
        ]
```

### D jeremiah31 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for I will forgive their iniquity, and I will remember their sin no",
        "a": "more",
        "suffix": ".",
        "d": [
          "longer",
          "further",
          "again"
        ]
```

Replace with:

```js
"prefix": "for I will forgive their iniquity, and I will remember their sin no",
        "a": "more",
        "suffix": ".",
        "d": [
          "longer",
          "further",
          "again",
          "less",
          "later"
        ]
```

### D jeremiah31 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Which giveth the sun for a light by day, and the ordinances of the moon and of the stars for a light by",
        "a": "night",
        "suffix": ",",
        "d": [
          "season",
          "darkness",
          "even"
        ]
```

Replace with:

```js
"prefix": "Which giveth the sun for a light by day, and the ordinances of the moon and of the stars for a light by",
        "a": "night",
        "suffix": ",",
        "d": [
          "season",
          "darkness",
          "even",
          "evening",
          "morning"
        ]
```

### D lamentations3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "It is of the LORD'S mercies that we are not",
        "a": "consumed",
        "suffix": ", because his compassions fail not.",
        "d": [
          "destroyed",
          "cut off",
          "perished"
        ]
```

Replace with:

```js
"prefix": "It is of the LORD'S mercies that we are not",
        "a": "consumed",
        "suffix": ", because his compassions fail not.",
        "d": [
          "destroyed",
          "cut off",
          "perished",
          "afflicted",
          "forsaken"
        ]
```

### D lamentations3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "They are new every morning: great is thy",
        "a": "faithfulness",
        "suffix": ".",
        "d": [
          "mercy",
          "truth",
          "goodness"
        ]
```

Replace with:

```js
"prefix": "They are new every morning: great is thy",
        "a": "faithfulness",
        "suffix": ".",
        "d": [
          "mercy",
          "truth",
          "goodness",
          "wisdom",
          "power"
        ]
```

### D lamentations3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD is my portion, saith my soul; therefore will I",
        "a": "hope",
        "suffix": "in him.",
        "d": [
          "trust",
          "wait",
          "rejoice"
        ]
```

Replace with:

```js
"prefix": "The LORD is my portion, saith my soul; therefore will I",
        "a": "hope",
        "suffix": "in him.",
        "d": [
          "trust",
          "wait",
          "rejoice",
          "fear",
          "dwell"
        ]
```

### D lamentations3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD is good unto them that wait for him, to the soul that",
        "a": "seeketh",
        "suffix": "him.",
        "d": [
          "loveth",
          "feareth",
          "calleth"
        ]
```

Replace with:

```js
"prefix": "The LORD is good unto them that wait for him, to the soul that",
        "a": "seeketh",
        "suffix": "him.",
        "d": [
          "loveth",
          "feareth",
          "calleth",
          "knoweth",
          "obeyeth"
        ]
```

### D lamentations3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "It is good that a man should both hope and quietly wait for the",
        "a": "salvation",
        "suffix": "of the LORD.",
        "d": [
          "mercy",
          "counsel",
          "word"
        ]
```

Replace with:

```js
"prefix": "It is good that a man should both hope and quietly wait for the",
        "a": "salvation",
        "suffix": "of the LORD.",
        "d": [
          "mercy",
          "counsel",
          "word",
          "judgment",
          "wrath"
        ]
```

### D lamentations3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "It is good for a man that he bear the",
        "a": "yoke",
        "suffix": "in his youth.",
        "d": [
          "burden",
          "cross",
          "rod"
        ]
```

Replace with:

```js
"prefix": "It is good for a man that he bear the",
        "a": "yoke",
        "suffix": "in his youth.",
        "d": [
          "burden",
          "cross",
          "rod",
          "bond",
          "crown"
        ]
```

### D lamentations3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For the Lord will not cast off for",
        "a": "ever",
        "suffix": ":",
        "d": [
          "generations",
          "always",
          "long"
        ]
```

Replace with:

```js
"prefix": "For the Lord will not cast off for",
        "a": "ever",
        "suffix": ":",
        "d": [
          "generations",
          "always",
          "long",
          "years",
          "nights"
        ]
```

### D lamentations3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou drewest near in the day that I called upon thee: thou saidst, Fear",
        "a": "not",
        "suffix": ".",
        "d": [
          "thou not",
          "nothing",
          "no evil"
        ]
```

Replace with:

```js
"prefix": "Thou drewest near in the day that I called upon thee: thou saidst, Fear",
        "a": "not",
        "suffix": ".",
        "d": [
          "thou not",
          "nothing",
          "no evil",
          "ye",
          "them"
        ]
```

### D ezekiel36 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For I will take you from among the heathen, and gather you out of all countries, and will bring you into your own",
        "a": "land",
        "suffix": ".",
        "d": [
          "country",
          "cities",
          "border"
        ]
```

Replace with:

```js
"prefix": "For I will take you from among the heathen, and gather you out of all countries, and will bring you into your own",
        "a": "land",
        "suffix": ".",
        "d": [
          "country",
          "cities",
          "border",
          "home",
          "nation"
        ]
```

### D ezekiel36 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then will I sprinkle clean",
        "a": "water",
        "suffix": "upon you, and ye shall be clean:",
        "d": [
          "oil",
          "blood",
          "dew"
        ]
```

Replace with:

```js
"prefix": "Then will I sprinkle clean",
        "a": "water",
        "suffix": "upon you, and ye shall be clean:",
        "d": [
          "oil",
          "blood",
          "dew",
          "milk",
          "wine"
        ]
```

### D ezekiel36 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "A new",
        "a": "heart",
        "suffix": "also will I give you, and a new spirit will I put within you:",
        "d": [
          "soul",
          "mind",
          "life"
        ]
```

Replace with:

```js
"prefix": "A new",
        "a": "heart",
        "suffix": "also will I give you, and a new spirit will I put within you:",
        "d": [
          "soul",
          "mind",
          "life",
          "name",
          "covenant"
        ]
```

### D ezekiel36 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and I will take away the stony heart out of your flesh, and I will give you an heart of",
        "a": "flesh",
        "suffix": ".",
        "d": [
          "love",
          "peace",
          "grace"
        ]
```

Replace with:

```js
"prefix": "and I will take away the stony heart out of your flesh, and I will give you an heart of",
        "a": "flesh",
        "suffix": ".",
        "d": [
          "love",
          "peace",
          "grace",
          "brass",
          "gold"
        ]
```

### D ezekiel36 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And I will put my",
        "a": "spirit",
        "suffix": "within you, and cause you to walk in my statutes,",
        "d": [
          "law",
          "word",
          "presence"
        ]
```

Replace with:

```js
"prefix": "And I will put my",
        "a": "spirit",
        "suffix": "within you, and cause you to walk in my statutes,",
        "d": [
          "law",
          "word",
          "presence",
          "grace",
          "anger"
        ]
```

### D ezekiel36 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and ye shall be my people, and I will be your",
        "a": "God",
        "suffix": ".",
        "d": [
          "Lord",
          "King",
          "Father"
        ]
```

Replace with:

```js
"prefix": "and ye shall be my people, and I will be your",
        "a": "God",
        "suffix": ".",
        "d": [
          "Lord",
          "King",
          "Father",
          "Shepherd",
          "Judge"
        ]
```

### D ezekiel36 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "This land that was desolate is become like the garden of",
        "a": "Eden",
        "suffix": ";",
        "d": [
          "peace",
          "Zion",
          "Canaan"
        ]
```

Replace with:

```js
"prefix": "This land that was desolate is become like the garden of",
        "a": "Eden",
        "suffix": ";",
        "d": [
          "peace",
          "Zion",
          "Canaan",
          "Sharon",
          "Lebanon"
        ]
```

### D ezekiel36 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I the LORD have spoken it, and I will",
        "a": "do",
        "suffix": "it.",
        "d": [
          "perform",
          "fulfil",
          "keep"
        ]
```

Replace with:

```js
"prefix": "I the LORD have spoken it, and I will",
        "a": "do",
        "suffix": "it.",
        "d": [
          "perform",
          "fulfil",
          "keep",
          "bring",
          "send"
        ]
```

### D daniel3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Nebuchadnezzar the king made an image of",
        "a": "gold",
        "suffix": ", whose height was threescore cubits, and the breadth thereof six cubits:",
        "d": [
          "silver",
          "brass",
          "stone"
        ]
```

Replace with:

```js
"prefix": "Nebuchadnezzar the king made an image of",
        "a": "gold",
        "suffix": ", whose height was threescore cubits, and the breadth thereof six cubits:",
        "d": [
          "silver",
          "brass",
          "stone",
          "iron",
          "wood"
        ]
```

### D daniel3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "There are certain Jews whom thou hast set over the affairs of the province of Babylon,",
        "a": "Shadrach",
        "suffix": ", Meshach, and Abednego;",
        "d": [
          "Daniel",
          "Belteshazzar",
          "Ezra"
        ]
```

Replace with:

```js
"prefix": "There are certain Jews whom thou hast set over the affairs of the province of Babylon,",
        "a": "Shadrach",
        "suffix": ", Meshach, and Abednego;",
        "d": [
          "Daniel",
          "Belteshazzar",
          "Ezra",
          "Nebuchadnezzar",
          "Moses"
        ]
```

### D daniel3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "our God whom we serve is able to deliver us from the burning fiery",
        "a": "furnace",
        "suffix": ",",
        "d": [
          "flame",
          "oven",
          "fire"
        ]
```

Replace with:

```js
"prefix": "our God whom we serve is able to deliver us from the burning fiery",
        "a": "furnace",
        "suffix": ",",
        "d": [
          "flame",
          "oven",
          "fire",
          "den",
          "pit"
        ]
```

### D daniel3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "be it known unto thee, O king, that we will not serve thy gods, nor worship the golden",
        "a": "image",
        "suffix": "which thou hast set up.",
        "d": [
          "statue",
          "idol",
          "calf"
        ]
```

Replace with:

```js
"prefix": "be it known unto thee, O king, that we will not serve thy gods, nor worship the golden",
        "a": "image",
        "suffix": "which thou hast set up.",
        "d": [
          "statue",
          "idol",
          "calf",
          "altar",
          "pillar"
        ]
```

### D daniel3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then these men were bound in their coats, their hosen, and their hats, and their other garments, and were cast into the midst of the burning fiery",
        "a": "furnace",
        "suffix": ".",
        "d": [
          "pit",
          "flame",
          "heat"
        ]
```

Replace with:

```js
"prefix": "Then these men were bound in their coats, their hosen, and their hats, and their other garments, and were cast into the midst of the burning fiery",
        "a": "furnace",
        "suffix": ".",
        "d": [
          "pit",
          "flame",
          "heat",
          "den",
          "grave"
        ]
```

### D daniel3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Lo, I see four men loose, walking in the midst of the fire, and they have no",
        "a": "hurt",
        "suffix": ";",
        "d": [
          "harm",
          "fear",
          "pain"
        ]
```

Replace with:

```js
"prefix": "Lo, I see four men loose, walking in the midst of the fire, and they have no",
        "a": "hurt",
        "suffix": ";",
        "d": [
          "harm",
          "fear",
          "pain",
          "shame",
          "dread"
        ]
```

### D daniel3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and the form of the fourth is like the",
        "a": "Son",
        "suffix": "of God.",
        "d": [
          "Angel",
          "Messenger",
          "Servant"
        ]
```

Replace with:

```js
"prefix": "and the form of the fourth is like the",
        "a": "Son",
        "suffix": "of God.",
        "d": [
          "Angel",
          "Messenger",
          "Servant",
          "Prophet",
          "Priest"
        ]
```

### D daniel3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Blessed be the God of Shadrach, Meshach, and Abednego, who hath sent his",
        "a": "angel",
        "suffix": ", and delivered his servants that trusted in him,",
        "d": [
          "Spirit",
          "presence",
          "hand"
        ]
```

Replace with:

```js
"prefix": "Blessed be the God of Shadrach, Meshach, and Abednego, who hath sent his",
        "a": "angel",
        "suffix": ", and delivered his servants that trusted in him,",
        "d": [
          "Spirit",
          "presence",
          "hand",
          "word",
          "son"
        ]
```

### D daniel12 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And at that time shall",
        "a": "Michael",
        "suffix": "stand up, the great prince which standeth for the children of thy people:",
        "d": [
          "Gabriel",
          "the King",
          "the Messiah"
        ]
```

Replace with:

```js
"prefix": "And at that time shall",
        "a": "Michael",
        "suffix": "stand up, the great prince which standeth for the children of thy people:",
        "d": [
          "Gabriel",
          "the King",
          "the Messiah",
          "Joshua",
          "Ezra"
        ]
```

### D daniel12 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And many of them that sleep in the dust of the earth shall",
        "a": "awake",
        "suffix": ", some to everlasting life, and some to shame and everlasting contempt.",
        "d": [
          "rise",
          "stand",
          "live"
        ]
```

Replace with:

```js
"prefix": "And many of them that sleep in the dust of the earth shall",
        "a": "awake",
        "suffix": ", some to everlasting life, and some to shame and everlasting contempt.",
        "d": [
          "rise",
          "stand",
          "live",
          "tremble",
          "mourn"
        ]
```

### D daniel12 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they that be wise shall shine as the brightness of the",
        "a": "firmament",
        "suffix": ";",
        "d": [
          "sun",
          "heavens",
          "stars"
        ]
```

Replace with:

```js
"prefix": "And they that be wise shall shine as the brightness of the",
        "a": "firmament",
        "suffix": ";",
        "d": [
          "sun",
          "heavens",
          "stars",
          "moon",
          "clouds"
        ]
```

### D daniel12 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and they that turn many to righteousness as the",
        "a": "stars",
        "suffix": "for ever and ever.",
        "d": [
          "sun",
          "lights",
          "angels"
        ]
```

Replace with:

```js
"prefix": "and they that turn many to righteousness as the",
        "a": "stars",
        "suffix": "for ever and ever.",
        "d": [
          "sun",
          "lights",
          "angels",
          "dew",
          "mountains"
        ]
```

### D daniel12 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But thou, O Daniel, shut up the words, and",
        "a": "seal",
        "suffix": "the book, even to the time of the end:",
        "d": [
          "close",
          "hide",
          "write"
        ]
```

Replace with:

```js
"prefix": "But thou, O Daniel, shut up the words, and",
        "a": "seal",
        "suffix": "the book, even to the time of the end:",
        "d": [
          "close",
          "hide",
          "write",
          "open",
          "burn"
        ]
```

### D daniel12 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "many shall run to and fro, and knowledge shall be",
        "a": "increased",
        "suffix": ".",
        "d": [
          "multiplied",
          "great",
          "spread"
        ]
```

Replace with:

```js
"prefix": "many shall run to and fro, and knowledge shall be",
        "a": "increased",
        "suffix": ".",
        "d": [
          "multiplied",
          "great",
          "spread",
          "fulfilled",
          "ended"
        ]
```

### D daniel12 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Many shall be purified, and made white, and",
        "a": "tried",
        "suffix": "; but the wicked shall do wickedly: and none of the wicked shall understand;",
        "d": [
          "proved",
          "cleansed",
          "sanctified"
        ]
```

Replace with:

```js
"prefix": "Many shall be purified, and made white, and",
        "a": "tried",
        "suffix": "; but the wicked shall do wickedly: and none of the wicked shall understand;",
        "d": [
          "proved",
          "cleansed",
          "sanctified",
          "bowed",
          "tempted"
        ]
```

### D daniel12 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But go thou thy way till the end be: for thou shalt rest, and stand in thy lot at the end of the",
        "a": "days",
        "suffix": ".",
        "d": [
          "years",
          "time",
          "earth"
        ]
```

Replace with:

```js
"prefix": "But go thou thy way till the end be: for thou shalt rest, and stand in thy lot at the end of the",
        "a": "days",
        "suffix": ".",
        "d": [
          "years",
          "time",
          "earth",
          "ages",
          "wars"
        ]
```

### D micah6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Hear ye now what the LORD saith; Arise, contend thou before the",
        "a": "mountains",
        "suffix": ", and let the hills hear thy voice.",
        "d": [
          "valleys",
          "heavens",
          "nations"
        ]
```

Replace with:

```js
"prefix": "Hear ye now what the LORD saith; Arise, contend thou before the",
        "a": "mountains",
        "suffix": ", and let the hills hear thy voice.",
        "d": [
          "valleys",
          "heavens",
          "nations",
          "rocks",
          "trees"
        ]
```

### D micah6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Hear ye, O mountains, the LORD'S controversy, and ye strong foundations of the",
        "a": "earth",
        "suffix": ":",
        "d": [
          "deep",
          "world",
          "hills"
        ]
```

Replace with:

```js
"prefix": "Hear ye, O mountains, the LORD'S controversy, and ye strong foundations of the",
        "a": "earth",
        "suffix": ":",
        "d": [
          "deep",
          "world",
          "hills",
          "sea",
          "waters"
        ]
```

### D micah6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For I brought thee up out of the land of Egypt, and redeemed thee out of the house of",
        "a": "servants",
        "suffix": ";",
        "d": [
          "bondage",
          "pharaoh",
          "slaves"
        ]
```

Replace with:

```js
"prefix": "For I brought thee up out of the land of Egypt, and redeemed thee out of the house of",
        "a": "servants",
        "suffix": ";",
        "d": [
          "bondage",
          "pharaoh",
          "slaves",
          "prisoners",
          "kings"
        ]
```

### D micah6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and I sent before thee Moses, Aaron, and",
        "a": "Miriam",
        "suffix": ".",
        "d": [
          "Joshua",
          "Hur",
          "Caleb"
        ]
```

Replace with:

```js
"prefix": "and I sent before thee Moses, Aaron, and",
        "a": "Miriam",
        "suffix": ".",
        "d": [
          "Joshua",
          "Hur",
          "Caleb",
          "Samuel",
          "Nathan"
        ]
```

### D micah6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Wherewith shall I come before the LORD, and bow myself before the high",
        "a": "God",
        "suffix": "?",
        "d": [
          "King",
          "Lord",
          "Priest"
        ]
```

Replace with:

```js
"prefix": "Wherewith shall I come before the LORD, and bow myself before the high",
        "a": "God",
        "suffix": "?",
        "d": [
          "King",
          "Lord",
          "Priest",
          "Shepherd",
          "Judge"
        ]
```

### D micah6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He hath shewed thee, O man, what is",
        "a": "good",
        "suffix": "; and what doth the LORD require of thee,",
        "d": [
          "right",
          "holy",
          "just"
        ]
```

Replace with:

```js
"prefix": "He hath shewed thee, O man, what is",
        "a": "good",
        "suffix": "; and what doth the LORD require of thee,",
        "d": [
          "right",
          "holy",
          "just",
          "true",
          "pure"
        ]
```

### D micah6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "but to do",
        "a": "justly",
        "suffix": ", and to love mercy, and to walk humbly with thy God?",
        "d": [
          "rightly",
          "truth",
          "good"
        ]
```

Replace with:

```js
"prefix": "but to do",
        "a": "justly",
        "suffix": ", and to love mercy, and to walk humbly with thy God?",
        "d": [
          "rightly",
          "truth",
          "good",
          "wisely",
          "kindly"
        ]
```

### D micah6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and to love mercy, and to walk",
        "a": "humbly",
        "suffix": "with thy God?",
        "d": [
          "closely",
          "purely",
          "uprightly"
        ]
```

Replace with:

```js
"prefix": "and to love mercy, and to walk",
        "a": "humbly",
        "suffix": "with thy God?",
        "d": [
          "closely",
          "purely",
          "uprightly",
          "faithfully",
          "boldly"
        ]
```

### D habakkuk3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O LORD, I have heard thy speech, and was",
        "a": "afraid",
        "suffix": ": O LORD, revive thy work in the midst of the years,",
        "d": [
          "humbled",
          "troubled",
          "amazed"
        ]
```

Replace with:

```js
"prefix": "O LORD, I have heard thy speech, and was",
        "a": "afraid",
        "suffix": ": O LORD, revive thy work in the midst of the years,",
        "d": [
          "humbled",
          "troubled",
          "amazed",
          "ashamed",
          "glad"
        ]
```

### D habakkuk3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "in the midst of the years make known; in wrath remember",
        "a": "mercy",
        "suffix": ".",
        "d": [
          "grace",
          "pity",
          "compassion"
        ]
```

Replace with:

```js
"prefix": "in the midst of the years make known; in wrath remember",
        "a": "mercy",
        "suffix": ".",
        "d": [
          "grace",
          "pity",
          "compassion",
          "judgment",
          "vengeance"
        ]
```

### D habakkuk3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "His glory covered the heavens, and the earth was full of his",
        "a": "praise",
        "suffix": ".",
        "d": [
          "glory",
          "power",
          "light"
        ]
```

Replace with:

```js
"prefix": "His glory covered the heavens, and the earth was full of his",
        "a": "praise",
        "suffix": ".",
        "d": [
          "glory",
          "power",
          "light",
          "wisdom",
          "goodness"
        ]
```

### D habakkuk3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And his brightness was as the",
        "a": "light",
        "suffix": "; he had horns coming out of his hand: and there was the hiding of his power.",
        "d": [
          "sun",
          "fire",
          "day"
        ]
```

Replace with:

```js
"prefix": "And his brightness was as the",
        "a": "light",
        "suffix": "; he had horns coming out of his hand: and there was the hiding of his power.",
        "d": [
          "sun",
          "fire",
          "day",
          "lightning",
          "morning"
        ]
```

### D habakkuk3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Although the",
        "a": "fig",
        "suffix": "tree shall not blossom, neither shall fruit be in the vines;",
        "d": [
          "olive",
          "palm",
          "myrtle"
        ]
```

Replace with:

```js
"prefix": "Although the",
        "a": "fig",
        "suffix": "tree shall not blossom, neither shall fruit be in the vines;",
        "d": [
          "olive",
          "palm",
          "myrtle",
          "cedar",
          "oak"
        ]
```

### D habakkuk3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the labour of the",
        "a": "olive",
        "suffix": "shall fail, and the fields shall yield no meat;",
        "d": [
          "vine",
          "fig",
          "corn"
        ]
```

Replace with:

```js
"prefix": "the labour of the",
        "a": "olive",
        "suffix": "shall fail, and the fields shall yield no meat;",
        "d": [
          "vine",
          "fig",
          "corn",
          "palm",
          "wine"
        ]
```

### D habakkuk3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Yet I will rejoice in the LORD, I will joy in the God of my",
        "a": "salvation",
        "suffix": ".",
        "d": [
          "life",
          "peace",
          "hope"
        ]
```

Replace with:

```js
"prefix": "Yet I will rejoice in the LORD, I will joy in the God of my",
        "a": "salvation",
        "suffix": ".",
        "d": [
          "life",
          "peace",
          "hope",
          "wrath",
          "judgment"
        ]
```

### D habakkuk3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The LORD God is my strength, and he will make my feet like",
        "a": "hinds'",
        "suffix": "feet, and he will make me to walk upon mine high places.",
        "d": [
          "lions'",
          "eagles'",
          "roes'"
        ]
```

Replace with:

```js
"prefix": "The LORD God is my strength, and he will make my feet like",
        "a": "hinds'",
        "suffix": "feet, and he will make me to walk upon mine high places.",
        "d": [
          "lions'",
          "eagles'",
          "roes'",
          "rams'",
          "harts'"
        ]
```

### D zechariah9 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Rejoice greatly, O daughter of Zion; shout, O daughter of",
        "a": "Jerusalem",
        "suffix": ":",
        "d": [
          "Judah",
          "Israel",
          "peace"
        ]
```

Replace with:

```js
"prefix": "Rejoice greatly, O daughter of Zion; shout, O daughter of",
        "a": "Jerusalem",
        "suffix": ":",
        "d": [
          "Judah",
          "Israel",
          "peace",
          "Samaria",
          "Babylon"
        ]
```

### D zechariah9 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "behold, thy King cometh unto thee: he is just, and having",
        "a": "salvation",
        "suffix": ";",
        "d": [
          "mercy",
          "peace",
          "glory"
        ]
```

Replace with:

```js
"prefix": "behold, thy King cometh unto thee: he is just, and having",
        "a": "salvation",
        "suffix": ";",
        "d": [
          "mercy",
          "peace",
          "glory",
          "wisdom",
          "strength"
        ]
```

### D zechariah9 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "lowly, and riding upon an",
        "a": "ass",
        "suffix": ", and upon a colt the foal of an ass.",
        "d": [
          "horse",
          "mule",
          "camel"
        ]
```

Replace with:

```js
"prefix": "lowly, and riding upon an",
        "a": "ass",
        "suffix": ", and upon a colt the foal of an ass.",
        "d": [
          "horse",
          "mule",
          "camel",
          "ox",
          "eagle"
        ]
```

### D zechariah9 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and he shall speak peace unto the",
        "a": "heathen",
        "suffix": ": and his dominion shall be from sea even to sea,",
        "d": [
          "nations",
          "gentiles",
          "people"
        ]
```

Replace with:

```js
"prefix": "and he shall speak peace unto the",
        "a": "heathen",
        "suffix": ": and his dominion shall be from sea even to sea,",
        "d": [
          "nations",
          "gentiles",
          "people",
          "kings",
          "princes"
        ]
```

### D zechariah9 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "by the blood of thy covenant I have sent forth thy prisoners out of the pit wherein is no",
        "a": "water",
        "suffix": ".",
        "d": [
          "light",
          "hope",
          "bread"
        ]
```

Replace with:

```js
"prefix": "by the blood of thy covenant I have sent forth thy prisoners out of the pit wherein is no",
        "a": "water",
        "suffix": ".",
        "d": [
          "light",
          "hope",
          "bread",
          "wine",
          "gold"
        ]
```

### D zechariah9 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Turn you to the strong hold, ye prisoners of",
        "a": "hope",
        "suffix": ": even to day do I declare that I will render double unto thee;",
        "d": [
          "faith",
          "peace",
          "mercy"
        ]
```

Replace with:

```js
"prefix": "Turn you to the strong hold, ye prisoners of",
        "a": "hope",
        "suffix": ": even to day do I declare that I will render double unto thee;",
        "d": [
          "faith",
          "peace",
          "mercy",
          "sin",
          "grace"
        ]
```

### D zechariah9 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the LORD their God shall save them in that day as the flock of his people: for they shall be as the stones of a",
        "a": "crown",
        "suffix": ", lifted up as an ensign upon his land.",
        "d": [
          "temple",
          "diadem",
          "sceptre"
        ]
```

Replace with:

```js
"prefix": "And the LORD their God shall save them in that day as the flock of his people: for they shall be as the stones of a",
        "a": "crown",
        "suffix": ", lifted up as an ensign upon his land.",
        "d": [
          "temple",
          "diadem",
          "sceptre",
          "palace",
          "sanctuary"
        ]
```

### D zechariah9 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For how great is his goodness, and how great is his",
        "a": "beauty",
        "suffix": "! corn shall make the young men cheerful, and new wine the maids.",
        "d": [
          "glory",
          "power",
          "majesty"
        ]
```

Replace with:

```js
"prefix": "For how great is his goodness, and how great is his",
        "a": "beauty",
        "suffix": "! corn shall make the young men cheerful, and new wine the maids.",
        "d": [
          "glory",
          "power",
          "majesty",
          "mercy",
          "favour"
        ]
```

### D malachi3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Behold, I will send my",
        "a": "messenger",
        "suffix": ", and he shall prepare the way before me:",
        "d": [
          "angel",
          "servant",
          "prophet"
        ]
```

Replace with:

```js
"prefix": "Behold, I will send my",
        "a": "messenger",
        "suffix": ", and he shall prepare the way before me:",
        "d": [
          "angel",
          "servant",
          "prophet",
          "herald",
          "shepherd"
        ]
```

### D malachi3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and the Lord, whom ye seek, shall suddenly come to his",
        "a": "temple",
        "suffix": ",",
        "d": [
          "city",
          "palace",
          "throne"
        ]
```

Replace with:

```js
"prefix": "and the Lord, whom ye seek, shall suddenly come to his",
        "a": "temple",
        "suffix": ",",
        "d": [
          "city",
          "palace",
          "throne",
          "altar",
          "field"
        ]
```

### D malachi3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for he is like a refiner's",
        "a": "fire",
        "suffix": ", and like fullers' soap:",
        "d": [
          "furnace",
          "flame",
          "silver"
        ]
```

Replace with:

```js
"prefix": "for he is like a refiner's",
        "a": "fire",
        "suffix": ", and like fullers' soap:",
        "d": [
          "furnace",
          "flame",
          "silver",
          "gold",
          "iron"
        ]
```

### D malachi3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he shall sit as a refiner and purifier of",
        "a": "silver",
        "suffix": ": and he shall purify the sons of Levi,",
        "d": [
          "gold",
          "vessels",
          "metal"
        ]
```

Replace with:

```js
"prefix": "And he shall sit as a refiner and purifier of",
        "a": "silver",
        "suffix": ": and he shall purify the sons of Levi,",
        "d": [
          "gold",
          "vessels",
          "metal",
          "brass",
          "lead"
        ]
```

### D malachi3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For I am the LORD, I",
        "a": "change",
        "suffix": "not; therefore ye sons of Jacob are not consumed.",
        "d": [
          "fail",
          "repent",
          "sleep"
        ]
```

Replace with:

```js
"prefix": "For I am the LORD, I",
        "a": "change",
        "suffix": "not; therefore ye sons of Jacob are not consumed.",
        "d": [
          "fail",
          "repent",
          "sleep",
          "lie",
          "forget"
        ]
```

### D malachi3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Bring ye all the tithes into the",
        "a": "storehouse",
        "suffix": ", that there may be meat in mine house,",
        "d": [
          "temple",
          "barn",
          "treasury"
        ]
```

Replace with:

```js
"prefix": "Bring ye all the tithes into the",
        "a": "storehouse",
        "suffix": ", that there may be meat in mine house,",
        "d": [
          "temple",
          "barn",
          "treasury",
          "winepress",
          "sanctuary"
        ]
```

### D malachi3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then they that feared the LORD spake often one to another: and a book of",
        "a": "remembrance",
        "suffix": "was written before him",
        "d": [
          "life",
          "words",
          "mercy"
        ]
```

Replace with:

```js
"prefix": "Then they that feared the LORD spake often one to another: and a book of",
        "a": "remembrance",
        "suffix": "was written before him",
        "d": [
          "life",
          "words",
          "mercy",
          "judgment",
          "wisdom"
        ]
```

### D malachi3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they shall be mine, saith the LORD of hosts, in that day when I make up my",
        "a": "jewels",
        "suffix": ";",
        "d": [
          "crown",
          "treasures",
          "people"
        ]
```

Replace with:

```js
"prefix": "And they shall be mine, saith the LORD of hosts, in that day when I make up my",
        "a": "jewels",
        "suffix": ";",
        "d": [
          "crown",
          "treasures",
          "people",
          "sheep",
          "vessels"
        ]
```

### D matthew13 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Behold, a sower went forth to",
        "a": "sow",
        "suffix": ";",
        "d": [
          "reap",
          "plant",
          "gather"
        ]
```

Replace with:

```js
"prefix": "Behold, a sower went forth to",
        "a": "sow",
        "suffix": ";",
        "d": [
          "reap",
          "plant",
          "gather",
          "water",
          "sell"
        ]
```

### D matthew13 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But other fell into good ground, and brought forth",
        "a": "fruit",
        "suffix": ", some an hundredfold, some sixtyfold, some thirtyfold.",
        "d": [
          "corn",
          "grain",
          "wheat"
        ]
```

Replace with:

```js
"prefix": "But other fell into good ground, and brought forth",
        "a": "fruit",
        "suffix": ", some an hundredfold, some sixtyfold, some thirtyfold.",
        "d": [
          "corn",
          "grain",
          "wheat",
          "leaves",
          "seed"
        ]
```

### D matthew13 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who hath ears to hear, let him",
        "a": "hear",
        "suffix": ".",
        "d": [
          "understand",
          "listen",
          "know"
        ]
```

Replace with:

```js
"prefix": "Who hath ears to hear, let him",
        "a": "hear",
        "suffix": ".",
        "d": [
          "understand",
          "listen",
          "know",
          "see",
          "fear"
        ]
```

### D matthew13 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The kingdom of heaven is like to a grain of",
        "a": "mustard",
        "suffix": "seed, which a man took, and sowed in his field:",
        "d": [
          "wheat",
          "corn",
          "fig"
        ]
```

Replace with:

```js
"prefix": "The kingdom of heaven is like to a grain of",
        "a": "mustard",
        "suffix": "seed, which a man took, and sowed in his field:",
        "d": [
          "wheat",
          "corn",
          "fig",
          "barley",
          "salt"
        ]
```

### D matthew13 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The kingdom of heaven is like unto",
        "a": "leaven",
        "suffix": ", which a woman took, and hid in three measures of meal,",
        "d": [
          "salt",
          "bread",
          "honey"
        ]
```

Replace with:

```js
"prefix": "The kingdom of heaven is like unto",
        "a": "leaven",
        "suffix": ", which a woman took, and hid in three measures of meal,",
        "d": [
          "salt",
          "bread",
          "honey",
          "wine",
          "gold"
        ]
```

### D matthew13 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the kingdom of heaven is like unto treasure hid in a",
        "a": "field",
        "suffix": "; the which when a man hath found, he hideth,",
        "d": [
          "house",
          "garden",
          "mountain"
        ]
```

Replace with:

```js
"prefix": "the kingdom of heaven is like unto treasure hid in a",
        "a": "field",
        "suffix": "; the which when a man hath found, he hideth,",
        "d": [
          "house",
          "garden",
          "mountain",
          "cave",
          "city"
        ]
```

### D matthew13 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the kingdom of heaven is like unto a merchant man, seeking goodly",
        "a": "pearls",
        "suffix": ":",
        "d": [
          "jewels",
          "gems",
          "stones"
        ]
```

Replace with:

```js
"prefix": "the kingdom of heaven is like unto a merchant man, seeking goodly",
        "a": "pearls",
        "suffix": ":",
        "d": [
          "jewels",
          "gems",
          "stones",
          "rubies",
          "silver"
        ]
```

### D matthew13 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who, when he had found one pearl of great",
        "a": "price",
        "suffix": ", went and sold all that he had, and bought it.",
        "d": [
          "worth",
          "beauty",
          "glory"
        ]
```

Replace with:

```js
"prefix": "Who, when he had found one pearl of great",
        "a": "price",
        "suffix": ", went and sold all that he had, and bought it.",
        "d": [
          "worth",
          "beauty",
          "glory",
          "treasure",
          "size"
        ]
```

### D matthew24 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Take heed that no man",
        "a": "deceive",
        "suffix": "you.",
        "d": [
          "trouble",
          "lead",
          "harm"
        ]
```

Replace with:

```js
"prefix": "Take heed that no man",
        "a": "deceive",
        "suffix": "you.",
        "d": [
          "trouble",
          "lead",
          "harm",
          "tempt",
          "praise"
        ]
```

### D matthew24 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And ye shall hear of wars and rumours of",
        "a": "wars",
        "suffix": ": see that ye be not troubled: for all these things must come to pass,",
        "d": [
          "famines",
          "earthquakes",
          "plagues"
        ]
```

Replace with:

```js
"prefix": "And ye shall hear of wars and rumours of",
        "a": "wars",
        "suffix": ": see that ye be not troubled: for all these things must come to pass,",
        "d": [
          "famines",
          "earthquakes",
          "plagues",
          "sorrows",
          "gold"
        ]
```

### D matthew24 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But he that shall endure unto the",
        "a": "end",
        "suffix": ", the same shall be saved.",
        "d": [
          "death",
          "trial",
          "last"
        ]
```

Replace with:

```js
"prefix": "But he that shall endure unto the",
        "a": "end",
        "suffix": ", the same shall be saved.",
        "d": [
          "death",
          "trial",
          "last",
          "day",
          "time"
        ]
```

### D matthew24 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And this gospel of the kingdom shall be preached in all the",
        "a": "world",
        "suffix": "for a witness unto all nations;",
        "d": [
          "earth",
          "land",
          "cities"
        ]
```

Replace with:

```js
"prefix": "And this gospel of the kingdom shall be preached in all the",
        "a": "world",
        "suffix": "for a witness unto all nations;",
        "d": [
          "earth",
          "land",
          "cities",
          "heavens",
          "sea"
        ]
```

### D matthew24 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For as the lightning cometh out of the east, and shineth even unto the",
        "a": "west",
        "suffix": "; so shall also the coming of the Son of man be.",
        "d": [
          "south",
          "north",
          "ends"
        ]
```

Replace with:

```js
"prefix": "For as the lightning cometh out of the east, and shineth even unto the",
        "a": "west",
        "suffix": "; so shall also the coming of the Son of man be.",
        "d": [
          "south",
          "north",
          "ends",
          "earth",
          "sea"
        ]
```

### D matthew24 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and they shall see the Son of man coming in the clouds of heaven with power and great",
        "a": "glory",
        "suffix": ".",
        "d": [
          "might",
          "majesty",
          "light"
        ]
```

Replace with:

```js
"prefix": "and they shall see the Son of man coming in the clouds of heaven with power and great",
        "a": "glory",
        "suffix": ".",
        "d": [
          "might",
          "majesty",
          "light",
          "joy",
          "wrath"
        ]
```

### D matthew24 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Heaven and earth shall pass away, but my words shall not pass",
        "a": "away",
        "suffix": ".",
        "d": [
          "void",
          "empty",
          "off"
        ]
```

Replace with:

```js
"prefix": "Heaven and earth shall pass away, but my words shall not pass",
        "a": "away",
        "suffix": ".",
        "d": [
          "void",
          "empty",
          "off",
          "by",
          "over"
        ]
```

### D matthew24 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Watch therefore: for ye know not what",
        "a": "hour",
        "suffix": "your Lord doth come.",
        "d": [
          "day",
          "season",
          "moment"
        ]
```

Replace with:

```js
"prefix": "Watch therefore: for ye know not what",
        "a": "hour",
        "suffix": "your Lord doth come.",
        "d": [
          "day",
          "season",
          "moment",
          "night",
          "morning"
        ]
```

### D matthew25 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then shall the kingdom of heaven be likened unto ten virgins, which took their",
        "a": "lamps",
        "suffix": ", and went forth to meet the bridegroom.",
        "d": [
          "vessels",
          "torches",
          "pitchers"
        ]
```

Replace with:

```js
"prefix": "Then shall the kingdom of heaven be likened unto ten virgins, which took their",
        "a": "lamps",
        "suffix": ", and went forth to meet the bridegroom.",
        "d": [
          "vessels",
          "torches",
          "pitchers",
          "garments",
          "treasures"
        ]
```

### D matthew25 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And five of them were wise, and five were",
        "a": "foolish",
        "suffix": ".",
        "d": [
          "simple",
          "slothful",
          "blind"
        ]
```

Replace with:

```js
"prefix": "And five of them were wise, and five were",
        "a": "foolish",
        "suffix": ".",
        "d": [
          "simple",
          "slothful",
          "blind",
          "wicked",
          "holy"
        ]
```

### D matthew25 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But the wise took",
        "a": "oil",
        "suffix": "in their vessels with their lamps.",
        "d": [
          "wine",
          "bread",
          "light"
        ]
```

Replace with:

```js
"prefix": "But the wise took",
        "a": "oil",
        "suffix": "in their vessels with their lamps.",
        "d": [
          "wine",
          "bread",
          "light",
          "water",
          "salt"
        ]
```

### D matthew25 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And at midnight there was a cry made, Behold, the",
        "a": "bridegroom",
        "suffix": "cometh; go ye out to meet him.",
        "d": [
          "king",
          "master",
          "lord"
        ]
```

Replace with:

```js
"prefix": "And at midnight there was a cry made, Behold, the",
        "a": "bridegroom",
        "suffix": "cometh; go ye out to meet him.",
        "d": [
          "king",
          "master",
          "lord",
          "messenger",
          "judge"
        ]
```

### D matthew25 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Well done, thou good and",
        "a": "faithful",
        "suffix": "servant: thou hast been faithful over a few things, I will make thee ruler over many things:",
        "d": [
          "just",
          "wise",
          "true"
        ]
```

Replace with:

```js
"prefix": "Well done, thou good and",
        "a": "faithful",
        "suffix": "servant: thou hast been faithful over a few things, I will make thee ruler over many things:",
        "d": [
          "just",
          "wise",
          "true",
          "humble",
          "cruel"
        ]
```

### D matthew25 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "enter thou into the",
        "a": "joy",
        "suffix": "of thy lord.",
        "d": [
          "rest",
          "kingdom",
          "peace"
        ]
```

Replace with:

```js
"prefix": "enter thou into the",
        "a": "joy",
        "suffix": "of thy lord.",
        "d": [
          "rest",
          "kingdom",
          "peace",
          "house",
          "gates"
        ]
```

### D matthew25 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Come, ye blessed of my Father, inherit the",
        "a": "kingdom",
        "suffix": "prepared for you from the foundation of the world:",
        "d": [
          "glory",
          "rest",
          "inheritance"
        ]
```

Replace with:

```js
"prefix": "Come, ye blessed of my Father, inherit the",
        "a": "kingdom",
        "suffix": "prepared for you from the foundation of the world:",
        "d": [
          "glory",
          "rest",
          "inheritance",
          "earth",
          "heavens"
        ]
```

### D matthew25 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto",
        "a": "me",
        "suffix": ".",
        "d": [
          "God",
          "heaven",
          "us"
        ]
```

Replace with:

```js
"prefix": "Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto",
        "a": "me",
        "suffix": ".",
        "d": [
          "God",
          "heaven",
          "us",
          "him",
          "them"
        ]
```

### D mark4 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He that hath ears to hear, let him",
        "a": "hear",
        "suffix": ".",
        "d": [
          "listen",
          "understand",
          "take heed"
        ]
```

Replace with:

```js
"prefix": "He that hath ears to hear, let him",
        "a": "hear",
        "suffix": ".",
        "d": [
          "listen",
          "understand",
          "take heed",
          "see",
          "know"
        ]
```

### D mark4 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For there is nothing hid, which shall not be",
        "a": "manifested",
        "suffix": "; neither was any thing kept secret, but that it should come abroad.",
        "d": [
          "known",
          "revealed",
          "spoken"
        ]
```

Replace with:

```js
"prefix": "For there is nothing hid, which shall not be",
        "a": "manifested",
        "suffix": "; neither was any thing kept secret, but that it should come abroad.",
        "d": [
          "known",
          "revealed",
          "spoken",
          "forgotten",
          "buried"
        ]
```

### D mark4 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Take heed what ye hear: with what measure ye mete, it shall be",
        "a": "measured",
        "suffix": "to you:",
        "d": [
          "given",
          "counted",
          "judged"
        ]
```

Replace with:

```js
"prefix": "Take heed what ye hear: with what measure ye mete, it shall be",
        "a": "measured",
        "suffix": "to you:",
        "d": [
          "given",
          "counted",
          "judged",
          "rendered",
          "sold"
        ]
```

### D mark4 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For the earth bringeth forth fruit of herself; first the blade, then the",
        "a": "ear",
        "suffix": ", after that the full corn in the ear.",
        "d": [
          "stalk",
          "flower",
          "leaf"
        ]
```

Replace with:

```js
"prefix": "For the earth bringeth forth fruit of herself; first the blade, then the",
        "a": "ear",
        "suffix": ", after that the full corn in the ear.",
        "d": [
          "stalk",
          "flower",
          "leaf",
          "root",
          "seed"
        ]
```

### D mark4 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And there arose a great storm of wind, and the waves beat into the",
        "a": "ship",
        "suffix": ", so that it was now full.",
        "d": [
          "boat",
          "vessel",
          "deep"
        ]
```

Replace with:

```js
"prefix": "And there arose a great storm of wind, and the waves beat into the",
        "a": "ship",
        "suffix": ", so that it was now full.",
        "d": [
          "boat",
          "vessel",
          "deep",
          "wall",
          "cave"
        ]
```

### D mark4 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Master, carest thou not that we",
        "a": "perish",
        "suffix": "?",
        "d": [
          "drown",
          "die",
          "sink"
        ]
```

Replace with:

```js
"prefix": "Master, carest thou not that we",
        "a": "perish",
        "suffix": "?",
        "d": [
          "drown",
          "die",
          "sink",
          "suffer",
          "faint"
        ]
```

### D mark4 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he arose, and rebuked the wind, and said unto the sea, Peace, be",
        "a": "still",
        "suffix": ". And the wind ceased, and there was a great calm.",
        "d": [
          "calm",
          "quiet",
          "silent"
        ]
```

Replace with:

```js
"prefix": "And he arose, and rebuked the wind, and said unto the sea, Peace, be",
        "a": "still",
        "suffix": ". And the wind ceased, and there was a great calm.",
        "d": [
          "calm",
          "quiet",
          "silent",
          "gone",
          "vexed"
        ]
```

### D mark4 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "What manner of man is this, that even the wind and the sea",
        "a": "obey",
        "suffix": "him?",
        "d": [
          "fear",
          "know",
          "hear"
        ]
```

Replace with:

```js
"prefix": "What manner of man is this, that even the wind and the sea",
        "a": "obey",
        "suffix": "him?",
        "d": [
          "fear",
          "know",
          "hear",
          "follow",
          "worship"
        ]
```

### D mark13 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Seest thou these great buildings? there shall not be left one",
        "a": "stone",
        "suffix": "upon another, that shall not be thrown down.",
        "d": [
          "wall",
          "pillar",
          "brick"
        ]
```

Replace with:

```js
"prefix": "Seest thou these great buildings? there shall not be left one",
        "a": "stone",
        "suffix": "upon another, that shall not be thrown down.",
        "d": [
          "wall",
          "pillar",
          "brick",
          "beam",
          "tower"
        ]
```

### D mark13 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And when ye shall hear of wars and rumours of wars, be ye not",
        "a": "troubled",
        "suffix": ": for such things must needs be;",
        "d": [
          "afraid",
          "dismayed",
          "fearful"
        ]
```

Replace with:

```js
"prefix": "And when ye shall hear of wars and rumours of wars, be ye not",
        "a": "troubled",
        "suffix": ": for such things must needs be;",
        "d": [
          "afraid",
          "dismayed",
          "fearful",
          "shaken",
          "glad"
        ]
```

### D mark13 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the gospel must first be published among all",
        "a": "nations",
        "suffix": ".",
        "d": [
          "peoples",
          "gentiles",
          "lands"
        ]
```

Replace with:

```js
"prefix": "And the gospel must first be published among all",
        "a": "nations",
        "suffix": ".",
        "d": [
          "peoples",
          "gentiles",
          "lands",
          "churches",
          "tribes"
        ]
```

### D mark13 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "it is not ye that speak, but the Holy",
        "a": "Ghost",
        "suffix": ".",
        "d": [
          "Spirit",
          "Father",
          "Lord"
        ]
```

Replace with:

```js
"prefix": "it is not ye that speak, but the Holy",
        "a": "Ghost",
        "suffix": ".",
        "d": [
          "Spirit",
          "Father",
          "Lord",
          "Word",
          "Angel"
        ]
```

### D mark13 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "he that shall endure unto the end, the same shall be",
        "a": "saved",
        "suffix": ".",
        "d": [
          "delivered",
          "blessed",
          "crowned"
        ]
```

Replace with:

```js
"prefix": "he that shall endure unto the end, the same shall be",
        "a": "saved",
        "suffix": ".",
        "d": [
          "delivered",
          "blessed",
          "crowned",
          "spared",
          "forgiven"
        ]
```

### D mark13 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And then shall they see the Son of man coming in the clouds with great power and",
        "a": "glory",
        "suffix": ".",
        "d": [
          "majesty",
          "might",
          "light"
        ]
```

Replace with:

```js
"prefix": "And then shall they see the Son of man coming in the clouds with great power and",
        "a": "glory",
        "suffix": ".",
        "d": [
          "majesty",
          "might",
          "light",
          "wisdom",
          "wrath"
        ]
```

### D mark13 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Heaven and earth shall pass away: but my words shall not pass",
        "a": "away",
        "suffix": ".",
        "d": [
          "off",
          "void",
          "empty"
        ]
```

Replace with:

```js
"prefix": "Heaven and earth shall pass away: but my words shall not pass",
        "a": "away",
        "suffix": ".",
        "d": [
          "off",
          "void",
          "empty",
          "by",
          "over"
        ]
```

### D mark13 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And what I say unto you I say unto all,",
        "a": "Watch",
        "suffix": ".",
        "d": [
          "Pray",
          "Stand",
          "Believe"
        ]
```

Replace with:

```js
"prefix": "And what I say unto you I say unto all,",
        "a": "Watch",
        "suffix": ".",
        "d": [
          "Pray",
          "Stand",
          "Believe",
          "Remember",
          "Rejoice"
        ]
```

### D luke4 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Jesus being full of the Holy Ghost returned from Jordan, and was led by the Spirit into the",
        "a": "wilderness",
        "suffix": ",",
        "d": [
          "desert",
          "mount",
          "plain"
        ]
```

Replace with:

```js
"prefix": "And Jesus being full of the Holy Ghost returned from Jordan, and was led by the Spirit into the",
        "a": "wilderness",
        "suffix": ",",
        "d": [
          "desert",
          "mount",
          "plain",
          "temple",
          "field"
        ]
```

### D luke4 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "It is written, That man shall not live by bread alone, but by every",
        "a": "word",
        "suffix": "of God.",
        "d": [
          "commandment",
          "statute",
          "truth"
        ]
```

Replace with:

```js
"prefix": "It is written, That man shall not live by bread alone, but by every",
        "a": "word",
        "suffix": "of God.",
        "d": [
          "commandment",
          "statute",
          "truth",
          "name",
          "work"
        ]
```

### D luke4 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou shalt worship the Lord thy God, and him",
        "a": "only",
        "suffix": "shalt thou serve.",
        "d": [
          "alone",
          "truly",
          "ever"
        ]
```

Replace with:

```js
"prefix": "Thou shalt worship the Lord thy God, and him",
        "a": "only",
        "suffix": "shalt thou serve.",
        "d": [
          "alone",
          "truly",
          "ever",
          "first",
          "always"
        ]
```

### D luke4 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "It is said, Thou shalt not tempt the Lord thy",
        "a": "God",
        "suffix": ".",
        "d": [
          "Father",
          "King",
          "Master"
        ]
```

Replace with:

```js
"prefix": "It is said, Thou shalt not tempt the Lord thy",
        "a": "God",
        "suffix": ".",
        "d": [
          "Father",
          "King",
          "Master",
          "Judge",
          "Shepherd"
        ]
```

### D luke4 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the",
        "a": "poor",
        "suffix": ";",
        "d": [
          "meek",
          "broken",
          "nations"
        ]
```

Replace with:

```js
"prefix": "The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the",
        "a": "poor",
        "suffix": ";",
        "d": [
          "meek",
          "broken",
          "nations",
          "sick",
          "lost"
        ]
```

### D luke4 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "he hath sent me to heal the",
        "a": "brokenhearted",
        "suffix": ", to preach deliverance to the captives,",
        "d": [
          "meek",
          "mourners",
          "sinners"
        ]
```

Replace with:

```js
"prefix": "he hath sent me to heal the",
        "a": "brokenhearted",
        "suffix": ", to preach deliverance to the captives,",
        "d": [
          "meek",
          "mourners",
          "sinners",
          "afflicted",
          "dumb"
        ]
```

### D luke4 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "To preach the acceptable year of the",
        "a": "Lord",
        "suffix": ".",
        "d": [
          "God",
          "King",
          "Father"
        ]
```

Replace with:

```js
"prefix": "To preach the acceptable year of the",
        "a": "Lord",
        "suffix": ".",
        "d": [
          "God",
          "King",
          "Father",
          "Prophet",
          "Priest"
        ]
```

### D luke4 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they were astonished at his doctrine: for his word was with",
        "a": "power",
        "suffix": ".",
        "d": [
          "authority",
          "grace",
          "truth"
        ]
```

Replace with:

```js
"prefix": "And they were astonished at his doctrine: for his word was with",
        "a": "power",
        "suffix": ".",
        "d": [
          "authority",
          "grace",
          "truth",
          "wisdom",
          "glory"
        ]
```

### D luke18 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "that men ought always to pray, and not to",
        "a": "faint",
        "suffix": ";",
        "d": [
          "cease",
          "doubt",
          "fear"
        ]
```

Replace with:

```js
"prefix": "that men ought always to pray, and not to",
        "a": "faint",
        "suffix": ";",
        "d": [
          "cease",
          "doubt",
          "fear",
          "sleep",
          "sin"
        ]
```

### D luke18 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the publican, standing afar off, would not lift up so much as his eyes unto heaven, but smote upon his",
        "a": "breast",
        "suffix": ",",
        "d": [
          "face",
          "heart",
          "head"
        ]
```

Replace with:

```js
"prefix": "And the publican, standing afar off, would not lift up so much as his eyes unto heaven, but smote upon his",
        "a": "breast",
        "suffix": ",",
        "d": [
          "face",
          "heart",
          "head",
          "hand",
          "knee"
        ]
```

### D luke18 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "saying, God be merciful to me a",
        "a": "sinner",
        "suffix": ".",
        "d": [
          "servant",
          "man",
          "debtor"
        ]
```

Replace with:

```js
"prefix": "saying, God be merciful to me a",
        "a": "sinner",
        "suffix": ".",
        "d": [
          "servant",
          "man",
          "debtor",
          "stranger",
          "saint"
        ]
```

### D luke18 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for every one that exalteth himself shall be abased; and he that humbleth himself shall be",
        "a": "exalted",
        "suffix": ".",
        "d": [
          "raised",
          "blessed",
          "saved"
        ]
```

Replace with:

```js
"prefix": "for every one that exalteth himself shall be abased; and he that humbleth himself shall be",
        "a": "exalted",
        "suffix": ".",
        "d": [
          "raised",
          "blessed",
          "saved",
          "ashamed",
          "forgiven"
        ]
```

### D luke18 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Suffer little children to come unto me, and forbid them not: for of such is the",
        "a": "kingdom",
        "suffix": "of God.",
        "d": [
          "glory",
          "grace",
          "family"
        ]
```

Replace with:

```js
"prefix": "Suffer little children to come unto me, and forbid them not: for of such is the",
        "a": "kingdom",
        "suffix": "of God.",
        "d": [
          "glory",
          "grace",
          "family",
          "church",
          "temple"
        ]
```

### D luke18 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Whosoever shall not receive the kingdom of God as a little",
        "a": "child",
        "suffix": "shall in no wise enter therein.",
        "d": [
          "servant",
          "disciple",
          "son"
        ]
```

Replace with:

```js
"prefix": "Whosoever shall not receive the kingdom of God as a little",
        "a": "child",
        "suffix": "shall in no wise enter therein.",
        "d": [
          "servant",
          "disciple",
          "son",
          "lamb",
          "man"
        ]
```

### D luke18 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The things which are impossible with men are possible with",
        "a": "God",
        "suffix": ".",
        "d": [
          "faith",
          "prayer",
          "the Lord"
        ]
```

Replace with:

```js
"prefix": "The things which are impossible with men are possible with",
        "a": "God",
        "suffix": ".",
        "d": [
          "faith",
          "prayer",
          "the Lord",
          "Mammon",
          "Heaven"
        ]
```

### D luke18 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Receive thy sight: thy",
        "a": "faith",
        "suffix": "hath saved thee.",
        "d": [
          "prayer",
          "hope",
          "desire"
        ]
```

Replace with:

```js
"prefix": "Receive thy sight: thy",
        "a": "faith",
        "suffix": "hath saved thee.",
        "d": [
          "prayer",
          "hope",
          "desire",
          "pity",
          "patience"
        ]
```

### D john4 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "thou wouldest have asked of him, and he would have given thee living",
        "a": "water",
        "suffix": ".",
        "d": [
          "bread",
          "truth",
          "grace"
        ]
```

Replace with:

```js
"prefix": "thou wouldest have asked of him, and he would have given thee living",
        "a": "water",
        "suffix": ".",
        "d": [
          "bread",
          "truth",
          "grace",
          "wine",
          "fire"
        ]
```

### D john4 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "whosoever drinketh of the water that I shall give him shall never",
        "a": "thirst",
        "suffix": ";",
        "d": [
          "faint",
          "perish",
          "die"
        ]
```

Replace with:

```js
"prefix": "whosoever drinketh of the water that I shall give him shall never",
        "a": "thirst",
        "suffix": ";",
        "d": [
          "faint",
          "perish",
          "die",
          "weary",
          "fear"
        ]
```

### D john4 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "shall be in him a well of water springing up into everlasting",
        "a": "life",
        "suffix": ".",
        "d": [
          "glory",
          "peace",
          "grace"
        ]
```

Replace with:

```js
"prefix": "shall be in him a well of water springing up into everlasting",
        "a": "life",
        "suffix": ".",
        "d": [
          "glory",
          "peace",
          "grace",
          "joy",
          "salvation"
        ]
```

### D john4 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the true worshippers shall worship the Father in spirit and in",
        "a": "truth",
        "suffix": ": for the Father seeketh such to worship him.",
        "d": [
          "holiness",
          "peace",
          "love"
        ]
```

Replace with:

```js
"prefix": "the true worshippers shall worship the Father in spirit and in",
        "a": "truth",
        "suffix": ": for the Father seeketh such to worship him.",
        "d": [
          "holiness",
          "peace",
          "love",
          "faith",
          "power"
        ]
```

### D john4 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "God is a",
        "a": "Spirit",
        "suffix": ": and they that worship him must worship him in spirit and in truth.",
        "d": [
          "Light",
          "Fire",
          "Father"
        ]
```

Replace with:

```js
"prefix": "God is a",
        "a": "Spirit",
        "suffix": ": and they that worship him must worship him in spirit and in truth.",
        "d": [
          "Light",
          "Fire",
          "Father",
          "Judge",
          "Shepherd"
        ]
```

### D john4 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "My meat is to do the will of him that sent me, and to finish his",
        "a": "work",
        "suffix": ".",
        "d": [
          "word",
          "law",
          "commandment"
        ]
```

Replace with:

```js
"prefix": "My meat is to do the will of him that sent me, and to finish his",
        "a": "work",
        "suffix": ".",
        "d": [
          "word",
          "law",
          "commandment",
          "course",
          "song"
        ]
```

### D john4 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "lift up your eyes, and look on the fields; for they are white already to",
        "a": "harvest",
        "suffix": ".",
        "d": [
          "reap",
          "ripen",
          "gather"
        ]
```

Replace with:

```js
"prefix": "lift up your eyes, and look on the fields; for they are white already to",
        "a": "harvest",
        "suffix": ".",
        "d": [
          "reap",
          "ripen",
          "gather",
          "sow",
          "eat"
        ]
```

### D john4 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "this is indeed the Christ, the Saviour of the",
        "a": "world",
        "suffix": ".",
        "d": [
          "people",
          "nations",
          "earth"
        ]
```

Replace with:

```js
"prefix": "this is indeed the Christ, the Saviour of the",
        "a": "world",
        "suffix": ".",
        "d": [
          "people",
          "nations",
          "earth",
          "church",
          "flock"
        ]
```

### D john6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And Jesus said unto them, I am the bread of",
        "a": "life",
        "suffix": ": he that cometh to me shall never hunger;",
        "d": [
          "heaven",
          "truth",
          "God"
        ]
```

Replace with:

```js
"prefix": "And Jesus said unto them, I am the bread of",
        "a": "life",
        "suffix": ": he that cometh to me shall never hunger;",
        "d": [
          "heaven",
          "truth",
          "God",
          "wisdom",
          "grace"
        ]
```

### D john6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and he that believeth on me shall never",
        "a": "thirst",
        "suffix": ".",
        "d": [
          "die",
          "faint",
          "perish"
        ]
```

Replace with:

```js
"prefix": "and he that believeth on me shall never",
        "a": "thirst",
        "suffix": ".",
        "d": [
          "die",
          "faint",
          "perish",
          "fear",
          "weary"
        ]
```

### D john6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "All that the Father giveth me shall come to me; and him that cometh to me I will in no wise cast",
        "a": "out",
        "suffix": ".",
        "d": [
          "away",
          "off",
          "down"
        ]
```

Replace with:

```js
"prefix": "All that the Father giveth me shall come to me; and him that cometh to me I will in no wise cast",
        "a": "out",
        "suffix": ".",
        "d": [
          "away",
          "off",
          "down",
          "back",
          "aside"
        ]
```

### D john6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "every one which seeth the Son, and believeth on him, may have everlasting life: and I will raise him up at the",
        "a": "last",
        "suffix": "day.",
        "d": [
          "great",
          "final",
          "latter"
        ]
```

Replace with:

```js
"prefix": "every one which seeth the Son, and believeth on him, may have everlasting life: and I will raise him up at the",
        "a": "last",
        "suffix": "day.",
        "d": [
          "great",
          "final",
          "latter",
          "first",
          "dreadful"
        ]
```

### D john6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Verily, verily, I say unto you, He that believeth on me hath everlasting",
        "a": "life",
        "suffix": ".",
        "d": [
          "peace",
          "joy",
          "glory"
        ]
```

Replace with:

```js
"prefix": "Verily, verily, I say unto you, He that believeth on me hath everlasting",
        "a": "life",
        "suffix": ".",
        "d": [
          "peace",
          "joy",
          "glory",
          "death",
          "wrath"
        ]
```

### D john6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am the living bread which came down from",
        "a": "heaven",
        "suffix": ":",
        "d": [
          "the Father",
          "glory",
          "above"
        ]
```

Replace with:

```js
"prefix": "I am the living bread which came down from",
        "a": "heaven",
        "suffix": ":",
        "d": [
          "the Father",
          "glory",
          "above",
          "earth",
          "hell"
        ]
```

### D john6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "It is the spirit that quickeneth; the flesh profiteth nothing: the words that I speak unto you, they are spirit, and they are",
        "a": "life",
        "suffix": ".",
        "d": [
          "truth",
          "light",
          "grace"
        ]
```

Replace with:

```js
"prefix": "It is the spirit that quickeneth; the flesh profiteth nothing: the words that I speak unto you, they are spirit, and they are",
        "a": "life",
        "suffix": ".",
        "d": [
          "truth",
          "light",
          "grace",
          "love",
          "peace"
        ]
```

### D john6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Lord, to whom shall we go? thou hast the words of eternal",
        "a": "life",
        "suffix": ".",
        "d": [
          "truth",
          "salvation",
          "grace"
        ]
```

Replace with:

```js
"prefix": "Lord, to whom shall we go? thou hast the words of eternal",
        "a": "life",
        "suffix": ".",
        "d": [
          "truth",
          "salvation",
          "grace",
          "glory",
          "light"
        ]
```

### D john15 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am the true vine, and my Father is the",
        "a": "husbandman",
        "suffix": ".",
        "d": [
          "gardener",
          "keeper",
          "builder"
        ]
```

Replace with:

```js
"prefix": "I am the true vine, and my Father is the",
        "a": "husbandman",
        "suffix": ".",
        "d": [
          "gardener",
          "keeper",
          "builder",
          "shepherd",
          "judge"
        ]
```

### D john15 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Every branch in me that beareth not fruit he taketh away: and every branch that beareth fruit, he",
        "a": "purgeth",
        "suffix": "it, that it may bring forth more fruit.",
        "d": [
          "cleanseth",
          "watereth",
          "keepeth"
        ]
```

Replace with:

```js
"prefix": "Every branch in me that beareth not fruit he taketh away: and every branch that beareth fruit, he",
        "a": "purgeth",
        "suffix": "it, that it may bring forth more fruit.",
        "d": [
          "cleanseth",
          "watereth",
          "keepeth",
          "burneth",
          "drinketh"
        ]
```

### D john15 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am the vine, ye are the",
        "a": "branches",
        "suffix": ": He that abideth in me, and I in him, the same bringeth forth much fruit:",
        "d": [
          "shoots",
          "leaves",
          "twigs"
        ]
```

Replace with:

```js
"prefix": "I am the vine, ye are the",
        "a": "branches",
        "suffix": ": He that abideth in me, and I in him, the same bringeth forth much fruit:",
        "d": [
          "shoots",
          "leaves",
          "twigs",
          "roots",
          "stones"
        ]
```

### D john15 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for without me ye can do",
        "a": "nothing",
        "suffix": ".",
        "d": [
          "little",
          "naught",
          "no good"
        ]
```

Replace with:

```js
"prefix": "for without me ye can do",
        "a": "nothing",
        "suffix": ".",
        "d": [
          "little",
          "naught",
          "no good",
          "all",
          "anything"
        ]
```

### D john15 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If ye abide in me, and my words abide in you, ye shall ask what ye will, and it shall be",
        "a": "done",
        "suffix": "unto you.",
        "d": [
          "given",
          "granted",
          "opened"
        ]
```

Replace with:

```js
"prefix": "If ye abide in me, and my words abide in you, ye shall ask what ye will, and it shall be",
        "a": "done",
        "suffix": "unto you.",
        "d": [
          "given",
          "granted",
          "opened",
          "sent",
          "withheld"
        ]
```

### D john15 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "This is my commandment, That ye",
        "a": "love",
        "suffix": "one another, as I have loved you.",
        "d": [
          "serve",
          "forgive",
          "help"
        ]
```

Replace with:

```js
"prefix": "This is my commandment, That ye",
        "a": "love",
        "suffix": "one another, as I have loved you.",
        "d": [
          "serve",
          "forgive",
          "help",
          "honour",
          "trust"
        ]
```

### D john15 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Greater love hath no man than this, that a man lay down his",
        "a": "life",
        "suffix": "for his friends.",
        "d": [
          "soul",
          "body",
          "all"
        ]
```

Replace with:

```js
"prefix": "Greater love hath no man than this, that a man lay down his",
        "a": "life",
        "suffix": "for his friends.",
        "d": [
          "soul",
          "body",
          "all",
          "wealth",
          "money"
        ]
```

### D john15 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ye have not chosen me, but I have",
        "a": "chosen",
        "suffix": "you, and ordained you, that ye should go and bring forth fruit,",
        "d": [
          "called",
          "named",
          "sent"
        ]
```

Replace with:

```js
"prefix": "Ye have not chosen me, but I have",
        "a": "chosen",
        "suffix": "you, and ordained you, that ye should go and bring forth fruit,",
        "d": [
          "called",
          "named",
          "sent",
          "known",
          "loved"
        ]
```

### D john17 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Father, the hour is come; glorify thy Son, that thy Son also may glorify",
        "a": "thee",
        "suffix": ":",
        "d": [
          "the Father",
          "heaven",
          "thy name"
        ]
```

Replace with:

```js
"prefix": "Father, the hour is come; glorify thy Son, that thy Son also may glorify",
        "a": "thee",
        "suffix": ":",
        "d": [
          "the Father",
          "heaven",
          "thy name",
          "him",
          "them"
        ]
```

### D john17 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And this is life eternal, that they might know thee the only true",
        "a": "God",
        "suffix": ", and Jesus Christ, whom thou hast sent.",
        "d": [
          "Lord",
          "Father",
          "King"
        ]
```

Replace with:

```js
"prefix": "And this is life eternal, that they might know thee the only true",
        "a": "God",
        "suffix": ", and Jesus Christ, whom thou hast sent.",
        "d": [
          "Lord",
          "Father",
          "King",
          "Saviour",
          "Judge"
        ]
```

### D john17 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I have glorified thee on the earth: I have",
        "a": "finished",
        "suffix": "the work which thou gavest me to do.",
        "d": [
          "done",
          "completed",
          "fulfilled"
        ]
```

Replace with:

```js
"prefix": "I have glorified thee on the earth: I have",
        "a": "finished",
        "suffix": "the work which thou gavest me to do.",
        "d": [
          "done",
          "completed",
          "fulfilled",
          "begun",
          "left"
        ]
```

### D john17 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Holy Father, keep through thine own name those whom thou hast given me, that they may be",
        "a": "one",
        "suffix": ", as we are.",
        "d": [
          "holy",
          "pure",
          "kept"
        ]
```

Replace with:

```js
"prefix": "Holy Father, keep through thine own name those whom thou hast given me, that they may be",
        "a": "one",
        "suffix": ", as we are.",
        "d": [
          "holy",
          "pure",
          "kept",
          "blessed",
          "safe"
        ]
```

### D john17 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Sanctify them through thy truth: thy word is",
        "a": "truth",
        "suffix": ".",
        "d": [
          "holy",
          "life",
          "light"
        ]
```

Replace with:

```js
"prefix": "Sanctify them through thy truth: thy word is",
        "a": "truth",
        "suffix": ".",
        "d": [
          "holy",
          "life",
          "light",
          "love",
          "power"
        ]
```

### D john17 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "That they all may be one; as thou, Father, art in me, and I in",
        "a": "thee",
        "suffix": ",",
        "d": [
          "them",
          "heaven",
          "us"
        ]
```

Replace with:

```js
"prefix": "That they all may be one; as thou, Father, art in me, and I in",
        "a": "thee",
        "suffix": ",",
        "d": [
          "them",
          "heaven",
          "us",
          "him",
          "you"
        ]
```

### D john17 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the glory which thou gavest me I have given",
        "a": "them",
        "suffix": "; that they may be one, even as we are one:",
        "d": [
          "all",
          "us",
          "him"
        ]
```

Replace with:

```js
"prefix": "And the glory which thou gavest me I have given",
        "a": "them",
        "suffix": "; that they may be one, even as we are one:",
        "d": [
          "all",
          "us",
          "him",
          "you",
          "thee"
        ]
```

### D john17 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Father, I will that they also, whom thou hast given me, be with me where I",
        "a": "am",
        "suffix": "; that they may behold my glory,",
        "d": [
          "go",
          "dwell",
          "reign"
        ]
```

Replace with:

```js
"prefix": "Father, I will that they also, whom thou hast given me, be with me where I",
        "a": "am",
        "suffix": "; that they may behold my glory,",
        "d": [
          "go",
          "dwell",
          "reign",
          "live",
          "rest"
        ]
```

### D acts1 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "To whom also he shewed himself alive after his passion by many infallible",
        "a": "proofs",
        "suffix": ", being seen of them forty days,",
        "d": [
          "signs",
          "tokens",
          "wonders"
        ]
```

Replace with:

```js
"prefix": "To whom also he shewed himself alive after his passion by many infallible",
        "a": "proofs",
        "suffix": ", being seen of them forty days,",
        "d": [
          "signs",
          "tokens",
          "wonders",
          "witnesses",
          "gifts"
        ]
```

### D acts1 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But ye shall receive",
        "a": "power",
        "suffix": ", after that the Holy Ghost is come upon you:",
        "d": [
          "grace",
          "glory",
          "strength"
        ]
```

Replace with:

```js
"prefix": "But ye shall receive",
        "a": "power",
        "suffix": ", after that the Holy Ghost is come upon you:",
        "d": [
          "grace",
          "glory",
          "strength",
          "wisdom",
          "authority"
        ]
```

### D acts1 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the",
        "a": "earth",
        "suffix": ".",
        "d": [
          "world",
          "nations",
          "land"
        ]
```

Replace with:

```js
"prefix": "and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the",
        "a": "earth",
        "suffix": ".",
        "d": [
          "world",
          "nations",
          "land",
          "sea",
          "desert"
        ]
```

### D acts1 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and while they beheld, he was taken up; and a",
        "a": "cloud",
        "suffix": "received him out of their sight.",
        "d": [
          "light",
          "chariot",
          "flame"
        ]
```

Replace with:

```js
"prefix": "and while they beheld, he was taken up; and a",
        "a": "cloud",
        "suffix": "received him out of their sight.",
        "d": [
          "light",
          "chariot",
          "flame",
          "whirlwind",
          "fire"
        ]
```

### D acts1 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ye men of Galilee, why stand ye gazing up into",
        "a": "heaven",
        "suffix": "?",
        "d": [
          "the clouds",
          "the sky",
          "glory"
        ]
```

Replace with:

```js
"prefix": "Ye men of Galilee, why stand ye gazing up into",
        "a": "heaven",
        "suffix": "?",
        "d": [
          "the clouds",
          "the sky",
          "glory",
          "air",
          "sea"
        ]
```

### D acts1 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "this same Jesus, which is taken up from you into heaven, shall so come in like",
        "a": "manner",
        "suffix": "as ye have seen him go into heaven.",
        "d": [
          "glory",
          "power",
          "clouds"
        ]
```

Replace with:

```js
"prefix": "this same Jesus, which is taken up from you into heaven, shall so come in like",
        "a": "manner",
        "suffix": "as ye have seen him go into heaven.",
        "d": [
          "glory",
          "power",
          "clouds",
          "measure",
          "season"
        ]
```

### D acts1 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "These all continued with one accord in prayer and",
        "a": "supplication",
        "suffix": ", with the women, and Mary the mother of Jesus, and with his brethren.",
        "d": [
          "praise",
          "fasting",
          "fellowship"
        ]
```

Replace with:

```js
"prefix": "These all continued with one accord in prayer and",
        "a": "supplication",
        "suffix": ", with the women, and Mary the mother of Jesus, and with his brethren.",
        "d": [
          "praise",
          "fasting",
          "fellowship",
          "thanksgiving",
          "watching"
        ]
```

### D acts1 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou, Lord, which knowest the",
        "a": "hearts",
        "suffix": "of all men, shew whether of these two thou hast chosen,",
        "d": [
          "souls",
          "minds",
          "ways"
        ]
```

Replace with:

```js
"prefix": "Thou, Lord, which knowest the",
        "a": "hearts",
        "suffix": "of all men, shew whether of these two thou hast chosen,",
        "d": [
          "souls",
          "minds",
          "ways",
          "thoughts",
          "bones"
        ]
```

### D acts7 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The God of glory appeared unto our father",
        "a": "Abraham",
        "suffix": ", when he was in Mesopotamia, before he dwelt in Charran,",
        "d": [
          "Isaac",
          "Jacob",
          "David"
        ]
```

Replace with:

```js
"prefix": "The God of glory appeared unto our father",
        "a": "Abraham",
        "suffix": ", when he was in Mesopotamia, before he dwelt in Charran,",
        "d": [
          "Isaac",
          "Jacob",
          "David",
          "Noah",
          "Moses"
        ]
```

### D acts7 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Howbeit the most High dwelleth not in temples made with",
        "a": "hands",
        "suffix": "; as saith the prophet,",
        "d": [
          "stone",
          "cedar",
          "man"
        ]
```

Replace with:

```js
"prefix": "Howbeit the most High dwelleth not in temples made with",
        "a": "hands",
        "suffix": "; as saith the prophet,",
        "d": [
          "stone",
          "cedar",
          "man",
          "wings",
          "clouds"
        ]
```

### D acts7 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Heaven is my throne, and earth is my",
        "a": "footstool",
        "suffix": ": what house will ye build me? saith the Lord:",
        "d": [
          "dwelling",
          "footstep",
          "habitation"
        ]
```

Replace with:

```js
"prefix": "Heaven is my throne, and earth is my",
        "a": "footstool",
        "suffix": ": what house will ye build me? saith the Lord:",
        "d": [
          "dwelling",
          "footstep",
          "habitation",
          "seat",
          "pavement"
        ]
```

### D acts7 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ye stiffnecked and uncircumcised in heart and ears, ye do always resist the Holy",
        "a": "Ghost",
        "suffix": ": as your fathers did, so do ye.",
        "d": [
          "Spirit",
          "Presence",
          "Word"
        ]
```

Replace with:

```js
"prefix": "Ye stiffnecked and uncircumcised in heart and ears, ye do always resist the Holy",
        "a": "Ghost",
        "suffix": ": as your fathers did, so do ye.",
        "d": [
          "Spirit",
          "Presence",
          "Word",
          "Father",
          "Angel"
        ]
```

### D acts7 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "looked up stedfastly into heaven, and saw the glory of God, and Jesus standing on the right",
        "a": "hand",
        "suffix": "of God,",
        "d": [
          "side",
          "throne",
          "part"
        ]
```

Replace with:

```js
"prefix": "looked up stedfastly into heaven, and saw the glory of God, and Jesus standing on the right",
        "a": "hand",
        "suffix": "of God,",
        "d": [
          "side",
          "throne",
          "part",
          "arm",
          "left"
        ]
```

### D acts7 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Behold, I see the heavens opened, and the Son of man standing on the right hand of",
        "a": "God",
        "suffix": ".",
        "d": [
          "power",
          "glory",
          "the Father"
        ]
```

Replace with:

```js
"prefix": "Behold, I see the heavens opened, and the Son of man standing on the right hand of",
        "a": "God",
        "suffix": ".",
        "d": [
          "power",
          "glory",
          "the Father",
          "Heaven",
          "Zion"
        ]
```

### D acts7 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they stoned Stephen, calling upon God, and saying, Lord Jesus, receive my",
        "a": "spirit",
        "suffix": ".",
        "d": [
          "soul",
          "life",
          "prayer"
        ]
```

Replace with:

```js
"prefix": "And they stoned Stephen, calling upon God, and saying, Lord Jesus, receive my",
        "a": "spirit",
        "suffix": ".",
        "d": [
          "soul",
          "life",
          "prayer",
          "heart",
          "breath"
        ]
```

### D acts7 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Lord, lay not this sin to their",
        "a": "charge",
        "suffix": ". And when he had said this, he fell asleep.",
        "d": [
          "account",
          "heart",
          "door"
        ]
```

Replace with:

```js
"prefix": "Lord, lay not this sin to their",
        "a": "charge",
        "suffix": ". And when he had said this, he fell asleep.",
        "d": [
          "account",
          "heart",
          "door",
          "fault",
          "wages"
        ]
```

### D acts26 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "At midday, O king, I saw in the way a light from heaven, above the brightness of the",
        "a": "sun",
        "suffix": ",",
        "d": [
          "stars",
          "day",
          "lightning"
        ]
```

Replace with:

```js
"prefix": "At midday, O king, I saw in the way a light from heaven, above the brightness of the",
        "a": "sun",
        "suffix": ",",
        "d": [
          "stars",
          "day",
          "lightning",
          "moon",
          "fire"
        ]
```

### D acts26 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Saul, Saul, why persecutest thou me? it is hard for thee to kick against the",
        "a": "pricks",
        "suffix": ".",
        "d": [
          "goads",
          "stones",
          "thorns"
        ]
```

Replace with:

```js
"prefix": "Saul, Saul, why persecutest thou me? it is hard for thee to kick against the",
        "a": "pricks",
        "suffix": ".",
        "d": [
          "goads",
          "stones",
          "thorns",
          "walls",
          "gates"
        ]
```

### D acts26 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And I said, Who art thou, Lord? And he said, I am",
        "a": "Jesus",
        "suffix": "whom thou persecutest.",
        "d": [
          "Christ",
          "Messiah",
          "God"
        ]
```

Replace with:

```js
"prefix": "And I said, Who art thou, Lord? And he said, I am",
        "a": "Jesus",
        "suffix": "whom thou persecutest.",
        "d": [
          "Christ",
          "Messiah",
          "God",
          "Stephen",
          "Peter"
        ]
```

### D acts26 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "To open their eyes, and to turn them from darkness to",
        "a": "light",
        "suffix": ", and from the power of Satan unto God,",
        "d": [
          "day",
          "life",
          "glory"
        ]
```

Replace with:

```js
"prefix": "To open their eyes, and to turn them from darkness to",
        "a": "light",
        "suffix": ", and from the power of Satan unto God,",
        "d": [
          "day",
          "life",
          "glory",
          "truth",
          "wisdom"
        ]
```

### D acts26 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Whereupon, O king Agrippa, I was not disobedient unto the heavenly",
        "a": "vision",
        "suffix": ":",
        "d": [
          "voice",
          "calling",
          "sign"
        ]
```

Replace with:

```js
"prefix": "Whereupon, O king Agrippa, I was not disobedient unto the heavenly",
        "a": "vision",
        "suffix": ":",
        "d": [
          "voice",
          "calling",
          "sign",
          "commandment",
          "revelation"
        ]
```

### D acts26 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Having therefore obtained help of God, I continue unto this",
        "a": "day",
        "suffix": ", witnessing both to small and great,",
        "d": [
          "hour",
          "time",
          "season"
        ]
```

Replace with:

```js
"prefix": "Having therefore obtained help of God, I continue unto this",
        "a": "day",
        "suffix": ", witnessing both to small and great,",
        "d": [
          "hour",
          "time",
          "season",
          "night",
          "morning"
        ]
```

### D acts26 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Then Agrippa said unto Paul, Almost thou persuadest me to be a",
        "a": "Christian",
        "suffix": ".",
        "d": [
          "believer",
          "disciple",
          "brother"
        ]
```

Replace with:

```js
"prefix": "Then Agrippa said unto Paul, Almost thou persuadest me to be a",
        "a": "Christian",
        "suffix": ".",
        "d": [
          "believer",
          "disciple",
          "brother",
          "Jew",
          "Pharisee"
        ]
```

### D acts26 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I would to God, that not only thou, but also all that hear me this day, were both almost, and altogether such as I am, except these",
        "a": "bonds",
        "suffix": ".",
        "d": [
          "chains",
          "fetters",
          "stripes"
        ]
```

Replace with:

```js
"prefix": "I would to God, that not only thou, but also all that hear me this day, were both almost, and altogether such as I am, except these",
        "a": "bonds",
        "suffix": ".",
        "d": [
          "chains",
          "fetters",
          "stripes",
          "cords",
          "silver"
        ]
```

### D romans5 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore being justified by faith, we have",
        "a": "peace",
        "suffix": "with God through our Lord Jesus Christ:",
        "d": [
          "grace",
          "fellowship",
          "favour"
        ]
```

Replace with:

```js
"prefix": "Therefore being justified by faith, we have",
        "a": "peace",
        "suffix": "with God through our Lord Jesus Christ:",
        "d": [
          "grace",
          "fellowship",
          "favour",
          "access",
          "joy"
        ]
```

### D romans5 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "By whom also we have access by faith into this",
        "a": "grace",
        "suffix": "wherein we stand, and rejoice in hope of the glory of God.",
        "d": [
          "peace",
          "light",
          "kingdom"
        ]
```

Replace with:

```js
"prefix": "By whom also we have access by faith into this",
        "a": "grace",
        "suffix": "wherein we stand, and rejoice in hope of the glory of God.",
        "d": [
          "peace",
          "light",
          "kingdom",
          "place",
          "world"
        ]
```

### D romans5 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "we glory in tribulations also: knowing that tribulation worketh",
        "a": "patience",
        "suffix": ";",
        "d": [
          "hope",
          "faith",
          "peace"
        ]
```

Replace with:

```js
"prefix": "we glory in tribulations also: knowing that tribulation worketh",
        "a": "patience",
        "suffix": ";",
        "d": [
          "hope",
          "faith",
          "peace",
          "joy",
          "wrath"
        ]
```

### D romans5 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And patience, experience; and experience,",
        "a": "hope",
        "suffix": ":",
        "d": [
          "faith",
          "joy",
          "peace"
        ]
```

Replace with:

```js
"prefix": "And patience, experience; and experience,",
        "a": "hope",
        "suffix": ":",
        "d": [
          "faith",
          "joy",
          "peace",
          "trial",
          "love"
        ]
```

### D romans5 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy",
        "a": "Ghost",
        "suffix": "which is given unto us.",
        "d": [
          "Spirit",
          "Presence",
          "Word"
        ]
```

Replace with:

```js
"prefix": "And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy",
        "a": "Ghost",
        "suffix": "which is given unto us.",
        "d": [
          "Spirit",
          "Presence",
          "Word",
          "Father",
          "Angel"
        ]
```

### D romans5 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But God commendeth his love toward us, in that, while we were yet sinners, Christ",
        "a": "died",
        "suffix": "for us.",
        "d": [
          "suffered",
          "came",
          "paid"
        ]
```

Replace with:

```js
"prefix": "But God commendeth his love toward us, in that, while we were yet sinners, Christ",
        "a": "died",
        "suffix": "for us.",
        "d": [
          "suffered",
          "came",
          "paid",
          "wept",
          "walked"
        ]
```

### D romans5 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For as by one man's disobedience many were made sinners, so by the obedience of one shall many be made",
        "a": "righteous",
        "suffix": ".",
        "d": [
          "holy",
          "just",
          "clean"
        ]
```

Replace with:

```js
"prefix": "For as by one man's disobedience many were made sinners, so by the obedience of one shall many be made",
        "a": "righteous",
        "suffix": ".",
        "d": [
          "holy",
          "just",
          "clean",
          "faithful",
          "perfect"
        ]
```

### D romans5 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "where sin abounded, grace did much more",
        "a": "abound",
        "suffix": ":",
        "d": [
          "multiply",
          "exceed",
          "reign"
        ]
```

Replace with:

```js
"prefix": "where sin abounded, grace did much more",
        "a": "abound",
        "suffix": ":",
        "d": [
          "multiply",
          "exceed",
          "reign",
          "rise",
          "remain"
        ]
```

### D romans6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "What shall we say then? Shall we continue in sin, that grace may",
        "a": "abound",
        "suffix": "?",
        "d": [
          "multiply",
          "increase",
          "reign"
        ]
```

Replace with:

```js
"prefix": "What shall we say then? Shall we continue in sin, that grace may",
        "a": "abound",
        "suffix": "?",
        "d": [
          "multiply",
          "increase",
          "reign",
          "abide",
          "remain"
        ]
```

### D romans6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "God forbid. How shall we, that are dead to sin, live any longer",
        "a": "therein",
        "suffix": "?",
        "d": [
          "in it",
          "in sin",
          "thus"
        ]
```

Replace with:

```js
"prefix": "God forbid. How shall we, that are dead to sin, live any longer",
        "a": "therein",
        "suffix": "?",
        "d": [
          "in it",
          "in sin",
          "thus",
          "therefore",
          "thereby"
        ]
```

### D romans6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore we are buried with him by baptism into",
        "a": "death",
        "suffix": ": that like as Christ was raised up from the dead by the glory of the Father,",
        "d": [
          "the grave",
          "life",
          "sin"
        ]
```

Replace with:

```js
"prefix": "Therefore we are buried with him by baptism into",
        "a": "death",
        "suffix": ": that like as Christ was raised up from the dead by the glory of the Father,",
        "d": [
          "the grave",
          "life",
          "sin",
          "sepulchre",
          "darkness"
        ]
```

### D romans6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "even so we also should walk in newness of",
        "a": "life",
        "suffix": ".",
        "d": [
          "spirit",
          "grace",
          "truth"
        ]
```

Replace with:

```js
"prefix": "even so we also should walk in newness of",
        "a": "life",
        "suffix": ".",
        "d": [
          "spirit",
          "grace",
          "truth",
          "faith",
          "hope"
        ]
```

### D romans6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Likewise reckon ye also yourselves to be dead indeed unto sin, but alive unto God through Jesus",
        "a": "Christ",
        "suffix": "our Lord.",
        "d": [
          "the Lord",
          "our Saviour",
          "the Son"
        ]
```

Replace with:

```js
"prefix": "Likewise reckon ye also yourselves to be dead indeed unto sin, but alive unto God through Jesus",
        "a": "Christ",
        "suffix": "our Lord.",
        "d": [
          "the Lord",
          "our Saviour",
          "the Son",
          "Master",
          "Prophet"
        ]
```

### D romans6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For sin shall not have dominion over you: for ye are not under the law, but under",
        "a": "grace",
        "suffix": ".",
        "d": [
          "faith",
          "mercy",
          "truth"
        ]
```

Replace with:

```js
"prefix": "For sin shall not have dominion over you: for ye are not under the law, but under",
        "a": "grace",
        "suffix": ".",
        "d": [
          "faith",
          "mercy",
          "truth",
          "works",
          "wrath"
        ]
```

### D romans6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "ye have your fruit unto holiness, and the end everlasting",
        "a": "life",
        "suffix": ".",
        "d": [
          "peace",
          "joy",
          "glory"
        ]
```

Replace with:

```js
"prefix": "ye have your fruit unto holiness, and the end everlasting",
        "a": "life",
        "suffix": ".",
        "d": [
          "peace",
          "joy",
          "glory",
          "salvation",
          "reward"
        ]
```

### D romans6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For the wages of sin is death; but the gift of God is eternal",
        "a": "life",
        "suffix": "through Jesus Christ our Lord.",
        "d": [
          "grace",
          "salvation",
          "peace"
        ]
```

Replace with:

```js
"prefix": "For the wages of sin is death; but the gift of God is eternal",
        "a": "life",
        "suffix": "through Jesus Christ our Lord.",
        "d": [
          "grace",
          "salvation",
          "peace",
          "joy",
          "reward"
        ]
```

### D 1corinthians15 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "how that Christ died for our sins according to the",
        "a": "scriptures",
        "suffix": ";",
        "d": [
          "law",
          "prophets",
          "word"
        ]
```

Replace with:

```js
"prefix": "how that Christ died for our sins according to the",
        "a": "scriptures",
        "suffix": ";",
        "d": [
          "law",
          "prophets",
          "word",
          "promises",
          "precepts"
        ]
```

### D 1corinthians15 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And that he was buried, and that he rose again the third day according to the",
        "a": "scriptures",
        "suffix": ":",
        "d": [
          "law",
          "gospel",
          "word"
        ]
```

Replace with:

```js
"prefix": "And that he was buried, and that he rose again the third day according to the",
        "a": "scriptures",
        "suffix": ":",
        "d": [
          "law",
          "gospel",
          "word",
          "promises",
          "dreams"
        ]
```

### D 1corinthians15 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But now is Christ risen from the dead, and become the",
        "a": "firstfruits",
        "suffix": "of them that slept.",
        "d": [
          "firstborn",
          "head",
          "prince"
        ]
```

Replace with:

```js
"prefix": "But now is Christ risen from the dead, and become the",
        "a": "firstfruits",
        "suffix": "of them that slept.",
        "d": [
          "firstborn",
          "head",
          "prince",
          "witnesses",
          "gift"
        ]
```

### D 1corinthians15 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For as in Adam all die, even so in Christ shall all be made",
        "a": "alive",
        "suffix": ".",
        "d": [
          "righteous",
          "holy",
          "one"
        ]
```

Replace with:

```js
"prefix": "For as in Adam all die, even so in Christ shall all be made",
        "a": "alive",
        "suffix": ".",
        "d": [
          "righteous",
          "holy",
          "one",
          "whole",
          "perfect"
        ]
```

### D 1corinthians15 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The last enemy that shall be destroyed is",
        "a": "death",
        "suffix": ".",
        "d": [
          "sin",
          "the grave",
          "satan"
        ]
```

Replace with:

```js
"prefix": "The last enemy that shall be destroyed is",
        "a": "death",
        "suffix": ".",
        "d": [
          "sin",
          "the grave",
          "satan",
          "hell",
          "sorrow"
        ]
```

### D 1corinthians15 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Behold, I shew you a mystery; We shall not all sleep, but we shall all be",
        "a": "changed",
        "suffix": ",",
        "d": [
          "raised",
          "gathered",
          "clothed"
        ]
```

Replace with:

```js
"prefix": "Behold, I shew you a mystery; We shall not all sleep, but we shall all be",
        "a": "changed",
        "suffix": ",",
        "d": [
          "raised",
          "gathered",
          "clothed",
          "lifted",
          "caught"
        ]
```

### D 1corinthians15 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Death is swallowed up in",
        "a": "victory",
        "suffix": ".",
        "d": [
          "life",
          "glory",
          "light"
        ]
```

Replace with:

```js
"prefix": "Death is swallowed up in",
        "a": "victory",
        "suffix": ".",
        "d": [
          "life",
          "glory",
          "light",
          "salvation",
          "darkness"
        ]
```

### D 1corinthians15 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O death, where is thy sting? O grave, where is thy",
        "a": "victory",
        "suffix": "?",
        "d": [
          "power",
          "might",
          "triumph"
        ]
```

Replace with:

```js
"prefix": "O death, where is thy sting? O grave, where is thy",
        "a": "victory",
        "suffix": "?",
        "d": [
          "power",
          "might",
          "triumph",
          "strength",
          "glory"
        ]
```

### D 2corinthians5 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "we have a building of God, an house not made with hands, eternal in the",
        "a": "heavens",
        "suffix": ".",
        "d": [
          "glory",
          "skies",
          "heights"
        ]
```

Replace with:

```js
"prefix": "we have a building of God, an house not made with hands, eternal in the",
        "a": "heavens",
        "suffix": ".",
        "d": [
          "glory",
          "skies",
          "heights",
          "mansions",
          "clouds"
        ]
```

### D 2corinthians5 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For we walk by faith, not by",
        "a": "sight",
        "suffix": ":",
        "d": [
          "works",
          "flesh",
          "fear"
        ]
```

Replace with:

```js
"prefix": "For we walk by faith, not by",
        "a": "sight",
        "suffix": ":",
        "d": [
          "works",
          "flesh",
          "fear",
          "reason",
          "sense"
        ]
```

### D 2corinthians5 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For we must all appear before the judgment",
        "a": "seat",
        "suffix": "of Christ;",
        "d": [
          "throne",
          "hall",
          "place"
        ]
```

Replace with:

```js
"prefix": "For we must all appear before the judgment",
        "a": "seat",
        "suffix": "of Christ;",
        "d": [
          "throne",
          "hall",
          "place",
          "court",
          "gate"
        ]
```

### D 2corinthians5 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For the love of Christ constraineth",
        "a": "us",
        "suffix": "; because we thus judge, that if one died for all, then were all dead:",
        "d": [
          "me",
          "them",
          "all"
        ]
```

Replace with:

```js
"prefix": "For the love of Christ constraineth",
        "a": "us",
        "suffix": "; because we thus judge, that if one died for all, then were all dead:",
        "d": [
          "me",
          "them",
          "all",
          "you",
          "him"
        ]
```

### D 2corinthians5 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Therefore if any man be in Christ, he is a new",
        "a": "creature",
        "suffix": ": old things are passed away; behold, all things are become new.",
        "d": [
          "creation",
          "man",
          "vessel"
        ]
```

Replace with:

```js
"prefix": "Therefore if any man be in Christ, he is a new",
        "a": "creature",
        "suffix": ": old things are passed away; behold, all things are become new.",
        "d": [
          "creation",
          "man",
          "vessel",
          "spirit",
          "soul"
        ]
```

### D 2corinthians5 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And all things are of God, who hath reconciled us to himself by Jesus Christ, and hath given to us the ministry of",
        "a": "reconciliation",
        "suffix": ";",
        "d": [
          "peace",
          "grace",
          "righteousness"
        ]
```

Replace with:

```js
"prefix": "And all things are of God, who hath reconciled us to himself by Jesus Christ, and hath given to us the ministry of",
        "a": "reconciliation",
        "suffix": ";",
        "d": [
          "peace",
          "grace",
          "righteousness",
          "salvation",
          "forgiveness"
        ]
```

### D 2corinthians5 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Now then we are ambassadors for",
        "a": "Christ",
        "suffix": ", as though God did beseech you by us: we pray you in Christ's stead, be ye reconciled to God.",
        "d": [
          "God",
          "heaven",
          "the truth"
        ]
```

Replace with:

```js
"prefix": "Now then we are ambassadors for",
        "a": "Christ",
        "suffix": ", as though God did beseech you by us: we pray you in Christ's stead, be ye reconciled to God.",
        "d": [
          "God",
          "heaven",
          "the truth",
          "men",
          "sinners"
        ]
```

### D 2corinthians5 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "that we might be made the",
        "a": "righteousness",
        "suffix": "of God in him.",
        "d": [
          "holiness",
          "glory",
          "children"
        ]
```

Replace with:

```js
"prefix": "that we might be made the",
        "a": "righteousness",
        "suffix": "of God in him.",
        "d": [
          "holiness",
          "glory",
          "children",
          "power",
          "wisdom"
        ]
```

### D galatians5 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Stand fast therefore in the",
        "a": "liberty",
        "suffix": "wherewith Christ hath made us free, and be not entangled again with the yoke of bondage.",
        "d": [
          "grace",
          "peace",
          "truth"
        ]
```

Replace with:

```js
"prefix": "Stand fast therefore in the",
        "a": "liberty",
        "suffix": "wherewith Christ hath made us free, and be not entangled again with the yoke of bondage.",
        "d": [
          "grace",
          "peace",
          "truth",
          "joy",
          "spirit"
        ]
```

### D galatians5 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "faith which worketh by",
        "a": "love",
        "suffix": ".",
        "d": [
          "grace",
          "hope",
          "works"
        ]
```

Replace with:

```js
"prefix": "faith which worketh by",
        "a": "love",
        "suffix": ".",
        "d": [
          "grace",
          "hope",
          "works",
          "peace",
          "truth"
        ]
```

### D galatians5 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For all the law is fulfilled in one word, even in this; Thou shalt love thy neighbour as",
        "a": "thyself",
        "suffix": ".",
        "d": [
          "a brother",
          "thy life",
          "the Lord"
        ]
```

Replace with:

```js
"prefix": "For all the law is fulfilled in one word, even in this; Thou shalt love thy neighbour as",
        "a": "thyself",
        "suffix": ".",
        "d": [
          "a brother",
          "thy life",
          "the Lord",
          "himself",
          "ourselves"
        ]
```

### D galatians5 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Walk in the Spirit, and ye shall not fulfil the lust of the",
        "a": "flesh",
        "suffix": ".",
        "d": [
          "world",
          "eyes",
          "mind"
        ]
```

Replace with:

```js
"prefix": "Walk in the Spirit, and ye shall not fulfil the lust of the",
        "a": "flesh",
        "suffix": ".",
        "d": [
          "world",
          "eyes",
          "mind",
          "heart",
          "pride"
        ]
```

### D galatians5 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But the fruit of the Spirit is love, joy,",
        "a": "peace",
        "suffix": ", longsuffering, gentleness, goodness, faith,",
        "d": [
          "mercy",
          "truth",
          "grace"
        ]
```

Replace with:

```js
"prefix": "But the fruit of the Spirit is love, joy,",
        "a": "peace",
        "suffix": ", longsuffering, gentleness, goodness, faith,",
        "d": [
          "mercy",
          "truth",
          "grace",
          "hope",
          "kindness"
        ]
```

### D galatians5 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Meekness, temperance: against such there is no",
        "a": "law",
        "suffix": ".",
        "d": [
          "sin",
          "wrath",
          "condemnation"
        ]
```

Replace with:

```js
"prefix": "Meekness, temperance: against such there is no",
        "a": "law",
        "suffix": ".",
        "d": [
          "sin",
          "wrath",
          "condemnation",
          "need",
          "fear"
        ]
```

### D galatians5 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they that are Christ's have crucified the",
        "a": "flesh",
        "suffix": "with the affections and lusts.",
        "d": [
          "body",
          "world",
          "old man"
        ]
```

Replace with:

```js
"prefix": "And they that are Christ's have crucified the",
        "a": "flesh",
        "suffix": "with the affections and lusts.",
        "d": [
          "body",
          "world",
          "old man",
          "sin",
          "heart"
        ]
```

### D galatians5 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If we live in the Spirit, let us also walk in the",
        "a": "Spirit",
        "suffix": ".",
        "d": [
          "light",
          "truth",
          "Lord"
        ]
```

Replace with:

```js
"prefix": "If we live in the Spirit, let us also walk in the",
        "a": "Spirit",
        "suffix": ".",
        "d": [
          "light",
          "truth",
          "Lord",
          "Word",
          "Son"
        ]
```

### D ephesians6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Finally, my brethren, be strong in the Lord, and in the power of his",
        "a": "might",
        "suffix": ".",
        "d": [
          "strength",
          "arm",
          "grace"
        ]
```

Replace with:

```js
"prefix": "Finally, my brethren, be strong in the Lord, and in the power of his",
        "a": "might",
        "suffix": ".",
        "d": [
          "strength",
          "arm",
          "grace",
          "glory",
          "wisdom"
        ]
```

### D ephesians6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Put on the whole",
        "a": "armour",
        "suffix": "of God, that ye may be able to stand against the wiles of the devil.",
        "d": [
          "shield",
          "garment",
          "breastplate"
        ]
```

Replace with:

```js
"prefix": "Put on the whole",
        "a": "armour",
        "suffix": "of God, that ye may be able to stand against the wiles of the devil.",
        "d": [
          "shield",
          "garment",
          "breastplate",
          "helmet",
          "sword"
        ]
```

### D ephesians6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For we wrestle not against flesh and",
        "a": "blood",
        "suffix": ", but against principalities, against powers,",
        "d": [
          "bone",
          "earth",
          "men"
        ]
```

Replace with:

```js
"prefix": "For we wrestle not against flesh and",
        "a": "blood",
        "suffix": ", but against principalities, against powers,",
        "d": [
          "bone",
          "earth",
          "men",
          "spirit",
          "soul"
        ]
```

### D ephesians6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Stand therefore, having your loins girt about with",
        "a": "truth",
        "suffix": ", and having on the breastplate of righteousness;",
        "d": [
          "faith",
          "peace",
          "grace"
        ]
```

Replace with:

```js
"prefix": "Stand therefore, having your loins girt about with",
        "a": "truth",
        "suffix": ", and having on the breastplate of righteousness;",
        "d": [
          "faith",
          "peace",
          "grace",
          "wisdom",
          "power"
        ]
```

### D ephesians6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Above all, taking the shield of",
        "a": "faith",
        "suffix": ", wherewith ye shall be able to quench all the fiery darts of the wicked.",
        "d": [
          "truth",
          "salvation",
          "peace"
        ]
```

Replace with:

```js
"prefix": "Above all, taking the shield of",
        "a": "faith",
        "suffix": ", wherewith ye shall be able to quench all the fiery darts of the wicked.",
        "d": [
          "truth",
          "salvation",
          "peace",
          "hope",
          "love"
        ]
```

### D ephesians6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And take the helmet of",
        "a": "salvation",
        "suffix": ", and the sword of the Spirit, which is the word of God:",
        "d": [
          "faith",
          "hope",
          "peace"
        ]
```

Replace with:

```js
"prefix": "And take the helmet of",
        "a": "salvation",
        "suffix": ", and the sword of the Spirit, which is the word of God:",
        "d": [
          "faith",
          "hope",
          "peace",
          "righteousness",
          "glory"
        ]
```

### D ephesians6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and the sword of the Spirit, which is the",
        "a": "word",
        "suffix": "of God:",
        "d": [
          "truth",
          "gospel",
          "law"
        ]
```

Replace with:

```js
"prefix": "and the sword of the Spirit, which is the",
        "a": "word",
        "suffix": "of God:",
        "d": [
          "truth",
          "gospel",
          "law",
          "voice",
          "promise"
        ]
```

### D ephesians6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Praying always with all prayer and supplication in the",
        "a": "Spirit",
        "suffix": ", and watching thereunto with all perseverance",
        "d": [
          "heart",
          "church",
          "truth"
        ]
```

Replace with:

```js
"prefix": "Praying always with all prayer and supplication in the",
        "a": "Spirit",
        "suffix": ", and watching thereunto with all perseverance",
        "d": [
          "heart",
          "church",
          "truth",
          "Word",
          "Temple"
        ]
```

### D colossians1 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who hath delivered us from the power of darkness, and hath translated us into the kingdom of his dear",
        "a": "Son",
        "suffix": ":",
        "d": [
          "Lord",
          "Christ",
          "Prince"
        ]
```

Replace with:

```js
"prefix": "Who hath delivered us from the power of darkness, and hath translated us into the kingdom of his dear",
        "a": "Son",
        "suffix": ":",
        "d": [
          "Lord",
          "Christ",
          "Prince",
          "Father",
          "Lamb"
        ]
```

### D colossians1 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "In whom we have redemption through his blood, even the forgiveness of",
        "a": "sins",
        "suffix": ":",
        "d": [
          "iniquities",
          "debts",
          "trespasses"
        ]
```

Replace with:

```js
"prefix": "In whom we have redemption through his blood, even the forgiveness of",
        "a": "sins",
        "suffix": ":",
        "d": [
          "iniquities",
          "debts",
          "trespasses",
          "faults",
          "errors"
        ]
```

### D colossians1 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who is the image of the invisible God, the firstborn of every",
        "a": "creature",
        "suffix": ":",
        "d": [
          "creation",
          "thing",
          "generation"
        ]
```

Replace with:

```js
"prefix": "Who is the image of the invisible God, the firstborn of every",
        "a": "creature",
        "suffix": ":",
        "d": [
          "creation",
          "thing",
          "generation",
          "man",
          "nation"
        ]
```

### D colossians1 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For by him were all things created, that are in",
        "a": "heaven",
        "suffix": ", and that are in earth,",
        "d": [
          "the clouds",
          "glory",
          "the skies"
        ]
```

Replace with:

```js
"prefix": "For by him were all things created, that are in",
        "a": "heaven",
        "suffix": ", and that are in earth,",
        "d": [
          "the clouds",
          "glory",
          "the skies",
          "hell",
          "dust"
        ]
```

### D colossians1 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he is before all things, and by him all things",
        "a": "consist",
        "suffix": ".",
        "d": [
          "stand",
          "abide",
          "live"
        ]
```

Replace with:

```js
"prefix": "And he is before all things, and by him all things",
        "a": "consist",
        "suffix": ".",
        "d": [
          "stand",
          "abide",
          "live",
          "endure",
          "remain"
        ]
```

### D colossians1 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he is the head of the body, the",
        "a": "church",
        "suffix": ": who is the beginning, the firstborn from the dead;",
        "d": [
          "assembly",
          "saints",
          "temple"
        ]
```

Replace with:

```js
"prefix": "And he is the head of the body, the",
        "a": "church",
        "suffix": ": who is the beginning, the firstborn from the dead;",
        "d": [
          "assembly",
          "saints",
          "temple",
          "people",
          "family"
        ]
```

### D colossians1 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "that in all things he might have the",
        "a": "preeminence",
        "suffix": ".",
        "d": [
          "glory",
          "power",
          "dominion"
        ]
```

Replace with:

```js
"prefix": "that in all things he might have the",
        "a": "preeminence",
        "suffix": ".",
        "d": [
          "glory",
          "power",
          "dominion",
          "honour",
          "praise"
        ]
```

### D colossians1 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "which is Christ in you, the hope of",
        "a": "glory",
        "suffix": ":",
        "d": [
          "salvation",
          "peace",
          "life"
        ]
```

Replace with:

```js
"prefix": "which is Christ in you, the hope of",
        "a": "glory",
        "suffix": ":",
        "d": [
          "salvation",
          "peace",
          "life",
          "righteousness",
          "heaven"
        ]
```

### D colossians3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If ye then be risen with Christ, seek those things which are",
        "a": "above",
        "suffix": ", where Christ sitteth on the right hand of God.",
        "d": [
          "heavenly",
          "eternal",
          "pure"
        ]
```

Replace with:

```js
"prefix": "If ye then be risen with Christ, seek those things which are",
        "a": "above",
        "suffix": ", where Christ sitteth on the right hand of God.",
        "d": [
          "heavenly",
          "eternal",
          "pure",
          "beneath",
          "below"
        ]
```

### D colossians3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Set your affection on things above, not on things on the",
        "a": "earth",
        "suffix": ".",
        "d": [
          "flesh",
          "world",
          "ground"
        ]
```

Replace with:

```js
"prefix": "Set your affection on things above, not on things on the",
        "a": "earth",
        "suffix": ".",
        "d": [
          "flesh",
          "world",
          "ground",
          "dust",
          "sea"
        ]
```

### D colossians3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For ye are dead, and your life is hid with Christ in",
        "a": "God",
        "suffix": ".",
        "d": [
          "heaven",
          "glory",
          "light"
        ]
```

Replace with:

```js
"prefix": "For ye are dead, and your life is hid with Christ in",
        "a": "God",
        "suffix": ".",
        "d": [
          "heaven",
          "glory",
          "light",
          "Spirit",
          "Zion"
        ]
```

### D colossians3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of",
        "a": "mind",
        "suffix": ", meekness, longsuffering;",
        "d": [
          "heart",
          "spirit",
          "soul"
        ]
```

Replace with:

```js
"prefix": "Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of",
        "a": "mind",
        "suffix": ", meekness, longsuffering;",
        "d": [
          "heart",
          "spirit",
          "soul",
          "wisdom",
          "hope"
        ]
```

### D colossians3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And above all these things put on charity, which is the bond of",
        "a": "perfectness",
        "suffix": ".",
        "d": [
          "peace",
          "unity",
          "love"
        ]
```

Replace with:

```js
"prefix": "And above all these things put on charity, which is the bond of",
        "a": "perfectness",
        "suffix": ".",
        "d": [
          "peace",
          "unity",
          "love",
          "faith",
          "grace"
        ]
```

### D colossians3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And let the peace of God rule in your",
        "a": "hearts",
        "suffix": ", to the which also ye are called in one body; and be ye thankful.",
        "d": [
          "minds",
          "souls",
          "house"
        ]
```

Replace with:

```js
"prefix": "And let the peace of God rule in your",
        "a": "hearts",
        "suffix": ", to the which also ye are called in one body; and be ye thankful.",
        "d": [
          "minds",
          "souls",
          "house",
          "lives",
          "thoughts"
        ]
```

### D colossians3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Let the word of Christ dwell in you richly in all",
        "a": "wisdom",
        "suffix": "; teaching and admonishing one another",
        "d": [
          "knowledge",
          "truth",
          "grace"
        ]
```

Replace with:

```js
"prefix": "Let the word of Christ dwell in you richly in all",
        "a": "wisdom",
        "suffix": "; teaching and admonishing one another",
        "d": [
          "knowledge",
          "truth",
          "grace",
          "joy",
          "love"
        ]
```

### D colossians3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And whatsoever ye do in word or deed, do all in the",
        "a": "name",
        "suffix": "of the Lord Jesus, giving thanks to God and the Father by him.",
        "d": [
          "power",
          "glory",
          "faith"
        ]
```

Replace with:

```js
"prefix": "And whatsoever ye do in word or deed, do all in the",
        "a": "name",
        "suffix": "of the Lord Jesus, giving thanks to God and the Father by him.",
        "d": [
          "power",
          "glory",
          "faith",
          "Spirit",
          "presence"
        ]
```

### D 1thessalonians4 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For this is the will of God, even your",
        "a": "sanctification",
        "suffix": ", that ye should abstain from fornication:",
        "d": [
          "holiness",
          "peace",
          "salvation"
        ]
```

Replace with:

```js
"prefix": "For this is the will of God, even your",
        "a": "sanctification",
        "suffix": ", that ye should abstain from fornication:",
        "d": [
          "holiness",
          "peace",
          "salvation",
          "redemption",
          "election"
        ]
```

### D 1thessalonians4 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And that ye study to be",
        "a": "quiet",
        "suffix": ", and to do your own business, and to work with your own hands,",
        "d": [
          "peaceable",
          "still",
          "gentle"
        ]
```

Replace with:

```js
"prefix": "And that ye study to be",
        "a": "quiet",
        "suffix": ", and to do your own business, and to work with your own hands,",
        "d": [
          "peaceable",
          "still",
          "gentle",
          "content",
          "wise"
        ]
```

### D 1thessalonians4 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I would not have you to be ignorant, brethren, concerning them which are",
        "a": "asleep",
        "suffix": ", that ye sorrow not, even as others which have no hope.",
        "d": [
          "dead",
          "fallen",
          "departed"
        ]
```

Replace with:

```js
"prefix": "I would not have you to be ignorant, brethren, concerning them which are",
        "a": "asleep",
        "suffix": ", that ye sorrow not, even as others which have no hope.",
        "d": [
          "dead",
          "fallen",
          "departed",
          "alive",
          "living"
        ]
```

### D 1thessalonians4 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For if we believe that Jesus died and rose again, even so them also which sleep in Jesus will God bring with",
        "a": "him",
        "suffix": ".",
        "d": [
          "glory",
          "power",
          "angels"
        ]
```

Replace with:

```js
"prefix": "For if we believe that Jesus died and rose again, even so them also which sleep in Jesus will God bring with",
        "a": "him",
        "suffix": ".",
        "d": [
          "glory",
          "power",
          "angels",
          "us",
          "you"
        ]
```

### D 1thessalonians4 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For the Lord himself shall descend from heaven with a",
        "a": "shout",
        "suffix": ", with the voice of the archangel, and with the trump of God:",
        "d": [
          "cloud",
          "cry",
          "song"
        ]
```

Replace with:

```js
"prefix": "For the Lord himself shall descend from heaven with a",
        "a": "shout",
        "suffix": ", with the voice of the archangel, and with the trump of God:",
        "d": [
          "cloud",
          "cry",
          "song",
          "blast",
          "noise"
        ]
```

### D 1thessalonians4 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and the dead in Christ shall rise",
        "a": "first",
        "suffix": ":",
        "d": [
          "together",
          "soon",
          "now"
        ]
```

Replace with:

```js
"prefix": "and the dead in Christ shall rise",
        "a": "first",
        "suffix": ":",
        "d": [
          "together",
          "soon",
          "now",
          "again",
          "up"
        ]
```

### D 1thessalonians4 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "caught up together with them in the clouds, to meet the Lord in the",
        "a": "air",
        "suffix": ": and so shall we ever be with the Lord.",
        "d": [
          "sky",
          "heavens",
          "glory"
        ]
```

Replace with:

```js
"prefix": "caught up together with them in the clouds, to meet the Lord in the",
        "a": "air",
        "suffix": ": and so shall we ever be with the Lord.",
        "d": [
          "sky",
          "heavens",
          "glory",
          "midst",
          "wind"
        ]
```

### D 1thessalonians4 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Wherefore comfort one another with these",
        "a": "words",
        "suffix": ".",
        "d": [
          "promises",
          "hopes",
          "truths"
        ]
```

Replace with:

```js
"prefix": "Wherefore comfort one another with these",
        "a": "words",
        "suffix": ".",
        "d": [
          "promises",
          "hopes",
          "truths",
          "things",
          "tidings"
        ]
```

### D 1timothy6 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But godliness with contentment is great",
        "a": "gain",
        "suffix": ".",
        "d": [
          "riches",
          "peace",
          "reward"
        ]
```

Replace with:

```js
"prefix": "But godliness with contentment is great",
        "a": "gain",
        "suffix": ".",
        "d": [
          "riches",
          "peace",
          "reward",
          "wealth",
          "store"
        ]
```

### D 1timothy6 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For we brought nothing into this world, and it is certain we can carry nothing",
        "a": "out",
        "suffix": ".",
        "d": [
          "away",
          "forth",
          "hence"
        ]
```

Replace with:

```js
"prefix": "For we brought nothing into this world, and it is certain we can carry nothing",
        "a": "out",
        "suffix": ".",
        "d": [
          "away",
          "forth",
          "hence",
          "back",
          "in"
        ]
```

### D 1timothy6 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For the love of money is the root of all",
        "a": "evil",
        "suffix": ": which while some coveted after, they have erred from the faith,",
        "d": [
          "sin",
          "trouble",
          "wickedness"
        ]
```

Replace with:

```js
"prefix": "For the love of money is the root of all",
        "a": "evil",
        "suffix": ": which while some coveted after, they have erred from the faith,",
        "d": [
          "sin",
          "trouble",
          "wickedness",
          "vanity",
          "pride"
        ]
```

### D 1timothy6 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But thou, O man of God, flee these things; and follow after righteousness, godliness, faith, love,",
        "a": "patience",
        "suffix": ", meekness.",
        "d": [
          "truth",
          "hope",
          "peace"
        ]
```

Replace with:

```js
"prefix": "But thou, O man of God, flee these things; and follow after righteousness, godliness, faith, love,",
        "a": "patience",
        "suffix": ", meekness.",
        "d": [
          "truth",
          "hope",
          "peace",
          "humility",
          "joy"
        ]
```

### D 1timothy6 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Fight the good fight of",
        "a": "faith",
        "suffix": ", lay hold on eternal life, whereunto thou art also called,",
        "d": [
          "peace",
          "truth",
          "righteousness"
        ]
```

Replace with:

```js
"prefix": "Fight the good fight of",
        "a": "faith",
        "suffix": ", lay hold on eternal life, whereunto thou art also called,",
        "d": [
          "peace",
          "truth",
          "righteousness",
          "hope",
          "grace"
        ]
```

### D 1timothy6 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "who is the blessed and only Potentate, the King of kings, and Lord of",
        "a": "lords",
        "suffix": ";",
        "d": [
          "glory",
          "hosts",
          "heaven"
        ]
```

Replace with:

```js
"prefix": "who is the blessed and only Potentate, the King of kings, and Lord of",
        "a": "lords",
        "suffix": ";",
        "d": [
          "glory",
          "hosts",
          "heaven",
          "nations",
          "princes"
        ]
```

### D 1timothy6 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who only hath immortality, dwelling in the light which no man can approach unto; whom no man hath seen, nor can",
        "a": "see",
        "suffix": ":",
        "d": [
          "behold",
          "know",
          "reach"
        ]
```

Replace with:

```js
"prefix": "Who only hath immortality, dwelling in the light which no man can approach unto; whom no man hath seen, nor can",
        "a": "see",
        "suffix": ":",
        "d": [
          "behold",
          "know",
          "reach",
          "hear",
          "touch"
        ]
```

### D 1timothy6 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "O Timothy, keep that which is committed to thy",
        "a": "trust",
        "suffix": ", avoiding profane and vain babblings,",
        "d": [
          "care",
          "hand",
          "charge"
        ]
```

Replace with:

```js
"prefix": "O Timothy, keep that which is committed to thy",
        "a": "trust",
        "suffix": ", avoiding profane and vain babblings,",
        "d": [
          "care",
          "hand",
          "charge",
          "faith",
          "word"
        ]
```

### D 2timothy3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "This know also, that in the last days perilous times shall",
        "a": "come",
        "suffix": ".",
        "d": [
          "appear",
          "arise",
          "begin"
        ]
```

Replace with:

```js
"prefix": "This know also, that in the last days perilous times shall",
        "a": "come",
        "suffix": ".",
        "d": [
          "appear",
          "arise",
          "begin",
          "fall",
          "perish"
        ]
```

### D 2timothy3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Having a form of godliness, but denying the",
        "a": "power",
        "suffix": "thereof: from such turn away.",
        "d": [
          "grace",
          "truth",
          "spirit"
        ]
```

Replace with:

```js
"prefix": "Having a form of godliness, but denying the",
        "a": "power",
        "suffix": "thereof: from such turn away.",
        "d": [
          "grace",
          "truth",
          "spirit",
          "faith",
          "word"
        ]
```

### D 2timothy3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Yea, and all that will live godly in Christ Jesus shall suffer",
        "a": "persecution",
        "suffix": ".",
        "d": [
          "tribulation",
          "affliction",
          "loss"
        ]
```

Replace with:

```js
"prefix": "Yea, and all that will live godly in Christ Jesus shall suffer",
        "a": "persecution",
        "suffix": ".",
        "d": [
          "tribulation",
          "affliction",
          "loss",
          "shame",
          "death"
        ]
```

### D 2timothy3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But continue thou in the things which thou hast learned and hast been",
        "a": "assured",
        "suffix": "of, knowing of whom thou hast learned them;",
        "d": [
          "taught",
          "persuaded",
          "instructed"
        ]
```

Replace with:

```js
"prefix": "But continue thou in the things which thou hast learned and hast been",
        "a": "assured",
        "suffix": "of, knowing of whom thou hast learned them;",
        "d": [
          "taught",
          "persuaded",
          "instructed",
          "warned",
          "moved"
        ]
```

### D 2timothy3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "from a child thou hast known the holy scriptures, which are able to make thee wise unto",
        "a": "salvation",
        "suffix": "through faith which is in Christ Jesus.",
        "d": [
          "life",
          "truth",
          "godliness"
        ]
```

Replace with:

```js
"prefix": "from a child thou hast known the holy scriptures, which are able to make thee wise unto",
        "a": "salvation",
        "suffix": "through faith which is in Christ Jesus.",
        "d": [
          "life",
          "truth",
          "godliness",
          "righteousness",
          "glory"
        ]
```

### D 2timothy3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "All scripture is given by inspiration of",
        "a": "God",
        "suffix": ", and is profitable for doctrine, for reproof, for correction,",
        "d": [
          "the Spirit",
          "heaven",
          "the Lord"
        ]
```

Replace with:

```js
"prefix": "All scripture is given by inspiration of",
        "a": "God",
        "suffix": ", and is profitable for doctrine, for reproof, for correction,",
        "d": [
          "the Spirit",
          "heaven",
          "the Lord",
          "man",
          "Moses"
        ]
```

### D 2timothy3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "for instruction in",
        "a": "righteousness",
        "suffix": ":",
        "d": [
          "holiness",
          "truth",
          "godliness"
        ]
```

Replace with:

```js
"prefix": "for instruction in",
        "a": "righteousness",
        "suffix": ":",
        "d": [
          "holiness",
          "truth",
          "godliness",
          "wisdom",
          "faith"
        ]
```

### D 2timothy3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "That the man of God may be perfect, throughly furnished unto all",
        "a": "good",
        "suffix": "works.",
        "d": [
          "holy",
          "clean",
          "righteous"
        ]
```

Replace with:

```js
"prefix": "That the man of God may be perfect, throughly furnished unto all",
        "a": "good",
        "suffix": "works.",
        "d": [
          "holy",
          "clean",
          "righteous",
          "great",
          "fair"
        ]
```

### D 2timothy4 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Preach the",
        "a": "word",
        "suffix": "; be instant in season, out of season; reprove, rebuke, exhort with all longsuffering and doctrine.",
        "d": [
          "gospel",
          "truth",
          "law"
        ]
```

Replace with:

```js
"prefix": "Preach the",
        "a": "word",
        "suffix": "; be instant in season, out of season; reprove, rebuke, exhort with all longsuffering and doctrine.",
        "d": [
          "gospel",
          "truth",
          "law",
          "faith",
          "name"
        ]
```

### D 2timothy4 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But watch thou in all things, endure afflictions, do the work of an",
        "a": "evangelist",
        "suffix": ", make full proof of thy ministry.",
        "d": [
          "apostle",
          "teacher",
          "prophet"
        ]
```

Replace with:

```js
"prefix": "But watch thou in all things, endure afflictions, do the work of an",
        "a": "evangelist",
        "suffix": ", make full proof of thy ministry.",
        "d": [
          "apostle",
          "teacher",
          "prophet",
          "elder",
          "merchant"
        ]
```

### D 2timothy4 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For I am now ready to be offered, and the time of my departure is at",
        "a": "hand",
        "suffix": ".",
        "d": [
          "the door",
          "night",
          "last"
        ]
```

Replace with:

```js
"prefix": "For I am now ready to be offered, and the time of my departure is at",
        "a": "hand",
        "suffix": ".",
        "d": [
          "the door",
          "night",
          "last",
          "rest",
          "need"
        ]
```

### D 2timothy4 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I have fought a good fight, I have finished my",
        "a": "course",
        "suffix": ", I have kept the faith:",
        "d": [
          "race",
          "work",
          "path"
        ]
```

Replace with:

```js
"prefix": "I have fought a good fight, I have finished my",
        "a": "course",
        "suffix": ", I have kept the faith:",
        "d": [
          "race",
          "work",
          "path",
          "charge",
          "labour"
        ]
```

### D 2timothy4 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I have kept the",
        "a": "faith",
        "suffix": ":",
        "d": [
          "commandment",
          "word",
          "truth"
        ]
```

Replace with:

```js
"prefix": "I have kept the",
        "a": "faith",
        "suffix": ":",
        "d": [
          "commandment",
          "word",
          "truth",
          "law",
          "gospel"
        ]
```

### D 2timothy4 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Henceforth there is laid up for me a crown of",
        "a": "righteousness",
        "suffix": ", which the Lord, the righteous judge, shall give me at that day:",
        "d": [
          "glory",
          "life",
          "peace"
        ]
```

Replace with:

```js
"prefix": "Henceforth there is laid up for me a crown of",
        "a": "righteousness",
        "suffix": ", which the Lord, the righteous judge, shall give me at that day:",
        "d": [
          "glory",
          "life",
          "peace",
          "honour",
          "gold"
        ]
```

### D 2timothy4 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and not to me only, but unto all them also that love his",
        "a": "appearing",
        "suffix": ".",
        "d": [
          "coming",
          "name",
          "glory"
        ]
```

Replace with:

```js
"prefix": "and not to me only, but unto all them also that love his",
        "a": "appearing",
        "suffix": ".",
        "d": [
          "coming",
          "name",
          "glory",
          "kingdom",
          "return"
        ]
```

### D 2timothy4 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the Lord shall deliver me from every evil work, and will preserve me unto his heavenly",
        "a": "kingdom",
        "suffix": ": to whom be glory for ever and ever. Amen.",
        "d": [
          "habitation",
          "city",
          "rest"
        ]
```

Replace with:

```js
"prefix": "And the Lord shall deliver me from every evil work, and will preserve me unto his heavenly",
        "a": "kingdom",
        "suffix": ": to whom be glory for ever and ever. Amen.",
        "d": [
          "habitation",
          "city",
          "rest",
          "bread",
          "garden"
        ]
```

### D titus2 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But speak thou the things which become sound",
        "a": "doctrine",
        "suffix": ":",
        "d": [
          "teaching",
          "words",
          "truth"
        ]
```

Replace with:

```js
"prefix": "But speak thou the things which become sound",
        "a": "doctrine",
        "suffix": ":",
        "d": [
          "teaching",
          "words",
          "truth",
          "faith",
          "wisdom"
        ]
```

### D titus2 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "In all things shewing thyself a pattern of good works: in doctrine shewing",
        "a": "uncorruptness",
        "suffix": ", gravity, sincerity,",
        "d": [
          "purity",
          "holiness",
          "faith"
        ]
```

Replace with:

```js
"prefix": "In all things shewing thyself a pattern of good works: in doctrine shewing",
        "a": "uncorruptness",
        "suffix": ", gravity, sincerity,",
        "d": [
          "purity",
          "holiness",
          "faith",
          "truth",
          "wisdom"
        ]
```

### D titus2 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For the grace of God that bringeth salvation hath appeared to all",
        "a": "men",
        "suffix": ",",
        "d": [
          "nations",
          "sinners",
          "peoples"
        ]
```

Replace with:

```js
"prefix": "For the grace of God that bringeth salvation hath appeared to all",
        "a": "men",
        "suffix": ",",
        "d": [
          "nations",
          "sinners",
          "peoples",
          "saints",
          "angels"
        ]
```

### D titus2 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Teaching us that, denying ungodliness and worldly lusts, we should live soberly, righteously, and godly, in this present",
        "a": "world",
        "suffix": ";",
        "d": [
          "age",
          "life",
          "generation"
        ]
```

Replace with:

```js
"prefix": "Teaching us that, denying ungodliness and worldly lusts, we should live soberly, righteously, and godly, in this present",
        "a": "world",
        "suffix": ";",
        "d": [
          "age",
          "life",
          "generation",
          "season",
          "hour"
        ]
```

### D titus2 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Looking for that blessed hope, and the glorious",
        "a": "appearing",
        "suffix": "of the great God and our Saviour Jesus Christ;",
        "d": [
          "coming",
          "revelation",
          "day"
        ]
```

Replace with:

```js
"prefix": "Looking for that blessed hope, and the glorious",
        "a": "appearing",
        "suffix": "of the great God and our Saviour Jesus Christ;",
        "d": [
          "coming",
          "revelation",
          "day",
          "kingdom",
          "brightness"
        ]
```

### D titus2 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who gave himself for us, that he might redeem us from all",
        "a": "iniquity",
        "suffix": ",",
        "d": [
          "sin",
          "evil",
          "unrighteousness"
        ]
```

Replace with:

```js
"prefix": "Who gave himself for us, that he might redeem us from all",
        "a": "iniquity",
        "suffix": ",",
        "d": [
          "sin",
          "evil",
          "unrighteousness",
          "bondage",
          "sickness"
        ]
```

### D titus2 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and purify unto himself a peculiar people, zealous of good",
        "a": "works",
        "suffix": ".",
        "d": [
          "deeds",
          "fruits",
          "ways"
        ]
```

Replace with:

```js
"prefix": "and purify unto himself a peculiar people, zealous of good",
        "a": "works",
        "suffix": ".",
        "d": [
          "deeds",
          "fruits",
          "ways",
          "words",
          "things"
        ]
```

### D titus2 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "These things speak, and exhort, and rebuke with all authority. Let no man",
        "a": "despise",
        "suffix": "thee.",
        "d": [
          "judge",
          "hinder",
          "mock"
        ]
```

Replace with:

```js
"prefix": "These things speak, and exhort, and rebuke with all authority. Let no man",
        "a": "despise",
        "suffix": "thee.",
        "d": [
          "judge",
          "hinder",
          "mock",
          "forsake",
          "forget"
        ]
```

### D hebrews1 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "God, who at sundry times and in divers manners spake in time past unto the fathers by the",
        "a": "prophets",
        "suffix": ",",
        "d": [
          "angels",
          "scribes",
          "priests"
        ]
```

Replace with:

```js
"prefix": "God, who at sundry times and in divers manners spake in time past unto the fathers by the",
        "a": "prophets",
        "suffix": ",",
        "d": [
          "angels",
          "scribes",
          "priests",
          "kings",
          "elders"
        ]
```

### D hebrews1 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Hath in these last days spoken unto us by his",
        "a": "Son",
        "suffix": ", whom he hath appointed heir of all things,",
        "d": [
          "Word",
          "Servant",
          "Spirit"
        ]
```

Replace with:

```js
"prefix": "Hath in these last days spoken unto us by his",
        "a": "Son",
        "suffix": ", whom he hath appointed heir of all things,",
        "d": [
          "Word",
          "Servant",
          "Spirit",
          "Father",
          "Angel"
        ]
```

### D hebrews1 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who being the brightness of his glory, and the express image of his",
        "a": "person",
        "suffix": ",",
        "d": [
          "substance",
          "presence",
          "nature"
        ]
```

Replace with:

```js
"prefix": "Who being the brightness of his glory, and the express image of his",
        "a": "person",
        "suffix": ",",
        "d": [
          "substance",
          "presence",
          "nature",
          "face",
          "form"
        ]
```

### D hebrews1 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "when he had by himself purged our sins, sat down on the right hand of the Majesty on",
        "a": "high",
        "suffix": ";",
        "d": [
          "glory",
          "the throne",
          "heaven"
        ]
```

Replace with:

```js
"prefix": "when he had by himself purged our sins, sat down on the right hand of the Majesty on",
        "a": "high",
        "suffix": ";",
        "d": [
          "glory",
          "the throne",
          "heaven",
          "earth",
          "Zion"
        ]
```

### D hebrews1 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thy throne, O God, is for ever and ever: a sceptre of",
        "a": "righteousness",
        "suffix": "is the sceptre of thy kingdom.",
        "d": [
          "holiness",
          "peace",
          "truth"
        ]
```

Replace with:

```js
"prefix": "Thy throne, O God, is for ever and ever: a sceptre of",
        "a": "righteousness",
        "suffix": "is the sceptre of thy kingdom.",
        "d": [
          "holiness",
          "peace",
          "truth",
          "power",
          "glory"
        ]
```

### D hebrews1 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Thou hast loved righteousness, and hated",
        "a": "iniquity",
        "suffix": "; therefore God, even thy God, hath anointed thee with the oil of gladness above thy fellows.",
        "d": [
          "sin",
          "wickedness",
          "evil"
        ]
```

Replace with:

```js
"prefix": "Thou hast loved righteousness, and hated",
        "a": "iniquity",
        "suffix": "; therefore God, even thy God, hath anointed thee with the oil of gladness above thy fellows.",
        "d": [
          "sin",
          "wickedness",
          "evil",
          "wrong",
          "folly"
        ]
```

### D hebrews1 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "they shall be changed: but thou art the",
        "a": "same",
        "suffix": ", and thy years shall not fail.",
        "d": [
          "eternal",
          "Lord",
          "first"
        ]
```

Replace with:

```js
"prefix": "they shall be changed: but thou art the",
        "a": "same",
        "suffix": ", and thy years shall not fail.",
        "d": [
          "eternal",
          "Lord",
          "first",
          "last",
          "true"
        ]
```

### D hebrews1 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Are they not all ministering spirits, sent forth to minister for them who shall be heirs of",
        "a": "salvation",
        "suffix": "?",
        "d": [
          "glory",
          "the kingdom",
          "life"
        ]
```

Replace with:

```js
"prefix": "Are they not all ministering spirits, sent forth to minister for them who shall be heirs of",
        "a": "salvation",
        "suffix": "?",
        "d": [
          "glory",
          "the kingdom",
          "life",
          "rest",
          "wrath"
        ]
```

### D hebrews12 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Wherefore seeing we also are compassed about with so great a cloud of",
        "a": "witnesses",
        "suffix": ",",
        "d": [
          "saints",
          "angels",
          "holy ones"
        ]
```

Replace with:

```js
"prefix": "Wherefore seeing we also are compassed about with so great a cloud of",
        "a": "witnesses",
        "suffix": ",",
        "d": [
          "saints",
          "angels",
          "holy ones",
          "locusts",
          "ashes"
        ]
```

### D hebrews12 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "let us lay aside every weight, and the sin which doth so easily",
        "a": "beset",
        "suffix": "us, and let us run with patience the race that is set before us,",
        "d": [
          "snare",
          "bind",
          "hinder"
        ]
```

Replace with:

```js
"prefix": "let us lay aside every weight, and the sin which doth so easily",
        "a": "beset",
        "suffix": "us, and let us run with patience the race that is set before us,",
        "d": [
          "snare",
          "bind",
          "hinder",
          "tempt",
          "trouble"
        ]
```

### D hebrews12 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Looking unto Jesus the author and finisher of our",
        "a": "faith",
        "suffix": ";",
        "d": [
          "salvation",
          "hope",
          "course"
        ]
```

Replace with:

```js
"prefix": "Looking unto Jesus the author and finisher of our",
        "a": "faith",
        "suffix": ";",
        "d": [
          "salvation",
          "hope",
          "course",
          "peace",
          "race"
        ]
```

### D hebrews12 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "who for the joy that was set before him endured the cross, despising the",
        "a": "shame",
        "suffix": ", and is set down at the right hand of the throne of God.",
        "d": [
          "pain",
          "sorrow",
          "reproach"
        ]
```

Replace with:

```js
"prefix": "who for the joy that was set before him endured the cross, despising the",
        "a": "shame",
        "suffix": ", and is set down at the right hand of the throne of God.",
        "d": [
          "pain",
          "sorrow",
          "reproach",
          "death",
          "glory"
        ]
```

### D hebrews12 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Follow peace with all men, and",
        "a": "holiness",
        "suffix": ", without which no man shall see the Lord:",
        "d": [
          "righteousness",
          "purity",
          "love"
        ]
```

Replace with:

```js
"prefix": "Follow peace with all men, and",
        "a": "holiness",
        "suffix": ", without which no man shall see the Lord:",
        "d": [
          "righteousness",
          "purity",
          "love",
          "mercy",
          "grace"
        ]
```

### D hebrews12 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But ye are come unto mount",
        "a": "Sion",
        "suffix": ", and unto the city of the living God, the heavenly Jerusalem,",
        "d": [
          "Sinai",
          "Moriah",
          "Horeb"
        ]
```

Replace with:

```js
"prefix": "But ye are come unto mount",
        "a": "Sion",
        "suffix": ", and unto the city of the living God, the heavenly Jerusalem,",
        "d": [
          "Sinai",
          "Moriah",
          "Horeb",
          "Carmel",
          "Olivet"
        ]
```

### D hebrews12 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Wherefore we receiving a kingdom which cannot be",
        "a": "moved",
        "suffix": ", let us have grace, whereby we may serve God acceptably with reverence and godly fear:",
        "d": [
          "shaken",
          "broken",
          "destroyed"
        ]
```

Replace with:

```js
"prefix": "Wherefore we receiving a kingdom which cannot be",
        "a": "moved",
        "suffix": ", let us have grace, whereby we may serve God acceptably with reverence and godly fear:",
        "d": [
          "shaken",
          "broken",
          "destroyed",
          "forsaken",
          "bought"
        ]
```

### D hebrews12 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "For our God is a consuming",
        "a": "fire",
        "suffix": ".",
        "d": [
          "flame",
          "judge",
          "light"
        ]
```

Replace with:

```js
"prefix": "For our God is a consuming",
        "a": "fire",
        "suffix": ".",
        "d": [
          "flame",
          "judge",
          "light",
          "wrath",
          "judgment"
        ]
```

### D james3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If any man offend not in word, the same is a",
        "a": "perfect",
        "suffix": "man, and able also to bridle the whole body.",
        "d": [
          "just",
          "wise",
          "holy"
        ]
```

Replace with:

```js
"prefix": "If any man offend not in word, the same is a",
        "a": "perfect",
        "suffix": "man, and able also to bridle the whole body.",
        "d": [
          "just",
          "wise",
          "holy",
          "godly",
          "good"
        ]
```

### D james3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Even so the",
        "a": "tongue",
        "suffix": "is a little member, and boasteth great things. Behold, how great a matter a little fire kindleth!",
        "d": [
          "mouth",
          "word",
          "lip"
        ]
```

Replace with:

```js
"prefix": "Even so the",
        "a": "tongue",
        "suffix": "is a little member, and boasteth great things. Behold, how great a matter a little fire kindleth!",
        "d": [
          "mouth",
          "word",
          "lip",
          "heart",
          "hand"
        ]
```

### D james3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the tongue is a",
        "a": "fire",
        "suffix": ", a world of iniquity: so is the tongue among our members,",
        "d": [
          "flame",
          "spark",
          "sword"
        ]
```

Replace with:

```js
"prefix": "And the tongue is a",
        "a": "fire",
        "suffix": ", a world of iniquity: so is the tongue among our members,",
        "d": [
          "flame",
          "spark",
          "sword",
          "spring",
          "stream"
        ]
```

### D james3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But the tongue can no man tame; it is an unruly evil, full of deadly",
        "a": "poison",
        "suffix": ".",
        "d": [
          "bitterness",
          "venom",
          "deceit"
        ]
```

Replace with:

```js
"prefix": "But the tongue can no man tame; it is an unruly evil, full of deadly",
        "a": "poison",
        "suffix": ".",
        "d": [
          "bitterness",
          "venom",
          "deceit",
          "sting",
          "malice"
        ]
```

### D james3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Out of the same mouth proceedeth blessing and",
        "a": "cursing",
        "suffix": ". My brethren, these things ought not so to be.",
        "d": [
          "wrath",
          "evil",
          "bitterness"
        ]
```

Replace with:

```js
"prefix": "Out of the same mouth proceedeth blessing and",
        "a": "cursing",
        "suffix": ". My brethren, these things ought not so to be.",
        "d": [
          "wrath",
          "evil",
          "bitterness",
          "praise",
          "thanks"
        ]
```

### D james3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "let him shew out of a good conversation his works with meekness of",
        "a": "wisdom",
        "suffix": ".",
        "d": [
          "knowledge",
          "heart",
          "truth"
        ]
```

Replace with:

```js
"prefix": "let him shew out of a good conversation his works with meekness of",
        "a": "wisdom",
        "suffix": ".",
        "d": [
          "knowledge",
          "heart",
          "truth",
          "faith",
          "love"
        ]
```

### D james3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But the wisdom that is from above is first",
        "a": "pure",
        "suffix": ", then peaceable, gentle, and easy to be intreated,",
        "d": [
          "holy",
          "clean",
          "righteous"
        ]
```

Replace with:

```js
"prefix": "But the wisdom that is from above is first",
        "a": "pure",
        "suffix": ", then peaceable, gentle, and easy to be intreated,",
        "d": [
          "holy",
          "clean",
          "righteous",
          "meek",
          "wise"
        ]
```

### D james3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And the fruit of righteousness is sown in",
        "a": "peace",
        "suffix": "of them that make peace.",
        "d": [
          "love",
          "joy",
          "truth"
        ]
```

Replace with:

```js
"prefix": "And the fruit of righteousness is sown in",
        "a": "peace",
        "suffix": "of them that make peace.",
        "d": [
          "love",
          "joy",
          "truth",
          "hope",
          "grace"
        ]
```

### D 1peter1 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Blessed be the God and Father of our Lord Jesus Christ, which according to his abundant mercy hath begotten us again unto a lively",
        "a": "hope",
        "suffix": "by the resurrection of Jesus Christ from the dead,",
        "d": [
          "faith",
          "life",
          "peace"
        ]
```

Replace with:

```js
"prefix": "Blessed be the God and Father of our Lord Jesus Christ, which according to his abundant mercy hath begotten us again unto a lively",
        "a": "hope",
        "suffix": "by the resurrection of Jesus Christ from the dead,",
        "d": [
          "faith",
          "life",
          "peace",
          "inheritance",
          "joy"
        ]
```

### D 1peter1 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "To an inheritance incorruptible, and undefiled, and that fadeth not away, reserved in",
        "a": "heaven",
        "suffix": "for you,",
        "d": [
          "glory",
          "light",
          "eternity"
        ]
```

Replace with:

```js
"prefix": "To an inheritance incorruptible, and undefiled, and that fadeth not away, reserved in",
        "a": "heaven",
        "suffix": "for you,",
        "d": [
          "glory",
          "light",
          "eternity",
          "hope",
          "earth"
        ]
```

### D 1peter1 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "That the trial of your faith, being much more precious than of",
        "a": "gold",
        "suffix": "that perisheth, though it be tried with fire,",
        "d": [
          "silver",
          "rubies",
          "pearls"
        ]
```

Replace with:

```js
"prefix": "That the trial of your faith, being much more precious than of",
        "a": "gold",
        "suffix": "that perisheth, though it be tried with fire,",
        "d": [
          "silver",
          "rubies",
          "pearls",
          "wood",
          "stone"
        ]
```

### D 1peter1 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Whom having not seen, ye",
        "a": "love",
        "suffix": "; in whom, though now ye see him not, yet believing, ye rejoice with joy unspeakable and full of glory:",
        "d": [
          "trust",
          "seek",
          "praise"
        ]
```

Replace with:

```js
"prefix": "Whom having not seen, ye",
        "a": "love",
        "suffix": "; in whom, though now ye see him not, yet believing, ye rejoice with joy unspeakable and full of glory:",
        "d": [
          "trust",
          "seek",
          "praise",
          "know",
          "fear"
        ]
```

### D 1peter1 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "as he which hath called you is holy, so be ye",
        "a": "holy",
        "suffix": "in all manner of conversation;",
        "d": [
          "pure",
          "clean",
          "righteous"
        ]
```

Replace with:

```js
"prefix": "as he which hath called you is holy, so be ye",
        "a": "holy",
        "suffix": "in all manner of conversation;",
        "d": [
          "pure",
          "clean",
          "righteous",
          "perfect",
          "good"
        ]
```

### D 1peter1 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "ye were not redeemed with corruptible things, as silver and",
        "a": "gold",
        "suffix": ",",
        "d": [
          "rubies",
          "jewels",
          "pearls"
        ]
```

Replace with:

```js
"prefix": "ye were not redeemed with corruptible things, as silver and",
        "a": "gold",
        "suffix": ",",
        "d": [
          "rubies",
          "jewels",
          "pearls",
          "brass",
          "iron"
        ]
```

### D 1peter1 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But with the precious blood of Christ, as of a lamb without blemish and without",
        "a": "spot",
        "suffix": ":",
        "d": [
          "sin",
          "fault",
          "wrinkle"
        ]
```

Replace with:

```js
"prefix": "But with the precious blood of Christ, as of a lamb without blemish and without",
        "a": "spot",
        "suffix": ":",
        "d": [
          "sin",
          "fault",
          "wrinkle",
          "blot",
          "shame"
        ]
```

### D 1peter1 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But the word of the Lord endureth for",
        "a": "ever",
        "suffix": ". And this is the word which by the gospel is preached unto you.",
        "d": [
          "ages",
          "all generations",
          "all time"
        ]
```

Replace with:

```js
"prefix": "But the word of the Lord endureth for",
        "a": "ever",
        "suffix": ". And this is the word which by the gospel is preached unto you.",
        "d": [
          "ages",
          "all generations",
          "all time",
          "always",
          "nights"
        ]
```

### D 1peter2 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "As newborn babes, desire the sincere milk of the word, that ye may",
        "a": "grow",
        "suffix": "thereby:",
        "d": [
          "live",
          "stand",
          "prosper"
        ]
```

Replace with:

```js
"prefix": "As newborn babes, desire the sincere milk of the word, that ye may",
        "a": "grow",
        "suffix": "thereby:",
        "d": [
          "live",
          "stand",
          "prosper",
          "feed",
          "rejoice"
        ]
```

### D 1peter2 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "To whom coming, as unto a living",
        "a": "stone",
        "suffix": ", disallowed indeed of men, but chosen of God, and precious,",
        "d": [
          "rock",
          "pillar",
          "temple"
        ]
```

Replace with:

```js
"prefix": "To whom coming, as unto a living",
        "a": "stone",
        "suffix": ", disallowed indeed of men, but chosen of God, and precious,",
        "d": [
          "rock",
          "pillar",
          "temple",
          "altar",
          "tree"
        ]
```

### D 1peter2 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Ye also, as lively stones, are built up a spiritual",
        "a": "house",
        "suffix": ", an holy priesthood,",
        "d": [
          "temple",
          "sanctuary",
          "building"
        ]
```

Replace with:

```js
"prefix": "Ye also, as lively stones, are built up a spiritual",
        "a": "house",
        "suffix": ", an holy priesthood,",
        "d": [
          "temple",
          "sanctuary",
          "building",
          "altar",
          "city"
        ]
```

### D 1peter2 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Behold, I lay in Sion a chief corner stone, elect, precious: and he that believeth on him shall not be",
        "a": "confounded",
        "suffix": ".",
        "d": [
          "ashamed",
          "moved",
          "shaken"
        ]
```

Replace with:

```js
"prefix": "Behold, I lay in Sion a chief corner stone, elect, precious: and he that believeth on him shall not be",
        "a": "confounded",
        "suffix": ".",
        "d": [
          "ashamed",
          "moved",
          "shaken",
          "forsaken",
          "deceived"
        ]
```

### D 1peter2 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But ye are a chosen generation, a royal",
        "a": "priesthood",
        "suffix": ", an holy nation, a peculiar people;",
        "d": [
          "house",
          "kingdom",
          "family"
        ]
```

Replace with:

```js
"prefix": "But ye are a chosen generation, a royal",
        "a": "priesthood",
        "suffix": ", an holy nation, a peculiar people;",
        "d": [
          "house",
          "kingdom",
          "family",
          "race",
          "crown"
        ]
```

### D 1peter2 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "that ye should shew forth the praises of him who hath called you out of darkness into his marvellous",
        "a": "light",
        "suffix": ":",
        "d": [
          "glory",
          "day",
          "kingdom"
        ]
```

Replace with:

```js
"prefix": "that ye should shew forth the praises of him who hath called you out of darkness into his marvellous",
        "a": "light",
        "suffix": ":",
        "d": [
          "glory",
          "day",
          "kingdom",
          "love",
          "power"
        ]
```

### D 1peter2 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Who his own self bare our sins in his own body on the",
        "a": "tree",
        "suffix": ",",
        "d": [
          "cross",
          "wood",
          "mount"
        ]
```

Replace with:

```js
"prefix": "Who his own self bare our sins in his own body on the",
        "a": "tree",
        "suffix": ",",
        "d": [
          "cross",
          "wood",
          "mount",
          "altar",
          "beam"
        ]
```

### D 1peter2 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "by whose stripes ye were",
        "a": "healed",
        "suffix": ".",
        "d": [
          "saved",
          "cleansed",
          "redeemed"
        ]
```

Replace with:

```js
"prefix": "by whose stripes ye were",
        "a": "healed",
        "suffix": ".",
        "d": [
          "saved",
          "cleansed",
          "redeemed",
          "bound",
          "slain"
        ]
```

### D 2peter3 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "that one day is with the Lord as a thousand",
        "a": "years",
        "suffix": ", and a thousand years as one day.",
        "d": [
          "days",
          "ages",
          "generations"
        ]
```

Replace with:

```js
"prefix": "that one day is with the Lord as a thousand",
        "a": "years",
        "suffix": ", and a thousand years as one day.",
        "d": [
          "days",
          "ages",
          "generations",
          "nights",
          "months"
        ]
```

### D 2peter3 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "The Lord is not slack concerning his promise, as some men count slackness; but is",
        "a": "longsuffering",
        "suffix": "to us-ward,",
        "d": [
          "patient",
          "merciful",
          "gracious"
        ]
```

Replace with:

```js
"prefix": "The Lord is not slack concerning his promise, as some men count slackness; but is",
        "a": "longsuffering",
        "suffix": "to us-ward,",
        "d": [
          "patient",
          "merciful",
          "gracious",
          "faithful",
          "kind"
        ]
```

### D 2peter3 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "not willing that any should perish, but that all should come to",
        "a": "repentance",
        "suffix": ".",
        "d": [
          "life",
          "faith",
          "salvation"
        ]
```

Replace with:

```js
"prefix": "not willing that any should perish, but that all should come to",
        "a": "repentance",
        "suffix": ".",
        "d": [
          "life",
          "faith",
          "salvation",
          "light",
          "judgment"
        ]
```

### D 2peter3 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the day of the Lord will come as a",
        "a": "thief",
        "suffix": "in the night; in the which the heavens shall pass away with a great noise,",
        "d": [
          "snare",
          "storm",
          "flame"
        ]
```

Replace with:

```js
"prefix": "the day of the Lord will come as a",
        "a": "thief",
        "suffix": "in the night; in the which the heavens shall pass away with a great noise,",
        "d": [
          "snare",
          "storm",
          "flame",
          "flood",
          "whirlwind"
        ]
```

### D 2peter3 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "the elements shall melt with fervent",
        "a": "heat",
        "suffix": ", the earth also and the works that are therein shall be burned up.",
        "d": [
          "fire",
          "flame",
          "wrath"
        ]
```

Replace with:

```js
"prefix": "the elements shall melt with fervent",
        "a": "heat",
        "suffix": ", the earth also and the works that are therein shall be burned up.",
        "d": [
          "fire",
          "flame",
          "wrath",
          "zeal",
          "love"
        ]
```

### D 2peter3 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "look for new heavens and a new",
        "a": "earth",
        "suffix": ", wherein dwelleth righteousness.",
        "d": [
          "Jerusalem",
          "Zion",
          "creation"
        ]
```

Replace with:

```js
"prefix": "look for new heavens and a new",
        "a": "earth",
        "suffix": ", wherein dwelleth righteousness.",
        "d": [
          "Jerusalem",
          "Zion",
          "creation",
          "city",
          "heart"
        ]
```

### D 2peter3 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "be diligent that ye may be found of him in peace, without spot, and",
        "a": "blameless",
        "suffix": ".",
        "d": [
          "holy",
          "pure",
          "clean"
        ]
```

Replace with:

```js
"prefix": "be diligent that ye may be found of him in peace, without spot, and",
        "a": "blameless",
        "suffix": ".",
        "d": [
          "holy",
          "pure",
          "clean",
          "merciful",
          "patient"
        ]
```

### D 2peter3 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "But grow in grace, and in the knowledge of our Lord and Saviour Jesus",
        "a": "Christ",
        "suffix": ". To him be glory both now and for ever. Amen.",
        "d": [
          "the King",
          "the Lord",
          "our God"
        ]
```

Replace with:

```js
"prefix": "But grow in grace, and in the knowledge of our Lord and Saviour Jesus",
        "a": "Christ",
        "suffix": ". To him be glory both now and for ever. Amen.",
        "d": [
          "the King",
          "the Lord",
          "our God",
          "Master",
          "Prophet"
        ]
```

### D 1john1 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "That which was from the beginning, which we have heard, which we have seen with our eyes, which we have looked upon, and our hands have handled, of the Word of",
        "a": "life",
        "suffix": ";",
        "d": [
          "truth",
          "God",
          "glory"
        ]
```

Replace with:

```js
"prefix": "That which was from the beginning, which we have heard, which we have seen with our eyes, which we have looked upon, and our hands have handled, of the Word of",
        "a": "life",
        "suffix": ";",
        "d": [
          "truth",
          "God",
          "glory",
          "grace",
          "power"
        ]
```

### D 1john1 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and truly our fellowship is with the Father, and with his Son Jesus",
        "a": "Christ",
        "suffix": ".",
        "d": [
          "the Lord",
          "our Saviour",
          "the King"
        ]
```

Replace with:

```js
"prefix": "and truly our fellowship is with the Father, and with his Son Jesus",
        "a": "Christ",
        "suffix": ".",
        "d": [
          "the Lord",
          "our Saviour",
          "the King",
          "Master",
          "Prophet"
        ]
```

### D 1john1 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And these things write we unto you, that your joy may be",
        "a": "full",
        "suffix": ".",
        "d": [
          "great",
          "complete",
          "abundant"
        ]
```

Replace with:

```js
"prefix": "And these things write we unto you, that your joy may be",
        "a": "full",
        "suffix": ".",
        "d": [
          "great",
          "complete",
          "abundant",
          "strong",
          "sure"
        ]
```

### D 1john1 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "This then is the message which we have heard of him, and declare unto you, that God is",
        "a": "light",
        "suffix": ", and in him is no darkness at all.",
        "d": [
          "love",
          "truth",
          "holy"
        ]
```

Replace with:

```js
"prefix": "This then is the message which we have heard of him, and declare unto you, that God is",
        "a": "light",
        "suffix": ", and in him is no darkness at all.",
        "d": [
          "love",
          "truth",
          "holy",
          "spirit",
          "fire"
        ]
```

### D 1john1 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "if we walk in the light, as he is in the light, we have fellowship one with another, and the blood of Jesus Christ his Son cleanseth us from all",
        "a": "sin",
        "suffix": ".",
        "d": [
          "iniquity",
          "unrighteousness",
          "evil"
        ]
```

Replace with:

```js
"prefix": "if we walk in the light, as he is in the light, we have fellowship one with another, and the blood of Jesus Christ his Son cleanseth us from all",
        "a": "sin",
        "suffix": ".",
        "d": [
          "iniquity",
          "unrighteousness",
          "evil",
          "trouble",
          "shame"
        ]
```

### D 1john1 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If we say that we have no sin, we deceive ourselves, and the truth is not in",
        "a": "us",
        "suffix": ".",
        "d": [
          "our hearts",
          "them",
          "me"
        ]
```

Replace with:

```js
"prefix": "If we say that we have no sin, we deceive ourselves, and the truth is not in",
        "a": "us",
        "suffix": ".",
        "d": [
          "our hearts",
          "them",
          "me",
          "him",
          "you"
        ]
```

### D 1john1 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all",
        "a": "unrighteousness",
        "suffix": ".",
        "d": [
          "iniquity",
          "evil",
          "fault"
        ]
```

Replace with:

```js
"prefix": "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all",
        "a": "unrighteousness",
        "suffix": ".",
        "d": [
          "iniquity",
          "evil",
          "fault",
          "pride",
          "folly"
        ]
```

### D 1john1 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "If we say that we have not sinned, we make him a liar, and his word is not in",
        "a": "us",
        "suffix": ".",
        "d": [
          "our soul",
          "our mouth",
          "them"
        ]
```

Replace with:

```js
"prefix": "If we say that we have not sinned, we make him a liar, and his word is not in",
        "a": "us",
        "suffix": ".",
        "d": [
          "our soul",
          "our mouth",
          "them",
          "you",
          "me"
        ]
```

### D revelation22 blank 0 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And he shewed me a pure river of water of life, clear as crystal, proceeding out of the throne of God and of the",
        "a": "Lamb",
        "suffix": ".",
        "d": [
          "King",
          "Lord",
          "Father"
        ]
```

Replace with:

```js
"prefix": "And he shewed me a pure river of water of life, clear as crystal, proceeding out of the throne of God and of the",
        "a": "Lamb",
        "suffix": ".",
        "d": [
          "King",
          "Lord",
          "Father",
          "Shepherd",
          "Prophet"
        ]
```

### D revelation22 blank 1 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "In the midst of the street of it, and on either side of the river, was there the tree of",
        "a": "life",
        "suffix": ",",
        "d": [
          "peace",
          "healing",
          "righteousness"
        ]
```

Replace with:

```js
"prefix": "In the midst of the street of it, and on either side of the river, was there the tree of",
        "a": "life",
        "suffix": ",",
        "d": [
          "peace",
          "healing",
          "righteousness",
          "knowledge",
          "wisdom"
        ]
```

### D revelation22 blank 2 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "and the leaves of the tree were for the",
        "a": "healing",
        "suffix": "of the nations.",
        "d": [
          "blessing",
          "salvation",
          "health"
        ]
```

Replace with:

```js
"prefix": "and the leaves of the tree were for the",
        "a": "healing",
        "suffix": "of the nations.",
        "d": [
          "blessing",
          "salvation",
          "health",
          "food",
          "shade"
        ]
```

### D revelation22 blank 3 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And there shall be no more",
        "a": "curse",
        "suffix": ": but the throne of God and of the Lamb shall be in it; and his servants shall serve him:",
        "d": [
          "sorrow",
          "death",
          "crying"
        ]
```

Replace with:

```js
"prefix": "And there shall be no more",
        "a": "curse",
        "suffix": ": but the throne of God and of the Lamb shall be in it; and his servants shall serve him:",
        "d": [
          "sorrow",
          "death",
          "crying",
          "pain",
          "night"
        ]
```

### D revelation22 blank 4 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "And they shall see his face; and his",
        "a": "name",
        "suffix": "shall be in their foreheads.",
        "d": [
          "seal",
          "mark",
          "glory"
        ]
```

Replace with:

```js
"prefix": "And they shall see his face; and his",
        "a": "name",
        "suffix": "shall be in their foreheads.",
        "d": [
          "seal",
          "mark",
          "glory",
          "image",
          "sign"
        ]
```

### D revelation22 blank 5 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "Behold, I come quickly: blessed is he that keepeth the sayings of the",
        "a": "prophecy",
        "suffix": "of this book.",
        "d": [
          "words",
          "covenant",
          "law"
        ]
```

Replace with:

```js
"prefix": "Behold, I come quickly: blessed is he that keepeth the sayings of the",
        "a": "prophecy",
        "suffix": "of this book.",
        "d": [
          "words",
          "covenant",
          "law",
          "vision",
          "epistle"
        ]
```

### D revelation22 blank 6 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "I am Alpha and Omega, the beginning and the end, the first and the",
        "a": "last",
        "suffix": ".",
        "d": [
          "eternal",
          "almighty",
          "finisher"
        ]
```

Replace with:

```js
"prefix": "I am Alpha and Omega, the beginning and the end, the first and the",
        "a": "last",
        "suffix": ".",
        "d": [
          "eternal",
          "almighty",
          "finisher",
          "same",
          "great"
        ]
```

### D revelation22 blank 7 gains two decoys (js/tablets-more.js)  (`js/tablets-more.js`, serves S1)

Why: six tablets per blank: two checked decoys appended to the existing three (check-decoys.js accepted both; executor review)

Find (exactly once):

```js
"prefix": "He which testifieth these things saith, Surely I come quickly. Amen. Even so, come, Lord",
        "a": "Jesus",
        "suffix": ".",
        "d": [
          "Christ",
          "God",
          "King"
        ]
```

Replace with:

```js
"prefix": "He which testifieth these things saith, Surely I come quickly. Amen. Even so, come, Lord",
        "a": "Jesus",
        "suffix": ".",
        "d": [
          "Christ",
          "God",
          "King",
          "Master",
          "Prophet"
        ]
```

What does not change: no rule changes; Winnow now greys 3 because the rule already said min(3, decoys − 1). NKJV keeps 3 decoys (4 tablets; 30 NKJV blanks have 2 decoys and show 3, as today). Android still takes 3 decoys (`picked.size >= 3`, Tablets.kt) until phase 8c, so its tray and tests are unchanged even though its content copies now carry 5.

## 7. Measured facts (verbatim from prove.js)
```text
apply (dry-run copy)               331 ms  applied 1249 edits to 8 files
generate (dry-run copy)            431 ms  exit 0
make-expected                    43322 ms  expected.json written: 1180 baseline files; changed: css/tablets.css, index.html, js/tablets-canon.js, js/tablets-hall.js, js/tablets-more.js, js/tablets-run.js, js/tablets.js, mobile/androidApp/src/main/assets/content/tablets.json, mobile/core/src/test/resources/content/tablets.json, shared/content/manifest.json, shared/content/tablets.json, test/tablets.test.js
tamper-test (+ full gate post)  140605 ms  TAMPER-TEST: PASS  (control passed; 16 tampers)
scope-report pristine             2194 ms  SCOPE VERDICT: READY  (1249 edit(s) pending, 0 already applied)
scope-report dry-run              1975 ms  SCOPE VERDICT: ALREADY APPLIED  (0 edit(s) pending, 1249 already applied)
scope-report (real project)       1323 ms  SCOPE VERDICT: READY  (1249 edit(s) pending, 0 already applied)
gate pre (real project)          22006 ms  RESULT: PASS  (31/31 checks passed, mode=pre)

# make-expected
expected.json written: 1180 baseline files; changed: css/tablets.css, index.html, js/tablets-canon.js, js/tablets-hall.js, js/tablets-more.js, js/tablets-run.js, js/tablets.js, mobile/androidApp/src/main/assets/content/tablets.json, mobile/core/src/test/resources/content/tablets.json, shared/content/manifest.json, shared/content/tablets.json, test/tablets.test.js
tests before {"pass":75,"fail":0} (exit 0) -> after {"pass":75,"fail":0} (exit 0)
  anchor js/tablets.js:131 x1  return shuffle([blank.a].concat((blank.d || []).slice(0, 3)));
  anchor js/tablets-run.js:430 x1  const badges = ["1", "2", "3", "4"];
  anchor js/tablets-run.js:986 x1    if(n >= 1 && n <= 4){
  anchor js/tablets-run.js:134 x1  : "Tap FATHER below, or type the word (1–4 picks)",
  anchor index.html:586 x1  <span class="tablets-keys-hint">1–4 · I · W · S</span>
  anchor css/tablets.css:263 x1  @media (min-width:720px){.tablets-grid{grid-template-columns:repeat(4,
  anchor js/tablets.js:9 x1  prefix:"The LORD is my shepherd; I shall not", a:"want", suffix:".", d

# tamper-test (its control is the full dry-run gate post)
control: gate post on the dry-run copy (full, with mutation tests)…
  OK    control must PASS -> RESULT: PASS  (46/46 checks passed, mode=post)  [DRY-RUN]
  OK    plan never applied (pristine copy) -> RESULT: FAIL  (22/35 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-css/tablets.css  css/tablets.css is byte-identical , X-index.html  index.html is byte-identical to the dry, X-js/tablets-canon.js  js/tablets-canon.js is byte-id
  OK    a stray file was added -> RESULT: FAIL  (33/35 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S2  no file was added or deleted
  OK    edited file drifted by one byte: js/tablets.js -> RESULT: FAIL  (33/35 checks passed, mode=post)   caught by: X-js/tablets.js  js/tablets.js is byte-identical to t, C-content  CI content:check passes (the generated con
  OK    edited file drifted by one byte: js/tablets-canon.js -> RESULT: FAIL  (33/35 checks passed, mode=post)   caught by: X-js/tablets-canon.js  js/tablets-canon.js is byte-id, C-content  CI content:check passes (the generated con
  OK    edited file drifted by one byte: js/tablets-hall.js -> RESULT: FAIL  (33/35 checks passed, mode=post)   caught by: X-js/tablets-hall.js  js/tablets-hall.js is byte-iden, C-content  CI content:check passes (the generated con
  OK    edited file drifted by one byte: js/tablets-more.js -> RESULT: FAIL  (33/35 checks passed, mode=post)   caught by: X-js/tablets-more.js  js/tablets-more.js is byte-iden, C-content  CI content:check passes (the generated con
  OK    edited file drifted by one byte: js/tablets-run.js -> RESULT: FAIL  (34/35 checks passed, mode=post)   caught by: X-js/tablets-run.js  js/tablets-run.js is byte-identi
  OK    edited file drifted by one byte: index.html -> RESULT: FAIL  (34/35 checks passed, mode=post)   caught by: X-index.html  index.html is byte-identical to the dry
  OK    edited file drifted by one byte: css/tablets.css -> RESULT: FAIL  (34/35 checks passed, mode=post)   caught by: X-css/tablets.css  css/tablets.css is byte-identical 
  OK    edited file drifted by one byte: test/tablets.test.js -> RESULT: FAIL  (34/35 checks passed, mode=post)   caught by: X-test/tablets.test.js  test/tablets.test.js is byte-
  OK    an out-of-scope file was changed: .cursor/skills/no-comments/SKILL.md -> RESULT: FAIL  (33/35 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, S3  the other 1168 files are byte-identical to the ba
  OK    generated file left stale: shared/content/tablets.json -> RESULT: FAIL  (32/35 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-shared/content/tablets.json  shared/content/tablets, C-content  CI content:check passes (the generated con
  OK    generated file left stale: shared/content/manifest.json -> RESULT: FAIL  (32/35 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-shared/content/manifest.json  shared/content/manife, C-content  CI content:check passes (the generated con
  OK    generated file left stale: mobile/androidApp/src/main/assets/content/tablets.json -> RESULT: FAIL  (32/35 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-mobile/androidApp/src/main/assets/content/tablets.j, C-content  CI content:check passes (the generated con
  OK    generated file left stale: mobile/core/src/test/resources/content/tablets.json -> RESULT: FAIL  (32/35 checks passed, mode=post)   caught by: S1  exactly these files changed: css/tablets.css, ind, X-mobile/core/src/test/resources/content/tablets.json, C-content  CI content:check passes (the generated con
  OK    half-applied: edit "E1 options slices five decoys" undone -> RESULT: FAIL  (33/35 checks passed, mode=post)   caught by: X-js/tablets.js  js/tablets.js is byte-identical to t, C-content  CI content:check passes (the generated con
TAMPER-TEST: PASS  (control passed; 16 tampers)

PIN fix-plan/gate.js sha256 61bb8519de3de0ebba8c7436fb1703e6d182797e72b351eb1c56f0d13586a587
PIN fix-plan/expected.json sha256 395adb5245f47e97a32782ade4470956bfbb97f93a9e4d8113692d3e3801bb5e
```

## 8. Not measured
- **Decoy quality** beyond the script's rules (tense, person, tone) rests on the drafters' care and a 30-pair sample reviewed by the executor; the other pairs were not each read by a person.
- **The vocabulary** is the project's own KJV text (4664 words), not the whole KJV, so some good KJV words were not allowed.
- **The layout** of 6 stones on a phone and at 720/1150px is not measured until the browser check.
- **NKJV six tablets:** not done (N1), a follow-up.
- **Mutation note:** the six-label badge array is equivalent to the existing `String(i + 1)` fallback, so it has no mutation.
- **gen.js** (the generate step) lives in the stage folder; it runs the exporter and restores CRLF endings.
- **CI:** the stacked PR targets the phase 7 branch; `ci.yml` runs on PRs to master only.

## 9. Execution report (only these statements)
1. The scope analysis summary under the four headings, and the SCOPE VERDICT line.
2. Both `RESULT:` lines and both report paths with their hashes.
3. The S1 line (files changed) and the H1 line (test tally).
4. Anything not run, marked "not run".
