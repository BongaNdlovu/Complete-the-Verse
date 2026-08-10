/* ==================================================================
   EMPIRES — who held the ground when the story passed through.

   These outlines are SCHEMATIC and the atlas says so on screen. They
   are drawn to show the shape and reach of a power at one moment, not
   to survey a border — ancient empires did not have borders in the
   modern sense anyway, they had cores, tributaries and roads, and any
   line claiming otherwise is inventing precision.

   Modern national borders are a different matter: those can be exact,
   so the atlas takes them from a real reference tile layer rather than
   from anything hand-drawn here. Two layers, two honesties.

   Rings are [lat, lng] — the same order as coords in sites.js and what
   Leaflet's L.polygon expects — deliberately NOT GeoJSON's [lng, lat].
   This is also a .js file assigning a global rather than a .json file,
   because the game is opened straight off the disk and Chrome refuses
   to fetch() a local JSON from a file:// page. legacy-ids.js is a .js
   file for exactly the same reason.

   `at` is the site index the overlay is anchored to, used to fade one
   empire out and the next in as the journey advances.
   ================================================================== */

var EMPIRE_SHAPES = {

  /* Sumer and Akkad — the twin-river south, from the Gulf up to Mari. */
  ur3: [
    [29.8, 48.6], [30.6, 47.9], [31.4, 47.0], [32.4, 45.6], [33.3, 44.6],
    [34.4, 43.4], [34.9, 41.6], [34.2, 40.8], [33.2, 42.3], [32.0, 43.6],
    [31.0, 44.8], [30.1, 45.9], [29.5, 47.2]
  ],

  /* Canaanite city-states — the coastal strip and the highland spine. */
  canaan: [
    [33.7, 35.1], [33.5, 36.3], [32.8, 36.1], [32.0, 35.8], [31.3, 35.6],
    [30.9, 35.2], [31.1, 34.4], [31.9, 34.6], [32.7, 34.9], [33.3, 35.1]
  ],

  /* Egypt, New Kingdom — the Nile, the delta, Sinai, and the Levant
     coast held as far as Byblos at its height. */
  egypt: [
    [31.6, 29.8], [31.4, 32.5], [31.1, 34.3], [32.4, 34.9], [33.6, 35.4],
    [34.0, 36.0], [33.2, 35.9], [31.7, 35.2], [30.4, 34.6], [29.2, 34.9],
    [27.8, 34.1], [25.5, 34.5], [23.5, 33.2], [22.0, 31.9], [23.8, 32.5],
    [26.5, 31.7], [28.8, 30.7], [30.5, 30.2]
  ],

  /* Israel entering Canaan — the land of the twelve tribes, both banks. */
  israel: [
    [33.4, 35.3], [33.3, 36.0], [32.6, 36.3], [31.8, 36.1], [31.2, 35.9],
    [30.8, 35.5], [31.0, 34.5], [31.9, 34.7], [32.8, 35.0], [33.2, 35.2]
  ],

  /* The United Monarchy — Dan to Beersheba, plus the Transjordan and the
     Aramean reach north toward the Euphrates under David and Solomon. */
  monarchy: [
    [34.6, 36.4], [34.4, 38.6], [33.6, 39.0], [32.9, 38.0], [31.9, 36.9],
    [30.8, 36.1], [29.6, 35.1], [30.9, 34.4], [31.9, 34.6], [32.9, 35.0],
    [33.6, 35.2], [34.2, 35.9]
  ],

  /* The Assyrian Empire at its greatest reach — Anatolia's rim to the
     Gulf, and west to the edge of Egypt. */
  assyria: [
    [38.2, 36.4], [38.4, 40.5], [37.9, 44.2], [36.6, 46.8], [34.8, 47.4],
    [32.6, 47.6], [30.4, 48.4], [29.4, 46.6], [30.4, 43.0], [31.4, 40.0],
    [30.6, 36.0], [29.6, 34.7], [31.2, 34.3], [32.6, 34.9], [34.4, 35.6],
    [36.2, 36.0], [37.4, 36.2]
  ],

  /* Neo-Babylon — Mesopotamia and the Levant, but not Anatolia and not
     the Iranian plateau. */
  babylon: [
    [37.2, 38.0], [37.4, 42.0], [36.6, 44.8], [34.6, 46.6], [32.4, 47.4],
    [30.2, 48.3], [29.3, 46.4], [30.2, 43.0], [31.2, 39.6], [30.4, 36.0],
    [29.5, 34.7], [31.2, 34.3], [32.8, 34.9], [34.6, 35.7], [36.0, 36.4],
    [36.8, 37.2]
  ],

  /* Achaemenid Persia — the largest of them, Indus to Libya. */
  persia: [
    [41.8, 26.4], [42.6, 32.0], [42.4, 40.0], [41.2, 48.0], [40.4, 56.0],
    [38.0, 64.0], [35.4, 70.0], [31.0, 71.4], [27.0, 67.0], [25.2, 60.0],
    [25.8, 54.0], [27.6, 50.0], [29.6, 47.8], [29.2, 44.0], [30.0, 38.0],
    [29.4, 34.6], [31.2, 34.2], [31.4, 32.2], [30.6, 28.0], [31.4, 25.6],
    [33.6, 26.0], [36.0, 35.8], [38.6, 33.0], [40.4, 28.6]
  ],

  /* The Roman Empire under Nero — the whole Mediterranean rim. */
  rome: [
    [55.0, -3.0], [54.0, 2.0], [51.5, 7.0], [49.5, 12.0], [48.0, 17.0],
    [46.5, 23.0], [45.0, 29.0], [44.5, 34.0], [41.5, 36.5], [39.5, 41.0],
    [37.0, 40.0], [34.5, 38.5], [32.0, 35.5], [31.2, 34.2], [31.4, 32.2],
    [30.8, 28.0], [30.2, 22.0], [32.0, 16.0], [33.5, 11.0], [36.0, 8.0],
    [36.8, 3.0], [35.4, -2.0], [35.8, -6.0], [38.5, -9.5], [43.0, -9.0],
    [46.0, -2.0], [48.5, -4.5], [50.5, 1.0], [52.0, 1.8]
  ]
};

/* Which overlay is showing when you stand at each site, and the label
   that goes with it. Keyed by site id so the two files stay legible
   independently — sites.js already names its empire, this is the shape
   and the moment. */
var EMPIRE_ORDER = [
  "ur3", "canaan", "egypt", "israel", "monarchy", "assyria", "babylon", "persia", "rome"
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { EMPIRE_SHAPES: EMPIRE_SHAPES, EMPIRE_ORDER: EMPIRE_ORDER };
}
