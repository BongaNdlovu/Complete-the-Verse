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

test('the 1.0x clock climbs to The Mark and the speed control stays above the backdrop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await bootTablets(page);
  await expect(page.locator('#v-tablets')).toHaveClass(/has-library-bg/, { timeout: 8000 });

  const header = await page.evaluate(() => {
    const top = document.querySelector('#v-tablets .tablets-top');
    const active = document.querySelector('#tablets-speeds .tablets-speed-pill.on');
    const style = getComputedStyle(top);
    return { position: style.position, zIndex: style.zIndex, text: active ? active.textContent : '' };
  });
  expect(header.position).toBe('relative');
  expect(header.zIndex).toBe('2');
  expect(header.text).toBe('1.0×');
  await expect(page.locator('#tablets-speed-normal')).toBeVisible();

  const before = await page.evaluate(() => {
    R.proofStart = performance.now();
    return {
      clock: R.tabletClock,
      max: R.tabletClockMax,
      rise: window.tabletsRiseOf(),
      marker: parseFloat(document.getElementById('tablets-ladder-marker').style.top)
    };
  });
  expect(before.max).toBeCloseTo(6.5, 6);
  await page.waitForFunction(() => R.tabletClock <= 0.65, null, { timeout: 10000 });
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
  expect(projectedFullClimb).toBeGreaterThan(5.8);
  expect(projectedFullClimb).toBeLessThan(7.2);
  expect(after.rise).toBeGreaterThan(0.88);
  expect(after.marker).toBeLessThan(before.marker);

  await page.evaluate(() => window.tabletsShiftSpeed(1, false));
  const faster = await page.evaluate(() => ({
    saved: SAVE.set.tabletSpeed,
    max: R.tabletClockMax,
    rise: window.tabletsRiseOf(),
    label: document.querySelector('#tablets-speeds .tablets-speed-pill.on').textContent
  }));
  expect(faster.saved).toBe('fast');
  expect(faster.max).toBeCloseTo(4.5, 6);
  expect(faster.rise).toBeCloseTo(after.rise, 6);
  expect(faster.label).toBe('1.5×');

  proof.desktop = { before, after, rate, projectedFullClimb, faster };
  await page.screenshot({ path: 'test-results/proof-desktop-clock.png' });
});

test('drag-to-fill, golden verse and Chronos work on the live run', async ({ page }) => {
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

  const golden = await page.evaluate(() => {
    startRun('tablets', 'watchman');
    R.tabletIdx = 4;
    window.paintTabletsTablet();
    return { badge: !document.getElementById('tablets-golden').hidden, field: document.getElementById('tablets-ms').classList.contains('golden-blank') };
  });
  expect(golden.badge).toBe(true);
  expect(golden.field).toBe(true);

  const chronos = await page.evaluate(() => {
    R.tabletIdx = 0;
    window.paintTabletsTablet();
    R.powers.chronos = 2;
    R.chronosLeft = 0;
    window.tabletsChronos();
    return { left: R.chronosLeft, charges: R.powers.chronos, frozen: R.tabletClock };
  });
  expect(chronos.left).toBe(4);
  expect(chronos.charges).toBe(1);
  expect(chronos.frozen).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/proof-desktop-step3.png' });
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
  expect(timeout.clock).toBeCloseTo(2.925, 6);
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
    speed: document.querySelector('#tablets-speeds .tablets-speed-pill.on').textContent,
    disabled: document.getElementById('tablets-speed-meditative').disabled
  }));
  expect(tutorialStart.max).toBeCloseTo(11.5, 6);
  expect(tutorialStart.clock).toBeGreaterThan(11.2);
  expect(tutorialStart.speed).toBe('0.5×');
  expect(tutorialStart.disabled).toBe(true);

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
