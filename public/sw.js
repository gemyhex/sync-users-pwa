const CACHE_NAME = "user-sync-cache-v1";
const ASSETS = ["/", "/index.html"];

self.addEventListener("install", (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (evt) => evt.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (evt) => {
  if (evt.request.method !== "GET") return;
  evt.respondWith(
    caches
      .match(evt.request)
      .then((r) => r || fetch(evt.request).catch(() => caches.match("/")))
  );
});
