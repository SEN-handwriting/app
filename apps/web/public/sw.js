self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  // Pass-through: no offline cache, just satisfies PWA criteria
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request));
});
