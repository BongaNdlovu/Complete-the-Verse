const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = require("../scripts/repo-root");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}

const SUPPORT = "fanelesibonge50@gmail.com";

const ctx = {};
const reviewsJs = fs.readFileSync(path.join(ROOT, "js", "player-reviews.js"), "utf8");
vm.runInNewContext(reviewsJs, ctx);
const list = ctx.PLAYER_REVIEWS;

function renderReviews(listArg) {
  return ctx.renderPlayerReviewsHTML(listArg);
}

function buildMailto(name, rating, text) {
  if (text.length < 8) return null;
  var body = "Name: " + name + "\nRating: " + rating + " / 5\n\n" + text + "\n\n---\nSent from Complete the Verse support page";
  return "mailto:" + SUPPORT + "?subject=" + encodeURIComponent("Complete the Verse review") +
    "&body=" + encodeURIComponent(body);
}

{
  ok("1 player-reviews.js exports an array", Array.isArray(list));
  ok("1 five seed reviews are published", list && list.length === 5);
  ok("1 every review has name, rating, and text",
    list.every(function (r) {
      return r.name && r.text && Number(r.rating) >= 1 && Number(r.rating) <= 5;
    }));
}

{
  const html = renderReviews(list);
  ok("2 render lists all five names",
    list.every(function (r) { return html.indexOf(String(r.name).replace(/[<>&"]/g, "")) >= 0; }));
  ok("2 render uses review cards", (html.match(/class="review"/g) || []).length === 5);
  ok("2 four-star review shows four filled stars",
    html.indexOf('aria-label="4 out of 5">★★★★☆') >= 0);
  ok("2 empty list shows placeholder", renderReviews([]).indexOf("No published reviews yet") >= 0);
  const xssHtml = renderReviews([{ name: "<b>X</b>", rating: 5, text: "<script>alert(1)</script>ok", date: "x" }]);
  ok("2 xss in review fields is stripped",
    xssHtml.indexOf("<script>") === -1 && xssHtml.indexOf("<b>") === -1 &&
    xssHtml.indexOf(">bX/b<") >= 0);
}

{
  const url = buildMailto("Sam", "5", "This game helped me memorize John 3:16.");
  ok("3 mailto targets support inbox", url && url.indexOf("mailto:" + SUPPORT) === 0);
  ok("3 mailto subject is Complete the Verse review",
    url && decodeURIComponent(url.split("subject=")[1].split("&")[0]) === "Complete the Verse review");
  ok("3 mailto body includes name rating and message",
    url && decodeURIComponent(url.split("body=")[1]).indexOf("Sam") >= 0 &&
    decodeURIComponent(url.split("body=")[1]).indexOf("Rating: 5 / 5") >= 0 &&
    decodeURIComponent(url.split("body=")[1]).indexOf("John 3:16") >= 0);
  ok("3 short review text is rejected", buildMailto("Sam", "5", "short") === null);
}

{
  const support = fs.readFileSync(path.join(ROOT, "support.html"), "utf8");
  const panels = fs.readFileSync(path.join(ROOT, "js", "panels.js"), "utf8");
  const briefs = fs.readFileSync(path.join(ROOT, "js", "briefs.js"), "utf8");
  const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  ok("4 support page loads external scripts only", /src="js\/player-reviews\.js"/.test(support) && /src="js\/support-page\.js"/.test(support));
  ok("4 support page has no executable inline script",
    (support.match(/<script[^>]*>/g) || []).every(function (tag) {
      return /src=/.test(tag) || /application\/ld\+json/.test(tag);
    }));
  ok("4 support page ships static review fallback", (support.match(/class="review"/g) || []).length >= 5);
  ok("4 support page has back button", /class="back-btn"/.test(support) && /href="\.\/"/.test(support));
  ok("4 support page has review form and published host",
    /id="review-form"/.test(support) && /id="published-reviews"/.test(support));
  ok("4 support mailto link matches inbox", support.indexOf("mailto:" + SUPPORT) >= 0);
  ok("4 game links to support page",
    index.indexOf("support.html") >= 0 && panels.indexOf("support.html") >= 0);
  ok("4 menu shows player reviews", /id="menu-player-reviews"/.test(index) && /renderPlayerReviewsHTML/.test(briefs));
  ok("4 menu has leave review button", /href="support\.html#leave-review"/.test(index) && />Leave a review</.test(index));
  ok("4 settings footer has support button", />Support</.test(panels) && /href="support\.html">Support</.test(panels));
  ok("4 settings account row does not duplicate support link", !/Privacy<\/a> · <a href="support\.html">Support/.test(panels));
}

if (fail) {
  console.log("FAIL — support reviews · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — support reviews · " + pass + " assertions");
