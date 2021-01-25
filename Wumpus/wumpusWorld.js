/* For inference I need to be able to do exat matching of nested graphs */
/* Access Graphs from an evaluator or from another context */

/*
* Compare two graphs.
* @param {graph} graph1 - one to be compared
* @param {graph} graph2 - two to be compared
* @returns true if exactly the same, other wise returns false
*/

function deepCompare (graph1, graph2) {
  let one = graph1;
  let two = graph2;
  let result = false;

  for(let item of one.concept) {
    for(let item2 of two.concept) {
      if(item.uuid == item2.uuid){
        console.log(item2);
        result = true;
        break;
      }
    }
  }
  return result;
}

/*
* Function to parse written text into conceptual graphs
* @param the compromise.cool output
* @returns a cg graph
*
*/

// compromise provides us with a lot of detail we can work with
// our general tactic is, split sentences into before verb and after verb.
// Create a concept from the Noun before the verb
// The verb is fetched from existing concepts (create has agent and theme relation)
// relations are created to connect first noun to verb to second noun.
// Reasoning is called over the graph.

function textToGraph (data) {
  console.log(data);
  // get sentences separated
  console.log(data.list);

  for (sentence of data.list) {
    console.log(sentence);
    for (word of sentence.terms) {
      console.log(word.normal);
      console.log(word.tags);

    }
  }
}

/* Inference Rules about the Wumpus World */

/* The Wumpus World has only a few rules. The player always start in Square x 0 y 3 (00 is top left)
*   in each room the player may receive a percept.
*   If the player feels a breeze an adjacent room is actually a pit.
*   If the player smells a stench, the Wumpus is in an adjacent room.
*   If the player perceives a glitter, he is in the same room as a piece of gold. (He should grab it)
*   If the player falls into a pit or ends up in the same room with the Wumpus, he dies.
*/

/*
 Every 'timestep' we tell the KB the current perception the 'agent' is 'experiencing'.

 Rules will look at the perception and create / 'infer' new knowledge from it.
 Then we merge all knowledge into one big graph.
 The important part is that each time an action is executed, it will transform the current state

 */

var wump = new Reasoner(eventS);
wump.eventS.sub('unify', wump.unify.bind(wump));

var initialGraph = parse("Initial::[Player:You*x(1.0)](location?x?y)[Room:03*y(1.0)](pTime?a?y)[Time:0*a(1.0)](percept?a?b)[Breeze:False*b(0.0)](state?y?z)[Safe:Yes*z(1.0)]")

var notAPit = parse("Not a Pit::[Player:You*x(1.0)](location?x?y)[Room:**y](pTime?a?y)[Time:**a](percept?a?b)[Breeze:False*b(0.0)]")

var notAPitCon = parse("Not A Pit Conclusion::[Player:You*x(1.0)](location?x?y)[Room:**y](adjacent?y?z)[Room:**z](be?z?a)[Pit:Ahh*a(-1.0)]")
notAPit.setCon(notAPitCon, wump)

var adjacentRule = parse("Adjacency::[Room:**x](adjacent?x?y)[Room:**y]");
var adjacentCon = parse("AdjacencyCon::[Room:**x](adjacent?y?x)[Room:**y]");
console.log(adjacentRule);
adjacentRule.setCon(adjacentCon, wump)

wump.law.add(notAPit);
wump.law.add(adjacentRule);

//wump.assert(initialGraph)
console.log(wump.assert(initialGraph));
// 3 neighbouring rooms that need to connect to each other as they are asserted
var world1 = parse("World::[Room:03*y(1.0)](adjacent?y?x)[Room:02*x(1.0)]");
console.log('Telling Room 03 next to Room 02')
console.log(wump.tell(world1))
var world2 = parse("WorldTwo::[Room:02*x(1.0)](adjacent?x?y)[Room:01*y(1.0)](adjacent?y?x)");
console.log('Telling Room 02 and Room 01');
console.log(wump.tell(world2));
var world3 = parse("WorldThree::[Room:01*x(1.0)](adjacent?x?y)[Room:00*y(1.0)](adjacent?y?x)");
console.log('Telling Room 01 and Room 00');
console.log(wump.tell(world3));
