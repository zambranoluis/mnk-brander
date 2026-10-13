"""Inspect every camera frame and prove crop bounds, C1 motion and reverse seeks."""
from pathlib import Path
import argparse,json,subprocess,hashlib
from PIL import Image,ImageDraw
from camera import camera_box,sample
R=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--evidence',required=True);args=a.parse_args();E=Path(args.evidence).resolve();E.mkdir(parents=True,exist_ok=True)
m=json.loads((R/'assembly.json').read_text());paths=json.loads((R/'camera-paths.json').read_text());result={}
for s in m['slots']:
 if s['id'] not in paths['shots']:continue
 cfg=paths['shots'][s['id']];n=s['durationFrames'];boxes=[camera_box(cfg,f) for f in range(n)]
 assert boxes==[camera_box(cfg,f) for f in reversed(range(n))][::-1]
 for box in boxes:
  l,t,r,b=box;assert 0<=l<r<=1920 and 0<=t<b<=1080
  assert abs((r-l)/(b-t)-9/16)<1e-12 and b-t==1080
 # Sample both derivatives at each knot; numeric tolerance in source px/frame.
 eps=1e-4;derivatives=[]
 for knot in cfg['knots'][1:-1]:
  f=knot['frame'];left=(sample(cfg['knots'],f)-sample(cfg['knots'],f-eps))/eps;right=(sample(cfg['knots'],f+eps)-sample(cfg['knots'],f))/eps
  assert abs(left-right)<.005,(s['id'],f,left,right)
  derivatives.append({'frame':f,'left':left,'right':right})
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(R/s['media']),'-vf','scale=180:320:flags=area','-f','rawvideo','-pix_fmt','rgb24','-'])
 size=180*320*3;frames=[Image.frombytes('RGB',(180,320),raw[i:i+size]) for i in range(0,len(raw),size)];assert len(frames)==n
 for page,start in enumerate(range(0,n,48)):
  chunk=frames[start:start+48];sheet=Image.new('RGB',(180*8,342*((len(chunk)+7)//8)),'#181818');d=ImageDraw.Draw(sheet)
  for j,im in enumerate(chunk):
   x=j%8*180;y=j//8*342;sheet.paste(im,(x,y));d.text((x+4,y+322),f'f{start+j} | {(start+j)/25:.2f}s',fill='white')
  sheet.save(E/f"all-{s['id']}-{page+1}.jpg")
 picks=list(range(0,n,10));picks.append(n-1);sheet=Image.new('RGB',(270*7,504*((len(picks)+6)//7)),'#181818');d=ImageDraw.Draw(sheet)
 for j,f in enumerate(picks):
  x=j%7*270;y=j//7*504;sheet.paste(frames[f].resize((270,480)),(x,y));d.text((x+4,y+482),f'{s["id"]} f{f} / {f/25:.2f}s',fill='white')
 sheet.save(E/f"overview-{s['id']}.jpg")
 result[s['id']]={'frames':n,'fullCoverage':True,'noExtraZoom':True,'reverseLookupIdentical':True,'C1Derivatives':derivatives,'maxSourcePixelsPerFrame':max(abs(boxes[i+1][0]-boxes[i][0]) for i in range(n-1))}
(E/'camera-audit.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
