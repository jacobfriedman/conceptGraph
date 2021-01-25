/* service worker for caching */

const cacheName = "testCache"
const filesToCache = ["test.html"]

self.addEventListener("install", install)

function install (event) {
  console.log("[Servicework] Install");
  event.waitUntil(
    caches.open(cacheName).then(saved, errHandle)
  )
}

function saved (cache) {
  console.log("[Servicework] Caching app shell")
  return cache.addAll(filesToCache)
}

function errHandle(err) {
  console.log("[ServiceWorker Error]: ", err);
}

self.addEventListener('activate', activate)

function activate(event) {
  console.log("[Servicework] Activate");
  event.waituntil(
    caches.keys().then(function(keyList){
      return Promise.all(keyList.map(function(key){
        if(key !== cacheName) {
          console.log("[ServiceWorker] Removing old cache shell", key);
          return caches.delete(key);
        }
      }))
    })
  );
}

self.addEventListener('fetch', fetch)

function fetch (event) {
  console.log("[ServiceWorker] Fetch");
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request)
    })
  )
}
