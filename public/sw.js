const CACHE_NAME = 'carqr-cache-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  'https://picsum.photos/seed/carqr192/192/192',
  'https://picsum.photos/seed/carqr512/512/512'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
