"""Pure frame lookup. No mutable tracker state; shared by rendering and audits."""
from bisect import bisect_right

def sample(knots,frame):
 xs=[p['frame'] for p in knots];ys=[p['centerX'] for p in knots]
 assert len(xs)>=2 and all(b>a for a,b in zip(xs,xs[1:]))
 hs=[b-a for a,b in zip(xs,xs[1:])];ds=[(b-a)/h for a,b,h in zip(ys,ys[1:],hs)]
 slopes=[0.0]
 for i in range(1,len(xs)-1):
  a,b=ds[i-1],ds[i];w1=2*hs[i]+hs[i-1];w2=hs[i]+2*hs[i-1]
  slopes.append(0.0 if a*b<=0 else (w1+w2)/(w1/a+w2/b))
 slopes.append(0.0)
 if frame<=xs[0]:return ys[0]
 if frame>=xs[-1]:return ys[-1]
 i=bisect_right(xs,frame)-1;h=hs[i];u=(frame-xs[i])/h
 return (2*u**3-3*u**2+1)*ys[i]+(u**3-2*u**2+u)*h*slopes[i]+(-2*u**3+3*u**2)*ys[i+1]+(u**3-u**2)*h*slopes[i+1]

def camera_box(cfg,frame,aspect=9/16):
 w,h=cfg['sourceSize'];cw=min(w,h*aspect);ch=cw/aspect
 cx=sample(cfg['knots'],frame)
 x=max(0.0,min(w-cw,cx-cw/2));y=(h-ch)/2
 return [x,y,x+cw,y+ch]
