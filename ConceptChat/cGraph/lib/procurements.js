import { query  } from './query.js'
import { storeK, storeC, storeArc } from './stores.js'
import { MD5, Uuidv4 } from './_utilities.js'

import { gunLoader } from '../../superpeer/lib/gunLoader.mjs';

const DEBUG = false;
// include 'verbose' vs 'default' debug levels

// Promise.allSettled Shim
if (Promise && !Promise.allSettled) {
  Promise.allSettled = (promises) =>
    Promise.all(promises.map((promise) =>
      promise
        .then((value) => ({state: 'fulfilled', value}))
        .catch((reason) => ({state: 'rejected', reason}))
    ))
}

/*
* Procure a cached function result
* @param {object} arguments - Arguments of the original function
* @param {string} ƒname - The name of the function to cache
* @param {string} identifier - The identifier of the result
*/
async function cache(args, ƒname, result) {

	const hash = MD5(JSON.stringify(args));

	// Usually we cache an identifier, which is a string.
	// If we're looking to cache a graph object, we need to add that condition in.
	if(typeof result === 'string') {
		return await gun.get('cache').get(ƒname).promPut({[hash]: result});
	} else if(typeof result === 'object') {
		// We're looking to cache the graph object
		if(
			ƒname === 'graph' &&
			('arcs' in result) &&
			('concepts' in result) &&
			('relations' in result) &&
			(result.id !== undefined)
			) {

			var convertedGraph = {
				arcs: {...[...result.arcs]},
				concepts: {...[...result.concepts]},
				relations: {...[...result.relations]},
				id: result.id
			};

			return await gun.get('cache').get(ƒname).promPut({[hash]: convertedGraph});
		}
	}
		else {

		// If we're asking for a graph object, we need to build it in
		if(ƒname === 'graph') {

			const id 					= await gun.get('cache').get(ƒname).get(hash).get('id').then();

			// If we have an id for this graph object, it's been cached.
			// That means we can grab the identifiers in the object.
			if(id !== undefined) {

				const concepts 		= await gun.get('cache').get(ƒname).get(hash).get('concepts').then() || {},
							relations 	= await gun.get('cache').get(ƒname).get(hash).get('relations').then() || {},
							arcs 				= await gun.get('cache').get(ƒname).get(hash).get('arcs').then() || {};

				const output =  {
					id: id,
					concepts: Object.entries(concepts).filter(identifier => typeof identifier === 'string'),
					relations: Object.entries(relations).filter(identifier => typeof identifier === 'string'),
					arcs: Object.entries(arcs).filter(identifier => typeof identifier === 'string')
				};

				return output

			}

		} else {
			return await gun.get('cache').get(ƒname).get(hash).then();
		}
	}

}


var refContain, refGraph, refArc, refRelation, refConcept, refConnect, refType;

/*
* Procure an Identity
* @param {object} properties - the 'properties' of the individual
*/
async function individual(identifier = undefined, properties) {


		if(identifier === undefined) {
			// Procure a unique identifier first
			identifier = gun.back('opt.uuid')();
		}

		// Create the reference object we use after the promised put.
		// This object is a placeholder value/reference as identifier which is
		// stored under its true identifier in the gun-store.
		var refObj = {[identifier]: identifier};

		// API: ID Generation
		const record = await gun.get(identifier).promPut(refObj);

		DEBUG ? console.log('Proc ƒ Individual: ', record) : null

		return record.ref;
}

/*
* Procure a Concept
*	This is a wrapper function for referents
* @param {string} value - the 'value' of the literal
*/

