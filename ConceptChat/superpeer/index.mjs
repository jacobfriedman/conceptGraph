import Gun from './node_modules/gun/lib/server.js'
import fs from 'fs'
import vm from 'vm'
import express from 'express'

var app = express();
var port = 8765;

app.use(express.static('../'))

app.get('/', function(req,res){

    res.send(fs.readFileSync('../client.html', 'utf8'));

});


var server = app.listen(port, ()=>{console.log('server listening on ', port)});

var peers = ['http://e2eec.herokuapp.com/gun'];
var gun = Gun({peers:peers, axe:false,multicast:false});
var root = gun.get('conceptChat');

//var user = gun.user();

gun._.on('in', (msg)=>{
  console.log('in<-------------------')
  console.log(msg);
})

gun._.on('out', (msg)=>{
  console.log('out------------------>')
  console.log(msg);
})

root.put({name:'conceptChat', appV:'v0.1'});

//Loading Modules into a string for bootstrapping into CG System

var cgApp = fs.readFileSync('./lib/cgApp.mjs', 'utf8');
var bootstrap = fs.readFileSync('./lib/Bootstrap.mjs', 'utf8');
var sRules = fs.readFileSync('./lib/Rules.mjs', 'utf8');
var inference = fs.readFileSync('./lib/inference.mjs', 'utf8');
var nearley = fs.readFileSync('./lib/nearley.mjs', 'utf8');
var cgif = fs.readFileSync('./lib/cgif.mjs', 'utf8');




var rules = "(function installLaws (){";
rules += nearley;
rules += cgif;
rules += cgApp;
rules += bootstrap;
rules += sRules;
rules += inference;
rules += "})()";

gun.get('module').put(rules);


//TODO ASYNC Function

let userN = process.argv[2];
let passphrase = process.argv[3];
//user.create(userN, passphrase).then((user)=>{console.log(user)}).catch((err)=>{console.log(err)});
/*
setTimeout(auth, 2000);
console.log('Attempting login in 2 seconds');

function auth () {
  user.auth(userN, passphrase, function(ack) {
    console.log('auth callback');
    if(ack.err){
      console.log(ack.err);
      console.log('reattempting in 1 second');
      setTimeout(auth.bind(this), 1000)
    } else {
      console.log('User logged in');

      (async function __initialize () {
        var pubGuest = await gun.get("~@Guest").once().then();
        var objKeys = Object.keys(pubGuest);
        var guest = await gun.get(objKeys[1]).once().then();
        var eKey = {epub:guest.epub};
        var sKey = await SEA.secret(eKey, user._.sea);
        var encData = await SEA.encrypt(rules, sKey);
        user.get('laws').put({[guest.pub]:encData});

        var modules = user.get('modules');
        var cgApp = fs.readFileSync('./lib/cgApp.js', 'utf8');
        modules.get('cgApp.js').put(cgApp);
        var bootstrap = fs.readFileSync('./lib/Bootstrap.js', 'utf8');
        modules.get('Bootstrap.js').put(bootstrap);
        var sRules = fs.readFileSync('./lib/Rules.js', 'utf8');
        modules.get('Rules.js').put(sRules);
        var inference = fs.readFileSync('./lib/inference.js', 'utf8');
        modules.get('inference.js').put(inference);
        var nearley = fs.readFileSync('./lib/nearley.js', 'utf8');
        modules.get('nearley.js').put(nearley);
        var cgif = fs.readFileSync('./lib/cgif.js', 'utf8');
        modules.get('cgif.js').put(cgif);
        var _util = fs.readFileSync('../../cGraph/lib/_utilities.js', 'utf8');
        modules.get('_utilities.js').put(_util);
        var assi = fs.readFileSync('../../cGraph/lib/assignments.js', 'utf8');
        modules.get('assignments.js').put(assi);
        var disp = fs.readFileSync('../../cGraph/lib/dispatcher.js', 'utf8');
        modules.get('dispatcher.js').put(disp);
        var obs = fs.readFileSync('../../cGraph/lib/observer.js', 'utf8');
        modules.get('observer.js').put(obs);
        var pars = fs.readFileSync('../../cGraph/lib/parseCGIF.js', 'utf8');
        modules.get('parseCGIF.js').put(pars);
        var proc = fs.readFileSync('../../cGraph/lib/procurements.js', 'utf8');
        modules.get('procurements.js').put(proc);
        var stores = fs.readFileSync('../../cGraph/lib/stores.js', 'utf8');
        modules.get('stores.js').put(stores);
        var boot = fs.readFileSync('../../cGraph/bootstrapcG.js', 'utf8');
        modules.get('bootstrapcG.js').put(boot);
      })()
    }
  });
}
*/


const sec = { secret: 42 };
const contextifiedSandbox = vm.createContext(sec);


/*(async () => {
  // Step 1
  //
  // Create a Module by constructing a new `vm.SourceTextModule` object. This
  // parses the provided source text, throwing a `SyntaxError` if anything goes
  // wrong. By default, a Module is created in the top context. But here, we
  // specify `contextifiedSandbox` as the context this Module belongs to.
  //
  // Here, we attempt to obtain the default export from the module "foo", and
  // put it into local binding "secret".

  const bar = new vm.SourceTextModule(`
    import s from 'foo';
    s;
  `, { context: contextifiedSandbox });

  // Step 2
  //
  // "Link" the imported dependencies of this Module to it.
  //
  // The provided linking callback (the "linker") accepts two arguments: the
  // parent module (`bar` in this case) and the string that is the specifier of
  // the imported module. The callback is expected to return a Module that
  // corresponds to the provided specifier, with certain requirements documented
  // in `module.link()`.
  //
  // If linking has not started for the returned Module, the same linker
  // callback will be called on the returned Module.
  //
  // Even top-level Modules without dependencies must be explicitly linked. The
  // callback provided would never be called, however.
  //
  // The link() method returns a Promise that will be resolved when all the
  // Promises returned by the linker resolve.
  //
  // Note: This is a contrived example in that the linker function creates a new
  // "foo" module every time it is called. In a full-fledged module system, a
  // cache would probably be used to avoid duplicated modules.

  async function linker(specifier, referencingModule) {

    console.log(specifier, referencingModule)
    if (specifier === 'foo') {
      return new vm.SourceTextModule(`
        // The "secret" variable refers to the global variable we added to
        // "contextifiedSandbox" when creating the context.
        export default secret;
      `, { context: referencingModule.context });

      // Using `contextifiedSandbox` instead of `referencingModule.context`
      // here would work as well.
    }

    throw new Error(`Unable to resolve dependency: ${specifier}`);
  }
  await bar.link(linker);

  // Step 3
  //
  // Instantiate the top-level Module.
  //
  // Only the top-level Module needs to be explicitly instantiated; its
  // dependencies will be recursively instantiated by instantiate().

  bar.instantiate();

  // Step 4
  //
  // Evaluate the Module. The evaluate() method returns a Promise with a single
  // property "result" that contains the result of the very last statement
  // executed in the Module. In the case of `bar`, it is `s;`, which refers to
  // the default export of the `foo` module, the `secret` we set in the
  // beginning to 42.

  const { result } = await bar.evaluate();

  console.log(result);
  // Prints 42.
})();*/
