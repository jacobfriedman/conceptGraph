const DEBUG = false;

var app, ws;

export async function gunLoader(window) {

  if(('__gunLoaded' in window)) {
    return false;
  }

  window.__gunLoaded = true;

  function url () {
    this.parse = function (string) {
      return string
    }
  }

  var req = new Request('https://cdn.jsdelivr.net/npm/gun@0.2019.627/gun.min.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);

  function require (string) {
    DEBUG ? console.log(string) : null
    if(string == '../gun'){

      return window.Gun;
    } else if (string == 'ws') {
      return WebSocket;
    } else if (string == 'url'){
      return new url;
    }

  }

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

  // only eval seems to work

  //await import('https://cdn.jsdelivr.net/npm/gun/sea.js');
  var req = new Request('https://cdn.jsdelivr.net/npm/gun@0.2019.627/sea.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);

  //only eval seems to work

  //await import('https://cdn.jsdelivr.net/npm/gun/lib/promise.js')
  var req = new Request('https://cdn.jsdelivr.net/npm/gun/lib/promise.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);


  var req = new Request('https://cdn.jsdelivr.net/npm/gun/lib/open.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);

  var req = new Request('https://cdn.jsdelivr.net/npm/gun/lib/load.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);

  var req = new Request('https://cdn.jsdelivr.net/npm/gun/lib/path.js')
  var res = await fetch(req);
  var data = await res.text();
  eval(data);

  var options = {/*peers:['ws://localhost:8080/gun']*/};

  window.gun = window.Gun(options);

  window.bfs = async function* breadthFirstSearch (options) {
  // deconstruct options
  console.log(options);
  let id = options.identifier;
  let limit = options.limit || 1;
  let fn = options.fn || function(){null};

  // create state objects
  let level = 1; // current level starts at 1
  let stack = []; // open for exploration
  let nextLevel = []; // where to out the next level stack

  // get root object
  let object = await gun.get(id).promOnce();
  DEBUG ? console.log(object) : null
  // return root as first item
  yield object;

  for(var item in object.data) {
    if(item == "_"){continue}
    var soul = object.data[item]['#']
    if (DEBUG) {
      console.log(soul);
      console.log(object.data[item]);
      console.log(typeof object.data[item])
    }
    // check criteria

    // fetch child
    let child = await gun.get(soul).promOnce();
    child = child.data;
    
    if(DEBUG) {
      console.log(child);
    }
    // yield child
    yield child;

    // if level + 1 is not > limit, add children to nextLevel
  }

  // while level is less or equal to limit
  while (level <= limit ) {


    // increase level by 1 as we move down
    level += 1;

    stack = nextLevel
  }
}

return true

}
