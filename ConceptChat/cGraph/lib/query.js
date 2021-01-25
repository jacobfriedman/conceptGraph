import { referent, literal } from './procurements.js'

const DEBUG = true;

async function query(relation, concept, debugSource = undefined) {

	DEBUG ? console.log('QUERY:', relation, ':', await literal(relation), concept, ':', await literal(concept), 'rc') : null

	const results 					= [];
	var query = await gun.get(relation).promOnce();


	if(query !== undefined) {
		console.log('concept', concept);
		console.log('relation', relation);
		var item = await gun.get(concept).get(relation).promOnce();
		console.log(item.data, item);
		if(item.data) {
			// item is not root
			console.log('data', item.data);
			results.push(item.data[0]['#']); //returns key of the concept saved under one (the contained item)
		} else {
			results.push(item.key); // when root returns undefined
		}



		// For each entry of what has 'contain'ed this 'context'
	/*	for await (let entry of Object.entries(query)) {

		  // This is the graphSignature123 in console; we're splitting this
		  // into graphSignature12 ... and searching for 3

		  const identifier = entry[0].split(concept);

		  if(identifier.length === 2 && identifier[0] === '') {

			  const found = identifier[1];


		    // Since we have the identifier as '3' in graphSignature123,
		    // we check the K-Store and chop the strings up to find what the 'context' 'co
			  let result = await gun.get(concept).get(concept+relation+found).promOnce();

			  if(result.data !== undefined) {

			  	result = await gun.get(result.data[2]).promOnce();

			  	result = Object.keys(result.data).filter(key => key !== '_')[0];

			  	results.push(result);
			  }


		    // If it exists, add it to the __identifiers.
		    if(result.data !== undefined) {
		      results.push(result.data);
		    }


		  }

		}
		*/


	}

		DEBUG ? console.log('QUERY RESULTS:', results, await literal(relation), ':', relation, await literal(concept), ':',concept, 'rc') : null

	return results

}

export {query}
/*

      // Step 1: FETCHING THE CONTEXT.
      // What does the context contain?
      // If the outerContext is a string, bring it into this context

      // In order to pull the outercontext as innercontext,
      // we need to search the K-Store to find what the identified context (contextIdentifier) contains.
      // TODO: Find what the identified context IS through contextIdentifier->be->???
      async function findNests(id) {

        console.log(id,' THEID')

        var containRef             = await gun.get(soulContain).then(),
            nestedIdentifiers      = [];

        if(containRef !== undefined) {
          var query = await gun.get(containRef).get(id).then();
        } else {
          DEBUG ? console.log('Error: No Context/Container') : null;
        }
          // Ensure the K-Store exists
          if(query !== undefined) {
            DEBUG ? console.log('✓ Outer Context Identified') : null

            // For each entry of what has 'contain'ed this 'context'
            for await (let entry of Object.entries(query)) {

              // This is the graphSignature123 in console; we're splitting this
              // into graphSignature12 ... and searching for 3
              const identifier = entry[0].split(id+soulContain);

              if(identifier.length === 2 && identifier[0] === '') {

              const containedThing = identifier[1];
                // Since we have the identifier as '3' in graphSignature123,
                // we check the K-Store and chop the strings up to find what the 'context' 'co
                let result = await gun.get(id).get(id+containRef+containedThing).get('2').get(identifier[1]).promOnce();

                // If it exists, add it to the __identifiers.
                if(result !== undefined) {
                   nestedIdentifiers.push(result.key)
                }

              }

            }

          }


        return nestedIdentifiers
      }

      async function findTypes(id) {

        var typeRef             = soulType,
            typeIdentifiers      = [];

        if(typeRef !== undefined) {

          var query = await gun.get(typeRef).get(id).then();

        } else {
          return [];
          DEBUG ? console.log('Error: No Context/Container') : null;
        }
          // Ensure the K-Store exists
          if(query !== undefined) {
            console.log('✓ Outer Context Identified')
            // For each entry of what has 'contain'ed this 'context'
            for await (let entry of Object.entries(query)) {

              // This is the graphSignature123 in console; we're splitting this
              // into graphSignature12 ... and searching for 3
              const identifier = entry[0].split(id+typeRef);

              if(identifier.length === 2 && identifier[0] === '') {

              const typeThing = identifier[1];
                // Since we have the identifier as '3' in graphSignature123,
                // we check the K-Store and chop the strings up to find what the 'context' 'co

              let result = await gun.get(id).get(id+typeRef+typeThing).get('2').get(identifier[1]).promOnce();

              console.log(result.key, await literal(result.key), 'lit')
              // If it exists, add it to the __identifiers.
                if(result !== undefined) {
                   typeIdentifier = await literal(result.key)
                }

              }

            }

          }


        return typeIdentifiers
      }
*/
