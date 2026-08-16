/**
 * Three.js is out of the product. Relics and the vault stay 2D.
 * Run: node sky3d.test.js
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const { readEngine } = require("./scripts/engine-source");
const game = readEngine(root);
const css = fs.readFileSync(path.join(root, "css", "game.css"), "utf8");

assert(!/type="importmap"/.test(index), "no Three.js import map");
assert(!/sky3d\.js/.test(index), "index does not load sky3d");
assert(!/relics3d\.js/.test(index), "index does not load relics3d");
assert(!/sky-model\.js/.test(index), "index does not load sky-model");
assert(!/relic-model\.js/.test(index), "index does not load relic-model");
assert(!/vendor\/three/.test(index), "index does not pull vendored three");
assert(!/import\(["']\.\/sky3d\.js["']\)/.test(game), "game.js does not import sky3d");
assert(!/import\(["']\.\/relics3d\.js["']\)/.test(game), "game.js does not import relics3d");
assert(!/window\.Sky3D/.test(game), "game.js does not talk to Sky3D");
assert(!/Relics3D/.test(game), "game.js does not mount Relics3D");
assert(!/SkyModel/.test(game), "game.js does not use SkyModel");
assert(!/#sky3d/.test(css), "no WebGL sky canvas CSS");
assert(/#backdrop/.test(css), "CSS backdrop wash remains");
assert(/function showArtifactReveal/.test(game), "2D relic reveal remains");
assert(/Artifacts\.imagePath/.test(game), "reveal uses the illustrated PNG");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — three.js removed · vault and relics are 2D");
