// Service Worker for Desktop Clock App
// Provides offline functionality and caching

const CACHE_NAME = 'desktop-clock-v1';
const STATIC_CACHE_NAME = 'desktop-clock-static-v1';
const WALLPAPER_CACHE_NAME = 'desktop-clock-wallpapers-v1';

// Files to cache immediately (critical resources)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Wallpaper categories to cache (limit to essential ones)
const PRIORITY_WALLPAPER_CATEGORIES = [
  'nature',
  'motivational',
  'common_mass'
];

// Maximum number of wallpapers to cache per category
const MAX_WALLPAPERS_PER_CATEGORY = 5;

/**
 * Install event - cache critical resources
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      }),
      
      // Cache priority wallpapers
      cachePriorityWallpapers()
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // Force activation of new service worker
      return self.skipWaiting();
    }).catch((error) => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== WALLPAPER_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete');
    })
  );
});

/**
 * Fetch event - serve cached content when offline
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/wallpapers/')) {
    // Wallpaper images - cache with fallback
    event.respondWith(handleWallpaperRequest(request));
  } else if (url.pathname.endsWith('.js') || 
             url.pathname.endsWith('.css') || 
             url.pathname === '/' || 
             url.pathname.endsWith('.html')) {
    // Static assets - cache first, then network
    event.respondWith(handleStaticAssetRequest(request));
  } else {
    // Other requests - network first, then cache
    event.respondWith(handleNetworkFirstRequest(request));
  }
});

/**
 * Handle wallpaper image requests
 */
async function handleWallpaperRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(WALLPAPER_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Wallpaper request failed, using fallback');
    // Return a fallback response or empty response
    return new Response('', { 
      status: 404, 
      statusText: 'Wallpaper not available offline' 
    });
  }
}

/**
 * Handle static asset requests (cache first)
 */
async function handleStaticAssetRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, try to serve index.html for SPA routing
    if (request.mode === 'navigate') {
      const cachedIndex = await caches.match('/index.html');
      if (cachedIndex) {
        return cachedIndex;
      }
    }
    
    throw error;
  }
}

/**
 * Handle other requests (network first)
 */
async function handleNetworkFirstRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Cache priority wallpapers during installation
 */
async function cachePriorityWallpapers() {
  try {
    const cache = await caches.open(WALLPAPER_CACHE_NAME);
    
    for (const category of PRIORITY_WALLPAPER_CATEGORIES) {
      try {
        // Try to fetch the image manifest to get available images
        const manifestResponse = await fetch('/wallpapers/manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          const categoryImages = manifest[category] || [];
          
          // Cache first few images from each priority category
          const imagesToCache = categoryImages.slice(0, MAX_WALLPAPERS_PER_CATEGORY);
          
          for (const imageName of imagesToCache) {
            const imageUrl = `/wallpapers/${category}/${imageName}`;
            try {
              const imageResponse = await fetch(imageUrl);
              if (imageResponse.ok) {
                await cache.put(imageUrl, imageResponse);
                console.log(`Service Worker: Cached ${imageUrl}`);
              }
            } catch (imageError) {
              console.log(`Service Worker: Failed to cache ${imageUrl}`, imageError);
            }
          }
        }
      } catch (categoryError) {
        console.log(`Service Worker: Failed to cache category ${category}`, categoryError);
      }
    }
  } catch (error) {
    console.log('Service Worker: Failed to cache priority wallpapers', error);
  }
}

/**
 * Handle background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

/**
 * Handle background sync operations
 */
async function handleBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');
    // Sync any pending operations when back online
    // For this app, we might sync settings or update image cache
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

/**
 * Handle push notifications (future feature)
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'desktop-clock-notification'
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

/**
 * Message handler for communication with main app
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_WALLPAPERS':
      event.waitUntil(cacheWallpapers(payload.images));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      }));
      break;
  }
});

/**
 * Cache specific wallpapers requested by the app
 */
async function cacheWallpapers(images) {
  try {
    const cache = await caches.open(WALLPAPER_CACHE_NAME);
    
    for (const image of images) {
      try {
        const response = await fetch(image.src);
        if (response.ok) {
          await cache.put(image.src, response);
        }
      } catch (error) {
        console.log(`Service Worker: Failed to cache ${image.src}`, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Failed to cache wallpapers', error);
  }
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('Service Worker: All caches cleared');
  } catch (error) {
    console.error('Service Worker: Failed to clear caches', error);
  }
}

/**
 * Get cache status information
 */
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = keys.length;
    }
    
    return status;
  } catch (error) {
    console.error('Service Worker: Failed to get cache status', error);
    return {};
  }
}