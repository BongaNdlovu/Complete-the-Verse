/**
 * Phase A sky wiring — files, import map, Backdrop hooks.
 * Run: node sky3d.test.js
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const fails = [];
function assert(cond, msg) { if (!cond) fails.push(msg); }

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const game = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
const sky = fs.readFileSync(path.join(root, "js", "sky3d.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "game.css"), "utf8");

assert(fs.existsSync(path.join(root, "vendor", "three", "three.module.min.js")), "vendored three.module.min.js");
assert(fs.existsSync(path.join(root, "vendor", "three", "three.core.min.js")), "vendored three.core.min.js (module dependency)");
assert(/type="importmap"/.test(index), "import map present");
assert(/"three":\s*"\.\/vendor\/three\/three\.module\.min\.js"/.test(index), "import map points at vendor three");
assert(/type="module"\s+src="js\/sky3d\.js"/.test(index), "sky3d loaded as module");
assert(/window\.Sky3D/.test(sky) || /Sky3D/.test(sky), "Sky3D API exposed");
assert(/setPalette/.test(sky), "setPalette API");
assert(/syncFromSettings/.test(sky), "syncFromSettings API");
assert(/qualityAllows|quality-low|reduced/.test(sky), "respects reduced/low quality");
assert(/ShaderMaterial|uTop|uMid|uBot/.test(sky), "gradient sky shader");
assert(/Backdrop\.syncSky|syncSky\(\)/.test(game), "Backdrop.syncSky wired");
assert(/s\.setPalette|Sky3D/.test(game), "Backdrop talks to Sky3D");
assert(/#sky3d/.test(css), "sky canvas CSS");
assert(/body\.quality-low #sky3d/.test(css), "sky hidden on quality-low");

if (fails.length) {
  console.error("FAIL (" + fails.length + ")");
  fails.forEach((f) => console.error(" - " + f));
  process.exit(1);
}
console.log("PASS — sky3d · Phase A living vault wired");
