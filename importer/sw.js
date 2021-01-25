/* Service Worker to intercept Fetch for modules */

//initialize a sw
const CACHE_NAME = "Cachev1";
const urlsToCache = ["/"];

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// handle fetch events
self.addEventListener('fetch', (event) => {
  console.log('[SERVICEWORKER] Fetching', event.request)
  event.respondWith (
    fetchHandler(event)
  )
})

async function fetchHandler(event) {
  var url = new URL(event.request.url)
  console.log(url)
  var res = await fetch(event.request);
    return res;
  }

/*

}

async function getModuleString(url, request){
  console.log('[SERVICEWORKER] Getting Module', url);
  var time = Date.now();
  var clients = await self.clients.matchAll({includeUncontrolled:true});
  // ask the clients to get module with file etc
  console.log('[CLIENTS]', clients)
  clients.forEach((client) => {
    client.postMessage({
      type: 'module',
      path: url[3],
      request: request.url
    })
  })
  // wait until we get an answer, here we need to postMessage objects back when we get them
  // TODO: Ear Mark requested Module in cache, so if we get
}


// Handle PostMessage from client

self.addEventListener('message', function(event){
  event.waitUntil(
    msgHandler(event)
  )
})

async function msgHandler (event) {
  debugger
  console.log(event);
  //TODO, cache module after it arrives and push to client
  //message = {
  //  start: Date.now(),
  //  data: event.data.data
  //}
  var cache = await caches.open(CACHE_NAME);
  var init = {status:200};
  var blob = new Blob([event.data.data], {type:'text/javascript'})
  var response = new Response(blob, init)
  await cache.put(event.data.request, response)
}

// Handle install event

self.addEventListener('install', function(event) {

  console.log('[SERVICEWORKER] Install step called', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache', CACHE_NAME);
        return cache.addAll(urlsToCache);
      }).then(()=>{
        return self.skipWaiting();
      })
  )


})

// Handle activation event

self.addEventListener('activate', (event) => {
  event.waitUntil(
    activateHandler(event)
  )
})

async function activateHandler (event) {
  console.log('[SERVICEWORKER] Activation called', event);
  var clients = await self.clients.matchAll({includeUncontrolled:true});
  if(clients) {
    var urls = clients.map((client) => {
      return client.url;
    });
    console.log('[ServiceWorker] Matching clients:', urls.join(', '));
  }
  var cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(function(cacheName) {
      if (cacheName !== CACHE_NAME) {
        console.log('[ServiceWorker] Deleting old cache:', cacheName);
        return caches.delete(cacheName);
        }
      }
    )
  )

  console.log('[ServiceWorker] Claiming clients for version', CACHE_NAME);
  return self.clients.claim();
}

*/