const CACHE_NAME = 'eink-admin-v1.8';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/settings.html',
  '/offline.html',
  '/styles.css',
  '/app.js',
  '/i18n.js',
  '/pwa.js',
  '/assets/ha_logo.jpg',
  '/assets/hhh_logo.jpg',
  '/assets/ha_logo.svg',
  '/assets/hhh_logo.svg',
  '/assets/icon-16.png',
  '/assets/icon-32.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
              .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle any background sync tasks
  console.log('Background sync triggered');
  return Promise.resolve();
}
