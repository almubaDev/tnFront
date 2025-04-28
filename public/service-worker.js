// Service Worker mejorado para TarotNautica
const CACHE_NAME = 'tarotnautica-v2';
const OFFLINE_PAGE = '/index.html';

// Lo que vamos a cachear inicialmente
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/main.*.js',
  '/static/css/main.*.css',
  '/manifest.json',
  '/favicon.ico'
];

// Instalación: cachea recursos estáticos iniciales
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  
  // Intentar abrir el caché y agregar recursos iniciales
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: cacheando archivos');
        // Usar el método addAll puede causar fallos si algún archivo no existe
        // Vamos a usar promises individuales para ser más robustos
        const cachePromises = INITIAL_CACHED_RESOURCES.map(url => {
          // Cachar errores para recursos individuales que no se puedan obtener
          return cache.add(url).catch(error => {
            console.log(`Error al cachear ${url}: ${error}`);
          });
        });
        
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('Service Worker: recursos iniciales cacheados');
        return self.skipWaiting();
      })
  );
});

// Activación: limpia caches antiguos
self.addEventListener('activate', (event) => {
  console.log('Service Worker: activado');
  
  // Borrar caches antiguos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: borrando caché antigua', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: caché actualizado a', CACHE_NAME);
      // Tomar control inmediato de todas las pestañas
      return self.clients.claim();
    })
  );
});

// Interceptar fetch: implementa estrategia de caché
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes que no sean http/https
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Manejar las solicitudes de navegación: siempre servir la página principal para rutas cliente
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }
  
  // Para recursos estáticos: estrategia Cache First, luego Network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si se encuentra en caché, devolver la respuesta cacheada
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si no está en caché, buscar en la red
        return fetch(event.request)
          .then(response => {
            // Verificar respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache la respuesta para futuros usos - clonar porque se usa una vez
            const responseToCache = response.clone();
            
            // No cachear APIs o URLs con parámetros de consulta
            const url = new URL(event.request.url);
            const shouldCache = !url.pathname.includes('/api/') && !url.search;
            
            if (shouldCache) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(error => {
            console.log('Fetch falló:', error);
            
            // Si es un HTML, proporcionar la página offline
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match(OFFLINE_PAGE);
            }
            
            // Para otros recursos, simplemente fallar
            return new Response(
              'Sin conexión. Por favor, revisa tu conexión a internet.',
              {
                status: 503,
                statusText: 'Servicio no disponible',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              }
            );
          });
      })
  );
});

// Manejar mensajes: permite forzar la actualización cuando hay una nueva versión
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: configurado correctamente - v2');