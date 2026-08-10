/* Logic tests — spaced repetition scheduling.
   Pure arithmetic and ordering: no DOM, no clock, no randomness. */
const SRS = require("./js/srs");

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("  FAIL " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
}
function eq(name, got, want){ ok(name, got === want, {got, want}); }
function close(name, got, want, tol){ ok(name, Math.abs(got - want) < (tol || 1e-9), {got, want}); }

const T = 20000;   // an arbitrary "today"

/* ---------- dayNumber ---------- */
{
  const a = SRS.dayNumber(new Date(2026, 7, 2, 0, 0, 1));
  const b = SRS.dayNumber(new Date(2026, 7, 2, 23, 59, 59));
  const c = SRS.dayNumber(new Date(2026, 7, 3, 0, 0, 1));
  eq("same local day gives same day number", a, b);
  eq("next local day increments by one", c, a + 1);
  ok("day number is a positive integer", Number.isInteger(a) && a > 0, a);
  // Late evening must not already count as tomorrow — that is the bug that
  // silently breaks a daily streak for anyone west of UTC.
  eq("23:59 is still today", SRS.dayNumber(new Date(2026, 0, 15, 23, 59)),
     SRS.dayNumber(new Date(2026, 0, 15, 6, 0)));
}

/* ---------- gradeAnswer ---------- */
{
  eq("timeout grades 0", SRS.gradeAnswer({timedOut:true}), 0);
  eq("plain wrong grades 1", SRS.gradeAnswer({correct:false}), 1);
  eq("near miss grades 2", SRS.gradeAnswer({correct:false, near:true}), 2);
  eq("fast correct grades 5", SRS.gradeAnswer({correct:true, fraction:0.2}), 5);
  eq("normal correct grades 4", SRS.gradeAnswer({correct:true, fraction:0.6}), 4);
  eq("slow correct grades 3", SRS.gradeAnswer({correct:true, fraction:0.95}), 3);
  eq("correct with a lifeline grades 3", SRS.gradeAnswer({correct:true, fraction:0.1, usedPower:true}), 3);
  eq("typed-close correct grades 3", SRS.gradeAnswer({correct:true, fraction:0.1, near:true}), 3);
  // A hint must never be worth more than unaided recall, or the scheduler
  // rewards using lifelines.
  ok("lifeline never outscores unaided",
     SRS.gradeAnswer({correct:true, fraction:0.1, usedPower:true}) <
     SRS.gradeAnswer({correct:true, fraction:0.1}));
}

/* ---------- schedule: the SM-2 ladder ---------- */
{
  const c1 = SRS.schedule(null, 4, T);
  eq("first success has interval 1", c1.ivl, 1);
  eq("first success is due tomorrow", c1.due, T + 1);
  eq("first success counts one rep", c1.reps, 1);

  const c2 = SRS.schedule(c1, 4, T + 1);
  eq("second success jumps to 6 days", c2.ivl, 6);
  eq("second success due in 6", c2.due, T + 7);

  const c3 = SRS.schedule(c2, 4, T + 7);
  eq("third success multiplies by easiness", c3.ivl, Math.round(6 * c2.ef));
  ok("intervals grow", c3.ivl > c2.ivl, {c2:c2.ivl, c3:c3.ivl});
}

/* ---------- schedule: failure ---------- */
{
  let c = SRS.schedule(null, 5, T);
  c = SRS.schedule(c, 5, T + 1);
  c = SRS.schedule(c, 5, T + 7);
  const beforeEf = c.ef, beforeIvl = c.ivl;
  ok("a well-known verse has a long interval", beforeIvl > 6, beforeIvl);

  const lapsed = SRS.schedule(c, 1, T + 40);
  eq("a lapse resets the interval to 1", lapsed.ivl, 1);
  eq("a lapse makes it due tomorrow", lapsed.due, T + 41);
  eq("a lapse resets the rep count", lapsed.reps, 0);
  eq("a lapse is counted", lapsed.lapses, 1);
  ok("a lapse lowers easiness", lapsed.ef < beforeEf, {before:beforeEf, after:lapsed.ef});
}

