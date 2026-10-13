"""Regenerate V006 defaults from frozen actual frame states and prepared measurements."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
def read(p):return json.loads((R/p).read_text())
states=read('sources/ui-cue-states.json'); measured={r['id']:r['prepared'] for r in read('assets/sfx/prepared/measurements.json')};cues=[];boundaries=[]
def add(id,asset,t,dur,gain,kind,pan=0,trim=0,**extra):
 dur=min(dur,measured[asset]['duration']-trim)
 cues.append(dict(id=id,asset='assets/sfx/prepared/'+asset+'.wav',start_seconds=round(t,6),duration_seconds=round(dur,8),trim_start_seconds=trim,gain_db=gain,peak_normalize_dbfs=0,fade_in_seconds=min(.003,dur*.08),fade_out_seconds=min(.035,dur*.2),pan=pan,kind=kind,**extra))
for scene in states['scenes']:
 name=scene['name'];off=scene['startFrame']/25;rows=scene['states']
 for i,e in enumerate(scene['events']):
  if not e.get('selector') or e['release']<=e['press']:continue
  submit=e['id']=='send';f=round(e['press']*25)
  add(name+'-'+e['id'],'tap-a' if submit else 'selection',off+f/25,.065 if submit else .04,-27 if submit else -32,'press',scene=name,source_frame=f,event=e['id'],selector=e['selector'],role='submission' if submit else 'selection')
 changes=[r['frame'] for p,r in zip(rows,rows[1:]) if len(r.get('typed',''))>len(p.get('typed',''))]
 boundaries.append(dict(scene=name,first_frame=min(changes),last_frame=max(changes),global_start=off+min(changes)/25,global_end=off+(max(changes)+1)/25))
 last=-100;hit=0
 for f in changes:
  if f-last<[4,5,6][hit%3]:continue
  add(f'{name}-key-{f}',['tap-a','tap-b','tap-c'][hit%3],off+f/25,.03,[-35,-33.5,-34.5][hit%3],'typing',pan=[-.04,0,.04][hit%3],scene=name,source_frame=f,field='prompt');last=f;hit+=1
 if name=='text':
  maximum=max(r['words'] for r in rows);f=next(r['frame'] for r in rows if r['words']==maximum)
 else:f=next(r['frame'] for r in rows if r['completed'] and r.get('boardOpacity',1)>0)
 emphasis=['text','images','music','video'].index(name)
 add(name+'-complete','bloom',off+f/25,.22+emphasis*.025,-31+emphasis,'result',trim=.14,scene=name,source_frame=f,note='Prepared bloom crest within one frame of result; escalating duration and gain.')
 add(name+'-confirm','tap-a',off+f/25,.05,-32+emphasis,'result',scene=name,source_frame=f)
 if name in ['music','video']:
  timing=read(f'ui/{name}/timing.json')
  for key in ['durationType','durationTyped']:
   f=round(timing[key]*25);add(name+'-'+key,'tap-b',off+f/25,.02,-34,'typing',scene=name,source_frame=f,field='duration')
  if name=='music':
   f=round(timing['paste']*25);add('music-lyrics-paste','tap-a',off+f/25,.04,-31,'paste',scene=name,source_frame=f,field='lyrics')
add('opening-bloom','bloom',0,.70,-27,'opening')
add('opening-warmth','warm-texture',0,.70,-36,'opening')
add('laptop-contact','laptop',3.84,1.06,-29,'physical',note='Initial lid lift visible between 3.80 and 4.00 seconds; one contact only across the cut.')
add('enter-ui','expansion',9.44,.50,-33,'expansion')
add('fullscreen-air','fullscreen',96.68,.28,-33,'expansion',scene='video',source_frame=393,note='Original source 0.12-0.40; prepared crest at 96.755 before speech at 96.8.')
add('bird-emergence','emergence',99.28,.57,-28,'flight',note='Prepared onset within one frame of appearance; speech-ducked.')
for id,t,trim,dur,gain,pan in [('bird-turn-right',100.28,.03,.22,-31,.16),('bird-window-turn',101.28,.22,.23,-32,-.12),('bird-return',102.96,.42,.22,-34,.08),('native-flight',105.28,.02,.20,-33,-.10),('native-wing',105.68,.23,.18,-35,.03)]:
 add(id,'flutter',t,dur,gain,'flight',pan=pan,trim=trim,note='Separated burst on inspected wing/turn gesture; no looping.')
add('bird-close-flyby','flyby',104.40-measured['flyby']['crest_seconds'],1.16,-23,'flight',pan=.10,alignment='energy_crest',target_seconds=104.40,note='Crest remeasured after 150Hz high-pass; source start is not the sync anchor.')
add('native-arrival','tap-a',106.32,.06,-35,'settle')
add('ending-bloom','bloom',108.84,.70,-28,'ending')
add('ending-warmth','warm-texture',108.84,.70,-37,'ending')
cues.sort(key=lambda c:c['start_seconds'])
m=dict(version='portrait-v006',sample_rate=48000,channels=2,samples=5276160,fps=25,base_master='sources/audio-v002-master.wav',narration_sidechain='sources/narration-sidechain.wav',picture_reference='sources/portrait-v005-picture-reference.mp4',output='openjm-assembly-v003-audio-v002-portrait-v006.mp4',duck=dict(db=9,attack_seconds=.05,release_seconds=.045,source='sources/audio-v002-mix-settings.json'),true_peak_ceiling_db=-1.5,protected_song=[76.96,79.96],protected_silence=[79.96,80.96],effects_end_by=109.76,typing_boundaries=boundaries,variation='Fixed three tap variations; 4/5/6-frame prompt spacing on actual entry frames; no RNG in cues or retiming.',cues=cues)
(R/'sfx-cues.json').write_text(json.dumps(m,indent=2)+'\n');print('Wrote',len(cues),'V006 cues')