async function concept(options = {
													value: undefined,
													label: undefined,
													type: 'concept',
													referentOptions: {
														identifier: undefined,
														value,
													}},
													identifier = undefined) {

	let gun = window.gun;

	if((arguments.length === 1) && (typeof arguments[0] === 'string')) {
		let thing = await gun.get(arguments[0]);

		if(thing === undefined) {
			console.error('Proc ƒ Concept: ', identifier,'not found')
		} else {
			return thing;
		}

	}

	let {value, label, type, referentOptions} = options;

	label === undefined ? label = value : null;
	type 	=== undefined ? type  = 'concept' : null;

	const properties = {
		...options,
		label,
		type,
		value,
		referentOptions
	}

	DEBUG ? console.log('Proc ƒ Concept: ', {properties}) : null

	properties.type === undefined ? console.error('Proc ƒ Concept: type cannot be null.') : null

	var refObj = undefined,
			record = undefined,
			thing = undefined;

	if(identifier === undefined) {
		thing 					= await individual(),
		identifier 			= Gun.node.soul(thing)

		DEBUG ? console.log('Proc ƒ Concept: ', {identifier}) : null
	} else {
		thing = await individual(identifier)
	}

	refObj = {[identifier]: identifier};
	record = await gun.get(identifier).promPut(refObj);

	label !== undefined ? await gun.get(identifier).get('label').promPut(properties.label) : null
	type !== undefined ? await gun.get(identifier).get('type').promPut(properties.type) : null

	await gun.get(identifier).get('_type').promPut('concept');

	const thingReferent = await referent(value, identifier, referentOptions)

	const conceptColumn 		= gun.get('*').get('concept'),
				typeColumn				= gun.get('*').get('type').get(type);

	const stores = await Promise.all([
			storeC(record.ref, conceptColumn),		//		.get(identifier).promPut(thing.ref),
			storeC(record.ref, typeColumn)	//.get(identifier).promPut(thing.ref)
	]);

	return thing

}

/*
* Procure a Concept
*	This is a wrapper function for referents
* @param {string} value - the 'value' of the literal
*/

async function relation(options = {
													label: undefined,
													type: 'relation'}) {


	let {label, type } = options;

	label === undefined ? console.error('Proc ƒ Relation: label cannot be undefined.') : null;
	type === 'relation' ? console.error('Proc ƒ Relation: type cannot be undefined.') : null;

	const properties = {
		label,
		type
	}

	DEBUG ? console.log('Proc ƒ Relation: ', {properties}) : null

  //Does this value need to be here?
	//properties.value === undefined ? console.error('Proc ƒ Relation: value cannot be undefined.') : null
	properties.type === undefined ? console.error('Proc ƒ Relation: type cannot be null.') : null

	const thing 					= await individual(),
				identifier 			= Gun.node.soul(thing)

	var 	refObj = {[identifier]: identifier};
	const record = await gun.get(identifier).promPut(refObj);

	await gun.get(identifier).get('_type').promPut('relation');
	await gun.get(identifier).get('label').promPut(label);

	const relationColumn 		= gun.get('*').get('relation'),
				typeColumn				= gun.get('*').get('type').get(type); //TODO: separate relation types and concept types

	const stores = await Promise.all([
			storeC(record.ref, relationColumn),		//		.get(identifier).promPut(thing.ref),
			storeC(record.ref, typeColumn)	//.get(identifier).promPut(thing.ref)
	]);

	return record.ref


}

