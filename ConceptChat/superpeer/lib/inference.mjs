import Context from '../../../cGraph/Context.js';
import * as rulesi from './Rules.mjs'
import * as cgi from './cgApp.mjs'

var global;

export async function init(window) {
  global = window;

  console.log('initing rules')
  await cgi.init(window);
  await rulesi.init(window);

  /* Remove previous eventListeners, if we don't do this we increase events being called
      and create an issue.
    */
  document.removeEventListener('assertion', assertion);

  /* Create custom event assertion. We can fire the event at any time. It's like
      a channel
      */
  var assertEvent = new Event('assertion');

  /* Add a new event listener so all event in the document that are fired with
      the word assertion are captured by the function assertion.
      */
  document.addEventListener('assertion', assertion);
}



/* Function to handle assertion event
    @param ev - Event Object, should have option graph attached
    Calls assertToContext with the graph 'async'.
    */
function assertion(ev) {
  //called synchroneously so we need to async
  console.log('asserting graph', ev.graph);
  // quick ref to graph identifier
  var graph = ev.graph;
  // make async
  assertToContext(graph);
}

/* Function to process a graph before it is asserted into the context
    @param graph - Thing Object
*/

async function assertToContext(graph) {
  console.group('assertion');
  // get the rules from rules context
  let rules = await context.find('Rules', 'concept'),
      rulesContext = await new Context(Gun.node.soul(rules));

  let concepts = await rulesContext.concepts;
  concepts = concepts.data;
  if(concepts){
    let keys = Object.keys(concepts);
    var promises = [];
    // get the rule identifiers and turn them into addressable items
    keys.forEach((key, i) => {
      if(key == '_'){return};
      promises.push(gun.get(key).then());
    });

    let rulesArr = await Promise.allSettled(promises);

    rulesArr.forEach((item, i, arr) => {
      // unpack
      arr[i] = Gun.node.soul(item.value);
    });

    console.log('rulesArr', rulesArr)

    rulesArr.forEach(async (item, i, arr) => {
      // unpack
      console.log(item.label)
      console.log('checking');
      var proj = await cgi.unifyProject(graph, item);
      console.log('projected items',proj.concepts.sets.length)
      console.log('proj:',proj);
      //console.log((await item.concepts).length);
    });
  }




   //for each rule, check graph against rule
  /*
  for(var rule of ruleArr) {
    // announce which rule we are checking against
    console.log('checking: ', rule);
    // project to see if any rule matches
    var proj = cgi.unifyProject(graph, rule);
    console.log('projected items',proj.concepts.sets.length)
    console.log('proj:',proj);
    console.log(rule.concept.length);
    if(rule.concept.length <= proj.concepts.sets.length){
      console.log(proj);
      var res = cgi.applyRule(graph, rule, proj);
    }

    // TODO
  }*/
  //project into context
  ///var proj = cgi.unifyProject(window.__CG.context.axioms[0], graph);
  // join together
  ///var res = cgi.unifyJoin(window.__CG.context.axioms[0], graph, proj);
  // replace context with new context
  console.groupEnd();
}


// Public Interface to assert items
export function assert(graph) {
  var assertEvent = new Event('assertion');
  assertEvent.graph = graph;
  document.dispatchEvent(assertEvent);
}



/*
  What this class does:
  - create a event listener for the assertion event.
  - handle the assertion event non-blocking
  - assert new assertions into the context (db?)
  - check against rules and fire them (transform graphs before adding into context)

  How it should work:
  Each time the user clicks somewhere or does something, an event is thrown with
  a graph denoting the action/event.
  When an event is fired with document.dispatchEvent it is blocking, hence the setTimeout
  in the assertion function to unblock the UI.
  The graph is passed to the assertToContext function for processing.
  We unify the context before assertions, so we aren't doing unnecessary checks into
  the context later.
  Then we check the graph around the rules and apply them as we encounter them,
  transforming the graph into a 'legal and acceptable' graph to be asserted into the
  db/context.
  After transformation is complete we hit it into the context/db, because we know it's good and acceptable?
  We might re-assert the newly created graph. Run it through the rules again,
  because transformation might have made it fire another rule, it didn't fire before
  The risk there is essentially that we could end up in an endless loop
  although unblocking technically.
*/
