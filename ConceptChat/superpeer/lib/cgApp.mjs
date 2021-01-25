import Context from '../../../cGraph/Context.js';
import * as nearley from './nearley.mjs';
import * as cgif from './cgif.mjs';


const debug = false;
const DEBUG = false;

var global;

export async function init (window) {
  global = window;
  return global;
}

/*
// Anything that happens, triggers an assertion of a graph.
// 1 - Graph is asserted. (Log the request)
// 2 - We run the graph over rules to see if anything matches.
// 3 - First match is checked (check conclusion so if we already have applied this rule
//     we won't do it again)
// 4 - Assert the result and end.
// 5 - If no rule was applicable, we try to check for schemas
// 6 - If a schema is applicable, we add it to a list of possible intents, the user can choose from
//     "Did you mean to ....?"
// 7 - No schema, no rule, what should we do? We definitely want to save this as unhandled and return a
//     "randomized error message"
//
*/

// Function that returns a unique UUID {string}
function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/*
* Represents a store of axioms for a domain
* @constructor
* @param {string} domainLabel - label of the domain
*/

function axiomStore (domainLabel) {
 this.label = domainLabel;  // label
 this.uuid = uuidv4();
 this.axioms = [];  // array to store axioms
 //this.gunPath = gun.get(label); //define base path for db
 this.find = function (label) {
   var i = 0;
   var l = this.axioms.length;
   for(i;i<l;i++){
     if(this.axioms[i].label === label) {
       return this.axioms[i];
     }
   }
   //console.log('Error: no axiom found');
 };
 this.add = function(graph) {
   //add a copy of the graph not a reference of it.
   var cgraph = JSON.parse(JSON.stringify(graph));
   graph = Object.assign(new Thing(), cgraph);
   this.axioms.push(graph);
 };
}

 /*
 * The term that makes up the universe
 * @constructor
 * @param {string} label - a string to represent the thing
 * @param {string} type - axiom, concept, relation, function?
 * @param {uuid} uuid - unique identifier
 * @param {object} arcs - objectArray of arcs in order as defined in ontology (relation)
 * @param {string, int, undefined} referent - referent (concept)
 * @param {string} identifier - used in the creation of the graph
 * @param {float} fuzzy - float representing how true something is range [0, 1]
 */

function Thing (label, type, uuid, arcs, referent, identifier, fuzzy) {
 this.label = label;
 this.type = type;
 this.uuid = uuid;
 this.arcs = arcs;
 this.referent = referent;
 this.identifier = identifier;
 this.fuzzy = fuzzy;
 this.out = []; //outgoing relations (any relations connected to this concept)
 this.concept = []; //concept array for axioms
 this.relation = []; //relation array for axioms
 this.addConcept = function (label, type, uuid, arcs, referent, identifier, fuzzy) {
   if(typeof label == 'string') {
   var item = new Thing(label, type, uuid, arcs, referent, identifier, fuzzy);
   } else {
   var item = label;
   }
   this.concept.push(item);
   return item.uuid;
 };
 this.addRelation = function (label, type, uuid, arcs) {
   if(typeof label == 'string') {
   var item = new Thing(label, type, uuid, arcs);
   } else {
   var item = label;
   }
   this.relation.push(item);
   var list = Object.keys(item.arcs);
   for(let i=0;i<list.length;i++){
     var temp = this.find('uuid', item.arcs[list[i]]);
     if(temp) {
       temp.out.push(item.uuid); //needs to be a set
     } else {
       //console.log(item.arcs[list[i]] + ' undefined!');
     }
   }
   return item.uuid;
 };
 this.deleteConcept = function (uuid) {
   var i = 0;
   for(i;i<this.concept.length;i++){
     if(this.concept[i].uuid === uuid) {
       this.concept.splice(i,1);
     }
   }
 };
 this.deleteRelation = function (uuid) {
   var i = 0;
   for(i;i<this.relation.length;i++){
     if(this.relation[i].uuid === uuid) {
       this.relation.splice(i,1);
     }
   }
 };
 this.find = function (prop, item) {
   var i = 0;
   var lC = this.concept.length;
   for(i;i<lC;i++){
     if(this.concept[i][prop] === item) {
       return this.concept[i];
     }
   }
   var y = 0;
   var lR = this.relation.length;
   for(y;y<lR;y++){
     if(this.relation[y][prop] === item) {
       return this.relation[y];
     }
   }
   return false;
 };
 this.execute = function (reasoner) {
   if(this.conclusion) {
     reasoner.assert(this.conclusion);
   } else {
     //console.log('no conclusion')
   }
   return;
 };
 this.setCon = function (graph, reasoner, args) {
   // save reference to reasoner
   var reason = arguments[0];
   // if we have more arguments
   if(arguments.length>0){
     // get each concept with the identifier in the rule graph and
     // copy referent into the conclusion before telling into the Reasoner.
   }
   this.conclusion = graph;
 };
}
// Public Interface window.__CG.cg.

  // returns a uuid
