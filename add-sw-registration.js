const fs = require('fs');
const path = require('path');

// Rutas a los archivos
const htmlPath = path.join(__dirname, 'web-build', 'index.html');
const manifestSourcePath = path.join(__dirname, 'public', 'manifest.json');
const manifestDestPath = path.join(__dirname, 'web-build', 'manifest.json');
const swSourcePath = path.join(__dirname, 'public', 'service-worker.js');
const swDestPath = path.join(__dirname, 'web-build', 'service-worker.js');
const redirectsPath = path.join(__dirname, 'public', '_redirects');
const redirectsDestPath = path.join(__dirname, 'web-build', '_redirects');

// Código para registrar el service worker
const swRegistrationCode = `
<script>
  // Registro del service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registrado exitosamente:', registration.scope);
        })
        .catch(function(error) {
          console.log('Error al registrar el Service Worker:', error);
        });
    });
    
    // Manejo de errores específicos
    window.addEventListener('unhandledrejection', function(event) {
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('chrome-extension') || 
           event.reason.message.includes('Failed to execute \\'put\\'') ||
           event.reason.message.includes('exports is not defined'))) {
        // Prevenir que el error aparezca en la consola
        event.preventDefault();
        console.log('Error ignorado:', event.reason.message);
      }
    });
    
    // Manejar errores globales
    window.addEventListener('error', function(event) {
      if (event.message && event.message.includes('exports is not defined')) {
        // Prevenir que el error aparezca en la consola
        event.preventDefault();
        console.log('Error global ignorado:', event.message);
        return true;
      }
    });
  }
</script>
`;

// Copiar manifest.json a la carpeta web-build
fs.copyFile(manifestSourcePath, manifestDestPath, (err) => {
  if (err) {
    console.error('Error al copiar manifest.json o archivo no existe, creándolo...');
    
    // Si el archivo no existe, creamos uno básico
    const basicManifest = `{
  "short_name": "TarotNautica",
  "name": "TarotNautica - Tu Aplicación de Tarot Personal",
  "description": "Descubre tu destino con nuestra aplicación de tarot",
  "lang": "es-ES",
  "start_url": "/",
  "background_color": "#000000",
  "theme_color": "#d6af36",
  "dir": "ltr",
  "display": "standalone",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/favicon-192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "/favicon-512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    }
  ],
  "prefer_related_applications": false
}`;
    
    fs.writeFile(manifestDestPath, basicManifest, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error al crear manifest.json:', writeErr);
      } else {
        console.log('Archivo manifest.json creado correctamente en web-build');
      }
    });
  } else {
    console.log('Archivo manifest.json copiado correctamente a web-build');
  }
});

// Copiar _redirects a la carpeta web-build
fs.copyFile(redirectsPath, redirectsDestPath, (err) => {
  if (err) {
    console.error('Error al copiar _redirects o archivo no existe, creándolo...');
    
    // Si el archivo no existe, creamos uno con la regla básica
    const redirectContent = '/* /index.html 200';
    
    fs.writeFile(redirectsDestPath, redirectContent, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error al crear _redirects:', writeErr);
      } else {
        console.log('Archivo _redirects creado correctamente en web-build');
      }
    });
  } else {
    console.log('Archivo _redirects copiado correctamente a web-build');
  }
});

// Copiar service-worker.js a la carpeta web-build
fs.copyFile(swSourcePath, swDestPath, (err) => {
  if (err) {
    console.error('Error al copiar service-worker.js:', err);
    // Si el archivo no existe, lo creamos
    if (err.code === 'ENOENT') {
      console.log('El archivo service-worker.js no existe en public, creando uno básico...');
      
      const basicServiceWorker = `
// Service Worker para TarotNautica
const CACHE_NAME = 'tarotnautica-v1';
const OFFLINE_PAGE = '/index.html';

// Lo que vamos a cachear inicialmente
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/main.*.js',
  '/static/css/main.*.css',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-192.png',
  '/favicon-512.png'
];

// Instalación: cachea recursos estáticos iniciales
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  
  // Intentar abrir el caché y agregar recursos iniciales
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: cacheando archivos');
        // Usar promises individuales para ser más robustos
        const cachePromises = INITIAL_CACHED_RESOURCES.map(url => {
          // Cachar errores para recursos individuales que no se puedan obtener
          return cache.add(url).catch(error => {
            console.log(\`Error al cachear \${url}: \${error}\`);
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

console.log('Service Worker: configurado correctamente - v1');
      `;
      
      fs.writeFile(swDestPath, basicServiceWorker, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error al crear service-worker.js básico:', writeErr);
        } else {
          console.log('Service Worker básico creado correctamente en web-build');
        }
      });
    }
  } else {
    console.log('Service Worker copiado correctamente a web-build');
  }
});

// Leer el archivo HTML
fs.readFile(htmlPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer index.html:', err);
    return;
  }

  // Verificar si ya tiene el código de registro
  if (data.includes('Service Worker registrado exitosamente')) {
    console.log('El código de registro del Service Worker ya existe en index.html');
    return;
  }

  // Verificar si tiene las etiquetas meta para PWA
  let modifiedHTML = data;
  
  // Añadir las meta etiquetas para PWA si no existen
  if (!data.includes('name="apple-mobile-web-app-capable"')) {
    modifiedHTML = modifiedHTML.replace('<head>', `<head>
    <meta name="theme-color" content="#d6af36" />
    <meta name="description" content="TarotNautica - Tu aplicación de Tarot Personal" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="TarotNautica" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/favicon-192.png" />`);
  }

  // Insertar el código de registro del Service Worker antes del cierre del body
  modifiedHTML = modifiedHTML.replace('</body>', `${swRegistrationCode}\n</body>`);

  // Escribir el archivo modificado
  fs.writeFile(htmlPath, modifiedHTML, 'utf8', (err) => {
    if (err) {
      console.error('Error al escribir index.html modificado:', err);
      return;
    }
    console.log('Código de registro del Service Worker y meta tags para PWA añadidos correctamente a index.html');
  });
});

// Verificar y generar íconos si no existen
const icon192Path = path.join(__dirname, 'web-build', 'favicon-192.png');
const icon512Path = path.join(__dirname, 'web-build', 'favicon-512.png');

// Función para verificar si los iconos existen
const checkIcons = () => {
  if (!fs.existsSync(icon192Path) || !fs.existsSync(icon512Path)) {
    console.log('Iconos para PWA no encontrados. Asegúrate de tener los archivos favicon-192.png y favicon-512.png en la carpeta public.');
    console.log('Sin estos iconos, la instalación en dispositivos móviles podría no funcionar correctamente.');
  } else {
    console.log('Iconos para PWA verificados correctamente.');
  }
};

// Verificar iconos
checkIcons();