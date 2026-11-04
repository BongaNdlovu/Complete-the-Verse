const fs = require('fs');
const { test, expect } = require('@playwright/test');

const seed = {
  v: 3, xp: 100, oil: 50, illumReserve: 0, runs: 1,
  best: { trial: 0, endless: 0, daily: 0, dailyByEdition: { kjv: 0, nkjv: 0 }, practice: 0, recall: 0, pilgrimage: 0, "pilgrim-recall": 0, blitz: 0, tablets: 0 },
  seals: [],
  life: { correct: 5, attempts: 5, bestStreak: 5, sdBest: 0, endlessBest: 0, dailyDone: 0, perfectActs: 0, typedExact: 0, typedAttempts: 0, reviewsDone: 0, sitesCleared: 1, arcsCleared: 0, blitzBest: 0, oilSpent: 0, oilEarned: 0, quickRewards: 0, quickRewardXP: 0, quickRewardOil: 0, illumRewards: 0, beatGoliathHeld: false, tabletHolds: 0 },
  tablets: { psalm23: { best: 0, held: false } },
  books: {}, verse: {}, srs: {}, board: [], journal: [],
  ghosts: { pilgrimage: null, pilgrimageBySite: {}, trial: null, blitz: null },
  daily: { date: "", score: 0 }, dailyByEdition: { kjv: { date: "", score: 0 }, nkjv: { date: "", score: 0 } },
  dailyStreak: { count: 0, lastDate: "", best: 0, celebrated: 0 },
  messagesSeen: ["2026-09-29-daily-update"], pendingDaily: null,
  habit: { count: 0, lastDate: "", lastDay: 0, best: 0, history: {} },
  pilgrim: { sites: { ur: { cleared: true, attempts: 1 } }, lastPlayed: "2026-10-04", started: Date.now(), usedIds: [] },
  artifacts: { unlocked: {}, seen: {} },
  set: {
    music: 0, sfx: 0, musicMute: true, sfxMute: true, quality: "low", qualityLocked: true,
    motion: "full", reduced: false, shake: false, voice: false, diff: "disciple",
    tutorialDone: true, tutorialSeen: true, tabletsTutorialDone: true, introPlayed: true,
    liveWeather: false, coldOpenDone: true, urPrologueDone: true, quiet: true, contrast: false,
    haptics: false, singleTap: true, translation: "kjv", translationChosen: true,
    character: "amina", scholarId: "amina", playerName: "Tester", profileDone: true,
    tabletStone: "sandstone", tabletSpeed: "normal", vkb: false, noticeBox: {}, characterDone: true
  }
};

const proof = {};

async function bootTablets(page) {
  await page.addInitScript((save) => localStorage.setItem('ctv_save_v3', JSON.stringify(save)), seed);
  await page.route('**/js/cloud-config.js', route => {
    route.fulfill({ status: 200, contentType: 'application/javascript', body: 'var CLOUD_CONFIG = { url: "", anonKey: "" };' });
  });
  await page.goto('/');
  await expect(page.locator('#v-menu')).toHaveClass(/on/, { timeout: 15000 });
  await page.evaluate(() => startRun('tablets', 'watchman'));
  await expect(page.locator('#v-tablets')).toHaveClass(/on/, { timeout: 10000 });
  await page.waitForTimeout(120);
}

test('the 1.25x clock climbs to The Mark and the last third quickens to 1.5x', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await bootTablets(page);
  await expect(page.locator('#v-tablets')).toHaveClass(/has-library-bg/, { timeout: 8000 });

  const header = await page.evaluate(() => {
    const top = document.querySelector('#v-tablets .tablets-top');
    const style = getComputedStyle(top);
    return { position: style.position, zIndex: style.zIndex, pace: document.getElementById('tablets-pace').textContent,
      pills: document.querySelectorAll('.tablets-speed-pill').length };
  });
  expect(header.position).toBe('relative');
  expect(header.zIndex).toBe('2');
  expect(header.pace).toBe('1.25×');
  expect(header.pills).toBe(0);
  await expect(page.locator('#tablets-pace')).toBeVisible();

  const before = await page.evaluate(() => {
    R.proofStart = performance.now();
    return {
      clock: R.tabletClock,
      max: R.tabletClockMax,
      rise: window.tabletsRiseOf(),
      marker: parseFloat(document.getElementById('tablets-ladder-marker').style.top)
    };
  });
  expect(before.max).toBeCloseTo(5.5, 6);
  await page.waitForFunction(() => R.tabletClock <= 0.55, null, { timeout: 10000 });
  const after = await page.evaluate(() => {
    stopTabletsLoop();
    return {
      clock: R.tabletClock,
      rise: window.tabletsRiseOf(),
      marker: parseFloat(document.getElementById('tablets-ladder-marker').style.top),
      elapsed: (performance.now() - R.proofStart) / 1000
    };
  });
  const rate = (before.clock - after.clock) / after.elapsed;
  const projectedFullClimb = before.max / rate;
  expect(rate).toBeGreaterThan(0.85);
  expect(rate).toBeLessThan(1.15);
  expect(projectedFullClimb).toBeGreaterThan(4.8);
  expect(projectedFullClimb).toBeLessThan(6.2);
  expect(after.rise).toBeGreaterThan(0.88);
  expect(after.marker).toBeLessThan(before.marker);

  /* Carve to the 9th of Psalm 23's 11 blanks: the last third runs on the 1.5x base and says so. */
  const quick = await page.evaluate(async () => {
    Math.random = () => 0.9;
    for (let i = 0; i < 8; i++) { window.tabletsResolve(true); window.tabletsFinishResolve(true); }
    return { idx: R.tabletIdx, max: R.tabletClockMax, label: window.tabletsSpeed().label,
      pace: document.getElementById('tablets-pace').textContent, mood: document.getElementById('tablets-stage').classList.contains('quick') };
  });
  expect(quick.idx).toBe(8);
  expect(quick.label).toBe('1.5×');
  expect(quick.pace).toBe('1.5× · quickened');
  expect(quick.mood).toBe(true);
  expect(quick.max).toBeLessThan(4.5);

  proof.desktop = { before, after, rate, projectedFullClimb, quick };
  await page.screenshot({ path: 'test-results/proof-desktop-clock.png' });
});

