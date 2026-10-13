/* Film-only pointer. All pixels derive from the same seekable composition time.
   Geometry is measured after applyFrame lays out the native UI and camera.
   Release anchors are calibrated from pre-release DOM, never from seek history. */
window.FilmInteractions=(()=>{
 const schedule=JSON.parse(document.getElementById('film-interactions').textContent);
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},lerp=(a,b,u)=>a+(b-a)*u;
 const release=id=>schedule.events.find(e=>e.id===id).release;
 let ready=false,overlay,pointer,pulse,anchors=[];
 function target(e){return [...document.querySelectorAll(e.selector)].find(n=>!e.text||n.textContent.trim()===e.text||n.textContent.includes(e.text));}
 function point(e){
  if(e.point)return {x:e.point[0],y:e.point[1]};
  const node=target(e);if(!node)throw Error('Missing cursor target: '+e.id);
  const b=node.getBoundingClientRect(),root=document.getElementById('film').getBoundingClientRect();
  if(!b.width||!b.height)throw Error('Hidden cursor target: '+e.id);
  return {x:(b.x-root.x+b.width*(e.anchor?.[0]??.5))*1920/root.width,y:(b.y-root.y+b.height*(e.anchor?.[1]??.5))*1080/root.height};
 }
 function clearStates(){document.querySelectorAll('[data-film-hover],[data-film-press],[data-film-focus]').forEach(n=>{n.removeAttribute('data-film-hover');n.removeAttribute('data-film-press');n.removeAttribute('data-film-focus')});}
 function feedback(t){
  clearStates();
  if(t>=release('composer')&&t<release('send'))document.getElementById('composer-shell').setAttribute('data-film-focus','');
  for(const e of schedule.events){if(!e.selector||t<e.hover||t>=e.release)continue;const n=target(e);if(!n)throw Error('Active target missing: '+e.id);n.setAttribute('data-film-hover','');if(t>=e.press)n.setAttribute('data-film-press','');}
 }
 function update(t){
  if(!ready)return;
  feedback(t);
  let p={x:schedule.origin[0],y:schedule.origin[1]},active=null,phase='idle';
  for(let i=0;i<schedule.events.length;i++){
   const e=schedule.events[i];if(t<e.moveStart)break;
   if(t<e.release){const dest=point(e),u=ease((t-e.moveStart)/(e.hover-e.moveStart));p={x:lerp(p.x,dest.x,u),y:lerp(p.y,dest.y,u)};active=e;phase=t<e.hover?'move':t<e.press?'hover':'press';break;}
   p=anchors[i];active=e;phase='released';
  }
  const v=schedule.visibility,opacity=ease((t-v.show)/v.fadeIn)*(1-ease((t-v.fadeOutStart)/v.fadeOut));
  pointer.style.transform=`translate(${p.x}px,${p.y}px)`;
  overlay.style.opacity=opacity;
  let pulseState=null;
  for(let i=0;i<schedule.events.length;i++){
   const e=schedule.events[i];if(!e.selector||t<e.press||t>e.release+.24)continue;
   const u=clamp((t-e.press)/(e.release+.24-e.press)),a=t<e.release?point(e):anchors[i];
   pulseState={x:a.x,y:a.y,r:lerp(5,15,ease(u)),opacity:.32*(1-u)};
  }
  pulse.style.opacity=pulseState?.opacity??0;
  if(pulseState){pulse.setAttribute('cx',pulseState.x);pulse.setAttribute('cy',pulseState.y);pulse.setAttribute('r',pulseState.r);}
  const n=active?.selector&&phase!=='released'?target(active):null,b=n?.getBoundingClientRect();
  window.__cursorState={t,x:p.x,y:p.y,opacity,active:active?.id??null,phase,focus:t>=release('composer')&&t<release('send'),target:b?{x:b.x,y:b.y,width:b.width,height:b.height}:null,pulse:pulseState};
 }
 function init(apply){
  const root=document.getElementById('film');overlay=document.createElement('div');overlay.id='film-cursor-layer';overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<svg class="film-click-layer" viewBox="0 0 1920 1080"><circle id="film-click-pulse" fill="none" stroke="white" stroke-width="1.4"/></svg><svg id="film-pointer" width="22" height="28" viewBox="0 0 22 28"><path d="M1 1 L1 22 L6.8 17.8 L11.1 26.6 L15.4 24.5 L11.2 16 L19 15.5 Z" fill="white" stroke="#101716" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  root.append(overlay);pointer=overlay.querySelector('#film-pointer');pulse=overlay.querySelector('circle');
  anchors=schedule.events.map(e=>{if(e.point)return point(e);apply((e.release-.0001)*25);feedback(e.release-.0001);return point(e)});
  clearStates();ready=true;apply(0);
 }
 return {schedule,release,init,update};
})();
