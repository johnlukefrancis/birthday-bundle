// Service Worker Registration - Optional
// Only enable this after confirming MP3 files work correctly
// Uncomment the code below to enable service worker caching

/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/sw/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
*/

// For now, service worker is disabled to avoid caching issues during testing
console.log('Service worker registration disabled - remove this file and uncomment above code to enable caching');
