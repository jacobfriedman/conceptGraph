import { referent, concept, relation, arc, type, cache, find} from './lib/procurements.js';
import {query} from './lib/query.js';
import { MD5 } from './lib/_utilities.js';
// import { assignType} from './lib/assignments.js';

const hash = (string) => {
	var output = new MD5();
	return output.constructor.hash(string)
}


export { referent, arc, type, query, relation, concept, cache, find}/*

export default class conceptGraph {

	constructor(context) {

		for (let [key, value] of Object.entries(context)) {
		  this[key] = value
		}
		

		// need a get & set proxy to intercept these calls
		// once the gun-store is initiated with conceptGraph, it will call the function from the stored version
		// which also allows for real-time updates to the API

		//this.gun = gun;
		console.log(this)

		return this;
			/*	procureReferent: gun => procureReferent,
				procureTerm,
				procureLiteral,
				procureContext,
				procureGraph
			}
			

	}

}
*/




//	console.log('initializing..')



		//async conceptGraph (gun, context) {},


//	return application;


/*	(async => () {

		console.log(this)



	})()
	*/

	//async initialize(gun) {

				//

			//	console.log(procureReferent)
				/*await gun.get('modules').get('conceptgraph').put({
					procureReferent,
					procureTerm,
					procureLiteral,
					procureContext,
					procureGraph
				}).then();
				*/

				// console.log(await gun.get('modules').get('conceptgraph'))








	//procureReferent


	  	/*procureReferent
	  	procureTerm
	  	procureLiteral
	  	procureContext
	  	procureGraph*/

			//initiate: async function(primaryTerms, secondaryTerms) {

				//console.log('initiating...')
				// STEP 1
				// Procure all genesis terms & store their IDs under __identifiers.
				// Genesis terms are indicated with a __genesis.

				
			/*	for await (const term of primaryTerms) {
						var thing = await procureTerm(term, true);
				}
				
			  await Promise.all(
					secondaryTerms.map(async term => {
				    return await procureTerm(term, true)
					  })
			  )

			  var allTerms = primaryTerms.concat(secondaryTerms)

			  await Promise.all(
					allTerms.map(async term => {
						console.log(term)
				    return await assignType(__identifiers[term])
					  })
			  )
			  

			  var nonThingTerms = allTerms.filter(term => term !== 'thing')

			  */

			/*  await Promise.all(
					nonThingTerms.map(async term => {
				    	return await assignType(__identifiers[term], __identifiers['thing'], 'supertype');
					  })
			  )
			  */

				// STEP 2
				// Assign each term its own type
				// e.g. 'thing' is of type 'thing'


				// This isn't genesis anymore.
			//	await gun.get('universe').get(genesis).put(false);
		/*		var universe = __identifiers['universe'],
						be 				= __identifiers['be'],
						agent			= __identifiers['agent'];

				await procureGraph([universe,be],[agent]);
				*/
			

			//}


		// await application.initiate(config.primaryTerms, config.secondaryTerms);

		// Procure empty context
		// var contextEmpty = await application.procureContext()

	/*	const agent			= __identifiers['agent']
		const have 			= __identifiers['have']
		const property 		= __identifiers['property']
		const identifier 		= __identifiers['identifier']

		var contextIdentifiedArcs = [
			[ [contextEmpty] , [agent] ], // contextEmpty -> agent
			[ [agent] , [have] ],		  // agent -> have
			[ [have] , [property]],		  // have -> property
			[ [property], [identifier]]   // property -> identifier
		]

		var contextIdentified = await application.procureContext(null, [contextEmpty, have], [agent, property], contextIdentifiedArcs )

		*/
