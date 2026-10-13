/* Shared geometry adapter. All native scrolling is derived from frame time. */
window.portraitFrame=function(s){
 const $=id=>document.getElementById(id),kind=document.body.dataset.portrait,t=s.t??s.frame/25;
 if(!$('mobile-header')){const h=document.createElement('header');h.id='mobile-header';h.innerHTML='<button aria-label="Back"><svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg></button><button aria-label="Menu"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>';$('camera').append(h);}
 document.querySelectorAll('[data-content-layout]').forEach(n=>n.setAttribute('data-content-layout','compact'));
 const v=$('conversation-viewport'),shell=$('composer-shell'),smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
 if(kind==='text'){
  const expanded=!!s.typed;
  shell.classList.toggle('ChatWindowComposer-module__qNYLeW__inputShellHasContent',expanded);
  if(expanded){shell.style.height='107px';shell.style.minHeight='107px';shell.style.paddingTop='9px';shell.style.paddingBottom='18px';shell.style.borderRadius='32px';}
  else{shell.style.paddingTop='';shell.style.paddingBottom='';shell.style.borderRadius='';}
 }
 // The native app measures textarea scrollHeight after wrapping. Captured
 // desktop states held a 40px row, so reproduce that measurement at mobile width.
 const input=$('prompt'),row=input?.closest('[class*="__textareaRow"]');
 if(input&&row){
  row.style.height='40px';input.style.height='40px';input.style.maxHeight='none';
  const expanded=kind==='text'?(s.typed?1:0):s.expanded??(s.typed?1:0);
  const h=expanded?Math.max(40,input.scrollHeight):40;
  row.style.height=h+'px';input.style.height=h+'px';
  const controls=shell.querySelector('[data-pw="private-chat-composer-interactive"]');
  if(expanded){const metadata=s.metadata??(kind==='images'&&t>=7?22:0);controls.style.gridTemplateRows=`${h}px ${metadata}px ${24*expanded}px`;controls.style.rowGap='6px';controls.style.setProperty('--composer-control-row-offset','0px');shell.style.height=((kind==='text'?107:s.height)+h-40)+'px';shell.style.minHeight=shell.style.height;}
  else if(kind==='text'){controls.style.gridTemplateRows='';controls.style.rowGap='';controls.style.removeProperty('--composer-control-row-offset');}
 }
 if(window.portraitShell!==shell){window.portraitPortal?.remove();window.portraitShell=shell;const layer=shell.querySelector('[class*="ComposerActionSurfaces"][class*="__desktopLayer"]');if(layer){layer.classList.add('portrait-sheet-layer');document.body.append(layer);window.portraitPortal=layer;}}
 const sheet=window.portraitPortal?.querySelector('[class*="__windowBody"]');
 if(sheet){
  const duration=sheet.querySelector('input[type="number"]');
  const lyrics=sheet.querySelector('textarea');
  if(kind==='music'){
   if(lyrics)lyrics.value=t>=7.24?JSON.parse(document.getElementById('film-content').textContent).lyrics:'';
   if(duration){duration.value=t<8.28?'30':t<8.52?'1':'16';duration.style.backgroundImage=t>=8.04&&t<8.28?'linear-gradient(#284f74,#284f74)':'';duration.style.backgroundSize='14.016px 19.5px';duration.style.backgroundPosition='10.4px center';duration.style.backgroundRepeat='no-repeat';}
   const target=duration?duration.getBoundingClientRect().top-sheet.getBoundingClientRect().top+sheet.scrollTop-sheet.clientHeight+100:0;
   sheet.scrollTop=Math.max(0,target)*smooth((t-7.4)/.4);
  }else sheet.scrollTop=0;
 }
 const chatFrame=$('chat-frame')||document.querySelector('[class*="ChatWindowFrame"][class*="__root"]');
 chatFrame?.style.setProperty('--chat-top-overlay-height','100px');
 chatFrame?.style.setProperty('--chat-composer-overlay-height',(shell.getBoundingClientRect().height+40)+'px');
 const max=Math.max(0,v.scrollHeight-v.clientHeight);
 const topOf=n=>n?n.getBoundingClientRect().top-v.getBoundingClientRect().top+v.scrollTop-110:0;
 let scroll=0;
 if(kind==='text')scroll=Math.min(max,Math.max(0,topOf($('answer'))))*smooth((t-10)/3)+Math.max(0,max-Math.max(0,topOf($('answer'))))*smooth((t-15.8)/5);
 if(kind==='images'){const base=Math.max(0,topOf($('answer'))+Math.max(0,$('answer').offsetHeight-380));scroll=t<11?base:t<15?base+(max-base)*smooth((t-11)/.65):max;}
 if(kind==='music'){const board=$('board-result')||document.querySelector('[data-pw="image-result"]');const base=Math.max(0,topOf(board));scroll=t<10?base:t<14?base+(max-base)*smooth((t-10.52)/.65):max;}
 if(kind==='video'){scroll=t<9.12?Math.max(0,topOf($('music-card'))+35):max;}
 v.scrollTop=scroll;s.mobileScroll=v.scrollTop;v.dataset.canScrollUp=String(v.scrollTop>0);v.dataset.canScrollDown=String(v.scrollTop<max-1);
 if(kind==='video'){
  document.querySelectorAll('[class*="__generationIndicatorLabel"]').forEach(n=>{if(n.textContent.includes('Video')){n.textContent='Video · Portrait · 16 s · Silent';n.closest('button')?.setAttribute('aria-label','Video · Portrait · 16 s · Silent, Open Video settings');}});
  const btn=$('video-landscape');if(btn){btn.textContent='Portrait 9:16';btn.setAttribute('aria-checked',String(t>=7.08));}
  if(s.completed){
   const r=$('video-slot').getBoundingClientRect(),u=s.fullscreen,scale=r.height/640;
   const x=r.x+(r.width-360*scale)/2,displayScale=scale+(1-scale)*u,host=$('presentation-shell');
   host.style.transform=`translate(${x*(1-u)}px,${r.y*(1-u)}px) scale(${displayScale})`;
   // This overlay lives outside the clipped player. Convert the player's inner
   // corner radius to overlay coordinates, then remove it with fullscreen's
   // existing frame-derived easing. Recompute on every seek, in either direction.
   const player=$('video-player'),style=getComputedStyle(player);
   const playerScale=player.getBoundingClientRect().width/player.offsetWidth;
   const innerRadius=Math.max(0,parseFloat(style.borderTopLeftRadius)-parseFloat(style.borderTopWidth));
   const radius=innerRadius*playerScale*(1-u)/displayScale;
   host.style.clipPath=`inset(0 round ${radius}px ${radius}px 0 0)`;
   s.surface={x:x*(1-u),y:r.y*(1-u),scale:displayScale};
  }
 }
};
