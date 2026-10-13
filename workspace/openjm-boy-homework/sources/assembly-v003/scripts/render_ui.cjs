// Seek the retained editable scene at exact delivery frames; capture 2x pixels.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {spawn}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
async function render(name){
 const dir=path.join(ROOT,'ui',name),frames=name==='text'?570:508;
 const server=http.createServer((req,res)=>{try{const f=path.resolve(dir,'.'+new URL(req.url,'http://local').pathname);if(!f.startsWith(dir+path.sep))throw Error('path');res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,encoder;
 try{
  browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);await page.evaluate(()=>__filmReady);
  const finalOutput=path.join(ROOT,'assets',name==='text'?'stage-1-text.mp4':'stage-2-images.mp4');
  const output=finalOutput.replace('.mp4','.rendering.mp4');
  encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','25','-i','pipe:0','-vf','scale=1920:1080:flags=lanczos:out_color_matrix=bt709:out_range=tv,setsar=1','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-threads','2','-color_range','tv','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-an','-movflags','+faststart',output],{stdio:['pipe','inherit','inherit'],windowsHide:true});
  const finished=new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('close',code=>code===0?resolve():reject(Error('Encoder exit '+code)));});
  for(let frame=0;frame<frames;frame++){
   await page.evaluate(f=>{Object.values(__timelines)[0].time(f/25,false);applyFrame(f);},frame);
   const png=await page.screenshot({type:'png'});
   if(png.readUInt32BE(16)!==3840||png.readUInt32BE(20)!==2160)throw Error('Expected 2x source pixels');
   if(!encoder.stdin.write(png))await new Promise(r=>encoder.stdin.once('drain',r));
   if(frame%100===0)console.log(name,frame,'/',frames);
  }
  encoder.stdin.end();await finished;if(errors.length)throw Error(errors.join('\n'));
  fs.renameSync(output,finalOutput);
  console.log('Rendered',output,frames,'frames; 3840x2160 capture -> 1920x1080 Lanczos');
 }finally{await browser?.close();server.close();}
}
(async()=>{for(const name of process.argv[2]==='all'?['text','images']:[process.argv[2]]){if(!['text','images'].includes(name))throw Error('Choose text, images or all');await render(name);}})().catch(e=>{console.error(e);process.exitCode=1});
