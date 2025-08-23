const CACHE_NAME = 'tetris-v2.0.3';
const STATIC_CACHE = 'tetris-static-v2.0.3';
const DYNAMIC_CACHE = 'tetris-dynamic-v2.0.3';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install-händelse - cacha statiska tillgångar
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cachar statiska tillgångar');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Statiska tillgångar cachade framgångsrikt');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Misslyckades att cacha statiska tillgångar:', error);
      })
  );
});

// Aktivera-händelse - rensa gamla cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Tar bort gammal cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker aktiverad');
        return self.clients.claim();
      })
  );
});

// Hämta-händelse - servera från cache eller nätverk
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hoppa över icke-GET-förfrågningar
  if (request.method !== 'GET') {
    return;
  }

  // Hantera olika typer av förfrågningar
  if (url.pathname === '/' || url.pathname === '/index.html') {
    // HTML - nätverk först för att undvika inaktuell index.html
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/audio/')) {
    // Statiska tillgångar - cache först, sedan nätverk
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (url.pathname.startsWith('/assets/')) {
    // Build assets (JS/CSS med hash) - cache först, de ändras sällan
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else if (url.pathname.startsWith('/api/')) {
    // API-anrop - nätverk först, sedan cache, med bättre felhantering
    event.respondWith(apiFirst(request, DYNAMIC_CACHE));
  } else {
    // Andra förfrågningar - nätverk först, sedan cache
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Cache-först-strategi
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Om nätverk ger fel, returnera cached version om den finns
    const fallbackResponse = await caches.match(request);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    
    return networkResponse; // Returnera nätverksrespons även om den inte är ok
  } catch (error) {
    console.error('Cache-först-strategi misslyckades:', error);
    
    // Försök hitta cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback för offline-scenario
    return new Response('Offline-innehåll inte tillgängligt', { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// API-först-strategi med bättre felhantering
async function apiFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Om nätverk ger fel, försök hitta cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Om ingen cache finns, returnera ett mer användbart felmeddelande
    return new Response(JSON.stringify({ 
      error: 'API inte tillgänglig',
      message: 'Försök igen senare eller spela offline'
    }), { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  } catch (error) {
    console.log('API-anrop misslyckades, använder offline-läge:', error);
    
    // Försök hitta cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback för offline-scenario
    return new Response(JSON.stringify({ 
      error: 'Offline-läge',
      message: 'Spela offline tills anslutningen återställs'
    }), { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}

// Nätverk-först-strategi
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Om nätverk ger fel, försök hitta cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return networkResponse; // Returnera nätverksrespons även om den inte är ok
  } catch (error) {
    console.error('Nätverk-först-strategi misslyckades:', error);
    
    // Försök hitta cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback för offline-scenario
    return new Response('Offline-innehåll inte tillgängligt', { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Bakgrundssynkronisering för offline-åtgärder
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Synka eventuella väntande speldata när anslutningen återställs
    console.log('Bakgrundssynkronisering slutförd');
  } catch (error) {
    console.error('Bakgrundssynkronisering misslyckades:', error);
  }
}

// Push-notifikationer
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Ny Tetris-utmaning tillgänglig!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'play',
          title: 'Spela Nu',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'close',
          title: 'Stäng',
          icon: '/icons/icon-72x72.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Tetris', options)
    );
  }
});

// Notifikationsklick
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'play') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
