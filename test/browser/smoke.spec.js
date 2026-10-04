const { test, expect } = require('@playwright/test');

test.describe('Complete the Verse — Browser Smoke Test', () => {
  test('boots to the Hall in offline mode and completes a run to results without console errors', async ({ page }) => {
    /** @type {string[]} */
    const consoleErrors = [];
    /** @type {string[]} */
    const pageErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      pageErrors.push(err.message || String(err));
    });

    // Seed localStorage so the app bypasses first-time onboarding and opens the Hall cleanly in offline mode
    await page.addInitScript(() => {
      const seed = {
        v: 3,
        xp: 100,
        oil: 50,
        illumReserve: 3,
        runs: 1,
        best: { trial: 0, endless: 0, daily: 0, dailyByEdition: { kjv: 0, nkjv: 0 }, practice: 0, recall: 0, pilgrimage: 0, "pilgrim-recall": 0, blitz: 0, tablets: 0 },
        seals: [],
        life: { correct: 5, attempts: 5, bestStreak: 5, sdBest: 0, endlessBest: 0, dailyDone: 0, perfectActs: 0, typedExact: 0, typedAttempts: 0, reviewsDone: 0, sitesCleared: 1, arcsCleared: 0, blitzBest: 0, oilSpent: 0, oilEarned: 0, quickRewards: 0, quickRewardXP: 0, quickRewardOil: 0, illumRewards: 0, beatGoliathHeld: false, tabletHolds: 0 },
        tablets: { psalm23: { best: 0, held: false } },
        books: {},
        verse: {},
        srs: {},
        board: [],
        journal: [],
        ghosts: { pilgrimage: null, pilgrimageBySite: {}, trial: null, blitz: null },
        daily: { date: "", score: 0 },
        dailyByEdition: { kjv: { date: "", score: 0 }, nkjv: { date: "", score: 0 } },
        dailyStreak: { count: 0, lastDate: "", best: 0, celebrated: 0 },
        messagesSeen: ["2026-09-29-daily-update"],
        pendingDaily: null,
        habit: { count: 0, lastDate: "", lastDay: 0, best: 0, history: {} },
        pilgrim: { sites: { ur: { cleared: true, attempts: 1 } }, lastPlayed: "2026-10-04", started: Date.now(), usedIds: [] },
        artifacts: { unlocked: {}, seen: {} },
        set: {
          music: 0,
          sfx: 0,
          musicMute: true,
          sfxMute: true,
          quality: "low",
          qualityLocked: true,
          motion: "reduced",
          reduced: true,
          shake: false,
          voice: false,
          diff: "disciple",
          tutorialDone: true,
          tutorialSeen: true,
          tabletsTutorialDone: true,
          introPlayed: true,
          liveWeather: false,
          coldOpenDone: true,
          urPrologueDone: true,
          quiet: true,
          contrast: false,
          haptics: false,
          singleTap: true,
          translation: "kjv",
          translationChosen: true,
          character: "amina",
          scholarId: "amina",
          playerName: "Tester",
          profileDone: true,
          tabletStone: "sandstone",
          tabletTrial: false,
          vkb: false,
          noticeBox: {},
          characterDone: true
        }
      };
      localStorage.setItem('ctv_save_v3', JSON.stringify(seed));
    });

    // Route cloud-config to empty keys so the browser runs in offline/guest mode (no cloud login required)
    await page.route('**/js/cloud-config.js', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'var CLOUD_CONFIG = { url: "", anonKey: "" };'
      });
    });

    // 1. Navigate to the game root
    await page.goto('/');

    // 2. Wait for the Hall to become active
    const menuView = page.locator('#v-menu');
    await expect(menuView).toHaveClass(/on/, { timeout: 15000 });

    // Verify key Hall chrome is present
    await expect(page.locator('#v-menu .game-logo')).toBeVisible();
    await expect(page.locator('#modes')).toBeVisible();

    // 3. Start a practice run
    await page.evaluate(() => {
      // @ts-ignore
      window.startRun('practice', 'disciple');
    });

    // 4. Verify Play screen is active
    const playView = page.locator('#v-play');
    await expect(playView).toHaveClass(/on/, { timeout: 10000 });

    // Verse reference and choices container should be visible
    await expect(page.locator('#ref')).toBeVisible();
    await expect(page.locator('#opts')).toBeVisible();

    // 5. Interact with choices: click the first available answer button
    const firstAns = page.locator('#opts .ans').first();
    await expect(firstAns).toBeVisible({ timeout: 5000 });
    await firstAns.click();

    // 6. Complete the run to the results screen
    await page.evaluate(() => {
      // @ts-ignore
      window.endRun('clear');
    });

    // 7. Verify Results screen is active
    const resultsView = page.locator('#v-results');
    await expect(resultsView).toHaveClass(/on/, { timeout: 10000 });
    await expect(page.locator('#res-score')).toBeVisible();

    // 8. Assert zero console errors or uncaught exceptions occurred throughout
    expect(consoleErrors, `Console errors detected: ${consoleErrors.join('; ')}`).toEqual([]);
    expect(pageErrors, `Page errors detected: ${pageErrors.join('; ')}`).toEqual([]);
  });
});
