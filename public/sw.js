const CACHE_NAME = 'dropvault-pwa-v1';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy for live deals & Next.js dynamic pages, cache fallback for offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For Amazon CDN images or image-proxy: Stale-while-revalidate for fast rendering
  if (url.pathname.startsWith('/api/image-proxy') || url.hostname.includes('media-amazon.com')) {
    event.respondWith(
      caches.open('dropvault-images').then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            cache.put(event.request, networkRes.clone());
          }
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Next.js chunks, fonts, static assets: Cache-first
  if (url.pathname.startsWith('/_next/static/') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open('dropvault-static').then((c) => c.put(event.request, resClone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // Normal pages & deals API: Network first, fall back to cache
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response && response.status === 200 && url.origin === self.location.origin) {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
