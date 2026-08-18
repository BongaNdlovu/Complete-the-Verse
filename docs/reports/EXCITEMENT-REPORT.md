# Complete the Verse — Action & Excitement Report

**Date:** 2026-08-16
**Build:** `index.html` · production `https://complete-the-verse.vercel.app/`
**Basis:** Read the live source (`js/game.js` ~4,400 lines, `js/pilgrimage.js`, `index.html`, and the existing reports), not a playtest. Claims below cite the actual systems as they are written today.

---

## 1. The honest diagnosis

The game already *owns* the language of action — a biblical-thriller tone, a momentum meter, an Overdrive state, five cinematic set pieces, a heartbeat/tick pressure soundtrack, screen flash, shake, ember particles, a Three.js sky. On paper it is stuffed with adrenaline machinery.

It still feels flat because **the machinery is mostly a readout, not a game.** Specifically:

| What exists | What the player actually feels |
|---|---|
| Momentum meter (Cold Start → Overdrive) | A bar that fills. No decision, no moment where it *matters*. |
| Overdrive at streak 12 | A CSS class toggle, double clock bonus (an invisible number), and one silent lifeline refill. Nothing you choose, nothing you risk. |
| Streak → ×2…×5 multiplier | A badge that says `×3`. Correct answers tick up a score you can't spend and never lose. |
| Set pieces (Rapid/Lockdown/Missing/No-Chance/Reconstruct) | Genuinely good — but they fire at **6 of 36 sites**. The other 30 stops are six identical multiple-choice questions, two typed, and a wall. |
| Timer ring + heartbeat | The *only* real threat in the game, and it is abstract — a shrinking circle with no face and no memory. |
| Powers (Selah / Illuminate / Wind) | Buttons that modify numbers. No clutch, no drama. |
| Lives ("Lamps") | A row of SVGs. Losing one changes a number; nothing else happens. |

Two root causes:

1. **There is no risk/reward.** Nothing in the game asks the player to make a bet. The streak only ever goes up (or silently resets to zero). There is no "cash out vs. keep riding," no "stake my run," no near-miss save. Action games run on *decisions with a downside*; this game has none.

2. **The pace has dead air.** A correct answer waits **1450 ms** (`afterRun(..., nextQuestion)`, `game.js:2733`) before the next verse appears. Six correct MC answers in a row = six full beats of *nothing happening*. The long pause is on the wrong side of the loop — you want wrong answers to pause (so the miss stings and teaches), and correct answers to *chain*.

The fix is not "make it faster" — the verse must stay readable, and the teaching core (SRS, typed recall) must not be gutted. The fix is to **put decisions, consequences, and spikes into the loop that already exists.**

---

## 2. The five levers that create action in a memory game

A recall game can't be a twitch shooter, but it *can* hit these five levers:

| # | Lever | What it means here | Status today |
|---|---|---|---|
| 1 | **Risk / reward** | Give the player a bet: ride the streak or bank it, stake a life, double-or-nothing. | Missing entirely. |
| 2 | **An antagonist** | The clock is abstract. Give the run a face that *gains ground*. | Only the ring; no pursuer, no rival. |
| 3 | **Chain flow** | Correct answers should machine-gun forward; misses should pause. | Backwards — correct waits 1450 ms, miss is quick. |
| 4 | **Variety within a run** | A site should be a *mix* of mechanics, not 6 identical MCs + 2 typed. | 30/36 sites are monotone. |
| 5 | **Payoff / juice** | Winning and losing should *hit* — not just update a number. | Flash/shake exist; no escalation, no weight. |

Every move below maps to one of these five levers.

---

## 3. Concrete moves (ranked by impact ÷ effort)

### Tier 1 — Quick wins (hours, not days)

**M1 · Kill the dead air on correct answers.** *(Lever 3)*
Drop the correct-answer advance from 1450 ms to ~450–600 ms (`game.js:2733`). Pop score, streak, multiplier and momentum in that window. Keep the *long* pause only on wrong answers — show the reveal/scar and let the miss sting. This single change converts a correct streak into a chain reaction, which is 80% of what players mean by "action-packed."
*Done when:* six correct answers in a row feel like one continuous motion, not six tap-tap-wait cycles.

**M2 · Escalate per-answer feedback with the combo.** *(Lever 5)*
The heartbeat/tick currently responds only to *time left* (`Director.pressure`), never to *how hot you are*. Make the SFX/visual layer climb with the streak — the tick sharpens at ×2, a sub-bass hit at ×3, a gold burst on the verse at ×4, a full stamp at Overdrive. The momentum classes (`momentum-1…4`) already exist in the DOM; drive audio off them.
*Done when:* a player can *hear* and *see* they're at ×4 without looking at the HUD.

**M3 · Make losing a life land.** *(Lever 5)*
A wrong answer should shatter something visible: red flash + the lamp SVG breaking + the streak meter visibly collapsing to zero (today `R.streak=0` just re-renders silently, `game.js:2735`). Add a one-line voice sting ("The lamp fails."). Consequences that *look* like consequences create tension far out of proportion to their code cost.

**M4 · Overdrive entrance.** *(Lever 5)*
Hitting streak 12 should be an *event*: screen shake + gold burst + a full-screen "OVERDRIVE" stamp + the existing voice line. Today it's a CSS class flip and a spoken sentence (`game.js:672-678`). Make the loudest state in the game actually loud.

