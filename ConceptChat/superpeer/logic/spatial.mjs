import Context from '../../../cGraph/Context.js';
import * as cg from '../lib/cgApp.mjs';
import * as infi from '../lib/inference.mjs';

var global;
var context;

export async function initialize (window) {

	global = window;
	context = window.context;

  let contextLocation = await context.find('url', 'concept');

  if(contextLocation === undefined) {

		contextLocation = await context.concept({
		  label: 'url',
		  type: 'location',
		  value: window.document.location
	  })

  }

  //context

	//let location = await new Context();

	// Place the eventStream into the global context
	/*await context.concept({
	  label: 'Location',
	  type: 'location',
	  value: locationStream.identifier,
	  referentOptions: {
	      identifier: locationStream.identifier,
	      referentType: 'gun',
	    },
	  identifier: locationStream.identifier
  })
  */

	// Concept Graph is Loaded
	//await handle(location);

  /*window.addEventListener('click', handle);
  // On unload, we need to remove our event handlers
  //(annoying, browser's fault.)
  window.addEventListener('unload', (ev) =>{
      window.removeEventListener('click', handle);
      handle(ev);
  });
  */

}

export async function handle(location) {

  // We create a new graph based on the location
  // and insert it into the main context graph.

  /*let eventStream 						= await context.find('Event Stream', 'concept'),
  		eventContextIdentifier	= Gun.node.soul(eventStream),
  		eventContext 						= await new Context(eventContextIdentifier);

	let newLocation   				= await new Context(),
			concept 							= newLocation.concept,
			relation 							= newLocation.relation,
			arc 									= newLocation.arc,
			time 									= Date.now()+'ms';

	console.log('Event Fired:', event.type, {event});

	let things = await Promise.allSettled([

		// -- CONCEPTS --
		// Event:
		concept({
			label: 'event',
			type: 'concept',
			value: time}), 
		// Time:
		concept({
			label: 'time',
			type: 'time',
			value: time}), 
		// Type:
		concept({
			label: 'type',
			type: 'type',
			value: event.type}), // Type
		// Target:
		concept({
			label: 'target',
			type: 'target',
			value: event.target.identifier
		}), // Target

		// -- RELATIONS --
			// at:
		relation({
			label: 'at',
			type: 'at'}), 
		// fire:
		relation({
			label: 'fire',
			type: 'fire'
			}),
		// target:
		relation({
			label: 'target',
			type: 'target'}),
		// type:
		relation({
			label: 'type',
			type: 'type'
		})

	]);

	things = things.map(result => result.value);

	let	userConcept = Gun.node.soul(await context.find("user", 'concept')),
			eventConcept = Gun.node.soul(await context.find("event", 'concept', things)),
			targetConcept = Gun.node.soul(await context.find("target", 'concept', things)),
			timeConcept = Gun.node.soul(await context.find("time", 'concept', things)),
			typeConcept = Gun.node.soul(await context.find('type', 'concept', things)),

			fireRelation = Gun.node.soul(await context.find("fire", 'relation', things)),
			atRelation = Gun.node.soul(await context.find('at', 'relation', things)),
			targetRelation = Gun.node.soul(await context.find('target', 'relation', things)),
			typeRelation 	= Gun.node.soul(await context.find('type', 'relation', things));

	let arcs = await Promise.allSettled([
	  arc([userConcept,fireRelation]),
	  arc([eventConcept,fireRelation]),
		// at relation
	  arc([timeConcept,atRelation]),
	  arc([eventConcept,atRelation]),
		// target relation
	  arc([eventConcept, targetRelation]),
	  arc([targetConcept, targetRelation]),
		// type relation
	  arc([eventConcept, typeRelation]),
	  arc([typeConcept, typeRelation])
	 ]);

	//console.log(arcs,'ARCSSETTLED')

	await eventContext.concept({
		label: 'Event Graph',
		type: 'Event',
		value: newEvent.identifier
	});

		console.warn('eventStream, ', eventStream)
	/*

	// Create new event graph / context to assert into global context

	//assert event into eventStream
	console.log('asserting event into context', newEvent.identifier);
	await contextEvent({
		label: 'Event Graph',
		type: 'Event',
		value: newEvent.identifier
	});
	// TODO: mechanism to call inference on newly asserted event graph

  // infi.assert(graph);
  */

}
