const CACHE = 'focusflow-v9';
const APP_ROOT = new URL('.', self.location).pathname;
const ROOT_URL = new URL(APP_ROOT, self.location.origin);
const ASSETS = [
  'index.html',
  'timer/index.html',
  'tasks/index.html',
  'notes/index.html',
  'style.css',
  'script.js',
  'favicon.svg',
  'manifest.webmanifest'
].map((asset) => new URL(asset, ROOT_URL).href);

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
      const route = `/${url.pathname.slice(APP_ROOT.length).replace(/^\/+|\/+$/g, '')}`;
      const page = ['/timer', '/tasks', '/notes'].includes(route) ? `${route.slice(1)}/index.html` : route === '/' ? 'index.html' : route.slice(1);
      const pageUrl = new URL(page, ROOT_URL);
      try {
        const response = await fetch(event.request);
        if (response.ok) return response;
      } catch {}
      return (await caches.match(pageUrl)) || (await caches.match(new URL('index.html', ROOT_URL))) || Response.error();
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