export function getUuid() {
  return uuidv4();
}
  //returns an axiomStore Object
export function getStore (domainLabel) {
 return new axiomStore(domainLabel);
}
  // returns a Thing Object
export function getThing (label, type, uuid, arcs, referent, identifier, fuzzy) {
  return new Thing(label, type, uuid, arcs, referent, identifier, fuzzy);
}


  // parse a CGIF string into a thing object / graph
export async function parse (string, context = global.context, type = "Rule", base64 = false, returnContext = false) {


  if(typeof string != 'string'){ throw('parse needs a string')}
  // if the context is the global context, we create a new graph.
  if(context.identifier == global.context.identifier) {
   DEBUG ?  console.log('Parse: Global Context') : 0;
  } else {
   DEBUG ? console.log(await context.label) : 0;
  }

  //get setter from parent context
  let setGraph = context.concept;

  var parsedResults = new nearley.Parser(nearley.Grammar.fromCompiled(cgif.grammar)).feed(string).results,
                ast = parsedResults;

  // make sure we are not duplicating the same rule again.
  var duplicationCheck = await context.find(base64 ? atob(ast[0].label) : ast[0].label, 'concept');

  console.log('Context search: "',base64 ? atob(ast[0].label) : ast[0].label, '" ...', duplicationCheck);

  // check if this graph is already in the context we are planning on adding it
  // into

  if(base64) {
    if(duplicationCheck) {
      if(duplicationCheck.label == atob(ast[0].label)) {
        console.warn('graph with the same label: ' + atob(ast[0].label) +' . Already in context.')
        return duplicationCheck.identifier;
      }
    }
  }

  if(duplicationCheck) {
    if(duplicationCheck.label == ast[0].label) {
      console.warn('graph with the same label: ' + base64 ? atob(ast[0].label) : ast[0].label +' . Already in context.')
      return duplicationCheck.identifier;
    }
  }

  for(var result of ast) {
    // split out data from the parser
    var tree = result.data;

    // new: aka await a new context
    let newGraph = await new Context();
    let newGraphIdentifier = undefined;
    // get setters for new Graph
    let setConcept = newGraph.concept;
    let setRelation = newGraph.relation;
    let setArc = newGraph.arc;

    //if only one concept is passed add it to
    if(tree.length == 1) {
      //Only one thing is added into the tree (must be a concept);
      if(tree[0][0].type == 'concept') {
        tree[0][0].graphid = await setConcept({
          label:tree[0][0].label,
          type: tree[0][0].type,
          value: tree[0][0].referent
        });
        await setGraph({
      	  label: base64 ? atob(ast[0].label) : ast[0].label,
      	  type: base64 ? atob(ast[0].type) : ast[0].type,
      	  value: newGraph.identifier,
      	  referentOptions: {
      	      identifier: newGraph.identifier,
      	      referentType: 'gun',
      	    },
      	  identifier: newGraph.identifier
        });

        return;
      } else {
        throw('adding only '+ base64 ? atob(ast[0].label) : ast[0].label + ' / ' + tree[0][0].type +' not acceptable at leas one concept');
      }
    }

    // in CGIF each concept is identified with *x ... *n and Relations specifically
    // reference which concepts ?x?y are related through this relation
    // let's create a map that represents the arcs in the graph

    var arcs = new Map();
    // iterate over the tree
    for(var item of tree) {
      item = item[0];
      
      // Convert from base64 if necessary
      if('identifier' in item) {
        base64 ? item.identifier = atob(item.identifier.substr(1)) : item.identifier = item.identifier.substr(1);
      }
      if('label' in item) {
        base64 ? item.label = atob(item.label) : 0;
      }
      if('referent' in item) {
        base64 ? item.referent = atob(item.referent) : 0;
      }

      //if this is a concept it will have an identifier
      if(item.identifier){
        // Seek the concept out

        // console.log(item,'THEITEM')
        let concept = await gun.get(item.identifier).then();

        if(concept === undefined) {
            console.log(item,'THEITEM')
            concept = await setConcept({
            label: item.label,
            type: item.label,
            value: item.referent
          })
        }

        // add it to the map for arcs between *x and ?x

        if(arcs.has(identifier)){
          var array = arcs.get(identifier);
          array.push("c::"+Gun.node.soul(concept));
          arcs.set(identifier, array);
        } else {
          var array = [];

         //  console.log(identifier,'THEIDENTIFIER')
          array.push("c::"+Gun.node.soul(concept));
          if(identifier !== undefined) {
            arcs.set(identifier, array);
          }
        }

      }

      //if this is a relation it will have an array arcI
      if(item.arcI) {
         //console.log(`item is a relation`, item);

        // console.log(item.type,'ITEMTYPE')

        // add it to the context
        var relation = await setRelation({
          label: item.label,
          type: item.label,
        })

        // for each identifier ?x, ?y add it to the map between respective id
        for(var identifier of item.arcI) {

          identifier = base64 ? atob(identifier.substr(1)) : identifier.substr(1);

          if(arcs.has(identifier)){
            var array = arcs.get(identifier);
            array.push("r::"+Gun.node.soul(relation));
            arcs.set(identifier, array);
          } else {
            var array = [];
            array.push("r::"+Gun.node.soul(relation));
            arcs.set(identifier, array);
          }
        }
      }


      //iterate over map and create and add to context arcs

      arcs.forEach(async (array, id) => {
      // console.log('identifier', id);
        let concept;

        //find the concept for this identifier
        for(let item of array){
          let string = item.slice(0,3)
         // console.warn(string, item.substring(3));
          if(string == "c::"){
            concept = item.substring(3);
          }
        }

        // for each relation referencing the concept create an arc from concept to relation
        for(let item of array){
          let string = item.slice(0,3);
         // console.warn(string, item.substring(3));
          if(string == "r::"){
            
            let relation = item.substring(3);

            if(concept !== undefined && relation !== undefined) {
              await setArc([relation, concept])
            }
          }
        }

      });


      await gun.get(newGraph.identifier).open(item => console.log(item))

      //console.log(newGraph.identifier,'THENEWIDENT', atob(ast[0].label), type)

      
      await setGraph({
        label: base64 ? atob(ast[0].label) : ast[0].label,
        type,
        value: newGraph.identifier,
        referentOptions: {
            identifier: newGraph.identifier,
            referentType: 'gun',
          },
        identifier: newGraph.identifier
      });

  
    }



    /*
    OLD LEGACY */
    // old: create a new graph that contains the parsed inputs
    var temp = getThing(result.label, result.type, uuidv4());

    // Build a list of concepts and add it to axioms from parsed input
    for(var item of tree) {

      if(item[0].type === 'concept'){
        var graphC = Object.assign(new Thing(), item[0]);
        /*item[0].graphid = await setConcept({
          label:item[0].label,
          type: item[0].label,
          value: item[0].referent
        })
        */
        temp.addConcept(graphC);
      }

    }

    // Build Relations by connecting corresponding Concepts from the axiom
    for(var item of tree) {
      if(item[0].type === 'relation'){
        // create relation
        /*item[0].graphid = await setRelation({
          label: item[0].type,
          type: item[0].label
        })
        */
        // attach arcs from the tree
        var arcs = getArcs(temp, item[0]);
        // create relation in graph
        console.log(item[0].label, item[0].type,'LABELTYPE')
        temp.addRelation(item[0].label,item[0].type, uuidv4(), arcs);
      }
    }
    /* END OLD LEGACY */
  }



  if(returnContext) {

    return context
  } else {
    return temp
  };
//TODO: Figure a new way of creating arcs and relations
  function getArcs (axiom, relation) {
    //shorten syntax
    var arc = relation.arcI;
    var arcs = {};
    //go through each identifier
    for(var i=0;i<arc.length;i++){
      //remove ? and add *
      var temp = arc[i].slice(1,2)
      var ident = '*';
      ident += temp;
      //then find uuid of item
      var res = axiom.find('identifier', ident)
      //add uuid to arcs object
      arcs[i] = res.uuid;
    }
    return arcs;
  }
}

