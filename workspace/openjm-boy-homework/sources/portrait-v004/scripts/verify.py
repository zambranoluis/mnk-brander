"""Metadata, complete decoding, packet identity, manifest and copy preservation."""
from pathlib import Path
import subprocess,json,hashlib,argparse
R=Path(__file__).resolve().parents[1]
def probe(p,args):return json.loads(subprocess.check_output(['ffprobe','-v','error',*args,'-of','json',str(p)]))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main(e,check_originals=False):
 e.mkdir(parents=True,exist_ok=True);m=json.loads((R/'assembly.json').read_text());p=R/'openjm-assembly-v003-audio-v002-portrait-v004.mp4'
 info=probe(p,['-show_streams','-show_format','-count_frames']);v=next(s for s in info['streams'] if s['codec_type']=='video')
 assert (v['width'],v['height'],v['avg_frame_rate'],int(v['nb_read_frames']))==(1080,1920,'25/1',2748)
 assert abs(float(v['duration'])-109.92)<1e-6
 packets=['-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash,side_data_list']
 a=probe(R/m['audio']['source'],packets)['packets'];b=probe(p,packets)['packets'];assert a==b,'AAC packets or timestamps changed'
 decode=subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],capture_output=True,text=True);assert decode.returncode==0 and not decode.stderr,decode.stderr
 originals=[]
 workspace=R.parents[3]
 for f in json.loads((R/'provenance.json').read_text()) if check_originals else []:
  source=workspace/f['source'];originals.append({'source':f['source'],'unchanged':source.exists() and sha(source)==f['sha256']})
 assert all(x['unchanged'] for x in originals)
 originalManifest=json.loads((R/'sources/assembly-v003.json').read_text())
 for current,old in zip(m['slots'],originalManifest['slots']):
  for k in ['id','startFrame','durationFrames','sourceInFrame']:assert current[k]==old[k]
 assert m['transitions']==originalManifest['transitions']
 result={'metadata':info,'audioPacketCount':len(a),'audioPacketsAndTimingIdentical':True,'decode':'passed','manifestTimingUnchanged':True,'preservedSources':originals,'sha256':sha(p)}
 (e/'verification.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k not in ['metadata','preservedSources']}));print('Preserved',len(originals),'originals')
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--evidence',required=True);a.add_argument('--check-originals',action='store_true');args=a.parse_args();main(Path(args.evidence).resolve(),args.check_originals)
