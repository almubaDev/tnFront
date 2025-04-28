// Service Worker para TarotNautica corregido

const CACHE_NAME = 'tarotnautica-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/static/js/main.*.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');

  event.waitUntil(clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes fetch
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          !event.request.url.includes('?') &&
          (event.request.url.startsWith('http://') || event.request.url.startsWith('https://'))
        ) {
          try {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.log('Error abriendo caché:', error);
              });
          } catch (e) {
            console.log('Error al procesar respuesta para caché:', e);
          }
        }
        return response;
      })
      .catch(() => {
        console.log('Red falló, buscando en caché:', event.request.url);
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Sin conexión', {
              status: 503,
              statusText: 'Servicio no disponible',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Manejar mensajes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker cargado correctamente');
