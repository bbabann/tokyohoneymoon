// Network-first service worker: always tries the latest files, falls back to cache when offline.
var CACHE = 'tokyo-honeymoon-v1';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png',
  'assets/taxi-booking.jpg', 'assets/flight-ticket.jpg', 'assets/bus-ticket.jpg', 'assets/hotel-voucher.jpg',
  'assets/land-ticket-1.jpg', 'assets/land-ticket-2.jpg', 'assets/sea-ticket-1.jpg', 'assets/sea-ticket-2.jpg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === location.origin;
  var font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !font) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && (res.ok || res.type === 'opaque')) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (m) { return m || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()); });
  }));
});
