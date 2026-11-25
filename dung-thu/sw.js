const CACHE_NAME = 'aphysics-demo-v1.0.0';
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/storage.js',
  './js/katex_render.js',
  './js/tools.js',
  './js/audio.js',
  './js/quiz.js',
  './js/app.js',
  '../assets/roadmap_manifest.json',
  '../assets/app_info.json',
  '../assets/terms_of_service.json',
  '../assets/PhanXa/danhSachChuDePhanXa.json',
  '../assets/KhoiDong/cauHoiKhoiDong.json',
  '../assets/ic_logo_aphysics.png',
  '../assets/ic_launcher_round.png',
  '../assets/ic_logo_loading.webp',
  '../assets/ic_logo_loading.png'
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

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
