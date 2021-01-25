/* Service Worker to intercept Fetch for modules */

//initialize a sw
const CACHE_NAME = "Cachev2";
const urlsToCache = ["/"];
var client;


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
  var url = event.request.url.split('/');
  var res = await caches.match(event.request);

  if(res) {
    console.log('served from Cache');
    return res;
  } else {
    console.log('served from Network');
    if ((url[3].search('js') != -1)){
      var pubAdmin = await gun.get('~@Admin').once().then();
      var objKeys = Object.keys(pubAdmin);
      var data = await gun.get(objKeys[1]).get('modules').get(url[3]).once().then();

      //TODO create response and return to client instead of sending a message;
      console.log('about to serve', data)
      var init = {status:'200'};
      // send request to client hit later at cache
      var mod = await getModuleString(url, event.request);
    }
    var res = await fetch(event.request);
    return res;
  }


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

/* Working on push notification via Gun */

self.addEventListener('push', function(event){
  self.registration.showNotification('Testing this', {
    body: event.data.name
  });
});

var evPush = new CustomEvent('push', {body:'test'});


/* Gun implementation in Service Worker */

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
  gun._.on('out', (msg) => {console.log('out',msg)});
  gun._.on('in', (msg) => {console.log('in--------',msg)});
  app = gun.get('conceptChat');
  console.log(await app.once().then());
  console.log(await app.then());

  gun.get('test').on(async function (data) {
    evPush.data = data;
    self.dispatchEvent(evPush)
  })
})()
