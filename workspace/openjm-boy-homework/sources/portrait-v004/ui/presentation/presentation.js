/* Reused by the in-dashboard surface and standalone export. Editable labels,
   separate SVG process layers, integer frame identity 0..399. */
window.createWaterCycle=function(root,assetBase='artwork/'){
 const names=['evaporation','condensation','precipitation','collection'],labels=['Evaporation','Condensation','Precipitation','Collection'];
 root.classList.add('water-cycle');root.innerHTML=names.map((name,i)=>`<section class="water-process" data-process="${name}"><img src="${assetBase+name}.png" alt=""><svg class="process-animation" viewBox="0 0 1920 1080" aria-hidden="true"></svg><div class="process-label"><span>${String(i+1).padStart(2,'0')}</span><h1>${labels[i]}</h1></div></section>`).join('');
 const scenes=[...root.children],ns='http://www.w3.org/2000/svg';
 function svg(i,tag,attrs){const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);scenes[i].querySelector('svg').append(n);return n;}
 const warm=svg(0,'circle',{cx:198,cy:135,r:82,fill:'#ffe699',opacity:.2});
 const paths=[svg(0,'path',{d:'M640 785 C600 670 614 545 648 460',fill:'none',stroke:'#baffed','stroke-width':9,'stroke-linecap':'round'}),svg(1,'path',{d:'M520 405 Q600 330 695 305',fill:'none',stroke:'#baffed','stroke-width':7,'stroke-linecap':'round'}),svg(2,'path',{d:'M1510 365 Q1480 515 1395 650',fill:'none',stroke:'#baffed','stroke-width':9,'stroke-linecap':'round'}),svg(3,'path',{d:'M1650 330 C1600 400 1615 460 1500 489 S1550 561 1420 600 S1470 682 1290 730 S1180 811 935 843',fill:'none',stroke:'#baffed','stroke-width':9,'stroke-linecap':'round'})];
 const lengths=paths.map(p=>p.getTotalLength());paths.forEach((p,i)=>p.style.strokeDasharray=lengths[i]);
 const heads=paths.map((p,i)=>svg(i,'path',{d:'M-18 15 L0 0 L18 15',fill:'none',stroke:'#baffed','stroke-width':9,'stroke-linecap':'round','stroke-linejoin':'round'}));
 const droplets=Array.from({length:72},(_,i)=>svg(1,'circle',{r:2+(i%3)*.5,fill:'#f5ffff'}));
 const rain=Array.from({length:62},(_,i)=>svg(2,'line',{stroke:'#e5fbff','stroke-width':1.5+(i%2),opacity:.65}));
 const back=svg(3,'path',{d:'M930 840 C725 880 590 793 613 670 C624 588 630 520 648 460',fill:'none',stroke:'#baffed','stroke-width':7,'stroke-linecap':'round','stroke-dasharray':'12 14'});
 const loopHead=svg(3,'path',{d:'M629 480 L648 460 L658 488',fill:'none',stroke:'#baffed','stroke-width':7,'stroke-linecap':'round'});
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 return frame=>{frame=Math.max(0,Math.min(399,Math.floor(frame+1e-5)));const index=Math.floor(frame/100),local=frame%100,u=local/99,t=frame/25;
  scenes.forEach((s,i)=>s.style.opacity=i===index?'1':'0');root.dataset.frame=frame;root.dataset.process=names[index];
  warm.setAttribute('r',82+18*Math.sin(u*Math.PI));warm.setAttribute('opacity',.13+.1*Math.sin(u*Math.PI));
  paths.forEach((p,i)=>{const progress=ease(u/.8),len=lengths[i]*progress;p.style.strokeDashoffset=lengths[i]-len;const at=p.getPointAtLength(len),before=p.getPointAtLength(Math.max(0,len-2)),angle=Math.atan2(at.y-before.y,at.x-before.x)*180/Math.PI+90;heads[i].setAttribute('transform',`translate(${at.x} ${at.y}) rotate(${angle})`);heads[i].style.opacity=progress>.02?1:0;});
  droplets.forEach((d,i)=>{const phase=(u+(i*.137)%1)%1,a=phase*phase,fromX=470+(i*97)%650,fromY=230+(i*59)%170,toX=655+(i*53)%430,toY=140+(i*31)%100;d.setAttribute('cx',fromX+(toX-fromX)*a);d.setAttribute('cy',fromY+(toY-fromY)*a);d.setAttribute('opacity',Math.sin(phase*Math.PI)*.8);});
  rain.forEach((d,i)=>{const p=(u*2+(i*.163)%1)%1,x=1100+(i*47)%650-p*60,y=210+p*390;d.setAttribute('x1',x);d.setAttribute('y1',y);d.setAttribute('x2',x-5);d.setAttribute('y2',y+19);d.style.opacity=Math.sin(p*Math.PI)*.75;});
  back.style.opacity=ease((u-.56)/.35);back.style.strokeDashoffset=-local*1.7;loopHead.style.opacity=ease((u-.78)/.18);
  return {frame,index,localFrame:local,process:names[index],time:t};
 };
};
