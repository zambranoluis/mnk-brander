"""Render the shared transition manifest in bounded-memory, frame-counted parts."""
from pathlib import Path
import argparse,json,subprocess,tempfile
ROOT=Path(__file__).resolve().parents[1]
def run(cmd,log):
 with log.open('w',encoding='utf8') as f:subprocess.run(cmd,stdout=f,stderr=f,check=True)
def render(output,work):
 m=json.loads((ROOT/'assembly.json').read_text(encoding='utf8'));fps=m['fps'];slots=m['slots'];joins=m['transitions']
 work.mkdir(parents=True,exist_ok=True);output.parent.mkdir(parents=True,exist_ok=True)
 common=['-c:v','libx264','-preset','fast','-crf','16','-profile:v','high','-level:v','4.1','-pix_fmt','yuv420p','-threads','2','-r',str(fps),'-video_track_timescale','12800','-color_range','tv','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-an','-movflags','+faststart']
 base=['ffmpeg','-hide_banner','-loglevel','warning','-nostdin','-y']
 incoming={t['incomingSlot']:t for t in joins};outgoing={t['outgoingSlot']:t for t in joins};media={s['id']:ROOT/s['media'] for s in slots};parts=[]
 # Bake only the requested label onto its shot BEFORE either dissolve.
 if m['outroContract']['status']=='pending' and m['outroContract'].get('showPlaceholderLabel', True):
  assert m['outroContract']['label']=='OUTRO PLACEHOLDER — screen composite pending.'
  labelled=work/'labelled-outro.mp4'
  run(base+['-threads','2','-i',str(media['outro-composite']),'-loop','1','-framerate',str(fps),'-i',str(ROOT/'assets/outro-placeholder-label.png'),'-filter_complex_threads','1','-filter_complex','[0:v][1:v]overlay=0:0:format=yuv420:shortest=1[v]','-map','[v]','-frames:v','151']+common+[str(labelled)],work/'label.log')
  media['outro-composite']=labelled
 total=0
 for index,s in enumerate(slots):
  lead=incoming.get(s['id'],{}).get('durationFrames',0);tail=outgoing.get(s['id'],{}).get('durationFrames',0)
  count=s['durationFrames']-lead-tail;start=s['sourceInFrame']+lead
  part=work/f'{index:02d}-body.mp4';parts.append(part)
  run(base+['-threads','2','-i',str(media[s['id']]),'-map','0:v:0','-vf',f'trim=start_frame={start}:end_frame={start+count},setpts=PTS-STARTPTS,setsar=1','-frames:v',str(count)]+common+[str(part)],work/f'{index:02d}-body.log');total+=count
  if tail:
   t=outgoing[s['id']];n=slots[index+1];part=work/f'{index:02d}-dissolve.mp4';parts.append(part)
   a=s['sourceInFrame']+s['durationFrames']-tail;b=n['sourceInFrame']
   filters=f'[0:v]trim=start_frame={a}:end_frame={a+tail},setpts=PTS-STARTPTS,setsar=1[a];[1:v]trim=start_frame={b}:end_frame={b+tail},setpts=PTS-STARTPTS,setsar=1[b];[a][b]blend=all_expr=\'A*(1-(N-1)/{tail})+B*((N-1)/{tail})\':shortest=1[v]'
   run(base+['-threads','2','-i',str(media[s['id']]),'-threads','2','-i',str(media[n['id']]),'-filter_complex_threads','1','-filter_complex',filters,'-map','[v]','-frames:v',str(tail)]+common+[str(part)],work/f'{index:02d}-dissolve.log');total+=tail
  print('Encoded',s['id'],'body',count,'outgoing overlap',tail,flush=True)
 assert total==m['totalFrames']
 concat=work/'concat.txt';concat.write_text(''.join("file '"+p.name+"'\n" for p in parts),encoding='utf8')
 run(base+['-f','concat','-safe','0','-i',str(concat),'-map','0:v:0','-c:v','copy','-an','-movflags','+faststart',str(output)],work/'concat.log')
 print('Rendered',output,total,'frames',flush=True)
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--output',default=str(ROOT/'renders/openjm-assembly-v003-provisional-final.mp4'));a.add_argument('--work-dir');args=a.parse_args()
 if args.work_dir:render(Path(args.output).resolve(),Path(args.work_dir).resolve())
 else:
  with tempfile.TemporaryDirectory(prefix='openjm-assembly-v003-') as t:render(Path(args.output).resolve(),Path(t))
