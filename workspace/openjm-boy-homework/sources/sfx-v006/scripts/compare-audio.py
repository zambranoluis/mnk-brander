"""Write level-matched audition pairs and objective comparisons, not listening approval."""
from pathlib import Path
import argparse, importlib.util, json
import numpy as np
R=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('mix',R/'scripts/mix-sfx.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--evidence',required=True);a=ap.parse_args();e=Path(a.evidence).resolve();e.mkdir(parents=True,exist_ok=True)
    rows=[];html=['<!doctype html><meta charset="utf-8"><title>V006 private audio comparison</title><style>body{font:18px system-ui;max-width:900px;margin:40px auto;background:#121614;color:#edf2ee}audio{width:95%}section{margin:30px 0}a{color:#9cebc3}</style><h1>Portrait V006 — private listening comparison</h1><p>Level-matched candidates. Measurements are not listening approval. Review on headphones and speakers. Never play A and B simultaneously.</p>']
    settings=json.loads((R/'sfx-preparation.json').read_text())
    for row in settings['derivatives']:
        if row['id'] not in ['laptop','bloom','expansion','emergence','flutter','flyby']:continue
        raw=m.decode(R/row['source']);prepared=m.decode(R/row['output']);pair=[]
        for label,x in [('raw',raw),('prepared',prepared)]:
            rms=float(np.sqrt(np.mean(x*x)));gain=10**(-24/20)/rms;pair.append((label,x*gain,gain))
        # Shared extra attenuation avoids clipping while retaining matched RMS.
        ceiling=10**(-3/20);scale=min(1,ceiling/max(np.abs(x).max() for _,x,_ in pair))
        html.append('<section><h2>'+row['id']+'</h2>')
        for label,x,gain in pair:
            name=row['id']+'-'+label+'-matched.wav';m.write(e/name,x*scale)
            rows.append(dict(id=row['id'],variant=label,gain_db=float(20*np.log10(gain*scale)),rms_dbfs=float(20*np.log10(np.sqrt(np.mean((x*scale)**2)))),file=name))
            html.append(f'<p>{label}</p><audio controls preload="none" src="{name}"></audio>')
        html.append('</section>')
    old=R/'sources/portrait-v005-picture-reference.mp4';new=R/'openjm-assembly-v003-audio-v002-portrait-v006.mp4'
    loud=[m.measure(p) for p in [old,new]];target=min(float(z['input_i']) for z in loud)
    html.append('<section><h2>Complete soundtrack — matched integrated loudness</h2>')
    for label,p,z in zip(['V005','V006'],[old,new],loud):
        gain=target-float(z['input_i']);name=label+'-matched.wav';x=m.decode(p)[:5276160];m.write(e/name,x*10**(gain/20))
        rows.append(dict(id=label,file=name,gain_db=gain,original_lufs=float(z['input_i']),matched_lufs=target))
        html.append(f'<p>{label}</p><audio controls preload="none" src="{name}"></audio>')
    html.append('</section><p>Check laptop contact, sparkle brightness, bird rumble, flyby strength, speech intelligibility and exact pause. Source and processed lengths differ where trims were authorized.</p><script>document.addEventListener("play",e=>{document.querySelectorAll("audio").forEach(a=>{if(a!==e.target)a.pause()})},true)</script>')
    prepared=json.loads((R/'assets/sfx/prepared/measurements.json').read_text())
    report=dict(status='Objective comparison and level-matched files prepared. No subjective audition performed.',full_mix_matched_lufs=target,pairs=rows,source_comparison=prepared)
    (e/'comparison.json').write_text(json.dumps(report,indent=2)+'\n');(e/'listen.html').write_text('\n'.join(html),encoding='utf8')
    print('Wrote six RMS-matched raw/prepared pairs and integrated-loudness-matched V005/V006 soundtracks.')
if __name__=='__main__':main()
