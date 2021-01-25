// Initiate Identifiers
var __identifiers = {};
// Initiate Contexts
var __contexts = new Set();

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

async function encode(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}


const database = new Gun();


(async function assertUniverse() {

	const terms = [

		// Primaries
    	'have', 'identifier', 'thing',
	   	'concept', 'relation', 'axiom', 'arc',
	   	'type', 'subtype', 'supertype',
	   	'agent', 'property',

	   	// Secondaries
	   	'context', 'term',

	   	// Tertiaries
	   	'language', 'english', 'javascript',
	   	'be',
	   	'before', 'after',

	   	// Auxiliaries
	   	'window', 'document', 'database', 'person',
	   	'function', 'async', 'parameter'
	  ]

		/*
		* Store a Literal
		* @param {string} value - the 'value' of the literal
		* @param {string} type - The designator type. This can be :
									+ literalNumber, literalString, literalEncoded
									+ locatorIndividualMarker, locatorIndexical, locatorName
									+ undetermined
		*/
		async function procureReferent(value, type, genesis = false) {

			// The designated representative of the literal.
			// This can be :
			var designator = '';
			var record = null,
				recordIdentifier = null;

			// TODO: Add all types of literals / designator-types according to Sowa
			if (type === 'literalEncoded') {
				designator = await encode(value);
			}

			// add __genesis if this is the first insertion of the identifier (bootstrapped)
			var literal = genesis ? {__genesis: true} : {};
			literal[designator] = value;

			// Seek out the record of the designator
			const recordDesignator = await database.get(designator).then();

			// If we don't have a record of the designator & we're bootstrapping...
			if(genesis && recordDesignator !== undefined) {
				var recordsGenesis = null;

				// This needs to be more efficient (rather than iterating over all 'term'-things
				await database.get(designator).then(
					refs => Promise.all(Object.keys(refs).map(k => database.get(k).then()))
				)
				.then(r => {recordsGenesis = r});

				// If we have genesis records...
				if(recordsGenesis.length > 0) {
					for(var i = 0; i < recordsGenesis.length; i++) {
						var recordGenesis = recordsGenesis[i];
						if(recordGenesis !== undefined) {
							if('__genesis' in recordGenesis) {
								if(recordGenesis['__genesis'] === true) {
									record = await database.get(recordGenesis['_']['#']).then()
									recordIdentifier = await Gun.node.soul(record);
								}
							}
						}
					}
				}

			} else {
				record = await database.get(designator).set(literal).then();
				recordIdentifier = await Gun.node.soul(record);
			}

			const designatorIdentifier = await Gun.node.soul(recordDesignator);

			return {record, recordIdentifier, recordDesignator, designatorIdentifier};

		}

		/*
		* Procure a Term.
			- Given a term,
			- Store a referent
		* @param {string} term - the 'term' to procure
		* @param {boolean} exist - whether the term exists or not
		*/
		async function procureTerm(term, genesis = false) {

			console.log('Procure Term: "'+term+ '"...')

			const referent = await procureReferent(term, 'literalEncoded', genesis)

			      __identifiers[term] = referent.recordIdentifier; // is this the identifier of the thing or of the referent to the thing?

			return referent
		}

		// Introduce 'context' as the universe, before there is anything contextually related.
		// It is a prerequisite that anything in the universe means the universe is the context.

		/*
		* Procure a Context. This may be used to design a Lambda Expression.
		* Context is the agent of having an object which is a thing. A context is 'a concept that contains a nonblank CG that is used to describe the referent of the concept; the entity that a concept refers to.'
		* @param {string} identifier - idenfity the context
		* @param {array} concepts  - concepts in the context
		* @param {array} relations - relations in the context
		* @param {array} arcMaps - arcs in the context.
						Arc: An ordered pair <r,c> which is said to link a conceptual relation r to a concept c.
						Arc-maps follow the form [ [[in], [out]], [...] ]
						where Map elements = key-value pairs (arrays with two elements, e.g. [[ 1, 'one' ],[ 2, 'two' ]]).
						e.g.    ◻1 - ◯1 - ◻2  is defined by [ [ [◻1], [◯1] ], [ [◯1],[◻2] ] ].
		* @returns {string} identifier of the context
		*/
		async function procureContext(contextIdentifier = null, concepts = [], relations = [], arcs = []) {

			// A blank conceptual graph returns the identifier of our inception-context

			console.log('Concepts:', concepts.length, 'Relations:', relations.length, 'Arcs:', arcs.length)

			if(concepts.length === 0 && relations.length === 0 && arcs.length === 0) {
				return __identifiers['context']
			}


			let uniqueConcepts = [...new Set(concepts)].sort();
			let uniqueRelations = [...new Set(relations)].sort();

			// iterate over all arc sets and push them into a complete list
			for (var i = 0; i < arcs.length; i++) {

				var arcMap = arcs[i];

				for (var j = 0; j < arcMap.length; j++) {

					var arc = arcMap[j];

					console.log(arc, 'thearc')

				}

			}

			var uniqueArcs = [...new Set(flatten(arcs).sort())].sort();

			var referentLiteral = concepts.join('') + relations.join('') + uniqueArcs.join('');

			//console.log(uniqueConcepts, uniqueRelations, uniqueArcs)
			// console.log(referentLiteral)

			console.log('Procure Context: "'+contextIdentifier+ '"...')
			const referent = await procureReferent(referentLiteral, 'literalEncoded')
			const identifier = referent.recordIdentifier;
			console.log('Procured Context: ' +identifier + ' with Designator Identifier:' +referent.designatorIdentifier)

			return identifier

		}


		async function assignType(typeIdentifier, thingIdentifier) {

		}

		async function assignProperty(thingIdentifier, targetIdentifier) {

			// e.g. [Person: Jacob x] (agent?x?y) [Have:**y] (object?y?z) [CommunicationDevice: Phone z]
			// [thing x] (agent?x?y) [have ** y] (property?y?z) [thing z ]

			// 1. look for a context where this property is already assigned
			// 		a) sort, alphabetically, identifiers & ask for the context...

			// 2. procureContext(null)

			var have = __identifiers['have'];
			var agent = __identifiers['agent'];
			var property = __identifiers['property'];


			// I store a ref to the context under A
			// or ref the context with a,b,c,d, etc.

			var things = [thingIdentifier, targetIdentifier, have, agent, property]

			await database.get(have).then()

			// initiate context
			// assert
		}

		//async function procureContext()
		async function initiate(terms) {

			/*

				1. Procure all genesis terms & store their IDs under __identifiers.
				2. Genesis terms are indicated with a __genesis.

			*/
			const genesis = true;
			for await (const term of terms) {

					var thing = await procureTerm(term, genesis);
			}
		}


		await initiate(terms);

		var contextEmpty = await procureContext()

		const agent			= __identifiers['agent']
		const have 			= __identifiers['have']
		const property 		= __identifiers['property']
		const identifier 		= __identifiers['identifier']


		// [Context: contextNothing] - ( agent ) - [ Verb: Have ] - ( property ) - [ Identifier: 'xdf33s...' ]

		var contextIdentifiedArcs = [
			[ [contextEmpty] , [agent] ], // contextEmpty -> agent
			[ [agent] , [have] ],		  // agent -> have
			[ [have] , [property]],		  // have -> property
			[ [property], [identifier]]   // property -> identifier
		]

		var contextIdentified = await procureContext(null, [contextEmpty, have], [agent, property], contextIdentifiedArcs )
		console.log(__identifiers, 'context is', contextIdentified)
  
})();


