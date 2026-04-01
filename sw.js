const CACHE_NAME = 'infoculmey-cache-v2'; // Cambiá esto a v3, v4, etc. cuando hagas cambios grandes
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './logo.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza la actualización inmediata
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
