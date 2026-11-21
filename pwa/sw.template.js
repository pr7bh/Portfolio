/* Service worker: makes the portfolio installable and usable offline.
   Built by vite.config.js, which fills in the version and the list of
   files to pre-cache, so every deploy installs a fresh worker.

   Strategy
   - Pages: network first (always the latest deploy), cached copy offline.
   - /assets/*: hashed and immutable, so cache first.
   - Other same-origin files and Google Fonts: serve cached, refresh behind.
   - Anything else (the AI backend, Web3Forms, analytics) is not touched. */

const VERSION = "__VERSION__";
const PRECACHE = __PRECACHE__;
const SHELL = `ps-shell-${VERSION}`;
const RUNTIME = "ps-runtime";
const OFFLINE_URL = "/offline.html";
const RUNTIME_LIMIT = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(["/", OFFLINE_URL, ...PRECACHE]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith("ps-shell-") && k !== SHELL).map((k) => caches.delete(k))
      );
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })()
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function networkFirstPage(event) {
  try {
    const preloaded = await event.preloadResponse;
    const response = preloaded || (await fetch(event.request));
    if (response.ok) {
      const copy = response.clone();
      caches.open(SHELL).then((c) => c.put("/", copy));
    }
    return response;
  } catch {
    return (await caches.match("/")) || (await caches.match(OFFLINE_URL));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    caches.open(RUNTIME).then((c) => c.put(request, copy).then(() => trim(RUNTIME, RUNTIME_LIMIT)));
  }
  return response;
}

async function staleWhileRevalidate(event) {
  const cached = await caches.match(event.request);
  const refresh = fetch(event.request)
    .then((response) => {
      if (response.ok || response.type === "opaque") {
        const copy = response.clone();
        caches.open(RUNTIME).then((c) => c.put(event.request, copy).then(() => trim(RUNTIME, RUNTIME_LIMIT)));
      }
      return response;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const url = new URL(request.url);

  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(networkFirstPage(event));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname === "/sw.js") return;
    event.respondWith(url.pathname.startsWith("/assets/") ? cacheFirst(request) : staleWhileRevalidate(event));
    return;
  }

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(event));
  }
});
