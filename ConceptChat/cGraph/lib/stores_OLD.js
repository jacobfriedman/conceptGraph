import  { cache } from './procurements.js'

const DEBUG = true;
/*
* Store a K-Store.
* A typical K-Store, given a CG Declaration, is as follows:
*		Cat:1 agent:2 sitting:3 on:4 Mat:5
*		"CatonMat::[Cat*x](agent?x?y)[Sit?y](on?y?z)[Mat?z]"
*
*		1. cat 			.put({ 123 : {0: 1, 1:2, 2:3} })
*		2. cat 			.put({2})
*
*		3. agent 		.put({3: {31: {0:3, 1:1}})
*		4. agent 		.put({1: {13: {0:1, 1:3}})
*
*		5. sitting 	.put({ 123 : {0: 1, 1:2, 2:3} })
*		6. sitting		.put({2})

		... etc (4,5,6).

* @param {object:gunref} c0 - The first Concept (GunRef)
* @param {string} c0Id - Concept 0 identifier
* @param {object:gunref} r0 - The first Relation (GunRef)
* @param {string} r0Id - Relation 0 identifier
* @param {object:gunref} c1 - The second Concept (GunRef)
* @param {string} c1Id - The second concept identifier
*/

export async function storeK( c0Id, r0Id, c1Id) {

	DEBUG ? console.log('✓ Storing K...') : null


	// Assert the signature for this graph
	const graphSignature123 = c0Id+r0Id+c1Id,
				graphSignature13 	= c0Id+c1Id,
				graphSignature31  = c1Id+c0Id;

	// Assert the arcs signature for this graph

	//const arc12 =

	// TODO: we should get each concept and relation so when we assert the
	// triple... so we sould do
	// var c0 = gun.get(c0Id) // which saves the reference to that 'path' and
	// we can add that reference into the graph

	// Procure the records:
	const 		c0Ref = gun.get(c0Id);
	const			c1Ref = gun.get(c1Id);
	const			r0Ref	= gun.get(r0Id);
	const			c0 	= Gun.node.ify(c0Ref);
	const			c1 	= Gun.node.ify(c1Ref);
	const			r0	= Gun.node.ify(r0Ref);

	DEBUG ? console.log('✓ Refs Procured...') : null

	//gun.getconcept(c0Id) ... serve as a ref.
	// instead of passing the ID to 1, we just passed the ref
	// 1
	const puts = await Promise.all([
	c0Ref.get(graphSignature123).get('0').promPut(c0),
	c0Ref.get(graphSignature123).get('1').promPut(r0),
	c0Ref.get(graphSignature123).get('2').promPut(c1),
	// 2
  c0Ref.promPut({[r0Id]:r0Id}),
	//storeArc(c0Id, r0Id),
	// 3
  r0Ref.get(c0Id).get(graphSignature13).get('0').promPut(c0),
  r0Ref.get(c0Id).get(graphSignature13).get('1').promPut(c1),
	// 4
  r0Ref.get(c1Id).get(graphSignature31).get('0').promPut(c0),
	//storeArc(r0Id, c1Id),
  r0Ref.get(c1Id).get(graphSignature31).get('1').promPut(c1),
	// 5
  c1Ref.get(graphSignature31).get('0').promPut(c0),
  c1Ref.get(graphSignature31).get('1').promPut(c1),
	// 6
  c1Ref.promPut({[r0Id]:r0Id})
	])

	//console.log(await gun.get(r0Id).get(c0Id).then());

	return puts;

}

/*
* Store a bi-directional arc.
* @param {string} i1 - Identifier 1
* @param {string} i2 - Identifier 2
*/

export async function storeArc( identifier1, identifier2 ) {

	DEBUG ? console.log('✓ Storing Arcs...') : null

		// Stored identifier in cache
	var cachedArc = await cache(arguments, 'storeArc');
	if(cachedArc !== undefined) {
		return cachedArc
	}

	const arcSignature12 = identifier1+identifier2, // one direction arc 1
				arcSignature21 = identifier2+identifier1; // second direction arc 1

					// Procure the records:
	const i1Ref = gun.get(identifier1),
				i2Ref = gun.get(identifier2),
				i1 	= Gun.node.ify(i1Ref),
				i2 	= Gun.node.ify(i2Ref);

	var arcStored = await Promise.all([
		i1Ref.get(identifier2).get(arcSignature12).promPut(i1),
		i1Ref.get(identifier2).get(arcSignature12).promPut(i2),
		i2Ref.get(identifier1).get(arcSignature12).promPut(i1),
		i2Ref.get(identifier1).get(arcSignature12).promPut(i2),

		gun.get(arcSignature12).get('1').promPut(i1),
		gun.get(arcSignature12).get('2').promPut(i2),
		gun.get(arcSignature21).get('1').promPut(i1),
		gun.get(arcSignature21).get('2').promPut(i2),
	])

	return arcStored
}

/*
* Store a C-Store.
* Columnar Stores
* @param {string} cId - Concept identifier
* @param {string} type - Type identifier
*/

export async function storeC( cId, typeId ) {
	await Promise.all([
		await gun.get(cId).put({[typeId]:typeId}).then(),
		await gun.get(typeId).put({[cId]:cId}).then()
	])

}
import  { cache } from './procurements.js'