test('drag-to-fill, golden verse and Selah work on the live run', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await bootTablets(page);
  const word = await page.evaluate(() => window.tabletsGapBlank().a);
  await page.evaluate((answer) => {
    const stone = Array.from(document.querySelectorAll('#tablets-grid .tablets-stone')).find((b) => b.dataset.word === answer);
    const slot = document.getElementById('tablets-slot');
    const dt = new DataTransfer();
    dt.setData('text/plain', answer);
    stone.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
    slot.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    slot.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, word);
  await expect(page.locator('#tablets-slot')).toHaveText(word);
  expect(await page.evaluate(() => !!R.tabletResolving)).toBe(true);

  /* R3: Psalm 23:3 (soul) is one of the reference's golden verses; it is blank index 3. */
  const golden = await page.evaluate(() => {
    startRun('tablets', 'watchman', { tabletChapter: 'psalm23' });
    R.tabletIdx = 3;
    window.paintTabletsTablet();
    return { badge: !document.getElementById('tablets-golden').hidden, field: document.getElementById('tablets-ms').classList.contains('golden-blank'),
      word: window.tabletsGapBlank().a };
  });
  expect(golden.badge).toBe(true);
  expect(golden.field).toBe(true);
  expect(golden.word).toBe('soul');

  /* R3: Selah runs the sand at 0.06 for 4 s of play. */
  await page.evaluate(() => { R.tabletIdx = 0; window.paintTabletsTablet(); R.powers.selah = 2; R.selahLeft = 0; R.tabletClock = R.tabletClockMax; window.tabletsSelah(); window.__selahStart = R.tabletClock; });
  await page.waitForTimeout(1500);
  const selah = await page.evaluate(() => ({ left: R.selahLeft, charges: R.powers.selah, burned: window.__selahStart - R.tabletClock }));
  expect(selah.charges).toBe(1);
  expect(selah.left).toBeGreaterThan(2);
  expect(selah.left).toBeLessThan(4);
  expect(selah.burned).toBeGreaterThan(0);
  expect(selah.burned).toBeLessThan(0.3);
  await page.screenshot({ path: 'test-results/proof-desktop-step3.png' });
});

test('the field rolls the active line from The Threshold toward The Mark, and a finger can drag a stone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await bootTablets(page);
  const geo = () => page.evaluate(() => {
    const st = document.getElementById('tablets-stage').getBoundingClientRect();
    const line = document.getElementById('tablets-slot').closest('.tablets-gap-line');
    const lr = line.getBoundingClientRect();
    const mid = el => { const r = el.getBoundingClientRect(); return (r.top + r.height / 2 - st.top) / st.height; };
    return { line: (lr.top + lr.height / 2 - st.top) / st.height, mark: mid(document.querySelector('.tablets-mark-row')),
      entry: mid(document.querySelector('.tablets-entry-line')), rise: window.tabletsRiseOf() };
  });
  /* The roll eases toward its target; on a loaded machine the first frames are slow, so let it settle. */
  await page.waitForFunction(() => {
    const win = document.getElementById('tablets-roll'), verse = document.getElementById('tablets-verse');
    return Math.abs(R.tabletRollY - window.tabletsRollTarget(win.clientHeight, window.tabletsActiveLineTop(verse), window.tabletsRiseOf())) < 4;
  }, null, { timeout: 5000 });
  const fresh = await geo();
  expect(fresh.mark).toBeCloseTo(0.45, 2);
  expect(fresh.entry).toBeCloseTo(0.74, 2);
  /* The line sits where the rise puts it, within 3% of the field. */
  expect(Math.abs(fresh.line - (0.74 - 0.29 * fresh.rise))).toBeLessThan(0.03);
  await page.waitForFunction(() => window.tabletsRiseOf() > 0.6, null, { timeout: 8000 });
  await page.waitForTimeout(250);
  const late = await geo();
  expect(late.line).toBeLessThan(fresh.line - 0.12);
  expect(Math.abs(late.line - (0.74 - 0.29 * late.rise))).toBeLessThan(0.03);

  const drag = await page.evaluate(() => {
    R.tabletClock = R.tabletClockMax;
    const a = window.tabletsGapBlank().a;
    const b = Array.from(document.querySelectorAll('#tablets-grid .tablets-stone')).find((x) => x.dataset.word === a);
    const br = b.getBoundingClientRect(), sr = document.getElementById('tablets-slot').getBoundingClientRect();
    const ev = (t, x, y) => new PointerEvent(t, { bubbles: true, cancelable: true, pointerType: 'touch', pointerId: 3, clientX: x, clientY: y });
    b.dispatchEvent(ev('pointerdown', br.left + 8, br.top + 8));
    window.dispatchEvent(ev('pointermove', sr.left + sr.width / 2, sr.top + sr.height / 2));
    window.dispatchEvent(ev('pointerup', sr.left + sr.width / 2, sr.top + sr.height / 2));
    return { resolving: !!R.tabletResolving, correct: R.correct || 0 };
  });
  expect(drag.resolving).toBe(true);
  expect(drag.correct).toBe(1);
  await page.screenshot({ path: 'test-results/proof-desktop-field.png' });
});

