"""Render editable, frame-indexed camera paths with subpixel isotropic crops."""
from pathlib import Path
import argparse,json,subprocess
from PIL import Image
from camera import camera_box
ROOT=Path(__file__).resolve().parents[1]

def render(only=None):
 m=json.loads((ROOT/'assembly.json').read_text());paths=json.loads((ROOT/'camera-paths.json').read_text());report={}
 for slot in m['slots']:
  key=slot['id']
  if key not in paths['shots'] or (only and key!=only):continue
  cfg=paths['shots'][key];w,h=cfg['sourceSize'];count=slot['durationFrames']
  decoder=subprocess.Popen(['ffmpeg','-v','error','-threads','2','-i',str(ROOT/slot['source']),'-vf',f"fps={m['fps']}",'-frames:v',str(count),'-pix_fmt','rgb24','-f','rawvideo','-threads','2','-'],stdout=subprocess.PIPE)
  encoder=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f"{m['width']}x{m['height']}",'-r',str(m['fps']),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-threads','2','-color_range','tv','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-movflags','+faststart',str(ROOT/slot['media'])],stdin=subprocess.PIPE)
  boxes=[]
  try:
   for f in range(count):
    data=decoder.stdout.read(w*h*3)
    if len(data)!=w*h*3:raise RuntimeError(f'{key}: missing source frame {f}')
    box=camera_box(cfg,f,m['width']/m['height']);boxes.append(box)
    out=Image.frombytes('RGB',(w,h),data).resize((m['width'],m['height']),Image.Resampling.LANCZOS,box=tuple(box))
    encoder.stdin.write(out.tobytes())
  finally:
   decoder.stdout.close();encoder.stdin.close()
  assert decoder.wait()==0 and encoder.wait()==0
  report[key]={'frames':count,'boxes':boxes,'source':slot['source'],'media':slot['media']}
  print('Reframed',key,count,'frames',flush=True)
 existing=json.loads((ROOT/'reframing.json').read_text()) if (ROOT/'reframing.json').exists() else {}
 previous=existing.get('shots',{});previous.update(report)
 (ROOT/'reframing.json').write_text(json.dumps({'owner':'camera-paths.json','interpolation':'shape-preserving C1 cubic Hermite; zero endpoint velocity','shots':previous},indent=2))
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--only');render(a.parse_args().only)
