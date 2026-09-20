/* ==================================================================
   SERVICE WORKER — Complete the Verse PWA & Offline Support

   Caching strategy:
   1. Network-first for navigation requests and HTML shell so production
      updates deploy immediately without stale-cache locks.
   2. Cache-first for immutable static assets (CSS, JS, fonts, images).
   3. Explicit audio exclusion from precaching. Audio is cached at
      runtime on first play with an LRU cap of 25 files and 12 MB.
      Media is 30 files / 16 MB, and a single clip over 4 MB (the
      18 MB prologue) is never stored.
   4. Lifecycle: skipWaiting on install, clientsClaim on activate, and
      stale cache eviction.
   ================================================================== */

const CACHE_VERSION = "ctv-v1.8.64";
const CACHE_NAME = "ctv-shell-" + CACHE_VERSION;
const AUDIO_CACHE = "ctv-audio-" + CACHE_VERSION;
const MEDIA_CACHE = "ctv-media-" + CACHE_VERSION;
const MAX_AUDIO_ENTRIES = 25;
const MAX_MEDIA_ENTRIES = 30;
const MAX_AUDIO_BYTES = 12 * 1024 * 1024;
const MAX_MEDIA_BYTES = 16 * 1024 * 1024;
const MAX_MEDIA_FILE_BYTES = 4 * 1024 * 1024;

/* Core shell files to precache for offline support. Audio files are excluded.
   Late packs (play/atlas/tablets CSS, Leaflet, ascent, TF, tablets-more)
   load through js/defer.js after first paint. */
const PRECACHE_ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/favicon.png",
  "assets/logo.webp",
  "assets/intro.jpg",
  "assets/intro-cross.png",
  "css/fonts.css",
  "css/game.css",
  "fonts/cinzel-700.woff2",
  "fonts/eb-garamond-400.woff2",
  "fonts/eb-garamond-400-italic.woff2",
  "fonts/barlow-condensed-600.woff2",
  "js/verses.js",
  "js/verses-extra.js",
  "js/verses-more.js",
  "js/beat.js",
  "js/verses-notes.js",
  "js/passages.js",
  "js/legacy-ids.js",
  "js/bank.js",
  "js/srs.js",
  "js/recall.js",
  "js/assemble.js",
  "js/meta.js",
  "js/flow.js",
  "js/sites.js",
  "js/empires.js",
  "js/geo.js",
  "js/pilgrimage.js",
  "js/characters.js",
  "js/artifacts.js",
  "js/live.js",
  "js/atlas.js",
  "js/polish.js",
  "js/cloud-config.js",
  "js/cloud.js",
  "js/defer.js",
  "js/util.js",
  "js/audio.js",
  "js/director.js",
  "js/setpieces.js",
  "js/viz.js",
  "js/typed.js",
  "js/rewards.js",
  "js/sequences.js",
  "js/panels.js",
  "js/cinematic.js",
  "js/results.js",
  "js/diag.js",
  "js/briefs.js",
  "js/play.js",
  "js/tablets.js",
  "js/tablets-canon.js",
  "js/tablets-hall.js",
  "js/tablets-run.js",
  "js/game.js",
  "js/register-sw.js",
  "privacy.html",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-512.png"
];

/* Helper to check if a URL is an audio asset */
function isAudio(url) {
  return url.pathname.includes("/audio/") || url.pathname.endsWith(".mp3") || url.pathname.endsWith(".ogg") || url.pathname.endsWith(".wav");
}

/* Helper to check if a URL is heavy dynamic media */
function isMedia(url) {
  return url.pathname.includes("/assets/journey/") ||
         url.pathname.includes("/assets/beats/") ||
         url.pathname.includes("/assets/characters/") ||
         url.pathname.includes("/assets/tablets/") ||
         url.pathname.endsWith(".mp4") ||
         url.pathname.endsWith(".webm");
}

async function responseBytes(res) {
  const len = res && res.headers && res.headers.get("content-length");
  if (len && Number(len) > 0) return Number(len);
  try { return (await res.clone().blob()).size; } catch (e) { return 0; }
}

/* Trim the oldest entries until both the file cap and the byte cap hold. */
async function trimCache(cacheName, maxEntries, maxBytes) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (!keys.length) return;
  const items = [];
  let total = 0;
  for (let i = 0; i < keys.length; i++) {
    const res = await cache.match(keys[i]);
    const size = res ? await responseBytes(res) : 0;
    items.push({ req: keys[i], size: size });
    total += size;
  }
  while (items.length && (items.length > maxEntries || (maxBytes && total > maxBytes))) {
    const first = items.shift();
    await cache.delete(first.req);
    total -= first.size;
  }
}

/* Install Event — precache the shell and activate immediately */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      /* Explicit audio exclusion check */
      const safeToPrecache = PRECACHE_ASSETS.filter((path) => !path.includes("audio/") && !path.endsWith(".mp3"));
      return cache.addAll(safeToPrecache).catch((err) => {
        console.warn("SW precache partial fail:", err);
      });
    })
  );
});

/* Activate Event — take control and clean up outdated caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== AUDIO_CACHE && key !== MEDIA_CACHE) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

/* Fetch Event — network-first for navigation, cache-first for assets, LRU runtime for audio */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* Audio Strategy: Runtime caching on first play with LRU eviction cap */
  if (isAudio(url)) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            cache.put(request, response.clone());
            trimCache(AUDIO_CACHE, MAX_AUDIO_ENTRIES, MAX_AUDIO_BYTES);
          }
          return response;
        } catch (e) {
          return cached || new Response("", { status: 404, statusText: "Offline Audio Unavailable" });
        }
      })
    );
    return;
  }

  /* Navigation / HTML Shell Strategy: Network-first to guarantee deploy freshness */
  if (request.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname === "/" || url.pathname.endsWith("/")) {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            if (!url.searchParams.has("code") && !url.searchParams.has("error")) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(request, networkResponse.clone());
            }
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match("index.html") || caches.match("./");
        })
    );
    return;
  }

  /* Dynamic Media Strategy: Cache-first with LRU bounded eviction cap.
     Byte-range requests (video/audio seeks) bypass the cache: storing a
     206 partial would poison later full plays. */
  if (isMedia(url) && !request.headers.get("range")) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const size = await responseBytes(networkResponse);
            if (size && size > MAX_MEDIA_FILE_BYTES) return networkResponse;
            cache.put(request, networkResponse.clone());
            trimCache(MEDIA_CACHE, MAX_MEDIA_ENTRIES, MAX_MEDIA_BYTES);
          }
          return networkResponse;
        } catch (err) {
          return cached || new Response("", { status: 404, statusText: "Offline Media Unavailable" });
        }
      })
    );
    return;
  }

  /* Static Assets Strategy: Cache-first with network fallback */
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        return cached || new Response("", { status: 504, statusText: "Offline" });
      }
    })
  );
});
