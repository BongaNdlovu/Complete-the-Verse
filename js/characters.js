/* ==================================================================
   CHARACTERS — player scholars (start) + unlockable Bible skins.

   Scholars are ordinary students of Scripture: always free, named by
   the player. Biblical figures unlock as equipable skins (profile +
   map token) as the road is walked.

   Art: assets/characters/<id>/{portrait,token}.png
   ================================================================== */

var SCHOLARS = [
  {
    id: "amina",
    kind: "scholar",
    name: "Amina Okonkwo",
    short: "Amina",
    nationality: "Nigerian",
    gender: "f",
    blurb: "A careful reader from Lagos, trained in Hebrew and history.",
    unlock: null,
    portrait: "assets/characters/amina/portrait.png",
    token: "assets/characters/amina/token.png"
  },
  {
    id: "elias",
    kind: "scholar",
    name: "Elias Papadopoulos",
    short: "Elias",
    nationality: "Greek",
    gender: "m",
    blurb: "An Athens classicist who still walks with a field notebook.",
    unlock: null,
    portrait: "assets/characters/elias/portrait.png",
    token: "assets/characters/elias/token.png"
  },
  {
    id: "soojin",
    kind: "scholar",
    name: "Soo-jin Park",
    short: "Soo-jin",
    nationality: "Korean",
    gender: "f",
    blurb: "A Seoul linguist who maps KJV cadence against the Hebrew.",
    unlock: null,
    portrait: "assets/characters/soojin/portrait.png",
    token: "assets/characters/soojin/token.png"
  },
  {
    id: "yusef",
    kind: "scholar",
    name: "Yusef Al-Hakim",
    short: "Yusef",
    nationality: "Egyptian",
    gender: "m",
    blurb: "A Cairo historian of the Near East and the long road.",
    unlock: null,
    portrait: "assets/characters/yusef/portrait.png",
    token: "assets/characters/yusef/token.png"
  },
  {
    id: "lucia",
    kind: "scholar",
    name: "Lúcia Mendes",
    short: "Lúcia",
    nationality: "Brazilian",
    gender: "f",
    blurb: "A São Paulo theologian who traces the prophets through Portuguese Bibles.",
    unlock: null,
    portrait: "assets/characters/lucia/portrait.png",
    token: "assets/characters/lucia/token.png"
  },
  {
    id: "priya",
    kind: "scholar",
    name: "Priya Sharma",
    short: "Priya",
    nationality: "Indian",
    gender: "f",
    blurb: "A Delhi Hebraist who compares KJV cadence with the Sanskrit of her home.",
    unlock: null,
    portrait: "assets/characters/priya/portrait.png",
    token: "assets/characters/priya/token.png"
  },
  {
    id: "thomas",
    kind: "scholar",
    name: "Thomas Hale",
    short: "Thomas",
    nationality: "English",
    gender: "m",
    blurb: "An Oxford reader of the Church Fathers with mud still on his boots.",
    unlock: null,
    portrait: "assets/characters/thomas/portrait.png",
    token: "assets/characters/thomas/token.png"
  },
  {
    id: "dawit",
    kind: "scholar",
    name: "Dawit Bekele",
    short: "Dawit",
    nationality: "Ethiopian",
    gender: "m",
    blurb: "An Addis Ababa scholar of Ge'ez scripture and the long African church.",
    unlock: null,
    portrait: "assets/characters/dawit/portrait.png",
    token: "assets/characters/dawit/token.png"
  }
];

/* Biblical figures — collectible skins. Not free at start. */
var BIBLE_FIGURES = [
  {
    id: "abram",
    kind: "figure",
    name: "Abram the Sojourner",
    short: "Abram",
    blurb: "A man who left a city he would never see again.",
    arc: "patriarchs",
    unlock: { arc: "patriarchs" },
    portrait: "assets/characters/abram/portrait.png",
    token: "assets/characters/abram/token.png"
  },
  {
    id: "moses",
    kind: "figure",
    name: "Moses the Lawbearer",
    short: "Moses",
    blurb: "The one who climbed the mountain and carried the word down.",
    arc: "exodus",
    unlock: { arc: "exodus" },
    portrait: "assets/characters/moses/portrait.png",
    token: "assets/characters/moses/token.png"
  },
  {
    id: "david",
    kind: "figure",
    name: "David the Psalmist",
    short: "David",
    blurb: "Shepherd, king, and the songs that outlasted both.",
    arc: "kingdom",
    unlock: { arc: "kingdom" },
    portrait: "assets/characters/david/portrait.png",
    token: "assets/characters/david/token.png"
  },
  {
    id: "esther",
    kind: "figure",
    name: "Esther the Queen",
    short: "Esther",
    blurb: "Courage in a foreign court, for such a time as this.",
    arc: "kingdom",
    unlock: { sites: 18 },
    portrait: "assets/characters/esther/portrait.png",
    token: "assets/characters/esther/token.png"
  },
  {
    id: "peter",
    kind: "figure",
    name: "Peter the Fisherman",
    short: "Peter",
    blurb: "Called off the boats; first to speak, first to fall, first to rise.",
    arc: "gospel",
    unlock: { arc: "gospel" },
    portrait: "assets/characters/peter/portrait.png",
    token: "assets/characters/peter/token.png"
  },
  {
    id: "john",
    kind: "figure",
    name: "John of Patmos",
    short: "John",
    blurb: "The last witness, on the island where the road ends.",
    arc: "gospel",
    unlock: { complete: true },
    portrait: "assets/characters/john/portrait.png",
    token: "assets/characters/john/token.png"
  }
];

