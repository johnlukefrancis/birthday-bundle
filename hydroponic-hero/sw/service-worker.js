/* Simple service worker for offline support */
const CACHE_NAME = 'hydroponic-v2-modular';
const ASSETS = [
  '/',
  'index.html',
  'style.css',
  'main.js',
  // Core modules
  'js/core/engine.js',
  'js/core/state.js',
  'js/core/events.js',
  // Systems
  'js/systems/audio.js',
  'js/systems/timer.js',
  'js/systems/rooms.js',
  // Plants
  'js/plants/manager.js',
  'js/plants/renderer.js',
  // UI
  'js/ui/screens.js',
  'js/ui/overlay.js',
  // Interactions
  'js/interactions/input.js',
  // Config
  'config/game.json',
  // Data
  'data/plants.json',
  // Audio files
  'assets/audio/loop1.mp3',
  'assets/audio/loop2.mp3',
  'assets/audio/loop3.mp3',
  'assets/audio/sfx/door.mp3',
  'assets/audio/sfx/drop.mp3',
  'assets/audio/sfx/alert.mp3',
  'assets/audio/sfx/success.mp3',
  'assets/audio/sfx/fail.mp3',
  // Current image assets
  'assets/images/img1.jpg',
  'assets/images/img2.jpg',
  'assets/images/img3.jpg',
  'assets/images/img4.jpg',
  'assets/images/img5.jpg',
  'assets/images/img6.jpg',
  'assets/images/img7.jpg',
  'assets/images/img8.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});