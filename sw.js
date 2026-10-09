'use strict';
const VERSION = '2a1f590ad7768f93';
// CacheStorage is shared by origin: include the full scope to protect other Pages apps.
const CACHE_PREFIX = 'world-study-atlas:' + self.registration.scope + ':';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const PRECACHE = [
  "./",
  "index.html",
  "manifest.json",
  "assets/atlas.css",
  "assets/atlas.js",
  "assets/pwa.js",
  "assets/vendor/d3.v7.min.js",
  "data/atlas.json",
  "data/world.geojson",
  "data/topics.json",
  "data/nobel.json",
  "data/legislatures.json",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/apple-touch-icon.png"
];
const scopeURL = new URL(self.registration.scope);
const absolute = relative => new URL(relative, scopeURL).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Install is atomic with respect to activation: missing core data keeps the old worker.
    await cache.addAll(PRECACHE.map(file => new Request(absolute(file), {cache:'reload'})));
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scopeURL.origin || !url.pathname.startsWith(scopeURL.pathname)) return;
  // Keep each release's HTML, JS and study data together; external source links stay online.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate' && (url.pathname === scopeURL.pathname || url.pathname === new URL('index.html', scopeURL).pathname)) {
      const shell = await cache.match(absolute('index.html'));
      if (shell) return shell;
      try { return await fetch(request); }
      catch { return new Response('Open the atlas online once to save it for offline use.', {status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}}); }
    }
    const cached = await cache.match(request, {ignoreSearch:true});
    if (cached) return cached;
    // Only the enumerated app assets are cached. Do not cache arbitrary paths or responses.
    return fetch(request);
  })());
});
