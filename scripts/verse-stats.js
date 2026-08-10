const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const files = ["js/verses.js", "js/verses-extra.js"].filter((f) =>
  fs.existsSync(path.join(root, f))
);

let combined = "";
for (const f of files) combined += fs.readFileSync(path.join(root, f), "utf8");

const re = /\{b:"([^"]+)",r:"([^"]+)",t:(\d)/g;
const entries = [];
let m;
while ((m = re.exec(combined))) entries.push({ b: m[1], r: m[2], t: +m[3] });

const books = {};
entries.forEach((x) => {
  books[x.b] = (books[x.b] || 0) + 1;
});

const order = [...combined.match(/BOOKS_ORDER = \[([^\]]+)\]/)[1].matchAll(/"([^"]+)"/g)].map(
  (x) => x[1]
);
const thin = order.filter((b) => (books[b] || 0) < 3);
const tiers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
entries.forEach((x) => tiers[x.t]++);

console.log(
  JSON.stringify(
    { count: entries.length, tiers, thin: thin.map((b) => b + ":" + (books[b] || 0)) },
    null,
    2
  )
);
