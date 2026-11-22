const CACHE = "cashflow-v2";
const OFFLINE_URLS = ["/", "/shell.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Network-first for navigations, falling back to cache when offline.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.mode !== "navigate") return;
  const url = new URL(request.url);
  event.respondWith(
    (url.searchParams.has("_s")
      ? Promise.resolve(null)
      : // Cold launch (no open window): paint the cached shell instantly.
        self.clients
          .matchAll({ type: "window" })
          .then((cs) => (cs.length === 0 ? caches.match("/shell.html") : null))
    ).then((shell) => shell || network(request))
  );
});

function network(request) {
  return fetch(request)
    .then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(request, copy));
      return res;
    })
    .catch(() => caches.match(request).then((r) => r || caches.match("/")));
}
