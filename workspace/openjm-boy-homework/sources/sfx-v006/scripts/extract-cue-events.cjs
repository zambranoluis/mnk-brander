// Read the actual editable scene states and visible input values. No UI changes.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http');
const R=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(R,'assembly.json')));
const server=http.createServer((req,res)=>{try{const f=path.resolve(R,'.'+new URL(req.url,'http://local').pathname);if(!f.startsWith(R+path.sep))throw Error('path');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();const result={scenes:[]};try{
 const page=await browser.newPage({viewport:{width:360,height:640},deviceScaleFactor:3});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const name of ['text','images','music','video']){
  const slot=manifest.slots.find(s=>s.id===name);await page.goto(`http://127.0.0.1:${server.address().port}/ui/${name}/index.html`);await page.evaluate(()=>window.__filmReady);
  const states=await page.evaluate(count=>{const rows=[];for(let f=0;f<count;f++){window.applyFrame(f);const s=window.frameState(f);const fields=[...document.querySelectorAll('textarea,input[type=number]')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(n).visibility!=='hidden'}).map(n=>({id:n.id||n.getAttribute('aria-label')||n.tagName,value:n.value}));rows.push({frame:f,typed:s.typed,completed:!!s.completed,words:s.words,fields,boardOpacity:s.boardOpacity});}return rows},slot.durationFrames);
  const schedule=JSON.parse(fs.readFileSync(path.join(R,'ui',name,'interactions.json')));result.scenes.push({name,startFrame:slot.startFrame,states,events:schedule.events});
 }if(errors.length)throw Error(JSON.stringify(errors));fs.writeFileSync(path.join(R,'sources/ui-cue-states.json'),JSON.stringify(result,null,2)+'\n');console.log('Extracted',result.scenes.map(s=>[s.name,s.states.length]));
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exit(1)});
