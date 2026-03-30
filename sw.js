// Nombre del caché (puedes cambiar el v1 si haces actualizaciones grandes)
const CACHE_NAME = 'infoculmey-v1';

// Archivos que se guardarán en el dispositivo para que la App abra rápido
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. EVENTO DE INSTALACIÓN: Guarda los archivos en el equipo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto: Guardando archivos de Infoculmey');
        return cache.addAll(assets);
      })
  );
});

// 2. EVENTO DE ACTIVACIÓN: Limpia cachés antiguos si existen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antiguo');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. EVENTO DE FETCH: Permite que la App funcione sin conexión
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el archivo está en caché, lo devuelve. Si no, lo busca en internet.
        return response || fetch(event.request);
      })
  );
});
