/*
 * Versioned by the `?v=` the page registers this worker with, so every deploy
 * gets its own cache and the activate handler below clears the previous one.
 *
 * This was a hardcoded string, and since activate only deletes caches whose
 * name differs from it, nothing was ever cleared. Hashed assets were fine —
 * a new build gives them new URLs — but the asset branch below also
 * cache-firsts unhashed files like /logo.svg and the icons, and those would
 * have been served from the old cache forever.
 */
const VERSION = new URL(self.location.href).searchParams.get('v') || 'v3'
const CACHE_NAME = `gransvilla-${VERSION}`
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // HTML pages: network-first with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) =>
            cached || caches.match(OFFLINE_URL)
          )
        )
    )
    return
  }

  // Static assets: cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|avif|webp)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            return response
          })
      )
    )
  }
})
