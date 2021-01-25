import Context from '../../Context.js'
import { parse, init } from '../../../superpeer/lib/cgApp.mjs'

const DEBUG = true;

init(window);

function nodeTypeToString(nodeTypeInteger) {

  let nodeTypeLookup = 
  {  1: 'ELEMENT_NODE',
      2: 'ATTRIBUTE_NODE',
      3: 'TEXT_NODE',
      4: 'CDATA_SECTION_NODE',
      5: 'ENTITY_REFERENCE_NODE',
      6: 'ENTITY_NODE',
      7: 'PROCESSING_INSTRUCTION_NODE',
      8: 'COMMENT_NODE',
      9: 'DOCUMENT_NODE',
      10:  'DOCUMENT_TYPE_NODE',
      11:  'DOCUMENT_FRAGMENT_NODE',
      12: 'NOTATION_NODE'
    }

  return nodeTypeLookup[nodeTypeInteger]
  
}


export async function parseHTML(node) {


  let identifier = undefined,
      rootContext = undefined;

	let rootNode = node;
	if(node.documentElement !== undefined) {
		node = node.documentElement;
	}


	for(let i = node.attributes.length - 1; i >= 0; i--) {
	  let attribute = node.attributes[i].name,
	      value     = node.attributes[i].value
	  if(attribute === 'identifier') {
	    identifier = value;
	  }
	}

  // If the node does not have the "identifier" attribute...
	if(identifier === undefined) {
		    rootContext = await new Context(undefined, undefined, {type:'HTMLElement', label: 'document', value:'{}'});
				identifier = rootContext.identifier
	}

  let walker = document.createTreeWalker(
      rootNode,  // root node
      NodeFilter.SHOW_ALL,  // filtering only text nodes
      null,
      false
  );

    // If we have a node


    while (walker.nextNode()) {

      let HTMLNode = walker.currentNode;

      DEBUG ? console.log('parse HTML: ', HTMLNode) : null;

      let parent            = HTMLNode.parentNode,
          parentIdentifier  = undefined,
          parentContext     = undefined;

      if(parent.nodeType !== 9) {  
        // If the parent node IS NOT a DOCUMENT_NODE,
        // get the identifier of the parent.
        parentIdentifier  = parent.getAttribute('identifier');
        // Create that parent's context & save it
        parentContext = await new Context(identifier, undefined, {type:'HTMLElement'});

      } else {
        // If the parent node IS a DOCUMENT_NODE,
        parentContext = rootContext;
        // then we'll just assume the parent context is the node passed in.
      }

      // 1 = ELEMENT_NODE
      // 8 = COMMENT_NODE
      // 10 = DOCUMENT_TYPE_NODE
      // 11 = DOCUMENT_FRAGMENT_NODE
      // 3 = TEXT_NODE

      // If this is a TEXT_NODE type
      if(HTMLNode.nodeType === 3 && (HTMLNode.parentNode.nodeType === 11 || HTMLNode.parentNode.nodeType === 1)) {
      //	DEBUG ? console.log('parse HTML: ', HTMLNode) : null

  					let textConcept = {
													value: HTMLNode.textContent,
													label: 'text',
													type: 'TEXT_NODE',
													identifier: parentContext.identifier
												}

  					await parentContext.concept(textConcept);
      }

      // If this is an ELEMENT_NODE or DOCUMENT_FRAGMENT_NODE type
      if( (HTMLNode.nodeType === 1) || (HTMLNode.nodeType === 11)) {

			  // On change/update/insertion of an item, we'll get the element
			  // then apply the transformations of its attributes / properties
			  // thereby fulfilling the browser-as-api for CG!

      	// Establish the attributes/properties
        let {nodeName, nodeValue, nodeType, textContent, attributes } = HTMLNode;

        nodeName = nodeName.toLowerCase();

        let identifier = undefined,
            label      = 'this',
            value      = '';

        // If the element has an identifier,
        // We keep it in memory.
        for(let i = attributes.length - 1; i >= 0; i--) {
          let attribute = attributes[i].name,
              value     = attributes[i].value
          if(attribute === 'identifier') {
            identifier = value;
          }
        }

        // Create a new HTML Context
        let HTMLNodeContext 		= await new Context(identifier, undefined, {
																																	            type: nodeName,
																																	            label: 'this',
																																	            value:'{}' // EMPTY VALUE STRING
																																	        });
        
        // Attribute the element to the identifier
        identifier =  HTMLNodeContext.identifier
        HTMLNode.setAttribute('identifier', identifier)

        console.log(nodeName,'THENODENAME')

        // Build the CGraph
        let graphString = 	`${btoa(nodeName)}::[${btoa(nodeName)}:${btoa(identifier)}*${btoa(identifier)}]`;
        		graphString +=  								`(${btoa('subtype')}?${btoa(identifier)}?${btoa('s')})[${btoa(nodeName)}:${btoa(nodeName)}*${btoa('s')}]`

        // Add attributes in to the concept & graph
        for(let i = attributes.length - 1; i >= 0; i--) {

          let attribute = attributes[i].name,
              value     = attributes[i].value
       
            graphString +=  								`(${btoa('attribute')}?${btoa(identifier)}?${btoa('y')}?${btoa('z')})[${btoa('identifier')}:${btoa(attribute)}*${btoa('y')}][${btoa('value')}:${btoa(value)}*${btoa('z')}]`;
        }

        if(HTMLNode.previousElementSibling !== null) {
          	 
          	 if(HTMLNode.previousElementSibling.getAttribute('identifier')) {
								
							let siblingIdentifier = HTMLNode.previousElementSibling.getAttribute('identifier')
            	 
          //  	graphString +=  `(${btoa('after')}?${btoa(identifier)}?${btoa(siblingIdentifier)})[${btoa(nodeName)}:${btoa(siblingIdentifier)}*${btoa(siblingIdentifier)}]`
          	 
          	 }
        }

        window.parse = parse;

        // TODO: PARSE THE GRAPH STRING
        // TODO: Parse should accept an identifier - add these concepts in as children if they do not exist
        // 																 - update these concepts if they DO exist 
        // TODO: PARSE INTO CONTEXT.
        //        - Copy parse function - SEE BELOW.
        //        - migrate to context graph 
       //console.log(graphString,'THEGRAPHSTRING')

       let base64 = true,
            returnContext = true;

       let nodeConcept = await parse(graphString, HTMLNodeContext, 'HTMLElement', base64, returnContext);  

       //console.log(nodeConcept,'thenodeconcept')
       //console.log(HTMLNodeContext.identifier,'HTMLNODECONTEXT')

       // await parentContext.concept(nodeConcept.label)

      }
    }

    return rootContext

}