export function cleanUp (target, start) {
  var closed = new Set();
  var open = new Set();
  closed.add(start.uuid);
  // add out to open set
  for(let i=0;i<start.out.length;i++){
    open.add(start.out[i]);
  }
  // while there is still some things to traverse
  while(open.size>0){
    var temp = open.values(); // returns an iterator
    var val = temp.next().value;
    // if we havent seen it, add it's outs to the open set
    if(!closed.has(val)){
      // then add it to the closed set
      closed.add(val);
      // then remove it from the open set
      open.delete(val);
      // get item from target
      var item = target.find('uuid', val);
      // then check if there is an out or arcs
      if(item.out.length>0){
        for(let i=0;i<item.out.length;i++){
          open.add(item.out[i]);
        }
      } else if(Object.keys(item.arcs).length>0){
        for(var index in item.arcs){
          open.add(item.arcs[index]);
        }
      }
    } else {
      // delete it from val
      open.delete(val);
    }
  }
  // delete all concepts we did not traverse (unconnected)
  for(let i=0;i<target.concept.length;i++){
    // if we did not traverse the concept
    if(!closed.has(target.concept[i].uuid)){
      // delete concept from target
      target.deleteConcept(target.concept[i].uuid);
    }
    // if not do nothing
  }
  // delete all relations we did not traverse (unconnected)
  for(let i=0;i<target.relation.length;i++){
    // if we did not traverse the concept
    if(!closed.has(target.relation[i].uuid)){
      // delete concept from target
      target.deleteRelation(target.relation[i].uuid);
    }
    // if not do nothing
  }
  return target;
  //end of cleanUp
}

