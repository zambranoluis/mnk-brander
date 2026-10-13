"""Assemble portrait picture, then stream-copy the existing AAC without retiming."""
from pathlib import Path
import subprocess,json
from render_ffmpeg import render
R=Path(__file__).resolve().parents[1];m=json.loads((R/'assembly.json').read_text());out=R/'renders';out.mkdir(exist_ok=True)
picture=out/'portrait-picture.mp4'
render(picture,R/'local/assembly-parts')
final=R/'openjm-assembly-v003-audio-v002-portrait-v004.mp4'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(picture),'-i',str(R/m['audio']['source']),'-map','0:v:0','-map','1:a:0','-c','copy','-movflags','+faststart',str(final)],check=True)
print(final)
