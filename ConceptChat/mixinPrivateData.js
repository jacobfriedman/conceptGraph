/*
Allowing 2 users to collaborate on the same path.
This makes it write only for each user, but in a UI using below function you
can now see whatever was added latest collaboration
*/

async function getLatest (path,pubkeyOther) {
  var path = path;
  var refMe = gun.user();
  var refBob = gun.user(pubkeyOther);
  console.log('me', refMe);
  console.log('bob', refBob);
  while(path.length>0){
    var step = path.shift();
    refMe = refMe.get(step);
    refBob = refBob.get(step);
  }
  var me = await refMe.promOnce();
  console.log('me', me.data);
  var bob = await refBob.promOnce();
  console.log('bob', bob.data);
  return Gun.state.node(me.data, bob.data);
}
