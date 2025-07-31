const CACHE_NAME = 'galaxy-garden-crush-v1';
const URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/sprites.js',
  '/engine.js',
  '/game.js',
  '/service-worker.js',
  // Assets
  '/assets/bg/bg_starfield.jpg',
  '/assets/bg/bg_panel.jpg',
  '/assets/audio/loops/loopA.mp3',
  '/assets/audio/loops/loopB.mp3',
  '/assets/audio/loops/loopC.mp3',
  '/assets/audio/sfx/swap.mp3',
  '/assets/audio/sfx/match.mp3',
  '/assets/audio/sfx/special.mp3',
  '/assets/audio/sfx/pass.mp3',
  '/assets/audio/sfx/fail.mp3',
  '/assets/audio/sfx/dundun.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS).catch(err => {
        console.warn('Cache add failed', err);
      });
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});