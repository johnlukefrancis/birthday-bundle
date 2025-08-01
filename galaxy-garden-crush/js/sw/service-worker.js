const CACHE_NAME = 'galaxy-garden-crush-v3';
const URLS = [
  '/',
  '/index.html',
  '/style.css',
  // Modular JS files
  '/js/assets/sprites.js',
  '/js/core/events.js',
  '/js/core/state.js', 
  '/js/core/engine.js',
  '/js/systems/audio.js',
  '/js/systems/scoring.js',
  '/js/systems/timer.js',
  '/js/gameplay/grid.js',
  '/js/ui/screens.js',
  '/js/interactions/input.js',
  '/js/core/init.js',
  '/js/sw/service-worker.js',
  // Assets
  '/assets/bg/bg_starfield.jpg',
  '/assets/bg/bg_panel.jpg',
  // Sprites (now organized in folder)
  '/assets/sprites/sprite_bonsai.png',
  '/assets/sprites/sprite_fern.png',
  '/assets/sprites/sprite_rose.png',
  '/assets/sprites/sprite_succulent.png',
  '/assets/sprites/sprite_tag.png',
  // Custom music
  '/assets/music/song1.wav',
  '/assets/music/song2.wav',
  '/assets/music/song3.wav',
  '/assets/music/song4.wav',
  '/assets/music/song5.wav',
  // Sound effects
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