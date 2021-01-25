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
	async function context (identifiers = [])  {

		const flatten = function(arr, result = []) {
		  for (let i = 0, length = arr.length; i < length; i++) {
		    const value = arr[i];
		    if (Array.isArray(value)) {
		      flatten(value, result);
		    } else {
		      result.push(value);
		    }
		  }
		  return result;
		};

		// A blank conceptual graph returns the identifier of our inception-context
		// console.log('Concepts:', concepts.length, 'Relations:', relations.length, 'Arcs:', arcs.length)

		let uniqueConcepts = [...new Set(identifiers)].sort();
		//let uniqueRelations = [...new Set(relations)].sort();

		// iterate over all arc sets and push them into a complete list
		/*for (var i = 0; i < arcs.length; i++) {
			var arcMap = arcs[i];
			for (var j = 0; j < arcMap.length; j++) {
				var arc = arcMap[j];
				// console.log(arc, 'thearc')
			}
		}
		*/

		//var uniqueArcs = [...new Set(flatten(arcs).sort())].sort();
		//var referentLiteral = concepts.join('') + relations.join('') + uniqueArcs.join('');
		var referentLiteral = uniqueConcepts.join('');

		// console.log('Procure Context: "'+contextIdentifier+ '"...')
		const referent = await referent(referentLiteral);

		identifier = referent.recordIdentifier;
		console.log('Procured Context: ' +identifier + ' with Designator Identifier:' +referent.designatorIdentifier)

		return identifier

	}