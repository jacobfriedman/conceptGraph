
import * as fs from 'fs'
import vm from 'vm'

//import cGraph from '../../cGraph/index.js'


 // ->[Module:identifier]-(data)-[String:'export etc...'], -(version)-[String:'0.2019.627']

const contextifiedSandbox = vm.createContext({});

(async () => {
  // Step 1
  //
  // Create a Module by constructing a new `vm.SourceTextModule` object. This
  // parses the provided source text, throwing a `SyntaxError` if anything goes
  // wrong. By default, a Module is created in the top context. But here, we
  // specify `contextifiedSandbox` as the context this Module belongs to.
  //
  // Here, we attempt to obtain the default export from the module "foo", and
  // put it into local binding "secret".

  const bar = new vm.SourceTextModule(  
	fs.readFileSync('../../cGraph/index.js', 'utf8')
  	, { context: contextifiedSandbox });

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
   /* if (specifier === 'foo') {
      return new vm.SourceTextModule(`
        // The "secret" variable refers to the global variable we added to
        // "contextifiedSandbox" when creating the context.
        export default secret;
      `, { context: referencingModule.context });

      // Using `contextifiedSandbox` instead of `referencingModule.context`
      // here would work as well.
    }
    */


    // TODO: MAKE THIS SPECIFIER LOAD THE IDENTITY AS IT WALKS UP THE CONTEXT

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
})();


/*
import Gun from 'gun'
import SEA from 'gun/sea.js'
const peers = ['https://E2EEC.herokuapp.com/gun']
var gun = Gun({peers:peers, axe:false});
var app = gun.get('conceptChat').put({name:'conceptChat', appV:'v0.1'});
var user = gun.user();
*/

/* Loading Modules into a string for bootstrapping into CG System */
/*
var cgApp = fs.readFileSync('./lib/cgApp.js', 'utf8');
var bootstrap = fs.readFileSync('./lib/Bootstrap.js', 'utf8');
var sRules = fs.readFileSync('./lib/Rules.js', 'utf8');
var inference = fs.readFileSync('./lib/inference.js', 'utf8');
var nearley = fs.readFileSync('./lib/nearley.js', 'utf8');
var cgif = fs.readFileSync('./lib/cgif.js', 'utf8');

var modules = user.get('modules');
modules.get('bootstrap').put(bootstrap);
modules.get('cgApp').put(cgApp);


var rules = "(function installLaws (){";
rules += nearley;
rules += cgif;
rules += cgApp;
rules += bootstrap;
rules += sRules;
rules += inference;
rules += "})()";
*/