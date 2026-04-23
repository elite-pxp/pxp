const CACHE_VERSION = 'pxp-v2';
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const APP_SHELL_FILES = [
  './',
  './index.html',
  './styles.css?v=9',
  './app.js?v=22',
  './site.webmanifest?v=4',
  './images/icons/favicon-32x32.png?v=3',
  './images/icons/apple-touch-icon.png?v=3',
  './images/icons/android-chrome-192x192.png',
  './images/icons/android-chrome-512x512.png',
  './images/pxp-logo.png',
  './images/Pxp Logo.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isHttpRequest = (request) => request.url.startsWith('http');

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !isHttpRequest(request)) {
    return;
  }

  const requestUrl = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage || caches.match('./index.html');
        })
    );
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
