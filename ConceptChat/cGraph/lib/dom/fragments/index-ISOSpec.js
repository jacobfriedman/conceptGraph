import './node.js';
import './element.js';
import DocumentPersistentFragment from './document-persistent-fragment.js';
import '../HTMLElements/index.js'
import {MD5} from'../../_utilities.js'
//export default DocumentPersistentFragment;

const DEBUG = false;

// TODO: Turn this into a proxy with built-in cache
var HTMLFragmentStore = {};

// TODO: Turn this & below function into a proxy with built-in cache
const gunNodeHTMLFragmentStore = new WeakMap();
function gunNodeHTMLFragmentCache(node, identifier, parentIdentifier, type) {

    if(gunNodeHTMLFragmentStore.has(node) === false) {

        let nodeHTMLFragment = new HTMLFragmentSeeder(identifier, parentIdentifier, type, node);
        gunNodeHTMLFragmentStore.set(node, nodeHTMLFragment);
        DEBUG ? console.log('Gun-HTML Fragment Cache: Setting', node) : null;
        return nodeHTMLFragment

    } else {

        DEBUG ? console.log('Gun-HTML Fragment Cache Lookup: Already Up-to-date with ', identifier) : null;
        return gunNodeHTMLFragmentStore.get(node);

     }

}

// We really should just export the cached version of this.. 
export class HTMLFragment extends DocumentPersistentFragment {

    constructor(identifier, thisFragmentOriginalType = 'thing', node, root = false) {

        if (root = true) {

            document.implementation.createHTMLDocument('test')

        }

        let thisFragmentConstructor = super(identifier),
            thisFragment            = document.createElement(thisFragmentOriginalType+'-'),
            thisFragmentSummary     = document.createElement('pre');

        if(thisFragmentOriginalType !== identifier) {
            thisFragmentSummary.innerHTML = `${thisFragmentOriginalType}: ${identifier} ${node.label ? 'Label:'+node.label : ''}`;
        }

        thisFragment.setAttribute('identifier', identifier);

        document.createElement(thisFragmentOriginalType+'-');

        if(thisFragmentOriginalType !== identifier) {
           // thisFragmentConstructor.appendChild(thisFragmentSummary)
        }

        //thisFragment.setAttribute('label', node.label)
        thisFragmentConstructor.appendChild(thisFragment)

        return thisFragmentConstructor;
    }

}

let HTMLFragmentSeeder = function(identifier, parentIdentifier, type, node) {

    let root = false;
    // why is this not DRY?
    if(parentIdentifier === undefined) {
        type = 'context'
        root = true;
    }

    HTMLFragmentStore[identifier] = new HTMLFragment(identifier, type, node, root);

    if(parentIdentifier === undefined) {

            document.body.appendChild(HTMLFragmentStore[identifier])

    } else {

        //let parents = document.body.querySelectorAll(`[identifier=${parentIdentifier}] [identifier=${identifier}]`);

        let parents = document.body.querySelectorAll(`[identifier=${parentIdentifier}]`);

        for(let i = 0; i < parents.length; i++) {

            let parent = parents[i];

            parent.appendChild(HTMLFragmentStore[identifier]);

        }

        //let children = HTMLFragmentStore[parentIdentifier].querySelectorAll(`[identifier=${identifier}]`);

       /* if(children.length === 0) {

            let test = HTMLFragmentStore[parentIdentifier].querySelectorAll(`[identifier=${parentIdentifier}]`)  //.appendChild(HTMLFragmentStore[identifier])
            console.log(test,'TEST')
        } else {

            console.log(children,'THECHILDREN')

        }*/

    }

    // Save the fragment in 
    //HTMLFragmentStore[identifier] = fragment;

    return HTMLFragmentStore[identifier]

}


// We really should just export the cached version of this.. 
export class NodeHTMLFragment extends DocumentPersistentFragment {

