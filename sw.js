/**
 * sw.js — Service Worker de la Calculadora Cortafuego Hilti.
 *
 * Qué hace: guarda una copia local (offline) de la app para que abra rápido
 * y funcione aunque no haya internet. Cuando hay una versión nueva, la
 * descarga en segundo plano y la aplica la próxima vez que se abre la app.
 *
 * IMPORTANTE al actualizar la app: cambiar el número de CACHE_VERSION de
 * abajo (ej. "v1" -> "v2") cada vez que se suba una versión nueva a GitHub.
 * Eso obliga a los teléfonos/computadoras que ya tienen la app instalada a
 * bajar los archivos nuevos en vez de seguir usando los viejos guardados.
 */
const CACHE_VERSION = "v10";
const CACHE_NAME = `cortafuego-hilti-${CACHE_VERSION}`;

const ARCHIVOS_PRECACHE = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
];

// Instalar: descarga y guarda los archivos principales.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_PRECACHE))
  );
  self.skipWaiting();
});

// Activar: borra cachés de versiones anteriores.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

// Peticiones: responde primero con lo guardado (rápido, funciona offline),
// y en paralelo pide la versión nueva a internet para la próxima vez.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((respuestaGuardada) => {
      const buscarEnRed = fetch(event.request)
        .then((respuestaRed) => {
          if (respuestaRed && respuestaRed.status === 200) {
            const copia = respuestaRed.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          }
          return respuestaRed;
        })
        .catch(() => respuestaGuardada);

      return respuestaGuardada || buscarEnRed;
    })
  );
});
