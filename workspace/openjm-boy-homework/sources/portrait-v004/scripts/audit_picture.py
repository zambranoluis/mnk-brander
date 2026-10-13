"""Compare every encoded frame with manifest-owned source pictures/blends."""
from pathlib import Path
import json,subprocess,argparse
from PIL import Image,ImageChops,ImageStat,ImageDraw
R=Path(__file__).resolve().parents[1];a=argparse.ArgumentParser();a.add_argument('--evidence',required=True);E=Path(a.parse_args().evidence).resolve();E.mkdir(exist_ok=True,parents=True)
m=json.loads((R/'assembly.json').read_text());W,H=180,320;N=W*H*3
def decode(p):
 data=subprocess.check_output(['ffmpeg','-v','error','-threads','2','-i',str(p),'-vf',f'scale={W}:{H}:flags=area','-pix_fmt','rgb24','-f','rawvideo','-threads','2','-'])
 return [Image.frombytes('RGB',(W,H),data[i:i+N]) for i in range(0,len(data),N)]
sources={s['id']:decode(R/s['media']) for s in m['slots']};final=decode(R/'openjm-assembly-v003-audio-v002-portrait-v004.mp4');assert len(final)==2748
results=[];transitionFrames=[];incoming={t['incomingSlot']:t for t in m['transitions']}
for f,actual in enumerate(final):
 active=[s for s in m['slots'] if s['startFrame']<=f<s['startFrame']+s['durationFrames']]
 s=active[-1];expected=sources[s['id']][f-s['startFrame']]
 if len(active)==2:
  old=active[0];t=incoming[s['id']];u=(f-t['startFrame'])/t['durationFrames'];expected=Image.blend(sources[old['id']][f-old['startFrame']],expected,u);transitionFrames.append(f)
 mean=sum(ImageStat.Stat(ImageChops.difference(actual,expected)).mean)/3
 results.append({'frame':f,'meanError255':mean,'slots':[v['id'] for v in active]})
 assert mean<2.5,(f,mean)
for t in m['transitions']:
 fs=list(range(t['startFrame']-2,t['startFrame']+max(1,t['durationFrames'])+2));c=Image.new('RGB',(W*6,(H+22)*((len(fs)+5)//6)),'#181818');d=ImageDraw.Draw(c)
 for i,f in enumerate(fs):
  x=i%6*W;y=i//6*(H+22);c.paste(final[f],(x,y));d.text((x+3,y+H+3),f'frame {f} | {f/25:.2f}s',fill='white')
 c.save(E/f'transition-{t["outgoingSlot"]}-{t["incomingSlot"]}.jpg')
report={'frames':len(final),'everyFrameWithinEncodingTolerance':True,'maxMeanError255':max(x['meanError255'] for x in results),'transitionFrames':transitionFrames,'results':results}
(E/'picture-audit.json').write_text(json.dumps(report,indent=2));print('Verified',len(final),'frames;',len(transitionFrames),'dissolve frames; worst mean',report['maxMeanError255'])
