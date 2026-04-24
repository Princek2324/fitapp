const CACHE_NAME = 'fitapp-cache-v22';
const ASSETS_TO_CACHE = [
  'index.html',
  'css/theme.css',
  'css/components.css',
  'css/screens.css',
  'js/db.js',
  'js/app.js',
  'js/home.js',
  'js/profile.js',
  'js/onboarding.js',
  'js/food-db.js',
  'js/food.js',
  'js/workout-db.js',
  'js/workout.js',
  'js/progress.js',
  'js/ai-coach.js',
  'manifest.json',
  'assets/img/icon-192.png',
  'assets/img/icon-512.png'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate Event
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
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', event => {
  // Skip cross-origin requests (like the Gemini API call)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // If offline and request fails, you could return an offline fallback page here if we had one
        });
      })
  );
});
