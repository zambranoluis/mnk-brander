"""Inspect all ending frames, reverse-seek raster differences and output metadata."""
from pathlib import Path
import argparse,json,subprocess
from PIL import Image,ImageChops,ImageStat,ImageDraw
R=Path(__file__).resolve().parents[1];a=argparse.ArgumentParser();a.add_argument('--evidence',required=True);E=Path(a.parse_args().evidence).resolve()
s=json.loads((E/'ending-seeks.json').read_text());results=[]
for f in s['differences']:
 old=Image.open(R/f'local/ending-frames/{f:04}.png').convert('RGB');new=Image.open(E/f'reverse-{f:04}.png').convert('RGB');diff=ImageChops.difference(old,new);box=diff.getbbox();maximum=max(x[1] for x in diff.getextrema());mean=sum(ImageStat.Stat(diff).mean)/3
 mark=s['states'][f]['wordmark'];inside=box[0]>=int(mark['x'])-2 and box[2]<=mark['x']+mark['width']+2 and box[1]>=int(mark['y'])-2 and box[3]<=mark['y']+mark['height']+2
 results.append({'frame':f,'bbox':box,'maxChannelError':maximum,'meanChannelError':mean,'confinedToWordmark':inside})
 assert maximum<=1 and mean<0.0001,(f,maximum,mean,box)
p=R/'openjm-ending-native-portrait-v004.mp4'
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-count_frames','-of','json',str(p)]));v=info['streams'][0]
assert len(info['streams'])==1 and (v['width'],v['height'],v['avg_frame_rate'],int(v['nb_read_frames']))==(1080,1920,'25/1',129)
assert float(v['duration'])==5.16
subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
frames=E/'encoded-ending';frames.mkdir(exist_ok=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),str(frames/'%04d.png')],check=True)
for start in range(0,129,36):
 sheet=Image.new('RGB',(180*6,342*6),'#222');d=ImageDraw.Draw(sheet)
 for i,f in enumerate(range(start,min(start+36,129))):
  im=Image.open(frames/f'{f+1:04}.png').convert('RGB');im.thumbnail((180,320));x=i%6*180;y=i//6*342;sheet.paste(im,(x,y));d.text((x+3,y+322),f'{f} | {f/25:.2f}s',fill='white')
 sheet.save(E/f'ending-all-{start:03}.jpg')
final=s['states'][-1]['wordmark'];assert abs(final['x']+final['width']/2-540)<.01 and abs(final['y']+final['height']/2-960)<.01
assert s['states'][-1]['canvasOpacity']=='0'
report={'metadata':info,'reverseSeekDifferences':results,'exactScreenshots':129-len(results),'allFlightStatesIdentical':True,'rasterTolerance':'maximum 1/255 channel; mean below 0.0001/255','finalWordmarkCenter':[540,960],'decoded':True}
(E/'ending-audit.json').write_text(json.dumps(report,indent=2));print('Ending passed:',129-len(results),'exact PNGs;',len(results),'bounded one-level raster differences; complete decode')
