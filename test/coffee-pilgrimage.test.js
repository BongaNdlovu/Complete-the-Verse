/**
 * Coffee Pilgrimage — Comprehensive Product Test Suite
 * Tests all requirements from plans/coffee-pilgrimage.md
 * Run: node coffee-pilgrimage.test.js
 */

const fs = require("fs");
const path = require("path");
const S = require("../js/sites");
const P = require("../js/pilgrimage");
const SRS = require("../js/srs");
const Recall = require("../js/recall");
const Polish = require("../js/polish");
const Cinematic = require("../js/cinematic");
const { loadBank } = require("../scripts/load-bank");
const { readEngine } = require("../scripts/engine-source");

const bank = loadBank();
P.attach({ SITES: S.SITES, ARCS: S.ARCS, VERSES: bank.VERSES });

const ROOT = require("../scripts/repo-root");
let pass = 0, fail = 0;
const fails = [];

function ok(name, cond, extra) {
  if (cond) {
    pass++;
  } else {
    fail++;
    const msg = "FAIL: " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : "");
    fails.push(msg);
    console.log("  " + msg);
  }
}

function eq(name, got, want) {
  ok(name, got === want, { got: got, want: want });
}

const engineSrc = readEngine(ROOT);

{
  ok("Boot launches directly into pilgrimage on current site",
    /function enterCoffeePath/.test(engineSrc) && /startRun\("pilgrimage"/.test(engineSrc));
  ok("Boot does not route straight to menu",
    !/if\(currentView==="boot"\)\{\s*go\("menu"\);/i.test(engineSrc));
  ok("core modes are discoverable from the public menu",
    /daily:\{\s*key:"daily"(?![^}]*hidden:true)/.test(engineSrc) &&
    /trial:\{\s*key:"trial"(?![^}]*hidden:true)/.test(engineSrc) &&
    /blitz:\{\s*key:"blitz"(?![^}]*hidden:true)/.test(engineSrc) &&
    /endless:\{\s*key:"endless"(?![^}]*hidden:true)/.test(engineSrc) &&
    /practice:\{\s*key:"practice"(?![^}]*hidden:true)/.test(engineSrc));
  ok("MENU_GROUPS keeps the Pilgrimage first and adds useful paths",
    /MENU_GROUPS\s*=\s*\[[\s\S]*The Road[\s\S]*pilgrimage[\s\S]*Today[\s\S]*daily[\s\S]*Practice[\s\S]*recall[\s\S]*Challenges/.test(engineSrc));
}

/* ==================================================================
   2. THE COFFEE UNIT (8 VERSES, 8-12 MINUTES)
   ================================================================== */
{
  const urSite = P.site("ur");
  const urDraw = P.drawSite("ur");
  eq("Ur draw contains exactly 8 verses", urDraw.verses.length, 8);

  const haranDraw = P.drawSite("haran");
  eq("Haran draw contains exactly 8 verses", haranDraw.verses.length, 8);

  const patmosDraw = P.drawSite("patmos");
  eq("Patmos draw contains exactly 8 verses", patmosDraw.verses.length, 8);

  // Clock scaling: read-time + road think-time
  const shortVerse = { q: "In the beginning", a: "God created", r: "Genesis 1:1" };
  const longVerse = {
    q: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have",
    a: "everlasting life",
    r: "John 3:16"
  };

  const urShortClock = P.verseClockFor(0, shortVerse);
  const urLongClock = P.verseClockFor(0, longVerse);
  ok("Long verse gives more read time than short verse", urLongClock > urShortClock, {
    short: urShortClock, long: urLongClock
  });

  const patmosShortClock = P.verseClockFor(45, shortVerse);
  ok("Patmos think time is colder than Ur think time for same verse", patmosShortClock < urShortClock, {
    ur: urShortClock, patmos: patmosShortClock
  });

  // Climax sites check
  ok("Sinai is a climax site", P.isClimaxSite("sinai"));
  ok("Jericho is a climax site", P.isClimaxSite("jericho"));
  ok("Nineveh is a climax site", P.isClimaxSite("nineveh"));
  ok("Babylon is a climax site", P.isClimaxSite("babylon"));
  ok("Golgotha is a climax site", P.isClimaxSite("golgotha"));
  ok("Patmos is a climax site", P.isClimaxSite("patmos"));
  ok("Ur is not a set-piece climax site", !P.isClimaxSite("ur"));
  ok("Haran is not a set-piece climax site", !P.isClimaxSite("haran"));
}

/* ==================================================================
   3. HONEST RETURN / SRS FOLD-IN INTO drawSite
   ================================================================== */
{
  const mockDueVerses = [
    { id: 9991, q: "Due verse 1", a: "Answer 1", b: "Genesis", t: 1 },
    { id: 9992, q: "Due verse 2", a: "Answer 2", b: "Genesis", t: 1 }
  ];

  const drawWithDue = P.drawSite("haran", {
    dueVerses: mockDueVerses,
    need: 8
  });

  eq("Draw with due verses still produces exactly 8 verses", drawWithDue.verses.length, 8);
  eq("Due verses were folded in", drawWithDue.dueFolded, 2);
  const hasDue1 = drawWithDue.verses.some(v => v.id === 9991);
  const hasDue2 = drawWithDue.verses.some(v => v.id === 9992);
  ok("Folded due verses are present in the drawn level", hasDue1 && hasDue2);
}

/* ==================================================================
   4. HABIT STREAK & DAY 7 SEVENTH LAMP REWARD
   ================================================================== */
{
  ok("DEFAULT_SAVE defines habit streak object",
    /habit:\s*\{\s*count:\s*0,\s*lastDate:\s*""/.test(engineSrc));
  ok("SEALS defines seventh-lamp seal",
    /id:\s*"seventh-lamp"/.test(engineSrc));
  ok("SEALS defines streak14 seal",
    /id:\s*"streak14"/.test(engineSrc));
  ok("SEALS defines streak30 seal",
    /id:\s*"streak30"/.test(engineSrc));

  // Cinematic module checks
  ok("Cinematic defines playSeventhLamp", typeof Cinematic.playSeventhLamp === "function");
  ok("Cinematic defines showComboStamp", typeof Cinematic.showComboStamp === "function");
  ok("Cinematic defines showComboCollapse", typeof Cinematic.showComboCollapse === "function");
  ok("Cinematic defines showOverdriveEntrance", typeof Cinematic.showOverdriveEntrance === "function");
  ok("Cinematic defines showColdPlaceToast", typeof Cinematic.showColdPlaceToast === "function");
  ok("Cinematic defines Web Audio synth chimes", typeof Cinematic.playSabbathChime === "function");
}

/* ==================================================================
   5. POST-PATMOS SPIRAL PROGRESSION
   ================================================================== */
{
  const blank = P.blankProgress();
  eq("New progress starts on Spiral Pass 1", P.spiralPass(blank), 1);

  const pass1 = P.passStandard(1);
  eq("Pass 1 is The Pilgrim", pass1.title, "The Pilgrim");
  eq("Pass 1 has 1 typed beat", pass1.typedCount, 1);

  const pass2 = P.passStandard(2);
  eq("Pass 2 is The Watchman", pass2.title, "The Watchman");
  ok("Pass 2 tightens standard", pass2.typedCount >= 3);

  const pass3 = P.passStandard(3);
  eq("Pass 3 is The Scribe", pass3.title, "The Scribe");
  eq("Pass 3 requires pure assembled recall", pass3.typedCount, 8);

  const nextPass = P.advanceSpiral(blank);
  eq("advanceSpiral increments pass count to 2", nextPass.pass, 2);
}

/* ==================================================================
   SUMMARY
   ================================================================== */
if (fail) {
  console.log("\nFAIL — coffee pilgrimage · " + pass + " passed · " + fail + " failed");
  process.exit(1);
} else {
  console.log("PASS — coffee pilgrimage · all " + pass + " assertions passed");
}
