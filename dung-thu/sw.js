const CACHE_NAME = 'aphysics-demo-v1.0.2';
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css?v=2',
  './js/storage.js?v=2',
  './js/katex_render.js?v=2',
  './js/tools.js?v=2',
  './js/audio.js?v=2',
  './js/quiz.js?v=2',
  './js/app.js?v=2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS).catch(() => Promise.resolve());
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first so updates to HTML/JS/JSON appear immediately
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
