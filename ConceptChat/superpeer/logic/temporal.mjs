import Context from '../../../cGraph/Context.js';
import * as cg from '../lib/cgApp.mjs';
import * as infi from '../lib/inference.mjs';


const DEBUG = false;

var global;
var context;

export async function initialize (window) {

	global = window;
	context = window.context;

  // Initialize the EventStream Context
	let eventStream = await context.find('Event Stream', 'concept');

	if(!eventStream) {

		eventStream = await new Context();

		// Place the eventStream into the global context
		await context.concept({
		  label: 'Event Stream',
		  type: 'stream',
		  value: eventStream.identifier,
		  referentOptions: {
		      identifier: eventStream.identifier,
		      referentType: 'gun',
		    },
		  identifier: eventStream.identifier
	  })
	}

	// Concept Graph is Loaded
	await handle({type: 'loaded', target: {identifier: context.identifier}});

  window.addEventListener('click', handle);
  // On unload, we need to remove our event handlers
  //(annoying, browser's fault.)
  window.addEventListener('unload', (ev) =>{
      window.removeEventListener('click', handle);
      handle(ev);
  });

}

export async function handle (event) {

	let identifier = event.target.identifier;

	if('attributes' in event.target) {
		for(var i = 0; i < event.target.attributes.length; i++) {
			if((event.target.attributes[i].name) === 'identifier') {
				identifier = event.target.attributes[i].value
			}
		}
	}

  // We create a new graph based on the event
  // and insert it into the main context graph.
  let eventStream 						= await context.find('Event Stream', 'concept'),
  		eventContextIdentifier	= Gun.node.soul(eventStream),
  		eventContext 						= await new Context(eventContextIdentifier);

	let newEvent   						= await new Context(),
			concept 							= newEvent.concept,
			relation 							= newEvent.relation,
			arc 									= newEvent.arc,
			time 									= Date.now()+'ms';

	if(identifier === undefined) {
		identifier = context.identifier
	}

	let things = await Promise.allSettled([

		// -- CONCEPTS --
		// User:
		concept({
			label: 'user',
			type: 'concept',
			value: "test"}),
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
			value: identifier
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

	let	userConcept = Gun.node.soul(await context.find("user", 'concept', things)),
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

	DEBUG ? console.warn('eventStream, ', eventStream) : 0;


	// Create new event graph / context to assert into global context

	/*
	* What needs to happen is that inference, adds knowledge to the
	* current graph. And that knowledge then is entered into the users context.
	* The users working context is where things reside in a controlled environment.

	// TODO: mechanism to call inference on newly asserted event graph
	*/
	var graphId = newEvent.identifier;
  infi.assert(graphId);

}
