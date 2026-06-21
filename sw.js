const STATIC = 'maslul-static-v1';
const PAGES  = 'maslul-pages-v1';
const ALL_CACHES = [STATIC, PAGES];

const PRECACHE = [
  '/index.html',
  '/site-qa-2026.css',
  '/site-qa-2026.js',
  '/course-light-theme.css',
  '/manifest.json',
  '/icon.svg',
  '/offline.html',
  '/assets/hero-command-center-2026.png',
  '/assets/status-engine.webp',
  '/assets/status-battery.webp',
  '/assets/status-buying.webp',
  '/assets/status-cooling.webp',
  '/assets/status-electric.webp',
  '/assets/status-offroad.webp',
  '/chapter-01-intro.html',
  '/whatsapp-mechanic.html',
  '/car-logos.html',
  '/idf-vehicles.html',
  '/deepseek_html_20260607_176157.html',
];

// Install — cache critical files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — purge old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !ALL_CACHES.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — smart caching strategy
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // External requests (fonts, CDN) — network only
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(req).catch(() => new Response('', { status: 408 })));
    return;
  }

  const path = url.pathname;

  // Static assets — cache first, network fallback
  if (/\.(css|js|webp|png|jpg|jpeg|svg|woff2?|ico)$/.test(path)) {
    e.respondWith(
      caches.match(req).then(hit =>
        hit || fetch(req).then(res => {
          const clone = res.clone();
          caches.open(STATIC).then(c => c.put(req, clone));
          return res;
        }).catch(() => new Response('', { status: 408 }))
      )
    );
    return;
  }

  // HTML pages — network first, cache second, offline page last
  if (path.endsWith('.html') || path === '/' || path.endsWith('/')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(PAGES).then(c => c.put(req, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(req)
            .then(hit => hit || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Everything else — network with cache fallback
  e.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Message: force update
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
