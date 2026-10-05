const {test}=require('node:test'),assert=require('node:assert/strict');
test('spectators watch full rooms, cannot control, reconnect, follow maps and receive room closure',async()=>{
 const {server,rooms}=require('../server.cjs');await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,controllers=[];
 const api=async(action,data={})=>{const res=await fetch(base+'/api/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:res.status,body:await res.json()};};
 async function stream(session){const controller=new AbortController();controllers.push(controller);const res=await fetch(base+'/api/events?'+new URLSearchParams(session),{signal:controller.signal});assert.equal(res.status,200);return {reader:res.body.getReader(),controller,buffer:''};}
 async function readUntil(s,predicate){for(let i=0;i<60;i++){let separator;while((separator=s.buffer.indexOf('\n\n'))>=0){const event=s.buffer.slice(0,separator);s.buffer=s.buffer.slice(separator+2);if(event.startsWith('data: ')){const state=JSON.parse(event.slice(6));if(predicate(state))return state;}}const chunk=await s.reader.read();if(chunk.done)throw Error('Stream ended before expected snapshot');s.buffer+=new TextDecoder().decode(chunk.value);}throw Error('Snapshot not found');}
 try{
  assert.equal((await api('spectate',{code:'NOPE'})).status,404);
  const host=(await api('create',{name:'Dobby'})).body,sessions=[host];for(let i=1;i<8;i++)sessions.push((await api('join',{code:host.code,name:'Elf '+i})).body);
  for(const s of sessions)await stream(s);await api('start',host);
  const viewer=(await api('spectate',{code:host.code})).body;assert.equal(viewer.role,'spectator');let view=await stream(viewer),state=await readUntil(view,s=>s.spectatorCount===1);
  assert.equal(state.players.length,8);assert.equal(state.status,'playing');assert.ok(!JSON.stringify(state).includes(viewer.token));assert.equal(rooms.get(host.code).players.length,8);
  for(const action of ['input','start','retry','next','lobby'])assert.equal((await api(action,{...viewer,role:'player',right:true})).status,403);
  view.controller.abort();view=await stream(viewer);await readUntil(view,s=>s.spectatorCount===1);assert.equal(rooms.get(host.code).spectators.length,1);
  rooms.get(host.code).status='won';assert.equal((await api('next',host)).status,200);state=await readUntil(view,s=>s.status==='lobby');assert.equal(state.level,0);assert.equal((await api('start',{...host,level:6})).status,200);state=await readUntil(view,s=>s.level===6);assert.equal(state.status,'playing');assert.equal(state.players.length,8);
  assert.equal((await api('leave',viewer)).status,200);assert.equal(rooms.get(host.code).status,'playing');assert.equal(rooms.get(host.code).players.length,8);assert.equal(rooms.get(host.code).spectators.length,0);
  const finalViewer=(await api('spectate',{code:host.code})).body,finalStream=await stream(finalViewer);await readUntil(finalStream,s=>s.spectatorCount===1);
  for(const player of sessions)await api('leave',player);const ended=await readUntil(finalStream,s=>s.status==='ended');assert.equal(ended.players.length,0);assert.equal(rooms.has(host.code),false);
 }finally{controllers.forEach(c=>c.abort());server.closeAllConnections();await new Promise(resolve=>server.close(resolve));rooms.clear();}
});