export function ProjSet () {
  this.sets = [];
  this.add = function(id, id2) {
    var arr = this.sets;
    if(arr.length>0){
      for(var i=0;arr.length>i;i++){
        if(arr[i].has(id) || arr[i].has(id2)){
          arr[i].add(id);
          arr[i].add(id2);
        } else {
          var set = new Set();
          set.add(id);
          set.add(id2);
          this.sets.push(set);
        }
      }
    } else {
      var set = new Set();
      set.add(id);
      set.add(id2);
      this.sets.push(set);
    }
  };
  this.get = function (id) {
    var arr = this.sets;
    if(arr.length>0){
      for(var i=0;arr.length>i;i++){
        if(arr[i].has(id)){
          return Array.from(arr[i]);
        } else {
          var res = [];
          return res;
        }
      }
    }
  };
}

async function fetchObjects (conceptsObj) {
  if(!conceptsObj){ throw('undefined, issue here')}
  let keys = Object.keys(conceptsObj);
  let dataArray = [];
  for(let item in keys) {
    let key = keys[item];
    if(key == '_') {
      continue;
    }
    var data = await gun.get(key).promOnce();
    dataArray.push(data.data);
  }
  return dataArray;
}
  /*
   return a Map of concepts and relations which contains possible matches
   */
export async function unifyProject (target, source) {
  // TODO: turn this into a function that creates objects from
  //  stored cgGraph

  console.log('projecting', target, source);
  //we will get context into here and get concepts and relations from each item
  let targetContext = await new Context(target);
  let sourceContext = await new Context(source);

  console.log(targetContext.concepts)
  let targetConcepts = await targetContext.concepts;
  targetConcepts = await fetchObjects(targetConcepts);
  let sourceConcepts = await sourceContext.concepts;
  sourceConcepts = await fetchObjects(sourceConcepts);
  let targetRelations = await targetContext.relations;
  targetRelations = await fetchObjects(targetRelations);
  let sourceRelations = await sourceContext.relations;
  sourceRelations = await fetchObjects(sourceRelations);

  console.log(targetConcepts, sourceConcepts, targetRelations, sourceRelations);

  // initialize buffer objects

  // open nodes to traverse
  var open1 = Array.from(sourceConcepts);
  // array to keep track of items already searched
  var closed1 = [];
  // projSet that reflects any possible projections for concepts
  var concepts = new ProjSet();
  // projSet that reflects any possible projection for relations
  var relations = new ProjSet();

  // start searching graph space to find possible projections

  // while there is still open concepts in the source graph (e.g. rule or context)
  while (open1.lenth > 0) {
    // get the first item left
    var concept = open1.shift();
    var test = Array.from(targetConcepts);
    for(var i = 0; i<test.length; i++){
      // for performance reasons we don't want to do anything further unless
      // we find the labels are the same
      // Soon this will need to follow the type hierarchy and see if they are
      // specializations of each other.
      // Only specializing knowledge (more knowledge, should be considered, except for rules)
      console.log(`Comparing ${test[i]} to ${concept}`);
    }
  }



//legacy below for now.
/*
  // make a copy of the target so we don't interfer with other joins later
  var targetCopy = JSON.parse(JSON.stringify(target));
  var target = Object.assign(new Thing(), targetCopy);
  // make a copy of the source so we don't mess with it
  var sourceCopy = JSON.parse(JSON.stringify(source));
  var source = Object.assign(new Thing(), sourceCopy);
  // Create an array to keep track of open concepts
  var open1 = Array.from(source.concept);
  var closed1 = [];
  // Projection Set for concepts and relations
  var concepts = new ProjSet();
  var relations = new ProjSet();

  // While there is still concepts in the source (the rule or context)
  while(open1.length > 0) {
    // Get the first concept in the rule or context and
    var concept = open1.shift();
    // create a list of concepts from the target
    var test = Array.from(target.concept);
    // loop over the items in the target
    for(var i=0; i<test.length;i++){
      // for performance reasons we don't want to do anything further unless
      // we find the labels are the same
      // Soon this will need to follow the type hierarchy and see if they are
      // specializations of each other.
      // Only specializing knowledge (more knowledge, should be considered, except for rules)
      if(test[i].label == concept.label) {
        // if the referent is the same, meaning the thing with the same type
        // and the thing it is describing (Like the Person Jake, Jake the individual
        // is the referent )
        if(test[i].referent == concept.referent || concept.referent == '*') {
          // Add the concept into uuid into the projection set as a possible match
          concepts.add(test[i].uuid,concept.uuid);
        }
      }
    }
    // remove the tested concept from the open list add
    closed1.push(concept); //put concept into closed array
  }

  var open2 = Array.from(source.relation);
  var closed2 = [];
  var relations = new ProjSet();

  while(open2.length > 0) {
    var relation = open2.shift();
    var test = Array.from(target.relation);
    for(var i=0; i<test.length;i++){
      if(test[i].label == relation.label) {
        //check if we had a match to the concepts attached
        var idTest1 = test[i].arcs[0];
        var idTest2 = test[i].arcs[1];
        debug ? console.log(idTest1,idTest2) : console.log('');
        var mTest1 = concepts.get(idTest1);
        var mTest2 = concepts.get(idTest2);
        debug ? console.log(mTest1,mTest2) : console.log('');
        var idRel1 = relation.arcs[0];
        var idRel2 = relation.arcs[1];

        if(mTest2[0]){
          if((mTest1[0] == idRel1 && mTest2[0] == idRel2) && test[i].uuid != relation.uuid) {
          relations.add(test[i].uuid, relation.uuid);
          }
        }
      }

    }
    closed2.push(relation); //put relation into closed array
  }

  return {concepts: concepts, relations: relations};
  */
};

  /*
  * Function that joins two graphs on their projections.
  * @param {target} - Graph Object into which to merge
  * @param {source} - Graph Object from which to merge
  * @param {projection} - Projection object with Maps for merges
  */
