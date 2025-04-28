const fs = require('fs');
const path = require('path');

// Rutas a los archivos
const htmlPath = path.join(__dirname, 'web-build', 'index.html');
const swSourcePath = path.join(__dirname, 'public', 'service-worker.js');
const swDestPath = path.join(__dirname, 'web-build', 'service-worker.js');

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

// Copiar service-worker.js a la carpeta web-build
fs.copyFile(swSourcePath, swDestPath, (err) => {
  if (err) {
    console.error('Error al copiar service-worker.js:', err);
    // Si el archivo no existe, lo creamos
    if (err.code === 'ENOENT') {
      console.log('El archivo service-worker.js no existe en public, creando uno básico...');
      
      const basicServiceWorker = `
// Service Worker básico para TarotNautica
const CACHE_NAME = 'tarotnautica-v1';

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(clients.claim());
});

// Interceptar solicitudes fetch
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes que no sean http/https
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Prevenir errores con chrome-extension
  try {
    const url = new URL(event.request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      console.log('Service Worker: ignorando solicitud no-HTTP', event.request.url);
      return;
    }
  } catch (error) {
    return;
  }
  
  // Estrategia simple: Network first, sin cacheo para evitar errores
  event.respondWith(
    fetch(event.request)
      .catch(() => {
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
              headers: new Headers({'Content-Type': 'text/plain'})
            });
          });
      })
  );
});

console.log('Service Worker v1 cargado');
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

  // Insertar el código antes del cierre del body
  const modifiedHTML = data.replace('</body>', `${swRegistrationCode}\n</body>`);

  // Escribir el archivo modificado
  fs.writeFile(htmlPath, modifiedHTML, 'utf8', (err) => {
    if (err) {
      console.error('Error al escribir index.html modificado:', err);
      return;
    }
    console.log('Código de registro del Service Worker añadido correctamente a index.html');
  });
});