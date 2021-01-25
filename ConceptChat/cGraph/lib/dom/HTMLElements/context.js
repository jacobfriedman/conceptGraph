let concept = window.customElements.get('concept-');

 customElements.define('context-',  class extends concept {

 		constructor(...args) {
 			return super(...args)
 		}

 		connectedCallback() { 
 			this.render();
 		}

		render() {
 			return 'test'
 		}

 })