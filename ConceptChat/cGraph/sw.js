/* Service Worker to intercept Fetch for modules */

//initialize a sw
const CACHE_NAME = "Cachev1";
const urlsToCache = ["/"];
var client;
var window = {};
var gun;
var app;
var ws;
function url () {
  this.parse = function (string) {
    return string
  }
}

function require (string) {
  console.log(string);
  if(string == '../gun'){
    return window.Gun;
  } else if (string == 'ws') {
    return WebSocket;
  } else if (string == 'url'){
    return new url;
  }

}

(async function (){

  var req = new Request('https://cdn.jsdelivr.net/npm/gun@0.2019.627/gun.min.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);

  var req = new Request('https://cdn.jsdelivr.net/npm/gun@0.2019.627/lib/wire.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);

  var req = new Request('https://cdn.jsdelivr.net/npm/gun@0.2019.627/lib/ws.js')
  var res = await fetch(req);
  ws = await res.text();
  eval(ws);

  var req = new Request('https://cdn.jsdelivr.net/npm/gun@0.2019.627/lib/then.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);


  var peers = ['ws://E2EEC.herokuapp.com/gun']
  gun = window.Gun({peers:peers, localStorage:false, radisk:false, axe:false});
  gun._.on('hi', console.log);
  app = gun.get('conceptChat');
  app.once(console.log);
  console.log(await app.once().then());
  console.log(await app.then());

})()

// handle fetch events
self.addEventListener('fetch', (event) => {
  console.log('[SERVICEWORKER] Fetching', event)
  event.respondWith (
    fetchHandler(event)
  )
})

async function fetchHandler(event) {
  var url = event.request.url.split('/');

  var cache = await caches.open(CACHE_NAME);
  console.log('getting url' + url);
  if ((url[url.length-1].search('js') != -1) && (url[2] == 'localhost:8081')){
    var moduleName = url[url.length-1];
    console.log('Fetching:: '+moduleName);
    var pubAdmin = await gun.get('~@Admin').once().then();
    var objKeys = Object.keys(pubAdmin);
    console.log(await app.then());
    console.log(objKeys[1]);
    var modules = await gun.get(objKeys[1]).get('modules').then();
    console.log(modules);
    var data = await gun.get(objKeys[1]).get('modules').get(moduleName).once().then();
    if(!data){ data = await gun.get(objKeys[1]).get('modules').get(moduleName).once().then() }
    //TODO create response and return to client instead of sending a message;
    console.log('about to serve', data)
    var init = {status:200};
    var blob = new Blob([data], {type:'text/javascript'});
    var res = new Response(blob, init);
    await cache.put(event.request, res);
    console.log('served from Network');
    return res;
  } else {
    var res = await caches.match(event.request);
    if(res){
      console.log('served from Cache');
      return res
    }
    var res = await fetch(event.request);
    return res;
  }
  console.log('unhandled fetch', event.request);
}

// Handle PostMessage from client

self.addEventListener('message', function(event){
  event.waitUntil(
    msgHandler(event)
  )
})

async function msgHandler (event) {
 console.log(event);
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