/*
* Store a Referent
* @param {string} value - the 'value' of the literal
* @param {string} identifier - the identifier of the item in question
* @param {string} type - The designator type. This can be :
							+ literalNumber, literalString, literalEncoded
							+ locatorIndividualMarker, locatorIndexical, locatorName
							+ arc?
							+ undetermined
*/
async function referent (value, identifier, options = { referentType: 'literal',
																						literalType: 'literal encoded',
																						quantifier:'@some',
																					}) {

		DEBUG ? console.log('Proc ƒ Referent: '+ value, {identifier}, {options}) : null

		if(identifier === undefined) {
			DEBUG ? console.error('Proc ƒ Referent: Identifier Required.') : null
			return undefined;
		}

		var record = await individual(identifier)

		if(options.referentType === 'gun') {

			if(options.value === undefined) {
			// Is this a blank referent? If so, procure an individual.
			// Otherwise, we store the value/soul in the locator e.g. #fkdks9f3djs4348o (the soul)
			// This usually happens with a blank graph.

				options.value = await individual();

				if(options.designator === undefined) {
					options.designator = options.value
				}
				if(options.descriptor === undefined) {
					options.descriptor = options.value
				}

			} else {
				options.designator = options.value
				options.descriptor = options.value
			}

			options.locator = Gun.node.soul(options.designator)

		}

		// TODO: Include Literal / Location Types
		// TODO: Add types of literals / designator-types according to Sowa
		if (options.referentType === 'literal') {
			var designator = btoa(value);
			await gun.get('*').get(designator).promPut(record);
			options['value'] = btoa(value)
		}
		const output = await gun.get(identifier).get('referent').promPut(options);

		DEBUG ? console.log('Proc ƒ Referent: output: ', output.ref) : null

		return output.ref;

	}


///////////////////////////

	// EVENTUALLY ADD THIS IN TO REFERENT (ABOVE)

		// Stored identifier in cache
		// We shouldn't do this just yet!
		/*
		var cachedReferent = await cache(arguments, 'referent');
		if(cachedReferent !== undefined) {
			return cachedReferent
		}
		*/

		/*if(root === true) {
			await cache(arguments, 'referent', recordIdentifier);
		} else if (root === false) {
		*/	//await cache(arguments, 'referent', graphReferent);
		//}
///////////////////////////

/*
* Procure a type-graph for an identifier.
* @param {string} identifier 		- The identifier to type
* @param {string} concept					- The concept type to set with the identifier
* @param {boolean} asGraph			- Declare the type as a graph (non-interanl)
* @returns {string} identifier 	- The resulting graph
*/

async function type(identifier, concept = undefined) {

	DEBUG ? console.log('TYPE:', identifier, concept) : null

	if(concept === undefined) {

		await query(refContain, identifier)

	}

	const refConcept	= await referent(concept);
	const graphOutput = await graph (
																				[
																					identifier,
																					refConcept
																				],
																				[refType],
																				[
																					[identifier, refType],
																					[refType, refConcept]
																				]
																		);

	return graphOutput.id

}


/*
* Procure a thing via label
* @param {string} label - The matching label of the object
*/

async function find(label, type, things) {

	DEBUG ? console.log('Find:', {label: label}, {type: type}, {things: things}) : null

	let results = [],
			foundThing = undefined;

	if (Array.isArray(things)) {
		results = things;
	} else if (typeof things == 'object'){

		let promises = [];
		for(let item of Object.keys(things)) {
	    if(item !== '_') {
	    	promises.push(gun.get(item).promOnce());
	    }
	  }
		results = await Promise.allSettled(promises);
		results = results.map(result => result.value.data)

	} else {
    return undefined;
  }



	for(let result of results) {
		// If we've inserted the promises
		if(result.label === label && result._type === type) {
			foundThing = gun.get(Gun.node.soul(result))
			break;
		}
	}

	return foundThing
}

/*async function storeArcs(arcPairs, relations) {

	console.log('storing arcs')
	// Iterate over all relations and add in the arcs
	for(let relation of relations) {
		var relativeConcepts = [];
		for (var i = 0; i < arcPairs.length; i++) {
			let arcPair = arcPairs[i];
			// If an arc in this pair includes the relation,
			// Let's push it to the relationArcs (arcs that this item has)
			if(arcPair.includes(relation)) {
				if ( arcPair[0] === relation ) {
					relativeConcepts.push(storeArc(arcPair[0], arcPair[1]))
				} else {
					relativeConcepts.push(storeArc(arcPair[1], arcPair[0]))
				}
			}
		}
	}

	return await Promise.all(relativeConcepts);
}
*/


