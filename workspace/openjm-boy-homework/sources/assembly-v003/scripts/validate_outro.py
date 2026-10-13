"""Read-only technical gate. Framing and playback offset require visual evidence."""
from pathlib import Path
import argparse, hashlib, json, subprocess

def validate(file):
 p=Path(file).resolve()
 d=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(p)]))
 videos=[s for s in d['streams'] if s['codec_type']=='video']; v=videos[0] if len(videos)==1 else {}
 checks={
  'one_video':len(videos)==1,
  'h264':v.get('codec_name')=='h264',
  '1920x1080':(v.get('width'),v.get('height'))==(1920,1080),
  '25fps':v.get('r_frame_rate')=='25/1' and v.get('avg_frame_rate')=='25/1',
  '151_frames':v.get('nb_read_frames')=='151',
  '6.04_seconds':abs(float(v.get('duration',0))-6.04)<0.00001,
  'bt709':all(v.get(k)=='bt709' for k in ['color_space','color_transfer','color_primaries']),
  'limited_range_420':v.get('color_range')=='tv' and v.get('pix_fmt')=='yuv420p',
  'silent':not any(s['codec_type']=='audio' for s in d['streams']),
 }
 decode=subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(p),'-map','0:v:0','-f','null','-'],capture_output=True,text=True)
 checks['full_decode']=decode.returncode==0
 with p.open('rb') as f: digest=hashlib.file_digest(f,'sha256').hexdigest()
 return {'file':str(p),'sha256':digest,'technicalPass':all(checks.values()),'checks':checks,'decodeErrors':decode.stderr,'visualStatus':'unverified','requiredVisualChecks':['Same framing/action timing as sources/y-outro.mp4; no crop, reframing or retime.','Embedded presentation first frame corresponds to references/boy-final-presentation.mp4 at 3.00 seconds / frame 75; continuous 1x progression.','During the 16-frame overlap both pictures show presentation frames 75 through 90 in sync.','Laptop screen, bezel and foreground occlusions remain credible across all 151 frames.','No baked replacement label; ending overlap remains usable.'],'metadata':d}

if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('media');a.add_argument('--report',required=True);args=a.parse_args()
 r=validate(args.media);Path(args.report).write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
 print('Technical validation:',r['technicalPass'],'| Visual framing and presentation offset remain unverified.')
 raise SystemExit(0 if r['technicalPass'] else 1)
