/* One dashboard coordinate system. Native cards stay in their original scroll tree. */
const ui=JSON.parse(document.getElementById('film-source').textContent),content=JSON.parse(document.getElementById('film-content').textContent),T=JSON.parse(document.getElementById('film-timing').textContent);
const interaction=window.FilmInteractions;
for(const [key,id] of Object.entries({actionsOpen:'actions',imageSelect:'image',formatSelect:'format',confirm:'confirm',submit:'send'}))T[key]=interaction.release(id);
const el=id=>document.getElementById(id),clamp=x=>Math.min(1,Math.max(0,x)),smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},mix=(a,b,t)=>a+(b-a)*t;
let drawMorph,drawPlaceholder,composerKey=null;
function flagText(root,name,enabled=true){if(!root)return;for(const e of [root,...root.querySelectorAll('*')])if([...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())){if(enabled)e.setAttribute(name,'');else e.removeAttribute(name)}}
function pose(a,b,u){return {s:mix(a.scale,b.scale,u),x:mix(a.x,b.x,u),y:mix(a.y,b.y,u)}}
function frameState(frame){
 const t=Math.max(0,Math.min(T.duration,frame/T.fps));
 const key=t<T.typingStart?'established':t<T.actionsOpen?'typing':t<T.imageSelect?'actions':t<T.formatSelect?'settings':t<T.confirm?'settings-selected':t<T.submit?'configured':t<T.accept?'accepting':t<T.result?'pending':'completed';
 let camera=pose(T.framing.opening,T.framing.hold,smooth((t-T.resultSettled)/(T.boardHoldEnd-T.resultSettled)));if(t>=T.boardHoldEnd)camera=pose(T.framing.hold,T.framing.closing,smooth((t-T.boardHoldEnd)/1.5));
 const typed=t<T.submit?content.prompts[1].slice(0,Math.floor(clamp((t-T.typingStart)/(T.typingEnd-T.typingStart))*content.prompts[1].length)):'';
 const pending=t>=T.submit&&t<T.result,completed=t>=T.result;
 let height=51.1875;
 if(t>=T.typingStart&&t<T.imageSelect)height=mix(51.1875,107,smooth((t-T.typingStart)/.3));
 if(t>=T.imageSelect&&t<T.submit)height=mix(107,129,smooth((t-T.imageSelect)/.3));
 if(t>=T.submit&&t<T.submit+.3)height=mix(129,51.1875,smooth((t-T.submit)/.3));
 const scroll=pending?ui.pendingScroll*smooth((t-T.submit)/.65):completed?mix(ui.pendingScroll,ui.completedScroll,smooth((t-T.result)/.7)):0;
 return {frame,t,key,camera,typed,pending,completed,height,scroll,boardOpacity:completed?smooth((t-T.result)/.24):0,requestOpacity:smooth((t-T.submit)/.22),composerAvailable:true};
}
function applyFrame(frame){
 const s=frameState(frame),c=s.camera;el('camera').style.transform=`translate(${c.x}px,${c.y}px) scale(${c.s})`;
 if(composerKey!==s.key){const temp=document.createElement('template');temp.innerHTML=ui.templates[s.key].shell;const next=temp.content.firstElementChild;next.id='composer-shell';el('composer-shell').replaceWith(next);el('chat-frame').setAttribute('style',ui.templates[s.key].frameStyle);composerKey=s.key;}
 const shell=el('composer-shell'),input=shell.querySelector('textarea[aria-label="Question"]');input.value=s.typed;input.id='prompt';input.setAttribute('readonly','');input.disabled=!s.composerAvailable;shell.style.height=s.height+'px';shell.style.minHeight=s.height+'px';
 // Interpolate the native grid tracks and padding together with the shell.
 // Animating its height alone leaves expanded controls outside the compact boundary.
 const expanded=s.t<T.submit?smooth((s.t-T.typingStart)/.3):1-smooth((s.t-T.submit)/.3);
 const metadata=(s.t<T.submit?smooth((s.t-T.imageSelect)/.3):1-smooth((s.t-T.submit)/.3))*22;
 const controls=shell.querySelector('[data-pw=private-chat-composer-interactive]');
 shell.style.paddingTop=mix(3.6,9,expanded)+'px';shell.style.paddingBottom=mix(3.6,18,expanded)+'px';shell.style.borderRadius=mix(22,32,expanded)+'px';
 controls.style.gridTemplateRows=`40px ${metadata}px ${24*expanded}px`;controls.style.rowGap=6*expanded+'px';controls.style.minHeight=(30+36*expanded+metadata)+'px';controls.style.setProperty('--composer-control-row-offset',mix(-6.8,0,expanded)+'px');
 // The layout auditor treats the entire transparent particle canvas as opaque.
 // Exempt only the text beneath that native layer; geometry/clipping is tested independently.
 flagText(shell,'data-layout-allow-occlusion');
 flagText(el('answer'),'data-layout-allow-overlap',s.t>=T.imageSelect&&s.t<T.confirm);
 const disclaimer=document.querySelector('[class*=__entryDisclaimer]');flagText(disclaimer,'data-layout-allow-overlap',s.pending);
 el('image-turn').style.display=s.t>=T.submit?'':'none';el('result-turn').style.display=s.t>=T.submit?'':'none';el('image-question').style.opacity=s.requestOpacity;
 el('pending-result').style.display=s.pending?'':'none';el('board-result').style.display=s.completed?'':'none';el('board-result').style.opacity=s.boardOpacity;
 el('conversation-viewport').scrollTop=s.scroll;
 s.actualScroll=el('conversation-viewport').scrollTop;
 if(drawMorph)s.morph=drawMorph(s.t+T.ambientOffset);
 if(drawPlaceholder){const placeholder=drawPlaceholder(Math.max(0,Math.min(T.result-T.submit,s.t-T.submit)));if(s.pending)s.placeholder=placeholder;}
 interaction.update(s.t);
 window.portraitFrame(s);window.__sceneState=s;return s;
}
window.frameState=frameState;window.applyFrame=applyFrame;
window.__filmReady=(async()=>{
 await document.fonts.ready;await Promise.all([...document.images].map(e=>e.decode().catch(()=>{})));
 flagText(el('conversation-viewport'),'data-layout-allow-occlusion');flagText(document.querySelector('[class*=__entryDisclaimer]'),'data-layout-allow-occlusion');
 const preview=document.querySelector('div.ChatCard-module__coi--a__root.ChatCard-module__coi--a__rootActive > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1)');
 if(preview){preview.setAttribute('data-layout-allow-overlap','');preview.setAttribute('data-layout-allow-occlusion','');}
 el('camera').style.transform='none';
 const canvas=el('morph-canvas'),viewport=canvas.parentElement.getBoundingClientRect(),anchor=el('morph-anchor').getBoundingClientRect();
 const metrics={width:360,height:640,logicalWidth:anchor.width,logicalHeight:anchor.height,originX:anchor.x-viewport.x+anchor.width/2,originY:anchor.y-viewport.y+anchor.height/2};
 window.__morphMetrics=metrics;drawMorph=createFilmMorph(canvas,T.ambientEvents,metrics);
 drawPlaceholder=createFilmPlaceholder(el('pending-result').querySelector('[data-pw=image-generation-placeholder]'));
 interaction.init(applyFrame);
 applyFrame(0);
 const clock={frame:0},tl=gsap.timeline({paused:true});tl.to(clock,{frame:T.frames,duration:T.duration,ease:'none',onUpdate:()=>applyFrame(clock.frame)},0);
 for(const [key,time]of Object.entries(T))if(typeof time==='number'&&!['fps','duration','frames'].includes(key))tl.addLabel(key,time);
 window.__timelines=window.__timelines||{};window.__timelines['assembly-v002-images']=tl;window.__hfForceTimelineRebind?.();
})();