async function arc(r,c, context) {

	DEBUG ? console.log('Proc ƒ Arc: ', {relation: r, concept: c, context: context}) : null

	/*
	... When k-store indices are more considerably useful.
	async function graphKs(conceptIdentifiers, relationIdentifiers, arcPairs) {
	// First, we iterate over all arcPairs, seeking a relation in every arc available to us.
	// When we find a relation, we hook the concept to the relation.
	var kStores = [];
	if(conceptIdentifiers.length > 1) {
		for(let a = 0; a < conceptIdentifiers.length; a++) {
			for(let b = a+1; b < conceptIdentifiers.length; b++) {
				for(let relation of relationIdentifiers) {
					var arcAR = false,
							arcRB = false;
					for (let arcPair of arcPairs) {
						if((arcPair[0] === conceptIdentifiers[a]) && (arcPair[1] === relation) ) {
							arcAR = true;
						}
						if((arcPair[0] === relation) && (arcPair[1] === conceptIdentifiers[b])) {
							arcRB = true;
						}
					}
					arcAR && arcRB ? kStores.push(await storeK(conceptIdentifiers[a], relation, conceptIdentifiers[b])) : null
				}
			}
		}
	} else {
			DEBUG ? console.log('❌ WARNING: Only 1 concept? No K-Store stored.' + arcsStored) : null
		}
		var kStored = await Promise.all(kStores);
		DEBUG ? console.log('✓ K-Stores Stored:' + kStored) : null
	}

	var conceptIdentifiers = [],
			relationIdentifiers = [],
			arcPairs = [];

	await gun.get(context).get('referent').get('designator').get('concepts').promOnce(data =>

	Check that back into concept identifiers

		console.log(data);
		)

		*/

	return storeArc(r, c, context)


}




async function assertContainment(graphIdentifier, identifiers) {

	// Assert that this graph contains the identifiers in its set.
	var containmentAssertions = [];
	for(let thing of identifiers) {
		containmentAssertions.push(await storeK(graphIdentifier, refContain, thing) )
	}
	await Promise.all(containmentAssertions);
}

