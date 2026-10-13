const ui=JSON.parse(document.getElementById('film-source').textContent),content=JSON.parse(document.getElementById('film-content').textContent),T=JSON.parse(document.getElementById('film-timing').textContent),interaction=FilmInteractions;

const el=id=>document.getElementById(id),clamp=x=>Math.min(1,Math.max(0,x)),smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},mix=(a,b,t)=>a+(b-a)*t;

let drawMorph,drawPresentation,composerKey=null,openingScroll=1210,pendingScroll=0,completedScroll=0,slotPose=null;const surfaceFrames=[];

function frameState(frame){const t=Math.max(0,Math.min(31,frame/25)),key=t<2?'established':t<T.actionsOpen?'typing':t<T.toolSelect?'actions':t<T.confirm?'settings':t<T.submit?'configured':t<T.result?'pending':'completed',expanded=t<T.submit?smooth((t-2)/.3):1-smooth((t-T.submit)/.3),metadata=(t<T.submit?smooth((t-T.toolSelect)/.3):1-smooth((t-T.submit)/.3))*22;return {frame,t,key,typed:t<T.submit?content.prompts[3].slice(0,Math.floor(clamp((t-2)/4)*content.prompts[3].length)):'',expanded,metadata,height:51.1875+55.8125*expanded+metadata,pending:t>=T.submit&&t<13,completed:t>=13,playing:t>=15,presentationFrame:Math.min(399,Math.max(0,Math.floor((t-15)*25+1e-5))),fullscreen:smooth((t-T.fullscreen)/(16-T.fullscreen)),scroll:t<T.submit?openingScroll:t<13?mix(openingScroll,pendingScroll,smooth((t-T.scrollStart)/.65)):mix(pendingScroll,completedScroll,smooth((t-13)/.65)),camera:{s:.875,x:110,y:67}};}

function applyFrame(frame){const s=frameState(frame),c=s.camera;el('camera').style.transform=`translate(${c.x}px,${c.y}px) scale(${c.s})`;

 if(composerKey!==s.key){const temp=document.createElement('template');temp.innerHTML=ui.templates[s.key].shell;const next=temp.content.firstElementChild;next.id='composer-shell';el('composer-shell').replaceWith(next);el('chat-frame').setAttribute('style',ui.templates[s.key].frameStyle);composerKey=s.key;const indicator=next.querySelector('[class*=__generationIndicatorOpen]');if(indicator){const label=indicator.querySelector('[class*=__generationIndicatorLabel]');label.textContent='Video · Landscape · 16 s · Silent';indicator.setAttribute('aria-label','Video · Landscape · 16 s · Silent, Open Video settings');const icon=next.querySelector('#video-option [class*=__menuItemIcon]');if(icon)indicator.querySelector('[class*=__generationIndicatorIcon]').innerHTML=icon.innerHTML;}for(const option of next.querySelectorAll('[role=menuitemcheckbox]'))option.setAttribute('aria-checked',String(option.id==='video-option'&&s.t>=T.toolSelect));}

 const shell=el('composer-shell'),input=shell.querySelector('textarea[aria-label="Question"]');input.value=s.typed;input.id='prompt';input.disabled=false;for(const n of shell.querySelectorAll('*'))if(n.children.length===0&&/^\d+\/2000$/.test(n.textContent))n.textContent=s.typed.length+'/2000';shell.style.height=s.height+'px';shell.style.minHeight=s.height+'px';shell.style.paddingTop=mix(3.6,9,s.expanded)+'px';shell.style.paddingBottom=mix(3.6,18,s.expanded)+'px';shell.style.borderRadius=mix(22,32,s.expanded)+'px';const controls=shell.querySelector('[data-pw=private-chat-composer-interactive]');controls.style.gridTemplateRows=`40px ${s.metadata}px ${24*s.expanded}px`;controls.style.rowGap=6*s.expanded+'px';controls.style.minHeight=(30+36*s.expanded+s.metadata)+'px';controls.style.setProperty('--composer-control-row-offset',mix(-6.8,0,s.expanded)+'px');

 el('video-landscape')?.setAttribute('aria-checked',String(s.t>=T.landscape));el('video-silent')?.setAttribute('aria-checked',String(s.t>=T.silent));if(el('video-duration'))el('video-duration').value=s.t<T.durationType?'':s.t<T.durationTyped?'1':'16';

 el('video-turn').style.display=s.t>=T.submit?'':'none';el('video-pending').style.display=s.pending?'flex':'none';el('video-delivered').style.display=s.completed?'block':'none';el('video-pending').querySelector('.video-generation-track span').style.transform=`translateX(${(s.t%2)/2*280-100}%)`;

 el('conversation-viewport').style.clipPath=`inset(0 0 ${s.height+50}px 0)`;el('conversation-viewport').scrollTop=s.scroll;s.actualScroll=el('conversation-viewport').scrollTop;

 el('video-play').textContent=s.playing?'Ⅱ':'▶';el('video-play').setAttribute('aria-label',s.playing?'Pause':'Play');el('video-time').textContent=`0:${String(Math.floor(Math.max(0,s.t-15))).padStart(2,'0')} / 0:16`;document.querySelector('.video-progress i').style.width=clamp((s.t-15)/16)*100+'%';

 const host=el('presentation-shell');host.style.opacity=s.completed?1:0;drawPresentation(s.presentationFrame);

 if(s.completed){const a=(s.t>=T.fullscreen?slotPose:surfaceFrames[Math.floor(s.frame)])||slotPose||{x:522,y:345,s:.437};host.style.transform=`translate(${mix(a.x,0,s.fullscreen)}px,${mix(a.y,0,s.fullscreen)}px) scale(${mix(a.s,1,s.fullscreen)})`;s.presentation=drawPresentation(s.presentationFrame);s.surface={x:mix(a.x,0,s.fullscreen),y:mix(a.y,0,s.fullscreen),scale:mix(a.s,1,s.fullscreen)};}

 document.querySelector('.video-controls').style.opacity=1-s.fullscreen;el('camera').style.opacity=1-s.fullscreen;

 for(const root of [shell,el('conversation-viewport'),document.querySelector('[class*=__entryDisclaimer]')])if(root)for(const n of [root,...root.querySelectorAll('*')])if([...n.childNodes].some(c=>c.nodeType===3&&c.textContent.trim())){n.setAttribute('data-layout-allow-occlusion','');if(s.t>=T.actionsOpen&&s.t<T.confirm)n.setAttribute('data-layout-allow-overlap','');else n.removeAttribute('data-layout-allow-overlap');}

 if(drawMorph)s.morph=drawMorph(s.t+24);interaction.update(s.t);drawCaret(s);window.portraitFrame(s);window.__sceneState=s;return s;

}

