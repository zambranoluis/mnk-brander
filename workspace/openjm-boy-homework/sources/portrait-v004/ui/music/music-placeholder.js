// Native CSS musicBarPulse, musicScan and statusPulse sampled at composition time.
window.createFilmPlaceholder=function(root){
 const cubic=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
 const bezier=(x,a,b,c,d)=>{let lo=0,hi=1;for(let i=0;i<22;i++){const m=(lo+hi)/2;if(cubic(m,a,c)<x)lo=m;else hi=m;}return cubic((lo+hi)/2,b,d);};
 const ease=x=>bezier(x,.22,1,.36,1),cycle=(t,d)=>((t%d)+d)%d/d;
 return t=>{root.dataset.playing='true';[...root.querySelector('[data-pw=music-generation-bars]').children].forEach((e,i)=>{const f=cycle(t+i*.06,1.6),u=f<.5?ease(f*2):1-ease((f-.5)*2);e.style.transform=`scaleY(${.6+.48*u})`;});root.querySelector('[class*=__scan]').style.transform=`translateX(${-120+340*bezier(cycle(t,3.4),.42,0,.58,1)}%)`;const f=cycle(t,1.8),u=f<.5?ease(f*2):1-ease((f-.5)*2),dot=root.querySelector('[class*=__statusDot]');dot.style.opacity=.52+.48*u;dot.style.transform=`scale(${.78+.22*u})`;return {time:t,source:'native CSS keyframes',audioReactive:false};};
};
