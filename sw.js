const CACHE = 'focusflow-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/timer',
  '/timer/index.html',
  '/tasks',
  '/tasks/index.html',
  '/notes',
  '/notes/index.html',
  '/style.css',
  '/script.js',
  '/favicon.svg',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Resolve clean routes to their real files if the server or offline cache
  // does not handle directory URLs consistently.
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const url = new URL(event.request.url);
      const route = url.pathname.replace(/\/$/, '');
      const page = ['/timer', '/tasks', '/notes'].includes(route) ? `${route}/index.html` : route || '/index.html';
      try {
        const response = await fetch(event.request);
        if (response.ok) return response;
      } catch {}
      return (await caches.match(page)) || (await caches.match('/index.html')) || Response.error();
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return Response.error();
      });
    })
  );
});
