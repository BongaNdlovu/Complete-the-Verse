const fs = require("fs");
const path = require("path");
const ROOT = require("../scripts/repo-root");
const { TIP_JAR, tipJarFilled, tipJarMoney, tipJarParseAmount } = require("../js/tip-jar.js");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + name + (extra !== undefined ? " -> " + JSON.stringify(extra) : ""));
  }
}
function eq(name, got, want) { ok(name, got === want, { got: got, want: want }); }

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css", "game.css"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const vercel = fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8");

eq("the goal is 100 dollars", TIP_JAR.goalUsd, 100);
eq("no tip is claimed that has not been counted", TIP_JAR.raisedUsd, 0);

eq("nothing raised fills nothing", tipJarFilled(0, 100), 0);
eq("a quarter of the goal fills a quarter", tipJarFilled(25, 100), 0.25);
eq("past the goal the ring stays full", tipJarFilled(250, 100), 1);
eq("no goal fills nothing", tipJarFilled(10, 0), 0);

eq("a whole amount shows bare", tipJarMoney(5), "$5");
eq("a part amount shows its cents", tipJarMoney(2.5), "$2.50");

eq("a typed amount is read", tipJarParseAmount("7", 1, 10000), 7);
eq("a dollar sign is allowed", tipJarParseAmount("$7.50", 1, 10000), 7.5);
eq("below the minimum is refused", tipJarParseAmount("0.50", 1, 10000), null);
eq("above the maximum is refused", tipJarParseAmount("10001", 1, 10000), null);
eq("three decimals are refused", tipJarParseAmount("1.234", 1, 10000), null);
eq("words are refused", tipJarParseAmount("five", 1, 10000), null);
eq("a negative is refused", tipJarParseAmount("-5", 1, 10000), null);
eq("empty is refused", tipJarParseAmount("", 1, 10000), null);

ok("the menu opens the tip jar", html.indexOf('id="menu-tip-open"') > html.indexOf('id="v-menu"'));
ok("the modal is a hidden dialog", /id="tip-modal"[^>]*role="dialog"[^>]*hidden/.test(html));
["1", "3", "5", "10", "25", "custom"].forEach(function(amount){
  ok("the picker offers " + amount, html.indexOf('data-tip-amount="' + amount + '"') >= 0);
});
ok("the checkout link opens in a new tab with no opener", /id="tip-checkout"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/.test(html));
ok("the page has no form post to PayPal, which the CSP would block", /form-action 'self'/.test(vercel) && !/<form[^>]*paypal/i.test(html));
ok("the script loads after the page", /<script defer src="js\/tip-jar\.js"><\/script>/.test(html));
ok("the script is precached for offline", /"js\/tip-jar\.js"/.test(sw));
ok("the tip jar's motion sleeps under reduced motion", /body\.reduced \.menu-tip-glow/.test(css) && /body\.reduced \.tip-modal/.test(css));

if (fail) {
  console.log("FAIL — tip jar · " + pass + " passed · " + fail + " failed");
  process.exit(1);
}
console.log("PASS — tip jar · " + pass + " assertions");
