# Manual Smoke Verification Checklist — Complete the Verse v1.4

Per operator decision, automated headless browser smoke runner was skipped in favor of this verified 10-step manual browser test checklist.

---

### Prerequisites
- Open the application locally by opening `index.html` in a modern browser (Chrome, Firefox, Safari, or Edge) or serving via a local static web server.
- Open Developer Tools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`) to monitor Console and Network panels.

---

### 10-Step Verification Procedure

1. **First-Run Tutorial & "Walk to Ur" Flow**
   - Clear local storage or open an incognito window.
   - Boot into the game and tap to begin.
   - Verify the first-run tutorial modal displays the primary button **"Walk to Ur"** and secondary button **"Try the Drill"**.
   - Verify copy explains the 46-site pilgrimage and framed typed recall along the road.
   - Click "Walk to Ur" and confirm setup opens scholar profile and transitions smoothly to the Pilgrimage map centered near Ur.

2. **Pilgrimage Navigation & Site Draw**
   - Click site #1 (Ur of the Chaldees).
   - Verify site brief appears with accurate site scripture and description.
   - Start the level, verify audio ambience loads, answer the 8 site-specific verses, and verify progress saves cleanly.

3. **Menu Hall Four-Group Layout**
   - Return to the Main Hall (Menu).
   - Verify modes are cleanly arranged under 4 distinct section headers:
     - **The Road** (Pilgrimage)
     - **Today** (Daily Trial)
     - **Practice** (The Drill)
     - **Challenges** (Scripture Blitz, The Trial, Endless Gauntlet)
   - Verify no orphaned mode cards.

4. **Spaced Repetition Review Action ("Review N due")**
   - When verses are due for review, verify the Main Hall renders the active **"Review N due"** button.
   - Click the button and verify it immediately begins a practice drill seeded with due verses.
   - Verify that when 0 verses are due, the button is safely hidden.

5. **Study Hall Mastery & Review**
   - Navigate to Study Hall from the menu subnav.
   - Verify the 66-book mastery heatmap renders all books.
   - Verify the **"Review due"** button appears in the panel header when items are due and starts practice on click.
   - Test text search and book filter dropdowns.

6. **Results Screen & "Review Missed Verses" Action**
   - Complete any run (e.g. Trial or Practice) with at least 1 wrong answer.
   - On the results screen, verify the **"Review missed verses"** action button appears alongside "Study Missed".
   - Click "Review missed verses" and verify a practice drill begins seeded specifically with the missed verses.

7. **Scripture Blitz Verses Record Alignment**
   - Start Scripture Blitz mode.
   - Verify the countdown clock starts at 60s (+2s on correct, −4s on miss).
   - Finish the run and verify the results screen displays the record formatted in integer verses survived (e.g., `Scripture Blitz best — X verses`), matching `SAVE.best.blitz` and `SAVE.life.blitzBest`.

8. **Leaderboard Trust Status ("Honor system" label)**
   - Check the Daily and Blitz leaderboard headers and account chip.
   - When score submissions use the direct database fallback (Edge Function undeployed), verify the header and chip display `(Honor system)`.
   - Verify leaderboards load without console errors.

9. **Reliquary & Artifacts Viewer**
   - Navigate to Relics from the menu subnav.
   - Verify the counter displays `0 of 46 recovered` (or matching unlocked count).
   - Inspect artifact cards to verify 2D artwork and scripture metadata display properly.

10. **Installability & Manifest Metadata**
    - Inspect Web App Manifest in DevTools Application tab.
    - Confirm description reads `579 KJV verses, 66 books, a 46-site pilgrimage from Ur to Patmos.`.
    - Toggle DevTools offline and confirm the offline banner and the Local/Offline chip appear.