const DEBUG = true;
/*
* Store a K-Store.
* A typical K-Store, given a CG Declaration, is as follows:
*		Cat:1 agent:2 sitting:3 on:4 Mat:5
*		"CatonMat::[Cat*x](agent?x?y)[Sit?y](on?y?z)[Mat?z]"
*
*		1. cat 			.put({ 123 : {0: 1, 1:2, 2:3} })
*		2. cat 			.put({2})
*
*		3. agent 		.put({3: {31: {0:3, 1:1}})
*		4. agent 		.put({1: {13: {0:1, 1:3}})
*
*		5. sitting 	.put({ 123 : {0: 1, 1:2, 2:3} })
*		6. sitting		.put({2})

		... etc (4,5,6).

* @param {object:gunref} c0 - The first Concept (GunRef)
* @param {string} c0Id - Concept 0 identifier
* @param {object:gunref} r0 - The first Relation (GunRef)
* @param {string} r0Id - Relation 0 identifier
* @param {object:gunref} c1 - The second Concept (GunRef)
* @param {string} c1Id - The second concept identifier
*/

export async function storeK( c0Id, r0Id, c1Id) {

	DEBUG ? console.log('✓ Storing K...') : null


	// Assert the signature for this graph
	const graphSignature123 = c0Id+r0Id+c1Id,
				graphSignature13 	= c0Id+c1Id,
				graphSignature31  = c1Id+c0Id;

	// Assert the arcs signature for this graph

	//const arc12 =

	// TODO: we should get each concept and relation so when we assert the
	// triple... so we sould do
	// var c0 = gun.get(c0Id) // which saves the reference to that 'path' and
	// we can add that reference into the graph

	// Procure the records:
	const 		c0Ref = gun.get(c0Id);
	const			c1Ref = gun.get(c1Id);
	const			r0Ref	= gun.get(r0Id);
	const			c0 	= Gun.node.ify(c0Ref);
	const			c1 	= Gun.node.ify(c1Ref);
	const			r0	= Gun.node.ify(r0Ref);

	DEBUG ? console.log('✓ Refs Procured...') : null

	//gun.getconcept(c0Id) ... serve as a ref.
	// instead of passing the ID to 1, we just passed the ref
	// 1
	const puts = await Promise.all([
	c0Ref.get(graphSignature123).get('0').promPut(c0),
	c0Ref.get(graphSignature123).get('1').promPut(r0),
	c0Ref.get(graphSignature123).get('2').promPut(c1),
	// 2
  c0Ref.promPut({[r0Id]:r0Id}),
	//storeArc(c0Id, r0Id),
	// 3
  r0Ref.get(c0Id).get(graphSignature13).get('0').promPut(c0),
  r0Ref.get(c0Id).get(graphSignature13).get('1').promPut(c1),
	// 4
  r0Ref.get(c1Id).get(graphSignature31).get('0').promPut(c0),
	//storeArc(r0Id, c1Id),
  r0Ref.get(c1Id).get(graphSignature31).get('1').promPut(c1),
	// 5
  c1Ref.get(graphSignature31).get('0').promPut(c0),
  c1Ref.get(graphSignature31).get('1').promPut(c1),
	// 6
  c1Ref.promPut({[r0Id]:r0Id})
	])

	//console.log(await gun.get(r0Id).get(c0Id).then());

	return puts;

}

/*
* Store a bi-directional arc.
* @param {string} i1 - Identifier 1
* @param {string} i2 - Identifier 2
*/

export async function storeArc( identifier1, identifier2 ) {

	DEBUG ? console.log('✓ Storing Arcs...') : null

		// Stored identifier in cache
	var cachedArc = await cache(arguments, 'storeArc');
	if(cachedArc !== undefined) {
		return cachedArc
	}

	const arcSignature12 = identifier1+identifier2, // one direction arc 1
				arcSignature21 = identifier2+identifier1; // second direction arc 1

					// Procure the records:
	const i1Ref = gun.get(identifier1),
				i2Ref = gun.get(identifier2),
				i1 	= Gun.node.ify(i1Ref),
				i2 	= Gun.node.ify(i2Ref);

	var arcStored = await Promise.all([
		i1Ref.get(identifier2).get(arcSignature12).promPut(i1),
		i1Ref.get(identifier2).get(arcSignature12).promPut(i2),
		i2Ref.get(identifier1).get(arcSignature12).promPut(i1),
		i2Ref.get(identifier1).get(arcSignature12).promPut(i2),

		gun.get(arcSignature12).get('1').promPut(i1),
		gun.get(arcSignature12).get('2').promPut(i2),
		gun.get(arcSignature21).get('1').promPut(i1),
		gun.get(arcSignature21).get('2').promPut(i2),
	])

	return arcStored
}

/*
* Store a C-Store.
* Columnar Stores
* @param {string} cId - Concept identifier
* @param {string} type - Type identifier
*/

export async function storeC( cId, typeId ) {
	await Promise.all([
		await gun.get(cId).put({[typeId]:typeId}).then(),
		await gun.get(typeId).put({[cId]:cId}).then()
	])

}
