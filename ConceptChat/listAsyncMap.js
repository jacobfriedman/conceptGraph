
/* function to return ack as a promise for puts
*/

Gun.chain.ackPut = async function (item) {
  var gun = this;
  return (new Promise((res, rej)=>{
    gun.put(item, function(ack) {
        if(ack.err){rej(ack.err)}
        res({ref:gun, ack:ack})
    })
  }))
}

/* Function that returns ack and promise for setTimeout */

Gun.chain.setAck = async function(item, opt){
	var gun = this, soul;
  var cb = cb || function(){};
	opt = opt || {}; opt.item = opt.item || item;
  return (new Promise(async function (res,rej) {
    if(soul = Gun.node.soul(item)){ item = Gun.obj.put({}, soul, Gun.val.link.ify(soul)) }
		if(!Gun.is(item)){
			if(Gun.obj.is(item)){;
				item = await gun.back(-1).get(soul = soul || Gun.node.soul(item) || gun.back('opt.uuid')()).ackPut(item);
        item = item.ref;
			}
			res(gun.get(soul || (Gun.state.lex() + Gun.text.random(7))).ackPut(item));
		}
		item.get(function(soul, o, msg){
			if(!soul){ rej({err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')})}
			gun.put(Gun.obj.put({}, soul, Gun.val.link.ify(soul)), cb, opt);
		},true);
		res(item);
  }))
}

/* Combined promise for once and map
   @param limit = integer defaults to 100 ms
   */
Gun.chain.then = async function (limit) {
 var gun = this, cat = gun._;
 if(!limit){limit = 100}
 if(cat.subs){
  var array = [];
  gun.map().once((data, key)=>{
   array.push(new Promise((res, rej)=>{
       res({data:data, key:key})
     })
   )
  })
  await sleep(limit); // if we do not sleep we return the promise before .once has fired once
  return Promise.all(array)
 } else {
   return (new Promise((res, rej)=>{
     gun.once(function (data, key) {
      res(data, key); //call resolve when data is returned
     })
   }))
 }

 var chain = gun.chain();
 return chain;
}

function sleep (time) {
 return (new Promise((res, rej)=>{
   setTimeout(res, time);
 }))
}
