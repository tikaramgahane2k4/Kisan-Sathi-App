// Simple service worker for caching static assets
const CACHE_NAME = 'kisan-profit-mitra-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/vendors~main.chunk.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache install failed:', err))
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API: GET -> network-first, cache put; fallback to cache
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // API: non-GET -> pass-through (handled by app-side queue)
  if (url.pathname.startsWith('/api/')) {
    return; // let the request go to network; app handles offline
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((response) => response || fetch(request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