export function unifyJoin (target, source, projection) {
  // make a copy of the target so we don't interfer with other joins later
  // make a copy of the source so we don't mess with it
  var targetCopy = JSON.parse(JSON.stringify(target));
  var target = Object.assign(new Thing(), targetCopy);
  var sourceCopy = JSON.parse(JSON.stringify(source));
  var source = Object.assign(new Thing(), sourceCopy);

  // unwrap projection
  var con = Array.from(projection.concepts.sets);
  var rel = Array.from(projection.relations.sets);
  // Create new Graph to which we add new concepts
  var graph = getThing(target.label + source.label, 'axiom', getUuid());
  // add concepts and relations from source to target
  while(source.concept.length>0){
    target.addConcept(source.concept.shift());
  }
  while(source.relation.length>0){
    target.addRelation(source.relation.shift());
  }
  // iterate over the keys in the concept Map
  // perform a join on individual concepts

  // create a new concept that is a join of
  // all found projections
  for(var i=0;i<con.length;i++) {
    // arr becomes the array of the first set
    var arr = Array.from(con[i]);
    // find first item in arr
    var i = target.find('uuid',arr[0]);
    // create a new concept with the information of the first concept
    var temp = getThing(i.label, i.type, getUuid(),{},i.referent);
    // iterate over and find all outs and add them into new concept
    // create a set and then add it into temp after iteration
    var outSet = new Set();
    // iterate over each item to be joined
    for(var y=0;y<arr.length;y++){
      // get the actual concept from the id
      var join = target.find('uuid', arr[y]);
      // iterate over the out array which contains relations
      for(var z=0;z<join.out.length;z++){
        // placeholder id
        var id = join.out[z];
        // add id to the set for the new concept out (avoid duplication)
        outSet.add(id);
        // get actual relation object
        var relation = target.find('uuid', id);
        // update arcs with temps new id
        for(let index in relation.arcs){
          // if the arc is referencing the source concept
          if(relation.arcs[index] == arr[y]) {
            // change the reference to the temp concept instead
            relation.arcs[index] = temp.uuid;
          }
        }
      }
    }
    temp.out = Array.from(outSet);
    graph.addConcept(temp);
  }

  cleanUpUnify(graph, graph.concept[0], target);

  return graph;
};

