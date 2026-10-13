"""Deterministic editable derivatives. Originals are never modified.
Settings are starting treatments, not a substitute for comparative listening.
"""
from pathlib import Path
import json, hashlib, subprocess, importlib.util
import numpy as np

R=Path(__file__).resolve().parents[1]; SR=48000
spec=importlib.util.spec_from_file_location('mix',R/'scripts/mix-sfx.py')
mix=importlib.util.module_from_spec(spec);spec.loader.exec_module(mix)

def stats(x):
    energy=np.mean(x[:len(x)//480*480].reshape(-1,480,2)**2,axis=(1,2)) if len(x)>=480 else np.array([np.mean(x*x)])
    a=np.max(np.abs(x),axis=1); spec=np.abs(np.fft.rfft(x,axis=0))**2; f=np.fft.rfftfreq(len(x),1/SR)
    return dict(samples=len(x),duration=len(x)/SR,peak_dbfs=float(20*np.log10(max(a.max(),1e-15))),
        peak_seconds=int(a.argmax())/SR,crest_seconds=(int(energy.argmax())*480+min(240,len(x)//2))/SR,
        onset_seconds=int(np.flatnonzero(a>a.max()*.03)[0])/SR,
        energy_in_loudest_10ms=float(energy.max()/energy.sum()),
        energy_below_120hz=float(spec[f<120].sum()/spec.sum()),energy_above_4khz=float(spec[f>4000].sum()/spec.sum()))

def main():
    d=R/'assets/sfx/prepared';d.mkdir(parents=True,exist_ok=True)
    settings=json.loads((R/'sfx-preparation.json').read_text());report=[]
    for row in settings['derivatives']:
        raw=mix.decode(R/row['source'])
        x=mix.decode(R/row['source'],row['filters'])
        x=x[round(row['trim'][0]*SR):round(row['trim'][1]*SR)].copy()
        if row.get('transient_reduction_db'):
            # Linked detector: attenuate the strongest 10ms energy region with
            # smooth 12ms approach and 35ms recovery, preserving other detail.
            b=np.mean(x[:len(x)//480*480].reshape(-1,480,2)**2,axis=(1,2));k=int(b.argmax())*480
            lo=max(0,k-576);hi=min(len(x),k+480+1680);depth=10**(-row['transient_reduction_db']/20)
            env=np.interp(np.arange(len(x)),[0,lo,k,k+480,hi,len(x)-1],[1,1,depth,depth,1,1]);x*=env[:,None]
        fi=round(row['fade_in']*SR);fo=round(row['fade_out']*SR)
        if fi:x[:fi]*=np.linspace(0,1,fi)[:,None]
        if fo:x[-fo:]*=np.linspace(1,0,fo)[:,None]
        x*=10**(-3/20)/max(np.abs(x).max(),1e-12)
        path=R/row['output'];mix.write(path,x)
        report.append(dict(id=row['id'],path=row['output'],source=row['source'],raw=stats(raw),prepared=stats(mix.decode(path))))
    # An original non-tonal low-mid texture; no provider or external sound used.
    n=round(.70*SR);rng=np.random.Generator(np.random.PCG64(6006));noise=rng.standard_normal((n,1));noise=np.repeat(noise,2,axis=1)
    filtered=mix.run(['ffmpeg','-v','error','-f','f64le','-ar',SR,'-ac',2,'-i','pipe:0','-af','highpass=f=180,lowpass=f=650','-f','f64le','-'],noise.astype('<f8').tobytes()).stdout
    x=np.frombuffer(filtered,dtype='<f8').reshape(-1,2).copy();x*=np.sin(np.linspace(0,np.pi,len(x)))[:,None]**2;x*=10**(-3/20)/np.abs(x).max()
    mix.write(d/'warm-texture.wav',x)
    report.append(dict(id='warm-texture',path='assets/sfx/prepared/warm-texture.wav',source='Original seeded filtered noise; PCG64 seed 6006',prepared=stats(x)))
    (d/'measurements.json').write_text(json.dumps(report,indent=2)+'\n')
    provenance=[]
    for p in sorted((R/'assets/sfx/originals').glob('*.mp3')):
        provenance.append(dict(path=p.relative_to(R).as_posix(),sha256=mix.sha(p),origin='User-supplied ElevenLabs recording',original_filename=p.name,provider_settings='Not supplied; no generation performed in this revision',use='Private production source; not a standalone sound library'))
    for p in sorted((R/'assets/sfx/cc0').glob('*.ogg')):
        provenance.append(dict(path=p.relative_to(R).as_posix(),sha256=mix.sha(p),origin='Kenney Interface Sounds 1.0',license='CC0',license_file='assets/sfx/cc0/License.txt',source_url='https://kenney.nl/assets/interface-sounds',verified_date='2026-10-12'))
    (R/'assets/sfx/provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
    print('Prepared',len(report),'derivatives; retained',len(provenance),'unchanged originals')

if __name__=='__main__':main()
