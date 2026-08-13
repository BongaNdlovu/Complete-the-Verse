#!/usr/bin/env node
/* A static server for previewing the game in a browser.

   The game does not need this. It is opened by double-clicking
   index.html and everything in it — vendored Leaflet, the verse bank,
   the empire outlines — is loaded through <script> and <link> tags
   precisely so that works off the disk with no server at all.

   This exists for the cases where file:// is inconvenient: driving the
   page from a test harness, checking it on a phone on the same network,
   or anything that wants a real origin. Node only, no dependencies.

     node scripts/dev-server.js  ->  http://localhost:8781 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT) || 8781;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3":  "audio/mpeg",
  ".mp4":  "video/mp4",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".webp": "image/webp",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon"
};

http.createServer(function (req, res) {
  var rel;
  try { rel = decodeURIComponent(req.url.split("?")[0]); }
  catch (e) { res.writeHead(400).end("bad request"); return; }
  if (rel === "/") rel = "/index.html";

  var file = path.join(ROOT, rel);
  // Never serve outside the project, whatever the path claims to be.
  if (path.relative(ROOT, file).startsWith("..")) { res.writeHead(403).end("forbidden"); return; }

  fs.readFile(file, function (err, buf) {
    if (err) { res.writeHead(404).end("not found: " + rel); return; }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(buf);
  });
}).listen(PORT, function () {
  console.log("Complete the Verse — http://localhost:" + PORT);
});
