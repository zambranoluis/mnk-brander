/* Native backdrop/DOM and sorting algorithms, with seeded ordering and a seekable clock. */
window.createFilmPlaceholder=function(root){
 const N=NativeSorting,stripsRoot=root.querySelector('[class*=__strips]'),strips=[...stripsRoot.children],count=strips.length;
 const width=stripsRoot.clientWidth/count,height=stripsRoot.clientHeight,range=root.querySelector('[class*=__range]'),veil=root.querySelector('[class*=__veil]'),stage=root.querySelector('[class*=__stage][data-phase]');
 let seed=0x40710;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const positions=order=>{const p=[];order.forEach((key,i)=>p[key]=i);return p};
 const records=[];let time=0,order=Array.from({length:count},(_,i)=>i),marks={},phase='scrambling',veilActive=true,rangeState=null;
 const add=(duration,nextOrder=order,move=duration)=>{records.push({start:time,end:time+duration,from:positions(order),to:positions(nextOrder),move,phase,marks:{...marks},veilActive,rangeState});time+=duration;order=[...nextOrder]};
 for(const algorithm of ['bubble','merge','quick']){
  phase='scrambling';marks={};veilActive=true;rangeState=null;add(.6,N.shuffleOrder(count,random),.56);veilActive=false;add(.11);phase='sorting';
  const timing={bubble:{compare:.01,move:.042},merge:{compare:.016,move:.19},quick:{compare:.024,move:.074}}[algorithm];
  for(const step of N.sortingSteps(algorithm,order)){
   if(step.kind==='compare'||step.kind==='pivot'){marks={};marks[order[step.left??step.index]]='compare';marks[order[step.right??step.pivot]]=step.kind==='pivot'?'pivot':'compare';add(timing.compare)}
   else if(step.kind==='range')rangeState={left:step.left,right:step.right};
   else if(step.kind==='swap'||step.kind==='reorder'){const next=[...order];N.applySortingStep(next,step);add(timing.move+.008,next,timing.move)}
   else if(step.kind==='settled')delete marks[order[step.index]];
  }
  marks={};rangeState=null;phase='complete';add(.86);
 }
 const cubic=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
 const ease=t=>{if(t<=0)return 0;if(t>=1)return 1;let lo=0,hi=1;for(let i=0;i<20;i++){const mid=(lo+hi)/2;if(cubic(mid,.22,.36)<t)lo=mid;else hi=mid}return cubic((lo+hi)/2,1,1)};
 return function draw(t){t=Math.max(0,t)%time;const r=records.find(r=>t<r.end)||records.at(-1),u=ease((t-r.start)/r.move);
  root.dataset.phase=r.phase;stage.dataset.phase=r.phase;veil.dataset.active=String(r.veilActive);
  strips.forEach((e,key)=>{e.style.width=`${width+.45}px`;e.style.backgroundSize=`${width*count}px ${height}px`;e.style.backgroundPosition=`${-key*width}px 0px`;e.style.transform=`translate3d(${(r.from[key]+(r.to[key]-r.from[key])*u)*width}px,0,0)`;if(r.marks[key])e.dataset.mark=r.marks[key];else delete e.dataset.mark});
  range.dataset.active=String(!!r.rangeState);if(r.rangeState){range.style.left=r.rangeState.left*width+'px';range.style.width=(r.rangeState.right-r.rangeState.left+1)*width+'px'}
  return {phase:r.phase,order:r.to,seed:0x40710};
 };
};