const caretFrames=[];

function measureCaret(s){const field=s.t>=1.8&&s.t<T.actionsOpen?el('prompt'):s.t>=T.durationFocus&&s.t<T.silent?el('video-duration'):null;if(!field)return null;const r=field.getBoundingClientRect(),c=el('camera').getBoundingClientRect(),cs=getComputedStyle(field),ctx=document.createElement('canvas').getContext('2d');ctx.font=cs.font;const lines=field.value.split('\n');return {x:(r.x-c.x)/.875+parseFloat(cs.paddingLeft)+ctx.measureText(lines.at(-1)).width,y:(r.y-c.y)/.875+parseFloat(cs.paddingTop)+(lines.length-1)*(parseFloat(cs.lineHeight)||20),height:cs.fontSize};}

function drawCaret(s){let caret=el('film-caret');if(!caret){caret=document.createElement('span');caret.id='film-caret';el('camera').append(caret);}const a=caretFrames[Math.round(s.frame)];caret.style.display=a?'block':'none';if(!a)return;caret.style.left=a.x+'px';caret.style.top=a.y+'px';caret.style.height=a.height;caret.style.opacity=Math.floor(s.t*2)%2?'0':'1';}

window.frameState=frameState;window.applyFrame=applyFrame;

window.__filmReady=(async()=>{drawPresentation=createWaterCycle(el('presentation-surface'));const previous=el('music-card');previous.querySelector('[class*=__time]').children[0].textContent='0:03';previous.querySelector('[aria-label="Audio progress"]').value=3;previous.querySelectorAll('[class*=__playbackWave] span').forEach((e,i)=>e.style.background=i<9?'var(--color-action-mint)':'');await document.fonts.ready;await Promise.all([...document.images].map(e=>e.decode().catch(()=>{})));el('camera').style.transform='none';const canvas=el('morph-canvas'),viewport=canvas.parentElement.getBoundingClientRect(),anchor=el('morph-anchor').getBoundingClientRect();drawMorph=createFilmMorph(canvas,[{"at": 5.84, "mode": "music"}, {"at": 10, "mode": "working"}, {"at": 14, "mode": "standby"}, {"at": 20, "mode": "playing"}, {"at": 23, "mode": "standby"}, {"at": 30.52, "mode": "video"}, {"at": 33.12, "mode": "working"}, {"at": 37, "mode": "standby"}],{width:360,height:640,logicalWidth:anchor.width,logicalHeight:anchor.height,originX:anchor.x-viewport.x+anchor.width/2,originY:anchor.y-viewport.y+anchor.height/2},55);

 applyFrame(12*25);const v=el('conversation-viewport');pendingScroll=v.scrollHeight-v.clientHeight;applyFrame(14*25);completedScroll=v.scrollHeight-v.clientHeight;applyFrame(14*25);const r=el('video-slot').getBoundingClientRect(),f=el('film').getBoundingClientRect(),scale=f.width/1920;slotPose={x:(r.x-f.x)/scale,y:(r.y-f.y)/scale,s:r.width/scale/1920};for(let f=0;f<=775;f++){const state=applyFrame(f);caretFrames[f]=measureCaret(state);if(f>=325&&f<=400){const r=el('video-slot').getBoundingClientRect(),b=el('film').getBoundingClientRect();surfaceFrames[f]={x:r.x-b.x,y:r.y-b.y,s:r.width/1920};}}interaction.init(applyFrame);applyFrame(0);const clock={frame:0},tl=gsap.timeline({paused:true});tl.to(clock,{frame:775,duration:31,ease:'none',onUpdate:()=>applyFrame(clock.frame)},0);window.__timelines=window.__timelines||{};window.__timelines['openjm-video-v006']=tl;window.__hfForceTimelineRebind?.();})();

