/* Preserve original action timestamps, with touch focus/press feedback only. */
window.FilmInteractions=(()=>{
 const schedule=JSON.parse(document.getElementById('film-interactions').textContent);
 const release=id=>schedule.events.find(e=>e.id===id).release;
 function update(t){
  document.querySelectorAll('[data-film-hover],[data-film-press],[data-film-focus]').forEach(n=>{for(const a of ['data-film-hover','data-film-press','data-film-focus'])n.removeAttribute(a)});
  if(t>=release('composer')&&t<release('send'))document.getElementById('composer-shell')?.setAttribute('data-film-focus','');
  for(const e of schedule.events){if(!e.selector||t<e.press||t>=e.release)continue;const n=[...document.querySelectorAll(e.selector)].find(n=>!e.text||n.textContent.includes(e.text));n?.setAttribute('data-film-press','');}
 }
 return {schedule,release,update,init:()=>{}};
})();
