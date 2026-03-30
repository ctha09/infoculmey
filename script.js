const CACHE_NAME = 'infoculmey-cache-v1';
const urlsToCache = ['./', './index.html', './style.css', './script.js', './icon-192.png'];

// Instalación y almacenamiento en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Estrategia de respuesta: Primero red, si falla, caché
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
