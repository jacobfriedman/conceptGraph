import moduleFour from './moduleFour.js'

(async function() {
	console.log('moduleTwo context',)
})()

export async function moduleThree() {
	return moduleFour
}

export default async function moduleTwo() {
	console.log('hello from moduleTwo')

	const moduleFive = await import('./moduleFive.js');

	return moduleFive;

}