/*
* Function that instantiates a reasoner to use
* @param eventSystem (evSystem) - Reference to eventSystem
*/

function Reasoner (eventSystem) {

  // working knowledge
  this.current = new axiomStore('current');
  // laws / rules
  this.law = new axiomStore('law');
  // schema, which is used to find possible schemas
  this.schema = new axiomStore('schema');
  // event system hook
  this.eventS = eventSystem;

  /*
  * Function to initiate
  * @param necT - axiomStore, containing necessarilyTrue information
  * @param posT - axiomStore, containing possiblyTrue information about world
  * @param law = axiomStore, containing axioms that are truths / laws / rules about the domain
  * @param F - axiomStore, containing axioms that are false for this world.
  */
  this.init = function (current, law, schema) {
    this.current = current;
    this.law = law;
    this.schema = schema;
    this.eventS.sub('unify', this.unify.bind(this));
  };

  /*
  * Function to tell new information into an existing knowledge base
  * @param graph - Thing with type axiom containing a fact
  * @return string -
  */
  this.tell = function(graph) {
    // make a copy of the graph to preserve the original
    var graphCopy = JSON.parse(JSON.stringify(graph))
    var graph = Object.assign(new Thing(), graphCopy);

    // initialize pre-conditions
    found = false;
    law = false;

    // search through current knowledge to find projections
    // make sure empty var is initialized
    var result = [];
    for(var index in this.current.axioms) {
      var proj = infUtil.project(graph, this.current.axioms[index], false);
      if(proj.length > 0) {
        result.push(proj);
      }
    }
    if(result.length>0){
      console.log(result);
      found = true;
    }

    // search through laws to find projection (needs to fully cover law)
    // make sure empty var is initialized
    var result = [];
    for(var index in this.law.axioms){
      var proj = infUtil.project(graph, this.law.axioms[index], true);
      if(proj.length>0){
        console.log(proj);
        result.push(index);
      }
    }
    if(result.length>0){
      law = true;
      console.log(result);
    }

    // do what needs to be done per logic attached
    if(found && !law) {
      this.current.add(graph);
      setTimeout(()=>{this.eventS.send('unify')}, 1);
      return 'True'

    } else if (!found && law) {
      console.log('rule applied');
      console.log(this.law.axioms[result[0]]);
      translate(graph);
      var newGraph = infUtil.join(graph, this.law.axioms[result[0]], proj[0], true);
      translate(newGraph);
      this.current.add(newGraph);
      this.law.axioms[result[0]].execute(this); // implement
      setTimeout(()=>{this.eventS.send('unify')}, 1);
      return 'True';
    } else {
      // search through schema to find projection
      // make sure empty var is initialized
      var result = [];
      for(var index in this.schema.axioms){
        var proj = infUtil.projection(graph, this.schema.axioms[index], false);
        if(proj.length>0){
          result.push(proj);
        }
      }
      if(result.length>0){
        result.forEach((item)=>console.log('Did you want to: ' + item[0].name));
      }
      return 'Unknown';
    }
  };

  /*
  * Function that asserts something as true
  * @param graph (axiom) - axiom that is true
  */
  this.assert = function(graph) {
    this.current.add(graph);
    setTimeout(()=>{this.eventS.send('unify')}, 1);
  };

  /*
  * Function that unifies anything possible
  * @return boolean - returns true if any joins were executed
  */
  this.unify = function() {
    console.log('unify called');
    console.log(this.current.axioms);
    // iterate through all available graphs in current knowledge
    for(var first in this.current.axioms) {
      for(var second in this.current.axioms){
        // if not the same graph
        if(first != second) {
          // try to project the first into the second
          var proj = infUtil.project(this.current.axioms[first], this.current.axioms[second])
          // found a projection, meaning a merge is possible
          if(proj.length>0){
            // create a graph that is a join of the two graphs
            var newGraph = infUtil.join(this.current.axioms[first], this.current.axioms[second], proj[0], false);
            // add the result to the current knowledge
            this.current.add(newGraph);
            // remove the un-joined graph

            // we want to make sure we splice the array so that we only delete what we
            // want and not accidentally remove one that changes the location of the
            // other. We do this by making sure we delete the one later in the array first
            // so the other is not affected. Delete from left to right.
            if(second>first) {
              // second is behind first, remove second first
              this.current.axioms.splice(second, 1);
              this.current.axioms.splice(first, 1);
            } else if (first>second) {
              // first is behind second, remove first first
              this.current.axioms.splice(first, 1);
              this.current.axioms.splice(second, 1);
            }
          }
        }
      }
    }

  };

}

