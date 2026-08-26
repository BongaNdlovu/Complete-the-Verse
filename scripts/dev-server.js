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
  if (process.env.CTV_LOG) console.log("[req]", req.url, "| range:", req.headers.range || "-", "| ua:", (req.headers["user-agent"]||"").slice(0,30));
  var rel;
  try { rel = decodeURIComponent(req.url.split("?")[0]); }
  catch (e) { res.writeHead(400).end("bad request"); return; }
  if (rel === "/") rel = "/index.html";

  var file = path.join(ROOT, rel);
  // Never serve outside the project, whatever the path claims to be.
  if (path.relative(ROOT, file).startsWith("..")) { res.writeHead(403).end("forbidden"); return; }

  fs.stat(file, function (err, st) {
    if (err || !st.isFile()) { res.writeHead(404).end("not found: " + rel); return; }
    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    /* Media elements (the Ur ambient video) issue Range requests for
       buffering/seeking. Answer them properly instead of one big 200.
       Media must stay CACHEABLE: no-store on partial responses makes
       Chromium's media pipeline stall on seeks. Code stays no-store so
       dev edits always load fresh. */
    const media = /\.(mp4|webm|mp3|ogg|wav|m4a)$/i.test(file);
    const cacheCtl = media ? "public, max-age=3600" : "no-store";
    const baseHeaders = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": cacheCtl };
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim());
      let start = 0, end = st.size - 1;
      if (!m || (m[1] === "" && m[2] === "") ||
          (m[1] === "" ? false : (start = parseInt(m[1], 10)) > st.size - 1) ||
          (m[2] !== "" && (end = parseInt(m[2], 10)) < start)) {
        res.writeHead(416, { "Content-Range": "bytes */" + st.size }).end();
        return;
      }
      if (m[1] === "") start = Math.max(0, st.size - parseInt(m[2], 10));
      end = Math.min(end, st.size - 1);
      res.writeHead(206, Object.assign({}, baseHeaders, {
        "Content-Range": "bytes " + start + "-" + end + "/" + st.size,
        "Content-Length": end - start + 1
      }));
      fs.createReadStream(file, { start: start, end: end }).pipe(res);
      return;
    }
    res.writeHead(200, Object.assign({}, baseHeaders, { "Content-Length": st.size }));
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, function () {
  console.log("Complete the Verse — http://localhost:" + PORT);
});
