// Compile retained native TS into a dependency-free browser bundle.
// npm install --no-save typescript@5.9.3 when rebuilding outside this workspace.
const fs=require('node:fs'),path=require('node:path');
const ts=require('typescript');
const base=path.join(__dirname,'native-source');
const files=[...fs.readdirSync(path.join(base,'morph/engine')).map(n=>'morph/engine/'+n),'morph/constants/chatMorphPreset.ts','morph/types/morph.ts','chat/utils/imagePlaceholderSorting.ts'];
let bundle='/* Retained OpenJM source. Compiled deterministically; see native-provenance.json. */\n(function(){const modules={},cache={};\n';
for(const name of files){const text=fs.readFileSync(path.join(base,name),'utf8');const js=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;bundle+=`modules[${JSON.stringify(name.replace(/\.ts$/,''))}]=function(require,exports){\n${js}\n};\n`;}
bundle+=`function load(id){if(cache[id])return cache[id];const exp=cache[id]={};if(!modules[id])throw Error('Missing native module '+id);modules[id](ref=>{let dest;if(ref.startsWith('@/features/'))dest=ref.slice(11);else{const parts=(id.slice(0,id.lastIndexOf('/')+1)+ref).split('/'),stack=[];for(const p of parts){if(p==='..')stack.pop();else if(p!=='.')stack.push(p)}dest=stack.join('/')}return load(dest)},exp);return exp;}
window.NativeMorph={...load('morph/engine/renderMorphFrame'),...load('morph/engine/orchestration'),...load('morph/engine/timeline'),...load('morph/engine/motion'),...load('morph/constants/chatMorphPreset')};window.NativeSorting=load('chat/utils/imagePlaceholderSorting');})();`;
fs.writeFileSync(path.join(__dirname,'native-engine.js'),bundle);
console.log('Compiled',files.length,'retained native modules with TypeScript',ts.version);
