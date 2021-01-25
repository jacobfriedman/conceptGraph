import Context from '../../cGraph/Context.js'
import { parseHTML } from '../../cGraph/lib/dom/parseHTML.js'
import { initialize as initializeTemporalLogic } from '../logic/temporal.mjs'
import { initialize as initializeSpatialLogic } from '../logic/spatial.mjs'
import * as cg from './cgApp.mjs';
import * as infi from './inference.mjs';
import { gunLoader } from '../lib/gunLoader.mjs';

var global;

const DEBUG = true;
const ENV_DEVELOPMENT = true;


/* We need to create some custom events for the logic portion */
export async function initialize(window) {

    global = window;

    // 1. Load Gun into window
    await gunLoader(window);

    console.log('Booting Concept Graph...')

    // 2. Generate Gun User
    if(DEBUG) {
      console.log('Boot: Creating User...')
    }
    gun.user().create('guest','password',(result) => {

        gun.user().auth('guest','password', async data => {

          if(DEBUG) {
            !('err' in data) ? console.log('Boot: 🙂 Logged In') : 'Boot: 😠 User Error'
          }

          if('soul' in data) {

            /*
            "For in acts we must take note of who did it,
            by what aids or instruments he did it (with),
            what he did, where he did it,
            why he did it,
            how and when he did it.[7]"
            */

            // WHO
            let user = {
                label: 'user',
                type: 'user',
                value: data.soul,
                referentOptions: {
                    identifier: data.soul,
                    referentType: 'gun',
                },
            }

            console.log('awaiting parse...')

           // let thisDocument = await new Context(undefined);

           /*document.open("text/html", "replace");
           document.write(output.documentElement.innerHTML);
           document.close();
           */

           // TODO: Add parsed document (from parseHTML) and children into the global context.
           // TODO: represent OR insert the user with/beside/inside the parsed document?

            let contextRequest = await gun.user().get('context').promOnce(),
                contextIdentifier = contextRequest.data;
               
            // If we don't have a context identifier,
            if(contextIdentifier === undefined || ENV_DEVELOPMENT) {

              DEBUG ? console.log('Boot: 🙂 Generating Context:', ) : null;

              global.context = await new Context(undefined, {concepts: [user]});

              let put = await gun.user().promPut({context: global.context.identifier});

              let htmlContext = await parseHTML(document.implementation.createHTMLDocument());

              await global.context.concept(htmlContext.identifier)


            } else {
              DEBUG ? console.log('Boot: 🙂 Context Found:', contextIdentifier) : null;
              global.context = await new Context(contextIdentifier);
            }



            // WHERE
           // await initializeSpatialLogic(global);

            // WHEN
            await initializeTemporalLogic(global);

            // WHY
            // await ...?

            // HOW ?
            // ... await semanticLogic?

            // TODO: Move this to the context.
            cg.init(global);

            // TODO: Move this to the context.
            infi.init(global);
          }

        })
    })




}

/*
 Any action the user can take is either a button push or a deblur from a text input..
 So do we define this as we create the view graph?

 Also each interaction asserts a user context graph.

 User at Time:ms was agent of createing object/theme? context:"Login into Lobby"

 Rule Login into Lobby -> retrieve view of Lobby (trigger query)

 rules are always matched against the asserted context referent (another graph)

 if no rule matches, we look for a schema that matches, schema's are our way of saying
 "Are you looking for this thing?"

 Like a list of items they could be asking because they contain a small match to something they
 said
*/
