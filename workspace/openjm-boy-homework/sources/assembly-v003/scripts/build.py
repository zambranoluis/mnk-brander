"""Compile assembly.json to local, editable HyperFrames compositions."""
from pathlib import Path
import json, html

ROOT = Path(__file__).resolve().parents[1]

def build():
 m=json.loads((ROOT/'assembly.json').read_text(encoding='utf-8'))
 fps=m['fps']; slots=m['slots']; transitions=m['transitions']; joins={t['incomingSlot']:t for t in transitions}
 assert fps==25
 assert slots[0]['startFrame']==0
 for prev,s in zip(slots,slots[1:]):
  overlap=joins[s['id']]['durationFrames']
  assert s['startFrame']==prev['startFrame']+prev['durationFrames']-overlap, 'Gap or unplanned overlap'
 assert max(s['startFrame']+s['durationFrames'] for s in slots)==m['totalFrames']
 for t in transitions:
  assert t['startFrame']==next(s['startFrame'] for s in slots if s['id']==t['incomingSlot'])
 assert next(s['durationFrames'] for s in slots if s['id']=='outro-composite')==151
 assert m['outroContract']['presentationOffsetFrames']==75
 assert m['outroContract']['presentationOffsetSeconds']==3.0
 nodes=[]
 for s in slots:
  id=s['id']; dur=s['durationFrames']/fps
  media=(ROOT/s['media']).resolve()
  assert media.is_relative_to(ROOT.resolve()) and media.is_file(), s['media']
  label=''
  if id=='outro-composite' and m['outroContract']['status']=='pending' and m['outroContract'].get('showPlaceholderLabel', True):
   label=f'<div id="outro-placeholder-label" class="placeholder" data-layout-allow-overlap="" aria-label="Replacement status">{html.escape(m["outroContract"]["label"])}</div>'
  scene=f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8"></head><body><template>
<style>
@font-face {{font-family:AssemblyLabel;src:url('../vendor/label.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block;}}
#root {{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;}}
video {{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;}}
.placeholder {{position:absolute;left:48px;top:48px;padding:12px 16px;color:#fff;background:#101519;font-family:AssemblyLabel,sans-serif;font-size:24px;line-height:30px;white-space:nowrap;border-radius:4px;}}
</style>
<div id="root" data-composition-id="{id}" data-width="1920" data-height="1080" data-duration="{dur}">
<video id="{id}-media" class="clip" src="../{html.escape(s['media'])}" muted playsinline preload="auto" data-start="0" data-duration="{dur}" data-media-start="{s['sourceInFrame']/fps}" data-track-index="0"></video>
{label}
</div>
<script>
(() => {{
 const clock = {{time:0}};
 const timeline = gsap.timeline({{paused:true}});
 timeline.to(clock,{{time:{dur},duration:{dur},ease:'none'}},0);
 window.__timelines['{id}']=timeline;
}})();
</script></template></body></html>
'''
  (ROOT/'compositions'/f'{id}.html').write_text(scene,encoding='utf-8')
  nodes.append(f'<div id="{id}" class="clip" data-composition-id="{id}" data-composition-src="compositions/{id}.html" data-start="{s["startFrame"]/fps}" data-duration="{dur}" data-track-index="{s["track"]}" data-width="1920" data-height="1080" style="z-index:{slots.index(s)+1}"></div>')
 index='''<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OpenJM assembly V003 - clean provisional final</title>
<script src="vendor/gsap.min.js"></script>
<style>
@font-face {font-family:AssemblyLabel;src:url('vendor/label.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block;}
html,body {margin:0;width:100%;height:100%;overflow:hidden;background:#000;}
#root {position:relative;width:100%;height:100%;overflow:hidden;}
.clip {position:absolute;inset:0;width:100%;height:100%;}
</style></head><body>
<div id="root" data-composition-id="assembly-v003" data-width="1920" data-height="1080" data-duration="119.44">
'''+ '\n'.join(nodes)+'''
</div><script>
const timeline=gsap.timeline({paused:true});
// Incoming opaque picture covers the outgoing picture and its label together.
// Keeping the outgoing layer opaque avoids a dark midpoint in the dissolve.
TRANSITION_TWEENS
window.__timelines['assembly-v003']=timeline;
</script></body></html>
'''
 index=index.replace('data-duration="119.44"',f'data-duration="{m["totalFrames"]/fps}"')
 tweens=[]
 for t in transitions:
  if t['type']=='linear-dissolve':
   tweens.append("timeline.fromTo('#%s',{opacity:0},{opacity:1,duration:%s,ease:'none'},%s);"%(t['incomingSlot'],t['durationFrames']/fps,t['startFrame']/fps))
 index=index.replace('TRANSITION_TWEENS','\n'.join(tweens))
 (ROOT/'index.html').write_text(index,encoding='utf-8')
 print(f'Built {len(slots)} shots: {m["totalFrames"]} frames / {m["totalFrames"]/fps} seconds; outro status:',m['outroContract']['status'])

if __name__=='__main__':build()
