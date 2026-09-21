const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");

const SITE = "https://complete-the-verse.vercel.app";

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}

const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const privacy = fs.readFileSync(path.join(ROOT, "privacy.html"), "utf8");
const support = fs.readFileSync(path.join(ROOT, "support.html"), "utf8");
const robots = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8"));

{
  ok("1 robots.txt allows crawlers", /User-agent:\s*\*/.test(robots) && /Allow:\s*\//.test(robots));
  ok("1 robots.txt points to sitemap", robots.indexOf("Sitemap: " + SITE + "/sitemap.xml") >= 0);
  ok("1 sitemap lists public pages",
    sitemap.indexOf(SITE + "/") >= 0 &&
    sitemap.indexOf(SITE + "/privacy.html") >= 0 &&
    sitemap.indexOf(SITE + "/support.html") >= 0);
}

{
  ok("2 index has canonical url", index.indexOf('rel="canonical" href="' + SITE + '/"') >= 0);
  ok("2 index has twitter card", /name="twitter:card"/.test(index));
  ok("2 index has json-ld web application", /application\/ld\+json/.test(index) && /WebApplication/.test(index));
  ok("2 index has crawlable h1", /class="sr-only"/.test(index) && /<h1 class="sr-only">/.test(index));
  ok("2 index social image is 512 png", index.indexOf(SITE + "/assets/icon-512.png") >= 0);
}

{
  ok("3 privacy has description and canonical",
    /<meta name="description"/.test(privacy) &&
    privacy.indexOf('href="' + SITE + '/privacy.html"') >= 0);
  ok("3 support has description and canonical",
    /<meta name="description"/.test(support) &&
    support.indexOf('href="' + SITE + '/support.html"') >= 0);
  ok("3 support has review structured data",
    /application\/ld\+json/.test(support) && /AggregateRating/.test(support));
}

{
  ok("4 manifest has lang and categories", manifest.lang === "en" && Array.isArray(manifest.categories));
  ok("4 service worker precaches discovery files",
    /robots\.txt/.test(sw) && /sitemap\.xml/.test(sw));
}

if (fail) {
  console.log("FAIL — seo · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — seo · " + pass + " assertions");
