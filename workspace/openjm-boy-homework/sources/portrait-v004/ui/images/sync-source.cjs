const fs=require('node:fs'),path=require('node:path');
const entry=path.join(__dirname,'index.html');let html=fs.readFileSync(entry,'utf8');
for(const [id,file]of [['film-content','content.json'],['film-timing','timing.json']]){const data=JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8'));html=html.replace(new RegExp('(<script id="'+id+'"[^>]*>)[\\s\\S]*?(</script>)'),(_,a,b)=>a+JSON.stringify(data).replaceAll('</','<\\/')+b);}
const content=JSON.parse(fs.readFileSync(path.join(__dirname,'content.json'),'utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const paragraphs=content.research.split(/\n\s*\n/).map(p=>escape(p).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,'<a class="ChatResponseBubble-module__WuSOoa__responseBodyLink" href="$2" target="_blank" rel="noreferrer">$1</a>'));
html=html.replace(/(<div[^>]*class="ChatResponseBubble-module__WuSOoa__responseBodyText"[^>]*>)[\s\S]*?(<\/div>)/,(_,a,b)=>a+paragraphs.map((p,i)=>`<p class="ChatResponseBubble-module__WuSOoa__responseMarkdownParagraph" id="answer-p${i}">${p}</p>`).join('\n')+b);
const script=fs.readFileSync(path.join(__dirname,'scene.js'),'utf8');
if(html.includes('<script id="film-runtime">'))html=html.replace(/<script id="film-runtime">[\s\S]*?<\/script>/,()=>'<script id="film-runtime">'+script+'</script>');
else html=html.replace('<script src="scene.js"></script>','<script id="film-runtime">'+script+'</script>');
const interactions=JSON.parse(fs.readFileSync(path.join(__dirname,'interactions.json'),'utf8'));
html=html.replace(/(<script id="film-interactions"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(interactions)+b);
fs.writeFileSync(entry,html);console.log('Synchronized editable copy, timing and runtime.');