    constructor(identifier, parentIdentifier, thisFragmentOriginaltype = 'thing') {
    console.log('Constructing HTML Fragment: ', identifier)

    let thisFragmentConstructor = super(identifier);
        

    // let thisFragment            = document.createElement(thisFragmentOriginaltype),
    //     parentFragment          = HTMLFragmentStore[parentIdentifier];

    //     console.log(thisFragment,'thefragment', thisFragmentConstructor,'fragmentconstructor')

    //     HTMLFragmentStore[identifier] = thisFragmentConstructor;

      /*  let parents = document.body.querySelectorAll(`[identifier=${parentIdentifier}]`)

        console.log(parents, 'parents')

        for (var i = 0; i < parents.length; i++) {
          parents[i].appendChild(thisFragment)
        }
        */

    //let HTMLFragmentProxy = 
    /*
    TODO: Use the Proxy to return sets.
    const HTMLFragmentProxyTraps = {

        // trap gets like context.concepts
        get: function(target, property) {

          if(property === '__root') {
            return target.__root
          }

        },
        set: function(target, attribute, value) {



        }

      var context = new Proxy(this, traps);
    */

   // gun.get(identifier).get('type').on(function(thisFragmentType) { })

    // Element type insertion:
    // This reruns when the type changes.
    //gun.get(identifier).get('type').on(function(thisFragmentType) {

        // TODO
        //if(thisFragmentType !== thisFragmentOriginaltype) {}

       // thisFragment = document.createElement(thisFragmentType+'-');
/////    //     thisFragment.innerHTML = 'this is '+identifier;
/////    //     thisFragment.setAttribute('identifier',identifier)
     
        // Begin getting attributes
        /*gun.get(identifier).once(function(node) {

            for (let key in node) {
              let value = node[key];
              
              if(typeof value === 'object') {

                if (key === 'referent') {

                    let thisReferentFragment = document.createElement('referent-');
                        thisReferentFragment.setAttribute('identifier',value['#'])
                    
                    thisFragment.appendChild(thisReferentFragment)
                    

                   new HTMLFragment(value['#'], key);

                }
                
                //
                //console.log(value, key,'THEVALUE')

              } else {

                gun.get(identifier).get(key).on(function(node) {
                    key !== identifier ? thisFragment.setAttribute(key, node) : null
                    //element.render()
                })

              }

            }

            //console.log({key}, {value}, {identifier} ,'thekeyvalueidentifier')

            // ...
            
            //console.log(document.querySelectorAll(`[identifier=${identifier}]`),'identifier')

            /*if(typeof(value) === 'object') {
             //if(key === 'referent') {

                let fragment = new ThingFragment(Gun.node.soul(value));

                //console.log(Gun.node.soul(value),'GUNNODESOULVALUE')

                //document.querySelector('#')

             //}

            } else {
              //key !== identifier ? element.setAttribute(key, value) : null;
            }
            */

          //  document.body.appendChild(thisFragmentConstructor)

      //  })


        

      /*  let clones = thisFragmentConstructor.querySelectorAll(`[identifier=${identifier}]`)

        console.log(clones, 'clones')

        for (var i = 0; i < clones.length; i++) {
          clones[i].parentNode.replaceChild(thisFragment, clones[i])
        }
        */
        
        

    //})
    // end type-call

    // thisFragmentConstructor.appendChild(thisFragment)

//    HTMLFragmentStore[identifier] = thisFragmentConstructor; //.appendChild(thisFragment)
    
        //document.body.appendChild(thisFragment)
    /*if(document.body.children.length == 1) {
        document.body.appendChild(thisFragmentConstructor)
    }*/
    
    //let clones = document.body.querySelectorAll(`[identifier=${identifier}]`)

    /*console.log('clones')

    for (var i = 0; i < clones.length; i++) {
      clones[i].parentNode.replaceChild(thisFragmentConstructor, clones[i])
    }
    */
    

    //console.log(document.querySelectorAll(`[identifier=${identifier}]`),'identifier')

    return thisFragmentConstructor;

    }

    get nodeName() {
        return '#'+this.identifier;
    }


}

let fragmentListenerIndex = new Set();

export const generateGunFragment = function (identifier, rootFragment) {



        // Index this fragment/listener
        if(fragmentListenerIndex.has(identifier)) {
            return false;
        } else {
            fragmentListenerIndex.add(identifier)
        }

        if(rootFragment) {
            gunNodeHTMLFragmentCache({}, identifier);
        }

        gun.get(identifier).map().on(function(value, key) {

            let soul = Gun.node.soul(value)

            if(Gun.node.soul(value) === identifier) {
                return false
            }

            console.log(value,key,'VALUEKEY')

            if(Gun.node.is(value)) {

                   let keyFragment = gunNodeHTMLFragmentCache(value, soul, identifier, key);
                
                   // generateGunFragment(soul)
           
                }

        })

        // TODO: IMPLEMENT GENERATORS
        /*var generator = window.bfs({identifier})
        let children = [];
        let parent = await generator.next()
        let done = false;

        // the first next is the parent
        while(!done){
           let child = await generator.next();
           if(child.done == true) {
                done = true;
                continue;
            }
           // do something with the child or
           children.push(child)
        }

        console.log(children,'THECHILDREN')

        return children;
        */

}

// This class gives a new HTMLFragment with a next() command.
export const HTMLFragmentGenerator = function*(identifier, elementType) {

        /*function* (identifier, elementType) {
            new HTMLFragment(identifier, elementType)
        }
            yield* [1,2,3] //
        //}
        */


}






