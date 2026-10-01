const CACHE = 'future-dictionary-v11-23';
const CORE = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()).then(() => {});
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Navigation requests prefer the network so a newly uploaded index.html is not trapped behind an old cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(resp => {
      const copy=resp.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return resp;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(resp => {
    const copy = resp.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)); return resp;
  }).catch(() => caches.match('./index.html'))));
});