export function cleanUpUnify (target, start, source) {
  var closed = new Set();
  var open = new Set();
  closed.add(start.uuid);
  // add out to open set
  for(let i=0;i<start.out.length;i++){
    open.add(start.out[i]);
  }
  // while there is still some things to traverse
  while(open.size>0){
    var temp = open.values(); // returns an iterator
    var val = temp.next().value;
    // if we havent seen it, add it's outs to the open set
    if(!closed.has(val)){
      // then add it to the closed set
      closed.add(val);
      // then remove it from the open set
      open.delete(val);
      var newFlag = false;
      // get item from target
      var item = target.find('uuid', val);
      // not in graph yet
      if(!item) {
        var item = source.find('uuid', val);
        newFlag = true;
      }
      // then check if there is an out or arcs
      if(item.out.length>0){
        if(newFlag) { target.addConcept(item)}
        for(let i=0;i<item.out.length;i++){
          open.add(item.out[i]);
        }
      } else if(Object.keys(item.arcs).length>0){
        if(newFlag) { target.addRelation(item)}
        for(var index in item.arcs){
          open.add(item.arcs[index]);
        }
      }
    } else {
      // delete it from val
      open.delete(val);
    }
  }
  // delete all concepts we did not traverse (unconnected)
  for(let i=0;i<target.concept.length;i++){
    // if we did not traverse the concept
    if(!closed.has(target.concept[i].uuid)){
      // delete concept from target
      target.deleteConcept(target.concept[i].uuid);
    }
    // if not do nothing
  }
  // delete all relations we did not traverse (unconnected)
  for(let i=0;i<target.relation.length;i++){
    // if we did not traverse the concept
    if(!closed.has(target.relation[i].uuid)){
      // delete concept from target
      target.deleteRelation(target.relation[i].uuid);
    }
    // if not do nothing
  }
  return target;
  //end of cleanUp
};

export function applyRule (graph, rule, proj) {
  console.log(`applied`, rule);
  // pass data to rule function
  rule.con(graph, rule, proj);
  return true;
};
