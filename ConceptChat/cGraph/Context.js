import { gunLoader } from '../superpeer/lib/gunLoader.mjs';
import { MD5 } from './lib/_utilities.js';
import './lib/dom/HTMLElements/index.js'
import {HTMLFragment, HTMLFragmentGenerator, generateGunFragment} from './lib/dom/fragments/index.js'
// TODO: Move this to utils.js
// Promise.allSettled Shim
if (Promise && !Promise.allSettled) {
  Promise.allSettled = (promises) =>
    Promise.all(promises.map((promise) =>
      promise
        .then((value) => ({state: 'fulfilled', value}))
        .catch((reason) => ({state: 'rejected', reason}))
    ))
}

const DEBUG = false;

var gunLoaded = false;

export default class Context {
  constructor(
              identifier = undefined,
              initialItems = {concepts:[], relations:[], arcs:[] },
              attributes = {type: 'context', label:'this', value:'{}'}
  ) {

    // give context identifier if does not have one
    var application = undefined,
        hyperHTML = undefined,
        type = undefined;       // rules = new Map(),

        // routines = new Map(),

    return (async (identifier) => {

      // Is this the root context?

      this.__root = false

      if(!('context' in window)) {
        this.__root = true
      }

      //let gun = await gunLoader();

      // Import Concept Graph
      // Bind Concept Graph Functions to local context
      let module = await import('./index.js')
      let {
        query,
        concept,
        relation,
        arc,
        find
      } = module
      var coreMethodNames = [];

      // If Gun is not loaded, execute the loader
      !gunLoaded ? await gunLoader(window) : null;
      // Then say 'Gun is Loaded!'
       gunLoaded = true;

      // Iterate over module and bind key-functions
      for (let [key, value] of Object.entries(module)) {
        // Core Methods
        coreMethodNames.push(key)
        if (typeof value === 'function') {
          this[key] = value.bind(this)
        }
        if (typeof value === 'object') {
          this[key] = value
        }
      }
      // We need to give the context a label and assign it as a concept.
      // If the identifier is undefined, we give it an identity.
      // We also need to assert the value of the graphs inside of it.
      if(identifier === undefined) {

        this.identifier = identifier = Gun.node.soul(
              await concept(attributes))

      } else {
        this.identifier = identifier
      }

      // Here we inject the concepts/relations/arcs on context initialization.
      let promises = [];

      // TODO: DRY this
      if ('concepts' in initialItems) {
       if (initialItems.concepts.length > 0) {

          for(let value of initialItems.concepts) {
            const thing          = await concept(value);
            // Add to the graph
            promises.push(
              gun.get(this.identifier).get('referent').get('designator').get('concepts').promPut({[Gun.node.soul(thing)]:thing})
            )
          }
        }
      }
      if ('relations' in initialItems) {
       if (initialItems.relations.length > 0) {
          for(let value of initialItems.relations) {
            const thing          = await relation(value);
            // Add to the graph
            promises.push(
              gun.get(this.identifier).get('referent').get('designator').get('relations').promPut({[Gun.node.soul(thing)]:thing})
            )
          }
        }
      }
      if ('arcs' in initialItems) {
        if (initialItems.arcs.length > 0) {
          for(let value of initialItems.arcs) {
            const thing          = arc(value[0],
                                        value[1],
                                        // reference:
                                        this.identifier
                                    )
            // Add to the graph
            promises.push(
              gun.get(this.identifier).get('referent').get('designator').get('arcs').promPut({[Gun.node.soul(thing)]:thing})
            )
          }
        }
      }

      let initializers = await Promise.allSettled(promises);

      DEBUG ? console.log('✓ Context Constructor:', identifier) : null

       /*

        // TODO: Rules
        // console.log('✓ Running Rule...')
        // This should be a generator. That way we can iteratively process the
        // asynchronous value multiple times, much like a pipeline,

          for await (rule of rules) {
            var valid = await rule.apply(target);
            console.log(valid ? '✓ Rule' : '✗ Rule')
          }

        // TODO: Routines
        // console.log('✓ Running Routines...')
        // TODO: Move the below functions into routines here
        for await (routine of routines) {
          let routine = await routine.apply(target);
          console.log(routine ? '✓ Routine' : '✗ Routine')
        }

      */

      const traps = {

        // trap gets like context.concepts
        get: function(target, property) {

          if(property === '__root') {
            return target.__root
          }

          if(property === 'id' || property === 'text') {
            return target.identifier
          }
          if(property === 'identifier') {
            return target.identifier
          }

          if(property === 'concept') {
            return async (parameters) => {
              DEBUG ? console.log('Context Set Concept:', {parameters}) : null

                let thing = undefined;

                if((typeof parameters) === 'string') {
                  let thingData = await gun.get(parameters).promOnce();
                  thing = thingData.data;
                } else {
                  thing = await concept(parameters);

                }

                await gun.get(target.identifier).get('referent').get('designator').get('concepts').promPut({[Gun.node.soul(thing)]:thing})
                return thing;
              }

          }

          // Find accepts an array of nodes
          if(property === 'find') {
            return async (label, _type = 'concept', things) => {
             DEBUG ? console.log('Context Find:', {label}, {_type}, {things}) : null
                // TODO: Evaulate Rules
                if(things === undefined) {
                  if(_type = 'concept' ) {
                    things = await gun.get(target.identifier).get('referent').get('designator').get('concepts').then();
                  } else {
                    things = await gun.get(target.identifier).get('referent').get('designator').get('relations').then();
                  }
                }
                let result = await find(label, _type, things);

                return result;
              }
          }

          if(property === 'relation') {
              return async (parameters) => {
                DEBUG ? console.log('Context Set Relation:', {parameters}) : null
                // TODO: Evaulate Rules
                let thing = await relation(parameters);
                await gun.get(target.identifier).get('referent').get('designator').get('relations').promPut({[Gun.node.soul(thing)]:thing})
                return thing;
              }
          }

          if(property === 'arc') {
            return async (parameters) => {

              DEBUG ? console.log('Context Set Arc:', {parameters}) : null
              // TODO: Evaluate Rules
              // Add to the graph
              await arc(parameters[0], parameters[1], target.identifier)
            }
          }

          if(property === 'referent') {
            return gun.get(target.identifier).get('referent').promOnce();
          }

          if(property === 'concepts') {
            return gun.get(target.identifier).get('referent').get('designator').get('concepts').promOnce();
          }

          if(property === 'relations') {
            return gun.get(target.identifier).get('referent').get('designator').get('relations').promOnce();
          }

          if(property === 'arcs') {
            return gun.get(target.identifier).get('referent').get('designator').get('arcs').promOnce();
          }

          if(property === 'type') {
            return  gun.get(target.identifier).get('type').promOnce();
          }

          if(property === 'label') {
            return  gun.get(target.identifier).get('label').promOnce();
          }

          if(property === 'html') {
            return id
          }

          if(property === 'graph') {
             return target.graph
          }

          // In CGs, a context is defined as a concept
          // whose referent field contains nested conceptual graphs.
          // Since every context is also a concept, it can have a type label,
          // coreference links, and attached conceptual relations.

          if(property === 'value') {
            return gun.get(target.identifier).get('graphs').promOnce()
          }

          if (!(name in target)) {
            return 'not found'
          }

          return target[name]

        },

        // Every time we want to
        set: async function(target, attribute, value) {

          let promises = [];
          let last = undefined;

          if (  attribute === 'this' ) {
            console.error("❌ Please refer to the context directly as `this` is a reserved term")
            return false
          }
          // update(target);

          return true;
        }
      }


      var context = new Proxy(this, traps);

          if(this.__root) {


            // TODO: document.removeChild(document.children[0])

            // Symbolize this unique concept:
            // Symbol()
            // https://github.com/whatwg/dom/issues/736
            // A persistent fragment retains its children!

           //console.log(HTMLFragmentGenerator().next(), HTMLFragmentGenerator().next(),'gen')

           /*

            // THIS IS WHERE WE USE GENERATORS
            // from https://medium.com/content-uneditable/generators-motherf-r-do-you-use-them-a7b8d1014241
            *getNodes() {
                   for ( let node of this.nodes ) {
                         if ( node instanceof DocumentFragment )
                              yield* node;
                         else
                              yield node;
                   }
              }

           */


        // TODO: Rules
        // console.log('✓ Running Rule...')
        // This should be a generator. That way we can iteratively process the
        // asynchronous value multiple times, much like a pipeline,

          /*for await (rule of rules) {
            var valid = await rule.apply(target);
            console.log(valid ? '✓ Rule' : '✗ Rule')
          }
          */

          // Run Rules

          // Run Axioms

          // contentEditable!
          document.execCommand("defaultParagraphSeparator", false, "p");

           generateGunFragment(identifier, this.__root)


           // arcs
           // relations
           // concepts

           // label
           // type
           // referent
           // - descriptor
           // - designator

              // - concepts
              // - relations
              // - arcs

           // - literalType
           // - quantifier
           // - referentType

           //gun.get(identifier).get('referent').once((node) =>)
          /* gun.get(identifier).once(function(node) {




            for (let key in node) {
              let value = node[key];

              if(key === 'referent') {

                if(value['#'] !== identifier) {

                  let keyFragment = HTMLFragmentCache(
                                    new HTMLFragment(value['#'], 'referent'),
                                    value['#']
                                );

                  contextFragment.querySelector(`[identifier=${identifier}]`).appendChild(keyFragment)

                 }
              }
            }

           })
           */

          // document.body.appendChild(contextFragment)



            // Add document fragment to the weakmap.
            // Inside the
            //fragments.set(contextFragment, identifier)

           /* let contextHTMLElement = document.createElement('context-');
                contextHTMLElement.setAttribute('identifier',identifier)
                */
            //console.log(contextFragment.children,'thechildren1')

           // documentFragment.appendChild(contextHTMLElement)

            //document.body.appendChild(contextFragment)

          //  console.log(contextFragment.children,'thechildren')

          }



            //console.log(document.body.querySelectorAll(`[identifier=${identifier}]`),'query')

           // hyper(document.body.querySelectorAll(`[identifier=${identifier}]`))`${wire}`

            // if(this.__root) {

             // hyper(document.body)`${{thing:data}}`



            // }



           // if(__root) {

           // }

//if(data === window.context.identifier) {

            //  hyper(document.body)`${{thing:data}}`

           // }



          //hyper(document.body)`${wire(data,`thing:${Gun.node.soul(data)}`)`${{thing:data}}`}`

/*
<${type.data}- identifier=${identifier}></${type.data}->
*/


       /* else {

        } */

      /* gun.get(proxyContext.identifier).get('referent').get('designator').get('concepts').map().on(result => {
               document.body.appendChild(wire(result,`concept:${result['_']['#']}`)`<p>label: ${result.label}, type: ${result.type}</p>`)
          })
          */
        //} else {

       //   console.log( await gun.get(window.context.identifier).get('referent').get('designator').get('concepts').get(proxyContext.identifier).promOnce(), 'inthecontext')
      //  document.body.appendChild(`${wire(proxyContext,`concept:${id}`)`${{concept: proxyContext}}`}`
       /*document.body.appendChild(wire(proxyContext,`:${proxyContext.identifier}`)`

            ${ gun.get(proxyContext.identifier).get('referent').get('designator').get('concepts').map().on(result => {
              wire(result,`concept:${result['_']['#']}`)`<p>label: ${result.label}, type: ${result.type}</p>`
            }) }`
         )

        }*/
      //  }
     // }

      // assert a 'value' for the concept
      // assert the 'type' for the concept
      /* Upon insertion of contexts and relations... */


     // gun.get(this.identifier).get('referent').get('designator').get('arcs').map().on(result => update(context, result), true);
     // gun.get(this.identifier).on(result => update(context), true);

      // update(context);

      DEBUG ? console.log('✓ Context Proxy Created') : null

      return context

    })(identifier);

  }

}


function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('No Id:', variable);
}

/*
(async () => {

  let context = await new Context(getQueryVariable('id') || undefined);

  window.context = context

})()
*/
