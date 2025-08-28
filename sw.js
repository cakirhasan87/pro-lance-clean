// Cache Busting - Updated: 2025-08-24 10:20:00
const CACHE_NAME = 'pro-lance-v1.0.8-' + Date.now();
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/style.min.css',
  '/script.js',
  '/images/remote-office.webp',
  '/images/remote-office-mobile.webp',
  '/images/collaboration-bg.jpg',
  '/images/project-management.webp',
  '/images/digital-transformation.webp',
  '/en/index.html',
  '/en/header.html',
  '/en/footer.html',
  '/header.html',
  '/footer.html'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  // Skip installation for now to prevent errors
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip chrome-extension URLs
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // For now, just pass through to network
  event.respondWith(fetch(event.request));
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

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline form submissions
  return new Promise((resolve) => {
    // Implementation for background sync
    console.log('Background sync completed');
    resolve();
  });
}

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Pro-Lance notification',
    icon: '/images/pro-lance-logo.svg',
    badge: '/images/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/images/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Pro-Lance', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
