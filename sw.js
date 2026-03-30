const CACHE_NAME = 'infoculmey-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './logo.png'
];

// Instalación y cacheo del logo de 1024px
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Permite que la App funcione rápido y offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
