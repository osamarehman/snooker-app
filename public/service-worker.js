// This is a basic service worker that caches assets and API responses
const CACHE_NAME = 'snooker-club-cache-v1';
const API_CACHE_NAME = 'snooker-club-api-cache-v1';

// Assets to cache
const urlsToCache = [
  '/',
  '/dashboard',
  '/settings',
  '/support',
  // Add other static assets here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Return a fallback response if offline
          return new Response(JSON.stringify({ 
            error: 'You are offline',
            offline: true 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'syncMatches') {
    event.waitUntil(syncMatches());
  }
});

async function syncMatches() {
  try {
    const db = await indexedDB.open('snookerClubDB', 1);
    const syncQueue = db.transaction('syncQueue', 'readwrite').objectStore('syncQueue');
    const items = await syncQueue.getAll();

    for (const item of items) {
      try {
        let endpoint = item.endpoint;
        
        // Use the correct API endpoint based on the action type
        if (item.type === 'CREATE_MATCH') {
          endpoint = '/api/matches/create';
        }

        const response = await fetch(endpoint, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.payload),
        });

        if (response.ok) {
          await syncQueue.delete(item.id);
          
          // If it was a create action, update the local ID with the server ID
          if (item.type === 'CREATE_MATCH') {
            const serverMatch = await response.json();
            const matchesStore = db.transaction('matches', 'readwrite').objectStore('matches');
            const localMatch = await matchesStore.get(item.payload.id);
            if (localMatch) {
              localMatch.id = serverMatch.id;
              await matchesStore.put(localMatch);
            }
          }
        }
      } catch (error) {
        console.error('Sync failed for item:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
} 