/* ---------- schedule: bounds and purity ---------- */
{
  let c = SRS.freshCard();
  for(let i = 0; i < 40; i++) c = SRS.schedule(c, 0, T + i);
  ok("easiness never falls below the floor", c.ef >= SRS.MIN_EF, c.ef);
  close("easiness clamps exactly at the floor", c.ef, SRS.MIN_EF);

  let d = SRS.freshCard();
  for(let i = 0; i < 40; i++) d = SRS.schedule(d, 5, T + i);
  ok("interval is capped", d.ivl <= SRS.MAX_INTERVAL, d.ivl);

  const original = SRS.freshCard();
  const snapshot = JSON.stringify(original);
  SRS.schedule(original, 5, T);
  eq("schedule does not mutate its input", JSON.stringify(original), snapshot);

  const junk = SRS.schedule({ef:NaN, reps:0, ivl:0, due:0, lapses:0}, 4, T);
  ok("a corrupt easiness is repaired", isFinite(junk.ef) && junk.ef > 0, junk.ef);
}

/* ---------- isDue / overdueBy ---------- */
{
  ok("an unseen verse is due", SRS.isDue(null, T));
  ok("an unseen verse is due (fresh card)", SRS.isDue(SRS.freshCard(), T));
  const c = SRS.schedule(null, 4, T);          // due T+1
  ok("a scheduled verse is not due early", !SRS.isDue(c, T));
  ok("a scheduled verse is due on the day", SRS.isDue(c, T + 1));
  ok("a scheduled verse stays due after", SRS.isDue(c, T + 9));
  eq("overdue counts days past due", SRS.overdueBy(c, T + 4), 3);
  eq("not-yet-due is negative", SRS.overdueBy(c, T), -1);
}

/* ---------- queue ordering ---------- */
{
  const v = n => ({id:"v"+n, r:"Ref "+n});
  const verses = [v(1), v(2), v(3), v(4), v(5)];
  const cards = {
    v1: {ef:2.5, reps:2, ivl:10, due:T + 5,  lapses:0},  // not due
    v2: {ef:2.5, reps:2, ivl:10, due:T - 9,  lapses:0},  // very overdue
    v3: undefined,                                        // never seen
    v4: {ef:2.5, reps:2, ivl:10, due:T - 1,  lapses:0},  // just overdue
    v5: {ef:1.6, reps:0, ivl:1,  due:T - 3,  lapses:2}   // lapsed
  };
  const cardFor = x => cards[x.id];
  const q = SRS.buildQueue(verses, cardFor, T, 5, a => a);
  const ids = q.map(x => x.id);

  eq("most overdue leads the queue", ids[0], "v2");
  ok("all due verses precede unseen ones",
     ids.indexOf("v3") > ids.indexOf("v4") && ids.indexOf("v3") > ids.indexOf("v5"), ids);
  eq("not-yet-due comes last", ids[ids.length - 1], "v1");
  ok("a lapsed verse is treated as due, not as new",
     ids.indexOf("v5") < ids.indexOf("v3"), ids);

  eq("limit is respected", SRS.buildQueue(verses, cardFor, T, 2, a => a).length, 2);
  eq("due count sees the three due verses", SRS.dueCount(verses, cardFor, T), 3);
  eq("nothing is due far in the past", SRS.dueCount(verses, cardFor, T - 100), 0);
}

/* ---------- strength buckets ---------- */
{
  eq("no card is unseen", SRS.strength(null), "unseen");
  eq("a lapsed card reads lapsed", SRS.strength({reps:0, ivl:1, lapses:3, ef:2, due:0}), "lapsed");
  eq("an early card is learning", SRS.strength({reps:1, ivl:1, lapses:0, ef:2.5, due:0}), "learning");
  eq("a long-interval card is held", SRS.strength({reps:4, ivl:30, lapses:0, ef:2.5, due:0}), "held");
}

console.log((fail ? "FAIL" : "PASS") + " — srs · " + pass + " assertions passed" + (fail ? ", " + fail + " failed" : ""));
process.exit(fail ? 1 : 0);
