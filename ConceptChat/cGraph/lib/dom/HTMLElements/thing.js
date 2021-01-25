if(window.customElements.get('thing-') === undefined) { 

             customElements.define('thing-',  class extends HTMLElement {
                    //static get observedAttributes() { return ['identifier']; }
                      constructor(...args) {
                        super(...args);
                        this.root = false;

                        if(document.body.querySelectorAll('*').length === 1) {
                          this.root = true;
                        }
                      }
                      connectedCallback() { 

                        this.identifier = this.getAttribute('identifier');

                       /* gun.get(this.identifier).map().on((value, key) => {
                          // We only want to render child nodes here
                          if(typeof(value) === 'object') {
                            this.render(value, key)
                          } else {
                            key !== this.identifier ? this.setAttribute(key, value) : null;
                          }
                          */
												 this.render()

                  
                        /*let id = typeof(value) !== 'object' ? MD5(identifier+value) : Gun.node.soul(value),
                            parent          = document.getElementById(identifier),
                            type            = typeof(value) !== 'object' ? 'property' : 'thing';

                            typeof(value) === 'object' ? children.push({id, type, key, value:value, attributes }) : null;

                            hyper(parent)`${
                              children.map(thing => wire(thing)`${
                              {
                                thing:
                                  {
                                    id: thing.id,
                                    type: thing.type, 
                                    key: key,
                                    value: thing.value,
                                    attributes: thing.attributes
                                  }
                                }
                              }`)
                            }`
                            */

                         // })

                      } 
                      render() {

                        console.log('test')
                        //return 'test'
                        /*this.hyper`${
                              children.map(thing => wire(thing)`${
                              {
                                thing:
                                  {
                                    id: thing.id,
                                    type: thing.type, 
                                    key: key,
                                    value: thing.value,
                                    attributes: thing.attributes
                                  }
                                }
                              }`)
                            }`
                            */

                        // attribute-focused
                        /*Object.keys(result).filter(key => attributes.includes(key)).map((key, index) => {
                          this.setAttribute(key, result[key]);
                        })

                        console

                        Object.keys(this.attributes).map(index => {

                          console.log(this.attributes.item(index), this.attributes.item(index).value, 'index')

                        })
                      Context: ${identifier}
                                ${Object.keys(this.attributes).map(index => 
                                  wire()`${{
                                    id:index, 
                                    html: `<br />
                                           <label>${this.attributes.item(index).name}</label>:
                                           <input disabled value="${this.attributes.item(index).value}" />
                                           `}}
                                `)}

                        */
                        //console.log(root,'THEROOT')
                      }
                    }
                )
             }
/*
              class SubContainer extends Component {
        constructor(thing) {
          super().thing = thing;
        }

        render() {
          return this.html`<li>${this.thing.identifier}</li>`;

          

          <section id=${this.item.identifier}>
                            <details>
                            <summary onclick=${this}>
                            Type: <var>${query(this.item.identifier, refType)}</var><br />
                            Identifier:<var>${this.item.identifier}</var>
                            </summary>
                            </details>${this.item.type}: ${this.item.text} ${new Context(this.item.identifier, false)} </section>
                            
        }
      }

      class Container extends Component {
        constructor(identifier, children) {
          super();
          this.concepts = children.concepts;
          this.relations = children.relations;
          this.arcs      = children.arcs;
          this.identifier = identifier;      
     
        }
        render() {
          return this.html`
          <section id="${this.identifier}">
          <h2><a href=${'/?id='+this.identifier}>Link to ${this.identifier}</a></h2>
          <h3>Concepts:</h3>
          <ul>${ Object.keys(this.concepts)
                                    .filter(identifier => identifier !== '_')
                                    .map(c => SubContainer.for({identifier:c}, c)) }</ul>

          <h3>Relations:</h3>
          <ul>${ Object.keys(this.relations)
                                    .filter(identifier => identifier !== '_')
                                    .map(c => SubContainer.for({identifier:c}, c)) }</ul>

          <h3>Arcs:</h3>
          <ul>${ Object.keys(this.arcs)
                                    .filter(identifier => identifier !== '_')
                                    .map(c => SubContainer.for({identifier:c}, c)) }</ul>
          </section>`
        }
      }

      */