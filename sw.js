/**
 * sw.js — TYS 2026 Service Worker
 *
 * Strategy:
 *   • Static shell assets  → cache-first (fast, offline-capable)
 *   • Google Fonts          → stale-while-revalidate (fresh when online, cached offline)
 *   • Navigation requests   → network-first with cached index.html fallback
 */

const CACHE_VERSION = 'tys-v13';
const FONT_CACHE    = 'tys-fonts-v1';

/** All local assets that make up the app shell */
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/css/main.css',
    '/src/css/tokens.css',
    '/src/css/base.css',
    '/src/css/components.css',
    '/src/data/team.js',
    '/src/js/icons.js',
    '/src/js/api.js',
    '/src/js/render.js',
    '/src/js/router.js',
    '/src/js/schedule.js',
    '/src/js/countdown.js',
    '/src/js/profile.js',
    '/src/js/news.js',
    '/src/js/live.js',
    '/src/js/app.js',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/apple-touch-icon.png'
];

// ---------------------------------------------------------------------------
// Install — pre-cache the app shell
// ---------------------------------------------------------------------------
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ---------------------------------------------------------------------------
// Activate — remove stale caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_VERSION && k !== FONT_CACHE)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ---------------------------------------------------------------------------
// Fetch — respond with the right strategy per request type
// ---------------------------------------------------------------------------
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Google Fonts: stale-while-revalidate
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
        return;
    }

    // Same-origin navigation: network-first, fall back to cached index.html
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Everything else (same-origin static assets): cache-first
    if (url.origin === self.location.origin) {
        event.respondWith(cacheFirst(request));
    }
});

// ---------------------------------------------------------------------------
// Message — allow clients to trigger skipWaiting (for update banner)
// ---------------------------------------------------------------------------
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/** Cache-first: serve from cache; fetch & store on miss */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, response.clone());
    }
    return response;
}

/** Stale-while-revalidate: serve cached immediately, update cache in background */
async function staleWhileRevalidate(request, cacheName) {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);
    const networkFetch = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => { /* background refresh failed — cached version remains */ });
    return cached || networkFetch;
}
