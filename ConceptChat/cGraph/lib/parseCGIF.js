import * as nearley from '../../superpeer/lib/nearley.mjs';
import * as cgif from '../../superpeer/lib/cgif.mjs';

  // parse a CGIF string into a thing object / graph
export async function parseCGIF (string, context) {

  if(typeof string != 'string'){ throw('parse needs a string')}
  // if the context is the global context, we create a new graph.
  
   /* if(context.identifier == global.context.identifier) {
      console.log('Parse: Global Context')
    } else {
      console.log(await context.label)
    }
    */
  

  //get setter from parent context
  // let setGraph = context.concept;

  var parsedResults = new nearley.Parser( nearley.Grammar.fromCompiled(cgif.grammar)).feed(string).results,
                ast = parsedResults;
  // TODO: If no string, throw error

  console.log(ast,'THEAST')
/*
  for(var result of ast) {
    // split out data from the parser
    var tree = result.data;

    // new: aka await a new context
    let newGraph = await new Context();
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
          type: tree[0][0].label,
          value: tree[0][0].referent
        });
        await setGraph({
          label: ast[0].label,
          type: 'Rule',
          value: newGraph.identifier,
          referentOptions: {
              identifier: newGraph.identifier,
              referentType: 'gun',
            },
          identifier: newGraph.identifier
        });

        return;
      } else {
        throw('adding only '+ ast[0].label + ' / ' + tree[0][0].type +' not acceptable at leas one concept');
      }
    }

    // in CGIF each concept is identified with *x ... *n and Relations specifically
    // reference which concepts ?x?y are related through this relation
    // let's create a map that represents the arcs in the graph

    var arcs = new Map();
    // iterate over the tree
    for(var item of tree) {
      item = item[0];
      //console.log(item);
      //if this is a concept it will have an identifier
      if(item.identifier){
        //console.log(`item is a concept, ${item}`);
        // add it to the context
        var conceptId = await setConcept({
          label: item.label,
          type: item.label,
          value: item.referent
        })
        //console.log(conceptId._['#']);
        // add it to the map for arcs between *x and ?x
        var identifier = item.identifier[1];
        if(arcs.has(identifier)){
          var array = arcs.get(identifier);
          array.push("c::"+conceptId._['#']);
          arcs.set(identifier, array);
        } else {
          var array = [];
          array.push("c::"+conceptId._['#']);
          arcs.set(identifier, array);
        }
      }

      //if this is a relation it will have an array arcI
      if(item.arcI) {
        //console.log(`item is a relation, ${item}`);
        // add it to the context
        var relationId = await setRelation({
          label: item.label,
          type: item.label
        })
        // for each identifier ?x, ?y add it to the map between respective id
        for(var identifier of item.arcI) {
          //console.log(identifier);
          var identifier = identifier[1];
          if(arcs.has(identifier)){
            var array = arcs.get(identifier);
            array.push("r::"+relationId._['#']);
            arcs.set(identifier, array);
          } else {
            var array = [];
            array.push("r::"+relationId._['#']);
            arcs.set(identifier, array);
          }
        }
      }

      //iterate over map and create and add to context arcs
      arcs.forEach(async (array, id) => {
        //console.log('identifier', id);
        //console.log('array',array);
        let concept;
        //find the concept for this identifier
        for(let item of array){
          let string = item.slice(0,3)
          //console.warn(string, item.substring(3));
          if(string == "c::"){
            concept = item.substring(3);
          }
        }
        // for each relation referencing the concept create an arc from concept to relation
        for(let item of array){
          let string = item.slice(0,3);
          //console.warn(string, item.substring(3));
          if(string == "r::"){
            await setArc([concept, item.substring(3)])
          }
        }

      });
      var newGraphId = await setGraph({
        label: ast[0].label,
        type: 'Rule',
        value: newGraph.identifier,
        referentOptions: {
            identifier: newGraph.identifier,
            referentType: 'gun',
          },
        identifier: newGraph.identifier
      });
      return newGraphId;
    }

    console.log(arcs);

    // old: create a new graph that contains the parsed inputs
    var temp = getThing(result.label, result.type, uuidv4());

    // Build a list of concepts and add it to axioms from parsed input
    for(var item of tree) {

      if(item[0].type === 'concept'){
        var graphC = Object.assign(new Thing(), item[0]);
        item[0].graphid = await setConcept({
          label:item[0].label,
          type: item[0].label,
          value: item[0].referent
        })
        temp.addConcept(graphC);
      }

    }

    // Build Relations by connecting corresponding Concepts from the axiom
    for(var item of tree) {
      if(item[0].type === 'relation'){
        // create relation
        item[0].graphid = await setRelation({
          label: item[0].type,
          type: item[0].label
        })
        // attach arcs from the tree
        var arcs = getArcs(temp, item[0]);
        // create relation in graph
        temp.addRelation(item[0].label, item[0].type, uuidv4(), arcs, item[0].referent);
      }
    }
  }
  */
 // return temp;

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
