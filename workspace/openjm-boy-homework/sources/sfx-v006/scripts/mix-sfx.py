"""Rebuild the SFX stem, lossless mix and stream-copy mux from local inputs."""
from pathlib import Path
import argparse,hashlib,json,subprocess,re,runpy
import numpy as np
R=Path(__file__).resolve().parents[1]; SR=48000; N=5276160
def run(args,data=None):
 p=subprocess.run([str(x) for x in args],input=data,capture_output=True)
 if p.returncode:raise RuntimeError(p.stderr.decode(errors='replace'))
 return p
def decode(path,filters=None):
 args=['ffmpeg','-v','error','-i',path]
 if filters:args+=['-af',filters]
 return np.frombuffer(run(args+['-ar',SR,'-ac',2,'-f','f32le','-']).stdout,dtype='<f4').reshape(-1,2).astype(np.float64)
def write(path,x):
 run(['ffmpeg','-v','error','-y','-f','f64le','-ar',SR,'-ac',2,'-i','pipe:0','-c:a','pcm_s24le','-map_metadata','-1','-fflags','+bitexact',path],x.astype('<f8').tobytes())
def measure(path):
 out=run(['ffmpeg','-hide_banner','-i',path,'-af','loudnorm=I=-16:TP=-1.5:LRA=20:print_format=json','-f','null','-']).stderr.decode()
 return json.loads(re.search(r'\{\s*"input_i".*?\}',out,re.S).group())
def sha(p):return hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--evidence',default='local/sfx-build');a=ap.parse_args();E=Path(a.evidence).resolve();E.mkdir(parents=True,exist_ok=True)
 runpy.run_path(str(R/'scripts/prepare-sfx.py'),run_name='__main__')
 m=json.loads((R/'sfx-cues.json').read_text());base=decode(R/m['base_master']);assert base.shape==(N,2)
 sfx=np.zeros_like(base);cache={};audit=[]
 for c in m['cues']:
  key=c['asset']
  if key not in cache:cache[key]=decode(R/c['asset'])
  start=round(c['start_seconds']*SR);n=round(c['duration_seconds']*SR);trim=round(c['trim_start_seconds']*SR)
  x=cache[key][trim:trim+n].copy();x=np.pad(x,((0,n-len(x)),(0,0)))
  peak=np.abs(x).max();assert peak>0
  x*=10**((c['peak_normalize_dbfs']+c['gain_db'])/20)/peak
  fi=round(c['fade_in_seconds']*SR);fo=round(c['fade_out_seconds']*SR)
  x[:fi]*=np.linspace(0,1,fi)[:,None];x[-fo:]*=np.linspace(1,0,fo)[:,None]
  pan=c['pan'];x[:,0]*=min(1,1-pan);x[:,1]*=min(1,1+pan)
  assert start>=0 and start+n<=N
  transient=int(np.argmax(np.max(np.abs(x),axis=1)))
  energy=np.mean(x[:n//480*480].reshape(-1,480,2)**2,axis=(1,2)) if n>=480 else np.array([np.mean(x*x)])
  crest=(int(energy.argmax())*480+min(240,n//2))/SR
  onset=int(np.flatnonzero(np.max(np.abs(x),axis=1)>np.abs(x).max()*.03)[0])/SR
  audit.append(dict(id=c['id'],start_sample=start,end_sample=start+n,transient_seconds=(start+transient)/SR,action_seconds=c['start_seconds'],transient_offset_seconds=transient/SR,energy_crest_seconds=start/SR+crest,onset_seconds=start/SR+onset,kind=c['kind']))
  sfx[start:start+n]+=x
 # Only the added effects are ducked; original master is never renormalized.
 duck=np.ones(N);settings=json.loads((R/m['duck']['source']).read_text());depth=10**(-m['duck']['db']/20)
 for cue in settings['cues']:
  st=cue['start_sample'];en=round(cue['end']*SR);attack=round(m['duck']['attack_seconds']*SR);release=round(m['duck']['release_seconds']*SR)
  lo=max(0,st-attack);hi=min(N,en+release);env=np.ones(hi-lo)
  env[:st-lo]=np.linspace(1,depth,st-lo);env[st-lo:en-lo]=depth;env[en-lo:]=np.linspace(depth,1,hi-en)
  duck[lo:hi]=np.minimum(duck[lo:hi],env)
 sfx*=duck[:,None]
 gap=[round(t*SR) for t in m['protected_silence']]
 assert not np.any(sfx[gap[0]:gap[1]]),'An effect crosses protected silence'
 assert not np.any(base[gap[0]:gap[1]]),'Base is not silent'
 mix=base+sfx
 (R/'audio').mkdir(exist_ok=True)
 write(R/'audio/sfx-stem.wav',sfx);write(R/'audio/portrait-v006-mix.wav',mix)
 measured=measure(R/'audio/portrait-v006-mix.wav');before_limiting=measured.copy();limiting=False;limiter_stats={}
 if float(measured['input_tp'])>m['true_peak_ceiling_db']:
  # Measure at 4x, but apply a linked gain envelope directly to the original
  # 48 kHz samples. This leaves every sample outside limited peaks untouched.
  raw=run(['ffmpeg','-v','error','-i',R/'audio/portrait-v006-mix.wav','-ar',192000,'-ac',2,'-f','f32le','-']).stdout
  over=np.frombuffer(raw,dtype='<f4').reshape(-1,2)
  peak=np.max(np.abs(over[:N*4].reshape(-1,192,2)),axis=(1,2))
  ceiling=10**(-1.55/20);desired=np.minimum(1,ceiling/np.maximum(peak,1e-12))
  env=desired.copy()
  for shift in range(1,6):env[:-shift]=np.minimum(env[:-shift],desired[shift:])
  for shift in range(1,51):env[shift:]=np.minimum(env[shift:],1-(1-desired[:-shift])*(1-shift/51))
  envelope=np.interp(np.arange(N),np.arange(len(env))*48,env)
  limited=mix*envelope[:,None];limited[gap[0]:gap[1]]=0
  limiter_stats=dict(max_gain_reduction_db=float(-20*np.log10(env.min())),affected_samples=int(np.sum(envelope<1)),song_gain_reduction_db=float(-20*np.log10(envelope[round(76.96*SR):round(79.96*SR)].min())))
  write(R/'audio/portrait-v006-mix.wav',limited);measured=measure(R/'audio/portrait-v006-mix.wav');limiting=True
 assert float(measured['input_tp'])<=m['true_peak_ceiling_db'],measured
 run(['ffmpeg','-v','error','-y','-i',R/m['picture_reference'],'-i',R/'audio/portrait-v006-mix.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-ar',SR,'-ac',2,'-map_metadata','-1','-movflags','+faststart',R/m['output']])
 run(['ffmpeg','-v','error','-y','-i',R/m['output'],'-map','0:a:0','-c:a','copy',R/'audio/portrait-v006-preview.m4a'])
 aac=measure(R/m['output']);assert float(aac['input_tp'])<=-1.5,aac
 report=dict(cues=len(audit),samples=N,sample_rate=SR,channels=2,before_limiting=before_limiting,wav=measured,aac=aac,limiter_applied=limiting,limiter=limiter_stats,base_gain_db=0,duck_db=m['duck']['db'],cue_audit=audit,hashes={p:sha(R/p) for p in ['audio/sfx-stem.wav','audio/portrait-v006-mix.wav',m['output']]},listening='Pending human headphone and speaker review; measurements are not listening.')
 (E/'mix-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['cue_audit','hashes']}))
if __name__=='__main__':main()