/*
* Procure a Graph.
* TODO: Procure All Star Graphs
* A star graph contains a single relation and multiple concepts (2 is default).
* @param {array} conceptIdentifiers - the concepts to graph
* @param {array} relationIdentifiers - the relations to graph
* @returns {object} the resulting record of the graphObject (graphIdentifier)
*/
async function graph (conceptIdentifiers = [], relationIdentifiers = [], arcIdentifiers = [], identifier = undefined) {

	let thing = undefined;

	if(identifier === undefined) {

		thing 					= await individual();
		identifier 			= Gun.node.soul(thing);

	} else {

		thing = await individual(identifier);

	}

	const graphColumn 		= gun.get('*').get('graph')

	await storeC(thing, graphColumn);

	let conceptReferences = [];

	for(let conceptIdentifier of conceptIdentifiers) {

		//conceptReferences.push(gun.get(identifier).   )

	}

	// (conceptIdentifiers, relationIdentifiers, arcIdentifiers,

	var promises = [

		//await gun.get()

	]

	function uniqueArray(concepts, relations, arcs = []) {
		let items =[
								...new Set(
										[
										...concepts,
										...relations,
										...arcs
										]
									)
								].sort();
		return items;
	}



	//var cachedGraph 	= await cache(arguments, 'graph');

	/*if(cachedGraph !== undefined) {
		DEBUG ? console.log('✓ Retrieved Cached Graph') : null
		return cachedGraph
	}
	*/

	//let arcIdentifiers = await buildArcs(arcPairs);

	// --- START Graph Identification ---
	//var arcIdentifiers = [];
	var arcPromises = [];

	for(let arcIdentifier of arcIdentifiers) {

		//let arcItem = await gun.get(arcIdentifier).then();

		let arc = await gun.get(Gun.node.soul(arcIdentifier)).then();

		console.log(arc,'THEARC')

		// DEBUG ? console.log('Proc ƒ Graph: ', arcPair) : null
		// arcPromises.push(arc(arcPair[0], arcPair[1]));

		// create gun graph

		// Arcsignature has a type which is arc

		// Arcsignature has a type which is instrument has a connection which is arcPair[0] & arcPair[1]

		/*var arcGraphConcepts = [refArc, arcSignature, arcPair[0], arcPair[1]],
		 		arcGraphArcPairs = [
						[refArc, refType],
						[arcSignature, refType],
						[refConnect, arcSignature],
						[arcSignature, refContain],
						[refContain, arcPair[0]],// NEEDS FIXING
						[refContain, arcPair[1]] // NEEDS FIXING
					],
					arcGraphRelations = [refConnect, refContain, refType]
		// Store these as arcs by hand...

		arcPromises.push(storeArcs(arcGraphArcPairs, arcGraphRelations));
		arcPromises.push(graphKs(arcGraphConcepts, arcGraphRelations, arcGraphArcPairs));

		let arcGraphIdentifiers = uniqueArray(arcGraphConcepts, arcGraphRelations, await arc(arcGraphArcPairs));
		const arcGraphIdentifier = await referent(arcGraphIdentifiers.join(''));

		arcPromises.push(assertContainment(arcGraphIdentifier, arcGraphIdentifiers));
		arcIdentifiers.push(arcGraphIdentifier)
		*/
	}

	// var arcIdentifiers = await Promise.allSettled(arcPromises);

	DEBUG ? console.log('Proc ƒ Graph: Arc Identifiers: ', arcIdentifiers) : null


	let identifiers = uniqueArray(conceptIdentifiers, relationIdentifiers, arcIdentifiers);

	await referent(identifiers.join(''), identifier);
	//await assertContainment(identifier, identifiers)

	DEBUG ? console.log('✓ Arcs Built') : null;

	//await graphKs(conceptIdentifiers, relationIdentifiers, arcPairs);

		// --- START Type Assertion ---

	// Assert that this graph's arcs have a type of 'arc'.
	// arc -> type -> arcSignature
	// arcSignature has a type which is arc
	// ( concept/relation ) <- === has a c/r
	// ( concept/relation ) -> === is a c/r
	/*var typeAssertions = [];
	for(let arcSignature of arcIdentifiers) {
		typeAssertions.push( storeK(arcSignature, refType, refArc ) )
	}
	DEBUG ? console.log('✓ Arcs Typed') : null
	*/
	// and so on...
	// Assert that this graph's relations have a type of 'relation'.
	// relation -> type -> identifier
	// relationIdentifier has a type which is relation

	/*for(let relation of relationIdentifiers) {
		typeAssertions.push( storeK(relation, refType, refRelation ) )
	}
	*/
	//DEBUG ? console.log('✓ Relations Typed') : null
	// Assert that this graph's concepts have a type of 'concept'.
	// concept -> type -> conceptIdentifier
	// conceptIdentifier has a type which is concept

	/*for(let concept of conceptIdentifiers) {
		typeAssertions.push( storeK(concept, refType, refConcept) )
	}

  DEBUG ? console.log('✓ Concepts Typed') : null
  await Promise.all(typeAssertions)
  */

  const graphOutput = {
		identifier,
		concepts: new Set(conceptIdentifiers),
		relations: new Set(relationIdentifiers),
		arcs: new Set(arcIdentifiers)
	};

	DEBUG ? console.log('Proc ƒ Graph: Output:', graphOutput) : null


	// Cache this Identifier
	/*await cache(arguments, 'graph', graphOutput);
		DEBUG ? console.log('✓ Graph Cached:' + graphOutput) : null
	*/
	return graphOutput

}

const literal = false;


export {referent,  concept, relation, literal, type, cache, arc, find}
