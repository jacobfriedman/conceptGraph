import Context from '../../../cGraph/Context.js';
import * as cg from './cgApp.mjs';


var global = window;

/* This is where we specify the rules enforced to clients */
export async function init (window) {
  global = window;
  var gun = global.gun;

  // Initialize the EventStream Context
  let rules = await context.find('Rules', 'concept'),
      rulesContext = await new Context(Gun.node.soul(rules));

  if(!rules) {

    // Place the rulesContext into the global context
    rules = await context.concept({
      label: 'Rules',
      type: 'context',
      value: rulesContext.identifier,
      referentOptions: {
          identifier: rulesContext.identifier,
          referentType: 'gun',
        },
      identifier: rulesContext.identifier
    })
  } else {
    console.log(rulesContext)
    console.log('Rules are there.')
  }

  var setRules = global.context.concept;
  var setConcept = rulesContext.concept;
  var setRelation = rulesContext.relation;
  var setArc = rulesContext.arc;


  /*
  This will be a long list of graphs that represent rules.
  We need to match these exactly to fire them.
  Firing them, will modify the Left Hand Side Graph with the Right Hand Side effect graph and assert it freshly.
  */

  // Empty rule array
  var ruleSet = [];

  /* Rules for the Chat Application  ---------------------------------- */

  /* Testing  allowable graphs */

  //1 - A single concept  -- expect acceptance

  //var testOneString = "TestOne::[Test:One*x]";
  //var testOneRule = cg.parse(testOneString);
  //console.log(testOneRule);

  //2 - A single relation -- expect failure

  //var testTwoString = "TestTwo::(testtwo?x?y)";
  //var testTwoRule = cg.parse(testTwoString); //should throw an error

  /******* APP FLOW *****************************/

  /* When entering the site an event is fired that creates a context and pulls it in
  */

  var welcString = "WelcomeRule::[Event:**x](fire?x?y)";
  welcString += "[Target:**y](type?x?z)[Type:load*z]";

  var welcomeRule = cg.parse(welcString, rulesContext)
  console.warn(await welcomeRule,'welcome')
  // cg.parse used to return an object, now it will return an identifier
  welcomeRule.con = function(){
    console.log('called welcome rule');
    //document.body.innerHTML = '';

    var title = document.createElement("h3");
    title.innerHTML = 'Concept Chat';

    document.body.append(title);

    var login = document.createElement('div');
    login.innerHTML = 'Please log in: <br>' +
    'Alias: <input type="text" id="alias" placeholder="Welcome back"> <br>' +
    'Passphrase: <input type="password" id="passphrase" placeholder="we missed you"> <br>' +
    '<button type="button" id="loginButton">Log me in</button>';

    login.setAttribute("class", "login");

    document.body.append(login);

    var create = document.createElement('div');
    create.innerHTML = 'Create a log in: <br> ' +
    'Alias: <input type="text" id="calias" placeholder="A name, what\'s in a name"> <br>' +
    'Passphrase: <input type="password" id="cpassphrase" placeholder="make it long"> <br>' +
    '<button type="button">Open Sesame!</button>';

    create.setAttribute("class", "login");

    document.body.append(create);

    var load = document.createElement('div');
    load.innerHTML = 'Loading Lobby...';

    load.setAttribute("id", "loading");
    load.setAttribute("class", "hidden");

    document.body.append(load);
  }


  ruleSet.push(welcomeRule);

  /******* User Authentication WorkFlow ********/
  /*
  * Upon clicking log in, we pull up the Lobby
  */

  /*
  * When 2 time concepts are not connected, take two non-equal once and
  * add before and after relation to them
  */

  /*var timeRule = cg.parse("TimeRule::[Time:**x][Time:**y]");
  timeRule.con = function () {console.log('called timeRule');return true;};
  // to manipulate graphs we need to add a function here that does something
  rules.push(timeRule);

  var loginRuleString = 'LoginRule::';
  loginRuleString += '[User:**x]';
  loginRuleString += '(fire?x?y)';
  loginRuleString += '[Event:**y]';
  loginRuleString += '(type?y?z)';
  loginRuleString += '[Type:Click*z]';
  loginRuleString += '(target?y?a)';
  loginRuleString += '[Target:loginButton*a]';
  var loginRule = cg.parse(loginRuleString);

  loginRule.con = function (graph, rule, proj) {
    console.log('called loginRule');
    var uName = document.getElementById('alias').value;
    document.getElementById('alias').value = '';
    var passP = document.getElementById('passphrase').value;
    document.getElementById('passphrase').value = '';
    console.log(`Called user signin`);
    user.auth(uName, passP, user.auth.bind(this, uName, passP));
  };

  rules.push(loginRule);
  */

  return welcomeRule;
}

/* This is where we specify the interface */

export function getList () {
  return ruleSet;
}

export function addRule (graph) {
 // rules.push(graph);
}