test('NKJV tablets fill all six stones', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await bootTablets(page);
  const nkjv = await page.evaluate(() => {
    SAVE.set.translation = 'nkjv';
    if (typeof Edition !== 'undefined' && Edition.activateEdition) Edition.activateEdition('nkjv');
    startRun('tablets', 'watchman');
    return {
      edition: Edition.getEdition(),
      decoys: Tablets.chapter('psalm23').blanks[0].d.length,
      stones: document.querySelectorAll('#tablets-grid .tablets-stone').length,
      answer: Tablets.chapter('psalm23').blanks[0].a
    };
  });
  expect(nkjv.edition).toBe('nkjv');
  expect(nkjv.decoys).toBe(5);
  expect(nkjv.stones).toBe(6);
  expect(nkjv.answer).toBe('want');
  await page.screenshot({ path: 'test-results/proof-desktop-nkjv.png' });
});

test('a timeout spends a lamp and pushes back; the tutorial climbs and refills', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 });
  await bootTablets(page);

  const timeout = await page.evaluate(() => {
    R.tabletClock = 0.05;
    window.tabletsBurnSand(0.1);
    return {
      miss: R.tabletMiss,
      ended: R.ended,
      timeout: !!R.tabletTimeout,
      rise: window.tabletsRiseOf(),
      clock: R.tabletClock,
      cracked: (document.getElementById('tablets-lamps').innerHTML.match(/cracked/g) || []).length,
      lampLeft: document.getElementById('tablets-lamps').dataset.lampsLeft
    };
  });
  expect(timeout.miss).toBe(1);
  expect(timeout.ended).toBe(false);
  expect(timeout.timeout).toBe(false);
  expect(timeout.rise).toBeCloseTo(0.55, 6);
  expect(timeout.clock).toBeCloseTo(5.5 * 0.45, 6);
  expect(timeout.cracked).toBe(1);
  expect(timeout.lampLeft).toBe('2');
  await page.waitForTimeout(60);
  await page.screenshot({ path: 'test-results/proof-mobile-timeout.png' });

  await page.evaluate(() => startRun('tablets', 'watchman', { tabletChapter: 'prayer', tabletTutorial: true }));
  await page.waitForTimeout(120);
  const tutorialStart = await page.evaluate(() => ({
    clock: R.tabletClock,
    max: R.tabletClockMax,
    rise: window.tabletsRiseOf(),
    pace: document.getElementById('tablets-pace').textContent
  }));
  expect(tutorialStart.max).toBeCloseTo(11.5, 6);
  expect(tutorialStart.clock).toBeGreaterThan(11.2);
  expect(tutorialStart.pace).toBe('0.5×');

  await page.waitForTimeout(1400);
  const climbed = await page.evaluate(() => ({ clock: R.tabletClock, rise: window.tabletsRiseOf() }));
  expect(climbed.clock).toBeLessThan(tutorialStart.clock - 1.2);
  expect(climbed.rise).toBeGreaterThan(0.08);

  const refill = await page.evaluate(() => {
    const before = R.tabletMiss;
    R.tabletClock = 0.05;
    window.tabletsBurnSand(0.1);
    return { clock: R.tabletClock, miss: R.tabletMiss, before, ended: R.ended };
  });
  expect(refill.clock).toBeCloseTo(11.5, 6);
  expect(refill.miss).toBe(0);
  expect(refill.before).toBe(0);
  expect(refill.ended).toBe(false);
  await page.waitForTimeout(80);
  await page.screenshot({ path: 'test-results/proof-mobile-tutorial.png' });

  proof.mobile = { timeout, tutorialStart, climbed, refill };
  fs.writeFileSync('test-results/proof-values.json', JSON.stringify(proof, null, 2));
});
