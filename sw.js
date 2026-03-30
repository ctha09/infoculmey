const CACHE_NAME = 'infoculmey-cache-v1';
// Solo los archivos esenciales y tu logo de alta resolución
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './logo.png' 
];

// Instalación: Guarda el logo.png de 1024x1024 en el dispositivo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Estrategia: Cargar desde caché si no hay internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