### Tier 2 — High-impact features (days)

**M5 · Overdrive becomes a choice, not a status.** *(Lever 1 — the single biggest gap)*
When you reach streak 12, instead of silently activating, the game *asks*: **"Ride the fire, or bank it?"**
- **Bank** = cash the streak as a score lump, reset to ×1, keep going safe.
- **Ride** = the next N verses pay 2× (on top of ×5), but *one miss costs an extra life* and drops you to Cold Start.

This turns the momentum meter from a readout into a *gambling moment* — the one thing that reliably produces adrenaline in a knowledge game. The infrastructure is all there (`inOverdrive`, `overdriveReward`, `overdriveGift`); it's a decision wrapper, not new systems.

**M6 · Personify the clock as a pursuer.** *(Lever 2)*
Give the Pilgrimage a "Chaser" — a visual that closes in as the timer drains and, critically, **gains ground permanently** when you hesitate or miss (a permanent pressure bump for the next few questions). The pressure tiering (`pressure-3/5/7`) already exists; it just needs a face and a memory. This converts the abstract ring into a threat you can *feel gaining on you*, which is what "action" is.

**M7 · Minibosses at arc midpoints.** *(Levers 2 + 4)*
Set pieces are the game's best content but they fire at only 6/36 sites. Add a **two-part combo event** (e.g. "Lockdown → Rapid Recall") at the midpoint of each arc, reusing the existing `SetPieces.launch` machinery with a 2-stage `count`. Now every ~4 sites has a spike instead of every ~6, and the road *breathes* — calm, calm, spike — instead of droning.

**M8 · A speed round inside each site.** *(Lever 4)*
Today a site is 6 identical MC + 2 typed + (maybe) a finale. Slip one **3-second "swift" question** into the middle of each site — a single fast-pick where locking under 1.5 s triggers a "Swift" flash (the `R.fast` counter and Swift seal already exist; just surface them *in the moment*). The mechanic change keeps a site from feeling like eight copies of the same tap.

### Tier 3 — Later (needs design or server work)

**M9 · Rival ghosts on the road.** *(Lever 2)*
`fetchGhosts` exists and is unused; the only ghost today is your own local PB. Seed a "previous pilgrim" rival (a friend's run or a curated pace-setter) that races you site-by-site. Competitive without a new mode — but it needs server-trusted scores first (the report's P1-#12), so it's correctly last.

**M10 · Mixed barrage for late arcs.** *(Lever 4)*
Past Jerusalem, blend MC + typed + fragment + passage in the same 8, so the road itself gets more chaotic as you go east — the mechanical mirror of the "clock closes" theme. Bind to the existing `tierFor`/`clockFor` ramp in `pilgrimage.js`.

**M11 · Relic armor.** *(Lever 1)*
Relics currently do nothing to play (flagged in the prior report). Let a held relic absorb one miss per site — a *permanent* resource you spend on a *temporary* save, which finally gives relics gameplay weight and gives the player a real reason to care about the cabinet.

---

## 4. The "first 48 hours" plan

Do these in one sitting, in this order — each is small, and together they change the *feel* without touching the teaching core:

1. **M1** (chain flow) + **M3** (life-loss weight) — the loop immediately stops feeling like a waiting room.
2. **M2** + **M4** (combo escalation + Overdrive entrance) — the states the game already has become loud.
3. **M5** (Overdrive choice) — the first real *decision*, the moment the game stops being a passive meter and becomes a bet.
4. **M8** (speed round) — injects variety cheaply, and **M7** (minibosses) if there's time, since it reuses `SetPieces.launch`.

Ship that, then play Ur → Haran on a phone. If it still feels flat, the problem is M6 (the pursuer) — add it next.

---

## 5. What not to do

- **Don't add a seventh mode.** Three is already the right hall; the excitement gap is *inside* the modes, not between them.
- **Don't make it a twitch game.** The verse must stay readable and the typed-recall/SRS core is the game's reason to exist. "Action" means spikes and decisions, not a faster metronome across every question.
- **Don't blanket the road in set pieces.** A finale at every stop stops being a finale (the code already says this — `game.js:832-834`). Keep the calm/dossier rhythm; the spikes are what make the calm matter.
- **Don't buy more spectacle first.** Three.js sky polish, more particles, another music bed — cosmetic action reads as a gimmick while the loop is flat. Fix the loop (M1–M5) before any of it.
- **Don't gut the momentum reset's fairness.** Adding a downside to Overdrive (M5) must be *opt-in* — a new player on Watchman must never lose a life they didn't bet.

---

## 6. How to verify (feel checks, not test suites)

The 23 Node suites never open a browser, so verify these by hand:

1. Chain six correct answers — it should feel like one motion, with the score and streak climbing audibly. If there's a beat of dead air after each correct, M1 isn't done.
2. Miss on purpose — the streak collapse and lamp-shatter should *hurt* to watch. If you barely notice, M3 isn't done.
3. Reach streak 12 — the game should *stop and ask* "ride or bank," not just flip a class. If Overdrive still feels automatic, M5 isn't done.
4. Watch the clock at low time — it should feel like something is *coming for you*, not just a circle shrinking (M6).

---

*End of report.*
