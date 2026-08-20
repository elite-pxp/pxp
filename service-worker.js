const CACHE_VERSION = 'pxp-v93';
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const APP_SHELL_FILES = [
  './',
  './index.html',
  './page-2.html',
  './styles.css?v=31',
  './page-2.css?v=3',
  './app.js?v=77',
  './app-v2.js?v=3',
  './three-day-fasting-prayer.html',
  './Cultivate%20Your%20Eden.html',
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
          keys.map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isHttpRequest = (request) => request.url.startsWith('http');
const isCoreAssetRequest = (requestUrl) => {
  const pathname = requestUrl.pathname || '';
  return pathname.endsWith('/index.html') || pathname.endsWith('/app.js') || pathname.endsWith('/styles.css') || pathname.endsWith('/page-2.html') || pathname.endsWith('/app-v2.js') || pathname.endsWith('/page-2.css');
};

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

  if (isCoreAssetRequest(requestUrl)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match('./index.html');
        })
    );
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
