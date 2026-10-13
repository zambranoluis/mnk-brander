const fs=require('node:fs'),path=require('node:path');
const entry=path.join(__dirname,'index.html');
const script=fs.readFileSync(path.join(__dirname,'scene.js'),'utf8');
const content=JSON.parse(fs.readFileSync(path.join(__dirname,'content.json'),'utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const paragraphs=content.research.split(/\n\s*\n/).map(text=>escape(text)
  .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,'<a class="ChatResponseBubble-module__WuSOoa__responseBodyLink" href="$2" target="_blank" rel="noreferrer">$1</a>'));
let html=fs.readFileSync(entry,'utf8');
const body=/(<div[^>]*class="ChatResponseBubble-module__WuSOoa__responseBodyText"[^>]*>)[\s\S]*?(<\/div>)/;
if(!body.test(html))throw Error('Expected native response text owner missing');
html=html.replace(body,(_,open,close)=>open+paragraphs.map((p,i)=>`<p class="ChatResponseBubble-module__WuSOoa__responseMarkdownParagraph" id="answer-p${i}">${p}</p>`).join('\n')+close);
html=html.replace(/(<script type="application\/json" id="film-source">)([\s\S]*?)(<\/script>)/,(_,open,json,close)=>open+JSON.stringify({...JSON.parse(json),paragraphs,prompts:content.prompts})+close);
if(!html.includes('<script id="film-runtime">'))throw Error('Expected inline runtime owner missing');
html=html.replace(/<script id="film-runtime">[\s\S]*?<\/script>/,()=>'<script id="film-runtime">'+script+'</script>');
const interactions=JSON.parse(fs.readFileSync(path.join(__dirname,'interactions.json'),'utf8'));
html=html.replace(/(<script id="film-interactions"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(interactions)+b);
fs.writeFileSync(entry,html);
console.log('Synchronized content.json and scene.js into index.html.');