/*
* A module containing join functions so they become available globally
*/

var infUtil = (function() {
  // no private vars at this point
  return {

    /* public function to join 2 concepts
    *  @param tar signifies Concept and Graph we join into
    *  @param sou signifies Concept and Graph we join from
    *  @return side-effect on the graph that is passed in
    */
    joinConcepts: function(tarC,tarG,souC,souG,what){

      if(what == 'referent'){
        // this will modify the sourceConcept also contained in the target
        tarC.referent = souC.referent;
        // find all the 'arcs / relations' pointing to the source Concept and
        // move them to the target concept
        for(let i=0;i<souC.out.length;i++){
          // find relation in out
          var relation = source.find('uuid', souC.out[i]);
          // iterate over arcs object
          for(let index in relation.arcs){
            // if the arc is referencing the source concept
            if(relation.arcs[index] == souC.uuid) {
              // change the reference to the target concept instead
              relation.arcs[index] = tarC.uuid;
              // add relation to the outs of the target
              tarC.out.push(relation.uuid);
            }
          }
        }
      // if there is new information attached from source
      } else if (what == 'relation') {

        // do nothing as we are handling it on concepts

      } else if (what == 'none') { // <-- re-evaluate this part, as it should only join anything if new information is available
        // To get here a referent in source is either the same as the one in target
        // Or it has a star and maybe has some new relations.

        // find all the 'arcs / relations' pointing to the source Concept and
        // move them to the target concept
        for(let i=0;i<souC.out.length;i++){
          // find relation in out
          var relation = source.find('uuid', souC.out[i]);
          // iterate over arcs object
          for(let index in relation.arcs){
            // if the arc is referencing the source concept
            if(relation.arcs[index] == souC.uuid) {
              // change the reference to the target concept instead
              relation.arcs[index] = tarC.uuid;
              // add relation to the outs of the target
              tarC.out.push(relation.uuid);
            }
          }
        }
      }
      // end of joinConcept
    },

    /*
    * Function to traverse graphs and determine matches
    * @param target (graph) - target graph
    * @param tarStart (concept) - concepts that is the start
    * @param source (graph) - source graph
    * @param sourStart (concept) - concept that is the start
    * @return joins array or undefined (we might still find no pattern)
    */

    Tree: function(target, tarStart, source, sourStart, rule) {


      this.level = [];
      this.depth = 0;
      this.tree = new Set();
      this.root1 = tarStart;
      this.root2 = sourStart;
      this.root1G = target;
      this.root2G = source;
      this.rule = rule;
      this.invalid = false;

      this.start = function(rule) {
        //if this tree is invalid return undefined
        if(this.invalid) {return undefined}
        this.depth = this.level.length //should be 0 for first level
        var results = [];

        /*
        Following cases should be handled:
        1. The target applies to 'any' * of something and the source is a specific
           instance of a thing.
           This should be joined as it specializes the graph.
        2. The source applies to 'any' signified by the *.
           This should only be joined if it's a rule or if we have new 'relations'
           and knowledge attached.
        3. Both target and source have the same referent.
           This should only be joined if it's a rule or if we have new 'relations'
           and knowledge attached.
           */

        // (1)
        if(this.root1.referent == '*' && this.root2.referent != '*') {
          // The source is a specialisation of the target
          results.push({from:this.root2.uuid,to:this.root1.uuid, what:'referent', depth:this.depth})
          this.tree.add(this.root2.uuid)
          this.tree.add(this.root1.uuid)
        } else if (this.root2.referent == '*') {
          // The source can be specialised by the target.
          // get Concepts connected to these Concepts
          var arrT = this.getChildren(this.root1, this.root1G)
          var arrS = this.getChildren(this.root2, this.root2G)
          // compare new list of concepts if we find items in source not found in
          // target, join root 1 and root 2 otherwise do not join.
          var newItems = []
          newItems = arrT.filter((item)=>{arrS.indexOf(item) < 0})
          if(newItems.length>0){
            results.push({from:this.root2.uuid,to:this.root1.uuid,what:'referent', depth:this.depth});
            this.tree.add(this.root2.uuid);
            this.tree.add(this.root1.uuid);
          }
        } else if (this.root1.referent == this.root2.referent) {
          // The items are the same, but do they have more knowledge?
          // get Concepts connected to these Concepts
          var arrT = this.getChildren(this.root1, this.root1G)
          var arrS = this.getChildren(this.root2, this.root2G)
          // compare new list of concepts if we find items in source not found in
          // target, join root 1 and root 2 otherwise do not join.
          var newItems = []
          newItems = arrT.filter((item)=>{return arrS.indexOf(item) < 0})
          if(newItems.length>0){
            results.push({from:this.root2.uuid,to:this.root1.uuid,what:'referent', depth:this.depth});
            this.tree.add(this.root2.uuid);
            this.tree.add(this.root1.uuid);
          }
        } else {
          this.invalid = true
        }
        this.level.push(results)
        return this.growR(rule)
        //end of start
      };

      this.growR = function(rule){
        if(this.invalid){return undefined;}
        var results = [];
        var expand = this.level[this.depth];
        this.depth += 1;
        for (let i = 0; i < expand.length; i++) {
          var sourCon = this.root2G.find('uuid', expand[i].from).out;
          var tarCon = this.root1G.find('uuid', expand[i].to).out;
          //console.log('if new information is available');
          //console.log(sourCon.length>tarCon.length);
          for (let j = 0; j < tarCon.length; j++) {
            // if we have not seen this already
            if(!this.tree.has(tarCon[j])) {
              // set temp for target relation to compare to
              var temp1 = this.root1G.find('uuid',tarCon[j]);
              for (let k = 0; k < sourCon.length; k++) {
                // if we have not seen this already
                if(!this.tree.has(sourCon[k])){
                  // set temp for source relation to compare to
                  var temp2 = this.root2G.find('uuid',sourCon[k])
                  // if they are the same, merge them
                  if (temp1.label == temp2.label) {
                    // this logic needs to be looked at <------
                    // if new information is available, as in there is more relations in the source
                    results.push({from:temp2.uuid,to:temp1.uuid,what:'relation',depth:this.depth, parent:expand[i]})
                    this.tree.add(temp1.uuid);
                    this.tree.add(temp2.uuid);
                  }
                }
              }
            }
          }
        }
        //console.log('checking for results');
        // if we found children that match go ahead and push to level 1/3/5 etc
        if(results.length>0){
          this.level.push(results);
          return this.growC(rule)
        } else {
          //console.log('found no further relations');
          return this.finish(rule);
        }
      };

      this.growC = function(rule) {
        //console.log('checking more concepts');
        if(this.invalid){return undefined;}
        var results = [];
        var expand = this.level[this.depth];
        this.depth += 1;
        for (let i = 0; i < expand.length; i++) {
          var sourCon = this.root2G.find('uuid', expand[i].from).arcs;
          var tarCon = this.root1G.find('uuid', expand[i].to).arcs;
          //console.log('going over new concepts', tarCon);
          for (var targetI in tarCon) {
            //console.log(tarCon[targetI]);
            // if we don't have seen this already
            if(!this.tree.has(tarCon[targetI])) {
              // set temp for target relation to compare to
              //console.log('new concept', this.root1G.find('uuid',tarCon[targetI]));
              var temp1 = this.root1G.find('uuid',tarCon[targetI]);
              for (var sourceI in sourCon) {
                // set temp for source relation to compare to
                var temp2 = this.root2G.find('uuid',sourCon[sourceI]);
                if(!this.tree.has(temp2.uuid)){

                  if(temp1.label == temp2.label) {
                    // if they are the same, merge them
                    if(temp1.referent == '*' && temp2.referent != '*') {
                      //console.log('Found new referent to merge');
                      results.push({from:temp2.uuid,to:temp1.uuid,what:'referent', depth:this.depth, parent:expand[i]});
                      this.tree.add(temp2.uuid);
                      this.tree.add(temp1.uuid);
                    // if source referent is star and it has more relations than this might be new information
                    } else if (temp2.referent == '*') {
                      // The source can be specialised by the target.
                      // get Concepts connected to these Concepts
                      var arrT = this.getChildren(temp1, this.root1G)
                      var arrS = this.getChildren(temp2, this.root2G)
                      // compare new list of concepts if we find items in source not found in
                      // target, join root 1 and root 2 otherwise do not join.
                      var newItems = []
                      newItems = arrT.filter((item)=>{arrS.indexOf(item) < 0})
                      if(newItems.length>0){
                        results.push({from:temp2.uuid,to:temp1.uuid,what:'referent', depth:this.depth});
                        this.tree.add(temp2.uuid);
                        this.tree.add(temp1.uuid);
                      }
                      // if both referents are the same, then we need to check if new relations are available
                    } else if (temp1.referent == temp2.referent) {
                        //console.log('Referents the same, need to check relations');
                        // get Concepts connected to these Concepts
                        var arrT = this.getChildren(temp1, this.root1G)
                        var arrS = this.getChildren(temp2, this.root2G)
                        // compare new list of concepts if we find items in source not found in
                        // target, join root 1 and root 2 otherwise do not join.
                        var newItems = []
                        newItems = arrT.filter((item)=>{arrS.indexOf(item) < 0})
                        if(newItems.length>0){
                          results.push({from:temp2.uuid,to:temp1.uuid,what:'referent', depth:this.depth});
                          this.tree.add(temp2.uuid);
                          this.tree.add(temp1.uuid);
                        }
                    } else {
                        //console.log('No fit on this concept, handle me depending on root1');
                        //console.log(temp1);
                        //console.log(temp2);
                        this.tree.add(temp2.uuid);
                        this.tree.add(temp1.uuid);
                    }
                  } else {
                    //console.log('no match')
                  }
                }
              }
            }
          }
        }

        //check if results were found
        if(results.length>0){
          //console.log('found new concepts');
          this.level.push(results);
          return this.growR(rule)
        } else {
          //console.log('found no further concepts');
          return this.finish(rule);
        }
      };

      this.finish = function(rule) {
        // take tree and turn into one or more join concepts
        //console.log('finishing up');
        // initiate a result array
        var projections = [];

        var levels = this.level.length;
        while(this.level.length>0){
          var level = this.level.pop();
          for(let i=0;i<level.length;i++){
            if(!level[i].seen){
              var array = [];
              array.push(level[i]);
              level[i].seen = true;
              if(level[i].parent){
                var parent = level[i].parent;
                for(let j=levels;j>0;j--){
                  if(parent.parent){
                    array.push(parent);
                    parent.seen = true;
                    parent = parent.parent;
                  } else {
                    //should be a root
                    array.push(parent);
                    parent.seen = true;
                    break;
                  }
                }
              }
              array = array.reverse();
              projections.push(array);
            }
          }
        }

        //if this is a rule, check that source is fully covered with each projection, remove any that are
        // fully covering the source
        // let's try doing it with an approximation, if we have fully covered the source, then we should have
        // the same amount of merges than there is concepts and relations in the source...
        if(rule){
          var sourceTotal = this.root2G.concept.length + this.root2G.relation.length;
          for (let i = 0; i < projections.length; i++) {
            // if the rule is not fully covered, it does not apply
            if( !(projections[i].length>=sourceTotal) ) {
              projections.splice(i,1);
              i--;
            }
          }
        }

        return projections;
      }


      this.getChildren = function(Concept, Graph) {
        var relations = Concept.out;
        var children = [];
        for(let i = 0; i < relations.length; i++) {
          var temp = Graph.find('uuid', relations[i])
          for(let index in temp.arcs) {
            if (temp.arcs[index] != Concept.uuid) {
              children.push(Graph.find('uuid', temp.arcs[index]))
            }
          }
        }
        if(children.length <= 0) {return undefined};
        return children;
        //end of getChildren
      }

      //end of tree
    },

    project: function(target, source, rule){
      // make a copy of each graph
      var t = JSON.parse(JSON.stringify(target))
      t = Object.assign(new Thing(), t)
      var s = JSON.parse(JSON.stringify(source))
      s = Object.assign(new Thing(), s)

      // copy the list of concepts for both graphs
      var targetCon = t.concept
      var sourceCon = s.concept
      //array of possible projections
      var posProj = []
      // set found to false to indicate default, which is no projection
      var found = false
      // array for results
      var result = []
      // iterate over concepts and if the same label create a tree walker
      for(let i=0;i<targetCon.length;i++){
        for(let j=0;j<sourceCon.length;j++){
          //if they are the same type, create a 'possible' projection with the 2 concepts
          if(targetCon[i].label == sourceCon[j].label) {
            var tree = new infUtil.Tree(target, targetCon[i], source, sourceCon[j], rule)
            posProj.push(tree)
            found = true
          }
        }
      }
      // none found return empty array
      if(!found){ return []}
      // We found one or more, let's do some extra work
      // A projection is only valid when 2 conditions are met overall
      // 1 - it introduces new information in form of relations and concepts not found in target
      // 2 - it can add information into a referent '*' in the target
      for (let i = 0; i < posProj.length; i++) {
        var temp = posProj[i];
        var projection = temp.start(rule);
        if(temp.invalid) {
          //console.log('No projection found');
        } else {
          for (let j = 0; j < projection.length; j++) {
            var temp = {name:source.label+'cP', concepts:projection[j]}
            result.push(temp)
          }
        }
      }

      return result;
      //end of project
    },

    join: function (target, source, join, rule) {
      // make a copy of the target so we don't interfer with other joins later (bug that was found earlier)
      // make a copy of the source so we don't mess with it
      var targetCopy = JSON.parse(JSON.stringify(target));
      var target = Object.assign(new Thing(), targetCopy);
      var sourceCopy = JSON.parse(JSON.stringify(source));
      var source = Object.assign(new Thing(), sourceCopy);
      // traverse start, first concept in target (as it need at least one item in graph to be valid)
      var checkStart = target.concept[0];
      // add all source concepts and relations to target
      // to extend by adding any concepts and relations that are missing
      target.concept = target.concept.concat(source.concept);
      target.relation = target.relation.concat(source.relation);

      //-- Process join per join array--

      // iterate through through the join items
      for(var i=0;i<join.concepts.length;i++){
        // get concept from the join objects
        var concept = join.concepts[i]; //what we are joining from source and from
        // get the target and source concept from each graph
        var targetCon = target.find('uuid',concept.to)
        var sourceCon = source.find('uuid',concept.from)
        // let's assume that somehow we want to join a concept that we have already joined
        // targetCon will be undefined, if so we need to return undefined
        if(!targetCon || !sourceCon) {
          return undefined;
        }
        // if we found a new referent copy the new referent
        if(concept.what == 'referent'){
          // this will modify the sourceConcept also contained in the target
          targetCon.referent = sourceCon.referent;
          // find all the 'arcs / relations' pointing to the source Concept and
          // move them to the target concept
          for(let i=0;i<sourceCon.out.length;i++){
            // find relation in out
            var relation = source.find('uuid', sourceCon.out[i]);
            // iterate over arcs object
            for(let index in relation.arcs){
              // if the arc is referencing the source concept
              if(relation.arcs[index] == sourceCon.uuid) {
                // change the reference to the target concept instead
                relation.arcs[index] = targetCon.uuid;
                // add relation to the outs of the target
                targetCon.out.push(relation.uuid);
              }
            }
          }
        // if there is new information attached from source
        } else if (concept.what == 'relation') {

          // do nothing as we are handling it on concepts

        } else if (concept.what == 'none') { // <-- re-evaluate this part, as it should only join anything if new information is available
          // To get here a referent in source is either the same as the one in target
          // Or it has a star and maybe has some new relations.

          // find all the 'arcs / relations' pointing to the source Concept and
          // move them to the target concept
          for(let i=0;i<sourceCon.out.length;i++){
            // find relation in out
            var relation = source.find('uuid', sourceCon.out[i]);
            // iterate over arcs object
            for(let index in relation.arcs){
              // if the arc is referencing the source concept
              if(relation.arcs[index] == sourceCon.uuid) {
                // change the reference to the target concept instead
                relation.arcs[index] = targetCon.uuid;
                // add relation to the outs of the target
                targetCon.out.push(relation.uuid);
              }
            }
          }
        }

      }

      target = infUtil.cleanUp(target, checkStart);

      // then delete all relations and concepts that are not keep true;
      // return the joined target graph
      return target;
      //end of join
    },

    cleanUp: function(target, start) {
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

    //end of public interface
  }
// end of infutil
}) ()
