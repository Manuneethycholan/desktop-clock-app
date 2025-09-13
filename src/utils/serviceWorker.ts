import { useState, useEffect } from 'react';

/**
 * Service Worker registration and management utilities
 */

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

/**
 * Register service worker for offline functionality
 */
export const registerServiceWorker = (config: ServiceWorkerConfig = {}) => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content available
                    console.log('New content available, please refresh');
                    config.onUpdate?.(registration);
                  } else {
                    // Content cached for first time
                    console.log('Content cached for offline use');
                    config.onSuccess?.(registration);
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('App is online');
      config.onOnline?.();
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      config.onOffline?.();
    });
  } else {
    console.log('Service Worker not supported');
  }
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const result = await registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }
  return false;
};

/**
 * Update service worker
 */
export const updateServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }
};

/**
 * Send message to service worker
 */
export const sendMessageToServiceWorker = (message: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Service Worker message timeout'));
      }, 5000);
    } else {
      reject(new Error('Service Worker not available'));
    }
  });
};

/**
 * Cache wallpapers using service worker
 */
export const cacheWallpapers = async (images: Array<{ src: string }>): Promise<void> => {
  try {
    await sendMessageToServiceWorker({
      type: 'CACHE_WALLPAPERS',
      payload: { images }
    });
    console.log('Wallpapers cached successfully');
  } catch (error) {
    console.error('Failed to cache wallpapers:', error);
  }
};

/**
 * Clear all caches
 */
export const clearServiceWorkerCache = async (): Promise<void> => {
  try {
    await sendMessageToServiceWorker({
      type: 'CLEAR_CACHE'
    });
    console.log('Service Worker cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

/**
 * Get cache status
 */
export const getCacheStatus = async (): Promise<Record<string, number>> => {
  try {
    const status = await sendMessageToServiceWorker({
      type: 'GET_CACHE_STATUS'
    });
    return status;
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return {};
  }
};

/**
 * Check if app is running offline
 */
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Check if service worker is supported
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Get service worker registration
 */
export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      return await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Failed to get service worker registration:', error);
      return null;
    }
  }
  return null;
};

/**
 * Hook for service worker status
 */
export const useServiceWorkerStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerReady(true);
        // Get initial cache status
        getCacheStatus().then(setCacheStatus);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshCacheStatus = async () => {
    const status = await getCacheStatus();
    setCacheStatus(status);
  };

  return {
    isOnline,
    isServiceWorkerReady,
    cacheStatus,
    refreshCacheStatus
  };
};

