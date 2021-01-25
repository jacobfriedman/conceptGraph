const message = (async function() {
	const moduleOne = await import('./moduleOne.js');
	return moduleOne;
})();

export default message;
