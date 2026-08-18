/**
 * Split complete-the-verse monolith into index.html + css/ + js/
 * Strips the unused AI visual-system CSS block.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "complete-the-verse(1) (1).html");
const html = fs.readFileSync(SRC, "utf8");

function between(startMarker, endMarker, from = 0) {
  const a = html.indexOf(startMarker, from);
  if (a < 0) throw new Error("missing " + startMarker);
  const start = a + startMarker.length;
  const b = html.indexOf(endMarker, start);
  if (b < 0) throw new Error("missing " + endMarker);
  return { start, end: b, text: html.slice(start, b) };
}

const style = between("<style>", "</style>");
let css = style.text;

// Strip AI visual system (global cyan/Orbitron restyle + decorative chrome).
// Keep base theme + body.biblical-thriller overrides.
const aiStart = css.indexOf("/* ==================================================================\n   VERSE INTELLIGENCE");
const thrillerStart = css.indexOf("body.biblical-thriller{");
if (aiStart < 0 || thrillerStart < 0 || thrillerStart <= aiStart) {
  throw new Error("Could not locate AI CSS block boundaries");
}
css = css.slice(0, aiStart) + "\n/* AI visual system removed — biblical-thriller is the sole skin */\n\n" + css.slice(thrillerStart);

// Drop dead AI chrome hide rules / quality hooks that reference removed nodes.
css = css
  .replace(/\.biblical-thriller #neural-bg,\s*\n\.biblical-thriller \.ai-orbit,\s*\n\.biblical-thriller \.ai-scan,\s*\n\.biblical-thriller \.ai-chrome,\s*\n\.biblical-thriller \.ai-analysis\{display:none!important\}\n/g, "")
  .replace(/body\.quality-low #grain,body\.quality-low #cinematic-fx,body\.quality-low #viz,\s*\nbody\.quality-low \.ai-orbit,body\.quality-low \.ai-scan\{display:none!important\}/g,
    "body.quality-low #grain,body.quality-low #cinematic-fx,body.quality-low #viz{display:none!important}")
  .replace(/body\.quality-low \.playercard,body\.quality-low \.iconbtn,body\.quality-low \.mode,/g,
    "body.quality-low .playercard,body.quality-low .mode,")
  .replace(/body\.reduced \.ai-scan,body\.reduced \.ai-orbit,body\.reduced \.ai-live,body\.reduced \.verse-stage:after,\s*\nbody\.reduced \.ai-analysis i,body\.reduced #neural-bg\{animation:none\}\n/g, "")
  .replace(/,\.iconbtn/g, "");

const headEnd = html.indexOf("</head>");
const bodyStart = html.indexOf("<body");
const bodyOpenEnd = html.indexOf(">", bodyStart) + 1;
const appScript = html.indexOf("<script>");
const bodyInner = html.slice(bodyOpenEnd, appScript).trim();

// JS sections
const scriptFull = between("<script>", "</script>", appScript).text;
const booksIdx = scriptFull.indexOf("const BOOKS_ORDER");
const byTierIdx = scriptFull.indexOf("const BY_TIER");
const afterVerses = scriptFull.indexOf("const PASSAGES");
const passagesForEachEnd = scriptFull.indexOf("PASSAGES.forEach");
const passagesDone = scriptFull.indexOf("\n", scriptFull.indexOf("});", passagesForEachEnd) + 3);

if (booksIdx < 0 || byTierIdx < 0 || afterVerses < 0 || passagesDone < 0) {
  throw new Error("JS section markers missing");
}

const versesOnly = scriptFull.slice(booksIdx, byTierIdx);
const versesJs = versesOnly.trim() + `\n\nconst BY_TIER = {1:[],2:[],3:[],4:[],5:[]};\nVERSES.forEach((v,i)=>{ v.id=i; BY_TIER[v.t].push(v); });\n`;
const passagesBlock = scriptFull.slice(afterVerses, passagesDone).trim() + "\n";
const gameBlock = scriptFull.slice(passagesDone).trim();

fs.mkdirSync(path.join(ROOT, "css"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "js"), { recursive: true });

fs.writeFileSync(path.join(ROOT, "css", "game.css"), css.trim() + "\n");
fs.writeFileSync(path.join(ROOT, "js", "verses.js"), versesJs + "\n");
fs.writeFileSync(path.join(ROOT, "js", "passages.js"), passagesBlock + "\n");
fs.writeFileSync(path.join(ROOT, "js", "game.js"), gameBlock + "\n");

const bodyClass = (html.match(/<body([^>]*)>/) || [, ""])[1];

const index = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>COMPLETE THE VERSE — A Trial of Scripture</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Barlow+Condensed:wght@300;400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/game.css">
</head>
<body${bodyClass}>
${bodyInner}

<script src="js/verses.js"></script>
<script src="js/passages.js"></script>
<script src="js/game.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "index.html"), index);

console.log("Wrote css/game.css", fs.statSync(path.join(ROOT, "css", "game.css")).size);
console.log("Wrote js/verses.js", fs.statSync(path.join(ROOT, "js", "verses.js")).size);
console.log("Wrote js/passages.js", fs.statSync(path.join(ROOT, "js", "passages.js")).size);
console.log("Wrote js/game.js", fs.statSync(path.join(ROOT, "js", "game.js")).size);
console.log("Wrote index.html", fs.statSync(path.join(ROOT, "index.html")).size);
console.log("AI CSS stripped:", css.indexOf("VERSE INTELLIGENCE") < 0);
console.log("biblical-thriller kept:", css.indexOf("body.biblical-thriller") >= 0);
