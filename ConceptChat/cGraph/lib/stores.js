import  { cache } from './procurements.js'

const DEBUG = false;
/*
* Store a K-Store.
* @param {object:gunref} c0 - The first Concept (GunRef)
* @param {string} c0Id - Concept 0 identifier
* @param {object:gunref} r0 - The first Relation (GunRef)
* @param {string} r0Id - Relation 0 identifier
* @param {object:gunref} c1 - The second Concept (GunRef)
* @param {string} c1Id - The second concept identifier
*/

export async function storeK( c0Id, r0Id, c1Id) {
	// wrap identifiers into an object we can put
	var c0Obj = {[c0Id]:c0Id};
	var r0Obj = {[r0Id]:r0Id};
	var c1Obj = {[c1Id]:c1Id};
	// create references and put object
	var c0 = await gun.get(c0Id).promPut(c0Obj);
  var r0 = await gun.get(r0Id).promPut(r0Obj);
  var c1 = await gun.get(c1Id).promPut(c1Obj);

	// put them into triples, both ways
	var puts = Promise.all([
		// 1 to 2, 2 has 0 to 1 and 1 to 3, 3 has 2
	  c0.ref.get(c0Id).promPut(r0.ref),
	  r0.ref.get('1').promPut(c1.ref),
		r0.ref.get('0').promPut(c0.ref),
	  c1.ref.get(r0Id).promPut(r0.ref)
	])

	return puts;
}

/*
* Store a directional arc.
* @param {string} t0Id - Thing 0
* @param {string} t1Id - Thing 1
*/

export async function storeArc( t0Id, t1Id, context ) {

		// Stored identifier in cache
	/*var cachedArc = await cache(arguments, 'storeArc');
	if(cachedArc !== undefined) {
		return cachedArc
	}

	const arcSignature12 = t0Id+t1Id, // one direction arc 1
	arcSignature21 = t1Id+t0Id; // second direction arc 1

	*/

	const arcColumn 		= gun.get('*').get('arcs');

	var t0Obj = {[t0Id]:t0Id};
	var t1Obj = {[t1Id]:t1Id};

	var t0 = await gun.get(t0Id).promPut(t0Obj);
	var t1 = await gun.get(t1Id).promPut(t1Obj);

	// put them into doubles, both ways
	var puts = await Promise.allSettled([
		t0.ref.get(t0Id).promPut(t1.ref),
		t1.ref.get(t1Id).promPut(t0.ref),
		arcColumn.get(t0Id).promPut(t1.ref),
		arcColumn.get(t1Id).promPut(t0.ref),
		gun.get(context).get('referent').get('designator').get('arcs').get(t0Id).promPut(t1.ref),
		gun.get(context).get('referent').get('designator').get('arcs').get(t1Id).promPut(t0.ref)
	]);

	return puts
}


/*
* Store a C-Store.
* Columnar Stores
* @param {object:gunref} A gun 'thing': concept/relation/arc/anything (GunRef)
* @param {object:gunref} The column to store the thing under
*/

export async function storeC( thingRef, column ) {

	 DEBUG ? console.log('Stores ƒ storeC: thingRef:',thingRef,'column:', column ) : null

	 var put = await column.promPut(thingRef);

	 return put

}


/*
* Store a C-Store.
* Columnar Stores
* @param {string} cId - Concept identifier
* @param {string} type - Type identifier


export async function storeC( cId, typeId ) {
	await Promise.all([
		await gun.get(cId).put({[typeId]:typeId}).then(),
		await gun.get(typeId).put({[cId]:cId}).then()
	])

}
*/

/*
Testing

localStorage.clear()

var Uuidv4 = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

var object1 = {
  id:Uuidv4(),
  literal:'I'
}

var object2 = {
  id:Uuidv4(),
  literal:'want'
}

var object3 = {
  id:Uuidv4(),
  literal:'Ice Cream'
}

var gun = Gun();

async function kStore (obj1, obj2, obj3) {
  var c0 = await gun.get(obj1.id).promPut(obj1);
  var r0 = await gun.get(obj2.id).promPut(obj2);
  var c1 = await gun.get(obj3.id).promPut(obj3);

  var c0ref = c0.ref;
  var r0ref = r0.ref;
  var c1ref = c1.ref;
  // one direction connection
  console.log(c0ref);
  await c0ref.promPut(r0.ref);
  //await r0ref.promPut(c1.ref);

  // and back again

  //await c1ref.promPut(r0.ref);
  //await r0ref.promPut(c0.ref);
}
*/