var CHARACTERS = SCHOLARS.concat(BIBLE_FIGURES);

var Characters = (function () {
  var LIST = typeof CHARACTERS !== "undefined" ? CHARACTERS : [];
  var SCHOLAR_LIST = typeof SCHOLARS !== "undefined" ? SCHOLARS : [];
  var FIGURE_LIST = typeof BIBLE_FIGURES !== "undefined" ? BIBLE_FIGURES : [];

  function all() { return LIST; }
  function scholars() { return SCHOLAR_LIST; }
  function figures() { return FIGURE_LIST; }

  function byId(id) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].id === id) return LIST[i];
    return null;
  }

  function defaultScholarId() {
    return SCHOLAR_LIST.length ? SCHOLAR_LIST[0].id : null;
  }

  function defaultId() { return defaultScholarId(); }

  function isScholar(ch) { return !!(ch && ch.kind === "scholar"); }
  function isFigure(ch) { return !!(ch && ch.kind === "figure"); }

  /* Optional inject so Node tests share the same attached Pilgrimage. */
  var P_API = typeof Pilgrimage !== "undefined" ? Pilgrimage : null;
  function attach(api) {
    if (api && api.isComplete) P_API = api;
  }
  function api() {
    if (P_API) return P_API;
    if (typeof Pilgrimage !== "undefined") return Pilgrimage;
    return null;
  }

  /* progress is SAVE.pilgrim. */
  function isUnlocked(ch, progress) {
    if (!ch) return false;
    if (!ch.unlock) return true;
    var Pil = api();
    if (!Pil) return false;
    if (ch.unlock.complete) return Pil.isComplete(progress);
    if (ch.unlock.arc) {
      var st = Pil.arcStatus(progress, ch.unlock.arc);
      return !!(st && st.complete);
    }
    if (typeof ch.unlock.sites === "number") {
      return Pil.clearedCount(progress) >= ch.unlock.sites;
    }
    return true;
  }

  function unlockLabel(ch) {
    if (!ch || !ch.unlock) return "Available";
    if (ch.unlock.complete) return "Clear the whole road";
    if (typeof ch.unlock.sites === "number") {
      return "Clear " + ch.unlock.sites + " sites";
    }
    var Pil = api();
    if (ch.unlock.arc && Pil) {
      var a = Pil.arc(ch.unlock.arc);
      return a ? "Clear Arc " + a.n + " · " + a.name : "Locked";
    }
    return "Locked";
  }

  function resolve(id, progress) {
    var ch = byId(id);
    if (ch && isUnlocked(ch, progress)) return ch;
    for (var i = 0; i < SCHOLAR_LIST.length; i++) {
      if (isUnlocked(SCHOLAR_LIST[i], progress)) return SCHOLAR_LIST[i];
    }
    return SCHOLAR_LIST[0] || LIST[0] || null;
  }

  function newlyUnlockedFigures(before, after) {
    var out = [];
    FIGURE_LIST.forEach(function (ch) {
      if (!isUnlocked(ch, before) && isUnlocked(ch, after)) out.push(ch);
    });
    return out;
  }

  return {
    attach: attach,
    all: all,
    scholars: scholars,
    figures: figures,
    byId: byId,
    defaultId: defaultId,
    defaultScholarId: defaultScholarId,
    isScholar: isScholar,
    isFigure: isFigure,
    isUnlocked: isUnlocked,
    unlockLabel: unlockLabel,
    resolve: resolve,
    newlyUnlockedFigures: newlyUnlockedFigures
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SCHOLARS: SCHOLARS,
    BIBLE_FIGURES: BIBLE_FIGURES,
    CHARACTERS: CHARACTERS,
    Characters: Characters
  };
}
