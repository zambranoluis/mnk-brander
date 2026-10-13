const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
async function openProject(projectRoot){
const root=projectRoot||__dirname;
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);let filename=path.resolve(root,'.'+pathname);if(!filename.startsWith(root+path.sep))throw Error('Invalid path');const body=await fs.readFile(filename);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.mp4':'video/mp4'})[path.extname(filename)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--allow-file-access-from-files']});const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
return {page,browser,url:`http://127.0.0.1:${server.address().port}`,close:async()=>{await browser.close();await new Promise(r=>server.close(r));}};
}
module.exports={openProject};
