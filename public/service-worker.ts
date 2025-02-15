declare let self: ServiceWorkerGlobalScope

import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST)

// Cache dynamic API requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
)

// Background sync for offline mutations
const bgSyncPlugin = new BackgroundSyncPlugin('offlineQueue', {
  maxRetentionTime: 24 * 60 // Retry for up to 24 hours (specified in minutes)
})

// Register routes that need background sync
registerRoute(
  ({ url }) => 
    url.pathname.startsWith('/api/matches') || 
    url.pathname.startsWith('/api/expenses'),
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
) 