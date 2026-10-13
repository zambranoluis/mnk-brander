/* Native particle engine + fixed-step adaptation of ChatMorphCanvas's mode bridge.
   All motion state is derived from composition seconds. No wall clock or RAF. */
window.createFilmMorph=function(canvas,events,metrics){
 const N=window.NativeMorph,presets=N.CHAT_MORPH_MODES,cache=new Map(),dt=1/120;
 const modes=Object.keys(presets);
 let active='standby',bridge=null,eventIndex=0;
 const motion=Object.fromEntries(modes.map(m=>[m,N.createMorphMotionState()]));
 const elapsed=Object.fromEntries(modes.map(m=>[m,0]));
 const resolve=(m,t)=>N.resolveTimelineFrame(presets[m].params,presets[m].timeline,t,presets[m].loop);
 const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x)};
 const visible=()=>bridge?{frame:N.createMorphBridgeFrame(bridge.fromFrame,bridge.toFrame,ease(bridge.elapsed/bridge.duration)),motion:N.interpolateMorphMotion(bridge.fromMotion,bridge.toMotion,ease(bridge.elapsed/bridge.duration)),sourceSnapshot:bridge.sourceSnapshot,targetSnapshot:bridge.targetSnapshot}:{frame:resolve(active,elapsed[active]),motion:motion[active]};
 function switchMode(next){
  if(next===active&&!bridge)return;
  const v=visible(),targetProgress=bridge?ease(bridge.elapsed/bridge.duration):N.getTimelineProgress(elapsed[active],presets[active].timeline,presets[active].loop);
  const targetElapsed=N.getElapsedFromProgress(presets[next].timeline,targetProgress),toFrame=resolve(next,targetElapsed);
  const sourceSnapshot=N.createMorphParticleSnapshot({params:v.frame.params,time:v.motion.visualTime,pointCache:cache,fromState:v.frame.fromState,toState:v.frame.toState,transitionProgress:v.frame.progress,sourceSnapshot:bridge?.sourceSnapshot});
  const targetSnapshot=N.createMorphBridgeTargetSnapshot({params:toFrame.params,time:motion[next].visualTime,pointCache:cache,fromState:toFrame.fromState,toState:toFrame.toState,transitionProgress:toFrame.progress,sourceSnapshot});
  bridge={fromFrame:v.frame,toFrame,fromMotion:{...v.motion},toMotion:{...motion[next]},sourceSnapshot,targetSnapshot,targetMode:next,targetElapsed,elapsed:0,duration:active==='working'||next==='working'?1.1:5/3};
 }
 function step(delta){
  if(bridge){bridge.elapsed+=delta;bridge.toMotion=N.advanceMorphMotion(bridge.toMotion,delta,bridge.toFrame.params);motion[bridge.targetMode]=bridge.toMotion;if(bridge.elapsed>=bridge.duration-1e-8){active=bridge.targetMode;elapsed[active]=bridge.targetElapsed;bridge=null;}}
  else{elapsed[active]+=delta;motion[active]=N.advanceMorphMotion(motion[active],delta,resolve(active,elapsed[active]).params);}
 }
 // Start in a continuing resting cycle after the intervening editorial shot.
 for(let i=0;i<25/dt;i++)step(dt);
 const samples=[];
 for(let i=0;i<=44/dt+1;i++){
  const t=i*dt;
  while(eventIndex<events.length&&t>=events[eventIndex].at-1e-8)switchMode(events[eventIndex++].mode);
  const v=visible();samples.push({...v,motion:{...v.motion},mode:bridge?.targetMode||active});step(dt);
 }
 const context=canvas.getContext('2d');canvas.width=metrics.width;canvas.height=metrics.height;
 return function draw(t){const i=Math.min(samples.length-1,Math.max(0,Math.round(t/dt))),s=samples[i],f=s.frame;
  context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,canvas.width,canvas.height);
  N.renderMorphFrame({context,width:metrics.width,height:metrics.height,params:f.params,time:s.motion.visualTime,pulse:s.motion.pulse,rotationX:s.motion.rotationX,rotationY:s.motion.rotationY,pointCache:cache,fromState:f.fromState,toState:f.toState,transitionProgress:f.progress,sourceSnapshot:s.sourceSnapshot,targetSnapshot:s.targetSnapshot,pointDensityScale:1,objectScale:1,pointScale:1,...metrics});
  canvas.parentElement.dataset.morphMode=s.mode;return {mode:s.mode,shape:f.params.shape,time:s.motion.visualTime};
 };
};
