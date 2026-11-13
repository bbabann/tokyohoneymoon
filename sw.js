// Network-first service worker: always tries the latest files, falls back to cache when offline.
var CACHE = 'tokyo-honeymoon-v7';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png', 'assets/mickey.png', 'assets/thumb-taxi.webp', 'assets/thumb-flight.webp', 'assets/thumb-bus.webp', 'assets/thumb-hotel.webp', 'assets/thumb-land.webp', 'assets/thumb-sea.webp', 'assets/thumb-esim.webp', 'assets/thumb-insurance.webp', 'assets/esim.webp', 'assets/insurance.webp',
  'assets/taxi-booking.webp', 'assets/flight-ticket.webp', 'assets/bus-ticket.webp', 'assets/hotel-voucher.webp',
  'assets/land-ticket-1.webp', 'assets/land-ticket-2.webp', 'assets/sea-ticket-1.webp', 'assets/sea-ticket-2.webp'];

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
  var font = /(fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net)$/.test(url.hostname);
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
