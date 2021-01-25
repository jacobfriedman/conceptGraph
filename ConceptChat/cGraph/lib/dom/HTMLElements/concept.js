let thing = window.customElements.get('thing-');

 customElements.define('concept-',  class extends thing {

 		constructor(...args) {
 			return super(...args)
 		}

 		render() {
 			return 'test'
 		}


 })