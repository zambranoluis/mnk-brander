/* Native targets measured once in dashboard coordinates; pure composition time. */
window.FilmInteractions=(()=>{
 const schedule=JSON.parse(document.getElementById('film-interactions').textContent),events=schedule.events;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},mix=(a,b,u)=>a+(b-a)*u;
 let ready=false,pointer,anchors=[];
 const release=id=>events.find(e=>e.id===id).release;
 const target=e=>[...document.querySelectorAll(e.selector||'__none__')].find(n=>!e.text||n.textContent.trim()===e.text);
 function point(e){if(e.point)return {x:e.point[0],y:e.point[1]};const n=target(e);if(!n)throw Error('Missing cursor target '+e.id);const b=n.getBoundingClientRect(),c=document.getElementById('camera').getBoundingClientRect(),scale=c.width/1920;if(!b.width||!b.height)throw Error('Hidden cursor target '+e.id);return {x:(b.x-c.x+b.width*(e.anchor?.[0]??.5))/scale,y:(b.y-c.y+b.height*(e.anchor?.[1]??.5))/scale};}
 const shapes={arrow:'<path d="M1 1 L1 22 L6.8 17.8 L11.1 26.6 L15.4 24.5 L11.2 16 L19 15.5 Z"/>',hand:'<path d="M7 13V3Q7 0 10 1Q12 1 12 4V11Q15 8 17 12Q20 10 22 14Q26 13 26 18L25 25Q24 29 20 29H12Q10 29 8 26L2 18Q0 14 3 14Q5 14 7 17Z"/>',text:'<path d="M8 1H18M13 1V26M8 26H18" fill="none"/>'};
 function update(t){if(!ready)return;document.querySelectorAll('[data-film-hover],[data-film-press],[data-film-focus]').forEach(n=>{n.removeAttribute('data-film-hover');n.removeAttribute('data-film-press');n.removeAttribute('data-film-focus')});
  let p={x:schedule.origin[0],y:schedule.origin[1]},active=null,phase='idle',kind='arrow';
  for(let i=0;i<events.length;i++){const e=events[i];if(t<e.moveStart)break;if(t<e.release){const dest=anchors[i],u=ease((t-e.moveStart)/(e.hover-e.moveStart));p={x:mix(p.x,dest.x,u),y:mix(p.y,dest.y,u)};active=e;phase=t<e.hover?'move':t<e.press?'hover':'press';kind=t>=e.hover?(e.kind||'hand'):'arrow';const n=target(e);if(n&&t>=e.hover){n.setAttribute('data-film-hover','');if(t>=e.press)n.setAttribute('data-film-press','')}break;}p=anchors[i];active=e;phase='released';kind=e.kind||'arrow';}
  document.getElementById('cursor-camera').style.transform=document.getElementById('camera').style.transform;pointer.innerHTML=shapes[kind];pointer.style.transform=`translate(${p.x}px,${p.y}px)`;const opacity=schedule.fadeOut===undefined?1:1-ease((t-schedule.fadeOut)/.35);pointer.style.opacity=opacity;
  const focused=[...events].reverse().find(e=>e.focus&&t>=e.release);if(focused&&t<release('send'))target(focused)?.setAttribute('data-film-focus','');
  window.__cursorState={t,...p,opacity,active:active?.id,phase,kind,anchors};
 }
 function init(apply){pointer=document.createElementNS('http://www.w3.org/2000/svg','svg');pointer.id='film-pointer';pointer.setAttribute('viewBox','0 0 30 32');pointer.setAttribute('aria-hidden','true');const layer=document.createElement('div');layer.id='cursor-camera';layer.style.cssText='position:absolute;inset:0;z-index:40;pointer-events:none;transform-origin:0 0';document.getElementById('film').append(layer);layer.append(pointer);anchors=events.map(e=>{if(e.point)return point(e);apply((e.release-.0001)*25);return point(e)});ready=true;apply(0);}
 return {schedule,release,init,update};
})();
