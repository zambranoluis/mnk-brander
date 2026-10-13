const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'ending');
const arg=name=>{const n=process.argv.indexOf(name);return n<0?null:process.argv[n+1]};
const evidence=path.resolve(arg('--evidence')||path.join(root,'local/ending-check'));
const frames=path.join(root,'local/ending-frames');fs.mkdirSync(frames,{recursive:true});fs.mkdirSync(evidence,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.glb':'model/gltf-binary'};
const server=http.createServer((req,res)=>{const p=path.resolve(dir,'.'+decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(dir+path.sep)&&p!==dir){res.writeHead(403);res.end();return}const f=p===dir?path.join(dir,'index.html'):p;if(!fs.existsSync(f)){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res)});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1}),errors=[],external=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+': '+r.status())});
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'))external.push(r.url())});
 await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>window.loaderReady,{},{timeout:60000});
 const diagnostics=await page.evaluate(()=>window.loaderDiagnostics),hashes=[],states=[];
 assert.equal(diagnostics.outputFrames,129);assert.equal(diagnostics.fadeStart,244/60);assert.deepEqual(diagnostics.hoverStates,['hovering']);
 for(let f=0;f<129;f++){
  states.push(await page.evaluate(t=>{const s=window.loaderRenderAt(t),r=document.querySelector('#wordmark').getBoundingClientRect();return {...s,wordmark:{x:r.x,y:r.y,width:r.width,height:r.height},canvasOpacity:getComputedStyle(document.querySelector('#bird')).opacity}},f/25));
  const b=await page.screenshot({animations:'allow'});hashes.push(sha(b));fs.writeFileSync(path.join(frames,`${String(f).padStart(4,'0')}.png`),b);
 }
 const differences=[];
 if(!process.argv.includes('--skip-seek'))for(let f=128;f>=0;f--){const state=await page.evaluate(t=>window.loaderRenderAt(t),f/25);assert.deepEqual(state.frame,states[f].frame);assert.equal(state.index,states[f].index);const b=await page.screenshot({animations:'allow'});if(sha(b)!==hashes[f]){differences.push(f);fs.writeFileSync(path.join(evidence,`reverse-${String(f).padStart(4,'0')}.png`),b)}}
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(evidence,'ending-seeks.json'),JSON.stringify({diagnostics,forwardFrames:129,reverseFrames:process.argv.includes('--skip-seek')?0:129,pixelIdentical:differences.length===0,differences,errors,external,hashes,states},null,2));
 const out=path.join(root,'assets/z-animation-end.mp4');const ff=spawnSync('ffmpeg',['-v','error','-y','-framerate','25','-i',path.join(frames,'%04d.png'),'-frames:v','129','-an','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-threads','2','-color_range','tv','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-movflags','+faststart',out],{stdio:'inherit'});assert.equal(ff.status,0);
 fs.copyFileSync(out,path.join(root,'openjm-ending-native-portrait-v004.mp4'));
 console.log(JSON.stringify({diagnostics,frames:129,reverseSeeks:!process.argv.includes('--skip-seek'),output:out}));
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
